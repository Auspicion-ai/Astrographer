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
//     §4              the typed register: `P-TH-IM-1` (28 ⟨A-6⟩), `P-TH-IM-2` (26),
//                     `P-TH-TP-1` (67 ⟨A-6⟩), `P-TH-TP-2` (24 ⟨A-7⟩), `P-TH-TP-3` (27 ⟨A-3⟩)
//                     — the filed terms were 20 / 26 / 59 / 20 / 26 and are printed as the
//                     SUPERSEDED figures in the sibling register file's arithmetic
//     §6.1            the red-set plan, in authoring order
//     §6.4            the `[T]`-side obligations the red set carries by name
//     §3a             THE ADVERSARIAL RECORD (`A-1`..`A-13`) and the five negative
//                     generators its PBT audit tasked to the TestWriter — the corrections
//                     applied in this file are grouped by id in the REMAND block below
//   docs/specs/pd-ui-1-adoption-dossier.md
//     §1 rows 1–6    the adopted identifiers and their `defined` status
//     §2 `C-1`..`C-3` the collision reconciliations (layer, never relaxation)
//
// ===========================================================================
// ⟨ONE-PASS REMAND 2026-09-28 — the gate-4 adversarial oracle corrections (unit spec
// `§3a`), each with HOW ITS DISCRIMINATOR IS PROVEN.⟩
//  A-2 (HIGH, the headline) — THE ENV-READING DELEGATION WAS BEHAVIOURALLY UNOBSERVABLE:
//      the mechanism's `prefersDark` is definitionally equal to the raw `=== true` reading
//      for EVERY input, so no value row could tell "reads the returned record" from
//      "applies the same strict test to the raw argument". The audit tasked a
//      MOCKED-RECORD generator: a record whose `prefersDark` is INVERTED against the raw
//      argument, and a declaration whose `value` DIFFERS from the resolution, with the
//      adapter required to follow the RETURNED RECORD. A `vi.mock(…)` CANNOT be used here:
//      `tests/pd-vendor-set.test.ts`'s frozen `§3a A-12` census pins the EXACT set of
//      `tests/**` files that bind the vitest mock API, and that pin is NOT this unit's to
//      edit. MEASURED (probe run, then reverted): the mock reds it —
//      `expected [ …(5) ] to deeply equal [ …(4) ]`, this file named as the 5th binder.
//      The generator is therefore driven by DEPENDENCY INJECTION instead of a module mock:
//      the LANDED adapter's own bytes are compiled and evaluated with ONLY its (single)
//      import declaration replaced by a destructuring bind of the stub
//      (`instantiateAdapter`). A FAITHFULNESS limb proves the instantiation reproduces the
//      imported adapter's behaviour exactly, so the generator's subject IS the landed
//      artifact; and the pass's STRONGEST FALSE-GREEN, reproduced verbatim in substance
//      (`FALSE_GREEN_SOURCE`), is driven against BOTH the old oracles (it passes them —
//      that is the finding) and the new one (it fails — that is the correction).
//  A-3  the failing root shapes are made OBSERVABLE: recording Proxies over a frozen / an
//       absent / a throwing target, so "the write was ATTEMPTED and REFUSED" is a reading
//       rather than an empty array the test itself created.
//  A-4  an AST oracle (`writeSiteOracle`) over synthetic corpora requires the write site's
//       RHS to be the RECORD's `value` member binding; an `resolved` RHS MUST fail.
//  A-5  `P-TH-IM-2` counts EXACTLY its declared 11 env shapes (the genuine own ACCESSOR
//       included), 2 observations each = 22, and the tautological `f(x) === f(x)` agreement
//       limb is replaced by the record-following generator.
//  A-6  `''` and a boxed `String` join the precedence GRID and the HOSTILE list; the two
//       affected terms GROW and are printed with their new sums (IM-1 20 → 28, TP-1 59 →
//       67) in this file's rows and in the register file's arithmetic.
//  A-7  the removal branch is DRIVEN under BOTH readings the spec leaves open (SKIP /
//       DELETE) and a `writes ''` corpus must FAIL both — the spec's `§2.1` item 3 is the
//       ruling site and rules NEITHER, so this is ESCALATED, never decided here.
//  A-9  the stale "recorded as a nit in §2.1" comment now cites the DATED CORRECTION.
//  A-12 the imported member must appear in a VALUE-BEARING, non-`void` position
//       (`importedMemberUseOracle`) — an unused binding or a `void` reference MUST fail.
//  NO MOCK IS BOUND BY THIS FILE in ANY form (`vi.mock`, `vi['mock']`, an alias): the
//  protected `'electron'` census and the `A-12` mock-binding census are BOTH untouched.
// ===========================================================================
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
// `G-9`/`X-9` PIN SAFETY (§1.4 / §6.4 item 1–2): this file binds the vitest mock API in NO
// access form — no `vi.mock`, no `vi['mock']`, no alias of `vi`. In particular it does NOT
// mock `'electron'` (the protected bridge-mock census pins the exact five-name set) and it
// does NOT join `tests/pd-vendor-set.test.ts`'s frozen `§3a A-12` mock-binding census (which
// pins the exact four non-`'electron'` binders — see the REMAND block above for the MEASURED
// probe that makes this a constraint rather than a preference). The `A-2` generator is driven
// by dependency injection of the vendored module's two exports into the LANDED adapter's own
// bytes. It reads NEITHER `vitest.config.ts`'s pinned keys as a subject, NOR
// `src/main/markdown-import.ts`, NOR the two fence files, NOR any vendored byte — it only
// READS `src/shared/theme.ts` (the adoption's own target) and asserts the absences the
// register requires.
//
// STATE MACHINE (the states this file enumerates, before the rows drive them):
//   `setting`      : 'light' (explicit) · 'dark' (explicit) · 'system' (the fork's third
//                    persisted state, NOT a third state of the resolver) · '' (A-6: the
//                    spec's own clause 3 names it FIRST) · a BOXED `String` (A-6: the
//                    canonical "looks explicit but follows the OS" case) · undefined ·
//                    null · a number · a boolean · a bigint · a Symbol · an array · a Map ·
//                    a function · an object with a callable `toString`/`valueOf` · a Proxy ·
//                    a revoked Proxy (§2.1 clause 3, §3.2 item 6)
//   `prefersDark`  : true · false · a truthy non-boolean 1 · a truthy non-boolean 'true'
//                    (§2.1 clause 4 — only `=== true` yields 'dark')
//   `root`         : { dataset: {} } · a `ShimElement` · a root with a COUNTING dataset ·
//                    a recording Proxy over a FROZEN target (the attempt is recorded and
//                    refused) · a root with a recording, THROWING `dataset` read · {} ·
//                    null · undefined · a primitive (§3.2 items 1–4; A-3's correction)
//   `env`          : undefined(omitted) · null · 42 · 'x' · {} · {prefersDark:true} ·
//                    {prefersDark:false} · an INHERITED true · a trap-only Proxy ·
//                    {prefersDark:1} · a throwing accessor · a genuine own accessor
//                    (§3.1 items 3–11)
//   write record   : the value branch `{name, value, removal:false}` · the removal branch
//                    `{name, value:'', removal:true}` (§3.1 items 12–15; §3.2 item 5)
//   the RECORD     : the real mechanism's record · an INVERTED `prefersDark` against the raw
//                    argument · a `value` that DIFFERS from the resolution · a
//                    `removal: true` record on a reachable call (A-2 / A-7 generators)

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
const REGISTER_SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-pd-ui-1-theme.md')

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
// THE REMAND'S GENERATORS AND ORACLES (unit spec §3a `A-2` / `A-3` / `A-4` / `A-7` /
// `A-12`), every one of them driven WITHOUT binding the vitest mock API — see the REMAND
// block in this file's header for the MEASURED reason (the frozen `A-12` census).
// ===========================================================================

/** `A-3` — a recording root over a FROZEN target: the `set` trap RECORDS the attempt and then
 *  THROWS (the throw is absorbed by the adapter's total contract, §3.2 item 2). The failing
 *  shape is therefore OBSERVABLE — "attempted and refused" is a reading, never an empty array
 *  this test created. */
function recordingFrozenRoot(): {
  root: ThemeRoot
  attempts: Array<{ key: string; value: unknown }>
  landed: () => unknown
} {
  const attempts: Array<{ key: string; value: unknown }> = []
  const target = Object.freeze({}) as { theme?: string }
  const dataset = new Proxy(target, {
    set(_t, key, value): boolean {
      attempts.push({ key: String(key), value })
      throw new TypeError('frozen target — the assignment is refused')
    },
  })
  return { root: { dataset } as ThemeRoot, attempts, landed: () => (target as { theme?: unknown }).theme }
}

/** `A-3` — a recording root whose `dataset` READ THROWS: the ACCESS is recorded, so the
 *  adapter's attempt to reach the ONE write site is observed rather than assumed. */
function recordingThrowingDatasetRoot(): { root: ThemeRoot; events: Array<{ key: string; value: unknown }> } {
  const events: Array<{ key: string; value: unknown }> = []
  const root = new Proxy(
    {},
    {
      get(t, key): unknown {
        if (key === 'dataset') {
          events.push({ key: 'dataset', value: '<read-throws>' })
          throw new Error('hostile dataset read')
        }
        return Reflect.get(t, key)
      },
    },
  )
  return { root: root as ThemeRoot, events }
}

/** The vendored module's two exports, as the generator injects them. */
interface AdoptedStub {
  resolveTheme: (setting: unknown, env: unknown) => { setting: string | null; prefersDark: boolean; source: 'env' | 'degraded-env' }
  applyThemeDeclaration: (attributeName: unknown, resolved: unknown) => { name: string | null; value: string; removal: boolean }
}

