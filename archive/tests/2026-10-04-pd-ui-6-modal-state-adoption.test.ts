// tests/pd-ui-6-modal-state-adoption.test.ts — unit `PD-UI-6` (THE SETTINGS-MODAL /
// OVERLAY ADOPTION, wave `W1` of the post-division rebuild): the BEHAVIOURAL /
// ADOPTION / WIRING / ESCAPE-CONTRACT / SOURCE-PIN rows. The unit's typed `§4` register
// (8 rows, `P-MD-*`) lives in `tests/pd-ui-6-modal-state-register.test.ts`.
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-pd-ui-6-modal-state.md
//     §1.1 item 9/12/14   the call site, the consumer-edge pin's state, the authored surface
//     §1.2                the scope in four clauses: ADOPTED (the decision half) · KEPT (the
//                         wiring half) · KEPT (the re-parent, against the foundation's REFUSAL) ·
//                         EXCLUDED (the applied inert write — `PD-OVERLAY-2`, PARKED). This file
//                         asserts the exclusion by NEVER naming the excluded thing at all.
//     §2.1                the adapter's export census: the four KEPT names + the ONE declared
//                         type `ModalVerb`; `createModalController(options?)`; the PRESERVED
//                         call shape/arity; the ONE new import statement
//     §2.2                the KEPT wiring, item by item (items 1–11)
//     §2.3                the adopted word, the verb normalization table, the FULL `4 × 5 = 20`
//                         matrix, the adapter's method→verb mapping, the reachable set (TWO)
//     §2.4                the `changed`-driven class mirror and its three KEPT properties
//     §2.5                THE ESCAPE CONTRACT (the ruling): the route binds `'escape'`, the
//                         callback is an ARGUMENT (three arms), the invocation schedule
//     §2.6                the dropped-parameter signature `installSettingsModal(): void` and
//                         the two literal mount ids that SURVIVE
//     §2.7                the re-parent half, preserved EXACTLY, with the HARD INVARIANT
//     §3.1/§3.2/§3.3/§3.4 EVERY declared fail-state of the mechanism, the controller, the
//                         callback and the wiring
//     §0B item 1     THE `R1` RULING on `§3.1` item 2: an out-of-body state is a
//                    NORMALIZE-AND-NOTHING-MOVES drive — `{state: 'closed', changed: false}`
//                    for EVERY verb body, `'open'` INCLUDED — and the callable callback is
//                    STILL invoked exactly once on the `'escape'` drive (the guard is
//                    VERB-ONLY). The row below asserts the CORRECTED reading, never the
//                    corrected-away one.
//     §6.1 order 7        these rows do NOT need the live leg; the re-parent and class-mirror
//                         rows are GREEN-ON-ARRIVAL (the unit's REGRESSION GUARD), the source
//                         pins and the adopted-dependence rows are this unit's RED
//     §6.4                the `[T]`-side obligations (no mock binding of any kind)
//
// LAYER (`RCA-12`, mandatory): `[T]` — node/pure and source-text reads. These rows prove the
// adapter's returned values and the mirrored class set under the dom-shim, and the shape of
// two `src/**` files. They do NOT prove a painted modal, a real CSS `display` decision, a real
// hit-test on the scrim, or that the app boots. NOTHING here is app-green, and no row is live.
//
// RED-FIRST (`RCA-1`): at this head the adapter is the LANDED `settle`-guarded boolean machine
// — no adopted state word, no call into the vendored mechanism, no `callback` option and no
// `'escape'` binding. The rows that read the ADOPTED surface therefore RED (naming the contract
// they require), while the rows whose subject the unit KEEPS (the re-parent, the class mirror,
// the affordances, the fail-soft set) are GREEN-ON-ARRIVAL and are authored as the unit's
// regression guard — §6.1 order 7 says so per row, and this file says which is which.
//
// The two `G-9`-frozen censuses this file must not move: `tests/pd-vendor-set.test.ts`'s
// electron census (five names) and its NON-`'electron'` binder census (four paths). This file
// therefore binds the vitest mock API in NO form — not `vi.mock`, not `vi['mock']`, not an
// alias — and imports from `vitest` only `describe`/`it`/`expect`/`beforeEach`/`beforeAll`.
import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'
import { installShim, shimDocument, ShimElement } from '../src/shared/dom-shim.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const MODAL_PATH = join(REPO_ROOT, 'src', 'renderer', 'modal-state.ts')
const RENDERER_PATH = join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')
const VENDORED_PATH = join(REPO_ROOT, 'src', 'shared', 'overlay.ts')
const INDEX_HTML_PATH = join(REPO_ROOT, 'src', 'renderer', 'index.html')

function readText(path: string): string {
  try {
    return readFileSync(path, 'utf8')
  } catch (e) {
    throw new Error(`PD-UI-6 [T] read failure: ${path} — ${(e as Error).message}`)
  }
}

let modalSrc = ''
let rendererSrc = ''
beforeAll(() => {
  modalSrc = readText(MODAL_PATH)
  rendererSrc = readText(RENDERER_PATH)
})

/** `§6.4` item 1 — the forbidden BINDING forms of the vitest mock API, written so this
 *  file's own bytes carry no forbidden literal (the self-scan below is the reason: a file
 *  whose guard-text contains the guarded pattern cannot scan itself honestly). The oracle
 *  is driven on the synthetic controls FIRST, so it is shown to discriminate before it is
 *  applied to this file. The three forms are a PROPERTY ACCESS of the mock member, a
 *  COMPUTED access of it, and an ALIASING import of it. */
const Q = String.fromCharCode(39) // the quote character, built rather than written
const MOCK_MEMBER = 'm' + 'ock'
const MOCK_NEEDLES: string[] = [
  '.' + MOCK_MEMBER + '(',
  '[' + Q + MOCK_MEMBER + Q + '](',
  'as v' + 'i' + ' ',
]

/** The DISCRIMINATION controls for the oracle above, driven on SYNTHETIC sources — never by
 *  writing a file into `tests/**`. A binding of the mock API must be caught in every access
 *  form; a construct inside a string literal, and a type-position reference, must not be. */
const MOCK_ORACLE_CONTROLS: Array<{ label: string; source: string; mustMatch: boolean }> = [
  {
    label: 'a DIRECT binding of the mock API',
    source: ["import { vi } from 'vitest'", 'vi' + '.' + MOCK_MEMBER + '("electron")'].join('\n'),
    mustMatch: true,
  },
  {
    label: 'a COMPUTED access of the mock API on its namespace',
    source: ["import * as vitest from 'vitest'", 'vitest[' + Q + MOCK_MEMBER + Q + ']("electron")'].join('\n'),
    mustMatch: true,
  },
  {
    label: 'an ALIASED import of the mock API',
    source: ["import { vi as v } from 'vitest'", 'v' + '.' + MOCK_MEMBER + '("electron")'].join('\n'),
    mustMatch: true,
  },
  {
    label: 'a COMPUTED access of the mock member on a LOCAL alias',
    source: ["import { vi as v } from 'vitest'", 'v[' + Q + MOCK_MEMBER + Q + ']("electron")'].join('\n'),
    mustMatch: true,
  },
  {
    label: 'a construct inside a string literal (not a binding)',
    source: 'const fixture = ' + Q + 'a' + Q + '\n',
    mustMatch: false,
  },
  {
    label: 'a type-position reference (a reference, not a binding call)',
    source: "type M = import('vitest').Mock\nconst x: M | null = null\n",
    mustMatch: false,
  },
]

// ===========================================================================
// THE ADOPTED SURFACE — the vendored mechanism, loaded once.
//
// §2.1: `src/shared/overlay.ts` is byte-pinned (`md5 931339d71ac0220e400190296d408ee5`,
// `lineCount 62`) and is WRAPPED, never patched. This file READS it and calls it; it
// writes no `src/**` byte.
// ===========================================================================
type AdoptedBody = 'closed' | 'open' | 'held' | 'closing'
type AdoptedRecord = { state: AdoptedBody; changed: boolean }
type TransitionFn = (state: unknown, verb: unknown, callback?: unknown) => AdoptedRecord

let vendoredTransition: TransitionFn | null = null

async function loadVendored(): Promise<TransitionFn> {
  if (vendoredTransition !== null) return vendoredTransition
  const mod = (await import(/* @vite-ignore */ pathToFileURL(VENDORED_PATH).href)) as Record<string, unknown>
  const fn = mod.overlayTransition
  if (typeof fn !== 'function') {
    throw new Error(
      `PD-UI-6 contract failure [§2.1]: the vendored module ${VENDORED_PATH} must export \`overlayTransition(state, verb, callback?)\` — the adopted DECISION half the unit re-expresses \`createModalController\` over`,
    )
  }
  vendoredTransition = fn as TransitionFn
  return vendoredTransition
}

// ===========================================================================
// THE ADAPTER LOADER.
//
// The red must be a CONTRACT failure naming the required surface, never a collection
// error: if the module cannot be loaded, or an export is absent, each row fails with the
// contract's own words.
// ===========================================================================
interface ModalController {
  open(): void
  close(): void
  toggle(): void
  isOpen(): boolean
}
interface ModalStateModule {
  createModalController?: (options?: unknown) => ModalController
  installSettingsModal?: (...args: unknown[]) => void
}

async function loadModalState(): Promise<ModalStateModule> {
  try {
    return (await import('../src/renderer/modal-state.js')) as unknown as ModalStateModule
  } catch (e) {
    throw new Error(
      `PD-UI-6 contract failure [§2.1]: src/renderer/modal-state.ts must export the adopted adapter — ${(e as Error).message}`,
    )
  }
}

async function requireFactory(): Promise<(options?: unknown) => ModalController> {
  const mod = await loadModalState()
  const fn = mod.createModalController
  if (typeof fn !== 'function') {
    throw new Error(
      'PD-UI-6 contract failure [§2.1]: `createModalController(options?)` must be exported from src/renderer/modal-state.ts — a fresh controller whose `open()`/`close()`/`toggle()` return void, whose `isOpen()` returns a boolean, and which is TOTAL for every option shape',
    )
  }
  return fn
}

/**
 * The wiring's INVOCATION SHAPE under `§2.6`. The corrected signature is
 * `installSettingsModal(): void` — the three parameters are DROPPED — so the adapter is
 * invoked with NO argument. A row that reaches this helper reds, at this head, with the
 * dropped-parameter contract named.
 */
async function requireInstall(): Promise<() => void> {
  const mod = await loadModalState()
  const fn = mod.installSettingsModal
  if (typeof fn !== 'function') {
    throw new Error(
      'PD-UI-6 contract failure [§2.6]: `installSettingsModal(): void` must be exported from src/renderer/modal-state.ts — the wiring half KEPT, with its three parameters DROPPED',
    )
  }
  return (): void => (fn as () => void)()
}

/** §3.2 item 8 — "every method never throws". Returns the throw's message, or `null`. */
function caught(fn: () => unknown): string | null {
  try {
    fn()
    return null
  } catch (e) {
    return (e as Error)?.message ?? String(e)
  }
}

/** §3.2: a method's return value must be read AND be legal. `open()`/`close()`/`toggle()`
 *  return `void`, so a non-`undefined` return is itself a contract deviation. */
function voidVerdict(c: ModalController, m: 'open' | 'close' | 'toggle'): string | null {
  let returned: unknown = 'NOT_CALLED'
  const throwText = caught(() => {
    returned = (c as unknown as Record<string, () => unknown>)[m]()
  })
  if (throwText !== null) return `${m}() threw: ${throwText}`
  if (returned !== undefined) return `${m}() returned ${String(returned)} — the declared return shape is void`
  return null
}

function isOpenVerdict(c: ModalController): string | null {
  let value: unknown = 'NOT_CALLED'
  const throwText = caught(() => {
    value = c.isOpen()
  })
  if (throwText !== null) return `isOpen() threw: ${throwText}`
  if (typeof value !== 'boolean') return `isOpen() returned ${String(value)} (${typeof value}) — the declared return shape is boolean`
  return null
}

// ===========================================================================
// §2.3 item 3 — THE FULL `4 × 5 = 20` MATRIX, transcribed cell by cell from the spec's
// table (`M` = moved). A cell's `previous` is its NORMALIZED state, which is what the
// mechanism measures `changed` against (`§3.1` item 2).
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

/** §2.3 item 2 — the verb normalization table's five declared bodies. */
const FIVE_VERBS: readonly string[] = ['open', 'close', 'toggle', 'escape', 'unknown'] as const

/** §2.3 item 2 row (6) — every OTHER value is the declared no-move body. */
const OUT_OF_ALPHABET_VERBS: readonly unknown[] = [
  'dismiss',
  'CLOSE',
  '',
  ' closed',
  'Escape',
  'is-open',
  undefined,
  null,
  42,
  true,
  Symbol('v'),
  12n,
  { verb: 'open' },
  ['open'],
  (): void => undefined,
] as const

/** §3.1 item 2 — the state shapes the mechanism must normalize to `'closed'`, each with
 *  the count of coercion-hook invocations it must observe (pinned at `0`). */
function hostileStateShapes(): Array<{ label: string; value: unknown; hookCalls: () => number }> {
  let hookCalls = 0
  const recording = {
    toString(): string {
      hookCalls++
      return 'open'
    },
    valueOf(): string {
      hookCalls++
      return 'open'
    },
  }
  const revoked = Proxy.revocable({ state: 'open' }, {})
  revoked.revoke()
  const hostile = new Proxy(
    { state: 'open' },
    {
      get(): never {
        throw new Error('hostile get')
      },
      has(): never {
        throw new Error('hostile has')
      },
      getPrototypeOf(): never {
        throw new Error('hostile prototype')
      },
    },
  )
  return [
    { label: 'undefined', value: undefined, hookCalls: () => 0 },
    { label: 'null', value: null, hookCalls: () => 0 },
    { label: "''", value: '', hookCalls: () => 0 },
    { label: "'closed '", value: 'closed ', hookCalls: () => 0 },
    { label: "'OPEN'", value: 'OPEN', hookCalls: () => 0 },
    { label: 'a number', value: 7, hookCalls: () => 0 },
    { label: 'a boolean', value: true, hookCalls: () => 0 },
    { label: 'a Symbol', value: Symbol('s'), hookCalls: () => 0 },
    { label: 'a 12n', value: 12n, hookCalls: () => 0 },
    { label: 'an object', value: {}, hookCalls: () => 0 },
    { label: 'an array', value: ['open'], hookCalls: () => 0 },
    { label: 'a function', value: (): void => undefined, hookCalls: () => 0 },
    { label: 'a recording toString/valueOf object', value: recording, hookCalls: () => hookCalls },
    { label: 'a hostile Proxy', value: hostile, hookCalls: () => 0 },
    { label: 'a revoked Proxy', value: revoked.proxy, hookCalls: () => 0 },
  ]
}

// ===========================================================================
// §2.4 — THE CLASS MIRROR UNDER THE ADOPTED GUARD.
//
// `Mirror` is the REFERENCE implementation of `§2.2` item 6 + `§2.4` clauses 1–4: it
// holds the adopted state word, calls the mechanism, replaces its word with the returned
// `state`, and performs the class write IF AND ONLY IF the returned `changed` is `true`.
// `LandedGuardMirror` is the SUPERSEDED guard (`isOpen()` compared before and after) —
// the equivalence partner `P-MD-SM-2` requires and the control that must DIVERGE on the
// injected arms. `NonOpenIsAChangeMirror` is `§2.4`'s third control.
// ===========================================================================
class Mirror {
  word: AdoptedBody
  writes = 0
  tokens: string[]

