// tests/unit/shell-chrome/pane-search-template.test.ts — unit `B-7` `pane-search-template`'s SOURCE/DECLARATION rows (`S1`, `S2`,
// `S3`), authored BEFORE any byte of the unit's landing (RCA-1: the red set runs first and is REPORTED before implementation). The
// host rows (`Q1`, `Q2`, `Q3`, `T1`, `T2`, `X1`, `X2`, `X3`, `X4`) live in
// `tests/integration/shell-chrome/pane-search-template.test.ts`.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-7-pane-search-template.md`
//   §3  THE ORDER IS LOAD-BEARING AT ALL FIVE PRODUCER SITES: `this.lastQueryResult = …` / `this.template = …` /
//       `this.templateValidation = …` BEFORE `this.events?.fire(<id>)`, so the paint (which runs synchronously inside the fire,
//       `ASM-B7-1`) authors the state the producer just committed; and in `onTemplateChanged` the fire ALSO precedes the KEPT
//       `this.editController.requestRebuild('template')`, so any later assemble authors the pane from fresh state.
//   §4  THE CENSUS MOVES BY EXACTLY TWO: `REPLUMBED_PANE_IDS` becomes the five-id SET
//       `{gnosis-query, crosslinks, doc-nav, search, template-editor}`, and `settings`/`gnosis-status`/`gnosis-documents`/
//       `gnosis-wikis` KEEP `refresh()`.
//   §5  THE WHOLE CHANGE SET is `src/renderer/sidebar-panes.ts`: the census; `submitQuery` (commit → fire, with the
//       `anyDirty()`/`loadAppGraph` block REMOVED); `submitAdvancedQuery`'s `rerender` (both arms → fire, `loadAppGraph` REMOVED);
//       `searchAdvancedToggle` (fire, `requestRebuild()` REMOVED); `onTemplateChanged` (commit → fire → KEEP
//       `requestRebuild('template')`); `templateValidateResult` (commit → fire, `requestRebuild()` REMOVED).
//   §6  the rows `S1` (THE LETTER), `S2` (THE PRODUCERS' ORDER, parsed as statements), `S3` (`paintReplumbedPane` owes NO arm —
//       `ASM-B7-1`, a DECLARED regression pin that is GREEN at the pre-landing head by design).
//   §9  the three asymmetries these rows grade: `ASM-B7-1` (no re-read arm) · `ASM-B7-3` (the settlement's re-assembly is
//       REMOVED, not additive) · `ASM-B7-4` (the template change's rebuild STAYS while the verdict's does not).
// `docs/L3/shell-chrome/pane-search-template.md` §1/§2 spells the seven sites and the three surviving shapes; §4 gives each row's
// subject and the mutation that reds it. `docs/L2/shell-chrome/pane-search-template.md` §2 states the ordering claim and §3 the
// all-zero re-read census (`Q1`'s `rag.query === 1` is what floors it there; `S3` is this file's half of `ASM-B7-1`).
//
// DECLARATIONS AND STATEMENTS ARE PARSED, NEVER SEARCHED (`D-38`'s lesson: a clause that matched a token's MENTION — a COMMENT —
// once latched wrongly and had to be re-anchored on declarations). Every clause below strips comments FIRST, then reads (a) the
// CENSUS ARRAY LITERAL off its own declaration and compares it as a SET, (b) each named method's BRACE-MATCHED body, and (c) the
// STATEMENT OFFSETS inside those bodies. A bare token search appears nowhere: `S1`'s four "carries NO …" arms ride the SAME
// instrument that FINDS those tokens in the fixture this file carries, `S1`'s SET arm proves it reads the PRE-LANDING declaration
// as RED before it reads the shipped file, and `S3`'s "no arm" arms sit beside the two arms the body DOES carry — the same reader
// is shown FINDING a `paneId === 'search'` arm in a defect fixture.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): ENVELOPE-CLASS AND PURE. Every row reads `src/**`'s TEXT and nothing else — no host, no DOM,
// no runtime, no bridge, no `installShim()`. What this file can NEVER read, named so nobody quotes it: that a fire PAINTS the pane,
// that `applied === ['pane-search']`, that every other materialized root is the SAME OBJECT, that §3's re-read census is all-zero,
// that the `INV-E` counters are `0/0/0`, that the AUTHORED tree carries `#advanced-search-toggle[data-expanded]` or the new zone
// list — all of that is `tests/integration/shell-chrome/pane-search-template.test.ts`'s nine rows over the REAL host, and the
// assembled app is `docs/L1/unit-b-7-pane-search-template.md` §8's two limbs (`G8`) alone.
//
// REACHABILITY RULE (this file always COLLECTS and RUNS): every subject is reached through `readFileSync` inside a `try`, and a
// missing subject is a NAMED problem inside the row's ONE aggregate `expect(problems, …)` — never an ENOENT crash, never a skip,
// never a raw `TypeError`.
//
// NON-VACUITY, ROW BY ROW (restated in each row's own comment): `S1`'s "carries NO …" arms ride `FORBIDDEN_TOKENS_FIXTURE_BODY`,
// where the same instrument FINDS every one of those tokens; `S2`'s parser is proven in BOTH directions from four fixtures it
// carries (the shipped inline shape and the `rerender`-helper shape PASS, a fire-before-commit body and a rebuild-above-fire body
// FAIL); `S3`'s arm reader is proven able to FIND a `search` arm (`ARM_FIXTURE_SEARCH_ARM_BODY`) and a `rag.query` bridge call
// before their ABSENCE in the shipped body is read, and the two landed arms are required PRESENT with their own `bridge.` calls.
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO: it writes nothing; it reads only the repo it lives in; no network, no electron, no spawn,
// no `git`, no `vi.mock`, no snapshot, no `console.log` (a reading that must be seen is folded into the aggregate message). Every
// path derives from THIS FILE's own location (`ROOT`), so a missing substrate is a REPORTED problem rather than a silent skip.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

/** The whole change set of this unit (§5) — the ONE file these three rows read. */
const SIDEBAR_FILE = 'src/renderer/sidebar-panes.ts'

/** The layer stamp EVERY failure message carries (D-10 / `RCA-12`). */
const LAYER =
  'envelope/pure class — src/** TEXT with comments STRIPPED, brace-matched bodies and a statement parser; no host, no DOM, no runtime'

const CROSSLINKS = 'crosslinks'
const DOC_NAV = 'doc-nav'
const SEARCH = 'search'
const TEMPLATE_EDITOR = 'template-editor'
const CENSUS_NAME = 'REPLUMBED_PANE_IDS'

/** §4: the census AFTER this unit's TWO-id move. Compared as a SET — the claim is MEMBERSHIP, never the spelling order. */
const REQUIRED_CENSUS: readonly string[] = ['gnosis-query', CROSSLINKS, DOC_NAV, SEARCH, TEMPLATE_EDITOR]

/** §4: the four families that KEEP `refresh()`. Named so a census that swallowed one of them reds a second time, by name. */
const FAMILIES_KEEPING_REFRESH: readonly string[] = ['settings', 'gnosis-status', 'gnosis-documents', 'gnosis-wikis']

/** THE PRE-LANDING DECLARATION, VERBATIM off `src/renderer/sidebar-panes.ts` at this head — three ids, no `search`, no
 *  `template-editor`. It is carried as a FIXTURE because §4's SET arm has to prove it READS RED on a census that has not moved;
 *  a fixture whose mobile ids ever changed would itself be a problem (the floor arm below checks it stayed a three-id census). */
const PRE_MIGRATION_CENSUS_DECLARATION =
  "export const REPLUMBED_PANE_IDS: readonly string[] = Object.freeze(['gnosis-query', 'crosslinks', 'doc-nav'])"

