// tests/integration/foundation-vendor/conformance-refresh-register.test.ts — THE MISSING
// INSTRUMENT for strata unit `V-2` `conformance-refresh`: the register that gates (a) whether
// the vendored conformance copies still ARE the pinned commit's bytes, and (b) whether
// `vendor/foundation.lock.json`'s `conformance` block is a FAITHFUL, COMPLETE and NON-STALE
// statement of the pinned tree's suite universe.
//
// WHAT THIS FILE READS (and nothing else):
//   · `vendor/foundation.lock.json` — `foundation.commit` (THE PIN, read at run time — it is
//     never a literal in this file), `foundation.path`, `modules[].name`,
//     `baselineFilesNotReplaced`, and the `conformance` block itself
//   · `vendor/Provident-Electron/tests/*.test.ts` — the vendored copies (existence, lstat
//     regularity, size, md5, and — for arm `G` — their text)
//   · `git -C <foundation> ls-tree -r --name-only <pin>:tests/` — the pinned SUITE UNIVERSE
//   · `git -C <foundation> cat-file --batch` over `<pin>:tests/<suite>` and
//     `<old pin>:tests/<suite>` — the pin blobs' BYTES and TEXT (one batched spawn, memoized)
//   · THIS FILE's own source — arm `G` reads it to assert its declared layer and the absence of
//     any claim that the conformance leg passed
//
// WHAT IT DOES NOT DO: it mocks NOTHING (it never writes `vi.mock(…)` and never names the
// `'electron'` module), it imports NO `src/**` module, it reads NEITHER `vitest.config.ts` NOR
// `package.json` NOR any spec file's bytes, it adds no dependency, it touches no network, and it
// writes nothing anywhere. The only run-time spawns are (i) READ-ONLY `git` in the adjacent
// foundation tree and (ii) ONE `node` child process in arm `F` whose ONLY job is to run the
// corpus's own AST oracle `importSpecifiers` from `scripts/foundation-drift.mjs` — reached
// through that child, never imported here. The adjacent tree is never checked out, staged,
// committed, fetched or installed into.
//
// THE EIGHT ARMS (ids `A`…`H`, one `it` each):
//   A — THE COPIES ARE THE PINNED BYTES. For every suite the block declares INCLUDED: the local
//       file exists, is a REGULAR FILE (an `lstat` symlink check — `readFileSync` dereferences and
//       cannot see one), is non-empty, and its md5 equals the md5 of `git show <pin>:tests/<suite>`.
//       The number of suites actually compared must equal `included.length` (a silent skip is a
//       failure). ANTI-VACUITY CONTROL IN THE SAME ARM: the eleven pin blobs must DIFFER from the
//       OLD pin's blobs, so the comparison cannot be passing by comparing a revision to itself.
//       ABSENT-TREE CLAUSE (the corpus's honesty rule 1, mirroring `scripts/foundation-drift.mjs`):
//       if `<foundation>` is not a readable directory the arm does NOT pass silently and does NOT
//       fail the unit — it prints a loud `SKIPPED` reason, asserts the reason is non-empty and
//       asserts that a present tree would have taken all eleven readings.
//   B — THE EXCLUSIONS ARE REAL ABSENCES. For every suite the block declares EXCLUDED, no file
//       exists at the leg's flat placement; four rows, each carrying a non-empty `reason`.
//   C — NO SUITE IS SILENTLY SKIPPED. The pin's `tests/` + `**` + `/*.test.ts` universe (read from the
//       object store, not from this repo) must be disposed EXACTLY ONCE across
//       `included`/`excluded`/`notAdmitted`: no undisposed member, no phantom name, no repeat.
//       THE RETIREMENT HALF, IN THE SAME ARM: the block's `outOfUniverse` key must EXIST and every
//       row of it must be a `{suite, reason}` with a non-empty `reason`, a `suite` that is ABSENT
//       from the pin's universe and REPEATS nowhere else in the block. The phantom check above
//       refuses a disposition that names a non-member, so a corpus-named suite the pin no longer
//       carries has exactly ONE lawful home — this key — and the "no longer exists" claim is
//       therefore verified against the pin rather than read as prose.
//   D — THE BLOCK AGREES WITH THE DIRECTORY. The on-disk `*.test.ts` set IS the `included` set,
//       and it intersects neither `excluded` nor `notAdmitted`.
//   E — THE BLOCK IS NOT STALE. `conformance.revision` is PRESENT AS A KEY, is 40-hex, and equals
//       the lock's `foundation.commit`; `leg`/`config`/`placement` are their pinned values and
//       `derivation` is a non-empty string.
//   F — THE SPLIT IS RE-DERIVED FROM THE BYTES, NOT COPIED. (i) every INCLUDED suite's
//       module-under-test specifiers at the pin are in the vendored set; (ii) every EXCLUDED
//       suite still carries an out-of-set specifier on the relative `src/` path; (iii) every
//       `notAdmitted` row's `criterion` tag is mechanically re-checked against that suite's pin
//       blob — AND THE TWO IMPORT TAGS (`foundation-tree-import`, `divergent-baseline-import`) ARE
//       SATISFIABLE ONLY BY A REAL IMPORT READING: the check applies the SAME `NON_IMPORT_KINDS`
//       exclusion `F(i)`/`F(ii)` apply through `moduleUnderTestReadings`, so a
//       `new URL('../src/renderer/x.ts', import.meta.url)` / `path-filename` reading is a PATH
//       PROBE, not an import, and cannot justify an import criterion. A tag a non-import reading
//       can satisfy is not evidence about the suite's import closure: a "headstone" row that
//       ASSERTS THE ABSENCE of a path the pin deleted
//       (`expect(existsSync(new URL('../src/renderer/store-core-graph.ts', import.meta.url)), …)
//       .toBe(false)`) proves the opposite of an import and must be classed `recorded` with the
//       corpus ruling, not `foundation-tree-import`. `nested` and `no-in-set-specifier` read the
//       name and the full reading list; `recorded` is BOUNDED (the adversarial pass's ONE material
//       finding, §7.7 `A-1`): it is a corpus ruling a machine cannot re-derive, so it is admissible
//       ONLY where NO re-derivable criterion holds — a `recorded` row must carry no real
//       `^(\.\./)+src/(main|renderer)/` import, no real `^(\.\./)+src/shared/(dom-shim|demo-envelope|
//       path-fork-cycle|types)\.(js|ts)$` import, MUST carry at least one specifier onto the vendored
//       fifteen (so `no-in-set-specifier` does not hold either) and must NOT be nested. Where the
//       bytes can classify a suite, they classify it: `recorded` is a ruling, not a hiding place, and
//       the limb names the criterion the bytes DO satisfy and the corpus ruling a lawful `recorded`
//       row is expected to cite in its `reason`;
//       (iv) a DIFFERENTIAL CONTROL against the corpus's own AST oracle `importSpecifiers`,
//       with an enumerated list of the extra forms this file's reader knows and the oracle does
//       not.
//   G — THE NO-GREEN-WORD AND PROHIBITION ARM. No vendored copy carries the `R-4`/`X-9`
//       prohibition's forbidden electron mock, and this register's own source declares its layer,
//       is not truncated, and carries no claim that the conformance leg passed.
//   H — THE AUXILIARY ROWS ARE WELL-FORMED. The block's `caveats` key must EXIST, every row of it
//       must name a suite the block itself declares INCLUDED (a caveat on an EXCLUDED or
//       undeclared suite is a misplaced claim: it says nothing about a row the leg runs), carry a
//       non-empty `reason`, repeat no suite, and collide with no disposition; and every
//       `outOfUniverse` row carries a non-empty `reason` and a name ABSENT from the pin's universe
//       (the presence half of that key is arm `C`'s).
//
// NO CENSUS IS HARDCODED ANYWHERE — AND THE `> 0`-ONLY FLOOR IS THE RULE FOR `C`/`H`, NOT FOR THE
// WHOLE FILE. Stated exactly, because the earlier "the only non-vacuity floors are `> 0`" was false
// of this file's own arms (`docs/L1/unit-v-2-conformance-refresh.md` §7.7 finding `A-2`): arms `A`
// and `B` DO carry exact numeric floors — `.toBe(11)` on `A`'s anti-vacuity count,
// `.toBe(included.length)` on `A`'s compared tally, and `.toBe(4)` on `B`'s exclusion rows — and
// they are KEPT, because each RE-STATES BY NAME the membership `tests/pd-vendor-set.test.ts`'s
// landed `§3.5` arms already pin (eleven INCLUDED suites, four EXCLUDED suites). Those numbers are
// therefore a quotation of a landed constraint this register may not write, not a measurement the
// register derived: if the block moved either count, a landed suite reds whatever this file says.
// A CENSUS — the class table, the per-class counts, "exactly seven out-of-universe rows", "exactly
// four caveats" — is hardcoded NOWHERE. Arms `C`/`H` assert the SHAPE and the MEMBERSHIP RULES of
// the auxiliary rows, and their only numeric asserts are non-vacuity floors (`> 0`): a hardcoded
// census would be today's count re-typed as an oracle, so it would RED the day a corpus suite is
// retired or a residue is recorded — telling the next reader that a fresh measurement is a failure
// — and it would PASS while the block said nothing useful (four rows of the wrong shape). The
// instrument must gate the PROPERTY — every claimed retirement is really absent from the pin, every
// claimed caveat is on a suite the leg actually runs — so the census is printed for the reader and
// never asserted, and a `> 0` floor is a shape rule (an empty list satisfies every membership rule
// vacuously), not a count.
//
// THE SPECIFIER READER is this file's own, dependency-free and in-file: comment stripping FIRST
// (a specifier mentioned in `//` or `/* */` prose is not an import), then a token scan that knows
// strings, template literals and regex literals, then a small grammar over the token stream. It
// reads static `import … from '…'` / `export … from '…'`, bare `import '…'`, `import type … from
// '…'`, `import(…)`/`typeof import(…)` (a dynamic import AND the `ImportTypeNode` form), the
// `/* @vite-ignore */` dynamic form, `require(…)`, `vi.mock`/`vi.importActual`/`vi.importMock`,
// `new URL('…', import.meta.url)` (an `fs` PATH — a `path-filename` PROBE: recorded, reported,
// and never on the module-under-test path, so it satisfies NO import criterion in any arm), and the
// computed `['..','src','shared','<x>.js'].join('/')` form (reconstructed from the array's own
// string literals).
//
// LAYER (RCA-12): `[T]`/`[D]`-class — a BYTE, BLOB and REVISION oracle. It proves NOTHING about
// behaviour: not one suite is run, not one module is executed, and no copy's rows are judged. A
// green here is NEVER app-green and is NEVER envelope-green-as-app. The conformance leg's own
// class-labelled tally (`npm run conformance`) is NOT this register's evidence and this register's
// green is NOT a leg pass: the leg cannot see copy fidelity, and this register cannot see a row.
//
// COLOURS AT THE AUTHORING HEAD (recorded so a wrong prediction is REPORTED rather than
// retargeted): `A`, `C`, `E`, `F` and `H` are RED (the eleven copies are still the OLD pin's blobs;
// the block declares 15 of the pinned universe's suites and disposes none of the rest, and it
// carries no `outOfUniverse` key; the block carries no `revision` key; `notAdmitted` does not exist
// yet; and the block carries no `caveats` key). `B`, `D` and `G` are GREEN-ON-ARRIVAL guards. No
// limb is relaxed, and none is retargeted, to change a colour.

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

// ---------------------------------------------------------------------------
// WHERE THE FILES ARE. `tests/integration/foundation-vendor/<this file>` → the repo root is
// three levels up; the foundation tree is the repo's ADJACENT sibling, resolved from the lock's
// own `foundation.path` at run time.
// ---------------------------------------------------------------------------
const HERE = dirname(fileURLToPath(import.meta.url))
const REGISTER_PATH = fileURLToPath(import.meta.url)
const REPO_ROOT = resolve(HERE, '..', '..', '..')
const LOCK_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')
const VENDOR_TESTS_DIR = join(REPO_ROOT, 'vendor', 'Provident-Electron', 'tests')
const DEFAULT_FOUNDATION_PATH = '../Provident-Electron'

/** THE ANTI-VACUITY BASELINE, and NOT the pin. The pin is `foundation.commit`, read from the
 *  lock at run time and never written as a literal here (a literal is allowed only inside a
 *  comparison message). This revision exists in this file for exactly one purpose: arm `A` must
 *  prove that the eleven pin blobs DIFFER from the blobs of the revision the copies were left at
 *  — a byte comparison against a revision that produced the same bytes would prove nothing.
 *  It is the older literal `D-19` keeps as filed (`D-11`'s pin) — three pin-moves back and TWO of them
 *  re-pins — and it is NOT the revision the copies sit at: the copies were last re-copied at
 *  `e8dfb57…` (`V-2`) and have not moved since (all eleven byte-equal at `b312d83…` and at the current
 *  pin — measured), so this baseline is DELIBERATELY STALE and MUST NOT be rolled forward to those
 *  pins, because arm `A` requires a revision whose eleven blobs DIFFER from the pin's — a roll-forward
 *  would make the control vacuous. */
const OLD_PIN_ANTI_VACUITY_BASELINE = '7bd1de4786c4d46a3fee02f72adaf6ef612985d1'

/** The five `criterion` tags the block's `notAdmitted` rows may carry — EXACTLY this set, one
 *  row per suite. Arm `F(iii)` re-derives the first four from the pin's bytes; `recorded` is a
 *  corpus ruling and has no mechanical shape beyond a non-empty `reason`. The two IMPORT tags are
 *  re-derived from REAL IMPORT readings only (the same `NON_IMPORT_KINDS` exclusion `F(i)`/`F(ii)`
 *  use): a `new URL(…)` / `path-filename` path probe is not an import and cannot satisfy them. */
const NOT_ADMITTED_CRITERIA = ['nested', 'foundation-tree-import', 'divergent-baseline-import', 'no-in-set-specifier', 'recorded'] as const
type NotAdmittedCriterion = (typeof NOT_ADMITTED_CRITERIA)[number]