/** The REAL mechanism, injected — used to prove the instantiation is FAITHFUL. */
const REAL_STUB: AdoptedStub = {
  resolveTheme: (setting, env) => vendoredResolveTheme(setting, env),
  applyThemeDeclaration: (attributeName, resolved) => vendoredApplyThemeDeclaration(attributeName, resolved),
}

/** `A-2`'s negative generator: the returned RECORD's `prefersDark` is INVERTED against the raw
 *  argument, AND the declaration's `value` DIFFERS from the resolution. An adapter that reads
 *  the raw argument, or writes the resolution, cannot follow this record. */
const RECORD_VALUE_MARKER = 'record:'
const INVERTED_RECORD_STUB: AdoptedStub = {
  resolveTheme: (setting, env) => {
    const record = vendoredResolveTheme(setting, env)
    return { ...record, prefersDark: !record.prefersDark }
  },
  applyThemeDeclaration: (attributeName, resolved) => {
    const write = vendoredApplyThemeDeclaration(attributeName, resolved)
    return { ...write, value: `${RECORD_VALUE_MARKER}${write.value}` }
  },
}

/** `A-7`'s generator: a `removal: true` record on a REACHABLE call (§3.2 item 5 declares the
 *  branch unreachable through the resolver, so it can only be driven by injecting the record). */
const REMOVAL_RECORD_STUB: AdoptedStub = {
  resolveTheme: (setting, env) => vendoredResolveTheme(setting, env),
  applyThemeDeclaration: (attributeName) => ({ name: typeof attributeName === 'string' && attributeName !== '' ? attributeName : null, value: '', removal: true }),
}

/** The LANDED adapter's own bytes, compiled and evaluated with ONLY its (single) import
 *  declaration replaced by a destructuring bind of `stub`. Every other byte is the landed
 *  source, so the generator's subject is the landed artifact and not a re-write of it. */
function instantiateAdapter(sourceText: string, stub: AdoptedStub): {
  resolveTheme: (setting: unknown, prefersDark: boolean) => unknown
  applyThemeToRoot: (root: unknown, setting: unknown, prefersDark: boolean) => unknown
} {
  const sf = ts.createSourceFile('corpus-adapter.ts', sourceText, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const imports = sf.statements.filter(ts.isImportDeclaration)
  expect(
    imports.length,
    'the generator needs the corpus to carry EXACTLY ONE import declaration (the vendored edge), so the injection site is unambiguous',
  ).toBe(1)
  const decl = imports[0]!
  const named = decl.importClause?.namedBindings
  expect(
    named !== undefined && ts.isNamedImports(named),
    'the corpus must import the vendored module by NAMED bindings (a namespace/default form would not be injectable this way)',
  ).toBe(true)
  const bindings = (named as ts.NamedImports).elements.map((el) => `${(el.propertyName ?? el.name).text}: ${el.name.text}`)
  const replacement = `const { ${bindings.join(', ')} } = __ADOPTED_STUB__`
  const transformed = sourceText.slice(0, decl.getStart(sf)) + replacement + sourceText.slice(decl.getEnd())
  const js = ts.transpileModule(transformed, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText
  const mod: { exports: Record<string, unknown> } = { exports: {} }
  new Function('exports', '__ADOPTED_STUB__', js)(mod.exports, stub)
  const resolveTheme = mod.exports.resolveTheme
  const applyThemeToRoot = mod.exports.applyThemeToRoot
  expect(typeof resolveTheme, 'the instantiated corpus must export `resolveTheme`').toBe('function')
  expect(typeof applyThemeToRoot, 'the instantiated corpus must export `applyThemeToRoot`').toBe('function')
  return {
    resolveTheme: resolveTheme as (setting: unknown, prefersDark: boolean) => unknown,
    applyThemeToRoot: applyThemeToRoot as (root: unknown, setting: unknown, prefersDark: boolean) => unknown,
  }
}

/** THE STRONGEST FALSE-GREEN, verbatim in substance from unit spec §3a: it imports the
 *  vendored module once and calls BOTH exports, then DISCARDS the returned record's members
 *  (`void resolution.prefersDark`, `void write.removal`), derives the OS arm from the RAW
 *  argument with the same `=== true` test, and writes `resolved` instead of `write.value`.
 *  The pass proved it satisfies the import census, the allow-list, both source-token probes
 *  and ALL rows at the red head; the oracle below must reject it. */
const FALSE_GREEN_SOURCE = [
  "import { resolveTheme as adoptedResolveTheme, applyThemeDeclaration } from '../shared/theme.js'",
  '',
  "export type ResolvedTheme = 'light' | 'dark'",
  'export interface ThemeRoot { dataset: { theme?: string } }',
  '',
  'export function resolveTheme(setting: unknown, prefersDark: boolean): ResolvedTheme {',
  '  const resolution = adoptedResolveTheme(setting, { prefersDark })',
  '  void resolution.prefersDark',
  "  const followsOs: ResolvedTheme = prefersDark === true ? 'dark' : 'light'",
  "  if (setting === 'light') return 'light'",
  "  if (setting === 'dark') return 'dark'",
  '  return followsOs',
  '}',
  '',
  'export function applyThemeToRoot(root: ThemeRoot, setting: unknown, prefersDark: boolean): ResolvedTheme {',
  '  const resolved = resolveTheme(setting, prefersDark)',
  "  const write = applyThemeDeclaration('theme', resolved)",
  '  void write.removal',
  '  try {',
  '    root.dataset.theme = resolved',
  '  } catch {}',
  '  return resolved',
  '}',
  '',
].join('\n')

/** `A-4` — the write-site AST oracle: EVERY assignment to `<root>.dataset.theme` must take its
 *  RHS from the write RECORD's `value` member, where the record is the binding initialised by
 *  a call to `applyThemeDeclaration`. An `resolved`-RHS corpus MUST fail. */
interface WriteSiteReading {
  recordNames: string[]
  sites: number
  rhs: string[]
  badRhs: string[]
}
function writeSiteOracle(src: string): WriteSiteReading {
  const sf = ts.createSourceFile('write-site-corpus.ts', src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const recordNames: string[] = []
  const walkNames = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer !== undefined &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === 'applyThemeDeclaration' &&
      ts.isIdentifier(node.name)
    ) {
      recordNames.push(node.name.text)
    }
    ts.forEachChild(node, walkNames)
  }
  walkNames(sf)
  const rhs: string[] = []
  const badRhs: string[] = []
  const walkSites = (node: ts.Node): void => {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const lhs = node.left
      const isWriteSite =
        ts.isPropertyAccessExpression(lhs) &&
        lhs.name.text === 'theme' &&
        ts.isPropertyAccessExpression(lhs.expression) &&
        lhs.expression.name.text === 'dataset'
      if (isWriteSite) {
        const text = node.right.getText(sf)
        rhs.push(text)
        const fromRecord =
          ts.isPropertyAccessExpression(node.right) &&
          node.right.name.text === 'value' &&
          ts.isIdentifier(node.right.expression) &&
          recordNames.includes(node.right.expression.text)
        if (!fromRecord) badRhs.push(text)
      }
    }
    ts.forEachChild(node, walkSites)
  }
  walkSites(sf)
  return { recordNames, sites: rhs.length, rhs, badRhs }
}

/** `A-12` — the imported-member USE oracle: each member of the vendored module imported by the
 *  corpus must appear as the CALLEE of a call whose RESULT IS USED (a value-bearing position).
 *  A `void adoptedResolveTheme(...)`, a bare discarded call, or an unused binding yields no
 *  value-bearing use and MUST fail. */
interface ImportedUseReading {
  imported: string[]
  valueBearing: string[]
  voidOrDiscarded: string[]
}
function importedMemberUseOracle(src: string): ImportedUseReading {
  const sf = ts.createSourceFile('imported-use-corpus.ts', src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const locals = new Map<string, string>()
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) || !ts.isStringLiteralLike(stmt.moduleSpecifier)) continue
    if (!/shared\/theme\.js$/.test(stmt.moduleSpecifier.text)) continue
    const named = stmt.importClause?.namedBindings
    if (named !== undefined && ts.isNamedImports(named)) {
      for (const el of named.elements) locals.set(el.name.text, (el.propertyName ?? el.name).text)
    }
  }
  const valueBearing: string[] = []
  const voidOrDiscarded: string[] = []
  const walk = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && locals.has(node.expression.text)) {
      const member = locals.get(node.expression.text)!
      const parent = node.parent as ts.Node
      const underVoid = parent.kind === ts.SyntaxKind.VoidExpression
      const discarded = ts.isExpressionStatement(parent)
      if (underVoid || discarded) voidOrDiscarded.push(member)
      else valueBearing.push(member)
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)
  return { imported: [...locals.values()], valueBearing, voidOrDiscarded }
}

/** `A-7` — the reading of ONE removal-record observation, against the TWO readings the spec's
 *  `§2.1` item 3 leaves open (SKIP / DELETE). The observation is the post-state of a root that
 *  PRE-CARRIED `data-theme='light'` plus the events the root's recording traps saw. Anything
 *  else — a write of `''`, of the resolution, of any other value — is `neither`, i.e. no
 *  reading the spec carries, and MUST fail. */
function removalReading(o: { after: unknown; events: Array<{ key: string; value: unknown }> }): 'skip' | 'delete' | 'neither' {
  const deleted = o.events.some((e) => e.value === '<delete>')
  if (deleted && o.after === undefined) return 'delete'
  if (o.events.length === 0 && o.after === 'light') return 'skip'
  return 'neither'
}

/** The `A-7` drive: a root that already carries the attribute, recorded through the SAME
 *  counting traps the grid uses (so a delete is observable as a `<delete>` event). */
