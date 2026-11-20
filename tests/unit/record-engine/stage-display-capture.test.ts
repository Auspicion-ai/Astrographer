// tests/unit/record-engine/stage-display-capture.test.ts — unit `B-10` `stage-display-state`'s CAPTURE rows `(S2)`, `(S3)` and
// `(S1)`'s pure half, authored BEFORE any byte of the change set moves (RCA-1). Every claim below is READ off
// `docs/L1/unit-b-10-stage-display-state.md` and the section the row names.
//
// THE ROWS THIS FILE CARRIES:
//   `(S2)` §2's cadence — THE PINNED THREE AND THE MOVE THAT WRITES NOTHING. 40 coalesced caret moves ⇒ **0** writes and 40
//          captures; one `commit-on-blur` ⇒ exactly **1** whole-entry write carrying the LAST caret; one `scroll-settle` ⇒ **1**
//          write carrying `view`; one `tab-switch` ⇒ **1** whole-entry write. Plus §7 `(S2)`'s own control: **a write-count floor
//          that MOVES on the same double**, so a `0` from a counter that cannot count is not a reading.
//   `(S3)` §3's payload and stamp rule — `displayEntryFor(target, held)` answers `null` for every non-document target and the
//          capture writes NOTHING for it; `displayEntryAdmitsTab(entry, target)` admits the match and refuses `doc-b` under
//          `doc-a` and every non-document target, **with a laundered falsifier driven to red on the same oracle**.
//
// **THE SEAM THESE ROWS DRIVE, AND WHY IT IS THE CONTRACT'S:** §6 makes the capture+restore functions live in ONE markered region
// of `src/renderer/renderer.ts` (`// ⟦B-10-STAGE-DISPLAY⟧` … `// ⟦/B-10-STAGE-DISPLAY⟧`), self-contained over INJECTED
// collaborators, and makes the region **extractable and drivable** — an ABSENT region FAILS the row, never skips it. The region
// is therefore cut out of the shipped bytes, compiled with the repo's own `esbuild` and DRIVEN; nothing here is a copy. The
// region's two value exports are pinned by name: `restoreDisplayState` is §6's OWN name, and `captureStageDisplay` is this file's
// name for "the capture function" §6 names without spelling (§7 `(S1)` calls it exactly that) — the pin is stated here so the
// Implementer implements a seam instead of guessing one. The injected deps are the four collaborators §6 lists — `client` (§5),
// `editController` (§4/§6), the `document`/`window` DOM lookups (§4/`ASM-B10-2`) — plus the `host` handle §7 `(S5)`'s `INV-E`
// attribution needs (`S5`'s file reads it; the capture must reach none of it).
//
// **THE `event` PARAMETER, AND WHY THE MOVE IS `null`:** §2's four capture triggers are `tab-switch`, `commit-on-blur`,
// `scroll-settle` and *the caret move*, and `DISPLAY_WRITE_EVENTS` is pinned at EXACTLY THE THREE (`record.ts:53`), so the move
// can carry NO fourth event name: it is the `null` arm. That is the adjudication §2 states in its own words — a caret MOVE WRITES
// NOTHING, it lands in the in-memory `saveCaret` slot and is carried into the next whole-entry write.
//
// **COLOURS DECLARED AT THIS HEAD:** every row here is RED, and red for the SAME named reason — the markered region does not exist
// in `src/renderer/renderer.ts` at this head, so no capture has a body to drive — plus `(S3)`'s two `tab-state` predicates, which
// §3/§9 `O-2` add and which do not resolve yet. **GREEN ON ARRIVAL BY DESIGN** rows: the *instrument control* (a forged region
// carrying the pinned names is compiled and driven, so the absent-region red is a READING and not a broken tool) — a control that
// is red proves nothing about the oracle — and the FALSIFIER control inside `(S3)`, which is a wrong comparator being driven to
// red on purpose.
//
// **NOTHING HERE IS APP-GREEN** (`D-10`, `RCA-12`): no store is constructed, no record is written and no Electron byte is
// touched; the layer is `[T]`/envelope. `(S4)`'s real profile-byte readings and `(S1)`'s source census are
// `tests/integration/record-engine/stage-display-record.test.ts`; the restore, its drop arms and `INV-E` are
// `tests/integration/shell-chrome/stage-display-restore.test.ts`.
import { describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// LANDED modules (`B-1`'s family and client, `B-2`'s renderer seam, the fork's own controller): namespace-imported so a member
// this unit adds answers `undefined` inside the row that needs it, and never an ESM link error that kills the file.
import * as recordEngineModule from '../../../src/main/record-engine/index.js'
import * as displayClientModule from '../../../src/renderer/display-client.js'
import * as editControllerModule from '../../../src/renderer/edit-controller.js'
import * as tabStateModule from '../../../src/renderer/tab-state.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..', '..')
const RENDERER_PATH = join(ROOT, 'src', 'renderer', 'renderer.ts')

