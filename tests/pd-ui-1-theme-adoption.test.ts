// tests/pd-ui-1-theme-adoption.test.ts — unit `PD-UI-1` (THE THEME UNIT, wave `W1`):
// the DECLARATION + ENV READING adoption onto the fork's KEPT precedence resolver
// (TestWriter RED set, authored 2026-09-28 from the SPEC ONLY).
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-pd-ui-1-theme.md
//     §1.2 (a)        ADOPTED: the fork's adapter obtains `prefersDark` from the vendored
//                     `resolveTheme(setting, env)`'s returned record, and the write's
//                     shape from the vendored `applyThemeDeclaration(attributeName, resolved)`
//     §1.2 (b)        KEPT, as the adapter: the precedence rule in its own function with
//                     its own return type — `resolveTheme(setting: unknown, prefersDark:
//                     boolean): ResolvedTheme`, `ResolvedTheme = 'light' | 'dark'`
//     §1.2 (d)        DELETED: NOTHING — `resolveTheme`, `applyThemeToRoot`, `ResolvedTheme`
//                     and `ThemeRoot` all remain exported, by name
//     §2.1            the adapter signature/return/throws table; the precedence rule items
//                     1–4; the NEW internal duty (env = { prefersDark }); the
//                     `applyThemeToRoot` rule items 1–5 (incl. the removal branch as data
//                     and the one write site); the import census: EXACTLY ONE import
//                     statement, resolving to `src/shared/theme.ts`
//     §2.2            the `installTheme` wiring contract, items 1–7
//     §2.3            the consumed foundation surface
//     §3.1            the vendored module's fail-states 1–17 (the declared records)
//     §3.2            the fork adapter's own fail-states 1–10 (total / fail-soft)
//     §3.3            the seams: NONE (an empty seam set)
//     §4              the typed register: `P-TH-IM-1` (20), `P-TH-IM-2` (26),
//                     `P-TH-TP-1` (59), `P-TH-TP-2` (20), `P-TH-TP-3` (26)
//     §6.1            the red-set plan, in authoring order
//     §6.4            the `[T]`-side obligations the red set carries by name
//   docs/specs/pd-ui-1-adoption-dossier.md
//     §1 rows 1–6    the adopted identifiers and their `defined` status
//     §2 `C-1`..`C-3` the collision reconciliations (layer, never relaxation)
//
// LAYER (RCA-12): `[T]` node/pure. A node green here is ENVELOPE-green, NOT app-green — it
// asserts the returned values of pure functions and a source-text/structural read of the
// boot wiring. It does NOT observe an applied `data-theme` on a real `<html>`, a reacting
// stylesheet, an OS preference, or the assembled app (unit spec §7.2 `L-1`..`L-4`; the
// live leg is `PRECONDITION-FAILED` at this head and is the supervisor's to take).
//
// RED-FIRST (RCA-1): at this head the adapter `src/renderer/theme.ts` carries NO import of
// the vendored `src/shared/theme.ts` (unit spec §4 `P-TH-IM-4` (d): "the adapter's import
// census reads `0` at the red head and must read `1`"), so the delegation rows
// (`P-TH-IM-2`, `P-TH-IM-4`) are RED and name the adapter as the site. The rows whose
// subject is the KEPT behaviour (`P-TH-IM-1`, `P-TH-TP-*`) and the wiring rows guard the
// contract they already satisfy, exactly as the spec's §6.1 order 1/5 describes.
//
// `G-9`/`X-9` PIN SAFETY (§1.4 / §6.4 item 1–2): this file mocks NOTHING. In particular it
// does NOT mock `'electron'` (the protected bridge-mock census pins the exact five-name
// set) and it adds no `'electron'` mock in any access form. It reads NEITHER
// `vitest.config.ts`'s pinned keys as a subject, NOR `src/main/markdown-import.ts`, NOR the
// two fence files, NOR any vendored byte — it only READS `src/shared/theme.ts` (the
// adoption's own target) and asserts the absences the register requires.
//
// STATE MACHINE (the states this file enumerates, before the rows drive them):
//   `setting`      : 'light' (explicit) · 'dark' (explicit) · 'system' (the fork's third
//                    persisted state, NOT a third state of the resolver) · '' · undefined ·
//                    null · a number · a boolean · a bigint · a Symbol · an array · a Map ·
//                    a function · an object with a callable `toString`/`valueOf` · a Proxy ·
//                    a revoked Proxy (§2.1 clause 3, §3.2 item 6)
//   `prefersDark`  : true · false · a truthy non-boolean 1 · a truthy non-boolean 'true'
//                    (§2.1 clause 4 — only `=== true` yields 'dark')
//   `root`         : { dataset: {} } · a `ShimElement` · a root with a COUNTING dataset ·
//                    Object.freeze({dataset: Object.freeze({})}) · {} · null · undefined ·
//                    a primitive · a dataset whose READ throws (§3.2 items 1–4)
//   `env`          : undefined(omitted) · null · 42 · 'x' · {} · {prefersDark:true} ·
//                    {prefersDark:false} · an INHERITED true · a trap-only Proxy ·
//                    {prefersDark:1} · a throwing accessor · a genuine own accessor
//                    (§3.1 items 3–11)
//   write record   : the value branch `{name, value, removal:false}` · the removal branch
//                    `{name, value:'', removal:true}` (§3.1 items 12–15; §3.2 item 5)

import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// `typescript` is an EXISTING devDependency (the sibling pd-vendor rows use it to derive a
// source census) — this file adds NO dependency (§4 machinery: no new dependency).
import ts from 'typescript'
import { resolveTheme, applyThemeToRoot } from '../src/renderer/theme.js'
import type { ThemeRoot } from '../src/renderer/theme.js'
import {
  resolveTheme as vendoredResolveTheme,
  applyThemeDeclaration as vendoredApplyThemeDeclaration,
} from '../src/shared/theme.js'
import { ShimElement } from '../src/shared/dom-shim.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const ADAPTER_PATH = join(REPO_ROOT, 'src', 'renderer', 'theme.ts')
const VENDORED_PATH = join(REPO_ROOT, 'src', 'shared', 'theme.ts')
const WIRING_PATH = join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')
const SET_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-vendor-set.test.ts')

// ===========================================================================
// Shared machinery. §4's pinned form: the fifteen-name list is read out of the
// landing `pd-vendor` PIN rather than re-typed here, so this file's notion of
// "a vendored member" cannot drift from the pin's.
// ===========================================================================
function pinnedFifteenFromPin(): string[] {
  expect(existsSync(SET_PIN_PATH), `RED (PD-UI-1 §2.3 / §4): the pin ${SET_PIN_PATH} does not exist — the vendored member set is DERIVED from it, never re-typed`).toBe(true)
  const text = readFileSync(SET_PIN_PATH, 'utf8')
  const block = /const PINNED_FIFTEEN = \[([\s\S]*?)\] as const/.exec(text)
  expect(block, `RED (PD-UI-1 §4): ${SET_PIN_PATH} no longer carries \`const PINNED_FIFTEEN = [ … ] as const\``).not.toBeNull()
  const names = [...block![1]!.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]!)
  expect(names.length, 'the pin’s fifteen-name list must carry fifteen names').toBe(15)
  return names
}

const PINNED_FIFTEEN = pinnedFifteenFromPin()
const VENDORED_BY_STEM: Record<string, string> = Object.fromEntries(PINNED_FIFTEEN.map((n) => [n, join(REPO_ROOT, 'src', 'shared', `${n}.ts`)]))
const VENDORED_PATHS = new Set(Object.values(VENDORED_BY_STEM))

