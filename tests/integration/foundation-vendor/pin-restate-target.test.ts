// tests/integration/foundation-vendor/pin-restate-target.test.ts — the PIN-RESTATE unit's
// TARGET-STATE row (the state the unit will land), authored RED before the implementation.
//
// WHAT THIS FILE READS (and nothing else):
//   · `vendor/foundation.lock.json`                        — `foundation.commit` / `.measuredAt` / `.digestCommand`
//   · `git -C ../Provident-Electron rev-parse HEAD`         — READ AT RUN TIME, never hardcoded
//   · `git -C ../Provident-Electron show <lock commit>:src/shared/<name>.ts` — the fifteen blobs
//   · `src/shared/<name>.ts`                               — the fifteen vendored copies (bytes)
//   · `tests/pd-vendor-set.test.ts` · `tests/pd-vendor-manifest.test.ts` · `tests/pd-vendor-drift.test.ts`
//                                                          — each file's `PINNED_COMMIT` declaration
//   · `docs/specs/unit-pd-vendor-pin-refresh.md`           — the ANCHORED `§4` region only
//   · `tests/pd-vendor-pin-refresh-register.test.ts`       — the `§4 row 2 (G-3)` row's own clause-count
//                                                            assertions (the coupling that must not drift)
//
// WHAT IT DOES NOT DO: it mocks NOTHING (never `'electron'`), it reads NEITHER `vitest.config.ts`
// NOR `package.json`, it adds no dependency and it touches no network. The only run-time tree reads
// are the two `git` spawns named in limbs A and F.
//
// THE SIX LIMBS (one `it` each):
//   A — the lock's `foundation.commit` EQUALS the adjacent tree's HEAD, read at run time. Both
//       revisions are printed on failure; the expected revision is never a literal in this file.
//   B — `foundation.measuredAt` equals this unit's declared run day (the day this unit's run read;
//       the run's own local day is authoritative per the corpus's A-12 rule, and is corrected in
//       place here if a later run's local day differs).
//   C — `foundation.digestCommand` carries exactly ONE DISTINCT 40-hex literal, and it IS the
//       lock's `foundation.commit` — the guard against a partially-restated pin.
//   D — each of the three pin sites carries exactly ONE `const PINNED_COMMIT = '<40 hex>'`
//       declaration, and that literal is the lock's `foundation.commit` (agreement, never a
//       hardcoded revision).
//   E — the REGISTER COUPLING: measured from the contract's anchored `§4` region and from the
//       register source — exactly 6 `declared refresh reading` clauses, 6 distinct dates, the
//       GOVERNING reading equal to the lock's `foundation.measuredAt`, and the register's own two
//       clause-count assertions reading the same number. A NON-VACUITY control drives the clause
//       counter over a synthetic 2-clause region.
//   F — for each of the fifteen modules, the local `src/shared/<name>.ts` BYTES equal the blob at
//       the lock's `foundation.commit`. The byte-identity guard: GREEN before and after.
//
// LAYER (RCA-12): `[T]` / source-layer. A byte-identity and a pin-reading; it proves NOTHING about
// consumer behaviour and it is NOT app-green.
//
// COLOURS AT THE AUTHORING HEAD (the implementer's target is the inverse of A/B/E): A, B and E are
// expected RED at this head (the lock still pins a revision that is NOT the adjacent tree's HEAD —
// both are printed by limb A at run time, never restated here — its `measuredAt` is still the prior
// run day `2026-11-16`, and the `§4` region still carries 5 clauses); C, D and F are
// green-on-arrival guards. No limb is relaxed to change a colour.

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

// ---------------------------------------------------------------------------
// WHERE THE FILES ARE. `tests/integration/foundation-vendor/<this file>` → the repo
// root is three levels up; the foundation tree is the repo's ADJACENT sibling.
// ---------------------------------------------------------------------------
const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..', '..')
const FOUNDATION_DIR = resolve(REPO_ROOT, '..', 'Provident-Electron')
const LOCK_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')
const SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-pd-vendor-pin-refresh.md')
const REGISTER_PATH = join(REPO_ROOT, 'tests', 'pd-vendor-pin-refresh-register.test.ts')

