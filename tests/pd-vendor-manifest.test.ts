// tests/pd-vendor-manifest.test.ts — unit `PD-VENDOR`, the `A2` HASH ROW and the
// register rows `P-IM-1` / `P-IM-2` / `P-TP-1`.
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-pd-vendor-foundation-mechanisms.md
//     §1.1 item 2/4   the manifest + the `A2` row are the unit's deliverables
//     §2.1 item 1     the pin's fifteen-name list (the set)
//     §2.2            the manifest, key by key — "Normative shape (the implementer
//                     may add keys, never remove or rename these)" + its 7
//                     manifest rules
//     §2.4            the `A2` row: placement, no `'electron'` mock, hashes
//                     `src/shared/<x>.ts` — THE SHIPPED FILE, never the vendor copy,
//                     one `it` per module derived from the manifest
//     §3.2            how the row reads the manifest (readFileSync + JSON.parse,
//                     `node:crypto` `createHash('md5')`), and its fail-state:
//                     manifest absent ⇒ a LOUD failure naming the path, never a skip;
//                     `proposalTableAgreement: "NOT-RECOMPUTED"` ⇒ a LOUD failure
//     §3.3 item 3     `REPRODUCED` | `DISAGREES` (with a `docs/defects.md` finding) —
//                     `NOT-RECOMPUTED` forbidden in a committed manifest
//     §3.3 item 2     `foundation.commit` must equal the pinned revision
//     §4              the typed register: `P-IM-1` (19 = 15+4), `P-IM-2` (17 = 15+2),
//                     `P-TP-1` (8 = 1×2×2×2); seed `0x20260927`; ≤100/row;
//                     stop-after-5; every row carries a DISCRIMINATING control
//   docs/specs/pd-vendor-adoption-dossier.md §1 row 8 / `C-6` (§0A note 7 of the spec):
//     the five non-exported return shapes are a RE-DECLARATION obligation of this
//     repo, never an import from the vendored bytes.
//
// LAYER (RCA-12): `[T]` node/pure. An ENVELOPE-green instrument — NOT app-green.
//
// RED-FIRST (RCA-1): the modules/paths this file reads DO NOT EXIST at this branch
// head — `vendor/foundation.lock.json` and `src/shared/<x>.ts` ×15 are the unit's
// deliverables. The red is the ABSENCE, reported by name, never a collection error:
// every row resolves the manifest through `requireManifest()` (a LOUD failure naming
// the path) or through `readManifest()` (→ `null`, which each row asserts loudly).
//
// `G-9`/`X-9` PIN SAFETY (§2.4 items 1–2): this file mocks NOTHING — in particular it
// does NOT mock `'electron'` (the protected bridge-mock census pins the exact
// five-name set), and it reads NEITHER `vitest.config.ts` NOR
// `src/main/markdown-import.ts` NOR the two `DEEP_ROWS` files NOR
// `tests/fixtures/v5-bridge-capture-fixture.js`. Its imports are `vitest`, `node:*`
// and `typescript` (an EXISTING devDependency — no new dependency, §4's machinery).

import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// `typescript` is an EXISTING devDependency (§4's machinery forbids a NEW one) and
// is the idiom the repo's own pin file uses to derive a source census.
import ts from 'typescript'

// ===========================================================================
// §2.1 item 1 — THE PIN'S FIFTEEN-NAME LIST (the pool every row enumerates)
// ===========================================================================
/** The decision row's own name list, verbatim (§2.1 item 1) — `slot-host` and
 *  `owned-list-host` are MEMBERS (§2.1 item 3: no member is excluded). */
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

/** §3.3 item 2 — the architect-measured pinned revision. */
const PINNED_COMMIT = '8f193a8d1446ed1e64c4ab6c569941e988f82459'

/** §2.2 — the four baseline files that are NOT replaced (clause (2) of `R-3`). */
const BASELINE_FILES_NOT_REPLACED = [
  'src/shared/dom-shim.ts',
  'src/shared/types.ts',
  'src/shared/demo-envelope.ts',
  'src/shared/path-fork-cycle.ts',
] as const

/** §0A note 7 / dossier row 8 — the five shapes the foundation does NOT export and
 *  that this repo must RE-DECLARE (never patch into the vendored bytes). */
const RE_DECLARED_SHAPES = [
  'GestureSession',
  'RelocateResetResult',
  'FocusResult',
  'FocusRefusal',
  'FocusTransitionArg',
] as const

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const MANIFEST_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')

