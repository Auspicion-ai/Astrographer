#!/usr/bin/env node
// scripts/foundation-drift.mjs — the `A3` cross-tree drift monitor (unit `PD-VENDOR`).
//
// CONTRACT: docs/specs/unit-pd-vendor-foundation-mechanisms.md
//   §1.1 item 3 / §2.3 — a node script (no Electron, no build, no network) that reads
//     `vendor/foundation.lock.json`, hashes each vendored module, and — iff
//     `<foundation.path>/src/shared/` is a readable directory — hashes the
//     foundation's sibling file and compares. Its situation table + exit codes:
//       foundation tree absent                       -> SKIPPED, exit 0, NOT a failure
//       foundation present, every module byte-equal  -> `CLEAN`, exit 0
//       foundation present, one or more differ       -> each named with BOTH digests,
//                                                       plus whether the local copy still
//                                                       matches the MANIFEST, non-zero exit
//       manifest missing / unparsable / count != 15  -> loud failure, non-zero exit
//       a vendored module missing from src/shared/   -> loud failure naming the path, non-zero
//       foundation file present but unreadable       -> loud failure naming path + error, non-zero
//   §2.3 honesty rules — (1) the absent-tree case is a SKIP, never a pass and never a
//     failure (the fork must work standalone); (2) the monitor reads FILES and compares
//     BYTES: it asserts nothing about behaviour, imports, types or the app. Its layer is
//     `[D]`-class local instrument, and a CLEAN reading is NOT app evidence.
//   §3.4 — read-only (no writes, no `git` mutation, no install, no network); invoked by a
//     named script (`package.json` -> `drift`); it never blocks `npm test` (it lives at
//     `scripts/**`, outside `vitest.config.ts`'s `tests/**` include).
//   §6.1 item 2 — the monitor EXPOSES A PURE COMPARATOR
//     (`compareFoundation({ manifest, vendoredBytes, foundationBytes | null })`) so
//     `P-TP-2`'s five situations are drivable without touching a real tree.
//
// §3a ADVERSARIAL CORRECTIONS LANDED IN THIS FILE (each is the `HOST-FIX` the
// finding's own disposition names; none of them weakens a row):
//   `A-3` (HIGH) — THE PIN IS AN INSTRUMENT, NOT A RECORD. The comparator now
//     CONSUMES `manifest.foundation.commit` and the adjacent tree's own revision:
//     a foundation tree whose BYTES are equal at a DIFFERENT commit is NOT the
//     pinned state and does not read `CLEAN`. The CLI reads the revision with a
//     read-only `git -C <foundation> rev-parse HEAD`. **A `SKIPPED` reading proves
//     NOTHING about the pin** (there is no tree to read), and the same is stated for
//     the byte-equal-not-pinned reading: the bytes being equal is not the pin.
//   `A-4` (MED)  — the manifest arm asserts the declared NAME SET is set-equal to the
//     pin's fifteen (counts are not the assertion), and the reading reports a
//     DISTINCT-FILE count, never an entry count.
//   `A-5` (MED)  — the LOCAL arm rejects a SYMLINKED vendored module: byte-identity
//     is satisfied by a symlink, and `R-1` requires the modules "copied in as
//     source". The rule is an exported, drivable oracle (`isRegularFile`).
//   `A-10` (MED) — the import-closure oracle is AST-based (`importSpecifiers`), over
//     `ImportDeclaration` (bare and multi-line included), `ImportExpression` and a
//     `require` `CallExpression` — never a single-line regex.
//   `A-11` (MED) — `shapeMembers(sourceText, shape)` AST-extracts a shape's member
//     names, so a structurally wrong mirror in `src/shared/foundation-return-shapes.ts`
//     is a loud failure rather than a silent drift.
//
// This file was authored by the PD-VENDOR Implementer pass and RUNS NOTHING on import.

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

/** The manifest's pinned module count (§2.2 rule 1). */
export const EXPECTED_MODULE_COUNT = 15