/** THE THREE BYTE-CHECKABLE CRITERIA, defined ONCE: arm `F(iii)` re-derives all three from a
 *  suite's pin blob, and its `recorded` BOUND is the same three read in the NEGATIVE (a `recorded`
 *  row is admissible only where none of them holds). The fifth tag, `nested`, reads the suite's
 *  NAME, not its bytes. Nothing in this file re-types this list. */
const BYTE_CHECKABLE_CRITERIA = ['no-in-set-specifier', 'foundation-tree-import', 'divergent-baseline-import'] as const

/** Arm `E` — the block's pinned scalars. */
const CONFORMANCE_LEG = 'conformance'
const CONFORMANCE_CONFIG = 'vitest.conformance.config.ts'
const CONFORMANCE_PLACEMENT = 'vendor/Provident-Electron/tests/'

/** The flat placement the leg collects (`vitest.conformance.config.ts`'s own include), stated
 *  here as the DIRECTORY the block's `placement` names — never the config file's bytes, which
 *  this register does not read. */
const VENDORED_FILE_SUFFIX = '.test.ts'

// ---------------------------------------------------------------------------
// SMALL READERS AND MESSAGE HELPERS
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

/** A readable directory, or `false`. Used by arm `A`'s absent-tree clause ONLY: an absent tree is
 *  a loud SKIP there, never a pass and never a failed unit. */
function isReadableDirectory(path: string): boolean {
  try {
    return lstatSync(path).isDirectory()
  } catch {
    return false
  }
}

/** The `lstat` regularity read: byte identity is satisfied by a SYMLINK, and a symlink is not a
 *  copy. `readFileSync` dereferences, which is exactly why the md5 limb alone cannot see one. */
type RegularFileReading =
  | { ok: true; bytes: Buffer; md5: string }
  | { ok: false; problem: string }

function readRegularFile(path: string): RegularFileReading {
  let stat: ReturnType<typeof lstatSync>
  try {
    stat = lstatSync(path)
  } catch (error) {
    return { ok: false, problem: `the file does not exist or is unreadable at \`${path}\` — ${errorText(error)}` }
  }
  if (stat.isSymbolicLink()) {
    return { ok: false, problem: `\`${path}\` is a SYMLINK — a copy must be a regular file, and a symlink's bytes are another file's bytes` }
  }
  if (!stat.isFile()) {
    return { ok: false, problem: `\`${path}\` is NOT a regular file (lstat reports a non-file entry)` }
  }
  if (stat.size === 0) {
    return { ok: false, problem: `\`${path}\` is EMPTY (0 bytes) — an empty copy is not the pin's blob` }
  }
  let bytes: Buffer
  try {
    bytes = readFileSync(path)
  } catch (error) {
    return { ok: false, problem: `\`${path}\` is a regular file but unreadable — ${errorText(error)}` }
  }
  return { ok: true, bytes, md5: md5(bytes) }
}

// ---------------------------------------------------------------------------
// GIT — READ-ONLY, in the adjacent foundation tree. Nothing here writes.
// ---------------------------------------------------------------------------
type SpawnTextResult = { ok: boolean; status: number | null; stdout: string; stderr: string; detail: string }

function gitText(args: string[]): SpawnTextResult {
  const result = spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const stdout = (result.stdout ?? '').trim()
  const stderr = (result.stderr ?? '').trim()
  if (result.error !== undefined) {
    return { ok: false, status: null, stdout, stderr, detail: `spawn error: ${result.error.message}` }
  }
  if (result.status !== 0) {
    return { ok: false, status: result.status, stdout, stderr, detail: `git exited ${String(result.status)}${stderr === '' ? '' : `: ${stderr}`}` }
  }
  return { ok: true, status: 0, stdout, stderr, detail: `git exited 0 (${stdout.length} chars)` }
}

// ---------------------------------------------------------------------------
// THE LOCK — read at run time. An absent or ill-typed subject is a LOUD FAILURE naming the
// field: no limb may pass when its subject is missing.
// ---------------------------------------------------------------------------
type JsonObject = Record<string, unknown>

function asObject(value: unknown, label: string): JsonObject {
  if (value === undefined || value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} is ${JSON.stringify(value)} — not a JSON object (the limb that reads it cannot take a reading)`)
  }
  return value as JsonObject
}

let lockDocumentCache: JsonObject | null = null

function readLockDocument(): JsonObject {
  if (lockDocumentCache !== null) return lockDocumentCache
  const text = readText(LOCK_PATH)
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    throw new Error(`vendor/foundation.lock.json is not parseable JSON — ${errorText(error)}`)
  }
  lockDocumentCache = asObject(parsed, 'vendor/foundation.lock.json')
  return lockDocumentCache
}

/** THE PIN, and the adjacent tree it addresses — both read at run time. */
function readFoundation(): { commit: string; declaredPath: string; dir: string } {
  const document = readLockDocument()
  const foundation = asObject(document.foundation, 'vendor/foundation.lock.json\'s `foundation` block')
  const commit = foundation.commit
  if (typeof commit !== 'string' || !/^[0-9a-f]{40}$/.test(commit)) {
    throw new Error(`vendor/foundation.lock.json's \`foundation.commit\` is ${JSON.stringify(commit)} — not a 40-hex revision, so no blob reading has a subject`)
  }
  const declaredPath = typeof foundation.path === 'string' && foundation.path.trim() !== '' ? foundation.path.trim() : DEFAULT_FOUNDATION_PATH
  return { commit, declaredPath, dir: resolve(REPO_ROOT, declaredPath) }
}

/** The lock's `conformance` block, unvalidated: arm `E` must be able to say "the block carries no
 *  `revision` KEY", which is a different reading from "the value is wrong". */
function readConformanceRaw(): JsonObject {
  const document = readLockDocument()
  return asObject(document.conformance, 'vendor/foundation.lock.json\'s `conformance` block (the leg\'s declaration)')
}

function stringArrayField(block: JsonObject, field: string): string[] {
  const value = block[field]
  if (!Array.isArray(value)) {
    throw new Error(`the lock's \`conformance.${field}\` is ${JSON.stringify(value)} — not an array, so the limb that reads it has no subject`)
  }
  return value.map((entry, index) => {
    if (typeof entry !== 'string' || entry.trim() === '') {
      throw new Error(`the lock's \`conformance.${field}[${index}]\` is ${JSON.stringify(entry)} — not a non-empty suite name`)
    }
    return entry.trim()
  })
}

/** THE VENDORED SET, read from the lock's own `modules` rows — never a hardcoded fifteen. */
function readVendoredSetNames(): string[] {
  const document = readLockDocument()
  const modules = document.modules
  if (!Array.isArray(modules) || modules.length === 0) {
    throw new Error(`vendor/foundation.lock.json's \`modules\` is ${JSON.stringify(modules)} — not a non-empty array, so "the vendored set" has no declared membership`)
  }
  const names = modules.map((row, index) => {
    const name = asObject(row, `vendor/foundation.lock.json's \`modules[${index}]\``).name
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error(`vendor/foundation.lock.json's \`modules[${index}].name\` is ${JSON.stringify(name)} — not a non-empty module name`)
    }
    return name.trim()
  })
  return [...new Set(names)]
}

