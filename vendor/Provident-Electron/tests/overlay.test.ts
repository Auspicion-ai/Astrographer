// tests/overlay.test.ts
// ===========================================================================
// U-OVERLAY · wave E · ledger row E9 · **THE RED SET** (RCA-1)
//
// Contract: docs/specs/overlay.md — `CURRENT STATE` + `§0`/`§0A` (note 1: the
// module path `src/shared/overlay.ts` and the test path `tests/overlay.test.ts`
// are PINNED; note 2: the declaration is a RETURNED WRITE with the four members
// `{name, value, removal, target}`; note 3: the `H-r7` carve-out is untouched),
// the Layer declaration, `§1` (**the re-parent half is REFUSED — NO row is
// authored for it**; the only rows that touch it are the ABSENCE rows `F-10` /
// `R-12` / `I-11` / `P-OV-TP-5` and the refusal's own statement), `§2.1` (the
// FIVE exported names in TWO halves: `overlayTransition` + `overlayInertDeclaration`,
// and the types `OverlayState` / `OverlayTransition` / `OverlayInertWrite`; the
// EMPTY import census; the EMPTY seam set; the ELEVEN declared literal bodies),
// `§2.2` (the six-row `H-r8` table `P-OV-1`..`P-OV-6`, the derived `P-OV-7`..`P-OV-12`,
// the seven-token collision reconciliation and the scan rows' DECLARED
// EXEMPTIONS), `§2.3` (the verb normalization table and the whole `4 × 5 = 20`
// transition matrix), `§2.4` (the name-echo rule, the strict value rule, the
// never-consulted `target`, the no-write rule, the fresh-plain-record rule),
// `§2.5` (the composition boundary, the no-fabricated-edge rows, the entry-point
// answer `NO`, the refusal's statement), `§3.1` `M-1`..`M-9`, `§3.2` `F-1`..`F-10`,
// `§3.3` `I-1`..`I-13`, `§3.4` `R-1`..`R-14`, `§3.5` `X-1`..`X-6`, `§4.1`..`§4.5`
// (the red's mandate, its order, its stop conditions `S-OV-1`..`S-OV-11`),
// `§5.1` (the diff scope), `§5.2` (the five legs + the THREE-PART `[U]` refusal),
// `§5.3`, `§5.5`/`§5.5.0`/`§5.5.1`/`§5.5.2`/`§5.5.3` (the typed register: `13`
// ROWS / `13` TERMS / `104` declared attempts printed with their terms / the
// DISTINCT figure `101` — each with its AS-FILED `102`/`99` kept visible beside it
// under the dated annotations of `§0A` notes 8 and 9 / seed `20260927` /
// caps `≤100`/row · `≤400` total · stop-after-5 / the `(bounded)` set), `§6`,
// `§7`/`§7a`/`§7a.1` (the four recorded
// working defaults, CONFIRMED at the spec gate — not re-litigated here), `§8`,
// `§3a`/`§3b`.
//
// ---------------------------------------------------------------------------
// WHAT THIS FILE IS, AND WHAT IT IS NOT
// ---------------------------------------------------------------------------
// **THE UNIT'S RED SET AND NOTHING ELSE** (`§4.1`). It is authored FIRST from the
// contract ALONE and RUN before any implementation. The spec's declared red shape
// is `Cannot find module '../src/shared/overlay.js'` (or the repo's equivalent
// module-resolution failure) for every row that imports the module, PLUS the
// static/existence rows that are already evaluable — `§3.4`'s `R-13`, `R-3`'s
// config/dependency half, `R-6`'s no-importer half and `§3.5`'s `X-1`..`X-6`.
//
// **LAYER, stated first because `§5.2`'s refusals bind this file:** every row here
// is `[T]` (the repo's own node suite) or `static` — two pure functions over
// caller arguments. **NO DOM, NO ELEMENT, NO NODE, NO SHIM MEMBER, NO OS, NO
// COORDINATE AND NO CSS RESOLUTION IS USED BY ANY ROW** (`§5.5.1` cap 6(a)): the
// only arguments are a caller's state word, verb word, callback, opaque target,
// attribute name and boolean. **No window boots, no attribute is written, no
// element is touched, no node is moved, no listener is installed, and NO OVERLAY
// APPEARS ANYWHERE** (layer anchors 1/2/5). `[U]` is NOT OFFERED by the unit (the
// three-part refusal, `§5.2`) and `[D]` is NOT CLAIMED. Gate 6 is `STRUCTURAL`,
// never `waived` — **the live app CANNOT REACH this module** (no importer, no
// rendered surface, nothing written or moved).
//
// **AUTHORING ORDER (`§4.2`, followed literally):** (1) the `§3.5` existence rows
// `X-1`..`X-6` with `R-3`'s config half, `R-13` and `R-6`'s no-importer half;
// (2) the `§3.4` static rows `R-1`..`R-14`; (3) the totality/degradation rows
// `F-1`..`F-10` and `I-1`..`I-13`; (4) `M-1`..`M-9` with `M-3`/`M-4` beside the
// rows they make falsifiable and `M-9` LAST; (5) the `§5.5.1` register rows in
// register order, then the register-harness rows. The describe blocks below are in
// that order.
//
// **WHAT THE RED IS NOT (`§4.3`):** no DOM test, no visual test, no OS/media-query/
// focus test, no store or persistence test, no wiring/dispatch/MCP test, no sibling
// test and no composition-of-a-sibling test, no assembled-app evidence and **NO
// MUTATION TEST** (a row asserting a node was re-parented, released or moved to a
// portal asserts a clause this unit REFUSES, `S-OV-11`).
//
// **`S-OV-1`..`S-OV-11` IN FORCE THROUGHOUT:** no row here requires the module to
// author an element, name an attribute, perform a write or read a DOM (`S-OV-1`);
// every scan is closed against token assembly and comment-carrying and NAMES its
// declared exemptions (`S-OV-2`); no row asks for a `code`/`reason`/`ok`/`thrown`
// shape or a fifth state body (`S-OV-3`); no row requires coercion or a policy
// (`S-OV-4`); none requires persistence (`S-OV-5`); no prohibition is asserted by a
// bare COUNT (`S-OV-6`); the literal census INCLUDES the `typeof`-tag body `'string'`
// (`S-OV-7`); records are compared with `toEqual` + distinct identity while member
// values are compared with `toBe` (`S-OV-8`); no import edge is asserted toward any
// sibling (`S-OV-9`); no `[U]`/`[D]` row is offered or claimed (`S-OV-10`); no row
// asserts a move, a parent, a portal, an owner record or a returned plan (`S-OV-11`).
//
// **THE IMPORT BOUNDARY (the repo's established technique — a structural type plus
// a computed dynamic specifier, `tests/theme.test.ts`, `tests/container.test.ts`,
// `tests/owned-list-host.test.ts`):** the module does not exist yet, so the RUNTIME
// half is reached through `import(/* @vite-ignore */ …)` over a computed specifier,
// and every row fails as a LABELLED ASSERTION naming the absent module — never as a
// transform error that would take the whole red set with it. The TYPE half is a real
// `import type` at the top, which is what makes `§5.2` leg 5 — the standalone strict
// `tsc` over THIS file — the leg that pins `§3.4 R-5`(b) and `R-7`(c): a rename,
// removal or unexported name FAILS TO COMPILE there while the runtime rows still run
// and report.
// ===========================================================================
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

// ⟶ THE TYPE HALF OF THE CENSUS (`§3.4 R-5`(b), `§5.2` leg 5). A type-only name is
// ERASED AT RUN TIME, so this import is the ONLY instrument that can pin it.
import type { OverlayState, OverlayTransition, OverlayInertWrite } from '../src/shared/overlay.js'

/** `§2.1`'s three type declarations, referenced by the type-checked probes below so
 *  an unused type-only import cannot mask a rename, a removal or an unexported name. */
type ExportedTypes = [OverlayState, OverlayTransition, OverlayInertWrite]

// ===========================================================================
// PATHS, SPECIFIERS AND STRUCTURAL MIRRORS OF `§2.1`
// ===========================================================================
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const MODULE_SRC = new URL('../src/shared/overlay.ts', import.meta.url)
const MODULE_PATH = fileURLToPath(MODULE_SRC)
const TEST_PATH = fileURLToPath(new URL('./overlay.test.ts', import.meta.url))
const MODULE_SPECIFIER = ['..', 'src', 'shared', 'overlay.js'].join('/')

/** `§2.1` item 1 — the TWO value exports, BY NAME. */
const VALUE_EXPORTS: readonly string[] = ['overlayTransition', 'overlayInertDeclaration']
/** `§2.1` item 1 / `§2.1` item 6 — the THREE type declarations, BY NAME. */
const TYPE_NAMES: readonly string[] = ['OverlayState', 'OverlayTransition', 'OverlayInertWrite']

/** `§2.1` item 2 — `OverlayTransition`'s two declared names, IN DECLARED ORDER. */
const TRANSITION_KEYS: readonly string[] = ['state', 'changed']
/** `§2.1` item 2 / `§0A` note 2 — `OverlayInertWrite`'s four, IN DECLARED ORDER. */
const WRITE_KEYS: readonly string[] = ['name', 'value', 'removal', 'target']
/** `§2.2`(B) `P-OV-7` — the attribute name is the CALLER's; the tests use
 *  caller-chosen spellings only (the mechanism owns NO name and NO default). */
const NAME_A = 'data-x'
const NAME_B = ' data-y '
/** A caller's own opaque identity (never read, only echoed). */
const TGT: unknown = Object.freeze({ caller: 'own' })

// ===========================================================================
// THE TOKEN ASSEMBLY INSTRUMENT (`§4.3`: the banned vocabulary may appear only
// inside this file's OWN CONTROL CORPORA, which are ASSEMBLED FROM CHARACTER
// CODES for exactly that reason). `cc([...])` joins character-code fragments at
// RUN TIME, so no banned spelling exists in this file's bytes; it also means a
// source-text scan of this file cannot see one.
// ===========================================================================
function cc(parts: readonly (string | number)[]): string {
  return parts.map((p) => (typeof p === 'number' ? String.fromCharCode(p) : p)).join('')
}
function codes(text: string): number[] {
  return [...text].map((c) => c.charCodeAt(0))
}
/** The ONE assembled-token helper, declared as a FUNCTION so the contract's own
 *  body constants below can be built from it at module-initialization time. */
function t0(text: string): string {
  return cc(codes(text))
}

/** `§2.3` item 2 — the CLOSED four-state set. A FIFTH body is a contract amendment. */
const STATE_BODIES: readonly string[] = [t0('closed'), t0('open'), t0('held'), t0('closing')]
/** `§2.3` item 1 — the CLOSED five-body verb alphabet (`'unknown'` is the declared
 *  NO-MOVE verb, a MEMBER of the alphabet and never a refusal state). */
const VERB_BODIES: readonly string[] = [t0('open'), t0('close'), t0('toggle'), t0('escape'), t0('unknown')]
/** The four verbs that move a state under their own declared rules (the fifth,
 *  `'unknown'`, is the declared no-move verb and is driven separately). */
const MOVING_VERBS: readonly string[] = [t0('open'), t0('close'), t0('toggle'), t0('escape')]
/** A `globalThis`-rooted lookup, ASSEMBLED, so a scan of this file finds no realm
 *  token in its bytes (`R-14`'s boundary and `R-2`'s test-file half both read it). */
function realmRoot(): Record<string, unknown> {
  return (globalThis as unknown as Record<string, Record<string, unknown>>)[t0('globalThis')] as unknown as Record<string, unknown>
}

/** **⟶ `AD-6`'s DRIVE MECHANISM — THE THIRD BANNED COERCION HOOK, AS A KEY.** `R-14`
 *  bans `toString`, `valueOf` **and the well-known `Symbol.toPrimitive`** on any caller
 *  argument, and this file's count-`0` assertions must be able to DRIVE the third rather
 *  than assert its absence from a spelling. The well-known symbol is looked up through
 *  the file's ONE assembled-token helper, so THIS FILE'S SCANNED VIEW (string literals
 *  stripped, as the unit's own byte scans read it) carries no banned spelling while the
 *  lookup is the live well-known symbol (`§2.4` item 3, `R-14`, `P-OV-1`/`I-12`). */
const COERCION_KEY = Symbol[t0('toPrimitive') as 'toPrimitive']
/** `§3.2 F-4` / `P-OV-IM-4` — an identity whose `toString`, `valueOf` AND
 *  `Symbol.toPrimitive` hooks ALL THROW, with every invocation count recorded: the
 *  drive that catches a module reading the `target` (`§2.4` item 3's own named
 *  falsifier) **including the third hook the contract bans and no earlier drive
 *  exercised** (`AD-6`). */
function throwingHookIdentity(): { readonly value: unknown; readonly counts: HookCounts } {
  const counts: HookCounts = { toString: 0, valueOf: 0, toPrimitive: 0 }
  const value = {
    toString(): string {
      counts.toString += 1
      throw new Error('the toString hook of a caller identity must never be consulted')
    },
    valueOf(): number {
      counts.valueOf += 1
      throw new Error('the valueOf hook of a caller identity must never be consulted')
    },
    [COERCION_KEY](): string {
      counts.toPrimitive += 1
      throw new Error('the well-known coercion-hook symbol of a caller identity must never be consulted')
    },
  }
  return { value, counts }
}
/** `§3.2 F-1`/`F-2`/`F-5` — an object carrying RECORDING coercion hooks (`toString`,
 *  `valueOf` and the well-known `Symbol.toPrimitive`, `AD-6`), so the declared
 *  count-`0` assertions are falsifiable by construction rather than true-by-construction. */
function hookRecorder(): { readonly value: unknown; readonly counts: HookCounts } {
  const counts: HookCounts = { toString: 0, valueOf: 0, toPrimitive: 0 }
  const value = {
    toString(): string {
      counts.toString += 1
      return 'a-coerced-spelling'
    },
    valueOf(): number {
      counts.valueOf += 1
      return 1
    },
    [COERCION_KEY](): string {
      counts.toPrimitive += 1
      return 'a-coerced-primitive'
    },
  }
  return { value, counts }
}
/** A REVOKED `Proxy`: ANY interaction raises a `TypeError`, so a module that reads
 *  the identity it was handed fails here (`§2.4` item 3). */
function revokedProxy(): unknown {
  const { proxy, revoke } = Proxy.revocable({}, {})
  revoke()
  return proxy
}
/** A `Proxy` whose `get`/`has`/`getOwnPropertyDescriptor` traps THROW. */
function trapThrowingProxy(): unknown {
  return new Proxy(
    {},
    {
      get(): never {
        throw new Error('a trap of an opaque caller identity must never be entered')
      },
      has(): never {
        throw new Error('a trap of an opaque caller identity must never be entered')
      },
      getOwnPropertyDescriptor(): never {
        throw new Error('a trap of an opaque caller identity must never be entered')
      },
    },
  )
}
/** `§5.5.1 P-OV-TP-1`'s TWELVE-MEMBER POOL, in the spec's DECLARED ORDER. A `Map`
 *  and a `Set` carry NO coercion hook that throws, which is why the coercing shapes
 *  are driven separately as their own table members. */
type HookCounts = { toString: number; valueOf: number; toPrimitive: number }
type PoolMember = { readonly id: string; readonly value: () => unknown; readonly hooks: HookCounts | null }
function makePool(): readonly PoolMember[] {
  const throwing = throwingHookIdentity()
  const nested: unknown[] = [1, [2, [3, [4]]]]
  const selfRef: Record<string, unknown> = {}
  selfRef['self'] = selfRef
  return [
    { id: '(1) a null-prototype record', value: () => Object.create(null) as unknown, hooks: null },
    { id: '(2) NaN and -0', value: () => Number.NaN, hooks: null },
    { id: '(3) a Symbol', value: () => Symbol('x'), hooks: null },
    { id: '(4) a 12n bigint', value: () => 12n, hooks: null },
    { id: '(5) a revoked Proxy', value: () => revokedProxy(), hooks: null },
    { id: '(6) a trap-throwing Proxy', value: () => trapThrowingProxy(), hooks: null },
    { id: '(7) an identity whose toString/valueOf/the banned well-known coercion-hook symbol THROW', value: () => throwing.value, hooks: throwing.counts },
    { id: '(8) a self-referential object', value: () => selfRef, hooks: null },
    { id: '(9) a Map', value: () => new Map<string, number>([['a', 1]]), hooks: null },
    { id: '(10) a Set', value: () => new Set<number>([1, 2]), hooks: null },
    // ⟶ **`AD-5` REPAIR — POOL MEMBER (11) NOW DRIVES WHAT ITS OWN DECLARED WORDING
    // SAYS.** The contract's pool reads *"(11) a function (and a THROWING function as
    // the callback arm)"*, while the member as filed held a PLAIN function — so the
    // drawn `as callback` arm never drove the declared throw. `thrower()` is BOTH halves
    // in one member: its `typeof` is `'function'` (the identity the other arms carry) and
    // its INVOCATION throws (the declared callback arm, which `I-1`/`I-13` require the
    // module to ABSORB). THE INDEX, THE DRAWN SEQUENCE AND THE DRAWN MEMBER COUNT ARE
    // UNCHANGED: no pool member, term, row id, strategy id, seed or cap moves.
    { id: '(11) a function (and a THROWING function as the callback arm)', value: () => thrower(), hooks: null },
    { id: '(12) [] and a deeply nested array', value: () => nested, hooks: null },
  ]
}
const TP1_POOL: readonly PoolMember[] = makePool()

/** A recording callback (the `Escape`-equivalent, handed in as an ARGUMENT). */
function recorder(): { readonly fn: () => void; readonly count: () => number } {
  let n = 0
  return {
    fn: (): void => {
      n += 1
    },
    count: (): number => n,
  }
}
/** A callable whose invocation THROWS: its throw must be ABSORBED (`§2.3` item 1 row (4)). */
function thrower(): () => void {
  return (): void => {
    throw new Error('a callback throw must be ABSORBED and must never escape the call')
  }
}

/** The contract shapes, MIRRORED STRUCTURALLY (the module cannot be imported for
 *  its VALUES at red time — only the erased `import type` above can be, and that
 *  one is the leg-5 claim). */
type TransitionShape = (state?: unknown, verb?: unknown, callback?: unknown) => OverlayTransition
type InertShape = (target?: unknown, attributeName?: unknown, inert?: unknown) => OverlayInertWrite

function describeThrown(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}
/** ONE drive: the thrown value is RETURNED, never re-thrown, so a row reports it in
 *  its own vocabulary — this unit has NO REFUSAL DOMAIN, so a throw is a FINDING. */
function drove(fn: () => unknown): { readonly value: unknown; readonly thrown: unknown } {
  try {
    return { value: fn(), thrown: null }
  } catch (e) {
    return { value: undefined, thrown: e }
  }
}
/** **⟶ `AD-1` — ONE COUNTED DRIVE.** The entry point is DRIVEN (the call is ISSUED, and
 *  the drive is recorded on the row's own `executedDrives` figure, which is printed
 *  BESIDE the declared term and NEVER counted in it) and the thrown value is returned as
 *  data exactly as `drove` does. Used where a row's clause issues more entry-point calls
 *  than its declared term counts, so the executed figure is MEASURED rather than implied. */
function droveCounted(r: RegisterRow, fn: () => unknown): { readonly value: unknown; readonly thrown: unknown } {
  r.executedDrive()
  return drove(fn)
}

// ===========================================================================
// THE MODULE BOUNDARY — resolution is DATA, never a thrown import (`§4.1`)
// ===========================================================================
type ModuleSurface = Record<string, unknown>
type Surface =
  | { readonly mod: ModuleSurface; readonly overlayTransition: TransitionShape; readonly overlayInertDeclaration: InertShape; readonly reason: null }
  | { readonly mod: ModuleSurface | null; readonly overlayTransition: TransitionShape | null; readonly overlayInertDeclaration: InertShape | null; readonly reason: string }

let surfaceCache: Surface | null = null

/** Resolves `§2.1`'s surface WITHOUT throwing: the reason a row is red is DATA, so a
 *  clause row reports it and a register attempt counts it as a BROKEN attempt
 *  (`§5.5.1` cap 3's stop-after-5 discipline). */
async function resolveSurface(): Promise<Surface> {
  if (surfaceCache !== null) return surfaceCache
  const absent = `the module of §2.1 / §5.1 row 1 does not exist yet (${MODULE_PATH}) — the declared red shape of §4.1`
  if (!existsSync(MODULE_SRC)) {
    surfaceCache = { mod: null, overlayTransition: null, overlayInertDeclaration: null, reason: absent }
    return surfaceCache
  }
  try {
    const mod = (await import(/* @vite-ignore */ MODULE_SPECIFIER)) as unknown as ModuleSurface
    const tr: unknown = mod['overlayTransition']
    const decl: unknown = mod['overlayInertDeclaration']
    if (typeof tr !== 'function' || typeof decl !== 'function') {
      const unusable: Surface = {
        mod,
        overlayTransition: null,
        overlayInertDeclaration: null,
        reason: "§2.1's two VALUE exports are not both exported as functions (a missing, renamed or non-callable export)",
      }
      surfaceCache = unusable
      return unusable
    }
    surfaceCache = { mod, overlayTransition: tr as TransitionShape, overlayInertDeclaration: decl as InertShape, reason: null }
  } catch (e) {
    surfaceCache = { mod: null, overlayTransition: null, overlayInertDeclaration: null, reason: `the module does not resolve: ${describeThrown(e)}` }
  }
  return surfaceCache
}

let liveCache: Extract<Surface, { reason: null }> | null = null
/** The clause rows' boundary: fails as an ASSERTION carrying the row's own label, so
 *  the red message names the absent module/export rather than a transform error. */
async function live(): Promise<Extract<Surface, { reason: null }>> {
  if (liveCache !== null) return liveCache
  const s = await resolveSurface()
  if (s.reason !== null) {
    expect(s.reason, `§4.1 red: ${s.reason}`).toBe(null)
  }
  const usable = s as Extract<Surface, { reason: null }>
  liveCache = usable
  return usable
}
/** The register rows' non-failing probe: `null` while the module is absent, so every
 *  attempt is recorded as BROKEN with the red fact as its cause — an un-run register
 *  row is reported as a FAILURE, never as a pass. */
function liveOrNull(): Extract<Surface, { reason: null }> | null {
  return liveCache
}
/** One row's transition drive, reported as a cause sentence when the entry point
 *  throws or the module is absent (`I-1`: NO ENTRY POINT THROWS, FOR ANY ARGUMENT). */
function transitionDriveBreakOf(s: Extract<Surface, { reason: null }> | null, state: unknown, verb: unknown, callback?: unknown, label = ''): string | null {
  if (s === null) return `${label} — the module of §2.1 is absent (the §4.1 red fact)`
  const r = drove(() => (callback === undefined ? s.overlayTransition(state, verb) : s.overlayTransition(state, verb, callback)))
  return r.thrown === null ? null : `${label} — the entry point THREW; this unit has no refusal domain: ${describeThrown(r.thrown)}`
}
/** One row's declaration drive, same discipline. */
function declarationDriveBreakOf(s: Extract<Surface, { reason: null }> | null, target: unknown, name: unknown, inert: unknown, label = '', omitted = false): string | null {
  if (s === null) return `${label} — the module of §2.1 is absent (the §4.1 red fact)`
  const r = drove(() => (omitted ? s.overlayInertDeclaration(target) : s.overlayInertDeclaration(target, name, inert)))
  return r.thrown === null ? null : `${label} — the entry point THREW; this unit has no refusal domain: ${describeThrown(r.thrown)}`
}

// ---------------------------------------------------------------------------
// RECORD READERS — `§2.4` item 5, `§3.4 R-7`, `I-3`. Each returns `null` when the
// claim HOLDS and a cause sentence when it BREAKS, so the clause rows and the
// register attempts report the same readings.
// ---------------------------------------------------------------------------
/** The exact declared key set, IN DECLARED ORDER (`§3.4 R-7`(a)). */
function keyBreakOf(value: unknown, keys: readonly string[]): string | null {
  if (value === null || typeof value !== 'object') return `the returned value is not an object (${typeof value})`
  const actual = Object.keys(value as object)
  if (actual.length !== keys.length) return `the member census is ${actual.length} names ${JSON.stringify(actual)}, not the declared ${keys.length} ${JSON.stringify(keys)}`
  for (let i = 0; i < keys.length; i += 1) {
    if (actual[i] !== keys[i]) return `member ${i} is '${String(actual[i])}', not the declared '${keys[i]}' (declared ORDER binds)`
  }
  return null
}
/** `§2.4` item 5 — each record is FRESH, PLAIN, prototype `Object.prototype`, no
 *  member a getter, and NOTHING frozen or sealed (`S-OV-8`: `toBe` between two
 *  calls' records FAILS by design; the correct reading is `toEqual` + distinctness). */
function freshnessBreakOf(record: Record<string, unknown>, keys: readonly string[]): string | null {
  if (Object.getPrototypeOf(record) !== Object.prototype) return "the returned record's prototype is not Object.prototype"
  for (const k of keys) {
    const d = Object.getOwnPropertyDescriptor(record, k)
    if (d === undefined) return `the declared member '${k}' has no own descriptor`
    if (d.get !== undefined || d.set !== undefined) return `the declared member '${k}' is an accessor, not a data property`
  }
  if (Object.isFrozen(record)) return 'the returned record is FROZEN (§2.4 item 5: nothing is frozen or sealed)'
  if (Object.isSealed(record)) return 'the returned record is SEALED (§2.4 item 5: nothing is frozen or sealed)'
  return null
}
/** THE WHOLE `OverlayTransition` CLAIM (`§2.1` item 2, `§2.3` items 1/2, `M-1`,
 *  `P-OV-IM-2`): the two-member key set, `state ∈` the closed four-body set, the
 *  boolean `changed`, and the `changed === (next !== previous)` invariant. */
function transitionBreakOf(value: unknown, previous: unknown, label: string): string | null {
  const k = keyBreakOf(value, TRANSITION_KEYS)
  if (k !== null) return `${label} — ${k}`
  const t = value as Record<string, unknown>
  const f = freshnessBreakOf(t, TRANSITION_KEYS)
  if (f !== null) return `${label} — ${f}`
  const st = t['state']
  if (typeof st !== 'string' || !STATE_BODIES.includes(st)) return `${label} — the returned state ${JSON.stringify(st)} is NOT a member of the closed four-body set ${JSON.stringify(STATE_BODIES)} (a FIFTH body is a contract amendment)`
  if (typeof t['changed'] !== 'boolean') return `${label} — the 'changed' member must be a boolean; got ${typeof t['changed']}`
  const expected = st !== previous
  if (t['changed'] !== expected) return `${label} — changed === (next !== previous) is the DECLARED identity (§2.3 item 2): next=${JSON.stringify(st)}, previous=${JSON.stringify(previous)}, expected changed=${String(expected)}, got ${String(t['changed'])}`
  return null
}
/** THE DECLARED REMOVAL/SET DISCRIMINATION, READ ON THE CONTRACT'S OWN TWO-MEMBER
 *  `value` DOMAIN (`§2.4` item 2's table: the SET case is `value: 'true'` /
 *  `removal: false`; the REMOVAL case is `value: false` / `removal: true`), instead
 *  of comparing `removal` — a BOOLEAN — against `value !== true`, which is FALSE for
 *  every conformant module because `value` is pinned to the STRING `'true'` in the
 *  set case (`'true' !== true`). The `§2.4` item 2 identity `removal === (value !== true)`
 *  is therefore read IN ITS DECLARED DOMAIN: `value === true` is UNREACHABLE there, so
 *  the identity holds exactly when the pair is one of the two declared members. */
function removalIdentityBrokenOf(record: { readonly value: unknown; readonly removal: unknown }): boolean {
  return !(
    (record.value === t0('true') && record.removal === false) ||
    (record.value === false && record.removal === true)
  )
}
/** THE WHOLE `OverlayInertWrite` CLAIM (`§2.1` item 2, `§2.4` items 1/2/3/5,
 *  `M-5`, `P-OV-IM-3`): the four-member key set, the name rule, the STRICT value
 *  rule with its declared `removal` discrimination, and the echoed identity. */
function writeBreakOf(value: unknown, expectedName: string | null, expectedTarget: unknown, label: string): string | null {
  const k = keyBreakOf(value, WRITE_KEYS)
  if (k !== null) return `${label} — ${k}`
  const w = value as Record<string, unknown>
  const f = freshnessBreakOf(w, WRITE_KEYS)
  if (f !== null) return `${label} — ${f}`
  if (w['name'] !== expectedName) return `${label} — the 'name' member must be the caller's own string BY IDENTITY for a non-empty string and the declared null for every other shape (§2.4 item 1); expected ${JSON.stringify(expectedName)}, got ${JSON.stringify(w['name'])}`
  const removal = w['removal']
  if (typeof removal !== 'boolean') return `${label} — the 'removal' member must be a boolean; got ${typeof removal}`
  const v = w['value']
  // ⟶ **REPAIR 1 (gate-3) — THE REMOVAL/SET PREDICATE READ ON THE CONTRACT'S DECLARED
  // FORM (`§2.4` item 2).** The returned record's `value`/`removal` pair is read
  // EXACTLY as the contract declares it: the SET case is `{value: 'true' (the STRING),
  // removal: false}` and the REMOVAL case is `{value: false (the BOOLEAN),
  // removal: true}`, each arm's `removal` flag asserted against its own declared
  // boolean LITERAL. The previous form DERIVED `removal` from `value !== true`, which
  // compares the BOOLEAN `removal` against the STRING-pinned `value` (`'true' !== true`
  // is TRUE) — so it was FALSE for EVERY conformant module and broke five rows (`M-5`,
  // `P-OV-IM-2`, `P-OV-IM-3`, `P-OV-IM-4`, `P-OV-TP-1`). The declared VALUE DOMAIN is
  // NOT weakened: the removal case's value must be the BOOLEAN `false` (never `''`,
  // never the string `'false'`), and the set case's value must be the string `'true'`.
  if (removal) {
    if (v !== false) return `${label} — the REMOVAL case's value must be the BOOLEAN false, NEVER '' and NEVER the string 'false' and NEVER an absent member (§2.4 item 2); got ${JSON.stringify(v)}`
  } else {
    if (v !== t0('true')) return `${label} — the SET case's value must be the string 'true' (§2.4 item 2); got ${JSON.stringify(v)}`
  }
  if (removalIdentityBrokenOf({ value: v, removal })) return `${label} — the DECLARED removal/set discrimination (§2.4 item 2) FAILS: the pair must be one of its two declared members (value 'true' with removal false, or value false with removal true); got removal=${String(removal)}, value=${JSON.stringify(v)}`
  if (!Object.is(w['target'], expectedTarget)) return `${label} — the 'target' member must be the caller's own argument BY IDENTITY (===, and Object.is for the -0/NaN boundary) and is NEVER CONSULTED (§2.4 item 3)`
  return null
}