/** §2.1 item 1 — the pin's fifteen-name list. The declared name set is compared to
 *  THIS, never to a count (`A-4`). */
export const PINNED_MODULE_NAMES = Object.freeze([
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
])

/** §2.3 row 2 — the CLEAN reading's own wording. */
export const CLEAN_LABEL = 'CLEAN'
export const SKIPPED_LABEL = 'SKIPPED'
export const DRIFT_LABEL = 'DRIFT'
export const FAIL_LABEL = 'FAIL'

/** The §3a finding ids the report text names, so a reading says WHICH correction it
 *  is exercising rather than leaving a bare word. */
export const A3_LABEL = 'A-3'
export const A4_LABEL = 'A-4'
export const A5_LABEL = 'A-5'
export const REGULAR_FILE_LABEL = 'regular-file arm'

/** The one digest algorithm the manifest records (§3.2 item 2 / §3.3). */
export function md5OfBytes(bytes) {
  return createHash('md5').update(bytes).digest('hex')
}

/**
 * §3a `A-5` — THE REGULAR-FILE ORACLE, exported so the local arm's rule is a driven
 * function and not a wording. `readFileSync` DEREFERENCES, which is exactly why the
 * byte rows cannot see a symlinked module: `lstat` is the only read that can, and a
 * symlink is not "copied in as source" (`R-1`).
 */
export function isRegularFile(path) {
  try {
    return lstatSync(path).isSymbolicLink() === false
  } catch {
    return false
  }
}

/**
 * §3a `A-10` — THE AST-BASED IMPORT-SPECIFIER ORACLE (§2.2 rule 8's closure rule is
 * read from this, never from a single-line regex). Yields, in source order, the
 * specifier of every:
 *   - `ImportDeclaration` — including the BARE side-effect form (`import './x.js'`)
 *     and the MULTI-LINE form (the AST has no line structure to miss);
 *   - `ExportDeclaration` carrying a module specifier (a re-export is an edge);
 *   - `ImportExpression` (dynamic `import('…')`);
 *   - `require('…')` `CallExpression`.
 * A construct inside a STRING LITERAL is never yielded — this is an AST walk, not a
 * text scan.
 *
 * @param {string} sourceText
 * @returns {string[]}
 */
