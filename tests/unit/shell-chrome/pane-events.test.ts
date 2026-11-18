// tests/unit/shell-chrome/pane-events.test.ts — unit `B-3` `pane-update-channel`'s CHANNEL-ALONE rows, authored BEFORE any
// byte of `src/renderer/pane-events.ts` exists (RCA-1: the red set runs first and is REPORTED before implementation).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-3-pane-update-channel.md` §2 (the channel's whole surface: `createPaneEvents()`
// → `subscribe(paneId, handler)` · `fire(paneId): FireReport` · `subscribeRecord(paneId, handler)` · `deliver(): FireReport[]`
// · `panes()` · `recordPanes()`, with `FireReport = {paneId, fired, handlers, reason:'fired'|'no-listener'}`), §6's rows
// `r3`, `r4`, `r7`'s SOURCE clause and `r9`, and `src/renderer/pane-registry.ts:93-104` — the non-starvation precedent
// ("iterate a SNAPSHOT copy … wrap each callback in try/catch so ONE throwing subscriber can never starve the rest").
//
// THE FOUR LIMBS, ONE `it` EACH, ONE AGGREGATE `expect(problems, …)` EACH:
//   `r3` — EVERY ABSENT / DEGENERATE / NON-STRING ID IS A DECLARED NO-OP. `fire` answers `{fired:false, handlers:0,
//          reason:'no-listener'}` for the empty id, whitespace, an unregistered name, `null`, `undefined`, a number, a
//          boolean, an array, a plain object, a function, a symbol and `NaN`; NOTHING throws; `subscribe` with the same
//          garbage ids answers a callable release and never throws; and none of them enters either census. POSITIVE
//          CONTROL: the same channel, one real `subscribe`, answers `{fired:true, handlers:1, reason:'fired'}` and calls the
//          handler exactly once — so `r3` cannot pass by refusing every id.
//   `r4` — A THROWING SUBSCRIBER STARVES NO OTHER. Two handlers on one id with the THROWER FIRST: the second still runs,
//          `fire` does not throw, a second pane's handler is untouched, the report counts both, and the release is
//          IDEMPOTENT (twice is total and withdraws once) and TOTAL (a release for a garbage id, called twice, never throws).
//          POSITIVE CONTROL: the same two handlers, with the first one NOT throwing, both run — so "the second ran" is not a
//          property of the harness's ordering.
//   `r7` (SOURCE CLAUSE) — `deliver()`'s BODY REACHES `fire` AND DISPATCHES NOTHING ITSELF. The reading is over
//          `src/renderer/pane-events.ts`'s own TEXT with comments stripped, and the clause is driven through TWO MUTANTS
//          FIRST — `deliver` inlined as its own private handler loop, and the real body with every `fire(` call deleted —
//          both of which must read `false`, so the clause cannot pass on any text.
//   `r9` — THE TWO CENSES. `recordPanes()` is exactly `[]` at this head AND `subscribeRecord` moves it (the positive
//          control); the two declarations DIFFER (`subscribe` moves `panes()` and never `recordPanes()`, and `deliver()`
//          never reaches a plain subscriber); `deliver()` fires exactly the record-interested panes through the same
//          registry; and both censuses are COPIES (mutating an answer never moves the channel).
//
// LAYER (MANDATORY, D-10 / `RCA-12`): every limb here is ENVELOPE-CLASS AND PURE — no Electron, no DOM, no store, no
// runtime. The file imports `node:fs` (to read `pane-events.ts`'s TEXT for `r7`) and nothing else. What this layer can
// NEVER supply, named so nobody quotes it for the unit: that a fire PAINTS a pane (file
// `tests/integration/shell-chrome/pane-update-channel.test.ts`, over the REAL `SidebarPanes` + the layout-less DOM shim),
// that the counters are `0/0/0` on the assembled host, and — beyond all of it — the rendered repaint of a REAL window,
// its geometry, its computed style and its pointer (G8's live leg alone, `docs/L1/unit-b-3-pane-update-channel.md` §8).
// NO limb here asserts a rendered geometry, a computed style or a pointer, and none can: there is no DOM in this file.
//
// REACHABILITY RULE (this file always COLLECTS and RUNS): `src/renderer/pane-events.ts` DOES NOT EXIST at this head, and
// `createPaneEvents` with it. The module is therefore reached through `await import()` inside a `try`, and every member is
// read with a `readExport`-style TYPE check: a missing module or a missing member is a NAMED problem inside that limb's
// aggregate `expect(problems, …)` — never an ESM link error, never a skip, never a raw `TypeError`. The same rule holds for
// the source clause's subject file.
//
// NON-VACUITY (mandatory, stated per limb in its own comment): every negative assertion carries a POSITIVE CONTROL beside it
// on the SAME channel, and each limb's docblock names WHICH MUTATION WOULD RED IT. No limb may pass by refusing to land.
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: it writes nothing; it reads only the repo it lives in; no network, no electron, no
// spawn, no `git`, no `vi.mock`. Every path derives from THIS FILE's own location (`ROOT`), so a missing substrate is a
// REPORTED problem rather than a silent skip.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

const PANE_EVENTS_FILE = 'src/renderer/pane-events.ts'

/** A value as a failure message prints it (never a raw `[object Object]`). */
const shown = (value: unknown): string => {
  if (value === undefined) return '(absent)'
  try {
    const json = JSON.stringify(value)
    return json === undefined ? String(value) : json
  } catch {
    return String(value)
  }
}

const fingerprint = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

// ---------------------------------------------------------------------------
// THE EXPORT READING — non-fatal by design: a missing module or a missing member is a NAMED problem in the limb's aggregate
// assertion, never a module-load error and never a raw `TypeError`. Copied in spirit from
// `tests/integration/shell-chrome/reveal-without-reassembly.test.ts`'s reachability rule.
// ---------------------------------------------------------------------------
interface ExportReading {
  value: unknown
  problems: string[]
}

function readExport(mod: Record<string, unknown> | null, name: string, file: string, limb: string): ExportReading {
  if (mod === null) {
    return {
      value: undefined,
      problems: [
        `limb ${limb}: \`${file}\` does not resolve as a module at this head, so \`${name}\` — and the whole limb with it — has ` +
          `no subject (this is the unit's NEW file, per §2: it is what the change set adds)`,
      ],
    }
  }
  let value: unknown
  try {
    value = mod[name]
  } catch {
    value = undefined
  }
  if (typeof value !== 'function') {
    return {
      value,
      problems: [
        `limb ${limb}: \`${name}\` is NOT a function on ${file} (typeof read: ${typeof value}) — the export this limb drives does ` +
          `not exist at this head, so the limb's subject is ABSENT (no arm below is skipped: every one reports the absence)`,
      ],
    }
  }
  return { value, problems: [] }
}

