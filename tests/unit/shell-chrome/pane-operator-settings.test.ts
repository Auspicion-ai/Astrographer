// tests/unit/shell-chrome/pane-operator-settings.test.ts — unit `B-9` `pane-operator-settings`'s DECLARATION/CLAUSE rows:
// `O1` (the census pin), `O5(a)`/`O5(b)` (the TWO exported FIELD-CENSUS predicates — the app graph and the operator scope — each over
// its own table) plus `O5(b-doc)` (the census docblock, graded STRUCTURALLY), `O8` (`X1b`'s converse clause over the NINE-id census)
// and `S1` (the letter). The HOST rows (`O2`, `O3`, `O4`, `O5`'s both-ways host drive, `O6`, `O7`) live in
// `tests/integration/shell-chrome/pane-operator-settings.test.ts`.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-9-pane-operator-settings.md` §6 plus the sections it re-states —
//   §6 `O1` THE CENSUS MOVES BY EXACTLY TWO (§1 `F-1`/`F-9`): `REPLUMBED_PANE_IDS` is the NINE-id set with `settings` and
//        `gnosis-status` present and EACH CARRYING ITS CAUSE (the declaration's own recorded style is "AND HERE IS THE CAUSE",
//        once per landing); `fire('settings')`/`fire('gnosis-status')` answer `fired:true, handlers:1`; ONE registration per id
//        (`B2-ADV-04`); `CHANGE_INTERESTED_PANE_IDS` DOES NOT MOVE (neither pane follows engine-changeable data through a re-read
//        it does not have — `§12a`'s measured narrowing).
//   §6 `O5` THE FIELD CENSUS (§1 `F-4`, §2's DECLARATION) AS CORRECTED BY THE SEVEN ADJUDICATIONS — the AUTHORITY for these rows,
//        applied and not re-litigated: "one exported PURE TOTAL predicate … decides whether a settings push ALSO re-derives the app
//        graph — an app-graph member moved ⇒ rebuild; none ⇒ the fire is the whole delivery". The correction NAMES the census
//        (`settingsMovesAppGraph`), narrows it to EXACTLY `representationMode`/`layout` (removing `enabledPanes` ECHO,
//        `defaultDocumentId` TAB-CONTEXT-ONLY and `tabs` BOOT-ONLY, each with its reason IN THE DOCBLOCK — `O5(b-doc)`), ADDS the
//        second predicate (`settingsMovesOperatorCensus`, the operator scope's SECTION SET), and makes an INCOMPARABLE member answer
//        MOVED while EVERY member read sits inside the guard. **Both symbols are PINNED BY NAME, so there is no discovery here:**
//        a missing/renamed export is a NAMED problem in the row's aggregate, never a skip.
//   §6 `O8` `X1b` STAYS GREEN AND STRICTER (§4): "every id in the NINE-id census must answer `updatePane` ≠
//        `operator-scope`/`not-a-pane` over the real booted host, `settings` and `gnosis-status` included"; "the forged-census
//        mutant moves from `gnosis-status` to a fabricated unpaintable id (the concrete hazard is now GONE, and the row must say
//        so)".
//   §6 `S1` THE LETTER (§4): comments stripped — the census is nine ids; `firePaneUpdate`'s body carries NO `host.refresh()` and
//        NO scope probe; `paintPane`'s operator arm is a route to a paint (no `return verdict('operator-scope')`);
//        `onOperatorSettingsChanged` FIRES before BOTH guarded re-assemblies (`refreshOperator()` — the operator census — and
//        `requestRebuild('operator')` — the app graph); both predicates are exported and pure.
//   §6's AUTHORING REFUSALS (`D-43`): no row may demand a paint from a bare fire over already-painted state; no row may require a
//        live engine, a live Electron app or an operator store; no row may be satisfied by deleting `refresh()`/`mountOperator`
//        (which are legitimate on their own routes, §4). NOTHING here drives a paint: the paint rows are the integration file's.
//
// DECLARATIONS ARE PARSED, NEVER SEARCHED (`D-38`: `src.indexOf('VALID_GROUPS')` latched onto a COMMENT once). Every clause below
// strips comments FIRST with a LENGTH-PRESERVING stripper (each row CHECKS that length invariant: a raw/commented offset would let
// prose satisfy a clause), then locates a DECLARATION by its declaration shape and brace-matches its body. ONE reading is
// deliberately taken from the RAW text — the CENSUS DOCBLOCK, because a cause paragraph IS a comment and the contract asks for it;
// it is read as the comment block IMMEDIATELY ABOVE the declaration, never as a file-wide token search.
//
// THE HARNESS: the REAL `SidebarPanes` + the REAL `GnosisPanes`/`GnosisCrudPanes` (registered exactly as `renderer.ts` registers
// them, BEFORE the host is constructed) over `installShim()` from `src/shared/dom-shim.ts`, against a recording runtime double and a
// bridge double that COUNTS what a paint would read. `O1` reads the booted CHANNEL (`panes()`, `fire(id)`'s report) and `O8` reads
// the booted HOST's own verdict vocabulary (`updatePane(id)`'s closed words).
//
// THE OBSERVABLES: the PARSED declaration values (cross-checked against the module's runtime value), the RAW docblock above the
// census and above `settingsMovesAppGraph`, the booted channel's registration census and fire reports, `updatePane`'s declared word,
// and the TWO pinned predicates' answers over their own tables. Not one row reads the DOM's rendering, a counter, or the operator
// surface — those are the integration file's (`O2`/`O3`/`O4`/`O5`/`O6`/`O7`).
//
// LAYER (MANDATORY, D-10 / `RCA-12`): ENVELOPE-CLASS. The declaration clauses read `src/**`'s TEXT (comments stripped) plus the
// REAL exported values; the booted clauses drive the REAL host over the LAYOUT-LESS `dom-shim`. What this file can NEVER read,
// named so nobody quotes it: that a fire PAINTS a pane, that the counters are `0/0/0`, that a section is re-minted in a real
// window, or that the assembled Electron app repaints — the first three are the integration file's rows and the last is
// `docs/L1/unit-b-9-pane-operator-settings.md` §8/`G8`, the only app-green reading.
//
// NON-VACUITY (stated per row in its own comment): `O1`'s zero-absence floor is its own positive census reading plus the booted
// `fire` reports; `O5(a)`/`O5(b)`'s `false` arms are floored by their `true` arms driven through the SAME function (a constant answer
// reds at least one), their degenerate arms floor the totality claim, and their throwing/cyclic arms floor ADJ 3's guard-and-moved
// rule; `O5(b-doc)` names FIVE members (two counted + three removed) plus three reason words, so neither an empty block nor a slogan
// can pass; `O8`'s clause is proved FALSIFIABLE on two forged censuses on the same host before its live reading counts; `S1`'s
// absence clauses are each floored by a POSITIVE arm on the same body (the fire call must still be there; the vocabulary must still
// be in `pane-events.ts`).
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO: it writes nothing; it reads only the repo it lives in; no network, no electron, no
// spawn, no `git`, no `vi.mock`, no `console.log` (reporting is the aggregate failure message alone, `B5-DOC-PRINT`). Every subject
// is reached inside a `try`, so a missing one is a NAMED problem in the row's ONE aggregate `expect(problems, …)` — never an ENOENT
// crash, never an ESM link error, never a `skip`/`only`/`todo`.
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { installShim, ShimElement } from '../../../src/shared/dom-shim.js'
import { createPaneRegistry } from '../../../src/renderer/pane-registry.js'
import { createPaneEvents } from '../../../src/renderer/pane-events.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../../../src/main/template-shape.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

const SIDEBAR_FILE = 'src/renderer/sidebar-panes.ts'
const RENDERER_FILE = 'src/renderer/renderer.ts'
const PANE_EVENTS_FILE = 'src/renderer/pane-events.ts'

const SETTINGS_PANE = 'settings'
const STATUS_PANE = 'gnosis-status'
// The app-graph panes the census carries at this head, in the contract's declared order (`§1` `F-1`).
const APP_GRAPH_CENSUS: readonly string[] = [
  'gnosis-query',
  'crosslinks',
  'doc-nav',
  'search',
  'template-editor',
  'gnosis-documents',
  'gnosis-wikis',
]
/** **§6 `O1`: THE NINE-ID SET** — the seven the `B-8` landing left, PLUS this unit's two operator panes. */
const PINNED_CENSUS: readonly string[] = [...APP_GRAPH_CENSUS, SETTINGS_PANE, STATUS_PANE]
/** §6 `O1`/§12a: the change-interest declaration MUST NOT MOVE (`doc-nav` alone). */
const PINNED_CHANGE_INTEREST: readonly string[] = ['doc-nav']
const CENSUS_NAME = 'REPLUMBED_PANE_IDS'
const CHANGE_INTEREST_NAME = 'CHANGE_INTERESTED_PANE_IDS'
/** The fabricated ids the forged-census arms drive: one no unit ever registers, and one in the operator SECTION namespace. */
const FORGED_ID = 'probe-b9-unpaintable'
const FORGED_OPERATOR_ID = 'operator-pane-probe-b9-operator-ish'

const fingerprint = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

/** A value as a failure message prints it. */
const shown = (value: unknown): string => (value === undefined ? '(absent)' : fingerprint(value))

// ===========================================================================
// TEXT SUBSTRATE — comment stripping + brace matching, both comment/string aware.
// ===========================================================================

/** The CODE of a source slice: comments replaced by spaces, NEWLINES kept, string/template literals preserved. **The output is the
 *  same LENGTH as the input**, which is what lets a clause strip comments first and still read the RAW text at a shared offset.
 *  Every row checks that length invariant rather than assuming it. */
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

/** The index of the `}` matching the `{` at `openIndex`, comment- and string-aware. `-1` when the text is unbalanced. */
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

interface SourceText {
  raw: string
  /** the same text with comments replaced by spaces (SAME LENGTH) */
  code: string
  problems: string[]
}

function readSource(relativePath: string, limb: string): SourceText {
  let raw = ''
  try {
    raw = readText(relativePath)
  } catch (error) {
    return {
      raw: '',
      code: '',
      problems: [`${limb}: \`${relativePath}\` is unreadable (${String(error)}) — this row's clause has no subject`],
    }
  }
  const code = stripComments(raw)
  const problems: string[] = []
  if (code.length !== raw.length) {
    problems.push(
      `${limb}: the comment stripper is NOT length-preserving on \`${relativePath}\` (${raw.length} raw chars, ${code.length} ` +
        `stripped) — this row reads the raw text at the SAME offsets as the stripped text, so a length change would silently shift ` +
        `every slice`,
    )
  }
  return { raw, code, problems }
}

interface BodyRegion {
  /** the braced body, comments stripped; `''` when no body was located */
  body: string
  /** the offset of the body's `{` in the text handed in — what a RAW read needs to re-align */
  open: number
  problems: string[]
}

/** Locate a declaration by `anchor`, then brace-match its body. Anchors are DECLARATION-shaped (never a bare token), and the text
 *  handed in is already comment-stripped, so a mention in prose cannot satisfy any caller. */
function bodyAt(text: string, anchor: RegExp, limb: string, what: string): BodyRegion {
  const match = anchor.exec(text)
  if (match === null) {
    return { body: '', open: -1, problems: [`${limb}: no \`${what}\` declaration matches ${String(anchor)} — the clause has no subject`] }
  }
  const open = text.indexOf('{', match.index + match[0].length)
  if (open < 0) {
    return { body: '', open: -1, problems: [`${limb}: the \`${what}\` declaration carries no braced body — the clause has no subject`] }
  }
  const close = matchBrace(text, open)
  if (close < 0) {
    return { body: '', open: -1, problems: [`${limb}: the \`${what}\` declaration's body is UNBALANCED — the clause has no subject`] }
  }
  return { body: text.slice(open, close + 1), open, problems: [] }
}

/** **THE GUARD-AND-ORDER READING for ONE conditional call inside a handler body** (`S1`'s `(d)` arm). Structural, over the
 *  comments-stripped body: the call must be PRESENT, must FOLLOW the `settings` fire (`fireIndex`), and must be the consequent of an
 *  `if (…)` — bare (`if (pred(…)) this.call()`) or braced (`if (pred(…)) { … this.call() … }`). A call that no `if (` introduces is
 *  the unconditional site §4 SITE 2 replaces (`m2`), and a call BEFORE the fire is the order ADJ 2 forbids. */
function guardedCallProblems(body: string, callName: string, fireIndex: number, limb: string, why: string): string[] {
  const problems: string[] = []
  const escaped = callName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // A call is `refreshOperator(` or `this.refreshOperator(` or `this.editController.requestRebuild(` — a dotted receiver chain then
  // the pinned name and its opening parenthesis.
  const invoked = `(?:[A-Za-z_$][\\w$]*\\s*\\.\\s*)*${escaped}\\s*\\(`
  const guardedForms = [
    new RegExp(`\\bif\\s*\\([^;{}]*\\)\\s*${invoked}`),
    new RegExp(`\\bif\\s*\\([^;{}]*\\)\\s*\\{[^}]*?${invoked}`),
  ]
  const at = body.indexOf(callName)
  if (at < 0) {
    problems.push(`${limb}: \`onOperatorSettingsChanged\`'s body carries NO \`${callName}\` call — ${why}`)
    return problems
  }
  if (at < fireIndex) {
    problems.push(
      `${limb}: \`${callName}\` runs BEFORE the \`${SETTINGS_PANE}\` FIRE (call at offset ${at}, fire at ${fireIndex}) — ADJ 2 orders ` +
        `capture → COMMIT → FIRE → the guarded re-assemblies, so the pane's own paint can never be a by-product of one of them`,
    )
  }
  if (!guardedForms.some((form) => form.test(body))) {
    problems.push(
      `${limb}: \`${callName}\` is UNGUARDED — no \`if (…)\` introduces it in \`onOperatorSettingsChanged\`'s body (body read: ` +
        `${shown(body.replace(/\s+/g, ' ').trim().slice(0, 360))}) — ${why}`,
    )
  }
  return problems
}

