// tests/integration/shell-chrome/stage-display-restore.test.ts — unit `B-10` `stage-display-state`'s RESTORE rows `(S5)`, its
// ECHO row `(S7)`, and the FIX ROUND's three regression rows: `(S5·boot)`, `(S4·subject)` and `(S4·reauthor)`. Authored BEFORE any
// byte of the change set moves (RCA-1). Every claim is READ off `docs/L1/unit-b-10-stage-display-state.md` and the section it names.
//
// THE ROWS THIS FILE CARRIES:
//   `(S5·held)` §6's site and order — the restore is applied **off the held reading with ZERO awaits and ZERO port reads**: the
//          caret into `#page-edit-surface` (path re-resolved, offsets CLAMPED — `sidebar-panes.ts`'s `restorePageCaret` law), the
//          scroll into `#app [id="zone:main"]` (`ASM-B10-2`), and the controller PRIMED so the next re-derive carries the same caret.
//   `(S5·no-entry)` / `(S5·stamp)` / `(S5·deleted)` §6's STAMP ARM RUNS FIRST — an absent entry is `reason:'no-entry'`; a record
//          naming `doc-a` under a tab whose target is `doc-b` is a **DROP**: `doc-b` is STILL what is shown, no caret is applied, no
//          scroll is applied, `reason:'stamp-mismatch'`; and a DELETED document's entry is dropped by the same arm plus
//          `restoreCaret`'s own liveness clearing (`edit-controller.ts:249-271`, untouched here).
//   `(S5·inv-e)` **`INV-E` MEASURED ON THE RESTORE'S TURN** = `0 loadAppGraph / 0 mountOperator / 0 refresh()`, with the three
//          counters wrapped on the host handle the restore is handed, **PLUS THE SIX MUTANTS EACH MEASURED RED FIRST** (`m1`
//          `host.refresh()`, `m2` `loadAppGraph`, `m3` `mountOperator`, `m4` a restore claiming an apply it did not earn, `m5` a
//          caret applied to the WRONG subject, `m6` the `D-40` class: the CAPTURE REMOVED).
//   `(S7·echo)` §6's ECHO RULE — a write ⇒ push ⇒ re-read with a LIVE selection ⇒ **0 restores** (a push re-reads and repaints
//          nothing; only a tab ACTIVATION restores).
//   `(S5·boot)` **THE FIX ROUND'S BOOT/RESTART ARM** (§6, §7 `(S5)`) — the REAL `TabStrip` over the layout-less shim, driven
//          through `load(persisted)` then `ensure()`: EXACTLY TWO `onActiveChange` fires for one tab, both restoring the caret and
//          the view read off a REAL record over a `/tmp` store, both answering the applied arm, the controller primed, and both
//          fires identical (a restart's boot is idempotent). FALSIFIER: with the entry ABSENT the same boot answers `no-entry`
//          and applies nothing, so the green is not the DOM double's default.
//   `(S4·subject)` **`B10-EX-02`, THE REGRESSION ARM** (§4, §2) — a settle that lands AFTER an activation writes to the tab it was
//          READ FROM: the shipped `stageDisplayCaptureRoute` resolves the report's stamped `subject` (not the settle-time active
//          tab), falls back to the active tab when the subject is absent, answers `tab: null` for a subject naming no open tab
//          (and the capture then writes NOTHING), `scroll-settle` for a view and `null` for a focused caret (the move); and end to
//          end the write lands at `['display','tab-a']` carrying `doc-a` with **tab-b untouched**, while the MEASURED fault shape
//          (route by the active tab) reds the same oracle. **AND THE TWO `·terse` LIMBS ADDED INSIDE IT** grade the region's
//          declared TOTALITY at the two collaborator reads the fix contained: a HOSTILE OPEN SET (an array-like whose `length`
//          getter throws, a `Proxy` whose `get` trap throws) must answer WITHOUT throwing and with `tab: null` for a subject naming
//          no open tab — an unreadable set is an EMPTY set — and `stageDisplayRememberCaret(null, 'tab-a', caret)` followed by a
//          capture must be total, write ONCE, and carry THAT caret (the mirror path, where the controller is absent).
//   `(S4·reauthor)` **`B10-EX-03`/`B10-EX-04`, THE REGRESSION ARMS** (§4) — the REAL `Runtime.observeDisplayState`, driven as
//          `Runtime.prototype.observeDisplayState.call(null, …)` over DOM DOUBLES INSTALLED AS THE GLOBALS (saved and restored in a
//          `finally`): a RE-AUTHORED `#page-edit-surface` still reports (the node-bound shape reports 0 — the falsifier), a
//          `focusout` outside the surface reports nothing while one inside reports, a blur whose selection no longer resolves
//          STILL reports `{caret:null, blur:true, subject}`, and `release()` is total, idempotent and withdraws the listeners.
//
// **WHAT `INV-E` CAN AND CANNOT MEAN HERE, in this file's own words (§6):** `INV-E` is measured **on the restore's own turn**.
// A tab switch IS a graph load — activating a document tab runs `mountDocumentStage` → `loadAppGraph` (`sidebar-panes.ts:1931`) —
// but that is the app's PRE-EXISTING single-active-render behaviour and NOT this unit's, so **the switch's own mount is excluded
// BY NAME and nothing here may be read as "a tab switch loads no graph"**. `m6` is the row that keeps the counters honest: with
// the CAPTURE removed the counters are STILL `0/0/0` and the pane looks fine, so the row that catches a dead capture grades **the
// WRITTEN RECORD** (the store's write count is 0 and the entry is absent), never the paint.
//
// **THE SEAM THESE ROWS DRIVE** is §6's markered region (`// ⟦B-10-STAGE-DISPLAY⟧` … `// ⟦/B-10-STAGE-DISPLAY⟧`) in
// `src/renderer/renderer.ts`, cut from the shipped bytes, compiled with the repo's own `esbuild` and DRIVEN — never a copy. An
// ABSENT region FAILS the row, never skips it. Value names pinned: `restoreDisplayState` (§6's own) and `captureStageDisplay`
// (§7 `(S1)`'s "the real capture function"). The injected deps are §6's collaborators — `client`, `editController`, the
// `document`/`window` lookups — plus the `host` handle §7 `(S5)` needs to wrap the three counters on (stated because §6's list of
// injected collaborators does not name the host, while §7 does: the handle is handed IN so `INV-E` is an attribution the row can
// measure, and the SHIPPED restore must reach none of its three members).
//
// **COLOURS DECLARED AT THIS HEAD:** `(S5·held)`, `(S5·no-entry)`, `(S5·stamp)`, `(S5·deleted)` and `(S5·inv-e)`'s shipped half are
// RED for ONE named reason — the markered region does not exist in `src/renderer/renderer.ts`, so no restore has a body to drive.
// **GREEN ON ARRIVAL BY DESIGN**: `(S5·mutants)` (six forged regions, each of which the oracle MUST red — a control that is red
// proves nothing about the oracle) and `(S7·echo)`'s clean arm and falsifier, which drive `B-1`/`B-2`'s LANDED delivery → push →
// re-read route and pin a rule that cannot be violated while no restore exists (`B-2` §9's precedent).
//
// **THE FIX ROUND'S ROWS, EACH MEASURED IN BOTH DIRECTIONS:** `(S4·subject)` is RED on the pre-fix region bytes (the region
// declares no `stageDisplayCaptureRoute`, so the wiring can only ask "who is active now?"), and its falsifier reds the same
// oracle on the measured fault shape; `(S4·reauthor)` is RED on a node-bound registration (the 0-report fault `B10-EX-03`
// measured) and its falsifier is that shape, driven to 0 reports; `(S5·boot)` is a COVERAGE row over a restore the fix round did
// not change (GREEN on both heads) whose falsifier proves its green is not the DOM double's default. All three are GREEN at the
// landed fix head.
//
// **LAYER (`D-10`, `RCA-12`):** `[T]`/ENVELOPE. `window.getSelection`/`document.createRange` are ABSENT in the layout-less
// `src/shared/dom-shim.ts`, so every row that applies or reads a caret drives a DOCUMENTED DOM DOUBLE — envelope-class, NEVER
// app-green: no layout, no paint, no re-authored DOM. Real stores live on `mkdtempSync` paths and are removed in `afterAll`. No
// `vi.mock`, no network, no Electron spawn.
import { afterAll, describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// LANDED modules: `B-1`'s family/record/delivery, `B-2`'s client and renderer seam, the fork's controller. Namespace-imported so a
// member this unit adds answers `undefined` inside the row that needs it, never as an ESM link error.
import * as recordEngineModule from '../../../src/main/record-engine/index.js'
import * as storeroomModule from '../../../src/main/storeroom.js'
import * as displayClientModule from '../../../src/renderer/display-client.js'
import * as editControllerModule from '../../../src/renderer/edit-controller.js'
// THE REAL SURFACES THE FIX ROUND'S ROWS DRIVE: the shell's tab strip over the layout-less shim (§6's site), the REAL capture
// seam (`Runtime.observeDisplayState`), and the shim itself.
import { TabStrip } from '../../../src/renderer/tab-strip.js'
import { Runtime } from '../../../src/renderer/runtime.js'
import { TAB_STATE_VERSION } from '../../../src/renderer/tab-state.js'
import { installShim, mountEl } from '../../../src/shared/dom-shim.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..', '..')
const RENDERER_PATH = join(ROOT, 'src', 'renderer', 'renderer.ts')

const REGION_OPEN = '// ⟦B-10-STAGE-DISPLAY⟧'
const REGION_CLOSE = '// ⟦/B-10-STAGE-DISPLAY⟧'
const PINNED_NAMES = ['captureStageDisplay', 'restoreDisplayState'] as const

const TAB = 'tab-a'
const DOC_A = 'doc-a'
const DOC_B = 'doc-b'
/** §6's three drop words, and the only ones the contract spells: `no-entry` and `stamp-mismatch` are stated; the success arm's
 *  `reason` is `null` (the client's OWN idiom — `reason` is `null` exactly when the arm is live). */
const NO_ENTRY = 'no-entry'
const STAMP_MISMATCH = 'stamp-mismatch'

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

const settle = (): Promise<void> => new Promise((done) => setTimeout(done, 0))

const tempDirs: string[] = []
function newProfilePath(label: string): string {
  const dir = mkdtempSync(join(tmpdir(), `b10-stage-restore-${label}-`))
  tempDirs.push(dir)
  return join(dir, 'provident-profile.json')
}
afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true })
})

const requireFromHere = createRequire(import.meta.url)
function esbuildTransform(): ((input: string, options: AnyRecord) => { code: string }) | null {
  try {
    const loaded = requireFromHere('esbuild') as { transformSync?: (input: string, options: AnyRecord) => { code: string } }
    return typeof loaded.transformSync === 'function' ? loaded.transformSync : null
  } catch {
    return null
  }
}

// ─── the extract-and-drive instrument (§6's region) ─────────────────────────────────────────────────────────────────

interface RegionSubject {
  readonly problem: string | null
  readonly region: string
  readonly declared: readonly string[]
  readonly values: AnyRecord
}

function extractRegion(raw: string): { region: string; problem: string | null } {
  const openAt = raw.indexOf(REGION_OPEN)
  const closeAt = raw.indexOf(REGION_CLOSE)
  if (openAt < 0 || closeAt < 0) {
    const missing = [openAt < 0 ? `the opening marker \`${REGION_OPEN}\`` : null, closeAt < 0 ? `the closing marker \`${REGION_CLOSE}\`` : null]
      .filter((part): part is string => part !== null)
      .join(' and ')
    return {
      region: '',
      problem:
        `§6 makes the capture+restore functions ONE markered region at module scope in \`src/renderer/renderer.ts\` and ${missing} ` +
        `${openAt < 0 && closeAt < 0 ? 'are' : 'is'} ABSENT — there is no restore body, so no tab activation restores a caret or a ` +
        'scroll and the stamp arm that must DROP a mismatched entry never runs',
    }
  }
  if (closeAt <= openAt) return { region: '', problem: 'the `B-10` markers are inverted — the region between them is empty' }
  const region = raw.slice(openAt + REGION_OPEN.length, closeAt)
  if (region.trim().length === 0) return { region, problem: `the region between \`${REGION_OPEN}\` and \`${REGION_CLOSE}\` is EMPTY` }
  return { region, problem: null }
}

function pinReport(region: string): string[] {
  const missing: string[] = []
  for (const name of PINNED_NAMES) {
    const declared = new RegExp(
      `(?:^|\\n)\\s*(?:(?:export\\s+)?(?:async\\s+)?function\\s+${name}\\b|(?:export\\s+)?const\\s+${name}\\b)`,
    ).test(region)
    if (!declared) missing.push(`the region declares no \`${name}\``)
  }
  return missing
}

function driveRegion(region: string): RegionSubject {
  const declared = [
    ...[...region.matchAll(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm)].map((m) => m[1] as string),
    ...[...region.matchAll(/^(?:export\s+)?const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*(?::[^=\n]+)?=/gm)].map((m) => m[1] as string),
  ]
  const missing = pinReport(region)
  if (missing.length > 0) {
    return { problem: `§6/§7 pin the region's names and it misses ${missing.join(' and ')} — it declares [${declared.join(', ') || 'nothing'}]`, region, declared, values: {} }
  }
  const transformSync = esbuildTransform()
  if (transformSync === null) {
    return { problem: 'the repo\'s own `esbuild` did not resolve — the region cannot be COMPILED and this row refuses to copy it by hand', region, declared, values: {} }
  }
  const probe = `\n;module.exports.__b10Region = { ${declared.map((name) => `'${name}': typeof ${name} !== 'undefined' ? ${name} : undefined`).join(', ')} }`
  let compiled: string
  try {
    compiled = transformSync(`${region}${probe}`, { loader: 'ts', format: 'cjs', target: 'node20' }).code
  } catch (thrown) {
    return { problem: `the extracted region does not COMPILE (${msgOf(thrown)})`, region, declared, values: {} }
  }
  const moduleObject: { exports: AnyRecord } = { exports: {} }
  const requireStub = (specifier: string): never => {
    throw new Error(`the markered region requires ${show(specifier)}; the harness supplies no modules — §6's region is self-contained over INJECTED collaborators`)
  }
  try {
    // eslint-disable-next-line no-new-func
    const run = new Function('exports', 'require', 'module', 'console', 'document', 'window', compiled) as AnyFn
    run(moduleObject.exports, requireStub, moduleObject, console, undefined, undefined)
  } catch (thrown) {
    return { problem: `the compiled region THREW while being evaluated (${msgOf(thrown)})`, region, declared, values: {} }
  }
  const values = (moduleObject.exports.__b10Region ?? {}) as AnyRecord
  const absent = PINNED_NAMES.filter((name) => typeof values[name] !== 'function')
  return { problem: absent.length > 0 ? `the region declares ${absent.join(' and ')} but not as drivable VALUES` : null, region, declared, values }
}

