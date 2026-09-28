// tests/pd-ui-1-theme-register.test.ts — unit `PD-UI-1` (THE THEME UNIT, wave `W1`):
// the register rows whose subject is the PIN/TOKEN/PERSISTENCE SAFETY of the adoption and
// the vendored bytes' non-touch — `P-TH-IM-4` (a)/(b), `P-TH-SM-1`, `P-TH-SM-2` — plus the
// register's ARITHMETIC, printed with its terms.
//
// The unit's other five register rows live in `tests/pd-ui-1-theme-adoption.test.ts`
// (`P-TH-IM-1` · `P-TH-IM-2` · `P-TH-TP-1` · `P-TH-TP-2` · `P-TH-TP-3`), so the register is
// spread across the unit's TWO files exactly as `PD-VENDOR`'s is spread across three.
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-pd-ui-1-theme.md
//     §1.2 (c)   the token block, the persisted `theme` carrier and the boot wiring's
//                structure are KEPT, unchanged, OUTSIDE this unit's write set
//     §1.4       the ALLOWED surface (`src/renderer/theme.ts`, `src/renderer/renderer.ts`)
//                and the DENIED surface (every `src/shared/**` byte — the vendored module
//                and the four divergent baseline files; `vitest.config.ts`; `package.json`;
//                `scripts/**`; `src/main/markdown-import.ts`; the two fence files)
//     §2.1       the adapter's import census (EXACTLY one statement → `src/shared/theme.ts`)
//     §2.4       the prohibitions the adoption carries (never relaxed)
//     §3.1       the vendored module's declared records
//     §4         the typed register: `P-TH-IM-4` (6 = 4 facts + 2 controls),
//                `P-TH-SM-1` (8 = 6 pin classes + 2 controls), `P-TH-SM-2` (8 = 3 facts × 2
//                readings + 2 controls); the shared machinery: seed `0x20260928`, a
//                hand-rolled 32-bit LCG (`stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`,
//                `index = stateₙ₊₁ mod pool.length`), ≤100 attempts/row, rows sequential in
//                register order, STOP AFTER 5 CONSECUTIVE FAILURES, every row carrying a
//                control whose expected outcome is the OPPOSITE of the row's verdict
//     §4 tally   `20 + 26 + 59 + 20 + 26 + 6 + 8 + 8 = 173` attempts, printed with its terms;
//                `173 ≤ 120` is FALSE and the overshoot is DECLARED with the route taken
//     §6.3       this unit retires NO test and archives NO file
//     §6.4       the `[T]`-side obligations: no `'electron'` mock (the protected census
//                pins the exact five-name set); nothing a `G-9` pin freezes is written;
//                census-stable titles; the terms printed as their sums
//   docs/specs/pd-ui-1-adoption-dossier.md
//     §1 rows 1–8 · `C-1`..`C-7`  the adopted identifiers and the collision reconciliations
//     `A-1`                       the blocking `PD-VENDOR` pin re-statement (Task 2 of this
//                                 red set; performed in `tests/pd-vendor-set.test.ts`, in the
//                                 SAME commit as the unit's implementation)
//
// LAYER (RCA-12): `[T]` / source-layer. Byte-identity, a digest, a source-text census and a
// `git`-recorded provenance read prove the PIN and the ABSENCES — they do NOT prove that any
// consumer works, that an attribute was applied, that a stylesheet reacted, or that the app
// renders. NOTHING here is app-green.
//
// RED-FIRST (RCA-1): at this head the adapter does NOT import the vendored module
// (`P-TH-IM-4` (d) reads `0` and must read `1`), and the adapter does not yet READ the
// vendored declaration's `removal` member (`P-TH-IM-4` (c)), so those rows are RED and name
// the adapter as the site. The protection rows (`P-TH-SM-1`, `P-TH-SM-2`) read the
// pre-landing tree and become the unit's regression guard (§6.1 order 4).
//
// `G-9`/`X-9` PIN SAFETY: this file mocks NOTHING (in particular never `'electron'`, in any
// access form), and it READS `vitest.config.ts` / `package.json` / `src/main/markdown-import.ts`
// only as the SUBJECTS of the protection rows — it writes no pinned byte and edits no config.

import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// `typescript` is an EXISTING devDependency (the sibling pd-vendor rows use it) — no new
// dependency is added (§4's machinery forbids one; no sixth leg).
import ts from 'typescript'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const SET_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-vendor-set.test.ts')
const MANIFEST_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')
const ADAPTER_PATH = join(REPO_ROOT, 'src', 'renderer', 'theme.ts')
const VENDORED_PATH = join(REPO_ROOT, 'src', 'shared', 'theme.ts')
const INDEX_HTML_PATH = join(REPO_ROOT, 'src', 'renderer', 'index.html')
const REGISTER_SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-pd-ui-1-theme.md')

/** §4's shared machinery — the pinned seed, a fixed literal in the test file: never
 *  `Date.now()`, never `Math.random()`, never an environment read. */
const REGISTER_SEED = 0x20260928

/** §1.2 (c) — the fifteen token NAMES the token block declares (a census, never a value
 *  claim: this unit changes no token value). */
const PINNED_TOKENS = [
  '--bg',
  '--fg',
  '--muted',
  '--muted-2',
  '--muted-3',
  '--muted-4',
  '--card-bg',
  '--border',
  '--border-strong',
  '--input-bg',
  '--input-fg',
  '--input-border',
  '--error',
  '--accent',
  '--hover',
] as const

/** §4 `P-TH-SM-1` (c) — the five names the protected bridge-mock census pins (derived
 *  here by scanning `tests/**` for the mock call, so a SIXTH joiner reds the row). */
const PINNED_BRIDGE_MOCK_CENSUS = [
  'template-adversarial.test.ts',
  'unit-live11-bridge-seams.test.ts',
  'unit-u5-rich-commit-ipc.test.ts',
  'unit-v5-bridge-capture.test.ts',
  'unit-wave-1-bridge-wiring.test.ts',
]

/** §4 `P-TH-SM-1` (e)/(f) and §1.2 (c) — the files whose bytes must NOT move. */
const UNTOUCHED_BY_THE_LANDING = [
  'src/shared/types.ts',
  'src/main/operator-settings-store.ts',
  'src/main/preload.ts',
  'src/renderer/sidebar-panes.ts',
  'src/shared/demo-envelope.ts',
  'src/shared/dom-shim.ts',
  'src/shared/path-fork-cycle.ts',
]