/** §6: **both markers are part of this contract's change set**, and an absent region FAILS the row that needs it. */
const REGION_OPEN = '// ⟦B-10-STAGE-DISPLAY⟧'
const REGION_CLOSE = '// ⟦/B-10-STAGE-DISPLAY⟧'
/** The region's PINNED VALUE NAMES: §6's own `restoreDisplayState`, and the capture function §6 names without spelling (§7 `(S1)`). */
const PINNED_NAMES = ['captureStageDisplay', 'restoreDisplayState'] as const

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

/** A NAMED reachability probe: an absent export answers `undefined`, never a link error. */
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

/** THE COLLECTOR: a sub-limb returns the problem TEXT when its reading is not clean and `null` when it is; a throw before the
 *  reading completes is itself a named problem. One aggregate assertion per `it`. */
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

/** One settled turn: `fill()` is a promise and the client's listener re-reads inside one. */
const settle = (): Promise<void> => new Promise((done) => setTimeout(done, 0))

// ─── the extract-and-drive instrument (`B-2` §5 `(c)`'s instrument, applied to §6's region) ──────────────────────────

const requireFromHere = createRequire(import.meta.url)

/** The repo's own `esbuild` — the same bundler `npm run build` uses, so the region is compiled by the toolchain that ships it. */
function esbuildTransform(): ((input: string, options: AnyRecord) => { code: string }) | null {
  try {
    const loaded = requireFromHere('esbuild') as { transformSync?: (input: string, options: AnyRecord) => { code: string } }
    return typeof loaded.transformSync === 'function' ? loaded.transformSync : null
  } catch {
    return null
  }
}

interface RegionSubject {
  readonly problem: string | null
  /** The shipped bytes of the region, quoted in failure messages so a reader sees WHAT was driven. */
  readonly region: string
  /** The top-level names the region declares — the diagnosis a "no pin" problem reports. */
  readonly declared: readonly string[]
  readonly values: AnyRecord
}

/** Cut the region out of `src/renderer/renderer.ts`'s bytes. An absent, inverted or empty region is a NAMED problem. */
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
        `${openAt < 0 && closeAt < 0 ? 'are' : 'is'} ABSENT — the stage's display state has no capture body and no restore body, so ` +
        `\`saveCaret\` still has no production caller (§1's finding) and no caret or scroll is ever written`,
    }
  }
  if (closeAt <= openAt) {
    return { region: '', problem: 'the `B-10` markers are inverted — the region between them is empty and nothing can be driven' }
  }
  const region = raw.slice(openAt + REGION_OPEN.length, closeAt)
  if (region.trim().length === 0) {
    return { region, problem: `the region between \`${REGION_OPEN}\` and \`${REGION_CLOSE}\` is EMPTY — §6 puts the capture and the restore there` }
  }
  return { region, problem: null }
}

/** The region's PINNED NAMES, read off its OWN text (types erase, so the VALUE readings are taken after the compile). */
function pinReport(region: string): string[] {
  const missing: string[] = []
  for (const name of PINNED_NAMES) {
    const declared =
      new RegExp(`(?:^|\\n)\\s*(?:(?:export\\s+)?(?:async\\s+)?function\\s+${name}\\b|(?:export\\s+)?const\\s+${name}\\b)`).test(region)
    if (!declared) missing.push(`the region declares no \`${name}\``)
  }
  return missing
}

/** The COMPILE-AND-DRIVE half over any region text — the shipped bytes by `stageDisplaySubject()`, a forged region by the
 *  control rows, so the instrument is proved before its red is believed. */