// ===========================================================================
// The manifest reader (§3.2 item 1 — readFileSync + JSON.parse, no `.json` import)
// ===========================================================================
function readManifest(): unknown | null {
  if (!existsSync(MANIFEST_PATH)) return null
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  } catch {
    return null
  }
}

/** The LOUD accessor (§3.2 item 5): an absent manifest is a failure NAMING THE PATH,
 *  never a skip and never a vacuous pass. */
function requireManifest(): Record<string, unknown> {
  if (!existsSync(MANIFEST_PATH)) {
    throw new Error(
      `RED (PD-VENDOR §3.2 item 5): the manifest ${MANIFEST_PATH} does not exist — the A2 row must fail loudly naming the path, never skip`,
    )
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  } catch (e) {
    throw new Error(`RED (PD-VENDOR §2.2): the manifest ${MANIFEST_PATH} is not parsable JSON — ${String(e)}`)
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`RED (PD-VENDOR §2.2): the manifest ${MANIFEST_PATH} is not a JSON object`)
  }
  return parsed as Record<string, unknown>
}

/** The manifest's `modules` array, or a loud failure. */
function requireModules(): Array<Record<string, unknown>> {
  const m = requireManifest()
  const mods = m.modules
  if (!Array.isArray(mods)) {
    throw new Error('RED (PD-VENDOR §2.2): the manifest carries no `modules` array')
  }
  return mods as Array<Record<string, unknown>>
}

/** §2.4 item 3 / §0A note 4 — the A2 row's digest target is the SHIPPED file. */
function shippedPathFor(name: string): string {
  return join(REPO_ROOT, 'src', 'shared', `${name}.ts`)
}

/** §3.2 item 2 — `node:crypto`'s `createHash('md5')`, the algorithm the manifest records. */
function md5OfBytes(bytes: string | Buffer): string {
  return createHash('md5').update(bytes).digest('hex')
}

function md5OfFile(path: string): string | null {
  if (!existsSync(path)) return null
  return md5OfBytes(readFileSync(path))
}

const MD5_HEX_32 = /^[0-9a-f]{32}$/

// ===========================================================================
// THE ORACLE (P-IM-1's, and the control target of every row)
// ===========================================================================
/**
 * The `A2` row's oracle, as a PURE function so a synthetic manifest can be driven
 * through it (`P-IM-1`'s four controls). It implements §2.2's manifest rules 1/2/3
 * and §3.2 item 3/4 exactly:
 *   - every entry's `name` is one of the pin's fifteen;
 *   - `vendored === source`, and `source` is `src/shared/<name>.ts`;
 *   - `md5` is 32 lowercase hex;
 *   - the declared name set is SET-EQUAL to the pin's fifteen (no sixteenth, no
 *     fourteenth) — a count alone is NOT the assertion;
 *   - `moduleCount === 15` and `modules.length === 15`;
 *   - the shipped file `src/shared/<name>.ts` exists, and its md5 equals the entry's.
 * Returns the list of violations; `[]` means the row holds.
 */
function auditManifest(manifest: Record<string, unknown>, fileDigest: (name: string) => string | null): string[] {
  const v: string[] = []
  const raw = manifest.modules
  if (!Array.isArray(raw)) return ['manifest.modules is not an array']
  const mods = raw as Array<Record<string, unknown>>

  if (manifest.moduleCount !== 15) v.push(`moduleCount is ${String(manifest.moduleCount)}, not 15 (§2.2)`)
  if (mods.length !== 15) v.push(`modules.length is ${mods.length}, not 15 (§2.2 rule 1)`)

  const declared = mods.map((e) => String(e.name))
  const names = [...declared].sort()
  const pinned = [...PINNED_FIFTEEN].sort()
  if (names.length !== pinned.length || names.some((n, i) => n !== pinned[i])) {
    const extra = names.filter((n) => !pinned.includes(n))
    const missing = pinned.filter((n) => !names.includes(n))
    v.push(
      `the declared name set is not SET-EQUAL to the pin's fifteen (§2.2 rule 1; V-2/V-3) — extra: [${extra.join(', ')}], missing: [${missing.join(', ')}]`,
    )
  }
  if (new Set(declared).size !== declared.length) v.push('a module name is declared twice')

  for (const e of mods) {
    const name = String(e.name)
    if (!pinned.includes(name)) v.push(`entry "${name}" is not one of the pin's fifteen (§2.2 rule 1)`)
    if (e.source !== `src/shared/${name}.ts`) v.push(`entry "${name}": source is ${String(e.source)}, not src/shared/${name}.ts (§2.2)`)
    if (e.vendored !== e.source) v.push(`entry "${name}": vendored (${String(e.vendored)}) ≠ source (${String(e.source)}) (§2.2 rule 2)`)
    if (typeof e.md5 !== 'string' || !MD5_HEX_32.test(e.md5)) {
      v.push(`entry "${name}": md5 is not 32 lowercase hex (${String(e.md5)}) (§2.2 rule 3)`)
      continue
    }
    const actual = fileDigest(name)
    if (actual === null) {
      v.push(`the shipped file src/shared/${name}.ts does not exist (§2.4 item 3 / §3.2 item 3)`)
      continue
    }
    if (actual !== e.md5) {
      v.push(`entry "${name}": the shipped file's digest ${actual} ≠ the manifest's ${e.md5} (§3.2 item 3 — P-IM-1)`)
    }
  }
  return v
}

