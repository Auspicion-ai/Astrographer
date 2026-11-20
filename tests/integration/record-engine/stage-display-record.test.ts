// tests/integration/record-engine/stage-display-record.test.ts — unit `B-10` `stage-display-state`'s PRODUCTION-PATH and
// NO-CONTENT rows: `(S1)(a)` the source census, `(S1)(b)` the driven path, `(S2·carried)` the carried caret, `(S2·gated)` the write
// gate and the `blur` discriminator, `(S4)` the value census. Authored BEFORE any byte of the change set moves (RCA-1). Every claim
// is READ off
// `docs/L1/unit-b-10-stage-display-state.md` and the section it names.
//
// THE ROWS THIS FILE CARRIES:
//   `(S1)(a)` §7 `(S1)` — **A SOURCE CENSUS over the shipped `src/renderer/**`**: at least ONE `saveCaret(` CALL site outside
//          `edit-controller.ts`'s own declaration/implementation, in `renderer.ts`'s capture wiring. **With a FORGED-SOURCE
//          positive control**, so an oracle that matches nothing cannot pass by matching nothing.
//   `(S1)(b)` §7 `(S1)` — **THE DRIVEN PRODUCTION PATH**: the markered region is extracted and driven with a REAL
//          `EditController`, a real store on a `/tmp` path and the real record over it. The surface blur and the caret move both
//          reach `saveCaret`, and a later `restoreCaret` on the SAME controller answers the caret. **The falsifier is a mutant
//          region with the capture's `saveCaret` call DELETED and it MUST red the same oracle** — a harness that calls
//          `saveCaret` itself does not satisfy this row (§7 `(S1)`: "the row must fail if the login in `renderer.ts` is
//          deleted").
//   `(S2·carried)` §2/§7 `(S2)` — **THE FIX ROUND'S ROW (`B10-EX-01`)**: `move → scroll-settle → tab-switch` carries the LAST
//          MOVED CARET into the written entry, edge by edge, on the LIVE production shape (real store + real delivery + real push
//          + a real controller whose page-subject hook is `sidebar-panes.ts`'s own), with the write count at exactly 3. **Its
//          teeth are IN-TEST AND DURABLE**: the shipped region text with the slot read (`stageDisplayLastCaret(tabId)`) replaced
//          by `null` is driven through the SAME oracle and MUST red, naming the caret/offset disagreement.
//   `(S2·gated)` §2's adjudication/§7 `(S2)` — **THE WRITE GATE IS THE PINNED THREE AND A `blur: false` REPORT IS A MOVE**: the
//          shipped `captureStageDisplay` over a real client on a COUNTING PORT and a real controller writes **0** times for
//          `event ∈ [null, undefined, 0, 'bogus', '', 'TAB-SWITCH']` and **exactly 1** time for each of the three pinned events; the
//          shipped `stageDisplayCaptureRoute`'s discriminator answers `'commit-on-blur'` for `blur: true` at every caret shape,
//          **`null` for `blur: false` at every caret shape** (the MOVE), and `'commit-on-blur'` for a flag-less
//          `focused:false`/`'yes'`/`caret:null` report; and the route's answers fed straight into the capture make a
//          `blur:false, focused:false` report write NOTHING while a `blur:true` one writes once. See the arm's own docblock for the
//          MEASURED fault it closes (a move-shaped report wrote per settle, and `undefined`/`0`/`'bogus'` each wrote one).
//   `(S4)` §3/§7 `(S4)` — **NO CONTENT REACHES THE RECORD**: real text is typed into the surface, the capture writes, and
//          `<tmp>/provident-profile.json`'s BYTES are read back — the entry's member names are within the allowlist and its
//          declared nested names, AND **the typed text does not occur anywhere in the file's bytes** (a VALUE census, `B1-ADV-01`'s
//          lesson). Positive control: a forged entry carrying a `content` member is REFUSED by `commitTab` with its OWN reason
//          token, so the row cannot pass by never writing. **THE CLAIM WAS MOVED AND STRENGTHENED IN THE FIX ROUND** — the row's
//          `NESTED_MEMBERS` lookup keyed the nested allowlist by the IMMEDIATE parent (`caret.anchor`) instead of the path it
//          documents, so ANY stored caret's `caret.anchor.path`/`caret.anchor.offset` read as "outside the allowlist". It was
//          green only while the capture dropped the slot's caret (the entry carried `{documentId, view}` and NO caret at all —
//          i.e. the row never exercised the caret's own members); see the row's own docblock.
//
// **THE SEAM THESE ROWS DRIVE** is §6's markered region (`// ⟦B-10-STAGE-DISPLAY⟧` … `// ⟦/B-10-STAGE-DISPLAY⟧`) in
// `src/renderer/renderer.ts`, cut from the shipped bytes, compiled with the repo's own `esbuild` and DRIVEN — never a copy. An
// ABSENT region FAILS, never skips. Its two value names are pinned: `restoreDisplayState` (§6's own name) and
// `captureStageDisplay` (the capture §6 names without spelling; §7 `(S1)` calls it "the real capture function"). The reference
// region this file forges is written ONLY to prove the oracle in both directions.
//
// **COLOURS DECLARED AT THIS HEAD:** every row that drives the shipped region is RED for ONE named reason — the region does not
// exist in `src/renderer/renderer.ts` at this head, so `saveCaret` still has no production caller (§1's finding, re-measured).
// **GREEN ON ARRIVAL BY DESIGN**: the two POSITIVE CONTROLS — the forged-source census control and the forged-entry
// `commitTab` refusal (which drives `B-1`'s LANDED family parse) — and the reference/mutant region pair that proves the
// driven-path oracle discriminates. A control that is red proves nothing about the oracle it guards.
//
// **LAYER (`D-10`, `RCA-12`):** `[T]`/ENVELOPE. A real store is constructed on a `mkdtempSync` path and removed in `afterAll`; the
// typed surface is a DOCUMENTED DOM DOUBLE (`window.getSelection`/`document.createRange` are absent in the layout-less
// `src/shared/dom-shim.ts`, so the double supplies them), which makes these rows envelope-class and NEVER app-green — no paint, no
// assembled renderer, no Electron spawn. No `vi.mock` anywhere: the port and the DOM are plain objects handed to REAL seams.
import { afterAll, describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// LANDED modules: `B-1`'s family/record/delivery, `B-2`'s client, the fork's controller — namespace-imported so a member this
// unit adds answers `undefined` inside the row that needs it rather than failing the file's link.
import * as recordEngineModule from '../../../src/main/record-engine/index.js'
import * as storeroomModule from '../../../src/main/storeroom.js'
import * as displayClientModule from '../../../src/renderer/display-client.js'
import * as editControllerModule from '../../../src/renderer/edit-controller.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..', '..')
const RENDERER_DIR = join(ROOT, 'src', 'renderer')
const RENDERER_PATH = join(RENDERER_DIR, 'renderer.ts')
const EDIT_CONTROLLER_PATH = join(RENDERER_DIR, 'edit-controller.ts')

/** §6: both markers are part of this contract's change set; an absent region FAILS the row that needs it. */
const REGION_OPEN = '// ⟦B-10-STAGE-DISPLAY⟧'
const REGION_CLOSE = '// ⟦/B-10-STAGE-DISPLAY⟧'
const PINNED_NAMES = ['captureStageDisplay', 'restoreDisplayState'] as const

/** §3's fixtures: the tab is the ADDRESS SEGMENT, never a stored `tabId`. */
const TAB = 'tab-a'
const DOC_A = 'doc-a'
const DOCUMENT_ENTRY = { id: TAB, target: { kind: 'document', documentId: DOC_A }, title: 'doc-a' }
/** **THE TYPED TEXT** — a distinctive string no fixture could produce by accident, so its absence from the profile's bytes is a
 *  reading and not a coincidence (`D-23`'s hard line, measured as a VALUE census). */
const TYPED_TEXT = 'SMUGGLED-PARAGRAPH-7f3a-the-whole-document-body'

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

/** **COMMENTS STRIPPED, WITH AN ORIGIN MAP** — a census over code must not count a docblock that QUOTES a call, and a line
 *  number must be read off the raw bytes. */
function stripComments(text: string): { code: string; origin: number[] } {
  const code: string[] = []
  const origin: number[] = []
  let i = 0
  while (i < text.length) {
    const char = text[i] as string
    if (char === '/' && text[i + 1] === '/') {
      const newline = text.indexOf('\n', i)
      i = newline < 0 ? text.length : newline
      continue
    }
    if (char === '/' && text[i + 1] === '*') {
      const close = text.indexOf('*/', i + 2)
      i = close < 0 ? text.length : close + 2
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      const quote = char
      code.push(char)
      origin.push(i)
      i += 1
      while (i < text.length) {
        const inner = text[i] as string
        code.push(inner)
        origin.push(i)
        if (inner === '\\') {
          const escaped = text[i + 1]
          if (escaped !== undefined) {
            code.push(escaped)
            origin.push(i + 1)
          }
          i += 2
          continue
        }
        i += 1
        if (inner === quote) break
      }
      continue
    }
    code.push(char)
    origin.push(i)
    i += 1
  }
  return { code: code.join(''), origin }
}

function walkSources(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...walkSources(path))
    else if (entry.name.endsWith('.ts')) found.push(path)
  }
  return found
}

const relPath = (file: string): string => relative(ROOT, file).split('\\').join('/')

const tempDirs: string[] = []
function newProfilePath(label: string): string {
  const dir = mkdtempSync(join(tmpdir(), `b10-stage-display-${label}-`))
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
        `${openAt < 0 && closeAt < 0 ? 'are' : 'is'} ABSENT — §1's finding stands: \`saveCaret\` is DECLARED and IMPLEMENTED in ` +
        '`edit-controller.ts` and has NO production caller, so the capture side of D-23\'s record is still unwired',
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
    // THE DOM GLOBALS ARE ABSENT ON PURPOSE: a region that reaches a GLOBAL instead of the injected lookup is caught here.
    run(moduleObject.exports, requireStub, moduleObject, console, undefined, undefined)
  } catch (thrown) {
    return { problem: `the compiled region THREW while being evaluated (${msgOf(thrown)})`, region, declared, values: {} }
  }
  const values = (moduleObject.exports.__b10Region ?? {}) as AnyRecord
  const absent = PINNED_NAMES.filter((name) => typeof values[name] !== 'function')
  return { problem: absent.length > 0 ? `the region declares ${absent.join(' and ')} but not as drivable VALUES` : null, region, declared, values }
}

// ─── a real crossing: store → delivery → record → port → client ─────────────────────────────────────────────────────