function driveRegion(region: string): RegionSubject {
  const declared = [
    ...[...region.matchAll(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm)].map((m) => m[1] as string),
    ...[...region.matchAll(/^(?:export\s+)?const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*(?::[^=\n]+)?=/gm)].map((m) => m[1] as string),
  ]
  const missing = pinReport(region)
  if (missing.length > 0) {
    return {
      problem: `§6/§7 pin the region's names and it misses ${missing.join(' and ')} — the region declares [${declared.join(', ') || 'nothing'}]`,
      region,
      declared,
      values: {},
    }
  }
  const transformSync = esbuildTransform()
  if (transformSync === null) {
    return {
      problem:
        'the repo\'s own `esbuild` did not resolve through `createRequire` — the region cannot be COMPILED, and this row refuses to copy it by hand (a copy would be a second capture, not the shipped one)',
      region,
      declared,
      values: {},
    }
  }
  const probe = `\n;module.exports.__b10Region = { ${declared
    .map((name) => `'${name}': typeof ${name} !== 'undefined' ? ${name} : undefined`)
    .join(', ')} }`
  let compiled: string
  try {
    compiled = transformSync(`${region}${probe}`, { loader: 'ts', format: 'cjs', target: 'node20' }).code
  } catch (thrown) {
    return { problem: `the extracted region does not COMPILE (${msgOf(thrown)}) — the shipped bytes are the subject`, region, declared, values: {} }
  }
  const moduleObject: { exports: AnyRecord } = { exports: {} }
  const requireStub = (specifier: string): never => {
    throw new Error(
      `the markered region requires ${show(specifier)}; the extract-and-drive harness supplies no modules — §6's region must be self-contained over INJECTED collaborators`,
    )
  }
  try {
    // eslint-disable-next-line no-new-func
    const run = new Function('exports', 'require', 'module', 'console', 'document', 'window', compiled) as AnyFn
    // THE DOM GLOBALS ARE ABSENT ON PURPOSE at this layer: §4's layout-less shim supplies neither `getSelection` nor a scroll
    // box, so a region that reaches a GLOBAL instead of the injected lookup is caught here rather than in the app.
    run(moduleObject.exports, requireStub, moduleObject, console, undefined, undefined)
  } catch (thrown) {
    return { problem: `the compiled region THREW while being evaluated (${msgOf(thrown)}) — the capture cannot be driven`, region, declared, values: {} }
  }
  const values = (moduleObject.exports.__b10Region ?? {}) as AnyRecord
  const absent = PINNED_NAMES.filter((name) => typeof values[name] !== 'function')
  return {
    problem:
      absent.length > 0
        ? `the region declares ${absent.join(' and ')} but not as VALUE(s) the probe could resolve — a type-only declaration cannot be driven`
        : null,
    region,
    declared,
    values,
  }
}

/** The shipped subject: `src/renderer/renderer.ts`'s markered region, cut and driven. */
function stageDisplaySubject(): RegionSubject {
  const extracted = extractRegion(readPath(RENDERER_PATH))
  if (extracted.problem !== null) return { problem: extracted.problem, region: extracted.region, declared: [], values: {} }
  return driveRegion(extracted.region)
}

// ─── the cadence's own subject: a REAL controller, a REAL client, a counting PORT ───────────────────────────────────

/** §2/§3's fixtures. The tab is the ADDRESS SEGMENT and never a stored `tabId` (`display-shape.ts`'s header). */
const TAB = 'tab-a'
const DOC_A = 'doc-a'
const DOC_B = 'doc-b'
const DOCUMENT_ENTRY = { id: TAB, target: { kind: 'document', documentId: DOC_A }, title: 'doc-a' }

/** One `DisplayCaret` at a given offset — the family's caret vocabulary minus `ragId` (§4). */
const caretAt = (offset: number): AnyRecord => ({
  kind: 'rich',
  anchor: { path: [0, 1], offset },
  focus: { path: [0, 1], offset },
  focused: true,
})

/** **THE CARET'S CORE — §4's `DisplayCaret` IS `CaretState` MINUS `ragId`**, and `restoreCaret`'s FS2 arm needs the surface id
 *  BACK (`edit-controller.ts:276-279` drops a `rich` caret whose `ragId` is not `page-edit-surface`). So the capture's priming must
 *  re-add the subject and the record's own caret never carries it: every comparison below is over the CORE, never over the
 *  subject the family does not state. */
const caretCore = (caret: unknown): string => {
  const record = (caret ?? {}) as AnyRecord
  return show({ kind: record['kind'], anchor: record['anchor'], focus: record['focus'], focused: record['focused'] })
}

interface CaptureHarness {
  readonly deps: AnyRecord
  readonly capture: AnyFn | null
  readonly saves: () => readonly AnyRecord[]
  readonly writes: () => readonly { tabId: unknown; entry: unknown }[]
  readonly controller: AnyRecord
  readonly client: AnyRecord
  /** The client's OWN `write` route, so `§5`'s member is a named problem and not a crash. */
  readonly clientWrite: AnyFn | null
  readonly region: string
}

/** **THE HARness §2 MEASURES, BUILT FROM LANDED MODULES ONLY** — the real `createEditController`, the real
 *  `createDisplayClient` over a counting port. Nothing here is a mock framework: `vi.mock` appears nowhere in this file. The
 *  port's `write` is the transport the client's §5 member is expected to reach, so the cadence is counted where a write really
 *  leaves this realm. */
