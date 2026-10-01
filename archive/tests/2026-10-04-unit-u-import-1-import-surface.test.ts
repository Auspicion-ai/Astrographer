// tests/unit-u-import-1-import-surface.test.ts — Unit U-IMPORT-1 (File →
// Import… FS/browse surface, docs/specs/unit-u-import-1-import-surface.md).
//
// This is the TestWriter RED set. It never touches src/.
//
// RED CONTRACT:
//   - `src/main/import-directory.ts` does NOT exist yet → the dynamic import is
//     caught in `beforeAll` and the pure-core tests fail with
//     "does not exist" (method-does-not-exist suite RED).
//   - `app-menu.ts` / `main.ts` / `types.ts` do NOT yet carry the
//     `openImportFolder` seam / `buildImportDialogOptions(platform)` call /
//     `resolveImportSelection(` call / `importMarkdownCorpus(` call /
//     `IPC_IMPORT_RESULT` channel → every §2.8/§3b assertion is RED.
//
// STATE MACHINE (enumerated from the spec §3/§4/§5.7):
//   Expand states — missing-dir / non-directory(file) / '' / undefined
//   (⇒ not-a-directory, path echoes dir else ''); empty-dir (⇒ ok files:[]);
//   single-file; multi-file (case-insensitive ext); dot-entry-skipped;
//   symlink-skipped; non-md-dropped; nested-excluded (non-recursive);
//   codepoint-sorted; cap-exceeded (count===N>cap) / exactly-max (ok).
//   Resolve states — null / undefined / non-array / empty / non-string-or-''
//   elements / non-md-only (⇒ no-markdown-files); file-included; dir-expanded;
//   mixed file+dir (dedupe + codepoint-sort + directories:count);
//   dir-cap-exceeded poisons WHOLE (⇒ cap-exceeded); mixed-array rule-7
//   whole-poison (⇒ no-markdown-files). Dialog states — darwin (combined) /
//   non-darwin (multi-file), unknown/undefined/null/42 ⇒ non-darwin; filters
//   always md/markdown. Wiring states — win/linux two-item, darwin single.

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { mkdtempSync, writeFileSync, mkdirSync, symlinkSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { buildMenuTemplate, type AppMenuActions } from '../src/main/app-menu.js'

// ===========================================================================
// the PURE core — dynamically loaded + CONTAINED so a suite-load failure on the
// missing `import-directory.ts` does not hide the §2.8/§3b source-pin reds.
// ===========================================================================

/** The pinned §2.1 surface (from the spec verbatim). */
interface ImportDirectoryModule {
  MAX_IMPORT_FILES: number
  expandImportDirectory(dir: unknown, options?: { max?: unknown }): ImportDirectoryOutcome
  buildImportDialogOptions(platform?: unknown): ImportDialogOptions
  resolveImportSelection(paths: unknown, options?: { max?: unknown }): ImportSelectionResolution
}
interface ImportDirectoryOutcome {
  ok: boolean
  files?: string[]
  reason?: 'not-a-directory' | 'cap-exceeded'
  path?: string
  cap?: number
  count?: number
}
interface ImportDialogOptions {
  properties: ReadonlyArray<'openFile' | 'multiSelections' | 'openDirectory'>
  filters: ReadonlyArray<{ name: string; extensions: readonly string[] }>
}
interface ImportSelectionResolution {
  ok: boolean
  files?: string[]
  directories?: number
  reason?: 'no-markdown-files' | 'cap-exceeded'
  cap?: number
}

let core: ImportDirectoryModule | null = null

beforeAll(async () => {
  try {
    core = (await import('../src/main/import-directory.js')) as ImportDirectoryModule
  } catch {
    core = null
  }
})

/** RED-first guard: fail with a clear "method does not exist" message. */
function must(): ImportDirectoryModule {
  if (!core) throw new Error('RED: src/main/import-directory.ts does not exist (method does not exist)')
  return core
}

// ===========================================================================
// the temp-dir fixture harness (real Node fs readdir/lstat — node-testable)
// ===========================================================================

let tmpRoot: string

beforeAll(() => {
  tmpRoot = mkdtempSync(join(tmpdir(), 'uimport-root-'))
})
afterAll(() => {
  rmSync(tmpRoot, { recursive: true, force: true })
})

function writeFile(p: string): string {
  const d = dirname(p)
  if (!existsSync(d)) mkdirSync(d, { recursive: true })
  writeFileSync(p, '# x\n', 'utf8')
  return p
}

// ---- deterministic seeded PRNG (mulberry32) + the stop-after-5 helper ----

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function attemptBudget(seed: number, attempts: number): number[] {
  const rng = mulberry32(seed)
  return Array.from({ length: attempts }, () => Math.floor(rng() * 1e9))
}

// ===========================================================================
// §3a.1/§3a.2/§3a.3/§3a.4 — the pure node-testable core (expand / resolve)
//   States: single-file, multi-file (case-insensitive), directory-expanded
//   top-level-only, mixed file+directory aggregate.
// ===========================================================================

describe('U-IMPORT-1 §3a · expandImportDirectory valid states', () => {
  it('expands a single top-level .md file (+ the .markdown alias)', () => {
    const dir = join(tmpRoot, 'single')
    mkdirSync(dir, { recursive: true })
    writeFile(join(dir, 'a.md'))
    const out = must().expandImportDirectory(dir)
    expect(out).toEqual({ ok: true, files: [join(dir, 'a.md')] })
  })

  it('expands .md AND .markdown, case-insensitively, codepoint-sorted', () => {
    const dir = join(tmpRoot, 'multi')
    mkdirSync(dir, { recursive: true })
    // deliberate on-disk order ≠ codepoint order — determinism must win.
    writeFile(join(dir, 'b.MD'))
    writeFile(join(dir, 'a.markdown'))
    writeFile(join(dir, 'c.mD'))
    writeFile(join(dir, '0.skip.txt'))
    const out = must().expandImportDirectory(dir)
    expect(out.ok).toBe(true)
    expect(out.files).toEqual([
      join(dir, 'a.markdown'),
      join(dir, 'b.MD'),
      join(dir, 'c.mD'),
    ])
  })

  it('is non-recursive (top-level only) — a nested sub/c.md is EXCLUDED', () => {
    const dir = join(tmpRoot, 'nested')
    mkdirSync(dir, { recursive: true })
    writeFile(join(dir, 'a.md'))
    writeFile(join(dir, 'b.markdown'))
    writeFile(join(dir, 'sub', 'c.md'))
    const out = must().expandImportDirectory(dir)
    expect(out.ok).toBe(true)
    expect(out.files).toEqual([join(dir, 'a.md'), join(dir, 'b.markdown')])
  })
})

describe('U-IMPORT-1 §3a · resolveImportSelection valid states', () => {
  it('single-file selection → { ok:true, files:[p], directories:0 }', () => {
    const a = writeFile(join(tmpRoot, 'r1', 'a.md'))
    const out = must().resolveImportSelection([a])
    expect(out).toEqual({ ok: true, files: [a], directories: 0 })
  })

  it('multi-file selection → one deduped codepoint-sorted list (case-insensitive ext)', () => {
    const b = writeFile(join(tmpRoot, 'r2', 'b.MD'))
    const a = writeFile(join(tmpRoot, 'r2', 'a.markdown'))
    const out = must().resolveImportSelection([b, a])
    expect(out.ok).toBe(true)
    expect(out.files).toEqual([a, b])
    expect(out.directories).toBe(0)
  })

  it('a directory selection expands top-level md only (non-recursive)', () => {
    const dir = join(tmpRoot, 'r3')
    mkdirSync(dir, { recursive: true })
    writeFile(join(dir, 'a.md'))
    writeFile(join(dir, 'b.markdown'))
    writeFile(join(dir, 'sub', 'c.md'))
    const out = must().resolveImportSelection([dir])
    expect(out.ok).toBe(true)
    expect(out.files).toEqual([join(dir, 'a.md'), join(dir, 'b.markdown')])
    expect(out.directories).toBe(1)
  })

  it('mixed file+directory aggregate is deduped + codepoint-sorted; directories:1', () => {
    const dir = join(tmpRoot, 'r4')
    mkdirSync(dir, { recursive: true })
    const dY = writeFile(join(dir, 'y.md'))
    const dZ = writeFile(join(dir, 'z.markdown'))
    const xFile = writeFile(join(dir, 'x.md'))
    const mFile = writeFile(join(dir, 'm.md'))
    // dedupe: pass the dir twice + the explicit file the dir also contains. Per §2.1 resolve
    // rule 1 the dir expands to ALL its top-level md files, so all four survive, deduped + sorted.
    const out = must().resolveImportSelection([dir, dir, join(dir, 'y.md')])
    expect(out.ok).toBe(true)
    expect(out.files).toEqual([mFile, xFile, dY, dZ].sort()) // m.md, x.md, y.md, z.markdown
    expect(out.directories).toBe(1)
  })
})

// ===========================================================================
// §3a.5 + §2.1/P-IM-2 + F14 — buildImportDialogOptions platform shapes
// ===========================================================================

describe('U-IMPORT-1 §3a.5 · buildImportDialogOptions platform shapes', () => {
  it('darwin ⇒ combined file+dir in one dialog', () => {
    const out = must().buildImportDialogOptions('darwin')
    expect(out.properties).toEqual(['openFile', 'multiSelections', 'openDirectory'])
    expect(out.filters).toEqual([{ name: 'Markdown', extensions: ['md', 'markdown'] }])
  })

  it('win32 / linux / unknown ⇒ multi-file default, no openDirectory', () => {
    for (const p of ['win32', 'linux', 'aix', 'freebsd', 'sunos', 'openbsd', 'unknown-xyz']) {
      const out = must().buildImportDialogOptions(p)
      expect(out.properties).toEqual(['openFile', 'multiSelections'])
      expect(out.filters).toEqual([{ name: 'Markdown', extensions: ['md', 'markdown'] }])
    }
  })

  it('filters are byte-equal to the pinned md/markdown filter on every platform', () => {
    for (const p of ['darwin', 'win32', 'linux']) {
      expect(must().buildImportDialogOptions(p).filters).toEqual([
        { name: 'Markdown', extensions: ['md', 'markdown'] },
      ])
    }
  })
})

// ===========================================================================
// §4 fail-states (node-drivable) on the pure core
// ===========================================================================

describe('U-IMPORT-1 §4 F1/F13 · expandImportDirectory TOTAL fail-states', () => {
  it('F1 missing dir → not-a-directory, path echoes the string input', () => {
    const missing = join(tmpRoot, 'does-not-exist')
    expect(must().expandImportDirectory(missing)).toEqual({
      ok: false,
      reason: 'not-a-directory',
      path: missing,
    })
  })

  it('F1 a path to a FILE (not a dir) → not-a-directory', () => {
    const f = writeFile(join(tmpRoot, 'file-as-dir', 'a.md'))
    expect(must().expandImportDirectory(f).ok).toBe(false)
    expect(must().expandImportDirectory(f).reason).toBe('not-a-directory')
  })

  it("F1 '' / undefined / null / non-string dir → not-a-directory with path ''", () => {
    for (const d of ['', undefined, null, 42, {}]) {
      const out = must().expandImportDirectory(d as never)
      expect(out.ok).toBe(false)
      expect(out.reason).toBe('not-a-directory')
      expect(out.path).toBe('')
    }
  })

  it('a valid EMPTY directory → { ok:true, files:[] }', () => {
    const dir = join(tmpRoot, 'empty-dir')
    mkdirSync(dir, { recursive: true })
    expect(must().expandImportDirectory(dir)).toEqual({ ok: true, files: [] })
  })

  it('F13 invalid max (non-positive / NaN / non-number) coerced to MAX_IMPORT_FILES', () => {
    const dir = join(tmpRoot, 'coerce')
    mkdirSync(dir, { recursive: true })
    writeFile(join(dir, 'a.md'))
    writeFile(join(dir, 'b.md'))
    for (const max of [-1, 0, NaN, 'x', null]) {
      // if un-coerced, a cap of -1/0 would hit cap-exceeded; coercion ⇒ the 2
      // files fit under MAX_IMPORT_FILES.
      const out = must().expandImportDirectory(dir, { max: max as never })
      expect(out.ok, `max=${String(max)} must be coerced, not fail`).toBe(true)
      expect(out.files).toHaveLength(2)
    }
  })

  it('F7 exactly max matching files is OK; F6 one over is cap-exceeded fail-loud', () => {
    const exact = join(tmpRoot, 'cap-exact')
    mkdirSync(exact, { recursive: true })
    for (let i = 0; i < 3; i++) writeFile(join(exact, `f${i}.md`))
    expect(must().expandImportDirectory(exact, { max: 3 })).toEqual({
      ok: true,
      files: expect.any(Array),
    })
    expect(must().expandImportDirectory(exact, { max: 3 }).files).toHaveLength(3)

    const over = join(tmpRoot, 'cap-over')
    mkdirSync(over, { recursive: true })
    for (let i = 0; i < 4; i++) writeFile(join(over, `g${i}.md`))
    const out = must().expandImportDirectory(over, { max: 3 })
    expect(out.ok).toBe(false)
    expect(out.reason).toBe('cap-exceeded')
    expect(out.cap).toBe(3)
    expect(out.count).toBe(4) // count === N (full count > cap), never a truncated subset
  })

  it('F8 a symlink entry is skipped (never dereferenced, even named .md)', () => {
    const dir = join(tmpRoot, 'symlink')
    mkdirSync(dir, { recursive: true })
    writeFile(join(dir, 'real.md'))
    symlinkSync(join(dir, 'real.md'), join(dir, 'x.md'))
    const dsub = join(dir, 'dl')
    mkdirSync(dsub, { recursive: true })
    writeFile(join(dsub, 'inner.md'))
    symlinkSync(dsub, join(dir, 'dlink'))
    const out = must().expandImportDirectory(dir)
    expect(out.ok).toBe(true)
    expect(out.files).toEqual([join(dir, 'real.md')]) // x.md (link) + dlink excluded
  })

  it('F9 dot entries (.git, .hidden-dir, .md, .markdown) are skipped', () => {
    const dir = join(tmpRoot, 'dots')
    mkdirSync(dir, { recursive: true })
    writeFile(join(dir, '.git', 'x.md'))
    writeFile(join(dir, '.hidden', 'y.md'))
    writeFile(join(dir, '.md'))
    writeFile(join(dir, '.markdown'))
    writeFile(join(dir, 'keep.md'))
    const out = must().expandImportDirectory(dir)
    expect(out.ok).toBe(true)
    expect(out.files).toEqual([join(dir, 'keep.md')])
  })

  it('F10 non-.md/.markdown files are dropped; a case-insensitive keep survives', () => {
    const dir = join(tmpRoot, 'nonmd')
    mkdirSync(dir, { recursive: true })
    writeFile(join(dir, 'a.txt'))
    writeFile(join(dir, 'README'))
    writeFile(join(dir, 'noext'))
    writeFile(join(dir, 'Keep.Markdown'))
    const out = must().expandImportDirectory(dir)
    expect(out.ok).toBe(true)
    expect(out.files).toEqual([join(dir, 'Keep.Markdown')])
  })
})

describe('U-IMPORT-1 §4 F3/F5/F10 · resolveImportSelection TOTAL fail-states', () => {
  it('F3 null / undefined / non-array / empty array → no-markdown-files, never a throw', () => {
    for (const p of [null, undefined, {}, 42, []]) {
      expect(must().resolveImportSelection(p as never)).toEqual({
        ok: false,
        reason: 'no-markdown-files',
      })
    }
  })

  it("F3 array of non-string/'' elements → no-markdown-files", () => {
    expect(must().resolveImportSelection(['', 5, {}] as never)).toEqual({
      ok: false,
      reason: 'no-markdown-files',
    })
  })

  it('F10 a single non-md file is dropped → empty ⇒ no-markdown-files', () => {
    const txt = writeFile(join(tmpRoot, 'res0', 'a.txt'))
    expect(must().resolveImportSelection([txt])).toEqual({
      ok: false,
      reason: 'no-markdown-files',
    })
  })

  it('F5 a selected directory with NO md → empty expansion ⇒ no-markdown-files', () => {
    const dir = join(tmpRoot, 'zero-md')
    mkdirSync(dir, { recursive: true })
    writeFile(join(dir, 'a.txt'))
    expect(must().resolveImportSelection([dir])).toEqual({
      ok: false,
      reason: 'no-markdown-files',
    })
  })

  it('rule-5: a zero-md directory still counts as a DIRECTORY selection expanded (directories:0 outcome is still no-markdown-files, but a valid md together with it yields dirs:1)', () => {
    const zeroDir = join(tmpRoot, 'zero-md2')
    mkdirSync(zeroDir, { recursive: true })
    writeFile(join(zeroDir, 'x.txt'))
    const md = writeFile(join(tmpRoot, 'zero-md2', 'keep.md'))
    const out = must().resolveImportSelection([zeroDir, md])
    expect(out.ok).toBe(true)
    expect(out.directories).toBe(1)
    expect(out.files).toEqual([md])
  })

  it('F6 a directory expanding past max poisons the WHOLE resolution → cap-exceeded', () => {
    const dir = join(tmpRoot, 'res-cap')
    mkdirSync(dir, { recursive: true })
    for (let i = 0; i < 4; i++) writeFile(join(dir, `h${i}.md`))
    const md = writeFile(join(tmpRoot, 'res-cap', 'extra.md'))
    const out = must().resolveImportSelection([dir, md], { max: 3 })
    expect(out.ok).toBe(false)
    expect(out.reason).toBe('cap-exceeded')
    expect(out.cap).toBe(3)
  })

  it('rule-7 MIXED-ARRAY whole-poison: any non-string/"" element with a valid md ⇒ the WHOLE goes no-markdown-files', () => {
    expect(must().resolveImportSelection(['a.md', '', 'b.md'] as never)).toEqual({
      ok: false,
      reason: 'no-markdown-files',
    })
    expect(must().resolveImportSelection(['a.md', 5] as never)).toEqual({
      ok: false,
      reason: 'no-markdown-files',
    })
    expect(must().resolveImportSelection(['', 'a.md'] as never)).toEqual({
      ok: false,
      reason: 'no-markdown-files',
    })
  })

  it('rule-7 a clean md array is NOT poisoned (sanity guard on the whole-poison boundary)', () => {
    const a = writeFile(join(tmpRoot, 'clean', 'a.md'))
    const out = must().resolveImportSelection([a])
    expect(out.ok).toBe(true)
    expect(out.files).toEqual([a])
  })
})

// ===========================================================================
// §5.7 PBT register (8 rows · deterministic-seeded · stop-after-5) — the pure
// node-testable surface only (never the main.ts wiring).
// ===========================================================================

describe('U-IMPORT-1 §5.7 PBT register (mulberry32-seeded, ≤40/row, stop-after-5)', () => {
  it('P-IM-1 · expandImportDirectory is TOTAL over its domain (never throws; invalid max coerced)', () => {
    const seeds = attemptBudget(1001, 5)
    for (const i of seeds) {
      const missing = join(tmpRoot, 'pim1-missing')
      const dir: string[] = [missing, '']
      for (const d of [...dir, undefined, null, 42, {}]) {
        let out: ImportDirectoryOutcome
        expect(() => {
          out = must().expandImportDirectory(d as never, { max: -1 })
        }).not.toThrow()
        out = must().expandImportDirectory(d as never, { max: -1 })
        // missing / '' / undefined / non-string ⇒ not-a-directory
        if (typeof d === 'string' && (d === '' || d === missing)) {
          expect(out.ok).toBe(false)
          expect(out.reason).toBe('not-a-directory')
        }
        if (d === undefined || d === null || typeof d !== 'string') {
          expect(out.ok).toBe(false)
          expect(out.reason).toBe('not-a-directory')
        }
      }
      const emptyDir = join(tmpRoot, `pim1-empty-${i}`)
      mkdirSync(emptyDir, { recursive: true })
      const oe = must().expandImportDirectory(emptyDir, { max: NaN })
      expect(oe).toEqual({ ok: true, files: [] })
    }
  })

  it('P-IM-2 · buildImportDialogOptions is TOTAL over its platform domain', () => {
    for (const platform of ['darwin', 'win32', 'linux', 'aix', 'freebsd', undefined, null, 42, {}]) {
      const out = must().buildImportDialogOptions(platform as never)
      if (platform === 'darwin') {
        expect(out.properties).toEqual(['openFile', 'multiSelections', 'openDirectory'])
      } else {
        expect(out.properties).toEqual(['openFile', 'multiSelections'])
      }
      expect(out.filters).toEqual([{ name: 'Markdown', extensions: ['md', 'markdown'] }])
    }
  })

  it('P-IM-3 · resolveImportSelection is TOTAL over its selection domain', () => {
    for (const paths of [null, undefined, [], ['', 5, {}], ['a.txt']]) {
      let out: ImportSelectionResolution
      expect(() => {
        out = must().resolveImportSelection(paths as never)
      }).not.toThrow()
      out = must().resolveImportSelection(paths as never)
      expect(out.ok).toBe(false)
      expect(out.reason).toBe('no-markdown-files')
    }
  })

  it('P-TP-1 · expandImportDirectory is deterministic + codepoint-sorted (insertion-order independent)', () => {
    for (const seed of attemptBudget(2001, 5)) {
      const dir = join(tmpRoot, `ptp1-${seed}`)
      mkdirSync(dir, { recursive: true })
      const names = ['z.md', 'a.MD', 'm.markdown', 'k.txt']
      // reverse-ish random insertion order via seed parity
      const ordered = seed % 2 === 0 ? names : [...names].reverse()
      for (const n of ordered) writeFile(join(dir, n))
      writeFile(join(dir, 'sub', 'c.md'))
      const first = must().expandImportDirectory(dir)
      const second = must().expandImportDirectory(dir)
      expect(first).toEqual(second)
      expect(first.ok).toBe(true)
      const files = first.files as string[]
      const sorted = [...files].sort()
      expect(files).toEqual(sorted) // ascending codepoint
      expect(files.every((f) => !f.includes('sub'))).toBe(true) // non-recursive
      expect(files.every((f) => !f.toLowerCase().endsWith('.txt'))).toBe(true)
    }
  })

  it('P-TP-2 · expansion scope is exactly top-level .md/.markdown, dot-/non-md-/nested-skipped', () => {
    for (const seed of attemptBudget(3001, 5)) {
      const dir = join(tmpRoot, `ptp2-${seed}`)
      mkdirSync(dir, { recursive: true })
      writeFile(join(dir, 'A.MD'))
      writeFile(join(dir, 'X.MarkDown'))
      writeFile(join(dir, 'y.mD'))
      writeFile(join(dir, 'a.txt'))
      writeFile(join(dir, 'README'))
      writeFile(join(dir, 'noext'))
      writeFile(join(dir, '.md'))
      writeFile(join(dir, '.git', 'x.md'))
      writeFile(join(dir, 'sub', 'c.md'))
      const out = must().expandImportDirectory(dir)
      expect(out.ok).toBe(true)
      const files = out.files as string[]
      expect(files).toEqual([
        join(dir, 'A.MD'),
        join(dir, 'X.MarkDown'),
        join(dir, 'y.mD'),
      ])
    }
  })

  it('P-TP-3 · symlink rule is conservative + deterministic (file- and dir-links excluded)', () => {
    for (const seed of attemptBudget(4001, 5)) {
      const dir = join(tmpRoot, `ptp3-${seed}`)
      mkdirSync(dir, { recursive: true })
      writeFile(join(dir, 'real.md'))
      symlinkSync(join(dir, 'real.md'), join(dir, `x-${seed}.md`))
      const sub = join(dir, 'dl')
      mkdirSync(sub, { recursive: true })
      writeFile(join(sub, 'inner.md'))
      symlinkSync(sub, join(dir, `dlink-${seed}`))
      const out = must().expandImportDirectory(dir)
      expect(out.ok).toBe(true)
      // the two symlinks are excluded; only the real file survives (assert by basename so the
      // `ptp3-<seed>` dir-name `-` does not break a path-`-` filter — the impl excludes symlinks)
      const base = (p: string): string => p.split(/[\\/]/).pop() as string
      expect(out.files.map(base)).toEqual(['real.md'])
      expect(out.files).toEqual([join(dir, 'real.md')])
    }
  })

  it('P-TP-4 · cap is fail-loud with a precise boundary (N ∈ {max-1, max, max+1, max*2})', () => {
    const max = 3
    for (const seed of attemptBudget(5001, 5)) {
      for (const N of [max - 1, max, max + 1, max * 2]) {
        const dir = join(tmpRoot, `ptp4-${seed}-${N}`)
        mkdirSync(dir, { recursive: true })
        for (let i = 0; i < N; i++) writeFile(join(dir, `f${i}.md`))
        const out = must().expandImportDirectory(dir, { max })
        if (N > max) {
          expect(out.ok).toBe(false)
          expect(out.reason).toBe('cap-exceeded')
          expect(out.cap).toBe(max)
          expect(out.count).toBe(N) // count === N, the FULL matching count (> cap)
        } else {
          expect(out.ok, `N=${N} must be ok at/below max`).toBe(true)
          expect(out.files).toHaveLength(N)
        }
      }
    }
  })

  it('P-TP-5 · resolveImportSelection aggregates deterministically (md-only, deduped, codepoint-sorted, dir-expanded)', () => {
    for (const seed of attemptBudget(6001, 5)) {
      const dir = join(tmpRoot, `ptp5-${seed}`)
      mkdirSync(dir, { recursive: true })
      const dA = writeFile(join(dir, 'a.md'))
      const dB = writeFile(join(dir, 'b.markdown'))
      writeFile(join(dir, 'c.txt')) // non-md dropped
      const explicitB = writeFile(join(tmpRoot, `ptp5ext-${seed}`, 'b.md'))
      const out = must().resolveImportSelection([explicitB, dir, dir, explicitB])
      expect(out.ok).toBe(true)
      const files = (out.files as string[]).filter((f: string) => f.includes(dir))
      expect(files).toEqual([dA, dB])
      expect(out.directories).toBe(1)
      expect((out.files as string[]).every((f: string) => /\.(md|markdown)$/i.test(f))).toBe(true)
    }
  })
})

// ===========================================================================
// §3b.6/7/8 + §2.8 — the wiring: win/linux two-item File menu + both action
// seams (live drive of the EXISTING buildMenuTemplate) + the source-pins that
// are RED until the code lands.
// ===========================================================================

describe('U-IMPORT-1 §3b.7 · the win/linux vs darwin File-menu shape (live buildMenuTemplate)', () => {
  interface Shape { label?: string; role?: string; submenu?: Shape[]; click?: unknown }

  function fileItems(platform: string, actions: AppMenuActions): Shape[] {
    const template = buildMenuTemplate([], { platform: platform as NodeJS.Platform, actions }) as Shape[]
    const file = template.find((i) => i.label === 'File')
    return (file?.submenu ?? []) as Shape[]
  }

  it('win/linux emit BOTH Import… AND Import folder…; darwin emits exactly ONE Import…', () => {
    const actions = { openImport: vi.fn(), openImportFolder: vi.fn(), togglePane: vi.fn() } as unknown as AppMenuActions
    for (const platform of ['win32', 'linux'] as const) {
      const labels = fileItems(platform, actions).map((i) => i.label).filter(Boolean)
      expect(labels).toContain('Import…')
      expect(labels).toContain('Import folder…')
    }
    const darwinLabels = fileItems('darwin', actions).map((i) => i.label).filter(Boolean)
    expect(darwinLabels.filter((l) => l === 'Import…')).toHaveLength(1)
    expect(darwinLabels).not.toContain('Import folder…')
  })

  it('Import… routes to actions.openImport(); Import folder… routes to actions.openImportFolder()', () => {
    const openImport = vi.fn()
    const openImportFolder = vi.fn()
    const actions = {
      openImport,
      openImportFolder,
      togglePane: vi.fn(),
    } as unknown as AppMenuActions
    for (const platform of ['win32', 'linux'] as const) {
      const items = fileItems(platform, actions)
      const imp = items.find((i) => i.label === 'Import…')
      const fol = items.find((i) => i.label === 'Import folder…')
      expect(typeof imp?.click).toBe('function')
      expect(typeof fol?.click).toBe('function')
      ;(imp?.click as unknown as () => void)()
      ;(fol?.click as unknown as () => void)()
    }
    expect(openImport).toHaveBeenCalledTimes(2)
    expect(openImportFolder).toHaveBeenCalledTimes(2)
  })
})

// ---- §2.8 the source-pinned wiring (statically asserted against the LIVE
// source — ALL RED until the code lands) --------------

describe('U-IMPORT-1 §2.8 source-pins (statically asserted — RED until the code lands)', () => {
  const appMenuSrc = readFileSync(join(process.cwd(), 'src/main/app-menu.ts'), 'utf8')
  const mainSrc = readFileSync(join(process.cwd(), 'src/main/main.ts'), 'utf8')
  const typesSrc = readFileSync(join(process.cwd(), 'src/shared/types.ts'), 'utf8')

  it('app-menu.ts AppMenuActions gains openImportFolder + the File menu emits Import folder…', () => {
    expect(appMenuSrc, 'AppMenuActions must gain openImportFolder() (§2.3/§2.8)').toContain('openImportFolder')
    expect(appMenuSrc, 'the win/linux File menu must emit the Import folder… item (§2.3)').toContain('Import folder…')
  })

  it('main.ts builds the dialog via buildImportDialogOptions(platform), not the hardcoded spread', () => {
    expect(mainSrc, 'openImport() must call buildImportDialogOptions(platform) (§2.4 step 1)').toContain('buildImportDialogOptions(')
    expect(mainSrc, 'openImportFolder() must use the openDirectory-only dialog (§2.4 step 1)').toContain("['openDirectory']")
  })

  it('main.ts calls resolveImportSelection(selection, {max}) and routes the outcome', () => {
    expect(mainSrc, 'the non-cancel selection must flow through resolveImportSelection (§2.4 steps 3-5)').toContain('resolveImportSelection(')
    expect(mainSrc, 'the resolution outcome must drive the branch (§2.4 steps 4-5)').toContain('MAX_IMPORT_FILES')
  })

  it('main.ts routes success to importMarkdownCorpus with the default-store corpusRoot', () => {
    expect(mainSrc, 'success must call importMarkdownCorpus(ctx, {files, corpusRoot}) (§2.4 step 5)').toContain('importMarkdownCorpus(')
    expect(mainSrc, 'corpusRoot must come from the default store entry (server-fixed, not from the selection) (§2.4 step 5)').toContain('defaultEntry.corpusRoot')
  })

  it('main.ts broadcasts IPC_IMPORT_RESULT exactly once per non-cancel run', () => {
    expect(mainSrc, 'main must broadcast the import result on IPC_IMPORT_RESULT (§2.5)').toContain('IPC_IMPORT_RESULT')
  })

  it('types.ts declares IPC_IMPORT_RESULT = \'provident:import-result\'', () => {
    expect(typesSrc, 'types.ts must pin IPC_IMPORT_RESULT = \'provident:import-result\' (§2.5/§5.8)').toContain("IPC_IMPORT_RESULT = 'provident:import-result'")
  })
})

// ===========================================================================
// ADJUSTED ADVERSARIAL-FINDING REGRESSIONS (IMPORT-ADV-1/2/3) — pinned against
// the FIXED implementation. All three must PASS against the fixed code; a
// regression means the adversarial fix was lost.
// ===========================================================================

describe('U-IMPORT-1 adversarial regressions (ADV-1/2/3)', () => {
  // IMPORT-ADV-1 (LOW): the empty string is a NON-darwin platform — it must
  // NEVER fall through to `process.platform` (which, on a darwin host, would
  // return the combined darwin shape). `buildImportDialogOptions('')` coerces
  // `''` to the multi-file default, deterministically on ANY host.
  it('ADV-1 · buildImportDialogOptions("") is the NON-darwin multi-file shape (never falls through to process.platform)', () => {
    expect(must().buildImportDialogOptions('')).toEqual({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
    })
  })

  // IMPORT-ADV-3 (INFO): a fractional positive `max` is floored to an integer
  // cap (`Math.floor(max)` ⇒ 2), so a 3-md dir with `{ max: 2.5 }` exceeds the
  // cap of 2, fail-loud with `cap:2, count:3`.
  it('ADV-3 · expandImportDirectory floors a fractional max (2.5 ⇒ cap 2) and fails-loud on a 3-md dir', () => {
    const dir = join(tmpRoot, 'adv3-expand')
    mkdirSync(dir, { recursive: true })
    for (let i = 0; i < 3; i++) writeFile(join(dir, `f${i}.md`))
    expect(must().expandImportDirectory(dir, { max: 2.5 })).toEqual({
      ok: false,
      reason: 'cap-exceeded',
      cap: 2,
      count: 3,
    })
  })

  // IMPORT-ADV-3 through the aggregate: a fractional `max` poisons the whole
  // resolution to `cap-exceeded` with the floored cap.
  it('ADV-3 · resolveImportSelection floors a fractional max (2.5 ⇒ cap 2) on a 3-md directory', () => {
    const dir = join(tmpRoot, 'adv3-resolve')
    mkdirSync(dir, { recursive: true })
    for (let i = 0; i < 3; i++) writeFile(join(dir, `g${i}.md`))
    expect(must().resolveImportSelection([dir], { max: 2.5 })).toEqual({
      ok: false,
      reason: 'cap-exceeded',
      cap: 2,
    })
  })

  // IMPORT-ADV-2 (INFO): only a directory that ACTUALLY EXPANDS is counted in
  // `directories`. The original race — a dir that lstat-classifies as a
  // directory but whose readdir/expansion then fails (or becomes
  // not-a-directory) — is NON-DETERMINISTIC to construct in a unit test, so it
  // is SKIPPED here. Instead we pin the observable invariant that a directory
  // which successfully expands is ALWAYS counted, even when it yields ZERO md
  // files (an expanded zero-md dir increments `directories`).
  it('ADV-2 · an expanded directory is always counted in directories, even a zero-md one (race variant skipped: non-deterministic)', () => {
    // directory with md files ⇒ expanded + counted
    const withMd = join(tmpRoot, 'adv2-withmd')
    mkdirSync(withMd, { recursive: true })
    const a = writeFile(join(withMd, 'a.md'))
    expect(must().resolveImportSelection([withMd])).toEqual({
      ok: true,
      files: [a],
      directories: 1,
    })
    // an EXPANDED zero-md directory also counts (directories:1) — it was
    // expanded and counted, so this is the observable ADV-2 invariant.
    const zeroMd = join(tmpRoot, 'adv2-zeromd')
    mkdirSync(zeroMd, { recursive: true })
    writeFile(join(zeroMd, 'x.txt'))
    const keep = writeFile(join(tmpRoot, 'adv2-zeromd', 'keep.md'))
    const out = must().resolveImportSelection([zeroMd, keep])
    expect(out.ok).toBe(true)
    expect(out.directories).toBe(1)
    expect(out.files).toEqual([keep])
  })
})