function preThemedRoot(): { root: ThemeRoot; events: Array<{ key: string; value: unknown }>; state: () => unknown } {
  const record: { theme?: unknown } = { theme: 'light' }
  const events: Array<{ key: string; value: unknown }> = []
  const dataset = new Proxy(record, {
    set(t, key, value): boolean {
      events.push({ key: String(key), value })
      return Reflect.set(t, key, value)
    },
    deleteProperty(t, key): boolean {
      events.push({ key: String(key), value: '<delete>' })
      return Reflect.deleteProperty(t, key)
    },
  })
  return { root: { dataset } as ThemeRoot, events, state: () => record.theme }
}

/** The spec's `§2.1` item 3 paragraph — the RULING SITE for the removal branch (`A-7`). Read so
 *  the escalation is a reading of the contract rather than a claim about it. */
function specItem3Text(): string {
  const text = readFileSync(REGISTER_SPEC_PATH, 'utf8')
  const start = text.indexOf('3. It performs **exactly one** write')
  expect(start, 'RED (PD-UI-1 §2.1 item 3): the removal-branch clause is absent from the spec — the ruling site cannot be read').toBeGreaterThanOrEqual(0)
  const rest = text.slice(start)
  const end = rest.indexOf('\n\n')
  const paragraph = end < 0 ? rest : rest.slice(0, end)
  expect(paragraph.length, '§2.1 item 3 must be a substantive paragraph, not a fragment').toBeGreaterThan(200)
  return paragraph
}

// ===========================================================================
// §4 `P-TH-IM-1` — THE PRECEDENCE RULE IS KEPT, AND IT IS EVALUATED IN THE ADAPTER
// (strategy `strat:theme-precedence`; 6 × 2 = 12 cells read twice = 24; + 4 controls = 28)
//
// ⟨A-6 CORRECTION 2026-09-28 (gate-4 remand).⟩ The grid was FOUR setting shapes; it is SIX.
// `''` and a BOXED `String` join it — the two shapes the adversarial pass named as missing:
// `''` is named FIRST by this spec's own `§2.1` clause 3, and a boxed string is the canonical
// "looks explicit but follows the OS" case (it is an OBJECT, so it is neither `'light'` nor
// `'dark'` by strict identity, however it prints). The row's term therefore GROWS: 20 → 28
// (`6 × 2 × 2 = 24, + 4 controls`), printed with its new sum here and in the register file's
// arithmetic, where the superseded `20` stays visible.
// ===========================================================================
describe('PD-UI-1 §2.1 — the KEPT precedence rule (K-1: the resolver is an adapter, not a delete)', () => {
  /** The SIX setting shapes of the row's grid (§2.1 clauses 1–3; `A-6` adds the last two). */
  const SETTINGS: Array<{ label: string; value: unknown }> = [
    { label: "an explicit 'light'", value: 'light' },
    { label: "an explicit 'dark'", value: 'dark' },
    { label: "the fork's third persisted state 'system'", value: 'system' },
    { label: "the EMPTY string '' (named FIRST by §2.1 clause 3)", value: '' },
    { label: 'a BOXED String — an object that PRINTS as an explicit token', value: new String('light') },
    { label: 'an omitted setting (undefined)', value: undefined },
  ]
  const READINGS = [true, false] as const

  it('P-TH-IM-1 — every one of the 12 grid cells: an explicit choice wins, everything else follows `prefersDark === true`, and the return is a member of the closed two-member domain', () => {
    // The discriminating cells, NAMED: ('light', true) ⇒ 'light' and ('dark', false) ⇒ 'dark'.
    // An implementation that delegated the precedence to the vendored resolver — which
    // decides nothing about appearance (§1.2 (b)) — returns the OS arm in both.
    // The two `A-6` shapes are discriminating too: a resolver that consulted `String(setting)`
    // or `valueOf`/`toString` would treat the boxed `String('light')` as an explicit choice and
    // return 'light' for BOTH readings — the expectation below reds that.
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
    expect(cells.length, '§4: the grid is 6 setting shapes × 2 readings = 12 cells (⟨A-6⟩: it was 4 shapes / 8 cells)').toBe(12)
    expect(identityReadings.length + domainReadings.length, '§4: each cell is read TWICE (identity + domain) = 24 readings (⟨A-6⟩: it was 16)').toBe(24)
    // the two named discriminating cells, asserted by name so the row can never be
    // satisfied by an implementation that lets the OS win over an explicit choice.
    expect(resolveTheme('light', true), "§4 P-TH-IM-1's named discriminating cell: ('light', true) ⇒ 'light'").toBe('light')
    expect(resolveTheme('dark', false), "§4 P-TH-IM-1's named discriminating cell: ('dark', false) ⇒ 'dark'").toBe('dark')
    // …and the TWO `A-6` cells, asserted by name: the empty string and the boxed String both
    // FOLLOW THE OS (neither is `'light'`/`'dark'` by STRICT IDENTITY, and no coercion hook is
    // consulted), so both readings must move the outcome.
    expect(resolveTheme('', true), "⟨A-6⟩ `''` is not an explicit choice: it follows the OS ('dark')").toBe('dark')
    expect(resolveTheme('', false), "⟨A-6⟩ `''` follows the OS ('light')").toBe('light')
    expect(resolveTheme(new String('light'), true), '⟨A-6⟩ a BOXED String is an OBJECT — not `===` the literal — so it follows the OS').toBe('dark')
    expect(resolveTheme(new String('dark'), false), '⟨A-6⟩ a boxed `String(\'dark\')` follows the OS too, however it prints').toBe('light')

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
    // ⟨A-6⟩ a FIFTH discriminating corpus, driven through the SAME oracle: a resolver that
    // COERCES the setting (the shape the boxed `String` exists to catch) treats the boxed
    // `String('light')` as explicit and reds the grid — so the new cells are not decorative.
    const coercing = (setting: unknown, prefersDark: boolean): string => {
      const text = String(setting)
      if (text === 'light') return 'light'
      if (text === 'dark') return 'dark'
      return prefersDark ? 'dark' : 'light'
    }
    const coercionFailures = oracle(coercing)
    expect(
      coercionFailures,
      '⟨A-6⟩ a corpus that COERCES the setting MUST fail the grid on the BOXED-`String` cell — and on exactly that one: the boxed `String(\'light\')` under `prefersDark === true` is the ONLY cell where "prints as an explicit token" and "is an explicit token" differ, so the added shape carries real discrimination',
    ).toEqual(['light|true: got light'])
    const controlsDiscriminate =
      oracle(osWins).length > 0 &&
      oracle(vendoredSettingMember as (s: unknown, p: boolean) => unknown).length > 0 &&
      oracle(thirdState as (s: unknown, p: boolean) => unknown).length > 0 &&
      oracle(nonMemberString as (s: unknown, p: boolean) => unknown).length > 0
    expect(
      controlsDiscriminate,
      'all four synthetic corpora (OS-wins · the vendored record’s `setting` member · a third state · a non-member string) MUST fail the same oracle, else this row is vacuous (§4 P-TH-IM-1 control)',
    ).toBe(true)
    expect(
      24 + 4,
      '§4 P-TH-IM-1 (⟨A-6⟩-corrected term): 6 setting shapes × 2 readings × 2 observations = 24, + 4 controls = 28 (the superseded term was 4 × 2 × 2 = 16, + 4 = 20)',
    ).toBe(28)
  })
})