interface Crossing {
  readonly record: AnyRecord
  readonly store: AnyRecord
  readonly filePath: string
  readonly writes: () => number
  /** **THE STORE'S OWN DELIVERY** — the fan-out the client's `onChanged` subscribes to, so a write reaches the client as the
   *  real PUSH (§5/`B-2`: the push carries nothing and the only correct answer to it is a re-read). Added in the fix round for
   *  `(S2·carried)`, which must not simulate the push: a `held` shape nothing ever moves is not the live shape. */
  readonly delivery: AnyRecord
}

/** One real crossing, built in §2's own order (`createDisplayDelivery` first, its `entries` adopted by the ONE construction,
 *  the family's declarations registered there and the holder bound AFTER the call answers). */
function buildCrossing(problems: string[], label: string): Crossing | null {
  const createProfileStore = readFn(storeroomModule, 'createProfileStore')
  const createDisplayDelivery = readFn(recordEngineModule, 'createDisplayDelivery')
  const createDisplayRecord = readFn(recordEngineModule, 'createDisplayRecord')
  const displayConstraintDeclarations = readFn(recordEngineModule, 'displayConstraintDeclarations')
  if (createProfileStore === null || createDisplayDelivery === null || createDisplayRecord === null || displayConstraintDeclarations === null) {
    problems.push(
      `${label} · \`createProfileStore\`/\`createDisplayDelivery\`/\`createDisplayRecord\`/\`displayConstraintDeclarations\` do not all resolve on the LANDED seams — the record this row measures has no substrate`,
    )
    return null
  }
  const filePath = newProfilePath(label.replace(/[^A-Za-z0-9-]/g, '-'))
  try {
    const delivery = createDisplayDelivery(() => undefined) as AnyRecord
    let holder: unknown = null
    const store = createProfileStore({
      filePath,
      listeners: [...((delivery.entries as unknown[]) ?? [])],
      constraints: [...((displayConstraintDeclarations(() => holder) as unknown[]) ?? [])],
    }) as AnyRecord
    holder = store
    const record = createDisplayRecord({ store, delivery }) as AnyRecord
    let writes = 0
    const counted: AnyRecord = {
      ...store,
      read: (...args: unknown[]) => (store.read as AnyFn).apply(store, args),
      write: (...args: unknown[]) => {
        writes += 1
        return (store.write as AnyFn).apply(store, args)
      },
    }
    const countedRecord = createDisplayRecord({ store: counted, delivery }) as AnyRecord
    return { record: countedRecord, store, filePath, writes: () => writes, delivery }
  } catch (thrown) {
    problems.push(`${label} · the ONE construction THREW (${msgOf(thrown)}) — a construction the native addon cannot serve is a STOP, reported rather than worked around`)
    return null
  }
}

/** **THE CARET'S CORE — §4's `DisplayCaret` IS `CaretState` MINUS `ragId`**, while `restoreCaret`'s FS2 arm
 *  (`edit-controller.ts:276-279`) DROPS a `rich` caret whose `ragId` is not `page-edit-surface`. So the capture's priming must
 *  re-add the surface subject, and every comparison here is over the CORE: the family states the place, never the subject. */
const caretCore = (caret: unknown): string => {
  const record = (caret ?? {}) as AnyRecord
  return show({ kind: record['kind'], anchor: record['anchor'], focus: record['focus'], focused: record['focused'] })
}

/** One `DisplayCaret` at an offset — the family's caret vocabulary minus `ragId` (§4). */
const caretAt = (offset: number): AnyRecord => ({
  kind: 'rich',
  anchor: { path: [0, 1], offset },
  focus: { path: [0, 1], offset },
  focused: true,
})