async function captureHarness(problems: string[], label: string, reading: AnyRecord | null = null): Promise<CaptureHarness | null> {
  const subject = stageDisplaySubject()
  if (subject.problem !== null) {
    problems.push(`${label} · ${subject.problem}`)
    return null
  }
  const createClient = readFn(displayClientModule, 'createDisplayClient')
  const createController = readFn(editControllerModule, 'createEditController')
  if (createClient === null || createController === null) {
    problems.push(
      `${label} · \`createDisplayClient\`/\`createEditController\` do not both resolve on the LANDED renderer modules — §2's cadence has no client and no controller to measure`,
    )
    return null
  }
  const writes: { tabId: unknown; entry: unknown }[] = []
  const port: AnyRecord = {
    read: () => reading,
    onChanged: () => (): void => undefined,
    write: (tabId: unknown, entry: unknown) => {
      writes.push({ tabId, entry })
      return Promise.resolve({ ok: true })
    },
  }
  const client = createClient(port) as AnyRecord
  await (client.fill as AnyFn)()
  const controller = createController({
    backRefs: new Map(),
    commit: () => Promise.resolve({ ok: true, nodeId: 'rag-a' }),
    onRebuild: () => undefined,
    pageSubjectDocument: (subjectId: string) => (subjectId === TAB ? DOC_A : null),
    isDocumentLive: (documentId: string) => documentId === DOC_A || documentId === DOC_B,
  }) as AnyRecord
  const saves: AnyRecord[] = []
  const original = (controller.saveCaret as AnyFn).bind(controller)
  controller.saveCaret = (subjectId: unknown, caret: unknown): void => {
    saves.push({ subjectId, caret })
    original(subjectId, caret)
  }
  const deps: AnyRecord = { client, editController: controller, document: null, window: null }
  return {
    deps,
    capture: typeof subject.values['captureStageDisplay'] === 'function' ? (subject.values['captureStageDisplay'] as AnyFn) : null,
    saves: () => saves,
    writes: () => writes,
    controller,
    client,
    clientWrite: readFn(client, 'write'),
    region: subject.region,
  }
}

/** One capture turn, with §5's `write` member's absence named ONCE rather than as a crash per turn. */
function captureTurn(problems: string[], label: string, harness: CaptureHarness, entry: AnyRecord, report: AnyRecord, event: string | null): void {
  attempt(problems, label, () => {
    if (harness.capture === null) return 'the region resolves no `captureStageDisplay` value — §7 `(S1)` has no capture function to drive'
    ;(harness.capture as AnyFn)(harness.deps, entry, report, event)
    return null
  })
}

/** The whole-entry write's own admission test: **the family's ONE parse judges what was written**, so "one whole entry" is a
 *  reading of `displayEntryIn` and not of this file's opinion. */
