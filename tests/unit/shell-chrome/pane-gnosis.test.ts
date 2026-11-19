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
//   §4           the census value and the change-interest value at this head — the two declarations rows `C3`/`C4` parse.
//   §12a (`D-44`)THE SECOND PASS'S AMENDMENT, and the reading `C3`/`C4` now grade: the grant (`D-44`) moved the census
//                FIVE -> SEVEN (`['gnosis-query','crosslinks','doc-nav','search','template-editor','gnosis-documents',
//                'gnosis-wikis']`), `gnosis-status` stays OUT (its paint is `B-9`'s, and entering it makes `fire` answer
//                `fired:true` while nothing paints — a silently dead operator pane), and the three granted sites are the LANDED
//                shape (`renderer.ts`'s CRUD `onChanged: (paneId) => firePaneUpdate(paneId)`, the `⟨B-9⟩` fallback UNCHANGED,
//                and `installSidebarBridge`'s `methods` now carrying `gnosisDocuments`/`gnosisWikis`).
//                ⟨THE CHANGE-INTEREST DECLARATION DOES *NOT* MOVE — §12a's MEASURED RE-NARROW.⟩ An earlier reading of this pass
//                pinned `CHANGE_INTERESTED_PANE_IDS` as `['doc-nav','gnosis-documents','gnosis-wikis']`; the architect RE-NARROWED it
//                to `['doc-nav']` after measurement, and `C3`/`C4` grade the NARROWED value. THE CAUSE (`D-40`'s `m6` class, named in the
//                declaration's own docblock): `publishChange()`'s fire contract is "re-read your subject", a CRUD pane has NO re-read arm
//                by design (`F-4` — a re-issue is the unbounded `settle → fire → settle` loop), so a `publishChange` fire reaches it with
//                nothing to re-read and paints NOTHING — a DECLARED BUT INERT path. Measured both ways: `not-a-pane` in the
//                `pane-doc-nav` `D2` harness (no gnosis pane registered) and `unchanged` in the app. The CRUD panes' engine route is the
//                ENGINE ARM's producer instead: `onRagStoreChanged` calls the delegate's own `refreshFromEngine()`, whose SETTLE fires its
//                own pane (`descriptor → read → settle → fire → paint`), so the engine has ONE route per pane, never two.
//   §6 `X1`      "the row that reds a landing which enters the operator pane into the census without its paint" — `C3` pins the
//                census MOVED TO SEVEN with `gnosis-status` ABSENT and names its reason.
//   §6 `X1b`     THE CONVERSE CLAUSE (this pass authors it): `census ⊆ paintable` over the REAL booted host — every census id must
//                answer `updatePane(id)` with something other than `operator-scope`/`not-a-pane`, proved falsifiable on two forged
//                censuses (the `gnosis-status` entry is the concrete dead-registration hazard).
//   §6 `S1`/§6 AUTHORING REFUSALS (`D-43`) the source-clause discipline (comments stripped, DECLARATIONS parsed, never a token
//                search) and `P1-1`'s correction of it: a member census grades DECLARATION SHAPES (`key: value`, `key,`,
//                `key(args) {`) and can never be satisfied — or emptied — by a SPELLING.
//
// DECLARATIONS ARE PARSED, NEVER SEARCHED (`D-38`: `src.indexOf('VALID_GROUPS')` latched onto a COMMENT once). Every clause below
// strips comments FIRST (the stripper is length-preserving, and each row CHECKS that: a raw/commented offset would let prose
// satisfy a clause), then locates a DECLARATION by its declaration shape and brace-matches its body. One marker is deliberately
// read from the RAW text — the `${B-9}` unit marker lives in a comment, and that comment IS the record the contract asks for — and
// it is read in a three-line window anchored on the branch's own code line, never as a file-wide token search.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): ENVELOPE-CLASS. `C1`'s declaration clause, `C2`'s plan clause and `C3`/`C4`'s declaration
// clauses read `src/**`'s TEXT (comments stripped) and nothing else; `C1`'s behaviour arms, `C2`'s census arms, `C3`'s parse
// cross-check and `X1b`'s paintable clause drive the REAL exported values and the REAL `SidebarPanes` host over the LAYOUT-LESS
// `dom-shim` against a recording runtime double. What this file can NEVER read, named so nobody quotes it: that a fire PAINTS a
// pane, that a pane re-reads once, that the counters are 0/0/0, or that the assembled Electron window repaints — those are §6's
// `Q*`/`X2`/`X3` rows (`tests/integration/shell-chrome/pane-gnosis.test.ts`) and §8's assembled-app limb (`G8`).
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
/** §12a (`D-44`): the PAINT census AFTER the grant's move — SEVEN ids, order-insensitive comparison, the recorded value kept
 *  whole. `[§4's five]` + `gnosis-documents` + `gnosis-wikis`, in the contract's declared order. */
const PINNED_CENSUS: readonly string[] = [
  'gnosis-query',
  'crosslinks',
  'doc-nav',
  'search',
  'template-editor',
  'gnosis-documents',
  'gnosis-wikis',
]
/** §12a: the CHANGE-INTEREST declaration after the grant — ONE id, `doc-nav`, exactly as the architect RE-NARROWED it after
 *  measurement (an earlier reading of this pass pinned the three-id set; the declaration never lands that way). THE CAUSE, as the
 *  declaration's own docblock now records it: `publishChange()`'s fire contract is "re-read your subject", and a CRUD pane has NO
 *  re-read arm by design (`F-4` — a re-issue is the unbounded `settle → fire → settle` loop), so a fire reaches it with nothing to
 *  re-read and paints nothing — a DECLARED BUT INERT path (`D-40`'s `m6` class; measured `not-a-pane` in the `pane-doc-nav` `D2`
 *  harness and `unchanged` in the app). Their engine route is the ENGINE ARM's producer: `onRagStoreChanged` calls the delegate's
 *  `refreshFromEngine()`, whose SETTLE fires its own pane, so the engine has ONE route per pane and `publishChange()` keeps its
 *  one meaning. */
const PINNED_CHANGE_INTEREST: readonly string[] = ['doc-nav']
/** §12a/`F-5`: the two panes the census must NOT carry, EACH WITH ITS REASON — `gnosis-status` is `operator`-scope and its paint is
 *  `B-9`'s (`paintPane` answers `operator-scope`, so entering it makes `fire` answer `fired:true` while nothing paints and
 *  `renderer.ts`'s `⟨B-9⟩` fallback is then skipped: a SILENTLY DEAD operator pane); `settings` is the operator surface too. */