/** The RAW comment block IMMEDIATELY ABOVE the declaration whose (stripped-text) offset is `declIndex` — the docblock a landing
 *  writes its cause paragraph in. The stripper is length-preserving, so stripped and raw offsets coincide; the block is located
 *  by scanning back over whitespace to the nearest `*` then `/` and then back to the `/*` that OPENS it, and it answers `''` when there is
 *  none.
 *
 *  ⟨THE OPENER, NOT THE PREVIOUS CLOSER, and why that distinction is load-bearing for `O5(b-doc)`.⟩ The first form of this helper
 *  scanned for the two-character sequence `*` then `/`, which is a CLOSING marker: the block it returned therefore began at the PREVIOUS
 *  docblock's closer and ran forward through that neighbour's whole declaration body. For `O1` the reading still contained the census
 *  docblock (so its clauses passed), but a block that also contains a NEIGHBOUR'S CODE is exactly the accidental match `O5(b-doc)`
 *  must refuse — a reason word could be satisfied by a line of TypeScript rather than by the prose. The scan below looks for the
 *  OPENING `/*` instead, so the returned text is the docblock and nothing else. */
function commentBlockAbove(raw: string, declIndex: number): string {
  if (declIndex <= 0) return ''
  let at = declIndex - 1
  while (at >= 0 && /\s/.test(raw[at]!)) at -= 1
  if (at < 1) return ''
  if (!(raw[at] === '/' && raw[at - 1] === '*')) return ''
  const end = at + 1
  let scan = at - 2
  while (scan >= 1) {
    if (raw[scan] === '/' && raw[scan + 1] === '*') return raw.slice(scan, end)
    scan -= 1
  }
  return ''
}

// ===========================================================================
// DECLARATION PARSERS (`D-38`: parse the DECLARATION, never search for the token).
// ===========================================================================

interface IdListDeclaration {
  found: boolean
  exported: boolean
  /** how many `const <name> … =` declarations the text carries (ONE is the rule) */
  count: number
  /** the parsed ids IN DECLARATION ORDER — `null` when the declaration exists but is not a literal id list */
  values: string[] | null
  /** the declaration's own offset in the text handed in (`-1` when absent) */
  index: number
}

/** Parse `[export] const <name>: … = [ … ]` / `= Object.freeze([ … ])`. The element list must be QUOTED LITERALS only — a computed
 *  initialiser answers `values: null` (a named problem at the call site), never a silently empty list. */