/** A real `EditController` over the fork's own seam, with the page-subject carriers supplied so `restoreCaret` answers. */
function controllerOver(problems: string[], label: string): { controller: AnyRecord; saves: () => number } | null {
  const createController = readFn(editControllerModule, 'createEditController')
  if (createController === null) {
    problems.push(`${label} · \`createEditController\` does not resolve on the LANDED \`src/renderer/edit-controller.js\` — §4's caller has no controller`)
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

// ─── the DOM double (the layout-less shim supplies neither `getSelection` nor `createRange`) ─────────────────────────

interface FakeNode {
  nodeType: number
  data: string
  childNodes: FakeNode[]
  parentNode: FakeNode | null
  scrollTop?: number
  scrollHeight?: number
  clientHeight?: number
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

interface SelectionDouble {
  anchorNode: FakeNode | null
  anchorOffset: number
  focusNode: FakeNode | null
  focusOffset: number
  rangeCount: number
  addRange(range: { startNode: FakeNode | null; startOffset: number; endNode: FakeNode | null; endOffset: number }): void
  removeAllRanges(): void
}

/** **THE DOCUMENTED DOM DOUBLE** — `#page-edit-surface` (a paragraph holding the typed text), the stage's own scroll box
 *  `[id="zone:main"]` (`ASM-B10-2`), `createRange()`, and `window.getSelection()`. This is why the rows carrying it are
 *  ENVELOPE-class and never app-green: the double has no layout, no paint and no re-authoring. */
function makeDom(): { document: AnyRecord; window: AnyRecord; surface: FakeNode; scrollBox: FakeNode; selection: SelectionDouble } {
  const paragraph = element([textNode(TYPED_TEXT)])
  const surface = element([paragraph])
  const scrollBox = element([], { scrollTop: 0, scrollHeight: 4000, clientHeight: 500 })
  const selection: SelectionDouble = {
    anchorNode: null,
    anchorOffset: 0,
    focusNode: null,
    focusOffset: 0,
    rangeCount: 0,
    addRange(range): void {
      selection.anchorNode = range.startNode
      selection.anchorOffset = range.startOffset
      selection.focusNode = range.endNode
      selection.focusOffset = range.endOffset
      selection.rangeCount = 1
    },
    removeAllRanges(): void {
      selection.anchorNode = null
      selection.anchorOffset = 0
      selection.focusNode = null
      selection.focusOffset = 0
      selection.rangeCount = 0
    },
  }
  const byId: Record<string, FakeNode> = { 'page-edit-surface': surface, 'zone:main': scrollBox, app: element([scrollBox]) }
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
  return { document, window, surface, scrollBox, selection }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S1)(a)` — THE SOURCE CENSUS: `saveCaret` HAS A PRODUCTION CALLER (§7 (S1)(a), §1's finding)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface CallSite {
  readonly file: string
  readonly line: number
  readonly text: string
}

/** THE ORACLE: every `saveCaret(` **CALL** site in a source map, EXCLUDING `edit-controller.ts` (whose declarations and
 *  implementation are the member's own home and are not a caller). Driven over the walked tree by the census row and over
 *  FORGED sources by the control row — one function, two subjects. */
function saveCaretCallSites(sources: ReadonlyMap<string, string>): CallSite[] {
  const sites: CallSite[] = []
  const needle = 'saveCaret('
  for (const [file, raw] of sources) {
    const rel = file.includes('/') || file.includes('\\') ? relPath(file) : file
    if (rel.endsWith('edit-controller.ts')) continue
    const { code, origin } = stripComments(raw)
    let at = code.indexOf(needle)
    while (at >= 0) {
      const prefix = code.slice(Math.max(0, at - 40), at)
      const isDeclaration = /(?:function|class|interface|type)\s+$/.test(prefix)
      const isImport = /import\s*\{[^}]*$/.test(prefix)
      if (!isDeclaration && !isImport) {
        const lineStart = code.lastIndexOf('\n', at) + 1
        const lineEnd = code.indexOf('\n', at)
        sites.push({
          file: rel,
          line: (raw.slice(0, origin[at] ?? 0).match(/\n/g) ?? []).length + 1,
          text: code.slice(lineStart, lineEnd < 0 ? code.length : lineEnd).trim(),
        })
      }
      at = code.indexOf(needle, at + needle.length)
    }
  }
  return sites
}

describe('stage-display-record · arm (S1)(a) — `saveCaret` is CALLED from the app’s own event (§7 (S1)(a))', () => {
  it('(S1a) · A SOURCE CENSUS FINDS AT LEAST ONE `saveCaret(` CALL SITE OUTSIDE `edit-controller.ts`, IN `renderer.ts`’S CAPTURE WIRING (§7 (S1)(a), §1)', () => {
    const problems: string[] = []
    const files = walkSources(RENDERER_DIR)
    expect(files.length, 'the `src/renderer/**` walk found files, or an empty walk answers "no call site" and "a call site" equally badly').toBeGreaterThan(0)
    const sources = new Map<string, string>(files.map((file) => [file, readPath(file)]))
    const sites = saveCaretCallSites(sources)

    if (sites.length === 0) {
      problems.push(
        '(S1a) · §1\'s finding stands and §7 (S1)(a) is the row that refuses it: `saveCaret` is DECLARED (`edit-controller.ts:116`) and IMPLEMENTED (`:229-231`) and has NO production caller — the only callers in the tree would be tests, and the capture side of D-23\'s record is never wired',
      )
    } else if (!sites.some((site) => site.file === 'src/renderer/renderer.ts')) {
      problems.push(
        `(S1a) · the census answered [${sites.map((site) => `${site.file}:${site.line}`).join(', ')}] and NONE of them is \`src/renderer/renderer.ts\` — §6 puts the capture in that file's markered region, so a ` +
          'caller anywhere else is not the app\'s own event route',
      )
    }

    // AND THE CALLER SITS INSIDE THE MARKERED REGION when that region exists: §6 makes the region the capture's home, so a call
    // site elsewhere in `renderer.ts` is a second capture path rather than the one the contract pins.
    attempt(problems, '(S1a)·region-home', () => {
      const raw = readPath(RENDERER_PATH)
      const openAt = raw.indexOf(REGION_OPEN)
      const closeAt = raw.indexOf(REGION_CLOSE)
      if (openAt < 0 || closeAt < 0) {
        return `§6's markers are ABSENT from \`src/renderer/renderer.ts\`, so no \`saveCaret(\` call site can be inside the region the contract pins as the capture's ONE home`
      }
      const inside = saveCaretCallSites(new Map([[RENDERER_PATH, raw.slice(openAt, closeAt + REGION_CLOSE.length)]]))
      const adjusted = inside.filter((site) => site.file === 'src/renderer/renderer.ts')
      return adjusted.length > 0
        ? null
        : `the markered region carries NO \`saveCaret(\` call site — §7 (S1)(a) requires the call in \`renderer.ts\`'s capture wiring, and a call outside the region is a second capture home`
    })

    expect(problems, '§7 (S1)(a) — the source census for the production caller (docs/L1/unit-b-10-stage-display-state.md §7 (S1)(a), §1)').toEqual([])
  })

  it('(S1a·control) · POSITIVE CONTROL — the SAME census answers a forged CALL site and never counts a DECLARATION, so its red is not a broken oracle (§7 (S1)(a))', () => {
    const problems: string[] = []

    attempt(problems, '(S1a·control)·call', () => {
      const forged = new Map<string, string>([
        ['src/renderer/renderer.ts', 'export function capture(){ deps.editController.saveCaret(entry.id, caret) }\n'],
      ])
      const sites = saveCaretCallSites(forged)
      if (sites.length !== 1) return `CONTROL FAILED: one plainly written \`saveCaret(\` call in \`src/renderer/renderer.ts\` read ${sites.length} site(s) — a caller would ship unread`
      return sites[0]!.file === 'src/renderer/renderer.ts' && sites[0]!.line === 1
        ? null
        : `CONTROL FAILED: the census answered ${show(sites[0])} — the site is reported by file and line, never by "somewhere"`
    })

    attempt(problems, '(S1a·control)·declaration', () => {
      const forged = new Map<string, string>([
        ['src/renderer/edit-controller.ts', 'export interface EditController {\n  saveCaret(subjectId: string, caret: CaretState): void\n}\n'],
        ['src/renderer/other.ts', 'function saveCaret(subjectId: string, caret: unknown): void { void subjectId; void caret }\n'],
      ])
      const sites = saveCaretCallSites(forged)
      return sites.length === 0
        ? null
        : `CONTROL FAILED: a DECLARATION (\`function saveCaret(\` and the interface member) was counted as a call site [${sites.map((site) => `${site.file}:${site.line}`).join(', ')}] — §7 (S1)(a) is about a CALLER, and counting declarations would satisfy the row with a member nobody calls`
    })

    attempt(problems, '(S1a·control)·commented-out', () => {
      const forged = new Map<string, string>([
        ['src/renderer/renderer.ts', '// we could call deps.editController.saveCaret(entry.id, caret) here\nexport const nothing = 1\n'],
      ])
      const sites = saveCaretCallSites(forged)
      return sites.length === 0
        ? null
        : 'CONTROL FAILED: a `saveCaret(` inside a LINE COMMENT was counted — a docblock that quotes the call is prose, and §1\'s finding is about the shipped code'
    })

    expect(problems, '§7 (S1)(a) — the mandatory forged-source control (docs/L1/unit-b-10-stage-display-state.md §7 (S1)(a))').toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S1)(b)` — THE DRIVEN PRODUCTION PATH (§7 (S1)(b))
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** **THE ORACLE — ONE function, THREE subjects** (the shipped region, a reference region, and that reference with its
 *  `saveCaret` call DELETED). It drives §2's two capture triggers over a REAL controller and a REAL record, and answers the
 *  findings it read. §7 (S1)(b)'s own falsifier requirement is exactly that the deleted-login mutant reds here. */
function productionPathFindings(subject: RegionSubject, label: string): { findings: string[]; crossing: Crossing | null } {
  const findings: string[] = []
  const crossing = buildCrossing(findings, `${label}·crossing`)
  const built = controllerOver(findings, `${label}·controller`)
  if (crossing === null || built === null) return { findings, crossing }
  const capture = typeof subject.values['captureStageDisplay'] === 'function' ? (subject.values['captureStageDisplay'] as AnyFn) : null
  if (capture === null) {
    findings.push(`${label} · the region resolves no drivable \`captureStageDisplay\` — §7 (S1)(b) has no capture function`)
    return { findings, crossing }
  }
  const dom = makeDom()
  const client = (readFn(displayClientModule, 'createDisplayClient') as AnyFn)({
    read: () => (crossing.record.read as AnyFn).call(crossing.record),
    onChanged: () => (): void => undefined,
    write: (tabId: unknown, entry: unknown) => (crossing.record.commitTab as AnyFn)(tabId, entry),
  }) as AnyRecord
  // **THE WRITE ROUTE FOR THIS ORACLE.** §5's `client.write` member is graded by its OWN row
  // (`tests/unit/shell-chrome/display-write-route.test.ts` `(S6·client)`), and this row's subject is the CAPTURE. Until that member
  // lands, the deps are handed the record's own `commitTab` as the transport, so the capture's WRITE arm still reaches a REAL
  // record over a REAL `/tmp` store — and a capture that writes nothing is still caught, which is what the arm measures.
  if (typeof (client as AnyRecord)['write'] !== 'function') {
    ;(client as AnyRecord)['write'] = (tabId: unknown, entry: unknown) => (crossing.record.commitTab as AnyFn)(tabId, entry)
  }
  const deps: AnyRecord = { client, editController: built.controller, document: dom.document, window: dom.window }

  // ── ARM 1: THE CARET MOVE — it must reach `saveCaret` and write NOTHING (§2's adjudication).
  const writesBefore = crossing.writes()
  const moveAnswer = (() => {
    try {
      capture(deps, DOCUMENT_ENTRY, { kind: 'caret', caret: caretAt(4) }, null)
      return null
    } catch (thrown) {
      return `the caret-move capture THREW (${msgOf(thrown)})`
    }
  })()
  if (moveAnswer !== null) findings.push(`${label} · ${moveAnswer}`)
  if (built.saves() < 1) {
    findings.push(
      `${label} · THE CARET MOVE NEVER REACHED \`saveCaret\` — §7 (S1)(b) reads the move's effect on the SAME controller instance, and a capture that stores nothing is the dead-\`saveCaret\` state §1 measured`,
    )
  }
  if (crossing.writes() !== writesBefore) {
    findings.push(`${label} · the caret move WROTE ${crossing.writes() - writesBefore} time(s) — §2's adjudication: a move lands in the in-memory slot and writes nothing`)
  }
  const answered = (() => {
    try {
      return (built.controller.restoreCaret as AnyFn)(TAB)
    } catch (thrown) {
      return `threw: ${msgOf(thrown)}`
    }
  })()
  if (caretCore(answered) !== caretCore(caretAt(4))) {
    findings.push(
      `${label} · a later \`restoreCaret('${TAB}')\` answered ${show(answered)} while the move stated ${show(caretAt(4))} — §7 (S1)(b): the effect is read through the controller's OWN restore on the SAME instance`,
    )
  }

  // ── ARM 2: THE SURFACE BLUR — a real capture, a real record over the /tmp store, and the entry must LAND.
  const writesBeforeBlur = crossing.writes()
  const blurAnswer = (() => {
    try {
      capture(deps, DOCUMENT_ENTRY, { kind: 'caret', caret: caretAt(9) }, 'commit-on-blur')
      return null
    } catch (thrown) {
      return `the blur capture THREW (${msgOf(thrown)})`
    }
  })()
  if (blurAnswer !== null) findings.push(`${label} · ${blurAnswer}`)
  if (crossing.writes() - writesBeforeBlur !== 1) {
    findings.push(`${label} · the ${'`commit-on-blur`'} capture produced ${crossing.writes() - writesBeforeBlur} store write(s) — §2 pins EXACTLY ONE`)
  }
  const stored = (() => {
    try {
      return (crossing.record.readTab as AnyFn)(TAB)
    } catch (thrown) {
      return `threw: ${msgOf(thrown)}`
    }
  })()
  if (stored === null || (stored as AnyRecord)?.['caret'] === undefined) {
    findings.push(
      `${label} · the record's own \`readTab('${TAB}')\` answers ${show(stored)} after the blur — §7 (S1)(b): the capture's write must LAND in a real record over a real \`/tmp\` store, so the row cannot pass on a controller slot alone`,
    )
  }
  return { findings, crossing }
}

/** A REFERENCE region — written ONLY to prove the oracle in both directions. It is never compared with `renderer.ts`'s bytes and
 *  is never the subject of a green claim: it is the base the deleted-login mutant is cut from. */
const REFERENCE_REGION = `
export function captureStageDisplay(deps: any, entry: any, report: any, event: any): void {
  // §4's caret is the controller's OWN state MINUS \`ragId\`, and \`restoreCaret\`'s FS2 arm needs the surface subject BACK:
  // the priming therefore re-adds it, which is why the reference region spells it.
  if (report !== null && report.kind === 'caret') deps.editController.saveCaret(entry.id, Object.assign({}, report.caret, { ragId: 'page-edit-surface' }))
  if (event === null) return
  const held = deps.client.displayOf(entry.id)
  const view = report !== null && report.kind === 'view' ? report.view : held !== null && held.view !== undefined ? held.view : null
  const fresh = report !== null && report.kind === 'caret' ? report.caret : null
  const caretOut = fresh !== null ? fresh : held !== null && held.caret !== undefined ? held.caret : null
  const entryOut: any = { documentId: entry.target.documentId }
  if (caretOut !== null) entryOut.caret = caretOut
  if (view !== null) entryOut.view = view
  if (typeof deps.client.write === 'function') void deps.client.write(entry.id, entryOut)
}

export function restoreDisplayState(deps: any, entry: any): any {
  void deps
  return { reason: entry === null ? 'no-entry' : null, caretApplied: false, viewApplied: false }
}
`

describe('stage-display-record · arm (S1)(b) — the capture is DRIVEN on the production path (§7 (S1)(b))', () => {
  it('(S1b) · THE SHIPPED REGION’S CAPTURE REACHES `saveCaret` ON A REAL CONTROLLER AND LANDS ONE WRITE IN A REAL RECORD — the blur and the caret move both (§7 (S1)(b))', () => {
    const problems: string[] = []
    const extracted = extractRegion(readPath(RENDERER_PATH))
    const subject = extracted.problem !== null ? { problem: extracted.problem, region: '', declared: [], values: {} } : driveRegion(extracted.region)
    if (subject.problem !== null) {
      problems.push(`(S1b) · ${subject.problem}`)
    } else {
      const { findings } = productionPathFindings(subject, '(S1b)')
      problems.push(...findings)
    }

    expect(
      problems,
      '§7 (S1)(b) — the driven production path: the blur and the caret move reach `saveCaret`, and the write lands (docs/L1/unit-b-10-stage-display-state.md §7 (S1)(b))',
    ).toEqual([])
  })

  it('(S1b·falsifier) · THE ORACLE CAN FAIL — a region whose capture’s `saveCaret` call is DELETED reds it, so a green above is a reading and not a tautology (§7 (S1)(b))', () => {
    const problems: string[] = []

    // (1) THE REFERENCE PASSES: the oracle accepts a region that reaches `saveCaret` and lands a write.
    attempt(problems, '(S1b·falsifier)·reference', () => {
      const reference = driveRegion(REFERENCE_REGION)
      if (reference.problem !== null) return `CONTROL FAILED: the reference region was not drivable — ${reference.problem}`
      const { findings } = productionPathFindings(reference, '(reference)')
      return findings.length === 0
        ? null
        : `CONTROL FAILED: a region that plainly calls \`saveCaret\` and writes on the blur was reported as [${findings.join('; ')}] — the oracle cannot pass any input`
    })

    // (2) THE MUTANT REDS: the SAME region with the capture's `saveCaret` call deleted — §7 (S1)(b)'s own requirement.
    attempt(problems, '(S1b·falsifier)·deleted-login', () => {
      // THE MUTATION IS THE LOGIN ITSELF: the capture's `saveCaret(` CALL is deleted and the caret never reaches the slot.
      const mutated = REFERENCE_REGION.replace(/deps\.editController\.saveCaret\([^\n]*$\n/m, '  void report.caret\n')
      if (mutated === REFERENCE_REGION) return 'CONTROL FAILED: the forged mutation did not change the reference region — the deleted-login arm has no subject'
      const subject = driveRegion(mutated)
      if (subject.problem !== null) return `CONTROL FAILED: the mutated region was not drivable — ${subject.problem}`
      const { findings } = productionPathFindings(subject, '(mutant)')
      if (findings.length === 0) {
        return 'CONTROL FAILED: with the capture’s `saveCaret` CALL DELETED, the oracle stayed clean — §7 (S1)(b) requires the row to fail exactly there, or a capture that stores nothing ships green'
      }
      return findings.join(' ').includes('saveCaret')
        ? null
        : `CONTROL FAILED: the oracle reported [${findings.join('; ')}] without naming \`saveCaret\``
    })

    expect(problems, '§7 (S1)(b) — the deleted-login falsifier (docs/L1/unit-b-10-stage-display-state.md §7 (S1)(b))').toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S2·carried)` — THE LAST MOVED CARET IS CARRIED INTO THE NEXT WHOLE-ENTRY WRITE (§2, §7 `(S2)`; `B10-EX-01`)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
//
// **WHAT THIS ROW GRADES** (`docs/L1/unit-b-10-stage-display-state.md` §2's adjudication, §7 `(S2)`): *the caret is CAPTURED on
// `commit-on-blur` AND on a caret move, but a caret MOVE WRITES NOTHING — it lands in the in-memory `saveCaret` slot and is
// carried into the next whole-entry write.* So the row measures BOTH halves on the SAME sequence: 40 coalesced moves produce
// **0** writes, and the very next whole-entry writes carry the **last** caret — edge by edge — into the record's own bytes.
//
// **THE MEASURED FAULT IT CLOSES — `B10-EX-01`, and it is a MEASUREMENT rather than a hypothesis:** with a real store, the real
// delivery, a real push and the host's own page-subject hook, `commit-on-blur(offset 4)` → 40 selection moves → `scroll-settle`
// → `tab-switch` left the record holding **offset 4**. The capture composed its entry from the settled REPORT or from the
// record's HELD entry and never asked the slot, so the caret the operator had just moved to reached NO write at all — and the
// pre-fix bytes, driven through this same sequence, still print `{"documentId":"doc-a","caret":{…"offset":4…},"view":{…}}` (see
// the red-first proof quoted in the fix round's report). The slot's value was in the controller the whole time; nothing read it.
//
// **WHY THE CONTROLLER DOUBLE IS THE LIVE SHAPE, SPELLED OUT BECAUSE A PERMISSIVE DOUBLE WOULD HIDE THE FAULT:**
// `EditController.restoreCaret` is the ONLY reader of the caret slot, and its liveness verdict is the HOST's own
// (`sidebar-panes.ts`: `subject === activeTabId ? activeDocumentId : null`). At the `tab-switch` capture the strip has ALREADY
// moved its `activeId`, so `restoreCaret(<outgoing tab>)` answers `undefined` **and DELETES the slot** — the exact instant the
// outgoing tab's caret is needed is the instant that read would destroy it. This row therefore drives a REAL
// `createEditController` with exactly that hook and FLIPS the active tab before the switch (and asserts the flip is live: the
// controller answers `undefined` for the outgoing tab afterwards). An implementation that reads the slot through `restoreCaret`
// reds here; one that keeps its own read-side mirror passes — and the shipped region does the latter.
//
// **THE TEETH ARE IN-TEST AND DURABLE** (§7 `(S2)`): the SHIPPED region text with its one slot read
// (`stageDisplayLastCaret(tabId)`) replaced by `null` is driven through the SAME oracle and MUST red, naming the caret/offset
// disagreement — and if that mutation ever stops applying, the row says so LOUDLY instead of passing on a stale premise.

/** §3's SECOND tab — the one the strip ACTIVATES, which is what makes the hook's answer for the outgoing tab `null`. */
const TAB_B = 'tab-b'
const DOC_B = 'doc-b'
const TAB_B_ENTRY = { id: TAB_B, target: { kind: 'document', documentId: DOC_B }, title: 'doc-b' }

/** The 40-move sweep's LAST caret (§2's adjudication: `move → …` carries the LAST one) and the coalesced sweep's length. */
const LAST_MOVE = 39
const MOVE_COUNT = 40
/** §4's `view` — `offset` is the restore's ONLY number; `section` is an identity stamp. */
const CARRIED_VIEW = { offset: 240, section: 'sec-3' }

/** **THE CARET'S EDGES, READ ONE BY ONE** — "edge by edge" is the claim, so `anchor`'s path and offset and `focus`'s path and
 *  offset are each their own reading. A whole-object comparison would let a member's position, an extra member or a re-ordered
 *  record pass unnoticed. */
const caretEdges = (caret: unknown): string => {
  const held = (caret ?? {}) as AnyRecord
  const anchor = (held['anchor'] ?? {}) as AnyRecord
  const focus = (held['focus'] ?? {}) as AnyRecord
  return show({ anchorPath: anchor['path'], anchorOffset: anchor['offset'], focusPath: focus['path'], focusOffset: focus['offset'] })
}

interface LiveController {
  readonly controller: AnyRecord
  readonly saves: () => number
  /** The strip's activation: after this call the OUTGOING tab is no longer the active one. */
  readonly activate: (tabId: string) => void
}

/** **THE CONTROLLER IS A REAL `createEditController` WHOSE PAGE-SUBJECT HOOK IS THE HOST'S OWN** (`sidebar-panes.ts`'s
 *  `subject === activeTabId ? activeDocumentId : null`; see this arm's header for why a permissive double would hide the fault). */
function liveControllerOver(problems: string[], label: string): LiveController | null {
  const createController = readFn(editControllerModule, 'createEditController')
  if (createController === null) {
    problems.push(`${label} · \`createEditController\` does not resolve on the LANDED \`src/renderer/edit-controller.js\` — the carried caret has no slot`)
    return null
  }
  const documents: Record<string, string> = { [TAB]: DOC_A, [TAB_B]: DOC_B }
  let activeTabId = TAB
  const controller = createController({
    backRefs: new Map(),
    commit: () => Promise.resolve({ ok: true, nodeId: 'rag-a' }),
    onRebuild: () => undefined,
    pageSubjectDocument: (subjectId: string) => (subjectId === activeTabId ? (documents[activeTabId] ?? null) : null),
    isDocumentLive: (documentId: string) => documentId === DOC_A || documentId === DOC_B,
  }) as AnyRecord
  let saves = 0
  const original = (controller.saveCaret as AnyFn).bind(controller)
  controller.saveCaret = (subjectId: unknown, caret: unknown): void => {
    saves += 1
    original(subjectId, caret)
  }
  return { controller, saves: () => saves, activate: (tabId: string): void => void (activeTabId = tabId) }
}

interface CarriedReading {
  readonly writes: number
  readonly stored: unknown
  readonly fileText: string
  readonly filePath: string
  readonly admittance: unknown
  readonly slotAnswer: unknown
  readonly saves: number
}

/** **THE SEQUENCE, ON THE LIVE PATH** (`§2`, `B10-EX-01`'s measured shape): a REAL store on a `mkdtempSync` path, the REAL record
 *  over it, the REAL delivery subscribed as the client's `onChanged` (so every write PUSHES and the held shape is the re-read's
 *  own — never a harness-simulated `held`), and a REAL `createDisplayClient` whose `write` is the record's `commitTab`. Then:
 *  `commit-on-blur(offset 4)` → 40 coalesced moves (each with its own `null` event) → one `scroll-settle` → **the strip's
 *  activation, flipped BEFORE the `tab-switch` capture** → the `tab-switch` capture for the OUTGOING tab. */
async function carriedSequence(subject: RegionSubject, label: string): Promise<{ problem: string | null; reading: CarriedReading | null }> {
  const capture = typeof subject.values['captureStageDisplay'] === 'function' ? (subject.values['captureStageDisplay'] as AnyFn) : null
  if (capture === null) return { problem: 'the region resolves no drivable `captureStageDisplay` — §2\'s carried caret has no capture', reading: null }
  const crossed: string[] = []
  const crossing = buildCrossing(crossed, `${label}·crossing`)
  const live = liveControllerOver(crossed, `${label}·controller`)
  const createClient = readFn(displayClientModule, 'createDisplayClient')
  if (createClient === null) crossed.push(`${label} · \`createDisplayClient\` does not resolve — §5's sender has no client`)
  if (crossing === null || live === null || createClient === null) return { problem: crossed.join('; ') || null, reading: null }
  const controller = live.controller
  const client = createClient({
    read: () => (crossing.record.read as AnyFn).call(crossing.record),
    // THE REAL PUSH: the store's delivery is the client's change route, so a write's only correct answer — a fresh read — is
    // what moves the held shape (`B-2`'s payload-free push, `B-1`'s `fill`-wins rule).
    onChanged: (handler: () => void) => (crossing.delivery.subscribe as AnyFn).call(crossing.delivery, handler),
    write: (tabId: unknown, entry: unknown) => (crossing.record.commitTab as AnyFn)(tabId, entry),
  }) as AnyRecord
  const subscription = (client.subscribe as AnyFn)(() => undefined) as AnyRecord
  if (subscription['subscribed'] !== true) {
    return {
      problem: `${label} · the client refused its ONE subscription (reason ${show(subscription['reason'])}) — without the push the held shape never moves and this sequence is not the live one`,
      reading: null,
    }
  }
  await (client.fill as AnyFn)()
  const deps: AnyRecord = { client, editController: controller, document: null, window: null }
  const writesBefore = crossing.writes()
  const step = (report: AnyRecord, event: string | null): void => {
    capture(deps, DOCUMENT_ENTRY, report, event)
  }
  // ── 1. THE BLUR COMMITS THE CARET AT OFFSET 4 — the ONE write the sweep would otherwise leave standing.
  step({ kind: 'caret', caret: caretAt(4), blur: false, subject: TAB }, 'commit-on-blur')
  await settle()
  // ── 2. FORTY COALESCED MOVES — each reaches the slot and WRITES NOTHING (§2's adjudication).
  for (let move = 0; move < MOVE_COUNT; move += 1) {
    step({ kind: 'caret', caret: caretAt(move), blur: false, subject: TAB }, null)
  }
  // ── 3. THE SCROLL SETTLES — the first whole-entry write after the sweep.
  step({ kind: 'view', view: CARRIED_VIEW, subject: TAB }, 'scroll-settle')
  await settle()
  // ── 4. THE ACTIVATION HAS ALREADY MOVED THE STRIP, AND THEN THE OUTGOING TAB IS CAPTURED (`renderer.ts`'s own order: capture
  // ──    the outgoing tab BEFORE the mount, which is the last instant the DOM still holds it).
  live.activate(TAB_B_ENTRY.id)
  step({ kind: 'view', view: CARRIED_VIEW, subject: TAB }, 'tab-switch')
  await settle()
  let fileText: string
  try {
    fileText = readFileSync(crossing.filePath, 'utf8')
  } catch (thrown) {
    fileText = `threw: ${msgOf(thrown)}`
  }
  const readTab = () => (crossing.record.readTab as AnyFn)(TAB)
  const admittance = (() => {
    const parse = readFn(recordEngineModule, 'displayEntryIn')
    if (parse === null) return '`displayEntryIn` does not resolve on the barrel'
    try {
      return parse(readTab())
    } catch (thrown) {
      return `threw: ${msgOf(thrown)}`
    }
  })()
  const slotAnswer = (() => {
    try {
      return (controller.restoreCaret as AnyFn)(TAB)
    } catch (thrown) {
      return `threw: ${msgOf(thrown)}`
    }
  })()
  return {
    problem: null,
    reading: {
      writes: crossing.writes() - writesBefore,
      stored: readTab(),
      fileText,
      filePath: crossing.filePath,
      admittance,
      slotAnswer,
      saves: live.saves(),
    },
  }
}

/** **THE ORACLE — ONE function, TWO subjects** (the shipped region, and the shipped region with its slot read REPLACED by
 *  `null`). It grades the claim off the RECORD'S OWN BYTES: `readTab(TAB)` for the value and `provident-profile.json` on disk for
 *  the same entry's persisted bytes — never a harness's opinion of what was written. */
function carriedFindings(reading: CarriedReading, label: string): string[] {
  const findings: string[] = []
  const expectedEdges = caretEdges(caretAt(LAST_MOVE))
  const stored = reading.stored as AnyRecord | null
  // ── (1) THE CADENCE OVER THE WHOLE SEQUENCE: exactly the THREE pinned events wrote (§2).
  if (reading.writes !== 3) {
    findings.push(
      `${label} · the sequence produced ${reading.writes} store write(s) where §2 pins EXACTLY 3 (blur, scroll-settle, tab-switch) — the 40 caret MOVES write nothing, each landing in the slot and being carried into the next whole-entry write`,
    )
  }
  // ── AND THE OTHER HALF OF §2's ADJUDICATION, READ ON THE SAME RUN: every caret report reached the slot (the blur + the 40
  // ── coalesced moves), so the `0` writes above is a reading of "the move lands centrally" and not of "the move vanished".
  if (reading.saves !== MOVE_COUNT + 1) {
    findings.push(
      `${label} · the capture reached the controller's \`saveCaret\` slot ${reading.saves} time(s) where §2 pins ${MOVE_COUNT + 1} (the blur + the ${MOVE_COUNT} coalesced moves) — a caret move that never reaches the slot is the dead-\`saveCaret\` state §1 measured, and the NEXT whole-entry write would then have nothing to carry`,
    )
  }
  // ── (2) THE WHOLE ENTRY, off the record's own answer.
  if (stored === null || typeof stored !== 'object') {
    findings.push(
      `${label} · \`readTab('${TAB}')\` answers ${show(stored)} after \`move → scroll-settle → tab-switch\` — §2: the tab's display state must have been written, so the row cannot pass on a controller slot alone`,
    )
    return findings
  }
  if (stored['documentId'] !== DOC_A) {
    findings.push(`${label} · the stored entry's stamp reads ${show(stored['documentId'])} — §3: the entry's \`documentId\` is the TAB'S TARGET'S document (\`${DOC_A}\`) and only IDENTIFIES it`)
  }
  const storedCaret = stored['caret'] as AnyRecord | null | undefined
  if (storedCaret === null || storedCaret === undefined) {
    findings.push(
      `${label} · THE STORED ENTRY CARRIES NO CARET AT ALL (${show(stored)}) — §2's adjudication: a caret MOVE lands in the in-memory slot and is carried into the NEXT whole-entry write, so the offset the operator last moved to (${LAST_MOVE}) must be in the entry`,
    )
  } else {
    if (caretEdges(storedCaret) !== expectedEdges) {
      findings.push(
        `${label} · the stored caret's EDGES read ${caretEdges(storedCaret)} while the LAST MOVED caret is ${expectedEdges} — §2 and B10-EX-01: \`move → scroll-settle → tab-switch\` must carry the last MOVED caret (offset ${LAST_MOVE}) into the written entry, and a stale caret here is the offset the last blur happened to commit`,
      )
    }
    if (storedCaret['focused'] !== caretAt(LAST_MOVE)['focused']) {
      findings.push(
        `${label} · the stored caret's \`focused\` reads ${show(storedCaret['focused'])} while the last move stated ${show(caretAt(LAST_MOVE)['focused'])} — \`focused\` is its OWN reading, and §4's caret is the fork's \`CaretState\` minus \`ragId\`, member for member`,
      )
    }
  }
  const storedView = stored['view'] as AnyRecord | null | undefined
  if (storedView === null || storedView === undefined || storedView['offset'] !== CARRIED_VIEW.offset) {
    findings.push(
      `${label} · the stored entry's \`view.offset\` reads ${show(storedView?.['offset'])} where the \`scroll-settle\` stated ${CARRIED_VIEW.offset} — §2: the settle's write carries the view, and the tab-switch's whole-entry write must not lose it`,
    )
  }
  // ── (3) THE FAMILY'S OWN PARSE ADMITS IT (§3: the entry is a WHOLE one).
  const admittance = reading.admittance as AnyRecord | null
  if (admittance === null || typeof admittance !== 'object' || admittance['ok'] !== true) {
    findings.push(`${label} · \`displayEntryIn\` refuses the stored entry (${show(reading.admittance)}) — §3: what the capture writes is ONE whole entry the family's own parse admits`)
  }
  // ── (4) THE SAME ENTRY IN THE PROFILE'S OWN BYTES (the record on disk, not the API's answer).
  let parsed: unknown = null
  try {
    parsed = JSON.parse(reading.fileText)
  } catch {
    findings.push(`${label} · \`${reading.filePath}\` is not parseable JSON (${reading.fileText.slice(0, 160)}) — the profile's bytes ARE the record`)
  }
  if (parsed !== null) {
    const family = (parsed as AnyRecord)['display'] as AnyRecord | undefined
    const fileEntry = family === undefined || family === null ? undefined : (family[TAB] as AnyRecord | undefined)
    if (fileEntry === undefined) {
      findings.push(
        `${label} · the profile's bytes carry NO entry at ['display','${TAB}'] — §1/§2: every pinned event writes the WHOLE entry at that address, so its absence on disk is a write that never landed`,
      )
    } else {
      if (fileEntry['documentId'] !== DOC_A) {
        findings.push(`${label} · the profile's entry carries stamp ${show(fileEntry['documentId'])} where the tab's target is \`${DOC_A}\``)
      }
      if (caretEdges(fileEntry['caret']) !== expectedEdges) {
        findings.push(`${label} · the profile's stored caret EDGES are ${caretEdges(fileEntry['caret'])} while the last moved caret is ${expectedEdges} — the offset ${LAST_MOVE} is not in the persisted bytes`)
      }
      if (show(fileEntry['view']) !== show(stored['view'])) {
        findings.push(`${label} · the profile's entry carries view ${show(fileEntry['view'])} while the record answers ${show(stored['view'])} — the bytes and the reading must be ONE entry`)
      }
    }
  }
  return findings
}

/** The mutant's findings must NAME the fault (a generic red is not evidence the oracle saw the caret). */
const caretEdgesNamed = (named: string): boolean => /caret/i.test(named) && /offset/i.test(named)

describe('stage-display-record · arm (S2·carried) — a MOVE is carried into the next whole-entry write (§2, §7 (S2); B10-EX-01)', () => {
  it('(S2·carried) · MOVE → `scroll-settle` → `tab-switch` CARRIES THE LAST MOVED CARET (offset 39) INTO THE WRITTEN ENTRY, EDGE BY EDGE, over a REAL store + delivery + push and the HOST’S OWN page-subject hook (§2, §7 (S2))', async () => {
    const problems: string[] = []
    const extracted = extractRegion(readPath(RENDERER_PATH))
    const subject = extracted.problem !== null ? { problem: extracted.problem, region: '', declared: [], values: {} } : driveRegion(extracted.region)
    if (subject.problem !== null) {
      problems.push(`(S2·carried) · ${subject.problem}`)
    } else {
      const run = await carriedSequence(subject, '(S2·carried)')
      if (run.problem !== null) problems.push(`(S2·carried) · ${run.problem}`)
      else if (run.reading !== null) {
        problems.push(...carriedFindings(run.reading, '(S2·carried)'))
        // THE MIRROR'S OWN CONTRAST, STATED WHERE IT IS MEASURED: on this live shape the controller CANNOT answer the outgoing
        // tab's caret after the activation (`restoreCaret` answers `undefined` and DELETES the slot). That is why the region needs
        // a read-side mirror — and it is why an implementation that reads the slot through `restoreCaret` reds above.
        const slotAnswer = run.reading.slotAnswer
        attempt(problems, '(S2·carried)·slot-is-gone', () =>
          slotAnswer === undefined || slotAnswer === null
            ? null
            : `CONTROL FAILED: the LIVE hook answered ${show(slotAnswer)} for the OUTGOING tab \`${TAB}\` after the activation — \`sidebar-panes.ts\` answers \`subject === activeTabId ? activeDocumentId : null\`, so this arm is not the live shape and a permissive double would hide the very fault this row exists for`,
        )

        // ── THE TEETH, IN-TEST AND DURABLE: the SAME oracle over the SHIPPED region text with the slot read REPLACED by `null`.
        const mutated = subject.region.replace('stageDisplayLastCaret(tabId)', 'null')
        if (mutated === subject.region) {
          problems.push(
            '(S2·carried)·teeth · THE MUTATION NO LONGER APPLIES: the shipped region no longer reads `stageDisplayLastCaret(tabId)`, so this row has NO teeth and its green is a tautology — the slot read that carries the moved caret has been renamed or removed and the row must be re-cut',
          )
        } else {
          const mutant = driveRegion(mutated)
          if (mutant.problem !== null) {
            problems.push(`(S2·carried)·teeth · the mutated region was not drivable (${mutant.problem}), so the oracle cannot be proved in the red direction`)
          } else {
            const mutatedRun = await carriedSequence(mutant, '(S2·carried·mutant)')
            if (mutatedRun.problem !== null) {
              problems.push(`(S2·carried)·teeth · the mutated region's sequence could not be driven: ${mutatedRun.problem}`)
            } else if (mutatedRun.reading !== null) {
              const findings = carriedFindings(mutatedRun.reading, '(S2·carried·mutant)')
              if (findings.length === 0) {
                problems.push(
                  'CONTROL FAILED: with the slot read (`stageDisplayLastCaret(tabId)`) REPLACED by `null`, the oracle stayed CLEAN — §7 (S2) requires this row to red exactly there, or a capture that drops the last moved caret ships green',
                )
              } else {
                const named = findings.join(' ')
                if (!caretEdgesNamed(named)) {
                  problems.push(`CONTROL FAILED: the oracle reported [${named}] for the mutant without naming the caret/offset disagreement`)
                }
              }
            }
          }
        }
      }
    }

    expect(
      problems,
      '§2/§7 (S2) — the carried caret: `move → scroll-settle → tab-switch` writes the LAST MOVED caret, edge by edge, and the slot read is what carries it (docs/L1/unit-b-10-stage-display-state.md §2, §7 (S2); B10-EX-01)',
    ).toEqual([])
  })
})
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S4)` — NO CONTENT REACHES THE RECORD (§7 (S4), §3)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** §3's declared member names, at every level. They are SPELLED here because the contract spells them, and every one of them is
 *  cross-checked against the family's OWN parse below (an admitted entry can carry no name outside them), so the list can never
 *  drift from the parse it describes.
 *
 *  **THE LOOKUP IS BY THE PATH THE CENSUS DOCUMENTS, AND THAT IS THE FIX THIS ROUND'S `(S4)` NEEDED** — the map used to key the
 *  nested lists by the IMMEDIATE parent only (`anchor`, `focus`), so a stored caret's `caret.anchor.path`/`caret.anchor.offset`
 *  were read as "outside the allowlist": the parent of those members is `caret.anchor`, which the map did not state. **The row was
 *  green only while the capture DROPPED the slot's caret** — the stored entry carried `{documentId, view}` and NO `caret` at all,
 *  so its caret members were never examined. §3's list spells BOTH the bare and the entry-qualified edges (`anchor`/`caret.anchor`,
 *  `focus`/`caret.focus`), because `display-shape.ts`'s own allowlist states them at that level (`DISPLAY_EDGE_MEMBERS` for
 *  `caret.anchor` and `caret.focus`). */
const ENTRY_MEMBERS = ['documentId', 'caret', 'view'] as const
const NESTED_MEMBERS: Readonly<Record<string, readonly string[]>> = {
  caret: ['kind', 'anchor', 'focus', 'focused'],
  anchor: ['path', 'offset'],
  'caret.anchor': ['path', 'offset'],
  focus: ['path', 'offset'],
  'caret.focus': ['path', 'offset'],
  view: ['offset', 'section'],
}

/** Every own member name in one entry, with its path — the census `(S4)` reads off the STORED value. */
function namesOf(value: unknown, prefix: readonly string[] = []): Array<{ path: string; name: string }> {
  const found: Array<{ path: string; name: string }> = []
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return found
  for (const name of Object.keys(value as AnyRecord)) {
    const path = [...prefix, name]
    found.push({ path: path.join('.'), name })
    found.push(...namesOf((value as AnyRecord)[name], path))
  }
  return found
}

// **WHY THIS ROW'S CLAIM MOVED — AND WHY IT GOT STRONGER (the fix round's own record).** It was GREEN, and its green was
// VACUOUS in exactly the dimension it exists for: the capture used to compose its entry from the settled report or the record's
// HELD entry, so after a `commit-on-blur` + a `scroll-settle` the stored entry was `{documentId, view}` — **no `caret` member at
// all** — and the caret's own nested names were never once examined. The row's `NESTED_MEMBERS` lookup keyed the nested allowlist
// by the IMMEDIATE parent (`caret.anchor`) while the map only stated `anchor`, so the instant a stored caret DID arrive (the slot
// carry this round landed) `caret.anchor.path` and `caret.anchor.offset` read as "outside the allowlist". The lookup is now keyed
// by the path the census documents (§3's list, both bare and entry-qualified), AND the row states the positive shape first —
// **the stored entry must carry `documentId`, `caret` AND `view`, each asserted present** — before the name census and the value
// census run. So the row no longer measures "no forbidden name in whatever happened to be written": it measures "the WHOLE entry
// §3 declares is written, its names are §3's, and the typed document text is nowhere in the profile's bytes".
describe('stage-display-record · arm (S4) — NO CONTENT, EVER (§7 (S4), §3)', () => {
  it('(S4) · THE TYPED TEXT NEVER REACHES THE PROFILE’S BYTES — the stored entry carries `documentId`, `caret` AND `view`, its names are within §3’s allowlist, and the value census finds no document body (§7 (S4), §3)', async () => {
    const problems: string[] = []
    const extracted = extractRegion(readPath(RENDERER_PATH))
    const subject = extracted.problem !== null ? { problem: extracted.problem, region: '', declared: [], values: {} } : driveRegion(extracted.region)
    const crossing = buildCrossing(problems, '(S4)·crossing')
    const built = controllerOver(problems, '(S4)·controller')
    // The fixture caret the surface's own text node sits at — `[]`+`[0,0]` resolve to the paragraph's text node.
    const caret = { kind: 'rich', anchor: { path: [0, 0], offset: 7 }, focus: { path: [0, 0], offset: 7 }, focused: true }

    if (crossing !== null && built !== null) {
      if (subject.problem !== null) {
        problems.push(`(S4) · ${subject.problem}`)
      } else {
        const capture = typeof subject.values['captureStageDisplay'] === 'function' ? (subject.values['captureStageDisplay'] as AnyFn) : null
        const dom = makeDom()
        // THE REAL EDIT: the surface the double holds carries the typed document text, and the caret points into it.
        const client = (readFn(displayClientModule, 'createDisplayClient') as AnyFn)({
          read: () => (crossing.record.read as AnyFn).call(crossing.record),
          onChanged: () => (): void => undefined,
          write: (tabId: unknown, entry: unknown) => (crossing.record.commitTab as AnyFn)(tabId, entry),
        }) as AnyRecord
        const deps: AnyRecord = { client, editController: built.controller, document: dom.document, window: dom.window }
        attempt(problems, '(S4)·capture', () => {
          if (capture === null) return 'the region resolves no drivable `captureStageDisplay` — the write this row reads the bytes of never happens'
          capture(deps, DOCUMENT_ENTRY, { kind: 'caret', caret }, 'commit-on-blur')
          capture(deps, DOCUMENT_ENTRY, { kind: 'view', view: { offset: 40, section: 'sec-1' } }, 'scroll-settle')
          return null
        })
        await settle()

        // ── (a) THE NAME CENSUS, read off the STORE'S OWN ENTRY (not off this file's opinion of it).
        const stored = (() => {
          try {
            return (crossing.record.readTab as AnyFn)(TAB)
          } catch (thrown) {
            return `threw: ${msgOf(thrown)}`
          }
        })()
        attempt(problems, '(S4)·whole-entry', () => {
          if (stored === null || typeof stored !== 'object') {
            return `the record's \`readTab('${TAB}')\` answers ${show(stored)} — §7 (S4)'s row cannot pass by NEVER WRITING: the capture must have written an entry whose bytes are then censused`
          }
          // **THE POSITIVE SHAPE, ASSERTED BEFORE THE CENSUS**: §3's payload is `documentId` + caret + view, and a row that only
          // censused the NAMES it found would be silent about a member the capture dropped (which is exactly how this row was
          // green while the caret was missing).
          const held = stored as AnyRecord
          const missing: string[] = []
          if (typeof held['documentId'] !== 'string' || held['documentId'] === '') missing.push('`documentId`')
          if (held['caret'] === undefined || held['caret'] === null) missing.push('`caret`')
          if (held['view'] === undefined || held['view'] === null) missing.push('`view`')
          return missing.length === 0
            ? null
            : `the stored entry ${show(stored)} MISSES ${missing.join(' and ')} — §3: the whole entry is \`documentId\`, the caret the operator left and the view the stage settled at; a member the capture drops is invisible to a NAME census over what survived`
        })

        // ── (a) THE NAME CENSUS, read off the STORE'S OWN ENTRY (not off this file's opinion of it).
        attempt(problems, '(S4)·stored-entry', () => {
          if (stored === null || typeof stored !== 'object') return null
          const names = namesOf(stored)
          const outside = names.filter(({ path }) => {
            const parent = path.includes('.') ? path.slice(0, path.lastIndexOf('.')) : ''
            const allowed = parent === '' ? ENTRY_MEMBERS : NESTED_MEMBERS[parent]
            return allowed === undefined || !allowed.includes(path.slice(path.lastIndexOf('.') + 1))
          })
          return outside.length === 0
            ? null
            : `the stored entry carries [${outside.map((found) => found.path).join(', ')}] — §3: the member set is a CLOSED allowlist (\`${ENTRY_MEMBERS.join('`, `')}\` and their declared nested names) and a member outside it is document content arriving as a value`
        })

        // ── (b) THE VALUE CENSUS — the stored BYTES of `provident-profile.json`.
        attempt(problems, '(S4)·bytes', () => {
          let bytes: Buffer
          try {
            bytes = readFileSync(crossing.filePath)
          } catch (thrown) {
            return `\`${crossing.filePath}\` could not be read (${msgOf(thrown)}) — the profile's bytes ARE the census this row runs`
          }
          const text = bytes.toString('utf8')
          if (text.trim().length === 0) return `\`${crossing.filePath}\` is EMPTY — a value census over an empty file answers "no content" for free`
          if (text.includes(TYPED_TEXT)) {
            return `THE TYPED DOCUMENT TEXT IS IN THE PROFILE'S BYTES — \`${TYPED_TEXT}\` occurs in \`${crossing.filePath}\`; D-23: the entry's payload is \`documentId\` + caret + view and NOTHING else, and a smuggled body is the second authority the ruling refuses outright`
          }
          // AND THE CENSUS IS NOT VACUOUS: the file must carry the entry this row just wrote, or "no typed text" is a reading of
          // a file that never received the write.
          if (!text.includes(DOC_A)) {
            return `the profile's bytes carry no \`${DOC_A}\` — the write this row censuses never reached the file, so the absence of \`${TYPED_TEXT}\` proves nothing`
          }
          return null
        })
      }

      // ── (c) THE POSITIVE CONTROL: a forged entry carrying `content` is REFUSED by `commitTab` with its OWN reason token, so the
      // row above cannot pass by a record that writes nothing at all. (GREEN ON ARRIVAL BY DESIGN: it drives `B-1`'s LANDED parse.)
      attempt(problems, '(S4)·refusal-control', () => {
        const token = readExport(recordEngineModule, 'DISPLAY_ENTRY_MALFORMED_REASON')
        if (typeof token !== 'string') return '`DISPLAY_ENTRY_MALFORMED_REASON` does not resolve on the barrel — the control cannot read the family’s own token instead of spelling it'
        const forged = { documentId: DOC_A, content: TYPED_TEXT, caret, view: { offset: 1, section: 's' } }
        const answer = (crossing.record.commitTab as AnyFn)(TAB, forged) as AnyRecord
        const msgs: string[] = []
        if (answer?.['ok'] !== false) msgs.push(`a forged entry carrying a \`content\` member was ANSWERED ${show(answer)} — §3/D-23: an undeclared member is REFUSED, never dropped`)
        if (answer?.['reason'] !== token) msgs.push(`the refusal answered reason ${show(answer?.['reason'])} while the family's own member token is ${show(token)}`)
        const afterRefusal = readFileSync(crossing.filePath, 'utf8')
        if (afterRefusal.includes(TYPED_TEXT)) msgs.push('the refused entry still reached the profile\'s bytes — a refusal is answered BEFORE ANY STORE VERB')
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    expect(
      problems,
      '§7 (S4) — no content reaches the record: the name allowlist and the byte-level value census (docs/L1/unit-b-10-stage-display-state.md §7 (S4), §3)',
    ).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S2·gated)` — THE WRITE GATE IS THE PINNED THREE, AND A `blur: false` REPORT IS A MOVE (§2's adjudication, §7 `(S2)`)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
//
// **WHAT THIS ROW GRADES** (`docs/L1/unit-b-10-stage-display-state.md` §2's adjudication, §7 `(S2)`): `DISPLAY_WRITE_EVENTS` is
// EXACTLY the three (`tab-switch`, `commit-on-blur`, `scroll-settle` — `record.ts:53`) and a caret MOVE writes NOTHING, so the
// capture's write gate is a SET TEST over those three, and WHICH of the two arms a settle takes is the EVENT WORD the route's
// discriminator answers. Both halves are graded here, at three grains:
//   (1) **THE SHIPPED CAPTURE'S GATE**, driven over a REAL `createDisplayClient` on a COUNTING PORT and a REAL
//       `EditController`, on a DOCUMENT-target tab with a caret report: `event ∈ [null, undefined, 0, 'bogus', '', 'TAB-SWITCH']`
//       ⇒ **0** writes for EVERY one of them, while `'tab-switch'`, `'commit-on-blur'` and `'scroll-settle'` each ⇒ **exactly 1**
//       (the positive direction — a capture that never writes cannot pass by writing nothing);
//   (2) **THE SHIPPED `stageDisplayCaptureRoute`'S DISCRIMINATOR** over the twelve report shapes §4's seam can settle —
//       `caret` = `{focused:true}` / `{focused:false}` / `{focused:'yes'}` / `null`, each with `blur` ABSENT, `blur: true` and
//       `blur: false`. **THE FLAG IS THE AUTHORITY WHEN IT IS PRESENT:** `blur: true` ⇒ `'commit-on-blur'` at every shape;
//       **`blur: false` ⇒ `null` (the MOVE) at every shape — the arm the fix created**; with NO flag, `focused: true` ⇒ `null`,
//       and `focused: false` / `'yes'` / `caret: null` ⇒ `'commit-on-blur'`;
//   (3) **THE END-TO-END CONSEQUENCE**: the route's own answer fed straight into the shipped capture over the same counting port —
//       a `blur:false, focused:false` caret report produces **0** writes, a `blur:true` one **exactly 1** (and that one write
//       carries the caret it settled at, so a capture writing an empty entry is not laundered).
//
// **THE MEASURED FAULT IT CLOSES — MEASURED, not hypothesised (adversarial round 2):** the discriminator consulted `focused`
// FIRST and never read the flag's `false`, so **a `blur:false`+`focused:false` report answered `commit-on-blur` and wrote a whole
// entry** — a `selectionchange` settle on an already-unfocused surface wrote **per settle**, the exact storeroom cost `D-23`
// refuses and the thing §2's "a MOVE writes nothing" forbids; and the capture's gate was written as `event === null`, so
// `undefined`, `0` and `'bogus'` (and `''`, and a shout-cased near-miss) each produced a whole-entry write — **a FOURTH write
// trigger** beside the pinned three. So a move-shaped report wrote per settle. Both arms are graded below, in both directions.
//
// **WHY THE PORT COUNTS RATHER THAN PERSISTS, STATED BECAUSE A COUNT IS THE READING THIS ROW NEEDS:** the subject is the GATE and
// the DISCRIMINATOR, not the family's parse (the `(S3)`/`(S4)` payload rows own that), and a counting port answers on the SAME
// TICK as the capture's decision — no await, no store verb, no `/tmp` file. It is still the REAL client: `createDisplayClient`
// wraps the port, so the capture's `client.write` is §5's sender over a real client and the count is the TRANSPORT'S own.
//
// **THE TEETH ARE IN-TEST AND DURABLE, in this file's own idiom** (`(S1b·falsifier)`, `(S2·carried)·teeth`): the SHIPPED region
// text with the discriminator's `blur:false` arm DELETED, and again with the gate's SET TEST replaced by `event === null`, are
// driven through THIS SAME oracle and MUST red — naming the `blur: false` arm and an unpinned event respectively. If either
// mutation ever stops applying, the row says so LOUDLY instead of passing on a stale premise.

/** **THE COUNTING PORT** (§5's `write` member, counted): one call per capture write, plus the entries it was handed — so both the
 *  COUNT and the VALUE are read off the transport rather than off the capture's opinion of itself. */
interface CountingPort {
  readonly client: AnyRecord
  readonly writes: () => number
  readonly entries: () => AnyRecord[]
}

function countingPort(problems: string[], label: string): CountingPort | null {
  const createClient = readFn(displayClientModule, 'createDisplayClient')
  if (createClient === null) {
    problems.push(
      `${label} · \`createDisplayClient\` does not resolve on the LANDED \`src/renderer/display-client.js\` — §5's sender has no client, and the write gate has no transport to be measured on`,
    )
    return null
  }
  let writes = 0
  const entries: AnyRecord[] = []
  const client = createClient({
    read: () => Promise.resolve({}),
    onChanged: () => (): void => undefined,
    write: (_tabId: unknown, entry: unknown) => {
      writes += 1
      entries.push(entry as AnyRecord)
      return { ok: true }
    },
  }) as AnyRecord
  return { client, writes: () => writes, entries: () => entries }
}