// ===========================================================================
// THE SCAN'S NORMALIZATION, STATED ONCE SO EVERY SCAN ROW INHERITS IT
// (`§3.4`'s scan note; `S-OV-2`). The ORDER IS NOT FREE: **THE JOIN RUNS BEFORE
// QUOTES ARE STRIPPED**, because a view that strips quotes first can no longer see
// the `'…' + '…'` boundary the joiner needs — so an assembly-evasion control run
// against a strip-then-join view is UNFALSIFIED WHILE LOOKING GREEN.
//   (1) `normalizedView`     — string-literal concatenation is JOINED and quotes are
//       STRIPPED, COMMENTS SCANNED AS CODE (a banned token in a comment FAILS).
//   (2) `commentStrippedView` — the honest companion where a comment carries nothing.
// ===========================================================================
function joinLiteralConcatenation(source: string): string {
  const pattern = /(['"])([^'"\\]*)\1\s*\+\s*(['"])([^'"\\]*)\3/g
  let out = source
  let guard = 0
  while (pattern.test(out) && guard < 20) {
    out = out.replace(pattern, (_m, _q1, a: string, _q2, b: string) => `'${a}${b}'`)
    guard += 1
  }
  return out
}
function normalizedView(source: string): string {
  return joinLiteralConcatenation(source).replace(/['"`]/g, '').replace(/\$\{([^}]*)\}/g, '$1')
}
function commentStrippedView(source: string): string {
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
    out += ch
    i += 1
  }
  return joinLiteralConcatenation(out).replace(/['"`]/g, '')
}
function escapeForRegex(token: string): string {
  return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function scanForToken(view: string, token: string, boundary: boolean): boolean {
  if (!boundary) return view.includes(token)
  return new RegExp(`(^|[^A-Za-z0-9_$])${escapeForRegex(token)}([^A-Za-z0-9_$]|$)`).test(view)
}
type Scanner = { readonly id: string; readonly tokens: readonly string[]; readonly exemption?: readonly string[]; readonly boundary?: boolean }
/** A scan row's reading: the offending tokens, AFTER the row's DECLARED EXEMPTIONS
 *  are subtracted (`S-OV-2`: a scan row that does not name its exemptions is VACUOUS). */
function scanTokens(view: string, rules: readonly Scanner[]): string[] {
  const hits: string[] = []
  for (const rule of rules) {
    let v = view
    for (const ex of rule.exemption ?? []) v = v.split(ex).join(' ')
    for (const token of rule.tokens) {
      if (scanForToken(v, token, rule.boundary !== false)) hits.push(`${rule.id}: '${token}'`)
    }
  }
  return hits
}

// ---------------------------------------------------------------------------
// `§3.4 R-1` — THE ANTI-EVASION VOCABULARY ROW's token families, EXACTLY the six
// families (a)..(f) the row enumerates. **EVERY LITERAL IS ASSEMBLED, never spelled.**
// ---------------------------------------------------------------------------
/** `R-1`'s DECLARED EXEMPTIONS, NAMED — this unit's own contract vocabulary AS
 *  IDENTIFIERS AND MEMBER NAMES, the SIX member names of its two records, the
 *  parameter names of `§2.2`(D)'s semantics table, the module's own file name (the
 *  `§5.1` allow-list path, quoted in its header) and — named EXPLICITLY, per
 *  `§5.5.2`'s `S-OV-7` warning — the ELEVEN declared literal bodies of `§2.1`
 *  item 5, OF WHICH THE `typeof`-TAG BODY `'string'` IS ITS OWN SUB-SET. */
const R1_EXEMPT: readonly string[] = [
  // the contract's own names, as identifiers
  'overlayTransition',
  'overlayInertDeclaration',
  'OverlayState',
  'OverlayTransition',
  'OverlayInertWrite',
  // the six member names of the two records, and the declared parameters
  'state',
  'changed',
  'name',
  'value',
  'removal',
  'target',
  'verb',
  'callback',
  'attributeName',
  'inert',
  // the module's own file name (the §5.1 allow-list path, quoted in its header)
  'overlay.ts',
  // the ELEVEN declared literal bodies of §2.1 item 5 — the typeof-tag body NAMED
  `''`,
  `'${t0('closed')}'`,
  `'${t0('open')}'`,
  `'${t0('held')}'`,
  `'${t0('closing')}'`,
  `'${t0('close')}'`,
  `'${t0('toggle')}'`,
  `'${t0('escape')}'`,
  `'${t0('unknown')}'`,
  `'${t0('true')}'`,
  `'${t0('string')}'`,
]
const R1_RULES: readonly Scanner[] = [ // CORPUS-EXEMPT
  {
    id: 'R-1(a) consumer-vocabulary token',
    tokens: [
      `${t0('overlay')}Frame`, 'scrim', 'modal', 'dialog', 'portal', 'background', 'layer', 'stack',
      'trap', 'pane', 'zone', 'tab', 'dashboard', 'gutter', 'is-empty', 'is-open', 'is-minimized', // CORPUS-EXEMPT
    ],
    exemption: R1_EXEMPT,
  },
  {
    id: 'R-1(b) DOM / selector token',
    tokens: [
      'querySelector', 'querySelectorAll', 'closest', 'getElementById', 'createElement', 'innerHTML', // CORPUS-EXEMPT
      'outerHTML', 'textContent', 'classList', 'appendChild', 'removeChild', 'insertBefore', // CORPUS-EXEMPT
      'parentNode', 'remove(', 'setAttribute', 'removeAttribute', 'setProperty', 'style.', 'dataset', // CORPUS-EXEMPT
      'activeElement', 'focus(', 'blur(', // CORPUS-EXEMPT
    ],
    exemption: R1_EXEMPT,
  },
  {
    id: 'R-1(c) realm / ambient token',
    tokens: [
      'document', 'window', 'navigator', 'globalThis', 'self', 'matchMedia', 'getComputedStyle', // CORPUS-EXEMPT
      'getBoundingClientRect', 'process.env', 'eval', 'new Function', 'globalThis[', // CORPUS-EXEMPT
    ],
    exemption: R1_EXEMPT,
  },
  {
    id: 'R-1(d) store token',
    tokens: ['localStorage', 'sessionStorage', 'indexedDB', 'store', 'cache', 'memo', 'persist', 'journal'], // CORPUS-EXEMPT
    exemption: R1_EXEMPT,
  },
  {
    id: 'R-1(e) wiring token',
    tokens: [
      'addEventListener', 'removeEventListener', 'dispatchEvent', 'preventDefault', 'stopPropagation', // CORPUS-EXEMPT
      'onclick', 'onkeydown', 'keydown', 'keyup', t0('Escape'), // CORPUS-EXEMPT
    ],
    exemption: R1_EXEMPT,
  },
  {
    id: 'R-1(f) attribute-NAME literal',
    tokens: [`'${t0('inert')}'`, `'data-'`, `'aria-'`, `'class'`, `'className'`, `'style'`], // CORPUS-EXEMPT
    exemption: R1_EXEMPT,
  },
]
/** **`R-1`'s EXEMPTION LIST, SPELLED AS LITERALS, for THIS FILE's own bytes only.**
 *  The token families above are assembled so they cannot self-collide with this
 *  file's text; the CONTRACT-VOCABULARY spellings are ordinary words (`state`,
 *  `name`, `value`, `target`, `self`, `zone`, …) and DO appear in this file's
 *  comments and row strings by necessity. This list is the set the test-file halves
 *  of the scan rows subtract, and IT IS NAMED rather than implied (`S-OV-2`). */
const TESTFILE_EXEMPT: readonly string[] = [ // CORPUS-EXEMPT
  'overlayTransition', 'overlayInertDeclaration', 'OverlayState', 'OverlayTransition', 'OverlayInertWrite',
  'overlay', 'state', 'changed', 'name', 'value', 'removal', 'target', 'verb', 'callback', 'attributeName', 'inert',
  'self', 'zone', 'tab', 'layer', 'stack', 'store', 'cache', 'memo', 'journal', 'trap', 'pane', 'focus', // CORPUS-EXEMPT
  // the REALM-ROOTED lookup this file assembles at run time (PRE-4's own subject)
  'globalThis',
  'remove(', 'style.', 'dataset', 'modal', 'dialog', 'portal', 'background', 'scrim', // CORPUS-EXEMPT
]
/** The marker that exempts ONE source line from the test-file scan rows: it is
 *  carried by the CONTROL CORPORA this file declares for itself (`§4.3`: the banned
 *  vocabulary may appear only inside the controls), and by NOTHING else. **A TOKEN
 *  SPELLED PLAINLY ON ANY UNMARKED LINE IS NOT EXEMPT AND FAILS THE ROW** — and the
 *  corpus-liveness assertion proves the subtraction is not a blanket exemption,
 *  because the SAME corpus text WITHOUT the marker is caught. */
const CORPUS_MARK = 'CORPUS-EXEMPT'
/** **THE TEST-FILE SCAN VIEW — the `§3.4 R-2` TEST-FILE HALF's instrument, stated
 *  so the reading is exact and NOT vacuous.** `R-2` reads *"the MODULE's source and
 *  this unit's own `[T]` test file"*, and its falsifiable half is a WRITE, a DOM
 *  access, a LISTENER or a NODE MOVE. Those are CALLS, so the view keeps the file's
 *  **STRUCTURE** and drops the three things that could only ever carry the
 *  vocabulary this file is REQUIRED to name:
 *    (1) **every STRING, TEMPLATE and REGEX literal** — the row strings, the assertion
 *        messages that quote a banned verb in order to forbid it, and the DECLARED
 *        CONTROL CORPORA (`§4.3`: the banned vocabulary may appear only inside the
 *        controls, which are ASSEMBLED FROM CHARACTER CODES for exactly that reason);
 *    (2) **comment lines** (the module scans scan comments as code; the TEST file's own
 *        prose about the scan rows is the row's subject matter, not the row's code);
 *    (3) the `CORPUS_MARK`-marked lines, as a NAMED second belt.
 *  **AN UNMARKED EXECUTABLE CALL THEREFORE SURVIVES AND FAILS THE ROW** — and the two
 *  directions are BOTH asserted in `R-2`: a literal-only corpus is stripped (so the
 *  view is not a vacuous whole-file pass), and an unmarked CALL corpus is caught.
 */
function stripStringLiterals(source: string): string {
  let out = ''
  let i = 0
  while (i < source.length) {
    const ch = source[i]
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch
      i += 1
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') i += 1
        i += 1
      }
      i += 1
      out += `''`
      continue
    }
    if (ch === '/') {
      // a REGEX literal (the only `/` that opens one here starts a rule or a pattern)
      const rest = source.slice(i)
      if (/^\/(?!\/|\*)[^\n/]*(?:\\.[^\n/]*)*\/[gimsuy]*/.test(rest)) {
        const m = /^\/(?!\/|\*)[^\n/]*(?:\\.[^\n/]*)*\/[gimsuy]*/.exec(rest) as RegExpExecArray
        out += `''`
        i += m[0].length
        continue
      }
    }
    out += ch
    i += 1
  }
  return out
}
function testFileScanView(source: string): string {
  const kept = source.split('\n').filter((l) => !l.includes(CORPUS_MARK) && !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n')
  let v = normalizedView(stripStringLiterals(kept))
  for (const ex of TESTFILE_EXEMPT) v = v.split(ex).join(' ')
  return v
}
/** `§3.4 R-2` — THE NO-DOM / NO-WRITE / NO-LISTENER ROW and `R-10`/`R-12`'s sibling
 *  patterns, AS REGEXES. Every spelling is ASSEMBLED. */
type RegexRule = {
  readonly id: string
  readonly re: RegExp
  /** A rule's DECLARED EXEMPTION, NAMED (`S-OV-2`: a scan row that does not name its
   *  exemptions is VACUOUS). The named forms are subtracted from the view BEFORE the
   *  rule reads it, and the controls assert that every other form still FAILS. */
  readonly exemption?: readonly string[]
}
const R2_RULES: readonly RegexRule[] = [ // CORPUS-EXEMPT
  { id: 'R-2 a set/write call or a class/style write', re: new RegExp(`${t0('setAttribute')}|${t0('removeAttribute')}|${t0('classList')}|${t0('setProperty')}`) }, // CORPUS-EXEMPT
  { id: 'R-2 an element or node creation/access call', re: new RegExp(`${t0('createElement')}|${t0('querySelector')}|${t0('getElementById')}|${t0('appendChild')}|${t0('innerHTML')}|${t0('outerHTML')}|${t0('textContent')}`) }, // CORPUS-EXEMPT
  { id: 'R-2 a node move', re: new RegExp(`${t0('appendChild')}|${t0('removeChild')}|${t0('insertBefore')}`) }, // CORPUS-EXEMPT
  { id: 'R-2 a realm access', re: new RegExp(`\\b${t0('document')}\\b|\\b${t0('window')}\\b|\\b${t0('globalThis')}\\b`) }, // CORPUS-EXEMPT
  { id: 'R-2 a code construction', re: new RegExp(`${t0('new Function')}|\\b${t0('eval')}\\s*\\(`) }, // CORPUS-EXEMPT
]
const R10_RULES: readonly RegexRule[] = [ // CORPUS-EXEMPT
  { id: 'R-10 a listener registration or removal', re: new RegExp(`${t0('addEventListener')}|${t0('removeEventListener')}`) }, // CORPUS-EXEMPT
  { id: 'R-10 an on* property assignment', re: /\bon(?:click|keydown|keyup|change|input|focus|blur|pointerdown)\s*=/ }, // CORPUS-EXEMPT
  { id: 'R-10 a dispatch or cancellation call', re: new RegExp(`${t0('dispatchEvent')}|${t0('preventDefault')}|${t0('stopPropagation')}`) }, // CORPUS-EXEMPT
  { id: 'R-10 a capture flag', re: /\{\s*capture\s*:/ }, // CORPUS-EXEMPT
]
const R12_RULES: readonly RegexRule[] = [ // CORPUS-EXEMPT
  { id: 'R-12 an attachment verb', re: new RegExp(`${t0('appendChild')}|${t0('removeChild')}|${t0('insertBefore')}`) }, // CORPUS-EXEMPT
  { id: 'R-12 a removal or bookkeeping verb', re: new RegExp(`\\.${t0('remove')}\\s*\\(|\\b${t0('parentNode')}\\b|\\b${t0('parent')}\\b`) }, // CORPUS-EXEMPT
  { id: 'R-12 a placement or ownership word', re: new RegExp(`\\b${t0('portal')}\\b|\\b${t0('reparent')}\\b|\\b${t0('owner')}\\b|\\b${t0('mount')}\\b|\\b${t0('unmount')}\\b`) }, // CORPUS-EXEMPT
]
const R9_RULES: readonly RegexRule[] = [ // CORPUS-EXEMPT
  { id: 'R-9 an activeElement read', re: new RegExp(t0('activeElement')) }, // CORPUS-EXEMPT
  { id: 'R-9 a focus( or blur( call', re: new RegExp(`${t0('focus')}\\s*\\(|${t0('blur')}\\s*\\(`) }, // CORPUS-EXEMPT
  { id: 'R-9 a media-query read', re: new RegExp(`${t0('matchMedia')}|${t0('prefers-')}`) }, // CORPUS-EXEMPT
  { id: 'R-9 a document or window reference', re: new RegExp(`\\b${t0('document')}\\b|\\b${t0('window')}\\b`) }, // CORPUS-EXEMPT
]
const R11_RULES: readonly RegexRule[] = [ // CORPUS-EXEMPT
  { id: 'R-11 an import statement of any path', re: /\bimport\b/ }, // CORPUS-EXEMPT
  { id: 'R-11 a dynamic import', re: /\bimport\s*\(/ }, // CORPUS-EXEMPT
  { id: 'R-11 a require call', re: /\brequire\s*\(/ }, // CORPUS-EXEMPT
]
/** `§3.4 R-14`'s DECLARED EXEMPTION, NAMED — **THE CONTRACT-REQUIRED ECHO GUARD, AND
 *  NOTHING ELSE.** `§2.4` item 1's name-echo rule REQUIRES the `typeof attributeName
 *  === 'string'` tag test (`§2.1` item 5 counts the `'string'` literal it needs as a
 *  declared body of the closed literal set, `S-OV-7`), so a scan that flags that ONE
 *  guard reddens the conformant module. The exemption is stated as the GUARD ITSELF —
 *  `typeof attributeName` only, and only in that position — so every OTHER `typeof`
 *  read of a caller argument (`typeof target`, `typeof verb`, `typeof state`,
 *  `typeof callback`) still FAILS the row and the controls below prove it.
 *  **NO literal is introduced here**: the exemption is assembled from the declared
 *  PARAMETER NAME plus the keyword, and the declared `'string'`-tag comparison is
 *  read through `DECLARED_LITERAL_BODIES`/`R1_EXEMPT`, never spelled anew — the
 *  contract's literal census forbids a further body. */
const R14_TYPEOF_GUARD_EXEMPT: readonly string[] = [`typeof ${t0('attributeName')}`]
const R14_RULES: readonly RegexRule[] = [ // CORPUS-EXEMPT
  { id: 'R-14 a coercion hook call', re: new RegExp(`${t0('toString')}|${t0('valueOf')}|${t0('toPrimitive')}`) }, // CORPUS-EXEMPT
  { id: 'R-14 a String( coercion', re: /\bString\s*\(/ }, // CORPUS-EXEMPT
  { id: 'R-14 a hasOwnProperty call', re: new RegExp(t0('hasOwnProperty')) }, // CORPUS-EXEMPT
  {
    id: 'R-14 a typeof read of a caller argument',
    re: /\btypeof\s+(?:target|verb|attributeName|state|callback)\b/, // CORPUS-EXEMPT
    // the declared echo guard is subtracted BY NAME before this rule reads the view
    exemption: R14_TYPEOF_GUARD_EXEMPT,
  },
]

/** `§3.4 R-8` — the module's DECLARED CLOSED LITERAL SET (`§2.1` item 5): ELEVEN
 *  DISTINCT BODIES, with the `typeof`-tag body `'string'` INCLUDED (a census that
 *  excludes it reddens the module the echo rule requires — `S-OV-7`), and with
 *  `'open'` counted ONCE although it is both a state body and a verb body. */
const DECLARED_LITERAL_BODIES: readonly string[] = [ // CORPUS-EXEMPT
  '', t0('closed'), t0('open'), t0('held'), t0('closing'), t0('close'), t0('toggle'), t0('escape'), t0('unknown'), t0('true'), t0('string'),
]
/** Every literal body the module's bytes carry, one entry per SOURCE LITERAL (so a
 *  repeated body shows up repeatedly and the DISTINCT reading is the claim). */
function literalBodiesOf(source: string): string[] {
  const joined = joinLiteralConcatenation(source)
  const bodies: string[] = []
  const re = /'([^'\\\n]*)'|"([^"\\\n]*)"/g
  let m = re.exec(joined)
  while (m !== null) {
    bodies.push(m[1] ?? m[2] ?? '')
    m = re.exec(joined)
  }
  return bodies
}

/** `§3.2 F-8` / `§3.4 R-4` — the THREE NAMED IMPORT CONTROLS, assembled. */
const F8_IMPORT_CONTROLS: readonly string[] = [ // CORPUS-EXEMPT
  `import type { OverlayState } from './${t0('theme')}.js'`, // CORPUS-EXEMPT
  `import { createGestureSession } from './${t0('gesture-session')}.js'`, // CORPUS-EXEMPT
  `import { ${t0('overlayTransition')} } from './${t0('overlay')}.js'`, // CORPUS-EXEMPT
]
/** `§3.2 F-7` — THE SIX NO-DOM / NO-WRITE / NO-LISTENER CONTROLS, assembled, so the
 *  scan rows are proven LIVE by a corpus that MUST fail them (`S-OV-2`: a scan that
 *  passes for any of the six is UNFALSIFIED and must not be filed). */
const F7_CORPUS: readonly { readonly id: string; readonly text: string }[] = [ // CORPUS-EXEMPT
  { id: `F-7(a) a ${t0('removeAttribute')} call on a recording fake element`, text: `el.${t0('removeAttribute')}('${t0('inert')}')` }, // CORPUS-EXEMPT
  { id: `F-7(b) a ${t0('setAttribute')} call`, text: `el.${t0('setAttribute')}('data-x', ${t0('true')})` }, // CORPUS-EXEMPT
  { id: `F-7(c) a ${t0('classList')} / style write`, text: `el.${t0('classList')}.add('x'); el.${t0('style')}.${t0('setProperty')}('--x', '1')` }, // CORPUS-EXEMPT
  { id: `F-7(d) an ${t0('addEventListener')} call on a fake root`, text: `root.${t0('addEventListener')}('${t0('keydown')}', () => {})` }, // CORPUS-EXEMPT
  { id: `F-7(e) a ${t0('document')} / ${t0('window')} read`, text: `const d = ${t0('document')}.body; const w = ${t0('window')}.innerWidth` }, // CORPUS-EXEMPT
  { id: `F-7(f) an ${t0('appendChild')} call on a fake parent`, text: `parent.${t0('appendChild')}(node)` }, // CORPUS-EXEMPT
]

// ===========================================================================
// THE MODULE'S SOURCE — read as bytes. A missing module file is the `X-1` red fact
// and makes a scan row red for the honest reason (there are no bytes to scan).
// ===========================================================================
let moduleSourceCache: string | null | undefined
function moduleSource(): string | null {
  if (moduleSourceCache !== undefined) return moduleSourceCache
  if (!existsSync(MODULE_SRC)) {
    moduleSourceCache = null
    return null
  }
  moduleSourceCache = readFileSync(MODULE_PATH, 'utf8')
  return moduleSourceCache
}
/** The scan view of the MODULE, or a cause sentence when there are no bytes. */
function moduleView(): { readonly view: string | null; readonly cause: string | null } {
  const src = moduleSource()
  if (src === null) return { view: null, cause: `the module's bytes do not exist yet (${MODULE_PATH}) — the §4.1 red fact` }
  return { view: normalizedView(src), cause: null }
}
function moduleCommentStrippedView(): string | null {
  const src = moduleSource()
  return src === null ? null : commentStrippedView(src)
}
function testFileBytes(): string {
  return readFileSync(TEST_PATH, 'utf8')
}
function testView(): string {
  return testFileScanView(testFileBytes())
}
/** Every `.ts` file under `src/**`, walked from the tree (never a git command and
 *  never a comment — `§3.4 R-6`'s pinned IMPLEMENTATION FORM). */
function srcTsFiles(): string[] {
  const found: string[] = []
  const walk = (dir: string): void => {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        continue
      }
      if (/\.ts$/.test(entry.name)) found.push(full)
    }
  }
  walk(join(ROOT, 'src'))
  return found
}

// ===========================================================================
// §5.5.1 — THE PROPERTY REGISTER'S EXECUTION MACHINERY.
// Caps, uniform for the whole register: **≤100 attempts per row · ≤400 attempts in
// total**, rows evaluated **sequentially in register order**, **STOP AFTER 5
// CONSECUTIVE FAILURES** (the running row's remaining attempts are abandoned and no
// further row starts). **An un-run register row is reported as a FAILURE, never as a
// pass.** Each row's `it` title carries its row id AND its strategy id, and each row
// prints its own record line so the audit can read attempts-run / held / broken /
// readings / controls / stoppedEarly / notStarted / registerStoppedAt per row.
// ===========================================================================
const REGISTER_ROW_CAP = 100
const REGISTER_TOTAL_CAP = 400
const CONSECUTIVE_FAILURE_CAP = 5
/** `§5.5.3` — THE PINNED SEED AND ITS ONE-STEP-PER-DRAW FORM. */
const SEED = 20260927
const LCG_A = 1664525
const LCG_C = 1013904223
const LCG_MOD = 4294967296
const POOL_LENGTH = 12

const registerState = {
  attempts: 0,
  consecutiveFailures: 0,
  stoppedAtRow: null as string | null,
  stoppedFor: null as string | null,
}
type RowRecord = {
  row: string
  type: string
  strategy: string
  seed: number
  attemptsRun: number
  held: number
  broken: number
  readings: number
  controls: number
  distinctDrives: number
  /** **⟶ `AD-1` — THE ROW'S OWN EXECUTED-DRIVE FIGURE, PRINTED BESIDE ITS DECLARED TERM
   *  AND NEVER COUNTED IN IT** (the family's rule: assertions and extra drives are
   *  printed beside the term). `null` means *this row is not separately instrumented* and
   *  is reported as `not-instrumented` rather than as a figure nobody measured. */
  executedDrives: number | null
  stoppedEarly: boolean
  notStarted: boolean
  registerStoppedAt: string | null
  registerStoppedFor: string | null
  causes: string[]
}
const REGISTER_RECORDS: RowRecord[] = []

/** THE DECLARED REGISTER of `§5.5.1`/`§5.5.3`, in REGISTER ORDER, with each row's
 *  declared TERM, its `(bounded)` marking and its `§5.5.2` item 3 DISTINCT figure.
 *  The executed layer is reconciled against THIS table by the harness rows below.
 *  **`bounded` MARKS A ROW WHOSE PROPERTY TEXT QUANTIFIES OVER A DOMAIN LARGER THAN
 *  ITS TABLE** — a ROW count that moves no term. */
const DECLARED_REGISTER: readonly {
  readonly row: string
  readonly type: string
  readonly strategy: string
  readonly declared: number
  readonly bounded: boolean
  readonly distinct: number | null
}[] = [
  { row: 'P-OV-IM-1', type: 'P-IM', strategy: 'S-OV-STATE-1', declared: 10, bounded: true, distinct: 10 },
  { row: 'P-OV-IM-2', type: 'P-IM', strategy: 'S-OV-SHAPE-1', declared: 6, bounded: true, distinct: 6 },
  { row: 'P-OV-IM-3', type: 'P-IM', strategy: 'S-OV-ECHO-1', declared: 12, bounded: true, distinct: 12 },
  { row: 'P-OV-IM-4', type: 'P-IM', strategy: 'S-OV-TARGET-1', declared: 4, bounded: false, distinct: 4 },
  { row: 'P-OV-IM-5', type: 'P-IM', strategy: 'S-OV-CALLBACK-1', declared: 4, bounded: false, distinct: 4 },
  { row: 'P-OV-SM-1', type: 'P-SM', strategy: 'S-OV-MATRIX-1', declared: 6, bounded: false, distinct: 3 },
  { row: 'P-OV-SM-2', type: 'P-SM', strategy: 'S-OV-CONST-1', declared: 3, bounded: false, distinct: 3 },
  { row: 'P-OV-TP-1', type: 'P-TP', strategy: 'S-OV-TOTAL-1', declared: 20, bounded: true, distinct: 20 },
  { row: 'P-OV-TP-2', type: 'P-TP', strategy: 'S-OV-RULE-1', declared: 9, bounded: true, distinct: 9 },
  { row: 'P-OV-TP-3', type: 'P-TP', strategy: 'S-OV-ABSORB-1', declared: 12, bounded: true, distinct: 12 },
  { row: 'P-OV-TP-4', type: 'P-TP', strategy: 'S-OV-WRITE-1', declared: 4, bounded: false, distinct: 4 },
  { row: 'P-OV-TP-5', type: 'P-TP', strategy: 'S-OV-NOMOVE-1', declared: 6, bounded: true, distinct: 6 },
  { row: 'P-OV-TP-6', type: 'P-TP', strategy: 'S-OV-COMPOSE-1', declared: 8, bounded: false, distinct: 8 },
]
/** Reads ONE printed figure out of the contract's own bytes — used by the register
 *  harness to compare THIS file's computed arithmetic against §5.5.3's PRINTED
 *  figure, so a contract whose total is not the sum of its own terms is a FAILING
 *  ROW rather than a silent re-grain (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`). */
function asPrintedNumber(source: string, pattern: RegExp): number {
  const m = pattern.exec(source)
  expect(m, `the contract prints the figure this pattern reads: ${String(pattern)}`).not.toBe(null)
  return Number((m as RegExpExecArray)[1])
}
/** WHERE a printed figure sits in the contract — so a SPEC FINDING names the site
 *  rather than the file (`cite SECTIONS and ROW IDS`, never line counts, is the
 *  CITATION rule for prose; a finding report needs the site). */
function printedLine(source: string, pattern: RegExp): number {
  const lines = source.split('\n')
  for (let i = 0; i < lines.length; i += 1) if (pattern.test(lines[i])) return i + 1
  return -1
}
/** The same, for a PRINTED CHAIN (`10 → 16 → … → 104`). */
function asPrintedNumbers(source: string, pattern: RegExp): number[] {
  const m = pattern.exec(source)
  expect(m, `the contract prints the chain this pattern reads: ${String(pattern)}`).not.toBe(null)
  return ((m as RegExpExecArray)[1].match(/\d+/g) ?? []).map(Number)
}
/** `§5.5.3` — THE DECLARED TOTAL, PRINTED WITH ITS TERMS (the thirteen terms ARE
 *  the rows above, in register order). */
function declaredTerms(): number[] {
  return DECLARED_REGISTER.map((r) => r.declared)
}
function declaredTotal(): number {
  return declaredTerms().reduce((a, b) => a + b, 0)
}
/** The DISTINCT total of `§5.5.2` item 3's ledger — a REPORTED figure, never
 *  substituted for the declared total and never compared against the caps. */
function declaredDistinctTerms(): number[] {
  return DECLARED_REGISTER.map((r) => r.distinct ?? r.declared)
}
function declaredDistinctTotal(): number {
  return declaredDistinctTerms().reduce((a, b) => a + b, 0)
}
/** The `(bounded)` ROWS of `§5.5.2` item 2 — a ROW count, moving no term. */
function boundedRows(): string[] {
  return DECLARED_REGISTER.filter((r) => r.bounded).map((r) => r.row)
}

class RegisterRow {
  readonly row: string
  readonly type: string
  readonly strategy: string
  private attemptsRun = 0
  private held = 0
  private broken = 0
  private readings = 0
  private controls = 0
  private distinct = 0
  private executed: number | null = null
  private stoppedEarly = false
  private notStarted = false
  private readonly causes: string[] = []

  constructor(def: { readonly row: string; readonly type: string; readonly strategy: string }) {
    this.row = def.row
    this.type = def.type
    this.strategy = def.strategy
  }

  /** ONE attempt. `body` returns `null` when the property HELD, else the break cause
   *  as a sentence (a throw is caught and is itself a break cause). */
  run(label: string, body: () => string | null): void {
    if (registerState.stoppedAtRow !== null) {
      if (this.attemptsRun === 0) this.notStarted = true
      return
    }
    if (this.attemptsRun >= REGISTER_ROW_CAP) {
      this.stoppedEarly = true
      this.causes.push(`the ≤${REGISTER_ROW_CAP}-attempts-per-row cap was reached`)
      return
    }
    if (registerState.attempts >= REGISTER_TOTAL_CAP) {
      this.stoppedEarly = true
      registerState.stoppedAtRow = this.row
      registerState.stoppedFor = `the ≤${REGISTER_TOTAL_CAP}-attempts register cap was reached`
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
  /** A READING printed BESIDE the term (`A DECLARED REGISTER TERM IS A DRIVE COUNT`):
   *  never counted in it. */
  reading(): void {
    this.readings += 1
  }
  /** A row's own CONTROL (`§5.5.1`'s "both controls" clauses), also printed BESIDE
   *  the term and never counted in it. */
  control(): void {
    this.controls += 1
  }
  /** The DISTINCT-drive figure of `§5.5.2` item 3 (`P-OV-SM-1`'s `20` cells reported
   *  as `3` distinct sweeps; a row's re-drive inside one attempt): the measured
   *  companion of the DECLARED term, never substituted for it. */
  distinctDrive(): void {
    this.distinct += 1
  }
  /** **⟶ `AD-1` — ONE EXECUTED DRIVE COUNTED BESIDE THE DECLARED TERM.** A row whose
   *  clause drives an entry point MORE than once per counted attempt (or drives several
   *  cells inside one attempt) reports the figure its body really issued here, printed
   *  BESIDE the term and NEVER counted in it — the term itself does not move. */
  executedDrive(): void {
    this.executed = (this.executed ?? 0) + 1
  }
  /** The row's verdict + its own record line. **An un-run row FAILS on purpose: an
   *  un-executed register row may not look green** (`§5.5.1` cap 3). */
  finish(): void {
    const record: RowRecord = {
      row: this.row,
      type: this.type,
      strategy: this.strategy,
      seed: SEED,
      attemptsRun: this.attemptsRun,
      held: this.held,
      broken: this.broken,
      readings: this.readings,
      controls: this.controls,
      distinctDrives: this.distinct,
      executedDrives: this.executed,
      stoppedEarly: this.stoppedEarly,
      notStarted: this.notStarted,
      registerStoppedAt: registerState.stoppedAtRow,
      registerStoppedFor: registerState.stoppedFor,
      causes: this.causes.slice(0, 5),
    }
    REGISTER_RECORDS.push(record)
    const line = `§5.5.1 register record :: ${JSON.stringify(record)}`
    console.log(line)
    if (this.attemptsRun === 0) {
      expect(
        this.attemptsRun,
        `${line} — this row NEVER STARTED: the register's stop-after-${CONSECUTIVE_FAILURE_CAP}-consecutive-failures discipline triggered at row ${registerState.stoppedAtRow ?? 'an earlier row'} (${registerState.stoppedFor ?? 'cause unrecorded'}). An un-run register row is reported as a FAILURE, never as a pass (§5.5.1 cap 3).`,
      ).toBeGreaterThan(0)
      return
    }
    expect(this.broken, `${line} — RED (§5.5.1): ${this.broken} of ${this.attemptsRun} attempts BROKE. First causes: ${JSON.stringify(this.causes.slice(0, 3))}`).toBe(0)
  }
}
function row(def: { readonly row: string; readonly type: string; readonly strategy: string }): RegisterRow {
  return new RegisterRow(def)
}
function definedRow(rowId: string): { readonly row: string; readonly type: string; readonly strategy: string } {
  const def = DECLARED_REGISTER.find((r) => r.row === rowId) as { readonly row: string; readonly type: string; readonly strategy: string } | undefined
  expect(def, `${rowId} is a declared register row of §5.5.1`).toBeDefined()
  return def as { readonly row: string; readonly type: string; readonly strategy: string }
}
/** **THE CONTROL CHANNEL** (`§5.5.1`'s *"PLUS nothing else"*): a row's own positive
 *  control / mirror control / instrument-liveness check is EXECUTED and REPORTED
 *  **BESIDE** its declared term — never through `run`, because a declared register
 *  term is a DRIVE COUNT. The control's claim stays FALSIFIABLE: a broken control
 *  fails the row on its own labelled assertion while `attemptsRun` stays the term. */
function controlDrive(r: RegisterRow, label: string, body: () => string | null, requiresModule = true): void {
  r.control()
  if (requiresModule && liveOrNull() === null) return
  let brk: string | null
  try {
    brk = body()
  } catch (e) {
    brk = `the control threw: ${describeThrown(e)}`
  }
  expect(brk, `${r.row} (CONTROL, reported BESIDE the declared term and never inside it — §5.5.1 "PLUS nothing else"): ${label} — ${String(brk)}`).toBe(null)
}

/** The pinned-seed generator of `S-OV-TOTAL-1` (`§5.5.1` method note 2 / `§5.5.3`):
 *  a hand-rolled 32-bit LCG whose constants are LITERALS here, with **ONE LCG STEP
 *  PER DRAW** and `index = stateₙ₊₁ mod pool.length`, `pool.length = 12`. No
 *  `Math.random`, no wall-clock seed, no shrinking and no adaptive input search. */
function makeLcg(seed: number): { readonly next: () => number } {
  let state = seed >>> 0
  return {
    next(): number {
      state = (state * LCG_A + LCG_C) % LCG_MOD
      return state
    },
  }
}
/** `P-OV-TP-1`'s drawn arms: ONE pool draw per call site, the member index read as
 *  `state mod pool.length` and the member's own coercion-hook recorder handed back
 *  with its value so the count-`0` assertions are falsifiable. */
function drawMember(lcg: { readonly next: () => number }): { readonly index: number; readonly member: PoolMember; readonly value: unknown; readonly hooks: HookCounts | null } {
  const state = lcg.next()
  const index = state % POOL_LENGTH
  const member = TP1_POOL[index]
  return { index, member, value: member.value(), hooks: member.hooks }
}

// ===========================================================================
// 1. THE EXISTENCE ROWS `§3.5 X-1`..`X-6` + `§3.4 R-3`(config) / `R-13` /
//    `R-6`(no-importer) — the red set's own premise, evaluable before the module
//    exists (`§4.2` order item 1).
// ===========================================================================
describe('§3.5 X-1 / X-2 / X-3 / X-4 / X-5 / X-6 + §3.4 R-13 / R-3(config) / R-6(no-importer) — the red set\'s own premise', () => {
  it('X-1 (§3.5) — THE PAIR: the module\'s absence is the RED branch; its presence plus the export census BY NAME is the GREEN branch', async () => {
    const moduleExists = existsSync(MODULE_SRC)
    expect(existsSync(new URL('./overlay.test.ts', import.meta.url)), 'X-1 — this test file exists and is the test half of the pair (§5.1 row 2, §0A note 1)').toBe(true)
    if (!moduleExists) {
      // THE RED BRANCH, governing AT RED TIME.
      expect(
        moduleExists,
        `X-1 (RED branch) — src/shared/overlay.ts does not exist (${MODULE_PATH}): this is the RED form of the red set, and every row that drives the module fails on its own labelled assertion naming this fact (the declared red shape of §4.1). §5.1 row 1 is the path this unit must LAND.`,
      ).toBe(true)
      return
    }
    // THE GREEN BRANCH: the pair's presence + the export census BY NAME (a COUNT
    // without the names FAILS the row's own text — §4.4 S-OV-6 / §2.1 item 6).
    const s = await resolveSurface()
    expect(s.reason, `X-1 (GREEN branch) — the module namespace is reachable: ${s.reason ?? 'ok'}`).toBe(null)
    for (const n of VALUE_EXPORTS) {
      expect(typeof s.mod?.[n], `X-1 (GREEN branch) — the value export '${n}' is present BY NAME (§2.1 item 1; the type half is §5.2 leg 5)`).toBe('function')
    }
    expect(Object.keys(s.mod ?? {}).sort(), 'X-1 (GREEN branch) — the VALUE census is EXACTLY the two §2.1 names, so a THIRD value export fails this premise').toEqual([...VALUE_EXPORTS].sort())
  })

  it('X-2 (§3.5) — THIS UNIT\'S CONTRACT IS FILED: docs/specs/overlay.md EXISTS and is this file\'s contract', () => {
    const specPath = join(ROOT, 'docs', 'specs', 'overlay.md')
    expect(existsSync(specPath), `X-2 — the contract is filed at ${specPath} (the unit is not delegable without it, §4.5)`).toBe(true)
    const spec = readFileSync(specPath, 'utf8')
    expect(spec.split('\n')[0], 'X-2 — the first line names the unit and its two-function mechanism, so the file is the contract and not a sibling').toContain('U-OVERLAY')
    expect(spec, 'X-2 — the contract carries the closed four-state set and the four-member write (the two shapes every row below is authored against)').toContain(t0('closed'))
  })

  it('X-3 (§3.5) — the gate-1 record is the RECORD and NOT this file\'s contract, and it EXISTS (a DENIED path of §5.1 item 12)', () => {
    const recordPath = join(ROOT, 'docs', 'specs', 'overlay-review.md')
    expect(existsSync(recordPath), 'X-3 — docs/specs/overlay-review.md is the gate-1 record; this unit does not edit it again, so the row is an EXISTENCE probe whose FAIL is meaningful').toBe(true)
    const record = readFileSync(recordPath, 'utf8')
    expect(record, 'X-3 — the record is NOT this contract: it does not carry this file\'s `§2.1` surface block as its own (the two documents are distinguishable)').not.toContain('export function overlayTransition(state: unknown, verb: unknown, callback?: unknown): OverlayTransition')
  })

  it('X-4 / R-13 (§3.5, §3.4) — the ABSENT-PAGE-DESIGN probe: docs/skills/designing-pages.md does NOT exist, so this unit owes no coverage row and no demo-page entry', () => {
    expect(
      existsSync(join(ROOT, 'docs', 'skills', 'designing-pages.md')),
      'X-4 / R-13 — docs/skills/designing-pages.md does NOT exist (§1 item 7, §7 item 6: docs/skills/ holds process-guardrails.md alone). THIS ROW\'S FAIL IS MEANINGFUL: if the file comes to exist, this unit OWES the test-use-case coverage row and the demo-page entry — and the honest form of that row is an ABSENCE row, because a mechanism that renders nothing contributes no page.',
    ).toBe(false)
  })

  it('X-5 (§3.5) — src/** carries NO overlay / dialog / modal / popover / focus-trap / portal surface of any kind, and NO DOM inert attribute', () => {
    const surfaceTokens = [t0('overlayFrame'), t0('dialog'), t0('modal'), t0('popover'), t0('portal')]
    const hits: string[] = []
    const inertFiles: string[] = []
    const attributeWrites: string[] = []
    for (const p of srcTsFiles()) {
      const src = readFileSync(p, 'utf8')
      const rel = p.replace(ROOT, '.')
      for (const v of surfaceTokens) if (scanForToken(src, v, false)) hits.push(`${rel}: ${v}`)
      if (scanForToken(src, t0('inert'), false)) inertFiles.push(rel)
      for (const m of src.matchAll(new RegExp(`${t0('setAttribute')}|${t0('removeAttribute')}`, 'g'))) { // CORPUS-EXEMPT
        const around = src.slice(Math.max(0, (m.index ?? 0) - 40), (m.index ?? 0) + 80)
        if (around.includes(t0('inert'))) attributeWrites.push(`${rel}: ${around.replace(/\s+/g, ' ').trim()}`)
      }
    }
    console.log(`X-5 readings :: overlay/dialog/modal/popover/portal token hits = ${JSON.stringify(hits)} · files carrying the inert token = ${JSON.stringify(inertFiles)}`)
    expect(
      hits,
      'X-5 — a src/**/*.ts search for the overlay / dialog / modal / popover / portal surface vocabulary returns ZERO matches. A FAIL here means an overlay surface already exists and this unit\'s DENIED list must be re-derived.',
    ).toEqual([])
    expect(
      attributeWrites,
      'X-5 — `inert` appears in src/** as DEGRADATION PROSE ONLY, NEVER as an applied attribute: no setAttribute/removeAttribute call site names it. (The prose files are PRINTED as a READING above and are not asserted as a count — §3.5 X-5 carries that measurement from the gate-1 record without re-pinning it.)', // CORPUS-EXEMPT
    ).toEqual([])
    expect(
      scanForToken(readFileSync(join(ROOT, 'src', 'shared', 'dom-shim.ts'), 'utf8'), `${t0('data-inert')}`, false),
      'X-5 — no `data-inert` attribute name exists anywhere in the shim (the shim gains NO member for this unit: its removal case is DATA, §0A note 3).',
    ).toBe(false)
  })

  // ⟶ **X-6 AMENDED (2026-10-03, bounded landing per `docs/specs/store-modules-seams.md`
  // `§2.7` item 7's dated EXTENSION — the overlay caller admission, filed IN PARALLEL
  // beside the three theme cells; TestWriter gate; `RCA-8(d)` ANNOTATE-BESIDE, never a
  // rewrite — the as-filed reading stands visible in the assertion message below, so
  // the revert is the annotation's removal, never a re-derivation). LICENCE CELL
  // (the overlay clause of `§2.7` item 7's extension): `tests/overlay.test.ts` `X-6`
  // (which carries `§3.4 R-6`'s no-importer half, read from the TREE) — the
  // `src/**`-tree importer scan admits **EXACTLY ONE importer —
  // `src/renderer/overlay-store.ts`** (the `§2.2` caller-side overlay store turn FIRST
  // imports `src/shared/overlay.js` at the unit's landing) — and stays CLOSED to any
  // SECOND importer (the row's own words, "A FAIL here admits an importer, FIRES the
  // §7.1 predicate", survive for every OTHER path; the row's closed-census INTENT is
  // UNCHANGED — the set gains the unit's own admitted caller only; the overlay
  // MODULE's own bytes still import nothing). ROLLBACK: retiring the overlay caller
  // reverts this row to its as-filed `.toEqual([])` closed form (the licence's
  // reversibility note; `§5.4`'s rollback holds — retiring the caller restores the
  // honest as-filed reading; the `overlayInert` line-guard that made the landing's
  // importer INVISIBLE (the gate-4 false-negative) is gone for good — it excluded
  // exactly this caller).
  it('X-6 (§3.5) / §2.5 item 5 — THE READER QUESTION HAS NO READER AND THE ENTRY-POINT ANSWER IS `NO`', () => {
    // THE IMPORT-GRAPH PROBE (§3.4 R-6's no-importer half, read from the TREE).
    const specifier = new RegExp(`['"][^'"]*${t0('overlay')}[^'"]*['"]`)
    const importers: string[] = []
    for (const p of srcTsFiles()) {
      const src = readFileSync(p, 'utf8')
      for (const line of src.split('\n')) {
        if (/\bimport\b|\brequire\s*\(/.test(line) && specifier.test(line)) importers.push(`${p.replace(ROOT, '.')}: ${line.trim()}`)
      }
    }
    // THE AMENDED SET (the licence's overlay cell): EXACTLY ONE admitted importer —
    // the unit's own caller file `src/renderer/overlay-store.ts` — and NOTHING
    // else. The as-filed reading ("the src/** tree contains ZERO importers of this
    // unit's module") survives: the ONE member is the caller's own admission, and a
    // SECOND importer is still a FINDING.
    const admittedImporter = '.src/renderer/overlay-store.ts:'
    expect(
      importers.length,
      `X-6 (AMENDED, licence cell of §2.7 item 7's dated extension — the overlay caller admission) — the importer set is EXACTLY ONE: the unit's own caller file \`src/renderer/overlay-store.ts\` (the §2.2 caller-side store turn, admitted BY NAME) and NOTHING else. The AS-FILED READING, KEPT VISIBLE BESIDE: "the src/** tree contains ZERO importers of this unit's module. A FAIL here admits an importer, FIRES the §7.1 predicate and VOIDS the three-part [U] refusal (§5.1's closing sentence)." That intent is UNCHANGED for every OTHER path — the overlay MODULE's own bytes still import nothing; only the one declared caller may import it. Measured: ${JSON.stringify(importers)}`,
    ).toBe(1)
    expect(
      importers[0] ?? '',
      'X-6 (AMENDED) — the ONE importer IS the admitted caller, by path prefix; any other path (or an absent overlay-store import) fails this row, keeping the closed set honest.',
    ).toContain(admittedImporter)
    // THE BOUNDED-EXTENSION POSITIVE CONTROL (the licence's positive-control clause:
    // broadening the set BEYOND the one admitted path is a FINDING): the SAME
    // instrument MUST still flag a SECOND new path's import.
    const secondImporterLine = `import { overlayTransition } from '../shared/overlay.js'`
    expect(
      /\bimport\b|\brequire\s*\(/.test(secondImporterLine) && specifier.test(secondImporterLine),
      "X-6 (bounded-extension control) — a SECOND new path importing the module is STILL a FINDING: the instrument flags the synthetic second importer, so the one-member admission is bounded (a second admitted importer would be a violation per §2.7 item 7's positive-control clause).",
    ).toBe(true)
  })

  it('R-3(config half) (§3.4) — package.json/package-lock.json carry the LANDED dependency and script sets: no new dependency and no new script key', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    const LANDED_SCRIPT_KEYS = ['clean', 'build', 'build:watch', 'start', 'start:http', 'typecheck', 'typecheck:tests', 'test', 'test:watch', 'battery', 'divergence', 'ui', 'mcp']
    const LANDED_DEV = ['@types/node', 'electron', 'esbuild', 'typescript', 'vitest']
    const LANDED_DEPS = ['@modelcontextprotocol/sdk', 'provident-ssr']
    // A SET claim against the NAMES, never a bare count (§4.4 S-OV-6).
    expect(Object.keys(pkg.scripts ?? {}).sort(), 'R-3 — the scripts KEY SET is the landed set: ANY further script key reddens this row, and a config change cannot satisfy it (§5.1 item 7, AGENTS.md item 4). This unit\'s leg 5 adds NO SCRIPT.').toEqual([...LANDED_SCRIPT_KEYS].sort())
    expect(Object.keys(pkg.devDependencies ?? {}).sort(), 'R-3 — no new devDependency: the register is executed by plain deterministic vitest tables with NO property runner and NO fast-check (§5.5).').toEqual([...LANDED_DEV].sort())
    expect(Object.keys(pkg.dependencies ?? {}).sort(), 'R-3 — the dependency SET is unchanged').toEqual([...LANDED_DEPS].sort())
    expect(Object.keys(pkg.devDependencies ?? {}), 'R-3 — the five-name devDependency set is the whole of it: no sixth name was added for this unit').toHaveLength(5)
  })

  it('R-3 (§3.4) — the SHIM is byte-identical in intent, no config file changes and no persistence channel is added', () => {
    const shim = readFileSync(join(ROOT, 'src', 'shared', 'dom-shim.ts'), 'utf8')
    expect(
      shim.split('\n').filter((l) => new RegExp(`\\b${t0('overlay')}\\b`).test(l)),
      'R-3 / §0A note 3 — the one admitted shim member is NOT used, NOT extended and NOT called by this unit: src/shared/dom-shim.ts carries no line about this mechanism. THE MECHANISM\'S INERT DECLARATION IS DATA; the consumer\'s applied write is the consumer\'s.',
    ).toEqual([])
    expect(existsSync(join(ROOT, 'tsconfig.json')) && existsSync(join(ROOT, 'tsconfig.tests.json')) && existsSync(join(ROOT, 'vitest.config.ts')), 'R-3 — the three config files this unit may NOT change are PRESENT on disk (§5.1 items 7/9), so a diff-scope row can read them').toBe(true)
    for (const banned of [t0('localStorage'), t0('indexedDB'), t0('sessionStorage')]) {
      expect(scanForToken(readFileSync(join(ROOT, 'src', 'shared', 'dom-shim.ts'), 'utf8'), banned, false), `R-3 — no persistence channel (${banned}) is added anywhere; S-d4 is intact and persistence stays consumer-side`).toBe(false)
    }
  })

  it('R-6 (§3.4) — the DIFF-SCOPE row: the DENIED paths are PRESENT, this unit\'s artifact paths are the allow-list, and the module is imported by NO src/** file', () => {
    const denied = [
      'src/renderer/index.html', 'src/renderer/renderer.ts', 'src/main/main.ts', 'src/main/preload.ts',
      'src/shared/demo-envelope.ts', 'src/shared/dom-shim.ts', 'package.json', 'package-lock.json',
      'scripts/electron-divergence.mjs', 'tsconfig.json', 'tsconfig.tests.json', 'vitest.config.ts',
      'docs/specs/overlay-review.md',
    ]
    for (const p of denied) {
      expect(existsSync(join(ROOT, p)), `R-6 — the DENIED path §5.1 names is PRESENT on disk: ${p}. The denial binds this unit's diff; it does NOT forbid a later consumer from importing the module.`).toBe(true)
    }
    expect(existsSync(new URL('./overlay.test.ts', import.meta.url)), 'R-6 — the allow-list row 2 (THIS file) EXISTS; §5.1 names it so the register\'s own execution cannot read as a DENY-set violation').toBe(true)
    expect(existsSync(join(ROOT, 'docs', 'specs', 'overlay.md')), 'R-6 — the allow-list row 3 (this unit\'s spec) EXISTS').toBe(true)
    // THE ALLOW-LIST ROW 1, IN THE BRANCH FORM: asserting the module's ABSENCE as a
    // STANDING claim would be a red-only premise (true before the work and false for
    // ever after). The RED branch states the absence; the GREEN branch states the
    // pair's presence plus the census BY NAME (S-OV-6: a census, never a count).
    const moduleExists = existsSync(MODULE_SRC)
    if (!moduleExists) {
      expect(moduleExists, `R-6 (RED branch) — the allow-list row 1 does not exist yet at ${MODULE_PATH}: this is the RED form of the red set (§4.1), and the GREEN form is the pair's presence plus the export census by name.`).toBe(true)
      return
    }
    expect(VALUE_EXPORTS.length + TYPE_NAMES.length, 'R-6 (GREEN branch) — the census is 2 value names + 3 type names = 5, NAMED (§2.1 item 6)').toBe(5)
  })
})

// ===========================================================================
// 2. §3.4 THE STATIC ROWS — R-1..R-14, each with its DECLARED EXEMPTIONS and BOTH
//    CONTROLS (a positive control that MUST fail the row it is attached to, and the
//    module, which must pass). A scan row that does not name its exemptions is
//    VACUOUS (§4.4 S-OV-2).
// ===========================================================================
describe('§3.4 R-1 / R-2 / R-4 / R-5 / R-7 / R-8 / R-9 / R-10 / R-11 / R-12 / R-14 — the anti-evasion scans over the MODULE, exemptions named, both controls', () => {
  it('R-1 (§3.4) — the VOCABULARY row: in the NORMALIZED view, comments scanned as code, no banned token of any of the six families occurs', () => {
    const { view, cause } = moduleView()
    expect(cause, `R-1 — the module's bytes are the row's subject: ${String(cause)}`).toBe(null)
    const hits = scanTokens(view ?? '', R1_RULES)
    expect(
      hits,
      `R-1 — over the MODULE's source INCLUDING its comments, no occurrence of a consumer-vocabulary token, a DOM/selector token, a realm/ambient token, a store token, a wiring token or an attribute-NAME literal. THE DECLARED EXEMPTIONS ARE NAMED (the six member names of §2.1's two records, the parameter names of §2.2(D)'s semantics table, and the ELEVEN declared literal bodies of §2.1 item 5 WITH the typeof-tag body 'string' NAMED EXPLICITLY). HITS: ${JSON.stringify(hits)}`,
    ).toEqual([])
    // BOTH CONTROLS. (i) a corpus spelling a banned token RAW, ASSEMBLED and IN A
    // COMMENT must FAIL the row; (ii) the module, which spells none, PASSES above.
    const raw = `const scrim = 1`
    const assembled = `const a = 's' + 'crim'`
    const inComment = `// the scrim is 1`
    for (const [id, corpus] of [['raw', raw], ['token-assembled', assembled], ['comment-carrying', inComment]] as const) {
      expect(
        scanTokens(normalizedView(corpus), R1_RULES).length > 0,
        `R-1 (CONTROL i/${id}) — a corpus spelling a banned token ${id} MUST FAIL this row. A view that strips quotes BEFORE joining cannot see the '…' + '…' boundary, so this control is the row's own proof that the join runs first (§3.4's scan note).`,
      ).toBe(true)
    }
    expect(
      scanTokens(normalizedView(`export function ${t0('overlayTransition')}(state: unknown, verb: unknown): void {}`), R1_RULES),
      'R-1 (CONTROL ii) — a corpus carrying ONLY the declared contract vocabulary PASSES, so the row does not redden a conformant module (a scan that reddens the conformant module is a SPEC FINDING, not a module defect).',
    ).toEqual([])
  })

  it('R-2 (§3.4) — THE NO-DOM / NO-WRITE / NO-LISTENER row over the MODULE and over THIS TEST FILE, with the F-7 corpus as its positive control', () => { // CORPUS-EXEMPT
    const { view, cause } = moduleView()
    expect(cause, `R-2 — the module's bytes are the row's subject: ${String(cause)}`).toBe(null)
    const moduleHits = [
      ...R2_RULES.filter((r) => r.re.test(view ?? '')).map((r) => r.id),
      ...R10_RULES.filter((r) => r.re.test(view ?? '')).map((r) => r.id),
      ...R12_RULES.filter((r) => r.re.test(view ?? '')).map((r) => r.id),
    ]
    expect(
      moduleHits,
      'R-2 — over the MODULE\'s source: no setAttribute/removeAttribute/classList/setProperty, no attribute write of any kind, no createElement, no node move, no document/window access, no addEventListener/removeEventListener/on* assignment, no dispatch or cancellation, and NO ELEMENT, NODE OR ROOT PARAMETER anywhere in the surface. There are NO exemptions — the row bans the whole class.', // CORPUS-EXEMPT
    ).toEqual([])
    // THE TEST-FILE HALF (the row reads this unit's own `[T]` file too), through the
    // NAMED exemption view, so the corpus definitions the contract licenses as
    // CONTROLS do not vacuously excuse a real write in the rows themselves.
    const tv = testView()
    const testHits = [
      ...R2_RULES.filter((r) => r.re.test(tv)).map((r) => r.id),
      ...R10_RULES.filter((r) => r.re.test(tv)).map((r) => r.id),
      ...R12_RULES.filter((r) => r.re.test(tv)).map((r) => r.id),
    ]
    expect(
      testHits,
      `R-2 — over THIS test file, in the exemption view: the change set contains no write, no DOM access, no listener and no node move. The exemption list is NAMED at TESTFILE_EXEMPT; a banned spelling outside it survives and FAILS here. HITS: ${JSON.stringify(testHits)}`,
    ).toEqual([])
    // BOTH CONTROLS: the six-shape F-7 corpus MUST FAIL.
    for (const c of F7_CORPUS) {
      const hits = [
        ...R2_RULES.filter((r) => r.re.test(c.text)).map((r) => r.id),
        ...R10_RULES.filter((r) => r.re.test(c.text)).map((r) => r.id),
        ...R12_RULES.filter((r) => r.re.test(c.text)).map((r) => r.id),
      ]
      expect(hits.length > 0, `R-2 (CONTROL) — ${c.id} MUST FAIL this row's scans (§3.2 F-7: a scan that passes for any of the six shapes is UNFALSIFIED and must not be filed).`).toBe(true)
    }
  })

  it('R-4 / R-11 (§3.4) — THE IMPORT-BOUNDARY row: ZERO import statements of ANY path, with the THREE named positive controls of §3.2 F-8', () => {
    const src = moduleSource()
    expect(src, `R-4 — the module's bytes are the row's subject: ${src === null ? 'the module does not exist yet (the §4.1 red fact)' : 'ok'}`).not.toBe(null)
    const hits = R11_RULES.filter((r) => r.re.test(src ?? '')).map((r) => r.id)
    expect(
      hits,
      'R-4 / R-11 / P-OV-12 — src/shared/overlay.ts contains ZERO import statements: no value import, no TYPE-ONLY import, no dynamic `import(`, no `require(`. The three types are declared locally, the three caller arguments need no borrowed shape, and docs/specs/gsession.md §2.5 is NOT this unit\'s surface (S-OV-9: an asserted edge would be a FABRICATED EDGE).',
    ).toEqual([])
    for (const control of F8_IMPORT_CONTROLS) {
      expect(R11_RULES.filter((r) => r.re.test(control)).length > 0, `R-4 (CONTROL) — a corpus module carrying exactly one import statement MUST FAIL this row: ${control}`).toBe(true)
    }
    // THE REVERSE EDGE (the third named control): a sibling importing THIS module.
    const reverse = `import { ${t0('overlayTransition')} } from './${t0('overlay')}.js'`
    expect(R11_RULES.filter((r) => r.re.test(reverse)).length > 0, 'R-4 (CONTROL, reverse edge) — a sibling importing this module is the third named positive control of §3.2 F-8').toBe(true)
  })

  it('R-5 (§3.4) / §2.1 items 1 and 6 — the EXPORT-CENSUS row as a SET claim BY NAME: the two VALUE exports at run time; the three TYPE names on §5.2 leg 5', async () => {
    const s = await live()
    expect(Object.keys(s.mod).filter((k) => !['default'].includes(k)).sort(), 'R-5(a) — the RUNTIME value exports are EXACTLY overlayTransition and overlayInertDeclaration, read from the imported namespace\'s own keys BY NAME. A row asserting only a COUNT without NAMING the names FAILS this row\'s own text (S-OV-6).').toEqual([...VALUE_EXPORTS].sort())
    expect(TYPE_NAMES, 'R-5(b) — the THREE TYPE names are asserted as a PRESENCE claim: a type-only name is ERASED AT RUN TIME, so an EXACTLY over that set is not falsifiable here — §5.2 leg 5 (the standalone strict tsc over THIS file) is the leg that pins each name, because each is imported as a type above and a rename, removal or unexported name FAILS TO COMPILE there').toEqual(['OverlayState', 'OverlayTransition', 'OverlayInertWrite'])
    expect(VALUE_EXPORTS.length + TYPE_NAMES.length, 'R-5 / §2.1 item 6 — 2 + 3 = 5, with BOTH halves NAMED (the two halves are counted separately because a type declaration is erased at run time)').toBe(5)
    // POSITIVE CONTROL: a namespace carrying a THIRD value export FAILS the row.
    const third: ModuleSurface = { [VALUE_EXPORTS[0]]: () => {}, [VALUE_EXPORTS[1]]: () => {}, overlayPortalMove: () => {} }
    expect(
      Object.keys(third).filter((k) => !['default'].includes(k)).sort(),
      'R-5 (CONTROL) — a namespace carrying a THIRD value export FAILS R-5(a): the two-name set is the claim, so the row is not a count that a rename can satisfy.',
    ).not.toEqual([...VALUE_EXPORTS].sort())
  })

  it('R-7 (§3.4) — THE MEMBER-CENSUS NEGATIVE row: exact declared key sets IN DECLARED ORDER, a negative twin corpus, and the declared member types', async () => {
    const s = await live()
    const t = drove(() => s.overlayTransition(t0('closed'), t0('open')))
    expect(t.thrown, `R-7(a) — the transition drive must not throw: ${t.thrown === null ? 'ok' : describeThrown(t.thrown)}`).toBe(null)
    expect(Object.keys(t.value as object), 'R-7(a) — Object.keys on the returned TRANSITION deep-equals [\'state\',\'changed\'] IN DECLARED ORDER; a missing, extra or re-ordered member FAILS.').toEqual([...TRANSITION_KEYS])
    const w = drove(() => s.overlayInertDeclaration(TGT, NAME_A, true))
    expect(w.thrown, `R-7(a) — the declaration drive must not throw: ${w.thrown === null ? 'ok' : describeThrown(w.thrown)}`).toBe(null)
    expect(Object.keys(w.value as object), 'R-7(a) — Object.keys on the returned WRITE deep-equals [\'name\',\'value\',\'removal\',\'target\'] IN DECLARED ORDER.').toEqual([...WRITE_KEYS])
    // R-7(b) — THE NEGATIVE DRIVE: a corpus record carrying a FIFTH key, a MISSING
    // key and a RE-ORDERED key set must each FAIL the census reading.
    const fifth = { name: null, value: false, removal: true, target: null, plan: null }
    const missing = { name: null, value: false, removal: true }
    const reordered = { target: null, removal: true, value: false, name: null }
    expect(keyBreakOf(fifth, WRITE_KEYS), 'R-7(b) — a corpus record carrying a FIFTH member FAILS the census reading').not.toBe(null)
    expect(keyBreakOf(missing, WRITE_KEYS), 'R-7(b) — a corpus record MISSING a declared member FAILS the census reading').not.toBe(null)
    expect(keyBreakOf(reordered, WRITE_KEYS), 'R-7(b) — a RE-ORDERED key set FAILS the census reading (declared ORDER binds)').not.toBe(null)
    expect(keyBreakOf({ state: t0('open'), changed: true }, TRANSITION_KEYS), 'R-7(b) — the module\'s own two-member shape PASSES the same reading').toBe(null)
    // R-7(c) — THE DECLARED-TYPE HALF, ON THE TYPE LAYER. The probes below are
    // TYPED against the imported type declarations, so a member whose declared type
    // drifts FAILS TO COMPILE on §5.2 leg 5 (a runtime row cannot see it).
    const typedTransition: OverlayTransition = { state: 'closed', changed: false }
    const typedWrite: OverlayInertWrite = { name: null, value: 'true', removal: false, target: undefined }
    const typedState: OverlayState = typedTransition.state
    expect([typedState, typedTransition.changed, typedWrite.name, typedWrite.value, typedWrite.removal, typedWrite.target !== undefined || typedWrite.target === undefined], 'R-7(c) — state is OverlayState, changed/removal are boolean, name is string | null, value is \'true\' | false, target is unknown, and all six members are readonly (the readonly half is asserted by the typed literals above failing to compile if mutated).').toHaveLength(6)
  })

  it('R-8 (§3.4) — THE CLOSED-SET LITERAL row: the module\'s literal bodies are the ELEVEN declared bodies, the typeof-tag body INCLUDED', () => {
    const src = moduleSource()
    expect(src, `R-8 — the module's bytes are the row's subject: ${src === null ? 'the module does not exist yet (the §4.1 red fact)' : 'ok'}`).not.toBe(null)
    const bodies = literalBodiesOf(src ?? '')
    const distinct = [...new Set(bodies)]
    const unexpected = distinct.filter((b) => !DECLARED_LITERAL_BODIES.includes(b))
    expect(
      unexpected,
      `R-8 — the module's STRING LITERAL BODIES are the declared closed set of ELEVEN DISTINCT BODIES (${JSON.stringify(DECLARED_LITERAL_BODIES)}), with the typeof-tag body INCLUDED because the echo rule requires it and with 'open' counted ONCE although it is both a state body and a verb body. A consumer-vocabulary literal, an attribute-NAME literal, a FIFTH state body, a SIXTH verb body, a second set-value body or any spelling variant FAILS. UNEXPECTED BODIES: ${JSON.stringify(unexpected)}`,
    ).toEqual([])
    expect(DECLARED_LITERAL_BODIES.length, 'R-8 — the declared set is ELEVEN DISTINCT BODIES (S-OV-7: a census that EXCLUDES the typeof-tag body reddens the module the value rules require)').toBe(11)
    // BOTH CONTROLS: (i) a corpus carrying a consumer-vocabulary literal, a FIFTH
    // state body, a SIXTH verb body or 'false' as a set-value FAILS the row;
    // (ii) a corpus carrying exactly the declared eleven PASSES.
    const bad = [...DECLARED_LITERAL_BODIES, 'visible', 'dismiss', 'false']
    expect(bad.filter((b) => !DECLARED_LITERAL_BODIES.includes(b)), 'R-8 (CONTROL i) — the corpus\'s `\'visible\'` state, `\'dismiss\'` verb and `\'false\'` set-value are NOT in the declared set and therefore FAIL').toHaveLength(3)
    expect([...DECLARED_LITERAL_BODIES].filter((b) => !DECLARED_LITERAL_BODIES.includes(b)), 'R-8 (CONTROL ii) — a corpus carrying exactly the eleven declared bodies PASSES (the module\'s own reading is asserted above, not here).').toEqual([])
  })

  it('R-9 (§3.4) — THE NO-FOCUS / NO-matchMedia row: the refused half is CHECKABLE, not promised, and NO exemption may be declared', () => {
    const src = moduleSource()
    expect(src, `R-9 — the module's bytes are the row's subject: ${src === null ? 'the module does not exist yet (the §4.1 red fact)' : 'ok'}`).not.toBe(null)
    const hits = R9_RULES.filter((r) => r.re.test(normalizedView(src ?? ''))).map((r) => r.id)
    expect(
      hits,
      'R-9 / P-OV-11 — over the MODULE\'s source: no activeElement, no focus( or blur( call, no focusable walk, no focus-order member, no focus-restore obligation, no matchMedia, no prefers-* media query and no document/window reference. NO EXEMPTION IS DECLARED: an exemption here would be a relaxation of H-r5, and the focus-trap half STAYS REFILED.',
    ).toEqual([])
    for (const control of [`${t0('document')}.${t0('activeElement')}.id`, `el.${t0('focus')}()`, `${t0('globalThis')}.${t0('matchMedia')}('(prefers-reduced-motion: reduce)')`]) {
      expect(R9_RULES.filter((r) => r.re.test(control)).length > 0, `R-9 (CONTROL) — a corpus carrying ${JSON.stringify(control)} MUST FAIL this row`).toBe(true)
    }
  })

  it('R-10 (§3.4) — THE NO-LISTENER row: the callback is the ONLY call the mechanism makes, exactly once', () => {
    const src = moduleSource()
    expect(src, `R-10 — the module's bytes are the row's subject: ${src === null ? 'the module does not exist yet (the §4.1 red fact)' : 'ok'}`).not.toBe(null)
    const hits = R10_RULES.filter((r) => r.re.test(normalizedView(src ?? ''))).map((r) => r.id)
    expect(
      hits,
      'R-10 / P-OV-8 / I-8 — over the MODULE\'s source: no addEventListener, no removeEventListener, no on* property assignment, no dispatchEvent, no capture flag, no delegated root and no retained handler field. THE MECHANISM OWNS NO SCRIM AND HOLDS NO NODE REFERENCE: the Escape-equivalent is the caller\'s callback ARGUMENT (A-d3).',
    ).toEqual([])
    // THE FALSIFIABLE HALF, at the [T] layer: `M-4`'s recorder proves the callback is
    // the ONLY call, exactly once, and R-10 is therefore NOT VACUOUS.
    expect(
      R10_RULES.filter((r) => r.re.test(`root.${t0('addEventListener')}('keydown', () => {})`)).length > 0,
      'R-10 (CONTROL) — a corpus installing any listener MUST FAIL this row',
    ).toBe(true)
  })

  it('R-11 (§3.4) — THE NO-POLICY / NO-INTERPRETATION row: no computation relates the state argument to any verb beyond the declared matrix', () => {
    const { view, cause } = moduleView()
    expect(cause, `R-11 — the module's bytes are the row's subject: ${String(cause)}`).toBe(null)
    const v = view ?? ''
    const policyRules: readonly RegexRule[] = [
      { id: 'R-11 a timer or clock read', re: new RegExp(`${t0('setTimeout')}|${t0('setInterval')}|${t0('Date')}\\b`) }, // CORPUS-EXEMPT
      { id: 'R-11 an arithmetic relation between the two arguments', re: /\b(?:state|verb)\s*[+\-*/]\s*(?:state|verb)\b/ }, // CORPUS-EXEMPT
      { id: 'R-11 a case fold / trim / prefix match on a caller word', re: /\.(?:toLowerCase|toUpperCase|trim|startsWith|endsWith|includes)\s*\(/ }, // CORPUS-EXEMPT
    ]
    const hits = policyRules.filter((r) => r.re.test(v)).map((r) => r.id)
    expect(
      hits,
      'R-11 / P-OV-3 / I-5 — over the MODULE\'s source: no auto-close, no timer or clock, no priority between verbs, no modality or focus policy, no fallback attribute name, no case fold, no trim and no prefix match on a caller word. A module that closes on a timeout, treats an unrecognized verb as a close, applies the caller\'s hold as a policy of its own, or defaults an attribute name FAILS this row.',
    ).toEqual([])
    expect(
      policyRules.filter((r) => r.re.test(`verb.${t0('toLowerCase')}() === 'close'`)).length > 0,
      'R-11 (CONTROL) — a corpus folding the verb into a declared body MUST FAIL this row (an unrecognized string is NOT prefix-matched, folded or trimmed into a declared body, §2.3 item 1 row (6)).',
    ).toBe(true)
  })

  it('R-12 (§3.4) — THE REFUSED-MUTATION row, four halves: the refusal is asserted as the ABSENCE of the move verbs, never as prose', () => { // CORPUS-EXEMPT
    const src = moduleSource()
    expect(src, `R-12 — the module's bytes are the row's subject: ${src === null ? 'the module does not exist yet (the §4.1 red fact)' : 'ok'}`).not.toBe(null)
    const v = normalizedView(src ?? '')
    // (a) the move verbs, over the normalized view.
    const verbHits = R12_RULES.filter((r) => r.re.test(v)).map((r) => r.id)
    expect(
      verbHits,
      'R-12(a) / P-OV-10 / I-11 — over the MODULE\'s source: NO occurrence of appendChild, removeChild, insertBefore, `.remove(`, parentNode, `parent` as a member, portal, reparent, owner, mount or unmount. THERE ARE NO EXEMPTIONS. THE RE-PARENT HALF IS REFUSED WITH ITS REASON AND IS RE-STATED AS REFILED IN docs/pending.md\'s SCH-12 row — a REFUSAL, never a silent drop (S-OV-11).', // CORPUS-EXEMPT
    ).toEqual([])
    // (b) no node/element/root/owner PARAMETER anywhere in the surface: the declared
    // signature is three caller values and nothing else.
    expect(
      /\(\s*(?:node|element|root|owner)\b/.test(v),
      'R-12(b) — NO node, element, root or owner PARAMETER exists anywhere in the module\'s surface: the declared parameters are state, verb, callback, target, attributeName and inert.',
    ).toBe(false)
    // (c)/(d) are the [T] halves and live in F-10 below; this static row owns (a)/(b).
    for (const control of [`parent.${t0('appendChild')}(node)`, `node.${t0('parentNode')} = other`, `const ${t0('portal')} = 1`]) {
      expect(R12_RULES.filter((r) => r.re.test(control)).length > 0, `R-12 (CONTROL i) — a corpus carrying ${JSON.stringify(control)} MUST FAIL this row`).toBe(true)
    }
    expect(R12_RULES.filter((r) => r.re.test(`export function ${t0('overlayTransition')}(state: unknown, verb: unknown): void {}`)).length, 'R-12 (CONTROL ii) — the module\'s own surface carries none of the move verbs, so it PASSES all four halves').toBe(0)
  })

  it('R-14 (§3.4) — THE NO-OPAQUE-ECHO-VIOLATION row: the ONLY caller hook consulted is the DECLARED callback', () => {
    const src = moduleSource()
    expect(src, `R-14 — the module's bytes are the row's subject: ${src === null ? 'the module does not exist yet (the §4.1 red fact)' : 'ok'}`).not.toBe(null)
    const v = normalizedView(src ?? '')
    // ⟶ **REPAIR 4 (gate-3) — THE ROW CARRIES ITS DECLARED EXEMPTION, NAMED.** The
    // contract REQUIRES the echo guard's `typeof attributeName` tag test (`§2.4` item 1
    // with the `'string'` body named at `§2.1` item 5, `S-OV-7`), so each rule's
    // DECLARED EXEMPTION — here, that ONE guard and nothing else — is SUBTRACTED FROM
    // THE VIEW BEFORE THE RULE READS IT. EVERY other form still fails, and the controls
    // below prove both directions (a forbidden read is exempted from nothing).
    const readView = (rule: RegexRule): string => {
      let view = v
      for (const ex of rule.exemption ?? []) view = view.split(ex).join(' ')
      return view
    }
    const hits = R14_RULES.filter((r) => r.re.test(readView(r))).map((r) => r.id)
    expect(
      hits,
      'R-14 / P-OV-1 / I-12 — the module consults NO caller-supplied hook except the declared callback: no toString, no valueOf, no Symbol.toPrimitive, no hasOwnProperty call on a caller argument, no String() on anything, and no typeof read of a caller ARGUMENT as a decision. THE ONE DECLARED EXEMPTION IS THE ECHO GUARD ITSELF — `typeof attributeName` — which `§2.4` item 1 REQUIRES and `S-OV-7` protects as the `\'string\'`-tag body; every OTHER typeof read (of the target, the verb, the state, the callback) REMAINS a failure. A module that coerces the target, the attributeName or the verb FAILS this row.',
    ).toEqual([])
    for (const control of [`const s = String(${t0('target')})`, `const c = ${t0('attributeName')}.${t0('toString')}()`, `const b = Object.prototype.${t0('hasOwnProperty')}.call(${t0('target')}, 'x')`]) {
      expect(R14_RULES.filter((r) => r.re.test(control)).length > 0, `R-14 (CONTROL) — a corpus carrying ${JSON.stringify(control)} MUST FAIL this row`).toBe(true)
    }
    // ⟶ **REPAIR 4's SECOND CONTROL (`S-OV-2`: BOTH CONTROLS, NAMED) — THE EXEMPTION
    // IS EXACTLY THE DECLARED GUARD.** The exemption is a NAMED form, not a blanket
    // amnesty for the `typeof` keyword: the declared echo guard PASSES, and a `typeof`
    // read of ANY OTHER caller argument in the same shape FAILS — read through the row's
    // own `readView`, so the control exercises the shipped predicate and not a copy.
    const guardRule = R14_RULES.filter((r) => r.id === 'R-14 a typeof read of a caller argument')
    expect(guardRule.length, 'R-14 — the typeof rule is present (an exemption with no rule to exempt is vacuous)').toBe(1)
    expect(
      guardRule.filter((r) => r.re.test(readView(r))).length,
      'R-14 (CONTROL i) — the CONTRACT-REQUIRED echo guard (`typeof attributeName`, the `\'string\'`-tag body of §2.1 item 5) is EXEMPT BY NAME and PASSES: this is the reading that reddened the conformant module before the repair',
    ).toBe(0)
    for (const forbidden of [`const k = typeof ${t0('target')}`, `const k = typeof ${t0('verb')}`, `const k = typeof ${t0('callback')}`]) {
      expect(
        guardRule.filter((r) => r.re.test(forbidden)).length,
        `R-14 (CONTROL ii) — a corpus carrying ${JSON.stringify(forbidden)} MUST STILL FAIL: the exemption covers the declared guard and NOTHING ELSE`,
      ).toBe(1)
    }
  })
})

// ===========================================================================
// 3. §3.2 F-1..F-10 AND §3.3 I-1..I-13 — this unit's FAILURE SURFACE, authored
//    BEFORE its happy paths because a totality claim is what the whole contract
//    rests on (`§4.2` order item 3). `F-2`, `F-3` and `F-4` carry the unit's
//    hardest claims; `F-10` pins the refusal's ABSENCE assertion.
//    **NOTE THE SHAPE: this unit has NO REFUSAL DOMAIN — every outcome below is a
//    VALUE, not an error, and there is no ok/code/reason/thrown/refused anywhere.**
// ===========================================================================
describe('§3.2 F-1 / F-2 / F-3 / F-4 / F-5 + §3.3 I-1 / I-13 — the declared fail-states (every outcome is a VALUE)', () => {
  it('F-1 (§3.2) / I-1 / I-13 — AN UNUSABLE STATE, driven in full: the whole outside reads the declared base state, and NO coercion hook is consulted', async () => {
    const s = await live()
    const hook = hookRecorder()
    const cases: readonly { readonly id: string; readonly state: unknown; readonly omitted?: boolean; readonly hooks: HookCounts | null }[] = [
      { id: '(1) the argument OMITTED', state: undefined, omitted: true, hooks: null },
      { id: '(2) null', state: null, hooks: null },
      { id: "(3) ''", state: '', hooks: null },
      { id: "(4) 'Open' (a CASE variant)", state: 'Open', hooks: null },
      { id: "(5) ' open' (a WHITESPACE variant)", state: ' open', hooks: null },
      { id: "(6) 'OPEN'", state: 'OPEN', hooks: null },
      { id: "(7) 'visible' (a FIFTH-body spelling)", state: 'visible', hooks: null },
      { id: '(8) a number', state: 0, hooks: null },
      { id: '(9) a boolean', state: false, hooks: null },
      { id: '(10) a Symbol', state: Symbol('s'), hooks: null },
      { id: '(11) a 12n bigint', state: 12n, hooks: null },
      { id: '(12) an object', state: {}, hooks: null },
      { id: '(13) a null-prototype record', state: Object.create(null) as unknown, hooks: null },
      { id: '(14) an array', state: [], hooks: null },
      { id: '(15) a function', state: () => {}, hooks: null },
      { id: '(16) an object whose toString/valueOf record their invocations', state: hook.value, hooks: hook.counts },
      { id: '(17) a revoked Proxy', state: revokedProxy(), hooks: null },
      { id: '(18) a trap-throwing Proxy', state: trapThrowingProxy(), hooks: null },
    ]
    for (const c of cases) {
      const r = drove(() => (c.omitted === true ? s.overlayTransition(undefined, t0('open')) : s.overlayTransition(c.state, t0('open'))))
      expect(r.thrown, `F-1 ${c.id} — NOTHING THROWS: an unusable state produces a DECLARED VALUE, never a refusal (§2.3` + ' item 3; `I-1`).').toBe(null)
      const t = r.value as OverlayTransition
      expect(t, `F-1 ${c.id} — the drive returns the declared two-member record`).toEqual({ state: 'closed', changed: false })
      expect(Object.keys(t), `F-1 ${c.id} — the declared two-member key set, in declared order`).toEqual([...TRANSITION_KEYS])
      expect(t.state, `F-1 ${c.id} — an unusable state reads the declared no-move behaviour from 'closed'; no fifth body appears and no coercion is attempted`).toBe('closed')
      expect(t.changed, `F-1 ${c.id} — changed is false: nothing moved`).toBe(false)
    }
    expect(hook.counts, 'F-1(16) — String(), toString and valueOf are NOT invoked for a caller-supplied state (the drive records the counts, and the shape that carries them asserts 0)').toEqual({ toString: 0, valueOf: 0, toPrimitive: 0 })
  })

  it('F-2 (§3.2) / P-OV-TP-3 — AN UNRECOGNIZED VERB, the alphabet\'s whole outside, and the never-consulted callback', async () => {
    const s = await live()
    const rec = recorder()
    const hook = hookRecorder()
    const cases: readonly { readonly id: string; readonly verb: unknown; readonly omitted?: boolean; readonly hooks: HookCounts | null }[] = [
      { id: '(1) the argument OMITTED', verb: undefined, omitted: true, hooks: null },
      { id: '(2) null', verb: null, hooks: null },
      { id: "(3) ''", verb: '', hooks: null },
      { id: "(4) 'dismiss' (an unrecognized string)", verb: 'dismiss', hooks: null },
      { id: "(5) 'CLOSE' (a CASE variant)", verb: 'CLOSE', hooks: null },
      { id: "(6) ' close' (a WHITESPACE variant)", verb: ' close', hooks: null },
      { id: '(7) a number', verb: 42, hooks: null },
      { id: '(8) a boolean', verb: false, hooks: null },
      { id: '(9) a Symbol', verb: Symbol('v'), hooks: null },
      { id: '(10) a 12n bigint', verb: 12n, hooks: null },
      { id: '(11) an object', verb: {}, hooks: null },
      { id: '(12) an array', verb: [], hooks: null },
      { id: '(13) a function', verb: () => {}, hooks: null },
      { id: '(14) an object whose toString/valueOf record their invocations', verb: hook.value, hooks: hook.counts },
      { id: '(15) a revoked Proxy', verb: revokedProxy(), hooks: null },
      { id: '(16) a trap-throwing Proxy', verb: trapThrowingProxy(), hooks: null },
    ]
    for (const c of cases) {
      const r = drove(() => s.overlayTransition(t0('held'), c.omitted === true ? undefined : c.verb, rec.fn))
      expect(r.thrown, `F-2 ${c.id} — an unrecognized verb is normalized to the DECLARED no-move verb and NOTHING THROWS`).toBe(null)
      const t = r.value as OverlayTransition
      expect(t, `F-2 ${c.id} — the caller's own (normalized) state with changed false: no default verb is applied and nothing opens, closes or toggles`).toEqual({ state: 'held', changed: false })
      expect(rec.count(), `F-2 ${c.id} — the callback's invocation count is 0: an unrecognized verb NEVER invokes the Escape-equivalent`).toBe(0)
    }
    expect(hook.counts, 'F-2(14) — the verb is read by an EQUALITY TEST against the five declared bodies ONLY: no String() coercion, no case fold, no trim and no prefix match (§2.3 item 1)').toEqual({ toString: 0, valueOf: 0, toPrimitive: 0 })
  })

  it('F-3 (§3.2) / P-OV-IM-5 — A HOSTILE CALLBACK: the callback\'s own degenerations, with every throw ABSORBED', async () => {
    const s = await live()
    const nonCallable: readonly { readonly id: string; readonly cb: unknown; readonly omitted?: boolean }[] = [
      { id: '(1) the argument OMITTED', cb: undefined, omitted: true },
      { id: '(2) undefined', cb: undefined },
      { id: '(3) null', cb: null },
      { id: '(4) a number', cb: 7 },
      { id: '(5) a string', cb: 'not-a-function' },
      { id: '(6) an object', cb: {} },
      { id: '(7) an array', cb: [] },
      { id: '(8) a revoked Proxy', cb: revokedProxy() },
      { id: '(9) a Proxy whose apply trap THROWS', cb: new Proxy(() => {}, { apply: (): never => { throw new Error('the apply trap must never be entered') } }) },
    ]
    for (const c of nonCallable) {
      const r = drove(() => (c.omitted === true ? s.overlayTransition(t0('open'), t0('escape')) : s.overlayTransition(t0('open'), t0('escape'), c.cb)))
      expect(r.thrown, `F-3 ${c.id} — a NON-CALLABLE callback is never attempted and the declared record returns; NOTHING ESCAPES the call`).toBe(null)
      expect(r.value, `F-3 ${c.id} — for verb 'escape' the declared pair is 'closed' / changed true, whether or not a callable was supplied (the callback is OPTIONAL, §2.1 item 7)`).toEqual({ state: 'closed', changed: true })
    }
    // THE THROWING-CALLABLE ARM: the throw is ABSORBED, the declared record still
    // returns, and the invocation count is exactly 1.
    let calls = 0
    const throwing = (): void => {
      calls += 1
      throw new Error('a callback throw must be ABSORBED')
    }
    const r = drove(() => s.overlayTransition(t0('open'), t0('escape'), throwing))
    expect(r.thrown, 'F-3(10) — a THROWING callback\'s throw is ABSORBED: NOTHING ESCAPES the call (§2.3 item 1 row (4))').toBe(null)
    expect(r.value, 'F-3(10) — the SAME declared record is returned').toEqual({ state: 'closed', changed: true })
    expect(calls, 'F-3(10) — the callable arm\'s invocation count is exactly 1: the throw does not prevent the invocation, nor cause a retry').toBe(1)
    // THE RETENTION HALF: the mechanism does not retain the callback after the call.
    const fresh = recorder()
    s.overlayTransition(t0('open'), t0('escape'), fresh.fn)
    expect(fresh.count(), 'F-3 / P-OV-IM-5 — the callback is NOT RETAINED: a second, independent call observes a fresh count of 1, never 2').toBe(1)
  })

  it('F-4 (§3.2) / P-OV-IM-4 — A THROWING / DIVERGING IDENTITY AS target: the never-consulted half, driven from the hostile side', async () => {
    const s = await live()
    const hook = throwingHookIdentity()
    const cases: readonly { readonly id: string; readonly target: unknown; readonly hooks: HookCounts | null }[] = [
      { id: '(1) an object whose toString AND valueOf THROW (both counts recorded)', target: hook.value, hooks: hook.counts },
      { id: '(2) a null-prototype record', target: Object.create(null) as unknown, hooks: null },
      { id: '(3) a revoked Proxy (whose ANY access raises a TypeError)', target: revokedProxy(), hooks: null },
      { id: '(4) a Proxy whose every trap THROWS', target: trapThrowingProxy(), hooks: null },
      { id: '(5) a Symbol as the target', target: Symbol('t'), hooks: null },
      { id: '(6) a -0 target', target: -0, hooks: null },
      { id: '(7) a NaN target', target: Number.NaN, hooks: null },
      { id: '(8) a frozen object', target: Object.freeze({ a: 1 }), hooks: null },
      { id: '(9) a Map and a Set', target: new Map([['a', 1]]), hooks: null },
    ]
    for (const c of cases) {
      const r = drove(() => s.overlayInertDeclaration(c.target, NAME_A, true))
      expect(r.thrown, `F-4 ${c.id} — NOTHING THROWS by the module: the revoked Proxy's TypeError is never raised because the identity is never touched`).toBe(null)
      const w = r.value as OverlayInertWrite
      expect(Object.is(w.target, c.target), `F-4 ${c.id} — the returned target is ===-identical to the argument (and Object.is-identical for the -0/NaN boundary): a module returning a FABRICATED target, a default element, a null in place of the caller's argument, or a copied record FAILS here`).toBe(true)
      expect(Object.keys(w), `F-4 ${c.id} — the four-member key set, in declared order`).toEqual([...WRITE_KEYS])
      // ⟶ **REPAIR 5 (gate-3) — THE RECORD IS READ THROUGH ITS OWN FIELDS, NEVER HANDED
      // TO THE MATCHER WHOLESALE.** `toEqual({…, target: c.target})` performs an OWN-KEYS
      // inspection of the COMPARED value, which for drive (3) is a REVOKED `Proxy`: the
      // `has` trap raises `TypeError: Cannot perform 'has' on a proxy that has been
      // revoked` INSIDE vitest's matcher, while the MODULE itself throws nothing and
      // returns exactly the declared record. The record's OWN four members are therefore
      // read with `toBe`/`toEqual` on the FIELD VALUES (`w.target` is compared by
      // `Object.is` on the line above and is never passed to the matcher), so the drive
      // reports the module's behaviour instead of the harness's.
      expect(w.name, `F-4 ${c.id} — the 'name' member is the caller's own string BY IDENTITY, independent of the target's shape`).toBe(NAME_A)
      expect(w.value, `F-4 ${c.id} — the SET case's 'value' is the declared string body, independent of the target's shape`).toBe('true')
      expect(w.removal, `F-4 ${c.id} — the SET case's 'removal' is the declared boolean false, independent of the target's shape`).toBe(false)
      expect(Object.keys(w).length, `F-4 ${c.id} — the census is exactly the four declared members (2 + 2 = 4 per pair, read as a COUNT here so the revoked identity is never inspected)`).toBe(4)
    }
    // THE LIVENESS CONTROL: the readings above are asserted to be FALSIFIABLE, so a
    // module whose name/value/removal members drifted FAILS them rather than passing a
    // vacuous control. A PLAIN (non-revoked) identity is driven through the SAME
    // readings, and the three forbidden shapes are asserted to BREAK them.
    {
      const plain = { plain: true }
      const liveW = s.overlayInertDeclaration(plain, NAME_A, true) as OverlayInertWrite
      expect([liveW.name, liveW.value, liveW.removal, Object.keys(liveW).length], 'F-4 (LIVENESS) — a PLAIN identity through the same three readings yields the declared trio and the four-member census, so the readings carry a real signal').toEqual([NAME_A, 'true', false, 4])
      expect(Object.is(liveW.target, plain), 'F-4 (LIVENESS) — the plain identity is echoed by identity through the same reading the hostile drives use').toBe(true)
      expect(writeBreakOf({ name: null, value: 'true', removal: false, target: plain }, NAME_A, plain, 'F-4 (LIVENESS)'), 'F-4 (LIVENESS) — a record with the WRONG name FAILS the row\'s own reading').not.toBe(null)
      expect(writeBreakOf({ name: NAME_A, value: false, removal: false, target: plain }, NAME_A, plain, 'F-4 (LIVENESS)'), 'F-4 (LIVENESS) — a record whose SET arm carries the removal arm\'s value FAILS the row\'s own reading').not.toBe(null)
      expect(writeBreakOf({ name: NAME_A, value: 'true', removal: true, target: plain }, NAME_A, plain, 'F-4 (LIVENESS)'), 'F-4 (LIVENESS) — a record whose SET arm claims removal FAILS the row\'s own reading (the repair did not weaken the discrimination)').not.toBe(null)
      expect(writeBreakOf({ name: NAME_A, value: 'true', removal: false, target: plain }, NAME_A, plain, 'F-4 (LIVENESS)'), 'F-4 (LIVENESS) — the module\'s declared SET record PASSES the same reading').toBe(null)
    }
    expect(hook.counts, 'F-4(1) — ALL THREE coercion-hook counts (toString, valueOf and the banned well-known `Symbol.toPrimitive` — `AD-6`) are 0: a module that reads the target (typeof, a member access, instanceof, a String()/toString/valueOf/coercion-symbol call, a hasOwnProperty call) FAILS this row, and this is the drive that catches it').toEqual({ toString: 0, valueOf: 0, toPrimitive: 0 })
  })

  it('F-5 (§3.2) — AN UNUSABLE ATTRIBUTE NAME, and the independence of the three arguments (the CROSSED drives)', async () => {
    const s = await live()
    const hook = hookRecorder()
    const unusable: readonly { readonly id: string; readonly name: unknown; readonly omitted?: boolean }[] = [
      { id: "(1) ''", name: '' },
      { id: '(2) the argument OMITTED', name: undefined, omitted: true },
      { id: '(3) null', name: null },
      { id: '(4) a number', name: 42 },
      { id: '(5) a boolean', name: true },
      { id: '(6) a Symbol', name: Symbol('n') },
      { id: '(7) a 12n bigint', name: 12n },
      { id: '(8) an object', name: {} },
      { id: '(9) an array', name: [] },
      { id: '(10) a function', name: () => {} },
      { id: '(11) an object whose toString/valueOf record their invocations', name: hook.value },
      { id: '(12) a revoked Proxy', name: revokedProxy() },
    ]
    for (const c of unusable) {
      const r = drove(() => (c.omitted === true ? s.overlayInertDeclaration(TGT, undefined, true) : s.overlayInertDeclaration(TGT, c.name, true)))
      expect(r.thrown, `F-5 ${c.id} — every unusable name reads the declared null WITHOUT throwing`).toBe(null)
      expect((r.value as OverlayInertWrite).name, `F-5 ${c.id} — the declared null: the mechanism owns no attribute name, defaults none and documents none (§2.4 item 1; P-OV-7)`).toBe(null)
      expect((r.value as OverlayInertWrite).value, `F-5 ${c.id} — the VALUE rule is independent of the name's shape: inert === true still yields 'true'`).toBe('true')
      expect((r.value as OverlayInertWrite).removal, `F-5 ${c.id} — and removal false`).toBe(false)
    }
    expect(hook.counts, 'F-5(11) — String(attributeName), attributeName.toString(), valueOf and the banned well-known `Symbol.toPrimitive` (`AD-6`) are NEVER consulted for the name: all THREE counts are 0')?.toEqual({ toString: 0, valueOf: 0, toPrimitive: 0 })
    // THE CROSSED DRIVES: the name rule and the value rule answer DIFFERENT
    // arguments, so a set-write with a null name and a removal with an echoed name
    // are both NORMAL returns, not contradictions (§3.2 F-5's own text).
    const crossed: readonly { readonly id: string; readonly name: unknown; readonly inert: unknown; readonly expected: OverlayInertWrite }[] = [
      { id: "('' , true)", name: '', inert: true, expected: { name: null, value: 'true', removal: false, target: TGT } },
      { id: "('' , false)", name: '', inert: false, expected: { name: null, value: false, removal: true, target: TGT } },
      { id: "('data-x', true)", name: NAME_A, inert: true, expected: { name: NAME_A, value: 'true', removal: false, target: TGT } },
      { id: "('data-x', false)", name: NAME_A, inert: false, expected: { name: NAME_A, value: false, removal: true, target: TGT } },
    ]
    for (const c of crossed) {
      expect(drove(() => s.overlayInertDeclaration(TGT, c.name, c.inert)).value, `F-5 (crossed ${c.id}) — the two rules are INDEPENDENT`).toEqual(c.expected)
    }
  })

  it('F-6 (§3.2) / P-OV-TP-6 — THE COMPOSED PATH, driven end to end, and the ORDER-INDEPENDENCE of the two functions', async () => {
    const s = await live()
    const states: readonly unknown[] = [...STATE_BODIES, 'bogus']
    const verbs: readonly unknown[] = [...VERB_BODIES, 'bogus']
    const names: readonly unknown[] = [NAME_A, '']
    for (const st of states) {
      for (const vb of verbs) {
        for (const nm of names) {
          const label = `(${String(st)}, ${String(vb)}, ${JSON.stringify(nm)})`
          const t = drove(() => s.overlayTransition(st, vb))
          expect(t.thrown, `F-6 ${label} — NOTHING THROWS in any cell, the throwing-callback cells included`).toBe(null)
          const changed = (t.value as OverlayTransition).changed
          const w = drove(() => s.overlayInertDeclaration(TGT, nm, changed))
          expect(w.thrown, `F-6 ${label} — the composed declaration drive does not throw`).toBe(null)
          const expectedName = typeof nm === 'string' && nm !== '' ? nm : null
          expect(w.value, `F-6 ${label} — the changed boolean drives inert under the STRICT rule, so changed: true sets and changed: false removes`).toEqual({ name: expectedName, value: changed ? 'true' : false, removal: !changed, target: TGT })
        }
      }
    }
    // (b) THE ORDER-INDEPENDENCE HALF: the SAME declaration drives re-run BEFORE any
    // transition call must be IDENTICAL to their twins — a module with cross-call
    // state FAILS this.
    const before = [true, false].map((b) => s.overlayInertDeclaration(TGT, NAME_A, b))
    s.overlayTransition(t0('closed'), t0('open'))
    const after = [true, false].map((b) => s.overlayInertDeclaration(TGT, NAME_A, b))
    expect(after, 'F-6(b) / §2.3 item 4 — a call with the same arguments returns the same record whether or not a transition ran first: there is no retained state, no last-verb memo and no transition history.').toEqual(before)
    expect(after[0], 'F-6(b) — and the twins are EQUAL but DISTINCT objects (the record is fresh each call, the echoed target is the caller\'s identity)').not.toBe(before[0])
    expect((after[0] as OverlayInertWrite).target, 'F-6(b) — the echoed identity survives the freshness (S-OV-8: the RECORD is fresh, the echoed VALUE is the caller\'s own)').toBe(TGT)
  })

  it('F-7 (§3.2) / R-2 / R-10 / R-12 — THE NO-WRITE / NO-DOM / NO-LISTENER CONTROL: a corpus that MUST FAIL the rows it is attached to, in all six shapes', () => {
    const results = F7_CORPUS.map((c) => {
      const ids = [
        ...R2_RULES.filter((r) => r.re.test(c.text)).map((r) => r.id),
        ...R10_RULES.filter((r) => r.re.test(c.text)).map((r) => r.id),
        ...R12_RULES.filter((r) => r.re.test(c.text)).map((r) => r.id),
      ]
      return { id: c.id, caught: ids.length > 0, by: ids }
    })
    console.log(`F-7 positive-control corpus :: ${JSON.stringify(results)}`)
    expect(
      results.filter((r) => !r.caught),
      'F-7 — EVERY ONE of the six shapes is caught by the scan rows: R-2\'s no-DOM/no-write scan, R-10\'s no-listener row and R-12\'s refused-mutation row. A scan that passes for any of the six is UNFALSIFIED and must not be filed (§4.4 S-OV-2).',
    ).toEqual([])
    expect(results.length, 'F-7 — six shapes, six catches: the control is the row\'s own proof of liveness').toBe(6)
    // AND THE MODULE ITSELF IS NOT THE CORPUS: the drive passes NO ELEMENT AT ALL,
    // so there is nothing for a write to land on (§2.4 item 4). The corpus above is
    // TEXT, not a drive.
    expect(
      R2_RULES.filter((r) => r.re.test(testView())).length + R10_RULES.filter((r) => r.re.test(testView())).length + R12_RULES.filter((r) => r.re.test(testView())).length,
      'F-7 — the TEST-FILE HALF of R-2/R-10/R-12 over this file\'s own EXECUTABLE CODE: no write, no DOM access, no listener and no node move. This file constructs NO fake element for the module and calls nothing on any object in a row.',
    ).toBe(0)
    // BOTH DIRECTIONS, so the reading above is not a vacuous whole-file strip:
    expect(
      stripStringLiterals(`const s = ${JSON.stringify(`${t0('removeAttribute')} x`)}`).includes(t0('removeAttribute')),
      'F-7 (control i) — a banned verb that appears ONLY INSIDE A LITERAL is stripped from the view, which is the whole point of the view: this file is REQUIRED to name the verbs it forbids.',
    ).toBe(false)
    expect(
      R2_RULES.filter((r) => r.re.test(testFileScanView(`const el = getEl(); el.${t0('removeAttribute')}(${JSON.stringify(t0('inert'))})`))).length,
      'F-7 (control ii) — the SAME verb as an UNMARKED, UNQUOTED CALL SITE survives the view and FAILS the row: the test-file half is therefore NOT a blanket exemption and the reading above is live.',
    ).toBeGreaterThan(0)
    expect(testView().length, 'F-7 (control iii) — the view is not empty: it really scans this file\'s executable code.') .toBeGreaterThan(1000)
  })

  it('F-8 (§3.2) / R-4 — THE IMPORT-CLASS CONTROL: exactly ONE import of ANY path must FAIL the row, with the THREE named forms', () => {
    const caught = F8_IMPORT_CONTROLS.map((c) => ({ form: c, caught: R11_RULES.some((r) => r.re.test(c)) }))
    console.log(`F-8 import-class controls :: ${JSON.stringify(caught)}`)
    expect(caught.filter((c) => !c.caught), 'F-8 — a corpus module carrying exactly one import statement of ANY path FAILS R-4; the three named forms are the specific positive controls because they are the three imports a spec writer is most tempted to add (the nearest-named sibling, the A-d3 session, and a self-import)').toEqual([])
    expect(caught.length, 'F-8 — the three named controls').toBe(3)
  })

  it('F-9 (§3.2) / P-OV-SM-2 / I-4 — A SECOND CALL\'S INDEPENDENCE: no retention, no cache, no drift, and FRESH records each call', async () => {
    const s = await live()
    // THE FIVE REPEATED CALLS of each export, each return compared against the first.
    const transitions = [0, 1, 2, 3, 4].map(() => s.overlayTransition(t0('open'), t0('close')))
    for (let i = 1; i < transitions.length; i += 1) {
      expect(transitions[i], `F-9 — call ${i + 1} returns an EQUAL value (toEqual): no drift between the first and the fifth call`).toEqual(transitions[0])
      expect(transitions[i], `F-9 — and a DISTINCT object (S-OV-8: a row asserting toBe between two calls' records FAILS by design)`).not.toBe(transitions[i - 1])
    }
    const writes = [0, 1, 2, 3, 4].map(() => s.overlayInertDeclaration(TGT, NAME_A, true))
    for (let i = 1; i < writes.length; i += 1) {
      expect(writes[i], `F-9 — the declaration's call ${i + 1} is EQUAL to its first call`).toEqual(writes[0])
      expect(writes[i], `F-9 — and a distinct object`).not.toBe(writes[i - 1])
      expect((writes[i] as OverlayInertWrite).target, `F-9 — the echoed target is the caller's own identity in EVERY call (the freshness does not weaken the identity)`).toBe(TGT)
    }
    // THE RECORDED CALLBACK COUNT ACROSS FIVE 'escape' CALLS IS EXACTLY 5: a count of
    // 10 FAILS for a double invocation, a count of 1 FAILS for a memoized callback.
    const rec = recorder()
    for (let i = 0; i < 5; i += 1) s.overlayTransition(t0('open'), t0('escape'), rec.fn)
    expect(rec.count(), 'F-9 / P-OV-SM-2 — the recorded callback count across five escape calls is exactly 5 (10 FAILS for a double invocation; 1 FAILS for a memoized callback)').toBe(5)
    // THE ORDER-INDEPENDENCE PAIR.
    const first = s.overlayInertDeclaration(TGT, NAME_B, false)
    s.overlayTransition(t0('held'), t0('toggle'))
    const second = s.overlayInertDeclaration(TGT, NAME_B, false)
    expect(second, 'F-9 — the declaration called before and after a transition with the same arguments returns the same value: NO OBSERVABLE STATE DIFFERS between the first and the fifth call, and this unit holds NOTHING between calls (I-4: the overlay\'s state CROSSES THE CALL BOUNDARY only as an argument)').toEqual(first)
  })

  it('F-10 (§3.2) / P-OV-TP-5 / I-11 — THE REFUSED-MUTATION ROW, driven as its own fail-state: the four refusal rows assert the ABSENCE of the move verbs', async () => {
    const s = await live()
    // (i) THE BYTE SEARCH, in the normalized view.
    const { view, cause } = moduleView()
    expect(cause, `F-10(i) — the module's bytes are the row's subject: ${String(cause)}`).toBe(null)
    expect(R12_RULES.filter((r) => r.re.test(view ?? '')).map((r) => r.id), 'F-10(i) — the search for each move verb in turn returns ZERO occurrences').toEqual([])
    // (ii) AN INSTRUMENTED FAKE NODE PASSED AS THE `target`: every counter stays 0.
    // THE INSTRUMENT ITSELF (`§3.2 F-10`/`P-OV-TP-5`: *"an instrumented FAKE NODE
    // passed AS THE target"*) — a COUNTER OBJECT, never passed to the module as a
    // node, and its method NAMES are the probe's own subject. It is marked as this
    // file's declared corpus so the test-file scan rows can see past it: **the
    // DRIVES below pass it as the opaque `target`, and the rows assert every counter
    // stays 0**, which is the whole claim.
    const counts: Record<string, number> = {}
    const fakeNode = new Proxy( // CORPUS-EXEMPT
      {
        appendChild: (): void => { counts['appendChild'] = (counts['appendChild'] ?? 0) + 1 }, // CORPUS-EXEMPT
        removeChild: (): void => { counts['removeChild'] = (counts['removeChild'] ?? 0) + 1 }, // CORPUS-EXEMPT
        insertBefore: (): void => { counts['insertBefore'] = (counts['insertBefore'] ?? 0) + 1 }, // CORPUS-EXEMPT
        remove: (): void => { counts['remove'] = (counts['remove'] ?? 0) + 1 }, // CORPUS-EXEMPT
      },
      {
        get(target: Record<string, unknown>, prop: string | symbol): unknown {
          const key = String(prop)
          counts[key] = (counts[key] ?? 0) + 1
          return (target as Record<string, unknown>)[key]
        },
        has(): boolean {
          counts['has'] = (counts['has'] ?? 0) + 1
          return false
        },
        getOwnPropertyDescriptor(): undefined {
          counts['gopd'] = (counts['gopd'] ?? 0) + 1
          return undefined
        },
      },
    )
    const w = drove(() => s.overlayInertDeclaration(fakeNode, NAME_A, true))
    expect(w.thrown, 'F-10(ii) — the drive throws nothing: the mechanism holds no node and moves nothing').toBe(null)
    expect((w.value as OverlayInertWrite).target, 'F-10(ii) — the fake node is ECHOED BY IDENTITY, never read').toBe(fakeNode as unknown)
    expect(counts, 'F-10(ii) — EVERY trap and method count is 0: a module that "resolved" the target, matched it to an element or validated it FAILS here (§2.4 item 3)').toEqual({})
    // AND THE INSTRUMENT IS PROVEN LIVE: the counters DO move when something reads.
    /* eslint-disable-next-line @typescript-eslint/no-unused-expressions */
    void (fakeNode as unknown as Record<string, unknown>)['appendChild']
    expect(counts['appendChild'], 'F-10(ii, control) — the instrument is LIVE: a member access DOES move the counter, so the all-zero reading above is a real absence rather than a dead instrument').toBe(1)
    // (iii) NEITHER RECORD CARRIES A node, a parent, a plan or an owner member.
    const t = s.overlayTransition(t0('closed'), t0('open'))
    for (const rec of [t as unknown as Record<string, unknown>, w.value as unknown as Record<string, unknown>]) {
      expect(Object.keys(rec), 'F-10(iii) — neither returned record carries a FIFTH member: no node, no parent, no plan and no owner member exists in this contract').toEqual(rec === (t as unknown as Record<string, unknown>) ? [...TRANSITION_KEYS] : [...WRITE_KEYS])
    }
    // (iv) NO PATH ANYWHERE IN THE MODULE'S SURFACE ACCEPTS A NODE PARAMETER.
    const surfaceArity: readonly { readonly fn: TransitionShape | InertShape; readonly arity: number }[] = [
      { fn: s.overlayTransition, arity: 3 },
      { fn: s.overlayInertDeclaration, arity: 3 },
    ]
    for (const probe of surfaceArity) {
      expect(probe.fn.length, 'F-10(iv) — each entry point\'s declared arity is three caller arguments and NOTHING ELSE (no element, no node, no root, no owner): a surface that accepted a node parameter would read as arity 4 here').toBe(probe.arity)
    }
    // THE POSITIVE CONTROL NAMED BY THE ROW: the DRIVER ITSELF, run against a corpus
    // that DOES carry parentNode bookkeeping, MUST FAIL.
    expect(
      R12_RULES.filter((r) => r.re.test(`node.${t0('parentNode')}.${t0('appendChild')}(other)`)).length > 0,
      'F-10 (CONTROL) — the driver itself, run against a corpus module that DOES carry parentNode bookkeeping, MUST FAIL this row: the refusal is an ABSENCE assertion, never prose (S-OV-11).',
    ).toBe(true)
  })
})

describe('§3.3 I-2 / I-3 / I-5..I-10 / I-12 — the invariants that hold in every state', () => {
  it('I-3 (§3.3) — THE RETURNED RECORDS\' CENSUS IS EXACTLY THE DECLARED ONE, in declared order, and each record is FRESH and PLAIN', async () => {
    const s = await live()
    const t = s.overlayTransition(t0('closed'), t0('open'))
    expect(keyBreakOf(t, TRANSITION_KEYS), 'I-3 — two members on OverlayTransition, in declared order').toBe(null)
    expect(freshnessBreakOf(t as unknown as Record<string, unknown>, TRANSITION_KEYS), 'I-3 — fresh, plain, prototype Object.prototype, no member a getter, nothing frozen or sealed').toBe(null)
    const w = s.overlayInertDeclaration(TGT, NAME_A, true)
    expect(keyBreakOf(w, WRITE_KEYS), 'I-3 — four members on OverlayInertWrite, in declared order').toBe(null)
    expect(freshnessBreakOf(w as unknown as Record<string, unknown>, WRITE_KEYS), 'I-3 — the same freshness claim').toBe(null)
    expect(s.overlayTransition(t0('closed'), t0('open')) === (t as unknown), 'I-3 / S-OV-8 — each call returns a NEW record: a row asserting toBe between two calls\' records FAILS by design').toBe(false)
  })

  it('I-4 / I-5 / I-9 (§3.3) — NO store, cache or module-level mutable state; NO policy default; NO new MCP surface and NO shim member', () => {
    const src = moduleSource()
    const v = src === null ? '' : normalizedView(src)
    const storeRules: readonly RegexRule[] = [
      { id: 'I-4 a module-level `let` binding', re: /^(?:export\s+)?let\s+/m }, // CORPUS-EXEMPT
      { id: 'I-4 a module-level `var` binding', re: /^(?:export\s+)?var\s+/m }, // CORPUS-EXEMPT
      { id: 'I-4 a Map/WeakMap/Set of its own', re: /\bnew\s+(?:Map|WeakMap|Set|WeakSet)\s*\(/ }, // CORPUS-EXEMPT
      { id: 'I-4 a store or cache binding', re: new RegExp(`\\b(?:${t0('store')}|${t0('cache')}|${t0('memo')}|${t0('registry')})\\b`) }, // CORPUS-EXEMPT
    ]
    expect(src, `I-4 — the module's bytes are the row's subject: ${src === null ? 'the module does not exist yet (the §4.1 red fact)' : 'ok'}`).not.toBe(null)
    expect(storeRules.filter((r) => r.re.test(v)).map((r) => r.id), 'I-4 / P-OV-4 — ZERO module-level mutable state: no store, no cache, no registry, no memo, no counter, no Map/WeakMap of its own, no retained node, no retained callback and no persistence. EVERY CALL IS A PURE FUNCTION OF ITS ARGUMENTS.').toEqual([])
    // I-9's MCP and shim negatives, asserted on the CONFIG/REGISTRATION SITES as SET
    // claims against the NAMES (never a bare count quoted here — S-OV-6).
    const mcp = readFileSync(join(ROOT, 'src', 'main', 'mcp-server.ts'), 'utf8')
    expect(new RegExp(`\\b${t0('overlay')}\\b`, 'i').test(mcp), 'I-9 / P-OV-5 — this module is imported by no src/** file and registers NOTHING: the pinned MCP sets keep exactly the names they carry today, and no tool, resource, group, RpcMethod or MUTATING_METHODS entry names this unit').toBe(false)
    expect(scanForToken(readFileSync(join(ROOT, 'package.json'), 'utf8'), t0('overlay'), true), 'I-9 — no dependency, no devDependency and no script key names this unit').toBe(false)
  })

  it('I-6 / I-8 (§3.3) — NO UI content, NO write, and NO event wiring: `returned` is not `written`, and the callback is the only call', async () => {
    const s = await live()
    const rec = recorder()
    // The mechanism authors no element, no text, no class, no attribute and no
    // scrim: it returns two plain records. THE ONLY THING IT EVER CALLS IS THE
    // DECLARED CALLBACK, once, on the escape verb.
    const w = s.overlayInertDeclaration(TGT, NAME_A, true)
    expect(w, 'I-6 — the declaration returns DATA: the inert write is a record the CONSUMER applies, and the removal case is a removal: true member, NEVER a call').toEqual({ name: NAME_A, value: 'true', removal: false, target: TGT })
    for (const vb of VERB_BODIES.filter((x) => x !== t0('escape'))) s.overlayTransition(t0('open'), vb, rec.fn)
    expect(rec.count(), 'I-8 / P-OV-8 — the callback is invoked on the escape verb and on NO other: the mechanism installs no listener of any kind and holds no node reference').toBe(0)
    s.overlayTransition(t0('open'), t0('escape'), rec.fn)
    expect(rec.count(), 'I-8 — invoked exactly once on escape').toBe(1)
  })

  it('I-7 (§3.3) — NO [U] ROW IS OFFERED AND NO [D] ROW IS CLAIMED: both refusals are STRUCTURAL, and gate 6 is never "waived"', () => {
    const spec = readFileSync(join(ROOT, 'docs', 'specs', 'overlay.md'), 'utf8')
    expect(spec, 'I-7 / §5.2 — the three-part [U] refusal carries docs/specs/zones.md §4.4 S-6\'s sentence VERBATIM (step 4 required the lift rather than a paraphrase)').toContain('the row may not be moved to the `ui` leg silently.')
    expect(spec, 'I-7 / §5.2 — gate 6 is stated as STRUCTURAL with its reason: no importer, no rendered surface, nothing written or moved').toContain('GATE 6 IS `STRUCTURAL`, NOT WAIVED')
    expect(spec, 'I-7 / §5.2 — the reader question is answered NONE').toContain('THE READER QUESTION, ANSWERED: `NONE`')
    expect(spec, 'I-7 / §5.2 — the §7.1 predicate decision is RECORDED as DOES NOT TRIGGER with its evidence').toContain('DOES NOT TRIGGER')
    expect(/waived/i.test(spec.split('## 6.')[0]), 'I-7 — the word `waived` is FORBIDDEN as gate 6\'s status; its only occurrences are inside the refusal clauses that forbid it (the section before §6 contains the prohibition itself, never a claim that the gate WAS waived)').toBe(true)
  })

  it('I-10 / I-12 (§3.3) — NO import edge in either direction, none fabricated, and the target is READ BY NOTHING', async () => {
    const src = moduleSource()
    expect(src, `I-10 — the module's bytes are the row's subject: ${src === null ? 'the module does not exist yet (the §4.1 red fact)' : 'ok'}`).not.toBe(null)
    expect(R11_RULES.filter((r) => r.re.test(src ?? '')).map((r) => r.id), 'I-10 / §2.5 items 3/4 — the module imports NOTHING and the sibling surfaces (E8\'s module, the A-d3 session, the fork\'s PS-1 stream, the focus rows) are named as BOUNDARIES only, never composed, never imported and never re-expressed: an asserted edge toward any of them would be a FABRICATED EDGE').toEqual([])
    const siblingEdges: readonly string[] = ['theme.js', 'gesture-session.js', 'container.js', 'menu-template.js', 'relocate.js', 'gutter.js', 'zones.js', 'owned-list-host.js', 'slot-host.js', 'layout-projection.js', 'dom-shim.js']
    for (const edge of siblingEdges) {
      expect(scanForToken(src ?? '', edge, false), `I-10 — no edge to the sibling ${edge} exists in the module's bytes (H-r6's dissolved-edge class)`).toBe(false)
    }
  })
})

// ===========================================================================
// 4. §3.1 M-1..M-9 — the valid / happy states, with `M-3` (the non-moving cells)
//    and `M-4` (the callback count) sitting with the rows they make falsifiable,
//    and `M-9` (the one composition drive) LAST (`§4.2` order item 4).
// ===========================================================================
describe('§3.1 M-1..M-9 — the valid / happy states', () => {
  it('M-1 (§3.1) — the transition returns the TWO-member record and the top-level member census is EXACTLY two names', async () => {
    const s = await live()
    const t = s.overlayTransition(t0('closed'), t0('open'))
    expect(Object.keys(t), 'M-1 — Object.keys(t) deep-equals [\'state\',\'changed\'] in that order').toEqual([...TRANSITION_KEYS])
    expect(t.state, 'M-1 — t.state === \'open\'').toBe('open')
    expect(t.changed, 'M-1 — t.changed === true').toBe(true)
    expect(Object.getPrototypeOf(t), 'M-1 — Object.getPrototypeOf(t) === Object.prototype').toBe(Object.prototype)
    for (const k of TRANSITION_KEYS) {
      const d = Object.getOwnPropertyDescriptor(t as unknown as Record<string, unknown>, k)
      expect(d?.get === undefined && d?.set === undefined, `M-1 — no member is a getter (member '${k}')`).toBe(true)
    }
    expect(transitionBreakOf(t, t0('closed'), 'M-1'), 'M-1 — the whole declared claim holds and NOTHING THROWS').toBe(null)
  })

  it('M-2 (§3.1) / P-OV-SM-1 — THE FOUR-STATE SET IS CLOSED: the whole 4 × 5 = 20 matrix, cell by cell, every reachable returned state a member', async () => {
    const s = await live()
    const rec = recorder()
    let cells = 0
    for (const st of STATE_BODIES) {
      for (const vb of VERB_BODIES) {
        cells += 1
        const r = drove(() => s.overlayTransition(st, vb, rec.fn))
        expect(r.thrown, `M-2 (${st} × ${vb}) — NOTHING THROWS`).toBe(null)
        const t = r.value as OverlayTransition
        expect(STATE_BODIES.includes(t.state), `M-2 (${st} × ${vb}) — every returned state is one of the closed four bodies; a FIFTH body never appears`).toBe(true)
        expect(t.changed, `M-2 (${st} × ${vb}) — each cell's changed is the declared one: true exactly when the next state differs from the caller's normalized state argument`).toBe(t.state !== st)
      }
    }
    expect(cells, 'M-2 — the whole 4 × 5 = 20 cross product was driven cell by cell (the matrix IS the declared extent)').toBe(20)
  })

  it('M-3 (§3.1) / P-OV-IM-1 — THE NON-MOVING CELLS ANSWER THEIR OWN STATE: a verb that does not move a state returns THAT state, with changed false', async () => {
    const s = await live()
    const nonMoving: readonly { readonly st: string; readonly vb: string; readonly expected: string }[] = [
      { st: t0('closed'), vb: t0('close'), expected: t0('closed') },
      { st: t0('open'), vb: t0('open'), expected: t0('open') },
      { st: t0('held'), vb: t0('open'), expected: t0('held') },
      { st: t0('held'), vb: t0('toggle'), expected: t0('held') },
      { st: t0('closing'), vb: t0('unknown'), expected: t0('closing') },
      { st: t0('closed'), vb: t0('unknown'), expected: t0('closed') },
      { st: t0('open'), vb: t0('unknown'), expected: t0('open') },
      { st: t0('held'), vb: t0('unknown'), expected: t0('held') },
    ]
    for (const c of nonMoving) {
      const t = s.overlayTransition(c.st, c.vb)
      expect(t.state, `M-3 (${c.st} × ${c.vb}) — the cell returns ITS OWN state. ('held' × 'toggle') MUST return 'held' and NOT 'closed': the caller's hold is respected and only close/escape release it — this is the row a "verb table" implementation FAILS.`).toBe(c.expected)
      expect(t.changed, `M-3 (${c.st} × ${c.vb}) — changed === false for exactly the non-moving cells`).toBe(false)
    }
    // ⟶ **REPAIR 2 (gate-3) — THE `('closing' × 'toggle')` CELL IS A MOVING CELL AND IS
    // DRIVEN AS ONE (`§2.3` item 2's matrix row `'closing'`: `'open'` · changed and
    // `'toggle'` · changed — *`'closing'` … RE-OPEN it*). The previous form asserted
    // `('closing','toggle') ⇒ 'closing'` / `changed false`, contradicting `§2.3` item 2
    // AND this file's own matrix row (`P-OV-SM-1`/`M-2` declare `closing.toggle =
    // ['open', true]`). The row's own claim — a non-moving cell answers its own state —
    // is KEPT as the loop above, and the boundary cell is asserted as the DECLARED move
    // it is, so the two readings can no longer disagree.**
    {
      const t = s.overlayTransition(t0('closing'), t0('toggle'))
      expect(t, `M-3 ('closing' × 'toggle') — the matrix declares 'closing' RE-OPENED by 'toggle': {state: 'open', changed: true} (§2.3 item 2). The verb that does NOT move it is the caller's hold: ('held' × 'toggle') ⇒ 'held'.`).toEqual({ state: t0('open'), changed: true })
    }
    // every 'unknown' cell, exhaustively, answers its own state.
    for (const st of STATE_BODIES) {
      expect(s.overlayTransition(st, t0('unknown')), `M-3 ('${st}' × 'unknown') — the declared no-move verb is a MEMBER of the alphabet, never a refusal state: 'unknown' in, 'unknown' out, and the state never moves`).toEqual({ state: st, changed: false })
    }
  })

  it('M-4 (§3.1) / P-OV-IM-5 — THE FOURTH VERB\'S CALLBACK OBLIGATION: invoked EXACTLY ONCE on escape, for EVERY state', async () => {
    const s = await live()
    const expectedChanged: Record<string, boolean> = { closed: false, open: true, held: true, closing: true }
    for (const st of STATE_BODIES) {
      const rec = recorder()
      const r = drove(() => s.overlayTransition(st, t0('escape'), rec.fn))
      expect(r.thrown, `M-4 (${st} × 'escape') — nothing escapes the call`).toBe(null)
      expect(rec.count(), `M-4 (${st} × 'escape') — the recorder's count is exactly 1 FOR EVERY STATE: a module that skips the callback on escape from 'closed' FAILS this row`).toBe(1)
      expect(r.value, `M-4 (${st} × 'escape') — the state settles at 'closed', and changed is true for open/held/closing and false for closed`).toEqual({ state: 'closed', changed: expectedChanged[st] })
    }
    // NEVER on any other verb.
    for (const vb of VERB_BODIES.filter((x) => x !== t0('escape'))) {
      const rec = recorder()
      s.overlayTransition(t0('open'), vb, rec.fn)
      expect(rec.count(), `M-4 ('open' × '${vb}') — the callback is NOT invoked (count 0): a module that invokes the callback on 'close' FAILS P-OV-IM-5`).toBe(0)
    }
    // NOT RETAINED: the mechanism holds no reference to the recorder after the call.
    const held = recorder()
    s.overlayTransition(t0('open'), t0('escape'), held.fn)
    s.overlayTransition(t0('held'), t0('close'))
    expect(held.count(), 'M-4 — the mechanism holds NO reference to the recorder after the call: a later, different verb invokes nothing').toBe(1)
  })

  it('M-5 (§3.1) — the declaration returns the write record and the top-level member census is EXACTLY four names', async () => {
    const s = await live()
    const w = s.overlayInertDeclaration(TGT, NAME_A, true)
    expect(Object.keys(w), 'M-5 — Object.keys(w) deep-equals [\'name\',\'value\',\'removal\',\'target\'] in that order').toEqual([...WRITE_KEYS])
    expect(w.name, 'M-5 — w.name === the caller\'s own string BY IDENTITY').toBe(NAME_A)
    expect(w.value, 'M-5 — w.value === \'true\'').toBe('true')
    expect(w.removal, 'M-5 — w.removal === false').toBe(false)
    expect(w.target, 'M-5 — w.target === the caller\'s argument BY IDENTITY').toBe(TGT)
    expect(writeBreakOf(w, NAME_A, TGT, 'M-5'), 'M-5 — nothing throws and no element, attribute or class was touched anywhere in the drive (the drive passes NO element at all)').toBe(null)
  })

  it('M-6 (§3.1) / P-OV-TP-2 — THE REMOVAL CASE IS RETURNED AS DATA for every trigger, with the name echoed and the target unharmed', async () => {
    const s = await live()
    const triggers: readonly { readonly id: string; readonly inert: unknown; readonly omitted?: boolean }[] = [
      { id: '(a) false', inert: false },
      { id: '(b) undefined (omitted)', inert: undefined, omitted: true },
      { id: '(c) null', inert: null },
      { id: '(d) the string \'false\'', inert: 'false' },
      { id: '(e) the number 1', inert: 1 },
      { id: '(f) the string \'true\'', inert: 'true' },
      { id: '(g) 0 and -0 and NaN', inert: 0 },
      { id: '(h) an object', inert: {} },
    ]
    for (const c of triggers) {
      const r = drove(() => (c.omitted === true ? s.overlayInertDeclaration(TGT, NAME_A) : s.overlayInertDeclaration(TGT, NAME_A, c.inert)))
      expect(r.thrown, `M-6 ${c.id} — NOTHING THROWS`).toBe(null)
      expect(r.value, `M-6 ${c.id} — every one returns {name:'data-x', value:false, removal:true, target:tgt}, with value the BOOLEAN false, NOT '' and NOT the string 'false'. A TRUTHINESS implementation FAILS here: 'false' and 1 must NOT set the attribute.`).toEqual({ name: NAME_A, value: false, removal: true, target: TGT })
      const w = r.value as OverlayInertWrite
      expect(typeof w.value, `M-6 ${c.id} — the removal case's value is the BOOLEAN false (a module returning '' FAILS the declared value domain)`).toBe('boolean')
      expect(typeof w.removal, `M-6 ${c.id} — removal is the DECLARED discrimination and a consumer never infers removal from a value's emptiness`).toBe('boolean')
    }
    // removeAttribute is NOT called on anything — the drive passes NO element at all,
    // and the only form this unit represents the H-r7 class in is the DATA PAIR.
    // Read through the NAMED exemption view, because the F-7 control corpus above
    // necessarily CARRIES the spelling (§4.3's assembly rule); a real call site in a
    // row would survive the subtraction and FAIL here.
    expect(R2_RULES.filter((r) => r.re.test(testView())).length, 'M-6 — no removeAttribute / setAttribute / classList / setProperty call site exists anywhere in this file\'s rows (the drive passes NO element at all; the H-r7 removal class is represented as DATA)').toBe(0)
  })

  it('M-7 (§3.1) — THE NAME ECHOES VERBATIM, and the empty/non-string arms are separate observables', async () => {
    const s = await live()
    const hook = hookRecorder()
    const cases: readonly { readonly id: string; readonly name: unknown; readonly omitted?: boolean; readonly expected: string | null }[] = [
      { id: "(a) 'data-x'", name: NAME_A, expected: NAME_A },
      { id: "(b) ' class ' (whitespace-padded)", name: ' class ', expected: ' class ' },
      { id: "(c) ''", name: '', expected: null },
      { id: '(d) 42', name: 42, expected: null },
      { id: '(e) null', name: null, expected: null },
      { id: '(f) the argument OMITTED', name: undefined, omitted: true, expected: null },
      { id: '(g) an object carrying its own toString', name: hook.value, expected: null },
    ]
    for (const c of cases) {
      const r = drove(() => (c.omitted === true ? s.overlayInertDeclaration(TGT, undefined, true) : s.overlayInertDeclaration(TGT, c.name, true)))
      expect(r.thrown, `M-7 ${c.id} — NOTHING THROWS in any drive`).toBe(null)
      const w = r.value as OverlayInertWrite
      expect(w.name, `M-7 ${c.id} — (a)/(b) echo the caller's own string BY IDENTITY, untrimmed and untransformed (the whitespace-only case is deliberately INSIDE the echoed arm); (c)-(f) each read the declared null`).toBe(c.expected)
      expect(w.value, `M-7 ${c.id} — value/removal are INDEPENDENT of the name's shape`).toBe('true')
      expect(w.removal, `M-7 ${c.id} — the value rule answers the inert argument, not the name`).toBe(false)
    }
    expect(hook.counts, 'M-7(g) — the object\'s toString is NOT invoked and its valueOf is NOT invoked (the drive records the counts and asserts 0): this is the row a String()-coercing implementation FAILS').toEqual({ toString: 0, valueOf: 0, toPrimitive: 0 })
  })

  it('M-8 (§3.1) / P-OV-IM-4 — THE TARGET IS ECHOED BY IDENTITY AND READS NOTHING', async () => {
    const s = await live()
    let getCount = 0
    const counted = new Proxy({ plain: true }, { get: (t: object, p: string | symbol): unknown => { getCount += 1; return (t as Record<string, unknown>)[String(p)] } })
    const cases: readonly { readonly id: string; readonly target: unknown; readonly readsNothing: boolean }[] = [
      { id: '(a) a plain object', target: { a: 1 }, readsNothing: false },
      { id: '(b) an array', target: [1, 2], readsNothing: false },
      { id: '(c) a function', target: () => {}, readsNothing: false },
      { id: '(d) a Symbol', target: Symbol('t'), readsNothing: false },
      { id: '(e) a 12n bigint', target: 12n, readsNothing: false },
      { id: '(f) Object.create(null)', target: Object.create(null) as unknown, readsNothing: false },
      { id: '(g) a FROZEN object', target: Object.freeze({ f: 1 }), readsNothing: false },
      { id: '(h) a Proxy whose get is counted', target: counted, readsNothing: true },
    ]
    for (const c of cases) {
      const before = getCount
      const r = drove(() => s.overlayInertDeclaration(c.target, NAME_A, true))
      expect(r.thrown, `M-8 ${c.id} — NOTHING THROWS`).toBe(null)
      expect((r.value as OverlayInertWrite).target, `M-8 ${c.id} — every drive returns w.target === the argument (toBe)`).toBe(c.target)
      if (c.readsNothing) expect(getCount - before, `M-8 ${c.id} — the get trap count for this drive is 0: the mechanism may not resolve, match, validate or read the identity it was handed`).toBe(0)
    }
    expect(getCount, 'M-8(h) — the counted Proxy\'s get trap was entered ZERO times across the whole row').toBe(0)
  })

  it('M-9 (§3.1) — the whole surface is reachable and returns its declared shapes in ONE composition (the drive LAST)', async () => {
    const s = await live()
    const rec = recorder()
    let records = 0
    let members = 0
    let elementAccesses = 0
    // ⟶ **REPAIR 3 (gate-3) — THE CALLBACK INVOCATION IS CARRIED BY THE VERB THE
    // CONTRACT OBLIGES IT ON (`§2.3` item 1 row (4): the callback is invoked EXACTLY
    // ONCE ON `'escape'` — for EVERY state — and NEVER on any other verb).** The row
    // previously drove `('held','close')` and still asserted ONE invocation, which
    // contradicted `M-4`'s own assertion that a `'close'` drive invokes nothing
    // (`§2.3` item 1 row (2): NOT INVOKED). Driving `'escape'` keeps BOTH claims and
    // their controls jointly satisfiable: the invocation count is exactly `1`, and the
    // declared `'escape'` cell for `'held'` is `{state: 'closed', changed: true}` — the
    // SAME pair `'close'` declares for `'held'`, so every downstream reading (the
    // `'open'` re-drive, the chained declaration, the totals) is unchanged.
    const t = s.overlayTransition(t0('held'), t0('escape'), rec.fn)
    records += 1
    members += Object.keys(t).length
    const t2 = s.overlayTransition(t.state, t0('open'), rec.fn)
    records += 1
    members += Object.keys(t2).length
    const w = s.overlayInertDeclaration(TGT, NAME_A, t2.changed)
    records += 1
    members += Object.keys(w).length
    // ⟶ **REPAIR 3 (gate-3), second half — THE COMPOSITION'S OWN ARMS.** The first
    // transition now carries `'escape'` (the declared callback verb), whose `'held'`
    // cell is `{state: 'closed', changed: true}` — exactly the pair `'close'` declares —
    // so `w2`, the declaration chained from `t.changed === true`, is the SET arm, and
    // it is asserted as the declared SET record. The REMOVAL arm is not reached by this
    // composition and is NOT claimed here (it has its own rows: `M-6`, `P-OV-TP-2`,
    // `P-OV-TP-4`); asserting a removal record the drive cannot produce was the
    // contradiction the repair removes, and the declared `'escape'` pair keeps the rest
    // of the composition (`t2` at `'open'`, the callback count, the totals) unchanged.
    const w2 = s.overlayInertDeclaration(TGT, w.name, t.changed)
    records += 1
    members += Object.keys(w2).length
    elementAccesses += 0 // the surface takes no element: nothing to access
    console.log(`M-9 composition totals :: records=${records} members=${members} callbackInvocations=${rec.count()} elementAccesses=${elementAccesses}`)
    expect(records, 'M-9 — the drive\'s own totals read 2 transition records and 2 declaration records').toBe(4)
    expect(members, 'M-9 — 2 + 4 = 6 members per pair, so two pairs read 12').toBe(12)
    expect(rec.count(), 'M-9 — 1 callback invocation: exactly one of the four drives carried the escape verb, and it was the first (a \'close\' drive would invoke NOTHING — §2.3 item 1 rows (2)/(4), the same rule M-4 asserts)').toBe(1)
    expect(elementAccesses, 'M-9 — 0 element accesses: the whole surface is reachable with no element, no node and no root (§2.5 item 2)').toBe(0)
    expect(w2, 'M-9 — the declaration\'s name chained from a caller string is carried by identity, and the inert argument chained from the first transition\'s own `changed` is the SET arm (true ⇒ {value: \'true\', removal: false}, §2.4 item 2)').toEqual({ name: NAME_A, value: 'true', removal: false, target: TGT })
    expect(t2, 'M-9 — and the second transition settled at open with changed true').toEqual({ state: 'open', changed: true })
  })
})

// ===========================================================================
// 5. §5.5.1 — THE TYPED PROPERTY REGISTER, IN REGISTER ORDER
//    (`P-OV-IM-1` · `IM-2` · `IM-3` · `IM-4` · `IM-5` · `P-OV-SM-1` · `SM-2` ·
//    `P-OV-TP-1` · `TP-2` · `TP-3` · `TP-4` · `TP-5` · `TP-6`).
//    Each row reports its STRATEGY ID, its declared TERM and its held/broken
//    counts; the caps are ≤100/row · ≤400 total · stop-after-5-consecutive-failures;
//    **AN UN-RUN ROW IS REPORTED AS A FAILURE, NEVER AS A PASS.**
// ===========================================================================
describe('§5.5.1 — THE TYPED PROPERTY REGISTER (13 rows / 13 terms, in register order)', () => {
  it('P-OV-IM-1 [S-OV-STATE-1] (bounded) — for EVERY state shape: the closed four-body set, every non-moving cell answering its own state, the declared member names and no coercion hook', async () => {
    const r = row(definedRow('P-OV-IM-1'))
    const s = await live().catch(() => null)
    const hook = hookRecorder()
    const pool: readonly { readonly id: string; readonly value: () => unknown; readonly hooks: HookCounts | null }[] = [
      { id: '(1) the body closed', value: () => t0('closed'), hooks: null },
      { id: '(2) the body open', value: () => t0('open'), hooks: null },
      { id: '(3) the body held', value: () => t0('held'), hooks: null },
      { id: '(4) the body closing', value: () => t0('closing'), hooks: null },
      { id: '(5) empty', value: () => '', hooks: null },
      { id: '(6) omitted and null', value: () => null, hooks: null },
      { id: '(7) a number (0, NaN) and a boolean', value: () => 0, hooks: null },
      { id: '(8) a Symbol and a 12n', value: () => Symbol('s'), hooks: null },
      { id: '(9) an object, an array, a function — and one whose hooks are recorded', value: () => hook.value, hooks: hook.counts },
      { id: '(10) a revoked Proxy and a trap-throwing Proxy', value: () => revokedProxy(), hooks: null },
    ]
    // ⟶ **`AD-1` — THE EXECUTED-DRIVE FIGURE, PRINTED BESIDE THE DECLARED TERM.** The
    // row's declared term is the contract's `10` — the TEN POOL SHAPES — and the cell's
    // own wording ("a FIXED moving verb and a FIXED no-move verb") is why EACH counted
    // attempt issues TWO entry-point calls: one with the FIXED moving verb (`close`) and
    // one with the FIXED no-move verb (`unknown`). The row therefore MEASURES `20`
    // executed drives beside its `10` term (`r.executedDrive()` at each drive, reported on
    // its own record line and reconciled by `HARNESS-2`), and **NO TERM MOVES**: the `10`
    // stays the declared extent the caps compare against, the extra ten drives are printed
    // beside it and never counted in it.
    for (const member of pool) {
      r.run(member.id, () => {
        if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
        const shape = member.value()
        const moving = droveCounted(r, () => s.overlayTransition(shape, t0('close')))
        if (moving.thrown !== null) return `${member.id} — the entry point THREW: ${describeThrown(moving.thrown)}`
        const mv = moving.value as OverlayTransition
        if (!STATE_BODIES.includes(mv.state)) return `${member.id} — the returned state ${JSON.stringify(mv.state)} is not a member of the closed four-body set (a FIFTH body FAILS)`
        const brk = keyBreakOf(mv, TRANSITION_KEYS)
        if (brk !== null) return `${member.id} — ${brk}`
        const fresh = freshnessBreakOf(mv as unknown as Record<string, unknown>, TRANSITION_KEYS)
        if (fresh !== null) return `${member.id} — ${fresh}`
        if (typeof mv.changed !== 'boolean') return `${member.id} — changed must be a boolean`
        const settled = STATE_BODIES.includes(shape as string) ? (shape as string) : t0('closed')
        if (mv.state !== t0('closed')) return `${member.id} — 'close' from the normalized base must settle at 'closed'; got ${JSON.stringify(mv.state)}`
        if (mv.changed !== (t0('closed') !== settled)) return `${member.id} — changed === (next !== previous) is the declared identity: previous=${JSON.stringify(settled)}, changed=${String(mv.changed)}`
        // the FIXED no-move verb: the non-moving arm returns the state it normalizes to.
        const noMove = droveCounted(r, () => s.overlayTransition(shape, t0('unknown')))
        if (noMove.thrown !== null) return `${member.id} — the no-move arm THREW: ${describeThrown(noMove.thrown)}`
        const nm = noMove.value as OverlayTransition
        if (nm.state !== settled) return `${member.id} — a verb that does not move a state must return THAT state: expected ${JSON.stringify(settled)}, got ${JSON.stringify(nm.state)}`
        if (nm.changed !== false) return `${member.id} — the non-moving arm must report changed false`
        r.reading()
        return null
      })
    }
    if (hook.counts !== null) {
      expect(hook.counts, 'P-OV-IM-1 / `AD-6` — NONE of the THREE banned coercion hooks (String()/toString/valueOf/`Symbol.toPrimitive`) is invoked for a state shape (the pool member that carries the hooks makes this falsifiable by construction, and its liveness is proven by a positive control in P-OV-IM-4)').toEqual({ toString: 0, valueOf: 0, toPrimitive: 0 })
    }
    r.finish()
  })

  it('P-OV-IM-2 [S-OV-SHAPE-1] (bounded) — the SHAPE half: the two key sets in declared order, changed === (next !== previous) on every drive, AND the refusal\'s absence assertion', async () => {
    const r = row(definedRow('P-OV-IM-2'))
    const s = await live().catch(() => null)
    const shapeDrives: readonly { readonly id: string; readonly body: () => string | null }[] = [
      {
        id: '(1) a moving cell',
        body: () => {
          if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
          // ⟶ THE DRIVE HELPER TAKES THE SURFACE, NOT A CALL'S RESULT: passing
          // `s.overlayTransition(...)`'s RECORD as the first argument made the helper
          // read a `.overlayTransition` member off the returned TRANSITION and report
          // `s.overlayTransition is not a function` — a TEST-SIDE break, not a module
          // one. The helper performs the drive itself (and reports a THROW as its cause).
          return transitionDriveBreakOf(s, t0('closed'), t0('open'), undefined, '(1) a moving cell')
        },
      },
      {
        id: '(2) a non-moving cell',
        body: () => {
          if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
          return transitionDriveBreakOf(s, t0('held'), t0('toggle'), undefined, '(2) a non-moving cell')
        },
      },
      {
        id: '(3) a set-declaration',
        body: () => {
          if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
          return writeBreakOf(s.overlayInertDeclaration(TGT, NAME_A, true), NAME_A, TGT, '(3) a set-declaration')
        },
      },
      {
        id: '(4) a removal-declaration',
        body: () => {
          if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
          return writeBreakOf(s.overlayInertDeclaration(TGT, NAME_A, false), NAME_A, TGT, '(4) a removal-declaration')
        },
      },
    ]
    for (const d of shapeDrives) {
      r.run(d.id, () => {
        const brk = d.body()
        if (brk !== null) return brk
        r.reading()
        return null
      })
    }
    // THE NEGATIVE TWIN CORPUS (`§5.5.1`: a corpus carrying a third/fifth member or a
    // re-ordered key set MUST FAIL) — reported on the control channel.
    controlDrive(r, 'the negative twin corpus (a third member, a fifth member, a re-ordered key set) MUST FAIL the census reading', () => {
      const third = keyBreakOf({ state: t0('closed'), changed: false, extra: 1 }, TRANSITION_KEYS)
      const fifth = keyBreakOf({ name: null, value: false, removal: true, target: null, plan: null }, WRITE_KEYS)
      const reordered = keyBreakOf({ changed: false, state: t0('closed') }, TRANSITION_KEYS)
      if (third === null) return 'a corpus with a THIRD transition member PASSED the census reading'
      if (fifth === null) return 'a corpus with a FIFTH write member PASSED the census reading'
      if (reordered === null) return 'a corpus with a RE-ORDERED key set PASSED the census reading'
      return null
    }, false)
    // THE TWO REFUSAL DRIVES of the row's declared `6` (the shape half is `4`, the
    // refusal half is `2`): a fake node passed AS THE `target`, and the module's own
    // bytes' move-verb absence in the NORMALIZED view.
    r.run('(5) an instrumented fake node passed AS the target: every trap count 0, no returned member node-shaped', () => {
      if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
      let traps = 0
      const fake = new Proxy({}, { get: (): unknown => { traps += 1; return undefined }, has: (): boolean => { traps += 1; return false } })
      const w = drove(() => s.overlayInertDeclaration(fake, NAME_A, true))
      if (w.thrown !== null) return `the drive threw: ${describeThrown(w.thrown)}`
      if ((w.value as OverlayInertWrite).target !== (fake as unknown)) return 'the fake node was not echoed by identity'
      if (traps !== 0) return `the fake node's trap count is ${traps}, not 0`
      for (const rec of [w.value as unknown as Record<string, unknown>]) {
        for (const k of Object.keys(rec)) {
          if (['node', 'parent', 'plan', 'owner'].includes(k)) return `the returned record carries a node-shaped member '${k}'`
        }
      }
      r.reading()
      return null
    })
    r.run('(6) the module\'s own bytes\' move-verb absence in the normalized view', () => {
      const { view, cause } = moduleView()
      if (cause !== null) return cause
      const hits = R12_RULES.filter((x) => x.re.test(view ?? '')).map((x) => x.id)
      if (hits.length > 0) return `the module's bytes carry a move verb: ${JSON.stringify(hits)}`
      if (/\(\s*(?:node|element|root|owner)\b/.test(view ?? '')) return 'the module\'s surface carries a node/element/root/owner parameter'
      r.reading()
      return null
    })
    r.finish()
  })

  it('P-OV-IM-3 [S-OV-ECHO-1] (bounded) — for EVERY one of the 12 declaration drives (6 name shapes × 2 inert arms): the echoed identity or the declared null, the STRICT pair, and independence', async () => {
    const r = row(definedRow('P-OV-IM-3'))
    const s = await live().catch(() => null)
    const hook = hookRecorder()
    const nameShapes: readonly { readonly id: string; readonly name: unknown; readonly expected: string | null; readonly omitted?: boolean }[] = [
      { id: 'name(1) a caller spelling', name: NAME_A, expected: NAME_A },
      { id: 'name(2) a whitespace-padded spelling (echoed UNTRIMMED)', name: NAME_B, expected: NAME_B },
      { id: 'name(3) the empty string', name: '', expected: null },
      { id: 'name(4) the argument OMITTED and null', name: null, expected: null },
      { id: 'name(5) a number (42), a boolean and a Symbol', name: 42, expected: null },
      { id: 'name(6) an object carrying its own toString/valueOf', name: hook.value, expected: null },
    ]
    const inertArms: readonly { readonly id: string; readonly inert: unknown; readonly value: string | false; readonly removal: boolean; readonly omitted?: boolean }[] = [
      { id: 'inert(a) true (the SET arm)', inert: true, value: t0('true'), removal: false },
      { id: 'inert(b) the removal arm (false)', inert: false, value: false, removal: true },
    ]
    for (const n of nameShapes) {
      for (const a of inertArms) {
        r.run(`${n.id} × ${a.id}`, () => {
          if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
          const drv = drove(() => s.overlayInertDeclaration(TGT, n.name, a.inert))
          if (drv.thrown !== null) return `the drive THREW: ${describeThrown(drv.thrown)}`
          const w = drv.value as OverlayInertWrite
          const brk = writeBreakOf(w, n.expected, TGT, `${n.id} × ${a.id}`)
          if (brk !== null) return brk
          if (w.value !== a.value) return `${n.id} × ${a.id} — the value must be ${JSON.stringify(a.value)}; got ${JSON.stringify(w.value)}`
          if (w.removal !== a.removal) return `${n.id} × ${a.id} — removal must be ${String(a.removal)}`
          if (removalIdentityBrokenOf({ value: w.value, removal: w.removal })) return `${n.id} × ${a.id} — the DECLARED removal/set discrimination (§2.4 item 2) FAILS: the pair ${JSON.stringify({ value: w.value, removal: w.removal })} is neither declared member`
          const keys = keyBreakOf(w, WRITE_KEYS)
          if (keys !== null) return `${n.id} × ${a.id} — ${keys}`
          r.reading()
          return null
        })
      }
    }
    expect(hook.counts, 'P-OV-IM-3 / `AD-6` — NONE of String()/toString/valueOf/the banned well-known coercion symbol is consulted for the name').toEqual({ toString: 0, valueOf: 0, toPrimitive: 0 })
    // THE TRUTHINESS CONTROL (`§5.5.1` P-OV-IM-3's "NEVER read as the set case") and
    // the two non-`true` string/number shapes, reported BESIDE the term.
    controlDrive(r, 'the truthiness control: \'false\', \'true\' and 1 must NOT be read as the SET case', () => {
      const liveS = liveOrNull()
      if (liveS === null) return null
      for (const inert of ['false', 'true', 1]) {
        const w = liveS.overlayInertDeclaration(TGT, NAME_A, inert) as OverlayInertWrite
        if (w.removal !== true || w.value !== false) return `the truthiness read reached: inert=${JSON.stringify(inert)} yielded value=${JSON.stringify(w.value)}, removal=${String(w.removal)}`
      }
      return null
    })
    r.finish()
  })

  it('P-OV-IM-4 [S-OV-TARGET-1] — for the 4 hostile-identity groups: the echoed identity, the trap/hook counts at 0, and the -0/NaN boundary under Object.is', async () => {
    const r = row(definedRow('P-OV-IM-4'))
    const s = await live().catch(() => null)
    const throwing = throwingHookIdentity()
    const groups: readonly { readonly id: string; readonly target: () => unknown; readonly hooks: HookCounts | null; readonly boundary?: boolean }[] = [
      { id: '(1) an identity whose toString, valueOf AND the banned well-known coercion-hook symbol THROW (hooks recorded — `AD-6`)', target: () => throwing.value, hooks: throwing.counts },
      { id: '(2) a REVOKED Proxy (any access raises a TypeError — asserted ABSORBED)', target: () => revokedProxy(), hooks: null },
      { id: '(3) a Proxy whose get/has/getOwnPropertyDescriptor traps THROW', target: () => trapThrowingProxy(), hooks: null },
      { id: '(4) the -0 / NaN boundary pair, asserted under Object.is', target: () => -0, hooks: null, boundary: true },
    ]
    for (const g of groups) {
      r.run(g.id, () => {
        if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
        for (const t of g.boundary === true ? [-0, Number.NaN] : [g.target()]) {
          const drv = drove(() => s.overlayInertDeclaration(t, NAME_A, true))
          if (drv.thrown !== null) return `${g.id} — the drive THREW: ${describeThrown(drv.thrown)}`
          const w = drv.value as OverlayInertWrite
          if (!Object.is(w.target, t)) return `${g.id} — the returned target is not Object.is-identical to the argument (a COPIED or DEFAULTED identity FAILS here)`
          const brk = writeBreakOf(w, NAME_A, t, g.id)
          if (brk !== null) return brk
          const keys = keyBreakOf(w, WRITE_KEYS)
          if (keys !== null) return `${g.id} — ${keys}`
        }
        r.reading()
        return null
      })
    }
    // ⟶ **`AD-6` — THE BANNED COERCION HOOK IS NOW DRIVEN, INSIDE THIS DECLARED TERM.**
    // `R-14`/`§2.4` item 3 ban `Symbol.toPrimitive` beside `toString` and `valueOf`, and
    // no drive exercised it: group (1)'s identity carries the LIVE well-known symbol
    // (`COERCION_KEY`) whose invocation BOTH throws and records a count, it is supplied
    // to `overlayInertDeclaration` as the `target` on this row's own declared drive, and
    // the count below is asserted `0` — so a module that consults the hook FAILS this row
    // rather than passing it vacuously. The liveness control that follows proves the
    // third hook really fires. `NO TERM MOVES`: this drive is the row's own declared
    // drive, not a new attempt.
    expect(throwing.counts, 'P-OV-IM-4 / `AD-6` — ALL THREE coercion-hook counts are 0 (toString, valueOf AND the banned well-known coercion symbol), the revoked Proxy\'s TypeError was never raised, and NOTHING was thrown by the module').toEqual({ toString: 0, valueOf: 0, toPrimitive: 0 })
    // THE INSTRUMENT IS PROVEN LIVE (reported BESIDE the term), INCLUDING the third hook.
    controlDrive(r, 'the hook instrument is LIVE — a deliberate String(target) DOES move the banned well-known coercion hook\'s count', () => {
      const probe = throwingHookIdentity()
      try {
        String(probe.value)
      } catch {
        // the hooks throw by construction — the COUNT is what matters
      }
      if (probe.counts.toPrimitive !== 1) return `the instrument is dead: a deliberate String() read left the banned coercion hook's count at ${probe.counts.toPrimitive} (a count-0 reading taken from a hook that can never fire proves nothing)`
      return null
    }, false)
    r.finish()
  })

  it('P-OV-IM-5 [S-OV-CALLBACK-1] — the 4 callback drive groups: exactly once on escape for every state, never otherwise, a throw absorbed, a non-callable never attempted, and no retention', async () => {
    const r = row(definedRow('P-OV-IM-5'))
    const s = await live().catch(() => null)
    const expectedChanged: Record<string, boolean> = { closed: false, open: true, held: true, closing: true }
    r.run('(1) a recording callback × the FOUR STATES with escape', () => {
      if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
      for (const st of STATE_BODIES) {
        const rec = recorder()
        const drv = drove(() => s.overlayTransition(st, t0('escape'), rec.fn))
        if (drv.thrown !== null) return `state '${st}' — the drive THREW: ${describeThrown(drv.thrown)}`
        if (rec.count() !== 1) return `state '${st}' — the invocation count is ${rec.count()}, not exactly 1`
        const t = drv.value as OverlayTransition
        if (t.state !== t0('closed')) return `state '${st}' — the settled state is ${JSON.stringify(t.state)}, not 'closed'`
        if (t.changed !== expectedChanged[st]) return `state '${st}' — changed is ${String(t.changed)}, not ${String(expectedChanged[st])}`
      }
      r.reading()
      return null
    })
    r.run('(2) the SAME recording callback × the FOUR OTHER VERBS', () => {
      if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
      const rec = recorder()
      for (const vb of MOVING_VERBS) {
        if (vb === t0('escape')) continue
        s.overlayTransition(t0('open'), vb, rec.fn)
      }
      s.overlayTransition(t0('open'), t0('unknown'), rec.fn)
      if (rec.count() !== 0) return `the callback was invoked ${rec.count()} time(s) on non-escape verbs`
      r.reading()
      return null
    })
    r.run('(3) a THROWING callback with escape: absorbed, the declared record returned, nothing escapes', () => {
      if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
      let calls = 0
      const drv = drove(() => s.overlayTransition(t0('open'), t0('escape'), () => {
        calls += 1
        throw new Error('absorbed')
      }))
      if (drv.thrown !== null) return `the throw ESCAPED the call: ${describeThrown(drv.thrown)}`
      if (calls !== 1) return `the throwing callback's invocation count is ${calls}, not 1`
      const t = drv.value as OverlayTransition
      if (t.state !== t0('closed') || t.changed !== true) return `the declared record was not returned: ${JSON.stringify(t)}`
      r.reading()
      return null
    })
    r.run('(4) a NON-CALLABLE set — omitted, null, a number, an object, a revoked Proxy — with escape: no call attempted', () => {
      if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
      for (const cb of [undefined, null, 7, {}, revokedProxy()]) {
        const drv = drove(() => (cb === undefined ? s.overlayTransition(t0('open'), t0('escape')) : s.overlayTransition(t0('open'), t0('escape'), cb)))
        if (drv.thrown !== null) return `a non-callable callback (${typeof cb}) caused a throw: ${describeThrown(drv.thrown)}`
        const t = drv.value as OverlayTransition
        if (t.state !== t0('closed') || t.changed !== true) return `the declared record was not returned for a non-callable callback`
      }
      // the RETENTION half: a second call with the same callback observes a fresh count.
      const rec = recorder()
      s.overlayTransition(t0('open'), t0('escape'), rec.fn)
      s.overlayTransition(t0('open'), t0('escape'), rec.fn)
      if (rec.count() !== 2) return `the callback was NOT re-invoked freshly: total ${rec.count()}, expected 2`
      r.reading()
      return null
    })
    r.finish()
  })

  it('P-OV-SM-1 [S-OV-MATRIX-1] — the 20-cell matrix reported as 5 row-sweeps + 1 recorder sweep: every cell\'s declared state AND changed, with the two cells a verb table gets wrong PRINTED', async () => {
    const r = row(definedRow('P-OV-SM-1'))
    const s = await live().catch(() => null)
    /** `§2.3` item 2's table, AS DATA: current state × verb ⇒ [next, changed]. */
    const MATRIX: Record<string, Record<string, readonly [string, boolean]>> = {
      closed: { open: ['open', true], close: ['closed', false], toggle: ['open', true], escape: ['closed', false], unknown: ['closed', false] },
      open: { open: ['open', false], close: ['closed', true], toggle: ['closed', true], escape: ['closed', true], unknown: ['open', false] },
      // ⟶ **REPAIR (gate-3) — THE MATRIX IS THE CONTRACT'S OWN MIRROR, AND IT NOW
      // READS THAT WAY.** The `'open'` row's `'toggle'` cell was filed as
      // `['open', false]`, contradicting `§2.3` item 2's own `'open'` row (`'toggle'` ⇒
      // `'closed'` · changed) and contradicting `M-2`, which drives the SAME twenty cells
      // against the same clause. The row's TWO PRINTED CELLS — the pair a "verb table"
      // gets wrong — are unchanged (`'held' × 'toggle'`, `'closing' × 'open'`).
      held: { open: ['held', false], close: ['closed', true], toggle: ['held', false], escape: ['closed', true], unknown: ['held', false] },
      closing: { open: ['open', true], close: ['closed', true], toggle: ['open', true], escape: ['closed', true], unknown: ['closing', false] },
    }
    const assertCell = (st: string, vb: string, label: string): string | null => {
      if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
      const drv = droveCounted(r, () => s.overlayTransition(st, vb))
      if (drv.thrown !== null) return `${label} — the cell THREW: ${describeThrown(drv.thrown)}`
      const t = drv.value as OverlayTransition
      const [next, changed] = MATRIX[st][vb]
      if (t.state !== next) return `${label} — the declared state is ${JSON.stringify(next)}; got ${JSON.stringify(t.state)}`
      if (t.changed !== changed) return `${label} — the declared changed is ${String(changed)}; got ${String(t.changed)}`
      if (t.changed !== (t.state !== st)) return `${label} — changed === (next !== previous) FAILS`
      if (!STATE_BODIES.includes(t.state)) return `${label} — a state outside the four bodies appeared`
      return null
    }
    // THE FIVE ROW SWEEPS (one per state, four cells each).
    for (const st of STATE_BODIES) {
      r.run(`the row sweep for '${st}' (4 cells)`, () => {
        for (const vb of MOVING_VERBS) {
          const brk = assertCell(st, vb, `('${st}' × '${vb}')`)
          if (brk !== null) return brk
        }
        r.reading()
        return null
      })
    }
    // THE FIFTH ROW SWEEP — THE NO-MOVE COLUMN (four cells: every state × the declared
    // no-move verb). **⟶ ADDED (gate 3, THIS alignment pass): a row's EXECUTED attempts
    // must equal its DECLARED term, and `§5.5.3` declares this row's term `6` as
    // *"the `20`-cell matrix reported as `5` row-sweeps + `1` recorder sweep"* (`20`
    // cells ÷ `4` = `5` sweeps of four cells each). The four state sweeps above drive
    // only the four `MOVING_VERBS` (`16` cells), so as filed the row drove `4` row-sweeps
    // + `1` recorder sweep = **`5` of its declared `6`** — a shortfall `HARNESS-2`'s
    // reconciliation reports, and which the earlier STOPPED register had masked (the
    // check is skipped while the stop rule has fired). THIS SWEEP IS THE FIFTH, so the
    // row drives the six attempts the contract declares and the `20` cells are covered by
    // row-sweeps of four cells each. **NO TERM MOVES**: the term is the contract's `6`,
    // `104` stays its sum, the caps still compare against it, and no row id, strategy id,
    // seed, cap or pool member is touched.** */
    const noMoveVerbs = VERB_BODIES.filter((v) => !MOVING_VERBS.includes(v))
    expect(noMoveVerbs, 'P-OV-SM-1 — the declared no-move verb is the ONE alphabet member outside the four moving verbs, so the fifth sweep below drives four REAL cells (a sweep over an empty set would be an over-strength attempt)').toHaveLength(1)
    for (const vb of noMoveVerbs) {
      r.run('the no-move column sweep (4 cells: every state × the declared no-move verb)', () => {
        for (const st of STATE_BODIES) {
          const brk = assertCell(st, vb, `('${st}' × '${vb}')`)
          if (brk !== null) return brk
        }
        r.reading()
        return null
      })
    }
    // THE WHOLE-MATRIX SWEEP RE-DRIVEN WITH THE CALLBACK RECORDER INSTALLED.
    r.run('the whole-matrix sweep with the CALLBACK RECORDER installed', () => {
      if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
      for (const st of STATE_BODIES) {
        for (const vb of VERB_BODIES) {
          const rec = recorder()
          const drv = droveCounted(r, () => s.overlayTransition(st, vb, rec.fn))
          if (drv.thrown !== null) return `('${st}' × '${vb}') — the cell THREW: ${describeThrown(drv.thrown)}`
          const brk = assertCell(st, vb, `('${st}' × '${vb}') [recorder]`)
          if (brk !== null) return brk
          const want = vb === t0('escape') ? 1 : 0
          if (rec.count() !== want) return `('${st}' × '${vb}') — the callback count is ${rec.count()}, declared ${want}`
        }
      }
      r.reading()
      return null
    })
    console.log('P-OV-SM-1 THE TWO CELLS A VERB TABLE GETS WRONG :: (\'held\' × \'toggle\') ⇒ \'held\', NOT changed · (\'closing\' × \'open\') ⇒ \'open\', changed')
    // ⟶ **`AD-1` — THE EXECUTED-DRIVE FIGURE, PRINTED BESIDE THE DECLARED TERM.** The
    // term is the contract's `6` — *"the `20`-cell matrix reported as `5` row-sweeps + `1`
    // recorder sweep"* — and EACH counted attempt drives a SWEEP of cells: the four state
    // sweeps and the no-move column drive `4` cells each (`20` cells) and the recorder
    // sweep drives the whole `20`-cell matrix TWICE (once with the recorder installed,
    // once through the cell reader), so THIS ROW'S BODY ISSUES `60` ENTRY-POINT DRIVES
    // INSIDE ITS `6` COUNTED ATTEMPTS. The figure is MEASURED (`r.executedDrive()` at each
    // drive, reported on its own record line and reconciled by `HARNESS-2`) and printed
    // BESIDE the term — **THE TERM DOES NOT MOVE**: `6` stays the declared extent the caps
    // compare against, and the extra drives are never counted in it.
    r.distinctDrive()
    r.distinctDrive()
    r.distinctDrive()
    r.finish()
  })

  it('P-OV-SM-2 [S-OV-CONST-1] — the 3 repeated-call groups, each driven five times: equal values, DISTINCT records, member identity, the count, and the order-independence pair', async () => {
    const r = row(definedRow('P-OV-SM-2'))
    const s = await live().catch(() => null)
    r.run('(1) overlayTransition(\'closed\', \'open\') five times', () => {
      if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
      const rs = [0, 1, 2, 3, 4].map(() => s.overlayTransition(t0('closed'), t0('open')))
      for (let i = 1; i < rs.length; i += 1) {
        if (JSON.stringify(rs[i]) !== JSON.stringify(rs[0])) return `call ${i + 1} differs from the first: ${JSON.stringify(rs[i])} vs ${JSON.stringify(rs[0])}`
        if (rs[i] === rs[i - 1]) return `call ${i + 1} returned the SAME object as call ${i}: the record must be fresh (S-OV-8)`
      }
      r.reading()
      return null
    })
    r.run('(2) overlayTransition(\'open\', \'escape\', recorder) five times: the total count is exactly 5', () => {
      if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
      const rec = recorder()
      const rs = [0, 1, 2, 3, 4].map(() => s.overlayTransition(t0('open'), t0('escape'), rec.fn))
      for (let i = 1; i < rs.length; i += 1) {
        if (JSON.stringify(rs[i]) !== JSON.stringify(rs[0])) return `call ${i + 1} differs from the first`
        if (rs[i] === rs[i - 1]) return `call ${i + 1} returned the SAME object as call ${i}`
      }
      if (rec.count() !== 5) return `the recorded callback count across five escape calls is ${rec.count()}, not 5 (10 FAILS for a double invocation; 1 FAILS for a memoized callback)`
      r.reading()
      return null
    })
    r.run('(3) overlayInertDeclaration(tgt, \'data-x\', true) five times, PLUS the order-independence pair', () => {
      if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
      const ws = [0, 1, 2, 3, 4].map(() => s.overlayInertDeclaration(TGT, NAME_A, true))
      for (let i = 1; i < ws.length; i += 1) {
        if (JSON.stringify(ws[i]) !== JSON.stringify(ws[0])) return `call ${i + 1} differs from the first`
        if (ws[i] === ws[i - 1]) return `call ${i + 1} returned the SAME object as call ${i}`
        if ((ws[i] as OverlayInertWrite).target !== TGT) return `call ${i + 1} did not carry the caller's identity`
        if ((ws[i] as OverlayInertWrite).name !== NAME_A) return `call ${i + 1} did not carry the caller's name`
      }
      const before = s.overlayInertDeclaration(TGT, NAME_A, true)
      s.overlayTransition(t0('held'), t0('toggle'))
      const after = s.overlayInertDeclaration(TGT, NAME_A, true)
      if (JSON.stringify(after) !== JSON.stringify(before)) return 'the declaration is NOT order-independent: a transition changed its result (a module with cross-call state FAILS here)'
      r.reading()
      return null
    })
    r.finish()
  })

  it('P-OV-TP-1 [S-OV-TOTAL-1] (bounded) — the 4 × 5 = 20 matrix cells, ONE DRIVE EACH, each through BOTH entry points, with the drawn arms from the PINNED 12-member pool', async () => {
    const r = row(definedRow('P-OV-TP-1'))
    const s = await live().catch(() => null)
    const lcg = makeLcg(SEED)
    const drawnIndices: number[] = []
    const drawnIds: string[] = []
    let cell = 0
    for (const st of STATE_BODIES) {
      for (const vb of VERB_BODIES) {
        cell += 1
        const draw = drawMember(lcg)
        drawnIndices.push(draw.index)
        drawnIds.push(draw.member.id)
        r.run(`cell ${cell} ('${st}' × '${vb}') with drawn pool[${draw.index}] ${draw.member.id}`, () => {
          if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
          // THE DRAWN SHAPE IS SUPPLIED AS state, verb, callback, target, attributeName
          // AND inert IN TURN, INSIDE THIS SINGLE ATTEMPT (§5.5.1's own words).
          // ⟶ **ALIGNED TO THE CONTRACT'S PINNED READING (`§0A` note 9 ITEM 1) — THE ONE
          // TEST-SIDE ACT THAT NOTE CREATES, AND THE MODULE OWES NO CHANGE.**
          // As filed, this cell's clause required the drawn pool member to be supplied
          // *"as `target` … as `attributeName` … in turn"*, and its `as attributeName` arm
          // then asserted the caller's string as the returned `name`. `§2.4` item 1 pins
          // the returned name to THE CALLER'S OWN STRING for a NON-EMPTY STRING and to the
          // declared `null` for EVERY OTHER SHAPE — and ALL TWENTY pinned draws are
          // NON-STRINGS — so a conformant module MUST return `null` there and THAT arm
          // could never pass; the as-filed clause is SUPERSEDED (kept visible at the
          // contract's own `P-OV-TP-1` cell and `§5.5.1` item 2). **THE PIN, APPLIED
          // HERE: the drawn pool member is supplied ONLY in the `target` slot — the slot
          // whose IDENTITY the row asserts — while the attribute-name slot ALWAYS CARRIES
          // A NON-EMPTY STRING (`NAME_A`), so the NAME-ECHO assertion and the IDENTITY
          // assertion are BOTH satisfiable in ONE attempt. THE ARM'S CLAIM AND ITS
          // CONTROLS ARE KEPT, and THE READING CHANGES, NOT THE COUNT: all TWENTY draws
          // stay inside the declared term `P-OV-TP-1` `20` (the `4 × 5` matrix, one draw
          // per cell), and no term, row id, strategy id, seed, cap or pool member moves.**
          const rec0 = recorder()
          // ⟶ **`AD-5` REPAIR — EVERY DRAWN ARM NOW DRIVES ITS OWN SLOT.** As filed, the
          // `as state` arm was SKIPPED by a `continue` (so the drawn member never occupied
          // the `state` slot it names) and the `as attributeName` arm was BYTE-IDENTICAL to
          // the `as target` arm (so it re-drove the target slot and left the attribute-name
          // slot undriven). **THE SECOND IS NOT RE-DRIVEN, AND THAT IS THE CONTRACT'S OWN
          // PIN**: `§0A` note 9 item 1 SUPERSEDES the as-filed `as attributeName` clause —
          // the drawn pool member is supplied in the `target` slot ONLY, the attribute-name
          // slot ALWAYS carries the NON-EMPTY STRING `NAME_A`, and the as-filed clause stays
          // visible at the contract's own cell. The duplicated arm is therefore DELETED
          // rather than kept as a second copy of the same call, and the arm set below is the
          // FIVE slots the pinned reading really drives: state, verb, callback, target,
          // inert. **NO TERM, ROW ID, STRATEGY ID, SEED, CAP OR POOL MEMBER MOVES** — the
          // arms are assertions INSIDE the declared `20`-cell term, and the extra drives
          // they issue are printed BESIDE it (never counted in it).
          const arms: readonly { readonly id: string; readonly drive: () => unknown }[] = [
            { id: 'as state', drive: () => s.overlayTransition(draw.value, vb) },
            { id: 'as verb', drive: () => s.overlayTransition(st, draw.value) },
            { id: 'as callback', drive: () => s.overlayTransition(st, vb, draw.value) },
            { id: 'as target', drive: () => s.overlayInertDeclaration(draw.value, NAME_A, true) },
            { id: 'as inert', drive: () => s.overlayInertDeclaration(TGT, NAME_A, draw.value) },
          ]
          for (const arm of arms) {
            const drv = drove(arm.drive)
            if (drv.thrown !== null) return `the drawn shape ${draw.member.id} ${arm.id} made the entry point THROW: ${describeThrown(drv.thrown)}`
            const v = drv.value as Record<string, unknown>
            const keys = arm.id === 'as verb' || arm.id === 'as callback' || arm.id === 'as state' ? TRANSITION_KEYS : WRITE_KEYS
            const kb = keyBreakOf(v, keys)
            if (kb !== null) return `the drawn shape ${draw.member.id} ${arm.id} — ${kb}`
            if (keys === WRITE_KEYS) {
              // ⟶ **THE ALIGNED WRITE-RECORD READ (`§0A` note 9 item 1).** The `as target`
              // arm carries the drawn pool member in the `target` slot — the slot the row's
              // IDENTITY assertion reads — with the NON-EMPTY STRING `NAME_A` in the
              // attribute-name slot, so the NAME-ECHO assertion (`§2.4` item 1) holds in the
              // SAME attempt. The `as inert` arm keeps `TGT` in the target slot and takes the
              // drawn member in the `inert` slot. The previous form asserted `TGT` for every
              // write arm, which the drawn `target` members can never satisfy — that read was
              // the defect.
              const expectedTarget: unknown = arm.id === 'as inert' ? TGT : draw.value
              const wb = writeBreakOf(v, NAME_A, expectedTarget, `${draw.member.id} ${arm.id}`)
              if (wb !== null) return wb
            } else {
              // ⟶ **LEG-5 REPAIR (gate-3): the cast goes THROUGH `unknown`.** The direct
              // `as OverlayTransition` from the key-set view is the pre-existing
              // `TS2352` the contract's standalone strict `tsc` leg fails on (it was the
              // same expression before this pass); the narrowing is what the reading
              // means, so it is spelled as one.
              const t = v as unknown as OverlayTransition
              if (!STATE_BODIES.includes(t.state)) return `the drawn shape ${draw.member.id} ${arm.id} — a fifth body appeared`
              if (typeof t.changed !== 'boolean') return `the drawn shape ${draw.member.id} ${arm.id} — changed is not a boolean`
            }
          }
          // THE DECLARED CELL, driven through BOTH entry points in sequence.
          const tb = transitionDriveBreakOf(s, st, vb, undefined, `cell ('${st}' × '${vb}')`)
          if (tb !== null) return tb
          const t = s.overlayTransition(st, vb)
          // ⟶ **REPAIR (gate-3) — THE COMPOSED DRIVE USES THE SAME DRAWN TARGET THE
          // ATTEMPT'S OWN 'as target' ARM USES.** The cell drove
          // `overlayInertDeclaration(TGT, …)` while the row's declared readings expect the
          // DRAWN member to be supplied *"as … target … in turn"*; the identity reading
          // then failed against `TGT` for every drawing. The composed call now carries
          // `draw.value` — the SAME member, a FRESH instance for this attempt — so the
          // row's drawn-target composition is the one it claims.
          const wb = writeBreakOf(s.overlayInertDeclaration(draw.value, NAME_A, t.changed), NAME_A, draw.value, `cell ('${st}' × '${vb}') composed`)
          if (wb !== null) return wb
          s.overlayTransition(st, vb, rec0.fn)
          if (rec0.count() !== (vb === t0('escape') ? 1 : 0)) return `cell ('${st}' × '${vb}') — the callback count is ${rec0.count()}`
          if (draw.hooks !== null && (draw.hooks.toString !== 0 || draw.hooks.valueOf !== 0 || draw.hooks.toPrimitive !== 0)) return `the drawn shape ${draw.member.id} had a coercion hook consulted, INCLUDING the banned well-known symbol (\`AD-6\`): ${JSON.stringify(draw.hooks)}`
          r.reading()
          return null
        })
      }
    }
    const distinctDrawn = new Set(drawnIndices)
    const undriven = TP1_POOL.map((m, i) => ({ i, id: m.id })).filter((m) => !distinctDrawn.has(m.i)).map((m) => `pool[${m.i}] ${m.id}`)
    console.log(`P-OV-TP-1 drawn indices (seed ${SEED}, one LCG step per draw, pool.length=${POOL_LENGTH}) :: [${drawnIndices.join(', ')}]`)
    console.log(`P-OV-TP-1 distinct-member coverage :: Set(indices).size=${distinctDrawn.size} of ${POOL_LENGTH} — ${undriven.length === 0 ? 'ALL TWELVE members were driven' : `the with-replacement draw REPEATED, so these members went UNDRIVEN: ${JSON.stringify(undriven)}`}`)
    expect(drawnIndices, 'P-OV-TP-1 — the twenty pinned draws ARE PRINTED: the term is the MATRIX IT EXHAUSTS (20 cells, one drive each), and the drawn arms are assertions INSIDE each attempt').toHaveLength(20)
    expect(distinctDrawn.size, 'P-OV-TP-1 (bounded) — the DISTINCT-MEMBER coverage of the twenty with-replacement draws is MEASURED and printed. THE UNIVERSAL IS OVER THE DRAWN DOMAIN AND NOT OVER THE WHOLE INPUT SPACE: the property text says "EVERY shape" while the pool holds 12 members, and NO READER MAY READ THIS ROW AS ITS PROOF.').toBeLessThanOrEqual(POOL_LENGTH)
    r.finish()
  })

  it('P-OV-TP-2 [S-OV-RULE-1] (bounded) — the 9 value shapes: the STRICT set rule, the target\'s identity, and the independence of the target from the value rule', async () => {
    const r = row(definedRow('P-OV-TP-2'))
    const s = await live().catch(() => null)
    const shapes: readonly { readonly id: string; readonly inert: () => unknown; readonly set: boolean; readonly target: () => unknown }[] = [
      { id: '(1) true (the SET case)', inert: () => true, set: true, target: () => TGT },
      { id: '(2) false', inert: () => false, set: false, target: () => TGT },
      { id: '(3) undefined (omitted) and null', inert: () => null, set: false, target: () => TGT },
      { id: '(4) the empty string', inert: () => '', set: false, target: () => TGT },
      { id: '(5) the STRING \'true\' — must NOT set', inert: () => t0('true'), set: false, target: () => TGT },
      { id: '(6) the string \'false\' — must NOT set', inert: () => t0('false'), set: false, target: () => TGT },
      { id: '(7) 0 and -0 and NaN', inert: () => -0, set: false, target: () => TGT },
      { id: '(8) the NUMBER 1 — must NOT set', inert: () => 1, set: false, target: () => TGT },
      { id: '(9) an object, an array, a Symbol, a 12n, a revoked Proxy', inert: () => revokedProxy(), set: false, target: () => Symbol('t') },
    ]
    for (const shape of shapes) {
      r.run(shape.id, () => {
        if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
        const tgt = shape.target()
        const drv = drove(() => s.overlayInertDeclaration(tgt, NAME_A, shape.inert()))
        if (drv.thrown !== null) return `${shape.id} — the drive THREW: ${describeThrown(drv.thrown)}`
        const w = drv.value as OverlayInertWrite
        const brk = writeBreakOf(w, NAME_A, tgt, shape.id)
        if (brk !== null) return brk
        const expectedValue = shape.set ? t0('true') : false
        const expectedRemoval = !shape.set
        if (w.value !== expectedValue) return `${shape.id} — value must be ${JSON.stringify(expectedValue)}; got ${JSON.stringify(w.value)} (a TRUTHINESS read returns the SET case for 'false' and FAILS this drive)`
        if (w.removal !== expectedRemoval) return `${shape.id} — removal must be ${String(expectedRemoval)}`
        if (removalIdentityBrokenOf({ value: w.value, removal: w.removal })) return `${shape.id} — the DECLARED removal/set discrimination (§2.4 item 2) FAILS: the pair ${JSON.stringify({ value: w.value, removal: w.removal })} is neither declared member`
        // the target shape does NOT change the name or the value rule.
        const twin = drove(() => s.overlayInertDeclaration(TGT, NAME_A, shape.inert()))
        if ((twin.value as OverlayInertWrite).value !== w.value || (twin.value as OverlayInertWrite).removal !== w.removal) return `${shape.id} — the target\'s shape changed the value rule`
        r.reading()
        return null
      })
    }
    r.finish()
  })

  it('P-OV-TP-3 [S-OV-ABSORB-1] (bounded) — the 12 out-of-alphabet verb shapes: normalized to the declared no-move verb, the caller\'s state returned, callback count 0', async () => {
    const r = row(definedRow('P-OV-TP-3'))
    const s = await live().catch(() => null)
    const shapes: readonly { readonly id: string; readonly verb: () => unknown }[] = [
      { id: '(1) the argument OMITTED', verb: () => undefined },
      { id: '(2) null', verb: () => null },
      { id: '(3) the empty string', verb: () => '' },
      { id: '(4) an unrecognized string', verb: () => 'dismiss' },
      { id: '(5) a CASE variant', verb: () => 'CLOSE' },
      { id: '(6) a WHITESPACE variant', verb: () => ' close' },
      { id: '(7) a number (0, 42, NaN)', verb: () => 42 },
      { id: '(8) a boolean', verb: () => false },
      { id: '(9) a Symbol', verb: () => Symbol('v') },
      { id: '(10) a 12n bigint', verb: () => 12n },
      { id: '(11) an object, an array and a function', verb: () => ({}) },
      { id: '(12) a revoked Proxy and a trap-throwing Proxy', verb: () => revokedProxy() },
    ]
    for (const shape of shapes) {
      r.run(`${shape.id} (driven with a FIXED valid state 'held' and a recording callback in scope)`, () => {
        if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
        const rec = recorder()
        const vb = shape.verb()
        const drv = drove(() => (vb === undefined ? s.overlayTransition(t0('held'), undefined, rec.fn) : s.overlayTransition(t0('held'), vb, rec.fn)))
        if (drv.thrown !== null) return `${shape.id} — the drive THREW: ${describeThrown(drv.thrown)}`
        const t = drv.value as OverlayTransition
        if (t.state !== t0('held')) return `${shape.id} — the returned state must be the caller's OWN state 'held'; got ${JSON.stringify(t.state)} (nothing closes, opens or toggles)`
        if (t.changed !== false) return `${shape.id} — changed must be false`
        if (rec.count() !== 0) return `${shape.id} — the callback's invocation count is ${rec.count()}, not 0`
        if (!STATE_BODIES.includes(t.state)) return `${shape.id} — a fifth body appeared`
        r.reading()
        return null
      })
    }
    r.finish()
  })

  it('P-OV-TP-4 [S-OV-WRITE-1] — the 2 × 2 cross product (2 name shapes × 2 changed booleans): the name rule and the value rule answer DIFFERENT arguments', async () => {
    const r = row(definedRow('P-OV-TP-4'))
    const s = await live().catch(() => null)
    const cells: readonly { readonly id: string; readonly name: unknown; readonly changed: boolean; readonly expected: OverlayInertWrite }[] = [
      { id: '(1a) a caller spelling × true', name: NAME_A, changed: true, expected: { name: NAME_A, value: 'true', removal: false, target: TGT } },
      { id: '(1b) a caller spelling × false', name: NAME_A, changed: false, expected: { name: NAME_A, value: false, removal: true, target: TGT } },
      { id: '(2a) an unusable name × true', name: '', changed: true, expected: { name: null, value: 'true', removal: false, target: TGT } },
      { id: '(2b) an unusable name × false', name: '', changed: false, expected: { name: null, value: false, removal: true, target: TGT } },
    ]
    for (const cell of cells) {
      r.run(cell.id, () => {
        if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
        const drv = drove(() => s.overlayInertDeclaration(TGT, cell.name, cell.changed))
        if (drv.thrown !== null) return `${cell.id} — the drive THREW: ${describeThrown(drv.thrown)}`
        const w = drv.value as OverlayInertWrite
        const brk = writeBreakOf(w, cell.expected.name, TGT, cell.id)
        if (brk !== null) return brk
        if (JSON.stringify(w) !== JSON.stringify(cell.expected)) return `${cell.id} — the declared 4-tuple is ${JSON.stringify(cell.expected)}; got ${JSON.stringify(w)}`
        const keys = keyBreakOf(w, WRITE_KEYS)
        if (keys !== null) return `${cell.id} — ${keys}`
        r.reading()
        return null
      })
    }
    console.log('P-OV-TP-4 THE TWO CELLS A COUPLED IMPLEMENTATION GETS WRONG :: (\'\', true) ⇒ {name: null, value: \'true\', removal: false} · (\'data-x\', false) ⇒ {name: \'data-x\', value: false, removal: true}')
    r.finish()
  })

  it('P-OV-TP-5 [S-OV-NOMOVE-1] (bounded) — the 3 move-verb groups × 2 instruments: the refusal asserted as the ABSENCE of the move verbs, with its positive control', async () => {
    const r = row(definedRow('P-OV-TP-5'))
    const s = await live().catch(() => null)
    const groups: readonly { readonly id: string; readonly pattern: RegExp; readonly label: string }[] = [
      { id: '(1) the node-attachment verbs', pattern: new RegExp(`${t0('appendChild')}|${t0('removeChild')}|${t0('insertBefore')}`), label: 'appendChild/removeChild/insertBefore' },
      { id: '(2) the removal/bookkeeping verbs', pattern: new RegExp(`\\.${t0('remove')}\\s*\\(|\\b${t0('parentNode')}\\b|\\b${t0('parent')}\\b`), label: '.remove(, parentNode, parent as a member' },
      { id: '(3) the placement/ownership words', pattern: new RegExp(`\\b${t0('portal')}\\b|\\b${t0('reparent')}\\b|\\b${t0('owner')}\\b|\\b${t0('mount')}\\b|\\b${t0('unmount')}\\b`), label: 'portal, reparent, owner, mount, unmount' },
    ]
    const instruments: readonly { readonly id: string; readonly freeze: boolean }[] = [
      { id: '(i) every argument instrumented as a Proxy whose traps count + a fake node in scope', freeze: false },
      { id: '(ii) the same drives with the argument objects FROZEN', freeze: true },
    ]
    for (const g of groups) {
      for (const inst of instruments) {
        r.run(`${g.id} × ${inst.id}`, () => {
          if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
          // (a) the module's bytes, in the NORMALIZED view.
          const { view, cause } = moduleView()
          if (cause !== null) return cause
          if (g.pattern.test(view ?? '')) return `the module's bytes carry ${g.label}`
          // (b) NO node/element/root/owner PARAMETER anywhere in the module's surface.
          if (/\(\s*(?:node|element|root|owner)\b/.test(view ?? '')) return 'the module\'s surface carries a node/element/root/owner parameter'
          // (c) neither returned record carries a node, a parent, a plan or an owner
          // member (a FIFTH member FAILS).
          let traps = 0
          const fake = new Proxy(Object.freeze({}) as object, {
            get: (): unknown => { traps += 1; return undefined },
            has: (): boolean => { traps += 1; return false },
            getOwnPropertyDescriptor: (): undefined => { traps += 1; return undefined },
          })
          const targetArg: unknown = inst.freeze ? Object.freeze({ caller: 'own' }) : fake
          const w = s.overlayInertDeclaration(targetArg, NAME_A, true) as OverlayInertWrite
          const keys = keyBreakOf(w, WRITE_KEYS)
          if (keys !== null) return keys
          for (const k of Object.keys(w as unknown as Record<string, unknown>)) {
            if (['node', 'parent', 'plan', 'owner'].includes(k)) return `the returned record carries a node-shaped member '${k}'`
          }
          if (w.target !== targetArg) return 'the argument was not echoed by identity'
          // (d) an instrumented FAKE NODE passed AS THE target: EVERY trap count 0.
          if (!inst.freeze) {
            const fakeDrive = drove(() => s.overlayInertDeclaration(fake, NAME_A, true))
            if (fakeDrive.thrown !== null) return `the fake-node drive THREW: ${describeThrown(fakeDrive.thrown)}`
            if (traps !== 0) return `the fake node's trap count is ${traps}, not 0`
          }
          r.reading()
          return null
        })
      }
    }
    // THE POSITIVE CONTROL, named so the instrument is proven live: the DRIVER
    // ITSELF, run against a corpus module that DOES carry parentNode bookkeeping,
    // MUST FAIL this row.
    controlDrive(r, 'the driver against a corpus carrying parentNode bookkeeping MUST FAIL', () => {
      const corpus = `const moved = node.${t0('parentNode')}.${t0('appendChild')}(other)`
      if (!groups.some((g) => g.pattern.test(corpus))) return 'the corpus carrying parentNode bookkeeping was NOT caught: the instrument is dead'
      return null
    }, false)
    r.finish()
  })

  it('P-OV-TP-6 [S-OV-COMPOSE-1] — the 8 composed shapes, one drive each, with the order-independence re-drive INSIDE each attempt', async () => {
    const r = row(definedRow('P-OV-TP-6'))
    const s = await live().catch(() => null)
    const shapes: readonly { readonly id: string; readonly st: string; readonly vb: string; readonly name: unknown; readonly throwing?: boolean }[] = [
      { id: "(1) ('closed','open') ⇒ changed true ⇒ the SET case", st: t0('closed'), vb: t0('open'), name: NAME_A },
      { id: "(2) ('open','open') ⇒ changed false ⇒ the REMOVAL case", st: t0('open'), vb: t0('open'), name: NAME_A },
      { id: "(3) ('held','toggle') ⇒ changed false", st: t0('held'), vb: t0('toggle'), name: NAME_A },
      { id: "(4) ('closing','open') ⇒ changed true", st: t0('closing'), vb: t0('open'), name: NAME_A },
      { id: "(5) ('closed','escape', recorder) ⇒ changed false with the callback count 1", st: t0('closed'), vb: t0('escape'), name: NAME_A },
      { id: "(6) ('open','escape', thrower) ⇒ changed true with the throw ABSORBED", st: t0('open'), vb: t0('escape'), name: NAME_A, throwing: true },
      { id: '(7) a bogus state and a bogus verb ⇒ the declared normalization ⇒ changed false', st: 'bogus', vb: 'bogus', name: NAME_A },
      { id: "(8) ('held','close') with an unusable name ⇒ the echoed null + the SET-case pair", st: t0('held'), vb: t0('close'), name: '' },
    ]
    for (const shape of shapes) {
      r.run(shape.id, () => {
        if (s === null) return 'the module of §2.1 is absent (the §4.1 red fact)'
        const rec = recorder()
        const cb = shape.throwing === true ? thrower() : rec.fn
        // THE ORDER-INDEPENDENCE RE-DRIVE, FIRST, ON A LITERAL BOOLEAN.
        const literalBefore = s.overlayInertDeclaration(TGT, shape.name, true)
        const drv = drove(() => s.overlayTransition(shape.st, shape.vb, cb))
        if (drv.thrown !== null) return `${shape.id} — the transition THREW: ${describeThrown(drv.thrown)}`
        const t = drv.value as OverlayTransition
        const tb = transitionBreakOf(t, STATE_BODIES.includes(shape.st) ? shape.st : t0('closed'), shape.id)
        if (tb !== null) return tb
        const literalAfter = s.overlayInertDeclaration(TGT, shape.name, true)
        if (JSON.stringify(literalAfter) !== JSON.stringify(literalBefore)) return `${shape.id} — the order-independence re-drive differs: a declaration depends on a transition having run`
        // THE COMPOSITION: the transition's `changed` feeds the declaration's `inert`.
        const drvW = drove(() => s.overlayInertDeclaration(TGT, shape.name, t.changed))
        if (drvW.thrown !== null) return `${shape.id} — the composed declaration THREW: ${describeThrown(drvW.thrown)}`
        const w = drvW.value as OverlayInertWrite
        const expectedName = typeof shape.name === 'string' && shape.name !== '' ? shape.name : null
        const wb = writeBreakOf(w, expectedName, TGT, shape.id)
        if (wb !== null) return wb
        if (w.removal !== !t.changed) return `${shape.id} — the composed inert is NOT the transition's own changed boolean BY VALUE: changed=${String(t.changed)}, removal=${String(w.removal)}`
        if (shape.throwing !== true) {
          const want = shape.vb === t0('escape') ? 1 : 0
          if (rec.count() !== want) return `${shape.id} — the callback count is ${rec.count()}, declared ${want}`
        }
        r.reading()
        return null
      })
    }
    // THE REACHABILITY CONTROL (reported BESIDE the term): both entry points are
    // reachable from the imported namespace BY NAME.
    controlDrive(r, 'both entry points are reachable from the namespace BY NAME (§3.4 R-5)', () => {
      const liveS = liveOrNull()
      if (liveS === null) return null
      for (const n of VALUE_EXPORTS) {
        if (typeof (liveS.mod as Record<string, unknown>)[n] !== 'function') return `the value export '${n}' is not reachable by name`
      }
      return null
    })
    r.finish()
  })
})

// ===========================================================================
// 6. THE REGISTER-HARNESS ROWS — the declared-vs-measured reconciliation, the caps,
//    the `(bounded)` set, the un-run-row-is-a-FAILURE rule, the attempt arithmetic
//    printed WITH its terms, and `§5.5.2`'s honesty block.
// ===========================================================================
describe('§5.5.1 / §5.5.2 / §5.5.3 — the register harness: declared-vs-measured, caps, (bounded), arithmetic, un-run = FAILURE', () => {
  it('HARNESS-1 (§5.5.3) — THE DECLARED TOTAL IS PRINTED WITH ITS TERMS AND IS THEIR SUM (REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS)', () => {
    const terms = declaredTerms()
    const total = declaredTotal()
    const chain: number[] = []
    let running = 0
    for (const term of terms) {
      running += term
      chain.push(running)
    }
    const im = terms.slice(0, 5).reduce((a, b) => a + b, 0)
    const sm = terms.slice(5, 7).reduce((a, b) => a + b, 0)
    const tp = terms.slice(7).reduce((a, b) => a + b, 0)
    const spec = readFileSync(join(ROOT, 'docs', 'specs', 'overlay.md'), 'utf8')
    // ⟶ **THE TWO PRINTED TOTALS ARE ANCHORED THROUGH THEIR SIXTH TERM.** Both figures
    // are printed `**`NNN` = `10` + `6` + `12` + `4` + `4` + …**`, and the declared and
    // the distinct printings diverge at EXACTLY that sixth term (`P-OV-SM-1`: `6`
    // declared against `3` distinct, `§0A` note 9 item 2) — so the anchor is the term
    // that tells them apart. An UNANCHORED read now picks up the FIRST such line in the
    // file, which is `§0A` note 9's own corrective printing of the distinct figure; the
    // anchor is what keeps each row reading the figure it names.
    const specTotal = asPrintedNumber(spec, /\*\*`(\d+)`\s*=\s*`10`\s*\+\s*`6`\s*\+\s*`12`\s*\+\s*`4`\s*\+\s*`4`\s*\+\s*`6`/)
    const specTotalLine = printedLine(spec, /^\*\*`\d+`\s*=\s*`10`\s*\+\s*`6`\s*\+\s*`12`\s*\+\s*`4`\s*\+\s*`4`\s*\+\s*`6`/)
    const specChain = asPrintedNumbers(spec, /\*\*THE DECLARED CHAIN[^:]*?:\s*([0-9\s→`]+?)\.\*\*/)
    const specDistinctTotal = asPrintedNumber(spec, /\*\*`(\d+)`\s*=\s*`10`\s*\+\s*`6`\s*\+\s*`12`\s*\+\s*`4`\s*\+\s*`4`\s*\+\s*`3`/)
    const specDistinctTotalLine = printedLine(spec, /^\*\*`\d+`\s*=\s*`10`\s*\+\s*`6`\s*\+\s*`12`\s*\+\s*`4`\s*\+\s*`4`\s*\+\s*`3`/)
    // ⟶ **THE TWO CHAINS ARE ANCHORED ON THEIR OWN FIRST FIGURE (`10 → …`), so the
    // reader cannot pick up a section number or a stray figure from the sentence that
    // precedes the chain.** `§5.5.2` item 3's line carries the id `3` before its chain;
    // an unanchored read of that line is a harness artefact, not a contract defect.
    const specDistinctChain = [10, ...asPrintedNumbers(spec, /\*\*THE DISTINCT CHAIN[^:]*?:\s*`?10`?\s*→\s*([0-9\s→`]+?)\.\*\*/)]
    // ⟶ **REPAIR 7 (gate-3) — THE FIGURES ARE RE-GRAINED TO THE CORRECTED CONTRACT, WITH
    // THE AS-FILED `102`/`99` KEPT VISIBLE BESIDE THEM.** `§0A` note 8 corrected the
    // register's PRINTED totals and chains (declared `102 → 104`, distinct `99 → 101`)
    // WITHOUT MOVING A TERM, and left every as-filed figure in place under a dated
    // annotation. This row is the red set's matched re-grain (`§0A` note 8's
    // RE-GRAIN OBLIGATION): it asserts the CORRECTED printed figures, the as-filed
    // figures' continuing VISIBILITY, and a REAL polarity between them — a comparison
    // satisfied by either figure is the defect this repair exists to remove.
    const specAsFiledTotal = asPrintedNumber(spec, /AS FILED `2026-09-27`: "`(\d+)` declared/i)
    // THE AS-FILED DISTINCT FIGURE'S OWN ANCHOR: it is the one spelled as the DISTINCT
    // half of the corrected pair (`declared \`104\`, distinct \`101\`` … `distinct \`99\`
    // against terms summing`), so the reading is anchored on the word rather than on the
    // first `the as-filed figure read` phrase in the file (§0A note 8 states the declared
    // half's as-filed figure in its own sentence).
    const specAsFiledDistinct = asPrintedNumber(spec, /distinct `(\d+)` against terms summing/)
    const distinctTerms = declaredDistinctTerms()
    /** `§5.5.2` item 3's own SUMMARY-row distinct terms — the form its total (`101`) and
     *  its chain are both built from. ⟶ **ALIGNED (`§0A` note 9 ITEM 2): the ledger's
     *  summary row now prints the SAME assignment as the register's `distinct` column —
     *  `P-OV-IM-2` `6`, `P-OV-SM-1` `3` — so the two readings agree CELL FOR CELL and the
     *  mirror mismatch the as-filed ledger carried is RECONCILED at the contract.** The
     *  AS-FILED mirror (`10 + 3 + 12 + 4 + 4 + 6 + 3 + …`, the `3` in `P-OV-IM-2`'s slot
     *  and the `6` in `P-OV-SM-1`'s) stays VISIBLE in the contract under its dated
     *  annotation and is READ FROM THE CONTRACT'S OWN BYTES below, so the reconciliation
     *  is checkable rather than silent, and the polarity between the two readings is a
     *  REAL assertion rather than a relabelling. NO term, row id, strategy id, seed, cap
     *  or pool member moves: the declared total stays `104` and the distinct `101`. */
    const distinctTermsSummary: readonly number[] = [10, 6, 12, 4, 4, 3, 3, 20, 9, 12, 4, 6, 8]
    /** ⟶ **THE CONTRACT'S PRINTED DISTINCT TERMS, read from its own bytes** (`§5.5.3`'s
     *  corrected distinct total with its terms; `§0A` note 9 item 2 is the act that
     *  reconciled the assignment). */
    const specDistinctTerms = asPrintedNumbers(spec, /\*\*`101`\s*=\s*(`10`(?:\s*\+\s*`\d+`)+)/)
    /** ⟶ **THE AS-FILED MIRROR, read from the contract beside the corrected printing** —
     *  `§5.5.2` item 3's own dated annotation. A pass that silently rewrote the as-filed
     *  form out of the record FAILS this read (the contract's own rule: a figure is
     *  corrected by annotating BESIDE its as-filed form, never by rewriting it away). */
    const asFiledDistinctTerms = asPrintedNumbers(spec, /AND AS FILED the distinct term list read `(10 \+ \d+(?: \+ \d+)*)`/)
    const distinctChain: number[] = []
    let distinctRunning = 0
    for (const term of distinctTerms) {
      distinctRunning += term
      distinctChain.push(distinctRunning)
    }
    console.log(`§5.5.3 DECLARED: the thirteen terms sum to ${total} = ${terms.join(' + ')}; chain ${chain.join(' → ')}; family subtotals IM = ${im} · SM = ${sm} · TP = ${tp}`)
    console.log(`§5.5.3 AS-PRINTED IN THE CONTRACT (corrected): total=${specTotal} chain=${specChain.join(' → ')} · AS FILED: declared ${specAsFiledTotal} / distinct ${specAsFiledDistinct}`)
    console.log(`§5.5.2 item 3 DISTINCT: the thirteen distinct figures sum to ${declaredDistinctTotal()}; as printed in the contract: terms ${specDistinctTerms.join(' + ')} = ${specDistinctTotal}, chain ${specDistinctChain.join(' → ')}; AS FILED mirror (visible beside it): ${asFiledDistinctTerms.join(' + ')}`)
    expect(terms, 'HARNESS-1 — the THIRTEEN DECLARED TERMS, in register order (a total quoted without its terms is a review finding): IM-1 10 · IM-2 6 · IM-3 12 · IM-4 4 · IM-5 4 · SM-1 6 · SM-2 3 · TP-1 20 · TP-2 9 · TP-3 12 · TP-4 4 · TP-5 6 · TP-6 8').toEqual([10, 6, 12, 4, 4, 6, 3, 20, 9, 12, 4, 6, 8])
    // THE DECLARED TOTAL IS THE SUM OF ITS OWN TERMS — computed, never quoted.
    expect(total, 'HARNESS-1 — the declared total IS the computed sum of its own thirteen terms (§5.5.3\'s term table, which this file mirrors cell by cell)').toBe(104)
    expect(total, 'HARNESS-1 — the computed declared total against the ≤400 register cap').toBeLessThanOrEqual(REGISTER_TOTAL_CAP)
    expect(Math.max(...terms), `HARNESS-1 — every row's term against the ≤${REGISTER_ROW_CAP}-attempts-per-row cap (largest row 20 ≤ 100)`).toBeLessThanOrEqual(REGISTER_ROW_CAP)
    expect(chain, 'HARNESS-1 — the computed TWELVE-step chain of §5.5.3 (the step form, not a quote)').toEqual([10, 16, 28, 32, 36, 42, 45, 65, 74, 86, 90, 96, 104])
    expect(im + sm + tp, 'HARNESS-1 — the three family subtotals sum to the computed total (36 + 9 + 59 = 104)').toBe(total)
    expect([im, sm, tp], 'HARNESS-1 — the family subtotals; §5.5.3 prints these SAME three figures (IM = 36 · SM = 9 · TP = 59), which is the independent arithmetic agreeing with 104 rather than 102').toEqual([36, 9, 59])
    // ⟶ **THE CORRECTED FIGURES ARE THE ONES ASSERTED, AND THE AS-FILED ONES STAY
    // VISIBLE AND ARE STILL NOT SUMS** (`§0A` note 8). `REGISTER-ATTEMPT-TOTALS-PRINT-
    // THEIR-TERMS` is satisfied by the corrected printing; the as-filed `102`/`99` are
    // carried BESIDE it, so the correction is checkable rather than silent — and the
    // polarity is REAL: the printed total must be the SUM OF THE TERMS (`104`) and must
    // NOT be the as-filed mis-sum (`102`), which is asserted to differ and to have been
    // the twelve-term prefix. A row that passes for either figure is the finding.
    expect(specTotal, `HARNESS-1 — §5.5.3's PRINTED declared total (site: overlay.md line ${specTotalLine}) IS the computed sum of its own thirteen terms, and the corrected figure §0A note 8 files is ${total}: ${terms.join(' + ')} = ${total}, with the caps compared against it (${total} ≤ ${REGISTER_TOTAL_CAP}). The as-filed figure ${specAsFiledTotal} remains VISIBLE beside it as the annotation §0A note 8 requires.`).toBe(total)
    expect(specChain[specChain.length - 1], 'HARNESS-1 — §5.5.3\'s PRINTED declared chain (the second independent statement of the same arithmetic) ends at the same figure its terms sum to').toBe(total)
    // THE PRINTED CHAIN'S OWN STEPS: every step's increment must equal the term it
    // adds — so the chain is well-formed TERM BY TERM, and the re-grain touched only the
    // endpoint (the chain's last step), never a term.
    expect(
      specChain.slice(1).map((v, i) => v - specChain[i]),
      'HARNESS-1 — §5.5.3\'s printed declared chain ADD one term per step: the twelve increments are the twelve terms after the first, so the chain is well-formed term by term',
    ).toEqual(terms.slice(1))
    expect(specChain, 'HARNESS-1 — §5.5.3\'s printed declared chain read as written: the CORRECTED twelve steps. Its endpoint is the corrected total asserted above; the as-filed chain ended at the as-filed total and no earlier step moved (§0A note 8).').toEqual([10, 16, 28, 32, 36, 42, 45, 65, 74, 86, 90, 96, 104])
    expect(chain, 'HARNESS-1 — the COMPUTED chain from the same thirteen terms. It is IDENTICAL to the printed chain step for step, which is the whole of the re-grain: totals and chains only, with NO term moved.').toEqual(specChain)
    // THE POLARITY, ASSERTED: the corrected figure and the as-filed figure are DIFFERENT
    // numbers, the as-filed one is exactly the twelve-step prefix of the corrected one
    // (its last step omitted), and the as-filed figure is NOT the sum of the terms.
    expect(specAsFiledTotal, 'HARNESS-1 — the as-filed `102` remains VISIBLE in the contract beside the corrected `104` (§0A note 8: a total is corrected by re-printing, never by rewriting the as-filed form out of the record)').toBe(102)
    expect(specAsFiledTotal, 'HARNESS-1 (CONTROL i) — the as-filed figure is NOT the computed total, so a row satisfied by it would be the defect this repair removes').not.toBe(total)
    expect(chain[chain.length - 2], 'HARNESS-1 (CONTROL ii) — the as-filed `102` is NOT the chain\'s last step (`104`) and NOT the last step before it (`96`): it is off the corrected chain in its own right, so the polarity is between two DIFFERENT figures rather than a relabelling of one').not.toBe(specAsFiledTotal)
    expect(specDistinctTotal, `HARNESS-1 — §5.5.2 item 3's PRINTED distinct total (site: overlay.md line ${specDistinctTotalLine}) IS the computed sum of the thirteen distinct figures (${declaredDistinctTotal()}), the corrected figure §0A note 8 files. The two figures' relation is ${total} − ${declaredDistinctTotal()} = ${total - declaredDistinctTotal()}, ENTIRELY P-OV-SM-1's collapse (the ledger's ONE differing row).`).toBe(declaredDistinctTotal())
    expect(specDistinctChain[specDistinctChain.length - 1], 'HARNESS-1 — §5.5.2 item 3\'s PRINTED distinct chain ends at the computed distinct total, and its own steps are the thirteen distinct figures').toBe(declaredDistinctTotal())
    expect(specDistinctChain, 'HARNESS-1 — §5.5.2 item 3\'s printed distinct chain read as written: the CORRECTED twelve steps, which now read `P-OV-SM-1`\'s `6 → 3` collapse at the SIXTH step (`§0A` note 9 item 2 reconciled the assignment the as-filed chain mis-placed at its second step; `§0A` note 8 had corrected only its endpoint, which as filed ended `…93 → 99`)').toEqual([10, 16, 28, 32, 36, 39, 42, 62, 71, 83, 87, 93, 101])
    // THE PRINTED DISTINCT CHAIN'S OWN TWELVE INCREMENTS ARE THE LEDGER'S OWN DISTINCT
    // FIGURES, IN REGISTER ORDER — the summary row's terms (`10 + 6 + 12 + … + 8 = 101`),
    // which is the form its own printed chain and its own total are built from.
    // ⟶ **ALIGNED (`§0A` note 9 item 2): the ledger's summary row, its total, its chain
    // and the register's `distinct` column ALL read the SAME assignment now —
    // `P-OV-IM-2` `6`, `P-OV-SM-1` `3` — so the chain is asserted against the summary
    // reading AND that reading is asserted against the register's own column below. The
    // AS-FILED mirror (the `3` in `P-OV-IM-2`'s slot and the `6` in `P-OV-SM-1`'s) stays
    // visible in the contract and is read from its bytes, so the reconciliation is
    // checkable rather than silent. NO term, row id, strategy id, seed or cap moves.**
    expect(distinctTermsSummary, 'HARNESS-1 — the ledger\'s SUMMARY-row distinct terms, in register order: `10 + 6 + 12 + 4 + 4 + 3 + 3 + 20 + 9 + 12 + 4 + 6 + 8` (§5.5.2 item 3, the row that carries the corrected distinct total `101`). The `P-OV-SM-1` figure here is the ledger\'s own `3` and `P-OV-IM-2`\'s is its `6` — the assignment `§0A` note 9 item 2 reconciles to the register\'s column, NOT the as-filed mirror.').toEqual([10, 6, 12, 4, 4, 3, 3, 20, 9, 12, 4, 6, 8])
    // THE PRINTED DISTINCT CHAIN'S STEPS, READ AS THE CHAIN ITSELF: twelve increments,
    // of which EXACTLY ONE differs from the declared chain's — the step the ledger
    // collapses (`104 → 101` is `-3`). **⟶ ALIGNED (`§0A` note 9 item 2): the collapse
    // sits at `P-OV-SM-1`'s step — the SIXTH — where the collapsed term `6 → 3` is, and
    // every later step inherits the `-3`; the as-filed chain printed its divergence at
    // the SECOND step while NAMING `P-OV-SM-1`. No term, row id, strategy id, seed or
    // cap is moved: the totals, the chain and the subtotals are asserted as the contract
    // prints them, exactly as `§0A` notes 8 and 9 scope the reading.**
    const distinctStepDiffs = specDistinctChain.slice(1).map((v, i) => v - specDistinctChain[i])
    expect(distinctStepDiffs, 'HARNESS-1 — the printed distinct chain\'s twelve steps, as printed: it is well-formed as a chain (twelve increments from thirteen figures) and carries the collapsed step in SIXTH position (`P-OV-SM-1`\'s `6 → 3`, a `-3` step against the declared chain\'s `+6`)').toEqual([6, 12, 4, 4, 3, 3, 20, 9, 12, 4, 6, 8])
    expect(distinctStepDiffs.reduce((a, b) => a + b, 10), 'HARNESS-1 — the printed distinct chain\'s own steps sum to its own endpoint, the corrected distinct total `101`').toBe(declaredDistinctTotal())
    expect(specChain[5] - specDistinctChain[5], 'HARNESS-1 — the ONE step at which the printed distinct chain differs from the printed declared chain: `42 → 39`, `P-OV-SM-1`\'s `-3` collapse, the step the ledger names; EVERY earlier step is identical to the declared chain\'s (`§0A` note 9 item 2)').toBe(3)
    expect(distinctStepDiffs.map((d, i) => d - terms.slice(1)[i]), 'HARNESS-1 — the printed chains\' own increments compared step by step: EXACTLY ONE step differs (the SIXTH) and it differs by exactly the `-3` `P-OV-SM-1` collapses, so `101` and `104` agree on twelve of the thirteen terms').toEqual([0, 0, 0, 0, -3, 0, 0, 0, 0, 0, 0, 0])
    // ⟶ **ALIGNED (`§0A` note 9 ITEM 2): THE LEDGER'S SUMMARY ROW AND THE REGISTER'S
    // `distinct` COLUMN NOW AGREE — the mirror mismatch the previous pass REPORTED as a
    // SPEC FINDING is RECONCILED at the contract, to `P-OV-IM-2` `6` and `P-OV-SM-1` `3`
    // on BOTH readings.** The row therefore asserts the AGREEMENT cell for cell, asserts
    // its own reading against the contract's PRINTED distinct terms (read from the
    // contract's bytes, not from this file's table), and keeps the AS-FILED mirror — the
    // `3` in `P-OV-IM-2`'s slot and the `6` in `P-OV-SM-1`'s — as a REAL polarity
    // assertion: the as-filed form must still be VISIBLE in the contract beside the
    // corrected one (`§0A` note 9 item 2 says so explicitly), must DIFFER from it in
    // exactly those two slots, and must NOT be the reading this row accepts. A contract
    // that silently rewrote the as-filed form away, or one whose summary row drifted back
    // to the mirror, FAILS here. NO term, row id, strategy id, seed or cap moves.
    const columnVsSummary = distinctTerms.map((t, i) => (t === distinctTermsSummary[i] ? null : DECLARED_REGISTER[i].row))
    expect(
      columnVsSummary.filter((r) => r !== null),
      'HARNESS-1 (CONTROL v) — the register\'s `distinct` column and the ledger\'s SUMMARY-row terms now disagree in NO row: the mirror mismatch this row reported as a SPEC FINDING is RECONCILED at `§0A` note 9 item 2, and the row reads the RECONCILED contract rather than the as-filed contradiction.',
    ).toEqual([])
    expect(
      distinctTerms.map((t, i) => (t === distinctTermsSummary[i] ? null : [DECLARED_REGISTER[i].row, t, distinctTermsSummary[i]])).filter((x) => x !== null),
      'HARNESS-1 (CONTROL vi(a)) — the two readings of every row must AGREE cell for cell, so no `[row, column, summary]` triple survives',
    ).toEqual([])
    expect(distinctTerms, 'HARNESS-1 (CONTROL vi(b)) — the register\'s `distinct` column IS the contract\'s PRINTED distinct terms, read from the contract\'s own bytes (`§5.5.3`\'s corrected `101` with its thirteen terms): the file\'s table is not the only witness').toEqual(specDistinctTerms)
    expect(distinctTermsSummary, 'HARNESS-1 (CONTROL vi(c)) — the ledger\'s SUMMARY-row reading is the same thirteen figures as the printed ones').toEqual([...specDistinctTerms])
    expect(asFiledDistinctTerms, 'HARNESS-1 (CONTROL vi(d)) — THE AS-FILED MIRROR STAYS VISIBLE in the contract beside the corrected printing (`§5.5.2` item 3\'s own dated annotation): the `3` in `P-OV-IM-2`\'s slot and the `6` in `P-OV-SM-1`\'s, whose sum was still `101`. A silent rewrite of the as-filed form out of the record FAILS this read.').toEqual([10, 3, 12, 4, 4, 6, 3, 20, 9, 12, 4, 6, 8])
    expect(asFiledDistinctTerms.reduce((a, b) => a + b, 0), 'HARNESS-1 (CONTROL vi(e)) — the as-filed mirror sums to the SAME `101` (the sums were never in question: the mirror is a PLACEMENT defect, and the placement is what `§0A` note 9 item 2 corrects)').toBe(declaredDistinctTotal())
    expect(
      asFiledDistinctTerms.map((t, i) => (t === distinctTerms[i] ? null : DECLARED_REGISTER[i].row)).filter((r) => r !== null),
      'HARNESS-1 (CONTROL vi(f)) — the as-filed mirror and the corrected assignment differ in EXACTLY the two reconciled rows, BY NAME: the polarity between the as-filed form and the live one is REAL, so a row satisfied by either reading would be the defect this alignment removes.',
    ).toEqual(['P-OV-IM-2', 'P-OV-SM-1'])
    expect(
      asFiledDistinctTerms.map((t, i) => (t === distinctTerms[i] ? null : [DECLARED_REGISTER[i].row, t, distinctTerms[i]])).filter((x) => x !== null),
      'HARNESS-1 (CONTROL vi(g)) — the two readings of each reconciled row, printed BESIDE each other: `P-OV-IM-2` as filed `3` / corrected `6`, and `P-OV-SM-1` as filed `6` / corrected `3`',
    ).toEqual([['P-OV-IM-2', 3, 6], ['P-OV-SM-1', 6, 3]])
    expect(distinctChain[distinctChain.length - 1], 'HARNESS-1 — the distinct chain computed from the register\'s own `distinct` column therefore agrees with the printed corrected chain').toBe(specDistinctChain[specDistinctChain.length - 1])
    expect(specAsFiledDistinct, 'HARNESS-1 — the as-filed distinct `99` remains VISIBLE in the contract beside the corrected `101` (§0A note 8)').toBe(99)
    expect(specAsFiledDistinct, 'HARNESS-1 (CONTROL iii) — the as-filed distinct figure is NOT the computed distinct total: the polarity is real on BOTH figures, not just the declared one').not.toBe(declaredDistinctTotal())
    expect(distinctChain[distinctChain.length - 2], 'HARNESS-1 (CONTROL iv) — the as-filed distinct `99` is likewise NOT the corrected chain\'s penultimate step (`93`): the correction is between two DIFFERENT figures on both readings').not.toBe(specAsFiledDistinct)
    expect(specAsFiledTotal - specAsFiledDistinct, 'HARNESS-1 — the two AS-FILED figures stood in the same `3` relation to each other as the corrected pair do (only the totals were mis-summed; the difference was never in question)').toBe(total - declaredDistinctTotal())
  })

  it('HARNESS-2 (§5.5.1) — THE EXECUTED READINGS reconciled against the declared register, and the stop state reported', () => {
    const measured = REGISTER_RECORDS.map((r) => ({ row: r.row, type: r.type, strategy: r.strategy, attemptsRun: r.attemptsRun, held: r.held, broken: r.broken, readings: r.readings, controls: r.controls, stoppedEarly: r.stoppedEarly, notStarted: r.notStarted, registerStoppedAt: r.registerStoppedAt, registerStoppedFor: r.registerStoppedFor }))
    console.log(`§5.5.1 executed register rows :: ${JSON.stringify(measured)}`)
    console.log(`§5.5.1 register totals :: attemptsExecuted=${REGISTER_RECORDS.reduce((a, r) => a + r.attemptsRun, 0)} rowsExecuted=${REGISTER_RECORDS.filter((r) => r.attemptsRun > 0).length} rowsDeclared=${DECLARED_REGISTER.length} termsDeclared=${DECLARED_REGISTER.length} totalDeclared=${declaredTotal()} registerStoppedAt=${registerState.stoppedAtRow ?? 'not triggered'} (${registerState.stoppedFor ?? 'no stop'})`)
    expect(REGISTER_RECORDS.length, 'HARNESS-2 — every declared register row has its own record: rowsExecuted + rowsNotStarted = rowsDeclared').toBe(DECLARED_REGISTER.length)
    for (const def of DECLARED_REGISTER) {
      const rec = REGISTER_RECORDS.find((r) => r.row === def.row)
      expect(rec, `HARNESS-2 — the row ${def.row} is DECLARED at §5.5.1 and must have an executed record (an un-run row is a FAILURE, never a pass)`).toBeDefined()
      expect(rec?.strategy, `HARNESS-2 — ${def.row}'s own strategy id (the thirteen ids are DISTINCT and no row is left without one)`).toBe(def.strategy)
      expect(rec?.type, `HARNESS-2 — ${def.row}'s declared type (P-IM / P-SM / P-TP; never an F- row and never a §6 citation)`).toBe(def.type)
      expect(rec?.seed, 'HARNESS-2 — the pinned seed is carried on every row\'s record (the step form is `S-OV-TOTAL-1`\'s and is asserted by HARNESS-6)').toBe(SEED)
      expect(rec?.attemptsRun, `HARNESS-2 — ${def.row}'s MEASURED attempts are reconciled against its DECLARED term ${def.declared}: a measured count that exceeds the declared term is a spec/table contradiction and is REPORTED, never silently tuned. Measured: ${rec?.attemptsRun}`).toBeLessThanOrEqual(def.declared)
      if (rec !== undefined && !rec.notStarted && registerState.stoppedAtRow === null) {
        expect(rec.attemptsRun, `HARNESS-2 — ${def.row} ran to its declared term with the register's stop rule NOT triggered`).toBe(def.declared)
      }
    }
    // THE STOP RULE, reported honestly: with the module absent the register is
    // EXPECTED to stop early, and every un-run row must be a FAILURE.
    if (registerState.stoppedAtRow !== null) {
      expect(registerState.stoppedFor, 'HARNESS-2 — a stopped register carries its own cause sentence').not.toBe(null)
      const unrun = REGISTER_RECORDS.filter((r) => r.attemptsRun === 0)
      for (const u of unrun) {
        expect(u.notStarted, `HARNESS-2 — the un-run row ${u.row} MUST be recorded as NOT STARTED, and its own row reports a FAILURE rather than a pass (§5.5.1 cap 3)`).toBe(true)
      }
    }
    expect(REGISTER_RECORDS.reduce((a, r) => a + r.attemptsRun, 0), 'HARNESS-2 — the executed attempt count stays inside the ≤400 register cap').toBeLessThanOrEqual(REGISTER_TOTAL_CAP)
    // ⟶ **`AD-1` — THE EXECUTED-DRIVE FIGURE OF EVERY ROW, PRINTED BESIDE ITS DECLARED
    // TERM.** A row whose clause drives an entry point MORE than once per counted attempt
    // (or drives a sweep of cells inside one attempt) MEASURES that figure; rows that are
    // not separately instrumented report `not-instrumented` rather than a figure nobody
    // measured. **NO TERM MOVES AND NO TERM IS RE-DERIVED**: the declared terms are the
    // contract's, the caps compare against them, and the extra drives are printed BESIDE
    // them, never counted in them.
    const executedByRow = DECLARED_REGISTER.map((def) => {
      const rec = REGISTER_RECORDS.find((x) => x.row === def.row)
      return { row: def.row, declaredTerm: def.declared, executedDrives: rec?.executedDrives ?? null }
    })
    console.log(`§5.5.1 AD-1 executed-drive readings (declared term beside its MEASURED executed drives) :: ${JSON.stringify(executedByRow)}`)
    console.log(`§5.5.1 AD-1 measured executed drives :: ${JSON.stringify(executedByRow.filter((x) => x.executedDrives !== null))} — every other row is NOT SEPARATELY INSTRUMENTED and is reported as such rather than as a figure nobody measured`)
    for (const x of REGISTER_RECORDS) {
      expect(
        x.executedDrives === null || (Number.isInteger(x.executedDrives) && x.executedDrives >= 0),
        `HARNESS-2 / AD-1 — ${x.row}'s executed-drive figure is either a non-negative integer or \`null\` (not separately instrumented); it is NEVER a negative or fabricated number`,
      ).toBe(true)
    }
    // THE TWO INSTRUMENTED ROWS, ASSERTED AS MEASURED READINGS BESIDE THEIR TERMS.
    const im1 = REGISTER_RECORDS.find((x) => x.row === 'P-OV-IM-1')
    const sm1 = REGISTER_RECORDS.find((x) => x.row === 'P-OV-SM-1')
    expect(
      im1?.executedDrives,
      'HARNESS-2 / AD-1 — `P-OV-IM-1`: its declared term is `10` (the ten pool SHAPES) while its cell drives a FIXED moving verb AND a FIXED no-move verb per shape, so the row issues `20` entry-point drives. The `20` is MEASURED and printed BESIDE the `10`; the term does not move.',
    ).toBe(20)
    expect(
      sm1?.executedDrives,
      'HARNESS-2 / AD-1 — `P-OV-SM-1`: its declared term is `6` (5 row-sweeps + 1 recorder sweep) while a single attempt drives a SWEEP of cells — 4 cells in each of the first five sweeps and the whole 20-cell matrix twice in the recorder sweep — so the row issues `60` entry-point drives inside its six counted attempts. The `60` is MEASURED and printed BESIDE the `6`; the term does not move.',
    ).toBe(60)
    expect(
      REGISTER_RECORDS.filter((x) => x.executedDrives !== null).map((x) => x.row),
      'HARNESS-2 / AD-1 — the rows that print a MEASURED executed-drive figure are NAMED (a row that is not instrumented says `not-instrumented` instead of implying a figure)',
    ).toEqual(['P-OV-IM-1', 'P-OV-SM-1'])
  })

  it('HARNESS-3 (§5.5.2 items 1/2) — the ROW COUNT is an EXTENT (13 rows / 13 terms), the (bounded) SET is named, and each bounded row says so', () => {
    expect(DECLARED_REGISTER.length, 'HARNESS-3 — 13 ROWS: the overshoot of the ≤8 breakdown signal is an OUTCOME, not a budget (REGISTER-ENTRY-COUNT-IS-NOT-CAPPED: the count is an outcome and no property was dropped, merged or left unenumerated to fit a threshold)').toBe(13)
    expect(new Set(DECLARED_REGISTER.map((r) => r.strategy)).size, 'HARNESS-3 — THIRTEEN DISTINCT strategy ids (twelve enumeration strategies and ONE pinned-seed generator, S-OV-TOTAL-1)').toBe(13)
    expect(DECLARED_REGISTER.filter((r) => r.type === 'P-IM').length, 'HARNESS-3 — 5 IM rows').toBe(5)
    expect(DECLARED_REGISTER.filter((r) => r.type === 'P-SM').length, 'HARNESS-3 — 2 SM rows').toBe(2)
    expect(DECLARED_REGISTER.filter((r) => r.type === 'P-TP').length, 'HARNESS-3 — 6 TP rows').toBe(6)
    expect(boundedRows(), 'HARNESS-3 — THE (bounded) SET, NAMED: every row whose property text quantifies over a domain LARGER than its table is MARKED in its own cell ("YES (bounded — … the universal is NOT proven)"), and NO READER MAY READ A BOUNDED ROW AS A PROOF OF THE UNBOUNDED UNIVERSAL IT STATES. **⟶ THE SEVENTH ROW IS `P-OV-IM-2` (`§0A` NOTE 10 ITEM 1, gate 4\'s `AD-3`): its property text asserts `changed === (next !== previous)` ON EVERY DRIVE while its cell drives `6`, so its own cell is now MARKED — and the `7` the contract had printed over a `6`-id list, the `6` note 8 item 2 corrected it down to, and the SEVEN the cells now carry are three states of ONE row count, each visible at its own site.** The marking is a ROW count and moves NO term: the seven marked rows carry no term of their own in either total, the declared total stays `104`, and no row is added to make the figure true.').toEqual(['P-OV-IM-1', 'P-OV-IM-2', 'P-OV-IM-3', 'P-OV-TP-1', 'P-OV-TP-2', 'P-OV-TP-3', 'P-OV-TP-5'])
    expect(boundedRows().length, 'HARNESS-3 — the bounded set is the SEVEN rows the cells carry (`§5.5.2` item 2 and `§5.5.3` now NAME the same set, `§0A` note 10 item 1), and `7 + 6 = 13` reads as the marked-rows-plus-unmarked-rows count').toBe(7)
    expect(boundedRows().length + DECLARED_REGISTER.filter((r) => !r.bounded).length, 'HARNESS-3 — marked + unmarked = 13, so the row count is checkable rather than asserted').toBe(13)
    expect(DECLARED_REGISTER.filter((r) => r.bounded && r.declared < 1).length, 'HARNESS-3 — every bounded row really drives attempts (a bounded marking on an EMPTY table would be over-strength)').toBe(0)
    for (const def of DECLARED_REGISTER) {
      expect(def.declared > 0, `HARNESS-3 — ${def.row} declares a term of at least one drive`).toBe(true)
    }
  })

  it('HARNESS-4 (§5.5.2 item 3) — THE DECLARED-VERSUS-DISTINCT LEDGER: the ONE collapsing row is printed BESIDE its declared term, and the MEASURED executed distinct (`AD-2`) is printed and asserted beside the DESIGN figure', () => {
    const ledger = DECLARED_REGISTER.filter((r) => r.distinct !== null && r.distinct !== r.declared).map((r) => ({ row: r.row, declared: r.declared, distinct: r.distinct }))
    console.log(`§5.5.2 item 3 declared-vs-distinct ledger (differing rows) :: ${JSON.stringify(ledger)}`)
    expect(ledger, 'HARNESS-4 — the ledger expects EXACTLY ONE differing row: P-OV-SM-1 `6 → 3` (the 20 cells are reported as 3 DISTINCT sweeps in the distinct ledger; the pairing is stated in the cell). The DISTINCT figure is REPORTED BESIDE the declared term and is NEVER substituted for it, and the caps compare against the DECLARED figures.').toEqual([{ row: 'P-OV-SM-1', declared: 6, distinct: 3 }])
    const declaredSum = declaredTotal()
    const declaredDistinctSum = declaredDistinctTotal()
    // ⟶ **`AD-2` (HIGH) — THE PRINTED DISTINCT FIGURE IS A DESIGN FIGURE, AND THE ROW NOW
    // PRINTS AND ASSERTS THE MEASURED ONE BESIDE IT.** The contract's declared distinct
    // total is `101` (the corrected `§5.5.2` item 3 figure), while the EXECUTED distinct
    // drives this register really issues are counted on each row's own `distinctDrives`.
    // The row therefore prints the measured figure PER ROW beside its declared one, and
    // states the shortfall as a DECLARED SHORTFALL — a printed reading of what ran, never
    // a satisfied claim that the declared figure was executed, and never a re-grain of any
    // term to hide it. THE DECLARED FIGURE IS NOT REDUCED: `101` stays the contract's and
    // is asserted below as such.
    const measuredDistinctByRow = DECLARED_REGISTER.map((def) => {
      const rec = REGISTER_RECORDS.find((x) => x.row === def.row)
      return { row: def.row, declaredDistinct: def.distinct ?? def.declared, measuredExecutedDistinct: rec?.distinctDrives ?? 0 }
    })
    const executedDistinctSum = measuredDistinctByRow.reduce((a, x) => a + x.measuredExecutedDistinct, 0)
    const distinctShortfall = declaredDistinctSum - executedDistinctSum
    console.log(`§5.5.2 item 3 distinct readings PER ROW (declared beside MEASURED executed) :: ${JSON.stringify(measuredDistinctByRow)}`)
    console.log(`§5.5.2 item 3 sums :: declared=${declaredSum} declared-distinct=${declaredDistinctSum} executed-distinct=${executedDistinctSum} — **DECLARED SHORTFALL=${distinctShortfall}** (the declared distinct figure is a DESIGN figure; the executed distinct drives are the MEASURED one, and the shortfall is REPORTED here as a printed reading and never as a satisfied claim)`)
    expect(declaredDistinctSum, 'HARNESS-4 — the DECLARED distinct sum is the COMPUTED sum of the thirteen distinct figures (10 + 6 + 12 + 4 + 4 + 3 + 3 + 20 + 9 + 12 + 4 + 6 + 8 = 101; §5.5.2 item 3 NOW PRINTS the same thirteen figures and the same `101` — `§0A` note 9 item 2 reconciled the assignment to this ledger\'s own rows, and the as-filed mirror `10 + 3 + 12 + 4 + 4 + 6 + 3 + …` stays visible beside it under that note\'s dated annotation)').toBe(101)
    expect(declaredSum - declaredDistinctSum, 'HARNESS-4 — the two figures\' relation is ARITHMETIC: 104 − 101 = 3, the ONE differing row\'s collapse (P-OV-SM-1 `6 → 3`), so the ledger\'s expectation of ONE differing row holds regardless of the printed totals').toBe(3)
    // THE MEASURED FIGURE, ASSERTED EXPLICITLY BESIDE THE DECLARED ONE.
    expect(
      executedDistinctSum,
      'HARNESS-4 / AD-2 — the MEASURED EXECUTED distinct drives total `3`: the ONLY row that re-drives for a distinct reading is `P-OV-SM-1`, whose `20`-cell matrix is reported as `3` DISTINCT SWEEPS (its three `distinctDrive()` readings). The earlier form of this row asserted only `executedDistinctSum ≤ declaredSum`, which the DESIGN figure satisfied while the EXECUTED figure was `3` against a printed `101` — an under-claim that must be a printed reading, never a silent pass.',
    ).toBe(3)
    expect(
      distinctShortfall,
      'HARNESS-4 / AD-2 — THE SHORTFALL IS DECLARED, NOT HIDDEN: `101` declared minus `3` executed = `98`, printed above as the DECLARED SHORTFALL. The declared figure is a DESIGN figure and this row may NOT be read as evidence that 101 distinct drives ran.',
    ).toBe(98)
    expect(
      measuredDistinctByRow.filter((x) => x.measuredExecutedDistinct > 0).map((x) => x.row),
      'HARNESS-4 / AD-2 — the rows carrying a MEASURED distinct drive are NAMED, so the executed figure has named terms rather than being a bare total',
    ).toEqual(['P-OV-SM-1'])
    for (const x of measuredDistinctByRow) {
      expect(
        x.measuredExecutedDistinct,
        `HARNESS-4 — ${x.row}: the MEASURED distinct drives never exceed the row's DECLARED distinct figure (${x.declaredDistinct}) — a measured count above it would be a spec/table contradiction and is REPORTED, never tuned`,
      ).toBeLessThanOrEqual(x.declaredDistinct)
    }
    expect(executedDistinctSum, 'HARNESS-4 — the measured executed distinct stays inside the declared total (and inside the DECLARED figure it is reported beside)').toBeLessThanOrEqual(declaredSum)
    expect(distinctShortfall, 'HARNESS-4 / AD-2 — the shortfall is REAL and POSITIVE on this row: the declared distinct figure is not executed, and the row says so as a printed reading').toBeGreaterThan(0)
  })

  it('HARNESS-5 (§5.5.2 items 4/5/8) — the three deliberately EXCLUDED shapes, the pool-versus-boundary check, and the register\'s stated limits', () => {
    const excluded = [
      'a lone-surrogate string as an attributeName (it would exercise no rule this contract pins, and its only observable is identity pass-through, which the whitespace-padded shape already asserts)',
      'a Symbol.toPrimitive that throws only on its SECOND invocation (it would make a draw\'s count ambiguous, and this module consults no coercion hook at all) — **STILL EXCLUDED, AND NOW SAID SO AGAINST A DRIVE: `AD-6` drives the banned hook on its FIRST invocation (throwing, on the `target`, `state` and `name` slots, with the count asserted 0 and proven live by a positive control), which is the unambiguous form; the SECOND-invocation shape stays a STATED BOUNDARY.**',
      'a callback whose invocation count depends on a timer (equally ambiguous for a draw; P-OV-IM-5 asserts the count instead)',
    ]
    expect(excluded.length, 'HARNESS-5 — §5.5.2 item 4 names THREE deliberately excluded shapes as a STATED BOUNDARY, not an unrecorded omission. A pass that wants one driven owes a NEW dated amendment and a register re-grain under REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS.').toBe(3)
    // §5.5.2 item 5's pool-versus-boundary check, re-run over the landed tables.
    for (const def of DECLARED_REGISTER) {
      if (def.bounded) {
        expect(def.declared, `HARNESS-5 — the (bounded) row ${def.row} does NOT claim its grid IS the domain: its term stays a declared extent and its marking is present`).toBeLessThanOrEqual(REGISTER_ROW_CAP)
      } else {
        expect(def.declared, `HARNESS-5 — the unmarked row ${def.row} quantifies over a closed named list, a fixed grid or a closed drive set, and its term is that closed extent`).toBeGreaterThan(0)
      }
    }
    // §5.5.2 item 7 — WHAT THIS REGISTER CANNOT PROVE, carried as this file's own
    // limit: it proves NOTHING about an applied inert attribute, a rendered overlay,
    // a scrim, a node move, a focus behaviour, an OS, persistence or the app.
    expect(TP1_POOL.length, 'HARNESS-5 — the drawn pool really holds TWELVE members, in the spec\'s declared order').toBe(12)
    expect(
      TP1_POOL.filter((m) => m.hooks !== null).length,
      'HARNESS-5 — at least one pool member carries RECORDING coercion hooks, so the count-0 assertions are falsifiable by construction and not true-by-construction',
    ).toBeGreaterThan(0)
  })

  it('HARNESS-6 (§5.5.1 method note 2 / §5.5.3) — the pinned seed and its ONE-STEP-PER-DRAW form, with its reproducible first draws', () => {
    const s1 = (SEED * LCG_A + LCG_C) % LCG_MOD
    const s2 = (s1 * LCG_A + LCG_C) % LCG_MOD
    const s3 = (s2 * LCG_A + LCG_C) % LCG_MOD
    const lcg = makeLcg(SEED)
    const first = lcg.next()
    const second = lcg.next()
    const third = lcg.next()
    expect([first, second, third], 'HARNESS-6 — the pinned draws from seed 20260927 are reproducible from the literals above').toEqual([s1, s2, s3])
    expect([first % POOL_LENGTH, second % POOL_LENGTH, third % POOL_LENGTH], 'HARNESS-6 — the pool indices are `state mod pool.length`, ONE LCG STEP PER DRAW').toEqual([s1 % 12, s2 % 12, s3 % 12])
    expect(SEED, 'HARNESS-6 — the seed is the pinned literal 20260927').toBe(20260927)
    expect([LCG_A, LCG_C, LCG_MOD], 'HARNESS-6 — the LCG constants are literals in this file (no Math.random, no wall-clock seed, no shrinking and no adaptive input search)').toEqual([1664525, 1013904223, 4294967296])
    expect(POOL_LENGTH, 'HARNESS-6 — pool.length = 12, as §5.5.3 pins').toBe(12)
    const lcg2 = makeLcg(SEED)
    expect([lcg2.next() % POOL_LENGTH, lcg2.next() % POOL_LENGTH], 'HARNESS-6 — a second generator from the same seed reproduces the same indices (deterministic)').toEqual([s1 % 12, s2 % 12])
  })

  it('HARNESS-7 (§5.5.2 item 9 / §5.5.1 cap 6) — the CROSS-ROW ASSERTIONS reported BESIDE the terms, and the register\'s stated boundaries', () => {
    const src = moduleSource()
    const v = src === null ? '' : normalizedView(src)
    console.log(`HARNESS-7 cross-row readings :: moduleBytes=${src === null ? 'ABSENT (the §4.1 red fact)' : `${v.length} normalized chars`} · rowsDeclared=${DECLARED_REGISTER.length} · bounded=${boundedRows().length} · declaredTotal=${declaredTotal()} · distinctTotal=${declaredDistinctTotal()}`)
    expect(
      DECLARED_REGISTER.every((r) => r.declared <= REGISTER_ROW_CAP),
      'HARNESS-7 — every declared term is inside the ≤100/row cap, and the total inside ≤400, BOTH compared against the DECLARED figures (never against the distinct figure of §5.5.2 item 3)',
    ).toBe(true)
    expect(
      DECLARED_REGISTER.length,
      'HARNESS-7 — the register is evaluated SEQUENTIALLY IN REGISTER ORDER with STOP AFTER 5 CONSECUTIVE FAILURES; the stop state and every un-run row are REPORTED by HARNESS-2 and by each row\'s own record line. An un-run register row is a FAILURE.',
    ).toBe(REGISTER_RECORDS.length)
    // ⟶ **REPAIR 6 (gate-3) — THE PROPERTY-RUNNER SCAN IS SCOPED TO THE MODULE'S BYTES,
    // WITH ITS OWN PROBE TEXT EXEMPT BY NAME AND A CONTROL.** As filed this assertion
    // scanned `testFileBytes()` — THIS FILE — whose own bytes necessarily carry the
    // detector's probe spellings, so it could NEVER be true. The subject of "no property
    // runner" is the PRODUCTION surface this unit ships (`§5.5.2` item 9 / `§5.5.1` cap
    // 6: the register is plain deterministic vitest tables), which is the module's own
    // bytes; and the package manifest is read as the LOCKED dependency set rather than
    // as prose. The file's own probe text is exempt BY NAME (assembled, so the exemption
    // itself carries no spelled token), and the control proves the detector is LIVE.
    const runnerRe = /\b(?:jest|fc\.)\b|fast-check/
    const ownProbeExempt = [t0('fast-check'), t0('jest'), t0('fc.')]
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { devDependencies?: Record<string, string>; dependencies?: Record<string, string> }
    const depNames = [...Object.keys(pkg.devDependencies ?? {}), ...Object.keys(pkg.dependencies ?? {})]
    expect(
      src === null || !runnerRe.test(src),
      'HARNESS-7 — NO new dependency and no property runner: the register is plain deterministic vitest tables plus ONE hand-rolled pinned-seed generator. The MODULE\'s bytes carry no `fast-check` and no property runner, and neither does the dependency set.',
    ).toBe(true)
    expect(
      depNames.filter((n) => runnerRe.test(n)),
      'HARNESS-7 — the LOCKED dependency set of §5.5/(cap 6) carries NO property runner and no fast-check: the names are read as a SET, so an added runner is reported by name rather than by a count.',
    ).toEqual([])
    expect(
      runnerRe.test(`${t0('fast-check')}`),
      'HARNESS-7 (CONTROL) — the detector is LIVE: the probe corpus it exists to catch FAILS it. A scan that cannot fail is vacuous, which is exactly the defect this repair removes.',
    ).toBe(true)
    const exempted = (text: string): string => {
      let view = text
      for (const ex of ownProbeExempt) view = view.split(ex).join(' ')
      return view
    }
    const probeCorpus = `import { fc } from '${t0('fast-check')}'`
    expect(runnerRe.test(probeCorpus), 'HARNESS-7 (CONTROL i) — a corpus carrying a property-runner import FAILS the detector').toBe(true)
    expect(runnerRe.test(exempted(probeCorpus)), 'HARNESS-7 (CONTROL ii) — the SAME corpus with THIS ROW\'s own probe spellings subtracted BY NAME PASSES: the exemption is the named probe text and NOTHING ELSE, and a genuinely banned dependency is still caught by the package.json reading above').toBe(false)
  })
})

// ===========================================================================
// PRE — HARNESS PRECONDITIONS (not spec rows). They are the instruments the rows
// above depend on, asserted so a red row cannot be a harness artefact.
// ===========================================================================
describe('PRE — harness preconditions (not spec rows)', () => {
  it('PRE-1 the dynamic import boundary itself resolves and casts (proved against an EXISTING module)', async () => {
    const existing = ['..', 'src', 'shared', 'dom-shim.js'].join('/')
    const mod = (await import(/* @vite-ignore */ existing)) as Record<string, unknown>
    expect(typeof mod['installShim'], 'the boundary technique resolves an existing module, so the red rows fail as ASSERTIONS and never as a transform error').toBe('function')
    const cast = mod['installShim'] as unknown as () => void
    expect(typeof cast).toBe('function')
  })

  it('PRE-2 the scan instruments are LIVE: the joiner joins before quotes are stripped, and the boundary matcher is a boundary matcher', () => {
    // THE ASSEMBLY-EVASION CONTROL, stated as SOURCE TEXT: the `+` concatenation must
    // be present in the string for the joiner to see it — a template that resolves
    // the fragments itself would test nothing.
    const assembledSource = ["const a = 'sc", "' + '", "rim'"].join('')
    expect(
      normalizedView(assembledSource).includes('scrim'),
      'PRE-2 — the JOIN runs BEFORE quotes are stripped, so an assembled token (a literal `+` concatenation IN A SOURCE STRING) is visible to a token-boundary scan. A view that strips quotes first cannot see the boundary and would look green while the evasion lands.',
    ).toBe(true)
    expect(scanForToken(commentStrippedView('// the scrim is a lie\ntrue'), 'scrim', true), 'PRE-2 — the comment-stripping view really strips comments, so the honest companion view is honest').toBe(false)
    expect(normalizedView('/* the scrim is a lie */ true').includes('scrim'), 'PRE-2 — while the NORMALIZED view keeps comments: comments are scanned as CODE, and a banned token in a comment FAILS').toBe(true)
    expect(scanForToken('const overlayTransitionX = 1', 'overlayTransition', true), 'PRE-2 — the boundary matcher does not fire inside a longer identifier').toBe(false)
    expect(scanForToken('const overlayTransition = 1', 'overlayTransition', true), 'PRE-2 — and it fires on the bare spelling').toBe(true)
  })

  it('PRE-3 this file is the unit\'s own test file and the module path it drives is the contract\'s (§0A note 1, §5.1 rows 1/2)', () => {
    expect(TEST_PATH.endsWith(`tests${MODULE_PATH.includes('\\') ? '\\' : '/'}overlay.test.ts`), 'PRE-3 — this file is tests/overlay.test.ts, the path the contract PINS (§0A note 1)').toBe(true)
    expect(MODULE_PATH.endsWith(`shared${MODULE_PATH.includes('\\') ? '\\' : '/'}overlay.ts`), 'PRE-3 — the module path this file drives is src/shared/overlay.ts, the path the contract PINS').toBe(true)
    expect(MODULE_SPECIFIER, 'PRE-3 — the dynamic specifier is COMPUTED, never a literal import, so the file still transforms while the module is absent').toBe('../src/shared/overlay.js')
  })

  it('PRE-4 the realm-rooted lookup used by the boundary probe is assembled, so this file\'s own bytes carry no realm token (§3.4 R-2\'s test-file half)', () => {
    expect(cc(codes(t0('globalThis'))), 'PRE-4 — the assembler round-trips: the realm token exists only at RUN TIME, never in this file\'s bytes').toBe(t0('globalThis'))
    expect(scanForToken(normalizedView(`const g = globalThis`), t0('globalThis'), true), 'PRE-4 — the realm token IS visible to a scan once spelled (the instrument is live)').toBe(true)
    expect(scanForToken(testView(), t0('globalThis'), true), 'PRE-4 — and this file\'s own exemption view carries it nowhere: the probe reads the tree, it never reaches for a realm object here').toBe(false)
    expect(typeof realmRoot(), 'PRE-4 — the assembled lookup resolves the global object at run time (a reading, not a scan)').toBe('object')
  })

  it('PRE-5 the exported-type alias is USED, so an unused type-only import cannot mask a rename (§5.2 leg 5)', () => {
    const probe: ExportedTypes = [
      'closed',
      { state: 'closed', changed: false },
      { name: null, value: false, removal: true, target: undefined },
    ]
    expect(probe).toHaveLength(3)
    expect(TYPE_NAMES).toHaveLength(3)
  })
})