// ===========================================================================
// §4's pinned machinery: the hand-rolled 32-bit LCG, one step per draw.
// ===========================================================================
function lcgDraw(state: number, poolSize: number): { state: number; index: number } {
  const next = (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0
  return { state: next, index: next % poolSize }
}

// ===========================================================================
// The pinned fifteen (read out of the landing pin, never re-typed) and the two
// import-census readers this register's rows drive.
// ===========================================================================
function pinnedFifteenFromPin(): string[] {
  expect(existsSync(SET_PIN_PATH), `RED (PD-UI-1 §2.3): the pin ${SET_PIN_PATH} does not exist — the vendored member set is DERIVED from it`).toBe(true)
  const text = readFileSync(SET_PIN_PATH, 'utf8')
  const block = /const PINNED_FIFTEEN = \[([\s\S]*?)\] as const/.exec(text)
  expect(block, `RED (PD-UI-1 §4): ${SET_PIN_PATH} no longer carries \`const PINNED_FIFTEEN = [ … ] as const\``).not.toBeNull()
  const names = [...block![1]!.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]!)
  expect(names.length, 'the pin’s fifteen-name list must carry fifteen names').toBe(15)
  return names
}

const PINNED_FIFTEEN = pinnedFifteenFromPin()
const VENDORED_PATHS = new Set(PINNED_FIFTEEN.map((n) => resolve(join(REPO_ROOT, 'src', 'shared', `${n}.ts`))))

/** Every import-shaped construct in a source text, by AST — the static `from` form plus the
 *  three forms that evade a text scan (§9 item 1's refused evasion route). */
function importHits(src: string, file: string): Array<{ specifier: string; kind: string }> {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const stemSuffix = new RegExp(`(?:^|/)(${PINNED_FIFTEEN.join('|')})\\.js$`)
  const out: Array<{ specifier: string; kind: string }> = []
  const push = (spec: string, kind: string): void => {
    if (!stemSuffix.test(spec)) return
    out.push({ specifier: spec, kind })
  }
  const walk = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) push(node.moduleSpecifier.text, 'static-from')
    if (ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined && ts.isStringLiteralLike(node.moduleSpecifier)) push(node.moduleSpecifier.text, 'static-from')
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      if (ts.isIdentifier(callee) && callee.text === 'require') {
        const arg = node.arguments[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'require')
      }
      if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'resolve') {
        const arg = node.arguments[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'new-URL')
      }
    }
    if (ts.isNewExpression(node)) {
      const callee = node.expression
      if (ts.isIdentifier(callee) && callee.text === 'URL') {
        const arg = node.arguments?.[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'new-URL')
      }
    }
    // `import('…')` parses as an ImportExpression whose expression is the `import` keyword.
    // The TYPE-position form (`import('./x.js').T` inside a type annotation, which the repo’s
    // renderer files carry) is a separate TYPE node and is NOT a runtime edge.
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0]
      if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'dynamic-import')
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)
  return out
}

function resolveSpecifier(file: string, spec: string): string {
  if (!spec.startsWith('.')) return `<bare:${spec}>`
  return resolve(dirname(resolve(REPO_ROOT, file)), spec.replace(/\.(js|ts)$/, '.ts'))
}

// ---------------------------------------------------------------------------
// §4 `P-TH-SM-1` (a)/(b) — the two frozen config pins' oracles.
// ---------------------------------------------------------------------------
const FORBIDDEN_CONFIG = /(clearMocks|restoreMocks|mockReset|\bisolate\b|\bpool\b|poolOptions)\s*:/

/** The `'electron'`-mock census derivation (§4 `P-TH-SM-1` (c)): a `vi.mock('electron', …)`
 *  call, by any access form of the bound `vi` (an aliased or computed call joins it too). */
function electronMockFiles(root: string): string[] {
  const list = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = join(dir, e.name)
      if (e.isDirectory()) return list(p)
      return e.name.endsWith('.test.ts') ? [p] : []
    })
  const bindsElectronMock = (src: string): boolean => {
    const sf = ts.createSourceFile('scan.ts', src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    const aliases = new Set<string>(['vi'])
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
    let found = false
    const walk = (node: ts.Node): void => {
      if (found) return
      if (ts.isCallExpression(node)) {
        const callee = node.expression
        let bound = false
        if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
          bound = callee.name.text === 'mock' && aliases.has(callee.expression.text)
        } else if (ts.isElementAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
          const arg = callee.argumentExpression
          bound = arg !== undefined && ((ts.isStringLiteral(arg) && arg.text === 'mock') || (ts.isIdentifier(arg) && arg.text === 'mock')) && aliases.has(callee.expression.text)
        }
        if (bound) {
          const first = node.arguments[0]
          if (first !== undefined && ts.isStringLiteral(first) && first.text === 'electron') {
            found = true
            return
          }
        }
      }
      ts.forEachChild(node, walk)
    }
    walk(sf)
    return found
  }
  return list(root)
    .filter((f) => bindsElectronMock(readFileSync(f, 'utf8')))
    .map((f) => relative(REPO_ROOT, f).split('\\').join('/'))
    .sort()
}

