// tests/pd-vendor-manifest.test.ts — unit `PD-VENDOR`, the `A2` HASH ROW and the
// register rows `P-IM-1` / `P-IM-2` / `P-TP-1` / `P-SM-1` / **`P-IM-4`**.
//
// ⟨REMANDED 2026-09-28 (spec §12.3(a) `C-AM-1` / §12.4 `O-7`).⟩ Two rows changed:
//   · `P-TP-1` now implements the CORRECTED property of the spec’s **`§4.1`** — ONE
//     drawn module, the SHIPPED oracle on the shipped path, and the discrimination
//     stated as a **PAIR OF ORACLES ON ONE PERTURBED CLOSURE** (`oracleShipped` MUST
//     fail, `oracleCopy` MUST still pass against its own UNPERTURBED bytes). The
//     as-filed row demanded one oracle FAIL and PASS on the SAME closure — a strict
//     contradiction, unsatisfiable for any manifest. Row id and term `8` are KEPT.
//   · **`P-IM-4`** is ADDED (the register row the amendment mints): the five
//     foundation shapes declared WITHOUT `export` must be re-declared TYPE-ONLY at
//     `src/shared/foundation-return-shapes.ts` (§2.1 item 7b; §12.4). 12 = 5 × 2 + 2.
// Register arithmetic (printed with its terms): `19 + 17 + 17 + 12 + 10 + 8 + 20 + 12
// = 115` attempts — the as-filed `103` is KEPT visible as provenance (§4’s amended
// tally).
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
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
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
const PINNED_COMMIT = 'd7b98b574adc7fa63fbabda617eba2a753f52cb5'

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

  it('§3.3 item 2 — foundation.commit equals the pinned revision d7b98b57…f52cb5 ⟨superseded: 8f193a8…f82459 was the pin before the 2026-09-28 refresh⟩', () => {
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
// §4 `P-TP-1` (CORRECTED — the spec’s `§4.1`) — THE A2 ROW DISCRIMINATES THE
// SHIPPED FILE FROM THE COPY
// ===========================================================================
/** §4.1 item 3 — the copy target the row COMPUTES: the `vendor/`-tree copy at the
 *  path derived below **iff it exists as a separate file**; otherwise a SYNTHETIC
 *  copy target (a temp path holding the UNPERTURBED shipped bytes). The row records
 *  which arm it took and never claims a copy reading it did not take. */
const VENDOR_COPY_ROOT = join(REPO_ROOT, 'vendor', 'Provident-Electron', 'src', 'shared')

describe('§4 P-TP-1 — the A2 row discriminates the shipped file from the copy (strat:hash-target-discrimination)', () => {
  it('P-TP-1 — 1 drawn module × 2 perturbation targets × 2 readings × 2 runs = 8 attempts; the (FAIL, PASS) oracle PAIR is the falsifiable content (§4.1)', () => {
    const manifest = requireManifest()
    const modules = manifest.modules as Array<Record<string, unknown>>

    // the pinned LCG (§4's shared machinery: seed 0x20260927, one step per draw)
    let state = 0x20260927 >>> 0
    const draw = (): number => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0
      return state
    }
    /** ONE byte perturbed — the row's single perturbation of a closure (§4.1 item 1/2). */
    const perturbOneByte = (bytes: Buffer): Buffer => {
      const out = Buffer.from(bytes)
      out[0] = out[0]! ^ 0x01
      return out
    }
    /**
     * ⟨A-8 CORRECTION (MED, `TEST-DEFECT`) — THE ROW NOW DRIVES THE REAL `A2` ORACLE.⟩
     * §3a `A-8`: the row "does not exercise the `A2` oracle at all — it defines two
     * LOCAL closures over bytes it read itself (`auditManifest`/`shippedDigest` are
     * never called)". The correction: drive the REAL `auditManifest` + `shippedDigest`
     * against a TEMP-COPIED tree, so the oracle under test is the unit's own.
     *
     * `copyShippedTree` materializes `src/shared/<x>.ts` for every manifest entry under
     * a fresh temp root, from the pinned blobs. The temp root is removed in the row's
     * `finally` and NOTHING outside it is ever written or removed.
     */
    const copyShippedTree = (): { root: string; dir: string } => {
      const root = mkdtempSync(join(tmpdir(), 'pd-vendor-a2-tree-'))
      const dir = join(root, 'src', 'shared')
      mkdirSync(dir, { recursive: true })
      for (const e of modules) {
        const name = String(e.name)
        const source = shippedPathFor(name)
        expect(existsSync(source), `RED (PD-VENDOR §2.4 item 3): the shipped file ${source} does not exist`).toBe(true)
        writeFileSync(join(dir, `${name}.ts`), readFileSync(source))
      }
      return { root, dir }
    }
    /** The `A2` oracle's per-module verdict over a tree ROOT, taken through the REAL
     *  `shippedDigest` reader and the REAL `auditManifest`. */
    const auditAtRoot = (root: string): string[] => {
      const digestAt = (name: string): string | null => md5OfFile(join(root, 'src', 'shared', `${name}.ts`))
      const violations = auditManifest(manifest, digestAt)
      // the count/set facts are the manifest's own and identical at every root: this
      // row's readings are the PER-MODULE digest verdicts, which is exactly what the
      // perturbation moves.
      return violations.filter((v) => !/moduleCount is|modules\.length is|declared name set|declared twice/.test(v))
    }
    /** The SHIPPED-path oracle: `shippedDigest` over `src/shared/<name>.ts` — the
     *  required target of §0A note 4 / §2.4 item 3. */
    const oracleShipped = (name: string): boolean => shippedDigest(name) === String(modules.find((e) => String(e.name) === name)?.md5)

    interface RunReading {
      module: string
      copyTarget: string
      copyTargetSynthetic: boolean
      shippedRealViaOracle: boolean
      shippedOnPerturbedShipped: boolean
      copyOnPerturbedShipped: boolean
      shippedOnPerturbedCopy: boolean
      copyOnPerturbedCopy: boolean
    }

    const tempRoots: string[] = []
    const syntheticCopyDirs: string[] = []
    const runs: RunReading[] = []
    try {
      for (let run = 0; run < 2; run++) {
        const entry = modules[draw() % modules.length]!
        const name = String(entry.name)
        const declared = String(entry.md5)

        // §4.1 items 1/2 — THE ONE DRAWN MODULE: the SHIPPED file is the oracle's target.
        const shippedPath = shippedPathFor(name)
        expect(existsSync(shippedPath), `RED (PD-VENDOR §2.4 item 3 / §3.2 item 3): the shipped file ${shippedPath} does not exist`).toBe(true)
        const shippedBytes = readFileSync(shippedPath) // UNPERTURBED

        // READING 1 — THE REAL READING on the UNPERTURBED tree, driven through the REAL
        // `shippedDigest` + `auditManifest` over a temp-copied tree (§3a `A-8`).
        const tree = copyShippedTree()
        tempRoots.push(tree.root)
        const cleanViolations = auditAtRoot(tree.root)
        const shippedRealViaOracle = cleanViolations.length === 0
        expect(
          shippedRealViaOracle,
          `the per-module audit over the UNPERTURBED temp tree must hold for every entry — the REAL ` +
            `auditManifest + shippedDigest were driven (violations: ${cleanViolations.join(' | ') || '<none>'})`,
        ).toBe(true)
        expect(
          oracleShipped(name),
          'the shipped oracle over the REAL path returns PASS iff md5(shipped) === declared (§4.1 item 1)',
        ).toBe(md5OfFile(shippedPath) === declared)

        // THE PERTURBED CLOSURE — ONE byte perturbed in the tree's `src/shared/<x>.ts`
        const perturbedShipped = perturbOneByte(shippedBytes)
        writeFileSync(join(tree.dir, `${name}.ts`), perturbedShipped)
        expect(md5OfBytes(perturbedShipped), 'the perturbation must actually CHANGE the closure — a no-op perturbation would make the pair vacuous').not.toBe(declared)
        const perturbedViolations = auditAtRoot(tree.root)
        const shippedOnPerturbedShipped = perturbedViolations.length === 0
        expect(
          perturbedViolations.join(' '),
          `the REAL auditManifest must NAME the perturbed module — it read ${join(tree.dir, `${name}.ts`)}`,
        ).toContain(name)
        expect(
          shippedOnPerturbedShipped,
          'the shipped oracle MUST FAIL when ONE byte of `src/shared/<x>.ts` is perturbed (§4.1 item 2)',
        ).toBe(false)

        // THE COPY TARGET — §4.1 item 3: the `vendor/`-tree copy iff it exists as a
        // separate file, else a SYNTHETIC copy path holding the UNPERTURBED shipped
        // bytes. The row records which arm it took and never claims a copy reading it
        // did not take. `oracleCopy` reads ITS OWN target through the SAME real reader.
        const realCopyPath = join(VENDOR_COPY_ROOT, `${name}.ts`)
        let copyPath: string
        let copyTargetSynthetic: boolean
        if (existsSync(realCopyPath)) {
          copyPath = realCopyPath
          copyTargetSynthetic = false
        } else {
          const dir = mkdtempSync(join(tmpdir(), 'pd-vendor-copy-target-'))
          syntheticCopyDirs.push(dir)
          copyPath = join(dir, `${name}.ts`)
          writeFileSync(copyPath, shippedBytes)
          copyTargetSynthetic = true
        }
        expect(resolve(copyPath), 'the copy oracle\u2019s target must be a DIFFERENT FILE from the shipped oracle\u2019s (§4.1 item 2)').not.toBe(resolve(shippedPath))
        const oracleCopy = (): boolean => md5OfBytes(readFileSync(copyPath)) === declared
        const copyOnPerturbedShipped = oracleCopy()
        expect(
          copyOnPerturbedShipped,
          'oracleCopy MUST still PASS on the SAME perturbed closure, against its own UNPERTURBED bytes (§4.1 item 2) — ' +
            `${copyTargetSynthetic ? 'the copy target is a SYNTHETIC temp path holding the unperturbed shipped bytes' : 'the copy target is the real vendor-tree copy'}`,
        ).toBe(true)

        // THE SECOND PERTURBATION TARGET, driven the other way (the pairing is symmetric:
        // 2 targets × 2 readings).
        const perturbedCopy = perturbOneByte(readFileSync(copyPath))
        const copyOnPerturbedCopy = md5OfBytes(perturbedCopy) === declared
        expect(copyOnPerturbedCopy, 'oracleCopy MUST FAIL when one byte of ITS OWN target is perturbed').toBe(false)
        const shippedOnPerturbedCopy = oracleShipped(name)
        expect(shippedOnPerturbedCopy, 'and oracleShipped MUST still PASS — the mutation is not of the file it reads').toBe(true)

        runs.push({
          module: name,
          copyTarget: copyPath,
          copyTargetSynthetic,
          shippedRealViaOracle,
          shippedOnPerturbedShipped,
          copyOnPerturbedShipped,
          shippedOnPerturbedCopy,
          copyOnPerturbedCopy,
        })
      }
    } finally {
      for (const root of tempRoots) rmSync(root, { recursive: true, force: true })
      for (const dir of syntheticCopyDirs) rmSync(dir, { recursive: true, force: true })
    }

    expect(runs.length, '2 runs, ONE drawn module each (§4.1 item 4 — the term is unchanged at 8)').toBe(2)
    const undiscriminating = runs.filter(
      (r) =>
        !(
          r.shippedRealViaOracle &&
          !r.shippedOnPerturbedShipped &&
          r.copyOnPerturbedShipped &&
          !r.copyOnPerturbedCopy &&
          r.shippedOnPerturbedCopy
        ),
    )
    expect(
      undiscriminating,
      'every run must produce the pair (oracleShipped FAIL, oracleCopy PASS) on ONE perturbed closure, and the mirror pair on the copy-side perturbation (§4.1 item 2)',
    ).toEqual([])
    // the tally, printed with its terms: 1 drawn module × 2 perturbation targets ×
    // 2 readings × 2 runs = 8. `⟨A-13⟩` this term is driven by the two runs above: the
    // drawn module, the two targets and the two readings are all real draws/readings.
    expect(1 * 2 * 2 * 2, 'P-TP-1\u2019s attempts term is UNCHANGED at 8 (§4\u2019s amended tally / §12.3(a))').toBe(8)
    expect(runs.map((r) => r.module).length, 'each run names the module it drew').toBe(2)
    expect(tempRoots.length, 'each run audited a temp-COPIED tree (the REAL oracle, §3a `A-8`)').toBe(2)

    // ⟨A-8 CORRECTION⟩ THE RETAINED SOURCE-TEXT GUARD IS REPLACED BY A PATH-LEVEL
    // ASSERTION. The old regex was NON-DISCRIMINATING (it matched the very source it
    // was meant to catch). The path-level reading asserts the structural fact instead:
    // the `A2` row's shipped digest is taken under `<repo>/src/shared`, and the
    // `vendor/Provident-Electron/tests/` tree is read by NO row in this file.
    expect(
      VENDOR_COPY_ROOT,
      'the vendor-tree copy root is a DIFFERENT directory from the shipped path’s parent — the oracle\u2019s target is the shipped file (§0A note 4 / §2.4 item 3)',
    ).not.toBe(join(REPO_ROOT, 'src', 'shared'))
    expect(
      dirname(shippedPathFor('theme')),
      'the A2 oracle\u2019s target must resolve under `<repo>/src/shared` — the SHIPPED file, never the `vendor/`-tree copy (§2.4 item 3)',
    ).toBe(join(REPO_ROOT, 'src', 'shared'))
    expect(
      resolve(VENDOR_COPY_ROOT).startsWith(`${resolve(join(REPO_ROOT, 'vendor', 'Provident-Electron'))}`),
      'the copy path resolves under `vendor/Provident-Electron/` — the tree the A2 oracle must NOT read',
    ).toBe(true)
    const legacyTestsCopyRoot = join(REPO_ROOT, 'vendor', 'Provident-Electron', 'tests')
    expect(existsSync(legacyTestsCopyRoot), 'the vendored suites\u2019 placement exists (§0A note 2 / D-2)').toBe(true)
    expect(
      REPO_ROOT.endsWith('Astrographer'),
      'the shipped path is read from THIS repository — the temp-copied trees above exist only under the OS temp dir and are removed in the `finally`',
    ).toBe(true)
  })
})

// ===========================================================================
// §3a `A-11` — THE MIRROR'S MEMBERS (HOST-FIX; RED at HEAD).
// THE NEGATIVE GENERATOR §3a's PBT audit TASKED (iii): a MEMBER-LIST generator —
// AST-extracted members of the five shapes, mirror vs declaration.
// ===========================================================================
/** §2.1 item 7 / §12.4 `D-11` — each shape and the vendored module declaring it
 *  WITHOUT `export`. */
const MIRROR_SHAPES: Array<{ shape: string; owner: string; members: number }> = [
  { shape: 'GestureSession', owner: 'gesture-session', members: 9 },
  { shape: 'RelocateResetResult', owner: 'relocate', members: 3 },
  { shape: 'FocusResult', owner: 'focus-model', members: 7 },
  { shape: 'FocusRefusal', owner: 'focus-model', members: 3 },
  { shape: 'FocusTransitionArg', owner: 'focus-model', members: 4 },
]

/** The monitor's AST member extractor, loaded by name (§3a `A-11`'s ruled
 *  derivation: the `typescript` devDependency, never a regex). */
async function loadShapeMembersOracle(): Promise<(sourceText: string, shape: string) => string[] | null> {
  const monitor = join(REPO_ROOT, 'scripts', 'foundation-drift.mjs')
  expect(existsSync(monitor), `RED (PD-VENDOR §2.3): the A3 monitor ${monitor} does not exist`).toBe(true)
  const mod = (await import(/* @vite-ignore */ pathToFileURL(monitor).href)) as Record<string, unknown>
  const fn = (mod.shapeMembers ?? (mod.default as Record<string, unknown> | undefined)?.shapeMembers) as
    | ((text: string, shape: string) => string[] | null)
    | undefined
  return fn as (text: string, shape: string) => string[] | null
}

describe('§3a A-11 — the five shapes’ MEMBERS are compared member-by-member (AST oracle; negative generator iii; RED at HEAD by design)', () => {
  it("⟨A-11 CORRECTION⟩ AST-extracted member names: the mirror's members equal the vendored DECLARATIONS', for all five shapes", async () => {
    const oracle = await loadShapeMembersOracle()
    expect(
      typeof oracle,
      'RED (PD-VENDOR §3a `A-11`): the monitor must EXPORT an AST member extractor (`shapeMembers(sourceText, shape)`) — §3a\u2019s disposition is `HOST-FIX`: "add a row that AST-extracts each shape\u2019s member names from the vendored declarations and from the mirror and compares them"',
    ).toBe('function')
    const mirrorText = requireReDeclaration()
    const problems: string[] = []
    for (const { shape, owner, members } of MIRROR_SHAPES) {
      const declarationText = requireShippedText(owner)
      const declared = oracle(declarationText, shape)
      const mirrored = oracle(mirrorText, shape)
      expect(declared, `\`${shape}\` must be FOUND in src/shared/${owner}.ts — a null reading means the extractor could not see a declaration that exists (§2.1 item 7)`).not.toBeNull()
      expect(mirrored, `\`${shape}\` must be FOUND in the re-declaration file (§2.1 item 7b rule 1)`).not.toBeNull()
      expect(declared!.length, `\`${shape}\`: the vendored declaration carries ${members} members (§3a\u2019s member-by-member reading: 9/3/7/3/4)`).toBe(members)
      const missing = declared!.filter((m) => !mirrored!.includes(m))
      const extra = mirrored!.filter((m) => !declared!.includes(m))
      if (missing.length > 0 || extra.length > 0) {
        problems.push(`${shape}: missing from the mirror [${missing.join(', ')}], not in the declaration [${extra.join(', ')}]`)
      }
      expect(mirrored, `\`${shape}\`: the mirror\u2019s member ORDER is the declaration\u2019s declared order (§2.1 item 7b rule 3 — the mirror restates the members, not a paraphrase)`).toEqual(declared)
    }
    expect(
      problems,
      'a structurally WRONG mirror keeps every name-presence row and `typecheck` green today — that silence is §3a `A-11`; the member lists must be compared, not the five names alone',
    ).toEqual([])
  })

  it('⟨A-11 CORRECTION⟩ the member generator DISCRIMINATES: a ONE-MEMBER mutation of the mirror is caught, and the same oracle over the real texts is clean', async () => {
    const oracle = await loadShapeMembersOracle()
    expect(typeof oracle, 'RED (PD-VENDOR §3a `A-11`): the AST member oracle must exist before it can discriminate').toBe('function')
    const mirrorText = requireReDeclaration()
    const declaration = oracle(requireShippedText('focus-model'), 'FocusResult')
    expect(declaration, '`FocusResult` must be extractable from src/shared/focus-model.ts').not.toBeNull()
    // the control: the mirror text with ONE member of `FocusResult` DELETED must differ
    const mutated = mirrorText.replace(/\n\s*readonly persisted: \{[^\n]*\n/, '\n')
    expect(mutated, 'the mutation must actually change the mirror text — else the control proves nothing').not.toBe(mirrorText)
    const mutatedMembers = oracle(mutated, 'FocusResult')
    expect(mutatedMembers, 'the mutated mirror must still be parseable').not.toBeNull()
    expect(
      mutatedMembers!.length,
      'a mirror MISSING ONE member of `FocusResult` must be caught by the member comparison — the exact silent drift §3a `A-11` records',
    ).toBe(declaration!.length - 1)
    expect(oracle(mirrorText, 'FocusResult'), 'and the REAL mirror text is clean under the same oracle').toEqual(declaration)
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

  it('⟨A-12 CORRECTION⟩ the VENDORED suites are scanned for the same mock by ANY access form (aliased, computed, or direct) — the census’s own derivation reads only the literal `vi`', () => {
    // §3a `A-12`: "the census matches `callee === 'vi.mock'` on the literal `vi`, so an
    // aliased or computed call joins neither the protected census nor the copy's
    // derivation." The frozen protected pin is NOT edited (that is an ARCHITECT
    // escalation, §3b) — this row supplies the evasion-complete derivation for the
    // surface this unit OWNS: the eleven vendored suite copies (and the whole vendored
    // tests tree, so a twelfth copy is covered too).
    const vendoredTests = join(REPO_ROOT, 'vendor', 'Provident-Electron', 'tests')
    expect(existsSync(vendoredTests), 'RED (PD-VENDOR §0A note 2 / D-2): vendor/Provident-Electron/tests/ does not exist').toBe(true)
    const suiteFiles = readdirSync(vendoredTests).filter((f) => f.endsWith('.test.ts'))
    expect(suiteFiles.length, 'the eleven byte copies (§0A note 2; §12.1 ITEM 1)').toBe(11)
    const mockBindingForms = (src: string): string[] => {
      const sf = ts.createSourceFile('scan.ts', src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
      // every local name bound to the `vi` export (aliased import, namespace import,
      // or a local alias of either)
      const aliases = new Set<string>()
      for (const stmt of sf.statements) {
        if (!ts.isImportDeclaration(stmt) || !ts.isStringLiteral(stmt.moduleSpecifier) || stmt.moduleSpecifier.text !== 'vitest') continue
        const clause = stmt.importClause
        if (clause === undefined) continue
        if (clause.name !== undefined) aliases.add(clause.name.text)
        const named = clause.namedBindings
        if (named !== undefined && ts.isNamespaceImport(named)) aliases.add(named.name.text)
        if (named !== undefined && ts.isNamedImports(named)) {
          for (const el of named.elements) {
            if ((el.propertyName ?? el.name).text === 'vi') aliases.add(el.name.text)
          }
        }
      }
      for (const stmt of sf.statements) {
        if (!ts.isVariableStatement(stmt)) continue
        for (const decl of stmt.declarationList.declarations) {
          if (decl.initializer !== undefined && ts.isIdentifier(decl.initializer) && aliases.has(decl.initializer.text) && ts.isIdentifier(decl.name)) aliases.add(decl.name.text)
        }
      }
      const forms: string[] = []
      const walk = (node: ts.Node): void => {
        if (ts.isCallExpression(node)) {
          const callee = node.expression
          let bound = false
          if (ts.isPropertyAccessExpression(callee)) {
            bound = callee.name.text === 'mock' && ts.isIdentifier(callee.expression) && aliases.has(callee.expression.text)
          } else if (ts.isElementAccessExpression(callee)) {
            const arg = callee.argumentExpression
            bound =
              arg !== undefined &&
              ((ts.isStringLiteral(arg) && arg.text === 'mock') || (ts.isIdentifier(arg) && arg.text === 'mock')) &&
              ts.isIdentifier(callee.expression) &&
              aliases.has(callee.expression.text)
          }
          if (bound) {
            const first = node.arguments[0]
            forms.push(first !== undefined && ts.isStringLiteral(first) ? first.text : '<computed>')
          }
        }
        ts.forEachChild(node, walk)
      }
      walk(sf)
      return forms
    }
    const electronSites: string[] = []
    for (const f of suiteFiles) {
      for (const target of mockBindingForms(readFileSync(join(vendoredTests, f), 'utf8'))) {
        if (target === 'electron') electronSites.push(`${f} (target 'electron')`)
      }
    }
    expect(
      electronSites,
      'NO suite filed under the leg may mock `\'electron\'` in ANY form (§3.5 item 5 / `R-4` / `X-9`) — the absolute prohibition is scanned here for the aliased and computed forms the protected census cannot see (§3a `A-12`)',
    ).toEqual([])
    // the control, driven on a synthetic text: the same reader MUST catch an aliased
    // `'electron'` mock (else the row above is vacuous), and the DIRECT form here has
    // the same shape the protected pin counts.
    const syntheticAliased = `import { vi as v } from 'vitest'\nv.mock('electron', () => ({}))\n`
    const syntheticComputed = `import * as vitest from 'vitest'\nvitest['mock']('electron', () => ({}))\n`
    const syntheticDirect = `import { vi } from 'vitest'\nvi.mock('electron', () => ({}))\n`
    expect(mockBindingForms(syntheticAliased), 'the control must catch an ALIASED electron mock').toEqual(['electron'])
    expect(mockBindingForms(syntheticComputed), 'the control must catch a COMPUTED electron mock').toEqual(['electron'])
    expect(mockBindingForms(syntheticDirect), 'the control must catch the DIRECT form the protected pin counts').toEqual(['electron'])
    expect(mockBindingForms(`const fixture = "vi.mock('electron', () => ({}))"\n`), 'a construct inside a string must NOT be caught').toEqual([])
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

// ===========================================================================
// §4 `P-IM-4` — ADDED 2026-09-28 (the `O-7` obligation became ROW-BEARING).
// THE FIVE UNEXPORTED SHAPES ARE RE-DECLARED BY THIS REPO — AND THE VENDORED
// BYTES STILL DO NOT EXPORT THEM.
//
//   §0A note 7 / §1.1 item 6 / §1.2 / D-11  the RULED re-declaration path is
//     `src/shared/foundation-return-shapes.ts` (fork-local, TYPE-ONLY)
//   §2.1 item 7b rules 1–5                  the five declaration rules this row asserts
//   §4 `P-IM-4`                             12 = 5 shapes × 2 facts + 2 controls, and
//     the controls discriminate BOTH ways: a synthetic re-declaration missing ONE of
//     the five MUST fail the first half, a synthetic ADDED `export` on a vendored
//     shape MUST fail the second half, and no ONE synthetic text satisfies both.
//   §9 item 8                               the foundation’s export gap is HANDED OFF
//     (the foundation is never patched — `G-8`)
//
// RED-FIRST (RCA-1): `src/shared/foundation-return-shapes.ts` DOES NOT EXIST at this
// head — THAT IS THIS ROW’S RED, and it is the red that forces the file to exist
// (§12.4: the obligation was stated at filing but nothing forced the file).
// ===========================================================================
/** §2.1 item 7b rule 1 / D-11 / `§0A` note 7 — THE RULED re-declaration path. */
const RE_DECLARATION_PATH = join(REPO_ROOT, 'src', 'shared', 'foundation-return-shapes.ts')

/** §2.1 item 7 / §9 item 8 — each unexported shape and the vendored module that
 *  declares it WITHOUT `export`. */
const SHAPE_OWNER_MODULE: Record<string, string> = {
  GestureSession: 'gesture-session',
  RelocateResetResult: 'relocate',
  FocusResult: 'focus-model',
  FocusRefusal: 'focus-model',
  FocusTransitionArg: 'focus-model',
}

/** The `P-IM-4` half-1 oracle: whether a text EXPORTS the named shape (a direct
 *  `export interface|type|class` declaration, or a type-only `export { … }` list). */
function shapeExportedIn(text: string, shape: string): boolean {
  return (
    new RegExp(`export\\s+(?:interface|type|class)\\s+${shape}\\b`).test(text) ||
    new RegExp(`export\\s+(?:type\\s+)?\\{[^}]*\\b${shape}\\b[^}]*\\}`).test(text)
  )
}

/** Whether a text DECLARES the named shape at all — exported or not (§2.1 item 7b
 *  rule 4: the vendored bytes must still declare the five, WITHOUT `export`). */
function shapeDeclaredIn(text: string, shape: string): boolean {
  return new RegExp(`(?:^|\\n)[ \\t]*(?:export\\s+)?(?:interface|type|class)\\s+${shape}\\b`).test(text)
}

/** The shapes the re-declaration text EXPORTS — the half-1 reading, and the oracle
 *  both controls are driven through. */
function exportedShapeDeclarations(text: string): string[] {
  return RE_DECLARED_SHAPES.filter((shape) => shapeExportedIn(text, shape))
}

/** The LOUD reader of the ruled path: an ABSENT file is a failure NAMING the path and
 *  the five shapes, never a skip and never a vacuous pass (§2.1 item 7b rule 1). */
function requireReDeclaration(): string {
  if (!existsSync(RE_DECLARATION_PATH)) {
    throw new Error(
      `RED (PD-VENDOR §2.1 item 7b rule 1 / §4 P-IM-4 / D-11): the re-declaration file ${RE_DECLARATION_PATH} does not exist — ${RE_DECLARED_SHAPES.join(', ')} are returned by values and taken by callbacks and cannot be imported from the vendored bytes, so this repo must re-declare them, TYPE-ONLY, at the ruled path`,
    )
  }
  return readFileSync(RE_DECLARATION_PATH, 'utf8')
}

/** The vendored module's bytes, read loudly (§2.1 item 1). */
function requireShippedText(name: string): string {
  const path = shippedPathFor(name)
  if (!existsSync(path)) {
    throw new Error(`RED (PD-VENDOR §2.1 item 1 / §3.1): the vendored module ${path} does not exist`)
  }
  return readFileSync(path, 'utf8')
}

/** The absent-file message both controls carry, so neither can pass on a missing file. */
const RE_DECLARATION_ABSENT =
  `RED (PD-VENDOR §2.1 item 7b rule 1 / §4 P-IM-4): the re-declaration file ${RE_DECLARATION_PATH} does not exist — the fork-side mirror is the row’s precondition, and a row that would pass whether or not the file existed is vacuous`

describe('§4 P-IM-4 — the five unexported shapes are re-declared by this repo, and the vendored bytes still do not export them (strat:return-shape-redeclaration)', () => {
  // --- 5 shapes × FACT 1 — the file exists and EXPORTS the shape ----------------
  for (const shape of RE_DECLARED_SHAPES) {
    it(`P-IM-4 fact 1/5 — \`${shape}\` is RE-DECLARED (and exported) at src/shared/foundation-return-shapes.ts`, () => {
      const text = requireReDeclaration()
      expect(
        exportedShapeDeclarations(text),
        `§2.1 item 7b rule 1: ${RE_DECLARATION_PATH} must declare ALL FIVE shapes — a PARTIAL file is the same failure as a missing one, and \`${shape}\` is missing from its exported declarations`,
      ).toContain(shape)
    })
  }

  // --- 5 shapes × FACT 2 — still NON-EXPORTED in its vendored module ------------
  for (const shape of RE_DECLARED_SHAPES) {
    const owner = SHAPE_OWNER_MODULE[shape]!
    it(`P-IM-4 fact 2/5 — \`${shape}\` remains NON-EXPORTED in src/shared/${owner}.ts (the vendored bytes stay UNMODIFIED)`, () => {
      // The row's own precondition, asserted FIRST so this half cannot be satisfied by
      // an empty repo: the non-exported fact is evidence of the RE-DECLARATION
      // OBLIGATION only while the fork-side mirror exists (§2.1 item 7b rule 1).
      expect(existsSync(RE_DECLARATION_PATH), RE_DECLARATION_ABSENT).toBe(true)
      const moduleText = requireShippedText(owner)
      expect(
        shapeDeclaredIn(moduleText, shape),
        `\`${shape}\` must be DECLARED in ${owner}.ts (§2.1 item 7) even though it is not exported`,
      ).toBe(true)
      expect(
        shapeExportedIn(moduleText, shape),
        `\`${shape}\` must remain NON-EXPORTED in its vendored module — adding an \`export\` would break P-IM-1’s byte-identity (§2.1 item 7b rule 4; §3.1 V-5). The foundation is NOT patched (G-8): the gap is the HANDOFF item of §9 item 8`,
      ).toBe(false)
    })
  }

  // --- CONTROL 1 — a synthetic re-declaration missing ONE of the five ----------
  it('P-IM-4 CONTROL 1 — a synthetic re-declaration MISSING ONE of the five FAILS the same oracle; the real file’s TYPE-ONLY surface and non-membership are asserted here', () => {
    const text = requireReDeclaration() // RED while the file is absent — never a pass
    expect(
      exportedShapeDeclarations(text).sort(),
      'the real file must export ALL FIVE (§2.1 item 7b rule 1)',
    ).toEqual([...RE_DECLARED_SHAPES].sort())

    // the DISCRIMINATING control: the SAME oracle over a synthetic text missing exactly one
    const syntheticMissingOne = RE_DECLARED_SHAPES.filter((s) => s !== 'FocusRefusal')
      .map((s) => `export interface ${s} { readonly ok: boolean }`)
      .join('\n')
    expect(
      RE_DECLARED_SHAPES.filter((s) => !exportedShapeDeclarations(syntheticMissingOne).includes(s)),
      'a synthetic re-declaration MISSING ONE of the five MUST fail the same oracle (§4 P-IM-4 control)',
    ).toEqual(['FocusRefusal'])
    expect(
      exportedShapeDeclarations(RE_DECLARED_SHAPES.map((s) => `export interface ${s} { readonly ok: boolean }`).join('\n')).length,
      'and the control discriminates the other way: the FULL synthetic text passes the same oracle',
    ).toBe(5)

    // §2.1 item 7b rule 2 — TYPE-ONLY: no import of ANY kind, and no runtime value
    expect(text, 'the re-declaration file must carry NO import of any kind — it may not become a sixteenth edge (§2.1 item 7b rule 2 / P-IM-3)').not.toMatch(/(?:^|\n)[ \t]*import\b/)
    expect(text, 'no `from` specifier may appear — the file is not an import-graph member').not.toMatch(/\bfrom\s+['"]/)
    expect(text, 'no dynamic `import(…)` and no `require(…)` — both would be runtime edges').not.toMatch(/\b(?:import\s*\(|require\s*\()/)
    expect(text, 'no RUNTIME export: the surface is TYPE-ONLY (§2.1 item 7b rule 2 — interface/type/class-type only)').not.toMatch(/(?:^|\n)[ \t]*export\s+(?:const|function|let|var)\b/)

    // §2.1 item 7b rule 5 — NOT a vendored member and NOT a baseline file
    const manifest = requireManifest()
    const moduleNames = (manifest.modules as Array<Record<string, unknown>>).map((e) => String(e.name))
    expect(moduleNames.length, 'the manifest’s `modules` still carries EXACTLY fifteen entries (§2.1 item 7b rule 5)').toBe(15)
    expect(moduleNames, 'the re-declaration file is NOT a sixteenth vendored member').not.toContain('foundation-return-shapes')
    expect(manifest.baselineFilesNotReplaced as string[], 'and it is NOT one of the four baseline files').not.toContain(
      'src/shared/foundation-return-shapes.ts',
    )

    // §4’s amended tally — P-IM-4’s attempts term, printed with its terms
    expect(RE_DECLARED_SHAPES.length * 2 + 2, 'P-IM-4’s term: 12 = 5 shapes × 2 facts + 2 controls (§4’s amended tally / §12.4)').toBe(12)
  })

  // --- CONTROL 2 — a synthetic ADDED `export` on a vendored shape --------------
  it('P-IM-4 CONTROL 2 — a synthetic ADDED `export` on a vendored shape FAILS the non-exported half, and NO ONE synthetic text satisfies both halves', () => {
    expect(existsSync(RE_DECLARATION_PATH), RE_DECLARATION_ABSENT).toBe(true)

    // the real reading of the second half
    const exportedByBytes = RE_DECLARED_SHAPES.filter((shape) => shapeExportedIn(requireShippedText(SHAPE_OWNER_MODULE[shape]!), shape))
    expect(exportedByBytes, 'no vendored module may export any of the five (§2.1 item 7b rule 4)').toEqual([])

    // the DISCRIMINATING control, the other way: an ADDED `export` on a vendored shape
    const syntheticExported = 'export interface FocusResult { readonly accepted: boolean }'
    expect(shapeExportedIn(syntheticExported, 'FocusResult'), 'the half-2 oracle must catch an ADDED `export` on a vendored shape').toBe(true)
    expect(shapeExportedIn(requireShippedText('focus-model'), 'FocusResult'), 'and the real bytes must NOT carry it').toBe(false)

    // THE NON-VACUITY CLAUSE (§4 P-IM-4): the two halves are keyed to DIFFERENT FILES,
    // so ONE AND THE SAME synthetic text cannot satisfy both — the mirror text that
    // satisfies half 1 (all five exported) VIOLATES half 2 (it exports all five).
    const mirrorText = RE_DECLARED_SHAPES.map((s) => `export interface ${s} { readonly ok: boolean }`).join('\n')
    expect(exportedShapeDeclarations(mirrorText).sort(), 'the mirror text satisfies half 1 …').toEqual([...RE_DECLARED_SHAPES].sort())
    expect(
      RE_DECLARED_SHAPES.filter((s) => shapeExportedIn(mirrorText, s)).sort(),
      '… and violates half 2 in all five — the same text cannot satisfy both halves, which is what makes the row non-vacuous',
    ).toEqual([...RE_DECLARED_SHAPES].sort())
  })
})

// ===========================================================================
// §3a `A-13` — THE REGISTER'S ACCOUNTING EXISTS IN NO LANDED ARTIFACT (`MED`,
// `HOST-FIX`; supervisor-writes for the tracker, ROW-BEARING here).
//
// §3a `A-13` quotes the register's *"115 attempts / 0 broken / stop-after-5 not
// triggered"* as a reading that exists in **no landed artifact**, and the read-only
// PBT audit adds the two facts measured below: **6 of 8 rows have no generator**
// (their terms are ASSERTED, not produced) and **three terms are literal
// tautologies** (`1*2*2*2`, `4*2+4`, `5*2+2` — `expect(<literal>).toBe(<literal>)`).
//
// THE `A-13` OPTION CHOSEN BY THIS PASS: the spec's own `§3a` correction offers two
// — *"carry a per-row held/broken census"* OR *"label its terms declared, not
// executed"*. The register's rows are spread across three files and the register is
// the spec's; a per-row held/broken census CANNOT be produced from a test file
// alone. **This pass therefore LABELS: every term is classified EXECUTED / DECLARED /
// MIXED, the classification is DERIVED from the landed sources (not restated), and
// any DECLARED-DRIVEN term — a term whose only landed reader is a literal tautology
// and which has no generator — is a LOUD FAILURE.**
//
// ⟨REMANDED 2026-09-28 (single-row remand) — THE CLASSIFICATION IS NOW DERIVED FROM
// THE SPEC'S OWN `§4` REGISTER TABLE, NOT FROM A HARD-CODED CONSTANT.⟩ As filed, this
// block listed the eight rows with a literal `kind` and then derived `declaredOnly`
// **from that same constant**, so `expect(declaredOnly).toEqual([])` was
// `['P-IM-1','P-IM-2','P-TP-2']` **by construction**: no edit to any `src/**`,
// `scripts/**`, config, manifest or spec could move it, and the row's own
// "fail loudly until the register carries the label" intent was unreachable. The
// correction: `registerRowsFromSpec()` below READS
// `docs/specs/unit-pd-vendor-foundation-mechanisms.md`'s **`§4` register table** and
// classifies each of the eight rows from **what that table now says** — the §4 row
// cells of `P-IM-1`, `P-IM-2` and `P-TP-2` carry the literal **`DECLARED, NOT
// EXECUTED`** label, the census table's three `EXECUTED`/`MIXED` rows do not, and the
// other five register rows carry neither route-2 label. The label assertion stays the
// thing UNDER TEST (it is what the row's negative control falsifies), and the
// derivation is robust to WHERE in the cell the label sits: it is matched across the
// row's whole cell list, never at a pinned column index or character offset.
// ===========================================================================
/** §4's register — the eight rows, their terms and the register's own totals. The
 *  superseded as-filed total is carried VISIBLY beside the current one. */
const REGISTER_ROWS: Array<{ row: string; term: number; kind: 'EXECUTED' | 'DECLARED' | 'MIXED' }> = [
  { row: 'P-IM-1', term: 19, kind: 'DECLARED' },
  { row: 'P-IM-2', term: 17, kind: 'DECLARED' },
  { row: 'P-IM-3', term: 17, kind: 'EXECUTED' },
  { row: 'P-SM-1', term: 12, kind: 'MIXED' },
  { row: 'P-SM-2', term: 10, kind: 'EXECUTED' },
  { row: 'P-TP-1', term: 8, kind: 'MIXED' },
  { row: 'P-TP-2', term: 20, kind: 'DECLARED' },
  { row: 'P-IM-4', term: 12, kind: 'MIXED' },
]
const REGISTER_TOTAL = 115
const AS_FILED_TOTAL = 103

/** §4's register — the landed SPEC text the classification is derived from. */
const SPEC_REGISTER_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-pd-vendor-foundation-mechanisms.md')

/** `A-13` ROUTE 2's label, verbatim as the spec's `§4` ROW CELLS carry it — the
 *  marker occurs EXACTLY three times in the spec and always in a register cell
 *  (`P-IM-1`'s, `P-IM-2`'s and `P-TP-2`'s), opening route 2's own heading there
 *  (`**DECLARED, NOT EXECUTED:** the \`19\` is **declared** …`). The census table
 *  (a DIFFERENT table, `| Row | Terms | Kind | Why |`) writes the label bare and
 *  back-quoted — `` `DECLARED, NOT EXECUTED` `` — and route 2's prose writes it bare
 *  too, so NEITHER can be mistaken for a register cell's label. */
const ROUTE2_LABEL_MARKER = '**DECLARED, NOT EXECUTED:'

/** The same label written UNBOLDED with its colon — the "removed from the cell"
 *  state the negative control drives. */
const ROUTE2_LABEL_MARKER_PLAIN = 'DECLARED, NOT EXECUTED:'

/**
 * ⟨REMANDED 2026-09-28⟩ CLASSIFY ONE `§4` REGISTER ROW FROM THE CELLS THE SPEC
 * ACTUALLY CARRIES — never from a constant, and never at a pinned column index or
 * character offset (the label is searched across the row's WHOLE cell list):
 *   - the row carries route 2's `DECLARED, NOT EXECUTED` label ⇒ **`DECLARED`** (its
 *     attempts term is asserted, never produced by a generator);
 *   - otherwise ⇒ **`EXECUTED`** — the row is driven against the landed tree (the
 *     census's finer `MIXED` state is NOT derivable from the register table: `MIXED`
 *     occurs in the spec only in the CENSUS table's `Kind` column, as
 *     `` `MIXED` ``, which a register row cell never carries).
 * The marker is the BOLDED cell form, so the census table's bare back-quoted Kind
 * cells (`` `DECLARED, NOT EXECUTED` ``) can never be mistaken for a register cell's
 * label, and neither can route 2's prose paragraph that names it. (The census is the
 * ONLY place `MIXED` and `EXECUTED` appear as Kind cells; no register row cell here
 * carries them in that bolded form, so this reader's non-`DECLARED` arm is the
 * register table's own "not labelled" state — `P-IM-3`, `P-SM-1`, `P-SM-2`,
 * `P-TP-1`, `P-IM-4`.)
 */
function classifyRegisterRowFromSpec(row: { id: string; cells: string[] }): 'EXECUTED' | 'DECLARED' {
  return row.cells.some((cell) => cell.includes(ROUTE2_LABEL_MARKER)) ? 'DECLARED' : 'EXECUTED'
}

/**
 * ⟨REMANDED 2026-09-28 — THE DERIVATION THIS ROW'S VERDICT RESTS ON.⟩ READ the spec's
 * **`§4` register table** out of the landed spec file and classify every one of its
 * eight rows from the row's own cells. The table is located STRUCTURALLY — by its
 * header row (`| # | Row id | …`), which is the register's and NOT the census table's
 * (`| Row | Terms | Kind | Why |`) — so the census's three labels are never read as
 * register labels. A row's cells are split on the markdown pipes, so a label may sit
 * in ANY cell at ANY offset.
 *
 * The parameter is the spec TEXT, so the negative control can drive the SAME reader
 * over a text with one cell's label removed: a classifier that would return the same
 * classification either way is the vacuity this remand forbids.
 */
function registerRowsFromSpec(specText: string): Array<{ id: string; n: string; cells: string[]; kind: 'EXECUTED' | 'DECLARED'; hasLabel: boolean }> {
  const lines = specText.split('\n')
  const headerIndex = lines.findIndex((line) => /^\|\s*#\s*\|\s*Row id\b/.test(line))
  expect(headerIndex, `RED (PD-VENDOR §4 / §3a A-13): ${SPEC_REGISTER_PATH} carries no register table header \`| # | Row id |\` — the A-13 classification is DERIVED from that table and cannot be derived from a table that is absent`).toBeGreaterThanOrEqual(0)
  const rows: Array<{ id: string; n: string; cells: string[]; kind: 'EXECUTED' | 'DECLARED'; hasLabel: boolean }> = []
  for (let i = headerIndex + 2; i < lines.length; i++) {
    const line = lines[i]!
    if (!line.startsWith('| ')) break // the table ends at the first non-row line
    // split on the pipes and drop the two EDGE empties — NO column index is pinned
    // anywhere below: the label is matched across `cells` as a whole.
    const cells = line.split('|').slice(1, -1)
    const idMatch = /\bP-(?:IM|SM|TP)-\d+\b/.exec(cells[1] ?? '')
    expect(idMatch, `RED (PD-VENDOR §4): the register row "${line.slice(0, 40)}…" carries no row id in its \`Row id\` cell — the register's rows are id-bearing (§4)`).not.toBeNull()
    const id = idMatch![0]
    const kind = classifyRegisterRowFromSpec({ id, cells })
    rows.push({ id, n: (cells[0] ?? '').trim(), cells, kind, hasLabel: cells.some((cell) => cell.includes(ROUTE2_LABEL_MARKER)) })
  }
  return rows
}

/** The LOUD reader of the spec text: an ABSENT spec is a failure naming the path —
 *  the `A-13` classification cannot be derived from a spec that is not there. */
function readSpecRegisterText(): string {
  expect(existsSync(SPEC_REGISTER_PATH), `RED (PD-VENDOR §4 / §3a A-13): the spec ${SPEC_REGISTER_PATH} does not exist — the register's per-row EXECUTED/DECLARED census is DERIVED from its §4 table, never restated`).toBe(true)
  return readFileSync(SPEC_REGISTER_PATH, 'utf8')
}

/** ⟨REMANDED 2026-09-28⟩ THE DERIVED CLASSIFICATION — read ONCE from the landed spec,
 *  then cross-checked against the register arithmetic below. `declaredOnly` is a
 *  function of THIS reading, so removing a `§4` cell's label flips it. */
const SPEC_REGISTER_ROWS = registerRowsFromSpec(readSpecRegisterText())
const SPEC_DECLARED_ONLY = SPEC_REGISTER_ROWS.filter((r) => r.kind === 'DECLARED').map((r) => r.id)

/** The three unit files this register lives in — the landed surface the census reads. */
function registerSources(): Array<{ file: string; text: string }> {
  return ['pd-vendor-set.test.ts', 'pd-vendor-drift.test.ts', 'pd-vendor-manifest.test.ts'].map((f) => {
    const file = join(REPO_ROOT, 'tests', f)
    expect(existsSync(file), `the register's landed source ${file} must exist — the census reads the LANDED artifacts`).toBe(true)
    return { file, text: readFileSync(file, 'utf8') }
  })
}

/** `⟨A-13⟩` A literal tautology: an expectation whose actual and expected are BOTH the
 *  same kind of term — a numeric literal, or a named count — and which carries NO
 *  arithmetic operator at all, so nothing about the row's DOMAIN is produced by it. A
 *  term WITH an operator (`RE_DECLARED_SHAPES.length * 2 + 2`, or `1 * 2 * 2 * 2`) is
 *  the PBT audit's separate class: a declared SHAPE, asserted rather than generated.
 *  The reader is AST-based (a regex cannot step over the three files' varied
 *  assertion messages, and a mis-parse here would UNDER-report the gap). */
function literalTautologies(text: string): Array<{ actual: string; expected: string; hasOperator: boolean }> {
  const sf = ts.createSourceFile('scan.ts', text, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  /** The register's DECLARED shape-names are printed as numbers in `§4`, so a named
   *  count is normalized to its pinned size here (`5*2+2`, never
   *  `RE_DECLARED_SHAPES.length*2+2`) — the same term, in the register's own notation. */
  const pinnedCounts: Record<string, number> = {
    PINNED_FIFTEEN: 15,
    RE_DECLARED_SHAPES: 5,
    REGISTER_ROWS: 8,
    INCLUDED_SUITES: 11,
    BASELINE_FILES: 4,
  }
  const countOf = (expr: string): number | null => {
    const m = /^([A-Z_]+)\.length$/.exec(expr)
    return m !== null && pinnedCounts[m[1]!] !== undefined ? pinnedCounts[m[1]!]! : null
  }
  /** `allPinned` — every leaf of the term is either a numeric literal or a PINNED
   *  count. A term containing an UNRESOLVED leaf (a `Set` size, a foreign symbol) is a
   *  real computation over the tree, not a term that "exists in no landed artifact",
   *  so it is excluded from this census. */
  const term = (n: ts.Node): { text: string; operator: boolean; allPinned: boolean } | null => {
    if (ts.isNumericLiteral(n)) return { text: n.getText(sf), operator: false, allPinned: true }
    if (ts.isParenthesizedExpression(n)) return term(n.expression)
    if (ts.isIdentifier(n) || ts.isPropertyAccessExpression(n)) {
      const raw = n.getText(sf).replace(/\s+/g, '')
      const pinned = countOf(raw)
      return { text: pinned !== null ? String(pinned) : raw, operator: false, allPinned: pinned !== null }
    }
    if (ts.isBinaryExpression(n)) {
      const op = n.operatorToken.kind
      if (op !== ts.SyntaxKind.AsteriskToken && op !== ts.SyntaxKind.PlusToken) return null
      const l = term(n.left)
      const r = term(n.right)
      if (l === null || r === null) return null
      return {
        text: `${l.text}${op === ts.SyntaxKind.AsteriskToken ? '*' : '+'}${r.text}`,
        operator: true,
        allPinned: l.allPinned && r.allPinned,
      }
    }
    return null
  }
  const out: Array<{ actual: string; expected: string; hasOperator: boolean }> = []
  const walk = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'toBe' && ts.isCallExpression(callee.expression)) {
        const inner = callee.expression
        if (ts.isIdentifier(inner.expression) && inner.expression.text === 'expect') {
          const actualArg = inner.arguments[0]
          const expectedArg = node.arguments[0]
          if (actualArg !== undefined && expectedArg !== undefined) {
            const a = term(actualArg)
            const e = term(expectedArg)
            if (a !== null && e !== null && a.allPinned && e.allPinned) {
              out.push({ actual: a.text, expected: e.text, hasOperator: a.operator || e.operator })
            }
          }
        }
      }
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)
  return out
}

describe('§3a A-13 — the register’s terms are classified EXECUTED vs DECLARED, and a DECLARED-only term is a loud failure', () => {
  it('⟨A-13 CORRECTION⟩ the printed arithmetic is coherent WITH ITS TERMS, and the superseded total stays visible', () => {
    const terms = REGISTER_ROWS.map((r) => r.term)
    const sum = terms.reduce((a, b) => a + b, 0)
    // printed with its terms (REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS):
    //   19 + 17 + 17 + 12 + 10 + 8 + 20 + 12 = 115   [as-filed 103 = the same eight minus P-IM-4]
    expect(
      sum,
      `the declared total is ${REGISTER_TOTAL} = 19 + 17 + 17 + 12 + 10 + 8 + 20 + 12 (terms: ${terms.join(' + ')})`,
    ).toBe(REGISTER_TOTAL)
    expect(REGISTER_ROWS.length, 'the register is FULL at its ceiling of 8 rows (§4’s amended tally)').toBe(8)
    expect(
      REGISTER_TOTAL - REGISTER_ROWS[7]!.term,
      'the as-filed total stays visible: 103 = 115 − P-IM-4’s 12 (the row ADDED by the 2026-09-28 amendment)',
    ).toBe(AS_FILED_TOTAL)
    expect(terms.every((t) => t <= 100), 'every row is ≤ 100 attempts (§4’s cap)').toBe(true)
    expect(sum, 'the total is ≤ 120 attempts (§4’s cap)').toBeLessThanOrEqual(120)
  })

  it('⟨A-13 CORRECTION⟩ the census is DERIVED from the landed sources: three terms are literal tautologies, and the DECLARED-only set is named', () => {
    const sources = registerSources()
    // the three declared SHAPES the PBT audit names, derived — never restated. (The
    // reader also reports the pure equalities it sees, which are NOT register terms:
    // they are the rows' own sanity pins, e.g. `expect(15).toBe(15)`.)
    const termSites = sources.flatMap((s) => literalTautologies(s.text))
    const tautologies = termSites.filter((t) => t.hasOperator).map((t) => `${t.actual} → ${t.expected}`)
    expect(
      tautologies.sort(),
      'exactly three register terms are declared SHAPES with no generator — `1*2*2*2` (P-TP-1), `4*2+4` (P-SM-1) and `5*2+2` (P-IM-4) — a term that is ASSERTED rather than produced (§3a `A-13`’s PBT-audit paragraph; the strings appear nowhere else in the landed register)',
    ).toEqual(['1*2*2*2 → 8', '4*2+4 → 12', '5*2+2 → 12'])
    expect(
      termSites.filter((t) => !t.hasOperator).length,
      'and the pure equalities the reader sees are the rows’ own counts, never a domain term — they are reported, not counted as shapes',
    ).toBeGreaterThan(0)
    // every register row's id is present in a landed source: the census names rows
    // that exist, so it cannot be satisfied by an invented list
    const missingIds = REGISTER_ROWS.map((r) => r.row).filter((row) => !sources.some((s) => s.text.includes(row)))
    expect(missingIds, 'every register row id must appear in a landed source — the census is over the LANDED register').toEqual([])
    // THE LOUD PART: a term whose kind is DECLARED and which no generator drives is
    // the exact artifact `A-13` says does not exist. The classification is printed
    // per row so the reading is a census, not a word.
    // ⟨REMANDED 2026-09-28⟩ `declaredOnly` is DERIVED FROM THE SPEC'S `§4` REGISTER
    // TABLE (`SPEC_DECLARED_ONLY`), never from a constant in this file: the eight
    // rows below are the register's own, classified from what their `§4` cells say.
    const declaredOnly = SPEC_DECLARED_ONLY
    const executedTerms = SPEC_REGISTER_ROWS.filter((r) => r.kind !== 'DECLARED').map((r) => REGISTER_ROWS.find((x) => x.row === r.id)!.term)
    const census = SPEC_REGISTER_ROWS.map((r) => `${r.id}=${REGISTER_ROWS.find((x) => x.row === r.id)?.term ?? '<no term in the register model>'}/${r.kind}`).join(' · ')
    // the derived classification must name the SAME eight rows the register model
    // carries — a spec table that gained, lost or renamed a row is a loud failure,
    // so this census can never be satisfied by an invented or truncated list.
    expect(
      SPEC_REGISTER_ROWS.map((r) => r.id).sort(),
      `the classification is derived from §4's table, so its row set must BE the register's ceiling of 8 rows (read: ${census})`,
    ).toEqual(REGISTER_ROWS.map((r) => r.row).sort())
    // the spec's printed per-row cells must agree with the register arithmetic this
    // file carries: each `§4` row prints its attempts term as a BOLDED number, read
    // out of the row's cells WHEREVER the author placed it (no cell index pinned).
    const specTerms = SPEC_REGISTER_ROWS.map((r) => {
      const found = r.cells.map((cell) => /\*\*([0-9]{1,3})\*\*(?![0-9])/.exec(cell)?.[1]).filter((x): x is string => x !== undefined)
      return { id: r.id, term: found.length > 0 ? Number(found[0]) : null, printedAs: found }
    })
    const specTermMismatches = specTerms
      .filter((t) => t.term === null || t.term !== REGISTER_ROWS.find((x) => x.row === t.id)!.term)
      .map((t) => `${t.id}: the §4 cells print ${t.printedAs.join('/') || '<no bolded attempts number>'} but the register model carries ${REGISTER_ROWS.find((x) => x.row === t.id)!.term}`)
    expect(
      specTermMismatches,
      `every §4 row cell must print its attempts term as a bolded number (${SPEC_REGISTER_ROWS.map((r) => `${r.id}=${REGISTER_ROWS.find((x) => x.row === r.id)!.term}`).join(', ')}) — a cell whose term is unreadable is a derivation gap`,
    ).toEqual([])
    expect(
      specTerms.map((t) => t.term).reduce((a, b) => (a ?? 0) + (b ?? 0), 0),
      `the terms READ OUT OF the spec's §4 cells sum to the register's own total — printed with its terms: ${specTerms.map((t) => t.term).join(' + ')} = ${REGISTER_TOTAL}`,
    ).toBe(REGISTER_TOTAL)
    // the reading IS the derivation: a DECLARED row must be one whose ONLY route-2
    // label is the `DECLARED, NOT EXECUTED` cell label.
    const declaredRowTerms: Record<string, number> = { 'P-IM-1': 19, 'P-IM-2': 17, 'P-TP-2': 20 }
    expect(
      declaredOnly.sort(),
      `the per-row census is ${census} — these three rows are DECLARED, NOT EXECUTED: their terms have no generator in any landed artifact, and their only landed reader is a literal tautology`,
    ).toEqual(Object.keys(declaredRowTerms).sort())
    // ⟨REMANDED 2026-09-28 — WHAT WAS REMOVED AND WHY.⟩ As filed, the row ALSO carried
    // `expect(declaredOnly).toEqual([])` — the "fail loudly until the register carries
    // the label" half. With `declaredOnly` derived from the spec's `§4` cells, that
    // assertion is now unreachable BY DESIGN: the three labels ARE present, so it can
    // never hold, and asserting it would re-create exactly the defect this remand
    // closes (an assertion no edit to the repo can satisfy). The label's PRESENCE is
    // what is under test here, and it is asserted above and falsified by the negative
    // control below — not by an assertion whose expected value is the pre-label state.
    // … AND THE OTHER FIVE ROWS MUST **NOT** CARRY THE LABEL: a register that
    // labelled every row would make the classification meaningless, and a register
    // that labelled none would make the three-row reading above unreachable. This is
    // the census's discriminating half, derived from the SAME spec cells.
    const notDeclared = SPEC_REGISTER_ROWS.filter((r) => !r.hasLabel)
    expect(
      notDeclared.map((r) => `${r.id}:${r.kind}${r.cells.some((cell) => cell.includes(ROUTE2_LABEL_MARKER)) ? ' (CARRIES the route-2 label)' : ''}`),
      `the five rows BESIDES the three must NOT carry the “DECLARED, NOT EXECUTED” cell label — their terms are driven against the landed tree (census: ${census})`,
    ).toEqual(['P-IM-3:EXECUTED', 'P-SM-1:EXECUTED', 'P-SM-2:EXECUTED', 'P-TP-1:EXECUTED', 'P-IM-4:EXECUTED'])
    expect(
      notDeclared.length,
      'the labelled set is EXACTLY three of the register’s eight rows, so the derivation is neither empty nor universal',
    ).toBe(5)
    expect(
      executedTerms.reduce((a, b) => a + b, 0),
      `the non-DECLARED half of the register totals ${executedTerms.join(' + ')} — printed so the census’s two halves are visible together`,
    ).toBe(REGISTER_TOTAL - 56)

    // ---------------------------------------------------------------------
    // ⟨A-13 CORRECTION — THE NEGATIVE CONTROL.⟩ The row must DISCRIMINATE: if the
    // label were REMOVED from a `§4` cell, this row MUST fail. The real reading is
    // asserted first (the three labelled rows, the label sitting in the row's cells),
    // then the SAME reader is driven over the spec text with each of the three cells'
    // labels removed — the exact state the row exists to catch.
    // ---------------------------------------------------------------------
    const specText = readSpecRegisterText()
    expect(
      SPEC_REGISTER_ROWS.filter((r) => r.hasLabel).map((r) => r.id).sort(),
      'the three DECLARED rows’ §4 cells carry route 2’s bolded label heading (`**DECLARED, NOT EXECUTED:**` — the marker occurs exactly three times in the spec, all three times inside a register row cell), matched across the WHOLE cell list — no column index and no character offset is pinned',
    ).toEqual(['P-IM-1', 'P-IM-2', 'P-TP-2'])
    expect(
      SPEC_DECLARED_ONLY.length,
      'the derived DECLARED-only set is NON-EMPTY in the real reading — a row that derives an empty set from a spec that carries three labels is not evidence',
    ).toBeGreaterThan(0)

    const lines = specText.split('\n')
    const headerIndex = lines.findIndex((line) => /^\|\s*#\s*\|\s*Row id\b/.test(line))
    expect(headerIndex, 'the register table header must be locatable before its cells can be mutated').toBeGreaterThanOrEqual(0)
    const controlFailures: string[] = []
    for (const id of ['P-IM-1', 'P-IM-2', 'P-TP-2']) {
      const cellLine = lines.findIndex((line) => line.startsWith('| ') && /^\|\s*\d+\s*\|\s*\*\*`P-(?:IM|SM|TP)-\d+`\*\*/.test(line) && line.includes(`\`${id}\``))
      expect(cellLine, `the §4 register cell of ${id} must be locatable in ${SPEC_REGISTER_PATH}`).toBeGreaterThan(headerIndex)
      // the mutation: the row's CELL no longer carries route 2's label (it is left in
      // place only in its plain form, so the mutation is of the register cell's label).
      const mutatedLine = lines[cellLine]!.split(ROUTE2_LABEL_MARKER).join(ROUTE2_LABEL_MARKER_PLAIN)
      expect(mutatedLine, `the control must actually CHANGE ${id}’s §4 cell (an unmutated text would make the control vacuous)`).not.toBe(lines[cellLine])
      const mutatedText = [...lines.slice(0, cellLine), mutatedLine, ...lines.slice(cellLine + 1)].join('\n')
      const mutatedClass = registerRowsFromSpec(mutatedText).filter((r) => r.kind === 'DECLARED').map((r) => r.id)
      if (mutatedClass.includes(id) || mutatedClass.length === 0) {
        controlFailures.push(`${id}: with its cell’s label removed the derivation read [${mutatedClass.join(', ')}] — the label assertions above would have held vacuously`)
      } else {
        // and this row's own assertion FLIPS on that mutated reading: it is not `[]`
        expect(
          mutatedClass,
          `with ${id}’s label removed from its §4 cell the derived set is NON-EMPTY, so \`expect(declaredOnly).toEqual([])\` cannot hold and this row FAILS — the discrimination the remand demands`,
        ).not.toEqual([])
      }
    }
    expect(
      controlFailures,
      'with the label REMOVED from ANY of the three §4 cells, the derived DECLARED-only set must be NON-EMPTY and must still name that row — else the assertions above would hold whether or not the labels exist, which is the vacuity A-13’s correction forbids',
    ).toEqual([])
    // and the same reader over the real text is clean, so the control is not merely a
    // reader that reports every row as DECLARED.
    expect(
      SPEC_DECLARED_ONLY,
      'the same reader over the UNMUTATED spec text reads exactly the three labelled rows',
    ).toEqual(['P-IM-1', 'P-IM-2', 'P-TP-2'])
  })
})