interface ModuleReading {
  mod: Record<string, unknown> | null
  problems: string[]
}

/** The channel module, loaded ONCE and never fatally. */
const channelModule: ModuleReading = await (async (): Promise<ModuleReading> => {
  try {
    const imported = (await import('../../../src/renderer/pane-events.js')) as Record<string, unknown>
    return { mod: imported, problems: [] }
  } catch (error) {
    return {
      mod: null,
      problems: [
        `\`${PANE_EVENTS_FILE}\` cannot be imported at this head (${String(error)}) — §2's channel is the unit's NEW module, so ` +
          `every limb below reports the absence rather than skipping`,
      ],
    }
  }
})()

/** The channel's surface, as one reading: the factory plus the five members a created channel must carry. */
interface ChannelReading {
  channel: Record<string, unknown> | null
  problems: string[]
}

const MEMBERS = ['subscribe', 'fire', 'subscribeRecord', 'deliver', 'panes', 'recordPanes'] as const

function makeChannel(limb: string): ChannelReading {
  const problems: string[] = [...channelModule.problems]
  const factory = readExport(channelModule.mod, 'createPaneEvents', PANE_EVENTS_FILE, limb)
  problems.push(...factory.problems)
  if (typeof factory.value !== 'function') return { channel: null, problems }
  let channel: unknown
  try {
    channel = (factory.value as () => unknown)()
  } catch (error) {
    problems.push(`limb ${limb}: \`createPaneEvents()\` THREW (${String(error)}) — the factory is total by §2`)
    return { channel: null, problems }
  }
  if (channel === null || typeof channel !== 'object') {
    problems.push(`limb ${limb}: \`createPaneEvents()\` answered ${shown(channel)}, not a channel object — §2's six members have no holder`)
    return { channel: null, problems }
  }
  const read = channel as Record<string, unknown>
  for (const member of MEMBERS) {
    if (typeof read[member] !== 'function') {
      problems.push(
        `limb ${limb}: the created channel carries no callable \`${member}\` (typeof read: ${typeof read[member]}) — §2 declares ` +
          `six members and every one of them is total`,
      )
    }
  }
  return { channel: typeof read['fire'] === 'function' ? read : null, problems }
}

type AnyFn = (...args: never[]) => unknown

/** Every degenerate / absent / non-string id this row drives. `undefined` and `null` are cast in: §2 makes `fire` total over
 *  whatever a caller hands it, not over its declared type. */
const GARBAGE_IDS: ReadonlyArray<{ label: string; id: unknown }> = [
  { label: "'' (the empty id)", id: '' },
  { label: "'   ' (whitespace only)", id: '   ' },
  { label: "'probe-r3-never-registered'", id: 'probe-r3-never-registered' },
  { label: 'null', id: null },
  { label: 'undefined', id: undefined },
  { label: '7 (a number)', id: 7 },
  { label: 'NaN', id: Number.NaN },
  { label: 'true (a boolean)', id: true },
  { label: "['probe-r3-array']", id: ['probe-r3-array'] },
  { label: "{ paneId: 'probe-r3-object' }", id: { paneId: 'probe-r3-object' } },
  { label: 'a function', id: () => undefined },
  { label: 'Symbol(probe-r3)', id: Symbol('probe-r3') },
]

/** The `no-listener` report §2 declares, member for member (the id's own echo is NOT pinned: a total implementation may
 *  coerce it, and the census — not the echo — is what says the id was not accepted). */
function noListenerProblems(report: unknown, label: string, where: string): string[] {
  const problems: string[] = []
  if (report === null || typeof report !== 'object') {
    problems.push(`${where}: \`fire\` for ${label} answered ${shown(report)}, not a \`FireReport\` object — §2 makes every answer a report`)
    return problems
  }
  const read = report as Record<string, unknown>
  if (read['fired'] !== false) {
    problems.push(
      `${where}: \`fire\` for ${label} answered \`fired\` = ${shown(read['fired'])}, not \`false\` — an id no pane declared interest ` +
        `in is the DECLARED no-op (§2/r3), never a throw and never a fabrication`,
    )
  }
  if (read['reason'] !== 'no-listener') {
    problems.push(
      `${where}: \`fire\` for ${label} answered \`reason\` = ${shown(read['reason'])}, not the declared word \`'no-listener'\` ` +
        `(§2's closed pair is \`'fired'\` | \`'no-listener'\`)`,
    )
  }
  if (read['handlers'] !== 0) {
    problems.push(`${where}: \`fire\` for ${label} answered \`handlers\` = ${shown(read['handlers'])}, not 0 — no handler stands for that id`)
  }
  return problems
}

// ---------------------------------------------------------------------------
// THE SOURCE READERS (r7's source clause) — a brace-matched BODY slice out of a file's TEXT with comments stripped, so the
// clause grades what the body DOES and a docblock that merely NAMES `fire` can never satisfy it.
// ---------------------------------------------------------------------------

/** The index of the `}` matching the `{` at `openIndex`, comment- and string-aware (a template literal's `${…}`
 *  interpolation is skipped as literal text, which is depth-neutral). `-1` when the text is unbalanced. */
function matchBrace(text: string, openIndex: number): number {
  let depth = 0
  let mode: 'code' | 'line' | 'block' | 'single' | 'double' | 'template' = 'code'
  let i = openIndex
  while (i < text.length) {
    const ch = text[i]!
    const two = text.slice(i, i + 2)
    if (mode === 'code') {
      if (two === '//') {
        mode = 'line'
        i += 2
        continue
      }
      if (two === '/*') {
        mode = 'block'
        i += 2
        continue
      }
      if (ch === "'") {
        mode = 'single'
        i += 1
        continue
      }
      if (ch === '"') {
        mode = 'double'
        i += 1
        continue
      }
      if (ch === '`') {
        mode = 'template'
        i += 1
        continue
      }
      if (ch === '{') depth += 1
      else if (ch === '}') {
        depth -= 1
        if (depth === 0) return i
      }
      i += 1
      continue
    }
    if (mode === 'line') {
      if (ch === '\n') mode = 'code'
      i += 1
      continue
    }
    if (mode === 'block') {
      if (two === '*/') {
        mode = 'code'
        i += 2
        continue
      }
      i += 1
      continue
    }
    if (mode === 'single' || mode === 'double') {
      if (ch === '\\') {
        i += 2
        continue
      }
      if ((mode === 'single' && ch === "'") || (mode === 'double' && ch === '"')) mode = 'code'
      i += 1
      continue
    }
    if (ch === '\\') {
      i += 2
      continue
    }
    if (ch === '`') mode = 'code'
    i += 1
  }
  return -1
}

