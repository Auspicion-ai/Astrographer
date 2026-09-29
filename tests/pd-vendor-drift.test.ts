// tests/pd-vendor-drift.test.ts — unit `PD-VENDOR`, the `A3` CROSS-TREE DRIFT
// MONITOR and its register row `P-TP-2`.
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-pd-vendor-foundation-mechanisms.md
//     §1.1 item 3 / §2.3   the monitor's EXACT behaviour: the six-row situation
//                          table and its exit codes; the A3 wording ("when that
//                          directory is present … SKIPPED when it is absent");
//                          §2.3's two honesty rules (absent tree = SKIP, never a
//                          pass and never a failure; the monitor reads FILES and
//                          compares BYTES — `[D]`-class local instrument)
//     §3.4                 how it is wired (a NAMED script so a DONE row cites a
//                          RUN) and what it may not do (read-only, never blocks
//                          `npm test`, never a green precondition for a UI unit)
//     §6.1 item 2          "`P-TP-2`'s five situations are driven by injecting the
//                          file system answers into the monitor's own comparison
//                          function (the monitor must expose a PURE COMPARATOR
//                          taking `{ manifest, vendoredBytes, foundationBytes |
//                          null }` so the situations are drivable without touching
//                          a real tree). If the monitor is written as an
//                          un-splittable script, `P-TP-2` cannot be driven — that
//                          is the red's own finding, reported, not worked around."
//     §4 `P-TP-2`          the five declared situations × 2 drives + 10 injections =
//                          20 attempts; nothing throws an unhandled exception; no
//                          situation is silently a pass; the two discriminating
//                          controls (absent-tree ⇒ `SKIPPED` + exit `0`;
//                          `moduleCount: 14` ⇒ non-zero)
//
// LAYER (RCA-12): `[D]`-class local instrument / `[T]` node-pure. A `CLEAN` reading
// is NOT app evidence — the monitor asserts nothing about behaviour, imports, types
// or the app (§2.3 honesty rule 2).
//
// RED-FIRST (RCA-1): `scripts/foundation-drift.mjs` DOES NOT EXIST at this branch
// head. Every row therefore resolves it dynamically and asserts its EXISTENCE BY
// NAME first (→ `ENOENT: … foundation-drift.mjs`), so the red names the absent
// artifact instead of producing an unresolvable-import collection error.
//
// `G-9`/`X-9` PIN SAFETY: this file mocks nothing (never `'electron'`) and reads no
// pinned file. Its imports are `vitest` and `node:*` only. Every CLI drive runs
// against a TEMP working directory carrying only symlinks/copies, so no test can
// mutate this repo's tree (§3.4 item 2 — the monitor is read-only, and so is this
// suite's harness).

import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const MONITOR_PATH = join(REPO_ROOT, 'scripts', 'foundation-drift.mjs')

/** §2.1 item 1 — the pin's fifteen-name list (the comparator's domain). */
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

const PINNED_COMMIT = 'd7b98b574adc7fa63fbabda617eba2a753f52cb5'

function md5(text: string): string {
  return createHash('md5').update(text).digest('hex')
}

// ===========================================================================
// A synthetic manifest + byte maps — the injections §6.1 item 2 requires
// ===========================================================================
/** A synthetic manifest whose EVERY module's md5 equals the digest of its synthetic
 *  vendored bytes, so the comparator's verdict is decided ONLY by the foundation
 *  arm under test. */
function syntheticManifest(
  vendoredBody: (name: string) => string,
  opts: { foundationCommit?: string; foundationPath?: string } = {},
): Record<string, unknown> {
  return {
    schema: 'foundation-lock/1',
    foundation: {
      // `⟨A-6 CORRECTION⟩` The synthetic MANIFEST is this suite's own fixture and is
      // a TEMP-TREE artifact, so its `foundation.path` is `./foundation` — a sibling
      // INSIDE the temp root. That is what makes the suite HERMETIC: the temp-tree
      // arm writes only beneath its own root and removes only what it created
      // (§12's `A-6` correction). The REAL manifest keeps `../Provident-Electron`
      // (§2.2's normative shape), and `syntheticManifest` still ACCEPTS it.
      path: opts.foundationPath ?? './foundation',
      remote: 'https://github.com/LittleKingsguard/Provident-Electron',
      ref: 'main',
      commit: opts.foundationCommit ?? PINNED_COMMIT,
      measuredAt: '2026-09-27',
      digestCommand: 'md5sum src/shared/*.ts',
      byteIdentity: 'byte-identical to the pinned commit’s blob at `commit`',
    },
    modules: PINNED_FIFTEEN.map((name) => ({
      name,
      source: `src/shared/${name}.ts`,
      vendored: `src/shared/${name}.ts`,
      md5: md5(vendoredBody(name)),
      lineCount: 1,
      provenance: 'synthetic',
      proposalTableAgreement: 'REPRODUCED',
      excludedFromVendorSet: false,
      rowStatus: 'NONE (no wave owned yet)',
    })),
    moduleCount: 15,
  }
}

function bytesMap(body: (name: string) => string): Record<string, string> {
  return Object.fromEntries(PINNED_FIFTEEN.map((n) => [n, body(n)]))
}