function parseIdListDeclaration(code: string, name: string): IdListDeclaration {
  const declaration = new RegExp(`(?:^|[\\n;{}])[ \\t]*(export[ \\t]+)?const[ \\t]+${name}\\b`, 'g')
  const result: IdListDeclaration = { found: false, exported: false, count: 0, values: null, index: -1 }
  for (let match = declaration.exec(code); match !== null; match = declaration.exec(code)) {
    result.count += 1
    if (result.count > 1) continue
    result.found = true
    result.exported = typeof match[1] === 'string'
    result.index = match.index
    const from = match.index + match[0].length
    const equals = code.indexOf('=', from)
    if (equals < 0) continue
    const open = code.indexOf('[', equals)
    if (open < 0) continue
    const close = code.indexOf(']', open)
    if (close < 0) continue
    const elements = code.slice(open + 1, close)
    if (!/^\s*(?:(?:'[^']*'|"[^"]*")\s*,?\s*)*$/.test(elements)) continue
    const literals = elements.match(/'[^']*'|"[^"]*"/g) ?? []
    result.values = literals.map((literal) => literal.slice(1, -1))
  }
  return result
}

/** An exported FUNCTION declaration (`export function name(…)` or `export const name = (…) => …`) whose BODY is brace-matched. */
interface ExportedFunction {
  name: string
  exported: boolean
  count: number
  body: string
  bodyForm: 'braced' | 'expression' | ''
  /** the declaration's own offset in the text handed in (`-1` when absent) — the ONE reading a RAW docblock needs, because the
   *  comment stripper is length-preserving so the stripped and raw offsets coincide (`O5(b-doc)`) */
  index: number
}

function parseExportedFunction(code: string, name: string): ExportedFunction {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const declaration = new RegExp(
    `(?:^|[\\n;{}])[ \\t]*(export[ \\t]+)?(?:(?:async[ \\t]+)?function[ \\t]+${escaped}[ \\t]*\\(|const[ \\t]+${escaped}\\b)`,
    'g',
  )
  const result: ExportedFunction = { name, exported: false, count: 0, body: '', bodyForm: '', index: -1 }
  for (let match = declaration.exec(code); match !== null; match = declaration.exec(code)) {
    result.count += 1
    if (result.count > 1) continue
    result.exported = typeof match[1] === 'string'
    result.index = match.index
    const from = match.index + match[0].length
    if (/function/.test(match[0])) {
      const open = code.indexOf('{', from)
      const close = open < 0 ? -1 : matchBrace(code, open)
      if (close >= 0) {
        result.body = code.slice(open, close + 1)
        result.bodyForm = 'braced'
      }
      continue
    }
    const arrow = code.indexOf('=>', from)
    if (arrow < 0) {
      const open = code.indexOf('{', from)
      const close = open < 0 ? -1 : matchBrace(code, open)
      if (close >= 0) {
        result.body = code.slice(open, close + 1)
        result.bodyForm = 'braced'
      }
      continue
    }
    const open = code.indexOf('{', arrow + 2)
    const between = code.slice(arrow + 2, open < 0 ? undefined : open)
    if (open >= 0 && between.trim() === '') {
      const close = matchBrace(code, open)
      if (close >= 0) {
        result.body = code.slice(open, close + 1)
        result.bodyForm = 'braced'
      }
      continue
    }
    const eol = code.indexOf('\n', arrow)
    result.body = code.slice(arrow + 2, eol < 0 ? code.length : eol)
    result.bodyForm = 'expression'
  }
  return result
}

/** **`X1b`'s CLAUSE, and the only place it lives:** every id in `census` must answer `updatePane(id)` with a reason that is NOT
 *  `operator-scope` and NOT `not-a-pane` (i.e. `census ⊆ paintable`). `painted`/`unchanged`/`not-enabled`/`not-mounted`/`no-runtime`
 *  are all admissible: the first two are the paint's own answers and the last three are transient boot / registry states, none of
 *  which is a registration that can never paint. The forged-census mutants prove the clause falsifiable. */
function censusPaintableProblems(
  host: Record<string, unknown> | null,
  census: readonly string[],
  where: string,
  limb: string,
): string[] {
  if (host === null) return [`${limb}: the booted host is ABSENT — \`census ⊆ paintable\` over ${where} has no subject`]
  const updatePane = host['updatePane']
  if (typeof updatePane !== 'function') {
    return [`${limb}: \`updatePane\` is NOT a function on the booted host (read ${typeof updatePane}) — ${where} cannot be graded`]
  }
  const problems: string[] = []
  for (const paneId of census) {
    let verdict: unknown
    try {
      verdict = (updatePane as (id: string) => unknown).call(host, paneId)
    } catch (error) {
      problems.push(
        `${limb}: \`updatePane('${paneId}')\` THREW for ${where} (${String(error)}) — the paint is TOTAL at every argument, so a ` +
          `census entry that makes it throw is a finding, never a silent skip`,
      )
      continue
    }
    const reason = (verdict as { reason?: unknown } | null | undefined)?.reason
    if (reason === 'operator-scope' || reason === 'not-a-pane') {
      problems.push(
        `${limb}: ${where} names \`${paneId}\` and \`updatePane('${paneId}')\` answers \`reason: '${String(reason)}'\` — ` +
          `\`census ⊆ paintable\` REFUSES this entry: ${
            reason === 'operator-scope'
              ? "§3 replaces step 2's `operator-scope` refusal with a ROUTE, so an operator pane that answers it has NO paint at all " +
                'while `fire` answers `fired:true` — the silently dead registration `F-2` names'
              : 'no host registered the pane, so the fire reaches a registration whose paint cannot exist'
          }`,
      )
    }
  }
  return problems
}

// ===========================================================================
// `O5`'s TWO PINNED PREDICATES AND THEIR TABLES — §2's declaration pins BOTH symbols BY NAME (adjudications 1 and 2), so this file
// grades `settingsMovesAppGraph` and `settingsMovesOperatorCensus` BY THOSE NAMES: a missing or renamed export is a NAMED problem in
// the row's ONE aggregate `expect(problems, …)`, never a "discovery" (the retired name-vocabulary machinery could not tell two
// distinct predicates apart) and never a skip.
//
// THE CORRECTED CENSUS, verbatim from the adjudications (the AUTHORITY these rows grade, never re-litigated here):
//   · APP GRAPH — EXACTLY `representationMode` and `layout`, the only two members that reach the assembled envelope. `enabledPanes`
//     is REMOVED (ECHO: it reaches the app graph only through the registry, which `refresh()` never re-applies, and the local route
//     `togglePaneVisibility`/`onPaneVisibilityChange` sets the registry BEFORE it persists and runs its own rebuild);
//     `defaultDocumentId` is REMOVED (TAB-CONTEXT-ONLY: it reaches `getTabContext()`'s `lastFocusedDocumentId` only); `tabs` is
//     REMOVED (BOOT-ONLY: `renderer.ts` reads `settings.tabs` once at boot, `tabStrip.load(settings?.tabs)`).
//   · OPERATOR — the OPERATOR scope's SECTION SET. A NON-EMPTY `enabledOperatorPanes` (non-empty string ids, deduped, ORDER-
//     INSENSITIVE — the section set is a SET) is authoritative; an EMPTY/absent/non-array list means ALL sections until
//     `panesInitialized === true`, and NONE once it is `true` (`applyPersistedPaneVisibility`'s `emptyMeansEnabled` gate).
//   · INCOMPARABLE ⇒ MOVED — every member read is inside the guard, and a member whose comparison cannot be made (a throwing getter,
//     a Proxy `get` trap, a CYCLIC value) answers `true`: a needless re-assembly is cheap, a stale app graph is not.
// ===========================================================================
/** **THE TWO SYMBOLS THIS UNIT'S CENSUS IS** (§2's declaration; adjudications 1 and 2), pinned BY NAME, `sidebar-panes.ts` their
 *  one home. They are graded by these names: a landing that renames or drops one answers a NAMED problem in `O5(a)`/`O5(b)`/`S1`. */
const APP_GRAPH_PREDICATE = 'settingsMovesAppGraph'
const OPERATOR_CENSUS_PREDICATE = 'settingsMovesOperatorCensus'
const PINNED_PREDICATES: readonly string[] = [APP_GRAPH_PREDICATE, OPERATOR_CENSUS_PREDICATE]
/** An operator-pane id NO host registers: the operator census is a comparison over the PAYLOAD only, so the arm that "adds a member"
 *  needs a fourth id with no registration to be a reading of the census rather than of the registry. */
const OTHER_OPERATOR_PANE = 'probe-b9-operator-extra'

/** **THE PAYLOAD THE CENSUS IS ABOUT:** one operator-settings push carrying EVERY member of EVERY kind — the two the corrected
 *  app-graph census COUNTS (`representationMode`, `layout`), the three it REMOVED with a written reason (`enabledPanes` ECHO,
 *  `defaultDocumentId` TAB-CONTEXT-ONLY, `tabs` BOOT-ONLY) and the operator-only ones (`topK`, `panesInitialized`,
 *  `enabledOperatorPanes`) — so every arm below moves EXACTLY ONE member against this `previous`. */
const censusPayload = (): Record<string, unknown> => ({
  representationMode: 'html',
  layout: { version: 1, panes: [{ id: 'settings', zone: 'left' }] },
  enabledPanes: [...APP_GRAPH_CENSUS],
  defaultDocumentId: 'doc-a',
  tabs: [{ id: 'tab-1', documentId: 'doc-a' }],
  topK: 5,
  panesInitialized: true,
  enabledOperatorPanes: [SETTINGS_PANE, STATUS_PANE],
})

interface CensusArm {
  label: string
  /** THE LIMB THE ARM GRADES, printed in the failure message: the adjudication the arm comes from, so a red names its authority
   *  rather than leaving a reader to infer one. */
  why: string
  previous: unknown
  next: unknown
  /** `true`/`false` are graded; `null` asks only for a DECLARED VERDICT (a boolean), never a throw */
  expected: boolean | null
}

// ---------------------------------------------------------------------------
// THE DEGENERATE PAYLOAD BUILDERS, shared by both tables (a value whose member READ throws or whose comparison cannot be made).
// ---------------------------------------------------------------------------

/** A payload whose `layout` is a CYCLIC object (`layout.self === layout`). `panes` differs between the two instances so the pair
 *  below carries a REAL app-graph move inside a value no printer can render. */
function cyclicPayload(zone: 'left' | 'right'): Record<string, unknown> {
  const payload = censusPayload()
  const layout: Record<string, unknown> = { version: 1, panes: [{ id: 'settings', zone }] }
  layout['self'] = layout
  payload['layout'] = layout
  return payload
}

/** A payload whose `layout` member READ throws — the throwing-getter class (a trusted-but-broken bridge / a hostile payload). */
function throwingLayoutPayload(): Record<string, unknown> {
  const payload = censusPayload()
  Object.defineProperty(payload, 'layout', {
    enumerable: true,
    configurable: true,
    get(): never {
      throw new Error('b9-probe-layout-getter')
    },
  })
  return payload
}

/** A payload whose EVERY `get` traps throws — the Proxy class, which defeats a `typeof`/`in` pre-check as well as a member read. */
function trappedProxyPayload(): Record<string, unknown> {
  return new Proxy(censusPayload(), {
    get(): never {
      throw new Error('b9-probe-proxy-get')
    },
  }) as Record<string, unknown>
}

/** A payload whose `enabledOperatorPanes` member READ throws. */
function throwingOperatorListPayload(): Record<string, unknown> {
  const payload = censusPayload()
  Object.defineProperty(payload, 'enabledOperatorPanes', {
    enumerable: true,
    configurable: true,
    get(): never {
      throw new Error('b9-probe-operator-list-getter')
    },
  })
  return payload
}

/** A payload whose `enabledOperatorPanes` is an array CONTAINING ITSELF — a cyclic list, unprintable and un-enumerable. */
function cyclicOperatorListPayload(): Record<string, unknown> {
  const payload = censusPayload()
  const list: unknown[] = []
  list.push(list)
  payload['enabledOperatorPanes'] = list
  return payload
}

/** **`O5(a)`'s TABLE — `settingsMovesAppGraph` (§2's declaration; adjudications 1 and 3).** Two `true` arms (the ONLY two members
 *  that reach the assembled envelope), seven `false` arms (the three REMOVED members each with its reason, the operator-only ones,
 *  and an identical payload), the degenerate/declared-verdict class (a NON-RECORD payload answers `false` — one that names no member
 *  has moved none — while a MALFORMED member answers a declared boolean, both graded as a boolean only), and the FIVE arms ADJ 3
 *  adds — THREE unreadable/impenetrable reads (a throwing `layout` getter
 *  on the NEXT side, the same on the PREVIOUS side, a Proxy `get` trap) and a CYCLIC `layout` pair — every one of which is PINNED to
 *  `true` (MOVED), never merely to "a boolean": an INCOMPARABLE member answers MOVED, and `false` there is the DROPPED-MOVE defect. */
function appGraphArms(): CensusArm[] {
  const previous = censusPayload()
  const withoutTabs = censusPayload()
  delete withoutTabs['tabs']
  return [
    // ---- TRUE: the two COUNTED members --------------------------------------------------------------------------------------
    {
      label: '`representationMode` moved',
      why: 'ADJ 1 — `representationMode` reaches `applyEditorToolbar`/`editorToolbarContent` in the ASSEMBLED envelope',
      previous,
      next: { ...previous, representationMode: 'markdown' },
      expected: true,
    },
    {
      label: '`layout` moved',
      why: 'ADJ 1 — `layout` reaches `applyZoneTracks`/`deriveLayout` in the ASSEMBLED envelope',
      previous,
      next: { ...previous, layout: { version: 1, panes: [{ id: 'settings', zone: 'right' }] } },
      expected: true,
    },
    // ---- FALSE: the three REMOVED members, each with the reason ADJ 1 gives ------------------------------------------------
    {
      label: '`enabledPanes` moved (REMOVED — ECHO)',
      why:
        'ADJ 1 — ECHO: `enabledPanes` reaches the app graph only through the registry, which `refresh()` never re-applies, and the ' +
        'local route sets the registry BEFORE it persists and runs its own rebuild, so the push is an echo for that member',
      previous,
      next: { ...previous, enabledPanes: [SETTINGS_PANE] },
      expected: false,
    },
    {
      label: '`defaultDocumentId` moved (REMOVED — TAB-CONTEXT-ONLY)',
      why: 'ADJ 1 — TAB-CONTEXT-ONLY: it reaches `getTabContext()`\'s `lastFocusedDocumentId` and nothing in the assembled envelope',
      previous,
      next: { ...previous, defaultDocumentId: 'doc-b' },
      expected: false,
    },
    {
      label: '`tabs` moved (REMOVED — BOOT-ONLY: absent → present)',
      why: 'ADJ 1 — BOOT-ONLY: `renderer.ts` reads `settings.tabs` once at boot (`tabStrip.load(settings?.tabs)`), so a push cannot move it',
      previous: withoutTabs,
      next: { ...withoutTabs, tabs: [{ id: 'tab-1', documentId: 'doc-a' }] },
      expected: false,
    },
    {
      label: '`tabs` moved (REMOVED — BOOT-ONLY: present → different)',
      why: 'ADJ 1 — BOOT-ONLY, the second direction: a DIFFERENT tab list on both sides is still not an app-graph move',
      previous,
      next: { ...previous, tabs: [{ id: 'tab-2', documentId: 'doc-b' }] },
      expected: false,
    },
    // ---- FALSE: the operator-only members and the identical payload --------------------------------------------------------
    {
      label: '`topK` only moved',
      why: 'ADJ 1 — `topK` is rendered by the operator pane ALONE (`settingsContent`\'s `topK:` line)',
      previous,
      next: { ...previous, topK: 99 },
      expected: false,
    },
    {
      label: '`panesInitialized` only moved',
      why: 'ADJ 1 — `panesInitialized` is rendered by the operator pane alone (the visibility rows)',
      previous,
      next: { ...previous, panesInitialized: false },
      expected: false,
    },
    {
      label: '`enabledOperatorPanes` only moved',
      why: 'ADJ 1/2 — the operator scope\'s section set is the OPERATOR census\'s subject, never the app graph\'s',
      previous,
      next: { ...previous, enabledOperatorPanes: [SETTINGS_PANE] },
      expected: false,
    },
    { label: 'an IDENTICAL payload', why: 'the reversal control: nothing moved ⇒ nothing to re-derive', previous, next: { ...previous }, expected: false },
    // ---- DEGENERATE: a DECLARED VERDICT, never a throw ---------------------------------------------------------------------
    { label: 'a null PAIR', why: '§2: a payload that names no app-graph member has moved none', previous: null, next: null, expected: null },
    { label: 'an undefined PREVIOUS', why: '§2: TOTAL at every argument', previous: undefined, next: { ...previous, topK: 9 }, expected: null },
    { label: 'an undefined NEXT', why: '§2: TOTAL at every argument', previous, next: undefined, expected: null },
    { label: 'a null PREVIOUS', why: '§2: TOTAL at every argument', previous: null, next: { ...previous, topK: 9 }, expected: null },
    { label: 'a null NEXT', why: '§2: TOTAL at every argument', previous, next: null, expected: null },
    { label: 'a NUMBER as the previous payload', why: '§2: TOTAL at every argument', previous: 42, next: { ...previous }, expected: null },
    { label: 'a STRING as the previous payload', why: '§2: TOTAL at every argument', previous: 'settings', next: { ...previous }, expected: null },
    { label: 'an ARRAY as the previous payload', why: '§2: TOTAL at every argument', previous: [], next: { ...previous }, expected: null },
    {
      label: 'a MALFORMED `enabledPanes` (a string where the array belongs)',
      why: '§2: a malformed member answers a declared verdict rather than throwing',
      previous,
      next: { ...previous, enabledPanes: 'doc-nav' },
      expected: null,
    },
    {
      label: 'a MALFORMED `layout` (a number where the object belongs)',
      why: '§2: a malformed member answers a declared verdict rather than throwing',
      previous,
      next: { ...previous, layout: 42 },
      expected: null,
    },
    { label: 'a MISSING member set (`{}`)', why: '§2: a payload that names no app-graph member has moved none', previous, next: {}, expected: null },
    // ---- NEW (ADJ 3): THE READ THROWS ⇒ MOVED (`true`), never a throw and never a dropped move ----------------------------------
    {
      label:
        'a payload whose `layout` READ THROWS (a getter that throws), as the NEXT payload — INCOMPARABLE ⇒ MOVED (ADJ 3): `false` ' +
        'here is the DROPPED-MOVE defect (a real move dropped on an unreadable payload), not a held graph',
      why:
        'ADJ 3 — EVERY member read is inside the guard, and an INCOMPARABLE member answers MOVED: a throwing getter must answer a ' +
        'declared boolean and must never escape into the handler, AND that boolean is PINNED to `true` — a needless re-assembly is ' +
        'cheap, a stale app graph is not',
      previous,
      next: throwingLayoutPayload(),
      expected: true,
    },
    {
      label:
        'a payload whose `layout` READ THROWS (a getter that throws), as the PREVIOUS payload — the guard covers BOTH sides: ' +
        'INCOMPARABLE ⇒ MOVED (ADJ 3), and `false` here is the DROPPED-MOVE defect',
      why:
        'ADJ 3 — the guard covers BOTH sides: a throwing read on `previous` must answer a declared boolean too, and that boolean is ' +
        'PINNED to `true` (MOVED) — the arm grades the DIRECTION, not merely that some boolean came back',
      previous: throwingLayoutPayload(),
      next: { ...previous },
      expected: true,
    },
    {
      label:
        'a payload whose EVERY member READ THROWS (a Proxy `get` trap that throws) — INCOMPARABLE ⇒ MOVED (ADJ 3): `false` here ' +
        'is the DROPPED-MOVE defect a `typeof`/`in` pre-check would produce',
      why:
        'ADJ 3 — a Proxy whose `get` trap throws must answer a declared boolean (no `typeof`/`in` pre-check may stand in for the ' +
        'guard), and that boolean is PINNED to `true`: an impenetrable payload is incomparable, and incomparable answers MOVED',
      previous,
      next: trappedProxyPayload(),
      expected: true,
    },
    // ---- NEW (ADJ 3): INCOMPARABLE ⇒ MOVED --------------------------------------------------------------------------------
    {
      label: 'a CYCLIC `layout` on BOTH sides (two DISTINCT cycles carrying a real move: left → right)',
      why:
        'ADJ 3 — INCOMPARABLE ⇒ MOVED. Both sides print `(unprintable)`, so a printer-based comparison answers EQUAL and a REAL ' +
        'app-graph move is DROPPED; `false` here is the dropped-move defect itself, never "held"',
      previous: cyclicPayload('left'),
      next: cyclicPayload('right'),
      expected: true,
    },
    {
      label: 'a CYCLIC `layout` against a PRINTABLE one',
      why:
        'ADJ 3 — the floor for the arm above: one side alone is already incomparable, so the pair MUST answer MOVED (a needless ' +
        're-assembly is cheap, a stale app graph is not)',
      previous,
      next: cyclicPayload('left'),
      expected: true,
    },
  ]
}

/** **`O5(b)`'s TABLE — `settingsMovesOperatorCensus` (ADJ 2).** The OPERATOR scope's SECTION SET: a NON-EMPTY list (deduped,
 *  order-insensitive) is authoritative; an EMPTY/absent/non-array list means ALL until `panesInitialized === true` and NONE after.
 *  Seven `true` arms (each way the set can move), nine `false` arms (the set-not-sequence arm, the authoritative-list arm, and every
 *  member that is NOT this census's subject), the degenerate class (a NON-RECORD payload answers `false`; a MALFORMED non-array list
 *  answers a declared boolean — both graded as a boolean only), and ADJ 3's
 *  unreadable/cyclic pair — the THROWING list read and the CYCLIC `enabledOperatorPanes` — which are PINNED to `true` (MOVED): an
 *  INCOMPARABLE member answers MOVED, and `false` there is the DROPPED re-author. */
function operatorCensusArms(): CensusArm[] {
  const previous = censusPayload()
  const nonePostInit = (): Record<string, unknown> => ({ ...censusPayload(), enabledOperatorPanes: [], panesInitialized: true })
  const nonePreInit = (): Record<string, unknown> => ({ ...censusPayload(), enabledOperatorPanes: [], panesInitialized: false })
  return [
    // ---- TRUE: the SECTION SET moved --------------------------------------------------------------------------------------
    {
      label: 'a member REMOVED from a NON-EMPTY `enabledOperatorPanes`',
      why: 'ADJ 2 — a non-empty list is authoritative and the SECTION SET is what the operator re-author serves',
      previous,
      next: { ...previous, enabledOperatorPanes: [SETTINGS_PANE] },
      expected: true,
    },
    {
      label: 'a member ADDED to a NON-EMPTY `enabledOperatorPanes`',
      why: 'ADJ 2 — the set grew, so the operator scope\'s sections grew',
      previous,
      next: { ...previous, enabledOperatorPanes: [SETTINGS_PANE, STATUS_PANE, OTHER_OPERATOR_PANE] },
      expected: true,
    },
    {
      label: 'an EMPTY list with `panesInitialized` true → false (NONE → ALL)',
      why: 'ADJ 2 — `applyPersistedPaneVisibility`\'s `emptyMeansEnabled` gate: empty + post-init means NONE, empty + pre-init means ALL',
      previous: nonePostInit(),
      next: nonePreInit(),
      expected: true,
    },
    {
      label: 'an EMPTY list with `panesInitialized` false → true (ALL → NONE)',
      why: 'ADJ 2 — the same gate, read the other way',
      previous: nonePreInit(),
      next: nonePostInit(),
      expected: true,
    },
    {
      label: 'an EMPTY list → a NON-EMPTY list (pre-init: ALL → the list)',
      why: 'ADJ 2 — a non-empty list is authoritative whether or not `panesInitialized` is set, so ALL → {the list} is a move',
      previous: nonePreInit(),
      next: { ...nonePreInit(), enabledOperatorPanes: [SETTINGS_PANE] },
      expected: true,
    },
    {
      label: 'a NON-EMPTY list → an EMPTY list with `panesInitialized` true (the list → NONE)',
      why: 'ADJ 2 — post-init an empty list means NONE, so the enabled sections vanish',
      previous,
      next: { ...previous, enabledOperatorPanes: [] },
      expected: true,
    },
    {
      label: 'a NON-EMPTY list → an EMPTY list with `panesInitialized` false (the list → ALL)',
      why: 'ADJ 2 — pre-init an empty list means ALL, so {the list} → ALL is a move',
      previous,
      next: { ...previous, enabledOperatorPanes: [], panesInitialized: false },
      expected: true,
    },
    // ---- FALSE: the SET did not move, or the member is not this census's subject -------------------------------------------
    {
      label: '`enabledOperatorPanes` REORDERED only (the SECTION SET is unchanged)',
      why:
        'ADJ 2 — the section set is a SET, never a sequence: a reorder re-authors the same sections, so the operator re-author is ' +
        'pure waste (this is the set-not-sequence arm)',
      previous,
      next: { ...previous, enabledOperatorPanes: [STATUS_PANE, SETTINGS_PANE] },
      expected: false,
    },
    {
      label: '`panesInitialized` moved while the list stays NON-EMPTY (the list is authoritative)',
      why: 'ADJ 2 — with a non-empty list the `emptyMeansEnabled` gate is not reached at all, so `panesInitialized` moves nothing here',
      previous,
      next: { ...previous, panesInitialized: false },
      expected: false,
    },
    { label: '`enabledPanes` moved', why: 'ADJ 1/2 — the APP-GRAPH enable set is not the operator scope\'s section set', previous, next: { ...previous, enabledPanes: ['doc-nav'] }, expected: false },
    { label: '`representationMode` moved', why: 'ADJ 1/2 — an app-graph member, never a section-set member', previous, next: { ...previous, representationMode: 'markdown' }, expected: false },
    { label: '`layout` moved', why: 'ADJ 1/2 — an app-graph member, never a section-set member', previous, next: { ...previous, layout: { version: 1, panes: [{ id: 'settings', zone: 'right' }] } }, expected: false },
    { label: '`defaultDocumentId` moved', why: 'ADJ 1/2 — a tab-context member, never a section-set member', previous, next: { ...previous, defaultDocumentId: 'doc-b' }, expected: false },
    { label: '`tabs` moved', why: 'ADJ 1/2 — a boot-only member, never a section-set member', previous, next: { ...previous, tabs: [{ id: 'tab-2', documentId: 'doc-b' }] }, expected: false },
    { label: '`topK` moved', why: 'ADJ 2 — `topK` is a line the settings pane authors, not a section of the operator scope', previous, next: { ...previous, topK: 99 }, expected: false },
    { label: 'an IDENTICAL payload', why: 'the reversal control: the section set did not move', previous, next: { ...previous }, expected: false },
    // ---- DEGENERATE: a DECLARED VERDICT, never a throw ---------------------------------------------------------------------
    { label: 'a null PAIR', why: 'ADJ 2/§2: TOTAL — a payload naming no list and no gate answers a declared boolean', previous: null, next: null, expected: null },
    { label: 'an undefined PREVIOUS', why: 'ADJ 2/§2: TOTAL at every argument', previous: undefined, next: { ...previous, topK: 9 }, expected: null },
    { label: 'an undefined NEXT', why: 'ADJ 2/§2: TOTAL at every argument', previous, next: undefined, expected: null },
    { label: 'a null PREVIOUS', why: 'ADJ 2/§2: TOTAL at every argument', previous: null, next: { ...previous, topK: 9 }, expected: null },
    { label: 'a null NEXT', why: 'ADJ 2/§2: TOTAL at every argument', previous, next: null, expected: null },
    { label: 'a NUMBER as the previous payload', why: 'ADJ 2/§2: TOTAL at every argument', previous: 42, next: { ...previous }, expected: null },
    { label: 'a STRING as the previous payload', why: 'ADJ 2/§2: TOTAL at every argument', previous: 'settings', next: { ...previous }, expected: null },
    { label: 'an ARRAY as the previous payload', why: 'ADJ 2/§2: TOTAL at every argument', previous: [], next: { ...previous }, expected: null },
    {
      label: 'a NON-ARRAY `enabledOperatorPanes` (a string where the list belongs)',
      why:
        'ADJ 2/§2 — a DECLARED VERDICT, and the specific boolean is deliberately NOT pinned here: the boot\'s `scopeList` treats a ' +
        'non-array as an EMPTY list (`[]`), so an implementation may answer on that rule (empty + post-init ⇒ NONE) or treat the ' +
        'malformed member as incomparable ⇒ MOVED; both are declared readings, a throw is not',
      previous,
      next: { ...previous, enabledOperatorPanes: SETTINGS_PANE },
      expected: null,
    },
    { label: 'a MISSING member set (`{}`)', why: 'ADJ 2/§2: an absent list is the `emptyMeansEnabled` class, answered not thrown', previous, next: {}, expected: null },
    // ---- NEW (ADJ 3): THE READ THROWS ⇒ MOVED (`true`), never a throw and never a dropped re-author -----------------------------
    {
      label:
        'a payload whose `enabledOperatorPanes` READ THROWS (a getter that throws) — INCOMPARABLE ⇒ MOVED (ADJ 3): `false` here is ' +
        'the DROPPED re-author (a stale operator surface kept over an unreadable list)',
      why:
        'ADJ 3 — the list read is INSIDE the guard: a throwing getter must answer a declared boolean and must never escape into the ' +
        'handler, AND that boolean is PINNED to `true` — an INCOMPARABLE member answers MOVED (a needless re-assembly is cheap, a ' +
        'stale operator surface is not)',
      previous,
      next: throwingOperatorListPayload(),
      expected: true,
    },
    // ---- NEW (ADJ 3): INCOMPARABLE ⇒ MOVED --------------------------------------------------------------------------------
    {
      label: 'a CYCLIC `enabledOperatorPanes` (an array containing itself)',
      why:
        'ADJ 3 — a self-referential list is INCOMPARABLE (no printer renders it, and its ids cannot be enumerated as a set), so it ' +
        'answers MOVED: under the `scopeList` filtering rule it is an EMPTY list ⇒ NONE, and a non-empty previous ⇒ the section set ' +
        'moved either way. A throw here is the totality defect; `false` is a dropped re-author',
      previous,
      next: cyclicOperatorListPayload(),
      expected: true,
    },
  ]
}

/** Drive ONE pinned predicate over ITS table. Answers the problem sentences; `[]` means "the census is correct". */
function gradeArms(name: string, fn: ((previous: unknown, next: unknown) => unknown) | null, arms: readonly CensusArm[], limb: string): string[] {
  const problems: string[] = []
  if (fn === null) {
    problems.push(
      `${limb}: \`${name}\` is not callable, so NONE of the ${arms.length} arm(s) of its table could be driven — the predicate's ` +
        `absence is the first finding, never a reason to skip the table`,
    )
    return problems
  }
  for (const arm of arms) {
    let answer: unknown
    try {
      answer = fn(arm.previous, arm.next)
    } catch (error) {
      problems.push(
        `${limb}: \`${name}(${arm.label})\` THREW (${String(error)}) — §2/ADJ 3: the predicate is TOTAL: EVERY member read is inside ` +
          `the guard and an INCOMPARABLE member answers MOVED, so no payload may escape into the handler. Limb: ${arm.why}`,
      )
      continue
    }
    if (typeof answer !== 'boolean') {
      problems.push(
        `${limb}: \`${name}(${arm.label})\` answered ${shown(answer)} (${typeof answer}), not a BOOLEAN — the predicate's answer IS ` +
          `the declaration, so a non-boolean cannot be read as a verdict. Limb: ${arm.why}`,
      )
      continue
    }
    if (arm.expected !== null && answer !== arm.expected) {
      problems.push(
        `${limb}: \`${name}(${arm.label})\` answered ${String(answer)}, not ${String(arm.expected)} — LIMB: ${arm.why}`,
      )
    }
  }
  return problems
}

// ===========================================================================
// THE BOOTED HARNESS (`O1`'s channel readings, `O8`'s paintable clause) — the REAL host with the REAL pane hosts registered in
// EXACTLY the `renderer.ts` order, over the layout-less shim.
// ===========================================================================

const NOW = new Date().toISOString()

function documentSnapshot(): Record<string, unknown> {
  return {
    store: 'main',
    nodes: [{ id: 'head-a', type: 'h1', content: 'Doc A', ownedNodeIds: [], createdAt: NOW, updatedAt: NOW }],
    edges: [
      { id: 'dh1', kind: 'doc-head', source: 'head-a', target: 'doc-a', createdAt: NOW, updatedAt: NOW, documentIds: ['doc-a'] },
    ],
  }
}

/** The recording runtime double — enough for `loadAppGraph` + `mountOperator` to run; no paint reading is claimed here. */
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

interface BootedDrive {
  channel: ReturnType<typeof createPaneEvents> | null
  host: Record<string, unknown> | null
  registry: ReturnType<typeof createPaneRegistry> | null
  problems: string[]
  restore: () => void
}

async function bootHost(limb: string): Promise<BootedDrive> {
  installShim()
  const globals = globalThis as Record<string, unknown>
  const previousWindow = globals['window']
  globals['window'] = { provident: {} }
  const problems: string[] = []
  const channel = createPaneEvents()
  const registry = createPaneRegistry()
  const restore = (): void => {
    globals['window'] = previousWindow
  }
  try {
    const bridge = {
      security: { get: async (): Promise<Record<string, unknown>> => ({ token: null, enabled: ['read', 'gnosis', 'gnosis-edit'] }) },
      gnosis: {
        status: async (): Promise<Record<string, unknown>> => ({
          schemaVersion: 1,
          idFormat: 'b9',
          state: 'Ready',
          version: 'B9-UNIT',
          subsystems: { store: true, graph: true, lexical: true, vector: true, embedding: true, reranker: true },
          lastError: null,
        }),
        query: async (value: string): Promise<Record<string, unknown>> => ({ query: value, results: [] }),
        documents: async (): Promise<unknown> => ({ items: [] }),
        wikis: async (): Promise<unknown> => [],
      },
      edit: {
        onRagStoreChanged: (_handler: (payload: unknown) => void): (() => void) => () => undefined,
        commit: async (): Promise<Record<string, unknown>> => ({ ok: true }),
        commitRich: async (): Promise<Record<string, unknown>> => ({ ok: true }),
        batch: async (): Promise<Record<string, unknown>> => ({ ok: true, applied: [] }),
      },
      rag: {
        snapshot: async (): Promise<Record<string, unknown>> => documentSnapshot(),
        docHeads: async (): Promise<Record<string, unknown>> => ({
          documents: [{ documentId: 'doc-a', title: 'Doc A', path: [], tags: [] }],
        }),
        backlinks: async (nodeId: string): Promise<Record<string, unknown>> => ({
          nodeId,
          backlinks: [],
          outlinks: [],
          crosslinkBacklinks: [],
          crosslinkOutlinks: [],
        }),
        stores: async (): Promise<Record<string, unknown>> => ({
          stores: [{ name: 'main', default: true, persistenceFile: 'provident-rag.json', status: 'loaded' }],
        }),
        query: async (): Promise<Record<string, unknown>> => ({ query: '', ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }),
        journal: async (): Promise<Record<string, unknown>> => ({ entries: [] }),
        manage: async (request: Record<string, unknown>): Promise<Record<string, unknown>> => ({ ok: true, done: request }),
      },
      template: {
        get: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
        onTemplateChanged: (_handler: (payload: unknown) => void): (() => void) => () => undefined,
        create: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
        delete: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
        reset: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      },
      operatorSettings: {
        get: async (): Promise<Record<string, unknown>> => ({
          // ⟨`X1b`⟩ EVERY app-graph census id this harness can register is ENABLED, so the frames exist and the paint's own gate
          // (`not-enabled`) cannot mask a `not-a-pane`; the clause grades the DECLARED WORD, and `not-enabled` is admissible.
          enabledPanes: [...APP_GRAPH_CENSUS],
          enabledOperatorPanes: [SETTINGS_PANE, STATUS_PANE],
          panesInitialized: true,
          defaultDocumentId: null,
          topK: 5,
          representationMode: 'html',
        }),
        set: async (patch: unknown): Promise<unknown> => patch,
        onChanged: (_handler: (settings: unknown) => void): (() => void) => () => undefined,
      },
      onPaneVisibility: (_handler: (change: unknown) => void): (() => void) => () => undefined,
      pushPaneCatalog: (_catalog: unknown): void => undefined,
    }
    // EXACTLY THE `renderer.ts` ORDER: both gnosis hosts register into the SHARED registry, before `SidebarPanes.boot` assembles.
    const GnosisPanesCtor = (await import('../../../src/renderer/gnosis-panes.js')).GnosisPanes as new (opts: unknown) => {
      registerPanes(): void
    }
    new GnosisPanesCtor({ registry, bridge, onChanged: (): void => undefined }).registerPanes()
    const GnosisCrudPanesCtor = (await import('../../../src/renderer/gnosis-crud-panes.js')).GnosisCrudPanes as new (opts: unknown) => {
      registerPanes(): void
    }
    new GnosisCrudPanesCtor({ registry, bridge, onChanged: (): void => undefined }).registerPanes()
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
    }) as Record<string, unknown>
    await (host['boot'] as (runtime: unknown) => Promise<void>).call(host, recordingRuntime())
    return { channel, host, registry, problems, restore }
  } catch (error) {
    problems.push(
      `${limb}: the harness's \`host.boot(runtime)\` THREW (${String(error)}) — the shipped census's ATTACHMENTS and the booted ` +
        `host's verdict vocabulary have no subject, so the reading below cannot be made`,
    )
    return { channel: null, host: null, registry, problems, restore }
  }
}

