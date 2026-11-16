// tests/integration/shell-chrome/theme-carrier-target.test.ts — unit `U-1c` `theme-carrier`'s
// OWN ROW, authored BEFORE any byte of the carrier moves (RCA-1) and RUN at the pre-edit head.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-u-1c-theme-carrier.md` §3 (the red set) — the FIVE
// limbs `A`, `B`, `C`, `D`, `E`, and NOTHING ELSE. §2 is the change set these limbs pin; §6 is the
// assumption set they read (`ASM-U1c-1` the carrier is written on the DOCUMENT ROOT through
// `setAttribute`/`removeAttribute`, `ASM-U1c-2` `ThemeRoot` widens OPTIONALLY so a `dataset`-only
// root keeps a fail-soft boot arm, `ASM-U1c-3` the `@media` fallback keeps `:root` keying).
//
// THE TARGET STATE these rows assert (D-14 — the foundation's vocabulary wins — and the
// change-analysis's §2.4 disposition):
//   · the ONE write site writes the foundation's bare `theme` attribute: a removal record
//     (`{name, value:'', removal:true}`) calls `removeAttribute(write.name)` and a value record
//     calls `setAttribute(write.name, write.value)` — `root.dataset.theme` is written NOWHERE, on
//     any arm, and the emitted attribute's NAME is the mechanism's echoed `write.name`;
//   · `ThemeRoot` stays a STRUCTURAL surface: a root offering only `setAttribute`/
//     `removeAttribute` is written; a root offering only `dataset` is legal, is written NOT AT ALL,
//     and never throws (the fail-soft boot arm, `ASM-U1c-2`);
//   · the fork holds NO second copy of the token: `'theme'` is the CALLER's argument to
//     `applyThemeDeclaration`, exactly once, in code (limb `C`, the anti-regression limb the
//     theme register already asserts);
//   · `src/renderer/index.html` keys its two token-block selectors on the SAME attribute — exactly
//     one `html[theme='light']` and one `html[theme='dark']`, no `data-theme` anywhere under
//     `src/**`, and the fifteen token names still declared in all three blocks;
//   · no md5-pinned byte moves: the theme register's seven RECORDED digests still read MATCH and
//     neither file this unit writes is among them.
//
// LAYER (MANDATORY, `D-10` / `RCA-12`): every limb here is `[T]`/ENVELOPE-class. The roots are
// recording doubles and the adapter is the REAL module (or the REAL module's own bytes re-instantiated
// with the mechanism injected, the corpus's established form for driving the removal record, which
// `§3.2` item 5 fixes as UNREACHABLE through the fork's resolver). No grid, no CSS resolution, no
// window, no paint. **Nothing here proves that `[theme="dark"]` PAINTS** — that reading is `G8`'s
// alone (`node scripts/live-drive.mjs` on a usable display; the unit contract §4), and no row of this
// file may be quoted for it.
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`; it writes
// nothing (every subject is READ). No `vi.mock` in any form — the removal record is injected by
// RE-INSTANTIATING the adapter's own landed bytes with the mechanism as an argument, exactly as
// `archive/tests/2026-10-04-pd-ui-1-theme-adoption.test.ts` did, so the file joins none of the
// protected mock censuses.
import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// `typescript` is an EXISTING devDependency (the theme register uses it) — no new dependency and
// no new leg is added by this row.
import ts from 'typescript'

import { applyThemeToRoot } from '../../../src/renderer/theme.js'
import type { ThemeRoot } from '../../../src/renderer/theme.js'
import {
  applyThemeDeclaration as vendoredApplyThemeDeclaration,
  resolveTheme as vendoredResolveTheme,
} from '../../../src/shared/theme.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..', '..')
const ADAPTER_PATH = join(REPO_ROOT, 'src', 'renderer', 'theme.ts')
const INDEX_HTML_PATH = join(REPO_ROOT, 'src', 'renderer', 'index.html')
const REGISTER_PATH = join(REPO_ROOT, 'tests', 'pd-ui-1-theme-register.test.ts')
const SRC_ROOT = join(REPO_ROOT, 'src')

/** The adapter's own code with its COMMENT PROSE removed — a token in a comment is documentation
 *  (the adapter explains what it does not do), a token in code is the contract. Same reader the
 *  theme register's `P-TH-IM-4 (c)` uses. */
function adapterCode(): string {
  return readFileSync(ADAPTER_PATH, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .map((l) => l.replace(/\/\/.*$/, ''))
    .join('\n')
}

// ===========================================================================
// Limb `A` — THE WRITE ARM: the attribute surface is the one that is written.
// ===========================================================================

/** A root carrying ONLY the attribute face (the widened `ThemeRoot`, `ASM-U1c-2`). */
interface AttributeRecording {
  root: ThemeRoot
  set: Array<[string, string]>
  removed: string[]
  /** EVERY property write/delete reached through the root, whatever the face. */
  touched: string[]
}
function attributeOnlyRoot(): AttributeRecording {
  const set: Array<[string, string]> = []
  const removed: string[] = []
  const touched: string[] = []
  const root = {
    setAttribute: (name: string, value: string): void => {
      touched.push(`setAttribute:${name}`)
      set.push([name, value])
    },
    removeAttribute: (name: string): void => {
      touched.push(`removeAttribute:${name}`)
      removed.push(name)
    },
  } as unknown as ThemeRoot
  return { root, set, removed, touched }
}

/** A root carrying ONLY the legacy `dataset` face (the pre-widening shim shape). Its `dataset` is a
 *  recording proxy, so a `dataset.theme` write OR a `delete dataset.theme` is SEEN rather than
 *  inferred (`ASM-U1c-2`: the fail-soft arm is preserved, and it is not a write). */
function datasetOnlyRoot(preCarried?: string): AttributeRecording {
  const touched: string[] = []
  const data: Record<string, string> = {}
  if (preCarried !== undefined) data.theme = preCarried
  const proxy = new Proxy(data, {
    set(target, key, value): boolean {
      touched.push(`dataset.write:${String(key)}=${String(value)}`)
      ;(target as Record<string, string>)[String(key)] = String(value)
      return true
    },
    deleteProperty(target, key): boolean {
      touched.push(`dataset.delete:${String(key)}`)
      return delete (target as Record<string, string>)[String(key)]
    },
  })
  const root = { dataset: proxy } as unknown as ThemeRoot
  return { root, set: [], removed: [], touched }
}

/** The mechanism's two exports, as the faithful instantiation injects them. */
interface MechanismStub {
  resolveTheme: (setting: unknown, env: unknown) => { setting: string | null; prefersDark: boolean; source: 'env' | 'degraded-env' }
  applyThemeDeclaration: (attributeName: unknown, resolved: unknown) => { name: string | null; value: string; removal: boolean }
}

/** THE REAL MECHANISM, injected — proves the instantiation is FAITHFUL to the landed adapter. */
const REAL_STUB: MechanismStub = {
  resolveTheme: (setting, env) => vendoredResolveTheme(setting, env),
  applyThemeDeclaration: (attributeName, resolved) => vendoredApplyThemeDeclaration(attributeName, resolved),
}

/** The adapter's own landed bytes, compiled and evaluated with ONLY its single import declaration
 *  replaced by a destructuring bind of `stub`. Every other byte is the landed source, so the
 *  subject of the drive is the artifact and never a re-write of it (the corpus's `A-2` form). */
function instantiateAdapter(stub: MechanismStub): {
  resolveTheme: (setting: unknown, prefersDark: boolean) => unknown
  applyThemeToRoot: (root: unknown, setting: unknown, prefersDark: boolean) => unknown
} {
  const sourceText = readFileSync(ADAPTER_PATH, 'utf8')
  const sf = ts.createSourceFile('theme-carrier-corpus.ts', sourceText, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const imports = sf.statements.filter(ts.isImportDeclaration)
  expect(
    imports.length,
    'the drive needs the adapter to carry EXACTLY ONE import declaration (the vendored edge), so the injection site is unambiguous',
  ).toBe(1)
  const decl = imports[0]!
  const named = decl.importClause?.namedBindings
  expect(
    named !== undefined && ts.isNamedImports(named),
    'the adapter must import the vendored module by NAMED bindings (a namespace/default form would not be injectable this way)',
  ).toBe(true)
  const bindings = (named as ts.NamedImports).elements.map((el) => `${(el.propertyName ?? el.name).text}: ${el.name.text}`)
  const replacement = `const { ${bindings.join(', ')} } = __MECHANISM_STUB__`
  const transformed = sourceText.slice(0, decl.getStart(sf)) + replacement + sourceText.slice(decl.getEnd())
  const js = ts.transpileModule(transformed, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText
  const mod: { exports: Record<string, unknown> } = { exports: {} }
  new Function('exports', '__MECHANISM_STUB__', js)(mod.exports, stub)
  const instantiated = mod.exports as { resolveTheme?: unknown; applyThemeToRoot?: unknown }
  expect(typeof instantiated.resolveTheme, 'the instantiated corpus must export `resolveTheme`').toBe('function')
  expect(typeof instantiated.applyThemeToRoot, 'the instantiated corpus must export `applyThemeToRoot`').toBe('function')
  return {
    resolveTheme: instantiated.resolveTheme as (setting: unknown, prefersDark: boolean) => unknown,
    applyThemeToRoot: instantiated.applyThemeToRoot as (root: unknown, setting: unknown, prefersDark: boolean) => unknown,
  }
}

describe('§3 limb `A` — the write arm: `theme` is written through `setAttribute`, and the record names it', () => {
  it('A1 — a root carrying ONLY `setAttribute`/`removeAttribute` receives `theme="dark"` then `theme="light"`, and the resolved theme is still returned', () => {
    const co = attributeOnlyRoot()
    const dark = applyThemeToRoot(co.root, 'dark', false)
    const light = applyThemeToRoot(co.root, 'light', true)
    expect(dark, 'the resolved theme is still RETURNED by the one write site (§2.1 item 4, UNMOVED)').toBe('dark')
    expect(light, 'an explicit `light` wins over a dark OS reading — the KEPT precedence rule').toBe('light')
    expect(
      co.set,
      '⟨U-1c, D-14⟩ the ONE write site must perform the mechanism’s `value` arm as `setAttribute(write.name, write.value)` on the root it was HANDED — the carrier is the foundation’s bare `theme` attribute, not `data-theme`',
    ).toEqual([
      ['theme', 'dark'],
      ['theme', 'light'],
    ])
    expect(co.removed, 'the value arm performs NO removal').toEqual([])
  })

  it('A2 — a root carrying ONLY `dataset` (the pre-widening shim shape) is written NOTHING, and never throws (`ASM-U1c-2`, the fail-soft boot arm)', () => {
    const co = datasetOnlyRoot()
    let returned: unknown
    expect(() => {
      returned = applyThemeToRoot(co.root, 'dark', true)
    }, 'a `dataset`-only root stays LEGAL: the adapter is total/fail-soft and may not throw at a boot').not.toThrow()
    expect(returned, 'the resolution is returned whatever the root offers — the return is not a write receipt').toBe('dark')
    expect(
      co.touched,
      '⟨U-1c⟩ the write surface MOVED off `dataset`: a root offering only the legacy face is not written at all (no `dataset.theme = …`, no `delete dataset.theme`) — a `dataset` write here means the site still carries the superseded carrier',
    ).toEqual([])
  })

  it('A3 — a root carrying NEITHER face never throws and still returns the resolution (the contract’s TOTAL limb is unmoved)', () => {
    const hostile = {} as unknown as ThemeRoot
    let returned: unknown
    expect(() => {
      returned = applyThemeToRoot(hostile, 'system', true)
    }, '§2.1 item 5 (TOTAL/fail-soft): an absent/throwing face is absorbed, never thrown — boot cannot break here').not.toThrow()
    expect(returned, '`system` + a dark OS reading follows the OS').toBe('dark')
  })

  it('A4 — the attribute’s NAME is the mechanism’s echoed `write.name`, never a second literal at the write site', () => {
    // A stub whose declaration names the attribute differently: an adapter that spells `'theme'` at
    // its write site cannot follow it, and the fork would hold a second copy of the token.
    const PROBE_NAME = 'theme-probe'
    const probeStub: MechanismStub = {
      resolveTheme: (setting, env) => vendoredResolveTheme(setting, env),
      applyThemeDeclaration: (attributeName, resolved) => {
        const write = vendoredApplyThemeDeclaration(attributeName, resolved)
        return { ...write, name: typeof write.name === 'string' ? PROBE_NAME : write.name }
      },
    }
    const instantiated = instantiateAdapter(probeStub)
    const co = attributeOnlyRoot()
    instantiated.applyThemeToRoot(co.root, 'dark', false)
    expect(
      co.set,
      "§2.1 item 2 + `P-TH-7`: the attribute name is the CALLER’s (the adapter's `applyThemeDeclaration('theme', …)` argument) and the WRITE applies the record’s echoed `name` — a literal `theme` at the write site is the second copy limb `C` forbids",
    ).toEqual([[PROBE_NAME, 'dark']])
  })
})

// ===========================================================================
// Limb `B` — THE REMOVAL ARM: a removal record REMOVES the attribute.
// ===========================================================================

describe('§3 limb `B` — the removal arm: `removeAttribute(write.name)`, and `dataset` is not the surface', () => {
  it('B1 — the removal case is the mechanism’s `removal` member (`{name, value:"", removal:true}`), and the value arm is `removal:false`', () => {
    expect(
      vendoredApplyThemeDeclaration('theme', ''),
      '§3.1 item 15 (UNMOVED): a removal is declared by the `removal` member, its `value` is `\'\'`, and the `name` is echoed independently — this is the record limb `B` drives',
    ).toEqual({ name: 'theme', value: '', removal: true })
    expect(vendoredApplyThemeDeclaration('theme', 'dark'), 'the value arm is the other shape of the same record').toEqual({
      name: 'theme',
      value: 'dark',
      removal: false,
    })
  })

  it('B2 — FAITHFULNESS: with the REAL mechanism injected, the instantiation reproduces the imported adapter on the reachable arms', () => {
    const instantiated = instantiateAdapter(REAL_STUB)
    for (const [setting, prefersDark] of [
      ['dark', false],
      ['light', true],
      ['system', true],
      ['system', false],
      [undefined, true],
    ] as Array<[unknown, boolean]>) {
      const importedRoot = attributeOnlyRoot()
      const instantiatedRoot = attributeOnlyRoot()
      const importedReturn = applyThemeToRoot(importedRoot.root, setting, prefersDark)
      const instantiatedReturn = instantiated.applyThemeToRoot(instantiatedRoot.root, setting, prefersDark)
      expect(instantiatedReturn, `the instantiated adapter must return what the imported one returns for ${String(setting)}`).toBe(importedReturn)
      expect(instantiatedRoot.set, `…and must write what the imported one writes for ${String(setting)}`).toEqual(importedRoot.set)
      expect(instantiatedRoot.removed, '…and remove what the imported one removes').toEqual(importedRoot.removed)
    }
  })

  it('B3 — an INJECTED removal record calls `removeAttribute("theme")` once, `setAttribute` zero times, and touches no `dataset` member', () => {
    const removalStub: MechanismStub = {
      resolveTheme: (setting, env) => vendoredResolveTheme(setting, env),
      applyThemeDeclaration: (attributeName) => ({
        name: typeof attributeName === 'string' && attributeName !== '' ? attributeName : null,
        value: '',
        removal: true,
      }),
    }
    const instantiated = instantiateAdapter(removalStub)
    // TWO faces on ONE root, so the arm that is taken is SEEN whichever surface the adapter reaches:
    // the attribute face records the calls, and the `dataset` proxy records an assignment or a delete.
    const attributeFace = attributeOnlyRoot()
    const datasetFace = datasetOnlyRoot('light')
    const bothFaced = Object.assign({}, datasetFace.root, attributeFace.root) as unknown as ThemeRoot
    const touched: string[] = []
    const root = new Proxy(bothFaced as unknown as Record<string, unknown>, {
      get(target, key): unknown {
        if (key === 'setAttribute') {
          return (name: string, value: string): void => {
            touched.push(`setAttribute:${name}=${value}`)
            attributeFace.touched.push(`setAttribute:${name}`)
            attributeFace.set.push([name, value])
          }
        }
        if (key === 'removeAttribute') {
          return (name: string): void => {
            touched.push(`removeAttribute:${name}`)
            attributeFace.touched.push(`removeAttribute:${name}`)
            attributeFace.removed.push(name)
          }
        }
        if (key === 'dataset') return datasetFace.root.dataset
        return Reflect.get(target, key)
      },
    }) as unknown as ThemeRoot
    const returned = instantiated.applyThemeToRoot(root, 'dark', false)
    expect(returned, '§2.1 item 4: the resolution is STILL returned while the removal arm is taken').toBe('dark')
    expect(
      touched,
      '⟨U-1c, D-14 + `A-7` superseded⟩ a `removal:true` record means THE ATTRIBUTE IS REMOVED: the one write site must take its removal arm as `removeAttribute(write.name)` — and the superseded `delete dataset.theme` arm must be GONE (a dataset touch here is the old carrier surviving)',
    ).toEqual(['removeAttribute:theme'])
    expect(attributeFace.set, 'the removal arm performs NO assignment').toEqual([])
    expect(datasetFace.touched, 'the removal arm must not reach `dataset` at all — neither a write nor a delete').toEqual([])
  })
})

