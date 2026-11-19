// tests/unit/shell-chrome/pane-gnosis.test.ts — unit `B-8` `pane-gnosis`'s ONE CLAUSE UNIT for this pass: the contract's
// §9 `B6-F15`, the containment clause. Authored BEFORE any byte of the landing (RCA-1: the red set runs first and is REPORTED
// before implementation).
//
// THE CLAUSE, as the contract states it (`docs/L1/unit-b-8-pane-gnosis.md` §9 `B6-F15`, verbatim): "`CHANGE_INTERESTED_PANE_IDS`
// carries no subset clause against `REPLUMBED_PANE_IDS`, so an id added to the change-interest declaration but not to the census
// subscribes NOTHING while `publishChange()` drifts on — exactly the half-wire this unit's block would produce. Landed: ONE
// exported counter `changeInterestSubsetProblems(changeInterest, census): string[]` (pure, total) and `boot`'s
// validate-then-subscribe — the subscription plan is computed FIRST and a non-empty problem list refuses the WHOLE plan with one
// loud error, attaching NO subscription (never a half-subscribed host)."
//
// SOURCE OF EVERY ASSERTION (all paths relative to the repo root):
//   §9 `B6-F15`  the ONE exported PURE, TOTAL counter + `boot`'s validate-then-subscribe (rows `C1`, `C2`).
//   §4           the census value and the change-interest value at this head — the two declarations rows `C3`/`C4` parse
//                ("`REPLUMBED_PANE_IDS` is `['gnosis-query','crosslinks','doc-nav','search','template-editor']`"; "`doc-nav` is the
//                first and only change-interested pane at this head"); §4 also names the half-landed state the clause exists to
//                make impossible: "`CHANGE_INTERESTED_PANE_IDS` becomes `['doc-nav','gnosis-documents','gnosis-wikis']` — which is
//                exactly the state `B6-F15`'s containment clause exists to make impossible to half-land".
//   §6 `X1`      "the row that reds a landing which enters the operator pane into the census without its paint" — `C3` pins the
//                census UNMOVED (three gnosis ids absent, `gnosis-status` with its reason).
//   §6 `S1`      the letter row's source-clause discipline (comments stripped, declarations parsed, never a token search).
//   §10          THE STOP: the three grant lines this tree is still waiting on — `C3` pins each site of them BY NAME (`F-1`'s CRUD
//                `onChanged: () => { … host.refresh() }`, `F-5`'s `${B-9}` operator fallback in `firePaneUpdate`, `F-7`'s
//                `installSidebarBridge` methods object with no `gnosisDocuments`/`gnosisWikis`), so the day one half-lands without
//                the others the pin reds instead of the tree drifting.
//
// DECLARATIONS ARE PARSED, NEVER SEARCHED (`D-38`: `src.indexOf('VALID_GROUPS')` latched onto a COMMENT once). Every clause below
// strips comments FIRST (the stripper is length-preserving, and each row CHECKS that: a raw/commented offset would let prose
// satisfy a clause), then locates a DECLARATION by its declaration shape and brace-matches its body. One marker is deliberately
// read from the RAW text — the `${B-9}` unit marker lives in a comment, and that comment IS the record the contract asks for — and
// it is read in a three-line window anchored on the branch's own code line, never as a file-wide token search.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): ENVELOPE-CLASS. `C1`'s declaration clause, `C2`'s plan clause and `C3`/`C4`'s declaration
// clauses read `src/**`'s TEXT (comments stripped) and nothing else; `C1`'s behaviour arms, `C2`'s census arms and `C3`'s parse
// cross-check drive the REAL exported values and the REAL `SidebarPanes` host over the LAYOUT-LESS `dom-shim` against a recording
// runtime double. What this file can NEVER read, named so nobody quotes it: that a fire PAINTS a pane, that a pane re-reads once,
// that the counters are 0/0/0, or that the assembled Electron window repaints — those are §6's `Q*`/`X2`/`X3` rows (this file's
// clause unit is `B6-F15` alone) and §8's assembled-app limb (`G8`).
//
// REACHABILITY RULE (this file always COLLECTS and RUNS): every subject is reached through `readFileSync`/`await import()`
// inside a `try`, and a missing subject is a NAMED problem inside the row's ONE aggregate `expect(problems, …)` — never an ENOENT
// crash, never an ESM link error, never a `skip`/`only`/`todo`, never a raw `TypeError`.
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO: it writes nothing; it reads only the repo it lives in; no network, no electron, no
// spawn, no `git`, no `vi.mock`, no `console.log` (reporting is the aggregate message alone, `B5-DOC-PRINT`).
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
const RENDERER_FILE = 'src/renderer/renderer.ts'

/** §9: the ONE name this pass lands. */
const COUNTER_NAME = 'changeInterestSubsetProblems'
/** §4: the PAINT census at this head — the pin's recorded value, kept whole (five ids, order-insensitive comparison). */
const PINNED_CENSUS: readonly string[] = ['gnosis-query', 'crosslinks', 'doc-nav', 'search', 'template-editor']
/** §4: the CHANGE-INTEREST declaration at this head ("`doc-nav` is the first and only change-interested pane at this head"). */
const PINNED_CHANGE_INTEREST: readonly string[] = ['doc-nav']
/** §4/`F-5`: the three gnosis ids the census must NOT carry at this head — `gnosis-query` is `B-3`'s landed id, `gnosis-documents`
 *  and `gnosis-wikis` are `F-1`'s blocked pair, and `gnosis-status` is `F-5`'s operator-scope trap (`X1`). */
const ABSENT_GNOSIS_PANES: readonly string[] = ['gnosis-status', 'gnosis-documents', 'gnosis-wikis']
const CENSUS_NAME = 'REPLUMBED_PANE_IDS'
const CHANGE_INTEREST_NAME = 'CHANGE_INTERESTED_PANE_IDS'
const DOC_NAV = 'doc-nav'
/** The forged ids: a change-interest declaration that names a pane the census does not paint — the half-wire, spelled. */
const FORGED_FIRST = 'gnosis-documents'
const FORGED_SECOND = 'gnosis-wikis'

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

/** The CODE of a source slice: comments replaced by spaces, NEWLINES kept, string/template literals preserved. **The output is
 *  the same LENGTH as the input**, which is what lets a clause strip comments first and still read the RAW text at a shared
 *  offset (the one place this file wants a comment — `${B-9}`'s marker — reads the raw slice, not a prose search). Every row
 *  checks that length invariant rather than assuming it. */
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

/** The index of the `}` matching the `{` at `openIndex`, comment- and string-aware (a template literal's `${…}` interpolation is
 *  skipped as literal text, which is depth-neutral). `-1` when the text is unbalanced. */
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
        `stripped) — this row reads the raw text at the SAME offsets as the stripped text, so a length change would silently ` +
        `shift every slice`,
    )
  }
  return { raw, code, problems }
}

interface BodyRegion {
  /** the braced body, comments stripped; `''` when no body was located */
  body: string
  problems: string[]
}

/** Locate a declaration by `anchor`, then brace-match its body. Anchors are DECLARATION-shaped (never a bare token), and the
 *  text handed in is already comment-stripped, so a mention in prose cannot satisfy any caller. */
function bodyAt(text: string, anchor: RegExp, limb: string, what: string): BodyRegion {
  const match = anchor.exec(text)
  if (match === null) {
    return {
      body: '',
      problems: [`${limb}: no \`${what}\` declaration matches ${String(anchor)} — the clause has no subject`],
    }
  }
  const open = text.indexOf('{', match.index + match[0].length)
  if (open < 0) {
    return { body: '', problems: [`${limb}: the \`${what}\` declaration carries no braced body — the clause has no subject`] }
  }
  const close = matchBrace(text, open)
  if (close < 0) {
    return { body: '', problems: [`${limb}: the \`${what}\` declaration's body is UNBALANCED — the clause has no subject`] }
  }
  return { body: text.slice(open, close + 1), problems: [] }
}