const loadModule = async (relativePath: string, limb: string): Promise<{ module: Record<string, unknown> | null; problems: string[] }> => {
  try {
    return { module: (await import(/* @vite-ignore */ `${ROOT}${relativePath.replace(/\.ts$/, '.js')}`)) as Record<string, unknown>, problems: [] }
  } catch (error) {
    return { module: null, problems: [`${limb}: \`${relativePath}\` does not resolve as a module (${String(error)}) — no subject`] }
  }
}

// ===========================================================================
// THE TWO PINNED PREDICATES, READ BY NAME (adjudications 1 and 2). There is no discovery and no vocabulary: a symbol that is not
// exported under its pinned name is a NAMED problem in the row's aggregate, and the row's table is then reported as unreadable
// rather than skipped.
// ===========================================================================
interface PinnedPredicate {
  name: string
  /** the exported function, or `null` when the module/export is absent (the problem already names it) */
  fn: ((previous: unknown, next: unknown) => unknown) | null
  problems: string[]
}

async function pinnedPredicate(name: string, limb: string): Promise<PinnedPredicate> {
  const problems: string[] = []
  const loaded = await loadModule(SIDEBAR_FILE, limb)
  problems.push(...loaded.problems)
  if (loaded.module === null) return { name, fn: null, problems }
  const exported = loaded.module[name]
  if (typeof exported !== 'function') {
    problems.push(
      `${limb}: \`${name}\` is NOT an exported function of \`${SIDEBAR_FILE}\` (read ${typeof exported}) — §2's declaration and ` +
        `adjudications 1/2 PIN both census predicates BY NAME (\`${APP_GRAPH_PREDICATE}\`, \`${OPERATOR_CENSUS_PREDICATE}\`), so a ` +
        `missing or renamed export is a NAMED finding here, never a discovery and never a skip`,
    )
    return { name, fn: null, problems }
  }
  return { name, fn: exported as (previous: unknown, next: unknown) => unknown, problems }
}