/** The CODE of a body slice: comments replaced by spaces (`newlines` kept), string/template literals preserved. */
function stripComments(text: string): string {
  let out = ''
  let mode: 'code' | 'line' | 'block' | 'single' | 'double' | 'template' = 'code'
  let i = 0
  while (i < text.length) {
    const ch = text[i]!
    const two = text.slice(i, i + 2)
    if (mode === 'code') {
      if (two === '//') {
        mode = 'line'
        out += '  '
        i += 2
        continue
      }
      if (two === '/*') {
        mode = 'block'
        out += '  '
        i += 2
        continue
      }
      if (ch === "'") mode = 'single'
      else if (ch === '"') mode = 'double'
      else if (ch === '`') mode = 'template'
      out += ch
      i += 1
      continue
    }
    if (mode === 'line') {
      if (ch === '\n') {
        mode = 'code'
        out += '\n'
      } else out += ' '
      i += 1
      continue
    }
    if (mode === 'block') {
      if (two === '*/') {
        mode = 'code'
        out += '  '
        i += 2
        continue
      }
      out += ch === '\n' ? '\n' : ' '
      i += 1
      continue
    }
    out += ch
    if (ch === '\\') {
      out += text[i + 1] ?? ''
      i += 2
      continue
    }
    if ((mode === 'single' && ch === "'") || (mode === 'double' && ch === '"') || (mode === 'template' && ch === '`')) {
      mode = 'code'
    }
    i += 1
  }
  return out
}

/** `deliver`'s body, located by a REGEX over declarations (never a line number): an object-literal member
 *  (`deliver: () => {…}`), a typed method (`deliver(): FireReport[] {…}`), or a `const deliver = … ({…})` arrow. */