/** Limb D's three pin sites — the files whose `PINNED_COMMIT` constant must agree with the lock. */
const PIN_SITE_PATHS = [
  join(REPO_ROOT, 'tests', 'pd-vendor-set.test.ts'),
  join(REPO_ROOT, 'tests', 'pd-vendor-manifest.test.ts'),
  join(REPO_ROOT, 'tests', 'pd-vendor-drift.test.ts'),
]

/** Limbs F (and D's agreement) — the fifteen vendored modules, in the lock's own order. */
const PINNED_FIFTEEN = [
  'census',
  'container',
  'focus-model',
  'gesture-session',
  'gutter',
  'gutter-affordance',
  'layout-projection',
  'menu-template',
  'mount-invariant-guard',
  'overlay',
  'owned-list-host',
  'relocate',
  'slot-host',
  'theme',
  'zones',
] as const

/** Limb B — THE DAY THIS UNIT'S RUN READ: `date +%F` returned `2026-11-18` when this row was
 *  re-pointed, and the run's own LOCAL day is authoritative (the corpus's A-12 rule), never a UTC
 *  day. If a later run's local day differs, THIS LITERAL is corrected in place — the limb asserts
 *  the unit's run day, never a stale one. */
const UNIT_DAY = '2026-11-18'

// ---------------------------------------------------------------------------
// SMALL READERS
// ---------------------------------------------------------------------------
function errorText(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error)
}

function readText(path: string): string {
  try {
    return readFileSync(path, 'utf8')
  } catch (error) {
    throw new Error(`cannot read ${path} — ${errorText(error)}`)
  }
}

function md5(bytes: Buffer): string {
  return createHash('md5').update(bytes).digest('hex')
}

type LockFoundation = { commit: string; measuredAt: string; digestCommand: string }

/** The lock's `foundation` block, READ AT RUN TIME. An absent or ill-typed field is a loud
 *  failure naming the field: a limb with no declared subject may never pass vacuously. */
function readLock(): LockFoundation {
  const text = readText(LOCK_PATH)
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    throw new Error(`vendor/foundation.lock.json is not parseable JSON — ${errorText(error)}`)
  }
  const foundation = (parsed as { foundation?: Record<string, unknown> }).foundation
  if (foundation === undefined || foundation === null || typeof foundation !== 'object') {
    throw new Error('vendor/foundation.lock.json carries no `foundation` block — the pin has no declared subject')
  }
  const pick = (field: string): string => {
    const value = foundation[field]
    if (typeof value !== 'string') {
      throw new Error(`vendor/foundation.lock.json's \`foundation.${field}\` is ${JSON.stringify(value)} — not a string (this limb cannot take a reading)`)
    }
    return value
  }
  return { commit: pick('commit'), measuredAt: pick('measuredAt'), digestCommand: pick('digestCommand') }
}

type GitTextResult = { ok: boolean; stdout: string; stderr: string; status: number | null; error: string | null }

function gitText(args: string[]): GitTextResult {
  const result = spawnSync('git', args, { encoding: 'utf8' })
  return {
    ok: result.error === undefined && result.status === 0,
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? '').trim(),
    status: result.status,
    error: result.error === undefined ? null : result.error.message,
  }
}

/** Limb A — the adjacent tree's HEAD, READ AT RUN TIME. Never a literal in this file. */
function foundationHead(): { ok: boolean; head: string | null; detail: string } {
  const read = gitText(['-C', FOUNDATION_DIR, 'rev-parse', 'HEAD'])
  if (read.error !== null) return { ok: false, head: null, detail: `spawn error: ${read.error}` }
  if (read.status !== 0) return { ok: false, head: null, detail: `git exited ${String(read.status)}${read.stderr === '' ? '' : `: ${read.stderr}`}` }
  if (!/^[0-9a-f]{40}$/.test(read.stdout)) return { ok: false, head: null, detail: `git printed ${JSON.stringify(read.stdout)}, which is not a 40-hex revision` }
  return { ok: true, head: read.stdout, detail: `read ${read.stdout}` }
}

