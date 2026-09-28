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
// This file was authored by the PD-VENDOR Implementer pass and RUNS NOTHING on import.

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** The manifest's pinned module count (§2.2 rule 1). */
export const EXPECTED_MODULE_COUNT = 15

/** §2.3 row 2 — the CLEAN reading's own wording. */
export const CLEAN_LABEL = 'CLEAN'
export const SKIPPED_LABEL = 'SKIPPED'
export const DRIFT_LABEL = 'DRIFT'
export const FAIL_LABEL = 'FAIL'

/** The one digest algorithm the manifest records (§3.2 item 2 / §3.3). */
export function md5OfBytes(bytes) {
  return createHash('md5').update(bytes).digest('hex')
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
 * @param {{
 *   manifest: unknown,
 *   vendoredBytes: Record<string, string> | null | undefined,
 *   foundationBytes: Record<string, string> | null | undefined,
 * }} input
 * @returns {{
 *   status: 'CLEAN' | 'SKIPPED' | 'DRIFT' | 'FAIL',
 *   checks: number,
 *   differences: Array<{ name: string, vendoredDigest?: string, foundationDigest?: string, reason?: string }>,
 *   reason?: string,
 * }}
 */
export function compareFoundation(input) {
  const manifest = input === null || input === undefined ? null : input.manifest
  const vendoredBytes = input === null || input === undefined ? null : (input.vendoredBytes ?? null)
  const foundationBytes = input === null || input === undefined ? null : (input.foundationBytes ?? null)

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

  // ---- the LOCAL arm: every vendored module must exist and match the MANIFEST ----
  const localDifferences = []
  let localFail = false
  for (const entry of entries) {
    const name = String(entry && entry.name)
    const declared = entry && typeof entry.md5 === 'string' ? entry.md5 : null
    const bytes = vendoredBytes === null ? null : asBytes(vendoredBytes[name])
    if (bytes === null) {
      localFail = true
      localDifferences.push({
        name,
        reason: `the vendored module ${vendoredPathFor(name)} is MISSING (§2.3 row 5 — a loud failure naming the path)`,
      })
      continue
    }
    const localDigest = md5OfBytes(bytes)
    if (declared === null || localDigest !== declared) {
      localFail = true
      localDifferences.push({
        name,
        vendoredDigest: localDigest,
        reason: `the local copy ${vendoredPathFor(name)} does NOT match the manifest: local md5 ${localDigest} vs manifest md5 ${String(declared)} (§2.3 row 3 — a LOCAL EDIT, not upstream drift)`,
      })
    }
  }
  if (localFail) {
    return {
      status: FAIL_LABEL,
      checks: 0,
      differences: localDifferences,
      reason: `${localDifferences.length} local fault(s) — vendor/foundation.lock.json and src/shared/ disagree (§2.3 rows 3/5)`,
    }
  }

  // ---- the ABSENT-TREE arm: a SKIP, with its reason, never a failure (§2.3 honesty rule 1) ----
  if (foundationBytes === null) {
    const reason = `the foundation tree at <foundation.path>/src/shared/ is not a readable directory — the cross-tree arm is SKIPPED (the fork works standalone; a SKIP is neither a pass nor a failure, §2.3 row 1)`
    return { status: SKIPPED_LABEL, checks: 0, differences: [], reason }
  }

  // ---- the CROSS-TREE arm: compare BYTES, name every difference with BOTH digests ----
  const differences = []
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
  if (differences.length > 0) {
    return {
      status: DRIFT_LABEL,
      checks: entries.length,
      differences,
      reason: `${differences.length} of ${entries.length} modules differ from the foundation tree`,
    }
  }
  return { status: CLEAN_LABEL, checks: entries.length, differences: [] }
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
  for (const name of names) {
    const file = join(sharedDir, `${name}.ts`)
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
  return { bytes, faults }
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
    lines.push(`  the foundation tree ${foundationShared} is present and every vendored module is byte-equal to it.`)
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
  if (manifest === null || typeof manifest !== 'object' || Array.isArray(manifest) || !Array.isArray(manifest.modules) || manifest.moduleCount !== EXPECTED_MODULE_COUNT || manifest.modules.length !== EXPECTED_MODULE_COUNT) {
    const report = compareFoundation({ manifest, vendoredBytes: {}, foundationBytes: null })
    return { code: 1, report, foundationShared: null }
  }

  const names = declaredNames(manifest)
  const vendoredShared = join(root, 'src', 'shared')
  const local = readBytesMap(root, vendoredShared, names)

  const foundationPath = typeof manifest.foundation?.path === 'string' ? manifest.foundation.path : '../Provident-Electron'
  const foundationShared = resolve(root, foundationPath, 'src', 'shared')
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
    const report = compareFoundation({ manifest, vendoredBytes: local.bytes, foundationBytes: null })
    return { code: 0, report, foundationShared }
  }

  const foundation = readBytesMap(root, foundationShared, names)
  if (foundation.faults.length > 0) {
    const report = {
      status: FAIL_LABEL,
      checks: 0,
      differences: foundation.faults,
      reason: `${foundation.faults.length} foundation file(s) present but unreadable under ${foundationShared} (§2.3 row 6)`,
    }
    return { code: 1, report, foundationShared }
  }

  const report = compareFoundation({ manifest, vendoredBytes: local.bytes, foundationBytes: foundation.bytes })
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