/** **THE EVENT VALUES §2 DOES NOT PIN — every one must write NOTHING.** `null` is the caret MOVE's own word; `undefined`, `0`,
 *  `''`, `'bogus'` and the shout-cased near-miss are the values a caller reaches for when it has no event word to state, and the
 *  pre-fix gate (`event === null`) wrote a whole entry for every one of the last five. */
const UNPINNED_EVENTS: readonly unknown[] = [null, undefined, 0, 'bogus', '', 'TAB-SWITCH']
/** §2's pinned three — the ONLY values the capture may write on. */
const PINNED_EVENTS = ['tab-switch', 'commit-on-blur', 'scroll-settle'] as const

/** **THE DISCRIMINATOR'S TWELVE SHAPES, AS FOUR CARETS × THREE FLAG STATES.** `flagAbsent` is the event each shape must answer
 *  when the report carries NO `blur` member (the DOM's own answer: a caret whose `focused` is not `true` is a settle-away, and a
 *  caret report with nothing to state can only be the settle-away `B10-EX-04` exists for). */
const DISCRIMINATOR_SHAPES: readonly { readonly label: string; readonly caret: unknown; readonly flagAbsent: string | null }[] = [
  { label: 'caret:{focused:true}', caret: { focused: true }, flagAbsent: null },
  { label: 'caret:{focused:false}', caret: { focused: false }, flagAbsent: 'commit-on-blur' },
  { label: "caret:{focused:'yes'}", caret: { focused: 'yes' }, flagAbsent: 'commit-on-blur' },
  { label: 'caret:null', caret: null, flagAbsent: 'commit-on-blur' },
]