// ===========================================================================
// Limb `C` — THE CALLER'S NAME: the fork holds no second copy of the token.
// GREEN BEFORE AND AFTER by construction (the anti-regression limb the register already asserts).
// ===========================================================================

describe('§3 limb `C` — the caller’s name: the mechanism is asked with the fork’s own `\'theme\'` token, exactly once', () => {
  it('C1 — the adapter passes the string `theme` as the CALLER’s argument to `applyThemeDeclaration`, as data', () => {
    expect(
      adapterCode(),
      '§2.1 item 2 (UNMOVED by `U-1c`): the attribute name is the CALLER’s argument — the mechanism owns no name and is asked with the fork’s own token',
    ).toMatch(/applyThemeDeclaration\s*\(\s*'theme'/)
  })

  it('C2 — the adapter’s code carries the token `theme` EXACTLY once (the caller’s argument), so the write site holds no second copy', () => {
    const occurrences = [...adapterCode().matchAll(/'theme'/g)]
    expect(
      occurrences.length,
      'a second `\'theme\'` literal in the adapter’s code is the second authority limb `C` forbids — the WRITE must apply the record’s echoed `write.name`',
    ).toBe(1)
  })
})

// ===========================================================================
// Limb `D` — THE SHEET'S CONTRACT: the reader moved with the writer.
// ===========================================================================

/** Every `src/**` file (`.ts` and `.html`), repo-relative and POSIX-shaped. */
function listSrcSurface(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return listSrcSurface(p)
    return /\.(ts|html)$/.test(e.name) ? [relative(REPO_ROOT, p).split('\\').join('/')] : []
  })
}