const BOOT_ANCHOR = /async[ \t]+boot[ \t]*\(/
const FIRE_PANE_UPDATE_ANCHOR = /const[ \t]+firePaneUpdate[ \t]*=/
const GNOSIS_CRUD_ANCHOR = /new[ \t]+GnosisCrudPanes[ \t]*\(/
const INSTALL_SIDEBAR_BRIDGE_ANCHOR = /private[ \t]+installSidebarBridge[ \t]*\(/
const SIDEBAR_METHODS_ANCHOR = /const[ \t]+methods[ \t]*=/

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
}

/** Parse `[export] const <name>: … = [ … ]` / `= Object.freeze([ … ])`. The element list must be QUOTED LITERALS only — a computed
 *  initialiser answers `values: null` (a named problem at the call site), never a silently empty list. */
function parseIdListDeclaration(code: string, name: string): IdListDeclaration {
  const declaration = new RegExp(`(?:^|[\\n;{}])[ \\t]*(export[ \\t]+)?const[ \\t]+${name}\\b`, 'g')
  const result: IdListDeclaration = { found: false, exported: false, count: 0, values: null }
  for (let match = declaration.exec(code); match !== null; match = declaration.exec(code)) {
    result.count += 1
    if (result.count > 1) continue
    result.found = true
    result.exported = typeof match[1] === 'string'
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

interface CounterDeclaration {
  found: boolean
  exported: boolean
  count: number
  /** the function body (comments stripped); `''` when it could not be located */
  body: string
  bodyForm: 'braced' | 'expression' | ''
}

/** Parse the counter's DECLARATION — the `export function <name>(` form the contract spells, or the `export const <name> = (…)
 *  =>` form a later landing may choose. Both are "one exported pure function"; the clause grades EXPORT, ONCE, PURITY and
 *  BEHAVIOUR, never the syntax. A mention of the name in a comment is already gone (comments stripped first). */
function parseCounterDeclaration(code: string): CounterDeclaration {
  const declaration = new RegExp(
    `(?:^|[\\n;{}])[ \\t]*(export[ \\t]+)?(?:(?:async[ \\t]+)?function[ \\t]+${COUNTER_NAME}[ \\t]*\\(|const[ \\t]+${COUNTER_NAME}\\b)`,
    'g',
  )
  const result: CounterDeclaration = { found: false, exported: false, count: 0, body: '', bodyForm: '' }
  for (let match = declaration.exec(code); match !== null; match = declaration.exec(code)) {
    result.count += 1
    if (result.count > 1) continue
    result.found = true
    result.exported = typeof match[1] === 'string'
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

// ===========================================================================
// THE `boot` PLAN CLAUSE (`C2`) — validate-then-subscribe, over the stripped body.
// ===========================================================================

/** The attach calls the `boot` loop can make (`B-6` §4: `subscribeChange` for a change-interested id, `subscribe` otherwise; the
 *  RECORD arm is `B-10`'s and is listed so a future boot cannot slip an attach past this clause). */
const ATTACH_CALL = /\b(?:subscribeChange|subscribeRecord|subscribe)\s*\(/g
const COUNTER_CALL = new RegExp(`\\b${COUNTER_NAME}\\s*\\(`, 'g')

const indexesOf = (body: string, pattern: RegExp): number[] => {
  const found: number[] = []
  for (let match = pattern.exec(body); match !== null; match = pattern.exec(body)) found.push(match.index)
  pattern.lastIndex = 0
  return found
}

/** **THE PLAN CLAUSE.** Over the comment-stripped `boot` body: the counter is CONSULTED, the plan is computed BEFORE the first
 *  attach, and between the two there is a guard on the problem list plus a loud error that HALTS — so a non-empty list refuses the
 *  WHOLE plan before any subscription exists. Returns the problem sentences; `[]` when the clause holds.
 *
 *  MUTATIONS THAT RED IT (each drives this helper in `C2`'s proof arms, so a clause that always answers the same thing cannot pass):
 *  the counter consulted but never called from `boot`; the call moved AFTER the first attach; a refusal that only logs (no `throw`
 *  and no `return` — the subscriptions attach anyway, the half-subscribed host §9 refuses); no guard on the problem list. */
function bootPlanProblems(body: string, limb: string): string[] {
  if (body === '') return [`${limb}: the \`boot\` body is unreadable — the validate-then-subscribe clause has no subject`]
  const problems: string[] = []
  const callIndexes = indexesOf(body, COUNTER_CALL)
  const attachIndexes = indexesOf(body, ATTACH_CALL)
  if (callIndexes.length === 0) {
    problems.push(
      `${limb}: \`boot\` NEVER calls \`${COUNTER_NAME}\` — §9 (\`B6-F15\`) lands "ONE exported counter … AND \`boot\`'s ` +
        `validate-then-subscribe: the subscription plan is computed FIRST and a non-empty problem list refuses the WHOLE plan with one ` +
        `loud error, attaching NO subscription". A counter nobody consults is the same half-wire one declaration over, so this arm ` +
        `reds a landing that declares the counter and leaves \`boot\` untouched`,
    )
  }
  if (attachIndexes.length === 0) {
    problems.push(
      `${limb}: \`boot\` carries NO \`subscribe\`/\`subscribeChange\`/\`subscribeRecord\` call at all — the ordering clause has no ` +
        `subject, and a boot that attaches nothing is worse than the pre-landing head (§4: "the \`boot\` loop subscribes one handler ` +
        `per census id")`,
    )
  }
  if (callIndexes.length > 0 && attachIndexes.length > 0) {
    const firstCall = Math.min(...callIndexes)
    const firstAttach = Math.min(...attachIndexes)
    if (firstCall > firstAttach) {
      problems.push(
        `${limb}: \`${COUNTER_NAME}\` is consulted at offset ${firstCall}, AFTER the first attach at ${firstAttach} — §9 requires the ` +
          `plan to be computed FIRST: a refusal that runs after a subscription has attached leaves a HALF-SUBSCRIBED host, the exact ` +
          `state "never a half-subscribed host" refuses`,
      )
      return problems
    }
    const window = body.slice(firstCall, firstAttach)
    const loud = /\bthrow\b/.test(window) || /console\s*\.\s*(?:error|warn)\s*\(/.test(window)
    const halts = /\bthrow\b/.test(window) || /\breturn\b/.test(window)
    const guarded = /if\s*\([^)]*(?:length|problem)/i.test(window)
    if (!guarded) {
      problems.push(
        `${limb}: between the counter call and the first attach there is NO guard on the problem list (expected an \`if\` over its ` +
          `\`length\`/\`problems\`) — §9 refuses the WHOLE plan only "when the problem list is non-empty", so an unguarded call ` +
          `attaches the plan whether or not the pair is a subset`,
      )
    }
    if (!loud) {
      problems.push(
        `${limb}: the window between the counter call and the first attach carries NO loud error (\`throw\` / \`console.error\` / ` +
          `\`console.warn\`) — §9 refuses the plan "with ONE loud error"; a silent refusal is the drifting half-wire \`B6-F15\` names`,
      )
    }
    if (!halts) {
      problems.push(
        `${limb}: the refusal does not HALT (\`throw\` or \`return\`) before the first attach — a \`console.error\` that falls through ` +
          `to the subscription loop attaches every subscription anyway (§9: "attaching NO subscription")`,
      )
    }
  }
  return problems
}

// ===========================================================================
// THE COUNTER'S BEHAVIOUR (`C1`) — TOTAL at every argument, `[]` for a subset.
// ===========================================================================

type AnswerExpectation =
  | { kind: 'exactly-empty' }
  | { kind: 'exactly-one-naming'; id: string }
  | { kind: 'exactly-two-in-input-order'; first: string; second: string }
  | { kind: 'non-empty' }
  | { kind: 'total-only' }

interface DrivenAnswer {
  threw: string
  answer: unknown
}

const drive = (fn: (changeInterest: unknown, census: unknown) => unknown, changeInterest: unknown, census: unknown): DrivenAnswer => {
  try {
    return { threw: '', answer: fn(changeInterest, census) }
  } catch (error) {
    return { threw: String(error), answer: undefined }
  }
}

/** Grade ONE drive of the counter. Every arm is a `problems.push`, so a failure names the pair that produced it. */
function gradeAnswer(limb: string, label: string, driven: DrivenAnswer, expectation: AnswerExpectation): string[] {
  const problems: string[] = []
  if (driven.threw !== '') {
    problems.push(
      `${limb}: \`${COUNTER_NAME}(${label})\` THREW (${driven.threw}) — §9: the counter is TOTAL at every argument ("a non-array / ` +
        `non-string member answers a problem, never a throw")`,
    )
    return problems
  }
  if (expectation.kind === 'total-only') {
    if (!Array.isArray(driven.answer) || driven.answer.some((entry) => typeof entry !== 'string')) {
      problems.push(
        `${limb}: \`${COUNTER_NAME}(${label})\` answered ${shown(driven.answer)}, not a \`string[]\` — §9's return is the problem ` +
          `SENTENCES, a \`string[]\` at every argument`,
      )
    }
    return problems
  }
  const sentences = Array.isArray(driven.answer) ? (driven.answer as unknown[]) : null
  if (sentences === null || sentences.some((entry) => typeof entry !== 'string')) {
    problems.push(
      `${limb}: \`${COUNTER_NAME}(${label})\` answered ${shown(driven.answer)}, not a \`string[]\` — §9's return is the problem ` +
        `SENTENCES, a \`string[]\` at every argument`,
    )
    return problems
  }
  const text = sentences as string[]
  const named = (id: string): boolean => text.some((sentence) => sentence.includes(id))
  if (expectation.kind === 'exactly-empty') {
    if (text.length !== 0) {
      problems.push(
        `${limb}: \`${COUNTER_NAME}(${label})\` answered ${shown(text)}, not \`[]\` — §9: "a subset answers \`[]\`"; a false problem ` +
          `here refuses a lawful landing`,
      )
    }
    return problems
  }
  if (expectation.kind === 'non-empty') {
    if (text.length === 0) {
      problems.push(
        `${limb}: \`${COUNTER_NAME}(${label})\` answered \`[]\` — §9: a non-array argument (or a non-string member) "answers a ` +
          `problem, never a throw"; an empty list silently CERTIFIES a pair the counter could not read`,
      )
    }
    return problems
  }
  if (expectation.kind === 'exactly-one-naming') {
    if (text.length !== 1) {
      problems.push(
        `${limb}: \`${COUNTER_NAME}(${label})\` answered ${text.length} sentence(s) (${shown(text)}) — §9 returns "the problem ` +
          `sentences for every change-interested id ABSENT from the census", so ONE absent id is ONE sentence`,
      )
      return problems
    }
    if (!named(expectation.id)) {
      problems.push(
        `${limb}: \`${COUNTER_NAME}(${label})\` answered ${shown(text)}, which does not NAME the offending id \`${expectation.id}\` — ` +
          `the sentence exists so a half-wire is legible, so the id that is missing from the census must appear in it`,
      )
    }
    return problems
  }
  if (text.length !== 2) {
    problems.push(
      `${limb}: \`${COUNTER_NAME}(${label})\` answered ${text.length} sentence(s) (${shown(text)}) — §9 returns one sentence per ` +
        `absent change-interested id, so TWO absent ids are TWO sentences`,
    )
    return problems
  }
  if (!text[0].includes(expectation.first) || !text[1].includes(expectation.second)) {
    problems.push(
      `${limb}: \`${COUNTER_NAME}(${label})\` answered ${shown(text)}, whose order does not follow the CHANGE-INTEREST INPUT order ` +
        `(\`${expectation.first}\` then \`${expectation.second}\`) — §9: "order = input order"`,
    )
  }
  return problems
}

// ===========================================================================
// THE HOST HARNESS (`C2`'s census arms) — the REAL `SidebarPanes`, booted on a light double over the layout-less shim
// (the `pane-doc-nav` `D4` shape, one realm in).
// ===========================================================================

const NOW = new Date().toISOString()

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

interface ChannelBootDrive {
  channel: ReturnType<typeof createPaneEvents> | null
  problems: string[]
  restore: () => void
}

/** Boot the REAL host with the REAL channel and answer the channel it subscribed into — the ONE reading that shows WHICH
 *  declarations the boot loop actually made (the census it painted for and the change-interest ids it marked). */
async function bootChannelHost(limb: string): Promise<ChannelBootDrive> {
  installShim()
  const globals = globalThis as Record<string, unknown>
  const previousWindow = globals['window']
  globals['window'] = { provident: {} }
  const restore = (): void => {
    globals['window'] = previousWindow
  }
  const problems: string[] = []
  const channel = createPaneEvents()
  try {
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
        stores: async (): Promise<Record<string, unknown>> => ({ stores: [] }),
        query: async (): Promise<Record<string, unknown>> => ({
          query: '',
          ranked: [],
          context: [],
          markdown: '',
          lineMap: { ranges: [] },
          k: 5,
        }),
        journal: async (): Promise<Record<string, unknown>> => ({ entries: [] }),
      },
      template: {
        get: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
        onTemplateChanged: (_handler: (payload: unknown) => void): (() => void) => () => undefined,
      },
      operatorSettings: {
        get: async (): Promise<Record<string, unknown>> => ({
          enabledPanes: [DOC_NAV, 'search', 'crosslinks'],
          enabledOperatorPanes: ['settings'],
          panesInitialized: true,
          defaultDocumentId: null,
          topK: 5,
        }),
        set: async (patch: unknown): Promise<unknown> => patch,
        onChanged: (_handler: (settings: unknown) => void): (() => void) => () => undefined,
      },
    }
    const SidebarPanesCtor = (await import('../../../src/renderer/sidebar-panes.js')).SidebarPanes as new (opts: unknown) => unknown
    const host = new SidebarPanesCtor({
      mount: new ShimElement('div'),
      operatorMount: new ShimElement('div'),
      registry: createPaneRegistry(),
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
  } catch (error) {
    problems.push(
      `${limb}: the harness's \`host.boot(runtime)\` THREW (${String(error)}) — the shipped census's ATTACHMENTS have no booted ` +
        `subject, so the change-interest reading below cannot be made`,
    )
    return { channel: null, problems, restore }
  }
  return { channel, problems, restore }
}

const loadHostModule = async (limb: string): Promise<{ module: Record<string, unknown> | null; problems: string[] }> => {
  try {
    return { module: (await import('../../../src/renderer/sidebar-panes.js')) as Record<string, unknown>, problems: [] }
  } catch (error) {
    return {
      module: null,
      problems: [
        `${limb}: \`${SIDEBAR_FILE}\` does not resolve as a module (${String(error)}) — the shipped census's VALUE and the counter ` +
          `have no runtime subject`,
      ],
    }
  }
}

beforeAll(() => {
  installShim()
})

// ===========================================================================
// `C1` — THE COUNTER EXISTS AND IS TOTAL (§9 `B6-F15`).
// ===========================================================================
describe('pane-gnosis — C1: `changeInterestSubsetProblems` is ONE exported, PURE, TOTAL counter and it does not exist at this head', () => {
  it('C1 — the DECLARATION parses out of `sidebar-panes.ts` (exported, once, pure of `this.`/`await`/`console`), answers `[]` for the shipped pair, names the offending id for a forged pair IN INPUT ORDER, and is total at every degenerate argument', async () => {
    // §9 `B6-F15`. LAYER: envelope-class — a DECLARATION parse over `src/renderer/sidebar-panes.ts`'s text (comments stripped) plus
    // the REAL exported function driven at runtime. RED NOW: the declaration does not exist at this head.
    // NON-VACUITY: the `[]` arm is floored by the forged arms (the same function answers a NON-empty list when the pair is a
    // half-wire), the ordering arm is floored by the two-id drive, and the totality arms include pairs whose answer MUST be a
    // problem — so "returns []" for the shipped pair cannot pass by returning `[]` for everything. The shipped census VALUE is read
    // off the module, not typed into the test, so this row moves with the census and cannot pin a stale five-id list.
    // MUTATION THAT WOULD RED IT: declaring the counter without `export` (the export arm); declaring it twice (the once arm); a body
    // carrying `this.` / `await` / `console.` (the purity arm — a pure counter is what makes `boot` able to refuse before it awaits);
    // returning `[]` unconditionally (the forged arms and the empty-census arm); forgetting the ordering (the two-id arm); throwing
    // on `null`/`undefined`/a non-array (the totality arms — §9: "answers a problem, never a throw").
    const problems: string[] = []
    const source = readSource(SIDEBAR_FILE, 'C1')
    problems.push(...source.problems)

    // ---- (1) THE DECLARATION, PARSED --------------------------------------------------------------------------------------
    const declaration = parseCounterDeclaration(source.code)
    if (!declaration.found) {
      problems.push(
        `C1: \`${SIDEBAR_FILE}\` carries NO DECLARATION of \`${COUNTER_NAME}\` (declaration-shaped anchors only: ` +
          `\`export function ${COUNTER_NAME}(\` or \`export const ${COUNTER_NAME} = (\`) — §9 (\`B6-F15\`): "ONE exported counter ` +
          `\`changeInterestSubsetProblems(changeInterest, census): string[]\` (pure, total)". This is the RED this pass is FOR: the ` +
          `containment clause is not landed`,
      )
    } else {
      if (!declaration.exported) {
        problems.push(
          `C1: \`${COUNTER_NAME}\` is DECLARED but NOT EXPORTED — §9 lands it as "ONE exported counter", because the pure counter is ` +
            `the ONLY seam a row can drive with a forged pair (\`${CHANGE_INTEREST_NAME}\` is module-private)`,
        )
      }
      if (declaration.count > 1) {
        problems.push(
          `C1: \`${COUNTER_NAME}\` is DECLARED ${declaration.count} times — §9 lands ONE counter; a second spelling is a second ` +
            `authority for the same verdict and the arms could drift`,
        )
      }
      if (declaration.body === '') {
        problems.push(
          `C1: the \`${COUNTER_NAME}\` declaration's BODY could not be located (form: ${declaration.bodyForm === '' ? '(none)' : declaration.bodyForm}) — ` +
            `the purity clause has no subject (a body brace-match that fails must never be read as "pure")`,
        )
      } else {
        const impurities: string[] = []
        if (/\bthis\s*\./.test(declaration.body)) impurities.push('`this.` (it must not depend on host state)')
        if (/\bawait\b/.test(declaration.body)) impurities.push('`await` (it must be synchronous, so `boot` can refuse before it awaits)')
        if (/\bconsole\s*\./.test(declaration.body)) impurities.push('`console.` (a pure predicate has no route to log)')
        if (impurities.length > 0) {
          problems.push(
            `C1: the \`${COUNTER_NAME}\` body is NOT PURE — it reaches ${impurities.join(', ')}. §9 lands a PURE counter: \`boot\`'s ` +
              `refusal must be decidable from the two arguments alone (body read: ${declaration.body.replace(/\s+/g, ' ').trim().slice(0, 240)})`,
          )
        }
      }
    }

    // ---- (2) THE BEHAVIOUR, DRIVEN ---------------------------------------------------------------------------------------
    const loaded = await loadHostModule('C1')
    problems.push(...loaded.problems)
    const counter = loaded.module === null ? undefined : loaded.module[COUNTER_NAME]
    const shippedCensus = loaded.module === null ? undefined : loaded.module[CENSUS_NAME]
    if (loaded.module !== null && typeof counter !== 'function') {
      problems.push(
        `C1: \`${COUNTER_NAME}\` does not resolve as a FUNCTION on \`${SIDEBAR_FILE}\` (typeof read: ${typeof counter}) — the ` +
          `behaviour arms below have no subject, so a declaration parse alone cannot carry this row`,
      )
    }
    const censusIsReadable = Array.isArray(shippedCensus) && shippedCensus.every((id) => typeof id === 'string')
    if (loaded.module !== null && !censusIsReadable) {
      problems.push(
        `C1: \`${CENSUS_NAME}\` reads ${shown(shippedCensus)}, not an array of pane ids — the SHIPPED CENSUS VALUE is the lawful ` +
          `pair's second argument, so without it the \`[]\` arm has no subject (C3 pins the same value)`,
      )
    }
    if (typeof counter === 'function' && censusIsReadable) {
      const fn = counter as (changeInterest: unknown, census: unknown) => unknown
      const census = shippedCensus as string[]
      // (2a) THE SHIPPED PAIR IS A SUBSET: `['doc-nav']` against the census VALUE → `[]`.
      problems.push(
        ...gradeAnswer('C1', `['${DOC_NAV}'], the shipped census VALUE ${shown(census)}`, drive(fn, [DOC_NAV], census), {
          kind: 'exactly-empty',
        }),
      )
      // (2b) THE FORGED PAIR — one id the census does not paint: a problem NAMING it. The shipped census carries neither
      // `gnosis-documents` nor `gnosis-wikis` (§4: they enter only with `F-1`'s grant), so the forged pair is one edit away from the
      // half-landed state §4 names verbatim: "`CHANGE_INTERESTED_PANE_IDS` becomes `['doc-nav','gnosis-documents','gnosis-wikis']`".
      problems.push(
        ...gradeAnswer('C1', `['${DOC_NAV}','${FORGED_FIRST}'], the shipped census VALUE`, drive(fn, [DOC_NAV, FORGED_FIRST], census), {
          kind: 'exactly-one-naming',
          id: FORGED_FIRST,
        }),
      )
      problems.push(
        ...gradeAnswer('C1', `['${FORGED_FIRST}','${FORGED_SECOND}'], the shipped census VALUE`, drive(fn, [FORGED_FIRST, FORGED_SECOND], census), {
          kind: 'exactly-two-in-input-order',
          first: FORGED_FIRST,
          second: FORGED_SECOND,
        }),
      )
      // (2c) THE FORGED CENSUS — a census WITHOUT `gnosis-documents`, so the arm does not lean on the shipped value at all.
      problems.push(
        ...gradeAnswer('C1', `['${DOC_NAV}','${FORGED_FIRST}'] against the forged census ['${DOC_NAV}','search']`, drive(fn, [DOC_NAV, FORGED_FIRST], [DOC_NAV, 'search']), {
          kind: 'exactly-one-naming',
          id: FORGED_FIRST,
        }),
      )
      problems.push(
        ...gradeAnswer('C1', `['${DOC_NAV}'] against the forged census ['${DOC_NAV}','search','template-editor'] (a genuine subset)`, drive(fn, [DOC_NAV], [DOC_NAV, 'search', 'template-editor']), {
          kind: 'exactly-empty',
        }),
      )
      // (2d) THE EMPTY CENSUS — nothing is painted, so `doc-nav` is absent from it and the sentence must name it.
      problems.push(
        ...gradeAnswer('C1', `['${DOC_NAV}'] against an EMPTY census`, drive(fn, [DOC_NAV], []), { kind: 'exactly-one-naming', id: DOC_NAV }),
      )
      // (2e) THE DEGENERATE PAIRS — §9: "total at every argument (a non-array / non-string member answers a problem, never a
      // throw)". A NON-ARRAY ARGUMENT must answer a problem on EITHER side: with a change-interest that cannot be enumerated (or a
      // census that cannot be searched) the counter cannot certify a subset, and an empty list would certify one it never read.
      for (const [label, changeInterest, censusArgument] of [
        ['null', null, census],
        ['undefined', undefined, census],
        ['a bare string', 'doc-nav', census],
        ['a number', 42, census],
        ['an object', {}, census],
        [`['${DOC_NAV}'], null (an unreadable CENSUS)`, [DOC_NAV], null],
        [`['${DOC_NAV}'], undefined (an unreadable CENSUS)`, [DOC_NAV], undefined],
        [`['${DOC_NAV}'], 'gnosis-query' (a non-array CENSUS)`, [DOC_NAV], 'gnosis-query'],
        [`[] , null (a non-array argument answers a problem even with NO ids to check)`, [], null],
        [`['${DOC_NAV}', 42] (a NON-STRING member of the change-interest list)`, [DOC_NAV, 42], census],
        [`[null] (a NON-STRING member of the change-interest list)`, [null], census],
      ] as Array<[string, unknown, unknown]>) {
        problems.push(...gradeAnswer('C1', label, drive(fn, changeInterest, censusArgument), { kind: 'non-empty' }))
      }
      // `[]` against `[]` IS a subset: a counter that answers a problem for the empty pair refuses a lawful landing.
      problems.push(...gradeAnswer('C1', '[] against [] (a degenerate but lawful subset)', drive(fn, [], []), { kind: 'exactly-empty' }))
      // THE CENSUS SIDE'S NON-STRING MEMBER: graded for TOTALITY ONLY, and the limit is recorded rather than hidden. The contract's
      // sentence ("a non-string member answers a problem") is graded above on the side where it is unambiguous — a non-string id in
      // the CHANGE-INTEREST list can never be certified present — while on the census side either answer is total: the valid id IS
      // in the list, so `[]` is a lawful answer, and so is a sentence naming the unreadable member. What must NOT happen is a throw.
      problems.push(
        ...gradeAnswer('C1', `['${DOC_NAV}'] against ['${DOC_NAV}', 42] (a non-string member of the CENSUS)`, drive(fn, [DOC_NAV], [DOC_NAV, 42]), {
          kind: 'total-only',
        }),
      )
    }

    expect(
      problems,
      `C1 — the containment counter exists and is total (§9 \`B6-F15\`; §4's half-landed pair). ${problems.length} problem(s). ` +
        `\`${COUNTER_NAME}(changeInterest, census): string[]\` must be declared ONCE in \`${SIDEBAR_FILE}\`, EXPORTED, PURE of ` +
        `\`this.\`/\`await\`/\`console\`, and TOTAL: \`[]\` for \`['${DOC_NAV}']\` against the shipped census VALUE, ONE sentence ` +
        `naming each absent change-interested id IN INPUT ORDER, and a problem (never a throw) for every degenerate argument. The ` +
        `red set runs BEFORE any byte of the landing (RCA-1). envelope-class — a declaration parse plus the real exported function`,
    ).toEqual([])
  })
})

// ===========================================================================
// `C2` — `boot` CONSULTS IT: validate-then-subscribe (§9 `B6-F15`).
// ===========================================================================
describe('pane-gnosis — C2: `boot` computes the plan FIRST and refuses the WHOLE plan before the first attach (validate-then-subscribe)', () => {
  it('C2 — the `boot` body (comments stripped) consults the counter before any `subscribe`/`subscribeChange`, guards on the problem list, and halts with a loud error; the clause is proved falsifiable on three mutants AND satisfiable on a compliant fixture; the booted host attaches exactly ONE subscription per census id and `changePanes()` is exactly the census-authorised change-interest ids', async () => {
    // §9 `B6-F15`'s second half. LAYER: envelope-class — a SOURCE clause over `boot`'s body (comments stripped) plus the REAL host
    // booted over the layout-less shim with the REAL channel. RED NOW: the counter does not exist and `boot` never consults it.
    // NON-VACUITY: the clause is driven BOTH WAYS in this row — a compliant fixture must answer `[]` (so the clause is not a
    // always-red sentence no landing can satisfy) and three mutants must each answer a problem (so it is not always-green). The
    // behavioural arms are floored by the census arms: an attach per census id is read, `changePanes()` is compared against the
    // census-authorised subset, and the forged pair is driven through the exported counter because the boot census is
    // module-private — the pure counter IS the injection seam, and it is the only one.
    // MUTATION THAT WOULD RED IT: a counter declared but never consulted by `boot`; the consultation moved AFTER the first attach;
    // a refusal that only logs (the subscriptions attach anyway — the half-subscribed host §9 refuses); no guard on the problem
    // list; a landing that registers a change-interested id with a plain `subscribe` (so `publishChange()` can never reach it — reds
    // the `changePanes()` arm); a second registration per id (reds `handlers:1`).
    const problems: string[] = []
    const source = readSource(SIDEBAR_FILE, 'C2')
    problems.push(...source.problems)

    // ---- (1) THE SOURCE CLAUSE: the plan, first ----------------------------------------------------------------------------
    const boot = bodyAt(source.code, BOOT_ANCHOR, 'C2', 'async boot(')
    problems.push(...boot.problems)
    if (boot.body !== '') {
      problems.push(...bootPlanProblems(boot.body, 'C2'))
      // THE SATISFIABILITY ARM: a COMPLIANT plan answers `[]`. Without this arm a clause that reds every landing — including the
      // lawful one — would read as "the landing is missing", which is the `D-43` failure mode (a row that cannot be satisfied is
      // evidence against the row, so the row proves its own satisfiability here).
      const compliant = [
        'const plan = ' + COUNTER_NAME + '(' + CHANGE_INTEREST_NAME + ', ' + CENSUS_NAME + ')',
        "if (plan.length > 0) throw new Error('[sidebar-panes] boot refused: ' + plan.join('; '))",
        'if (this.events != null) {',
        '  for (const paneId of ' + CENSUS_NAME + ') {',
        '    this.unsubPaneUpdates.push(this.events.subscribe(paneId, handler))',
        '  }',
        '}',
      ].join('\n')
      const compliantProblems = bootPlanProblems(stripComments(compliant), 'C2·proof(compliant)')
      if (compliantProblems.length > 0) {
        problems.push(
          `C2·proof(compliant): the clause REJECTED a compliant validate-then-subscribe body (${shown(compliantProblems)}) — the ` +
            `clause is unsatisfiable as written and every red above it proves nothing; §9's landing shape is ` +
            `"plan FIRST, refuse the WHOLE plan with ONE loud error, attach NOTHING"`,
        )
      }
      // THE FALSIFIABILITY ARMS: three mutants, one per refusal the clause names.
      const mutants: Array<{ label: string; body: string; wantHint: string }> = [
        {
          label: 'the plan computed AFTER the first attach',
          wantHint: 'order',
          body: [
            'if (this.events != null) {',
            '  for (const paneId of ' + CENSUS_NAME + ') {',
            '    this.unsubPaneUpdates.push(this.events.subscribe(paneId, handler))',
            '  }',
            '}',
            'const plan = ' + COUNTER_NAME + '(' + CHANGE_INTEREST_NAME + ', ' + CENSUS_NAME + ')',
            "if (plan.length > 0) throw new Error('[sidebar-panes] boot refused: ' + plan.join('; '))",
          ].join('\n'),
        },
        {
          label: 'the counter consulted but NEVER guarded NOR refused',
          wantHint: 'guard/refusal',
          body: [
            'const plan = ' + COUNTER_NAME + '(' + CHANGE_INTEREST_NAME + ', ' + CENSUS_NAME + ')',
            'if (this.events != null) {',
            '  for (const paneId of ' + CENSUS_NAME + ') {',
            '    this.unsubPaneUpdates.push(this.events.subscribe(paneId, handler))',
            '  }',
            '}',
          ].join('\n'),
        },
        {
          label: 'a refusal that only LOGS and falls through to the attaches',
          wantHint: 'halt',
          body: [
            'const plan = ' + COUNTER_NAME + '(' + CHANGE_INTEREST_NAME + ', ' + CENSUS_NAME + ')',
            "if (plan.length > 0) console.error('[sidebar-panes] boot: ' + plan.join('; '))",
            'if (this.events != null) {',
            '  for (const paneId of ' + CENSUS_NAME + ') {',
            '    this.unsubPaneUpdates.push(this.events.subscribe(paneId, handler))',
            '  }',
            '}',
          ].join('\n'),
        },
      ]
      for (const mutant of mutants) {
        if (bootPlanProblems(stripComments(mutant.body), 'C2·proof').length === 0) {
          problems.push(
            `C2·proof: the clause ACCEPTED the mutant "${mutant.label}" — with that body a problematic pair attaches the WHOLE plan ` +
              `anyway (${mutant.wantHint} arm), which is the half-subscribed host §9 refuses. A clause that passes this mutant ` +
              `cannot red the defect it exists for`,
          )
        }
      }
    }

    // ---- (2) THE BEHAVIOURAL ARM: the census the boot attaches, and who hears `publishChange()` ---------------------------
    const loaded = await loadHostModule('C2')
    problems.push(...loaded.problems)
    const counter = loaded.module === null ? undefined : loaded.module[COUNTER_NAME]
    const shippedCensus = loaded.module === null ? undefined : loaded.module[CENSUS_NAME]
    const censusIsReadable = Array.isArray(shippedCensus) && shippedCensus.every((id) => typeof id === 'string')
    if (loaded.module !== null && !censusIsReadable) {
      problems.push(`C2: \`${CENSUS_NAME}\` reads ${shown(shippedCensus)}, not an array of pane ids — the boot census's VALUE has no subject`)
    }
    // THE CHANGE-INTEREST DECLARATION IS MODULE-PRIVATE, so it is PARSED (never imported): the only runtime window on it is
    // `changePanes()` on a host that has actually booted.
    const changeDeclaration = parseIdListDeclaration(source.code, CHANGE_INTEREST_NAME)
    const declaredChangeInterest = changeDeclaration.values
    if (!changeDeclaration.found) {
      problems.push(
        `C2: \`${CHANGE_INTEREST_NAME}\` does not PARSE out of \`${SIDEBAR_FILE}\` — the boot loop's declaration choice has no ` +
          `subject, so \`changePanes()\` could not be compared with anything`,
      )
    } else if (declaredChangeInterest === null) {
      problems.push(
        `C2: \`${CHANGE_INTEREST_NAME}\` is declared but does NOT parse to a literal id list — a computed initialiser hides which ` +
          `panes declare change interest from every row (the declaration this pass must guard)`,
      )
    }

    const driveResult = await bootChannelHost('C2')
    try {
      problems.push(...driveResult.problems)
      if (driveResult.channel !== null && censusIsReadable && declaredChangeInterest !== null) {
        const channel = driveResult.channel
        const census = shippedCensus as string[]
        // (2a) ONE SUBSCRIPTION PER CENSUS ID — the boot loop's whole product. `panes()` is the registry's handler-map key set, so
        // set equality against the census is exactly "the boot attached the census and nothing else".
        const livePanes = channel.panes()
        const wanted = [...new Set(census)].sort()
        const actual = [...new Set(livePanes)].sort()
        if (fingerprint(actual) !== fingerprint(wanted)) {
          problems.push(
            `C2: after boot, \`paneEvents.panes()\` reads ${shown(livePanes)}, whose SET is ${shown(actual)}, not the census ` +
              `${shown(wanted)} — §4: "the \`boot\` loop subscribes one handler per census id", so the boot's attachments ARE the census`,
          )
        }
        if (livePanes.length !== census.length) {
          problems.push(
            `C2: after boot, \`paneEvents.panes()\` holds ${livePanes.length} id(s) for a ${census.length}-id census — ONE ` +
              `registration per id (\`B2-ADV-04\`), never a second subscriber stacked by a re-boot or a duplicated loop`,
          )
        }
        for (const paneId of census) {
          const report = channel.fire(paneId)
          if (report.fired !== true || report.handlers !== 1) {
            problems.push(
              `C2: \`fire('${paneId}')\` after boot answered ${shown(report)}, not \`fired:true, handlers:1\` — every census id is ` +
                `subscribed exactly once by the boot loop`,
            )
          }
        }
        // (2b) `changePanes()` IS EXACTLY THE census-authorised change-interest ids. The census is the paint census (read off the
        // module); the declaration is the change-interest one (parsed). Their INTERSECTION is what a booted host can lawfully hear
        // on `publishChange()` — and at this head the declaration is the subset §4 records, so the intersection is the declaration.
        const authorised = census.filter((paneId) => declaredChangeInterest.includes(paneId))
        const liveChange = channel.changePanes()
        if (fingerprint(liveChange) !== fingerprint(authorised)) {
          problems.push(
            `C2: after boot, \`paneEvents.changePanes()\` reads ${shown(liveChange)}, not ${shown(authorised)} (the change-interest ` +
              `declaration ${shown(declaredChangeInterest)} INTERSECTED with the census ${shown(census)}) — §4: "A change-interested ` +
              `id (\`${CHANGE_INTEREST_NAME}\`) is registered with \`subscribeChange\` … every other census id with plain ` +
              `\`subscribe\`. NEVER both", and an id declared change-interested but ABSENT from the census subscribes nothing while ` +
              `\`publishChange()\` drifts on — the half-wire this row exists for`,
          )
        }
        if (authorised.length === 0) {
          problems.push(
            `C2: the change-interest declaration parsed as ${shown(declaredChangeInterest)} and NONE of its ids is in the census, ` +
              `so the \`changePanes()\` comparison above is VACUOUS (\`[] === []\`) — at this head §4 records \`['${DOC_NAV}']\`, ` +
              `which IS in the census`,
          )
        }
        // (2c) THE FORGED PAIR, THROUGH THE ONLY SEAM THERE IS. `boot`'s census is module-private (a `const` in the module body, not
        // exported), so no row can hand `boot` a forged pair: the PURE COUNTER is the injection seam §9 lands for exactly this, and
        // driving it here shows the booted census's own declaration would be REFUSED if a later landing added an unpainted id.
        if (typeof counter !== 'function') {
          problems.push(
            `C2: the forged-pair arm has NO SUBJECT — \`${COUNTER_NAME}\` is not an exported function, and it is the only seam a ` +
              `forged pair can reach (§9 lands it pure precisely so the boot plan can be validated before anything attaches)`,
          )
        } else {
          const fn = counter as (changeInterest: unknown, census: unknown) => unknown
          problems.push(
            ...gradeAnswer(
              'C2',
              `the census PLUS '${FORGED_FIRST}' (a forged change-interest) against the census`,
              drive(fn, [...census, FORGED_FIRST], census),
              { kind: 'exactly-one-naming', id: FORGED_FIRST },
            ),
          )
        }
      }
    } finally {
      driveResult.restore()
    }

    expect(
      problems,
      `C2 — \`boot\` validates the plan BEFORE it subscribes (§9 \`B6-F15\`). ${problems.length} problem(s). Inside ` +
        `\`${SIDEBAR_FILE}\`'s \`boot\` (comments stripped): the subscription plan must be computed by ` +
        `\`${COUNTER_NAME}(…)\` FIRST, and a non-empty problem list must be refused with ONE loud error that HALTS before the first ` +
        `\`subscribe\`/\`subscribeChange\` — "never a half-subscribed host". On the booted REAL host: \`panes()\` is the census and ` +
        `\`changePanes()\` is exactly the census-authorised change-interest ids. The clause is proved both ways in this row (a ` +
        `compliant fixture answers \`[]\`, three mutants each answer a problem). envelope-class`,
    ).toEqual([])
  })
})

// ===========================================================================
// `C3` — THE CENSUS IS UNMOVED: THE STOP'S EVIDENCE PIN (GREEN ON ARRIVAL).
// ===========================================================================
describe('pane-gnosis — C3 PIN (GREEN on arrival): the census does not move in this pass and the STOP’s three grant sites still stand', () => {
  it('C3 — PIN: `REPLUMBED_PANE_IDS` parses to exactly `{gnosis-query, crosslinks, doc-nav, search, template-editor}` (and the runtime value agrees), none of `gnosis-status`/`gnosis-documents`/`gnosis-wikis` is in it, `CHANGE_INTERESTED_PANE_IDS` is exactly `[doc-nav]`, and the three §1/§10 sites are present and NAMED (`F-1`, `F-5`, `F-7`)', async () => {
    // ⇒ GREEN ON ARRIVAL — THIS IS A PIN, NOT A RED. It must stay green through the `B6-F15` landing (that landing moves NO census
    // id) and it must RED the day someone HALF-LANDS: an id added to the census without the grant line that can move it, or a grant
    // site deleted/re-wired without the census following. Each arm names the contract finding it pins.
    // LAYER: envelope-class — DECLARATION parses over `src/renderer/**`'s text (comments stripped), one of them cross-checked
    // against the module's runtime value; and ONE marker read from the RAW text (`⟨B-9⟩` lives in a comment and that comment IS the
    // record).
    const problems: string[] = []

    // ---- (1) THE PAINT CENSUS — exactly five ids, and three gnosis ids absent (`X1`, §4) -----------------------------------
    const source = readSource(SIDEBAR_FILE, 'C3')
    problems.push(...source.problems)
    const censusDeclaration = parseIdListDeclaration(source.code, CENSUS_NAME)
    const censusValues = censusDeclaration.values
    if (!censusDeclaration.found) {
      problems.push(
        `C3: \`${CENSUS_NAME}\` does not PARSE out of \`${SIDEBAR_FILE}\` — §4 pins it as the ONE declared census, so its absence is ` +
          `a finding, never a vacuous pass`,
      )
    } else if (censusValues === null) {
      problems.push(
        `C3: \`${CENSUS_NAME}\` is declared but does NOT parse to a literal id list — §4's recorded value cannot be read, and a row ` +
          `that passes over an unparsed declaration is the \`B6-F12\` defect`,
      )
    } else {
      const asSet = [...new Set(censusValues)].sort()
      const wantedSet = [...new Set(PINNED_CENSUS)].sort()
      if (fingerprint(asSet) !== fingerprint(wantedSet)) {
        problems.push(
          `C3: \`${CENSUS_NAME}\` parses to ${shown(censusValues)}, whose SET is ${shown(asSet)}, not ${shown(wantedSet)} — §4 pins ` +
            `the census at this head to the five-id SET, and the census does NOT move in this pass (\`F-1\`: the fire for ` +
            `\`gnosis-documents\`/\`gnosis-wikis\` is \`renderer.ts\`'s line, which the delegation's write scope excludes). A move ` +
            `without the grant is the half-wire \`D-42\` refuses`,
        )
      }
      if (censusValues.length !== asSet.length) {
        problems.push(
          `C3: \`${CENSUS_NAME}\` repeats an id (${shown(censusValues)}) — ONE id, ONE subscriber (\`B2-ADV-04\`)`,
        )
      }
      for (const paneId of ABSENT_GNOSIS_PANES) {
        if (censusValues.includes(paneId)) {
          problems.push(
            `C3: \`${CENSUS_NAME}\` names \`${paneId}\` — §6 \`X1\`: the census does NOT move for the gnosis family in this pass. ` +
              `\`gnosis-documents\`/\`gnosis-wikis\` are \`F-1\`'s blocked pair (their fire is \`renderer.ts\`'s \`onChanged\`, outside ` +
              `this grant) and \`gnosis-status\` is \`F-5\`'s trap: \`paintPane\` answers \`operator-scope\` for it, so entering it makes ` +
              `\`fire\` answer \`fired:true\` while nothing paints — and \`renderer.ts\`'s \`⟨B-9⟩\` fallback is then skipped precisely ` +
              `because \`fired\` is true, which is a SILENTLY DEAD OPERATOR PANE`,
          )
        }
      }
      if (!censusDeclaration.exported) {
        problems.push(
          `C3: \`${CENSUS_NAME}\` is no longer EXPORTED — the booted-host rows (\`C2\`) and the sibling pins read it as the shipped ` +
            `VALUE, so its export is part of the same recorded value`,
        )
      }
      // THE PARSE IS FLOORED BY THE RUNTIME VALUE: a parse that silently read the wrong bytes would still have to agree with what
      // the module actually exports.
      const loaded = await loadHostModule('C3')
      problems.push(...loaded.problems)
      const runtimeCensus = loaded.module === null ? undefined : loaded.module[CENSUS_NAME]
      if (loaded.module !== null) {
        if (!Array.isArray(runtimeCensus)) {
          problems.push(`C3: \`${CENSUS_NAME}\` does not resolve as an array on the module (read ${shown(runtimeCensus)})`)
        } else if (fingerprint([...(runtimeCensus as string[])].sort()) !== fingerprint(asSet)) {
          problems.push(
            `C3: the PARSED census ${shown(asSet)} and the RUNTIME value ${shown(runtimeCensus)} disagree — the parse is not reading ` +
              `the declaration it claims to read, so every arm above would be measuring the wrong bytes`,
          )
        }
      }
    }

    // ---- (2) THE CHANGE-INTEREST DECLARATION — exactly `['doc-nav']` (§4, §9) ----------------------------------------------
    const changeDeclaration = parseIdListDeclaration(source.code, CHANGE_INTEREST_NAME)
    const changeValues = changeDeclaration.values
    if (!changeDeclaration.found) {
      problems.push(
        `C3: \`${CHANGE_INTEREST_NAME}\` does not PARSE out of \`${SIDEBAR_FILE}\` — §4: "\`doc-nav\` is the first and only ` +
          `change-interested pane at this head"; a missing declaration is a finding, never a vacuous pass`,
      )
    } else if (changeValues === null) {
      problems.push(
        `C3: \`${CHANGE_INTEREST_NAME}\` is declared but does NOT parse to a literal id list — the module-private declaration is ` +
          `the only place the change census can be read, so a computed initialiser hides it from every row`,
      )
    } else {
      const asSet = [...new Set(changeValues)].sort()
      const wantedSet = [...new Set(PINNED_CHANGE_INTEREST)].sort()
      if (fingerprint(asSet) !== fingerprint(wantedSet)) {
        problems.push(
          `C3: \`${CHANGE_INTEREST_NAME}\` parses to ${shown(changeValues)}, not exactly ${shown(PINNED_CHANGE_INTEREST)} — §4 ` +
            `records the change-interest declaration at this head as ONE id. §4 names the state a B-8 grant WOULD produce ` +
            `("[\`doc-nav\`,\`gnosis-documents\`,\`gnosis-wikis\`] — which is exactly the state \`B6-F15\`'s containment clause ` +
            `exists to make impossible to half-land"): a move here without the census is the half-wire ` +
            `\`changeInterestSubsetProblems\` exists to refuse, and a move here BEFORE that counter is consulted by \`boot\` is the ` +
            `same drift one declaration over`,
        )
      }
      if (changeDeclaration.exported) {
        problems.push(
          `C3: \`${CHANGE_INTEREST_NAME}\` is now EXPORTED — §4/§9 keep it module-private and land the PURE COUNTER as the seam ` +
            `(the census in \`boot\` is not a public surface); an export here is a second authority for the same declaration`,
        )
      }
    }

    // ---- (3) `F-1`'s SITE: the CRUD host's `onChanged: () => { … host.refresh() }` in `renderer.ts` -------------------------
    const renderer = readSource(RENDERER_FILE, 'C3')
    problems.push(...renderer.problems)
    if (renderer.raw !== '') {
      const crud = bodyAt(renderer.raw, GNOSIS_CRUD_ANCHOR, 'C3', 'new GnosisCrudPanes(')
      problems.push(...crud.problems)
      if (crud.body !== '') {
        const code = stripComments(crud.body)
        const zeroArg = /onChanged\s*:\s*\(\s*\)\s*(?::\s*[^=]*)?=>\s*\{/.test(code)
        const refreshes = /host\s*\.\s*refresh\s*\(\s*\)/.test(code)
        const changedAt = code.indexOf('onChanged')
        const refreshAt = code.search(/host\s*\.\s*refresh\s*\(\s*\)/)
        if (!zeroArg) {
          problems.push(
            `C3 (\`F-1\`): the \`new GnosisCrudPanes({…})\` construction in \`${RENDERER_FILE}\` no longer carries a ZERO-PARAMETER ` +
              `\`onChanged: () => {\` — \`F-1\` records "the \`GnosisCrudOnChanged\` is still \`() => void\` and \`renderer.ts\` wires ` +
              `it to \`onChanged: () => { if (host) void host.refresh() }\`". If the grant's line 1 landed, this pin must be RE-PINNED ` +
              `deliberately in the same pass that moves the census (\`B-7\`'s recorded-value precedent), never relaxed in isolation`,
          )
        }
        if (!refreshes || refreshAt < changedAt) {
          problems.push(
            `C3 (\`F-1\`): the \`GnosisCrudPanes\` construction no longer routes \`onChanged\` into \`host.refresh()\` — \`F-1\`: ` +
              `"\`host.refresh()\` is \`renderer.ts\`'s line … a census move for \`gnosis-documents\`/\`gnosis-wikis\` without that ` +
              `line buys a half-wire", which is why §10 owes it as grant line 1`,
          )
        }
      }
    }

    // ---- (4) `F-5`'s SITE: the `⟨B-9⟩` operator fallback in `firePaneUpdate` ------------------------------------------------
    if (renderer.raw !== '') {
      const fallback = bodyAt(renderer.raw, FIRE_PANE_UPDATE_ANCHOR, 'C3', 'const firePaneUpdate =')
      problems.push(...fallback.problems)
      if (fallback.body !== '') {
        const code = stripComments(fallback.body)
        if (!/paneEvents\s*\.\s*fire\s*\(\s*paneId\s*\)/.test(code)) {
          problems.push(
            `C3 (\`F-5\`): \`firePaneUpdate\` no longer calls \`paneEvents.fire(paneId)\` — the site's whole subject is the channel ` +
              `report the fallback is scoped by`,
          )
        }
        if (!/if\s*\(\s*report\s*\.\s*fired\s*\)\s*\{?\s*return/.test(code)) {
          problems.push(
            `C3 (\`F-5\`): \`firePaneUpdate\` no longer returns early on \`report.fired\` — \`F-5\`'s hazard is exactly an operator ` +
              `pane entering the census: the fire answers \`fired:true\`, this early return skips the fallback, and the operator ` +
              `pane goes silently dead`,
          )
        }
        if (!/scope\s*===\s*'operator'/.test(code) || !/host\s*\.\s*refresh\s*\(\s*\)/.test(code)) {
          problems.push(
            `C3 (\`F-5\`): the \`operator\`-scope fallback is GONE from \`firePaneUpdate\` (expected ` +
              `\`registry.get(paneId)?.scope === 'operator' … host.refresh()\`) — §10's grant line 3 keeps \`gnosis-status\` out of ` +
              `the census precisely BECAUSE this fallback is the pane's only lawful paint until \`B-9\` lands \`mountOperator\``,
          )
        }
        // THE MARKER, read from the RAW body (the `${B-9}` unit marker IS a comment, and the comment is the record the contract
        // asks for). Anchored on the branch's own code line, never a file-wide token search: the marker must sit within three
        // lines of the `scope === 'operator'` test it explains.
        const rawLines = fallback.body.split('\n')
        const branchLine = rawLines.findIndex((line) => /scope\s*===\s*'operator'/.test(line))
        const markerWindow = branchLine < 0 ? [] : rawLines.slice(Math.max(0, branchLine - 3), branchLine + 1)
        if (branchLine < 0 || !markerWindow.some((line) => line.includes('⟨B-9⟩'))) {
          problems.push(
            `C3 (\`F-5\`): the operator fallback's \`⟨B-9⟩\` MARKER is gone (expected within three lines above ` +
              `\`scope === 'operator'\`) — the marker is the DELETION ORDER \`B-9\` inherits ("DELETE THIS BRANCH when the operator ` +
              `panes' paint lands"); an unmarked fallback is indistinguishable from a permanent double route`,
          )
        }
      }
    }

    // ---- (5) `F-7`'s SITE: `installSidebarBridge`'s `methods` object carries NO `gnosisDocuments`/`gnosisWikis` ---------------
    if (source.raw !== '') {
      const install = bodyAt(source.raw, INSTALL_SIDEBAR_BRIDGE_ANCHOR, 'C3', 'private installSidebarBridge(')
      problems.push(...install.problems)
      if (install.body !== '') {
        const methods = bodyAt(stripComments(install.body), SIDEBAR_METHODS_ANCHOR, 'C3', 'const methods =')
        problems.push(...methods.problems)
        if (methods.body !== '') {
          const carries = (name: string): boolean => new RegExp(`[{,]\\s*${name}\\s*[:(]`).test(methods.body)
          // THE POSITIVE CONTROL FIRST: the two gnosis seams `F-7` says ARE there. Without it, "no `gnosisDocuments`" would also be
          // satisfied by a `methods` object this row failed to locate.
          for (const present of ['gnosisStatus', 'gnosisQuery']) {
            if (!carries(present)) {
              problems.push(
                `C3 (\`F-7\`): the \`methods\` object of \`installSidebarBridge\` does not carry \`${present}\` — \`F-7\` records ` +
                  `"\`installSidebarBridge\`'s \`methods\` object carries \`gnosisStatus\`/\`gnosisQuery\` and no ` +
                  `\`gnosisDocuments\`/\`gnosisWikis\`". A missing positive control would make the absence arms below vacuous`,
              )
            }
          }
          for (const absent of ['gnosisDocuments', 'gnosisWikis']) {
            if (carries(absent)) {
              problems.push(
                `C3 (\`F-7\`): the \`methods\` object of \`installSidebarBridge\` now carries \`${absent}\` — \`F-7\` records this as ` +
                  `the defect that has held the two CRUD panes read-once-at-boot since A2, and §10 owes its fix as grant line 2 ` +
                  `(the \`SidebarPanesOptions.gnosis\` delegate widened to the CRUD host). Landing it without the census move, or ` +
                  `vice versa, is the half-wire; this pin reds so the pair is re-pinned DELIBERATELY in one pass`,
              )
            }
          }
        }
      }
    }

    expect(
      problems,
      `C3 PIN — the census is UNMOVED and the STOP's evidence stands (GREEN ON ARRIVAL; §6 \`X1\`, §4, §10; findings \`F-1\`, ` +
        `\`F-5\`, \`F-7\`). ${problems.length} problem(s). \`${CENSUS_NAME}\` must be exactly ` +
        `\`{gnosis-query, crosslinks, doc-nav, search, template-editor}\` as a SET with none of ` +
        `\`{gnosis-status, gnosis-documents, gnosis-wikis}\`, \`${CHANGE_INTEREST_NAME}\` exactly \`['${DOC_NAV}']\`, and the three ` +
        `grant sites of §1/§10 unchanged: \`renderer.ts\`'s CRUD \`onChanged: () => { … host.refresh() }\` (\`F-1\`), its \`⟨B-9⟩\` ` +
        `operator fallback in \`firePaneUpdate\` (\`F-5\`), and \`installSidebarBridge\`'s \`methods\` without ` +
        `\`gnosisDocuments\`/\`gnosisWikis\` (\`F-7\`). envelope-class`,
    ).toEqual([])
  })
})

// ===========================================================================
// `C4` — THE SUBJECT OF THE RULE IS TODAY'S SHIPPED PAIR (GREEN ON ARRIVAL).
// ===========================================================================
describe('pane-gnosis — C4 PIN (GREEN on arrival): the change census is a SUBSET of the paint census, recomputed by PARSING both declarations', () => {
  it('C4 — PIN: `CHANGE_INTERESTED_PANE_IDS ⊆ REPLUMBED_PANE_IDS` over both PARSED declarations, with the positive control that the parse is REAL (the census reads the five ids, the change-interest reads `doc-nav`)', async () => {
    // ⇒ GREEN ON ARRIVAL — A PIN. §9's containment rule has no subject if either declaration fails to parse, so this row proves the
    // parse before it grades the relation: a row that passes over a FAILED parse is the `B6-F12` defect (`D-38`'s lesson one realm
    // over), and a row that computes a subset over `[]` would be green forever.
    // LAYER: envelope-class — two DECLARATION parses over `src/renderer/sidebar-panes.ts`'s text (comments stripped). The declarations
    // are PARSED, never imported: `CHANGE_INTERESTED_PANE_IDS` is module-private, and importing the census would only prove what the
    // module already decided.
    // MUTATION THAT WOULD RED IT: an id added to the change-interest declaration without the census (the half-wire, and the day a
    // landing half-lands `B-8`); a census id removed while the change declaration still names it; a computed initialiser on either
    // declaration (the parse arms); a census that is no longer the five-id value (the positive control).
    const problems: string[] = []
    const source = readSource(SIDEBAR_FILE, 'C4')
    problems.push(...source.problems)

    const census = parseIdListDeclaration(source.code, CENSUS_NAME)
    const change = parseIdListDeclaration(source.code, CHANGE_INTEREST_NAME)
    const censusValues = census.values
    const changeValues = change.values

    // ---- (1) THE POSITIVE CONTROL: BOTH PARSES ARE REAL ----------------------------------------------------------------
    if (!census.found || censusValues === null) {
      problems.push(
        `C4: \`${CENSUS_NAME}\` did not parse to a literal id list (found: ${census.found}) — the subset relation would be computed ` +
          `over nothing, which is the \`B6-F12\` vacuity this row must never repeat`,
      )
    } else {
      const asSet = [...new Set(censusValues)].sort()
      const wantedSet = [...new Set(PINNED_CENSUS)].sort()
      if (fingerprint(asSet) !== fingerprint(wantedSet)) {
        problems.push(
          `C4: the PARSED census is ${shown(censusValues)}, not the five-id value ${shown(PINNED_CENSUS)} this row's subject is — ` +
            `either the head moved (then C3 reds and the move must be re-pinned deliberately) or this parse is reading the wrong ` +
            `bytes (then the subset arm below proves nothing)`,
        )
      }
    }
    if (!change.found || changeValues === null) {
      problems.push(
        `C4: \`${CHANGE_INTEREST_NAME}\` did not parse to a literal id list (found: ${change.found}) — the subset relation has no ` +
          `left-hand side`,
      )
    } else if (fingerprint(changeValues) !== fingerprint(PINNED_CHANGE_INTEREST)) {
      problems.push(
        `C4: the PARSED change-interest declaration reads ${shown(changeValues)}, not ${shown(PINNED_CHANGE_INTEREST)} — §4 records ` +
          `\`doc-nav\` as the one change-interested id at this head; this is the positive control, so a different value must be ` +
          `re-pinned DELIBERATELY (and ` +
          `${COUNTER_NAME} must be consulting it) rather than passing silently`,
      )
    }

    // ---- (2) THE RELATION: EVERY change-interested id is IN the paint census --------------------------------------------
    if (censusValues !== null && changeValues !== null) {
      const missing = changeValues.filter((paneId) => !censusValues.includes(paneId))
      if (missing.length > 0) {
        problems.push(
          `C4: ${shown(missing)} ${missing.length === 1 ? 'is' : 'are'} declared change-interested but ABSENT from ` +
            `\`${CENSUS_NAME}\` ${shown(censusValues)} — §9 (\`B6-F15\`): such an id "subscribes NOTHING while \`publishChange()\` ` +
            `drifts on", and \`boot\`'s validate-then-subscribe must refuse the WHOLE plan rather than attach it`,
        )
      }
      if (changeValues.length === 0) {
        problems.push(
          `C4: the change-interest declaration parsed EMPTY — the subset relation would be vacuously true, and §4 records ` +
            `\`['${DOC_NAV}']\` at this head (a booted host's \`changePanes()\` is read in C2)`,
        )
      }
      if (censusValues.length === 0) {
        problems.push(
          `C4: the paint census parsed EMPTY — every id would be 'missing' from it, so the relation above would be undefined ` +
            `rather than measured`,
        )
      }
    }

    expect(
      problems,
      `C4 PIN — the change census is a SUBSET of the paint census, recomputed by PARSING both declarations (GREEN ON ARRIVAL; §9 ` +
        `\`B6-F15\`, §4). ${problems.length} problem(s). The positive control is the point: the census must read exactly ` +
        `\`{gnosis-query, crosslinks, doc-nav, search, template-editor}\` and the change-interest declaration exactly ` +
        `\`['${DOC_NAV}']\` BEFORE the containment is graded, so a failed parse can never pass this row vacuously. envelope-class`,
    ).toEqual([])
  })
})