/** §6.1 item 2 — the pure comparator the monitor MUST expose, loaded by name.
 *  `⟨A-3/A-5 EXTENSION⟩` The input carries the two arms the adversarial pass
 *  found MISSING: `foundationRevision` (the pin's instrument — the tree's own
 *  `rev-parse HEAD`, which the manifest's `foundation.commit` must be compared
 *  against) and `vendoredFlags` (the per-module regular-file reading, so a
 *  SYMLINKED vendored module is rejected rather than dereferenced). */
type Comparator = (input: {
  manifest: unknown
  vendoredBytes: Record<string, string>
  foundationBytes: Record<string, string> | null
  vendoredFlags?: Record<string, { symlink?: boolean }>
  foundationRevision?: string | null
}) => {
  status: string
  checks: number
  differences: Array<{ name: string; vendoredDigest?: string; foundationDigest?: string; reason?: string }>
  reason?: string
  distinctModules?: number
}

async function loadComparator(): Promise<Comparator> {
  expect(existsSync(MONITOR_PATH), `RED (PD-VENDOR §1.1 item 3 / §2.3): the A3 monitor ${MONITOR_PATH} does not exist`).toBe(true)
  const mod = (await import(/* @vite-ignore */ pathToFileURL(MONITOR_PATH).href)) as Record<string, unknown>
  const fn = (mod.compareFoundation ?? mod.compare ?? (mod.default as Record<string, unknown> | undefined)?.compareFoundation) as Comparator | undefined
  expect(
    typeof fn,
    'RED (PD-VENDOR §6.1 item 2): the monitor must expose a PURE COMPARATOR taking { manifest, vendoredBytes, foundationBytes | null } — an un-splittable script cannot drive P-TP-2 and that is the red’s own finding, reported, never worked around',
  ).toBe('function')
  return fn as Comparator
}

// ===========================================================================
// The temp-tree harness — the CLI's five situations, driven for real
// ===========================================================================
interface TempTree {
  root: string
  writeManifest(text: string): void
  writeVendored(name: string, bytes: string): void
  writeFoundation(name: string, bytes: string): void
  rm(): void
}

/**
 * A temp "repo" carrying `scripts/foundation-drift.mjs` (a copy), a
 * `node_modules` symlink so the copy's own resolution behaves identically, and
 * NOTHING else.
 *
 * `⟨A-6 CORRECTION (MED, `TEST-DEFECT`) — THE SUITE IS HERMETIC AGAIN.⟩` The
 * synthetic foundation tree lives at `<root>/foundation` — a sibling INSIDE the
 * temp root — and the synthetic manifest's `foundation.path` is `./foundation`.
 * The previous form wrote to `join(root,'..','Provident-Electron')` (a SHARED
 * GLOBAL path under `tmpdir()`) and a row's `finally` removed that path
 * recursively: a test that ran first could delete a directory it never created,
 * and two concurrent runs of this suite raced over one path. Nothing here reads
 * or removes any path the test did not itself create.
 */
function makeTempTree(): TempTree {
  const root = mkdtempSync(join(tmpdir(), 'pd-vendor-drift-'))
  mkdirSync(join(root, 'scripts'), { recursive: true })
  mkdirSync(join(root, 'vendor'), { recursive: true })
  mkdirSync(join(root, 'src', 'shared'), { recursive: true })
  // The synthetic foundation sibling lives INSIDE the root (A-6) but is created
  // ONLY when a row asks for it, so the ABSENT-tree situation is still driven from
  // a real tree state (§2.3 row 1).
  if (existsSync(MONITOR_PATH)) writeFileSync(join(root, 'scripts', 'foundation-drift.mjs'), readFileSync(MONITOR_PATH))
  try {
    symlinkSync(join(REPO_ROOT, 'node_modules'), join(root, 'node_modules'), 'dir')
  } catch {
    /* node_modules is optional for a pure-node script */
  }
  return {
    root,
    writeManifest(text) {
      writeFileSync(join(root, 'vendor', 'foundation.lock.json'), text)
    },
    writeVendored(name, bytes) {
      writeFileSync(join(root, 'src', 'shared', `${name}.ts`), bytes)
    },
    writeFoundation(name, bytes) {
      mkdirSync(join(root, 'foundation', 'src', 'shared'), { recursive: true })
      writeFileSync(join(root, 'foundation', 'src', 'shared', `${name}.ts`), bytes)
    },
    rm() {
      rmSync(root, { recursive: true, force: true })
    },
  }
}

/** `⟨A-3⟩` The synthetic foundation repository: `<root>/foundation` as a REAL git
 *  repository, so the monitor's pin arm has a revision to read. Returns its HEAD
 *  (empty when `git init` is unavailable — the row then reports the gap rather
 *  than inventing a revision). */