export function importSpecifiers(sourceText) {
  const out = []
  const text = typeof sourceText === 'string' ? sourceText : ''
  const source = ts.createSourceFile('oracle.ts', text, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const specifierOf = (node) => {
    if (node !== undefined && node !== null && ts.isStringLiteral(node)) return node.text
    return null
  }
  const walk = (node) => {
    if (ts.isImportDeclaration(node)) {
      const spec = specifierOf(node.moduleSpecifier)
      if (spec !== null) out.push(spec)
    } else if (ts.isExportDeclaration(node)) {
      const spec = specifierOf(node.moduleSpecifier)
      if (spec !== null) out.push(spec)
    } else if (ts.isCallExpression(node)) {
      const callee = node.expression
      if (callee !== undefined && callee.kind === ts.SyntaxKind.ImportKeyword) {
        const spec = specifierOf(node.arguments[0])
        if (spec !== null) out.push(spec)
      } else if (ts.isIdentifier(callee) && callee.text === 'require') {
        const spec = specifierOf(node.arguments[0])
        if (spec !== null) out.push(spec)
      }
    }
    ts.forEachChild(node, walk)
  }
  walk(source)
  return out
}

/** The member names of one interface/class member, in declared order. */
function memberName(member, source) {
  if (member.name === undefined || member.name === null) return null
  if (ts.isIdentifier(member.name) || ts.isPrivateIdentifier(member.name) || ts.isStringLiteral(member.name) || ts.isNumericLiteral(member.name)) {
    return member.name.text
  }
  return member.getText(source)
}

/**
 * §3a `A-11` — THE AST MEMBER EXTRACTOR: the member names a shape DECLARES, in
 * declared order, so the fork-side mirror in `src/shared/foundation-return-shapes.ts`
 * can be compared member-by-member with the vendored declaration rather than by name
 * presence alone. Returns `null` when the shape is not declared in the text.
 *
 * @param {string} sourceText
 * @param {string} shapeName
 * @returns {string[] | null}
 */
export function shapeMembers(sourceText, shapeName) {
  const text = typeof sourceText === 'string' ? sourceText : ''
  const source = ts.createSourceFile('shapes.ts', text, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  let found = null
  const walk = (node) => {
    if (found !== null) return
    if (ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node)) {
      if (node.name !== undefined && node.name !== null && node.name.text === shapeName) {
        found = node.members.map((m) => memberName(m, source)).filter((n) => n !== null)
        return
      }
    } else if (ts.isTypeAliasDeclaration(node)) {
      if (node.name !== undefined && node.name !== null && node.name.text === shapeName) {
        const type = node.type
        if (type !== undefined && type !== null && ts.isTypeLiteralNode(type)) {
          found = type.members.map((m) => memberName(m, source)).filter((n) => n !== null)
        } else {
          found = []
        }
        return
      }
    }
    ts.forEachChild(node, walk)
  }
  walk(source)
  return found
}

/** `src/shared/<name>.ts` — the vendored path, as the manifest declares it (§2.2). */
function vendoredPathFor(name) {
  return `src/shared/${name}.ts`
}

function asBytes(value) {
  return typeof value === 'string' ? value : null
}

function manifestFault(reason) {
  return {
    status: FAIL_LABEL,
    checks: 0,
    differences: [{ name: '<manifest>', reason }],
    reason,
  }
}

/**
 * THE PURE COMPARATOR (§6.1 item 2) — never touches the file system, never throws.
 *
 * `⟨A-3/A-4/A-5⟩` The input carries the three arms §3a found MISSING:
 *   `foundationRevision` — the adjacent tree's own `rev-parse HEAD`, which the
 *     manifest's `foundation.commit` must equal for the reading to be the pinned state;
 *   `vendoredFlags` — the per-module regular-file reading, so a SYMLINK is rejected
 *     rather than dereferenced by a byte read.
 * The declared name set is compared to `PINNED_MODULE_NAMES` (`A-4`), and the reading
 * reports `distinctModules` — a DISTINCT-FILE count, never an entry count.
 *
 * @param {{
 *   manifest: unknown,
 *   vendoredBytes: Record<string, string> | null | undefined,
 *   foundationBytes: Record<string, string> | null | undefined,
 *   vendoredFlags?: Record<string, { symlink?: boolean }> | null,
 *   foundationRevision?: string | null,
 * }} input
 * @returns {{
 *   status: 'CLEAN' | 'SKIPPED' | 'DRIFT' | 'FAIL',
 *   checks: number,
 *   differences: Array<{ name: string, vendoredDigest?: string, foundationDigest?: string, reason?: string }>,
 *   reason?: string,
 *   distinctModules?: number,
 * }}
 */
export function compareFoundation(input) {
  const manifest = input === null || input === undefined ? null : input.manifest
  const vendoredBytes = input === null || input === undefined ? null : (input.vendoredBytes ?? null)
  const foundationBytes = input === null || input === undefined ? null : (input.foundationBytes ?? null)
  const vendoredFlags = input === null || input === undefined ? null : (input.vendoredFlags ?? null)
  const foundationRevision = input === null || input === undefined ? undefined : input.foundationRevision

  // ---- the manifest's own validity (§2.3 row 4: a loud failure, never a silent skip) ----
  if (manifest === null || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return manifestFault('the manifest is missing or is not a JSON object — vendor/foundation.lock.json must exist and parse (§2.3 row 4)')
  }
  const m = /** @type {Record<string, unknown>} */ (manifest)
  const modules = m.modules
  if (!Array.isArray(modules)) {
    return manifestFault('the manifest carries no `modules` array — vendor/foundation.lock.json is not the schema `foundation-lock/1` (§2.2 rule 1)')
  }
  if (m.moduleCount !== EXPECTED_MODULE_COUNT || modules.length !== EXPECTED_MODULE_COUNT) {
    return manifestFault(
      `the manifest declares moduleCount ${String(m.moduleCount)} with ${modules.length} module(s), not ${EXPECTED_MODULE_COUNT} — a set violation, never a skip (§2.3 row 4 / §2.2 rule 1)`,
    )
  }

  const entries = /** @type {Array<Record<string, unknown>>} */ (modules)

  // ---- ⟨A-4⟩ THE NAME SET IS THE ASSERTION, NOT THE COUNT -------------------------
  // Fifteen entries that are the SAME module fifteen times satisfy both count arms
  // while fourteen modules are never compared (§3a `A-4`'s quoted false-green), so the
  // declared name set must be SET-EQUAL to the pin's fifteen — and the reading reports
  // a DISTINCT-FILE count, never an entry count.
  const declaredNames = []
  for (const entry of entries) {
    const name = entry === null || entry === undefined || entry.name === undefined || entry.name === null ? '' : String(entry.name)
    declaredNames.push(name)
  }
  const distinctNames = [...new Set(declaredNames)].sort()
  const distinctModules = distinctNames.length
  const pinnedSorted = [...PINNED_MODULE_NAMES].sort()
  const missingNames = pinnedSorted.filter((name) => !distinctNames.includes(name))
  const extraNames = distinctNames.filter((name) => !pinnedSorted.includes(name))
  const duplicated = declaredNames.length !== distinctNames.length
  if (distinctModules !== EXPECTED_MODULE_COUNT || missingNames.length > 0 || extraNames.length > 0) {
    const reason = `the manifest's declared name set is not set-equal to the pin's ${EXPECTED_MODULE_COUNT} (§2.3 row 4 / §2.2 rule 1 / §4 P-IM-1): ${declaredNames.length} entr(y|ies) name ${distinctModules} DISTINCT file(s)${duplicated ? ' — the array carries DUPLICATE name(s)' : ''}${missingNames.length > 0 ? `; MISSING [${missingNames.join(', ')}]` : ''}${extraNames.length > 0 ? `; NOT IN THE PIN [${extraNames.join(', ')}]` : ''}. A count of ${EXPECTED_MODULE_COUNT} is not the assertion — counts are not the pin (${A4_LABEL})`
    return { status: FAIL_LABEL, checks: 0, differences: [{ name: '<manifest>', reason }], reason, distinctModules }
  }

  // ---- the LOCAL arm: every vendored module must EXIST, be a REGULAR FILE, and
  //      match the MANIFEST (§2.3 rows 3/5; ⟨A-5⟩ the symlink rule) ----
  const localDifferences = []
  for (const entry of entries) {
    const name = String(entry && entry.name)
    const declared = entry && typeof entry.md5 === 'string' ? entry.md5 : null
    // ⟨A-5⟩ `lstat` refuses a symlink BEFORE any byte read can dereference it.
    const flags = vendoredFlags === null || vendoredFlags === undefined ? null : vendoredFlags[name]
    if (flags !== null && flags !== undefined && flags.symlink === true) {
      localDifferences.push({
        name,
        reason: `the vendored module ${vendoredPathFor(name)} is a SYMLINK (or otherwise not a regular file) — byte-identity is satisfied by a symlink, but the modules must be "copied in as source" (R-1) and the fork must work standalone; §3a ${A5_LABEL} ${REGULAR_FILE_LABEL}`,
      })
      continue
    }
    const bytes = vendoredBytes === null ? null : asBytes(vendoredBytes[name])
    if (bytes === null) {
      localDifferences.push({
        name,
        reason: `the vendored module ${vendoredPathFor(name)} is MISSING (§2.3 row 5 — a loud failure naming the path)`,
      })
      continue
    }
    const localDigest = md5OfBytes(bytes)
    if (declared === null || localDigest !== declared) {
      localDifferences.push({
        name,
        vendoredDigest: localDigest,
        reason: `the local copy ${vendoredPathFor(name)} does NOT match the manifest: local md5 ${localDigest} vs manifest md5 ${String(declared)} (§2.3 row 3 — a LOCAL EDIT, not upstream drift)`,
      })
    }
  }
  if (localDifferences.length > 0) {
    return {
      status: FAIL_LABEL,
      checks: 0,
      differences: localDifferences,
      reason: `${localDifferences.length} local fault(s) — vendor/foundation.lock.json and src/shared/ disagree (§2.3 rows 3/5)`,
      distinctModules,
    }
  }

  // ---- the ABSENT-TREE arm: a SKIP, with its reason, never a failure (§2.3 honesty
  //      rule 1). ⟨A-3⟩ A `SKIPPED` reading PROVES NOTHING ABOUT THE PIN — there is no
  //      tree here whose revision could be read. ----
  if (foundationBytes === null) {
    const reason = `the foundation tree at <foundation.path>/src/shared/ is not a readable directory — the cross-tree arm is SKIPPED (the fork works standalone; a SKIP is neither a pass nor a failure, §2.3 row 1). NOTE (§2.3 honesty rule 1 / §3a ${A3_LABEL}): a SKIPPED reading proves NOTHING about the pin — no tree revision is read, so no byte or revision evidence is taken here.`
    return { status: SKIPPED_LABEL, checks: 0, differences: [], reason, distinctModules }
  }

  // ---- ⟨A-3⟩ THE PIN ARM: the tree's own REVISION must equal the manifest's pin ----
  // Equal bytes at a DIFFERENT commit are NOT the pinned state: nothing else in this
  // repo ever compares the revision, and that is exactly §3a's strongest false-green.
  const pinDifferences = []
  const pinnedCommit = m.foundation && typeof m.foundation === 'object' ? /** @type {Record<string, unknown>} */ (m.foundation).commit : undefined
  let revisionChecked = false
  if (foundationRevision !== undefined && foundationRevision !== null && String(foundationRevision) !== '') {
    revisionChecked = true
    const treeRevision = String(foundationRevision)
    if (typeof pinnedCommit !== 'string' || pinnedCommit === '' || treeRevision === '' || treeRevision !== pinnedCommit) {
      pinDifferences.push({
        name: '<pin>',
        reason: `the adjacent foundation tree's revision ${treeRevision === '' ? '(UNREADABLE)' : treeRevision} is NOT the pinned commit ${typeof pinnedCommit === 'string' && pinnedCommit !== '' ? pinnedCommit : '(UNRECORDED in the manifest)'} — the tree is present and its BYTES may be equal, but equal bytes at a different commit are NOT the pinned state (§3a ${A3_LABEL} HOST-FIX: a read-only \`git -C <foundation> rev-parse HEAD\` equality check against the manifest's \`foundation.commit\`). The byte comparison below still runs, because upstream drift and a moved pin are DIFFERENT faults (§2.3 row 3).`,
      })
    }
  }

  // ---- the CROSS-TREE arm: compare BYTES, name every difference with BOTH digests ----
  const differences = [...pinDifferences]
  for (const entry of entries) {
    const name = String(entry && entry.name)
    const localBytes = asBytes(vendoredBytes === null ? null : vendoredBytes[name])
    const localDigest = localBytes === null ? null : md5OfBytes(localBytes)
    const foundationRaw = asBytes(foundationBytes[name])
    if (foundationRaw === null) {
      differences.push({
        name,
        vendoredDigest: localDigest ?? undefined,
        reason: `the foundation file <foundation.path>/${vendoredPathFor(name)} is MISSING or UNREADABLE (§2.3 row 6 — a loud failure naming the path)`,
      })
      continue
    }
    const foundationDigest = md5OfBytes(foundationRaw)
    if (foundationDigest !== localDigest) {
      differences.push({
        name,
        vendoredDigest: localDigest ?? undefined,
        foundationDigest,
        reason: `DRIFT: the vendored copy ${vendoredPathFor(name)} (md5 ${String(localDigest)}) differs from the foundation's (md5 ${foundationDigest}); the local copy ${localDigest === String(entry && entry.md5) ? 'STILL MATCHES the manifest (upstream movement, not a local edit)' : 'does not match the manifest'}`,
      })
    }
  }
  const byteDifferences = differences.filter((d) => d.name !== '<pin>')
  if (pinDifferences.length > 0) {
    return {
      status: FAIL_LABEL,
      checks: entries.length,
      differences,
      reason: `${pinDifferences.length} PIN fault(s): ${pinDifferences.map((d) => d.reason).join(' ')}${byteDifferences.length === 0 ? ` The ${EXPECTED_MODULE_COUNT} vendored modules are byte-equal to the adjacent tree — but equal bytes at another commit are NOT the pinned state, so this is NOT ${CLEAN_LABEL}.` : ''}`,
      distinctModules,
      revisionChecked,
    }
  }
  if (differences.length > 0) {
    return {
      status: DRIFT_LABEL,
      checks: entries.length,
      differences,
      reason: `${differences.length} of ${entries.length} modules differ from the foundation tree`,
      distinctModules,
      revisionChecked,
    }
  }
  return { status: CLEAN_LABEL, checks: entries.length, differences: [], distinctModules, revisionChecked }
}

// ===========================================================================
// The CLI shell (§2.3): file reads, the report text and the exit codes
// ===========================================================================

function readManifestFile(manifestPath) {
  if (!existsSync(manifestPath)) {
    return { fault: `the manifest ${manifestPath} does not exist — a loud failure naming the manifest, never a silent skip (§2.3 row 4)` }
  }
  let text
  try {
    text = readFileSync(manifestPath, 'utf8')
  } catch (error) {
    return { fault: `the manifest ${manifestPath} is UNREADABLE — ${String(error && error.message ? error.message : error)} (§2.3 row 4)` }
  }
  try {
    return { manifest: JSON.parse(text) }
  } catch (error) {
    return { fault: `the manifest ${manifestPath} is not parsable JSON — ${String(error && error.message ? error.message : error)} (§2.3 row 4)` }
  }
}

function readBytesMap(root, sharedDir, names) {
  const bytes = {}
  const faults = []
  const flags = {}
  for (const name of names) {
    const file = join(sharedDir, `${name}.ts`)
    // ⟨A-5⟩ the regular-file reading comes FIRST and is kept per module: a symlink's
    // bytes are identical, so no byte read can ever see it — `lstat` can.
    flags[name] = { symlink: !isRegularFile(file) }
    try {
      bytes[name] = readFileSync(file, 'utf8')
    } catch (error) {
      faults.push({
        name,
        reason: `${file} is MISSING or UNREADABLE — ${String(error && error.message ? error.message : error)} (§2.3 row 6 — a loud failure naming the path and the error)`,
      })
    }
  }
  void root
  return { bytes, faults, flags }
}

/**
 * ⟨A-3⟩ THE PIN ARM'S OWN READ — a read-only `git -C <foundation> rev-parse HEAD`.
 * No `git` mutation, no install, no network (§3.4 item 2). Returns the tree's
 * revision, `null` when the tree is not a readable repository (the CLI then cannot
 * take the pin reading and says so), and reports the error text rather than
 * inventing a revision.
 */
export function foundationRevision(foundationDir) {
  try {
    const result = spawnSync('git', ['-C', foundationDir, 'rev-parse', 'HEAD'], { encoding: 'utf8' })
    if (result.error !== undefined && result.error !== null) return { revision: null, error: String(result.error.message ?? result.error) }
    if (result.status !== 0) return { revision: null, error: `${String(result.stderr ?? '').trim() || `git rev-parse exited ${String(result.status)}`}` }
    const revision = String(result.stdout ?? '').trim()
    return revision === '' ? { revision: null, error: 'git rev-parse printed no revision' } : { revision, error: null }
  } catch (error) {
    return { revision: null, error: String(error && error.message ? error.message : error) }
  }
}

/** The module names the manifest declares, in manifest order. */
function declaredNames(manifest) {
  return (manifest.modules ?? []).map((entry) => String(entry && entry.name))
}

/** The report text for a comparator verdict — printed, never a silent pass. */
export function renderReport(report, foundationShared) {
  const lines = []
  if (report.status === CLEAN_LABEL) {
    lines.push(`DRIFT RESULT: ${report.checks} checks, 0 differences — ${CLEAN_LABEL}`)
    lines.push(`  ${report.checks} distinct vendored file(s) at ${foundationShared?.replace(/[/\\]src[/\\]shared$/, '') ?? '<foundation.path>'}/src/shared/ are byte-equal to this repo's copies.`)
    if (report.revisionChecked === true) {
      lines.push('  PIN ARM (§3a `A-3`): the tree\'s own `git -C <foundation> rev-parse HEAD` was read and EQUALS the manifest\'s `foundation.commit` — this is the pinned state, not merely a byte-equal tree.')
    } else {
      lines.push('  PIN ARM (§3a `A-3`): NO revision reading was taken (the tree is not a git repository), so this reading is a BYTE reading only — it proves NOTHING about the pin (the §2.3 honesty-rule-1 note on `SKIPPED` applies here too).')
    }
    lines.push('  layer: [D]-class local instrument — a CLEAN reading is NOT app evidence (§2.3 honesty rule 2).')
    return lines.join('\n')
  }
  if (report.status === SKIPPED_LABEL) {
    lines.push(`DRIFT RESULT: ${SKIPPED_LABEL} — ${report.reason}`)
    return lines.join('\n')
  }
  lines.push(`DRIFT RESULT: ${report.status} — ${report.reason ?? ''}`)
  for (const difference of report.differences ?? []) {
    const digests = [difference.vendoredDigest ? `vendored md5 ${difference.vendoredDigest}` : null, difference.foundationDigest ? `foundation md5 ${difference.foundationDigest}` : null]
      .filter(Boolean)
      .join(' · ')
    lines.push(`  ${difference.name}: ${difference.reason ?? ''}${digests ? ` [${digests}]` : ''}`)
  }
  return lines.join('\n')
}

export function runMonitor(cwd = process.cwd()) {
  const root = resolve(cwd)
  const manifestPath = join(root, 'vendor', 'foundation.lock.json')
  const loaded = readManifestFile(manifestPath)
  if (loaded.fault !== undefined) {
    return { code: 1, report: { status: FAIL_LABEL, checks: 0, differences: [{ name: '<manifest>', reason: loaded.fault }], reason: loaded.fault }, foundationShared: null }
  }
  const manifest = loaded.manifest
  if (manifest === null || typeof manifest !== 'object' || Array.isArray(manifest) || !Array.isArray(manifest.modules)) {
    const report = compareFoundation({ manifest, vendoredBytes: {}, foundationBytes: null })
    return { code: 1, report, foundationShared: null }
  }
  // ⟨A-4⟩ The name-set arm runs BEFORE any file is read: fifteen duplicate entries name
  // ONE file, so an entry-driven read would compare one module fifteen times and never
  // notice that fourteen are uncompared. Counts are not the assertion.
  if (manifest.moduleCount !== EXPECTED_MODULE_COUNT || manifest.modules.length !== EXPECTED_MODULE_COUNT) {
    const report = compareFoundation({ manifest, vendoredBytes: {}, foundationBytes: null })
    return { code: 1, report, foundationShared: null }
  }

  const names = declaredNames(manifest)
  const distinctNames = [...new Set(names)]
  if (distinctNames.length !== EXPECTED_MODULE_COUNT || PINNED_MODULE_NAMES.some((name) => !distinctNames.includes(name))) {
    const report = compareFoundation({ manifest, vendoredBytes: {}, foundationBytes: null })
    return { code: 1, report, foundationShared: null }
  }

  const vendoredShared = join(root, 'src', 'shared')
  const local = readBytesMap(root, vendoredShared, names)

  const foundationPath = typeof manifest.foundation?.path === 'string' ? manifest.foundation.path : '../Provident-Electron'
  const foundationShared = resolve(root, foundationPath, 'src', 'shared')
  const foundationDir = resolve(root, foundationPath)
  const foundationReadable = existsSync(foundationShared) && statSync(foundationShared).isDirectory()

  if (local.faults.length > 0) {
    const report = {
      status: FAIL_LABEL,
      checks: 0,
      differences: local.faults,
      reason: `${local.faults.length} vendored module(s) missing or unreadable under ${vendoredShared} (§2.3 row 5)`,
    }
    return { code: 1, report, foundationShared: null }
  }

  if (!foundationReadable) {
    const report = compareFoundation({ manifest, vendoredBytes: local.bytes, vendoredFlags: local.flags, foundationBytes: null })
    return { code: 0, report, foundationShared }
  }

  // ⟨A-3⟩ the pin arm: the tree's OWN revision, read read-only, compared by the
  // comparator against the manifest's `foundation.commit`. **A tree that is not a git
  // repository yields NO revision**, and the comparator then takes no revision reading
  // at all (there is nothing to compare) — the reading is a byte reading, never a pin
  // claim. A tree that IS a repository and sits at another commit is a PIN FAULT.
  const pin = foundationRevision(foundationDir)
  const revision = pin.revision ?? null

  const foundation = readBytesMap(root, foundationShared, names)

  // ⟨A-5⟩ the LOCAL arm is decided FIRST: a symlinked vendored module is a fault of
  // the local copy, and it is reported as such rather than as a foundation fault.
  const localOnly = compareFoundation({ manifest, vendoredBytes: local.bytes, vendoredFlags: local.flags, foundationBytes: null })
  if (localOnly.status === FAIL_LABEL) {
    return { code: 1, report: localOnly, foundationShared }
  }

  if (foundation.faults.length > 0) {
    const report = {
      status: FAIL_LABEL,
      checks: 0,
      differences: foundation.faults,
      reason: `${foundation.faults.length} foundation file(s) present but unreadable under ${foundationShared} (§2.3 row 6)`,
    }
    return { code: 1, report, foundationShared }
  }

  const report = compareFoundation({
    manifest,
    vendoredBytes: local.bytes,
    vendoredFlags: local.flags,
    foundationBytes: foundation.bytes,
    foundationRevision: revision,
  })
  const code = report.status === CLEAN_LABEL || report.status === SKIPPED_LABEL ? 0 : 1
  return { code, report, foundationShared }
}

/** The repo root the monitor reads: the script's own tree when it carries the manifest
 *  (so a harness copy at `<tmp>/scripts/foundation-drift.mjs` reads `<tmp>`), else the cwd. */
function resolveRoot() {
  const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  if (existsSync(join(scriptRoot, 'vendor', 'foundation.lock.json'))) return scriptRoot
  if (existsSync(join(process.cwd(), 'vendor', 'foundation.lock.json'))) return resolve(process.cwd())
  return scriptRoot
}

function main() {
  try {
    const { code, report, foundationShared } = runMonitor(resolveRoot())
    process.stdout.write(`${renderReport(report, foundationShared)}\n`)
    if (report.status === SKIPPED_LABEL) {
      process.stdout.write(`  (the absent-tree arm exits 0 by contract — a SKIP is not a failure, §2.3 row 1)\n`)
    }
    return code
  } catch (error) {
    process.stdout.write(`DRIFT RESULT: ${FAIL_LABEL} — the monitor threw: ${String(error && error.stack ? error.stack : error)}\n`)
    return 1
  }
}

// The entry guard: the CLI shell runs ONLY when this file is the invoked script, so the
// pure comparator can be imported by `P-TP-2` (and by any later instrument) without the
// monitor printing or exiting inside the importing process.
const invokedPath = process.argv[1] === undefined ? '' : process.argv[1]
const isEntry = basename(invokedPath) === 'foundation-drift.mjs'

if (isEntry) {
  process.exitCode = main()
}
