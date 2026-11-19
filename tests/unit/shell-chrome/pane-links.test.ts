// tests/unit/shell-chrome/pane-links.test.ts — unit `B-5` `pane-links`'s SOURCE-CLAUSE row, authored BEFORE any byte of the
// unit's landing (RCA-1: the red set runs first and is REPORTED before implementation).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-5-pane-links.md`
//   §2   `src/main/backlinks.ts` HAS NO DETECTION PATH — it is a PURE, read-only enumeration over `RagStore.listEdges()` and it
//        "cannot know that a backlink is NEW: it answers the same list before and after". The map's "a backlink detected by the
//        edit/traversal path" is true of the TREE but the detector is a `src/main` WRITE path, NOT this module — so this file owes
//        ZERO byte and this row pins that as a text clause over its own CODE: no `setEdge`, no `putEdge`, no `broadcast`, no
//        `IPC_`, and no `detect`.
//   §2/§4 the LEARNER is `SidebarPanes.onRagStoreChanged`, and the fire lives THERE, on the declared predicate
//        `Array.isArray(payload.edgeIds) && payload.edgeIds.length > 0`, BEFORE `requestRebuild('content')` — the ordering is
//        load-bearing (the fire's IPC is issued first, so the re-read's commit precedes the re-derive's assemble).
//   §4   `src/renderer/pane-events.ts` owes ZERO byte and that is a DECISION: the fire carries no payload BY CONSTRUCTION, the
//        links pane is a DIRECT-arm pane (`subscribe`, not `subscribeRecord`), and a per-pane payload type would be the second
//        authority that module's own docblock refuses. The pinned census is therefore the module's EXPORT LIST — EXACTLY five
//        names (`createPaneEvents`, `PaneEvents`, `FireReport`, `PaneUpdateReason`, `PaneUpdateVerdict`). **IF THE LANDING ADDS AN
//        EXPORT, THIS ROW MUST RED** — that is the whole point of pinning the list rather than one name: a `BacklinkPaneFire`
//        payload type, a second dispatch, or a per-pane reader table is the fault this clause exists to catch.
//   §4   `recordPanes()` stays `[]` — `B-10` authors the FIRST reader (`O-4`), and the record arm is NOT this unit's (D-23: a
//        backlink is CONTENT, and the record's payload is display state only).
//
// THE ROW IS TEXT + ONE LIVE CHANNEL: three clauses read `src/**`'s own TEXT (comments STRIPPED, so a docblock may name the seam it
// is refusing without reddening the clause) and one clause drives the REAL `createPaneEvents()` for the record census. Comments
// are stripped for exactly one reason, stated so nobody mistakes it for convenience: the rule is about the CODE — a comment in
// `backlinks.ts` saying "the detection lives elsewhere" is the CONTRACT's own sentence, and a raw-text search would red honest
// documentation and reward silent prose.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): ENVELOPE-CLASS AND PURE — no Electron, no DOM, no store, no runtime. This file imports
// `node:fs` (for the three source clauses) and `pane-events.ts` (for the record census) and nothing else. What this layer can NEVER
// read, named so nobody quotes it: that a fire PAINTS the pane, that the re-read is ONE `rag.backlinks` call, that every other root
// is the same object, or that the counters are `0/0/0` — all of that lives in
// `tests/integration/shell-chrome/pane-links.test.ts` over the REAL `SidebarPanes` + the layout-less DOM shim, and the rendered
// repaint of a REAL window lives in `docs/L1/unit-b-5-pane-links.md` §8's assembled-app limb (`G8`) alone.
//
// REACHABILITY RULE (this file always COLLECTS and RUNS): every subject is reached through `readFileSync`/`await import()` inside a
// `try`, and a missing subject is a NAMED problem inside the row's ONE aggregate `expect(problems, …)` — never an ENOENT crash,
// never an ESM link error, never a skip, never a raw `TypeError`.
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: it writes nothing; it reads only the repo it lives in; no network, no electron, no spawn,
// no `git`, no `vi.mock`. Every path derives from THIS FILE's own location (`ROOT`), so a missing substrate is a REPORTED problem
// rather than a silent skip.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { createPaneEvents } from '../../../src/renderer/pane-events.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