/** **THE ORACLE — ONE function, THREE subjects** (the shipped region, and the shipped region with each fault RE-INJECTED). It drives
 *  the capture's gate and the route's discriminator and answers the findings it read; nothing here knows which subject it holds. */
function gatedFindings(subject: RegionSubject, label: string): string[] {
  const problems: string[] = []
  const port = countingPort(problems, `${label}·port`)
  const built = controllerOver(problems, `${label}·controller`)
  if (subject.problem !== null) {
    problems.push(`${label} · ${subject.problem}`)
    return problems
  }
  if (port === null || built === null) return problems
  const capture = typeof subject.values['captureStageDisplay'] === 'function' ? (subject.values['captureStageDisplay'] as AnyFn) : null
  const route = typeof subject.values['stageDisplayCaptureRoute'] === 'function' ? (subject.values['stageDisplayCaptureRoute'] as AnyFn) : null
  const deps: AnyRecord = { client: port.client, editController: built.controller, document: null, window: null }
  const open = [DOCUMENT_ENTRY]
  if (capture === null) {
    problems.push(`${label} · the region resolves no drivable \`captureStageDisplay\` — §2's write gate has no capture to measure`)
    return problems
  }

  // ── (1) THE GATE, IN THE DIRECTION THE PRE-FIX BYTES GOT WRONG: six event values §2 does not pin, each on a DOCUMENT target
  // ──     with a real caret report ⇒ 0 transport calls.
  for (const event of UNPINNED_EVENTS) {
    attempt(problems, `${label}·gate[${show(event)}]`, () => {
      const before = port.writes()
      capture(deps, DOCUMENT_ENTRY, { kind: 'caret', caret: caretAt(4), subject: TAB }, event)
      const delta = port.writes() - before
      return delta === 0
        ? null
        : `a caret report under event ${show(event)} produced ${delta} store write(s) — §2 pins \`DISPLAY_WRITE_EVENTS\` at EXACTLY the three (\`tab-switch\`, \`commit-on-blur\`, \`scroll-settle\`), so the gate is a SET TEST and every other value (the MOVE's \`null\` included) writes NOTHING; a gate written as \`event === null\` writes a whole entry here`
    })
  }

  // ── AND THE POSITIVE DIRECTION, ON THE SAME SUBJECT: a capture that NEVER writes cannot pass the six legs above.
  for (const event of PINNED_EVENTS) {
    attempt(problems, `${label}·pinned[${event}]`, () => {
      const before = port.writes()
      capture(deps, DOCUMENT_ENTRY, { kind: 'caret', caret: caretAt(4), subject: TAB }, event)
      const delta = port.writes() - before
      return delta === 1
        ? null
        : `the pinned event \`${event}\` produced ${delta} store write(s) where §2 pins EXACTLY 1 whole-entry write per event — a capture that never writes is the dead-\`saveCaret\` state §1 measured, and the six 0-write legs above are a reading only if this direction holds`
    })
  }

  if (route === null) {
    problems.push(
      `${label} · the region declares no drivable \`stageDisplayCaptureRoute\` — §2/§4 make the EVENT the route's own answer, so without it a settle cannot be classified as the blur (1 write) or the move (0 writes)`,
    )
    return problems
  }

  // ── (2) THE DISCRIMINATOR — the arm the fix created is the `blur: false` row of this table.
  for (const shape of DISCRIMINATOR_SHAPES) {
    const cases: ReadonlyArray<{ readonly flag: string; readonly report: AnyRecord; readonly expect: string | null }> = [
      { flag: 'no `blur` flag', report: { kind: 'caret', caret: shape.caret, subject: TAB }, expect: shape.flagAbsent },
      { flag: '`blur: true`', report: { kind: 'caret', caret: shape.caret, blur: true, subject: TAB }, expect: 'commit-on-blur' },
      { flag: '`blur: false`', report: { kind: 'caret', caret: shape.caret, blur: false, subject: TAB }, expect: null },
    ]
    for (const one of cases) {
      attempt(problems, `${label}·route[${shape.label} · ${one.flag}]`, () => {
        const answer = route(one.report, DOCUMENT_ENTRY, open) as AnyRecord
        const event = answer['event']
        if (event === one.expect) return null
        return (
          `the route answered event ${show(event)} for ${shape.label} with ${one.flag} where §2's precedence pins ${show(one.expect)} — ` +
          'an explicit `blur: true` is a blur, an explicit `blur: false` is NOT one (the flag is the authority WHEN IT IS PRESENT), and with no flag ' +
          'a caret whose `focused` is not `true` is the settle-away while a `focused: true` caret is the MOVE that writes nothing'
        )
      })
    }
  }

  // ── (3) THE END-TO-END CONSEQUENCE — the route's OWN answer is the capture's event word, exactly as `renderer.ts`'s wiring wires it.
  attempt(problems, `${label}·end-to-end`, () => {
    const msgs: string[] = []
    const moveReport = { kind: 'caret', caret: { focused: false }, blur: false, subject: TAB }
    const blurReport = { kind: 'caret', caret: { focused: false }, blur: true, subject: TAB }
    const movesBefore = port.writes()
    const moveAnswer = route(moveReport, DOCUMENT_ENTRY, open) as AnyRecord
    if (moveAnswer['tab'] === null) {
      msgs.push(
        `the route could not address the subject \`${TAB}\` against a document-target open tab (answer ${show(moveAnswer)}) — then the 0 writes below would be a reading of a missing tab rather than of the gate`,
      )
    } else {
      capture(deps, moveAnswer['tab'], moveReport, moveAnswer['event'])
    }
    if (port.writes() !== movesBefore) {
      msgs.push(
        `a \`blur:false\`+\`focused:false\` report produced ${port.writes() - movesBefore} store write(s) — §2: that is a caret MOVE on an already-unfocused surface, so it lands in the slot and writes NOTHING; the pre-fix bytes answered \`commit-on-blur\` here and wrote a whole entry PER SETTLE`,
      )
    }
    const blursBefore = port.writes()
    const blurAnswer = route(blurReport, DOCUMENT_ENTRY, open) as AnyRecord
    if (blurAnswer['tab'] === null) {
      msgs.push(`the route could not address the subject \`${TAB}\` for the \`blur: true\` report (answer ${show(blurAnswer)})`)
    } else {
      capture(deps, blurAnswer['tab'], blurReport, blurAnswer['event'])
    }
    const delta = port.writes() - blursBefore
    if (delta !== 1) {
      msgs.push(
        `the \`blur: true\` report of the SAME shape produced ${delta} store write(s) where §2 pins EXACTLY 1 — the two reports differ ONLY in the flag, so this pair is what makes the 0 above a reading of the discriminator`,
      )
    } else {
      const written = port.entries()[port.entries().length - 1] ?? {}
      const writtenCaret = written['caret'] as AnyRecord | undefined
      if (writtenCaret === undefined || writtenCaret === null || writtenCaret['focused'] !== false) {
        msgs.push(
          `the write carried caret ${show(writtenCaret)} where the blur report settled at \`{focused:false}\` — §2: the blur's write carries the caret it settled at, so a whole-entry write with an empty caret is not the entry this row grades`,
        )
      }
      if (written['documentId'] !== DOC_A) {
        msgs.push(`the write's stamp reads ${show(written['documentId'])} where the tab's TARGET is \`${DOC_A}\` — §3: the target decides the document and the entry only IDENTIFIES it`)
      }
    }
    return msgs.length > 0 ? msgs.join('; ') : null
  })
  return problems
}