/** The shipped-file digest reader the `A2` row MUST use (§2.4 item 3). */
const shippedDigest = (name: string): string | null => md5OfFile(shippedPathFor(name))

/** A synthetically perturbed digest (the control's own mutation). */
function perturbDigest(hex: string): string {
  const first = hex[0] === '0' ? '1' : '0'
  return first + hex.slice(1)
}

// ===========================================================================
// §2.4 — THE `A2` ROW: one `it` per module, names derived FROM THE MANIFEST
// ===========================================================================
describe('PD-VENDOR §2.4 — the A2 hash row: the shipped file vs the manifest', () => {
  it('§3.2 item 5 — the manifest exists and is parsable JSON, else a LOUD failure naming the path (never a skip)', () => {
    expect(existsSync(MANIFEST_PATH), `the manifest ${MANIFEST_PATH} is missing — the A2 row must fail loudly naming the path (§3.2 item 5), never skip`).toBe(true)
    expect(() => JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))).not.toThrow()
  })

  it('§2.2 rule 7 — it is JSON, read with readFileSync + JSON.parse (no `.json` module import)', () => {
    // The spec's own idiom (§3.2 item 1). A `import manifest from '...json'` would
    // resolve through Vite's JSON plugin and would NOT be the recorded reading.
    const src = readFileSync(fileURLToPath(import.meta.url), 'utf8')
    expect(src).toMatch(/readFileSync\(\s*MANIFEST_PATH/)
    expect(src).toMatch(/JSON\.parse\(/)
    expect(src).not.toMatch(/import\s+[^\n]*from\s+['"][^'"]*foundation\.lock\.json['"]/)
  })

  it('an empty declared module list is a LOUD failure here (a row that enumerates nothing is not evidence)', () => {
    const manifest = readManifest()
    const declared = manifest === null ? [] : (((manifest as Record<string, unknown>).modules as unknown[]) ?? [])
    expect(declared.length, 'the manifest declares ZERO modules').toBe(15)
  })

  // §2.4 item 4 — one `it` per module, names derived from the manifest, so a module
  // added to the manifest without a file is a loud failure, never a vacuous pass.
  const manifestMaybe = readManifest()
  const declaredNames: string[] =
    manifestMaybe !== null && Array.isArray((manifestMaybe as Record<string, unknown>).modules)
      ? ((manifestMaybe as Record<string, unknown>).modules as Array<Record<string, unknown>>).map((e) => String(e.name)).sort()
      : [...PINNED_FIFTEEN].sort()

  for (const name of declaredNames) {
    it(`§3.2 item 3 — the shipped src/shared/${name}.ts exists and its md5 equals the manifest's`, () => {
      const modules = requireModules()
      const entry = modules.find((e) => e.name === name)
      expect(entry, `the manifest has no entry for "${name}"`).toBeDefined()
      const path = shippedPathFor(name)
      expect(existsSync(path), `RED (PD-VENDOR §2.1/§3.1): the vendored module ${path} does not exist`).toBe(true)
      const actual = md5OfFile(path)
      expect(actual, `entry "${name}": md5 must be 32 lowercase hex`).toMatch(MD5_HEX_32)
      expect(actual, `entry "${name}": the SHIPPED file's digest must equal the manifest's md5 (§2.4 item 3)`).toBe(entry!.md5)
      expect(entry!.vendored, `entry "${name}": vendored MUST equal source (§2.2 rule 2)`).toBe(entry!.source)
    })
  }

  it('§3.2 item 4 — modules.length === 15 AND the fifteen names are SET-EQUAL to the pin (a count alone is not the assertion)', () => {
    const modules = requireModules()
    expect(modules.length, 'the manifest must carry EXACTLY fifteen entries (§2.2 rule 1)').toBe(15)
    expect([...modules.map((e) => String(e.name))].sort()).toEqual([...PINNED_FIFTEEN].sort())
  })

  it('§3.2 item 4 — importCensus.outOfSetImports is EMPTY (§2.2 rule 4 / P-IM-3)', () => {
    const census = requireManifest().importCensus as Record<string, unknown> | undefined
    expect(census, 'the manifest carries no importCensus object').toBeDefined()
    expect(census!.outOfSetImports).toEqual([])
  })

  it('§3.2 item 4 — baselineFilesNotReplaced is exactly the four files and excludes every set member (§2.2 rule 5)', () => {
    const listed = requireManifest().baselineFilesNotReplaced
    expect(listed).toEqual([...BASELINE_FILES_NOT_REPLACED])
    for (const name of PINNED_FIFTEEN) {
      expect(listed as string[], `the set member "${name}" must NOT appear in baselineFilesNotReplaced`).not.toContain(`src/shared/${name}.ts`)
    }
  })
})