const ABSENT_CENSUS_PANES: ReadonlyArray<{ paneId: string; reason: string }> = [
  {
    paneId: 'gnosis-status',
    reason:
      "its registration carries `scope:'operator'`, `paintPane`'s step 2 answers `operator-scope` for it and its paint is `B-9`'s — " +
      'entering it makes `fire` answer `fired:true` while nothing paints, and `renderer.ts`\'s `⟨B-9⟩` operator fallback is skipped ' +
      'precisely because `fired` is true (the silently dead operator pane `F-5` names)',
  },
  {
    paneId: 'settings',
    reason:
      'it is the operator scope\'s own pane (`B-9`\'s surface): `updatePane` answers `operator-scope` and the operator mount — not the ' +
      'app-graph paint — is its lawful route',
  },
]
const CENSUS_NAME = 'REPLUMBED_PANE_IDS'
const CHANGE_INTEREST_NAME = 'CHANGE_INTERESTED_PANE_IDS'
const DOC_NAV = 'doc-nav'
/** The forged ids: change-interested ids the census does NOT paint. `gnosis-status` is the CONCRETE half-wire (`F-5`: the operator
 *  pane whose entry makes `fire` answer `fired:true` with no paint), and the probe is an id no unit ever registers. Both are ABSENT
 *  from the seven-id value, so the forged-pair arms below stay a reading of the SHIPPED census rather than of a stale list. */