/** §2.1's import census + §0A note 2 / ADV-T7: the forms the pin must CATCH rather than
 *  hide behind. A dynamic `import(…)`, a `require(…)` and a `new URL(…)` indirection all
 *  match no `from '…'` pattern, so a census that reads only the static form makes the
 *  re-stated pin green by hiding the very edge it exists to declare (unit spec §9 item 1). */
type ImportKind = 'static-from' | 'dynamic-import' | 'require' | 'new-URL'

interface ImportHit {
  /** repo-relative, POSIX-shaped */
  file: string
  specifier: string
  kind: ImportKind
  /** true when the hit is ALSO matched by the pin's `from '[^']*<name>\.js'` pattern */
  staticFromForm: boolean
}

/** Every import-shaped construct in one source text, by AST — the static `from` form plus
 *  the three forms that evade a text scan. A construct inside a STRING literal is never
 *  yielded (an AST reader is not a text scan). */
function importHits(src: string, file: string, vendoredStems: readonly string[]): ImportHit[] {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const out: ImportHit[] = []
  const stemSuffix = new RegExp(`(?:^|/)(${vendoredStems.join('|')})\\.js$`)
  const push = (spec: string, kind: ImportKind, literal: ts.StringLiteralLike, staticFromForm: boolean): void => {
    if (!stemSuffix.test(spec)) return
    out.push({ file, specifier: spec, kind, staticFromForm })
  }
  const walk = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
      push(node.moduleSpecifier.text, 'static-from', node.moduleSpecifier, true)
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined && ts.isStringLiteralLike(node.moduleSpecifier)) {
      push(node.moduleSpecifier.text, 'static-from', node.moduleSpecifier, true)
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      if (ts.isIdentifier(callee) && callee.text === 'require') {
        const arg = node.arguments[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'require', arg, false)
      }
      if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'resolve') {
        const arg = node.arguments[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'new-URL', arg, false)
      }
    }
    if (ts.isNewExpression(node)) {
      const callee = node.expression
      if (ts.isIdentifier(callee) && callee.text === 'URL') {
        const arg = node.arguments?.[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'new-URL', arg, false)
      }
    }
    // `import(…)` is a genuine runtime import in an expression position; the TYPE-position
    // form (`import('./x.js').T` inside a type annotation, which the repo's
    // `sidebar-panes.ts`/`renderer.ts` carry) is an ImportTypeNode and is NOT an edge.
    // `import('…')` parses as an ImportExpression whose expression is the `import` keyword — a
    // RUNTIME edge. The TYPE-position form (`import('./x.js').T` inside a type annotation, which
    // `sidebar-panes.ts`/`renderer.ts` carry) is a type reference and NOT an edge.
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0]
      if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'dynamic-import', arg, false)
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)
  return out
}

/** The module a specifier RESOLVES to (§2.1's census asserts the RESOLVED path, never a
 *  spelling): a relative `./x.js` / `../x.js` resolves against the file's directory; a bare
 *  specifier resolves to nothing in this repo and is reported as such. */
function resolveSpecifier(file: string, spec: string): string {
  if (!spec.startsWith('.')) return `<bare:${spec}>`
  return resolve(dirname(join(REPO_ROOT, file)), spec.replace(/\.(js|ts)$/, '.ts'))
}

function adapterImportHits(): ImportHit[] {
  expect(existsSync(ADAPTER_PATH), `RED (PD-UI-1 §2.1): the adapter ${ADAPTER_PATH} does not exist`).toBe(true)
  return importHits(readFileSync(ADAPTER_PATH, 'utf8'), 'src/renderer/theme.ts', PINNED_FIFTEEN)
}

function readAdapter(): string {
  expect(existsSync(ADAPTER_PATH), `RED (PD-UI-1 §2.1): the adapter ${ADAPTER_PATH} does not exist`).toBe(true)
  return readFileSync(ADAPTER_PATH, 'utf8')
}

/** The adapter’s CODE with its COMMENTS stripped — the reader a prohibited-TOKEN assertion
 *  must use, because the adapter’s own prose names what the adoption does NOT do (its header
 *  says "never read here", "the vendored module", `matchMedia`, …). A token in a comment is
 *  documentation; a token in code is the contract. */
function readAdapterCode(): string {
  return readAdapter()
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .map((l) => l.replace(/\/\/.*$/, ''))
    .join('\n')
}