// ===========================================================================
// THE INSTRUMENTS — each one a PARSER over comment-stripped text, never a token search.
// ===========================================================================

const fingerprint = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

/** A value as a failure message prints it. */
const shown = (value: unknown): string => (value === undefined ? '(absent)' : fingerprint(value))

/** A body flattened for a message, bounded so one aggregate message stays readable. */
const preview = (text: string, limit = 420): string => {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length <= limit ? flat : `${flat.slice(0, limit)}…`
}

const escapeRe = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Strip block comments and line comments while respecting string/template literals — every clause below is about the CODE, and a
 *  docblock is allowed to name the seam it is refusing without reddening the clause. (The `B-5`/`B-6` precedent, unchanged.) */
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
  const declaration = new RegExp(`\\b${escapeRe(name)}\\s*\\([^)]*\\)\\s*(?::[^{;]*)?\\{`)
  const match = declaration.exec(code)
  if (match === null) return null
  const start = code.indexOf('{', match.index + match[0].length - 1)
  if (start < 0) return null
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

/** THE CENSUS ARRAY LITERAL, parsed OFF its own `export const NAME … = Object.freeze([ … ])` DECLARATION — the ids it spells, in
 *  source order. `null` when no such declaration exists (a NAMED problem at the call site, never a silent empty set). */