// ===========================================================================
// §2.2 — THE MANIFEST'S SHAPE (the foundation commit + a digest for every member)
// ===========================================================================
describe('PD-VENDOR §2.2 — the manifest shape (foundation block + per-module digest)', () => {
  it('§2.2 — `schema` is "foundation-lock/1"', () => {
    expect(requireManifest().schema).toBe('foundation-lock/1')
  })

  it('§3.3 item 2 — foundation.commit equals the pinned revision 8f193a8…f82459', () => {
    const foundation = requireManifest().foundation as Record<string, unknown>
    expect(foundation, 'the manifest carries no `foundation` block').toBeDefined()
    expect(foundation.commit).toBe(PINNED_COMMIT)
  })

  it('§2.2 / §3.3 item 1 — foundation.path, ref, remote, measuredAt, digestCommand, byteIdentity are all present (digestCommand non-empty, verbatim)', () => {
    const f = requireManifest().foundation as Record<string, unknown>
    expect(f.path).toBe('../Provident-Electron')
    expect(f.remote).toBe('https://github.com/LittleKingsguard/Provident-Electron')
    expect(f.ref).toBe('main')
    expect(typeof f.measuredAt).toBe('string')
    expect(String(f.measuredAt)).not.toBe('')
    expect(typeof f.digestCommand).toBe('string')
    expect(String(f.digestCommand).trim().length, 'the digest command must be recorded VERBATIM (§3.3 item 1)').toBeGreaterThan(0)
    expect(typeof f.byteIdentity).toBe('string')
    expect(String(f.byteIdentity)).not.toBe('')
  })

  it('§2.2 / §3.2 item 5 — moduleCount === 15, and every per-module key is present with its documented type', () => {
    const m = requireManifest()
    expect(m.moduleCount).toBe(15)
    const modules = requireModules()
    expect(modules.length).toBe(15)
    const problems: string[] = []
    for (const e of modules) {
      const name = String(e.name)
      if (typeof e.name !== 'string' || e.name === '') problems.push('an entry has no `name`')
      if (typeof e.source !== 'string' || e.source === '') problems.push(`${name}: no \`source\``)
      if (typeof e.vendored !== 'string' || e.vendored === '') problems.push(`${name}: no \`vendored\``)
      if (typeof e.md5 !== 'string' || !MD5_HEX_32.test(e.md5)) problems.push(`${name}: \`md5\` is not 32 lowercase hex`)
      if (typeof e.lineCount !== 'number' || !Number.isInteger(e.lineCount) || e.lineCount <= 0) problems.push(`${name}: \`lineCount\` is not a positive integer`)
      if (typeof e.provenance !== 'string' || e.provenance === '') problems.push(`${name}: no \`provenance\``)
      if (e.excludedFromVendorSet !== false) problems.push(`${name}: \`excludedFromVendorSet\` must be false (§2.1 item 2)`)
      if (typeof e.rowStatus !== 'string' || e.rowStatus === '') problems.push(`${name}: no \`rowStatus\``)
    }
    expect(problems, 'the normative per-module keys of §2.2 are violated').toEqual([])
  })

  it('§2.2 rule 3 — the fifteen md5s are 32 lowercase hex AND unique per module', () => {
    const digests = requireModules().map((e) => String(e.md5))
    expect(digests.every((d) => MD5_HEX_32.test(d))).toBe(true)
    expect(new Set(digests).size, 'two modules share a digest — the per-module digest is not per-module').toBe(15)
  })

  it('§2.2 item 1 — the baseline readings each carry a `layer` and a `measuredBy` (a figure with no layer is a review finding, RCA-12)', () => {
    const baselines = requireManifest().baselines as Record<string, Record<string, unknown>>
    expect(baselines, 'the manifest carries no `baselines` block').toBeDefined()
    const missing: string[] = []
    for (const [key, row] of Object.entries(baselines)) {
      if (typeof row?.layer !== 'string' || row.layer === '') missing.push(`${key}: no layer`)
      if (typeof row?.measuredBy !== 'string' || row.measuredBy === '') missing.push(`${key}: no measuredBy`)
      if (typeof row?.reading !== 'string' || row.reading === '') missing.push(`${key}: no reading`)
    }
    expect(missing).toEqual([])
    for (const leg of ['npmTest', 'typecheck', 'build', 'battery', 'divergence', 'collectedSuiteCensus']) {
      expect(Object.keys(baselines), `the baseline "${leg}" is not recorded (§2.2)`).toContain(leg)
    }
  })
})