const BACKLINKS_FILE = 'src/main/backlinks.ts'
const SIDEBAR_FILE = 'src/renderer/sidebar-panes.ts'
const PANE_EVENTS_FILE = 'src/renderer/pane-events.ts'

/** §2: the detection seam is NOT `backlinks.ts`; the tokens that would make it one. */
const FORBIDDEN_BACKLINKS_TOKENS: readonly string[] = ['setEdge', 'putEdge', 'broadcast', 'IPC_', 'detect']

/** §4: `pane-events.ts`'s pinned EXPORT LIST — five names and no sixth. A landing that adds one MUST red this row. */
const PINNED_PANE_EVENTS_EXPORTS: readonly string[] = [
  'createPaneEvents',
  'FireReport',
  'PaneEvents',
  'PaneUpdateReason',
  'PaneUpdateVerdict',
]

/** How far below `onRagStoreChanged`'s declaration the fire's body is read. §4 keeps the handler ONE accumulation + the fire + the
 *  rebuild request; the window is generous so a comment or a multi-line condition cannot push an arm out of the reading, and small
 *  enough that a fire in a DIFFERENT handler cannot be mistaken for this one. */
const HANDLER_WINDOW_LINES = 70

/** Strip `/* … *​/` blocks and `//` line comments while respecting string/template literals — the clauses below are about the CODE,
 *  and the contract's own sentences are allowed to live in prose. */
function stripComments(text: string): string {
  let out = ''
  let quote: string | null = null
  let index = 0
  while (index < text.length) {
    const char = text[index]
    const next = text[index + 1]
    if (quote !== null) {
      out += char
      if (char === '\\') {
        out += text[index + 1] ?? ''
        index += 2
        continue
      }
      if (char === quote) quote = null
      index += 1
      continue
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char
      out += char
      index += 1
      continue
    }
    if (char === '/' && next === '*') {
      const close = text.indexOf('*/', index + 2)
      if (close < 0) break
      // Keep the newlines so the line window below still counts lines.
      out += text.slice(index, close + 2).replace(/[^\n]/g, '')
      index = close + 2
      continue
    }
    if (char === '/' && next === '/') {
      const close = text.indexOf('\n', index)
      if (close < 0) break
      index = close
      continue
    }
    out += char
    index += 1
  }
  return out
}

/** The `export`ed NAMES of a module's TEXT (types, interfaces, functions, consts, classes) — the census §4 pins. */
function exportedNames(text: string): string[] {
  const names = new Set<string>()
  const pattern = /^\s*export\s+(?:declare\s+)?(?:default\s+)?(?:abstract\s+)?(?:interface|type|function|const|let|var|class|enum)\s+([A-Za-z0-9_$]+)/gm
  let match = pattern.exec(text)
  while (match !== null) {
    names.add(match[1])
    match = pattern.exec(text)
  }
  return [...names].sort()
}

