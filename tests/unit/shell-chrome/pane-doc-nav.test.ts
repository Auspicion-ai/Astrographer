// tests/unit/shell-chrome/pane-doc-nav.test.ts — unit `B-6` `pane-doc-nav`'s SOURCE/DECLARATION rows (`S1`, `S2`) plus the cheap
// channel/census row (`D4`), authored BEFORE any byte of the unit's landing (RCA-1: the red set runs first and is REPORTED before
// implementation). The host rows (`D1`, `D2`, `D3`, `D5`, `D6`, `D7`, `D9`, `D10`) live in
// `tests/integration/shell-chrome/pane-doc-nav.test.ts`.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-6-pane-doc-nav.md`
//   §2  THE ORDER IS THE CLAIM, spelled once at `onRagStoreChanged`'s head: (1) the ENGINE branch — exact equality with the
//       engine-origin label, `publishChange()`, `return`, BEFORE the three local guards; (2) the three local guards UNCHANGED;
//       (3) `pendingContentChange` commit -> `fire('doc-nav')` -> `requestRebuild('content')`, in that order.
//   §4  the census moves by exactly ONE: `REPLUMBED_PANE_IDS` becomes `{gnosis-query, crosslinks, doc-nav}` WITH a `B-6` comment
//       naming the cause — graded by `censusCauseProblems` as ONE comment paragraph carrying `B-6` + `doc-nav` + a cause word in
//       the same proximity (a window-wide token search was MEASURED VACUOUS against the pre-landing head; see that helper's
//       section comment, and `S1(6)`'s proof arm); the boot loop picks the DECLARATION per id (`subscribeChange` for a change-
//       interested id, `subscribe` otherwise), so `changePanes()` reeds exactly `['doc-nav']`; every other family keeps the
//       pre-migration `refresh()` route.
//   §5  `ASM-B6-1`: the engine-origin label is DECLARED ONCE in the renderer (one `const`, named, commented with its home) and its
//       value equals `src/main/engine-rag-store.ts`'s `ENGINE_ORIGIN_STORE`. A VALUE import is REJECTED by the contract (the main
//       module's `./engine-transport.js` imports `undici` at module scope), so the renderer must SPELL the label, not import it.
//   §6  the rows `S1`, `S2`, `D4`.
//
// DECLARATIONS ARE PARSED, NEVER SEARCHED (`D-38`'s lesson: a parser that matched a token's MENTION — a COMMENT — once latched
// wrongly and was hardened to read DECLARATIONS instead). Both label clauses below strip comments FIRST, then read
// `export const NAME = '<value>'`-shaped declarations; a bare-token search appears nowhere. The comment-stripping is also what lets
// the contract's own prose name a seam it is refusing without reddening the clause.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): ENVELOPE-CLASS. `S1`/`S2` read `src/**`'s TEXT (comments stripped) and nothing else; `D4`
// additionally drives the REAL `createPaneEvents()` and boots the REAL `SidebarPanes` over the LAYOUT-LESS `dom-shim` against a
// recording runtime double, so its `changePanes()`/`fire` census and its `refresh()` floor are readings of the host's own wiring.
// What this file can NEVER read, named so nobody quotes it: that a fire PAINTS the pane, that the re-read is ONE `rag.docHeads`
// call, that every other root is the same object, that a superseded answer is dropped, or that the counters are `0/0/0` — those are
// `tests/integration/shell-chrome/pane-doc-nav.test.ts`'s rows over the same host, and the rendered repaint of a REAL window is
// `docs/L1/unit-b-6-pane-doc-nav.md` §8's assembled-app limb (`G8`) alone.
//
// REACHABILITY RULE (this file always COLLECTS and RUNS): every subject is reached through `readFileSync`/`await import()` inside a
// `try`, and a missing subject is a NAMED problem inside the row's ONE aggregate `expect(problems, …)` — never an ENOENT crash,
// never an ESM link error, never a skip, never a raw `TypeError`.
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO: it writes nothing; it reads only the repo it lives in; no network, no electron, no
// spawn, no `git`, no `vi.mock`. Every path derives from THIS FILE's own location (`ROOT`), so a missing substrate is a REPORTED
// problem rather than a silent skip. It does not touch `tests/live-drive-contract.test.ts` and asserts nothing about the app.
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { installShim, ShimElement } from '../../../src/shared/dom-shim.js'
import { createPaneEvents } from '../../../src/renderer/pane-events.js'
import { createPaneRegistry } from '../../../src/renderer/pane-registry.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../../../src/main/template-shape.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

const SIDEBAR_FILE = 'src/renderer/sidebar-panes.ts'
const PANE_EVENTS_FILE = 'src/renderer/pane-events.ts'
const ENGINE_STORE_FILE = 'src/main/engine-rag-store.ts'

/** §4: the pinned census after this unit's ONE move. `doc-nav` is the addition.
 *  ⟨EXTENDED BY UNIT `B-7` (`pane-search-template`) — A RECORDED-VALUE EXTENSION, NEVER A RELAXATION.⟩ `B-7` moved the census by
 *  exactly TWO more ids (`search`, whose producer is its OWN answered `rag.query`; `template-editor`, whose source is the template
 *  STORE's change push), so the pinned SET moves to the landed value with the SET comparison and the `doc-nav`-duplicate arm
 *  unchanged.
 *  ⟨EXTENDED AGAIN BY UNIT `B-8` (`pane-gnosis`) — TWO more ids, the SAME recorded-value discipline (`D-44`, §12a).⟩
 *  `gnosis-documents` and `gnosis-wikis` join because each now answers a PRODUCER of its own (the CRUD host's bridge settle commits
 *  the rendered field and then fires that pane; the engine descriptor re-reads through `refreshFromEngine`).
 *  ⟨EXTENDED ONCE MORE BY UNIT `B-9` (`pane-operator-settings`) — the LAST TWO ids (`docs/L1/unit-b-9-pane-operator-settings.md`
 *  §4 `F-9`, §6 `O1`), so the pinned SET is now NINE.⟩ `settings` and `gnosis-status` join because each now answers a PRODUCER of its
 *  own AND a PAINT of its own: `paintPane`'s operator arm stopped being an `operator-scope` REFUSAL and became a ROUTE to the
 *  operator surface's own retained-graph paint (§3), so entering them is a LIVE registration rather than the silently dead one the
 *  earlier notes on this list recorded. The `settings` arm therefore INVERTED (see the limb below), the SET comparison and the
 *  `doc-nav`-duplicate arm are unchanged, and the negative family list is EMPTY because no family keeps `refresh()`. */
const PINNED_REPLUMBED: readonly string[] = [
  'gnosis-query',
  'crosslinks',
  'doc-nav',
  'search',
  'template-editor',
  'gnosis-documents',
  'gnosis-wikis',
  'settings',
  'gnosis-status',
]
/** ⟨RE-STATED BY UNIT `B-9` (§4 `F-9`, §6 `O1`) — THE LIST IS EMPTY AND THE LOOP STAYS.⟩ The families that keep the pre-migration
 *  `refresh()` route: **NONE.** `B-7` took `search`/`template-editor` OUT and `B-8` took `gnosis-documents`/`gnosis-wikis` OUT, so the
 *  negative arm was carried by the TWO operator families that were still un-migrated (`settings`, `gnosis-status`); `B-9` gave both a
 *  paint and entered them in the census, so `fired:false, handlers:0` has NO subject left and the two arms are POSITIVE below
 *  (`B9_MOVED_PANES`). The list is kept — EMPTY, never deleted — because the loop over it is the live floor that NO family is
 *  pre-migration; the day a landing adds an id here and still subscribes it, that id's fire answers `fired:true` and reds by name. */
const PRE_MIGRATION_PANES: readonly string[] = []
/** THE TWO IDS `B-7` MOVED INTO THE CENSUS — graded as POSITIVES below (`fired:true, handlers:1`), which is the `B2-ADV-04` arm in
 *  its positive form: a landing that stacked a second subscription would answer `handlers:2`. */
const B7_MOVED_PANES: readonly string[] = ['search', 'template-editor']
/** THE TWO IDS `B-8` MOVED INTO THE CENSUS — the same positive grade, one unit later: without it "the census is the recorded SET"
 *  would rest on the constant alone and a landing that named an id it never subscribed would read green here. */
const B8_MOVED_PANES: readonly string[] = ['gnosis-documents', 'gnosis-wikis']
/** ⟨ADDED BY UNIT `B-9` (§4 `F-9`, §6 `O1`) — THE SAME POSITIVE GRADE, ONE UNIT LATER, and the exact re-statement of the two arms
 *  that used to sit in `PRE_MIGRATION_PANES`: those two ids answered `fired:false, handlers:0` while they kept `refresh()`; they are
 *  census members with their own paint now, so the SAME TWO arms read `fired:true, handlers:1` (ONE registration each, `B2-ADV-04`). */
const B9_MOVED_PANES: readonly string[] = ['settings', 'gnosis-status']
const DOC_NAV = 'doc-nav'
const CROSSLINKS = 'crosslinks'
const SETTINGS = 'settings'