/** The `data-theme` sites in a corpus — ONE reader, driven over the real tree AND over a synthetic
 *  corpus, so the census's discrimination is shown rather than asserted (the ⟨A-1⟩ pattern). */
function carrierSitesIn(corpus: ReadonlyArray<{ file: string; text: string }>): Array<{ file: string; count: number }> {
  return corpus
    .map((entry) => ({ file: entry.file, count: [...entry.text.matchAll(/data-theme/g)].length }))
    .filter((entry) => entry.count > 0)
}

const CSS_NO_COMMENTS = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, (c) => ' '.repeat(c.length))

/** One block's declaration body, read STRUCTURALLY (CSS comments stripped first, same-length, so
 *  indices stay aligned) — the token-block reader the register's `P-TH-SM-1 (e)` uses. */
function cssBlockBody(css: string, pattern: RegExp): string | null {
  const stripped = CSS_NO_COMMENTS(css)
  const m = pattern.exec(stripped)
  if (m === null) return null
  const open = stripped.indexOf('{', m.index)
  if (open < 0) return null
  let depth = 0
  for (let i = open; i < stripped.length; i++) {
    if (stripped[i] === '{') depth++
    else if (stripped[i] === '}') {
      depth--
      if (depth === 0) return stripped.slice(open + 1, i)
    }
  }
  return null
}

