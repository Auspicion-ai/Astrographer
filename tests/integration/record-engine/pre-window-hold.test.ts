// tests/integration/record-engine/pre-window-hold.test.ts — unit `B-2` `display-wire`'s PROVE-IT ROW for the
// PRE-WINDOW HOLD, arm `(c)` of `docs/L1/unit-b-2-display-wire.md` §5.
//
// **THE INSTRUMENT IS EXTRACT-AND-DRIVE, AND THAT IS THE DECLARED COST OF THE PLACEMENT** (`ASM-B2-2`): the queue's body
// is `src/main/main.ts`'s — the foundation's own placement, refused an alternative home under
// `src/main/record-engine/` — and `main.ts` imports `electron` at module scope and runs `app.whenReady()`, so **this file
// NEVER imports it**. Instead it reads `src/main/main.ts`'s BYTES, cuts the region between the two markers
// `// ⟦B-2-PRE-WINDOW⟧` … `// ⟦/B-2-PRE-WINDOW⟧` (**both markers are part of this contract's change set; an ABSENT region
// FAILS the row, never skips**), compiles that region with the repo's own `esbuild` (`transformSync`, TypeScript loader)
// and DRIVES the queue it declares. Nothing is copied: the bytes compiled here are the shipped bytes.
//
// **WHAT THE DRIVEN BODY MUST DO (§5(c), and the semantics are the foundation's `createDeliveryQueue`, ADOPTED not
// re-invented):** two deliveries before the realm stands hold BOTH ADDRESSES IN ORDER and send ZERO pushes; `arm()` sends
// EXACTLY ONE push and clears the held set; a later delivery is a push with nothing held; a SECOND `arm()` (a reloaded
// realm) is ONE MORE push with still nothing held. **The queue holds the ADDRESS, never a reading** — it is a queue of
// addresses, and the flush translates nothing.
//
// **AND THE CIVIL HALF IS THE REAL ONE**: the same driven queue over a REAL store on a `/tmp` path — the delivery's sink
// is the queue's `deliver`, the ONE construction adopts `[...delivery.entries]` and the family's declarations, two entries
// are written PRE-WINDOW, the flush is ONE push, the held set clears, a reloaded realm is owed ONE MORE push, and both
// entries are read after it.
//
// **COLOURS AT THIS HEAD:** the five DRIVEN rows are RED — no marker exists in `src/main/main.ts` at this head, so each
// reports the absent region BY NAME (an absent region or a missing pinned name FAILS; a row that skipped would silently
// pass the day the queue never lands). The INSTRUMENT CONTROL row is GREEN-ON-ARRIVAL BY DESIGN and must stay so: it
// drives a forged region to prove the harness and the name pin work in both directions, and a red control would mean the
// tool — not the shipped body — is the thing being measured.
//
// **HARD RULES:** no `vi.mock`, no Electron spawn, no network, no DOM; nothing imports `src/main/main.ts`; every real
// store goes on a `mkdtempSync(join(tmpdir(), …))` path and is removed in `afterAll`.
//
// **THE FACTORY'S NAME IS PINNED, NOT DISCOVERED** (§2's PINNED-NAMES sentence, §5(c)'s amendment): the markered region
// must carry BOTH the `DeliveryQueue` interface AND `createDeliveryQueue`, because §5(c) extracts the region and resolves
// those names out of it. A missing region or a missing factory name FAILS the row — it never skips and it is never
// satisfied by a differently-named function that happens to have the right shape. The SHAPE reading is kept as a
// FALLBACK diagnostic only (it reports what the region DID declare when the pin is not met), and the control row proves
// the pin discriminates in both directions: a forged region carrying the pinned names passes it, and a forged region with
// the right shape under the wrong names is NAMED as a miss.
//
// LAYER (D-10, RCA-12): `[T]`/ENVELOPE. The driven queue is main-side logic under the node realm; nothing paints.
import { afterAll, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Namespace imports: a member this unit adds is a NAMED problem inside the row that needs it, never a link error.
import * as recordEngineModule from '../../../src/main/record-engine/index.js'
import * as storeroomModule from '../../../src/main/storeroom.js'
import * as displayClientModule from '../../../src/renderer/display-client.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..', '..')
const MAIN_PATH = join(ROOT, 'src', 'main', 'main.ts')

/** §5(c): **both markers are part of this contract's change set.** An absent region FAILS, never skips. */
const PRE_WINDOW_OPEN = '// ⟦B-2-PRE-WINDOW⟧'
const PRE_WINDOW_CLOSE = '// ⟦/B-2-PRE-WINDOW⟧'
/** §2/§5(c): the region's PINNED NAMES — the interface it declares and the factory §5(c) drives. Both are the
 *  foundation's own, adopted not re-invented; the shape-only reading below is a fallback DIAGNOSTIC, never a pass. */
const QUEUE_INTERFACE = 'DeliveryQueue'
const QUEUE_FACTORY = 'createDeliveryQueue'
const QUEUE_MEMBERS = ['arm', 'deliver', 'held'] as const

// ─── harness ────────────────────────────────────────────────────────────────────────────────────────────────────────

type AnyFn = (...args: unknown[]) => unknown
type AnyRecord = Record<string, unknown>

const readPath = (path: string): string => readFileSync(path, 'utf8')