// ---------------------------------------------------------------------------
// §4 `P-TH-SM-1` (d) — `src/main/markdown-import.ts`'s source contract, read the way the
// protected pin's own row reads it (ONE `.applyBatch(`, putNode before putEdge, no per-op
// persist). This is a READ of a pinned subject; the register writes no byte of it.
// ---------------------------------------------------------------------------
function applyBatchCalls(text: string): number {
  return [...text.matchAll(/\.applyBatch\(/g)].length
}
function perOpPersistSites(text: string): string[] {
  return [...text.matchAll(/\bstore\s*\.\s*(putNode|putEdge|put)\s*\(/g)].map((m) => m[0])
}
function putNodeBeforePutEdge(text: string): boolean {
  const node = text.indexOf("op: 'putNode'")
  const edge = text.indexOf("op: 'putEdge'")
  return node >= 0 && edge >= 0 && node < edge
}

// ---------------------------------------------------------------------------
// §4 `P-TH-SM-1` (e) / `P-TH-SM-2` (a) — the token census, read STRUCTURALLY from the CSS
// (a selector block's own declarations), with an ORACLE function so the controls drive the
// SAME reader over a synthetic corpus.
// ---------------------------------------------------------------------------
function cssBlock(css: string, selectorPattern: RegExp): string | null {
  // CSS COMMENTS ARE STRIPPED FIRST: the token block’s own comment NAMES
  // `html[data-theme='dark']` in prose, so an un-stripped read picks the comment up as if it
  // were the selector and reports the NEXT block’s braces.
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, (c) => ' '.repeat(c.length))
  const m = selectorPattern.exec(stripped)
  if (m === null) return null
  const start = stripped.indexOf('{', m.index)
  if (start < 0) return null
  let depth = 1
  for (let i = start + 1; i < css.length; i++) {
    const ch = css[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return `${m.index}|${start}|${stripped.slice(start + 1, i)}`
    }
  }
  return null
}
function customPropertiesIn(body: string): string[] {
  return [...body.matchAll(/(--[A-Za-z0-9-]+)\s*:/g)].map((m) => m[1]!)
}
/** The oracle: `[rootIndex, rootNames, darkNames]`, or `null` when a required block is absent. */
function tokenBlockOracle(css: string): { rootIndex: number; darkIndex: number; root: string[]; dark: string[]; mediaPresent: boolean; media: string[] } | null {
  const root = cssBlock(css, /:root\s*,\s*html\[data-theme='light'\]/)
  const dark = cssBlock(css, /html\[data-theme='dark'\]/)
  const media = cssBlock(css, /@media\s*\(prefers-color-scheme:\s*dark\)/)
  if (root === null || dark === null) return null
  const mediaPresent = media !== null
  /** `selectorIndex|braceIndex|body` → the part wanted */
  const part = (payload: string, i: number): string => payload.split('|').slice(i).join('|')
  return {
    rootIndex: Number(part(root, 1).split('|')[0]),
    darkIndex: Number(part(dark, 1).split('|')[0]),
    root: [...new Set(customPropertiesIn(part(root, 2)))],
    dark: [...new Set(customPropertiesIn(part(dark, 2)))],
    mediaPresent,
    media: mediaPresent ? [...new Set(customPropertiesIn(part(media!, 2)))] : [],
  }
}

// ---------------------------------------------------------------------------
// §4 `P-TH-SM-2` (b)/(c) — the no-store / no-write-back token scan over this unit's write
// set, and the persistence carrier's byte-identity (`git` is the durable record).
// ---------------------------------------------------------------------------
const STORE_TOKENS = /localStorage|sessionStorage|\bnew Map\(\)|\bnew Set\(\)|\bmemo\b|\bcache\b|createStore/
const WRITE_BACK_TOKENS = /operatorSettings(?:\?\.)*\s*set(?:\?\.)*\s*\(|operatorSet\s*\(/

/** `installTheme`'s BODY, read STRUCTURALLY (braces-balanced from its declaration):
 *  `installTheme` is module-private and NOT exported (§2.2 item 1), so its contract is read
 *  as source, never by importing it. */
function installThemeBodyText(): string {
  const path = join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')
  expect(existsSync(path), `RED (PD-UI-1 §2.2): ${path} does not exist`).toBe(true)
  const text = readFileSync(path, 'utf8')
  const m = /function installTheme\(\): void \{/.exec(text)
  expect(m, 'RED (PD-UI-1 §2.2 item 1): `function installTheme(): void` is absent — the wiring contract cannot be read').not.toBeNull()
  const start = m!.index + m![0].length
  let depth = 1
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return text.slice(start, i)
    }
  }
  throw new Error('RED (PD-UI-1 §2.2): the `installTheme` body is unbalanced — the contract cannot be read')
}

// ===========================================================================
// §4 `P-TH-IM-4` — THE VENDORED MODULE IS CONSUMED, NOT TOUCHED
// (6 = 4 facts × 1 reading + 2 independent controls)
// ===========================================================================
describe('§4 P-TH-IM-4 — the vendored module is consumed, not touched (strat:theme-vendored-consumption)', () => {
  /** (a) the digest: the vendored bytes equal the manifest's `md5` for `theme`. */
  function digestOf(): { file: string; manifest: string } | null {
    if (!existsSync(MANIFEST_PATH) || !existsSync(VENDORED_PATH)) return null
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as { modules: Array<Record<string, unknown>> }
    const entry = manifest.modules.find((m) => String(m.name) === 'theme')
    if (entry === undefined) return null
    return { file: createHash('md5').update(readFileSync(VENDORED_PATH)).digest('hex'), manifest: String(entry.md5) }
  }

  it('P-TH-IM-4 (a) — the vendored bytes match the manifest’s `theme` md5 (the Phase-0 digest pin, unchanged by this unit)', () => {
    const d = digestOf()
    expect(d, `RED (PD-UI-1 §4 P-TH-IM-4 (a)): the manifest ${MANIFEST_PATH} or the vendored ${VENDORED_PATH} is absent`).not.toBeNull()
    expect(
      d!.file,
      '§4 P-TH-IM-4 (a) / R-4: a change to a vendored byte is a PIN VIOLATION, not a cleanup — the adoption wraps, never patches',
    ).toBe(d!.manifest)
  })

  it('P-TH-IM-4 (b) — the vendored bytes still carry ZERO imports and none of the four prohibited forms', () => {
    const bytes = readFileSync(VENDORED_PATH, 'utf8')
    expect(importHits(bytes, 'src/shared/theme.ts'), '§4 P-TH-IM-4 (b): the vendored module’s import census is EMPTY (R-2)').toEqual([])
    expect(bytes, '§4 P-TH-IM-4 (b): no `data-theme` literal in the mechanism (P-TH-7)').not.toMatch(/data-theme/)
    expect(bytes, '§4 P-TH-IM-4 (b): no `matchMedia` / `prefers-color-scheme` in the mechanism (P-TH-8)').not.toMatch(/matchMedia|prefers-color-scheme/)
    expect(bytes, '§4 P-TH-IM-4 (b): no store token in the mechanism (P-TH-4/P-TH-11)').not.toMatch(STORE_TOKENS)
    expect(bytes, '§4 P-TH-IM-4 (b): no ambient realm access in the mechanism (P-TH-9)').not.toMatch(/\bdocument\b|\bwindow\b|\bfs\b/)
  })

  it('P-TH-IM-4 (c) — the prohibitions survive the adoption: the adapter does not ask the mechanism for a decision, a default, state or a persistence write', () => {
    expect(existsSync(ADAPTER_PATH), `RED (PD-UI-1 §2.1): the adapter ${ADAPTER_PATH} does not exist`).toBe(true)
    // Comments stripped: the adapter’s own PROSE names the things it does not do (its header
    // says the vendored module is "never read here" and the file documents the mechanism). A
    // token in a comment is documentation; a token in code is the contract.
    const text = readFileSync(ADAPTER_PATH, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .split('\n')
      .map((l) => l.replace(/\/\/.*$/, ''))
      .join('\n')
    // the attribute name is the CALLER's (P-TH-7) and is passed IN as data
    expect(text, '§2.1 item 2: the one write site’s attribute name is the fork’s own `\'theme\'` token, passed as the caller’s argument').toMatch(/applyThemeDeclaration\s*\(\s*'theme'/)
    // the adapter READS the vendored resolution’s `prefersDark` member (the ENV READING half
    // of the adoption) — reading the raw argument instead is the corpus §3a `ADV-T4` names.
    expect(text, '§2.1’s NEW internal duty: the adapter must READ the vendored record’s `prefersDark` member rather than hand the raw boolean on').toMatch(/\.prefersDark\b/)
    // the adapter READS the write record’s `removal` member: an unread record is a silent divergence (§2.1 item 3)
    expect(text, '§2.1 item 3: the adapter must honour the declared write record’s `removal` member (§3.2 item 5)').toMatch(/\.removal\b/)
    // no store, no default asked of the mechanism, no sibling imported into it
    expect(text, '§2.4: the adapter asks the mechanism for no default and holds no store').not.toMatch(STORE_TOKENS)
    expect(text, '§2.4 / P-TH-12: no sibling is imported into the mechanism, and the mechanism is never re-exported by the adapter').not.toMatch(/export\s+\{[^}]*\}\s+from\s+['"][^'"]*shared\/theme/)
  })

  it('P-TH-IM-4 (d) — the adapter’s import census is EXACTLY ONE statement, resolving to src/shared/theme.ts', () => {
    expect(existsSync(ADAPTER_PATH), `RED (PD-UI-1 §2.1): the adapter ${ADAPTER_PATH} does not exist`).toBe(true)
    const hits = importHits(readFileSync(ADAPTER_PATH, 'utf8'), 'src/renderer/theme.ts')
    expect(
      hits.map((h) => `${h.specifier} (${h.kind}) → ${relative(REPO_ROOT, resolveSpecifier('src/renderer/theme.ts', h.specifier)).split('\\').join('/')}`),
      'RED (PD-UI-1 §4 P-TH-IM-4 (d)): the census reads 0 at the red head and must read 1 — and the ONE statement must RESOLVE to the vendored `src/shared/theme.ts`, never to a sibling or a bare specifier. §2.1’s own census clause: *"the row asserts the RESOLVED path, never a spelling"*',
    ).toEqual(['../shared/theme.js (static-from) → src/shared/theme.ts'])
    expect(
      VENDORED_PATHS.has(resolveSpecifier('src/renderer/theme.ts', hits[0]!.specifier)),
      'the census’s one hit must resolve to a VENDORED member (the RESOLVED path is the predicate)',
    ).toBe(true)
  })

  it('P-TH-IM-4 CONTROLS — a ONE-BYTE perturbation fails the digest limb and does NOT change the census limb; a zero-import adapter fails the census limb alone', () => {
    // control 1: the by-byte perturbation — the two limbs must be INDEPENDENTLY falsifiable.
    const bytes = readFileSync(VENDORED_PATH, 'utf8')
    const perturbed = bytes.slice(0, 20) + (bytes[20] === 'x' ? 'y' : 'x') + bytes.slice(21)
    const md5 = (t: string): string => createHash('md5').update(t).digest('hex')
    expect(perturbed, 'the synthetic perturbation must really change the bytes').not.toBe(bytes)
    expect(md5(perturbed), 'a ONE-BYTE perturbation MUST fail P-TH-IM-4 (a)').not.toBe(md5(bytes))
    expect(
      importHits(perturbed, 'src/shared/theme.ts'),
      '…and MUST NOT change P-TH-IM-4 (b)’s census reading, so the two limbs are distinguishable',
    ).toEqual(importHits(bytes, 'src/shared/theme.ts'))
    // control 2: an adapter that stops importing the module — §3a `ADV-T4`’s strongest false-green.
    const zeroImportAdapter = `export function resolveTheme(setting: unknown, prefersDark: boolean): 'light' | 'dark' {\n  if (setting === 'light') return 'light'\n  if (setting === 'dark') return 'dark'\n  return prefersDark ? 'dark' : 'light'\n}\n`
    expect(importHits(zeroImportAdapter, 'src/renderer/theme.ts'), 'an adapter with ZERO imports MUST fail the (d) limb').toEqual([])
    // …and the census oracle is not vacuous: it sees the static form AND the three refused forms.
    const forms = [
      `import { resolveTheme } from '../shared/theme.js'\n`,
      `const later = () => import('../shared/theme.js')\n`,
      `const legacy = require('../shared/theme.js')\n`,
      `const p = new URL('../shared/theme.js', import.meta.url)\n`,
    ]
    for (const form of forms) {
      expect(importHits(form, 'src/renderer/theme.ts'), `the census oracle must SEE the refused form ${form.trim()}`).toHaveLength(1)
    }
    expect(
      importHits(`const fixture = "import { X } from '../shared/theme.js'"\n`, 'src/renderer/theme.ts'),
      'a construct inside a STRING must not be a hit — an AST census is not a text scan',
    ).toEqual([])
  })

  it('P-TH-IM-4 — the register’s term is printed as the sum of its factors: 4 facts × 1 reading + 2 independent controls = 6', () => {
    expect(4 * 1 + 2, '§4 P-TH-IM-4: 4 + 2 = 6').toBe(6)
  })
})

// ===========================================================================
// §4 `P-TH-SM-1` — NO `G-9`-PINNED ARTIFACT AND NO PROTECTED FILE IS DISTURBED
// (8 = 6 pin classes × 1 reading + 2 controls)
// ===========================================================================
describe('§4 P-TH-SM-1 — nothing G-9-pinned is disturbed (strat:theme-protected-pin-safety)', () => {
  const PIN_CLASSES = ['vitest.config.testTimeout', 'package.json test scripts', 'the protected bridge-mock census', 'src/main/markdown-import.ts source contract', 'src/renderer/index.html token census', 'the persisted theme carrier’s byte-identity']

  it('P-TH-SM-1 (a) — `vitest.config.ts`’s `testTimeout` reads EXACTLY 15_000 (floor AND ceiling) and the file carries no forbidden override', () => {
    const text = readFileSync(join(REPO_ROOT, 'vitest.config.ts'), 'utf8')
    const m = /testTimeout\s*:\s*([0-9_]+)/.exec(text)
    expect(m, '§1.4 / G-9: the pinned test budget row is gone').not.toBeNull()
    expect(Number(m![1]!.replace(/_/g, '')), 'the pinned budget is EXACTLY 15 000 — floor AND ceiling, both asserted').toBe(15_000)
    expect(text, '§1.4: an edit of ANY kind to `vitest.config.ts` is a protected-pin violation — a wave that wants headroom cannot buy it here (K-6)').not.toMatch(FORBIDDEN_CONFIG)
  })

  it('P-TH-SM-1 (b) — `package.json`’s `scripts.test` / `scripts.test:watch` are the pinned values with no `--testTimeout`', () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> }
    expect(pkg.scripts.test).toBe('vitest run')
    expect(pkg.scripts['test:watch']).toBe('vitest')
    expect(pkg.scripts.test, '§1.4: this unit adds no script, no dependency and no leg — and no `--testTimeout` override').not.toMatch(/--testTimeout/)
    expect(pkg.scripts['test:watch']!).not.toMatch(/--testTimeout/)
  })

  it('P-TH-SM-1 (c) — the DERIVED bridge-mock census is EXACTLY the five pinned names, and neither of this unit’s two files joins it', () => {
    const derived = electronMockFiles(join(REPO_ROOT, 'tests'))
    expect(derived.length, 'the census is EMPTY — a pin that scans nothing is not evidence').toBeGreaterThan(0)
    expect(derived.map((f) => f.replace(/^tests\//, '')), '§4 P-TH-SM-1 (c): the census is exactly the five pinned names, DERIVED (never hard-coded)').toEqual(PINNED_BRIDGE_MOCK_CENSUS)
    expect(
      derived.filter((f) => /pd-ui-1-theme/.test(f)),
      '§1.4 / §6.4 item 1 / `K-2`: no file this unit adds may mock `\'electron\'` in any access form — a sixth joiner reds the protected census AND this row',
    ).toEqual([])
  })

  it('P-TH-SM-1 (d) — `src/main/markdown-import.ts` satisfies its source contract (ONE `.applyBatch(`, putNode before putEdge, no per-op persist)', () => {
    const path = join(REPO_ROOT, 'src', 'main', 'markdown-import.ts')
    expect(existsSync(path), `RED (PD-UI-1 §1.4): the protected ${path} does not exist`).toBe(true)
    const text = readFileSync(path, 'utf8')
    expect(applyBatchCalls(text), '§1.4: exactly ONE `.applyBatch(` on the production import path').toBe(1)
    expect(perOpPersistSites(text), '§1.4: NO per-op `store.putNode(`/`store.putEdge(`/`store.put(` — the corpus is applied as ONE atomic batch').toEqual([])
    expect(putNodeBeforePutEdge(text), '§1.4: the `op: \'putNode\'` literal precedes `op: \'putEdge\'` (all putNode ops before all putEdge ops)').toBe(true)
  })

  it('P-TH-SM-1 (e) — `src/renderer/index.html`’s 15 token names, its two `html[data-theme=…]` selectors and its `@media` fallback are unchanged', () => {
    const css = readFileSync(INDEX_HTML_PATH, 'utf8')
    const block = tokenBlockOracle(css)
    expect(block, '§1.2 (c) / R-3: the token block’s `:root, html[data-theme=\'light\']` block and its `html[data-theme=\'dark\']` block must both be present').not.toBeNull()
    expect([...block!.root].sort(), '§1.2 (c) / §4 P-TH-SM-2 (a): the `:root` block declares EXACTLY the 15 pinned custom-property names (a CENSUS, never a value claim)').toEqual([...PINNED_TOKENS].sort())
    expect([...block!.dark].sort(), '§4 P-TH-SM-2 (a): each of the 15 names is also declared in the `html[data-theme=\'dark\']` block').toEqual([...PINNED_TOKENS].sort())
    expect(block!.mediaPresent, '§1.2 (c): the `@media (prefers-color-scheme: dark)` fallback is present').toBe(true)
    expect(
      block!.media.length,
      '§1.2 (c): the fallback redeclares the same fifteen names (a census, not a value claim) — the block is KEPT unchanged by this unit',
    ).toBe(15)
    expect(
      block!.rootIndex,
      '§1.2 (c): the `:root, html[data-theme=\'light\']` block precedes the `html[data-theme=\'dark\']` override, so an explicit attribute still wins by specificity',
    ).toBeLessThan(block!.darkIndex)
  })

  it('P-TH-SM-1 (f) — the persisted `theme` carrier and the boot wiring’s non-theme neighbours are byte-UNCHANGED by the landing (`git` is the durable record)', () => {
    const status = spawnSync('git', ['-C', REPO_ROOT, 'status', '--porcelain', '--', ...UNTOUCHED_BY_THE_LANDING], { encoding: 'utf8' })
    expect(status.status, `could not read \`git status\` for the untouched surface — ${(status.stderr ?? '').trim()}`).toBe(0)
    expect(
      (status.stdout as string).trim(),
      '§1.2 (c) / §1.4: the persisted carrier (`ThemeSetting`, `coerceTheme`, the `operatorSettings` bridge) and the denied files must carry NO working-tree change against this head',
    ).toBe('')
  })

  it('P-TH-SM-1 — the register’s term is printed as the sum of its factors: 6 pin classes × 1 reading + 2 controls = 8', () => {
    expect(PIN_CLASSES.length, '§4: the six pin classes are enumerated exactly').toBe(6)
    expect(6 * 1 + 2, '§4 P-TH-SM-1: 6 + 2 = 8').toBe(8)
  })

  it('P-TH-SM-1 CONTROLS — a synthetic config override FAILS the text oracle, and a synthetic `vi.mock(\'electron\', …)` corpus JOINS the census (it is DERIVED, not hard-coded)', () => {
    expect(FORBIDDEN_CONFIG.test('test: { clearMocks: false }'), 'a synthetic `clearMocks: false` config MUST fail P-TH-SM-1 (a)').toBe(true)
    expect(FORBIDDEN_CONFIG.test('test: { testTimeout: 15_000 }'), 'the real config shape must PASS the same oracle, else the control proves nothing').toBe(false)
    // the second control, driven through the SAME census reader on a synthetic corpus —
    // never by writing a file into `tests/**` (which would mutate the tree under test).
    const synthetic = `import { vi } from 'vitest'\nvi.mock('electron', () => ({ ipcRenderer: {} }))\nit('x', () => {})\n`
    const fixture = `const s = "vi.mock('electron', () => ({}))"\nit('x', () => {})\n`
    expect(electronMockFilesFromCorpora([synthetic]), 'a synthetic `vi.mock(\'electron\', …)` corpus MUST join the census').toEqual(['<synthetic>'])
    expect(electronMockFilesFromCorpora([fixture]), 'a construct inside a STRING fixture MUST NOT join the census').toEqual([])
    expect(electronMockFilesFromCorpora([synthetic, fixture]).length, 'the derived count must move with the corpus, so the census is not hard-coded').toBe(1)
  })
})

/** The census reader, driven over synthetic corpora: the SAME derivation the row above uses,
 *  so the control is over the reader and not over a copy of it. */
function electronMockFilesFromCorpora(corpora: string[]): string[] {
  const binds = (src: string): boolean => {
    const sf = ts.createSourceFile('scan.ts', src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    let found = false
    const walk = (node: ts.Node): void => {
      if (found) return
      if (ts.isCallExpression(node)) {
        const callee = node.expression
        if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'mock' && ts.isIdentifier(callee.expression)) {
          const first = node.arguments[0]
          if (first !== undefined && ts.isStringLiteral(first) && first.text === 'electron') {
            found = true
            return
          }
        }
      }
      ts.forEachChild(node, walk)
    }
    walk(sf)
    return found
  }
  return corpora.map((c, i) => ({ c, i })).filter(({ c }) => binds(c)).map(() => '<synthetic>')
}

// ===========================================================================
// §4 `P-TH-SM-2` — THE TOKEN BLOCK AND THE PERSISTENCE CONTRACT ARE UNTOUCHED, AND
// THE THEME IS NOT REPERSISTED BY THIS UNIT
// (8 = 3 facts × 2 readings + 2 controls; `(bounded) ON (b)`)
// ===========================================================================
describe('§4 P-TH-SM-2 — the token/persistence safety of the adoption (strat:theme-token-and-persistence-safety)', () => {
  it('P-TH-SM-2 (a) — the token census and its VALUE-INDEPENDENCE: the same 15 names in both blocks, and no value claim is made', () => {
    const css = readFileSync(INDEX_HTML_PATH, 'utf8')
    const block = tokenBlockOracle(css)
    expect(block, 'the token block’s two selector blocks must be present').not.toBeNull()
    expect([...block!.root].sort(), 'the token census is exactly the 15 pinned names').toEqual([...PINNED_TOKENS].sort())
    expect(
      [...block!.dark].sort(),
      'each name is declared in the dark override too — the census is NAME-level: this unit makes NO value claim (§1.2 (c): the token block is unchanged)',
    ).toEqual([...PINNED_TOKENS].sort())
  })

  it('P-TH-SM-2 (b) — the no-store scan over this unit’s write set: no `localStorage`/`sessionStorage`/store/cache/memo token rides the theme path (`(bounded)`: a token scan is not a runtime proof)', () => {
    expect(existsSync(ADAPTER_PATH), `RED (PD-UI-1 §2.1): the adapter ${ADAPTER_PATH} does not exist`).toBe(true)
    const adapterCode = readFileSync(ADAPTER_PATH, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .split('\n')
      .map((l) => l.replace(/\/\/.*$/, ''))
      .join('\n')
    // `(bounded) ON (b)`: a token scan over the write set cannot prove the absence of a store
    // at runtime — a store reached through an alias or a helper would not be seen.
    expect(adapterCode, '§4 P-TH-SM-2 (b): the adapter holds no store — a store addition is a NEW GATE (R-5)').not.toMatch(STORE_TOKENS)
    const wiring = readFileSync(join(REPO_ROOT, 'src', 'renderer', 'renderer.ts'), 'utf8')
    expect(wiring, 'RED (PD-UI-1 §2.2 item 2): the `matchMedia` read belongs to the WIRING').toMatch(/matchMedia\(\s*'\(prefers-color-scheme: dark\)'\s*\)/)
    expect(installThemeBodyText(), '§4 P-TH-SM-2 (b): the theme boot path holds no store, cache or memo').not.toMatch(STORE_TOKENS)
  })

  it('P-TH-SM-2 (c) — the persistence surface’s ABSENCE and the carrier’s byte-identity: `installTheme` reads the setting and writes NOTHING back', () => {
    expect(
      installThemeBodyText(),
      '§4 P-TH-SM-2 (c): the theme path performs NO `operatorSettings.set(...)` / `operatorSet(...)` write-back — the persisted setting is read-only here (R-5)',
    ).not.toMatch(WRITE_BACK_TOKENS)
    const status = spawnSync('git', ['-C', REPO_ROOT, 'status', '--porcelain', '--', 'src/shared/types.ts', 'src/main/operator-settings-store.ts'], { encoding: 'utf8' })
    expect(status.status).toBe(0)
    expect(
      (status.stdout as string).trim(),
      '§4 P-TH-SM-2 (c) / R-5: the persisted `theme` carrier (`src/shared/types.ts` `ThemeSetting`, `coerceTheme`) is byte-unchanged',
    ).toBe('')
  })

  it('P-TH-SM-2 — the register’s term is printed as the sum of its factors: 3 facts × 2 readings + 2 controls = 8', () => {
    expect(3 * 2 + 2, '§4 P-TH-SM-2: 6 + 2 = 8').toBe(8)
  })

  it('P-TH-SM-2 CONTROLS — a synthetic token corpus dropping ONE name FAILS the census oracle, and a synthetic theme path calling `operatorSet({ theme })` FAILS the no-write-back oracle', () => {
    const real = readFileSync(INDEX_HTML_PATH, 'utf8')
    const dropped = real.replace('--hover: rgba(15, 23, 42, 0.06);', '')
    const realBlock = tokenBlockOracle(real)
    const droppedBlock = tokenBlockOracle(dropped)
    expect(realBlock, 'the real token corpus must parse, else the control proves nothing').not.toBeNull()
    expect(droppedBlock, 'the synthetic corpus must still parse').not.toBeNull()
    expect(realBlock!.root.length, 'the real corpus declares 15 names').toBe(15)
    expect(droppedBlock!.root.length, 'a synthetic corpus DROPPING one token name MUST fail the census (14 ≠ 15)').toBe(14)
    expect([...droppedBlock!.root].sort(), '…and the dropped name must be NAMED, so the failure is loud').not.toEqual([...PINNED_TOKENS].sort())
    expect(
      WRITE_BACK_TOKENS.test('void themeBridge.operatorSettings?.set?.({ theme: resolved })'),
      'a synthetic theme path calling `operatorSettings.set({ theme })` MUST fail P-TH-SM-2 (c) — a persistence addition is a NEW GATE',
    ).toBe(true)
    expect(
      WRITE_BACK_TOKENS.test('s.operatorSet({ representationMode: mode })'),
      'the oracle must also see the in-tree `operatorSet(...)` shape (the sibling preference’s control, E-4)',
    ).toBe(true)
    expect(WRITE_BACK_TOKENS.test('void themeBridge.operatorSettings?.get?.()'), 'the READ must pass the same oracle').toBe(false)
  })
})

// ===========================================================================
// §4's ARITHMETIC — the attempt total, printed with its eight terms (the register
// spans the unit's two files; this file carries the accounting `A-13` requires).
// ===========================================================================
describe('§4 — the register’s arithmetic, printed with its terms', () => {
  /** The eight rows of §4's register table, with the file each row's drives land in. */
  const REGISTER_TERMS: Array<{ row: string; file: string; terms: string; total: number }> = [
    { row: 'P-TH-IM-1', file: 'pd-ui-1-theme-adoption.test.ts', terms: '4 setting shapes × 2 prefersDark values × 2 observations (identity + domain) = 16, + 4 controls', total: 4 * 2 * 2 + 4 },
    { row: 'P-TH-IM-2', file: 'pd-ui-1-theme-adoption.test.ts', terms: '11 env shapes × 2 observations = 22, + 4 controls', total: 11 * 2 + 4 },
    { row: 'P-TH-TP-1', file: 'pd-ui-1-theme-adoption.test.ts', terms: '12 setting shapes × 4 non-boolean readings = 48, + 3 root shapes × 3 settings = 9, + 2 controls', total: 12 * 4 + 3 * 3 + 2 },
    { row: 'P-TH-TP-2', file: 'pd-ui-1-theme-adoption.test.ts', terms: '4 setting shapes × 2 readings × 2 observations = 16, + 4 controls', total: 4 * 2 * 2 + 4 },
    { row: 'P-TH-TP-3', file: 'pd-ui-1-theme-adoption.test.ts', terms: '3 root shapes × 2 settings × 2 readings = 12 drives × 2 observations = 24, + 2 controls', total: 3 * 2 * 2 * 2 + 2 },
    { row: 'P-TH-IM-4', file: 'pd-ui-1-theme-register.test.ts', terms: '4 facts × 1 reading = 4, + 2 independent controls', total: 4 * 1 + 2 },
    { row: 'P-TH-SM-1', file: 'pd-ui-1-theme-register.test.ts', terms: '6 pin classes × 1 reading = 6, + 2 controls', total: 6 * 1 + 2 },
    { row: 'P-TH-SM-2', file: 'pd-ui-1-theme-register.test.ts', terms: '3 facts × 2 readings = 6, + 2 controls', total: 3 * 2 + 2 },
  ]

  it('§4 — the eight rows, each with its own term; every row ≤ 100; the total is the SUM OF ITS OWN TERMS', () => {
    expect(REGISTER_TERMS.length, '§4: the register is FULL at eight rows — the cap is ≤8 and a further row requires retiring one').toBe(8)
    const perRow = REGISTER_TERMS.map((r) => `${r.row}: ${r.terms} = ${r.total}`)
    expect(perRow, '§4: the per-row terms, printed in register order').toEqual([
      'P-TH-IM-1: 4 setting shapes × 2 prefersDark values × 2 observations (identity + domain) = 16, + 4 controls = 20',
      'P-TH-IM-2: 11 env shapes × 2 observations = 22, + 4 controls = 26',
      'P-TH-TP-1: 12 setting shapes × 4 non-boolean readings = 48, + 3 root shapes × 3 settings = 9, + 2 controls = 59',
      'P-TH-TP-2: 4 setting shapes × 2 readings × 2 observations = 16, + 4 controls = 20',
      'P-TH-TP-3: 3 root shapes × 2 settings × 2 readings = 12 drives × 2 observations = 24, + 2 controls = 26',
      'P-TH-IM-4: 4 facts × 1 reading = 4, + 2 independent controls = 6',
      'P-TH-SM-1: 6 pin classes × 1 reading = 6, + 2 controls = 8',
      'P-TH-SM-2: 3 facts × 2 readings = 6, + 2 controls = 8',
    ])
    for (const r of REGISTER_TERMS) {
      expect(r.total, `§4: ${r.row}’s term must be ≤ 100 (the largest is P-TH-TP-1 at 59)`).toBeLessThanOrEqual(100)
    }
    const total = REGISTER_TERMS.reduce((a, r) => a + r.total, 0)
    // eslint-disable-next-line no-console -- the register’s total is PRINTED with its terms (§4)
    console.log(`PD-UI-1 register: ${REGISTER_TERMS.map((r) => `${r.row}=${r.total}`).join(' + ')} = ${total} attempts`)
    expect(
      total,
      '§4: `20 + 26 + 59 + 20 + 26 + 6 + 8 + 8 = 173` — and `173 ≤ 120` is FALSE: the overshoot is DECLARED with this arithmetic and the route taken (route (b): keep the rows, declare the over-cap), NEVER resolved by dropping a row or trimming a term',
    ).toBe(173)
    expect(total, '§4 route (b): the declared total is over the ≤120 cap — stated, not smoothed').toBeGreaterThan(120)
  })

  it('§4 — the total is read back OUT OF the landed spec’s register table, so a term dropped from the table without a contract amendment is a LOUD failure', () => {
    expect(existsSync(REGISTER_SPEC_PATH), `RED (PD-UI-1 §4): the spec ${REGISTER_SPEC_PATH} does not exist`).toBe(true)
    const lines = readFileSync(REGISTER_SPEC_PATH, 'utf8').split('\n')
    const headerIndex = lines.findIndex((l) => /^\|\s*#\s*\|\s*Row id\b/.test(l))
    expect(headerIndex, '§4: the register table header `| # | Row id |` is absent — the register cannot be derived from a table that is not there').toBeGreaterThanOrEqual(0)
    const rows: Array<{ id: string; cells: string[] }> = []
    for (let i = headerIndex + 2; i < lines.length; i++) {
      const line = lines[i]!
      if (!line.startsWith('| ')) break
      // The row is read as cells, but the PROPERTY cell carries markdown tables of its own, so
      // its pipes make a naive split ragged. The attempts cell is therefore found by its own
      // FORM (`= <digits> [+ …] controls`), never by a pinned column index.
      const cells = line.split('|').slice(1, -1)
      const id = /\bP-TH-(?:IM|SM|TP)-\d+\b/.exec(cells[1] ?? '')
      expect(id, `§4: the register row "${line.slice(0, 40)}…" carries no \`P-TH-*\` row id`).not.toBeNull()
      rows.push({ id: id![0], cells })
    }
    expect(rows.map((r) => r.id), '§4: the register’s rows, in table order — the SAME eight ids this file accounts for').toEqual(
      REGISTER_TERMS.map((r) => r.row),
    )
    /** The attempts cell, found by its own FORM (`` `N`** = … ``) — the property cell carries
     *  markdown tables whose pipes make a positional read ragged. */
    const attemptsCell = (cells: string[]): string => cells.find((c) => /`\d+`\*\*\s*=/.test(c)) ?? ''
    // every row's cell list must carry its attempts term AS A SUM OF ITS FACTORS — an
    // expression with at least one operator and its `controls` term named — never a bare
    // literal (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`).
    const termless = rows.filter((r) => {
      // `| # | Row id | Property | Domain/strategy | Attempts | (bounded)? |` — read from the
      // RIGHT, never at a pinned index (a `|` inside a property cell makes the row ragged).
      const cell = attemptsCell(r.cells)
      return !(/[0-9]/.test(cell) && /(?:\*|×|\+)/.test(cell))
    })
    expect(termless.map((r) => r.id), '§4 `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`: a row whose cell carries no sum of factors is a review finding').toEqual([])
    // A SECOND, recorded reading: how many rows name their `controls` term EXPLICITLY. The
    // spec’s `P-TH-TP-1` cell writes its third addend as a bare `2` (`59 = 48 + 9 + 2`), so
    // three rows carry the controls term implicitly — RECORDED here as a reading rather than
    // smoothed away, and REPORTED to the supervisor as a documentation nit in the unit spec’s
    // `§4` table (no behaviour depends on it).
    const namesControlsExplicitly = rows.filter((r) => /controls/i.test(attemptsCell(r.cells))).map((r) => r.id)
    // eslint-disable-next-line no-console -- the reading is PRINTED rather than smoothed (§4)
    console.log(`PD-UI-1 register: ${namesControlsExplicitly.length} of ${rows.length} attempts cells name their controls term explicitly`)
    expect(
      namesControlsExplicitly,
      '§4: the rows whose attempts cell names its `controls` term explicitly — the complement is the IMPLICIT-controls set (a spec-table nit, recorded, never a row weakened)',
    ).toEqual(['P-TH-IM-1', 'P-TH-IM-2', 'P-TH-TP-2', 'P-TH-TP-3', 'P-TH-IM-4', 'P-TH-SM-1', 'P-TH-SM-2'])
    // …and the spec’s own printed total is the SUM OF ITS OWN TERMS: the eight printed counts
    // are added up and must equal `173`, so a term silently trimmed from a cell moves this
    // reading. The cell is located from the RIGHT — a `|` inside a property cell’s table makes
    // a naive split yield a ragged row, so the last cell is `\`(bounded)?\`` and the one
    // before it is `Attempts`. The emphasis (`**\`20\`**`, `**20**`, a bare `20`) is not pinned;
    // the COUNT is.
    const leadingCount = (cell: string): number => {
      const firstRun = (/\d+/.exec(cell) ?? [])[0]
      return firstRun === undefined ? NaN : Number(firstRun)
    }
    const specPrintedCounts = rows.map((r) => leadingCount(attemptsCell(r.cells)))
    expect(specPrintedCounts.some((n) => Number.isNaN(n)), '§4: every register row’s attempts cell must open with its count').toBe(false)
    const specTotal = specPrintedCounts.reduce((a, n) => a + n, 0)
    // eslint-disable-next-line no-console -- the spec’s total is PRINTED with its terms (§4)
    console.log(`PD-UI-1 register (spec §4): ${rows.map((r, i) => `${r.id}=${specPrintedCounts[i]}`).join(' + ')} = ${specTotal} attempts`)
    expect(specTotal, '§4: the spec’s eight printed terms must sum to `173` — a total quoted without its terms, or one that is not the sum of its own terms, is a review finding').toBe(173)
    expect(readFileSync(REGISTER_SPEC_PATH, 'utf8'), '§4: the spec DECLARES its over-cap total and the route taken').toMatch(/`173` attempts/)
  })

  it('§4’s shared machinery — the pinned seed drives a hand-rolled 32-bit LCG with one step per draw, and the draw selects a pool member by `index = state mod pool.length`', () => {
    const pool = ['light', 'dark', 'system', 'undefined'] as const
    const sequences = (seed: number): string[] => {
      let state = seed >>> 0
      const out: string[] = []
      for (let i = 0; i < 4; i++) {
        const step = lcgDraw(state, pool.length)
        state = step.state
        out.push(pool[step.index]!)
      }
      return out
    }
    expect(REGISTER_SEED, '§4: the seed is the fixed literal `0x20260928` — never `Date.now()`, never `Math.random()`, never an environment read').toBe(0x20260928)
    expect(sequences(REGISTER_SEED), '§4: the LCG’s draws are DETERMINISTIC — the pinned seed yields this exact sequence, one step per draw').toEqual([
      'undefined',
      'system',
      'dark',
      'light',
    ])
    // the control: a DIFFERENT seed must move the sequence (else the generator is constant
    // and every drawn row would be vacuous).
    expect(
      sequences(0x20260929),
      '§4 control: a different seed MUST move the drawn sequence — a constant generator would make every drawn row vacuous',
    ).not.toEqual(sequences(REGISTER_SEED))
  })
})