/** How far above `REPLUMBED_PANE_IDS` its comment clause is read: the CONTIGUOUS comment block above the declaration (walking
 *  upward over comment lines and blank lines, stopping at the first line of code, bounded so an unrelated top-of-file docblock cannot
 *  supply it). §4 asks for a `B-6` comment NAMING THE CAUSE beside the declaration.
 *  ⟨RE-STATED BY UNIT `B-8` (`D-44`) — THE WINDOW WIDENED, THE CLAUSE DID NOT.⟩ It was a fixed 12 lines, and `B-8`'s landing inserts
 *  its OWN cause paragraph above this declaration: with `B-6`'s paragraph pushed past line 12 the clause would red on a CORRECT
 *  landing. The clause is, and remains, ONE COMMENT PARAGRAPH carrying `B-6` + `doc-nav` + a cause word — the window was never the
 *  clause (`censusCauseProblems` says so), and the paragraph requirement is untouched, so a paragraph-free move still reds. */
const COMMENT_WINDOW_LIMIT = 80

/** The words that can NAME THE CAUSE §4 asks for: both sources of §2 are the engine's change and the rendered store's change. */
const CAUSE_WORDS: readonly string[] = ['engine', 'store', 'source']

/** The census declaration whose comment clause is graded (`S1(6)`, `D4(2)`). */
const CENSUS_ANCHOR = /^\s*export\s+const\s+REPLUMBED_PANE_IDS\b/
/** THIS UNIT'S id as a TOKEN — `B-60` is not this unit, and `B-10` is not this unit either. */
const CENSUS_UNIT = /\bB-6\b/
/** THE PANE THE MOVE ADDS, as a TOKEN: the cause sentence must NAME it, not merely sit near a declaration that contains it. */
const CENSUS_PANE = /\bdoc-nav\b/
/** A line that OPENS or continues a comment (`//`, a block opener, or a `*`-continuation; a docblock's closing line is one too). */
const COMMENT_LINE = /^\s*(?:\/\/|\/\*|\*(?!\/))/

const fingerprint = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

/** A value as a failure message prints it. */
const shown = (value: unknown): string => (value === undefined ? '(absent)' : fingerprint(value))

/** Strip block comments and line comments while respecting string/template literals — every clause below is about the CODE, and
 *  the contract's own sentences are allowed to live in prose. (The `B-5` precedent, unchanged: a raw-text search would red honest
 *  documentation and reward silent prose.) */
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
      // Keep the newlines so the line windows below still count lines.
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

/** ONE parsed DECLARATION: the name it binds and the string it is initialised with. `D-38`: this shape is what both label clauses
 *  compare, so a COMMENT naming the label can never satisfy or red a clause. */
interface StringDeclaration {
  name: string
  value: string
}

/** Every `const/let/var NAME = 'literal'` (or `= "literal"`) declaration in comment-stripped code, in source order. A type
 *  annotation or an `as` cast between the name and the `=` is tolerated; a COMPUTED initialiser is not a declaration of a value
 *  and is not returned (the clause that needs one says so in its own failure message). */