function show(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

function msgOf(thrown: unknown): string {
  return thrown instanceof Error ? thrown.message : String(thrown)
}

function readExport(mod: unknown, name: string): unknown {
  if (mod === null || (typeof mod !== 'object' && typeof mod !== 'function')) return undefined
  try {
    return (mod as AnyRecord)[name]
  } catch {
    return undefined
  }
}

function readFn(mod: unknown, name: string): AnyFn | null {
  const value = readExport(mod, name)
  return typeof value === 'function' ? (value as AnyFn) : null
}

function attempt(problems: string[], tag: string, run: () => string | null): void {
  let reading: string | null
  try {
    reading = run()
  } catch (thrown) {
    problems.push(`${tag} · the reading THREW before it completed: ${msgOf(thrown)}`)
    return
  }
  if (reading !== null) problems.push(`${tag} · ${reading}`)
}

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

const tempDirs: string[] = []

function newProfilePath(label: string): string {
  const dir = mkdtempSync(join(tmpdir(), `b2-pre-window-${label}-`))
  tempDirs.push(dir)
  return join(dir, 'provident-profile.json')
}

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true })
})

/** The repo's own `esbuild` — the same bundler `npm run build` uses, so the region is compiled by the toolchain that
 *  ships it. An absent esbuild is a NAMED problem, never a skip. */
const requireFromHere = createRequire(import.meta.url)
function esbuildTransform(): ((input: string, options: AnyRecord) => { code: string }) | null {
  try {
    const loaded = requireFromHere('esbuild') as { transformSync?: (input: string, options: AnyRecord) => { code: string } }
    return typeof loaded.transformSync === 'function' ? loaded.transformSync : null
  } catch {
    return null
  }
}

// ─── the extract-and-drive instrument ───────────────────────────────────────────────────────────────────────────────

/** What a driven queue must answer (§5(c)'s own vocabulary: `deliver`, `arm`, `held`). */
interface DrivenQueue {
  deliver(address: readonly string[]): void
  arm(): void
  readonly held: readonly (readonly string[])[]
}

interface QueueSubject {
  readonly problem: string | null
  /** The shipped bytes of the region, quoted in failure messages so a reader sees WHAT was driven. */
  readonly region: string
  /** The top-level names the region declares — the diagnosis a "no factory" problem reports. */
  readonly declared: readonly string[]
  readonly make: ((push: () => void) => DrivenQueue) | null
  /** §2/§5(c)'s PIN: does the region carry the `DeliveryQueue` interface AND the `createDeliveryQueue` factory? */
  readonly pinned: boolean
  /** WHICH half of the pin is missing, by name — reported with the problem, never inferred by the reader. */
  readonly pinReport: readonly string[]
}

/** Cut the region out of `src/main/main.ts`'s bytes. An absent or empty region is a NAMED problem. */
function extractRegion(raw: string): { region: string; problem: string | null } {
  const openAt = raw.indexOf(PRE_WINDOW_OPEN)
  const closeAt = raw.indexOf(PRE_WINDOW_CLOSE)
  if (openAt < 0 || closeAt < 0) {
    const missing = [openAt < 0 ? `the opening marker \`${PRE_WINDOW_OPEN}\`` : null, closeAt < 0 ? `the closing marker \`${PRE_WINDOW_CLOSE}\`` : null]
      .filter((part): part is string => part !== null)
      .join(' and ')
    return {
      region: '',
      problem: `§5(c) pins BOTH markers as part of this contract's change set and ${missing} ${openAt < 0 && closeAt < 0 ? 'are' : 'is'} ABSENT from \`src/main/main.ts\` — the pre-window hold has no region to extract, so the creation's deliveries before the realm stands are held NOWHERE and a reloaded realm is never owed a push`,
    }
  }
  if (closeAt <= openAt) {
    return { region: '', problem: 'the pre-window markers are inverted — the region between them is empty and nothing can be driven' }
  }
  const region = raw.slice(openAt + PRE_WINDOW_OPEN.length, closeAt)
  if (region.trim().length === 0) {
    return {
      region,
      problem: `the region between \`${PRE_WINDOW_OPEN}\` and \`${PRE_WINDOW_CLOSE}\` is EMPTY — §2 item 1 builds the delivery queue there, and an empty region is not a queue`,
    }
  }
  return { region, problem: null }
}

/** §2/§5(c)'s PIN, read off the region's OWN text: it must declare the `DeliveryQueue` interface AND the
 *  `createDeliveryQueue` factory. Answers the missing halves BY NAME, so a failure says which half is absent instead of
 *  leaving a reader to guess. (An interface erases, so this is necessarily a text reading; the factory's ARRIVAL as a
 *  value is read separately, after the compile.) */
function pinReport(region: string): string[] {
  const missing: string[] = []
  if (!new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?interface\\s+${QUEUE_INTERFACE}\\b`).test(region)) {
    missing.push(`the region declares no \`interface ${QUEUE_INTERFACE}\``)
  }
  // The NAME is pinned, not the declaration KIND: `function createDeliveryQueue(` and `const createDeliveryQueue = (…) =>`
  // both satisfy §2/§5(c), which name the factory and never its syntax. A different name is a miss either way.
  if (!new RegExp(`(?:^|\\n)\\s*(?:(?:export\\s+)?(?:async\\s+)?function\\s+${QUEUE_FACTORY}\\b|(?:export\\s+)?const\\s+${QUEUE_FACTORY}\\b)`).test(region)) {
    missing.push(`the region declares no \`${QUEUE_FACTORY}\``)
  }
  return missing
}