function stageDisplaySubject(): RegionSubject {
  const extracted = extractRegion(readPath(RENDERER_PATH))
  if (extracted.problem !== null) return { problem: extracted.problem, region: '', declared: [], values: {} }
  return driveRegion(extracted.region)
}

// ─── the documented DOM double (`getSelection`/`createRange` are absent in the layout-less shim) ─────────────────────

interface FakeNode {
  nodeType: number
  data: string
  childNodes: FakeNode[]
  parentNode: FakeNode | null
  scrollTop?: number
  scrollHeight?: number
  clientHeight?: number
  dataset?: Record<string, string>
  focus?: () => void
}

const element = (children: FakeNode[], extra: Partial<FakeNode> = {}): FakeNode => {
  const node: FakeNode = { nodeType: 1, data: '', childNodes: [], parentNode: null, ...extra }
  for (const child of children) {
    child.parentNode = node
    node.childNodes.push(child)
  }
  return node
}
const textNode = (data: string): FakeNode => ({ nodeType: 3, data, childNodes: [], parentNode: null })

interface Dom {
  readonly document: AnyRecord
  readonly window: AnyRecord
  readonly surface: FakeNode
  readonly paragraph: FakeNode
  readonly text: FakeNode
  readonly scrollBox: FakeNode
  readonly stage: FakeNode
  readonly selection: AnyRecord
  /** The document the STAGE shows (the app's own `mountTab` made it so, §6 step (2)); the restore may never redirect it. */
  shown(): string | null
}