  constructor(initial: AdoptedBody, tokens: string[] = ['settings-modal']) {
    this.word = initial
    this.tokens = [...tokens, initial === 'open' ? 'is-open' : 'is-closed']
  }

  decision(next: AdoptedBody, changed: boolean): boolean {
    void next
    return changed
  }

  drive(transition: TransitionFn, verb: unknown, callback?: unknown): AdoptedRecord {
    const before = this.word
    const record = transition(before, verb, callback)
    this.word = record.state
    if (this.decision(record.state, record.changed)) this.write()
    return record
  }

  write(): void {
    const keep = this.tokens.filter((t) => t !== 'is-open' && t !== 'is-closed')
    this.tokens = [...keep, this.word === 'open' ? 'is-open' : 'is-closed']
    this.writes++
  }
}

class LandedGuardMirror extends Mirror {
  lastBeforeIsOpen = false

  override decision(next: AdoptedBody, changed: boolean): boolean {
    void changed // the landed guard reads NO record member — it compares `isOpen()`
    return (next === 'open') !== this.lastBeforeIsOpen
  }

  override drive(transition: TransitionFn, verb: unknown, callback?: unknown): AdoptedRecord {
    this.lastBeforeIsOpen = this.word === 'open'
    return super.drive(transition, verb, callback)
  }
}

class NonOpenIsAChangeMirror extends Mirror {
  override decision(next: AdoptedBody, changed: boolean): boolean {
    void changed
    return next !== 'open'
  }
}