/** Limb F — one blob's BYTES at a revision. An unreadable blob is a named failure, never a skip. */
function gitBlob(revisionAndPath: string): { ok: boolean; bytes: Buffer; detail: string } {
  const result = spawnSync('git', ['-C', FOUNDATION_DIR, 'show', revisionAndPath], { maxBuffer: 8 * 1024 * 1024 })
  const bytes = Buffer.isBuffer(result.stdout) ? result.stdout : Buffer.alloc(0)
  const stderr = (Buffer.isBuffer(result.stderr) ? result.stderr.toString('utf8') : String(result.stderr ?? '')).trim()
  if (result.error !== undefined) return { ok: false, bytes, detail: `spawn error: ${result.error.message}` }
  if (result.status !== 0) return { ok: false, bytes, detail: `git show exited ${String(result.status)}${stderr === '' ? '' : `: ${stderr}`}` }
  if (bytes.length === 0) return { ok: false, bytes, detail: 'git show printed 0 bytes — an unreadable/absent blob is not an empty one' }
  return { ok: true, bytes, detail: `read ${bytes.length} bytes` }
}

// ---------------------------------------------------------------------------
// LIMB C / D — THE 40-HEX LITERAL READERS. The literal is BOUNDED on both sides, so the first
// 40 characters of a 64-hex string are never read as a commit; the declaration reader drops
// `//`-comment lines first, so a PROSE mention of a literal is never read as a DECLARATION.
// ---------------------------------------------------------------------------
const EXACT_FORTY_HEX = /(?<![0-9a-fA-F])[0-9a-fA-F]{40}(?![0-9a-fA-F])/g
const PINNED_COMMIT_DECLARATION = /const\s+PINNED_COMMIT\s*=\s*['"]([0-9a-fA-F]{40})['"]/g

function exactFortyHexLiterals(text: string): string[] {
  return [...new Set([...text.matchAll(EXACT_FORTY_HEX)].map((match) => match[0].toLowerCase()))]
}

function hexRunsAtLeast16(text: string): string[] {
  return [...text.matchAll(/[0-9a-fA-F]{16,}/g)].map((match) => match[0])
}

function withoutLineComments(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/^[ \t]*\/\//.test(line))
    .join('\n')
}

// ---------------------------------------------------------------------------
// LIMB E — THE ANCHORED `§4` REGION, and the register's OWN clause rule MIRRORED.
//
// The region is addressed by its own headings (never a whole-file regex): from the FIRST line
// beginning `## 4. The typed Property register` up to — NOT including — the line beginning
// `## 5. The layer ledger`. A missing heading is reported by name, never read as an empty region.
// ---------------------------------------------------------------------------
type RegionRead = { text: string; detail: string; problem: string | null }

function specRegion(specText: string, startHeading: string, endHeading: string): RegionRead {
  const lines = specText.split('\n')
  let offset = 0
  let start = -1
  let end = -1
  for (const line of lines) {
    if (start < 0 && line.startsWith(startHeading)) {
      start = offset
    } else if (start >= 0 && line.startsWith(endHeading)) {
      end = offset
      break
    }
    offset += line.length + 1
  }
  if (start < 0) {
    return {
      text: '',
      detail: '',
      problem: `the contract carries no line beginning \`${startHeading}\` — the anchored region has lost its start heading (this limb must RED, never pass vacuously)`,
    }
  }
  if (end < 0) {
    return {
      text: '',
      detail: '',
      problem: `the contract carries no line beginning \`${endHeading}\` AFTER \`${startHeading}\` — the anchored region has no upper bound (this limb must RED, never pass vacuously)`,
    }
  }
  const text = specText.slice(start, end)
  return { text, detail: `anchored region ${startHeading} … ${endHeading} (${text.length} chars)`, problem: null }
}

// — the register's rule, MIRRORED from `tests/pd-vendor-pin-refresh-register.test.ts` —
// `declaredReadingClauses` (its constants, its bounded date window ending at the NEXT phrase, its
// bounded look-behind) and `clauseNamesItsReadingSuperseded` (the marker immediately beside the
// clause's OWN cited date, either just before its phrase or just after its date).
const DECLARED_READING_PHRASE = /declared refresh\s+reading/g
const DECLARED_READING_PHRASE_TEXT = 'declared refresh reading'
const DECLARED_READING_WINDOW = 120
const DECLARED_READING_AFTER_CONTEXT = 40
const SUPERSEDED_LOOKBEHIND = 40
const SUPERSEDED_MARKER = /\bsuperseded\b|\bsuperseding\b|\(superseded\)/i
const SUPERSEDED_BEFORE_WINDOW = 60
const SUPERSEDED_AFTER_WINDOW = 40

type DeclaredReadingClause = { phrase: string; date: string; text: string; lookBehind: string }

function declaredReadingClauses(regionText: string): DeclaredReadingClause[] {
  const phrases = [...regionText.matchAll(DECLARED_READING_PHRASE)]
  const out: DeclaredReadingClause[] = []
  for (let index = 0; index < phrases.length; index++) {
    const match = phrases[index]!
    const at = match.index!
    const nextAt = index + 1 < phrases.length ? phrases[index + 1]!.index! : regionText.length
    const phraseEnd = at + match[0].length
    // a clause's date must sit in ITS OWN span: the window opens at the phrase's END and stops at
    // the NEXT phrase, so a clause stating no date of its own can never absorb the next one's
    const dateWindow = regionText.slice(phraseEnd, Math.min(nextAt, phraseEnd + DECLARED_READING_WINDOW))
    const found = /\d{4}-\d{2}-\d{2}/.exec(dateWindow)
    if (found === null) continue
    const dateAt = phraseEnd + found.index
    const lookBehind = regionText.slice(Math.max(0, at - SUPERSEDED_LOOKBEHIND), at)
    out.push({
      phrase: match[0],
      date: found[0],
      text: regionText.slice(at, dateAt + found[0].length + DECLARED_READING_AFTER_CONTEXT),
      lookBehind,
    })
  }
  return out
}

function clauseNamesItsReadingSuperseded(clause: { text: string; lookBehind: string }): boolean {
  const parts = /([\s\S]*?)(\d{4}-\d{2}-\d{2})([\s\S]*)/.exec(clause.text)
  if (parts === null) return false
  const before = `${clause.lookBehind}${parts[1]!}`
  const after = parts[3]!
  const beforeLine = before.split('\n').pop() ?? ''
  const afterLine = after.split('\n')[0] ?? ''
  const phraseAt = beforeLine.lastIndexOf(DECLARED_READING_PHRASE_TEXT)
  const lineBefore = phraseAt < 0 ? beforeLine : beforeLine.slice(0, phraseAt)
  return (
    SUPERSEDED_MARKER.test(lineBefore.slice(-SUPERSEDED_BEFORE_WINDOW)) ||
    SUPERSEDED_MARKER.test(afterLine.slice(0, SUPERSEDED_AFTER_WINDOW))
  )
}

/** The register's GOVERNING rule, mirrored: among a region's clauses, the LAST clause that does
 *  NOT name its own cited date superseded governs; the last clause governs only when EVERY clause
 *  does. */
function governingReadingFromRegionText(regionText: string): { reading: string | null; clauses: DeclaredReadingClause[]; detail: string } {
  const clauses = declaredReadingClauses(regionText)
  if (clauses.length === 0) {
    return { reading: null, clauses, detail: 'the region carries no `declared refresh reading (<YYYY-MM-DD>)` clause — the governing reading has no subject' }
  }
  const nonSuperseded = clauses.map((_, index) => index).filter((index) => !clauseNamesItsReadingSuperseded(clauses[index]!))
  const governing = nonSuperseded.length > 0 ? nonSuperseded[nonSuperseded.length - 1]! : clauses.length - 1
  const reading = clauses[governing]!.date
  return {
    reading,
    clauses,
    detail:
      `the governing declared refresh reading is ${reading} (clause ${governing + 1} of ${clauses.length}; ` +
      `${clauses.length - nonSuperseded.length} of them name their own reading superseded` +
      `${nonSuperseded.length === 0 ? ' — ALL of them do, so the LAST governs' : ''}; ` +
      `dates read: [${clauses.map((clause) => clause.date).join(', ')}])`,
  }
}

// ---------------------------------------------------------------------------
// LIMB E's COUPLING — the register file's OWN clause-count assertions, extracted from the
// `it(...)` row titled `§4 row 2 (G-3)`. The numeric argument of the `.toBe(<n>)` that
// IMMEDIATELY FOLLOWS a named expression; an absent needle is a loud failure, never a pass.
// ---------------------------------------------------------------------------
type NumericAssertionRead = { found: boolean; value: number | null; snippet: string }

function rowBlockOf(source: string, rowTitleNeedle: string): { found: boolean; block: string; detail: string } {
  const opener = `it('${rowTitleNeedle}`
  const at = source.indexOf(opener)
  if (at < 0) return { found: false, block: '', detail: `the register carries no \`it('${rowTitleNeedle}…')\` row — the coupling limb has lost its subject` }
  const nextAt = source.indexOf('\n  it(', at)
  const end = nextAt < 0 ? source.length : nextAt
  return { found: true, block: source.slice(at, end), detail: `row \`${rowTitleNeedle}\` spans ${end - at} chars` }
}

function numericToBeAfter(source: string, needle: string): NumericAssertionRead {
  const at = source.indexOf(needle)
  if (at < 0) return { found: false, value: null, snippet: `no \`${needle}\` in the row` }
  const toBeAt = source.indexOf('.toBe(', at)
  if (toBeAt < 0) return { found: false, value: null, snippet: `no \`.toBe(<n>)\` after \`${needle}\` — read: ${JSON.stringify(source.slice(at, at + 160))}` }
  const after = source.slice(toBeAt + '.toBe('.length)
  const arg = /^\s*(\d+)\s*\)/.exec(after)
  if (arg === null) return { found: false, value: null, snippet: `the \`.toBe(\` after \`${needle}\` does not take a numeric literal — read: ${JSON.stringify(after.slice(0, 80))}` }
  return { found: true, value: Number(arg[1]), snippet: `${needle} … .toBe(${arg[1]})` }
}