function censusLiteralOf(code: string, name: string): string[] | null {
  const declaration = new RegExp(
    `export\\s+const\\s+${escapeRe(name)}\\s*(?::[^=;\\n]{0,80})?=\\s*Object\\s*\\.\\s*freeze\\s*\\(\\s*\\[([\\s\\S]*?)\\]`,
  )
  const match = declaration.exec(code)
  if (match === null) return null
  const ids: string[] = []
  const literal = /(['"])([^'"]*)\1/g
  let entry = literal.exec(match[1])
  while (entry !== null) {
    ids.push(entry[2])
    entry = literal.exec(match[1])
  }
  return ids
}

const sortedSet = (ids: readonly string[]): string[] => [...new Set(ids)].sort()

/** SET equality (§4: order-insensitive) — never a length test and never `includes` on one side only. */
function sameSet(left: readonly string[], right: readonly string[]): boolean {
  const a = sortedSet(left)
  const b = sortedSet(right)
  return a.length === b.length && a.every((id, index) => id === b[index])
}

/** A `fire('<id>')` call — the id is a QUOTED ARGUMENT of a `fire` call, never a bare token somewhere in a window. */
const firePattern = (paneId: string): RegExp => new RegExp(`\\bfire\\s*\\(\\s*['"\`]${escapeRe(paneId)}['"\`]\\s*\\)`)

/** How far back a statement's RECEIVER CHAIN may reach. A chain is `this.` / `this.events?.` / `this.editController.` — member
 *  access, never a block of code — so a bounded window is enough and keeps the walk honest. */
const RECEIVER_WINDOW = 240

/** A trailing run of member/receiver hops (`this.` · `?.` · `foo.bar.`) and layout whitespace — what may sit between a statement's
 *  head and the token a pattern matched. */
const RECEIVER_CHAIN = /(?:[A-Za-z0-9_$]+\s*\??\s*\.\s*)*$/

/** Is `at` the head of a STATEMENT of `body`? Two things are allowed in front of the matched token: a bounded chain of member /
 *  receiver hops (`this.editController.requestRebuild(…)` and `this.events?.fire(…)` BEGIN statements just as a bare
 *  `rerender()` does — a reader that only accepted a bare call would call a correctly-ordered body unordered), and layout
 *  whitespace after a statement boundary (`;`, `{`, `}`, a newline). Everything else — an operator, a `(`, a `,`, a comparison —
 *  means the match is a MENTION inside some other statement and is not counted. `D-38`'s rule applied one level down: a STATEMENT
 *  is read, never a mention. */
function isStatementStart(body: string, at: number): boolean {
  const from = Math.max(0, at - RECEIVER_WINDOW)
  const prefix = body.slice(from, at)
  // A statement boundary, then layout whitespace, then an optional receiver chain — and NOTHING else, up to the matched token.
  const boundary = from === 0 ? /(?:^|[;{}\n])[ \t]*/ : /[;{}\n][ \t]*/
  return new RegExp(`${boundary.source}${RECEIVER_CHAIN.source}`).test(prefix)
}

/** Every offset at which `pattern` begins a STATEMENT of `body`, in source order. */
function statementOffsets(body: string, pattern: RegExp): number[] {
  const out: number[] = []
  const scanner = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)
  let match = scanner.exec(body)
  while (match !== null) {
    if (isStatementStart(body, match.index)) out.push(match.index)
    match = scanner.exec(body)
  }
  return out
}

/** The LOCAL helpers a body declares whose OWN brace-matched body carries the pane's `fire(...)` — `S2`'s "or the call to a local
 *  helper that carries the fire" clause. `const rerender = (): void => { this.events?.fire('search') }` is the frozen spelling
 *  (`docs/L3/shell-chrome/pane-search-template.md` §2). */
function deliverersOf(body: string, paneId: string): string[] {
  const names: string[] = []
  const declaration =
    /(?:^|[;{}\n])\s*const\s+([A-Za-z0-9_$]+)\s*(?::[^=;\n]{0,80})?=\s*\([^)]*\)\s*(?::[^=;{}]*)?=>\s*\{/g
  let match = declaration.exec(body)
  while (match !== null) {
    const open = match.index + match[0].length - 1
    let depth = 0
    let close = -1
    for (let index = open; index < body.length; index += 1) {
      if (body[index] === '{') depth += 1
      else if (body[index] === '}') {
        depth -= 1
        if (depth === 0) {
          close = index
          break
        }
      }
    }
    if (close > open && firePattern(paneId).test(body.slice(open + 1, close))) names.push(match[1])
    match = declaration.exec(body)
  }
  return names
}

/** The `paneId === '<id>'` ARMS a body declares, with their offsets — the reader `S3` grades, and the reader whose ability to FIND
 *  a `search` arm its own fixture proves. */
function armsOf(body: string): { id: string; at: number }[] {
  const out: { id: string; at: number }[] = []
  const pattern = /paneId\s*===\s*(['"])([^'"]+)\1/g
  let match = pattern.exec(body)
  while (match !== null) {
    out.push({ id: match[2], at: match.index })
    match = pattern.exec(body)
  }
  return out
}

/** The `bridge.<group>.<method>(` CALLS a body carries, as `group.method` — the reader `S3` grades both ways (the two kept
 *  re-reads present, the two refused bridge calls absent). */
function bridgeCallsOf(body: string): string[] {
  const out = new Set<string>()
  const pattern = /\bbridge\s*\.\s*([A-Za-z0-9_$]+)\s*\.\s*([A-Za-z0-9_$]+)\s*\(/g
  let match = pattern.exec(body)
  while (match !== null) {
    out.add(`${match[1]}.${match[2]}`)
    match = pattern.exec(body)
  }
  return [...out].sort()
}

// ===========================================================================
// `S1` — THE LETTER (§5's five sites, read off their OWN brace-matched bodies, comments stripped).
// ===========================================================================

/** One graded reading: the label a message prints and the pattern the instrument reads. */
interface LetterArm {
  label: string
  pattern: RegExp
}

const INSTRUMENT_LOAD_APP_GRAPH: LetterArm = { label: '`loadAppGraph(…)` call', pattern: /\bloadAppGraph\s*\(/ }
const INSTRUMENT_ANY_DIRTY: LetterArm = { label: '`anyDirty()` guard', pattern: /\banyDirty\s*\(/ }
const INSTRUMENT_REQUEST_REBUILD: LetterArm = { label: '`requestRebuild(…)` call', pattern: /\brequestRebuild\s*\(/ }
const INSTRUMENT_FIRE_SEARCH: LetterArm = { label: "`fire('search')` call", pattern: firePattern(SEARCH) }
const INSTRUMENT_FIRE_TEMPLATE: LetterArm = { label: "`fire('template-editor')` call", pattern: firePattern(TEMPLATE_EDITOR) }
const INSTRUMENT_TEMPLATE_COMMIT: LetterArm = {
  label: '`this.template =` commit',
  pattern: /this\s*\.\s*template\s*=(?![=>])/,
}
const INSTRUMENT_REBUILD_TEMPLATE: LetterArm = {
  label: "`requestRebuild('template')` call (the KEPT rebuild, `ASM-B7-4`)",
  pattern: /requestRebuild\s*\(\s*['"]template['"]\s*\)/,
}

/** THE FOUR "carries NO …" ARMS' OWN FLOOR: every instrument above that is used as a NEGATIVE is proved able to SEE its token in
 *  this fixture — the shipped head's own `submitQuery` shape, which carries all three of them plus the fire. Without this, "the
 *  body carries NO `loadAppGraph`" could be a blind instrument rather than a reading. */
const FORBIDDEN_TOKENS_FIXTURE_BODY = [
  "    if (!value) return",
  "    void this.bridge.rag.query(value, this.lastOperatorSettings?.topK ?? 5).then((result) => {",
  '      this.lastQueryResult = result',
  '      this.events?.fire(\'search\')',
  '      if (this.editController.anyDirty()) return',
  '      if (this.runtime && this.lastTraversalEnvelope) {',
  '        this.loadAppGraph(this.runtime, this.lastTraversalEnvelope)',
  '      }',
  '      this.editController.requestRebuild()',
  '    })',
].join('\n')

/** The three negative instruments `FORBIDDEN_TOKENS_FIXTURE_BODY` must prove visible. */
const NEGATIVE_INSTRUMENTS: readonly LetterArm[] = [
  INSTRUMENT_LOAD_APP_GRAPH,
  INSTRUMENT_ANY_DIRTY,
  INSTRUMENT_REQUEST_REBUILD,
]

/** One of §5's five producer sites, the letter it owes, and the letter it must NOT keep. */
interface LetterLimb {
  limb: string
  method: string
  why: string
  required: readonly LetterArm[]
  forbidden: readonly LetterArm[]
}

const LETTER_LIMBS: readonly LetterLimb[] = [
  {
    limb: 'S1(b) submitQuery',
    method: 'submitQuery',
    why:
      "§5: the settlement COMMITS `lastQueryResult` and FIRES its own pane, and the `anyDirty()` guard + the `loadAppGraph` " +
      're-assembly are REMOVED — `ASM-B7-3`, `F-2`: the only state that re-assembly re-authored is this pane\'s own',
    required: [INSTRUMENT_FIRE_SEARCH],
    forbidden: [INSTRUMENT_LOAD_APP_GRAPH, INSTRUMENT_ANY_DIRTY],
  },
  {
    limb: 'S1(c) submitAdvancedQuery',
    method: 'submitAdvancedQuery',
    why:
      "§5: BOTH arms (`then` and `catch`) commit and then call the local `rerender`, which FIRES — the `anyDirty()`/" +
      '`loadAppGraph` block inside it is DELETED',
    required: [INSTRUMENT_FIRE_SEARCH],
    forbidden: [INSTRUMENT_LOAD_APP_GRAPH, INSTRUMENT_ANY_DIRTY],
  },
  {
    limb: 'S1(d) searchAdvancedToggle',
    method: 'searchAdvancedToggle',
    why:
      "§5: the disclosure is the pane's OWN state — the toggle commits `advancedSearchOpen` and FIRES, and its `requestRebuild()` " +
      'is REMOVED (it re-authored roots this pane does not own)',
    required: [INSTRUMENT_FIRE_SEARCH],
    forbidden: [INSTRUMENT_REQUEST_REBUILD],
  },
  {
    limb: 'S1(e) templateValidateResult',
    method: 'templateValidateResult',
    why:
      "§5/`ASM-B7-4`: the verdict reaches NOBODY but this pane's render, so the seam COMMITS `templateValidation` and FIRES, and " +
      'its `requestRebuild()` is REMOVED — pure waste',
    required: [INSTRUMENT_FIRE_TEMPLATE],
    forbidden: [INSTRUMENT_REQUEST_REBUILD],
  },
  {
    limb: 'S1(f) onTemplateChanged',
    method: 'onTemplateChanged',
    why:
      "§5/`ASM-B7-4`: the store's push COMMITS `this.template`, FIRES the pane AND KEEPS `requestRebuild('template')` — the " +
      'asymmetry: a template change IS a page-structure change, so the rebuild STAYS while the verdict\'s does not',
    required: [INSTRUMENT_TEMPLATE_COMMIT, INSTRUMENT_FIRE_TEMPLATE, INSTRUMENT_REBUILD_TEMPLATE],
    forbidden: [],
  },
]

describe('pane-search-template — S1: the LETTER — the census is the five-id SET, both settlements fire with no `loadAppGraph`/`anyDirty`, the toggle and the verdict carry no `requestRebuild`, and `onTemplateChanged` commits + fires + KEEPS its rebuild', () => {
  it("S1 — `REPLUMBED_PANE_IDS` parses to {gnosis-query, crosslinks, doc-nav, search, template-editor}; `submitQuery`/`submitAdvancedQuery` fire `search` with no `loadAppGraph`/`anyDirty`; `searchAdvancedToggle`/`templateValidateResult` fire with no `requestRebuild`; `onTemplateChanged` commits, fires and keeps `requestRebuild('template')`", () => {
    // §6 `S1`; §4's TWO-id census move; §5's five sites; §9's `ASM-B7-1`/`ASM-B7-3`/`ASM-B7-4`.
    // WHY EACH ARM IS THE SHAPE IT IS: the census is read as an ARRAY LITERAL OFF ITS DECLARATION and compared as a SET (so a
    // reorder is lawful and a sixth/dropped/duplicated id is not), and every letter arm reads its OWN named method's brace-matched
    // body — so a fire in a NEIGHBOURING method satisfies nothing, and a fire mentioned in a docblock satisfies nothing (comments
    // are stripped FIRST).
    // MUTATION THAT WOULD RED IT: keeping `loadAppGraph` beside the `search` fire; keeping either `requestRebuild()`; removing the
    // template change's KEPT rebuild; firing `doc-nav` from `submitQuery`; a census of three ids, of six, of a duplicated id, or of
    // an id from the four families that keep `refresh()`.
    // THE NEGATIVES ARE FLOORED ON THE SAME INSTRUMENT: `FORBIDDEN_TOKENS_FIXTURE_BODY` is the shipped head's own `submitQuery`
    // shape and carries `loadAppGraph`, `anyDirty` AND `requestRebuild` — if those three readers could not see them there, the
    // "carries NO …" arms below would be blind instruments rather than readings.
    const problems: string[] = []
    let sidebarText = ''
    try {
      sidebarText = readText(SIDEBAR_FILE)
    } catch (error) {
      problems.push(
        `S1: \`${SIDEBAR_FILE}\` is unreadable (${String(error)}) — the letter has no subject. LAYER: ${LAYER}`,
      )
    }

    if (sidebarText !== '') {
      const code = stripComments(sidebarText)

      // ---- (a) THE CENSUS IS THE FIVE-ID SET ------------------------------------------------------
      const parsedCensus = censusLiteralOf(code, CENSUS_NAME)
      if (parsedCensus === null) {
        problems.push(
          `S1(a): no \`export const ${CENSUS_NAME} … = Object.freeze([ … ])\` DECLARATION was found in \`${SIDEBAR_FILE}\` — §4's ` +
            `TWO-id move has no anchor, so the census clause cannot be read at all. LAYER: ${LAYER}`,
        )
      } else {
        if (new Set(parsedCensus).size !== parsedCensus.length) {
          problems.push(
            `S1(a): \`${CENSUS_NAME}\` in \`${SIDEBAR_FILE}\` parses to ${shown(parsedCensus)} — it spells a DUPLICATE id. §4: the ` +
              `census is a SET of five ids, and a duplicate is a second registration shape waiting to happen (\`B2-ADV-04\`). ` +
              `LAYER: ${LAYER}`,
          )
        }
        if (!sameSet(parsedCensus, REQUIRED_CENSUS)) {
          const missing = REQUIRED_CENSUS.filter((id) => !parsedCensus.includes(id))
          const unexpected = parsedCensus.filter((id) => !REQUIRED_CENSUS.includes(id))
          problems.push(
            `S1(a): \`${CENSUS_NAME}\` in \`${SIDEBAR_FILE}\` parses to ${shown(parsedCensus)} — §4's move makes it the five-id SET ` +
              `${shown([...REQUIRED_CENSUS])} compared as a SET (order-insensitive). RE-PARSED VALUES: parsed=${shown(parsedCensus)} ` +
              `required=${shown([...REQUIRED_CENSUS])} missing=${shown(missing)} unexpected=${shown(unexpected)}. ` +
              `\`${CROSSLINKS}\` and \`${DOC_NAV}\` are \`B-5\`'s and \`B-6\`'s landed members and must survive the move; a sixth id ` +
              `would be a silent second subscriber. LAYER: ${LAYER}`,
          )
        }
        const swallowed = FAMILIES_KEEPING_REFRESH.filter((id) => parsedCensus.includes(id))
        if (swallowed.length > 0) {
          problems.push(
            `S1(a): \`${CENSUS_NAME}\` in \`${SIDEBAR_FILE}\` now carries ${shown(swallowed)} — §4: those four families ` +
              `(${shown([...FAMILIES_KEEPING_REFRESH])}) KEEP \`refresh()\` after this unit; five registered panes are ` +
              `re-plumbed, four are not. RE-PARSED VALUE: ${shown(parsedCensus)}. LAYER: ${LAYER}`,
          )
        }
        // THE FLOOR, IN THE OTHER DIRECTION: the SAME parser on the PRE-LANDING declaration (carried verbatim above) must return
        // the three-id census AND must not be judged equal to the required SET — otherwise the arm above cannot tell this head from
        // the landing, and "five ids" would be a claim no reading supports.
        const fixtureCensus = censusLiteralOf(PRE_MIGRATION_CENSUS_DECLARATION, CENSUS_NAME)
        if (fixtureCensus === null || fixtureCensus.length !== 3 || sameSet(fixtureCensus, REQUIRED_CENSUS)) {
          problems.push(
            `S1(a·floor): the parser read the PRE-LANDING fixture as ${shown(fixtureCensus)} — it must read ` +
              `\`${PRE_MIGRATION_CENSUS_DECLARATION}\` as the three-id census and must NOT judge it equal to the required five-id ` +
              `SET ${shown([...REQUIRED_CENSUS])}. With the fixture misread, the arm above is vacuous. LAYER: ${LAYER}`,
          )
        }
      }

      // ---- (b)…(f) THE FIVE BODIES, EACH READ AS ITS OWN BRACE-MATCHED BODY ------------------------
      for (const limb of LETTER_LIMBS) {
        const body = methodBodyOf(code, limb.method)
        if (body === null) {
          problems.push(
            `${limb.limb}: no \`${limb.method}(…)\` declaration with a BODY was found in \`${SIDEBAR_FILE}\` — ${limb.why}. ` +
              `PARSED VALUE: null (no brace-matched body). LAYER: ${LAYER}`,
          )
          continue
        }
        for (const arm of limb.required) {
          if (!arm.pattern.test(body)) {
            problems.push(
              `${limb.limb}: \`${limb.method}\`'s body in \`${SIDEBAR_FILE}\` carries NO ${arm.label} — ${limb.why}. ` +
                `PARSED VALUE: ${shown(preview(body))}. LAYER: ${LAYER}`,
            )
          }
        }
        for (const arm of limb.forbidden) {
          if (arm.pattern.test(body)) {
            problems.push(
              `${limb.limb}: \`${limb.method}\`'s body in \`${SIDEBAR_FILE}\` STILL carries the ${arm.label} — ${limb.why}. ` +
                `PARSED VALUE: ${shown(preview(body))}. LAYER: ${LAYER}`,
            )
          }
        }
      }

      // ---- THE FLOOR FOR EVERY "carries NO …" ARM -------------------------------------------------
      const unreadable = NEGATIVE_INSTRUMENTS.filter((arm) => !arm.pattern.test(FORBIDDEN_TOKENS_FIXTURE_BODY))
      if (unreadable.length > 0) {
        problems.push(
          `S1(floor): the instrument does NOT see ${shown(unreadable.map((arm) => arm.label))} in the fixture it carries — every ` +
            `"carries NO …" arm above would be a blind spot rather than a reading. FIXTURE: ${shown(preview(FORBIDDEN_TOKENS_FIXTURE_BODY))}. ` +
            `LAYER: ${LAYER}`,
        )
      }
      if (!firePattern(SEARCH).test(FORBIDDEN_TOKENS_FIXTURE_BODY)) {
        problems.push(
          `S1(floor): the fire instrument does not see the \`fire('${SEARCH}')\` it was given in ` +
            `\`FORBIDDEN_TOKENS_FIXTURE_BODY\`, so the REQUIRED arms above and the forbidden ones would not be reading the same ` +
            `kind of thing. FIXTURE: ${shown(preview(FORBIDDEN_TOKENS_FIXTURE_BODY))}. LAYER: ${LAYER}`,
        )
      }
    }

    expect(
      problems,
      `S1 — THE LETTER (§6 S1; §4's TWO-id census move; §5's five sites; \`ASM-B7-1\`/\`ASM-B7-3\`/\`ASM-B7-4\`). ` +
        `${problems.length} problem(s). Inside \`${SIDEBAR_FILE}\`: \`${CENSUS_NAME}\` parsing as the SET ` +
        `${shown([...REQUIRED_CENSUS])}; \`submitQuery\` and \`submitAdvancedQuery\` carrying a \`fire('${SEARCH}')\` and NO ` +
        `\`loadAppGraph\`/\`anyDirty\`; \`searchAdvancedToggle\` and \`templateValidateResult\` carrying their fire and NO ` +
        `\`requestRebuild\`; and \`onTemplateChanged\` carrying the \`this.template =\` commit, the fire AND the KEPT ` +
        `\`requestRebuild('template')\`. ${LAYER}`,
    ).toEqual([])
  })
})

// ===========================================================================
// `S2` — THE PRODUCERS' ORDER, PARSED AS STATEMENTS (`D-38`), proven in BOTH directions.
// ===========================================================================

/** A commit statement a site owes, named for the message. */
interface CommitArm {
  what: string
  pattern: RegExp
}

const COMMIT_LAST_QUERY_RESULT: CommitArm = {
  what: 'this.lastQueryResult =',
  pattern: /this\s*\.\s*lastQueryResult\s*=(?![=>])/,
}
const COMMIT_ADVANCED_ERROR: CommitArm = {
  what: 'this.advancedSearchError =',
  pattern: /this\s*\.\s*advancedSearchError\s*=(?![=>])/,
}
const COMMIT_ADVANCED_OPEN: CommitArm = {
  what: 'this.advancedSearchOpen =',
  pattern: /this\s*\.\s*advancedSearchOpen\s*=(?![=>])/,
}
const COMMIT_TEMPLATE: CommitArm = { what: 'this.template =', pattern: /this\s*\.\s*template\s*=(?![=>])/ }
const COMMIT_TEMPLATE_VALIDATION: CommitArm = {
  what: 'this.templateValidation =',
  pattern: /this\s*\.\s*templateValidation\s*=(?![=>])/,
}

/** The rebuild `onTemplateChanged` KEEPS (`ASM-B7-4`) — the call the fire must precede. */
const KEPT_TEMPLATE_REBUILD = /requestRebuild\s*\(\s*['"]template['"]\s*\)/

/** One of the five bodies, the commits it owes, and (for the store's push alone) the rebuild the fire must precede. */
interface OrderSpec {
  limb: string
  where: string
  paneId: string
  commits: readonly CommitArm[]
  rebuildAfterFire?: RegExp
  why: string
}

const ORDER_SPECS: readonly OrderSpec[] = [
  {
    limb: 'S2 submitQuery',
    where: 'submitQuery',
    paneId: SEARCH,
    commits: [COMMIT_LAST_QUERY_RESULT],
    why: '§3: the settlement commits `lastQueryResult` BEFORE it fires, so the synchronous paint authors the new answer',
  },
  {
    limb: 'S2 submitAdvancedQuery',
    where: 'submitAdvancedQuery',
    paneId: SEARCH,
    commits: [COMMIT_LAST_QUERY_RESULT, COMMIT_ADVANCED_ERROR],
    why:
      '§3: BOTH arms commit first (`lastQueryResult`+`advancedSearchError` in `then`, `advancedSearchError` in `catch`) and the ' +
      'fire is delivered by the local helper they call AFTERWARDS',
  },
  {
    limb: 'S2 searchAdvancedToggle',
    where: 'searchAdvancedToggle',
    paneId: SEARCH,
    commits: [COMMIT_ADVANCED_OPEN],
    why: '§3: the disclosure flips FIRST and the fire follows, so the paint authors the flipped disclosure',
  },
  {
    limb: 'S2 templateValidateResult',
    where: 'templateValidateResult',
    paneId: TEMPLATE_EDITOR,
    commits: [COMMIT_TEMPLATE_VALIDATION],
    why: '§3: the verdict is committed BEFORE the fire, so the paint authors the inline valid/error feedback',
  },
  {
    limb: 'S2 onTemplateChanged',
    where: 'onTemplateChanged',
    paneId: TEMPLATE_EDITOR,
    commits: [COMMIT_TEMPLATE],
    rebuildAfterFire: KEPT_TEMPLATE_REBUILD,
    why:
      '§3/`ASM-B7-4`: the template is committed, the pane is FIRED, and only THEN is the KEPT `requestRebuild(\'template\')` ' +
      'issued — the paint is issued first, so any later assemble authors the pane from fresh state',
  },
]

/** THE ORDER CLAUSE, read on a GIVEN body: every commit statement must be delivered by a LATER `fire('<id>')` statement, or by a
 *  LATER call to a local helper whose own body carries that fire; and where the site owes one, the fire must precede
 *  `requestRebuild('template')`. Returns the problems it reads — `[]` only when every commit is ordered. `where` only labels the
 *  text in the message; nothing here reads the filesystem, which is what lets `S2` prove the parser in BOTH directions. */
function orderProblems(body: string, spec: OrderSpec, where: string): string[] {
  const problems: string[] = []
  const helpers = deliverersOf(body, spec.paneId)
  const deliveries: { what: string; at: number }[] = []
  for (const at of statementOffsets(body, firePattern(spec.paneId))) {
    deliveries.push({ what: `fire('${spec.paneId}') statement`, at })
  }
  for (const name of helpers) {
    for (const at of statementOffsets(body, new RegExp(`\\b${escapeRe(name)}\\s*\\(\\s*\\)`))) {
      deliveries.push({ what: `the call \`${name}()\` to a local helper carrying the fire`, at })
    }
  }
  const deliveriesInOrder = [...deliveries].sort((left, right) => left.at - right.at)

  for (const commit of spec.commits) {
    const commitAt = statementOffsets(body, commit.pattern)[0]
    if (commitAt === undefined) {
      problems.push(
        `${spec.limb}: ${where} carries NO \`${commit.what}\` STATEMENT — ${spec.why}. Without the commit there is nothing for the ` +
          `fire to deliver. PARSED VALUES: commits=${shown(spec.commits.map((arm) => arm.what))} ` +
          `deliveries=${shown(deliveriesInOrder.map((delivery) => delivery.what))}. LAYER: ${LAYER}`,
      )
      continue
    }
    const later = deliveriesInOrder.find((delivery) => delivery.at > commitAt)
    if (later === undefined) {
      problems.push(
        `${spec.limb}: in ${where} the commit \`${commit.what}\` (statement offset ${commitAt}) is delivered by NOTHING — no LATER ` +
          `\`fire('${spec.paneId}')\` statement and no LATER call to a local helper carrying the fire. ${spec.why}. ` +
          `PARSED VALUES: commitAt=${commitAt} localHelpers=${shown(helpers)} ` +
          `deliveries=${shown(deliveriesInOrder.map((delivery) => `${delivery.what}@${delivery.at}`))}. ` +
          `BODY: ${shown(preview(body))}. LAYER: ${LAYER}`,
      )
    }
  }

  if (spec.rebuildAfterFire !== undefined) {
    const rebuildAt = statementOffsets(body, spec.rebuildAfterFire)[0]
    if (rebuildAt === undefined) {
      problems.push(
        `${spec.limb}: ${where} carries NO \`requestRebuild('template')\` statement — \`ASM-B7-4\`: the template change's rebuild ` +
          `STAYS (a template change IS a page-structure change; the fire is ADDITIVE, \`ASM-B5-2\`'s rule). BODY: ` +
          `${shown(preview(body))}. LAYER: ${LAYER}`,
      )
    } else if (deliveriesInOrder.length === 0) {
      problems.push(
        `${spec.limb}: ${where} carries NO delivery at all (no \`fire('${spec.paneId}')\` statement and no local helper carrying ` +
          `one), so the KEPT rebuild at statement offset ${rebuildAt} has no fire to precede. ${spec.why}. BODY: ` +
          `${shown(preview(body))}. LAYER: ${LAYER}`,
      )
    } else if (deliveriesInOrder[0].at > rebuildAt) {
      problems.push(
        `${spec.limb}: in ${where} the fire (${deliveriesInOrder[0].what}, statement offset ${deliveriesInOrder[0].at}) sits AFTER ` +
          `\`requestRebuild('template')\` (statement offset ${rebuildAt}) — ${spec.why}. The paint must be ISSUED first: a rebuild ` +
          `above the fire lets the assemble run against stale pane state. BODY: ${shown(preview(body))}. LAYER: ${LAYER}`,
      )
    }
  }
  return problems
}

// ---- THE FOUR FIXTURES THE PARSER IS PROVEN ON, both directions --------------------------------

/** DIRECTION 1(a) — THE SHIPPED INLINE SHAPE, verbatim from `docs/L3/shell-chrome/pane-search-template.md` §2's `submitQuery`:
 *  the commit and the fire as two statements of the same settlement. It MUST pass. */
const INLINE_SHAPE_BODY = [
  "    void this.bridge.rag.query(value, this.lastOperatorSettings?.topK ?? 5).then((result) => {",
  '      this.lastQueryResult = result',
  "      this.events?.fire('search')",
  '    })',
].join('\n')

/** DIRECTION 1(b) — THE `rerender`-HELPER SHAPE, verbatim from the same page's `submitAdvancedQuery`: ONE fire in a local helper
 *  the two arms call AFTER committing. It MUST pass (`S2`'s helper rule; without it the shipped landing would red its own row). */
const HELPER_SHAPE_BODY = [
  "    const rerender = (): void => { this.events?.fire('search') }",
  '    void this.bridge.rag',
  '      .query(value, this.lastOperatorSettings?.topK ?? 5, undefined, options ?? {})',
  '      .then((result) => {',
  '        this.lastQueryResult = result',
  '        this.advancedSearchError = null',
  '        rerender()',
  '      })',
  '      .catch((e: unknown) => {',
  '        this.advancedSearchError = e instanceof Error ? e.message : String(e)',
  '        rerender()',
  '      })',
].join('\n')

/** DIRECTION 2(a) — THE DEFECT SIMULATED: the fire ABOVE its commit. Every arm is present, so a clause that accepted this would be
 *  reading PRESENCE, not ORDER. It MUST fail. */
const FIRE_BEFORE_COMMIT_BODY = [
  "    this.events?.fire('search')",
  '    this.lastQueryResult = result',
].join('\n')

/** DIRECTION 2(b) — THE DEFECT SIMULATED: the KEPT rebuild placed ABOVE the fire. Commit, fire and rebuild are all present, so only
 *  an ORDER read can catch it. It MUST fail. */
const REBUILD_ABOVE_FIRE_BODY = [
  '    this.template = payload.template',
  "    this.editController.requestRebuild('template')",
  "    this.events?.fire('template-editor')",
].join('\n')

describe("pane-search-template — S2: the PRODUCERS' ORDER, parsed as STATEMENTS — every commit is delivered by a later fire (or a later call to a local helper carrying it), and `onTemplateChanged`'s fire precedes its KEPT rebuild", () => {
  it('S2 — the inline shape and the `rerender`-helper shape PASS the order parser, a fire-before-commit body and a rebuild-above-fire body FAIL it, and all five shipped bodies are ordered (commit → fire; and in `onTemplateChanged` fire → `requestRebuild(\'template\')`)', () => {
    // §6 `S2`; §3's ordering claim at all five sites; §9's `ASM-B7-4`; `D-38`'s rule ("a token search is not a declaration search"
    // — here, a statement search).
    // WHY A STATEMENT PARSER: a `fire(` that merely EXISTS in the body proves nothing about ORDER, and the shipped head HAS both the
    // commit and (in `submitAdvancedQuery`) a local helper — so the defect this row grades is purely positional. Every pattern is
    // resolved to a STATEMENT OFFSET (its only predecessor may be `;`, `{`, `}` or a newline, after layout whitespace) and the
    // comparison is offset-to-offset.
    // NON-VACUITY, IN BOTH DIRECTIONS, FROM THE FOUR FIXTURES ABOVE: the two shapes the contract SPELLS must PASS and the two wrong
    // shapes must FAIL, and each fixture is additionally checked to CARRY the statements it claims (so a fixture that lost its
    // commit cannot make the red direction vacuous).
    // MUTATION THAT WOULD RED IT: a fire issued before its commit; a commit with no delivery after it (the pre-landing head's own
    // defect, where `lastQueryResult` commits and nothing fires); the rebuild moved above the fire; and — the proof arm — a clause
    // that ACCEPTED either wrong-order fixture, which is exactly what a token/presence read would do.
    const problems: string[] = []

    const submitQuerySpec = ORDER_SPECS[0]
    const advancedSpec = ORDER_SPECS[1]
    const onTemplateSpec = ORDER_SPECS[4]

    // ---- DIRECTION 1: THE TWO SHAPES THE CONTRACT SPELLS MUST PASS --------------------------------
    const inlineReading = {
      commits: statementOffsets(INLINE_SHAPE_BODY, COMMIT_LAST_QUERY_RESULT.pattern),
      fires: statementOffsets(INLINE_SHAPE_BODY, firePattern(SEARCH)),
    }
    if (inlineReading.commits.length !== 1 || inlineReading.fires.length !== 1) {
      problems.push(
        `S2(fixture·inline): the SHIPPED-INLINE fixture carries ${inlineReading.commits.length} commit statement(s) and ` +
          `${inlineReading.fires.length} fire statement(s) — it must carry exactly one of each, or the PASS direction below ` +
          `tests a shape the contract does not spell. FIXTURE: ${shown(preview(INLINE_SHAPE_BODY))}. LAYER: ${LAYER}`,
      )
    }
    const inlinePass = orderProblems(INLINE_SHAPE_BODY, submitQuerySpec, 'the SHIPPED-INLINE fixture')
    if (inlinePass.length > 0) {
      problems.push(
        `S2(fixture·inline): the order clause REJECTED the shipped inline shape (commit then fire, both statements of one ` +
          `settlement) — reading: ${shown(inlinePass)}. FIXTURE: ${shown(preview(INLINE_SHAPE_BODY))}. LAYER: ${LAYER}`,
      )
    }

    const helperDeliverers = deliverersOf(HELPER_SHAPE_BODY, SEARCH)
    const helperCalls = statementOffsets(HELPER_SHAPE_BODY, /\brerender\s*\(\s*\)/)
    const helperCommits =
      statementOffsets(HELPER_SHAPE_BODY, COMMIT_LAST_QUERY_RESULT.pattern).length +
      statementOffsets(HELPER_SHAPE_BODY, COMMIT_ADVANCED_ERROR.pattern).length
    if (!helperDeliverers.includes('rerender') || helperCalls.length < 2 || helperCommits < 3) {
      problems.push(
        `S2(fixture·helper): the RERENDER-HELPER fixture reads deliverers=${shown(helperDeliverers)} calls=${helperCalls.length} ` +
          `commits=${helperCommits} — it must declare ONE local helper named \`rerender\` whose body carries the fire, call it at ` +
          `least twice (both arms) and carry the three commit statements, or the helper rule is untested. FIXTURE: ` +
          `${shown(preview(HELPER_SHAPE_BODY))}. LAYER: ${LAYER}`,
      )
    }
    const helperPass = orderProblems(HELPER_SHAPE_BODY, advancedSpec, 'the RERENDER-HELPER fixture')
    if (helperPass.length > 0) {
      problems.push(
        `S2(fixture·helper): the order clause REJECTED the \`rerender\`-helper shape (both arms commit and then CALL the helper ` +
          `that fires) — reading: ${shown(helperPass)}. A clause that only accepted an inline fire would red the landing ` +
          `\`docs/L3/shell-chrome/pane-search-template.md\` §2 spells. FIXTURE: ${shown(preview(HELPER_SHAPE_BODY))}. LAYER: ${LAYER}`,
      )
    }

    // ---- DIRECTION 2: THE TWO WRONG SHAPES MUST FAIL ---------------------------------------------
    const fireBeforeCommitPresent =
      statementOffsets(FIRE_BEFORE_COMMIT_BODY, COMMIT_LAST_QUERY_RESULT.pattern).length === 1 &&
      statementOffsets(FIRE_BEFORE_COMMIT_BODY, firePattern(SEARCH)).length === 1
    if (!fireBeforeCommitPresent) {
      problems.push(
        `S2(fixture·fire-first): the FIRE-BEFORE-COMMIT fixture no longer carries one commit AND one fire statement, so ` +
          `"it must fail" proves nothing about ORDER — only about absence. FIXTURE: ${shown(preview(FIRE_BEFORE_COMMIT_BODY))}. ` +
          `LAYER: ${LAYER}`,
      )
    } else if (orderProblems(FIRE_BEFORE_COMMIT_BODY, submitQuerySpec, 'the FIRE-BEFORE-COMMIT fixture').length === 0) {
      problems.push(
        `S2(fixture·fire-first): the order clause ACCEPTED a body whose fire STANDS ABOVE its commit — a parser that reads ` +
          `presence, not ORDER, passes the very defect §3 calls load-bearing (the paint would author the PREVIOUS answer). ` +
          `FIXTURE: ${shown(preview(FIRE_BEFORE_COMMIT_BODY))}. LAYER: ${LAYER}`,
      )
    }

    const rebuildAbovePresent =
      statementOffsets(REBUILD_ABOVE_FIRE_BODY, COMMIT_TEMPLATE.pattern).length === 1 &&
      statementOffsets(REBUILD_ABOVE_FIRE_BODY, firePattern(TEMPLATE_EDITOR)).length === 1 &&
      statementOffsets(REBUILD_ABOVE_FIRE_BODY, KEPT_TEMPLATE_REBUILD).length === 1
    if (!rebuildAbovePresent) {
      problems.push(
        `S2(fixture·rebuild-first): the REBUILD-ABOVE-FIRE fixture no longer carries the commit, the fire AND the rebuild, so ` +
          `"it must fail" proves nothing about ORDER. FIXTURE: ${shown(preview(REBUILD_ABOVE_FIRE_BODY))}. LAYER: ${LAYER}`,
      )
    } else if (orderProblems(REBUILD_ABOVE_FIRE_BODY, onTemplateSpec, 'the REBUILD-ABOVE-FIRE fixture').length === 0) {
      problems.push(
        `S2(fixture·rebuild-first): the order clause ACCEPTED a body whose KEPT \`requestRebuild('template')\` STANDS ABOVE the ` +
          `fire — \`ASM-B7-4\`'s whole point is that the paint is issued FIRST so any later assemble authors the pane from fresh ` +
          `state. FIXTURE: ${shown(preview(REBUILD_ABOVE_FIRE_BODY))}. LAYER: ${LAYER}`,
      )
    }

    // ---- THEN THE SHIPPED FILE, ONE SPEC PER PRODUCER SITE ---------------------------------------
    let sidebarText = ''
    try {
      sidebarText = readText(SIDEBAR_FILE)
    } catch (error) {
      problems.push(
        `S2: \`${SIDEBAR_FILE}\` is unreadable (${String(error)}) — the five producers' order has no subject. LAYER: ${LAYER}`,
      )
    }
    if (sidebarText !== '') {
      const code = stripComments(sidebarText)
      for (const spec of ORDER_SPECS) {
        const body = methodBodyOf(code, spec.where)
        if (body === null) {
          problems.push(
            `${spec.limb}: no \`${spec.where}(…)\` declaration with a BODY was found in \`${SIDEBAR_FILE}\` — ${spec.why}. ` +
              `PARSED VALUE: null (no brace-matched body). LAYER: ${LAYER}`,
          )
          continue
        }
        problems.push(...orderProblems(body, spec, `\`${SIDEBAR_FILE}\`'s \`${spec.where}\``))
      }
    }

    expect(
      problems,
      `S2 — THE PRODUCERS' ORDER, PARSED AS STATEMENTS (§6 S2; §3's order at all five sites; \`D-38\`; \`ASM-B7-4\`). ` +
        `${problems.length} problem(s). In each of the five bodies the COMMIT statement (\`this.lastQueryResult =\`, ` +
        `\`this.advancedSearchOpen =\`, \`this.template =\`, \`this.templateValidation =\`, \`this.advancedSearchError =\`) must ` +
        `PRECEDE the fire — directly, or through a later call to a local helper that carries it — and in \`onTemplateChanged\` the ` +
        `fire must precede \`requestRebuild('template')\`. Proven in both directions from four fixtures this file carries. ${LAYER}`,
    ).toEqual([])
  })
})

// ===========================================================================
// `S3` — `paintReplumbedPane` OWES NO ARM (`ASM-B7-1`): a DECLARED regression pin, GREEN at this head by design.
// ===========================================================================

/** THE LANDED BODY SIMULATED: the two arms this head DOES carry (`crosslinks`' subject re-read and `doc-nav`'s stamped
 *  `docHeads` re-read) plus the paint. The reader must find exactly those two ids and both bridge calls here — the positive side
 *  of `S3`'s negatives, on the same instrument. */
const ARM_FIXTURE_LANDED_BODY = [
  "    if (paneId === 'crosslinks') {",
  '      const result = await this.bridge.rag.backlinks(subject)',
  "    } else if (paneId === 'doc-nav') {",
  '      const answer = await this.bridge.rag.docHeads()',
  '    }',
  '    this.updatePane(paneId)',
].join('\n')

/** THE DEFECT SIMULATED: the same body with a `search` arm bolted on (a `rag.query` re-read on the pane's own event — `ASM-B7-2`'s
 *  unbounded loop). The reader MUST find both, or neither of `S3`'s negative arms is a reading. */
const ARM_FIXTURE_SEARCH_ARM_BODY = [
  "    if (paneId === 'search') {",
  '      await this.bridge.rag.query(this.lastQuery, 5)',
  "    } else if (paneId === 'template-editor') {",
  '      await this.bridge.template.get()',
  "    } else if (paneId === 'crosslinks') {",
  '      const result = await this.bridge.rag.backlinks(subject)',
  "    } else if (paneId === 'doc-nav') {",
  '      const answer = await this.bridge.rag.docHeads()',
  '    }',
  '    this.updatePane(paneId)',
].join('\n')

/** The four negative readings `S3` grades, named for the messages. */
const REFUSED_ARMS: readonly string[] = [SEARCH, TEMPLATE_EDITOR]
const REFUSED_BRIDGE_CALLS: readonly string[] = ['rag.query', 'template.get']
/** The two arms and the two bridge calls the body MUST still carry (`ASM-B7-1` cannot pass by an emptied body). */
const KEPT_ARMS: readonly string[] = [CROSSLINKS, DOC_NAV]
const KEPT_BRIDGE_CALLS: readonly string[] = ['rag.backlinks', 'rag.docHeads']

describe('pane-search-template — S3: `paintReplumbedPane` owes NO arm — no `search`/`template-editor` arm and no bridge call for either pane, while BOTH landed arms and the paint itself survive', () => {
  it("S3 — `paintReplumbedPane`'s body carries neither `paneId === 'search'` nor `paneId === 'template-editor'` and neither `bridge.rag.query(` nor `bridge.template.get(`, while `bridge.rag.backlinks`/`bridge.rag.docHeads` and the `updatePane(` paint are still there", () => {
    // §6 `S3`; §3's `ASM-B7-1` ("THE PAINT'S BODY OWES NO NEW ARM"); §2's refusals (`ASM-B7-2`: a `rag.query` on the pane's own event
    // is an unbounded loop; `F-4`: a `template.get()` is an IPC that can change nothing, because the payload IS the store's template).
    // THIS ROW IS GREEN ON ARRIVAL BY DESIGN: it is the DECLARED REGRESSION PIN for the two no-arm panes — a landing that "helps" by
    // adding a re-read arm reds here while `Q1`/`T1`'s census would merely move.
    // NON-VACUITY, IN BOTH DIRECTIONS FROM THE TWO FIXTURES ABOVE: the same arm reader is shown FINDING `paneId === 'search'` and
    // `paneId === 'template-editor'` plus `rag.query`/`template.get` in `ARM_FIXTURE_SEARCH_ARM_BODY`, and FINDING the two landed
    // arms plus both kept bridge calls in `ARM_FIXTURE_LANDED_BODY` — so absence in the shipped body is a READING, and "no arm"
    // cannot pass by an instrument that reads nothing. The positives are also required on the shipped body, so a body emptied to
    // satisfy the negatives reds.
    // MUTATION THAT WOULD RED IT: adding a re-read arm per pane in either direction (a `rag.query` loop, or an IPC that can change
    // nothing); deleting either landed arm to make room; or a dispatch that stopped reaching `updatePane(` at all.
    const problems: string[] = []

    // ---- THE FIXTURES: the instrument must SEE what it is asked to look for -----------------------
    const landedFixtureArms = armsOf(ARM_FIXTURE_LANDED_BODY).map((arm) => arm.id)
    const landedFixtureCalls = bridgeCallsOf(ARM_FIXTURE_LANDED_BODY)
    if (!sameSet(landedFixtureArms, KEPT_ARMS)) {
      problems.push(
        `S3(floor·arms): the arm reader read the LANDED fixture as ${shown(landedFixtureArms)}, not ${shown([...KEPT_ARMS])} — ` +
          `the instrument cannot see the two arms the shipped body must keep. FIXTURE: ${shown(preview(ARM_FIXTURE_LANDED_BODY))}. ` +
          `LAYER: ${LAYER}`,
      )
    }
    if (!KEPT_BRIDGE_CALLS.every((call) => landedFixtureCalls.includes(call))) {
      problems.push(
        `S3(floor·bridge): the bridge-call reader read the LANDED fixture as ${shown(landedFixtureCalls)}, which is missing ` +
          `${shown(KEPT_BRIDGE_CALLS.filter((call) => !landedFixtureCalls.includes(call)))} — the "still carries" arm below would ` +
          `be unreadable. LAYER: ${LAYER}`,
      )
    }
    const defectArms = armsOf(ARM_FIXTURE_SEARCH_ARM_BODY).map((arm) => arm.id)
    const defectCalls = bridgeCallsOf(ARM_FIXTURE_SEARCH_ARM_BODY)
    const unseenArms = REFUSED_ARMS.filter((id) => !defectArms.includes(id))
    const unseenCalls = REFUSED_BRIDGE_CALLS.filter((call) => !defectCalls.includes(call))
    if (unseenArms.length > 0 || unseenCalls.length > 0) {
      problems.push(
        `S3(floor·defect): the instrument did NOT find ${shown(unseenArms)} arm(s) or ${shown(unseenCalls)} bridge call(s) in the ` +
          `DEFECT fixture — with the reader unable to see a \`paneId === 'search'\` arm when one is present, the "carries NO arm" ` +
          `arms below would be blind. READ: arms=${shown(defectArms)} calls=${shown(defectCalls)}. ` +
          `FIXTURE: ${shown(preview(ARM_FIXTURE_SEARCH_ARM_BODY))}. LAYER: ${LAYER}`,
      )
    }

    // ---- THE SHIPPED BODY ------------------------------------------------------------------------
    let sidebarText = ''
    try {
      sidebarText = readText(SIDEBAR_FILE)
    } catch (error) {
      problems.push(
        `S3: \`${SIDEBAR_FILE}\` is unreadable (${String(error)}) — the paint's no-arm clause has no subject. LAYER: ${LAYER}`,
      )
    }
    if (sidebarText !== '') {
      const code = stripComments(sidebarText)
      const body = methodBodyOf(code, 'paintReplumbedPane')
      if (body === null) {
        problems.push(
          `S3: no \`paintReplumbedPane(…)\` declaration with a BODY was found in \`${SIDEBAR_FILE}\` — the declared dispatch ` +
            `\`ASM-B7-1\` grades has no subject. PARSED VALUE: null (no brace-matched body). LAYER: ${LAYER}`,
        )
      } else {
        const arms = armsOf(body)
        const armIds = arms.map((arm) => arm.id)
        const calls = bridgeCallsOf(body)

        // (1) THE TWO LANDED ARMS ARE STILL THERE — the floor the negatives ride.
        for (const keptId of KEPT_ARMS) {
          if (!armIds.includes(keptId)) {
            problems.push(
              `S3: \`paintReplumbedPane\`'s body in \`${SIDEBAR_FILE}\` no longer carries its \`paneId === '${keptId}'\` re-read ` +
                `arm — \`ASM-B7-1\` keeps BOTH landed arms byte-for-byte (\`${CROSSLINKS}\`'s subject re-read and \`${DOC_NAV}\`'s ` +
                `stamped \`docHeads\` re-read); a body emptied to satisfy the negative arms is not a landing. ` +
                `PARSED VALUE: arms=${shown(armIds)}. LAYER: ${LAYER}`,
            )
          }
        }
        // (2) NO ARM FOR THIS UNIT'S TWO PANES (`ASM-B7-1`).
        for (const refusedId of REFUSED_ARMS) {
          const found = arms.filter((arm) => arm.id === refusedId)
          if (found.length > 0) {
            problems.push(
              `S3: \`paintReplumbedPane\`'s body in \`${SIDEBAR_FILE}\` carries a \`paneId === '${refusedId}'\` ARM (offset ` +
                `${shown(found.map((arm) => arm.at))}) — \`ASM-B7-1\`: these two panes take NO re-read arm, so they reach ` +
                `\`updatePane(paneId)\` synchronously inside the fire (which is what makes §3's ordering a property of the code). ` +
                `Re-read arms are REFUSED: a \`rag.query\` re-issue on the pane's own event is an unbounded loop (\`ASM-B7-2\`) and ` +
                `a \`template.get()\` is an IPC that can change nothing (\`F-4\`). PARSED VALUE: arms=${shown(armIds)}. LAYER: ${LAYER}`,
            )
          }
        }
        // (3) THE TWO KEPT BRIDGE CALLS, and (4) the two REFUSED ones.
        for (const keptCall of KEPT_BRIDGE_CALLS) {
          if (!calls.includes(keptCall)) {
            problems.push(
              `S3: \`paintReplumbedPane\`'s body in \`${SIDEBAR_FILE}\` no longer carries \`bridge.${keptCall}(\` — the two landed ` +
                `arms' re-reads must survive this unit byte-for-byte. PARSED VALUE: bridgeCalls=${shown(calls)}. LAYER: ${LAYER}`,
            )
          }
        }
        for (const refusedCall of REFUSED_BRIDGE_CALLS) {
          if (calls.includes(refusedCall)) {
            problems.push(
              `S3: \`paintReplumbedPane\`'s body in \`${SIDEBAR_FILE}\` carries \`bridge.${refusedCall}(\` — refused: the paint ` +
                `authors from state the producer committed in the same tick BEFORE the fire, and §3's re-read census for both panes ` +
                `is ALL-ZERO. PARSED VALUE: bridgeCalls=${shown(calls)}. LAYER: ${LAYER}`,
            )
          }
        }
        // (5) THE BODY STILL REACHES THE PAINT.
        if (!/\bupdatePane\s*\(/.test(body)) {
          problems.push(
            `S3: \`paintReplumbedPane\`'s body in \`${SIDEBAR_FILE}\` no longer reaches \`updatePane(\` — the ONE \`B-3\` paint is ` +
              `the dispatch's terminal step for every no-arm pane, so a body that lost it paints nothing. ` +
              `PARSED VALUE: ${shown(preview(body))}. LAYER: ${LAYER}`,
          )
        }
      }
    }

    expect(
      problems,
      `S3 — THE PAINT OWES NO ARM (\`ASM-B7-1\`; §3; §2's two refusals). ${problems.length} problem(s). ` +
        `\`paintReplumbedPane\`'s body in \`${SIDEBAR_FILE}\` must carry NO \`paneId === '${SEARCH}'\`, NO ` +
        `\`paneId === '${TEMPLATE_EDITOR}'\`, NO \`bridge.rag.query(\` and NO \`bridge.template.get(\`, while BOTH landed arms ` +
        `(\`${CROSSLINKS}\` → \`bridge.rag.backlinks\`, \`${DOC_NAV}\` → \`bridge.rag.docHeads\`) and the \`updatePane(\` paint ` +
        `survive — the negatives are proven readable against \`ARM_FIXTURE_SEARCH_ARM_BODY\`, which carries both. ${LAYER}`,
    ).toEqual([])
  })
})