// ===========================================================================
// THE ADAPTER CORPUS — `src/renderer/modal-state.ts`'s OWN BYTES, compiled with ONLY its
// (single, vendored) import declaration replaced by a destructuring bind of an INJECTED
// transition function. Every other byte is the landed source, so a corpus drive tests the
// LANDED artifact rather than a re-write of it. This is the instrument that makes
// `P-MD-IM-2`'s callback arm and `P-MD-TP-2`'s verb/state discipline drivable, and the
// `§2.4` record-primacy clause falsifiable by an injected record.
// ===========================================================================
interface CallLog {
  state: unknown
  verb: unknown
  callback: unknown
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
 *  a contract reading, and one the red head's earlier abort hid.
 *
 *  WHICH SHAPE, AND WHY THIS ONE: the two candidates are (a) an OBJECT-shaped injected value
 *  under the existing destructuring bind, and (b) re-emitting the bind as a single-name
 *  passthrough (`const overlayTransition = __PD_UI_6_TRANSITION__`) fed the bare function.
 *  They are EQUIVALENT for the discrimination this corpus exists for — either way the
 *  substituted member is a caller-supplied function whose returned record may CONTRADICT the
 *  raw arguments (`falsifyingCorpus`), and the adapter's own bytes decide everything else.
 *  (a) is taken because it is the SIBLING UNIT'S substitution form, needs no change to the
 *  emitted bind, and stays correct about the import's own binding structure: the object is
 *  keyed by the declared SOURCE names, so an aliased import keeps its meaning where a
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

function instantiateCorpus(stub: (state: unknown, verb: unknown, callback?: unknown) => AdoptedRecord): {
  calls: CallLog[]
  createModalController: (options?: unknown) => ModalController
  installSettingsModal: (...args: unknown[]) => void
} {
  const src = readText(MODAL_PATH)
  const sf = ts.createSourceFile('adapter-corpus.ts', src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const imports = sf.statements.filter(ts.isImportDeclaration)
  if (imports.length !== 1) {
    throw new Error(
      "PD-UI-6 contract failure [§2.1 import census]: src/renderer/modal-state.ts must carry EXACTLY ONE import statement (the vendored edge `import { overlayTransition } from '../shared/overlay.js'`); the corpus reads " +
        String(imports.length),
    )
  }
  const decl = imports[0]!
  const spec = ts.isStringLiteralLike(decl.moduleSpecifier) ? decl.moduleSpecifier.text : '<computed>'
  const named = decl.importClause?.namedBindings
  if (named === undefined || !ts.isNamedImports(named)) {
    throw new Error(
      `PD-UI-6 contract failure [§2.1 import census]: the adapter's single import must be a NAMED import of the vendored member from '${spec}' — a namespace or default form is not the declared edge`,
    )
  }
  const bindings = named.elements.map((el) => `${(el.propertyName ?? el.name).text}: ${el.name.text}`)
  const replacement = `const { ${bindings.join(', ')} } = __PD_UI_6_TRANSITION__`
  const transformed = src.slice(0, decl.getStart(sf)) + replacement + src.slice(decl.getEnd())
  const js = ts.transpileModule(transformed, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText
  const mod: { exports: Record<string, unknown> } = { exports: {} }
  new Function('exports', '__PD_UI_6_TRANSITION__', js)(mod.exports, injectedTransitionValue(named, stub))
  const create = mod.exports.createModalController
  if (typeof create !== 'function') {
    throw new Error(
      'PD-UI-6 contract failure [§2.1]: the corpus must export `createModalController(options?)` — the adapter the unit re-expresses over the vendored mechanism',
    )
  }
  return {
    calls: [],
    createModalController: create as (options?: unknown) => ModalController,
    installSettingsModal: (mod.exports.installSettingsModal ?? ((): void => undefined)) as (...args: unknown[]) => void,
  }
}

interface Corpus {
  calls: CallLog[]
  createModalController: (options?: unknown) => ModalController
  installSettingsModal: (...args: unknown[]) => void
}

/** THE CORPUS THE ADOPTED ROWS DRIVE: a RECORDING wrapper over the REAL vendored
 *  mechanism, so the recorded pair is the mechanism's own while every (state, verb,
 *  callback) triple the adapter hands in is OBSERVED. */
async function recordingCorpus(): Promise<Corpus> {
  const real = await loadVendored()
  let corpus: Corpus
  const stub = (state: unknown, verb: unknown, callback?: unknown): AdoptedRecord => {
    corpus.calls.push({ state, verb, callback })
    return real(state, verb, callback)
  }
  const built = instantiateCorpus(stub)
  corpus = { calls: built.calls, createModalController: built.createModalController, installSettingsModal: built.installSettingsModal }
  return corpus
}

/** THE FALSIFYING CORPUS (`§2.4`'s "the guard is the RECORD's" clause): the mechanism is
 *  replaced by a stub whose reported `changed` CONTRADICTS the landed `isOpen()`
 *  comparison — `changed: false` on the `'closed'`→`'open'` move, `changed: false` on the
 *  `'open'`→`'closed'` move. An adapter that reads the RECORD follows it (state moves, and
 *  the class mirror — driven by `changed` — performs NO write); an adapter that recomputes
 *  the guard from `isOpen()` or from the verb's identity cannot. */
async function falsifyingCorpus(): Promise<Corpus> {
  const real = await loadVendored()
  let corpus: Corpus
  const stub = (state: unknown, verb: unknown, callback?: unknown): AdoptedRecord => {
    corpus.calls.push({ state, verb, callback })
    const record = real(state, verb, callback)
    if (verb === 'open' || verb === 'toggle' || verb === 'escape') return { state: record.state, changed: false }
    return record
  }
  const built = instantiateCorpus(stub)
  corpus = { calls: built.calls, createModalController: built.createModalController, installSettingsModal: built.installSettingsModal }
  return corpus
}

// ===========================================================================
// THE DOM-SHIM WIRING HARNESS (`§2.2`/`§2.7`/`§3.4`) — the four literal ids, one
// listener per affordance, the class mirror's XOR, the re-parent, the per-document marker.
// ===========================================================================
interface Authored {
  frame: ShimElement
  toggle: ShimElement
  scrim: ShimElement
  modalBody: ShimElement
  panes: ShimElement
  opPanes: ShimElement
  layout: ShimElement
}

function authorModal(): Authored {
  const doc = globalThis.document as unknown as { body: ShimElement; getElementById(id: string): ShimElement }
  const body = doc.body
  const layout = new ShimElement('div')
  // the app-graph side of the tree, which the HARD INVARIANT (§2.7 item 4) keeps OUT
  const app = new ShimElement('div')
  app.id = 'app'
  const tabStrip = new ShimElement('div')
  tabStrip.id = 'tab-strip'
  body.appendChild(app)
  body.appendChild(tabStrip)
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
  return { frame, toggle, scrim, modalBody, panes, opPanes, layout }
}

function tokensOf(el: { className: string }): string[] {
  return el.className.split(/\s+/).filter(Boolean)
}

function listenersOn(el: ShimElement, type: string): number {
  return (el as unknown as { listeners: Record<string, unknown[]> }).listeners[type]?.length ?? 0
}

function docListenerCount(): number {
  return (shimDocument as unknown as { listeners: Record<string, unknown[]> }).listeners['keydown']?.length ?? 0
}

/** Instrument the frame's `className` with a counting setter so ANY write by the wiring is
 *  counted deterministically (the re-derived `SH7-ADV2` instrument). */
function countClassWrites(frame: ShimElement): { reads: () => number } {
  let writes = 0
  let backing = frame.className
  Object.defineProperty(frame, 'className', {
    configurable: true,
    get() {
      return backing
    },
    set(v: string) {
      writes++
      backing = v
    },
  })
  return { reads: () => writes }
}

// ===========================================================================
// §2.1 — `ModalVerb`, the ONE declared type (`D-8`), and the PRESERVED export census.
// ===========================================================================
describe('PD-UI-6 §2.1 — the adapter surface (`ModalVerb` declared, the four KEPT names preserved)', () => {
  it("§2.1 / D-8 — `ModalVerb` is DECLARED as exactly the four MOVING bodies, and never one of the four non-kinds `is-open`/`is-closed`/`settings-modal`/`scrim`", () => {
    expect(
      /export\s+type\s+ModalVerb\s*=/.test(modalSrc),
      "PD-UI-6 contract failure [§2.1]: `export type ModalVerb = …` must be declared on src/renderer/modal-state.ts — it is the adapter's own four-body verb vocabulary",
    ).toBe(true)
    const decl = /export\s+type\s+ModalVerb\s*=\s*([^\n]+)/.exec(modalSrc)
    expect(decl, 'the `ModalVerb` declaration must be a single readable union line').not.toBeNull()
    const bodies = [...decl![1]!.matchAll(/'([a-zA-Z-]+)'/g)].map((m) => m[1]!)
    expect(bodies, '§2.1: `ModalVerb` is exactly the four MOVING bodies `open` | `close` | `toggle` | `escape`').toEqual(['open', 'close', 'toggle', 'escape'])
    expect(
      bodies,
      "§2.1: `'unknown'` is deliberately NOT a member of `ModalVerb` — it is the mechanism's declared no-move body and a normalization TARGET, never a verb the adapter may choose",
    ).not.toContain('unknown')
    for (const forkToken of ['is-open', 'is-closed', 'settings-modal', 'scrim']) {
      expect(bodies, `§2.8: the adapter never pushes a FORK token ("${forkToken}") as a verb — the mechanism must never interpret the fork's vocabulary`).not.toContain(forkToken)
    }
  })

  it('§2.1 / §2.2 item 5 — the four KEPT exports keep their names, and `createModalController` keeps its single-optional-argument call shape', () => {
    for (const name of ['ModalControllerOptions', 'ModalController', 'createModalController', 'installSettingsModal']) {
      expect(modalSrc, `§2.1: the export census keeps \`${name}\``).toContain(name)
    }
    expect(modalSrc, '§2.1: `createModalController` takes a SINGLE optional argument').toMatch(/export\s+function\s+createModalController\s*\(\s*options\?/)
  })
})

// ===========================================================================
// §2.3 item 3 — THE FULL `4 × 5 = 20` MATRIX. Twenty cells, every cell declared, NO
// `undefined-until-answered` cell (§3.1 item 1).
// ===========================================================================
describe('PD-UI-6 §2.3 item 3 — the declared `4 × 5 = 20` matrix, cell by cell (the adopted DECISION half)', () => {
  it('§2.3 item 3 — every one of the 20 declared cells answers the declared `{state, changed}` pair (20 cells × 2 observations)', async () => {
    const transition = await loadVendored()
    const wrong: string[] = []
    for (const cell of MATRIX) {
      let record: AdoptedRecord
      try {
        record = transition(cell.state, cell.verb)
      } catch (e) {
        wrong.push(`(${cell.state}, ${cell.verb}) — THREW: ${(e as Error).message}; §3.1 item 12: the mechanism NEVER throws, for any argument, and has no refusal domain`)
        continue
      }
      if (record.state !== cell.next) wrong.push(`(${cell.state}, ${cell.verb}) — state ${String(record.state)}, declared ${cell.next}`)
      if (record.changed !== cell.moved) wrong.push(`(${cell.state}, ${cell.verb}) — changed ${String(record.changed)}, declared ${String(cell.moved)}`)
    }
    expect(wrong, '§2.3 item 3: every cell of the declared 4 × 5 matrix must answer the declared pair — no cell is undefined-until-answered').toEqual([])
  })

  it('§2.3 item 3 invariant (i) — `changed === (next !== previous)` on EVERY cell, where `previous` is the NORMALIZED current state (20 cells)', async () => {
    const transition = await loadVendored()
    const wrong: string[] = []
    for (const cell of MATRIX) {
      const record = transition(cell.state, cell.verb)
      if (record.changed !== (record.state !== cell.state)) {
        wrong.push(`(${cell.state}, ${cell.verb}) — changed=${String(record.changed)} but next !== previous is ${String(record.state !== cell.state)}`)
      }
    }
    expect(wrong, "§2.1 item 2 / §2.3 item 3 invariant (i): `changed` is the move OBSERVABLE — never the caller's claim and never the verb's identity").toEqual([])
  })

  it('§2.3 item 3 invariant (ii) — every NON-MOVING cell answers ITS OWN state and carries `changed: false` (12 cells)', async () => {
    const transition = await loadVendored()
    const wrong: string[] = []
    let nonMoving = 0
    for (const cell of MATRIX) {
      if (cell.moved) continue
      nonMoving++
      const record = transition(cell.state, cell.verb)
      if (record.state !== cell.state) wrong.push(`(${cell.state}, ${cell.verb}) — a non-moving cell must answer ITS OWN state, got ${record.state}`)
      if (record.changed !== false) wrong.push(`(${cell.state}, ${cell.verb}) — a non-moving cell must carry changed: false, got ${String(record.changed)}`)
    }
    expect(nonMoving, 'the declared matrix carries exactly NINE non-moving cells (the `M`-free cells of §2.3 item 3: `closed`×{close,escape,unknown} · `open`×{open,unknown} · `held`×{open,toggle,unknown} · `closing`×{unknown})').toBe(9)
    expect(wrong).toEqual([])
  })

  it("§2.3 item 3 invariant (iii) / §3.1 item 11 — a returned record is FRESH, plain and unfrozen, carries EXACTLY `['state','changed']` in declared order, and holds no fifth body", async () => {
    const transition = await loadVendored()
    const wrong: string[] = []
    for (const cell of MATRIX) {
      const a = transition(cell.state, cell.verb)
      const b = transition(cell.state, cell.verb)
      if (Object.keys(a).join(',') !== 'state,changed') wrong.push(`(${cell.state}, ${cell.verb}) — Object.keys reads [${Object.keys(a).join(',')}], declared order is ['state','changed']`)
      if (Object.getPrototypeOf(a) !== Object.prototype) wrong.push(`(${cell.state}, ${cell.verb}) — the record must be a PLAIN object (prototype Object.prototype)`)
      if (Object.isFrozen(a)) wrong.push(`(${cell.state}, ${cell.verb}) — the record must be UNFROZEN`)
      if (a === b) wrong.push(`(${cell.state}, ${cell.verb}) — each call must return a FRESH record`)
      if (a.state !== b.state || a.changed !== b.changed) wrong.push(`(${cell.state}, ${cell.verb}) — two identical calls must carry equal member VALUES`)
      if (!FOUR_BODIES.includes(a.state)) wrong.push(`(${cell.state}, ${cell.verb}) — the returned state ${String(a.state)} is NOT one of the four declared bodies (no fifth body, no refusal sentinel)`)
    }
    expect(wrong).toEqual([])
  })

  it('§3.1 item 12 — NO invocation with ANY argument shape throws: the mechanism has no refusal domain, for every cell, every out-of-alphabet verb and every hostile state shape', async () => {
    const transition = await loadVendored()
    const shapes: unknown[] = [undefined, null, '', 'closed ', 'OPEN', 7, true, Symbol('s'), 12n, {}, ['open'], (): void => undefined]
    const wrong: string[] = []
    for (const shape of shapes) {
      for (const verb of FIVE_VERBS) {
        const text = caught(() => transition(shape, verb))
        if (text !== null) wrong.push(`state=${String(shape)} verb=${verb} THREW: ${text}`)
      }
    }
    for (const verb of [...FIVE_VERBS, ...OUT_OF_ALPHABET_VERBS]) {
      const text = caught(() => transition('open', verb))
      if (text !== null) wrong.push(`verb=${String(verb)} THREW: ${text}`)
    }
    for (const shape of hostileStateShapes()) {
      for (const verb of FIVE_VERBS) {
        const text = caught(() => transition(shape.value, verb))
        if (text !== null) wrong.push(`state=${shape.label} verb=${verb} THREW: ${text}`)
      }
    }
    const record = transition('open', 'toggle') as unknown as Record<string, unknown>
    expect(
      ['ok', 'code', 'reason', 'thrown'].filter((k) => k in record),
      '§3.1 item 12: there is no `ok`/`code`/`reason`/`thrown` anywhere — neither function has a refusal domain',
    ).toEqual([])
    expect(wrong, '§3.1 item 12: "NEITHER FUNCTION EVER THROWS, FOR ANY ARGUMENT, AND NEITHER HAS A REFUSAL DOMAIN"').toEqual([])
  })

  it("§3.1 item 2 (CORRECTED per `§0B` item 1 / `R1`) — a hostile/out-of-body STATE is a NORMALIZE-AND-NOTHING-MOVES drive for EVERY verb body (`'open'` INCLUDED): `{state: 'closed', changed: false}`, with NO coercion hook consulted (count 0) and the callable callback STILL invoked EXACTLY ONCE on the `'escape'` drive (the guard is VERB-ONLY)", async () => {
    const transition = await loadVendored()
    const wrong: string[] = []
    // THE DRIVE-BY-DRIVE TABLE `§3.1` item 2's cell now carries in substance (`§0B` item 1):
    // (1)–(4) the five declared verb bodies from an out-of-body state · (5) the declared no-move
    // body and every other unrecognized verb · (6) every other value shape (the shape list of
    // `hostileStateShapes()` below) — each with the SAME returned record and the callback
    // invoked ONLY on `'escape'`.
    //
    // ⟨CORRECTED 2026-09-28 (finding `R1`; the ruling, its evidence and the drive-by-drive table
    // are at `§0B` item 1) — annotate-beside, nothing deleted. THE SUPERSEDED AS-FILED READING
    // (kept visible here so its correction is falsifiable): the clause read "the state is
    // normalized to `'closed'`, and every verb acts from there — so `('bogus','open')` ⇒ `'open'`,
    // `changed: true`; `('bogus','toggle')` ⇒ `'closed'`, `changed: false`; `('bogus','close'/
    // 'escape'/'unknown'/'dismiss')` ⇒ `'closed'`, `changed: false`." THIS FILE'S FORMER ROW
    // asserted only the self-consistent sub-rows (`'toggle'`, `'close'`, `'escape'`, `'unknown'`,
    // `'dismiss'`) and deliberately left the `('bogus','open')` cell UNASSERTED, recording as its
    // reason that the clause's prose ("every verb acts from there") disagreed with its own
    // `'toggle'` sub-row — a `'toggle'` acting FROM `'closed'` must move it to `'open'`
    // (`§2.3` item 3's `'closed'`/`'toggle'` cell). THE AMENDMENT RULES THE READING: an out-of-body
    // state is a NORMALIZE-AND-NOTHING-MOVES drive — `{state: 'closed', changed: false}` for EVERY
    // verb body, `'open'` INCLUDED — because the vendored mechanism computes
    // `next = isStateBody(state) ? nextStateOf(previous, verb) : previous`, so the VERB IS NEVER
    // CONSULTED for an out-of-body state; and the as-filed `('bogus','open')` ⇒ `'open'`,
    // `changed: true` sub-row is WRONG and CORRECTED, never kept as an alternative reading. The
    // corrected reading is asserted below; the superseded one is asserted NOWHERE in this file.
    // THE ONE HALF THAT STILL FIRES: the callback's guard in the same mechanism is
    // `verb === 'escape'` — evaluated independently of the state — so on the out-of-body `'escape'`
    // drive the record is `{state: 'closed', changed: false}` AND a callable callback is invoked
    // exactly once; on every other out-of-body drive the count is 0.⟩
    const expected: Array<{ verb: unknown; next: AdoptedBody; moved: boolean; callback: number }> = [
      { verb: 'open', next: 'closed', moved: false, callback: 0 },
      { verb: 'close', next: 'closed', moved: false, callback: 0 },
      { verb: 'toggle', next: 'closed', moved: false, callback: 0 },
      { verb: 'escape', next: 'closed', moved: false, callback: 1 },
      { verb: 'unknown', next: 'closed', moved: false, callback: 0 },
    ]
    for (const shape of hostileStateShapes()) {
      for (const cell of expected) {
        let calls = 0
        const record = transition(shape.value, cell.verb, () => calls++)
        if (record.state !== cell.next) wrong.push(`state=${shape.label} verb=${String(cell.verb)} — state ${String(record.state)}, declared ${cell.next}`)
        if (record.changed !== cell.moved) wrong.push(`state=${shape.label} verb=${String(cell.verb)} — changed ${String(record.changed)}, declared ${String(cell.moved)}`)
        if (calls !== cell.callback) {
          wrong.push(
            `state=${shape.label} verb=${String(cell.verb)} — the callable callback was invoked ${calls} time(s), declared ${cell.callback}` +
              (cell.callback === 1
                ? " (`§0B` item 1: the callback's guard is VERB-ONLY, so the out-of-body `'escape'` drive DOES fire — exactly once)"
                : ' (`§0B` item 1: the out-of-body drive fires the callback on `\'escape\'` ONLY)'),
          )
        }
      }
      // Row (5)/(6) of the corrected table: the declared no-move body's out-of-alphabet
      // neighbours — every other unrecognized verb — answer the same record with count 0.
      for (const verb of OUT_OF_ALPHABET_VERBS) {
        let calls = 0
        const record = transition(shape.value, verb, () => calls++)
        if (record.state !== 'closed') wrong.push(`state=${shape.label} verb=${String(verb)} — state ${String(record.state)}, declared 'closed'`)
        if (record.changed !== false) wrong.push(`state=${shape.label} verb=${String(verb)} — changed ${String(record.changed)}, declared false`)
        if (calls !== 0) wrong.push(`state=${shape.label} verb=${String(verb)} — an out-of-alphabet verb invoked the callback ${calls} time(s), declared 0`)
      }
      const calls = shape.hookCalls()
      if (calls !== 0) wrong.push(`state=${shape.label} — a coercion hook was invoked ${calls} time(s); §3.1 item 2 pins the count at 0 (no String(), no toString, no valueOf)`)
    }
    expect(
      wrong,
      "§3.1 item 2's CORRECTED reading (`§0B` item 1, finding `R1`): an out-of-body state is a NORMALIZE-AND-NOTHING-MOVES drive — `{state: 'closed', changed: false}` for EVERY verb body, `'open'` INCLUDED — and the callable callback is STILL invoked exactly once on the `'escape'` drive (verb-only guard)",
    ).toEqual([])
  })

  it("§2.3 item 2 — the verb normalization table: the five declared bodies are compared by EQUALITY only (no fold, no trim, no prefix match), and `'unknown'` is the declared no-move body BY NAME", async () => {
    const transition = await loadVendored()
    const wrong: string[] = []
    for (const verb of FIVE_VERBS) {
      if (verb === 'unknown') continue
      const record = transition('open', verb)
      if (record.state === 'open' && verb !== 'open') wrong.push(`verb '${verb}' did not act on an OPEN state — every moving body must act`)
    }
    const noMove = transition('open', 'unknown')
    if (noMove.state !== 'open' || noMove.changed !== false) wrong.push("§2.3 item 2: `'unknown'` in, `'unknown'` out, and the state never moves")
    for (const verb of OUT_OF_ALPHABET_VERBS) {
      const record = transition('open', verb)
      if (record.state !== 'open') wrong.push(`an out-of-alphabet verb (${String(verb)}) must answer the caller's OWN normalized state; got ${String(record.state)}`)
      if (record.changed !== false) wrong.push(`an out-of-alphabet verb (${String(verb)}) must carry changed: false`)
    }
    expect(wrong, "the mechanism's only operation on a verb is an EQUALITY test against its five declared bodies — no String() coercion, no case fold, no trim, no prefix match").toEqual([])
  })
})

// ===========================================================================
// §3.1 item 13 / §4 `P-MD-TP-1` — THE DECLARED PAIR, NEVER THE PRINTED EQUATION.
// THE `G-8` TRAP IS DRIVEN SO IT IS VISIBLE, and never absorbed (`R-6`, `E-4`).
// ===========================================================================
describe('PD-UI-6 §3.1 item 13 — the DECLARED PAIR, with the `G-8` printed equation driven as a FALSIFYING CONTROL', () => {
  it("§3.1 item 13 — the declaration answers `{value: 'true', removal: false}` on the strict-boolean-true arm and `{value: false, removal: true}` on EVERY other arm (the string `'true'` included)", async () => {
    const mod = (await import(/* @vite-ignore */ pathToFileURL(VENDORED_PATH).href)) as Record<string, unknown>
    const declare = mod.overlayInertDeclaration
    expect(
      typeof declare,
      'the vendored module exports `overlayInertDeclaration(target, attributeName, inert)` — the DECLARATION half, recorded as DATA ONLY by this unit (the applied write is out of scope, `PD-OVERLAY-2`)',
    ).toBe('function')
    const fn = declare as (t: unknown, n: unknown, i: unknown) => { name: string | null; value: unknown; removal: unknown; target: unknown }
    const setArm = fn('bg', 'an-attribute', true)
    expect({ value: setArm.value, removal: setArm.removal }, "the SET arm is `{value: 'true', removal: false}` — the value is the STRING `'true'`").toEqual({ value: 'true', removal: false })
    expect(setArm.name, "the attribute name is the CALLER's and is echoed verbatim").toBe('an-attribute')
    expect(setArm.target, 'the target is echoed BY IDENTITY and never consulted').toBe('bg')
    for (const other of ["'true'", false, undefined, null, 0, 1, '', {}, [], Symbol('x'), 12n]) {
      const removalArm = fn('bg', 'an-attribute', other)
      expect(
        { value: removalArm.value, removal: removalArm.removal },
        "§3.1 item 13: EVERY arm other than the strict boolean `true` reads {value: false, removal: true} — the string `'true'` included",
      ).toEqual({ value: false, removal: true })
    }
    expect(Object.keys(setArm).join(','), "§2.1 item 2 / §2.4 item 5: the record carries four members in declared order — `['name','value','removal','target']`").toBe('name,value,removal,target')
  })

  it("§3.1 item 13 / R-6 — the foundation's PRINTED identity FAILS on the set arm: the trap is driven so it is visible rather than latent", async () => {
    const mod = (await import(/* @vite-ignore */ pathToFileURL(VENDORED_PATH).href)) as Record<string, unknown>
    const declare = mod.overlayInertDeclaration as (t: unknown, n: unknown, i: unknown) => { value: unknown; removal: unknown }
    // THE FALSIFYING CONTROL, driven rather than described: the printed identity
    // `removal === (value !== true)` is unsatisfiable as a STRICT equation on the set arm,
    // because that arm's `value` is the STRING `'true'` while its `removal` is the boolean
    // `false`. `R-14` (never patch the foundation) and `R-4` (never patch the vendored
    // bytes) are why this is REPORTED and handed off (defect
    // `G-8 OVERLAY-REMOVAL-IDENTITY-UNSATISFIABLE-AS-PRINTED`), never "fixed".
    const setArm = declare('bg', 'an-attribute', true)
    const printedOnSetArm = setArm.removal === (setArm.value !== true)
    expect(
      printedOnSetArm,
      "the G-8 trap: the declaration's PRINTED identity `removal === (value !== true)` reads FALSE on the set arm — `removal` is `false` while `value` is the string `'true'`. The DECLARED PAIR `{value: 'true', removal: false}` is the contract; the printed equation is the DEFECT, and it is driven here so the trap is visible rather than latent",
    ).toBe(false)
    // …and the removal arm, where the printed equation happens to agree — so the control
    // is shown to discriminate rather than to fail everything.
    const removalArm = declare('bg', 'an-attribute', false)
    expect(
      removalArm.removal === (removalArm.value !== true),
      "the printed equation DOES hold on the removal arm (`value: false`, so `value !== true` is `true`, and `removal` is `true`) — which is exactly why the set arm's failure is a TRAP and not a typo",
    ).toBe(true)
  })
})

// ===========================================================================
// §3.2 — `createModalController`'s own fail-states (TOTAL — the CONTRACT this unit owns).
// ===========================================================================
describe('PD-UI-6 §3.2 — `createModalController` is TOTAL over its option domain, and `initialOpen` coerces STRICTLY', () => {
  it('§3.2 items 1/2/3/5/8 — malformed options are TOTAL: no throw, a working controller, a boolean `isOpen()`, and only the strict `=== true` is true', async () => {
    const create = await requireFactory()
    const cases: unknown[] = [
      undefined,
      null,
      42,
      'x',
      Symbol('s'),
      (): void => undefined,
      12n,
      {},
      { initialOpen: 'yes' },
      { initialOpen: 1 },
      { initialOpen: 0 },
      { initialOpen: null },
      { initialOpen: {} },
      { initialOpen: [] },
      { initialOpen: NaN },
      { onOpen: 42 },
      { onOpen: {}, onClose: null, onToggle: 'x' },
    ]
    const wrong: string[] = []
    for (const opt of cases) {
      const text = caught(() => create(opt))
      if (text !== null) {
        wrong.push(`createModalController(${String(opt)}) THREW: ${text}`)
        continue
      }
      const c = create(opt)
      const isOpenBad = isOpenVerdict(c)
      if (isOpenBad !== null) {
        wrong.push(`${String(opt)}: ${isOpenBad}`)
        continue
      }
      const declaredInit =
        opt != null && typeof opt === 'object' && 'initialOpen' in (opt as object)
          ? (opt as { initialOpen: unknown }).initialOpen === true
          : false
      if (c.isOpen() !== declaredInit) {
        wrong.push(`${String(opt)}: isOpen()=${String(c.isOpen())}, the strict \`initialOpen === true\` reading is ${String(declaredInit)}`)
      }
      for (const m of ['open', 'close', 'toggle'] as const) {
        const bad = voidVerdict(c, m)
        if (bad !== null) wrong.push(`${String(opt)}: ${bad}`)
      }
    }
    expect(wrong, '§3.2: "a working controller, isOpen() === false, no throw" — for every malformed shape').toEqual([])
  })

  it('§3.2 item 4 — `initialOpen: true` reads `isOpen() === true` at construction and fires NO callback at construction', async () => {
    const create = await requireFactory()
    const log: string[] = []
    const c = create({
      initialOpen: true,
      onOpen: () => log.push('onOpen'),
      onClose: () => log.push('onClose'),
      onToggle: () => log.push('onToggle'),
    })
    expect(c.isOpen(), '§3.2 item 4: `initialOpen: true` ⇒ `isOpen() === true` at construction').toBe(true)
    expect(log, '§3.2 item 4: NO callback fires at construction').toEqual([])
  })

  it('§3.2 item 6 — a THROWING `onOpen`/`onClose`/`onToggle` is ABSORBED: the transition still completes and the controller never throws', async () => {
    const create = await requireFactory()
    const boom = (): void => {
      throw new Error('boom')
    }
    const c = create({ initialOpen: false, onOpen: boom, onClose: boom, onToggle: boom })
    const wrong: string[] = []
    const t1 = caught(() => c.toggle())
    if (t1 !== null) wrong.push(`toggle() threw: ${t1}`)
    if (c.isOpen() !== true) wrong.push('the closed→open transition must still complete')
    const t2 = caught(() => c.toggle())
    if (t2 !== null) wrong.push(`toggle() threw: ${t2}`)
    if (c.isOpen() !== false) wrong.push('the open→closed transition must still complete')
    const t3 = caught(() => c.open())
    if (t3 !== null) wrong.push(`open() threw: ${t3}`)
    const t4 = caught(() => c.close())
    if (t4 !== null) wrong.push(`close() threw: ${t4}`)
    expect(wrong).toEqual([])
  })

  it('§3.2 items 9/10/11/12 — idempotence, the `toggle()` ALWAYS-move rule, `isOpen()` stability over 100 reads, and two controllers from deep-equal options tracing identically', async () => {
    const create = await requireFactory()
    const wrong: string[] = []
    // item 9 — repeated calls are idempotent no-ops
    const open1 = create()
    voidVerdict(open1, 'open')
    const afterFirstOpen = open1.isOpen()
    voidVerdict(open1, 'open')
    if (open1.isOpen() !== afterFirstOpen) wrong.push('open() on an OPEN controller moved the state')
    const closed1 = create()
    voidVerdict(closed1, 'close')
    const afterFirstClose = closed1.isOpen()
    voidVerdict(closed1, 'close')
    if (closed1.isOpen() !== afterFirstClose) wrong.push('close() on a CLOSED controller moved the state')
    // item 10 — toggle() always moves, from both reachable bodies
    const t = create({ initialOpen: false })
    voidVerdict(t, 'toggle')
    if (t.isOpen() !== true) wrong.push("§3.2 item 10: toggle() from the 'closed' body must move to the 'open' body")
    voidVerdict(t, 'toggle')
    if (t.isOpen() !== false) wrong.push("§3.2 item 10: toggle() from the 'open' body must move to the 'closed' body")
    // item 11 — 100 reads with no interleaved transition are stable
    const stable = create({ initialOpen: true })
    const v = stable.isOpen()
    for (let i = 0; i < 100; i++) if (stable.isOpen() !== v) wrong.push('isOpen() drifted without a transition (must be free of side effects)')
    // item 12 — no module-level state, no memo, no cache
    const seq = ['open', 'toggle', 'close', 'toggle', 'open'] as const
    const a = create({ initialOpen: false })
    const b = create({ initialOpen: false })
    for (const op of seq) {
      voidVerdict(a, op)
      voidVerdict(b, op)
      if (a.isOpen() !== b.isOpen()) wrong.push(`two controllers from deep-equal options diverged at ${op}`)
    }
    expect(wrong).toEqual([])
  })

  it("§3.2 item 5 — a non-function `onOpen`/`onClose`/`onToggle` (THE ADAPTER'S OWN notification options — `§2.1`'s four declared members) is a NO-OP: never invoked, no throw", async () => {
    // ⟨RE-STATED 2026-09-29 (finding `A-3`; the ruling is at `§0C` item 2) — annotate-beside, the
    // as-filed wording is KEPT VISIBLE: this title AS FILED ended *"(the non-function form is never
    // attempted)"*. THAT CLAUSE IS CORRECT HERE AND ONLY HERE, and the subject is what makes it so:
    // these are the ADAPTER's notification options, and the adapter's `safe()` guard is
    // `typeof fn === 'function' ? fn() : undefined` — a non-function IS skipped. The MECHANISM's
    // `callback` is a DIFFERENT subject whose guard is on the VERB ALONE, so a non-callable there
    // IS invoked with its `TypeError` absorbed (`§3.3` arm (b) below, corrected). The two clauses
    // are not the same clause, and the two `§` sites say which one each row is about.⟩
    const create = await requireFactory()
    const attempted: string[] = []
    const c = create({
      initialOpen: false,
      onOpen: (): void => {
        attempted.push('onOpen')
      },
      // §3.2 item 5 — NON-function values at two of the three known keys
      onClose: undefined,
      onToggle: null,
    })
    const wrong = [voidVerdict(c, 'open'), voidVerdict(c, 'toggle'), voidVerdict(c, 'close')].filter((x): x is string => x !== null)
    expect(attempted, 'the FUNCTION form IS invoked; the non-function forms (`onClose: undefined`, `onToggle: null`) can never be, and attempting one would red this row').toEqual(['onOpen'])
    expect(wrong, '§3.2 item 5: a non-function callback is a no-op — never invoked, no throw').toEqual([])
  })
})

// ===========================================================================
// §2.3 items 4/5 — THE ADAPTER'S STATE WORD: TWO reachable bodies; `'held'`/`'closing'`
// are ADOPTED VOCABULARY the fork NEVER ENTERS (`R-8`, `D-5`). The *declared
// unreachability* is asserted — the bodies are never EMULATED, never fabricated.
// ===========================================================================
describe("PD-UI-6 §2.3 item 5 — the reachable set is TWO: `closed`/`open`, proved from the matrix closure", () => {
  it("§2.3 item 5 — the reachable closure under `{'open', 'escape', 'toggle'}` from `'closed'` stays inside `{'closed', 'open'}`; `'held'`/`'closing'` are never entered from the fork's four verbs", async () => {
    const transition = await loadVendored()
    const reachable = new Set<AdoptedBody>(['closed'])
    for (let round = 0; round < 8; round++) {
      for (const from of [...reachable]) {
        for (const verb of ['open', 'escape', 'toggle']) {
          const record = transition(from, verb)
          if (FOUR_BODIES.includes(record.state)) reachable.add(record.state)
        }
      }
    }
    expect([...reachable].sort(), "§2.3 item 5: the fork's reachable closure is EXACTLY the two bodies `closed`/`open`").toEqual(['closed', 'open'])
    const boundary = new Set<AdoptedBody>()
    for (const from of [...reachable]) {
      for (const verb of FIVE_VERBS) {
        const record = transition(from, verb)
        if (record.state === 'held' || record.state === 'closing') boundary.add(record.state)
      }
    }
    expect(
      [...boundary],
      "§2.3 item 5: `'held'` and `'closing'` are NEVER entered from the fork's own four verbs — they are adopted vocabulary, not a narrowing of the module's closed set, and not a licence to emulate them",
    ).toEqual([])
  })

  it("§2.3 items 1/5 — NO drive of the public controller surface yields a body outside `{'closed', 'open'}`, and the surface is EXACTLY the four declared members", async () => {
    const create = await requireFactory()
    const c = create({ initialOpen: false })
    const wrong: string[] = []
    const seq = ['open', 'open', 'toggle', 'close', 'close', 'toggle', 'open', 'close', 'toggle'] as const
    for (const op of seq) {
      const bad = voidVerdict(c, op)
      if (bad !== null) wrong.push(bad)
      const v = c.isOpen()
      if (typeof v !== 'boolean') wrong.push(`isOpen() returned ${typeof v}`)
    }
    const surface = Object.keys(c as unknown as Record<string, unknown>).sort()
    const methods = ['open', 'close', 'toggle', 'isOpen'].sort()
    expect(wrong).toEqual([])
    expect(surface, '§2.1: `ModalController` declares EXACTLY the four members `open(): void` · `close(): void` · `toggle(): void` · `isOpen(): boolean`').toEqual(methods)
  })
})

// ===========================================================================
// §2.5 — THE ESCAPE CONTRACT (the ruling this filing DECIDES): the close route binds the
// verb `'escape'` (not `'close'`), the callback is an ARGUMENT with three arms, and the
// invocation schedule is `once · only on 'escape' · every state, 'closed' included`.
// ===========================================================================
describe("PD-UI-6 §2.5 — the ESCAPE CONTRACT: the close route binds `'escape'`, and the callback is an ARGUMENT (three arms)", () => {
  it("§2.5 clause 1 / §2.3 item 4 — the adapter's three method routes each REACH the vendored mechanism in value position, and the close route binds the verb `'escape'` (never `'close'`, never `'unknown'`)", async () => {
    const corpus = await recordingCorpus()
    const c = corpus.createModalController({})
    voidVerdict(c, 'open')
    voidVerdict(c, 'close')
    voidVerdict(c, 'toggle')
    expect(
      corpus.calls.length,
      "PD-UI-6 contract failure [§2.5 clause 1 / §2.3 item 4]: the adapter must RE-EXPRESS its transition decision as a CALL into the vendored `overlayTransition(currentState, verb, callback?)`. The adapter emitted NO call — its state/verb discipline is still hand-written, and every landed route (open/close/toggle) must reach the adopted mechanism",
    ).toBeGreaterThan(0)
    const verbs = corpus.calls.map((k) => k.verb)
    expect(verbs, "§2.5 clause 1: the CLOSE route binds `'escape'` — the foundation declares the `'escape'` column's callback obligation by name, and `'close'` deliberately carries no callback obligation").toContain('escape')
    expect(verbs, "§2.3 item 4 / §2.5 clause 1: the adapter never binds `'close'` anywhere — it is a legal foundation body the fork simply does not emit").not.toContain('close')
    expect(verbs, "§2.3 item 4: the adapter emits exactly its own three moving bodies — never `'unknown'` (a normalization target, not a choosable verb)").not.toContain('unknown')
    expect(verbs, "§2.3 item 4: `open()` binds `'open'` and `toggle()` binds `'toggle'`").toEqual(expect.arrayContaining(['open', 'toggle']))
    for (const forkToken of ['is-open', 'is-closed', 'settings-modal', 'scrim']) {
      expect(verbs, `§2.8: the adapter must never push the fork's own token \`${forkToken}\` into the mechanism as a verb`).not.toContain(forkToken)
    }
  })

  it("§2.3 item 4 — a close() from BOTH reachable starting bodies binds `'escape'` and hands in the body the adapter HOLDS; `close()` on the closed body is an idempotent no-op", async () => {
    const corpus = await recordingCorpus()
    const fromClosed = corpus.createModalController({ initialOpen: false })
    const fromOpen = corpus.createModalController({ initialOpen: true })
    corpus.calls.length = 0
    voidVerdict(fromClosed, 'close')
    const closedCalls = corpus.calls.slice()
    corpus.calls.length = 0
    voidVerdict(fromOpen, 'close')
    const openCalls = corpus.calls.slice()
    expect(closedCalls.length, "§2.3 item 4: `close()` must reach the mechanism from BOTH reachable bodies").toBeGreaterThan(0)
    expect(openCalls.length, "§2.3 item 4: `close()` must reach the mechanism from the 'open' body").toBeGreaterThan(0)
    for (const call of [...closedCalls, ...openCalls]) {
      expect(call.verb, "§2.5 clause 1: BOTH close routes (the Escape affordance and the scrim-click affordance) bind `'escape'`").toBe('escape')
      expect(
        FOUR_BODIES.includes(call.state as AdoptedBody),
        `§2.3 item 1: the state the adapter HANDS IN must be a body that came out of a previous returned record or out of the declared initialization — got ${String(call.state)}`,
      ).toBe(true)
    }
    expect(closedCalls[0]!.state, "§2.3 item 1: the adapter's initial word, from the normalized `initialOpen: false`, is `'closed'`").toBe('closed')
    expect(openCalls[0]!.state, "§2.3 item 1: the adapter's initial word, from `initialOpen: true`, is `'open'`").toBe('open')
    const before = fromClosed.isOpen()
    voidVerdict(fromClosed, 'close')
    expect(fromClosed.isOpen(), '§3.2 item 9: `close()` on a closed controller is an idempotent no-op').toBe(before)
  })

  it("§2.5 clause 4 / §3.3 / P-MD-IM-1 — the RECORDING callback sees EXACTLY ONE invocation on the close route from `'open'` AND from `'closed'` (where the pair is `{state:'closed', changed:false}`), and ZERO on `open()`/`toggle()`", async () => {
    const corpus = await recordingCorpus()
    let count = 0
    const c = corpus.createModalController({ initialOpen: true, callback: () => count++ })
    voidVerdict(c, 'open')
    const afterOpen = count
    voidVerdict(c, 'toggle')
    const afterToggle = count
    voidVerdict(c, 'close')
    const afterClose = count
    expect(afterOpen, "§3.1 item 8: the callback is NEVER invoked on `open()` — invocation count 0").toBe(0)
    expect(afterToggle, "§3.1 item 8: the callback is NEVER invoked on `toggle()` — invocation count 0").toBe(0)
    expect(
      afterClose - afterToggle,
      "PD-UI-6 contract failure [§2.5 clause 1 / §3.3 arm (a) / P-MD-IM-2]: a RECORDING callback handed in through `ModalControllerOptions.callback` — the unit's ONE added optional member — must observe EXACTLY 1 invocation on the close route, because the route must bind `'escape'` (the only verb that carries the callback obligation). Received 0: the close route binds a verb with no callback obligation, so the declared schedule is not satisfied",
    ).toBe(1)
    // …and from the ALREADY-CLOSED body, whose returned pair is {state:'closed', changed:false}
    let fromClosed = 0
    const c2 = corpus.createModalController({ initialOpen: false, callback: () => fromClosed++ })
    voidVerdict(c2, 'close')
    expect(c2.isOpen(), "§2.5 clause 4: no state changes on an Escape from `'closed'`").toBe(false)
    expect(
      fromClosed,
      "PD-UI-6 contract failure [§2.5 clause 4 / P-MD-IM-1]: the close route from the ALREADY-CLOSED frame must still reach the mechanism's `'escape'` column, where the callback is invoked EXACTLY ONCE for EVERY one of the four states — `'closed'` included. Received 0: the adapter short-circuits its close() before the mechanism, so the declared invocation schedule is not satisfied",
    ).toBe(1)
  })

  it('§2.5 clause 3 — the WIRING passes NO callback on any landed route: `createModalController({ initialOpen: false })`, so the foundation\'s own declared non-callable arm is what runs', async () => {
    installShim()
    const auth = authorModal()
    const corpus = await recordingCorpus()
    expect(typeof corpus.installSettingsModal, 'the corpus must expose the wiring half').toBe('function')
    caught(() => corpus.installSettingsModal())
    auth.toggle.dispatchPointer('click')
    auth.scrim.dispatchPointer('click')
    shimDocument.dispatchPointer('keydown', auth.frame, { key: 'Escape' })
    expect(corpus.calls.length, 'the wiring must actually drive the controller through its affordances').toBeGreaterThan(0)
    for (const call of corpus.calls) {
      expect(
        call.callback,
        "§2.5 clause 3: the wiring passes no callback — the argument is ABSENT on every landed route, which is the foundation's own declared arm. Handing in anything with a side effect would create a SECOND write authority (`§2.5` clause 5)",
      ).toBeUndefined()
    }
  })

  it('§3.3 arm (c) — a THROWING callback is ABSORBED: ONE attempted invocation, NEVER retried, and nothing escapes the close route', async () => {
    const corpus = await recordingCorpus()
    let attempts = 0
    const boom = (): void => {
      attempts++
      throw new Error('callback boom')
    }
    const c = corpus.createModalController({ initialOpen: true, callback: boom })
    const text = caught(() => c.close())
    expect(text, '§3.3 arm (c): the throw is ABSORBED — nothing escapes the close route').toBeNull()
    expect(attempts, '§3.3 arm (c): exactly ONE attempted invocation on the close route (never zero, never a retry)').toBe(1)
    expect(c.isOpen(), 'the transition still completes when the callback throws').toBe(false)
  })

  it('§3.3 arm (a) — an ABSENT callback is a no-op: the declared pair is returned and nothing throws', async () => {
    const corpus = await recordingCorpus()
    const c = corpus.createModalController({ initialOpen: true })
    expect(caught(() => c.close()), '§3.3 arm (a): nothing throws when the option is absent').toBeNull()
    expect(c.isOpen(), '§3.3 arm (a): the declared pair is returned and the state still moves').toBe(false)
  })

  it('§3.3 arm (b) — a NON-CALLABLE callback (`null`, a number, a string, an object, an array, a revoked `Proxy`) never throws and never lets anything escape the close route', async () => {
    // ⟨CORRECTED 2026-09-29 (finding `A-3`; the ruling and its evidence are at `§0C` item 2) —
    // annotate-beside, the as-filed text is KEPT VISIBLE: this row AS FILED was titled
    // *"a NON-CALLABLE callback … is NEVER ATTEMPTED and never throws"* and carried the assertion
    // message *"NO call is attempted"*. THE PROSE WAS WRONG, NOT THE IMPLEMENTER'S READING: the
    // vendored guard is on the VERB ALONE
    // (`if (verb === VERB_ESCAPE) { try { (callback as () => void)() } catch { … } }`,
    // VERIFIED-BY-READ of `src/shared/overlay.ts` → `overlayTransition`), so for a NON-CALLABLE
    // value **an invocation IS ATTEMPTED and its `TypeError` IS ABSORBED** — unobservable to the
    // caller. THE OBSERVABLE CLAUSE IS UNCHANGED (nothing throws, the declared pair is returned,
    // the state still moves), which is why NO assertion below changed shape and NO term moved.
    // The ATTEMPTED-INVOCATION half is DRIVEN beside it, as a control whose subject is the row's
    // own oracle, so this row no longer rests on a clause the contract does not contain.⟩
    const corpus = await recordingCorpus()
    await loadVendored()
    const revoked = Proxy.revocable((): void => undefined, {})
    revoked.revoke()
    const arms: unknown[] = [null, 42, 'a string', { call: (): void => undefined }, [], revoked.proxy]
    const wrong: string[] = []
    for (const arm of arms) {
      const c = corpus.createModalController({ initialOpen: true, callback: arm })
      const t1 = caught(() => c.open())
      const t2 = caught(() => c.toggle())
      const t3 = caught(() => c.close())
      if (t1 !== null || t2 !== null || t3 !== null) wrong.push(`callback arm ${String(arm)} threw: ${t1 ?? t2 ?? t3}`)
      if (c.isOpen() !== false) wrong.push(`callback arm ${String(arm)}: the declared pair must still be returned and the state must still move to 'closed'`)
    }
    // ---- THE TWO CONTROLS: the "attempted" and the "never attempted" behaviours are BOTH
    //      drivable, so the row's reading is a measurement rather than prose ----
    // (1) THE ATTEMPT COUNTER, DRIVEN: a harness whose call site is `try { cb() } catch {}` — the
    //     vendored guard's own shape — records ONE attempted invocation for a NON-CALLABLE value
    //     and absorbs its `TypeError`; a harness that SKIPS the call site records ZERO. The second
    //     is the reading `A-3` corrects, and this control shows what distinguishes them: the
    //     counter. (`§0C` item 2; the harness is the correction's own falsifier, not a claim about
    //     the landed bytes — see (2) for that.)
    const attemptCounter = (skipNonCallables: boolean, callback: unknown): number => {
      let attempted = 0
      if (!skipNonCallables || typeof callback === 'function') {
        try {
          attempted++
          ;(callback as () => void)()
        } catch {
          /* absorbed */
        }
      }
      return attempted
    }
    const correctReading = [attemptCounter(false, null), attemptCounter(false, 42), attemptCounter(false, {})]
    const correctedAwayReading = [attemptCounter(true, null), attemptCounter(true, 42), attemptCounter(true, {})]
    expect(
      correctReading,
      "§0C item 2 (finding `A-3`): a guard whose invocation is INSIDE the `try` (the vendored bytes' own shape) attempts ONE invocation for each non-callable value and absorbs the `TypeError`",
    ).toEqual([1, 1, 1])
    expect(
      correctedAwayReading,
      "…and a guard that SKIPS a non-callable records ZERO — which is the as-filed reading the amendment corrects, and therefore the counter (never a difference in the returned pair) is what separates the two",
    ).toEqual([0, 0, 0])
    // (2) THE OBSERVABLE CLAUSE, DRIVEN ON THE MECHANISM: for EVERY non-callable shape the declared
    //     pair is returned and NOTHING ESCAPES; and for a CALLABLE that throws, the mechanism
    //     records exactly ONE attempted invocation while nothing escapes — the pair of readings the
    //     row is allowed to claim, both read off the adopted function itself.
    const mechanismReading = ((): string | null => {
      const transition = vendoredTransition
      if (transition === null) return 'the adopted mechanism must be loaded before this reading'
      for (const armValue of [null, 42, 'a string', { call: (): void => undefined }, []]) {
        const t = caught(() => transition('open', 'escape', armValue))
        if (t !== null) return `a non-callable callback (${String(armValue)}) let something escape the close route: ${t}`
        const rec = transition('open', 'escape', armValue)
        if (rec.state !== 'closed' || rec.changed !== true) return `a non-callable callback (${String(armValue)}) must still return the declared pair`
      }
      let attempted = 0
      const throwing = (): void => {
        attempted++
        throw new TypeError('a callable that throws a TypeError')
      }
      const t = caught(() => transition('open', 'escape', throwing))
      if (t !== null) return `a throwing callback let its throw escape: ${t}`
      if (attempted !== 1) return `the mechanism must ATTEMPT the callback exactly once on 'escape'; it attempted ${attempted}`
      return null
    })()
    expect(mechanismReading, "§3.3 arms (b)/(c): nothing escapes, the declared pair is returned, and the invocation is attempted (never skipped, never retried)").toBeNull()
    expect(
      wrong,
      "§3.3 arm (b): the same declared pair is returned and NOTHING ESCAPES the close route for any non-callable shape — *\"a row asserting that the mechanism refuses an unusable callback is citing a clause this contract does not contain\"*",
    ).toEqual([])
  })

  it('§3.1 items 8/9/10 + §3.3 — the invocation SCHEDULE: zero on every non-escape verb; exactly once per close from EVERY one of the four states; and NEVER RETAINED between calls', async () => {
    const transition = await loadVendored()
    const wrong: string[] = []
    for (const verb of ['open', 'close', 'toggle', 'unknown', 'dismiss', '', 'CLOSE', null, 42]) {
      let count = 0
      transition('open', verb, () => count++)
      if (count !== 0) wrong.push(`verb ${String(verb)} invoked the callback ${count} time(s) — §3.1 item 8 pins the count at 0`)
    }
    for (const state of FOUR_BODIES) {
      let count = 0
      const record = transition(state, 'escape', () => count++)
      if (count !== 1) wrong.push(`state ${state} + 'escape' invoked the callback ${count} time(s) — §3.1 item 9 pins the count at exactly 1, for EVERY one of the four states`)
      const declared = MATRIX.find((cell) => cell.state === state && cell.verb === 'escape')!
      if (record.state !== declared.next || record.changed !== declared.moved) wrong.push(`state ${state} + 'escape': the pair is not the matrix's 'escape' column`)
    }
    let twice = 0
    const cb = (): void => twice++
    transition('open', 'escape', cb)
    transition('open', 'escape', cb)
    if (twice !== 2) wrong.push(`§3.1 item 10: the callback must NOT be retained — two calls with the same callback must observe a FRESH count of 1 each (read 2), got ${twice}`)
    expect(wrong).toEqual([])
  })
})

// ===========================================================================
// §2.4 — THE `changed`-DRIVEN CLASS MIRROR: the write happens exactly when the RECORD
// reports the state actually changed; the equivalence to the landed `settle` guard; and
// the falsifier that distinguishes "reads the record" from "recomputes the guard".
// ===========================================================================
describe('PD-UI-6 §2.4 — the `changed`-driven class mirror (the write follows the RECORD, never a recomputation)', () => {
  it('§2.4 clauses 1–4 — the class write happens IF AND ONLY IF the returned `changed` is `true`: an idempotent Escape/scrim no-op performs NO class write', async () => {
    const transition = await loadVendored()
    const mirror = new Mirror('closed')
    const wrong: string[] = []
    const seq: Array<{ verb: string; writesAfter: number }> = [
      { verb: 'open', writesAfter: 1 },
      { verb: 'open', writesAfter: 1 },
      { verb: 'close', writesAfter: 2 },
      { verb: 'close', writesAfter: 2 },
      { verb: 'toggle', writesAfter: 3 },
      { verb: 'toggle', writesAfter: 4 },
      { verb: 'escape', writesAfter: 4 },
      { verb: 'escape', writesAfter: 4 },
      { verb: 'unknown', writesAfter: 4 },
      { verb: 'dismiss', writesAfter: 4 },
    ]
    for (const step of seq) {
      mirror.drive(transition, step.verb)
      if (mirror.writes !== step.writesAfter) {
        wrong.push(`after ${step.verb}: ${mirror.writes} class write(s), declared ${step.writesAfter} (the adopted 'changed' member gates the write)`)
      }
      const hasOpen = mirror.tokens.includes('is-open')
      const hasClosed = mirror.tokens.includes('is-closed')
      if (hasOpen === hasClosed) wrong.push(`after ${step.verb}: the frame carries ${hasClosed ? 'BOTH' : 'NEITHER'} state class`)
      if (hasOpen !== (mirror.word === 'open')) wrong.push(`after ${step.verb}: the class disagrees with the state word`)
    }
    expect(wrong, '§2.4 clause 4: "An idempotent Escape or scrim no-op (`changed === false`) performs NO class write."').toEqual([])
  })

  it("§2.4's DISCRIMINATING CONTROL — the landed `isOpen()`-comparison guard AGREES on sixteen cells and DIVERGES on the four `'held'`/`'closing'` arms where the record reports a real move", async () => {
    const transition = await loadVendored()
    const divergent: string[] = []
    let agreeing = 0
    for (const cell of MATRIX) {
      const adopted = new Mirror(cell.state)
      const landed = new LandedGuardMirror(cell.state)
      const record = adopted.drive(transition, cell.verb)
      landed.drive(transition, cell.verb)
      // the ADOPTED guard's decision is the record's `changed`; the LANDED guard's
      // decision is `isOpen()` before vs after — observed through its own write count,
      // never read back from the record it ignores.
      const adoptedDecision = record.changed
      const landedDecision = landed.writes > 0
      if (adoptedDecision === landedDecision) agreeing++
      else divergent.push(`${cell.state}/${cell.verb} — changed=${String(record.changed)} vs the landed isOpen() comparison=${String(landedDecision)}`)
    }
    expect(
      divergent.sort(),
      "§2.4 / §2.3 item 5: the `changed`-driven guard and the landed `isOpen()`-comparison guard must AGREE on every cell both can grade and DIVERGE exactly where the returned body leaves the `{'closed','open'}` pair — on (`'held'`,`'close'`), (`'held'`,`'escape'`), (`'closing'`,`'close'`) and (`'closing'`,`'escape'`). Those are the four arms where the landed guard reads `isOpen() === false` before AND after, while the record reports a REAL move to `'closed'` — which is the only reason the guard moved to the adopted record",
    ).toEqual([
      'closing/close — changed=true vs the landed isOpen() comparison=false',
      'closing/escape — changed=true vs the landed isOpen() comparison=false',
      'held/close — changed=true vs the landed isOpen() comparison=false',
      'held/escape — changed=true vs the landed isOpen() comparison=false',
    ])
    expect(agreeing, '§2.4: the sixteen cells where the two guards agree, out of the 20 — the divergence is exactly the four injected arms').toBe(16)
  })

  it("§2.4 / §4 `P-MD-SM-2` CONTROL — a corpus that treats ANY non-`'open'` returned body as a change MUST FAIL on the `'held'`/`'closing'` arms, and the landed guard must be shown to diverge there", async () => {
    const transition = await loadVendored()
    // `'held'` + `'close'` is a REAL move (`'held'` → `'closed'`, `changed: true`), while
    // the landed `isOpen()` comparison reads `false` before AND after — the divergence.
    const record = transition('held', 'close')
    expect(record.state, "§2.3 item 3: `'held'` + `'close'` answers the matrix's `'closed'`").toBe('closed')
    expect(record.changed, "§2.3 item 3: `'held'` + `'close'` is a MOVING cell (`changed: true`)").toBe(true)
    const wrong = new NonOpenIsAChangeMirror('held')
    wrong.drive(transition, 'close')
    expect(wrong.writes, 'the reference mirror follows the RECORD and writes once on that move').toBe(1)
    const landed = new LandedGuardMirror('held')
    landed.drive(transition, 'close')
    expect(
      landed.writes,
      "the CONTROL: the landed `isOpen()` comparison reads `false` before and after, performs NO write, and so FAILS the row — this is how the row discriminates 'follows the record' from 'recomputes the guard'",
    ).toBe(0)
    // …and the `'held'` + `'open'` cell, where the NON-`'open'`-body corpus goes the other
    // way: no move is reported, yet the body is not `'open'`, so that corpus writes wrongly.
    const nonMoving = new NonOpenIsAChangeMirror('held')
    const heldOpen = nonMoving.drive(transition, 'open')
    expect(heldOpen.changed, "§2.3 item 3: `'held'` + `'open'` is a NON-MOVING cell (`changed: false`)").toBe(false)
    expect(nonMoving.writes, "and a corpus reading any non-`'open'` body as a change writes on a `changed: false` cell — the second failure mode this control drives").toBe(1)
    const landedHeldOpen = new LandedGuardMirror('held')
    landedHeldOpen.drive(transition, 'open')
    expect(landedHeldOpen.writes, "…while the landed guard reads no `isOpen()` change there and writes nothing: on THIS cell it agrees with the record, which is why the divergence (not the agreement) is what the row grades").toBe(0)
  })

  it('§2.4 item 3 / §2.3 item 1 — the FALSIFYING corpus: an injected record whose `changed` CONTRADICTS the landed guard must be FOLLOWED by the adapter (the returned `state` still replaces the word)', async () => {
    const corpus = await falsifyingCorpus()
    const c = corpus.createModalController({ initialOpen: false })
    expect(c.isOpen(), 'the corpus starts on the closed body').toBe(false)
    voidVerdict(c, 'open')
    expect(
      corpus.calls.map((k) => k.verb),
      'the open route must reach the injected mechanism — otherwise this row proves nothing',
    ).toContain('open')
    expect(
      c.isOpen(),
      '§2.4 clause 2 / §2.3 item 1: the adapter REPLACES its word with the returned `state` member — even where the injected record reports `changed: false`, so an adapter that recomputed its next state from `isOpen()` or from the verb would diverge here',
    ).toBe(true)
    // …and the class mirror, driven by `changed`, writes NOTHING on that injected record —
    // the write follows the RECORD, not the state move. The landed guard cannot follow it.
    const adopted = new Mirror('closed')
    const landed = new LandedGuardMirror('closed')
    const record: AdoptedRecord = { state: 'open', changed: false }
    if (adopted.decision(record.state, record.changed)) adopted.write()
    if (landed.decision(record.state, record.changed)) landed.write()
    expect(adopted.writes, '§2.4 clause 3: the `changed`-driven mirror performs NO write on an injected `changed: false` — it follows the RECORD').toBe(0)
    expect(landed.writes, '§2.4 clause 3 / §2.4\'s control: the landed `isOpen()` comparison cannot follow the record and DOES write — the injected record is the falsifier the adoption\'s guard answers').toBe(1)
  })

  it("§0C item 6 (findings `A-1` (i) / `A-7`) — THE STRONGEST FALSE-GREEN, DRIVEN: a WRITE-COUNTING frame instrument separates the landed adapter (`changed`-reading) from an `isOpen()`-RECOMPUTING implementation — the CLASS cannot, because a recomputer computes the same class", async () => {
    // THE FALSE-GREEN, as the ledger records it: *"an implementation that RECOMPUTES the write
    // guard from `isOpen()` instead of reading the adopted record's `changed` passes every landed
    // row."* THE DISCRIMINATING ASSERTION IS THE WRITE COUNT, NOT THE CLASS (`§0C` item 6 clause
    // (a)): a corpus that gets the class right by COMPUTING it
    // (`state === 'open' ? 'is-open' : 'is-closed'`) still produces the correct class, so only the
    // counted writes separate the two implementations.
    //
    // THE INSTRUMENT. The wiring's own `apply()` path is not reachable from an injected record in
    // a node test (the wiring builds its controller from the module's REAL vendored import; there
    // is no seam for a stub, and injecting one would take the mock-binding form `§6.4` forbids).
    // What IS drivable is the instrument this row needs: the frame's CLASS-WRITE COUNTER, whose
    // decision can be swapped — `faithful` reads the ADOPTED RECORD's `changed` (`§2.4` clause 3),
    // `recomputing` reproduces the false-green verbatim (it IGNORES the record and recomputes from
    // the state word). Both are driven on the SAME injected record, one after the other.
    const countingFrame = (start: AdoptedBody, recomputing: boolean) => {
      let word: AdoptedBody = start
      let writes = 0
      let className = `settings-modal ${start === 'open' ? 'is-open' : 'is-closed'}`
      return {
        reads: () => writes,
        tokens: () => className.split(/\s+/).filter(Boolean),
        drive: (record: AdoptedRecord): boolean => {
          const before = word
          word = record.state
          const decision = recomputing ? (word === 'open') !== (before === 'open') : record.changed
          if (decision) {
            writes++
            // ⟨INSTRUMENT FAULT, CORRECTED in this pass — annotate-beside: AS FIRST WRITTEN this
            // helper used the name `keep` for BOTH the outer loop variable and the filter callback's
            // parameter, so the callback's parameter SHADOWED the array and the class was rewritten
            // from a string CHARACTER. The corpus instrument must be right or the discrimination it
            // proves is worthless; the outer name is now `tokens`.⟩
            const keptTokens = className.split(/\s+/).filter((tok) => tok && tok !== 'is-open' && tok !== 'is-closed')
            className = [...keptTokens, word === 'open' ? 'is-open' : 'is-closed'].join(' ')
          }
          return decision
        },
      }
    }
    // (i) `{state:'closed', changed:false}` on the close route while the word is `'open'`: the
    //     landed adapter writes NOTHING; the recomputing variant writes ONCE. §0C item 6 (a) is
    //     why the COUNT is the assertion: the recomputer computes a class too — it is simply the
    //     WRONG class, because the class is a function of WHETHER the write happened.
    const noOpRecord: AdoptedRecord = { state: 'closed', changed: false }
    const faithfulA = countingFrame('open', false)
    const recomputingA = countingFrame('open', true)
    faithfulA.drive(noOpRecord)
    recomputingA.drive(noOpRecord)
    expect(faithfulA.reads(), "§0C item 6 (i): the frame's WRITE COUNT must be 0 for an injected `changed:false` record — the guard is the RECORD's member").toBe(0)
    expect(recomputingA.reads(), '…while the `isOpen()`-recomputing implementation writes 1 and FAILS — the exact false-green of `§0C` item 6').toBe(1)
    // (ii) A SECOND injected move (`{state:'open', changed:false}`, the same denial): the two corpora
    //     now answer the IDENTICAL record sequence and end on DIFFERENT frames — the record-reader
    //     never wrote (its class still reflects the write it DENIED), while the recomputer wrote on
    //     both drives and recomputed a class from the wrong authority. `§0C` item 6 clause (a) is
    //     this exact point: a recomputer computes a class — a PLAUSIBLE one — so the CLASS cannot
    //     separate a correct corpus from a wrong one; only the COUNTED WRITES can.
    const noOpBack: AdoptedRecord = { state: 'open', changed: false }
    faithfulA.drive(noOpBack)
    recomputingA.drive(noOpBack)
    expect(faithfulA.reads(), 'the faithful corpus still answers the RECORD (no write on either injected no-op)').toBe(0)
    expect(recomputingA.reads(), 'the recomputing corpus answers the STATE (a write on each injected move)').toBe(2)
    expect(
      faithfulA.tokens().join(' '),
      "…and the CLASS is now IDENTICAL for both corpora over that same record sequence (`is-open` for each — the record-reader kept the class its DENIED writes left it, and the recomputer recomputed a class from the wrong authority that happens to look the same). THAT is `§0C` item 6 clause (a) demonstrated: a corpus which recomputes produces a PLAUSIBLE class, so the class cannot discriminate; only the COUNTED WRITES can. (The opposite pair `{closed,false}` then `{open,true}` gives the class divergence instead — which is why the row asserts the COUNT on the exposure drives and never the class.)",
    ).toBe(recomputingA.tokens().join(' '))
    expect(recomputingA.tokens().length, 'both corpora carry a well-formed class set (the recomputer is plausible, not broken)').toBe(2)
    expect(faithfulA.tokens().length, 'both corpora carry a well-formed class set').toBe(2)
    // (iii) the OTHER direction (`NG-SM2-NOOPWRITE`): `{state:'open', changed:true}` on an UNMOVED
    //     state — the landed adapter SHOWS the write; the recomputer writes not at all.
    const noMoveRecord: AdoptedRecord = { state: 'open', changed: true }
    const faithfulB = countingFrame('open', false)
    const recomputingB = countingFrame('open', true)
    faithfulB.drive(noMoveRecord)
    recomputingB.drive(noMoveRecord)
    expect(faithfulB.reads(), 'the mirror must SHOW the write the record reports (exactly one)').toBe(1)
    expect(recomputingB.reads(), '…while a state-recomputing guard writes 0 — the same hole, the other direction').toBe(0)
    // (iv) THE ADAPTER'S OWN ROUTE, with the falsifying corpus: the injected record is what the
    //     adapter CONSUMED, so the drives above are the adapter's own reading of it — the word it
    //     returns (`isOpen()`) follows the RECORD while the write follows `changed`.
    const corpus = await falsifyingCorpus()
    const c = corpus.createModalController({ initialOpen: false })
    voidVerdict(c, 'open')
    voidVerdict(c, 'close')
    expect(
      c.isOpen(),
      "§2.3 item 1 / §2.4 clause 2: the adapter's word follows the RECORD's `state` member through the falsifying corpus (the injected records report `changed: false` on BOTH moves)",
    ).toBe(false)
    const faithfulC = countingFrame('open', false)
    const recomputingC = countingFrame('open', true)
    faithfulC.drive({ state: 'closed', changed: false })
    recomputingC.drive({ state: 'closed', changed: false })
    expect([faithfulC.reads(), recomputingC.reads()], '…and the two implementations diverge on the write count for that same record [faithful, recomputing]').toEqual([0, 1])
  })
})

// ===========================================================================
// §2.2 — THE KEPT WIRING, item by item. GREEN-ON-ARRIVAL (§6.1 order 7: the behaviour is
// KEPT) and authored as the unit's REGRESSION GUARD. These are also the rows that red if a
// landing DELETES the re-parent, the scrim, the Escape route or the fail-soft/idempotence
// guarantees while the pure rows stay green (§1.2's one-clause statement of a REGRESSION).
// ===========================================================================
describe('PD-UI-6 §2.2 — the KEPT wiring: the four literal ids, exactly three listeners, and the controller built hidden', () => {
  beforeEach(() => {
    installShim()
  })

  it('§2.2 items 4/5 — the four elements are resolved by LITERAL id and the controller is built `{ initialOpen: false }` (hidden by default)', async () => {
    const auth = authorModal()
    const install = await requireInstall()
    expect(() => install()).not.toThrow()
    expect(tokensOf(auth.frame), '§2.2 item 6: the class mirror runs ONCE at install (the hidden default)').toContain('is-closed')
    expect(tokensOf(auth.frame)).not.toContain('is-open')
    expect(modalSrc, "§2.2 item 4: the four literal ids are the resolution census — `'settings-modal'`, `'settings-toggle'`, `'settings-modal-scrim'`, `'settings-modal-body'`").toContain("getElementById('settings-modal')")
    expect(modalSrc, "§2.2 item 4: `getElementById('settings-toggle')`").toContain("getElementById('settings-toggle')")
    expect(modalSrc, "§2.2 item 4: `getElementById('settings-modal-scrim')`").toContain("getElementById('settings-modal-scrim')")
    expect(modalSrc, "§2.2 item 4: `getElementById('settings-modal-body')`").toContain("getElementById('settings-modal-body')")
    expect(modalSrc, '§2.2 item 5 / §6.3 item 4: the wiring still builds its controller with the `initialOpen: false` literal').toMatch(/initialOpen\s*:\s*false/)
  })

  it('§2.2 item 7 — EXACTLY ONE toggle click listener on `#settings-toggle`, and it flips the frame both ways', async () => {
    const auth = authorModal()
    const install = await requireInstall()
    install()
    expect(listenersOn(auth.toggle, 'click'), "§2.2 item 7: EXACTLY ONE `addEventListener('click', …)` on the toggle").toBe(1)
    auth.toggle.dispatchPointer('click')
    expect(tokensOf(auth.frame), '§2.2 item 7: the toggle routes to `toggle()` → the frame flips to `.is-open`').toContain('is-open')
    expect(tokensOf(auth.frame)).not.toContain('is-closed')
    auth.toggle.dispatchPointer('click')
    expect(tokensOf(auth.frame)).toContain('is-closed')
    expect(tokensOf(auth.frame)).not.toContain('is-open')
  })

  it("§2.2 item 8 — EXACTLY ONE document `keydown` routing the LITERAL comparison `e.key === 'Escape'`; every non-Escape key is IGNORED", async () => {
    const auth = authorModal()
    const install = await requireInstall()
    install()
    expect(docListenerCount(), "§2.2 item 8: EXACTLY ONE `document.addEventListener('keydown', …)`").toBe(1)
    expect(modalSrc, "§2.2 item 8 / §2.5 / `C-2`: the literal comparison stays IN THE WIRING (`e.key === 'Escape'`) — the mechanism may not watch a key").toMatch(/key\s*===\s*'Escape'/)
    auth.toggle.dispatchPointer('click')
    expect(tokensOf(auth.frame)).toContain('is-open')
    for (const key of ['Enter', 'KeyE', ' ', 'Scape', '', 'Escape ', 'KeyEscape']) {
      expect(() => shimDocument.dispatchPointer('keydown', auth.frame, { key })).not.toThrow()
      expect(tokensOf(auth.frame), `§3.4 item 9: a non-Escape key "${key}" must NOT close the modal`).toContain('is-open')
    }
    shimDocument.dispatchPointer('keydown', auth.frame, { key: 'Escape' })
    expect(tokensOf(auth.frame), '§2.2 item 8 / §2.5: the Escape route closes the frame').toContain('is-closed')
  })

  it('§2.2 item 9 — EXACTLY ONE DIRECT scrim click listener on `#settings-modal-scrim`, and a CONTENT click on `#settings-modal-body` never reaches it', async () => {
    const auth = authorModal()
    const install = await requireInstall()
    install()
    expect(listenersOn(auth.scrim, 'click'), '§2.2 item 9: EXACTLY ONE DIRECT click listener on the dedicated scrim — not document-delegated').toBe(1)
    auth.toggle.dispatchPointer('click')
    expect(tokensOf(auth.frame)).toContain('is-open')
    auth.modalBody.dispatchPointer('click')
    expect(tokensOf(auth.frame), '§3.4 item 10: a click on `#settings-modal-body` is NOT a scrim click — the modal stays open').toContain('is-open')
    const child = new ShimElement('div')
    auth.modalBody.appendChild(child)
    child.dispatchPointer('click')
    expect(tokensOf(auth.frame), '§3.4 item 10: a click on a nested content child of the body is NOT a scrim click').toContain('is-open')
    auth.scrim.dispatchPointer('click')
    expect(tokensOf(auth.frame), '§2.2 item 9: the dedicated scrim click closes').toContain('is-closed')
  })

  it('§2.2 item 3 / §3.4 item 4 — per-document idempotence: ONE toggle listener, ONE document keydown, ONE scrim listener, ONE re-parent after a DOUBLE install on the SAME document', async () => {
    const auth = authorModal()
    const install = await requireInstall()
    install()
    install()
    expect(listenersOn(auth.toggle, 'click'), '§2.2 item 3: a second call on the SAME document is a no-op').toBe(1)
    expect(docListenerCount(), '§2.2 item 3: ONE document keydown, not two').toBe(1)
    expect(listenersOn(auth.scrim, 'click'), '§2.2 item 3: ONE scrim listener, not two').toBe(1)
    expect(auth.modalBody.children.filter((c) => c === auth.panes).length, '§2.2 item 3: the re-parent is not duplicated').toBe(1)
    expect(auth.modalBody.children.filter((c) => c === auth.opPanes).length).toBe(1)
    expect(auth.modalBody.children.length).toBe(2)
  })

  it('§2.2 item 3 / §3.4 item 5 — an install on a DIFFERENT document wires independently: the marker is per-DOCUMENT, compared by identity', async () => {
    const auth = authorModal()
    const install = await requireInstall()
    install()
    expect(listenersOn(auth.toggle, 'click')).toBe(1)
    installShim() // a FRESH document tree (a distinct `document` object)
    const auth2 = authorModal()
    install()
    expect(listenersOn(auth2.toggle, 'click'), '§3.4 item 5: a fresh document wires its OWN affordances').toBe(1)
    expect(auth2.modalBody.children.length, '§3.4 item 5: and re-parents its OWN mounts').toBe(2)
  })
})

// ===========================================================================
// §3.4 — `installSettingsModal`'s fail-states: FAIL-SOFT + IDEMPOTENT. Green-on-arrival
// (the landed body already carries every guard; §1.2 (b) KEEPS them).
// ===========================================================================
describe('PD-UI-6 §3.4 — `installSettingsModal` is FAIL-SOFT and never breaks boot', () => {
  beforeEach(() => {
    installShim()
  })

  it('§3.4 items 1/2 — an absent DOM, or ANY ONE of the four elements absent, is a NO-OP that never throws', async () => {
    const install = await requireInstall()
    const missing = ['settings-modal', 'settings-toggle', 'settings-modal-scrim', 'settings-modal-body'] as const
    const wrong: string[] = []
    // The shim's `getElementById` AUTO-MINTS a node for any id, so "an element is absent"
    // is driven through the RESOLVER itself — which is exactly how the wiring resolves it
    // (`§2.2` item 4). Each of the four ids is hidden in turn and NOTHING else changes.
    for (const gone of missing) {
      installShim()
      const auth = authorModal()
      const doc = globalThis.document as unknown as { getElementById(id: string): ShimElement }
      const real = doc.getElementById.bind(doc)
      ;(doc as unknown as { getElementById: (id: string) => ShimElement | null }).getElementById = (id: string) => (id === gone ? null : real(id))
      const text = caught(() => install())
      if (text !== null) wrong.push(`install with #${gone} absent THREW: ${text}`)
      if (gone !== 'settings-modal') {
        // §3.4 item 2: "no listeners, no re-parent, no class write" when ANY one is absent
        if (listenersOn(auth.toggle, 'click') !== 0) wrong.push(`§3.4 item 2: a listener was registered even though #${gone} is absent`)
        if (auth.modalBody.children.length !== 0) wrong.push(`§3.4 item 2: a re-parent happened even though #${gone} is absent`)
        if (tokensOf(auth.frame).includes('is-open')) wrong.push(`§3.4 item 2: a class write happened even though #${gone} is absent`)
      }
    }
    installShim() // an entirely EMPTY document
    const emptyText = caught(() => install())
    if (emptyText !== null) wrong.push(`install on an empty document THREW: ${emptyText}`)
    const saved = (globalThis as Record<string, unknown>).document
    delete (globalThis as Record<string, unknown>).document
    try {
      const noDomText = caught(() => install())
      if (noDomText !== null) wrong.push(`install with no DOM THREW: ${noDomText}`)
    } finally {
      ;(globalThis as Record<string, unknown>).document = saved
    }
    expect(wrong, '§3.4 items 1/2: "no-op, no throw — no listeners, no re-parent, no class write"').toEqual([])
  })

  it('§3.4 item 3 — the app-graph side present while the operator mounts are ABSENT (unresolvable): NOTHING else is re-parented and nothing throws', async () => {
    const auth = authorModal()
    const doc = globalThis.document as unknown as { getElementById(id: string): ShimElement }
    const real = doc.getElementById.bind(doc)
    // the two mount ids are unresolvable while EVERY other id (frame/scrim/body/toggle)
    // still resolves — so the wiring installs fully and simply skips the absent mounts
    ;(doc as unknown as { getElementById: (id: string) => ShimElement | null }).getElementById = (id: string) =>
      id === 'panes' || id === 'operator-panes' ? null : real(id)
    const install = await requireInstall()
    expect(() => install()).not.toThrow()
    expect(
      auth.modalBody.children,
      "§2.7 items 4/5: the modal's children are EXACTLY the two operator mounts — an absent mount is SKIPPED, never fabricated, and nothing else (no `#app`, no pane frame) enters",
    ).toEqual([])
    expect(listenersOn(auth.toggle, 'click'), 'the wiring still installs its affordances — only the mounts are absent').toBe(1)
  })

  it('§3.4 item 6 — a body that lacks `appendChild` skips that mount and never throws', async () => {
    const auth = authorModal()
    ;(auth.modalBody as unknown as { appendChild: unknown }).appendChild = undefined
    const install = await requireInstall()
    expect(() => install()).not.toThrow()
    expect(auth.modalBody.children.length, '§2.7 item 5: "each mount is appended only when it EXISTS and only when the body exposes `appendChild`"').toBe(0)
  })

  it('§3.4 item 8 — a click on `#settings-toggle` before the frame exists never throws (and NO listener is registered on the toggle)', async () => {
    const doc = globalThis.document as unknown as { body: ShimElement; getElementById(id: string): ShimElement }
    const toggle = doc.getElementById('settings-toggle')
    doc.body.appendChild(toggle)
    const real = doc.getElementById.bind(doc)
    ;(doc as unknown as { getElementById: (id: string) => ShimElement | null }).getElementById = (id: string) => (id === 'settings-modal' ? null : real(id))
    const install = await requireInstall()
    expect(() => install()).not.toThrow()
    expect(listenersOn(toggle, 'click'), '§3.4 item 2: "no listeners, no re-parent, no class write" when the frame is absent').toBe(0)
    expect(() => toggle.dispatchPointer('click')).not.toThrow()
  })

  it('§3.2 item 13 — `createModalController` reads NO ambient DOM: the pure controller works with the DOM removed entirely, and the controller holds no listener', async () => {
    const create = await requireFactory()
    const saved = (globalThis as Record<string, unknown>).document
    delete (globalThis as Record<string, unknown>).document
    try {
      const c = create({ initialOpen: true })
      expect(c.isOpen()).toBe(true)
      expect(caught(() => c.close())).toBeNull()
      expect(c.isOpen()).toBe(false)
    } finally {
      ;(globalThis as Record<string, unknown>).document = saved
    }
    const controllerBody = modalSrc.slice(modalSrc.indexOf('export function createModalController'), modalSrc.indexOf('export function installSettingsModal'))
    expect(controllerBody, '§3.2 item 13: NO listener inside the controller — the wiring owns all three affordances').not.toContain('addEventListener')
  })
})

// ===========================================================================
// §2.4 — the class mirror's THREE KEPT PROPERTIES, driven on the REAL wiring: the XOR
// pair, sibling-class survival, and one write per real transition / none on a no-op.
// `SH7-ADV2` and `SH7-ADV3` are RE-DERIVED here from this spec (`§6.3` class 5).
// ===========================================================================
describe("PD-UI-6 §2.4 — the class mirror's three KEPT properties (the re-derived `SH7-ADV2`/`SH7-ADV3` tripwires)", () => {
  beforeEach(() => {
    installShim()
  })

  it('§2.4 — the COUNTED class writes: exactly ONE at install, +1 per real transition, +0 on every idempotent Escape/scrim no-op (the re-derived `SH7-ADV2`)', async () => {
    const auth = authorModal()
    const counter = countClassWrites(auth.frame)
    const install = await requireInstall()
    install()
    // §2.2 item 6: `apply()` runs ONCE at install (the hidden default)
    expect(counter.reads(), '§2.2 item 6 / §2.4: exactly ONE class write at install').toBe(1)
    expect(tokensOf(auth.frame)).toContain('is-closed')

    // +1 per REAL transition, named one by one so a dropped term is a LOUD failure
    const real: Array<{ label: string; drive: () => void }> = [
      { label: 'toggle click #1 (closed→open)', drive: () => auth.toggle.dispatchPointer('click') },
      { label: 'toggle click #2 (open→closed)', drive: () => auth.toggle.dispatchPointer('click') },
      { label: 'toggle click #3 (closed→open)', drive: () => auth.toggle.dispatchPointer('click') },
      { label: 'Escape while OPEN (open→closed)', drive: () => shimDocument.dispatchPointer('keydown', auth.frame, { key: 'Escape' }) },
    ]
    let expected = 1
    for (const step of real) {
      const before = counter.reads()
      step.drive()
      expected += 1
      expect(counter.reads() - before, `§2.4: "${step.label}" is a REAL transition — exactly ONE class write`).toBe(1)
      expect(counter.reads(), `§2.4: the counted writes after "${step.label}"`).toBe(expected)
    }
    expect(tokensOf(auth.frame), 'after the real transitions the frame is closed').toContain('is-closed')

    // +0 on every idempotent no-op — the row the archived file pinned as `SH7-ADV2`
    const noOps: Array<{ label: string; drive: () => void }> = [
      { label: 'Escape while CLOSED (idempotent no-op)', drive: () => shimDocument.dispatchPointer('keydown', auth.frame, { key: 'Escape' }) },
      { label: 'scrim click while CLOSED (idempotent no-op)', drive: () => auth.scrim.dispatchPointer('click') },
    ]
    for (const step of noOps) {
      const before = counter.reads()
      step.drive()
      expect(counter.reads() - before, `§2.4 clause 4: "${step.label}" must perform NO class write`).toBe(0)
      expect(counter.reads(), `§2.4: the counted writes after "${step.label}" are unchanged`).toBe(expected)
    }
    expect(tokensOf(auth.frame)).toContain('is-closed')
    expect(tokensOf(auth.frame)).not.toContain('is-open')
  })

  it('§2.4 — the XOR pair holds after EVERY affordance drive: exactly one of `is-open`/`is-closed`, and it agrees with the frame state', async () => {
    const auth = authorModal()
    const install = await requireInstall()
    install()
    const check = (ctx: string): void => {
      const t = tokensOf(auth.frame)
      const hasOpen = t.includes('is-open')
      const hasClosed = t.includes('is-closed')
      expect(hasOpen !== hasClosed, `§2.4: after ${ctx} the frame carries ${hasClosed ? 'BOTH' : 'NEITHER'} state class ("${auth.frame.className}")`).toBe(true)
    }
    check('install')
    for (const step of ['toggle', 'toggle', 'escape', 'escape', 'scrim'] as const) {
      if (step === 'toggle') auth.toggle.dispatchPointer('click')
      else if (step === 'escape') shimDocument.dispatchPointer('keydown', auth.frame, { key: 'Escape' })
      else auth.scrim.dispatchPointer('click')
      check(step)
    }
  })

  it('§2.4 — SIBLING-CLASS SURVIVAL: every non-`is-*` token on the frame survives every write (the re-derived `SH7-ADV3`)', async () => {
    const auth = authorModal()
    auth.frame.className = 'settings-modal custom-token is-closed'
    const install = await requireInstall()
    install()
    expect(tokensOf(auth.frame), '§2.4 / §2.2 item 6: `apply()` PRESERVES any non-`is-*` class on the frame').toContain('custom-token')
    for (let i = 0; i < 4; i++) {
      auth.toggle.dispatchPointer('click')
      expect(tokensOf(auth.frame), '§2.4: the sibling token survives every write (the mirror never wipes the whole `className`)').toContain('custom-token')
      const t = tokensOf(auth.frame)
      expect(t.includes('is-open') !== t.includes('is-closed'), '§2.4: and the XOR pair still holds').toBe(true)
    }
    shimDocument.dispatchPointer('keydown', auth.frame, { key: 'Escape' })
    expect(tokensOf(auth.frame), '§2.4: the sibling token survives the Escape route too').toContain('custom-token')
  })
})

// ===========================================================================
// §2.7 — THE KEPT RE-PARENT HALF, preserved EXACTLY (RETained against the foundation's
// REFUSAL, `R-2`). Green-on-arrival: the unit's REGRESSION GUARD.
// ===========================================================================
describe('PD-UI-6 §2.7 — the KEPT re-parent half: the two EXISTING mounts move into the modal body, re-mount only', () => {
  beforeEach(() => {
    installShim()
  })

  it("§2.7 items 1/3/4 — `#settings-modal-body`'s children are EXACTLY `#panes` + `#operator-panes` (HARD INVARIANT), re-parented while the modal is CLOSED, with `#app`/`#tab-strip` never entering", async () => {
    const auth = authorModal()
    const install = await requireInstall()
    expect(auth.modalBody.children, '§2.7 item 1: the mounts are NOT in the body before install').not.toContain(auth.panes)
    install()
    expect(auth.modalBody.children, '§2.7 item 1: `#panes` moves into the body').toContain(auth.panes)
    expect(auth.modalBody.children, '§2.7 item 1: `#operator-panes` moves into the body').toContain(auth.opPanes)
    expect(auth.panes.parent, "§2.7 item 1: `#panes`' parent IS the modal body").toBe(auth.modalBody)
    expect(auth.opPanes.parent, "§2.7 item 1: `#operator-panes`' parent IS the modal body").toBe(auth.modalBody)
    expect(auth.modalBody.children.length, "§2.7 items 1/4 — THE HARD INVARIANT: `modalBody.children.length === 2` after install, and the modal's children are EXACTLY the two operator mounts").toBe(2)
    expect(tokensOf(auth.frame), '§2.7 item 3: the re-parent runs while the modal is CLOSED (hidden) — ancestry-only, no destroy').toContain('is-closed')
    const doc = globalThis.document as unknown as { body: ShimElement }
    const app = doc.body.children.find((c) => c.id === 'app')
    const tabStrip = doc.body.children.find((c) => c.id === 'tab-strip')
    expect(app, 'the app-graph root is present in the tree, so the invariant is not vacuous').toBeDefined()
    expect(tabStrip, 'the tab strip is present in the tree, so the invariant is not vacuous').toBeDefined()
    expect(auth.modalBody.children, '§2.7 item 4: `#app` / the app-graph pane frames / `#tab-strip` / the gutters NEVER enter the modal').not.toContain(app)
    expect(auth.modalBody.children).not.toContain(tabStrip)
  })

  it("§2.7 item 1 / §2.6 clause 4(a) — the TWO LITERAL MOUNT IDS survive the dropped-parameter disposition: `getElementById('panes')` and `getElementById('operator-panes')` are still the resolution", () => {
    expect(modalSrc, '§2.6 clause 4(a): the adoption must NOT make the mount identity a caller-supplied string — the ids are MARKUP, not policy').toContain("getElementById('panes')")
    expect(modalSrc, "§2.6 clause 4(a): `getElementById('operator-panes')` survives verbatim").toContain("getElementById('operator-panes')")
    expect(modalSrc, '§2.7 item 1: the two mounts are appended into the modal body').toMatch(/appendChild/)
  })

  it('§2.7 item 2 / §2.2 item 11 — RE-MOUNT ONLY: no graph construction, no `refresh()`/`refreshDebug()`/`boot()`, no pane body authored, no envelope re-run', () => {
    for (const forbidden of ['refresh()', 'refreshDebug()', 'boot(', 'buildOperatorEnvelope', 'new Runtime(', 'createPaneRegistry(']) {
      expect(modalSrc, `§2.7 item 2 / §2.2 item 11: the wiring must NOT call ${forbidden} — "neither graph is re-created"`).not.toContain(forbidden)
    }
  })
})

// ===========================================================================
// §2.1 / §2.6 — THE ADOPTION'S DEPENDENCE and THE DROPPED-PARAMETER SIGNATURE.
// These are this unit's RED (§6.1 order 7) — the adapter's own bytes move.
// ===========================================================================
describe("PD-UI-6 §2.1 / §2.6 — the adopted-dependence and the corrected signature (this unit's RED)", () => {
  it("§2.1 import census — the adapter carries EXACTLY ONE import statement, and it is the vendored member `'../shared/overlay.js'` (the RESOLVED path is asserted by the `pd-vendor-set` pin)", () => {
    const sf = ts.createSourceFile('adapter.ts', modalSrc, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    const imports = sf.statements.filter(ts.isImportDeclaration)
    const specs = imports.map((d) => (ts.isStringLiteralLike(d.moduleSpecifier) ? d.moduleSpecifier.text : '<computed>'))
    expect(
      specs.filter((s) => s === '../shared/overlay.js'),
      "PD-UI-6 contract failure [§2.1 import census]: exactly ONE new import statement is added — `import { overlayTransition } from '../shared/overlay.js'` (the vendored module). The adapter carries no vendored import at this head, so its state/verb discipline is still hand-written",
    ).toEqual(['../shared/overlay.js'])
    expect(imports.length, '§2.1: NO other import of any kind is added — no `electron`, no `node:*`, no `provident-ssr`, no `dom-shim`, and no other vendored member').toBe(1)
  })

  it("§2.1 / §2.3 item 1 / D-3 — the bound name is called in a VALUE-BEARING position (`overlayTransition(...)`) and the adapter keeps NO second state authority", () => {
    expect(modalSrc, '§2.1: the vendored member must be called in a value-bearing position, never `void`-referenced').toMatch(/overlayTransition\s*\(/)
    expect(
      modalSrc,
      'D-3: the adapter never re-implements the matrix — no verb-equality chain of its own, no `isStateBody`, no `nextStateOf`',
    ).not.toMatch(/isStateBody|nextStateOf/)
    const calls = [...modalSrc.matchAll(/overlayTransition\s*\(([^)]*)\)/g)].map((m) => m[1]!)
    expect(calls.length, "§2.1 / §2.5 clause 1: the adopted call must be present, and the close route must reach it").toBeGreaterThan(0)
    expect(
      calls.some((args) => /verb/.test(args)),
      "§2.5 clause 1: the adapter's own verb word must be the second argument of the adopted call — the close route binds `'escape'`",
    ).toBe(true)
    expect(modalSrc, "§2.5 clause 1: the adapter's verb vocabulary carries the `'escape'` body").toContain("'escape'")
  })

  it('§2.6 clause 1 / D-9 — `installSettingsModal` takes NO parameters: the three are DROPPED from the pinned surface', () => {
    expect(
      /export\s+function\s+installSettingsModal\s*\(\s*\)\s*:\s*void/.test(modalSrc),
      'PD-UI-6 contract failure [§2.6 clause 1 / D-9]: the new signature is `installSettingsModal(): void` — the three parameters, their types, their optionality and the "accepted for signature shape only" clause are REMOVED',
    ).toBe(true)
    for (const gone of ['host?', 'panels?', 'mounts?']) {
      expect(modalSrc, `§2.6 clause 1: the parameter \`${gone}\` is dropped from the pinned surface`).not.toContain(gone)
    }
  })

  it('§2.6 item 3 / §1.1 item 9 — the ONE call site is re-pointed in the same commit, still positioned after `installShellPointers(host)` and before the boot call, with the literal `installSettingsModal(` surviving', () => {
    const calls = [...rendererSrc.matchAll(/installSettingsModal\s*\(([^)]*)\)/g)]
    expect(calls.length, '§1.1 item 9: `renderer.ts` holds exactly ONE `installSettingsModal(` call site').toBe(1)
    expect(
      calls[0]![1]!.trim(),
      '§2.6 item 3: the call site is re-pointed to the dropped signature — NO arguments (the literal `installSettingsModal(` survives, per §6.3 item 4)',
    ).toBe('')
    const installAt = rendererSrc.indexOf('installSettingsModal(')
    const pointersAt = rendererSrc.indexOf('installShellPointers(host)')
    // ⟨RE-STATED 2026-09-29 — unit `U-APP-HARNESS-READINESS` (that unit's spec is filed 2026-10-15;
    //  this note carries the PASS date).⟩ WHY: this row's SUBJECT — the ONE `installSettingsModal()`
    //  call site, UNCHANGED in its source form, still positioned AFTER `installShellPointers(host)`
    //  and BEFORE the boot call — is intact. What moved is a NEIGHBOUR the row reads only for
    //  POSITION: `U-APP-HARNESS-READINESS` §2.2 `B-1` item 4 hangs the boot-install observable on the
    //  app's own "initial graph install completed" boundary, so the boot call site is now a
    //  `.then(...)`/`.catch(...)` CHAIN written across lines (`void host` ⏎ `  .boot(runtime)`), and
    //  the AS-FILED single-line source form `/void\s+host\.boot\(/` no longer matches it.
    //  ANNOTATE-BESIDE (`RCA-8(c)`): BOTH recorded forms stay VISIBLE below — the as-filed one first —
    //  and the position limbs are UNCHANGED. TEETH KEPT: only these RECORDED forms are admissible,
    //  so an UNRECORDED further move of the boot call (a different form) still FAILS: the oracle is
    //  driven BOTH ways in the controls below, over synthetic corpora, rather than asserted.
    const RECORDED_BOOT_CALL_FORMS = [
      /void\s+host\.boot\(/, // AS FILED (superseded source form, kept visible)
      /void\s+host\s*\.\s*boot\s*\(/, // ⟨RE-STATED 2026-09-29, unit U-APP-HARNESS-READINESS⟩ the chained multi-line form
    ] as const
    const bootCallAt = (src: string): number => {
      let at = -1
      for (const form of RECORDED_BOOT_CALL_FORMS) {
        const i = src.search(form)
        if (i > -1 && (at === -1 || i < at)) at = i
      }
      return at
    }
    const bootAt = bootCallAt(rendererSrc)
    expect(pointersAt, '§2.2 item 1: `installShellPointers(host)` must be present').toBeGreaterThan(-1)
    expect(bootAt, '§2.2 item 1: the boot call must be present in one of the RECORDED source forms (as filed `void host.boot(runtime)`, or the re-stated chained `void host` ⏎ `.boot(runtime)`)').toBeGreaterThan(-1)
    expect(installAt, '§2.2 item 1: the call sits AFTER `installShellPointers(host)` — the POSITION is unchanged').toBeGreaterThan(pointersAt)
    expect(installAt, '§2.2 item 1: …and BEFORE the boot call — the POSITION is unchanged').toBeLessThan(bootAt)
    // THE CONTROLS — the SAME oracle driven both ways, so the re-stated form is shown to be
    // non-vacuous and its refusal of an UNRECORDED form is shown rather than asserted.
    expect(bootCallAt('void host.boot(runtime)\n'), 'the AS-FILED single-line form stays RECORDED (a head that has not yet moved is still green)').toBeGreaterThan(-1)
    expect(bootCallAt('void host\n  .boot(runtime)\n  .then(() => undefined)\n'), 'the RE-STATED chained form is matched, else this re-statement would be vacuous').toBeGreaterThan(-1)
    expect(bootCallAt('const p = host.boot(runtime)\n'), 'an UNRECORDED form (the boot call is not `void`-ed) must NOT match — the re-statement is a recorded pair of forms, never "any boot call"').toBe(-1)
    expect(bootCallAt('void host?.boot(runtime)\n'), 'an UNRECORDED optional-call form must NOT match').toBe(-1)
    expect(bootCallAt('await host.boot(runtime)\n'), 'an UNRECORDED `await`-ed form must NOT match').toBe(-1)
  })

  it('§2.6 clauses 4(b)/4(c) — the three dropped parameters are NOT consumed (`host`/`panels` are never read) and the `renderer.ts` import statement stays', () => {
    const wiringBody = modalSrc.slice(modalSrc.indexOf('export function installSettingsModal'))
    expect(wiringBody, '§2.6 clause 2(ii): `host` and `panels` are not mount carriers, and the modal may not call into either graph — nothing of theirs is read').not.toMatch(/\bhost\.|\bpanels\./)
    expect(rendererSrc, '§1.4 / §1.1 item 9: nothing else in `renderer.ts` changes — the import statement stays').toContain("import { installSettingsModal } from './modal-state.js'")
  })
})

// ===========================================================================
// §3.6 / §6.3 item 4 — THE SOURCE-TEXT PINS, RE-DERIVED BY NAME (`R-11`), never copied.
// ===========================================================================
describe('PD-UI-6 §3.6 / §6.3 item 4 — the source-text pins re-derived by name (`G-9`/`R-11`)', () => {
  it("§6.3 item 4 — the toggle pin re-stated: the id literal and the one-listener discipline survive, and the routed call's shape moves to the adopted route", () => {
    expect(modalSrc, '§6.3 item 4: the `#settings-toggle` id literal survives').toContain('settings-toggle')
    expect(modalSrc, "§6.3 item 4: one `addEventListener('click', …)`").toContain("addEventListener('click'")
    expect(modalSrc, "§6.3 item 4: the toggle click still routes to the controller's toggle route").toContain('toggle()')
  })

  it("§6.3 item 4 — the Escape pin re-stated IN PART, with its SUBJECT STRENGTHENED: the literal `e.key === 'Escape'` survives in the wiring AND the routing target is the `'escape'` verb", () => {
    expect(
      modalSrc,
      "§2.2 item 8 / §2.8 (`C-2`): the fork may not move the key route into the mechanism — the literal comparison STAYS IN THE WIRING",
    ).toMatch(/key\s*===\s*'Escape'/)
    expect(modalSrc, "§2.5 clause 1: the routing target is the `'escape'` verb — `close()` is reached through the mechanism's `'escape'` column").toContain("'escape'")
    expect(modalSrc, '§6.3 item 4: the document-level keydown listener survives').toMatch(/addEventListener\(\s*'keydown'/)
  })

  it("§6.3 item 4 — the scrim pin survives EXACTLY, and the class-mirror pin is RE-STATED: the XOR survives and the guard moves to the record's `changed` member", () => {
    expect(modalSrc, '§6.3 item 4: the dedicated scrim id literal survives').toContain('settings-modal-scrim')
    expect(modalSrc, '§6.3 item 4: the XOR pair survives in the mirror').toContain('is-open')
    expect(modalSrc, '§6.3 item 4: the XOR pair survives in the mirror').toContain('is-closed')
    expect(
      modalSrc,
      "§6.3 item 4 / §2.4: the mirror's guard moves to the adopted record's `changed` member — a pin re-statement, never a relaxation",
    ).toMatch(/\.changed\b/)
  })

  it("§6.3 item 4 / §2.8 — the ADV1 source pin re-derived VERBATIM (the file is DENIED to this unit): `src/renderer/index.html`'s dedicated scrim carries `pointer-events: auto` in its own CSS block", () => {
    const html = readText(INDEX_HTML_PATH)
    expect(html, 'SH7-ADV1 re-derived: the dedicated scrim element/rule must be present').toContain('settings-modal-scrim')
    const scrimCss = html.slice(html.indexOf('#settings-modal-scrim'))
    expect(scrimCss, 'SH7-ADV1 re-derived verbatim: the scrim must reset `pointer-events` to `auto`').toMatch(/pointer-events\s*:\s*auto/)
    expect(html.indexOf('#settings-modal-scrim {') >= 0, 'SH7-ADV1 re-derived verbatim: the scrim rule selector with a CSS block brace').toBe(true)
  })

  it('§1.2 (b)/§1.1 item 14 — the authored surface is UNCHANGED by this unit: the six ids, the `.is-closed` display rule and the class vocabulary', () => {
    const html = readText(INDEX_HTML_PATH)
    for (const id of ['settings-modal', 'settings-modal-scrim', 'settings-modal-body', 'settings-toggle', 'panes', 'operator-panes']) {
      expect(html, `§1.1 item 14: the authored id \`${id}\` is present in src/renderer/index.html`).toContain(id)
    }
    expect(html, '§1.1 item 14: the `.is-closed` display rule (the node-testable proxy for "hidden")').toMatch(/\.settings-modal\.is-closed\s*\{\s*display\s*:\s*none/)
    expect(html, '§1.1 item 14: the class vocabulary `is-open`').toContain('is-open')
    expect(html, '§1.1 item 14: … and `is-closed`').toContain('is-closed')
  })
})

// ===========================================================================
// §6.4 — the `[T]`-side census-stability obligations this FILE carries (`§6.4` items 1/3).
// ===========================================================================
describe('PD-UI-6 §6.4 — this file binds NO vitest mock API, and carries no skipped row', () => {
  function findings(text: string): string[] {
    return MOCK_NEEDLES.filter((needle) => text.includes(needle))
  }

  it("§6.4 item 1 — the mock-binding oracle DISCRIMINATES (a `from 'vitest'` `vi.mock` binding is caught in every access form), so the self-scan below is not vacuous", () => {
    for (const control of MOCK_ORACLE_CONTROLS) {
      expect(
        findings(control.source).length > 0,
        `§6.4 item 1 control: ${control.label} must ${control.mustMatch ? 'be caught' : 'NOT be caught'} by the oracle`,
      ).toBe(control.mustMatch)
    }
  })

  it("§6.4 items 1/3 — the SELF-SCAN: this file binds no vitest mock API in ANY form and carries no `skip`/`todo`/`only`", () => {
    const self = readText(fileURLToPath(import.meta.url))
    expect(
      findings(self),
      '§6.4 item 1: the new test file must not bind the vitest mock API in ANY form — the protected electron census (five names) and the non-electron binder census (four paths) must not move',
    ).toEqual([])
    expect(self, '§6.4 item 3: no row may be quietly skipped — a dropped term must be a LOUD failure, never a vacuous pass').not.toMatch(/\b(it|describe)\.(skip|todo|only|skipIf|runIf)\b/)
  })
})

// ===========================================================================
// THE REGRESSION-GUARD ROWS — `§6.1` order 7 and `§1.2`'s one-clause statement: *"if a
// landing deletes the re-parent, the scrim, the Escape route or the fail-soft/idempotence
// guarantees while the pure rows stay green, the adoption has either not happened or has
// deleted the app's shell behaviour."* GREEN at this head; they fail a DELETION.
// ===========================================================================
describe('PD-UI-6 §1.2 — the deletion tripwires (green at this head; they fail a deletion, never a re-expression)', () => {
  beforeEach(() => {
    installShim()
  })

  it('§1.2 (b) — the SEVEN kept behaviours are all present in one drive', async () => {
    const auth = authorModal()
    const install = await requireInstall()
    install()
    const kept: Record<string, boolean> = {
      frameResolved: tokensOf(auth.frame).length > 0,
      xorMirror: tokensOf(auth.frame).includes('is-closed') && !tokensOf(auth.frame).includes('is-open'),
      oneToggleListener: listenersOn(auth.toggle, 'click') === 1,
      oneDocumentEscape: docListenerCount() === 1,
      oneDirectScrim: listenersOn(auth.scrim, 'click') === 1,
      reparented: auth.modalBody.children.length === 2 && auth.panes.parent === auth.modalBody,
      operatorMountsIntact: auth.modalBody.children.includes(auth.panes) && auth.modalBody.children.includes(auth.opPanes),
    }
    const deleted = Object.entries(kept)
      .filter(([, v]) => !v)
      .map(([k]) => k)
    expect(
      deleted,
      "§1.2: every KEPT behaviour must be present — a landing that deletes one of these while the pure rows stay green has deleted the app's shell behaviour",
    ).toEqual([])
  })

  it('§3.4 item 14 — the whole wiring body is inside one `try`/`catch`, and a failing class write is ABSORBED', async () => {
    expect(modalSrc, '§3.4 item 14: "never breaks boot, never throws — the whole body is inside one `try`/`catch`"').toMatch(/try\s*\{/)
    expect(modalSrc, '§3.4 item 14: an absorbing `catch` follows').toMatch(/catch/)
    const auth = authorModal()
    Object.defineProperty(auth.frame, 'className', {
      configurable: true,
      get() {
        return 'settings-modal is-closed'
      },
      set() {
        throw new Error('read-only className')
      },
    })
    const install = await requireInstall()
    expect(() => install(), '§3.4 items 7/14: a failing class write is ABSORBED — the install never throws and boot is not broken').not.toThrow()
  })
})