const FORGED_FIRST = 'gnosis-status'
const FORGED_SECOND = 'probe-b8-never-painted'
const DOCUMENTS_PANE = 'gnosis-documents'
const WIKIS_PANE = 'gnosis-wikis'

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
const SIDEBAR_PANES_ANCHOR = /new[ \t]+SidebarPanes[ \t]*\(/
const INSTALL_SIDEBAR_BRIDGE_ANCHOR = /private[ \t]+installSidebarBridge[ \t]*\(/
const SIDEBAR_METHODS_ANCHOR = /const[ \t]+methods[ \t]*=/
/** The `SidebarPanes` construction's gnosis delegate MEMBER — an object-literal member, matched on the member SHAPE (`gnosis: {`),
 *  never on a mention. */
const GNOSIS_DELEGATE_ANCHOR = /(?:^|[\s,{])gnosis[ \t]*:[ \t]*\{/

// ===========================================================================
// `P1-1` — THE MEMBER CENSUS, GRADED AS A DECLARATION SHAPE AND NEVER AS A SPELLING.
//
// THE FINDING, as this pass's contract states it (§6's AUTHORING REFUSALS, `D-43`; `P1-1` carried from §9): "`C3`'s absence arms were
// measured evadable by a shorthand (`gnosisDocuments,`) or spread (`...crudSeams`) member" — the pre-pass instrument tested
// `[{,]\s*<name>\s*[:(]`, so a SHORTHAND member (which is exactly the shape grant line 2's delegate produces when the members are
// hoisted) read ABSENT, and a SPREAD read ABSENT too. An absence arm that a lawful shape slips past is a vacuous arm; the remedy is
// this parser: it splits the object literal's TOP-LEVEL members (depth- and string-aware), strips comments first (the same
// length-preserving stripper every row in this file uses), and answers `{ declared, spreads }`. A SPREAD is then a NAMED problem of
// its own — never a silent absence and never a silent presence — because the members it carries cannot be enumerated.
// ===========================================================================

interface MemberCensus {
  /** the TOP-LEVEL member KEYS the object literal DECLARES, in declaration order (longhand, shorthand and method shorthand) */
  declared: string[]
  /** the TOP-LEVEL spread expressions, verbatim (`...crudSeams`) — each makes the census UNREADABLE for every required member */
  spreads: string[]
}

/** Split an object literal's INNER text into its top-level comma-separated members — brace/bracket/paren depth and string literals
 *  are respected, so a nested object's key, an arrow body's comma and a `'a,b'` string can never split a member. */
function topLevelMembers(inner: string): string[] {
  const members: string[] = []
  let current = ''
  let depth = 0
  let mode: 'code' | 'single' | 'double' | 'template' = 'code'
  let i = 0
  while (i < inner.length) {
    const ch = inner[i]!
    if (mode === 'code') {
      if (ch === "'") {
        mode = 'single'
        current += ch
        i += 1
        continue
      }
      if (ch === '"') {
        mode = 'double'
        current += ch
        i += 1
        continue
      }
      if (ch === '`') {
        mode = 'template'
        current += ch
        i += 1
        continue
      }
      if (ch === '{' || ch === '(' || ch === '[') depth += 1
      else if (ch === '}' || ch === ')' || ch === ']') depth -= 1
      else if (ch === ',' && depth === 0) {
        members.push(current)
        current = ''
        i += 1
        continue
      }
      current += ch
      i += 1
      continue
    }
    current += ch
    if (ch === '\\') {
      current += inner[i + 1] ?? ''
      i += 2
      continue
    }
    if ((mode === 'single' && ch === "'") || (mode === 'double' && ch === '"') || (mode === 'template' && ch === '`')) mode = 'code'
    i += 1
  }
  if (current.trim() !== '') members.push(current)
  return members
}

/** A member's leading KEY: `key: value` (longhand), a method shorthand `key(args) {`, an `async key(…)` / `*key(…)` form, and a bare
 *  shorthand `key`. `null` when the member opens with something that is not an identifier (a quoted/computed key). */
const MEMBER_KEY = /^(?:async[ \t]+)?\*?[ \t]*([A-Za-z_$][\w$]*)/

/** **THE MEMBER-CENSUS PARSER.** Takes an OBJECT LITERAL's text (raw is fine — comments are stripped here, and the stripper's
 *  length-preservation is asserted by every row that reads a source file), brace-matches past any leading furniture, and answers the
 *  TOP-LEVEL member keys plus every top-level spread. It never throws and never guesses: an unparseable body answers two empty
 *  arrays, which the clause below turns into a NAMED problem (never a vacuous pass). */
function parseObjectMemberKeys(body: string): MemberCensus {
  const code = stripComments(body)
  const open = code.indexOf('{')
  const close = open < 0 ? -1 : matchBrace(code, open)
  const census: MemberCensus = { declared: [], spreads: [] }
  if (open < 0 || close <= open) return census
  for (const raw of topLevelMembers(code.slice(open + 1, close))) {
    const member = raw.trim()
    if (member === '') continue
    if (member.startsWith('...')) {
      census.spreads.push(member.replace(/\s+/g, ' '))
      continue
    }
    const match = MEMBER_KEY.exec(member)
    if (match === null) continue
    census.declared.push(match[1]!)
  }
  return census
}

/** **THE MEMBER-CENSUS CLAUSE.** `[]` only when every `required` member is DECLARED at the object literal's top level; otherwise the
 *  problem sentences. A spread short-circuits to ONE named problem — "never a silent absence and never a silent presence" — because a
 *  member arriving through a spread can be neither certified present nor certified absent, so an absence arm over that body would be
 *  vacuous in the one direction that matters.
 *
 *  PROVED BOTH WAYS in `P1-1` (the row that closes the finding): a compliant longhand fixture and a SHORTHAND fixture (the shape the
 *  pre-pass regex missed) both answer `[]`; a spread fixture and an absent-member fixture each answer a NAMED problem. */
function memberCensusProblems(census: MemberCensus, required: readonly string[], where: string, limb: string): string[] {
  if (census.spreads.length > 0) {
    return [
      `${limb}: the member census of ${where} is UNREADABLE — the object literal SPREADS ${shown(census.spreads)}, so a member ` +
        `that arrives through the spread can be neither certified PRESENT nor certified ABSENT (a spread is never a silent absence ` +
        `and never a silent presence). Declared top-level members read: ${shown(census.declared)}`,
    ]
  }
  const problems: string[] = []
  for (const name of required) {
    if (!census.declared.includes(name)) {
      problems.push(
        `${limb}: ${where} does NOT DECLARE the top-level member \`${name}\` (declaration shapes read: longhand \`${name}: …\`, ` +
          `shorthand \`${name},\`, method shorthand \`${name}(…) {\`). Required: ${shown([...required])}. Declared: ` +
          `${shown(census.declared)}`,
      )
    }
  }
  return problems
}

/** The RAW text of ONE top-level member of an object literal (key through value), or a NAMED problem — the reader `C3`'s grant-site
 *  arms use to isolate `onChanged: …` and the gnosis delegate before grading their INTERNALS. Comments are stripped first (the same
 *  length-preserving stripper), so prose can never supply a member. */
function objectMemberText(rawBody: string, name: string): { text: string; problems: string[] } {
  const code = stripComments(rawBody)
  const open = code.indexOf('{')
  const close = open < 0 ? -1 : matchBrace(code, open)
  if (open < 0 || close <= open) {
    return {
      text: '',
      problems: [`the object literal under inspection carries no BALANCED braced body — the member \`${name}\` cannot be located`],
    }
  }
  const members = topLevelMembers(code.slice(open + 1, close))
  const declared: string[] = []
  for (const raw of members) {
    const member = raw.trim()
    if (member === '') continue
    const key = MEMBER_KEY.exec(member)
    if (key !== null) declared.push(key[1]!)
    if (key === null || key[1] !== name) continue
    return { text: member, problems: [] }
  }
  return {
    text: '',
    problems: [`the object literal does NOT DECLARE the top-level member \`${name}\` — declared: ${shown(declared)}`],
  }
}

/** The braced BODY of a NESTED object-literal member (`gnosis: { … }`) — the delegate `C3`'s member census parses, isolated from the
 *  enclosing options object so a member of the OUTER literal can never satisfy the inner census. */
function nestedObjectMemberBody(rawBody: string, name: string): { body: string; problems: string[] } {
  const member = objectMemberText(rawBody, name)
  if (member.text === '') return { body: '', problems: member.problems }
  const open = member.text.indexOf('{')
  const close = open < 0 ? -1 : matchBrace(member.text, open)
  if (open < 0 || close <= open) {
    return {
      body: '',
      problems: [`the \`${name}\` member is not an OBJECT LITERAL (read: ${shown(member.text)}) — there is no member census to grade`],
    }
  }
  return { body: member.text.slice(open, close + 1), problems: [] }
}

/** **`X1b`'s CLAUSE, and the only place it lives:** every id in `census` must answer `updatePane(id)` with a reason that is NOT
 *  `operator-scope` and NOT `not-a-pane` (i.e. `census ⊆ paintable`). `painted`/`unchanged`/`not-enabled`/`not-mounted`/`no-runtime`
 *  are all admissible: the first two are the paint's own answers and the last three are transient boot / registry states, none of
 *  which is a registration that can never paint. The forged-census mutants `X1b` drives prove the clause falsifiable. */
function censusPaintableProblems(
  host: Record<string, unknown> | null,
  census: readonly string[],
  where: string,
  limb: string,
): string[] {
  if (host === null) {
    return [`${limb}: the booted host is ABSENT — \`census ⊆ paintable\` over ${where} has no subject`]
  }
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
              ? 'the operator scope\'s lawful paint is `B-9`\'s re-mount, so a census entry for it makes `fire` answer ' +
                '`fired:true` while nothing paints AND skips `renderer.ts`\'s `⟨B-9⟩` fallback — a SILENTLY DEAD operator pane'
              : 'no host registered the pane, so the fire reaches a registration whose paint cannot exist'
          }`,
      )
    }
  }
  return problems
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
  /** The booted host — the subject of `X1b`'s `census ⊆ paintable` clause (`updatePane(<id>)`'s declared word is the reading). */
  host: Record<string, unknown> | null
  problems: string[]
  restore: () => void
}

interface BootOptions {
  /** `true` → register the REAL pane hosts into the registry the host uses, exactly as `renderer.ts` does: `GnosisPanes` (which
   *  registers `gnosis-status` + `gnosis-query`, the `operator`/`app-graph` pair) and `GnosisCrudPanes` (which registers
   *  `gnosis-documents` + `gnosis-wikis`) — the registry a `census ⊆ paintable` clause must read, because a census id whose pane
   *  no host registered can only ever answer `not-a-pane`. */
  withRealPanes?: boolean
}

/** Boot the REAL host with the REAL channel and answer the channel it subscribed into — the ONE reading that shows WHICH
 *  declarations the boot loop actually made (the census it painted for and the change-interest ids it marked). */
async function bootChannelHost(limb: string, options: BootOptions = {}): Promise<ChannelBootDrive> {
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
      security: { get: async (): Promise<Record<string, unknown>> => ({ token: null, enabled: ['read', 'gnosis', 'gnosis-edit'] }) },
      gnosis: {
        status: async (): Promise<Record<string, unknown>> => ({ ok: true }),
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
          // ⟨`X1b`⟩ EVERY app-graph census id this harness can register is ENABLED, so the frames exist and the paint's own gate
          // (`not-enabled`) cannot mask a `not-a-pane`; the clause grades the declARED WORD, and `not-enabled` is admissible.
          enabledPanes: [DOC_NAV, 'search', 'crosslinks', DOCUMENTS_PANE, WIKIS_PANE, 'gnosis-query', 'template-editor'],
          enabledOperatorPanes: ['settings', 'gnosis-status'],
          panesInitialized: true,
          defaultDocumentId: null,
          topK: 5,
        }),
        set: async (patch: unknown): Promise<unknown> => patch,
        onChanged: (_handler: (settings: unknown) => void): (() => void) => () => undefined,
      },
    }
    const registry = createPaneRegistry()
    if (options.withRealPanes === true) {
      // EXACTLY THE `renderer.ts` ORDER: both gnosis hosts register into the SHARED registry, before `SidebarPanes.boot` assembles.
      const GnosisPanesCtor = (await import('../../../src/renderer/gnosis-panes.js')).GnosisPanes as new (opts: unknown) => {
        registerPanes(): void
      }
      new GnosisPanesCtor({
        registry,
        bridge,
        // The standby the `⟨B-9⟩` fallback uses: a settle names its pane and the site fires it. Nothing in `X1b` depends on it firing.
        onChanged: (): void => undefined,
      }).registerPanes()
      const GnosisCrudPanesCtor = (await import('../../../src/renderer/gnosis-crud-panes.js')).GnosisCrudPanes as new (opts: unknown) => {
        registerPanes(): void
      }
      new GnosisCrudPanesCtor({ registry, bridge, onChanged: (): void => undefined }).registerPanes()
    }
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
    return { channel, host, problems, restore }
  } catch (error) {
    problems.push(
      `${limb}: the harness's \`host.boot(runtime)\` THREW (${String(error)}) — the shipped census's ATTACHMENTS have no booted ` +
        `subject, so the change-interest reading below cannot be made`,
    )
    return { channel: null, host: null, problems, restore }
  }
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
      // (2b) THE FORGED PAIR — one id the census does not paint: a problem NAMING it. ⟨RE-STATED by §12a (`D-44`) — the recorded
      // VALUES moved, the ARMS did not.⟩ The shipped census now CARRIES `gnosis-documents`/`gnosis-wikis` (the seven-id value), so
      // the forged ids are the two the census still does NOT paint: `gnosis-status` (`F-5`'s operator pane — the CONCRETE half-wire:
      // entering it makes `fire` answer `fired:true` with no paint while the `⟨B-9⟩` fallback is skipped) and an id no unit
      // registers. A counter that certified either one would bless exactly the dead registration `X1`/`X1b` exist to refuse.
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
              `so the \`changePanes()\` comparison above is VACUOUS (\`[] === []\`) — §12a records ` +
              `${shown(PINNED_CHANGE_INTEREST)}, every id of which IS in the seven-id census`,
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
// `C3` — THE CENSUS HAS MOVED AND THE SITES ARE THE GRANTED ONES (§12a, `D-44`).
// ===========================================================================
describe('pane-gnosis — C3 PIN: the census HAS moved to the seven-id value and the two `renderer.ts` grant sites plus the two seams now stand as `D-44` states them', () => {
  it('C3 — PIN: `REPLUMBED_PANE_IDS` parses to exactly the SEVEN-id set (runtime agrees, still exported) with `gnosis-status` and `settings` ABSENT and each named with its reason; `CHANGE_INTERESTED_PANE_IDS` parses to exactly `[doc-nav]` (the re-narrowed value) and is still module-private; the CRUD `onChanged` is the ONE-PARAMETER form whose body calls `firePaneUpdate(paneId)` with NO `host.refresh()`; the `⟨B-9⟩` operator fallback is UNCHANGED; the `SidebarPanes` gnosis delegate DECLARES status/query/documents/wikis/refreshFromEngine; and `installSidebarBridge`’s `methods` DECLARES gnosisStatus/gnosisQuery/gnosisDocuments/gnosisWikis', async () => {
    // §12a (`D-44`) — THE PIN, RE-GRAINED. The pre-pass pin asserted the OPPOSITE two things ("the census does not move in this
    // pass" and "`onChanged` is still a zero-parameter arrow wired to `host.refresh()`"); those are the arms THIS pass inverts, and
    // they are inverted HERE — deliberately, in the set, with the landing — never relaxed in isolation (`B-7`'s recorded-value
    // precedent). Every arm now names the LANDED fact and the contract sentence it reads, so a HALF-landing reds by name: a census
    // of five, a change-interest declaration of one, a zero-parameter `onChanged`, a delegate without `documents`/`wikis`/
    // `refreshFromEngine`, or a `methods` object without `gnosisDocuments`/`gnosisWikis` each reds its own arm.
    // LAYER: envelope-class — DECLARATION parses over `src/renderer/**`'s text (comments stripped, bodies brace-matched) plus ONE
    // cross-check against the module's runtime census value; ONE marker is read from the RAW text (`⟨B-9⟩` lives in a comment, and
    // that comment IS the record the contract asks for — read in a three-line window anchored on the branch's own code line,
    // never as a file-wide token search).
    // DIFFERENCE FROM THE PRE-PASS ROW, named because this is the inversion: the census arms are now POSITIVE (seven ids, with the
    // two CRUD panes present) and the absence arm is narrowed to the two panes that genuinely have no paint (`gnosis-status`,
    // `settings`); the member arms grade DECLARATION SHAPES through `parseObjectMemberKeys` (`P1-1`), never a spelling.
    const problems: string[] = []

    // ---- (1) THE PAINT CENSUS — the SEVEN-id SET, and the two panes that must NOT be in it, each with its reason --------------
    const source = readSource(SIDEBAR_FILE, 'C3')
    problems.push(...source.problems)
    const censusDeclaration = parseIdListDeclaration(source.code, CENSUS_NAME)
    const censusValues = censusDeclaration.values
    let parsedCensusSet: string[] | null = null
    if (!censusDeclaration.found) {
      problems.push(
        `C3: \`${CENSUS_NAME}\` does not PARSE out of \`${SIDEBAR_FILE}\` — §12a pins it as the ONE declared census, so its absence ` +
          `is a finding, never a vacuous pass`,
      )
    } else if (censusValues === null) {
      problems.push(
        `C3: \`${CENSUS_NAME}\` is declared but does NOT parse to a literal id list — the recorded value cannot be read, and a row ` +
          `that passes over an unparsed declaration is the \`B6-F12\` defect`,
      )
    } else {
      const asSet = [...new Set(censusValues)].sort()
      parsedCensusSet = asSet
      const wantedSet = [...new Set(PINNED_CENSUS)].sort()
      if (fingerprint(asSet) !== fingerprint(wantedSet)) {
        problems.push(
          `C3: \`${CENSUS_NAME}\` parses to ${shown(censusValues)}, whose SET is ${shown(asSet)}, not ${shown(wantedSet)} — §12a ` +
            `(\`D-44\`) moves the census \`five -> seven\` (\`gnosis-documents\` and \`gnosis-wikis\` land WITH their fires, grant ` +
            `lines 1 and 2) and the previous pass's five-id value is SUPERSEDED. A move without the granted fires is the half-wire ` +
            `\`D-42\` refuses; a move of a different SIZE is a different decision than the one recorded`,
        )
      }
      if (censusValues.length !== asSet.length) {
        problems.push(`C3: \`${CENSUS_NAME}\` repeats an id (${shown(censusValues)}) — ONE id, ONE subscriber (\`B2-ADV-04\`)`)
      }
      for (const absent of ABSENT_CENSUS_PANES) {
        if (censusValues.includes(absent.paneId)) {
          problems.push(
            `C3: \`${CENSUS_NAME}\` names \`${absent.paneId}\` — it must stay OUT: ${absent.reason}`,
          )
        }
      }
      if (!censusDeclaration.exported) {
        problems.push(
          `C3: \`${CENSUS_NAME}\` is no longer EXPORTED — the booted-host rows (\`C2\`, \`X1b\`) and the sibling pins read it as the ` +
            `shipped VALUE, so its export is part of the same recorded value`,
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

    // ---- (2) THE CHANGE-INTEREST DECLARATION — exactly the ONE id (`doc-nav`), and still module-private ------------------------
    const changeDeclaration = parseIdListDeclaration(source.code, CHANGE_INTEREST_NAME)
    const changeValues = changeDeclaration.values
    if (!changeDeclaration.found) {
      problems.push(
        `C3: \`${CHANGE_INTEREST_NAME}\` does not PARSE out of \`${SIDEBAR_FILE}\` — §4/§12a pin it as the ONE declaration the boot ` +
          `loop's per-id choice reads; a missing declaration is a finding, never a vacuous pass`,
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
          `C3: \`${CHANGE_INTEREST_NAME}\` parses to ${shown(changeValues)}, whose SET is ${shown(asSet)}, not ${shown(wantedSet)} — ` +
            `§12a RE-NARROWED the declaration to exactly ${shown(PINNED_CHANGE_INTEREST)} AFTER MEASUREMENT, and the reason is the ` +
            `\`D-40\` \`m6\` class: \`publishChange()\`'s fire contract is "re-read your subject", a CRUD pane has NO re-read arm by ` +
            `design (\`F-4\` — a re-issue is the unbounded \`settle → fire → settle\` loop), so a fire reaches it with nothing to ` +
            `re-read and paints NOTHING (measured \`not-a-pane\` in the \`pane-doc-nav\` \`D2\` harness, \`unchanged\` in the app). ` +
            `Declaring change interest there is a DECLARED BUT INERT path; their engine route is the ENGINE ARM's producer, ` +
            `\`refreshFromEngine()\`, whose SETTLE fires its own pane`,
        )
      }
      if (changeDeclaration.exported) {
        problems.push(
          `C3: \`${CHANGE_INTEREST_NAME}\` is now EXPORTED — §4/§9 keep it module-private and land the PURE COUNTER as the seam ` +
            `(the census in \`boot\` is not a public surface); an export here is a second authority for the same declaration`,
        )
      }
    }

    // ---- (3) GRANT LINE 1 (`F-1`): the CRUD host's `onChanged` is the ONE-PARAMETER `(paneId) => firePaneUpdate(paneId)` ------
    const renderer = readSource(RENDERER_FILE, 'C3')
    problems.push(...renderer.problems)
    if (renderer.raw !== '') {
      const crud = bodyAt(renderer.raw, GNOSIS_CRUD_ANCHOR, 'C3', 'new GnosisCrudPanes(')
      problems.push(...crud.problems)
      if (crud.body !== '') {
        const member = objectMemberText(crud.body, 'onChanged')
        problems.push(...member.problems)
        if (member.text !== '') {
          // THE ONE-PARAMETER FORM, graded by SHAPE: a single named parameter (typed or not) whose body calls
          // `firePaneUpdate(<that parameter>)`. The parameter's NAME is read off the declaration, never spelled here, so a landing
          // that renames it still passes and a landing that DROPS it cannot.
          const arrow = /^onChanged\s*:\s*\(\s*([A-Za-z_$][\w$]*)\s*(?::\s*[^)]*)?\)\s*=>/.exec(member.text)
          if (arrow === null) {
            const zeroArg = /^onChanged\s*:\s*\(\s*\)\s*(?::\s*[^=]*)?=>/.test(member.text)
            problems.push(
              `C3 (\`F-1\`, grant line 1): the \`new GnosisCrudPanes({…})\` construction's \`onChanged\` reads ${shown(member.text)} — ` +
                `§12a lands ${zeroArg ? 'the ONE-PARAMETER form' : 'the one-parameter arrow form'} ` +
                `\`onChanged: (paneId) => firePaneUpdate(paneId)\`, because the zero-parameter arrow \`F-1\` records ("the ` +
                `\`GnosisCrudOnChanged\` is still \`() => void\`") IGNORES the id the settle now hands it: a census move without this ` +
                `line buys a DEAD REGISTRATION`,
            )
          } else {
            const parameter = arrow[1]!
            if (!new RegExp(`firePaneUpdate\\s*\\(\\s*${parameter.replace(/\$/g, '\\$')}\\s*\\)`).test(member.text)) {
              problems.push(
                `C3 (\`F-1\`, grant line 1): the \`onChanged\` member takes \`${parameter}\` but its body does not call ` +
                  `\`firePaneUpdate(${parameter})\` (member read: ${shown(member.text)}) — the settle names the pane it is ABOUT and ` +
                  `the site fires THAT pane; anything else loses the id again`,
              )
            }
          }
          if (/\.\s*refresh\s*\(/.test(member.text)) {
            problems.push(
              `C3 (\`F-1\`, grant line 1): the \`onChanged\` member STILL reaches \`refresh()\` (member read: ${shown(member.text)}) — ` +
                `the pre-migration body was \`onChanged: () => { if (host) void host.refresh() }\`, a WHOLE-GRAPH re-assembly for ` +
                `ONE pane's data, which is exactly what \`INV-E\` counts at zero; §12a replaces it, it does not keep it beside the fire`,
            )
          }
        }
      }

      // ---- (4) THE `⟨B-9⟩` OPERATOR FALLBACK — UNCHANGED pins (`F-5`) ---------------------------------------------------
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
              `\`registry.get(paneId)?.scope === 'operator' … host.refresh()\`) — §12a keeps it for \`B-9\` precisely BECAUSE ` +
              `\`gnosis-status\` stays out of the census: it is the operator pane's only lawful paint until \`B-9\` lands`,
          )
        }
        // THE MARKER, read from the RAW body (the `⟨B-9⟩` unit marker IS a comment, and the comment is the record the contract
        // asks for). Anchored on the branch's own code line, never a file-wide token search.
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

      // ---- (5) GRANT LINE 2 (`F-7`): the `SidebarPanes` gnosis delegate DECLARES all five members --------------------------
      const sidebarConstruction = bodyAt(renderer.raw, SIDEBAR_PANES_ANCHOR, 'C3', 'new SidebarPanes(')
      problems.push(...sidebarConstruction.problems)
      if (sidebarConstruction.body !== '') {
        const delegate = nestedObjectMemberBody(sidebarConstruction.body, 'gnosis')
        problems.push(...delegate.problems)
        if (delegate.body !== '') {
          const census = parseObjectMemberKeys(delegate.body)
          problems.push(
            ...memberCensusProblems(
              census,
              ['status', 'query', 'documents', 'wikis', 'refreshFromEngine'],
              "`renderer.ts`'s `new SidebarPanes({…})` construction's `gnosis` delegate",
              'C3 (`F-7`, grant line 2)',
            ),
          )
          // THE POSITIVE CONTROL: the two members that were ALREADY there. Without it a delegate this row failed to locate would
          // satisfy the absence arms by reading an empty census.
          problems.push(
            ...memberCensusProblems(census, ['status', 'query'], "the SAME `gnosis` delegate (positive control)", 'C3 (`F-7`)'),
          )
        }
      }
    }

    // ---- (6) GRANT LINE 2 (`F-7`): `installSidebarBridge`'s `methods` DECLARES the two CRUD seams ------------------------------
    if (source.raw !== '') {
      const install = bodyAt(source.raw, INSTALL_SIDEBAR_BRIDGE_ANCHOR, 'C3', 'private installSidebarBridge(')
      problems.push(...install.problems)
      if (install.body !== '') {
        const methods = bodyAt(stripComments(install.body), SIDEBAR_METHODS_ANCHOR, 'C3', 'const methods =')
        problems.push(...methods.problems)
        if (methods.body !== '') {
          const census = parseObjectMemberKeys(methods.body)
          problems.push(
            ...memberCensusProblems(
              census,
              ['gnosisStatus', 'gnosisQuery', 'gnosisDocuments', 'gnosisWikis'],
              "`installSidebarBridge`'s `methods` object",
              'C3 (`F-7`)',
            ),
          )
          problems.push(
            ...memberCensusProblems(
              census,
              ['gnosisStatus', 'gnosisQuery'],
              "`installSidebarBridge`'s `methods` object (positive control)",
              'C3 (`F-7`)',
            ),
          )
        }
      }
    }

    expect(
      problems,
      `C3 PIN — the census HAS MOVED and the granted sites stand (§12a \`D-44\`; §4, §6 \`X1\`; findings \`F-1\`, \`F-5\`, \`F-7\`). ` +
        `${problems.length} problem(s). \`${CENSUS_NAME}\` must be exactly ${shown(PINNED_CENSUS)} as a SET with ` +
        `${shown(ABSENT_CENSUS_PANES.map((entry) => entry.paneId))} ABSENT (each refused for its own recorded reason), ` +
        `\`${CHANGE_INTEREST_NAME}\` exactly ${shown(PINNED_CHANGE_INTEREST)} and still module-private, \`renderer.ts\`'s CRUD ` +
        `\`onChanged\` the ONE-PARAMETER \`(paneId) => firePaneUpdate(paneId)\` with no \`host.refresh()\`, its \`⟨B-9⟩\` operator ` +
        `fallback UNCHANGED, the \`SidebarPanes\` gnosis delegate DECLARING status/query/documents/wikis/refreshFromEngine, and ` +
        `\`installSidebarBridge\`'s \`methods\` DECLARING gnosisStatus/gnosisQuery/gnosisDocuments/gnosisWikis. envelope-class — ` +
        `declaration parses plus the module's runtime value; every member is graded as a DECLARATION SHAPE (\`P1-1\`), never a spelling`,
    ).toEqual([])
  })
})

// ===========================================================================
// `C4` — THE CHANGE CENSUS IS STILL A SUBSET OF THE PAINT CENSUS (GREEN ON ARRIVAL).
// ===========================================================================
describe('pane-gnosis — C4 PIN (GREEN on arrival): the change census is a SUBSET of the paint census, recomputed by PARSING both declarations', () => {
  it('C4 — PIN: `CHANGE_INTERESTED_PANE_IDS` ⊆ `REPLUMBED_PANE_IDS` over both PARSED declarations, with the positive control that the parse is REAL (the census reads the SEVEN ids, the change-interest reads the ONE)', async () => {
    // ⇒ GREEN ON ARRIVAL — A PIN. §9's containment rule has no subject if either declaration fails to parse, so this row proves the
    // parse before it grades the relation: a row that passes over a FAILED parse is the `B6-F12` defect (`D-38`'s lesson one realm
    // over), and a row that computes a subset over `[]` would be green forever.
    // LAYER: envelope-class — two DECLARATION parses over `src/renderer/sidebar-panes.ts`'s text (comments stripped). The declarations
    // are PARSED, never imported: `CHANGE_INTERESTED_PANE_IDS` is module-private, and importing the census would only prove what the
    // module already decided.
    // RE-STATED BY §12a, NOT RELAXED: the census positive control moves to the SEVEN-id value the grant lands, and the
    // change-interest positive control moves to the ONE-id value the architect RE-NARROWED after measurement (`['doc-nav']` — the
    // `D-40` `m6` cause: a `publishChange` fire reaches a CRUD pane with no re-read arm and paints nothing, so declaring change
    // interest there is a declared-but-inert path; their engine route is the ENGINE ARM's `refreshFromEngine()`). The empty-declaration
    // arms stay exactly as filed, and the subset relation is graded over both PARSED values whatever they are.
    // MUTATION THAT WOULD RED IT: an id added to the change-interest declaration without the census (the half-wire, and the day a
    // landing half-lands `B-8`); a census id removed while the change declaration still names it; a computed initialiser on either
    // declaration (the parse arms); a census or change-interest value that is not the recorded one (the positive controls).
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
          `C4: the PARSED census is ${shown(censusValues)}, not the SEVEN-id value ${shown(PINNED_CENSUS)} this row's subject is — ` +
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
    } else if (fingerprint([...new Set(changeValues)].sort()) !== fingerprint([...new Set(PINNED_CHANGE_INTEREST)].sort())) {
      problems.push(
        `C4: the PARSED change-interest declaration reads ${shown(changeValues)}, not ${shown(PINNED_CHANGE_INTEREST)} — §12a ` +
          `RE-NARROWED the declaration to the ONE id after measurement (the \`D-40\` \`m6\` class: no CRUD re-read arm, so a ` +
          `\`publishChange\` fire paints nothing), so a different value must be re-pinned DELIBERATELY ` +
          `(and \`${COUNTER_NAME}\` must be consulting it) rather than passing silently`,
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
          `C4: the change-interest declaration parsed EMPTY — the subset relation would be vacuously true, and §4/§12a record ` +
            `${shown(PINNED_CHANGE_INTEREST)} (a booted host's \`changePanes()\` is read in C2)`,
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
        `\`B6-F15\`, §4, §12a). ${problems.length} problem(s). The positive control is the point: the census must read exactly ` +
        `${shown(PINNED_CENSUS)} and the change-interest declaration exactly ${shown(PINNED_CHANGE_INTEREST)} BEFORE the ` +
        `containment is graded, so a failed parse can never pass this row vacuously. envelope-class`,
    ).toEqual([])
  })
})

// ===========================================================================
// `P1-1` — FINDING CLOSED: A MEMBER CENSUS GRADES DECLARATION SHAPES, NEVER SPELLINGS.
// ===========================================================================
describe('pane-gnosis — P1-1 (finding closed): the member census is a CLAUSE over DECLARATION SHAPES, proved both ways on fixtures', () => {
  it('P1-1 — a longhand member AND a shorthand member are both certified PRESENT, a spread makes the census UNREADABLE (a NAMED problem, never a silent absence and never a silent presence), an absent member is named, a nested key is never a top-level member, a comment/string comma never splits a member, and the compliant fixture answers `[]`', () => {
    // THE FINDING (`P1-1`, carried from §9 and closed here): the pre-pass `C3` graded a member with
    // `[{,]\s*<name>\s*[:(]`, so (i) a SHORTHAND member (`gnosisDocuments,`) — exactly the shape a landing produces when it hoists
    // the members — read ABSENT, and (ii) a SPREAD (`...crudSeams`) read ABSENT too, i.e. an absence arm could be satisfied by a
    // body that does not declare the member at all. Both directions are VACUITY, and both are closed by grading the DECLARATION:
    // `parseObjectMemberKeys` splits the object literal's TOP-LEVEL members, and `memberCensusProblems` refuses a spread outright.
    // LAYER: envelope/pure — fixtures only; nothing here reads `src/**` (the shipped bodies are graded by `C3`, through THIS
    // clause). Proved BOTH WAYS, which is what makes it a clause rather than a pin: the compliant fixture answers `[]` (so it is not
    // always-red, `D-43`) and each mutant answers a NAMED problem (so it is not always-green).
    const problems: string[] = []
    const REQUIRED = ['status', 'query', 'documents', 'wikis', 'refreshFromEngine'] as const

    // ---- (i) LONGHAND IS PRESENT ---------------------------------------------------------------------------------------
    const longhand = [
      '{',
      '  status: () => undefined,',
      '  query: (value: string) => value,',
      '  documents: (tool: string, args: Record<string, unknown>) => forward(tool, args),',
      '  wikis: (tool: string, args: Record<string, unknown>) => forward(tool, args),',
      '  refreshFromEngine: () => reRead(),',
      '}',
    ].join('\n')
    const longhandCensus = parseObjectMemberKeys(longhand)
    if (!REQUIRED.every((name) => longhandCensus.declared.includes(name))) {
      problems.push(
        `P1-1: the LONGHAND fixture is not certified present — \`parseObjectMemberKeys\` read ${shown(longhandCensus)} for a body that ` +
          `declares all five members. A parser that cannot read the plainest shape is not a census`,
      )
    }
    // NON-VACUITY: the SAME clause must answer `[]` for a compliant body — a clause that reds every landing (including the lawful
    // one) would read as "the landing is missing" while proving nothing (`D-43`'s failure mode).
    const compliantProblems = memberCensusProblems(longhandCensus, REQUIRED, 'the COMPLIANT fixture', 'P1-1')
    if (compliantProblems.length > 0) {
      problems.push(
        `P1-1: the clause REJECTED the compliant fixture (${shown(compliantProblems)}) — it is unsatisfiable as written, so every red ` +
          `it produces elsewhere proves nothing`,
      )
    }

    // ---- (ii) THE SHORTHAND MEMBER IS PRESENT — THE SHAPE THE PRE-PASS REGEX MISSED --------------------------------------
    const shorthand = '{ gnosisStatus: () => undefined, gnosisDocuments, gnosisWikis, }'
    const shorthandCensus = parseObjectMemberKeys(shorthand)
    const shorthandProblems = memberCensusProblems(shorthandCensus, ['gnosisDocuments', 'gnosisWikis'], 'the SHORTHAND fixture', 'P1-1')
    if (shorthandProblems.length > 0) {
      problems.push(
        `P1-1: the clause did NOT certify the SHORTHAND members (${shown(shorthandProblems)}) — \`gnosisDocuments,\` and ` +
          `\`gnosisWikis,\` ARE declarations, and a census that cannot see them makes every absence arm over that body vacuously ` +
          `satisfiable. Census read: ${shown(shorthandCensus)}`,
      )
    }
    // THE FINDING, MEASURED ON THE OLD INSTRUMENT ITSELF: the pre-pass predicate reads FALSE on the same text — this arm exists so
    // the finding is a reading rather than a claim, and so a relapse into the spelling search is visible here.
    const prePassCarries = (name: string): boolean => new RegExp(`[{,]\\s*${name}\\s*[:(]`).test(shorthand)
    for (const name of ['gnosisDocuments', 'gnosisWikis']) {
      if (prePassCarries(name)) {
        problems.push(
          `P1-1: the PRE-PASS predicate \`[{,]\\s*${name}\\s*[:(]\` now matches the shorthand fixture — this arm exists to record ` +
            `that it did NOT (the finding), so the fixture must stay a true shorthand body`,
        )
      }
    }

    // ---- (iii) A SPREAD MAKES THE CENSUS UNREADABLE (a NAMED problem, both directions) ----------------------------------
    const spread = '{ ...crudSeams, gnosisStatus: () => undefined }'
    const spreadCensus = parseObjectMemberKeys(spread)
    if (spreadCensus.spreads.length !== 1 || !spreadCensus.spreads[0]!.includes('crudSeams')) {
      problems.push(
        `P1-1: the SPREAD fixture's spread was not recorded (census read: ${shown(spreadCensus)}) — a spread is the one shape whose ` +
          `members cannot be enumerated, so it must be READ and reported, never dropped`,
      )
    }
    const spreadProblems = memberCensusProblems(spreadCensus, ['gnosisStatus'], 'the SPREAD fixture', 'P1-1')
    if (spreadProblems.length !== 1) {
      problems.push(
        `P1-1: the clause answered ${spreadProblems.length} problem(s) for a body with a SPREAD (${shown(spreadProblems)}), not exactly ` +
          `ONE — a spread is never a silent absence and never a silent presence: the census is UNREADABLE, and one NAMED problem is ` +
          `the whole answer`,
      )
    } else if (!/spread/i.test(spreadProblems[0]!) || !spreadProblems[0]!.includes('crudSeams')) {
      problems.push(
        `P1-1: the spread's problem does not NAME the spread (${shown(spreadProblems[0])}) — the sentence must say WHAT made the ` +
          `census unreadable, or a reviewer cannot tell it from a missing member`,
      )
    }

    // ---- (iv) AN ABSENT MEMBER IS NAMED ---------------------------------------------------------------------------------
    const absent = '{ status: () => undefined, query: (value: string) => value }'
    const absentCensus = parseObjectMemberKeys(absent)
    const absentProblems = memberCensusProblems(absentCensus, ['status', 'documents'], 'the ABSENT-MEMBER fixture', 'P1-1')
    if (absentProblems.length !== 1 || !absentProblems[0]!.includes('documents')) {
      problems.push(
        `P1-1: the clause answered ${shown(absentProblems)} for a body missing \`documents\`, not exactly ONE problem NAMING it — an ` +
          `absence arm that does not name the member cannot red a missing grant line legibly`,
      )
    }

    // ---- (v) TOP-LEVEL ONLY, AND A COMMA INSIDE A VALUE/COMMENT NEVER SPLITS A MEMBER -----------------------------------
    const nested = [
      '{',
      '  // a comment, with a comma, that must never split this member',
      '  status: () => ({ nested: 1, other: "a,b" }),',
      '  documents(tool, args) { return args.tool === tool }',
      '}',
    ].join('\n')
    const nestedCensus = parseObjectMemberKeys(nested)
    if (nestedCensus.declared.includes('nested') || nestedCensus.declared.includes('other')) {
      problems.push(
        `P1-1: a NESTED object's key was read as a TOP-LEVEL member (census read: ${shown(nestedCensus)}) — the census is over the ` +
          `object literal's own members; a nested key is a different authority and would let a delegate certify itself`,
      )
    }
    if (!nestedCensus.declared.includes('status') || !nestedCensus.declared.includes('documents')) {
      problems.push(
        `P1-1: a longhand member beside a COMMENT carrying a comma, or a METHOD-SHORTHAND member, was not read (census read: ` +
          `${shown(nestedCensus)}) — comments are stripped first and both shapes are declarations`,
      )
    }

    expect(
      problems,
      `P1-1 — a member census grades DECLARATION SHAPES, never spellings (finding closed; §6's AUTHORING REFUSALS, \`D-43\`). ` +
        `${problems.length} problem(s). A longhand member and a SHORTHAND member must BOTH be certified present (the pre-pass regex ` +
        `\`[{,]\\s*name\\s*[:(]\` missed the shorthand — that is the finding, measured above), a SPREAD must make the census ` +
        `UNREADABLE with ONE named problem (never a silent absence, never a silent presence), an absent member must answer a problem ` +
        `naming it, and the COMPLIANT fixture must answer \`[]\` so the clause is not always-red. envelope/pure — fixtures only`,
    ).toEqual([])
  })
})

// ===========================================================================
// `X1b` — THE CONVERSE CLAUSE: `census ⊆ paintable`, over the REAL booted host (GREEN ON ARRIVAL BY DESIGN).
// ===========================================================================
describe('pane-gnosis — X1b: every census id is PAINTABLE — `updatePane(id)` never answers `operator-scope`/`not-a-pane` — proved falsifiable on two forged censuses', () => {
  it('X1b — over the REAL booted `SidebarPanes` host (whose registry carries the REAL `GnosisPanes` + `GnosisCrudPanes` registrations, exactly as `renderer.ts` installs them) EVERY id in the LIVE `REPLUMBED_PANE_IDS` answers a reason that is not `operator-scope` and not `not-a-pane`; the SAME clause answers a problem for `[...census, gnosis-status]` (the concrete dead-registration hazard, `F-5`) and for `[...census, a-pane-that-does-not-exist]`', async () => {
    // ⇒ GREEN ON ARRIVAL BY DESIGN: THIS IS A CLAUSE, NOT A PIN. It reds no landing today because today's census ids are all
    // paintable-or-transient; it exists to outlive a deliberate re-pin. `C3` catches TODAY'S form of the wrong move (a census of the
    // wrong SIZE, an operator pane named in it); `X1b` catches the class: an id in the census whose paint DOES NOT EXIST subscribes,
    // fires and paints nothing (`F-5` is the concrete case — `gnosis-status` answers `operator-scope`), and the containment clause
    // alone cannot see it.
    // ITS RED-ON-WRONG-LANDING ARM IS THE `gnosis-status` MUTANT: the clause is driven over a FORGED census that adds
    // `gnosis-status` and MUST answer a problem. That is the arm a landing which enters the operator pane will trip, and it is
    // proved HERE, on the same clause, rather than claimed in prose.
    // LAYER: envelope-class — the REAL host booted over the LAYOUT-LESS `dom-shim` against a recording runtime double; the reading is
    // the paint's OWN declared word (`updatePane`'s closed vocabulary). `painted`/`unchanged`/`not-enabled`/`not-mounted`/`no-runtime`
    // are all admissible (`not-mounted`/`no-runtime` are transient boot states and `not-enabled` is the registry's own census); the two
    // REFUSED words are `operator-scope` (the operator mount is `B-9`'s surface) and `not-a-pane` (no host registered it).
    const problems: string[] = []
    const loaded = await loadHostModule('X1b')
    problems.push(...loaded.problems)
    const liveCensus = loaded.module === null ? undefined : loaded.module[CENSUS_NAME]
    if (loaded.module !== null && (!Array.isArray(liveCensus) || !liveCensus.every((id) => typeof id === 'string'))) {
      problems.push(`X1b: \`${CENSUS_NAME}\` reads ${shown(liveCensus)}, not an array of pane ids — the clause has no subject`)
    }
    const censusIds: string[] = Array.isArray(liveCensus) ? (liveCensus as string[]).filter((id) => typeof id === 'string') : []
    if (censusIds.length === 0) {
      problems.push(
        `X1b: the LIVE census parsed EMPTY — "every census id is paintable" would be VACUOUSLY true, which is the vacuity the ` +
          `clause exists to refuse`,
      )
    }

    const drive = await bootChannelHost('X1b', { withRealPanes: true })
    try {
      problems.push(...drive.problems)
      if (drive.host !== null) {
        // THE LIVE CENSUS: every id must clear the two REFUSED words.
        problems.push(...censusPaintableProblems(drive.host, censusIds, 'the LIVE census', 'X1b'))
        // FALSIFIABILITY — THE TWO MUTANTS. Both are FORGED censuses (never contentions about today's value), and each must answer a
        // problem, or the clause is a sentence that can only ever be green.
        const operatorMutant = [...censusIds, 'gnosis-status']
        const operatorProblems = censusPaintableProblems(drive.host, operatorMutant, 'the forged census + `gnosis-status`', 'X1b·proof')
        if (operatorProblems.length === 0) {
          problems.push(
            `X1b·proof: the clause ACCEPTED the forged census ${shown(operatorMutant)} — \`gnosis-status\` is registered ` +
              `\`scope:'operator'\` (\`F-5\`), so \`updatePane('gnosis-status')\` answers \`operator-scope\` and a census that names it ` +
              `is a silently dead registration. A clause that cannot red THIS mutant cannot red the hazard the contract names`,
          )
        }
        const unknownMutant = [...censusIds, 'a-pane-that-does-not-exist']
        const unknownProblems = censusPaintableProblems(drive.host, unknownMutant, 'the forged census + an unregistered id', 'X1b·proof')
        if (unknownProblems.length === 0) {
          problems.push(
            `X1b·proof: the clause ACCEPTED the forged census ${shown(unknownMutant)} — an unregistered id answers \`not-a-pane\`, so any ` +
              `census entry no host registered must be a problem`,
          )
        }
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `X1b — the CONVERSE CLAUSE: \`census ⊆ paintable\` (\`P1-4\`/\`C5\`, authored by this pass; §6 \`X1b\`). ${problems.length} ` +
        `problem(s). Over the REAL booted host, EVERY id in the live \`${CENSUS_NAME}\` (${shown(censusIds)}) must answer ` +
        `\`updatePane(id)\` with a reason OTHER than \`operator-scope\`/\`not-a-pane\`, and the SAME clause must answer a problem for ` +
        `\`[...census, 'gnosis-status']\` (the concrete dead registration: \`F-5\`) and for \`[...census, 'a-pane-that-does-not-exist']\`. ` +
        `GREEN ON ARRIVAL BY DESIGN — a clause, not a pin; its red-on-wrong-landing arm is the \`gnosis-status\` mutant. envelope-class`,
    ).toEqual([])
  })
})