function makeDom(shownDocumentId: string): Dom {
  const surfaceText = textNode('the typed paragraph')
  const paragraph = element([surfaceText])
  const surface = element([paragraph])
  const scrollBox = element([], { scrollTop: 0, scrollHeight: 4000, clientHeight: 500 })
  const stage = element([], { dataset: { documentId: shownDocumentId } })
  const selection: AnyRecord = {
    anchorNode: null,
    anchorOffset: 0,
    focusNode: null,
    focusOffset: 0,
    rangeCount: 0,
    addRange(range: AnyRecord): void {
      selection['anchorNode'] = range['startNode']
      selection['anchorOffset'] = range['startOffset']
      selection['focusNode'] = range['endNode']
      selection['focusOffset'] = range['endOffset']
      selection['rangeCount'] = 1
    },
    removeAllRanges(): void {
      selection['anchorNode'] = null
      selection['anchorOffset'] = 0
      selection['focusNode'] = null
      selection['focusOffset'] = 0
      selection['rangeCount'] = 0
    },
    collapse(node: FakeNode, offset: number): void {
      selection['anchorNode'] = node
      selection['anchorOffset'] = offset
      selection['focusNode'] = node
      selection['focusOffset'] = offset
      selection['rangeCount'] = 1
    },
  }
  const byId: Record<string, FakeNode> = { 'page-edit-surface': surface, 'zone:main': scrollBox, app: element([scrollBox]), 'stage-body': stage }
  const document = {
    getElementById: (id: string) => byId[id] ?? null,
    querySelector: (selector: string) => (/#app\s*\[id=["']zone:main["']\]/.test(selector) ? scrollBox : null),
    querySelectorAll: () => [],
    createRange: () => ({
      startNode: null as FakeNode | null,
      startOffset: 0,
      endNode: null as FakeNode | null,
      endOffset: 0,
      setStart(node: FakeNode, offset: number) {
        this.startNode = node
        this.startOffset = offset
      },
      setEnd(node: FakeNode, offset: number) {
        this.endNode = node
        this.endOffset = offset
      },
      collapse(node: FakeNode, offset: number) {
        this.startNode = node
        this.startOffset = offset
        this.endNode = node
        this.endOffset = offset
      },
      selectNodeContents(node: FakeNode) {
        this.startNode = node
        this.endNode = node
      },
    }),
  }
  const window = { getSelection: () => selection }
  return {
    document,
    window,
    surface,
    paragraph,
    text: surfaceText,
    scrollBox,
    stage,
    selection,
    shown: () => stage.dataset?.['documentId'] ?? null,
  }
}

// ─── the host handle the three `INV-E` counters are wrapped on ──────────────────────────────────────────────────────

interface Host {
  readonly handle: AnyRecord
  readonly counters: { loadAppGraph: number; mountOperator: number; refresh: number }
  readonly reset: () => void
  readonly report: () => string
}

function makeHost(): Host {
  const counters = { loadAppGraph: 0, mountOperator: 0, refresh: 0 }
  const handle: AnyRecord = {
    loadAppGraph: () => {
      counters.loadAppGraph += 1
      return undefined
    },
    mountOperator: () => {
      counters.mountOperator += 1
      return undefined
    },
    refresh: () => {
      counters.refresh += 1
      return undefined
    },
  }
  return {
    handle,
    counters,
    reset: () => {
      counters.loadAppGraph = 0
      counters.mountOperator = 0
      counters.refresh = 0
    },
    report: () => `${counters.loadAppGraph} loadAppGraph / ${counters.mountOperator} mountOperator / ${counters.refresh} refresh()`,
  }
}

// ─── one restore turn, over the real client + the real controller ──────────────────────────────────────────────────

/** **THE CARET'S CORE — §4's `DisplayCaret` IS `CaretState` MINUS `ragId`**, and `restoreCaret`'s FS2 arm
 *  (`edit-controller.ts:276-279`) DROPS a `rich` caret whose `ragId` is not `page-edit-surface`: the restore's PRIMING must re-add
 *  the surface subject, and every comparison below is over the CORE (the family states the place, never the subject). */
const caretCore = (caret: unknown): string => {
  const record = (caret ?? {}) as AnyRecord
  return show({ kind: record['kind'], anchor: record['anchor'], focus: record['focus'], focused: record['focused'] })
}

const caretAt = (offset: number): AnyRecord => ({
  kind: 'rich',
  anchor: { path: [0, 0], offset },
  focus: { path: [0, 0], offset },
  focused: true,
})
const VIEW = { offset: 240, section: 'sec-3' }

interface Turn {
  readonly answer: unknown
  readonly dom: Dom
  readonly host: Host
  readonly saves: readonly { subjectId: unknown; caret: unknown }[]
  readonly portReads: () => number
  readonly controller: AnyRecord
  readonly deps: AnyRecord
}

interface TurnOptions {
  /** The held reading's entry for the tab (what the record says), or `null` for the `no-entry` arm. */
  readonly held?: AnyRecord | null
  /** What the tab's TARGET is — the stamp rule's decision, and the only document display authority (`ASM-B-2`). */
  readonly target?: AnyRecord
  /** Which documents are live in the host's store snapshot (`restoreCaret`'s own carrier). */
  readonly liveDocuments?: readonly string[]
  readonly shownDocumentId?: string
}

/** Fill the client, run ONE restore turn SYNCHRONOUSLY, and answer the readings — the shape every `(S5)` row reads. */
async function settledTurn(problems: string[], label: string, options: TurnOptions = {}, restoreOverride?: AnyFn): Promise<Turn | null> {
  const subject = stageDisplaySubject()
  if (restoreOverride === undefined && subject.problem !== null) {
    problems.push(`${label} · ${subject.problem}`)
    return null
  }
  const createClient = readFn(displayClientModule, 'createDisplayClient')
  const createController = readFn(editControllerModule, 'createEditController')
  if (createClient === null || createController === null) {
    problems.push(`${label} · \`createDisplayClient\`/\`createEditController\` do not both resolve on the LANDED renderer modules`)
    return null
  }
  const restore =
    restoreOverride ?? (typeof subject.values['restoreDisplayState'] === 'function' ? (subject.values['restoreDisplayState'] as AnyFn) : null)
  if (restore === null) {
    problems.push(`${label} · the region resolves no drivable \`restoreDisplayState\` — §6's restore has no body to drive`)
    return null
  }
  const target = options.target ?? { kind: 'document', documentId: DOC_A }
  const held = options.held === undefined ? { documentId: DOC_A, caret: caretAt(6), view: VIEW } : options.held
  const live = options.liveDocuments ?? [DOC_A, DOC_B]
  let portReads = 0
  const port: AnyRecord = {
    read: () => {
      portReads += 1
      return Promise.resolve(held === null ? {} : { [TAB]: held })
    },
    onChanged: () => (): void => undefined,
    write: () => Promise.resolve({ ok: true }),
  }
  const client = createClient(port) as AnyRecord
  const controller = createController({
    backRefs: new Map(),
    commit: () => Promise.resolve({ ok: true, nodeId: 'rag-a' }),
    onRebuild: () => undefined,
    pageSubjectDocument: (subjectId: string) => {
      const owner = target as AnyRecord
      return subjectId === TAB && owner['kind'] === 'document' ? String(owner['documentId']) : null
    },
    isDocumentLive: (documentId: string) => live.includes(documentId),
  }) as AnyRecord
  const saves: { subjectId: unknown; caret: unknown }[] = []
  const original = (controller.saveCaret as AnyFn).bind(controller)
  controller.saveCaret = (subjectId: unknown, caret: unknown): void => {
    saves.push({ subjectId, caret })
    original(subjectId, caret)
  }
  const dom = makeDom(options.shownDocumentId ?? DOC_B)
  const host = makeHost()
  const deps: AnyRecord = { client, editController: controller, document: dom.document, window: dom.window, host: host.handle }
  const owner = target as AnyRecord
  const entry = { id: TAB, target, title: owner['kind'] === 'document' ? String(owner['documentId']) : String(owner['kind']) }

  // THE HELD READING IS FILLED BEFORE THE TURN — the boot read is `fill()`, and §6's restore is synchronous off the held shape.
  await (client.fill as AnyFn)()
  host.reset()
  const readsBefore = portReads
  const answer = restore(deps, entry)
  // **ZERO AWAITS**: everything below is read in the SAME tick as the call, so a restore that awaited anything would be caught.
  const turn: Turn & { readsDuringTurn: number; thenable: boolean } = {
    answer,
    dom,
    host,
    saves,
    portReads: () => portReads,
    controller,
    deps,
    readsDuringTurn: portReads - readsBefore,
    thenable: answer !== null && typeof answer === 'object' && typeof (answer as AnyRecord)['then'] === 'function',
  }
  return turn
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S5·held)` — THE RESTORE OFF THE HELD READING (§6)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('stage-display-restore · arm (S5) — the restore, its drop arms and INV-E (§6, §7 (S5))', () => {
  it('(S5·held) · THE RESTORE APPLIES CARET + SCROLL OFF THE HELD READING WITH ZERO AWAITS AND ZERO PORT READS, AND PRIMES THE CONTROLLER (§6)', async () => {
    const problems: string[] = []
    const turn = await settledTurn(problems, '(S5·held)', { target: { kind: 'document', documentId: DOC_A }, shownDocumentId: DOC_A })
    if (turn !== null) {
      const carrier = turn as Turn & { readsDuringTurn: number; thenable: boolean }
      attempt(problems, '(S5·held)·zero-awaits', () =>
        carrier.thenable
          ? '§6: the restore answered a THENABLE — the read is SYNCHRONOUS off the held shape (no await, no poll, no second read), which is why the restore cannot race the store'
          : null,
      )
      attempt(problems, '(S5·held)·zero-port-reads', () =>
        carrier.readsDuringTurn === 0
          ? null
          : `the restore made ${carrier.readsDuringTurn} port read(s) — §6: \`client.displayOf(entry.id)\` costs the port NOTHING, and the ONE read is the boot \`fill()\``,
      )
      const answer = (turn.answer ?? {}) as AnyRecord
      attempt(problems, '(S5·held)·applied-arm', () => {
        const msgs: string[] = []
        if (answer['reason'] !== null) msgs.push(`the restore of a matching entry answered reason ${show(answer['reason'])} — §6's drop words are for DROPS; a matching entry applies`)
        if (answer['caretApplied'] !== true) msgs.push('the restore did not claim the caret it applied — §7 (S5) grades the claim against the DOM, and a restore that does not state what it applied cannot be told from one that applied nothing')
        if (answer['viewApplied'] !== true) msgs.push('the restore did not claim the scroll it applied')
        return msgs.length > 0 ? msgs.join('; ') : null
      })
      attempt(problems, '(S5·held)·caret-into-surface', () =>
        turn.dom.selection['anchorNode'] === turn.dom.text && turn.dom.selection['anchorOffset'] === 6
          ? null
          : `the selection reads ${show({ node: (turn.dom.selection['anchorNode'] as FakeNode | null)?.data ?? null, offset: turn.dom.selection['anchorOffset'] })} — §6: the caret goes into \`#page-edit-surface\`, its PATH re-resolved against the DOM and its offsets CLAMPED`,
      )
      attempt(problems, '(S5·held)·scroll-into-box', () => {
        const applied = turn.dom.scrollBox.scrollTop ?? 0
        if (applied === VIEW.offset) return null
        const max = (turn.dom.scrollBox.scrollHeight ?? 0) - (turn.dom.scrollBox.clientHeight ?? 0)
        return applied > 0 && applied <= max
          ? null
          : `\`#app [id="zone:main"]\`'s scrollTop reads ${show(turn.dom.scrollBox.scrollTop)} against the stored offset ${VIEW.offset} and the box's own maximum ${max} — §4/\`ASM-B10-2\`: the offset is the restore's ONLY number and it is CLAMPED on restore`
      })
      attempt(problems, '(S5·held)·primed', () => {
        const primed = turn.saves.filter((save) => save.subjectId === TAB)
        if (primed.length === 0) {
          return `the restore never called \`editController.saveCaret('${TAB}', …)\` — §6: it ALSO primes the controller, so the NEXT re-derive's own restore loop carries the same caret (\`sidebar-panes.ts\`'s \`reDerive\` is the fork's existing route and is untouched)`
        }
        const answered = (turn.controller.restoreCaret as AnyFn)(TAB)
        return caretCore(answered) === caretCore(primed[primed.length - 1]!.caret)
          ? null
          : `\`restoreCaret('${TAB}')\` answers ${show(answered)} while the restore primed ${show(primed[primed.length - 1]!.caret)} — the priming must be the entry's OWN caret`
      })
      attempt(problems, '(S5·held)·shown-document', () =>
        turn.dom.shown() === DOC_A
          ? null
          : `the stage shows ${show(turn.dom.shown())} after a matching restore — the restore applies a POSITION and never a document; the tab's target decides what is shown (ASM-B-2)`,
      )
    }

    expect(problems, '§6 — the restore applies caret + scroll off the held reading, with zero awaits and zero port reads (docs/L1/unit-b-10-stage-display-state.md §6)').toEqual([])
  })

  it('(S5·no-entry) · AN ABSENT ENTRY IS A DECLARED DROP — `reason: \'no-entry\'`, no caret, no scroll (§6)', async () => {
    const problems: string[] = []
    const turn = await settledTurn(problems, '(S5·no-entry)', { held: null })
    if (turn !== null) {
      const answer = (turn.answer ?? {}) as AnyRecord
      attempt(problems, '(S5·no-entry)·reason', () =>
        answer['reason'] === NO_ENTRY ? null : `the restore answered ${show(answer)} for a tab with NO record entry — §6: an absent entry is the DECLARED \`reason: '${NO_ENTRY}'\` drop, never an apply and never a throw`,
      )
      attempt(problems, '(S5·no-entry)·nothing-applied', () => {
        const msgs: string[] = []
        if (answer['caretApplied'] !== false) msgs.push('the drop still claimed a caret apply')
        if (answer['viewApplied'] !== false) msgs.push('the drop still claimed a scroll apply')
        if (turn.dom.selection['rangeCount'] !== 0) msgs.push(`the selection carries ${show(turn.dom.selection['rangeCount'])} range(s) — a drop applies NO caret`)
        if ((turn.dom.scrollBox.scrollTop ?? 0) !== 0) msgs.push(`the scroll box reads ${show(turn.dom.scrollBox.scrollTop)} — a drop applies NO scroll`)
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    expect(problems, '§6 — an absent entry is `no-entry` (docs/L1/unit-b-10-stage-display-state.md §6)').toEqual([])
  })

  it('(S5·stamp) · A STAMP MISMATCH IS A **DROP**: `doc-a`’s record under a `doc-b` tab ⇒ `doc-b` STILL SHOWN, no caret, no scroll, `reason: \'stamp-mismatch\'` (§3, §6)', async () => {
    const problems: string[] = []
    // THE CONTRACT'S OWN SCENARIO: the record names `doc-a`; the tab's TARGET is `doc-b`. The target decides what is shown, and
    // the stamp only IDENTIFIES — so the entry is dropped and NEVER redirects the shown document.
    const turn = await settledTurn(problems, '(S5·stamp)', {
      target: { kind: 'document', documentId: DOC_B },
      held: { documentId: DOC_A, caret: caretAt(5), view: VIEW },
      shownDocumentId: DOC_B,
    })
    if (turn !== null) {
      const answer = (turn.answer ?? {}) as AnyRecord
      attempt(problems, '(S5·stamp)·reason', () =>
        answer['reason'] === STAMP_MISMATCH
          ? null
          : `the restore answered ${show(answer)} for a record stamped \`${DOC_A}\` under a \`${DOC_B}\` tab — §3/§6: a mismatched stamp is the DECLARED \`reason: '${STAMP_MISMATCH}'\` DROP`,
      )
      attempt(problems, '(S5·stamp)·no-apply', () => {
        const msgs: string[] = []
        if (answer['caretApplied'] !== false) msgs.push('the drop claimed a caret apply — §3: a `false` is a DROP: no caret applied, no scroll applied')
        if (answer['viewApplied'] !== false) msgs.push('the drop claimed a scroll apply')
        if (turn.dom.selection['rangeCount'] !== 0) msgs.push(`the selection carries ${show(turn.dom.selection['rangeCount'])} range(s) after a stamp mismatch — no caret may be applied`)
        if ((turn.dom.scrollBox.scrollTop ?? 0) !== 0) msgs.push(`the scroll box reads ${show(turn.dom.scrollBox.scrollTop)} after a stamp mismatch — no scroll may be applied`)
        return msgs.length > 0 ? msgs.join('; ') : null
      })
      attempt(problems, '(S5·stamp)·never-redirects', () => {
        const shown = turn.dom.shown()
        if (shown === DOC_A) {
          return `THE STAMP REDIRECTED THE SHOWN DOCUMENT (\`${DOC_A}\` is shown under a \`${DOC_B}\` tab) — §3/ASM-B-2: the tab's TARGET decides which document is shown and the entry's \`documentId\` only IDENTIFIES it; a mismatched stamp NEVER redirects`
        }
        return shown === DOC_B ? null : `the stage shows ${show(shown)} where the tab's target is \`${DOC_B}\` — nothing but the target may decide the shown document`
      })
    }

    expect(problems, '§3/§6 — a stamp mismatch DROPS and never redirects (docs/L1/unit-b-10-stage-display-state.md §3, §6)').toEqual([])
  })

  it('(S5·deleted) · A DELETED DOCUMENT’S ENTRY IS DROPPED BY THE SAME ARM PLUS `restoreCaret`’S OWN LIVENESS CLEARING — no caret, no scroll, and a DECLARED drop word (§6, §7 (S5))', async () => {
    const problems: string[] = []
    // The TAB's target still says `doc-a` (the tab is open), but the document is GONE from the host's snapshot: `isDocumentLive`
    // says so, which is the carrier `edit-controller.ts:249-271` already owns and this unit does not touch.
    const turn = await settledTurn(problems, '(S5·deleted)', {
      target: { kind: 'document', documentId: DOC_A },
      held: { documentId: DOC_A, caret: caretAt(2), view: VIEW },
      liveDocuments: [DOC_B],
      shownDocumentId: DOC_A,
    })
    if (turn !== null) {
      const answer = (turn.answer ?? {}) as AnyRecord
      attempt(problems, '(S5·deleted)·declared-drop', () => {
        if (answer['reason'] === null) {
          return 'the restore of a DELETED document’s entry answered the APPLIED arm — §7 (S5): a deleted document is dropped, and a drop is declared'
        }
        if (answer['reason'] === NO_ENTRY) {
          return `the restore answered \`${NO_ENTRY}\` while the record DOES name an entry — §7 (S5) distinguishes this arm from the absent-entry one`
        }
        return null
      })
      attempt(problems, '(S5·deleted)·nothing-applied', () => {
        const msgs: string[] = []
        if (answer['caretApplied'] !== false) msgs.push('the deleted-document drop claimed a caret apply')
        if (turn.dom.selection['rangeCount'] !== 0) msgs.push(`the selection carries ${show(turn.dom.selection['rangeCount'])} range(s) — `)
        if ((turn.dom.scrollBox.scrollTop ?? 0) !== 0) msgs.push(`the scroll box reads ${show(turn.dom.scrollBox.scrollTop)} — a dropped entry applies no scroll`)
        const cleared = (turn.controller.restoreCaret as AnyFn)(TAB)
        if (cleared !== undefined) {
          msgs.push(
            `\`restoreCaret('${TAB}')\` answered ${show(cleared)} for a document the liveness carrier reports dead — \`edit-controller.ts:249-271\` CLEARS a caret whose document is gone, and the restore must not out-live it`,
          )
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    expect(problems, '§6/§7 (S5) — the deleted-document drop (docs/L1/unit-b-10-stage-display-state.md §6, §7 (S5))').toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S5·inv-e)` — `INV-E` ON THE RESTORE'S TURN, AND THE SIX MUTANTS RED FIRST (§6, §7 (S5))
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** **THE `INV-E` + CLAIM ORACLE — ONE function, SEVEN subjects** (the shipped region and the six mutants). It reads the
 *  three counters off the host handle the restore was handed, and it grades the restore's CLAIM against what the DOM and the
 *  controller actually show — which is what makes `m4` ("an apply it did not earn") and `m5` (the wrong subject) readable at
 *  all. §6's exclusion is stated at the call site and in this file's header: the SWITCH's own mount is not measured here. */
function invariantFindings(turn: Turn & { readsDuringTurn: number }, label: string, expectedCaret: AnyRecord | null): string[] {
  const findings: string[] = []
  const answer = (turn.answer ?? {}) as AnyRecord
  const counters = turn.host.counters
  if (counters.loadAppGraph !== 0 || counters.mountOperator !== 0 || counters.refresh !== 0) {
    findings.push(
      `${label} · \`INV-E\` IS VIOLATED ON THE RESTORE'S TURN: ${turn.host.report()} — §6: the calls attributable to \`restoreDisplayState(...)\` alone are 0 loadAppGraph / 0 mountOperator / 0 refresh(); the tab switch's own mount is the app's PRE-EXISTING single-active-render behaviour and is EXCLUDED BY NAME, not by this row`,
    )
  }
  const selectionHas = expectedCaret !== null && turn.dom.selection['anchorNode'] === turn.dom.text
  const selectionOffset = expectedCaret === null ? null : (expectedCaret['anchor'] as AnyRecord)['offset']
  // (m4) A CLAIM ITS OWN APPLY DID NOT EARN.
  if (answer['caretApplied'] === true && !(selectionHas && turn.dom.selection['anchorOffset'] === selectionOffset)) {
    findings.push(
      `${label} · the restore CLAIMS \`caretApplied: true\` while the surface's selection is ${show({
        node: (turn.dom.selection['anchorNode'] as FakeNode | null)?.data ?? null,
        offset: turn.dom.selection['anchorOffset'],
      })} — §7 (S5)'s \`m4\`: a restore that claims an apply it did not earn is caught by grading the CLAIM against the DOM, never by trusting either alone`,
    )
  }
  if (answer['viewApplied'] === true && (turn.dom.scrollBox.scrollTop ?? 0) === 0) {
    findings.push(`${label} · the restore CLAIMS \`viewApplied: true\` while \`#app [id="zone:main"]\`'s scrollTop is 0 — an unearned scroll claim`)
  }
  // (m5) THE WRONG SUBJECT: the priming must name the ACTIVATED tab, never another one.
  if (answer['reason'] === null) {
    const wrongSubjects = turn.saves.filter((save) => save.subjectId !== TAB).map((save) => show(save.subjectId))
    if (wrongSubjects.length > 0) {
      findings.push(
        `${label} · the restore PRIMED the caret under ${wrongSubjects.join(', ')} while the activated tab is \`${TAB}\` — §7 (S5)'s \`m5\`: \`editController.saveCaret(activeTabId, caret)\` names the ACTIVE tab, and a caret primed on another subject is restored into the wrong document on the next re-derive`,
      )
    }
    const answered = (turn.controller.restoreCaret as AnyFn)(TAB)
    if (expectedCaret !== null && caretCore(answered) !== caretCore(expectedCaret)) {
      findings.push(`${label} · \`restoreCaret('${TAB}')\` answers ${show(answered)} where the restore should have primed ${show(expectedCaret)} — the priming is the fork's OWN restore route and it must carry this entry's caret`)
    }
  }
  return findings
}

/** A FORGED region carrying §6's pinned names, with an arbitrary restore body — the mutants' whole subject. It is never
 *  compared with `renderer.ts`'s bytes and is never the subject of a green claim about the app. */
function forgedRegion(problems: string[], label: string, restoreBody: string, captureBody: string): RegionSubject | null {
  const region = `
export function captureStageDisplay(deps: any, entry: any, report: any, event: any): void {
  ${captureBody}
}

export function restoreDisplayState(deps: any, entry: any): any {
  ${restoreBody}
}
`
  const subject = driveRegion(region)
  if (subject.problem !== null) {
    problems.push(`${label} · ${subject.problem}`)
    return null
  }
  return subject
}

describe('stage-display-restore · arm (S5·inv-e) — INV-E on the restore’s turn, and the six mutants (§6, §7 (S5))', () => {
  it('(S5·inv-e) · THE SHIPPED RESTORE’S TURN REACHES NONE OF THE HOST’S THREE MEMBERS — 0 loadAppGraph / 0 mountOperator / 0 refresh(), and its claim is the one the DOM earns (§6)', async () => {
    const problems: string[] = []
    const turn = await settledTurn(problems, '(S5·inv-e)', { target: { kind: 'document', documentId: DOC_A }, shownDocumentId: DOC_A })
    if (turn !== null) {
      const carrier = turn as Turn & { readsDuringTurn: number }
      problems.push(...invariantFindings(carrier, '(S5·inv-e)', caretAt(6)))
      attempt(problems, '(S5·inv-e)·counters', () =>
        carrier.host.counters.loadAppGraph === 0 && carrier.host.counters.mountOperator === 0 && carrier.host.counters.refresh === 0
          ? null
          : `\`INV-E\` reads ${carrier.host.report()} on the restore's turn`,
      )
    }

    expect(
      problems,
      '§6 — INV-E measured on the restore’s own turn (docs/L1/unit-b-10-stage-display-state.md §6; the switch’s own mount is EXCLUDED BY NAME)',
    ).toEqual([])
  })

  it('(S5·mutants) · SIX MUTANTS, EACH MEASURED RED FIRST — `m1` refresh(), `m2` loadAppGraph, `m3` mountOperator, `m4` an unearned apply, `m5` the WRONG subject (§7 (S5))', async () => {
    const problems: string[] = []
    const baseCapture = 'void deps; void entry; void report; void event'

    /** Each mutant, with the arm of the oracle that must catch it. */
    const mutants: Array<{ id: string; body: string; compile: RegExp }> = [
      // m1 — §7 (S5): the restore replaced by `host.refresh()`.
      { id: 'm1', body: 'if (deps.host) deps.host.refresh(); return { reason: null, caretApplied: false, viewApplied: false }', compile: /refresh/ },
      // m2 — the restore replaced by `host.loadAppGraph(...)`.
      { id: 'm2', body: 'if (deps.host) deps.host.loadAppGraph(entry); return { reason: null, caretApplied: false, viewApplied: false }', compile: /loadAppGraph/ },
      // m3 — the restore replaced by `host.mountOperator()`.
      { id: 'm3', body: 'if (deps.host) deps.host.mountOperator(); return { reason: null, caretApplied: false, viewApplied: false }', compile: /mountOperator/ },
      // m4 — a restore CLAIMING an apply it did not earn.
      { id: 'm4', body: 'return { reason: null, caretApplied: true, viewApplied: true }', compile: /caretApplied/ },
      // m5 — a restore priming the caret under the WRONG subject (the picture's own alias).
      {
        id: 'm5',
        body:
          "if (deps.editController) deps.editController.saveCaret('tab-other', { kind: 'rich', anchor: { path: [0, 0], offset: 6 }, focus: { path: [0, 0], offset: 6 }, focused: true }); return { reason: null, caretApplied: false, viewApplied: false }",
        compile: /saveCaret/,
      },
    ]

    for (const mutant of mutants) {
      const subject = forgedRegion(problems, `(S5·${mutant.id})`, mutant.body, baseCapture)
      if (subject === null) continue
      const turn = await settledTurn(problems, `(S5·${mutant.id})`, { target: { kind: 'document', documentId: DOC_A }, shownDocumentId: DOC_A }, subject.values['restoreDisplayState'] as AnyFn)
      if (turn === null) continue
      attempt(problems, `(S5·${mutant.id})`, () => {
        const findings = invariantFindings(turn as Turn & { readsDuringTurn: number }, mutant.id, caretAt(6))
        if (findings.length === 0) {
          return `CONTROL FAILED: mutant \`${mutant.id}\` PASSED the oracle — §7 (S5) requires each mutant to be measured RED FIRST, or the shipped row's green is indistinguishable from an oracle that reads nothing`
        }
        return mutant.compile.test(findings.join(' ')) ? null : `CONTROL FAILED: the oracle reported [${findings.join('; ')}] for \`${mutant.id}\` without naming the fault`
      })
    }

    expect(problems, '§7 (S5) — the mutants m1…m5, each measured RED FIRST (docs/L1/unit-b-10-stage-display-state.md §7 (S5))').toEqual([])
  })

  it('(S5·m6) · `m6` THE CAPTURE REMOVED — the counters are STILL 0/0/0 and the pane looks fine, so the row that catches a dead capture grades the WRITTEN RECORD (0 writes / the entry absent), NEVER the paint (§7 (S5), D-40)', async () => {
    const problems: string[] = []
    // THE DEAD-CAPTURE REGION: the capture exists (so the seam is whole) and does NOTHING — no `saveCaret`, no write.
    const subject = forgedRegion(problems, '(S5·m6)', 'return { reason: "no-entry", caretApplied: false, viewApplied: false }', 'void deps; void entry; void report; void event')
    if (subject !== null) {
      const capture = subject.values['captureStageDisplay'] as AnyFn
      const crossing = buildCrossing(problems, '(S5·m6)·crossing')
      const built = controllerOver(problems, '(S5·m6)·controller')
      if (crossing !== null && built !== null) {
        const dom = makeDom(DOC_A)
        const host = makeHost()
        const client = (readFn(displayClientModule, 'createDisplayClient') as AnyFn)({
          read: () => (crossing.record.read as AnyFn).call(crossing.record),
          onChanged: () => (): void => undefined,
          write: (tabId: unknown, entry: unknown) => (crossing.record.commitTab as AnyFn)(tabId, entry),
        }) as AnyRecord
        // THE WRITE ROUTE FOR THIS CONTROL: §5's `client.write` member is graded by its own row
        // (`display-write-route` `(S6·client)`); here the record's own `commitTab` stands in so the live-capture half reaches a REAL
        // record — the arm measures "the record moves on a live capture", never the client member.
        if (typeof (client as AnyRecord)['write'] !== 'function') {
          ;(client as AnyRecord)['write'] = (tabId: unknown, entry: unknown) => (crossing.record.commitTab as AnyFn)(tabId, entry)
        }
        const deps: AnyRecord = { client, editController: built.controller, document: dom.document, window: dom.window, host: host.handle }
        host.reset()
        const writesBefore = crossing.writes()
        attempt(problems, '(S5·m6)·turn', () => {
          capture(deps, { id: TAB, target: { kind: 'document', documentId: DOC_A }, title: DOC_A }, { kind: 'caret', caret: caretAt(6) }, 'commit-on-blur')
          return null
        })
        await settle()

        // (1) **`INV-E` CANNOT SEE THIS, AND THAT IS THE ROW'S POINT**: the counters stay 0/0/0 and the pane is UNAFFECTED.
        attempt(problems, '(S5·m6)·inv-e-blind', () => {
          const blind = host.counters.loadAppGraph === 0 && host.counters.mountOperator === 0 && host.counters.refresh === 0
          return blind
            ? null
            : `CONTROL FAILED: the dead-capture turn moved the host counters (${host.report()}) — §7 (S5)'s \`m6\` states that \`INV-E\` stays 0/0/0 with the capture removed, which is exactly why \`INV-E\` is not the row that can catch it`
        })
        attempt(problems, '(S5·m6)·pane-looks-fine', () =>
          dom.shown() === DOC_A && dom.selection['rangeCount'] === 0
            ? null
            : `CONTROL FAILED: the dead-capture turn changed the pane (shown ${show(dom.shown())}, ranges ${show(dom.selection['rangeCount'])}) — \`m6\` states the pane LOOKS FINE, so the paint is not the oracle either`,
        )
        // (2) **THE ROW THAT DOES CATCH IT GRADES THE WRITTEN RECORD.**
        attempt(problems, '(S5·m6)·written-record', () => {
          const writes = crossing.writes() - writesBefore
          const stored = (crossing.record.readTab as AnyFn)(TAB)
          const msgs: string[] = []
          if (writes !== 0) msgs.push(`the dead capture produced ${writes} store write(s) — the mutant removed the capture, so the write count is 0`)
          if (stored !== null) msgs.push(`the record names \`${TAB}\` (${show(stored)}) after a capture that wrote nothing — the entry must be ABSENT`)
          if (msgs.length > 0) return `CONTROL FAILED: ${msgs.join('; ')} — the record-grading row cannot see the dead capture, so \`m6\` has no catcher`
          // AND THE SAME ORACLE INVERTS ON A LIVE CAPTURE: the reference capture DOES write, so a green here is a reading.
          return null
        })
        attempt(problems, '(S5·m6)·record-oracle-discriminates', () => {
          const liveSubject = forgedRegion(
            problems,
            '(S5·m6)·live',
            'return { reason: "no-entry", caretApplied: false, viewApplied: false }',
            "if (report !== null && report.kind === 'caret' && deps.editController) deps.editController.saveCaret(entry.id, report.caret); if (event !== null && typeof deps.client.write === 'function') void deps.client.write(entry.id, { documentId: entry.target.documentId, caret: report.caret })",
          )
          if (liveSubject === null) return null
          const before = crossing.writes()
          ;(liveSubject.values['captureStageDisplay'] as AnyFn)(
            deps,
            { id: TAB, target: { kind: 'document', documentId: DOC_A }, title: DOC_A },
            { kind: 'caret', caret: caretAt(6) },
            'commit-on-blur',
          )
          const writes = crossing.writes() - before
          const stored = (crossing.record.readTab as AnyFn)(TAB)
          return writes === 1 && stored !== null
            ? null
            : `CONTROL FAILED: a capture that DOES write produced ${writes} store write(s) and left the record at ${show(stored)} — the record-grading oracle must move on a live capture, or its \`0\` above proves nothing`
        })
      }
    }

    expect(
      problems,
      '§7 (S5)/D-40 — m6: the dead capture is caught by the WRITTEN RECORD, never by the counters and never by the paint (docs/L1/unit-b-10-stage-display-state.md §7 (S5))',
    ).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S7·echo)` — THE ECHO RULE: A PUSH NEVER RESTORES (§6)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface Crossing {
  readonly record: AnyRecord
  readonly delivery: AnyRecord
  readonly writes: () => number
  /** **THE PROFILE'S OWN PATH** — the rows that grade what the record holds read the `mkdtempSync` file's BYTES as well as
   *  `readTab`, because "the record says" and "the disk says" are two readings of one act (§1/§2). Added additively in the fix
   *  round; no existing row changes. */
  readonly filePath: string
}

/** One real crossing for the echo turn: a real store on a `/tmp` path, `B-1`'s delivery, the record over it. */
function buildCrossing(problems: string[], label: string): Crossing | null {
  const createProfileStore = readFn(storeroomModule, 'createProfileStore')
  const createDisplayDelivery = readFn(recordEngineModule, 'createDisplayDelivery')
  const createDisplayRecord = readFn(recordEngineModule, 'createDisplayRecord')
  const displayConstraintDeclarations = readFn(recordEngineModule, 'displayConstraintDeclarations')
  if (createProfileStore === null || createDisplayDelivery === null || createDisplayRecord === null || displayConstraintDeclarations === null) {
    problems.push(`${label} · \`createProfileStore\`/\`createDisplayDelivery\`/\`createDisplayRecord\`/\`displayConstraintDeclarations\` do not all resolve — the echo turn has no crossing`)
    return null
  }
  try {
    const delivery = createDisplayDelivery(() => undefined) as AnyRecord
    let holder: unknown = null
    const filePath = newProfilePath(label.replace(/[^A-Za-z0-9-]/g, '-'))
    const store = createProfileStore({
      filePath,
      listeners: [...((delivery.entries as unknown[]) ?? [])],
      constraints: [...((displayConstraintDeclarations(() => holder) as unknown[]) ?? [])],
    }) as AnyRecord
    holder = store
    let writes = 0
    const counted: AnyRecord = {
      ...store,
      read: (...args: unknown[]) => (store.read as AnyFn).apply(store, args),
      write: (...args: unknown[]) => {
        writes += 1
        return (store.write as AnyFn).apply(store, args)
      },
    }
    const record = createDisplayRecord({ store: counted, delivery }) as AnyRecord
    return { record, delivery, writes: () => writes, filePath }
  } catch (thrown) {
    problems.push(`${label} · the ONE construction THREW (${msgOf(thrown)}) — reported, never worked around`)
    return null
  }
}

/** A real `EditController` with the page-subject carriers supplied. */
function controllerOver(problems: string[], label: string): { controller: AnyRecord; saves: () => number } | null {
  const createController = readFn(editControllerModule, 'createEditController')
  if (createController === null) {
    problems.push(`${label} · \`createEditController\` does not resolve on the LANDED \`src/renderer/edit-controller.js\``)
    return null
  }
  const controller = createController({
    backRefs: new Map(),
    commit: () => Promise.resolve({ ok: true, nodeId: 'rag-a' }),
    onRebuild: () => undefined,
    pageSubjectDocument: (subjectId: string) => (subjectId === TAB ? DOC_A : null),
    isDocumentLive: (documentId: string) => documentId === DOC_A,
  }) as AnyRecord
  let saves = 0
  const original = (controller.saveCaret as AnyFn).bind(controller)
  controller.saveCaret = (subjectId: unknown, caret: unknown): void => {
    saves += 1
    original(subjectId, caret)
  }
  return { controller, saves: () => saves }
}

/** **THE ECHO ORACLE** — what a push turn must leave alone, and what a push-driven restore would move. */
function echoFindings(observation: { restores: number; selectionOffset: number | null; liveOffset: number; held: unknown; entry: unknown }, label: string): string[] {
  const findings: string[] = []
  if (observation.restores !== 0) {
    findings.push(`${label} · ${observation.restores} RESTORE(S) were driven by the push — §6's echo rule: the record arm's handler is a PUSH, it re-reads and repaints NOTHING; a restore writes our own capture back and would move a live caret under the user's hands the instant it saved`)
  }
  if (observation.selectionOffset !== observation.liveOffset) {
    findings.push(
      `${label} · the LIVE selection moved from offset ${observation.liveOffset} to ${show(observation.selectionOffset)} across a push — §6: only a tab ACTIVATION restores, so a push may not move the caret the operator is holding`,
    )
  }
  if (observation.held === null || (observation.held as AnyRecord)[TAB] === undefined) {
    findings.push(`${label} · the client's held reading ${show(observation.held)} does not carry \`${TAB}\` after the push — the push's ONE correct answer is a fresh READ, and the re-read replaces the shape`)
  }
  return findings
}

describe('stage-display-restore · arm (S7) — the echo rule (§6)', () => {
  it('(S7·echo) · A WRITE ⇒ PUSH ⇒ RE-READ WITH A LIVE SELECTION ⇒ 0 RESTORES, and the held reading is REPLACED; the falsifier — a restore wired to the push — reds the same oracle (§6)', async () => {
    const problems: string[] = []
    const crossing = buildCrossing(problems, '(S7·echo)')
    const createClient = readFn(displayClientModule, 'createDisplayClient')
    if (crossing !== null && createClient !== null) {
      const dom = makeDom(DOC_A)
      // THE LIVE SELECTION: the operator is holding a caret in the surface (offset 3) while the record is about to move.
      dom.selection.collapse(dom.text, 3)
      const restores: number[] = []
      let turns = 0
      const client = createClient({
        read: () => (crossing.record.read as AnyFn).call(crossing.record),
        onChanged: (handler: () => void) => (crossing.delivery.subscribe as AnyFn).call(crossing.delivery, handler),
        write: (tabId: unknown, entry: unknown) => (crossing.record.commitTab as AnyFn)(tabId, entry),
      }) as AnyRecord
      const subscription = (client.subscribe as AnyFn)((reading: unknown) => {
        turns += 1
        // **THE RENDERER ARM'S SHAPE, AND THE WHOLE OF §6'S ECHO RULE**: a push re-reads and delivers; it NEVER restores.
        void reading
      }) as AnyRecord
      if (subscription['subscribed'] !== true) {
        problems.push(`(S7·echo) · the client refused a port with both routes (reason ${show(subscription['reason'])}) — the echo turn has no subject`)
      }
      await (client.fill as AnyFn)()

      const answer = (crossing.record.commitTab as AnyFn)(TAB, { documentId: DOC_A, caret: caretAt(8), view: VIEW }) as AnyRecord
      if (answer['ok'] !== true) problems.push(`(S7·echo) · the write that must push was REFUSED (${show(answer)})`)
      await settle()

      attempt(problems, '(S7·echo)·clean', () => {
        if (turns !== 1) return `one write produced ${turns} re-read turn(s) — §6/§5(a): the push's only correct answer is ONE fresh read`
        const observations = {
          restores: 0,
          restoresList: restores.slice(),
          selectionOffset: typeof dom.selection['anchorOffset'] === 'number' ? (dom.selection['anchorOffset'] as number) : null,
          liveOffset: 3,
          held: (client.reading as AnyFn)(),
          entry: (crossing.record.readTab as AnyFn)(TAB),
        }
        const findings = echoFindings({ ...observations, restores: observations.restoresList.length }, '(S7·echo)')
        if (findings.length > 0) return findings.join('; ')
        const held = observations.held as AnyRecord | null
        return held !== null && show(held[TAB]) === show(observations.entry)
          ? null
          : `the client holds ${show(held?.[TAB])} for \`${TAB}\` while the record answers ${show(observations.entry)} — the push's re-read REPLACES the held shape with the store's own answer`
      })

      // ── THE FALSIFIER: a handler WIRED TO THE PUSH that restores — the one hazard §6 creates. The SAME oracle must red it.
      // (GREEN ON ARRIVAL BY DESIGN: a control. The shipped arm's own evidence is the `(S7·echo)` source oracle below.)
      attempt(problems, '(S7·echo)·falsifier', () => {
        dom.selection.collapse(dom.text, 3)
        const localRestores: number[] = []
        const forgedHandler = (): void => {
          // the fault: a push-driven restore moves the live caret to the RECORD's caret
          localRestores.push(1)
          dom.selection.collapse(dom.text, 8)
        }
        forgedHandler()
        const findings = echoFindings(
          {
            restores: localRestores.length,
            selectionOffset: dom.selection['anchorOffset'] as number,
            liveOffset: 3,
            held: { [TAB]: { documentId: DOC_A } },
            entry: { documentId: DOC_A },
          },
          '(S7·echo·falsifier)',
        )
        if (findings.length === 0) {
          return 'CONTROL FAILED: a restore wired to the push left the oracle CLEAN — §6: a restore writes our own capture back, and a row that cannot see it is not a row about the echo rule'
        }
        return /RESTORE|selection moved/.test(findings.join(' ')) ? null : `CONTROL FAILED: the oracle reported [${findings.join('; ')}] without naming the restore or the moved caret`
      })
    }

    // ── AND THE SHIPPED ARM ITSELF, READ AS BYTES: the ONE `installDisplayCrossing(...)` call's handler body must reference
    // neither the restore nor the capture (§6: the record arm's handler is a push, and it repaints nothing).
    attempt(problems, '(S7·echo)·shipped-arm-bytes', () => {
      const raw = readPath(RENDERER_PATH)
      const at = raw.indexOf('installDisplayCrossing(')
      if (at < 0) return '`installDisplayCrossing(` does not resolve in `src/renderer/renderer.ts` — the record arm has no site to read'
      const open = raw.indexOf('(', at + 'installDisplayCrossing'.length)
      let depth = 0
      let close = -1
      for (let i = open; i < raw.length; i += 1) {
        const char = raw[i] as string
        if (char === '(' || char === '{' || char === '[') depth += 1
        else if (char === ')' || char === '}' || char === ']') {
          depth -= 1
          if (depth === 0) {
            close = i
            break
          }
        }
      }
      if (close < 0) return 'the `installDisplayCrossing(` call never closes — its handler body cannot be read'
      const call = raw.slice(open, close + 1)
      const msgs: string[] = []
      for (const needle of ['restoreDisplayState', 'captureStageDisplay']) {
        if (call.includes(needle)) {
          msgs.push(
            `the ONE \`installDisplayCrossing(...)\` call references \`${needle}\` — §6's ECHO RULE: the record arm's handler is a PUSH; it re-reads and repaints nothing, and a restore or a capture wired to it would write our own capture back on every save`,
          )
        }
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(problems, '§6 — the echo rule: a push never restores (docs/L1/unit-b-10-stage-display-state.md §6)').toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S5·boot)` — THE BOOT/RESTART ARM OVER THE REAL `TabStrip` (§6, §7 `(S5)`)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
//
// **WHAT THIS ROW GRADES** (`docs/L1/unit-b-10-stage-display-state.md` §6, §7 `(S5)`): *a restart's boot restores the
// last-displayed state from the persisted record.* The subject is the REAL `TabStrip` (`src/renderer/tab-strip.ts`) driven
// through its own boot calls — `load(persisted)` then `ensure()` — over the layout-less shim (`installShim()` + a `mount`), with
// `onActiveChange` wired EXACTLY as `renderer.ts` wires it: (1) capture the OUTGOING tab under `tab-switch`, (2) the app's own
// mount (omitted here BY NAME: this row's subject is the restore, and the mount's graph load is the app's pre-existing
// behaviour), (3) the SHIPPED `restoreDisplayState`. The entry it restores is read off a REAL record over a `mkdtempSync` store
// (the record's own bytes, not a fixture's opinion).
//
// **THE MEASURED CADENCE, AND WHY IT IS A CLAIM AT ALL:** `TabStrip.load()` commits once and `ensure()` commits again, and
// `commit()` fires `onActiveChange` on EVERY commit — so one persisted tab produces **EXACTLY TWO** fires at boot (measured on
// the landed strip; the row counts them rather than assuming one). Both fires must restore the SAME state (idempotent) and both
// must answer the applied arm; a boot that restored nothing, or one that restored a DIFFERENT position on the second fire, is
// the restart hazard this row exists for.
//
// **THE FALSIFIER, AND WHY THE GREEN ABOVE IS NOT THE DOUBLE'S DEFAULT:** the same boot with the record's entry ABSENT answers
// `reason: 'no-entry'`, applies NOTHING (`rangeCount === 0`, `scrollTop === 0`) — so the DOM double's initial state is provably
// not what produces the green reading.

/** The stage surface's authored id, spelled because the restore reads it (`runtime.ts`'s `PAGE_EDIT_SURFACE_ID`). */
const PAGE_SURFACE = 'page-edit-surface'

/** §3's SECOND tab — the one the click ACTIVATES while an outgoing tab's settle is still in flight (`B10-EX-02`). */
const TAB_B = 'tab-b'

interface BootReading {
  readonly fires: number
  readonly answers: AnyRecord[]
  readonly dom: Dom
  readonly controller: AnyRecord
  readonly strip: AnyRecord
}

/** **ONE BOOT TURN** — the real strip, the real record, the app's own activation closure, and the shipped restore. */
async function bootTurn(
  problems: string[],
  label: string,
  options: { readonly entry: AnyRecord | null },
): Promise<BootReading | null> {
  const subject = stageDisplaySubject()
  if (subject.problem !== null) {
    problems.push(`${label} · ${subject.problem}`)
    return null
  }
  const capture = typeof subject.values['captureStageDisplay'] === 'function' ? (subject.values['captureStageDisplay'] as AnyFn) : null
  const restore = typeof subject.values['restoreDisplayState'] === 'function' ? (subject.values['restoreDisplayState'] as AnyFn) : null
  if (capture === null || restore === null) {
    problems.push(`${label} · the region resolves no drivable \`captureStageDisplay\`/\`restoreDisplayState\` — the boot's own activation has no arms`)
    return null
  }
  const crossing = buildCrossing(problems, `${label}·crossing`)
  const built = controllerOver(problems, `${label}·controller`)
  const createClient = readFn(displayClientModule, 'createDisplayClient')
  if (createClient === null) problems.push(`${label} · \`createDisplayClient\` does not resolve — the boot's client is missing`)
  if (crossing === null || built === null || createClient === null) return null
  if (options.entry !== null) {
    const answer = (crossing.record.commitTab as AnyFn)(TAB, options.entry) as AnyRecord
    if (answer === null || answer['ok'] !== true) {
      problems.push(`${label} · the record REFUSED the persisted entry (${show(answer)}) — the boot has no state to restore`)
      return null
    }
  }
  const client = createClient({
    read: () => (crossing.record.read as AnyFn).call(crossing.record),
    onChanged: (handler: () => void) => (crossing.delivery.subscribe as AnyFn).call(crossing.delivery, handler),
    write: (tabId: unknown, entry: unknown) => (crossing.record.commitTab as AnyFn)(tabId, entry),
  }) as AnyRecord
  const subscription = (client.subscribe as AnyFn)(() => undefined) as AnyRecord
  if (subscription['subscribed'] !== true) {
    problems.push(`${label} · the client refused its ONE subscription (reason ${show(subscription['reason'])}) — the boot's held shape would never move`)
    return null
  }
  await (client.fill as AnyFn)()
  // §6's boot over the LAYOUT-LESS SHIM: the strip renders through `document.createElement`, so the shim is installed HERE.
  installShim()
  const mount = mountEl()
  const dom = makeDom(DOC_A)
  const host = makeHost()
  const deps: AnyRecord = { client, editController: built.controller, document: dom.document, window: dom.window, host: host.handle }
  let lastTab: AnyRecord | null = null
  let fires = 0
  const answers: AnyRecord[] = []
  const strip = new TabStrip({
    mount: mount as never,
    getContext: () => ({ hasStore: true, documents: [{ documentId: DOC_A, title: 'doc-a' }] }),
    persist: () => undefined,
    // **`renderer.ts`'s CLOSURE, STEP FOR STEP** — and the step that is NOT here is named in this arm's header (the mount).
    onActiveChange: (entry) => {
      fires += 1
      const outgoing = lastTab
      lastTab = entry
      if (outgoing !== null) capture(deps, outgoing, null, 'tab-switch')
      answers.push(restore(deps, entry) as AnyRecord)
    },
  })
  const persisted = {
    version: TAB_STATE_VERSION,
    open: [{ id: TAB, target: { kind: 'document', documentId: DOC_A }, title: 'doc-a' }],
    activeId: TAB,
    order: [TAB],
  }
  strip.load(persisted)
  strip.ensure()
  await settle()
  return { fires, answers, dom, controller: built.controller, strip: strip as never }
}

describe('stage-display-restore · arm (S5·boot) — the boot/restart restores the persisted record’s state (§6, §7 (S5))', () => {
  it('(S5·boot) · `tabStrip.load(persisted)` THEN `tabStrip.ensure()` — EXACTLY TWO `onActiveChange` FIRES, and BOTH restore the record’s caret + view and prime the controller; with the entry ABSENT the same boot answers `no-entry` and applies NOTHING (§6, §7 (S5))', async () => {
    const problems: string[] = []
    const entry = { documentId: DOC_A, caret: caretAt(6), view: VIEW }
    const turn = await bootTurn(problems, '(S5·boot)', { entry })
    if (turn !== null) {
      attempt(problems, '(S5·boot)·cadence', () =>
        turn.fires === 2
          ? null
          : `one persisted tab produced ${turn.fires} \`onActiveChange\` fire(s) at boot — \`TabStrip.load()\` commits once and \`ensure()\` commits again, and \`commit()\` fires the activation on EVERY commit, so the measured cadence is EXACTLY TWO (a third fire would be a second mount path, one would be a boot that never reached the strip)`,
      )
      attempt(problems, '(S5·boot)·caret-into-surface', () =>
        turn.dom.selection['anchorNode'] === turn.dom.text && turn.dom.selection['anchorOffset'] === 6
          ? null
          : `after the boot the selection reads ${show({ node: (turn.dom.selection['anchorNode'] as FakeNode | null)?.data ?? null, offset: turn.dom.selection['anchorOffset'] })} — §6: the boot's restore puts the persisted entry's caret into \`#page-edit-surface\`, its PATH re-resolved and its offsets CLAMPED`,
      )
      attempt(problems, '(S5·boot)·scroll-into-box', () => {
        const applied = turn.dom.scrollBox.scrollTop ?? 0
        if (applied === VIEW.offset) return null
        const max = (turn.dom.scrollBox.scrollHeight ?? 0) - (turn.dom.scrollBox.clientHeight ?? 0)
        return applied > 0 && applied <= max
          ? null
          : `\`#app [id="zone:main"]\`'s scrollTop reads ${show(turn.dom.scrollBox.scrollTop)} against the persisted offset ${VIEW.offset} and the box's own maximum ${max} — §4/\`ASM-B10-2\`: the offset is the restore's ONLY number and it is CLAMPED`
      })
      attempt(problems, '(S5·boot)·claim', () => {
        const msgs: string[] = []
        for (const [at, answer] of turn.answers.entries()) {
          if (answer['reason'] !== null) msgs.push(`fire ${at + 1} answered reason ${show(answer['reason'])} — §6: a matching persisted entry applies`)
          if (answer['caretApplied'] !== true) msgs.push(`fire ${at + 1} did not claim the caret it applied`)
          if (answer['viewApplied'] !== true) msgs.push(`fire ${at + 1} did not claim the scroll it applied`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
      attempt(problems, '(S5·boot)·primed', () => {
        // COMPARED MEMBER BY MEMBER AND NOT BY `show()`: the store's own answer re-orders an edge's keys, and this row's subject
        // is the PRIMING (does the controller carry THIS caret), never a serialisation's member order.
        const answered = ((turn.controller.restoreCaret as AnyFn)(TAB) ?? null) as AnyRecord | null
        const anchor = (answered?.['anchor'] ?? {}) as AnyRecord
        const focus = (answered?.['focus'] ?? {}) as AnyRecord
        const primed =
          answered !== null &&
          answered['kind'] === 'rich' &&
          answered['focused'] === true &&
          show(anchor['path']) === show([0, 0]) &&
          anchor['offset'] === 6 &&
          show(focus['path']) === show([0, 0]) &&
          focus['offset'] === 6
        return primed
          ? null
          : `\`restoreCaret('${TAB}')\` answers ${show(answered)} after the boot while the persisted entry's caret is ${show(entry.caret)} — §6: the restore PRIMES the controller so the NEXT re-derive's own restore loop carries the same caret`
      })
      attempt(problems, '(S5·boot)·idempotent', () => {
        if (turn.answers.length !== 2) return `the boot produced ${turn.answers.length} answer(s) — the idempotence reading needs the TWO fires`
        return show(turn.answers[0]) === show(turn.answers[1])
          ? null
          : `the two boot fires answered ${show(turn.answers[0])} and then ${show(turn.answers[1])} — §6: a restart's boot restores the LAST-DISPLAYED state, so the second fire (the strip's own second commit) must answer the same state as the first`
      })
    }

    // ── THE FALSIFIER: the record's entry ABSENT ⇒ the same boot answers `no-entry` and applies nothing. Without it the green
    // above would be indistinguishable from a DOM double whose defaults happen to look restored.
    const bare = await bootTurn(problems, '(S5·boot·absent)', { entry: null })
    if (bare !== null) {
      attempt(problems, '(S5·boot·absent)·reason', () => {
        const reasons = bare.answers.map((answer) => answer['reason'])
        return reasons.every((reason) => reason === NO_ENTRY)
          ? null
          : `the same boot with NO record entry answered ${show(reasons)} — §6: an absent entry is the DECLARED \`reason: '${NO_ENTRY}'\` drop on every fire`
      })
      attempt(problems, '(S5·boot·absent)·nothing-applied', () => {
        const msgs: string[] = []
        for (const [at, answer] of bare.answers.entries()) {
          if (answer['caretApplied'] !== false) msgs.push(`fire ${at + 1} claimed a caret apply`)
          if (answer['viewApplied'] !== false) msgs.push(`fire ${at + 1} claimed a scroll apply`)
        }
        if (bare.dom.selection['rangeCount'] !== 0) msgs.push(`the selection carries ${show(bare.dom.selection['rangeCount'])} range(s)`)
        if ((bare.dom.scrollBox.scrollTop ?? 0) !== 0) msgs.push(`the scroll box reads ${show(bare.dom.scrollBox.scrollTop)}`)
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    expect(
      problems,
      '§6/§7 (S5) — the boot/restart arm over the REAL `TabStrip`: two fires, both restoring the persisted entry (docs/L1/unit-b-10-stage-display-state.md §6, §7 (S5))',
    ).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S4·subject)` — A SETTLE BELONGS TO THE TAB IT WAS READ FROM (§4, §2; `B10-EX-02`)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
//
// **WHAT THIS ROW GRADES** (`docs/L1/unit-b-10-stage-display-state.md` §4's `observeDisplayState` report, §2's `subject`
// adjudication, §7): *the report's `subject` decides WHICH TAB; the active tab at the settle does not.* The measured fault
// (`B10-EX-02`) is a real one: a blur on **tab-a's** DOM whose settle landed **50 ms after the click's activation** (tab-b had
// already become the strip's active tab) was written as **tab-b's** entry — `{documentId:'doc-b', caret:{offset:7}}` — i.e. one
// tab's caret landed in another tab's address, and tab-a's own state was never written.
//
// Both limbs are in this row because they grade the SAME decision at two grains: **(c1) the shipped region's route**
// (`stageDisplayCaptureRoute`, a declared value of the extracted region) — the subject decides the tab, a subject-less report
// falls back to the active tab, a subject naming NO open tab answers `tab: null` (and the capture then writes NOTHING), a view is
// `scroll-settle`, and a focused caret report is the MOVE (`event: null`); **(c2) end to end** — the route's tab and a real
// record over `/tmp`: the write lands at `['display','tab-a']` carrying `doc-a`, and **tab-b has no entry**. The falsifier drives
// the MEASURED fault shape (route by the settle-time active tab) through the same oracle and requires it to red, naming the wrong
// address/stamp.

interface SubjectReading {
  readonly writes: number
  readonly stored: unknown
  readonly otherStored: unknown
  readonly fileText: string
  readonly tabId: string
}

/** **THE ORACLE — ONE function, TWO subjects** (the routed capture and the measured fault's shape). */
function subjectFindings(reading: SubjectReading, label: string): string[] {
  const findings: string[] = []
  const otherTab = reading.tabId === TAB ? TAB_B : TAB
  const expectedDocument = reading.tabId === TAB ? DOC_A : DOC_B
  if (reading.writes !== 1) {
    findings.push(`${label} · the blur produced ${reading.writes} store write(s) — §2 pins EXACTLY ONE whole-entry write for one \`commit-on-blur\``)
  }
  const stored = reading.stored as AnyRecord | null
  if (stored === null || typeof stored !== 'object') {
    findings.push(`${label} · \`readTab('${reading.tabId}')\` answers ${show(stored)} — §4: the report's subject was stamped when the DOM event FIRED, so the write belongs to the tab it was READ FROM, and that tab now has no entry`)
  } else {
    if (stored['documentId'] !== expectedDocument) {
      findings.push(
        `${label} · \`readTab('${reading.tabId}')\` carries stamp ${show(stored['documentId'])} where that tab's TARGET is \`${expectedDocument}\` — §3: the target decides the document and the entry only IDENTIFIES it; a stamp from the OTHER tab is the measured fault arriving as a value`,
      )
    }
    const caret = stored['caret'] as AnyRecord | null | undefined
    const anchorOffset = caret === null || caret === undefined ? undefined : (caret['anchor'] as AnyRecord | undefined)?.['offset']
    if (anchorOffset !== 7) {
      findings.push(`${label} · \`readTab('${reading.tabId}')\` carries caret offset ${show(anchorOffset)} where the blur stated 7 — §2: the blur's write carries the caret it settled at`)
    }
  }
  if (reading.otherStored !== null) {
    findings.push(
      `${label} · \`readTab('${otherTab}')\` answers ${show(reading.otherStored)} — §4: the settle belongs to the tab it was READ FROM, so the OTHER tab must have NO entry; a blur on tab-a's DOM written as tab-b's entry is exactly \`B10-EX-02\``,
    )
  }
  let parsed: unknown = null
  try {
    parsed = JSON.parse(reading.fileText)
  } catch {
    findings.push(`${label} · the profile's bytes are not parseable JSON — the record on disk is the second reading of the same act`)
  }
  if (parsed !== null) {
    const family = ((parsed as AnyRecord)['display'] ?? {}) as AnyRecord
    const keys = Object.keys(family)
    if (!keys.includes(reading.tabId)) {
      findings.push(`${label} · the profile's bytes carry no entry at ['display','${reading.tabId}'] (keys: [${keys.join(', ')}]) — the write this row grades never reached the file`)
    }
    if (keys.includes(otherTab)) {
      findings.push(`${label} · the profile's bytes carry an entry for \`${otherTab}\` — §4's subject rule is broken on DISK, not merely in the reading`)
    }
  }
  return findings
}

/** A real controller whose page-subject hook is the HOST's: only the ACTIVE tab resolves to a document (so the outgoing tab's
 *  caret slot cannot be read through `restoreCaret` — the live shape the carried-caret row states in full). */
function controllerWithActive(problems: string[], label: string, activeTabId: string): AnyRecord | null {
  const createController = readFn(editControllerModule, 'createEditController')
  if (createController === null) {
    problems.push(`${label} · \`createEditController\` does not resolve on the LANDED \`src/renderer/edit-controller.js\``)
    return null
  }
  const documents: Record<string, string> = { [TAB]: DOC_A, [TAB_B]: DOC_B }
  return createController({
    backRefs: new Map(),
    commit: () => Promise.resolve({ ok: true, nodeId: 'rag-a' }),
    onRebuild: () => undefined,
    pageSubjectDocument: (subjectId: string) => (subjectId === activeTabId ? (documents[subjectId] ?? null) : null),
    isDocumentLive: (documentId: string) => documentId === DOC_A || documentId === DOC_B,
  }) as AnyRecord
}

describe('stage-display-restore · arm (S4·subject) — a settle belongs to the tab it was READ FROM (§4, §2; B10-EX-02)', () => {
  it('(S4·subject) · THE SHIPPED ROUTE RESOLVES THE STAMPED SUBJECT (not the settle-time active tab), AND THE CAPTURE WRITES AT [\'display\',\'tab-a\'] CARRYING doc-a — tab-b stays untouched; the measured fault shape reds the same oracle (§4, §2; B10-EX-02)', async () => {
    const problems: string[] = []
    const subject = stageDisplaySubject()
    if (subject.problem !== null) {
      problems.push(`(S4·subject) · ${subject.problem}`)
    } else {
      const route = typeof subject.values['stageDisplayCaptureRoute'] === 'function' ? (subject.values['stageDisplayCaptureRoute'] as AnyFn) : null
      const capture = typeof subject.values['captureStageDisplay'] === 'function' ? (subject.values['captureStageDisplay'] as AnyFn) : null
      if (route === null) {
        problems.push(
          '(S4·subject) · the region declares no drivable `stageDisplayCaptureRoute` — §4 makes the SUBJECT the member that decides which tab a report is about, and without that decision the wiring can only ask "who is active now?", which is the measured fault `B10-EX-02`',
        )
      } else if (capture === null) {
        problems.push('(S4·subject) · the region resolves no drivable `captureStageDisplay` — the write half of this row has no arm')
      } else {
        const tabAEntry = { id: TAB, target: { kind: 'document', documentId: DOC_A }, title: 'doc-a' }
        const tabBEntry = { id: TAB_B, target: { kind: 'document', documentId: DOC_B }, title: 'doc-b' }
        const open = [tabAEntry, tabBEntry]
        const blurReport = { kind: 'caret', caret: caretAt(7), blur: true, subject: TAB }

        // ── (c1) THE REGION'S ROUTE ─────────────────────────────────────────────────────────────────────────────────────
        attempt(problems, '(S4·subject)·route', () => {
          const answer = route(blurReport, tabBEntry, open) as AnyRecord
          const msgs: string[] = []
          if (answer['tab'] !== tabAEntry) msgs.push(`the route answered tab ${show((answer['tab'] as AnyRecord | null)?.['id'])} while the report's subject names \`${TAB}\` — §4: the SUBJECT decides the tab, and the settle-time active tab (\`tab-b\`) is the wrong authority`)
          if (answer['subject'] !== TAB) msgs.push(`the route answered subject ${show(answer['subject'])} where the report was stamped \`${TAB}\``)
          if (answer['event'] !== 'commit-on-blur') msgs.push(`the route answered event ${show(answer['event'])} for a blur report — §4/\`B10-EX-04\`: a blur is the \`commit-on-blur\` trigger`)
          return msgs.length > 0 ? msgs.join('; ') : null
        })

        attempt(problems, '(S4·subject)·route-fallback', () => {
          const answer = route({ ...blurReport, subject: null }, tabBEntry, open) as AnyRecord
          const msgs: string[] = []
          if (answer['tab'] !== tabBEntry) msgs.push(`a report with NO subject answered tab ${show((answer['tab'] as AnyRecord | null)?.['id'])} — §4: the declared absence falls back to the ACTIVE tab`)
          if (answer['subject'] !== TAB_B) msgs.push(`a report with no subject answered subject ${show(answer['subject'])} — the fallback's own key is the active tab's id`)
          if (answer['event'] !== 'commit-on-blur') msgs.push(`the fallback arm answered event ${show(answer['event'])} for a blur report`)
          return msgs.length > 0 ? msgs.join('; ') : null
        })

        attempt(problems, '(S4·subject)·route-events', () => {
          const msgs: string[] = []
          const view = route({ kind: 'view', view: { offset: 12, section: 's-1' }, subject: TAB }, tabBEntry, open) as AnyRecord
          if (view['event'] !== 'scroll-settle') msgs.push(`a view report answered event ${show(view['event'])} — §4: a view IS the scroll's settle`)
          if (view['tab'] !== tabAEntry) msgs.push(`a view report answered tab ${show((view['tab'] as AnyRecord | null)?.['id'])} — the subject decides the tab for a view too`)
          const move = route({ kind: 'caret', caret: caretAt(7), blur: false, subject: TAB }, tabBEntry, open) as AnyRecord
          if (move['event'] !== null) msgs.push(`a FOCUSED caret report answered event ${show(move['event'])} — §2: the caret MOVE writes nothing and is the \`null\` arm`)
          return msgs.length > 0 ? msgs.join('; ') : null
        })

        // A SUBJECT THAT NAMES NO OPEN TAB: the route answers `tab: null`, and the SHIPPED CAPTURE then writes NOTHING.
        const ghostAnswered = (() => {
          try {
            return route({ ...blurReport, subject: 'tab-ghost' }, tabBEntry, open) as AnyRecord
          } catch (thrown) {
            return { thrown: msgOf(thrown) } as AnyRecord
          }
        })()
        attempt(problems, '(S4·subject)·route-ghost', () =>
          ghostAnswered['tab'] === null
            ? null
            : `a report whose subject names NO open tab answered tab ${show((ghostAnswered['tab'] as AnyRecord | null)?.['id'] ?? ghostAnswered)} — §4: an entry cannot be addressed to a tab that is not there, so the route must answer \`tab: null\``,
        )
        const ghostCrossing = buildCrossing(problems, '(S4·subject)·ghost-crossing')
        const ghostController = controllerWithActive(problems, '(S4·subject)·ghost-controller', TAB_B)
        const createClient = readFn(displayClientModule, 'createDisplayClient')
        if (ghostCrossing !== null && ghostController !== null && createClient !== null) {
          const ghostClient = createClient({
            read: () => (ghostCrossing.record.read as AnyFn).call(ghostCrossing.record),
            onChanged: () => (): void => undefined,
            write: (tabId: unknown, entry: unknown) => (ghostCrossing.record.commitTab as AnyFn)(tabId, entry),
          }) as AnyRecord
          const ghostDeps: AnyRecord = { client: ghostClient, editController: ghostController, document: null, window: null }
          attempt(problems, '(S4·subject)·ghost-writes-nothing', () => {
            const before = ghostCrossing.writes()
            // THE WIRING'S OWN SHAPE (`renderer.ts`'s observer body): resolve first, and a `null` tab writes nothing.
            const wired = route({ ...blurReport, subject: 'tab-ghost' }, tabBEntry, open) as AnyRecord
            if (wired['tab'] !== null) capture(ghostDeps, wired['tab'], blurReport, wired['event'])
            // AND THE CAPTURE ITSELF IS TOTAL AT A NULL TAB (a caller that forgets the guard still writes nothing).
            capture(ghostDeps, null, blurReport, 'commit-on-blur')
            return ghostCrossing.writes() === before
              ? null
              : `a subject naming no open tab produced ${ghostCrossing.writes() - before} store write(s) — §3/§4: the entry's stamp cannot be built without the tab's TARGET, so the capture writes NOTHING`
          })
        }

        // ── (c1·terse) THE ROUTE IS *TOTAL* AT A HOSTILE OPEN SET, AND THE MIRROR IS THE WRITE'S CARET WHEN NO CONTROLLER IS THERE.
        // ── **THE MEASURED FAULT THIS LIMB CLOSES** (§6's "every function here is TOTAL", adversarial round 2, MEASURED): the open
        // ── set was the ONE argument the route walked WITHOUT a guard, so an array-like whose `length` GETTER throws and a Proxy
        // ── whose `get` TRAP throws both escaped `stageDisplayCaptureRoute` — the region's totality sentence was false for exactly
        // ── the collaborator it reads most; and `stageDisplayRememberCaret`'s `controller.saveCaret` MEMBER READ sat outside its own
        // ── `try`, so a controller with a throwing `saveCaret` accessor escaped the capture. A set that cannot be read is an EMPTY
        // ── set (so a subject naming no open tab still answers `tab: null`), and the caret mirror is the region's ONE statement of
        // ── the last caret where the controller is ABSENT (a harness, or a slot read that throws) — the next whole-entry write
        // ── carries it, which is the mirror path this limb grades end to end.
        attempt(problems, '(S4·subject)·hostile-open-set', () => {
          const hostileSets: ReadonlyArray<{ readonly what: string; readonly openSet: unknown }> = [
            {
              what: 'an array-like whose `length` GETTER THROWS',
              openSet: {
                get length(): number {
                  throw new Error('the open set’s own `length` getter threw')
                },
              },
            },
            {
              what: 'a Proxy whose `get` TRAP THROWS',
              openSet: new Proxy(
                {},
                {
                  get(): never {
                    throw new Error('the open set’s own `get` trap threw')
                  },
                },
              ),
            },
          ]
          const msgs: string[] = []
          for (const hostile of hostileSets) {
            let answer: AnyRecord
            try {
              answer = route({ ...blurReport, subject: 'tab-ghost' }, tabBEntry, hostile.openSet) as AnyRecord
            } catch (thrown) {
              msgs.push(
                `\`stageDisplayCaptureRoute\` THREW on ${hostile.what} (${msgOf(thrown)}) — §6 makes every function in the markered region TOTAL at any argument, and an open set that cannot be READ is an EMPTY set, never an exception at the caller`,
              )
              continue
            }
            if (answer['tab'] !== null) {
              msgs.push(
                `a subject naming NO open tab answered tab ${show((answer['tab'] as AnyRecord | null)?.['id'] ?? answer['tab'])} on ${hostile.what} — the unreadable set is EMPTY, so the route falls back to the active-tab arm, and that arm answers \`null\` for a subject that is not the active one`,
              )
            }
            if (answer['event'] !== 'commit-on-blur') {
              msgs.push(
                `on ${hostile.what} the route answered event ${show(answer['event'])} — reading the open set must not disturb §2's discriminator, and a \`blur: true\` caret report is \`commit-on-blur\``,
              )
            }
          }
          return msgs.length > 0 ? msgs.join('; ') : null
        })

        // ── AND THE MIRROR PATH, END TO END: `rememberCaret(null, …)` with NO controller, then a capture ⇒ total, ONE write, and the
        // ── write carries that caret. The controller-less crossing is the region's own DECLARED limit, so it is graded, not skipped.
        const mirrorCrossing = buildCrossing(problems, '(S4·subject)·mirror-crossing')
        if (mirrorCrossing !== null && createClient !== null) {
          const mirrorClient = createClient({
            read: () => (mirrorCrossing.record.read as AnyFn).call(mirrorCrossing.record),
            onChanged: () => (): void => undefined,
            write: (tabId: unknown, entry: unknown) => (mirrorCrossing.record.commitTab as AnyFn)(tabId, entry),
          }) as AnyRecord
          const mirrorDeps: AnyRecord = { client: mirrorClient, editController: null, document: null, window: null }
          const mirrorCaret = caretAt(3)
          const remember = typeof subject.values['stageDisplayRememberCaret'] === 'function' ? (subject.values['stageDisplayRememberCaret'] as AnyFn) : null
          let mirrorThrew: string | null = null
          if (remember === null) {
            mirrorThrew = 'the region declares no drivable `stageDisplayRememberCaret` — the mirror path (a capture with NO controller) has no member to drive'
          } else {
            try {
              remember(null, TAB, mirrorCaret)
            } catch (thrown) {
              mirrorThrew = `\`stageDisplayRememberCaret(null, '${TAB}', caret)\` THREW (${msgOf(thrown)}) — an ABSENT controller is a DECLARED arm of §6's totality, never an exception, and the mirror is the only statement of the caret left on it`
            }
          }
          const mirrorReport = { kind: 'view', view: { offset: 12, section: 's-1' }, subject: TAB }
          const mirrorBefore = mirrorCrossing.writes()
          let mirrorCaptureThrew: string | null = null
          try {
            const wiredView = route(mirrorReport, tabBEntry, open) as AnyRecord
            if (wiredView['tab'] === null) mirrorCaptureThrew = `the route could not address \`${TAB}\` for the mirror limb (answer ${show(wiredView)})`
            else capture(mirrorDeps, wiredView['tab'], mirrorReport, wiredView['event'])
          } catch (thrown) {
            mirrorCaptureThrew = `the controller-less capture THREW (${msgOf(thrown)}) — §6: the capture is TOTAL, and an absent controller is a declared arm`
          }
          await settle()
          attempt(problems, '(S4·subject)·mirror-without-controller', () => {
            // **THE CARET IS COMPARED EDGE BY EDGE, NOT BY ITS OBJECT'S KEY ORDER** — the value takes a JSON round-trip through the
            // profile, so `{path, offset}` comes back as `{offset, path}` while stating the same caret. §4's members are each their
            // own reading (`focused` its own, both edges' path and offset their own), so the comparison is over those, in one order.
            const edgesOf = (value: unknown): string => {
              const held = (value ?? {}) as AnyRecord
              const anchor = (held['anchor'] ?? {}) as AnyRecord
              const focus = (held['focus'] ?? {}) as AnyRecord
              return show({
                kind: held['kind'],
                focused: held['focused'],
                anchorPath: anchor['path'],
                anchorOffset: anchor['offset'],
                focusPath: focus['path'],
                focusOffset: focus['offset'],
              })
            }
            const msgs: string[] = []
            if (mirrorThrew !== null) msgs.push(mirrorThrew)
            if (mirrorCaptureThrew !== null) msgs.push(mirrorCaptureThrew)
            const delta = mirrorCrossing.writes() - mirrorBefore
            if (delta !== 1) {
              msgs.push(
                `a \`scroll-settle\` capture with NO controller produced ${delta} store write(s) where §2 pins EXACTLY 1 — the \`view\` report states no caret, so the write's caret can only come from the mirror, and a mirror nothing reads leaves the entry without the caret the operator last placed`,
              )
            } else {
              const stored = (mirrorCrossing.record.readTab as AnyFn)(TAB) as AnyRecord | null
              const storedCaret = stored === null || stored === undefined ? null : ((stored['caret'] ?? null) as AnyRecord | null)
              if (storedCaret === null) {
                msgs.push(
                  `\`readTab('${TAB}')\` answers ${show(stored)} after \`rememberCaret(null, …)\` + a \`scroll-settle\` — §2: a caret that lands in the slot is carried into the NEXT whole-entry write, and the controller-less path is exactly where the mirror is the only statement of it`,
                )
              } else if (edgesOf(storedCaret) !== edgesOf(mirrorCaret)) {
                msgs.push(
                  `the stored caret's edges read ${edgesOf(storedCaret)} while the mirror was handed ${edgesOf(mirrorCaret)} — the next whole-entry write must carry THAT caret, member for member (§4: \`focused\` is its own reading)`,
                )
              }
            }
            return msgs.length > 0 ? msgs.join('; ') : null
          })
        }

        // ── (c2) END TO END THROUGH THE SHIPPED CAPTURE ──────────────────────────────────────────────────────────────
        const crossing = buildCrossing(problems, '(S4·subject)·crossing')
        // THE MEASURED SCENARIO'S SHAPE: tab-b HAS ALREADY BECOME THE ACTIVE TAB when the settle lands.
        const controller = controllerWithActive(problems, '(S4·subject)·controller', TAB_B)
        if (crossing !== null && controller !== null && createClient !== null) {
          const client = createClient({
            read: () => (crossing.record.read as AnyFn).call(crossing.record),
            onChanged: (handler: () => void) => (crossing.delivery.subscribe as AnyFn).call(crossing.delivery, handler),
            write: (tabId: unknown, entry: unknown) => (crossing.record.commitTab as AnyFn)(tabId, entry),
          }) as AnyRecord
          const subscription = (client.subscribe as AnyFn)(() => undefined) as AnyRecord
          if (subscription['subscribed'] !== true) {
            problems.push(`(S4·subject) · the client refused its ONE subscription (reason ${show(subscription['reason'])})`)
          }
          await (client.fill as AnyFn)()
          const deps: AnyRecord = { client, editController: controller, document: null, window: null }
          const before = crossing.writes()
          const wired = route(blurReport, tabBEntry, open) as AnyRecord
          if (wired['tab'] !== null) capture(deps, wired['tab'], blurReport, wired['event'])
          await settle()
          const text = (() => {
            try {
              return readFileSync(crossing.filePath, 'utf8')
            } catch (thrown) {
              return `threw: ${msgOf(thrown)}`
            }
          })()
          const reading: SubjectReading = {
            writes: crossing.writes() - before,
            stored: (crossing.record.readTab as AnyFn)(TAB),
            otherStored: (crossing.record.readTab as AnyFn)(TAB_B),
            fileText: text,
            tabId: TAB,
          }
          attempt(problems, '(S4·subject)·end-to-end', () => {
            const findings = subjectFindings(reading, '(S4·subject)')
            return findings.length > 0 ? findings.join('; ') : null
          })

          // ── THE FALSIFIER: THE MEASURED FAULT SHAPE — the same blur report routed by the SETTLE-TIME ACTIVE TAB (tab-b),
          // on a fresh crossing so the green above cannot be laundering the red here. The oracle must red and name the stamp.
          const faultCrossing = buildCrossing(problems, '(S4·subject)·fault-crossing')
          const faultController = controllerWithActive(problems, '(S4·subject)·fault-controller', TAB_B)
          if (faultCrossing !== null && faultController !== null) {
            const faultClient = createClient({
              read: () => (faultCrossing.record.read as AnyFn).call(faultCrossing.record),
              onChanged: (handler: () => void) => (faultCrossing.delivery.subscribe as AnyFn).call(faultCrossing.delivery, handler),
              write: (tabId: unknown, entry: unknown) => (faultCrossing.record.commitTab as AnyFn)(tabId, entry),
            }) as AnyRecord
            ;(faultClient.subscribe as AnyFn)(() => undefined)
            await (faultClient.fill as AnyFn)()
            const faultDeps: AnyRecord = { client: faultClient, editController: faultController, document: null, window: null }
            const faultBefore = faultCrossing.writes()
            // THE FAULT, EXACTLY AS MEASURED: the write goes to the ACTIVE tab because the settle asked "who is active now?".
            capture(faultDeps, tabBEntry, blurReport, 'commit-on-blur')
            await settle()
            const faultText = (() => {
              try {
                return readFileSync(faultCrossing.filePath, 'utf8')
              } catch (thrown) {
                return `threw: ${msgOf(thrown)}`
              }
            })()
            attempt(problems, '(S4·subject)·falsifier', () => {
              const findings = subjectFindings(
                {
                  writes: faultCrossing.writes() - faultBefore,
                  stored: (faultCrossing.record.readTab as AnyFn)(TAB),
                  otherStored: (faultCrossing.record.readTab as AnyFn)(TAB_B),
                  fileText: faultText,
                  tabId: TAB,
                },
                '(S4·subject·fault)',
              )
              if (findings.length === 0) {
                return 'CONTROL FAILED: the MEASURED fault shape (a blur on tab-a routed to the active tab, tab-b) left the oracle CLEAN — the row cannot see `B10-EX-02` at all'
              }
              const named = findings.join(' ')
              return /doc-b|tab-b/.test(named) && /tab-a|doc-a/.test(named)
                ? null
                : `CONTROL FAILED: the oracle reported [${named}] for the measured fault without naming the wrong tab/stamp`
            })
          }
        }
      }
    }

    expect(
      problems,
      '§4/§2 — the subject decides which tab a settle is written to (docs/L1/unit-b-10-stage-display-state.md §4, §2; B10-EX-02)',
    ).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S4·reauthor)` — A RE-AUTHORED SURFACE STILL REPORTS (§4; `B10-EX-03`, `B10-EX-04`)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
//
// **WHAT THIS ROW GRADES** (`docs/L1/unit-b-10-stage-display-state.md` §4): the ONE runtime member that reads a DOM
// selection/scroll is `Runtime.observeDisplayState(listener)`, and the fix round made three corrections to it, each measured:
//   · **`B10-EX-03` — THE SURFACE IS RESOLVED PER ARM AND THE LISTENERS LIVE ON THE DOCUMENT.** Every document mount drops the
//     content roots, so a surface bound ONCE became a detached node still holding the listener while a selection in the NEW
//     `#page-edit-surface` produced **0 reports** — the `m6`/`D-40` class, a capture that is dead while every counter and paint
//     looks healthy. The row therefore installs surface A, observes, settles a selection in A, then **RE-AUTHORS**: the double's
//     `#page-edit-surface` answer becomes a NEW node B (a DIFFERENT shape — B's text is a direct child, so the path proves the
//     resolution is against B) and a selection in B MUST report. **THE FALSIFIER IS THE OLD SHAPE ITSELF**: a listener registered
//     on the OLD surface node only produces **0** reports for that same re-authored selection, which is what makes the green a
//     reading of the document-delegated registration rather than of luck.
//   · **`B10-EX-04` — A BLUR ALWAYS REPORTS.** Where the DOM no longer states a caret, a real `focusout` inside the surface used
//     to emit nothing; it now emits `{kind:'caret', caret:null, blur:true, subject}` — **0 reports is the measured defect, not an
//     acceptable answer** — and the capture then carries the controller's last-known slot.
//   · **THE CONTAINMENT**: `focusout` is delegated to the document, so a blur whose `target` is OUTSIDE the current surface is not
//     this surface's settle-away and reports nothing, while one inside reports.
//   · **THE RELEASE IS TOTAL AND STOPS THE REPORTS**: after `release()` a further dispatch yields nothing, and a second release is
//     a no-op rather than a throw.
//
// **THE GLOBALS ARE THE SUBJECT, SO THEY ARE SAVED AND RESTORED** (`D-10`): this arm installs DOM DOUBLES as `globalThis.window`
// and `globalThis.document` (the member reads them as free variables, which is exactly what a real browser gives it) and restores
// the previous bindings in a `finally`, so no later row in this file or another inherits them. `observeDisplayState` uses NO
// `this`, which is why it is driven as `Runtime.prototype.observeDisplayState.call(null, …)` — the shape that also proves the
// member holds no instance state.

/** **THE SETTLE WINDOW** — `runtime.ts`'s `STAGE_DISPLAY_SETTLE_MS` is 50 ms; the row waits ~3× so a *missing* report is a reading
 *  and not a race. */
const settleWindow = (): Promise<void> => new Promise((done) => setTimeout(done, 150))

interface ObservedNode {
  nodeType: number
  data: string
  childNodes: ObservedNode[]
  parentNode: ObservedNode | null
  ownerDocument: AnyRecord | null
  id: string
  listeners: Record<string, Array<(event?: unknown) => void>>
  addEventListener(type: string, handler: (event?: unknown) => void): void
  removeEventListener(type: string, handler: (event?: unknown) => void): void
}

function observedNode(nodeType: number, data: string, owner: AnyRecord): ObservedNode {
  return {
    nodeType,
    data,
    childNodes: [],
    parentNode: null,
    ownerDocument: owner,
    id: '',
    listeners: {},
    addEventListener(type: string, handler: (event?: unknown) => void): void {
      ;(this.listeners[type] ??= []).push(handler)
    },
    removeEventListener(type: string, handler: (event?: unknown) => void): void {
      const arr = this.listeners[type] ?? []
      const at = arr.indexOf(handler)
      if (at >= 0) arr.splice(at, 1)
    },
  }
}

function observedElement(children: ObservedNode[], owner: AnyRecord, id = ''): ObservedNode {
  const node = observedNode(1, '', owner)
  node.id = id
  for (const child of children) {
    child.parentNode = node
    node.childNodes.push(child)
  }
  return node
}

interface ObservedDom {
  readonly document: AnyRecord
  readonly selection: AnyRecord
  readonly setSurface: (surface: ObservedNode | null) => void
  readonly surface: () => ObservedNode | null
  /** Dispatch a DOM event to the DOCUMENT's own listeners — the browser's own route for `selectionchange`/`focusout`, and the
   *  ONE route the re-author arm needs (a node-bound listener is never called by it). */
  readonly dispatch: (type: string, event?: unknown) => void
  readonly listenerCount: (type: string) => number
}

function makeObservedDom(): ObservedDom {
  const listeners: Record<string, Array<(event?: unknown) => void>> = {}
  let current: ObservedNode | null = null
  const document: AnyRecord = {
    activeElement: null,
    getElementById: (id: string) => (id === PAGE_SURFACE ? current : null),
    // THE STAGE'S SCROLL BOX IS ABSENT HERE ON PURPOSE: this arm grades the CARET half of the seam, and a `null` box is the
    // declared no-op the region's own totals cover.
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: (type: string, handler: (event?: unknown) => void): void => {
      ;(listeners[type] ??= []).push(handler)
    },
    removeEventListener: (type: string, handler: (event?: unknown) => void): void => {
      const arr = listeners[type] ?? []
      const at = arr.indexOf(handler)
      if (at >= 0) arr.splice(at, 1)
    },
  }
  const selection: AnyRecord = { anchorNode: null, anchorOffset: 0, focusNode: null, focusOffset: 0 }
  return {
    document,
    selection,
    setSurface: (surface: ObservedNode | null): void => {
      current = surface
      document.activeElement = surface
    },
    surface: () => current,
    dispatch: (type: string, event?: unknown): void => {
      for (const handler of [...(listeners[type] ?? [])]) handler(event ?? { type })
    },
    listenerCount: (type: string) => (listeners[type] ?? []).length,
  }
}

/** **THE GLOBALS ARE SAVED AND RESTORED IN A `finally`** — see this arm's header. */
async function withDomGlobals<T>(dom: ObservedDom, run: () => Promise<T>): Promise<T> {
  const scope = globalThis as AnyRecord
  const before = { window: scope['window'], document: scope['document'] }
  scope['window'] = { getSelection: () => dom.selection }
  scope['document'] = dom.document
  try {
    return await run()
  } finally {
    scope['window'] = before.window
    scope['document'] = before.document
  }
}

describe('stage-display-restore · arm (S4·reauthor) — a RE-AUTHORED surface still reports (§4; B10-EX-03, B10-EX-04)', () => {
  it('(S4·reauthor) · AFTER `#page-edit-surface` IS RE-AUTHORED A SELECTION IN THE NEW NODE REPORTS AGAINST IT (the node-bound shape reports 0), a `focusout` outside the surface reports nothing, a blur whose selection no longer resolves STILL reports `caret:null, blur:true`, and `release()` stops everything (§4; B10-EX-03/04)', async () => {
    const problems: string[] = []
    const observe = (Runtime.prototype as unknown as AnyRecord)['observeDisplayState']
    if (typeof observe !== 'function') {
      problems.push(
        '(S4·reauthor) · `Runtime.prototype.observeDisplayState` does not resolve on the LANDED `src/renderer/runtime.js` — §4\'s ONE capture seam has no member to drive',
      )
    } else {
      const dom = makeObservedDom()
      await withDomGlobals(dom, async () => {
        const reports: AnyRecord[] = []
        const collect = (report: unknown): void => {
          reports.push((report ?? {}) as AnyRecord)
        }
        // SURFACE A: the app's FIRST authoring — surface → paragraph → text (the caret's path is `[0, 0]`).
        const textA = observedNode(3, 'alpha surface text', dom.document)
        const surfaceA = observedElement([observedElement([textA], dom.document)], dom.document, PAGE_SURFACE)
        dom.setSurface(surfaceA)
        const release = (observe as AnyFn).call(null, collect, { subjectOf: () => TAB }) as unknown
        attempt(problems, '(S4·reauthor)·release-shape', () => (typeof release === 'function' ? null : `\`observeDisplayState\` answered ${show(release)} where §4 pins a release FUNCTION — the observer must be withdrawable`))
        // THE DOCUMENT IS WHERE THE LISTENERS LIVE (`B10-EX-03`): stated where it is read, so the falsifier below has a subject.
        attempt(problems, '(S4·reauthor)·document-delegated', () => {
          const selectionchange = dom.listenerCount('selectionchange')
          const focusout = dom.listenerCount('focusout')
          return selectionchange > 0 && focusout > 0
            ? null
            : `the observer registered ${selectionchange} \`selectionchange\` and ${focusout} \`focusout\` listener(s) on the DOCUMENT — §4/\`B10-EX-03\`: the listeners live on the document (which survives every re-author) and the surface is resolved per arm; a listener bound to a surface node is the measured 0-report fault`
        })

        // ── (1) A SELECTION IN SURFACE A REPORTS, against A's shape (`[0, 0]`).
        dom.selection['anchorNode'] = textA
        dom.selection['anchorOffset'] = 5
        dom.selection['focusNode'] = textA
        dom.selection['focusOffset'] = 5
        dom.dispatch('selectionchange')
        await settleWindow()
        attempt(problems, '(S4·reauthor)·first-surface', () => {
          if (reports.length !== 1) return `a settled selection in the authored surface produced ${reports.length} report(s) — §4: a settled selection is ONE report`
          const report = reports[0]!
          if (report['kind'] !== 'caret') return `the report's kind reads ${show(report['kind'])} — §4: a selection is a \`caret\` report`
          if (report['subject'] !== TAB) return `the report's subject reads ${show(report['subject'])} — §4: the subject is stamped at ARM time by the wiring's resolver`
          const anchor = (report['caret'] as AnyRecord | null)?.['anchor'] as AnyRecord | undefined
          return anchor?.['offset'] === 5 && show(anchor?.['path']) === show([0, 0])
            ? null
            : `the caret's edges read ${show(anchor)} where the selection sits at path [0,0] offset 5 — §4: the caret is resolved as a child-index path from the surface root`
        })

        // ── (2) THE RE-AUTHOR: the roots are dropped and a NEW `#page-edit-surface` is authored — B's text is a DIRECT child,
        // ── so the resolved path `[0]` proves the edges were resolved against B and not against the detached A.
        reports.length = 0
        const textB = observedNode(3, 'a brand new surface authored by the remount', dom.document)
        const surfaceB = observedElement([textB], dom.document, PAGE_SURFACE)
        // AND THE OLD ROOT IS DETACHED (`runtime.ts`'s teardown drops the content roots): surface A is no longer part of the
        // document the caret is read in, so a seam that still held it would be reading a node nobody can select inside.
        surfaceA.ownerDocument = null
        dom.setSurface(surfaceB)
        // THE OLD CODE'S SHAPE, FORGED AS THE FALSIFIER: a listener registered on the OLD surface node only.
        let nodeBound = 0
        surfaceA.addEventListener('selectionchange', () => {
          nodeBound += 1
        })
        dom.selection['anchorNode'] = textB
        dom.selection['anchorOffset'] = 5
        dom.selection['focusNode'] = textB
        dom.selection['focusOffset'] = 5
        dom.dispatch('selectionchange')
        await settleWindow()
        attempt(problems, '(S4·reauthor)·re-authored', () => {
          if (reports.length !== 1) {
            return `a settled selection in the RE-AUTHORED \`#page-edit-surface\` produced ${reports.length} report(s) — §4/\`B10-EX-03\`: the surface is looked up per arm, so a re-authoring must not silence the capture (\`0\` here is the measured defect, the \`m6\`/\`D-40\` class)`
          }
          const caret = reports[0]!['caret'] as AnyRecord | null
          const anchor = (caret ?? {})['anchor'] as AnyRecord | undefined
          if (show(anchor?.['path']) !== show([0])) {
            return `the caret's path reads ${show(anchor?.['path'])} where B's text is its surface's DIRECT child (path [0]) — a \`[0,0]\` path here would mean the edges were resolved against the DETACHED surface A`
          }
          return anchor?.['offset'] === 5 ? null : `the caret's offset reads ${show(anchor?.['offset'])} where the selection sits at offset 5 inside the NEW surface`
        })
        attempt(problems, '(S4·reauthor)·falsifier', () =>
          nodeBound === 0
            ? null
            : `CONTROL FAILED: the node-bound listener (registered on the OLD surface node) fired ${nodeBound} time(s) — the re-author arm must be driven by the DOCUMENT-delegated registration, so the node-bound shape must be DEAF here`,
        )

        // ── (3) THE CONTAINMENT: a `focusout` whose target is OUTSIDE the current surface is not this surface's blur.
        reports.length = 0
        const outside = observedElement([observedNode(3, 'somewhere else on the page', dom.document)], dom.document)
        dom.dispatch('focusout', { type: 'focusout', target: outside })
        await settleWindow()
        attempt(problems, '(S4·reauthor)·containment-outside', () =>
          reports.length === 0
            ? null
            : `a \`focusout\` on a node OUTSIDE \`#page-edit-surface\` produced ${reports.length} report(s) — §4: the delegated listener's containment test makes this surface's settle-away only, and any other element's blur is not the record's trigger`,
        )

        // ── (4) INSIDE the surface it IS the blur, and the caret it carries is the settled position.
        reports.length = 0
        dom.selection['anchorNode'] = textB
        dom.selection['anchorOffset'] = 5
        dom.selection['focusNode'] = textB
        dom.selection['focusOffset'] = 5
        dom.dispatch('focusout', { type: 'focusout', target: textB })
        await settleWindow()
        attempt(problems, '(S4·reauthor)·containment-inside', () => {
          if (reports.length !== 1) return `a \`focusout\` inside \`#page-edit-surface\` produced ${reports.length} report(s) — §4: the surface's own settle-away is the \`commit-on-blur\` trigger`
          const report = reports[0]!
          if (report['kind'] !== 'caret') return `the blur report's kind reads ${show(report['kind'])}`
          if (report['blur'] !== true) return `the blur report's \`blur\` reads ${show(report['blur'])} — §4: the report's own flag is the authority`
          const anchor = (report['caret'] as AnyRecord | null)?.['anchor'] as AnyRecord | undefined
          return show(anchor?.['path']) === show([0]) && anchor?.['offset'] === 5
            ? null
            : `the blur report's caret reads ${show(anchor)} where the selection sat at path [0] offset 5`
        })

        // ── (5) `B10-EX-04`: THE SELECTION NO LONGER RESOLVES INSIDE THE SURFACE — and the blur STILL reports. 0 reports is
        // ── the measured defect, so it is not an acceptable answer here.
        reports.length = 0
        dom.selection['anchorNode'] = null
        dom.selection['anchorOffset'] = 0
        dom.selection['focusNode'] = null
        dom.selection['focusOffset'] = 0
        dom.dispatch('focusout', { type: 'focusout', target: textB })
        await settleWindow()
        attempt(problems, '(S4·reauthor)·blur-always-reports', () => {
          if (reports.length !== 1) {
            return `a \`focusout\` inside the surface whose selection no longer resolves produced ${reports.length} report(s) — §4/\`B10-EX-04\`: a blur that captured nothing is a HOLE, not an arm; the report must be \`{caret:null, blur:true}\``
          }
          const report = reports[0]!
          const msgs: string[] = []
          if (report['kind'] !== 'caret') msgs.push(`the report's kind reads ${show(report['kind'])}`)
          if (report['caret'] !== null) msgs.push(`the report's \`caret\` reads ${show(report['caret'])} where the DOM states no position`)
          if (report['blur'] !== true) msgs.push(`the report's \`blur\` reads ${show(report['blur'])}`)
          if (report['subject'] !== TAB) msgs.push(`the report's subject reads ${show(report['subject'])} — the blur is still stamped with the tab it was read from`)
          return msgs.length > 0 ? msgs.join('; ') : null
        })

        // ── (6) THE RELEASE IS TOTAL AND IT STOPS THE REPORTS.
        reports.length = 0
        const total = (() => {
          try {
            if (typeof release === 'function') {
              ;(release as AnyFn)()
              // TOTAL AND IDEMPOTENT: a second withdrawal is a no-op, never a throw.
              ;(release as AnyFn)()
            }
            return null
          } catch (thrown) {
            return `release() THREW (${msgOf(thrown)}) — §4: the release is total and idempotent`
          }
        })()
        attempt(problems, '(S4·reauthor)·release', () => total)
        dom.selection['anchorNode'] = textB
        dom.selection['anchorOffset'] = 5
        dom.selection['focusNode'] = textB
        dom.selection['focusOffset'] = 5
        dom.dispatch('selectionchange')
        dom.dispatch('focusout', { type: 'focusout', target: textB })
        await settleWindow()
        attempt(problems, '(S4·reauthor)·released', () =>
          reports.length === 0
            ? null
            : `${reports.length} report(s) arrived AFTER \`release()\` — §4: the release is total, so a dispatch that follows it reaches nothing (a leaked observer keeps writing a record for a stage that is gone)`,
        )
        attempt(problems, '(S4·reauthor)·withdrawn', () => {
          const selectionchange = dom.listenerCount('selectionchange')
          const focusout = dom.listenerCount('focusout')
          return selectionchange === 0 && focusout === 0
            ? null
            : `after \`release()\` the document still carries ${selectionchange} \`selectionchange\` and ${focusout} \`focusout\` listener(s) — §4: the release WITHDRAWS its registrations, not merely its flag`
        })
      })
    }

    expect(
      problems,
      '§4 — the capture seam survives a re-author, reports a caret-less blur, contains `focusout` to its surface, and releases totally (docs/L1/unit-b-10-stage-display-state.md §4; B10-EX-03, B10-EX-04)',
    ).toEqual([])
  })
})