// ===========================================================================
// §4 `P-TH-IM-2` — THE ENV READING IS DELEGATED (strategy `strat:theme-env-reading`;
// 11 env shapes × 2 observations = 22; + 4 controls = 26)
//
// ⟨A-5 CORRECTION 2026-09-28 (gate-4 remand).⟩ The COUNTED domain is now exactly the DECLARED
// one. The row declared ELEVEN shapes — `undefined` · `null` · a primitive · `{}` ·
// `{prefersDark: true}` · `{prefersDark: false}` · an inherited `true` · a trap-only `Proxy` ·
// `{prefersDark: 1}` · a throwing accessor · **a genuine own accessor** — but the counted slice
// drove TWO separate primitive slots (`42` AND `'x'`) and DROPPED the accessor, so 24 attempts
// ran against a declared 22. Now: ELEVEN shape slots, the accessor INCLUDED, and §3.1 item 5's
// two named primitives (`42`, `'x'`) driven inside the ONE `a primitive` slot.
//
// ⟨A-2 CORRECTION 2026-09-28.⟩ The second observation was the tautology `f(x) === f(x)` (the
// adapter's outcome for the record's reading vs its outcome for the raw boolean — the same call
// with the same argument, since the mechanism's `prefersDark` IS the raw strict reading). It is
// replaced by the RECORD-FOLLOWING GENERATOR: the vendored record's `prefersDark` is INVERTED
// against the raw argument, so the two candidate implementations return DIFFERENT values for
// every one of the 11 shapes — the limb now discriminates.
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

  /** §3.1 items 3–11 — the closed, pinned enumeration of env shapes: EXACTLY ELEVEN slots,
   *  the genuine own ACCESSOR included (`A-5`). `envs` carries the shape's `env` argument(s):
   *  the `a primitive` slot drives §3.1 item 5's two named primitives inside the ONE slot. */
  const ENV_SHAPES: Array<{
    label: string
    shape: string
    envs: unknown[]
    prefersDark: boolean
    source: 'env' | 'degraded-env'
  }> = [
    { label: 'env omitted', shape: 'undefined', envs: [undefined], prefersDark: false, source: 'degraded-env' },
    { label: 'env null', shape: 'null', envs: [null], prefersDark: false, source: 'degraded-env' },
    { label: 'env a primitive (42 · \'x\')', shape: 'a primitive', envs: [42, 'x'], prefersDark: false, source: 'degraded-env' },
    { label: 'env an object with NO own member', shape: '{}', envs: [{}], prefersDark: false, source: 'degraded-env' },
    { label: 'env {prefersDark: true}', shape: '{prefersDark: true}', envs: [{ prefersDark: true }], prefersDark: true, source: 'env' },
    { label: 'env {prefersDark: false} — a NORMAL reading', shape: '{prefersDark: false}', envs: [{ prefersDark: false }], prefersDark: false, source: 'env' },
    { label: 'env with an INHERITED true (not an own member)', shape: 'Object.create({prefersDark: true})', envs: [inheritedTrueEnv()], prefersDark: false, source: 'degraded-env' },
    { label: 'env a trap-only Proxy exposing NO own member', shape: 'new Proxy(…, {get: () => true, has: () => true})', envs: [trapOnlyProxyEnv()], prefersDark: false, source: 'degraded-env' },
    { label: 'env with a NON-boolean own member {prefersDark: 1}', shape: '{prefersDark: 1}', envs: [{ prefersDark: 1 }], prefersDark: false, source: 'degraded-env' },
    { label: 'env whose own-member read THROWS', shape: 'a throwing accessor', envs: [throwingAccessorEnv()], prefersDark: false, source: 'degraded-env' },
    { label: 'env a container with a GENUINE own accessor returning a strict boolean', shape: 'a genuine own accessor', envs: [genuineOwnAccessorEnv()], prefersDark: true, source: 'env' },
  ]

  /** The `A-2` generator, instantiated ONCE from the landed adapter's own bytes: every drive
   *  below hands it a reading and requires it to follow the INVERTED record instead. */
  function recordFollowingAdapter(): ReturnType<typeof instantiateAdapter> {
    return instantiateAdapter(readAdapter(), INVERTED_RECORD_STUB)
  }

  /** §3.1 items 3–11 — the vendored resolver's declared record for each shape. The row drives
   *  the VENDORED function first (it exists and is green), then the adapter's AGREEMENT — but
   *  the agreement limb is the `A-2` GENERATOR: the record's `prefersDark` is INVERTED against
   *  the raw argument, so "reads the returned record" and "re-reads the raw argument" return
   *  DIFFERENT themes in every one of the 11 shapes, and the limb discriminates. */
  it('P-TH-IM-2 — every one of the 11 env shapes: the vendored record is the DECLARED one, nothing throws, and the adapter follows THAT RECORD (never the raw argument)', () => {
    expect(ENV_SHAPES.length, '§3.1 items 3–11 (⟨A-5⟩ corrected): the counted enumeration is EXACTLY 11 shapes, the genuine own accessor INCLUDED — the superseded reading counted 12 (two primitive slots, the accessor dropped)').toBe(11)
    const generator = recordFollowingAdapter()
    // FAITHFULNESS: with the REAL mechanism injected, the instantiation must reproduce the
    // IMPORTED adapter exactly — otherwise the generator's subject would be the transform.
    const faithful = instantiateAdapter(readAdapter(), REAL_STUB)
    for (const s of ENV_SHAPES) {
      const probe = resolveTheme('system', s.prefersDark)
      expect(faithful.resolveTheme('system', s.prefersDark), `the generator's FAITHFULNESS limb: with the REAL record injected, the instantiation must equal the imported adapter (${s.label})`).toBe(probe)
    }
    let observations = 0
    for (const s of ENV_SHAPES) {
      for (const env of s.envs) {
        let record: { setting: unknown; prefersDark: unknown; source: unknown } | null = null
        expect(() => {
          record = vendoredResolveTheme('system', env) as { setting: unknown; prefersDark: unknown; source: unknown }
        }, `§3.1 item 16: the vendored resolver is TOTAL — it must not throw for ${s.label}`).not.toThrow()
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
      }
      observations += 1

      // ---- OBSERVATION 2 — THE `A-2` RECORD-FOLLOWING GENERATOR ----
      // The reading the RECORD supplies, and the two candidate implementations' outcomes:
      //   · an adapter that READS THE RECORD returns the INVERTED appearance (the generator's);
      //   · an adapter that re-applies the strict test to the RAW ARGUMENT returns the raw
      //     appearance. The two are DIFFERENT for every one of the 11 shapes, so the limb is
      //     discriminating in every cell — and the generator is instantiated from the LANDED
      //     adapter's own bytes, so it is the landed artifact that is being required to comply.
      const recordReading = s.prefersDark
      const invertedAppearance = recordReading === true ? 'light' : 'dark'
      const rawArgumentAppearance = recordReading === true ? 'dark' : 'light'
      expect(
        rawArgumentAppearance,
        `⟨A-2⟩ the generator must make the two candidates DISAGREE (${s.label}) — else the limb is vacuous`,
      ).not.toBe(invertedAppearance)
      expect(
        generator.resolveTheme('system', recordReading),
        `⟨A-2⟩ ${s.label}: handed \`prefersDark = ${String(recordReading)}\`, the adapter must FOLLOW THE RETURNED RECORD (⇒ '${invertedAppearance}') — the raw-argument corpus (§3a's strongest false-green) returns '${rawArgumentAppearance}' here`,
      ).toBe(invertedAppearance)
      observations += 1
    }
    expect(
      observations,
      '§4 P-TH-IM-2 (⟨A-5⟩ corrected term): 11 declared env shapes × 2 observations (the declared record + the adapter’s record-following) = 22 — EXACTLY the declared term, with no bonus drives (the superseded reading drove 24 against a declared 22)',
    ).toBe(22)

    // ---- the 4 controls ----
    const truthyEnvRead = (env: unknown): boolean => {
      const e = env as { prefersDark?: unknown } | null
      return !!(e && e.prefersDark)
    }
    // ① a corpus reading `env` TRUTHILY passes for {prefersDark: true} but must FAIL for the
    //    three shapes whose member is not a strict boolean / is not an own member.
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
    // ② a corpus reading the member through a HOSTILE accessor MUST record its invocation and
    //    fail — the mirror of the zero-count assertion the row’s in-loop reading carries.
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
    // ③ THE STRONGEST FALSE-GREEN, driven through the SAME generator oracle: it calls both
    //    vendored exports and DISCARDS the record, deriving the OS arm from the raw argument.
    //    It MUST fail the record-following limb in EVERY shape — this is `A-2`'s correction
    //    proven in the negative direction.
    const falseGreen = instantiateAdapter(FALSE_GREEN_SOURCE, INVERTED_RECORD_STUB)
    const falseGreenFailures = ENV_SHAPES.filter((s) => falseGreen.resolveTheme('system', s.prefersDark) !== (s.prefersDark === true ? 'light' : 'dark'))
    expect(
      falseGreenFailures.length,
      '⟨A-2⟩ the strongest false-green (§3a: reads the record, then discards its members and re-applies the strict test to the RAW argument) MUST fail the record-following limb in EVERY one of the 11 shapes',
    ).toBe(11)
    // …and the SAME corpus is INDISTINGUISHABLE from the adapter under the REAL mechanism —
    // which is the finding: no value row at the red head could tell the two apart.
    const falseGreenReal = instantiateAdapter(FALSE_GREEN_SOURCE, REAL_STUB)
    const indistinguishable = ENV_SHAPES.filter((s) => falseGreenReal.resolveTheme('system', s.prefersDark) !== resolveTheme('system', s.prefersDark))
    expect(
      indistinguishable,
      '⟨A-2⟩ …and under the REAL mechanism the false-green agrees with the landed adapter in EVERY shape — the two are behaviourally indistinguishable, so only the INVERTED record can separate them',
    ).toEqual([])
    // ④ …whereas the VENDORED resolver reads the same container by its OWN-PROPERTY DESCRIPTOR
    //    and, for a genuine own ACCESSOR, CALLS it (`§3.1` item 11) — the reading is taken from
    //    the member the descriptor names, never from a truthiness test on the object.
    const beforeVendored = hostileReads
    expect(
      vendoredResolveTheme('system', hostileEnv),
      '§3.1 item 11: a genuine own `prefersDark` ACCESSOR returning a strict boolean is READ — `source: \'env\'`, never the degraded arm',
    ).toEqual({ setting: 'system', prefersDark: true, source: 'env' })
    expect(hostileReads, 'the accessor WAS invoked by the descriptor read — the mechanism goes through the own member, not around it').toBeGreaterThan(beforeVendored)
    expect(
      22 + 4,
      '§4 P-TH-IM-2 (unchanged term, now EXACT): 11 env shapes × 2 observations = 22, + 4 controls = 26 — and the ⟨A-2⟩ generator’s faithfulness and false-green rejections are DECLARED DIAGNOSTICS (3 reads: the faithfulness pass, the 11-shape false-green rejection, the 11-shape indistinguishability reading), never attempt-term factors',
    ).toBe(26)
  })
})