describe('§3 limb `D` — the sheet’s contract: the two token-block selectors key on `theme`, and no `data-theme` survives', () => {
  it('D1 — `index.html` declares EXACTLY one `html[theme=\'light\']` selector and one `html[theme=\'dark\']` selector (comments excluded)', () => {
    const css = CSS_NO_COMMENTS(readFileSync(INDEX_HTML_PATH, 'utf8'))
    const light = [...css.matchAll(/html\[theme='light'\]/g)].length
    const dark = [...css.matchAll(/html\[theme='dark'\]/g)].length
    expect(light, '⟨U-1c, D-14⟩ the light token block is keyed `:root, html[theme=\'light\']` — exactly ONE such selector').toBe(1)
    expect(dark, '⟨U-1c, D-14⟩ the dark override is keyed `html[theme=\'dark\']` — exactly ONE such selector').toBe(1)
  })

  it('D2 — NO `data-theme` remains anywhere under `src/**`, and the census is not blind (a floor on the files it read)', () => {
    const corpus = listSrcSurface(SRC_ROOT).map((file) => ({ file, text: readFileSync(join(REPO_ROOT, file), 'utf8') }))
    expect(corpus.length, 'the source-surface census must have read a real tree (a file floor, so a broken walk cannot pass by being blind)').toBeGreaterThan(20)
    expect(
      carrierSitesIn(corpus),
      '⟨U-1c⟩ the SUPERSEDED carrier must be gone from `src/**` — a surviving `data-theme` in `index.html`, the adapter or the boot wiring means the tree reads two vocabularies (D-14)',
    ).toEqual([])
  })

  it('D3 — the fifteen token names are still declared in ALL THREE blocks (the census is re-POINTED, never re-grained)', () => {
    const css = readFileSync(INDEX_HTML_PATH, 'utf8')
    const bodies = {
      root: cssBlockBody(css, /:root\s*,\s*html\[theme='light'\]/),
      dark: cssBlockBody(css, /html\[theme='dark'\]/),
      media: cssBlockBody(css, /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root/),
    }
    expect(bodies.root, 'the `:root, html[theme=\'light\']` block must be readable').not.toBeNull()
    expect(bodies.dark, 'the `html[theme=\'dark\']` block must be readable').not.toBeNull()
    expect(bodies.media, 'the `@media (prefers-color-scheme: dark)` fallback must be readable and still keyed on `:root` (`ASM-U1c-3`)').not.toBeNull()
    const names = (body: string): string[] => [...new Set([...body.matchAll(/(--[A-Za-z0-9-]+)\s*:/g)].map((m) => m[1]!))].sort()
    const root = names(bodies.root!)
    expect(root.length, 'the `:root` block declares the pinned FIFTEEN names (a non-vacuity floor for the two comparisons below)').toBe(15)
    expect(names(bodies.dark!), 'each of the fifteen names is also declared in the dark block').toEqual(root)
    expect(names(bodies.media!), 'the `@media` fallback redeclares the same fifteen names').toEqual(root)
  })

  it('D4 — the census oracle is not vacuous: a synthetic corpus carrying `data-theme` IS seen', () => {
    expect(
      carrierSitesIn([{ file: '<synthetic>', text: `html[data-theme='dark'] { --bg: #000 }` }]),
      'the same reader that reads the real tree EMPTY must SEE a synthetic `data-theme` corpus, else D2 proves nothing',
    ).toEqual([{ file: '<synthetic>', count: 1 }])
  })
})