describe('pane-links — the contract\'s zero-byte claims, its seam, its export census and its empty record census (source + one live channel)', () => {
  it('S1 — `backlinks.ts` is a pure enumeration, the fire lives in `onRagStoreChanged` behind the `edgeIds` predicate before the rebuild, `pane-events.ts` exports EXACTLY five names, and `recordPanes()` stays `[]`', () => {
    // §2's `F-1` (the detector is NOT the enumeration), §4's ZERO-byte decision for `pane-events.ts`, §2's declared predicate and
    // §4's load-bearing ORDER inside `onRagStoreChanged`, and `O-4`'s `recordPanes()` pin.
    // NON-VACUITY: the export census is floored by asserting the FIVE pinned names are all PRESENT (so "exactly five" cannot pass
    // on an unreadable/empty module), the `edgeIds` clause is floored by asserting the same handler still carries
    // `requestRebuild('content')` AFTER the fire (the fire is ADDITIVE — `ASM-B5-2` — so the clause reads an ORDER, not a
    // replacement), and the record census is floored by driving the REAL channel (`panes()`/`fire()` answer on the same instance)
    // before `recordPanes()` is read as empty.
    // MUTATION THAT WOULD RED IT: giving `backlinks.ts` a write/broadcast or a `detect` reds clause 1 (and would be the second
    // authority §2 refuses); moving the fire out of `onRagStoreChanged`, dropping the `edgeIds.length > 0` predicate, or firing
    // AFTER the rebuild reds clause 2; adding ANY export to `pane-events.ts` (a payload type, a second dispatch, a reader table)
    // reds clause 3 — that is why the list is pinned rather than one name; subscribing a record-interest handler in this unit reds
    // clause 4.
    const problems: string[] = []

    // ---- CLAUSE 1: `src/main/backlinks.ts` IS A PURE ENUMERATION (§2's `F-1`; ZERO byte owed) --------
    let backlinksText = ''
    try {
      backlinksText = readText(BACKLINKS_FILE)
    } catch (error) {
      problems.push(`clause 1: \`${BACKLINKS_FILE}\` is unreadable (${String(error)}) — the pure-enumeration clause has no subject`)
    }
    if (backlinksText !== '') {
      const code = stripComments(backlinksText)
      const found = FORBIDDEN_BACKLINKS_TOKENS.filter((token) => code.includes(token))
      if (found.length > 0) {
        problems.push(
          `clause 1: \`${BACKLINKS_FILE}\`'s CODE carries ${found.map((token) => `\`${token}\``).join(', ')} — §2: this module is a ` +
            `PURE, read-only enumeration over \`RagStore.listEdges()\` (\`listBacklinks\`/\`listOutlinks\`/\`enumerateLinks\`) with no ` +
            `store WRITE, no broadcast and NO detection path (it answers the same list before and after a new edge). The detector is ` +
            `a \`src/main\` write path and the learner is the renderer host: a detection bolted onto an enumeration would be a SECOND ` +
            `authority over the same fact (§2's refused alternative (b))`,
        )
      }
      // The enumeration's own three exports, so the clause cannot pass on a module that stopped enumerating.
      for (const name of ['listBacklinks', 'listOutlinks', 'enumerateLinks']) {
        if (!code.includes(`function ${name}`)) {
          problems.push(`clause 1: \`${BACKLINKS_FILE}\` no longer declares \`function ${name}\` — the enumeration the pane's ONE re-read answers through has moved`)
        }
      }
    }

    // ---- CLAUSE 2: THE FIRE IS `onRagStoreChanged`'s, BEHIND THE `edgeIds` PREDICATE, BEFORE THE REBUILD ------
    let sidebarText = ''
    try {
      sidebarText = readText(SIDEBAR_FILE)
    } catch (error) {
      problems.push(`clause 2: \`${SIDEBAR_FILE}\` is unreadable (${String(error)}) — the seam clause has no subject`)
    }
    if (sidebarText !== '') {
      const code = stripComments(sidebarText)
      const lines = code.split('\n')
      const at = lines.findIndex((line) => /onRagStoreChanged\s*\(\s*payload\b/.test(line))
      if (at < 0) {
        problems.push(
          `clause 2: no \`onRagStoreChanged(payload…)\` declaration was found in \`${SIDEBAR_FILE}\` — §2 names that handler as the ONE ` +
            `site where the renderer learns that an edge moved, and \`B-5\`'s fire belongs THERE`,
        )
      } else {
        const windowLines = lines.slice(at, at + HANDLER_WINDOW_LINES)
        const window = windowLines.join('\n')
        const fireAt = window.search(/\.\s*fire\s*\(/)
        const rebuildAt = window.search(/requestRebuild\s*\(\s*'content'\s*\)/)
        const edgeIdsAt = window.search(/edgeIds/)
        const lengthAt = window.search(/length\s*(?:>|!==)\s*0/)
        const isArrayAt = window.search(/Array\s*\.\s*isArray\s*\(\s*payload\s*\.\s*edgeIds\s*\)/)
        if (fireAt < 0) {
          problems.push(
            `clause 2: \`onRagStoreChanged\`'s body carries NO \`fire(\` call within ${HANDLER_WINDOW_LINES} lines of its ` +
              `declaration — §2/§4: the learner FIRES the \`crosslinks\` pane there (before the rebuild request), so the pane re-reads ` +
              `because it HEARD, never because something re-assembled the tree`,
          )
        }
        // §2 DECLARES the predicate verbatim as \`Array.isArray(payload.edgeIds) && payload.edgeIds.length > 0\`. The GRADED property is
        // the CONTROL (an \`edgeIds\` length guard), because an equivalent spelling (\`payload.edgeIds?.length > 0\`) is the same
        // control and a clause that pinned the letter would red a correct landing; the contract's exact spelling is still printed in the
        // failure message as the preferred form, and \`isArray\` is reported so a reader can see which spelling landed.
        if (edgeIdsAt < 0 || lengthAt < 0) {
          problems.push(
            `clause 2: \`onRagStoreChanged\`'s body does not carry §2's DECLARED predicate ` +
              `(\`Array.isArray(payload.edgeIds) && payload.edgeIds.length > 0\`; read edgeIds=${edgeIdsAt >= 0} ` +
              `isArray=${isArrayAt >= 0} length>0=${lengthAt >= 0}) — an unconditional fire would paint on every CONTENT-ONLY commit ` +
              `(\`edgeIds: []\`, the \`IPC_EDIT_COMMIT\` shape) and the predicate is the whole control`,
          )
        }
        if (rebuildAt < 0) {
          problems.push(
            `clause 2: \`onRagStoreChanged\` no longer calls \`requestRebuild('content')\` — \`ASM-B5-2\`: the fire is ADDITIVE and the ` +
              `rebuild STAYS (a structural edge write may move things this unit does not own, and the renderer cannot tell the two ` +
              `apart from the payload)`,
          )
        } else if (fireAt >= 0 && fireAt > rebuildAt) {
          problems.push(
            `clause 2: the fire sits AFTER \`requestRebuild('content')\` (fire at offset ${fireAt}, rebuild at ${rebuildAt}) — §4: the ` +
              `ordering is LOAD-BEARING (commit \`pendingContentChange\` -> FIRE -> \`requestRebuild\`), because the fire's IPC is issued ` +
              `first so the re-read's commit precedes the re-derive's assemble in every interleaving`,
          )
        }
      }
    }

    // ---- CLAUSE 3: `pane-events.ts` EXPORTS EXACTLY FIVE NAMES (zero byte owed) ----------------------
    let paneEventsText = ''
    try {
      paneEventsText = readText(PANE_EVENTS_FILE)
    } catch (error) {
      problems.push(`clause 3: \`${PANE_EVENTS_FILE}\` is unreadable (${String(error)}) — the export census has no subject`)
    }
    if (paneEventsText !== '') {
      const names = exportedNames(stripComments(paneEventsText))
      const missing = PINNED_PANE_EVENTS_EXPORTS.filter((name) => !names.includes(name))
      const extra = names.filter((name) => !PINNED_PANE_EVENTS_EXPORTS.includes(name))
      if (missing.length > 0) {
        problems.push(
          `clause 3: \`${PANE_EVENTS_FILE}\` no longer exports ${missing.map((name) => `\`${name}\``).join(', ')} — the two arms' ONE ` +
            `shape (\`FireReport\`), the paint's closed vocabulary (\`PaneUpdateReason\`) and its verdict (\`PaneUpdateVerdict\`) are the ` +
            `surface \`B-5\`…\`B-10\` inherit`,
        )
      }
      if (extra.length > 0) {
        problems.push(
          `clause 3: \`${PANE_EVENTS_FILE}\` exports ${extra.map((name) => `\`${name}\``).join(', ')}, which §4 does NOT owe — the ` +
            `module owes ZERO byte and its export list is EXACTLY [${PINNED_PANE_EVENTS_EXPORTS.join(', ')}]. A per-pane payload type, ` +
            `a second dispatch or a per-pane reader table is the second authority its own docblock refuses (§4's DECISION, ` +
            `\`ASM-B3-2\`): the fire carries no payload BY CONSTRUCTION and the pane DECLARES its interest`,
        )
      }
    }

    // ---- CLAUSE 4: `recordPanes()` STAYS `[]` — a LIVE channel, not a quoted sentence ---------------
    let channel: ReturnType<typeof createPaneEvents> | null = null
    try {
      channel = createPaneEvents()
    } catch (error) {
      problems.push(`clause 4: \`createPaneEvents()\` THREW (${String(error)}) — the record census has no live subject`)
    }
    if (channel !== null) {
      // THE FLOOR: this instance really is a working channel, so an empty record census is a READING and not a dead object.
      const release = channel.subscribe('probe-b5-floor', () => undefined)
      if (!channel.panes().includes('probe-b5-floor')) {
        problems.push('clause 4: the live channel did not register a DIRECT subscription — an empty `recordPanes()` would be unreadable')
      }
      const fireReport = channel.fire('probe-b5-floor')
      if (fireReport.fired !== true || fireReport.handlers !== 1) {
        problems.push(`clause 4: the live channel's \`fire\` answered ${JSON.stringify(fireReport)}, not \`fired:true, handlers:1\` — the floor under the empty census is dead`)
      }
      const recordCensus = channel.recordPanes()
      if (!Array.isArray(recordCensus) || recordCensus.length !== 0) {
        problems.push(
          `clause 4: \`recordPanes()\` reads ${JSON.stringify(recordCensus)}, not \`[]\` — §4/\`O-4\`: the shipped record-interest ` +
            `census is EMPTY and that is a DECLARATION; \`B-10\` authors the FIRST reader, and the record arm is not this unit's (D-23: ` +
            `a backlink is CONTENT, the record's payload is display state only)`,
        )
      }
      release()
      if (channel.panes().includes('probe-b5-floor')) {
        problems.push('clause 4: the floor subscription could not be withdrawn — the census reading above would be the harness\'s')
      }
    }

    expect(
      problems,
      `S1 — the contract's zero-byte claims, its seam, its export census and its empty record census (§2/\`F-1\`; §4; \`O-4\`). ` +
        `${problems.length} problem(s). \`${BACKLINKS_FILE}\` must stay a PURE enumeration (no \`setEdge\`/\`putEdge\`/\`broadcast\`/` +
        `\`IPC_\`/\`detect\` in its code, so the detector is NOT the enumeration); the fire must live in ` +
        `\`${SIDEBAR_FILE}\`'s \`onRagStoreChanged\` behind \`Array.isArray(payload.edgeIds) && payload.edgeIds.length > 0\` and BEFORE ` +
        `\`requestRebuild('content')\`; \`${PANE_EVENTS_FILE}\` must export EXACTLY [${PINNED_PANE_EVENTS_EXPORTS.join(', ')}] — a ` +
        `sixth export reds this row by design; and the live channel's \`recordPanes()\` must stay \`[]\`. envelope/pure class — ` +
        `source TEXT (comments stripped) plus one live channel; no host, no DOM, no runtime`,
    ).toEqual([])
  })
})