// ===========================================================================
// §4 `P-TH-TP-1` — THE ADAPTER'S SURFACE IS TOTAL AND ITS TYPES ARE PRESERVED
// (strategy `strat:theme-total-surface`; 14 × 4 + 3 × 3 = 65; + 2 controls = 67)
//
// ⟨A-6 CORRECTION 2026-09-28 (gate-4 remand).⟩ The hostile/absent list was TWELVE shapes; it is
// FOURTEEN — `''` and a BOXED `String` join it, so the totality limb is driven over the two
// shapes the adversarial pass named as missing. The term therefore GROWS: 59 → 67
// (`14 × 4 = 56, + 9, + 2 controls`), printed with its new sum here and in the register file.
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
      // ⟨A-6⟩ the two shapes the pass found missing: the EMPTY STRING (named FIRST by §2.1
      // clause 3) and a BOXED `String` — an object that PRINTS as an explicit token.
      { label: "the EMPTY string '' ", value: '' },
      { label: 'a BOXED String(`dark`)', value: new String('dark') },
    ]
  }
  const NON_BOOLEAN_READINGS: Array<{ label: string; value: unknown }> = [
    { label: '1', value: 1 },
    { label: "'true'", value: 'true' },
    { label: 'an object', value: {} },
    { label: 'a Symbol', value: Symbol('reading') },
  ]

  it('P-TH-TP-1 — 14 hostile/absent setting shapes × 4 non-boolean readings = 56 resolver drives + 3 root shapes × 3 settings = 9 applier drives; no coercion hook is consulted', () => {
    const shapes = hostileSettingShapes()
    expect(shapes.length, '§4 P-TH-TP-1 (⟨A-6⟩ corrected): the hostile/absent setting enumeration is EXACTLY 14 shapes — the superseded reading was 12 (`\'\'` and a boxed `String` were absent)').toBe(14)
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
    expect(drives, '§4 P-TH-TP-1 (⟨A-6⟩ corrected): 14 setting shapes × 4 non-boolean readings = 56 resolver drives (the superseded term was 12 × 4 = 48)').toBe(56)

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
    expect(drives + applierDrives, '§4 P-TH-TP-1 (⟨A-6⟩ corrected): 56 + 9 = 65 drives (the superseded term was 48 + 9 = 57)').toBe(65)

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
    // ⟨A-6⟩ A DECLARED DIAGNOSTIC (never an attempt-term factor): a corpus that COERCES the
    // setting MUST fail the SAME totality oracle on the two ADDED shapes — else their inclusion
    // would be decorative. The boxed `String` is the cell that carries the discrimination.
    const coercingTotalityCorpus = (setting: unknown, prefersDark: boolean): string => {
      const text = String(setting)
      if (text === 'light') return 'light'
      if (text === 'dark') return 'dark'
      return prefersDark === true ? 'dark' : 'light'
    }
    const addedShapes = shapes.filter((s) => s.label.includes('EMPTY') || s.label.includes('BOXED'))
    expect(addedShapes.length, '⟨A-6⟩ the two ADDED shapes are the empty string and the boxed `String`').toBe(2)
    const coercingFailures = addedShapes.flatMap((s) =>
      NON_BOOLEAN_READINGS.map((r) => coercingTotalityCorpus(s.value, r.value as boolean)).filter((got) => got !== 'light'),
    )
    expect(
      coercingFailures,
      '⟨A-6⟩ a coercing corpus MUST produce a NON-\'light\' (i.e. domain-violating) reading on the ADDED shapes — the boxed `String(\'dark\')` is read as an explicit choice and returns \'dark\'',
    ).toEqual(['dark', 'dark', 'dark', 'dark'])
    expect(
      56 + 9 + 2,
      '§4 P-TH-TP-1 (⟨A-6⟩-corrected term): 14 setting shapes × 4 non-boolean readings = 56, + 3 root shapes × 3 settings = 9, + 2 controls = 67 (the superseded term was 12 × 4 = 48, + 9, + 2 = 59); the coercing corpus above is a DECLARED DIAGNOSTIC, never a term factor',
    ).toBe(67)
  })
})