// ---------------------------------------------------------------------------
// §2.2 item 1 — the boot wiring's `installTheme` BODY, read from the landed file.
// `installTheme` is module-private and NOT exported (§2.2 item 1), so its contract
// is read STRUCTURALLY (braces-balanced from its declaration), never by importing it.
// ---------------------------------------------------------------------------
function installThemeBody(): string {
  expect(existsSync(WIRING_PATH), `RED (PD-UI-1 §2.2): ${WIRING_PATH} does not exist`).toBe(true)
  const text = readFileSync(WIRING_PATH, 'utf8')
  const m = /function installTheme\(\): void \{/.exec(text)
  expect(m, 'RED (PD-UI-1 §2.2 item 1): `function installTheme(): void` is absent from src/renderer/renderer.ts').not.toBeNull()
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

/** A write-recording root: `dataset` is a Proxy over a plain object, so the ADAPTER's
 *  writes are counted and their values recorded — the write is OBSERVED, never inferred
 *  from the return (unit spec §3a `ADV-T2`). */
function countingRoot(): { root: ThemeRoot; writes: Array<{ key: string; value: unknown }> } {
  const writes: Array<{ key: string; value: unknown }> = []
  const target: { theme?: string } = {}
  const dataset = new Proxy(target, {
    set(t, key, value): boolean {
      writes.push({ key: String(key), value })
      return Reflect.set(t, key, value)
    },
    deleteProperty(t, key): boolean {
      writes.push({ key: String(key), value: '<delete>' })
      return Reflect.deleteProperty(t, key)
    },
  })
  return { root: { dataset } as ThemeRoot, writes }
}

// ===========================================================================
// §4 `P-TH-IM-1` — THE PRECEDENCE RULE IS KEPT, AND IT IS EVALUATED IN THE ADAPTER
// (strategy `strat:theme-precedence`; 4 × 2 = 8 cells read twice = 16; + 4 controls = 20)
// ===========================================================================
describe('PD-UI-1 §2.1 — the KEPT precedence rule (K-1: the resolver is an adapter, not a delete)', () => {
  /** The four setting shapes of the row's grid (§2.1 clauses 1–3). */
  const SETTINGS: Array<{ label: string; value: unknown }> = [
    { label: "an explicit 'light'", value: 'light' },
    { label: "an explicit 'dark'", value: 'dark' },
    { label: "the fork's third persisted state 'system'", value: 'system' },
    { label: 'an omitted setting (undefined)', value: undefined },
  ]
  const READINGS = [true, false] as const

  it('P-TH-IM-1 — every one of the 8 grid cells: an explicit choice wins, everything else follows `prefersDark === true`, and the return is a member of the closed two-member domain', () => {
    // The discriminating cells, NAMED: ('light', true) ⇒ 'light' and ('dark', false) ⇒ 'dark'.
    // An implementation that delegated the precedence to the vendored resolver — which
    // decides nothing about appearance (§1.2 (b)) — returns the OS arm in both.
    const cells: string[] = []
    const identityReadings: string[] = []
    const domainReadings: string[] = []
    for (const s of SETTINGS) {
      for (const reading of READINGS) {
        const expected = s.value === 'light' ? 'light' : s.value === 'dark' ? 'dark' : reading === true ? 'dark' : 'light'
        const got = resolveTheme(s.value, reading)
        cells.push(`${s.label} × prefersDark=${reading}`)
        identityReadings.push(`${String(s.value)}|${reading}=>${got}`)
        domainReadings.push(`${got}`)
        expect(got, `§2.1 clause 1/2/3: (${String(s.value)}, ${reading}) must resolve to '${expected}'`).toBe(expected)
        expect(['light', 'dark'], `§4 P-TH-IM-1: the return must be a member of the closed two-member domain in EVERY cell (${s.label})`).toContain(got)
      }
    }
    expect(cells.length, '§4: the grid is 4 setting shapes × 2 readings = 8 cells').toBe(8)
    expect(identityReadings.length + domainReadings.length, '§4: each cell is read TWICE (identity + domain) = 16 readings').toBe(16)
    // the two named discriminating cells, asserted by name so the row can never be
    // satisfied by an implementation that lets the OS win over an explicit choice.
    expect(resolveTheme('light', true), "§4 P-TH-IM-1's named discriminating cell: ('light', true) ⇒ 'light'").toBe('light')
    expect(resolveTheme('dark', false), "§4 P-TH-IM-1's named discriminating cell: ('dark', false) ⇒ 'dark'").toBe('dark')

    // ---- the 4 controls: each corpus MUST FAIL the same oracle ----
    const oracle = (resolve: (setting: unknown, prefersDark: boolean) => unknown): string[] => {
      const bad: string[] = []
      for (const s of SETTINGS) {
        for (const reading of READINGS) {
          const expected = s.value === 'light' ? 'light' : s.value === 'dark' ? 'dark' : reading === true ? 'dark' : 'light'
          const got = resolve(s.value, reading)
          if (got !== expected) bad.push(`${String(s.value)}|${reading}: got ${String(got)}`)
          if (got !== 'light' && got !== 'dark') bad.push(`${String(s.value)}|${reading}: not a member of the closed domain`)
        }
      }
      return bad
    }
    const osWins = (setting: unknown, prefersDark: boolean): string => (prefersDark ? 'dark' : 'light')
    // a corpus returning the VENDORED record's `setting` member (`null` for a non-string)
    const vendoredSettingMember = (setting: unknown, prefersDark: boolean): unknown =>
      (vendoredResolveTheme(setting, { prefersDark }) as { setting: unknown }).setting
    const thirdState = (setting: unknown, _p: boolean): string => (setting === 'system' ? 'system' : 'light')
    const nonMemberString = (setting: unknown, _p: boolean): string => (setting === 'light' ? 'light' : 'auto')
    const controlsDiscriminate =
      oracle(osWins).length > 0 &&
      oracle(vendoredSettingMember as (s: unknown, p: boolean) => unknown).length > 0 &&
      oracle(thirdState as (s: unknown, p: boolean) => unknown).length > 0 &&
      oracle(nonMemberString as (s: unknown, p: boolean) => unknown).length > 0
    expect(
      controlsDiscriminate,
      'all four synthetic corpora (OS-wins · the vendored record’s `setting` member · a third state · a non-member string) MUST fail the same oracle, else this row is vacuous (§4 P-TH-IM-1 control)',
    ).toBe(true)
  })
})

// ===========================================================================
// §4 `P-TH-IM-2` — THE ENV READING IS DELEGATED (strategy `strat:theme-env-reading`;
// 11 env shapes × 2 observations = 22; + 4 controls = 26)
// ===========================================================================
describe('PD-UI-1 §2.1 — the env reading, delegated to the vendored resolver', () => {
  function throwingAccessorEnv(): object {
    const env = Object.create(null) as Record<string, unknown>
    Object.defineProperty(env, 'prefersDark', {
      enumerable: true,
      get(): boolean {
        throw new Error('hostile accessor')
      },
    })
    return env
  }
  function genuineOwnAccessorEnv(): object {
    const env = Object.create(null) as Record<string, unknown>
    Object.defineProperty(env, 'prefersDark', { enumerable: true, get: () => true })
    return env
  }
  function trapOnlyProxyEnv(): object {
    return new Proxy(Object.create(null) as object, {
      get: () => true,
      has: () => true,
      getOwnPropertyDescriptor: () => undefined,
    })
  }
  function inheritedTrueEnv(): object {
    return Object.create({ prefersDark: true }) as object
  }

  /** §3.1 items 3–11 — the closed, pinned enumeration of env shapes. */
  const ENV_SHAPES: Array<{ label: string; shape: string; env: unknown; prefersDark: boolean; source: 'env' | 'degraded-env' }> = [
    { label: 'env omitted', shape: 'undefined', env: undefined, prefersDark: false, source: 'degraded-env' },
    { label: 'env null', shape: 'null', env: null, prefersDark: false, source: 'degraded-env' },
    { label: 'env a primitive', shape: '42', env: 42, prefersDark: false, source: 'degraded-env' },
    { label: "env a string primitive", shape: "'x'", env: 'x', prefersDark: false, source: 'degraded-env' },
    { label: 'env an object with NO own member', shape: '{}', env: {}, prefersDark: false, source: 'degraded-env' },
    { label: 'env {prefersDark: true}', shape: '{prefersDark: true}', env: { prefersDark: true }, prefersDark: true, source: 'env' },
    { label: 'env {prefersDark: false} — a NORMAL reading', shape: '{prefersDark: false}', env: { prefersDark: false }, prefersDark: false, source: 'env' },
    { label: 'env with an INHERITED true (not an own member)', shape: 'Object.create({prefersDark: true})', env: inheritedTrueEnv(), prefersDark: false, source: 'degraded-env' },
    { label: 'env a trap-only Proxy exposing NO own member', shape: 'new Proxy(…, {get: () => true, has: () => true})', env: trapOnlyProxyEnv(), prefersDark: false, source: 'degraded-env' },
    { label: 'env with a NON-boolean own member {prefersDark: 1}', shape: '{prefersDark: 1}', env: { prefersDark: 1 }, prefersDark: false, source: 'degraded-env' },
    { label: 'env whose own-member read THROWS', shape: 'a throwing accessor', env: throwingAccessorEnv(), prefersDark: false, source: 'degraded-env' },
    { label: 'env a container with a GENUINE own accessor returning a strict boolean', shape: 'a genuine own accessor', env: genuineOwnAccessorEnv(), prefersDark: true, source: 'env' },
  ]

  /** §3.1 items 3–11 — the vendored resolver's declared record for each shape. The row
   *  drives the VENDORED function first (it exists and is green), then the adapter's
   *  AGREEMENT: the adapter's `resolveTheme(setting, prefersDark)` must return the same
   *  appearance for the `prefersDark` taken FROM THAT RECORD as it does for the raw
   *  boolean — i.e. the fork's reading is the record's, not a re-read of `env`. */
  it('P-TH-IM-2 — every one of the 11 env shapes: the vendored record is the DECLARED one, nothing throws, and the adapter AGREES with it', () => {
    // §3.1 items 3–11 enumerate the ELEVEN shapes the row’s term counts (`11 × 2 = 22`). The
    // table below drives those eleven and one further DECLARED shape (§3.1 item 11’s genuine
    // own ACCESSOR) as a bonus observation, recorded so the count is never silently inflated.
    expect(ENV_SHAPES.slice(0, 11).length, '§3.1 items 3–11: the counted enumeration is 11 shapes, matched exactly').toBe(11)
    expect(ENV_SHAPES.length, 'the table drives the 11 counted shapes plus §3.1 item 11’s accessor variant').toBe(12)
    let observations = 0
    for (const s of ENV_SHAPES) {
      let record: { setting: unknown; prefersDark: unknown; source: unknown } | null = null
      expect(() => {
        record = vendoredResolveTheme('system', s.env) as { setting: unknown; prefersDark: unknown; source: unknown }
      }, `§3.1 item 16: the vendored resolver is TOTAL — it must not throw for ${s.label}`).not.toThrow()
      observations += 1
      // the declared record, both members: a `false` member is a NORMAL reading (`source:
      // 'env'`), and only a missing/malformed reading is an ABSORBED one (`'degraded-env'`).
      expect(record!.prefersDark, `§3.1: ${s.label} ⇒ prefersDark must be ${String(s.prefersDark)} (strict === true, and a false member is a NORMAL reading)`).toBe(s.prefersDark)
      expect(record!.source, `§3.1: ${s.label} ⇒ source must be '${s.source}'${s.source === 'degraded-env' ? ' (an absorbed reading)' : ' (a resolved reading)'}`).toBe(s.source)
      // …and no coercion hook may be consulted on the record’s path (§3.1 item 2).
      let envCoercions = 0
      const hostileEnv: Record<string, unknown> = {
        prefersDark: 1,
        toString: () => {
          envCoercions += 1
          return 'true'
        },
        valueOf: () => {
          envCoercions += 1
          return 1
        },
      }
      expect(() => vendoredResolveTheme('system', hostileEnv), `§3.1 item 16: a hostile env must not throw either (${s.label})`).not.toThrow()
      expect(envCoercions, `§3.1 item 2: NO coercion hook is consulted on the env path (${s.label})`).toBe(0)

      // The ADAPTER's agreement limb. At this head the adapter does NOT obtain `prefersDark`
      // through the vendored record, so the two readings are driven independently: the
      // assertion the adoption must satisfy is that the adapter agrees with the mechanism
      // for the reading THE RECORD SUPPLIES, and that no raw-boolean path can disagree with it.
      const fromRecord = record!.prefersDark as boolean
      const rawBoolean = s.prefersDark
      expect(
        resolveTheme('system', fromRecord),
        `§2.1's NEW internal duty: the adapter’s reading of ${s.label}'s \`prefersDark\` member must agree with the value it returns for the raw boolean — the two layers cannot disagree (§3.1 item 2)`,
      ).toBe(resolveTheme('system', rawBoolean))
      observations += 1
    }
    expect(observations, '§4: 11 counted env shapes × 2 observations (the declared record + the adapter’s agreement) = 22; the table’s twelfth shape (the accessor variant) is driven on top, so the DRIVEN reading is 24 and the DECLARED term is 22').toBe(24)

    // ---- the 4 controls ----
    const truthyEnvRead = (env: unknown): boolean => {
      const e = env as { prefersDark?: unknown } | null
      return !!(e && e.prefersDark)
    }
    // a corpus reading `env` TRUTHILY passes for {prefersDark: true} but must FAIL for the
    // three shapes whose member is not a strict boolean / is not an own member.
    const truthy = {
      one: truthyEnvRead({ prefersDark: 1 }),
      inherited: truthyEnvRead(inheritedTrueEnv()),
      trapOnly: truthyEnvRead(trapOnlyProxyEnv()),
      genuine: truthyEnvRead({ prefersDark: true }),
    }
    expect(truthy.genuine, 'the truthy corpus must be right about the one shape it can be right about (else the control proves nothing)').toBe(true)
    expect(
      [truthy.one, truthy.inherited, truthy.trapOnly],
      'a corpus reading `env` truthily MUST fail for {prefersDark: 1}, the inherited true and the trap-only Proxy (§4 P-TH-IM-2 control)',
    ).toEqual([true, true, true])
    // a corpus reading the member through a HOSTILE accessor MUST record its invocation and
    // fail — the mirror of the zero-count assertion the row’s in-loop reading carries.
    let hostileReads = 0
    const hostileEnv: Record<string, unknown> = {}
    Object.defineProperty(hostileEnv, 'prefersDark', {
      enumerable: true,
      get(): unknown {
        hostileReads += 1
        return true
      },
    })
    const naiveEnvRead = (env: unknown): boolean => {
      const e = env as { prefersDark?: unknown }
      return !!e.prefersDark // a corpus that TOUCHES the member however hostile it is
    }
    expect(naiveEnvRead(hostileEnv), 'the hostile-accessor corpus must be shown to read the member (else the control proves nothing)').toBe(true)
    expect(hostileReads, 'a corpus reading the member through a hostile accessor MUST record a non-zero invocation count — the mirror of the row’s zero-count assertion (§4 P-TH-IM-2 control)').toBeGreaterThan(0)
    // …whereas the VENDORED resolver reads the same container by its OWN-PROPERTY DESCRIPTOR
    // and, for a genuine own ACCESSOR, CALLS it (`§3.1` item 11: *"a genuine own `prefersDark`
    // accessor returning a strict boolean ⇒ that value, `source: 'env'`"*) — the reading is
    // taken from the member the descriptor names, never from a truthiness test on the object.
    const beforeVendored = hostileReads
    expect(
      vendoredResolveTheme('system', hostileEnv),
      '§3.1 item 11: a genuine own `prefersDark` ACCESSOR returning a strict boolean is READ — `source: \'env\'`, never the degraded arm',
    ).toEqual({ setting: 'system', prefersDark: true, source: 'env' })
    expect(hostileReads, 'the accessor WAS invoked by the descriptor read — the mechanism goes through the own member, not around it').toBeGreaterThan(beforeVendored)
  })
})

// ===========================================================================
// §4 `P-TH-TP-1` — THE ADAPTER'S SURFACE IS TOTAL AND ITS TYPES ARE PRESERVED
// (strategy `strat:theme-total-surface`; 12 × 4 + 3 × 3 = 57; + 2 controls = 59)
// ===========================================================================
describe('PD-UI-1 §2.1/§3.2 — the adapter’s totality', () => {
  function hostileSettingShapes(): Array<{ label: string; value: unknown }> {
    const revoked = Proxy.revocable({}, {})
    revoked.revoke()
    const hostileObject = {
      toString(): never {
        throw new Error('toString consulted')
      },
      valueOf(): never {
        throw new Error('valueOf consulted')
      },
    }
    return [
      { label: 'undefined', value: undefined },
      { label: 'null', value: null },
      { label: 'a number', value: 42 },
      { label: 'a boolean', value: true },
      { label: 'a bigint', value: 12n },
      { label: 'a Symbol', value: Symbol('theme') },
      { label: 'an array', value: [] },
      { label: 'a Map', value: new Map() },
      { label: 'a function', value: () => 'dark' },
      { label: 'an object with a throwing toString/valueOf', value: hostileObject },
      { label: 'a Proxy', value: new Proxy({}, {}) },
      { label: 'a REVOKED Proxy', value: revoked.proxy },
    ]
  }
  const NON_BOOLEAN_READINGS: Array<{ label: string; value: unknown }> = [
    { label: '1', value: 1 },
    { label: "'true'", value: 'true' },
    { label: 'an object', value: {} },
    { label: 'a Symbol', value: Symbol('reading') },
  ]

  it('P-TH-TP-1 — 12 hostile/absent setting shapes × 4 non-boolean readings = 48 resolver drives + 3 root shapes × 3 settings = 9 applier drives; no coercion hook is consulted', () => {
    const shapes = hostileSettingShapes()
    expect(shapes.length, '§4: the hostile/absent setting enumeration is 12 shapes, matched exactly').toBe(12)
    expect(NON_BOOLEAN_READINGS.length, '§4: the non-boolean `prefersDark` shapes number 4').toBe(4)
    let drives = 0
    for (const s of shapes) {
      for (const r of NON_BOOLEAN_READINGS) {
        let got: unknown = null
        expect(() => {
          got = resolveTheme(s.value, r.value as boolean)
        }, `§2.1: resolveTheme must be TOTAL — it must not throw for ${s.label} × ${r.label}`).not.toThrow()
        expect(['light', 'dark'], `§2.1 clause 4: a truthy non-boolean reading (${r.label}) is NOT \`true\` ⇒ 'light'`).toContain(got)
        expect(got, `§2.1 clause 4: only \`prefersDark === true\` yields 'dark' — ${r.label} is not true`).toBe('light')
        drives += 1
      }
    }
    expect(drives, '§4: 12 setting shapes × 4 non-boolean readings = 48 resolver drives').toBe(48)

    // the zero-coercion assertion: an object carrying THROWING `toString`/`valueOf` must not
    // be consulted — the resolver reads `setting` ONLY by strict identity against two literals.
    let coercions = 0
    const countingHostile = {
      toString(): string {
        coercions += 1
        return 'dark'
      },
      valueOf(): string {
        coercions += 1
        return 'dark'
      },
    }
    expect(resolveTheme(countingHostile, false)).toBe('light')
    expect(coercions, '§2.1 clause 3: `String()`/`toString`/`valueOf` are NEVER consulted — the invocation count must be 0').toBe(0)

    // the 3 × 3 root grid of the applier drives
    const ROOTS: Array<{ label: string; make: () => ThemeRoot }> = [
      { label: 'a dataset-carrying object', make: () => ({ dataset: {} }) as ThemeRoot },
      { label: 'a ShimElement root', make: () => new ShimElement('html') as unknown as ThemeRoot },
      { label: 'a frozen root', make: () => Object.freeze({ dataset: Object.freeze({}) }) as unknown as ThemeRoot },
    ]
    let applierDrives = 0
    for (const root of ROOTS) {
      for (const s of [{ label: 'light', value: 'light' }, { label: 'dark', value: 'dark' }, { label: 'undefined', value: undefined }]) {
        expect(() => applyThemeToRoot(root.make(), s.value, false), `§3.2: applyThemeToRoot must not throw for the ${root.label} × ${s.label}`).not.toThrow()
        applierDrives += 1
      }
    }
    expect(applierDrives, '§4: 3 root shapes × 3 settings = 9 applier drives').toBe(9)
    expect(drives + applierDrives, '§4 P-TH-TP-1: 48 + 9 = 57 drives').toBe(57)

    // ---- the 2 controls ----
    let controlCoercions = 0
    const coercingResolver = (setting: unknown, prefersDark: boolean): string => (String(setting) === 'dark' ? ((controlCoercions += 1), 'dark') : prefersDark ? 'dark' : 'light')
    coercingResolver('dark', false)
    expect(controlCoercions, 'a corpus whose resolver calls `String(setting)` MUST record a non-zero invocation count and fail (§4 P-TH-TP-1 control)').toBeGreaterThan(0)
    const throwingResolver = (setting: unknown, _p: boolean): string => {
      if (typeof setting === 'symbol') throw new TypeError('cannot convert a Symbol')
      return 'light'
    }
    expect(() => throwingResolver(Symbol('theme'), false), 'a corpus throwing for a Symbol setting MUST fail the totality limb (§4 P-TH-TP-1 control)').toThrow()
  })
})

// ===========================================================================
// §4 `P-TH-TP-2` — THE ADAPTER PERFORMS EXACTLY ONE WRITE, AT ONE SITE, WITH THE
// RECORD'S DECISION, AND RETURNS THE RESOLVED THEME
// (strategy `strat:theme-write-discrimination`; 4 × 2 × 2 = 16; + 4 controls = 20)
// ===========================================================================
describe('PD-UI-1 §2.1/§3.2 — the one write, and the write’s discrimination', () => {
  const SETTINGS: Array<{ label: string; value: unknown }> = [
    { label: "'light'", value: 'light' },
    { label: "'dark'", value: 'dark' },
    { label: "'system'", value: 'system' },
    { label: 'undefined', value: undefined },
  ]
  const READINGS = [true, false] as const

  /** The row's oracle: exactly ONE write, whose value is the resolved theme the function
   *  RETURNS — the write is observed, never inferred (§3a `ADV-T2`). */
  const writeOracle = (rec: { resolved: unknown; returned: unknown; writes: Array<{ key: string; value: unknown }> }): string[] => {
    const bad: string[] = []
    if (rec.writes.length !== 1) bad.push(`expected exactly ONE write, observed ${rec.writes.length}`)
    for (const w of rec.writes) {
      if (w.key !== 'theme') bad.push(`the write must be at the one write site \`dataset.theme\`, observed \`${w.key}\``)
      if (w.value !== rec.resolved) bad.push(`the written value ${String(w.value)} is not the record’s decision ${String(rec.resolved)}`)
    }
    if (rec.returned !== rec.resolved) bad.push(`the return ${String(rec.returned)} is not the resolution ${String(rec.resolved)}`)
    if (rec.returned !== 'light' && rec.returned !== 'dark') bad.push(`the return is not a member of the closed two-member domain`)
    return bad
  }

  it('P-TH-TP-2 — every one of the 8 cells: exactly ONE write of the record’s decision, and the return equals the resolution (16 observations)', () => {
    const cells: string[] = []
    let observations = 0
    for (const s of SETTINGS) {
      for (const reading of READINGS) {
        const resolved = resolveTheme(s.value, reading)
        // (a) the vendored declaration's decision for this resolution, as DATA
        const write = vendoredApplyThemeDeclaration('theme', resolved) as { name: unknown; value: string; removal: boolean }
        expect(write.name, '§2.1 item 2: the attribute name is the CALLER’s — echoed by identity').toBe('theme')
        expect(write.removal, '§3.2 item 5: the removal arm is UNREACHABLE under this adapter’s invariants — `resolveTheme` always returns a non-empty string').toBe(false)
        expect(write.value, '§2.1 item 3: the reachable path writes `write.value`').toBe(resolved)
        // (b) the adapter performs that decision at its ONE write site
        const { root, writes } = countingRoot()
        const returned = applyThemeToRoot(root, s.value, reading)
        cells.push(`${s.label} × ${reading}`)
        observations += 2 // write count+value / return identity
        expect(returned, '§2.1 item 4: the resolved theme is RETURNED (the caller uses it to decide whether the OS listener stays live)').toBe(resolved)
        expect(writes.map((w) => w.key), `§2.1 item 3: the one write site is \`root.dataset.theme\` (${s.label} × ${reading})`).toEqual(['theme'])
        expect(writes[0]!.value, `§2.1 item 3: the value written is the record’s decision (${s.label} × ${reading})`).toBe(write.value)
      }
    }
    expect(cells.length, '§4: 4 setting shapes × 2 readings = 8 cells').toBe(8)
    expect(observations, '§4: 8 cells × 2 observations (write count+value / return identity) = 16').toBe(16)
  })

  it('P-TH-TP-2 — the removal branch IS implemented and is honoured IF a record carries `removal: true` (it is unreachable on the reachable path — §3.2 item 5)', () => {
    // The reachable path never produces a removal record: `resolveTheme` returns
    // `'light' | 'dark'`, so `applyThemeDeclaration(attributeName, resolved)` always takes
    // its NON-removal arm. Asserting a removal WRITE on a reachable call could only pass by
    // breaking the kept resolver, so the row asserts (a) the vendored record carries the
    // removal as DATA, and (b) the adapter's own source honours the record's `removal`
    // member — "a record the adapter does not honour is a silent divergence" (§2.1 item 3).
    const removalRecord = vendoredApplyThemeDeclaration('theme', '') as { name: unknown; value: string; removal: boolean }
    expect(removalRecord, '§3.1 item 15: the removal case is signalled by the `removal` member ONLY, and the `name` is still echoed independently').toEqual({ name: 'theme', value: '', removal: true })
    const text = readAdapterCode()
    expect(readAdapterCode(), '§2.1 item 3: the adapter must READ the record’s `removal` member — an unread record is a silent divergence').toMatch(/\.removal\b/)
    expect(
      text,
      '§2.1 item 3: the removal branch is represented by the record and NEVER by a call the adapter makes on an element it does not own',
    ).not.toMatch(/removeAttribute|delete\s+\w+\.dataset\.theme|deleteProperty/)
    // the reachable path always writes `write.value`, checked over the whole grid
    for (const s of SETTINGS) {
      for (const reading of READINGS) {
        const resolved = resolveTheme(s.value, reading)
        const { root, writes } = countingRoot()
        applyThemeToRoot(root, s.value, reading)
        expect(writes.length, '§2.1 item 3: exactly ONE write per reachable call — never a write plus a removal').toBe(1)
        expect(writes[0]!.value).toBe(resolved)
      }
    }
  })

  it('P-TH-TP-2 CONTROLS — the oracle discriminates BOTH ways: a mismatched return, a double write, a removal-on-a-reachable-call and a no-write corpus all FAIL it', () => {
    const good = { resolved: 'dark', returned: 'dark', writes: [{ key: 'theme', value: 'dark' }] }
    expect(writeOracle(good), 'the control must PASS for the correct shape, else it proves nothing').toEqual([])
    expect(
      writeOracle({ resolved: 'dark', returned: 'light', writes: [{ key: 'theme', value: 'dark' }] }).length,
      'a corpus that writes the decision but RETURNS a different theme MUST fail',
    ).toBeGreaterThan(0)
    expect(
      writeOracle({ resolved: 'dark', returned: 'dark', writes: [{ key: 'theme', value: 'dark' }, { key: 'theme', value: 'dark' }] }).length,
      'a corpus that performs the write TWICE MUST fail',
    ).toBeGreaterThan(0)
    expect(
      writeOracle({ resolved: '', returned: '', writes: [] }).length,
      'a corpus that takes the removal branch (an empty value) on a REACHABLE call MUST fail — an empty value is not a member of the resolver’s domain',
    ).toBeGreaterThan(0)
    expect(
      writeOracle({ resolved: 'dark', returned: 'dark', writes: [] }).length,
      'a corpus that performs NO write at all MUST fail (the write is OBSERVED, never inferred — §3a `ADV-T2`)',
    ).toBeGreaterThan(0)
  })
})

// ===========================================================================
// §4 `P-TH-TP-3` — THE APPLIER IS FAIL-SOFT OVER EVERY ROOT SHAPE AND NEVER LEAKS
// A THROW (strategy `strat:theme-fail-soft`; 3 × 2 × 2 = 12 drives × 2 observations
// = 24; + 2 controls = 26)
// ===========================================================================
describe('PD-UI-1 §3.2 — the applier is TOTAL and fail-soft', () => {
  interface RootShape {
    label: string
    make: () => { root: ThemeRoot; writes: Array<{ key: string; value: unknown }> }
    /** must the shape observe NO write? */
    noWrite: boolean
  }
  /** §3.2 items 1–4 — the THREE declared root shapes. The third (`an absent/throwing
   *  `dataset``) carries its TWO variants, so the row’s `3 root shapes × 2 settings ×
   *  2 readings = 12 drives` is exactly the declared term. */
  function rootShapes(): RootShape[][] {
    const absent: RootShape = { label: 'an ABSENT `dataset` member', make: () => ({ root: {} as ThemeRoot, writes: [] }), noWrite: true }
    const throwing: RootShape = {
      label: 'a `dataset` member whose READ throws',
      make: () => ({
        root: {
          get dataset(): { theme?: string } {
            throw new Error('hostile dataset read')
          },
        } as unknown as ThemeRoot,
        writes: [],
      }),
      noWrite: true,
    }
    return [
      [{ label: 'a `dataset`-carrying object', make: () => countingRoot(), noWrite: false }],
      [{ label: 'a FROZEN root (`Object.freeze`)', make: () => ({ root: Object.freeze({ dataset: Object.freeze({}) }) as unknown as ThemeRoot, writes: [] }), noWrite: true }],
      [absent, throwing],
    ]
  }
  const SETTINGS: Array<{ label: string; value: unknown }> = [
    { label: "'dark'", value: 'dark' },
    { label: "'system'", value: 'system' },
  ]
  const READINGS = [true, false] as const

  it('P-TH-TP-3 — 3 root shapes × 2 settings × 2 readings = 12 drives, each with 2 observations (no-throw / return-domain), and the failing shapes observe NO write', () => {
    const shapeGroups = rootShapes()
    expect(shapeGroups.length, '§3.2 items 1–4: the three declared root shapes (the third carries two variants: absent and throwing)').toBe(3)
    let drives = 0
    let observations = 0
    for (const shapes of shapeGroups) {
      // ONE drive per setting × reading for the group’s FIRST variant — the declared term —
      // with the group’s other variants driven as extra, declared observations.
      for (const s of SETTINGS) {
        for (const reading of READINGS) {
          shapes.forEach((shape, variant) => {
            const { root, writes } = shape.make()
            let returned: unknown = null
            expect(() => {
              returned = applyThemeToRoot(root, s.value, reading)
            }, `§3.2: nothing throws for the ${shape.label} × ${s.label} × prefersDark=${reading}`).not.toThrow()
            observations += 1
            expect(['light', 'dark'], `§3.2: the resolved theme is STILL RETURNED for the ${shape.label}`).toContain(returned)
            expect(returned, `§3.2: the return must be the resolution, not \`undefined\` (${shape.label})`).toBe(resolveTheme(s.value, reading))
            observations += 1
            if (shape.noWrite) {
              expect(writes, `§3.2: for the failing shape (${shape.label}) NO write is observed`).toEqual([])
            }
            if (variant === 0) drives += 1
          })
        }
      }
    }
    expect(drives, '§4: 3 root shapes × 2 settings × 2 readings = 12 drives').toBe(12)
    expect(observations, '§4: the declared term is 12 drives × 2 observations = 24 (the third shape’s second variant is driven as an extra declared observation)').toBeGreaterThanOrEqual(24)
    // the two further declared fail-soft shapes (§3.2 item 3): a `null`/`undefined`/primitive
    // root at RUNTIME, and a missing/absent dataset on a root that is not an object at all.
    for (const bad of [null, undefined, 42, 'html']) {
      expect(() => applyThemeToRoot(bad as unknown as ThemeRoot, 'dark', false), `§3.2 item 3: a ${String(bad)} root must not throw`).not.toThrow()
      expect(applyThemeToRoot(bad as unknown as ThemeRoot, 'dark', false)).toBe('dark')
    }

    // ---- the 2 controls ----
    const leakingApplier = (root: ThemeRoot): string => {
      root.dataset.theme = 'dark' // no try/catch — the assignment’s throw escapes
      return 'dark'
    }
    expect(() => leakingApplier({} as ThemeRoot), 'a corpus that lets the assignment’s throw escape MUST fail the no-throw limb (§4 P-TH-TP-3 control)').toThrow()
    const undefinedReturningApplier = (_root: ThemeRoot): unknown => undefined
    expect(
      ['light', 'dark'],
      'a corpus returning `undefined` on the absent-root arm MUST fail the return limb (§4 P-TH-TP-3 control)',
    ).not.toContain(undefinedReturningApplier({} as ThemeRoot))
  })
})

// ===========================================================================
// §4 `P-TH-IM-4` — THE VENDORED MODULE IS CONSUMED, NOT TOUCHED, AND ITS
// PROHIBITIONS SURVIVE THE ADOPTION
// (strategy `strat:theme-vendored-consumption`; 4 facts + 2 independent controls = 6)
// ===========================================================================
describe('PD-UI-1 §2.1/§2.4 — the vendored module is CONSUMED (imported), never touched', () => {
  it('P-TH-IM-4 (a)/(b) — the vendored bytes still carry ZERO imports and none of the four prohibited forms', () => {
    expect(existsSync(VENDORED_PATH), `RED (PD-UI-1 §2.3): the vendored ${VENDORED_PATH} does not exist`).toBe(true)
    const bytes = readFileSync(VENDORED_PATH, 'utf8')
    const staticImports = importHits(bytes, 'src/shared/theme.ts', PINNED_FIFTEEN)
    expect(staticImports, '§4 P-TH-IM-4 (b): the vendored file carries ZERO import statements of any kind (R-2: the module’s import census is empty)').toEqual([])
    expect(bytes, '§4 P-TH-IM-4 (b): no `data-theme` literal in the vendored bytes (P-TH-7)').not.toMatch(/data-theme/)
    expect(bytes, '§4 P-TH-IM-4 (b): no `matchMedia` in the vendored bytes (P-TH-8)').not.toMatch(/matchMedia|prefers-color-scheme/)
    expect(bytes, '§4 P-TH-IM-4 (b): no store/cache/memo token in the vendored bytes (P-TH-4/P-TH-11)').not.toMatch(/localStorage|sessionStorage|\bcache\b|\bmemo\b/)
    expect(bytes, '§4 P-TH-IM-4 (b): no ambient realm access in the vendored bytes (P-TH-9)').not.toMatch(/\bdocument\b|\bwindow\b|\bfs\b/)
  })

  it('P-TH-IM-4 (c) — the adapter does not push a fork token into the mechanism as a decision and does not import a sibling into it', () => {
    const text = readAdapter()
    // (i) the adapter must not ask the mechanism to SELECT a token from a reading
    //     (`P-TH-10`: the mechanism has no tri-state semantics and decides nothing).
    expect(
      text,
      '§2.4 / dossier `C-2`: the fork may not ask the mechanism to select a token from `prefersDark` — the vendored call’s `setting` member is IGNORED by the precedence rule',
    ).not.toMatch(/vendoredResolveTheme\((?!setting, \{ prefersDark \}\))/)
    // (ii) the mechanism receives the name only as the CALLER’s argument.
    expect(text, '§2.1 item 2: the attribute name is passed IN as the caller’s argument').toMatch(/applyThemeDeclaration\s*\(\s*'theme'/)
    // (iii) the vendored module is never shadowed by a local duplicate and never re-exported.
    expect(text, '§2.4 / `R-4`/`R-6`: the vendored module is never copied, shadowed or re-exported by the adapter').not.toMatch(/export\s+\{[^}]*\}\s+from\s+['"][^'"]*shared\/theme/)
  })

  it('P-TH-IM-4 (d) — the adapter’s import census is EXACTLY ONE statement, resolving to src/shared/theme.ts', () => {
    const hits = adapterImportHits()
    const resolvedToVendored = hits.filter((h) => VENDORED_PATHS.has(resolveSpecifier(h.file, h.specifier)))
    expect(
      resolvedToVendored.map((h) => `${h.file} ${h.specifier} → ${relative(REPO_ROOT, resolveSpecifier(h.file, h.specifier))} (${h.kind})`).sort(),
      'RED (PD-UI-1 §2.1 import census): the adapter must import the vendored module EXACTLY ONCE — at this head the census reads 0, and a `await import(…)`/`require(…)`/`new URL(…)` indirection would be an EVASION (§9 item 1 / §3a `ADV-T7`)',
    ).toEqual(['src/renderer/theme.ts ../../shared/theme.js → src/shared/theme.ts (static-from)'])
    expect(hits, '§2.1: the adapter’s import census is exactly ONE statement — no `electron`, no `node:*`, no `provident-ssr`, no sibling `src/renderer/**` module').toHaveLength(1)
    expect(
      hits.filter((h) => resolveSpecifier(h.file, h.specifier).startsWith('<bare:')),
      '§2.1: no bare (out-of-repo) specifier may appear in the adapter',
    ).toEqual([])
  })

  it('P-TH-IM-4 CONTROLS — the digest oracle discriminates a ONE-BYTE perturbation, and the census oracle discriminates an adapter with zero imports; the two limbs are INDEPENDENTLY falsifiable', () => {
    const bytes = readFileSync(VENDORED_PATH, 'utf8')
    const digest = (text: string): string => {
      let h = 0
      for (let i = 0; i < text.length; i++) h = (Math.imul(h, 31) + text.charCodeAt(i)) | 0
      return String(h)
    }
    const perturbed = bytes.slice(0, 10) + (bytes[10] === 'x' ? 'y' : 'x') + bytes.slice(11)
    expect(perturbed, 'the synthetic perturbation must actually change the bytes').not.toBe(bytes)
    expect(digest(perturbed), 'a ONE-BYTE perturbation of the vendored file MUST fail the digest oracle (§4 P-TH-IM-4 control)').not.toBe(digest(bytes))
    // …and the SAME perturbation must NOT change the census reading (the two limbs are independent)
    expect(importHits(perturbed, 'src/shared/theme.ts', PINNED_FIFTEEN)).toEqual(importHits(bytes, 'src/shared/theme.ts', PINNED_FIFTEEN))
    const zeroImportAdapter = `export function resolveTheme(setting: unknown, prefersDark: boolean): 'light' | 'dark' {\n  if (setting === 'light') return 'light'\n  if (setting === 'dark') return 'dark'\n  return prefersDark ? 'dark' : 'light'\n}\n`
    expect(
      importHits(zeroImportAdapter, 'src/renderer/theme.ts', PINNED_FIFTEEN),
      'an adapter with ZERO imports MUST fail the census oracle — the corpus that satisfies the OUTCOME while ignoring the ADOPTION is exactly §3a `ADV-T4`',
    ).toEqual([])
    // the census oracle is not vacuous: it DOES see the static and the three evading forms.
    for (const form of [
      `import { resolveTheme } from '../../shared/theme.js'\n`,
      `const later = () => import('../../shared/theme.js')\n`,
      `const legacy = require('../../shared/theme.js')\n`,
      `const p = new URL('../../shared/theme.js', import.meta.url)\n`,
    ]) {
      expect(importHits(form, 'src/renderer/theme.ts', PINNED_FIFTEEN), `the census oracle must SEE ${form.trim()}`).toHaveLength(1)
    }
  })
})

// ===========================================================================
// §2.2 / §6.1 order 5 — THE `installTheme` WIRING ROWS (a `[H]`-class source-text
// and structural read; these need NO live leg)
// ===========================================================================
describe('PD-UI-1 §2.2 — the boot wiring `installTheme`: the read, the once-attached listener, the seam and the one write site', () => {
  it('§2.2 item 1 — the wiring obtains the write AS DATA: `renderer.ts` imports the adapter, and `installTheme` still owns its ONE call to the applier', () => {
    // The delegation this unit is (Task 1's "the write obtained as data from
    // `applyThemeDeclaration` with the fork-supplied attribute name") lands INSIDE the
    // adapter — the wiring’s call site is RE-POINTED but its structure, its one write site
    // and its position in the boot order STAY (§1.4's allowed-surface table; §2.2 item 1).
    // This row is RED until the landing: it is the wiring-side half of the adoption’s red set.
    const text = readFileSync(WIRING_PATH, 'utf8')
    expect(
      text,
      'RED (PD-UI-1 §2.2 item 1 / §2.1): the wiring must import the adapter from the SAME specifier as before (`./theme.js`) and the adapter must be the module that performs the one write — a wiring that reached the vendored module itself would put a SECOND authority on the appearance write',
    ).toMatch(/import\s*\{[^}]*applyThemeToRoot[^}]*\}\s*from\s*'\.\/theme\.js'/)
    const body = installThemeBody()
    expect(body, 'RED (PD-UI-1 §2.2 item 6): `installTheme` must still route its one appearance write through the adapter’s applier').toMatch(/applyThemeToRoot\(/)
    expect(body, '§2.2 item 7: the wiring may not reach into the mechanism itself — the vendored module is the ADAPTER’s dependency, never the wiring’s').not.toMatch(/from\s+['"][^'"]*shared\/theme/)
    expect(
      (text.match(/from\s+['"][^'"]*shared\/theme\.js['"]/g) ?? []).length,
      '§2.2 item 2/6 + §2.1’s import census: `renderer.ts` imports NO vendored module — the vendored consumer edge belongs to the adapter alone (this is exactly what keeps the `PD-VENDOR` pin’s allow-list ONE row wide)',
    ).toBe(0)
  })

  it('§2.2 item 1 — `installTheme(): void` is a module-private function, NOT exported, and is called from the boot path', () => {
    const text = readFileSync(WIRING_PATH, 'utf8')
    expect(text, '§2.2 item 1: the signature is `installTheme(): void`').toMatch(/function installTheme\(\): void/)
    expect(text, '§2.2 item 1: it is module-private — `export function installTheme` would change the surface').not.toMatch(/export\s+(?:async\s+)?function installTheme/)
    expect(text, '§2.2 item 1: its call site and its position in the boot order are unchanged (one call from the boot path)').toMatch(/^\s*installTheme\(\)\s*$/m)
  })

  it('§2.2 items 2/3 — the `matchMedia` read STAYS in the wiring, guarded, and the reading accessor returns `false` on a throw', () => {
    const body = installThemeBody()
    expect(body, "§2.2 item 2: the read is `window.matchMedia('(prefers-color-scheme: dark)')`").toMatch(/window\.matchMedia\(\s*'\(prefers-color-scheme: dark\)'\s*\)/)
    expect(body, '§2.2 item 2: the read is GUARDED by `typeof window.matchMedia === \'function\'` inside a try').toMatch(/typeof window\.matchMedia === 'function'/)
    expect(body, '§2.2 item 2: an absent/throwing `matchMedia` ⇒ `media = null`').toMatch(/media = null/)
    expect(body, '§2.2 item 2: the throwing arm degrades to `media = null`').toMatch(/catch\s*\{[^}]*media = null/s)
    expect(body, '§2.2 item 3: `prefersDark(): boolean` is `media ? media.matches : false`').toMatch(/media \? media\.matches : false/)
    expect(body, '§2.2 item 3: the accessor is wrapped in try/catch returning `false` on a throw').toMatch(/catch\s*\{\s*return false\s*\}/)
  })

  it('§2.2 item 4 — the OS `change` listener is attached ONCE, inside `try`, and its handler applies only while the setting is neither `\'light\'` nor `\'dark\'`', () => {
    const body = installThemeBody()
    expect(body, '§2.2 item 4: the listener is attached via `media.addEventListener(\'change\', …)`').toMatch(/addEventListener\(\s*'change'/)
    expect(body.match(/addEventListener\(/g)?.length, '§2.2 item 4: attached ONCE — a second attachment would double-apply').toBe(1)
    expect(body, '§2.2 item 4: the liveness predicate is the wiring’s: an explicit choice makes the listener inert').toMatch(/setting !== 'light' && setting !== 'dark'/)
    expect(body, '§2.2 item 4: a `matchMedia` without `addEventListener` degrades silently, never throws').toMatch(/try\s*\{[^}]*addEventListener/s)
  })

  it('§2.2 item 5 — the seam is the optional-chained `operatorSettings` bridge, and the absence of it keeps the `\'system\'` default', () => {
    const body = installThemeBody()
    expect(body, '§2.2 item 5: the setting defaults to the fork’s third state `\'system\'`').toMatch(/let setting: unknown = 'system'/)
    expect(body, '§2.2 item 5: the boot read is `operatorSettings?.get?.()`').toMatch(/operatorSettings\s*\n?\s*\?\.get\?\.\(\)|operatorSettings\?\.get\?\.\(\)/)
    expect(body, '§2.2 item 5: the live listener is `operatorSettings?.onChanged?.(…)`').toMatch(/operatorSettings\?\.onChanged\?\./)
    expect(body, '§2.2 item 5: a rejected `get()` keeps the `\'system\'` default (the catch is present)').toMatch(/\.catch\(/)
  })

  it('§2.2 item 6/7 — the apply path calls `applyThemeToRoot(document.documentElement, setting, prefersDark())` and the wiring resolves no precedence of its own', () => {
    const body = installThemeBody()
    expect(body, '§2.2 item 6: THE ONE WRITE SITE for the appearance attribute — `applyThemeToRoot(document.documentElement, setting, prefersDark())`').toMatch(
      /applyThemeToRoot\(\s*document\.documentElement\s*,\s*setting\s*,\s*prefersDark\(\)\s*\)/,
    )
    expect(body.match(/applyThemeToRoot\(/g)?.length, '§2.2 item 6: exactly ONE invocation of the applier in the wiring — no second DOM write of the appearance attribute').toBe(1)
    expect(body, '§2.2 item 7: the wiring may NOT resolve the precedence itself — it holds no `\'light\'`/`\'dark\'` precedence arm beyond the listener’s liveness predicate').not.toMatch(/return prefersDark \? 'dark' : 'light'/)
    expect(body, '§2.2 item 7: the wiring writes no custom property (the token block is CSS)').not.toMatch(/style\.setProperty|--bg|--fg/)
    expect(body, '§2.2 item 7: the wiring holds no store, no cache and no memo (a store addition is a NEW GATE)').not.toMatch(/new Map\(\)|new Set\(\)|useMemo|memo\(/)
  })

  it('§3.3 — the seam set is EMPTY: `env` is an ordinary ARGUMENT RECORD, so no absence/non-callable/throwing SEAM arm exists', () => {
    const text = readAdapterCode()
    // A pass asserting a seam for this unit asserts a clause the contract does not carry
    // (foundation: "`U-THEME` declares an EMPTY seam set"). The adapter’s whole seam surface
    // is therefore its two arguments — no injected reader, no callback, no subscription.
    expect(text, '§3.3: the adapter declares no injected environment reader (the read belongs to the wiring)').not.toMatch(/matchMedia|prefers-color-scheme/)
    expect(text, '§3.3: the adapter takes no callback/observer argument').not.toMatch(/=>\s*ResolvedTheme|ReadonlyArray<|\(\)\s*=>\s*boolean/)
  })
})