const DELIVER_ANCHORS: readonly RegExp[] = [
  // `deliver(): FireReport[] {` — a typed method (an object-literal member or a returned method)
  /\bdeliver\s*\(\s*\)\s*:\s*[^;{}\n]*\{/m,
  // `deliver() {` — an untyped method
  /\bdeliver\s*\(\s*\)\s*\{/m,
  // `deliver: (): FireReport[] => {` — an object-literal property with a return type
  /\bdeliver\s*:\s*(?:async\s*)?\(\s*\)\s*:\s*[^;{}=]*=>\s*\{/m,
  // `deliver: () => {` — an object-literal property
  /\bdeliver\s*:\s*(?:async\s*)?\(\s*\)\s*=>\s*\{/m,
  // `const deliver = (): FireReport[] => {` — a local declaration
  /\bconst\s+deliver\s*=\s*(?:async\s*)?\(\s*\)\s*(?::\s*[^;{}=]*)?=>\s*\{/m,
  // `function deliver(): FireReport[] {` — a hoisted declaration
  /\bfunction\s+deliver\s*\(\s*\)\s*(?::\s*[^;{}\n]*)?\{/m,
  // `deliver: function () {`
  /\bdeliver\s*:\s*(?:async\s*)?function\s*\(\s*\)\s*(?::\s*[^;{}\n]*)?\{/m,
]

/** An EXPRESSION-bodied declaration (`deliver: () => recordPanes().map((id) => fire(id))`) — the body is the expression, and
 *  the clause reads its tokens just the same. Tried only when no braced declaration matched. */
const DELIVER_EXPRESSION_ANCHORS: readonly RegExp[] = [
  /\bdeliver\s*:\s*(?:async\s*)?\(\s*\)\s*(?::\s*[^=\n]*)?=>\s*([^\n]*)/m,
  /\bconst\s+deliver\s*=\s*(?:async\s*)?\(\s*\)\s*(?::\s*[^=\n]*)?=>\s*([^\n]*)/m,
]

interface BodyRegion {
  body: string
  problems: string[]
}

function deliverBodyAt(limb: string): BodyRegion {
  let text: string
  try {
    text = readText(PANE_EVENTS_FILE)
  } catch (error) {
    return {
      body: '',
      problems: [
        `limb ${limb}: \`${PANE_EVENTS_FILE}\` does not exist at this head (${String(error)}) — the source clause's subject is the ` +
          `unit's NEW file, so its absence is REPORTED here rather than skipped`,
      ],
    }
  }
  for (const anchor of DELIVER_ANCHORS) {
    const match = anchor.exec(text)
    if (match === null) continue
    const open = match.index + match[0].length - 1
    const close = matchBrace(text, open)
    if (close < 0) {
      return { body: '', problems: [`limb ${limb}: \`deliver\`'s body is UNBALANCED in ${PANE_EVENTS_FILE} (no matching brace)`] }
    }
    return { body: text.slice(open, close + 1), problems: [] }
  }
  // THE EXPRESSION-BODIED FORMS, tried only after every braced declaration has failed: the body is the arrow's expression.
  for (const anchor of DELIVER_EXPRESSION_ANCHORS) {
    const match = anchor.exec(text)
    if (match === null) continue
    const expression = String(match[1] ?? '').replace(/,\s*$/, '').trim()
    if (expression.length === 0) continue
    return { body: `{ ${expression} }`, problems: [] }
  }
  return {
    body: '',
    problems: [
      `limb ${limb}: ${PANE_EVENTS_FILE} carries NO readable \`deliver\` declaration (${DELIVER_ANCHORS.length + DELIVER_EXPRESSION_ANCHORS.length} anchors read ` +
        `nothing) — §2's RECORD-arm entry has no body at this head, so the clause has no subject and says so`,
    ],
  }
}

/** `r7`'s clause, as ONE predicate so its MUTANTS can be driven against it: the body REACHES `fire(` and dispatches
 *  nothing itself — no `handler(` / `handlers[` call, i.e. no second dispatch beside the one registry's. */
function deliverBodyClauseHolds(body: string): { holds: boolean; reachesFire: boolean; secondDispatch: string[] } {
  const code = stripComments(body)
  const reachesFire = /\bfire\s*\(/.test(code)
  const secondDispatch: string[] = []
  if (/\bhandler\s*\(/.test(code)) secondDispatch.push('handler(')
  if (/\bhandlers\s*\[/.test(code)) secondDispatch.push('handlers[')
  if (/\bcallHandler\b/.test(code)) secondDispatch.push('callHandler')
  if (/\bdispatch\b/.test(code)) secondDispatch.push('dispatch')
  return { holds: reachesFire && secondDispatch.length === 0, reachesFire, secondDispatch }
}

// ---------------------------------------------------------------------------
// LIMBS
// ---------------------------------------------------------------------------
describe('pane-events — the channel alone (pure): the declared no-ops, the non-starvation, `deliver` through `fire`, and the two censes', () => {
  it('r3 — EVERY ABSENT / DEGENERATE / NON-STRING ID IS A DECLARED `no-listener` NO-OP, never a throw, with the real id painting the control', () => {
    // §6 r3 (§2's totality sentence). LAYER: envelope-class and PURE — no DOM exists in this file; the channel is a plain
    // object and the observable is its own `FireReport`.
    // NON-VACUITY: after the whole garbage sweep, the SAME channel subscribes a real id and `fire`s it — `fired:'fired'`,
    // `handlers:1`, the handler ran once — so the sweep cannot pass by a channel that refuses every id. And the two censes
    // are asserted EMPTY across the sweep, so "no throw" is not bought by silently ADMITTING a garbage id.
    // MUTATION THAT WOULD RED IT: throwing on an unknown id (the `pane-registry.ts`'s own `requireKnown` shape, which §2 says
    // this channel must NOT copy) reds the arm; answering `fired:true` for an unregistered id reds it; a `deliver()` that
    // throws on an empty record-interest set reds it.
    const problems: string[] = []
    const { channel, problems: channelProblems } = makeChannel('r3')
    problems.push(...channelProblems)
    if (channel !== null) {
      const fire = channel['fire'] as AnyFn
      const subscribe = channel['subscribe'] as AnyFn
      const deliver = channel['deliver'] as AnyFn
      const panes = channel['panes'] as AnyFn
      const recordPanes = channel['recordPanes'] as AnyFn

      // ---- THE BASELINE: an empty channel. ----------------------------------------------------
      for (const [label, read] of [
        ['panes()', panes],
        ['recordPanes()', recordPanes],
      ] as const) {
        let answer: unknown
        try {
          answer = read()
        } catch (error) {
          problems.push(`(r3) \`${label}\` on a fresh channel THREW (${String(error)}) — §2 makes both censes total`)
          continue
        }
        if (!Array.isArray(answer) || answer.length !== 0) {
          problems.push(`(r3) \`${label}\` on a fresh channel answered ${shown(answer)}, not \`[]\` — no pane has declared interest yet`)
        }
      }
      let emptyDeliver: unknown
      try {
        emptyDeliver = deliver()
      } catch (error) {
        problems.push(`(r3) \`deliver()\` over an EMPTY record-interest set THREW (${String(error)}) — §2's record arm is total, and the shipped census is declared empty (r9)`)
        emptyDeliver = undefined
      }
      if (emptyDeliver !== undefined && (!Array.isArray(emptyDeliver) || emptyDeliver.length !== 0)) {
        problems.push(`(r3) \`deliver()\` over an EMPTY record-interest set answered ${shown(emptyDeliver)}, not \`[]\``)
      }

      // ---- THE SWEEP: every degenerate id is the DECLARED no-op. ------------------------------
      for (const { label, id } of GARBAGE_IDS) {
        let report: unknown
        try {
          report = fire(id as never)
        } catch (error) {
          problems.push(
            `(r3) \`fire(${label})\` THREW (${String(error)}) — an unknown id is \`{fired:false, reason:'no-listener'}\` and NEVER a ` +
              `throw (§2, and §2 quotes \`pane-registry.ts:93-104\`'s swallow as the precedent, not its \`requireKnown\` throw)`,
          )
          continue
        }
        problems.push(...noListenerProblems(report, label, '(r3)'))
        let release: unknown
        try {
          release = subscribe(id as never, (() => undefined) as never)
        } catch (error) {
          problems.push(`(r3) \`subscribe(${label}, handler)\` THREW (${String(error)}) — a subscription is total on every id`)
          continue
        }
        if (typeof release !== 'function') {
          problems.push(`(r3) \`subscribe(${label}, handler)\` answered ${shown(release)}, not a release function — §2's release is total and idempotent`)
        } else {
          let releaseThrew = ''
          try {
            ;(release as AnyFn)()
            ;(release as AnyFn)()
          } catch (error) {
            releaseThrew = String(error)
          }
          if (releaseThrew !== '') {
            problems.push(`(r3) releasing the subscription for ${label} TWICE threw (${releaseThrew}) — §2: the release is idempotent and total`)
          }
        }
        // the census must NOT have admitted the id: a garbage id that ENTERED `panes()` would make the no-listener report a lie.
        const admitted = panes() as unknown
        if (Array.isArray(admitted)) {
          for (const entry of admitted) {
            if (typeof id !== 'string' && entry !== undefined && (entry as unknown) === (id as unknown)) {
              problems.push(`(r3) \`panes()\` carries ${label} after a subscribe+release — the census must hold no degenerate id`)
            }
          }
        }
      }
      // the censes stay empty across the sweep (positive shape of the sweep's claim)
      for (const [label, read] of [
        ['panes()', panes],
        ['recordPanes()', recordPanes],
      ] as const) {
        const answer = read() as unknown
        if (!Array.isArray(answer) || answer.length !== 0) {
          problems.push(
            `(r3) \`${label}\` reads ${shown(answer)} after the garbage sweep — every id in the sweep was subscribed-and-released or ` +
              `never registered, so NOTHING may be in the census`,
          )
        }
      }

      // ---- THE POSITIVE CONTROL: a real id on the SAME channel. -------------------------------
      const CONTROL = 'probe-r3-control'
      const controlCalls: string[] = []
      const controlRelease = subscribe(CONTROL as never, ((report: unknown) => {
        controlCalls.push(shown(report))
      }) as never)
      if (typeof controlRelease !== 'function') {
        problems.push('(r3) the CONTROL subscription answered no release — the control arm has no subject')
      }
      let controlReport: unknown
      try {
        controlReport = fire(CONTROL as never)
      } catch (error) {
        problems.push(`(r3) the CONTROL \`fire('${CONTROL}')\` THREW (${String(error)}) — a registered id must never throw either`)
        controlReport = undefined
      }
      if (controlReport !== undefined) {
        const read = (controlReport ?? {}) as Record<string, unknown>
        if (read['fired'] !== true) {
          problems.push(
            `(r3) the CONTROL fire read \`fired\` = ${shown(read['fired'])}, not \`true\` (report ${shown(controlReport)}) — with this ` +
              `arm false, the whole no-listener sweep above is satisfied by a channel that never fires anything`,
          )
        }
        if (read['reason'] !== 'fired') {
          problems.push(`(r3) the CONTROL fire read \`reason\` = ${shown(read['reason'])}, not \`'fired'\``)
        }
        if (read['handlers'] !== 1) {
          problems.push(`(r3) the CONTROL fire read \`handlers\` = ${shown(read['handlers'])}, not 1 — one handler stands on this id`)
        }
      }
      if (controlCalls.length !== 1) {
        problems.push(`(r3) the CONTROL handler was called ${controlCalls.length} time(s) for one fire, not EXACTLY ONE`)
      }
      const controlPanes = panes() as unknown
      if (!Array.isArray(controlPanes) || !controlPanes.includes(CONTROL)) {
        problems.push(`(r3) \`panes()\` reads ${shown(controlPanes)} after the CONTROL subscribe — a live subscription must be in the census`)
      }
    }

    expect(
      problems,
      `limb r3 — an unregistered id is a no-op, never a throw (§6 r3; §2's totality). ${problems.length} problem(s). Every absent ` +
        `arm of this channel is a DECLARED answer: \`{fired:false, handlers:0, reason:'no-listener'}\` for the direct arm, \`[]\` for ` +
        `\`deliver()\` over an empty record-interest set, and a callable release for every subscription. ` +
        `envelope-class and PURE — no Electron, no DOM, no runtime; the observable is the channel's own report`,
    ).toEqual([])
  })

  it('r4 — a THROWING first handler starves no second, `fire` never throws, and the release is idempotent and total', () => {
    // §6 r4 (§2's "iterate a SNAPSHOT, try/catch per handler", the `pane-registry.ts:98-105` precedent). LAYER:
    // envelope-class and PURE.
    // NON-VACUITY: after the throwing arm, the SAME two handler slots are re-driven with the first handler NOT throwing and
    // BOTH must run — so "the second ran" cannot be an artefact of the harness's registration order; and the third pane's
    // handler is asserted UNTOUCHED by this fire and then driven by its OWN fire, so "one pane's thrower did not damage another
    // pane" has a reading in both directions (⟨B3-F1⟩: the arm as authored required a fire for X to reach Y, which no faithful
    // channel can do — see the repair comment at the arm itself; no limb was dropped and the claim is strictly stronger).
    // MUTATION THAT WOULD RED IT: dropping the per-handler `try`/`catch` (one throw escapes `fire`) reds the arm; iterating
    // the LIVE array instead of a snapshot reds the self-releasing arm; a release that runs its callback twice, or one that
    // throws for an id that was never subscribed, reds the totality arms.
    const problems: string[] = []
    const { channel, problems: channelProblems } = makeChannel('r4')
    problems.push(...channelProblems)
    if (channel !== null) {
      const fire = channel['fire'] as AnyFn
      const subscribe = channel['subscribe'] as AnyFn
      const subscribeRecord = channel['subscribeRecord'] as AnyFn

      // ---- THE THROWING FIRST HANDLER ---------------------------------------------------------
      const ONE = 'probe-r4-one'
      const TWO = 'probe-r4-other'
      const order: string[] = []
      let secondRuns = 0
      let otherRuns = 0
      let selfRelease: (() => void) | null = null
      subscribe(ONE as never, (() => {
        order.push('thrower')
        throw new Error('probe-r4: the FIRST handler throws on purpose')
      }) as never)
      subscribe(ONE as never, (() => {
        order.push('second')
        secondRuns += 1
      }) as never)
      subscribe(ONE as never, (() => {
        // a handler that WITHDRAWS ITSELF mid-dispatch: §2's SNAPSHOT iteration is what keeps the arm below reachable.
        order.push('self-release')
        if (selfRelease !== null) selfRelease()
      }) as never)
      subscribe(TWO as never, (() => {
        order.push('other-pane')
        otherRuns += 1
      }) as never)

      let report: unknown
      let threw = ''
      try {
        report = fire(ONE as never)
      } catch (error) {
        threw = String(error)
      }
      if (threw !== '') {
        problems.push(
          `(r4) \`fire('${ONE}')\` THREW (${threw}) with a throwing handler registered — §2: \`fire\` NEVER throws, and each handler ` +
            `is called inside its own \`try\`/\`catch\` (\`pane-registry.ts:98-105\`)`,
        )
      }
      if (secondRuns !== 1) {
        problems.push(
          `(r4) the SECOND handler on \`${ONE}\` ran ${secondRuns} time(s), not EXACTLY ONCE, with a thrower registered FIRST — one ` +
            `throwing subscriber must starve no other (${order.length > 0 ? `dispatch order read: [${order.join(' → ')}]` : 'no handler ran at all'})`,
        )
      }
      if (!order.includes('self-release')) {
        problems.push(
          '(r4) the third handler (which releases ITSELF during dispatch) never ran — §2 pins a SNAPSHOT iteration, so a handler ' +
            'that withdraws mid-dispatch cannot shorten the pass',
        )
      }
      // ⟨B3-F1 — THE ROW'S THIRD ARM, REPAIRED IN THE ROW (a ROW defect, never a weakened claim).⟩ As authored this arm asserted
      // that the OTHER pane's handler ran EXACTLY ONCE **inside `fire(ONE)`** — i.e. that a fire for X reaches Y, which is the
      // opposite of §2's one-pane dispatch and of `r2`/`r9`, so NO faithful channel could satisfy it (the injected reference
      // implementation turned `r1`/`r2`/`r3`/`r6(i)`/`r8`/the record arm green and left this arm red). The claim the docblock
      // states is kept in full and made STRICTLY stronger: X's fire must reach NO other pane (`0`), and the other pane's own
      // fire must then reach it exactly once (`1`) — so "untouched" is a reading about dispatch and not about a dead handler.
      if (otherRuns !== 0) {
        problems.push(
          `(r4) the OTHER pane's handler ran ${otherRuns} time(s) inside \`fire('${ONE}')\`, not 0 — a fire for one pane must ` +
            `reach no other pane's handler (§2's one dispatch; the same law \`r2\` grades at the host)`,
        )
      }
      let otherReport: unknown
      try {
        otherReport = fire(TWO as never)
      } catch (error) {
        problems.push(`(r4) \`fire('${TWO}')\` THREW (${String(error)}) — a pane unaffected by another pane's thrower still fires`)
        otherReport = undefined
      }
      if (otherRuns !== 1) {
        problems.push(
          `(r4) the OTHER pane's handler ran ${otherRuns} time(s) after its OWN fire, not EXACTLY ONCE — the arm above would ` +
            `otherwise be satisfied by a handler that can never run at all`,
        )
      }
      if (otherReport !== undefined && (otherReport as Record<string, unknown>)['reason'] !== 'fired') {
        problems.push(
          `(r4) \`fire('${TWO}')\` answered ${shown(otherReport)}, not a \`'fired'\` report — the other pane's registration ` +
            `survived the thrower on a different id`,
        )
      }
      if (report !== null && typeof report === 'object') {
        const read = report as Record<string, unknown>
        if (read['fired'] !== true) {
          problems.push(`(r4) the fire over three live handlers read \`fired\` = ${shown(read['fired'])}, not \`true\` (report ${shown(report)})`)
        }
        if (read['handlers'] !== 3) {
          problems.push(`(r4) the fire read \`handlers\` = ${shown(read['handlers'])}, not 3 — the report counts the handlers that STAND on the id (the self-releasing one included: it stood when the fire began)`)
        }
      } else {
        problems.push(`(r4) the fire answered ${shown(report)}, not a \`FireReport\``)
      }

      // ---- THE POSITIVE CONTROL: the same slots, the first one NOT throwing -------------------
      const CONTROL = 'probe-r4-control'
      const controlOrder: string[] = []
      subscribe(CONTROL as never, (() => controlOrder.push('first')) as never)
      subscribe(CONTROL as never, (() => controlOrder.push('second')) as never)
      const controlReport = fire(CONTROL as never) as Record<string, unknown> | null
      if (controlOrder.length !== 2 || controlOrder[0] !== 'first' || controlOrder[1] !== 'second') {
        problems.push(
          `(r4) the CONTROL fire dispatched [${controlOrder.join(' → ')}], not exactly [first → second] — with a non-throwing first ` +
            `handler BOTH must run in REGISTRATION order, so "the second ran" above is not a property of a short-circuited pass`,
        )
      }
      if (controlReport === null || controlReport['handlers'] !== 2) {
        problems.push(`(r4) the CONTROL fire read \`handlers\` = ${shown(controlReport === null ? controlReport : controlReport['handlers'])}, not 2`)
      }

      // ---- THE RELEASE: IDEMPOTENT AND TOTAL --------------------------------------------------
      const RELEASED = 'probe-r4-released'
      let releasedRuns = 0
      const release = subscribe(RELEASED as never, (() => {
        releasedRuns += 1
      }) as never) as () => void
      if (typeof release !== 'function') {
        problems.push('(r4) `subscribe` answered no release function — the withdrawal arm has no subject')
      } else {
        let throwTwice = ''
        try {
          release()
          release()
        } catch (error) {
          throwTwice = String(error)
        }
        if (throwTwice !== '') {
          problems.push(`(r4) calling the release TWICE threw (${throwTwice}) — §2: the release is idempotent`)
        }
        releasedRuns = 0
        const afterRelease = fire(RELEASED as never) as Record<string, unknown> | null
        if (releasedRuns !== 0) {
          problems.push(`(r4) the RELEASED handler still ran ${releasedRuns} time(s) after its release — a withdrawal withdraws`)
        }
        if (afterRelease !== null && afterRelease['reason'] !== 'no-listener') {
          problems.push(
            `(r4) after the ONLY subscription on \`${RELEASED}\` was released twice, \`fire\` answered \`reason\` = ` +
              `${shown(afterRelease['reason'])}, not \`'no-listener'\` (report ${shown(afterRelease)}) — the release is TOTAL and re-arming ` +
              `the id is not one of its arms`,
          )
        }
        // the same handler slot re-subscribed afterwards still works (the release removed the registration, not the channel)
        let rearmedRuns = 0
        subscribe(RELEASED as never, (() => {
          rearmedRuns += 1
        }) as never)
        fire(RELEASED as never)
        if (rearmedRuns !== 1) {
          problems.push(`(r4) a fresh subscription on the released id ran ${rearmedRuns} time(s), not once — the release withdraws ONE registration`)
        }
      }
      // TOTAL: a release for an id whose subscription was on a DEGENERATE id, and the RECORD arm's release, both twice.
      let recordRelease: unknown
      try {
        recordRelease = subscribeRecord('probe-r4-record' as never, (() => undefined) as never)
      } catch (error) {
        problems.push(`(r4) \`subscribeRecord('probe-r4-record', …)\` THREW (${String(error)}) — the record arm's listener is as total as the direct arm's`)
      }
      if (typeof recordRelease === 'function') {
        let recordThrew = ''
        try {
          ;(recordRelease as AnyFn)()
          ;(recordRelease as AnyFn)()
        } catch (error) {
          recordThrew = String(error)
        }
        if (recordThrew !== '') {
          problems.push(`(r4) releasing a RECORD subscription twice threw (${recordThrew}) — one release law for both declarations (§2)`)
        }
      } else if (recordRelease !== undefined) {
        problems.push(`(r4) \`subscribeRecord\` answered ${shown(recordRelease)}, not a release function`)
      }
    }

    expect(
      problems,
      `limb r4 — a throwing subscriber starves no other (§6 r4; §2's SNAPSHOT iteration + per-handler \`try\`/\`catch\`, the ` +
        `\`pane-registry.ts:98-105\` precedent). ${problems.length} problem(s). ONE throwing handler, one silent victim and one ` +
        `self-releasing handler are registered on one id, and a second pane is fired in the SAME pass. ` +
        `envelope-class and PURE — no Electron, no DOM; the observables are dispatch order and the report's \`handlers\` count`,
    ).toEqual([])
  })

  it('r7 (source clause) — `deliver()`’s body REACHES `fire` and dispatches nothing itself, driven through two mutants first', () => {
    // §6 r7's SOURCE clause (§2's "ONE registry, TWO declarations, ONE dispatch — the arms cannot diverge BY CONSTRUCTION").
    // LAYER: envelope-class — a TEXT reading of `src/renderer/pane-events.ts` with comments stripped, so a docblock that
    // merely NAMES `fire` cannot satisfy the clause.
    // NON-VACUITY: the clause is driven through TWO MUTANTS FIRST — `deliver` INLINED as its own private handler loop (§2's
    // refused alternative: "the arms cannot diverge by construction" is exactly what such a loop breaks), and the REAL body
    // with every `fire(` call deleted — and BOTH must read `false`. A clause that reads `true` for either has no teeth and is
    // reported as a problem in its own right.
    // MUTATION THAT WOULD RED IT: implementing `deliver()` as its own dispatch over a second record-interested handler map
    // reds the arm (that IS the inlined mutant); a `deliver()` that returns `[]` without firing anything reds it; a
    // `deliver()` that reaches a helper which then dispatches (the `dispatch`/`callHandler` tokens) reds it.
    const problems: string[] = []
    const region = deliverBodyAt('r7')
    problems.push(...region.problems)
    if (region.body !== '') {
      const INLINED_MUTANT =
        '{\n' +
        '        const reports = []\n' +
        '        for (const id of this.recordPanes()) {\n' +
        '          const handlers = this.subscribers.get(id) ?? []\n' +
        '          for (const handler of [...handlers]) {\n' +
        '            try {\n' +
        '              handler({ paneId: id, fired: true, handlers: handlers.length, reason: "fired" })\n' +
        '            } catch {}\n' +
        '          }\n' +
        '        }\n' +
        '        return reports\n' +
        '      }'
      const inlined = deliverBodyClauseHolds(INLINED_MUTANT)
      if (inlined.holds) {
        problems.push(
          '(r7) the clause cannot fail: `deliver` INLINED as its own private handler loop reads as HOLDING — §2 refuses exactly ' +
            'that shape, because two dispatches are two authorities for one event and the arms can diverge the moment either one ' +
            'learns a rule the other does not',
        )
      }
      const fireDeleted = region.body.replace(/\bfire\s*\(/g, 'noFire(')
      const fireDeletedReading = deliverBodyClauseHolds(fireDeleted)
      if (fireDeletedReading.holds) {
        problems.push(
          '(r7) the clause cannot fail: the REAL body with every `fire(` call REPLACED still reads as HOLDING — the "reaches ' +
            '`fire`" tooth is what makes "one dispatch" a reading rather than a comment',
        )
      }
      // THEN the real body.
      const reading = deliverBodyClauseHolds(region.body)
      if (!reading.reachesFire) {
        problems.push(
          `(r7) \`deliver\`'s body names NO \`fire(\` call (body read: ${region.body.replace(/\s+/g, ' ').trim().slice(0, 400)}) — §2: ` +
            `\`deliver()\` fires every record-interested pane THROUGH \`fire\`, so the two arms cannot diverge by construction`,
        )
      }
      if (reading.secondDispatch.length > 0) {
        problems.push(
          `(r7) \`deliver\`'s body carries a SECOND dispatch: [${reading.secondDispatch.join(', ')}] — §2: "ONE registry, TWO ` +
            `declarations, ONE dispatch". A handler invoked here rather than through \`fire\` is the divergence the clause exists to ` +
            `refuse (body read: ${region.body.replace(/\s+/g, ' ').trim().slice(0, 400)})`,
        )
      }
    }

    expect(
      problems,
      `limb r7 (source clause) — the two arms cannot diverge (§6 r7; §2's ONE dispatch). ${problems.length} problem(s). The reading ` +
        `is \`${PANE_EVENTS_FILE}\`'s own TEXT with comments stripped (a body slice out of the \`deliver\` declaration, never a line ` +
        `number), and the clause is proved FALSIFIABLE by two mutants driven to \`false\` first. ` +
        `envelope-class — a SOURCE clause over a file's text; it can never show that the paint happened (that is the integration ` +
        `battery's arm) and says so`,
    ).toEqual([])
  })

  it('r9 — THE TWO CENSES: `recordPanes()` is exactly `[]` AND `subscribeRecord` moves it, and `REPLUMBED_PANE_IDS` is pinned', async () => {
    // §6 r9 (§2's "The SHIPPED record-interest set is EMPTY and it is a DECLARED census, not an accident"). LAYER:
    // envelope-class and PURE — the shipped census is a module-level fact, so the constant `REPLUMBED_PANE_IDS` is read off the
    // host module exactly as `r5`'s integration arm does.
    // NON-VACUITY: the empty census is paired with the POSITIVE CONTROL that `subscribeRecord` moves it, and with the
    // DECLARATION DIFFERENCE — `subscribe` moves `panes()` and never `recordPanes()`, `deliver()` never reaches a plain
    // subscriber — so "empty" cannot be satisfied by a channel that cannot hold a record-interest at all.
    // MUTATION THAT WOULD RED IT: shipping a record-interest set that is not `[]` (a pane registered before `B-10` authors its
    // reader) reds the first arm; a `subscribeRecord` that never marks the id reds the control; a `deliver()` that fires every
    // subscriber (folding the two declarations) reds the difference arm; returning the LIVE arrays instead of copies reds the
    // copy arm; and a `REPLUMBED_PANE_IDS` that grew to a second pane reds the constant arm.
    const problems: string[] = []
    const { channel, problems: channelProblems } = makeChannel('r9')
    problems.push(...channelProblems)
    if (channel !== null) {
      const subscribe = channel['subscribe'] as AnyFn
      const subscribeRecord = channel['subscribeRecord'] as AnyFn
      const fire = channel['fire'] as AnyFn
      const deliver = channel['deliver'] as AnyFn
      const panes = channel['panes'] as AnyFn
      const recordPanes = channel['recordPanes'] as AnyFn

      // ---- THE SHIPPED CENSUS ----------------------------------------------------------------
      const shippedRecord = recordPanes() as unknown
      if (!Array.isArray(shippedRecord) || shippedRecord.length !== 0) {
        problems.push(
          `(r9) \`recordPanes()\` on a FRESH channel reads ${shown(shippedRecord)}, not exactly \`[]\` — §2 declares the shipped ` +
            `record-interest set EMPTY (no pane renders display state today; \`B-10\` authors the FIRST reader). A non-empty census ` +
            `here is a pane that reads the record before its unit lands`,
        )
      }
      const shippedPanes = panes() as unknown
      if (!Array.isArray(shippedPanes) || shippedPanes.length !== 0) {
        problems.push(`(r9) \`panes()\` on a FRESH channel reads ${shown(shippedPanes)}, not exactly \`[]\``)
      }

      // ---- THE POSITIVE CONTROL: `subscribeRecord` MOVES IT ------------------------------------
      const RECORD = 'probe-r9-record'
      const PLAIN = 'probe-r9-plain'
      const recordRuns: string[] = []
      const plainRuns: string[] = []
      const recordRelease = subscribeRecord(RECORD as never, ((report: unknown) => {
        recordRuns.push(shown(report))
      }) as never)
      subscribe(PLAIN as never, ((report: unknown) => {
        plainRuns.push(shown(report))
      }) as never)
      if (typeof recordRelease !== 'function') {
        problems.push('(r9) `subscribeRecord` answered no release — the record arm has no withdrawal')
      }
      const movedRecord = recordPanes() as unknown
      if (!Array.isArray(movedRecord) || movedRecord.length !== 1 || movedRecord[0] !== RECORD) {
        problems.push(
          `(r9) after \`subscribeRecord('${RECORD}', handler)\`, \`recordPanes()\` reads ${shown(movedRecord)}, not exactly ` +
            `[${shown(RECORD)}] — the census CAN move, and this arm is what keeps the empty reading above from being a dead set`,
        )
      }
      const movedPanes = panes() as unknown
      if (!Array.isArray(movedPanes) || !movedPanes.includes(RECORD) || !movedPanes.includes(PLAIN)) {
        problems.push(
          `(r9) after one \`subscribeRecord\` and one \`subscribe\`, \`panes()\` reads ${shown(movedPanes)} — §2: \`subscribeRecord(id, h)\` ` +
            `is \`subscribe(id, h)\` PLUS a record-interest mark, so the handler lives in the ONE map and appears in BOTH censuses`,
        )
      }

      // ---- THE DECLARATIONS DIFFER ------------------------------------------------------------
      const deliverReports = deliver() as unknown
      if (!Array.isArray(deliverReports)) {
        problems.push(`(r9) \`deliver()\` answered ${shown(deliverReports)}, not a \`FireReport[]\``)
      } else {
        if (deliverReports.length !== 1) {
          problems.push(
            `(r9) \`deliver()\` answered ${deliverReports.length} report(s) for ONE record-interested pane (` +
              `${shown(deliverReports)}) — only the panes that DECLARED record interest are fired`,
          )
        }
        const only = deliverReports[0] as Record<string, unknown> | undefined
        if (only === undefined || only['paneId'] !== RECORD) {
          problems.push(`(r9) \`deliver()\`'s report reads ${shown(only)}, whose \`paneId\` is not \`${RECORD}\` — a plain subscriber is NOT reached by the record arm`)
        }
        if (only !== undefined && (only['fired'] !== true || only['reason'] !== 'fired' || only['handlers'] !== 1)) {
          problems.push(
            `(r9) \`deliver()\`'s report for \`${RECORD}\` reads ${shown(only)} — one standing record-interested handler is ` +
              `\`{fired:true, handlers:1, reason:'fired'}\``,
          )
        }
      }
      if (recordRuns.length !== 1) {
        problems.push(`(r9) the RECORD-declared handler ran ${recordRuns.length} time(s) for one \`deliver()\`, not exactly once`)
      }
      if (plainRuns.length !== 0) {
        problems.push(
          `(r9) the PLAIN subscriber ran ${plainRuns.length} time(s) across \`deliver()\` — §2: "A handler registered by plain ` +
            `\`subscribe\` is NOT reached by \`deliver()\`", and that difference IS the declaration of who reads the record`,
        )
      }
      // the SAME record handler IS reached by the direct arm (one registry, two declarations)
      const directReport = fire(RECORD as never) as Record<string, unknown> | null
      const directPlain = fire(PLAIN as never) as Record<string, unknown> | null
      if (recordRuns.length !== 2) {
        problems.push(
          `(r9) after \`fire('${RECORD}')\` the record-declared handler has run ${recordRuns.length} time(s) in total, not 2 — ` +
            `\`subscribeRecord\` is \`subscribe\` PLUS a mark, so the direct arm reaches it too`,
        )
      }
      if (plainRuns.length !== 1) {
        problems.push(`(r9) after \`fire('${PLAIN}')\` the plain subscriber has run ${plainRuns.length} time(s), not 2 — the direct arm reaches BOTH declarations`)
      }
      if (directReport === null || directReport['reason'] !== 'fired') {
        problems.push(`(r9) \`fire('${RECORD}')\` answered ${shown(directReport)}, not a \`'fired'\` report`)
      }
      if (directPlain === null || directPlain['reason'] !== 'fired') {
        problems.push(`(r9) \`fire('${PLAIN}')\` answered ${shown(directPlain)}, not a \`'fired'\` report`)
      }

      // ---- THE CENSUSES ARE COPIES -----------------------------------------------------------
      const liveRecord = recordPanes() as unknown
      const livePanes = panes() as unknown
      if (Array.isArray(liveRecord)) liveRecord.push('probe-r9-injected-by-a-caller')
      if (Array.isArray(livePanes)) livePanes.push('probe-r9-injected-by-a-caller')
      const afterMutation = recordPanes() as unknown
      const afterMutationPanes = panes() as unknown
      if (Array.isArray(afterMutation) && afterMutation.includes('probe-r9-injected-by-a-caller')) {
        problems.push(
          '(r9) mutating the array `recordPanes()` answered CHANGED the census — §2 pins a COPY, so a caller cannot author the ' +
            'set of panes that read the record',
        )
      }
      if (Array.isArray(afterMutationPanes) && afterMutationPanes.includes('probe-r9-injected-by-a-caller')) {
        problems.push('(r9) mutating the array `panes()` answered CHANGED the census — §2 pins a COPY here too')
      }
      if (typeof recordRelease === 'function') {
        recordRelease()
        const afterRelease = recordPanes() as unknown
        if (Array.isArray(afterRelease) && afterRelease.includes(RECORD)) {
          problems.push(
            `(r9) after the record subscription's release, \`recordPanes()\` still reads ${shown(afterRelease)} — the withdrawal ` +
              `must withdraw the MARK as well as the handler`,
          )
        }
      }
    }

    // ---- THE CONSTANT ------------------------------------------------------------------------
    // `REPLUMBED_PANE_IDS` lives on the host module (§3), which already exists; the constant is the ONE declared constant this
    // unit adds, and `r9`/`r5` both pin it so a later unit must extend it deliberately.
    let hostModule: Record<string, unknown> | null = null
    try {
      hostModule = (await import('../../../src/renderer/sidebar-panes.js')) as Record<string, unknown>
    } catch (error) {
      problems.push(`(r9) \`src/renderer/sidebar-panes.ts\` does not resolve as a module (${String(error)}) — the pinned constant's home is unreadable`)
    }
    const replumbed = hostModule === null ? undefined : hostModule['REPLUMBED_PANE_IDS']
    if (replumbed === undefined) {
      problems.push(
        '(r9) `REPLUMBED_PANE_IDS` does not resolve on `src/renderer/sidebar-panes.js` — §3 pins it as the ONE declared constant ' +
          'naming the panes whose paint the host registers on the channel (exactly `[\'gnosis-query\']`)',
      )
    } else if (!Array.isArray(replumbed) || fingerprint(replumbed) !== fingerprint(['gnosis-query'])) {
      problems.push(
        `(r9) \`REPLUMBED_PANE_IDS\` reads ${shown(replumbed)}, not exactly \`['gnosis-query']\` — §3: the set is ONE declared ` +
          `constant, so a later unit must EXTEND it deliberately and can never inherit a silent second subscriber`,
      )
    }

    expect(
      problems,
      `limb r9 — the two censes and the pinned constant (§6 r9; §2's declared-empty record interest; §3's \`REPLUMBED_PANE_IDS\`). ` +
        `${problems.length} problem(s). The shipped record-interest set is EMPTY BY CONSTRUCTION (no pane renders display state ` +
        `today; \`B-10\` authors the first reader) and the control proves it can MOVE; the two declarations reach different arms; ` +
        `both censuses are copies; and the re-plumbed census is exactly \`['gnosis-query']\`. ` +
        `envelope-class and PURE — no Electron, no DOM; the constant is read off the host MODULE's exports`,
    ).toEqual([])
  })
})