// ===========================================================================
// §4 `P-TH-TP-2` — THE ADAPTER PERFORMS EXACTLY ONE WRITE, AT ONE SITE, WITH THE
// RECORD'S DECISION, AND RETURNS THE RESOLVED THEME
// (strategy `strat:theme-write-discrimination`; 4 × 2 × 2 = 16; + 4 controls;
// + 4 removal-branch drives = 24)
//
// ⟨A-4 + A-2 + A-7 CORRECTIONS 2026-09-28 (gate-4 remand).⟩ The row's "the write is the
// RECORD's decision" oracle was NOT DISCRIMINATING: on every reachable call
// `write.value === resolved`, and the oracle compared the observed write against a value the
// TEST computed — so an adapter that ignored the record and wrote `resolved` passed all 16
// observations (this is the pass's strongest false-green). Three corrections close it:
//   `A-4`  an AST ORACLE over synthetic corpora requiring the write site's RHS to be the
//          RECORD's `value` member (`writeSiteOracle`) — an `resolved` RHS MUST fail;
//   `A-2`  the DIVERGENT-RECORD generator: the declaration's `value` DIFFERS from the
//          resolution, so "wrote the record" and "wrote the resolution" are separated
//          BEHAVIOURALLY at the one write site;
//   `A-7`  the removal branch is DRIVEN (it was only ever asserted by a source regex) under
//          BOTH readings the spec leaves open, and a `writes ''` corpus must fail both —
//          the spec's `§2.1` item 3 is the ruling site and rules NEITHER: ESCALATED.
// The term therefore GROWS by the 4 removal-branch drives: 20 → 24.
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
   *  RETURNS — the write is observed, never inferred (§3a `ADV-T2`). ⟨A-4⟩ Its LIMIT is
   *  recorded rather than hidden: because `write.value === resolved` on every reachable call,
   *  this oracle CANNOT separate "wrote the record" from "wrote the resolution" — the AST
   *  oracle and the divergent-record generator below are what separate them. */
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
        // …and it is the RESOLUTION too, on this reachable path (the observation the superseded
        // removal row re-drove; asserted HERE so nothing is lost when that row is re-scoped).
        expect(writes[0]!.value, `§3.2 item 5 / §2.1 item 3: on the REACHABLE path the record’s value IS the resolution (${s.label} × ${reading})`).toBe(resolved)
      }
    }
    expect(cells.length, '§4: 4 setting shapes × 2 readings = 8 cells').toBe(8)
    expect(observations, '§4: 8 cells × 2 observations (write count+value / return identity) = 16').toBe(16)
  })

  it('⟨A-4⟩ P-TH-TP-2 — the write site takes its RHS from the RECORD: an AST oracle over synthetic corpora, driven BOTH ways', () => {
    // (1) THE LANDED ADAPTER, read by the oracle: exactly ONE write site, and its RHS is the
    //     `value` member of the binding the `applyThemeDeclaration` call initialises.
    const reading = writeSiteOracle(readAdapter())
    expect(reading.recordNames, '§2.1 item 3: the adapter binds the declaration’s record from `applyThemeDeclaration` before writing').toEqual(['write'])
    expect(reading.sites, '§2.1 item 3: EXACTLY ONE assignment to `<root>.dataset.theme` — the ONE write site').toBe(1)
    expect(reading.rhs, '⟨A-4⟩ the write site’s RHS must BE the record’s `value` member').toEqual(['write.value'])
    expect(reading.badRhs, '⟨A-4⟩ NO write site may take its RHS from anything else (the resolution, a literal, another record)').toEqual([])
    // ⟨A-2⟩ THE WRITE-PATH FAITHFULNESS LIMB (a declared diagnostic): with the REAL record
    // injected, the instantiation must reproduce the IMPORTED adapter's writes and returns in
    // every cell — otherwise the generator would be testing the transform, not the artifact.
    const faithfulWrite = instantiateAdapter(readAdapter(), REAL_STUB)
    const faithfulMismatches: string[] = []
    for (const s of SETTINGS) {
      for (const reading_ of READINGS) {
        const a = countingRoot()
        const b = countingRoot()
        const importedReturned = applyThemeToRoot(a.root, s.value, reading_)
        const instantiatedReturned = faithfulWrite.applyThemeToRoot(b.root, s.value, reading_)
        if (JSON.stringify(a.writes) !== JSON.stringify(b.writes) || importedReturned !== instantiatedReturned) {
          faithfulMismatches.push(`${s.label} × ${reading_}`)
        }
      }
    }
    expect(
      faithfulMismatches,
      '⟨A-2⟩ FAITHFULNESS: with the REAL record injected, the instantiation must write the same value at the same site and return the same theme as the IMPORTED adapter in EVERY cell',
    ).toEqual([])
    // (2) THE CONTROLS — the same oracle over synthetic corpora, so the limb is shown to
    //     discriminate rather than asserted:
    const intended = [
      "import { resolveTheme as adoptedResolveTheme, applyThemeDeclaration } from '../shared/theme.js'",
      'export function applyThemeToRoot(root, setting, prefersDark) {',
      '  const resolved = adoptedResolveTheme(setting, { prefersDark })',
      "  const write = applyThemeDeclaration('theme', resolved)",
      '  try { if (!write.removal) root.dataset.theme = write.value } catch {}',
      '  return resolved',
      '}',
      '',
    ].join('\n')
    expect(writeSiteOracle(intended).badRhs, 'the control corpus that DOES write the record’s `value` must PASS, else the oracle proves nothing').toEqual([])
    expect(writeSiteOracle(intended).rhs, '…and it must be SEEN (one write site), so the oracle is not vacuous').toEqual(['write.value'])
    // (2a) THE STRONGEST FALSE-GREEN: it writes `resolved`. The pass proved no value row could
    //      catch it; the AST oracle MUST.
    const falseGreen = writeSiteOracle(FALSE_GREEN_SOURCE)
    expect(falseGreen.rhs, '⟨A-4⟩ the false-green’s write site is the resolution, not the record').toEqual(['resolved'])
    expect(falseGreen.badRhs, '⟨A-4⟩ a corpus writing `resolved` instead of the RECORD’s `value` MUST fail the AST oracle').toEqual(['resolved'])
    // (2b) a DIFFERENT RECORD’s `value` member is not the record this call bound.
    const otherRecord = intended.replace('root.dataset.theme = write.value', 'root.dataset.theme = other.value')
    expect(writeSiteOracle(otherRecord).badRhs, '⟨A-4⟩ `other.value` is a `value` member, but not the RECORD this call bound — it MUST fail').toEqual(['other.value'])
    // (2c) a corpus with NO write site at all fails the "exactly one write site" limb.
    expect(writeSiteOracle('export function applyThemeToRoot() { return \'dark\' }\n').sites, '⟨A-4⟩ a corpus with NO write site MUST fail the site-count limb').toBe(0)
    // (3) THE DIVERGENT-RECORD GENERATOR, driven BEHAVIOURALLY at the one write site: the
    //     declaration's `value` is `record:<resolution>`, so an adapter that writes the
    //     RESOLUTION — its own return — cannot produce it. This is `A-2`'s write half, and it
    //     separates the two candidates that the value oracle above provably cannot.
    const declarationCalls: Array<{ attributeName: unknown; resolved: unknown }> = []
    const loggingStub: AdoptedStub = {
      resolveTheme: INVERTED_RECORD_STUB.resolveTheme,
      applyThemeDeclaration: (attributeName, resolved) => {
        declarationCalls.push({ attributeName, resolved })
        return INVERTED_RECORD_STUB.applyThemeDeclaration(attributeName, resolved)
      },
    }
    const divergent = instantiateAdapter(readAdapter(), loggingStub)
    const cellsObserved: string[] = []
    for (const s of SETTINGS) {
      for (const reading_ of READINGS) {
        const { root, writes } = countingRoot()
        const declared = divergent.applyThemeToRoot(root, s.value, reading_)
        const call = declarationCalls[declarationCalls.length - 1]!
        expect(call.attributeName, '§2.1 item 2: the attribute name the adapter passes is the fork’s own `\'theme\'` token').toBe('theme')
        cellsObserved.push(`${s.label} × ${reading_}`)
        expect(
          writes[0]?.value,
          `⟨A-2/A-4⟩ ${s.label} × ${reading_}: the one write site must carry the RECORD’s \`value\` — the declaration returned \`${String((INVERTED_RECORD_STUB.applyThemeDeclaration('theme', call.resolved) as { value: string }).value)}\``,
        ).toBe(`${RECORD_VALUE_MARKER}${String(call.resolved)}`)
        expect(
          writes[0]?.value,
          `⟨A-2/A-4⟩ ${s.label} × ${reading_}: the record’s \`value\` must DIFFER from the resolution the adapter returns — otherwise "wrote the record" and "wrote the resolution" are indistinguishable here`,
        ).not.toBe(declared)
        expect(declared, `§2.1 item 4: the return is still the resolution (${s.label} × ${reading_})`).toBe(call.resolved)
      }
    }
    expect(cellsObserved.length, '⟨A-2/A-4⟩ the divergent-record generator is driven over the whole 4 × 2 grid = 8 cells').toBe(8)
    expect(declarationCalls.length, '…one declaration call per cell, so the record’s `value` is read from the SAME call the adapter made').toBe(8)
    const falseGreenWrite = instantiateAdapter(FALSE_GREEN_SOURCE, INVERTED_RECORD_STUB)
    const falseGreenObserved = SETTINGS.flatMap((s) =>
      READINGS.map((r) => {
        const { root, writes } = countingRoot()
        falseGreenWrite.applyThemeToRoot(root, s.value, r)
        return String(writes[0]?.value)
      }),
    )
    expect(
      falseGreenObserved.filter((v) => v.startsWith(RECORD_VALUE_MARKER)),
      '⟨A-2/A-4⟩ the false-green writes the RESOLUTION, so it can never carry the record’s `value` — the divergent-record generator MUST reject it in every cell',
    ).toEqual([])
    expect(falseGreenObserved.length, '…and the rejection is over all 8 cells, not a sample').toBe(8)
  })

  it('⟨A-7 + A-2⟩ P-TH-TP-2 — the removal branch: DRIVEN under BOTH readings the spec leaves open, and a `writes \'\'` corpus FAILS both (the spec’s §2.1 item 3 rules NEITHER — ESCALATED, never decided here)', () => {
    // ---- (i) THE TRIPWIRE: the spec's `§2.1` item 3 is the RULING SITE (`A-7`'s correction
    //      says so explicitly: "rule in §2.1 item 3 whether honouring means SKIP or DELETE").
    //      It rules NEITHER today, so this row drives BOTH readings instead of inventing one.
    //      If the spec is amended to rule, this assertion reds LOUDLY and the row must be
    //      replaced by the ruling — which is the point: no invented semantic survives.
    const item3 = specItem3Text()
    expect(item3, '§2.1 item 3 must be the clause that declares the removal branch').toMatch(/removal/)
    expect(
      /(?:\bskip\w*\b|\bdelet\w*\b)/i.test(item3),
      '⟨A-7⟩ the spec’s `§2.1` item 3 now RULES the removal semantic — replace this both-readings drive with the ruling (the ESCALATED ambiguity is resolved)',
    ).toBe(false)
    // ---- (ii) the vendored record's own contract, unchanged (§3.1 item 15)
    const removalRecord = vendoredApplyThemeDeclaration('theme', '') as { name: unknown; value: string; removal: boolean }
    expect(removalRecord, '§3.1 item 15: the removal case is signalled by the `removal` member ONLY, and the `name` is still echoed independently').toEqual({ name: 'theme', value: '', removal: true })
    // ---- (iii) THE LANDED ADAPTER, driven under the removal record (unreachable through the
    //      resolver, §3.2 item 5, so it can only be driven by injecting the record): the
    //      observation is classified against the TWO readings, and anything else FAILS.
    const gen = instantiateAdapter(readAdapter(), REMOVAL_RECORD_STUB)
    const drive = preThemedRoot()
    const returned = gen.applyThemeToRoot(drive.root, 'dark', false)
    const reading = removalReading({ after: drive.state(), events: drive.events })
    // eslint-disable-next-line no-console -- `A-7`’s reading is PRINTED, never smoothed
    console.log(`PD-UI-1 §3a A-7: the removal record is honoured by the ${reading.toUpperCase()} reading (root that pre-carried 'light' ⇒ ${String(drive.state())}); §2.1 item 3 rules neither SKIP nor DELETE — ESCALATED to the architect`)
    expect(['skip', 'delete'], '⟨A-7⟩ honouring the removal record MUST be one of the two readings the spec leaves open — a write of `\' \'`/the resolution/anything else is no reading at all').toContain(reading)
    expect(returned, '§2.1 item 4: the resolved theme is STILL returned while the removal arm is taken').toBe('dark')
    // ---- (iv) THE CONTROLS: the classifier is driven over synthetic corpora, so it is shown
    //      to SEE a delete and to REJECT a `writes ''` corpus and a resolution-writing corpus.
    const deleteCorpus = (root: ThemeRoot): string => {
      delete (root.dataset as { theme?: string }).theme
      return 'dark'
    }
    const emptyWriteCorpus = (root: ThemeRoot): string => {
      root.dataset.theme = ''
      return 'dark'
    }
    const resolutionWriteCorpus = (root: ThemeRoot, resolution: string): string => {
      root.dataset.theme = resolution
      return resolution
    }
    const observe = (fn: (root: ThemeRoot) => string): { after: unknown; events: Array<{ key: string; value: unknown }> } => {
      const rec = preThemedRoot()
      fn(rec.root)
      return { after: rec.state(), events: rec.events }
    }
    expect(removalReading(observe(deleteCorpus)), '⟨A-7⟩ the classifier must SEE a DELETE corpus as the DELETE reading').toBe('delete')
    expect(removalReading(observe(emptyWriteCorpus)), '⟨A-7⟩ a `writes \'\'` corpus MUST fail BOTH readings (it is not a removal — the `value` member is what carries `\'\'`)').toBe('neither')
    expect(removalReading(observe((r) => resolutionWriteCorpus(r, 'dark'))), '⟨A-7⟩ a corpus writing the RESOLUTION on the removal arm MUST fail BOTH readings').toBe('neither')
    // ---- (v) the source limb, retained: the removal branch is represented by the RECORD and
    //      never by a call the adapter makes on an element it does not own (§2.1 item 3).
    const text = readAdapterCode()
    expect(text, '§2.1 item 3: the adapter must READ the record’s `removal` member — an unread record is a silent divergence').toMatch(/\.removal\b/)
    expect(
      text,
      '§2.1 item 3: the removal branch is represented by the record and NEVER by a call the adapter makes on an element it does not own',
    ).not.toMatch(/removeAttribute|delete\s+\w+\.dataset\.theme|deleteProperty/)
    // ---- (vi) the row's DECLARED removal-branch term: 1 landed drive + 3 corpus controls = 4
    expect(1 + 3, '§4 P-TH-TP-2 (⟨A-7⟩-added term): 1 landed removal drive + 3 corpus controls (DELETE / `writes \'\'` / resolution-writing) = 4').toBe(4)
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
    expect(
      16 + 4 + 4,
      '§4 P-TH-TP-2 (⟨A-7⟩-corrected term): 4 setting shapes × 2 readings × 2 observations = 16, + 4 controls, + 4 removal-branch drives = 24 (the superseded term was 16 + 4 = 20 — it did not count the removal drive `A-7` obliges)',
    ).toBe(24)
  })
})