function initFoundationRepo(tree: TempTree): string {
  const repo = join(tree.root, 'foundation')
  const run = (args: string[]): { code: number; out: string } => {
    const r = spawnSync('git', args, { cwd: repo, encoding: 'utf8' })
    return { code: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` }
  }
  run(['init', '-q', '.'])
  run(['-c', 'user.email=pd-vendor@local', '-c', 'user.name=pd-vendor', 'add', '-A'])
  run(['-c', 'user.email=pd-vendor@local', '-c', 'user.name=pd-vendor', 'commit', '-q', '-m', 'foundation fixture'])
  const rev = run(['rev-parse', 'HEAD'])
  return rev.code === 0 ? rev.out.trim() : ''
}

/** The foundation tree's OWN revision, read the way a pin arm must read it. */
function foundationRevisionOf(tree: TempTree): string {
  const r = spawnSync('git', ['-C', join(tree.root, 'foundation'), 'rev-parse', 'HEAD'], { encoding: 'utf8' })
  return r.status === 0 ? (r.stdout ?? '').trim() : ''
}

/** Run the monitor with the temp tree as cwd and report stdout+stderr+exit code. */
function runMonitor(tree: TempTree): { code: number; out: string } {
  expect(existsSync(join(tree.root, 'scripts', 'foundation-drift.mjs')), 'RED (PD-VENDOR §2.3): the monitor script was never written').toBe(true)
  const r = spawnSync(process.execPath, ['scripts/foundation-drift.mjs'], { cwd: tree.root, encoding: 'utf8' })
  return { code: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

/** A manifest whose vendored bytes are written into the temp tree, so the ONLY
 *  variable is the situation under test. */
function seedManifest(tree: TempTree, opts: { moduleCount?: number; vendored?: (name: string) => string } = {}): void {
  const body = opts.vendored ?? ((n: string) => `${n}\n`)
  const m = syntheticManifest(body)
  if (opts.moduleCount !== undefined) m.moduleCount = opts.moduleCount
  tree.writeManifest(JSON.stringify(m, null, 2))
  for (const name of PINNED_FIFTEEN) tree.writeVendored(name, body(name))
}

// ===========================================================================
// §2.3 / §4 `P-TP-2` — the PURE comparator over the five declared situations
// ===========================================================================
describe('§4 P-TP-2 — the monitor is total over its five declared situations (strat:monitor-situations)', () => {
  it('situation 1 — foundation tree PRESENT and every module byte-equal ⇒ CLEAN', async () => {
    const compare = await loadComparator()
    const body = (n: string) => `${n}\n`
    const report = compare({ manifest: syntheticManifest(body), vendoredBytes: bytesMap(body), foundationBytes: bytesMap(body) })
    expect(report.status).toBe('CLEAN')
    expect(report.checks, 'a CLEAN reading is 15 checks (§2.3 row 2)').toBe(15)
    expect(report.differences).toEqual([])
  })

  it('situation 2 — foundation tree PRESENT and one module differs ⇒ each differing module NAMED with BOTH digests', async () => {
    const compare = await loadComparator()
    const body = (n: string) => `${n}\n`
    const foundation = { ...bytesMap(body), theme: 'theme\n// drifted upstream\n' }
    const report = compare({ manifest: syntheticManifest(body), vendoredBytes: bytesMap(body), foundationBytes: foundation })
    expect(report.status).toBe('DRIFT')
    expect(report.differences.map((d) => d.name)).toEqual(['theme'])
    const d = report.differences[0]!
    expect(d.vendoredDigest ?? d.reason, 'the differing module must be reported with BOTH digests (§2.3 row 3)').toBeTruthy()
    expect(d.foundationDigest ?? d.reason).toBeTruthy()
    expect(`${d.vendoredDigest ?? ''}${d.foundationDigest ?? ''}`.length).toBeGreaterThan(0)
  })

  it('situation 3 — foundation tree ABSENT (foundationBytes === null) ⇒ SKIPPED, 0 differences, NOT a failure', async () => {
    const compare = await loadComparator()
    const body = (n: string) => `${n}\n`
    const report = compare({ manifest: syntheticManifest(body), vendoredBytes: bytesMap(body), foundationBytes: null })
    expect(report.status, 'the absent-tree case is a SKIP, never a pass and never a failure (§2.3 row 1 + honesty rule 1)').toBe('SKIPPED')
    expect(report.differences).toEqual([])
    expect(typeof report.reason, 'a SKIPPED that prints nothing is a silent pass (ADV-VD-3): the reason is REQUIRED').toBe('string')
    expect(String(report.reason).length).toBeGreaterThan(0)
  })

  it('situation 4 — a manifest whose moduleCount ≠ 15 ⇒ FAIL (loud, never a silent skip)', async () => {
    const compare = await loadComparator()
    const body = (n: string) => `${n}\n`
    const bad = syntheticManifest(body)
    bad.moduleCount = 14
    const report = compare({ manifest: bad, vendoredBytes: bytesMap(body), foundationBytes: null })
    expect(report.status).toBe('FAIL')
  })

  it('situation 5 — a vendored module MISSING from src/shared/ ⇒ FAIL, and the missing path is NAMED', async () => {
    const compare = await loadComparator()
    const body = (n: string) => `${n}\n`
    const partial = bytesMap(body)
    delete partial.theme
    const report = compare({ manifest: syntheticManifest(body), vendoredBytes: partial, foundationBytes: null })
    expect(report.status).toBe('FAIL')
    const named = report.differences.map((d) => d.name).join(' ')
    expect(named, 'a missing vendored module must be NAMED (§2.3 row 5 — a loud failure naming the path)').toContain('theme')
  })

  it('P-TP-2 — the 5 declared situations × 2 drives + 10 injections = 20 attempts; NOTHING throws an unhandled exception', async () => {
    const compare = await loadComparator()
    const body = (n: string) => `${n}\n`
    const base = syntheticManifest(body)
    const injections: Array<{ manifest: unknown; vendoredBytes: Record<string, string>; foundationBytes: Record<string, string> | null }> = []
    for (let i = 0; i < 2; i++) {
      injections.push({ manifest: base, vendoredBytes: bytesMap(body), foundationBytes: bytesMap(body) })
      injections.push({ manifest: base, vendoredBytes: bytesMap(body), foundationBytes: { ...bytesMap(body), theme: `drift-${i}` } })
      injections.push({ manifest: base, vendoredBytes: bytesMap(body), foundationBytes: null })
      injections.push({ manifest: { ...base, moduleCount: 14 }, vendoredBytes: bytesMap(body), foundationBytes: null })
      injections.push({ manifest: base, vendoredBytes: Object.fromEntries(Object.entries(bytesMap(body)).filter(([k]) => k !== 'theme')), foundationBytes: null })
    }
    const thrown: string[] = []
    const noStatus: number[] = []
    injections.forEach((inj, i) => {
      try {
        const r = compare(inj)
        if (typeof r?.status !== 'string' || r.status === '') noStatus.push(i)
      } catch (e) {
        thrown.push(`injection ${i}: ${String(e)}`)
      }
    })
    expect(thrown, 'no situation may throw an unhandled exception (§4 P-TP-2)').toEqual([])
    expect(noStatus, 'no situation may be silently status-less (a silent pass)').toEqual([])
    expect(injections.length).toBe(10)
  })

  it('P-TP-2 CONTROL — the absent-tree control prints SKIPPED, and a `moduleCount: 14` control does NOT (discriminating)', async () => {
    const compare = await loadComparator()
    const body = (n: string) => `${n}\n`
    const absent = compare({ manifest: syntheticManifest(body), vendoredBytes: bytesMap(body), foundationBytes: null })
    const bad = { ...syntheticManifest(body), moduleCount: 14 }
    const badReport = compare({ manifest: bad, vendoredBytes: bytesMap(body), foundationBytes: null })
    expect(absent.status, 'the control’s expected outcome is the OPPOSITE of the FAIL arm').toBe('SKIPPED')
    expect(badReport.status, 'a moduleCount of 14 MUST NOT be a SKIPPED').not.toBe('SKIPPED')
    expect(badReport.status).toBe('FAIL')
  })
})

// ===========================================================================
// §3a `A-3` — THE PIN IS AN INSTRUMENT, NOT A RECORD (HOST-FIX; RED at HEAD)
// §3a `A-4` — THE MANIFEST ARM CHECKS NAMES, NOT COUNTS (HOST-FIX; RED at HEAD)
// §3a `A-5` — A SYMLINKED VENDORED MODULE IS REJECTED (HOST-FIX; RED at HEAD)
//
// EVERY ROW IN THIS BLOCK IS EXPECTED **RED** AT THIS HEAD AND IS THE POINT OF
// THE REMAND: each one forces the least host change that makes the finding's
// probe fail loudly (`§3a`'s dispositions are `HOST-FIX`; `§3b`'s `owner` column
// is `IMPLEMENTER`). NONE of them is softened to pass.
// ===========================================================================
describe('§3a A-3/A-4/A-5 — the monitor: the pin arm, the name set, the regular-file arm (HOST-FIX regression rows; RED at HEAD by design)', () => {
  it('⟨A-3 CORRECTION⟩ the pin arm reads the tree’s REVISION: EQUAL BYTES at a DIFFERENT commit are NOT the pinned state (the strongest false-green §3a records)', async () => {
    const compare = await loadComparator()
    const body = (n: string) => `${n}\n`
    const bytes = bytesMap(body)
    // the synthetic foundation tree's OWN revision, and a DIFFERENT commit recorded
    // as the pin. `§3a` `A-3`: a foundation tree at a different commit with equal
    // bytes reads CLEAN today, because nothing ever compares the revision.
    const treeRevision = '1'.repeat(40)
    const differentPinnedCommit = '2'.repeat(40)
    const report = compare({
      manifest: syntheticManifest(body, { foundationCommit: differentPinnedCommit }),
      vendoredBytes: bytes,
      foundationBytes: bytes, // EQUAL BYTES
      vendoredFlags: Object.fromEntries(PINNED_FIFTEEN.map((n) => [n, { symlink: false }])),
      foundationRevision: treeRevision, // …AT A DIFFERENT COMMIT
    })
    expect(
      report.status,
      'the report MUST distinguish "the adjacent tree is at the pinned commit" from "a tree is present with equal bytes at a different commit" (§3a `A-3` `HOST-FIX`: a read-only `git -C <foundation> rev-parse HEAD` equality check against the manifest’s `foundation.commit`, or a `git -C <foundation> show <commit>:src/shared/<x>.ts` blob arm). Today this reads CLEAN — the exact false-green §3a’s "strongest false-green" paragraph constructs',
    ).not.toBe('CLEAN')
    expect(
      `${report.reason ?? ''} ${report.differences.map((d) => d.reason ?? '').join(' ')}`,
      'the reading must SAY that the bytes are equal but the tree is not at the pinned commit — a bare non-CLEAN word does not distinguish the two states (§3a `A-3`; §2.3’s rule that a `SKIPPED` reading proves nothing about the pin applies to a byte-equal non-pinned tree too)',
    ).toMatch(/revision|commit|pin/i)
  })

  it('⟨A-3 CORRECTION⟩ the manifest’s `foundation.commit` is CONSUMED: the monitor’s source reads it, and the CLEAN path requires the tree to equal it', async () => {
    const compare = await loadComparator()
    expect(existsSync(MONITOR_PATH), `RED (PD-VENDOR §2.3): the A3 monitor ${MONITOR_PATH} does not exist`).toBe(true)
    const monitorSrc = readFileSync(MONITOR_PATH, 'utf8')
    expect(
      /foundation\.commit|foundationCommit|pinnedCommit|PinnedCommit/.test(monitorSrc),
      'the monitor must READ `manifest.foundation.commit` — §3a `A-3`: "nothing in the repo ever checks the pinned commit"; the sole commit read is a tautology when the tree is absent. A manifest key no instrument consumes is a RECORD, not a pin',
    ).toBe(true)
    // the discriminating pair: at the PINNED revision the byte-equal tree is CLEAN …
    const body = (n: string) => `${n}\n`
    const bytes = bytesMap(body)
    const pinnedRevision = 'a'.repeat(40)
    const atPin = compare({
      manifest: syntheticManifest(body, { foundationCommit: pinnedRevision }),
      vendoredBytes: bytes,
      foundationBytes: bytes,
      vendoredFlags: Object.fromEntries(PINNED_FIFTEEN.map((n) => [n, { symlink: false }])),
      foundationRevision: pinnedRevision,
    })
    expect(atPin.status, 'at the PINNED revision with equal bytes the reading is CLEAN (§2.3 row 2) — the pin arm must not break the declared situation').toBe('CLEAN')
    // … and the SAME bytes at another revision are NOT (the row above); this pair is
    // what makes the arm an instrument rather than a wording (§3a `A-3`).
    const offPin = compare({
      manifest: syntheticManifest(body, { foundationCommit: pinnedRevision }),
      vendoredBytes: bytes,
      foundationBytes: bytes,
      vendoredFlags: Object.fromEntries(PINNED_FIFTEEN.map((n) => [n, { symlink: false }])),
      foundationRevision: 'b'.repeat(40),
    })
    expect(offPin.status, 'the SAME bytes at a DIFFERENT revision must NOT read CLEAN — the pair is the falsifiable content of the pin arm (§3a `A-3`)').not.toBe('CLEAN')
  })

  it('⟨A-4 CORRECTION⟩ the manifest arm checks the NAMES: fifteen DUPLICATE entries are a set violation, never CLEAN (counts are not the assertion)', async () => {
    const compare = await loadComparator()
    const body = (n: string) => `${n}\n`
    // `§3a` `A-4`’s exact false-green: fifteen entries that are the SAME module
    // fifteen times. `moduleCount === 15` and `modules.length === 15` both hold, so
    // the count arm passes while FOURTEEN modules are never compared.
    const duplicated: Record<string, unknown> = {
      ...syntheticManifest(body),
      modules: Array.from({ length: 15 }, () => ({
        name: 'census',
        source: 'src/shared/census.ts',
        vendored: 'src/shared/census.ts',
        md5: md5('census\n'),
        lineCount: 1,
        provenance: 'synthetic',
        proposalTableAgreement: 'REPRODUCED',
        excludedFromVendorSet: false,
        rowStatus: 'NONE (no wave owned yet)',
      })),
      moduleCount: 15,
    }
    const report = compare({ manifest: duplicated, vendoredBytes: bytesMap(body), foundationBytes: bytesMap(body) })
    expect(
      report.status,
      'fifteen duplicate entries pass the COUNT arm (15 === 15) while fourteen modules are never compared — the declared name set must be SET-EQUAL to the pin’s fifteen (§3a `A-4` `HOST-FIX`). Today this reads CLEAN, which is §3a’s quoted false-green',
    ).not.toBe('CLEAN')
    expect(
      report.distinctModules,
      'the reading must report a DISTINCT-FILE count, not an entry count: fifteen entries naming ONE module is 1 compared file, never 15 (§3a `A-4`: "report distinct-file counts, not entry counts")',
    ).toBe(1)
  })

  it('⟨A-5 CORRECTION⟩ a SYMLINKED vendored module is REJECTED — byte-identity is satisfied by a symlink today, and a symlink is not "copied in as source"', async () => {
    const compare = await loadComparator()
    const body = (n: string) => `${n}\n`
    const bytes = bytesMap(body)
    // the SYMLINKED module’s bytes are IDENTICAL — that is exactly why every read
    // (`existsSync` + `readFileSync`) stays green while the fork stops being
    // standalone (`R-1`: "copied in as source").
    const flags = Object.fromEntries(PINNED_FIFTEEN.map((n) => [n, { symlink: n === 'theme' }]))
    const report = compare({ manifest: syntheticManifest(body), vendoredBytes: bytes, foundationBytes: bytes, vendoredFlags: flags })
    expect(
      report.status,
      'a symlinked vendored module MUST be rejected as NOT "copied in as source" — a per-module `lstat(...).isSymbolicLink() === false` reading in the monitor’s LOCAL arm (§3a `A-5` `HOST-FIX`). Today byte-identity is satisfied by the symlink and every row stays green',
    ).not.toBe('CLEAN')
    const named = report.differences.map((d) => d.name).join(' ')
    expect(named, 'the symlinked module must be NAMED in the report (§2.3’s naming discipline)').toContain('theme')
  })

  it('⟨A-5 CORRECTION⟩ the regular-file arm is an EXPORTED, DISCRIMINATING oracle (the monitor’s own `lstat` rule, driven on a real symlink and a real file)', async () => {
    expect(existsSync(MONITOR_PATH), `RED (PD-VENDOR §2.3): the A3 monitor ${MONITOR_PATH} does not exist`).toBe(true)
    const mod = (await import(/* @vite-ignore */ pathToFileURL(MONITOR_PATH).href)) as Record<string, unknown>
    const oracle = (mod.isRegularFile ?? (mod.default as Record<string, unknown> | undefined)?.isRegularFile) as
      | ((path: string) => boolean)
      | undefined
    expect(
      typeof oracle,
      'RED (PD-VENDOR §3a `A-5`): the monitor must EXPORT its regular-file oracle (`isRegularFile(path)`) so the local arm’s rule is a driven function and not a wording. Without it, nothing in the repo asserts `!lstat(p).isSymbolicLink()` for the fifteen modules',
    ).toBe('function')
    const dir = mkdtempSync(join(tmpdir(), 'pd-vendor-regular-file-'))
    try {
      const real = join(dir, 'real.ts')
      const link = join(dir, 'link.ts')
      writeFileSync(real, 'theme\n')
      symlinkSync(real, link)
      expect(lstatSync(real).isSymbolicLink(), 'the fixture’s control file must NOT be a symlink').toBe(false)
      expect(lstatSync(link).isSymbolicLink(), 'the fixture’s symlink must be a symlink (the control discriminates)').toBe(true)
      expect(oracle!(real), 'a REGULAR vendored file passes the arm').toBe(true)
      expect(
        oracle!(link),
        'a SYMLINKED vendored module FAILS the arm — `readFileSync` dereferences, which is exactly why the byte rows cannot see it (§3a `A-5`)',
      ).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// §3a `A-3` (CLI arm) / `A-6` — the monitor driven against a REAL temp tree
// ===========================================================================
describe('PD-VENDOR §3a A-3 — the A3 monitor CLI: the pin arm driven from a real temp repository', () => {
  it('⟨A-3 CORRECTION⟩ a real foundation tree at a DIFFERENT commit with EQUAL BYTES does NOT read CLEAN', () => {
    const tree = makeTempTree()
    try {
      seedManifest(tree)
      for (const name of PINNED_FIFTEEN) tree.writeFoundation(name, `${name}\n`)
      const treeRevision = initFoundationRepo(tree)
      expect(treeRevision, 'the temp foundation repository must carry a revision, else this row cannot drive the pin arm').not.toBe('')
      expect(treeRevision, 'the fixture revision must be exactly 40 lowercase hex, as `foundation.commit` requires (§2.2)').toMatch(/^[0-9a-f]{40}$/)
      expect(treeRevision, 'the fixture’s revision must DIFFER from the pinned commit it records — equal bytes, a different commit, which is §3a’s false-green construction').not.toBe(PINNED_COMMIT)
      // the manifest records the PIN, not the tree’s revision
      tree.writeManifest(JSON.stringify(syntheticManifest((n) => `${n}\n`, { foundationCommit: PINNED_COMMIT }), null, 2))
      const { code, out } = runMonitor(tree)
      expect(
        code,
        'a tree at the pinned commit EQUAL-BYTES-WISE but not at the pinned commit is NOT the pinned state: the monitor must read the tree’s revision and refuse (§3a `A-3` `HOST-FIX`). Today this prints CLEAN with exit 0',
      ).not.toBe(0)
      expect(
        out,
        'the reading must distinguish "the adjacent tree is at the pinned commit" from "a tree is present with equal bytes at a different commit" (§3a `A-3`)',
      ).toMatch(/revision|commit|pin/i)
      expect(out, 'the equal-bytes fact must still be stated — the two faults are different and both are reported (§2.3 row 3’s discipline)').toMatch(/byte|CLEAN/i)
    } finally {
      tree.rm()
    }
  })

  it('⟨A-3 CORRECTION⟩ the declared CLEAN situation still reads CLEAN: the tree IS at the manifest’s pinned commit (the pin arm must not break §2.3 row 2)', () => {
    const tree = makeTempTree()
    try {
      seedManifest(tree)
      for (const name of PINNED_FIFTEEN) tree.writeFoundation(name, `${name}\n`)
      const treeRevision = initFoundationRepo(tree)
      expect(treeRevision).toMatch(/^[0-9a-f]{40}$/)
      // the manifest records THE TREE’S OWN revision — the pinned state
      tree.writeManifest(JSON.stringify(syntheticManifest((n) => `${n}\n`, { foundationCommit: treeRevision }), null, 2))
      expect(foundationRevisionOf(tree), 'the revision the monitor must read is the tree’s own HEAD').toBe(treeRevision)
      const { code, out } = runMonitor(tree)
      expect(out, 'the CLEAN reading carries its check count (§2.3 row 2)').toMatch(/15\s*checks/)
      expect(out).toMatch(/CLEAN/)
      expect(code, 'a tree at the pinned commit with equal bytes is the declared CLEAN situation — exit 0').toBe(0)
    } finally {
      tree.rm()
    }
  })

  it('⟨A-4 CORRECTION⟩ fifteen DUPLICATE manifest entries are a loud failure NAMING the set violation, never CLEAN', () => {
    const tree = makeTempTree()
    try {
      // a manifest whose fifteen entries all name ONE module; the vendored tree
      // carries all fifteen files, so every file read succeeds and only the NAME
      // SET can catch it (§3a `A-4`).
      const body = (n: string) => `${n}\n`
      for (const name of PINNED_FIFTEEN) tree.writeVendored(name, body(name))
      const duplicated = {
        ...syntheticManifest(body),
        modules: Array.from({ length: 15 }, () => ({
          name: 'census',
          source: 'src/shared/census.ts',
          vendored: 'src/shared/census.ts',
          md5: md5(body('census')),
          lineCount: 1,
          provenance: 'synthetic',
          proposalTableAgreement: 'REPRODUCED',
          excludedFromVendorSet: false,
          rowStatus: 'NONE (no wave owned yet)',
        })),
        moduleCount: 15,
      }
      tree.writeManifest(JSON.stringify(duplicated, null, 2))
      const { code, out } = runMonitor(tree)
      expect(
        code,
        'the monitor’s manifest arm must assert the declared name set is SET-EQUAL to the pin’s fifteen — fifteen duplicate entries print CLEAN today while fourteen modules are never compared (§3a `A-4` `HOST-FIX`)',
      ).not.toBe(0)
      expect(out, 'the failure must NAME the set violation (§2.3 row 4: a loud failure, never a silent skip)').toMatch(/name|set|census|duplicate|distinct/i)
      expect(out, 'a name-set violation must never print CLEAN').not.toMatch(/— CLEAN/)
    } finally {
      tree.rm()
    }
  })

  it('⟨A-5 CORRECTION⟩ a SYMLINKED vendored module is rejected by the monitor’s LOCAL arm', () => {
    const tree = makeTempTree()
    try {
      seedManifest(tree)
      // `theme.ts` is a symlink to bytes that are IDENTICAL — the byte rows cannot see it
      mkdirSync(join(tree.root, 'foundation', 'src', 'shared'), { recursive: true })
      const target = join(tree.root, 'foundation', 'src', 'shared', 'theme.ts')
      writeFileSync(target, 'theme\n')
      const vendoredTheme = join(tree.root, 'src', 'shared', 'theme.ts')
      rmSync(vendoredTheme)
      symlinkSync(target, vendoredTheme)
      expect(lstatSync(vendoredTheme).isSymbolicLink(), 'the fixture must really be a symlink (the control discriminates)').toBe(true)
      expect(readFileSync(vendoredTheme, 'utf8'), 'and its bytes must be the pinned ones — which is why the byte arm stays green today').toBe('theme\n')
      const { code, out } = runMonitor(tree)
      expect(
        code,
        'a vendored module that is a SYMLINK is not "copied in as source" (R-1) and must fail the local arm (§3a `A-5` `HOST-FIX`)',
      ).not.toBe(0)
      expect(out, 'the symlinked path must be NAMED').toMatch(/theme/)
      expect(out, 'the reading must say the fault is a SYMLINK rather than a digest mismatch — otherwise the report cannot distinguish the two faults').toMatch(/symlink|symbolic|regular file/i)
    } finally {
      tree.rm()
    }
  })
})
// ===========================================================================
// §2.3 — the CLI's exit-code contract, driven from a REAL temp tree
// ===========================================================================
describe('PD-VENDOR §2.3 — the A3 monitor CLI: the six situations and their exit codes', () => {
  it('§2.3 row 1 — foundation tree ABSENT ⇒ `SKIPPED` printed with its reason, exit 0, NOT a failure', () => {
    const tree = makeTempTree()
    try {
      seedManifest(tree)
      const { code, out } = runMonitor(tree)
      expect(out, 'the monitor must PRINT the SKIPPED reading with its reason (§2.3 row 1)').toMatch(/SKIPPED/)
      expect(out, 'a bare SKIPPED with no reason is a silent pass (ADV-VD-3)').toMatch(/SKIPPED[^\n]*[.:-]\s*\S/)
      expect(code, 'the absent-tree case is NOT a failure — exit 0 (§2.3 row 1)').toBe(0)
    } finally {
      tree.rm()
    }
  })

  it('§2.3 row 2 — foundation tree present, every module byte-equal ⇒ the CLEAN reading, exit 0', () => {
    const tree = makeTempTree()
    try {
      seedManifest(tree)
      for (const name of PINNED_FIFTEEN) tree.writeFoundation(name, `${name}\n`)
      const { code, out } = runMonitor(tree)
      expect(out).toMatch(/CLEAN/)
      expect(out, 'the CLEAN reading carries its check count (§2.3 row 2)').toMatch(/15\s*checks/)
      expect(code).toBe(0)
    } finally {
      tree.rm()
    }
  })

  it('§2.3 row 3 — foundation tree present, one module differs ⇒ the module named with both digests, NON-ZERO exit', () => {
    const tree = makeTempTree()
    try {
      seedManifest(tree)
      for (const name of PINNED_FIFTEEN) tree.writeFoundation(name, `${name}\n`)
      tree.writeFoundation('theme', 'theme\n// drifted upstream\n')
      const { code, out } = runMonitor(tree)
      expect(out, 'the differing module must be NAMED').toMatch(/theme/)
      expect(code, 'drift is a non-zero exit (§2.3 row 3)').not.toBe(0)
    } finally {
      tree.rm()
    }
  })

  it('§2.3 row 4 — manifest MISSING ⇒ a loud failure naming the manifest path, NON-ZERO exit (never a silent skip)', () => {
    const tree = makeTempTree()
    try {
      const { code, out } = runMonitor(tree)
      expect(code, 'a missing manifest is a failure, never a skip (§2.3 row 4)').not.toBe(0)
      expect(out).toMatch(/foundation\.lock\.json/)
      expect(out, 'a missing manifest must never print SKIPPED').not.toMatch(/SKIPPED/)
    } finally {
      tree.rm()
    }
  })

  it('§2.3 row 4 — manifest UNPARSABLE ⇒ a loud failure, NON-ZERO exit', () => {
    const tree = makeTempTree()
    try {
      tree.writeManifest('{ this is not json')
      const { code, out } = runMonitor(tree)
      expect(code).not.toBe(0)
      expect(out).toMatch(/foundation\.lock\.json|pars|json/i)
    } finally {
      tree.rm()
    }
  })

  it('§2.3 row 4 — `moduleCount ≠ 15` ⇒ a loud failure naming the manifest, NON-ZERO exit', () => {
    const tree = makeTempTree()
    try {
      seedManifest(tree, { moduleCount: 14 })
      const { code, out } = runMonitor(tree)
      expect(code, 'moduleCount ≠ 15 is a loud failure (§2.3 row 4)').not.toBe(0)
      expect(out).toMatch(/moduleCount|14|15/)
    } finally {
      tree.rm()
    }
  })

  it('§2.3 row 5 — a vendored module MISSING from src/shared/ ⇒ a loud failure NAMING the missing path, NON-ZERO exit', () => {
    const tree = makeTempTree()
    try {
      seedManifest(tree)
      rmSync(join(tree.root, 'src', 'shared', 'theme.ts'))
      const { code, out } = runMonitor(tree)
      expect(code).not.toBe(0)
      expect(out, 'the missing vendored path must be NAMED').toMatch(/theme\.ts/)
    } finally {
      tree.rm()
    }
  })

  it('§2.3 row 6 — the foundation file present but UNREADABLE ⇒ a loud failure naming the path and the error, NON-ZERO exit', () => {
    const tree = makeTempTree()
    try {
      seedManifest(tree)
      // A directory where a file is expected is readable-as-a-path but unreadable
      // as bytes (EISDIR) — the arm §2.3 row 6 declares.
      // `⟨A-6 CORRECTION⟩` the synthetic foundation now lives INSIDE the temp root,
      // so removing the ROOT removes it; this row may never `rm` a path it did not
      // create (the previous form removed `join(root,'..','Provident-Electron')`).
      for (const name of PINNED_FIFTEEN) tree.writeFoundation(name, `${name}\n`)
      rmSync(join(tree.root, 'foundation', 'src', 'shared', 'theme.ts'))
      mkdirSync(join(tree.root, 'foundation', 'src', 'shared', 'theme.ts'), { recursive: true })
      const { code, out } = runMonitor(tree)
      expect(code).not.toBe(0)
      expect(out).toMatch(/theme/)
    } finally {
      tree.rm()
    }
  })

  it('§3.4 item 3 — the monitor NEVER blocks `npm test`: it is not collected by `vitest.config.ts`’s `tests/**` include', () => {
    // The monitor lives at `scripts/**` (§1.2) and is `.mjs` — outside the pinned
    // `include` (which this file does NOT read; the placement is the assertion).
    expect(MONITOR_PATH).toMatch(/scripts[/\\]foundation-drift\.mjs$/)
    expect(MONITOR_PATH).not.toMatch(/[/\\]tests[/\\]/)
  })
})