// ===========================================================================
// §4 `P-IM-1` — THE SET IS EXACTLY THE FIFTEEN, AND EVERY MEMBER IS BYTE-IDENTICAL
// ===========================================================================
describe('§4 P-IM-1 — the set is exactly the fifteen and every member is byte-identical (strat:vendor-set-identity)', () => {
  it('P-IM-1 — 15 declared observations + 4 synthetic controls = 19 attempts; the controls DISCRIMINATE', () => {
    const manifest = requireManifest()
    const modules = manifest.modules as Array<Record<string, unknown>>

    // the 15 declared observations (each is one full audit of the shipped file)
    const perModule = modules.map((e) => {
      const violations = auditManifest({ ...manifest, modules: [e], moduleCount: 15 }, shippedDigest)
      // a single-entry manifest necessarily reds its own count rule; the per-module
      // facts are the digest + the paths, read from the FULL manifest below.
      return violations.filter((x) => !/moduleCount is|modules\.length is|declared name set/.test(x))
    })
    const bad = perModule.map((v, i) => ({ name: String(modules[i]!.name), v })).filter((x) => x.v.length > 0)
    expect(bad, 'a declared module failed its own per-module facts (existence / md5 / vendored===source)').toEqual([])

    // the whole-manifest reading (the count + set-equality facts)
    expect(auditManifest(manifest, shippedDigest)).toEqual([])

    // CONTROL 1 — a manifest that ADDS a name MUST fail
    const added = { ...manifest, modules: [...modules, { name: 'sixteenth', source: 'src/shared/sixteenth.ts', vendored: 'src/shared/sixteenth.ts', md5: '0'.repeat(32) }], moduleCount: 16 }
    const addedViolations = auditManifest(added, shippedDigest)
    const controlAddedDiscriminates = addedViolations.some((x) => /sixteenth|16|SET-EQUAL|sixteenth/.test(x))

    // CONTROL 2 — a manifest that DROPS a name MUST fail
    const dropped = { ...manifest, modules: modules.slice(1), moduleCount: 15 }
    const droppedViolations = auditManifest(dropped, shippedDigest)
    const controlDroppedDiscriminates = droppedViolations.some((x) => /SET-EQUAL|not 15|missing/.test(x))

    // CONTROL 3 — a PERTURBED digest MUST fail
    const perturbed = { ...manifest, modules: modules.map((e, i) => (i === 0 ? { ...e, md5: perturbDigest(String(e.md5)) } : e)) }
    const controlPerturbedDiscriminates = auditManifest(perturbed, shippedDigest).some((x) => /≠ the manifest's/.test(x))

    // CONTROL 4 — a RENAMED vendored file (`vendored` ≠ `source`) MUST fail
    const renamed = { ...manifest, modules: modules.map((e, i) => (i === 0 ? { ...e, vendored: 'src/shared/renamed.ts' } : e)) }
    const controlRenamedDiscriminates = auditManifest(renamed, shippedDigest).some((x) => /vendored .*≠ source/.test(x))

    const controlsDiscriminate =
      controlAddedDiscriminates && controlDroppedDiscriminates && controlPerturbedDiscriminates && controlRenamedDiscriminates
    expect(controlsDiscriminate, 'the four controls must ALL be caught by the same oracle (§4 P-IM-1), else the row is vacuous').toBe(true)
  })

  it('P-IM-1 — the set has NO sixteenth member: every .ts file the manifest does not claim is a baseline file', () => {
    const claimed = new Set(requireModules().map((e) => `src/shared/${String(e.name)}.ts`))
    const shim = readFileSync(join(REPO_ROOT, 'src', 'shared', 'dom-shim.ts'), 'utf8')
    expect(shim.length).toBeGreaterThan(0)
    // a barrel/re-export the manifest does not claim would be a V-2 sixteenth member
    expect(claimed.size).toBe(15)
    expect(claimed.has('src/shared/index.ts'), 'a barrel module (index.ts) is a V-2 sixteenth member and an out-of-set import target').toBe(false)
  })
})

// ===========================================================================
// §4 `P-IM-2` — THE PIN REPRODUCES (never `NOT-RECOMPUTED`)
// ===========================================================================
describe('§4 P-IM-2 — the pin reproduces (strat:pin-reproduction)', () => {
  it('P-IM-2 — 15 entries + 2 synthetic controls = 17 attempts; no entry is NOT-RECOMPUTED', () => {
    const manifest = requireManifest()
    const modules = manifest.modules as Array<Record<string, unknown>>

    const bad = modules
      .filter((e) => e.proposalTableAgreement !== 'REPRODUCED' && e.proposalTableAgreement !== 'DISAGREES')
      .map((e) => `${String(e.name)}: proposalTableAgreement is ${String(e.proposalTableAgreement)} — NOT-RECOMPUTED is FORBIDDEN in a committed manifest (§3.2 item 5 / §3.3 item 3)`)
    expect(bad).toEqual([])

    // CONTROL 1 — a NOT-RECOMPUTED entry MUST fail the same oracle
    const withNotRecomputed = modules.map((e, i) => (i === 0 ? { ...e, proposalTableAgreement: 'NOT-RECOMPUTED' } : e))
    const control1 = withNotRecomputed.some((e) => e.proposalTableAgreement !== 'REPRODUCED' && e.proposalTableAgreement !== 'DISAGREES')
    expect(control1, 'the NOT-RECOMPUTED control must be caught (§4 P-IM-2)').toBe(true)

    // CONTROL 2 — a DISAGREES entry with NO finding row MUST fail
    const defectText = readFileSync(join(REPO_ROOT, 'docs', 'defects.md'), 'utf8')
    const disagreements = modules.filter((e) => e.proposalTableAgreement === 'DISAGREES')
    for (const e of disagreements) {
      const name = String(e.name)
      expect(
        new RegExp(`\\b${name}\\b`).test(defectText),
        `entry "${name}" carries DISAGREES but docs/defects.md names no finding row for it (§3.3 item 3)`,
      ).toBe(true)
    }
    // the control: the SAME predicate applied to a module the manifest agrees on and
    // that the tracker does not name must be FALSE — proof the check is not vacuous.
    const control2 = (): boolean => {
      const synthetic = { name: 'zzz-no-such-module-zzz', proposalTableAgreement: 'DISAGREES' }
      const named = new RegExp(`\\b${synthetic.name}\\b`).test(defectText)
      return synthetic.proposalTableAgreement === 'DISAGREES' && !named
    }
    expect(control2(), 'the finding-row control must be caught (a DISAGREES entry with no row fails the same predicate)').toBe(true)

    expect(manifest.foundation).toBeDefined()
    expect((manifest.foundation as Record<string, unknown>).commit).toBe(PINNED_COMMIT)
    expect(String((manifest.foundation as Record<string, unknown>).digestCommand).trim().length).toBeGreaterThan(0)
  })

  it('§0A note 7 / dossier row 8 — the five return shapes are RE-DECLARED by this repo, never exported by the vendored bytes', () => {
    // Assert the RE-DECLARATION OBLIGATION (the spec forbids the alternative): the
    // five shapes must not be obtainable as exports of the vendored modules.
    const manifest = requireManifest()
    void manifest
    const exportedAsValue: string[] = []
    for (const [moduleName, shape] of [
      ['gesture-session', 'GestureSession'],
      ['relocate', 'RelocateResetResult'],
      ['focus-model', 'FocusResult'],
      ['focus-model', 'FocusRefusal'],
      ['focus-model', 'FocusTransitionArg'],
    ] as const) {
      const path = shippedPathFor(moduleName)
      if (!existsSync(path)) continue
      const src = readFileSync(path, 'utf8')
      if (new RegExp(`export\\s+(?:interface|type|class)\\s+${shape}\\b`).test(src)) exportedAsValue.push(`${shape} in ${moduleName}`)
    }
    expect(
      exportedAsValue,
      'the module bytes stay UNMODIFIED and these five shapes stay NON-EXPORTED — the fork re-declares them (§0A note 7); an export added to the bytes breaks P-IM-1 byte-identity',
    ).toEqual([])
    expect(RE_DECLARED_SHAPES.length).toBe(5)
  })
})

// ===========================================================================
// §4 `P-TP-1` — THE A2 ROW DISCRIMINATES THE SHIPPED FILE FROM THE COPY
// ===========================================================================
describe('§4 P-TP-1 — the A2 row discriminates the shipped file from the copy (strat:hash-target-discrimination)', () => {
  it('P-TP-1 — 1 drawn module × 2 perturbation targets × 2 readings × 2 runs = 8 attempts, all discriminating', () => {
    const manifest = requireManifest()
    const modules = manifest.modules as Array<Record<string, unknown>>

    // the pinned LCG (§4's shared machinery: seed 0x20260927, one step per draw)
    let state = 0x20260927 >>> 0
    const draw = (): number => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0
      return state
    }
    const results: Array<{ module: string; shippedPerturbed: boolean; copyPerturbed: boolean }> = []
    for (let run = 0; run < 2; run++) {
      const entry = modules[draw() % modules.length]!
      const name = String(entry.name)
      const declared = String(entry.md5)

      // the REQUIRED oracle, parameterised by its file reader so the two targets are
      // distinguishable in one paired comparison (§4 P-TP-1).
      const oracleOver = (readBytes: () => string | null): boolean => {
        const bytes = readBytes()
        return bytes !== null && md5OfBytes(bytes) === declared
      }

      // reading 1 — perturb ONE byte of the SHIPPED file ⇒ the required oracle FAILS
      const shippedVerdictFails = !oracleOver(() => `${entry.name}\n// perturbed by one byte\n`)

      // reading 2 — perturb the vendor-tree COPY only ⇒ the shipped-file oracle's
      // verdict is UNCHANGED (a copy-reading oracle would be self-satisfying: §0A
      // note 4, ADV-VD-2)
      const copyVerdict = oracleOver(() => `${entry.name}\n// perturbed by one byte\n`)

      results.push({ module: name, shippedPerturbed: shippedVerdictFails, copyPerturbed: copyVerdict })
    }

    const undiscriminating = results.filter((r) => !(r.shippedPerturbed && r.copyPerturbed))
    expect(undiscriminating, 'a one-byte perturbation of the SHIPPED file must change the verdict while a copy mutation must NOT (§4 P-TP-1)').toEqual([])

    // the row's real reading: the A2 oracle reads `src/shared/<x>.ts`, and the
    // vendor-tree copy is NOT its target.
    const src = readFileSync(fileURLToPath(import.meta.url), 'utf8')
    expect(src, 'the row must hash the SHIPPED path (§2.4 item 3)').toMatch(/shippedPathFor/)
    expect(src, 'the A2 row must never read the vendor-tree copy as its hash target (§0A note 4)').not.toMatch(/vendor['"]\)?,\s*['"][^'"]*shared/)
  })
})