/** Cut the region from the SHIPPED `main.ts`, compile it with esbuild, evaluate it in this realm, and resolve the PINNED
 *  factory `createDeliveryQueue`. The PIN is the primary reading: a missing region or a missing factory name FAILS. The
 *  shape census still runs as a FALLBACK DIAGNOSTIC (it reports what the region DID declare) and is the only route the
 *  control row uses for its deliberately shape-only forgery. Every way this can fail is a NAMED problem — never a skip
 *  and never an exception. */
function queueSubject(): QueueSubject {
  const extracted = extractRegion(readPath(MAIN_PATH))
  if (extracted.problem !== null) {
    return { problem: extracted.problem, region: extracted.region, declared: [], make: null, pinned: false, pinReport: [] }
  }
  return driveRegion(extracted.region, true)
}

/** The COMPILE-AND-DRIVE half, over any region text — the shipped bytes by `queueSubject()` (PIN required), a FORGED
 *  region by the control row (pin either way), so the instrument is proved before its red is believed. */
function driveRegion(region: string, requirePinned = false): QueueSubject {
  // THE TOP-LEVEL NAMES the region declares: functions and consts. Types and interfaces erase, so a name that answers
  // `undefined` at probe time is simply not a value.
  const declared = [
    ...[...region.matchAll(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm)].map((m) => m[1] as string),
    ...[...region.matchAll(/^(?:export\s+)?const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*(?::[^=\n]+)?=/gm)].map((m) => m[1] as string),
  ]
  // THE PIN, read first: a region that does not carry the contract's own names is a failure whether or not some other
  // function in it happens to answer the shape.
  const missingNames = pinReport(region)
  const pinned = missingNames.length === 0
  const pinProblem =
    requirePinned && !pinned
      ? `§2/§5(c) pin the region's NAMES and it misses ${missingNames.join(' and ')} — §5(c) extracts the region and resolves the \`${QUEUE_INTERFACE}\` interface AND \`${QUEUE_FACTORY}\` out of it, so a different name (however well shaped) is not the shipped queue; the region declares [${declared.join(', ') || 'nothing'}]`
      : null
  const transformSync = esbuildTransform()
  if (transformSync === null) {
    return {
      problem:
        'the repo\'s own `esbuild` did not resolve through `createRequire` — the region cannot be COMPILED, and this row refuses to copy it by hand (a copy would be a second queue, not the shipped one)',
      region,
      declared,
      make: null,
      pinned,
      pinReport: missingNames,
    }
  }
  const probe = declared.length > 0 ? `\n;module.exports.__b2Region = { ${declared.map((name) => `'${name}': typeof ${name} !== 'undefined' ? ${name} : undefined`).join(', ')} }` : ''
  let compiled: string
  try {
    compiled = transformSync(`${region}${probe}`, { loader: 'ts', format: 'cjs', target: 'node20' }).code
  } catch (thrown) {
    return { problem: `the extracted region does not COMPILE (${msgOf(thrown)}) — the shipped bytes are the subject, and a region that will not compile is not a queue`, region, declared, make: null, pinned, pinReport: missingNames }
  }
  const moduleObject: { exports: AnyRecord } = { exports: {} }
  const requireStub = (specifier: string): never => {
    throw new Error(
      `the markered region requires ${show(specifier)}; the extract-and-drive harness supplies no modules — the queue's body must be self-contained (it takes its push as a parameter, §5(c))`,
    )
  }
  try {
    // eslint-disable-next-line no-new-func
    const run = new Function('exports', 'require', 'module', 'console', compiled) as AnyFn
    run(moduleObject.exports, requireStub, moduleObject, console)
  } catch (thrown) {
    return { problem: `the compiled region THREW while being evaluated (${msgOf(thrown)}) — the queue cannot be driven`, region, declared, make: null, pinned, pinReport: missingNames }
  }
  const exposed = (moduleObject.exports.__b2Region ?? {}) as AnyRecord
  /** Does this candidate answer `{ deliver, arm, held }` when handed a push callback? One predicate, two subjects: the
   *  PINNED name below and the shape census that follows it. */
  const answersShape = (candidate: unknown): boolean => {
    if (typeof candidate !== 'function') return false
    try {
      const answer = (candidate as AnyFn)(() => undefined) as unknown
      return (
        answer !== null &&
        typeof answer === 'object' &&
        typeof (answer as AnyRecord).deliver === 'function' &&
        typeof (answer as AnyRecord).arm === 'function' &&
        Array.isArray((answer as AnyRecord).held)
      )
    } catch {
      // a candidate that throws on a callback is simply not the factory
    }
    return false
  }
  // THE PRIMARY ROUTE: the PINNED factory, resolved BY NAME out of the region's own exports.
  let make: ((push: () => void) => DrivenQueue) | null = null
  const pinnedCandidate = exposed[QUEUE_FACTORY]
  if (typeof pinnedCandidate === 'function') {
    if (!answersShape(pinnedCandidate)) {
      return {
        problem: `the region declares \`${QUEUE_FACTORY}\` but it does not answer \`{ ${QUEUE_MEMBERS.join(', ')} }\` when handed a push callback — §5(c)'s semantics are the foundation's, adopted not re-invented`,
        region,
        declared,
        make: null,
        pinned,
        pinReport: missingNames,
      }
    }
    make = (push: () => void) => (pinnedCandidate as AnyFn)(push) as DrivenQueue
  }
  if (make !== null) {
    return { problem: pinProblem, region, declared, make, pinned, pinReport: missingNames }
  }
  // THE FALLBACK DIAGNOSTIC (never a pass for the shipped region, which requires the pin): a candidate that answers
  // `{ deliver, arm, held }` when handed a push callback, reported so a reader sees WHAT the region actually declared.
  const candidates: unknown[] = [...Object.values(exposed), ...Object.values(moduleObject.exports).filter((value) => value !== exposed)]
  for (const candidate of candidates) {
    if (!answersShape(candidate)) continue
    make = (push: () => void) => (candidate as AnyFn)(push) as DrivenQueue
    break
  }
  if (make === null) {
    return {
      problem: `the markered region declares [${declared.join(', ')}] and NONE of them answers \`{ ${QUEUE_MEMBERS.join(', ')} }\` when handed a push callback — §5(c) drives the shipped queue through exactly those three members (the foundation's \`${QUEUE_FACTORY}\`)`,
      region,
      declared,
      make: null,
      pinned,
      pinReport: missingNames,
    }
  }
  return { problem: pinProblem, region, declared, make, pinned, pinReport: missingNames }
}