// ===========================================================================
// ⟨`S2` — `B5-F5`'s SOURCE LETTER, APPENDED (RCA-1: RUN and REPORTED before any byte of the fix).⟩ `docs/L2/shell-chrome/pane-links.md` §9
// `B5-F5` records that "THE SUBJECT HAS NO INVALIDATION RULE" and that "the host HAS the idiom it did not use (`pageSubjectStamp`/
// `superseded()` in the page-commit seam drops every post-await resolution when the subject moved)". The behaviour it names is graded
// on the REAL host by `L7`/`L8` in `tests/integration/shell-chrome/pane-links.test.ts`; THIS clause pins the SPELLING, so a reviewer
// can check the letter of the fix in one place:
//
//   (A) `setCurrentDocumentId`'s body FIRES the `crosslinks` pane (a `fire`/dispatch call naming the pane) — a document switch is a
//       real movement of §3's subject (`ASM-B5-1`), and the pane hears it through the channel it already subscribes to (§4: ONE
//       subscriber per census id, made by the ONE boot loop — never a second wiring).
//   (B) `setCurrentNodeId`'s body does the same — the node selection is `_currentNodeId`, `ASM-B5-1`'s FIRST arm.
//   (C) `paintReplumbedPane`'s re-read carries a SUBJECT STAMP: a capture of `linksPaneSubjectNodeId()` BEFORE the `await` and a
//       CALL of it AFTER the `await`, the two COMPARED — the `pageSubjectStamp`/`superseded()` idiom. Without it, an answer that
//       lands after the subject moved is committed and painted (`B5-F5(b)`, measured).
//
// WHAT THIS CLAUSE IS NOT: it is not a behaviour reading — it cannot say the pane repainted, that ONE `rag.backlinks` call was made,
// or that a stale answer was dropped. That is `L7`/`L8`'s job over the REAL host under the DOM shim (`RCA-12`: envelope-class).
// Nor is it a spelling LOCK on the whole file: only the three bodies above are read, from the source TEXT with comments stripped, so
// the contract's own prose may name a seam it is refusing without reddening the clause.

