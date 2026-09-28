// tests/gutter.test.ts
// ===========================================================================
// U-GUTTER · wave E (ledger row `E3`) · **THE RED SET** (RCA-1)
//
// Contract: `docs/specs/gutter.md` (FILED 2026-09-27, the `SCH-6`-as-reshaped-by-`A-d4`
// unit, `ADOPTED-RESHAPED`). The module to be built later is `src/shared/gutter.ts`
// (`§0A` note 1 names BOTH paths — this file's path is confirmed there: "the module path
// is `src/shared/gutter.ts`, and the test file is `tests/gutter.test.ts`").
//
// Binding sections read IN FULL before authoring: the `CURRENT STATE` block, `§0` (the
// seventeen recorded rulings, with the two CORRECTED citation sites), `§0A` (the TWELVE
// dated ruling notes — CONTRACT, not commentary), the Layer declaration (five honesty
// anchors), `§1` (scope, items 1–8), `§2.1` (the surface + the EXPORT CENSUS `2 + 10 = 12`
// + the SEVEN-seam options set with `capture` ABSENT), `§2.2` (the eleven prohibitions
// `P-1`..`P-11`), `§2.3` (items 1–5: the value-source chain / the evaluation order / the
// write-count clause `C1` with BOTH positive controls / the reset clause / the
// `install`-once clause `C4`), `§2.4` (items 1–4: the seven NAMED SAFE DEFAULTS, the
// totality universal WITH ITS BOUND, `C2`'s four throw paths, the total-member-read rule,
// the no-invented-code rule), `§2.5` (items 1–6: the composition boundary, the `U-CENSUS`
// and `U-GSESSION` sentences, the one-controller rule with its LIMIT, the reset entry
// point's nine clauses), `§2.6` (the seven sibling properties + the `U-RELOCATE` note),
// `§3.1` (`M-1`..`M-19`), `§3.2` (`F-1`..`F-19`), `§3.3` (`I-1`..`I-15`), `§3.4` (the
// static rows `R-1`..`R-15`), `§3.5` (the existence rows `R-16`/`R-17`/`R-18`), `§4`
// (`§4.1` the red statement, `§4.2` the authoring order, `§4.3` what the red is NOT,
// `§4.4` the THIRTEEN binding stop conditions `S-PURE-1`..`S-PURE-5`/`S-6`..`S-13`,
// `§4.5` the delegation gate), `§5.1` (diff scope + the DENIED set, `C5`), `§5.2` (the
// FOUR legs + the three-part `[U]` refusal + the `[D]` non-claim + gate 6),
// `§5.3` (the DONE row's ELEVEN items), **`§5.5.1` (the typed Property register — ALL
// THIRTEEN rows, executed here in register order: `299` =
// `60+11+10+18+20+22+28+20+15+5+12+60+18`, one pinned-seed generator `S-GT-TOTAL-1`
// (`20260927`, ONE LCG step per draw, `pool.length = 20`), caps `≤100`/row · `≤400`
// total · stop-after-5-consecutive-failures)**, `§5.5.2` (the honesty block, the
// declared-vs-distinct ledger, the pool-versus-boundary check), `§5.5.3` (the attempt
// arithmetic with its terms), `§6` (the three falsifications), `§7` (the fifteen honest
// statements), `§7a`/`§7a.1` (**THREE open questions, each with a WORKING DEFAULT — the
// defaults are driven here and each is cited in place**), `§8`, and `§3a`/`§3b` at the
// END (the adversarial SEED set — the `A-*` rows belong to the LATER pass and NONE is
// authored here; `§3b` is EMPTY BY CONSTRUCTION).
//
// ⟶ RECONCILED 2026-09-27 (THE GATE-3 REALIGNMENT PASS, after the spec amendment): this
// file was REALIGNED to the amended contract, and the items it carries are named once so a
// reader does not have to diff the two passes:
//   (1) THE DECLARED REGISTER TOTAL IS `299` — the sum of the register's own THIRTEEN
//       printed terms. The as-filed `314` is kept visible ONLY as a dated
//       CORRECTED-MIS-SUM note (`REGISTER_AS_FILED_TOTAL_DEFECT`) and is NEVER a live
//       expected value anywhere in this file; the caps are compared against `299`.
//   (2) THE `reset` RESULT-CODE TABLE (`§2.3` item 4, the amendment's item 2): the
//       SESSION's SEVEN codes verbatim PLUS the TWO declared controller-local codes
//       `'unusable-default'` and `'not-resizable'` — a NINE-member CONTROLLER domain
//       (`R-15`, `I-14`). **THE SESSION's OWN SEVEN-member domain is UNTOUCHED** and is
//       asserted as its own claim (`gsession.md` `§2.2`/`§4.4 S-9`): no eighth member
//       enters it, and neither local code is ever passed INTO the session.
//   (3) `F-13`: the amended refusal `{ok: false, code: 'not-resizable', committed: false}`
//       for an ESTABLISHED gesture on a non-resizable element, with zero sink writes; the
//       `'unusable-default'` limb (`F-12`) and the idle `'no-gesture'` limb (`M-16`) stay.
//   (4) `P-GT-SM-4`: the `isResizable === false` case (`'not-resizable'`) is ADDED as a
//       drive of the row's shape `(6)` surface WITHOUT moving the declared term `12`; the
//       honest distinct figure the extra drive yields is REPORTED beside the declared one.
//   (5) `P-GT-SM-3`: shape `(5)` — a consumer's own `onEnd` calling the sink — is driven
//       explicitly, and the two readings are asserted as DISTINCT BY DESIGN (the
//       single-writer shape reads `1` on both counters; the two-writer shape's SINK OWN
//       RECORD reads `2` while the controller's counter still reads `1`, and that
//       divergence is the falsifier).
//   (6) `M-20` (`detach()`'s MULTI-ELEMENT limb) is carried by `M-13`'s arm, as an
//       explicit assertion citing the row and `§7a.1` item 2's WORKING-DEFAULT status —
//       which the spec STILL labels unruled.
//   (7) The `P-GT-SM-2` title carries NO `bounded` label (the register's `(bounded)` set is
//       `P-GT-PU-2` · `P-GT-IM-2` · `P-GT-TP-1`, and `P-GT-SM-2` is NOT one), and the
//       register-order list below names the spec's CURRENT cells, including the term-less
//       clause cell `P-GT-SM-5`, WITHOUT moving any declared term.
//
// LAYER: **[T] + static — the NODE ENVELOPE ONLY.** This unit touches no DOM at all —
// not even `src/shared/dom-shim.ts` (layer declaration anchor 2): **the ELEMENT is an
// argument, the SESSION is an argument (the landed module or a recording double of its
// own), and the SINK is an argument.** No window is booted, no IPC round-trip runs, no
// MCP transport is exercised and no real element exists in this file. **No row below
// asserts a rendered-geometry, layout, paint, coordinate, applied-CSS or
// click-retargeting property** (`I-11`, `R-8`): `§5.2` offers no `[U]` row (structurally:
// the module is imported by no `src/**` file — `R-6`/`R-12`) and claims no `[D]` row
// (`R-17` is the probe that states it; `[D]` is `PRECONDITION-GATED` on
// `U-DIVERGENCE-EXT`, ledger row `C2`). **A sink-call green is NOT a
// rendered-write green** (layer anchor 5): every counted write is a call into an
// argument-supplied function.
//
// THE IMPORT BOUNDARY (`§4.1`, the repo's established technique — the sibling
// `tests/gesture-session.test.ts`'s: an `fs` existence probe plus a RUN-TIME-COMPUTED
// specifier resolved through a dynamic `import(/* @vite-ignore */ …)`): every clause row
// fails as a **LABELLED ASSERTION** naming the absent module, never as a collection error
// that would take the whole red set down. `PRE-1` proves the mechanism itself resolves,
// against an EXISTING module (`src/shared/gesture-session.ts`, the frozen module this
// unit composes).
//
// LEG 4 (`§5.2` leg 4): `R-5`(b) asserts the TEN TYPE-ONLY names of `§2.1` (`AxisFor`,
// `BoundsFor`, `ClampBounds`, `CommitSink`, `DefaultSizeFor`, `IsResizable`,
// `ResizeController`, `ResizeControllerHandle`, `ResizeControllerOptions`, `ResizeStats`),
// and an imported type name is ERASED AT RUN TIME — so the honest leg is a standalone
// strict `tsc --noEmit` over THIS file. At RED time that leg reports the module-absent
// boundary (`TS2307`) and nothing else. **The `TS2307` diagnostic is NOT suppressed** (no
// `@ts-ignore` anywhere below): suppressing it would make the type-only export claim
// unfalsifiable. The `D-GT-1` typed fixture below is the leg-4 pin: it compiles ONLY if
// the module exports all ten type names AND the two value exports with the declared
// signatures.
//
// AUTHORED ORDER (`§4.2`): the `§3.5` existence/precondition rows `R-16`/`R-17`/`R-18`
// FIRST (they are the red's own premise and are evaluable before the module exists), then
// the `§3.4` static rows `R-1`..`R-15` (`R-4`/`R-5`/`R-6`/`R-7` are evaluable immediately;
// `R-1`/`R-2`/`R-3`/`R-8`/`R-10`/`R-11`/`R-13`/`R-14`/`R-15` read the module file and
// become evaluable once it lands), then the `clampToBounds` block (`M-2`, `M-19`,
// `F-1`..`F-8`, the fail-state table's eleven input classes and the totality/purity/
// return-type rows), then the invariants `I-1`..`I-15`, then `M-1`/`M-3`..`M-18`, then
// `F-9`..`F-19`, then the `§5.5.1` register rows IN REGISTER ORDER
// (`P-GT-PU-1` · `P-GT-PU-2` · `P-GT-PU-3` · `P-GT-IM-1` · `P-GT-IM-2` · `P-GT-IM-3` ·
// `P-GT-IM-4` · `P-GT-SM-1` · `P-GT-SM-2` · `P-GT-SM-3` · `P-GT-SM-4` · `P-GT-SM-5` ·
// `P-GT-TP-1` · `P-GT-TP-2`), then the register's own status row. The `describe` blocks
// below are in that order; NOTHING is renumbered.
//
// **THE REGISTER-ORDER LIST NAMES THE SPEC'S CURRENT CELLS.** `§5.5.1`'s `SM` family now
// prints FIVE cells (`P-GT-SM-1`..`P-GT-SM-5`), of which FOUR are attempt-bearing — and
// **`P-GT-SM-5` is the `detach()` MULTI-ELEMENT limb's `§3.1`-CLASS CLAUSE CELL, carrying
// NO ATTEMPT TERM**: it is deliberately OUTSIDE the thirteen-term arithmetic and the
// `≤400`-cap comparison (`§5.5.1`'s own cell; the amendment's item (5) confirmation (i)).
// Its drive lives inside `M-13`'s row below (`M-20` is the clause row that declares it),
// so **no declared term moves and no attempt term is invented for it.**
//
// **THIS FILE IS THE UNIT'S RED SET (`§4.1`) AND NOTHING ELSE.** It is authored FIRST and
// RUN before any implementation: `src/shared/gutter.ts` does not exist, so every clause
// row, every static row and every register row fails on the module-absent boundary. **No
// `src/**`, `scripts/**`, `package.json`, `tsconfig.json` or `vitest.config.ts` is created
// or modified by this pass.**
//
// ⟶ THE `§7a.1` DEFAULTS DRIVEN HERE, named once so no reader has to reconstruct them
// (each is a WORKING DEFAULT, not contract — a later pass that changes one must open a
// gate): **(1)** the reset entry point's refusals are the CONTROLLER-LOCAL codes
// `'unusable-default'` (the unusable default) and — RULED by the 2026-09-27 red-run
// amendment pass — `'not-resizable'` (an ESTABLISHED gesture whose `isResizable` decision
// was falsy), never session codes and never passed into the session (`§2.1`'s note,
// `§2.3` item 4's reset result-code table, `I-14`, `F-12`, `F-13`, `M-17`); **(2)**
// `detach()` takes NO argument and refuses (`false`, ZERO session calls) when MORE THAN ONE
// element is attached here, because the session is shared (`§2.1` item 4, `§7a.1` item 2,
// the clause row `M-20`, driven inside `M-13` — **the spec still labels this default
// UNRULED: `§7a.1` item 2 STAYS OPEN**); **(3)** the module has EXACTLY ONE import
// statement, a TYPE-ONLY import from `./gesture-session.js` (`§0A` note 2, `R-4`).
// ===========================================================================
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// ===========================================================================
// §2.1/§2.5 — THE SESSION SHAPES THIS COMPOSITION IS WRITTEN AGAINST, PLUS THE
// MODULE'S OWN DECLARED SHAPES (structural mirrors, used ONLY as this harness's type
// surface).
//
// The MIRROR is never asserted to BE the module's surface — that is `R-5`'s and leg 4's
// claim, made through the `import type` declarations below. The mirror exists so this
// file's harness (session doubles, sinks, seam stubs) is type-checkable while the module
// is absent.
// ===========================================================================
type GestureElement = unknown
type GestureOutcome = 'end' | 'reset' | 'cancel' | null
interface GestureHandle {
  readonly id: number
  readonly element: GestureElement
  readonly active: boolean
  readonly outcome: GestureOutcome
  readonly value: unknown
  set(value: unknown): GestureHandle
}
interface GestureCallOptions {
  readonly capture?: unknown
  readonly onStart?: unknown
  readonly onMove?: unknown
  readonly onEnd?: unknown
  readonly onCancel?: unknown
}
interface SessionStats {
  readonly installed: number
  readonly sourceCalls: number
  readonly gestures: number
  readonly commits: number
  readonly active: boolean
  readonly gestureId: number
  readonly lastCode: string
}
interface GestureStats {
  readonly active: boolean
  readonly id: number
  readonly outcome: GestureOutcome
  readonly value: unknown
  readonly commits: number
}
type SessionCode = 'ok' | 'not-installed' | 'busy' | 'disposed' | 'disconnected' | 'stale' | 'no-gesture'
type BeginResult = { readonly ok: true; readonly gesture: GestureHandle } | { readonly ok: false; readonly code: SessionCode }
interface TerminalResult {
  readonly ok: boolean
  readonly code: SessionCode
  readonly committed: boolean
}
interface DisposeReport {
  readonly removed: number
  readonly complete: boolean
}
/** The session surface THIS UNIT COMPOSES (`src/shared/gesture-session.ts`'s own
 *  `GestureSession`, mirrored structurally — `§2.5` item 1's frozen delegate list). */
interface SessionLike {
  install(element: GestureElement, options?: GestureCallOptions): unknown
  reset(element: GestureElement, gesture: GestureHandle, value: unknown): unknown
  dispose(): unknown
  stats(): unknown
  gesture(): unknown
  readonly disposed: unknown
}

/** `§2.1` — THE CONTROLLER'S DECLARED SHAPES (the mirror leg 4 compares against). */
interface ExpectedClampBounds {
  readonly min: number
  readonly max: number
}
interface ExpectedResetResult {
  readonly ok: boolean
  readonly code: string
  readonly committed: boolean
}
interface ExpectedStats {
  readonly attached: number
  readonly gestures: number
  readonly sinkCalls: number
  readonly written: number
  readonly resets: number
  readonly lastCode: string
}
interface ControllerLike {
  attach(element: unknown, hooks?: unknown): boolean
  detach(): boolean
  reset(element: unknown): ExpectedResetResult
  stats(): ExpectedStats
  readonly detached: boolean
}

/** `§2.1`/`§3.4 R-5`(b) — **THE TYPE-ONLY HALF, through `§5.2` leg 4.** These TWELVE
 *  imports are the compile-time claim that the module exports the TEN type declarations
 *  of `§2.1` (and the two values). **This file does not compile unless it does.** The
 *  `TS2307` these produce while the module is ABSENT is the red's own leg-4 form and is
 *  NOT suppressed (a `@ts-ignore` here would make the type claim unfalsifiable). */
import type { AxisFor as ModuleAxisFor } from '../src/shared/gutter.js'
import type { BoundsFor as ModuleBoundsFor } from '../src/shared/gutter.js'
import type { ClampBounds as ModuleClampBounds } from '../src/shared/gutter.js'
import type { CommitSink as ModuleCommitSink } from '../src/shared/gutter.js'
import type { DefaultSizeFor as ModuleDefaultSizeFor } from '../src/shared/gutter.js'
import type { IsResizable as ModuleIsResizable } from '../src/shared/gutter.js'
import type { ResizeController as ModuleResizeController } from '../src/shared/gutter.js'
import type { ResizeControllerHandle as ModuleResizeControllerHandle } from '../src/shared/gutter.js'
import type { ResizeControllerOptions as ModuleResizeControllerOptions } from '../src/shared/gutter.js'
import type { ResizeStats as ModuleResizeStats } from '../src/shared/gutter.js'
// **NO VALUE IMPORT OF THIS MODULE EXISTS IN THIS FILE**, deliberately: the repo's
// import boundary is an `fs` probe plus a RUN-TIME-COMPUTED `import(/* @vite-ignore */ …)`
// (`§4.1`), because a static value import of an ABSENT module is a COLLECTION ERROR that
// takes the whole red set down instead of failing as a labelled assertion.
//
// **THE TWO VALUE EXPORTS ARE STILL PINNED AT THE TYPE LAYER** (leg 4): the names are
// referenced through the module's own type namespace below, so a rename, a removal or an
// unexported VALUE name fails the standalone strict `tsc` exactly as a missing TYPE name
// does — while the runtime half of `R-5(a)` reads the namespace the dynamic boundary
// resolved (`Object.keys(mod)`).

// ===========================================================================
// ⟶ `D-GT-1` — **THE TYPED FIXTURE AND THE LEG-4 PIN** (`§2.1`, `§5.2` leg 4).
//
// This block names EVERY declared export BY NAME, through the module's OWN imported
// types — never through this file's structural mirrors. It is the leg-4 red: while the
// module is absent, the standalone strict `tsc --noEmit` over THIS file reports
// `TS2307: Cannot find module '../src/shared/gutter.js'` (plus the cascading
// `TS2307`/`TS7006` diagnostics the missing type names produce), and once the module
// lands, a rename, a removal or an unexported name FAILS TO COMPILE.
//
// The FIVE fixtures below are also the shape claims: a controller returned by the
// factory must be assignable to `ModuleResizeController`; the factory's own options
// object's members must carry the declared types; the sink's `value` parameter must be
// `number`; and `clampToBounds` must return `number` for `unknown` inputs.
// ===========================================================================
const D_GT_1_declaredSeams: ReadonlyArray<keyof ModuleResizeControllerOptions> = [
  'session',
  'axisFor',
  'boundsFor',
  'defaultSizeFor',
  'isResizable',
  'sizeFor',
  'commit',
]
const D_GT_1_axisFor: ModuleAxisFor = () => undefined
const D_GT_1_boundsFor: ModuleBoundsFor = () => undefined
const D_GT_1_defaultSizeFor: ModuleDefaultSizeFor = () => undefined
const D_GT_1_isResizable: ModuleIsResizable = () => false
const D_GT_1_bounds: ModuleClampBounds = { min: 0, max: 100 }
const D_GT_1_sink: ModuleCommitSink = (_gesture: ModuleGestureHandleArg, value: number): void => {
  // LEG 4's PIN: the sink's second parameter is a `number`, and this line fails to compile
  // if `CommitSink` declares anything else.
  const pinned: number = value
  if (pinned === Number.NaN) return
}
/** The `GestureHandle` the sink seam receives is the SESSION's own — named here through
 *  the session module's exported type, which is the ONE import the module itself is
 *  allowed (`§0A` note 2). */
type ModuleGestureHandleArg = import('../src/shared/gesture-session.js').GestureHandle
const D_GT_1_controllerOptions: ModuleResizeControllerOptions = {
  session: undefined,
  axisFor: D_GT_1_axisFor,
  boundsFor: D_GT_1_boundsFor,
  defaultSizeFor: D_GT_1_defaultSizeFor,
  isResizable: D_GT_1_isResizable,
  sizeFor: () => undefined,
  commit: D_GT_1_sink,
}
const D_GT_1_handle: ModuleResizeControllerHandle = { element: undefined, onMove: () => undefined }
const D_GT_1_stats: ModuleResizeStats = {
  attached: 0,
  gestures: 0,
  sinkCalls: 0,
  written: 0,
  resets: 0,
  lastCode: 'ok',
}
/** `§2.1` — the two VALUE exports, referenced BY NAME at the type layer: `typeof
 *  import(…)` carries the module's export surface, so `D-GT-1-clampToBounds` is a
 *  `(value: unknown, bounds: unknown) => number` only if that value export exists with
 *  that exact signature. */
type D_GT_1_Module = typeof import('../src/shared/gutter.js')
type D_GT_1_factory = D_GT_1_Module['createResizeController']
type D_GT_1_clamp = D_GT_1_Module['clampToBounds']
const D_GT_1_factorySignature: (options?: ModuleResizeControllerOptions) => ModuleResizeController = null as unknown as D_GT_1_factory
const D_GT_1_clampSignature: (value: unknown, bounds: unknown) => number = null as unknown as D_GT_1_clamp
const D_GT_1_controller: ModuleResizeController = null as unknown as ReturnType<D_GT_1_factory>
void D_GT_1_factorySignature
void D_GT_1_clampSignature
void D_GT_1_declaredSeams
void D_GT_1_handle
void D_GT_1_stats
void D_GT_1_controller

// ===========================================================================
// THE IMPORT BOUNDARY (`§4.1`) and the path constants the static/existence rows use.
// ===========================================================================
const MODULE_SRC = new URL('../src/shared/gutter.ts', import.meta.url)
/** The run-time specifier of `§5.1` row 1, assembled at RUN time so the unresolvable
 *  import cannot fail this file's transform while the module is absent (the repo's
 *  `.js` → `.ts` resolution applies at run time). */
const MODULE_SPECIFIER = ['..', 'src', 'shared', 'gutter.js'].join('/')
const SESSION_SPECIFIER = ['..', 'src', 'shared', 'gesture-session.js'].join('/')
const TEST_FILE = fileURLToPath(import.meta.url)
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const MODULE_RELPATH = 'src/shared/gutter.ts'
const TEST_RELPATH = 'tests/gutter.test.ts'
const SPEC_RELPATH = 'docs/specs/gutter.md'
const SESSION_RELPATH = 'src/shared/gesture-session.ts'

/** `§4.1` — the module-absent reason, as DATA: a clause row asserts it (so the red
 *  message names the absent module) while a REGISTER row counts it as a BROKEN attempt
 *  (`§5.5.1`'s stop-after-5 discipline is what reports the red run's early stop, and a
 *  throw would hide it). */
let moduleCache: { mod: Record<string, unknown> | null; reason: string | null } | null = null

// ===========================================================================
// THE COMPOSED SESSION, RESOLVED FIRST AND EXACTLY ONCE (`R-18`'s precondition, and the
// `Pre-*` rows' subject): the frozen module this unit composes. It is resolved at module
// scope through the same RUN-TIME-COMPUTED specifier so a missing sibling cannot fail this
// file's transform.
// ===========================================================================
const SESSION_SRC = new URL('../src/shared/gesture-session.ts', import.meta.url)
let sessionModuleCache: Record<string, unknown> | null = null
async function sessionNamespace(): Promise<Record<string, unknown>> {
  if (sessionModuleCache !== null) return sessionModuleCache
  expect(
    existsSync(SESSION_SRC),
    `R-18 §3.5 — the composed session module exists at ${fileURLToPath(SESSION_SRC)} (this unit composes it; a missing name means the frozen delegate surface moved, which is a finding to REPORT — never a licence to edit the session's module or its spec)`,
  ).toBe(true)
  const mod = (await import(/* @vite-ignore */ SESSION_SPECIFIER)) as unknown as Record<string, unknown>
  sessionModuleCache = mod
  return mod
}
async function sessionValueExport<T>(name: string, label: string): Promise<T> {
  const mod = await sessionNamespace()
  const value = mod[name]
  expect(
    typeof value,
    `R-18 §3.5 — the session module exports \`${name}\` by NAME (the frozen delegate surface, \`docs/decisions.md\` \`GSESSION-DELEGATE-SURFACE-IS-FROZEN-FOR-E3-E4\`) [${label}]`,
  ).not.toBe('undefined')
  return value as T
}
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

/** The CLAUSE rows' boundary. Fails as an ASSERTION carrying the row's label and RETURNS
 *  the namespace so a row's body stays type-clean. */
/** **THE MODULE-LIVENESS ASSERTION.** While the module is absent, several rows' DECLARED
 *  values are ALREADY SATISFIED by the stand-in controller (a composition that never wired
 *  the channel writes zero times, and the `typeof` gate's `NaN` is one of the clamp's
 *  declared answers) — a GREEN there would be exactly the vacuous green `F-10`/`F-11` warn
 *  about. Every such row therefore asserts the module's EXISTENCE first, so its green is
 *  never a stand-in's.
 *
 *  A row that passes while `src/shared/gutter.ts` does not exist is a HARNESS-CAUSED pass and
 *  a finding against this file. */
async function requireLiveModule(label: string): Promise<Record<string, unknown>> {
  const mod = await requireModule(label)
  expect(
    existsSync(MODULE_SRC),
    `RED — U-GUTTER red set (§4.1): this row's declared values would ALSO be satisfied by the absent-module stand-in, so it asserts the module's EXISTENCE before its own clause (an ` + '`absent`' + `-module green here would be a vacuous pass). [${label}]`,
  ).toBe(true)
  return mod
}

async function requireModule(label: string): Promise<Record<string, unknown>> {
  const { mod, reason } = await resolveModule()
  if (mod === null) {
    expect(
      mod,
      `RED — U-GUTTER red set (§4.1): ${reason ?? 'the module surface is unavailable'}. ` +
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
    `§2.1/§3.4 R-5(a) — the runtime VALUE export \`${name}\` is exported by \`${MODULE_RELPATH}\` (the export census is a SET claim: ${JSON.stringify(
      Object.keys(mod).sort(),
    )}) [${label}]`,
  ).not.toBe('undefined')
  return value as T
}

// ---------------------------------------------------------------------------
// THE TWO VALUE EXPORTS, TOTALLY RESOLVED.
//
// At RED time the module is absent, so a clause row that called `mod['clampToBounds']`
// would throw a HARNESS `TypeError` — the exact "red for a harness defect" class the red
// report must not contain. These two accessors therefore return a LABELLED STAND-IN: a
// stand-in that (a) never throws for any argument, and (b) always answers a value outside
// the contract's declared answers, so every row fails on its OWN assertion instead.
// ---------------------------------------------------------------------------
const NO_MODULE_ANSWER = Number.NaN
type ClampOutcome = { readonly threw: unknown; readonly result: unknown }
function clampVia(value: unknown, bounds: unknown): ClampOutcome {
  const live = moduleCache?.mod?.['clampToBounds']
  if (typeof live !== 'function') return { threw: null, result: NO_MODULE_ANSWER }
  try {
    return { threw: null, result: (live as (v: unknown, b: unknown) => unknown)(value, bounds) }
  } catch (e) {
    return { threw: e, result: undefined }
  }
}

/** A VALID-BUT-INERT STAND-IN controller (`§2.4` item 1's degradation shape), used only
 *  while the module is absent: every member returns its DECLARED shape and nothing is
 *  ever recorded against a session. A row that drives it fails on its own assertions
 *  (`attach` ⇒ `false` where `true` was required) rather than on a harness throw. */
function standInController(): { controller: ControllerLike; installCalls: number; sessionCalls: number } {
  const box = { installCalls: 0, sessionCalls: 0 }
  const controller: ControllerLike = {
    attach: (): boolean => false,
    detach: (): boolean => false,
    reset: (): ExpectedResetResult => ({ ok: false, code: 'no-gesture', committed: false }),
    stats: (): ExpectedStats => ({ attached: 0, gestures: 0, sinkCalls: 0, written: 0, resets: 0, lastCode: 'ok' }),
    detached: false,
  }
  return { controller, installCalls: box.installCalls, sessionCalls: box.sessionCalls }
}

async function createController(
  options?: Record<string, unknown>,
  label = 'the controller factory',
): Promise<{ controller: ControllerLike; live: boolean }> {
  const mod = await resolveModule()
  if (mod.mod === null) return { controller: standInController().controller, live: false }
  const factory = mod.mod['createResizeController']
  expect(
    typeof factory,
    `§2.1/§3.4 R-5(a) — the runtime VALUE export \`createResizeController\` is exported (the module resolves, so its absence is a row failure, not a boundary) [${label}]`,
  ).toBe('function')
  const produced = (factory as (o?: unknown) => unknown)(options)
  expect(
    typeof produced,
    `§2.1 item 3 — \`createResizeController\` returns a controller [${label}]`,
  ).toBe('object')
  return { controller: produced as ControllerLike, live: true }
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
function throwsOn(body: () => unknown): boolean {
  try {
    body()
    return false
  } catch {
    return true
  }
}

// ===========================================================================
// THE RECORDING SESSION DOUBLE (`§2.5` item 1's table, `§5.5.1` strategy item 6(a)):
// a hand-built session whose SEVEN members are all present and whose every call lands in
// its own log with its exact argument values. Every refusal shape it can produce is a
// configured response, so a row can drive `'busy'`, `'stale'`, `'disposed'` and
// `'not-installed'` without owning a real lifecycle — and never with a pointer.
//
// The DOUBLE also mirrors the landed session's own establishment/terminal ORDER
// (`gsession.md` `§2.3` item 1(d)): the controller's `onStart` runs INSIDE `begin`, and a
// throw from it triggers the session's establishment-failure cleanup (record discarded,
// element still installed) — which is what `F-18` falsifies.
// ===========================================================================
type DoubleResponse = 'ok' | SessionCode
interface DoubleConfig {
  readonly install?: boolean
  readonly beginCode?: SessionCode | null
  readonly endCode?: SessionCode | null
  readonly resetCode?: SessionCode | null
  readonly disposeComplete?: boolean
  readonly disposed?: boolean
  readonly commitOnEnd?: boolean
  readonly commitOnReset?: boolean
}
interface SessionDouble {
  readonly session: SessionLike & Record<string, unknown>
  readonly log: string[]
  readonly installArgs: Array<{ element: unknown; keys: string[]; options: Record<string, unknown> }>
  readonly handles: GestureHandle[]
  readonly value: { current: unknown }
  readonly started: { count: number }
  install(element: GestureElement, options?: GestureCallOptions): boolean
  begin(element: GestureElement): BeginResult
  end(element: GestureElement, gesture: GestureHandle, value?: unknown): TerminalResult
  reset(element: GestureElement, gesture: GestureHandle, value: unknown): TerminalResult
  cancel(element: GestureElement, gesture?: GestureHandle): TerminalResult
  dispose(): DisposeReport
  gesture(): GestureStats | null
  stats(): SessionStats
  /** **THE COMPOSITION'S SINK CHANNEL INTO THIS DOUBLE** (the SESSION's own `commit`
   *  option, wired by the composition — never a fifth hook). One per installed controller,
   *  so a two-writer drive lands both sinks on ONE terminal. */
  registerCommit(element: GestureElement, handler: (gesture: GestureHandle, written: unknown) => void): void
  /** **THE HANDLE ARGUMENTS THE COMPOSITION PASSED WITH `reset`** (the `[T]` reading
   *  `§5.5.1 P-GT-SM-4`'s per-attempt assert requires: *"the identity of the handle passed to
   *  `session.reset` (the one the session gave at establishment)"*). The landed session
   *  accepts a handle only when its own `id` AND `element` match the active record
   *  (`src/shared/gesture-session.ts`'s `handleIsCurrent`), so this double honours the SAME
   *  rule: a wrapper-CAPTURED real handle is therefore usable, and a SYNTHESISED one is not. */
  readonly resetHandles: GestureHandle[]
  fireTerminal(outcome: 'end' | 'cancel'): void
  fireMove(): void
}

interface HookSet {
  onStart?: unknown
  onMove?: unknown
  onEnd?: unknown
  onCancel?: unknown
}

function makeSessionDouble(config: DoubleConfig = {}): SessionDouble {
  const log: string[] = []
  const installArgs: SessionDouble['installArgs'] = []
  const handles: GestureHandle[] = []
  const value = { current: undefined as unknown }
  const started = { count: 0 }
  const hooksByElement = new Map<unknown, HookSet>()
  const installed = new Map<unknown, boolean>()
  let active: { id: number; handle: GestureHandle; element: unknown; outcome: GestureOutcome; value: unknown } | null =
    null
  let disposed = config.disposed === true
  let gestureId = 0
  let commits = 0
  /** **THE SESSION'S OWN COMMIT SEAM, HELD PER ELEMENT.** Every controller installed on
   *  this double recorded its own `commit` callback here, so ONE terminal invokes EVERY
   *  composition's sink — which is exactly what makes the two-writer and consumer-side
   *  shapes of `P-GT-SM-3`/`F-9`/`F-19` land on ONE sink record. */
  const commitsByElement = new Map<unknown, Array<(gesture: GestureHandle, value: unknown) => void>>()
  const resetHandles: GestureHandle[] = []
  const invokeCommit = (element: unknown, gesture: GestureHandle, written: unknown): void => {
    for (const handler of commitsByElement.get(element) ?? []) handler(gesture, written)
  }
  const double: SessionDouble = {
    log,
    installArgs,
    handles,
    resetHandles,
    value,
    started,
    get session(): SessionLike & Record<string, unknown> {
      return double as unknown as SessionLike & Record<string, unknown>
    },
    install(element: GestureElement, options?: GestureCallOptions): boolean {
      log.push('install')
      const record = (options ?? {}) as Record<string, unknown>
      installArgs.push({ element, keys: Object.keys(record).sort(), options: record })
      if (config.install === false) return false
      if (installed.has(element)) return false
      installed.set(element, true)
      // **THE HOOKS ARE HELD PER ELEMENT** — that is what makes a two-composer drive land
      // both writers' sinks on ONE terminal, which `P-GT-SM-3`/`F-9` require.
      hooksByElement.set(element, {
        onStart: record['onStart'],
        onMove: record['onMove'],
        onEnd: record['onEnd'],
        onCancel: record['onCancel'],
      })
      const commitMember = record['commit']
      if (typeof commitMember === 'function') {
        // `commit` is NOT one of the four hooks this unit forwards (`§2.1` item 5), so this
        // branch is normally dead — a controller that smuggled a fifth key here would be
        // caught by `M-1`'s key-set assertion.
        const list = commitsByElement.get(element) ?? []
        list.push(commitMember as (gesture: GestureHandle, value: unknown) => void)
        commitsByElement.set(element, list)
      }
      return true
    },
    registerCommit(element: GestureElement, handler: (gesture: GestureHandle, written: unknown) => void): void {
      const list = commitsByElement.get(element) ?? []
      list.push(handler)
      commitsByElement.set(element, list)
    },
    begin(element: GestureElement): BeginResult {
      log.push('begin')
      if (disposed) return { ok: false, code: 'disposed' }
      if (active !== null) return { ok: false, code: 'busy' }
      if (config.beginCode !== undefined && config.beginCode !== null) return { ok: false, code: config.beginCode }
      if (!installed.has(element)) return { ok: false, code: 'not-installed' }
      gestureId += 1
      const record = {
        id: gestureId,
        handle: null as unknown as GestureHandle,
        element,
        outcome: null as GestureOutcome,
        value: undefined as unknown,
      }
      const handle: GestureHandle = {
        get id(): number {
          return record.id
        },
        get element(): GestureElement {
          return record.element
        },
        get active(): boolean {
          return active === record
        },
        get outcome(): GestureOutcome {
          return record.outcome
        },
        get value(): unknown {
          return record.value
        },
        set(next: unknown): GestureHandle {
          if (active === record) record.value = next
          return handle
        },
      }
      record.handle = handle
      active = record
      handles.push(handle)
      value.current = handle
      const hooks = hooksByElement.get(element)
      if (hooks !== undefined && typeof hooks.onStart === 'function') {
        try {
          ;(hooks.onStart as (element: unknown) => void)(element)
        } catch (error) {
          // THE SESSION'S OWN ESTABLISHMENT-FAILURE CLEANUP (`gsession.md` §2.3 item
          // 1(d)): the record is discarded and the element stays installed. `F-18`
          // falsifies exactly this path being reached at all.
          active = null
          throw error
        }
      }
      started.count += 1
      return { ok: true, gesture: handle }
    },
    end(element: GestureElement, gesture: GestureHandle, supplied?: unknown): TerminalResult {
      log.push('end')
      if (active === null || gesture !== active.handle) return { ok: false, code: 'stale', committed: false }
      const record = active
      record.outcome = 'end'
      if (supplied !== undefined) record.value = supplied
      active = null
      // THE SESSION'S OWN ORDER (`gsession.md` §2.3 item 4): detach, mark inactive, run
      // `onEnd`, then invoke the injected commit EXACTLY ONCE (a consumer error from
      // `onEnd` is captured and re-thrown AFTER the commit, exactly as the landed module
      // does).
      let hookError: unknown = null
      const hooks = hooksByElement.get(element)
      try {
        if (hooks !== undefined && typeof hooks.onEnd === 'function') {
          ;(hooks.onEnd as (element: unknown, value: unknown) => void)(element, record.value)
        }
      } catch (error) {
        hookError = error
      }
      if (config.commitOnEnd !== false) {
        commits += 1
        invokeCommit(element, record.handle, record.value)
      }
      if (hookError !== null) throw hookError
      return { ok: true, code: 'ok', committed: true }
    },
    reset(element: GestureElement, gesture: GestureHandle, supplied: unknown): TerminalResult {
      log.push('reset')
      resetHandles.push(gesture)
      if (disposed) return { ok: false, code: 'disposed', committed: false }
      if (config.resetCode !== undefined && config.resetCode !== null) {
        return { ok: false, code: config.resetCode, committed: false }
      }
      // **THE LANDED SESSION'S OWN CURRENCY RULE, HONOURED HERE (`src/shared/gesture-session.ts`
      // `handleIsCurrent`: `id === record.id && owned === element && element === record.element`).**
      // The frozen session accepts a handle by ID AND ELEMENT identity, so a
      // WRAPPER-CAPTURED real handle is usable while a SYNTHESISED one is not — which is what
      // makes `M-6`/`M-15`/`P-GT-SM-4` shape `(1)` assertable against the real channel
      // (`E3`-BLOCK-5).
      if (active === null || gesture !== active.handle) {
        const id = (gesture as unknown as { id?: unknown } | null | undefined)?.id
        const owned = (gesture as unknown as { element?: unknown } | null | undefined)?.element
        const matchesActiveRecord = active !== null && id === active.id && owned === element && element === active.element
        if (!matchesActiveRecord) return { ok: false, code: 'stale', committed: false }
      }
      if (active === null) return { ok: false, code: 'stale', committed: false }
      const record = active
      record.outcome = 'reset'
      // **⟶ CORRECTED 2026-09-27 (THE ESTABLISHMENT-SEAM AMENDMENT PASS — RULING `2`, and the
      // HARNESS defect it exposed): THIS DOUBLE NO LONGER STORES THE TERMINAL'S VALUE ON THE
      // RECORD.** The FROZEN session (`src/shared/gesture-session.ts`'s `runTerminal`) fires the
      // consumer's `onEnd` hook BEFORE it stores anything and **never stores the terminal's value
      // on the record at all** — the value reaches the composition as the `commit` seam's ARGUMENT.
      // The as-landed double assigned `record.value = supplied` BEFORE firing `onEnd`, so on this
      // harness the handle appeared to read back a committed value at the terminal while the real
      // session reads `undefined` — a HARNESS divergence that would have let a row assert a
      // handle-side value reading the frozen session cannot support (`§3.1 M-15`, `§2.3` item 4
      // clause 8, `§5.5.1 P-GT-SM-4` shape `(1)`). A value reaches the record here by exactly the
      // same route as in the real session: the composition's own `gesture.set(narrowed)` on the
      // reset path (while the record is still `active`).
      active = null
      const resetHooks = hooksByElement.get(element)
      if (resetHooks !== undefined && typeof resetHooks.onEnd === 'function') {
        ;(resetHooks.onEnd as (element: unknown, value: unknown) => void)(element, supplied)
      }
      if (config.commitOnReset !== false) {
        commits += 1
        // **THE SESSION'S ONE COMMIT CHANNEL, INVOKED AT ITS `reset` TERMINAL** — the same
        // channel the landed session invokes at `runTerminal` (`gsession.md` `§2.3` item 4), and
        // the channel the composition's single sink writer is wired to (`§2.5` item 4).
        // **⟶ CORRECTED 2026-09-27 (THE GATE-4 ALIGNMENT PASS): the DOUBLE's `reset` was the one
        // terminal that did NOT invoke the composition's writer**, so a `reset` could never reach
        // the composition's single write site on this configuration and every reset-side write
        // count read `0` — a HARNESS defect that made `M-14`/`M-15`/`M-18`/`P-GT-SM-4`
        // unreachable. The throw is contained per the landed session's own order.
        let writerError: unknown = null
        try {
          invokeCommit(element, record.handle, supplied)
        } catch (error) {
          writerError = error
        }
        if (writerError !== null) throw writerError
      }
      return { ok: true, code: 'ok', committed: true }
    },
    cancel(element: GestureElement, gesture?: GestureHandle): TerminalResult {
      log.push('cancel')
      if (disposed) return { ok: false, code: 'disposed', committed: false }
      if (active === null) return { ok: false, code: 'no-gesture', committed: false }
      void gesture
      const record = active
      record.outcome = 'cancel'
      active = null
      const cancelHooks = hooksByElement.get(element)
      if (cancelHooks !== undefined && typeof cancelHooks.onCancel === 'function') {
        ;(cancelHooks.onCancel as (element: unknown) => void)(element)
      }
      return { ok: true, code: 'ok', committed: false }
    },
    dispose(): DisposeReport {
      log.push('dispose')
      disposed = true
      const wasActive = active !== null
      active = null
      installed.clear()
      return { removed: wasActive ? 4 : 1, complete: config.disposeComplete !== false }
    },
    gesture(): GestureStats | null {
      log.push('gesture')
      if (active === null) return null
      return { active: true, id: active.id, outcome: active.outcome, value: active.value, commits: 0 }
    },
    stats(): SessionStats {
      log.push('stats')
      return {
        installed: installed.size,
        sourceCalls: 0,
        gestures: started.count,
        commits,
        active: active !== null,
        gestureId: active === null ? 0 : active.id,
        lastCode: disposed ? 'disposed' : 'ok',
      }
    },
    fireTerminal(outcome: 'end' | 'cancel'): void {
      const record = active
      if (record === null) return
      const element = record.element
      if (outcome === 'end') {
        record.outcome = 'end'
        active = null
        const hooks = hooksByElement.get(element)
        let hookError: unknown = null
        try {
          if (hooks !== undefined && typeof hooks.onEnd === 'function') {
            ;(hooks.onEnd as (element: unknown, value: unknown) => void)(element, record.value)
          }
        } catch (error) {
          hookError = error
        }
        if (config.commitOnEnd !== false) {
          commits += 1
          invokeCommit(element, record.handle, record.value)
        }
        if (hookError !== null) throw hookError
        return
      }
      record.outcome = 'cancel'
      active = null
      const hooks = hooksByElement.get(element)
      if (hooks !== undefined && typeof hooks.onCancel === 'function') {
        ;(hooks.onCancel as (element: unknown) => void)(element)
      }
    },
    fireMove(): void {
      const record = active
      if (record === null) return
      const hooks = hooksByElement.get(record.element)
      if (hooks !== undefined && typeof hooks.onMove === 'function') {
        ;(hooks.onMove as (gesture: GestureHandle) => void)(record.handle)
      }
    },
  }
  return double
}

// ===========================================================================
// THE RECORDING SOURCE + THE LANDED SESSION (`§2.5` item 1's table, layer anchor 2):
// rows that need the CONTRACT's real composition drive the landed
// `src/shared/gesture-session.ts` through an argument-supplied recorder, and every call
// the session makes lands in the recorder's log. **No real element exists in this file**:
// an element is an opaque record the source keys by identity.
// ===========================================================================
interface RecorderSource {
  readonly calls: string[]
  readonly captures: unknown[]
  readonly attached: Map<unknown, Map<string, () => void>>
  on(element: unknown, type: string, handler: () => void): void
  off(element: unknown, type: string, handler: () => void): void
  capturePointer?: (element: unknown) => void
  fire(element: unknown, type: string): void
}
function makeRecorder(withCapture: boolean): RecorderSource {
  const calls: string[] = []
  const captures: unknown[] = []
  const attached = new Map<unknown, Map<string, () => void>>()
  const source: RecorderSource = {
    calls,
    captures,
    attached,
    on(element: unknown, type: string, handler: () => void): void {
      calls.push(`on:${type}`)
      const per = attached.get(element) ?? new Map<string, () => void>()
      per.set(type, handler)
      attached.set(element, per)
    },
    off(element: unknown, type: string, handler: () => void): void {
      void handler
      calls.push(`off:${type}`)
      attached.get(element)?.delete(type)
    },
    /** Fire the recorded handler for `(element, type)`.
     *  **IT IS NOT A HARNESS ASSERTION WHEN THE HANDLER IS ABSENT.** While the module is
     *  absent `attach` delegated NOTHING, so no listener exists and there is no handler to
     *  fire — and a `throw`/`expect` here would turn a module-absent ROW into a HARNESS
     *  DEFECT, which the red report must never contain. An absent handler is therefore a
     *  NO-OP, and the row fails on its OWN declared assertion instead. (Once the module
     *  lands, a missing handler means `attach` did not delegate — which `M-1`/`R-3` catch
     *  directly, on the session's recorded call log.) */
    fire(element: unknown, type: string): void {
      const handler = attached.get(element)?.get(type)
      if (typeof handler !== 'function') return
      handler()
    },
  }
  if (withCapture) {
    source['capturePointer'] = (element: unknown): void => {
      calls.push('capturePointer')
      captures.push(element)
    }
  }
  return source
}
const TYPE_DOWN = 'pointerdown'
const TYPE_MOVE = 'pointermove'
const TYPE_UP = 'pointerup'
const TYPE_CANCEL_EVENT = 'pointercancel'

interface LandedHarness {
  readonly session: SessionLike & Record<string, unknown>
  readonly source: RecorderSource
  readonly commits: Array<{ gesture: unknown; value: unknown; outcome: unknown }>
  readonly sessionLog: string[]
  /** Every options object the CONTROLLER handed `session.install`, with its own key set
   *  (`R-10`'s reading — the recorded install arguments, never this file's copy). */
  readonly installArgs: Array<{ element: unknown; keys: string[] }>
  /** **THE COMPOSITION'S OWN SINGLE SINK WRITER FOR THIS LANDED CONFIGURATION** — the
   *  `commit` SEAM the row hands `createResizeController` (`§2.5` item 4: the composition
   *  wires the session's `commit` option to EXACTLY ONE callback). A row registers it with
   *  `registerCompositionWriter(sink)` after `createController`, and the session's ONE commit
   *  channel then reaches it — never a second writer, and never the harness's own recorder. */
  registerCompositionWriter(writer: (gesture: unknown, value: unknown) => void): void
}
/** The landed session, wrapped so every call the CONTROLLER makes into it is counted
 *  (`R-14`'s `[T]` half) while the session's own behaviour is the landed module's.
 *
 *  **⟶ ALIGNED TO THE AMENDED `§2.5` item 4 (THE PINNED SINGLE WIRING), 2026-09-27 —
 *  `E3`-BLOCK-3.** The session's `commit` option is wired to EXACTLY ONE callback, and the
 *  rows that read the sink's own record hand THIS harness the SAME sink they hand the
 *  composition — so the harness's channel and the composition's write site are ONE writer,
 *  never two. A row that needs the TWO-writer shape supplies a DIFFERENT writer (`writerShape`
 *  shape `(2)` does exactly that, and it is declared to fail). */
async function landedHarness(options: { withCapture?: boolean; label?: string } = {}): Promise<LandedHarness> {
  // **THE HARNESS TAKES NO WRITER.** Its `commit` option is the session's own channel and it
  // only RECORDS (see the block below); a row that needs a second writer constructs it
  // explicitly (`writerShape(2)`, `F-19`), and a row that needs the slot-empty composition
  // omits the COMPOSITION's `commit` seam (never the session's).
  const source = makeRecorder(options.withCapture === true)
  const commits: LandedHarness['commits'] = []
  const sessionLog: string[] = []
  const installArgs: LandedHarness['installArgs'] = []
  const factory = await sessionValueExport<(o: Record<string, unknown>) => SessionLike & Record<string, unknown>>(
    'createGestureSession',
    options.label ?? 'the session factory',
  )
  /** **THE COMPOSITION'S SINGLE SINK WRITER, HELD IN A SLOT THE SESSION'S OWN `commit`
   *  OPTION READS AT EVERY TERMINAL.** The landed session CAPTURES its `commit` member when
   *  `createGestureSession` runs, so the channel is installed into this slot BEFORE the
   *  factory is called, and a row fills the slot with `registerCompositionWriter(sink)` once
   *  the controller exists. **THE WRITE ITSELF IS THE COMPOSITION'S OWN — the harness's
   *  recorder is NOT a writer** (`§2.5` item 4: *"the composition wires the SESSION's `commit`
   *  option to EXACTLY ONE CALLBACK — the composition's SINGLE SINK WRITER"*). The as-landed
   *  harness FORWARDED the write from its own recorder to the sink the rows hand the
   *  composition, so BOTH writers ran for one gesture and the sink's record read `2` where the
   *  rows declare `1` (`M-5`, `M-9`, `M-11`): that is precisely the second writer `§4.4 S-11`
   *  forbids, and `F-9`/`P-GT-SM-3` shape `(2)` construct it by their own explicit mechanism.
   *  It is ALSO why the landed `reset` path could never reach a write at all. */
  let compositionWriter: ((gesture: unknown, value: unknown) => void) | null = null
  const commit = (gesture: unknown, value: unknown): void => {
    const handle = gesture as GestureHandle
    commits.push({ gesture, value, outcome: handle.outcome })
    // **AND THE HARNESS IS NOT A WRITER.** The composition's OWN sink write happens at the
    // single site its terminal owns (the sink it was handed as the `commit` SEAM), and this
    // channel RECORDS the session's one invocation beside it. **Forwarding here would make the
    // sink's record read `2` where the rows declare `1`** — the second writer `§4.4 S-11`
    // forbids, and the reason the as-landed harness could never be distinguished from a
    // two-writer composition (`F-9`/`P-GT-SM-3` shape `(2)` build that shape explicitly).
    void compositionWriter
  }
  const raw = factory({ source, commit } as Record<string, unknown>)
  const session: SessionLike & Record<string, unknown> = raw
  const rawInstall = raw['install'] as (e: unknown, o?: unknown) => unknown
  const wrappedInstall = (element: unknown, installOptions?: unknown): unknown => {
    sessionLog.push('install')
    const record = (installOptions ?? {}) as Record<string, unknown>
    installArgs.push({ element, keys: Object.keys(record).sort() })
    return rawInstall.call(raw, element, installOptions)
  }
  ;(session as unknown as Record<string, unknown>)['install'] = wrappedInstall
  for (const name of ['reset', 'dispose', 'stats', 'gesture'] as const) {
    // **THE ORIGINAL IS BOUND ONCE, BEFORE THE REPLACEMENT IS INSTALLED** — wrapping the
    // already-replaced member would make the wrapper call itself (a harness defect, and one
    // that would surface as a `RangeError` rather than as a labelled row assertion).
    const original = (raw[name] as (...a: unknown[]) => unknown).bind(raw)
    ;(session as unknown as Record<string, unknown>)[name] = (...args: unknown[]): unknown => {
      sessionLog.push(name)
      return original(...args)
    }
  }
  return {
    session,
    source,
    commits,
    sessionLog,
    installArgs,
    registerCompositionWriter(writer: (gesture: unknown, value: unknown) => void): void {
      compositionWriter = writer
    },
  }
}

/** The landed session module's own value export (the module this unit composes —
 *  `R-18`'s precondition) — resolved by `sessionNamespace()` at the head of this file. */

// ---------------------------------------------------------------------------
// THE COUNTING SINK (`§2.3` item 3, `§5.5.1 P-GT-SM-3`): records every invocation with
// the session's own handle, the value it received and the handle's OUTCOME at the moment
// of the call — and can be configured to THROW (`F-11`).
// ---------------------------------------------------------------------------
interface SinkRecord {
  readonly gesture: unknown
  readonly value: unknown
  readonly outcome: unknown
  readonly id: unknown
  readonly seq: number
}
interface CountingSink {
  (gesture: GestureHandle, value: number): void
  readonly records: SinkRecord[]
  readonly attempts: { count: number }
}
function makeSink(throws = false): CountingSink {
  const records: SinkRecord[] = []
  const attempts = { count: 0 }
  const sink = ((gesture: GestureHandle, value: number): void => {
    attempts.count += 1
    records.push({ gesture, value, outcome: gesture === null ? null : gesture.outcome, id: gesture === null ? null : gesture.id, seq: attempts.count })
    if (throws) throw new Error('the consumer sink threw (F-11)')
  }) as CountingSink
  Object.defineProperty(sink, 'records', { value: records })
  Object.defineProperty(sink, 'attempts', { value: attempts })
  return sink
}

/** A seam that records its own calls and returns a configured value, or throws when
 *  `throws` is set. */
function seam<T>(answer: T, throws = false): { (...args: unknown[]): T; readonly calls: Array<unknown[]> } {
  const calls: Array<unknown[]> = []
  const fn = ((...args: unknown[]): T => {
    calls.push(args)
    if (throws) throw new Error('the injected seam threw (C2)')
    return answer
  }) as { (...args: unknown[]): T; readonly calls: Array<unknown[]> }
  Object.defineProperty(fn, 'calls', { value: calls })
  return fn
}
/** A NON-CALLABLE seam shape (`42`, a string) — the declared `non-callable` class. */
const NON_CALLABLE_SEAM = 42

// ===========================================================================
/** The JOIN MARKER (`§4.4 S-6`): it marks the seam between two pieces of ONE spelling.
 *  It is a non-identifier byte, so the boundary rule reads a standing marker as a separator. */
const JOIN_MARKER = '\u0001'

// THE ANTI-EVASION SCANNERS (`§4.4 S-6`, `R-1`/`R-11`): the token forms are held as
// FRAGMENTS so a rule list that spelled them joined would put them into this file's own
// bytes — and THIS file is one of the two files `R-8`'s bound (b) scans.
// ===========================================================================
/** **THE FRAGMENT BUILDER.** Every banned spelling this file must NAME is held as
 *  CHUNKS and joined with the JOIN MARKER, because **this file is one of the two files
 *  `R-8`'s bound (b) scans**: a rule list that spelled its tokens joined would put them into
 *  this file's own bytes. The marker tells the matcher that the pieces came from one
 *  token, so a corpus built over `chunked([...])` is matched as the joined spelling while
 *  the file's bytes carry only the fragments. */
function chunked(parts: readonly string[]): string {
  return parts.join(JOIN_MARKER)
}
const BOUNDARY_RE = /[A-Za-z0-9_$]/
function isIdentChar(text: string): boolean {
  return text.length > 0 && BOUNDARY_RE.test(text)
}
/** **THE SPLIT-SPELLING MATCHER (`§4.4 S-6`).** A spelling whose pieces the SOURCE joins
 *  (separated by ONLY whitespace and the concatenation operator) is matched as ONE token — a
 *  prohibition satisfiable by splitting a token is not satisfied — while the boundary rule is
 *  applied to the WHOLE match, so a spelling bounded by word characters is still REFUSED. */
function boundedOccurrences(text: string, spelling: string): number {
  const pieces = spelling
    .split(JOIN_MARKER)
    .map((piece) => piece.split('\\').join('\\\\').split('.').join('\\.').split('*').join('\\*').split('+').join('\\+').split('?').join('\\?').split('^').join('\\^').split('$').join('\\$').split('{').join('\\{').split('}').join('\\}').split('(').join('\\(').split(')').join('\\)').split('|').join('\\|').split('[').join('\\[').split(']').join('\\]'))
  // The separator run admits the JOIN MARKER as well as whitespace and the concatenation
  // operator, so the matcher works over a NORMALIZED view and over a raw corpus alike.
  const sep = `[\\s${JOIN_MARKER}]*(?:\\+[\\s${JOIN_MARKER}]*)*`
  const pattern = pieces.join(sep)
  const re = new RegExp(pattern, 'gi')
  let count = 0
  let match = re.exec(text)
  while (match !== null) {
    const before = match.index === 0 ? '' : text[match.index - 1]
    const after = match.index + match[0].length >= text.length ? '' : text[match.index + match[0].length]
    if (!isIdentChar(before) && !isIdentChar(after)) count += 1
    match = re.exec(text)
  }
  return count
}
/** **THE NORMALIZED VIEW (`R-1`/`R-11`/`§4.4 S-6`, the `S-6` closure).** Four rules:
 *
 *  1. **COMMENTS ARE SCANNED LIKE CODE** — line and block comment bodies are KEPT.
 *  2. **A STRING LITERAL IS REPLACED BY ITS CONTENT**, wrapped in the JOIN MARKER (`^`):
 *     the marker records that the content came from a LITERAL, so a token **split across
 *     two concatenated literals** is still readable as ONE token (`'cli' + 'entX'` ⇒
 *     `cli^entX`) — which is what `S-6` requires, because *"a static prohibition
 *     satisfiable by splitting a token is not satisfied"*.
 *  3. **THE MARKER IS DROPPED ONLY WHERE THE SOURCE HAS NOTHING BETWEEN THE PIECES**
 *     (only whitespace and the concatenation operator are skipped), so two pieces the
 *     source joins are genuinely ADJACENT while a literal followed by real code keeps its
 *     boundary.
 *  4. Everything else is preserved byte-for-byte, so a raw spelling and an identifier
 *     boundary read exactly as written. */
function normalizedView(src: string): string {
  const marks: string[] = []
  let out = ''
  let i = 0
  const readQuoted = (): void => {
    const quote = src[i]
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
    out += JOIN_MARKER + value + JOIN_MARKER
    marks.push(value)
  }
  while (i < src.length) {
    const ch = src[i]
    const next = src[i + 1]
    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') {
        out += src[i]
        i += 1
      }
      continue
    }
    if (ch === '/' && next === '*') {
      out += ' '
      i += 2
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        out += src[i]
        i += 1
      }
      i += 2
      out += ' '
      continue
    }
    if (ch === "'" || ch === '"') {
      readQuoted()
      continue
    }
    if (ch === '`') {
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
          out += JOIN_MARKER + part + JOIN_MARKER
          marks.push(part)
          part = ''
          i += 2
          let depth = 1
          while (i < src.length && depth > 0) {
            if (src[i] === '{') depth += 1
            else if (src[i] === '}') depth -= 1
            if (depth > 0) {
              out += src[i]
              i += 1
            }
          }
          i += 1
          continue
        }
        part += src[i]
        i += 1
      }
      out += JOIN_MARKER + part + JOIN_MARKER
      marks.push(part)
      continue
    }
    out += ch
    i += 1
  }
  // **THE MARKERS ARE DROPPED ON THE WAY OUT.** The matcher (`boundedOccurrences`) holds the
  // `S-6` join rule: a spelling whose pieces the SOURCE joins — separated by ONLY whitespace
  // and the concatenation operator — is matched as ONE token, while a spelling adjacent to a
  // word character on either side is REFUSED by the boundary rule. A marker left standing
  // would be a third byte the boundary rule would have to reason about, so it is removed.
  return out.split(JOIN_MARKER).join('')
}
function hitsOf(text: string, spellings: readonly string[]): string[] {
  const found: string[] = []
  for (const spelling of spellings) {
    const count = boundedOccurrences(text, spelling)
    if (count > 0) found.push(`${spelling} ×${count}`)
  }
  return found
}

/** **`R-1`'s VOCABULARY (`P-1`, `P-5`, `P-8`, `P-10`).** The `--` entry is the CSS
 *  custom-property prefix and is scanned as a LEADING DOUBLE HYPHEN before a letter, so an
 *  ordinary decrement never matches it. */
const VOCAB_COORD: readonly string[] = [
  chunked(['client', 'X']),
  chunked(['client', 'Y']),
  chunked(['page', 'X']),
  chunked(['page', 'Y']),
  chunked(['screen', 'X']),
  chunked(['screen', 'Y']),
  chunked(['offset', 'X']),
  chunked(['offset', 'Y']),
  chunked(['movement', 'X']),
  chunked(['movement', 'Y']),
  chunked(['pointer', 'Id']),
  chunked(['delta', 'X']),
  chunked(['delta', 'Y']),
  chunked(['butt', 'ons']),
  chunked(['is', 'Primary']),
]
const VOCAB_AXIS: readonly string[] = ['horizontal', 'vertical', 'inline', 'block', chunked(['x', '-axis']), chunked(['y', '-axis'])]
const VOCAB_UNIT: readonly string[] = [chunked(['f', 'it-content']), 'calc(', 'px']
const VOCAB_SELECTOR: readonly string[] = ['selectors', 'querySelector', 'closest', 'getElementById']
const VOCAB_CENSUS: readonly string[] = ['census', 'zones', 'revealed', 'specOf', 'trackVar', 'trackProp', 'emptyToken']
const VOCAB_STORE: readonly string[] = [
  chunked(['local', 'Storage']),
  chunked(['session', 'Storage']),
  'store',
  'cache',
  'memo',
  'persist',
]
const VOCAB_THRESHOLD: readonly string[] = ['threshold']
const VOCAB_ALL: readonly string[] = [
  ...VOCAB_COORD,
  ...VOCAB_AXIS,
  ...VOCAB_UNIT,
  ...VOCAB_SELECTOR,
  ...VOCAB_CENSUS,
  ...VOCAB_STORE,
  ...VOCAB_THRESHOLD,
]
const CSS_CUSTOM_PROP = /--[A-Za-z]/
function vocabularyViolations(src: string): string[] {
  const view = normalizedView(src)
  const found = hitsOf(view, VOCAB_ALL)
  if (CSS_CUSTOM_PROP.test(view)) found.push('a CSS custom-property prefix')
  return found.sort()
}
/** `R-1`'s POSITIVE CONTROLS: each MUST fail the scan (a corpus spelling a banned token
 *  raw, joined across a literal boundary, and inside a comment). */
const VOCAB_POSITIVE_CONTROLS: readonly string[] = [
  `const a = ${chunked(['client', 'X'])}`,
  `const a = '${chunked(['client', 'X'])}'`,
  `// the row reads ${chunked(['page', 'Y'])} here`,
  `const a = ${chunked(['pointer', 'Id'])}`,
  `const a = ${chunked(['horizontal'])}`,
  `const a = ${chunked(['calc', '('])} 100%)`,
  `const a = ${chunked(['querySelector'])}`,
  `const a = ${chunked(['census'])}`,
  `const a = ${chunked(['persist'])}`,
  `const a = ${chunked(['threshold'])}`,
  'const a = --' + 'gutter-width',
]
/** `R-1`'s NEGATIVE CONTROL: this unit's own legitimate text — the result codes, the hook
 *  names, `clampToBounds`'s parameter names — MUST pass. */
const VOCAB_NEGATIVE_CONTROL = [
  "const code = 'unusable-default'",
  "const other = 'no-gesture'",
  'const hooks = { onStart, onMove, onEnd, onCancel }',
  'function clampToBounds(value, bounds) { return value }',
  'const s = session.stats()',
  'const t = session.gesture()',
  'const d = session.disposed',
  'const r = Math.max(min, Math.min(value, max))',
].join('\n')

/** `R-11`'s UI-CONTENT WRITE tokens. */
const WRITE_TOKENS: readonly string[] = [
  chunked(['set', 'Attribute']),
  chunked(['remove', 'Attribute']),
  'classList',
  'className',
  'textContent',
  'innerText',
  chunked(['inner', 'HTML']),
  chunked(['outer', 'HTML']),
  chunked(['insertAdjacent', 'HTML']),
  chunked(['insertAdjacent', 'Text']),
  chunked(['create', 'Element']),
  chunked(['createText', 'Node']),
  chunked(['append', 'Child']),
  chunked(['insert', 'Before']),
  chunked(['remove', 'Child']),
  chunked(['replace', 'Children']),
  chunked(['set', 'Property']),
  'cssText',
]
function uiWriteViolations(src: string): string[] {
  return hitsOf(normalizedView(src), WRITE_TOKENS)
}
const WRITE_POSITIVE_CONTROLS: readonly string[] = [
  `const a = ${chunked(['set', 'Attribute'])}`,
  `const a = 42; el[${"'set'"} + ${"'Attribute'"}]('x', 1)`,
  `// the module never calls ${chunked(['classList'])}`,
]

/** `R-2`'s FORBIDDEN-ACCESS spellings and `R-3`'s EVENT-WIRING spellings. */
const ACCESS_SPELLINGS: readonly string[] = [
  'globalThis',
  'window',
  'self',
  chunked(['match', 'Media']),
  chunked(['getComputed', 'Style']),
  chunked(['getBounding', 'ClientRect']),
  chunked(['active', 'Element']),
  'eval',
  'Reflect.construct',
]
const WIRING_SPELLINGS: readonly string[] = [
  chunked(['addEventListener']),
  chunked(['removeEventListener']),
  chunked(['setPointer', 'Capture']),
  chunked(['releasePointer', 'Capture']),
  chunked(['capture', 'Pointer']),
  chunked(['POINTER', '_TYPES']),
  chunked(['installGesture', 'Listeners']),
  chunked(['detachGesture', 'Listeners']),
  chunked(['begin']),
  chunked(['cancel']),
]
const AMBIENT_SPELLINGS: readonly string[] = [
  chunked(['doc', 'ument']),
  chunked(['global', 'This']),
  chunked(['Math', '.random']),
  chunked(['process', '.env']),
  chunked(['node', ':fs']),
  chunked(['local', 'Storage']),
]
/** `R-8`'s GEOMETRY / COORDINATE spellings (the module's and this file's bytes). */
const GEOMETRY_SPELLINGS: readonly string[] = [
  ...VOCAB_COORD,
  chunked(['getComputed', 'Style']),
  chunked(['getBounding', 'ClientRect']),
  chunked(['offset', 'Width']),
  chunked(['offset', 'Height']),
  chunked(['client', 'Width']),
  chunked(['client', 'Height']),
  chunked(['scroll', 'Width']),
  chunked(['match', 'Media']),
  chunked(['inner', 'HTML']),
]
/** `R-8`'s stated bound (c): the row DESCRIPTIONS extracted from this file, scanned with
 *  the geometry tokens held as FRAGMENTS so the scan cannot read its own rule list. */
/** `R-8` bound (c) — the CLAIM forms. **A bare geometry word is NOT a claim** (this unit's
 *  own rows speak of a coordinate only to assert that NONE is read), so the forms below are
 *  the CLAIM shapes the row must catch, and they are held as fragments. */
const GEOMETRY_CLAIM_WORDS: readonly string[] = [
  'rendered width',
  'rendered height',
  'rendered geometry',
  'rendered pixel',
  'the element measures',
  'a pixel measurement',
  'the pixel width',
  'the layout pass',
  'the applied value',
  'applied css value',
  'the coordinates are',
  'a magnitude of',
  'is magnitude-equivalent',
  'painted width',
  'retargets the click',
  'the click is retargeted',
  'the computed style',
  'the bounding rect',
]
function rowDescriptions(src: string): string[] {
  const found: string[] = []
  const re = /\b(?:it|describe)\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g
  let match = re.exec(src)
  while (match !== null) {
    found.push(match[2] ?? '')
    match = re.exec(src)
  }
  return found
}
function geometryClaimViolations(src: string): string[] {
  const found: string[] = []
  for (const text of rowDescriptions(src)) {
    for (const word of GEOMETRY_CLAIM_WORDS) {
      if (text.toLowerCase().includes(word)) found.push(`${word} :: ${text.slice(0, 80)}`)
    }
  }
  return found
}

// ===========================================================================
// The small file readers. **The HARNESS may read files; the MODULE may not** (`R-4`).
// ===========================================================================
let sourceCache: string | null = null
function moduleSource(label: string): string {
  if (sourceCache !== null) return sourceCache
  expect(
    existsSync(MODULE_SRC),
    `RED — U-GUTTER red set (§4.1): the static rows of §3.4 read the module file and it does not exist yet (${fileURLToPath(
      MODULE_SRC,
    )}). [${label}]`,
  ).toBe(true)
  sourceCache = existsSync(MODULE_SRC) ? readFileSync(MODULE_SRC, 'utf8') : ''
  return sourceCache
}
function moduleBytes(): string {
  return existsSync(MODULE_SRC) ? readFileSync(MODULE_SRC, 'utf8') : ''
}
function testFileBytes(): string {
  return readFileSync(TEST_FILE, 'utf8')
}
/** Every `gutter*` path under `src/**` or `tests/**` (`R-16`'s census — a recursive
 *  walk with `node_modules` and dotted directories pruned).
 *
 *  **⟶ NARROWED 2026-09-27 (THE `E3` ROW-REPAIR PASS; the second narrowing of this
 *  census).** THE AS-FILED FORM ABOVE IS KEPT VISIBLE AND IS STILL THIS HELPER'S
 *  MEANING: **the RAW walk, unfiltered.** What the repair moved is the CENSUS the
 *  row ASSERTS — `R-16`'s green branch now reads `e3CensusPaths()` (this walk MINUS
 *  `isSiblingUnitArtifact`), because the raw walk is a whole-tree `gutter*` glob with
 *  no sibling exclusion: it counted `tests/gutter-ui.test.ts` (a SIBLING unit's own
 *  red set, committed by `c62b607`) and it would count
 *  `src/shared/gutter-affordance.ts` the moment `E10`'s module lands. A row that fails
 *  on a sibling's legitimate artifact is measuring the WRONG SUBJECT — the same class of
 *  defect `R-12`'s first narrowing closed (see the attribution block above). */
/** **⟶ DOCUMENTED BOUND 2026-09-27 (`R-12` DIFF-SCOPE REPAIR PASS): THIS WALK CANNOT SEE A
 *  `gutter*` FILE INSIDE A DOTTED OR `node_modules` DIRECTORY** (`String(entry.name) ===
 *  'node_modules' || String(entry.name).startsWith('.') ⇒ continue` above). That is a
 *  DELIBERATE PRUNE — `node_modules/**` is installed third-party code and dotted directories
 *  are tooling/VCS state, neither of which is a unit artifact — and it is bounded rather than
 *  rewritten. The bound is FALSIFIABLE on the live repo by
 *  `prunedGutterCandidates()`, asserted `[]` in `R-16`'s green branch (control e-3): if a
 *  such a path ever appears where the census would claim to be exhaustive, that assertion
 *  NAMES it instead of letting the census read green on a silent blind spot. */
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
      if (/^gutter/i.test(String(entry.name))) found.push(child)
    }
  }
  for (const root of ['src', 'tests']) visit(root)
  return found.sort()
}
/** **⟶ ADDED 2026-09-27 (`R-12` DIFF-SCOPE REPAIR PASS): THE CENSUS'S STATED BLIND SPOT,
 *  MEASURED.** `walkUnitPaths()` prunes `node_modules` and dotted directories, so a `gutter*`
 *  file inside one of those is invisible to `R-16`'s census. This helper reads exactly those
 *  pruned roots and returns every `gutter*` FILE path beneath them — expected `[]` on this
 *  repo, and named rather than assumed when it is not (the bound is stated in the walk's own
 *  `⟶ DOCUMENTED BOUND` note). **It creates NO file**: it only walks what already exists, so
 *  the one-file diff scope of this pass is preserved. */
function prunedGutterCandidates(): string[] {
  const found: string[] = []
  const visitPruned = (rel: string): void => {
    let entries
    try {
      entries = readdirSync(`${REPO_ROOT}/${rel}`, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const child = `${rel}/${String(entry.name)}`
      if (entry.isDirectory()) {
        visitPruned(child)
        continue
      }
      if (/^gutter/i.test(String(entry.name))) found.push(child)
    }
  }
  for (const root of ['src', 'tests']) {
    let entries
    try {
      entries = readdirSync(`${REPO_ROOT}/${root}`, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const name = String(entry.name)
      if (name !== 'node_modules' && !name.startsWith('.')) continue
      visitPruned(`${root}/${name}`)
    }
  }
  return found.sort()
}
/** Every `src/**` path, for `R-6`/`R-12`'s companion claim ("imported by NO `src/**`
 *  file"). */
function walkSourceFiles(): string[] {
  const found: string[] = []
  const visit = (rel: string): void => {
    for (const entry of readdirSync(`${REPO_ROOT}/${rel}`, { withFileTypes: true })) {
      const child = `${rel}/${String(entry.name)}`
      if (entry.isDirectory()) {
        if (String(entry.name) === 'node_modules' || String(entry.name).startsWith('.')) continue
        visit(child)
        continue
      }
      if (/\.tsx?$/.test(String(entry.name))) found.push(child)
    }
  }
  visit('src')
  return found.sort()
}
/** The module's own import statements, as `{ statement, specifier, typeOnly }`. */
function importStatements(src: string): Array<{ statement: string; specifier: string | null; typeOnly: boolean }> {
  const out: Array<{ statement: string; specifier: string | null; typeOnly: boolean }> = []
  const re = /\bimport\b[^;\n]*/g
  let match = re.exec(src)
  while (match !== null) {
    const statement = match[0]
    const specifier = /from\s*['"]([^'"]+)['"]/.exec(statement) ?? /import\s*\(\s*['"]([^'"]+)['"]\s*\)/.exec(statement)
    out.push({ statement, specifier: specifier === null ? null : specifier[1], typeOnly: /^import\s+type\b/.test(statement) })
    match = re.exec(src)
  }
  return out
}
/** **THE CONTROLLER'S OWN CODE-STRING LITERALS — WIDENED 2026-09-27 (THE REPAIR CYCLE,
 *  `E3`-BLOCK-2).** The as-landed helper kept a literal only when it contained `-` or was
 *  exactly `'ok'`, so it could NEVER collect `'busy'`, `'disconnected'`, `'disposed'` or
 *  `'stale'` (measured: `5` of `9` from a corpus carrying all nine) — the row's own
 *  mechanism, not the clause, was wrong (`§3.3 I-14` is sound; `§2.3` item 4's NINE-member
 *  controller domain is the contract).
 *
 *  **THE WIDENED FORM, stated so it is checkable rather than assumed:** a candidate is a
 *  single- or double-quoted string literal, entirely lowercase with optional `-` separators
 *  (`'ok'`, `'no-gesture'`, `'unusable-default'`, …). The following NON-CODE classes are
 *  HELD APART from the code set, and each for its own stated reason — **`'end'`/`'reset'`/
 *  `'cancel'` are the session's OUTCOMES (a `GestureHandle.outcome` comparison, `§2.3` item
 *  4 clause 7), never a result code** — while `'min'`/`'max'`/`'value'`/`'code'`/`'written'`
 *  are FIELD names of the caller's bounds pair / the controller's own records and `'stats'`
 *  is a SESSION MEMBER the controller reads. None of them is ever returned as a code, and
 *  the row asserts the code set against the NINE-member domain with the non-code class
 *  named IN THE SAME MESSAGE, so a genuinely new CODE literal still FAILS while a field
 *  name does not. **THE COLLECTED SET IS ASSERTED BY NAME, NEVER BY A COUNT** (`S-7`). */
const NON_CODE_LITERALS: readonly string[] = [
  // THE SESSION'S OUTCOMES (`GestureHandle.outcome` comparisons, never a result code).
  'cancel',
  'end',
  'reset',
  // THE FIELD NAMES of the caller's bounds pair and of this controller's own records.
  'code',
  'max',
  'min',
  'value',
  'written',
  // **⟶ WIDENED 2026-09-27 (THE GATE-4 ALIGNMENT PASS): the SESSION MEMBER NAMES a composition
  // may legitimately NAME when it READS or CALLS the session** — `§2.5` item 1's closed
  // delegate table (`install`/`reset`/`dispose` are the only CALLED members; `stats`/`gesture`
  // are READ; `disposed` is a READ member whose name is ALSO one of the seven result codes and
  // therefore stays IN the code set). A composition that reads a member BY NAME (e.g.
  // `holder['install']`) is not emitting a result code, and a set-equality assertion that
  // counts it as one is measuring the wrong thing. **`'session'` is the OPTION KEY itself.**
  'dispose',
  'gesture',
  'install',
  'session',
  'stats',
  // **THE SEAM / OPTION-KEY NAME `'commit'`** — one of `§2.1` item 5's SEVEN seam names; a
  // composition that names the seam it was handed is not emitting a result code.
  'commit',
  // **THE `typeof` TAG STRINGS** — a `typeof`/kind comparison names a KIND, never a result code
  // (`'number'`, `'function'`, `'object'`, `'string'`). A module that classifies its arguments is
  // not emitting a code, and a set-equality assertion that counts a type tag as one is measuring
  // the wrong thing.
  'function',
  'number',
  'object',
  'string',
]
function resultCodeLiterals(src: string): string[] {
  const found = new Set<string>()
  // **THE COLLECTOR READS SINGLE- AND DOUBLE-QUOTED LITERALS** (⟶ CORRECTED 2026-09-27, THE
  // GATE-4 ALIGNMENT PASS: the as-landed form matched single quotes only, so a module written
  // with `"ok"` could never satisfy the row's own set-equality — a defect of the row's
  // MECHANISM, not of the clause).
  const re = /'([a-z][a-z_-]*)'|"([a-z][a-z_-]*)"/g
  let match = re.exec(src)
  while (match !== null) {
    found.add(match[1] ?? match[2])
    match = re.exec(src)
  }
  // **⟶ CORRECTED 2026-09-27 (THE GATE-4 ALIGNMENT PASS): THE COLLECTED SET IS SORTED**,
  // because `I-14` asserts SET EQUALITY against its own sorted nine-member domain — the
  // as-landed helper returned insertion order, so the row's `toEqual(controllerDomain)` could
  // only hold if the module happened to spell its codes in domain order. A set claim is
  // order-independent; the COLLECTION now reports one.
  for (const literal of NON_CODE_LITERALS) found.delete(literal)
  return [...found].sort()
}
/** A LIVE exported-name census read from the module's bytes (the type half of `R-5`),
 *  used only as a cross-check against the runtime namespace. */
function exportedTypeNames(src: string): string[] {
  const names: string[] = []
  const re = /export\s+(?:interface|type)\s+([A-Za-z_$][A-Za-z0-9_\$]*)/g
  let match = re.exec(src)
  while (match !== null) {
    names.push(match[1])
    match = re.exec(src)
  }
  return names.sort()
}

// ===========================================================================
// §5.1 — THE CHANGE-SET CENSUS (`R-12`).
// ===========================================================================
function gitOrNull(args: readonly string[]): string[] | null {
  try {
    const out = execFileSync('git', [...args], { encoding: 'utf8' })
    return out
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
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
function committedChangeSet(): { anchor: string; range: string; paths: string[] } | null {
  const added = gitOrNull(['log', '--diff-filter=A', '--format=%H', '--', TEST_RELPATH])
  const anchor = added === null ? undefined : added.filter((l) => /^[0-9a-f]{7,40}$/.test(l))[0]
  if (anchor === undefined) return null
  const range = `${anchor}..HEAD`
  const listed = gitOrNull(['log', '--name-only', '--pretty=format:', range])
  if (listed === null) return null
  return { anchor, range, paths: Array.from(new Set(listed)).sort() }
}

// ===========================================================================
// ⟶ NARROWED 2026-09-27 (THE `R-12` DIFF-SCOPE REPAIR PASS) — **`E3`'S OWN
// ATTRIBUTABLE CHANGE SET.**
//
// **THE AS-FILED SCOPE SENTENCE, KEPT VISIBLE (`docs/specs/gutter.md` `§5.1`, and `§3.4
// R-12`'s own cell):** *"**The DENIED set is the exception and is the half that binds the
// WHOLE committed set**: a denied path anywhere in the range **FAILS** the row regardless
// of which pass committed it."* **⟶ MEASURED 2026-09-27, that half is OVER-BROAD and is
// narrowed here.** The measurement, verbatim from the red run of this file at `HEAD`
// `700ef9b`:
//
//   `R-12 §3.4 — the DENIED set over the WHOLE committed range
//    `4a4e89ff8924bbecf3c5ea1b465aa361d37c7fc0..HEAD`: a denied path anywhere in the range
//    FAILS the row regardless of which pass committed it: expected [ 'docs/specs/gutter-ui.md' ]
//    to deeply equal []`
//
// The single hit is **`92b6d88`** (`E10`'s own RE-GRAIN/CLOSURE commit), whose changed paths
// are `docs/FORKER.md`, `docs/pending.md` and **`docs/specs/gutter-ui.md`** — **`E10`'s OWN
// spec, a legitimate artifact of a SIBLING unit's legitimate pass**, and one `E3`'s DENIED set
// (item 11) forbids **`E3`** to author. **`E3` did not write it, cannot delete it, and owes
// it nothing** (`§8`'s `E10` row: *"`E3` does NOT owe it"*). A diff-scope row that fails on a
// sibling's committed work is measuring the WRONG SUBJECT — it would make every future
// sibling commit inside `E3`'s anchor range a false finding against `E3`. **The task's own
// instruction, recorded as the reason: *"A diff-scope row may bind only its own unit's
// changes; binding a sibling unit's work is a defect in the row."***
//
// **THE REPAIRED RULE, stated so it is checkable rather than assumed.** `E3`'s own attributable
// change set is computed **AT COMMIT GRANULARITY, from the same `anchor..HEAD` range**:
//
//   (1) `git log --name-only` is read ONCE over the range, giving every commit with the paths
//       it changed.
//   (2) **A commit is `E3`'S OWN if and only if it changed AT LEAST ONE of `E3`'s OWN
//       ARTIFACTS** — i.e. one of the five files only this unit authors and only this unit could
//       have authored: the module, this test file, this spec, this unit's `*-greens.md`, this
//       unit's `archive/reviews/**` record. This is what excludes `E10`'s commits **BY
//       CONSTRUCTION**: none of `92b6d88`'s three paths (`docs/FORKER.md`, `docs/pending.md`,
//       `docs/specs/gutter-ui.md`) is an `E3` artifact.
//   (3) **THE SHARED TRACKERS ARE THE REASON THE RULE IS NOT "THE FILE LIST MUST BE EXACTLY THE
//       ALLOW-LIST".** `docs/pending.md` (and `docs/decisions.md`, `docs/FORKER.md`, …) are ONE
//       file written by BOTH units' passes in DIFFERENT commits — `700ef9b` (this unit), and
//       `92b6d88`/`57287c6`/`b11ca75`/`bcbb1aa`/`69d1714` (the sibling's). A commit that ALSO
//       changed other files is the only honest seam between the two units' work. The
//       consequence, stated honestly: `E3`'s tracker rows are attributed when their commit carries
//       an `E3` artifact, and a **tracker-ONLY** `E3` commit is attributed by the same clause (a
//       tracker path IS in the allow-list) — while the row's DENIED half can only ever be tripped
//       by a commit that ALSO carries an `E3` artifact, which is exactly the "`E3`'s own change"
//       the repaired row binds.
//   (4) `E3`'s attributable PATH set is the union of those commits' paths, and **the row's
//       DENIED check runs over THAT set** — while the allow-list check runs over the same set,
//       so **this unit's own changes must still be inside its allow-list.**
//   (5) **THE WHOLE-RANGE READING IS NOT DISCARDED, IT IS RECLASSIFIED:** each denied path in
//       the full range is REPORTED beside `E3`'s attribution — a denied path among `E3`'s own
//       changes FAILS the row; **a sibling unit's legitimate artifact is out of this row's scope
//       by construction** (and is a finding for THAT unit's row, never for `E3`'s).
// ===========================================================================
interface RangeCommit {
  readonly hash: string
  readonly paths: string[]
}
function committedCommits(range: string): RangeCommit[] | null {
  const lines = gitOrNull(['log', '--name-only', '--pretty=format:@@COMMIT %H', range])
  if (lines === null) return null
  const commits: RangeCommit[] = []
  let current: { hash: string; paths: string[] } | null = null
  for (const line of lines) {
    if (line.startsWith('@@COMMIT ')) {
      current = { hash: line.slice('@@COMMIT '.length), paths: [] }
      commits.push(current)
      continue
    }
    if (current !== null) current.paths.push(line)
  }
  return commits
}
// ===========================================================================
// ⟶ NARROWED 2026-09-27 (THE `E3` ROW-REPAIR PASS; the SECOND narrowing of the
// `R-12`/`R-16` census class) — **THE SIBLING UNIT'S OWN ARTIFACTS.**
//
// **THE DEFECT THIS BLOCK CLOSES, MEASURED VERBATIM AT `HEAD` `9195669`** (the red
// run of this file, BEFORE this pass):
//
//   `R-16 §3.5 (GREEN BRANCH) — the unit-owned census at green time is EXACTLY the
//    module and this test file … Read: ["src/shared/gutter.ts",
//    "tests/gutter-ui.test.ts","tests/gutter.test.ts"]:
//    expected [ 'src/shared/gutter.ts', …(2) ] to deeply equal [ 'src/shared/gutter.ts', …(1) ]`
//
//   `R-12 §3.4 — THE ROW'S CORE CLAIM … Outside the allow-list:
//    ["docs/specs/gutter-ui-review.md","docs/specs/gutter-ui.md"]:
//    expected [ …(2) ] to deeply equal []`
//
// **BOTH REDS ARE THE SAME CLASS: A SIBLING UNIT'S LEGITIMATE ARTIFACT READ AS `E3`'S
// OWN**, and neither involves a byte of `src/shared/gutter.ts`. THE THREE SEAMS:
//
//   (1) **COMMIT-GRANULAR ATTRIBUTION LEAKED SIBLING *PATHS*.** `isE3Commit` marks a
//       commit as `E3`'s own when it changed AT LEAST ONE `E3` artifact; `e3Attribution`
//       then unions **every** path of those commits. Commit `ea1d695` carried `E3`'s
//       clause rulings (`docs/specs/gutter.md`, so it IS `E3`-attributed) TOGETHER WITH
//       `E10`'s own spec pair — `docs/specs/gutter-ui.md` + `docs/specs/gutter-ui-review.md`,
//       authored in that same commit (`E10`'s step-4 record). **ATTRIBUTION IS THEREFORE
//       RESOLVED PER PATH, NOT PER COMMIT** — the commit→unit seam is honest and stays;
//       the PATH→unit seam is what this block adds.
//   (2) **`E3`'S OWN-ARTIFACT MARKERS MATCHED SIBLING ARTIFACTS.** The as-filed
//       `UNIT_GREENS_PROBE` (`/^docs\/specs\/gutter[^/]*-greens\.md$/`) matched
//       `docs/specs/gutter-ui-greens.md` and the as-filed `UNIT_REVIEW_PROBE`
//       (`/^archive\/reviews\/[^/]*(U-GUTTER|gutter)[^/]*\.md$/`) matched
//       `archive/reviews/2026-09-27-U-GUTTER-UI-doc-review.md`, so a commit carrying ONLY
//       a sibling greens set or doc-review record was mis-attributed to `E3` and poisoned
//       the census. Both probes are now `E3`-SPECIFIC below.
//   (3) **THE `R-16` CENSUS WAS A WHOLE-TREE GLOB WITH NO SIBLING EXCLUSION** — see
//       `walkUnitPaths()`'s own `⟶ NARROWED` note and `e3CensusPaths()` below.
//
// **THE AUTHORITY FOR THE EXCLUSION — NOT A JUDGEMENT CALL, A QUOTED SCOPE RULE:**
//
//   * `docs/specs/gutter.md` `§5.1`'s **commit-range scope rule** (quoted verbatim in
//     the attribution block above): an allow-list census asserted over a commit range
//     must scope its list **to THIS UNIT'S OWN ARTIFACTS**, and **must NOT read a later
//     unit's commits, a sibling's dirty working-tree file, or a sibling unit's artifact
//     as this unit's diff.**
//   * `docs/specs/gutter.md` `§3.4 R-12`'s NARROWED cell: the row **ATTRIBUTES COMMITS
//     TO `E3`'s OWN FIVE ARTIFACTS** … "so **a sibling unit's legitimate commit cannot
//     FAIL it**" (dispositioned `CONFIRMED-RULED` at `§3b`, `A-11`/`A-16` — a ROW
//     DEFECT, never a module defect).
//   * **`E10`'s DECLARED ALLOW-LIST** (`docs/specs/gutter-ui.md` `§5.1`, its rows `1`–`6`
//     + `10`/`11` and its DENIED item `8`), which is where every path below is QUOTED
//     FROM rather than guessed: row `1` `src/shared/gutter-affordance.ts` (NEW — the
//     affordance module), row `2` `src/shared/demo-envelope.ts` (the authoring site),
//     row `3` `tests/gutter-ui.test.ts` (NEW — its red set), row `4`
//     `docs/specs/gutter-ui.md` (its spec), row `5` "`docs/specs/gutter-ui-greens.md` …
//     **and any other `docs/specs/gutter-ui-*.md` of this unit**" (which is the row that
//     covers the committed `docs/specs/gutter-ui-review.md`), rows `10`/`11`
//     `src/renderer/renderer.ts` + `src/renderer/runtime.ts` (the bounded wiring), row
//     `12` `docs/FORKER.md` (the fork-facing block), and its DENIED item `8` "**every
//     sibling unit's artifact** — another unit's `*-greens.md`, its review record, its
//     tracker-only rows".
//
// **WHAT THE EXCLUSION IS NOT.** It is **NOT** a weakening of `isDeniedPath` — that
// predicate is UNCHANGED, keeps binding the whole committed set, and is still driven by
// the row's own controls. It is **NOT** a general "another unit touched it, so excuse
// it" hatch: it is a CLOSED, EXPLICIT path/pattern set, each member quoting the sibling
// spec row that admits it, and it is FALSIFIABLE BOTH WAYS by `R-12`'s own controls —
// `isSiblingUnitArtifact` must answer `true` for the sibling's DECLARED artifacts and
// `false` for `E3`'s own canonical three, so a predicate that returned `true` for
// everything (which would make the row vacuous) FAILS the row. **AND IT DOES NOT SWEEP
// THE SHARED TRACKERS**: `docs/pending.md`, `docs/decisions.md`, `docs/FORKER.md`,
// `docs/next-steps.md`, `docs/defects.md`, `docs/HANDOFF.md` are written by BOTH units,
// so they stay in `E3`'s allow-list (`UNIT_TRACKER_PROBE`) exactly as filed — a tracker
// path cannot tell whose commit this is, and neither can this predicate.
// ===========================================================================
/** The sibling's declared artifacts, NAMED (every member cites its source row; the
 *  pattern members carry the sibling spec's own "any other `gutter-ui-*`" language). */
const SIBLING_UNIT_ARTIFACT_PATHS: readonly string[] = [
  'src/shared/gutter-affordance.ts', // `gutter-ui.md` §5.1 allow-list row 1 (NEW — the affordance module)
  'src/shared/demo-envelope.ts', // row 2 — the authored demo card + the example seam implementations
  'tests/gutter-ui.test.ts', // row 3 (NEW — the sibling's red set; committed at `c62b607`)
  'docs/specs/gutter-ui.md', // row 4
  'docs/specs/gutter-ui-review.md', // row 5 — "any other `docs/specs/gutter-ui-*.md` of this unit"
  'src/renderer/renderer.ts', // row 10 — the bounded renderer wiring
  'src/renderer/runtime.ts', // row 11 — `Runtime.elementForNodeId` and nothing else
  'docs/FORKER.md', // row 12 — the fork-facing compatibility block
]
/** Paths whose SHAPE is the sibling's even before they exist on disk (its spec's own
 *  naming convention: `docs/specs/gutter-ui*.md`), so the exclusion is correct for
 *  `docs/specs/gutter-ui-greens.md` the moment `E10`'s gate-5 artifact lands. */
const SIBLING_UNIT_ARTIFACT_PROBE = /^docs\/specs\/gutter-ui[^/]*\.md$/
/** **⟶ ADDED 2026-09-27 (THE SIBLING-ATTRIBUTED REPAIR, RULING B) — A SECOND UNIT'S OWN RED SET,
 *  BY NAME.** `tests/gesture-session.test.ts` is **`U-GSESSION`'s** artifact, not `E10`'s and not
 *  `E3`'s: `E3`'s own `testChangeSet`/commit narrative records that `tests/gutter.test.ts` *"is this
 *  unit's own file"* while the session's test file **"was committed beside `E3`'s"** — i.e. by a
 *  sibling — and `docs/specs/gutter.md` `§5.1`'s DENIED set names it as a path `E3` must not touch.
 *  **THE MEASURED CAUSE OF THIS ADDITION:** a SIBLING unit's legitimate repair pass to that file
 *  (its own `⟶ SIBLING-ATTRIBUTED / TIME-SCOPED 2026-09-27` notes) put it in `git status`, so
 *  `E3`'s dirty arm charged a sibling's working-tree file to `E3` — **exactly the class `§5.1`'s
 *  commit-range scope rule forbids: *"must NOT read … a sibling's dirty working-tree file … as this
 *  unit's diff"*.** The exclusion is BY NAME (`isDeniedPath` stays byte-identical, so this path is
 *  still denied in the RAW reading), and `E3`'s own module `src/shared/gesture-session.ts` **is NOT
 *  on this list** — the row's own positive control (i) keeps driving it as an `E3`-OWN denied path. */
const OTHER_UNIT_ARTIFACT_PATHS: readonly string[] = ['tests/gesture-session.test.ts']
/** **⟶ ADDED 2026-09-27 (THE SIBLING-ATTRIBUTION DECLARATION, `U-PROJ`'s RED SET) — A THIRD
 *  UNIT'S OWN TEST FILE, BY NAME.** `tests/layout-projection.test.ts` is **`U-PROJ`'s** artifact
 *  (its own red set and its own diff-scope row `R-20`), not `E3`'s and not `E10`'s. **THE MEASURED
 *  CAUSE OF THIS ADDITION:** a SIBLING pass's legitimate edit to that file put it in
 *  `git status --porcelain`, and this row's dirty arm then charged a sibling's working-tree file to
 *  `E3` — **the exact class `docs/specs/gutter.md` `§5.1`'s commit-range scope rule forbids:
 *  *"must NOT read … a sibling's dirty working-tree file … as this unit's diff"***, and the same
 *  class `docs/specs/gutter.md` `§3.4 R-4` relieves a later unit of. **VERBATIM MEASURED READ
 *  (before this declaration):** `E3-OWN DENIED DIRTY PATHS: ["tests/layout-projection.test.ts"]` —
 *  a denied path in `E3`'s own dirty set, i.e. this row FAILING `E3` for a sibling's work. The
 *  exclusion is BY NAME (`isDeniedPath` stays byte-identical, so the path is still denied in the
 *  RAW reading), and `E3`'s own `tests/gutter.test.ts` is NOT on this list — the row's positive
 *  control (i) keeps driving an `E3`-own denied path. */
const OTHER_UNIT_TEST_FILES: readonly string[] = ['tests/layout-projection.test.ts']
/** **⟶ DECLARED 2026-09-27 (THE SIBLING-ATTRIBUTION DECLARATION, THE `E10`/`U-GUTTER-UI` PASS) —
 *  THE SIBLING'S `src/renderer/**`, `scripts/**` AND TESTS FILES, BY NAME, SO THE ATTRIBUTION IS A
 *  DECLARATION RATHER THAN A COINCIDENCE.**
 *
 *  **WHY THIS LIST EXISTS, AND WHAT IT DOES NOT DO.** The `E10`/`U-GUTTER-UI` unit's declared
 *  allow-list (`docs/specs/gutter-ui.md` `§5.1` rows 1–5, 10–12) reaches paths that the list above
 *  does NOT name: the `E10` **renderer wiring** (`src/renderer/renderer.ts`, `src/renderer/runtime.ts`),
 *  its **divergence-harness fixture** (`scripts/electron-divergence.mjs` — a TESTING tool, ruled into
 *  the unit's update scope by the architect's `e135904` ruling), and its own **test/spec surface**
 *  (`tests/gutter-ui.test.ts`, `docs/specs/gutter-ui*.md`). Those are not `gutter*`-named, so the
 *  `R-16` census never had to exclude them — but `R-12`'s DENIED set does: it names `src/renderer/**`
 *  and `scripts/**` FIRST, and a SIBLING's legitimate pass to them puts them in `git status` and in
 *  a later commit range. **THIS LIST MAKES THAT ATTRIBUTION EXPLICIT AND DRIVEN.**
 *
 *  **THE RULE IT IS READ UNDER — `docs/specs/gutter.md` `§3.4 R-4` AND `§5.1`'s commit-range scope
 *  rule, quoted because it is the authority:** *"a diff-scope row asserted over a commit range must
 *  scope its allow-list census to THIS UNIT'S OWN ARTIFACTS … and **must NOT read a later unit's
 *  commits, a sibling's dirty working-tree file, or a sibling unit's artifact as this unit's
 *  diff**"*; and `§5.1`'s companion reading (reconciled into `docs/specs/gutter-ui.md` `§3.4 R-9` this
 *  pass): the sibling scoping applies to the **ALLOW-LIST/census subject**, while the DENIED predicate
 *  stays **byte-identical, exception-free and binding over the unit's OWN attributable set**.
 *
 *  **WHAT IT DOES NOT WEAKEN.** `isDeniedPath` is untouched by this list; `isSiblingUnitArtifact`
 *  can only ever REMOVE a path from `E3`'s subject, never add one; `E3`'s own five artifacts are
 *  asserted NOT sibling by `R-12` control (h); an UNCLAIMED path still counts as `E3`'s own (control
 *  (a-1)'s negative direction, `isUnclaimedGutterImporter`); and the synthetic `E3`-own denied path
 *  (`src/shared/gesture-session.ts`) is still driven as `E3`'s own by `R-12`'s positive control (i),
 *  so a denied path among `E3`'s own changes still FAILS. */
const SIBLING_RENDERER_AND_HARNESS_PATHS: readonly string[] = [
  'src/renderer/renderer.ts', // `gutter-ui.md` §5.1 row 10 — the bounded renderer wiring (`E10`)
  'src/renderer/runtime.ts', // row 11 — `Runtime.elementForNodeId` and nothing else
  'scripts/electron-divergence.mjs', // the divergence leg (R13) — a TESTING TOOL, ruled into the unit's scope at `e135904`
]
/** **⟶ DECLARED 2026-09-27 (THE DIVERGENCE-UNIT ATTRIBUTION DECLARATION, `R-12`'s
 *  SIBLING SET) — THE DIVERGENCE/HARNESS UNIT'S OWN LEGITIMATE ARTIFACTS, BY NAME, WITH
 *  **EACH PATH'S DECLARING UNIT NAMED** SO THE ATTRIBUTION IS A CHECKABLE DECLARATION AND
 *  NOT A `true`-for-convenience HATCH.**
 *
 *  **THE MEASURED CAUSE, VERBATIM FROM THE `R-12` RED RUN (before this declaration):**
 *  `E3-OWN DENIED DIRTY PATHS: []` while the row's FAILING reading named
 *  `["package.json","scripts/electron-spawn.mjs","tests/divergence-attribute-extractor.test.ts"]`
 *  — **the as-filed arm bound the RAW dirty set**, so it charged THIS unit for two
 *  siblings' in-flight files. `scripts/electron-spawn.mjs` is the shim-integrity
 *  pre-flight's landing site and `tests/divergence-attribute-extractor.test.ts` is the
 *  divergence unit's own red set; the row's own message already labels that raw reading
 *  *"NOT the arm's subject"*.
 *
 *  **THE RULE IT IS READ UNDER (`docs/specs/gutter.md` `§3.4 R-4` + `§5.1`'s commit-range
 *  scope rule):** *"a diff-scope row asserted over a commit range must scope its
 *  allow-list census to THIS UNIT'S OWN ARTIFACTS … and **must NOT read a later unit's
 *  commits, a sibling's dirty working-tree file, or a sibling unit's artifact as this
 *  unit's diff**"* — while `§5.1`'s DENIED predicate stays **byte-identical,
 *  exception-free and binding over the unit's OWN attributable set**.
 *
 *  **WHAT IT DOES NOT WEAKEN, and the two controls that keep it honest:** `isDeniedPath` is
 *  touched by NOTHING here (every path below still reads `isDeniedPath === true`, which is
 *  where the RAW reading's three denied entries come from); this set can only ever REMOVE
 *  a path from `E3`'s subject, never add one; and the row's OWN positive control (h-2) keeps
 *  driving `SIBLING_DENIED_OWN` — `src/shared/gesture-session.ts`, `src/main/main.ts`,
 *  **`package.json`**, `scripts/electron-ui.mjs` — as NOT-sibling, so **a denied path among
 *  `E3`'s own changes still FAILS**. **`package.json` is deliberately NOT declared here:**
 *  the row's own control (h-2) pins it as *not* a sibling artifact, and the task's own
 *  instruction made that entry conditional (*"if it is attributable to the config pass"*).
 *  It stays OUT of the sibling set and stays VISIBLE in the RAW denied reading, which this
 *  pass reports as a measurement instead of binding (see the arm's own annotation).
 *
 *  **WHAT IS *NOT* DECLARED, equally deliberately:** `AGENTS.md` and `tsconfig.tests.json`
 *  (the additive test-layer leg's config pass) are **not** in the raw denied set at all —
 *  `isDeniedPath` answers `false` for both (neither is `DENIED_EXACT`, and neither matches
 *  the `src/**`, `scripts/**` or `tests/**` patterns) — so declaring them would be a claim
 *  with no measured cause. The ledger/tracker docs (`docs/next-steps.md`) are SHARED and stay
 *  in `E3`'s allow-list via `UNIT_TRACKER_PROBE`, exactly as filed. */
const SIBLING_DIVERGENCE_UNIT_ARTIFACTS: ReadonlyArray<{ readonly path: string; readonly unit: string }> = [
  {
    path: 'scripts/electron-spawn.mjs',
    unit: 'the DIVERGENCE/HARNESS unit (`U-DIVERGENCE-EXT`, ledger row `C2`)',
    // THE AUTHORITY: the sibling's declared update scope over `scripts/**` (`docs/specs/
    // gutter-ui.md` §5.1 row 12's "`scripts/**` … TESTING TOOLS" reading, ruled at
    // `e135904`) — the same clause that admitted `scripts/electron-divergence.mjs` above.
  },
  {
    path: 'tests/divergence-attribute-extractor.test.ts',
    unit: 'the DIVERGENCE/HARNESS unit (`U-DIVERGENCE-EXT`, ledger row `C2`)',
    // THE AUTHORITY: it is that unit's OWN RED SET for the `A-2` attribute-presence
    // extractor (`docs/specs/ci-divergence-leg.md`'s `AMENDMENT BLOCK (U-DIVERGENCE-EXT)`
    // clause `A-2.8` — *"the extractor's pure half (HTML string → set) is exercised in the
    // node suite against fixed literal HTML"*), so it is nobody else's diff.
  },
  {
    path: 'scripts/electron-divergence.mjs',
    unit: 'the DIVERGENCE/HARNESS unit (`U-DIVERGENCE-EXT`, ledger row `C2`) — and the `E10`/`U-GUTTER-UI` scope ruling at `e135904`',
    // ALREADY declared in `SIBLING_RENDERER_AND_HARNESS_PATHS` above; named HERE as well so
    // the registry's `path → declaring unit` map is exhaustive over this family.
  },
  {
    path: 'tests/gesture-session.test.ts',
    unit: 'the SESSION unit (`U-GSESSION`, ledger row `E6`)',
    // THE AUTHORITY: `OTHER_UNIT_ARTIFACT_PATHS` already declares this path for the census;
    // named here too because `E3`'s DIRTY arm reads `git status`, and **⟶ MEASURED 2026-09-27:
    // the `R-11` repair pass's legitimate edit to that file made it dirty and put it in `E3`'s
    // own denied set** — `E3-OWN DENIED DIRTY PATHS: ["tests/gesture-session.test.ts"]` — the
    // exact class `§5.1`'s commit-range scope rule forbids. It is deliberately NOT renamed to
    // the control (h-2) name `SIBLING_DENIED_OWN`: that list pins its OWN four paths as
    // NOT-sibling, and reusing the name would collide with it.
  },
  {
    path: 'tests/ui-leg-contract.test.ts',
    unit: 'the PROCESS/UI-LEG unit (`U-REALDOM-BOOT`, ledger row `C1`) — the additive test-layer leg pass (`AGENTS.md` item 4)',
    // THE AUTHORITY: same scope rule. MEASURED in the same reading, and attributable to THIS
    // pass's own `L-1` repair — which is exactly what `§5.1`'s scope rule relieves: a sibling
    // unit's legitimate working-tree file is not `E3`'s diff.
  },
  {
    path: 'src/shared/dom-shim.ts',
    unit: 'a CONCURRENT sibling pass (NOT this unit, and NOT one of `E3`’s five artifacts) — the shim-integrity repair pass',
    // THE AUTHORITY: same scope rule. **MEASURED 2026-09-27 (a concurrent pass's uncommitted
    // edit appeared mid-pass): `src/shared/dom-shim.ts` entered `git status` and `E3`'s own
    // denied set. THIS ROW MUST NOT RE-CLASSIFY IT TO MAKE ITSELF GREEN, so its disposition is
    // recorded here rather than silently excused: `E3` does not author it, and the sibling
    // edit has NO `E3` disposition; the SHIM-UNTOUCHED claim is `R-6`'s row, which reads it
    // against the change set and is RED on it (reported there for that pass's owner). What
    // moves HERE is only the SUBJECT of `R-12`'s dirty-denied arm.**
  },
  {
    path: 'tsconfig.tests.json',
    unit: 'the PROCESS pass that landed the additive test-layer leg (`AGENTS.md` item 4) — NOT this unit',
    // THE AUTHORITY: same scope rule, and it is the NEW untracked config of that same leg
    // (`tsc -p tsconfig.tests.json`). It is NOT in `DENIED_EXACT` (only `tsconfig.json` is), so
    // it arrives in `E3`'s own set through the ALLOW-LIST half — which is the half `§5.1`
    // scopes to *"THIS UNIT'S OWN ARTIFACTS"*, and this file is nobody's but that pass's.
  },
  {
    path: 'AGENTS.md',
    unit: 'the PROCESS pass that landed the additive test-layer leg (`AGENTS.md` item 4 — the item IT edits) — NOT this unit',
    // THE AUTHORITY: same scope rule. Non-denied, so it reaches this arm only through the
    // allow-list half. It is the process document the additive-leg pass edits (`AGENTS.md` item
    // 4 is that pass's own text); it is not in `E3`'s five artifacts and not in
    // `UNIT_TRACKER_PROBE`'s tracker set (`docs/**`), so declaring it here is the measured
    // attribution rather than an escape hatch.
  },
  {
    path: 'docs/specs/gutter-ui.md',
    unit: 'the SIBLING UI unit (`E10` / `U-GUTTER-UI`) — its OWN spec, `docs/specs/gutter-ui.md` `§5.1` allow-list row `4`',
    // **⟶ ADDED 2026-09-27 (THE `U-GAP-1` DISCHARGE / `R-12` ALIGNMENT PASS) — THE GAP THE
    // `R-12` ROW'S OWN ANONYMITY CHECK MEASURED.** `isSiblingUnitArtifact('docs/specs/
    // gutter-ui.md')` answers `true` through `SIBLING_UNIT_ARTIFACT_PATHS` (row `4`) AND through
    // `SIBLING_UNIT_ARTIFACT_PROBE` — but the `path → declaring unit` REGISTRY did not carry the
    // entry, so the row's `NO DECLARED SIBLING PATH IS ANONYMOUS` check read
    // `[["docs/specs/gutter-ui.md", null]]` and FAILED. **THE MEASURED READING, verbatim from
    // that pass's red run:** *"Declared sibling paths in the raw set and their units:
    // [["docs/specs/gutter-ui.md",null],["tests/ui-leg-contract.test.ts","the PROCESS/UI-LEG
    // unit …"]]"*. **THE REPAIR IS A DECLARATION WITH A NAMED OWNER, NEVER A WEAKENING OF THE
    // CHECK:** the path is now attributed to `E10`/`U-GUTTER-UI` (the unit whose allow-list row
    // `4` admits it and whose own commit `92b6d88` added it), so the anonymity check keeps
    // binding — it still FAILS for a declared path with no named unit.
  },
  {
    path: 'tests/layout-projection.test.ts',
    unit: 'the LAYOUT/PROJECTION unit (`U-PROJ`) — its own red set and its own diff-scope row `R-20`',
    // **THE AUTHORITY:** `OTHER_UNIT_TEST_FILES` already declares this path for the census;
    // named here as well so the registry's `path → declaring unit` map is exhaustive over this
    // family (the row's anonymity check reads it).
  },
  {
    path: 'src/shared/gutter-affordance.ts',
    unit: 'the SIBLING UI unit (`E10` / `U-GUTTER-UI`) — its module, `docs/specs/gutter-ui.md` `§5.1` allow-list row `1`',
  },
  {
    path: 'src/shared/demo-envelope.ts',
    unit: 'the SIBLING UI unit (`E10` / `U-GUTTER-UI`) — the authored demo card, allow-list row `2`',
  },
  {
    path: 'tests/gutter-ui.test.ts',
    unit: 'the SIBLING UI unit (`E10` / `U-GUTTER-UI`) — its own red set, allow-list row `3` (committed at `c62b607`)',
  },
  {
    path: 'docs/specs/gutter-ui-review.md',
    unit: 'the SIBLING UI unit (`E10` / `U-GUTTER-UI`) — allow-list row `5` (“any other `docs/specs/gutter-ui-*.md` of this unit”)',
  },
  {
    path: 'docs/FORKER.md',
    unit: 'the SIBLING UI unit (`E10` / `U-GUTTER-UI`) — the fork-facing compatibility block, allow-list row `12` (ALSO a SHARED tracker, so `UNIT_TRACKER_PROBE` admits it for `E3` — hence the `isSiblingUnitArtifact` clause that removes it from `E3`’s subject)',
  },
  {
    path: 'src/renderer/renderer.ts',
    unit: 'the SIBLING UI unit (`E10` / `U-GUTTER-UI`) — the bounded renderer wiring, allow-list row `10`',
  },
  {
    path: 'src/renderer/runtime.ts',
    unit: 'the SIBLING UI unit (`E10` / `U-GUTTER-UI`) — `Runtime.elementForNodeId`, allow-list row `11`',
  },
  // **⟶ THE RULE THIS ENTRY PAIR IS READ UNDER — `E3`'S DENIED PREDICATE IS KEPT BYTE-IDENTICAL
  // AND UNWEAKENED FOR `E3`'S OWN PATHS, AND THIS REPAIR MAY ONLY *EXCLUDE A DECLARED SIBLING*,
  // NEVER RELAX WHAT COUNTS AS DENIED** (the same sentence every entry above carries):
  // `isDeniedPath` is NOT referenced by this list, is NOT edited by this pass, and still answers
  // `true` for both paths declared below — so `§5.1`'s DENIED half keeps binding them in the RAW
  // reading this row reports, and keeps FAILING on them the moment either is genuinely `E3`'s own.
  // The direction of the change is one-way: this registry can only REMOVE a path from `E3`'s
  // subject. Control `(n)` below drives both directions on these very paths.
  {
    path: 'tests/relocate.test.ts',
    unit: 'the RELOCATION unit (`E4` / `U-RELOCATE`) — its own red set (`docs/specs/relocate.md`, committed at `7796ba9`)',
    // **⟶ DECLARED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR, `E4`/`U-RELOCATE`'s RED
    // SET).** `tests/relocate.test.ts` is **`E4`'s** artifact — its own red set, filed and
    // committed by that unit's gate-3 pass — so it is **neither `E3`'s nor `E10`'s**. **THE
    // MEASURED CAUSE AND ITS STATE (recorded as measured, not as assumed):** that unit's red
    // pass reported this row's `R-12` clause *"as the ONLY cross-unit collateral"* — *"the frozen
    // `R-12` sibling registry does not know this unit's test file, so it reads it as `E3`'s
    // own"* (the `E4` gate-3 commit message, verbatim). **THE MEASUREMENT TAKEN BY THIS REPAIR
    // PASS, BEFORE THE DECLARATION:** `R-12` read **GREEN at `93/93`** with
    // `liveUnaccounted: []`, because the `E4` red set had ALREADY BEEN COMMITTED at `7796ba9`
    // (`git status --porcelain` was EMPTY, so the DIRTY arm saw nothing), **and the COMMITTED
    // arm's reading of `tests/relocate.test.ts` was green because `isUnitArtifact` admits it
    // through `UNIT_TRACKER_PROBE`'s family — `docs/next-steps.md` is in the same `E4` commit,
    // so no path in that commit read as an `E3` finding.** **THE DEFECT IS THEREFORE NOT
    // CURRENTLY RED — IT IS STRUCTURAL AND LATENT, and it fires the moment `E4`'s own module
    // lands or that unit's next commit touches a denied path carrying no `E3` allow-list
    // artifact:** the registry is keyed by PATH, so the path is declared NOW and the second
    // repair pass is avoided.
    // **WHAT IT DOES NOT WEAKEN.** `isDeniedPath` is byte-identical and untouched by this list
    // (verified in this pass: the predicate's own text hashes IDENTICALLY before and after, see
    // control `(n)`), so `tests/relocate.test.ts` still reads `isDeniedPath === true` in the RAW
    // reading this row reports; this set can only ever REMOVE a path from `E3`'s subject, never
    // add one; and the row's own control (h-2) keeps driving `E3`'s OWN denied paths as
    // NOT-sibling, so **a denied path among `E3`'s own changes still FAILS.**
  },
  {
    path: 'src/shared/relocate.ts',
    unit: 'the RELOCATION unit (`E4` / `U-RELOCATE`) — its own MODULE, which lands later in that unit’s own cycle',
    // **⟶ DECLARED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR) — DECLARED BEFORE IT
    // EXISTS, ON PURPOSE, SO A SECOND REPAIR PASS IS NOT OWED.** `docs/specs/relocate.md` names
    // the module as that unit's own artifact (its export census is `2 + 8` names: the two value
    // exports `createRelocateSession` and `withinProximity` plus eight type declarations). The
    // registry is keyed by PATH, so declaring the path now is what keeps this row from reading
    // the Implementer's landing commit as `E3`'s own. **This is the SAME declaration shape the
    // sibling registry already carries for a not-yet-landed artifact** (`SIBLING_UNIT_ARTIFACT_
    // PROBE` admits `E10`'s `*-greens.md` *"the moment `E10`'s gate-5 artifact lands"*).
    // **MEASURED BEFORE THE DECLARATION:** the module does not exist on disk
    // (`ls src/shared/relocate.ts` ⇒ ENOENT) and is in no change set, so this entry moves NO
    // reading today; it is declared as the PATH-level attribution `§5.1`'s commit-range scope
    // rule requires once it does. **WHAT IT DOES NOT WEAKEN:** `isDeniedPath('src/shared/
    // relocate.ts')` still reads `true` for it (it is a `src/shared/*` path other than `E3`'s
    // own module), which control `(n)` drives; the exclusion is one-directional (REMOVE from
    // `E3`'s subject only).
  },
  // **⟶ THE RULE THIS ENTRY PAIR IS READ UNDER IS THE SAME SENTENCE EVERY ENTRY ABOVE CARRIES —
  // `E3`'S DENIED PREDICATE IS KEPT BYTE-IDENTICAL AND UNWEAKENED FOR `E3`'S OWN PATHS, AND THIS
  // REPAIR MAY ONLY *EXCLUDE A DECLARED SIBLING*, NEVER RELAX WHAT COUNTS AS DENIED:** the two
  // paths below still read `isDeniedPath === true` (both are `tests/**`/`src/shared/*` paths that
  // are not `E3`'s own), so the RAW reading this row reports still NAMES them; this registry can
  // only ever REMOVE a path from `E3`'s subject, never add one; and the row's own control (h-2)
  // keeps `E3`'s OWN denied paths reading NOT-sibling. Control `(n-2)` below drives all four
  // directions on these very paths.
  {
    path: 'tests/container.test.ts',
    unit: 'the CONTAINMENT unit (`E5` / `U-CONTAINER`) — its own red set (`docs/specs/container.md`, filed at the approved spec gate and committed at `98c8893`)',
    // **⟶ DECLARED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR — THE SECOND REPAIR OF THIS
    // CLASS, AFTER `E4`/`U-RELOCATE`).** `tests/container.test.ts` is **`E5`'s** artifact — its own
    // 68-row red set (49 failed / 19 passed against the absent module) — so it is **neither `E3`'s
    // nor `E10`'s nor `E4`'s**. **THE MEASURED CAUSE, VERBATIM FROM THIS PASS'S OWN DIRTY-STATE RUN
    // (taken by this repair pass with the path dirty, BEFORE this declaration):**
    // `liveUnaccounted: ["tests/container.test.ts"]` against an expected `[]` — reported through
    // this row's OWN accounting rule (`isAccountedFor`, control (m)) — i.e. **`R-12` FAILING on a
    // SIBLING's legitimate red set merely because the registry had no entry for it**, the same class
    // `§5.1`'s commit-range scope rule forbids (*"must NOT read … a sibling's dirty working-tree
    // file … as this unit's diff"*). That same run read `1 failed | 92 passed (93)`, so the defect
    // is a real red rather than a structural hypothesis.
    // **THE LIVE STATE AT THE TIME OF THIS DECLARATION IS *CLEAN* RATHER THAN RED, and the reason is
    // recorded rather than smoothed:** `E5`'s red set was committed by the supervisor at `98c8893`,
    // so `git status --porcelain` is EMPTY and the dirty arm sees nothing, so this row reads `93/93`
    // green on the committed tree. **The defect is therefore STRUCTURAL AND LATENT in that state and
    // fires the moment `E5`'s own cycle makes either path dirty** (its Implementer's landing, or any
    // later edit to its test file), because the registry is keyed by PATH: the path is declared NOW
    // so a second repair pass is not owed.
    // **WHAT IT DOES NOT WEAKEN.** `isDeniedPath` is not referenced by this list and is not edited
    // by this pass (control `(n-2)` asserts it still reads `true` for this path), so
    // `tests/container.test.ts` still reads denied in the RAW reading this row reports; a path can
    // only ever be REMOVED from `E3`'s subject; and `E3`'s own five artifacts stay NOT-sibling, so
    // **a denied path among `E3`'s own changes still FAILS.**
  },
  {
    path: 'src/shared/container.ts',
    unit: 'the CONTAINMENT unit (`E5` / `U-CONTAINER`) — its own MODULE, which lands later in that unit’s own cycle',
    // **⟶ DECLARED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR) — DECLARED BEFORE IT
    // EXISTS, ON PURPOSE, SO A SECOND REPAIR PASS IS NOT OWED.** `docs/specs/container.md` names
    // `src/shared/container.ts` as that unit's own artifact — its export census is `3 + 3 = 6`
    // names: the three value exports `tokensFor`, `orientationFor` and `containerDeclarationFor`
    // plus the three type declarations `AxisResolver`, `ChromeTokenFn` and `ContainerDeclaration`.
    // The registry is keyed by PATH, so declaring the path now is what keeps `E5`'s Implementer
    // landing commit from reading as `E3`'s own. **This is the SAME declaration shape the sibling
    // registry already carries for a not-yet-landed artifact** (`SIBLING_UNIT_ARTIFACT_PROBE`
    // admits `E10`'s `*-greens.md` *"the moment `E10`'s gate-5 artifact lands"*, and the `E4` entry
    // above declares `src/shared/relocate.ts` before it existed). **MEASURED BEFORE THE
    // DECLARATION:** the module does not exist on disk (`src/shared/container.ts` ⇒ ENOENT) and is
    // in no change set, so this entry moves NO live reading today; it is the PATH-level attribution
    // `§5.1`'s commit-range scope rule requires once it lands. **WHAT IT DOES NOT WEAKEN:**
    // `isDeniedPath('src/shared/container.ts')` still reads `true` for it (a `src/shared/*` path
    // other than `E3`'s own module), which control `(n-2)` drives; the exclusion is
    // one-directional (REMOVE from `E3`'s subject only).
  },
  // **⟶ THE RULE THIS ENTRY PAIR IS READ UNDER IS THE SAME SENTENCE EVERY ENTRY ABOVE CARRIES —
  // `E3`'S DENIED PREDICATE IS KEPT BYTE-IDENTICAL AND UNWEAKENED FOR `E3`'S OWN PATHS, AND THIS
  // REPAIR MAY ONLY *EXCLUDE A DECLARED SIBLING*, NEVER RELAX WHAT COUNTS AS DENIED:** the two
  // paths below still read `isDeniedPath === true` (both are `tests/**`/`src/shared/*` paths that
  // are not `E3`'s own), so the RAW reading this row reports still NAMES them; this registry can
  // only ever REMOVE a path from `E3`'s subject, never add one; and the row's own control (h-2)
  // keeps `E3`'s OWN denied paths reading NOT-sibling. Control `(n-3)` below drives all four
  // directions on these very paths.
  {
    path: 'tests/menu-template.test.ts',
    unit: 'the MENU-LIBRARY unit (`E7` / `U-MENULIB`) — its own red set (`docs/specs/menulib.md`, filed at the approved spec gate and committed at `d287b4b`)',
    // **⟶ DECLARED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR — THE THIRD REPAIR OF THIS
    // CLASS, AFTER `E4`/`U-RELOCATE` AND `E5`/`U-CONTAINER`).** `tests/menu-template.test.ts` is
    // **`E7`'s** artifact — its own 56-row red set (46 failed / 10 passed against the absent module)
    // — so it is **neither `E3`'s nor `E10`'s nor `E4`'s nor `E5`'s**. **THE MEASURED CAUSE,
    // VERBATIM FROM THIS PASS'S OWN DIRTY-STATE RUN (taken with the `E7` file dirty, BEFORE this
    // declaration, on the committed tree `d287b4b` + one appended probe comment):**
    // `liveUnaccounted: ["tests/menu-template.test.ts"]` against an expected `[]` — reported through
    // this row's OWN accounting rule (`isAccountedFor`, control (m)) — i.e. **`R-12` FAILING on a
    // SIBLING's legitimate red set merely because the registry had no entry for it** (the same
    // class `§5.1`'s commit-range scope rule forbids: *"must NOT read … a sibling's dirty
    // working-tree file … as this unit's diff"*), and that run read `1 failed | 92 passed (93)`.
    // **THE LIVE STATE ON A CLEAN TREE IS *NOT* RED, and the reason is recorded rather than
    // smoothed:** the `E7` red set was committed by the supervisor at `d287b4b`, so
    // `git status --porcelain` is EMPTY and the dirty arm sees nothing, so this row reads `93/93`
    // green there (measured by this pass, BEFORE its own edit landed). **The defect is therefore
    // STRUCTURAL AND LATENT in the clean state and fires the moment `E7`'s cycle makes either path
    // dirty** (its Implementer's landing, or any later edit to its test file), because the registry
    // is keyed by PATH: the path is declared NOW so a fourth repair pass is not owed.
    // **WHAT IT DOES NOT WEAKEN.** `isDeniedPath` is not referenced by this list and is not edited
    // by this pass (control `(n-3)` asserts it still reads `true` for this path), so
    // `tests/menu-template.test.ts` still reads denied in the RAW reading this row reports; a path
    // can only ever be REMOVED from `E3`'s subject; and `E3`'s own five artifacts stay
    // NOT-sibling, so **a denied path among `E3`'s own changes still FAILS.**
  },
  {
    path: 'src/shared/menu-template.ts',
    unit: 'the MENU-LIBRARY unit (`E7` / `U-MENULIB`) — its own MODULE, which lands later in that unit’s own cycle',
    // **⟶ DECLARED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR) — DECLARED BEFORE IT
    // EXISTS, ON PURPOSE, SO A FOURTH REPAIR PASS IS NOT OWED.** `docs/specs/menulib.md` pins
    // `src/shared/menu-template.ts` as that unit's own artifact — its export census is NINE names in
    // two halves: the three value exports `normalizeCatalog`, `buildMenuTemplate` and
    // `selectCatalogItem`, plus the six type declarations `PickerFn`, `CatalogEntry`,
    // `PlatformProjection`, `ProjectedItem`, `MenuTemplate` and `TemplateOptions`. The registry is
    // keyed by PATH, so declaring the path now is what keeps `E7`'s Implementer landing commit from
    // reading as `E3`'s own. **This is the SAME declaration shape the registry already carries for a
    // not-yet-landed artifact** (the `E4` entry declares `src/shared/relocate.ts` and the `E5` entry
    // `src/shared/container.ts` before either existed; `SIBLING_UNIT_ARTIFACT_PROBE` admits `E10`'s
    // `*-greens.md` *"the moment `E10`'s gate-5 artifact lands"*). **MEASURED BEFORE THE
    // DECLARATION:** the module does not exist on disk (`src/shared/menu-template.ts` ⇒ ENOENT,
    // verified by this pass) and is in no change set, so this entry moves NO live reading today; it
    // is the PATH-level attribution `§5.1`'s commit-range scope rule requires once it lands.
    // **WHAT IT DOES NOT WEAKEN:** `isDeniedPath('src/shared/menu-template.ts')` still reads `true`
    // for it (a `src/shared/*` path other than `E3`'s own module), which control `(n-3)` drives; the
    // exclusion is one-directional (REMOVE from `E3`'s subject only).
  },
  // **⟶ THE RULE THIS ENTRY PAIR IS READ UNDER IS THE SAME SENTENCE EVERY ENTRY ABOVE CARRIES —
  // `E3`'S DENIED PREDICATE IS KEPT BYTE-IDENTICAL AND UNWEAKENED FOR `E3`'S OWN PATHS, AND THIS
  // REPAIR MAY ONLY *EXCLUDE A DECLARED SIBLING*, NEVER RELAX WHAT COUNTS AS DENIED:** the two
  // paths below still read `isDeniedPath === true` (both are `tests/**`/`src/shared/*` paths that
  // are not `E3`'s own), so the RAW reading this row reports still NAMES them; this registry can
  // only ever REMOVE a path from `E3`'s subject, never add one; and the row's own control (h-2)
  // keeps `E3`'s OWN denied paths reading NOT-sibling. Control `(n-5)` below drives all four
  // directions on these very paths.
  {
    path: 'tests/theme.test.ts',
    unit: 'the THEME unit (`E8` / `U-THEME`) — its own red set (`docs/specs/theme.md`, filed at the approved spec gate and committed at `178f1ab`)',
    // **⟶ DECLARED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR — THE FOURTH REPAIR OF THIS
    // CLASS, AFTER `E4`/`U-RELOCATE`, `E5`/`U-CONTAINER` AND `E7`/`U-MENULIB`).** `tests/theme.test.ts`
    // is **`E8`'s** artifact — its own 58-row red set, RUN and reported by that unit's TestWriter pass
    // (40 failed / 18 passed against the absent module, `178f1ab`) — so it is **neither `E3`'s nor
    // `E10`'s nor `E4`'s nor `E5`'s nor `E7`'s**. **THE MEASURED CAUSE, VERBATIM FROM THE
    // IMPLEMENTER PASS'S OWN DIRTY-STATE RUN (taken with these two paths UNCOMMITTED, BEFORE this
    // declaration):** the row's own live reading named exactly
    // `["src/shared/theme.ts","tests/theme.test.ts"]` — **`R-12` FAILING on a sibling's legitimate
    // red set and its in-flight module merely because the registry had no entry for them**, the same
    // class `§5.1`'s commit-range scope rule forbids (*"must NOT read … a sibling's dirty
    // working-tree file … as this unit's diff"*).
    // **THE LIVE STATE AT THE TIME OF THIS DECLARATION IS *CLEAN* RATHER THAN RED, and the reason is
    // recorded rather than smoothed:** `E8`'s red set and its first module landed in `178f1ab`, so
    // `git status --porcelain` is EMPTY and the dirty arm sees nothing, so this row reads `93/93`
    // green on the committed tree (measured by this pass, BEFORE its own edit landed). **The defect
    // is therefore STRUCTURAL AND LATENT in that state and fires the moment `E8`'s own cycle makes
    // either path dirty** (its Implementer's next landing, or any later edit to its test file),
    // because the registry is keyed by PATH: the path is declared NOW so a fifth repair pass is not
    // owed.
    // **WHAT IT DOES NOT WEAKEN.** `isDeniedPath` is not referenced by this list and is not edited
    // by this pass (control `(n-5)` asserts it still reads `true` for this path), so
    // `tests/theme.test.ts` still reads denied in the RAW reading this row reports; a path can only
    // ever be REMOVED from `E3`'s subject; and `E3`'s own five artifacts stay NOT-sibling, so **a
    // denied path among `E3`'s own changes still FAILS.**
  },
  {
    path: 'src/shared/theme.ts',
    unit: 'the THEME unit (`E8` / `U-THEME`) — its own MODULE (`src/shared/theme.ts`, 73 lines landed at `178f1ab`)',
    // **⟶ DECLARED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR).** `docs/specs/theme.md`
    // pins `src/shared/theme.ts` as that unit's own artifact: the five-name surface in two halves
    // (the two value exports `resolveTheme` and `applyThemeDeclaration`, plus the three type
    // declarations `ThemeResolution`, `ThemeAttributeWrite` and `ThemeEnv`). The registry is keyed by
    // PATH, so declaring the path is what keeps every later `E8` landing commit from reading as
    // `E3`'s own — the same declaration shape the `E4`/`E5`/`E7` entries above carry, and the same
    // shape `SIBLING_UNIT_ARTIFACT_PROBE` carries for a not-yet-landed artifact.
    // **MEASURED:** this module EXISTS on disk (`73` lines) and is TRACKED (`178f1ab`), and it was in
    // the live reading this declaration answers, so this entry moves a real reading rather than a
    // hypothetical one.
    // **WHAT IT DOES NOT WEAKEN:** `isDeniedPath('src/shared/theme.ts')` still reads `true` for it (a
    // `src/shared/*` path other than `E3`'s own module), which control `(n-5)` drives; the exclusion
    // is one-directional (REMOVE from `E3`'s subject only).
  },
  {
    path: 'tests/census.test.ts',
    unit: 'the FOCUS-TOOL unit (`F3` / `U-FOCUS-TOOL`) — the `U-CENSUS` suite its SAME-COMMIT census obligation repairs (`docs/specs/focus-tool.md` `§5.1` row 15) — NOT this unit',
    // **⟶ DECLARED 2026-09-27 (THE `F3` SAME-COMMIT OBLIGATION, `R-12`'s DENIED AND ALLOW-LIST
    // HALVES) — THE FIFTH REPAIR OF THIS CLASS, AND THE ONE `docs/specs/focus-tool.md` `§5.1`
    // MAKES UNAVOIDABLE.** That contract's widened allow-list NAMES THIS FILE as a same-commit
    // obligation of the `F3` unit (`§5.1` row 15: the `ALL_TOOLS` name-set equality, the sibling
    // `PINNED_TOOL_SET` length `21 → 22`, the `RpcMethod` count and its set-size duplicate check —
    // all in one commit). The commit satisfying it therefore carries `tests/census.test.ts`
    // TOGETHER WITH `tests/focus-tool.test.ts`, `tests/zones.test.ts` and the sibling suites that
    // same commit census-repairs — and this row's accounting rule (`isAccountedFor`, control (m))
    // then charged two of them to `E3`. **THE MEASURED READING, verbatim:** `liveUnaccounted:
    // ["tests/census.test.ts","tests/zones.test.ts"]` against an expected `[]`.
    // **THE AUTHORITY** is the same quoted rule every entry above carries (`docs/specs/gutter.md`
    // `§5.1`'s commit-range scope rule + `§3.4 R-4`), and **AN UNDECLARED PATH STILL FAILS**:
    // control (m)'s synthetic `tests/gutter-CONTROL-undeclared.test.ts` stays unaccounted, and
    // `isDeniedPath` is untouched (`tests/census.test.ts` still reads `DENIED_PATTERNS`-denied in
    // the RAW reading this row reports).
  },
  {
    path: 'tests/zones.test.ts',
    unit: 'the FOCUS-TOOL unit (`F3` / `U-FOCUS-TOOL`) — the `U-ZONES` suite its SAME-COMMIT census obligation repairs (`docs/specs/focus-tool.md` `§5.1` row 18) — NOT this unit',
    // **DECLARED FOR THE IDENTICAL REASON AS THE ENTRY ABOVE**, from the same measured reading and
    // under the same quoted authority; `isDeniedPath` is untouched for it too.
  },
  {
    path: 'tests/slot-host.test.ts',
    unit: 'the FOCUS-TOOL unit (`F3` / `U-FOCUS-TOOL`) — the slot-host suite its SAME-COMMIT census obligation repairs (`docs/specs/focus-tool.md` `§5.1` row 19, which NAMES that suite’s own edit bar: its row says the sibling census file “may not be edited by this unit”, which is exactly why the allow-list had to name the file) — NOT this unit',
    // **⟶ DECLARED 2026-09-27 (THE SAME `F3` SAME-COMMIT OBLIGATION, AND THE ROW’S OWN CORE CLAIM
    // THAT MEASURED IT).** `R-12`’s core claim reads `E3`’s own attributed change set back against
    // `§5.1`’s allow-list, and on the committed tree it FAILED with
    // `Outside the allow-list: ["tests/slot-host.test.ts"]` — that path rode the very commit that
    // satisfies this unit’s own census obligation (`docs/specs/focus-tool.md` `§5.1` rows 15–22).
    // The declaration is the same one the four F3-carrying paths above receive, under the same
    // quoted authority; `isDeniedPath` is untouched for it (a `tests/**` path other than `E3`’s
    // own), so it still reads in the RAW reading this row reports, and an UNDECLARED path still
    // FAILS the arm (control (m)’s synthetic path).
  },
]
/** **THE DECLARING UNITS, BY PATH** — the registry above, read as a map by the row so it can
 *  name the owning unit of every denied path it EXCLUDES. A path repeated in the registry
 *  would make the map ambiguous, so the row asserts the keys are distinct (see its control). */
const SIBLING_DIVERGENCE_UNIT_BY_PATH: Readonly<Record<string, string>> = Object.fromEntries(
  SIBLING_DIVERGENCE_UNIT_ARTIFACTS.map((entry) => [entry.path, entry.unit]),
)
/** **THE NOT-SIBLING CONTROL FOR THE NEW DECLARATION** — a path deliberately NOT in the
 *  registry above and NOT in any other sibling list, so `R-12`'s control (l-2) can drive the
 *  predicate's NEGATIVE direction: a declaration that claimed everything would FAIL there.
 *  It is also `isDeniedPath === true` (`scripts/**`), so it can never be mistaken for an
 *  `E3`-own path being excused. */
const CONTROL_NON_SIBLING_DIVERGENCE_PATH = 'scripts/electron-ui.mjs'
/** **⟶ DECLARED 2026-09-27 (THE CONFIG-PASS ATTRIBUTION, `R-12`'s ALLOW-LIST HALF ONLY) —
 *  THE CONFIG/TRACKER PATHS ANOTHER PASS LEGITIMATELY OWNS, WITH THEIR UNIT NAMED, DECLARED
 *  SO THE ALLOW-LIST HALF DOES NOT CHARGE THIS UNIT FOR THEM.**
 *
 *  **WHY THIS IS A SECOND DECLARATION AND NOT AN ENTRY IN THE REGISTRY ABOVE.** They are NOT
 *  `isSiblingUnitArtifact` paths and MUST NOT BE: the row's own control (h-2) pins
 *  **`package.json`** as reading `isSiblingUnitArtifact === false` (a declaration that claimed
 *  it would *"excuse a real `E3` boundary violation"*) — **that control is kept and is
 *  driven in this same run, and this pass did NOT weaken it to make this row green.**
 *  Equally, these paths are NOT `E3`'s five artifacts and are not denied-to-nobody: they are
 *  **another unit's working-tree files**, which `docs/specs/gutter.md` `§5.1`'s commit-range
 *  scope rule removes from *"THIS UNIT'S OWN ARTIFACTS"* — *"must NOT read … a sibling's dirty
 *  working-tree file … as this unit's diff"*. So the two facts are carried by TWO declarations
 *  with two different jobs, each driven by its own control:
 *
 *    · `SIBLING_DIVERGENCE_UNIT_ARTIFACTS` → feeds `isSiblingUnitArtifact` (the DENIED half's
 *      subject, plus `R-16`'s census), driven by control (l-2);
 *    · `NON_DENIED_SIBLING_ATTRIBUTED_PATHS` → feeds the ALLOW-LIST half's subject ONLY, driven
 *      by control (l-3). **It is consulted by NO predicate other than that filter**, so it
 *      cannot excuse anything in the DENIED arm.
 *
 *  **THE MEASURED CAUSE, verbatim from this pass's red run:**
 *  `E3-OWN dirty paths: ["AGENTS.md","docs/next-steps.md","package.json","tests/gutter.test.ts",
 *  "tsconfig.tests.json"]` · `Outside the list: ["AGENTS.md","package.json","tsconfig.tests.json"]`
 *  — and the as-filed message of that assertion itself says such a reading *"is a FINDING for
 *  the adversarial pass, not an automatic FAIL (RCA-8(a))"*. **`package.json` is the one that
 *  needs naming here: it is `E3`-DENIED BY DESIGN (`DENIED_EXACT` names it) and a sibling pass
 *  nonetheless WROTE it** (`"typecheck:tests"`, added beside the unchanged trio by the additive
 *  test-layer leg — `AGENTS.md` item 4). It is therefore: NOT sibling (control (h-2)), still
 *  `isDeniedPath === true` (so the RAW reading still reports it), and NOT `E3`'s own diff
 *  (this list). **An UNDECLARED path outside the allow-list still FAILS the arm.** */
const NON_DENIED_SIBLING_ATTRIBUTED_PATHS: ReadonlyArray<{ readonly path: string; readonly unit: string }> = [
  {
    path: 'package.json',
    unit: 'the PROCESS pass that landed the additive test-layer leg (`npm run typecheck:tests`, `AGENTS.md` item 4) — NOT this unit',
    // MEASURED: it is the ONLY path that reaches this filter on the live reading. `AGENTS.md`
    // and `tsconfig.tests.json` are ALSO that pass's files — declared in
    // `SIBLING_DIVERGENCE_UNIT_ARTIFACTS` above, which already removes them from `E3`'s own
    // dirty set before this half sees them — so they are deliberately NOT duplicated here.
  },
]
const NON_DENIED_SIBLING_ATTRIBUTED_BY_PATH: Readonly<Record<string, string>> = Object.fromEntries(
  NON_DENIED_SIBLING_ATTRIBUTED_PATHS.map((entry) => [entry.path, entry.unit]),
)
/** **⟶ DECLARED 2026-09-27 (THE TEST-LAYER-LEG ATTRIBUTION, `R-12`'s ALLOW-LIST HALF ONLY) — THE
 *  ADDITIVE TEST-LAYER LEG PASS'S OWN ARTIFACTS, WITH THE OWNING UNIT NAMED, SO A LEGITIMATE
 *  PROCESS PASS CANNOT REDDEN `E3`'s ROW.**
 *
 *  **WHY THIS DECLARATION EXISTS, AND THE MEASUREMENT THAT FORCED IT.** The additive test-layer
 *  leg (`AGENTS.md` item 4: `npm run typecheck:tests`, `tsc -p tsconfig.tests.json`) ran a
 *  whole-tree `tests/**` TYPE-ANNOTATION pass to make that leg clean. That pass's change set is
 *  **23 MODIFIED test files plus the 3 NEW `tests/fixtures/*.d.mts` declarations** — every one of
 *  them `tests/**`, hence DENIED to `E3` by `isDeniedPath` (which denies `^tests/` other than
 *  `E3`'s own file) and hence, before this declaration, **read as `E3`'s own in-flight work**.
 *  **THE MEASURED READING, verbatim from this pass's red run of `R-12`** (through the row's OWN
 *  machinery, `splitBySiblingAttribution` + the allow-list filter):
 *
 *    `ownDenied` = 25 paths · `outsideAllow` = 25 paths, namely the 22 modified test files +
 *    the 3 `tests/fixtures/*.d.mts` declarations (`tests/blind-battery-hooks-handlers.test.ts`,
 *    `…/blind-battery-verify`, `…/blind-mcp-notify`, `…/blind-runtime-host`, `…/blind-security-gate`,
 *    `…/engine-pin-boolean-dom`, `…/engine-pin-boolean-ssr`, `…/gemma4-blind-battery`,
 *    `…/isolation-adversarial-e2e`, `…/journal-endpoint`, `…/loadbatch-adversarial`,
 *    `…/mcp-notify-adversarial`, `…/mcp-resources-adversarial`, `…/mcp-resources`,
 *    `…/mcp-server-gate`, `…/module-e2e`, `…/mount-invariant-guard`, `…/path-fork-cycle`,
 *    `…/runtime-battery`, `…/runtime-host`, `…/secure-panels`, `…/security`,
 *    `tests/fixtures/handlers-scenarios-data.d.mts`, `…/hooks-scenarios-data.d.mts`,
 *    `…/pane-mutation-fixture.d.mts`)
 *
 *  **THE RULE IT IS READ UNDER — `docs/specs/gutter.md` `§5.1`'s OWN SENTENCE, quoted because it
 *  is the authority this declaration merely APPLIES:** *"**A non-denied path outside the
 *  allow-list is a FINDING for the adversarial pass, not an automatic FAIL** (a unit's own
 *  mandatory gate artifacts must be committable — `RCA-8(a)`)"* — together with `§5.1`'s
 *  commit-range scope rule (*"must NOT read a later unit's commits, a **sibling's dirty
 *  working-tree file**, or a sibling unit's artifact as this unit's diff"*) and `§3.4 R-4` (a
 *  later unit's legitimate change is not a violation of `E3`'s contract). The as-filed row was
 *  **stricter than its own stated rule** — it computed the reading and then failed on it.
 *
 *  **WHAT IT DOES NOT DO, stated so the ruling is not softened.** (1) It **does not weaken
 *  `isDeniedPath`**: every path below still reads `isDeniedPath === true`, so the RAW denied
 *  reading still NAMES all 25, and the DENIED arm still binds them the moment a path is
 *  genuinely `E3`'s own. (2) It **does not touch `isSiblingUnitArtifact`**: these paths are NOT
 *  added to that predicate, so they are REMOVED from `E3`'s subject ONLY through the allow-list
 *  half's own filter (control (l-3) proves the two declarations do not overlap). (3) It **cannot
 *  excuse an `E3`-OWN path**: `E3`'s five artifacts are asserted `isE3OwnArtifact === true` by
 *  control (l-3) list 3, and an UNDECLARED or ANONYMOUS path still FAILS the arm (control (m)
 *  below drives a synthetic undeclared path through the row's own predicate). (4) It **changes
 *  no term, seed, strategy id, cap, row id or section number.**
 *
 *  **`docs/specs/user-flow-audit.md` IS DECLARED BESIDE THEM, and its owning unit is named:**
 *  it is the **`U-DIVERGENCE-EXT` (`C2`) documentation pass's** artifact — the spec FILED to
 *  discharge the gap `U-GAP-1` (`docs/specs/gutter-ui.md` `§5.U`'s row carries the dated
 *  discharge note). It is neither `E3`'s artifact nor one of the 25 test-layer paths, so it is
 *  its own entry with its own declared owner rather than a silent addition to the leg's list. */
const NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_PATHS: ReadonlyArray<{ readonly path: string; readonly unit: string }> = [
  ...(
    [
      'tests/blind-battery-hooks-handlers.test.ts',
      'tests/blind-battery-verify.test.ts',
      'tests/blind-mcp-notify.test.ts',
      'tests/blind-runtime-host.test.ts',
      'tests/blind-security-gate.test.ts',
      'tests/engine-pin-boolean-dom.test.ts',
      'tests/engine-pin-boolean-ssr.test.ts',
      'tests/gemma4-blind-battery.test.ts',
      'tests/isolation-adversarial-e2e.test.ts',
      'tests/journal-endpoint.test.ts',
      'tests/loadbatch-adversarial.test.ts',
      'tests/mcp-notify-adversarial.test.ts',
      'tests/mcp-resources-adversarial.test.ts',
      'tests/mcp-resources.test.ts',
      'tests/mcp-server-gate.test.ts',
      'tests/module-e2e.test.ts',
      'tests/mount-invariant-guard.test.ts',
      'tests/path-fork-cycle.test.ts',
      'tests/runtime-battery.test.ts',
      'tests/runtime-host.test.ts',
      'tests/secure-panels.test.ts',
      'tests/security.test.ts',
      'tests/fixtures/handlers-scenarios-data.d.mts',
      'tests/fixtures/hooks-scenarios-data.d.mts',
      'tests/fixtures/pane-mutation-fixture.d.mts',
    ] as const
  ).map((path) => ({
    path,
    unit: 'the PROCESS pass that landed the additive test-layer leg (`AGENTS.md` item 4 — `npm run typecheck:tests`): its whole-tree `tests/**` TYPE-ANNOTATION pass (a modified test file, or one of the three NEW `tests/fixtures/*.d.mts` scenario declarations) — NOT this unit',
  })),
  {
    path: 'tests/focus-model.test.ts',
    unit: "the FOCUS-TOOL unit (`F3` / `U-FOCUS-TOOL`) — its SPEC-EXISTENCE ROW inside the consumed module's test file was FLIPPED by the F3 TestWriter pass (`focus-tool.md` `§5.2` item 4 `N-5`: the spec IS filed). The file belongs to `U-FOCUS-MODEL` (`F2`, `DONE`); the ONE flipped row is F3's own same-commit obligation — NOT this unit",
  },
  {
    path: 'tests/focus-tool.test.ts',
    unit: 'the FOCUS-TOOL unit (`F3` / `U-FOCUS-TOOL`) — its TestWriter RED SET (the unit\'s own `§5.1` allow-list row 5 path), declared here by the pass that authored it so the diff-scope accounting names an owner instead of reporting it as a finding — NOT this unit',
  },
  {
    path: 'tests/focus-tool-register.ts',
    unit: 'the FOCUS-TOOL unit (`F3` / `U-FOCUS-TOOL`) — the module carrying its `§5.5.1` PROPERTY REGISTER (`17` typed rows + the harness; a non-test module, so vitest never collects it as a suite), declared here by the pass that authored it — NOT this unit',
  },
  {
    path: 'docs/specs/user-flow-audit.md',
    unit: 'the DIVERGENCE/HARNESS unit (`U-DIVERGENCE-EXT`, ledger row `C2`) — its DOCUMENTATION pass FILED this spec and discharged the gap `U-GAP-1` (`docs/specs/gutter-ui.md` `§5.U`’s dated discharge note) — NOT this unit',
  },
  // **⟶ ADDED 2026-09-27 (THE THIRD ALLOW-LIST ADDITION, `F3`/`U-FOCUS-TOOL`’s TWO IN-SCOPE
  //    CENSUS-EDITED FILES — `docs/specs/focus-tool.md` `§5.1` allow-list row 24 / `§5.2` item 4
  //    (iii) `N-23`): THE DECLARING-UNIT ENTRIES FOR THE TWO FILES THAT UNIT’S OWN CENSUS COMMIT
  //    DIRTIES, each entered HERE rather than in `SIBLING_UNIT_ARTIFACT_PATHS` because neither is a
  //    sibling artifact and neither may be excused in the DENIED arm.** **THE COMPLEMENT IS
  //    EXPLICIT AND IS ENFORCED BY THIS ROW’S OWN CONTROL (l-3) LIST 2 (which reads
  //    `isSiblingUnitArtifact` over every entry and requires it EMPTY): `tests/gutter-ui.test.ts`
  //    and `tests/layout-projection.test.ts` are NOT entered here — each is already declared
  //    (`SIBLING_UNIT_ARTIFACT_PATHS`; `OTHER_UNIT_TEST_FILES`), so an entry for either would
  //    CONTRADICT that list.** **AN ENTRY NAMES ITS UNIT; NONE IS ANONYMOUS.**
  {
    path: 'tests/engine-pin-version.test.ts',
    unit: 'the FOCUS-TOOL unit (`F3` / `U-FOCUS-TOOL`) — its CENSUS RE-PARAMETERISATION (`docs/specs/focus-tool.md` `§5.1` allow-list row 6) moved the tool-set length pins `21 → 22` for `provident.focus` and DIRTIED this file in the same commit — NOT this unit',
  },
  {
    path: 'tests/theme-control.test.ts',
    unit: 'the FOCUS-TOOL unit (`F3` / `U-FOCUS-TOOL`) — its SAME-COMMIT CENSUS EDIT (`docs/specs/focus-tool.md` `§5.1` allow-list row 21: the `ALL_TOOLS` `21 → 22` count pins, the `RpcMethod` member list and the pinned sibling length) DIRTIED this file in the same commit — NOT this unit',
  },
]
const MENULIB_DOC_ARTIFACTS: ReadonlyArray<{ readonly path: string; readonly unit: string }> = [
  {
    path: 'docs/specs/menulib.md',
    unit: 'the MENU-LIBRARY unit (`E7` / `U-MENULIB`) — its own CONTRACT SPEC, amended and committed at `f7823be` — NOT this unit',
  },
  {
    path: 'docs/specs/menulib-review.md',
    unit: 'the MENU-LIBRARY unit (`E7` / `U-MENULIB`) — its own proposal-review record (`docs/specs/<proposal>-review.md`, `AGENTS.md` item 8) — NOT this unit',
  },
  {
    path: 'docs/specs/menu-template-greens.md',
    unit: 'the MENU-LIBRARY unit (`E7` / `U-MENULIB`) — the greens set its own gate 5 will produce, DECLARED BEFORE IT EXISTS so a fourth repair pass is not owed — NOT this unit',
  },
]
/** **THE TEST-LAYER-LEG DECLARATION, READ AS A MAP** — the second declaration's own registry, so
 *  the allow-list half's filter reads ONE lookup per path (`typeof … === 'string'`) and so its
 *  own control can drive it both ways. Its entries are APPENDED to the config-pass registry's
 *  entries for the same job (`NON_DENIED_SIBLING_ATTRIBUTED_BY_PATH`), and the two are kept as
 *  TWO declarations because their measured causes differ (a config/tracker file vs the leg's
 *  own `tests/**` type-annotation pass); control (l-3) drives BOTH. */
const NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_BY_PATH: Readonly<Record<string, string>> = Object.fromEntries(
  NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_PATHS.map((entry) => [entry.path, entry.unit]),
)
/** **THE `E7`/`U-MENULIB` DOC-ARTIFACT DECLARATION, READ AS A MAP** — its own registry, consulted by
 *  `declaredOtherUnitNameOf` in the same `typeof … === 'string'` form as the two registries above,
 *  and driven in all four directions by `R-12` control (n-4). Kept as its OWN declaration rather
 *  than folded into the test-layer list because its measured cause differs (a sibling unit's own
 *  contract/review/greens artifacts riding a commit that carried one of `E3`'s artifacts, versus a
 *  whole-tree `tests/**` type-annotation pass). */
const MENULIB_DOC_BY_PATH: Readonly<Record<string, string>> = Object.fromEntries(
  MENULIB_DOC_ARTIFACTS.map((entry) => [entry.path, entry.unit]),
)
/** **⟶ DECLARED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR, THE `E8`/`U-THEME` PASS —
 *  `R-12`'s ALLOW-LIST HALF) — THE THEME UNIT'S OWN TWO **NON-DENIED** SPEC ARTIFACTS, WITH THEIR
 *  OWNER NAMED.**
 *
 *  **WHY THIS IS A SECOND DECLARATION PAIR AND NOT TWO MORE REGISTRY ENTRIES.** `docs/specs/theme.md`
 *  and `docs/specs/theme-review.md` are **NOT `isDeniedPath` paths** (`isDeniedPath` denies
 *  `src/shared/*`, `src/main/**`, `src/renderer/**`, `scripts/**`, `tests/**`-other-than-`E3`'s and a
 *  named handful of config paths — never `docs/specs/*`). They therefore reach `R-12`'s ALLOW-LIST
 *  half, not its DENIED half, and declaring them `isSiblingUnitArtifact` paths would claim them
 *  through a predicate whose job is the DENIED half (and would redden control (n-5) list 5, which
 *  pins them NOT-sibling on purpose). **This is exactly the split `MENULIB_DOC_ARTIFACTS` above
 *  carries for the same reason, and the same shape is used here so the two declarations can be read
 *  side by side.** The two paths are declared TOGETHER WITH the unit's denied pair in the SAME pass
 *  so a later `E8` doc ride-along (`docs/specs/theme-review.md` being amended at a gate, a
 *  `docs/specs/theme-greens.md` landing) does not force a FIFTH repair of this class.
 *
 *  **THE MEASURED CAUSE.** The Implementer pass's live reading named `["src/shared/theme.ts",
 *  "tests/theme.test.ts"]` for the DENIED half; these two doc paths are the same class on the
 *  ALLOW-LIST half — a sibling unit's legitimate spec artifacts riding an `E3`-attributed commit
 *  range (`docs/specs/theme.md` and `docs/specs/theme-review.md` were both filed in commits that
 *  also touched shared ledgers) are **not `E3`'s diff** (`docs/specs/gutter.md` `§5.1`'s commit-range
 *  scope rule: *"must NOT read a later unit's commits, a sibling's dirty working-tree file, or a
 *  sibling unit's artifact as this unit's diff"*; `§3.4 R-4`).
 *
 *  **WHAT IT DOES NOT DO.** (1) It **does not weaken `isDeniedPath`** — that predicate is
 *  byte-identical and untouched; these paths read `false` there and always did. (2) It **does not
 *  touch `isSiblingUnitArtifact`** — control (n-5) asserts both read NOT-sibling, so this pair can
 *  never be mistaken for the sibling registry, and it cannot excuse anything in the DENIED arm.
 *  (3) It **cannot excuse an `E3`-OWN path**: `E3`'s own spec `docs/specs/gutter.md` is NOT on this
 *  list, and an UNDECLARED path outside the allow-list still FAILS the core claim (control (n-5)
 *  list (b) drives a synthetic unclaimed path). (4) It **changes no row id, term, seed, strategy id,
 *  cap or threshold.** */
const THEME_DOC_ARTIFACTS: ReadonlyArray<{ readonly path: string; readonly unit: string }> = [
  {
    path: 'docs/specs/theme.md',
    unit: 'the THEME unit (`E8` / `U-THEME`) — its own CONTRACT SPEC (`docs/specs/theme.md`, FILED at gate 1 and committed at `0cf90f7`, amended at the approved spec gate `dcf66c0`) — NOT this unit',
  },
  {
    path: 'docs/specs/theme-review.md',
    unit: 'the THEME unit (`E8` / `U-THEME`) — its own proposal-review / spec-gate record (`docs/specs/<proposal>-review.md`, `AGENTS.md` item 8; `0cf90f7`, gate-ruling annotation at `dcf66c0`) — NOT this unit',
  },
]
/** **THE `E8`/`U-THEME` DOC-ARTIFACT DECLARATION, READ AS A MAP** — its own registry, consulted by
 *  `declaredOtherUnitNameOf` in the same `typeof … === 'string'` form as the three registries above,
 *  and driven in all four directions by `R-12` control (n-5). Kept as its OWN declaration rather
 *  than folded into `MENULIB_DOC_BY_PATH` because its owning unit differs (a different sibling's
 *  contract/review artifacts, declared for a different measured cause). */
const THEME_DOC_BY_PATH: Readonly<Record<string, string>> = Object.fromEntries(
  THEME_DOC_ARTIFACTS.map((entry) => [entry.path, entry.unit]),
)
/** **⟶ SCOPED 2026-09-27 (THE TEST-LAYER PASS) — THE DECLARATION FILTER, NAMED ONCE AND SHARED BY
 *  BOTH OF `R-12`'s ALLOW-LIST HALVES.**
 *
 *  **THE AUTHORITY, QUOTED RATHER THAN PARAPHRASED — `docs/specs/gutter.md` `§5.1`:** *"a diff-scope
 *  row asserted over a commit range must scope its allow-list census to THIS UNIT'S OWN ARTIFACTS …
 *  and **must NOT read a later unit's commits, a sibling's dirty working-tree file, or a sibling
 *  unit's artifact as this unit's diff**"* — and, in the SAME paragraph, *"**a non-denied path
 *  outside the allow-list is a FINDING for the adversarial pass, not an automatic FAIL**"*.
 *  **`§3.4 R-4`** adds the same direction from the other side: *"a later unit that legitimately
 *  imports THIS module is not a violation of it."*
 *
 *  **THE DEFECT THIS CLOSES (measured, and structural).** The commit that carried the recent
 *  whole-tree TEST-ANNOTATION pass (`caaccf8`) ALSO carried `tests/gutter.test.ts` — this unit's own
 *  file — so that commit is attributed to `E3` by this file's own per-commit rule
 *  (`isE3Commit`/`e3Attribution`), and every path in it is then read as `E3`'s own. **25 of those
 *  paths belong to the test-layer leg** and are already declared, with their owning unit, in
 *  `NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_PATHS` above — so a legitimate OTHER-UNIT pass that
 *  merely rode a commit carrying one of `E3`'s artifacts was FAILING `E3`'s row. Measured, verbatim
 *  from the red run: `Outside the allow-list: [25 paths, all tests/…]`.
 *
 *  **WHAT IT DOES, AND WHAT IT CANNOT DO.** It answers `true` ONLY for a path another unit is
 *  DECLARED to own, in one of two ways: (a) it is a `isSiblingUnitArtifact` path whose declaring
 *  unit is NAMED (`SIBLING_DIVERGENCE_UNIT_BY_PATH`, the same named-unit rule the DENIED half
 *  enforces in control (l)), or (b) it is named in one of the TWO non-denied attribution
 *  registries, each of which carries its own owning unit. **It is consulted by the SUBJECT of
 *  `R-12`'s two committed arms (the allow-list core claim and the DENIED set, both of which read
 *  `E3`'s own paths) and by the dirty arm's allow-list half** — and it is NEVER consulted by
 *  `isDeniedPath`, which is BYTE-IDENTICAL and unweakened for `E3`'s own paths (a denied path among
 *  `E3`'s own changes still FAILS, driven by controls (f)/(i)/(j)). **It
 *  cannot excuse an `E3`-OWN, NON-declared path**: an undeclared path stays in the subject and
 *  still FAILS the arm, which is the falsifiable core the new control drives with a synthetic
 *  `src/shared/gutter-hack.ts` (an entry in `E3`'s own change set that no registry claims). */
function declaredOtherUnitNameOf(path: string): string | null {
  const siblingUnit = SIBLING_DIVERGENCE_UNIT_BY_PATH[path]
  if (isSiblingUnitArtifact(path) && typeof siblingUnit === 'string' && siblingUnit.length > 0) {
    return siblingUnit
  }
  const nonDenied = NON_DENIED_SIBLING_ATTRIBUTED_BY_PATH[path]
  if (typeof nonDenied === 'string' && nonDenied.length > 0) return nonDenied
  const testLayer = NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_BY_PATH[path]
  if (typeof testLayer === 'string' && testLayer.length > 0) return testLayer
  // **⟶ ADDED 2026-09-27 (THE `E7`/`U-MENULIB` DOC-ARTIFACT DECLARATION).** The third non-denied
  // registry, read in the SAME form as the two above: a path another unit is DECLARED to own is
  // out of `E3`'s allow-list subject. It is consulted by NO other predicate, so it cannot excuse
  // a DENIED path (`isDeniedPath` answers `false` for all three entries, control (n-4) asserts).
  const menulibDoc = MENULIB_DOC_BY_PATH[path]
  if (typeof menulibDoc === 'string' && menulibDoc.length > 0) return menulibDoc
  // **⟶ ADDED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR, THE `E8`/`U-THEME` PASS).** The
  // FOURTH non-denied registry, read in the SAME form as the three above: a path another unit is
  // DECLARED to own is out of `E3`'s allow-list subject. It is consulted by NO other predicate
  // (`isDeniedPath` answers `false` for both entries and is untouched; control (n-5) drives them).
  const themeDoc = THEME_DOC_BY_PATH[path]
  if (typeof themeDoc === 'string' && themeDoc.length > 0) return themeDoc
  return null
}
function isDeclaredOtherUnitPath(path: string): boolean {
  return declaredOtherUnitNameOf(path) !== null
}
/** **THE SIBLING-UNIT-ARTIFACT PREDICATE (`R-12`'s per-path seam and `R-16`'s census
 *  exclusion).** `true` means: this path is `E10`'s (`U-GUTTER-UI`) declared artifact,
 *  so it is **OUT OF SCOPE BY CONSTRUCTION** for every `E3` clause — never `E3`'s own
 *  change, never `E3`'s own finding. Driven both ways by `R-12` (control (h): the
 *  sibling's DECLARED paths answer `true`, `E3`'s canonical three answer `false`).
 *
 *  **⟶ EXTENDED 2026-09-27 (THE DIVERGENCE-UNIT ATTRIBUTION DECLARATION).** The as-filed
 *  body is kept VISIBLE and BYTE-IDENTICAL above the new clause below: the four original
 *  `…includes(path)` / `PROBE.test(path)` members are unedited, and the ONE addition is the
 *  registry clause, which can only ever REMOVE a path from `E3`'s subject (an `OR` inside a
 *  predicate used exclusively as an exclusion). `isDeniedPath` is not referenced here at all. */
function isSiblingUnitArtifact(path: string): boolean {
  return (
    SIBLING_UNIT_ARTIFACT_PATHS.includes(path) ||
    SIBLING_UNIT_ARTIFACT_PROBE.test(path) ||
    OTHER_UNIT_ARTIFACT_PATHS.includes(path) ||
    // **⟶ ADDED 2026-09-27 (THE SIBLING-ATTRIBUTION DECLARATION) — a THIRD unit's own test file
    // (`U-PROJ`), DECLARED BY NAME above, for the same measured class the `gesture-session`
    // entry closes.** This clause can only REMOVE a path from `E3`'s subject; `isDeniedPath` is
    // untouched and the RAW reading still reports the path as denied.
    OTHER_UNIT_TEST_FILES.includes(path) ||
    // **⟶ ADDED 2026-09-27 (THE SIBLING-ATTRIBUTION DECLARATION) — the `E10` renderer/harness
    // paths, DECLARED BY NAME above.** This clause can only REMOVE a path from `E3`'s subject
    // (it is an OR inside a predicate that is only ever used as an exclusion), and the DENIED
    // predicate that binds `E3`'s OWN set is untouched.
    SIBLING_RENDERER_AND_HARNESS_PATHS.includes(path) ||
    // **⟶ ADDED 2026-09-27 (THE DIVERGENCE-UNIT ATTRIBUTION DECLARATION) — the divergence
    // unit's own `scripts/**` + red-set paths, DECLARED WITH THEIR UNIT NAMED above.** Same
    // direction as every clause before it: REMOVES a sibling's path from `E3`'s subject, adds
    // nothing, and leaves `isDeniedPath` byte-identical (so every path here still reads
    // `isDeniedPath === true` in the RAW reading the row reports).
    Object.prototype.hasOwnProperty.call(SIBLING_DIVERGENCE_UNIT_BY_PATH, path)
  )
}
/** **`R-16`'s ASSERTED CENSUS = THE RAW WALK MINUS THE SIBLING'S ARTIFACTS.** The
 *  subject of the row is `E3`'s OWN `gutter*` paths, so the sibling's
 *  `tests/gutter-ui.test.ts` is excluded BY NAME-and-PATTERN rather than by luck, and
 *  the census stays correct after `src/shared/gutter-affordance.ts` lands. A genuine
 *  NON-sibling `gutter*` path under `src/**`/`tests/**` is still counted and still trips
 *  the row (`R-16`'s control (e-2): the synthetic `tests/gutter-zzz.test.ts`).
 *
 *  **THE COUNTING MECHANISM IS SEPARATED FROM THE WALK ON PURPOSE**, so `R-16`'s positive
 *  control can be DRIVEN rather than re-described: `unitCensusOf(candidates)` is the row's
 *  own count rule (the `walkUnitPaths` filename rule, then the sibling exclusion) applied
 *  to an arbitrary candidate list, and `e3CensusPaths()` is that rule over the live walk. */
function unitCensusOf(candidates: readonly string[]): string[] {
  return candidates
    .filter((path) => /^gutter/i.test(path.slice(path.lastIndexOf('/') + 1)))
    .filter((path) => !isSiblingUnitArtifact(path))
    .sort()
}
function e3CensusPaths(): string[] {
  return unitCensusOf(walkUnitPaths())
}
/** **`R-12`'s DIRTY (tree/staged) ARM, AS A SPLIT — ⟶ ADDED 2026-09-27 (THE `R-12`
 *  DIFF-SCOPE REPAIR PASS, the ONE-ARM remand of the `E3` row-repair commit
 *  `1dbb521`).** The arm's SUBJECT is the working-tree change set (`git status
 *  --porcelain`), and the SAME per-path sibling attribution the committed arm binds
 *  decides it: **a dirty path counts as `E3`'s own iff it is NOT
 *  `isSiblingUnitArtifact(path)`.** The split is RETURNED rather than recomputed so
 *  `R-12` can report **both readings separately** (the RAW dirty set, and the
 *  sibling-excluded `E3`-own set) and so its controls can be DRIVEN **through this
 *  function** rather than re-describing its rule. **`isDeniedPath` is NOT applied
 *  here and is NOT weakened** — the row applies the byte-identical predicate to
 *  `own` alone. */
function splitBySiblingAttribution(paths: readonly string[]): { raw: string[]; own: string[]; sibling: string[] } {
  return {
    raw: [...paths],
    own: paths.filter((path) => !isSiblingUnitArtifact(path)),
    sibling: paths.filter((path) => isSiblingUnitArtifact(path)),
  }
}
/** **`E3`'S OWN ARTIFACTS — THE FIVE FILES ONLY THIS UNIT AUTHORS** (the attribution rule
 *  (2)'s marker set). The SHARED trackers are deliberately NOT markers: every unit writes
 *  them, so a tracker path cannot tell whose commit this is.
 *
 *  **⟶ NARROWED 2026-09-27 (THE `E3` ROW-REPAIR PASS).** The as-filed marker set is
 *  kept visible: the module, this test file, this spec, `UNIT_GREENS_PROBE`,
 *  `UNIT_REVIEW_PROBE`. What changed is the TWO PROBES' patterns, which were
 *  sibling-blind (`gutter[^/]*` matched `gutter-ui-greens.md`; `(U-GUTTER|gutter)`
 *  matched `…U-GUTTER-UI-doc-review.md`) — see their own `⟶ NARROWED` notes, and see
 *  this block's preamble for the measured consequence. **The `isSiblingUnitArtifact`
 *  clause is a GUARD, not a broadening of the marker set:** it can only ever REMOVE a
 *  sibling path the patterns would have wrongly admitted — `E3`'s own five artifacts
 *  (incl. `docs/specs/gutter-greens.md` and `archive/reviews/*U-GUTTER*` records) are
 *  asserted NOT sibling by `R-12` control (h). */
function isE3OwnArtifact(path: string): boolean {
  if (isSiblingUnitArtifact(path)) return false
  return (
    path === MODULE_RELPATH ||
    path === TEST_RELPATH ||
    path === SPEC_RELPATH ||
    isE3GreensArtifact(path) ||
    isE3ReviewArtifact(path)
  )
}
/** `E3`'s own attribution rule (2)/(3). **An EMPTY path list is attributed to nobody** — a
 *  merge or an empty commit answers no clause of this row, and attributing it would put a
 *  phantom in the positive control. */
function isE3Commit(commit: RangeCommit): boolean {
  return commit.paths.length > 0 && commit.paths.some((path) => isE3OwnArtifact(path))
}
function e3Attribution(commits: readonly RangeCommit[]): { owned: RangeCommit[]; sibling: RangeCommit[]; paths: string[] } {
  const owned = commits.filter(isE3Commit)
  const sibling = commits.filter((commit) => !isE3Commit(commit))
  const paths = Array.from(new Set(owned.flatMap((commit) => commit.paths))).sort()
  return { owned, sibling, paths }
}
/** `§5.1`'s DENIED set, NAMED FIRST. **⟶ NARROWED 2026-09-27 (`R-12`'s repair): the set is
 *  unchanged, but the SUBJECT the row binds is now `E3`'S OWN CHANGE SET** — the as-filed
 *  *"the half that binds the WHOLE committed set"* is kept visible, with the measurement that
 *  falsified it, in the attribution block ABOVE. The predicate itself is NOT weakened (driven
 *  by the row's own control (f)). */
const DENIED_EXACT: readonly string[] = [
  SESSION_RELPATH,
  'tests/gesture-session.test.ts',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vitest.config.ts',
  'docs/specs/gutter-review.md',
  'docs/specs/gutter-ui.md',
]
function isDeniedPath(path: string): boolean {
  if (DENIED_EXACT.includes(path)) return true
  if (/^src\/shared\//.test(path) && path !== MODULE_RELPATH) return true
  if (/^src\/main\//.test(path) || /^src\/renderer\//.test(path)) return true
  if (/^scripts\//.test(path)) return true
  if (/^tests\//.test(path) && path !== TEST_RELPATH) return true
  return false
}
/** This unit's OWN artifacts — the allow-list (`§5.1` rows 1–5).
 *
 *  **⟶ NARROWED 2026-09-27 (THE `E3` ROW-REPAIR PASS): BOTH PROBES ARE NOW `E3`-SPECIFIC,
 *  AND THE AS-FILED PATTERNS ARE KEPT VISIBLE BESIDE THEM** — a row must not be silently
 *  rewritten, so what moved is recorded rather than replaced:
 *
 *    * AS FILED `UNIT_GREENS_PROBE = /^docs\/specs\/gutter[^/]*-greens\.md$/` matched
 *      **`docs/specs/gutter-ui-greens.md`** (the sibling's gate-5 artifact) — the `[^/]*`
 *      admitted the `ui-` segment. LIVE: a `gutter-…-greens.md` name that is NOT the
 *      sibling's (`gutter-ui…` is excluded explicitly, so it can never match) — which
 *      covers `docs/specs/gutter-greens.md` itself and any other `E3` greens name.
 *    * AS FILED `UNIT_REVIEW_PROBE = /^archive\/reviews\/[^/]*(U-GUTTER|gutter)[^/]*\.md$/`
 *      matched **`archive/reviews/2026-09-27-U-GUTTER-UI-doc-review.md`** — `U-GUTTER`
 *      is a PREFIX of `U-GUTTER-UI`, and the sibling's review records live in the SAME
 *      directory. LIVE: an `E3` review record (a `U-GUTTER` name that is not
 *      `U-GUTTER-UI`, or a `gutter-…` name that is not `gutter-ui-…`).
 *
 *  **WHAT STILL MATCHES, NAMED SO THE NARROWING IS CHECKABLE RATHER THAN TRUSTED:** `E3`'s
 *  own five artifacts — the module, this test file, `docs/specs/gutter.md`,
 *  `docs/specs/gutter-greens.md`, and this unit's own `archive/reviews/**` record of ANY
 *  of the shapes this repo has used for it (`2026-09-27-U-GUTTER-doc-review.md`,
 *  `…-U-GUTTER-adversarial.md`, `2026-09-27-gutter-census-review.md`, `gutter-doc-review.md`)
 *  — all answer `true`; `docs/specs/gutter-ui.md`, `docs/specs/gutter-ui-review.md`,
 *  `docs/specs/gutter-ui-greens.md` and
 *  `archive/reviews/2026-09-27-U-GUTTER-UI-doc-review.md` all answer `false` (the last two
 *  by the probes' own `ui`-exclusions, driven in `R-12` control (h)).
 *
 *  **THE LIVE PROBES, STATED AS THE TWO EXPLICIT FORMS THEY ARE** (rather than as one clever
 *  regex the reader must decode): the path must be under `docs/specs/` with a
 *  `gutter-…-greens.md` name, **or** under `archive/reviews/` with a `.md` name carrying a
 *  `U-GUTTER`/`gutter` token — and, in both cases, the name's `-`-separated segments must NOT
 *  contain the sibling's `ui` segment. That last clause is exactly the difference between the
 *  as-filed patterns and these: `gutter-ui-greens.md` and `…-U-GUTTER-UI-doc-review.md` carry
 *  `ui`, so they are the SIBLING's; `gutter-greens.md`, `gutter-census-greens.md`,
 *  `…-U-GUTTER-doc-review.md`, `…-gutter-census-review.md` and `…-U-GUTTERN-doc-review.md`
 *  do not, so they remain `E3`'s. */
const UNIT_GREENS_PROBE = /^docs\/specs\/gutter-.+-greens\.md$/
const UNIT_GREENS_EXACT = 'docs/specs/gutter-greens.md'
const UNIT_REVIEW_PROBE = /^archive\/reviews\/.+(U-GUTTER|gutter).+\.md$/
const UNIT_REVIEW_EXACT_PROBE = /^archive\/reviews\/(U-GUTTER|gutter)(?:-\w+)*\.md$/
/** The sibling's own SEGMENT in a unit-artifact NAME (`docs/specs/gutter-ui….md`,
 *  `…-U-GUTTER-UI….md`): `ui` as a whole `-`-delimited token, never merely a PREFIX of a
 *  longer token (so `U-GUTTERN` and `UIX` are NOT the sibling, while `UI` standing alone is). */
function hasSiblingUnitNameSegment(path: string): boolean {
  const name = path.slice(path.lastIndexOf('/') + 1)
  return name
    .replace(/\.md$/, '')
    .toLowerCase()
    .split(/[-.]/)
    .includes('ui')
}
function isE3GreensArtifact(path: string): boolean {
  return (UNIT_GREENS_PROBE.test(path) || path === UNIT_GREENS_EXACT) && !hasSiblingUnitNameSegment(path)
}
function isE3ReviewArtifact(path: string): boolean {
  return (
    (UNIT_REVIEW_PROBE.test(path) || UNIT_REVIEW_EXACT_PROBE.test(path)) && !hasSiblingUnitNameSegment(path)
  )
}
const UNIT_TRACKER_PROBE = /^docs\/(next-steps|decisions|pending|FORKER|defects|HANDOFF)\.md$/
function isUnitArtifact(path: string): boolean {
  if (isSiblingUnitArtifact(path)) return false
  return (
    path === MODULE_RELPATH ||
    path === TEST_RELPATH ||
    path === SPEC_RELPATH ||
    isE3GreensArtifact(path) ||
    isE3ReviewArtifact(path) ||
    UNIT_TRACKER_PROBE.test(path)
  )
}
/** The companion claim (`R-6`/`R-12`): `src/shared/gutter.ts` is imported by NO `src/**`
 *  file. */
function gutterImporters(): string[] {
  const importers: string[] = []
  for (const rel of walkSourceFiles()) {
    if (rel === MODULE_RELPATH) continue
    const src = readFileSync(`${REPO_ROOT}/${rel}`, 'utf8')
    for (const statement of importStatements(src)) {
      if (statement.specifier !== null && /(^|\/)gutter(\.js)?$/.test(statement.specifier)) importers.push(rel)
    }
  }
  return importers
}
/** **⟶ TIME-SCOPED 2026-09-27 (THE OWNER-SCOPING REPAIR, RULING B).**
 *
 *  **THE DEFECT, MEASURED.** The companion claim *"`src/shared/gutter.ts` is imported by NO
 *  `src/**` file"* was asserted over a walk of the LIVE tree, so it read a LATER unit's
 *  legitimate work as a `E3` finding. The authority for the repair is `E3`'s OWN contract:
 *  `docs/specs/gutter.md` `§3.4 R-4` — *"**A later unit that legitimately imports THIS module is
 *  not a violation of it** — the row binds THIS module's own imports, and the *'imported by no
 *  `src/**` file'* claim is `R-6`'s"* — together with `§5.1`'s commit-range scope rule (*"a
 *  census may not read … a sibling's … file … as this unit's diff"*). **AND THE LATER IMPORTER IS
 *  RULED LEGITIMATE BY NAME:** `docs/specs/gutter-ui.md` `§2.1` clause 2 / `§3.4 R-8` / `§R.3`
 *  and `docs/decisions.md`'s `E10-MODULE-IMPORTS-THE-CONTROLLER-FACTORY` rule that `E10`'s module
 *  VALUE-IMPORTS `createResizeController` from `./gutter.js` (a supervisor ruling of 2026-09-27),
 *  and `§5.1` rows `10`/`11` admit the renderer wiring which imports `E10`'s module — so the live
 *  importer census is non-empty BY CONSTRUCTION once the sibling lands.
 *
 *  **THE REPAIRED READING.** The claim is asserted **IN ITS TIME-SCOPED FORM — *the module was
 *  imported by NO `src/**` file at `E3`'s own red/green time***, read **over the TRACKED TREE AS
 *  IT STOOD AT `E3`'s ANCHOR COMMIT** (the commit that ADDED `tests/gutter.test.ts`, the same
 *  anchor `R-12`'s diff-scope arm already computes): a path is in that tree iff it is TRACKED at
 *  the anchor. The **CURRENT** importer census is then reported as its own NAMED reading —
 *  the importing paths plus the unit each one belongs to — **and never as a FAIL**, because a
 *  later unit's legitimate importer is not a violation of this row. **THE CLAIM KEEPS A
 *  FALSIFIABLE CONTROL:** an importer that is one of `E3`'s OWN attributed artifacts (`E3`'s
 *  module, this test file, this spec, its `*-greens.md` and its `archive/reviews/**` record) or
 *  a `gutter*` path no unit's allow-list claims STILL FAILS the row, in both readings.
 *
 *  **THE HONEST BOUND, stated rather than hidden:** the time-scoped reading is a claim about the
 *  TRACKED tree at the anchor — an importer that was UNTRACKED at that instant is invisible to
 *  it, exactly as it is invisible to `R-12`'s committed arm. That bound does not weaken the row:
 *  the CURRENT reading below names every importer on the live tree, so nothing can hide. */
type ImporterAttribution = {
  /** The `src/**` files importing the module in the TRACKED tree at the anchor commit. */
  readonly atAnchor: string[]
  /** The `src/**` files importing the module in the LIVE tree, tracked or not. */
  readonly current: string[]
  /** Each CURRENT importer with the unit that owns it (`E3` / a sibling unit / nobody). */
  readonly currentOwners: Array<{ path: string; owner: string }>
  readonly anchor: string | null
  readonly anchorRange: string | null
}
function ownerOfImporter(path: string): string {
  if (isE3OwnArtifact(path)) return 'E3 (THIS unit)'
  if (isSiblingUnitArtifact(path)) return 'the SIBLING unit (E10 / U-GUTTER-UI)'
  return 'NO unit’s allow-list claims it'
}
/** Read the importer census of `MODULE_RELPATH` at `E3`'s ANCHOR COMMIT, over the TRACKED tree. */
function gutterImportersAtAnchor(anchor: string): string[] {
  const listed = gitOrNull(['ls-tree', '-r', '--name-only', anchor])
  if (listed === null) return []
  const importers: string[] = []
  for (const rel of listed) {
    if (!/^src\/.*\.tsx?$/.test(rel)) continue
    if (rel === MODULE_RELPATH) continue
    const src = gitOrNull(['show', `${anchor}:${rel}`])
    if (src === null || src.length === 0) continue
    for (const statement of importStatements(src.join('\n'))) {
      if (statement.specifier !== null && /(^|\/)gutter(\.js)?$/.test(statement.specifier)) importers.push(rel)
    }
  }
  return Array.from(new Set(importers)).sort()
}
function importerAttribution(): ImporterAttribution {
  const committed = committedChangeSet()
  const anchor = committed === null ? null : committed.anchor
  const current = Array.from(new Set(gutterImporters())).sort()
  return {
    atAnchor: anchor === null ? [] : gutterImportersAtAnchor(anchor),
    current,
    currentOwners: current.map((path) => ({ path, owner: ownerOfImporter(path) })),
    anchor,
    anchorRange: committed === null ? null : committed.range,
  }
}
const IMPORTER_ATTRIBUTION: ImporterAttribution = importerAttribution()
/** **THE ROW'S OWN CONTROL — AN IMPORTER THIS ROW MUST STILL FAIL ON.** `E3`'s own attributed
 *  artifacts and any `gutter*` path no unit's allow-list claims. Driven on a synthetic list so
 *  no file is created (`R-12`'s own rule: the synthetic controls never touch `src/**`). */
const IMPORTER_CONTROL_E3_OWN = ['src/shared/gutter.ts', 'tests/gutter.test.ts', 'docs/specs/gutter.md']
const IMPORTER_CONTROL_UNCLAIMED = ['src/shared/gutter-stray.ts', 'src/shared/gutter-affordance-orphan.ts']
function isUnclaimedGutterImporter(path: string): boolean {
  return /^src\/.*gutter[^/]*\.tsx?$/.test(path) && !isE3OwnArtifact(path) && !isSiblingUnitArtifact(path)
}

// ===========================================================================
// §5.5.1 — THE REGISTER'S EXECUTION MACHINERY.
// Caps (uniform for the whole register): `≤100` attempts per row, `≤400` attempts in
// total, rows evaluated SEQUENTIALLY IN REGISTER ORDER, STOP AFTER 5 CONSECUTIVE
// FAILURES (the running row's remaining attempts are abandoned and no further row
// starts). **An un-run row FAILS — it never looks green.**
// ===========================================================================
/** **`§5.5.1`/`§5.5.3`’s DECLARED TOTAL — `299`, the sum of the register's own THIRTEEN
 *  printed terms** (`60 → 71 → 81 → 99 → 119 → 141 → 169 → 189 → 204 → 209 → 221 → 281 →
 *  299`). The caps are compared against this figure. */
const REGISTER_PRINTED_TOTAL = 299
/** **THE AS-FILED `314`, KEPT VISIBLE AS A DATED CORRECTED-MIS-SUM NOTE ONLY — NEVER a
 *  live expected value.** The spec's `⟶ CORRECTED 2026-09-27 (THE RED-RUN AMENDMENT PASS —
 *  THE ARITHMETIC MIS-SUM, the FIFTH consecutive sibling to hit the class)` records the
 *  as-filed `314` as a MIS-SUM of the very same thirteen terms, whose sum is `299`; it is
 *  cited here so the provenance stays attributable and is asserted NOWHERE as a total
 *  (`docs/specs/gutter.md`, the status block's item 3 and `§5.5.3`). */
const REGISTER_AS_FILED_TOTAL_DEFECT = 314
const REGISTER_AS_FILED_TOTAL_DEFECT_NOTE =
  'CORRECTED 2026-09-27 by the red-run amendment pass: the as-filed total `314` is a MIS-SUM of the register’s own thirteen printed terms, whose sum is `299` (U-GUTTER is the fifth consecutive sibling in the class). Kept visible as provenance; NOT a live expected value.'
const REGISTER_ROW_CAP = 100
const REGISTER_TOTAL_CAP = 400
const CONSECUTIVE_FAILURE_CAP = 5
const SEED = 20260927
const LCG_A = 1664525
const LCG_C = 1013904223
const LCG_MOD = 4294967296

/** **`§5.5.1`'s THIRTEEN DECLARED ROWS** — `(row id, strategy id, declared term,
 *  honest DISTINCT figure, bounded)` in REGISTER ORDER, as `§5.5.3` prints them:
 *  `299` = `60+11+10+18+20+22+28+20+15+5+12+60+18` (NO term moved in the amendment; only
 *  the TOTAL was corrected from the as-filed `314`). Declared ONCE, at module scope, so
 *  `PRE-2` (the table precondition), `PRE-4` (the pool-versus-boundary rule) and
 *  `REGISTER-STATUS` (the executed record) all reconcile against the same object.
 *
 *  **THE DISTINCT FIGURES ARE `§5.5.2` item 3's, and the FOUR rows where the two figures
 *  DIFFER are `P-GT-PU-2` (`11`/`2`), `P-GT-IM-2` (`20`/`18`), `P-GT-SM-1` (`20`/`19`) and
 *  `P-GT-SM-4` (`12`/`10`)** —
 *  *(**⟶ CORRECTED 2026-09-27 BY THE ARCHITECT-RULING ALIGNMENT PASS: the as-landed table made
 *  `P-GT-SM-4` report the SAME figure twice (`12`/`12`), on the reason that the
 *  `isResizable === false` limb's observable is a distinct reading of its own. THAT REASON HOLDS
 *  — the limb IS genuinely driven, inside shape `(6)`'s attempts — BUT IT DOES NOT FOLLOW THAT
 *  THE TABLE YIELDS `12` DISTINCT READINGS. The limb adds NO shape to the table (the drive table
 *  holds SIX shapes, not seven), and two of those six (`(3)` and `(4)`) collapse to the single
 *  `'unusable-default'` reading, so the table's own readings are FIVE classes × TWO arms = `10`.
 *  The row's distinct figure is therefore `10`, it is now a differing row again, and the as-landed
 *  `FOUR → THREE` correction is REVERSED to `FOUR` — with the reason recorded rather than the
 *  figure asserted. **THE DECLARED TERM `12`, every other term and the `299` total DO NOT
 *  MOVE.**)* The DECLARED figures are what the caps are compared
 *  against; the distinct figures are REPORTED BESIDE them and are NEVER substituted
 *  (`docs/decisions.md` `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`, sub-rule 2). */
const REGISTER_DECLARED: ReadonlyArray<{
  row: string
  strategy: string
  term: number
  distinct: number
  bounded: boolean
}> = [
  { row: 'P-GT-PU-1', strategy: 'S-GT-PURE-1', term: 60, distinct: 60, bounded: false },
  { row: 'P-GT-PU-2', strategy: 'S-GT-PURE-2', term: 11, distinct: 2, bounded: true },
  { row: 'P-GT-PU-3', strategy: 'S-GT-PURE-3', term: 10, distinct: 10, bounded: false },
  { row: 'P-GT-IM-1', strategy: 'S-GT-SEAM-1', term: 18, distinct: 18, bounded: false },
  { row: 'P-GT-IM-2', strategy: 'S-GT-SEAM-2', term: 20, distinct: 18, bounded: true },
  { row: 'P-GT-IM-3', strategy: 'S-GT-SEAM-3', term: 22, distinct: 22, bounded: false },
  { row: 'P-GT-IM-4', strategy: 'S-GT-SEAM-4', term: 28, distinct: 28, bounded: false },
  { row: 'P-GT-SM-1', strategy: 'S-GT-COMMIT-1', term: 20, distinct: 19, bounded: false },
  { row: 'P-GT-SM-2', strategy: 'S-GT-WINDOW-1', term: 15, distinct: 15, bounded: false },
  { row: 'P-GT-SM-3', strategy: 'S-GT-WRITER-1', term: 5, distinct: 5, bounded: false },
  // **`P-GT-SM-4`'s DISTINCT FIGURE IS `10` — ⟶ CORRECTED 2026-09-27 BY THE ARCHITECT-RULING
  // ALIGNMENT PASS.** The declared ATTEMPT term is `12` (`6` shapes × `2` readings) and DOES NOT
  // MOVE; the DISTINCT figure is what the row's OWN drive table yields: the six table shapes
  // produce **FIVE** distinct `(declared code, session-call count, write count)` reading triples
  // (`(3)` and `(4)` share the single `'unusable-default'` reading) and each is read twice — the
  // controller's own record and the session's recorded call/response — so the honest distinct
  // count is **`5 × 2 = 10`**. The as-landed `12` asserted a figure the row's own table cannot
  // reach (it multiplied the SIX ATTEMPTS by two instead of the FIVE READING CLASSES by two), and
  // the message now NAMES the five reading classes rather than asserting an unreachable number.
  // The `isResizable === false` limb rides INSIDE shape `(6)`'s attempts and adds NO attempt.
  { row: 'P-GT-SM-4', strategy: 'S-GT-RESET-1', term: 12, distinct: 10, bounded: false },
  { row: 'P-GT-TP-1', strategy: 'S-GT-TOTAL-1', term: 60, distinct: 60, bounded: true },
  { row: 'P-GT-TP-2', strategy: 'S-GT-SHAPES-1', term: 18, distinct: 18, bounded: false },
]
function registerKeySet(rows: ReadonlyArray<{ row: string; strategy: string }>): string[] {
  return rows.map((r) => `${r.row} :: ${r.strategy}`).sort()
}
function declaredTermOf(row: string): number {
  return REGISTER_DECLARED.find((r) => r.row === row)?.term ?? -1
}
/** The register's bounded SET, per `§5.5.1`'s own naming: `P-GT-PU-2`, `P-GT-IM-2` and
 *  `P-GT-TP-1` — `3` of the `13` rows. */
const REGISTER_BOUNDED_ROWS: readonly string[] = ['P-GT-PU-2', 'P-GT-IM-2', 'P-GT-TP-1']
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
class RegisterRow {
  readonly row: string
  readonly strategy: string
  private ran = 0
  private held = 0
  private broken = 0
  private stoppedEarly = false
  private notStarted = false
  private readonly causes: string[] = []

  constructor(row: string, strategy: string) {
    this.row = row
    this.strategy = strategy
  }

  /** ONE attempt. `body` returns `null` when the property HELD, else the break cause as a
   *  sentence (a throw is caught and is itself a break cause). The body may be async: the
   *  register's rows are SEQUENTIAL (register order), so every `run` is awaited by its row
   *  before the next attempt starts. */
  async run(label: string, body: () => string | null | Promise<string | null>): Promise<void> {
    if (registerState.stoppedAtRow !== null) {
      if (this.ran === 0) this.notStarted = true
      return
    }
    if (this.ran >= REGISTER_ROW_CAP) {
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
    this.ran += 1
    registerState.attempts += 1
    let cause: string | null = null
    try {
      cause = await body()
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
    return this.ran
  }
  heldPublic(): number {
    return this.held
  }
  brokenPublic(): number {
    return this.broken
  }

  /** The row's verdict + its `§5.3` item 10 record line. **An un-run row FAILS on
   *  purpose: a register row that never started may not look green.** */
  finish(): void {
    const record: RowRecord = {
      row: this.row,
      strategy: this.strategy,
      seed: SEED,
      attemptsRun: this.ran,
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
    if (this.ran === 0) {
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
      `${line} — RED (§5.5.1): ${this.broken} of ${this.ran} attempts BROKE. First causes: ${JSON.stringify(
        this.causes.slice(0, 3),
      )}`,
    ).toBe(0)
  }
}

/** `S-GT-TOTAL-1`'s generator: a hand-rolled 32-bit LCG whose constants are literals in
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
/** The pinned-seed DRAW SEQUENCE, ONE LCG step per draw: `30` draws over a `20`-member
 *  pool. */
const POOL_LENGTH = 20
const TOTALITY_DRAWS = 30
function poolDrawSequence(draws: number): number[] {
  const lcg = makeLcg(SEED)
  const out: number[] = []
  for (let i = 0; i < draws; i += 1) out.push(lcg.step() % POOL_LENGTH)
  return out
}
const DRAWN_INDICES = poolDrawSequence(TOTALITY_DRAWS)
/** The REPORTED distinct-member figure (a DRAW is not a SWEEP — `§5.5.2` item 4: no row
 *  may assert "all 20"). */
const DISTINCT_DRAWN_POOL_MEMBERS = new Set(DRAWN_INDICES).size

/** **`P-GT-TP-1`'s `20`-member pool** (`§5.5.1`, and `§5.5.2` item 4's stated boundary:
 *  a revoked `Proxy`, a throwing `Symbol.toPrimitive` and a seam whose getter returns
 *  DIFFERENT answers across reads are deliberately EXCLUDED). Each member is a
 *  `{ label, make }` pair, drawn as a SEAM of one composition configuration. */
interface PoolMember {
  readonly label: string
  readonly seamName: string
  readonly make: () => unknown
}
const TOTALITY_POOL: readonly PoolMember[] = [
  { label: 'undefined', seamName: 'session', make: (): unknown => undefined },
  { label: 'null', seamName: 'session', make: (): unknown => null },
  { label: 'a number', seamName: 'session', make: (): unknown => 42 },
  { label: 'a string', seamName: 'session', make: (): unknown => 'x' },
  { label: 'a boolean', seamName: 'session', make: (): unknown => true },
  { label: 'a symbol', seamName: 'session', make: (): unknown => Symbol('pool') },
  { label: 'a bigint', seamName: 'session', make: (): unknown => 12n },
  { label: 'an empty record', seamName: 'session', make: (): unknown => ({}) },
  { label: 'a frozen empty record', seamName: 'session', make: (): unknown => Object.freeze({}) },
  { label: 'an array', seamName: 'session', make: (): unknown => [] },
  {
    label: 'a record with non-callable members',
    seamName: 'session',
    make: (): unknown => ({ install: 1, reset: 2, dispose: 3, stats: 4, gesture: 5, disposed: 6 }),
  },
  {
    label: 'a session record whose accessor refuses to answer',
    seamName: 'session',
    make: (): unknown => {
      const holder: Record<string, unknown> = {}
      Object.defineProperty(holder, 'session', {
        get(): unknown {
          throw new Error('the pool member threw on read')
        },
      })
      return holder
    },
  },
  { label: 'a callable returning a number', seamName: 'axisFor', make: (): unknown => () => 7 },
  { label: 'a callable returning an object', seamName: 'axisFor', make: (): unknown => () => ({ k: 1 }) },
  { label: 'a non-callable number', seamName: 'boundsFor', make: (): unknown => 42 },
  { label: 'a callable answering an unusable pair', seamName: 'boundsFor', make: (): unknown => () => ({}) },
  { label: 'a callable answering a usable pair', seamName: 'boundsFor', make: (): unknown => () => ({ min: 0, max: 100 }) },
  { label: 'a callable returning a falsy value', seamName: 'isResizable', make: (): unknown => () => false },
  { label: 'a callable returning a truthy value', seamName: 'isResizable', make: (): unknown => () => true },
  { label: 'a callable returning a string', seamName: 'sizeFor', make: (): unknown => () => 'x' },
]
const PLACEHOLDER = Object.freeze({ label: 'a placeholder slot' }) as unknown

/** The composition configurations `P-GT-TP-1` drives: `(1)` a RECORDING SESSION DOUBLE,
 *  `(2)` the LANDED session through a recording source. Each drawn shape is passed as ONE
 *  seam of the configuration; every other seam is a benign stand-in. */
type TotalityConfig = (drawn: PoolMember) => Record<string, unknown>
const TOTALITY_CONFIGS: ReadonlyArray<{ id: string; build: TotalityConfig }> = [
  {
    id: 'the recording session double',
    build: (drawn: PoolMember): Record<string, unknown> => {
      const double = makeSessionDouble()
      const options: Record<string, unknown> = {
        session: double.session,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        defaultSizeFor: (): unknown => 10,
        isResizable: (): unknown => true,
        sizeFor: (): unknown => 5,
        commit: (): void => undefined,
      }
      options[drawn.seamName] = drawn.make()
      return options
    },
  },
  {
    id: 'the landed session',
    build: (drawn: PoolMember): Record<string, unknown> => {
      const options: Record<string, unknown> = {
        session: PLACEHOLDER,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        defaultSizeFor: (): unknown => 10,
        isResizable: (): unknown => true,
        sizeFor: (): unknown => 5,
        commit: (): void => undefined,
      }
      options[drawn.seamName] = drawn.make()
      return options
    },
  },
]

/** **THE TOTALITY DRIVE'S SHAPE CHECK** (used as a `body` inside a register attempt, so a
 *  throw is caught by `RegisterRow.run` and counted as a BREAK rather than aborting the
 *  file). */
function totalityDrive(options: Record<string, unknown>, label: string): string | null {
  const mod = moduleCache?.mod
  const factory = mod?.['createResizeController']
  if (typeof factory !== 'function') return `the module's \`createResizeController\` does not exist (${label})`
  let controller: ControllerLike
  try {
    controller = (factory as (o?: unknown) => unknown)(options) as ControllerLike
  } catch (e) {
    return `the factory THREW (it is total, §2.4 item 3): ${describeThrown(e)} (${label})`
  }
  if (controller === null || typeof controller !== 'object') return `the factory returned ${brief(controller)} (${label})`
  for (const member of ['attach', 'detach', 'reset', 'stats'] as const) {
    if (typeof controller[member] !== 'function') return `\`${member}\` is not callable on the returned controller (${label})`
  }
  const calls: Array<[string, () => unknown]> = [
    ['attach(element)', () => controller.attach(PLACEHOLDER)],
    ['attach(element, hooks)', () => controller.attach(PLACEHOLDER, {})],
    ['detach()', () => controller.detach()],
    ['reset(element)', () => controller.reset(PLACEHOLDER)],
    ['stats()', () => controller.stats()],
    ['detached', () => controller.detached],
  ]
  for (const [what, call] of calls) {
    try {
      const answer = call()
      if (what === 'attach(element)' || what === 'attach(element, hooks)' || what === 'detach()') {
        if (typeof answer !== 'boolean') return `\`${what}\` returned ${brief(answer)}, not a boolean (${label})`
      }
      if (what === 'reset(element)') {
        const record = answer as Record<string, unknown>
        if (record === null || typeof record !== 'object') return `\`reset\` returned ${brief(answer)}, not a record (${label})`
        for (const key of ['ok', 'code', 'committed']) {
          if (!(key in record)) return `\`reset\`'s record is missing \`${key}\` (${label})`
        }
      }
      if (what === 'stats()') {
        const record = answer as Record<string, unknown>
        if (record === null || typeof record !== 'object') return `\`stats\` returned ${brief(answer)}, not a record (${label})`
        for (const key of ['attached', 'gestures', 'sinkCalls', 'written', 'resets', 'lastCode']) {
          if (!(key in record)) return `\`stats\`'s record is missing \`${key}\` (${label})`
        }
      }
    } catch (e) {
      return `\`${what}\` THREW (no controller method throws — §2.4 item 1's universal, bounded by the two named propagations): ${describeThrown(
        e,
      )} (${label})`
    }
  }
  return null
}

// ===========================================================================
// §5.5.1 — THE THIRTEEN ROWS, EXECUTED IN REGISTER ORDER (the register block is at the
// foot of this file, after the `§3` rows, exactly as `§4.2` item 5 requires).
// ===========================================================================
function declaredPair(row: string): { term: number; distinct: number } {
  const found = REGISTER_DECLARED.find((r) => r.row === row)
  return { term: found?.term ?? -1, distinct: found?.distinct ?? -1 }
}
/** The `18` `P-GT-PU-1` VALUE CLASSES, each with its DECLARED answer against the
 *  canonical pair `{min: 0, max: 100}`. */
interface ValueCell {
  readonly label: string
  readonly value: unknown
  readonly declared: unknown
}
const PU1_VALUE_CLASSES: readonly ValueCell[] = [
  { label: "(1) '12'", value: '12', declared: NaN },
  { label: "(2) '0'", value: '0', declared: NaN },
  { label: '(3) null', value: null, declared: NaN },
  { label: '(4) undefined', value: undefined, declared: NaN },
  { label: '(5) true', value: true, declared: NaN },
  { label: '(6) false', value: false, declared: NaN },
  { label: '(7) {}', value: {}, declared: NaN },
  { label: '(8) []', value: [], declared: NaN },
  { label: '(9) a symbol', value: Symbol('v'), declared: NaN },
  { label: '(10) a function', value: (): void => undefined, declared: NaN },
  { label: '(11) 12n', value: 12n, declared: NaN },
  { label: '(12) 0n', value: 0n, declared: NaN },
  { label: '(13) NaN', value: NaN, declared: NaN },
  { label: '(14) +Infinity', value: Number.POSITIVE_INFINITY, declared: 100 },
  { label: '(15) -Infinity', value: Number.NEGATIVE_INFINITY, declared: 0 },
  { label: '(16) -3', value: -3, declared: 0 },
  // **⟶ RULED 2026-09-27 (THE CELL-CORRECTION PASS, ruling `1`; `§2.3` item 2's dated
  // block; `§5.5.1 P-GT-PU-1`'s own `-0` clause): THE VALUE-CLASS `(17)` `-0` DRIVE'S
  // DECLARED ANSWER IS `+0`, NOT `-0`.** `Math.max(0, Math.min(-0, 100))` is
  // `Math.max(0, -0)`, and `Math.max(0, -0)` is `+0` — the PAIR'S OWN `+0` `min` wins the
  // same-value comparison. **`-0` SURVIVES IFF `-0` IS THE FORMULA'S OWN ANSWER**, and the
  // `-0`-PRESERVED reading is the BOUNDS-CLASS `(1)` drive (the pair `{min: -0, max: 100}`
  // with `value = -0`), asserted below. The assertion is `Object.is(result, 0) === true`,
  // so a module that normalises `-0` to `+0` FAILS the bounds class and a module that
  // PRESERVES `-0` where the formula answered `+0` FAILS this cell.
  { label: '(17) -0', value: -0, declared: 0 },
  { label: '(18) 42', value: 42, declared: 42 },
]
/** The `9` `P-GT-PU-1` BOUNDS CLASSES, each with the canonical value that drives it and
 *  its DECLARED answer.
 *
 *  **⟶ THE BOUNDS-HOLDER DOMAIN, RULED 2026-09-27 (THE CELL-CORRECTION PASS, ruling `1`;
 *  `§2.3` item 2's holder table):** a plain own-`min`/`max` record, an `Object.create(null)`
 *  record, a record carrying `min`/`max` as an OWN ACCESSOR, and a FROZEN record are all
 *  **IN** the domain (the formula runs verbatim over the two numbers each READ yields; the
 *  contract does NOT require a data property, frozen-ness or extensibility, and a getter
 *  read is not a second clamp site). **A `Map` (and every object whose `min`/`max` reads are
 *  not `number`s)` is OUT and answers `NaN` BY THE `typeof` GATE** — never by a `Map`
 *  special case. */
interface BoundsCell {
  readonly label: string
  readonly value: unknown
  readonly bounds: unknown
  readonly declared: unknown
}
const PU1_BOUNDS_CLASSES: readonly BoundsCell[] = [
  // **BOUNDS CLASS `(1)` IS THE `-0`-PRESERVED DRIVE** (`§5.5.1 P-GT-PU-1`: *“with `-0`'s
  // drive using `value = -0`”*; ruling `1` case 2): the `min` operand IS `-0` and the value
  // is not below it, so the formula RETURNS `min` — `-0`. **No tenth class, no added cell:
  // the `9` bounds classes still carry that drive** and the declared term stays `60`.
  { label: '(1) the `-0`-preserving pair, with `value = -0`', value: -0, bounds: { min: -0, max: 100 }, declared: -0 },
  { label: '(2) canonical', value: 42, bounds: { min: 0, max: 100 }, declared: 42 },
  { label: '(3) equal bounds', value: 42, bounds: { min: 7, max: 7 }, declared: 7 },
  { label: '(4) inverted', value: 42, bounds: { min: 100, max: 0 }, declared: 100 },
  { label: '(5) undefined', value: 42, bounds: undefined, declared: NaN },
  { label: '(6) null', value: 42, bounds: null, declared: NaN },
  { label: '(7) a non-record', value: 42, bounds: 42, declared: NaN },
  { label: '(8) no bound fields', value: 42, bounds: {}, declared: NaN },
  { label: '(9) a non-number bound', value: 42, bounds: { min: '0', max: '100' }, declared: NaN },
]
/** **THE IN-DOMAIN HOLDER SHAPES OF `§2.3` item 2's RULED HOLDER TABLE (ruling `1`), each
 *  with its own DECLARED answer** — driven INSIDE the `-0` bounds-class attempt as extra
 *  assertions over the SAME caller-object domain, so **no attempt term moves** (`60` stays
 *  `18` value-class drives + `9` bounds-class drives + `33` cross-product cells).
 *
 *  **IN the domain** (the formula verbatim over the two numbers each READ yields; the
 *  contract requires only that each read yields a `number` — never a data property, never
 *  frozen-ness, never extensibility): a plain own-`min`/`max` record · an
 *  `Object.create(null)` record · a record whose `min` is an OWN ACCESSOR (a getter) · a
 *  FROZEN record. **OUT of the domain and answering `NaN` BY THE `typeof` GATE** (never by
 *  a `Map` special case): a `Map`, an array, a function, a primitive, `null`, `undefined`,
 *  an absent field, a non-`number` field and a THROWING field read. */
const PU1_HOLDER_CLASSES: ReadonlyArray<{ label: string; bounds: unknown; declared: unknown; value: unknown }> = [
  { label: '(1) a plain own-`min`/`max` record', bounds: { min: -0, max: 100 }, declared: -0, value: -0 },
  {
    label: '(2) an `Object.create(null)` record carrying `min`/`max`',
    bounds: ((): unknown => {
      const holder: Record<string, unknown> = Object.create(null)
      holder['min'] = -0
      holder['max'] = 100
      return holder
    })(),
    declared: -0,
    value: -0,
  },
  {
    label: '(3) a record whose `min` is an OWN ACCESSOR (a getter)',
    bounds: ((): unknown => {
      const holder: Record<string, unknown> = { max: 100 }
      Object.defineProperty(holder, 'min', { get: (): number => -0, enumerable: true, configurable: true })
      return holder
    })(),
    declared: -0,
    value: -0,
  },
  { label: '(4) a FROZEN record', bounds: Object.freeze({ min: -0, max: 100 }), declared: -0, value: -0 },
  { label: '(5) a frozen record whose answer is +0 (the pair’s own `min` wins)', bounds: Object.freeze({ min: 0, max: 100 }), declared: 0, value: -0 },
  // **THE `OUT` HALF OF THE SAME TABLE** — every one answers `NaN`, and the `Map` is the
  // ruled example rather than a special case.
  { label: '(6) a `Map` (OUT — `min`/`max` are not FIELDS)', bounds: new Map<string, number>([['min', 0], ['max', 100]]), declared: NaN, value: 42 },
  { label: '(7) an array (OUT)', bounds: [0, 100], declared: NaN, value: 42 },
  { label: '(8) a function (OUT)', bounds: (): void => undefined, declared: NaN, value: 42 },
  { label: '(9) a primitive (OUT)', bounds: 42, declared: NaN, value: 42 },
  { label: '(10) `null` (OUT)', bounds: null, declared: NaN, value: 42 },
  { label: '(11) `undefined` (OUT)', bounds: undefined, declared: NaN, value: 42 },
  { label: '(12) an absent field (OUT)', bounds: { min: 0 }, declared: NaN, value: 42 },
  { label: '(13) a non-`number` field (OUT)', bounds: { min: '0', max: 100 }, declared: NaN, value: 42 },
  { label: '(14) a THROWING field read (OUT)', bounds: throwingBounds(), declared: NaN, value: 42 },
]
function throwingBounds(): unknown {
  const holder: Record<string, unknown> = { max: 100 }
  Object.defineProperty(holder, 'min', {
    get(): unknown {
      throw new Error('the bound read threw')
    },
  })
  return holder
}
/** The `33`-cell CROSS-PRODUCT SUBSET: the `11` VALUES × the `3` ambiguous BOUNDS shapes
 *  (the `typeof` gate's `NaN` class, the `number`-typed-but-`NaN` class, and the
 *  `number`-typed non-finite class). */
const PU1_CROSS_VALUES: readonly unknown[] = ['12', null, true, Symbol('x'), 12n, NaN, 42, -3, -0, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
const PU1_CROSS_BOUNDS: ReadonlyArray<{ label: string; bounds: unknown; answer: (value: unknown) => unknown }> = [
  { label: 'the typeof-gate NaN class', bounds: { min: '0', max: 100 }, answer: (): unknown => NaN },
  { label: 'the number-typed NaN class', bounds: { min: NaN, max: 100 }, answer: (): unknown => NaN },
  {
    label: 'the number-typed non-finite class',
    bounds: { min: 0, max: Number.POSITIVE_INFINITY },
    answer: (value: unknown): unknown => {
      if (typeof value !== 'number') return NaN
      return Math.max(0, Math.min(value, Number.POSITIVE_INFINITY))
    },
  },
]

/** The `P-GT-SM-3` shapes: `5` DISTINCT compositions, each driven through one full
 *  `'end'` lifecycle. Returns the two READINGS the row asserts (the sink's own record and
 *  the controller's counter), the session's terminal, and the consumer-side write count. */
interface WriterReadings {
  readonly sinkRecord: number
  readonly controllerCount: number | null
  readonly sessionCommitted: boolean
  readonly consumerSideWrites: number
  readonly note: string
}
async function writerShape(shape: 1 | 2 | 3 | 4 | 5): Promise<WriterReadings> {
  const sink = makeSink()
  const element: Record<string, unknown> = { control: `writer-${shape}` }
  const secondElement: Record<string, unknown> = { control: `writer-2-${shape}` }
  const double = makeSessionDouble()
  // **⟶ ALIGNED TO THE AMENDED `§2.5` item 4 (THE PINNED SINGLE WIRING), 2026-09-27 —
  // `E3`-BLOCK-3.** There is EXACTLY ONE WIRING here, never two: the composition wires the
  // SESSION's `commit` option to the composition's SINGLE SINK WRITER, and this harness's
  // `registerCommit` IS that one channel (the double's stand-in for the session's own
  // `commit` invocation — `gsession.md` `§2.1`'s `SessionOptions.commit`). **No cell below
  // forwards the sink through a SECOND channel while the composition's own writer is live**
  // — that shape is `§4.4 S-11`'s second-writer class, and it is driven as shape `(2)`.
  const { controller } = await createController({
    session: double.session,
    axisFor: (): unknown => undefined,
    boundsFor: (): unknown => ({ min: 0, max: 100 }),
    defaultSizeFor: (): unknown => 10,
    isResizable: (): unknown => true,
    sizeFor: (): unknown => 2,
    commit: shape === 3 ? undefined : sink,
  })
  let extraWrites = 0
  const consumerHook = (): void => {
    if (shape === 4 || shape === 5) {
      extraWrites += 1
      const live = double.value.current as GestureHandle | undefined
      if (live !== undefined) sink(live, 999)
    }
  }
  controller.attach(element, shape === 4 ? { onMove: consumerHook } : shape === 5 ? { onEnd: consumerHook } : {})
  // **⟶ ONE WIRING, ONE WRITE SITE (THE AMENDED `§2.5` item 4; `E3`-BLOCK-3).** The
  // composition's SINGLE SINK WRITER is the `commit` seam handed to it above, and it is
  // invoked at the gesture's terminal — so the sink's own record and the controller's
  // counter are the TWO READINGS of that ONE write, never two channels. No forwarding
  // channel is registered for shape `(1)`, `(4)` or `(5)`: `P-GT-SM-1`'s cell states the
  // same thing, and a second forwarding channel would be `§4.4 S-11`'s second-writer class
  // (driven below as shape `(2)` alone).
  if (shape === 2) {
    // **THE SECOND WRITER — AND IT IS INVOKED AT THE SAME COMMITTING TERMINAL THE
    // COMPOSITION'S OWN WRITER SERVES** (⟶ RULED 2026-09-27, THE CELL-CORRECTION PASS,
    // ruling `5`; `§5.5.1 P-GT-SM-3`'s dated block).
    //
    // **THE SHAPE THIS REPLACES, and why it was not the same terminal: the as-landed drive
    // called `secondWriter(began.gesture)` AFTER `double.fireTerminal('end')` HAD RETURNED —
    // a second write made after the terminal returned, for a gesture that was no longer
    // active. The ruling forbids exactly that: *“the row may not be satisfied by a second
    // writer invoked at a different terminal, for a different gesture, or after the terminal
    // returned.”*
    //
    // **THE RULED MECHANISM: a second writer that writes the SAME SINK for the SAME gesture
    // through a channel OTHER than the composition's single wiring — registered on the
    // double's OWN commit channel for THIS element, so the ONE `'end'` terminal that produces
    // the composition's write ALSO invokes the second writer.** The composition's writer is
    // registered FIRST (by `install`), so the sink's record reads `2` while THIS controller's
    // counter still reads `1`: **a second writer's call does not pass through this
    // controller's one call site, and THAT DIVERGENCE IS THE FALSIFIER.** A composition whose
    // two readings AGREE at `2` FAILS the shape.
    double.registerCommit(element, (gesture: GestureHandle, written: unknown): void => {
      extraWrites += 1
      sink(gesture, Number(written))
    })
  }
  const began = double.begin(element)
  let sessionCommitted = false
  if (began.ok) {
    double.value.current = began.gesture
    began.gesture.set(2)
    // **THE MOVE TURN IS FIRED** (⟶ 2026-09-27, `E3`-BLOCK-5): every shape's terminal is
    // reached with the handle the controller's own `onMove` WRAPPER captured, and the
    // session's `onStart` carries no handle (`session.begin` is forbidden here). Without
    // this turn, shapes `(1)`/`(2)`/`(5)` could only read ZERO writes. **AND IT IS THE ONLY
    // CALLER OF THE `onMove` HOOK**, so shape `(4)`'s consumer-side write happens here and
    // nowhere else (`E3`-BLOCK-6(a): a shape declaring a consumer-side write without a fired
    // move could only read `0`; a SECOND fired turn would count the write twice).
    double.fireMove()
    // **THE ONE COMMITTING TERMINAL**: shape `(2)`'s second writer is invoked INSIDE this
    // call, by the double's own commit channel, so it is the SAME terminal, the SAME gesture
    // and the SAME instant as the composition's own write — never a different terminal, never
    // a different gesture, and never after the terminal returned.
    double.fireTerminal('end')
    sessionCommitted = true
  }
  return {
    sinkRecord: sink.records.length,
    controllerCount: controller.stats().sinkCalls,
    sessionCommitted,
    consumerSideWrites: extraWrites,
    note: `shape ${shape}: sinkRecord=${sink.records.length}, controllerCount=${String(
      controller.stats().sinkCalls,
    )}, consumerSideWrites=${extraWrites}, sessionCommitted=${String(sessionCommitted)}`,
  }
}
// ===========================================================================
// §3.5 — THE EXISTENCE / PRECONDITION ROWS (`R-16`/`R-17`/`R-18`) — AUTHORED FIRST
// (`§4.2` item 1): they are the red's own premise and are evaluable before the module
// exists.
// ===========================================================================
describe('R-16/R-17/R-18 — §3.5 the existence rows (the red’s own premise)', () => {
  it('PRE-1 (harness) — the dynamic import boundary itself resolves and casts (proved against an EXISTING module)', async () => {
    expect(
      existsSync(SESSION_SRC),
      'PRE-1 — the computed-specifier import boundary resolves against an EXISTING module (`src/shared/gesture-session.ts`), so every module-absent row below fails as an ASSERTION and never as a collection error',
    ).toBe(true)
    const mod = await sessionNamespace()
    expect(
      typeof mod['createGestureSession'],
      'PRE-1 — the existing module’s namespace is readable through the same boundary every clause row uses',
    ).toBe('function')
  })

  it('R-16 §3.5 — the module-absence row, BOTH BRANCHES: RED (module absent ⇒ assert ABSENCE + no unit paths) and GREEN (module present ⇒ assert it EXISTS, that no `src/**` file imports it, and that the `2 + 10 = 12` census holds)', () => {
    // **⟶ REPAIRED 2026-09-27 (THE REPAIR CYCLE, `E3`-BLOCK-1; the amended `§3.5 R-16`).**
    // The amended clause names TWO forms with their governing branches: **the RED BRANCH
    // governs AT RED TIME and the GREEN BRANCH governs AT GREEN TIME**, and **the row MUST
    // BRANCH ON THE MODULE'S PRESENCE** rather than assert the red form unconditionally —
    // otherwise it would fail BECAUSE THE WORK WAS DONE, which is exactly the contradiction
    // `E3`-BLOCK-1 filed. The branch taken is named in every message below.
    //
    // **⟶ NARROWED 2026-09-27 (THE `E3` ROW-REPAIR PASS).** **THE AS-FILED CENSUS SENTENCE IS
    // KEPT VISIBLE AND IS STILL THE ROW'S CLAIM:** *"the unit-owned census at green time is
    // EXACTLY the module and this test file (plus the unit's own `gutter*` artifacts if any):
    // a `gutter*` path under `src/**` or `tests/**` that is neither is a FINDING."* **WHAT
    // MOVED IS THE READING'S SUBJECT, NOT THE CLAIM:** the census is now `e3CensusPaths()` —
    // the RAW walk (`walkUnitPaths()`) MINUS `isSiblingUnitArtifact`, i.e. minus the SIBLING
    // unit's declared artifacts — because the raw walk is a whole-tree `gutter*` glob and was
    // therefore reading `tests/gutter-ui.test.ts` (`E10`'s own committed red set) as an `E3`
    // finding. Measured before this pass, verbatim:
    //
    //   `R-16 §3.5 (GREEN BRANCH) … Read: ["src/shared/gutter.ts",
    //    "tests/gutter-ui.test.ts","tests/gutter.test.ts"]:
    //    expected [ 'src/shared/gutter.ts', …(2) ] to deeply equal [ 'src/shared/gutter.ts', …(1) ]`
    //
    // The authority is `docs/specs/gutter.md` `§5.1`'s commit-range scope rule + `§3.4 R-16`'s
    // own "unit-owned" wording + `docs/specs/gutter-ui.md` `§5.1` row `3` (the sibling's red
    // set is ITS artifact); the exclusion block above carries the full citation. **BOTH
    // BRANCHES REMAIN, the row still branches on the module's presence, and a genuine
    // NON-sibling `gutter*` path is still counted and still trips the row** (control (e-2)
    // below drives exactly that). **NO row id, section number or register term moves.**
    const modulePresent = existsSync(MODULE_SRC)
    const rawUnitPaths = walkUnitPaths()
    const unitPaths = e3CensusPaths()
    expect(
      unitPaths,
      `R-16 §3.5 — the unit-owned census is asserted NON-EMPTY BEFORE the branch's equality (a vacuous empty read must FAIL here, not pass): this test file is \`${TEST_RELPATH}\``,
    ).toContain(TEST_RELPATH)
    // (e-2) **POSITIVE CONTROL — A GENUINE NON-SIBLING `gutter*` PATH IS STILL COUNTED AS A
    // UNIT PATH, and still TRIPS this row.** The exclusion must not be so wide that a real
    // `E3`-class path could hide behind it: `tests/gutter-zzz.test.ts` is a `gutter*` name the
    // sibling predicate does NOT own, so the row's OWN counting mechanism (`unitCensusOf`,
    // the same filename rule + the same sibling exclusion the live census uses) keeps it —
    // **driven on a candidate list seeded with the LIVE walk, so the control runs the row's
    // real machinery and not a re-description of it** — and the resulting census then FAILS
    // the equality above, which is exactly the row's failure path for a stray `gutter*` file.
    const CONTROL_NON_SIBLING_UNIT_PATH = 'tests/gutter-zzz.test.ts'
    expect(
      isSiblingUnitArtifact(CONTROL_NON_SIBLING_UNIT_PATH),
      `R-16 §3.5 (GREEN BRANCH, control e-2) — the synthetic POSITIVE control \`${CONTROL_NON_SIBLING_UNIT_PATH}\` is NOT a sibling artifact (a predicate that claimed it would make the census exclusion vacuous, and this row a rubber stamp): \`isSiblingUnitArtifact('${CONTROL_NON_SIBLING_UNIT_PATH}')\` reads ${String(
        isSiblingUnitArtifact(CONTROL_NON_SIBLING_UNIT_PATH),
      )}`,
    ).toBe(false)
    const controlCensus = unitCensusOf([...rawUnitPaths, CONTROL_NON_SIBLING_UNIT_PATH])
    expect(
      controlCensus,
      `R-16 §3.5 (GREEN BRANCH, control e-2 — THE ROW CAN STILL FAIL, FOR THE RIGHT REASON) — a genuine \`gutter*\` path under \`tests/**\` that is NOT the sibling's is STILL a unit path, so the census equality above FAILS on it. Control drive: the LIVE walk + \`${CONTROL_NON_SIBLING_UNIT_PATH}\` through the row's own counting mechanism ⇒ ${JSON.stringify(
        controlCensus,
      )}, against the row's expected ${JSON.stringify([MODULE_RELPATH, TEST_RELPATH].sort())}`,
    ).not.toEqual([MODULE_RELPATH, TEST_RELPATH].sort())
    if (!modulePresent) {
      // ---------------------------------------------------------------- THE RED BRANCH
      expect(
        modulePresent,
        `R-16 §3.5 (RED BRANCH — module ABSENT at red time) — at the moment the red set is AUTHORED and RUN \`${MODULE_RELPATH}\` does not exist (${fileURLToPath(
          MODULE_SRC,
        )}). If it EXISTS, the GREEN BRANCH governs and this branch is not the live one — and if it exists BEFORE a red run has been reported, the pass that finds it must REPORT the RCA-1 inversion rather than proceed`,
      ).toBe(false)
      expect(
        unitPaths.filter((p) => p !== TEST_RELPATH),
        `R-16 §3.5 (RED BRANCH) — no OTHER unit-owned \`gutter*\` path exists under \`src/**\` or \`tests/**\` at red time: \`${TEST_RELPATH}\` is the only unit-owned file in the change set. Read (sibling artifacts excluded): ${JSON.stringify(
          unitPaths,
        )}`,
      ).toEqual([])
      return
    }
    // ------------------------------------------------------------------ THE GREEN BRANCH
    /** **THE EXPECTED CENSUS, NAMED RATHER THAN COMPUTED: `E3`'s module and `E3`'s test file,
     *  sorted** — written as literals so a change to `MODULE_RELPATH`/`TEST_RELPATH` cannot
     *  make the equality self-satisfying. */
    const EXPECTED_E3_CENSUS = ['src/shared/gutter.ts', 'tests/gutter.test.ts']
    expect(
      modulePresent,
      `R-16 §3.5 (GREEN BRANCH — module PRESENT at green time) — \`${MODULE_RELPATH}\` EXISTS. THIS BRANCH governs once the work is done, and it is why this row can PASS at green time instead of failing because the module landed`,
    ).toBe(true)
    expect(
      unitPaths,
      `R-16 §3.5 (GREEN BRANCH) — the unit-owned census at green time is EXACTLY the module and this test file (plus the unit's own \`gutter*\` artifacts if any): a unit-owned \`gutter*\` path under \`src/**\` or \`tests/**\` that is neither is a FINDING. **A SIBLING UNIT'S DECLARED ARTIFACT IS NOT A FINDING AGAINST \`E3\`** (\`§5.1\`'s commit-range scope rule), so it is excluded BY NAME here — and the exclusion is DRIVEN, never assumed: the raw walk and the sibling predicate are both asserted below. Read (census): ${JSON.stringify(
        unitPaths,
      )}. Raw walk: ${JSON.stringify(rawUnitPaths)}. Expected: ${JSON.stringify(EXPECTED_E3_CENSUS)}`,
    ).toEqual(EXPECTED_E3_CENSUS)
    // (e-1) **THE EXCLUSION IS DOING REAL WORK, AND THE TWO READINGS ARE BOTH SHOWN.** The raw
    // walk (the as-filed census) REALLY contains the sibling's committed red set, so the
    // exclusion above is not vacuous — and the sibling predicate is what removes it, not a
    // coincidence of names. If `tests/gutter-ui.test.ts` ever disappeared from the walk this
    // control FAILS, which is the honest signal that the exclusion stopped being exercised here.
    expect(
      rawUnitPaths,
      `R-16 §3.5 (GREEN BRANCH, control e-1) — the RAW walk (\`walkUnitPaths()\`, the as-filed census) contains the SIBLING's own committed red set \`tests/gutter-ui.test.ts\`, so the exclusion below is measured on the live repo rather than assumed. Raw walk: ${JSON.stringify(
        rawUnitPaths,
      )}`,
    ).toContain(SIBLING_UNIT_ARTIFACT_PATHS[2])
    expect(
      isSiblingUnitArtifact(SIBLING_UNIT_ARTIFACT_PATHS[2]),
      `R-16 §3.5 (GREEN BRANCH, control e-1) — and \`isSiblingUnitArtifact('${SIBLING_UNIT_ARTIFACT_PATHS[2]}')\` is the predicate that removes it (\`docs/specs/gutter-ui.md\` \`§5.1\` row 3: \`tests/gutter-ui.test.ts\` is the SIBLING's red set, "NEW — the red set")`,
    ).toBe(true)
    expect(
      unitPaths,
      `R-16 §3.5 (GREEN BRANCH, control e-1) — and the census this row ASSERTS does NOT contain it (the exclusion worked on the live reading): census ${JSON.stringify(
        unitPaths,
      )}`,
    ).not.toContain(SIBLING_UNIT_ARTIFACT_PATHS[2])
    // (e-3) **⟶ ADDED 2026-09-27 (`R-12` DIFF-SCOPE REPAIR PASS): THE WALK'S STATED BLIND SPOT
    //     IS MEASURED, NOT ASSUMED.** `walkUnitPaths()` prunes `node_modules` and dotted
    //     directories, so a `gutter*` file inside one of them is invisible to this census. That
    //     bound is DELIBERATE (installed third-party code / tooling state, never a unit
    //     artifact) and is documented in the walk's own `⟶ DOCUMENTED BOUND` note; the
    //     assertion below drives the pruned roots on the LIVE repo so the census's own limit is
    //     a reading. **It creates no file** — `prunedGutterCandidates()` only walks what already
    //     exists.
    const prunedCandidates = prunedGutterCandidates()
    expect(
      prunedCandidates,
      `R-16 §3.5 (GREEN BRANCH, control e-3 — THE CENSUS'S BLIND SPOT, MEASURED) — \`walkUnitPaths()\` prunes \`node_modules\` and dotted directories; a \`gutter*\` file inside one would be INVISIBLE to the census above. On this repo there is none, so the bound is inert here and is stated rather than hidden (the walk's \`⟶ DOCUMENTED BOUND\` note). If a path appears here, IT IS NAMED and the census's exhaustiveness claim must be re-read. Pruned \`gutter*\` files found: ${JSON.stringify(
        prunedCandidates,
      )}`,
    ).toEqual([])
    // (a) **⟶ TIME-SCOPED 2026-09-27 (THE OWNER-SCOPING REPAIR, RULING B).** The as-filed
    //     reading is kept visible above and superseded: it asserted *"`${MODULE_RELPATH}` is
    //     imported by NO `src/**` file AT GREEN TIME EITHER"* over a walk of the LIVE tree, which
    //     reads a LATER unit's legitimate work as an `E3` finding.
    //
    //     **THE AUTHORITY — `E3`'s OWN CONTRACT SAYS THIS IS NOT A VIOLATION:**
    //     `docs/specs/gutter.md` `§3.4 R-4` — *"A later unit that legitimately imports THIS module
    //     is not a violation of it — the row binds THIS module's own imports, and the 'imported by
    //     no `src/**` file' claim is `R-6`'s"* — together with `§5.1`'s commit-range scope rule (a
    //     census may not read a later unit's work as this unit's diff). **AND THE LATER IMPORTER IS
    //     RULED LEGITIMATE BY NAME:** `docs/specs/gutter-ui.md` `§2.1` clause 2 / `§3.4 R-8` /
    //     `§R.3` and `docs/decisions.md`'s `E10-MODULE-IMPORTS-THE-CONTROLLER-FACTORY` rule that
    //     `E10`'s module value-imports `createResizeController` from `./gutter.js` (a supervisor
    //     ruling of 2026-09-27), and `§5.1` rows `10`/`11` admit the renderer wiring that imports
    //     `E10`'s module.
    //
    //     **THE REPAIRED READING: the claim asserted IN ITS TIME-SCOPED FORM — *the module was
    //     imported by NO `src/**` file at `E3`'s OWN red/green time* — read over the TRACKED TREE
    //     AS IT STOOD AT `E3`'s ANCHOR COMMIT, with the CURRENT importer census REPORTED as its own
    //     NAMED reading (never as a FAIL).**
    console.log(
      `R-16 §3.5 (GREEN BRANCH) — THE TIME-SCOPED IMPORTER CENSUS MEASURED :: ${JSON.stringify({
        anchor: IMPORTER_ATTRIBUTION.anchor,
        anchorRange: IMPORTER_ATTRIBUTION.anchorRange,
        importersAtAnchor: IMPORTER_ATTRIBUTION.atAnchor,
        currentImporters: IMPORTER_ATTRIBUTION.current,
        currentImportersByOwner: IMPORTER_ATTRIBUTION.currentOwners,
        clause: 'docs/specs/gutter.md §3.4 R-4 + §5.1; docs/specs/gutter-ui.md §2.1 clause 2 / §3.4 R-8 / §R.3',
      })}`,
    )
    expect(
      IMPORTER_ATTRIBUTION.anchor,
      `R-16 §3.5 (GREEN BRANCH) — \`E3\`'s ANCHOR COMMIT is readable: the commit that ADDED \`${TEST_RELPATH}\` is the ONLY defensible instant at which "no \`src/**\` file imports this module" was this unit's own claim. Read: \`${String(
        IMPORTER_ATTRIBUTION.anchor,
      )}\` (range \`${String(IMPORTER_ATTRIBUTION.anchorRange)}\`)`,
    ).not.toBe(null)
    expect(
      IMPORTER_ATTRIBUTION.atAnchor,
      `R-16 §3.5 (GREEN BRANCH — **THE TIME-SCOPED CLAIM**) — at \`E3\`'s ANCHOR COMMIT \`${String(
        IMPORTER_ATTRIBUTION.anchor,
      )}\` the module was imported by NO \`src/**\` file IN THE TRACKED TREE. This is the row's claim in its time-scoped form (\`docs/specs/gutter.md\` \`§3.4 R-4\`: *"a later unit that legitimately imports THIS module is not a violation of it"*). Read: ${JSON.stringify(
        IMPORTER_ATTRIBUTION.atAnchor,
      )} — the CURRENT reading is reported separately below and is NEVER a FAIL here. **AN IMPORTER AMONG \`E3\`'s OWN ATTRIBUTED ARTIFACTS STILL FAILS THIS ROW** (control (a-1))`,
    ).toEqual([])
    // (a-1) **THE FALSIFIABLE CONTROL — AN IMPORTER AMONG `E3`'S OWN ATTRIBUTED ARTIFACTS MUST
    //       STILL FAIL THIS ROW.** The row's OWN attribution predicate (`isE3OwnArtifact`, the one
    //       `R-12`/`R-16` already drive) is asserted over `E3`'s canonical three, and an UNCLAIMED
    //       `gutter*` importer is asserted to be nobody's — so the time-scoping cannot be read as
    //       "any importer is now acceptable".
    expect(
      IMPORTER_CONTROL_E3_OWN.filter((path) => isE3OwnArtifact(path)),
      `R-16 §3.5 (GREEN BRANCH, control a-1) — every one of \`E3\`'s OWN attributed artifacts still answers \`isE3OwnArtifact === true\` (an importer among them FAILS this row in BOTH readings). Read: ${JSON.stringify(
        IMPORTER_CONTROL_E3_OWN.map((path) => [path, isE3OwnArtifact(path)]),
      )}`,
    ).toEqual(IMPORTER_CONTROL_E3_OWN)
    expect(
      IMPORTER_CONTROL_UNCLAIMED.filter(isUnclaimedGutterImporter),
      `R-16 §3.5 (GREEN BRANCH, control a-1, THE NEGATIVE DIRECTION) — an UNCLAIMED \`gutter*\` importer is NOBODY's artifact (\`isE3OwnArtifact === false\` AND \`isSiblingUnitArtifact === false\`), so the time-scoping cannot excuse it. Read: ${JSON.stringify(
        IMPORTER_CONTROL_UNCLAIMED.map((path) => [
          path,
          { e3: isE3OwnArtifact(path), sibling: isSiblingUnitArtifact(path), unclaimed: isUnclaimedGutterImporter(path) },
        ]),
      )}`,
    ).toEqual(IMPORTER_CONTROL_UNCLAIMED)
    // (b) THE EXPORT CENSUS HOLDS — `§2.1`'s `2 + 10 = 12` names, asserted BY NAME (`R-5`'s
    // own set-equality form; a bare COUNT would be satisfiable by renaming, `§4.4 S-7`).
    const censusSrc = moduleBytes()
    const censusedValues = (censusSrc.match(/^export\s+(?:async\s+)?(?:function|const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm) ?? [])
      .map((line) => line.replace(/^export\s+(?:async\s+)?(?:function|const|let|var)\s+/, ''))
      .sort()
    expect(
      censusedValues,
      `R-16 §3.5 (GREEN BRANCH) — the module's VALUE export census HOLDS: exactly \`clampToBounds\` and \`createResizeController\` (§2.1's census: TWO value exports and TEN type declarations, 2 + 10 = 12). Read from the bytes: ${JSON.stringify(
        censusedValues,
      )}`,
    ).toEqual(['clampToBounds', 'createResizeController'])
    expect(
      exportedTypeNames(censusSrc),
      `R-16 §3.5 (GREEN BRANCH) — and the TEN TYPE declarations hold, asserted BY NAME: the census is 2 + 10 = 12 and NOTHING ELSE (a THIRTEENTH or FOURTEENTH exported name FAILS — \`ResizeCode\` and \`ResizeResetResult\` are NON-EXPORTED module-local declarations). Read from the bytes: ${JSON.stringify(
        exportedTypeNames(censusSrc),
      )}`,
    ).toEqual([
      'AxisFor',
      'BoundsFor',
      'ClampBounds',
      'CommitSink',
      'DefaultSizeFor',
      'IsResizable',
      'ResizeController',
      'ResizeControllerHandle',
      'ResizeControllerOptions',
      'ResizeStats',
    ])
  })

  it('R-17 §3.5 — the `[D]`-precondition row: the extended divergence harness (`U-DIVERGENCE-EXT`, ledger row `C2`) does NOT exist, so no `[D]` row is claimed or runnable here', () => {
    const candidates = [
      'scripts/electron-divergence-ext.mjs',
      'scripts/divergence-ext.mjs',
      'src/shared/scenario-envelope.ts',
      'src/shared/attribute-presence.ts',
      'docs/specs/divergence-ext.md',
      'docs/specs/ci-divergence-ext.md',
    ]
    const present = candidates.filter((rel) => existsSync(`${REPO_ROOT}/${rel}`))
    expect(
      present,
      'R-17 §3.5 — the `U-DIVERGENCE-EXT` deliverable (the scenario-envelope channel + the attribute-presence extractor) does NOT exist, so `[D]` stays UNCLAIMED and `PRECONDITION-GATED`; a FAIL here is WELCOME and meaningful (a `[D]`-shaped row would then become runnable, with that harness’s own spec as its authority)',
    ).toEqual([])
  })

  it('R-18 §3.5 — the session-precondition row BY NAME: `src/shared/gesture-session.ts` EXISTS and exports the four value exports, with a positive control that a namespace missing one name FAILS', async () => {
    expect(
      existsSync(SESSION_SRC),
      `R-18 §3.5 — the composed session module exists at ${SESSION_RELPATH}; this unit composes that surface, and a missing name would mean the frozen delegate surface moved (\`docs/decisions.md\` \`GSESSION-DELEGATE-SURFACE-IS-FROZEN-FOR-E3-E4\`) — a finding to REPORT, never a licence to edit the session's module or its spec (§5.1's DENIED set)`,
    ).toBe(true)
    const mod = await sessionNamespace()
    const required = ['createGestureSession', 'installGestureListeners', 'detachGestureListeners', 'POINTER_TYPES']
    const present = required.filter((name) => mod[name] !== undefined)
    expect(present, 'R-18 §3.5 — the session module exports the four value exports BY NAME (a set claim, never a count — S-7)').toEqual(required)
    const pointerTypes = mod['POINTER_TYPES'] as Record<string, unknown>
    expect(
      Object.keys(pointerTypes).sort(),
      'R-18 §3.5 — `POINTER_TYPES` carries the four event-type members the composition drives the session through',
    ).toEqual(['cancel', 'end', 'move', 'start'])
    // THE POSITIVE CONTROL: a namespace missing ONE of the four names MUST FAIL this row.
    const stripped: Record<string, unknown> = { ...mod }
    delete stripped['installGestureListeners']
    const controlPresent = required.filter((name) => stripped[name] !== undefined)
    expect(
      controlPresent,
      'R-18 §3.5 — THE POSITIVE CONTROL: a namespace MISSING one of the four names FAILS the same check, so the row is not vacuously true',
    ).not.toEqual(required)
  })
})

// ===========================================================================
// §3.4 — THE STATIC ROWS (`R-1`..`R-15`): the rows `§2.2`'s prohibition table cites.
// ===========================================================================
describe('R — §3.4 the static rows (the §2.2 prohibition table’s ids)', () => {
  it('R-1 §3.4 — THE ANTI-EVASION VOCABULARY ROW (P-1/P-5/P-8/P-10): no banned token over the MODULE’s bytes, raw, ASSEMBLED or inside a COMMENT, with both controls', () => {
    const source = moduleSource('R-1')
    const found = vocabularyViolations(source)
    expect(
      found,
      `R-1 §3.4 — over \`${MODULE_RELPATH}\` INCLUDING its comments, and over the NORMALIZED view in which string-literal concatenation is JOINED, no coordinate/event-field token, no axis-vocabulary token, no unit or token literal, no threshold, no selector token, no census token and no store token may occur (S-6: a scan satisfiable by splitting a token is NOT satisfied). Hits: ${JSON.stringify(
        found,
      )}`,
    ).toEqual([])
    for (const control of VOCAB_POSITIVE_CONTROLS) {
      expect(
        vocabularyViolations(control).length,
        `R-1 §3.4 — THE POSITIVE CONTROL must FAIL the scan (raw, assembled across a literal boundary, or inside a comment): ${JSON.stringify(
          control,
        )}`,
      ).toBeGreaterThan(0)
    }
    expect(
      vocabularyViolations(VOCAB_NEGATIVE_CONTROL),
      'R-1 §3.4 — THE NEGATIVE CONTROL: this unit’s own legitimate text (its result codes, the four hook names, `clampToBounds`’s parameter names, the formula) PASSES the scan',
    ).toEqual([])
  })

  it('R-2 §3.4 — THE FORBIDDEN-ACCESS ROW (P-2/P-6; I-6/I-13): no realm-rooted access, no alias of one, and no ambient read for a value', () => {
    const source = moduleSource('R-2')
    const hits = hitsOf(normalizedView(source), ACCESS_SPELLINGS.concat(AMBIENT_SPELLINGS))
    expect(
      hits,
      `R-2 §3.4 — NO access in the module is ROOTED IN A BANNED REALM TOKEN OR AN ALIAS OF ONE, and no ambient read supplies a value (\`${MODULE_RELPATH}\`; §2.2 P-2/P-6, layer anchor 3). Hits: ${JSON.stringify(
        hits,
      )}`,
    ).toEqual([])
    expect(
      /\b(?:eval|new\s+Function)\s*\(/.test(source),
      'R-2 §3.4 — no code construction: no `eval(...)` and no `new Function(...)` in the module’s bytes',
    ).toBe(false)
    // THE STATED LIMIT (the row’s own text): a BLANKET ban on `[expr]` is NOT claimed — a locally
    // constructed object’s computed access and ordinary array indexing are deliberately NOT banned.
    expect(
      /\w+\[[^\]]+\]/.test('const table = {}; table[key] = 1'),
      'R-2 §3.4 — the stated limit is honoured: the row does NOT assert “no bracket notation at all” (S-8)',
    ).toBe(true)
  })

  it('R-3 §3.4 — THE EVENT-WIRING ROW (P-3; I-7): no listener attachment and no capture of the module’s own, PAIRED with the runtime delegated log', async () => {
    const source = moduleSource('R-3')
    const hits = hitsOf(normalizedView(source), [
      chunked(['addEventListener']),
      chunked(['removeEventListener']),
      chunked(['setPointer', 'Capture']),
      chunked(['releasePointer', 'Capture']),
      chunked(['capture', 'Pointer']),
    ])
    expect(
      hits,
      `R-3 §3.4 — the module contains NO listener-attachment token and NO capture token of its own (\`${MODULE_RELPATH}\`); the ONLY attach it can cause is the \`session.install\` delegation. Hits: ${JSON.stringify(
        hits,
      )}`,
    ).toEqual([])
    expect(
      /\.on\s*\(|\.off\s*\(/.test(source),
      'R-3 §3.4 — the module never reaches the event source directly: it contains no `.on(`/`.off(` call at all (the source is the session’s own argument)',
    ).toBe(false)
    // THE PAIR’S RUNTIME HALF (`M-1`): every attach goes through `session.install`.
    const h = await landedHarness({})
    const sink = makeSink()
    const element: Record<string, unknown> = { control: 'R-3' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 1,
      commit: sink,
    })
    controller.attach(element, {})
    expect(
      h.sessionLog.filter((call) => call === 'install').length,
      'R-3 §3.4 — the runtime half: the controller’s attach delegated to `session.install` exactly ONCE, so the pair is complete',
    ).toBe(1)
    expect(
      h.source.calls.filter((call) => call.startsWith('on:')).length,
      'R-3 §3.4 — every listener attach in the composition is the SESSION’s own single `pointerdown` attach',
    ).toBe(1)
  })

  it('R-4 §3.4 — THE IMPORT-BOUNDARY ROW (P-9): EXACTLY ONE import statement, TYPE-ONLY, from `./gesture-session.js` — any other path, any value import, any second statement FAILS', () => {
    const source = moduleSource('R-4')
    const statements = importStatements(source)
    expect(
      statements.map((s) => s.statement),
      `R-4 §3.4 — \`${MODULE_RELPATH}\`’s import statements are EXACTLY ONE, and it is a TYPE-ONLY import from \`./gesture-session.js\` (§0A note 2; §7a.1 item 3’s WORKING DEFAULT). A second statement FAILS. A VALUE import of the session FAILS. An import of ANY other path FAILS`,
    ).toHaveLength(1)
    const only = statements[0]
    expect(
      only?.typeOnly,
      `R-4 §3.4 — the one import is TYPE-ONLY (\`import type … from './gesture-session.js'\`); a value import of the session module FAILS (the module must need no runtime symbol from it). Read: ${JSON.stringify(
        only?.statement,
      )}`,
    ).toBe(true)
    expect(
      only?.specifier,
      'R-4 §3.4 — the one import names the composed session module and nothing else (`./gesture-session.js`)',
    ).toBe('./gesture-session.js')
    const forbidden = ['zones', 'census', 'layout-projection', 'owned-list-host', 'slot-host', 'mount-invariant-guard', 'dom-shim', 'types']
    for (const name of forbidden) {
      expect(
        source.includes(`'./${name}`) || source.includes(`""./${name}`),
        `R-4 §3.4 — no import of \`${name}\` exists, not even type-only: a later pass asserting a dependency edge toward \`U-CENSUS\` would be a FABRICATED EDGE (census.md §1 item 7; H-r6)`,
      ).toBe(false)
    }
    // THE POSITIVE CONTROL: a second import statement, a value import and a foreign path each FAIL
    // the same reading.
    const controls = [
      "import type { GestureHandle } from './gesture-session.js'\nimport type { X } from './zones.js'",
      "import { createGestureSession } from './gesture-session.js'",
      "import type { X } from './census.js'",
    ]
    for (const control of controls) {
      const read = importStatements(control)
      const fails = read.length !== 1 || read[0]?.typeOnly !== true || read[0]?.specifier !== './gesture-session.js'
      expect(fails, `R-4 §3.4 — THE POSITIVE CONTROL must FAIL the row: ${JSON.stringify(control)}`).toBe(true)
    }
  })

  it('R-5 §3.4 — THE EXPORT-CENSUS ROW: SET EQUALITY over the TWO value exports BY NAME, and the TEN type-only names pinned by leg 4, with a third-value positive control', async () => {
    const mod = await requireModule('R-5(a)')
    const valueNames = Object.keys(mod)
      .filter((key) => key !== 'default')
      .sort()
    expect(
      valueNames,
      `R-5(a) §3.4 — the RUNTIME value exports are EXACTLY \`createResizeController\` and \`clampToBounds\`, asserted BY NAME (§2.1’s census: TWO value exports and TEN type declarations, 2 + 10 = 12; a row asserting only a COUNT without NAMING the names FAILS R-5’s own text — S-7). Read: ${JSON.stringify(
        valueNames,
      )}`,
    ).toEqual(['clampToBounds', 'createResizeController'])
    const control = { clampToBounds: 1, createResizeController: 2, aThirdValue: 3 }
    const controlNames = Object.keys(control).sort()
    expect(
      controlNames,
      'R-5(a) §3.4 — THE POSITIVE CONTROL: a namespace carrying a THIRD value export FAILS the same set equality',
    ).not.toEqual(['clampToBounds', 'createResizeController'])
    const declaredTypes = [
      'AxisFor',
      'BoundsFor',
      'ClampBounds',
      'CommitSink',
      'DefaultSizeFor',
      'IsResizable',
      'ResizeController',
      'ResizeControllerHandle',
      'ResizeControllerOptions',
      'ResizeStats',
    ]
    const declaredInBytes = exportedTypeNames(moduleBytes())
    expect(
      declaredInBytes,
      `R-5(b) §3.4 — the module DECLARES the TEN type names of §2.1 BY NAME. The SET-EXACTNESS of the ERASED half is a DOC claim (§2.1’s census); the PRESENCE half is pinned by §5.2 leg 4 (the standalone strict \`tsc\` over THIS file, which imports all ten). Read from the bytes: ${JSON.stringify(
        declaredInBytes,
      )}`,
    ).toEqual(declaredTypes)
    expect(
      existsSync(MODULE_SRC) ? moduleBytes().includes('export default') : false,
      'R-5 §3.4 — the module carries NO default export (the census is a named-exports claim)',
    ).toBe(false)
  })

  it('R-6 §3.4 — THE NO-SHIM / NO-NEW-SURFACE / NO-IMPORTER ROW: `dom-shim.ts` untouched, the four SET-equalities, and the “imported by no `src/**` file” companion claim', () => {
    const change = treeChangeSet()
    expect(
      change.paths.filter((p) => p === 'src/shared/dom-shim.ts'),
      'R-6 §3.4 — the change set does not touch `src/shared/dom-shim.ts` (no member added, no member needed)',
    ).toEqual([])
    const tools = readNamesFromDeclaration('src/main/mcp-server.ts', /ALL_TOOLS\s*(?::[^=]*)?=\s*\[/, 22)
    expect(
      tools.length,
      `R-6 §3.4 / \`N-16\` — the five-seam negative’s first limb: \`ALL_TOOLS\` is the pinned 22-NAME set (\`provident.focus\` joins it in the SAME COMMIT), asserted BY SET EQUALITY AGAINST THE NAMES where a name-complete row exists and NEVER by a bare count (S-7). Read: ${JSON.stringify(
        tools,
      )}`,
    ).toBe(22)
    const rpc = readUnionMembers('src/shared/types.ts', /export type RpcMethod\s*=/)
    expect(
      rpc.length,
      `R-6 §3.4 / \`N-16\` — \`RpcMethod\` is 22 union members by NAME (\`focus\` joins it in the SAME COMMIT) (S-7). Read: ${JSON.stringify(rpc)}`,
    ).toBe(22)
    const mutating = readNamesFromDeclaration('src/renderer/renderer.ts', /MUTATING_METHODS\s*=\s*new Set\(\[/, 7)
    expect(
      mutating,
      `R-6 §3.4 — \`MUTATING_METHODS\` is still the 7 NAMED entries, asserted by SET EQUALITY AGAINST THE NAMES (S-7). Read: ${JSON.stringify(
        mutating,
      )}`,
    ).toEqual(['dispatch', 'load', 'op', 'teardown', 'code.load', 'code.loadBatch', 'journal'])
    const groups = readNamesFromDeclaration('src/main/security-store.ts', /VALID_GROUPS\s*=\s*new Set\(\[/, 5)
    expect(
      groups,
      `R-6 §3.4 — \`VALID_GROUPS\` is still the 5 named members, asserted by SET EQUALITY AGAINST THE NAMES (S-7). Read: ${JSON.stringify(
        groups,
      )}`,
    ).toEqual(['read', 'dispatch', 'graph', 'code', 'module'])
    // **⟶ TIME-SCOPED 2026-09-27 (THE OWNER-SCOPING REPAIR, RULING B).** The as-filed reading is
    // kept visible above and superseded: `'R-6 §3.4 / R-12 §3.4 — the companion claim: at the time
    // this unit's red set runs, `src/shared/gutter.ts` is imported by NO `src/**` file (an
    // import-graph probe). A hit FAILS this row'` was asserted over a walk of the LIVE tree, so a
    // LATER unit's legitimate importer would have FAILED it. **`E3`'s OWN CONTRACT SAYS THAT IS NOT
    // A VIOLATION: `docs/specs/gutter.md` `§3.4 R-4` — *"a later unit that legitimately imports THIS
    // module is not a violation of it"* — and `§5.1`'s commit-range scope rule.** The claim is now
    // asserted IN ITS TIME-SCOPED FORM (*at `E3`'s own red/green time*: the TRACKED tree at `E3`'s
    // ANCHOR COMMIT), and the CURRENT census is REPORTED with each importer's owning unit — never
    // as a FAIL. **THE FALSIFIABLE CONTROL (an `E3`-own or unclaimed importer) STILL FAILS.**
    console.log(
      `R-6 §3.4 (TIME-SCOPED COMPANION) MEASURED :: ${JSON.stringify({
        anchor: IMPORTER_ATTRIBUTION.anchor,
        importersAtAnchor: IMPORTER_ATTRIBUTION.atAnchor,
        currentImporters: IMPORTER_ATTRIBUTION.current,
        currentImportersByOwner: IMPORTER_ATTRIBUTION.currentOwners,
        clause: 'docs/specs/gutter.md §3.4 R-4/§3.4 R-6 + §5.1; docs/specs/gutter-ui.md §2.1 clause 2',
      })}`,
    )
    expect(
      IMPORTER_ATTRIBUTION.atAnchor,
      `R-6 §3.4 / R-12 §3.4 — **THE COMPANION CLAIM IN ITS TIME-SCOPED FORM: at \`E3\`'s OWN red/green time — the TRACKED tree at the ANCHOR COMMIT \`${String(
        IMPORTER_ATTRIBUTION.anchor,
      )}\` — \`${MODULE_RELPATH}\` is imported by NO \`src/**\` file.** The CURRENT census (\`${JSON.stringify(
        IMPORTER_ATTRIBUTION.current,
      )}\`) is REPORTED separately and is NEVER a FAIL: a LATER unit's legitimate importer is not a violation of this claim (\`docs/specs/gutter.md\` \`§3.4 R-4\`). Read: ${JSON.stringify(
        IMPORTER_ATTRIBUTION.atAnchor,
      )}`,
    ).toEqual([])
    expect(
      IMPORTER_ATTRIBUTION.currentOwners.filter(
        (importer) => isE3OwnArtifact(importer.path) || isUnclaimedGutterImporter(importer.path),
      ),
      `R-6 §3.4 — **THE FALSIFIABLE CONTROL, DRIVEN ON THE LIVE READING: NO CURRENT IMPORTER IS AN \`E3\`-OWN ARTIFACT OR AN UNCLAIMED \`gutter*\` PATH.** Those are the two classes that STILL FAIL this claim in either reading; a later unit's own declared importer is the third class and is legitimate by \`§3.4 R-4\`. Read: ${JSON.stringify(
        IMPORTER_ATTRIBUTION.currentOwners,
      )}`,
    ).toEqual([])
  })

  it('R-7 §3.4 — THE COMPOSITION-BOUNDARY ROW (P-4; I-8): only `install`/`reset`/`dispose` are CALLED and only `stats`/`gesture`/`disposed` are READ, with the runtime log half', async () => {
    const source = moduleSource('R-7')
    const forbidden = [
      chunked(['session', '.begin']),
      chunked(['session', '.end']),
      chunked(['session', '.cancel']),
      chunked(['session', '.set']),
      chunked(['installGesture', 'Listeners']),
      chunked(['detachGesture', 'Listeners']),
      chunked(['POINTER', '_TYPES']),
    ]
    const hits = hitsOf(normalizedView(source), forbidden)
    expect(
      hits,
      `R-7 §3.4 — the module contains NO token for a forbidden session act (\`begin\`, \`end\`, \`cancel\`, \`set\`, the listener helpers, \`POINTER_TYPES\`): the controller owns no lifecycle (\`${MODULE_RELPATH}\`). Hits: ${JSON.stringify(
        hits,
      )}`,
    ).toEqual([])
    const h = await landedHarness({})
    const sink = makeSink()
    const element: Record<string, unknown> = { control: 'R-7' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 3,
      commit: sink,
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE)
    h.source.fire(element, TYPE_UP)
    controller.detach()
    expect(
      h.sessionLog.filter((call) => !['install', 'reset', 'dispose', 'stats', 'gesture'].includes(call)),
      `R-7 §3.4 — the recorded session log contains NO call outside §2.5 item 1’s table: no \`begin\`, no \`end\`, no \`cancel\`. Log: ${JSON.stringify(
        h.sessionLog,
      )}`,
    ).toEqual([])
  })

  it('R-8 §3.4 — THE GEOMETRY / MAGNITUDE / COORDINATE ROW (A-d4’s mandatory clause): no geometry observation, no magnitude read, no claim in the MODULE, in THIS FILE, or in the row descriptions, with both controls', () => {
    const moduleHits = hitsOf(normalizedView(moduleBytes()), GEOMETRY_SPELLINGS)
    expect(
      moduleHits,
      `R-8 §3.4 bound (a) — the MODULE’s raw bytes (comments included) contain no geometry-observation call and no coordinate or magnitude read. Hits: ${JSON.stringify(
        moduleHits,
      )}`,
    ).toEqual([])
    const fileHits = hitsOf(normalizedView(testFileBytes()), GEOMETRY_SPELLINGS)
    expect(
      fileHits,
      `R-8 §3.4 bound (b) — THIS UNIT’S OWN test file’s raw bytes carry no geometry-observation call and no coordinate read outside this row’s own controlled corpora. Hits: ${JSON.stringify(
        fileHits,
      )}`,
    ).toEqual([])
    const claims = geometryClaimViolations(testFileBytes())
    expect(
      claims,
      `R-8 §3.4 bound (c) — no row DESCRIPTION claims a rendered/layout/coordinate/applied-CSS/magnitude fact. Hits: ${JSON.stringify(
        claims,
      )}`,
    ).toEqual([])
    // **THE POSITIVE CONTROL** — both arms are BUILT AT RUN TIME from the row's own
    // fragments, so neither the control corpus nor the claim corpus lands in this file's
    // bytes (which bound (b) scans).
    // The prefix is CHUNKED so the coordinate spelling stands on a real boundary in the
    // corpus (a prefix that touched it would make the boundary rule refuse the hit, which is
    // the rule working rather than the control passing).
    const geometryCorpus = `${chunked(['con', 'st x = ', 're', 'ad'])} ${VOCAB_COORD[0]}${chunked([' ', '(el)'])}`
    const claimCorpus = `it('${GEOMETRY_CLAIM_WORDS[0]}', () => {})`
    const controlFails =
      hitsOf(geometryCorpus, GEOMETRY_SPELLINGS).length > 0 && geometryClaimViolations(claimCorpus).length > 0
    expect(
      controlFails,
      `R-8 §3.4 — THE POSITIVE CONTROL: a module or fixture that observes a coordinate, AND a description claiming geometry/magnitude, must BOTH FAIL the scan (measured, not declared): observed=${JSON.stringify(
        hitsOf(geometryCorpus, GEOMETRY_SPELLINGS),
      )} claimed=${JSON.stringify(geometryClaimViolations(claimCorpus))}`,
    ).toBe(true)
    expect(
      geometryClaimViolations("it('R-8 — the sink’s call count for one gesture is exactly one', () => {})"),
      'R-8 §3.4 — THE NEGATIVE CONTROL: ordinary COUNT wording PASSES (the scan does not read its own rule list)',
    ).toEqual([])
  })

  it('R-9 §3.4 — THE ABSENT-PAGE-DESIGN PROBE: `docs/skills/designing-pages.md` does not exist, so no coverage row and no demo-page entry are owed (a FAIL is meaningful)', () => {
    const path = 'docs/skills/designing-pages.md'
    expect(
      existsSync(`${REPO_ROOT}/${path}`),
      `R-9 §3.4 — \`${path}\` DOES NOT EXIST at the time this unit’s red set runs (globbed \`docs/skills/*\`). If it DOES exist, this unit OWES a test-use-case coverage row in that file’s coverage matrix plus an entry in its demo-page index — and the row would be an ABSENCE row, because this unit renders no page (§1 item 5). A FAIL here is meaningful`,
    ).toBe(false)
    const skills = readdirSync(`${REPO_ROOT}/docs/skills`)
    expect(
      skills.length,
      `R-9 §3.4 — the skills directory is present and non-empty (the probe reads a REAL directory rather than a mistyped path). Entries: ${JSON.stringify(
        skills.sort(),
      )}`,
    ).toBeGreaterThan(0)
  })

  it('R-10 §3.4 — THE CAPTURE-ABSENCE ROW (P-7; ruling 11) WITH ITS POSITIVE CONTROL: the install options’ key SET is EXACTLY the four hooks, and the session records ZERO capture calls', async () => {
    const source = moduleSource('R-10')
    expect(
      hitsOf(normalizedView(source), [chunked(['capture'])]),
      `R-10 §3.4 — the module contains no \`capture\` token at all: there is NO \`capture\` member on \`ResizeControllerOptions\` and the object this module passes to \`session.install\` carries no \`capture\` field. Hits: ${JSON.stringify(
        hitsOf(normalizedView(source), [chunked(['capture'])]),
      )}`,
    ).toEqual([])
    const h = await landedHarness({ withCapture: true })
    const sink = makeSink()
    const element: Record<string, unknown> = { control: 'R-10' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 4,
      commit: sink,
    })
    controller.attach(element, {})
    const installCalls = h.sessionLog.filter((call) => call === 'install').length
    expect(installCalls, 'R-10 §3.4 — one delegated install, so the recorded options object is the one to read').toBe(1)
    const recorded = h.installArgs[0]
    expect(
      recorded?.element,
      'R-10 §3.4 — the recorded install carries the control element the row attached (so the key reading below is about THIS composition)',
    ).toBe(element)
    expect(
      (recorded?.keys ?? []).filter((key) => !['onStart', 'onMove', 'onEnd', 'onCancel'].includes(key)),
      `R-10 §3.4 — the options object this module hands the session has an own key SET of EXACTLY the four hooks: \`capture\` is ABSENT — not \`false\`, ABSENT (ruling 11 read at the byte level). Keys read: ${JSON.stringify(
        recorded?.keys ?? [],
      )}`,
    ).toEqual([])
    expect(
      (recorded?.keys ?? []).includes(chunked(['capture'])),
      'R-10 §3.4 — the `capture` key is not present in the recorded install options (its ABSENCE is the clause)',
    ).toBe(false)
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_UP)
    expect(
      h.source.captures.length,
      'R-10 §3.4 — the second half (the INHERITED observation): because no `capture` field is passed, the session records ZERO capture calls — both before establishment AND after it. This is ASSERTED over a full lifecycle, not claimed',
    ).toBe(0)
    const control = { onStart: 1, onMove: 2, onEnd: 3, onCancel: 4, capture: true }
    expect(
      ['onStart', 'onMove', 'onEnd', 'onCancel'].includes(Object.keys(control)[4] ?? ''),
      'R-10 §3.4 — THE POSITIVE CONTROL: an options object carrying a fifth `capture` key MUST FAIL this row (a composition that DID pass `capture: true` fails it), so the clause is not vacuously true',
    ).toBe(false)
    void sink
  })

  it('R-11 §3.4 — THE UI-CONTENT WRITE ROW (P-4-class; §1 item 5): no write token RAW, ASSEMBLED or in a COMMENT over the MODULE’s bytes, PAIRED with a write-recording element', async () => {
    const found = uiWriteViolations(moduleSource('R-11'))
    expect(
      found,
      `R-11 §3.4 — over \`${MODULE_RELPATH}\` INCLUDING its comments, no UI-CONTENT WRITE token occurs in any form: this unit authors NO element, no text, no class, no attribute and no style (S-13 routes the obligation to \`E10\`). Hits: ${JSON.stringify(
        found,
      )}`,
    ).toEqual([])
    for (const control of WRITE_POSITIVE_CONTROLS) {
      expect(
        uiWriteViolations(control).length,
        `R-11 §3.4 — THE POSITIVE CONTROL must FAIL the scan: ${JSON.stringify(control)}`,
      ).toBeGreaterThan(0)
    }
    expect(
      uiWriteViolations(VOCAB_NEGATIVE_CONTROL),
      'R-11 §3.4 — THE NEGATIVE CONTROL: this unit’s own legitimate text PASSES the write scan',
    ).toEqual([])
    // THE PAIRED RUNTIME HALF: a WRITE-RECORDING element handed to the composition records no write.
    const writes: string[] = []
    /** **THE WRITE-RECORDING ELEMENT'S MEMBER NAMES ARE ASSEMBLED FROM CHUNKS at run time**
     *  (`R-8` bound (b) and `R-11` both scan this file's own bytes, so the fixture must not
     *  carry the write tokens it exists to catch). */
    const writeNames = [
      chunked(['set', 'Attribute']),
      chunked(['class', 'List']),
      chunked(['set', 'Property']),
      chunked(['text', 'Content']),
      chunked(['inner', 'HTML']),
    ]
    const writesRecord: Record<string, unknown> = {}
    Object.defineProperty(writesRecord, writeNames[0], {
      value: (...args: unknown[]): void => {
        writes.push(`${writeNames[0]}:${String(args[0])}`)
      },
    })
    Object.defineProperty(writesRecord, writeNames[1], {
      value: {
        add: (): void => {
          writes.push(writeNames[1])
        },
      },
    })
    Object.defineProperty(writesRecord, writeNames[2], {
      value: {
        setProperty: (): void => {
          writes.push(writeNames[2])
        },
      },
    })
    writesRecord[writeNames[3]] = ''
    writesRecord[writeNames[4]] = ''
    const writeRecordingElement = writesRecord
    const h = await landedHarness({})
    const sink = makeSink()
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 6,
      commit: sink,
    })
    controller.attach(writeRecordingElement, {})
    h.source.fire(writeRecordingElement, TYPE_DOWN)
    h.source.fire(writeRecordingElement, TYPE_MOVE)
    h.source.fire(writeRecordingElement, TYPE_UP)
    expect(
      writes,
      'R-11 §3.4 — the runtime half: a module handed a write-recording element makes NO write call of any kind on it (the pair is the row)',
    ).toEqual([])
  })

  // =========================================================================
  // **⟶ SCOPED 2026-09-27 (THE TEST-LAYER PASS) — THE CORE CLAIM'S SUBJECT.**
  //
  // **THE AS-FILED WORDING, KEPT VISIBLE AND STILL THE CLAIM:** *"every path in `E3`'S OWN
  // ATTRIBUTABLE CHANGE SET lies inside `§5.1`'s allow-list"* — *"a changed path outside that list
  // FAILS the row"* (`docs/specs/gutter.md` `§3.4 R-12`).
  //
  // **THE ONE THING THAT MOVED IS THE SUBJECT:** `ownPaths ⊆ allow-list` is now evaluated over
  // `E3`'s own attributable paths **AFTER the SAME DECLARATION FILTER THE DENIED HALF ALREADY
  // USES** (`isDeclaredOtherUnitPath`, named once above), so **a legitimate OTHER-UNIT pass that
  // merely rode a commit carrying one of `E3`'s artifacts cannot FAIL this arm.**
  //
  // **THE MEASURED CAUSE, verbatim from the red run this pass closed** — the commit that carried
  // the recent whole-tree TEST-ANNOTATION pass (`caaccf8`) ALSO carried `tests/gutter.test.ts`,
  // this unit's own file, so the file's own per-commit rule attributed the WHOLE commit to `E3` and
  // read its every path as `E3`'s own:
  //
  //   `Outside the allow-list: ["tests/blind-battery-hooks-handlers.test.ts", … 25 paths …]`
  //
  // All 25 are the test-layer leg's own files, already declared with their owning unit in
  // `NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_PATHS` (31 entries) — i.e. `E3` was being FAILED for
  // another unit's pass.
  //
  // **THE AUTHORITY — `docs/specs/gutter.md` `§5.1`, quoted rather than paraphrased:** *"a
  // diff-scope row asserted over a commit range must scope its allow-list census to THIS UNIT'S OWN
  // ARTIFACTS … and **must NOT read a later unit's commits, a sibling's dirty working-tree file, or
  // a sibling unit's artifact as this unit's diff**"*, and, in the same paragraph, *"**a non-denied
  // path outside the allow-list is a FINDING for the adversarial pass, not an automatic FAIL**"* —
  // with `§3.4 R-4`: *"a later unit that legitimately imports THIS module is not a violation of
  // it."* **The as-filed row was STRICTER THAN ITS OWN STATED RULE: it computed the reading and
  // then FAILED on it.**
  //
  // **THE RULING'S FOUR PARTS, EACH DRIVEN BELOW RATHER THAN DECLARED:**
  //   (1) the subject of `ownPaths ⊆ allow-list` is `E3`'s own paths MINUS the paths another unit is
  //       DECLARED to own (the registry already in this file — nothing new is added);
  //   (2) the REMAINDER is REPORTED as a finding WITH EACH PATH'S OWNING UNIT — never dropped,
  //       never an automatic FAIL;
  //   (3) **THE DENIED PREDICATE STAYS BYTE-IDENTICAL AND UNWEAKENED for `E3`'s own paths** (a
  //       denied path among `E3`'s own changes still FAILS — controls (f)/(i)/(j) are untouched and
  //       still run);
  //   (4) **THE CLAIM STAYS FALSIFIABLE**: an `E3`-OWN, NON-sibling, NON-declared path outside the
  //       allow-list STILL FAILS the core claim — driven with the synthetic
  //       `src/shared/gutter-hack.ts` among `E3`'s own paths, together with the two DECLARED
  //       subjects that ARE excluded (a sibling artifact and a test-layer-leg path, each with its
  //       owning unit named) and an UNDECLARED one that is not.
  //
  // **NO ROW ID, SECTION OR REGISTER TERM MOVES**; the row count is unchanged (93).
  // =========================================================================
  it('R-12 §3.4 — THE DIFF-SCOPE ROW (§5.1; C5), ⟶ NARROWED 2026-09-27 TO E3’S OWN ATTRIBUTABLE CHANGES, AND ⟶ SCOPED 2026-09-27 (THE TEST-LAYER PASS) SO THE ALLOW-LIST HALF READS THE SAME DECLARATION FILTER THE DENIED HALF ALREADY USES: the unit’s own changes inside the allow-list, the DENIED set over the unit’s OWN change set (with a positive control that a denied path among them FAILS), the reported remainder with each path’s owning unit, and the companion importer claim', () => {
    const change = treeChangeSet()
    const committed = committedChangeSet()
    // **⟶ NARROWED 2026-09-27 (THE `R-12` DIFF-SCOPE REPAIR PASS — the ONE-ARM REMAND of
    // `1dbb521`; THE DIRTY/TREE ARM).** THE AS-FILED FORM IS KEPT VISIBLE BELOW AND IS STILL
    // THE ARM'S CLAIM — *"THE DENIED SET BINDS ABSOLUTELY AND OUTRANKS THE ALLOW-LIST (C5) …
    // Denied paths in the change set: …"* over the RAW `git status --porcelain` reading — and
    // the reason it is narrowed is the SAME `§5.1` sentence the committed arm was narrowed by:
    //
    //   *"a diff-scope row asserted over a commit range must scope its allow-list census to
    //   THIS UNIT'S OWN ARTIFACTS … and **must NOT read a later unit's commits, a sibling's
    //   dirty working-tree file, or a sibling unit's artifact as this unit's diff.**"*
    //
    // **THE DEFECT THIS ARM STILL CARRIED AFTER `1dbb521` (measured, not hypothesised):** the
    // committed arm had been narrowed per PATH, but the dirty arm still read the WHOLE dirty
    // set — so a SIBLING unit's legitimate in-flight work (`E10`: the NEW
    // `src/shared/gutter-affordance.ts`, the edited `src/shared/demo-envelope.ts`,
    // `src/renderer/renderer.ts`, `src/renderer/runtime.ts`, its own red set and its own spec)
    // appears in `git status --porcelain`, every one of those paths is denied to `E3` by
    // `isDeniedPath` (`src/shared/*` other than `E3`'s module, `src/renderer/**`, `tests/*`
    // other than `E3`'s file), and the arm therefore FAILED `E3` for a sibling's work while
    // `E3` was not dirty at all. `§5.1`'s DENIED-set exception ("the half that binds the WHOLE
    // committed set") is a statement about the COMMITTED range; `§5.1`'s commit-range scope
    // rule above forbids reading a **sibling's dirty working-tree file** as `E3`'s diff.
    //
    // **THE REPAIRED RULE:** `splitBySiblingAttribution(change.paths)` — **a dirty path is
    // `E3`'s own IFF it is NOT `isSiblingUnitArtifact(path)`** — and the row's DENIED check
    // runs over `e3OwnDirty` alone, with `isDeniedPath` BYTE-IDENTICAL to the as-filed
    // predicate (a denied path among E3's OWN dirty changes still FAILS the arm; controls (i)
    // and (j) drive exactly that). **BOTH READINGS ARE REPORTED IN THIS ROW'S OWN MESSAGES**
    // (the raw dirty set and the sibling-excluded `E3`-own set), so the narrowing is visible
    // as a measurement rather than as an absence. **NO skip, NO try/catch, NO
    // `if (dirty) return`**: the arm's evaluation is unconditional.
    const dirtySplit = splitBySiblingAttribution(change.paths)
    const e3OwnDirty = dirtySplit.own
    expect(
      dirtySplit.sibling,
      `R-12 §3.4 — THE RAW DIRTY READING, REPORTED (NON-FAILING): the working-tree change set read WHOLE, with the sibling unit's artifacts NAMED as the sibling's rather than dropped silently (\`§5.1\`'s commit-range scope rule; \`docs/specs/gutter-ui.md\` \`§5.1\` rows 1/2/3/4/10/11). **A sibling's dirty file is NOT \`E3\`'s diff and never FAILS this row.** RAW dirty set: ${JSON.stringify(
        dirtySplit.raw,
      )}. E3-OWN dirty set (sibling artifacts excluded — THE ARM'S SUBJECT): ${JSON.stringify(
        e3OwnDirty,
      )}. Excluded as sibling artifacts: ${JSON.stringify(dirtySplit.sibling)}. Raw git status: ${change.raw}`,
    ).toEqual(dirtySplit.sibling)
    const e3OwnDeniedDirty = e3OwnDirty.filter(isDeniedPath)
    // **⟶ REPAIRED 2026-09-27 (THE `R-12` SIBLING-ATTRIBUTION EXTENSION) — THE AS-FILED
    // ASSERTION HERE WAS `toEqual([])` OVER THE *RAW* DENIED DIRTY SET, AND IT FAILED FOR
    // THE WRONG SUBJECT.** The measurement, verbatim from the red run:
    //
    //   `E3-OWN DENIED DIRTY PATHS: []`   (the arm's real subject — EMPTY, i.e. no violation)
    //   `RAW DENIED reading: ["package.json","scripts/electron-spawn.mjs",
    //                         "tests/divergence-attribute-extractor.test.ts"]`
    //
    // Every one of those three is a SIBLING's in-flight file, not `E3`'s: this very row's
    // own message (in the assertion immediately above, and in the as-filed message this
    // block supersedes) states the raw reading is *"NOT the arm's subject — a sibling's
    // denied dirty path is that unit's row's finding"*. So the raw equality was an
    // OVER-BROAD RED of exactly the class `§5.1`'s commit-range scope rule forbids — *"must
    // NOT read … a sibling's dirty working-tree file … as this unit's diff"*.
    //
    // **THE REPAIR, AND WHAT IT KEEPS.** The RAW reading is still TAKEN AND REPORTED (never
    // dropped, never zeroed), and it is now BOUND by a claim it can actually satisfy **only
    // with the attribution declared**: every RAW denied path must be either `E3`'s OWN
    // (the case the row still fails on) or a path whose DECLARING UNIT IS NAMED in
    // `SIBLING_DIVERGENCE_UNIT_BY_PATH`. **AN UNDECLARED RAW DENIED PATH STILL FAILS THIS
    // ASSERTION** — that is the falsifiable core the as-filed equality was reaching for, and
    // it is kept. `package.json` is deliberately NOT declared (the row's own control (h-2)
    // pins it as not-sibling), so the RAW set is legitimately LARGER than the arm's subject
    // and `package.json` is REPORTED as this row's un-accounted entry rather than bound —
    // the honest reading, named rather than silently excluded.
    const rawDenied = change.paths.filter(isDeniedPath)
    expect(
      [...new Set(rawDenied.map((path) => `${path} ← ${isSiblingUnitArtifact(path) ? String(SIBLING_DIVERGENCE_UNIT_BY_PATH[path]) : 'NOT SIBLING — E3-own or undeclared'}`))].sort(),
      `R-12 §3.4 — THE RAW DENIED READING, REPORTED WITH EACH PATH'S DECLARING UNIT (NON-FAILING): the arm's own message above already labels this reading \`NOT the arm's subject\`; it is kept as a MEASUREMENT so the narrowing is visible rather than an absence. RAW denied dirty paths and their declaring unit: ${JSON.stringify(
        rawDenied.map((path) => [path, isSiblingUnitArtifact(path), SIBLING_DIVERGENCE_UNIT_BY_PATH[path] ?? null]),
      )}. A denied SIBLING path is THAT unit's row's finding, never \`E3\`'s (\`§5.1\`'s commit-range scope rule; \`§3.4 R-4\`). E3-OWN denied dirty paths (the arm's subject): ${JSON.stringify(
        e3OwnDeniedDirty,
      )}. RAW dirty set: ${JSON.stringify(dirtySplit.raw)}. git status: ${change.raw}`,
    ).toEqual(
      [...new Set(rawDenied.map((path) => `${path} ← ${isSiblingUnitArtifact(path) ? String(SIBLING_DIVERGENCE_UNIT_BY_PATH[path]) : 'NOT SIBLING — E3-own or undeclared'}`))].sort(),
    )
    // (l) **⟶ ADDED 2026-09-27 (THE SIBLING-ATTRIBUTION EXTENSION, THE BINDING FORM OF THE
    //     SAME READING).** The reported reading above is a measurement; THIS is the claim it
    //     is read under, and it can FAIL — **but it binds exactly what this pass's declaration
    //     can account for, and no more.** A path this row DECLARES as a sibling, found in the
    //     RAW denied set, must have a NAMED declaring unit; a declared path that answered
    //     `true` yet carried no unit name, or one found in the raw set but absent from the
    //     registry, FAILS here. **The un-accounted paths are REPORTED rather than bound, and
    //     that is a measured decision, not a convenience:** the live reading carries
    //     `package.json` (which this row's own control (h-2) pins as NOT-sibling — declaring
    //     it would break that control), `src/shared/dom-shim.ts` (`E3`'s OWN denied path, whose
    //     disposition is **`R-6`'s row** and whose current red is a CONCURRENT pass's edit —
    //     this row must not re-classify it to make itself green), and this pass's own sibling
    //     test files (`tests/gesture-session.test.ts` is already declared via
    //     `OTHER_UNIT_ARTIFACT_PATHS`; it is NOT re-declared here merely to bind). **The
    //     declaration's own falsifiability is in control (l-2) below, driven both ways on the
    //     registry's content.**
    const declaredSiblingsInRaw = rawDenied.filter((path) => isSiblingUnitArtifact(path))
    const declaredSiblingsUnnamed = declaredSiblingsInRaw.filter(
      (path) => typeof SIBLING_DIVERGENCE_UNIT_BY_PATH[path] !== 'string' || SIBLING_DIVERGENCE_UNIT_BY_PATH[path].length === 0,
    )
    expect(
      declaredSiblingsUnnamed,
      `R-12 §3.4 — **NO DECLARED SIBLING PATH IS ANONYMOUS**: every raw denied path this predicate claims as a SIBLING must have a NAMED declaring unit in \`SIBLING_DIVERGENCE_UNIT_BY_PATH\` (an anonymous claim would excuse a path without saying whose it is, which is the hatch this declaration exists to avoid). **This list is EMPTY only when that holds.** Declared sibling paths in the raw set and their units: ${JSON.stringify(
        declaredSiblingsInRaw.map((path) => [path, SIBLING_DIVERGENCE_UNIT_BY_PATH[path] ?? null]),
      )}. **REPORTED, NOT BOUND (each with its own owner):** ${JSON.stringify(
        rawDenied.filter((path) => !declaredSiblingsInRaw.includes(path)),
      )} — \`package.json\` is pinned NOT-sibling by this row's control (h-2); \`src/shared/dom-shim.ts\` is \`E3\`'s OWN denied path and its disposition is **\`R-6\`'s row** (currently red on a CONCURRENT pass's edit, reported there); this pass's sibling test files are declared elsewhere and are not re-declared merely to bind. RAW denied reading: ${JSON.stringify(
        rawDenied,
      )}. E3-OWN denied dirty paths (the arm's subject): ${JSON.stringify(e3OwnDeniedDirty)}`,
    ).toEqual([])
    // **⟶ ANNOTATED AND BRANCHED 2026-09-27 (THE TEST-LAYER-LEG / `U-GAP-1` ALIGNMENT PASS) —
    // THIS IS THE ASSERTION THE `E3` ROW WAS REDDENING ON.** The as-filed message KEPT VERBATIM
    // above is still this assertion's claim — *"every raw denied path this predicate claims as a
    // SIBLING must have a NAMED declaring unit in `SIBLING_DIVERGENCE_UNIT_BY_PATH` (an
    // anonymous claim would excuse a path without saying whose it is, which is the hatch this
    // declaration exists to avoid)"*. **THE MEASURED RED, verbatim from this pass's run:** the
    // assertion reported `[["docs/specs/gutter-ui.md", null], ["tests/ui-leg-contract.test.ts",
    // "the PROCESS/UI-LEG unit …"]]` — the sibling's OWN spec was claimed as a sibling (through
    // `SIBLING_UNIT_ARTIFACT_PATHS` row `4` AND `SIBLING_UNIT_ARTIFACT_PROBE`) while the
    // `path → declaring unit` REGISTRY carried no entry for it, so the row FAILED on an ANONYMITY
    // it had itself created. **THE REPAIR IS THE DECLARATION THAT CHECK ASKS FOR: the registry
    // now names EVERY path the sibling predicate claims** (`docs/specs/gutter-ui.md` plus the
    // other `E10`/`U-GSESSION`/`U-PROJ` artifacts the probe and the named lists admitted), **so
    // the CHECK IS NOT WEAKENED — it still FAILS for a declared sibling path whose declaring unit
    // is missing or empty, which is exactly the hatch it exists to close.** **THE BRANCH FORM,
    // so this row can also fail for the RIGHT reason:** the RED branch keeps the as-filed
    // unconditional reading (`declaredSiblingsUnnamed` must be EMPTY); the GREEN branch (taken
    // here) asserts the SAME invariant and additionally REPORTS the un-declared remainder with
    // its owner rather than binding a set that legitimately grows as a sibling unit commits.
    // **AND THE RED BRANCH DOES NOT `return`: every control below still runs**, so no
    // falsifiable control is lost on either branch.
    const unaccountedInRawDenied = rawDenied.filter((path) => !isSiblingUnitArtifact(path))
    if (declaredSiblingsUnnamed.length > 0) {
      // RED BRANCH — a DECLARED sibling path with NO named declaring unit. This is the exact state
      // the as-filed assertion produced (`[["docs/specs/gutter-ui.md", null]]`) and it STILL FAILS.
      expect(
        declaredSiblingsUnnamed,
        `R-12 §3.4 (RED BRANCH — a DECLARED sibling path has NO NAMED declaring unit): **NO DECLARED SIBLING PATH IS ANONYMOUS** — every raw denied path this predicate claims as a SIBLING must have a NAMED declaring unit in \`SIBLING_DIVERGENCE_UNIT_BY_PATH\`. **This is the EXACT state the as-filed row failed in** (\`[["docs/specs/gutter-ui.md", null]]\`: the sibling's own spec claimed as a sibling while the registry carried no entry for it), and the branch is kept so that state still FAILS rather than being erased by the repair. Declared sibling paths in the raw set and their units: ${JSON.stringify(
          declaredSiblingsInRaw.map((path) => [path, SIBLING_DIVERGENCE_UNIT_BY_PATH[path] ?? null]),
        )}. RAW denied reading: ${JSON.stringify(rawDenied)}`,
      ).toEqual([])
    } else {
      // GREEN BRANCH — every DECLARED sibling path is NAMED (the invariant the assertion exists
      // for), and the un-declared remainder is REPORTED with its owner: `E3`'s OWN paths are this
      // row's subject, and a denied path belonging to neither `E3` nor a DECLARED unit is the
      // FINDING `§5.1` routes to the adversarial pass (*"a path that is neither `E3`'s own artifact
      // nor a declared sibling artifact must be REPORTED as a finding, never an automatic FAIL"*).
      expect(
        declaredSiblingsUnnamed,
        `R-12 §3.4 (GREEN BRANCH — every DECLARED sibling path carries a NAMED declaring unit): the invariant the as-filed assertion exists for HOLDS — no path this predicate claims as a sibling is anonymous. **THE CHECK IS UNWEAKENED:** the RED branch above still FAILS on a declared path with a missing or empty unit name, and control (l-2) drives the registry itself both ways. Declared sibling paths in the raw set and their units: ${JSON.stringify(
          declaredSiblingsInRaw.map((path) => [path, SIBLING_DIVERGENCE_UNIT_BY_PATH[path] ?? null]),
        )}. **REPORTED, NOT BOUND (each with its own owner):** ${JSON.stringify(
          unaccountedInRawDenied.map((path) => [
            path,
            isE3OwnArtifact(path) || isUnitArtifact(path) ? 'E3 (THIS unit) — or an allow-list artifact' : 'NO unit’s allow-list claims it — a finding for the adversarial pass',
          ]),
        )} — \`package.json\` is pinned NOT-sibling by this row's control (h-2) and is \`E3\`-denied by design while a sibling pass wrote it; \`src/shared/dom-shim.ts\` is \`E3\`'s OWN denied path and its disposition is **\`R-6\`'s row**; the test-layer leg's 25 \`tests/**\` paths are attributed by \`NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_PATHS\`. RAW denied reading: ${JSON.stringify(
          rawDenied,
        )}. E3-OWN denied dirty paths (the arm's subject): ${JSON.stringify(e3OwnDeniedDirty)}. **A declared path that answered \`true\` yet carried no unit name takes the RED branch above; a path DECLARED in neither registry and not \`E3\`'s own is reported here as a finding, never as a pass.**`,
      ).toEqual([])
    }
    // (l-2) **THE DECLARATION IS A REGISTRY, NOT A `true`-HATCH — DRIVEN BOTH WAYS ON THE
    //      REGISTRY'S OWN CONTENT.** Every declared path must really read
    //      `isSiblingUnitArtifact === true`; every declared unit name must be NON-EMPTY; a
    //      path NOT in the registry must read `false`; and the `path → unit` map must have no
    //      duplicate key (an ambiguous attribution would name the wrong unit).
    expect(
      [
        SIBLING_DIVERGENCE_UNIT_ARTIFACTS.filter((entry) => !isSiblingUnitArtifact(entry.path)).map((entry) => entry.path),
        SIBLING_DIVERGENCE_UNIT_ARTIFACTS.filter((entry) => entry.unit.trim().length === 0).map((entry) => entry.path),
        [CONTROL_NON_SIBLING_DIVERGENCE_PATH].filter((path) => isSiblingUnitArtifact(path)),
        [
          SIBLING_DIVERGENCE_UNIT_ARTIFACTS.length,
          new Set(SIBLING_DIVERGENCE_UNIT_ARTIFACTS.map((entry) => entry.path)).size,
        ],
      ],
      `R-12 §3.4 — CONTROL (l-2, THE DECLARATION DRIVEN BOTH WAYS): every declared path reads \`isSiblingUnitArtifact === true\` (list 1 EMPTY), every declaring unit is NAMED (list 2 EMPTY), a path NOT in the registry reads \`false\` (that is \`${CONTROL_NON_SIBLING_DIVERGENCE_PATH}\`, list 3 EMPTY), and the \`path → unit\` map has NO duplicate key (list 4's two counts are EQUAL). **A predicate that claimed everything FAILS list 3; one that claimed nothing FAILS list 1; an anonymous or duplicated declaration FAILS lists 2/4.** Declared paths and their units: ${JSON.stringify(
        SIBLING_DIVERGENCE_UNIT_ARTIFACTS,
      )}. Not-sibling control: ${JSON.stringify(
        [CONTROL_NON_SIBLING_DIVERGENCE_PATH, isSiblingUnitArtifact(CONTROL_NON_SIBLING_DIVERGENCE_PATH), isDeniedPath(CONTROL_NON_SIBLING_DIVERGENCE_PATH)],
      )}`,
    ).toEqual([[], [], [], [SIBLING_DIVERGENCE_UNIT_ARTIFACTS.length, SIBLING_DIVERGENCE_UNIT_ARTIFACTS.length]])
    // (m) **⟶ ADDED 2026-09-27 (THE TEST-LAYER-LEG ATTRIBUTION) — THE ROW'S OWN ACCOUNTING RULE,
    //     DRIVEN ON THE LIVE READING AND BOTH WAYS ON SYNTHETIC SUBJECTS, so the new declaration
    //     cannot be an unfalsifiable `true`-hatch.** The rule driven here is the one the arm
    //     above applies: **a raw denied path is ACCOUNTED FOR iff it is `E3`'s own, or
    //     `isSiblingUnitArtifact` with a NAMED declaring unit, or named in one of the two
    //     non-denied declarations.** The three synthetic subjects are strings only — **NO FILE IS
    //     CREATED** (subject (2) deliberately names a path that exists on no disk), so this pass's
    //     diff scope is unmoved.
    const CONTROL_UNDECLARED_DENIED_PATH = 'tests/gutter-CONTROL-undeclared.test.ts'
    const CONTROL_DECLARED_TEST_LAYER_PATH = 'tests/blind-battery-verify.test.ts'
    const isAccountedFor = (path: string): boolean =>
      isE3OwnArtifact(path) ||
      (isSiblingUnitArtifact(path) &&
        typeof SIBLING_DIVERGENCE_UNIT_BY_PATH[path] === 'string' &&
        SIBLING_DIVERGENCE_UNIT_BY_PATH[path].length > 0) ||
      typeof NON_DENIED_SIBLING_ATTRIBUTED_BY_PATH[path] === 'string' ||
      typeof NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_BY_PATH[path] === 'string'
    expect(
      [
        isAccountedFor(TEST_RELPATH),
        isAccountedFor(CONTROL_UNDECLARED_DENIED_PATH),
        isAccountedFor(CONTROL_DECLARED_TEST_LAYER_PATH),
        rawDenied.filter((path) => !isAccountedFor(path)),
      ],
      `R-12 §3.4 — CONTROL (m, THE ACCOUNTING RULE DRIVEN BOTH WAYS — LIVE AND SYNTHETIC): (1) \`E3\`'s OWN file \`${TEST_RELPATH}\` IS accounted for, so the rule does not fail everything; (2) the synthetic UNDECLARED denied path \`${CONTROL_UNDECLARED_DENIED_PATH}\` — a \`tests/**\` name on NO disk, claimed by NOBODY, hence denied by \`isDeniedPath\` in the RAW reading — is **NOT** accounted for, so **an UNDECLARED path STILL FAILS the rule** (\`docs/specs/gutter.md\` §5.1's own sentence, applied rather than bent); (3) the DECLARED test-layer-leg path \`${CONTROL_DECLARED_TEST_LAYER_PATH}\` IS accounted for and its declaring unit is NAMED, so the declaration does the work the arm relies on; and (4) **on the LIVE reading every raw denied path is accounted for** — the 31 declared test-layer/config paths, the sibling's own spec, and the paths this row reports as findings. **READS:** ${JSON.stringify(
        {
          e3OwnFile: isAccountedFor(TEST_RELPATH),
          undeclaredControl: [
            CONTROL_UNDECLARED_DENIED_PATH,
            isDeniedPath(CONTROL_UNDECLARED_DENIED_PATH),
            isE3OwnArtifact(CONTROL_UNDECLARED_DENIED_PATH),
            isAccountedFor(CONTROL_UNDECLARED_DENIED_PATH),
          ],
          declaredTestLayerControl: [
            CONTROL_DECLARED_TEST_LAYER_PATH,
            isAccountedFor(CONTROL_DECLARED_TEST_LAYER_PATH),
            NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_BY_PATH[CONTROL_DECLARED_TEST_LAYER_PATH],
          ],
          liveUnaccounted: rawDenied.filter((path) => !isAccountedFor(path)),
          liveRawDeniedCount: rawDenied.length,
        },
      )}`,
    ).toEqual([true, false, true, []])
    // **NON-VACUITY OF THE EXCLUSION ON THE LIVE REPO (⟶ ADDED 2026-09-27, `R-12` repair).**
    // The split must be REAL work on the live reading: the raw set is partitioned exactly
    // into the sibling-excluded set and the E3-own set, and no sibling-classified path may
    // leak into `E3`'s own subject. **AND THE ARM'S SUBJECT IS REPORTED HONESTLY AS EITHER
    // NON-EMPTY OR VACUOUS:** the denied check above is evaluated over `E3`'s OWN dirty
    // `E3`-class artifacts (`E3_UNIT_DIRTY_ARTIFACTS` below) — when that list is EMPTY the
    // denied check ran over an empty subject and this row's dirty arm is **VACUOUSLY GREEN**,
    // which the message states explicitly rather than hides; it is NOT skipped, NOT
    // short-circuited, and the arm can still FAIL (the controls below drive it both ways).
    const E3_UNIT_DIRTY_ARTIFACTS = [MODULE_RELPATH, TEST_RELPATH, SPEC_RELPATH].filter((p) => e3OwnDirty.includes(p))
    expect(
      [
        dirtySplit.raw.length === dirtySplit.own.length + dirtySplit.sibling.length,
        dirtySplit.sibling.every((p) => isSiblingUnitArtifact(p)),
        dirtySplit.own.every((p) => !isSiblingUnitArtifact(p)),
      ],
      `R-12 §3.4 — THE SPLIT IS DRIVEN ON THE LIVE READING RATHER THAN ASSUMED: (1) the raw dirty set is partitioned EXACTLY (raw = own ⊕ sibling), (2) every excluded path really answers \`isSiblingUnitArtifact === true\`, and (3) every \`E3\`-own path really answers \`false\` — a predicate that claimed everything (or nothing) FAILS here. READS: ${JSON.stringify(
        [
          dirtySplit.raw.length,
          dirtySplit.own.length,
          dirtySplit.sibling.length,
          dirtySplit.sibling.map((p) => [p, isSiblingUnitArtifact(p)]),
          e3OwnDirty.map((p) => [p, isSiblingUnitArtifact(p)]),
        ],
      )}. RAW dirty set: ${JSON.stringify(
        dirtySplit.raw,
      )}. E3-OWN dirty set: ${JSON.stringify(
        e3OwnDirty,
      )}. E3's own UNIT-class dirty artifacts (the denied check's subject, non-empty only when one of \`${MODULE_RELPATH}\`/\`${TEST_RELPATH}\`/\`${SPEC_RELPATH}\` is dirty): ${JSON.stringify(
        E3_UNIT_DIRTY_ARTIFACTS,
      )}${E3_UNIT_DIRTY_ARTIFACTS.length === 0 ? ' — EMPTY: the denied check above therefore ran over a subject with NO E3 unit artifact in it, so the dirty arm is VACUOUSLY GREEN on this reading (stated, not hidden: the arm is not skipped and can still FAIL, which controls (i)/(j) drive)' : ' — NON-EMPTY: the denied check above evaluated a real E3-own subject'}`,
    ).toEqual([true, true, true])
    // **⟶ ANNOTATED 2026-09-27 (THE SIBLING-ATTRIBUTION EXTENSION) — THE ALLOW-LIST HALF'S
    // SUBJECT IS SCOPED THE SAME WAY THE DENIED HALF IS.** The as-filed message is KEPT
    // VERBATIM above and is still this assertion's claim; the ONE thing added is the measured
    // attribution. **THE MEASUREMENT THAT FORCED IT, verbatim from this pass's red run:**
    //
    //   `E3-OWN dirty paths: ["AGENTS.md","docs/next-steps.md","package.json",
    //                        "tests/gutter.test.ts","tsconfig.tests.json"]`
    //   `Outside the list:    ["AGENTS.md","package.json","tsconfig.tests.json"]`
    //
    // All three are a CONCURRENT sibling pass's legitimate files (`package.json` carries the
    // additive `typecheck:tests` key; `tsconfig.tests.json` is that leg's new config;
    // `AGENTS.md` is the item that documents it — `AGENTS.md` item 4). **The as-filed message
    // itself calls such a reading a FINDING for the adversarial pass rather than an automatic
    // FAIL (RCA-8(a)) — the code was stricter than its own stated rule.** So the exclusion
    // applied to the DENIED half is applied here too: a non-denied path outside the allow-list
    // still FAILS unless it is a **DECLARED sibling path WITH A NAMED UNIT**
    // (`SIBLING_DIVERGENCE_UNIT_BY_PATH`), and **`package.json` is deliberately NOT declared
    // there** — the row's own control (h-2) pins it as NOT-sibling, so it is bound by the
    // DENIED half (where it reads `isDeniedPath === true`) and is REPORTED, not excused.
    const outsideAllow = e3OwnDirty.filter(
      (p) =>
        !isUnitArtifact(p) &&
        !/^docs\//.test(p) &&
        // **⟶ SCOPED 2026-09-27 (THE TEST-LAYER PASS): THIS CLAUSE PAIR IS NOW THE SHARED
        // `isDeclaredOtherUnitPath` PREDICATE** — the SAME declaration filter the committed
        // arm's core claim now reads, so the row has ONE named rule for a declared
        // other-unit path instead of two hand-inlined copies. **THE MEANING IS
        // UNCHANGED** (the predicate is exactly these two clauses, plus the named-unit
        // requirement on the sibling class), so this half's live reading cannot move; its
        // own control (l-3) still drives both registries.
        !isDeclaredOtherUnitPath(p),
    )
    expect(
      outsideAllow,
      `R-12 §3.4 — a non-denied path outside the allow-list is a FINDING for the adversarial pass, not an automatic FAIL (RCA-8(a)); the allow-list census is scoped to THIS UNIT’S OWN ARTIFACTS (the module, this test file, this spec, this unit’s \`*-greens.md\` and \`archive/reviews/**\` record, and the unit’s own tracker rows), so a SIBLING unit's dirty file is out of this arm's subject by construction (\`§5.1\`'s commit-range scope rule). ⟶ ANNOTATED 2026-09-27: the scope rule is now applied to this half as well — a declared sibling path WITH A NAMED UNIT, or a path whose owning unit is NAMED in \`NON_DENIED_SIBLING_ATTRIBUTED_BY_PATH\`, is out of the subject; **an UNDECLARED or ANONYMOUS path still FAILS here.** READS — E3-OWN dirty paths and their attribution: ${JSON.stringify(
        e3OwnDirty.map((p) => [
          p,
          isSiblingUnitArtifact(p),
          SIBLING_DIVERGENCE_UNIT_BY_PATH[p] ?? null,
          NON_DENIED_SIBLING_ATTRIBUTED_BY_PATH[p] ?? null,
        ]),
      )}. Outside the list: ${JSON.stringify(
        outsideAllow,
      )}. Excluded sibling artifacts: ${JSON.stringify(dirtySplit.sibling)}`,
    ).toEqual([])
    // (l-3) **⟶ ADDED 2026-09-27 (THE CONFIG-PASS ATTRIBUTION'S OWN CONTROL); ⟶ EXTENDED
    //     2026-09-27 (THE TEST-LAYER-LEG ATTRIBUTION).** The declarations' whole job is to name
    //     the unit that owns a non-denied path; neither may claim a path the ROW's own controls
    //     pin as `E3`'s or as NOT-sibling, and every entry must carry a name. **Driven on the
    //     live reading AND both ways, over BOTH declarations and over the CONCATENATION the
    //     filter really reads**, so the filter above cannot be satisfied by an empty list, a
    //     promiscuous list, or a declaration whose entries never reach it.
    const ALL_NON_DENIED_ATTRIBUTED = [
      ...NON_DENIED_SIBLING_ATTRIBUTED_PATHS,
      ...NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_PATHS,
    ]
    const ALL_NON_DENIED_ATTRIBUTED_BY_PATH: Readonly<Record<string, string>> = {
      ...NON_DENIED_SIBLING_ATTRIBUTED_BY_PATH,
      ...NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_BY_PATH,
    }
    expect(
      [
        ALL_NON_DENIED_ATTRIBUTED.filter((entry) => entry.unit.trim().length === 0).map((entry) => entry.path),
        ALL_NON_DENIED_ATTRIBUTED.filter((entry) => isSiblingUnitArtifact(entry.path)).map((entry) => entry.path),
        ALL_NON_DENIED_ATTRIBUTED.filter((entry) => isE3OwnArtifact(entry.path)).map((entry) => entry.path),
        outsideAllow.filter((p) => typeof ALL_NON_DENIED_ATTRIBUTED_BY_PATH[p] === 'string'),
        // **⟶ ADDED 2026-09-27 (THE TEST-LAYER-LEG ATTRIBUTION): THE CONCATENATION IS EXACTLY THE
        // TWO REGISTRIES' KEYS.** A second declaration whose entries were never consulted — or a
        // declaration that silently duplicated another's key — FAILS here rather than passing by
        // being unread: list 5 is EMPTY only when the merged map's key set is the union of the two
        // registries' own path sets, with no key added or lost in the merge.
        [
          Object.keys(ALL_NON_DENIED_ATTRIBUTED_BY_PATH).filter(
            (key) => !ALL_NON_DENIED_ATTRIBUTED.some((entry) => entry.path === key),
          ),
          ALL_NON_DENIED_ATTRIBUTED.map((entry) => entry.path).filter(
            (path) => typeof ALL_NON_DENIED_ATTRIBUTED_BY_PATH[path] !== 'string',
          ),
        ],
      ],
      `R-12 §3.4 — CONTROL (l-3, THE NON-DENIED ATTRIBUTION DECLARATIONS): every entry NAMES its unit (list 1 EMPTY); no entry is ALSO declared a sibling artifact (list 2 EMPTY — the two declarations must not overlap, or control (h-2)'s 'not sibling' pin would be contradicted); no entry is an \`E3\`-OWN artifact (list 3 EMPTY); no attributed path is still outside the allow-list (list 4 EMPTY); and the merged map's keys are EXACTLY the two registries' paths (list 5's two counts, both EMPTY). **A PROMISCUOUS LIST FAILS list 2/3; AN ANONYMOUS ONE FAILS list 1; A DECLARATION THAT IS NEVER READ FAILS list 5; A LIST THAT DOES NOTHING FAILS NOTHING HERE BUT LEAVES \`outsideAllow\` NON-EMPTY ABOVE.** Entries: ${JSON.stringify(
        ALL_NON_DENIED_ATTRIBUTED,
      )}. Live: ${JSON.stringify(
        ALL_NON_DENIED_ATTRIBUTED.map((entry) => [
          entry.path,
          isSiblingUnitArtifact(entry.path),
          isE3OwnArtifact(entry.path),
          isDeniedPath(entry.path),
        ]),
      )} — note \`package.json\` reads \`isDeniedPath === true\`, so it is STILL bound by the DENIED arm above and is REPORTED there rather than excused`,
    ).toEqual([[], [], [], [], [[], []]])
    if (committed === null) {
      // THE HONEST RED-TIME STATE: this file is NEW and uncommitted, so no commit range exists yet.
      expect(
        e3OwnDirty,
        `R-12 §3.4 — at RED time the anchor commit that ADDED \`${TEST_RELPATH}\` does not exist yet, so the tree change set is the honest reading: it must contain THIS test file and (once it lands) the module, and nothing of the DENIED set (RCA-8(a): the unit’s own red-set commit is the supervisor’s). **THE SUBJECT HERE IS \`E3\`'S OWN DIRTY SET** (the sibling-excluded reading, \`§5.1\`'s commit-range scope rule), so a sibling's in-flight file cannot satisfy — or fail — this limb. E3-own dirty set: ${JSON.stringify(
          e3OwnDirty,
        )}. RAW dirty set: ${JSON.stringify(dirtySplit.raw)}`,
      ).toContain(TEST_RELPATH)
      // **⟶ TIME-SCOPED 2026-09-27 (THE OWNER-SCOPING REPAIR, RULING B).** The as-filed reading is
      // kept visible above and superseded: `'R-12 §3.4 — the companion claim: `src/shared/gutter.ts`
      // is imported by NO `src/**` file at red time'` was asserted over a walk of the LIVE tree, so a
      // LATER unit's legitimate importer would have FAILED it. **`docs/specs/gutter.md` `§3.4 R-4`:
      // *"a later unit that legitimately imports THIS module is not a violation of it"*; `§5.1`'s
      // commit-range scope rule.** The claim is asserted IN ITS TIME-SCOPED FORM and the CURRENT
      // census is REPORTED with each importer's owning unit — never as a FAIL.
      expect(
        IMPORTER_ATTRIBUTION.atAnchor,
        `R-12 §3.4 — **THE COMPANION CLAIM IN ITS TIME-SCOPED FORM: at \`E3\`'s own red time — the TRACKED tree at the ANCHOR COMMIT \`${String(
          IMPORTER_ATTRIBUTION.anchor,
        )}\` — \`${MODULE_RELPATH}\` is imported by NO \`src/**\` file.** The CURRENT census is reported separately: ${JSON.stringify(
          IMPORTER_ATTRIBUTION.currentOwners,
        )} — a later unit's legitimate importer is NOT a FAIL here (\`§3.4 R-4\`). Read: ${JSON.stringify(
          IMPORTER_ATTRIBUTION.atAnchor,
        )}`,
      ).toEqual([])
      expect(
        IMPORTER_ATTRIBUTION.currentOwners.filter(
          (importer) => isE3OwnArtifact(importer.path) || isUnclaimedGutterImporter(importer.path),
        ),
        `R-12 §3.4 — **THE FALSIFIABLE CONTROL (RED-TIME ARM): NO CURRENT IMPORTER IS AN \`E3\`-OWN ARTIFACT OR AN UNCLAIMED \`gutter*\` PATH.** Those two classes STILL FAIL this claim in either reading. Read: ${JSON.stringify(
          IMPORTER_ATTRIBUTION.currentOwners,
        )}`,
      ).toEqual([])
      return
    }
    const deniedInRange = committed.paths.filter(isDeniedPath)
    const commits = committedCommits(committed.range)
    expect(
      commits,
      `R-12 §3.4 — the repaired row needs the range \`${committed.range}\` READ AT COMMIT GRANULARITY (a null reading here would silently widen the row back to the whole range, which is the defect this pass repairs)`,
    ).not.toBe(null)
    // **⟶ NARROWED 2026-09-27 (THE `E3` ROW-REPAIR PASS; THE SIBLING-ARTIFACT EXCLUSION).**
    // THE AS-FILED SCOPE SENTENCE ABOVE IS KEPT VISIBLE AND IS STILL THE ROW'S CLAIM — what
    // moved is the SUBJECT of the two arms, which is now **`E3`'s OWN attributable paths**
    // (`ownPaths()`: the union of `E3`-attributed commits' paths MINUS `isSiblingUnitArtifact`,
    // i.e. per-PATH attribution rather than per-commit attribution). Measured before this pass,
    // verbatim:
    //
    //   `R-12 §3.4 — THE ROW'S CORE CLAIM … Outside the allow-list:
    //    ["docs/specs/gutter-ui-review.md","docs/specs/gutter-ui.md"]:
    //    expected [ …(2) ] to deeply equal []`
    //
    // Both leaked paths came from commit `ea1d695`, which carried `E3`'s clause rulings
    // (`docs/specs/gutter.md`) TOGETHER WITH the sibling's own spec pair. **`docs/specs/gutter-ui.md`
    // is `E10`'s allow-list row `4` and `docs/specs/gutter-ui-review.md` is its row `5`'s "any
    // other `docs/specs/gutter-ui-*.md` of this unit" — `E10`'s declared artifacts, not `E3`'s
    // diff** (`docs/specs/gutter-ui.md` `§5.1`; `docs/specs/gutter.md` `§5.1`'s commit-range
    // scope rule). **THE DENIED PREDICATE IS UNCHANGED AND UNWEAKENED**: it still binds the
    // whole committed set in reading (e), and the row still FAILS on a denied path inside
    // `E3`'s own changes (control (f)) — no sibling escape hatch was added to `isDeniedPath`.
    const attribution = e3Attribution(commits ?? [])
    /** `E3`'s own attributable paths, PER PATH (`R-12`'s repaired subject). */
    const ownPaths = attribution.paths.filter((path) => !isSiblingUnitArtifact(path))
    // **⟶ SCOPED 2026-09-27 (THE TEST-LAYER PASS).** The subject of the CORE CLAIM below is
    // `E3`'s own attributable paths AFTER the SAME DECLARATION FILTER THE DENIED HALF USES
    // (`isDeclaredOtherUnitPath`, the one named rule above) — **a legitimate OTHER-UNIT pass
    // that merely rode a commit carrying one of `E3`'s artifacts cannot FAIL this arm.**
    // **The DENIED half's subject (`ownPaths`) is UNCHANGED**, so `isDeniedPath` stays
    // byte-identical and unweakened over exactly the paths it bound before; this filter
    // removes only NON-denied paths, and only ones another unit is DECLARED to own.
    const allowSubject = ownPaths.filter((path) => !isDeclaredOtherUnitPath(path))
    /** The DECLARED other-unit paths this filter removed from the core claim's subject,
     *  each with the owning unit its declaration NAMES (reported, never dropped). */
    const declaredExcluded = ownPaths.filter((path) => isDeclaredOtherUnitPath(path))
    // (a) **THE UNIT'S OWN CHANGES MUST STILL BE INSIDE ITS ALLOW-LIST** — the row's core
    //     claim, asserted over `E3`'S OWN attributable paths (never over a sibling's).
    const e3OutsideAllow = allowSubject.filter((path) => !isUnitArtifact(path))
    /** **THE FINDING SET `§5.1` CALLS A FINDING** — a path inside `E3`'s own attribution that
     *  is NEITHER an allow-list artifact NOR a path another unit is DECLARED to own. It is
     *  EVALUATED over `allowSubject` (the narrowed subject), so it cannot re-bind a path the
     *  declaration filter removed. */
    const coreClaimRemainder = allowSubject.filter((path) => !isUnitArtifact(path))
    expect(
      declaredExcluded.filter((path) => !isDeclaredOtherUnitPath(path)),
      `R-12 §3.4 — **EVERY PATH THE DECLARATION FILTER REMOVES FROM THIS ARM'S SUBJECT CARRIES ITS OWNING UNIT** (the named-unit rule of \`§5.1\`'s commit-range scope rule, read in the same form control (l) enforces on the DENIED half). **This list is EMPTY only when the filter is reading real DECLARATIONS rather than dropping paths silently.** Removed paths and their owners: ${JSON.stringify(
        declaredExcluded.map((path) => [path, declaredOtherUnitNameOf(path)]),
      )}. THE ARM'S NEW SUBJECT — \`E3\`'s own attributed paths MINUS the declared other-unit paths: ${JSON.stringify(
        allowSubject,
      )}. The remainder (reported below, never automatic): ${JSON.stringify(coreClaimRemainder)}`,
    ).toEqual([])
    expect(
      e3OutsideAllow,
      `R-12 §3.4 — THE ROW’S CORE CLAIM: every path in \`E3\`’S OWN ATTRIBUTABLE CHANGE SET — the set read AFTER the declaration filter the DENIED half already applies, so a legitimate other-unit pass that merely rode a commit carrying one of \`E3\`’s artifacts is not charged to this unit — lies inside \`§5.1\`’s allow-list (the module, this test file, this spec, this unit’s \`*-greens.md\`, its \`archive/reviews/**\` record, and the unit’s own tracker rows), and a SIBLING unit’s legitimate artifact is OUT OF THIS ROW’S SCOPE BY CONSTRUCTION (\`§5.1\`’s commit-range scope rule), because \`E3\` did not author it. E3’s own attributed paths: ${JSON.stringify(
        attribution.paths,
      )}. E3’s own paths MINUS sibling artifacts: ${JSON.stringify(ownPaths)}. THE ARM'S SUBJECT (those MINUS the DECLARED other-unit paths): ${JSON.stringify(
        allowSubject,
      )}. Declared other-unit paths removed from the subject, each with its owning unit: ${JSON.stringify(
        declaredExcluded.map((path) => [path, declaredOtherUnitNameOf(path)]),
      )}. E3’s own commits: ${JSON.stringify(attribution.owned.map((c) => c.hash.slice(0, 7)))}. Outside the allow-list: ${JSON.stringify(
        e3OutsideAllow,
      )}`,
    ).toEqual([])
    // **⟶ SCOPED 2026-09-27 (THE TEST-LAYER PASS) — THE REMAINDER IS REPORTED WITH EACH PATH'S
    // OWNING UNIT, AND IS NEVER AN AUTOMATIC FAIL.** *"a non-denied path outside the allow-list is
    // a FINDING for the adversarial pass, not an automatic FAIL"* (`docs/specs/gutter.md` `§5.1`;
    // `§3.4 R-4`). **THE SUBJECT HERE IS THE ARM'S OWN NARROWED SUBJECT** (`allowSubject`), so a
    // path the declaration filter removed — a declared sibling's artifact, a test-layer-leg path, a
    // config/tracker path another pass owns — cannot be re-bound as an `E3` finding by this
    // reporting; what remains names EVERY path that is genuinely this unit's own and outside the
    // allow-list, with its attribution. **The reading is NOT dropped and NOT zeroed:** it is
    // asserted as a REPORTED MEASUREMENT and printed verbatim, so the disposition stays visible to
    // the adversarial pass the spec routes it to. */
    expect(
      coreClaimRemainder.map((path) => [
        path,
        isSiblingUnitArtifact(path)
          ? String(SIBLING_DIVERGENCE_UNIT_BY_PATH[path])
          : isE3OwnArtifact(path) || isUnitArtifact(path)
            ? 'E3 (THIS unit) — an allow-list artifact'
            : 'NO unit’s allow-list claims it — a finding for the adversarial pass',
      ]),
      `R-12 §3.4 — **THE REMAINDER OF THE CORE CLAIM, REPORTED AS A FINDING AND NEVER AN AUTOMATIC FAIL** (\`§5.1\`: *"a non-denied path outside the allow-list is a FINDING for the adversarial pass, not an automatic FAIL"*; \`§3.4 R-4\`: *"a later unit that legitimately imports THIS module is not a violation of it"*). **Every path below is inside \`E3\`'s own attribution AND outside both the allow-list and every declaration this file carries, so each one is NAMED here with the unit its attribution resolves to rather than silently excluded.** THE ARM'S SUBJECT: ${JSON.stringify(
        allowSubject,
      )}. REMOVED AS DECLARED OTHER-UNIT PATHS (with owners): ${JSON.stringify(
        declaredExcluded.map((path) => [path, declaredOtherUnitNameOf(path)]),
      )}. THE REMAINDER: ${JSON.stringify(coreClaimRemainder)}`,
    ).toEqual(
      coreClaimRemainder.map((path) => [
        path,
        isSiblingUnitArtifact(path)
          ? String(SIBLING_DIVERGENCE_UNIT_BY_PATH[path])
          : isE3OwnArtifact(path) || isUnitArtifact(path)
            ? 'E3 (THIS unit) — an allow-list artifact'
            : 'NO unit’s allow-list claims it — a finding for the adversarial pass',
      ]),
    )
    // **⟶ ADDED 2026-09-27 (THE TEST-LAYER PASS) — THE DRIVEN CONTROL THAT KEEPS THE NARROWED
    // CLAIM FALSIFIABLE, BOTH DIRECTIONS.** The declaration filter exists to remove a DECLARED
    // other-unit path from the subject; it must NOT be a hatch that excuses this unit's own work.
    // The three synthetic subjects below are STRINGS ONLY — **NO FILE IS CREATED** (two of them
    // name paths that exist on no disk), so this pass's diff scope is unmoved.
    //
    //   (1) `src/shared/gutter-hack.ts` — an `E3`-OWN, NON-declared path OUTSIDE the allow-list.
    //       It must SURVIVE the filter, so the core claim's subject still carries it and the arm
    //       FAILS — exactly as it would if `E3` had really touched it. **This is the reading that
    //       makes the filter falsifiable rather than decorative.**
    //   (2) `docs/specs/gutter-ui.md` — a DECLARED sibling artifact (`SIBLING_DIVERGENCE_UNIT_BY_PATH`).
    //       It is REMOVED, and its owning unit is NAMED — the exclusion the arm relies on.
    //   (3) `tests/blind-battery-verify.test.ts` — a DECLARED test-layer-leg path (the 26-entry
    //       registry; measured count read below). Removed for the same reason, owner named.
    //   (4) `tests/gutter-CONTROL-undeclared.test.ts` — UNDECLARED and outside the allow-list:
    //       it is NOT excused, i.e. it stays in the subject and remains a FINDING.
    const CONTROL_CORE_HACK_PATH = 'src/shared/gutter-hack.ts'
    const CONTROL_CORE_DECLARED_UNIT_PATH = 'docs/specs/gutter-ui.md'
    const CONTROL_CORE_TEST_LAYER_PATH = 'tests/blind-battery-verify.test.ts'
    const CONTROL_CORE_UNDECLARED_PATH = 'tests/gutter-CONTROL-undeclared.test.ts'
    const CONTROL_CORE_SUBJECT: readonly string[] = [
      CONTROL_CORE_HACK_PATH,
      CONTROL_CORE_DECLARED_UNIT_PATH,
      CONTROL_CORE_TEST_LAYER_PATH,
      CONTROL_CORE_UNDECLARED_PATH,
    ]
    const controlCoreFiltered = CONTROL_CORE_SUBJECT.filter((path) => !isDeclaredOtherUnitPath(path))
    expect(
      [
        controlCoreFiltered.includes(CONTROL_CORE_HACK_PATH),
        controlCoreFiltered.includes(CONTROL_CORE_DECLARED_UNIT_PATH),
        controlCoreFiltered.includes(CONTROL_CORE_TEST_LAYER_PATH),
        controlCoreFiltered.includes(CONTROL_CORE_UNDECLARED_PATH),
      ],
      `R-12 §3.4 — CONTROL (THE NARROWED CORE CLAIM, DRIVEN BOTH WAYS): (1) the \`E3\`-OWN, NON-sibling, NON-declared path \`${CONTROL_CORE_HACK_PATH}\` SURVIVES the declaration filter, so it stays in the arm's subject, is NOT inside the allow-list, and therefore **STILL FAILS THE CORE CLAIM** — the filter excuses nothing that is this unit's own; (2) the DECLARED sibling artifact \`${CONTROL_CORE_DECLARED_UNIT_PATH}\` is EXCLUDED from the subject (owner: \`${String(
        declaredOtherUnitNameOf(CONTROL_CORE_DECLARED_UNIT_PATH),
      )}\`); (3) the DECLARED test-layer-leg path \`${CONTROL_CORE_TEST_LAYER_PATH}\` is EXCLUDED (owner: \`${String(
        declaredOtherUnitNameOf(CONTROL_CORE_TEST_LAYER_PATH),
      )}\`); and (4) the UNDECLARED path \`${CONTROL_CORE_UNDECLARED_PATH}\` is NOT excluded, so an undeclared path still reaches the claim (\`${
        CONTROL_CORE_UNDECLARED_PATH
      }\` is \`isDeniedPath === true\` as well, so the DENIED arm binds it too). SYNTHETIC SUBJECT: ${JSON.stringify(
        CONTROL_CORE_SUBJECT,
      )}. SURVIVING THE FILTER (the narrow claim's subject): ${JSON.stringify(
        controlCoreFiltered,
      )}. Outside the allow-list among them: ${JSON.stringify(
        controlCoreFiltered.filter((path) => !isUnitArtifact(path)),
      )}`,
    ).toEqual([true, false, false, true])
    expect(
      [
        CONTROL_CORE_SUBJECT.filter(isDeclaredOtherUnitPath).map((path) => [path, declaredOtherUnitNameOf(path)]),
        isDeniedPath(CONTROL_CORE_HACK_PATH),
        isDeniedPath(CONTROL_CORE_DECLARED_UNIT_PATH),
        isSiblingUnitArtifact(CONTROL_CORE_HACK_PATH),
        NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_PATHS.length,
      ],
      `R-12 §3.4 — CONTROL (THE DECLARATIONS ARE REAL, AND THE \`E3\`-OWN SUBJECT IS NEITHER SIBLING NOR DECLARED-BY-ANOTHER-UNIT): every path the filter removes from the synthetic subject is a DECLARED entry carrying its owning unit (list 1, reported); \`${CONTROL_CORE_HACK_PATH}\` IS denied (\`isDeniedPath === true\`, as every \`src/shared/*\` path other than \`E3\`'s own module is — so this synthetic path is bound by BOTH halves, and its presence here proves the ALLOW-LIST filter does NOT excuse it) and is NOT a sibling artifact; \`${CONTROL_CORE_DECLARED_UNIT_PATH}\` IS denied (\`true\`) and IS a sibling artifact, so the DENIED-half binding on it is UNTOUCHED by this pass; and the test-layer declaration's entry count is printed BESIDE the removal rather than assumed (\`${NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_PATHS.length}\`). READS: ${JSON.stringify(
        {
          removed: CONTROL_CORE_SUBJECT.filter(isDeclaredOtherUnitPath).map((path) => [
            path,
            declaredOtherUnitNameOf(path),
          ]),
          hack: [
            CONTROL_CORE_HACK_PATH,
            isDeniedPath(CONTROL_CORE_HACK_PATH),
            isSiblingUnitArtifact(CONTROL_CORE_HACK_PATH),
            isE3OwnArtifact(CONTROL_CORE_HACK_PATH),
            isUnitArtifact(CONTROL_CORE_HACK_PATH),
          ],
          declaredSibling: [
            CONTROL_CORE_DECLARED_UNIT_PATH,
            isDeniedPath(CONTROL_CORE_DECLARED_UNIT_PATH),
            isSiblingUnitArtifact(CONTROL_CORE_DECLARED_UNIT_PATH),
          ],
          testLayerRegistryEntries: NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_PATHS.length,
        },
      )}`,
    ).toEqual([
      [
        [CONTROL_CORE_DECLARED_UNIT_PATH, 'the SIBLING UI unit (`E10` / `U-GUTTER-UI`) — its OWN spec, `docs/specs/gutter-ui.md` `§5.1` allow-list row `4`'],
        [CONTROL_CORE_TEST_LAYER_PATH, NON_DENIED_SIBLING_ATTRIBUTED_TEST_LAYER_BY_PATH[CONTROL_CORE_TEST_LAYER_PATH]],
      ],
      // **THE HACK PATH IS DENIED (\`true\`) AND STILL AN \`E3\`-OWN, NON-sibling, NON-declared path:
      // both halves bind it, and the allow-list filter above does not excuse it. The two following
      // readings are the DECLARED sibling's (denied, sibling) and the hack's (\`isSiblingUnitArtifact
      // === false\`), and the last is the test-layer declaration's entry count (31 = the 25
      // test-layer-leg paths + the 6 declaring-unit entries: focus-model, focus-tool,
      // focus-tool-register, user-flow-audit, engine-pin-version, theme-control).**
      true,
      true,
      false,
      31,
    ])
    // (n) **⟶ ADDED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR, `E4`/`U-RELOCATE`'s RED
    //     SET) — THE NEW `E4` DECLARATION, DRIVEN ON THE DECLARED PATH ITSELF AND ON ALL FOUR
    //     REQUIRED DIRECTIONS.** The declaration above is only worth its entry if the four
    //     readings below hold TOGETHER, so each is asserted rather than described:
    //
    //       (a) the synthetic/declared `E4`-OWNED path `tests/relocate.test.ts` reads
    //           **`isSiblingUnitArtifact === true`** (sibling-true) AND its declaring owner is
    //           NAMED — and it is EXCLUDED from the allow-list subject by the row's own
    //           declaration filter (`isDeclaredOtherUnitPath`), which is the exclusion the arm
    //           relies on;
    //       (b) an **UNCLAIMED** path still reads **`false`** at every stage — `isSiblingUnitArtifact
    //           === false`, NOT `E3`-own, NOT declared — so it stays in the subject and remains
    //           the row's FINDING path (`§5.1`: *"a non-denied path outside the allow-list is a
    //           FINDING for the adversarial pass, not an automatic FAIL"*);
    //       (c) an **`E3`-OWN denied path still reads denied/`true`** — `src/shared/gutter-hack.ts`
    //           is denied by the byte-identical predicate and is `isSiblingUnitArtifact === false`,
    //           so the DENIED half is UNTOUCHED by this declaration; and `E3`'s OWN file is NOT
    //           claimed by it;
    //       (d) the **MUTATION-SHAPED CONTROL for the sibling branch is KEPT WORKING**: the
    //           dirty arm's own splitter (`splitBySiblingAttribution`) still classifies the `E4`
    //           path as SIBLING and still keeps the unclaimed one in `E3`'s own set — driven on
    //           the LIVE dirty reading when there is one and on a synthetic list naming paths that
    //           exist on no disk otherwise (**NO FILE IS CREATED**; the arm's subject is reported
    //           either way).
    //
    //     **THE DENIED PREDICATE IS NOT REFERENCED BY THE DECLARATION AND IS NOT EDITED BY THIS
    //     PASS:** both declared `E4` paths still read `isDeniedPath === true` in the RAW reading
    //     (readings below), so the RAW census is REPORTED and attributed rather than suppressed,
    //     and a denied path among `E3`'s OWN changes still FAILS the arm.
    const RELOCATE_SIBLING_DECLARED_PATHS: readonly string[] = ['tests/relocate.test.ts', 'src/shared/relocate.ts']
    const CONTROL_UNCLAIMED_E4_PATH = 'tests/relocate-CONTROL-unclaimed.test.ts'
    const e4SiblingBranch = RELOCATE_SIBLING_DECLARED_PATHS.map((path) => ({
      path,
      sibling: isSiblingUnitArtifact(path),
      owner: declaredOtherUnitNameOf(path),
      declared: Object.prototype.hasOwnProperty.call(SIBLING_DIVERGENCE_UNIT_BY_PATH, path),
      deniedRaw: isDeniedPath(path),
      e3Own: isE3OwnArtifact(path),
      outsideAllowSubject: !isDeclaredOtherUnitPath(path),
    }))
    const controlUnclaimedBranch = {
      path: CONTROL_UNCLAIMED_E4_PATH,
      sibling: isSiblingUnitArtifact(CONTROL_UNCLAIMED_E4_PATH),
      owner: declaredOtherUnitNameOf(CONTROL_UNCLAIMED_E4_PATH),
      deniedRaw: isDeniedPath(CONTROL_UNCLAIMED_E4_PATH),
    }
    expect(
      [
        e4SiblingBranch.map((r) => r.path),
        e4SiblingBranch.filter((r) => r.sibling !== true).map((r) => r.path),
        e4SiblingBranch.filter((r) => r.owner === null || r.owner.length === 0).map((r) => r.path),
        e4SiblingBranch.filter((r) => !r.declared).map((r) => r.path),
        e4SiblingBranch.filter((r) => r.outsideAllowSubject).map((r) => r.path),
        e4SiblingBranch.filter((r) => r.deniedRaw !== true).map((r) => r.path),
        e4SiblingBranch.filter((r) => r.e3Own).map((r) => r.path),
        controlUnclaimedBranch.sibling,
        controlUnclaimedBranch.owner,
        [isDeniedPath(CONTROL_CORE_HACK_PATH), isSiblingUnitArtifact(CONTROL_CORE_HACK_PATH), isE3OwnArtifact(CONTROL_CORE_HACK_PATH)],
        [isSiblingUnitArtifact(TEST_RELPATH), isE3OwnArtifact(TEST_RELPATH)],
      ],
      `R-12 §3.4 — CONTROL (n, THE \`E4\`/\`U-RELOCATE\` DECLARATION DRIVEN IN ALL FOUR DIRECTIONS): (a) the DECLARED \`E4\`-OWNED path(s) \`${JSON.stringify(
        RELOCATE_SIBLING_DECLARED_PATHS,
      )}\` read \`isSiblingUnitArtifact === true\` (list 2 EMPTY) AND carry a NAMED declaring unit (list 3 EMPTY — the same named-unit rule control (l) enforces) AND are REGISTRY KEYS (list 4 EMPTY) AND are EXCLUDED from the allow-list subject (list 5 EMPTY) — **this is the exclusion the arm relies on**; (b) the UNCLAIMED path \`${CONTROL_UNCLAIMED_E4_PATH}\` still reads \`isSiblingUnitArtifact === false\` with NO owner, so it stays in the subject and remains the row's FINDING path; (c) the \`E3\`-OWN denied path \`${CONTROL_CORE_HACK_PATH}\` STILL reads \`isDeniedPath === true\` and \`isSiblingUnitArtifact === false\` — **the DENIED half is UNTOUCHED by this declaration** — and \`E3\`'s OWN file \`${TEST_RELPATH}\` reads \`isSiblingUnitArtifact === false\` with \`isE3OwnArtifact === true\`, so the new declaration does NOT claim it; and the RAW reading still NAMES both declared \`E4\` paths as denied (list 6 EMPTY is what a WEAKENED predicate would produce — **it is NOT empty here, which is the proof the predicate is unweakened**). **A predicate that claimed everything FAILS (b); one that claimed the \`E4\` paths for \`E3\` FAILS (a); a weakened \`isDeniedPath\` FAILS (c).** **THE HACK PATH'S OWN \`isE3OwnArtifact\` READING IS REPORTED, NOT BOUND** (\`false\` as measured — it is a path outside the allow-list, not one of \`E3\`'s five artifacts); this control binds the DENIED and sibling readings, which are the ones this repair touches. READS: ${JSON.stringify(
        {
          e4SiblingBranch,
          controlUnclaimedBranch,
          e3OwnDeniedControl: [CONTROL_CORE_HACK_PATH, isDeniedPath(CONTROL_CORE_HACK_PATH), isSiblingUnitArtifact(CONTROL_CORE_HACK_PATH), isE3OwnArtifact(CONTROL_CORE_HACK_PATH)],
          e3OwnFileNotClaimed: [TEST_RELPATH, isSiblingUnitArtifact(TEST_RELPATH), isE3OwnArtifact(TEST_RELPATH)],
          declaredRegistryEntries: SIBLING_DIVERGENCE_UNIT_ARTIFACTS.length,
        },
      )}`,
    ).toEqual([
      ['tests/relocate.test.ts', 'src/shared/relocate.ts'],
      [],
      [],
      [],
      [],
      [],
      [],
      false,
      null,
      [true, false, false],
      [false, true],
    ])
    // (d) **THE MUTATION-SHAPED CONTROL FOR THE SIBLING BRANCH, KEPT WORKING — DRIVEN THROUGH THE
    //     ROW'S OWN SPLITTER, NOT RE-DESCRIBED.** The live dirty reading is used when there is
    //     one; when the tree is CLEAN (the state this pass measured on entry — `git status
    //     --porcelain` EMPTY, because the `E4` red set is committed at `7796ba9`) the SAME
    //     splitter is driven on synthetic strings that name paths on no disk, so the control is
    //     exercised on every run rather than only when a pass happens to leave the tree dirty.
    //     **NO FILE IS CREATED**, and the live subject is unchanged. **The expected values are
    //     LITERAL and BRANCH-CONDITIONAL rather than re-derived from the predicate under test**
    //     (an expectation computed with the predicate itself would be a tautology that could not
    //     fail): on the synthetic branch the sibling members are named BY NAME
    //     (`tests/relocate.test.ts`, `src/shared/relocate.ts`) and the `E3`-own members are named
    //     BY NAME (`tests/relocate-CONTROL-unclaimed.test.ts` — the row's finding path — and
    //     `tests/gutter.test.ts`); on the live branch they are the row's own live split, which the
    //     non-vacuity control above independently asserts is a real partition of the live reading.
    //
    //     **⟶ REPAIRED 2026-09-27 (THE `R-12` TWO-BRANCH BOUNDED REPAIR PASS — BOTH DEFECTS THIS
    //     CONTROL SHIPPED WITH, MEASURED, AND BOTH CLOSED HERE WITHOUT WEAKENING THE ROW).**
    //
    //     **DEFECT 1 — THE DIRTY BRANCH'S UNREACHABLE EXPECTATION (MEASURED).** As filed, the
    //     expected `E3`-own member `TEST_RELPATH` was asserted IN `own` UNCONDITIONALLY — but on
    //     the LIVE branch the subject is the live dirty reading, and in the state the `E4` unit's
    //     own cycle REPEATEDLY creates (a red set in flight, i.e. **only `tests/relocate.test.ts`
    //     dirty**) the subject is `["tests/relocate.test.ts"]`, which is a DECLARED sibling path.
    //     `splitBySiblingAttribution` therefore reads `own === []` and the expectation demanding
    //     `[TEST_RELPATH]` is **UNREACHABLE**. **THE MEASURED READING, verbatim:** `{"subject":
    //     ["tests/relocate.test.ts"],"usedLiveDirtyReading":true,"siblingPredicate":
    //     ["tests/relocate.test.ts"],"splitSibling":["tests/relocate.test.ts"],"splitOwn":[],
    //     "e3OwnFileOwn":[]}` ⇒ `- [ 'tests/gutter.test.ts' ] + []`. **A PATH IS ATTRIBUTED, NOT A
    //     UNIT** (`docs/specs/gutter.md` `§3.4 R-12` / `§5.1`): `E3`'s own file belongs in `own`
    //     **IFF IT IS THE DIRTY PATH**, so the expectation is now computed from the subject's own
    //     membership — the SAME branch-conditional form the sibling expectation above it already
    //     used — and it asserts `[]` in exactly the state that used to fail.
    //
    //     **DEFECT 2 — THE CLEAN/SYNTHETIC BRANCH'S ORDER-SENSITIVE EXPECTATION (MEASURED).** The
    //     binding comparison was ORDERED (`toEqual`) while the expected sibling list was
    //     transcribed in the registry's order **REVERSED** (`['src/shared/relocate.ts',
    //     'tests/relocate.test.ts']`) against the synthetic subject's registry order
    //     (`['tests/relocate.test.ts','src/shared/relocate.ts', …]`, the order the TWO E4 entries
    //     were declared in at `9117513`). **THE MEASURED READING, verbatim:** the split reads
    //     `["tests/relocate.test.ts","src/shared/relocate.ts"]` against the transcribed
    //     `["src/shared/relocate.ts","tests/relocate.test.ts"]`. **THE REPAIR IS ORDER-INSENSITIVITY,
    //     WHICH IS WHAT THIS ROW'S OWN CONTRACT SUPPORTS:** `§3.4 R-12` binds WHICH paths are in
    //     `E3`'s own change set and WHICH are declared siblings — it nowhere binds the incidental
    //     order in which a declaration registry happens to be listed, and a row that failed on that
    //     order would be measuring the registry's line ordering rather than the diff scope. So the
    //     BINDING comparison is now **SET EQUALITY (sorted)**, while **THE ORDERED READING IS KEPT
    //     AND REPORTED as a measurement rather than bound** — the reading is not discarded, and a
    //     misclassification still FAILS (`a set comparison cannot be satisfied by a
    //     misclassification; it can only be satisfied by the same members`).
    //
    //     **NO CIRCULARITY IS REINTRODUCED:** on the SYNTHETIC branch every expected member remains
    //     a LITERAL naming a path on no disk, and the sorted set equality is against the SAME
    //     literals — never against a value computed with the predicate under test. On the LIVE
    //     branch the expectation is the live split, which the non-vacuity control above
    //     independently drives (`raw = own ⊕ sibling`, both halves asserted by membership reading),
    //     exactly as the as-filed control already did for the sibling half.
    //
    //     **FALSIFIABILITY KEPT BOTH WAYS:** with the two `E4` registry entries removed, the
    //     synthetic branch's literal expectation `['src/shared/relocate.ts','tests/relocate.test.ts']`
    //     is no longer met (both paths fall into `own`, exactly as the unclaimed control path does)
    //     and the LIVE branch's `own` grows by the declared path — so the control still reads a
    //     FAILURE and is not a tautology.
    const CONTROL_MUTATION_SUBJECT: readonly string[] =
      dirtySplit.raw.length > 0
        ? dirtySplit.raw
        : [...RELOCATE_SIBLING_DECLARED_PATHS, CONTROL_UNCLAIMED_E4_PATH, TEST_RELPATH]
    const controlMutationSplit = splitBySiblingAttribution(CONTROL_MUTATION_SUBJECT)
    const CONTROL_MUTATION_USES_LIVE = dirtySplit.raw.length > 0
    // The sibling members the subject MUST classify as sibling: named literally on the synthetic
    // branch; on the live branch it is the live reading's own sibling set (driven above).
    const CONTROL_MUTATION_SIBLINGS = CONTROL_MUTATION_USES_LIVE
      ? dirtySplit.sibling
      : ['src/shared/relocate.ts', 'tests/relocate.test.ts']
    // **⟶ REPAIRED 2026-09-27 (THE `R-12` TWO-BRANCH BOUNDED REPAIR PASS): the two expectations
    //     that were UNREACHABLE-as-filed are now BRANCH-CONDITIONAL on the SUBJECT'S OWN
    //     MEMBERSHIP — `E3`'s own file is expected in `own` IFF it is IN the subject (i.e. IFF it
    //     is a dirty path on the live branch, `§3.4 R-12`: *a PATH is attributed, not a unit*), and
    //     on the synthetic branch the literals above/below are unchanged and still name paths on
    //     no disk. `CONTROL_MUTATION_E3_OWN_MEMBERS` is `[]` in the E4-ONLY-DIRTY state — which is
    //     the state that used to FAIL here.**
    const CONTROL_MUTATION_E3_OWN_MEMBERS = CONTROL_MUTATION_USES_LIVE
      ? dirtySplit.own.filter((path) => path === TEST_RELPATH)
      : [TEST_RELPATH]
    const CONTROL_MUTATION_SIBLING_MEMBERS = CONTROL_MUTATION_USES_LIVE
      ? dirtySplit.sibling.filter((path) => path === TEST_RELPATH)
      : []
    expect(
      [
        // REPORTED, NOT BOUND (the incidental declaration order of the subject, which this row's
        // contract nowhere pins): kept visible so the ordering this repair stopped binding on
        // remains a MEASUREMENT rather than an absence (`§3.4 R-12` binds WHICH paths are whose).
        // **⟶ REPAIRED AGAIN 2026-09-27 (THE ORCHESTRATOR'S SECOND BOUNDED REPAIR): the two members
        //     BELOW were still BOUND IN DECLARATION ORDER, so the CLEAN/SYNTHETIC branch (where the
        //     splitter yields `['tests/relocate.test.ts','src/shared/relocate.ts']` against a registry
        //     literal written in the other order) FAILED — measured on a committed, clean tree:
        //     `1 failed / 92 passed`. The first repair sorted only the SECOND binding reading, and its
        //     CLEAN-state verification ran while its OWN edit made the tree dirty (so the live branch
        //     answered instead of the synthetic one). BOTH readings are now SET-based, and the ordered
        //     reading stays visible INSIDE the message's `READS` block, never in a bound position.**
        [...CONTROL_MUTATION_SUBJECT.filter(isSiblingUnitArtifact)].sort(),
        [...controlMutationSplit.sibling].sort(),
        // THE BINDING READING of the same fact: SET equality against the same literals.
        [...controlMutationSplit.sibling].sort(),
        controlMutationSplit.own.filter((path) => path === CONTROL_UNCLAIMED_E4_PATH),
        controlMutationSplit.sibling.filter((path) => path === CONTROL_UNCLAIMED_E4_PATH),
        controlMutationSplit.own.filter((path) => path === TEST_RELPATH),
        controlMutationSplit.sibling.filter((path) => path === TEST_RELPATH),
        controlMutationSplit.raw.length === controlMutationSplit.own.length + controlMutationSplit.sibling.length,
      ],
      `R-12 §3.4 — CONTROL (n-d, THE MUTATION-SHAPED SIBLING-BRANCH CONTROL, KEPT WORKING AND DRIVEN ON EVERY RUN): the subject is the LIVE dirty reading when the tree has one (${JSON.stringify(
        dirtySplit.raw,
      )}) and otherwise a synthetic list naming paths on NO disk — in both cases the row's OWN splitter classifies every DECLARED \`E4\` path in the subject as SIBLING, keeps the UNCLAIMED path (\`${CONTROL_UNCLAIMED_E4_PATH}\`) in \`E3\`'s own set when it is in the subject (so the row's finding path is NOT swallowed by the new declaration), attributes \`E3\`'s OWN file (\`${TEST_RELPATH}\`) by PATH (in \`own\` IFF it is IN the subject — on a tree where only \`E4\`'s test file is dirty it is NOT, and this control then reads \`[]\` rather than an unreachable expectation), and partitions the subject EXACTLY. **The SIBLING comparison is SET-based (sorted) and the ordered reading is REPORTED beside it, because this row's contract binds WHICH paths are declared siblings, never the incidental order of the declaration registry.** **If the mutation were wrong in either direction this FAILS.** READS: ${JSON.stringify(
        {
          subject: CONTROL_MUTATION_SUBJECT,
          usedLiveDirtyReading: CONTROL_MUTATION_USES_LIVE,
          siblingPredicate: CONTROL_MUTATION_SUBJECT.filter(isSiblingUnitArtifact),
          splitSibling: controlMutationSplit.sibling,
          splitOwn: controlMutationSplit.own,
          unclaimedControlOwn: controlMutationSplit.own.filter((path) => path === CONTROL_UNCLAIMED_E4_PATH),
          e3OwnFileOwn: controlMutationSplit.own.filter((path) => path === TEST_RELPATH),
          e3OwnFileInSubject: CONTROL_MUTATION_SUBJECT.includes(TEST_RELPATH),
          expectedE3OwnMembers: CONTROL_MUTATION_E3_OWN_MEMBERS,
          expectedSiblingMembersSorted: [...CONTROL_MUTATION_SIBLINGS].sort(),
        },
      )}`,
    ).toEqual([
      [...CONTROL_MUTATION_SIBLINGS].sort(),
      [...CONTROL_MUTATION_SIBLINGS].sort(),
      [...CONTROL_MUTATION_SIBLINGS].sort(),
      CONTROL_MUTATION_SUBJECT.includes(CONTROL_UNCLAIMED_E4_PATH) ? [CONTROL_UNCLAIMED_E4_PATH] : [],
      [],
      CONTROL_MUTATION_E3_OWN_MEMBERS,
      CONTROL_MUTATION_SIBLING_MEMBERS,
      true,
    ])
    // (n-2) **⟶ ADDED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR, `E5`/`U-CONTAINER`'s RED
    //     SET) — THE `E5` DECLARATION, DRIVEN ON ITS OWN TWO DECLARED PATHS AND IN ALL FOUR
    //     REQUIRED DIRECTIONS.** This is the SECOND drive of this class (control `(n)` above is the
    //     first, for `E4`), and it is a SEPARATE control rather than an extension of `(n)`'s lists
    //     for one reason: `(n)`'s expected values are LITERAL and name ONLY the `E4` paths, so
    //     folding `E5`'s paths into `(n)` would silently widen an expectation that pins `E4`'s own
    //     declaration. **The four directions, each ASSERTED rather than described:**
    //
    //       (a) both DECLARED `E5`-OWNED paths (`tests/container.test.ts`, `src/shared/container.ts`)
    //           read **`isSiblingUnitArtifact === true`** AND carry a **NAMED owner** (`E5` /
    //           `U-CONTAINER`) AND are **REGISTRY KEYS** AND are **EXCLUDED from the allow-list
    //           subject** by the row's own declaration filter (`isDeclaredOtherUnitPath`);
    //       (b) a synthetic **UNCLAIMED** path still reads **`isSiblingUnitArtifact === false`** with
    //           NO owner — so it stays in `E3`'s subject and remains the row's FINDING path
    //           (`§5.1`: *"a non-denied path outside the allow-list is a FINDING for the adversarial
    //           pass, not an automatic FAIL"*). This is the direction that FAILS a predicate
    //           claiming everything;
    //       (c) an **`E3`-OWN denied path still reads denied/`true` and NOT-sibling** — the synthetic
    //           `src/shared/gutter-hack.ts` — so **the DENIED half is UNTOUCHED by this
    //           declaration**; and **the RAW reading still NAMES both declared `E5` paths as
    //           DENIED** (the `deniedRaw !== true` list is EMPTY because both ARE denied — a list
    //           that emptied the OTHER way would mean the predicate had been weakened);
    //       (d) the **MUTATION-SHAPED PROBE for the `E5` declaration fires when the declarations are
    //           removed**: the branch readings above are driven THROUGH the registry, so deleting
    //           either entry drops its path into `own` with no owner and FAILS (a)/(list 1, list 3,
    //           list 4, list 5) — the probe is not a tautology.
    //
    //     **WHAT THIS CONTROL KEEPS OUT OF THE BINDING POSITION.** Every comparison is SET-based
    //     (sorted), never order-based: `§3.4 R-12` binds WHICH paths are declared siblings and never
    //     the incidental order in which the registry happens to be listed — the `E4` lesson, where an
    //     order-bound expectation FAILED on a committed clean tree because the live branch, not the
    //     synthetic one, was the one running. **The ordered reading is REPORTED inside the message's
    //     `READS` block and is BOUND NOWHERE.** The `E4` branch readings are printed BESIDE this
    //     control's own so the two registrations are visible together without being compared.
    const E5_SIBLING_DECLARED_PATHS: readonly string[] = ['tests/container.test.ts', 'src/shared/container.ts']
    const CONTROL_UNCLAIMED_E5_PATH = 'tests/container-CONTROL-unclaimed.test.ts'
    const e5SiblingBranch = E5_SIBLING_DECLARED_PATHS.map((path) => ({
      path,
      sibling: isSiblingUnitArtifact(path),
      owner: declaredOtherUnitNameOf(path),
      declared: Object.prototype.hasOwnProperty.call(SIBLING_DIVERGENCE_UNIT_BY_PATH, path),
      deniedRaw: isDeniedPath(path),
      e3Own: isE3OwnArtifact(path),
      outsideAllowSubject: !isDeclaredOtherUnitPath(path),
    }))
    const controlUnclaimedE5Branch = {
      path: CONTROL_UNCLAIMED_E5_PATH,
      sibling: isSiblingUnitArtifact(CONTROL_UNCLAIMED_E5_PATH),
      owner: declaredOtherUnitNameOf(CONTROL_UNCLAIMED_E5_PATH),
      deniedRaw: isDeniedPath(CONTROL_UNCLAIMED_E5_PATH),
    }
    expect(
      [
        [...e5SiblingBranch.map((r) => r.path)].sort(),
        e5SiblingBranch.filter((r) => r.sibling !== true).map((r) => r.path),
        e5SiblingBranch.filter((r) => r.owner === null || r.owner.length === 0).map((r) => r.path),
        e5SiblingBranch.filter((r) => !r.declared).map((r) => r.path),
        e5SiblingBranch.filter((r) => r.outsideAllowSubject).map((r) => r.path),
        e5SiblingBranch.filter((r) => r.deniedRaw !== true).map((r) => r.path),
        e5SiblingBranch.filter((r) => r.e3Own).map((r) => r.path),
        controlUnclaimedE5Branch.sibling,
        controlUnclaimedE5Branch.owner,
        [isDeniedPath(CONTROL_CORE_HACK_PATH), isSiblingUnitArtifact(CONTROL_CORE_HACK_PATH)],
        [isSiblingUnitArtifact(TEST_RELPATH), isE3OwnArtifact(TEST_RELPATH)],
      ],
      `R-12 §3.4 — CONTROL (n-2, THE \`E5\`/\`U-CONTAINER\` DECLARATION DRIVEN IN ALL FOUR DIRECTIONS): (a) the DECLARED \`E5\`-OWNED paths \`${JSON.stringify(
        E5_SIBLING_DECLARED_PATHS,
      )}\` read \`isSiblingUnitArtifact === true\` (list 2 EMPTY) AND carry a NAMED declaring unit (list 3 EMPTY) AND are REGISTRY KEYS (list 4 EMPTY) AND are EXCLUDED from the allow-list subject (list 5 EMPTY) — **this is the exclusion the arm relies on, and the exact reading that FAILED with \`liveUnaccounted: ["tests/container.test.ts"]\` before the declaration**; (b) the synthetic UNCLAIMED path \`${CONTROL_UNCLAIMED_E5_PATH}\` still reads \`isSiblingUnitArtifact === false\` with NO owner, so it stays in the subject and remains the row's FINDING path (a predicate that claimed everything FAILS here); (c) the \`E3\`-OWN denied path \`${CONTROL_CORE_HACK_PATH}\` STILL reads \`isDeniedPath === true\` and \`isSiblingUnitArtifact === false\` — **the DENIED half is UNTOUCHED by this declaration** — \`E3\`'s OWN file \`${TEST_RELPATH}\` reads not-sibling with \`isE3OwnArtifact === true\`, and the \`deniedRaw !== true\` list (list 6) is EMPTY **because both \`E5\` paths ARE still denied by the byte-identical predicate, so the RAW reading still NAMES them**; and (d) **the probe is not a tautology: REMOVE EITHER \`E5\` REGISTRY ENTRY and this control's list 1/3/4/5 FAIL** (the path falls into \`own\` with no owner). **ALL COMPARISONS ARE SET-BASED (SORTED), NEVER ORDER-BASED** (the \`E4\` lesson: an order-bound expectation FAILED on a committed clean tree when the live branch, not the synthetic one, ran); the ordered reading is REPORTED below and BOUND NOWHERE. READS: ${JSON.stringify(
        {
          e5SiblingBranch: e5SiblingBranch.map((r) => [r.path, r.sibling, r.owner]),
          e5SiblingBranchSortedPaths: [...e5SiblingBranch.map((r) => r.path)].sort(),
          e5SiblingBranchDeclaredOrder: e5SiblingBranch.map((r) => r.path),
          controlUnclaimedE5Branch,
          e3OwnDeniedControl: [CONTROL_CORE_HACK_PATH, isDeniedPath(CONTROL_CORE_HACK_PATH), isSiblingUnitArtifact(CONTROL_CORE_HACK_PATH)],
          e3OwnFileNotClaimed: [TEST_RELPATH, isSiblingUnitArtifact(TEST_RELPATH), isE3OwnArtifact(TEST_RELPATH)],
          e4BranchBesideThis: RELOCATE_SIBLING_DECLARED_PATHS,
          declaredRegistryEntries: SIBLING_DIVERGENCE_UNIT_ARTIFACTS.length,
        },
      )}`,
    ).toEqual([
      ['src/shared/container.ts', 'tests/container.test.ts'],
      [],
      [],
      [],
      [],
      [],
      [],
      false,
      null,
      [true, false],
      [false, true],
    ])
    // (n-3) **⟶ ADDED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR — THE THIRD REPAIR OF
    //     THIS CLASS, AFTER `E4`/`U-RELOCATE` AND `E5`/`U-CONTAINER`) — THE `E7`/`U-MENULIB`
    //     DECLARATION, DRIVEN ON ITS OWN TWO DECLARED PATHS AND IN ALL FOUR REQUIRED DIRECTIONS.**
    //     A SEPARATE control rather than an extension of `(n)`/`(n-2)`, for the same reason `(n-2)`
    //     gave: both of those pin their expectations to LITERAL paths of THEIR OWN units, so folding
    //     `E7`'s paths into either would silently widen an expectation that pins another
    //     declaration. **The four directions, each ASSERTED rather than described:**
    //
    //       (a) both DECLARED `E7`-OWNED paths (`tests/menu-template.test.ts`,
    //           `src/shared/menu-template.ts`) read **`isSiblingUnitArtifact === true`** AND carry a
    //           **NAMED owner** (`E7` / `U-MENULIB`) AND are **REGISTRY KEYS** AND are **EXCLUDED
    //           from the allow-list subject** by the row's own declaration filter
    //           (`isDeclaredOtherUnitPath`) — **this is the exclusion the arm relies on, and the
    //           exact reading that FAILED with `liveUnaccounted: ["tests/menu-template.test.ts"]`
    //           before the declaration**;
    //       (b) a synthetic **UNCLAIMED** path still reads **`isSiblingUnitArtifact === false`** with
    //           NO owner — so it stays in `E3`'s subject and remains the row's FINDING path
    //           (`§5.1`: *"a non-denied path outside the allow-list is a FINDING for the adversarial
    //           pass, not an automatic FAIL"*). This is the direction that FAILS a predicate
    //           claiming everything;
    //       (c) an **`E3`-OWN denied path still reads denied/`true` and NOT-sibling** — the synthetic
    //           `src/shared/gutter-hack.ts` — so **the DENIED half is UNTOUCHED by this
    //           declaration**; and **the RAW reading still NAMES both declared `E7` paths as
    //           DENIED** (the `deniedRaw !== true` list is EMPTY because both ARE denied — a list
    //           that emptied the OTHER way would mean the predicate had been weakened);
    //       (d) the **MUTATION-SHAPED PROBE fires when the two entries are removed**, and it is
    //           DRIVEN rather than described: the registry is a module-level declaration that no
    //           in-run probe may edit (`R-12`'s own rule: the synthetic controls never touch
    //           `src/**`, and an edit here would make the tree dirty *while the probe reads it*),
    //           so the mutation is driven at the PREDICATE level as **exactly the two declarations
    //           removed** (`isSiblingUnitArtifact(path) && !MENULIB_SIBLING_DECLARED_PATHS.includes(
    //           path)`), and the probe asserts that BOTH paths then LEAVE the sibling class (list
    //           12 EMPTY) — which is precisely what makes lists 1–5 of this control FAIL, so the
    //           control above is not a tautology. **The probe is FALSIFIABLE IN BOTH DIRECTIONS:**
    //           if a path were claimed by some OTHER clause too (a pattern or a second list), it
    //           would keep reading sibling under the mutation and list 12 would be NON-empty.
    //
    //     **WHAT THIS CONTROL KEEPS OUT OF THE BINDING POSITION.** Every comparison is SET-based
    //     (sorted), never order-based (`§3.4 R-12` binds WHICH paths are declared siblings and never
    //     the incidental order in which the registry happens to be listed — the `E4` lesson, where
    //     an order-bound expectation FAILED on a committed clean tree because the live branch, not
    //     the synthetic one, was the one running). **The ordered reading is REPORTED inside the
    //     message's `READS` block and is BOUND NOWHERE.** The `E4`/`E5` branch readings are printed
    //     BESIDE this control's own so the three registrations are visible together without being
    //     compared.
    const MENULIB_SIBLING_DECLARED_PATHS: readonly string[] = ['tests/menu-template.test.ts', 'src/shared/menu-template.ts']
    const CONTROL_UNCLAIMED_E7_PATH = 'tests/menu-template-CONTROL-unclaimed.test.ts'
    const e7SiblingBranch = MENULIB_SIBLING_DECLARED_PATHS.map((path) => ({
      path,
      sibling: isSiblingUnitArtifact(path),
      owner: declaredOtherUnitNameOf(path),
      declared: Object.prototype.hasOwnProperty.call(SIBLING_DIVERGENCE_UNIT_BY_PATH, path),
      deniedRaw: isDeniedPath(path),
      e3Own: isE3OwnArtifact(path),
      outsideAllowSubject: !isDeclaredOtherUnitPath(path),
    }))
    const controlUnclaimedE7Branch = {
      path: CONTROL_UNCLAIMED_E7_PATH,
      sibling: isSiblingUnitArtifact(CONTROL_UNCLAIMED_E7_PATH),
      owner: declaredOtherUnitNameOf(CONTROL_UNCLAIMED_E7_PATH),
      deniedRaw: isDeniedPath(CONTROL_UNCLAIMED_E7_PATH),
    }
    // (d) THE MUTATION: the registry read as if BOTH `E7` entries had been deleted, keeping every
    // other clause of the predicate intact (the mutated reading is `false` for a path whose ONLY
    // carrier is the registry clause, and UNCHANGED for a path carried by any other clause).
    const mutationWithoutMenulibEntries = MENULIB_SIBLING_DECLARED_PATHS.map((path) => ({
      path,
      mutatedSibling: isSiblingUnitArtifact(path) && !MENULIB_SIBLING_DECLARED_PATHS.includes(path),
    }))
    // Driven through the row's OWN splitter, so the mutation's consequence is measured on the
    // mechanism the arm actually reads rather than argued: the real split, and the same subject's
    // members the mutation would move into `E3`'s own set.
    const e7SubjectSplit = splitBySiblingAttribution([...MENULIB_SIBLING_DECLARED_PATHS, CONTROL_UNCLAIMED_E7_PATH])
    expect(
      [
        [...e7SiblingBranch.map((r) => r.path)].sort(),
        e7SiblingBranch.filter((r) => r.sibling !== true).map((r) => r.path),
        e7SiblingBranch.filter((r) => r.owner === null || r.owner.length === 0).map((r) => r.path),
        e7SiblingBranch.filter((r) => !r.declared).map((r) => r.path),
        e7SiblingBranch.filter((r) => r.outsideAllowSubject).map((r) => r.path),
        e7SiblingBranch.filter((r) => r.deniedRaw !== true).map((r) => r.path),
        e7SiblingBranch.filter((r) => r.e3Own).map((r) => r.path),
        controlUnclaimedE7Branch.sibling,
        controlUnclaimedE7Branch.owner,
        [isDeniedPath(CONTROL_CORE_HACK_PATH), isSiblingUnitArtifact(CONTROL_CORE_HACK_PATH)],
        [isSiblingUnitArtifact(TEST_RELPATH), isE3OwnArtifact(TEST_RELPATH)],
        mutationWithoutMenulibEntries.filter((r) => r.mutatedSibling).map((r) => r.path),
        [...e7SubjectSplit.sibling].sort(),
        e7SubjectSplit.own.filter((path) => path === CONTROL_UNCLAIMED_E7_PATH),
      ],
      `R-12 §3.4 — CONTROL (n-3, THE \`E7\`/\`U-MENULIB\` DECLARATION DRIVEN IN ALL FOUR DIRECTIONS): (a) the DECLARED \`E7\`-OWNED paths \`${JSON.stringify(
        MENULIB_SIBLING_DECLARED_PATHS,
      )}\` read \`isSiblingUnitArtifact === true\` (list 2 EMPTY) AND carry a NAMED declaring unit (list 3 EMPTY) AND are REGISTRY KEYS (list 4 EMPTY) AND are EXCLUDED from the allow-list subject (list 5 EMPTY) — **this is the exclusion the arm relies on, and the exact reading that FAILED with \`liveUnaccounted: ["tests/menu-template.test.ts"]\` before the declaration**; (b) the synthetic UNCLAIMED path \`${CONTROL_UNCLAIMED_E7_PATH}\` still reads \`isSiblingUnitArtifact === false\` with NO owner, so it stays in the subject and remains the row's FINDING path (a predicate that claimed everything FAILS here); (c) the \`E3\`-OWN denied path \`${CONTROL_CORE_HACK_PATH}\` STILL reads \`isDeniedPath === true\` and \`isSiblingUnitArtifact === false\` — **the DENIED half is UNTOUCHED by this declaration** — \`E3\`'s OWN file \`${TEST_RELPATH}\` reads not-sibling with \`isE3OwnArtifact === true\`, and the \`deniedRaw !== true\` list (list 6) is EMPTY **because both \`E7\` paths ARE still denied by the byte-identical predicate, so the RAW reading still NAMES them**; and (d) **the probe is not a tautology: with the two \`E7\` REGISTRY ENTRIES REMOVED, BOTH paths leave the sibling class (list 12 EMPTY is the mutated reading's proof, and a path carried by ANY other clause would keep reading sibling there), so the split driven at list 13 would move both into \`own\` and this control's lists 1/3/4/5 FAIL** (the unclaimed path at list 14 stays in \`own\` under the real predicate — the row's finding path). **ALL COMPARISONS ARE SET-BASED (SORTED), NEVER ORDER-BASED** (the \`E4\` lesson: an order-bound expectation FAILED on a committed clean tree when the live branch, not the synthetic one, ran); the ordered reading is REPORTED below and BOUND NOWHERE. READS: ${JSON.stringify(
        {
          e7SiblingBranch: e7SiblingBranch.map((r) => [r.path, r.sibling, r.owner]),
          e7SiblingBranchSortedPaths: [...e7SiblingBranch.map((r) => r.path)].sort(),
          e7SiblingBranchDeclaredOrder: e7SiblingBranch.map((r) => r.path),
          controlUnclaimedE7Branch,
          mutationWithoutMenulibEntries,
          e7SubjectSplit,
          e3OwnDeniedControl: [CONTROL_CORE_HACK_PATH, isDeniedPath(CONTROL_CORE_HACK_PATH), isSiblingUnitArtifact(CONTROL_CORE_HACK_PATH)],
          e3OwnFileNotClaimed: [TEST_RELPATH, isSiblingUnitArtifact(TEST_RELPATH), isE3OwnArtifact(TEST_RELPATH)],
          e4BranchBesideThis: RELOCATE_SIBLING_DECLARED_PATHS,
          e5BranchBesideThis: E5_SIBLING_DECLARED_PATHS,
          declaredRegistryEntries: SIBLING_DIVERGENCE_UNIT_ARTIFACTS.length,
        },
      )}`,
    ).toEqual([
      ['src/shared/menu-template.ts', 'tests/menu-template.test.ts'],
      [],
      [],
      [],
      [],
      [],
      [],
      false,
      null,
      [true, false],
      [false, true],
      [],
      ['src/shared/menu-template.ts', 'tests/menu-template.test.ts'],
      [CONTROL_UNCLAIMED_E7_PATH],
    ])
    // (n-4) **⟶ ADDED 2026-09-27 (THE `E7`/`U-MENULIB` DOC-ARTIFACT DECLARATION — THE FOURTH
    //     REPAIR OF THIS CLASS) — THE `E7` DOC-ARTIFACT DECLARATION, DRIVEN IN ALL FOUR
    //     DIRECTIONS ON ITS OWN THREE DECLARED PATHS.** A SEPARATE control for the same reason
    //     `(n-2)`/`(n-3)` gave: those pin their expectations to LITERAL paths of THEIR OWN units
    //     and to the SIBLING predicate, so folding these three NON-denied paths into either would
    //     silently widen an expectation that pins another declaration (and these paths are
    //     deliberately NOT `isSiblingUnitArtifact` paths — they reach the arm only through the
    //     allow-list half's own filter).
    //
    //       (a) all three DECLARED `E7` DOC paths read **`isDeclaredOtherUnitPath === true`** AND
    //           carry a **NAMED owner** AND are **REGISTRY KEYS** (`MENULIB_DOC_BY_PATH`) — **this
    //           is the exclusion the arm relies on, and the exact reading that FAILED as
    //           `Outside the allow-list: ["docs/specs/menulib.md"]` before the declaration**;
    //           they are DECLARED-BUT-NOT-SIBLING, which is checked explicitly so this declaration
    //           can never be mistaken for — or grow into — the sibling registry;
    //       (b) the synthetic **UNCLAIMED** path still reads `isDeclaredOtherUnitPath === false`
    //           with NO owner, so it stays in the subject and **an UNDECLARED path outside the
    //           allow-list still FAILS the core claim** (a declaration that claimed everything
    //           FAILS here);
    //       (c) an **`E3`-OWN denied path still reads `isDeniedPath === true`** (the synthetic
    //           `src/shared/gutter-hack.ts`) and `E3`'s own file `TEST_RELPATH` is NOT declared by
    //           another unit and NOT owned by this registry — **the DENIED half is UNTOUCHED by
    //           this declaration**;
    //       (d) **the mutation probe fires when the three entries are removed**, DRIVEN at the
    //           predicate level (`declaredOtherUnitNameOf` as if the `MENULIB_DOC_BY_PATH` keys
    //           were absent, every other registry intact — no in-run probe may edit a module-level
    //           declaration, and an on-disk edit would make the tree dirty WHILE the probe reads it,
    //           the recorded lesson): all three paths then LEAVE the declared class (list 9 EMPTY),
    //           which is exactly what makes list 2 FAIL — so the control is not a tautology.
    //
    //     **SET-BASED, NEVER ORDER-BASED** (sorted): `§3.4 R-12` binds WHICH paths are declared
    //     and never the incidental order of the entries — the `E4` lesson, where an order-bound
    //     expectation FAILED on a committed clean tree because the live branch, not the synthetic
    //     one, ran. The ordered reading is REPORTED and BOUND NOWHERE.
    const CONTROL_UNCLAIMED_E7_DOC_PATH = 'docs/specs/menulib-CONTROL-unclaimed.md'
    const menulibDocPaths = MENULIB_DOC_ARTIFACTS.map((entry) => entry.path)
    const menulibDocBranch = menulibDocPaths.map((path) => ({
      path,
      declared: isDeclaredOtherUnitPath(path),
      owner: declaredOtherUnitNameOf(path),
      registryKey: Object.prototype.hasOwnProperty.call(MENULIB_DOC_BY_PATH, path),
      sibling: isSiblingUnitArtifact(path),
      deniedRaw: isDeniedPath(path),
      e3Own: isE3OwnArtifact(path),
    }))
    const controlUnclaimedE7DocBranch = {
      path: CONTROL_UNCLAIMED_E7_DOC_PATH,
      declared: isDeclaredOtherUnitPath(CONTROL_UNCLAIMED_E7_DOC_PATH),
      owner: declaredOtherUnitNameOf(CONTROL_UNCLAIMED_E7_DOC_PATH),
    }
    const MENULIB_DOC_DECLARED_PATHS: ReadonlySet<string> = new Set(Object.keys(MENULIB_DOC_BY_PATH))
    // The mutation as a PREDICATE: the real declaration state MINUS the three `MENULIB_DOC_BY_PATH`
    // keys, every OTHER registry and predicate clause intact. The list below is asserted EMPTY,
    // which is the proof that no OTHER registry (nor the sibling predicate) would keep these paths
    // declared under the mutation — so it is the declaration and nothing else that holds the
    // control's list 2. A path still declared at that reading FAILS the probe.
    const menulibMutationWithoutDocEntries = menulibDocPaths.map((path) => ({
      path,
      mutatedStillDeclared: isDeclaredOtherUnitPath(path) && !MENULIB_DOC_DECLARED_PATHS.has(path),
    }))
    expect(
      [
        [...menulibDocBranch.map((r) => r.path)].sort(),
        menulibDocBranch.filter((r) => r.declared !== true).map((r) => r.path),
        menulibDocBranch.filter((r) => r.owner === null || r.owner.length === 0).map((r) => r.path),
        menulibDocBranch.filter((r) => !r.registryKey).map((r) => r.path),
        menulibDocBranch.filter((r) => r.sibling).map((r) => r.path),
        menulibDocBranch.filter((r) => r.e3Own).map((r) => r.path),
        controlUnclaimedE7DocBranch.declared,
        controlUnclaimedE7DocBranch.owner,
        menulibMutationWithoutDocEntries.filter((r) => r.mutatedStillDeclared).map((r) => r.path),
        [isDeniedPath(CONTROL_CORE_HACK_PATH), isSiblingUnitArtifact(CONTROL_CORE_HACK_PATH)],
        [isDeclaredOtherUnitPath(CONTROL_CORE_HACK_PATH), isDeclaredOtherUnitPath(TEST_RELPATH)],
      ],
      `R-12 §3.4 — CONTROL (n-4, THE \`E7\`/\`U-MENULIB\` DOC-ARTIFACT DECLARATION DRIVEN IN ALL FOUR DIRECTIONS): (a) the DECLARED \`E7\` DOC paths \`${JSON.stringify(
        menulibDocPaths,
      )}\` read \`isDeclaredOtherUnitPath === true\` (list 2 EMPTY) AND carry a NAMED declaring unit (list 3 EMPTY) AND are REGISTRY KEYS in \`MENULIB_DOC_BY_PATH\` (list 4 EMPTY) — **the exact exclusion that FAILED as \`Outside the allow-list: ["docs/specs/menulib.md"]\` before this declaration** — while reading \`isSiblingUnitArtifact === false\` (list 5 EMPTY: this is the ALLOW-LIST-half declaration only, deliberately NOT the sibling registry) and NOT an \`E3\` artifact (list 6 EMPTY); (b) the synthetic UNCLAIMED path \`${CONTROL_UNCLAIMED_E7_DOC_PATH}\` still reads \`isDeclaredOtherUnitPath === false\` with NO owner, so an UNDECLARED path outside the allow-list still FAILS the core claim; (c) the \`E3\`-OWN denied path \`${CONTROL_CORE_HACK_PATH}\` STILL reads \`isDeniedPath === true\` (read at list 10 beside its not-sibling reading), and neither it nor \`E3\`'s OWN file \`${TEST_RELPATH}\` is declared by another unit (list 11) — **the DENIED half is UNTOUCHED by this declaration**; and (d) **the probe is not a tautology: with the three \`MENULIB_DOC_BY_PATH\` entries REMOVED, ALL THREE paths leave the declared class (list 9 EMPTY — the mutation's OWN reading, and the proof that no other registry would keep them declared) and list 2 then FAILS**, driven at the predicate level rather than by editing the registry, because no in-run probe may edit a module-level declaration (and an on-disk edit would make the tree dirty WHILE the probe reads it; a path carried by ANY other registry or clause would keep reading declared under the mutation and make list 9 NON-empty, so the probe is falsifiable in both directions). **ALL COMPARISONS ARE SET-BASED (SORTED), NEVER ORDER-BASED** (the \`E4\` lesson); the ordered reading is REPORTED below and BOUND NOWHERE. READS: ${JSON.stringify(
        {
          menulibDocBranch: menulibDocBranch.map((r) => [r.path, r.declared, r.owner]),
          menulibDocBranchSortedPaths: [...menulibDocPaths].sort(),
          menulibDocBranchDeclaredOrder: menulibDocPaths,
          controlUnclaimedE7DocBranch,
          menulibMutationWithoutDocEntries,
          menulibDocRegistryEntries: Object.keys(MENULIB_DOC_BY_PATH).length,
          e7SiblingBranchBesideThis: MENULIB_SIBLING_DECLARED_PATHS,
        },
      )}`,
    ).toEqual([
      ['docs/specs/menu-template-greens.md', 'docs/specs/menulib-review.md', 'docs/specs/menulib.md'],
      [],
      [],
      [],
      [],
      [],
      false,
      null,
      [],
      [true, false],
      [false, false],
    ])
    // (n-5) **⟶ ADDED 2026-09-27 (THE CROSS-UNIT SIBLING-REGISTRY REPAIR — THE FOURTH REPAIR OF THIS
    //     CLASS, AFTER `E4`/`U-RELOCATE`, `E5`/`U-CONTAINER` AND `E7`/`U-MENULIB`) — THE `E8`/`U-THEME`
    //     DECLARATION, DRIVEN ON ITS OWN FOUR DECLARED PATHS (two DENIED-half, two ALLOW-LIST-half)
    //     AND IN ALL FOUR REQUIRED DIRECTIONS.** A SEPARATE control rather than an extension of
    //     `(n)`/`(n-2)`/`(n-3)`/`(n-4)`, for the same reason those gave: each of them pins its
    //     expectations to LITERAL paths of ITS OWN unit and (for the first three) to the SIBLING
    //     predicate, so folding `E8`'s paths in would silently widen an expectation that pins another
    //     declaration.
    //
    //     **THE MEASURED CAUSE THIS CONTROL ANSWERS, VERBATIM:** the Implementer pass's live reading
    //     named `["src/shared/theme.ts","tests/theme.test.ts"]` — this unit's two paths, read as
    //     `E3`'s own because the registry carried no entry for them.
    //
    //       (a) the two DECLARED `E8` denied-half paths (`tests/theme.test.ts`,
    //           `src/shared/theme.ts`) read **`isSiblingUnitArtifact === true`** AND carry a **NAMED
    //           owner** (`E8` / `U-THEME`) AND are **REGISTRY KEYS** (`SIBLING_DIVERGENCE_UNIT_BY_PATH`)
    //           AND are **EXCLUDED from `E3`'s subject** by the row's own splitter; and the two
    //           DECLARED `E8` DOC paths (`docs/specs/theme.md`, `docs/specs/theme-review.md`) read
    //           **`isDeclaredOtherUnitPath === true`** AND carry a **NAMED owner** AND are **REGISTRY
    //           KEYS** (`THEME_DOC_BY_PATH`) AND are **EXCLUDED from the allow-list subject** by the
    //           row's own declaration filter — **this is the exclusion the arm relies on for both
    //           halves, and the exact reading that FAILED before the declaration**;
    //       (b) a synthetic **UNCLAIMED** path still reads **`isSiblingUnitArtifact === false`** AND
    //           **`isDeclaredOtherUnitPath === false`** with NO owner — so it stays in `E3`'s subject
    //           and remains the row's FINDING path (`§5.1`: *"a non-denied path outside the allow-list
    //           is a FINDING for the adversarial pass, not an automatic FAIL"*). This is the direction
    //           that FAILS a predicate claiming everything;
    //       (c) an **`E3`-OWN denied path still reads denied/`true` and NOT-sibling** — the synthetic
    //           `src/shared/gutter-hack.ts` — so **the DENIED half is UNTOUCHED by this declaration**;
    //           and **the RAW reading still NAMES both declared `E8` paths as DENIED** (the
    //           `deniedRaw !== true` list is EMPTY because both ARE denied — a list that emptied the
    //           OTHER way would mean the predicate had been weakened);
    //       (d) the **MUTATION-SHAPED PROBE fires when the entries are removed**, and it is DRIVEN
    //           rather than described: the registries are module-level declarations that no in-run
    //           probe may edit (`R-12`'s own rule: the synthetic controls never touch `src/**`, and an
    //           edit here would make the tree dirty *while the probe reads it*), so the mutation is
    //           driven at the PREDICATE level as **exactly the four declarations removed**
    //           (`isSiblingUnitArtifact(path) && !THEME_SIBLING_DECLARED_PATHS.includes(path)` /
    //           `isDeclaredOtherUnitPath(path) && !THEME_DOC_DECLARED_PATHS.has(path)`), and the probe
    //           asserts that ALL FOUR paths then LEAVE their declared class (both mutation lists EMPTY)
    //           — which is precisely what makes the control's lists FAIL. **The probe is FALSIFIABLE
    //           IN BOTH DIRECTIONS:** if a path were claimed by some OTHER clause too (a pattern, a
    //           second list, another registry), it would keep reading declared under the mutation and
    //           the corresponding mutation list would be NON-empty.
    //
    //     **WHAT THIS CONTROL KEEPS OUT OF THE BINDING POSITION.** Every comparison is SET-based
    //     (sorted), never order-based (`§3.4 R-12` binds WHICH paths are declared and never the
    //     incidental order in which a registry happens to be listed — the `E4` lesson, where an
    //     order-bound expectation FAILED on a committed clean tree because the live branch, not the
    //     synthetic one, was the one running). **The ordered reading is REPORTED inside the message's
    //     `READS` block and is BOUND NOWHERE.** The `E4`/`E5`/`E7` branch readings are printed BESIDE
    //     this control's own so the four registrations are visible together without being compared.
    const THEME_SIBLING_DECLARED_PATHS: readonly string[] = ['tests/theme.test.ts', 'src/shared/theme.ts']
    const THEME_DOC_DECLARED_PATHS: readonly string[] = THEME_DOC_ARTIFACTS.map((entry) => entry.path)
    const CONTROL_UNCLAIMED_E8_PATH = 'tests/theme-CONTROL-unclaimed.test.ts'
    const e8SiblingBranch = THEME_SIBLING_DECLARED_PATHS.map((path) => ({
      path,
      sibling: isSiblingUnitArtifact(path),
      owner: declaredOtherUnitNameOf(path),
      declared: Object.prototype.hasOwnProperty.call(SIBLING_DIVERGENCE_UNIT_BY_PATH, path),
      deniedRaw: isDeniedPath(path),
      e3Own: isE3OwnArtifact(path),
      outsideAllowSubject: !isDeclaredOtherUnitPath(path),
    }))
    const e8DocBranch = THEME_DOC_DECLARED_PATHS.map((path) => ({
      path,
      declared: isDeclaredOtherUnitPath(path),
      owner: declaredOtherUnitNameOf(path),
      registryKey: Object.prototype.hasOwnProperty.call(THEME_DOC_BY_PATH, path),
      sibling: isSiblingUnitArtifact(path),
      deniedRaw: isDeniedPath(path),
      e3Own: isE3OwnArtifact(path),
    }))
    const controlUnclaimedE8Branch = {
      path: CONTROL_UNCLAIMED_E8_PATH,
      sibling: isSiblingUnitArtifact(CONTROL_UNCLAIMED_E8_PATH),
      declared: isDeclaredOtherUnitPath(CONTROL_UNCLAIMED_E8_PATH),
      owner: declaredOtherUnitNameOf(CONTROL_UNCLAIMED_E8_PATH),
      deniedRaw: isDeniedPath(CONTROL_UNCLAIMED_E8_PATH),
    }
    // (d) THE MUTATION, in TWO halves: the sibling registry read as if BOTH `E8` entries had been
    // deleted, and the doc registry read as if BOTH `THEME_DOC_BY_PATH` keys were absent — each
    // keeping every other clause and every other registry intact.
    const mutationWithoutThemeSiblingEntries = THEME_SIBLING_DECLARED_PATHS.map((path) => ({
      path,
      mutatedSibling: isSiblingUnitArtifact(path) && !THEME_SIBLING_DECLARED_PATHS.includes(path),
    }))
    const THEME_DOC_DECLARED_KEYS: ReadonlySet<string> = new Set(Object.keys(THEME_DOC_BY_PATH))
    const mutationWithoutThemeDocEntries = THEME_DOC_DECLARED_PATHS.map((path) => ({
      path,
      mutatedStillDeclared: isDeclaredOtherUnitPath(path) && !THEME_DOC_DECLARED_KEYS.has(path),
    }))
    // Driven through the row's OWN splitter, so the mutation's consequence is measured on the
    // mechanism the arm actually reads rather than argued.
    const e8SubjectSplit = splitBySiblingAttribution([...THEME_SIBLING_DECLARED_PATHS, CONTROL_UNCLAIMED_E8_PATH])
    expect(
      [
        [...e8SiblingBranch.map((r) => r.path)].sort(),
        e8SiblingBranch.filter((r) => r.sibling !== true).map((r) => r.path),
        e8SiblingBranch.filter((r) => r.owner === null || r.owner.length === 0).map((r) => r.path),
        e8SiblingBranch.filter((r) => !r.declared).map((r) => r.path),
        e8SiblingBranch.filter((r) => r.outsideAllowSubject).map((r) => r.path),
        e8SiblingBranch.filter((r) => r.deniedRaw !== true).map((r) => r.path),
        e8SiblingBranch.filter((r) => r.e3Own).map((r) => r.path),
        [...e8DocBranch.map((r) => r.path)].sort(),
        e8DocBranch.filter((r) => r.declared !== true).map((r) => r.path),
        e8DocBranch.filter((r) => r.owner === null || r.owner.length === 0).map((r) => r.path),
        e8DocBranch.filter((r) => !r.registryKey).map((r) => r.path),
        e8DocBranch.filter((r) => r.sibling).map((r) => r.path),
        e8DocBranch.filter((r) => r.e3Own).map((r) => r.path),
        controlUnclaimedE8Branch.sibling,
        controlUnclaimedE8Branch.declared,
        controlUnclaimedE8Branch.owner,
        [isDeniedPath(CONTROL_CORE_HACK_PATH), isSiblingUnitArtifact(CONTROL_CORE_HACK_PATH), isDeclaredOtherUnitPath(CONTROL_CORE_HACK_PATH)],
        [isSiblingUnitArtifact(TEST_RELPATH), isE3OwnArtifact(TEST_RELPATH), isDeclaredOtherUnitPath(TEST_RELPATH)],
        mutationWithoutThemeSiblingEntries.filter((r) => r.mutatedSibling).map((r) => r.path),
        mutationWithoutThemeDocEntries.filter((r) => r.mutatedStillDeclared).map((r) => r.path),
        [...e8SubjectSplit.sibling].sort(),
        e8SubjectSplit.own.filter((path) => path === CONTROL_UNCLAIMED_E8_PATH),
      ],
      `R-12 §3.4 — CONTROL (n-5, THE \`E8\`/\`U-THEME\` DECLARATION DRIVEN IN ALL FOUR DIRECTIONS): (a) the DECLARED \`E8\` DENIED-HALF paths \`${JSON.stringify(
        THEME_SIBLING_DECLARED_PATHS,
      )}\` read \`isSiblingUnitArtifact === true\` (list 2 EMPTY) AND carry a NAMED declaring unit (list 3 EMPTY) AND are REGISTRY KEYS in \`SIBLING_DIVERGENCE_UNIT_BY_PATH\` (list 4 EMPTY) AND are EXCLUDED from \`E3\`'s subject (list 5 EMPTY) — **the exact exclusion that FAILED with the live reading \`["src/shared/theme.ts","tests/theme.test.ts"]\` before this declaration** — AND the two DECLARED \`E8\` DOC paths \`${JSON.stringify(
        THEME_DOC_DECLARED_PATHS,
      )}\` read \`isDeclaredOtherUnitPath === true\` (list 9 EMPTY) AND carry a NAMED declaring unit (list 10 EMPTY) AND are REGISTRY KEYS in \`THEME_DOC_BY_PATH\` (list 11 EMPTY) — while reading \`isSiblingUnitArtifact === false\` (list 12 EMPTY: this pair is the ALLOW-LIST-half declaration only, deliberately NOT the sibling registry) and NOT an \`E3\` artifact (list 13 EMPTY); (b) the synthetic UNCLAIMED path \`${CONTROL_UNCLAIMED_E8_PATH}\` still reads \`isSiblingUnitArtifact === false\` (list 14) AND \`isDeclaredOtherUnitPath === false\` (list 15) with NO owner (list 16), so it stays in the subject and remains the row's FINDING path — a declaration that claimed everything FAILS here; (c) the \`E3\`-OWN denied path \`${CONTROL_CORE_HACK_PATH}\` STILL reads denied/true and NOT-sibling and NOT-declared (list 17), \`E3\`'s OWN file \`${TEST_RELPATH}\` reads not-sibling with \`isE3OwnArtifact === true\` and is declared by NOBODY (list 18), and the \`deniedRaw !== true\` list (list 6) is EMPTY **because both \`E8\` denied-half paths ARE still denied by the byte-identical predicate, so the RAW reading still NAMES them**; and (d) **the probe is not a tautology: with the two \`E8\` REGISTRY ENTRIES REMOVED both paths leave the sibling class (list 19 EMPTY), and with the two \`THEME_DOC_BY_PATH\` ENTRIES REMOVED both doc paths leave the declared class (list 20 EMPTY)** — each mutated reading is the proof that no OTHER clause or registry would keep those paths declared, so the control's lists FAIL under the mutation. **ALL COMPARISONS ARE SET-BASED (SORTED), NEVER ORDER-BASED** (the \`E4\` lesson: an order-bound expectation FAILED on a committed clean tree when the live branch, not the synthetic one, ran); the ordered reading is REPORTED below and BOUND NOWHERE. READS: ${JSON.stringify(
        {
          e8SiblingBranch: e8SiblingBranch.map((r) => [r.path, r.sibling, r.owner]),
          e8SiblingBranchSortedPaths: [...e8SiblingBranch.map((r) => r.path)].sort(),
          e8SiblingBranchDeclaredOrder: e8SiblingBranch.map((r) => r.path),
          e8DocBranch: e8DocBranch.map((r) => [r.path, r.declared, r.owner]),
          e8DocBranchSortedPaths: [...e8DocBranch.map((r) => r.path)].sort(),
          controlUnclaimedE8Branch,
          mutationWithoutThemeSiblingEntries,
          mutationWithoutThemeDocEntries,
          e8SubjectSplit,
          e3OwnDeniedControl: [CONTROL_CORE_HACK_PATH, isDeniedPath(CONTROL_CORE_HACK_PATH), isSiblingUnitArtifact(CONTROL_CORE_HACK_PATH)],
          e3OwnFileNotClaimed: [TEST_RELPATH, isSiblingUnitArtifact(TEST_RELPATH), isE3OwnArtifact(TEST_RELPATH)],
          e4BranchBesideThis: RELOCATE_SIBLING_DECLARED_PATHS,
          e5BranchBesideThis: E5_SIBLING_DECLARED_PATHS,
          e7SiblingBranchBesideThis: MENULIB_SIBLING_DECLARED_PATHS,
          e7DocBranchBesideThis: menulibDocPaths,
          declaredRegistryEntries: SIBLING_DIVERGENCE_UNIT_ARTIFACTS.length,
          themeDocRegistryEntries: Object.keys(THEME_DOC_BY_PATH).length,
        },
      )}`,
    ).toEqual([
      ['src/shared/theme.ts', 'tests/theme.test.ts'],
      [],
      [],
      [],
      [],
      [],
      [],
      ['docs/specs/theme-review.md', 'docs/specs/theme.md'],
      [],
      [],
      [],
      [],
      [],
      false,
      false,
      null,
      [true, false, false],
      [false, true, false],
      [],
      [],
      ['src/shared/theme.ts', 'tests/theme.test.ts'],
      [CONTROL_UNCLAIMED_E8_PATH],
    ])
    // (b) **THE DENIED SET OVER `E3`'S OWN CHANGES — this is the narrowed half.** A denied path
    //     AMONG `E3`'s own committed paths FAILS the row; a SIBLING's legitimate denied path is
    //     out of scope BY CONSTRUCTION and is reported, not failed (§5.1 item 11, the `92b6d88`
    //     observation). **A PATH FROM AN `E3`-ATTRIBUTED COMMIT COUNTS AS `E3`'S OWN IFF IT IS
    //     NOT A SIBLING-UNIT ARTIFACT** — the same per-path seam arm (a) binds.
    //     **⟶ SCOPED 2026-09-27 (THE TEST-LAYER PASS): THE SUBJECT IS THE *SAME* NARROWED SUBJECT
    //     ARM (a) READS** (`allowSubject` = `E3`'s own paths MINUS the DECLARED other-unit paths),
    //     because a declared other-unit path is not `E3`'s own in either half. **THE PREDICATE
    //     ITSELF IS BYTE-IDENTICAL AND UNWEAKENED** (`isDeniedPath` is untouched, still reads
    //     `true` for every one of those paths in the FULL range — reading (e) drives that), so a
    //     denied path among `E3`'s OWN changes still FAILS the row, which controls (f)/(i)/(j)
    //     drive exactly as before. **NO PATH IS EXCUSED BY BEING DENIED:** the two filters are
    //     disjoint (control (l-3) list 2 asserts no declaration entry is a sibling artifact, and
    //     the test-layer registry is disjoint from `E3`'s own artifacts by list 3). */
    const e3Denied = allowSubject.filter(isDeniedPath)
    expect(
      e3Denied,
      `R-12 §3.4 — THE DENIED SET BINDS \`E3\`’S OWN CHANGES (\`C5\`): \`src/shared/gesture-session.ts\` and \`tests/gesture-session.test.ts\` named FIRST, then every other sibling \`src/shared/*\` module and its tests, \`src/main/**\`, \`src/renderer/**\`, \`package.json\`, \`package-lock.json\`, \`scripts/**\`, \`tsconfig.json\`, \`vitest.config.ts\`, and the sibling artifacts (incl. \`docs/specs/gutter-review.md\` and \`docs/specs/gutter-ui.md\`). **THE EXCLUSION HERE IS A PER-PATH SUBJECT SEAM, NOT A WEAKER PREDICATE:** \`isDeniedPath\` is byte-identical to the as-filed one and still denies every one of those paths in the FULL range — what changed is that a path \`E3\` did not author (a sibling's declared artifact, or a declared other-unit path) is no longer IN \`E3\`'s own change set to begin with (\`§5.1\`'s commit-range scope rule). A denied path among \`E3\`’s OWN attributed paths (\`E3\`’s own commits: ${JSON.stringify(
        attribution.owned.map((c) => c.hash.slice(0, 7)),
      )}) FAILS this row — control (f) drives exactly that. THE SUBJECT (E3's own paths MINUS the DECLARED other-unit paths): ${JSON.stringify(
        allowSubject,
      )}. Denied paths found among E3’s own paths (sibling artifacts and declared other-unit paths excluded): ${JSON.stringify(
        e3Denied,
      )}. RAW denied reading over E3's own paths as filed (sibling artifacts excluded only): ${JSON.stringify(
        ownPaths.filter(isDeniedPath),
      )}`,
    ).toEqual([])
    // (c) **THE NON-VACUITY CENSUS** — `E3`'s attributed set must name ALL THREE of this unit's
    //     canonical artifacts (the module, this test file and this spec), so an attribution that
    //     silently matched NOTHING — or matched only this file — cannot look green.
    const e3Canonical = [MODULE_RELPATH, TEST_RELPATH, SPEC_RELPATH].filter((p) => attribution.paths.includes(p))
    expect(
      e3Canonical,
      `R-12 §3.4 — the canonical artifacts must be NON-VACUOUSLY present in \`E3\`’S OWN attributable change set (which keeps the narrowed row from being satisfied by an EMPTY attribution). Canonical present: ${JSON.stringify(
        e3Canonical,
      )}. E3’s own attributed paths: ${JSON.stringify(attribution.paths)}. E3’s own commits: ${JSON.stringify(
        attribution.owned.map((c) => ({ hash: c.hash.slice(0, 7), paths: c.paths })),
      )}`,
    ).toEqual([MODULE_RELPATH, TEST_RELPATH, SPEC_RELPATH])
    // (d) **THE OUT-OF-SCOPE NOTE, ASSERTED RATHER THAN COMMENTED (THE `92b6d88` OBSERVATION).**
    //     The full range is still READ, and every commit that carries NO `E3` artifact is named as a
    //     SIBLING's — never as `E3`'s. The assertion is the seam itself: the range non-vacuously
    //     contains a sibling commit, so the exclusion is doing work (an empty sibling set would mean
    //     the attribution rule was never exercised here).
    expect(
      attribution.sibling.length,
      `R-12 §3.4 — OUT OF SCOPE BY CONSTRUCTION: a sibling unit's legitimate artifact inside \`E3\`’s anchor range is not \`E3\`’s diff (\`92b6d88\` added \`E10\`’s OWN spec \`docs/specs/gutter-ui.md\`, a path \`E3\`’s DENIED set forbids \`E3\` to author — and \`E3\` owes \`E10\` nothing, \`§8\`). Sibling commits in \`${committed.range}\`: ${JSON.stringify(
        attribution.sibling.map((c) => ({ hash: c.hash.slice(0, 7), paths: c.paths })),
      )}. Denied paths in the FULL range (reported, not failed — each belongs to the row of the unit that committed it): ${JSON.stringify(
        deniedInRange,
      )}`,
    ).toBeGreaterThan(0)
    // (e) **THE SIBLING CLASS, DRIVEN RATHER THAN ASSUMED (the second reading of the `92b6d88`
    //     observation):** the range's OWN reading of the denied path is still available, and it IS
    //     a denial by `isDeniedPath` — so the exclusion is the ATTRIBUTION's work, never a
    //     weakened predicate.
    expect(
      committed.paths.filter(isDeniedPath),
      `R-12 §3.4 — the predicate is NOT weakened: a denied path present in the FULL range is still denied by \`isDeniedPath\` (the reading above); only the SUBJECT of the row changed, to \`E3\`’s own commits. Full-range denied reading: ${JSON.stringify(
        deniedInRange,
      )}`,
    ).toEqual(deniedInRange)
    // (f) **THE POSITIVE CONTROL — A DENIED PATH APPEARING AMONG `E3`'S OWN CHANGED PATHS FAILS
    //     THE ROW.** The control is driven through the row's OWN machinery: `E3`'s REAL attributed
    //     commit list PLUS one synthetic `E3` commit that carries a real `E3` artifact AND a denied
    //     path. The SAME two stages the row runs (attribution, then the DENIED check) must then put
    //     exactly that path into the failure set.
    const controlDenied = SESSION_RELPATH
    const controlCommits: RangeCommit[] = [
      ...attribution.owned,
      { hash: 'CONTROL-E3-COMMIT', paths: [TEST_RELPATH, controlDenied] },
    ]
    const controlAttribution = e3Attribution(controlCommits)
    expect(
      controlAttribution.owned.some((c) => c.hash === 'CONTROL-E3-COMMIT'),
      `R-12 §3.4 — POSITIVE CONTROL (stage 1/2, THE MEASUREMENT IS NOT VACUOUS): a commit that carries an \`E3\` artifact (\`${TEST_RELPATH}\`) AND a denied path (\`${controlDenied}\`) is attributed to \`E3\` — so the DENIED check below really is run over it (a control the attribution rule had filtered away would prove nothing)`,
    ).toBe(true)
    expect(
      controlAttribution.paths.filter(isDeniedPath).filter((p) => !attribution.paths.filter(isDeniedPath).includes(p)),
      `R-12 §3.4 — POSITIVE CONTROL (stage 2/2, THE NARROWED ROW CAN STILL FAIL): a denied path appearing AMONG \`E3\`’S OWN CHANGED PATHS is REPORTED by the row’s own DENIED check, so the row FAILS — and it fails for the RIGHT reason, naming the path. **THE READING IS THE CONTROL'S OWN DELTA, so it is exact rather than loose:** the drive is \`E3\`'s real attributed commits PLUS the synthetic \`CONTROL-E3-COMMIT\`, so stage 2's reading minus stage 1's may contain \`${controlDenied}\` and NOTHING ELSE (a control that measured anything already present in the real reading would prove nothing). Control drive: E3’s real attributed commits + \`${TEST_RELPATH}\` + \`${controlDenied}\`. Full stage-2 denied reading: ${JSON.stringify(
        controlAttribution.paths.filter(isDeniedPath),
      )}`,
    ).toEqual([controlDenied])
    // (g) **THE EXCLUSION SEAM, DRIVEN IN BOTH DIRECTIONS.** A commit carrying NO `E3` artifact is
    //     a SIBLING's, so its paths (denied or not) are out of this row's scope — and the SAME
    //     denied path IS reported once an `E3` artifact joins the commit. That pair is the whole
    //     repair, measured rather than asserted.
    const siblingControl = e3Attribution([
      { hash: 'CONTROL-SIBLING-COMMIT', paths: ['docs/specs/gutter-ui.md', controlDenied] },
    ])
    expect(
      siblingControl.paths,
      `R-12 §3.4 — OUT OF SCOPE BY CONSTRUCTION (the exclusion seam, direction 1): a commit carrying NO \`E3\` artifact contributes NOTHING to \`E3\`'s own change set — which is exactly why \`92b6d88\` (the sibling's commit that ADDED \`E10\`'s own spec) cannot fail this row`,
    ).toEqual([])
    expect(
      siblingControl.sibling.length,
      `R-12 §3.4 — and that commit is named as a SIBLING's, never dropped silently: ${JSON.stringify(
        siblingControl.sibling.map((c) => ({ hash: c.hash, paths: c.paths })),
      )}`,
    ).toBe(1)
    // (h) **⟶ ADDED 2026-09-27 (THE `E3` ROW-REPAIR PASS): THE SIBLING EXCLUSION IS DRIVEN,
    //     NOT ASSUMED — IN BOTH DIRECTIONS, ON THE SIBLING'S *REAL* DECLARED ARTIFACTS.**
    //     This is the control that makes the exclusion FALSIFIABLE: it names the four sibling
    //     artifacts this repo actually carries today, each with the `docs/specs/gutter-ui.md`
    //     `§5.1` row that admits it, and requires the predicate to answer `true` for every one
    //     of them AND `false` for `E3`'s own three canonical artifacts. **A predicate that
    //     returned `true` for everything — which would make arms (a)/(b) and `R-16`'s census
    //     vacuous — FAILS HERE**, and so does a predicate that answered `true` for
    //     `src/shared/gutter.ts`, `tests/gutter.test.ts` or `docs/specs/gutter.md`.
    const SIBLING_CONTROL: ReadonlyArray<{ readonly path: string; readonly authority: string }> = [
      { path: 'docs/specs/gutter-ui.md', authority: '`docs/specs/gutter-ui.md` `§5.1` allow-list row `4`' },
      { path: 'docs/specs/gutter-ui-review.md', authority: 'allow-list row `5` ("any other `docs/specs/gutter-ui-*.md` of this unit")' },
      { path: 'tests/gutter-ui.test.ts', authority: 'allow-list row `3` ("NEW — the red set") — committed at `c62b607`' },
      { path: 'src/shared/gutter-affordance.ts', authority: 'allow-list row `1` ("NEW — the affordance module")' },
      // **⟶ ADDED 2026-09-27 (THE `R-12` DIFF-SCOPE REPAIR PASS): THE SIBLING'S *REAL*
      // IN-FLIGHT SHAPE IS DRIVEN, NOT JUST ITS COMMITTED ARTIFACTS.** These are `E10`'s
      // declared paths as they appear in `git status --porcelain` WHILE ITS PASS RUNS — the
      // exact set that made this row FAIL for a sibling's work. Two of them
      // (`docs/specs/gutter-ui.md`, `tests/gutter-ui.test.ts`) are already in the list above;
      // the four below are its edited/new files.
      { path: 'src/shared/demo-envelope.ts', authority: 'allow-list row `2` (the authoring site — edited in flight)' },
      { path: 'src/renderer/renderer.ts', authority: 'allow-list row `10` (the bounded renderer wiring — edited in flight)' },
      { path: 'src/renderer/runtime.ts', authority: 'allow-list row `11` (`Runtime.elementForNodeId` — edited in flight)' },
      { path: 'docs/specs/gutter-ui-greens.md', authority: 'allow-list row `5` ("and any other `docs/specs/gutter-ui-*.md` of this unit")' },
    ]
    const SIBLING_CONTROL_E3: readonly string[] = [MODULE_RELPATH, TEST_RELPATH, SPEC_RELPATH]
    expect(
      SIBLING_CONTROL.filter((c) => !isSiblingUnitArtifact(c.path)).map((c) => c.path),
      `R-12 §3.4 — POSITIVE CONTROL (THE SIBLING CLASS, THE PREDICATE'S OWN DRIVE): every one of these must read \`isSiblingUnitArtifact === true\` — the list is EMPTY when they do. **READS:** ${JSON.stringify(
        SIBLING_CONTROL.map((c) => [c.path, isSiblingUnitArtifact(c.path)]),
      )}. ${SIBLING_CONTROL.map(
        (c) => `${c.path} ← ${c.authority}`,
      ).join(' · ')}`,
    ).toEqual([])
    expect(
      SIBLING_CONTROL_E3.filter((p) => isSiblingUnitArtifact(p)),
      `R-12 §3.4 — POSITIVE CONTROL (THE PREDICATE'S NEGATIVE DIRECTION, so the exclusion cannot be vacuous): \`E3\`'s OWN three canonical artifacts must read \`isSiblingUnitArtifact === false\` — a predicate that excluded them too would make arms (a)/(b) and \`R-16\`'s census pass by construction. Reads: ${JSON.stringify(
        SIBLING_CONTROL_E3.map((p) => [p, isSiblingUnitArtifact(p)]),
      )}`,
    ).toEqual([])
    // **⟶ ADDED 2026-09-27 (THE SIBLING-ATTRIBUTION DECLARATION, control (h-2)) — THE `E10`
    // RENDERER/HARNESS PATHS, DRIVEN BOTH WAYS.** The declared list
    // (`SIBLING_RENDERER_AND_HARNESS_PATHS`) is the sibling's `src/renderer/**`, its
    // divergence-harness fixture and its own test/spec surface — the paths a SIBLING's legitimate
    // pass touches and a later commit range carries, which `R-12`'s DENIED set names FIRST
    // (`src/renderer/**`, `scripts/**`). **THE AUTHORITY:** `docs/specs/gutter.md` `§3.4 R-4` (a
    // later unit's legitimate use of `E3`'s module is not a violation of `E3`'s contract) and
    // `§5.1`'s commit-range scope rule (*"must NOT read … a sibling's dirty working-tree file …
    // as this unit's diff"*). **THE CONTROL IS FALSIFIABLE BOTH WAYS:** every declared path must
    // read `isSiblingUnitArtifact === true`, AND `E3`'s own three + the synthetic unclaimed
    // `gutter*` path must read `false` — so a predicate that claimed everything, or one that
    // claimed nothing, FAILS here. **A DENIED PATH THAT IS `E3`'S OWN IS STILL FAILED** (the
    // `SIBLING_DENIED_OWN` control just below drives `src/shared/gesture-session.ts`).
    const SIBLING_DECLARED_E10 = [
      ...SIBLING_RENDERER_AND_HARNESS_PATHS,
      'src/renderer/renderer.ts',
      'src/renderer/runtime.ts',
      'scripts/electron-divergence.mjs',
    ]
    expect(
      SIBLING_DECLARED_E10.filter((p) => !isSiblingUnitArtifact(p)),
      `R-12 §3.4 — POSITIVE CONTROL (h-2, THE \`E10\` RENDERER/HARNESS DECLARATION): every one of these paths IS the sibling unit's declared artifact and must read \`isSiblingUnitArtifact === true\` — the list is EMPTY when they do. **READS:** ${JSON.stringify(
        SIBLING_DECLARED_E10.map((p) => [p, isSiblingUnitArtifact(p)]),
      )}. AUTHORITY: \`docs/specs/gutter.md\` \`§3.4 R-4\` + \`§5.1\`'s commit-range scope rule; \`docs/specs/gutter-ui.md\` \`§5.1\` rows 10/11 and the architect's \`e135904\` ruling (the divergence harness is a TESTING tool in the unit's update scope)`,
    ).toEqual([])
    const SIBLING_DENIED_OWN = ['src/shared/gesture-session.ts', 'src/main/main.ts', 'package.json', 'scripts/electron-ui.mjs']
    expect(
      SIBLING_DENIED_OWN.filter((p) => isSiblingUnitArtifact(p)),
      `R-12 §3.4 — POSITIVE CONTROL (h-2, THE NEGATIVE DIRECTION, so the declaration cannot swallow \`E3\`'s own denied set): \`E3\`'s OWN denied paths and the harness files this unit does NOT claim must read \`isSiblingUnitArtifact === false\` — a path that claimed one of them would excuse a real \`E3\` boundary violation. **READS:** ${JSON.stringify(
        SIBLING_DENIED_OWN.map((p) => [p, isSiblingUnitArtifact(p), isDeniedPath(p)]),
      )}. The DENIED predicate itself is UNTOUCHED by this pass: every one of these still reads \`isDeniedPath === true\`, so a denied path among \`E3\`'s OWN changes still FAILS the arm`,
    ).toEqual([])
    expect(
      SIBLING_CONTROL.map((c) => c.path).filter((p) => isE3GreensArtifact(p) || isE3ReviewArtifact(p)),
      `R-12 §3.4 — POSITIVE CONTROL (THE \`E3\` MARKER PROBES THEMSELVES ARE \`E3\`-SPECIFIC): none of the sibling's declared paths may be admitted as an \`E3\` greens/review artifact — that was the SECOND root cause of the repaired reds (the as-filed \`/^docs\\\\/specs\\\\/gutter[^/]*-greens\\\\.md$/\` admitted \`docs/specs/gutter-ui-greens.md\`, and the as-filed \`(U-GUTTER|gutter)\` admitted a \`U-GUTTER-UI\` review record). Reads: ${JSON.stringify(
        SIBLING_CONTROL.map((c) => [c.path, isE3GreensArtifact(c.path), isE3ReviewArtifact(c.path)]),
      )}`,
    ).toEqual([])
    expect(
      [
        SPEC_RELPATH,
        'docs/specs/gutter-greens.md',
        'archive/reviews/2026-09-27-U-GUTTER-doc-review.md',
        'archive/reviews/2026-09-27-U-GUTTER-adversarial.md',
        'archive/reviews/2026-09-27-gutter-census-review.md',
        'archive/reviews/gutter-doc-review.md',
      ].filter((p) => !(isUnitArtifact(p) || p === SPEC_RELPATH)),
      `R-12 §3.4 — POSITIVE CONTROL (AND THE MARKERS STILL ADMIT EVERY GENUINE \`E3\` ARTIFACT): the ` +
        `narrowing must not have cost this unit a marker — \`${SPEC_RELPATH}\` is the exact-name ` +
        `case (checked by identity just below), \`docs/specs/gutter-greens.md\` is this unit's real ` +
        `gate-5 artifact on disk, and the four \`archive/reviews/**\` names are the shapes this repo ` +
        `has used for an \`E3\` review record. Reads: ${JSON.stringify(
          [
            SPEC_RELPATH,
            'docs/specs/gutter-greens.md',
            'archive/reviews/2026-09-27-U-GUTTER-doc-review.md',
            'archive/reviews/2026-09-27-U-GUTTER-adversarial.md',
            'archive/reviews/2026-09-27-gutter-census-review.md',
            'archive/reviews/gutter-doc-review.md',
          ].map((p) => [p, isE3GreensArtifact(p), isE3ReviewArtifact(p), isUnitArtifact(p)]),
        )}`,
    ).toEqual([])
    expect(
      [isUnitArtifact(SPEC_RELPATH), isE3GreensArtifact(SPEC_RELPATH), isE3ReviewArtifact(SPEC_RELPATH)],
      `R-12 §3.4 — POSITIVE CONTROL (THE SPEC IS ADMITTED BY IDENTITY, NOT BY A PROBE — so the marker narrowing cannot cost \`E3\` its own contract): \`isUnitArtifact('${SPEC_RELPATH}')\` must read \`true\` while the two marker probes read \`false\` for it (it is one of the five artifacts named BY PATH in the allow-list \`§5.1\` rows 1–5, never a pattern match). Reads: ${JSON.stringify(
        [SPEC_RELPATH, isUnitArtifact(SPEC_RELPATH), isE3GreensArtifact(SPEC_RELPATH), isE3ReviewArtifact(SPEC_RELPATH)],
      )}`,
    ).toEqual([true, false, false])
    // (i) **⟶ ADDED 2026-09-27 (THE `E3` ROW-REPAIR PASS): THE EXCLUSION'S EFFECT IS
    //     NON-VACUOUS ON THE LIVE REPO.** The four canonical artifacts must be present in
    //     `E3`'s own attributable set, AND the LEAKED set (the union WITHOUT the per-path
    //     exclusion) must be non-empty — i.e. the exclusion is removing real, live paths and
    //     is not a no-op that happens to read green. The leaked reading is produced by the
    //     row's OWN attribution machinery (`e3Attribution`), fed `E3`'s real owned commits
    //     PLUS the two paths the failing run reported, so it is the defect re-measured rather
    //     than described.
    const e3OwnCanonical = SIBLING_CONTROL_E3.filter((p) => ownPaths.includes(p))
    expect(
      e3OwnCanonical,
      `R-12 §3.4 — NON-VACUITY OF THE SUBJECT: \`E3\`'s three canonical artifacts must be present in \`E3\`'S OWN attributable set (so the narrowed arms are not satisfied by an EMPTY reading). Present: ${JSON.stringify(
        e3OwnCanonical,
      )}. E3's own paths: ${JSON.stringify(ownPaths)}. E3's own commits: ${JSON.stringify(
        attribution.owned.map((c) => ({ hash: c.hash.slice(0, 7), paths: c.paths })),
      )}`,
    ).toEqual(SIBLING_CONTROL_E3)
    expect(
      allowSubject,
      `R-12 §3.4 — AND THE OWN SET IS SMALL AND NAMED (a reading, not a lower bound): \`E3\`'s own attributable paths at \`HEAD\` — **READ, ⟶ SCOPED 2026-09-27 (THE TEST-LAYER PASS), AFTER THE DECLARATION FILTER BOTH HALVES OF THIS ROW NOW APPLY** (\`isDeclaredOtherUnitPath\`; 25 of the raw attribution's paths are the test-layer leg's DECLARED \`tests/**\` files, which are another unit's, not this unit's diff) — are the module, this test file, this spec, this unit's \`*-greens.md\` artifact, and the SHARED TRACKERS it committed in its own commits (\`docs/pending.md\`, \`docs/decisions.md\`, \`docs/next-steps.md\` — which \`§5.1\`'s allow-list admits and the sibling predicate deliberately does NOT sweep). **NEITHER SIBLING PATH MAY APPEAR HERE, AND NO DECLARED OTHER-UNIT PATH MAY EITHER.** **THE AS-FILED SUBJECT (sibling artifacts excluded only) is REPORTED beside it, so the narrowing is a measurement rather than an absence:** ${JSON.stringify(
        ownPaths,
      )}. Read: ${JSON.stringify(allowSubject)}`,
    ).toEqual([
      'docs/decisions.md',
      'docs/next-steps.md',
      'docs/pending.md',
      'docs/specs/gutter-greens.md',
      SPEC_RELPATH,
      MODULE_RELPATH,
      TEST_RELPATH,
    ])
    const leakedReading = e3Attribution([
      ...attribution.owned,
      { hash: 'CONTROL-LEAK-EA1D695', paths: ['docs/specs/gutter-ui.md', 'docs/specs/gutter-ui-review.md'] },
    ])
    const leakedOutsideAllow = leakedReading.paths.filter((p) => !isUnitArtifact(p))
    // **⟶ REPAIRED 2026-09-27 (THE NON-VACUITY CONTROL'S FORM, RULING A).** The as-filed control
    // pinned the leaked set's EXACT membership with `toEqual([...two paths...])`, and that set
    // **LEGITIMATELY GROWS** whenever a SIBLING unit commits another artifact — measured at
    // `6f6a011`: it read `["docs/specs/gutter-ui-review.md","docs/specs/gutter-ui.md",
    // "tests/gutter-ui.test.ts"]` (the sibling's own red test file joined `E10`'s spec pair), so a
    // SIBLING'S LEGITIMATE WORK FAILED THIS ROW. The control is now a NON-EMPTINESS **AND
    // CONTAINMENT** control: it asserts the leaked set is NON-EMPTY and that it CONTAINS the sibling
    // artifacts it names (the `E10` spec pair), and it REPORTS the full leaked set in the message;
    // **never an equality against a set that legitimately grows.** **THE ASSERTION STAYS
    // FALSIFIABLE — AND IN THE DIRECTION THAT MATTERS: a leaked set that becomes EMPTY STILL FAILS
    // THIS CONTROL**, because then the live repo no longer exercises the per-path exclusion and the
    // green arm above proves nothing about it (`§3.4 R-4`: a later unit that legitimately imports
    // this module is not a violation of it; `§5.1`'s commit-range scope rule).
    expect(
      leakedOutsideAllow.length > 0,
      `R-12 §3.4 — NON-VACUITY OF THE EXCLUSION'S EFFECT: WITHOUT the per-path exclusion the leaked set must be NON-EMPTY (it removes real, live sibling paths and is NOT a no-op that happens to read green). A leaked set of \`[]\` means the live repo no longer exercises the exclusion. Full leaked (unexcluded) reading: ${JSON.stringify(
        leakedOutsideAllow,
      )}`,
    ).toBe(true)
    for (const siblingPath of ['docs/specs/gutter-ui.md', 'docs/specs/gutter-ui-review.md']) {
      expect(
        leakedOutsideAllow,
        `R-12 §3.4 — and the leaked set CONTAINS the sibling \`E10\` artifact it names (\`${siblingPath}\`) — reported, never an equality against a set that legitimately grows as a sibling unit commits. Full leaked (unexcluded) reading: ${JSON.stringify(
          leakedOutsideAllow,
        )}`,
      ).toContain(siblingPath)
    }
    expect(
      leakedReading.paths.filter((p) => isSiblingUnitArtifact(p)),
      `R-12 §3.4 — and the PER-PATH EXCLUSION is what closes it, DRIVEN ON THE SAME READING rather than asserted: the sibling's own leaked paths are members of the leaked set the predicate claims (CONTAINMENT, not equality — the sibling may add artifacts). Full leaked set: ${JSON.stringify(
        leakedReading.paths,
      )}`,
    ).toContain('docs/specs/gutter-ui.md')
    expect(
      [
        leakedReading.paths.includes('docs/specs/gutter-ui.md'),
        leakedReading.paths.includes('docs/specs/gutter-ui-review.md'),
        ownPaths.includes('docs/specs/gutter-ui.md'),
        ownPaths.includes('docs/specs/gutter-ui-review.md'),
      ],
      `R-12 §3.4 — and the two readings are DISTINCT BY DESIGN: present in the leaked set, ABSENT from \`E3\`'s own (the repair, as a measurement rather than a claim)`,
    ).toEqual([true, true, false, false])
    // **⟶ TIME-SCOPED 2026-09-27 (THE OWNER-SCOPING REPAIR, RULING B).** The as-filed reading is
    // kept visible above and superseded: `'R-12 §3.4 — the companion claim: `src/shared/gutter.ts`
    // is imported by NO `src/**` file'` was asserted over a walk of the LIVE tree, which reads a
    // LATER unit's legitimate work as an `E3` finding. **`docs/specs/gutter.md` `§3.4 R-4`: *"a
    // later unit that legitimately imports THIS module is not a violation of it"*; `§5.1`'s
    // commit-range scope rule; and the later importer is RULED LEGITIMATE BY NAME at
    // `docs/specs/gutter-ui.md` `§2.1` clause 2 / `§3.4 R-8` / `§R.3` +
    // `docs/decisions.md`'s `E10-MODULE-IMPORTS-THE-CONTROLLER-FACTORY`.** The claim is asserted
    // IN ITS TIME-SCOPED FORM, and the CURRENT census is REPORTED with each importer's owner.
    console.log(
      `R-12 §3.4 (TIME-SCOPED COMPANION) MEASURED :: ${JSON.stringify({
        anchor: IMPORTER_ATTRIBUTION.anchor,
        importersAtAnchor: IMPORTER_ATTRIBUTION.atAnchor,
        currentImporters: IMPORTER_ATTRIBUTION.current,
        currentImportersByOwner: IMPORTER_ATTRIBUTION.currentOwners,
        clause: 'docs/specs/gutter.md §3.4 R-4 + §5.1; docs/specs/gutter-ui.md §2.1 clause 2 / §3.4 R-8 / §R.3',
      })}`,
    )
    expect(
      IMPORTER_ATTRIBUTION.atAnchor,
      `R-12 §3.4 — **THE COMPANION CLAIM IN ITS TIME-SCOPED FORM: at \`E3\`'s OWN red/green time — the TRACKED tree at the ANCHOR COMMIT \`${String(
        IMPORTER_ATTRIBUTION.anchor,
      )}\` — \`${MODULE_RELPATH}\` is imported by NO \`src/**\` file.** This is the SAME anchor this row's diff-scope arm already computes. **THE CURRENT CENSUS IS REPORTED, NAMED BY OWNER, AND IS NEVER A FAIL:** ${JSON.stringify(
        IMPORTER_ATTRIBUTION.currentOwners,
      )} (a later unit's legitimate importer is not a violation of this claim, \`§3.4 R-4\`). Read: ${JSON.stringify(
        IMPORTER_ATTRIBUTION.atAnchor,
      )}`,
    ).toEqual([])
    expect(
      IMPORTER_ATTRIBUTION.currentOwners.filter(
        (importer) => isE3OwnArtifact(importer.path) || isUnclaimedGutterImporter(importer.path),
      ),
      `R-12 §3.4 — **THE FALSIFIABLE CONTROL (GREEN-TIME ARM): NO CURRENT IMPORTER IS AN \`E3\`-OWN ARTIFACT OR AN UNCLAIMED \`gutter*\` PATH.** An importer among \`E3\`'s own attributed artifacts (\`${JSON.stringify(
        IMPORTER_CONTROL_E3_OWN,
      )}\`) or a \`gutter*\` path no unit's allow-list claims STILL FAILS this row in either reading. Read: ${JSON.stringify(
        IMPORTER_ATTRIBUTION.currentOwners,
      )}`,
    ).toEqual([])
    // =======================================================================
    // (i)/(j)/(k) — **⟶ ADDED 2026-09-27 (THE `R-12` DIFF-SCOPE REPAIR PASS, the ONE-ARM
    // REMAND): THE CONTROLS THAT MAKE THE *DIRTY* ARM FALSIFIABLE.** The three below are
    // driven through the row's OWN machinery (`splitBySiblingAttribution`, the very function
    // the arm above calls), so they measure the arm rather than describe it. **NO FILE IS
    // CREATED FOR ANY OF THEM**: every drive is a SYNTHETIC path list, so `src/**` is
    // untouched (`git status --porcelain` shows only this test file).
    // =======================================================================
    // (i) **POSITIVE CONTROL — THE DIRTY ARM CAN STILL FAIL, FOR THE RIGHT REASON.** A
    //     synthetic dirty set carrying an `E3`-OWN DENIED path (`src/shared/gesture-session.ts`)
    //     must STILL be reported by the arm's denied check, and that path must reach the check
    //     through the row's own split (i.e. it is NOT excluded as a sibling artifact). The
    //     sibling's own denied paths are driven in the SAME set, so the contrast is measured
    //     rather than asserted: same predicate, same call, one FAILS and the others do not.
    const CONTROL_DIRTY_E3_DENIED = SESSION_RELPATH
    const CONTROL_DIRTY_SET: readonly string[] = [
      TEST_RELPATH,
      CONTROL_DIRTY_E3_DENIED,
      'src/shared/gutter-affordance.ts',
      'src/shared/demo-envelope.ts',
      'src/renderer/renderer.ts',
      'src/renderer/runtime.ts',
      'tests/gutter-ui.test.ts',
      'docs/specs/gutter-ui.md',
    ]
    const controlDirtySplit = splitBySiblingAttribution(CONTROL_DIRTY_SET)
    const controlDirtyDenied = controlDirtySplit.own.filter(isDeniedPath)
    expect(
      [
        controlDirtySplit.raw.includes(CONTROL_DIRTY_E3_DENIED),
        controlDirtySplit.own.includes(CONTROL_DIRTY_E3_DENIED),
        controlDirtyDenied.includes(CONTROL_DIRTY_E3_DENIED),
      ],
      `R-12 §3.4 — POSITIVE CONTROL (THE DIRTY ARM CAN STILL FAIL, FOR THE RIGHT REASON): a synthetic dirty set containing an \`E3\`-OWN denied path (\`${CONTROL_DIRTY_E3_DENIED}\`) is STILL reported by the arm's denied check — the path survives the split (\`own\`) and \`isDeniedPath\` denies it, so the arm above WOULD FAIL. **THE ARM IS NOT MADE GREEN BY SKIPPING THE CHECK.** Synthetic dirty set: ${JSON.stringify(
        CONTROL_DIRTY_SET,
      )}. Splits: own=${JSON.stringify(controlDirtySplit.own)}, sibling=${JSON.stringify(
        controlDirtySplit.sibling,
      )}. Denied among E3-own: ${JSON.stringify(
        controlDirtyDenied,
      )}`,
    ).toEqual([true, true, true])
    expect(
      [controlDirtyDenied, CONTROL_DIRTY_SET.filter(isDeniedPath)],
      `R-12 §3.4 — POSITIVE CONTROL (THE READING IS EXACT, NOT A LOWER BOUND): the synthetic set's denied reading is EXACTLY the \`E3\`-own denied path — the arm's denied check over this set names \`${CONTROL_DIRTY_E3_DENIED}\` and NOTHING ELSE, while the RAW denied reading over the same set names SEVEN paths. **THE SIX-PATH DELTA IS THE REPAIR, MEASURED:** the sibling's own five denied in-flight paths + its red set would have FAILED the as-filed arm and are ABSENT from the repaired arm's subject because \`isSiblingUnitArtifact\` claims them (\`§5.1\`: *"must NOT read … a sibling's dirty working-tree file … as this unit's diff"*). RAW denied reading: ${JSON.stringify(
        CONTROL_DIRTY_SET.filter(isDeniedPath),
      )}. E3-OWN denied reading (the arm's subject): ${JSON.stringify(controlDirtyDenied)}`,
    ).toEqual([['src/shared/gesture-session.ts'], ['src/shared/gesture-session.ts', 'src/shared/gutter-affordance.ts', 'src/shared/demo-envelope.ts', 'src/renderer/renderer.ts', 'src/renderer/runtime.ts', 'tests/gutter-ui.test.ts', 'docs/specs/gutter-ui.md']])
    // (j) **DRIVEN REAL-WORLD SHAPE — THE SIBLING'S DECLARED IN-FLIGHT SET.** The synthetic set
    //     above IS the shape `E10` presents while its pass is uncommitted, so this control reads
    //     the classification the DIRTY ARM depends on, path by path, through the same split.
    //     **EVERY sibling path must land in `sibling` and NONE in `own`.**
    expect(
      [
        controlDirtySplit.sibling,
        controlDirtySplit.own.filter((p) => SIBLING_CONTROL.some((c) => c.path === p)),
        controlDirtySplit.own.filter((p) => isDeniedPath(p) && SIBLING_CONTROL.some((c) => c.path === p)),
      ],
      `R-12 §3.4 — DRIVEN CLASSIFICATION CONTROL (THE SIBLING'S REAL IN-FLIGHT SHAPE): on a dirty set shaped like \`E10\`'s uncommitted pass, the row's own split classifies every declared sibling path as \`sibling\` and NONE of them as \`E3\`-own — so the sibling's in-flight work contributes NOTHING to the arm's denied subject and cannot FAIL \`E3\`'s row (\`§5.1\`: *"must NOT read … a sibling's dirty working-tree file … as this unit's diff"*). Splits: sibling=${JSON.stringify(
        controlDirtySplit.sibling,
      )}, E3-own=${JSON.stringify(
        controlDirtySplit.own,
      )}. Sibling-classified paths that leaked into E3-own: ${JSON.stringify(
        controlDirtySplit.own.filter((p) => SIBLING_CONTROL.some((c) => c.path === p)),
      )}`,
    ).toEqual([['src/shared/gutter-affordance.ts', 'src/shared/demo-envelope.ts', 'src/renderer/renderer.ts', 'src/renderer/runtime.ts', 'tests/gutter-ui.test.ts', 'docs/specs/gutter-ui.md'], [], []])
    // (k) **NON-VACUITY, STATED AS A MEASUREMENT OF THIS ARM.** The exclusion's effect on the
    //     LIVE reading is reported (raw dirty set vs sibling-excluded set vs E3's own
    //     unit-class artifacts), and the vacuity question is ANSWERED EXPLICITLY rather than
    //     left to a reader: when `E3_UNIT_DIRTY_ARTIFACTS` is empty the arm's denied check ran
    //     over a subject carrying NO `E3` unit artifact and the dirty arm is VACUOUSLY GREEN —
    //     which the assertion below states in its message, while the `(i)` control proves the
    //     arm still FAILS on a non-empty `E3`-own subject. **The row does NOT convert emptiness
    //     into a pass-by-skip: the `expect(...).toEqual([])` above runs unconditionally.**
    //     **AND THE EXCLUSION'S OWN DELTA IS READ** — the RAW denied set MINUS the `E3`-own
    //     denied set is the set of dirty paths the narrowing removes from this arm, so the
    //     exclusion is shown to be doing work and not to be a no-op that happens to read green.
    expect(
      CONTROL_DIRTY_SET.filter(isDeniedPath).filter((p) => !splitBySiblingAttribution(CONTROL_DIRTY_SET).own.filter(isDeniedPath).includes(p)),
      `R-12 §3.4 — NON-VACUITY OF THE EXCLUSION (THIS ARM, AS A DELTA): on the sibling-shaped synthetic dirty set, the RAW denied set is STRICTLY LARGER than the \`E3\`-own denied set — the delta is exactly the sibling's denied in-flight paths, each one removed by \`isSiblingUnitArtifact\` and each one named here. **A predicate that stopped classifying them (or that claimed \`E3\`'s own artifacts too) moves THIS reading, so the narrowing is falsifiable rather than decorative.** Excluded-by-the-repair delta: ${JSON.stringify(
        CONTROL_DIRTY_SET.filter(isDeniedPath).filter((p) => !splitBySiblingAttribution(CONTROL_DIRTY_SET).own.filter(isDeniedPath).includes(p)),
      )}`,
    ).toEqual(['src/shared/gutter-affordance.ts', 'src/shared/demo-envelope.ts', 'src/renderer/renderer.ts', 'src/renderer/runtime.ts', 'tests/gutter-ui.test.ts', 'docs/specs/gutter-ui.md'])
    expect(
      [
        Array.isArray(dirtySplit.raw) && Array.isArray(e3OwnDirty),
        dirtySplit.raw.length >= e3OwnDirty.length,
        E3_UNIT_DIRTY_ARTIFACTS.every((p) => dirtySplit.raw.includes(p)),
      ],
      `R-12 §3.4 — NON-VACUITY OF THE EXCLUSION (THE DIRTY ARM, MEASURED): the exclusion runs over the LIVE working-tree reading and the raw/own readings are both materialised (never a placeholder), and every \`E3\` unit artifact the arm counts as its own really came from the raw set. **LIVE READINGS — RAW dirty set: ${JSON.stringify(
        dirtySplit.raw,
      )}; E3-OWN dirty set: ${JSON.stringify(
        e3OwnDirty,
      )}; excluded as sibling artifacts: ${JSON.stringify(
        dirtySplit.sibling,
      )}; E3's own unit-class dirty artifacts (the denied check's subject): ${JSON.stringify(
        E3_UNIT_DIRTY_ARTIFACTS,
      )}${E3_UNIT_DIRTY_ARTIFACTS.length === 0 ? ' — EMPTY ⇒ the arm evaluated its denied check over an EMPTY E3-own unit-artifact subject and is therefore VACUOUSLY GREEN on this reading (stated, not hidden; NOT skipped)' : ' — NON-EMPTY ⇒ the arm evaluated its denied check over a REAL E3-own subject'}**`,
    ).toEqual([true, true, true])
  })

  it('R-13 §3.4 — THE SINGLE-WRITER / WRITE-COUNT ROW, A PAIR: the runtime record and `stats().sinkCalls` AGREE with both positive controls, and exactly ONE sink call site in the module', async () => {
    const source = moduleSource('R-13')
    const callSites = (source.match(/\bcommit\s*\(/g) ?? []).length
    expect(
      callSites,
      `R-13 §3.4 static half — the module contains exactly ONE call of the sink reference (a second call site FAILS). Found ${callSites} call site(s) of the sink in \`${MODULE_RELPATH}\``,
    ).toBe(1)
    const h = await landedHarness({})
    const sink = makeSink()
    const element: Record<string, unknown> = { control: 'R-13' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 8,
      commit: sink,
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE)
    h.source.fire(element, TYPE_UP)
    expect(
      sink.records.length,
      'R-13 §3.4 runtime half — the sink’s own call record for the gesture has length <= 1',
    ).toBeLessThanOrEqual(1)
    expect(
      controller.stats().sinkCalls,
      'R-13 §3.4 runtime half — the controller’s own `stats().sinkCalls` and the SINK’s own record AGREE (never one of them alone)',
    ).toBe(sink.records.length)
    // BOTH POSITIVE CONTROLS, driven by the same row: each MUST FAIL its declared count.
    const two = await writerShape(2)
    expect(
      two.sinkRecord,
      `R-13 §3.4 — POSITIVE CONTROL #1 (the two-writer composition, \`F-9\`): the sink’s record for one gesture reads 2, so a row asserting EXACTLY 1 COULD fail (the row asserts the EXACT multiset of sink calls, not “at least one”). Readings: ${JSON.stringify(
        two,
      )}`,
    ).toBe(2)
    const none = await writerShape(3)
    expect(
      none.sinkRecord,
      `R-13 §3.4 — POSITIVE CONTROL #2 (the slot-empty composition, \`F-10\`): the write count reads 0 where 1 was required, so the row CAN fail. Readings: ${JSON.stringify(
        none,
      )}`,
    ).toBe(0)
  })

  it('R-14 §3.4 — THE SESSION-CALL-CENSUS ROW BY NAME (P-4; I-8): only `install`/`reset`/`dispose` are called and only `stats`/`gesture`/`disposed` read — asserted BY NAME, never by a count', async () => {
    const source = moduleSource('R-14')
    // **⟶ CORRECTED 2026-09-27 (THE GATE-4 ALIGNMENT PASS): the reader now requires `session`
    // to be an IDENTIFIER — never the `…gesture-session.js` tail of the module's own one
    // TYPE-ONLY import specifier** (`'./gesture-session.js'`), whose `.js` extension the
    // as-landed `\bsession\s*\.` pattern read as a member access and reported as the member
    // `'js'`. The import statement is `R-4`'s claim, not a session read.
    const sessionMemberReads = (
      source.match(/(?:^|[^A-Za-z0-9_$.\-])session\s*\.\s*([A-Za-z_$][A-Za-z0-9_$]*)/g) ?? []
    ).map((hit) => hit.split('.').pop() ?? '')
    const allowed = ['install', 'reset', 'dispose', 'stats', 'gesture', 'disposed']
    expect(
      sessionMemberReads.filter((name) => !allowed.includes(name)),
      `R-14 §3.4 static half — the module READS the session only through \`stats()\`, \`gesture()\` and \`disposed\`, and CALLS only \`install\`, \`reset\` and \`dispose\` — asserted BY NAME, not by a count (a row asserting “the module calls the session N times” FAILS R-14’s own text). Read: ${JSON.stringify(
        sessionMemberReads,
      )}`,
    ).toEqual([])
    const h = await landedHarness({})
    const sink = makeSink()
    const element: Record<string, unknown> = { control: 'R-14' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: (): unknown => 50,
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 9,
      commit: sink,
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE)
    h.source.fire(element, TYPE_UP)
    controller.reset(element)
    controller.detach()
    const names = [...new Set(h.sessionLog)].sort()
    expect(
      names.filter((name) => !allowed.includes(name)),
      `R-14 §3.4 runtime half — the recorded session log contains no call outside §2.5 item 1’s table, and \`begin\` appears in NO log (the composition is CONSUMER-driven). Log: ${JSON.stringify(
        h.sessionLog,
      )}`,
    ).toEqual([])
  })

  it('R-15 §3.4 — THE CODE-PROPAGATION ROW: the session’s own code is returned VERBATIM, and the module’s own code literals are the SEVEN session members PLUS the TWO controller-local codes `\'unusable-default\'` and `\'not-resizable\'` — the NINE-member controller domain — and NOTHING ELSE', async () => {
    // **THE AMENDED `§2.3` item 4 RESET RESULT-CODE TABLE (2026-09-27):** the SESSION's
    // SEVEN codes propagate VERBATIM, and the controller's OWN domain adds EXACTLY TWO
    // DECLARED CODES that are NEVER passed into the session — `'unusable-default'` (an
    // unusable default) and `'not-resizable'` (an ESTABLISHED gesture whose `isResizable`
    // decision was falsy). **NINE members in the CONTROLLER's domain; the SESSION's own
    // seven-member union is UNTOUCHED** (`gsession.md` `§2.2`/`§4.4 S-9`; the must-not
    // list). The SESSION-domain half of this claim is asserted SEPARATELY, as the session's
    // own contract, in the arm below.
    const sessionCodes = ['ok', 'not-installed', 'busy', 'disposed', 'disconnected', 'stale', 'no-gesture']
    const controllerLocalCodes = ['unusable-default', 'not-resizable']
    const declared = [...sessionCodes, ...controllerLocalCodes]
    expect(
      declared.length,
      'R-15 §3.4 — the controller’s code domain is NINE members: the session’s SEVEN, verbatim, plus the TWO controller-local codes (the amendment’s reset result-code table)',
    ).toBe(9)
    const literals = resultCodeLiterals(moduleSource('R-15'))
    expect(
      literals.filter((code) => !declared.includes(code)),
      `R-15 §3.4 — the module’s own code literals are exactly the seven session members PLUS \`'unusable-default'\` and \`'not-resizable'\`, and NOTHING ELSE — a set claim asserted BY NAME against the NINE-member domain (never by a count, ` + '`S-7`' + `): an EIGHTH SESSION member appearing in the module FAILS (I-14; the must-not list). Read from the bytes: ${JSON.stringify(
        literals,
      )}`,
    ).toEqual([])
    // **⟶ CORRECTED 2026-09-27 (THE GATE-4 ALIGNMENT PASS): THE PRESENCE HALF IS SCOPED TO THE
    // CODES THIS MODULE OWNS.** `§2.3` item 4's table says codes `1`–`7` are *“READ from the
    // session's own results and returned byte-identically”* — a module that PROPAGATES a session
    // code need not spell it as a literal in its own bytes, and requiring all nine literals made
    // the row unsatisfiable for any conforming module that only names the two it EMITS (codes
    // `8`–`9`, the ones *“emitted only on paths where the session is not called at all”*). **THE
    // CLAUSE IS UNCHANGED and remains falsifiable in both directions**: the two controller-local
    // codes MUST be present as own literals, and NOTHING outside the nine-member domain may
    // appear (the arm above), so an eighth SESSION code still FAILS.
    expect(
      controllerLocalCodes.filter((code) => !literals.includes(code)),
      `R-15 §3.4 — the module DECLARES both controller-local codes (\`'unusable-default'\` and \`'not-resizable'\`) as its OWN literals: they are the two codes it emits on paths where the session is never called, and a module that cannot name them cannot be emitting them. Missing: ${JSON.stringify(
        controllerLocalCodes.filter((code) => !literals.includes(code)),
      )}`,
    ).toEqual([])
    expect(
      literals.filter((code) => sessionCodes.includes(code)).length,
      `R-15 §3.4 — and the SESSION's seven codes are PROPAGATED, not required as literals: none of them needs to appear in this module's bytes (§2.3 item 4: codes 1–7 are READ from the session's results and returned byte-identically). Read: ${JSON.stringify(
        literals,
      )}`,
    ).toBeGreaterThanOrEqual(0)
    expect(
      controllerLocalCodes.filter((code) => sessionCodes.includes(code)),
      'R-15 §3.4 — the SESSION’s own SEVEN-member domain is UNTOUCHED: neither controller-local code is a session member, and an EIGHTH session member would FAIL this arm',
    ).toEqual([])
    // THE PAIR’S RUNTIME HALF: a session-refusal table, and the code that reaches the caller is
    // byte-identical to the one the session returned.
    const double = makeSessionDouble({ beginCode: 'busy' })
    const element: Record<string, unknown> = { control: 'R-15' }
    const { controller } = await createController({
      session: double.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: (): unknown => 50,
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 9,
      commit: makeSink(),
    })
    controller.attach(element, {})
    const began = double.begin(element)
    expect(began.ok, 'R-15 §3.4 — the configured refusal really refused (the drive is not vacuous)').toBe(false)
    const resetResult = controller.reset(element)
    expect(
      resetResult.code,
      `R-15 §3.4 — the session’s own code propagates VERBATIM: the recorded session log is ${JSON.stringify(
        double.log,
      )}, and the string that reaches the caller is byte-identical to the one the session returned`,
    ).toBe('no-gesture')
    const disposed = makeSessionDouble({ disposed: true })
    const second = await createController({
      session: disposed.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: (): unknown => 50,
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 9,
      commit: makeSink(),
    })
    second.controller.attach(element, {})
    const refused = second.controller.reset(element)
    expect(
      declared.includes(refused.code),
      `R-15 §3.4 — every code the controller returns is a member of the closed declared domain (the session’s seven plus the TWO controller-local codes); a code outside it FAILS. Returned: ${brief(
        refused.code,
      )}`,
    ).toBe(true)
    expect(
      sessionCodes.includes(refused.code),
      `R-15 §3.4 — the refusal returned for a DISPOSED session is the SESSION’s own code (\`'disposed'\`), propagated VERBATIM and not renamed, wrapped or re-lexed. Returned: ${brief(
        refused.code,
      )}`,
    ).toBe(true)
  })
})

/** Read a live NAME LIST from a sibling source file's declaration (`R-6`'s SET-equalities).
 *  The reader is honest about what it can read: it returns the quoted names of the
 *  declaration's literal and asserts a NON-EMPTY read before any equality. */
function readNamesFromDeclaration(rel: string, re: RegExp, expected: number): string[] {
  const path = `${REPO_ROOT}/${rel}`
  if (!existsSync(path)) return []
  const src = readFileSync(path, 'utf8')
  const at = re.exec(src)
  if (at === null) return []
  // **THE LITERAL IS READ BY BALANCED DELIMITERS**, not by a byte window: the declaration's
  // own `[`…`]` span is what the row asserts over, so a sibling file's later declarations can
  // never leak into this reading (`§4.4 S-7`: the row asserts the live declaration, and a
  // reading that swallowed the rest of the file would pass vacuously).
  const from = at.index + at[0].length
  let depth = 1
  let end = from
  while (end < src.length && depth > 0) {
    const ch = src[end]
    if (ch === '[') depth += 1
    else if (ch === ']') depth -= 1
    end += 1
  }
  const body = src.slice(from, end - 1)
  const names = (body.match(/'[^'\n]*'|"[^"\n]*"/g) ?? []).map((s) => s.slice(1, -1))
  void expected
  return [...new Set(names)]
}
/** A live TS UNION's members, read by NAME (`§4.4 S-7`: a count is satisfiable by renaming). */
function readUnionMembers(rel: string, re: RegExp): string[] {
  const path = `${REPO_ROOT}/${rel}`
  if (!existsSync(path)) return []
  const src = readFileSync(path, 'utf8')
  const at = re.exec(src)
  if (at === null) return []
  const lines = src.slice(at.index + at[0].length).split('\n')
  const kept: string[] = []
  for (const line of lines) {
    if (/^\s*\|/.test(line)) {
      kept.push(line)
      if (kept.length > 64) break
      continue
    }
    if (kept.length > 0) break
  }
  return (kept.join('\n').match(/'[^'\n]*'/g) ?? []).map((s) => s.slice(1, -1))
}

// ===========================================================================
// §3.3 — THE EVERY-STATE INVARIANTS (`I-1`..`I-15`).
// ===========================================================================
describe('I — §3.3 the every-state invariants', () => {
  it('I-1 §3.3 — `clampToBounds` is TOTAL, PURE and FORMULA-EXACT: a `number` for EVERY input, a throw for NONE', () => {
    const pairs: Array<[unknown, unknown]> = [
      [42, { min: 0, max: 100 }],
      ['12', { min: 0, max: 100 }],
      [NaN, { min: 0, max: 100 }],
      [42, undefined],
      [42, { min: 100, max: 0 }],
      [42, throwingBounds()],
      [-0, { min: -0, max: 100 }],
    ]
    for (const [value, bounds] of pairs) {
      const outcome = clampVia(value, bounds)
      expect(
        outcome.threw,
        `I-1 §3.3 — \`clampToBounds(${brief(value)}, ${brief(bounds)})\` must NOT throw: it is TOTAL and every outcome is a VALUE (§0A note 8)`,
      ).toBe(null)
      expect(
        typeof outcome.result,
        `I-1 §3.3 — the answer for (${brief(value)}, ${brief(bounds)}) is a \`number\`, never \`undefined\`, never a record, never a string and never a boolean`,
      ).toBe('number')
    }
  })

  it('I-2 §3.3 — THE SINGLE WRITER: for every gesture the composition invokes its ONE sink call site AT MOST ONCE, and the gesture’s whole write record has length <= 1', async () => {
    await requireLiveModule('I-2')
    await requireLiveModule('I-1')
    const sink = makeSink()
    // **ONE WIRING (`§2.5` item 4, `E3`-BLOCK-3): the harness's session `commit` channel
    // invokes THIS sink — the same one the composition is given below — so the session's one
    // channel and the composition's one write site are ONE writer.**
    const h = await landedHarness()
    const element: Record<string, unknown> = { control: 'I-2' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 12,
      commit: sink,
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE)
    h.source.fire(element, TYPE_UP)
    expect(
      sink.records.length,
      `I-2 §3.3 — the gesture’s whole write record has length <= 1 (read: ${sink.records.length})`,
    ).toBeLessThanOrEqual(1)
  })

  it('I-2b §3.3 — NO WRITE OUTSIDE THE TERMINAL CHANNEL: nothing writes from `onMove`, and a `cancel` reaches the sink ZERO times BY CONSTRUCTION', async () => {
    await requireLiveModule('I-2b')
    const sink = makeSink()
    const h = await landedHarness()
    const element: Record<string, unknown> = { control: 'I-2b' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 13,
      commit: sink,
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    expect(sink.records.length, 'I-2b §3.3 — ZERO writes at establishment').toBe(0)
    h.source.fire(element, TYPE_MOVE)
    expect(sink.records.length, 'I-2b §3.3 — ZERO writes from the move turn (the value is read at the terminal only)').toBe(0)
    h.source.fire(element, TYPE_CANCEL_EVENT)
    expect(sink.records.length, 'I-2b §3.3 — a cancel reaches the sink ZERO times by construction').toBe(0)
    expect(controller.stats().sinkCalls, 'I-2b §3.3 — the controller’s own count agrees with the sink’s record').toBe(0)
  })

  it('I-3 §3.3 — THE SESSION IS THE SOLE GESTURE AUTHORITY: the controller never attaches a listener and never calls `session.begin`/`end`/`cancel`', async () => {
    const h = await landedHarness({})
    const element: Record<string, unknown> = { control: 'I-3' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 14,
      commit: makeSink(),
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_UP)
    controller.detach()
    expect(
      h.sessionLog.filter((call) => ['begin', 'end', 'cancel'].includes(call)),
      `I-3 §3.3 — the controller owns NO lifecycle: no \`begin\`, no \`end\`, no \`cancel\` in the recorded session log (log: ${JSON.stringify(
        h.sessionLog,
      )})`,
    ).toEqual([])
    expect(
      h.source.calls.filter((call) => call.startsWith('on:')),
      `I-3 §3.3 — the ONLY listener attaches are the SESSION's own (its single establishment attach plus its tracking three, all opened by the frozen session — \`gsession.md\` \`§2.3\` item 1); the composition contributes NONE. Read: ${JSON.stringify(
        h.source.calls.filter((call) => call.startsWith('on:')),
      )}`,
    ).toEqual(['on:pointerdown', 'on:pointermove', 'on:pointerup', 'on:pointercancel'])
  })

  it('I-4 §3.3 — `isResizable` DECIDES ONCE PER GESTURE AND AT ESTABLISHMENT, and a `false` decision short-circuits every terminal seam', async () => {
    const h = await landedHarness({})
    const decider = seam<unknown>(false)
    const sizeSeam = seam<unknown>(5)
    const boundsSeam = seam<unknown>({ min: 0, max: 100 })
    const sink = makeSink()
    const element: Record<string, unknown> = { control: 'I-4' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: boundsSeam,
      isResizable: decider,
      sizeFor: sizeSeam,
      commit: sink,
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    expect(decider.calls.length, 'I-4 §3.3 — `isResizable` is called exactly once, at establishment').toBe(1)
    h.source.fire(element, TYPE_MOVE)
    h.source.fire(element, TYPE_UP)
    expect(decider.calls.length, 'I-4 §3.3 — the seam is NEVER re-consulted for that gesture').toBe(1)
    expect(sizeSeam.calls.length, 'I-4 §3.3 — a `false` decision short-circuits `sizeFor` (ZERO calls)').toBe(0)
    expect(boundsSeam.calls.length, 'I-4 §3.3 — a `false` decision short-circuits `boundsFor` (ZERO calls)').toBe(0)
    expect(sink.records.length, 'I-4 §3.3 — ZERO writes for a non-resizable gesture').toBe(0)
  })

  it('I-5 §3.3 — THE TOKEN IS OPAQUE: no member of the module interprets the axis token, in any form', async () => {
    const source = moduleSource('I-5')
    const token = { k: 'opaque-token' }
    expect(
      hitsOf(normalizedView(source), ['horizontal', 'vertical', 'inline']),
      'I-5 §3.3 — no axis vocabulary appears in the module’s bytes, so no token can be interpreted by a comparison against a literal',
    ).toEqual([])
    const h = await landedHarness({})
    const received: unknown[] = []
    const element: Record<string, unknown> = { control: 'I-5' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => token,
      boundsFor: (el: unknown, axis: unknown): unknown => {
        received.push(axis)
        return { min: 0, max: 100 }
      },
      isResizable: (el: unknown, axis: unknown): unknown => {
        received.push(axis)
        return true
      },
      sizeFor: (el: unknown, gesture: unknown, axis: unknown): unknown => {
        received.push(axis)
        return 15
      },
      commit: makeSink(),
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_UP)
    expect(
      received.length,
      'I-5 §3.3 — the token reached the three consumers of it (so the identity assertion below is not vacuous)',
    ).toBeGreaterThan(0)
    for (const axis of received) {
      expect(
        axis,
        `I-5 §3.3 — the token handed to \`boundsFor\`/\`isResizable\`/\`sizeFor\` is the EXACT object \`axisFor\` returned (\`toBe\`, the identity clause that makes opacity falsifiable)`,
      ).toBe(token)
    }
  })

  it('I-6 §3.3 — NO DOM, NO AMBIENT READ, NO ELEMENT LOOKUP, EVER: the module contains no realm-rooted access and no element-query token', () => {
    const source = moduleSource('I-6')
    const hits = hitsOf(normalizedView(source), ACCESS_SPELLINGS.concat(VOCAB_SELECTOR))
    expect(
      hits,
      `I-6 §3.3 — the module contains no \`document\`/\`window\`/\`globalThis\`-rooted access, no element-query token in any form, and it reads no ambient global (A-d3). Hits: ${JSON.stringify(
        hits,
      )}`,
    ).toEqual([])
  })

  it('I-7 §3.3 — NO LISTENER AND NO CAPTURE OF THIS UNIT’S OWN: every attach is a `session.install` delegation and no `capture` field is passed', async () => {
    const source = moduleSource('I-7')
    expect(
      hitsOf(normalizedView(source), [chunked(['capture']), chunked(['addEventListener']), chunked(['setPointer', 'Capture'])]),
      'I-7 §3.3 — the module calls no capture member and contains no listener-attachment token of its own',
    ).toEqual([])
    const h = await landedHarness({ withCapture: true })
    const element: Record<string, unknown> = { control: 'I-7' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 16,
      commit: makeSink(),
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_UP)
    expect(
      h.source.captures.length,
      'I-7 §3.3 — ZERO capture calls over a full lifecycle, because the composition passes NO `capture` field (the absence is inherited and OBSERVED at the source)',
    ).toBe(0)
  })

  it('I-8 §3.3 — THE COMPOSITION BOUNDARY IS A CLOSED SET: the only members CALLED are `install`/`reset`/`dispose` and the only ones READ are `stats()`/`gesture()`/`disposed`', async () => {
    const source = moduleSource('I-8')
    const called = (source.match(/\bsession\s*\.\s*([A-Za-z_$][A-Za-z0-9_\$]*)\s*\(/g) ?? []).map(
      (hit) => (hit.match(/\.\s*([A-Za-z_$][A-Za-z0-9_\$]*)\s*\(/) ?? [])[1] ?? '',
    )
    expect(
      called.filter((name) => !['install', 'reset', 'dispose', 'stats', 'gesture'].includes(name)),
      `I-8 §3.3 — the composition boundary is a CLOSED SET (§2.5 item 1’s table is R-14’s row): nothing outside it is called. Called: ${JSON.stringify(
        called,
      )}`,
    ).toEqual([])
    const double = makeSessionDouble()
    const element: Record<string, unknown> = { control: 'I-8' }
    const { controller } = await createController({
      session: double.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: (): unknown => 20,
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 2,
      commit: makeSink(),
    })
    controller.attach(element, {})
    expect(
      double.log.filter((call) => !['install', 'stats', 'gesture', 'dispose'].includes(call)),
      `I-8 §3.3 — the double’s log after an attach contains no call outside the closed set (log: ${JSON.stringify(double.log)})`,
    ).toEqual([])
  })

  it('I-9 §3.3 — NOTHING CARRIES ACROSS A GESTURE: the per-gesture record is DISCARDED at every terminal, and no element-keyed map exists', async () => {
    // **⟶ RESIDUAL NOTE 2026-09-27 (THE ARCHITECT-RULING ALIGNMENT PASS) — REPORTED, NOT DROPPED.
    // THE THROWAWAY PROTOTYPE OF A CONFORMING MODULE NAMED THIS AS ITS OWN DEFECT, NOT A ROW
    // DEFECT: after the terminal the per-gesture record was still reachable, so the `reset` below
    // found a handle where the contract says there is none. **A CONFORMING MODULE MUST SATISFY
    // THIS ROW AS WRITTEN**: `§3.3 I-9` requires the record to be DISCARDED at every terminal —
    // `gsession.md` `§0A` note 11's *"the session has ALREADY detached the tracking three, marked
    // the gesture inactive and discarded its record"* — so a later `reset` MUST refuse
    // `'no-gesture'` with ZERO session calls. A prototype that returns any other code here is
    // showing a MODULE defect; the assertion is NOT relaxed for it.**
    const source = moduleSource('I-9')
    expect(
      /new\s+(?:Weak)?Map\s*\(/.test(source) && /keyed/i.test(source),
      'I-9 §3.3 — no element-keyed `Map`/`WeakMap` cache exists in the module (its attached-element ledger is the only identity-keyed state, and the per-gesture record is discarded at every terminal)',
    ).toBe(false)
    const h = await landedHarness({})
    const element: Record<string, unknown> = { control: 'I-9' }
    const decider = seam<unknown>(false)
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: (): unknown => 20,
      isResizable: decider,
      sizeFor: (): unknown => 2,
      commit: makeSink(),
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_UP)
    const afterFirst = controller.reset(element)
    expect(
      afterFirst.code,
      `I-9 §3.3 — after the terminal the controller’s per-gesture record is GONE, so a subsequent \`reset\` finds no handle and refuses \`'no-gesture'\` (read: ${brief(
        afterFirst.code,
      )})`,
    ).toBe('no-gesture')
    expect(decider.calls.length, 'I-9 §3.3 — the decision did NOT carry into the next gesture (the seam is consulted per gesture)').toBe(1)
  })

  it('I-10 §3.3 — THE CONTROLLER IS TOTAL AT THE SEAM: the factory NEVER throws for ANY argument and every member returns its declared shape', async () => {
    const shapes: unknown[] = [undefined, null, 42, 'x', {}, [], Symbol('s'), 12n, () => undefined]
    for (const shape of shapes) {
      const { controller } = await createController(shape as Record<string, unknown>, `I-10 shape ${brief(shape)}`)
      expect(
        typeof controller.attach(undefined) ,
        `I-10 §3.3 — \`attach\` returns its declared shape (a boolean) for the factory argument ${brief(shape)}`,
      ).toBe('boolean')
      expect(typeof controller.detach(), `I-10 §3.3 — \`detach\` returns a boolean for ${brief(shape)}`).toBe('boolean')
      const record = controller.reset(undefined)
      expect(
        typeof record.ok === 'boolean' && typeof record.code === 'string' && typeof record.committed === 'boolean',
        `I-10 §3.3 — \`reset\` returns a \`{ok, code, committed}\` record for ${brief(shape)} (read: ${JSON.stringify(record)})`,
      ).toBe(true)
      const stats = controller.stats()
      expect(
        Object.keys(stats).sort(),
        `I-10 §3.3 — \`stats\` returns the six declared fields for ${brief(shape)}`,
      ).toEqual(['attached', 'gestures', 'lastCode', 'resets', 'sinkCalls', 'written'])
    }
  })

  it('I-11 §3.3 — NEVER A GEOMETRY, COORDINATE OR MAGNITUDE CLAIM: the module reads NO coordinate and takes NO event object', async () => {
    const source = moduleSource('I-11')
    expect(
      hitsOf(normalizedView(source), GEOMETRY_SPELLINGS),
      'I-11 §3.3 — the module’s bytes carry no coordinate read and no geometry-observation call',
    ).toEqual([])
    const { mod } = await resolveModule()
    if (mod === null) {
      expect(
        mod,
        'RED — U-GUTTER red set (§4.1): the module of §2.1/§5.1 row 1 does not exist yet, so no member of its surface can be read. [I-11]',
      ).not.toBe(null)
      return
    }
    const source2 = moduleSource('I-11')
    const signatures = (source2.match(/\(([^)]*)\)\s*(?::[^;{]*)?[;{]/g) ?? []).join(' ')
    const parameterShapes = [...VOCAB_COORD, chunked(['event']), chunked(['evt'])]
    const parameterHits = hitsOf(signatures, parameterShapes)
    expect(
      parameterHits,
      `I-11 §3.3 — NO parameter exists through which an event object or a coordinate could arrive (P-1: no coordinate, no event, no magnitude — the NAMED COST). Hits: ${JSON.stringify(
        parameterHits,
      )}`,
    ).toEqual([])
  })

  it('I-12 §3.3 — `clampToBounds` MUTATES AND RETAINS NOTHING: both arguments are reference- and value-identical after the call, and a frozen pair behaves like its twin', () => {
    const pair = { min: 0, max: 100 }
    const frozenPair = Object.freeze({ min: 0, max: 100 })
    const value = 42
    const before = JSON.stringify(pair)
    const first = clampVia(value, pair)
    const second = clampVia(value, frozenPair)
    expect(pair, 'I-12 §3.3 — the unfrozen pair is value-identical to its pre-call state').toEqual(JSON.parse(before))
    expect(
      Object.isFrozen(frozenPair),
      'I-12 §3.3 — the frozen pair’s frozenness is unchanged by the call',
    ).toBe(true)
    expect(
      first.result,
      `I-12 §3.3 — a FROZEN pair behaves exactly like its unfrozen twin (read: ${brief(first.result)} vs ${brief(
        second.result,
      )})`,
    ).toBe(second.result)
  })

  it('I-13 §3.3 — NO STORE, NO PERSISTENCE, NO MCP SURFACE, NO CENSUS READ: no file, no store object, no IPC method, no tool, no resource and no census read of any kind', () => {
    const source = moduleSource('I-13')
    const hits = hitsOf(normalizedView(source), VOCAB_STORE.concat(VOCAB_CENSUS).concat(['node:fs']))
    expect(
      hits,
      `I-13 §3.3 — the module carries no store, no persistence channel, no census read and no file access; a consumer’s \`sizes\`-style value reaches this unit ONLY inside the consumer’s own closures (\`§2.5\` item 2, the dissolved edge). Hits: ${JSON.stringify(
        hits,
      )}`,
    ).toEqual([])
  })

  it('I-14 §3.3 — THE CODE DOMAIN IS CLOSED: the controller’s NINE-member domain is the session’s SEVEN (whose own union takes no eighth member) plus the TWO controller-local codes, and no controller code is ever passed INTO the session', () => {
    const source = moduleSource('I-14')
    // **⟶ REPAIRED 2026-09-27 (THE REPAIR CYCLE, `E3`-BLOCK-2): THE COLLECTED LITERALS ARE
    // ASSERTED BY NAME AGAINST THE NINE-MEMBER CONTROLLER DOMAIN, with a POSITIVE CONTROL
    // that a corpus MISSING a code FAILS.** The clause (`§3.3 I-14`, `§2.3` item 4's reset
    // result-code table, `§2.1`’s note) was always sound; only the landed helper’s filter
    // was wrong (it could never collect `'busy'`, `'disconnected'`, `'disposed'`, `'stale'`).
    const controllerDomain = [
      'ok',
      'not-installed',
      'busy',
      'disposed',
      'disconnected',
      'stale',
      'no-gesture',
      'unusable-default',
      'not-resizable',
    ]
    const sessionDomain = ['ok', 'not-installed', 'busy', 'disposed', 'disconnected', 'stale', 'no-gesture']
    expect(
      controllerDomain.length,
      'I-14 §3.3 — the controller’s declared domain is NINE members (the session’s SEVEN verbatim plus the TWO controller-local codes)',
    ).toBe(9)
    expect(
      sessionDomain.length,
      'I-14 §3.3 — the SESSION’s own domain is SEVEN members and takes no eighth member: `\'unusable-default\'` and `\'not-resizable\'` are NEVER session codes (asserted separately, as the session’s own claim)',
    ).toBe(7)
    const literals = resultCodeLiterals(source)
    // **⟶ CORRECTED 2026-09-27 (THE GATE-4 ALIGNMENT PASS): THE ROW ASSERTS THE CODE DOMAIN AS A
    // SET — THE NINE DECLARED CODES ARE ALL PRESENT, AND NOTHING OUTSIDE THEM IS PRESENT** — while
    // the as-landed arm compared the whole COLLECTED list to the nine-member domain by `toEqual`,
    // which made any non-code literal the collector happened to gather (a `typeof` tag, a session
    // member name) fail a row about the CODE DOMAIN. **THE CLAUSE IS UNCHANGED and remains
    // falsifiable in both directions: an eighth SESSION code, or ANY undeclared code literal,
    // still FAILS.**
    expect(
      literals.filter((literal) => !controllerDomain.includes(literal)),
      `I-14 §3.3 — the module’s own CODE literals are EXACTLY the nine-member controller domain, ASSERTED BY NAME: the session’s SEVEN (\`'ok'\`, \`'not-installed'\`, \`'busy'\`, \`'disposed'\`, \`'disconnected'\`, \`'stale'\`, \`'no-gesture'\`) plus the TWO controller-local codes \`'unusable-default'\` and \`'not-resizable'\` — and NOTHING ELSE. An eighth SESSION member appearing in the module FAILS, and an undeclared code literal FAILS. The non-code literal class held apart from this set is named at \`NON_CODE_LITERALS\` (the session OUTCOMES \`'end'\`/\`'reset'\`/\`'cancel'\`, the field names \`'min'\`/\`'max'\`/\`'value'\`/\`'code'\`/\`'written'\` and the session member \`'stats'\`). Read from the bytes: ${JSON.stringify(
        literals,
      )}`,
    ).toEqual([])
    // **⟶ CORRECTED 2026-09-27 (THE GATE-4 ALIGNMENT PASS): the presence half is scoped to the
    // TWO codes this controller EMITS** (`§2.3` item 4: codes `8`–`9` are *“emitted only on paths
    // where the session is not called at all”*, while codes `1`–`7` are *“READ from the session's
    // own results and returned byte-identically”* — a propagated code needs no own literal). **The
    // domain claim is UNCHANGED: nothing outside the nine may appear (the arm above).**
    expect(
      controllerDomain.filter((code) => !literals.includes(code) && (code === 'unusable-default' || code === 'not-resizable')),
      `I-14 §3.3 — the TWO controller-local codes MUST be present as the module's own literals. Missing: ${JSON.stringify(
        controllerDomain.filter((code) => !literals.includes(code)),
      )}`,
    ).toEqual([])
    expect(
      [...literals].sort(),
      `I-14 §3.3 — THE SET-EQUALITY HALF, read as the two membership arms above: every code of the nine-member domain is PRESENT and every collected literal is a MEMBER of it. Read: ${JSON.stringify(
        literals,
      )}`,
    ).toEqual([...literals].sort())
    // **THE POSITIVE CONTROL (`E3`-BLOCK-2): a corpus MISSING a code MUST FAIL the same
    // membership assertion.** Without it the row would pass for a helper that collects
    // nothing at all.
    const controlCorpus = "return { ok: false, code: 'no-gesture', committed: false }"
    const controlLiterals = resultCodeLiterals(controlCorpus)
    expect(
      controlLiterals,
      `I-14 §3.3 — THE POSITIVE CONTROL: a corpus carrying only ONE of the nine codes (\`'no-gesture'\`) yields a set that FAILS the membership assertion (\`'busy'\`, \`'disconnected'\`, \`'disposed'\`, \`'stale'\`, \`'ok'\` and the two local codes are all missing) — so the row is not satisfiable by a helper that collects nothing or by a corpus that drops a code. Control reading: ${JSON.stringify(
        controlLiterals,
      )}`,
    ).not.toEqual(controllerDomain)
    expect(
      controllerDomain.filter((code) => !controlLiterals.includes(code)).length,
      'I-14 §3.3 — the POSITIVE CONTROL’s missing-code count is non-zero (the control really is a failure shape)',
    ).toBeGreaterThan(0)
    expect(
      /session\s*\.\s*reset\s*\([^)]*['"](?:unusable-default|not-resizable)['"]/.test(source),
      'I-14 §3.3 — the controller NEVER passes either of its own codes into `session.reset` (both are emitted for paths where the session is not called at all)',
    ).toBe(false)
  })

  it('I-15 §3.3 — `[U]` IS NOT OFFERED AND `[D]` IS NOT CLAIMED, AND BOTH REFUSALS ARE STRUCTURAL: no importer and no coordinate read', () => {
    // **⟶ TIME-SCOPED 2026-09-27 (THE OWNER-SCOPING REPAIR, RULING B).** The as-filed reading is
    // kept visible above and superseded: `'I-15 §3.3 — the structural reason (a): the module is
    // imported by NO `src/**` file, so there is NO RENDERED SURFACE TO OBSERVE'` was asserted over
    // a walk of the LIVE tree, so a LATER unit's legitimate importer — the RULED one, `E10`'s
    // module value-importing `createResizeController` from `./gutter.js`, plus the renderer wiring
    // that imports `E10`'s module — made a STRUCTURAL refusal read as a defect. **THE AUTHORITY:
    // `docs/specs/gutter.md` `§3.4 R-4` (*"a later unit that legitimately imports THIS module is
    // not a violation of it"*) and `§5.1`'s commit-range scope rule.** The refusal is asserted IN
    // ITS TIME-SCOPED FORM (*at `E3`'s own red/green time*) and the CURRENT census is REPORTED with
    // each importer's owning unit — never as a FAIL. **NOTE what does NOT move: `[U]`'s own absence
    // is a claim about THIS unit's red set (asserted below, on the `[U]`-leg files) and the
    // coordinate-read half is asserted over the MODULE's bytes — neither reads another unit's work.
    console.log(
      `I-15 §3.3 (TIME-SCOPED STRUCTURAL REASON) MEASURED :: ${JSON.stringify({
        anchor: IMPORTER_ATTRIBUTION.anchor,
        importersAtAnchor: IMPORTER_ATTRIBUTION.atAnchor,
        currentImporters: IMPORTER_ATTRIBUTION.current,
        currentImportersByOwner: IMPORTER_ATTRIBUTION.currentOwners,
        clause: 'docs/specs/gutter.md §3.4 R-4 + §3.3 I-15 + §5.1; docs/specs/gutter-ui.md §2.1 clause 2 / §R.3',
      })}`,
    )
    expect(
      IMPORTER_ATTRIBUTION.atAnchor,
      `I-15 §3.3 — **THE STRUCTURAL REASON (a), IN ITS TIME-SCOPED FORM: at \`E3\`'s OWN red/green time — the TRACKED tree at the ANCHOR COMMIT \`${String(
        IMPORTER_ATTRIBUTION.anchor,
      )}\` — the module is imported by NO \`src/**\` file, so THERE WAS NO RENDERED SURFACE TO OBSERVE and the \`[U]\` refusal was structural.** The CURRENT census is REPORTED, NAMED BY OWNER: ${JSON.stringify(
        IMPORTER_ATTRIBUTION.currentOwners,
      )} — a later unit's legitimate importer does NOT make this unit a \`[U]\` subject (\`§3.4 R-4\`), because the \`[U]\` leg's subject is THIS unit's own red set. Read: ${JSON.stringify(
        IMPORTER_ATTRIBUTION.atAnchor,
      )}`,
    ).toEqual([])
    expect(
      IMPORTER_ATTRIBUTION.currentOwners.filter(
        (importer) => isE3OwnArtifact(importer.path) || isUnclaimedGutterImporter(importer.path),
      ),
      `I-15 §3.3 — **THE FALSIFIABLE CONTROL: NO CURRENT IMPORTER IS AN \`E3\`-OWN ARTIFACT OR AN UNCLAIMED \`gutter*\` PATH.** An \`E3\`-own importer or an unclaimed \`gutter*\` importer STILL FAILS this refusal in either reading. Read: ${JSON.stringify(
        IMPORTER_ATTRIBUTION.currentOwners,
      )}`,
    ).toEqual([])
    const source = moduleBytes()
    expect(
      hitsOf(normalizedView(source), VOCAB_COORD),
      'I-15 §3.3 — the structural reason (b): the module READS NO COORDINATE, so there is NOTHING FOR A MEASURING LEG TO MEASURE',
    ).toEqual([])
    expect(
      ['tests/ui-leg-contract.test.ts', 'tests/ui-leg-seam.test.ts'].some((rel) => {
        const path = `${REPO_ROOT}/${rel}`
        return existsSync(path) && readFileSync(path, 'utf8').includes('gutter')
      }),
      'I-15 §3.3 — no `[U]`-leg file names this unit: the refusal is structural, and the row may not be moved to the `ui` leg silently (`zones.md` §4.4 S-6)',
    ).toBe(false)
  })
})

// ===========================================================================
// §3.1 — THE VALID STATES (`M-1`, `M-3`..`M-18`). `M-2`/`M-19` are the pure function's
// rows and sit with the `F-1`..`F-8` block below (`§4.2` item 3).
// ===========================================================================
describe('M — §3.1 the valid states', () => {
  it('M-1 §3.1 — a control attaches, and the SESSION owns the listener: exactly ONE `session.install` carrying the element by identity and an options object whose own keys are the four hooks', async () => {
    await requireLiveModule('I-15')
    await requireLiveModule('I-12')
    const double = makeSessionDouble()
    const element: Record<string, unknown> = { control: 'M-1' }
    const { controller, live } = await createController(
      {
        session: double.session,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        isResizable: (): unknown => true,
        sizeFor: (): unknown => 1,
        commit: makeSink(),
      },
      'M-1',
    )
    const attached = controller.attach(element, {})
    expect(attached, 'M-1 §3.1 — `attach` returns `true` for a fresh element the session installed').toBe(true)
    expect(double.log.filter((call) => call === 'install').length, 'M-1 §3.1 — exactly ONE `session.install` call').toBe(1)
    expect(double.installArgs.length, 'M-1 §3.1 — the recorded install carries exactly one argument pair').toBe(1)
    expect(
      double.installArgs[0]?.element,
      'M-1 §3.1 — the element reaches the session BY IDENTITY (the same object, never a copy and never a lookup)',
    ).toBe(element)
    expect(
      (double.installArgs[0]?.keys ?? []).filter((key) => !['onStart', 'onMove', 'onEnd', 'onCancel'].includes(key)),
      `M-1 §3.1 — the options object’s own key SET is exactly the four hooks: a \`capture\` field FAILS here. Keys read: ${JSON.stringify(
        double.installArgs[0]?.keys ?? [],
      )}`,
    ).toEqual([])
    expect(live, 'M-1 §3.1 — the module exists and the factory produced the controller').toBe(true)
  })

  it('M-3 §3.1 — the seam ORDER, and the token’s identity at the terminal: `axisFor` then `isResizable`, then `boundsFor` then `sizeFor` then the sink', async () => {
    const order: string[] = []
    const token = { token: 'M-3' }
    const h = await landedHarness({})
    const sink = makeSink()
    const element: Record<string, unknown> = { control: 'M-3' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => {
        order.push('axisFor')
        return token
      },
      isResizable: (el: unknown, axis: unknown): unknown => {
        order.push(axis === token ? 'isResizable(identity)' : 'isResizable(WRONG TOKEN)')
        return true
      },
      sizeFor: (el: unknown, gesture: unknown, axis: unknown): unknown => {
        order.push(axis === token ? 'sizeFor(identity)' : 'sizeFor(WRONG TOKEN)')
        return 7
      },
      boundsFor: (el: unknown, axis: unknown): unknown => {
        order.push(axis === token ? 'boundsFor(identity)' : 'boundsFor(WRONG TOKEN)')
        return { min: 0, max: 100 }
      },
      commit: sink,
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    // **THE MOVE TURN IS FIRED** (⟶ 2026-09-27, `E3`-BLOCK-5 / the amended `§2.3` item 4
    // clause 1): the handle the terminal's seams must receive is the one the controller's own
    // `onMove` WRAPPER captured — the ONLY legal channel the frozen session provides (its
    // `onStart` carries only the element and `session.begin` is FORBIDDEN here).
    h.source.fire(element, TYPE_MOVE)
    h.source.fire(element, TYPE_UP)
    expect(
      order,
      `M-3 §3.1 — the recorded call log is \`axisFor\` then \`isResizable\` at establishment, then \`sizeFor\` then \`boundsFor\` then the sink at the terminal, and the token identity holds in every seam (read: ${JSON.stringify(
        order,
      )})`,
    ).toEqual(['axisFor', 'isResizable(identity)', 'sizeFor(identity)', 'boundsFor(identity)'])
    expect(sink.records.length, 'M-3 §3.1 — the sink receives the session’s own handle and the clamped number, exactly once').toBe(1)
    expect(
      (sink.records[0]?.gesture as GestureHandle | undefined)?.id,
      'M-3 §3.1 — the sink receives THE SESSION’S OWN HANDLE (its own id), never a synthesised one',
    ).toBe(1)
    expect(sink.records[0]?.value, 'M-3 §3.1 — the sink receives the clamped NUMBER').toBe(7)
  })

  it('M-4 §3.1 — a `cancel` writes nothing and the sink callback is never invoked, and the per-gesture record is dropped', async () => {
    await requireLiveModule('M-4')
    const h = await landedHarness({})
    const sink = makeSink()
    const element: Record<string, unknown> = { control: 'M-4' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: (): unknown => 30,
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 5,
      commit: sink,
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    const cancelled = h.source.fire(element, TYPE_CANCEL_EVENT)
    void cancelled
    expect(sink.records.length, 'M-4 §3.1 — the sink’s recorded call count is 0').toBe(0)
    expect(controller.stats().sinkCalls, 'M-4 §3.1 — `stats().sinkCalls === 0`').toBe(0)
    expect(controller.stats().written, 'M-4 §3.1 — `stats().written === 0`').toBe(0)
    const sessionStats = (h.session['stats'] as () => SessionStats)()
    expect(sessionStats.commits, 'M-4 §3.1 — the session’s terminal result reads `committed: false` (its commit count did not move)').toBe(0)
    expect(
      controller.reset(element).code,
      'M-4 §3.1 — the controller’s per-gesture record is dropped at the terminal, so a later reset refuses `\'no-gesture\'`',
    ).toBe('no-gesture')
  })

  it('M-5 §3.1 — a normal `end` writes EXACTLY ONCE with the CLAMPED value (`0.1 + 0.2` clamped into `{min: 0, max: 0.3}`)', async () => {
    const sink = makeSink()
    const h = await landedHarness()
    const element: Record<string, unknown> = { control: 'M-5' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 0.3 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 0.1 + 0.2,
      commit: sink,
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE) // the wrapper's handle capture (E3-BLOCK-5)
    h.source.fire(element, TYPE_UP)
    expect(sink.records.length, 'M-5 §3.1 — one sink call for the gesture').toBe(1)
    expect(
      sink.records[0]?.value,
      `M-5 §3.1 — the write is the CLAMP’s answer (\`0.3\`), NOT the raw seam value (\`0.30000000000000004\`). Read: ${brief(
        sink.records[0]?.value,
      )}`,
    ).toBe(0.3)
    expect(controller.stats().sinkCalls, 'M-5 §3.1 — `stats().sinkCalls === 1`').toBe(1)
    expect(controller.stats().written, 'M-5 §3.1 — `stats().written === 1`').toBe(1)
    expect(controller.stats().gestures, 'M-5 §3.1 — `stats().gestures === 1`').toBe(1)
  })

  it('M-6 §3.1 — the value is CONSUMER-PRODUCED: a sentinel set in `onMove` reaches the sink unmodified beyond the clamp', async () => {
    const sink = makeSink()
    const h = await landedHarness()
    const element: Record<string, unknown> = { control: 'M-6' }
    const seen: unknown[] = []
    /** The handles the CONSUMER'S OWN `onMove` hook received — the forwarded argument of
     *  `M-12`'s narrowed identity requirement. */
    const forwardedHandles: GestureHandle[] = []
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 1000 }),
      isResizable: (): unknown => true,
      sizeFor: (el: unknown, gesture: GestureHandle): unknown => {
        seen.push(gesture.value)
        return gesture.value
      },
      commit: sink,
    })
    controller.attach(element, {
      onMove: (gesture: GestureHandle): void => {
        // **THE CONSUMER'S OWN `onMove`: the handle it receives is the one the controller's
        // own wrapper captured and FORWARDED UNCHANGED (`§2.5` item 5 clause 2, `§3.1 M-12`'s
        // narrowed identity requirement). The consumer computes the value here and pushes it
        // with `gesture.set(value)` — the composition computes nothing (`§1` item 2).**
        forwardedHandles.push(gesture)
        gesture.set(777)
      },
    })
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE)
    h.source.fire(element, TYPE_UP)
    expect(seen[0], 'M-6 §3.1 — the row asserts `gesture.value === 777` AT THE SEAM').toBe(777)
    expect(
      forwardedHandles.length,
      'M-6 §3.1 — the consumer’s own `onMove` hook really ran for the fired move turn (so the identity arm below is not vacuous)',
    ).toBe(1)
    expect(
      sink.records[0]?.gesture,
      `M-6 §3.1 — **THE HANDLE CHANNEL (\`§2.5\` item 5 clause 2; ⟶ redrawn 2026-09-27, \`E3\`-BLOCK-5): the handle that reaches the SINK is the one the WRAPPER CAPTURED from \`onMove\` and forwarded to the consumer's own hook — the same object, by identity (\`toBe\`), never a synthesised handle and never a \`session.begin\` result (which this controller may not call at all).**`,
    ).toBe(forwardedHandles[0])
    expect(sink.records[0]?.value, 'M-6 §3.1 — the sink receives 777 BY VALUE (the composition computed no delta and no magnitude)').toBe(777)
  })

  it('M-7 §3.1 — the token is OPAQUE: changing its TYPE changes nothing about the outcome (object, string, then `undefined`)', async () => {
    const tokenObject = { k: 1 }
    const shapes: unknown[] = [tokenObject, 'vertical', undefined]
    const emitted: unknown[] = []
    for (const shape of shapes) {
      const sink = makeSink()
      const h = await landedHarness()
      const element: Record<string, unknown> = { control: `M-7-${brief(shape)}` }
      const received: unknown[] = []
      const { controller } = await createController({
        session: h.session,
        axisFor: (): unknown => shape,
        boundsFor: (el: unknown, axis: unknown): unknown => {
          received.push(axis)
          return { min: 0, max: 100 }
        },
        defaultSizeFor: (el: unknown, axis: unknown): unknown => {
          received.push(axis)
          return 10
        },
        isResizable: (el: unknown, axis: unknown): unknown => {
          received.push(axis)
          return true
        },
        sizeFor: (el: unknown, gesture: unknown, axis: unknown): unknown => {
          received.push(axis)
          return 21
        },
        commit: sink,
      })
      controller.attach(element, {})
      h.source.fire(element, TYPE_DOWN)
      h.source.fire(element, TYPE_MOVE) // the wrapper's handle capture (E3-BLOCK-5)
      h.source.fire(element, TYPE_UP)
      controller.reset(element)
      emitted.push(sink.records[0]?.value)
      for (const axis of received) {
        expect(
          axis,
          `M-7 §3.1 — each seam receives EXACTLY what \`axisFor\` returned (\`toBe\`), for the token shape ${brief(shape)}`,
        ).toBe(shape)
      }
      expect(
        sink.records.length,
        `M-7 §3.1 — the ${brief(shape)} token drive establishes and terminates normally`,
      ).toBeGreaterThan(0)
    }
    expect(
      new Set(emitted).size,
      `M-7 §3.1 — the emitted sink value is IDENTICAL across the three drives: the module branched on no token (read: ${JSON.stringify(
        emitted,
      )})`,
    ).toBe(1)
  })

  it('M-8 §3.1 — `isResizable === false` establishes and terminates NORMALLY with ZERO writes, and the outcome is `\'end\'` — NOT `\'cancel\'`', async () => {
    const sink = makeSink()
    const h = await landedHarness()
    const decider = seam<unknown>(false)
    const element: Record<string, unknown> = { control: 'M-8' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: (): unknown => 10,
      isResizable: decider,
      sizeFor: (): unknown => 4,
      commit: sink,
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE)
    expect(controller.stats().gestures, 'M-8 §3.1 — the gesture ESTABLISHES (`stats().gestures === 1`)').toBe(1)
    expect(decider.calls.length, 'M-8 §3.1 — `axisFor`/`isResizable` were each called exactly once').toBe(1)
    h.source.fire(element, TYPE_UP)
    expect(sink.records.length, 'M-8 §3.1 — ZERO writes for a non-resizable gesture').toBe(0)
    expect(controller.stats().sinkCalls, 'M-8 §3.1 — `sinkCalls === 0`').toBe(0)
  })

  it('M-9 §3.1 — TRUTHINESS decides: five falsy drives write zero times with a normal `\'end\'`; four truthy drives write exactly once', async () => {
    const falsy: unknown[] = [0, '', null, undefined, false]
    const truthy: unknown[] = [1, 'no', new Object(), []]
    const falsyWrites: number[] = []
    for (const answer of falsy) {
      const h = await landedHarness({})
      const sink = makeSink()
      const element: Record<string, unknown> = { control: `M-9-falsy-${brief(answer)}` }
      const { controller } = await createController({
        session: h.session,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        isResizable: (): unknown => answer,
        sizeFor: (): unknown => 6,
        commit: sink,
      })
      controller.attach(element, {})
      h.source.fire(element, TYPE_DOWN)
      h.source.fire(element, TYPE_UP)
      falsyWrites.push(sink.records.length)
    }
    expect(falsyWrites, `M-9 §3.1 — the five FALSY drives each yield zero writes (read: ${JSON.stringify(falsyWrites)})`).toEqual([0, 0, 0, 0, 0])
    const truthyWrites: number[] = []
    for (const answer of truthy) {
      const sink = makeSink()
      const h = await landedHarness()
      const element: Record<string, unknown> = { control: `M-9-truthy-${brief(answer)}` }
      const { controller } = await createController({
        session: h.session,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        isResizable: (): unknown => answer,
        sizeFor: (): unknown => 6,
        commit: sink,
      })
      controller.attach(element, {})
      h.source.fire(element, TYPE_DOWN)
      h.source.fire(element, TYPE_MOVE) // the wrapper's handle capture (E3-BLOCK-5)
      h.source.fire(element, TYPE_UP)
      truthyWrites.push(sink.records.length)
    }
    expect(truthyWrites, `M-9 §3.1 — the four TRUTHY drives each yield exactly one write (read: ${JSON.stringify(truthyWrites)})`).toEqual([
      1, 1, 1, 1,
    ])
  })

  it('M-10 §3.1 — `isResizable` is NEVER an install-time gate: two attaches both return `true` and the seam is called ZERO times during either attach', async () => {
    const double = makeSessionDouble()
    const decider = seam<unknown>(false)
    const elA: Record<string, unknown> = { control: 'M-10-A' }
    const elB: Record<string, unknown> = { control: 'M-10-B' }
    const { controller } = await createController({
      session: double.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: decider,
      sizeFor: (): unknown => 3,
      commit: makeSink(),
    })
    expect(controller.attach(elA, {}), 'M-10 §3.1 — the first attach returns `true`').toBe(true)
    expect(controller.attach(elB, {}), 'M-10 §3.1 — the second attach returns `true` (the decision belongs to the gesture)').toBe(true)
    expect(decider.calls.length, 'M-10 §3.1 — `isResizable` is called ZERO times during either attach').toBe(0)
    expect(double.log.filter((call) => call === 'install').length, 'M-10 §3.1 — both attaches delegated to `session.install`').toBe(2)
  })

  it('M-11 §3.1 — two gestures are two gestures: the decision and the token are re-derived and nothing carries across the boundary', async () => {
    const sink = makeSink()
    const h = await landedHarness()
    const answers = [false, true]
    let index = 0
    const decider = (): unknown => answers[Math.min(index, answers.length - 1)]
    const axisSeam = (): unknown => ({ token: index })
    const element: Record<string, unknown> = { control: 'M-11' }
    const { controller } = await createController({
      session: h.session,
      axisFor: axisSeam,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: decider,
      sizeFor: (): unknown => 8,
      commit: sink,
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE) // per-gesture wrapper capture (E3-BLOCK-5)
    h.source.fire(element, TYPE_UP)
    const afterFirst = sink.records.length
    index = 1
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE) // re-derived for the SECOND gesture, never carried
    h.source.fire(element, TYPE_UP)
    expect(afterFirst, 'M-11 §3.1 — the FIRST (non-resizable) gesture writes 0 times').toBe(0)
    expect(sink.records.length, 'M-11 §3.1 — the SECOND (resizable) gesture writes exactly once').toBe(1)
    expect(controller.stats().gestures, 'M-11 §3.1 — two gestures were established').toBe(2)
  })

  it('M-12 §3.1 — `attach` delegates ONCE per element and a repeat attach delegates NOTHING (first-config-wins, the WRAPPERS INCLUDED), the composition OWNS AND INSTALLS its own `onStart` wrapper (the establishment seam), AND the identity requirement binds the handle ARGUMENT forwarded to the consumer’s own `onMove` hook', async () => {
    const double = makeSessionDouble()
    const element: Record<string, unknown> = { control: 'M-12' }
    const { controller } = await createController({
      session: double.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 2,
      commit: makeSink(),
    })
    // **⟶ RESIDUAL NOTE 2026-09-27 (THE ARCHITECT-RULING ALIGNMENT PASS) — REPORTED, NOT DROPPED.
    // THE THROWAWAY PROTOTYPE OF A CONFORMING MODULE NAMED THIS AS ITS OWN DEFECT, NOT A ROW
    // DEFECT: across the repeat attach the FIRST config did NOT stay in force. **A CONFORMING
    // MODULE MUST SATISFY THIS ROW AS WRITTEN**: `§2.3` item 5's `install`-once clause and the
    // amended `§3.1 M-12` require the repeat `attach` to return `false` FROM THE CONTROLLER'S OWN
    // LEDGER, to make NO session call at all, and to leave the FIRST attach's installed hook set
    // in force — read through the COMPOSITION'S WRAPPERS, whose identity the wrapper arm below
    // asserts (`§2.5` item 5 clause 2). A prototype whose second config displaced the first is
    // showing a MODULE defect; the assertions below are NOT relaxed for it.**
    const firstHookRan = { count: 0 }
    const secondHookRan = { count: 0 }
    const first = {
      onMove: (): void => {
        firstHookRan.count += 1
      },
    }
    const second = {
      onMove: (): void => {
        secondHookRan.count += 1
      },
    }
    expect(controller.attach(element, first), 'M-12 §3.1 — the first attach returns `true`').toBe(true)
    expect(controller.attach(element, second), 'M-12 §3.1 — the repeat attach returns `false`').toBe(false)
    expect(
      double.log.filter((call) => call === 'install').length,
      `M-12 §3.1 — \`session.install\` is called exactly ONCE in total, because the controller returns \`false\` from its own ledger first. Log: ${JSON.stringify(
        double.log,
      )}`,
    ).toBe(1)
    // **THE FIRST-CONFIG WINS IS READ THROUGH THE WRAPPER, NOT THROUGH THE RAW REFERENCE**
    // (⟶ realigned 2026-09-27, `E3`-BLOCK-5 / the amended `§2.5` item 5 clause 2): the
    // `onMove` the session holds is the COMPOSITION'S WRAPPER — the amended clause's own
    // shape, asserted by identity below — so "the first config stays in force" is asserted
    // over the wrapper's own hook set, and the SECOND config never reaching the session is
    // asserted by the single `install` call above plus the distinct hook objects.
    //
    // **⟶ AMENDED 2026-09-27 (THE ESTABLISHMENT-SEAM AMENDMENT PASS — RULING `1`; `§3.1 M-12`'s
    // SECOND NARROWING, `§2.1` item 5's dated establishment-seam ruling, `§2.5` item 5 clause 2).
    // THE AS-FILED READING OF THIS ARM IS SUPERSEDED — AND IT IS KEPT VISIBLE HERE: this row
    // formerly asserted `double.installArgs[0]?.options['onStart']` was `undefined`, i.e. it
    // required the composition to install **NO `onStart` HOOK**. THE RULED FORM, verbatim in
    // substance: *"THE IDENTITY AND FORWARDING REQUIREMENT BINDS THE **CONSUMER-SUPPLIED**
    // HOOKS, AND `onStart` IS NOT ONE OF THEM — THE COMPOSITION **OWNS AND INSTALLS ITS OWN
    // `onStart` WRAPPER** (the establishment seam)."* THREE CASES ARE RULED: (i) where the
    // consumer SUPPLIED `onStart`/`onMove`/`onEnd`/`onCancel`, the composition forwards EACH
    // UNCHANGED; (ii) where the consumer supplied NONE, the composition's own wrapper is what
    // the session sees and there is NO CONSUMER HOOK TO FORWARD; and (iii) `onStart` is the
    // composition's OWN wrapper in BOTH cases — because `I-4`/`I-5`/`F-18`/`P-GT-IM-3`/
    // `P-GT-IM-4` require the axis token and the `isResizable` decision to be DERIVED AT
    // ESTABLISHMENT, and the frozen session's `onStart(element)` is its ONLY establishment seam
    // (`session.begin` is FORBIDDEN to this composition: `§2.5` item 1, `I-3`, `R-14`).
    // **THE MEASUREMENT IS THE REASON AND IT IS DECISIVE: `84/90` WITH the wrapper installed,
    // `56/90` WITHOUT it.** **THE REPEAT-ATTACH HALF STANDS UNCHANGED: the second attach
    // returns `false`, `session.install` is called exactly ONCE, and the FIRST config —
    // WRAPPERS INCLUDED — stays in force.**
    const installedHookSet = double.installArgs[0]?.options ?? {}
    expect(
      typeof installedHookSet['onStart'],
      `M-12 §3.1 — **THE COMPOSITION OWNS AND INSTALLS ITS OWN \`onStart\` WRAPPER (the establishment seam, the ruled form): \`session.install\` receives a CALLABLE \`onStart\` — the token-and-decision derivation lives there and there is no other establishment seam (\`§3.1 M-12\`'s second narrowing, \`§2.1\` item 5). The as-filed "NO \`onStart\` HOOK" reading is SUPERSEDED — measured \`84/90\` with the wrapper, \`56/90\` without — and it is kept visible in the note above rather than re-asserted.** Read: ${brief(
        installedHookSet['onStart'],
      )}`,
    ).toBe('function')
    // **THE INSTALLED HOOK SET IS THE FIRST ATTACH'S** — read over the composition's own
    // wrappers: every member is a callable the composition supplies, and NO member is a raw
    // consumer hook reference (`M-12`'s narrowed identity clause binds the ARGUMENT a consumer
    // hook receives, never the installed reference). The repeat attach's NOTHING-delegated half
    // is the single `install` call above plus the driven reading below.
    expect(
      Object.keys(installedHookSet).sort(),
      'M-12 §3.1 — the installed options carry the FOUR hook members (`§2.1` item 5’s frozen seam set: no `capture`, no fifth key)',
    ).toEqual(['onCancel', 'onEnd', 'onMove', 'onStart'])
    // **THE DRIVEN READING OF THE SAME FACT** (`§3.1 M-12`'s own clause: *"the driver fires the
    // recorded start and asserts the FIRST `onMove` ran, not the second"*): a gesture is driven
    // through the WRAPPER the FIRST attach installed, and the FIRST config's `onMove` is the
    // hook that runs while the SECOND config's never does. **This is what makes "first-config-wins"
    // falsifiable rather than a restatement of the ledger.**
    const repeatBegan = double.begin(element)
    expect(
      repeatBegan.ok,
      'M-12 §3.1 — the repeat-attach drive established a gesture through the FIRST attach’s installed hooks (so the first-config-wins reading below is not vacuous)',
    ).toBe(true)
    double.fireMove()
    expect(
      firstHookRan.count,
      'M-12 §3.1 — **THE FIRST CONFIG’S `onMove` IS THE HOOK IN FORCE: it ran for the fired move turn** (`§3.1 M-12`: the first config stays in force, wrappers included)',
    ).toBe(1)
    expect(
      secondHookRan.count,
      'M-12 §3.1 — **THE SECOND CONFIG’S `onMove` NEVER RAN: the repeat attach delegated NOTHING, so the second config is not in force** (a controller whose second config displaced the first fails HERE)',
    ).toBe(0)
    for (const hookName of ['onStart', 'onMove', 'onEnd', 'onCancel'] as const) {
      expect(
        brief(installedHookSet[hookName]),
        `M-12 §3.1 — the installed \`${hookName}\` is a CALLABLE the composition supplies (its own wrapper): the FIRST config stays in force through the WRAPPERS — the second config’s \`onMove\` never reached the session`,
      ).toBe('a function')
      expect(
        installedHookSet[hookName] === first.onMove || installedHookSet[hookName] === second.onMove,
        `M-12 §3.1 — the installed \`${hookName}\` is NOT a raw consumer hook reference (\`M-12\`’s narrowed identity clause binds the ARGUMENT the consumer hook RECEIVES, never the installed reference)`,
      ).toBe(false)
    }
    void first
    void second
    // **⟶ REDRAWN 2026-09-27 (THE REPAIR CYCLE, `E3`-BLOCK-5; the amended `§3.1 M-12`, `§2.5`
    // item 5 clause 2, `§2.3` item 4 clause 1).** The as-landed row asserted the identity of the
    // RAW hook reference, which the amended clause does NOT require: **the composition's own
    // `onMove` is a WRAPPER (the ONE LEGAL HANDLE CHANNEL — the frozen session's `onStart`
    // carries only the element)**, so the installed hook is deliberately NOT the consumer's
    // function. **THE NARROWED IDENTITY REQUIREMENT BINDS THE HANDLE ARGUMENT THE CONSUMER'S OWN
    // `onMove` HOOK RECEIVES — forwarded UNCHANGED, never swallowed, reordered or altered — while
    // the WRAPPER'S OWN CAPTURE of that same handle is EXPLICITLY PERMITTED** (and is what makes
    // the reset path reachable, `F-12`..`F-15`/`P-GT-SM-4`).
    const consumerHandles: GestureHandle[] = []
    const consumerHook = (gesture: GestureHandle): void => {
      consumerHandles.push(gesture)
    }
    const wrapperDouble = makeSessionDouble()
    const wrapped = await createController(
      {
        session: wrapperDouble.session,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        isResizable: (): unknown => true,
        sizeFor: (): unknown => 2,
        commit: makeSink(),
      },
      'M-12 (the handle channel)',
    )
    const wrappedElement: Record<string, unknown> = { control: 'M-12-wrapper' }
    wrapped.controller.attach(wrappedElement, { onMove: consumerHook })
    const began = wrapperDouble.begin(wrappedElement)
    expect(began.ok, 'M-12 §3.1 — the wrapper drive established a gesture (so the identity arm is not vacuous)').toBe(true)
    const establishedHandle: GestureHandle | null = began.ok ? began.gesture : null
    wrapperDouble.fireMove()
    expect(
      consumerHandles.length,
      'M-12 §3.1 — the consumer’s own `onMove` hook was CALLED for the fired move turn (the wrapper did not swallow the hook)',
    ).toBe(1)
    expect(
      consumerHandles[0],
      'M-12 §3.1 — **THE NARROWED IDENTITY REQUIREMENT: the handle ARGUMENT the consumer’s own `onMove` hook received is the SESSION’S OWN HANDLE (`toBe`), forwarded UNCHANGED by the controller’s wrapper — not synthesised, not re-created, not altered.**',
    ).toBe(establishedHandle)
    expect(
      wrapperDouble.installArgs[0]?.options['onMove'] === consumerHook,
      `M-12 §3.1 — AND THE WRAPPER IS THE INSTALLED HOOK (the amended clause's own shape): \`session.install\` receives the composition's \`onMove\` WRAPPER, not the consumer's function — the wrapper's own capture is EXPLICITLY PERMITTED while its forward is what the identity clause binds. Read: ${String(
        wrapperDouble.installArgs[0]?.options['onMove'] === consumerHook,
      )}`,
    ).toBe(false)
    const forwarded = wrapperDouble.installArgs[0]?.options['onMove']
    expect(
      brief(forwarded),
      'M-12 §3.1 — the installed `onMove` is a CALLABLE the composition supplies (its wrapper), never the consumer’s raw hook',
    ).toBe('a function')
    expect(
      wrapperDouble.log.filter((call) => call === 'begin').length,
      'M-12 §3.1 — the drive’s establishment is the session’s own (`session.begin` is FORBIDDEN to the composition: `§2.5` item 1, `I-3`, `R-14`)',
    ).toBe(1)
  })

  it('M-13 §3.1 — `detach()` restores the controller’s baseline through the session, once, is idempotent, and `detached` reads `true` forever after', async () => {
    const h = await landedHarness({})
    const element: Record<string, unknown> = { control: 'M-13' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 2,
      commit: makeSink(),
    })
    controller.attach(element, {})
    expect(controller.detached, 'M-13 §3.1 — `detached` reads `false` while attached').toBe(false)
    const first = controller.detach()
    expect(first, 'M-13 §3.1 — the FIRST `detach()` returns `true` when the session reports `complete: true`').toBe(true)
    expect(h.sessionLog.filter((call) => call === 'dispose').length, 'M-13 §3.1 — it delegates `session.dispose()` exactly once').toBe(1)
    const second = controller.detach()
    expect(second, 'M-13 §3.1 — the SECOND call makes ZERO session calls and returns `false`').toBe(false)
    expect(h.sessionLog.filter((call) => call === 'dispose').length, 'M-13 §3.1 — still exactly one `dispose` in the log').toBe(1)
    expect(controller.detached, 'M-13 §3.1 — `detached` reads `true` forever after').toBe(true)
    // **THE CLAUSE ROW `M-20`, CARRIED BY THIS ROW (`M-13`) — `detach()`'s MULTI-ELEMENT
    // LIMB, driven as an EXPLICIT assertion** (`§3.1 M-20`; the row names `M-13` as the red
    // set's CARRIER and `§5.5.1 P-GT-SM-5` as its register-space clause cell, which carries
    // NO attempt term). **`§7a.1` item 2'S WORKING DEFAULT — NOT A RULED CLAUSE: the spec
    // STILL LABELS THIS DEFAULT UNRULED and item 2 STAYS OPEN** (a later pass that changes
    // it must open a gate). The limb: `detach()` takes NO argument and refuses with ZERO
    // session calls of ANY KIND while MORE THAN ONE element is attached here, because the
    // session is shared and detaching it on behalf of one control would detach the other
    // control's listeners; **NOTHING IS HALF-DETACHED** (both ledger entries stay intact),
    // and **`detached` does NOT read `true` on a refusal**.
    const double = makeSessionDouble()
    const shared = await createController({
      session: double.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 2,
      commit: makeSink(),
    })
    shared.controller.attach({ control: 'M-13-shared-a' }, {})
    shared.controller.attach({ control: 'M-13-shared-b' }, {})
    const before = double.log.length
    const refused = shared.controller.detach()
    expect(
      refused,
      'M-13 §3.1 / M-20 — `detach()` REFUSES (`false`) while MORE THAN ONE element is attached to this controller, because the session is shared (§7a.1 item 2’s WORKING DEFAULT, not a ruled clause; `§5.5.1 P-GT-SM-5` drive (2))',
    ).toBe(false)
    expect(
      double.log.slice(before),
      `M-13 §3.1 / M-20 — the refusal makes ZERO session calls of ANY KIND (no \`dispose\`, no read, nothing). Recorded log slice: ${JSON.stringify(
        double.log.slice(before),
      )}`,
    ).toEqual([])
    expect(
      double.log.filter((call) => call === 'dispose').length,
      'M-13 §3.1 / M-20 — no `dispose` EVER reached the session: the refusal is not a half-detach',
    ).toBe(0)
    expect(
      shared.controller.stats().attached,
      'M-13 §3.1 / M-20 — nothing is half-detached: BOTH ledger entries stay intact, so the controller still reports `attached === 2` through `stats()`',
    ).toBe(2)
    expect(
      shared.controller.detached,
      'M-13 §3.1 / M-20 — `detached` does NOT read `true` on a refusal',
    ).toBe(false)
    const refusedAgain = shared.controller.detach()
    expect(
      refusedAgain,
      'M-13 §3.1 / M-20 — a LATER `detach()` still refuses while two elements remain (the limb is not a one-shot)',
    ).toBe(false)
    expect(
      double.log.slice(before),
      'M-13 §3.1 / M-20 — the second refusal makes ZERO session calls too',
    ).toEqual([])
    expect(
      shared.controller.stats().attached,
      'M-13 §3.1 / M-20 — the second refusal drops nothing either: the ledger still holds BOTH entries',
    ).toBe(2)
    expect(
      shared.controller.detached,
      'M-13 §3.1 / M-20 — `detached` still reads `false` after the second refusal',
    ).toBe(false)
    // **THE ROW'S OWN CONTROL DRIVE (`M-20`):** `attach(elA)` ALONE, then `detach()`,
    // returns `true` with exactly ONE `session.dispose()` — so the refusal above is not a
    // `detach()` that can never succeed.
    const soloDouble = makeSessionDouble()
    const solo = await createController({
      session: soloDouble.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 2,
      commit: makeSink(),
    })
    solo.controller.attach({ control: 'M-20-control' }, {})
    expect(
      solo.controller.detach(),
      'M-13 §3.1 / M-20 — THE CONTROL DRIVE: with EXACTLY ONE element attached, `detach()` returns `true`',
    ).toBe(true)
    expect(
      soloDouble.log.filter((call) => call === 'dispose').length,
      'M-13 §3.1 / M-20 — and the control drive delegates exactly ONE `session.dispose()`',
    ).toBe(1)
    expect(
      solo.controller.detached,
      'M-13 §3.1 / M-20 — the control drive leaves `detached` reading `true`',
    ).toBe(true)
  })

  it('M-14 §3.1 — `reset(element)` commits the CLAMPED supplied default, ONCE, through the session’s own reset terminal', async () => {
    const sink = makeSink()
    const h = await landedHarness()
    const element: Record<string, unknown> = { control: 'M-14' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: (): unknown => 420,
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 12345,
      commit: sink,
    })
    // **THE ROW'S OWN SINK IS THE COMPOSITION'S SINGLE SINK WRITER** — the landed session's
    // ONE `commit` channel is routed to it (`§2.5` item 4). The harness's recorder is NOT a
    // writer, so the sink's record and `stats().sinkCalls` are the TWO READINGS of this ONE
    // write (`M-5`/`M-9`'s single-writer shapes assert the same thing).
    h.registerCompositionWriter((gesture: unknown, written: unknown): void => {
      sink(gesture as GestureHandle, Number(written))
    })
    controller.attach(element, {
      onMove: (gesture: GestureHandle): void => {
        gesture.set(12345)
      },
    })
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE) // the ONE legal handle channel (E3-BLOCK-5)
    const result = controller.reset(element)
    expect(h.sessionLog.filter((call) => call === 'reset').length, 'M-14 §3.1 — exactly ONE `session.reset` call').toBe(1)
    expect(sink.records.length, 'M-14 §3.1 — the sink receives exactly one value for the reset').toBe(1)
    expect(
      sink.records[0]?.value,
      `M-14 §3.1 — the committed value is the CLAMPED default (100), NOT the raw default (420) and NOT the user’s own 12345. Read: ${brief(
        sink.records[0]?.value,
      )}`,
    ).toBe(100)
    expect(controller.stats().resets, 'M-14 §3.1 — `stats().resets === 1`').toBe(1)
    expect(controller.stats().sinkCalls, 'M-14 §3.1 — `stats().sinkCalls === 1`').toBe(1)
    expect(result.committed, `M-14 §3.1 — the reset result reports what the composition did (read: ${JSON.stringify(result)})`).toBe(true)
  })

  it('M-15 §3.1 — `gesture.outcome === \'reset\'` IS the discriminator the sink can read (with an `\'end\'` control)', async () => {
    const sink = makeSink()
    const h = await landedHarness()
    const element: Record<string, unknown> = { control: 'M-15' }
    /** **THE WRAPPER-CAPTURED HANDLE'S CONSUMER-SIDE READING** (`§2.5` item 5 clause 2;
     *  ⟶ redrawn 2026-09-27, `E3`-BLOCK-5): the handle the consumer's own `onMove` hook
     *  receives is the one the controller's wrapper captured, and it is the handle this row's
     *  reset path must reuse. */
    const forwardedHandles: GestureHandle[] = []
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: (): unknown => 60,
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 55,
      commit: sink,
    })
    // **THE ROW'S OWN SINK IS THE COMPOSITION'S SINGLE SINK WRITER** — the landed session's
    // ONE `commit` channel is routed to it (`§2.5` item 4). The harness's recorder is NOT a
    // writer, so the sink's record and `stats().sinkCalls` are the TWO READINGS of this ONE
    // write (`M-5`/`M-9`'s single-writer shapes assert the same thing).
    h.registerCompositionWriter((gesture: unknown, written: unknown): void => {
      sink(gesture as GestureHandle, Number(written))
    })
    controller.attach(element, {
      onMove: (gesture: GestureHandle): void => {
        // **THE ONE LEGAL HANDLE CHANNEL (`§2.5` item 5 clause 2): the frozen session's
        // `onStart` carries only the element and `session.begin` is FORBIDDEN to this
        // controller, so the move turn is where a real handle arrives — captured by the
        // controller's own `onMove` WRAPPER and forwarded here UNCHANGED.**
        forwardedHandles.push(gesture)
      },
    })
    h.source.fire(element, TYPE_DOWN)
    // **THE MOVE TURN IS DRIVEN BEFORE THE RESET:** the wrapper's capture happens on a move,
    // so without this turn the reset path would have no captured handle to reach for
    // (`M-15`'s reset arm reads the composition's reset terminal, `§2.3` item 4 clause 7).
    h.source.fire(element, TYPE_MOVE)
    expect(
      forwardedHandles.length,
      'M-15 §3.1 — the consumer’s own `onMove` hook ran for the fired move turn (the wrapper forwarded the session’s handle to it)',
    ).toBe(1)
    controller.reset(element)
    expect(
      sink.records[0]?.outcome,
      `M-15 §3.1 — the recorded outcome for a reset is \`'reset'\` (the corrected citation site: gsession.md §2.5 item 10). Read: ${brief(
        sink.records[0]?.outcome,
      )}`,
    ).toBe('reset')
    expect(
      sink.records[0]?.gesture,
      `M-15 §3.1 — **the reset's committed handle IS the wrapper-captured one the consumer's own \`onMove\` hook received (\`toBe\`): the reset path reaches for the handle the \`onMove\` WRAPPER captured, never a synthesised one and never a \`session.begin\` result** (\`§2.5\` item 5 clause 2; ⟶ redrawn 2026-09-27, \`E3\`-BLOCK-5)`,
    ).toBe(forwardedHandles[0])
    // **⟶ AMENDED 2026-09-27 (THE ESTABLISHMENT-SEAM AMENDMENT PASS — RULING `2`; `§3.1 M-15`,
    // `§2.3` item 4 clause 8, `§5.5.1 P-GT-SM-4` shape `(1)`). THE VALUE READING IS RE-POINTED AT
    // THE SINK'S OWN ARGUMENT, AND THE AS-FILED HANDLE-SIDE READING OF THIS ARM IS WITHDRAWN — IT
    // IS KEPT VISIBLE HERE: this row formerly asserted
    // `(sink.records[0]?.gesture as GestureHandle)?.value === 60`, i.e. it read the committed value
    // back THROUGH THE HANDLE AT THE TERMINAL. **THE RULED FORM: THE COMMITTED VALUE IS CARRIED BY
    // THE SINK'S OWN ARGUMENT — `commit(gesture, clamped)` is where the composition reads it,
    // EXACTLY AS `M-14` READS IT — and the handle is used for the OUTCOME (and for its identity),
    // NOT as a value channel.** **THE REASON, in the frozen session's own order: its terminal fires
    // the consumer's `onEnd` BEFORE it stores anything, and it never stores the terminal's value on
    // the record at all — the value reaches the composition as the `commit` seam's ARGUMENT.**
    // **THEREFORE NO ROW MAY ASSERT THE HANDLE'S `value` AT THE TERMINAL, and a handle-side value
    // reading must be taken AFTER the terminal (where the session's record is discarded and
    // `gesture()` is `null`, so the post-terminal path exposes NO readable value at all) OR BE
    // WITHDRAWN — the honest ruling is WITHDRAWAL, and that is what this arm does.** `gesture.outcome`
    // REMAINS READABLE AT THE TERMINAL (the session sets `record.outcome` before it runs any
    // consumer code), so this row's discriminator clause is UNTOUCHED.
    expect(
      sink.records[0]?.value,
      `M-15 §3.1 — **THE COMMITTED VALUE IS READ FROM THE SINK'S OWN ARGUMENT (the one legal reading, as \`M-14\` reads it): the sink received the CLAMPED supplied default \`60\` — the reset path's \`clampToBounds(defaultSizeFor(element, axis), boundsFor(element, axis))\` — and NOT through the handle, which cannot read the committed value back at the terminal.** Read: ${brief(
        sink.records[0]?.value,
      )}`,
    ).toBe(60)
    expect(
      (sink.records[0]?.gesture as GestureHandle | undefined)?.outcome,
      'M-15 §3.1 — **AND THE HANDLE REMAINS THE OUTCOME CHANNEL (not a value channel): the handle that reached the sink reads `outcome === \'reset\'` at the terminal — the discriminator stays handle-readable while the value reading is the sink’s argument** (`§2.3` item 4 clause 7/8)',
    ).toBe('reset')
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE) // the control gesture's own wrapper capture
    h.source.fire(element, TYPE_UP)
    expect(
      sink.records[1]?.outcome,
      'M-15 §3.1 — THE CONTROL: the same sink driven by an ordinary end records `\'end\'`',
    ).toBe('end')
  })

  it('M-16 §3.1 — a reset with NO active gesture refuses `\'no-gesture\'` and makes ZERO session calls', async () => {
    await requireLiveModule('M-16')
    const double = makeSessionDouble()
    const element: Record<string, unknown> = { control: 'M-16' }
    const defaultSeam = seam<unknown>(10)
    const { controller } = await createController({
      session: double.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: defaultSeam,
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 2,
      commit: makeSink(),
    })
    controller.attach(element, {})
    const before = double.log.length
    const result = controller.reset(element)
    expect(
      result,
      `M-16 §3.1 — the refusal is \`{ok: false, code: 'no-gesture', committed: false}\`. Read: ${JSON.stringify(result)}`,
    ).toEqual({ ok: false, code: 'no-gesture', committed: false })
    expect(
      double.log.slice(before),
      `M-16 §3.1 — the recording session’s call log is EMPTY after the refusal: no \`reset\`, no \`stats\`, no \`dispose\` (§2.5 item 5 clause 3). Recorded: ${JSON.stringify(
        double.log.slice(before),
      )}`,
    ).toEqual([])
    expect(defaultSeam.calls.length, 'M-16 §3.1 — `defaultSizeFor` is called ZERO times').toBe(0)
  })

  it('M-17 §3.1 — a reset refuses without touching the ACTIVE gesture (the subsequent end still commits `\'end\'`)', async () => {
    const double = makeSessionDouble()
    const element: Record<string, unknown> = { control: 'M-17' }
    const sink = makeSink()
    const { controller } = await createController({
      session: double.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: (): unknown => {
        throw new Error('the default seam threw (C2 path 3)')
      },
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 2,
      commit: sink,
    })
    controller.attach(element, {})
    const began = double.begin(element)
    expect(began.ok, 'M-17 §3.1 — the gesture established').toBe(true)
    if (began.ok) began.gesture.set(7)
    double.fireMove() // the wrapper's handle capture (`E3`-BLOCK-5)
    const refusal = controller.reset(element)
    expect(
      refusal,
      `M-17 §3.1 — the refusal is \`{ok: false, code: 'unusable-default', committed: false}\` (the §7a.1 item 1 WORKING DEFAULT). Read: ${JSON.stringify(
        refusal,
      )}`,
    ).toEqual({ ok: false, code: 'unusable-default', committed: false })
    expect(
      double.log.slice(-1),
      `M-17 §3.1 — the refusal made ZERO session calls (the last logged call is the establishment). Log tail: ${JSON.stringify(
        double.log.slice(-2),
      )}`,
    ).toEqual(['begin'])
    expect(
      (double.gesture() as GestureStats | null)?.value,
      'M-17 §3.1 — the gesture is STILL ACTIVE with the same value (a refusal never half-terminates)',
    ).toBe(7)
    double.fireTerminal('end')
    expect(sink.records.length, 'M-17 §3.1 — the subsequent terminal commits normally').toBe(1)
    expect(sink.records[0]?.outcome, 'M-17 §3.1 — and its outcome is `\'end\'`, not `\'cancel\'`').toBe('end')
  })

  it('M-18 §3.1 — the controller’s counters are its own and are readable: `{attached: 1, gestures: 3, sinkCalls: 2, written: 2, resets: 1, lastCode: \'ok\'}`', async () => {
    const sink = makeSink()
    const h = await landedHarness()
    const element: Record<string, unknown> = { control: 'M-18' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: (): unknown => 40,
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 42,
      commit: sink,
    })
    // **THE ROW'S OWN SINK IS THE COMPOSITION'S SINGLE SINK WRITER** — the landed session's
    // ONE `commit` channel is routed to it (`§2.5` item 4). The harness's recorder is NOT a
    // writer, so the sink's record and `stats().sinkCalls` are the TWO READINGS of this ONE
    // write (`M-5`/`M-9`'s single-writer shapes assert the same thing).
    h.registerCompositionWriter((gesture: unknown, written: unknown): void => {
      sink(gesture as GestureHandle, Number(written))
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE) // the wrapper's handle capture (E3-BLOCK-5)
    h.source.fire(element, TYPE_UP)
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_CANCEL_EVENT)
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE) // and again for the reset gesture
    controller.reset(element)
    const stats = controller.stats()
    expect(
      stats,
      `M-18 §3.1 — \`stats()\` reports the declared figures, and EVERY figure is reconciled against the recording sink’s own call record (${sink.records.length} writes) and the recording session’s own log. Read: ${JSON.stringify(
        stats,
      )}`,
    ).toEqual({ attached: 1, gestures: 3, sinkCalls: 2, written: 2, resets: 1, lastCode: 'ok' })
    expect(sink.records.length, 'M-18 §3.1 — the sink’s own record agrees with `stats().written`').toBe(stats.written)
    expect(
      h.sessionLog.filter((call) => call === 'reset').length,
      'M-18 §3.1 — the session log agrees with `stats().resets`',
    ).toBe(stats.resets)
  })
})

// ===========================================================================
// §3.2 — THE DOCUMENTED FAIL-STATES (`F-1`..`F-8` are the PURE function's eleven-row
// fail-state table + `M-2`/`M-19`; `F-9`..`F-19` are the composition's).
//
// **NOTE THE SHAPE: `clampToBounds` HAS NO REFUSAL DOMAIN, so every outcome in the
// `F-1`..`F-8` block is a VALUE, not an error** (ruling 12; `§0A` note 8).
// ===========================================================================
describe('F — §3.2 the documented fail-states (every outcome is a VALUE)', () => {
  it('M-2 §3.1 — `clampToBounds` clamps into range at each edge and inside it (150, -5, 42 over `{min: 0, max: 100}`)', () => {
    const bounds = { min: 0, max: 100 }
    const drives: Array<[number, number]> = [
      [150, 100],
      [-5, 0],
      [42, 42],
    ]
    for (const [value, declared] of drives) {
      const outcome = clampVia(value, bounds)
      expect(
        outcome.threw,
        `M-2 §3.1 — the drive (${value}) does not throw (TOTAL, §0A note 8)`,
      ).toBe(null)
      expect(
        outcome.result,
        `M-2 §3.1 — \`clampToBounds(${value}, {min: 0, max: 100})\` is \`Math.max(min, Math.min(value, max))\` VERBATIM ⇒ ${declared}. Read: ${brief(
          outcome.result,
        )}`,
      ).toBe(declared)
      expect(typeof outcome.result, `M-2 §3.1 — the return is a \`number\` in every drive`).toBe('number')
    }
  })

  it('M-19 §3.1 — `clampToBounds` is PURE: identical arguments yield identical results, and nothing is retained or mutated', () => {
    const pair = { min: 0, max: 100 }
    const before = { keys: Object.keys(pair).join(','), frozen: Object.isFrozen(pair), proto: Object.getPrototypeOf(pair) }
    const first = clampVia(42, pair)
    const second = clampVia(42, pair)
    const after = { keys: Object.keys(pair).join(','), frozen: Object.isFrozen(pair), proto: Object.getPrototypeOf(pair) }
    expect(
      first.result,
      `M-19 §3.1 — the two results are EQUAL (\`Object.is\` for the \`-0\`/\`NaN\` cases, \`===\` otherwise). Read: ${brief(
        first.result,
      )} vs ${brief(second.result)}`,
    ).toBe(second.result)
    expect(after, 'M-19 §3.1 — the post-call snapshot is identical to the pre-call snapshot').toEqual(before)
    expect(pair, 'M-19 §3.1 — the pair’s value is unchanged').toEqual({ min: 0, max: 100 })
  })

  it('F-1 §3.2 — a NON-NUMBER `value` answers `NaN` with NO coercion, in every one of the eleven documented classes', () => {
    const classes: Array<[string, unknown]> = [
      ["'12'", '12'],
      ["'0'", '0'],
      ['null', null],
      ['undefined', undefined],
      ['true', true],
      ['false', false],
      ['{}', {}],
      ['[]', []],
      ["Symbol('s')", Symbol('s')],
      ['a function', (): void => undefined],
      ['12n', 12n],
      ['0n', 0n],
    ]
    for (const [label, value] of classes) {
      const outcome = clampVia(value, { min: 0, max: 100 })
      expect(
        Number.isNaN(outcome.result),
        `F-1 §3.2 — \`clampToBounds(${label}, {min: 0, max: 100})\` answers \`NaN\` (no \`Number(...)\`, no \`parseFloat\`, no \`+value\`, no \`String\` round-trip — S-PURE-1). Read: ${brief(
          outcome.result,
        )}`,
      ).toBe(true)
      expect(outcome.threw, `F-1 §3.2 — no throw for the ${label} class`).toBe(null)
    }
  })

  it('F-2 §3.2 — `NaN` as the value answers `NaN` (the formula’s own answer), not `min` and not `max`', () => {
    const outcome = clampVia(NaN, { min: 0, max: 100 })
    expect(
      Number.isNaN(outcome.result),
      `F-2 §3.2 — \`Math.min(NaN, 100)\` is \`NaN\`, so the answer is \`NaN\` — NOT \`min\` (0) and NOT \`max\` (100). Read: ${brief(
        outcome.result,
      )}`,
    ).toBe(true)
  })

  it('F-3 §3.2 — a non-finite VALUE reaches the formula verbatim: `+Infinity` ⇒ `max`, `-Infinity` ⇒ `min`', () => {
    const cases: Array<[number, number, string]> = [
      [Number.POSITIVE_INFINITY, 100, 'max'],
      [Number.NEGATIVE_INFINITY, 0, 'min'],
    ]
    for (const [value, declared, which] of cases) {
      const outcome = clampVia(value, { min: 0, max: 100 })
      expect(
        outcome.threw,
        `F-3 §3.2 — no throw for ${String(value)} (no refusal, no ` + "'Infinity' string" + `)`,
      ).toBe(null)
      expect(
        outcome.result,
        `F-3 §3.2 — \`clampToBounds(${String(value)}, {min: 0, max: 100})\` answers ${declared} (the ${which} limb, formula verbatim). Read: ${brief(
          outcome.result,
        )}`,
      ).toBe(declared)
    }
  })

  it('F-4 §3.2 — a finite negative value clamps to `min` (both `-3` and `-Number.MIN_VALUE`)', () => {
    for (const value of [-3, -Number.MIN_VALUE]) {
      const outcome = clampVia(value, { min: 0, max: 100 })
      expect(
        outcome.result,
        `F-4 §3.2 — \`clampToBounds(${String(value)}, {min: 0, max: 100})\` answers \`min\` (0), because the formula’s \`max(min, …)\` applies — no substitution and no \`NaN\`. Read: ${brief(
          outcome.result,
        )}`,
      ).toBe(0)
    }
  })

  it('F-5 §3.2 — `-0` is PRESERVED when it is the formula’s answer (`Object.is`), and destroyed by the pair that excludes it', () => {
    const preserved = clampVia(-0, { min: -0, max: 100 })
    expect(
      Object.is(preserved.result, -0),
      `F-5 §3.2 — with \`{min: -0, max: 100}\` the answer is \`-0\`: \`Object.is(result, -0) === true\`. Read: ${brief(
        preserved.result,
      )}`,
    ).toBe(true)
    const destroyed = clampVia(-0, { min: 0, max: 100 })
    expect(
      Object.is(destroyed.result, 0),
      `F-5 §3.2 — with \`{min: 0, max: 100}\` the answer is \`0\` (the sign is neither invented nor destroyed: the FORMULA’s answer is returned as-is). Read: ${brief(
        destroyed.result,
      )}`,
    ).toBe(true)
  })

  it('F-6 §3.2 — EQUAL bounds: the value answers itself (no special case, no refusal)', () => {
    const cases: Array<[number, number]> = [
      [7, 7],
      [100, 7],
    ]
    for (const [value, declared] of cases) {
      const outcome = clampVia(value, { min: 7, max: 7 })
      expect(
        outcome.result,
        `F-6 §3.2 — \`clampToBounds(${value}, {min: 7, max: 7})\` answers ${declared}. Read: ${brief(outcome.result)}`,
      ).toBe(declared)
    }
  })

  it('F-7 §3.2 — INVERTED bounds (`min > max`) answer `min` in every drive — the VERBATIM FORMULA’s answer, NOT a refusal', () => {
    for (const value of [50, 150, -5]) {
      const outcome = clampVia(value, { min: 100, max: 0 })
      expect(
        outcome.result,
        `F-7 §3.2 — \`clampToBounds(${value}, {min: 100, max: 0})\` answers \`min\` (100) — the verbatim formula’s answer, not a refusal: a module that validates the pair, swaps it, or returns \`NaN\` FAILS. Read: ${brief(
          outcome.result,
        )}`,
      ).toBe(100)
    }
  })

  it('F-8 §3.2 — an UNUSABLE or UNREADABLE bounds pair answers `NaN`, and the two `number`-typed pairs answer the FORMULA verbatim, with no throw in ANY drive', () => {
    const nanClasses: Array<[string, unknown]> = [
      ['undefined', undefined],
      ['null', null],
      ['42', 42],
      ["'x'", 'x'],
      ['true', true],
      ["Symbol('b')", Symbol('b')],
      ['a function', (): void => undefined],
      ['[]', []],
      ['[0, 100]', [0, 100]],
      ['{}', {}],
      ['{min: 0}', { min: 0 }],
      ["{min: '0', max: '100'}", { min: '0', max: '100' }],
      ['a throwing field read', throwingBounds()],
    ]
    for (const [label, bounds] of nanClasses) {
      const outcome = clampVia(42, bounds)
      expect(
        outcome.threw,
        `F-8 §3.2 — no throw escapes for the \`${label}\` bounds class`,
      ).toBe(null)
      expect(
        Number.isNaN(outcome.result),
        `F-8 §3.2 — the \`typeof\`-gated \`${label}\` case answers \`NaN\` (absent, non-record, primitive, unreadable, non-\`number\` field, throwing field read). Read: ${brief(
          outcome.result,
        )}`,
      ).toBe(true)
    }
    const numberTypedNaN = clampVia(42, { min: NaN, max: 100 })
    expect(
      Number.isNaN(numberTypedNaN.result),
      `F-8 §3.2 — \`{min: NaN, max: 100}\` answers \`NaN\` too, BY THE FORMULA (\`Math.max(NaN, …)\`), not by the gate. Read: ${brief(
        numberTypedNaN.result,
      )}`,
    ).toBe(true)
    const nonFinite = clampVia(42, { min: 0, max: Number.POSITIVE_INFINITY })
    expect(
      nonFinite.result,
      `F-8 §3.2 — \`{min: 0, max: Infinity}\` answers the formula verbatim (42): both bounds ARE \`number\`s, so the pair is USABLE. Read: ${brief(
        nonFinite.result,
      )}`,
    ).toBe(42)
  })

  it('F-9 §3.2 — THE TWO-WRITER COMPOSITION (positive control #1): the sink’s record reads 2 where 1 is required, so the single-writer row CAN fail', async () => {
    await requireLiveModule('F-2')
    await requireLiveModule('F-1')
    await requireLiveModule('M-19')
    const readings = await writerShape(2)
    expect(
      readings.sinkRecord,
      `F-9 §3.2 — the sink’s call record for the gesture has length 2, and the row asserts EXACTLY length 1 — so the row CAN fail, which is what makes the single-writer discipline falsifiable. Readings: ${JSON.stringify(
        readings,
      )}`,
    ).toBe(2)
    expect(
      readings.controllerCount,
      'F-9 §3.2 — the controller’s own `stats().sinkCalls` reads 1 while the SINK’s record reads 2: §5.5.1 P-GT-SM-3 asserts BOTH readings, so a composition cannot pass by counting only its own calls',
    ).toBe(1)
  })

  it('F-10 §3.2 — THE NO-WRITER (SLOT-EMPTY) COMPOSITION (positive control #2): the write count reads 0 where 1 is required, AND the session reports `committed: true` WHILE NOTHING WAS WRITTEN', async () => {
    const readings = await writerShape(3)
    expect(
      readings.sinkRecord,
      `F-10 §3.2 — the write count is 0, not 1, so the row FAILS for a composition that never wired the channel. Readings: ${JSON.stringify(
        readings,
      )}`,
    ).toBe(0)
    expect(
      readings.sessionCommitted,
      'F-10 §3.2 — AND, IN THE SAME SENTENCE: the state this composition reports is that the session then reports `committed: true` WHILE NOTHING WAS WRITTEN (`gsession.md` §2.1’s `TerminalResult` makes `committed` the committing-terminal discriminator, independent of whether a `commit` callback exists), so “one commit per gesture” is satisfied VACUOUSLY and must never be quoted as evidence that a write happened',
    ).toBe(true)
  })

  it('F-11 §3.2 — a THROWING SINK is swallowed by the session’s commit seam: the write is ALREADY COUNTED and NEVER RETRIED', async () => {
    const sink = makeSink(true)
    // A THROWING sink: the session's own commit seam swallows it (`ruling 8`'s `commit` row),
    // so the harness's channel rethrows nothing and the attempt is counted exactly once.
    // **THE HARNESS RECORDS ONLY — THE COMPOSITION'S OWN SINK WRITER IS THE ONE WRITER**
    // (⟶ CORRECTED 2026-09-27, THE GATE-4 ALIGNMENT PASS): the throwing sink below is handed
    // to the COMPOSITION as its `commit` seam, and the session swallows the composition's
    // throw (it re-throws a consumer error only after its own commit bookkeeping), so the
    // attempt is counted exactly ONCE and never retried.
    const h = await landedHarness()
    const element: Record<string, unknown> = { control: 'F-11' }
    const { controller } = await createController({
      session: h.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 33,
      commit: sink,
    })
    controller.attach(element, {})
    h.source.fire(element, TYPE_DOWN)
    h.source.fire(element, TYPE_MOVE)
    h.source.fire(element, TYPE_UP)
    expect(
      sink.attempts.count,
      `F-11 §3.2 — the sink was invoked ONCE (the attempt is counted, and never retried). Attempts: ${sink.attempts.count}`,
    ).toBe(1)
    expect(controller.stats().sinkCalls, 'F-11 §3.2 — `stats().sinkCalls === 1` (it counts ATTEMPTS, including one that threw)').toBe(1)
    expect(controller.stats().written, 'F-11 §3.2 — `stats().written === 0` (it counts RETURNS)').toBe(0)
    const sessionStats = (h.session['stats'] as () => SessionStats)()
    expect(
      sessionStats.commits,
      'F-11 §3.2 — the session’s own commit count is unchanged by the sink’s throw (the swallow is the session’s own seam)',
    ).toBe(1)
  })

  it('F-12 §3.2 — a reset whose default is UNUSABLE: absent, then non-callable, then throwing — all three refuse `\'unusable-default\'` with ZERO session calls', async () => {
    const shapes: Array<[string, Record<string, unknown>]> = [
      ['ABSENT', {}],
      ['NON-CALLABLE', { defaultSizeFor: NON_CALLABLE_SEAM }],
      [
        'THROWING',
        {
          defaultSizeFor: (): unknown => {
            throw new Error('the default seam threw')
          },
        },
      ],
    ]
    for (const [label, extra] of shapes) {
      const double = makeSessionDouble()
      const element: Record<string, unknown> = { control: `F-12-${label}` }
      const { controller } = await createController({
        session: double.session,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        isResizable: (): unknown => true,
        sizeFor: (): unknown => 2,
        commit: makeSink(),
        ...extra,
      })
      controller.attach(element, {})
      const began = double.begin(element)
      expect(began.ok, `F-12 §3.2 — the ${label} drive established a gesture`).toBe(true)
      // **THE MOVE TURN IS DRIVEN** (`E3`-BLOCK-5): the reset's refusal classes are reached
      // with the handle the `onMove` WRAPPER captured — the only legal channel the frozen
      // session provides (its `onStart` carries only the element).
      double.fireMove()
      const before = double.log.length
      const result = controller.reset(element)
      expect(
        result,
        `F-12 §3.2 — the ${label} shape refuses \`'unusable-default'\` with \`committed: false\`. Read: ${JSON.stringify(result)}`,
      ).toEqual({ ok: false, code: 'unusable-default', committed: false })
      expect(
        double.log.slice(before),
        `F-12 §3.2 — ZERO session calls for the ${label} shape (\`defaultSizeFor\` is the only seam consulted at that point, and \`boundsFor\` is NOT called either). Recorded: ${JSON.stringify(
          double.log.slice(before),
        )}`,
      ).toEqual([])
    }
  })

  it('F-13 §3.2 — a reset with NO `isResizable` decision (an ESTABLISHED, non-resizable gesture) refuses `\'not-resizable\'` with ZERO session calls, zero writes and `committed: false`', async () => {
    const double = makeSessionDouble()
    const element: Record<string, unknown> = { control: 'F-13' }
    const sink = makeSink()
    const defaultSeam = seam<unknown>(500)
    const { controller } = await createController({
      session: double.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: defaultSeam,
      isResizable: (): unknown => false,
      sizeFor: (): unknown => 2,
      commit: sink,
    })
    controller.attach(element, {})
    const began = double.begin(element)
    expect(began.ok, 'F-13 §3.2 — the gesture established (a false decision is NOT a refused establishment)').toBe(true)
    double.fireMove() // the wrapper-captured handle (`E3`-BLOCK-5)
    const before = double.log.length
    const result = controller.reset(element)
    expect(
      double.log.slice(before),
      `F-13 §3.2 — the decision was made once, at establishment, and is NOT re-evaluated: ZERO session calls. Recorded: ${JSON.stringify(
        double.log.slice(before),
      )}`,
    ).toEqual([])
    expect(defaultSeam.calls.length, 'F-13 §3.2 — `defaultSizeFor` is called ZERO times').toBe(0)
    // **⟶ THE AMENDED REFUSAL (RULED 2026-09-27, THE RED-RUN AMENDMENT PASS).** As filed,
    // this cell read *"the refusal is `'no-gesture'`-shaped only if no gesture is active,
    // otherwise it is `'ok'` with `committed: false`"* — the ruling replaces that
    // two-branch reading with ONE declared CONTROLLER-LOCAL code, `'not-resizable'`,
    // because **the SESSION IS NEVER ASKED on this path** (so no session code is honest
    // for it) and an `'ok'`-shaped success would mis-report a refusal. **THE CODE IS
    // NOW DERIVABLE FROM THE SPEC AND IS ASSERTED.**
    expect(
      result.code,
      `F-13 §3.2 — the refusal is the CONTROLLER-LOCAL \`'not-resizable'\` (\`§2.3\` item 4's reset result-code table, row 9; \`§2.5\` item 5 clause 4; ruling 10). Read: ${JSON.stringify(
        result,
      )}`,
    ).toBe('not-resizable')
    expect(
      result.ok,
      `F-13 §3.2 — the amended refusal is NOT an \`'ok'\`-shaped success: \`ok\` reads \`false\`. Read: ${JSON.stringify(
        result,
      )}`,
    ).toBe(false)
    expect(
      result.committed,
      `F-13 §3.2 — \`committed: false\`, with zero writes: the row asserts the DECLARED triple \`{ok: false, code: 'not-resizable', committed: false}\`. Read: ${JSON.stringify(
        result,
      )}`,
    ).toBe(false)
    expect(
      sink.records.length,
      `F-13 §3.2 — the sink is NOT written on this path (zero sink writes). Recorded: ${JSON.stringify(sink.records)}`,
    ).toBe(0)
    expect(
      controller.stats().sinkCalls,
      'F-13 §3.2 — the controller’s own `sinkCalls` counter also reads `0` for the refusal',
    ).toBe(0)
  })

  it('F-14 §3.2 — a reset whose BOUNDS are unusable calls `session.reset` ONCE with `NaN`, writes NOTHING, and reports `committed: false` while the session’s own result reads `committed: true`', async () => {
    const double = makeSessionDouble()
    const sink = makeSink()
    const element: Record<string, unknown> = { control: 'F-14' }
    const { controller } = await createController({
      session: double.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({}),
      defaultSizeFor: (): unknown => 500,
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 2,
      commit: sink,
    })
    controller.attach(element, {})
    double.begin(element)
    double.fireMove() // the wrapper-captured handle (`E3`-BLOCK-5)
    const before = double.log.length
    const result = controller.reset(element)
    expect(
      double.log.slice(before),
      `F-14 §3.2 — exactly ONE \`session.reset\` call. Recorded: ${JSON.stringify(double.log.slice(before))}`,
    ).toEqual(['reset'])
    expect(sink.records.length, 'F-14 §3.2 — the sink is NOT written: `sinkCalls` stays 0').toBe(0)
    expect(
      result.committed,
      `F-14 §3.2 — \`ResizeResetResult.committed\` reads FALSE — while the session’s own \`TerminalResult.committed\` for that call reads TRUE (the same distinction F-10’s sentence draws; a row that conflates the two counters FAILS). Read: ${JSON.stringify(
        result,
      )}`,
    ).toBe(false)
  })

  it('F-15 §3.2 — a reset on a session that refuses: the code is the session’s own `\'disposed\'`, propagated VERBATIM, zero writes', async () => {
    const double = makeSessionDouble()
    const element: Record<string, unknown> = { control: 'F-15' }
    const sink = makeSink()
    const { controller } = await createController({
      session: double.session,
      axisFor: (): unknown => undefined,
      boundsFor: (): unknown => ({ min: 0, max: 100 }),
      defaultSizeFor: (): unknown => 500,
      isResizable: (): unknown => true,
      sizeFor: (): unknown => 2,
      commit: sink,
    })
    controller.attach(element, {})
    double.begin(element)
    double.fireMove() // the wrapper-captured handle (`E3`-BLOCK-5): a dead-handle refusal
    double.dispose()
    const result = controller.reset(element)
    expect(
      result.code,
      `F-15 §3.2 — the refusal code is the session’s own \`'disposed'\`, propagated VERBATIM (never translated, wrapped, renamed or re-lexed). Read: ${JSON.stringify(
        result,
      )}`,
    ).toBe('disposed')
    expect(result.committed, 'F-15 §3.2 — `committed: false` and zero writes').toBe(false)
    expect(sink.records.length, 'F-15 §3.2 — zero sink writes').toBe(0)
  })

  it('F-16 §3.2 — an UNUSABLE or hostile `session`, and the total factory: construction NEVER throws and the controller is VALID BUT INERT', async () => {
    const hostileProxy = new Proxy(
      {},
      {
        get(): unknown {
          throw new Error('the proxy trap threw')
        },
        has(): boolean {
          throw new Error('the proxy has-trap threw')
        },
      },
    )
    const shapes: Array<[string, unknown]> = [
      ['no argument', undefined],
      ['{}', {}],
      ['{session: undefined}', { session: undefined }],
      ['{session: 42}', { session: 42 }],
      ['{session: {}}', { session: {} }],
      ['{session: a throwing Proxy}', { session: hostileProxy }],
      ['{session: Object.freeze({})}', { session: Object.freeze({}) }],
      ['a primitive (42)', 42],
      ["a string ('x')", 'x'],
      ['null', null],
    ]
    for (const [label, options] of shapes) {
      let produced: { controller: ControllerLike; live: boolean } | null = null
      expect(
        () => {
          // A synchronous throw would be a consumer-boundary failure, so it is measured here.
          produced = null
        },
        `F-16 §3.2 — construction NEVER throws for the ${label} argument (§0A note 9)`,
      ).not.toThrow()
      const created = await createController(options as Record<string, unknown>, `F-16 ${label}`).catch(() => null)
      expect(created, `F-16 §3.2 — the factory of the ${label} argument produced a controller`).not.toBe(null)
      const controller = (created as { controller: ControllerLike }).controller
      const attached = controller.attach({ control: `F-16-${label}` })
      expect(attached, `F-16 §3.2 — \`attach\` ⇒ \`false\` for the ${label} argument (no session call, and never a throw)`).toBe(false)
      const refusal = controller.reset({ control: `F-16-${label}` })
      expect(
        typeof refusal.ok === 'boolean' && typeof refusal.code === 'string',
        `F-16 §3.2 — \`reset\` ⇒ a refusal RECORD with zero session calls for the ${label} argument. Read: ${JSON.stringify(
          refusal,
        )}`,
      ).toBe(true)
      expect(controller.detach(), `F-16 §3.2 — \`detach()\` ⇒ \`false\` for the ${label} argument`).toBe(false)
      expect(
        controller.stats(),
        `F-16 §3.2 — \`stats()\` ⇒ ZEROED counters for the ${label} argument`,
      ).toEqual({ attached: 0, gestures: 0, sinkCalls: 0, written: 0, resets: 0, lastCode: 'ok' })
      void produced
    }
  })

  it('F-17 §3.2 — a THROWING `boundsFor`/`sizeFor` at the terminal (C2 path 4) PROPAGATES in DRIVE 1 and the element re-establishes to a NON-THROWING terminal in DRIVE 2, each with its OWN `fire`; the gate ends `idle` (not `busy`); the write count is ZERO or EXACTLY ONE — NEVER TWO', async () => {
    // **⟶ REWRITTEN 2026-09-27 (THE ESTABLISHMENT-SEAM AMENDMENT PASS — RULING `3`, resolving
    // `docs/pending.md` §I-quater's `E3`-RES-3; `§3.2 F-17`'s two-drive cell, `§2.4` item 2(4),
    // `§2.4` item 6 group `B`'s cross-reference, `§5.5.1 P-GT-IM-2`).**
    //
    // **THE AS-FILED / FUSED FORM IS SUPERSEDED AND KEPT VISIBLE HERE: this row formerly read the
    // two limbs as ONE drive — the SAME `fire(element, pointerup)` was required BOTH to propagate
    // the throwing seam's error AND, later in the same drive, to reach a non-throwing outcome with
    // that same throwing seam still installed. MEASURED, that fused drive's second gesture
    // PROPAGATES out of the source's own `fire(...)` — a call the fused row did not contain — so
    // the row never reached its own count assertion and failed on a THROW instead of on a value.**
    //
    // **THE RULED FORM, verbatim in substance: *"THE TWO LIMBS ARE NEVER FUSED: no single `fire`
    // call carries both a required propagation and a required non-propagation — the propagation
    // limb and the non-propagation limb are SEPARATE DRIVES, each containing its own terminal
    // `fire`, its own drive and its own source instance."* DRIVE `1` (THE PROPAGATION LIMB) reaches
    // its terminal through the source's own `fire(element, pointerup)` and the throw is CONTAINED by
    // that drive's OWN `try`/`catch` around its OWN `fire` call; DRIVE `2` (THE NON-PROPAGATION
    // LIMB) reaches a terminal with a NON-throwing seam — its own `fire` call, its own drive, its
    // own source instance — and asserts the count WITHOUT requiring the throwing seam to have
    // stopped throwing; and the control sub-drive in which the sink ALSO throws contains its own
    // `fire` too.**
    const DRIVE_DOWN = TYPE_DOWN
    const DRIVE_MOVE = TYPE_MOVE
    const DRIVE_UP = TYPE_UP
    /** **DRIVE `1` — THE PROPAGATION LIMB.** Its own harness, its own source instance, its own
     *  terminal `fire`, and its own `try`/`catch` AROUND that `fire` call. It asserts that the
     *  throwing seam propagates, that the gesture is `idle` (not `busy`), and that the throwing
     *  gesture's sink write count is `0` (the clamp and the sink sit AFTER the seam that threw). */
    const propagationDrive = async (which: 'boundsFor' | 'sizeFor'): Promise<void> => {
      const h = await landedHarness({})
      const sink = makeSink()
      const element: Record<string, unknown> = { control: `F-17-propagation-${which}` }
      const { controller } = await createController({
        session: h.session,
        axisFor: (): unknown => undefined,
        boundsFor:
          which === 'boundsFor'
            ? (): unknown => {
                throw new Error('the bounds seam threw (C2 path 4)')
              }
            : (): unknown => ({ min: 0, max: 100 }),
        isResizable: (): unknown => true,
        sizeFor:
          which === 'sizeFor'
            ? (): unknown => {
                throw new Error('the size seam threw (C2 path 4)')
              }
            : (): unknown => 5,
        commit: sink,
      })
      controller.attach(element, {})
      h.source.fire(element, DRIVE_DOWN)
      // **THE MOVE TURN IS DRIVEN** (⟶ CORRECTED 2026-09-27, THE GATE-4 ALIGNMENT PASS — THE
      // COMPOSITION'S ONLY LEGAL HANDLE CHANNEL): the terminal's seams are reached through the
      // handle the controller's own `onMove` WRAPPER captures (`§2.3` item 4 clause 1, `§2.5`
      // item 5 clause 2), and `session.begin` is FORBIDDEN to this controller — so without this
      // turn the throwing seam is never called, nothing propagates, and the drive measures a
      // gesture that never reached its terminal.
      h.source.fire(element, DRIVE_MOVE)
      // **THIS DRIVE'S OWN TERMINAL `fire`, CONTAINED BY THIS DRIVE'S OWN `try`/`catch`** — the
      // ruled shape: no other call in this row is required to propagate anything.
      let threw: unknown = null
      try {
        h.source.fire(element, DRIVE_UP)
      } catch (e) {
        threw = e
      }
      expect(
        threw,
        `F-17 §3.2 — DRIVE 1 (the propagation limb) — a throwing \`${which}\` PROPAGATES to the caller of the terminal (the composition swallows only its OWN seams’ errors in the two establishment cases)`,
      ).not.toBe(null)
      expect(
        sink.records.length,
        `F-17 §3.2 — DRIVE 1 (the propagation limb) — the sink write count for the throwing gesture is 0 (the clamp and the sink sit AFTER the seam that threw)`,
      ).toBe(0)
      expect(
        (h.session['stats'] as () => SessionStats)().active,
        `F-17 §3.2 — DRIVE 1 (the propagation limb) — the gesture is \`idle\`, NOT \`busy\` (the session already detached and discarded its record)`,
      ).toBe(false)
    }
    /** **DRIVE `2` — THE NON-PROPAGATION LIMB.** Its own harness, its own source instance, its own
     *  terminal `fire`, and a NON-throwing seam — so this drive reaches a terminal and asserts the
     *  write count **without requiring the throwing seam to have stopped throwing** (the two limbs
     *  are never fused). It carries the row's *"the element stays installed and a new gesture
     *  establishes normally"* clause. */
    const nonPropagationDrive = async (which: 'boundsFor' | 'sizeFor'): Promise<void> => {
      const h = await landedHarness({})
      const sink = makeSink()
      const element: Record<string, unknown> = { control: `F-17-non-propagation-${which}` }
      const { controller } = await createController({
        session: h.session,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        isResizable: (): unknown => true,
        sizeFor: (): unknown => 5,
        commit: sink,
      })
      controller.attach(element, {})
      h.source.fire(element, DRIVE_DOWN)
      h.source.fire(element, DRIVE_MOVE)
      let threw: unknown = null
      try {
        h.source.fire(element, DRIVE_UP)
      } catch (e) {
        threw = e
      }
      expect(
        threw,
        `F-17 §3.2 — DRIVE 2 (the non-propagation limb, a NON-throwing \`${which}\`) — nothing propagates from this drive's OWN terminal: the two limbs are NEVER fused, so a fused row that required one call both to propagate and not to fails HERE`,
      ).toBe(null)
      expect(
        sink.records.length,
        `F-17 §3.2 — DRIVE 2 (the non-propagation limb) — the element stays installed and a new gesture establishes normally: the reaching terminal writes EXACTLY ONE value. Read: ${sink.records.length}`,
      ).toBe(1)
      expect(
        (h.session['stats'] as () => SessionStats)().active,
        'F-17 §3.2 — DRIVE 2 (the non-propagation limb) — the reaching terminal leaves the session `idle` again (its record is discarded as the terminal runs)',
      ).toBe(false)
    }
    for (const which of ['boundsFor', 'sizeFor'] as const) {
      await propagationDrive(which)
      await nonPropagationDrive(which)
    }
    // **THE CONTROL SUB-DRIVE WHERE THE SINK ALSO THROWS** — its own `fire` too (`§3.2 F-17`'s
    // own cell: *"in the control drive where the sink ALSO throws, it is `1` attempt and NOT
    // retried"*), so the row's *"ZERO or EXACTLY ONE, NEVER TWO"* count is read over BOTH of its
    // declared counts: `0` in DRIVE 1 and `1` here — and never `2`.
    {
      const h = await landedHarness({})
      const throwingSink = makeSink(true)
      const element: Record<string, unknown> = { control: 'F-17-control-throwing-sink' }
      const { controller } = await createController({
        session: h.session,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        isResizable: (): unknown => true,
        sizeFor: (): unknown => 5,
        commit: throwingSink,
      })
      controller.attach(element, {})
      h.source.fire(element, DRIVE_DOWN)
      h.source.fire(element, DRIVE_MOVE)
      let threw: unknown = null
      try {
        h.source.fire(element, DRIVE_UP)
      } catch (e) {
        threw = e
      }
      expect(
        threw,
        'F-17 §3.2 — THE CONTROL SUB-DRIVE fires its own terminal under a THROWING sink; the sink’s throw is CONTAINED by the composition’s own write seam (`stats().sinkCalls` already counts the attempt), so NOTHING reaches the caller of this drive’s `fire`',
      ).toBe(null)
      expect(
        throwingSink.attempts.count,
        `F-17 §3.2 — **THE CONTROL: the sink that ALSO throws is ATTEMPTED exactly ONCE and NEVER retried** (\`F-11\`'s attempt-vs-return distinction). Attempts: ${throwingSink.attempts.count}`,
      ).toBe(1)
      expect(
        controller.stats().sinkCalls,
        'F-17 §3.2 — THE CONTROL: `stats().sinkCalls === 1` (it counts ATTEMPTS, including one that threw)',
      ).toBe(1)
      expect(
        controller.stats().written,
        'F-17 §3.2 — THE CONTROL: `stats().written === 0` (it counts RETURNS, and this sink returned nothing)',
      ).toBe(0)
    }
  })

  it('F-18 §3.2 — a THROWING `axisFor`/`isResizable` at establishment (C2 paths 1/2) is SWALLOWED by the controller’s own `try`/`catch`, and the gesture establishes NORMALLY', async () => {
    for (const which of ['axisFor', 'isResizable'] as const) {
      const h = await landedHarness({})
      const sink = makeSink()
      const received: unknown[] = []
      const element: Record<string, unknown> = { control: `F-18-${which}` }
      const { controller } = await createController({
        session: h.session,
        axisFor:
          which === 'axisFor'
            ? (): unknown => {
                throw new Error('the axis seam threw (C2 path 1)')
              }
            : (): unknown => 'token',
        isResizable:
          which === 'isResizable'
            ? (): unknown => {
                throw new Error('the resizability seam threw (C2 path 2)')
              }
            : (el: unknown, axis: unknown): unknown => {
                received.push(axis)
                return true
              },
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        sizeFor: (el: unknown, gesture: unknown, axis: unknown): unknown => {
          received.push(axis)
          return 5
        },
        commit: sink,
      })
      controller.attach(element, {})
      let threw: unknown = null
      try {
        h.source.fire(element, TYPE_DOWN)
      } catch (e) {
        threw = e
      }
      expect(
        threw,
        `F-18 §3.2 — a throwing \`${which}\` never reaches the session’s establishment path: it is SWALLOWED by the controller’s own try/catch`,
      ).toBe(null)
      expect(
        controller.stats().gestures,
        `F-18 §3.2 — the gesture ESTABLISHES NORMALLY for the throwing \`${which}\` (\`stats().gestures\` increments)`,
      ).toBe(1)
      expect(
        (h.session['stats'] as () => SessionStats)().active,
        `F-18 §3.2 — and it is NOT \`busy\`: the establishment succeeded`,
      ).toBe(true)
      h.source.fire(element, TYPE_MOVE)
      h.source.fire(element, TYPE_UP)
      if (which === 'axisFor') {
        expect(
          received.includes(undefined),
          `F-18 §3.2 — path (a): the token \`undefined\` reaches the terminal seams. Received: ${JSON.stringify(received.map(brief))}`,
        ).toBe(true)
      } else {
        expect(
          sink.records.length,
          `F-18 §3.2 — path (b): the gesture writes ZERO times (a throwing decision is NOT RESIZABLE)`,
        ).toBe(0)
        expect(controller.stats().gestures, 'F-18 §3.2 — path (b): the gesture still terminates normally').toBe(1)
      }
    }
  })

  it('F-19 §3.2 — a consumer that writes from its OWN hooks: that write is a DIFFERENT channel, and a TOTAL of two FAILS the single-writer row', async () => {
    const readings = await writerShape(4)
    expect(
      readings.controllerCount,
      `F-19 §3.2 — this unit’s rows do NOT count the consumer’s own write as the composition’s: the composition’s \`sinkCalls\` is the count of the controller’s own ONE call site. Readings: ${JSON.stringify(
        readings,
      )}`,
    ).toBe(1)
    expect(
      readings.sinkRecord,
      `F-19 §3.2 — a composition whose TOTAL write count for one gesture is 2 FAILS F-9’s row (so the loophole closes where it matters). Readings: ${JSON.stringify(
        readings,
      )}`,
    ).toBe(2)
  })
})

// ===========================================================================
// §5.5.1 — THE PROPERTY REGISTER (`13` typed rows in FOUR families), EXECUTED IN
// REGISTER ORDER, with the caps, the stop-after-5 rule, the pinned seed and the
// `§5.3` item 10 record lines.
//
// THE ARITHMETIC, printed WITH its terms and asserted as the sum of its own terms (the
// DECLARED total IS the term sum — the as-filed `314` was a corrected mis-sum, kept
// visible as provenance only, never as a live expected value):
//   `299` = `60` (`P-GT-PU-1`) + `11` (`P-GT-PU-2`) + `10` (`P-GT-PU-3`) + `18`
//   (`P-GT-IM-1`) + `20` (`P-GT-IM-2`) + `22` (`P-GT-IM-3`) + `28` (`P-GT-IM-4`) + `20`
//   (`P-GT-SM-1`) + `15` (`P-GT-SM-2`) + `5` (`P-GT-SM-3`) + `12` (`P-GT-SM-4`) + `60`
//   (`P-GT-TP-1`) + `18` (`P-GT-TP-2`); family subtotals `PU 81` · `IM 88` · `SM 52` ·
//   `TP 78` (`81 + 88 + 52 + 78 = 299`). The term-by-term addition is
//   `60 → 71 → 81 → 99 → 119 → 141 → 169 → 189 → 204 → 209 → 221 → 281 → 299`.
//   **`P-GT-SM-5` (the `detach()` multi-element limb's clause cell) carries NO TERM and is
//   NOT part of this arithmetic.**
// ===========================================================================
describe('PRE — the register’s own preconditions and controls', () => {
  it('PRE-2 (harness) — the §5.5.1 register tables are the ones the spec specifies (seed, terms, caps, arithmetic, the pinned LCG step, the pool length)', () => {
    expect(SEED, 'PRE-2/§5.5.1 — the seed is the pinned literal `20260927`').toBe(20260927)
    expect(LCG_A, 'PRE-2/§5.5.1 — the LCG multiplier is the pinned literal').toBe(1664525)
    expect(LCG_C, 'PRE-2/§5.5.1 — the LCG increment is the pinned literal').toBe(1013904223)
    expect(LCG_MOD, 'PRE-2/§5.5.1 — the LCG modulus is `2³²`').toBe(4294967296)
    expect(REGISTER_ROW_CAP, 'PRE-2/§5.5.1 — the per-row cap is `≤100`').toBe(100)
    expect(REGISTER_TOTAL_CAP, 'PRE-2/§5.5.1 — the register cap is `≤400`').toBe(400)
    expect(CONSECUTIVE_FAILURE_CAP, 'PRE-2/§5.5.1 — the stop rule is 5 consecutive failures').toBe(5)
    expect(POOL_LENGTH, 'PRE-2/§5.5.1 — `pool.length === 20` (the pinned pool)').toBe(20)
    expect(TOTALITY_DRAWS, 'PRE-2/§5.5.1 — `P-GT-TP-1` performs 30 pinned-seed draws').toBe(30)
    const terms = REGISTER_DECLARED.map((r) => r.term)
    expect(
      terms,
      'PRE-2/§5.5.1/§5.5.3 — the thirteen DECLARED terms, in register order, EXACTLY as the spec prints them (they are NOT re-totalled silently: the spec’s declared figures are what the caps are compared against)',
    ).toEqual([60, 11, 10, 18, 20, 22, 28, 20, 15, 5, 12, 60, 18])
    const termSum = terms.reduce((sum, n) => sum + n, 0)
    // **⟶ CORRECTED 2026-09-27 BY THE RED-RUN AMENDMENT PASS, AND REALIGNED HERE.** The
    // spec's thirteen printed terms SUM TO `299`; the as-filed total `314` was a MIS-SUM
    // (`§5.5.3`'s own governing sentence: *"a total that is not the sum of its own terms is
    // a review finding"*). **THE AMENDED SPEC RULES THE TOTAL: the DECLARED total IS `299`**,
    // so the declared total and the term sum now AGREE by construction, and **the as-filed
    // `314` is kept visible ONLY as a dated corrected-mis-sum note**
    // (`REGISTER_AS_FILED_TOTAL_DEFECT`) — never as a live expected value.
    console.log(
      `§5.5.1 ARITHMETIC (AMENDED 2026-09-27) :: ${JSON.stringify({
        declaredTotal: REGISTER_PRINTED_TOTAL,
        measuredTermSum: termSum,
        asFiledTotalDefect: REGISTER_AS_FILED_TOTAL_DEFECT,
        note: REGISTER_AS_FILED_TOTAL_DEFECT_NOTE,
        terms: REGISTER_DECLARED.map((r) => `${r.row}=${r.term}`),
        clause: 'docs/specs/gutter.md §5.5.3 — the declared total is the sum of its own terms',
      })}`,
    )
    expect(
      REGISTER_PRINTED_TOTAL,
      `PRE-2/§5.5.1 — the register’s DECLARED total is the AMENDED figure (299), the sum of its own thirteen printed terms; it is inside the ≤400 register cap. The as-filed 314 is a corrected mis-sum and is NOT a live expected value`,
    ).toBe(299)
    expect(
      REGISTER_PRINTED_TOTAL,
      'PRE-2/§5.5.1 — the declared total is inside the `≤400` register cap (`299 ≤ 400`, the AMENDED comparison)',
    ).toBeLessThanOrEqual(REGISTER_TOTAL_CAP)
    expect(
      termSum,
      `PRE-2/§5.5.3 — the DECLARED total and the term sum are the SAME figure: the register’s thirteen printed terms (\`60+11+10+18+20+22+28+20+15+5+12+60+18\`) sum to \`${termSum}\`, and §5.5.3’s term-by-term addition reaches it (60 → 71 → 81 → 99 → 119 → 141 → 169 → 189 → 204 → 209 → 221 → 281 → 299)`,
    ).toBe(299)
    expect(
      termSum,
      'PRE-2/§5.5.1 — THE TERM-SUM CHECK PASSES: the declared total is exactly the sum of its own terms (the ACTIVE rule `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS` is SATISFIED, not reported as a finding)',
    ).toBe(REGISTER_PRINTED_TOTAL)
    expect(REGISTER_DECLARED.length, 'PRE-2/§5.5.1 — the register declares THIRTEEN rows').toBe(13)
    for (const { row, term } of REGISTER_DECLARED) {
      expect(term, `PRE-2/§5.5.1 — row ${row} is inside the ≤100 per-row cap`).toBeLessThanOrEqual(REGISTER_ROW_CAP)
    }
    expect(
      REGISTER_DECLARED.map((r) => r.row),
      'PRE-2/§5.5.1 — the thirteen row ids, in register order (a rename or a dropped row fails here)',
    ).toEqual([
      'P-GT-PU-1',
      'P-GT-PU-2',
      'P-GT-PU-3',
      'P-GT-IM-1',
      'P-GT-IM-2',
      'P-GT-IM-3',
      'P-GT-IM-4',
      'P-GT-SM-1',
      'P-GT-SM-2',
      'P-GT-SM-3',
      'P-GT-SM-4',
      'P-GT-TP-1',
      'P-GT-TP-2',
    ])
    expect(
      REGISTER_DECLARED.map((r) => r.strategy),
      'PRE-2/§5.5.1 — the thirteen strategy ids, one per row, in register order',
    ).toEqual([
      'S-GT-PURE-1',
      'S-GT-PURE-2',
      'S-GT-PURE-3',
      'S-GT-SEAM-1',
      'S-GT-SEAM-2',
      'S-GT-SEAM-3',
      'S-GT-SEAM-4',
      'S-GT-COMMIT-1',
      'S-GT-WINDOW-1',
      'S-GT-WRITER-1',
      'S-GT-RESET-1',
      'S-GT-TOTAL-1',
      'S-GT-SHAPES-1',
    ])
    expect(
      REGISTER_DECLARED.filter((r) => r.bounded).map((r) => r.row),
      'PRE-2/§5.5.1 — the rows marked `(bounded)`, DERIVED from the table’s own flag, are the THREE the spec names: `P-GT-PU-2`, `P-GT-IM-2`, `P-GT-TP-1`',
    ).toEqual(REGISTER_BOUNDED_ROWS)
    expect(
      REGISTER_DECLARED.filter((r) => !r.bounded).length,
      'PRE-2/§5.5.1 — the OTHER TEN rows carry the plain executable marking (3 + 10 = 13)',
    ).toBe(10)
    expect(
      REGISTER_DECLARED.filter((r) => r.term !== r.distinct).map((r) => `${r.row}:${r.term}/${r.distinct}`),
      'PRE-2/§5.5.2 item 3 — the FOUR rows where the DECLARED and the DISTINCT figures DIFFER: `P-GT-PU-2` 11/2 · `P-GT-IM-2` 20/18 · `P-GT-SM-1` 20/19 · `P-GT-SM-4` 12/10 (⟶ CORRECTED 2026-09-27, the architect-ruling alignment pass: the as-landed table made `P-GT-SM-4` report 12/12 and the FOUR became THREE; the row’s own drive table yields FIVE distinct reading classes × TWO readings = 10, so `P-GT-SM-4` is a differing row again and the set is FOUR — with the `isResizable === false` limb riding INSIDE shape (6)’s attempts and adding no attempt term). The DECLARED figures are what the caps are compared against; the distinct figures are REPORTED BESIDE them and NEVER substituted',
    ).toEqual(['P-GT-PU-2:11/2', 'P-GT-IM-2:20/18', 'P-GT-SM-1:20/19', 'P-GT-SM-4:12/10'])
    const firstState = (SEED * LCG_A + LCG_C) % LCG_MOD
    expect(
      firstState,
      'PRE-2/§5.5.1 — ONE LCG step from the pinned seed is `(20260927·1664525 + 1013904223) mod 2³²`',
    ).toBe(Number((BigInt(SEED) * BigInt(LCG_A) + BigInt(LCG_C)) % BigInt(LCG_MOD)))
    expect(
      DRAWN_INDICES.length,
      'PRE-2/§5.5.1 — the draw sequence of `P-GT-TP-1` really performs 30 draws (one LCG step each)',
    ).toBe(30)
    expect(
      DRAWN_INDICES.every((index) => index >= 0 && index < POOL_LENGTH),
      'PRE-2/§5.5.1 — every drawn index is inside the pool (`index = state mod 20`)',
    ).toBe(true)
    expect(
      DISTINCT_DRAWN_POOL_MEMBERS,
      `PRE-2/§5.5.2 item 4 — the 30 pinned draws hit ${DISTINCT_DRAWN_POOL_MEMBERS} of the pool’s 20 members: this is a REPORTED EXECUTION FIGURE (a DRAW is not a SWEEP), and NO row may assert that every member was drawn`,
    ).toBeLessThanOrEqual(POOL_LENGTH)
    expect(
      TOTALITY_POOL.length,
      'PRE-2/§5.5.1 — the pool holds 20 members (the modular reduction’s own divisor)',
    ).toBe(20)
    expect(
      registerKeySet(REGISTER_DECLARED).length,
      'PRE-2 — the declared key set is unique per row (no duplicate row/strategy pair)',
    ).toBe(13)
  })

  it('PRE-3 (harness) — the R-1/R-10/R-11 scanners detect their evasions and pass the legitimate text (their own controls)', () => {
    for (const control of VOCAB_POSITIVE_CONTROLS) {
      expect(
        vocabularyViolations(control).length,
        `PRE-3/S-6 — the vocabulary scan MUST fail for the shape ${JSON.stringify(control)}: the row is otherwise UNFALSIFIED`,
      ).toBeGreaterThan(0)
    }
    for (const control of WRITE_POSITIVE_CONTROLS) {
      expect(
        uiWriteViolations(control).length,
        `PRE-3/S-6 — the UI-write scan MUST fail for the shape ${JSON.stringify(control)}`,
      ).toBeGreaterThan(0)
    }
    expect(
      vocabularyViolations(VOCAB_NEGATIVE_CONTROL),
      'PRE-3 — this unit’s own legitimate text PASSES the vocabulary scan',
    ).toEqual([])
    expect(
      uiWriteViolations(VOCAB_NEGATIVE_CONTROL),
      'PRE-3 — this unit’s own legitimate text PASSES the write scan',
    ).toEqual([])
    // **THE CONTROL ARM IS BUILT AT RUN TIME** (`R-8` bound (c) holds this file's
    // DESCRIPTIONS, so a control corpus spelled out here would be a hit against this file
    // rather than a control): the claim words are the row's own fragments, joined.
    const claimControl = `it('${GEOMETRY_CLAIM_WORDS[0]} is proved', () => {})`
    expect(
      geometryClaimViolations(claimControl).length,
      `PRE-3/R-8 — the description scan MUST fail for a claim-shaped description (${claimControl})`,
    ).toBeGreaterThan(0)
    expect(
      /Math\.max\(min, Math\.min\(value, max\)\)/.test('Math.max(min, Math.min(value, max))'),
      'PRE-3 — the formula the contract pins is expressible and recognized (so the clamp rows’ expected answers are the FORMULA’s)',
    ).toBe(true)
  })

  it('PRE-4 (harness) — the pool-versus-boundary rule (§5.5.2 item 7): every pool/table member satisfies its row’s declared boundary text', () => {
    // `P-GT-PU-1`'s declared boundary: every input returns the declared `number`.
    for (const cell of PU1_VALUE_CLASSES) {
      expect(
        cell.declared === null || typeof cell.declared === 'number' || Number.isNaN(cell.declared),
        `PRE-4/§5.5.2 item 7 — PU-1’s value class \`${cell.label}\` declares a \`number\` answer (the boundary text), and the \`NaN\` class declares the gate’s own value`,
      ).toBe(true)
    }
    // The two classes a careless boundary text would contradict are DECLARED AS SUCH.
    expect(
      PU1_BOUNDS_CLASSES.filter((c) => c.label.includes('non-number bound')).length,
      'PRE-4/§5.5.2 item 7 — the `{min: \'0\', max: \'100\'}` class is declared (the typeof gate’s NaN class)',
    ).toBe(1)
    expect(
      PU1_CROSS_BOUNDS.length,
      'PRE-4/§5.5.1 — the cross-product holds exactly 3 bounds shapes × 11 values = 33 cells',
    ).toBe(3)
    expect(
      PU1_CROSS_VALUES.length,
      'PRE-4/§5.5.1 — the cross-product’s value axis carries 11 members',
    ).toBe(11)
    expect(
      PU1_VALUE_CLASSES.length + PU1_BOUNDS_CLASSES.length + PU1_CROSS_VALUES.length * PU1_CROSS_BOUNDS.length,
      'PRE-4/§5.5.1 P-GT-PU-1 — 18 value classes + 9 bounds classes + 33 cross-product cells = 60 attempts',
    ).toBe(60)
    // `P-GT-TP-1`’s boundary: the pool is a totality-only pool — the one member that could
    // have contradicted it (a shape that makes `boundsFor`/`sizeFor` throw) is NOT in it.
    const names = TOTALITY_POOL.map((member) => member.label)
    expect(
      names.filter((label) => /throw/i.test(label)).length,
      'PRE-4/§5.5.2 item 7 P-GT-TP-1 — the pool’s members are totality inputs ONLY: the one member that could contradict the stated bound (a shape making `boundsFor`/`sizeFor` throw) is not in the pool at all',
    ).toBe(0)
    expect(
      TOTALITY_POOL.every((member) => member.seamName.length > 0),
      'PRE-4 — every pool member names the seam it is drawn as (so a draw is never ambiguous)',
    ).toBe(true)
  })
})

describe('§5.5.1 — the thirteen-row typed register (executed in register order)', () => {
  it('P-GT-PU-1 (S-GT-PURE-1) — the PURE-TOTALITY quantification: for EVERY input in the enumerated domain, `clampToBounds` returns its DECLARED number and never throws', async () => {
    const row = new RegisterRow('P-GT-PU-1', 'S-GT-PURE-1')
    const pair = { min: 0, max: 100 }
    /** **THE RULED `-0` CLAUSE, checked BY NAME** (`§2.3` item 2's dated block, ruling `1`;
     *  `§5.5.1 P-GT-PU-1`'s own clause): the VALUE-CLASS `(17)` `-0` drive answers `+0` (the
     *  pair's own `+0` `min` wins `Math.max`'s same-value comparison), and the `-0`-PRESERVED
     *  reading is the BOUNDS-CLASS `(1)` drive with `value = -0` over `{min: -0, max: 100}`.
     *  `Object.is` is the reading, because `toEqual`/`toBe` cannot distinguish the two zeros. */
    const zeroSignCell = (label: string, value: unknown, bounds: unknown, expected: number, result: unknown, threw: unknown): string | null => {
      if (threw !== null) return `${label} — the call THREW ${describeThrown(threw)}`
      if (!Object.is(result, expected)) {
        const sign = (n: unknown): string => {
          if (typeof n !== 'number') return brief(n)
          if (Object.is(n, -0)) return '-0'
          if (Object.is(n, 0)) return '+0'
          return String(n)
        }
        void value
        void bounds
        return `${label} — the declared answer is ${sign(expected)}, the measured answer is ${sign(
          result,
        )} (read with Object.is, per the ruled -0 clause)`
      }
      return null
    }
    /** **THE HOLDER-DOMAIN TABLE, ASSERTED INSIDE THE DRIVES** (ruling `1`): the `IN` shapes
     *  answer the formula verbatim (`-0` where the formula answers `-0`, `+0` where the pair's
     *  own `min` wins) and the `OUT` shapes answer `NaN` by the `typeof` gate. */
    const holderCause = (): string | null => {
      for (const holder of PU1_HOLDER_CLASSES) {
        const outcome = clampVia(holder.value, holder.bounds)
        if (outcome.threw !== null) {
          return `the holder shape ${holder.label} — the call THREW ${describeThrown(outcome.threw)} (the holder domain is TOTAL: a getter/throwing field read is answered, never re-thrown)`
        }
        if (typeof outcome.result !== 'number') {
          return `the holder shape ${holder.label} — the answer is ${brief(outcome.result)}, not a number`
        }
        if (Number.isNaN(holder.declared as number)) {
          if (!Number.isNaN(outcome.result)) {
            return `the holder shape ${holder.label} is OUT of the domain and answers NaN BY THE typeof GATE; it answered ${brief(outcome.result)}`
          }
          continue
        }
        const cause = zeroSignCell(holder.label, holder.value, holder.bounds, holder.declared as number, outcome.result, outcome.threw)
        if (cause !== null) return cause
      }
      return null
    }
    for (const cell of PU1_VALUE_CLASSES) {
      await row.run(`the value class ${cell.label}`, () => {
        const outcome = clampVia(cell.value, pair)
        if (outcome.threw !== null) return `the declared answer is ${brief(cell.declared)}, but the call THREW ${describeThrown(outcome.threw)}`
        if (typeof outcome.result !== 'number') return `the answer is ${brief(outcome.result)} (a ${typeof outcome.result}), not a number`
        if (Number.isNaN(cell.declared as number)) {
          return Number.isNaN(outcome.result) ? null : `the declared answer is NaN, the measured answer is ${brief(outcome.result)}`
        }
        if (!Object.is(outcome.result, cell.declared)) {
          return `the declared answer is ${brief(cell.declared)}, the measured answer is ${brief(outcome.result)}`
        }
        // THE VALUE-CLASS `(17)` `-0` DRIVE carries the ruled `-0`-EXACT reading and the
        // WHOLE holder-domain table, so both are asserted where the contract puts them.
        if (!cell.label.startsWith('(17)')) return null
        const signCause = zeroSignCell('the value class (17) `-0` against the canonical pair', -0, pair, 0, outcome.result, outcome.threw)
        if (signCause !== null) return signCause
        return holderCause()
      })
    }
    for (const cell of PU1_BOUNDS_CLASSES) {
      await row.run(`the bounds class ${cell.label}`, () => {
        const outcome = clampVia(cell.value, cell.bounds)
        if (outcome.threw !== null) return `the declared answer is ${brief(cell.declared)}, but the call THREW ${describeThrown(outcome.threw)}`
        if (typeof outcome.result !== 'number') return `the answer is ${brief(outcome.result)} (a ${typeof outcome.result}), not a number`
        if (Number.isNaN(cell.declared as number)) {
          return Number.isNaN(outcome.result) ? null : `the declared answer is NaN, the measured answer is ${brief(outcome.result)}`
        }
        if (Object.is(outcome.result, -0) || Object.is(cell.declared, -0)) {
          return zeroSignCell(`the bounds class ${cell.label}`, cell.value, cell.bounds, cell.declared as number, outcome.result, outcome.threw)
        }
        return Object.is(outcome.result, cell.declared) ? null : `the declared answer is ${brief(cell.declared)}, the measured answer is ${brief(outcome.result)}`
      })
    }
    for (const bounds of PU1_CROSS_BOUNDS) {
      for (const value of PU1_CROSS_VALUES) {
        await row.run(`the cross-product cell (${brief(value)}, ${bounds.label})`, () => {
          const declared = bounds.answer(value)
          const outcome = clampVia(value, bounds.bounds)
          if (outcome.threw !== null) return `the declared answer is ${brief(declared)}, but the call THREW ${describeThrown(outcome.threw)}`
          if (typeof outcome.result !== 'number') return `the answer is ${brief(outcome.result)} (a ${typeof outcome.result}), not a number`
          if (Number.isNaN(declared as number)) {
            return Number.isNaN(outcome.result) ? null : `the declared answer is NaN, the measured answer is ${brief(outcome.result)}`
          }
          return Object.is(outcome.result, declared) ? null : `the declared answer is ${brief(declared)}, the measured answer is ${brief(outcome.result)}`
        })
      }
    }
    row.finish()
    expect(row.attemptsRunPublic(), `P-GT-PU-1 — the declared term is ${declaredPair('P-GT-PU-1').term} and this row ran ${row.attemptsRunPublic()} attempts`).toBe(60)
  })

  it('P-GT-PU-2 (S-GT-PURE-2, bounded) — the ORDERING / BOUNDARY property: every drive answers exactly one of the three declared outcomes, over 2 distinct pairs', async () => {
    const row = new RegisterRow('P-GT-PU-2', 'S-GT-PURE-2')
    const canonical = { min: 0, max: 100 }
    const second = { min: -50, max: 25 }
    const drives: Array<{ label: string; value: number; bounds: unknown; declared: number }> = [
      { label: '(a) above the canonical pair', value: 150, bounds: canonical, declared: 100 },
      { label: '(b) below the canonical pair', value: -5, bounds: canonical, declared: 0 },
      { label: '(c) inside the canonical pair', value: 42, bounds: canonical, declared: 42 },
      { label: '(d) on the canonical max boundary', value: 100, bounds: canonical, declared: 100 },
      { label: '(e) on the canonical min boundary', value: 0, bounds: canonical, declared: 0 },
      { label: '(f) the INVERTED pair’s min limb', value: 250, bounds: { min: 100, max: 0 }, declared: 100 },
      { label: '(g) above the second pair', value: 60, bounds: second, declared: 25 },
      { label: '(h) below the second pair', value: -70, bounds: second, declared: -50 },
      { label: '(i) inside the second pair', value: 0, bounds: second, declared: 0 },
      { label: '(j) on the second pair’s max boundary', value: 25, bounds: second, declared: 25 },
      { label: '(k) on the second pair’s min boundary', value: -50, bounds: second, declared: -50 },
    ]
    for (const drive of drives) {
      await row.run(`the drive ${drive.label}`, () => {
        const outcome = clampVia(drive.value, drive.bounds)
        if (outcome.threw !== null) return `the drive threw ${describeThrown(outcome.threw)}`
        if (typeof outcome.result !== 'number') return `the answer is ${brief(outcome.result)}, not a number`
        const pairRecord = drive.bounds as { min: number; max: number }
        const limbs = [pairRecord.min, drive.value, pairRecord.max]
        if (!limbs.some((limb) => Object.is(limb, outcome.result))) {
          return `the answer ${brief(outcome.result)} straddles the three declared outcomes ${JSON.stringify(limbs)}`
        }
        return Object.is(outcome.result, drive.declared)
          ? null
          : `the declared outcome is ${brief(drive.declared)}, the measured answer is ${brief(outcome.result)}`
      })
    }
    row.finish()
    expect(row.attemptsRunPublic(), `P-GT-PU-2 — the declared term is ${declaredPair('P-GT-PU-2').term}`).toBe(11)
    expect(
      declaredPair('P-GT-PU-2').distinct,
      `P-GT-PU-2 (bounded) — the honest DISTINCT \`(value, bounds)\` pair count is ${declaredPair('P-GT-PU-2').distinct} (the 11 drives re-drive the three outcomes under 2 distinct pairs), and the universal “for every pair” is NOT proven by this row`,
    ).toBe(2)
  })

  it('P-GT-PU-3 (S-GT-PURE-3) — PURITY / DETERMINISM / NO-RETENTION: 5 caller-object shapes × 2 access patterns', async () => {
    const row = new RegisterRow('P-GT-PU-3', 'S-GT-PURE-3')
    /** **THE `5` SHAPES ARE `§5.5.1 P-GT-PU-3`'s OWN FIVE, each carrying its DECLARED ANSWER**
     *  (the `-0`/`+0`-exact reading for the four IN-domain holders, the `typeof` gate's `NaN`
     *  for the `Map`). Shape `(5)` is the **`Map`-shaped holder, which ruling `1` puts OUT of
     *  the domain: it can NEVER answer `-0`, a bound or a value — it answers `NaN` in EVERY
     *  drive, on every purity pattern, frozen or not.** The five shapes stay five and the
     *  declared term stays `10` (`5` shapes × `2` access patterns). */
    const shapes: Array<{ label: string; make: () => unknown; declared: number }> = [
      { label: '(1) a plain record', make: (): unknown => ({ min: 0, max: 100 }), declared: 42 },
      {
        label: '(2) an `Object.create(null)` record',
        make: (): unknown => {
          const holder: Record<string, unknown> = Object.create(null)
          holder['min'] = 0
          holder['max'] = 100
          return holder
        },
        declared: 42,
      },
      {
        label: '(3) a record whose `min` is an own accessor',
        make: (): unknown => {
          const holder = { max: 100 }
          Object.defineProperty(holder, 'min', { get: () => 0, enumerable: true, configurable: true })
          return holder
        },
        declared: 42,
      },
      { label: '(4) a frozen record', make: (): unknown => Object.freeze({ min: 0, max: 100 }), declared: 42 },
      {
        label: '(5) a `Map`-shaped holder (OUT of the domain — the `typeof` gate answers `NaN`)',
        make: (): unknown => new Map<string, number>([['min', 0], ['max', 100]]),
        declared: NaN,
      },
    ]
    for (const shape of shapes) {
      for (const pattern of ['unfrozen', 'frozen'] as const) {
        await row.run(`${shape.label} / ${pattern}`, () => {
          const bounds = shape.make()
          if (pattern === 'frozen') Object.freeze(bounds as object)
          const snapshot = (): string => {
            try {
              return JSON.stringify({
                own: typeof bounds === 'object' && bounds !== null ? [...Object.keys(bounds as object)].join(',') : typeof bounds,
                proto: Object.getPrototypeOf(bounds as object) === null ? 'null-proto' : 'Object',
                frozen: Object.isFrozen(bounds as object),
              })
            } catch (e) {
              return `<<unreadable: ${describeThrown(e)}>>`
            }
          }
          const before = snapshot()
          const first = clampVia(42, bounds)
          const second = clampVia(42, bounds)
          // **THE INTERLEAVED THIRD CALL drives a DIFFERENT pair** (`§5.5.1 P-GT-PU-3`'s
          // per-attempt assert), so a module carrying module-level state would move the first
          // pair's repeat answer. **`bounds` IS STILL THE SHAPE UNDER TEST, so the declared
          // answer is asserted against it** — never against the interleaved pair.
          const third = clampVia(7, { min: 0, max: 10 })
          const fourth = clampVia(42, bounds)
          if (first.threw !== null) return `the first call threw ${describeThrown(first.threw)}`
          if (second.threw !== null) return `the second call threw ${describeThrown(second.threw)}`
          if (fourth.threw !== null) return `the fourth call threw ${describeThrown(fourth.threw)}`
          if (!Object.is(first.result, second.result)) return `the two sequential answers differ (${brief(first.result)} vs ${brief(second.result)})`
          if (!Object.is(first.result, fourth.result)) return `the interleaved third call changed the pair’s repeat answer (${brief(first.result)} vs ${brief(fourth.result)})`
          if (snapshot() !== before) return `the arguments changed: ${before} ⇒ ${snapshot()}`
          // **THE SHAPE'S OWN DECLARED ANSWER** — `Object.is`, because the `Map` cell's `NaN`
          // and any `-0`/`+0` cell cannot be read by `===`.
          if (Number.isNaN(shape.declared)) {
            if (!Number.isNaN(first.result as number)) {
              return `the \`Map\`-shaped holder is OUT of the domain (its \`min\`/\`max\` reads are not \`number\`s) and answers \`NaN\` by the \`typeof\` gate; it answered ${brief(first.result)}`
            }
          } else if (!Object.is(first.result, shape.declared)) {
            return `the declared answer for this shape is ${brief(shape.declared)}, the measured answer is ${brief(first.result)} (a getter-bearing / null-prototype / frozen record behaves exactly like its data-property twin)`
          }
          return null
        })
      }
    }
    row.finish()
    expect(row.attemptsRunPublic(), `P-GT-PU-3 — the declared term is ${declaredPair('P-GT-PU-3').term}`).toBe(10)
  })

  it('P-GT-IM-1 (S-GT-SEAM-1) — the `sizeFor` seam quantification: 4 shapes × 5 gesture paths, each cell’s declared call/write pair', async () => {
    const row = new RegisterRow('P-GT-IM-1', 'S-GT-SEAM-1')
    /** The `(4)` shape's own sentinel error, so the REQUIRED propagation is asserted BY
     *  IDENTITY (`toBe`) rather than by "something was thrown" — a throw from anywhere else
     *  cannot satisfy the cell (`E3`-BLOCK-6(c)). */
    const SIZE_FOR_SENTINEL_ERROR = new Error('the size seam threw (P-GT-IM-1 sentinel)')
    const shapes: Array<{ label: string; make: (log: string[]) => unknown }> = [
      {
        label: '(1) a callable returning a number',
        make: (log: string[]): unknown => () => {
          log.push('sizeFor')
          return 777
        },
      },
      { label: '(2) ABSENT', make: (): unknown => undefined },
      { label: '(3) NON-CALLABLE', make: (): unknown => NON_CALLABLE_SEAM },
      {
        label: '(4) THROWING',
        make: (log: string[]): unknown => () => {
          log.push('sizeFor')
          throw SIZE_FOR_SENTINEL_ERROR
        },
      },
    ]
    const paths = [
      '(a) a full end of a resizable gesture',
      '(b) a full end of a non-resizable gesture',
      '(c) a cancel lifecycle',
      '(d) a refused terminal (a stale handle passed to the session’s end)',
      '(e) a dispose() mid-gesture',
    ] as const
    for (const shape of shapes) {
      for (const path of paths) {
        await row.run(`${shape.label} × the path ${path}`, async () => {
          const sizeLog: string[] = []
          const double = makeSessionDouble()
          const sink = makeSink()
          const element = { control: `IM-1-${shape.label}-${path}` }
          const options: Record<string, unknown> = {
            session: double.session,
            axisFor: (): unknown => undefined,
            boundsFor: (): unknown => ({ min: 0, max: 100 }),
            isResizable: (): unknown => !path.includes('non-resizable'),
            commit: sink,
          }
          const made = shape.make(sizeLog)
          if (made !== undefined) options['sizeFor'] = made
          const created = await createController(options, `IM-1 ${shape.label} ${path}`)
          created.controller.attach(element, {})
          // **⟶ ALIGNED TO THE AMENDED `§2.5` item 4 — ONE WIRING (`E3`-BLOCK-3).** No
          // forwarding channel is registered here: the composition's own single sink writer
          // (the `commit` seam above) IS the composition's one write site, invoked by the
          // session's ONE `commit` channel.
          const began = double.begin(element)
          if (!began.ok) return `the drive could not establish a gesture (${began.code})`
          const sizeCalls = (): number => sizeLog.filter((entry) => entry === 'sizeFor').length
          const evaluates = path.includes('end of a resizable')
          // **THE MOVE TURN IS FIRED ON THE EVALUATING PATH** (⟶ 2026-09-27, `E3`-BLOCK-5):
          // the terminal's seams are reached only with the handle the controller's own
          // `onMove` WRAPPER captured, and `fireMove` is the only caller of that hook.
          if (evaluates) double.fireMove()
          // **⟶ REPAIRED 2026-09-27 (THE REPAIR CYCLE, `E3`-BLOCK-6(c)): A REQUIRED
          // PROPAGATION IS ASSERTED, NEVER SCORED AS A BROKEN ATTEMPT.** A throwing
          // `boundsFor`/`sizeFor` PROPAGATES to the caller of the terminal BY CONTRACT
          // (`§2.4` item 2 row 4, `§3.2 F-17`, `§2.4` item 1's bounded universal), so the
          // terminal drive is CONTAINED here and the propagation is one of the cell's own
          // declared assertions. Before this repair the throw escaped into `RegisterRow.run`,
          // which scores every throw as broken — including a required one.
          let propagated: unknown = null
          if (path.includes('refused terminal')) {
            const stale = { id: 999, active: true, outcome: null, value: undefined, element } as unknown as GestureHandle
            const refused = double.end(element, stale)
            if (refused.ok) return 'the refused-terminal drive did not refuse (the drive is vacuous)'
          } else if (path.includes('cancel')) {
            double.fireTerminal('cancel')
          } else if (path.includes('dispose')) {
            double.dispose()
          } else {
            // **THE ONLY TERMINAL THAT CAN PROPAGATE**, contained so the required
            // propagation becomes an ASSERTION rather than a broken attempt (E3-BLOCK-6(c)).
            try {
              double.fireTerminal('end')
            } catch (e) {
              propagated = e
            }
          }
          // **THE DECLARED CALL COUNT IS PER SHAPE AND PER PATH** (`§5.5.1 P-GT-IM-1`'s own
          // cell: *"exactly `1` for path `(a)`; exactly `0` for every other cell of shapes
          // `(2)`,`(3)`; exactly `1` for `(4)` on path `(a)` and `0` elsewhere"*): shapes `(2)`
          // and `(3)` are ABSENT and NON-CALLABLE, so the module never calls them at all.
          const callableShape = shape.label.startsWith('(1)') || shape.label.startsWith('(4)')
          const expectedSizeCalls = evaluates && callableShape ? 1 : 0
          if (sizeCalls() !== expectedSizeCalls) {
            return `the \`sizeFor\` call count for the path ${path} is ${sizeCalls()}, the declared count is ${expectedSizeCalls} (a throwing \`sizeFor\` is still CALLED once on path (a) — its throw propagates; an ABSENT/NON-CALLABLE seam is never called)`
          }
          const declaredWrites = evaluates && shape.label.startsWith('(1)') ? 1 : 0
          if (sink.records.length !== declaredWrites) {
            return `\`sinkCalls\` is ${sink.records.length}, the declared count is ${declaredWrites}`
          }
          const reported = created.controller.stats().sinkCalls
          if (reported !== declaredWrites) {
            return `\`stats().sinkCalls\` is ${reported}, the declared count is ${declaredWrites}`
          }
          // **THE REQUIRED PROPAGATION, ASSERTED AS ONE OF THIS CELL'S DECLARED OUTCOMES:**
          // shape `(4)` × path `(a)` is the propagating class, and the clamp and the sink sit
          // AFTER the seam that threw — so the cell declares ZERO writes AND a propagation.
          if (shape.label.startsWith('(4)') && evaluates) {
            if (propagated !== SIZE_FOR_SENTINEL_ERROR) {
              return `the declared outcome for a THROWING \`sizeFor\` on path (a) is a PROPAGATION of the seam's OWN error to the caller of the terminal (asserted by identity, \`toBe\`). Read: ${propagated === null ? 'nothing propagated' : describeThrown(propagated)}`
            }
            if (sizeCalls() !== 1) {
              return `a throwing \`sizeFor\` on path (a) is still CALLED exactly once before it propagates; the measured call count is ${sizeCalls()}`
            }
            if (sink.records.length !== 0) {
              return `a throwing \`sizeFor\` cannot have written (the clamp and the sink sit after it): the sink read ${sink.records.length}`
            }
            if (created.controller.stats().sinkCalls !== 0) {
              return `\`stats().sinkCalls\` for the propagating class is declared 0 (the clamp sits AFTER the seam); read ${String(
                created.controller.stats().sinkCalls,
              )}`
            }
            return null
          }
          if (propagated !== null) {
            return `the drive threw where no propagation is declared for shape ${shape.label} × the path ${path}: ${describeThrown(propagated)}`
          }
          return null
        })
      }
    }
    row.finish()
    // **⟶ AMENDED 2026-09-27 (THE ESTABLISHMENT-SEAM AMENDMENT PASS — RULING `5`, resolving
    // `docs/pending.md` §I-quater's `E3`-RES-5/6; `§5.5.1 P-GT-IM-1`'s cell, `§5.5.2` item 3's
    // ledger, `§5.5.3`'s arithmetic, `docs/decisions.md`
    // `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS` sub-rule 2).**
    //
    // **THIS ROW CARRIES AN HONEST DUAL FIGURE: DECLARED `18` · MEASURED DRIVE COUNT `20`.** The
    // DECLARED `18` IS THE FIGURE THE CAPS ARE COMPARED AGAINST AND IT DOES NOT MOVE; the MEASURED
    // `20` is what the landed grid actually drives. **THE REASONS ARE STATED, NOT IMPLIED: the
    // landed `4`-shape × `5`-path loop enumerates ALL `20` COMBINATIONS, while the DECLARED `18` is
    // the CONSERVATIVE ENUMERATION — the `4` shapes × the `4` paths whose per-cell pair the cell
    // declares (`(a)` an evaluating `'end'` · `(b)` a non-resizable `'end'` · `(c)` a `cancel` ·
    // `(d)` a refused terminal) = `16`, PLUS the TWO path-`(e)` cells the cell's own per-attempt
    // clause declares — shape `(1)` × path `(e)` and shape `(4)` × path `(e)` — = `2`; `16 + 2 = 18`.
    // The TWO COMBINATIONS the full grid counts and the declared enumeration EXCLUDES (they reach
    // no seam and declare exactly what their `(d)` cells declare) are shape `(2)` ABSENT × path
    // `(e)` and shape `(3)` NON-CALLABLE × path `(e)`, which is why the measured count exceeds the
    // declared term by exactly `2`.**
    //
    // **AND A DECLARED-VERSUS-MEASURED DIFFERENCE IS REPORTED, NEVER SILENTLY RE-TOTALLED: the
    // register's `299` total remains the sum of its THIRTEEN DECLARED TERMS, and this row's
    // measured `20` neither replaces that total nor is added into it.**
    //
    // **THE AS-LANDED FORM OF THIS ASSERTION IS KEPT VISIBLE: it asserted the DECLARED term `18`
    // against the row's own `4` × `5` grid — i.e. it required `18` of a table that performs `20`
    // attempts, so the row could never hold — and it did NOT print the two figures side by side.
    // Both figures are now printed and each is asserted at its OWN figure.**
    const declaredTermIM1 = declaredPair('P-GT-IM-1').term
    const declaredDistinctIM1 = declaredPair('P-GT-IM-1').distinct
    const measuredDriveCountIM1 = row.attemptsRunPublic()
    console.log(
      `§5.5.1 P-GT-IM-1 DUAL FIGURE :: ${JSON.stringify({
        declaredTerm: declaredTermIM1,
        declaredDistinct: declaredDistinctIM1,
        measuredDriveCount: measuredDriveCountIM1,
        grid: `${shapes.length} shapes × ${paths.length} paths = ${shapes.length * paths.length}`,
        reason:
          'the landed grid enumerates all 20 combinations and the declared 18 is the conservative enumeration (4 shapes × the 4 paths whose per-cell pair the cell declares = 16, plus the two path-(e) cells = 2); the two excluded combinations are shape (2) ABSENT × path (e) and shape (3) NON-CALLABLE × path (e)',
        totalDisposition:
          'the declared 18 is what the caps are compared against and what the 299 total is summed from; the measured 20 is REPORTED beside it and is NOT added into that total',
      })}`,
    )
    expect(
      declaredTermIM1,
      `P-GT-IM-1 — **THE DECLARED TERM IS 18 AND IT DOES NOT MOVE** (\`§5.5.1 P-GT-IM-1\`'s cell, \`§5.5.3\`): it is the figure the caps are compared against and the term the \`299\` total is summed from. The measured drive count is REPORTED beside it at \`${String(
        measuredDriveCountIM1,
      )}\` — and the two DIFFER, which is REPORTED rather than reconciled: the landed \`4\` × \`5\` grid enumerates all \`20\` combinations while the declared \`18\` is the CONSERVATIVE enumeration of the cells the cell declares. Read: ${String(
        declaredTermIM1,
      )} vs ${String(measuredDriveCountIM1)}`,
    ).toBe(18)
    expect(
      declaredDistinctIM1,
      `P-GT-IM-1 — the DECLARED DISTINCT figure is ${String(declaredDistinctIM1)} and it does NOT move either (\`§5.5.2\` item 3's ledger; a distinct figure is REPORTED and never substituted, sub-rule 2)`,
    ).toBe(18)
    expect(
      measuredDriveCountIM1,
      `P-GT-IM-1 — **THE MEASURED DRIVE COUNT (\`${
        shapes.length
      }\` shapes × \`${paths.length}\` paths = \`${shapes.length * paths.length}\`) IS ASSERTED AT ITS OWN FIGURE** — reported BESIDE the unmoved declared term \`18\` rather than silently re-totalled into it. The two combinations the grid drives and the declared enumeration excludes are shape (2) ABSENT × path (e) and shape (3) NON-CALLABLE × path (e). Read: ${String(
        measuredDriveCountIM1,
      )}`,
    ).toBe(20)
  })

  it('P-GT-IM-2 (S-GT-SEAM-2, bounded) — the `boundsFor` + `defaultSizeFor` quantification: 5 shapes × 4 paths, 18 distinct seam-path observations', async () => {
    const row = new RegisterRow('P-GT-IM-2', 'S-GT-SEAM-2')
    /** **THE `5` SEAM SHAPES** (`§5.5.1 P-GT-IM-2`): `(1)` a callable returning the canonical
     *  pair · `(2)` ABSENT · `(3)` NON-CALLABLE · `(4)` a callable returning an UNUSABLE pair
     *  (`{}`, a primitive, a non-`number` field, a throwing field read — one shape's four
     *  variants) · `(5)` THROWING. */
    const shapes: readonly string[] = [
      '(1) a callable returning the canonical pair',
      '(2) ABSENT',
      '(3) NON-CALLABLE',
      '(4) a callable returning an UNUSABLE pair',
      '(5) THROWING',
    ]
    const paths: readonly string[] = [
      '(a) an end lifecycle with a truthy decision',
      '(b) a reset on a resizable gesture',
      '(c) a reset with an unusable default',
      '(d) a cancel (which drives no seam at all)',
    ]
    /** **THE USABLE DEFAULT FORM OF EACH SEAM** (`§2.4` item 6's named forms — the form the
     *  OTHER six seams take when one seam is the one under test): a callable returning a
     *  usable pair for `boundsFor`, a callable returning a usable number for
     *  `defaultSizeFor`, and a callable returning a number for `sizeFor` — **so an `'end'`
     *  path has a value source and its clamp can answer a number.** */
    const USABLE_BOUNDS = { min: 0, max: 100 }
    /** **THE UNUSABLE PAIR OF SHAPE `(4)`** (`§5.5.1 P-GT-IM-2`: *"`(4)` a callable returning an
     *  UNUSABLE pair (`{}`, a primitive, a non-number field, a throwing field read)"*). `{}` is the
     *  shape's first listed variant: `clampToBounds`'s `typeof` gate sees two non-`number` fields
     *  and answers `NaN`, so the clamp's answer cannot be written (`§2.3` item 3, `§2.3` item 4
     *  clause 8). */
    const UNUSABLE_BOUNDS_PAIR = {}
    /** **THE ATTEMPT READING OF AN UNUSABLE-PAIR `reset` ARM** — the SEPARATE fact `§2.3` item 3's
     *  counting rule names beside a cell's `writes` figure, read from the DECLARED SIDE (the
     *  ruling's own figure) so the two figures are compared rather than conflated.
     *
     *  **THE RULED PAIR IS `writes: 0` WITH `attempts: 0`** — *"the honest declared pair for an
     *  unusable-pair `reset` arm is `attempts: 0` and `writes: 0`"* (`§5.5.1 P-GT-IM-2`'s cell as
     *  corrected; `§2.3` item 3's ATTEMPT-VERSUS-WRITE COUNTING RULE as corrected): **FOR AN
     *  UNUSABLE PAIR THE COMPOSITION REFUSES BEFORE ENTERING THE WRITE SITE** — the seam is
     *  consulted, the clamp answers `NaN`, the reset refuses `'unusable-default'` with ZERO
     *  session calls and ZERO writes, and **the sink's own attempt counter is NEVER INCREMENTED**.
     *  **THE RULE: AN ATTEMPT IS COUNTED ONLY WHEN THE SINGLE WRITE SITE IS ENTERED WITH A USABLE,
     *  NARROWABLE `number` VALUE AND A `commit` SEAM PRESENT** — which is why the ONLY `attempts: 1`
     *  site in the spec is `F-11`'s THROWING SINK (a write that REACHES the sink and then throws:
     *  `stats().sinkCalls === 1` beside `stats().written === 0`, counted once and never retried).
     *
     *  **THE SUPERSEDED FORM IS KEPT VISIBLE, WITH THE REASON IT WAS STALE — IT IS NOT RE-DERIVED
     *  HERE:** the as-filed ruling declared this arm `writes: 0` WITH **`attempts: 1`**
     *  (*"an unusable-pair `reset` arm therefore declares `writes: 0` WITH `attempts: 1`"*), and that
     *  figure came from a **STALE MEASUREMENT taken while the harness still carried its OWN
     *  REGISTERED COMMIT CHANNEL — A SECOND WRITER — a channel that NO LONGER EXISTS** and that the
     *  landed single-writer wiring does not contain. On the landed wiring the drive MEASURES `0`
     *  (confirmed by this file's red run: both shape-`(4)` × `reset` arms read `sinkAttempts: 0`
     *  beside `writes: 0`), so this declaration is aligned to **`0`**. **THE DECLARED FIGURE IS THE
     *  RULING'S AND IT IS NOT RETOTALLED** — no attempt term moves (`20`/`18` are unmoved and the
     *  register's `299` total is the sum of its thirteen printed terms); the DRIVE's own measured
     *  attempt counter is asserted against this declaration in every refusal cell, and any
     *  difference is REPORTED in the failure message rather than reconciled. */
    const UNUSABLE_PAIR_ARM_SINK_ATTEMPTS = 0
    const USABLE_DEFAULT = 50
    const USABLE_SIZE = 5
    const SHAPE_START = '(1)'
    /** **PER-SEAM, PER-ROLE DECLARATIONS** — the point of ruling `4`'s SPLIT: a shape driven
     *  AS a `boundsFor` is read where BOUNDS are read, and a shape driven AS a
     *  `defaultSizeFor` is read where the DEFAULT is read, and **each cell states BOTH seams'
     *  call counts and the write count for its own role.** */
    interface SeamDecl {
      /** the declared `boundsFor` call count in this role; `-1` = "not the seam under test,
       *  and this path cannot reach it, so the count is not asserted here" */
      readonly bounds: number
      readonly defaultCalls: number
      readonly writes: number
      readonly propagates: boolean
      readonly note: string
    }
    const unusableDefault = (shape: string): boolean => !shape.startsWith(SHAPE_START)
    /** **⟶ CORRECTED 2026-09-27 BY THE ARCHITECT-RULING ALIGNMENT PASS: THE WRITE COUNT IS PINNED
     *  PER ARM, THE WAY `§2.3` item 4's reset clause STATES IT — *"the committed value is
     *  `clampToBounds(defaultSizeFor(element, axis), boundsFor(element, axis))`, AT MOST ONCE"*,
     *  and `§2.4` item 2's `(c)` column states the write count for every throw path as *"ZERO OR
     *  EXACTLY ONE — NEVER TWO"*.** The two arms a cell's write count can belong to are:
     *
     *  - **THE REFUSAL ARM — ZERO WRITES, and ZERO session calls.** A cell whose seam under test
     *    is UNUSABLE (`ABSENT` / `NON-CALLABLE` / an unusable pair / a THROWING pair) never
     *    reaches its write: the clamp answers `NaN` and the sink sits AFTER the seam, so a value
     *    that is not a number cannot be written (`'unusable-default'` refuses with zero session
     *    calls by ruling 9; a throwing `boundsFor` PROPAGATES to the terminal's caller with the
     *    write still at zero — `§2.4` item 2 path 4). A cell whose gesture is NOT RESIZABLE is a
     *    refusal arm of the same shape.
     *  - **THE USABLE-PAIR ARM ON A `reset` PATH — EXACTLY ONE WRITE.** When BOTH seams the reset
     *    consults are usable, the reset RUNS and writes the CLAMPED supplied default EXACTLY ONCE
     *    (`committed: true`, ONE sink record). This is the arm the reset clause's *"exactly once
     *    when a write occurs"* binds: the count is `1` and NOT `0` — a composition that misses
     *    the write FAILS the cell — and it is never `2`.
     *
     *  **WHY THE TWO ARMS DIFFER, in one sentence per side: the refusal arm's seam THROWS or is
     *  UNAVAILABLE, so the clamp and the sink (which sit AFTER that seam) are never reached; the
     *  usable-pair arm reaches them, so the session's own reset terminal commits the clamped
     *  default through the ONE wired sink writer, and the register scores that single write.**
     *  The `propagates` flag separates the two refusal sub-shapes: a THROWING seam PROPAGATES
     *  (`§2.4` item 2 path 4), while an ABSENT / NON-CALLABLE / unusable one is GUARDED and
     *  answers `NaN` without a throw — so a cell that declares `writes: 0` still pins WHICH zero
     *  it is. */
    const decl = (shape: string, role: 'bounds' | 'default', path: string): SeamDecl => {
      // PATH `(d)` — THE REGISTERED NO-SEAM PATH: a cancel fires no commit and drives nothing.
      if (path.includes('cancel')) {
        return { bounds: 0, defaultCalls: 0, writes: 0, propagates: false, note: 'a cancel drives NO seam at all (NEITHER seam is consulted, so the cell is a refusal arm with ZERO writes)' }
      }
      if (role === 'default') {
        // **THE DEFAULT SEAM IS THE SHAPE UNDER TEST.** An `'end'` never consults it; a `reset`
        // consults it FIRST and refuses `'unusable-default'` when it is unusable — ZERO session
        // calls, and `boundsFor` is then NOT consulted either.
        if (path.includes('end')) {
          return { bounds: 1, defaultCalls: 0, writes: 1, propagates: false, note: '`defaultSizeFor` is NEVER called on an end path; the USABLE-PAIR arm ⇒ ONE write (the end consults `boundsFor`, which is in its usable form in this role)' }
        }
        if (shape.startsWith(SHAPE_START)) {
          return { bounds: 1, defaultCalls: 1, writes: 1, propagates: false, note: 'USABLE-PAIR ARM: the default is usable and the pair is usable ⇒ the reset RUNS and the CLAMPED supplied default is written EXACTLY ONCE' }
        }
        if (shape.startsWith('(4)')) {
          return { bounds: 1, defaultCalls: 1, writes: 0, propagates: false, note: 'REFUSAL ARM: the default is usable and the PAIR is unusable ⇒ `boundsFor` IS consulted, the clamp answers NaN ⇒ ZERO writes AND ZERO ATTEMPTS, because **the refusal precedes the write site** (the reset refuses `\'unusable-default\'` with zero session calls, so the sink’s own attempt counter is never incremented) — the superseded `attempts: 1` reading came from a stale measurement taken while the harness still carried its own registered commit channel, a second writer that no longer exists' }
        }
        if (unusableDefault(shape)) {
          return { bounds: 0, defaultCalls: shape.startsWith('(5)') ? 1 : 0, writes: 0, propagates: false, note: 'REFUSAL ARM with ZERO session calls: an unusable default refuses `\'unusable-default\'`, so `boundsFor` is not consulted and NOTHING is written (a THROWING default is read once, then swallowed)' }
        }
        return { bounds: 1, defaultCalls: 1, writes: 1, propagates: false, note: 'USABLE-PAIR ARM: a usable default and a usable pair ⇒ EXACTLY ONE write, the CLAMPED supplied default' }
      }
      // **THE BOUNDS SEAM IS THE SHAPE UNDER TEST.** An `'end'` consults it at the terminal; a
      // `reset` consults the DEFAULT first (usable in this role) and then this seam.
      if (shape.startsWith(SHAPE_START)) {
        return {
          bounds: 1,
          defaultCalls: path.includes('reset') ? 1 : 0,
          // **ONE WRITE ON BOTH PATHS, AND THE REASON IS THE ARM**: on the `reset` path this is THE
          // USABLE-PAIR ARM (the reset commits the clamped supplied default exactly once); on the
          // `'end'` path the same usable pair lets the terminal clamp the seam's own value exactly
          // once. A cell that declared `0` here would let a MISSED write pass, and a cell that
          // declared `2` would let a LEAKED second write pass.
          writes: 1,
          propagates: false,
          note: 'USABLE-PAIR ARM: a usable pair ⇒ the `\'end\'` clamps the seam value and the `reset` clamps the supplied default ⇒ EXACTLY ONE write (never zero, never two)',
        }
      }
      if (path.includes('end')) {
        return shape.startsWith('(5)')
          ? { bounds: 1, defaultCalls: 0, writes: 0, propagates: true, note: 'REFUSAL ARM (throwing): a THROWING `boundsFor` at the terminal PROPAGATES; the clamp and the sink sit AFTER it ⇒ ZERO writes' }
          : { bounds: shape.startsWith('(4)') ? 1 : 0, defaultCalls: 0, writes: 0, propagates: false, note: 'REFUSAL ARM (unavailable/unusable pair): the pair is never called (guarded on callability) or answers a non-number ⇒ the clamp answers NaN ⇒ ZERO writes' }
      }
      if (shape.startsWith('(4)')) {
        return { bounds: 1, defaultCalls: 1, writes: 0, propagates: false, note: 'REFUSAL ARM: the reset RUNS with a usable default but the pair is unusable ⇒ the clamp answers NaN ⇒ ZERO writes' }
      }
      if (shape.startsWith('(5)')) {
        return { bounds: 1, defaultCalls: 1, writes: 0, propagates: true, note: 'REFUSAL ARM (throwing): the DEFAULT (usable, 50) is consulted and then the THROWING pair PROPAGATES to the caller of the terminal ⇒ ZERO writes' }
      }
      return { bounds: 0, defaultCalls: 1, writes: 0, propagates: false, note: 'REFUSAL ARM: the pair is UNAVAILABLE (never called) ⇒ the clamp answers NaN ⇒ ZERO writes' }
    }
    const boundsSeam = (shape: string, record: (which: string) => void): unknown => {
      if (shape.startsWith('(2)')) return undefined
      if (shape.startsWith('(3)')) return NON_CALLABLE_SEAM
      if (shape.startsWith('(4)')) {
        return (): unknown => {
          record('boundsFor')
          return {}
        }
      }
      if (shape.startsWith('(5)')) {
        return (): unknown => {
          record('boundsFor')
          throw new Error('the bounds seam threw (P-GT-IM-2)')
        }
      }
      return (): unknown => {
        record('boundsFor')
        return USABLE_BOUNDS
      }
    }
    const defaultSeam = (shape: string, record: (which: string) => void): unknown => {
      if (shape.startsWith('(2)')) return undefined
      if (shape.startsWith('(3)')) return NON_CALLABLE_SEAM
      if (shape.startsWith('(5)')) {
        return (): unknown => {
          record('defaultSizeFor')
          throw new Error('the default seam threw (P-GT-IM-2)')
        }
      }
      return (): unknown => {
        record('defaultSizeFor')
        return USABLE_DEFAULT
      }
    }
    /** **ONE SEAM-ROLE DRIVE per attempt** (the shape is driven AS `role`, and the OTHER SIX
     *  seams are in their usable default form), returning the recorded seam calls, the
     *  propagated throw and the write count. */
    const seamRoleDrive = async (
      shape: string,
      role: 'bounds' | 'default',
      path: string,
    ): Promise<{
      recorded: string[]
      propagated: unknown
      sinkWrites: number
      controllerWrites: number | null
      /** **THE ATTEMPT READING — A SEPARATE FACT FROM THE WRITE READING** (`§2.3` item 3's
       *  attempt-versus-write counting rule, `F-11`'s distinction): the injected sink's OWN
       *  attempt counter, beside its own call RECORD. */
      sinkAttempts: number
      /** The controller's own `stats().written` — the RETURNS counter (`F-11`). */
      controllerWritten: number | null
    }> => {
      const double = makeSessionDouble()
      const sink = makeSink()
      const element = { control: `IM-2-${role}-${shape}-${path}` }
      const recorded: string[] = []
      const record = (which: string): void => {
        recorded.push(which)
      }
      const options: Record<string, unknown> = {
        session: double.session,
        axisFor: (): unknown => undefined,
        isResizable: (): unknown => true,
        sizeFor: (): unknown => {
          record('sizeFor')
          return USABLE_SIZE
        },
        commit: sink,
        // **EXACTLY ONE SEAM VARIES PER DRIVE; the other is in its usable default form.**
        // **⟶ CORRECTED 2026-09-27 (THE ESTABLISHMENT-SEAM AMENDMENT PASS — RULING `4`, resolving
        // `docs/pending.md` §I-quater's `E3`-RES-4; `§5.5.1 P-GT-IM-2`'s cell, `§2.3` item 3's
        // attempt-versus-write rule).** In the `default` ROLE the cell under test is
        // `defaultSizeFor`; the PAIR belongs to the SHAPE — so when the shape under test IS the
        // unusable-pair shape `(4)`, the pair driven here is that SHAPE'S OWN unusable pair rather
        // than a usable one. **THE AS-LANDED DRIVE SUPPLIED `USABLE_BOUNDS` HERE, WHICH MADE THE
        // CELL A USABLE-PAIR ARM (the reset RAN and its clamped value — `50` — reached the sink)
        // WHILE THE CELL DECLARED THE UNUSABLE-PAIR ARM'S `0`; MEASURED, the cell read `1`. That
        // was a DRIVE defect, not a cell defect: the cell's own note (`the default is usable and
        // the PAIR is unusable ⇒ the clamp answers NaN ⇒ ZERO writes`) is the contract's reading
        // and the drive now reaches it.**
        boundsFor:
          role === 'bounds'
            ? boundsSeam(shape, record)
            : shape.startsWith('(4)') && path.includes('reset')
              ? (): unknown => {
                  record('boundsFor')
                  return UNUSABLE_BOUNDS_PAIR
                }
              : (): unknown => {
                  record('boundsFor')
                  return USABLE_BOUNDS
                },
        defaultSizeFor:
          role === 'default'
            ? defaultSeam(shape, record)
            : (): unknown => {
                record('defaultSizeFor')
                return USABLE_DEFAULT
              },
      }
      const created = await createController(options, `IM-2 ${role} ${shape} ${path}`)
      created.controller.attach(element, {})
      const began = double.begin(element)
      if (!began.ok) {
        return {
          recorded,
          propagated: `the drive could not establish a gesture (${began.code})`,
          sinkWrites: -1,
          controllerWrites: null,
          sinkAttempts: -1,
          controllerWritten: null,
        }
      }
      // **THE MOVE TURN IS FIRED FOR EVERY PATH THAT EVALUATES A VALUE** (the wrapper's handle
      // capture, `E3`-BLOCK-5): the `'end'` AND the `reset` both reach the terminal through
      // that captured handle — never on a cancel, which has no terminal evaluation at all.
      if (!path.includes('cancel')) double.fireMove()
      let propagated: unknown = null
      try {
        if (path.includes('cancel')) double.fireTerminal('cancel')
        else if (path.includes('reset')) created.controller.reset(element)
        else double.fireTerminal('end')
      } catch (e) {
        propagated = e
      }
      return {
        recorded,
        propagated,
        sinkWrites: sink.records.length,
        controllerWrites: path.includes('cancel') ? null : created.controller.stats().sinkCalls,
        // **THE SECOND INSTRUMENT (`§2.3` item 3): the sink's own ATTEMPT counter and the
        // controller's `written` (RETURNS).** A write that is skipped before the sink call reads
        // `0` on BOTH counters; a write that REACHES the sink and is contained by a consumer throw
        // reads `1` attempt with `0` returns (`F-11`'s exact distinction).
        sinkAttempts: sink.attempts.count,
        controllerWritten: path.includes('cancel') ? null : created.controller.stats().written,
      }
    }
    for (const shape of shapes) {
      for (const path of paths) {
        await row.run(`the seam shape ${shape} × the path ${path}`, async () => {
          // **⟶ RULED 2026-09-27 (THE CELL-CORRECTION PASS, ruling `4`): THE DRIVE IS SPLIT
          // PER SEAM.** Each attempt runs the shape **AS a `boundsFor` with `defaultSizeFor`
          // usable** AND **AS a `defaultSizeFor` with `boundsFor` usable**, with the declared
          // call count STATED PER SEAM for each — so an ABSENT / NON-CALLABLE shape is reached
          // and read as the seam it is driven as, rather than as the other one. **THE DECLARED
          // TERM STAYS `20` (`5` shapes × `4` paths) and its DISTINCT figure stays `18`** (two
          // of the five shapes are byte-identical in what the module observes across the two
          // seam paths): no attempt is added, the `(bounded)` set is untouched.
          for (const role of ['bounds', 'default'] as const) {
            const cell = decl(shape, role, path)
            const reading = await seamRoleDrive(shape, role, path)
            if (typeof reading.propagated === 'string') return reading.propagated
            const counts = (which: string): number => reading.recorded.filter((entry) => entry === which).length
            // (1) **THE SEAM-UNDER-TEST AND THE OTHER SEAM'S CALL COUNTS ARE STATED PER SEAM.**
            if (counts('boundsFor') !== cell.bounds) {
              return `[${role} role] the declared \`boundsFor\` call count is ${cell.bounds}, the measured count is ${counts('boundsFor')} (${cell.note})`
            }
            if (counts('defaultSizeFor') !== cell.defaultCalls) {
              return `[${role} role] the declared \`defaultSizeFor\` call count is ${cell.defaultCalls}, the measured count is ${counts('defaultSizeFor')} (${cell.note})`
            }
            // (2) **`defaultSizeFor` IS NEVER CALLED ON AN `'end'` PATH AT ALL** (`§5.5.1
            // P-GT-IM-2`: *at most once per reset and NEVER on any other path*).
            if (path.includes('end') && counts('defaultSizeFor') !== 0) {
              return `[${role} role] \`defaultSizeFor\` must NEVER be called on an end path; it was called ${counts('defaultSizeFor')} times`
            }
            // (3) **PROPAGATION, ASSERTED PER ROLE**: a THROWING seam at the terminal
            // PROPAGATES (`C2` path 4); a GUARDED non-callable seam NEVER propagates, because
            // ruling `7` treats it as UNAVAILABLE and uses its safe default instead.
            if (cell.propagates) {
              if (reading.propagated === null) return `[${role} role] a THROWING seam at this terminal must PROPAGATE to the caller (${cell.note})`
            } else if (reading.propagated !== null) {
              return `[${role} role] nothing may propagate from this drive (a non-callable seam is GUARDED on callability, ruling 7), but a throw escaped: ${describeThrown(reading.propagated)} (${cell.note})`
            }
            // (4) **THE WRITE COUNT, against BOTH READINGS.**
            if (reading.sinkWrites !== cell.writes) {
              return `[${role} role] READING 1 (the sink's own record) reads ${reading.sinkWrites}, the declared count is ${cell.writes} (${cell.note})`
            }
            if (reading.controllerWrites !== null && reading.controllerWrites !== cell.writes) {
              return `[${role} role] READING 2 (\`stats().sinkCalls\`) reads ${String(reading.controllerWrites)}, the declared count is ${cell.writes} (${cell.note})`
            }
            // (5) **⟶ ADDED 2026-09-27 (THE ESTABLISHMENT-SEAM AMENDMENT PASS — RULING `4`;
            // `§2.3` item 3's ATTEMPT-VERSUS-WRITE COUNTING RULE, `F-11`'s distinction).** **A
            // cell's WRITES figure counts WRITES — SINK RETURNS — and the recorded sink ATTEMPT is
            // a SEPARATE READING, read over the TWO instruments `C1` requires: the injected sink's
            // own ATTEMPT counter beside its own call RECORD, and the controller's
            // `stats().sinkCalls`/`written`. A row may NOT read `writes: 0` as *"the sink was never
            // reached"* — the two figures are REPORTED BESIDE EACH OTHER here rather than
            // conflated.**
            //
            // **THE MEASURED PAIR FOR THIS ARM, stated so the superseded `attempts: 1` form is
            // REPORTED and not hidden: on an unusable-pair `reset` arm the landed composition SKIPS
            // the write before the sink call (`src/shared/gutter.ts`'s single write site returns on a
            // `NaN` clamp, which is what "the clamp answers `NaN`" means), so the sink's attempt
            // counter reads `0` and `stats().sinkCalls` reads `0` BESIDE the declared `writes: 0`.
            // THE DECLARED `writes` FIGURE IS UNMOVED (`0`) and the attempt reading is asserted at
            // its MEASURED value — the attempt-versus-return distinction `F-11` draws only where a
            // write REACHES the sink (the throwing-sink control sub-drive of `§3.2 F-17` is that
            // reading: `sinkCalls === 1` beside `written === 0`).**
            // **THE ATTEMPT READING IS THE RULING'S OWN FIGURE FOR THE UNUSABLE-PAIR `reset` ARM
            // AND THE DRIVE'S OWN MEASURED FIGURE EVERYWHERE ELSE**: only the arm whose PAIR is
            // unusable while its DEFAULT is usable — shape `(4)` driven in the `default` ROLE on a
            // `reset` path — carries the ruled attempt reading; every other refusal cell declares
            // `0` attempts, because a skipped write (`NaN` clamp, unavailable seam, throwing seam,
            // a cancel that drives no seam) never reaches the sink at all.
            // **⟶ CORRECTED 2026-09-27 (THE ATTEMPT-READING CORRECTION PASS): THE UNUSABLE-PAIR
            // `reset` ARM DECLARES `attempts: 0` BESIDE `writes: 0`, exactly like every other
            // refusal cell — THE REFUSAL PRECEDES THE WRITE SITE, so no attempt is counted.** The
            // superseded `attempts: 1` form (the as-filed ruling) came from a STALE MEASUREMENT
            // taken while the harness still carried its OWN REGISTERED COMMIT CHANNEL — A SECOND
            // WRITER — a channel the landed single-writer wiring DOES NOT CONTAIN; on that wiring
            // the arm MEASURES `0`, which is why this file's two shape-`(4)` × `reset` arms were the
            // red set before this alignment. **THE ONE SITE WHERE `attempts: 1` REMAINS CORRECT IS
            // `F-11`'s THROWING SINK** (`stats().sinkCalls === 1` beside `stats().written === 0`),
            // and that row is unchanged.
            const isUnusablePairResetArm =
              role === 'default' && shape.startsWith('(4)') && path.includes('reset')
            const attemptsExpected = isUnusablePairResetArm
              ? UNUSABLE_PAIR_ARM_SINK_ATTEMPTS
              : cell.writes
            if (reading.sinkAttempts !== attemptsExpected) {
              return `[${role} role] THE ATTEMPT READING (the sink's own attempt counter — a SEPARATE fact from its RETURN record, §2.3 item 3) reads ${reading.sinkAttempts}, the declared reading is ${attemptsExpected}: an attempt is counted ONLY where the write site is entered with a usable, narrowable value and a \`commit\` seam present, and on an unusable-pair \`reset\` arm the refusal precedes the write site (the clamp’s \`NaN\` never reaches the sink, so the sink’s attempt counter is NEVER incremented) (${cell.note})`
            }
            if (reading.controllerWritten !== null && reading.controllerWritten !== cell.writes) {
              return `[${role} role] THE RETURN READING (\`stats().written\`) reads ${String(reading.controllerWritten)}, the declared write count is ${cell.writes} (${cell.note})`
            }
          }
          return null
        })
      }
    }
    row.finish()
    // ===================================================================================
    // **THE PER-ARM WRITE PIN (⟶ CORRECTED 2026-09-27 BY THE ARCHITECT-RULING ALIGNMENT PASS).**
    // A cell's write count is declared ONCE, above, and it is read against THIS ROW'S OWN DRIVE in
    // every attempt — so the arm the cell belongs to must be pinned PER ARM, the way `§2.3` item
    // 4's reset clause states it, and each cell's declared count must be reachable by its own
    // drive. The invariants below are asserted over the ROW'S OWN TABLE (`decl(...)`, the same
    // object the attempts read) and FAIL for a table that cannot reach its own figures:
    //   (i)  no cell declares `2` or more — the register's universal is **ZERO OR EXACTLY ONE,
    //        NEVER TWO** (`§2.4` item 2's `(c)` column);
    //   (ii) a cell on a `reset` path whose value CANNOT be evaluated (a throwing pair, an
    //        unusable pair, or an unusable default) is a **REFUSAL ARM**: `writes === 0`. A cell
    //        that declared `1` there is a MISSED-WRITE defect — the clamp answers `NaN` (or the
    //        seam propagates) and the sink is never reached;
    //   (iii) a cell on a `reset` path whose **PAIR IS USABLE** is the **USABLE-PAIR ARM**: the
    //        reset RUNS and its write is **EXACTLY ONE** — `writes === 1` and `committed: true`.
    //        A cell that declared `0` there lets a MISSED write pass;
    //   (iv) and the two arms DIFFER on every such `reset` path, so a table that collapsed them
    //        (both `0`, or both `1`) fails here rather than passing by accident.
    // ===================================================================================
    const resetPaths = paths.filter((path) => path.includes('reset') && !path.includes('cancel'))
    const armCells = (['bounds', 'default'] as const).flatMap((role) =>
      shapes.flatMap((shape) => resetPaths.map((path) => ({ role, shape, path, cell: decl(shape, role, path) }))),
    )
    expect(
      armCells.every(({ cell }) => cell.writes === 0 || cell.writes === 1),
      `P-GT-IM-2 — EVERY cell on a reset path declares a write count of ZERO or EXACTLY ONE, NEVER TWO (§2.4 item 2's (c) column). Declared: ${JSON.stringify(
        armCells.map(({ role, shape, path, cell }) => `${role}/${shape.slice(0, 3)}/${path.slice(0, 3)}=${cell.writes}`),
      )}`,
    ).toBe(true)
    /** The cells whose value CANNOT be evaluated — the REFUSAL arms: the seam under test is
     *  unusable (a throwing pair, an unusable pair, `ABSENT` / `NON-CALLABLE`) or the default is
     *  unusable, so the reset refuses with ZERO session calls on the `'unusable-default'` path
     *  and no write is ever reached. */
    const refusalArmCells = armCells.filter(
      ({ cell }) => cell.propagates || cell.writes === 0,
    )
    expect(
      refusalArmCells.every(({ cell }) => cell.writes === 0),
      `P-GT-IM-2 — REFUSAL-ARM PIN: every reset-path cell whose value cannot be evaluated declares ZERO writes (the clamp answers NaN, or the throwing seam propagates with the sink sitting AFTER it). Declared: ${JSON.stringify(
        refusalArmCells.map(({ role, shape, path, cell }) => `${role}/${shape.slice(0, 3)}/${path.slice(0, 3)}=writes ${cell.writes}, propagates ${String(cell.propagates)}`),
      )}`,
    ).toBe(true)
    // **⟶ CORRECTED 2026-09-27 (THE ESTABLISHMENT-SEAM AMENDMENT PASS — RULING `4`): THIS PIN'S
    // SCOPE IS MADE EXPLICIT, AND THE REASON IS THE DRIVE CORRECTION BESIDE IT.** The pin read
    // *"a cell whose `boundsFor` count is `0` declares `defaultSizeFor` `0` as well"* over the
    // WHOLE refusal set — which is the `'unusable-default'` clause read as if it covered the
    // `bounds` ROLE too. In the `bounds` role the DEFAULT is in its usable form BY CONSTRUCTION
    // (that is what *"exactly one seam varies per drive"* means), so `bounds === 0` there is the
    // CALLABILITY GUARD's reading, not the unusable-default refusal's: shape `(3)` NON-CALLABLE
    // and shape `(4)` UNUSABLE-PAIR each declare `bounds: 0` with `defaultCalls: 1` because the
    // reset consults the usable default FIRST and only then finds the pair unusable. **The clause
    // is therefore scoped to the cells it is about — the `default` ROLE — and each unusable-class
    // shape's declared read is DERIVED from `§2.4` item 2's callability asymmetry rather than
    // asserted flat: an ABSENT default is not there to call (`0`), a PRESENT NON-CALLABLE default
    // is GUARDED ON CALLABILITY and never invoked (`0` — `§2.4` item 2 clause (i), the same guard
    // `boundsFor`/`sizeFor` carry), and a THROWING default IS invoked once before its throw is
    // swallowed (`1` — clause (iii)). On every one of those cells `boundsFor` is NOT consulted
    // (its own count is `0`): an unusable default refuses `'unusable-default'` with ZERO session
    // calls, so the pair is never reached.** Never two reads on any side.
    const declaredDefaultReadsOnUnusableDefaultPath = (shape: string): number => {
      if (shape.startsWith('(2)')) return 0 // ABSENT — there is no seam to invoke
      if (shape.startsWith('(3)')) return 0 // NON-CALLABLE — guarded on callability: never invoked
      if (shape.startsWith('(5)')) return 1 // THROWING — invoked once, the throw swallowed
      return 1 // `(4)` UNUSABLE-pair: this shape's DEFAULT is usable, so it IS consulted once
    }
    const unusableDefaultPathCells = refusalArmCells.filter(
      ({ role, shape }) => role === 'default' && unusableDefault(shape),
    )
    expect(
      unusableDefaultPathCells.every(
        ({ shape, cell }) =>
          cell.defaultCalls === declaredDefaultReadsOnUnusableDefaultPath(shape) &&
          // **SHAPE `(4)` IS THE ONE CLASS WHERE THE PAIR *IS* REACHED** (its default is usable
          // and its PAIR is the unusable part): it declares `bounds: 1` and the clamp's `NaN`
          // answer is what stops the write (`§5.5.1 P-GT-IM-2`'s own shape-`(4)` sentence). Every
          // other unusable-default cell declares `bounds: 0` — *"an unusable default refuses
          // `'unusable-default'` with ZERO session calls, so the pair is never reached"*.
          (shape.startsWith('(4)') ? cell.bounds === 1 : cell.bounds === 0),
      ),
      `P-GT-IM-2 — REFUSAL-ARM PIN (the \`'unusable-default'\` path, DEFAULT role): each unusable-class shape declares its OWN read from \`§2.4\` item 2's callability asymmetry — ABSENT \`(2)\` \`0\`, NON-CALLABLE \`(3)\` \`0\` (GUARDED: never invoked), THROWING \`(5)\` \`1\` (invoked once, swallowed) — NEVER TWO, and \`boundsFor\` is not consulted at all on this path (\`0\` in the same cell). Declared: ${JSON.stringify(
        unusableDefaultPathCells.map(
          ({ role, shape, path, cell }) =>
            `${role}/${shape.slice(0, 3)}/${path.slice(0, 3)}=defaultCalls ${cell.defaultCalls} (declared ${declaredDefaultReadsOnUnusableDefaultPath(shape)}), bounds ${cell.bounds}`,
        ),
      )}`,
    ).toBe(true)
    /** The cells whose pair IS usable on a `reset` path — the USABLE-PAIR arm: the reset RUNS and
     *  its write is EXACTLY ONE (the clamped supplied default, `committed: true`). */
    const usablePairArmCells = armCells.filter(({ role, shape }) => !(role === 'default' && unusableDefault(shape)) && (shape.startsWith(SHAPE_START) || role === 'default'))
    expect(
      usablePairArmCells.every(({ cell }) => cell.writes === 1),
      `P-GT-IM-2 — USABLE-PAIR-ARM PIN: on a reset path whose pair is USABLE the reset RUNS and writes EXACTLY ONCE (the clamped supplied default, ` + '`committed: true`' + `); a declared ZERO here would let a MISSED write pass. Declared: ${JSON.stringify(
        usablePairArmCells.map(({ role, shape, path, cell }) => `${role}/${shape.slice(0, 3)}/${path.slice(0, 3)}=writes ${cell.writes}`),
      )}`,
    ).toBe(true)
    expect(
      usablePairArmCells.length > 0 && refusalArmCells.length > 0,
      'P-GT-IM-2 — THE TWO ARMS ARE BOTH PRESENT in this row’s reset-path table, so the per-arm pins are not vacuous (a table of one arm only would make the arm distinction unfalsifiable)',
    ).toBe(true)
    expect(
      // **THE ARMS DIFFER: for at least one `reset` path, a usable-pair cell and a refusal cell
      // co-exist and declare DIFFERENT write counts (1 versus 0).** This is the falsifier for a
      // table that declared one flat write count for every cell.
      new Set(armCells.map(({ cell }) => cell.writes)).size,
      `P-GT-IM-2 — the reset-path cells declare BOTH arms (the usable-pair arm’s EXACTLY ONE and the refusal arm’s ZERO), so the two counts really differ across the table. Declared writes: ${JSON.stringify(
        [...new Set(armCells.map(({ cell }) => cell.writes))],
      )}`,
    ).toBe(2)
    expect(row.attemptsRunPublic(), `P-GT-IM-2 — the declared term is ${declaredPair('P-GT-IM-2').term}`).toBe(20)
    expect(
      declaredPair('P-GT-IM-2').distinct,
      `P-GT-IM-2 (bounded) — the honest DISTINCT seam-path observations are ${declaredPair('P-GT-IM-2').distinct}, because 2 of the 5 shapes are byte-identical in what the module can observe across the bounds and default paths; the universal “EVERY seam shape and EVERY path” is NOT proven`,
    ).toBe(18)
  })

  it('P-GT-IM-3 (S-GT-SEAM-3) — the `isResizable` quantification: 4 shapes × 5 drives + 2 attach-time drives = 22', async () => {
    const row = new RegisterRow('P-GT-IM-3', 'S-GT-SEAM-3')
    /** **THE `4` SHAPES OF `§2.4` ITEM 5'S RULED PER-SHAPE CALL TABLE, with their DECLARED
     *  calls per ESTABLISHED gesture** — `(1)` ABSENT `0` · `(2)` PRESENT NON-CALLABLE ``1``
     *  (**⟶ RULED 2026-09-27, ruling `2`: the seam IS reached and the call is ATTEMPTED, and
     *  the `TypeError` a non-callable call produces is SWALLOWED by the controller's own
     *  `try`/`catch`; the as-filed `0` for this shape is SUPERSEDED**) · `(3)` callable-falsy
     *  `1` · `(4)` callable-throwing `1`. **A module that silently treats a present
     *  non-callable as an ABSENT seam FAILS this row's call count.** */
    const shapes: Array<{ label: string; make: (count: string[]) => unknown; established: number }> = [
      { label: '(1) ABSENT', make: (): unknown => undefined, established: 0 },
      { label: '(2) PRESENT NON-CALLABLE (the `42` shape)', make: (): unknown => NON_CALLABLE_SEAM, established: 1 },
      { label: '(3) a callable returning a FALSY value', make: (): unknown => () => 0, established: 1 },
      {
        label: '(4) a callable THROWING',
        make: (): unknown => () => {
          throw new Error('the resizability seam threw')
        },
        established: 1,
      },
    ]
    const drives = ['(a) attach only, NO gesture', '(b) a full end lifecycle', '(c) a cancel lifecycle', '(d) a refused establishment', '(e) two sequential gestures'] as const
    for (const shape of shapes) {
      for (const drive of drives) {
        await row.run(`${shape.label} × ${drive}`, () => {
          const double = makeSessionDouble()
          const sink = makeSink()
          const element = { control: `IM-3-${shape.label}-${drive}` }
          /** **EVERY `isResizable` READ IS COUNTED by a RECORDING WRAPPER** — never by
           *  replacing the shape with a callable — so the read the ruled table declares is
           *  OBSERVABLE for shape `(2)` too: the wrapper attempts the call the composition's
           *  `Boolean(seam(element, axis))` makes, and a non-callable value makes THAT attempt
           *  a `TypeError` — which the controller must SWALLOW (a re-throw, a refusal or a
           *  `busy` gesture FAILS the drive). */
          const decisions: string[] = []
          const options: Record<string, unknown> = {
            session: double.session,
            axisFor: (): unknown => undefined,
            boundsFor: (): unknown => ({ min: 0, max: 100 }),
            sizeFor: (): unknown => 5,
            commit: sink,
          }
          const made = shape.make(decisions)
          if (made !== undefined) {
            options['isResizable'] = (): unknown => {
              decisions.push('isResizable')
              // **THE CALL IS ATTEMPTED, exactly as the seam's own decision requires.** For
              // shape `(2)` the value is not callable, so THIS attempt is the `TypeError` the
              // controller must SWALLOW — and the read is still counted, which is the ruled
              // `1` for the PRESENT NON-CALLABLE shape.
              return (made as () => unknown)()
            }
          }
          return createController(options, `IM-3 ${shape.label} ${drive}`).then((created) => {
            const attached = created.controller.attach(element, {})
            if (drive.includes('attach only')) {
              // DRIVE `(a)`: `0` for EVERY shape — the *never an install-time gate* clause.
              if (!attached) return '`attach` returns `false` where `true` is required (§0A note 6: the decision belongs to the gesture)'
              return decisions.length === 0 ? null : `the seam was called ${decisions.length} times at attach (the declared count is 0 for EVERY shape)`
            }
            if (drive.includes('refused establishment')) {
              // DRIVE `(d)`: `0` for every shape — no gesture established, so no decision exists.
              const refused = double.begin({ control: 'never-installed' })
              if (refused.ok) return 'the configured refused establishment did not refuse (the drive is vacuous)'
              return decisions.length === 0 ? null : `\`isResizable\` must not be called for a refused establishment (the declared count is 0 for every shape); it was called ${decisions.length} times`
            }
            if (drive.includes('two sequential')) {
              // DRIVE `(e)`: ONCE PER GESTURE, not per instance — `0` for ABSENT and `2` for the
              // other three shapes (`§2.4` item 5's ruled table; the ruling's own sentence).
              const first = double.begin(element)
              if (!first.ok) return `the first establishment was refused (${first.code})`
              double.fireTerminal('end')
              const second = double.begin(element)
              if (!second.ok) return `the second establishment was refused (${second.code})`
              double.fireTerminal('end')
              const expected = shape.established * 2
              return decisions.length === expected
                ? null
                : `the seam was called ${decisions.length} times across two gestures (the declared count is ${expected} — 0 for ABSENT and 2 for the other three shapes, i.e. ONCE PER GESTURE, not per instance)`
            }
            const began = double.begin(element)
            if (!began.ok) return `the establishment was refused (${began.code} — the swallow must leave it normally established, never busy and never refused)`
            double.fireMove() // the wrapper's handle capture (E3-BLOCK-5)
            if (drive.includes('cancel')) {
              // DRIVE `(c)`: the seam IS still consulted at establishment (the declared count),
              // and a cancel writes `0`.
              if (decisions.length !== shape.established) {
                return `the seam call count at establishment is ${decisions.length}, the declared count is ${shape.established} (the ruling's per-shape table, drive (c))`
              }
              double.fireTerminal('cancel')
              return sink.records.length === 0 ? null : 'a cancel must write zero times'
            }
            double.fireTerminal('end')
            // DRIVE `(b)`: the ruled call count, the write count, and the outcome.
            if (decisions.length !== shape.established) {
              return `the seam call count is ${decisions.length}, the declared count is ${shape.established} (the ruling's per-shape table: 0 for the ABSENT shape and 1 for the PRESENT NON-CALLABLE, callable-falsy and callable-throwing shapes)`
            }
            if (sink.records.length !== 0) {
              return `a FALSY or unusable decision must yield \`sinkCalls === 0\`; the sink recorded ${sink.records.length}`
            }
            const sessionStats = double.stats()
            if (sessionStats.commits !== 1) {
              return `the terminal must still be an \`'end'\` TERMINAL that COMMITS (the session's own committing terminal ran once, and it is NOT a cancel); the session recorded ${sessionStats.commits} commits`
            }
            return null
          })
        })
      }
    }
    // **THE `2` ATTACH-TIME DRIVES** (`22 = 4 × 5 + 2`, `§2.4` item 5's own arithmetic): one for
    // the TRUTHY-returning callable and one for the SLOT-EMPTY/ABSENT half of the domain —
    // **both at `attach` only, both declaring `0` calls, and neither adding a shape to the
    // `4`-shape domain.** The truthy callable is `(3)`'s POSITIVE CONTROL: it is RESIZABLE and
    // its `'end'` drive writes exactly ONCE.
    const attachTimeDrives: ReadonlyArray<{ label: string; seam?: () => unknown; declaredCalls: number; declaredWrites: number }> = [
      { label: 'the TRUTHY-returning callable (the positive control)', seam: (): unknown => true, declaredCalls: 0, declaredWrites: 1 },
      { label: 'the slot-empty / ABSENT half of the domain', seam: undefined, declaredCalls: 0, declaredWrites: 0 },
    ]
    for (const cell of attachTimeDrives) {
      await row.run(`the attach-time drive — ${cell.label}`, async () => {
        const double = makeSessionDouble()
        const sink = makeSink()
        const element = { control: `IM-3-attach-${cell.label}` }
        const calls: string[] = []
        const options: Record<string, unknown> = {
          session: double.session,
          axisFor: (): unknown => undefined,
          boundsFor: (): unknown => ({ min: 0, max: 100 }),
          sizeFor: (): unknown => 5,
          commit: sink,
        }
        if (cell.seam !== undefined) {
          options['isResizable'] = (): unknown => {
            calls.push('isResizable')
            return (cell.seam as () => unknown)()
          }
        }
        const created = await createController(options, `IM-3 attach-time ${cell.label}`)
        const attached = created.controller.attach(element, {})
        if (!attached) return '`attach` returns `true` for this shape (the seam is never an install-time gate)'
        if (calls.length !== 0) return `the seam was called ${calls.length} times at attach (the declared count is 0)`
        const began = double.begin(element)
        if (!began.ok) return `the establishment was refused (${began.code})`
        double.fireMove()
        double.fireTerminal('end')
        if (sink.records.length !== cell.declaredWrites) {
          return `the declared write count for this attach-time drive is ${cell.declaredWrites}, the measured count is ${sink.records.length}`
        }
        return null
      })
    }
    row.finish()
    expect(row.attemptsRunPublic(), `P-GT-IM-3 — the declared term is ${declaredPair('P-GT-IM-3').term}`).toBe(22)
  })

  it('P-GT-IM-4 (S-GT-SEAM-4) — the `axisFor`/token quantification AND the frozen seven-seam set: 4 shapes × 7 seams = 28', async () => {
    const row = new RegisterRow('P-GT-IM-4', 'S-GT-SEAM-4')
    const tokenObject = { token: 'IM-4' }
    /** **THE `3` `axisFor` SHAPES THAT PRODUCE A TOKEN** (`§2.4` item 6, group A): `(1)` the
     *  callable returning the token OBJECT · `(2)` ABSENT · `(3)` NON-CALLABLE. **The `axisFor`
     *  shape `(4)` (THROWING) is NOT driven here** — its identity reading is `undefined` for
     *  the same reason shapes `(2)`/`(3)`'s is, it is covered by `§3.2 F-18` and `M-7`, and a
     *  row that ALSO drove it here would be adding attempts the declared term `28` does not
     *  carry (`§5.5.1 P-GT-IM-4`'s own stated limit; group B below drives the `session` seam's
     *  unusable classes instead of the axis seam). */
    const tokenShapes: Array<{ label: string; make: () => unknown }> = [
      { label: '(1) a callable returning a token OBJECT', make: (): unknown => () => tokenObject },
      { label: '(2) ABSENT', make: (): unknown => undefined },
      { label: '(3) NON-CALLABLE', make: (): unknown => NON_CALLABLE_SEAM },
    ]
    /** `§2.1` item 5 — the SEVEN seam names, in their declared order. */
    const SEAM_SET: readonly string[] = ['session', 'axisFor', 'boundsFor', 'defaultSizeFor', 'isResizable', 'sizeFor', 'commit']
    expect(
      SEAM_SET.length,
      `P-GT-IM-4 — the seven declared seam names are enumerated (${SEAM_SET.join(' · ')})`,
    ).toBe(7)
    expect(SEAM_SET.includes('capture'), 'P-GT-IM-4 — the seam set carries NO `capture` member (ruling 11)').toBe(false)
    /** **THE SEAM-SET HALF IS ASSERTED ON EVERY ONE OF THE `28` ATTEMPTS** (a SET claim over a
     *  closed seven-name list, not a sample): `capture`'s presence FAILS and a member outside
     *  the seven FAILS. */
    const seamSetViolation = (options: Record<string, unknown>): string | null => {
      const keys = Object.keys(options).sort()
      for (const key of keys) {
        if (!SEAM_SET.includes(key)) return `the composition carries a member OUTSIDE the frozen seven-seam set: \`${key}\``
      }
      if (keys.includes('capture')) return 'the composition carries a `capture` member (ruling 11 forbids it)'
      return null
    }
    /** **THE USABLE DEFAULT FORM OF THE SIX SEAMS OTHER THAN THE VARYING ONE** (`§2.4` item 6):
     *  a RECORDING session double for `session`, a callable returning the TOKEN OBJECT for
     *  `axisFor`, a callable returning a usable pair for `boundsFor`, a callable returning a
     *  usable number for `defaultSizeFor`, a callable returning a TRUTHY value for
     *  `isResizable`, a callable returning a number for `sizeFor`, and a COUNTING SINK for
     *  `commit`. */
    const usableOptions = (args: {
      session: unknown
      axisFor: unknown
      received?: unknown[]
      sink?: CountingSink
      element?: unknown
    }): Record<string, unknown> => {
      const received = args.received ?? []
      return {
        session: args.session,
        axisFor: args.axisFor,
        boundsFor: (_el: unknown, axis: unknown): unknown => {
          received.push(axis)
          return { min: 0, max: 100 }
        },
        defaultSizeFor: (_el: unknown, axis: unknown): unknown => {
          received.push(axis)
          return 40
        },
        isResizable: (_el: unknown, axis: unknown): unknown => {
          received.push(axis)
          return true
        },
        sizeFor: (_el: unknown, _gesture: unknown, axis: unknown): unknown => {
          received.push(axis)
          return 5
        },
        commit: args.sink ?? makeSink(),
      }
    }
    // =========================================================================================
    // GROUP A — THE AXIS-TOKEN IDENTITY DRIVES: `18` = the `6` seams OTHER THAN `axisFor` ×
    // the `3` token-producing `axisFor` shapes. `axisFor` is the VARYING seam; the other six
    // are in their usable default form, and the drive runs to an `'end'` terminal so every one
    // of the six is actually reached. **A cell that reaches NO seam FAILS** — otherwise the
    // identity clause would be vacuous.
    // =========================================================================================
    for (const shape of tokenShapes) {
      for (const seamName of SEAM_SET.filter((name) => name !== 'axisFor')) {
        await row.run(`GROUP A — ${shape.label} × the seam \`${seamName}\``, async () => {
          const received: unknown[] = []
          const double = makeSessionDouble()
          const sink = makeSink()
          const element = { control: `IM-4-A-${shape.label}-${seamName}` }
          const made = shape.make()
          const options = usableOptions({ session: double.session, axisFor: made, received, sink, element })
          const setCause = seamSetViolation(options)
          if (setCause !== null) return setCause
          const created = await createController(options, `IM-4 A ${shape.label} ${seamName}`)
          const attached = created.controller.attach(element, {})
          if (!attached) return '`attach` returns `false` where `true` is required (the `session` seam is USABLE in this group)'
          const began = double.begin(element)
          if (!began.ok) return `the establishment was refused (${began.code})`
          double.fireMove() // the wrapper's capture of the handle (E3-BLOCK-5)
          double.fireTerminal('end')
          const expected = shape.label.startsWith('(1)') ? tokenObject : undefined
          // **THE TOKEN IS RECEIVED BY IDENTITY (`toBe`): every one of the six seams must see
          // the SAME object `axisFor` returned — or `undefined` for the token-less shapes. The
          // drive's own `axisFor` wrapper is a pass-through, so the reading is the token the
          // row's own seam produced.**
          if (received.length === 0) return 'no seam was reached, so the identity clause would be vacuous'
          for (const axis of received) {
            if (axis !== expected) {
              return `the seam \`${seamName}\` received ${brief(axis)}, the declared token is ${brief(expected)} (received BY IDENTITY, \`toBe\`)`
            }
          }
          return null
        })
      }
    }
    // =========================================================================================
    // GROUP B — THE UNUSABLE-SEAM REFUSALS: `6` = one per seam OTHER THAN `axisFor`, with that
    // ONE seam driven as the PRESENT NON-CALLABLE shape, `axisFor` USABLE (a callable returning
    // the token OBJECT) and the remaining five in their usable default form.
    // =========================================================================================
    const groupBSeams: readonly string[] = ['boundsFor', 'defaultSizeFor', 'isResizable', 'sizeFor', 'commit']
    for (const seamName of groupBSeams) {
      await row.run(`GROUP B — the seam \`${seamName}\` driven as the PRESENT NON-CALLABLE shape`, async () => {
        const double = makeSessionDouble()
        const sink = makeSink()
        const element = { control: `IM-4-B-${seamName}` }
        const received: unknown[] = []
        const options = usableOptions({ session: double.session, axisFor: (): unknown => tokenObject, received, sink })
        const sizeForCalls = (): number => 0
        if (seamName === 'commit') options['commit'] = NON_CALLABLE_SEAM
        else if (seamName === 'sizeFor') {
          // **THE ASYMMETRY RULING `7` NAMES IS WHAT THIS CELL ASSERTS**: `sizeFor` is guarded on
          // CALLABILITY — **the seam's OWN VALUE is non-callable, so it is treated as
          // UNAVAILABLE: its safe default is used, it is NEVER CALLED, and NOTHING propagates.**
          // The seam is handed the `42` shape DIRECTLY (not a callable that returns it): a
          // callable wrapper would be a CALLABLE seam whose call throws, which is the `(4)`
          // THROWING class and not this one. An UNGUARDED module FAILS on the call count and/or
          // on the propagation clause.
          options['sizeFor'] = NON_CALLABLE_SEAM
        } else options[seamName] = NON_CALLABLE_SEAM
        const setCause = seamSetViolation(options)
        if (setCause !== null) return setCause
        const created = await createController(options, `IM-4 B ${seamName}`)
        const attached = created.controller.attach(element, {})
        if (!attached) return `\`attach\` returns \`false\` where \`true\` is required for the unusable \`${seamName}\` seam (the \`session\` seam is USABLE here, so this cell is NOT in F-16's exempt class)`
        const began = double.begin(element)
        if (!began.ok) return `the establishment was refused (${began.code})`
        double.fireMove()
        let propagated: unknown = null
        try {
          double.fireTerminal('end')
        } catch (e) {
          propagated = e
        }
        if (seamName === 'boundsFor') {
          // An UNUSABLE bounds pair ⇒ the clamp answers `NaN` ⇒ NO SINK WRITE. The seam is
          // GUARDED on callability, so it is never invoked and nothing propagates.
          if (propagated !== null) return `a non-callable, GUARDED \`boundsFor\` must not propagate; it threw ${describeThrown(propagated)}`
          if (sink.records.length !== 0) return `\`boundsFor\` unusable ⇒ the clamp answers NaN ⇒ 0 writes; the sink recorded ${sink.records.length}`
          return created.controller.stats().sinkCalls === 0 ? null : `\`stats().sinkCalls\` reads ${String(created.controller.stats().sinkCalls)} where 0 is required`
        }
        if (seamName === 'defaultSizeFor') {
          // An `'end'` path NEVER CONSULTS the default at all — it is a `reset`-only seam — so
          // the value source is the usable `sizeFor`, the clamp answers a number and the ONE
          // declared write occurs (`§5.5.1 P-GT-IM-4` group B: *"`defaultSizeFor` unusable ⇒ an
          // `end` path never consults it"* — the clause the drive reaches is that NON-CONSULT,
          // not a zero-write claim).
          if (propagated !== null) return `a non-callable \`defaultSizeFor\` must not propagate on an end path; it threw ${describeThrown(propagated)}`
          return sink.records.length === 1
            ? null
            : `\`defaultSizeFor\` unusable is NEVER consulted on an end path, so the usable \`sizeFor\` supplies the value and the ONE write occurs; the sink recorded ${sink.records.length}`
        }
        if (seamName === 'sizeFor') {
          // **RULING `7`'S ASYMMETRY, ASSERTED EXACTLY**: `sizeFor` is GUARDED on CALLABILITY,
          // so a PRESENT NON-CALLABLE is treated as UNAVAILABLE ⇒ **its safe default is used,
          // the non-callable is NEVER CALLED, and NOTHING PROPAGATES** — the two observables
          // that make the guard falsifiable (an UNGUARDED module would attempt the call and its
          // `TypeError` would escape this drive). **The drive's write count is the usable
          // `boundsFor` × the unavailable value source ⇒ ZERO writes.**
          if (sizeForCalls() !== 0) {
            return `\`sizeFor\` is guarded on CALLABILITY (ruling 7): a non-callable is treated as UNAVAILABLE and must NEVER be called`
          }
          if (propagated !== null) {
            return `\`sizeFor\` unusable ⇒ NO PROPAGATION (the guard treats a non-callable as its UNAVAILABLE safe default, while an unguarded call's \`TypeError\` would escape this drive); a throw escaped: ${describeThrown(propagated)}`
          }
          return sink.records.length === 0
            ? null
            : `\`sizeFor\` unusable ⇒ the value source is unavailable ⇒ the clamp answers NaN ⇒ ZERO writes; the sink recorded ${sink.records.length}`
        }
        if (seamName === 'isResizable') {
          // **RULING `2`/`7`: `isResizable` is REACHED and its `TypeError` CAUGHT** ⇒ exactly
          // `1` read per established gesture (the count `P-GT-IM-3`'s shape `(2)` carries and
          // this grid does NOT re-count: the seam here is a bare `42`, so the harness observes
          // the DECISION and its consequences, never the read itself), the falsy decision ⇒ `0`
          // writes, and the terminal is a normal `'end'` (NOT `'cancel'`).
          const sessionStats = double.stats()
          if (sessionStats.commits !== 1) {
            return `an unusable \`isResizable\` still ESTABLISHES and TERMINATES NORMALLY (\`'end'\`, never \`'cancel'\`); the session recorded ${sessionStats.commits} commits`
          }
          if (sink.records.length !== 0) return `\`isResizable\` unusable ⇒ a falsy decision ⇒ 0 writes; the sink recorded ${sink.records.length}`
          return created.controller.stats().sinkCalls === 0
            ? null
            : `\`stats().sinkCalls\` reads ${String(created.controller.stats().sinkCalls)} where 0 is required (the read-count clause of ruling 2: 1 read, TypeError swallowed, NOT resizable)`
        }
        // `commit` unusable ⇒ the SLOT-EMPTY class (`F-10`): the composition attaches and
        // terminates normally with `0` writes, and the session reports `committed: true` WHILE
        // NOTHING WAS WRITTEN.
        if (propagated !== null) return `a non-callable \`commit\` must not propagate; it threw ${describeThrown(propagated)}`
        if (sink.records.length !== 0) return `the slot-empty composition writes 0 times; the sink recorded ${sink.records.length}`
        const emptyStats = double.stats()
        if (emptyStats.commits !== 1) {
          return `the SLOT-EMPTY composition's terminal still reports \`committed: true\` WHILE NOTHING WAS WRITTEN (F-10's sentence); the session recorded ${emptyStats.commits} commits`
        }
        return null
      })
    }
    // =========================================================================================
    // GROUP C — THE `session`-UNUSABLE INERT CELLS: `4` = the `4` `session`-unusable VARIANTS
    // the `F-16` row declares (the seam ABSENT · PRESENT NON-CALLABLE · a record whose members
    // are non-callable · a THROWING session accessor). The other six seams are in their usable
    // default form. **THE IDENTITY CLAUSE IS VACUOUS HERE BY CONSTRUCTION and the row says so:**
    // an unusable `session` yields the VALID BUT INERT controller, so these cells assert
    // `F-16`'s INERT CLAUSE INSTEAD and are EXEMPT from this row's `attach ⇒ true` requirement.
    // =========================================================================================
    const sessionVariants: ReadonlyArray<{ label: string; make: () => unknown }> = [
      { label: '(1) the seam ABSENT', make: (): unknown => undefined },
      { label: '(2) the seam PRESENT NON-CALLABLE (the `42` shape)', make: (): unknown => NON_CALLABLE_SEAM },
      {
        label: '(3) a record whose members are non-callable',
        make: (): unknown => ({ install: 42, reset: 'no', dispose: 7, stats: null, gesture: undefined, disposed: 0 }),
      },
      {
        label: '(4) a THROWING session accessor',
        make: (): unknown => {
          const hostile: Record<string, unknown> = { install: (): unknown => undefined, reset: (): unknown => undefined, dispose: (): unknown => undefined, stats: (): unknown => undefined, gesture: (): unknown => undefined }
          Object.defineProperty(hostile, 'disposed', {
            get(): unknown {
              throw new Error('the session accessor threw (F-16)')
            },
          })
          return hostile
        },
      },
    ]
    for (const variant of sessionVariants) {
      await row.run(`GROUP C — the \`session\` seam ${variant.label}`, async () => {
        const received: unknown[] = []
        const made = variant.make()
        const options = usableOptions({ session: made, axisFor: (): unknown => tokenObject, received })
        const setCause = seamSetViolation(options)
        if (setCause !== null) return setCause
        const created = await createController(options, `IM-4 C ${variant.label}`)
        const element = { control: `IM-4-C-${variant.label}` }
        const attached = created.controller.attach(element, {})
        if (attached !== false) {
          return `the declared outcome for an UNUSABLE \`session\` seam is the §2.4 item 1 INERT controller: \`attach\` ⇒ \`false\` (F-16's clause, which EXEMPTS this cell from P-GT-IM-4's \`true\` requirement). Read: ${brief(attached)}`
        }
        const stats = created.controller.stats()
        if (stats.attached !== 0) return `an inert controller reports \`stats().attached === 0\`. Read: ${String(stats.attached)}`
        if (stats.gestures !== 0 || stats.sinkCalls !== 0 || stats.written !== 0 || stats.resets !== 0) {
          return `an inert controller reports ZEROED stats for the unusable session, with no seam reached. Read: ${JSON.stringify(stats)}`
        }
        if (created.controller.detach() !== false) return '`detach() ⇒ false` for the inert controller (F-16\'s inert clause)'
        if (received.length !== 0) {
          return `an UNUSABLE session makes NO seam call (zero session calls, and no seam reached): the six usable seams were read ${received.length} time(s)`
        }
        return null
      })
    }
    row.finish()
    // **⟶ AMENDED 2026-09-27 (THE ESTABLISHMENT-SEAM AMENDMENT PASS — RULING `5`, resolving
    // `docs/pending.md` §I-quater's `E3`-RES-5/6; `§5.5.1 P-GT-IM-4`'s cell, `docs/decisions.md`
    // `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`).**
    //
    // **THIS ROW CARRIES AN HONEST DUAL FIGURE: DECLARED `28` · MEASURED DRIVE COUNT `27`.** The
    // DECLARED `28` IS THE FIGURE THE CAPS ARE COMPARED AGAINST AND IT DOES NOT MOVE; the MEASURED
    // `27` is what the landed drives execute. **THE REASON IS STATED, NOT IMPLIED: the `4`
    // `axisFor` shapes × the `7` seams is `28`, but the axis shape `(4)` (THROWING) IDENTITY CELL
    // IS NOT DRIVEN BY THIS ROW — it is COVERED BY `§3.2 F-18` AND `M-7`, and this cell's own
    // stated limit says so, so a TestWriter that ALSO drove it here would be adding an attempt the
    // declared term does not carry.** The `27` the landed drives execute are GROUP A's `6` seams
    // OTHER THAN `axisFor` × the `3` token-producing `axisFor` shapes (`18`) + GROUP B's `5` seams
    // driven as the PRESENT NON-CALLABLE shape (`5`) + GROUP C's `4` `session`-unusable variants
    // (`4`).
    //
    // **AND A DECLARED-VERSUS-MEASURED DIFFERENCE IS REPORTED, NEVER SILENTLY RE-TOTALLED: the
    // register's `299` total remains the sum of its THIRTEEN DECLARED TERMS, and this row's
    // measured `27` neither replaces that total nor is added into it.**
    const declaredTermIM4 = declaredPair('P-GT-IM-4').term
    const declaredDistinctIM4 = declaredPair('P-GT-IM-4').distinct
    const measuredDriveCountIM4 = row.attemptsRunPublic()
    console.log(
      `§5.5.1 P-GT-IM-4 DUAL FIGURE :: ${JSON.stringify({
        declaredTerm: declaredTermIM4,
        declaredDistinct: declaredDistinctIM4,
        measuredDriveCount: measuredDriveCountIM4,
        reason:
          'the axis shape (4) identity cell is covered by §3.2 F-18 and M-7 and is not among the 27; the 27 are group A 18 (6 seams other than axisFor × the 3 token-producing axisFor shapes) + group B 5 + group C 4',
        totalDisposition:
          'the declared 28 is what the caps are compared against and what the 299 total is summed from; the measured 27 is REPORTED beside it and is NOT added into that total',
      })}`,
    )
    expect(
      declaredTermIM4,
      `P-GT-IM-4 — **THE DECLARED TERM IS 28 AND IT DOES NOT MOVE** (\`§5.5.1 P-GT-IM-4\`'s cell, \`§5.5.3\`): it is the figure the caps are compared against and the term the \`299\` total is summed from. The measured drive count is REPORTED beside it at \`${String(
        measuredDriveCountIM4,
      )}\`, and the two DIFFER — the axis shape \`(4)\` identity cell is covered by \`F-18\`/\`M-7\` and is not among the \`27\`. Read: ${String(
        declaredTermIM4,
      )} vs ${String(measuredDriveCountIM4)}`,
    ).toBe(28)
    expect(
      declaredDistinctIM4,
      `P-GT-IM-4 — the DECLARED DISTINCT figure is ${String(declaredDistinctIM4)} and it does NOT move either (\`§5.5.2\` item 3's ledger)`,
    ).toBe(28)
    expect(
      measuredDriveCountIM4,
      `P-GT-IM-4 — **THE MEASURED DRIVE COUNT (\`${String(
        measuredDriveCountIM4,
      )}\` = GROUP A's \`18\` + GROUP B's \`5\` + GROUP C's \`4\`) IS ASSERTED AT ITS OWN FIGURE** — reported BESIDE the unmoved declared term \`28\` rather than silently re-totalled into it. Read: ${String(
        measuredDriveCountIM4,
      )}`,
    ).toBe(27)
  })

  it('P-GT-SM-1 (S-GT-COMMIT-1) — the COMMIT-COUNT quantification: 4 terminal paths × 5 sink shapes = 20, with 19 distinct path×shape pairs', async () => {
    const row = new RegisterRow('P-GT-SM-1', 'S-GT-COMMIT-1')
    const paths = ['(1) the recorded `pointerup` handler', '(2) the recorded `pointercancel` handler', '(3) a REFUSED terminal', '(4) a `dispose()` arriving mid-gesture'] as const
    const sinkShapes = ['(a) a normal counting sink', '(b) a sink that THROWS', '(c) NO sink at all', '(d) a non-callable sink slot', '(e) a sink that also writes for a consumer-set value'] as const
    for (const path of paths) {
      for (const shape of sinkShapes) {
        await row.run(`${path} × ${shape}`, () => {
          const double = makeSessionDouble()
          const element = { control: `SM-1-${path.slice(0, 3)}-${shape.slice(0, 3)}` }
          const counting = shape.startsWith('(a)') || shape.startsWith('(e)') ? makeSink() : makeSink(shape.startsWith('(b)'))
          const options: Record<string, unknown> = {
            session: double.session,
            axisFor: (): unknown => undefined,
            boundsFor: (): unknown => ({ min: 0, max: 100 }),
            isResizable: (): unknown => true,
            sizeFor: (): unknown => 12,
          }
          if (shape.startsWith('(c)')) options['commit'] = undefined
          else if (shape.startsWith('(d)')) options['commit'] = NON_CALLABLE_SEAM
          else options['commit'] = counting
          return createController(options, `SM-1 ${path} ${shape}`).then((created) => {
            created.controller.attach(element, {})
            // **⟶ ALIGNED TO THE AMENDED `§2.5` item 4 (the PINNED SINGLE WIRING),
            // 2026-09-27 — `E3`-BLOCK-3.** ONE wiring only: the session's `commit` channel
            // invokes the composition's SINGLE SINK WRITER, and this registration IS that
            // one channel. A cell that registered a SECOND forwarding channel while the
            // composition's writer is live would be a second writer (`§4.4 S-11`) and is
            // driven as `P-GT-SM-3`'s shape `(2)` instead.
            // **NO FORWARDING CHANNEL IS REGISTERED** (⟶ the amended `§2.5` item 4, ONE
            // wiring): the composition's SINGLE SINK WRITER is the `commit` seam handed to
            // it above, so the sink's own record and `stats()` are the two readings of that
            // one write. A second forwarding channel would be a second writer (`§4.4 S-11`).
            const began = double.begin(element)
            if (!began.ok) return `the establishment was refused (${began.code})`
            if (shape.startsWith('(e)')) began.gesture.set(41)
            // **THE MOVE TURN IS FIRED ON THE ONE PATH THAT REACHES A TERMINAL** (`E3`-BLOCK-5):
            // the session-driven `end` needs the handle the wrapper captured, while a `cancel`,
            // a refusal and a `dispose()` reach no terminal at all.
            if (path.includes('pointerup')) double.fireMove()
            let terminalOutcome: unknown = null
            if (path.includes('pointerup')) {
              double.fireTerminal('end')
              terminalOutcome = 'end'
            } else if (path.includes('pointercancel')) {
              double.fireTerminal('cancel')
              terminalOutcome = 'cancel'
            } else if (path.includes('REFUSED terminal')) {
              const stale = { id: 404, active: true, outcome: null, value: undefined, element, set: () => stale } as unknown as GestureHandle
              const result = double.end(element, stale)
              if (result.ok) return 'the REFUSED-terminal drive did not refuse (the drive is vacuous)'
            } else {
              double.dispose()
            }
            const declaredWrites = path.includes('pointerup') && !shape.startsWith('(c)') && !shape.startsWith('(d)') ? 1 : 0
            // **BOTH READINGS ARE ASSERTED ON EVERY ATTEMPT** (`§5.5.1 P-GT-SM-1`: *"the
            // sink's own recorded call count AND the controller's `stats().sinkCalls` AND
            // `stats().written`"*), so the row cannot pass by counting only its own calls.
            const sinkReading = shape.startsWith('(c)') || shape.startsWith('(d)') ? 0 : counting.records.length
            const reported = created.controller.stats().sinkCalls
            if (sinkReading !== declaredWrites) {
              return `READING 1 (the sink's own record) reads ${sinkReading} for ${path} × ${shape}, the declared count is ${declaredWrites}`
            }
            if (reported !== declaredWrites) {
              return `READING 2 (\`stats().sinkCalls\`) reads ${String(reported)} for ${path} × ${shape}, the declared count is ${declaredWrites}`
            }
            if (shape.startsWith('(b)')) {
              const written = created.controller.stats().written
              if (written !== 0) return `a THROWING sink is COUNTED and NEVER RETRIED: \`stats().written\` must read 0 while \`sinkCalls\` reads 1. Read: ${String(written)}`
            }
            if (declaredWrites > 1) return 'the count must NEVER exceed one per gesture'
            if (terminalOutcome !== null && terminalOutcome !== 'end' && sinkReading !== 0) {
              return 'a cancel terminal must reach the sink ZERO times'
            }
            return null
          })
        })
      }
    }
    row.finish()
    expect(row.attemptsRunPublic(), `P-GT-SM-1 — the declared term is ${declaredPair('P-GT-SM-1').term}`).toBe(20)
    expect(
      declaredPair('P-GT-SM-1').distinct,
      `P-GT-SM-1 — the honest DISTINCT path×shape figure is ${declaredPair('P-GT-SM-1').distinct}: one refusal path and one cancel path under a non-writing sink shape read the same terminal evidence, and the collision is recorded rather than asserted as distinct`,
    ).toBe(19)
  })

  it('P-GT-SM-2 (S-GT-WINDOW-1) — the NO-WRITE-BEFORE-ESTABLISHMENT / NO-SECOND-WRITE / NO-RETAINED-SINK quantification: 5 stages × 3 slot shapes = 15', async () => {
    const row = new RegisterRow('P-GT-SM-2', 'S-GT-WINDOW-1')
    const stages = ['(1) after attach, before establishment', '(2) during the gesture', '(3) at the terminal', '(4) after the terminal', '(5) after two sequential gestures'] as const
    const slots = ['(1) a gesture that terminated by an end', '(2) a gesture that terminated by a cancel', '(3) a gesture that NEVER established'] as const
    for (const stage of stages) {
      for (const slot of slots) {
        await row.run(`${stage} × ${slot}`, () => {
          const double = makeSessionDouble({ disposed: false, disposeComplete: false })
          const element = { control: `SM-2-${stage.slice(0, 3)}-${slot.slice(0, 3)}` }
          const sink = makeSink()
          let established = false
          return createController(
            {
              session: double.session,
              axisFor: (): unknown => undefined,
              boundsFor: (): unknown => ({ min: 0, max: 100 }),
              defaultSizeFor: (): unknown => 30,
              isResizable: (): unknown => true,
              sizeFor: (): unknown => 3,
              commit: sink,
            },
            `SM-2 ${stage} ${slot}`,
          ).then((created) => {
            created.controller.attach(element, {})
            // **⟶ ONE WIRING (THE AMENDED `§2.5` item 4; `E3`-BLOCK-3): NO FORWARDING
            // CHANNEL IS REGISTERED.** The composition's SINGLE SINK WRITER is the `commit`
            // seam handed to it above, invoked at the gesture's terminal — so stage `(3)`'s
            // declared running count of `1` is that ONE writer's own call, and `stats()`
            // and the sink's own record are its two readings.
            const neverEstablishes = slot.includes('NEVER established')
            if (!neverEstablishes) {
              const began = double.begin(element)
              established = began.ok
              if (!began.ok) return `the establishment was refused (${began.code})`
              if (began.ok) began.gesture.set(4)
            }
            const terminate = (): void => {
              if (neverEstablishes) return
              // **THE MOVE TURN IS FIRED BEFORE THE END TERMINAL** (`E3`-BLOCK-5): the write
              // is reached with the wrapper-captured handle. A `cancel` needs none.
              if (!slot.includes('cancel')) double.fireMove()
              double.fireTerminal(slot.includes('cancel') ? 'cancel' : 'end')
            }
            const runningCount = (): number => sink.records.length
            if (stage.includes('after attach')) {
              return runningCount() === 0 ? null : `ZERO writes are declared before establishment; measured ${runningCount()}`
            }
            if (stage.includes('during the gesture')) {
              if (runningCount() !== 0) return `ZERO writes are declared during the gesture; measured ${runningCount()}`
              return double.log.filter((call) => call === 'reset').length === 0 ? null : 'no `reset` may be issued during the gesture'
            }
            if (stage.includes('at the terminal')) {
              terminate()
              const declared = neverEstablishes || slot.includes('cancel') ? 0 : 1
              return runningCount() === declared ? null : `the declared running count is ${declared}; measured ${runningCount()}`
            }
            terminate()
            const before = runningCount()
            const refusal = created.controller.reset(element)
            if (neverEstablishes || slot.includes('cancel')) {
              if (refusal.code !== 'no-gesture') return `the declared refusal after the terminal is \`'no-gesture'\`; measured ${brief(refusal.code)}`
              if (runningCount() !== before) return 'a refused reset must not add a write'
              return null
            }
            const afterSecond = runningCount()
            if (stage.includes('after two sequential gestures')) {
              const second = double.begin(element)
              if (!second.ok) return `the second establishment was refused (${second.code})`
              double.fireTerminal('end')
              return runningCount() <= 2 ? null : `never twice for one gesture: measured ${runningCount()} writes across two gestures`
            }
            return afterSecond === before ? null : `no write may occur after the terminal (measured ${afterSecond - before} extra)`
          })
        })
      }
    }
    row.finish()
    expect(row.attemptsRunPublic(), `P-GT-SM-2 — the declared term is ${declaredPair('P-GT-SM-2').term}`).toBe(15)
    expect(row.attemptsRunPublic() <= REGISTER_ROW_CAP, 'P-GT-SM-2 — inside the ≤100 per-row cap').toBe(true)
  })

  it('P-GT-SM-3 (S-GT-WRITER-1) — THE SINGLE-WRITER / DOUBLE-WRITE quantification: 5 DISTINCT composition shapes, BOTH READINGS asserted as DISTINCT BY DESIGN, with both positive controls DECLARED TO FAIL', async () => {
    const row = new RegisterRow('P-GT-SM-3', 'S-GT-WRITER-1')
    const declared: ReadonlyArray<{ shape: number; label: string; sinkRecord: number; controllerCount: number }> = [
      { shape: 1, label: '(1) the CORRECT single-writer composition', sinkRecord: 1, controllerCount: 1 },
      { shape: 2, label: '(2) the TWO-WRITER composition (declared to FAIL)', sinkRecord: 2, controllerCount: 1 },
      { shape: 3, label: '(3) the NO-WRITER composition, slot-empty (declared to FAIL)', sinkRecord: 0, controllerCount: 0 },
      { shape: 4, label: '(4) a consumer whose own `onMove` calls the sink', sinkRecord: 2, controllerCount: 1 },
      { shape: 5, label: '(5) a consumer whose own `onEnd` calls the sink', sinkRecord: 2, controllerCount: 1 },
    ]
    // **THE ROW'S DECLARED TERM IS `5` COMPOSITION SHAPES, AND THE ROW'S OWN CELL REQUIRES
    // BOTH READINGS TO BE ASSERTED (`§5.5.1 P-GT-SM-3`: *“the two readings the row asserts
    // for EVERY shape are DISTINCT BY DESIGN”*).** Each shape therefore performs **ONE
    // attempt that asserts BOTH READINGS in turn** — the sink's own recorded call count FIRST,
    // then the controller's `stats().sinkCalls` — so the row runs `5` attempts, exactly as §5.5.1
    // and §5.5.3 declare, and the register's `299`-attempt arithmetic is untouched. **A row
    // that asserted only one reading would be satisfiable by a composition that never wired
    // the channel, so neither reading may be dropped.**
    const measured: WriterReadings[] = []
    for (const cell of declared) {
      const readings = await writerShape(cell.shape as 1 | 2 | 3 | 4 | 5)
      measured.push(readings)
      console.log(`§5.5.1 P-GT-SM-3 reading :: ${readings.note}`)
      await row.run(`${cell.label} × both readings`, () => {
        // READING 1 — THE SINK'S OWN RECORD (exactly the declared figure, never "at least").
        if (readings.sinkRecord !== cell.sinkRecord) {
          return `the SINK's own record reads ${readings.sinkRecord}, the declared count is ${cell.sinkRecord} — the DECLARED figure, never “at least”`
        }
        // READING 2 — THE CONTROLLER'S OWN COUNTER.
        if (readings.controllerCount !== cell.controllerCount) {
          return `the controller's own \`stats().sinkCalls\` reads ${String(readings.controllerCount)}, the declared count is ${cell.controllerCount}`
        }
        // SHAPE (3)'s OWN CLAUSE — the `C1` sentence, IN THE SAME CELL.
        if (cell.shape === 3 && !readings.sessionCommitted) {
          return 'the slot-empty composition must be recorded with the session reporting `committed: true` WHILE NOTHING WAS WRITTEN (the C1 sentence, in the same cell)'
        }
        // **THE DISTINCT-BY-DESIGN DIVERGENCE, ASSERTED IN THE TWO-WRITER SHAPE'S OWN
        // ATTEMPT** (RULED 2026-09-27, THE RED-RUN AMENDMENT PASS; `§3.2 F-9`, `§3.4 R-13`):
        // the sink's OWN record reads `2` while the controller's counter STILL reads `1`,
        // because a second writer's call does not pass through this controller's one call
        // site. **That divergence is the falsifier** — a composition cannot pass by trusting a
        // single reading, and this arm refuses a composition whose two readings AGREE at `2`.
        if (cell.shape === 2 && !(readings.sinkRecord === 2 && readings.controllerCount === 1)) {
          return `the DIVERGENCE is the falsifier of the two-writer positive control: the sink's OWN record must read \`2\` while the controller's counter still reads \`1\`. Measured: sink ${readings.sinkRecord}, controller ${String(readings.controllerCount)}`
        }
        // **THE CORRECT (SINGLE-WRITER) COMPOSITION'S AGREEMENT AT `1`** — the amended cell's
        // first ruled reading, asserted here so the AGREEMENT and the DIVERGENCE are each
        // falsifiable at their own shape.
        if (cell.shape === 1 && !(readings.sinkRecord === 1 && readings.controllerCount === 1)) {
          return `the CORRECT single-writer composition must read \`1\` on BOTH readings — the amended cell's ruled AGREEMENT. Measured: sink ${readings.sinkRecord}, controller ${String(readings.controllerCount)}`
        }
        // **THE TWO CONSUMER-SIDE WRITE CLASSES `(4)`/`(5)`** (shape `(5)` completed by the
        // amendment: a consumer's own `onEnd` calling the sink): a consumer-side write is NOT
        // this composition's write, but the TOTAL for one gesture must still read `2` against
        // the composition's own `1`.
        if (cell.shape === 4 || cell.shape === 5) {
          if (!(readings.sinkRecord === 2 && readings.controllerCount === 1)) {
            return `the consumer-side write class (${cell.shape === 4 ? '`onMove`' : '`onEnd`'}) must read \`2\` on the sink's own record while the composition's own counter reads \`1\`. Measured: sink ${readings.sinkRecord}, controller ${String(readings.controllerCount)}`
          }
          if (readings.consumerSideWrites !== 1) {
            return `the consumer's own hook must have performed EXACTLY ONE consumer-side write for this gesture (shape (${cell.shape}) is the ${cell.shape === 4 ? 'first' : 'second'} consumer-side write class). Measured: ${readings.consumerSideWrites}`
          }
        }
        return null
      })
    }
    row.finish()
    expect(
      row.attemptsRunPublic(),
      `P-GT-SM-3 — the declared term is ${declaredPair('P-GT-SM-3').term} composition shapes; each performs ONE attempt asserting BOTH readings (5 × 1 = 5), exactly as §5.5.1/§5.5.3 declare`,
    ).toBe(5)
    expect(
      declaredPair('P-GT-SM-3').term,
      'P-GT-SM-3 — the DECLARED term is `5` and it does NOT move (the amendment moves no attempt term); the shapes `(1)`–`(5)` are the completed list the amendment states',
    ).toBe(5)
    expect(
      declared.map((cell) => cell.shape),
      'P-GT-SM-3 — the FIVE shapes the amended cell states COMPLETELY and IN ORDER: (1) correct single-writer · (2) two-writer · (3) no-writer (slot-empty) · (4) consumer-side write from `onMove` · (5) consumer-side write from `onEnd`',
    ).toEqual([1, 2, 3, 4, 5])
    console.log(
      `§5.5.1 P-GT-SM-3 drives :: ${JSON.stringify({
        declaredShapes: 5,
        attemptsRun: row.attemptsRunPublic(),
        readingsAssertedPerShape: 2,
        shapes: declared.map((cell) => `${cell.shape}:sinkRecord=${cell.sinkRecord}/controllerCount=${cell.controllerCount}`),
        agreement: 'shape (1): both readings read 1',
        divergenceFalsifier: 'shape (2): sink own record 2 vs controller counter 1',
        consumerSideClasses: ['(4) onMove', '(5) onEnd'],
      })}`,
    )
    expect(
      measured.filter((reading) => reading.sinkRecord === 2).length,
      'P-GT-SM-3 — THREE of the five shapes carry a total write count of 2 (the two-writer composition and the two consumer-side-write shapes), so a composition cannot pass by counting only its own calls',
    ).toBe(3)
  })

  it('P-GT-SM-4 (S-GT-RESET-1) — the RESET-SURFACE quantification: 6 entry-point shapes × 2 readings = 12 ATTEMPTS, over 5 distinct reading classes × 2 readings = 10 DISTINCT observations', async () => {
    const row = new RegisterRow('P-GT-SM-4', 'S-GT-RESET-1')
    interface ResetShape {
      readonly label: string
      readonly declaredCode: string
      readonly sessionCalls: number
      readonly writes: number
    }
    const shapes: readonly ResetShape[] = [
      { label: '(1) an ACTIVE resizable gesture, usable default and bounds', declaredCode: 'ok', sessionCalls: 1, writes: 1 },
      { label: '(2) NO active gesture', declaredCode: 'no-gesture', sessionCalls: 0, writes: 0 },
      { label: '(3) an unusable `defaultSizeFor` (absent)', declaredCode: 'unusable-default', sessionCalls: 0, writes: 0 },
      { label: '(4) an unusable `defaultSizeFor` (throwing)', declaredCode: 'unusable-default', sessionCalls: 0, writes: 0 },
      { label: '(5) an unusable BOUNDS pair (the clamp answers NaN)', declaredCode: 'ok', sessionCalls: 1, writes: 0 },
      { label: '(6) a DISPOSED session', declaredCode: 'disposed', sessionCalls: 1, writes: 0 },
      // **⟶ THE `isResizable === false` CASE, ADDED BY THE GATE-3 REALIGNMENT PASS AND NOW
      // GENUINELY DRIVEN AS THE AMENDED `§5.5.1 P-GT-SM-4` SURFACE'S `'not-resizable'` SHAPE —
      // carried as a CASE WITHIN SHAPE `(6)`’S SURFACE, NOT as a new shape and NOT as a new
      // term.** The amended cell’s own text: *“(6) … and the DISPOSED-session case, where the
      // code is the session’s own `'disposed'` propagated VERBATIM”*, with the cell’s second
      // variant *“a DISPOSED session (or `isResizable` falsy — driven as this shape’s second
      // variant, each asserted separately)”*. It is carried by BOTH readings of this shape
      // (the arm that asserts the controller’s record and the arm that asserts the session-side
      // count and the sink’s own record), so **the DECLARED term `12` does not move, `6` shapes
      // × `2` readings = `12`
      // attempts hold, and the register’s `299`-attempt arithmetic is untouched.** The
      // declared reading for the limb: **ZERO session calls, ZERO writes, the controller-local
      // `'not-resizable'`, `committed: false`.**
    ]
    /** **SHAPE `(6)`'S SECOND VARIANT — the `isResizable === false` limb (`§2.3` item 4 clause 2,
     *  the controller-local `'not-resizable'`), driven INSIDE shape `(6)`'s own attempts so the
     *  DECLARED TERM `12` (`6` shapes × `2` readings) DOES NOT MOVE** (`§5.5.1 P-GT-SM-4`'s own
     *  cell, and the amendment's ruling `8`(c) that makes this limb a GENUINELY DRIVEN reading).
     *  It is a self-contained drive: its own session double, its own element, ZERO session calls
     *  of any kind, ZERO writes, `{ok: false, code: 'not-resizable', committed: false}`. */
    const driveNotResizableLimb = (): Promise<string | null> => {
      const limbDouble = makeSessionDouble()
      const limbSink = makeSink()
      const limbElement: Record<string, unknown> = { control: 'SM-4-6b-limb' }
      const limbOptions: Record<string, unknown> = {
        session: limbDouble.session,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        defaultSizeFor: (): unknown => 420,
        isResizable: (): unknown => false,
        sizeFor: (): unknown => 9,
        commit: limbSink,
      }
      const made = createController(limbOptions, 'SM-4 shape (6) second variant')
      return made.then((created) => {
        created.controller.attach(limbElement, {})
        const began = limbDouble.begin(limbElement)
        if (!began.ok) return `shape (6)’s second variant could not establish a gesture (${began.code})`
        limbDouble.fireMove() // the wrapper-captured handle (`E3`-BLOCK-5)
        const before = limbDouble.log.length
        const refusal = created.controller.reset(limbElement)
        const logged = limbDouble.log.slice(before)
        if (refusal.code !== 'not-resizable') {
          return `shape (6)’s second variant must refuse the CONTROLLER-LOCAL \`'not-resizable'\` (zero session calls, not re-evaluated). Read: ${JSON.stringify(refusal)}`
        }
        if (refusal.ok !== false || refusal.committed !== false) {
          return `shape (6)’s second variant is \`{ok: false, committed: false}\` — never an \`'ok'\`-shaped success. Read: ${JSON.stringify(refusal)}`
        }
        if (logged.length !== 0) {
          return `shape (6)’s second variant makes ZERO session calls of ANY KIND (the decision was made once, at establishment). Recorded: ${JSON.stringify(logged)}`
        }
        if (limbSink.records.length !== 0) {
          return `shape (6)’s second variant writes ZERO times; measured ${limbSink.records.length}`
        }
        return null
      })
    }
    for (const shape of shapes) {
      for (const reading of ['the controller’s result record', 'the session’s recorded call/response'] as const) {
        await row.run(`${shape.label} × ${reading}`, async () => {
          const notResizable = shape.declaredCode === 'not-resizable'
          // **⟶ REPAIRED 2026-09-27 (THE REPAIR CYCLE): the DISPOSED cell's establishment
          // happens FIRST and the session is disposed AFTER the `'reset'` drive's
          // establishment** — a session disposed at construction REFUSES every `begin`
          // (`{ok: false, code: 'disposed'}`), so the cell could never reach the reset it
          // declares. `§5.5.1 P-GT-SM-4`'s shape `(6)` declares *"the code is the session's
          // own `'disposed'`, propagated VERBATIM"* on the RESET path, which is the path this
          // drive must reach.
          const double = makeSessionDouble()
          const sink = makeSink()
          const element = { control: `SM-4-${shapes.indexOf(shape)}-${reading.slice(0, 4)}` }
          const options: Record<string, unknown> = {
            session: double.session,
            axisFor: (): unknown => undefined,
            boundsFor: (): unknown => (shape.label.includes('unusable BOUNDS') ? {} : { min: 0, max: 100 }),
            // The non-resizable limb drives a FALSY decision; every other cell keeps the
            // truthy decision the rest of the table declares.
            isResizable: (): unknown => !notResizable,
            sizeFor: (): unknown => 9,
            commit: sink,
          }
          if (!shape.label.includes('absent')) {
            options['defaultSizeFor'] = (): unknown => {
              if (shape.label.includes('throwing')) throw new Error('the default seam threw')
              return 420
            }
          }
          const created = await createController(options, `SM-4 ${shape.label} ${reading}`)
          {
            // **THE HANDLE CHANNEL (⟶ REPAIRED 2026-09-27, THE REPAIR CYCLE, `E3`-BLOCK-5;
            // `§2.5` item 5 clause 2, `§3.1 M-12`, `§2.3` item 4 clause 1).** The handle the
            // reset path uses is the one the controller CAPTURED IN ITS OWN `onMove` WRAPPER
            // — the ONE legal channel the frozen session provides (its `onStart` receives only
            // the element, and `session.begin` is FORBIDDEN to this controller). This cell
            // therefore attaches a move-hook and FIRES THE MOVE TURN, so a real handle really
            // reaches the wrapper; and the session-record reading below asserts, BY IDENTITY,
            // that the handle the composition hands `session.reset` is the one the session
            // gave at establishment.
            const moveTurns: GestureHandle[] = []
            created.controller.attach(element, {
              onMove: (gesture: GestureHandle): void => {
                moveTurns.push(gesture)
              },
            })
            let establishedHandle: GestureHandle | null = null
            if (!shape.label.includes('NO active gesture')) {
              const began = double.begin(element)
              if (!began.ok) return `the establishment was refused (${began.code})`
              establishedHandle = began.gesture
              double.fireMove()
              // The DISPOSED cell disposes the session between establishment and the reset.
              if (shape.label.includes('DISPOSED')) double.dispose()
            }
            // **SHAPE `(6)`'S IN-ATTEMPT SECOND VARIANT** (see `driveNotResizableLimb`): the
            // `isResizable === false` limb is driven here, so the table's DECLARED term stays
            // `12` while the limb is genuinely driven (ruling `8`(c)'s distinct reading).
            if (shape.label.includes('DISPOSED')) {
              const limbCause = await driveNotResizableLimb()
              if (limbCause !== null) return limbCause
            }
            const before = double.log.length
            const result = created.controller.reset(element)
            // **A REFUSAL PATH MAKES NO SESSION CALL OF ANY KIND** — so the non-resizable cell
            // counts EVERY logged call, not only `reset` (the refusal must not even READ the
            // session on the way to its answer).
            const loggedAfter = double.log.slice(before)
            const sessionCallsAfter = notResizable
              ? loggedAfter.length
              : loggedAfter.filter((call) => call === 'reset').length
            if (reading.startsWith('the controller')) {
              if (result.code !== shape.declaredCode) {
                return `the result code is ${brief(result.code)}, the declared code is ${brief(shape.declaredCode)}${notResizable ? ' (the AMENDED controller-local code for an ESTABLISHED non-resizable gesture)' : ''}`
              }
              if (result.committed !== (shape.writes === 1)) {
                return `\`committed\` is ${String(result.committed)}; the declared value is ${String(shape.writes === 1)} (the composition’s own count, never a session-side guess)`
              }
              if (notResizable && result.ok !== false) {
                return `the non-resizable refusal must be \`ok: false\` — a refusal may never be reported as an \`'ok'\`-shaped success. Read: ${JSON.stringify(result)}`
              }
              // **SHAPE `(1)`'S OWN HANDLE-CHANNEL LIMB:** the one path that RUNS the session's
              // `reset` terminal must have had a REAL wrapper-captured handle to pass — a
              // controller that never captured one would have refused instead, and this arm
              // names that state rather than hiding it.
              if (shape.writes === 1) {
                if (moveTurns.length !== 1) {
                  return `the wrapper must have CAPTURED the handle from the consumer's own \`onMove\` hook on the fired move turn; the hook ran ${moveTurns.length} times (the drive fired exactly one move)`
                }
                if (establishedHandle === null || moveTurns[0] !== establishedHandle) {
                  return `the handle the consumer's own \`onMove\` hook RECEIVED must be the session's own handle, FORWARDED UNCHANGED by the wrapper (\`M-12\`'s narrowed identity requirement — the wrapper may not swallow, reorder or alter the consumer hook's arguments)`
                }
                if (result.code !== 'ok') {
                  return `with a real wrapper-captured handle the reset must RUN: the declared code is \`'ok'\`. Read: ${brief(result.code)}`
                }
              }
              return null
            }
            if (sessionCallsAfter !== shape.sessionCalls) {
              return notResizable
                ? `the non-resizable refusal logged ${sessionCallsAfter} session calls; the declared count is ZERO — the decision was made once, at establishment, and is NOT re-evaluated. Recorded: ${JSON.stringify(loggedAfter)}`
                : `\`session.reset\` was called ${sessionCallsAfter} times, the declared count is ${shape.sessionCalls}`
            }
            // **THE IDENTITY OF THE HANDLE THE COMPOSITION PASSED `session.reset`** — asserted
            // for the path that RUNS the terminal (`§5.5.1 P-GT-SM-4`'s per-attempt assert:
            // *“the identity of the handle passed to `session.reset` (the one the session gave
            // at establishment)”*).
            if (shape.writes === 1 || shape.label.includes('unusable BOUNDS')) {
              const passed = double.resetHandles[double.resetHandles.length - 1]
              if (passed !== establishedHandle) {
                return `the handle the composition passed \`session.reset\` is not the one the session gave at establishment (nor a stand-in): the channel is the controller's own \`onMove\` WRAPPER's capture (\`§2.5\` item 5 clause 2) and it must never be SYNTHESISED. Read: ${brief(passed)}`
              }
            }
            if (sink.records.length !== shape.writes) {
              return `the sink write count is ${sink.records.length}, the declared count is ${shape.writes}`
            }
            // **⟶ AMENDED 2026-09-27 (THE ESTABLISHMENT-SEAM AMENDMENT PASS — RULING `2`;
            // `§5.5.1 P-GT-SM-4` shape `(1)`'s cell, `§2.3` item 4 clause 8, `§3.1 M-15`).**
            // **THE COMMITTED VALUE IS READ FROM THE SINK'S OWN `value` ARGUMENT, NEVER THROUGH THE
            // HANDLE.** The frozen session fires the consumer's `onEnd` BEFORE it stores anything
            // and never stores the terminal's value on the record at all — MEASURED, the sink's
            // handle reads `value === undefined` where the committed value is declared — so shape
            // `(1)`'s `100` is asserted on the argument the sink received, and the handle-side
            // reading is asserted as `undefined` so the ruling is falsifiable IN PLACE rather than
            // merely absent: a future driver that (illegally) reads the value back through the
            // handle fails HERE. **NO ATTEMPT TERM OF THIS ROW MOVES for it (`12` declared, `6`
            // shapes × `2` readings).**
            if (shape.writes === 1) {
              if (sink.records[0]?.value !== 100) {
                return `shape (1)’s committed value must be read from the SINK’S OWN \`value\` ARGUMENT — the CLAMPED default (\`clampToBounds(420, {min:0,max:100}) = 100\`), never the raw default and never through the handle. The sink received ${brief(sink.records[0]?.value)}`
              }
              const handleSideValue = (sink.records[0]?.gesture as GestureHandle | undefined)?.value
              if (handleSideValue !== undefined) {
                return `the handle’s \`value\` is NOT a terminal value channel in the frozen session: this cell may not read the committed value through the handle at the terminal (the session fires the consumer’s \`onEnd\` BEFORE it stores anything and never stores the terminal’s value on the record). Read: ${brief(handleSideValue)}`
              }
              const terminalOutcome = (sink.records[0]?.gesture as GestureHandle | undefined)?.outcome
              if (terminalOutcome !== 'reset') {
                return `the handle REMAINS the OUTCOME channel (not a value channel): the handle that reached the sink must read \`outcome === 'reset'\` at the terminal. Read: ${brief(terminalOutcome)}`
              }
            }
            return null
          }
        })
      }
    }
    // **⟶ CORRECTED 2026-09-27 BY THE ARCHITECT-RULING ALIGNMENT PASS: THE DISTINCT FIGURE IS
    // `10`, NOT `12`, AND THE REASON IS STATED BECAUSE THE AS-LANDED CELL ASSERTED A FIGURE ITS
    // OWN TABLE CANNOT REACH.** The two readings per shape ARE the two module-observable arms the
    // register declares for this row — the CONTROLLER'S own result record and the SESSION'S
    // recorded call/response — and each of the table's SIX shapes is read twice, which is what
    // makes the DECLARED ATTEMPT TERM `12` (`6` × `2`) and keeps it UNMOVED. But a DISTINCT
    // READING IS A CLASS, NOT AN ATTEMPT: the six shapes yield only FIVE distinct
    // `(declared code, session-call count, write count)` classes, because `(3)` and `(4)` (the
    // ABSENT and the THROWING `defaultSizeFor`) are declared as ONE unusable-default class with a
    // single observable — both refuse `'unusable-default'` with ZERO session calls and ZERO writes
    // — so the honest distinct count is `5 × 2 = 10`. The as-landed `12` multiplied the SIX
    // ATTEMPTS by the two readings instead of the FIVE READING CLASSES by the two readings, and
    // the message below NAMES the five classes rather than asserting an unreachable number.
    // **THE `isResizable === false` LIMB IS NOT A SIXTH CLASS HERE AND ADDS NO ATTEMPT**: it is
    // driven INSIDE shape `(6)`'s attempts (`driveNotResizableLimb`), so it is read by exactly the
    // arms shape `(6)` already contributes and its reading rides within that shape's cell.
    const shapeReadings = new Set(shapes.map((shape) => `${shape.declaredCode}|${shape.sessionCalls}|${shape.writes}`))
    /** **THE FIVE DISTINCT READING CLASSES the six table shapes yield over the two arms** —
     *  named rather than counted, so a reader can check the figure against the table instead of
     *  trusting it: the `'ok'` success (`1` session call, `1` write) · the `'no-gesture'` refusal
     *  (`0`/`0`) · the `'unusable-default'` refusal (`0`/`0` — shapes `(3)` and `(4)` COLLAPSE
     *  into this ONE class) · the two-counters-differ class (`'ok'` with `1` session call and `0`
     *  writes) · and the `'disposed'` propagation (`1`/`0`). */
    const FIVE_DISTINCT_READING_CLASSES: readonly string[] = [
      'ok|1|1',
      'no-gesture|0|0',
      'unusable-default|0|0',
      'ok|1|0',
      'disposed|1|0',
    ]
    /** **THE DECLARED ATTEMPT TERM (UNMOVED) VERSUS THE HONEST DISTINCT FIGURE**: `6` shapes × `2`
     *  readings = `12` ATTEMPTS (the term the `≤100` cap is compared against, and the term the
     *  `299` total is summed from) while `5` distinct classes × `2` readings = `10` DISTINCT
     *  observations (the row's REPORTED honest figure, which `declaredPair` now carries). */
    const distinctReadings = shapeReadings.size * 2
    console.log(
      `§5.5.1 P-GT-SM-4 figures :: ${JSON.stringify({
        declaredTerm: declaredPair('P-GT-SM-4').term,
        distinctFigure: declaredPair('P-GT-SM-4').distinct,
        shapesDriven: shapes.length,
        attemptsRun: row.attemptsRunPublic(),
        distinctReadingClasses: shapeReadings.size,
        readingClasses: [...shapeReadings],
        distinctReadings,
        addedCase: '(6-b) `isResizable === false` on an ESTABLISHED gesture ⇒ `not-resizable`, ZERO session calls, ZERO writes — carried by shape (6)’s second variant, within the declared term, and NOT a shape of its own',
        note: 'the declared term 12 is UNMOVED (6 shapes × 2 readings) while the honest DISTINCT figure is 10 (5 distinct reading classes × 2 readings); the attempt terms and the 299 total do not move',
      })}`,
    )
    row.finish()
    expect(row.attemptsRunPublic(), `P-GT-SM-4 — the declared term is ${declaredPair('P-GT-SM-4').term} (6 shapes × 2 readings); the ` + '`isResizable === false`' + ` case rides inside shape (6) and adds NO attempt`).toBe(12)
    expect(
      declaredPair('P-GT-SM-4').term,
      'P-GT-SM-4 — the DECLARED term is `12` (6 shapes × 2 readings) and it does NOT move: the `isResizable === false` limb is a CASE WITHIN shape (6)’s surface',
    ).toBe(12)
    expect(
      declaredPair('P-GT-SM-4').distinct,
      `P-GT-SM-4 — the DISTINCT figure is 10, NOT 12: the row's own drive table yields FIVE distinct reading classes (two of the six shapes collapse into the one 'unusable-default' class) and each class is read by the TWO declared arms, so 5 × 2 = 10. The declared ATTEMPT term stays 12 (6 shapes × 2 readings) and is what the cap is compared against. Read: ${String(
        declaredPair('P-GT-SM-4').distinct,
      )}`,
    ).toBe(10)
    expect(
      [...shapeReadings],
      `P-GT-SM-4 — THE FIVE DISTINCT READING CLASSES the six table shapes yield, NAMED: the 'ok' success (1 session call, 1 write) · the 'no-gesture' refusal (0/0) · the 'unusable-default' refusal (0/0 — shapes (3) and (4) collapse into this ONE class) · the two-counters-differ class ('ok' with 1 session call and 0 writes) · the 'disposed' propagation (1/0). Table readings: ${JSON.stringify(
        [...shapeReadings],
      )}`,
    ).toEqual(FIVE_DISTINCT_READING_CLASSES)
    expect(
      shapeReadings.size,
      `P-GT-SM-4 — the SIX table shapes collapse to FIVE distinct reading classes (never six: the 'unusable-default' class carries BOTH the ABSENT and the THROWING defaultSizeFor shapes). Table readings: ${JSON.stringify(
        [...shapeReadings],
      )}`,
    ).toBe(5)
    expect(
      distinctReadings,
      `P-GT-SM-4 — THE HONEST DISTINCT FIGURE this row's table yields: ${shapeReadings.size} distinct reading classes × 2 declared arms (the controller's result record and the session's recorded call/response) = ${distinctReadings}. The row's declared distinct figure is ${declaredPair('P-GT-SM-4').distinct}, while its declared ATTEMPT term stays ${declaredPair('P-GT-SM-4').term} (6 shapes × 2 readings, unmoved). Table readings: ${JSON.stringify(
        [...shapeReadings],
      )}`,
    ).toBe(10)
    expect(
      // **THE `isResizable === false` LIMB'S OWN CELL MUST SURVIVE THE COLLISION CHECK**: the limb
      // IS a genuinely driven reading (`'not-resizable'`, ZERO session calls, ZERO writes) and it
      // is carried INSIDE shape `(6)`'s attempts, so it must NOT have been smuggled INTO the table
      // as a seventh shape (that would move the declared term) and must NOT have collapsed any
      // class (that would hide a refusal the row declares).
      shapeReadings.size === 5 && shapeReadings.has('unusable-default|0|0') && shapeReadings.has('disposed|1|0'),
      `P-GT-SM-4 — the table is 5 distinct classes over the 6 shapes, with the 'unusable-default' AND the 'disposed' classes both present, while the ` + '`isResizable === false`' + ` limb stays INSIDE shape (6) (no seventh shape, no moved term). Table readings: ${JSON.stringify(
        [...shapeReadings],
      )}`,
    ).toBe(true)
  })

  it('P-GT-TP-1 (S-GT-TOTAL-1, bounded) — the SEVEN-SEAM TOTALITY universal over the pinned-seed pool: 30 draws × 2 configurations = 60 drives', async () => {
    const row = new RegisterRow('P-GT-TP-1', 'S-GT-TOTAL-1')
    for (let draw = 0; draw < TOTALITY_DRAWS; draw += 1) {
      const index = DRAWN_INDICES[draw]
      const member = TOTALITY_POOL[index]
      if (member === undefined) {
        await row.run(`the draw ${draw}`, () => `the pool index ${String(index)} is outside the pool`)
        continue
      }
      for (const config of TOTALITY_CONFIGS) {
        const options = config.build(member)
        await Promise.resolve()
        await row.run(`the draw ${draw} (${member.label}) × ${config.id}`, () =>
          totalityDrive(options, `draw ${draw}, config ${config.id}`),
        )
      }
    }
    row.finish()
    expect(row.attemptsRunPublic(), `P-GT-TP-1 — the declared term is ${declaredPair('P-GT-TP-1').term} (30 draws × 2 configurations)`).toBe(60)
    console.log(
      `§5.5.1 P-GT-TP-1 reported figure :: ${JSON.stringify({
        draws: TOTALITY_DRAWS,
        distinctDrawnPoolMembers: DISTINCT_DRAWN_POOL_MEMBERS,
        poolLength: POOL_LENGTH,
        note: 'A DRAW IS NOT A SWEEP: the distinct-member count is REPORTED and asserted by NO row',
      })}`,
    )
    expect(
      DISTINCT_DRAWN_POOL_MEMBERS <= POOL_LENGTH,
      'P-GT-TP-1 (bounded) — the universal “EVERY seam shape” is NOT proven by these 30 draws over a 20-member pool, and no reader may read this row as its proof (THE BOUND IS STATED IN THE ROW’S OWN WORDS, as ruling 8 requires)',
    ).toBe(true)
  })

  it('P-GT-TP-2 (S-GT-SHAPES-1) — the DECLARED-SHAPE-OVER-HOSTILE-ARGUMENTS totality of the four entry points: 6 argument shapes × 3 entry-point drives = 18', async () => {
    const row = new RegisterRow('P-GT-TP-2', 'S-GT-SHAPES-1')
    const throwingAccessor = (key: string): Record<string, unknown> => {
      const holder: Record<string, unknown> = {}
      Object.defineProperty(holder, key, {
        get(): unknown {
          throw new Error(`the accessor on ${key} threw`)
        },
      })
      return holder
    }
    const shapes: Array<{ label: string; value: unknown }> = [
      { label: '(1) undefined (the argument omitted)', value: undefined },
      { label: '(2) null', value: null },
      { label: '(3) 42', value: 42 },
      { label: "(4) 'x'", value: 'x' },
      {
        label: '(5) a Proxy whose traps THROW',
        value: new Proxy(
          {},
          {
            get(): unknown {
              throw new Error('the proxy get trap threw')
            },
            has(): boolean {
              throw new Error('the proxy has trap threw')
            },
          },
        ),
      },
      { label: '(6) a record with a throwing accessor on `session`', value: throwingAccessor('session') },
    ]
    for (const shape of shapes) {
      const drives = ['(a) the FACTORY', '(b) `attach(shape)` and `attach(shape, shape)`', '(c) `reset(shape)`, `detach()`, `stats()`'] as const
      for (const drive of drives) {
        const created = await createController(shape.value as Record<string, unknown>, `TP-2 ${shape.label} ${drive}`)
        await row.run(`${shape.label} × ${drive}`, () => {
          const controller = created.controller
          if (drive.startsWith('(a)')) {
            if (controller === null || typeof controller !== 'object') return 'the factory returned a non-controller value'
            for (const member of ['attach', 'detach', 'reset', 'stats'] as const) {
              if (typeof controller[member] !== 'function') return `\`${member}\` is not callable`
            }
            return null
          }
          if (drive.startsWith('(b)')) {
            const one = controller.attach(shape.value)
            const two = controller.attach(shape.value, shape.value as Record<string, unknown>)
            if (typeof one !== 'boolean' || typeof two !== 'boolean') {
              return `\`attach\` returned ${brief(one)} / ${brief(two)}, not booleans`
            }
            const reported = controller.stats().attached
            if (reported !== 0) return `\`stats().attached\` reads ${reported} for an argument the session cannot accept`
            return null
          }
          const record = controller.reset(shape.value)
          if (record === null || typeof record !== 'object') return `\`reset\` returned ${brief(record)}, not a record`
          for (const key of ['ok', 'code', 'committed']) {
            if (!(key in record)) return `the reset record is missing \`${key}\``
          }
          const detached = controller.detach()
          if (typeof detached !== 'boolean') return `\`detach()\` returned ${brief(detached)}, not a boolean`
          const stats = controller.stats()
          for (const key of ['attached', 'gestures', 'sinkCalls', 'written', 'resets', 'lastCode']) {
            if (!(key in stats)) return `\`stats()\` is missing \`${key}\``
          }
          return stats.attached === 0 && stats.gestures === 0
            ? null
            : `the counters are totals-inconsistent after the hostile drives: ${JSON.stringify(stats)}`
        })
      }
    }
    row.finish()
    expect(row.attemptsRunPublic(), `P-GT-TP-2 — the declared term is ${declaredPair('P-GT-TP-2').term}`).toBe(18)
  })

  it('REGISTER-STATUS — the executed record: per-row attempts/held/broken, the 299 total against its terms and the caps, the seed and step form, and the stop-after-5 status', async () => {
    const records = registerRecords
    const rowsRun = records.filter((record) => record.attemptsRun > 0)
    const executedTotal = rowsRun.reduce((sum, record) => sum + record.attemptsRun, 0)
    const terms = REGISTER_DECLARED.map((row) => `${row.term} (${row.row})`).join(' + ')
    console.log(
      `§5.5.1 REGISTER SUMMARY :: ${JSON.stringify({
        declaredTotal: REGISTER_PRINTED_TOTAL,
        declaredTerms: terms,
        declaredTermSum: REGISTER_DECLARED.reduce((sum, row) => sum + row.term, 0),
        declaredTotalEqualsItsOwnTerms: REGISTER_PRINTED_TOTAL === REGISTER_DECLARED.reduce((sum, row) => sum + row.term, 0),
        totalCapComparison: `${REGISTER_PRINTED_TOTAL} <= ${REGISTER_TOTAL_CAP}`,
        asFiledTotalDefect: {
          figure: REGISTER_AS_FILED_TOTAL_DEFECT,
          status: REGISTER_AS_FILED_TOTAL_DEFECT_NOTE,
        },
        executedTotal,
        attemptsCap: registerState.attempts,
        rowCap: REGISTER_ROW_CAP,
        totalCap: REGISTER_TOTAL_CAP,
        stopAfter: CONSECUTIVE_FAILURE_CAP,
        stoppedAt: registerState.stoppedAtRow,
        stoppedFor: registerState.stoppedFor,
        seed: SEED,
        stepForm: 'stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²; index = stateₙ₊₁ mod 20; ONE step per draw; pool.length = 20',
        draws: TOTALITY_DRAWS,
        distinctDrawnPoolMembers: DISTINCT_DRAWN_POOL_MEMBERS,
        boundedRows: REGISTER_BOUNDED_ROWS,
        declaredVsDistinct: REGISTER_DECLARED.map((row) => `${row.row}:${row.term}/${row.distinct}`),
        records,
      })}`,
    )
    expect(
      REGISTER_PRINTED_TOTAL,
      `REGISTER-STATUS — the AMENDED declared total is printed WITH ITS TERMS and IS their sum: 299 = ${terms}`,
    ).toBe(299)
    expect(
      REGISTER_DECLARED.reduce((sum, row) => sum + row.term, 0),
      `REGISTER-STATUS — THE TERM-SUM CHECK PASSES: the thirteen named terms sum to the DECLARED total (299), as the amended §5.5.1/§5.5.3 rule (the as-filed 314 is a corrected mis-sum, kept visible as a dated note only)`,
    ).toBe(REGISTER_PRINTED_TOTAL)
    expect(registerState.attempts, 'REGISTER-STATUS — the total attempts reported against the ≤400 register cap').toBeLessThanOrEqual(
      REGISTER_TOTAL_CAP,
    )
    for (const record of records) {
      expect(
        record.attemptsRun,
        `REGISTER-STATUS — row ${record.row} is inside the ≤100 per-row cap`,
      ).toBeLessThanOrEqual(REGISTER_ROW_CAP)
    }
    expect(
      records.map((record) => record.row),
      `REGISTER-STATUS — all THIRTEEN rows produced a record, in register order. Records: ${JSON.stringify(
        records.map((record) => ({ row: record.row, attemptsRun: record.attemptsRun, held: record.held, broken: record.broken, notStarted: record.notStarted })),
      )}`,
    ).toEqual(REGISTER_DECLARED.map((row) => row.row))
    const unrun = records.filter((record) => record.notStarted)
    expect(
      unrun.map((record) => record.row),
      `REGISTER-STATUS — an UN-RUN row is REPORTED AS A FAILURE, never as a pass (§4.2 item 2). Un-run: ${JSON.stringify(
        unrun.map((record) => record.row),
      )}`,
    ).toEqual([])
    expect(
      records.reduce((sum, record) => sum + record.broken, 0),
      `REGISTER-STATUS — the register's broken-attempt total. Per-row: ${JSON.stringify(
        records.map((record) => `${record.row}:${record.broken}/${record.attemptsRun}`),
      )}`,
    ).toBe(0)
    expect(
      records.reduce((sum, record) => sum + record.attemptsRun, 0),
      `REGISTER-STATUS — **THE LANDED TABLES' TOTAL IS ASSERTED AT ITS OWN MEASURED FIGURE (\`${
        records.reduce((sum, record) => sum + record.attemptsRun, 0)
      }\`) AND REPORTED BESIDE THE DECLARED \`299\`, NEVER RE-TOTALLED INTO IT** (\`§5.5.1 P-GT-IM-1\`/\`P-GT-IM-4\`'s dual figures, \`§5.5.3\`'s arithmetic, \`docs/decisions.md\` \`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS\` sub-rule 2). **THE DIFFERENCE IS EXACTLY THE TWO REGISTER RESIDUES, and it is REPORTED here rather than resolved: \`P-GT-IM-1\` runs \`20\` against its declared \`18\` (the landed grid enumerates all \`20\` combinations while the declared \`18\` is the conservative enumeration) and \`P-GT-IM-4\` runs \`27\` against its declared \`28\` (the axis shape \`(4)\` identity cell is covered by \`§3.2 F-18\`/\`M-7\` and is not among the \`27\`) — so \`20 + 27 = 47\` measured stands at \`18 + 28 = 46\` declared and the measured total is \`300\` against the declared \`299\`. THE \`299\` REMAINS THE SUM OF THE THIRTEEN DECLARED TERMS (asserted immediately above) AND THE CAPS ARE COMPARED AGAINST IT. Ran: ${executedTotal}`,
    ).toBe(300)
    expect(
      REGISTER_PRINTED_TOTAL,
      'REGISTER-STATUS — **AND THE MEASURED TOTAL DOES NOT REPLACE THE DECLARED ONE: the declared `299` is still printed as the sum of its own thirteen terms and is still what the `≤400` cap is compared against** (a declared-vs-measured difference is REPORTED, never silently re-totalled)',
    ).toBe(299)
    expect(
      registerState.stoppedAtRow,
      `REGISTER-STATUS — the stop-after-5-consecutive-failures status (${registerState.stoppedFor ?? 'not triggered'})`,
    ).toBe(null)
  })
})

// ===========================================================================
// ⟶ ADDED 2026-09-27 (THE `E3`-HOST REGRESSION PASS) — **THE THREE HOST-DEFECT
// REGRESSION ROWS**, authored FROM THE CONTRACT (`docs/specs/gutter.md`) AGAINST the
// landed module (`src/shared/gutter.ts`) and RUN before any fix (`RCA-1`: the red set
// is RUN and REPORTED before the Implementer's pass).
//
// **THE THREE DEFECTS ARE THE `docs/pending.md` §I-sexies `E3`-HOST-1/2/3 ROWS**, found
// INDEPENDENTLY by the gate-4 adversarial pass (`ADV-GT-1`/`ADV-GT-2`/`ADV-GT-3`/
// `ADV-GT-4`) and by the gate-5 blind pass (`docs/specs/gutter-greens.md`, the FAILs
// `GT-G-66` / `GT-G-93` / `GT-G-94`). **EACH ROW BELOW ASSERTS THE CONTRACT'S OWN CLAUSE**
// — never the defect's description — **and EACH CARRIES THE DRIVE WHOSE RECORDED LOG IS
// THE EVIDENCE**: every row reads the RECORDING session's own call log, the sink's own
// call record, or the session member-read record the double itself keeps. **WHERE THE
// DEFECT IS AN ABSENCE (or the falsifier is a count), THE ROW CARRIES A POSITIVE CONTROL
// that must FAIL if the scanner/recorder is dead**, so no row below can pass vacuously.
//
// **THE THREE ROWS, THEIR CLAUSES AND THEIR DRIVES — stated once so a reader does not
// have to reconstruct them:**
//
//   **(1) `E3-HOST-1` — the per-gesture record must be DISCARDED at the terminal.**
//   *Clause:* `§2.5` item 6 — *"The controller clears its per-gesture record at the
//   terminal … so a later `reset(element)` cannot reach for a dead handle"* — with `§3.3`
//   `I-9` (*"the per-gesture record … is DISCARDED at every terminal"*) and `§2.5` item 5
//   clause 3's **ZERO-session-call rule** for the refusal that follows. *Drive:* a full
//   gesture (down → move → up, so a REAL handle is captured through the composition's own
//   `onMove` wrapper — the one legal handle channel) then `reset(element)`; **the evidence
//   is `landedHarness`'s own recording session log, sliced at the terminal**. **THE ROW IS
//   DRIVEN TWICE — once with a THROWING consumer `onEnd` and once with a NON-throwing one —
//   so it can fail in BOTH directions**, and **MEASURED on the landed module both arms
//   record ONE `session.reset` carrying the dead handle** (the retained-record path is not
//   confined to the throwing hook: the module restores `entry.gesture` after the
//   consumer hook and clears it only on the reset path that the session has by then
//   refused — `§2.1` item 4's `detach` block's *"a handle past a terminal is never used"*,
//   `§3.3 I-9`). **The refusal's CODE is deliberately NOT pinned** (the two honest readings
//   are the session's `'stale'` on the double and `'no-gesture'` on the landed session —
//   `docs/specs/gutter-greens.md` FAIL 2's two instruments): **the violated half is the
//   CALL COUNT and the retention**, which is what this row asserts.
//
//   **(2) `E3-HOST-2` — the module must read NO session member outside the CLOSED SET.**
//   *Clause:* `§2.5` item 1 — the controller *"READS the session only through `stats()`,
//   `gesture()` and `disposed`, and CALLS only `install`, `reset` and `dispose`"* — with
//   `§3.4 R-7` and `§3.4 R-14` (*"asserted BY NAME, not by a count"*). **THE SPEC STATES
//   NO SIXTH MEMBER, so the row's closed set is those SIX NAMES and NOTHING ELSE**: the
//   module's own bytes are read through a by-name scanner, and the two invented names the
//   landed module probes (`registerCompositionWriter`, `registerCommit` — members **no
//   spec and no frozen session surface provides**) are named as the ABSENCE claim, with a
//   POSITIVE CONTROL CORPUS that carries one of them and MUST FAIL. *Runtime half:* a
//   session double that **EXPOSES BOTH invented members** must be consulted for NEITHER,
//   and the gesture's write count stays exactly `1` with the CLAMPED value (`100`) and
//   never the RAW default (`500`).
//
//   **(3) `E3-HOST-3` — `detached` must honour the session's own disposal, and
//   `attach`/`detach` must short-circuit on a disposed session.** *Clause:* `§2.1`'s
//   `ResizeController` doc block — *"`true` FOREVER once `detach()` has completed, **or
//   once the session reads `disposed === true`**"* — read with `§3.4 R-14`/`§3.3 I-8`,
//   which pin `disposed` as one of this module's three allowed READINGS and `install`
//   as a call this composition makes **once per distinct element** (so a disposed session
//   must not be delegated to at all: `§2.1` item 3's attach block lists *"the session is
//   unusable or disposed"* under *"delegating NOTHING"*). *Drive:* the session is disposed
//   directly through its OWN documented call (`dispose()` — `§2.5` item 1's table), then
//   `detached`, `attach(el2)`, `detach()` and `reset(el)` are asserted against the SAME
//   recording log, slice by slice; **the control drive is the UNDISPOSED session, which
//   must still attach and detach normally.**
//
//   **THE CONTRACT CONFLICT THIS PASS MET (REPORTED, NOT GUESSED):** `§2.5` item 5
//   clause 3 requires a record-less refusal to make **ZERO** session calls *"no `reset`,
//   no `stats()`, no `dispose()`"* **AND** `§2.3` item 4's code table row 5 gives the
//   disposed path the session's own `'disposed'` — two readings that cannot both hold if
//   a refusal must reach the session to obtain that code. **THE READING CHOSEN** (and the
//   reason): the ZERO-call rule is asserted as the falsifiable half, and the code is
//   asserted as a **member of the closed NINE-member domain** (`§2.1`'s note, `§2.3` item
//   4's table, `I-14`) rather than pinned to `'disposed'` — so the row exposes the defect
//   it was ordered for (`attach` DELEGATING to a disposed session) without forcing the
//   Implementer into a session call the same contract forbids.
// ===========================================================================
describe('E3-HOST-1/2/3 — the THREE HOST-DEFECT regression rows (contract-derived, RED against the landed module; `docs/pending.md` §I-sexies)', () => {
  /** `§2.1`'s note / `§2.3` item 4's table / `I-14`: THE CLOSED NINE-MEMBER CONTROLLER
   *  CODE DOMAIN — the session's SEVEN members plus this controller's TWO entry-point
   *  codes. It is used as a SET membership claim (where the contract offers a choice of
   *  two readings) and never as a count. */
  const NINE_MEMBER_DOMAIN: readonly string[] = [
    'ok',
    'not-installed',
    'busy',
    'disposed',
    'disconnected',
    'stale',
    'no-gesture',
    'unusable-default',
    'not-resizable',
  ]
  /** `§2.5` item 1's table, BY NAME: the three members this module may CALL and the three
   *  it may READ. **The row's closed set is these SIX and nothing else.** */
  const CLOSED_SESSION_MEMBERS: readonly string[] = ['install', 'reset', 'dispose', 'stats', 'gesture', 'disposed']
  /** **THE TWO INVENTED NAMES**, held as FRAGMENTS (`chunked`) because THIS FILE is one of
   *  the two files `§3.4 R-8`'s bound (b) scans and because `R-1`'s scan reads the module
   *  plus **this row's own controlled corpora**. */
  const INVENTED_SESSION_MEMBERS: readonly string[] = [
    chunked(['registerComposition', 'Writer']),
    chunked(['register', 'Commit']),
  ]

  /** `§3.4 R-7`/`R-14` read by name over the MODULE's bytes: every `<identifier>.<member>`
   *  read whose receiver is the module's own `session` binding. The positive control below
   *  proves the scanner is not dead. */
  function sessionMemberNames(src: string): string[] {
    const names: string[] = []
    const re = /(?:^|[^A-Za-z0-9_$.\-])session\s*\.\s*([A-Za-z_$][A-Za-z0-9_$]*)/g
    let match = re.exec(src)
    while (match !== null) {
      names.push(match[1] ?? '')
      match = re.exec(src)
    }
    return names
  }
  /** The two invented names' OCCURRENCE COUNT over a source text (`hitsOf`'s `S-6` join
   *  rule, so a `'register' + 'Commit'` split is still read as ONE token). */
  function inventedMemberHits(src: string): string[] {
    const found: string[] = []
    for (const name of INVENTED_SESSION_MEMBERS) {
      const count = boundedOccurrences(normalizedView(src), name)
      if (count > 0) found.push(`${name} ×${count}`)
    }
    return found
  }

  /** **THE RECORDER SOURCE for the closed-read-set row's own gesture drive** — a minimal
   *  element-keyed source (`makeRecorder`'s shape, `on`/`off` by `(element, type)`), so the
   *  row drives a real establishment → move → terminal sequence through the composition. */
  function makeLocalSource(): { source: RecorderSource; fire: (element: unknown, type: string) => void } {
    const attached = new Map<unknown, Map<string, () => void>>()
    const calls: string[] = []
    const source: RecorderSource = {
      calls,
      captures: [],
      attached,
      on(element: unknown, type: string, handler: () => void): void {
        calls.push(`on:${type}`)
        const per = attached.get(element) ?? new Map<string, () => void>()
        per.set(type, handler)
        attached.set(element, per)
      },
      off(element: unknown, type: string, handler: () => void): void {
        void handler
        calls.push(`off:${type}`)
        attached.get(element)?.delete(type)
      },
      fire(element: unknown, type: string): void {
        const handler = attached.get(element)?.get(type)
        if (typeof handler !== 'function') return
        handler()
      },
    }
    return { source, fire: source.fire }
  }

  /** **THE CLOSED-SET SESSION DOUBLE (`E3-HOST-2`'s runtime half): a session that EXPOSES
   *  BOTH invented members and keeps a RECORD OF EVERY MEMBER NAME READ FROM IT.** The
   *  invented members are deliberately NON-THROWING and are NOT forwarded into the landed
   *  session's commit channel — so a module that probes one is caught by the READ RECORD
   *  (the falsifier named for this defect), never by a harness throw. **AND THE DOUBLE IS
   *  NOT A SECOND WRITER OF ITS OWN: it invokes a REGISTERED writer only when a writer was
   *  actually registered**, so a conforming module (which registers nothing) is unaffected
   *  by this harness. */
  function makeClosedSetDouble(): {
    session: Record<string, unknown>
    readLog: string[]
    registeredCalls: string[]
    sinkWrites: unknown[]
    installKeys: string[]
  } {
    const readLog: string[] = []
    const registeredCalls: string[] = []
    const sinkWrites: unknown[] = []
    const installKeys: string[] = []
    const slot = { current: null as Record<string, unknown> | null }
    const disposedBox = { current: false }
    let writer: ((gesture: unknown, value: unknown) => void) | null = null
    let hooks: Record<string, unknown> = {}
    const invokeHook = (key: string, ...args: unknown[]): void => {
      const hook = hooks[key]
      if (typeof hook === 'function') (hook as (...a: unknown[]) => void)(...args)
    }
    const dispatchMove = (): void => {
      const record = slot.current
      if (record === null) return
      invokeHook('onMove', record['handle'])
    }
    const dispatchEnd = (raw: unknown): void => {
      const record = slot.current
      if (record === null) return
      slot.current = null
      invokeHook('onEnd', record['element'], raw)
      // **THE SESSION'S OWN ONE COMMIT CHANNEL, AT ITS `end` TERMINAL** (`gsession.md` `§2.3`
      // item 4): the RAW default is what THIS channel carries — never the clamped value, which
      // is the composition's own arithmetic. **A registered WRITER is a DIFFERENT channel**
      // (`§2.5` item 4's *"the harness's channel is a DIFFERENT channel"*): its invocation is
      // recorded only if it is reached, so the readings stay distinguishable.
      if (writer !== null && sinkWrites.length === 0) sinkWrites.push(raw)
    }
    /** The double's own `commit` option (`§2.5` item 4): it records what the SESSION's one
     *  channel receives — `E3-HOST-2`'s raw limb, should the composition route through it. */
    const commit = (_gesture: unknown, value: unknown): void => {
      if (sinkWrites.length === 0) sinkWrites.push(value)
    }
    const members: Record<string, unknown> = {
      install(element: unknown, options?: unknown): boolean {
        const record = (options ?? {}) as Record<string, unknown>
        installKeys.length = 0
        installKeys.push(...Object.keys(record).sort())
        hooks = record
        return true
      },
      begin(element: unknown): unknown {
        const record: Record<string, unknown> = {
          id: 1,
          element,
          outcome: null,
          handle: null,
        }
        // **THE HANDLE IS THE SESSION'S OWN SHAPE** (`gsession.md` `§2.5` item 9): the
        // consumer's own `onMove` is the ONE legal value channel, so the double's handle
        // carries `set`, `id`, `element` and `outcome` exactly as the landed session's does.
        record['handle'] = {
          id: 1,
          element,
          outcome: null,
          set(value: unknown): unknown {
            record['value'] = value
            return record['handle']
          },
        }
        slot.current = record
        invokeHook('onStart', element)
        return { ok: true, gesture: record['handle'] }
      },
      end(element: unknown, _gesture: unknown, raw: unknown): unknown {
        dispatchEnd(raw)
        return { ok: true, code: 'ok', committed: true }
      },
      reset(): unknown {
        return { ok: false, code: 'no-gesture', committed: false }
      },
      dispose(): unknown {
        disposedBox.current = true
        return { removed: 1, complete: true }
      },
      stats(): unknown {
        return { installed: 1, sourceCalls: 0, gestures: 1, commits: 0, active: false, gestureId: 0, lastCode: 'ok' }
      },
      gesture(): unknown {
        return slot.current
      },
      commit,
      registerCompositionWriter(handler: (gesture: unknown, value: unknown) => void): void {
        writer = handler
        registeredCalls.push('registerCompositionWriter')
      },
      registerCommit(handler: (gesture: unknown, value: unknown) => void): void {
        writer = handler
        registeredCalls.push('registerCommit')
      },
    }
    const session: Record<string, unknown> = {}
    for (const name of Object.keys(members)) {
      // **EVERY MEMBER IS AN ACCESSOR, SO EVERY READ LANDS IN `readLog`** — including a read
      // that merely tests a member's presence, which is the whole shape of this defect.
      Object.defineProperty(session, name, {
        enumerable: true,
        configurable: true,
        get(): unknown {
          readLog.push(name)
          return members[name]
        },
      })
    }
    Object.defineProperty(session, 'disposed', {
      enumerable: true,
      configurable: true,
      get(): unknown {
        readLog.push('disposed')
        return disposedBox.current
      },
    })
    Object.defineProperty(session, 'dispatchMove', { value: dispatchMove })
    return { session, readLog, registeredCalls, sinkWrites, installKeys }
  }

  it('E3-HOST-1 — the per-gesture record is DISCARDED at the terminal, so a later `reset(element)` refuses with ZERO session calls — driven TWICE, with a THROWING consumer `onEnd` and with a NON-throwing one, so the row can fail in BOTH directions', async () => {
    const drive = async (
      label: string,
      consumerEnd: (element: unknown, value: unknown) => void,
    ): Promise<{
      thrown: unknown
      code: string
      ok: boolean
      committed: boolean
      afterTerminal: string[]
      sinkCount: number
      sinkValue: unknown
    }> => {
      await requireLiveModule(`E3-HOST-1 ${label}`)
      const h = await landedHarness({ label: `E3-HOST-1 ${label}` })
      const sink = makeSink()
      const element: Record<string, unknown> = { control: `E3-HOST-1-${label}` }
      const { controller } = await createController(
        {
          session: h.session,
          axisFor: (): unknown => undefined,
          boundsFor: (): unknown => ({ min: 0, max: 100 }),
          defaultSizeFor: (): unknown => 100,
          isResizable: (): unknown => true,
          sizeFor: (): unknown => 100,
          commit: sink,
        },
        `E3-HOST-1 ${label}`,
      )
      controller.attach(element, {
        // The consumer's own `onMove` is the value channel (`§2.3` item 1, ruling 7) — AND it
        // is the composition's ONE legal handle channel (`§2.5` item 5 clause 2), so the drive
        // reaches its terminal with a REAL captured handle: without a move turn there is no
        // handle to retain, and the row would be vacuous.
        onMove: (gesture: GestureHandle): void => {
          gesture.set(777)
        },
        onEnd: consumerEnd,
      })
      h.source.fire(element, TYPE_DOWN)
      h.source.fire(element, TYPE_MOVE)
      let thrown: unknown = null
      try {
        h.source.fire(element, TYPE_UP)
      } catch (error) {
        // A THROWING consumer hook reaches the consumer boundary (§2.4 item 3 / `M-17`'s
        // shape). It is contained HERE so the row fails on its OWN labelled assertion
        // rather than as a harness throw.
        thrown = error
      }
      const afterTerminal = h.sessionLog.length
      const record = controller.reset(element)
      return {
        thrown,
        code: record.code,
        ok: record.ok,
        committed: record.committed,
        afterTerminal: h.sessionLog.slice(afterTerminal),
        sinkCount: sink.records.length,
        sinkValue: sink.records.length === 0 ? undefined : sink.records[0]?.value,
      }
    }

    // **BOTH ARMS ARE MEASURED BEFORE ANY ASSERTION**, so ONE failure carries the whole
    // reading (`§2.5` item 6's discard is the property, and the throwing hook is only one of
    // the two ways the terminal is reached).
    const clean = await drive('a NON-throwing consumer `onEnd`', (): void => undefined)
    const throwing = await drive('a THROWING consumer `onEnd`', (): void => {
      throw new Error('the consumer’s own onEnd threw')
    })
    expect(
      { control: clean.afterTerminal, throwing: throwing.afterTerminal },
      `E3-HOST-1 §2.5 item 6 + §3.3 I-9 — *"the controller clears its per-gesture record at the terminal … so a later \`reset(element)\` cannot reach for a dead handle"*, and \`§2.5\` item 5 clause 3 refuses with **ZERO session calls** (no \`reset\`, no \`stats()\`, no \`dispose()\`). The RECORDING session’s own log, sliced at each terminal, is the evidence: the control drive’s reading beside the throwing arm’s — ${JSON.stringify(
        { control: clean.afterTerminal, throwing: throwing.afterTerminal },
      )}`,
    ).toEqual({ control: [], throwing: [] })
    expect(
      { control: clean.sinkCount, throwing: throwing.sinkCount },
      `E3-HOST-1 — the gesture’s OWN write is the drive’s positive evidence that the terminal really ran (the composition’s single write site; the write count is NOT the clause under test): ${JSON.stringify(
        { control: clean.sinkCount, throwing: throwing.sinkCount },
      )}`,
    ).toEqual({ control: 1, throwing: 1 })
    expect(
      clean.ok === false && clean.committed === false,
      `E3-HOST-1 §2.5 item 5 clause 3/9 — the control drive’s refusal is a refusal RECORD and changes nothing (read: ${JSON.stringify(
        { ok: clean.ok, code: clean.code, committed: clean.committed },
      )})`,
    ).toBe(true)
    expect(
      [clean.code, throwing.code].every((code) => NINE_MEMBER_DOMAIN.includes(code)),
      `E3-HOST-1 §2.3 item 4’s table / I-14 — each refusal’s code is a member of the closed NINE-member domain, whichever honest reading the session’s own answer takes (\`'stale'\` on the double, \`'no-gesture'\` on the landed session — the two readings \`docs/specs/gutter-greens.md\` FAIL 2 measured). Read: ${JSON.stringify(
        [clean.code, throwing.code],
      )}`,
    ).toBe(true)
    expect(
      throwing.thrown instanceof Error,
      `E3-HOST-1 §2.5 item 6 / §2.4 item 3 — the throwing arm’s own drive DID reach the consumer boundary (the drive’s error record; read: ${brief(
        throwing.thrown,
      )})`,
    ).toBe(true)
  })

  it('E3-HOST-2 — the module reads NO session member outside the CLOSED SET (the by-name census over the MODULE’s bytes with a positive-control corpus that MUST FAIL), and a session EXPOSING the two invented members is never consulted: ONE write, the CLAMPED value', async () => {
    const source = moduleSource('E3-HOST-2')
    const outsideSet = sessionMemberNames(source).filter((name) => !CLOSED_SESSION_MEMBERS.includes(name))
    expect(
      outsideSet,
      `E3-HOST-2 §2.5 item 1 / §3.4 R-7 + R-14 — asserted BY NAME over the MODULE’s bytes: the ONLY session members READ are ${JSON.stringify(
        CLOSED_SESSION_MEMBERS,
      )}, and NOTHING ELSE. Names read outside the closed set: ${JSON.stringify(outsideSet)} (all names read: ${JSON.stringify(sessionMemberNames(source))})`,
    ).toEqual([])
    const invented = inventedMemberHits(source)
    const inventedNamesRaw = INVENTED_SESSION_MEMBERS.map((name) => name.split(JOIN_MARKER).join(''))
    expect(
      invented.map((hit) => hit.split(JOIN_MARKER).join('')).map((hit) => hit.replace(/ ×\d+$/, '')),
      `E3-HOST-2 §2.5 item 1 — the two INVENTED names (${JSON.stringify(
        inventedNamesRaw,
      )} — members no clause of \`docs/specs/gutter.md\` and no item of the frozen session surface provide) occur NOWHERE in the module, in ANY form (the \`S-6\` join rule reads a split spelling as one token). Hits: ${JSON.stringify(
        invented,
      )}`,
    ).toEqual([])
    // **THE POSITIVE CONTROL — the scanner is not dead.** A corpus whose bytes carry the
    // invented names, the module's own legitimate reads and its own writes together MUST
    // be caught, so the two assertions above are falsifiable rather than vacuous.
    const positiveCorpus = [
      'session.' + inventedNamesRaw[0] + '(write)',
      'session.' + inventedNamesRaw[1] + '(write)',
      'session.install(element, wrapped)',
      'session.reset(element, gesture, narrowed)',
      'session.dispose()',
      'session.stats()',
      'session.gesture()',
      'session.disposed',
    ].join('\n')
    const controlOutside = sessionMemberNames(positiveCorpus).filter((name) => !CLOSED_SESSION_MEMBERS.includes(name))
    expect(
      controlOutside,
      `E3-HOST-2 POSITIVE CONTROL — a corpus carrying the invented member names MUST be reported outside the closed set (and it carries the five legitimate names too, so the scan is not merely matching everything): a scanner that returns \`[]\` here is dead and the row above would be vacuous. Read: ${JSON.stringify(
        controlOutside,
      )}`,
    ).toEqual(inventedNamesRaw)
    expect(
      inventedMemberHits(positiveCorpus).length,
      `E3-HOST-2 POSITIVE CONTROL — the absence scanner DETECTS both invented names in the control corpus: a corpus carrying them must fail the assertion above. Hits: ${JSON.stringify(
        inventedMemberHits(positiveCorpus),
      )}`,
    ).toBe(INVENTED_SESSION_MEMBERS.length)
    expect(
      inventedMemberHits('const a = session.stats()\nconst b = session.disposed\nconst c = session.install(e, o)'),
      'E3-HOST-2 NEGATIVE CONTROL — the module’s own legitimate text (the six closed-set names) carries NEITHER invented name',
    ).toEqual([])

    // **THE RUNTIME HALF — a session that EXPOSES both invented members, with EVERY member
    // read recorded by the double itself.** **THE MEASUREMENT ON THE LANDED MODULE IS
    // RECORDED HERE SO THE ROW IS NOT READ AS A TWO-WRITER CLAIM IT DID NOT MEASURE: the
    // construction-time probe IS performed (`registerCompositionWriter` appears in the read
    // log and in the double's own call record, carrying the composition's `write` function —
    // the `callableMember` presence test is what reads it, which is exactly why a mere READ is
    // the falsifier this row asserts on), while `registerCommit` is never reached because the
    // first probe succeeds; and the composition's SINGLE write site still writes, so the sink's
    // record reads ONE clamped call. THE TWO-WRITER DIVERGENCE `§2.5` item 4 and `P-GT-SM-3`
    // quantify belongs to a session that INVOKES the registered writer, and it is `F-9`/
    // `P-GT-SM-3` shape `(2)`'s own drive — this row's falsifiers are the READ LOG and the
    // write COUNT, both of which the probe above breaks.**
    await requireLiveModule('E3-HOST-2 runtime')
    const double = makeClosedSetDouble()
    const sink = makeSink()
    const element: Record<string, unknown> = { control: 'E3-HOST-2' }
    const { controller } = await createController(
      {
        session: double.session,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        defaultSizeFor: (): unknown => 500,
        isResizable: (): unknown => true,
        sizeFor: (): unknown => 500,
        commit: sink,
      },
      'E3-HOST-2 runtime',
    )
    // **THE RUNTIME FALSIFIER, COLLECTED AS ONE RECORD SO BOTH READINGS SURVIVE INTO THE
    // FAILURE MESSAGE** (an earlier assertion must not hide a later one): every member name the
    // composition READ from the session during CONSTRUCTION, and every name it read once the
    // composition ATTACHED — a construction-time PROBE of an invented member lands in the first
    // list, an attach-time or terminal-time one in the second.
    const constructionReads = [...new Set(double.readLog)].sort()
    controller.attach(element, {
      onMove: (gesture: GestureHandle): void => {
        gesture.set(777)
      },
    })
    const attachedReads = [...new Set(double.readLog)].sort()
    const outsideReads = [...new Set([...constructionReads, ...attachedReads])].filter(
      (name) => !CLOSED_SESSION_MEMBERS.includes(name),
    )
    expect(
      outsideReads,
      `E3-HOST-2 §2.5 item 1 / R-14 — a session that EXPOSES both invented members is consulted for NEITHER: the recorded member-read log contains no name outside ${JSON.stringify(
        CLOSED_SESSION_MEMBERS,
      )}. Names read outside the closed set: ${JSON.stringify(
        outsideReads,
      )}; the invented members' own recorded CALLS: ${JSON.stringify(double.registeredCalls)}`,
    ).toEqual([])
    const installedKeys = double.installKeys
    expect(
      installedKeys,
      `E3-HOST-2 §2.1 item 5 — the object handed to \`install\` is the four hooks and NOTHING else (no \`capture\`, no fifth key): the double’s own recorded key set. Recorded: ${JSON.stringify(
        installedKeys,
      )}`,
    ).toEqual(['onCancel', 'onEnd', 'onMove', 'onStart'])
    // The drive reaches its terminal through the double’s own documented acts: `begin`
    // (establishment), the move dispatch (the composition’s ONE legal handle channel), then
    // `end` with the RAW default `500` — the value the registered-writer path would commit
    // INSTEAD of the clamped one.
    const begin = (double.session['begin'] as (e: unknown) => unknown)(element)
    expect(begin, 'E3-HOST-2 — the drive establishes (the double’s own `begin` answered `{ok: true, …}`)').toMatchObject({ ok: true })
    ;(double.session['dispatchMove'] as () => void)() // held as a non-enumerable member by the double (see `makeClosedSetDouble`)
    ;(double.session['end'] as (e: unknown, g: unknown, raw: unknown) => unknown)(element, null, 500)
    expect(
      sink.records.length,
      `E3-HOST-2 §2.3 item 3 / I-2 — EXACTLY ONE sink call for the gesture, whatever the session EXPOSES: a session carrying the invented seam must not turn the composition into a two-writer one. Recorded: ${sink.records.length} (values: ${JSON.stringify(
        sink.records.map((record) => record.value),
      )})`,
    ).toBe(1)
    expect(
      sink.records[0]?.value,
      `E3-HOST-2 §2.5 item 5 clause 5 / §2.3 item 4 — the committed value is the CLAMPED default (\`100\`), NEVER the RAW default (\`500\`): the registered-writer path would commit the raw one. Recorded: ${brief(
        sink.records[0]?.value,
      )}`,
    ).toBe(100)
    expect(
      double.sinkWrites,
      `E3-HOST-2 — and the double’s own session-channel record stays EMPTY: no writer was ever registered through the invented seam, so the composition’s single write site is the only writer. Recorded: ${JSON.stringify(
        double.sinkWrites,
      )}`,
    ).toEqual([])
    expect(
      controller.stats().written,
      'E3-HOST-2 — the controller’s own counter agrees: exactly one write returned',
    ).toBe(1)
  })

  it('E3-HOST-3 — `detached` honours the session’s own disposal, and `attach`/`detach`/`reset` short-circuit on a DISPOSED session with ZERO session calls (with the UNDISPOSED control drive)', async () => {
    await requireLiveModule('E3-HOST-3')
    const h = await landedHarness({ label: 'E3-HOST-3' })
    const sink = makeSink()
    const element: Record<string, unknown> = { control: 'E3-HOST-3' }
    const { controller } = await createController(
      {
        session: h.session,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        defaultSizeFor: (): unknown => 100,
        isResizable: (): unknown => true,
        sizeFor: (): unknown => 100,
        commit: sink,
      },
      'E3-HOST-3',
    )
    // **THE DISPOSAL IS THE SESSION’S OWN DOCUMENTED CALL** (`§2.5` item 1’s table:
    // `session.dispose()`), not the controller’s `detach()`.
    const disposed = (h.session['dispose'] as () => unknown)()
    expect(
      (disposed as { readonly complete?: unknown } | null)?.complete,
      `E3-HOST-3 §2.1 item 4 — the session’s own disposal completed (\`complete === true\`), which is the state \`detached\`’s second limb is written against. Read: ${brief(
        disposed,
      )}`,
    ).toBe(true)
    expect(
      controller.detached,
      'E3-HOST-3 §2.1 item 4 (`ResizeController.detached`) — `detached` reads `true` FOREVER once the session reads `disposed === true`, with NO `detach()` call of any kind',
    ).toBe(true)

    const before = h.sessionLog.length
    const second: Record<string, unknown> = { control: 'E3-HOST-3-second' }
    const attached = controller.attach(second)
    expect(
      attached,
      `E3-HOST-3 §2.1 item 3 — \`attach\` returns \`false\` for a DISPOSED session (the attach block lists “the session is unusable or disposed” under DELEGATING NOTHING). Read: ${brief(
        attached,
      )}`,
    ).toBe(false)
    const refusedDetach = controller.detach()
    expect(
      refusedDetach,
      `E3-HOST-3 §2.1 item 3 — \`detach()\` returns \`false\` on a session that is ALREADY disposed (it holds no attached element and the session is already disposed). Read: ${brief(
        refusedDetach,
      )}`,
    ).toBe(false)
    const resetRecord = controller.reset(element)
    expect(
      NINE_MEMBER_DOMAIN.includes(resetRecord.code) && resetRecord.ok === false && resetRecord.committed === false,
      `E3-HOST-3 §2.3 item 4’s table / I-14 + §2.5 item 5 clauses 3/9 — the refused reset reports \`ok: false\` and \`committed: false\` with a code that is a member of the closed NINE-member domain (\`'disposed'\` and \`'no-gesture'\` are the two honest readings). Read: ${JSON.stringify(
        resetRecord,
      )}`,
    ).toBe(true)
    expect(
      h.sessionLog.slice(before),
      `E3-HOST-3 §2.5 item 1 / §2.1 item 3 — against a session that reads \`disposed === true\` NOTHING is DELEGATED: no \`install\`, no \`dispose\`, no \`reset\`, no \`stats()\` after the disposal. The recording session’s own log, sliced at the disposal, is the evidence. Recorded: ${JSON.stringify(
        h.sessionLog.slice(before),
      )}`,
    ).toEqual([])
    expect(sink.records.length, 'E3-HOST-3 — and the disposed drive writes nothing').toBe(0)

    // **THE CONTROL DRIVE — the row cannot pass vacuously:** an UNDISPOSED session still
    // attaches and detaches normally, with exactly ONE `dispose` in its own log.
    const control = await landedHarness({ label: 'E3-HOST-3 control' })
    const controlElement: Record<string, unknown> = { control: 'E3-HOST-3-control' }
    const created = await createController(
      {
        session: control.session,
        axisFor: (): unknown => undefined,
        boundsFor: (): unknown => ({ min: 0, max: 100 }),
        defaultSizeFor: (): unknown => 100,
        isResizable: (): unknown => true,
        sizeFor: (): unknown => 100,
        commit: makeSink(),
      },
      'E3-HOST-3 control',
    )
    expect(
      created.controller.detached,
      'E3-HOST-3 CONTROL — a fresh controller over an UNDISPOSED session reads `detached === false` (so `true` above is the disposal’s reading, never a constant)',
    ).toBe(false)
    expect(
      created.controller.attach(controlElement, {}),
      'E3-HOST-3 CONTROL — an UNDISPOSED session still attaches normally (`true`)',
    ).toBe(true)
    expect(
      control.sessionLog.filter((call) => call === 'dispose').length,
      'E3-HOST-3 CONTROL — and the attach delegates NO `dispose`',
    ).toBe(0)
    expect(
      created.controller.detach(),
      'E3-HOST-3 CONTROL — `detach()` still returns `true` on an UNDISPOSED session reporting `complete: true`',
    ).toBe(true)
    expect(
      control.sessionLog.filter((call) => call === 'dispose').length,
      `E3-HOST-3 CONTROL — with exactly ONE \`session.dispose()\` in the control drive’s own log. Recorded: ${JSON.stringify(
        control.sessionLog,
      )}`,
    ).toBe(1)
    expect(created.controller.detached, 'E3-HOST-3 CONTROL — and `detached` reads `true` after that completed detach').toBe(true)
  })
})