/** A fresh driven queue plus the push counter its `arm()` should move. */
function freshQueue(problems: string[], label: string): { queue: DrivenQueue; pushes: () => number } | null {
  const subject = queueSubject()
  if (subject.problem !== null) {
    problems.push(`${label} · ${subject.problem}`)
    return null
  }
  if (subject.make === null) {
    problems.push(`${label} · the region compiled but no factory was discovered`)
    return null
  }
  let pushes = 0
  const queue = subject.make(() => {
    pushes += 1
  })
  return { queue, pushes: () => pushes }
}

/** The family's own root, from the barrel — never a spelled address. */
function displayAddress(problems: string[], label: string): string[] | null {
  const address = readExport(recordEngineModule, 'DISPLAY_ADDRESS')
  if (!Array.isArray(address) || address.length === 0) {
    problems.push(`${label} · \`DISPLAY_ADDRESS\` does not resolve as a non-empty tuple on \`src/main/record-engine/index.js\` — the addresses this row delivers cannot be derived`)
    return null
  }
  return [...(address as string[])]
}

const entryFor = (documentId: string): AnyRecord => ({ documentId })

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(c)` — THE PRE-WINDOW HOLD, DRIVEN OUT OF `src/main/main.ts` (§5(c))
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('pre-window-hold · arm (c) — the shipped queue body, extracted and driven (§5(c))', () => {
  it('(c) · INSTRUMENT CONTROL — the compile-and-drive harness WORKS: a FORGED region declaring the contract’s own queue shape is discovered and driven, so the absent-region red above is a reading and not a broken tool', () => {
    const problems: string[] = []
    /** A forgery written ONLY to prove the instrument — never the subject, never compared with `main.ts`'s bytes. It is
     *  the contract's own semantics in TypeScript: hold the ADDRESS, flush once unconditionally, clear unconditionally. */
    const forgedRegion = `
interface ForgedQueue {
  deliver(address: readonly string[]): void
  arm(): void
  readonly held: readonly (readonly string[])[]
}