// ---------------------------------------------------------------------------
// THE SIX LIMBS
// ---------------------------------------------------------------------------
describe('PIN-RESTATE TARGET — the unit’s landed state, asserted from the lock, the adjacent tree and the contract (authored RED; limbs A/B/E are the target reds, C/D/F the green-on-arrival guards)', () => {
  it('A — `vendor/foundation.lock.json`’s `foundation.commit` equals the adjacent tree’s HEAD, read AT RUN TIME via `git -C ../Provident-Electron rev-parse HEAD` (never a hardcoded revision)', () => {
    const lock = readLock()
    const revision = foundationHead()
    expect(
      revision.ok,
      `A: \`git -C ${FOUNDATION_DIR} rev-parse HEAD\` must be readable at run time — ${revision.detail}. The expected revision is READ here, never a literal in this file.`,
    ).toBe(true)
    const readAtRunTime = String(revision.head)
    expect(
      lock.commit,
      `A: \`vendor/foundation.lock.json\`’s \`foundation.commit\` is ${lock.commit} while \`git -C ../Provident-Electron rev-parse HEAD\` read at run time is ${readAtRunTime} — the pin names a revision that is NOT the adjacent tree’s HEAD. BOTH revisions are printed here: pinned ${lock.commit} · HEAD ${readAtRunTime}.`,
    ).toBe(readAtRunTime)
  })

  it('B — `vendor/foundation.lock.json`’s `foundation.measuredAt` equals this unit’s declared run day (2026-11-18, the day this unit’s run read)', () => {
    const lock = readLock()
    expect(
      lock.measuredAt,
      `B: \`vendor/foundation.lock.json\`’s \`foundation.measuredAt\` is ${lock.measuredAt} while this unit’s declared run day (\`date +%F\`, the run’s own LOCAL day — authoritative per A-12) is ${UNIT_DAY} — the recorded day is not the day this refresh read.`,
    ).toBe(UNIT_DAY)
  })

  it('C — `vendor/foundation.lock.json`’s `foundation.digestCommand` carries exactly ONE DISTINCT 40-hex literal, and that literal IS the lock’s `foundation.commit` (a partially-restated pin reds here)', () => {
    const lock = readLock()
    const exact = exactFortyHexLiterals(lock.digestCommand)
    const overlong = hexRunsAtLeast16(lock.digestCommand).filter((run) => run.length > 40)
    expect(
      exact.length,
      `C: \`foundation.digestCommand\` must carry EXACTLY ONE DISTINCT 40-hex literal (the revision it was run at); it carries ${exact.length}: [${exact.join(', ') || 'none'}]` +
        `${overlong.length > 0 ? ` — plus ${overlong.length} hex run(s) LONGER than 40 (${overlong.map((run) => `${run.slice(0, 8)}… ${run.length} hex`).join(', ')}), which name no commit git can resolve` : ''}`,
    ).toBe(1)
    expect(
      exact[0],
      `C: \`foundation.digestCommand\` carries the single 40-hex literal ${String(exact[0])}, which is NOT the lock’s \`foundation.commit\` ${lock.commit} — a PARTIAL restatement of the pin.`,
    ).toBe(lock.commit)
  })

  it('D — each of the three pin sites (`tests/pd-vendor-set.test.ts`, `tests/pd-vendor-manifest.test.ts`, `tests/pd-vendor-drift.test.ts`) carries exactly ONE `const PINNED_COMMIT = \'<40 hex>\'` declaration, and it equals the lock’s `foundation.commit` (agreement, never a hardcoded revision)', () => {
    const lock = readLock()
    for (const path of PIN_SITE_PATHS) {
      const site = relative(REPO_ROOT, path)
      const text = withoutLineComments(readText(path))
      const declarations = [...text.matchAll(PINNED_COMMIT_DECLARATION)]
      expect(
        declarations.length,
        `D: ${site} must carry exactly ONE \`const PINNED_COMMIT = '<40 hex>'\` declaration — read ${declarations.length}` +
          `${declarations.length > 1 ? ` (${declarations.map((match) => String(match[1]).toLowerCase()).join(', ')}) — one file, two authorities` : ''}.`,
      ).toBe(1)
      const literal = String(declarations[0]![1]).toLowerCase()
      expect(
        literal,
        `D: ${site}’s \`PINNED_COMMIT\` declaration reads ${literal} while the lock’s \`foundation.commit\` is ${lock.commit} — the site and the pin disagree.`,
      ).toBe(lock.commit)
    }
  })

  it('E — the register coupling: the contract’s anchored `§4` region carries exactly 6 `declared refresh reading` clauses with 6 distinct dates, its GOVERNING reading equals the lock’s `foundation.measuredAt`, and the register’s own two clause-count assertions read the same number', () => {
    // -----------------------------------------------------------------------
    // NON-VACUITY CONTROL FIRST: a counter that always returns the expected number must be
    // shown to discriminate, so it is driven over a synthetic region carrying only TWO clauses.
    // -----------------------------------------------------------------------
    const syntheticRegion =
      '⟨A synthetic §4 region — the non-vacuity control for the clause counter.⟩\n' +
      "the contract's declared refresh reading (2026-01-31) SUPERSEDES the as-filed declaration.\n" +
      'The SUPERSEDED declared refresh reading (2026-01-01) is kept visible beside it, never the governing clause.\n'
    const syntheticClauses = declaredReadingClauses(syntheticRegion)
    expect(
      syntheticClauses.length,
      `E: NON-VACUITY control — the clause counter must read the synthetic region’s TWO clauses, not the contract’s count; it read ${syntheticClauses.length}: [${syntheticClauses.map((clause) => clause.date).join(', ')}].`,
    ).toBe(2)
    expect(
      syntheticClauses.map((clause) => clause.date),
      'E: NON-VACUITY control — the synthetic region’s clauses are the two dates it states, in order.',
    ).toEqual(['2026-01-31', '2026-01-01'])

    // -----------------------------------------------------------------------
    // THE CONTRACT'S OWN ANCHORED `§4` REGION.
    // -----------------------------------------------------------------------
    const specText = readText(SPEC_PATH)
    const region = specRegion(specText, '## 4. The typed Property register', '## 5. The layer ledger')
    expect(
      region.problem,
      `E: the anchored \`§4\` region of \`docs/specs/unit-pd-vendor-pin-refresh.md\` must be readable — ${String(region.problem)}.`,
    ).toBeNull()
    expect(
      region.text,
      `E: the anchored \`§4\` region of \`docs/specs/unit-pd-vendor-pin-refresh.md\` must be non-empty (${region.detail}) — an empty region is a lost subject, never a pass.`,
    ).not.toBe('')

    const measured = governingReadingFromRegionText(region.text)
    const clauseDates = measured.clauses.map((clause) => clause.date)
    expect(
      measured.clauses.length,
      `E: the anchored §4 region (${region.detail}) must carry EXACTLY 6 \`declared refresh reading (<YYYY-MM-DD>)\` clauses — the five readings it keeps visible PLUS this unit’s re-anchoring clause; it carried ${measured.clauses.length}: [${clauseDates.join(', ')}].`,
    ).toBe(6)
    expect(
      new Set(clauseDates).size,
      `E: the region must cite 6 DISTINCT dates (one per refresh it keeps visible); it cited ${new Set(clauseDates).size} over [${clauseDates.join(', ')}].`,
    ).toBe(6)
    const lock = readLock()
    expect(
      measured.reading,
      `E: the GOVERNING declared refresh reading (${measured.detail}) must equal the lock’s \`foundation.measuredAt\` ${lock.measuredAt} — this is the coupling the register’s own \`measuredAt\` limb enforces.`,
    ).toBe(lock.measuredAt)

    // -----------------------------------------------------------------------
    // THE REGISTER'S OWN TWO CLAUSE-COUNT ASSERTIONS — they must read the SAME number the region
    // delivers, so the register and the region cannot silently disagree.
    // -----------------------------------------------------------------------
    const registerSource = readText(REGISTER_PATH)
    const row = rowBlockOf(registerSource, '§4 row 2 (`G-3`)')
    expect(
      row.found,
      `E: ${row.detail} — the register file \`tests/pd-vendor-pin-refresh-register.test.ts\` must carry the \`§4 row 2 (G-3)\` it-row whose clause-count assertions this limb couples to.`,
    ).toBe(true)

    const clauseCountAssertion = numericToBeAfter(row.block, 'realClauses.length')
    expect(
      clauseCountAssertion.found,
      `E: the register’s \`§4 row 2 (G-3)\` row must carry a \`.toBe(<n>)\` that immediately follows \`realClauses.length\` — ${clauseCountAssertion.snippet}.`,
    ).toBe(true)
    expect(
      clauseCountAssertion.value,
      `E: the register’s \`realClauses.length\` assertion (${clauseCountAssertion.snippet}) reads ${String(clauseCountAssertion.value)} while the anchored §4 region delivers ${measured.clauses.length} clauses [${clauseDates.join(', ')}] — the register and the region disagree.`,
    ).toBe(measured.clauses.length)

    const dateCountAssertion = numericToBeAfter(row.block, 'new Set(realClauseDates).size')
    expect(
      dateCountAssertion.found,
      `E: the register’s \`§4 row 2 (G-3)\` row must carry a \`.toBe(<n>)\` that immediately follows \`new Set(realClauseDates).size\` — ${dateCountAssertion.snippet}.`,
    ).toBe(true)
    expect(
      dateCountAssertion.value,
      `E: the register’s \`new Set(realClauseDates).size\` assertion (${dateCountAssertion.snippet}) reads ${String(dateCountAssertion.value)} while the anchored §4 region delivers ${new Set(clauseDates).size} distinct dates [${clauseDates.join(', ')}] — the register and the region disagree.`,
    ).toBe(new Set(clauseDates).size)
  })

  it('F — for each of the fifteen modules, the local `src/shared/<name>.ts` BYTES equal `git -C ../Provident-Electron show <lock foundation.commit>:src/shared/<name>.ts` (the byte-identity guard)', () => {
    const lock = readLock()
    const problems: string[] = []
    let driven = 0
    for (const name of PINNED_FIFTEEN) {
      const localPath = join(REPO_ROOT, 'src', 'shared', `${name}.ts`)
      let local: Buffer
      try {
        local = readFileSync(localPath)
      } catch (error) {
        problems.push(`${name}: the local absent/unreadable copy \`${localPath}\` — ${errorText(error)}`)
        continue
      }
      const revisionAndPath = `${lock.commit}:src/shared/${name}.ts`
      const blob = gitBlob(revisionAndPath)
      if (!blob.ok) {
        problems.push(`${name}: \`git -C ../Provident-Electron show ${revisionAndPath}\` is unreadable — ${blob.detail}`)
        continue
      }
      driven += 1
      if (!local.equals(blob.bytes)) {
        problems.push(
          `${name}: the local bytes (md5 ${md5(local)}, ${local.length} bytes) DIFFER from the blob at ${lock.commit} (md5 ${md5(blob.bytes)}, ${blob.bytes.length} bytes)`,
        )
      }
    }
    expect(
      driven,
      `F: the byte-identity sweep must have compared FIFTEEN readable blobs; it compared ${driven} (${PINNED_FIFTEEN.length} modules were attempted, each failure named above/below).`,
    ).toBe(15)
    expect(
      problems,
      `F: all fifteen vendored \`src/shared/<name>.ts\` files must be BYTE-EQUAL to the blob at the lock’s \`foundation.commit\` ${lock.commit} — ${problems.length} problem(s): ${problems.join(' · ')}`,
    ).toEqual([])
  })
})