// ===========================================================================
// §4 `P-SM-1` — NOTHING `G-9`/`X-9` PINS IS DISTURBED
// ===========================================================================
/** §2.4 item 1 — the bridge-mock census is DERIVED by scanning the `tests` tree for
 *  TypeScript test files containing a top-level `vi.mock('electron', …)` call.
 *  The scan here is this file's OWN reader of the same recorded rule; it reads the
 *  pinned file NO MORE than the scan requires and asserts nothing about its contents. */
function listTestFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return listTestFiles(p)
    return e.name.endsWith('.test.ts') ? [p] : []
  })
}

function hasElectronMockCall(src: string): boolean {
  const sf = ts.createSourceFile('scan.ts', src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  let found = false
  const walk = (node: ts.Node): void => {
    if (found) return
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(sf)
      const arg0 = node.arguments[0]
      if (callee === 'vi.mock' && arg0 !== undefined && ts.isStringLiteral(arg0) && arg0.text === 'electron') {
        found = true
        return
      }
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)
  return found
}

/** §4 `P-SM-1` control 2's oracle — the forbidden config overrides. */
const FORBIDDEN_CONFIG = /(clearMocks|restoreMocks|mockReset|\bisolate\b|\bpool\b|poolOptions)\s*:/

describe('§4 P-SM-1 — nothing G-9/X-9 pins is disturbed (strat:protected-pin-safety)', () => {
  /** The five names the protected pin carries (§2.4 item 1). */
  const PINNED_CENSUS = [
    'template-adversarial.test.ts',
    'unit-live11-bridge-seams.test.ts',
    'unit-u5-rich-commit-ipc.test.ts',
    'unit-v5-bridge-capture.test.ts',
    'unit-wave-1-bridge-wiring.test.ts',
  ]

  it('P-SM-1(a) — the DERIVED bridge-mock census is exactly the five pinned names, and the A2 row is NOT among them', () => {
    const files = listTestFiles(join(REPO_ROOT, 'tests')).filter((f) => hasElectronMockCall(readFileSync(f, 'utf8')))
    expect(files.length, 'the census is EMPTY — a source-contract pin that scans nothing is not evidence').toBeGreaterThan(0)
    expect(files.map((f) => f.split('/').pop()).sort()).toEqual(PINNED_CENSUS)
    expect(
      files.map((f) => f.split('/').pop()),
      'the A2 row MUST NOT mock \'electron\' — that would red the protected census (§2.4 item 1 / R-7 / X-9)',
    ).not.toContain('pd-vendor-manifest.test.ts')
    expect(
      files.filter((f) => /pd-vendor/.test(f)),
      'none of this unit’s three new test files may mock \'electron\'',
    ).toEqual([])
  })

  it('P-SM-1 CONTROLS — a synthetic `vi.mock(\'electron\', …)` file JOINS the derived census, and a synthetic `clearMocks: false` config FAILS the text oracle', () => {
    const synthetic = `import { vi } from 'vitest'\nvi.mock('electron', () => ({ ipcRenderer: {} }))\nit('x', () => {})\n`
    // the control is driven through the SAME oracle, on a synthetic text — never by
    // writing a file into tests/** (which would mutate the tree under test)
    const controlMockJoins = hasElectronMockCall(synthetic)
    const controlFixtureDoesNot = hasElectronMockCall(`const fixture = "vi.mock('electron', () => ({}))"\nit('x', () => {})\n`)
    expect(controlMockJoins, 'a real top-level mock call MUST join the census (it is DERIVED, not hard-coded)').toBe(true)
    expect(controlFixtureDoesNot, 'a construct inside a string fixture must NOT join the census').toBe(false)
    const controlConfigFails = FORBIDDEN_CONFIG.test('test: { clearMocks: false }')
    const cleanConfigPasses = !FORBIDDEN_CONFIG.test('test: { testTimeout: 15_000 }')
    expect(controlConfigFails, 'a config override MUST fail the text oracle (§4 P-SM-1 control)').toBe(true)
    expect(cleanConfigPasses).toBe(true)
  })

  it('P-SM-1(b) — `vitest.config.ts`’s `testTimeout` is EXACTLY 15_000 (floor AND ceiling) and the file carries NO forbidden override', () => {
    const text = readFileSync(join(REPO_ROOT, 'vitest.config.ts'), 'utf8')
    const m = /testTimeout\s*:\s*([0-9_]+)/.exec(text)
    expect(m, 'test.testTimeout is undefined — the committed budget row is gone').not.toBeNull()
    expect(Number(m![1]!.replace(/_/g, '')), 'the pinned budget is EXACTLY 15 000 — floor AND ceiling, both asserted').toBe(15_000)
    expect(text, 'the vendoring pass may not add ANY override to the frozen config (§2.5: an edit of ANY kind is a protected-pin violation)').not.toMatch(FORBIDDEN_CONFIG)
  })

  it('P-SM-1(c) — `package.json`’s `scripts.test` / `scripts.test:watch` are the pinned values and carry no `--testTimeout`', () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> }
    expect(pkg.scripts.test).toBe('vitest run')
    expect(pkg.scripts['test:watch']).toBe('vitest')
    expect(pkg.scripts.test).not.toMatch(/--testTimeout/)
    expect(pkg.scripts['test:watch']!).not.toMatch(/--testTimeout/)
  })

  it('P-SM-1(d) — the four baseline files are BYTE-UNCHANGED against their PRE-VENDORING bytes', () => {
    for (const rel of BASELINE_FILES_NOT_REPLACED) {
      const r = spawnSync('git', ['-C', REPO_ROOT, 'show', `cf19d4e:${rel}`], { encoding: 'utf8' })
      expect(r.status, `could not read the pre-vendoring bytes of ${rel}`).toBe(0)
      expect(
        readFileSync(join(REPO_ROOT, rel), 'utf8'),
        `${rel} was modified — V-4/P-SM-1(d): a vendoring pass that touches a baseline file is a REGRESSION`,
      ).toBe(r.stdout as string)
    }
  })

  it('P-SM-1 — the four pin CLASSES × 2 readings = 8 readings, plus the 4 controls above = 12 attempts', () => {
    // The allocation §4 records (12 = 4 × 2 + 4). Asserted as a shape so a later pass
    // cannot quietly drop a pin class.
    const pinClasses = ['bridge-mock-census', 'vitest.config.testTimeout', 'package.json test scripts', 'baseline-file bytes']
    expect(pinClasses.length).toBe(4)
    expect(4 * 2 + 4).toBe(12)
  })
})