/** **THE DECLARATION'S LETTER for ONE pinned predicate:** exported, declared ONCE, its body LOCATED and PURE — the same seven
 *  impurity tokens `O5` has always refused, plus the two ADJ 3 properties this clause can read off the text: every member read
 *  lives inside a guard (`try`), because a read outside it is what let a throwing getter escape into the handler. A body that
 *  cannot be brace-matched is a problem in its own right: an unlocatable body must never read as "pure". */
function predicateDeclarationProblems(name: string, limb: string): string[] {
  const problems: string[] = []
  const source = readSource(SIDEBAR_FILE, limb)
  problems.push(...source.problems)
  if (source.code === '') return problems
  const declaration = parseExportedFunction(source.code, name)
  if (declaration.count === 0) {
    problems.push(
      `${limb}: \`${name}\` is NOT DECLARED in \`${SIDEBAR_FILE}\` — §2/adjudications 1-2 pin the symbol BY NAME, so its absence is ` +
        `a finding and the clause has no subject`,
    )
    return problems
  }
  if (!declaration.exported) {
    problems.push(
      `${limb}: \`${name}\` is declared but NOT EXPORTED — §2: the predicate IS the declaration, "one exported PURE TOTAL ` +
        `predicate"; a census a row can only read in prose is the ban \`F-4\` removes`,
    )
  }
  if (declaration.count > 1) {
    problems.push(`${limb}: \`${name}\` is DECLARED ${declaration.count} times — ONE predicate, ONE authority (a second declaration is a second census)`)
  }
  if (declaration.body === '') {
    problems.push(
      `${limb}: the \`${name}\` declaration's BODY could not be located (form: ${declaration.bodyForm === '' ? '(none)' : declaration.bodyForm}) ` +
        `— the purity clause has no subject, and a body brace-match that fails must never be read as "pure"`,
    )
    return problems
  }
  const impurities: string[] = []
  if (/\bthis\s*\./.test(declaration.body)) impurities.push('`this.` (it must not depend on host state)')
  if (/\bawait\b/.test(declaration.body)) impurities.push('`await` (it must be synchronous)')
  if (/\bconsole\s*\./.test(declaration.body)) impurities.push('`console.` (a pure predicate has no route to log)')
  if (/\bbridge\b/.test(declaration.body)) impurities.push('`bridge` (it must not re-read the store)')
  if (/\bfetch\s*\(/.test(declaration.body)) impurities.push('`fetch(` (no I/O)')
  if (/\bwindow\b/.test(declaration.body)) impurities.push('`window` (no global seam)')
  if (/\bdocument\s*\./.test(declaration.body)) impurities.push('`document.` (no DOM)')
  if (impurities.length > 0) {
    problems.push(
      `${limb}: the \`${name}\` body is NOT PURE — it reaches ${impurities.join(', ')}. §2/\`F-4\`: the decision must be decidable ` +
        `from the two payloads alone (body read: ${declaration.body.replace(/\s+/g, ' ').trim().slice(0, 240)})`,
    )
  }
  // ⟨ADJ 3's guard property is graded BEHAVIOURALLY, not structurally (the `O5(a)`/`O5(b)` throwing-getter and Proxy arms): a
  // landing may put the guard in a private helper the predicate's own body delegates to, so demanding a `try` in THIS body would be
  // a spelling pin the adjudication does not authorize. What the body must be is PURE — the seven tokens above.⟩
  return problems
}

beforeAll(() => {
  installShim()
})

// ===========================================================================
// `O1` — THE CENSUS MOVES BY EXACTLY TWO (§6 `O1`; §1 `F-1`/`F-9`).
// ===========================================================================
describe('pane-operator-settings — O1: `REPLUMBED_PANE_IDS` is the NINE-id census with `settings` and `gnosis-status` present, each carrying its cause, ONE boot registration per id, and the change-interest declaration UNMOVED', () => {
  it('O1 — the census parses to exactly the NINE-id set (the runtime value agreeing), `settings` and `gnosis-status` are each NAMED in the docblock immediately above it with a CAUSE, `CHANGE_INTERESTED_PANE_IDS` still parses to exactly `[doc-nav]` and is still module-private, and on the REAL booted host `panes()` is exactly those nine ids with `fire(id)` answering `fired:true, handlers:1` for EVERY one — `settings` and `gnosis-status` included', async () => {
    // §6 `O1`; §1 `F-1` (both panes are absent from the census and the census docblock names both as `B-9`'s), `F-9` (the pins that
    // move). LAYER: envelope-class — two DECLARATION parses over `src/renderer/sidebar-panes.ts` (comments stripped), the module's
    // runtime value as the parse's floor, the RAW docblock above the declaration, and the REAL booted channel.
    // NON-VACUITY: the nine-id POSITIVE arms are the floor for every absence claim (a census that parsed to nothing could not pass
    // them), the docblock arm names each id rather than counting words, and the `fire` arms read a REPORT per id, not a census.
    // MUTATION THAT WOULD RED IT: a census of seven (this unit not landed); a census of ten/eight (a move of the wrong SIZE); a
    // duplicated id (`B2-ADV-04`); a census compiled from a computed initialiser (the parse arms); a cause paragraph that names one
    // pane and not the other; the change-interest declaration widened to the operator panes (`F-9`'s recorded pin).
    // RED AT THIS HEAD: the census is the SEVEN-id set, so both operator panes are absent, the docblock carries no cause for them,
    // and `fire('settings')`/`fire('gnosis-status')` answer `fired:false, handlers:0`.
    const problems: string[] = []
    const source = readSource(SIDEBAR_FILE, 'O1')
    problems.push(...source.problems)

    // ---- (1) THE CENSUS VALUE, PARSED, FLOORED BY THE RUNTIME VALUE ------------------------------------------------------------------
    const census = parseIdListDeclaration(source.code, CENSUS_NAME)
    if (!census.found) {
      problems.push(
        `O1: \`${CENSUS_NAME}\` does not PARSE out of \`${SIDEBAR_FILE}\` — the census is the ONE declaration this unit moves, so its ` +
          `absence is a finding, never a vacuous pass`,
      )
    } else if (census.values === null) {
      problems.push(
        `O1: \`${CENSUS_NAME}\` is declared but does NOT parse to a literal id list — a computed initialiser would hide the move from ` +
          `every row that reads it (the \`B6-F12\` defect)`,
      )
    } else {
      const values = census.values
      const asSet = [...new Set(values)].sort()
      const wantedSet = [...new Set(PINNED_CENSUS)].sort()
      if (fingerprint(asSet) !== fingerprint(wantedSet)) {
        problems.push(
          `O1: \`${CENSUS_NAME}\` parses to ${shown(values)}, whose SET is ${shown(asSet)}, not ${shown(wantedSet)} — §6 \`O1\`: the ` +
            `census "moves by EXACTLY TWO", carrying \`${SETTINGS_PANE}\` and \`${STATUS_PANE}\` beside the seven the \`B-8\` landing ` +
            `left. A move of a different SIZE, or of a different SET, is a different decision than the one recorded`,
        )
      }
      if (values.length !== asSet.length) {
        problems.push(`O1: \`${CENSUS_NAME}\` repeats an id (${shown(values)}) — ONE id, ONE subscriber (\`B2-ADV-04\`)`)
      }
      for (const paneId of [SETTINGS_PANE, STATUS_PANE]) {
        if (!values.includes(paneId)) {
          problems.push(
            `O1: \`${CENSUS_NAME}\` does not carry \`${paneId}\` — §6 \`O1\`: this unit is the one that enters the two operator panes ` +
              `into the census WITH their paint (§3). The census moving without the paint is the half-wire \`D-42\` refuses, which is ` +
              `why the size and the paint are graded in the same set (the paint itself is \`O2\`/\`O3\`/\`O8\`)`,
          )
        }
      }
      if (!census.exported) {
        problems.push(
          `O1: \`${CENSUS_NAME}\` is no longer EXPORTED — the booted rows (\`O1\`'s own channel arm, \`O8\`) read it as the shipped ` +
            `VALUE, so its export is part of the same recorded value`,
        )
      }
      if (census.count > 1) {
        problems.push(`O1: \`${CENSUS_NAME}\` is DECLARED ${census.count} times — §1 \`F-1\`: the census is ONE constant`)
      }
      // (1b) THE PARSE IS FLOORED BY THE RUNTIME VALUE.
      const loaded = await loadModule(SIDEBAR_FILE, 'O1')
      problems.push(...loaded.problems)
      const runtimeCensus = loaded.module === null ? undefined : loaded.module[CENSUS_NAME]
      if (loaded.module !== null) {
        if (!Array.isArray(runtimeCensus)) {
          problems.push(`O1: \`${CENSUS_NAME}\` does not resolve as an array on the module (read ${shown(runtimeCensus)})`)
        } else if (fingerprint([...(runtimeCensus as string[])].sort()) !== fingerprint(asSet)) {
          problems.push(
            `O1: the PARSED census ${shown(asSet)} and the RUNTIME value ${shown(runtimeCensus)} disagree — the parse is not reading ` +
              `the declaration it claims to read, so every arm here would be measuring the wrong bytes`,
          )
        }
      }

      // ---- (2) THE CAUSE PARAGRAPH, read from the RAW text immediately ABOVE the declaration --------------------------------------
      // ⟨THE ONE RAW READ, and why.⟩ The cause paragraph IS a comment, and §1 `F-1` states that "the census docblock names both as
      // `B-9`'s". The block is located by its DECLARATION (the parse's own offset), so no file-wide token search can satisfy it; the
      // stripper is length-preserving, so the stripped offset is the raw offset.
      const block = commentBlockAbove(source.raw, census.index)
      if (block.trim() === '') {
        problems.push(
          `O1: no comment block sits IMMEDIATELY ABOVE \`${CENSUS_NAME}\` — §6 \`O1\`: the two ids enter the census "each carrying ` +
            `its cause paragraph", and the declaration's own recorded style is to state the cause beside the value (every earlier ` +
            `landing's paragraph is there)`,
        )
      } else {
        for (const paneId of [SETTINGS_PANE, STATUS_PANE]) {
          if (!block.includes(paneId)) {
            problems.push(
              `O1: the census docblock does NOT name \`${paneId}\` — §6 \`O1\`: "each carrying its cause paragraph". The block read: ` +
                `${shown(block.replace(/\s+/g, ' ').slice(0, 400))}`,
            )
          }
        }
        if (!/cause/i.test(block)) {
          problems.push(
            `O1: the census docblock carries no CAUSE language (\`cause\`) — the declaration's own recorded style is "AND HERE IS THE ` +
              `CAUSE" per landing, and §6 \`O1\` asks for the cause paragraph rather than a mention`,
          )
        }
        if (!/(fire|producer|push|settle|paint|pane)/i.test(block)) {
          problems.push(
            `O1: the census docblock states no MECHANISM for the two ids (expected one of \`fire\`/\`producer\`/\`push\`/\`settle\`/` +
              `\`paint\`/\`pane\`) — a cause that names no source is a slogan, and §2 names each pane's ONE producer`,
          )
        }
      }
    }

    // ---- (3) THE CHANGE-INTEREST DECLARATION DOES NOT MOVE ------------------------------------------------------------------------
    const change = parseIdListDeclaration(source.code, CHANGE_INTEREST_NAME)
    if (!change.found) {
      problems.push(`O1: \`${CHANGE_INTEREST_NAME}\` no longer parses out of \`${SIDEBAR_FILE}\` — the change census has no subject`)
    } else if (change.values === null) {
      problems.push(`O1: \`${CHANGE_INTEREST_NAME}\` does not parse to a literal id list — a computed initialiser hides it from every row`)
    } else {
      if (fingerprint([...new Set(change.values)].sort()) !== fingerprint([...new Set(PINNED_CHANGE_INTEREST)].sort())) {
        problems.push(
          `O1: \`${CHANGE_INTEREST_NAME}\` parses to ${shown(change.values)}, not ${shown(PINNED_CHANGE_INTEREST)} — §6 \`O1\`: it ` +
            `"does NOT move (neither pane follows engine-changeable data through a re-read it does not have)". \`§12a\` already ` +
            `narrowed this declaration by MEASUREMENT, and an operator pane has no re-read arm at all (\`ASM-B9-1\`)`,
        )
      }
      if (change.exported) {
        problems.push(
          `O1: \`${CHANGE_INTEREST_NAME}\` is now EXPORTED — §4/\`§12a\` keep it module-private; an export here is a second authority ` +
            `for the same declaration`,
        )
      }
    }

    // ---- (4) THE BOOTED CHANNEL: ONE REGISTRATION PER CENSUS ID, AND `fire` ANSWERS EVERY ONE -------------------------------------
    const drive = await bootHost('O1')
    try {
      problems.push(...drive.problems)
      if (drive.channel !== null) {
        const livePanes = drive.channel.panes()
        const wanted = [...new Set(PINNED_CENSUS)].sort()
        const actual = [...new Set(livePanes)].sort()
        if (fingerprint(actual) !== fingerprint(wanted)) {
          problems.push(
            `O1: after boot, \`paneEvents.panes()\` reads ${shown(livePanes)}, whose SET is ${shown(actual)}, not the nine-id census ` +
              `${shown(wanted)} — §4: the \`boot\` loop subscribes the census and NOTHING else, so the boot's attachments ARE the census`,
          )
        }
        if (livePanes.length !== wanted.length) {
          // The SET arm above is the graded one; this reading is folded into the message so a stacked/duplicated registration is
          // legible even when the sets happen to agree.
        }
        for (const paneId of PINNED_CENSUS) {
          const report = drive.channel.fire(paneId)
          if (report.fired !== true || report.handlers !== 1) {
            problems.push(
              `O1: \`fire('${paneId}')\` after boot answered ${shown(report)}, not \`fired:true, handlers:1\` — every census id is ` +
                `subscribed EXACTLY once by the boot loop, and an id the census carries but the loop never subscribes is the silently ` +
                `dead registration \`F-2\` names` +
                (paneId === SETTINGS_PANE || paneId === STATUS_PANE
                  ? ` (this unit's own pane: the census move and the boot loop are the SAME declaration)`
                  : ''),
            )
          }
        }
        // ONE REGISTRATION PER ID (`B2-ADV-04`): the handler count, read off the fire report, is the count that stood.
        const duplicateRegisterers = PINNED_CENSUS.filter((paneId) => drive.channel!.fire(paneId).handlers > 1)
        if (duplicateRegisterers.length > 0) {
          problems.push(
            `O1: \`fire(<id>)\` reported MORE THAN ONE handler for ${shown(duplicateRegisterers)} — ONE registration per id ` +
              `(\`B2-ADV-04\`); a second subscriber would run the pane's whole paint twice per event`,
          )
        }
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `O1 — the census MOVES BY EXACTLY TWO (§6 O1; §1 \`F-1\`/\`F-9\`). ${problems.length} problem(s). \`${CENSUS_NAME}\` must be ` +
        `exactly ${shown(PINNED_CENSUS)} as a SET (exported, declared once, agreeing with the runtime value), the docblock ` +
        `IMMEDIATELY ABOVE it must NAME both operator panes and state each one's CAUSE, \`${CHANGE_INTEREST_NAME}\` must stay ` +
        `${shown(PINNED_CHANGE_INTEREST)} and module-private, and on the REAL booted host \`panes()\` must be those nine ids with ` +
        `\`fire(id)\` answering \`fired:true, handlers:1\` for every one. envelope-class — declaration parses plus the booted channel`,
    ).toEqual([])
  })
})

// ===========================================================================
// `O5(a)` — `settingsMovesAppGraph`: the CORRECTED app-graph census (§2's declaration; adjudications 1 and 3).
// ===========================================================================
describe('pane-operator-settings — O5(a): `settingsMovesAppGraph` is ONE exported, PURE, TOTAL declaration and it answers the CORRECTED two-member app-graph census both ways', () => {
  it('O5(a) — `settingsMovesAppGraph(previous, next)` is EXPORTED from `src/renderer/sidebar-panes.ts`, declared ONCE with a PURE and LOCATABLE body (no `this.`/`await`/`console.`/`bridge`/`fetch(`/`window`/`document.`), answers `true` for exactly `representationMode`/`layout` moved, `false` for `enabledPanes` (ECHO)/`defaultDocumentId` (TAB-CONTEXT-ONLY)/`tabs` (BOOT-ONLY, both directions)/`topK`/`panesInitialized`/`enabledOperatorPanes` moved and for an identical payload, a DECLARED VERDICT (never a throw) at every degenerate argument, and MOVED for an INCOMPARABLE member — a throwing getter, a Proxy `get` trap AND a cyclic `layout`', async () => {
    // §6 `O5` as CORRECTED; §2 ("one exported PURE TOTAL predicate … decides whether a settings push ALSO re-derives the app graph");
    // ADJ 1 (the census names EXACTLY `representationMode`/`layout`; the other three are REMOVED, each with its reason) and ADJ 3
    // (every member read inside the guard; INCOMPARABLE ⇒ MOVED).
    // LAYER: envelope/pure — the DECLARATION text of `src/renderer/sidebar-panes.ts` (comments stripped, body brace-matched) and the
    // REAL exported function driven over its own table. Nothing here paints, re-assembles or reads a DOM.
    // NON-VACUITY: the `true` arms and the `false` arms are driven through the SAME function, so a constant answer reds at least one;
    // the degenerate arms floor the totality claim (a declared BOOLEAN, and `false` for a NON-RECORD payload — one that names no
    // member has moved none); the three throwing-getter/Proxy arms and the two cyclic arms are PINNED to `true` (MOVED), so an
    // implementation that caught the unreadable read and answered `false` reds instead of passing on "some boolean came back" — that
    // `false` IS the dropped-move defect ADJ 3 forbids; and the PURITY clause is floored by the export/once/locatable arms on the
    // SAME declaration.
    // MUTATION THAT WOULD RED IT: the census left at the five members (`enabledPanes`/`defaultDocumentId`/`tabs` counted); the census
    // narrowed to ONE member; a `JSON.stringify` comparison with no incomparable branch (the cyclic pair answers EQUAL); a member read
    // left outside the guard (the throwing getter escapes); a guard that catches the unreadable read and answers `false` (the
    // DROPPED-MOVE direction ADJ 3 forbids — the tightened throwing/Proxy arms red on exactly this); an unexported or duplicated
    // predicate; a body that reaches `this.`/`bridge`.
    // RED AT THIS HEAD: the census still counts FIVE members (`enabledPanes`/`defaultDocumentId`/`tabs` still answer `true`), the cyclic
    // pair answers `false` (both sides print `(unprintable)` ⇒ equal ⇒ a real move DROPPED), and every throwing arm THROWS out of the
    // member read.
    const problems: string[] = []

    // ---- (1) THE SYMBOL, BY ITS PINNED NAME ------------------------------------------------------------------------------------
    const handle = await pinnedPredicate(APP_GRAPH_PREDICATE, 'O5(a)')
    problems.push(...handle.problems)

    // ---- (2) THE BEHAVIOUR: the WHOLE table, both ways -------------------------------------------------------------------------
    problems.push(...gradeArms(handle.name, handle.fn, appGraphArms(), 'O5(a)'))

    // ---- (3) THE DECLARATION'S LETTER ------------------------------------------------------------------------------------------
    problems.push(...predicateDeclarationProblems(APP_GRAPH_PREDICATE, 'O5(a)·declaration'))

    expect(
      problems,
      `O5(a) — the CORRECTED app-graph field census (§6 O5; §1 \`F-4\`; §2; ADJ 1/ADJ 3). ${problems.length} problem(s). ` +
        `\`${APP_GRAPH_PREDICATE}(previous, next)\` must be an EXPORTED, ONCE-declared, PURE, LOCATABLE predicate that answers \`true\` ` +
        `for exactly two members — \`representationMode\` and \`layout\`, the only two that reach the assembled envelope — and \`false\` ` +
        `for \`enabledPanes\` (REMOVED: ECHO — the registry route sets it and rebuilds itself before the push arrives), ` +
        `\`defaultDocumentId\` (REMOVED: TAB-CONTEXT-ONLY — \`getTabContext()\`'s \`lastFocusedDocumentId\` only) and \`tabs\` (REMOVED: ` +
        `BOOT-ONLY — \`renderer.ts\` reads it once at boot), plus \`topK\`/\`panesInitialized\`/\`enabledOperatorPanes\` and an identical ` +
        `payload. At every degenerate argument it answers a declared BOOLEAN and never throws, and an INCOMPARABLE member (a throwing ` +
        `getter, a Proxy \`get\` trap, a CYCLIC \`layout\`) answers MOVED — "a needless re-assembly is cheap, a stale app graph is ` +
        `not". envelope/pure; the BOTH-WAYS HOST drive of the same census is \`O5\` in the integration file`,
    ).toEqual([])
  })
})

// ===========================================================================
// `O5(b)` — `settingsMovesOperatorCensus`: the OPERATOR scope's SECTION SET (ADJ 2; ADJ 3 for the degenerate classes).
// ===========================================================================
describe('pane-operator-settings — O5(b): `settingsMovesOperatorCensus` is ONE exported, PURE, TOTAL declaration and it grades the OPERATOR scope\'s SECTION SET', () => {
  it('O5(b) — `settingsMovesOperatorCensus(previous, next)` is EXPORTED from `src/renderer/sidebar-panes.ts`, declared ONCE with a PURE and LOCATABLE body, and answers `true` when the SECTION SET moved (a member removed / added; an EMPTY `enabledOperatorPanes` with `panesInitialized` flipping either way; empty → non-empty; non-empty → empty with the gate both set and unset) while a NON-EMPTY list stays authoritative (a REORDER answers `false`, and so does `panesInitialized` moving beside it), `false` for every member that is not this census\'s subject, a DECLARED VERDICT (never a throw) at every degenerate argument, and MOVED for a THROWING list read and for a CYCLIC `enabledOperatorPanes`', async () => {
    // §6 `O5`'s operator half, ADJ 2 verbatim: the OPERATOR scope's SECTION SET, a NON-EMPTY `enabledOperatorPanes` (non-empty string
    // ids, deduped, ORDER-INSENSITIVE) authoritative, an EMPTY/absent/non-array list meaning ALL sections until
    // `panesInitialized === true` and NONE once it is `true` (`applyPersistedPaneVisibility`'s `emptyMeansEnabled` gate). ADJ 3 governs
    // the incomparable class exactly as in `O5(a)`.
    // LAYER: envelope/pure — the DECLARATION text (comments stripped, body brace-matched) plus the REAL exported function.
    // NON-VACUITY: the set-MOVED arms and the set-HELD arms are driven through the SAME function, so neither a "always true" nor an
    // "always false" answer can pass; the REORDER arm is the set-not-sequence control (it moves the LIST and must not move the answer)
    // and the non-empty-list/`panesInitialized` arm is the authoritative-list control; the degenerate arms floor totality (a declared
    // BOOLEAN, and `false` for a NON-RECORD payload); and the throwing-list arm and the cyclic-list arm are both PINNED to `true`
    // (MOVED), so an implementation that answered `false` on an UNREADABLE list reds — that `false` is the DROPPED re-author ADJ 3
    // forbids.
    // MUTATION THAT WOULD RED IT: a census that compares the list as a SEQUENCE (the reorder arm answers `true`); one that lets
    // `panesInitialized` speak beside a non-empty list; one that treats an empty list as NONE regardless of the pre-init gate; one that
    // reads the list outside the guard (the throwing getter escapes); one that catches the unreadable read and answers `false` (the
    // DROPPED-MOVE direction — the tightened throwing arm reds on exactly this); one that filters ids without an incomparable branch
    // (the cyclic list collapses to "empty" silently, which is the same answer as MOVED here only BY ACCIDENT — the arm's message
    // says which).
    // RED AT THIS HEAD: the symbol does not exist at all, so the loader answers a NAMED problem and every arm of the table is reported
    // as unreadable rather than skipped.
    const problems: string[] = []

    // ---- (1) THE SYMBOL, BY ITS PINNED NAME ------------------------------------------------------------------------------------
    const handle = await pinnedPredicate(OPERATOR_CENSUS_PREDICATE, 'O5(b)')
    problems.push(...handle.problems)

    // ---- (2) THE BEHAVIOUR: the WHOLE table, both ways -------------------------------------------------------------------------
    problems.push(...gradeArms(handle.name, handle.fn, operatorCensusArms(), 'O5(b)'))

    // ---- (3) THE DECLARATION'S LETTER ------------------------------------------------------------------------------------------
    problems.push(...predicateDeclarationProblems(OPERATOR_CENSUS_PREDICATE, 'O5(b)·declaration'))

    // ---- (4) THE TWO PREDICATES ARE DISTINCT DECLARATIONS (`O5(a)`'s symbol must not be reused for this census) ------------------
    const other = await pinnedPredicate(APP_GRAPH_PREDICATE, 'O5(b)·adjacent')
    problems.push(...other.problems)
    if (handle.fn !== null && other.fn !== null && handle.fn === other.fn) {
      problems.push(
        `O5(b): \`${OPERATOR_CENSUS_PREDICATE}\` and \`${APP_GRAPH_PREDICATE}\` resolve to the SAME function — ADJ 2 adds a SECOND ` +
          `predicate over a DIFFERENT subject (the operator scope's section set, not the app graph's two members); one function under ` +
          `two names cannot answer both tables, and the census that is missing would be invisible`,
      )
    }

    expect(
      problems,
      `O5(b) — the OPERATOR-CENSUS predicate (§6 O5's operator half; ADJ 2; ADJ 3). ${problems.length} problem(s). ` +
        `\`${OPERATOR_CENSUS_PREDICATE}(previous, next)\` must answer \`true\` iff the OPERATOR scope's SECTION SET moved: a NON-EMPTY ` +
        `\`enabledOperatorPanes\` is authoritative and compared as a SET (deduped, order-insensitive), while an EMPTY/absent/non-array ` +
        `list means ALL sections until \`panesInitialized === true\` and NONE once it is \`true\`. \`false\` for a REORDER, for ` +
        `\`panesInitialized\` beside a non-empty list, and for every member that is not this census's subject ` +
        `(\`enabledPanes\`/\`representationMode\`/\`layout\`/\`defaultDocumentId\`/\`tabs\`/\`topK\`); a DECLARED boolean at every ` +
        `degenerate argument; and MOVED for an INCOMPARABLE list (a throwing getter, a CYCLIC list). It must be a DIFFERENT function ` +
        `from \`${APP_GRAPH_PREDICATE}\`. envelope/pure; the host half is \`O5(c)\` in the integration file`,
    ).toEqual([])
  })
})

// ===========================================================================
// `O5(b-doc)` — the census DOCBLOCK, graded STRUCTURALLY (the `O1` technique: the `/** … */` block IMMEDIATELY ABOVE the declaration,
// read over the RAW source at the parse's own offset).
// ===========================================================================
describe('pane-operator-settings — O5(b-doc): the census docblock NAMES the two counted members and each of the three REMOVED ones WITH ITS REASON', () => {
  it('O5(b-doc) — the `/** … */` block IMMEDIATELY ABOVE `export function settingsMovesAppGraph` names the two COUNTED members (`representationMode`, `layout`) AND each REMOVED member WITH ITS REASON — `enabledPanes` (ECHO), `tabs` (BOOT-ONLY) and `defaultDocumentId` (a TAB-CONTEXT reason) — read as the block above the declaration, so a file-wide token search cannot satisfy it', async () => {
    // ADJ 1: "Three members are REMOVED, each with its reason written in the predicate's docblock". The corpus's rule is that PROSE IS
    // GRADED STRUCTURALLY, never semantically (`O1`'s adjudication 3): the block must NAME each member and carry that member's REASON
    // WORD, and the block is located by the DECLARATION's own offset (the stripper is length-preserving, so stripped and raw offsets
    // coincide), so no `grep`-shaped reading can pass this row.
    // LAYER: envelope/pure — one RAW-docblock reading of `src/renderer/sidebar-panes.ts` plus the declaration parse that locates it.
    // NON-VACUITY: the block must name FIVE members (two counted + three removed) and three reason words, so neither an empty block nor
    // a slogan can pass; the negative counterpart is structural — a comment block that is NOT immediately above the declaration is
    // never read at all (`commentBlockAbove` answers `''`), which is what a file-wide search would have skipped.
    // MUTATION THAT WOULD RED IT: the docblock left at the five-member census with no reason per removed member (this head); a docblock
    // that names the members but calls them "counted" (the reason words are the graded part); the reasons moved to a paragraph far above
    // the declaration (the block is no longer the one immediately above it); a rename that leaves `enabledPanes`/`defaultDocumentId`/
    // `tabs` unmentioned.
    // RED AT THIS HEAD: the block lists `enabledPanes`, `defaultDocumentId` and `tabs` as COUNTED members and carries no `echo`, no
    // `boot` and no tab-context reason for them.
    const problems: string[] = []
    const source = readSource(SIDEBAR_FILE, 'O5(b-doc)')
    problems.push(...source.problems)
    if (source.code !== '') {
      const declaration = parseExportedFunction(source.code, APP_GRAPH_PREDICATE)
      if (declaration.count === 0 || declaration.index < 0) {
        problems.push(
          `O5(b-doc): \`${APP_GRAPH_PREDICATE}\` does not PARSE out of \`${SIDEBAR_FILE}\` — the docblock this row grades sits above ` +
            `that declaration, so its absence leaves the clause with no subject`,
        )
      } else {
        const block = commentBlockAbove(source.raw, declaration.index)
        if (block.trim() === '') {
          problems.push(
            `O5(b-doc): no \`/** … */\` block sits IMMEDIATELY ABOVE \`export function ${APP_GRAPH_PREDICATE}\` — ADJ 1 requires the ` +
              `three removed members' reasons "written in the predicate's docblock", and a comment elsewhere in the file is not that ` +
              `docblock. (This is also why a file-wide token search cannot satisfy the rule: the reading is the block above the ` +
              `declaration, and there is none.)`,
          )
        } else {
          const flat = block.replace(/\s+/g, ' ')
          // (1) THE TWO COUNTED MEMBERS must be NAMED by the block.
          for (const member of ['representationMode', 'layout']) {
            if (!flat.includes(member)) {
              problems.push(
                `O5(b-doc): the docblock above \`${APP_GRAPH_PREDICATE}\` never names \`${member}\` — ADJ 1: the census names EXACTLY ` +
                  `\`representationMode\` and \`layout\`, "the only two members that actually reach the assembled envelope", and the ` +
                  `docblock is where that is written. Block read: ${shown(flat.slice(0, 400))}`,
              )
            }
          }
          // (2) EACH REMOVED MEMBER, WITH ITS REASON WORD, in that member's own prose.
          const removed: ReadonlyArray<{ member: string; reason: RegExp; reasonName: string; why: string }> = [
            {
              member: 'enabledPanes',
              reason: /\becho(?:ed|es|ing)?\b/i,
              reasonName: 'ECHO',
              why:
                'it reaches the app graph only through the registry, which `refresh()` never re-applies, and the local route sets the ' +
                'registry BEFORE it persists and runs its own rebuild — so the push is an echo for that member',
            },
            {
              member: 'defaultDocumentId',
              reason: /\bcontext\b|getTabContext|tab-?context/i,
              reasonName: 'a TAB-CONTEXT reason (`TAB-CONTEXT-ONLY`, `getTabContext`)',
              why: 'it reaches `getTabContext()`\'s `lastFocusedDocumentId` only',
            },
            {
              member: 'tabs',
              reason: /\bboot(?:s|ed|ing)?\b/i,
              reasonName: 'BOOT-ONLY',
              why: '`renderer.ts` reads `settings.tabs` once at boot (`tabStrip.load(settings?.tabs)`)',
            },
          ]
          for (const entry of removed) {
            if (!flat.includes(entry.member)) {
              problems.push(
                `O5(b-doc): the docblock above \`${APP_GRAPH_PREDICATE}\` never names the REMOVED member \`${entry.member}\` — ADJ 1 ` +
                  `removes it WITH its reason (${entry.reasonName}: ${entry.why}), and a removal nobody wrote down is the "slogan" the ` +
                  `census replaced. Block read: ${shown(flat.slice(0, 400))}`,
              )
              continue
            }
            // THE MEMBER'S OWN PROSE: the reason word must follow the member's mention inside the block (prose is graded structurally,
            // so the proximity is what makes it "that member's reason" rather than a token in the same paragraph).
            let at = flat.indexOf(entry.member)
            let found = false
            while (at >= 0 && !found) {
              found = entry.reason.test(flat.slice(at, at + 300))
              at = flat.indexOf(entry.member, at + 1)
            }
            if (!found) {
              problems.push(
                `O5(b-doc): the docblock names \`${entry.member}\` but gives NO reason for removing it (expected ${entry.reasonName} ` +
                  `within that member's own prose) — ADJ 1: each of the three removed members carries its reason IN THE DOCBLOCK, and ` +
                  `the reason is ${entry.why}. Block read: ${shown(flat.slice(0, 400))}`,
              )
            }
          }
        }
      }
    }

    expect(
      problems,
      `O5(b-doc) — the census DOCBLOCK, graded STRUCTURALLY (§1 \`O1\`'s RAW-docblock technique; ADJ 1). ${problems.length} ` +
        `problem(s). The \`/** … */\` block IMMEDIATELY ABOVE \`export function ${APP_GRAPH_PREDICATE}\` must NAME the two counted ` +
        `members (\`representationMode\`, \`layout\`) and EACH of the three REMOVED ones together with its reason word: ` +
        `\`enabledPanes\` ⇒ ECHO, \`tabs\` ⇒ BOOT-ONLY, \`defaultDocumentId\` ⇒ a TAB-CONTEXT reason. The block is read at the ` +
        `declaration's own offset, so a file-wide token search cannot satisfy it. envelope-class (document layer: the landing's own ` +
        `prose)`,
    ).toEqual([])
  })
})

// ===========================================================================
// `O8` — `X1b` STAYS GREEN AND GETS STRICTER (§6 `O8`; §4).
// ===========================================================================
describe('pane-operator-settings — O8: `census ⊆ paintable` over the NINE-id census, proved falsifiable on two forged censuses', () => {
  it('O8 — over the REAL booted `SidebarPanes` host (whose registry carries the REAL `GnosisPanes` + `GnosisCrudPanes` registrations, exactly as `renderer.ts` installs them) EVERY id in the LIVE nine-id `REPLUMBED_PANE_IDS` answers `updatePane(id)` with a reason that is NOT `operator-scope` and NOT `not-a-pane` — `settings` and `gnosis-status` included; the SAME clause answers a problem for a fabricated UNPAINTABLE id and for a fabricated id in the OPERATOR SECTION namespace, and a fabricated `operator`-scope pane registered after boot must answer a word OTHER than `operator-scope`', async () => {
    // §6 `O8`; §4 ("`X1b`'s STATUS, stated plainly: it stays GREEN and gets STRICTER — every id in the NINE-id census must answer
    // `updatePane` ≠ `operator-scope`/`not-a-pane` over the real booted host, `settings` and `gnosis-status` included. If the
    // operator paint cannot be proved paintable, the census entry MUST NOT be added and this unit reports that instead").
    // LAYER: envelope-class — the REAL host booted over the LAYOUT-LESS `dom-shim`; the reading is the paint's OWN declared word.
    // NON-VACUITY: the clause is proved FALSIFIABLE on this same host before its live reading counts (two forged censuses, each of
    // which MUST answer a problem), and the live census is read off the MODULE (never typed here), so it moves with the declaration.
    // ⟨THE FORGED `gnosis-status` MUTANT IS RETIRED, AND THE ROW SAYS SO.⟩ Before this unit, `gnosis-status` was the CONCRETE
    // dead-registration hazard (`F-2`: it answered `operator-scope`), so `X1b` forged a census naming it. §3 REPLACES that refusal
    // with a ROUTE, so after the landing `gnosis-status` IS paintable and forging it would prove nothing — the mutant therefore MOVES
    // to a fabricated id no host registers (`${FORGED_ID}`) and to a fabricated id in the operator SECTION namespace
    // (`${FORGED_OPERATOR_ID}`), both of which must still answer a problem; and the classified `operator`-scope case is kept as its
    // own arm (a fabricated operator pane registered after boot must NOT answer `operator-scope`, which is what that word's removal
    // means on a host that HAS an operator mount).
    // RED AT THIS HEAD: `settings` and `gnosis-status` are in neither the census NOR paintable — `updatePane` answers
    // `operator-scope` for both — so the live arm reds twice and, with them, the module's census does not carry them at all.
    const problems: string[] = []
    const loaded = await loadModule(SIDEBAR_FILE, 'O8')
    problems.push(...loaded.problems)
    const liveCensus = loaded.module === null ? undefined : loaded.module[CENSUS_NAME]
    if (loaded.module !== null && (!Array.isArray(liveCensus) || !liveCensus.every((id) => typeof id === 'string'))) {
      problems.push(`O8: \`${CENSUS_NAME}\` reads ${shown(liveCensus)}, not an array of pane ids — the clause has no subject`)
    }
    const censusIds: string[] = Array.isArray(liveCensus) ? (liveCensus as string[]).filter((id) => typeof id === 'string') : []
    if (censusIds.length === 0) {
      problems.push(
        `O8: the LIVE census parsed EMPTY — "every census id is paintable" would be VACUOUSLY true, which is the vacuity the ` +
          `clause exists to refuse`,
      )
    }
    // THE NINE-ID REQUIREMENT is stated HERE as well as in `O1`, because the clause's subject is the NINE-id census: the two
    // operator panes must be IN it for their paint to be reachable at all (§4).
    for (const paneId of [SETTINGS_PANE, STATUS_PANE]) {
      if (!censusIds.includes(paneId)) {
        problems.push(
          `O8: the LIVE census (${shown(censusIds)}) does not carry \`${paneId}\` — §4: \`X1b\` "gets STRICTER: every id in the ` +
            `NINE-id census must answer … \`settings\` and \`gnosis-status\` included"; an operator pane outside the census can never ` +
            `receive its fire, whatever its paint answers`,
        )
      }
    }

    const drive = await bootHost('O8')
    try {
      problems.push(...drive.problems)
      if (drive.host !== null) {
        // ---- (a) THE FALSIFIABILITY ARMS, FIRST: the clause must be able to REFUSE ------------------------------------------
        const unknownMutant = [...censusIds, FORGED_ID]
        const unknownProblems = censusPaintableProblems(drive.host, unknownMutant, `the forged census + \`${FORGED_ID}\``, 'O8·proof')
        if (unknownProblems.length === 0) {
          problems.push(
            `O8·proof: the clause ACCEPTED the forged census ${shown(unknownMutant)} — an unregistered id answers \`not-a-pane\`, so any ` +
              `census entry no host registered MUST be a problem. A clause that cannot red this mutant cannot red the class it exists for`,
          )
        }
        const operatorIshMutant = [...censusIds, FORGED_OPERATOR_ID]
        const operatorIshProblems = censusPaintableProblems(
          drive.host,
          operatorIshMutant,
          `the forged census + \`${FORGED_OPERATOR_ID}\` (an id in the operator SECTION namespace, registered nowhere)`,
          'O8·proof',
        )
        if (operatorIshProblems.length === 0) {
          problems.push(
            `O8·proof: the clause ACCEPTED the forged census ${shown(operatorIshMutant)} — \`${FORGED_OPERATOR_ID}\` is nobody's ` +
              `registration (it only LOOKS like an \`operator-pane-<id>\` section id), so it answers \`not-a-pane\` and MUST be a problem`,
          )
        }
        // ---- (b) THE CLASSIFIED OPERATOR CASE: a fabricated `operator`-scope pane, registered AFTER boot ----------------------
        // §3 step 3 answers `not-mounted` for an enabled operator pane with no section in the retained graph, and `not-mounted` is
        // ADMISSIBLE in this clause (a transient state). What is NOT admissible — and what this arm grades — is `operator-scope`:
        // on a host that HAS an operator mount, §3 turns that word into a ROUTE, so a fabricated operator pane answering it would
        // be the very refusal this unit deletes.
        const registry = drive.registry
        if (registry !== null) {
          try {
            registry.register({ id: 'probe-b9-operator-pane', title: 'Probe', scope: 'operator', render: () => ({ type: 'div' }) } as never)
            registry.enable('probe-b9-operator-pane')
          } catch (error) {
            problems.push(`O8·proof: the harness could not register the fabricated operator pane (${String(error)})`)
          }
          const verdict = (drive.host.updatePane as (id: string) => Record<string, unknown>).call(
            drive.host,
            'probe-b9-operator-pane',
          )
          if (verdict['reason'] === 'operator-scope') {
            problems.push(
              `O8: a fabricated \`operator\`-scope pane answers \`operator-scope\` on a host that HAS an operator mount — §3 replaces ` +
                `that refusal with a ROUTE (step 2), so an operator registration can no longer be told "your scope has no paint here". ` +
                `The fabricated pane has no section in the retained graph, so the lawful answer is \`not-mounted\` ` +
                `(\`F-2\`'s hazard, read on the pane class itself)`,
            )
          }
        }
        // ---- (c) THE LIVE CLAUSE ----------------------------------------------------------------------------------------------
        problems.push(...censusPaintableProblems(drive.host, censusIds, 'the LIVE census', 'O8'))
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `O8 — the CONVERSE CLAUSE: \`census ⊆ paintable\` over the NINE-id census (§6 O8; §4; \`F-2\`). ${problems.length} problem(s). ` +
        `Over the REAL booted host, EVERY id in the live \`${CENSUS_NAME}\` (${shown(censusIds)}) must answer \`updatePane(id)\` with ` +
        `a reason OTHER than \`operator-scope\`/\`not-a-pane\` — \`${SETTINGS_PANE}\` and \`${STATUS_PANE}\` included — and the SAME ` +
        `clause must answer a problem for a fabricated unpaintable id and for a fabricated id in the operator SECTION namespace, ` +
        `while a fabricated \`operator\`-scope registration must NOT answer \`operator-scope\`. The retired \`gnosis-status\` mutant is ` +
        `NAMED here: after the landing that pane IS paintable, so the fatal hazard it represented is gone — which is what makes the ` +
        `stricter reading possible. envelope-class`,
    ).toEqual([])
  })
})

// ===========================================================================
// `S1` — THE LETTER (§6 `S1`; §4).
// ===========================================================================
describe('pane-operator-settings — S1: the letter of the landing, over comments-stripped source', () => {
  it('S1 — comments stripped: the census is the NINE ids (both operator panes literally declared); `firePaneUpdate`\'s body calls `paneEvents.fire(paneId)` and carries NO `host.refresh()`, NO scope probe and NO `⟨B-9⟩` marker; `paintPane`\'s body carries NO `operator-scope` verdict at all (while `pane-events.ts`\'s vocabulary still does); `onOperatorSettingsChanged` FIRES `settings` BEFORE any `requestRebuild`; and the field-census predicate is an EXPORTED declaration', async () => {
    // §6 `S1`; §4 SITE 1/SITE 2. LAYER: envelope-class — DECLARATION parses over `src/renderer/**`'s text (comments stripped,
    // bodies brace-matched). NON-VACUITY: every ABSENCE arm is floored by a POSITIVE arm on the same body (the fire call must still
    // be there; the vocabulary must still be in `pane-events.ts`; the census must still be the nine ids), so a landing that deleted
    // the whole arrow cannot pass by deletion.
    // RED AT THIS HEAD: `firePaneUpdate` still carries the `⟨B-9⟩` fallback (its scope probe and its `host.refresh()`), the census
    // is seven ids, `paintPane` still returns `verdict('operator-scope')`, and `onOperatorSettingsChanged` fires nothing at all.
    const problems: string[] = []

    // ---- (a) THE CENSUS: nine ids, both operator panes LITERALLY declared ------------------------------------------------------
    const sidebar = readSource(SIDEBAR_FILE, 'S1')
    problems.push(...sidebar.problems)
    const census = parseIdListDeclaration(sidebar.code, CENSUS_NAME)
    if (!census.found || census.values === null) {
      problems.push(`S1: \`${CENSUS_NAME}\` does not parse to a literal id list out of \`${SIDEBAR_FILE}\` — the letter has no subject`)
    } else {
      if (fingerprint([...new Set(census.values)].sort()) !== fingerprint([...new Set(PINNED_CENSUS)].sort())) {
        problems.push(
          `S1: \`${CENSUS_NAME}\` parses to ${shown(census.values)}, not the NINE-id set ${shown(PINNED_CENSUS)} — §6 \`S1\`: "the ` +
            `census is nine ids"`,
        )
      }
    }

    // ---- (b) `renderer.ts`'s `firePaneUpdate`: the fire, and NOTHING else -----------------------------------------------------
    const rendererSource = readSource(RENDERER_FILE, 'S1')
    problems.push(...rendererSource.problems)
    const firePaneUpdate = bodyAt(rendererSource.code, /const[ \t]+firePaneUpdate[ \t]*=/, 'S1', 'const firePaneUpdate =')
    problems.push(...firePaneUpdate.problems)
    if (firePaneUpdate.body !== '') {
      if (!/paneEvents\s*\.\s*fire\s*\(\s*paneId\s*\)/.test(firePaneUpdate.body)) {
        problems.push(
          `S1: \`firePaneUpdate\` no longer calls \`paneEvents.fire(paneId)\` — §4 SITE 1: "the arrow keeps \`fire(paneId)\` and ` +
            `nothing else"`,
        )
      }
      if (/\.\s*refresh\s*\(/.test(firePaneUpdate.body)) {
        problems.push(
          `S1: \`firePaneUpdate\`'s body STILL reaches \`refresh()\` (body: ${shown(firePaneUpdate.body.replace(/\s+/g, ' ').trim())}) — ` +
            `§4 SITE 1 DELETES that branch: "no \`registry.get(...)?.scope\` probe, no \`host.refresh()\`"`,
        )
      }
      if (/\bregistry\s*\.\s*get\b/.test(firePaneUpdate.body) || /\bscope\b/.test(firePaneUpdate.body)) {
        problems.push(
          `S1: \`firePaneUpdate\`'s body still carries a SCOPE PROBE (\`registry.get\`/\`scope\`) — §4 SITE 1 deletes it with the ` +
            `fallback it guards`,
        )
      }
      // THE RAW MARKER: `⟨B-9⟩` is a comment, so it is read from the RAW body at the same offsets (the stripper is
      // length-preserving). §4 SITE 1's marker exists only to order the DELETION — a deleted branch cannot keep it.
      const rawBody = rendererSource.raw.slice(firePaneUpdate.open, firePaneUpdate.open + firePaneUpdate.body.length)
      if (rawBody.includes('⟨B-9⟩')) {
        problems.push(
          `S1: the \`⟨B-9⟩\` MARKER still sits inside \`firePaneUpdate\` — §4 SITE 1 DELETES the branch the marker ordered the deletion ` +
            `of; a marker over a deleted branch is a citation to nothing`,
        )
      }
    }

    // ---- (c) `paintPane`'s operator arm: a ROUTE, never a REFUSAL -------------------------------------------------------------
    const paintPane = bodyAt(sidebar.code, /private[ \t]+paintPane[ \t]*\(/, 'S1', 'private paintPane(')
    problems.push(...paintPane.problems)
    if (paintPane.body !== '') {
      if (/operator-scope/.test(paintPane.body)) {
        problems.push(
          `S1: \`paintPane\`'s body still carries \`operator-scope\` (${shown(
            paintPane.body.split('\n').filter((line) => /operator-scope/.test(line)).join(' | ').slice(0, 300),
          )}) — §3 step 2: "the \`PaneDefinition\` off the REGISTRY (unchanged step 1); \`scope === 'operator'\` is now a ROUTE, not ` +
            `an absence", so \`return verdict('operator-scope')\` must be gone`,
        )
      }
      // THE POSITIVE FLOOR: the paint body must still be the ONE paint (its own closed vocabulary is intact).
      if (!/verdict\(/.test(paintPane.body)) {
        problems.push(
          `S1: \`paintPane\`'s body carries no \`verdict(…)\` call at all — the paint's own closed vocabulary is the floor that makes ` +
            `the absence arm above a reading rather than a deletion`,
        )
      }
    }
    // THE VOCABULARY DID NOT SHRINK: the WORD stays in `pane-events.ts` for the hosts that legitimately have no operator mount (§3).
    const paneEventsSource = readSource(PANE_EVENTS_FILE, 'S1')
    problems.push(...paneEventsSource.problems)
    if (paneEventsSource.code !== '' && !/operator-scope/.test(paneEventsSource.code)) {
      problems.push(
        `S1: \`${PANE_EVENTS_FILE}\` no longer declares \`operator-scope\` in \`PaneUpdateReason\` — §3: "the WORD stays in ` +
          `\`pane-events.ts\`'s union for the hosts that legitimately have no operator mount". This unit removes the ANSWER, not the ` +
          `word`,
      )
    }

    // ---- (d) `onOperatorSettingsChanged`: COMMIT → FIRE → the TWO guarded re-assemblies (§4 SITE 2's ORDER) ---------------------
    const onChanged = bodyAt(sidebar.code, /private[ \t]+onOperatorSettingsChanged[ \t]*\(/, 'S1', 'private onOperatorSettingsChanged(')
    problems.push(...onChanged.problems)
    if (onChanged.body !== '') {
      const fireMatch = /fire[A-Za-z]*\s*\([^;]*?settings/i.exec(onChanged.body)
      if (fireMatch === null) {
        problems.push(
          `S1: \`onOperatorSettingsChanged\`'s body never FIRES \`${SETTINGS_PANE}\` (body read: ` +
            `${shown(onChanged.body.replace(/\s+/g, ' ').trim().slice(0, 360))}) — §4 SITE 2: "the handler always COMMITS then FIRES ` +
            `\`settings\`; the rebuild runs only when \`F-4\`'s predicate says an app-graph member moved"`,
        )
      } else {
        const fireIndex = fireMatch.index
        // THE TWO CALLS THE CORRECTED HANDLER OWES, each AFTER the fire, each GUARDED BY ITS OWN PREDICATE (ADJ 2's order:
        // capture → commit → FIRE → `if (settingsMovesOperatorCensus(…)) this.refreshOperator()` →
        // `if (settingsMovesAppGraph(…)) this.editController.requestRebuild('operator')` → `pendingContentChange = null`). The fire
        // therefore precedes BOTH, which is what makes the pane's own paint the FIRE's product and never the re-assembly's.
        problems.push(
          ...guardedCallProblems(
            onChanged.body,
            'refreshOperator',
            fireIndex,
            'S1·operator-re-author',
            `ADJ 2 orders the handler COMMIT → FIRE → \`if (${OPERATOR_CENSUS_PREDICATE}(previous, payload)) ` +
              `this.refreshOperator()\` → \`if (${APP_GRAPH_PREDICATE}(previous, payload)) this.editController.requestRebuild('operator')\`: ` +
              `the operator-census direction IS \`refreshOperator\` (\`mountOperator\`), and it must follow the fire so the pane's paint is ` +
              `never the re-assembly's by-product`,
          ),
        )
        problems.push(
          ...guardedCallProblems(
            onChanged.body,
            'requestRebuild',
            fireIndex,
            'S1·app-graph-rebuild',
            `§4 SITE 2 REPLACES the unconditional rebuild by the field census rather than deleting the rebuild: an app-graph member ` +
              `moved must still re-derive, and it must run ONLY when \`${APP_GRAPH_PREDICATE}\` says so (\`m2\` is the unconditional ` +
              `call restored)`,
          ),
        )
      }
      if (!/requestRebuild/.test(onChanged.body)) {
        // Kept as its own named clause (the guarded-call reading above reports it too): the conditional must exist SOMEWHERE in
        // the handler, and this sentence states why its absence is a finding rather than a spelling preference.
        problems.push(
          `S1: \`onOperatorSettingsChanged\`'s body carries NO \`requestRebuild\` call at all — §4 SITE 2 REPLACES the unconditional ` +
            `rebuild by the field census rather than deleting the rebuild: an app-graph member moved must still re-derive`,
        )
      }
    }

    // ---- (e) BOTH PREDICATES ARE EXPORTED, ONCE-DECLARED, PURE DECLARATIONS ----------------------------------------------------
    // ⟨ADJ 2: a SECOND predicate, and the vocabulary discovery is RETIRED — it could not tell the two apart.⟩
    for (const name of PINNED_PREDICATES) {
      const handler = await pinnedPredicate(name, `S1·${name}`)
      problems.push(...handler.problems)
      problems.push(...predicateDeclarationProblems(name, `S1·${name}`))
    }

    expect(
      problems,
      `S1 — THE LETTER (§6 S1; §4 SITE 1/SITE 2; §3; ADJ 1/ADJ 2). ${problems.length} problem(s). Comments stripped: the census must ` +
        `be the NINE ids; \`firePaneUpdate\`'s body must call \`paneEvents.fire(paneId)\` and carry NO \`host.refresh()\`, NO scope probe ` +
        `and NO \`⟨B-9⟩\` marker; \`paintPane\`'s body must carry NO \`operator-scope\` verdict (while \`${PANE_EVENTS_FILE}\` KEEPS the ` +
        `word); \`onOperatorSettingsChanged\` must FIRE \`${SETTINGS_PANE}\` BEFORE both guarded re-assemblies — ` +
        `\`refreshOperator()\` (the operator census) and \`requestRebuild('operator')\` (the app graph), each guarded by its own ` +
        `\`if (\`; and BOTH census predicates (\`${APP_GRAPH_PREDICATE}\`, \`${OPERATOR_CENSUS_PREDICATE}\`) must be exported, ` +
        `once-declared, pure declarations. envelope-class — declaration parses over \`src/renderer/**\`'s text`,
    ).toEqual([])
  })
})