// ===========================================================================
// Limb `E` — NO PINNED BYTE: the seven RECORDED digests still MATCH, and neither
// file this unit writes is among them. This unit owes NO re-record.
// ===========================================================================

/** The theme register's `UNTOUCHED_DIGESTS` table, read from its own SOURCE rather than copied
 *  here: this unit owes no re-record, and a LATER unit's licensed re-record must not red this row
 *  (one table, one owner — a second hand-kept copy is the drift the corpus's `A-1` correction
 *  closed). The regex matches the five row shapes' common prefix only. */
function recordedDigests(): Array<{ file: string; md5: string }> {
  const text = readFileSync(REGISTER_PATH, 'utf8')
  return [...text.matchAll(/^ {2}\{ file: '([^']+)', md5: '([0-9a-f]{32})'/gm)].map((m) => ({ file: m[1]!, md5: m[2]! }))
}

function digestReading(): Array<{ file: string; recorded: string; actual: string; matches: boolean }> {
  return recordedDigests().map((row) => {
    const actual = createHash('md5').update(readFileSync(join(REPO_ROOT, row.file))).digest('hex')
    return { file: row.file, recorded: row.md5, actual, matches: actual === row.md5 }
  })
}

describe('§3 limb `E` — no pinned byte: the register’s seven RECORDED digests still MATCH', () => {
  it('E1 — the table still carries SEVEN rows, reads MATCH 7/7, and neither file this unit writes is among them', () => {
    const rows = recordedDigests()
    expect(rows.length, 'the register’s table is SEVEN rows (`P-TH-SM-1 (f)`); this unit may not add to it').toBe(7)
    const readings = digestReading()
    expect(
      readings.filter((r) => !r.matches),
      '⟨U-1c⟩ NO pinned byte may move: every recorded row must still equal its RECORDED digest — a mismatch here means a re-record is owed and this unit is not licensed to make one (STOP and report)',
    ).toEqual([])
    const subjects = rows.map((r) => r.file)
    expect(subjects, '…and the two files this unit writes are NOT pinned rows — which is why the carrier move owes no re-record').not.toContain('src/renderer/theme.ts')
    expect(subjects).not.toContain('src/renderer/index.html')
    expect(subjects, 'the seven paths are distinct (a duplicated row would make 7 rows carry fewer than 7 subjects)').toEqual([...new Set(subjects)])
  })

  it('E2 — the digest oracle discriminates: a ONE-BYTE perturbation of a recorded subject must FAIL it', () => {
    const sample = recordedDigests()[0]!
    const bytes = readFileSync(join(REPO_ROOT, sample.file))
    expect(createHash('md5').update(bytes).digest('hex'), 'the real bytes must PASS the recorded digest, else the pin is vacuous').toBe(sample.md5)
    const perturbed = Buffer.concat([bytes.subarray(0, 5), Buffer.from(bytes[5] === 0x58 ? 'Y' : 'X'), bytes.subarray(6)])
    expect(createHash('md5').update(perturbed).digest('hex'), 'a synthetic COMMITTED change MUST fail the same oracle').not.toBe(sample.md5)
  })
})