/** The stripped BODY of a method declaration (`name(...) { … }`), brace-matched — `null` when the declaration is not found. */
function methodBodyOf(code: string, name: string): string | null {
  const declaration = new RegExp(`\\b${name}\\s*\\([^)]*\\)\\s*(?::[^{;]*)?\\{`)
  const match = declaration.exec(code)
  if (match === null) return null
  const start = code.indexOf('{', match.index)
  let depth = 0
  for (let index = start; index < code.length; index += 1) {
    const char = code[index]
    if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return code.slice(start + 1, index)
    }
  }
  return null
}

interface FireSpelling {
  found: boolean
  /** The call as it is spelled in the source — printed on failure so a reviewer can check the letter. */
  call: string
  /** `true` when the call names the pane under test (an argument, or a helper whose own name says so). */
  namesThePane: boolean
}

/** The FIRST dispatch-shaped call in a body: a callee containing `fire`/`dispatch`/`notify`/`publish`. */
function fireCallIn(body: string): FireSpelling {
  const callPattern = /([A-Za-z0-9_$]+)\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g
  let match = callPattern.exec(body)
  while (match !== null) {
    const callee = match[1]
    const args = match[2]
    if (/fire|dispatch|notify|publish/i.test(callee)) {
      return FireSpellingOf(callee, args)
    }
    match = callPattern.exec(body)
  }
  return { found: false, call: '(no fire/dispatch/notify/publish call)', namesThePane: false }
}