/** The discriminator's `blur:false` arm, as the shipped bytes spell it — the mutation's subject (and its own docket: if this line
 *  ever moves, the teeth say so instead of passing on a stale premise). */
const FLAG_ARM_LINE = '  if (flag === false) return false\n'
/** The gate's SET TEST, as the shipped bytes spell it — the second mutation's subject. */
const GATE_SET_TEST = "event !== 'tab-switch' && event !== 'commit-on-blur' && event !== 'scroll-settle'"

describe('stage-display-record · arm (S2·gated) — the write gate is the pinned three and a `blur:false` report is a MOVE (§2, §7 (S2))', () => {
  it('(S2·gated) · THE SHIPPED CAPTURE WRITES ON EXACTLY THE THREE PINNED EVENTS (0 for `null`/`undefined`/`0`/`\'bogus\'`/`\'\'`/`\'TAB-SWITCH\'`), THE SHIPPED ROUTE ANSWERS `null` FOR EVERY `blur:false` CARET, AND A `blur:false`+`focused:false` REPORT THEREFORE WRITES 0 (§2, §7 (S2))', () => {
    const problems: string[] = []
    const extracted = extractRegion(readPath(RENDERER_PATH))
    const subject = extracted.problem !== null ? { problem: extracted.problem, region: '', declared: [], values: {} } : driveRegion(extracted.region)
    problems.push(...gatedFindings(subject, '(S2·gated)'))

    // ── THE TEETH: each fault this row exists for is RE-INJECTED into the SHIPPED region text and driven through the SAME
    // ── oracle, which must red and name it. A mutation that no longer applies is reported as such, never silently skipped.
    if (extracted.problem === null) {
      attempt(problems, '(S2·gated)·teeth[blur:false]', () => {
        const mutated = subject.region.replace(FLAG_ARM_LINE, '')
        if (mutated === subject.region) {
          return 'THE MUTATION NO LONGER APPLIES: the shipped region no longer spells the discriminator\'s `blur: false` arm (`if (flag === false) return false`), so the flag-authority half of this row has NO teeth and its green is a tautology — the arm must be re-cut'
        }
        const mutant = driveRegion(mutated)
        if (mutant.problem !== null) return `the mutated region was not drivable (${mutant.problem}), so the oracle cannot be proved in the red direction`
        const findings = gatedFindings(mutant, '(S2·gated·mutant-flag)')
        if (findings.length === 0) {
          return 'CONTROL FAILED: with the discriminator’s `blur: false` arm DELETED the oracle stayed CLEAN — a `blur:false`+`focused:false` report would answer `commit-on-blur` and write per settle, which is the MEASURED fault this row exists for'
        }
        const named = findings.join(' ')
        return named.includes('blur: false')
          ? null
          : `CONTROL FAILED: the oracle reported [${named}] for the flag mutant without naming the \`blur: false\` arm`
      })

      attempt(problems, '(S2·gated)·teeth[gate]', () => {
        const mutated = subject.region.replace(GATE_SET_TEST, 'event === null')
        if (mutated === subject.region) {
          return 'THE MUTATION NO LONGER APPLIES: the shipped region no longer spells the capture’s gate as a SET TEST over the pinned three, so the gate half of this row has NO teeth and its green is a tautology — the gate must be re-cut'
        }
        const mutant = driveRegion(mutated)
        if (mutant.problem !== null) return `the mutated region was not drivable (${mutant.problem}), so the oracle cannot be proved in the red direction`
        const findings = gatedFindings(mutant, '(S2·gated·mutant-gate)')
        if (findings.length === 0) {
          return 'CONTROL FAILED: with the gate replaced by `event === null` the oracle stayed CLEAN — `undefined`/`0`/`\'bogus\'` would each write a whole entry, the fourth write trigger this row exists for'
        }
        const named = findings.join(' ')
        return named.includes('undefined')
          ? null
          : `CONTROL FAILED: the oracle reported [${named}] for the gate mutant without naming an unpinned event that wrote`
      })
    }

    expect(
      problems,
      '§2/§7 (S2) — the write gate is the pinned three and a `blur:false` report is a MOVE (docs/L1/unit-b-10-stage-display-state.md §2, §7 (S2))',
    ).toEqual([])
  })
})