// ===========================================================================
// §4 `P-TH-TP-3` — THE APPLIER IS FAIL-SOFT OVER EVERY ROOT SHAPE AND NEVER LEAKS
// A THROW (strategy `strat:theme-fail-soft`; 3 × 2 × 2 = 12 drives × 2 observations
// = 24; + 3 controls = 27)
//
// ⟨A-3 CORRECTION 2026-09-28 (gate-4 remand).⟩ The failing shapes' "no write is observed"
// limbs ASSERTED AN ARRAY THE TEST ITSELF CREATED (`writes: []` as a literal), so
// `expect(writes).toEqual([])` could not fail. They are replaced by RECORDING ROOTS: a Proxy
// over a FROZEN target whose `set` trap RECORDS the attempt and then THROWS (the throw absorbed
// by the adapter's total contract), and a root whose `dataset` READ is recorded and throws. The
// failing shapes are now OBSERVABLE — "attempted and refused" is a READING — and a third control
// (a SILENT-SKIP corpus that never attempts the write) proves the attempt oracle discriminates.
//
// ⟨A-8 CORRECTION 2026-09-28.⟩ This row PRINTED 12 and RAN 16 (the third shape's absent and
// throwing variants were both driven), asserting the observation count as a FLOOR
// (`toBeGreaterThanOrEqual(24)`). Now: the third shape is ONE shape (an absent/throwing
// `dataset`, exactly as the declared term names it), the drives are exactly 12, and the
// observations are EXACTLY 24.
// ===========================================================================
describe('PD-UI-1 §3.2 — the applier is TOTAL and fail-soft', () => {
  interface RootShape {
    label: string
    make: () => { root: ThemeRoot; events: Array<{ key: string; value: unknown }>; state: () => unknown }
    /** does the shape REFUSE the write (the attempt is still observable)? */
    refusesWrite: boolean
  }
  /** §3.2 items 1–4 — the THREE declared root shapes, ONE generator each. The third merges the
   *  absent and the throwing `dataset` (the declared shape is literally "an absent/throwing
   *  `dataset`"), so `3 × 2 × 2 = 12` drives is exactly the declared term. */
  function rootShapes(): RootShape[] {
    const frozen = (): RootShape => ({
      label: 'a FROZEN root (`Object.freeze`) whose `set` trap RECORDS and REFUSES',
      make: () => {
        const r = recordingFrozenRoot()
        return { root: r.root, events: r.attempts, state: r.landed }
      },
      refusesWrite: true,
    })
    const absentThrowing = (): RootShape => ({
      label: 'an ABSENT/THROWING `dataset` (the read is RECORDED and throws)',
      make: () => {
        const r = recordingThrowingDatasetRoot()
        return { root: r.root, events: r.events, state: () => undefined }
      },
      refusesWrite: true,
    })
    return [
      {
        label: 'a `dataset`-carrying object',
        make: () => {
          const r = countingRoot()
          return { root: r.root, events: r.writes, state: () => (r.root.dataset as { theme?: unknown }).theme }
        },
        refusesWrite: false,
      },
      frozen(),
      absentThrowing(),
    ]
  }
  const SETTINGS: Array<{ label: string; value: unknown }> = [
    { label: "'dark'", value: 'dark' },
    { label: "'system'", value: 'system' },
  ]
  const READINGS = [true, false] as const

  /** ⟨A-3⟩ the attempt oracle: a FAILING shape must show the write was ATTEMPTED (an event was
   *  recorded) and REFUSED (nothing landed) — never "an empty array the test created". */
  const attemptOracle = (o: { events: Array<{ key: string; value: unknown }>; state: unknown; resolution: unknown }): string[] => {
    const bad: string[] = []
    if (o.events.length === 0) bad.push('NO attempt was recorded — a silent skip is not a fail-soft write')
    for (const e of o.events) {
      if (e.key !== 'theme' && e.key !== 'dataset') bad.push(`an unexpected event was recorded: \`${e.key}\``)
      if (e.key === 'theme' && e.value !== o.resolution) bad.push(`the attempted value ${String(e.value)} is not the resolution ${String(o.resolution)}`)
    }
    if (o.state !== undefined) bad.push(`an attribute LANDED on a refusing root: ${String(o.state)}`)
    return bad
  }

  it('P-TH-TP-3 — 3 root shapes × 2 settings × 2 readings = 12 drives, each with 2 observations (no-throw / return-domain), and the failing shapes show the attempt RECORDED and REFUSED', () => {
    const shapes = rootShapes()
    expect(shapes.length, '§3.2 items 1–4: the three declared root shapes, ONE generator each (the third is the declared “absent/throwing `dataset`”)').toBe(3)
    let drives = 0
    let observations = 0
    for (const shape of shapes) {
      for (const s of SETTINGS) {
        for (const reading of READINGS) {
          const inst = shape.make()
          let returned: unknown = null
          expect(() => {
            returned = applyThemeToRoot(inst.root, s.value, reading)
          }, `§3.2: nothing throws for the ${shape.label} × ${s.label} × prefersDark=${reading}`).not.toThrow()
          observations += 1
          expect(['light', 'dark'], `§3.2: the resolved theme is STILL RETURNED for the ${shape.label}`).toContain(returned)
          expect(returned, `§3.2: the return must be the resolution, not \`undefined\` (${shape.label} × ${s.label} × ${reading})`).toBe(resolveTheme(s.value, reading))
          observations += 1
          if (shape.refusesWrite) {
            // ⟨A-3⟩ THE OBSERVABLE FAILING SHAPE: the attempt was recorded and refused, so this
            // limb can FAIL (a silent-skip corpus is rejected by the same oracle, below).
            expect(
              attemptOracle({ events: inst.events, state: inst.state(), resolution: resolveTheme(s.value, reading) }),
              `⟨A-3⟩ the failing shape (${shape.label} × ${s.label} × ${reading}) must show the write ATTEMPTED and REFUSED — not an array this test created`,
            ).toEqual([])
            expect(inst.state(), `§3.2 items 2/3: no attribute may LAND on the refusing ${shape.label}`).toBeUndefined()
          } else {
            // the healthy shape: exactly ONE write, carrying the resolution (§3.2 item 1)
            expect(inst.events.length, `§3.2 item 1: exactly ONE write lands on the ${shape.label}`).toBe(1)
            expect(inst.state(), `§3.2 item 1: the resolution is written onto \`root.dataset.theme\``).toBe(resolveTheme(s.value, reading))
          }
          drives += 1
        }
      }
    }
    expect(drives, '§4: 3 root shapes × 2 settings × 2 readings = 12 drives').toBe(12)
    expect(
      observations,
      '§4 (⟨A-8⟩ corrected): the declared term is 12 drives × 2 observations = 24 — asserted EXACTLY, not as a floor (the superseded row drove 16 drives / 32 observations against a printed 12 and asserted `toBeGreaterThanOrEqual(24)`)',
    ).toBe(24)
    // the further declared fail-soft shapes (§3.2 item 3): a `null`/`undefined`/primitive root at
    // RUNTIME — outside the counted term, and read through the SAME no-throw + return limbs.
    for (const bad of [null, undefined, 42, 'html']) {
      expect(() => applyThemeToRoot(bad as unknown as ThemeRoot, 'dark', false), `§3.2 item 3: a ${String(bad)} root must not throw`).not.toThrow()
      expect(applyThemeToRoot(bad as unknown as ThemeRoot, 'dark', false)).toBe('dark')
    }

    // ---- the 3 controls ----
    // ① a corpus that lets the assignment's throw escape MUST fail the no-throw limb.
    const leakingApplier = (root: ThemeRoot): string => {
      root.dataset.theme = 'dark' // no try/catch — the assignment’s throw escapes
      return 'dark'
    }
    expect(() => leakingApplier({} as ThemeRoot), 'a corpus that lets the assignment’s throw escape MUST fail the no-throw limb (§4 P-TH-TP-3 control)').toThrow()
    // ② a corpus returning `undefined` on the absent-root arm MUST fail the return limb.
    const undefinedReturningApplier = (_root: ThemeRoot): unknown => undefined
    expect(
      ['light', 'dark'],
      'a corpus returning `undefined` on the absent-root arm MUST fail the return limb (§4 P-TH-TP-3 control)',
    ).not.toContain(undefinedReturningApplier({} as ThemeRoot))
    // ③ ⟨A-3⟩ a SILENT-SKIP corpus — it swallows by NEVER ATTEMPTING the write — MUST fail the
    //    attempt oracle, while a corpus that attempts and swallows PASSES it. This is the
    //    two-way proof that the new limb is a discriminator and not a restated literal.
    const silentSkipApplier = (_root: ThemeRoot): string => {
      try {
        // never reaches the write site — the failure mode the old `writes: []` literal could not see
      } catch {
        /* unreachable */
      }
      return 'dark'
    }
    const attemptsAndSwallows = (root: ThemeRoot): string => {
      try {
        root.dataset.theme = 'dark'
      } catch {
        /* the throw is absorbed, exactly as the adapter’s total contract requires */
      }
      return 'dark'
    }
    const silentRun = ((): { events: Array<{ key: string; value: unknown }>; state: unknown } => {
      const r = recordingFrozenRoot()
      silentSkipApplier(r.root)
      return { events: r.attempts, state: r.landed() }
    })()
    expect(
      attemptOracle({ ...silentRun, resolution: 'dark' }),
      '⟨A-3⟩ a SILENT-SKIP corpus (a swallowed failure with NO attempt) MUST fail the attempt oracle — else the limb is a restated literal again',
    ).not.toEqual([])
    const swallowRun = ((): { events: Array<{ key: string; value: unknown }>; state: unknown } => {
      const r = recordingFrozenRoot()
      attemptsAndSwallows(r.root)
      return { events: r.attempts, state: r.landed() }
    })()
    expect(attemptOracle({ ...swallowRun, resolution: 'dark' }), '⟨A-3⟩ a corpus that ATTEMPTS and swallows must PASS the same oracle (else the control proves nothing)').toEqual([])
    expect(
      24 + 3,
      '§4 P-TH-TP-3 (⟨A-3⟩-corrected term): 3 root shapes × 2 settings × 2 readings = 12 drives × 2 observations = 24, + 3 controls (throw-escaping · `undefined`-returning · ⟨A-3⟩ silent-skip) = 27 (the superseded term counted 2 controls at 26)',
    ).toBe(27)
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

  it('P-TH-IM-4 (d) — the adapter’s import census is EXACTLY ONE statement, RESOLVING to the vendored member src/shared/theme.ts', () => {
    // ⟨TEST-DEFECT CORRECTED 2026-09-28 (remand 2 of 2 on this unit).⟩ This row pinned the
    // LITERAL spelling `'../../shared/theme.js'` — and that spelling is UNSATISFIABLE together
    // with the sibling register row (`tests/pd-ui-1-theme-register.test.ts` `P-TH-IM-4 (d)`),
    // which pins `'../shared/theme.js'`: from `src/renderer/`, `../shared/theme.ts` RESOLVES to
    // `src/shared/theme.ts`, while `../../shared/theme.ts` escapes `src/` and resolves to
    // `<repo>/shared/theme.ts`, which does not exist. NO single statement satisfies both rows.
    // §2.1's own normative clause is the binding one — *"the implementer may write the EQUIVALENT
    // form the bundler/typechecker accepts, and the row asserts the RESOLVED PATH, NEVER A
    // SPELLING"* — so the spelling literal is DROPPED from the expectation and the row asserts
    // the RESOLVED member. The sibling `tests/pd-vendor-set.test.ts` allow-lists BOTH spellings
    // for the same reason.
    //
    // ⟨A-9 RESIDUE CORRECTED 2026-09-28 (gate-4 remand).⟩ The superseded comment claimed the
    // spelling divergence was "recorded as a documentation nit in `unit-pd-ui-1-theme.md` §2.1".
    // THAT WAS STALE: the nit was reported but `§2.1` was never amended, so the allow-list held a
    // spelling NO correct adapter can use. `§2.1` now carries a DATED CORRECTION beside the
    // as-filed text — *"⟨CORRECTED 2026-09-28 (gate-4 finding `A-9`, HOST-FIX): THE SPELLING ABOVE
    // IS WRONG AND IS KEPT VISIBLE … the correct relative form from `src/renderer/` is
    // `'../shared/theme.js'`"* — and THIS comment cites that correction rather than a nit that
    // never landed. (`tests/pd-vendor-set.test.ts`'s own copy of the stale claim is NOT in this
    // unit's write set — it is ESCALATED to the pin's owning unit.)
    //
    // STILL DISCRIMINATING, in five ways (the negative controls are driven below, not asserted
    // in prose): (i) the adapter must REALLY import the vendored module — zero imports reds the
    // RESOLUTION limb, because the vendored-resolving set reads empty; (ii) the import must
    // resolve to the vendored `theme` member and NOT to a DIFFERENT member — the expectation
    // names `src/shared/theme.ts` exactly, so a `zones`/`census`-resolving edge reds it though it
    // is vendored-resolving too; (iii) the census is EXACTLY ONE statement, so a second vendored
    // edge (or any `electron`/`node:*`/`provident-ssr`/sibling import) reds the length limb; (iv)
    // the one edge must be the STATIC `from '...'` form, never one of the three refused evasions
    // (§9 item 1 item (b) / §3a `ADV-T7`); and (v) ⟨A-12⟩ the imported MEMBER must be USED in a
    // VALUE-BEARING, non-`void` position — an unused binding or a `void` reference satisfied every
    // other limb of this row while the adoption was absent.
    const hits = adapterImportHits()
    const resolvedToVendored = hits.filter((h) => VENDORED_PATHS.has(resolveSpecifier(h.file, h.specifier)))
    expect(
      resolvedToVendored.map((h) => `${relative(REPO_ROOT, resolveSpecifier(h.file, h.specifier))} (${h.kind})`).sort(),
      'RED (PD-UI-1 §2.1 import census): the adapter must import the vendored module EXACTLY ONCE — at this head the census reads 0, and an `await import(...)`/`require(...)`/`new URL(...)` indirection would be an EVASION (§9 item 1 / §3a `ADV-T7`). The expectation asserts the RESOLVED path (§2.1: “the row asserts the RESOLVED path, never a spelling”), so either equivalent spelling passes and a DIFFERENT vendored member cannot',
    ).toEqual(['src/shared/theme.ts (static-from)'])
    expect(
      resolvedToVendored.map((h) => h.kind),
      '§9 item 1 item (b) / §3a `ADV-T7`: the ONE consumer edge must be the STATIC `from \'...\'` form — an `await import(...)`/`require(...)`/`new URL(...)` spelling matches no pattern in the `PD-VENDOR` pin and would hide the very edge this census exists to declare',
    ).toEqual(['static-from'])
    expect(hits, '§2.1: the adapter’s import census is exactly ONE statement — no `electron`, no `node:*`, no `provident-ssr`, no sibling `src/renderer/**` module').toHaveLength(1)
    expect(
      hits.filter((h) => resolveSpecifier(h.file, h.specifier).startsWith('<bare:')),
      '§2.1: no bare (out-of-repo) specifier may appear in the adapter',
    ).toEqual([])

    // ── THE NEGATIVE CONTROLS this row relies on, DRIVEN through the SAME oracle
    //    (`resolveSpecifier` + `VENDORED_PATHS`) and the SAME derivation (`importHits`):
    // (i) the same file with ZERO imports — §3a `ADV-T4`’s corpus, which satisfies the
    //     OUTCOME while ignoring the ADOPTION. It MUST red the resolution limb.
    expect(
      importHits('export function resolveTheme(): \'light\' | \'dark\' { return \'light\' }\n', 'src/renderer/theme.ts', PINNED_FIFTEEN),
      'NEGATIVE CONTROL (i): an adapter with ZERO imports MUST red the resolution limb — its vendored-resolving set reads empty, never the required one-element reading',
    ).toEqual([])
    // (ii) an import of a DIFFERENT vendored MEMBER — vendored-resolving, so the row cannot be
    //      satisfied by “something under `src/shared/`”. It MUST fail the expectation, which
    //      names the `theme` member exactly.
    const differentMember = importHits(`import { isEmpty } from '../shared/zones.js'\n`, 'src/renderer/theme.ts', PINNED_FIFTEEN)
    expect(
      differentMember.map((h) => `${relative(REPO_ROOT, resolveSpecifier(h.file, h.specifier))} (${h.kind})`),
      'NEGATIVE CONTROL (ii): an import of a DIFFERENT vendored member MUST produce a reading that is NOT the required `src/shared/theme.ts` — “resolves to some vendored member” is not the property',
    ).toEqual(['src/shared/zones.ts (static-from)'])
    // (iii) the SAME edge written through one of the three refused evasions — the resolution
    //       limb would otherwise be satisfiable by a form the pin cannot see.
    const evading = importHits(`const later = () => import('../shared/theme.js')\n`, 'src/renderer/theme.ts', PINNED_FIFTEEN)
    expect(
      evading.map((h) => h.kind),
      'NEGATIVE CONTROL (iii): the refused evasion forms are still SEEN by the derivation (the kind limb reds them), so the corrected expectation is not satisfiable by hiding the edge',
    ).toEqual(['dynamic-import'])

    // ── ⟨A-12 CORRECTION⟩ (iv) THE MEMBER MUST BE USED, IN A VALUE-BEARING POSITION — the
    //    census proved an EDGE, never a USE: an unused binding, or `void adoptedResolveTheme(…)`
    //    / `void write.removal`, satisfied the row while the whole adoption was absent. The same
    //    reader is driven over synthetic corpora so both directions are shown, not asserted.
    const use = importedMemberUseOracle(readAdapter())
    expect(use.imported, '⟨A-12⟩ the adapter imports the vendored module’s two exports, by name').toEqual(['resolveTheme', 'applyThemeDeclaration'])
    expect(
      use.valueBearing.slice().sort(),
      '⟨A-12⟩ BOTH imported members must appear as the CALLEE of a call whose result IS USED — a value-bearing, non-`void` position',
    ).toEqual(['applyThemeDeclaration', 'resolveTheme'])
    expect(use.voidOrDiscarded, '⟨A-12⟩ NO imported member may appear only in a `void` or discarded-call position').toEqual([])
    // the negatives: an UNUSED binding, a `void`-discarded call and a bare discarded call MUST
    // all read as non-value-bearing.
    expect(
      importedMemberUseOracle(FALSE_GREEN_SOURCE).valueBearing.slice().sort(),
      '⟨A-12⟩ the false-green CALLS both members (so the census and every token probe pass) — the use oracle must still see both calls as value-bearing, because its defect is that it DISCARDS the returned MEMBERS, which is what `A-2`/`A-4` catch behaviourally',
    ).toEqual(['applyThemeDeclaration', 'resolveTheme'])
    const voidCorpus = `import { resolveTheme as adoptedResolveTheme, applyThemeDeclaration } from '../shared/theme.js'\nexport function f(setting, prefersDark) {\n  void adoptedResolveTheme(setting, { prefersDark })\n  void applyThemeDeclaration('theme', 'dark')\n  return 'dark'\n}\n`
    expect(
      importedMemberUseOracle(voidCorpus).valueBearing,
      '⟨A-12⟩ a `void`-discarded call is NOT a value-bearing use — the corpus MUST fail the use limb',
    ).toEqual([])
    expect(importedMemberUseOracle(voidCorpus).voidOrDiscarded.slice().sort(), '⟨A-12⟩ …and the oracle must NAME both references as void/discarded').toEqual(['applyThemeDeclaration', 'resolveTheme'])
    const unusedCorpus = `import { resolveTheme as adoptedResolveTheme, applyThemeDeclaration } from '../shared/theme.js'\nexport function f() { return 'dark' }\n`
    expect(
      importedMemberUseOracle(unusedCorpus).valueBearing,
      '⟨A-12⟩ an UNUSED binding has no value-bearing use at all — the import census alone would have called this adopted',
    ).toEqual([])
    const discardedCorpus = `import { resolveTheme as adoptedResolveTheme, applyThemeDeclaration } from '../shared/theme.js'\nexport function f(setting, prefersDark) {\n  adoptedResolveTheme(setting, { prefersDark })\n  applyThemeDeclaration('theme', 'dark')\n  return 'dark'\n}\n`
    expect(importedMemberUseOracle(discardedCorpus).valueBearing, '⟨A-12⟩ a bare discarded call is not value-bearing either').toEqual([])
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