/** The four baseline files the fork does NOT replace (`baselineFilesNotReplaced`), as bare names. */
function readBaselineNames(): string[] {
  const value = readLockDocument().baselineFilesNotReplaced
  if (!Array.isArray(value)) {
    throw new Error(`vendor/foundation.lock.json's \`baselineFilesNotReplaced\` is ${JSON.stringify(value)} — not an array; the divergent-baseline class has no declared membership`)
  }
  return [...new Set(value.filter((entry): entry is string => typeof entry === 'string').map((entry) => entry.replace(/^.*\//, '').replace(/\.(ts|js)$/, '')))]
}

/** The block's INCLUDED suites. */
function includedSuites(): string[] {
  return stringArrayField(readConformanceRaw(), 'included')
}

/** The block's EXCLUDED rows: `{ suite, reason }`. */
type ExcludedRow = { suite: string; reason: string }

function excludedRows(): ExcludedRow[] {
  const block = readConformanceRaw()
  const value = block.excluded
  if (!Array.isArray(value)) {
    throw new Error(`the lock's \`conformance.excluded\` is ${JSON.stringify(value)} — not an array, so the four exclusions have no declared subject`)
  }
  return value.map((row, index) => {
    const object = asObject(row, `the lock's \`conformance.excluded[${index}]\``)
    const suite = object.suite
    if (typeof suite !== 'string' || suite.trim() === '') {
      throw new Error(`the lock's \`conformance.excluded[${index}].suite\` is ${JSON.stringify(suite)} — not a non-empty suite name`)
    }
    return { suite: suite.trim(), reason: typeof object.reason === 'string' ? object.reason.trim() : '' }
  })
}

/** The block's NOT-ADMITTED rows: a FLAT per-suite array, one object per suite. `present` is
 *  false when the key is absent or ill-typed — arm `C` then sees an empty disposition list and
 *  arm `F(iii)` fails loudly, which is the authored RED of this unit. */
type NotAdmittedRow = { suite: string; className: string; criterion: string; reason: string }

function notAdmittedRows(): { present: boolean; rows: NotAdmittedRow[]; detail: string } {
  const block = readConformanceRaw()
  if (!Object.prototype.hasOwnProperty.call(block, 'notAdmitted')) {
    return { present: false, rows: [], detail: 'the block carries no `notAdmitted` KEY at all' }
  }
  const value = block.notAdmitted
  if (!Array.isArray(value)) {
    return { present: false, rows: [], detail: `\`conformance.notAdmitted\` is ${JSON.stringify(value)} — not a flat per-suite array` }
  }
  const rows: NotAdmittedRow[] = []
  for (let index = 0; index < value.length; index++) {
    const object = asObject(value[index], `the lock's \`conformance.notAdmitted[${index}]\``)
    const suite = typeof object.suite === 'string' ? object.suite.trim() : ''
    const className = typeof object.class === 'string' ? object.class.trim() : ''
    const criterion = typeof object.criterion === 'string' ? object.criterion.trim() : ''
    const reason = typeof object.reason === 'string' ? object.reason.trim() : ''
    rows.push({ suite, className, criterion, reason })
  }
  return { present: true, rows, detail: `\`conformance.notAdmitted\` carries ${rows.length} row(s)` }
}

/** The block's AUXILIARY ROWS (`outOfUniverse`, `caveats`): a FLAT per-suite array of
 *  `{ suite, reason }`. `present` is false when the KEY is absent or ill-typed — a different
 *  reading from "the value is wrong", and the one the authored red of arms `C`/`H` reports.
 *  `shapeProblems` names every malformed entry instead of throwing, so an offending name is
 *  PRINTED by the arm that gates it rather than escaping as a stack trace. */
type AuxiliaryRow = { suite: string; reason: string }

function auxiliaryRows(field: string): { present: boolean; rows: AuxiliaryRow[]; shapeProblems: string[]; detail: string } {
  const block = readConformanceRaw()
  if (!Object.prototype.hasOwnProperty.call(block, field)) {
    return { present: false, rows: [], shapeProblems: [], detail: `the block carries no \`${field}\` KEY at all` }
  }
  const value = block[field]
  if (!Array.isArray(value)) {
    return { present: false, rows: [], shapeProblems: [], detail: `\`conformance.${field}\` is ${JSON.stringify(value)} — not a flat per-suite array` }
  }
  const rows: AuxiliaryRow[] = []
  const shapeProblems: string[] = []
  for (let index = 0; index < value.length; index++) {
    const entry: unknown = value[index]
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      shapeProblems.push(`\`conformance.${field}[${index}]\` is ${JSON.stringify(entry)} — not a \`{ suite, reason }\` object`)
      continue
    }
    const object = entry as JsonObject
    const suite = typeof object.suite === 'string' ? object.suite.trim() : ''
    const reason = typeof object.reason === 'string' ? object.reason.trim() : ''
    if (suite === '') {
      shapeProblems.push(`\`conformance.${field}[${index}].suite\` is ${JSON.stringify(object.suite)} — not a non-empty suite name`)
    }
    if (reason === '') {
      shapeProblems.push(
        `\`conformance.${field}[${index}]\` (suite ${JSON.stringify(object.suite)}) carries NO non-empty \`reason\` — a row with no recorded reason is indistinguishable from a suite nobody got to`,
      )
    }
    rows.push({ suite, reason })
  }
  return { present: true, rows, shapeProblems, detail: `\`conformance.${field}\` carries ${rows.length} row(s)` }
}

// ---------------------------------------------------------------------------
// THE PIN'S OBJECT STORE — ONE batched `git cat-file --batch` spawn, memoized. Every blob this
// register needs is read EXACTLY ONCE. The `--batch` protocol is `<oid> <type> <size>\n<bytes>\n`
// per requested object and `<spec> missing\n` for an absent one, which is parsed here by BYTE
// OFFSET (never by splitting on newlines: a blob's bytes contain plenty of them).
// ---------------------------------------------------------------------------
type BlobReading = { ok: boolean; bytes: Buffer; text: string; detail: string }

const blobCache = new Map<string, BlobReading>()

function prefetchBlobs(requests: Array<{ rev: string; path: string }>): void {
  const wanted: Array<{ key: string; rev: string; path: string }> = []
  const seen = new Set<string>()
  for (const request of requests) {
    const key = `${request.rev}:${request.path}`
    if (blobCache.has(key) || seen.has(key)) continue
    seen.add(key)
    wanted.push({ key, rev: request.rev, path: request.path })
  }
  if (wanted.length === 0) return
  const foundation = readFoundation()
  const input = wanted.map((entry) => `${entry.rev}:${entry.path}`).join('\n') + '\n'
  const result = spawnSync('git', ['-C', foundation.dir, 'cat-file', '--batch'], { input, maxBuffer: 512 * 1024 * 1024 })
  if (result.error !== undefined) {
    throw new Error(`\`git -C ${foundation.dir} cat-file --batch\` could not be spawned — ${result.error.message} (the pin's object store is this register's only oracle for blob bytes)`)
  }
  if (result.status !== 0) {
    const stderr = (Buffer.isBuffer(result.stderr) ? result.stderr.toString('utf8') : String(result.stderr ?? '')).trim()
    throw new Error(`\`git -C ${foundation.dir} cat-file --batch\` exited ${String(result.status)} for ${wanted.length} blob(s)${stderr === '' ? '' : ` — ${stderr}`} (the pin's object store is this register's only oracle for blob bytes)`)
  }
  const stdout = Buffer.isBuffer(result.stdout) ? result.stdout : Buffer.alloc(0)
  let offset = 0
  for (const entry of wanted) {
    const newline = stdout.indexOf(0x0a, offset)
    if (newline < 0) {
      blobCache.set(entry.key, { ok: false, bytes: Buffer.alloc(0), text: '', detail: `the batch response ended before the header of ${entry.key}` })
      continue
    }
    const header = stdout.subarray(offset, newline).toString('utf8')
    const parts = header.split(' ')
    if (parts.length < 2 || parts[1] !== 'blob') {
      blobCache.set(entry.key, { ok: false, bytes: Buffer.alloc(0), text: '', detail: `git reports \`${header}\` — the object is absent or not a blob` })
      offset = newline + 1
      continue
    }
    const size = Number(parts[2])
    if (!Number.isFinite(size) || size < 0) {
      blobCache.set(entry.key, { ok: false, bytes: Buffer.alloc(0), text: '', detail: `git's batch header \`${header}\` carries no readable size` })
      offset = newline + 1
      continue
    }
    const body = stdout.subarray(newline + 1, newline + 1 + size)
    offset = newline + 1 + size + 1
    blobCache.set(entry.key, { ok: body.length === size, bytes: body, text: body.toString('utf8'), detail: `read ${size} bytes at ${entry.key}` })
  }
}

function blobOf(rev: string, path: string): BlobReading {
  const key = `${rev}:${path}`
  if (!blobCache.has(key)) prefetchBlobs([{ rev, path }])
  return blobCache.get(key) ?? { ok: false, bytes: Buffer.alloc(0), text: '', detail: `internal: ${key} was never read` }
}

/** The pinned SUITE UNIVERSE: every `<pin>:tests/` + `**` + `/*.test.ts` entry, in `ls-tree` order, as a
 *  path RELATIVE to `tests/` (`census.test.ts`, `e2e/app-layout/app-layout.test.ts`). */
function readUniverseSampling(): { ok: boolean; members: string[]; detail: string } {
  const foundation = readFoundation()
  const read = gitText(['-C', foundation.dir, 'ls-tree', '-r', '--name-only', `${foundation.commit}:tests/`])
  if (!read.ok) {
    return { ok: false, members: [], detail: `\`git -C ${foundation.dir} ls-tree -r --name-only ${foundation.commit}:tests/\` is unreadable — ${read.detail}. The pinned tree's object store is the ONLY source of the suite universe; with no tree there is no universe to measure.` }
  }
  const members = read.stdout.split('\n').map((line) => line.trim()).filter((line) => line !== '' && line.endsWith(VENDORED_FILE_SUFFIX))
  return { ok: true, members, detail: `read ${members.length} \`${VENDORED_FILE_SUFFIX}\` entries under \`${foundation.commit}:tests/\`` }
}

// ---------------------------------------------------------------------------
// THE SPECIFIER READER — this file's own, in-file, dependency-free.
//
// STEP 1 (inside `scan`): strip comments and separate strings/template literals/regex literals
// from code, so a specifier mentioned in PROSE never counts as an import and a `'` inside a regex
// never desynchronises the scan. STEP 2 (`readSpecifiers`): a small grammar over the token stream.
//
// Every reading carries the BRACKET DEPTH it was taken at, because the corpus's criterion is the
// MODULE-UNDER-TEST closure: a static import at the module's own top level (depth 0) binds a
// module under test, while the same specifier inside a row (`depth ≥ 1`) is a row-local or
// harness-precondition touch (`docs/L1/unit-v-2-conformance-refresh.md` §3.4 corrected ①: the
// `PRE-1` rows of four INCLUDED suites import the fork's divergent `dom-shim.js` inside a row and
// sit OUTSIDE the suite's own surface resolution — they are a recorded caveat, not a
// disqualifying module-under-test edge).
// ---------------------------------------------------------------------------

/** Identifiers after which a `/` begins a REGEX literal rather than a division. */
const REGEX_PRECEDING_KEYWORDS = new Set(['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'new', 'do', 'else', 'instanceof', 'yield', 'await'])

type Token = { kind: 'id' | 'string' | 'template' | 'regex' | 'number' | 'punct'; value: string; depth: number }

function scan(sourceText: string): Token[] {
  const tokens: Token[] = []
  const text = sourceText
  const length = text.length
  let index = 0
  let depth = 0
  const previous = (): Token | null => (tokens.length === 0 ? null : tokens[tokens.length - 1] ?? null)
  const push = (kind: Token['kind'], value: string): void => {
    tokens.push({ kind, value, depth })
  }
  const regexAllowed = (): boolean => {
    const prior = previous()
    if (prior === null) return true
    if (prior.kind === 'punct') return !(prior.value === ')' || prior.value === ']' || prior.value === '}')
    if (prior.kind === 'id') return REGEX_PRECEDING_KEYWORDS.has(prior.value)
    return false
  }
  while (index < length) {
    const character = text[index] as string
    if (character === ' ' || character === '\n' || character === '\r' || character === '\t') {
      index += 1
      continue
    }
    // `//` line comment — stripped, so nothing in it is ever read as a specifier.
    if (character === '/' && text[index + 1] === '/') {
      while (index < length && text[index] !== '\n') index += 1
      continue
    }
    // `/* … */` block comment — stripped for the same reason.
    if (character === '/' && text[index + 1] === '*') {
      index += 2
      while (index < length && !(text[index] === '*' && text[index + 1] === '/')) index += 1
      index += 2
      continue
    }
    if (character === "'" || character === '"') {
      const quote = character
      index += 1
      let value = ''
      while (index < length) {
        const inner = text[index] as string
        if (inner === '\\') {
          value += text[index + 1] ?? ''
          index += 2
          continue
        }
        if (inner === quote) {
          index += 1
          break
        }
        if (inner === '\n') break // a string cannot span a line — resync defensively
        value += inner
        index += 1
      }
      push('string', value)
      continue
    }
    if (character === '`') {
      // A template literal is OPAQUE: the corpus's suites carry code SNIPPETS inside templates
      // (`import { x } from './y.js'` as a fixture body) and they are not imports.
      index += 1
      while (index < length) {
        const inner = text[index] as string
        if (inner === '\\') {
          index += 2
          continue
        }
        if (inner === '`') {
          index += 1
          break
        }
        if (inner === '$' && text[index + 1] === '{') {
          index += 2
          let braces = 1
          while (index < length && braces > 0) {
            const body = text[index] as string
            if (body === '{') {
              braces += 1
              index += 1
              continue
            }
            if (body === '}') {
              braces -= 1
              index += 1
              continue
            }
            if (body === '"' || body === "'") {
              const quote = body
              index += 1
              while (index < length && text[index] !== quote) {
                if (text[index] === '\\') index += 1
                index += 1
              }
              index += 1
              continue
            }
            if (body === '`') {
              index += 1
              while (index < length) {
                if (text[index] === '\\') {
                  index += 2
                  continue
                }
                if (text[index] === '`') {
                  index += 1
                  break
                }
                index += 1
              }
              continue
            }
            index += 1
          }
          continue
        }
        index += 1
      }
      push('template', '')
      continue
    }
    if (character === '/' && regexAllowed()) {
      index += 1
      let inClass = false
      while (index < length) {
        const inner = text[index] as string
        if (inner === '\\') {
          index += 2
          continue
        }
        if (inner === '\n') break
        if (inner === '[') {
          inClass = true
          index += 1
          continue
        }
        if (inner === ']') {
          inClass = false
          index += 1
          continue
        }
        if (inner === '/' && !inClass) {
          index += 1
          break
        }
        index += 1
      }
      while (index < length && /[a-z]/i.test(text[index] as string)) index += 1
      push('regex', '')
      continue
    }
    if (/[A-Za-z_$]/.test(character)) {
      let value = ''
      while (index < length && /[A-Za-z0-9_$]/.test(text[index] as string)) {
        value += text[index]
        index += 1
      }
      push('id', value)
      continue
    }
    if (/[0-9]/.test(character)) {
      while (index < length && /[0-9a-zA-Z._]/.test(text[index] as string)) index += 1
      push('number', '')
      continue
    }
    if (character === '{' || character === '(' || character === '[') {
      push('punct', character)
      depth += 1
      index += 1
      continue
    }
    if (character === '}' || character === ')' || character === ']') {
      depth -= 1
      push('punct', character)
      index += 1
      continue
    }
    push('punct', character)
    index += 1
  }
  return tokens
}

/** How a specifier was reached. The LAST four are the ENUMERATED EXTRA FORMS arm `F(iv)` allows
 *  this reader to see where the corpus's AST oracle `importSpecifiers` sees nothing. */
type SpecifierKind =
  | 'static-import'
  | 'bare-import'
  | 'import-type'
  | 'export-from'
  | 'dynamic'
  | 'require'
  | 'vi-mock'
  | 'new-url'
  | 'array-join'

type SpecifierReading = { specifier: string; kind: SpecifierKind; depth: number }

/** The kinds that are NOT modules being imported: `new URL('…', import.meta.url)` builds an `fs`
 *  PATH (read through `fileURLToPath`), so it never binds a module and never sits on the
 *  module-under-test path. It is still READ and REPORTED. THIS IS THE ONE DEFINITION: arms `F(i)`
 *  and `F(ii)` apply it through `moduleUnderTestReadings`, and arm `F(iii)` applies it to the two
 *  IMPORT criteria (`foundation-tree-import`, `divergent-baseline-import`) — a path probe is not
 *  evidence about a suite's import closure. */
const NON_IMPORT_KINDS: ReadonlySet<SpecifierKind> = new Set<SpecifierKind>(['new-url'])

/** A specifier reading that BINDS a module — the complement of `NON_IMPORT_KINDS`. */
function importReadings(readings: SpecifierReading[]): SpecifierReading[] {
  return readings.filter((reading) => !NON_IMPORT_KINDS.has(reading.kind))
}

/** A specifier reading that only NAMES A PATH — a `path-filename` probe (`new URL(…)` handed to
 *  `existsSync`/`readFileSync`/`fileURLToPath`), never a module binding. */
function pathProbeReadings(readings: SpecifierReading[]): SpecifierReading[] {
  return readings.filter((reading) => NON_IMPORT_KINDS.has(reading.kind))
}

function readSpecifiers(sourceText: string): SpecifierReading[] {
  const tokens = scan(sourceText)
  const readings: SpecifierReading[] = []
  const isId = (token: Token | undefined, value?: string): boolean => token !== undefined && token.kind === 'id' && (value === undefined || token.value === value)
  const isPunct = (token: Token | undefined, value: string): boolean => token !== undefined && token.kind === 'punct' && token.value === value
  const isString = (token: Token | undefined): token is Token => token !== undefined && token.kind === 'string'

  const DECLARATION_SCAN_LIMIT = 400

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index] as Token

    // (1) the COMPUTED array-join form: `['..','src','shared','<x>.js'].join('/')`. Reconstructed
    //     from the array's own string literals; a `join('')`/`join(',')` assembly (the corpus's own
    //     evasion fixtures carry several) is NOT a path and is not read as one.
    if (isPunct(token, '[')) {
      let cursor = index + 1
      const parts: string[] = []
      while (isString(tokens[cursor])) {
        parts.push((tokens[cursor] as Token).value)
        cursor += 1
        if (isPunct(tokens[cursor], ',')) {
          cursor += 1
          continue
        }
        break
      }
      const closedArray = parts.length >= 2 && isPunct(tokens[cursor], ']') && isPunct(tokens[cursor + 1], '.') && isId(tokens[cursor + 2], 'join') && isPunct(tokens[cursor + 3], '(')
      if (closedArray) {
        const separator = tokens[cursor + 4]
        const closesCall = isPunct(tokens[cursor + 5], ')')
        if (isString(separator) && separator.value === '/' && closesCall) {
          readings.push({ specifier: parts.join('/'), kind: 'array-join', depth: token.depth })
        }
      }
      continue
    }

    if (isId(token, 'import')) {
      const next = tokens[index + 1]
      if (isPunct(next, '.')) continue // `import.meta`
      if (isPunct(next, '(')) {
        const argument = tokens[index + 2]
        if (isString(argument)) readings.push({ specifier: argument.value, kind: 'dynamic', depth: token.depth })
        continue // a computed argument (an identifier, a call) resolves elsewhere or not at all
      }
      if (isString(next)) {
        readings.push({ specifier: next.value, kind: 'bare-import', depth: token.depth })
        continue
      }
      const typeOnly = isId(next, 'type')
      let cursor = typeOnly ? index + 2 : index + 1
      let guard = 0
      while (cursor < tokens.length && guard < DECLARATION_SCAN_LIMIT) {
        const probe = tokens[cursor]
        if (isId(probe, 'from') && isString(tokens[cursor + 1])) {
          readings.push({ specifier: (tokens[cursor + 1] as Token).value, kind: typeOnly ? 'import-type' : 'static-import', depth: token.depth })
          break
        }
        if (isId(probe, 'import') || isId(probe, 'export')) break
        if (isPunct(probe, '=') || isPunct(probe, ';')) break
        cursor += 1
        guard += 1
      }
      continue
    }

    if (isId(token, 'export')) {
      let cursor = index + 1
      let guard = 0
      while (cursor < tokens.length && guard < DECLARATION_SCAN_LIMIT) {
        const probe = tokens[cursor]
        if (isId(probe, 'from') && isString(tokens[cursor + 1])) {
          readings.push({ specifier: (tokens[cursor + 1] as Token).value, kind: 'export-from', depth: token.depth })
          break
        }
        if (isId(probe, 'import') || isId(probe, 'export')) break
        if (isPunct(probe, ';')) break
        cursor += 1
        guard += 1
      }
      continue
    }

    if (isId(token, 'require') && isPunct(tokens[index + 1], '(') && isString(tokens[index + 2])) {
      readings.push({ specifier: (tokens[index + 2] as Token).value, kind: 'require', depth: token.depth })
      continue
    }

    if (isId(token, 'vi') && isPunct(tokens[index + 1], '.') && isId(tokens[index + 2])) {
      const member = (tokens[index + 2] as Token).value
      if ((member === 'mock' || member === 'importActual' || member === 'importMock') && isPunct(tokens[index + 3], '(') && isString(tokens[index + 4])) {
        readings.push({ specifier: (tokens[index + 4] as Token).value, kind: 'vi-mock', depth: token.depth })
      }
      continue
    }

    if (isId(token, 'new') && isId(tokens[index + 1], 'URL') && isPunct(tokens[index + 2], '(') && isString(tokens[index + 3])) {
      readings.push({ specifier: (tokens[index + 3] as Token).value, kind: 'new-url', depth: token.depth })
      continue
    }
  }
  return readings
}

/** A specifier on the relative `src/` path: `../src/<area>/<name>.(js|ts)`. */
const RELATIVE_SRC_PATH = /^(?:\.\.\/)+src\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_-]+)\.(?:js|ts)$/

function srcPathOf(specifier: string): { area: string; name: string } | null {
  const match = RELATIVE_SRC_PATH.exec(specifier)
  if (match === null) return null
  return { area: match[1] as string, name: match[2] as string }
}

/** THE TWO IMPORT CRITERIA'S SUBJECTS, defined ONCE. Arm `F(iii)` re-derives each tag from REAL
 *  import readings against one of these, and re-checks the SAME two patterns in the negative for a
 *  `recorded` row's bound — so the bound cannot drift from the criteria it bounds, and the pattern
 *  a message quotes is the pattern the arm applied. (Neither regex carries `g`, so reuse keeps no
 *  `lastIndex` state.) */
const FOUNDATION_TREE_IMPORT_SUBJECT = /^(?:\.\.\/)+src\/(main|renderer)\//
const DIVERGENT_BASELINE_IMPORT_SUBJECT = /^(?:\.\.\/)+src\/shared\/(dom-shim|demo-envelope|path-fork-cycle|types)\.(js|ts)$/
const FOUNDATION_TREE_IMPORT_SUBJECT_TEXT = '`^(\\.\\./)+src/(main|renderer)/`'
const DIVERGENT_BASELINE_IMPORT_SUBJECT_TEXT = '`^(\\.\\./)+src/shared/(dom-shim|demo-envelope|path-fork-cycle|types)\\.(js|ts)$`'

/** The MODULE-UNDER-TEST path: a specifier reaching a module on the relative `src/` path at the
 *  file's own top level, where it BINDS a module. `new URL(…)` path reads are excluded by
 *  construction — they name a file to read, not a module to import. */
function moduleUnderTestReadings(readings: SpecifierReading[]): SpecifierReading[] {
  return readings.filter((reading) => reading.depth === 0 && !NON_IMPORT_KINDS.has(reading.kind) && srcPathOf(reading.specifier) !== null)
}

function describeReadings(readings: SpecifierReading[]): string {
  if (readings.length === 0) return '(none)'
  return readings.map((reading) => `${reading.specifier}[${reading.kind}@${reading.depth}]`).join(', ')
}

/** `tests/<x>.test.ts` and `<x>.test.ts` denote the same universe member: names are compared
 *  after stripping a leading `tests/`, so the block's spelling cannot silently miss a member. */
function canonicalSuite(name: string): string {
  let canonical = name.trim()
  while (canonical.startsWith('tests/')) canonical = canonical.slice('tests/'.length)
  return canonical
}

/** A suite's IDENTITY for the AUXILIARY-ROW membership rules (arms `C`'s retirement half and `H`):
 *  the leading `tests/` and the trailing `.test.ts` are SPELLING, not identity, so `container`,
 *  `container.test.ts` and `tests/container.test.ts` all denote the same subject — and a repeat
 *  spelled two ways is still a repeat. Arm `C`'s disposition ledger keeps its own
 *  `canonicalSuite` identity untouched: a disposition must match a universe MEMBER's path. */
function suiteKey(name: string): string {
  let key = canonicalSuite(name)
  if (key.endsWith(VENDORED_FILE_SUFFIX)) key = key.slice(0, -VENDORED_FILE_SUFFIX.length)
  return key
}

function namesIn(readings: SpecifierReading[], set: ReadonlySet<string>): string[] {
  const found = new Set<string>()
  for (const reading of readings) {
    const path = srcPathOf(reading.specifier)
    if (path === null) continue
    if (set.has(path.name)) found.add(path.name)
  }
  return [...found].sort()
}

// ===========================================================================
// THE EIGHT ARMS
// ===========================================================================
describe('CONFORMANCE-REFRESH REGISTER — `V-2`: the vendored conformance copies ARE the pinned commit’s bytes, and the lock’s `conformance` block is a faithful, complete, non-stale statement of the pinned tree’s suite universe (authored RED; `A`/`C`/`E`/`F`/`H` are the target reds, `B`/`D`/`G` the green-on-arrival guards)', () => {
  it('A — every declared INCLUDED copy is a REGULAR FILE whose md5 equals `git show <lock foundation.commit>:tests/<suite>`, with the eleven-pin-blobs-differ control (a silent skip is a failure; an absent foundation tree is a LOUD skip, never a pass and never a failed unit)', () => {
    const foundation = readFoundation()
    const included = includedSuites()
    expect(
      included.length,
      `A: the block\u2019s \`conformance.included\` carries ${included.length} suite name(s) — the leg\u2019s declared set is eleven; an empty or short list gives this limb nothing to gate.`,
    ).toBeGreaterThan(0)

    // -----------------------------------------------------------------------
    // THE ABSENT-TREE CLAUSE (the corpus's honesty rule 1, mirroring
    // `scripts/foundation-drift.mjs`): no readable adjacent tree means NO byte reading can be
    // taken. That is a LOUD SKIP — never a pass (nothing was read) and never a failed unit (the
    // fork must work standalone).
    // -----------------------------------------------------------------------
    if (!isReadableDirectory(foundation.dir)) {
      const reason =
        `SKIPPED (A) — the foundation tree \`${foundation.dir}\` (the lock's \`foundation.path\` ${JSON.stringify(foundation.declaredPath)}) is NOT a readable directory, ` +
        `so the pin ${foundation.commit} has no object store to read and NOT ONE byte comparison can be taken. ` +
        `This arm is SKIPPED, not green: a SKIP on an absent tree proves NOTHING about copy fidelity. ` +
        `A present tree would have taken ALL ${included.length} byte readings declared by \`conformance.included\`.`
      console.warn(reason)
      expect(
        reason.trim().length,
        'A: the SKIP reason must be non-empty — a silent skip is the failure mode this clause exists to prevent.',
      ).toBeGreaterThan(0)
      expect(
        included.length,
        `A: a PRESENT foundation tree would have taken all eleven readings the block declares INCLUDED; the block declares ${included.length}, so the skip has no declared subject to defer.`,
      ).toBe(11)
      return
    }

    // ONE batched read for everything this arm needs: the pin's blobs and the anti-vacuity
    // baseline's blobs, per declared suite.
    const pinPathOf = (suite: string): string => `tests/${canonicalSuite(suite)}`
    prefetchBlobs([
      ...included.map((suite) => ({ rev: foundation.commit, path: pinPathOf(suite) })),
      ...included.map((suite) => ({ rev: OLD_PIN_ANTI_VACUITY_BASELINE, path: pinPathOf(suite) })),
    ])

    const problems: string[] = []
    let compared = 0
    let pinDiffersFromOld = 0
    const oldPinUnreadable: string[] = []
    for (const suite of included) {
      const canonical = canonicalSuite(suite)
      const localPath = join(VENDOR_TESTS_DIR, canonical)
      const local = readRegularFile(localPath)
      const pinBlob = blobOf(foundation.commit, pinPathOf(suite))
      const oldBlob = blobOf(OLD_PIN_ANTI_VACUITY_BASELINE, pinPathOf(suite))

      if (!pinBlob.ok) {
        problems.push(`${canonical}: the pin blob \`${foundation.commit}:tests/${canonical}\` is unreadable — ${pinBlob.detail}`)
      }
      if (!local.ok) {
        problems.push(`${canonical}: ${local.problem}`)
      } else if (pinBlob.ok) {
        compared += 1
        if (local.md5 !== md5(pinBlob.bytes)) {
          problems.push(
            `${canonical}: the LOCAL copy (md5 ${local.md5}, ${local.bytes.length} bytes) is NOT the pin\u2019s blob ` +
              `(md5 ${md5(pinBlob.bytes)}, ${pinBlob.bytes.length} bytes at ${foundation.commit})` +
              ` — the old-pin blob (${OLD_PIN_ANTI_VACUITY_BASELINE}) reads md5 ${oldBlob.ok ? md5(oldBlob.bytes) : `UNREADABLE (${oldBlob.detail})`}` +
              `${oldBlob.ok && local.md5 === md5(oldBlob.bytes) ? ' — the local copy is the OLD pin\u2019s bytes' : ''}`,
          )
        }
      }
      // The anti-vacuity control reads the two pin blobs whether or not the local copy is sound.
      if (oldBlob.ok && pinBlob.ok) {
        if (md5(pinBlob.bytes) !== md5(oldBlob.bytes)) pinDiffersFromOld += 1
      } else if (!oldBlob.ok) {
        oldPinUnreadable.push(`${canonical}: ${oldBlob.detail}`)
      }
    }

    console.log(`[A] compared ${compared}/${included.length} declared INCLUDED copies against ${foundation.commit}; ${problems.length} problem(s); pin-vs-old-pin differing blobs ${pinDiffersFromOld}/${included.length}`)

    // -----------------------------------------------------------------------
    // THE ANTI-VACUITY CONTROL, IN THE SAME ARM: the eleven pin blobs must DIFFER from the OLD
    // pin's. A byte comparison against a revision that produced the same bytes proves nothing.
    // -----------------------------------------------------------------------
    expect(
      oldPinUnreadable,
      `A: the ANTI-VACUITY control needs the OLD pin\u2019s blobs (${OLD_PIN_ANTI_VACUITY_BASELINE}) to compare against; ${oldPinUnreadable.length} of them are unreadable, so the control would be vacuous: ${oldPinUnreadable.join(' \u00b7 ')}`,
    ).toEqual([])
    expect(
      pinDiffersFromOld,
      `A: ANTI-VACUITY CONTROL — the pin\u2019s eleven ADDED-blob comparison must show that ALL ELEVEN \`tests/<suite>.test.ts\` blobs at ${foundation.commit} DIFFER from their blobs at the old pin ${OLD_PIN_ANTI_VACUITY_BASELINE} (measured elsewhere as 11/11); ` +
        `only ${pinDiffersFromOld} of ${included.length} differ, so the byte comparison below could be passing by comparing one revision to itself.` +
        ` If the pin legitimately has the same bytes, the control\u2019s baseline is stale and must be re-recorded — never deleted.`,
    ).toBe(11)

    expect(
      compared,
      `A: ${included.length - compared} of the ${included.length} suites \`conformance.included\` declares could not be COMPARED (a missing local copy, a symlink, an empty file or an unreadable pin blob — each named below) — a silently skipped suite is a failure, not a pass.`,
    ).toBe(included.length)

    expect(
      problems,
      `A: every declared INCLUDED copy must be a regular, non-empty file whose md5 IS the pinned blob\u2019s md5 at \`foundation.commit\` ${foundation.commit} — ${problems.length} problem(s): ${problems.join(' \u00b7 ')}`,
    ).toEqual([])
  })

  it('B — every declared EXCLUDED suite is a REAL ABSENCE at the leg’s flat placement (four rows, each with its own non-empty reason)', () => {
    const rows = excludedRows()
    expect(
      rows.length,
      `B: \`conformance.excluded\` carries ${rows.length} row(s) — the leg\u2019s exclusions are FOUR, each with its own recorded reason; a short list has silently re-admitted a suite.`,
    ).toBe(4)
    const problems: string[] = []
    for (const row of rows) {
      const canonical = canonicalSuite(row.suite)
      const localPath = join(VENDOR_TESTS_DIR, canonical)
      if (existsSync(localPath)) {
        problems.push(`${canonical}: the block EXCLUDES it, but a file EXISTS at \`${localPath}\` — an exclusion must be a real absence at the leg\u2019s flat placement`)
      }
      if (row.reason === '') {
        problems.push(`${canonical}: the excluded row carries NO \`reason\` — an exclusion with no recorded reason is indistinguishable from a suite nobody got to`)
      }
    }
    console.log(`[B] ${rows.length} excluded row(s) checked against \`vendor/Provident-Electron/tests/\`; ${problems.length} problem(s)`)
    expect(
      problems,
      `B: every excluded row must be a REAL absence at \`vendor/Provident-Electron/tests/\` AND carry a non-empty reason — ${problems.length} problem(s): ${problems.join(' \u00b7 ')}`,
    ).toEqual([])
  })

  it('C — NO SUITE IS SILENTLY SKIPPED: every \`*.test.ts\` member of the pinned tree’s `tests/**` universe carries EXACTLY ONE disposition across `included`/`excluded`/`notAdmitted`, no disposition names a non-member, and no name repeats', () => {
    const foundation = readFoundation()
    const universe = readUniverseSampling()
    expect(
      universe.ok,
      `C: the pinned suite universe must be readable — ${universe.detail}`,
    ).toBe(true)

    // -----------------------------------------------------------------------
    // NON-VACUITY: the universe must really be the pinned tree's `tests/**` tree — a FLAT member
    // at the leg's own placement depth AND a NESTED member, and strictly more members than the
    // block's own declared suites. A reader that returned one list, or the declared list, would
    // pass every set comparison below for the wrong reason.
    // -----------------------------------------------------------------------
    const flatMembers = universe.members.filter((member) => !member.includes('/'))
    const nestedMembers = universe.members.filter((member) => member.includes('/'))
    expect(
      flatMembers.length,
      `C: the pinned universe must carry at least one FLAT member (\`<suite>.test.ts\`, the leg\u2019s own placement depth) — the reader returned ${universalSummary(universe.members)}.`,
    ).toBeGreaterThan(0)
    expect(
      nestedMembers.length,
      `C: the pinned universe must carry at least one NESTED member (\`<dir>/<suite>.test.ts\`, which cannot occupy the leg\u2019s flat placement) — the reader returned ${universalSummary(universe.members)}.`,
    ).toBeGreaterThan(0)

    const included = includedSuites()
    const excluded = excludedRows().map((row) => row.suite)
    const notAdmitted = notAdmittedRows()
    const declaredCount = included.length + excluded.length + notAdmitted.rows.length
    expect(
      universe.members.length,
      `C: the pinned universe (${universe.members.length} \`${VENDORED_FILE_SUFFIX}\` members at ${foundation.commit}) must be LARGER than the block\u2019s own declared suites (${included.length} included + ${excluded.length} excluded + ${notAdmitted.rows.length} not-admitted = ${declaredCount}) — an equal count means the reader returned the declaration instead of the tree.`,
    ).toBeGreaterThan(included.length + excluded.length)

    // -----------------------------------------------------------------------
    // THE DISPOSITION LEDGER: one entry per (canonical name, source list).
    // -----------------------------------------------------------------------
    const dispositions = new Map<string, string[]>()
    const record = (name: string, source: string): void => {
      const canonical = canonicalSuite(name)
      if (canonical === '') return
      const bucket = dispositions.get(canonical) ?? []
      bucket.push(source)
      dispositions.set(canonical, bucket)
    }
    for (const suite of included) record(suite, 'included')
    for (const suite of excluded) record(suite, 'excluded')
    for (const row of notAdmitted.rows) record(row.suite, 'notAdmitted')

    const universeSet = new Set(universe.members.map((member) => canonicalSuite(member)))
    const undisposed = universe.members.filter((member) => !dispositions.has(canonicalSuite(member)))
    const phantom = [...dispositions.keys()].filter((name) => !universeSet.has(name)).sort()
    const repeated = [...dispositions.entries()].filter(([, sources]) => sources.length > 1).map(([name, sources]) => `${name} (${sources.join(' + ')})`).sort()

    // -----------------------------------------------------------------------
    // THE RETIREMENT HALF: `outOfUniverse`. A corpus-named suite the pinned tree no longer carries
    // can never be a DISPOSITION — the phantom check below refuses a name that is not a member —
    // so it has exactly one lawful home in the block, and "it no longer exists" becomes a claim
    // this arm VERIFIES against the pin's object store instead of reading as prose. Everything is
    // computed BEFORE the expectations so that a red limb still PRINTS every offending name.
    // -----------------------------------------------------------------------
    const outOfUniverse = auxiliaryRows('outOfUniverse')
    const universeKeys = new Set(universe.members.map((member) => suiteKey(member)))
    const includedKeys = new Set(included.map((suite) => suiteKey(suite)))
    const excludedKeys = new Set(excluded.map((suite) => suiteKey(suite)))
    const notAdmittedKeys = new Set(notAdmitted.rows.map((row) => suiteKey(row.suite)))
    const outOfUniverseProblems: string[] = [...outOfUniverse.shapeProblems]
    const seenOutOfUniverse = new Set<string>()
    for (const row of outOfUniverse.rows) {
      const key = suiteKey(row.suite)
      if (key === '') continue // already named by `shapeProblems`
      const members = universe.members.filter((member) => suiteKey(member) === key)
      if (members.length > 0) {
        outOfUniverseProblems.push(
          `${row.suite}: declared OUT-OF-UNIVERSE, but the pinned tree at ${foundation.commit} DOES carry it as \`tests/${members.join('`, `tests/')}\` — ` +
            'a suite the pin carries is a DISPOSITION (included/excluded/notAdmitted), never a retirement; the claim this row makes is falsified by the universe',
        )
      }
      if (seenOutOfUniverse.has(key)) {
        outOfUniverseProblems.push(`${row.suite}: declared OUT-OF-UNIVERSE more than once — one suite, one retirement row (a repeat is not a second claim)`)
      }
      seenOutOfUniverse.add(key)
      const collisions = [includedKeys.has(key) ? 'included' : '', excludedKeys.has(key) ? 'excluded' : '', notAdmittedKeys.has(key) ? 'notAdmitted' : ''].filter((source) => source !== '')
      if (collisions.length > 0) {
        outOfUniverseProblems.push(
          `${row.suite}: declared OUT-OF-UNIVERSE and ALSO carried by ${collisions.join(' + ')} — a suite the pin does not carry cannot also have a disposition; the two rows contradict each other and only one of them can be true`,
        )
      }
    }

    console.log(`[C] universe ${universe.members.length} (${flatMembers.length} flat + ${nestedMembers.length} nested); disposed ${dispositions.size}; undisposed ${undisposed.length}; phantom ${phantom.length}; repeated ${repeated.length}; notAdmitted present=${notAdmitted.present}`)
    console.log(
      `[C/outOfUniverse] present=${outOfUniverse.present} rows=${outOfUniverse.rows.length} problem(s)=${outOfUniverseProblems.length}; ${outOfUniverse.detail}` +
        `${outOfUniverseProblems.length === 0 ? '' : `\n   ${outOfUniverseProblems.join('\n   ')}`}`,
    )

    expect(
      repeated,
      `C: no suite may be disposed TWICE — ${repeated.length} name(s) repeat across / inside the three lists: ${repeated.join(', ')}. One suite, one disposition.`,
    ).toEqual([])
    expect(
      phantom,
      `C: every disposition must name a MEMBER of the pinned universe \`${foundation.commit}:tests/**/*.test.ts\` — ${phantom.length} phantom name(s) that no such member matches: ${phantom.join(', ')}. A row naming a suite the pin does not carry is not a disposition, it is a stale record; it must be removed from the block (not added to the universe).`,
    ).toEqual([])
    expect(
      undisposed,
      `C: NO SUITE MAY BE SILENTLY SKIPPED — the pinned universe at ${foundation.commit} carries ${universe.members.length} \`${VENDORED_FILE_SUFFIX}\` suites and ${undisposed.length} of them carry NO disposition at all across \`included\`/\`excluded\`/\`notAdmitted\` (${notAdmitted.detail}). Every undisposed member, in full: ${undisposed.join(', ')}`,
    ).toEqual([])

    // -----------------------------------------------------------------------
    // THE RETIREMENT HALF, ASSERTED. The KEY's presence comes first — a block with no
    // `outOfUniverse` cannot verify a single "no longer exists" claim, and a missing key must never
    // be silent behind the membership checks below (an absent key reads as ZERO rows, which is
    // precisely a shape the rules can never fault).
    // -----------------------------------------------------------------------
    expect(
      outOfUniverse.present,
      `C: \`conformance.outOfUniverse\` must EXIST (${outOfUniverse.detail}) — keys present: ${Object.keys(readConformanceRaw()).join(', ')}. The corpus names suites the pinned tree no longer carries, and a DISPOSITION for one of them is exactly what the phantom check above refuses, so with no \`outOfUniverse\` key those claims are neither recorded nor verified: they are simply gone.`,
    ).toBe(true)
    expect(
      outOfUniverse.rows.length,
      `C: \`conformance.outOfUniverse\` carries ${outOfUniverse.rows.length} row(s) — an EMPTY list satisfies every membership rule below vacuously, so a zero-row key is a failure of THIS limb, not a pass. The count is a NON-VACUITY FLOOR (\`> 0\`), never a census: the census of corpus-retired suites is today\u2019s, and this arm gates the property (every claimed retirement is really absent from the pin), not the number.`,
    ).toBeGreaterThan(0)
    expect(
      outOfUniverseProblems,
      `C: every \`outOfUniverse\` row must be a \`{ suite, reason }\` whose \`suite\` is a non-empty name ABSENT from the pinned universe and repeated nowhere else in the block — ${outOfUniverseProblems.length} offending row(s): ${outOfUniverseProblems.join(' \u00b7 ')}`,
    ).toEqual([])
  })

  it('D — the block AGREES WITH THE DIRECTORY: the on-disk `*.test.ts` set in `vendor/Provident-Electron/tests/` IS the `included` set (no orphan file, no missing file) and intersects neither `excluded` nor `notAdmitted`', () => {
    const included = includedSuites()
    const onDisk = readdirSync(VENDOR_TESTS_DIR).filter((entry) => entry.endsWith(VENDORED_FILE_SUFFIX)).sort()
    const includedSorted = [...included].map((suite) => canonicalSuite(suite)).sort()
    const excludedSet = new Set(excludedRows().map((row) => canonicalSuite(row.suite)))
    const notAdmittedSet = new Set(notAdmittedRows().rows.map((row) => canonicalSuite(row.suite)))
    const includedSet = new Set(includedSorted)

    const orphaned = onDisk.filter((entry) => !includedSet.has(entry))
    const missing = includedSorted.filter((suite) => !onDisk.includes(suite))
    const crossedOut = onDisk.filter((entry) => excludedSet.has(entry))
    const crossedNotAdmitted = onDisk.filter((entry) => notAdmittedSet.has(entry))

    console.log(`[D] on disk ${onDisk.length}; declared included ${includedSorted.length}; orphan ${orphaned.length}; missing ${missing.length}`)

    expect(
      orphaned,
      `D: ${orphaned.length} file(s) sit in \`vendor/Provident-Electron/tests/\` while \`conformance.included\` does NOT declare them: ${orphaned.join(', ')}. An undeclared vendored copy is a leg the block does not describe — either declare it or delete it.`,
    ).toEqual([])
    expect(
      missing,
      `D: \`conformance.included\` declares ${missing.length} suite(s) with NO file in \`vendor/Provident-Electron/tests/\`: ${missing.join(', ')}. The block would name a copy the directory does not hold.`,
    ).toEqual([])
    expect(
      crossedOut,
      `D: ${crossedOut.length} file(s) in \`vendor/Provident-Electron/tests/\` are ALSO declared EXCLUDED: ${crossedOut.join(', ')} — a suite cannot be both the leg\u2019s subject and a recorded absence.`,
    ).toEqual([])
    expect(
      crossedNotAdmitted,
      `D: ${crossedNotAdmitted.length} file(s) in \`vendor/Provident-Electron/tests/\` are ALSO declared NOT-ADMITTED: ${crossedNotAdmitted.join(', ')} — a suite cannot be both the leg\u2019s subject and a recorded refusal.`,
    ).toEqual([])
  })

  it('E — the block is NOT STALE: `conformance.revision` is PRESENT AS A KEY, is a 40-hex revision equal to the lock’s `foundation.commit`, and `leg`/`config`/`placement`/`derivation` keep their pinned values', () => {
    const foundation = readFoundation()
    const block = readConformanceRaw()

    // The KEY's presence comes FIRST: a block with no `revision` cannot say which pin its split
    // was derived at, and a missing key must never be silent behind a value check.
    expect(
      Object.prototype.hasOwnProperty.call(block, 'revision'),
      `E: \`conformance.revision\` is ABSENT from vendor/foundation.lock.json's \`conformance\` block (keys present: ${Object.keys(block).join(', ')}) — a split with no derivation revision cannot be detected as stale, which is exactly what this arm exists to detect.`,
    ).toBe(true)
    const revision = block.revision
    expect(
      typeof revision === 'string' && /^[0-9a-f]{40}$/.test(revision),
      `E: \`conformance.revision\` is ${JSON.stringify(revision)} — not a 40-hex revision string (the revision the split was derived at).`,
    ).toBe(true)
    expect(
      revision,
      `E: \`conformance.revision\` reads ${JSON.stringify(revision)} while the lock's \`foundation.commit\` is ${foundation.commit} — the block was derived at a DIFFERENT pin than the one this repo vendors, so every disposition in it is stale.`,
    ).toBe(foundation.commit)

    expect(block.leg, `E: \`conformance.leg\` reads ${JSON.stringify(block.leg)} — the leg's name is \`${CONFORMANCE_LEG}\` (the script key that runs it).`).toBe(CONFORMANCE_LEG)
    expect(block.config, `E: \`conformance.config\` reads ${JSON.stringify(block.config)} — the leg's own config is \`${CONFORMANCE_CONFIG}\` (never \`vitest.config.ts\`, which the protected pin owns).`).toBe(CONFORMANCE_CONFIG)
    expect(block.placement, `E: \`conformance.placement\` reads ${JSON.stringify(block.placement)} — the leg's placement is \`${CONFORMANCE_PLACEMENT}\` (outside \`tests/**\`, so \`npm test\`'s collected census is unchanged).`).toBe(CONFORMANCE_PLACEMENT)
    const derivation = block.derivation
    expect(
      typeof derivation === 'string' && derivation.trim() !== '',
      `E: \`conformance.derivation\` is ${JSON.stringify(derivation)} — not a non-empty string naming the criterion the split was derived by. A split with no stated criterion cannot be re-derived by a reader.`,
    ).toBe(true)
    console.log(`[E] revision=${String(revision)} leg=${String(block.leg)} config=${String(block.config)} placement=${String(block.placement)} derivation≠empty=${typeof derivation === 'string' && derivation.trim() !== ''}`)
  })

  it(
    'F — the split is RE-DERIVED FROM THE BYTES, not copied: (i) INCLUDED suites’ module-under-test specifiers are all in the vendored set, (ii) EXCLUDED suites still carry an out-of-set specifier on the relative `src/` path, (iii) every `notAdmitted` criterion is mechanically re-checked against the pin blob — the two IMPORT criteria only against REAL IMPORT readings, the SAME `NON_IMPORT_KINDS` definition (i)/(ii) use (a `new URL(…)`/`path-filename` reading is a path probe, not an import) — AND `recorded` IS BOUNDED: admissible only where NO byte-checkable criterion (not `nested`, no real `src/(main|renderer)` import, no real divergent-baseline import, and it DOES carry a specifier onto the vendored fifteen) holds, (iv) DIFFERENTIAL CONTROL against `scripts/foundation-drift.mjs`’s `importSpecifiers` in a spawned child',
    () => {
      const foundation = readFoundation()
      const vendoredSet = new Set(readVendoredSetNames())
      const baselineNames = readBaselineNames()
      const included = includedSuites().map((suite) => canonicalSuite(suite))
      const excluded = excludedRows().map((row) => canonicalSuite(row.suite))
      const notAdmitted = notAdmittedRows()

      expect(
        vendoredSet.size,
        `F: the lock's \`modules\` rows declare ${vendoredSet.size} vendored module name(s) — the vendored set is the criterion\u2019s fixed point and cannot be empty.`,
      ).toBeGreaterThan(0)

      // ONE batched blob read for the fifteen declared suites (and, when it exists, for every
      // `notAdmitted` row this arm reads BYTES for). `recorded` is in this set on purpose: its BOUND
      // is that none of the byte-checkable criteria holds, which is a reading of the same blob.
      const byteCriterion: ReadonlySet<string> = new Set<string>(BYTE_CHECKABLE_CRITERIA)
      const blobRequests = [...included, ...excluded].map((suite) => ({ rev: foundation.commit, path: `tests/${suite}` }))
      for (const row of notAdmitted.rows) {
        if (byteCriterion.has(row.criterion) || row.criterion === 'recorded') blobRequests.push({ rev: foundation.commit, path: `tests/${canonicalSuite(row.suite)}` })
      }
      prefetchBlobs(blobRequests)

      const texts = new Map<string, string>()
      const unreadable: string[] = []
      for (const suite of [...included, ...excluded]) {
        const blob = blobOf(foundation.commit, `tests/${suite}`)
        if (!blob.ok) {
          unreadable.push(`${suite}: ${blob.detail}`)
          continue
        }
        if (blob.text.trim() === '') {
          unreadable.push(`${suite}: the pin blob is EMPTY — a suite with no bytes cannot be re-derived`)
          continue
        }
        texts.set(suite, blob.text)
      }
      expect(
        unreadable,
        `F: the fifteen declared suites must each have a readable, non-empty pin blob at ${foundation.commit} — ${unreadable.length} could not be read: ${unreadable.join(' \u00b7 ')}. With no bytes there is nothing to re-derive the split from.`,
      ).toEqual([])
      expect(
        texts.size,
        `F: the re-derivation must read exactly ${included.length + excluded.length} declared-suite blob(s) (the included eleven plus the excluded four); it read ${texts.size}.`,
      ).toBe(included.length + excluded.length)

      // -------------------------------------------------------------------
      // F(i) — THE INCLUDED HALF: every module-under-test specifier is in the vendored set.
      //
      // The subject is the MODULE-UNDER-TEST path: a specifier on the relative `src/` path at the
      // file's own top level (a binding), never a `new URL(…)` path read and never a row-local
      // touch. `docs/L1/unit-v-2-conformance-refresh.md` §3.4 corrected ① records why the last
      // exclusion matters: four INCLUDED suites carry a `PRE-1` row that dynamically imports the
      // fork's divergent `dom-shim.js` INSIDE a row, outside the suite's own surface resolution —
      // a recorded caveat, not a disqualifying module-under-test edge.
      // -------------------------------------------------------------------
      const includedProblems: string[] = []
      const includedReport: string[] = []
      for (const suite of included) {
        const readings = readSpecifiers(texts.get(suite) ?? '')
        const modulePath = moduleUnderTestReadings(readings)
        const inSet = namesIn(readings, vendoredSet)
        const offenders = modulePath.filter((reading) => {
          const path = srcPathOf(reading.specifier)
          return path !== null && !vendoredSet.has(path.name)
        })
        const rowLocalOutOfSet = readings.filter((reading) => {
          if (reading.depth === 0 || NON_IMPORT_KINDS.has(reading.kind)) return false
          const path = srcPathOf(reading.specifier)
          return path !== null && !vendoredSet.has(path.name)
        })
        includedReport.push(
          `${suite}: module-under-test=[${modulePath.map((reading) => `${reading.specifier}[${reading.kind}]`).join(', ') || 'none'}] in-set=[${inSet.join(', ') || 'none'}]` +
            `${rowLocalOutOfSet.length === 0 ? '' : ` row-local-touches=[${describeReadings(rowLocalOutOfSet)}]`}`,
        )
        if (inSet.length === 0) {
          includedProblems.push(`${suite}: carries NO specifier onto the vendored set at all — an INCLUDED suite whose module-under-test is not the vendored set has nothing to gate (readings: ${describeReadings(readings)})`)
        }
        if (offenders.length > 0) {
          includedProblems.push(
            `${suite}: its MODULE-UNDER-TEST path reaches ${offenders.length} specifier(s) OUTSIDE the vendored set — ${describeReadings(offenders)} (vendored set: ${[...vendoredSet].join(', ')}; the four baseline files ${baselineNames.join('/')} are a recorded caveat ONLY when row-local, never at module scope)`,
          )
        }
      }
      console.log(`[F(i)] ${included.length} INCLUDED suites re-derived: ${includedProblems.length} problem(s)\n   ${includedReport.join('\n   ')}`)
      expect(
        includedProblems,
        `F(i): every INCLUDED suite must drive its module-under-test from the vendored set — ${includedProblems.length} problem(s): ${includedProblems.join(' \u00b7 ')}`,
      ).toEqual([])

      // -------------------------------------------------------------------
      // F(ii) — THE EXCLUDED HALF: each exclusion still rests on real bytes. A suite whose
      // exclusion reason has been falsified by the pin is an exclusion that must be re-decided,
      // not kept.
      // -------------------------------------------------------------------
      const excludedProblems: string[] = []
      const excludedReport: string[] = []
      for (const suite of excluded) {
        const readings = readSpecifiers(texts.get(suite) ?? '')
        const modulePath = moduleUnderTestReadings(readings)
        const outOfSet = modulePath.filter((reading) => {
          const path = srcPathOf(reading.specifier)
          return path !== null && !vendoredSet.has(path.name)
        })
        const rowLocalOutOfSet = readings.filter((reading) => {
          if (reading.depth === 0 || NON_IMPORT_KINDS.has(reading.kind)) return false
          const path = srcPathOf(reading.specifier)
          return path !== null && !vendoredSet.has(path.name)
        })
        excludedReport.push(`${suite}: out-of-set-at-module-scope=[${describeReadings(outOfSet)}]${rowLocalOutOfSet.length === 0 ? '' : ` row-local=[${describeReadings(rowLocalOutOfSet)}]`}`)
        if (outOfSet.length === 0) {
          excludedProblems.push(
            `${suite}: the block EXCLUDES it, but at ${foundation.commit} its MODULE-UNDER-TEST path carries NO out-of-set specifier (module-scope readings: ${describeReadings(modulePath) || '(none)'}) — the exclusion\u2019s reason is falsified by the pin\u2019s own bytes and the suite must be re-decided (admitted, or excluded for a reason the bytes still show)`,
          )
        }
      }
      console.log(`[F(ii)] ${excluded.length} EXCLUDED suites re-derived: ${excludedProblems.length} problem(s)\n   ${excludedReport.join('\n   ')}`)
      expect(
        excludedProblems,
        `F(ii): every EXCLUDED suite must still carry at least one specifier OUTSIDE the vendored set on the relative \`src/\` path — ${excludedProblems.length} problem(s): ${excludedProblems.join(' \u00b7 ')}`,
      ).toEqual([])

      // -------------------------------------------------------------------
      // F(iv) — THE DIFFERENTIAL CONTROL, before F(iii), so this register proves its own reader
      // against the corpus's AST oracle even while `notAdmitted` is still missing.
      //
      // ONE child process, `--input-type=module`, dynamically importing the corpus's monitor and
      // running ITS `importSpecifiers` over the fifteen blob texts handed to it on stdin. This
      // register imports no `scripts/**` module itself.
      // -------------------------------------------------------------------
      const oracleInput = JSON.stringify(Object.fromEntries(texts))
      const oracleProgram = [
        "const { importSpecifiers } = await import('./scripts/foundation-drift.mjs')",
        "let raw = ''",
        'for await (const chunk of process.stdin) raw += chunk',
        'const texts = JSON.parse(raw)',
        'const out = {}',
        'for (const key of Object.keys(texts)) out[key] = importSpecifiers(texts[key])',
        'process.stdout.write(JSON.stringify(out))',
      ].join('\n')
      const child = spawnSync(process.execPath, ['--input-type=module', '-e', oracleProgram], {
        input: oracleInput,
        cwd: REPO_ROOT,
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024,
      })
      const childStderr = (child.stderr ?? '').trim()
      const childStatus = child.error === undefined ? child.status : null
      expect(
        child.error === undefined && child.status === 0,
        `F(iv): the AST-oracle child process must SUCCEED — it exited with status ${String(childStatus)}` +
          `${child.error === undefined ? '' : ` (spawn error: ${child.error.message})`}` +
          `${childStderr === '' ? '' : ` and wrote to stderr: ${childStderr}`}` +
          '. A failed child is a LOUD failure, never a skip: without the oracle this register has no independent reading of its own reader.',
      ).toBe(true)
      let oracleResult: Record<string, string[]> = {}
      try {
        oracleResult = JSON.parse(child.stdout ?? '{}') as Record<string, string[]>
      } catch (error) {
        throw new Error(`F(iv): the AST-oracle child's stdout is not JSON (${errorText(error)}) — read: ${JSON.stringify((child.stdout ?? '').slice(0, 400))}`)
      }
      const differentialProblems: string[] = []
      for (const suite of [...included, ...excluded]) {
        const readings = readSpecifiers(texts.get(suite) ?? '')
        const mine = new Map<string, SpecifierReading[]>()
        for (const reading of readings) {
          const bucket = mine.get(reading.specifier) ?? []
          bucket.push(reading)
          mine.set(reading.specifier, bucket)
        }
        const oracle = Array.isArray(oracleResult[suite]) ? oracleResult[suite] : []
        if (oracle.length === 0) {
          differentialProblems.push(`${suite}: the corpus's oracle read ZERO specifiers from the pin blob — the control has no baseline for this suite (the oracle and this reader must both read the same eleven-and-four suites)`)
        }
        const missingFromReader = oracle.filter((specifier) => !mine.has(specifier))
        if (missingFromReader.length > 0) {
          differentialProblems.push(
            `${suite}: this register's reader MISSED ${missingFromReader.length} specifier(s) the corpus's AST oracle \`importSpecifiers\` found: ${missingFromReader.join(', ')} — the reader must be a SUPERSET of the oracle`,
          )
        }
        const extra = [...mine.keys()].filter((specifier) => !oracle.includes(specifier))
        const unenumerated = extra.filter((specifier) => {
          const kinds = (mine.get(specifier) ?? []).map((reading) => reading.kind)
          // The enumerated extra forms: `ImportTypeNode` (`import type`/`typeof import(…)`), the
          // `new URL(…)` path, the computed array-join form, and `vi.mock`/`importActual`.
          return !kinds.some((kind) => kind === 'new-url' || kind === 'array-join' || kind === 'vi-mock' || kind === 'dynamic')
        })
        if (unenumerated.length > 0) {
          differentialProblems.push(
            `${suite}: this register's reader read ${unenumerated.length} specifier(s) the oracle did NOT and that NO enumerated extra form accounts for: ${unenumerated.join(', ')} — ` +
              'the enumerated extra forms are `import type`/`typeof import(…)` (ImportTypeNode), `new URL(\'…\', import.meta.url)`, the computed `[\'..\',\'src\',\'shared\',\'<x>.js\'].join(\'/\')` form, and `vi.mock`/`vi.importActual`/`vi.importMock`',
          )
        }
      }
      console.log(`[F(iv)] oracle child exit=${String(childStatus)}; suites compared=${Object.keys(oracleResult).length}; differential problem(s)=${differentialProblems.length}`)
      expect(
        differentialProblems,
        `F(iv): DIFFERENTIAL CONTROL — this register's specifier reader must be a SUPERSET of \`scripts/foundation-drift.mjs\`\u2019s \`importSpecifiers\` on all ${included.length + excluded.length} declared suites, and every specifier it alone sees must be one of the enumerated extra forms — ${differentialProblems.length} problem(s): ${differentialProblems.join(' \u00b7 ')}`,
      ).toEqual([])

      // -------------------------------------------------------------------
      // F(i)-CONTROL — THE SYNTHETIC FIXTURE. The reader must be shown to DISCRIMINATE inside
      // this very arm: a specifier on a different line from its `from` is found, one inside a
      // comment is NOT found, and the computed array-join form is reconstructed. A reader that
      // silently read nothing would satisfy every superset comparison above.
      // -------------------------------------------------------------------
      const synthetic = [
        "import {",
        '  alpha,',
        '  beta,',
        "} from '../src/shared/zones.js'",
        "// import { hidden } from '../src/shared/commented-line.js'",
        "/* import { alsoHidden } from '../src/shared/commented-block.js' */",
        "const reconstructed = ['..', 'src', 'shared', 'dom-shim.js'].join('/')",
      ].join('\n')
      const syntheticSpecifiers = readSpecifiers(synthetic).map((reading) => reading.specifier)
      expect(
        syntheticSpecifiers,
        'F(i)-CONTROL: the specifier reader must read the MULTI-LINE static import and the reconstructed array-join form, and must NOT read either the `//` or the `/* */` commented specifier.',
      ).toEqual(['../src/shared/zones.js', '../src/shared/dom-shim.js'])
      expect(
        syntheticSpecifiers.includes('//src/shared/commented-line.js') || syntheticSpecifiers.some((specifier) => specifier.includes('commented')),
        'F(i)-CONTROL: a specifier mentioned in a COMMENT must never be read as an import — the fixture carries two and the reader found one.',
      ).toBe(false)

      // -------------------------------------------------------------------
      // F(iii) — THE NOT-ADMITTED CLASSES, re-derived per suite. This is the authored RED of this
      // unit: a block with no `notAdmitted` cannot dispose of the universe, and arm `C` says so
      // too. Nothing below is relaxed to make a missing key pass.
      //
      // THE IMPORT TAGS ARE EVIDENCE ABOUT IMPORTS, AND ONLY ABOUT IMPORTS. `foundation-tree-import`
      // and `divergent-baseline-import` are re-derived from `importReadings(…)` — the complement of
      // `NON_IMPORT_KINDS`, i.e. the SAME definition arms `F(i)`/`F(ii)` apply through
      // `moduleUnderTestReadings`. A `new URL('../src/renderer/x.ts', import.meta.url)` reading is a
      // `path-filename` PROBE (`existsSync`/`readFileSync`/`fileURLToPath`), not an import: it opens
      // no module, so it can justify neither tag. Measured consequence: a "headstone" row that
      // asserts the ABSENCE of a path the pin DELETED satisfies the old, unfiltered limb — a tag a
      // non-import reading can satisfy is not evidence about the suite's import closure.
      // `nested` and `no-in-set-specifier` read the NAME and the FULL READING LIST (their subjects
      // are not module bindings); `recorded` is BOUNDED below.
      // -------------------------------------------------------------------
      expect(
        notAdmitted.present,
        `F(iii): the block\u2019s \`notAdmitted\` disposition must EXIST (${notAdmitted.detail}) — the pinned universe carries ${universeCountForMessage()} suites and the block declares only ${included.length + excluded.length}, so a flat per-suite \`notAdmitted\` array is the only thing that can dispose of the rest. ` +
          'Each row is `{suite, class, criterion, reason}` with `criterion` ∈ ' + NOT_ADMITTED_CRITERIA.join('/') + '.',
      ).toBe(true)
      expect(
        notAdmitted.rows.length,
        `F(iii): \`notAdmitted\` carries ${notAdmitted.rows.length} row(s) — the pinned universe's remaining suites must each have a classed row (a flat per-suite array, one object per suite), never a count and never "the rest".`,
      ).toBeGreaterThan(0)

      const rowProblems: string[] = []
      let probeOnlyRows = 0
      let recordedRows = 0
      let recordedBoundViolations = 0
      for (const row of notAdmitted.rows) {
        const suite = canonicalSuite(row.suite)
        if (suite === '') {
          rowProblems.push('a `notAdmitted` row carries no `suite` name — a disposition that names nothing disposes of nothing')
          continue
        }
        if (!(NOT_ADMITTED_CRITERIA as ReadonlyArray<string>).includes(row.criterion)) {
          rowProblems.push(`${suite}: \`criterion\` reads ${JSON.stringify(row.criterion)} — not one of the five enumerated tags (${NOT_ADMITTED_CRITERIA.join(', ')})`)
          continue
        }
        if (row.className === '') rowProblems.push(`${suite}: the row carries no \`class\` — every not-admitted suite is classed, and an unclassed row cannot be audited`)
        if (row.reason === '') rowProblems.push(`${suite}: the row carries no \`reason\` — every class carries a one-line reason, and a row without one is indistinguishable from a suite nobody got to`)

        if (row.criterion === 'nested') {
          if (!suite.includes('/')) {
            rowProblems.push(`${suite}: classed \`nested\`, but the name carries no \`/\` after \`tests/\` — it is a FLAT suite at the leg\u2019s own placement depth, so this criterion does not hold`)
          }
          continue
        }
        // -----------------------------------------------------------------
        // F(iii)-`recorded` — THE BOUND (the adversarial pass's ONE material finding, `A-1` in
        // `docs/L1/unit-v-2-conformance-refresh.md` §7.7). This limb used to `continue` here, so a
        // block could re-label every classifiable suite `recorded` with an arbitrary `class` and all
        // eight arms stayed green: "`recorded` is reserved for the rulings a corpus row owns — today
        // exactly one" was PROSE with no arm behind it. It is now a reading, and it is the SAME
        // reading the criteria above take: the same `readSpecifiers` bytes, the same `namesIn`
        // in-set test `no-in-set-specifier` uses, and the same `importReadings` complement of
        // `NON_IMPORT_KINDS` the two import tags use — one definition, never a second reader. The
        // four conditions are the criteria read in the NEGATIVE: no real `src/(main|renderer)` import,
        // no real divergent-baseline import, AT LEAST ONE specifier onto the vendored fifteen (so
        // `no-in-set-specifier` does not hold), and not nested.
        //
        // WHAT IT DOES NOT DO: it does not grep the row's `reason` for a citation. A phrase scan is
        // not a citation check (the same honesty rule arm `G(ii)` states about itself), so the
        // message instead states WHICH corpus ruling a lawful `recorded` row is expected to cite.
        // -----------------------------------------------------------------
        if (row.criterion === 'recorded') {
          recordedRows += 1
          const recordedBlob = blobOf(foundation.commit, `tests/${suite}`)
          if (!recordedBlob.ok) {
            recordedBoundViolations += 1
            rowProblems.push(
              `${suite}: classed \`recorded\`, but its pin blob is UNREADABLE so the bound cannot be taken — ${recordedBlob.detail}. ` +
                'A `recorded` row is admissible ONLY where NO byte-checkable criterion holds, and "the pin\'s bytes could not be read" is not that reading: with no blob this row states a ruling nobody can audit.',
            )
            continue
          }
          const recordedReadings = readSpecifiers(recordedBlob.text)
          const recordedImports = importReadings(recordedReadings)
          const satisfiedByBytes: string[] = []
          if (suite.includes('/')) {
            satisfiedByBytes.push(
              `\`nested\` — the name carries a \`/\` after \`tests/\` (${JSON.stringify(suite)}), so it cannot occupy the leg's flat placement`,
            )
          }
          const foundationTreeHits = recordedImports.filter((reading) => FOUNDATION_TREE_IMPORT_SUBJECT.test(reading.specifier))
          if (foundationTreeHits.length > 0) {
            satisfiedByBytes.push(
              `\`foundation-tree-import\` — ${foundationTreeHits.length} REAL IMPORT reading(s) match ${FOUNDATION_TREE_IMPORT_SUBJECT_TEXT}: ${describeReadings(foundationTreeHits)}`,
            )
          }
          const divergentHits = recordedImports.filter((reading) => DIVERGENT_BASELINE_IMPORT_SUBJECT.test(reading.specifier))
          if (divergentHits.length > 0) {
            satisfiedByBytes.push(
              `\`divergent-baseline-import\` — ${divergentHits.length} REAL IMPORT reading(s) match ${DIVERGENT_BASELINE_IMPORT_SUBJECT_TEXT}: ${describeReadings(divergentHits)}`,
            )
          }
          const recordedInSet = namesIn(recordedReadings, vendoredSet)
          if (recordedInSet.length === 0) {
            satisfiedByBytes.push('`no-in-set-specifier` — it carries NO specifier onto the vendored fifteen')
          }
          if (satisfiedByBytes.length > 0) {
            recordedBoundViolations += 1
            rowProblems.push(
              `${suite}: \`criterion\` "recorded" is INADMISSIBLE (the row\u2019s \`class\` reads ${JSON.stringify(row.className)}) \u2014 at ${foundation.commit} its pin blob\u2019s OWN BYTES satisfy ${satisfiedByBytes.join(' \u00b7 ')}. ` +
                'A `recorded` row is admissible ONLY where NO byte-checkable criterion holds: `recorded` is a corpus ruling the bytes cannot re-derive \u2014 not a hiding place \u2014 so emit the criterion these bytes satisfy (and the class it implies). ' +
                'The one corpus ruling that lawfully takes `recorded` today is `STORE-WIRING-ABSENT` (`tests/store-modules-bytes.test.ts`, `unit-foundation-rerevendor-2026-10-04.md` \u00a72.3, D-15/D-20), and a `recorded` row\u2019s `reason` is expected to cite exactly that ruling.',
            )
          }
          continue
        }

        const blob = blobOf(foundation.commit, `tests/${suite}`)
        if (!blob.ok) {
          rowProblems.push(`${suite}: classed \`${row.criterion}\`, but its pin blob is unreadable so the class cannot be re-derived — ${blob.detail}`)
          continue
        }
        const readings = readSpecifiers(blob.text)
        if (row.criterion === 'no-in-set-specifier') {
          const inSet = namesIn(readings, vendoredSet)
          if (inSet.length > 0) {
            rowProblems.push(
              `${suite}: classed \`no-in-set-specifier\`, but at ${foundation.commit} it DOES carry specifier(s) onto the vendored set (${inSet.join(', ')}) — read: ${describeReadings(readings)}`,
            )
          }
        } else if (row.criterion === 'foundation-tree-import' || row.criterion === 'divergent-baseline-import') {
          // THE ONE IMPORT/ PROBE LINE. `importReadings` is `!NON_IMPORT_KINDS.has(kind)` — the exact
          // filter `moduleUnderTestReadings` (and therefore `F(i)`/`F(ii)`) uses, not a second
          // definition that could drift from it.
          const subject = row.criterion === 'foundation-tree-import' ? FOUNDATION_TREE_IMPORT_SUBJECT : DIVERGENT_BASELINE_IMPORT_SUBJECT
          const subjectText = row.criterion === 'foundation-tree-import' ? FOUNDATION_TREE_IMPORT_SUBJECT_TEXT : DIVERGENT_BASELINE_IMPORT_SUBJECT_TEXT
          const imports = importReadings(readings).filter((reading) => subject.test(reading.specifier))
          const probes = pathProbeReadings(readings).filter((reading) => subject.test(reading.specifier))
          if (imports.length === 0) {
            if (probes.length > 0) probeOnlyRows += 1
            const probeNote =
              probes.length === 0
                ? ''
                : ' — its only `src/…` readings are path probes, not imports — class it `recorded` with the corpus ruling, or cite a real import' +
                  ` (the probe(s): ${describeReadings(probes)})`
            rowProblems.push(
              `${suite}: classed \`${row.criterion}\`, but at ${foundation.commit} its pin blob carries NO IMPORT reading matching ${subjectText}` +
                `${probeNote} — a \`new URL('…', import.meta.url)\` / \`path-filename\` reading builds an \`fs\` PATH, not a module binding, so it is a path probe and NOT an import, and cannot justify an import criterion; this is the SAME \`NON_IMPORT_KINDS\` definition arms F(i)/F(ii) apply through \`moduleUnderTestReadings\` (import readings: [${describeReadings(imports)}]; all readings: ${describeReadings(readings)})`,
            )
          }
        }
      }
      console.log(
        `[F(iii)] notAdmitted rows=${notAdmitted.rows.length}; import criteria re-derived from REAL import readings only (\`NON_IMPORT_KINDS\` = ${[...NON_IMPORT_KINDS].join(', ')}); probe-justified row(s)=${probeOnlyRows}; ` +
          `\`recorded\` row(s)=${recordedRows} (bound: none of ${BYTE_CHECKABLE_CRITERIA.join('/')} and not \`nested\`); bound violation(s)=${recordedBoundViolations}; problem(s)=${rowProblems.length}`,
      )
      expect(
        rowProblems,
        `F(iii): every \`notAdmitted\` criterion must be MECHANICALLY re-derivable from that suite\u2019s pin blob at ${foundation.commit} — the two IMPORT criteria (\`foundation-tree-import\`, \`divergent-baseline-import\`) only from REAL IMPORT readings, the SAME \`NON_IMPORT_KINDS\` definition arms F(i)/F(ii) apply through \`moduleUnderTestReadings\` (a \`new URL('…', import.meta.url)\` / \`path-filename\` reading is a path probe, not an import, and cannot justify an import criterion) — and \`recorded\` is BOUNDED: admissible only where NO byte-checkable criterion (\`nested\`, the two import tags, \`no-in-set-specifier\`) holds, so a row the bytes can classify cannot hide there — ${rowProblems.length} violating row(s): ${rowProblems.join(' \u00b7 ')}`,
      ).toEqual([])
    },
    30000,
  )

  it('G — the NO-GREEN-WORD and prohibition arm: no vendored copy carries the `R-4`/`X-9` forbidden electron mock, and this register’s own source declares its layer, is not truncated, and claims no leg pass', () => {
    // -----------------------------------------------------------------------
    // G(i) — THE ABSOLUTE PROHIBITION (`R-4`/`X-9`): no suite filed under the leg may mock the
    // electron module. The needle is ASSEMBLED from fragments so this register's own text cannot
    // be mistaken for a violation by any self-scan.
    // -----------------------------------------------------------------------
    const electronMockNeedle = new RegExp('vi' + '\\.mock\\(\\s*' + '[\'"]' + 'electron' + '[\'"]')
    const vendoredFiles = readdirSync(VENDOR_TESTS_DIR).filter((entry) => entry.endsWith(VENDORED_FILE_SUFFIX)).sort()
    expect(
      vendoredFiles.length,
      `G(i): \`vendor/Provident-Electron/tests/\` holds ${vendoredFiles.length} \`${VENDORED_FILE_SUFFIX}\` file(s) — an empty directory would satisfy the prohibition vacuously, so a file count of zero is a failure, not a pass.`,
    ).toBeGreaterThan(0)
    const offenders: string[] = []
    let scanned = 0
    for (const entry of vendoredFiles) {
      const path = join(VENDOR_TESTS_DIR, entry)
      const text = readText(path)
      scanned += 1
      const hit = electronMockNeedle.exec(text)
      if (hit !== null) {
        const line = text.slice(0, hit.index).split('\n').length
        offenders.push(`${entry}:${line} carries ${JSON.stringify(hit[0])}`)
      }
    }
    console.log(`[G(i)] scanned ${scanned}/${vendoredFiles.length} vendored copy(ies); electron-mock offender(s)=${offenders.length}`)
    expect(
      scanned,
      `G(i): the prohibition sweep must have scanned EVERY vendored copy — it scanned ${scanned} of ${vendoredFiles.length} (a file that was not read cannot be cleared).`,
    ).toBe(vendoredFiles.length)
    expect(
      offenders,
      `G(i): the \`R-4\`/\`X-9\` ABSOLUTE PROHIBITION — no suite filed under the leg may mock the electron module; ${offenders.length} offender(s): ${offenders.join(' \u00b7 ')}`,
    ).toEqual([])

    // -----------------------------------------------------------------------
    // G(ii) — THE NO-GREEN-WORD ARM, over THIS FILE's own source. The forbidden claims are
    // assembled from fragments, for the same self-reference reason: a scanner must not be
    // satisfiable (or trippable) by its own text.
    // -----------------------------------------------------------------------
    const source = readText(REGISTER_PATH)
    const lines = source.split('\n')
    const REQUIRED_LAYER_MARKER = '// LAYER (RCA-12)'

    const layerLineOf = (text: string): string | null => {
      for (const line of text.split('\n')) {
        if (line.startsWith(REQUIRED_LAYER_MARKER)) return line
      }
      return null
    }
    // NON-VACUITY: the same reader must return `null` on a text that carries no such line.
    expect(
      layerLineOf('// a register with no declared layer\nit("claims everything")\n'),
      'G(ii): the layer-line reader must return null for a source that declares no layer — otherwise its reading of this file proves nothing.',
    ).toBeNull()
    const layerLine = layerLineOf(source)
    expect(
      layerLine,
      `G(ii): this register's own source must declare its layer on a line beginning \`${REQUIRED_LAYER_MARKER}\` — the corpus's honesty rule is that a register states what it can and cannot prove BEFORE its arms, so a truncated or layer-less file is a failure here.`,
    ).not.toBeNull()
    expect(
      (layerLine ?? '').includes('[T]'),
      `G(ii): the declared layer line reads ${JSON.stringify(layerLine)} — it must name the \`[T]\`/\`[D]\` byte-and-revision class this register actually is.`,
    ).toBe(true)

    // A TRUNCATION FLOOR: a file cut short could satisfy every phrase check above by carrying
    // almost nothing.
    expect(
      lines.length,
      `G(ii): this register's source is ${lines.length} line(s) — a file this short cannot carry eight arms, their readers and their messages; the assert is a truncation floor, so a cut-short file never passes the phrase checks by vacuity.`,
    ).toBeGreaterThan(400)
    // THE ARM-ROW COUNT is asserted precisely so the file cannot be truncated ARM-BY-ARM: a limb
    // that is deleted, commented out or renamed disappears from this list, and this row reds. It
    // must therefore grow with every arm added.
    const armRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].filter((id) => new RegExp(`it\\(\\s*'${id} \u2014`).test(source))
    expect(
      armRows,
      `G(ii): the register must carry one \`it(...)\` row per arm id — rows found: ${armRows.join(', ') || '(none)'}. A missing row is a missing arm, and this row exists exactly so the file cannot be truncated.`,
    ).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])

    const forbiddenClaims = ['conformance leg ' + 'is green', 'leg ' + 'passes', 'app' + '-green']
    const NEGATORS = /\b(?:not|never|no|nor|isn't|cannot|without|proves\s+nothing|nothing)\b/i
    const affirmativeHits = (text: string, phrase: string): string[] => {
      const hits: string[] = []
      const needle = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      let match = needle.exec(text)
      while (match !== null) {
        const before = text.slice(Math.max(0, match.index - 60), match.index)
        if (!NEGATORS.test(before)) {
          hits.push(`line ${text.slice(0, match.index).split('\n').length}: …${text.slice(Math.max(0, match.index - 60), match.index + match[0].length)}…`)
        }
        match = needle.exec(text)
      }
      return hits
    }
    // NON-VACUITY: the detector must CATCH an affirmative claim, or its silence over this file
    // means nothing.
    const syntheticClaim = `the ${forbiddenClaims[0]} and this register is ${forbiddenClaims[2]}`
    expect(
      affirmativeHits(syntheticClaim, forbiddenClaims[0]).length,
      'G(ii): the affirmative-use detector must catch the first forbidden claim in a synthetic text that asserts it — a detector that never fires would clear any file.',
    ).toBe(1)
    expect(
      affirmativeHits(syntheticClaim, forbiddenClaims[2]).length,
      'G(ii): the affirmative-use detector must catch the second forbidden claim in the same synthetic text.',
    ).toBe(1)

    const claimProblems: string[] = []
    for (const phrase of forbiddenClaims) {
      for (const hit of affirmativeHits(source, phrase)) {
        claimProblems.push(`${JSON.stringify(phrase)} is asserted AFFIRMATIVELY — ${hit}`)
      }
    }
    console.log(`[G(ii)] layer declared=${layerLine !== null}; lines=${lines.length}; arm rows=${armRows.length}; affirmative claim(s)=${claimProblems.length}`)
    expect(
      claimProblems,
      `G(ii): this register must make NO affirmative claim that the conformance leg passed, and must never call any reading app-green (a negated mention such as "it is never app-green" IS the point of the layer statement, and is allowed); ${claimProblems.length} claim(s): ${claimProblems.join(' \u00b7 ')}. The leg's own class-labelled tally is NOT this register's evidence, and a register green is NOT a leg pass.`,
    ).toEqual([])
  })

  it('H — the block’s AUXILIARY ROWS are well-formed: `caveats` EXISTS, every caveat names a declared INCLUDED suite with a non-empty `reason` and repeats nowhere, and every `outOfUniverse` row carries a non-empty `reason` and a name ABSENT from the pin’s universe (the presence half of that key is arm `C`’s)', () => {
    // -----------------------------------------------------------------------
    // WHAT THIS ARM GATES, AND WHY NO COUNT IS ASSERTED.
    //
    // `caveats` records, per suite, the class-(iii) residue that makes a GREEN row of the leg
    // uninformative: `docs/L1/unit-v-2-conformance-refresh.md` §3.4 corrected ① measures four
    // INCLUDED suites (`container`, `overlay`, `menu-template`, `theme`) each carrying an UNGUARDED
    // `PRE-1` harness-precondition row that dynamically imports
    // `['..','src','shared','dom-shim.js'].join('/')` and asserts a member of THIS FORK's divergent
    // shim — ⟨CORRECTED 2026-11-15 (`V-2`'s exit walkthrough): this comment read "so that row PASSES
    // here and evidences NOTHING about the pinned copy". MEASURED — the four `PRE-1` rows FAIL, not
    // PASS: `Cannot find module …/vendor/Provident-Electron/src/shared/dom-shim.js`, because
    // `vendor/Provident-Electron/src/` does not exist at the leg's placement, so the computed
    // specifier cannot resolve and each row reds structurally (four rows of the leg's `511` failed /
    // `59` passed (`570`) · `docs/L1/unit-v-2-conformance-refresh.md` §3.4 corrected ① and §7.6, and
    // the lock's own `caveats`, carry the same correction). The conclusion the comment drew still
    // holds — the row evidences NOTHING about the pinned copy — but for the corrected reason: it
    // never resolves, rather than resolving against this fork's shim. A dated note only: no
    // assertion, limb or expected value of this arm changes with it.⟩
    // `outOfUniverse` records the corpus-named suites the pinned tree no longer carries (§3.5's
    // `OUT-OF-UNIVERSE`).
    //
    // The arm asserts the SHAPE and the MEMBERSHIP RULES of both lists, never the census. A
    // hardcoded `4` or `7` would be today's count re-typed as an oracle: it would red the day a
    // residue is recorded or a suite is retired (a fresh measurement read as a failure) while
    // passing a block whose four rows say the wrong thing about the wrong suites. What a reader
    // needs is the PROPERTY — a caveat may only sit on a suite the leg actually runs, a retirement
    // may only name a name the pin really does not carry — so the counts are PRINTED, and the only
    // numeric asserts are non-vacuity floors (`> 0`): an empty list satisfies every membership rule
    // vacuously, so a key that says nothing must not pass as a key that said something.
    //
    // WHAT IT DOES NOT PROVE: that a caveat is COMPLETE — that every INCLUDE'd suite carrying a
    // class-(iii) residue has a row, and that each reason names the mechanism it claims. That is a
    // reading of the suites' own bytes (§3.4①, arm `F`'s row-local report), not of the block's
    // shape, and a shape arm must not pretend to it.
    // -----------------------------------------------------------------------
    const foundation = readFoundation()
    const block = readConformanceRaw()
    const caveats = auxiliaryRows('caveats')
    const outOfUniverse = auxiliaryRows('outOfUniverse')

    const included = includedSuites()
    const includedKeys = new Set(included.map((suite) => suiteKey(suite)))
    const excludedKeys = new Set(excludedRows().map((row) => suiteKey(row.suite)))
    const notAdmittedKeys = new Set(notAdmittedRows().rows.map((row) => suiteKey(row.suite)))
    const universe = readUniverseSampling()
    const universeKeys = new Set(universe.members.map((member) => suiteKey(member)))

    // THE CAVEAT LEDGER: a caveat claims "this suite's green rows are uninformative". A suite the
    // block does not run has no green rows, so a caveat on it says nothing about anything.
    const caveatProblems: string[] = [...caveats.shapeProblems]
    const seenCaveats = new Set<string>()
    for (const row of caveats.rows) {
      const key = suiteKey(row.suite)
      if (key === '') continue // already named by `shapeProblems`
      if (!includedKeys.has(key)) {
        const where = [excludedKeys.has(key) ? 'declared EXCLUDED' : '', notAdmittedKeys.has(key) ? 'declared NOT-ADMITTED' : ''].filter((source) => source !== '')
        caveatProblems.push(
          `${row.suite}: carries a CAVEAT, but it is NOT a declared INCLUDED suite (${where.length === 0 ? 'it is not declared anywhere in the block' : where.join(' and ')}) — ` +
            `a caveat is a statement about a suite's GREEN ROWS, so a caveat on a suite the leg does not run is a misplaced claim: it reads as a recorded residue while qualifying nothing. Included: ${included.join(', ')}`,
        )
      }
      if (seenCaveats.has(key)) {
        caveatProblems.push(`${row.suite}: carries MORE THAN ONE caveat row — one suite, one recorded residue (two rows leave a reader unable to say which residue a green row hides)`)
      }
      seenCaveats.add(key)
    }

    // THE RETIREMENT LEDGER (the half arm `C` does not own): a `reason` that is really a reason, a
    // name really absent from the pin, and no name colliding with a disposition. Arm `C` owns the
    // KEY's existence and the presence/absence half; this arm re-reads it so the auxiliary rows are
    // gated in one place and a retirement row cannot be well-formed by one arm's reading only.
    const retirementProblems: string[] = [...outOfUniverse.shapeProblems]
    const seenRetirements = new Set<string>()
    if (!universe.ok) {
      retirementProblems.push(`the pinned universe is UNREADABLE (${universe.detail}), so "absent from the pin" cannot be verified for any \`outOfUniverse\` row`)
    }
    for (const row of outOfUniverse.rows) {
      const key = suiteKey(row.suite)
      if (key === '') continue // already named by `shapeProblems`
      if (universe.ok && universeKeys.has(key)) {
        retirementProblems.push(`${row.suite}: declared OUT-OF-UNIVERSE, but the pinned tree at ${foundation.commit} DOES carry it — the retirement is falsified by the universe itself`)
      }
      const collisions = [includedKeys.has(key) ? 'included' : '', excludedKeys.has(key) ? 'excluded' : '', notAdmittedKeys.has(key) ? 'notAdmitted' : ''].filter((source) => source !== '')
      if (collisions.length > 0) {
        retirementProblems.push(`${row.suite}: declared OUT-OF-UNIVERSE and ALSO carried by ${collisions.join(' + ')} — a suite the pin does not carry cannot also hold a disposition`)
      }
      if (seenRetirements.has(key)) retirementProblems.push(`${row.suite}: declared OUT-OF-UNIVERSE more than once — one suite, one retirement row`)
      seenRetirements.add(key)
    }

    console.log(
      `[H] caveats present=${caveats.present} rows=${caveats.rows.length} (${caveats.rows.map((row) => row.suite).join(', ') || 'none'}) problem(s)=${caveatProblems.length}; ` +
        `outOfUniverse present=${outOfUniverse.present} rows=${outOfUniverse.rows.length} problem(s)=${retirementProblems.length}; block keys=[${Object.keys(block).join(', ')}]` +
        `${caveatProblems.length + retirementProblems.length === 0 ? '' : `\n   ${[...caveatProblems, ...retirementProblems].join('\n   ')}`}`,
    )

    expect(
      caveats.present,
      `H: \`conformance.caveats\` must EXIST (${caveats.detail}) — keys present: ${Object.keys(block).join(', ')}. Without it the block cannot say WHICH of the leg's green rows are uninformative, so the leg's tally would be read as copy fidelity with no record that four INCLUDED suites carry a \`PRE-1\` row asserting THIS FORK's divergent \`dom-shim\` (\`docs/L1/unit-v-2-conformance-refresh.md\` §3.4 corrected ①).`,
    ).toBe(true)
    expect(
      caveats.rows.length,
      `H: \`conformance.caveats\` carries ${caveats.rows.length} row(s) — an EMPTY list satisfies every membership rule below vacuously, so a zero-row key is a failure of THIS limb, not a pass. This is a NON-VACUITY FLOOR (\`> 0\`), deliberately NOT a census: the number of caveated suites is a measurement (§3.4①'s four today), and hardcoding it would turn the next honest measurement into a red.`,
    ).toBeGreaterThan(0)
    expect(
      caveatProblems,
      `H: every \`caveats\` row must name a declared INCLUDED suite, carry a non-empty \`reason\`, and repeat no suite — ${caveatProblems.length} offending row(s): ${caveatProblems.join(' \u00b7 ')}`,
    ).toEqual([])
    expect(
      outOfUniverse.present,
      `H: \`conformance.outOfUniverse\` must EXIST (${outOfUniverse.detail}) — the auxiliary rows are gated together, so a block that states its caveats but silently drops the corpus's retired suites is not well-formed either.`,
    ).toBe(true)
    expect(
      outOfUniverse.rows.length,
      `H: \`conformance.outOfUniverse\` carries ${outOfUniverse.rows.length} row(s) — a zero-row list cannot distinguish "the corpus named no absent suite" from "nobody recorded them"; a NON-VACUITY FLOOR only, never a census (arm \`C\` owns the key's presence and the absence measurement).`,
    ).toBeGreaterThan(0)
    expect(
      retirementProblems,
      `H: every \`outOfUniverse\` row must carry a non-empty \`reason\` and a \`suite\` ABSENT from the pinned universe at ${foundation.commit}, colliding with no disposition and repeating nowhere — ${retirementProblems.length} offending row(s): ${retirementProblems.join(' \u00b7 ')}`,
    ).toEqual([])
  })
})

/** A one-line census of the universe reader's output, for the non-vacuity messages. */
function universalSummary(members: string[]): string {
  return `${members.length} member(s): ${members.slice(0, 5).join(', ')}${members.length > 5 ? ', …' : ''}`
}

/** The pinned universe's size, for arm `F(iii)`'s message. Read once, and only when it is needed:
 *  an unreadable tree reads as `'an unreadable universe'` rather than silently as zero. */
function universeCountForMessage(): string {
  const universe = readUniverseSampling()
  return universe.ok ? String(universe.members.length) : 'an unreadable universe'
}