function createForgedQueue(push: () => void): ForgedQueue {
  const held: (readonly string[])[] = []
  let armed = false
  return {
    deliver(address: readonly string[]): void {
      if (armed) {
        push()
        return
      }
      held.push([...address])
    },
    arm(): void {
      armed = true
      push()
      held.length = 0
    },
    get held(): readonly (readonly string[])[] {
      return held.map((address) => [...address])
    },
  }
}
`
    // The forged region is DELIBERATELY misnamed (`ForgedQueue`/`createForgedQueue`): it proves the SHAPE-DISCOVERY
    // fallback works, and it is the subject of the pin's negative control below.
    const subject = driveRegion(forgedRegion)
    if (subject.problem !== null) {
      problems.push(`INSTRUMENT CONTROL FAILED: the forged region was not drivable — ${subject.problem}`)
    } else if (subject.make === null) {
      problems.push('INSTRUMENT CONTROL FAILED: the forged region compiled and declared a queue, but no factory was discovered')
    } else {
      attempt(problems, '(c)·instrument', () => {
        let pushes = 0
        const queue = subject.make(() => {
          pushes += 1
        })
        queue.deliver(['display', 'tab-x'])
        queue.deliver(['display', 'tab-y'])
        const msgs: string[] = []
        if (pushes !== 0) msgs.push(`the forged queue pushed ${pushes} time(s) before \`arm()\` — the harness is driving something other than a hold`)
        if (queue.held.length !== 2) msgs.push(`the forged queue held ${queue.held.length} address(es) — the discovery found the wrong function`)
        queue.arm()
        if (pushes !== 1) msgs.push(`the forged queue's \`arm()\` pushed ${pushes} time(s)`)
        if (queue.held.length !== 0) msgs.push('the forged queue did not clear its hold')
        if (subject.declared.includes('createForgedQueue') === false) {
          msgs.push(`the harness did not report the region's declared names (read [${subject.declared.join(', ')}])`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    // ── §2/§5(c)'s PIN, PROVED IN BOTH DIRECTIONS: a forged region carrying the contract's OWN names is accepted, and the
    // ── shape-only forgery above (right shape, wrong names) is REJECTED by name. Without both, a pin that passes
    // ── everything and a pin that passes nothing are indistinguishable from a correct one.
    const pinnedForgery = `
interface DeliveryQueue {
  deliver(address: readonly string[]): void
  arm(): void
  readonly held: readonly (readonly string[])[]
}

function createDeliveryQueue(push: () => void): DeliveryQueue {
  const held: (readonly string[])[] = []
  let armed = false
  return {
    deliver(address: readonly string[]): void {
      if (armed) {
        push()
        return
      }
      held.push([...address])
    },
    arm(): void {
      armed = true
      push()
      held.length = 0
    },
    get held(): readonly (readonly string[])[] {
      return held.map((address) => [...address])
    },
  }
}
`
    attempt(problems, '(c)·pin-accepts', () => {
      const pinnedSubject = driveRegion(pinnedForgery, true)
      if (pinnedSubject.problem !== null) {
        return `PIN CONTROL FAILED: a forged region carrying \`interface ${QUEUE_INTERFACE}\` and \`function ${QUEUE_FACTORY}(\` was REJECTED (${pinnedSubject.problem}) — the pin would red a correctly-named implementation`
      }
      if (!pinnedSubject.pinned || pinnedSubject.make === null) {
        return 'PIN CONTROL FAILED: the pinned forgery read as unpinned or yielded no factory — the pin and the drive disagree about the same region'
      }
      let pushes = 0
      const queue = pinnedSubject.make(() => {
        pushes += 1
      })
      queue.deliver(['display', 'tab-x'])
      if (pushes !== 0 || queue.held.length !== 1) {
        return `PIN CONTROL FAILED: the pinned forgery held ${queue.held.length} address(es) and pushed ${pushes} time(s) before \`arm()\``
      }
      queue.arm()
      return pushes === 1 && queue.held.length === 0 ? null : `PIN CONTROL FAILED: the pinned forgery's \`arm()\` pushed ${pushes} time(s) with ${queue.held.length} held`
    })

    attempt(problems, '(c)·pin-rejects', () => {
      const rejected = driveRegion(forgedRegion, true)
      if (rejected.problem === null) {
        return `PIN CONTROL FAILED: a forged region with the RIGHT SHAPE under the WRONG names (\`ForgedQueue\`/\`createForgedQueue\`) PASSED the pin — §2/§5(c) pin \`${QUEUE_INTERFACE}\` and \`${QUEUE_FACTORY}\`, and a shape-only census would accept a rename`
      }
      const named = rejected.problem.includes(QUEUE_FACTORY) && rejected.problem.includes(QUEUE_INTERFACE)
      return named
        ? null
        : `PIN CONTROL FAILED: the pin rejected the misnamed forgery without NAMING both \`${QUEUE_INTERFACE}\` and \`${QUEUE_FACTORY}\` (said: ${show(rejected.problem.slice(0, 300))})`
    })

    expect(
      problems,
      '§2/§5(c) — the extract-and-drive INSTRUMENT and its NAME PIN are proved before their red is believed (ASM-B2-2’s declared cost)',
    ).toEqual([])
  })

  it('(c) · THE REGION EXISTS, COMPILES, CARRIES THE PINNED NAMES (`DeliveryQueue` + `createDeliveryQueue`) AND DECLARES A DRIVABLE QUEUE (§2, §5(c))', () => {
    const problems: string[] = []
    const raw = readPath(MAIN_PATH)

    // THE NAMES FIRST, read off the RAW bytes: both markers are comments, so a code-only reading would erase the region
    // boundary itself. A missing region or a missing factory name FAILS this row — never a skip.
    attempt(problems, '(c)·pinned-names', () => {
      const extracted = extractRegion(raw)
      if (extracted.problem !== null) return extracted.problem
      const missing = pinReport(extracted.region)
      if (missing.length > 0) {
        return `§2/§5(c) pin the region's NAMES and it misses ${missing.join(' and ')} — §5(c) resolves the \`${QUEUE_INTERFACE}\` interface AND \`${QUEUE_FACTORY}\` out of the extracted region, so a differently-named function (however well shaped) leaves the shipped body unreadable to the row that must drive it`
      }
      return null
    })

    const subject = queueSubject()
    if (subject.problem !== null) problems.push(`(c)·region · ${subject.problem}`)
    // A positive reading on top of the absence problem: what WAS declared, so a reader can see the subject.
    if (subject.problem === null) {
      if (subject.declared.length === 0) {
        problems.push('(c)·region · the region declares NO top-level value — a queue built and driven nowhere is not the hold §5(c) measures')
      }
      if (subject.region.trim().length === 0) problems.push('(c)·region · the region is empty')
      if (!subject.pinned) {
        problems.push(`(c)·region · the region is not PINNED to the contract's names (missing ${subject.pinReport.join(' and ')}) — §5(c) drives the shipped body through \`${QUEUE_FACTORY}\``)
      }
      if (subject.make === null) problems.push('(c)·region · the region compiled but no queue factory resolved — the hold has no subject to drive')
    }
    expect(
      problems,
      '§2/§5(c) — the markered region carries the pinned names and is DRIVEN, never copied (docs/L1/unit-b-2-display-wire.md §2, §5(c), ASM-B2-2)',
    ).toEqual([])
  })

  it('(c) · TWO DELIVERIES BEFORE THE REALM STANDS ARE HELD, IN ORDER, WITH ZERO PUSHES (§5(c))', () => {
    const problems: string[] = []
    const subject = freshQueue(problems, '(c)·held')
    const address = displayAddress(problems, '(c)·held')

    if (subject !== null && address !== null) {
      const first = [...address, 'tab-a']
      const second = [...address, 'tab-b']
      attempt(problems, '(c)·held', () => {
        subject.queue.deliver(first)
        subject.queue.deliver(second)
        const msgs: string[] = []
        if (subject.pushes() !== 0) {
          msgs.push(
            `${subject.pushes()} push(es) were SENT while no realm stood — §5(c)/RR-B2-3: with no window the delivery holds the ADDRESS; a push here is a send into nothing, and the flush that follows would be indistinguishable from it`,
          )
        }
        const held = subject.queue.held
        if (held.length !== 2) {
          msgs.push(`\`held\` answers ${held.length} address(es) [${held.map((a) => show(a)).join(', ')}] — §5(c) pins BOTH pre-window deliveries held, in the order they arrived`)
        } else {
          if (show(held[0]) !== show(first) || show(held[1]) !== show(second)) {
            msgs.push(`\`held\` answers ${show(held.map((a) => [...a]))} while the deliveries were ${show([first, second])} — the hold is INSERTION-ORDERED and holds the ADDRESS VERBATIM (§5(c))`)
          }
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    expect(
      problems,
      '§5(c) — the pre-window hold is a queue of ADDRESSES (docs/L1/unit-b-2-display-wire.md §5(c); the foundation’s createDeliveryQueue, adopted)',
    ).toEqual([])
  })

  it('(c) · `arm()` SENDS EXACTLY ONE PUSH AND CLEARS THE HELD SET — unconditionally (§5(c))', () => {
    const problems: string[] = []
    const subject = freshQueue(problems, '(c)·arm')
    const address = displayAddress(problems, '(c)·arm')

    if (subject !== null && address !== null) {
      attempt(problems, '(c)·arm', () => {
        subject.queue.deliver([...address, 'tab-a'])
        subject.queue.deliver([...address, 'tab-b'])
        subject.queue.arm()
        const msgs: string[] = []
        if (subject.pushes() !== 1) {
          msgs.push(`\`arm()\` sent ${subject.pushes()} push(es) — §5(c) pins EXACTLY ONE: the flush re-emits the crossing's one signal, and two would tell the realm nothing the first did not`)
        }
        if (subject.queue.held.length !== 0) {
          msgs.push(`\`held\` still answers ${subject.queue.held.length} address(es) after the flush — the CLEAR is unconditionally part of the arm, or the hold grows with the app's age`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    expect(
      problems,
      '§5(c) — the unconditional flush (docs/L1/unit-b-2-display-wire.md §5(c), RR-B2-3)',
    ).toEqual([])
  })

  it('(c) · A DELIVERY AFTER THE FLUSH IS A PUSH WITH NOTHING HELD — and a RELOADED realm is owed ONE MORE push (§5(c))', () => {
    const problems: string[] = []
    const subject = freshQueue(problems, '(c)·reload')
    const address = displayAddress(problems, '(c)·reload')

    if (subject !== null && address !== null) {
      attempt(problems, '(c)·after-flush', () => {
        subject.queue.deliver([...address, 'tab-a'])
        subject.queue.arm()
        const afterFlush = subject.pushes()
        subject.queue.deliver([...address, 'tab-c'])
        const msgs: string[] = []
        if (subject.pushes() !== afterFlush + 1) {
          msgs.push(`a delivery AFTER the flush produced ${subject.pushes() - afterFlush} push(es) — once armed, a delivery is sent immediately and held by nothing (§5(c))`)
        }
        if (subject.queue.held.length !== 0) {
          msgs.push(`\`held\` answers ${subject.queue.held.length} address(es) after an armed delivery — nothing is held behind an armed queue`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })

      attempt(problems, '(c)·reloaded-realm', () => {
        const before = subject.pushes()
        subject.queue.arm()
        const msgs: string[] = []
        if (subject.pushes() !== before + 1) {
          msgs.push(
            `a SECOND \`arm()\` (a reloaded realm) produced ${subject.pushes() - before} push(es) — §5(c)/RR-B2-3 pin ONE MORE: a flush that only fired when something was held would leave the reloaded realm unpainted until the next record change`,
          )
        }
        if (subject.queue.held.length !== 0) {
          msgs.push('`held` is not empty after the reloaded realm\'s arm')
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    expect(
      problems,
      '§5(c) — a reloaded realm is owed one more push (docs/L1/unit-b-2-display-wire.md §5(c), RR-B2-3)',
    ).toEqual([])
  })

  it('(c) · THE HOLD IS TOTAL AT ITS EDGES — a value that is not an address is held NOWHERE and throws NOTHING, and a push that THROWS still clears the held set (`B2-ADV2-03`, measured at the landing)', () => {
    const problems: string[] = []
    const subject = queueSubject()
    const address = displayAddress(problems, '(c)·edges')

    if (subject.problem !== null) {
      problems.push(`(c)·edges · ${subject.problem}`)
    } else if (subject.make === null) {
      problems.push('(c)·edges · the region compiled but no factory was discovered — the edge arms have no subject to drive')
    } else if (address !== null) {
      const make = subject.make

      // ── EDGE 1: A VALUE THAT IS NOT AN ADDRESS. `CRG-5`'s total claim was FALSIFIED at the landing by measurement (`[...address]`
      // ── threw `TypeError: address is not iterable`), so this arm is the regression: nothing thrown, nothing held, no push.
      attempt(problems, '(c)·edges·non-address', () => {
        let pushes = 0
        const queue = make(() => {
          pushes += 1
        })
        const msgs: string[] = []
        const nonAddresses: unknown[] = [null, undefined, 'display/tab-a', 7, { 0: 'display' }]
        for (const bad of nonAddresses) {
          try {
            queue.deliver(bad as unknown as readonly string[])
          } catch (thrown) {
            msgs.push(
              `\`deliver(${show(bad)})\` THREW (${msgOf(thrown)}) — §5(c)/CRG-5 pins \`deliver\` TOTAL and total means at the EDGE too: an uncontained throw at a registration instant refuses the construction at the store's rank-21`,
            )
          }
        }
        if (queue.held.length !== 0) {
          msgs.push(`\`held\` answers ${queue.held.length} entr(ies) after ${nonAddresses.length} non-address deliveries — a value that is no address is not something this queue may hold, and a held half-address would be flushed as an address`)
        }
        if (pushes !== 0) msgs.push(`${pushes} push(es) were sent while no realm stood — a non-address delivery must move nothing at all`)
        return msgs.length > 0 ? msgs.join('; ') : null
      })

      // ── EDGE 2: A PUSH THAT THROWS. `CRG-3` says the CLEAR is unconditional; measured at the landing, an un-`finally`'d clear
      // ── ran AFTER the push, so a throwing sink left `armed` true with the hold surviving — the crossing half-flushed.
      attempt(problems, '(c)·edges·throwing-push', () => {
        const queue = make(() => {
          throw new Error('forged: the sink throws')
        })
        queue.deliver([...address, 'tab-edge'])
        const beforeHeld = queue.held.length
        if (beforeHeld !== 1) {
          return `the pre-arm delivery held ${beforeHeld} entr(ies) instead of 1 — the edge arm measured the wrong subject`
        }
        try {
          queue.arm()
        } catch {
          // THE PROPAGATION IS THE SINK'S OWN and is not this row's claim: what is pinned is that it cannot leave the crossing
          // half-flushed, so the throw is swallowed HERE and only the state afterwards is read.
        }
        return queue.held.length === 0
          ? null
          : `\`held\` still answers ${queue.held.length} entr(ies) after an \`arm()\` whose push THREW — §5(c)/CRG-3 pins the CLEAR as unconditional, and a sink's failure may not leave the hold to grow with the app's age (the clear must run in a \`finally\`)`
      })
    }

    expect(
      problems,
      '§5(c)/CRG-3/CRG-5 — the hold is total at its edges (docs/L1/unit-b-2-display-wire.md §5(c); `B2-ADV2-03`)',
    ).toEqual([])
  })

  it('(c) · THE CIVIL HALF OVER A REAL STORE — two entries written PRE-WINDOW are held in order, the flush is ONE push, the hold clears, a reloaded realm is owed one more, and BOTH entries are read after (§5(c))', async () => {
    const problems: string[] = []
    const subject = freshQueue(problems, '(c)·civil')
    const address = displayAddress(problems, '(c)·civil')

    const createProfileStore = readFn(storeroomModule, 'createProfileStore')
    const createDisplayDelivery = readFn(recordEngineModule, 'createDisplayDelivery')
    const createDisplayRecord = readFn(recordEngineModule, 'createDisplayRecord')
    const displayConstraintDeclarations = readFn(recordEngineModule, 'displayConstraintDeclarations')
    if (createProfileStore === null) problems.push('(c)·civil · `createProfileStore` does not resolve on the seam — the construction has no subject')
    if (createDisplayDelivery === null || createDisplayRecord === null) {
      problems.push('(c)·civil · `createDisplayDelivery`/`createDisplayRecord` do not both resolve on the barrel — the crossing has no halves')
    }
    if (displayConstraintDeclarations === null) {
      problems.push('(c)·civil · `displayConstraintDeclarations` does not resolve on the barrel — without `display-must-stand` the family never stands and no leaf write can land')
    }

    if (subject !== null && address !== null && createDisplayDelivery !== null && createDisplayRecord !== null && createProfileStore !== null && displayConstraintDeclarations !== null) {
      const leaves = { a: [...address, 'tab-a'], b: [...address, 'tab-b'] }
      let record: AnyRecord | null = null
      let pushesAfterConstruction = 0
      attempt(problems, '(c)·civil·construction', () => {
        // §2's order, exactly: the queue exists first (it is `main()`'s own), the sink IS its `deliver`, and the entries
        // are built before the store because `createProfileStore` reads its `listeners` INSIDE the call.
        const delivery = createDisplayDelivery((delivered: readonly string[]) => subject.queue.deliver(delivered)) as AnyRecord
        const entries = delivery.entries
        if (!Array.isArray(entries) || entries.length === 0) {
          return 'the delivery carries no `entries` — the construction has nothing to adopt'
        }
        let holder: unknown = null
        const store = createProfileStore({
          filePath: newProfilePath('civil'),
          listeners: [...(entries as unknown[])],
          constraints: [...(displayConstraintDeclarations(() => holder) as unknown[])],
        }) as AnyRecord
        holder = store
        record = createDisplayRecord({ store, delivery }) as AnyRecord
        pushesAfterConstruction = subject.pushes()
        // THE CREATION'S OWN DELIVERY IS HELD, NOT SENT: no window stands yet.
        if (pushesAfterConstruction !== 0) {
          return `${pushesAfterConstruction} push(es) were sent by the CONSTRUCTION — §5(c): the creation's own delivery fires before any window exists, so it must be HELD`
        }
        return null
      })

      if (record !== null && pushesAfterConstruction === 0) {
        const standing: AnyRecord = record
        attempt(problems, '(c)·civil·pre-window-writes', () => {
          const first = (standing.commitTab as AnyFn)('tab-a', entryFor('doc-a')) as AnyRecord
          const second = (standing.commitTab as AnyFn)('tab-b', entryFor('doc-b')) as AnyRecord
          const msgs: string[] = []
          if (first.ok !== true || second.ok !== true) {
            msgs.push(`a pre-window write was REFUSED (${show(first)} / ${show(second)}) — §5(c) writes two entries before the realm stands`)
          }
          if (subject.pushes() !== 0) {
            msgs.push(`${subject.pushes()} push(es) were sent by the two pre-window writes — the hold is what keeps them, and a push here went nowhere`)
          }
          const held = subject.queue.held.map((entry) => show([...entry]))
          const wanted = [leaves.a, leaves.b].map((leaf) => show(leaf))
          const observed = held.filter((addressText) => wanted.includes(addressText))
          if (observed.length !== wanted.length) {
            msgs.push(`\`held\` answers [${held.join(', ')}] and the two pre-window leaves [${wanted.join(', ')}] are not both in it, in order — §5(c)`)
          } else if (observed.join('|') !== wanted.join('|')) {
            msgs.push(`\`held\` orders the two leaves [${observed.join(', ')}] against the write order [${wanted.join(', ')}] — the hold is INSERTION-ORDERED`)
          }
          return msgs.length > 0 ? msgs.join('; ') : null
        })

        attempt(problems, '(c)·civil·flush', () => {
          const before = subject.pushes()
          subject.queue.arm()
          const msgs: string[] = []
          if (subject.pushes() !== before + 1) {
            msgs.push(`the flush produced ${subject.pushes() - before} push(es) — §5(c) pins EXACTLY ONE, and it is the one the realm's readiness owes it`)
          }
          if (subject.queue.held.length !== 0) {
            msgs.push(`\`held\` still answers ${subject.queue.held.length} address(es) after the flush — the clear is unconditional`)
          }
          return msgs.length > 0 ? msgs.join('; ') : null
        })

        // AND BOTH ENTRIES ARE READ AFTER THE FLUSH: the push carried nothing, so the realm's read is the whole payload.
        const createDisplayClient = readFn(displayClientModule, 'createDisplayClient')
        if (createDisplayClient === null) {
          problems.push('(c)·civil · `createDisplayClient` does not resolve on the LANDED `src/renderer/display-client.js`')
        } else {
          const client = createDisplayClient({
            read: () => (standing.read as AnyFn).call(standing),
            onChanged: () => () => undefined,
          }) as AnyRecord
          const read = (await (client.fill as AnyFn)()) as AnyRecord | null
          if (read === null) {
            problems.push('(c)·civil · the post-flush read answered `null` — the two entries written pre-window are unreadable')
          } else {
            for (const tabId of ['tab-a', 'tab-b']) {
              if (read[tabId] === undefined) {
                problems.push(`(c)·civil · the post-flush read ${show(read)} does not carry \`${tabId}\` — both pre-window entries must be read after the flush`)
              }
            }
          }
          await settle()
          attempt(problems, '(c)·civil·reloaded-realm', () => {
            const before = subject.pushes()
            subject.queue.arm()
            const msgs: string[] = []
            if (subject.pushes() !== before + 1) {
              msgs.push(`a reloaded realm's \`arm()\` produced ${subject.pushes() - before} push(es) — §5(c)/RR-B2-3 pin ONE MORE, unconditionally`)
            }
            if (subject.queue.held.length !== 0) msgs.push('`held` is not empty after the reloaded realm\'s arm')
            return msgs.length > 0 ? msgs.join('; ') : null
          })
        }
      }
    }

    expect(
      problems,
      '§5(c) — the civil half over a real store: two pre-window writes, one flush, a reloaded realm owed one more (docs/L1/unit-b-2-display-wire.md §5(c))',
    ).toEqual([])
  })
})
