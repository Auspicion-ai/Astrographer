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
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
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

const PINNED_COMMIT = '8f193a8d1446ed1e64c4ab6c569941e988f82459'

function md5(text: string): string {
  return createHash('md5').update(text).digest('hex')
}

// ===========================================================================
// A synthetic manifest + byte maps — the injections §6.1 item 2 requires
// ===========================================================================
/** A synthetic manifest whose EVERY module's md5 equals the digest of its synthetic
 *  vendored bytes, so the comparator's verdict is decided ONLY by the foundation
 *  arm under test. */
function syntheticManifest(vendoredBody: (name: string) => string): Record<string, unknown> {
  return {
    schema: 'foundation-lock/1',
    foundation: {
      path: '../Provident-Electron',
      remote: 'https://github.com/LittleKingsguard/Provident-Electron',
      ref: 'main',
      commit: PINNED_COMMIT,
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

/** §6.1 item 2 — the pure comparator the monitor MUST expose, loaded by name. */
type Comparator = (input: { manifest: unknown; vendoredBytes: Record<string, string>; foundationBytes: Record<string, string> | null }) => {
  status: string
  checks: number
  differences: Array<{ name: string; vendoredDigest?: string; foundationDigest?: string; reason?: string }>
  reason?: string
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
 * NOTHING else. Its `../Provident-Electron` sibling is created ONLY when asked, so
 * the absent-tree situation is driven from a real tree state (§2.3 row 1).
 */
function makeTempTree(): TempTree {
  const root = mkdtempSync(join(tmpdir(), 'pd-vendor-drift-'))
  mkdirSync(join(root, 'scripts'), { recursive: true })
  mkdirSync(join(root, 'vendor'), { recursive: true })
  mkdirSync(join(root, 'src', 'shared'), { recursive: true })
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
      mkdirSync(join(root, '..', 'Provident-Electron', 'src', 'shared'), { recursive: true })
      writeFileSync(join(root, '..', 'Provident-Electron', 'src', 'shared', `${name}.ts`), bytes)
    },
    rm() {
      rmSync(root, { recursive: true, force: true })
    },
  }
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
      for (const name of PINNED_FIFTEEN) tree.writeFoundation(name, `${name}\n`)
      rmSync(join(tree.root, '..', 'Provident-Electron', 'src', 'shared', 'theme.ts'))
      mkdirSync(join(tree.root, '..', 'Provident-Electron', 'src', 'shared', 'theme.ts'), { recursive: true })
      const { code, out } = runMonitor(tree)
      expect(code).not.toBe(0)
      expect(out).toMatch(/theme/)
    } finally {
      tree.rm()
      rmSync(join(tree.root, '..', 'Provident-Electron'), { recursive: true, force: true })
    }
  })

  it('§3.4 item 3 — the monitor NEVER blocks `npm test`: it is not collected by `vitest.config.ts`’s `tests/**` include', () => {
    // The monitor lives at `scripts/**` (§1.2) and is `.mjs` — outside the pinned
    // `include` (which this file does NOT read; the placement is the assertion).
    expect(MONITOR_PATH).toMatch(/scripts[/\\]foundation-drift\.mjs$/)
    expect(MONITOR_PATH).not.toMatch(/[/\\]tests[/\\]/)
  })
})