/** `(callee, args)` → the spelling a reviewer reads, and whether it names the `crosslinks` pane. */
function FireSpellingOf(callee: string, args: string): FireSpelling {
  return {
    found: true,
    call: `${callee}(${args.trim()})`,
    namesThePane: /crosslinks/i.test(args) || /link/i.test(callee),
  }
}

interface StampSpelling {
  /** The pre-await capture's NAME (`subject`, `stamp`, …), or `null` when no capture was found before the first `await`. */
  capture: string | null
  /** The capture really sits BEFORE the first `await` of the body. */
  beforeAwait: boolean
  /** `linksPaneSubjectNodeId()` is called AGAIN after the first `await`. */
  afterAwaitCall: boolean
  /** The capture and the post-await call are COMPARED (a `!==`/`===`/`!=`/`==` between them). */
  compared: boolean
}

/** The subject stamp in a re-read body, read as (i) a pre-await capture of `linksPaneSubjectNodeId()`, (ii) a post-await call of
 *  it, (iii) a COMPARISON of the two — the `pageSubjectStamp`/`superseded()` idiom `B5-F5(b)` names. */
function subjectStampIn(body: string): StampSpelling {
  const firstAwait = body.indexOf('await')
  if (firstAwait < 0) return { capture: null, beforeAwait: false, afterAwaitCall: false, compared: false }
  const before = body.slice(0, firstAwait)
  const after = body.slice(firstAwait)
  const capture = /(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*(?::[^=;]+)?=\s*(?:this\s*\.\s*)?linksPaneSubjectNodeId\s*\(\s*\)/.exec(before)
  const afterAwaitCall = /linksPaneSubjectNodeId\s*\(\s*\)/.test(after)
  if (capture === null) return { capture: null, beforeAwait: false, afterAwaitCall, compared: false }
  const name = capture[1]
  const comparison = new RegExp(
    `(?:\\b${name}\\b[^;\\n]{0,160}?(?:!==|===|!=|==)[^;\\n]{0,160}?linksPaneSubjectNodeId\\s*\\(` +
      `|linksPaneSubjectNodeId\\s*\\(\\s*\\)[^;\\n]{0,160}?(?:!==|===|!=|==)[^;\\n]{0,160}?\\b${name}\\b)`,
  )
  return { capture: name, beforeAwait: true, afterAwaitCall, compared: afterAwaitCall && comparison.test(after) }
}

describe('pane-links — S2: the subject-move FIRE in both setters and the SUBJECT STAMP on the re-read (the `B5-F5` source letter)', () => {
  it('S2 — `setCurrentDocumentId` and `setCurrentNodeId` each FIRE the `crosslinks` pane, and `paintReplumbedPane` captures `linksPaneSubjectNodeId()` before its await and compares a POST-await call against it', () => {
    // SOURCE: `docs/L2/shell-chrome/pane-links.md` §6's "the subject MOVES between two fires" + "the subject moves DURING a re-read's
    // await" rows and §9 `B5-F5(a)/(b)`; §9 `ASM-B5-L2-4` is the assumption the fix reverses ("the pane's data is refreshed by the
    // FIRE alone: no re-read on a subject change").
    // NON-VACUITY: clause (C) requires all three limbs (capture, post-await call, comparison) — a capture with no comparison is what
    // the LANDED body already does (it captures `subject` for the ARGUMENT, which is not an invalidation rule, `ASM-B5-L2-1`'s
    // measured narrowing), and clause (A)/(B) additionally require the call to NAME the pane, so a fire for `doc-nav` cannot pass.
    // MUTATION THAT WOULD RED IT: leaving the setters as bare assignments (the landed `B5-F5` head) reds (A) and (B); a setter that
    // fires some OTHER pane id reds the "names the pane" arm; a re-read with no stamp, or with a stamp captured AFTER the await, or
    // captured and never compared, reds (C) — the last is exactly `B5-F5(b)`: the late answer for the old subject is committed and
    // painted. Each failure PRINTS the spelling found, so a reviewer checks the letter rather than trusting this comment.
    const problems: string[] = []
    let sidebarText = ''
    try {
      sidebarText = readText(SIDEBAR_FILE)
    } catch (error) {
      problems.push(`S2: \`${SIDEBAR_FILE}\` is unreadable (${String(error)}) — the two clauses have no subject`)
    }
    if (sidebarText !== '') {
      const code = stripComments(sidebarText)

      // ---- (A)/(B): BOTH SETTERS FIRE THE PANE -----------------------------------------------------
      for (const [setter, subjectOf] of [
        ['setCurrentDocumentId', 'the document switch — `docs/L2` §6\'s "the subject MOVES between two fires" row'],
        ['setCurrentNodeId', 'the node selection — `ASM-B5-1`\'s FIRST arm (`_currentNodeId` when SET)'],
      ] as const) {
        const body = methodBodyOf(code, setter)
        if (body === null) {
          problems.push(
            `S2(${setter}): no \`${setter}(…)\` declaration with a body was found in \`${SIDEBAR_FILE}\` — ${subjectOf} is where the ` +
              `subject MOVES, and a body is the clause's subject`,
          )
          continue
        }
        const fire = fireCallIn(body)
        if (!fire.found) {
          problems.push(
            `S2(${setter}): the body carries ${fire.call} — a subject MOVE must reach the pane the way every other pane update does: ` +
              `a \`fire('crosslinks')\` on the host's channel (§4: ONE subscriber per \`REPLUMBED_PANE_IDS\` id, made by the ONE boot ` +
              `loop). The landed body is a bare assignment, which is the measured \`B5-F5(a)\` defect: the subject moves and NOTHING ` +
              `re-reads the pane. Body read: ${JSON.stringify(body.trim())}`,
          )
        } else if (!fire.namesThePane) {
          problems.push(
            `S2(${setter}): the body's dispatch call reads \`${fire.call}\`, which does NOT name the \`crosslinks\` pane — ${subjectOf} ` +
              `moves THAT pane's subject, so a fire for another id (or a helper whose name says nothing about the pane) would red ` +
              `\`L7\` while satisfying this row's letter`,
          )
        }
      }

      // ---- (C): THE SUBJECT STAMP ON THE RE-READ ----------------------------------------------------
      const reRead = methodBodyOf(code, 'paintReplumbedPane')
      if (reRead === null) {
        problems.push(
          `S2(paintReplumbedPane): no \`paintReplumbedPane(…)\` declaration with a body was found in \`${SIDEBAR_FILE}\` — the ` +
            `re-read's subject stamp has no subject`,
        )
      } else {
        const stamp = subjectStampIn(reRead)
        if (stamp.capture === null) {
          problems.push(
            `S2(paintReplumbedPane): the re-read carries NO pre-await capture of \`linksPaneSubjectNodeId()\` (a ` +
              `\`const <name> = this.linksPaneSubjectNodeId()\` BEFORE the first \`await\`) — \`B5-F5(b)\`: without a stamp the answer ` +
              `that lands AFTER the subject moved is committed and painted (the OLD subject's enumeration, under the NEW subject). ` +
              `What was found: afterAwaitCall=${String(stamp.afterAwaitCall)}, compared=${String(stamp.compared)}. Body read: ` +
              JSON.stringify(reRead.trim()),
          )
        } else if (!stamp.beforeAwait) {
          problems.push(
            `S2(paintReplumbedPane): the \`linksPaneSubjectNodeId()\` capture reads AFTER the first \`await\` — a stamp taken after ` +
              `the answer has landed cannot invalidate that answer. Body read: ${JSON.stringify(reRead.trim())}`,
          )
        } else if (!stamp.afterAwaitCall) {
          problems.push(
            `S2(paintReplumbedPane): \`linksPaneSubjectNodeId()\` is captured as \`${stamp.capture}\` but NEVER CALLED AGAIN after the ` +
              `\`await\` — the capture is the re-read's ARGUMENT today (\`ASM-B5-L2-1\`'s measured narrowing: "it keeps the ARGUMENT ` +
              `honest and NOT the COMMIT"), never an invalidation rule. Body read: ${JSON.stringify(reRead.trim())}`,
          )
        } else if (!stamp.compared) {
          problems.push(
            `S2(paintReplumbedPane): \`${stamp.capture}\` and the post-await \`linksPaneSubjectNodeId()\` call are NOT compared — the ` +
              `stamp must be a COMPARISON (the \`pageSubjectStamp\`/\`superseded()\` idiom: \`if (this.linksPaneSubjectNodeId() !== ` +
              `${stamp.capture}) return\`), or the post-await read is decoration. Body read: ${JSON.stringify(reRead.trim())}`,
          )
        }
      }
    }

    expect(
      problems,
      `S2 — the subject-move fire and the subject stamp (§9 \`B5-F5(a)/(b)\`; \`docs/L2\` §6's two subject-movement rows; ` +
        `\`ASM-B5-L2-4\` reversed). ${problems.length} problem(s). \`${SIDEBAR_FILE}\`'s \`setCurrentDocumentId\` and ` +
        `\`setCurrentNodeId\` must each FIRE the \`crosslinks\` pane (a \`fire\`/dispatch call naming it), and \`paintReplumbedPane\` ` +
        `must capture \`linksPaneSubjectNodeId()\` BEFORE its \`await\`, call it AGAIN after, and COMPARE the two — the letter the ` +
        `behaviour rows \`L7\`/\`L8\` grade on the REAL host. envelope/pure class — source TEXT with comments stripped; no host, no ` +
        `DOM, no runtime`,
    ).toEqual([])
  })
})