function admittedByFamily(problems: string[], label: string, entry: unknown): void {
  const parse = readFn(recordEngineModule, 'displayEntryIn')
  attempt(problems, label, () => {
    if (parse === null) return '§3\'s ONE parse (`displayEntryIn`) does not resolve on the barrel — the written entry cannot be judged'
    const answer = parse(entry) as AnyRecord
    return answer.ok === true ? null : `the written entry ${show(entry)} is REFUSED by the family's own parse (${show(answer)}) — §2 pins a WHOLE entry, and a partial or off-family value is not one`
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// CONTROL — THE INSTRUMENT (a control is GREEN ON ARRIVAL BY DESIGN: a red control proves nothing about the oracle)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('stage-display-capture · the instrument — the region is COMPILED AND DRIVEN, never copied (§6)', () => {
  it('(S2·instrument) · A FORGED REGION CARRYING THE PINNED NAMES COMPILES AND IS DRIVEN, so the absent-region red above is a reading and not a broken tool (§6, §7)', () => {
    const problems: string[] = []
    /** A forgery written ONLY to prove the instrument — never the subject, never compared with `renderer.ts`'s bytes. */
    const forged = `
export function captureStageDisplay(deps: unknown, entry: unknown, report: unknown, event: unknown): void {
  void deps
  void entry
  void report
  void event
}

export function restoreDisplayState(deps: unknown, entry: unknown): unknown {
  void deps
  return { reason: entry === null ? 'no-entry' : null, caretApplied: false, viewApplied: false }
}
`
    attempt(problems, 'S2·instrument', () => {
      const subject = driveRegion(forged)
      if (subject.problem !== null) return `INSTRUMENT CONTROL FAILED: the forged region was not drivable — ${subject.problem}`
      const msgs: string[] = []
      for (const name of PINNED_NAMES) {
        if (typeof subject.values[name] !== 'function') msgs.push(`the forged region's \`${name}\` did not resolve as a value`)
      }
      const answer = (subject.values['restoreDisplayState'] as AnyFn)({}, null) as AnyRecord
      if (answer['reason'] !== 'no-entry') msgs.push(`the driven restore answered ${show(answer)} for a null entry — the instrument is not reaching the body`)
      // AND THE PIN DISCRIMINATES IN THE OTHER DIRECTION: the same instrument over a region with the RIGHT shape under the
      // WRONG names must be REFUSED by name, or a pin that accepts everything is indistinguishable from no pin at all.
      const misnamed = forged.replace(/captureStageDisplay/g, 'forgedCapture').replace(/restoreDisplayState/g, 'forgedRestore')
      const refused = driveRegion(misnamed)
      if (refused.problem === null) msgs.push('CONTROL FAILED: a region with the right shape under the WRONG names passed the pin — a rename would satisfy §6\'s seam')
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(problems, '§6 — the extract-and-drive instrument, proved in both directions (docs/L1/unit-b-10-stage-display-state.md §6)').toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S2)` — THE CADENCE IS THE PINNED THREE, AND A MOVE WRITES NOTHING (§2)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('stage-display-capture · arm (S2) — the cadence (§2)', () => {
  it('(S2·moves) · 40 COALESCED CARET MOVES ⇒ 0 WRITES AND 40 CAPTURES, and the LAST caret is what the slot holds (§2’s adjudication)', async () => {
    const problems: string[] = []
    const harness = await captureHarness(problems, '(S2·moves)', { [TAB]: { documentId: DOC_A } })
    if (harness !== null) {
      attempt(problems, '(S2·moves)·write-member', () =>
        harness.clientWrite === null
          ? '§5 pins the client’s `write(tabId, entry)` member and the LANDED client does not state it — the capture has no route to the record, and every cadence arm below would measure nothing'
          : null,
      )
      for (let move = 0; move < 40; move += 1) {
        captureTurn(problems, `(S2·moves)·${move}`, harness, DOCUMENT_ENTRY, { kind: 'caret', caret: caretAt(move) }, null)
      }
      attempt(problems, '(S2·moves)·writes', () =>
        harness.writes().length === 0
          ? null
          : `§2's adjudication: a caret MOVE WRITES NOTHING — 40 coalesced moves produced ${harness.writes().length} write(s) [${harness
              .writes()
              .map((write) => show(write.entry))
              .join(', ')}]; a per-move store write is exactly the cost D-23 refused`,
      )
      attempt(problems, '(S2·moves)·captures', () =>
        harness.saves().length === 40
          ? null
          : `§2 pins 40 captures for 40 coalesced moves and the capture landed ${harness.saves().length} in the in-memory \`saveCaret\` slot — the move arm must reach the controller and write nothing`,
      )
      attempt(problems, '(S2·moves)·last', () => {
        const saved = harness.controller.restoreCaret === undefined ? undefined : (harness.controller.restoreCaret as AnyFn)(TAB)
        const expected = caretAt(39)
        return caretCore(saved) === caretCore(expected)
          ? null
          : `the controller answers ${show(saved)} after the sweep while the LAST move stated ${show(expected)} — §2: the move lands in the \`saveCaret\` slot, so the slot carries the last caret (and §4's caret is the controller's OWN state minus \`ragId\`, so the priming must re-add the surface subject)`
      })
    }

    expect(problems, '§2 — 40 coalesced caret moves, 0 writes, 40 captures (docs/L1/unit-b-10-stage-display-state.md §2)').toEqual([])
  })

  it('(S2·blur) · ONE `commit-on-blur` ⇒ EXACTLY 1 WHOLE-ENTRY WRITE CARRYING THE LAST CARET (§2)', async () => {
    const problems: string[] = []
    const harness = await captureHarness(problems, '(S2·blur)', { [TAB]: { documentId: DOC_A } })
    if (harness !== null) {
      // THREE MOVES, THEN THE BLUR: the moves write nothing, so the ONE write the blur produces is the whole reading.
      for (let move = 0; move < 3; move += 1) {
        captureTurn(problems, `(S2·blur)·move${move}`, harness, DOCUMENT_ENTRY, { kind: 'caret', caret: caretAt(move) }, null)
      }
      captureTurn(problems, '(S2·blur)·blur', harness, DOCUMENT_ENTRY, { kind: 'caret', caret: caretAt(2) }, 'commit-on-blur')

      attempt(problems, '(S2·blur)·count', () =>
        harness.writes().length === 1
          ? null
          : `§2 pins EXACTLY ONE write for one \`commit-on-blur\` and the capture produced ${harness.writes().length} — the cadence is one write per EVENT, never per keystroke and never per member`,
      )
      const write = harness.writes()[0]
      attempt(problems, '(S2·blur)·address', () =>
        write !== undefined && write.tabId === TAB
          ? null
          : `the write addressed ${show(write?.tabId)} — the entry lands at \`['display', <tabId>]\`, so the tab id is the ADDRESS SEGMENT and the whole entry goes to this one leaf`,
      )
      attempt(problems, '(S2·blur)·caret', () => {
        const entry = write?.entry as AnyRecord | undefined
        return entry !== undefined && show(entry['caret']) === show(caretAt(2))
          ? null
          : `the written entry carries caret ${show(entry?.['caret'])} while the LAST stated caret is ${show(caretAt(2))} — §2's adjudication: the move's slot is what the next whole-entry write carries`
      })
      attempt(problems, '(S2·blur)·documentId', () => {
        const entry = write?.entry as AnyRecord | undefined
        return entry !== undefined && entry['documentId'] === DOC_A
          ? null
          : `the written entry's \`documentId\` reads ${show(entry?.['documentId'])} — §3: the entry's stamp is the TAB'S TARGET'S document, which is the whole reason the restore can refuse a mismatch`
      })
      if (write !== undefined) admittedByFamily(problems, '(S2·blur)·whole-entry', write.entry)
    }

    expect(problems, '§2 — one `commit-on-blur`, exactly one write carrying the last caret (docs/L1/unit-b-10-stage-display-state.md §2)').toEqual([])
  })

  it('(S2·scroll) · ONE `scroll-settle` ⇒ 1 WRITE CARRYING `view` (§2, §4)', async () => {
    const problems: string[] = []
    const harness = await captureHarness(problems, '(S2·scroll)', { [TAB]: { documentId: DOC_A } })
    const view = { offset: 240, section: 'sec-3' }
    if (harness !== null) {
      captureTurn(problems, '(S2·scroll)', harness, DOCUMENT_ENTRY, { kind: 'view', view }, 'scroll-settle')
      attempt(problems, '(S2·scroll)·count', () =>
        harness.writes().length === 1
          ? null
          : `§2 pins ONE write per \`scroll-settle\` and the capture produced ${harness.writes().length} — the scroll half is a settle, never a stream`,
      )
      const write = harness.writes()[0]
      attempt(problems, '(S2·scroll)·view', () => {
        const entry = write?.entry as AnyRecord | undefined
        return entry !== undefined && show(entry['view']) === show(view)
          ? null
          : `the written entry carries view ${show(entry?.['view'])} while the settle reported ${show(view)} — §4's two members are \`offset\` (the restore's ONLY number) and \`section\` (an identity stamp only)`
      })
      if (write !== undefined) admittedByFamily(problems, '(S2·scroll)·whole-entry', write.entry)
    }

    expect(problems, '§2/§4 — one `scroll-settle`, one write carrying `view` (docs/L1/unit-b-10-stage-display-state.md §2, §4)').toEqual([])
  })

  it('(S2·switch) · ONE `tab-switch` ⇒ 1 WHOLE-ENTRY WRITE FOR THE OUTGOING TAB (§2)', async () => {
    const problems: string[] = []
    const harness = await captureHarness(problems, '(S2·switch)', { [TAB]: { documentId: DOC_A } })
    if (harness !== null) {
      // §2: the tab-switch capture runs BEFORE the mount, because the DOM still holds the OUTGOING tab's caret/scroll.
      captureTurn(problems, '(S2·switch)', harness, DOCUMENT_ENTRY, { kind: 'caret', caret: caretAt(11) }, 'tab-switch')
      attempt(problems, '(S2·switch)·count', () =>
        harness.writes().length === 1
          ? null
          : `§2 pins ONE whole-entry write for \`tab-switch\` and the capture produced ${harness.writes().length} — the whole entry is replaced in one act, never member by member`,
      )
      const write = harness.writes()[0]
      attempt(problems, '(S2·switch)·address', () =>
        write !== undefined && write.tabId === TAB ? null : `the tab-switch write addressed ${show(write?.tabId)}; §1/§2 put the entry at \`['display', <tabId>]\` for the OUTGOING tab`,
      )
      attempt(problems, '(S2·switch)·documentId', () => {
        const entry = write?.entry as AnyRecord | undefined
        return entry !== undefined && entry['documentId'] === DOC_A
          ? null
          : `the tab-switch entry's stamp reads ${show(entry?.['documentId'])} — §3: the stamp is the outgoing tab's TARGET's document, and it only IDENTIFIES that document`
      })
      if (write !== undefined) admittedByFamily(problems, '(S2·switch)·whole-entry', write.entry)
    }

    expect(problems, '§2 — one `tab-switch`, one whole-entry write (docs/L1/unit-b-10-stage-display-state.md §2)').toEqual([])
  })

  it('(S2·floor) · THE WRITE-COUNT FLOOR MOVES ON THE SAME DOUBLE — a forged capture that writes on every move must move the counter that read 0 (§7 (S2))', async () => {
    const problems: string[] = []
    const harness = await captureHarness(problems, '(S2·floor)', { [TAB]: { documentId: DOC_A } })
    if (harness !== null) {
      attempt(problems, '(S2·floor)·control', () => {
        if (harness.clientWrite === null) {
          return 'the client’s §5 `write` member does not resolve, so the counter’s liveness cannot be proved — a `0` from a counter that cannot count is not a reading'
        }
        // THE FORGED CAPTURE: the SAME port, the SAME client, the SAME 40 turns — only the policy differs (it writes per move).
        for (let move = 0; move < 40; move += 1) void harness.clientWrite({ ...DOCUMENT_ENTRY }.id, { documentId: DOC_A, caret: caretAt(move) })
        return harness.writes().length === 40
          ? null
          : `CONTROL FAILED: a forged per-move writer produced ${harness.writes().length} write(s) through the same port/client, not 40 — the "0 writes" claim in ` +
              '`(S2·moves)` is then vacuous, because the counter cannot see a write at all'
      })
    }

    expect(problems, '§7 (S2) — the write-count floor moves on the same double (docs/L1/unit-b-10-stage-display-state.md §7 (S2))').toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S3)` — THE PAYLOAD AND THE STAMP RULE (§3)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('stage-display-capture · arm (S3) — `displayEntryFor` and the stamp rule (§3)', () => {
  it('(S3·entryFor) · A NON-DOCUMENT TARGET ANSWERS `null` AND THE CAPTURE WRITES NOTHING FOR IT (§3)', async () => {
    const problems: string[] = []
    const displayEntryFor = readFn(tabStateModule, 'displayEntryFor')
    if (displayEntryFor === null) {
      problems.push(
        '§3/§9 `O-2` put `displayEntryFor(target, held)` in `src/renderer/tab-state.ts` as a PURE predicate and the module does not state it — the capture half has no law to build an entry by',
      )
    } else {
      attempt(problems, '(S3·entryFor)·null-arm', () => {
        const targets = [
          { kind: 'search', queryId: 'search-1' },
          { kind: 'graph', view: 'graph-1' },
          { kind: 'template', templateId: 'template-1' },
          { kind: 'other', id: 'landing' },
        ]
        const msgs: string[] = []
        for (const target of targets) {
          const answer = displayEntryFor(target, { documentId: DOC_A })
          if (answer !== null) {
            msgs.push(`\`displayEntryFor(${show(target)}, …)\` answered ${show(answer)} — §3: ONLY a \`document\`-target tab has an entry, because \`documentId\` is a required non-empty string and a non-document tab cannot be stated without spelling the tab id into it (the REFUSED alternative)`)
          }
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })

      attempt(problems, '(S3·entryFor)·document-arm', () => {
        const target = { kind: 'document', documentId: DOC_A }
        const held = { documentId: DOC_A, caret: caretAt(4), view: { offset: 90, section: 'sec-2' } }
        const answer = displayEntryFor(target, held) as AnyRecord | null
        if (answer === null) return '§3: a `document` target with a held entry answered `null` — the ledger that writes the caret would have nothing to write'
        const msgs: string[] = []
        if (answer['documentId'] !== DOC_A) msgs.push(`the entry's stamp reads ${show(answer['documentId'])} — §3: the stamp is the TAB'S TARGET'S document, and the held entry only identifies it`)
        if (show(answer['caret']) !== show(held.caret)) msgs.push(`the entry carries caret ${show(answer['caret'])} while the held reading states ${show(held.caret)} — §2: the whole entry carries the captured caret`)
        if (show(answer['view']) !== show(held.view)) msgs.push(`the entry carries view ${show(answer['view'])} while the held reading states ${show(held.view)} — §2: the whole entry carries the captured view`)
        const bare = displayEntryFor(target, null) as AnyRecord | null
        if (bare === null || bare['documentId'] !== DOC_A) msgs.push(`\`displayEntryFor(target, null)\` answered ${show(bare)} — a fresh tab has no held reading and still states its document`)
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    // AND THE CAPTURE WRITES NOTHING FOR A NON-DOCUMENT TAB: §3 makes the refusal a WRITE-SIDE fact, not a document-only nicety.
    const harness = await captureHarness(problems, '(S3·entryFor·write)', { [TAB]: { documentId: DOC_A } })
    if (harness !== null) {
      const searchEntry = { id: TAB, target: { kind: 'search', queryId: 'search-1' }, title: 'Search: search-1' }
      captureTurn(problems, '(S3·entryFor·write)', harness, searchEntry, { kind: 'caret', caret: caretAt(3) }, 'commit-on-blur')
      attempt(problems, '(S3·entryFor·write)·count', () =>
        harness.writes().length === 0
          ? null
          : `§3: a non-document tab's capture wrote ${harness.writes().length} entr(ies) [${harness
              .writes()
              .map((write) => show(write.entry))
              .join(', ')}] — \`displayEntryFor\` answers \`null\` there and the capture writes NOTHING`,
      )
    }

    expect(problems, '§3 — only a document target has an entry (docs/L1/unit-b-10-stage-display-state.md §3)').toEqual([])
  })

  it('(S3·stamp) · THE STAMP RULE — admit the match, REFUSE `doc-b` under `doc-a`, REFUSE every non-document target; and a LAUNDERED comparator REDS the same oracle (§3)', () => {
    const problems: string[] = []
    const admits = readFn(tabStateModule, 'displayEntryAdmitsTab')
    if (admits === null) {
      problems.push(
        '§3/§9 `O-2` put `displayEntryAdmitsTab(entry, target)` in `src/renderer/tab-state.ts` (PURE, the whole stamp rule in one place) and the module does not state it — the restore has no law to drop a mismatched entry by',
      )
    }

    /** **THE ORACLE — ONE function, TWO subjects**: §3's whole rule as a list of findings, driven over the shipped predicate by
     *  the row and over a LAUNDERED one by the falsifier. A comparator that folds the two refusals reports here by name. */
    const stampFindings = (comparator: AnyFn, label: string): string[] => {
      const findings: string[] = []
      const match = { documentId: DOC_A }
      const documentA = { kind: 'document', documentId: DOC_A }
      const documentB = { kind: 'document', documentId: DOC_B }
      const nonDocument = [
        { kind: 'search', queryId: 'search-1' },
        { kind: 'graph', view: 'graph-1' },
        { kind: 'template', templateId: 'template-1' },
        { kind: 'other', id: 'landing' },
      ]
      const read = (entry: unknown, target: unknown): unknown => {
        try {
          return comparator(entry, target)
        } catch (thrown) {
          return `threw: ${msgOf(thrown)}`
        }
      }
      if (read(match, documentA) !== true) {
        findings.push(`${label}: the MATCH (\`doc-a\` under a \`doc-a\` target) answered ${show(read(match, documentA))} — §3's rule is \`true\` IFF \`target.kind === 'document' && entry.documentId === target.documentId\`, so a comparator that refuses the match restores nothing at all`)
      }
      if (read({ documentId: DOC_B }, documentA) !== false) {
        findings.push(`${label}: an entry stamped \`doc-b\` under a \`doc-a\` target was ADMITTED — §3: a mismatched stamp is a DROP (no caret, no scroll, and the document shown is still the TARGET'S); a stamp NEVER redirects`)
      }
      for (const target of nonDocument) {
        if (read(match, target) !== false) {
          findings.push(`${label}: a \`${String((target as AnyRecord)['kind'])}\` target ADMITTED the entry — §3: ONLY a \`document\`-target tab has an entry, so every other kind is a drop by the same rule`)
        }
      }
      return findings
    }

    if (admits !== null) {
      attempt(problems, '(S3·stamp)·shipped', () => {
        const findings = stampFindings(admits, 'the shipped `displayEntryAdmitsTab`')
        return findings.length > 0 ? findings.join('; ') : null
      })
    }

    // **THE FALSIFIER, DRIVEN TO RED FIRST: A LAUNDERED COMPARATOR.** It "cleans" the stamp by admitting any string
    // `documentId`, which is the exact fault §3 exists to forbid — the stamp laundered into a mere shape check. If the oracle
    // above cannot red THIS, its green over the shipped predicate is worth nothing. (GREEN ON ARRIVAL BY DESIGN: a control.)
    attempt(problems, '(S3·stamp)·laundered', () => {
      const laundered: AnyFn = (entry: unknown) => {
        const record = entry as AnyRecord | null
        return record !== null && typeof record === 'object' && typeof record['documentId'] === 'string'
      }
      const findings = stampFindings(laundered, 'the LAUNDERED comparator')
      if (findings.length === 0) {
        return 'CONTROL FAILED: a LAUNDERED comparator (any string `documentId` is admitted, the target is ignored) PASSED the oracle — a `doc-b` entry under a `doc-a` tab would restore into the wrong document and this row would stay green'
      }
      const named = findings.join(' ')
      return /doc-b/.test(named) && /document/.test(named) ? null : `CONTROL FAILED: the oracle reported [${named}] without naming the mismatched stamp`
    })

    expect(problems, '§3 — the stamp rule and its laundered falsifier (docs/L1/unit-b-10-stage-display-state.md §3)').toEqual([])
  })

  it('(S3·alias) · THE TWO PREDICATES AGREE — `displayEntryFor` builds only entries the stamp rule admits (§3, §9 `O-3`)', () => {
    const problems: string[] = []
    const displayEntryFor = readFn(tabStateModule, 'displayEntryFor')
    const admits = readFn(tabStateModule, 'displayEntryAdmitsTab')
    if (displayEntryFor === null || admits === null) {
      problems.push('§3 adds BOTH `displayEntryFor` and `displayEntryAdmitsTab` to `src/renderer/tab-state.ts` and the module does not state both — the capture and the restore would then agree by luck rather than by one rule')
    } else {
      attempt(problems, '(S3·alias)', () => {
        const targets = [
          { kind: 'document', documentId: DOC_A },
          { kind: 'document', documentId: DOC_B },
          { kind: 'search', queryId: 'search-1' },
          { kind: 'other', id: 'landing' },
        ]
        const msgs: string[] = []
        for (const target of targets) {
          const built = displayEntryFor(target, { documentId: DOC_A, caret: caretAt(1) }) as unknown
          const admitted = admits(built, target)
          if (built === null) {
            if (admitted !== false) msgs.push(`\`displayEntryFor(${show(target)}, …)\` answered \`null\` while the stamp rule ADMITTED that null under the same target — the two halves disagree`)
            continue
          }
          if (admitted !== true) msgs.push(`\`displayEntryFor(${show(target)}, …)\` built ${show(built)} and \`displayEntryAdmitsTab\` REFUSED it — §3: what the capture writes must be what the restore admits, or a write is silently unrestorable`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    expect(problems, '§3/§9 O-3 — the capture predicate and the restore predicate are one rule (docs/L1/unit-b-10-stage-display-state.md §3, §9)').toEqual([])
  })
})

// A single settled turn is enough for the client's listener; the cadence rows above assert synchronously where they can.
void settle