function stringDeclarationsOf(code: string): StringDeclaration[] {
  const out: StringDeclaration[] = []
  const pattern = /(?:^|\n)\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*(?::[^=;\n]{0,80})?=\s*(['"])((?:[^'"\\\n]|\\.)*)\2/g
  let match = pattern.exec(code)
  while (match !== null) {
    out.push({ name: match[1], value: match[3] })
    match = pattern.exec(code)
  }
  return out
}

/** `src/main/engine-rag-store.ts`'s `ENGINE_ORIGIN_STORE` — read as a DECLARATION of that exact name. */
function mainEngineLabel(code: string): StringDeclaration | null {
  const pattern = /(?:^|\n)\s*export\s+const\s+ENGINE_ORIGIN_STORE\s*(?::[^=;\n]{0,80})?=\s*(['"])((?:[^'"\\\n]|\\.)*)\1/
  const match = pattern.exec(code)
  return match === null ? null : { name: 'ENGINE_ORIGIN_STORE', value: match[2] }
}

// ===========================================================================
// `S1(6)` / `D4(2)` — §4's COMMENT CLAUSE, RE-ANCHORED ON THE CAUSE SENTENCE ITSELF (never on "the window that contains the
// token"). These two rows graded the clause by searching the 12 lines above `REPLUMBED_PANE_IDS` for the `B-6` token and,
// SEPARATELY, for any cause word — which the PRE-LANDING tree already satisfied.
//
// WHY IT MOVED (MEASURED FIRST, NOT ARGUED): at the pre-landing head (`git show HEAD:src/renderer/sidebar-panes.ts`, commit
// `dd3d7eb`) the declaration is on line 301, so the window is lines 289-300; the B-3 docblock's own sentence "(`B-8` for the
// other gnosis panes, `B-6`…`B-10`)" supplies `B-6`, and the B-5 docblock's "`IPC_RAG_STORE_CHANGED`" supplies `store` (the
// search was case-insensitive). Run over that exact text the OLD clause read hasB6=true, causeWords=['store'] and answered
// SATISFIED — so DELETING `B-6`'s own cause docblock left both rows GREEN, contradicting their own `MUTATION` notes.
//
// THE ANCHOR NOW: ONE COMMENT PARAGRAPH inside the same window must carry ALL THREE of THIS unit's id (`B-6`), the pane the move
// ADDS (`doc-nav`), and a CAUSE word. A COMMENT PARAGRAPH is a maximal run of consecutive comment lines, BROKEN by a blank
// comment line and by every non-comment line — the way this source groups its own docblocks, so the clause reads "the sentence
// that names this unit's cause" and never "two tokens somewhere in 12 lines".
// MEASURED ON THE SAME TWO TEXTS AFTER THE RE-ANCHORING: pre-landing = 2 paragraphs, 1 carries `B-6` (lines 289-292) and it
// names `doc-nav` = false ⇒ RED; shipped = the `⟨Unit B-5…⟩`+`⟨Unit B-6…⟩` paragraph (lines 294-303) carries `B-6` = true,
// `doc-nav` = true and causes ['engine','store','source'] ⇒ GREEN.
//
// THE INSTRUMENT TAKES THE TEXT AS A PARAMETER (`censusCauseProblems(text, where, limb)`), which is what makes BOTH directions
// runnable from the SAME committed clause: the shipped file read off disk, and `PRE_LANDING_CENSUS_BLOCK` below — the VERBATIM
// pre-landing window plus declaration — which `S1(6)`'s own proof arm asserts RED. A clause that drifts back toward a token
// search is then caught by the fixture instead of by a reviewer.
// ===========================================================================

/** THE PRE-LANDING BYTES, VERBATIM: `git show HEAD:src/renderer/sidebar-panes.ts` lines 289-301 at commit `dd3d7eb` — the 12-line
 *  window above the census declaration (blank comment line included) plus the declaration line itself. The declaration reads
 *  `Object.freeze(['gnosis-query', 'crosslinks'])`: NO `doc-nav`, because this is the head BEFORE `B-6` landed. It is kept as a
 *  FIXTURE because the discriminating direction needs a tree this unit's docblock is ABSENT from, and `censusCauseProblems` must
 *  RED it (a fixture whose `doc-nav` absence ever changed would itself be a problem — `S1(6)` checks that too). */
const PRE_LANDING_CENSUS_BLOCK: readonly string[] = [
  " *  (`B-8` for the other gnosis panes, `B-6`…`B-10`) and can never inherit a silent second subscriber. `gnosis-status` is",
  " *  deliberately NOT here: it is `operator`-scope, the operator mount is `B-9`'s surface, and `updatePane` answers",
  " *  `operator-scope` for it rather than re-mounting it (`r3`/`r5`). **FROZEN** (`B3-F13`): the census is a fact of",
  " *  the VALUE, not only a convention — a `push` cannot add a silent second subscriber.",
  " *",
  " *  ⟨Unit `B-5` `§4` — THE ROW MOVED BY EXACTLY ONE, AND HERE IS THE CAUSE (`D-24`'s own example).⟩ `crosslinks` joins the",
  " *  census because a NEW BACKLINK is now DETECTED on this very channel and the pane must HEAR it (the contract's §2",
  " *  detection seam): the PRODUCER is main's edge-write announcement (`edit.set_edge` / `deriveBatchBroadcast`'s",
  " *  `putEdge` arm → `IPC_RAG_STORE_CHANGED` with a NON-EMPTY `edgeIds`), the LEARNER is this host's `onRagStoreChanged`,",
  " *  and the pane's answer is ONE `bridge.rag.backlinks(subject)` re-read then ONE `updatePane('crosslinks')` — `INV-E`,",
  " *  never a re-assembly. The cause is named HERE, beside the declaration, so the move is a DELIBERATE extension: it is one",
  " *  id, it is the same `subscribe` (one subscriber per id, `B2-ADV-04`), and every other family keeps its `refresh()`. */",
  "export const REPLUMBED_PANE_IDS: readonly string[] = Object.freeze(['gnosis-query', 'crosslinks'])",
]

/** THE DEFECT SIMULATED EXACTLY: this is the SHIPPED declaration line (census MOVED, `doc-nav` present) with the `B-6` cause
 *  docblock ABSENT above it — i.e. the wrong landing a reviewer would file as "a census move with no `B-6` cause reds". Copied
 *  verbatim off `src/renderer/sidebar-panes.ts` so the fixture mutates exactly the move and nothing else. */
const MOVED_CENSUS_DECLARATION =
  "export const REPLUMBED_PANE_IDS: readonly string[] = Object.freeze(['gnosis-query', 'crosslinks', 'doc-nav'])"

/** ONE COMMENT PARAGRAPH, with the 1-based FILE line numbers it spans (so a failure message can say where to look). */
interface CommentParagraph {
  from: number
  to: number
  text: string
}

/** A line's comment CONTENT — the `//` / block-opener / `*` furniture and a trailing docblock closer removed. */
const commentContentOf = (line: string): string => line.replace(/^\s*(?:\/\/|\/\*+|\*)/, '').replace(/\*\/\s*$/, '').trim()

/** The COMMENT PARAGRAPHS of a slice of lines: a maximal run of consecutive comment lines, BROKEN by a blank comment line and by
 *  every non-comment line. `firstLineNumber` is the 1-based file line number of `lines[0]`. */
function commentParagraphsOf(lines: readonly string[], firstLineNumber: number): CommentParagraph[] {
  const paragraphs: CommentParagraph[] = []
  let open = false
  lines.forEach((line, index) => {
    if (!COMMENT_LINE.test(line)) {
      open = false
      return
    }
    const content = commentContentOf(line)
    if (content === '') {
      open = false
      return
    }
    if (!open) {
      paragraphs.push({ from: firstLineNumber + index, to: firstLineNumber + index, text: content })
      open = true
      return
    }
    const paragraph = paragraphs[paragraphs.length - 1]
    paragraph.to = firstLineNumber + index
    paragraph.text = `${paragraph.text}\n${content}`
  })
  return paragraphs
}

/** The cause words a paragraph names, in `CAUSE_WORDS` order (`[]` when it names none). */
const causeWordsIn = (text: string): string[] => CAUSE_WORDS.filter((word) => new RegExp(word, 'i').test(text))

/** §4's COMMENT CLAUSE, read on a GIVEN source text — the parameter is what lets `S1(6)` prove BOTH directions from ONE clause
 *  (the shipped file off disk, the pre-landing fixture it also carries). Returns the problems it reads; `[]` only when ONE
 *  comment paragraph inside the CONTIGUOUS COMMENT BLOCK above `REPLUMBED_PANE_IDS` carries THIS unit's id, the pane the move adds,
 *  AND a cause word TOGETHER. `where` only labels the text in the message; nothing here reads the filesystem. */
function censusCauseProblems(text: string, where: string, limb: string): string[] {
  const lines = text.split('\n')
  const at = lines.findIndex((line) => CENSUS_ANCHOR.test(line))
  if (at < 0) {
    return [`${limb}: no \`export const REPLUMBED_PANE_IDS\` declaration line was found in ${where} — the comment clause has no anchor`]
  }
  // THE CONTIGUOUS BLOCK: walk upward over comment lines and blank lines, stopping at the first line of CODE (or the limit).
  let from = at
  while (from > 0 && at - from < COMMENT_WINDOW_LIMIT) {
    const line = lines[from - 1]
    if (COMMENT_LINE.test(line) || line.trim() === '') from -= 1
    else break
  }
  const firstLineNumber = from + 1
  const paragraphs = commentParagraphsOf(lines.slice(from, at), firstLineNumber)
  const carried = paragraphs.filter((paragraph) => CENSUS_UNIT.test(paragraph.text))
  if (carried.length === 0) {
    return [
      `${limb}: the contiguous comment block above \`REPLUMBED_PANE_IDS\` in ${where} (lines ${from + 1}-${at}) carries NO ` +
        `\`B-6\` marker in any of its ` +
        `${paragraphs.length} comment paragraph(s) — §4: the census moves by exactly ONE and carries a comment NAMING THE CAUSE ` +
        `(\`D-24\`'s precedence: a move entombed in code with no cause recorded beside it is a review finding). Read: ` +
        `${shown(paragraphs.map((paragraph) => `lines ${paragraph.from}-${paragraph.to}: ${paragraph.text.split('\n')[0].slice(0, 80)}`))}`,
    ]
  }
  const qualifying = carried.filter((paragraph) => CENSUS_PANE.test(paragraph.text) && causeWordsIn(paragraph.text).length > 0)
  if (qualifying.length > 0) return []
  const readings = carried.map(
    (paragraph) =>
      `lines ${paragraph.from}-${paragraph.to}: names${DOC_NAV}=${CENSUS_PANE.test(paragraph.text)} ` +
      `causeWords=${shown(causeWordsIn(paragraph.text))} first=${shown(paragraph.text.split('\n')[0].slice(0, 90))}`,
  )
  return [
    `${limb}: \`REPLUMBED_PANE_IDS\` in ${where} DOES carry a \`B-6\` marker, but NO comment paragraph inside the ` +
      `contiguous comment block above the declaration carries the unit id TOGETHER WITH the pane the move adds ` +
      `(\`${DOC_NAV}\`) AND a CAUSE word (${shown([...CAUSE_WORDS])}) — §4's comment is the SENTENCE THAT NAMES THIS UNIT'S MOVE, ` +
      `not the two tokens somewhere in a window: the PRE-EXISTING "(\`B-8\` for the other gnosis panes, \`B-6\`…\`B-10\`)" sentence ` +
      `and the \`B-5\` docblock together satisfied a window-wide token search, so a census moved with NO \`B-6\` cause still read ` +
      `GREEN (measured at commit \`dd3d7eb\`). Read: ${shown(readings)}`,
  ]
}

// ===========================================================================
// `S1` — THE LETTER (§2's order, read off `onRagStoreChanged`'s own body, comments stripped).
// ===========================================================================
describe('pane-doc-nav — S1: the engine branch PRECEDES the three local guards inside `onRagStoreChanged`, publishes and returns before `pendingContentChange`, and the local branch fires `doc-nav`', () => {
  it('S1 — the engine branch is FIRST (exact equality on the `store` member), calls `publishChange` and returns before the local guards and before `pendingContentChange`; the local branch fires `doc-nav` before `requestRebuild`; `REPLUMBED_PANE_IDS` carries a `B-6` comment naming the cause', () => {
    // §6 `S1`; §2's branch list ("the order is the claim"); §4's comment clause (`D-24`'s precedent: entombing a move in code with
    // no cause recorded beside it reds).
    // NON-VACUITY: the clause reads OFFSETS, not mentions — the engine arm's `publishChange` call must sit at a SMALLER offset than
    // the FIRST local guard, and a `return` must sit between it and the `pendingContentChange` assignment, so "publishes and
    // returns" cannot be satisfied by a call that runs after the guards (which is unreachable) or by one that falls through into the
    // local accumulation. The doc-nav fire is required to sit BEFORE `requestRebuild('content')` (its IPC must be issued first), so
    // a fire appended after the rebuild reds.
    // MUTATION THAT WOULD RED IT: a landing that puts the engine branch AFTER the guards (or inside a helper the guards run after
    // returning), one that publishes but falls through, one that fires `doc-nav` after the rebuild request, a census moved with no
    // `B-6` cause beside it, or an engine branch spelled as a predicate on `kind`/`nodeIds`/`edgeIds` with NO comparison against the
    // engine label (the `store` is the discriminator, §2) — each reds its own arm and each failure message prints what was read.
    // THE `S1(6)` ARM'S OWN VACUITY WAS MEASURED AND IS NOW CLOSED: as first authored it searched the window for `B-6` and,
    // separately, for any cause word, and OVER THE PRE-LANDING BYTES (`git show HEAD:src/renderer/sidebar-panes.ts` at `dd3d7eb`,
    // lines 289-300) it read hasB6=true / causeWords=['store'] ⇒ SATISFIED, so a census moved with NO `B-6` docblock stayed GREEN.
    // The arm now requires ONE comment paragraph carrying `B-6` + `doc-nav` + a cause word, and it grades BOTH texts: the shipped
    // file (green) and `PRE_LANDING_CENSUS_BLOCK` (must red — asserted below, so a relapse into a token search reds HERE).
    const problems: string[] = []
    let sidebarText = ''
    try {
      sidebarText = readText(SIDEBAR_FILE)
    } catch (error) {
      problems.push(`S1: \`${SIDEBAR_FILE}\` is unreadable (${String(error)}) — the seam clause has no subject`)
    }
    if (sidebarText !== '') {
      const code = stripComments(sidebarText)
      const body = methodBodyOf(code, 'onRagStoreChanged')
      if (body === null) {
        problems.push(
          `S1: no \`onRagStoreChanged(…)\` declaration with a body was found in \`${SIDEBAR_FILE}\` — §2 spells BOTH branches at that ` +
            `handler's head, and there is no second site`,
        )
      } else {
        const publishAt = body.search(/\.\s*publishChange\s*\(/)
        const nullGuardAt = body.search(/this\s*\.\s*lastStore\s*===\s*null/)
        const typeGuardAt = body.search(/typeof\s*payload\s*\.\s*store\s*!==\s*'string'/)
        const foreignGuardAt = body.search(/payload\s*\.\s*store\s*!==\s*this\s*\.\s*lastStore/)
        const pendingAt = body.search(/this\s*\.\s*pendingContentChange\s*=/)
        const rebuildAt = body.search(/requestRebuild\s*\(\s*['"]content['"]\s*\)/)

        // ---- (1) THE ENGINE BRANCH EXISTS AND PUBLISHES ------------------------------------------
        if (publishAt < 0) {
          problems.push(
            `S1(1): \`onRagStoreChanged\`'s body carries NO \`publishChange(\` call — §2's FIRST branch is ` +
              `\`payload.store === <the engine-origin label> -> this.events?.publishChange() -> return\`, and \`F-2\` records that at ` +
              `this head NO production site calls \`publishChange\` at all: the engine arm is the unit's missing half`,
          )
        }

        // ---- (2) THE THREE LOCAL GUARDS ARE STILL THERE (UNCHANGED, §2 item 2) --------------------
        const missingGuards: string[] = []
        if (nullGuardAt < 0) missingGuards.push('`this.lastStore === null` (the uncaptured-host guard)')
        if (typeGuardAt < 0) missingGuards.push("`typeof payload.store !== 'string'` (the malformed-store guard)")
        if (foreignGuardAt < 0) missingGuards.push('`payload.store !== this.lastStore` (the foreign-store guard)')
        if (missingGuards.length > 0) {
          problems.push(
            `S1(2): \`onRagStoreChanged\` no longer carries ${missingGuards.join(', ')} — §2 item 2 keeps the three local guards ` +
              `UNCHANGED: the engine branch lands ABOVE them, and every non-engine foreign name stays dropped by them`,
          )
        }

        // ---- (3) THE ENGINE BRANCH PRECEDES EVERY GUARD -------------------------------------------
        const guardOffsets = [nullGuardAt, typeGuardAt, foreignGuardAt].filter((at) => at >= 0)
        if (publishAt >= 0 && guardOffsets.length > 0) {
          const firstGuardAt = Math.min(...guardOffsets)
          if (publishAt > firstGuardAt) {
            problems.push(
              `S1(3): \`publishChange(\` sits at offset ${publishAt}, AFTER the first local guard at ${firstGuardAt} — §2's order is ` +
                `the CLAIM: the engine branch is FIRST (exact equality on the \`store\` member, fail-closed), because \`'gnosis:engine'\` ` +
                `can never equal a registry name (\`RAG_STORE_NAME_PATTERN\` refuses a colon, \`F-1\`) and a branch placed below the ` +
                `guards is UNREACHABLE for every engine frame`,
            )
          }
          // ---- THE DISCRIMINATOR IS THE LABEL, NOT THE KIND ---------------------------------------
          const beforePublish = body.slice(0, publishAt)
          const mainLabel = ((): StringDeclaration | null => {
            try {
              return mainEngineLabel(stripComments(readText(ENGINE_STORE_FILE)))
            } catch {
              return null
            }
          })()
          const rendererLabel = mainLabel === null ? [] : stringDeclarationsOf(code).filter((decl) => decl.value === mainLabel.value)
          const labelNames = new Set<string>(rendererLabel.map((decl) => decl.name))
          if (mainLabel !== null) labelNames.add(mainLabel.value)
          const namesTheLabel = [...labelNames].some((name) => beforePublish.includes(name))
          const comparesStore = /payload\s*\.\s*store\s*(===|==)/.test(beforePublish)
          if (!comparesStore || !namesTheLabel || labelNames.size === 0) {
            problems.push(
              `S1(3·discriminator): the code ABOVE the \`publishChange(\` call reads ` +
                `${JSON.stringify(beforePublish.trim().split('\n').slice(-6).join('\n'))} — §2: the arm is entered by EXACT equality ` +
                `on the \`store\` member (\`payload.store === <the engine-origin label>\`), never by \`kind\`, \`nodeIds\` or \`edgeIds\`. ` +
                `Read: comparesStore=${comparesStore} namesTheLabel=${namesTheLabel} labelNames=${shown([...labelNames])} ` +
                `(the label is parsed from \`${ENGINE_STORE_FILE}\`'s own declaration; a bare-token search is NOT what this reads, ` +
                `\`D-38\`)`,
            )
          }
        }

        // ---- (4) IT RETURNS, BEFORE THE NEXT GUARD AND BEFORE `pendingContentChange` ---------------
        // Read as an OFFSET, not a mention: the `return` must sit between the `publishChange(` call and the FIRST LOCAL GUARD (and so
        // a fortiori before the `pendingContentChange` assignment). A `return` found only inside a guard's own body does not count —
        // that would be a branch which falls through into the guards, exactly the wrong-origin harm the arm exists to refuse.
        if (publishAt >= 0 && pendingAt >= 0) {
          const tail = body.slice(publishAt)
          const returnAt = tail.search(/\breturn\b/)
          const absoluteReturnAt = returnAt < 0 ? -1 : publishAt + returnAt
          const firstGuard = guardOffsets.length > 0 ? Math.min(...guardOffsets) : pendingAt
          const between = body.slice(publishAt, firstGuard)
          if (absoluteReturnAt < 0 || absoluteReturnAt > firstGuard || absoluteReturnAt > pendingAt) {
            problems.push(
              `S1(4): the \`publishChange(\` call does not RETURN before the next statement (the first local guard at ` +
                `${firstGuard}, the \`pendingContentChange\` assignment at ${pendingAt}; the first \`return\` after the call reads ` +
                `${absoluteReturnAt}) — §2: the engine branch RETURNS. Falling through would accumulate a LOCAL change descriptor and ` +
                `request a local rebuild around the ENGINE's ids, the wrong-origin harm \`B4-EX-2\` pinned fail-closed on the main ` +
                `side. Read: ${JSON.stringify(between.trim())}`,
            )
          }
        } else if (publishAt >= 0 && pendingAt < 0) {
          problems.push(
            'S1(4): the handler no longer assigns `pendingContentChange` at all — §2 item 3 keeps the local arm (the fire is ADDITIVE, ' +
              '`ASM-B6-2`: the rebuild STAYS), so the accumulation it precedes must still be there',
          )
        }

        // ---- (5) THE LOCAL BRANCH FIRES `doc-nav`, BEFORE THE REBUILD ------------------------------
        const docNavFire = /\bfire\s*\(\s*['"`]doc-nav['"`]\s*\)/.exec(body)
        if (docNavFire === null) {
          problems.push(
            `S1(5): \`onRagStoreChanged\`'s local branch carries NO \`fire('doc-nav')\` — §2 item 3: after committing ` +
              `\`pendingContentChange\` the handler FIRES the pane (then requests the rebuild). \`F-4\`: the local predicate is ` +
              `UNCONDITIONAL (the STORE decides, not \`kind\` and not \`edgeIds\`), so the fire names \`doc-nav\` and is not behind a ` +
              `payload-shape guard`,
          )
        } else if (rebuildAt >= 0 && docNavFire.index > rebuildAt) {
          problems.push(
            `S1(5): the \`doc-nav\` fire sits AFTER \`requestRebuild('content')\` (fire at ${docNavFire.index}, rebuild at ` +
              `${rebuildAt}) — §2 item 3's ordering is LOAD-BEARING: the fire's IPC is ISSUED before the re-derive's assemble, so the ` +
              `re-read's commit precedes it in every interleaving the two promise chains can produce`,
          )
        }
      }

      // ---- (6) THE CENSUS CARRIES ITS `B-6` CAUSE SENTENCE, NOT MERELY ITS TOKEN -------------------
      // RE-ANCHORED (the section comment above `PRE_LANDING_CENSUS_BLOCK` records the measurement): the clause is "ONE comment
      // paragraph inside the window carries `B-6` AND `doc-nav` AND a cause word", and it is graded on a GIVEN text so BOTH
      // directions run HERE — the shipped file (must be GREEN) and the PRE-LANDING bytes it must REJECT. As first authored the
      // clause searched the whole window for `B-6` and, separately, for any cause word; over the pre-landing text that read
      // hasB6=true, causeWords=['store'] and answered SATISFIED, so `B-6`'s cause docblock could be DELETED with this row GREEN.
      problems.push(...censusCauseProblems(sidebarText, `\`${SIDEBAR_FILE}\``, 'S1(6)'))
      const preLandingText = PRE_LANDING_CENSUS_BLOCK.join('\n')
      const preLanding = censusCauseProblems(preLandingText, 'the PRE-LANDING fixture (`git show HEAD:` lines 289-301)', 'S1(6·proof)')
      if (preLanding.length === 0) {
        problems.push(
          `S1(6·proof): the clause ACCEPTED the PRE-LANDING bytes — the 12-line window above the census at commit \`dd3d7eb\`, ` +
            `whose only \`B-6\` is the \`B-3\` docblock's "(\`B-8\` for the other gnosis panes, \`B-6\`…\`B-10\`)" sentence and whose only ` +
            `cause word is the \`B-5\` docblock's \`IPC_RAG_STORE_CHANGED\`. With those bytes accepted, a census moved with NO \`B-6\` ` +
            `cause docblock reads GREEN and this row is VACUOUS: the clause must anchor on the SENTENCE naming this unit's pane ` +
            `(\`${DOC_NAV}\`), not on the window that happens to contain both tokens`,
        )
      }
      if (CENSUS_PANE.test(preLandingText)) {
        problems.push(
          `S1(6·proof): the PRE-LANDING FIXTURE now names \`${DOC_NAV}\` — the fixture no longer reproduces the head this unit's ` +
            `docblock was absent from (commit \`dd3d7eb\`'s census reads \`Object.freeze(['gnosis-query', 'crosslinks'])\`), so the ` +
            `red direction above would prove nothing`,
        )
      }
      // THE DEFECT ITSELF, SIMULATED: the census MOVED (the declaration names `doc-nav`) with the `B-6` cause docblock ABSENT and
      // the pre-landing window untouched. This is the tree the old clause could not tell apart from the shipped one; it must RED.
      const movedWithoutCauseText = [...PRE_LANDING_CENSUS_BLOCK.slice(0, -1), MOVED_CENSUS_DECLARATION].join('\n')
      const movedProblems = censusCauseProblems(movedWithoutCauseText, 'the CENSUS-MOVED-WITH-NO-`B-6`-CAUSE fixture (declaration moved, docblock absent)', 'S1(6·proof)')
      if (!CENSUS_PANE.test(movedWithoutCauseText)) {
        problems.push(
          `S1(6·proof): the CENSUS-MOVED fixture's declaration reads ${shown(MOVED_CENSUS_DECLARATION)} and does NOT name ` +
            `\`${DOC_NAV}\` — it no longer simulates the defect (a moved census with no cause), so the red direction below is moot`,
        )
      } else if (movedProblems.length === 0) {
        problems.push(
          `S1(6·proof): the clause ACCEPTED a census that MOVED (the declaration names \`${DOC_NAV}\`) while the \`B-6\` cause ` +
            `docblock is ABSENT — the window is the untouched pre-landing one, whose \`B-6\` belongs to the \`B-3\` docblock and whose ` +
            `cause word belongs to the \`B-5\` docblock. This is EXACTLY the wrong landing this unit's \`MUTATION\` note claims reds, ` +
            `and as first authored the clause read it GREEN (measured at commit \`dd3d7eb\`)`,
        )
      }
    }

    expect(
      problems,
      `S1 — the letter of §2's order and §4's comment (§6 S1; §2's branch list; §4). ${problems.length} problem(s). Inside ` +
        `\`${SIDEBAR_FILE}\`'s \`onRagStoreChanged\`: an engine branch comparing \`payload.store\` to the engine-origin label, calling ` +
        `\`publishChange\` and RETURNING, all ABOVE the three unchanged local guards and before \`pendingContentChange\`; a local ` +
        `branch that fires \`doc-nav\` BEFORE \`requestRebuild('content')\`; and a \`B-6\` comment naming the cause beside ` +
        `\`REPLUMBED_PANE_IDS\`. envelope/pure class — source TEXT with comments stripped; no host, no DOM, no runtime`,
    ).toEqual([])
  })
})

// ===========================================================================
// `S2` — THE LABEL IS DECLARED ONCE AND PARSED, NOT SEARCHED (`ASM-B6-1`).
// ===========================================================================
describe('pane-doc-nav — S2: the engine-origin label is DECLARED ONCE in the renderer and its DECLARATION parses equal to `src/main/engine-rag-store.ts`\'s `ENGINE_ORIGIN_STORE`', () => {
  it('S2 — both labels are parsed as DECLARATIONS (comments stripped), their values compare equal, the renderer spells it exactly once, and no VALUE import of the main module exists', () => {
    // §6 `S2`; §5's `ASM-B6-1` ("the renderer declares the label ONCE, named, commented with its home") and `D-38`'s rule
    // ("`D8` PARSES BOTH DECLARATIONS ... `D-38`'s rule that a token search is not a declaration search").
    // NON-VACUITY: the clause requires BOTH parses to SUCCEED (a missing declaration is a named problem, never a silent empty
    // comparison), compares the two VALUES, and requires exactly ONE renderer declaration holding that value — so a second spelling,
    // a computed initialiser, or a comment that merely mentions the token satisfies nothing.
    // MUTATION THAT WOULD RED IT: changing the renderer's label to a typo, to a near-miss (`'gnosis-engine'`), or declaring it twice
    // reds the equality and the once-only arm; a `value import` (`import { ENGINE_ORIGIN_STORE } from '../main/engine-rag-store.js'`)
    // reds the import arm — and would be the bundle widening `ASM-B6-1` rejects (that module imports `undici` at module scope);
    // moving the label into `src/shared/types.ts` (outside this unit's grant) leaves the renderer's declaration absent and reds the
    // first arm; a comment mentioning the token cannot satisfy the declaration parse (`D-38`).
    const problems: string[] = []
    const mainLabel = ((): StringDeclaration | null => {
      let text = ''
      try {
        text = readText(ENGINE_STORE_FILE)
      } catch (error) {
        problems.push(`S2: \`${ENGINE_STORE_FILE}\` is unreadable (${String(error)}) — the main-side declaration has no subject`)
        return null
      }
      const parsed = mainEngineLabel(stripComments(text))
      if (parsed === null) {
        problems.push(
          `S2: \`${ENGINE_STORE_FILE}\` carries no \`export const ENGINE_ORIGIN_STORE = '<label>'\` DECLARATION — the pin \`B-4\` fixed ` +
            `(\`F-1\`) has no subject, so the renderer's value has nothing to be equal to`,
        )
      }
      return parsed
    })()

    let sidebarText = ''
    try {
      sidebarText = readText(SIDEBAR_FILE)
    } catch (error) {
      problems.push(`S2: \`${SIDEBAR_FILE}\` is unreadable (${String(error)}) — the renderer's declaration has no subject`)
    }
    if (sidebarText !== '' && mainLabel !== null) {
      const code = stripComments(sidebarText)
      const declarations = stringDeclarationsOf(code)
      const matching = declarations.filter((decl) => decl.value === mainLabel.value)
      if (matching.length === 0) {
        problems.push(
          `S2: the renderer declares NO \`const <name> = '${mainLabel.value}'\` — §5's \`ASM-B6-1\`: the renderer DECLARES the label ` +
            `ONCE (one named \`const\`, commented with its home) so the equality it must honour is spellable without a value import. ` +
            `String declarations found in \`${SIDEBAR_FILE}\`: ${shown(declarations.map((decl) => `${decl.name}='${decl.value}'`).slice(0, 12))}`,
        )
      } else if (matching.length > 1) {
        problems.push(
          `S2: the renderer spells the engine-origin label ${matching.length} times as declarations ` +
            `${shown(matching.map((decl) => decl.name))} — §5: it is declared ONCE; a second spelling is the second authority ` +
            `\`ASM-B6-1\` refuses`,
        )
      } else if (matching[0].name === 'ENGINE_ORIGIN_STORE') {
        // A same-NAME declaration in the renderer is lawful only if it is not re-exported from main; the equality below is what is
        // graded, so this arm records the spelling rather than reddening it.
        void 0
      }
      // THE VALUE EQUALITY, stated as its own clause so a wrong value is never reported as a missing declaration.
      const values = new Set(matching.map((decl) => decl.value))
      if (matching.length === 1 && matching[0].value !== mainLabel.value) {
        problems.push(
          `S2: the renderer's declaration \`${matching[0].name}\` reads '${matching[0].value}', not '${mainLabel.value}' — the two ` +
            `declarations must PARSE EQUAL, or an engine frame is dropped as foreign`,
        )
      }
      if (values.size > 1) {
        problems.push(`S2: the renderer's label declarations disagree (${shown([...values])}) — one label, one value`)
      }
      // ---- NO VALUE IMPORT OF THE MAIN MODULE (§5's rejected alternative) ------------------------
      const valueImport = /import\s+(?!type\b)[^;\n]*from\s*['"][^'"\n]*engine-rag-store(\.js)?['"]/.test(code)
      if (valueImport) {
        problems.push(
          `S2: \`${SIDEBAR_FILE}\` carries a VALUE import from \`engine-rag-store\` — §5's \`ASM-B6-1\` REJECTS it: that module imports ` +
            `\`./engine-transport.js\`, which imports \`undici\` at module scope, so a value import would put the engine's HTTP stack ` +
            `into the renderer bundle for one string`,
        )
      }
      const typeOnlyImport = /import\s+type\b[^;\n]*engine-rag-store/.test(code)
      if (typeOnlyImport) {
        problems.push(
          `S2: \`${SIDEBAR_FILE}\` imports a TYPE from \`engine-rag-store\` — a type-only import is erased, so it is not the bundle harm, ` +
            `but §5 places the label's declaration IN THE RENDERER with its home named in a comment: the renderer must not depend on ` +
            `that module at all`,
        )
      }
    }

    // ---- THE ONE SPELLING IN THE CHANNEL MODULE TOO (`B-4`'s docblocks name the label; the CENSUS claim is `D4`'s) ------------
    let paneEventsText = ''
    try {
      paneEventsText = readText(PANE_EVENTS_FILE)
    } catch (error) {
      problems.push(`S2: \`${PANE_EVENTS_FILE}\` is unreadable (${String(error)}) — the channel's own spelling has no subject`)
    }
    if (paneEventsText !== '' && mainLabel !== null) {
      const channelDeclarations = stringDeclarationsOf(stripComments(paneEventsText)).filter((decl) => decl.value === mainLabel.value)
      if (channelDeclarations.length > 0) {
        problems.push(
          `S2: \`${PANE_EVENTS_FILE}\` declares the engine-origin label ${shown(channelDeclarations.map((decl) => decl.name))} — §5: the ` +
            `label lives ONCE, in \`${SIDEBAR_FILE}\` (\`ASM-B6-1\`); the channel module owes ZERO logic byte and no second spelling`,
        )
      }
    }

    expect(
      problems,
      `S2 — the engine-origin label is declared once in the renderer and parses equal to the main-side pin (§6 S2; §5 \`ASM-B6-1\`; ` +
        `\`D-38\`). ${problems.length} problem(s). Both declarations are PARSED (comments stripped) and their VALUES compared: ` +
        `\`${ENGINE_STORE_FILE}\`'s \`ENGINE_ORIGIN_STORE\` and the renderer's ONE \`const\` in \`${SIDEBAR_FILE}\`; the renderer spells ` +
        `it exactly once and does NOT value-import that main module. envelope/pure class — source TEXT only; no host, no DOM`,
    ).toEqual([])
  })
})

// ===========================================================================
// `D4` — THE CENSUS MOVES BY EXACTLY ONE AND EVERY OTHER FAMILY KEEPS `refresh()`.
// ===========================================================================
beforeAll(() => {
  installShim()
})

/** The recording runtime double (`D4` needs the HOST to boot; the paint's own readings are the integration file's). */
function recordingRuntime(): Record<string, unknown> {
  let roots: unknown[] = []
  return {
    loadEnvelope: (envelope: unknown): void => {
      const out: unknown[] = []
      const payloads = (envelope as { content?: unknown } | null | undefined)?.content
      if (Array.isArray(payloads)) {
        for (const payload of payloads) {
          const nodes = (payload as { content?: unknown } | null | undefined)?.content
          if (!Array.isArray(nodes)) continue
          for (const node of nodes) {
            const id = (node as { props?: { id?: unknown } } | null | undefined)?.props?.id
            if (typeof id !== 'string') continue
            if (id.startsWith('rag-') || id.startsWith('pane-') || ['editor-toolbar', 'page-edit-surface', 'page-commit-warning', 'stage-landing'].includes(id)) out.push(node)
          }
        }
      }
      roots = out
    },
    materializedContentRoots: (): unknown[] => [...roots],
    materializedDocumentRoots: (): unknown[] => roots.map((root) => ({ documentId: '', root })),
    applyContentReconcile: (): { applied: string[]; warnings: string[] } => ({ applied: [], warnings: [] }),
    applyCommand: (): void => undefined,
    nodeState: (): { states: unknown[] } => ({ states: [] }),
    codeGet: (): unknown => null,
    renderedHtmlResult: (): { renderedHtml: string } => ({ renderedHtml: '' }),
  }
}

const NOW = new Date().toISOString()

/** A ONE-document snapshot, enough for the host to boot with `doc-nav` current. */
function documentSnapshot(): Record<string, unknown> {
  return {
    store: 'main',
    nodes: [
      { id: 'head-a', type: 'h1', content: 'Doc A', ownedNodeIds: [], createdAt: NOW, updatedAt: NOW },
      { id: 'sec-a', type: 'p', content: 'content-sec-a', ownedNodeIds: [], createdAt: NOW, updatedAt: NOW },
    ],
    edges: [
      { id: 'dh1', kind: 'doc-head', source: 'head-a', target: 'doc-a', createdAt: NOW, updatedAt: NOW, documentIds: ['doc-a'] },
      { id: 'ns1', kind: 'next-section', source: 'head-a', target: 'sec-a', createdAt: NOW, updatedAt: NOW, documentIds: ['doc-a'] },
    ],
  }
}

interface LightDrive {
  host: Record<string, unknown>
  channel: ReturnType<typeof createPaneEvents>
  bootProblems: string[]
  counters: { refresh: number; loadAppGraph: number; mountOperator: number; docHeads: number }
  restore: () => void
}

/** Boot the REAL `SidebarPanes` on a light double — `D4`'s census/floor subject. The counters are wrapped on the INSTANCE so the
 *  host's own internal calls are counted. */
async function seedLightHost(): Promise<LightDrive> {
  installShim()
  const globals = globalThis as Record<string, unknown>
  const previousWindow = globals['window']
  globals['window'] = { provident: {} }
  const counters = { refresh: 0, loadAppGraph: 0, mountOperator: 0, docHeads: 0 }
  const bootProblems: string[] = []
  const registry = createPaneRegistry()
  const bridge = {
    security: { get: async (): Promise<Record<string, unknown>> => ({ token: null, enabled: ['read'] }) },
    edit: {
      onRagStoreChanged: (_handler: (payload: unknown) => void): (() => void) => () => undefined,
      commit: async (): Promise<Record<string, unknown>> => ({ ok: true }),
      commitRich: async (): Promise<Record<string, unknown>> => ({ ok: true }),
      batch: async (): Promise<Record<string, unknown>> => ({ ok: true, applied: [] }),
    },
    rag: {
      snapshot: async (): Promise<Record<string, unknown>> => documentSnapshot(),
      docHeads: async (): Promise<Record<string, unknown>> => {
        counters.docHeads += 1
        return { documents: [{ documentId: 'doc-a', title: 'Doc A', path: [], tags: [] }] }
      },
      backlinks: async (nodeId: string): Promise<Record<string, unknown>> => ({
        nodeId,
        backlinks: [],
        outlinks: [],
        crosslinkBacklinks: [],
        crosslinkOutlinks: [],
      }),
      stores: async (): Promise<Record<string, unknown>> => ({ stores: [] }),
      query: async (): Promise<Record<string, unknown>> => ({ query: '', ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }),
      journal: async (): Promise<Record<string, unknown>> => ({ entries: [] }),
    },
    template: {
      get: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      onTemplateChanged: (_handler: (payload: unknown) => void): (() => void) => () => undefined,
    },
    operatorSettings: {
      get: async (): Promise<Record<string, unknown>> => ({
        enabledPanes: [DOC_NAV, 'search', CROSSLINKS],
        enabledOperatorPanes: [SETTINGS],
        panesInitialized: true,
        defaultDocumentId: null,
        topK: 5,
      }),
      set: async (patch: unknown): Promise<unknown> => patch,
      onChanged: (_handler: (settings: unknown) => void): (() => void) => () => undefined,
    },
  }
  const channel = createPaneEvents()
  const SidebarPanesCtor = (await import('../../../src/renderer/sidebar-panes.js')).SidebarPanes as new (opts: unknown) => unknown
  const host = new SidebarPanesCtor({
    mount: new ShimElement('div'),
    operatorMount: new ShimElement('div'),
    registry,
    bridge,
    backRefs: new Map<string, string[]>(),
    editController: {
      anyDirty: () => false,
      requestRebuild: (): void => undefined,
      restoreCaret: (): undefined => undefined,
      isEditable: (): boolean => true,
    },
    events: channel,
  }) as unknown as Record<string, unknown>
  const realRefresh = (host['refresh'] as () => Promise<void>).bind(host)
  host['refresh'] = async (): Promise<void> => {
    counters.refresh += 1
    return await realRefresh()
  }
  const realLoadAppGraph = (host['loadAppGraph'] as (...a: unknown[]) => unknown).bind(host)
  host['loadAppGraph'] = (...args: unknown[]): unknown => {
    counters.loadAppGraph += 1
    return realLoadAppGraph(...args)
  }
  const realMountOperator = (host['mountOperator'] as () => void).bind(host)
  host['mountOperator'] = (): void => {
    counters.mountOperator += 1
    realMountOperator()
  }
  try {
    await (host['boot'] as (runtime: unknown) => Promise<void>).call(host, recordingRuntime())
  } catch (error) {
    bootProblems.push(`the harness's \`host.boot(runtime)\` THREW (${String(error)}) — the census has no booted subject`)
  }
  return {
    host,
    channel,
    bootProblems,
    counters,
    restore: () => {
      globals['window'] = previousWindow
    },
  }
}

describe('pane-doc-nav — D4: `REPLUMBED_PANE_IDS` moves by exactly ONE (with its `B-6` cause) and is EXTENDED by `B-7`, by `B-8` and by `B-9`, `changePanes()` is exactly `[doc-nav]`, no family keeps `refresh()` (all nine ids answer `fired:true, handlers:1`), and the pre-migration route still re-assembles', () => {
  it('D4 — `REPLUMBED_PANE_IDS` is exactly the NINE-id set (extended by `B-7`, by `B-8` and by `B-9`) with its `B-6` comment naming the cause, `changePanes()` carries `doc-nav`, `fire(search|template-editor|gnosis-documents|gnosis-wikis)` AND `fire(settings|gnosis-status)` answer `fired:true, handlers:1`, and `host.refresh()` still reaches `loadAppGraph` + `mountOperator`', async () => {
    // §6 `D4` (§4's ONE declared census; §2's "the migration is incremental, never a big bang"; `F-2`'s empty change census; the
    // `r5` floor: NO family keeps `refresh()` after ⟨UNIT `B-9` §4 `F-9`⟩ — and `refresh()` itself is NOT deleted, so the floor stays).
    // LAYER: envelope-class — the host module's export, the sources' TEXT, and the REAL host + REAL channel over the shim.
    // NON-VACUITY: the `fired:false, handlers:0` loop is floored by the SAME channel answering `fired:true, handlers:1` for
    // `crosslinks` (the host's OWN boot-time subscription, `B-5`'s landed arm) AND for the ids `B-7`/`B-8`/`B-9` moved, and the census
    // SET equality is floored by the source clause requiring the cause to be NAMED beside the declaration — so "exactly this SET"
    // cannot pass by naming none. ⟨UNIT `B-9` §6 `O1`⟩ After the landing that loop is EMPTY (every id is a listener), so it is a live
    // zero rather than a claim. The `refresh()` floor (`loadAppGraph` + `mountOperator` both move) is what makes the integration
    // file's `INV-E` zeroes readable.
    // MUTATION THAT WOULD RED IT: adding a further id (a silent second subscriber) or dropping one reds the SET arm; entombing the
    // move in code with no `B-6` cause reds the comment clause; registering `doc-nav` with a plain `subscribe` (so `publishChange`
    // can never reach it) reds `changePanes()`; stacking a second registration on any moved id (`search`/`template-editor`,
    // `gnosis-documents`/`gnosis-wikis`, ⟨`B-9`⟩ `settings`/`gnosis-status`) reds its `handlers:1` arm; a host whose `refresh()` no
    // longer re-assembles reds the floor and would make every zero above unreadable. ⟨UNIT `B-9` §4 `F-9`⟩ The pre-landing mutation
    // for the operator ids ("subscribing a family that keeps `refresh()`") is GONE with the `refresh()` families themselves — those
    // two arms are POSITIVES now, and the floor that no family is pre-migration is the (empty) `PRE_MIGRATION_PANES` loop.
    // THAT "ENTOMBING ... REDS THE COMMENT CLAUSE" CLAIM WAS FALSE AS FIRST WRITTEN (measured, then closed — `S1(6)`'s comment has
    // the numbers): the clause searched the 12-line window for `B-6` and separately for any cause word, and the PRE-LANDING window
    // (`git show HEAD:` lines 289-300) already carried both — the `B-3` docblock's "(`B-8` for the other gnosis panes,
    // `B-6`…`B-10`)" and the `B-5` docblock's `IPC_RAG_STORE_CHANGED` — so a census moved with NO `B-6` docblock read GREEN here too.
    // The clause is now ONE comment paragraph carrying `B-6` + `doc-nav` + a cause word (helper `censusCauseProblems`), and the
    // red direction is asserted against `PRE_LANDING_CENSUS_BLOCK` in `S1(6)`; THIS limb consumes the same helper, so there is one
    // clause in the battery, not two copies that can drift.
    const problems: string[] = []

    // ---- (1) THE CONSTANT (through `await import()`, per the reachability rule) ----------------------
    let hostModule: Record<string, unknown> | null = null
    try {
      hostModule = (await import('../../../src/renderer/sidebar-panes.js')) as Record<string, unknown>
    } catch (error) {
      problems.push(`limb D4: \`${SIDEBAR_FILE}\` does not resolve as a module (${String(error)}) — the pinned census's home is unreadable`)
    }
    const replumbed = hostModule === null ? undefined : hostModule['REPLUMBED_PANE_IDS']
    if (replumbed === undefined) {
      problems.push(
        `limb D4: \`REPLUMBED_PANE_IDS\` does not resolve on \`src/renderer/sidebar-panes.js\` — §4 pins it as the ONE declared ` +
          `constant naming the panes whose paint the host registers on the channel: exactly ${shown(PINNED_REPLUMBED)}`,
      )
    } else {
      const read = Array.isArray(replumbed) ? replumbed.map(String) : null
      const asSet = read === null ? null : [...new Set(read)].sort()
      const wantedSet = [...new Set(PINNED_REPLUMBED)].sort()
      if (asSet === null) {
        problems.push(`limb D4: \`REPLUMBED_PANE_IDS\` reads ${shown(replumbed)}, not an array of pane ids`)
      } else if (fingerprint(asSet) !== fingerprint(wantedSet)) {
        problems.push(
          `limb D4: \`REPLUMBED_PANE_IDS\` reads ${shown(read)}, whose SET is ${shown(asSet)}, not ${shown(wantedSet)} — §4: the census ` +
            `moves by a DELIBERATE, RECORDED EXTENSION per unit (\`B-5\`: \`['gnosis-query']\` -> \`['gnosis-query','crosslinks']\`; ` +
            `\`B-6\`: -> \`['gnosis-query','crosslinks','doc-nav']\`; \`B-7\`: -> +\`['search','template-editor']\`; \`B-8\` ` +
            `(\`D-44\`): -> +\`['gnosis-documents','gnosis-wikis']\`; ⟨UNIT \`B-9\` §4 \`F-9\`/§6 \`O1\`⟩: -> ` +
            `+\`['settings','gnosis-status']\`, the NINE-id SET above), and a later family unit must EXTEND this constant ` +
            `deliberately; no family keeps \`refresh()\` as a pane-update route any longer`,
        )
      }
      // ⟨INVERTED BY UNIT `B-9` (§3/§4, §6 `O1`) — THE SAME ARM, THE OPPOSITE READING.⟩ This arm used to RED when the census named
      // `settings` ("the operator pane is `B-9`'s surface … `updatePane` answers `operator-scope` for it; §4 keeps it OUT"). §3
      // replaced that refusal with the operator surface's OWN retained-graph paint, so the pane MUST be a census member now: an
      // operator pane outside the census can never receive its fire, whatever its paint answers.
      if (read !== null && !read.includes(SETTINGS)) {
        problems.push(
          `limb D4: \`REPLUMBED_PANE_IDS\` does NOT name \`${SETTINGS}\` — ⟨UNIT \`B-9\` §4\⟩ the operator pane MUST be in this ` +
            `census now: \`paintPane\`'s operator arm is a ROUTE to the operator surface's own retained-graph paint (§3), so the pane ` +
            `is paintable and a census without it leaves its fire with no listener`,
        )
      }
      if (read !== null && read.filter((id) => id === DOC_NAV).length > 1) {
        problems.push(`limb D4: \`REPLUMBED_PANE_IDS\` names \`${DOC_NAV}\` more than once — ONE id, ONE subscriber (\`B2-ADV-04\`)`)
      }
    }

    // ---- (2) THE SOURCE CLAUSE: the `B-6` CAUSE SENTENCE beside the declaration ------------------------
    // THE SAME CLAUSE AS `S1(6)`, through the SAME helper (`censusCauseProblems`), so the two rows cannot drift apart: ONE comment
    // paragraph in the window must carry `B-6` + `doc-nav` + a cause word. The BOTH-DIRECTIONS PROOF — the shipped text green, the
    // verbatim PRE-LANDING window (`PRE_LANDING_CENSUS_BLOCK`, `git show HEAD:` lines 289-301) red — is measured in `S1(6)`; this
    // limb inherits the identical reading, which is why it is not re-run here (and why a relapse into a window-wide token search
    // reds there, not silently here). As first authored, BOTH rows' clauses searched the window for `B-6` and separately for any
    // cause word, and the pre-landing bytes satisfied that (hasB6=true, causeWords=['store']) — so a census moved with NO `B-6`
    // cause docblock left this limb GREEN.
    let sidebarText = ''
    try {
      sidebarText = readText(SIDEBAR_FILE)
    } catch (error) {
      problems.push(`limb D4: \`${SIDEBAR_FILE}\` is unreadable (${String(error)}) — the census's comment clause has no subject`)
    }
    if (sidebarText !== '') {
      problems.push(...censusCauseProblems(sidebarText, `\`${SIDEBAR_FILE}\``, 'limb D4(2)'))
    }

    // ---- (3) THE CHANNEL CENSUS + THE FLOOR, ON ONE BOOTED HOST -------------------------------------
    const drive = await seedLightHost()
    try {
      problems.push(...drive.bootProblems)
      const channel = drive.channel
      // THE POSITIVE CONTROL FIRST: the host's OWN subscription answers for `crosslinks` (`B-5`'s landed arm).
      const positive = channel.fire(CROSSLINKS)
      if (positive.fired !== true || positive.handlers !== 1) {
        problems.push(
          `limb D4: \`fire('${CROSSLINKS}')\` answered ${shown(positive)}, not \`fired:true, handlers:1\` — §4's boot loop subscribes ` +
            `ONE handler per census id, so the census IS a listener on this channel. Without this arm the \`handlers:0\` arms below are ` +
            `satisfied by a host that subscribed nothing at all`,
        )
      }
      // `changePanes()` IS EXACTLY `[doc-nav]` — `F-2`'s empty shipped census, now ONE declaration wide.
      const changeCensus = channel.changePanes()
      if (fingerprint(changeCensus) !== fingerprint([DOC_NAV])) {
        problems.push(
          `limb D4: \`changePanes()\` reads ${shown(changeCensus)}, not exactly \`['${DOC_NAV}']\` — §4: the set of change-interested ` +
            `ids is ONE frozen declaration, and the boot loop subscribes a change-interested id with \`subscribeChange\` (\`subscribe\` ` +
            `PLUS a mark), so \`publishChange()\` can reach it. A pane registered with a plain \`subscribe\` is invisible here — and ` +
            `\`F-2\` records that the shipped census is EMPTY at this head`,
        )
      }
      // ONE REGISTRATION PER ID (`B2-ADV-04`) on the change-interested id too: two subscribers (a `subscribeChange` beside the boot
      // loop's plain `subscribe`) would run the pane's whole re-read + paint twice per engine frame.
      const docNavReport = channel.fire(DOC_NAV)
      if (docNavReport.fired !== true || docNavReport.handlers !== 1) {
        problems.push(
          `limb D4: \`fire('${DOC_NAV}')\` answered ${shown(docNavReport)}, not \`fired:true, handlers:1\` — §4: the boot loop makes ` +
            `ONE registration per id and picks the DECLARATION (\`subscribeChange\` for a change-interested id, \`subscribe\` for ` +
            `every other) — NEVER both (\`B2-ADV-04\`)`,
        )
      }
      if (fingerprint(channel.recordPanes()) !== fingerprint([])) {
        problems.push(`limb D4: \`recordPanes()\` reads ${shown(channel.recordPanes())}, not \`[]\` — the RECORD census stays empty (\`O-4\`: \`B-10\` authors the first reader)`)
      }
      // THE NEGATIVES: the families that keep `refresh()` reach NO listener.
      // ⟨`B-7` — `search`/`template-editor` ARE LISTENERS NOW, SO THEIR ARMS ARE POSITIVE CONTROLS, NEVER DELETED ONES.⟩ The census
      // was extended by exactly TWO ids and each is subscribed ONCE by the ONE boot loop, so a fire reaches each ONCE
      // (`handlers:1` is `B2-ADV-04` in its positive form: a stacked second subscription answers `handlers:2`). ⟨UNIT `B-9` §6 `O1`⟩
      // the LAST TWO `fired:false, handlers:0` subjects (`settings`, `gnosis-status`) are now positive arms in the `B9` loop below,
      // so the loop under them reads ZERO — the live floor that no family is pre-migration, kept rather than deleted.
      for (const paneId of B7_MOVED_PANES) {
        const report = channel.fire(paneId)
        if (report.fired !== true || report.handlers !== 1) {
          problems.push(
            `limb D4: \`fire('${paneId}')\` answered ${shown(report)}, not \`fired:true, handlers:1\` — \`B-7\` EXTENDED the census by ` +
              `this id deliberately, and the ONE boot loop subscribes ONE handler per census id, so the census IS a listener here and ` +
              `ONE registration is what \`B2-ADV-04\` allows`,
          )
        }
      }
      // ⟨`B-8` — THE SAME POSITIVE GRADE, ONE UNIT LATER (`D-44`, §12a).⟩ `gnosis-documents`/`gnosis-wikis` ARE census members now,
      // so their `fired:true, handlers:1` arm is the positive form of `B2-ADV-04` (a stacked subscription answers `handlers:2`) and
      // the ONLY reading that shows the recorded constant is an ATTACHMENT on this channel rather than a larger literal.
      for (const paneId of B8_MOVED_PANES) {
        const report = channel.fire(paneId)
        if (report.fired !== true || report.handlers !== 1) {
          problems.push(
            `limb D4: \`fire('${paneId}')\` answered ${shown(report)}, not \`fired:true, handlers:1\` — \`B-8\` EXTENDED the census ` +
              `by this id deliberately (grant lines 1 and 2 give it its own producer), and the ONE boot loop subscribes ONE handler ` +
              `per census id, so the census IS a listener here and ONE registration is what \`B2-ADV-04\` allows`,
          )
        }
      }
      // ⟨ADDED BY UNIT `B-9` (§4 `F-9`, §6 `O1`) — THE EXACT RE-STATEMENT OF THE TWO ARMS THAT USED TO READ `fired:false,
      // handlers:0`.⟩ `settings` and `gnosis-status` were the last families keeping the pre-migration `refresh()`; they are census
      // members with their own paint now, so the SAME TWO arms read `fired:true, handlers:1` — ONE registration per id (`B2-ADV-04`),
      // which also shows the operator panes really are ATTACHED on this channel and not only named in a larger literal.
      for (const paneId of B9_MOVED_PANES) {
        const report = channel.fire(paneId)
        if (report.fired !== true || report.handlers !== 1) {
          problems.push(
            `limb D4: \`fire('${paneId}')\` answered ${shown(report)}, not \`fired:true, handlers:1\` — ⟨UNIT \`B-9\` §4\⟩ the ` +
              `census EXTENDED by this operator id deliberately (its paint is the operator surface's own retained-graph paint, §3), ` +
              `and the ONE boot loop subscribes ONE handler per census id, so the census IS a listener here and ONE registration is ` +
              `what \`B2-ADV-04\` allows`,
          )
        }
      }
      for (const paneId of PRE_MIGRATION_PANES) {
        const report = channel.fire(paneId)
        if (report.fired !== false || report.handlers !== 0) {
          problems.push(
            `limb D4: \`fire('${paneId}')\` answered ${shown(report)}, not \`fired:false, handlers:0\` — \`${paneId}\` is NOT in ` +
              `\`REPLUMBED_PANE_IDS\`: it keeps the pre-migration \`refresh()\` route until its own unit (§4: the migration is ` +
              `incremental, never a big bang)`,
          )
        }
      }
      // THE FLOOR: `host.refresh()` re-assembles on THIS double.
      drive.counters.refresh = 0
      drive.counters.loadAppGraph = 0
      drive.counters.mountOperator = 0
      drive.counters.docHeads = 0
      let refreshThrew = ''
      try {
        await (drive.host['refresh'] as () => Promise<void>).call(drive.host)
      } catch (error) {
        refreshThrew = String(error)
      }
      if (refreshThrew !== '') {
        problems.push(`limb D4: \`host.refresh()\` THREW on this harness (${refreshThrew}) — the pre-migration route is the floor and must run`)
      }
      if (drive.counters.loadAppGraph < 1) {
        problems.push(
          `limb D4: \`host.refresh()\` reached \`loadAppGraph\` ${drive.counters.loadAppGraph} time(s), not >= 1 — with this false, the ` +
            `integration file's \`loadAppGraph === 0\` on a pane update could not discriminate`,
        )
      }
      if (drive.counters.mountOperator < 1) {
        problems.push(
          `limb D4: \`host.refresh()\` reached \`mountOperator\` ${drive.counters.mountOperator} time(s), not >= 1 — the pre-migration ` +
            `route re-assembles BOTH surfaces (M17)`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb D4 — the census moves by exactly ONE and NO family keeps \`refresh()\` (§6 D4; §4's ONE declared census; ` +
        `\`F-2\`; ⟨RE-STATED BY UNIT \`B-9\` §4 \`F-9\`/§6 \`O1\`⟩). ${problems.length} problem(s). \`REPLUMBED_PANE_IDS\` must be ` +
        `exactly \`{gnosis-query, crosslinks, doc-nav, search, template-editor, gnosis-documents, gnosis-wikis, settings, ` +
        `gnosis-status}\` as a SET (this row's \`B-6\` recorded value EXTENDED by \`B-7\`'s, \`B-8\`'s AND \`B-9\`'s two ids, never ` +
        `relaxed), carry a \`B-6\` comment naming the cause beside its declaration, make \`changePanes()\` carry \`${DOC_NAV}\`, ` +
        `answer \`fired:true, handlers:1\` for \`${CROSSLINKS}\`, for \`B-7\`'s two moved ids, for \`B-8\`'s two AND for \`B-9\`'s ` +
        `two (\`${SETTINGS}\` and \`gnosis-status\`), and keep \`host.refresh()\` reaching \`loadAppGraph\` + ` +
        `\`mountOperator\` on this double (the floor under the integration rows' zeroes). envelope-class`,
    ).toEqual([])
  })
})
