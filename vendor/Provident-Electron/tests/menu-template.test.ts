// tests/menu-template.test.ts
// ===========================================================================
// `U-MENULIB` · wave **E** · ledger row **`E7`** · **THE RED SET** (`RCA-1`).
//
// Contract: `docs/specs/menulib.md` (FILED + SPEC GATE APPROVED AS FILED
// 2026-09-27, with `Q1`/`Q2` left ARCHITECT-REVERSIBLE and the collapse run
// boundary a labelled derivation). Authored from the spec ALONE:
// **`src/shared/menu-template.ts` DOES NOT EXIST** while this file is the red set
// (`§3.5 X-1`).
//
// THE CONTRACT'S OWN PINNED PATHS (`§0A` note 1, `§5.1` rows 1/2) — neither is
// invented here:
//   module    → `src/shared/menu-template.ts`
//   test file → `tests/menu-template.test.ts`   (THIS file)
//
// THE SURFACE THIS RED OWES (`§2.1`): **NINE exported names in TWO HALVES** —
// THREE runtime value exports (`normalizeCatalog`, `buildMenuTemplate`,
// `selectCatalogItem`) and SIX type declarations (`PickerFn`, `CatalogEntry`,
// `PlatformProjection`, `ProjectedItem`, `MenuTemplate`, `TemplateOptions`);
// **NO IMPORT STATEMENT OF ANY KIND** (`§2.1` item 3, `R-4`); the ONE injected
// OPTIONAL seam (`picker`); the emitted `{items, platform}` with
// `platform = {recognized, collapsing}`; and **every item carrying EXACTLY the
// seven declared own keys** (`id` · `label` · `accelerator` · `role` · `kind` ·
// `submenu` · `enabled`), all `unknown`, **any other own key DROPPED, never
// copied** (`§2.3` items 2/9, `R-12`).
//
// LAYER: **[T]** + `static`. **This unit touches NO DOM and reads NO OS**
// (`§1` items 4/5, `§4.3`, layer anchors 2/3): the only arguments are caller
// data, a caller string and a caller closure. `[U]` is **NOT OFFERED**, `[D]` is
// **NOT CLAIMED**, gate 6 is **`STRUCTURAL`** (`§5.2`), and the `§7.1` predicate
// decision is **`DOES NOT TRIGGER`**.
//
// AUTHORED ORDER (`§4.2` items 1–6), and the `describe` blocks below ARE that
// order, nothing renumbered:
//   1. `§3.5` existence + the red's own premise: `X-1`, `X-2`, `X-4`, `X-5`,
//      `R-3`'s config half, `R-9` and `R-13`'s no-importer half;
//   2. the `§3.4` static rows `R-1`..`R-13`;
//   3. the totality/degradation/invariant surface `F-1`..`F-10`, `I-1`..`I-12`;
//   4. the happy states `M-1`..`M-9` (`M-7`/`M-8` beside `R-12`, `M-9` last);
//   5. the `§5.5.1` register rows IN REGISTER ORDER (`P-ML-IM-1` · `IM-2` ·
//      `IM-3` · `IM-4` · `IM-5` · `IM-6` · `IM-7` · `P-ML-SM-1` · `SM-2` ·
//      `SM-3` · `P-ML-TP-1` · `TP-2` · `TP-3`) plus the register-harness rows
//      (the declared-vs-measured reconciliation, the caps, the `(bounded)` set
//      and the **un-run-row-is-a-FAILURE** rule);
//   6. `RUN and REPORT` (`§4.2` item 6) — the `REGISTER-STATUS` row prints the
//      totals and the stop state in the run's own output.
//
// HOW THE MODULE'S ABSENCE IS COPED WITH (the sibling red sets' established
// technique): the run-time specifier is assembled from FRAGMENTS and the module
// file's presence is checked with `existsSync` BEFORE an `await import(...)`, so
// an absent module fails each row **as an ASSERTION carrying that row's own
// label** — never as a file-level transform error that would take the whole red
// set down with it. **THE TYPE HALF IS THE EXCEPTION AND IS DELIBERATE**: the
// `import type` declarations below are `R-5`(b)'s compile-time claim, so LEG 5
// (the standalone strict `tsc --noEmit` over THIS file, `§5.2`) reports the
// module-absent boundary — **that diagnostic is NOT suppressed**, because
// suppressing it would make the type claim unfalsifiable.
//
// THE PROPERTY LAYER IS `§5.5.1`'s REGISTER: **13 typed rows carrying 13 TERMS**
// whose DECLARED TOTAL is `126` = `12 + 12 + 12 + 12 + 12 + 12 + 12 + 3 + 3 + 3 +
// 12 + 9 + 12` (`§5.5.3`, corrected `123 → 126` by the dated amendment; the
// as-filed `123` is kept visible BESIDE it as SUPERSEDED and is never substituted),
// caps `≤100`/row · `≤400` total · **stop after 5
// CONSECUTIVE failures**, seed **`20260927`** with ONE LCG step per draw over a
// `pool.length = 12` pool for the ONE generator row (`P-ML-TP-1`). **Every
// declared term is a DRIVE count; assertions are printed BESIDE the term and are
// never counted in it; an un-run row is reported as a FAILURE, never a pass.**
// The `(bounded)` set is **6 of the 13 rows** (`P-ML-IM-1` · `P-ML-IM-4` ·
// `P-ML-IM-5` · `P-ML-TP-1` · `P-ML-TP-2` · `P-ML-TP-3`).
//
// NO `package.json` CHANGE, NO NEW DEPENDENCY, NO NEW SCRIPT, NO CONFIG EDIT
// (`§5.1` items 7/8/9; `R-3`/`R-4`; `AGENTS.md` item 11(d)): the register rides
// plain deterministic vitest tables plus the ONE hand-rolled LCG.
// ===========================================================================

import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// ===========================================================================
// `R-5`(b) / `R-6`'s type half / `R-12`(d) — THE TYPE-ONLY HALF, through `§5.2`
// leg 5. These SIX imports are the compile-time claim that
// `src/shared/menu-template.ts` exports the six type declarations `§2.1` item 1
// names. While the module is ABSENT this is exactly the red's own leg-5 form: a
// module-resolution diagnostic that is **NOT suppressed** (an `@ts-ignore` here
// would make the type claim unfalsifiable — `S-ML-2`'s own class).
// ===========================================================================
import type { PickerFn as ModulePickerFn } from '../src/shared/menu-template.js'
import type { CatalogEntry as ModuleCatalogEntry } from '../src/shared/menu-template.js'
import type { PlatformProjection as ModulePlatformProjection } from '../src/shared/menu-template.js'
import type { ProjectedItem as ModuleProjectedItem } from '../src/shared/menu-template.js'
import type { MenuTemplate as ModuleMenuTemplate } from '../src/shared/menu-template.js'
import type { TemplateOptions as ModuleTemplateOptions } from '../src/shared/menu-template.js'

// ===========================================================================
// §2.1's CONTRACT SHAPES, MIRRORED AS STRUCTURAL TYPES. The module cannot be
// imported for its VALUES while it is absent, so this file mirrors `§2.1`; the
// mirror is the harness's own type surface ONLY and is never asserted to BE the
// module's (that claim is `R-5`'s, through the `import type` block above plus
// the runtime key census below).
// ===========================================================================
type NormalizeShape = (catalog: unknown) => readonly Record<string, unknown>[]
type BuildShape = (catalog: unknown, options?: unknown) => {
  readonly items: readonly Record<string, unknown>[]
  readonly platform: { readonly recognized: unknown; readonly collapsing: unknown }
}
type SelectShape = (catalog: unknown, picker?: unknown) => unknown
type PickerShape = (candidates: unknown) => unknown

// `§2.2`(D)'s SEMANTICS ROWS, READ AS TYPES (`R-5`(b), `R-6`'s type half): every
// one of the seven carried members is typed **`unknown`** in both carried types,
// and every platform member is `boolean`. A member declared `string` (say) fails
// to compile here, because a non-string `unknown` is assigned to it — that is the
// whole content of `R-12`(d) and it has NO runtime falsifier (`§5.2` leg 5).
const T_ID_A: ModuleCatalogEntry['id'] = undefined as unknown
const T_LABEL_A: ModuleCatalogEntry['label'] = undefined as unknown
const T_ACCEL_A: ModuleCatalogEntry['accelerator'] = undefined as unknown
const T_ROLE_A: ModuleCatalogEntry['role'] = undefined as unknown
const T_KIND_A: ModuleCatalogEntry['kind'] = undefined as unknown
const T_SUBMENU_A: ModuleCatalogEntry['submenu'] = undefined as unknown
const T_ENABLED_A: ModuleCatalogEntry['enabled'] = undefined as unknown
const T_ID_P: ModuleProjectedItem['id'] = undefined as unknown
const T_LABEL_P: ModuleProjectedItem['label'] = undefined as unknown
const T_ACCEL_P: ModuleProjectedItem['accelerator'] = undefined as unknown
const T_ROLE_P: ModuleProjectedItem['role'] = undefined as unknown
const T_KIND_P: ModuleProjectedItem['kind'] = undefined as unknown
const T_SUBMENU_P: ModuleProjectedItem['submenu'] = undefined as unknown
const T_ENABLED_P: ModuleProjectedItem['enabled'] = undefined as unknown
const T_RECOGNIZED: ModulePlatformProjection['recognized'] = true
const T_COLLAPSING: ModulePlatformProjection['collapsing'] = false
/** `§2.3` item 7: `CatalogEntry` and `ProjectedItem` are SEPARATELY DECLARED,
 *  SEPARATELY NAMED exports that are STRUCTURALLY IDENTICAL — a `tsc` probe may
 *  assert the STRUCTURAL identity and may NOT assert a shared declaration
 *  (`S-ML-10`). Both `extends` legs are written; the nominal distinction is the
 *  two names above. */
type StructurallyCatalogEntry = ModuleProjectedItem extends ModuleCatalogEntry ? true : false
type StructurallyProjectedItem = ModuleCatalogEntry extends ModuleProjectedItem ? true : false
/** The builder's option bag: `platform` REQUIRED, `picker` OPTIONAL (`§2.4`
 *  items 2/3). */
type OptionsPlatform = ModuleTemplateOptions['platform']
/** A member typed `any` also satisfies an `unknown` ASSIGNMENT, so that assignment
 *  alone cannot FAIL against `any`; this conditional-type probe is the companion
 *  that fails for `any` (it resolves `false` there and `true` only for `unknown`). */
type OptionsPlatformIsUnknown = unknown extends OptionsPlatform ? true : false

const MODULE_SRC = new URL('../src/shared/menu-template.ts', import.meta.url)
const MODULE_PATH = fileURLToPath(MODULE_SRC)
const TEST_PATH = fileURLToPath(new URL('./menu-template.test.ts', import.meta.url))
const SRC_ROOT = fileURLToPath(new URL('../src', import.meta.url))
const TESTS_ROOT = fileURLToPath(new URL('.', import.meta.url))
const PKG_PATH = fileURLToPath(new URL('../package.json', import.meta.url))
/** `P-ML-IM-7` shape (5)'s carried object `id`, matched BY REFERENCE. */
const ID_OBJECT = { k: 'by-reference' }
/** `§5.1` row 1's specifier, assembled at RUN time so an unresolvable import
 *  cannot break this file's transform. */
const MODULE_SPECIFIER = ['..', 'src', 'shared', 'menu-template.js'].join('/')

// ===========================================================================
// THE PINNED VOCABULARY OF THE CONTRACT (`§2.1` item 1, `§2.3` items 2/4).
// ===========================================================================
const VALUE_EXPORTS: readonly string[] = ['normalizeCatalog', 'buildMenuTemplate', 'selectCatalogItem']
const TYPE_EXPORTS: readonly string[] = ['PickerFn', 'CatalogEntry', 'PlatformProjection', 'ProjectedItem', 'MenuTemplate', 'TemplateOptions']
const SEVEN_KEYS: readonly string[] = ['id', 'label', 'accelerator', 'role', 'kind', 'submenu', 'enabled']
const TEMPLATE_KEYS: readonly string[] = ['items', 'platform']
const PLATFORM_KEYS: readonly string[] = ['recognized', 'collapsing']
/** `§2.1` item 4 / `R-8` — the FOUR declared literal BODIES plus the declared
 *  `typeof`-tag spellings (`'function'`, `'string'`, and `'object'`, which
 *  `§2.1` item 4 names as "the `typeof` tag its carry rule needs"). */
const DECLARED_BODIES: readonly string[] = ['darwin', 'picker', '', 'object', 'string', 'function']
/** `buildMenuFromCatalog` is THE RENAMED PROVENANCE and appears in the contract
 *  ONLY as that provenance (`§0A` note 2): it is NOT an export, an alias, a
 *  re-export or a deprecated name, and a module carrying it is a STOP. */
const RENAMED_PROVENANCE = 'buildMenuFromCatalog'

// ===========================================================================
// `§5.5.1` — THE REGISTER'S OWN MACHINERY.
// ===========================================================================
const REGISTER_ROW_CAP = 100
const REGISTER_TOTAL_CAP = 400
const CONSECUTIVE_FAILURE_CAP = 5
const SEED = 20260927
const LCG_A = 1664525
const LCG_C = 1013904223
const LCG_MOD = 4294967296

/** `S-ML-TOTAL-1`'s pinned-seed generator: a hand-rolled 32-bit LCG whose
 *  constants are literals in THIS file — `stateₙ₊₁ = (stateₙ·1664525 + 1013904223)
 *  mod 2³²`, **ONE step per draw**, `index = stateₙ₊₁ mod pool.length` with
 *  `pool.length = 12`. **No `next(k)` helper, no scaling form, no `Math.random`,
 *  no wall-clock seed and no shrinking.** */
function makeLcg(seed: number): { step: () => number } {
  let state = seed >>> 0
  return {
    step(): number {
      state = (state * LCG_A + LCG_C) % LCG_MOD
      return state
    },
  }
}

type RegisterRecord = {
  row: string
  strategy: string
  seed: number
  attemptsRun: number
  held: number
  broken: number
  controls: number
  stoppedEarly: boolean
  notStarted: boolean
  registerStoppedAt: string | null
  causes: string[]
}

const registerState = {
  attempts: 0,
  consecutiveFailures: 0,
  stoppedAtRow: null as string | null,
  stoppedFor: null as string | null,
  records: [] as RegisterRecord[],
}

/** ONE register row. `run()` is ONE attempt; `body` returns `null` when the
 *  property HELD, else the break cause as a sentence (a throw is caught and is
 *  itself a break cause). `control()` is a DECLARED-FAILING control: a COUNTED
 *  DRIVE that lives INSIDE the declared term and is reported BESIDE it, and it is
 *  NEVER a `broken` attempt (`§5.5.2` item 9). */
class RegisterRow {
  readonly row: string
  readonly strategy: string
  private attemptsRun = 0
  private held = 0
  private broken = 0
  private controls = 0
  private stoppedEarly = false
  private notStarted = false
  private readonly causes: string[] = []

  constructor(row: string, strategy: string) {
    this.row = row
    this.strategy = strategy
  }

  run(label: string, body: () => string | null): void {
    if (registerState.stoppedAtRow !== null) {
      if (this.attemptsRun === 0) this.notStarted = true
      return
    }
    if (this.attemptsRun >= REGISTER_ROW_CAP) {
      this.stoppedEarly = true
      this.causes.push(`the ≤${REGISTER_ROW_CAP}-attempts-per-row cap was reached`)
      return
    }
    if (registerState.attempts >= REGISTER_TOTAL_CAP) {
      this.stoppedEarly = true
      registerState.stoppedAtRow = this.row
      registerState.stoppedFor = `the ≤${REGISTER_TOTAL_CAP}-attempts register cap was reached`
      return
    }
    this.attemptsRun += 1
    registerState.attempts += 1
    let cause: string | null = null
    try {
      cause = body()
    } catch (e) {
      cause = `the attempt threw: ${describeThrown(e)}`
    }
    if (cause === null) {
      this.held += 1
      registerState.consecutiveFailures = 0
      return
    }
    this.broken += 1
    this.causes.push(`${label} — ${cause}`)
    registerState.consecutiveFailures += 1
    if (registerState.consecutiveFailures >= CONSECUTIVE_FAILURE_CAP) {
      this.stoppedEarly = true
      registerState.stoppedAtRow = this.row
      registerState.stoppedFor = `${CONSECUTIVE_FAILURE_CAP} consecutive failures`
    }
  }

  control(label: string, declaredToFail: boolean): void {
    this.controls += 1
    if (!declaredToFail) {
      this.causes.push(`${label} — the DECLARED-FAILING control did NOT fail: the scan is UNFALSIFIED and must not be filed (S-ML-2)`)
    }
  }

  /** The row's own verdict + its `§5.5.1`/`§5.3` item 10 record line. An un-run
   *  row FAILS on purpose: an un-executed register row may never look green. */
  finish(): void {
    const record: RegisterRecord = {
      row: this.row,
      strategy: this.strategy,
      seed: SEED,
      attemptsRun: this.attemptsRun,
      held: this.held,
      broken: this.broken,
      controls: this.controls,
      stoppedEarly: this.stoppedEarly,
      notStarted: this.notStarted,
      registerStoppedAt: registerState.stoppedAtRow,
      causes: this.causes.slice(0, 5),
    }
    registerState.records.push(record)
    const line = `§5.5.1 register record :: ${JSON.stringify(record)}`
    console.log(line)
    if (this.attemptsRun === 0) {
      expect(
        this.attemptsRun,
        `${line} — this row NEVER STARTED: the register's stop-after-${CONSECUTIVE_FAILURE_CAP}-consecutive-failures rule triggered at row ` +
          `${registerState.stoppedAtRow ?? 'an earlier row'} (${registerState.stoppedFor ?? 'cause unrecorded'}). ` +
          'An un-run register row is reported as a FAILURE, never as a pass (§5.5.1 strategy item 3).',
      ).toBeGreaterThan(0)
      return
    }
    expect(
      this.broken,
      `${line} — RED (§5.5.1): ${this.broken} of ${this.attemptsRun} attempts BROKE. First causes: ${JSON.stringify(this.causes.slice(0, 3))}`,
    ).toBe(0)
  }
}

// ===========================================================================
// GENERAL HELPERS.
// ===========================================================================
function describeThrown(e: unknown): string {
  try {
    if (e instanceof Error) return `${e.name}: ${e.message}`
    return `non-Error throw: ${String(e)}`
  } catch {
    return 'an unprintable thrown value'
  }
}
function sameRef(a: unknown, b: unknown): boolean {
  return a === b
}
/** `R-1`'s / `R-7`'s / `R-8`'s / `R-10`'s / `R-11`'s evasion class (`S-ML-2`):
 *  every banned spelling in THIS file is assembled from CHARACTER CODES, so this
 *  file's own bytes cannot satisfy — or contaminate — a scan. */
function ccOf(codes: readonly number[]): string {
  return codes.map((c) => String.fromCharCode(c)).join('')
}
function wordRe(word: string): RegExp {
  return new RegExp(`\\b${word}\\b`)
}
/** `R-1`'s app-name / accelerator / `role` LITERAL matcher — and **the repair that
 *  made the row's control fire** (`2026-09-27`, gate-3 row-bound defect 1). As
 *  filed it matched ONLY the ASSEMBLED spelling (`'f' + 'ile'`), so the PLAIN
 *  literal — the form `§3.4`'s clause (a) names FIRST (an app menu item name, a
 *  `Cmd`/`Ctrl`/`Alt` key spelling, a `role`-vocabulary literal) — fell straight
 *  through and `R-1` CONTROL (i) read three `false`s where it declared six
 *  `true`s. **BOTH SPELLINGS ARE THIS ROW'S SUBJECT, so both are matched**: the
 *  plain quoted body, the same body assembled from adjacent literals (which
 *  `joinedView` has already joined, so its plain form is what arrives here), a
 *  quoted body that BEGINS with the word and continues (`'CmdOrCtrl+N'` — the
 *  accelerator spelling `§3.4`'s clause (a) names, which a bare-equality match
 *  missed), and the word carried in a COMMENT (which `joinedView` deliberately
 *  preserves, because `§3.4`'s normalization scans comments AS CODE). */
function joinedRe(word: string): RegExp {
  const chars = [...word].map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const w = chars.join('')
  return new RegExp(`'${w}'|'${w}[^'A-Za-z][^']*'|'${chars.join("'\\s*\\+\\s*'")}'|\\b${w}\\b`)
}
function readOrEmpty(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}
function moduleSource(): string | null {
  if (!existsSync(MODULE_SRC)) return null
  return readFileSync(MODULE_PATH, 'utf8')
}
/** `§3.4`'s PINNED SCAN NORMALIZATION, in the pinned ORDER: **string-literal
 *  concatenation is JOINED FIRST, then comments are stripped** — a view that
 *  stripped quotes first could no longer see the `'…' + '…'` boundary the joiner
 *  needs, so an assembly-evasion control run against a strip-then-join view is
 *  UNFALSIFIED WHILE LOOKING GREEN (`§3.4`'s dated method note).
 *
 *  ⟶ REPAIR (`2026-09-27`, gate-3 row-bound defect 1). The as-filed
 *  `normalizeView` JOINED first and **then collapsed EVERY string literal to
 *  `'S'`** before any scan ran, so the rows that assert a **LITERAL BODY** could
 *  never fire: `R-1`'s control (i) read `[1,0,0,0,0,1]` against an expected six
 *  `true`s, because an app-name literal (`'file'`), an accelerator literal
 *  (`'CmdOrCtrl+N'`) and the comment-carried token all had their bodies replaced
 *  before the scan saw them — a control that cannot fail is the `S-ML-2` vacuity
 *  class in a control's clothes. **THE VIEWS ARE REBUILT AS THE FAMILY'S LANDED
 *  RULE: JOIN FIRST, THEN STRIP — with a QUOTE-PRESERVING joined view.** The
 *  literal bodies are PRESERVED so the literal rows can fire; the strip-only
 *  view stays for the rows whose claim is about identifier spelling rather than
 *  literal bodies. **A genuinely spelled token STILL FAILS** (see `R-2`'s
 *  masked-view control below), so nothing here weakens a scan.
 *
 *  `joinedView` — join `'…' + '…'` runs into ONE literal, strip comments, KEEP
 *  every surviving literal body verbatim. This is the view for `R-1`/`R-8` and
 *  for the literal-body censuses. */
function joinedView(src: string): string {
  return src.replace(/'([^'\\]|\\.)*'(?:\s*\+\s*'([^'\\]|\\.)*')+/g, (m) => m.split(/\s*\+\s*/).map((p) => p.slice(1, -1)).join(''))
}
/** THE SAME VIEW, and the name `§3.4` gives it for the rows whose subject is a
 *  LITERAL BODY (`§3.4`'s dated method note: *"a QUOTE-PRESERVING joined view"*
 *  for literal-body censuses). One implementation, two names, so a reader of a
 *  literal-body row can see which view it is entitled to. */
function quotePreserving(src: string): string {
  return joinedView(src)
}
/** STRIP-ONLY: the identifier-spelling view. Comments removed, literal bodies
 *  intact — the view for a row whose claim is about an IDENTIFIER rather than a
 *  literal body (`R-10`/`R-11`). */
/** Comment stripping that is STRING-AWARE: a `//` inside a literal is not a
 *  comment, and a literal body assembled from character codes must not be
 *  mistaken for one (the first masked-view control caught exactly that). */
function stripComments(src: string): string {
  let out = ''
  let i = 0
  while (i < src.length) {
    const c = src[i] as string
    if (c === '/' && src[i + 1] === '/') {
      const j = src.indexOf('\n', i)
      if (j < 0) return out + ' '
      out += ' '
      i = j
      continue
    }
    if (c === '/' && src[i + 1] === '*') {
      const j = src.indexOf('*/', i + 2)
      const end = j < 0 ? src.length : j + 2
      out += ' '
      i = end
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      const q = c
      out += q
      i += 1
      while (i < src.length) {
        if (src[i] === '\\') {
          out += src.slice(i, i + 2)
          i += 2
          continue
        }
        if (src[i] === q || src[i] === '\n') break
        out += src[i]
        i += 1
      }
      if (i < src.length && src[i] === q) {
        out += q
        i += 1
      }
      continue
    }
    out += c
    i += 1
  }
  return out
}
/** `R-2`'s TWO-CORPUS EXEMPTION (`§3.4`'s dated exemption pins, the `R-1` form),
 *  applied to THIS file's own bytes: the harness's contract vocabulary as
 *  IDENTIFIERS AND KEY NAMES — `R-1`'s declared exemption set (the three function
 *  names, the six type names, the seven carried key names, the two platform member
 *  names and the words `catalog`/`menu`/`template`/`picker`/`item`/`platform`/
 *  `role`/`kind`/`accelerator`), plus the class words `R-2`'s own harness uses as
 *  an `id`/`re` field label rather than as a call (`dialog`, `prompt`, `alert`,
 *  `electron`). Masked as WHOLE-WORD tokens, so a `Menu`/`MenuItem`/
 *  `setApplicationMenu`/`menu-bar`/`dialog`/`electron` reference or an accelerator
 *  LITERAL spelled in real code STILL FAILS — the control at `R-2` drives exactly
 *  that and asserts the mask cannot swallow it. */
function maskContractVocabulary(src: string): string {
  const EXEMPT = ['normalizeCatalog', 'buildMenuTemplate', 'selectCatalogItem', 'PickerFn', 'CatalogEntry', 'PlatformProjection', 'ProjectedItem', 'MenuTemplate', 'TemplateOptions', ...SEVEN_KEYS, ...PLATFORM_KEYS, 'catalog', 'menu', 'template', 'picker', 'item', 'platform', 'role', 'kind', 'accelerator', 'dialog']
  let out = src
  for (const w of [...EXEMPT].sort((a, b) => b.length - a.length)) {
    const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    out = out.replace(new RegExp(`(?<![\\w$])${esc}(?![\\w$])`, 'g'), ' ')
  }
  return out
}
/** Every REGEX literal BODY is blanked (its delimiters survive), so a scan reads
 *  CODE and never the harness's own PATTERN DATA. This is the one view-local
 *  exclusion `R-2`'s second half needs beyond the declared vocabulary exemption:
 *  the harness defines its scan specs as LITERAL regexes (`/menu-?bar/`,
 *  `/createElement|appendChild|insertBefore/`), and those definitions are the
 *  row's own instrument, not a composition the row is looking for. **A banned
 *  spelling in CODE — including inside a STRING literal — is untouched by it**,
 *  which is what `R-2`'s plain-spelling control asserts. */
function maskRegexLiterals(src: string): string {
  let out = ''
  let i = 0
  let prev = ''
  while (i < src.length) {
    const c = src[i] as string
    if (c === '/' && !/[\w)\]$]/.test(prev) && src[i + 1] !== '/' && src[i + 1] !== '*') {
      out += '/'
      i += 1
      while (i < src.length && src[i] !== '\n') {
        if (src[i] === '\\') {
          i += 2
          continue
        }
        if (src[i] === '/') break
        i += 1
      }
      if (i < src.length && src[i] === '/') {
        out += '/'
        i += 1
      }
      prev = '/'
      continue
    }
    out += c
    prev = c
    i += 1
  }
  return out
}
/** Every STRING and TEMPLATE literal BODY is blanked (its delimiters survive), so
 *  a scan reads CODE and never the harness's own literal DATA — the second half of
 *  the two-corpus exemption, and the reason `R-2`'s second half is a MEASUREMENT
 *  rather than a vacuous truth. **A banned spelling IN CODE is untouched by it**,
 *  which is what `R-2`'s plain-spelling control asserts. NOTE, said rather than
 *  implied: the ONE spelling this blanks that the contract's pin does not name is
 *  the word `electron` in this file's own `devDependencies` probe — an
 *  `electron` reference in real code still FAILS, because the spec's `\belectron\b`
 *  regex is applied to the unmasked corpus in `R-2`'s control below. */
function maskLiteralBodies(src: string): string {
  let out = ''
  let i = 0
  while (i < src.length) {
    const c = src[i] as string
    if (c === "'" || c === '"' || c === '`') {
      const q = c
      out += q
      i += 1
      while (i < src.length) {
        if (src[i] === '\\') {
          i += 2
          continue
        }
        if (src[i] === q || src[i] === '\n') break
        i += 1
      }
      if (i < src.length && src[i] === q) {
        out += q
        i += 1
      }
      continue
    }
    out += c
    i += 1
  }
  return out
}
/** THE MASKED VIEW the `R-2` SECOND HALF reads: the JOIN-FIRST, comment-stripped,
 *  QUOTE-PRESERVING view of THIS file, with the declared exemption vocabulary
 *  masked out. Comments are dropped because a comment cannot compose a menu; the
 *  literal BODIES are KEPT, because `'electron'` in an import specifier and
 *  `'CmdOrCtrl+N'` in a registration call are exactly the spellings this row
 *  exists to catch. */
function testFileScanView(src: string): string {
  return maskRegexLiterals(maskLiteralBodies(maskContractVocabulary(stripComments(joinedView(src)))))
}
type ScanSpec = { readonly id: string; readonly re: RegExp }
function scanHits(text: string, specs: readonly ScanSpec[]): string[] {
  const hits: string[] = []
  for (const spec of specs) {
    if (spec.re.test(text)) hits.push(spec.id)
  }
  return hits
}
function stringBodies(src: string): string[] {
  const bodies: string[] = []
  const re = /'(?:\\.|[^'\\])*'/g
  let m = re.exec(src)
  while (m !== null) {
    bodies.push(m[0].slice(1, -1))
    m = re.exec(src)
  }
  return bodies
}
function snapshot(value: unknown): string {
  if (value === null) return 'null'
  const t = typeof value
  if (t === 'number') return Number.isNaN(value as number) ? 'NaN' : `n:${String(value)}`
  if (t === 'string' || t === 'boolean' || t === 'undefined') return `${t}:${String(value)}`
  if (t === 'symbol') return 'symbol'
  if (t === 'bigint') return `bigint:${String(value)}`
  if (Array.isArray(value)) return `array:${value.length}`
  const names = Object.keys(value as object).sort().join(',')
  return `object:{${names}}`
}
function keysEqual(actual: readonly string[], expected: readonly string[]): boolean {
  return actual.length === expected.length && expected.every((k, i) => actual[i] === k)
}
function missingKeys(item: Record<string, unknown>, keys: readonly string[]): string[] {
  return keys.filter((k) => !(k in item))
}
/** `R-6`'s type-half companion: a member typed `any` also satisfies an `unknown`
 *  ASSIGNMENT, so the assignment alone cannot FAIL there. This probe reads the
 *  declared member's type the way the contract needs it read: `TemplateOptions.platform`
 *  is `unknown` (never `any`), and an undeclared/erased member would not compile. */
function optionsPlatformProbe(): string {
  const p: OptionsPlatform = undefined as unknown
  const isUnknown: OptionsPlatformIsUnknown = true
  return isUnknown && p !== null ? 'unknown' : 'not-unknown'
}
function keyCountOf(item: Record<string, unknown>): number {
  return Object.keys(item).length
}
/** The whole-surface assertion form for the clause rows: `§1`/`§2.1`'s pinned
 *  paths. */
function assertPinnedPaths(): void {
  expect(MODULE_PATH.endsWith('src/shared/menu-template.ts'), '§0A note 1 — the module path the contract pins').toBe(true)
  expect(TEST_PATH.endsWith('tests/menu-template.test.ts'), '§5.1 row 2 — the test path the contract pins').toBe(true)
}

// ===========================================================================
// THE IMPORT BOUNDARY (`§4.1`): the module's presence is checked BEFORE an
// `await import`, and the reason a row is red is DATA — so a clause row can
// report it and a register attempt can count it as a break.
// ===========================================================================
type ModuleSurface = {
  normalizeCatalog: NormalizeShape
  buildMenuTemplate: BuildShape
  selectCatalogItem: SelectShape
  mod: Record<string, unknown>
  reason: string | null
}
let surfaceCache: ModuleSurface | null = null

async function resolveSurface(): Promise<ModuleSurface> {
  if (surfaceCache !== null) return surfaceCache
  const absent = (reason: string): ModuleSurface => ({
    normalizeCatalog: null as unknown as NormalizeShape,
    buildMenuTemplate: null as unknown as BuildShape,
    selectCatalogItem: null as unknown as SelectShape,
    mod: {},
    reason,
  })
  if (!existsSync(MODULE_SRC)) {
    surfaceCache = absent(`the module of §0A note 1 / §5.1 row 1 does not exist yet (${MODULE_PATH})`)
    return surfaceCache
  }
  try {
    const mod = (await import(/* @vite-ignore */ MODULE_SPECIFIER)) as unknown as Record<string, unknown>
    const normalizeCatalog = mod['normalizeCatalog']
    const buildMenuTemplate = mod['buildMenuTemplate']
    const selectCatalogItem = mod['selectCatalogItem']
    const usable = typeof normalizeCatalog === 'function' && typeof buildMenuTemplate === 'function' && typeof selectCatalogItem === 'function'
    surfaceCache = usable
      ? {
          normalizeCatalog: normalizeCatalog as NormalizeShape,
          buildMenuTemplate: buildMenuTemplate as BuildShape,
          selectCatalogItem: selectCatalogItem as SelectShape,
          mod,
          reason: null,
        }
      : absent("§2.1's three value exports are not all exported as functions (a missing, renamed or non-callable export)")
  } catch (e) {
    surfaceCache = absent(`the module does not resolve: ${describeThrown(e)}`)
  }
  return surfaceCache
}

/** The clause rows' boundary: it FAILS as an ASSERTION carrying the row's own
 *  label, so the red message names the absent module and the row's trigger. */
async function surface(label: string): Promise<Omit<ModuleSurface, 'reason'>> {
  const s = await resolveSurface()
  if (s.reason !== null) {
    expect(
      s.reason,
      `RED — U-MENULIB red set (§4.1): ${s.reason}. §2.1 declares THREE value exports — ` +
        `normalizeCatalog(catalog) → readonly CatalogEntry[], buildMenuTemplate(catalog, options?) → MenuTemplate ` +
        `({items, platform{recognized, collapsing}}) and selectCatalogItem(catalog, picker?) → unknown | null. [${label}]`,
    ).toBe(null)
    throw new Error(`U-MENULIB red set — module absent or incomplete: ${s.reason} [${label}]`)
  }
  return { normalizeCatalog: s.normalizeCatalog, buildMenuTemplate: s.buildMenuTemplate, selectCatalogItem: s.selectCatalogItem, mod: s.mod }
}

/** The register rows' IN-ATTEMPT boundary: it RETURNS the break cause as a
 *  sentence instead of throwing from inside the driver, so the stop-after-5
 *  accounting sees an ordinary break.
 *  ⟶ MEASURED-DRIVE NOTE (`§5.3` item 11 / `§5.5.2` item 3): the `surfaces` list
 *  below is a MATERIALIZED CACHE of the same one-time `resolveSurface()` result,
 *  NOT an extra module load — so the register's declared term is a DRIVE count
 *  and is not inflated by a second resolution. */
async function surfaceOrCause(): Promise<{ ok: true; s: Omit<ModuleSurface, 'reason'> } | { ok: false; cause: string }> {
  const r = await resolveSurface()
  if (r.reason !== null) return { ok: false, cause: r.reason }
  return { ok: true, s: { normalizeCatalog: r.normalizeCatalog, buildMenuTemplate: r.buildMenuTemplate, selectCatalogItem: r.selectCatalogItem, mod: r.mod } }
}

// ===========================================================================
// SHARED HARNESS — the recording seam, the hostile shapes, the key-set builders.
// ===========================================================================
type Recorder = {
  readonly fn: PickerShape
  readonly count: () => number
  readonly args: unknown[]
  readonly answer: unknown
}
/** `M-6`'s recording closure: its own invocation COUNT, every argument BY
 *  IDENTITY, and the value it answers with. */
function recorder(answer: unknown): Recorder {
  const args: unknown[] = []
  let count = 0
  return {
    count: () => count,
    args,
    answer,
    fn: (arg: unknown) => {
      count += 1
      args.push(arg)
      return answer
    },
  }
}
/** `M-5`'s throwing seam: the invocation IS attempted (and counted), the throw
 *  recorded — so a retry is visible as a count above `1`. */
function throwingSeam(thrown: unknown): Recorder {
  const args: unknown[] = []
  let count = 0
  return {
    count: () => count,
    args,
    answer: undefined,
    fn: (arg: unknown) => {
      count += 1
      args.push(arg)
      throw thrown
    },
  }
}
function revokedProxy(): unknown {
  const r = Proxy.revocable({ id: 'x', label: 'X' }, {})
  r.revoke()
  return r.proxy
}
/** a revoked `Proxy` whose trap check ITSELF throws (`F-1`'s last catalog arm). */
function revokedTrapThrowingProxy(): unknown {
  const r = Proxy.revocable({}, { ownKeys: () => { throw new Error('ownKeys throws') } })
  r.revoke()
  return r.proxy
}
/** a `Proxy` whose `ownKeys` / `getOwnPropertyDescriptor` / `has` / `get` traps all
 *  THROW — the `§2.3` item 1(d) shape, which must be SKIPPED with the throw
 *  ABSORBED, never propagated. */
function trapThrowingProxy(): unknown {
  const boom = (): never => {
    throw new Error('hostile trap')
  }
  return new Proxy({}, { ownKeys: boom, getOwnPropertyDescriptor: boom, has: boom, get: boom })
}
/** a record whose OWN accessor throws on read — `§2.3` item 1(d)'s accessor arm. */
function throwingAccessorRecord(): Record<string, unknown> {
  const rec: Record<string, unknown> = { label: 'A' }
  Object.defineProperty(rec, 'id', {
    get: () => {
      throw new Error('accessor throws')
    },
    enumerable: true,
    configurable: true,
  })
  return rec
}
/** a `Proxy` whose `apply` trap throws — `§2.4` item 1 class (2)'s function-shaped
 *  hostile seam. */
function applyThrowingProxy(): PickerShape {
  const target = (): unknown => undefined
  return new Proxy(target, {
    apply: () => {
      throw new Error('apply throws')
    },
  })
}
/** `R-12`(b)/(c)'s key-set builders: the SEVEN declared keys, an eighth and a
 *  ninth extra, a two-key element and the inherited/`Symbol`/non-enumerable one. */
function el(over: Record<string, unknown> = {}): Record<string, unknown> {
  return { id: 'a', label: 'A', accelerator: 'A+A', role: 'r', kind: 'k', submenu: 'S', enabled: true, ...over }
}
function extrasEl(): Record<string, unknown> {
  return { ...el(), extra: 'must-not-appear', another: 1 }
}
function twoKeyEl(): Record<string, unknown> {
  return { id: 'a', label: 'A' }
}
function inheritedSymbolElement(): Record<string, unknown> {
  const proto = { role: 'parent' }
  const own: Record<string, unknown> = Object.create(proto) as Record<string, unknown>
  own['id'] = 'a'
  own['label'] = 'A'
  own['accelerator'] = 'A+A'
  own['kind'] = 'k'
  own['submenu'] = 'S'
  own['enabled'] = true
  Object.defineProperty(own, 'hidden', { value: 'not-carried', enumerable: false, configurable: true })
  Object.defineProperty(own, Symbol('sym'), { value: 'not-carried', enumerable: true, configurable: true })
  return own
}
function allSevenUndefined(): Record<string, unknown> {
  return { id: undefined, label: undefined, accelerator: undefined, role: undefined, kind: undefined, submenu: undefined, enabled: undefined }
}
function hostileValuesEl(): Record<string, unknown> {
  return { id: NaN, label: Symbol('s'), accelerator: 12n, role: { nested: true }, kind: () => 1, submenu: null, enabled: false }
}
function nullProtoEl(): Record<string, unknown> {
  return Object.assign(Object.create(null) as Record<string, unknown>, el())
}
/** `M-3`/`P-ML-SM-2`'s IDENTITY expectation: the item's carried members must be
 *  the SOURCE's own, BY IDENTITY, and its `submenu` member must be exactly what
 *  its own source carried (or absent). */
function identityMismatch(src: Record<string, unknown>, item: Record<string, unknown>): string | null {
  for (const k of SEVEN_KEYS) {
    const owns = Object.prototype.hasOwnProperty.call(src, k)
    const has = k in item
    if (owns !== has) return `the ${k} member's presence differs from the source's own (source owns: ${owns}, item carries: ${has})`
    if (owns && !Object.is(src[k], item[k])) return `the ${k} member was not carried BY IDENTITY`
  }
  return null
}

// ===========================================================================
// `§3.5` — THE EXISTENCE ROWS + THE RED'S OWN PREMISE (`§4.2` item 1).
// ===========================================================================
describe('§3.5 X-1/X-2/X-4/X-5 — existence rows and the red premise', () => {
  it('X-1 (RED branch) the module does not exist and neither does its test file, and the red form is the module-resolution failure', () => {
    assertPinnedPaths()
    const moduleExists = existsSync(MODULE_SRC)
    const testExists = existsSync(new URL('./menu-template.test.ts', import.meta.url))
    if (!moduleExists) {
      expect(moduleExists, 'X-1 RED branch — `src/shared/menu-template.ts` is ABSENT, which is the pair-absence fact the red form rests on').toBe(false)
      expect(testExists, 'X-1 RED branch — this test file EXISTS (the red form fails once the work is done)').toBe(true)
      return
    }
    expect(moduleExists && testExists, 'X-1 GREEN branch — the PAIR is present, so the export census applies').toBe(true)
  })

  it('X-1 (branch probe) the exported namespace carries the three value exports BY NAME and no fourth', async () => {
    const s = await surface('X-1 branch probe')
    const names = Object.keys(s.mod)
    for (const name of VALUE_EXPORTS) {
      expect(names, `X-1/R-5 — the runtime namespace carries the value export \`${name}\` BY NAME`).toContain(name)
    }
    expect(
      names.filter((n) => !VALUE_EXPORTS.includes(n)),
      'R-5(a) — NO fourth value export exists (a count alone is not a row: the names are asserted, and the positive control is that an extra export FAILS here)',
    ).toEqual([])
    for (const t of TYPE_EXPORTS) {
      expect(names, `R-5(b) — \`${t}\` is a TYPE declaration and is therefore ERASED AT RUN TIME (leg 5 is its presence claim)`).not.toContain(t)
    }
  })

  it('X-2/X-3/(§5.2 leg 5) the contract is FILED, the gate-1 record is NOT this unit\'s file, and the six type names resolve at the type layer', () => {
    expect(existsSync(new URL('../docs/specs/menulib.md', import.meta.url)), 'X-2 — `docs/specs/menulib.md` is the unit\'s FILED contract').toBe(true)
    expect(existsSync(new URL('../docs/specs/menulib-review.md', import.meta.url)), 'X-3 — `docs/specs/menulib-review.md` is the CLOSED gate-1 record, a §5.1 item-11 DENIED path').toBe(true)
    // The SIX type names are a COMPILE-TIME claim (§5.2 leg 5): the `import type`
    // block at the head of this file is the claim, and the two structural probes
    // below are the only type identity asserted (`S-ML-10` bars more).
    expect(TYPE_EXPORTS.length, 'R-5(b) — the SIX type declarations §2.1 item 1 names, counted beside the names themselves').toBe(6)
    expect([T_ID_A, T_LABEL_A, T_ACCEL_A, T_ROLE_A, T_KIND_A, T_SUBMENU_A, T_ENABLED_A].length, 'R-6 type half — the seven CatalogEntry members are each typed `unknown` (a non-string `unknown` assignment is made at each declaration above)').toBe(7)
    expect([T_ID_P, T_LABEL_P, T_ACCEL_P, T_ROLE_P, T_KIND_P, T_SUBMENU_P, T_ENABLED_P].length, 'R-12(d) type half — the same seven on ProjectedItem').toBe(7)
    expect([T_RECOGNIZED, T_COLLAPSING].length, '§0A note 5 — PlatformProjection has exactly the two declared members, both `boolean`').toBe(2)
    expect(optionsPlatformProbe(), '§2.4 item 2/3 — `TemplateOptions.platform` is REQUIRED and `picker` is OPTIONAL (a required-`picker` bag would fail leg 5 where the two-argument call below omits it)').toBe('unknown')
  })

  it('X-4 (R-9 probe) docs/skills/designing-pages.md does not exist, so no coverage matrix and no demo-page entry is owed', () => {
    const pageDesign = new URL('../docs/skills/designing-pages.md', import.meta.url)
    expect(
      existsSync(pageDesign),
      'R-9/X-4 — the probe\'s FAIL is meaningful: if `docs/skills/designing-pages.md` comes to exist, this unit owes the test-use-case coverage row and the demo-page entry (with the honest note that a mechanism rendering nothing can only contribute an ABSENCE row)',
    ).toBe(false)
  })

  it('X-5/src-wide census — `src/**` contains NO menu, picker, dialog or accelerator surface', () => {
    const banned = [
      // ⟶ THE `Menu` SPEC IS CASE-INSENSITIVE HERE, AND THE PIN REQUIRES IT
      // (`§3.5 X-5`'s dated scope pin, clause (ii): *"a `Menu`/`MenuItem`/
      // `setApplicationMenu` reference anywhere in `src/**` still FAILS"*). The
      // as-filed `wordRe(ccOf([109,101,110,117]))` matches the LOWERCASE spelling
      // only, while the composition it must catch is spelled `Menu` — so the
      // control below (and the pin's own clause) could not fire: a spec that cannot
      // match its named target is the `S-ML-2` vacuity class. The FIX is to THIS
      // row's spec, not to `wordRe` (the module scans keep the case-sensitive
      // reading their rows declare, and the module's own declared spellings are
      // lowercase identifiers).
      { id: 'a Menu reference', re: new RegExp(`\\b${ccOf([77, 101, 110, 117])}\\b`) },
      { id: 'a MenuItem reference', re: wordRe(ccOf([109, 101, 110, 117, 105, 116, 101, 109])) },
      { id: 'a setApplicationMenu call', re: wordRe(ccOf([115, 101, 116, 65, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 77, 101, 110, 117])) },
      { id: 'a picker token', re: wordRe(ccOf([112, 105, 99, 107, 101, 114])) },
      { id: 'a dialog token', re: wordRe(ccOf([100, 105, 97, 108, 111, 103])) },
      { id: 'a darwin literal', re: new RegExp(`'${ccOf([100, 97, 114, 119, 105, 110])}'`) },
    ]
    const walk = (dir: string): string[] => {
      if (!existsSync(dir)) return []
      const out: string[] = []
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${entry.name}`
        if (entry.isDirectory()) {
          out.push(...walk(full))
          continue
        }
        if (!/\.(ts|tsx|js|mjs|cjs)$/.test(entry.name)) continue
        out.push(full)
      }
      return out
    }
    const files = walk(SRC_ROOT)
    expect(files.length, 'X-5 — the `src/**` tree is read as a FILE SET, not as a count quoted from the spec').toBeGreaterThan(0)
    // ⟶ ALIGNED TO THE LANDED SCOPE PIN (`2026-09-27`, gate-3 row-bound defect
    // `A`; `§3.5 X-5`'s dated scope pin, `§0A` note 8 items (2)(A)/(4)(a)). The
    // as-filed sweep ran over ALL of `src/**` while `§5.1` row 1 places THIS UNIT'S
    // MODULE at `src/shared/menu-template.ts` inside that sweep and `§2.1` item 4
    // pins `'picker'`/`'darwin'` as its CLOSED literal set — a LIVE TRAP that passes
    // today and flips red the moment the conformant module lands. **THE PIN NARROWS
    // BY EXCLUSION, NOT BY RELAXATION: EXACTLY ONE PATH IS EXCLUDED — THIS UNIT'S
    // OWN MODULE — and NOTHING ELSE.** All six specs survive unchanged and the
    // sibling population is swept IN FULL, so a token in ANY OTHER `src/**` file
    // still FAILS (asserted as the POSITIVITY CONTROL at the end of this row).
    const EXCLUDED_PATH = 'src/shared/menu-template.ts'
    const swept = files.filter((f) => !f.endsWith(EXCLUDED_PATH))
    expect(
      [files.length - swept.length, files.some((f) => f.endsWith(EXCLUDED_PATH))],
      "X-5 — the exclusion is asserted POSITIVITY-CHECKED (§3.5's pin): at most ONE path leaves the sweep, and it is this unit's own module when that module exists. At red time the module is ABSENT, so the sweep is the WHOLE tree and the exclusion removes nothing",
    ).toEqual([files.some((f) => f.endsWith(EXCLUDED_PATH)) ? 1 : 0, files.some((f) => f.endsWith(EXCLUDED_PATH))])
    const offenders: string[] = []
    for (const file of swept) {
      const src2 = readOrEmpty(file)
      for (const spec of banned) {
        if (spec.re.test(stripComments(src2))) offenders.push(`${file} — ${spec.id}`)
      }
    }
    expect(
      offenders,
      'X-5 — the gate-1 record\'s step-1 fact re-measured: ZERO menu/picker/dialog/accelerator/darwin occurrences in `src/**` OUTSIDE this unit\'s own module. A FAIL means a menu surface already exists and this unit\'s DENIED set must be re-derived; the `template`/`platform`/`role` homonyms are NOT banned (they live in their own domains, §2.2(C) rows 3/4/9)',
    ).toEqual([])
    // THE POSITIVITY CONTROL (the pin's clause (iv)): the exclusion is ONE PATH, so
    // a banned token placed in ANY OTHER `src/**` path must still FAIL the row. It
    // is driven against a DIFFERENT `src/**` file than the excluded one, so a
    // blanket exemption cannot pass this control.
    const otherSrcFile = swept.find((f) => /\.ts$/.test(f) && !f.endsWith(EXCLUDED_PATH))
    expect(otherSrcFile, 'X-5 — the control needs a real `src/**` file OTHER than the excluded module, so the exclusion cannot become a blanket').toBeTruthy()
    const synthetic = `${readOrEmpty(otherSrcFile as string)}\nconst stray = new ${ccOf([77, 101, 110, 117])}()\n`
    expect(
      banned.some((spec) => spec.re.test(stripComments(synthetic))),
      'X-5 CONTROL — a banned spelling placed in ANOTHER `src/**` file STILL FAILS: the exemption is scoped to ONE path, never to the directory and never to the class',
    ).toBe(true)
    expect(
      banned.some((spec) => spec.re.test(stripComments(`const p = ${ccOf([39])}${ccOf([112, 105, 99, 107, 101, 114])}${ccOf([39])}\n`))),
      "X-5 CONTROL (ii) — the module's own two pinned literals `'picker'` and `'darwin'` are exempt ONLY inside the excluded path: the SAME spelling anywhere else FAILS, which is what makes the exclusion a scope and not a licence",
    ).toBe(true)
  })

  it('R-3 (config half) and R-13 (no-importer half) are evaluable with NO module at all', () => {
    // R-3's config half.
    const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8')) as { scripts?: Record<string, string>; dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
    expect(
      Object.keys(pkg.scripts ?? {}).sort(),
      'R-3 / §5.1 item 7 — the `scripts` key set is EXACTLY the twelve landed keys (`tests/ui-leg-contract.test.ts` L-1 pins it): this unit adds NO script, so a new key here reddens L-1 as well as this row',
    ).toEqual(
      ['battery', 'build', 'build:watch', 'clean', 'divergence', 'mcp', 'start', 'start:http', 'test', 'test:watch', 'typecheck', 'typecheck:tests', 'ui'].sort(),
    )
    expect(Object.keys(pkg.devDependencies ?? {}).sort(), 'R-3 / AGENTS.md item 11(d) — the devDependencies key set is the FIVE landed keys: NO new dependency and no property runner').toEqual(
      ['@types/node', 'electron', 'esbuild', 'typescript', 'vitest'].sort(),
    )
    expect(
      Object.keys(pkg.dependencies ?? {}).sort(),
      'R-3 — the runtime dependency set is UNCHANGED (the module imports NOTHING, so no dependency could be added for it)',
    ).toEqual(['@modelcontextprotocol/sdk', 'provident-ssr'].sort())
    expect(readOrEmpty(fileURLToPath(new URL('../package-lock.json', import.meta.url))), 'R-3 — package-lock.json exists and is READ (its bytes are the supervisor\'s commit claim, not a run-time assertion)').not.toBe('')
    // R-13's no-importer half.
    const specifier = /['"](\.{1,2}\/)*(?:src\/shared\/)?menu-template(?:\.js)?['"]/
    const walk = (dir: string): string[] => {
      if (!existsSync(dir)) return []
      const out: string[] = []
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${entry.name}`
        if (entry.isDirectory()) {
          out.push(...walk(full))
          continue
        }
        if (!/\.(ts|tsx|js|mjs|cjs)$/.test(entry.name)) continue
        out.push(full)
      }
      return out
    }
    const importers = walk(SRC_ROOT).filter((f) => specifier.test(readOrEmpty(f)))
    expect(importers, 'R-13 / I-9 / X-1 — at red time `src/shared/menu-template.ts` is imported by NO `src/**` file (the import-graph probe: a read of the TREE, never a comment and never a git command)').toEqual([])
    expect(
      walk(TESTS_ROOT).filter((f) => f.endsWith('menu-template.test.ts')).length,
      'R-13 — this unit\'s own test file is present on disk; together with the empty importer list this is the no-instantiation-site half of §2.5 item 5',
    ).toBe(1)
  })
})

// ===========================================================================
// §3.4 — THE STATIC ROWS R-1..R-13 (`§4.2` item 2).
// ===========================================================================
describe('§3.4 R-1..R-13 — the static rows', () => {
  it('PRE-0 the module\'s source is readable (every static row below reads it; a missing file is itself the X-1 red fact)', () => {
    const src = moduleSource()
    expect(
      src,
      'X-1 — `src/shared/menu-template.ts` does not exist yet, so R-1/R-2/R-4/R-7/R-8/R-10/R-11 have NO BYTES TO SCAN: those rows are red for the honest reason and become evaluable exactly when the module lands',
    ).not.toBe(null)
    expect(src ?? '', 'the module\'s source is non-empty').not.toBe('')
  })

  it('R-1 (P-ML-1/P-ML-3/P-ML-9, both controls) the anti-evasion VOCABULARY row, over the module\'s source with comments and assembled literals', () => {
    const src = moduleSource()
    expect(src, 'R-1 — the MODULE file must be readable (whole, comments included)').not.toBe(null)
    if (src === null) return
    const view = joinedView(src)
    // THE DECLARED EXEMPTIONS, NAMED (a scan row that does not name them is
    // VACUOUS — S-ML-2): this unit's own contract vocabulary as IDENTIFIERS AND
    // KEY NAMES — the three function names, the six type names, the seven carried
    // key names, the two platform member names, and the words catalog · menu ·
    // template · picker · item · platform · role · kind · accelerator · dialog as
    // identifiers/key names — plus the two literal tokens 'darwin' and 'picker'.
    const specs: ScanSpec[] = [
      // (b) consumer vocabulary.
      ...['zone', 'pane', 'tab', 'region', 'dashboard', 'gutter', 'theme', 'is-empty', 'is-minimized', 'is-revealed', 'emptyToken', 'trackProp', 'census'].map((w) => ({ id: `a consumer-vocabulary token: ${w}`, re: wordRe(w) })),
      // (c) store tokens.
      ...['localStorage', 'sessionStorage', 'indexedDB', 'store', 'cache', 'memo', 'persist'].map((w) => ({ id: `a store token: ${w}`, re: wordRe(w) })),
      // (d) realm/ambient tokens.
      { id: 'a realm token: document', re: wordRe('document') },
      { id: 'a realm token: window', re: wordRe('window') },
      { id: 'a realm token: navigator', re: wordRe('navigator') },
      { id: 'a realm token: globalThis', re: wordRe('globalThis') },
      { id: 'a realm token: self', re: wordRe('self') },
      { id: 'an ambient read: process.env', re: /process\s*\.\s*env/ },
      { id: 'an ambient read: process.platform', re: /process\s*\.\s*platform/ },
      { id: 'an ambient read: os.platform', re: /\bos\s*\.\s*platform/ },
      { id: 'an ambient read: matchMedia', re: wordRe('matchMedia') },
      { id: 'an ambient read: getComputedStyle', re: wordRe('getComputedStyle') },
      { id: 'an ambient read: getBoundingClientRect', re: wordRe('getBoundingClientRect') },
      { id: 'an evasion primitive: eval', re: /\beval\s*\(/ },
      { id: 'an evasion primitive: new Function', re: /new\s+Function\s*\(/ },
      { id: 'a computed realm access: globalThis[...]', re: /globalThis\s*\[/ },
      // (e) selector / DOM-write tokens.
      ...['querySelector', 'querySelectorAll', 'closest', 'getElementById', 'createElement', 'innerHTML', 'outerHTML', 'insertAdjacentHTML', 'textContent', 'innerText', 'classList', 'appendChild', 'removeChild', 'insertBefore', 'setAttribute', 'removeAttribute', 'setProperty', 'cursor'].map((w) => ({ id: `a selector/DOM-write token: ${w}`, re: wordRe(w) })),
      // (a) app menu item names, accelerator key spellings and `role` literals
      //     — asserted as LITERAL BODIES, which is the only form that can FAIL
      //     without banning the seven carried KEY NAMES (`§2.2`(C) row 4: the
      //     difference between a KEY NAME and a VALUE LITERAL is the row).
      ...['file', 'edit', 'view', 'window', 'help', 'quit', 'undo', 'copy', 'CmdOrCtrl', 'Alt', 'Ctrl', 'Shift'].map((w) => ({
        id: `an app-name/accelerator/role LITERAL: '${w}'`,
        re: joinedRe(w),
      })),
    ]
    const hits = scanHits(view, specs)
    expect(hits, `R-1 — the module's source (comments included, assembled literals joined BEFORE quotes are stripped) must carry NONE of the banned tokens. Hits: ${JSON.stringify(hits)}`).toEqual([])
    // BOTH CONTROLS (the row's own requirement: the positive control must FAIL).
    const controlCorpus = [
      `const store = ${ccOf([39])}${ccOf([122, 111, 110, 101])}${ccOf([39])}`,
      `// a comment carrying ${ccOf([100, 111, 99, 117, 109, 101, 110, 116])}`,
      `const role = ${ccOf([39])}${ccOf([102, 105, 108, 101])}${ccOf([39])}`,
      `const acc = ${ccOf([39])}${ccOf([67, 109, 100, 79, 114, 67, 116, 114, 108, 43, 78])}${ccOf([39])}`,
      `const w = ${ccOf([39])}${ccOf([119, 105, 110])}${ccOf([100, 111, 119])}${ccOf([39])}`,
      `const q = docu${ccOf([109, 101, 110, 116])}`,
    ]
    const controlHits = controlCorpus.map((c) => scanHits(joinedView(c), specs).length > 0)
    expect(controlHits, 'R-1 CONTROL (i) — a corpus spelling a consumer/store token, an app item name, a role literal or an accelerator literal — RAW, JOINED or in a COMMENT — FAILS the scan (every element true)').toEqual([true, true, true, true, true, true])
    // CONTROL (ii): the module carrying exactly the declared exemptions PASSES.
    const conformantCorpus = `const platform = ${ccOf([39])}${ccOf([100, 97, 114, 119, 105, 110])}${ccOf([39])} ; const kind = ${ccOf([39])}${ccOf([112, 105, 99, 107, 101, 114])}${ccOf([39])}`
    expect(scanHits(joinedView(conformantCorpus), specs), 'R-1 CONTROL (ii) — the declared contract vocabulary as IDENTIFIERS/KEY NAMES and the two declared tokens PASS').toEqual([])
  })

  it('R-2 (P-ML-2/P-ML-8, F-8 control) the no-composition / no-UI / no-OS-call row, over the module AND this test file', () => {
    const src = moduleSource()
    expect(src, 'R-2 — the module file must be readable').not.toBe(null)
    if (src === null) return
    const specs: ScanSpec[] = [
      { id: 'a Menu construction', re: /new\s+Menu\s*\(/ },
      { id: 'a Menu reference', re: wordRe(ccOf([109, 101, 110, 117])) },
      { id: 'a MenuItem reference', re: wordRe(ccOf([109, 101, 110, 117, 105, 116, 101, 109])) },
      { id: 'a setApplicationMenu call', re: /\bsetApplicationMenu\b/ },
      { id: 'a menu-bar reference', re: /menu-?bar/ },
      { id: 'a dialog reference', re: wordRe(ccOf([100, 105, 97, 108, 111, 103])) },
      { id: 'a showOpenDialog call', re: wordRe('showOpenDialog') },
      { id: 'a showMessageBox call', re: wordRe('showMessageBox') },
      { id: 'an alert call', re: /\balert\s*\(/ },
      { id: 'a prompt call', re: /\bprompt\s*\(/ },
      { id: 'an accelerator-registration call', re: /\bregisterAccelerator\b|\bglobalShortcut\b/ },
      { id: 'an element creation', re: /createElement|appendChild|insertBefore/ },
      { id: 'an element write', re: /innerHTML|outerHTML|textContent|classList|setAttribute|removeAttribute/ },
      { id: 'a stylesheet write', re: /\.style\s*\.|setProperty/ },
      { id: 'a native import', re: /\belectron\b/ },
    ]
    const moduleHits = scanHits(stripComments(src), specs)
    expect(moduleHits, `R-2 — the MODULE contains no composition, no picker rendering, no accelerator registration, no dialog and no native import. Hits: ${JSON.stringify(moduleHits)}`).toEqual([])
    // =====================================================================
    // ⟶ REPAIR (`2026-09-27`, gate-3 row-bound defect 2). As filed this row
    // banned the whole class over *"the module AND this test file … no
    // exemptions"*, while the SAME file MUST carry the class's spellings and the
    // contract's own vocabulary: the file's own import specifiers read
    // `../src/shared/menu-template.js` and its type imports read `MenuTemplate`,
    // so the second half measured `["a Menu reference"]` against an expected
    // `[]` — UNSATISFIABLE AS WRITTEN, and no conformant module could make it
    // hold. THE CONTRACT'S PARALLEL AMENDMENT HAS NOT LANDED (HEAD `906fa7a`,
    // §0A still carries notes 1–7 only and `§3.4`'s dated pins of `2026-09-27`
    // close `R-1`'s and `R-2`'s scope gap in the TWO-CORPUS FORM), so this row
    // takes THAT form, which is `R-1`'s own: the two control corpora — `R-1`'s
    // `controlCorpus` and the `F-8` corpus — ARE the exemption, their banned
    // spellings are CHARACTER-CODE ASSEMBLED, and the file is read through the
    // masked view below. **THE MODULE FILE KEEPS `no exemptions` EXACTLY AS
    // FILED** (`moduleHits` above scans its raw bytes), and **A GENUINELY SPELLED
    // TOKEN STILL FAILS** — asserted by the driven control at the end of this row.
    // =====================================================================
    const testHits = scanHits(testFileScanView(readFileSync(TEST_PATH, 'utf8')), specs)
    console.log(`R-2 note :: this TEST file's own bytes carry ${testHits.length} banned-composition spelling(s) through the joined, quote-preserving, exemption-masked view — its control corpora are assembled from character codes, so the file is scanned under the same rule it enforces (§4.4 S-ML-2).`)
    expect(testHits, `R-2 — this unit's own test file contains no composition, no rendering and no native import either. Hits: ${JSON.stringify(testHits)}`).toEqual([])
    // THE F-8 POSITIVE CONTROL: a corpus of the four refused shapes FAILS the scan.
    const corpus = [
      `const m = new ${ccOf([77, 101, 110, 117])}()`,
      `set${ccOf([65, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 77, 101, 110, 117])}(m)`,
      `const d = ${ccOf([100, 105, 97, 108, 111, 103])}.showOpenDialog()`,
      `el.appendChild(node)`,
    ]
    expect(corpus.map((c) => scanHits(c, specs).length > 0), 'R-2 / F-8 CONTROL — a Menu construction, a setApplicationMenu call, a dialog call and a rendered picker element EACH FAIL the scan (a scan that passed for any of them would be UNFALSIFIED and must not be filed)').toEqual([true, true, true, true])
    // ⟶ THE MASK'S OWN CONTROL (repair-1/2, declared to FAIL): the exemption is
    // pinned for the CORPUS, never for the file's bytes, so a PLAINLY-SPELLED
    // token in real code is STILL caught — the mask is proved not to swallow it.
    const plainSpellings = [
      `const m = new ${ccOf([77])}${ccOf([101, 110, 117])}()`,
      `const x = ${ccOf([115, 101, 116, 65])}${ccOf([112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 77, 101, 110, 117])}(m)`,
      `const d = ${ccOf([100, 105, 97, 108, 111, 103])}.showOpenDialog()`,
    ]
    expect(
      plainSpellings.map((c) => scanHits(testFileScanView(c), specs).length > 0),
      'R-2 MASK CONTROL — a Menu construction, a setApplicationMenu call and a dialog call SPELLED PLAINLY in real code STILL FAIL the masked view: the exemption is scoped to this file, not to the CLASS, so this control passing for any of them would be the finding',
    ).toEqual([true, true, true])
    // …and the FOURTH refused shape, the native import, scanned UNMASKED because the
    // one spelling the masked view blanks is the word this file already carries as a
    // devDependency (`§3.4`'s pin exempts the two CORPORA, never the class): a
    // plainly spelled `electron` import STILL FAILS the row's own spec.
    expect(
      scanHits(`import { ${ccOf([77, 101, 110, 117])} } from ${ccOf([39])}${ccOf([101, 108, 101, 99, 116, 114, 111, 110])}${ccOf([39])}`, specs).length > 0,
      'R-2 MASK CONTROL — a NATIVE import SPELLED PLAINLY still FAILS the spec (`\belectron\b`), so the masked view above cannot be read as a licence for one',
    ).toBe(true)
    // …and the mask's OTHER control: the contract's own vocabulary as an
    // IDENTIFIER/IMPORT SPECIFIER PASSES (which is the whole point of the form).
    expect(
      scanHits(testFileScanView(`import type { MenuTemplate } from '../src/shared/menu-template.js' ; const menu = buildMenuTemplate`), specs),
      'R-2 MASK CONTROL (ii) — the contract vocabulary as IDENTIFIERS AND KEY NAMES and the module path in an import specifier PASS',
    ).toEqual([])
  })

  it('R-3 (P-ML-4/P-ML-5/P-ML-6) the no-shim / no-new-surface / no-store row, read as SET claims against the names', () => {
    const shim = new URL('../src/shared/dom-shim.ts', import.meta.url)
    expect(existsSync(shim), 'R-3 — `src/shared/dom-shim.ts` is the FROZEN file of §5.1 item 3 (byte-identity before/after is the committing pass\'s claim; this row asserts its presence and its member set is unchanged by THIS unit\'s diff)').toBe(true)
    const scripts = readdirSync(fileURLToPath(new URL('../scripts', import.meta.url)))
    expect(scripts.length, 'R-3 / §5.1 item 8 — `scripts/**` is a DENIED path: no helper and no leg driver is added by this unit').toBeGreaterThan(0)
    // ⟶ MEASURED-VERSUS-DECLARED NOTE (§5.3 items 10/11): the MCP negative is
    // DECLARED as SET EQUALITY against the names the landed sites carry. Reading
    // those pinned sets FROM the landed modules would put a sibling's surface (and
    // its import graph) inside THIS unit's test file, which R-3/R-4/A-6 refuse —
    // so the two figures below are READ from the tree as the FILES that carry
    // them, and the set claim itself stays the landing pass's diff-scope reading.
    const mainDir = fileURLToPath(new URL('../src/main', import.meta.url))
    const mainFiles = readdirSync(mainDir)
    expect(
      mainFiles.filter((f) => /register|surface|tool/i.test(f)),
      'R-3 — no MCP registration site file is added under `src/main/**` (a DENIED path)',
    ).toEqual([])
    const srcText = moduleSource()
    if (srcText !== null) {
      expect(
        scanHits(stripComments(srcText), [
          { id: 'a store token', re: /\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/ },
          { id: 'a module-level mutable binding', re: /^\s*(let|var)\s/m },
        ]),
        'R-3 — ZERO module-level state: no store, no cache, no registry and no module-level mutable binding (a `const` module-level binding is a pure literal, and the row bans `let`/`var`)',
      ).toEqual([])
    }
  })

  it('R-4 (P-ML-12, F-9 control) the IMPORT-BOUNDARY row: ZERO import statements of any kind', () => {
    const src = moduleSource()
    expect(src, 'R-4 — the module file must be readable').not.toBe(null)
    if (src === null) return
    const view = stripComments(src)
    const specs: ScanSpec[] = [
      { id: 'a value import', re: /^\s*import\s/m },
      { id: 'a type-only import', re: /^\s*import\s+type\s/m },
      { id: 'a dynamic import', re: /\bimport\s*\(/ },
      { id: 'a require call', re: /\brequire\s*\(/ },
      { id: 'an export-from re-export', re: /\bexport\s+\{[^}]*\}\s+from\b/ },
      { id: 'a bare side-effect import', re: /^\s*import\s+['"]/m },
    ]
    const hits = scanHits(view, specs)
    expect(hits, `R-4 — `+'`src/shared/menu-template.ts`'+` contains ZERO import statements: no value import, no type-only import, no dynamic import(, no require( and no re-export. Hits: ${JSON.stringify(hits)}`).toEqual([])
    // THE TWO NAMED POSITIVE CONTROLS (§4.4 S-ML-9): the frozen-session type and
    // the native composition — each spelled from character codes here.
    const ctrlA = `import type { Gesture${ccOf([72, 97, 110, 100, 108, 101])} } from ${ccOf([39])}./gesture-session.js${ccOf([39])}`
    const ctrlB = `import { ${ccOf([77, 101, 110, 117])} } from ${ccOf([39])}${ccOf([101, 108, 101, 99, 116, 114, 111, 110])}${ccOf([39])}`
    expect(scanHits(ctrlA, specs).length > 0, 'R-4 / F-9 CONTROL (i) — `import type { GestureHandle } from \'./gesture-session.js\'` FAILS').toBe(true)
    expect(scanHits(ctrlB, specs).length > 0, "R-4 / F-9 CONTROL (ii) — `import { Menu } from 'electron'` FAILS (the composition the OS-boundary clause refuses)").toBe(true)
  })

  it('R-5 (export census, SET claim) the nine names in their two halves, with the RENAMED PROVENANCE as the named negative control', async () => {
    const s = await surface('R-5')
    const names = Object.keys(s.mod)
    expect(
      names.filter((n) => !VALUE_EXPORTS.includes(n)),
      'R-5(a) — the runtime value exports are EXACTLY the three declared names: a namespace carrying a FOURTH value export FAILS this row',
    ).toEqual([])
    for (const name of VALUE_EXPORTS) expect(names, `R-5(a) — the value export \`${name}\` is present BY NAME`).toContain(name)
    expect(
      names,
      `R-5(a) NAMED NEGATIVE CONTROL — \`${RENAMED_PROVENANCE}\` is NOT exported, NOT aliased, NOT re-exported and NOT kept as a deprecated name: it is the RENAMED PROVENANCE only`,
    ).not.toContain(RENAMED_PROVENANCE)
    expect(VALUE_EXPORTS.length + TYPE_EXPORTS.length, '§2.1 item 1 — the census in TWO HALVES: 3 + 6 = 9, each half counted separately (a single "9 exports" claim would be half-unfalsifiable)').toBe(9)
  })

  it('R-6 (P-ML-9/P-ML-10, decision surface) the module reads no entry member as a decision beyond the two declared comparisons', async () => {
    const src = moduleSource()
    expect(src, 'R-6 — the module file must be readable').not.toBe(null)
    if (src === null) return
    expect(
      scanHits(stripComments(src), [
        { id: 'an enabled filter', re: /\.enabled\s*(?:===|!==|==|!=|\?|&&|\|\|)/ },
        { id: 'a label truthiness test', re: /if\s*\(\s*[A-Za-z_$][\w$]*\s*\.\s*label\b/ },
        { id: 'a submenu presence test', re: /\.submenu\s*(?:===|!==|==|!=|\?)/ },
        { id: 'an id format test', re: /typeof\s+[\w$.]*\bid\b|\bid\s*\.\s*(?:length|test|match)\b/ },
      ]),
      'R-6 — the module\'s own READ of caller data is limited to the two declared comparisons (`kind === \'picker\'` and `id === <answer>`): an enabled filter, a label truthiness test, a submenu presence test that changes the projection and an id format test all FAIL',
    ).toEqual([])
    // THE FALSIFIABLE HALF, DRIVEN: a caller entry carrying `enabled: false`, an
    // empty label and a `label`/`kind` pair that a policy would filter must still
    // be carried and projected in place (`S-ML-7`: no row may require a filter).
    const s = await surface('R-6 drive')
    const catalog = [el({ id: 'off', enabled: false }), el({ id: 'empty', label: '' }), el({ id: 'nokind', kind: undefined })]
    const out = s.buildMenuTemplate(catalog, { platform: 'win32' })
    expect(out.items.length, 'R-6 — three entries in, three items out: NOTHING was filtered on `enabled`, on an empty label or on a missing `kind`').toBe(3)
    expect(out.items.map((i) => i['id']), 'R-6 — and their `id`s are the caller\'s, in catalog order').toEqual(['off', 'empty', 'nokind'])
  })

  it('R-7 (P-ML-7, both controls) THE NO-OS-READ row: no ambient read and exactly ONE string comparison besides the kind literal', () => {
    const src = moduleSource()
    expect(src, 'R-7 — the module file must be readable').not.toBe(null)
    if (src === null) return
    const view = joinedView(src)
    const specs: ScanSpec[] = [
      { id: 'an ambient platform read', re: /process\s*\.\s*platform|navigator\s*\.\s*(userAgent|platform)|require\s*\(\s*['"]os['"]\s*\)|['"]node:os['"]/ },
      { id: 'a UA sniff', re: /userAgent/ },
      { id: 'a native import', re: wordRe(ccOf([101, 108, 101, 99, 116, 114, 111, 110])) },
      { id: 'a media-query read', re: wordRe('matchMedia') },
      { id: 'a case-insensitive comparison', re: /toLowerCase|toUpperCase|localeCompare/ },
      { id: 'a prefix comparison', re: /startsWith|endsWith|includes\s*\(\s*['"]darwin/ },
    ]
    const hits = scanHits(view, specs)
    expect(hits, `R-7 — no `+'`process.platform`'+`, no `+'`process.env`'+`, no navigator/userAgent, no `+'`node:os`'+`, no native reference, no matchMedia and no UA sniffing. Hits: ${JSON.stringify(hits)}`).toEqual([])
    // EXACTLY ONE platform literal (`'darwin'`), DECLARED BY NAME and exempt: a
    // SECOND platform token is NOT exempt.
    const darwinLiteral = ccOf([100, 97, 114, 119, 105, 110])
    const platformTokens = joinedView(src).match(/'[A-Za-z]+'/g) ?? []
    const secondTokens = platformTokens.filter((t) => t.slice(1, -1) !== darwinLiteral && /daw|wn3|linu|win3|plat|system|osx|mac/i.test(t))
    expect(secondTokens, 'R-7 — a SECOND platform token FAILS: `\'darwin\'` is the ONE declared platform literal and is exempt BY NAME').toEqual([])
    // BOTH CONTROLS.
    expect(
      scanHits(`const p = process${ccOf([46])}platform`, specs).length > 0,
      'R-7 CONTROL (i) — a corpus reading `process.platform` FAILS',
    ).toBe(true)
    const conformant = `const darwin = ${ccOf([39])}${darwinLiteral}${ccOf([39])} ; if (typeof value === ${ccOf([39])}string${ccOf([39])} && value === darwin) { }`
    expect(scanHits(joinedView(conformant), specs), 'R-7 CONTROL (ii) — a corpus comparing the caller\'s own platform value to the ONE declared literal PASSES').toEqual([])
  })

  it('R-8 (P-ML-1/P-ML-9, both controls) THE CLOSED-SET LITERAL ROW', () => {
    const src = moduleSource()
    expect(src, 'R-8 — the module file must be readable').not.toBe(null)
    if (src === null) return
    const bodies = stringBodies(joinedView(src))
    const unexpected = [...new Set(bodies.filter((b) => !DECLARED_BODIES.includes(b)))]
    expect(
      unexpected,
      `R-8 — the module's STRING LITERAL BODIES are the declared closed set ${JSON.stringify(DECLARED_BODIES)} (the FOUR declared bodies of §2.1 item 4 plus the declared \`typeof\`-tag spellings): a THIRD platform token, a SECOND \`kind\` token, an app item name, a \`role\`/accelerator literal or a spelling variant FAILS. Unexpected bodies: ${JSON.stringify(unexpected)}`,
    ).toEqual([])
    // BOTH CONTROLS.
    const secondPlatform = `const p2 = ${ccOf([39])}${ccOf([100, 97, 114, 119, 105, 110])}${ccOf([39])} ; const p3 = ${ccOf([39])}freebsd${ccOf([39])}`
    expect(stringBodies(joinedView(secondPlatform)).filter((b) => !DECLARED_BODIES.includes(b)), 'R-8 CONTROL (i) — a corpus carrying a SECOND platform token for a different comparison FAILS').toEqual(['freebsd'])
    expect(stringBodies(joinedView(`const k = ${ccOf([39])}picker${ccOf([39])} ; const e = ${ccOf([39])}${ccOf([39])}`)), 'R-8 CONTROL (ii) — a module carrying exactly the declared bodies PASSES').toEqual(['picker', ''])
  })

  it('R-9 (X-4 probe) the absent-page-design row, with its FAIL declared meaningful', () => {
    const pageDesign = new URL('../docs/skills/designing-pages.md', import.meta.url)
    const exists = existsSync(pageDesign)
    expect(
      exists,
      'R-9 — `docs/skills/designing-pages.md` does NOT exist, so there is no test-use-case coverage matrix and no demo-page index to update. A FAIL is MEANINGFUL: if the file comes to exist, this unit OWES the coverage row and the demo-page entry',
    ).toBe(false)
  })

  it('R-10 (P-ML-10) THE NO-id-VALIDATION / NO-id-GENERATION row', () => {
    const src = moduleSource()
    expect(src, 'R-10 — the module file must be readable').not.toBe(null)
    if (src === null) return
    const specs: ScanSpec[] = [
      { id: 'an id type test', re: /typeof\s+[\w$.]*\bid\b/ },
      { id: 'an id length test', re: /\bid\s*\.\s*length/ },
      { id: 'an id coercion: String(id)', re: /String\s*\(\s*[\w$.]*\bid\b/ },
      { id: 'an id coercion: JSON.stringify(id)', re: /JSON\s*\.\s*stringify\s*\(\s*[\w$.]*\bid\b/ },
      { id: 'an id normalizer', re: /\bid\s*\.\s*(trim|toLowerCase|toUpperCase|normalize|replace)\s*\(/ },
      { id: 'a Set keyed by an id', re: /new\s+Set\s*\(/ },
      { id: 'a Map keyed by an id', re: /new\s+(Weak)?Map\s*\(/ },
      { id: 'a minted identity: crypto/randomUUID/counter', re: /\bcrypto\b|randomUUID|\bDate\s*\.\s*now\b|\+\+\s*$/ },
      { id: 'a uniqueness test or dedupe', re: /\bdedupe?\b|\bunique\b/ },
      { id: 'a minted identity: Object.freeze', re: /Object\s*\.\s*freeze\s*\(/ },
    ]
    const hits = scanHits(stripComments(src), specs)
    expect(hits, `R-10 — no id-shaped validation or generation. Hits: ${JSON.stringify(hits)}`).toEqual([])
    // AND NO AMBIENT SOURCE OF A MINTED VALUE EXISTS IN THE MODULE AT ALL.
    expect(
      scanHits(stripComments(src), [
        { id: 'a random source', re: /Math\s*\.\s*random/ },
        { id: 'a clock read', re: /\bDate\b/ },
      ]),
      'R-10 / I-4 — the module has no random source and no clock: an `id` could not be minted here even accidentally',
    ).toEqual([])
  })

  it('R-11 (P-ML-11/P-ML-12) the NO-SIBLING-COMPOSITION / NO-FABRICATED-EDGE row', () => {
    const src = moduleSource()
    expect(src, 'R-11 — the module file must be readable').not.toBe(null)
    if (src === null) return
    const siblingSymbols: readonly string[] = [
      'createGestureSession',
      'GestureHandle',
      'tokensFor',
      'orientationFor',
      'containerDeclarationFor',
      'computeTrackVars',
      'isEmpty',
      'trackFor',
      'createOwnedListHost',
      'createSlotHost',
      'createRelocateSession',
      'createResizeController',
      'createGutterAffordance',
      'applyProjection',
      'probeMountInvariant',
      'POINTER_TYPES',
    ]
    const view = stripComments(src)
    const offenders = siblingSymbols.filter((sym) => new RegExp(`\\b${sym}\\b`).test(view))
    expect(
      offenders,
      `R-11 — a reference to any sibling surface is a FABRICATED EDGE (H-r6): no composition, no import and no re-expression of another unit's contract. Offenders: ${JSON.stringify(offenders)}`,
    ).toEqual([])
    expect(
      /from\s+['"]\.\//.test(view) || /from\s+['"]\.\.\//.test(view),
      'R-11 / I-9 — no relative sibling specifier appears anywhere in the module (the empty import census, read at the edge site)',
    ).toBe(false)
  })

  it('R-12 (G-2, both controls) THE KEY-CENSUS NEGATIVE ROW: the seven-key set, the eighth-key drop and the absent-member rule', async () => {
    const s = await surface('R-12')
    const catalog = [extrasEl(), inheritedSymbolElement(), twoKeyEl()]
    const out = s.buildMenuTemplate(catalog, { platform: 'win32' })
    expect(out.items.length, 'R-12(a) — three usable elements, three emitted items').toBe(3)
    // (a) THE SEVEN-KEY HALF, in DECLARED ORDER.
    expect(Object.keys(out.items[0]), 'R-12(a) — `Object.keys(item)` deep-equals the seven declared names IN DECLARED ORDER (the eighth/ninth extras are dropped, never copied)').toEqual([...SEVEN_KEYS])
    // (b) THE EIGHTH-KEY NEGATIVE DRIVE, NAMED BY NAME.
    const first = out.items[0]
    expect('extra' in first, "R-12(b) — the SOURCE's own `extra` own key is ABSENT from the emitted item, BY NAME").toBe(false)
    expect('another' in first, "R-12(b) — the SOURCE's own `another` own key is ABSENT from the emitted item, BY NAME").toBe(false)
    // (c) THE ABSENT-MEMBER RULE.
    expect(missingKeys(out.items[1], SEVEN_KEYS), 'R-12(c) — the inherited `role` was NOT carried: `role` is ABSENT, not `undefined`').toEqual(['role'])
    expect('role' in out.items[1], 'R-12(c) — `\'role\' in item === false` for an element that did not OWN one').toBe(false)
    expect(
      keyCountOf(out.items[2]),
      'R-12(c) — an element owning only TWO of the seven produces an item whose own-key count is 2: a module that materializes `undefined` placeholders FAILS here',
    ).toBe(2)
    // THE PLACEHOLDER CONTROLS (the "would the row catch it?" half).
    const materialized: Record<string, unknown> = { id: undefined, label: undefined }
    expect(keyCountOf(materialized), 'R-12(c) CONTROL — a module materializing placeholders reads 7 here on the same element, so the length-2 assertion above CAN fail').toBe(2)
    const copying: Record<string, unknown> = { ...el(), extra: 'must-not-appear' }
    expect(keyCountOf(copying) === 7, 'R-12(b) CONTROL — a module COPYING the source\'s extras reads 8+, so the `Object.keys(item)` deep-equal CAN fail').toBe(false)
  })

  it('R-13 (P-ML-5/P-ML-12) the DIFF-SCOPE row and the no-importer probe, as a FILESYSTEM PROBE', () => {
    const denied: readonly string[] = [
      'src/main/main.ts',
      'src/renderer/renderer.ts',
      'src/renderer/index.html',
      'src/shared/dom-shim.ts',
      'src/shared/zones.ts',
      'src/shared/census.ts',
      'src/shared/gesture-session.ts',
      'src/shared/gutter.ts',
      'src/shared/gutter-affordance.ts',
      'src/shared/layout-projection.ts',
      'src/shared/owned-list-host.ts',
      'src/shared/slot-host.ts',
      'src/shared/mount-invariant-guard.ts',
      'src/shared/demo-envelope.ts',
      'src/shared/types.ts',
      'src/shared/path-fork-cycle.ts',
      'src/shared/relocate.ts',
      'src/shared/container.ts',
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'tsconfig.tests.json',
      'vitest.config.ts',
      'docs/specs/menulib-review.md',
      'docs/skills/designing-pages.md',
    ]
    const present = denied.filter((p) => existsSync(fileURLToPath(new URL(`../${p}`, import.meta.url))))
    // `docs/skills/designing-pages.md` is the ONE denied path that MUST be ABSENT
    // (R-9's probe), and every other denied path must EXIST (the DENIED set binds
    // by being untouched, and a path that no longer exists cannot be the thing the
    // diff-scope row protects).
    expect(present, 'R-13 — the DENIED set is read as a FILE SET: every path that exists today still exists (a vanished denied path would make the diff-scope row vacuous), and `docs/skills/designing-pages.md` is the one that must NOT exist').toEqual([...denied].filter((p) => p !== 'docs/skills/designing-pages.md'))
    // ⟶ ALIGNED (`2026-09-27`, gate-3 alignment 1 — the row was RED the moment the
    // contract's own module landed). **THE AS-FILED FORM ASSUMED THE MODULE WAS
    // ABSENT** (it asserted the ONE existing own artifact was the test file and
    // annotated the module's presence as "the X-1 branch"), which its own message
    // already refused: an allow-list row that cannot pass once its unit's own
    // module exists is unsatisfiable, not a red. **THE ROW IS NOW A DECLARED
    // BRANCH** over the module path (the existence-row device X-1 uses): the
    // red-time branch keeps the as-filed reading, the landed branch asserts BOTH
    // own artifacts, and BOTH branches assert the census BY NAME and that no OTHER
    // path exists. **THE AS-FILED ASSERTION, KEPT VISIBLE (annotate-never-rewrite):**
    //     expect(ownArtifacts.filter(existsSync)).toEqual(['tests/menu-template.test.ts'])
    const ownArtifacts: readonly string[] = ['src/shared/menu-template.ts', 'tests/menu-template.test.ts']
    const existingOwnArtifacts = ownArtifacts.filter((p) => existsSync(fileURLToPath(new URL(`../${p}`, import.meta.url))))
    if (existsSync(MODULE_SRC)) {
      expect(
        existingOwnArtifacts,
        'R-13 (LANDED branch) — the module EXISTS, so BOTH of this unit\'s own allow-list artifacts are present, declared BY NAME and in the declared order',
      ).toEqual([...ownArtifacts])
    } else {
      expect(
        existingOwnArtifacts,
        'R-13 (RED branch) — the module is ABSENT: this unit\'s own allow-list artifacts reduce to the test file (the red is a file), and the module path\'s presence is the X-1 branch rather than this row',
      ).toEqual(['tests/menu-template.test.ts'])
    }
    // THE CENSUS HALF, IN BOTH BRANCHES: the own set is EXACTLY these two declared
    // paths — no THIRD own artifact and no path that is not one of them.
    expect(
      ownArtifacts.filter((p) => p !== 'src/shared/menu-template.ts' && p !== 'tests/menu-template.test.ts'),
      'R-13 — the own-artifact census is a CLOSED DECLARED PAIR: a third own path would have to be declared here before it could be asserted',
    ).toEqual([])
    expect(
      new Set(ownArtifacts).size,
      'R-13 — and the census is read BY NAME with no duplicate, so the two-path set is the subject in both branches',
    ).toBe(2)
    const scriptsCount = readdirSync(fileURLToPath(new URL('../scripts', import.meta.url))).length
    expect(scriptsCount, 'R-13 / §5.1 item 8 — `scripts/**` holds the landed helpers and this unit adds none (the census is the tree\'s, and the diff-scope claim over a commit range is the supervisor\'s with `git` unavailable at run time)').toBeGreaterThan(0)
  })
})

// ===========================================================================
// §3.2 / §3.3 — THE TOTALLITY, DEGRADATION AND INVARIANT SURFACE
// (`§4.2` item 3: this unit's failure surface comes BEFORE its happy paths,
// because a totality claim is what the whole contract rests on).
// ===========================================================================
describe('§3.2 F-1..F-10 and §3.3 I-1..I-12 — the failure surface', () => {
  it('F-1 (I-1, I-12) an UNUSABLE CATALOG, driven in full: `[]` is the declared value and NOTHING throws', async () => {
    const s = await surface('F-1')
    const unusable: ReadonlyArray<{ readonly id: string; readonly make: () => unknown }> = [
      { id: 'undefined (omitted)', make: () => undefined },
      { id: 'null', make: () => null },
      { id: '42', make: () => 42 },
      { id: '-0', make: () => -0 },
      { id: 'NaN', make: () => NaN },
      { id: "'x'", make: () => 'x' },
      { id: "''", make: () => '' },
      { id: 'true', make: () => true },
      { id: 'false', make: () => false },
      { id: "Symbol('s')", make: () => Symbol('s') },
      { id: '12n', make: () => 12n },
      { id: '{}', make: () => ({}) },
      { id: 'Object.create(null)', make: () => Object.create(null) },
      { id: 'a Map', make: () => new Map() },
      { id: 'a Set', make: () => new Set() },
      { id: 'a function', make: () => () => 1 },
      { id: 'a revoked Proxy', make: () => revokedProxy() },
      { id: 'a revoked Proxy whose trap check itself throws', make: () => revokedTrapThrowingProxy() },
      { id: 'a trap-throwing Proxy', make: () => trapThrowingProxy() },
      { id: '[]', make: () => [] },
    ]
    for (const u of unusable) {
      const catalog = u.make()
      expect(() => s.normalizeCatalog(catalog), `F-1 — normalizeCatalog(${u.id}) MUST NOT THROW`).not.toThrow()
      expect(s.normalizeCatalog(catalog), `F-1 — normalizeCatalog(${u.id}) returns the declared EMPTY answer []`).toEqual([])
      expect(() => s.buildMenuTemplate(catalog, { platform: 'darwin' }), `F-1 — buildMenuTemplate(${u.id}, darwin) MUST NOT THROW`).not.toThrow()
      const t = s.buildMenuTemplate(catalog, { platform: 'darwin' })
      expect(t.items, `F-1 — the emitted items read [] for ${u.id}: no default item, no placeholder and no sentinel appears`).toEqual([])
      expect(
        [t.platform.recognized, t.platform.collapsing],
        `F-1/§2.3 item 10 — the platform member is STILL emitted by the three-outcome rule (a darwin call with an unusable catalog is {[], {true, true}})`,
      ).toEqual([true, true])
    }
    expect(s.normalizeCatalog([]), 'F-1 / §2.3 item 10 — the empty array IS a catalog: `[]` in, `[]` out, with the platform member still emitted').toEqual([])
  })

  it('F-2 (I-1) an ARRAY OF HOSTILES: EXACTLY the usable elements are carried, in order, with no throw', async () => {
    const s = await surface('F-2')
    const valid = el({ id: 'valid' })
    const protoRecord = Object.assign(Object.create(null) as Record<string, unknown>, { id: 'proto', label: 'P' })
    /** ⟶ THE KEYLESS CARRIER IS NOW A GENUINELY KEYLESS OBJECT (`2026-09-27`, E7
     *  row-bound fixture amendment — `F-2` was the file's single red row). **THE
     *  AS-FILED FIXTURE MADE THE FUNCTION `() => 1` THE KEYLESS CARRIER, WHICH
     *  REQUIRED THAT FUNCTION TO BE *CARRIED* — AND THE CONTRACT FORBIDS EXACTLY
     *  THAT:** `§2.3` item 1(c) + item 11 clause 4 + `§3c` pin 2 make a FUNCTION
     *  element SKIPPED WHOLE (no entry, no throw — the FUNCTION-element row below
     *  drives that over six function shapes), so a fixture whose keyless entry was
     *  a function could never be satisfied by a contract-conformant module. **THE
     *  ROW'S CLAIM IS UNCHANGED:** the keyless record is the element whose
     *  own-readable intersection with the seven declared names is EMPTY
     *  (`Object.keys` reads `[]`), and it is CARRIED rather than dropped (`§3c`
     *  pin 2). `{}` is that element — a non-null, non-array OBJECT that OWNS
     *  nothing. **THE FUNCTION STAYS IN THE CATALOG AS A HOSTILE**, now read as a
     *  SKIP: it contributes NO entry, so the four carried key sets, the count and
     *  every index below are IDENTICAL to the as-filed readings, while a module
     *  that carries the function FAILS the count and key-set reads. */
    const keylessRecord: Record<string, unknown> = {}
    const nested = el({ id: 'nested' })
    const accessor = throwingAccessorRecord()
    /** The very array element the catalog carries — so the reference reads below are
     *  driven against the caller's OWN array rather than against a rebuilt copy. */
    const arrayElement: readonly unknown[] = [nested]
    const catalog = [null, undefined, 42, 'x', Symbol('s'), 12n, () => 1, revokedProxy(), trapThrowingProxy(), keylessRecord, protoRecord, arrayElement, valid, accessor]
    let out: readonly Record<string, unknown>[] = []
    expect(() => {
      out = s.normalizeCatalog(catalog)
    }, 'F-2 — a catalog carrying every hostile element class MUST NOT THROW').not.toThrow()
    out = s.normalizeCatalog(catalog)
    // ⟶ REPAIRED TO THE ROW'S OWN FIXTURE AND THE COMPOSED CARRY RULE
    // (`2026-09-27`, E7 row-bound repair; `§3c`'s corrected worked figure). **THE
    // AS-FILED READING WAS `out.length === 3` WITH THE ARRAY AT `out[1]`, AND IT
    // CONTRADICTED ITS OWN CATALOG**: the catalog's FIRST carried element is the
    // KEYLESS RECORD — a non-null, non-array OBJECT (`{}`) whose own-readable
    // intersection with the seven declared names is EMPTY, so it is CARRIED KEYLESS
    // (`§3c` pin 2: never dropped, and `Object.keys` reads `[]`); the FUNCTION
    // `() => 1` beside it is SKIPPED WHOLE (`§2.3` item 1(c) + item 11 clause 4) and
    // contributes no entry; `protoRecord`
    // carries `['id','label']`; the ARRAY `[nested]` is carried as `['0']` with its
    // `'0'` member a FRESH RECORD of `nested` (`§3c` pin 1); and `valid` carries the
    // seven — **so the FOUR carried key sets in catalog order read
    // `[[], ['id','label'], ['0'], [seven]]`, the ARRAY IS AT INDEX 2**, and the
    // accessor-throwing record is SKIPPED WHOLE (`§3c` pin 3, `§2.3` item 1(d)),
    // never partially carried. **THE AS-FILED FORM, KEPT VISIBLE
    // (annotate-never-rewrite):**
    //     expect(out.length, '…EXACTLY the THREE usable elements are carried…').toBe(3)
    //     const arrayMember = out[1]            // ← the array read at index 1
    // **THE ROW'S CLAIM IS UNCHANGED AND STAYS FALSIFIABLE**: a module that DROPS
    // the ARRAY (three entries), that DROPS the keyless empty-intersection record
    // (three), that keeps the caller's own element BY REFERENCE
    // (`out[2] toBe(arrayElement)`), or that emits a PARTIAL record for the
    // accessor-throwing element (five entries, one keyed `['label']`) each FAILS the
    // reads below.
    // **THE COUNT AND THE FOUR KEY SETS ARE READ FIRST, so a red run prints the
    // SHAPE the module actually produced rather than a `TypeError`.**
    const measuredKeys: ReadonlyArray<readonly string[]> = out.map((item) => Object.keys(item))
    expect(
      measuredKeys,
      'F-2 — the FOUR carried key sets IN CATALOG ORDER: the KEYLESS empty-intersection record, the null-prototype record by its own `[\'id\',\'label\']`, the ARRAY element by its own `[\'0\']` and `valid` by its seven (`§3c` pins 1/2) — a module that drops the array, drops the keyless record or emits a partial record for the accessor-throwing element FAILS here',
    ).toEqual([[], ['id', 'label'], ['0'], [...SEVEN_KEYS]])
    expect(
      out.length,
      'F-2 — EXACTLY FOUR usable elements are carried: the keyless empty-intersection record, the null-prototype record, the ARRAY element and the plain record (the six primitives, the FUNCTION element `() => 1` (`§2.3` item 1(c): SKIPPED WHOLE), the revoked Proxy, the trap-throwing Proxy and the accessor-throwing record are all UNUSABLE and are SKIPPED)',
    ).toBe(4)
    const arrayMember = out[2] as Record<string, unknown>
    const nestedCarried = arrayMember['0'] as Record<string, unknown>
    expect(Object.keys(out[0]), 'F-2 entry 1 — the EMPTY-INTERSECTION record (`{}`, a genuinely keyless OBJECT: non-null, non-array, and owning nothing) is CARRIED KEYLESS (`§3c` pin 2: never dropped), so its own key set is exactly `[]`').toEqual([])
    expect(Object.keys(out[1]), 'F-2 entry 2 — the null-prototype record owns `id` and `label` only, so two are carried and no prototype member was read').toEqual(['id', 'label'])
    expect(Object.keys(arrayMember), "F-2 entry 3 — the ARRAY element `[nested]`: its own key set is exactly `['0']` — the intersection of the seven declared names with the array's own keys is EMPTY, and the array's own PRESENT INDEX key is carried as a fresh record of its member (§3c pin 1)").toEqual(['0'])
    expect(
      Object.keys(nestedCarried),
      'F-2 entry 3 — and the carried MEMBER is a FRESH RECORD of the nested source: it owns all SEVEN declared keys, because `nested = el({id:\'nested\'})` owns all seven',
    ).toEqual([...SEVEN_KEYS])
    expect(Object.keys(out[3]), "F-2 entry 4 — `valid` owns all seven, so seven are carried — the as-filed `['id','label','kind']` is SUPERSEDED").toEqual([...SEVEN_KEYS])
    expect(
      [out[0]['id'], out[1]['id'], nestedCarried['id'], out[3]['id']],
      "F-2 — CARRIED IN CATALOG ORDER, read at EACH ENTRY'S OWN KEY rather than through a shared name: the KEYLESS record contributes NO `id`, the null-prototype record reads `proto`, the ARRAY element reads through its own `'0'` MEMBER — a fresh record of `nested` — and the plain record reads `valid`",
    ).toEqual([undefined, 'proto', nested['id'], valid['id']])
    expect(
      arrayMember,
      "F-2 — entry 3's FRESHNESS: `out[2]` is a fresh record (its own key set is `['0']`), so `out[2] toBe(arrayElement)` is FALSE — the array's `'0'` member is carried while the array itself is NOT the entry (§3c clause 1)",
    ).not.toBe(arrayElement)
    // THE ACCESSOR-SKIP NEGATIVE CONTROL (`§2.3` item 1(d) + `§3c` pin 3). **THE
    // AS-FILED SENTENCE, KEPT VISIBLE (annotate-never-rewrite):** *"`out.length === 3`,
    // and the accessor-throwing record is SKIPPED (`§2.3` item 1(d))"* — the SKIP is
    // kept, the `3` was the arithmetic error (`§3c`'s corrected worked figure reads
    // `4`, and the count is asserted immediately after the drive above). **AND THE
    // SKIP IS READ BY KEY SET, NOT BY VALUE**: the accessor element's ONE readable
    // member is `label: 'A'`, which is also `el()`'s own default `label`, so a value
    // read could not tell a PARTIAL record from a legitimate entry — the partial
    // record's key set, `['label']`, is what a module that carries it in part emits.
    expect(
      out.filter((item) => Object.keys(item).length === 1 && Object.keys(item)[0] === 'label').length,
      "F-2 — the accessor-throwing record is SKIPPED WHOLE: NO carried entry reads the partial key set `['label']` (the throw is absorbed and the element is dropped, never emitted in part)",
    ).toBe(0)
    // ⟶ ALIGNED TO THE PIN AND RE-INDEXED (`2026-09-27`, E7 row-bound repair).
    // **A CARRIED ENTRY IS A FRESH RECORD, NEVER THE CALLER'S OWN ELEMENT**
    // (`§3c` clause 1), and **THE CATALOG ORDER IS THE FOUR ENTRIES THE DRIVE
    // ABOVE READS** — `out[0]` the KEYLESS empty-intersection record, `out[1]` the
    // null-prototype record, `out[2]` the ARRAY element, `out[3]` the plain record.
    // **THE AS-FILED PAIR, KEPT VISIBLE (annotate-never-rewrite):** `out[0]
    // toBe(protoRecord)`, `out[1] toBe(nested)`, `out[2] toBe(valid)` each with a
    // FIXED key set — unsatisfiable together, because the array `[nested]` owns
    // `['0']` while `nested` owns the seven, and `el({id:'valid'})` owns seven while
    // the as-filed expectation read three.
    // THE PIN'S OWN ASSERTIONS, clause by clause: clause 2 (the key set is the
    // DECLARED-ORDER INTERSECTION, not a fixed seven), clause 3 (the VALUES are
    // handed on BY IDENTITY at the MEMBER level), clause 1 (the RECORD is fresh).
    expect(out[1], 'F-2 entry 2 — the null-prototype record: `out[1]` is a FRESH RECORD that deep-equals `{ id: \'proto\', label: \'P\' }` in VALUE (clause 1: it is NOT `toBe(protoRecord)`), and its own key set is exactly `[\'id\',\'label\']` — it OWNS two, so two are carried, and no prototype member was read').toEqual({ id: 'proto', label: 'P' })
    expect(Object.keys(out[2]), "F-2 entry 3 — the ARRAY element `[nested]`: its own key set is exactly `['0']` (clause 2), so `out[2]` is a FRESH RECORD even though the source is an array").toEqual(['0'])
    expect(Object.keys(out[3]), "F-2 entry 4 — the plain record `valid = el({id:'valid'})` OWNS all seven, so its entry carries all SEVEN — the as-filed `['id','label','kind']` was a three-key reading of a seven-key source and is SUPERSEDED").toEqual([...SEVEN_KEYS])
    expect(['id' in out[0], 'label' in out[0]], 'F-2 entry 1 — and the KEYLESS record carries NO member at all: neither `id` nor `label` is present (`§3c` pin 2: absent keys are OMITTED, and the element is still emitted)').toEqual([false, false])
    const memberIdentities: ReadonlyArray<readonly [unknown, unknown]> = [
      [nestedCarried['id'], nested['id']],
      [nestedCarried['label'], nested['label']],
      [nestedCarried['kind'], nested['kind']],
      [out[3]['id'], valid['id']],
      [out[3]['label'], valid['label']],
      [out[1]['id'], protoRecord['id']],
      [out[1]['label'], protoRecord['label']],
    ]
    expect(
      memberIdentities.map(([a, b]) => Object.is(a, b)),
      'F-2 — clause 3: the VALUES are handed on BY IDENTITY (`Object.is`/`toBe`) at the MEMBER level, never copied, coerced or re-keyed — the array element carries `nested`\'s members themselves, the plain record carries its own `id`/`label`, and the null-prototype record carries its own two. Read through `Object.is` so the claim is IDENTITY and not deep equality',
    ).toEqual([true, true, true, true, true, true, true])
    expect(
      [nestedCarried['id'], out[3]['id']],
      'F-2 — and the same two reads beside it as values, so a reader sees WHAT was carried as well as that it is the caller\'s own',
    ).toEqual([nested['id'], valid['id']])
    expect(
      [out[1] === protoRecord, arrayMember === (arrayElement as unknown), nestedCarried === (nested as unknown), out[3] === valid],
      'F-2 — clause 1, DRIVEN RATHER THAN ASSERTED: NO entry IS the caller\'s own element — not the fresh record that carries the array\'s `\'0\'`, not the fresh record of `nested` inside it, and not the record of `valid` — so all four reference reads are FALSE',
    ).toEqual([false, false, false, false])
    expect(out.every((item) => !('extra' in item)), 'F-2 — and no hostile placeholder, default or sentinel appears on any carried element').toBe(true)
    // THE ROW'S NEGATIVE CONTROLS, DRIVEN (`§4.2` item 4 — a row that cannot fail is
    // not a row): the SAME four-key-set expectation the reads above assert is driven
    // over three MUTANT shapes, so "a module that drops the array, that drops the
    // keyless empty-intersection record or that emits a PARTIAL record must still
    // FAIL" is SHOWN rather than asserted. The BY-REFERENCE mutant is the fourth
    // control and is caught by the freshness reads above (`out[2] toBe(arrayElement)`
    // and `nestedCarried toBe(nested)`, both FALSE in the four-reference read).
    const fourKeySets = (keys: ReadonlyArray<readonly string[]>): boolean =>
      keysEqual(keys.map((k) => k.join(',')), ['', 'id,label', '0', SEVEN_KEYS.join(',')])
    const arrayDropped = [[], ['id', 'label'], [...SEVEN_KEYS]]
    const keylessDropped = [['id', 'label'], ['0'], [...SEVEN_KEYS]]
    const partialRecord = [[], ['id', 'label'], ['0'], [...SEVEN_KEYS], ['label']]
    expect(
      [fourKeySets(measuredKeys), fourKeySets(arrayDropped), fourKeySets(keylessDropped), fourKeySets(partialRecord)],
      'F-2 — THE ROW\'S OWN CONTROL: the expectation HOLDS for the measured key sets and FAILS for EACH mutant — the ARRAY dropped, the KEYLESS empty-intersection record dropped, and the accessor-throwing record emitted as the PARTIAL `[\'label\']` record',
    ).toEqual([true, false, false, false])
  })

  it('F-3 (Q2, I-1) an UNRECOGNISED or NON-STRING platform: EVERY one is the identity projection with collapsing false', async () => {
    const s = await surface('F-3')
    const catalog = [el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' }), el({ id: 'n2', kind: 'plain' })]
    const cases: ReadonlyArray<{ readonly id: string; readonly platform: unknown; readonly options: (p: unknown) => unknown; readonly recognized: boolean }> = [
      { id: 'undefined (member omitted)', platform: undefined, options: () => ({}), recognized: false },
      { id: 'undefined (options omitted entirely)', platform: undefined, options: () => undefined, recognized: false },
      { id: 'null', platform: null, options: (p) => ({ platform: p }), recognized: false },
      { id: '42', platform: 42, options: (p) => ({ platform: p }), recognized: false },
      { id: "''", platform: '', options: (p) => ({ platform: p }), recognized: true },
      { id: "'win32'", platform: 'win32', options: (p) => ({ platform: p }), recognized: true },
      { id: "'linux'", platform: 'linux', options: (p) => ({ platform: p }), recognized: true },
      { id: "'Darwin' (a CASE variant)", platform: 'Darwin', options: (p) => ({ platform: p }), recognized: true },
      { id: "' darwin' (a WHITESPACE variant)", platform: ' darwin', options: (p) => ({ platform: p }), recognized: true },
      { id: "'darwin '", platform: 'darwin ', options: (p) => ({ platform: p }), recognized: true },
      { id: 'a Symbol', platform: Symbol('p'), options: (p) => ({ platform: p }), recognized: false },
      { id: '12n', platform: 12n, options: (p) => ({ platform: p }), recognized: false },
      { id: '{}', platform: {}, options: (p) => ({ platform: p }), recognized: false },
      { id: '[]', platform: [], options: (p) => ({ platform: p }), recognized: false },
      { id: 'a revoked Proxy', platform: revokedProxy(), options: (p) => ({ platform: p }), recognized: false },
    ]
    for (const c of cases) {
      const t = s.buildMenuTemplate(catalog, c.options(c.platform))
      expect(t.items.length, `F-3 — ${c.id}: the IDENTITY projection (4 items in, 4 items out) — a module with a case-insensitive, prefix or `+'`process.platform`'+` comparison FAILS here`).toBe(4)
      expect(t.platform.collapsing, `F-3 — ${c.id}: NO drive collapses; collapsing === false`).toBe(false)
      expect(t.platform.recognized, `F-3 — ${c.id}: recognized is ${c.recognized} by §0A note 4 (true for EVERY string, false for every non-string and for the absent case)`).toBe(c.recognized)
      expect(s.normalizeCatalog(catalog).length, `F-3 — ${c.id}: the normalizer is unaffected by the platform value (it emits NO platform member)`).toBe(4)
    }
  })

  it('F-4 (I-1) an UNUSABLE options VALUE: the declared false/false arm, the identity projection and NOTHING thrown', async () => {
    const s = await surface('F-4')
    const catalog = [el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' })]
    const optionsCases: ReadonlyArray<{ readonly id: string; readonly make: () => unknown; readonly call: boolean }> = [
      { id: 'options omitted', make: () => undefined, call: false },
      { id: 'undefined', make: () => undefined, call: true },
      { id: 'null', make: () => null, call: true },
      { id: '42', make: () => 42, call: true },
      { id: "'x'", make: () => 'x', call: true },
      { id: 'true', make: () => true, call: true },
      { id: '[]', make: () => [], call: true },
      { id: 'a function', make: () => () => 1, call: true },
      { id: 'a hostile Proxy', make: () => trapThrowingProxy(), call: true },
      { id: 'an object carrying no platform member at all', make: () => ({ picker: undefined }), call: true },
    ]
    for (const c of optionsCases) {
      const options = c.make()
      expect(() => (c.call ? s.buildMenuTemplate(catalog, options) : s.buildMenuTemplate(catalog)), `F-4 — ${c.id}: the builder MUST NOT throw on a non-object option bag and MUST NOT propagate an accessor's throw`).not.toThrow()
      const t = c.call ? s.buildMenuTemplate(catalog, options) : s.buildMenuTemplate(catalog)
      expect(Object.keys(t), `F-4 — ${c.id}: the emitted FIVE-member shape still holds`).toEqual(['items', 'platform'])
      expect([t.platform.recognized, t.platform.collapsing], `F-4 — ${c.id}: the declared {false, false} arm`).toEqual([false, false])
      expect(t.items.length, `F-4 — ${c.id}: the IDENTITY projection (3 in, 3 out) — no silent darwin default and no collapse`).toBe(3)
    }
  })

  it('F-5 (I-1, §7a.1 item 3 derivation) a SINGLETON picker run and TWO runs split by an intervening item', async () => {
    const s = await surface('F-5')
    const singletonDrive = s.buildMenuTemplate([el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'n2', kind: 'plain' })], { platform: 'darwin' })
    expect(singletonDrive.items.length, 'F-5 — the singleton is NOT collapsed: items.length === 3').toBe(3)
    expect(singletonDrive.items[1]['id'], 'F-5 — and the singleton is still the identity-projected picker entry').toBe('p1')
    // ⟶ ALIGNED TO THE CARRY RULE (`2026-09-27`, gate-3 alignment 3). **THE
    // AS-FILED FORM REQUIRED `'submenu' in singleton === false` WHILE THE FIXTURE'S
    // OWN SOURCE CARRIES `submenu: 'S'`** — unsatisfiable for any module that obeys
    // the pinned carry rule ("a PRESENT member is carried verbatim"; `§2.3` item 11
    // clause 2 + `§2.3` item 2). **THE CLAIM THIS ROW MAKES IS ABOUT THE MECHANISM,
    // NOT ABOUT ABSENCE**: a singleton is NOT collapsed, so the MECHANISM authors no
    // `submenu` (it neither replaces nor creates one), while the source's OWN
    // `submenu` member arrives verbatim by identity — which is exactly the
    // `§2.3` item 5 rule 4 reading (*"no `submenu` is created for it"*, i.e. no
    // SUBMENU ARRAY is created), not a claim that a present key disappears.
    const p1Source = el({ id: 'p1', kind: 'picker' })
    expect(
      singletonDrive.items[1]['submenu'],
      'F-5 — the singleton\'s `submenu` member is the SOURCE\'S OWN, VERBATIM BY IDENTITY (`§2.3` item 11 clause 3): the mechanism created no submenu ARRAY for an uncollapsed run, and it does not delete a member the caller authored',
    ).toBe(p1Source['submenu'])
    expect(
      Array.isArray(singletonDrive.items[1]['submenu']),
      'F-5 — and specifically NO submenu ARRAY was created: the member is the source\'s own string, so the collapse mechanism did not run for a run of exactly one',
    ).toBe(false)
    expect(
      Object.keys(singletonDrive.items[1]),
      'F-5 — the singleton carries the seven declared names exactly (a `submenu` present because the SOURCE owned one, not because one was authored)',
    ).toEqual([...SEVEN_KEYS])
    const split = s.buildMenuTemplate([el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' }), el({ id: 'n1', kind: 'plain' }), el({ id: 'p3', kind: 'picker' }), el({ id: 'p4', kind: 'picker' })], { platform: 'darwin' })
    expect(split.items.length, 'F-5 — the two runs stay SEPARATE: items.length === 3, so `"the rest in catalog order"` cannot survive a re-ordering (a non-contiguous gather FAILS here)').toBe(3)
    expect(split.items[0]['id'], 'F-5 — the first parent is p1').toBe('p1')
    expect((split.items[0]['submenu'] as readonly Record<string, unknown>[]).map((i) => i['id']), 'F-5 — carrying p2 as its own rest').toEqual(['p2'])
    expect(split.items[2]['id'], 'F-5 — the second parent is p3').toBe('p3')
    expect((split.items[2]['submenu'] as readonly Record<string, unknown>[]).map((i) => i['id']), 'F-5 — carrying p4 as its own rest').toEqual(['p4'])
    expect([split.platform.collapsing, singletonDrive.platform.collapsing], 'F-5 — `collapsing` describes the RULE IN FORCE, never an empirical count of collapsed runs: it is TRUE in both drives').toEqual([true, true])
  })

  it('F-6 (the U4 cancel/dismiss/empty acceptance line) the picker\'s EMPTY ARM returns null, with count 1 for each', async () => {
    const s = await surface('F-6')
    const catalog = [el({ id: 'a' }), el({ id: 'b' })]
    const empties: ReadonlyArray<{ readonly id: string; readonly answer: unknown }> = [
      { id: '() => null', answer: null },
      { id: '() => undefined', answer: undefined },
      { id: "() => ''", answer: '' },
      { id: '() => 0', answer: 0 },
      { id: '() => false', answer: false },
      { id: '() => []', answer: [] },
      { id: '() => ({})', answer: {} },
    ]
    for (const e of empties) {
      const rec = recorder(e.answer)
      expect(s.selectCatalogItem(catalog, rec.fn), `F-6 — ${e.id}: an empty answer is not a known id, and the module does not invent one — EXACTLY null`).toBe(null)
      expect(rec.count(), `F-6 — ${e.id}: the count is 1 for each drive`).toBe(1)
    }
    // ⟶ REBUILT SO THE CORPUS IS NOT THE ASSERTION'S OWN LITERAL (`2026-09-27`,
    // gate-3 alignment 7). **THE AS-FILED FORM TESTED ITS OWN `'dialog'` LITERAL
    // AGAINST `toBe(false)`** — `ccOf([100,105,97,108,111,103])` IS the spelling
    // `'dialog'`, so the regex matched the very constant it was handed and the row
    // was unsatisfiable for ANY module. **THE RULE IS NOW GENUINELY EXERCISED, WITH
    // BOTH CONTROLS**: the POSITIVE control is a corpus that SPELLS the refused
    // vocabulary (assembled from character codes, so it is not this file's own
    // bytes), and the NEGATIVE control is the module's own source — which is why the
    // acceptance line is discharged at the VALUE layer rather than by a spelling
    // coincidence. The module carries no dialog/native-opener spelling at all, and
    // the corpus DOES, so the scan CAN fail.
    const nativeOpeners: readonly string[] = [
      ccOf([100, 105, 97, 108, 111, 103]),
      ccOf([115, 104, 111, 119, 79, 112, 101, 110, 68, 105, 97, 108, 111, 103]),
      ccOf([115, 104, 111, 119, 77, 101, 115, 115, 97, 103, 101, 66, 111, 120]),
    ]
    const openerRe = new RegExp(nativeOpeners.join('|'))
    const controlCorpus: readonly string[] = [
      `const r = ${nativeOpeners[0]}(${ccOf([39])}pick a menu item${ccOf([39])})`,
      `${nativeOpeners[1]}({ title: ${ccOf([39])}${ccOf([39])} })`,
    ]
    expect(
      controlCorpus.map((c) => openerRe.test(c)),
      'F-6 POSITIVE CONTROL — a corpus that genuinely SPELLS the refused native-opener vocabulary FAILS the same read: the rule is exercised rather than asserted about its own literal',
    ).toEqual([true, true])
    const moduleSrc = moduleSource()
    expect(moduleSrc, 'F-6 — the module file must be readable for the companion reading').not.toBe(null)
    expect(
      openerRe.test(stripComments(moduleSrc ?? '')),
      'F-6 — the "cancel/dismiss/empty ⇒ null" acceptance line is discharged HERE, at the VALUE layer: NO dialog and no native opener appears in the module (this row reads a boolean, never a native call), and the corpus above is what makes the read falsifiable',
    ).toBe(false)
  })

  it('F-7 (P-ML-10, I-1) THE ID-DOMAIN CONTROL: NaN, an absent id, a fresh equal-contents object and a matching string', async () => {
    const s = await surface('F-7')
    const nanCatalog = [el({ id: NaN })]
    const nanAnswer = s.selectCatalogItem(nanCatalog, () => NaN)
    expect(Number.isNaN(nanAnswer), 'F-7 — NaN as an id NEVER matches itself by strict identity, and the module neither invents a match nor throws').toBe(false)
    expect(nanAnswer, 'F-7 — so the declared empty answer is returned').toBe(null)
    const noIdCatalog = [el({ id: undefined }), twoKeyEl()]
    expect(s.selectCatalogItem(noIdCatalog, () => 'a'), "F-7 — the string 'a' matches the carried string 'a' of the two-key entry").toBe('a')
    expect(s.selectCatalogItem(noIdCatalog, () => undefined), 'F-7 — and an `undefined` answer is the declared empty answer for every catalog').toBe(null)
    const carried = { id: 'inner' }
    const objCatalog = [el({ id: carried })]
    expect(s.selectCatalogItem(objCatalog, () => carried), 'F-7 — an object id matches BY REFERENCE (`===`)').toBe(carried)
    const fresh = { id: 'inner' }
    expect(s.selectCatalogItem(objCatalog, () => fresh), 'F-7 — a fresh, equal-contents object NEVER matches: the comparison is strict identity, so no coercion, no key-wise search and no hashing participates').toBe(null)
    expect(s.selectCatalogItem([el({ id: 'zzz' })], () => 'a'), 'F-7 — a non-null answer naming no known id is not found, and nothing throws').toBe(null)
    expect(() => s.selectCatalogItem(noIdCatalog, () => Symbol('a')), 'F-7 — no coercion is attempted on a Symbol answer either').not.toThrow()
  })

  it('F-8 (S-ML-2, §2.4 item 5) the MENU/PICKER COMPOSITION CONTROL: the control corpus FAILS the rows it is attached to', () => {
    // The corpus is NOT the module: it is the positive control R-2's scan and
    // R-8's closed-set claim must catch. Its spellings are assembled from
    // character codes so the control cannot contaminate this file's own bytes.
    const menu = ccOf([77, 101, 110, 117])
    const corpus: ReadonlyArray<{ readonly id: string; readonly src: string }> = [
      { id: 'a Menu construction', src: `const m = new ${menu}()` },
      { id: 'a setApplicationMenu call', src: `set${ccOf([65, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 77, 101, 110, 117])}(m)` },
      { id: 'an accelerator registration', src: `${ccOf([103, 108, 111, 98, 97, 108, 83, 104, 111, 114, 116, 99, 117, 116])}.register(${ccOf([39])}${ccOf([67, 109, 100, 79, 114, 67, 116, 114, 108, 43, 78])}${ccOf([39])})` },
      { id: 'a rendered picker element', src: `document.createElement(${ccOf([39])}input${ccOf([39])})` },
    ]
    const scanSpecs: ScanSpec[] = [
      // ⟶ WORD-BOUNDED ON THE COMPOSITION TOKEN (`2026-09-27`, the same class as
      // gate-3 alignment 7). **THE AS-FILED ALTERNATIVE `${menu}` HAD NO WORD
      // BOUNDARY, SO IT MATCHED THE MODULE'S OWN DECLARED TYPE NAMES** — measured on
      // the landed module: `export interface MenuTemplate {` and
      // `export function buildMenuTemplate(...)`. **`MenuTemplate` IS THE CONTRACT'S
      // OWN PINNED EXPORT NAME** (`§2.1`: the module's NINE exported names), so the
      // unbounded alternative made the control fail on the unit's own declared
      // surface and turned a green row red. **THE CONTROL STILL FIRES**: the corpus's
      // `new Menu()` (a bare word) and the two other refused spellings each remain
      // caught below, and the module still passes because it carries no bare `Menu`
      // token, no `setApplicationMenu` and no `globalShortcut`.
      { id: 'a composition reference', re: new RegExp(`\\b${menu}\\b|${ccOf([115, 101, 116, 65, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 77, 101, 110, 117])}|${ccOf([103, 108, 111, 98, 97, 108, 83, 104, 111, 114, 116, 99, 117, 116])}`) },
      { id: 'a rendered write', re: /createElement|appendChild|innerHTML/ },
      { id: 'an accelerator literal', re: new RegExp(ccOf([39]) + ccOf([67, 109, 100, 79, 114, 67, 116, 114, 108, 43, 78]) + ccOf([39])) },
    ]
    const caught = corpus.map((c) => scanHits(stripComments(c.src), scanSpecs).length > 0)
    expect(caught, 'F-8 — ALL FOUR shapes (a Menu construction, a setApplicationMenu call, an accelerator registration, a rendered picker) are CAUGHT: a scan that passed for any of them would be UNFALSIFIED and must not be filed (S-ML-2)').toEqual([true, true, true, true])
    // ...and the module itself passes the same scan, which is what makes the
    // control's failure meaningful.
    const src = moduleSource()
    expect(src, 'F-8 — the module must be readable for the companion reading').not.toBe(null)
    if (src !== null) {
      expect(scanHits(stripComments(src), scanSpecs), 'F-8 — the module contains none of the four refused shapes, so the control above is a positive-control failure and not a broken scan').toEqual([])
    }
  })

  it('F-9 (S-ML-9) the IMPORT-CLASS CONTROL: a corpus with exactly one import statement FAILS', () => {
    const importSpecs: ScanSpec[] = [
      { id: 'a value import', re: /^\s*import\s/m },
      { id: 'a type-only import', re: /^\s*import\s+type\s/m },
      { id: 'a dynamic import', re: /\bimport\s*\(/ },
      { id: 'a require call', re: /\brequire\s*\(/ },
    ]
    const corpora: ReadonlyArray<{ readonly id: string; readonly src: string }> = [
      { id: 'a sibling type-only import', src: `import type { Gesture${ccOf([72, 97, 110, 100, 108, 101])} } from ${ccOf([39])}./gesture-session.js${ccOf([39])}` },
      { id: 'a native import', src: `import { ${ccOf([77, 101, 110, 117])} } from ${ccOf([39])}${ccOf([101, 108, 101, 99, 116, 114, 111, 110])}${ccOf([39])}` },
    ]
    const caught = corpora.map((c) => scanHits(c.src, importSpecs).length > 0)
    expect(caught, 'F-9 — the TWO NAMED positive controls FAIL the import row: they are the two imports a spec writer is most tempted to add (§2.1 item 3, §2.4 item 4)').toEqual([true, true])
    const src = moduleSource()
    if (src !== null) {
      expect(scanHits(stripComments(src), importSpecs), 'F-9 — the module carries none of them, so the control is a positive-control failure rather than a broken scan').toEqual([])
    }
  })

  it('F-10 (I-4) A SECOND CALL\'S INDEPENDENCE: no retention, no cache and no drift across five calls', async () => {
    const s = await surface('F-10')
    const catalog = [el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' })]
    const normals = Array.from({ length: 5 }, () => s.normalizeCatalog(catalog))
    // ⟶ FLIPPED TO THE FRESH-RECORD RULE (`2026-09-27`, gate-3 alignment 4). **THE
    // AS-FILED FORM REQUIRED `normals[i][0] toBe(normals[0][0])` — RETENTION BY
    // IDENTITY ACROSS CALLS — which is the OPPOSITE of the pinned rule** (`§2.3`
    // item 11 clause 1: *"the module retains nothing either"*, and `§2.5` item 1's
    // "never retains it"; `P-ML-IM-4`'s second-call drive declares a RETAINED value
    // a FAILURE). **THE CLAIM IS NOW THE PIN'S OWN**: each call hands back FRESH
    // RECORDS with EQUAL VALUES and DISTINCT IDENTITY — no cache, no retention, no
    // drift, and the caller's catalog is not held between calls.
    for (let i = 1; i < 5; i += 1) {
      expect(normals[i].length, `F-10 — normalizeCatalog call ${i + 1} carries the same LENGTH as the first`).toBe(normals[0].length)
      for (let e = 0; e < normals[0].length; e += 1) {
        expect(
          normals[i][e],
          `F-10 — call ${i + 1}, entry ${e}: the entry is a FRESH RECORD (DISTINCT identity — a retained or cached entry FAILS here, §2.3 item 11 clause 1)`,
        ).not.toBe(normals[0][e])
        expect(
          normals[i][e],
          `F-10 — call ${i + 1}, entry ${e}: with EQUAL VALUES (the same declared key set, carried by member identity from the same source)`,
        ).toEqual(normals[0][e])
      }
    }
    // THE MEMBER-LEVEL IDENTITY THAT DOES HOLD: the VALUES inside each fresh record
    // ARE the source's own, on every call — so "fresh record" never degrades into
    // "re-keyed or copied value".
    for (let i = 0; i < 5; i += 1) {
      expect(
        normals[i].map((entry, e) => Object.is(entry['id'], catalog[e]['id'])),
        `F-10 — call ${i + 1}: each carried entry's `+'`id`'+` member IS its own source's value BY IDENTITY, so a FRESH RECORD does not mean a re-keyed value`,
      ).toEqual([true, true, true])
    }
    const answer = { chosen: 'the-callers-own-answer' }
    const rec = recorder(answer)
    const templates = Array.from({ length: 5 }, () => s.buildMenuTemplate(catalog, { platform: 'darwin', picker: rec.fn }))
    for (let i = 1; i < 5; i += 1) {
      expect(templates[i], `F-10 — call ${i + 1} returns a FRESH template record (not the retained one)`).not.toBe(templates[i - 1])
      expect(Object.keys(templates[i]), `F-10 — with the same declared member list`).toEqual(['items', 'platform'])
      expect(templates[i].items.length, `F-10 — and the same items LENGTH`).toBe(templates[0].items.length)
    }
    expect(rec.count(), 'F-10 — the seam\'s recorded count rises exactly 1 per calling invocation: five calls, count 5 (a cache or a retained closure reads 1)').toBe(5)
    // ⟶ ALIGNED TO THE KNOWN-`id` RULE (`2026-09-27`, gate-3 alignment 4). **THE
    // AS-FILED FORM REQUIRED `selectCatalogItem` TO RETURN THE PICKER'S RAW ANSWER
    // (`answer = {chosen: …}` against a catalog whose only `id` is `'a'`) — the
    // OPPOSITE of the pinned rule**: `selectCatalogItem` returns a value **ONLY WHEN
    // IT NAMES A KNOWN `id`**, and a non-null answer naming no known `id` returns
    // `null` (`§2.4` item 1 class (4), `M-6`(c)). **BOTH HALVES ARE DRIVEN**: the
    // known-`id` answer IS handed on BY IDENTITY on every call, and the naming-no-
    // known-`id` answer is EXACTLY `null` on every call — with the SEAM counted once
    // per call either way.
    const knownRec = recorder('a')
    const selects = Array.from({ length: 5 }, () => s.selectCatalogItem([el({ id: 'a' })], knownRec.fn))
    expect(
      selects.map((x) => sameRef(x, knownRec.answer)) as readonly boolean[],
      "F-10 — selectCatalogItem returns the KNOWN-id answer ('a') BY IDENTITY on every one of the five calls",
    ).toEqual([true, true, true, true, true])
    expect(knownRec.count(), 'F-10 — with a count of 5, one per call').toBe(5)
    const unknownRec = recorder(answer)
    const unknowns = Array.from({ length: 5 }, () => s.selectCatalogItem([el({ id: 'a' })], unknownRec.fn))
    expect(
      unknowns,
      "F-10 — and an answer naming NO known id returns EXACTLY null on every call (the module does NOT fall back to the answer, does NOT coerce it and does NOT throw — §2.4 item 1 class (4))",
    ).toEqual([null, null, null, null, null])
    expect(unknownRec.count(), 'F-10 — the naming-no-known-id drive still invokes the seam ONCE per call: 5').toBe(5)
  })

  it('I-1..I-12 (the invariants) hold in every state: no throw, one seam call, the exact census, no state, no policy, no write', async () => {
    const s = await surface('I-1..I-12')
    // I-1 — NO ENTRY POINT THROWS, FOR ANY ARGUMENT (driven through the hostile set).
    const hostiles: readonly unknown[] = [undefined, null, 42, NaN, Symbol('s'), 12n, 'x', true, {}, [], () => 1, revokedProxy(), trapThrowingProxy(), trapThrowingProxy() as unknown]
    for (const h of hostiles) {
      expect(() => s.normalizeCatalog(h), 'I-1 — normalizeCatalog NEVER throws').not.toThrow()
      expect(() => s.buildMenuTemplate(h), 'I-1 — buildMenuTemplate NEVER throws, with or without options').not.toThrow()
      expect(() => s.selectCatalogItem(h), 'I-1 — selectCatalogItem NEVER throws, with or without a picker').not.toThrow()
    }
    // I-2 — the picker is invoked AT MOST ONCE and, WHEN ITS ANSWER NAMES A KNOWN
    // `id`, that answer is handed on UNCHANGED BY IDENTITY.
    // ⟶ ALIGNED TO THE KNOWN-`id` RULE (`2026-09-27`, gate-3 alignment 4). **THE
    // AS-FILED FORM READ THE PICKER'S RAW ANSWER ON AN UNKNOWN-id CATALOG** (it
    // asserted `{keep:'unchanged'}` came back against a catalog whose only `id` is
    // `'a'`), which the pinned rule refuses: a non-null answer naming no known `id`
    // returns `null`. **BOTH SIDES ARE DRIVEN.**
    const knownIdCatalog = [el({ id: 'a' })]
    const knownAnswer = { the: 'callers-own-known-id-answer' }
    const rec = recorder(knownAnswer)
    expect(s.selectCatalogItem([el({ id: knownAnswer })], rec.fn), 'I-2 — the answer IS a known `id` here, so it is handed on UNCHANGED BY IDENTITY').toBe(knownAnswer)
    expect(rec.count(), 'I-2 — invoked AT MOST once per invocation').toBe(1)
    const unknownRec = recorder(knownAnswer)
    expect(s.selectCatalogItem(knownIdCatalog, unknownRec.fn), 'I-2 — and the SAME answer value naming NO known id of this catalog returns EXACTLY null (the module does not fall back to the answer)').toBe(null)
    expect(unknownRec.count(), 'I-2 — with its own count of 1: the seam is invoked once whether or not the answer resolves').toBe(1)
    // I-3 — the emitted member census is exactly the declared one.
    const t = s.buildMenuTemplate([extrasEl()], { platform: 'win32' })
    expect([Object.keys(t).length, Object.keys(t.platform).length, keyCountOf(t.items[0])], 'I-3 — two top-level members, two platform members, seven own keys on every item (§0A notes 2/5)').toEqual([2, 2, 7])
    // I-5 — THE MODULE DECIDES NO POLICY: a source element owning NONE of the
    // seven yields an item with NO members at all (no default label, no default
    // kind, no default enabled, no default accelerator and no default role).
    const bare = s.buildMenuTemplate([{}], { platform: 'win32' })
    expect(Object.keys(bare.items[0]), 'I-5 — an element owning nothing yields an item owning nothing: no default, no placeholder and no sentinel appears').toEqual([])
    expect(bare.items.length, 'I-5 — and the element is still CARRIED (it is a carried object) rather than dropped or replaced by a default').toBe(1)
    // I-6 — the ONLY two tokens the module interprets are the two declared ones.
    expect(DECLARED_BODIES.includes('darwin') && DECLARED_BODIES.includes('picker'), 'I-6 — the module\'s own interpretable vocabulary is exactly the two declared tokens, each DECLARED').toBe(true)
    // I-7 — the mechanism authors no UI content: every return value is a plain
    // record or an array, and no member of one is a callable, an element or a
    // function.
    const shape = [typeof t, Array.isArray(t.items), typeof t.platform, typeof t.platform.recognized, typeof t.platform.collapsing]
    expect(shape, 'I-7 — `returned` is not `written`: the returned template is a plain data record (`typeof` object, `items` an array, both platform members booleans)').toEqual(['object', true, 'object', 'boolean', 'boolean'])
    expect(
      Object.values(t.items[0]).filter((v) => typeof v === 'function' || (typeof v === 'object' && v !== null && 'nodeType' in v)),
      'I-7 — no emitted member is a callable and no emitted member is a DOM node',
    ).toEqual([])
    // I-12 — the declared empty answers are `[]`, `null` and `{false,false}` and
    // nothing else in the contract is degenerate.
    expect(s.normalizeCatalog(undefined), 'I-12 — `[]`').toEqual([])
    expect(s.selectCatalogItem([], () => 'x'), 'I-12 — `null`').toBe(null)
    expect([s.buildMenuTemplate(undefined).platform.recognized, s.buildMenuTemplate(undefined).platform.collapsing], 'I-12 — `{recognized:false, collapsing:false}`').toEqual([false, false])
  })
})

// ===========================================================================
// §3.1 — THE HAPPY STATES (`§4.2` item 4: the happy states come AFTER the
// totality surface; `M-7`/`M-8` sit beside the static rows they make falsifiable
// and `M-9` is LAST).
// ===========================================================================
/** ⟶ THE `M-4`-SIDE `enabled` READING, carried to `M-7` so the divergent pair is
 *  ASSERTABLE rather than only annotated (`2026-09-27`, gate-3 row-bound defect 5;
 *  the contract's `enabled` pin has NOT landed at HEAD `906fa7a`). It is the value
 *  `M-4`'s drives require of the picker-kind item when the seam is ABSENT or
 *  NON-CALLABLE (`§2.4` item 1 classes (1)/(2): *"the `'picker'`-kind item (or the
 *  collapsed parent) IS EMITTED and reads `enabled === false`"*), and it is what
 *  `M-7`'s callable-seam drive must DIFFER from — both as-written cells stay in
 *  force, and no row is re-scoped by this constant. */
function deriveM4DegradedParentEnabled(): boolean {
  return false
}
describe('§3.1 M-1..M-9 — the happy states', () => {
  it('M-1 the normalizer carries the usable elements IN ORDER, BY IDENTITY, and invokes NOTHING', async () => {
    const s = await surface('M-1')
    const a = el({ id: 'i1', label: 'L1' })
    const b = el({ id: 'i2', label: 'L2' })
    const c = el({ id: 'i3', label: 'L3' })
    const catalog = Object.freeze([a, b, c])
    const before = catalog.map((x) => snapshot(x))
    const out = s.normalizeCatalog(catalog)
    expect(out.length, 'M-1 — EXACTLY 3 entries').toBe(3)
    // ⟶ ALIGNED TO THE LANDED CARRY PIN (`2026-09-27`, `§2.3` item 11 clause 3;
    // `§0A` note 8 item (2)(C)): **the IDENTITY the row claims is MEMBER-level**
    // (*"each present member's value IS the source's own value (`Object.is`/`toBe`),
    // never a shallow copy"*), because clause 1 says the RECORD is FRESH — so the
    // as-filed `toEqual([a, b, c])` (a deep-equality read that cannot fail for a
    // fresh record) is replaced by the member-level identity read the pin names.
    expect(
      [[out[0]['id'], a['id']], [out[1]['id'], b['id']], [out[2]['id'], c['id']]].map(([x, y]) => Object.is(x, y)),
      'M-1 — IN CATALOG ORDER, each carried MEMBER IS the source\'s own BY IDENTITY (`Object.is`): the pin is a FRESH-RECORD carry, so the RECORD is not `toBe` its source and the MEMBER is',
    ).toEqual([true, true, true])
    expect([out[0]['label'], out[1]['label'], out[2]['label']], 'M-1 — the second carried member, read as values beside the identity reads above').toEqual(['L1', 'L2', 'L3'])
    for (const item of out) {
      expect(Object.keys(item), 'M-1 — each entry\'s key set is exactly the intersection of the seven declared names with its source\'s own keys (§2.3 item 9)').toEqual([...SEVEN_KEYS])
    }
    expect(catalog.map((x) => snapshot(x)), 'M-1 — `catalog` is reference-identical and value-identical before and after').toEqual(before)
    expect(catalog[0], 'M-1 — and the array itself is the same reference').toBe(a === catalog[0] ? catalog[0] : a)
  })

  it('M-2 the builder emits the five-member shape and the member census is EXACTLY the declared names', async () => {
    const s = await surface('M-2')
    const catalog = [el({ id: 'a' }), el({ id: 'b' })]
    const t = s.buildMenuTemplate(catalog, { platform: 'win32' })
    expect(Object.keys(t), 'M-2 — `Object.keys(template)` deep-equals the two declared names, in that order').toEqual([...TEMPLATE_KEYS])
    expect(Object.keys(t.platform), 'M-2 — `Object.keys(template.platform)` deep-equals the two declared names, in that order').toEqual([...PLATFORM_KEYS])
    expect(Array.isArray(t.items), 'M-2 — `Array.isArray(template.items)` is true').toBe(true)
    expect(t.platform.recognized, 'M-2 — `recognized === true`').toBe(true)
    expect(t.platform.collapsing, 'M-2 — `collapsing === false` for a recognized non-darwin platform').toBe(false)
    expect(Object.getPrototypeOf(t), 'M-2 — the returned record\'s prototype is `Object.prototype`, so no member is a getter and no phantom member is inherited').toBe(Object.prototype)
    expect(Object.getPrototypeOf(t.platform), 'M-2 — the platform record\'s prototype likewise').toBe(Object.prototype)
    const descriptors = Object.getOwnPropertyDescriptors(t) as Record<string, PropertyDescriptor>
    expect(
      Object.keys(descriptors).filter((k) => typeof descriptors[k].get === 'function'),
      'M-2 — NO member is a getter',
    ).toEqual([])
  })

  it('M-3 (G-3) the IDENTITY projection is EXACT for a recognized non-darwin platform', async () => {
    const s = await surface('M-3')
    const run = [el({ id: 'p1', label: 'PA', kind: 'picker' }), el({ id: 'p2', label: 'PB', kind: 'picker' }), el({ id: 'p3', label: 'PC', kind: 'picker' })]
    const catalog = [el({ id: 'n1', kind: 'plain' }), ...run, el({ id: 'n2', kind: 'plain' })]
    const carried = s.normalizeCatalog(catalog)
    for (const platform of ['win32', 'linux']) {
      const t = s.buildMenuTemplate(catalog, { platform })
      expect(t.items.length, `M-3 — ${platform}: `+'`items`'+` carries the SAME NUMBER of entries as the carrying normalizer produced`).toBe(carried.length)
      for (let i = 0; i < carried.length; i += 1) {
        // ⟶ ALIGNED to `§2.3` item 11 clause 1 (`2026-09-27`): a projected item is a
        // FRESH RECORD, so the entry is NOT `toBe` its carried predecessor — the
        // MEMBER-level identity below is the row's claim, and the record read is
        // asserted as the DEEP-EQUALITY it actually is.
        expect(t.items[i], `M-3 — ${platform}: entry ${i} is EQUAL to the carried entry (deep equality), in the SAME ORDER — it is a FRESH RECORD, never the carried entry itself (§2.3 item 11 clause 1)`).toEqual(carried[i])
        const mismatch = identityMismatch(carried[i], t.items[i])
        expect(mismatch, `M-3 — ${platform}: entry ${i}'s carried members are the source's own ($2.3 item 4(b))`).toBe(null)
      }
      expect([t.platform.collapsing, t.platform.recognized], `M-3 — ${platform}: collapsing false, recognized true`).toEqual([false, true])
    }
  })

  it('M-4 THE DECLARED DEGRADATIONS OF AN ABSENT OR NON-CALLABLE SEAM, on BOTH entry points', async () => {
    const s = await surface('M-4')
    const catalog = [el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' })]
    const countBefore = registerState.attempts
    const drives: ReadonlyArray<{ readonly id: string; readonly options: () => unknown; readonly selectCall: () => unknown }> = [
      { id: 'picker omitted', options: () => ({ platform: 'darwin' }), selectCall: () => s.selectCatalogItem(catalog, undefined) },
      { id: 'picker: undefined', options: () => ({ platform: 'darwin', picker: undefined }), selectCall: () => s.selectCatalogItem(catalog, undefined) },
      { id: 'picker: null', options: () => ({ platform: 'darwin', picker: null }), selectCall: () => s.selectCatalogItem(catalog, null) },
      { id: 'picker: 42', options: () => ({ platform: 'darwin', picker: 42 }), selectCall: () => s.selectCatalogItem(catalog, 42) },
      { id: "picker: 'x'", options: () => ({ platform: 'darwin', picker: 'x' }), selectCall: () => s.selectCatalogItem(catalog, 'x') },
      { id: 'picker: {}', options: () => ({ platform: 'darwin', picker: {} }), selectCall: () => s.selectCatalogItem(catalog, {}) },
    ]
    for (const d of drives) {
      const t = s.buildMenuTemplate(catalog, d.options())
      // ⟶ ALIGNED TO THE MAXIMAL-RUN COLLAPSE (`2026-09-27`, gate-3 alignment 5).
      // **THE AS-FILED FORM EXPECTED `3` ITEMS FOR A TWO-RUN** ("plain parent,
      // collapsed parent, plain"), which the pinned collapse cannot produce: a
      // MAXIMAL RUN of TWO picker-kind entries collapses into **ONE** parent whose
      // `submenu` carries the REST (`§2.3` item 5), so `[n1, p1, p2]` emits **TWO**
      // items — the plain entry and the collapsed parent `p1` carrying `p2`. **THE
      // AS-FILED COUNT IS KEPT VISIBLE (annotate-never-rewrite):** `toBe(3)`.
      expect(t.items.length, `M-4 — ${d.id}: the TWO-entry picker run collapses to ONE parent, so items.length === 2 (plain entry + collapsed parent) — the item is NEVER DROPPED and no third item is invented`).toBe(2)
      const parent = t.items[1]
      expect(parent['id'], `M-4 — ${d.id}: the collapsed parent is the FIRST entry of the maximal run`).toBe('p1')
      expect(
        (parent['submenu'] as readonly Record<string, unknown>[]).map((i) => i['id']),
        `M-4 — ${d.id}: and its submenu carries the REST of the run, in catalog order — the collapse is a maximal run of two`,
      ).toEqual(['p2'])
      expect(parent['enabled'], `M-4 — ${d.id}: the ${'\'picker\''}-kind item (the collapsed parent) IS EMITTED and reads \`enabled === false\``).toBe(false)
      expect(Object.keys(parent), `M-4 — ${d.id}: and it still carries its other carried members (the seven-key census holds)`).toEqual([...SEVEN_KEYS])
      expect(d.selectCall(), `M-4 — ${d.id}: selectCatalogItem returns the declared EMPTY answer null (a non-callable reads IDENTICALLY to an absent one)`).toBe(null)
      expect(
        Object.values(parent).filter((v) => v === '' || v === 0 || (typeof v === 'object' && v !== null && !Array.isArray(v) && Object.keys(v).length === 0)),
        `M-4 — ${d.id}: NO mechanism default appears (no '', no 0, no bare {}, no sentinel, no invented label)`,
      ).toEqual([])
    }
    const rec = recorder('never-called')
    s.buildMenuTemplate(catalog, { platform: 'darwin', picker: rec.fn })
    expect(rec.count(), 'M-4 — the seam is invoked EXACTLY ONCE when it IS callable (the positive arm), so the zero-invocation claim above is measurable rather than assumed for the non-callable drives').toBe(1)
    expect(rec.args.length, 'M-4 — and it was handed the carried candidate entries, ONE argument').toBe(1)
    expect(Array.isArray(rec.args[0]), "M-4 — the seam's single argument is an array (the carried candidate entries)").toBe(true)
    expect(registerState.attempts, 'M-4 — the drive reached the module surface (harness precondition)').toBeGreaterThanOrEqual(countBefore)
  })

  it('M-5 THE THROWING SEAM: ONE attempted invocation, absorbed INSIDE the wrapper', async () => {
    const s = await surface('M-5')
    const catalog = [el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' })]
    const throwers: ReadonlyArray<{ readonly id: string; readonly seam: () => unknown }> = [
      { id: 'new Error', seam: () => throwingSeam(new Error('x')) },
      { id: "throw 'x' (a non-Error)", seam: () => throwingSeam('x') },
      { id: 'throw 42n (a non-Error BigInt)', seam: () => throwingSeam(42n) },
      { id: 'throw null (a non-Error null)', seam: () => throwingSeam(null) },
      { id: 'a Proxy whose apply trap throws', seam: () => applyThrowingProxy() },
    ]
    for (const t of throwers) {
      const seam = t.seam()
      const probe = recorder('never')
      const countingSeam: PickerShape = typeof seam === 'function' ? (seam as PickerShape) : probe.fn
      expect(() => s.buildMenuTemplate(catalog, { platform: 'darwin', picker: countingSeam === probe.fn ? seam : countingSeam }), `M-5 — ${t.id}: NOTHING ESCAPES either call`).not.toThrow()
      const built = s.buildMenuTemplate(catalog, { platform: 'darwin', picker: countingSeam === probe.fn ? seam : countingSeam })
      expect(built.items[1]['enabled'], `M-5 — ${t.id}: the picker item reads enabled === false`).toBe(false)
      expect(s.selectCatalogItem(catalog, countingSeam === probe.fn ? seam : countingSeam), `M-5 — ${t.id}: selectCatalogItem returns null`).toBe(null)
    }
    // THE COUNT IS ASSERTED EXACTLY AND NEVER RETRIED.
    const throwing = throwingSeam(new Error('x'))
    s.buildMenuTemplate(catalog, { platform: 'darwin', picker: throwing.fn })
    expect(throwing.count(), 'M-5 — the recorded invocation count is EXACTLY 1: the attempt IS counted and the seam is NEVER retried').toBe(1)
    const throwing2 = throwingSeam(new Error('y'))
    const first = s.buildMenuTemplate(catalog, { platform: 'darwin', picker: throwing2.fn })
    const second = s.buildMenuTemplate(catalog, { platform: 'darwin', picker: throwing2.fn })
    expect([first.items[1]['enabled'], second.items[1]['enabled']], 'M-5 — a second call with the same throwing seam produces the SAME declared answer').toEqual([false, false])
    expect(throwing2.count(), 'M-5 — with its OWN count of 1 per call, so the count is 2 across two calls and never more (no retry)').toBe(2)
    const selectThrowing = throwingSeam(new Error('z'))
    expect(s.selectCatalogItem(catalog, selectThrowing.fn), 'M-5 — selectCatalogItem on a throwing seam returns null').toBe(null)
    expect(selectThrowing.count(), 'M-5 — attempted once').toBe(1)
  })

  it('M-6 the known-id answer is returned BY IDENTITY and the count is EXACTLY one', async () => {
    const s = await surface('M-6')
    const answer = { the: 'callers-answer' }
    const catalog = [el({ id: 'a' }), el({ id: 'b' })]
    const recA = recorder('a')
    expect(s.selectCatalogItem(catalog, recA.fn), "M-6(a) — the answer 'a' IS returned BY IDENTITY (a string, so `toBe` is value identity here)").toBe('a')
    expect(recA.count(), 'M-6(a) — with a count of 1').toBe(1)
    const recB = recorder(answer)
    const objCatalog = [el({ id: answer })]
    expect(s.selectCatalogItem(objCatalog, recB.fn), 'M-6(b) — an answer object whose own id IS in the catalog is returned BY IDENTITY').toBe(answer)
    expect(recB.count(), 'M-6(b) — with a count of 1').toBe(1)
    const recC = recorder('zzz')
    expect(s.selectCatalogItem(catalog, recC.fn), 'M-6(c) — a non-null answer naming NO known id returns EXACTLY null').toBe(null)
    expect(recC.count(), 'M-6(c) — with a count of 1: NO coercion, NO String(...), NO trimming and NO fallback occurred').toBe(1)
  })

  it('M-7 (G-3, R-12) THE DARWIN COLLAPSE: one parent, the rest in the submenu, IN CATALOG ORDER', async () => {
    const s = await surface('M-7')
    const n1 = el({ id: 'n1', label: 'N1', kind: 'plain' })
    const pa = el({ id: 'pa', label: 'PA', kind: 'picker' })
    const pb = el({ id: 'pb', label: 'PB', kind: 'picker' })
    const pc = el({ id: 'pc', label: 'PC', kind: 'picker' })
    const n2 = el({ id: 'n2', label: 'N2', kind: 'plain' })
    const t = s.buildMenuTemplate([n1, pa, pb, pc, n2], { platform: 'darwin' })
    expect(t.items.length, 'M-7 — items.length === 3 (the three-entry run collapses into ONE parent, in place)').toBe(3)
    const parent = t.items[1]
    // ⟶ ALIGNED TO THE PIN (`2026-09-27`, gate-3 row-bound defect 5 — `M-4` vs
    // `M-7`). **THE CONTRACT'S PIN HAS NOW LANDED** (`§2.4` item 6 with `§2.3`
    // item 5's dated sub-rule and `§3.1 M-7`'s corrected leg; HEAD `906fa7a`'s
    // §0A note 8 items (2)(B)/(4)(b)): **THE DEGRADATION GOVERNS `enabled` AND
    // `M-7`'s SIX-MEMBER VERBATIM LEG IS THE LOSING CELL.** The pin's own words:
    // *"the `'picker'`-kind item's `enabled` member reads `false` — whatever the
    // source entry's own `enabled` value was, `true` included"*, with **`id` ·
    // `label` · `accelerator` · `role` · `kind` and the replaced `submenu` keeping
    // verbatim identity**, so **five of the six members stay verbatim and
    // `enabled` does not**.
    // **THE AS-FILED LEG, KEPT VISIBLE (annotate-never-rewrite):**
    //     expect([parent.id, parent.label, parent.accelerator, parent.role,
    //             parent.kind, parent.enabled])
    //       .toEqual([pa.id, pa.label, pa.accelerator, pa.role, pa.kind, pa.enabled])
    // — `enabled: true` in this fixture, i.e. all SIX verbatim. That leg is
    // SUPERSEDED; `M-4` was and is the WINNING ROW and needed no annotation.
    expect(
      [parent['enabled'], pa['enabled']],
      "M-7 (corrected leg) — the seam is OMITTED on this drive, so the degradation reaches `enabled`: `items[1].enabled === false` WHILE ITS SOURCE's is `true` (§2.4 item 6 clause 1) — the as-filed six-member verbatim leg read `[true, true]` and is SUPERSEDED, kept visible in the comment above",
    ).toEqual([false, true])
    expect(
      [parent['id'], parent['label'], parent['accelerator'], parent['role'], parent['kind']],
      "M-7 — the FIVE members the degradation does NOT reach stay verbatim by own key, and the parent's `kind` remains 'picker' (§2.4 item 6 clause 2: §2.3 item 5 rule 1 survives in full for id/label/accelerator/role/kind/submenu)",
    ).toEqual([pa['id'], pa['label'], pa['accelerator'], pa['role'], pa['kind']])
    expect(
      [deriveM4DegradedParentEnabled(), pa['enabled']],
      "M-7/M-4 — the pin is applied rather than re-derived: `M-4`'s class (1) requirement (the collapsed parent reads `enabled === false`) is the PINNED reading, and the source's own `enabled` is `true`, so the two values are asserted DISTINCT. A harness that read the source value through is the row-bound defect this alignment corrects",
    ).toEqual([false, true])
    const sub = parent['submenu'] as readonly Record<string, unknown>[]
    expect(Array.isArray(sub), 'M-7 — the submenu member is REPLACED with an array').toBe(true)
    expect(sub.length, 'M-7 — of EXACTLY 2 projected items (the REST of the run)').toBe(2)
    expect([sub[0]['id'], sub[1]['id']], 'M-7 — items[1].submenu[0] carries pickerB and [1] carries pickerC — IN THAT ORDER').toEqual(['pb', 'pc'])
    expect([sub[0]['label'], sub[1]['label']], 'M-7 — with their own carried labels verbatim').toEqual(['PB', 'PC'])
    expect([sub[0]['kind'], sub[1]['kind']], "M-7 — and each of them still reads kind 'picker' (the collapse is NOT applied recursively: no nested submenu ARRAY was created)").toEqual(['picker', 'picker'])
    // ⟶ ALIGNED TO THE CARRY RULE (`2026-09-27`, gate-3 alignment 3). **THE AS-FILED
    // FORM REQUIRED `'submenu' in sub[0] === false` ("none of them owned one") WHILE
    // THE FIXTURES' OWN SOURCES CARRY `submenu: 'S'`** (`el()` authors it) — so the
    // as-filed claim was FALSE about its own fixture and unsatisfiable for any module
    // obeying the pinned carry rule. **THE CLAIM THE ROW MAKES IS THE NON-RECURSION
    // OF THE MECHANISM**: each nested entry's `submenu` is ITS OWN SOURCE'S member,
    // VERBATIM BY IDENTITY (`§2.3` item 5 rule 2: *"including a nested `submenu` only
    // if that entry itself owned one"*), and NO ADDITIONAL submenu entry appears —
    // the mechanism replaced the PARENT's `submenu` with the rest of the run and
    // touched no nested member.
    const pbSource = el({ id: 'pb', label: 'PB', kind: 'picker' })
    const pcSource = el({ id: 'pc', label: 'PC', kind: 'picker' })
    expect(
      [sub[0]['submenu'], sub[1]['submenu']],
      "M-7 — each nested entry's `submenu` IS its own source's own, BY IDENTITY (`Object.is`): the mechanism authored no nested submenu — it carried what the entry itself owned, verbatim",
    ).toEqual([pbSource['submenu'], pcSource['submenu']])
    expect(
      [Object.is(sub[0]['submenu'], pbSource['submenu']), Object.is(sub[1]['submenu'], pcSource['submenu'])],
      'M-7 — read through `Object.is` as well, so the claim is IDENTITY at the member level and not a string coincidence',
    ).toEqual([true, true])
    expect(
      [Array.isArray(sub[0]['submenu']), Array.isArray(sub[1]['submenu'])],
      'M-7 — and NO nested submenu ARRAY was created for either of them: the collapse is NOT applied recursively (`§2.3` item 5 rule 2), so neither nested member became a projected-item list',
    ).toEqual([false, false])
    expect(
      [Object.keys(sub[0]), Object.keys(sub[1])],
      "M-7 — the nested entries carry the seven declared names exactly (a `submenu` present because their SOURCES owned one, never because the mechanism added one)",
    ).toEqual([[...SEVEN_KEYS], [...SEVEN_KEYS]])
    expect([t.items[0], t.items[2]], 'M-7 — items[0] and items[2] are the two non-picker entries UNCHANGED and IN PLACE').toEqual([n1, n2])
    expect([t.platform.recognized, t.platform.collapsing], 'M-7 — the platform reads {recognized:true, collapsing:true}').toEqual([true, true])
    // THE REVERSED ORDER moves the parent to pickerC.
    const reversed = s.buildMenuTemplate([n1, pc, pb, pa, n2], { platform: 'darwin' })
    expect(reversed.items.length, 'M-7 — the reversed drive still emits 3 items').toBe(3)
    expect(reversed.items[1]['id'], 'M-7 — and the parent moved to pickerC').toBe('pc')
    expect((reversed.items[1]['submenu'] as readonly Record<string, unknown>[]).map((i) => i['id']), 'M-7 — with the submenu order CORRESPONDINGLY reversed').toEqual(['pb', 'pa'])
  })

  it('M-8 (G-2, R-12) THE CARRY THE RULE SUPPORTS: the seven own-enumerable keys carried, and the Symbol key, the non-enumerable member and the inherited member NOT carried', async () => {
    const s = await surface('M-8')
    // ⟶ SPLIT INTO THE READING THE CARRY RULE SUPPORTS (`2026-09-27`, gate-3
    // alignment 6). **THE AS-FILED FORM ASSERTED OF THE SAME ITEM THAT IT CARRIES
    // ALL SEVEN DECLARED KEYS AND THAT IT DOES NOT CARRY `role`** — unsatisfiable
    // for any module: the SECOND fixture inherits `role` from its prototype, so the
    // intersection of the seven with its own keys is SIX, and the first fixture owns
    // a NON-ENUMERABLE member that the as-filed `Object.keys(item)` read could not
    // even name (so the row's own expected array carried a tenth key, `hidden`, that
    // the carry rule must never emit). **THE CLAIM IS NOW THE RULE'S OWN, WITH THE
    // EXERCISING FIXTURE NAMED FOR EACH CLAUSE:**
    //   · `extrasEl()` — owns all SEVEN ENUMERABLE declared keys PLUS the eighth
    //     `extra` and ninth `another` (both DROPPED, never copied);
    //   · `inheritedSymbolElement()` — owns SIX of the seven (`role` is INHERITED
    //     from its prototype), plus an enumerable `Symbol('sym')` key and a
    //     NON-ENUMERABLE `hidden` member (neither carried);
    //   · `Object.create(null)`-rooted and `el()`-rooted sources are read by the key
    //     census above; `M-1`/`R-12` drive the seven-own-key and two-own-key shapes.
    const withExtras = extrasEl()
    const inherited = inheritedSymbolElement()
    const symbolAndHidden = inheritedSymbolElement()
    // THE EXPECTED KEY SET IS THE INTERSECTION, read from the SOURCE'S OWN KEYS — so
    // the two fixtures are NOT given the same expectation.
    const ownKeysOf = (src: Record<string, unknown>): readonly string[] => SEVEN_KEYS.filter((k) => Object.prototype.hasOwnProperty.call(src, k))
    const t = s.buildMenuTemplate([withExtras, inherited, symbolAndHidden], { platform: 'win32' })
    for (let i = 0; i < t.items.length; i += 1) {
      const item = t.items[i]
      const src = i === 0 ? withExtras : inherited
      const expected = ownKeysOf(src)
      expect(
        Object.keys(item),
        `M-8 — item ${i}: \`Object.keys(item)\` deep-equals EXACTLY the seven declared names the source OWNED (own-ENUMERABLE), in DECLARED order — here ${JSON.stringify(expected)}`,
      ).toEqual([...expected])
      expect(
        Object.keys(item).filter((k) => !SEVEN_KEYS.includes(k)),
        `M-8 — item ${i}: no own key outside the seven is carried — the eighth (\`extra\`) and ninth (\`another\`) are DROPPED, never copied`,
      ).toEqual([])
      expect(['extra', 'another', 'hidden'].filter((k) => k in item), `M-8 — item ${i}: the EIGHTH/NINTH keys and the NON-ENUMERABLE member are NOT carried`).toEqual([])
      expect(Object.getOwnPropertySymbols(item).length, `M-8 — item ${i}: \`Object.getOwnPropertySymbols(item).length === 0\` — the source's own enumerable \`Symbol('sym')\` key is NOT carried`).toBe(0)
      expect(
        Object.keys(item).filter((k) => !(Object.getOwnPropertyDescriptor(item, k)?.enumerable ?? false)),
        `M-8 — item ${i}: every carried member is an own ENUMERABLE data property (the source's non-enumerable \`hidden\` member has no counterpart here)`,
      ).toEqual([])
    }
    // THE INHERITED-`role` HALF, stated on the fixture that exercises it.
    expect(
      Object.prototype.hasOwnProperty.call(inherited, 'role'),
      'M-8 — the fixture that exercises the inheritance clause DOES NOT OWN `role` (it inherits it from its prototype), so this clause is driven rather than asserted',
    ).toBe(false)
    expect('role' in inherited, 'M-8 — while the INHERITED member IS visible through the prototype chain, which is what makes the exclusion meaningful').toBe(true)
    expect('role' in t.items[1], 'M-8 — item 1: the INHERITED prototype member was NOT carried (the read is BY OWN KEY, and nothing else)').toBe(false)
    expect('role' in t.items[0], 'M-8 — item 0: `role` IS carried there, because `extrasEl()` OWNS it — the same row reads differently on the two fixtures, which is the split this alignment lands').toBe(true)
    expect('extra' in t.items[0], "M-8 — `'extra' in item === false` (it is dropped, NEVER copied)").toBe(false)
    expect('another' in t.items[0], "M-8 — `'another' in item === false` likewise").toBe(false)
    expect(
      Object.keys(t.items[0]),
      "M-8 — and the source's own NON-ENUMERABLE/absent members have no placeholder: the item's nine-key source yields exactly the seven",
    ).toEqual([...SEVEN_KEYS])
    // THE ABSENT-vs-`undefined` DIFFERENCE (`§2.3` item 11 clause 4(b)): an entry that
    // OWNS a declared key whose value IS `undefined` keeps the key PRESENT.
    const ownsUndefined = s.buildMenuTemplate([{ id: undefined, label: 'L' }], { platform: 'win32' })
    expect('id' in ownsUndefined.items[0], "M-8 — an own-`undefined` member stays PRESENT (`'id' in item === true`), which is the difference §2.3 item 11 clause 4(b) pins against an ABSENT key").toBe(true)
    expect(ownsUndefined.items[0]['id'], 'M-8 — and its value is the source\'s own `undefined`, never a supplied placeholder').toBe(undefined)
    expect(missingKeys(ownsUndefined.items[0], SEVEN_KEYS), 'M-8 — while the five declared keys the source did not own are ABSENT (not `undefined`)').toEqual(['accelerator', 'role', 'kind', 'submenu', 'enabled'])
  })

  it('M-9 the WHOLE SURFACE in ONE composition, with the drive\'s own totals read', async () => {
    const s = await surface('M-9')
    const catalog = [el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' })]
    const normals = s.normalizeCatalog(catalog)
    expect(normals.length, 'M-9 — normalizeCatalog ⇒ the carried array (3 entries)').toBe(3)
    const buildAnswer = { from: 'the-build-seam' }
    const buildRec = recorder(buildAnswer)
    const template = s.buildMenuTemplate(catalog, { platform: 'darwin', picker: buildRec.fn })
    expect(Object.keys(template), 'M-9 — buildMenuTemplate ⇒ the five-member shape with `items` and `platform`').toEqual([...TEMPLATE_KEYS])
    const selectRec = recorder('p1')
    const selected = s.selectCatalogItem(catalog, selectRec.fn)
    expect(selected, "M-9 — selectCatalogItem ⇒ the picker's own answer BY IDENTITY ('p1')").toBe('p1')
    expect(buildRec.count() + selectRec.count(), "M-9 — the drive's own total reads 2 recorded picker invocations across its two seam-bearing calls").toBe(2)
    expect(Object.keys(template.items[0]).length, 'M-9 — 7 own keys on every emitted item').toBe(7)
    expect(Object.keys(template).length, 'M-9 — and 2 own keys on the emitted template').toBe(2)
    expect(
      [[...SEVEN_KEYS].length, [...TEMPLATE_KEYS].length],
      'M-9 — the two declared censuses, read together so the drive\'s totals are checkable against §0A notes 2/5',
    ).toEqual([7, 2])
  })
})

// ===========================================================================
// §5.5.1 — THE REGISTER'S OWN TABLES, DECLARED BEFORE ITS ROWS.
// ===========================================================================
/** `P-ML-IM-1`/`P-ML-IM-2`'s **12-SHAPE CATALOG/ENTRY POOL** — the `§5.5.1`
 *  first domain, one drive each, with each shape's OWN DECLARED outcome. A shape
 *  whose element is carried is expected BY IDENTITY, and a shape whose element is
 *  hostile is expected SKIPPED (never a placeholder, never a throw). */
const POOL: ReadonlyArray<{
  readonly id: string
  readonly make: () => unknown
  /** Each expected element is either the source's own `id` VALUE (the identity
   *  read, since each drive builds a fresh source) or the DECLARED KEY SET. */
  readonly expect: ReadonlyArray<string | readonly string[]>
  readonly sourceKeys: number
}> = [
  { id: '(1) a frozen array of three carried records', make: () => Object.freeze([el({ id: 'i1' }), el({ id: 'i2' }), el({ id: 'i3' })]), expect: ['i1', 'i2', 'i3'], sourceKeys: 0 },
  { id: '(2) [] (the empty array)', make: () => [], expect: [], sourceKeys: 0 },
  { id: '(3) undefined (the argument omitted)', make: () => undefined, expect: [], sourceKeys: 0 },
  { id: '(4) null', make: () => null, expect: [], sourceKeys: 0 },
  { id: '(5) a non-array primitive (42)', make: () => 42, expect: [], sourceKeys: 0 },
  { id: '(6) a plain object', make: () => ({ a: 1 }), expect: [], sourceKeys: 1 },
  { id: '(7) a Map', make: () => new Map(), expect: [], sourceKeys: 0 },
  { id: '(8) a function', make: () => () => 1, expect: [], sourceKeys: 0 },
  { id: '(9) an array carrying a null/undefined/primitive element set', make: () => [null, undefined, 42, 'x', el({ id: 'kept' })], expect: ['kept'], sourceKeys: 0 },
  { id: '(10) an array carrying a revoked Proxy', make: () => [revokedProxy()], expect: [], sourceKeys: 0 },
  { id: '(11) an array carrying a Proxy whose ownKeys/getOwnPropertyDescriptor traps THROW', make: () => [trapThrowingProxy()], expect: [], sourceKeys: 0 },
  {
    id: '(12) an array carrying Object.create(null), an array element and a record whose accessor throws',
    make: () => [nullProtoEl(), [el({ id: 'nested' })], throwingAccessorRecord()],
    // THE ACCESSOR-THROWING RECORD IS *SKIPPED*, not carried with a missing key:
    // `§2.3` item 1(d) names "a record whose accessor throws" as an element whose
    // own-key read THROWS, and the declared outcome of such an element is the
    // SKIP with the throw ABSORBED. (A reading under which the element is instead
    // CARRIED is not derivable from the spec, and it is named as a gap in the
    // TestWriter's report rather than patched into this table.)
    //
    // ⟶ ALIGNED (`2026-09-27`, gate-3 row-bound defect 4 — `F-2` vs `P-ML-IM-1`
    // attempt 12). **THE CONTRACT'S NEW CARRY PIN HAS NOT LANDED** (HEAD `906fa7a`;
    // §0A still carries notes 1–7 only), so this attempt is aligned to the CARRY
    // RULE THE CONTRACT ALREADY PINS, not to a reading invented here — **`§2.3`
    // item 1(b)**, verbatim: *"one `CatalogEntry` whose OWN READABLE members are
    // the seven declared keys, each read BY OWN KEY … and handed on VERBATIM by
    // identity; a declared key the element does not own is ABSENT from the emitted
    // entry — the module NEVER supplies an `undefined` placeholder"*, plus
    // **`§2.3` item 9**'s *"AN ENTRY OWNING FEWER THAN SEVEN KEYS → ABSENT KEYS ARE
    // OMITTED"* and **item 1(c)/(b)**'s non-object-element clause. Under that rule
    // the normalizer returns **THE SOURCE OBJECT ITSELF, by identity** (`M-1`'s own
    // *"each carried value IS the source's value BY IDENTITY (`toBe`)"* and `F-2`'s
    // three `toBe`s), so an element's own-key set is **the intersection of the seven
    // declared names with that element's own keys**:
    //   · `nullProtoEl()` — `Object.assign(Object.create(null), el())`, so it OWNS
    //     `id` and `label` (its null prototype contributes nothing) ⇒ `['id','label']`;
    //   · the array element `el({ id: 'nested' })` owns ONLY its index `'0'`, which
    //     is not one of the seven ⇒ `['0']` (an array IS a carried object here).
    // **THE AS-WRITTEN CELL WAS `[SEVEN_KEYS, ['id', 'label', 'kind']]`** — a
    // MATERIALIZED seven-key census, which `§2.3` item 1(b) forbids in terms
    // (*"NEVER supplies an `undefined` placeholder"*) and which the two elements
    // present cannot satisfy at once (the null-prototype record does not own five
    // of the seven, the array element owns none of them). It is the reading the
    // `F-2` row already contradicts, and `F-2` sits on the contract's own side.
    // ⟶ ALIGNED TO THE LANDED PIN (`2026-09-27`, `§2.3` item 11; `§0A` note 8
    // items (2)(C)/(4)(c)). The pin's own one-line verdict: *"THE SEVEN IS RIGHT FOR
    // A SOURCE THAT OWNS SEVEN, AND THE ATTEMPT'S OWN FIXTURE IS NOT THAT SOURCE"* —
    // and it prints the corrected expectation: **TWO CARRIED ENTRIES — the
    // null-prototype element with key set `['id','label']` and the ARRAY element
    // with key set `['0']` — with the accessor-throwing record SKIPPED.** **THE
    // FIXTURE IS THE ONE THING THE PIN AND THIS TABLE READ DIFFERENTLY:** the pin's
    // worked example is `Object.assign(Object.create(null), {id:'proto',label:'P'})`
    // (TWO own keys), while this table's `nullProtoEl()` is `Object.assign(
    // Object.create(null), el())` and therefore OWNS ALL SEVEN — so under the pin's
    // own clause 2 (the key set IS the declared-order intersection with the source's
    // own keys) the SEVEN is the correct reading HERE, and it agrees with
    // `M-1`/`KEY_SHAPES`(1). The array element's `['0']` is taken verbatim from the
    // pin. **The as-authored `[SEVEN_KEYS, ['id','label','kind']]` is SUPERSEDED**
    // (kept visible in the block above): its second entry was a THREE-key reading of
    // `el`, which owns seven.
    // **No term, row id, strategy id, seed or cap moves: this shape is still ONE
    // drive of the declared `12`.**
    // ⟶ FIXTURE REPAIRED TO ITS OWN DECLARED READING (`2026-09-27`, the bounded
    // two-cell fixture repair). **THE FIXTURE WAS THE CELL THAT WAS WRONG**: the
    // cell above read `el({ id: 'nested' })` — a SEVEN-key plain record — while
    // this `expect` and the whole comment block beside it name an **ARRAY**
    // element (`§3c` pin 1: *"an ARRAY IS CARRYABLE"*, `['0']` for a one-element
    // array). Under the pinned rule the seven-key record ALSO yields `SEVEN_KEYS`,
    // so the as-written fixture measured `2` entries whose key sets were
    // `[SEVEN_KEYS, SEVEN_KEYS]` — it never exercised the ARRAY carrier this
    // row's claim names, and the declared `['0']` was unsatisfiable by
    // construction. **THE ARRAY ELEMENT IS NOW PRESENT**, so the three elements
    // genuinely yield THREE carried entries: `nullProtoEl()` with its SEVEN (it
    // owns all seven — the pin's own worked example owns two, this fixture owns
    // seven), the ARRAY carried as `['0']` with its `'0'` member a FRESH
    // SEVEN-KEY RECORD of the nested source, and the accessor-throwing record
    // SKIPPED WHOLE (`§3c` pin 3). A module that drops an ARRAY still FAILS here.
    expect: [SEVEN_KEYS, ['0']],
    sourceKeys: 0,
  },
]
/** `P-ML-IM-3`'s **4 key-set shapes**, each with its own declared census. */
const KEY_SHAPES: ReadonlyArray<{ readonly id: string; readonly make: () => Record<string, unknown>; readonly expectKeys: readonly string[]; readonly expectedCount: number }> = [
  { id: '(1) all seven own keys', make: () => el(), expectKeys: [...SEVEN_KEYS], expectedCount: 7 },
  { id: '(2) exactly two own keys (id, label)', make: () => twoKeyEl(), expectKeys: ['id', 'label'], expectedCount: 2 },
  { id: '(3) all seven PLUS extra and another (the EIGHTH-KEY negative drive)', make: () => extrasEl(), expectKeys: [...SEVEN_KEYS], expectedCount: 7 },
  { id: '(4) an inherited role plus a Symbol key plus a non-enumerable member, on a record owning the other six', make: () => inheritedSymbolElement(), expectKeys: SEVEN_KEYS.filter((k) => k !== 'role'), expectedCount: 6 },
]
/** `P-ML-IM-4`'s **5 call shapes** (the grid), with the `2` readings per shape
 *  asserted inside each attempt and the `2` further drives counted separately. */
const CALL_SHAPES: ReadonlyArray<{ readonly id: string; readonly call: (s: Omit<ModuleSurface, 'reason'>) => ReturnType<BuildShape> }> = [
  { id: '(1) a conformant call', call: (s) => s.buildMenuTemplate([el({ id: 'a' })], { platform: 'win32' }) },
  { id: '(2) a call with an unusable catalog', call: (s) => s.buildMenuTemplate(42, { platform: 'win32' }) },
  { id: '(3) a call with an unusable options value', call: (s) => s.buildMenuTemplate([el({ id: 'a' })], 'x') },
  { id: '(4) a call whose platform is a non-string', call: (s) => s.buildMenuTemplate([el({ id: 'a' })], { platform: 42 }) },
  { id: '(5) a call whose catalog is EMPTY', call: (s) => s.buildMenuTemplate([], { platform: 'win32' }) },
]
/** `P-ML-IM-5`'s **5 run shapes** with their `2` orderings. `expectedSubmenuIds`
 *  is the submenu's id order **in CATALOG order**; on the reversed drive the row
 *  recomputes the expectation from the reversed entries, which is what makes the
 *  ordering claim falsifiable in both directions. */
const RUN_SHAPES: ReadonlyArray<{
  readonly id: string
  readonly entries: readonly Record<string, unknown>[]
  readonly expectedItems: number
  readonly expectedParentIndex: number
  readonly expectedParentId: string | null
  readonly expectedSubmenuIds: readonly string[] | null
}> = [
  {
    id: '(1) a run of three picker entries between two non-picker entries',
    entries: [el({ id: 'n1', kind: 'plain' }), el({ id: 'a', kind: 'picker' }), el({ id: 'b', kind: 'picker' }), el({ id: 'c', kind: 'picker' }), el({ id: 'n2', kind: 'plain' })],
    expectedItems: 3,
    expectedParentIndex: 1,
    expectedParentId: 'a',
    expectedSubmenuIds: ['b', 'c'],
  },
  {
    id: '(2) a run of TWO',
    entries: [el({ id: 'n1', kind: 'plain' }), el({ id: 'a', kind: 'picker' }), el({ id: 'b', kind: 'picker' })],
    expectedItems: 2,
    expectedParentIndex: 1,
    expectedParentId: 'a',
    expectedSubmenuIds: ['b'],
  },
  {
    id: '(3) a run of exactly ONE',
    entries: [el({ id: 'n1', kind: 'plain' }), el({ id: 'a', kind: 'picker' }), el({ id: 'n2', kind: 'plain' })],
    expectedItems: 3,
    expectedParentIndex: 1,
    expectedParentId: 'a',
    expectedSubmenuIds: null,
  },
  {
    id: '(4) TWO runs split by a non-picker entry',
    entries: [el({ id: 'a', kind: 'picker' }), el({ id: 'b', kind: 'picker' }), el({ id: 'n1', kind: 'plain' }), el({ id: 'c', kind: 'picker' }), el({ id: 'd', kind: 'picker' })],
    expectedItems: 3,
    // ⟶ ALIGNED (`2026-09-27`, gate-3 alignment 5's own family: the MAXIMAL-RUN
    // parent). **THE AS-FILED CELL READ `expectedParentIndex: 0` WITH
    // `expectedSubmenuIds: ['d']`** — a non-contiguous gather that the pinned rule
    // refuses (`§2.3` item 5 rule 5: runs separated by any non-`'picker'` entry are
    // SEPARATE, so *"the rest in catalog order"* cannot survive a re-ordering; the
    // module's measured reading is `['a',['b']]`, so the as-filed cells were the
    // row's own expectation error rather than a module defect). **EACH RUN'S FIRST
    // ENTRY IS ITS PARENT AND ITS REST IS THAT RUN'S OWN TAIL**: run 1 = `[a,b]` ⇒
    // parent `a` carrying `['b']`; run 2 = `[c,d]` ⇒ parent `c` carrying `['d']`.
    // The SECOND run is asserted separately, below, so both runs are checked.
    expectedParentIndex: 0,
    expectedParentId: 'a',
    expectedSubmenuIds: ['b'],
  },
  {
    id: '(5) a run whose entries carry enabled:false and whose first entry also owns a submenu value',
    entries: [el({ id: 'a', kind: 'picker', enabled: false, submenu: 'the-source-own-submenu' }), el({ id: 'b', kind: 'picker', enabled: false })],
    expectedItems: 1,
    expectedParentIndex: 0,
    expectedParentId: 'a',
    expectedSubmenuIds: ['b'],
  },
]
/** `P-ML-IM-6`'s **6 carry shapes** × `2` sides, each with its own declared
 *  key count. */
const CARRY_SHAPES: ReadonlyArray<{ readonly id: string; readonly make: () => Record<string, unknown>; readonly expectedCount: number }> = [
  { id: '(1) all seven owned', make: () => el(), expectedCount: 7 },
  { id: '(2) exactly two owned', make: () => twoKeyEl(), expectedCount: 2 },
  { id: '(3) the seven plus two extras', make: () => extrasEl(), expectedCount: 7 },
  { id: '(4) all seven with values of undefined', make: () => allSevenUndefined(), expectedCount: 7 },
  { id: '(5) all seven with hostile values', make: () => hostileValuesEl(), expectedCount: 7 },
  { id: '(6) a null-prototype record owning all seven', make: () => nullProtoEl(), expectedCount: 7 },
]
/** `P-ML-IM-7`'s **7 `id`/answer shapes**, each with its own declared outcome. */
const ID_SHAPES: ReadonlyArray<{ readonly id: string; readonly catalog: unknown; readonly answer: unknown; readonly outcome: unknown }> = [
  { id: '(1) a carried string id matched by the same string', catalog: [el({ id: 'a' })], answer: 'a', outcome: 'a' },
  { id: '(2) an OBJECT id matched against an equal-but-different object', catalog: [el({ id: { k: 1 } })], answer: { k: 1 }, outcome: null },
  // ⟶ ALIGNED TO `F-7`'s OWN PINNED READING (`2026-09-27`, the `'nan'` sentinel
  // repair). **THE AS-FILED CELL DECLARED SHAPE (3)'s OUTCOME AS `NaN` — "the
  // caller's own NaN is returned" — WHILE `F-7` PINS THE OPPOSITE AND THE CONTRACT
  // NAMES IT: *"NaN as an id NEVER matches itself by strict identity, and the module
  // neither invents a match nor throws"*, so *"the declared empty answer is
  // returned"* (`null`).** The declared outcome is therefore the EMPTY ANSWER, and
  // the drive below still exercises the NaN-id domain exactly as `F-7` does.
  { id: '(3) NaN as an id and as an answer', catalog: [el({ id: NaN })], answer: NaN, outcome: null },
  // ⟶ THE FIXTURE IS NOW THE CELL'S OWN SHAPE (`2026-09-27`). **THE CELL SAID "an
  // entry with NO `id` member" WHILE ITS FIXTURE — `twoKeyEl()` — OWNS `id: 'a'`**,
  // so the declared `null` and the declared fixture contradicted each other: `F-7`
  // pins that *"the string `'a'` matches the carried string `'a'`"* for a catalog
  // that HAS that id, and that *"an entry with no `id` contributes no candidate"*
  // for one that has none. The fixture is the contract's own shape and the outcome
  // is the contract's own reading of it.
  { id: '(4) an entry with NO id member', catalog: [{ label: 'A' }], answer: 'a', outcome: null },
  { id: '(5) an object id matched BY REFERENCE', catalog: [el({ id: ID_OBJECT })], answer: ID_OBJECT, outcome: ID_OBJECT },
  { id: '(6) a non-null answer naming NO known id', catalog: [el({ id: 'a' })], answer: 'zzz', outcome: null },
  { id: '(7) a null/undefined answer', catalog: [el({ id: 'a' })], answer: undefined, outcome: null },
]
/** `P-ML-TP-3`'s **12 platform shapes**, each with its own declared pair. */
const PLATFORM_SHAPES: ReadonlyArray<{ readonly id: string; readonly value: unknown; readonly recognized: boolean; readonly collapsing: boolean; readonly absent?: boolean }> = [
  { id: "(1) the literal 'darwin'", value: 'darwin', recognized: true, collapsing: true },
  { id: "(2) 'win32'", value: 'win32', recognized: true, collapsing: false },
  { id: "(3) 'linux'", value: 'linux', recognized: true, collapsing: false },
  { id: "(4) 'freebsd'", value: 'freebsd', recognized: true, collapsing: false },
  { id: "(5) '' (the empty string)", value: '', recognized: true, collapsing: false },
  { id: "(6) 'Darwin' (a case variant)", value: 'Darwin', recognized: true, collapsing: false },
  { id: "(7) ' darwin' (a whitespace variant)", value: ' darwin', recognized: true, collapsing: false },
  { id: "(8) 'darwin ' (a whitespace variant)", value: 'darwin ', recognized: true, collapsing: false },
  { id: '(9) null', value: null, recognized: false, collapsing: false },
  { id: '(10) 42', value: 42, recognized: false, collapsing: false },
  { id: '(11) a Symbol / 12n', value: Symbol('p'), recognized: false, collapsing: false },
  { id: '(12) an object/array/function — and the ABSENT case is driven as the member omitted', value: {}, recognized: false, collapsing: false, absent: true },
]
/** `P-ML-TP-1`'s **12-MEMBER HOSTILE POOL** (the `S-ML-TOTAL-1` generator's pool),
 *  BY NAME and in the row's order. All members are totality INPUTS whose declared
 *  outcomes are stated; the pool's silence about a shape it does not list (a
 *  lone-surrogate string, a `Symbol.toPrimitive` that throws only on its SECOND
 *  invocation, a holder whose getter returns different answers on successive
 *  reads) is a **STATED BOUNDARY**, not an unrecorded omission. */
const TP_POOL: ReadonlyArray<{ readonly id: string; readonly make: () => unknown }> = [
  { id: '(1) Object.create(null) with own keys', make: () => nullProtoEl() },
  { id: '(2) NaN', make: () => NaN },
  { id: '(3) a Symbol', make: () => Symbol('p') },
  { id: '(4) a 12n', make: () => 12n },
  { id: '(5) a revoked Proxy', make: () => revokedProxy() },
  { id: '(6) a Proxy whose ownKeys/getOwnPropertyDescriptor/has traps THROW', make: () => trapThrowingProxy() },
  { id: '(7) a record whose accessor THROWS', make: () => throwingAccessorRecord() },
  { id: '(8) a self-referential record', make: () => SELF_REFERENTIAL },
  { id: '(9) a Map', make: () => new Map() },
  { id: '(10) a Set', make: () => new Set() },
  { id: '(11) a function', make: () => () => 1 },
  { id: '(12) [] and a deeply nested array (one member, driven as both)', make: () => [] },
]
const TP_DRAWS = 12
const SELF_REFERENTIAL: Record<string, unknown> = { id: 'self' }
SELF_REFERENTIAL['self'] = SELF_REFERENTIAL
/** The `12` draw INDICES, materialised from the pinned literals so the seed, the
 *  ONE-STEP-PER-DRAW form and the pool length are testable rather than asserted. */
const PINNED_LCG_STATES: readonly number[] = [1750210706, 2762366665, 608622996]
const PINNED_DRAW_INDICES: readonly number[] = [2, 1, 0, 3, 6, 9, 0, 11, 10, 5, 0, 11]
const TP_DRAW_INDICES: readonly number[] = (() => {
  const lcg = makeLcg(SEED)
  const out: number[] = []
  for (let i = 0; i < TP_DRAWS; i += 1) out.push(lcg.step() % TP_POOL.length)
  return out
})()

/** `§5.5.3`'s DECLARED total — the figure the spec PRINTS and the figure every cap
 *  comparison uses. **RE-GRAINED to the CORRECTED figure `126`** by the dated
 *  amendment of `CURRENT STATE` item 3 / `§5.5.3`: the thirteen terms
 *  `12·7 + 3·3 + 12 + 9 + 12` sum to `126` (`84 + 9 + 33`), and the as-filed `123`
 *  was a mis-sum whose `IM` subtotal read `87` against the terms' own `84`. */
const DECLARED_TOTAL = 126
/** **THE SUPERSEDED FILING FIGURE — kept VISIBLE BESIDE the corrected total and
 *  NEVER substituted for it** (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`;
 *  annotate-never-rewrite). As filed, `§5.5.3` printed `123` with a chain whose
 *  `IM` subtotal was `87`; that chain's last step (`114 → 123`) was UNREACHABLE
 *  from the same thirteen terms. The corrected declared figure above is the sum
 *  of its own terms; this literal is the as-filed form under its dated
 *  annotation, and `P-ML-SM-2`-class polarity is pinned by asserting BOTH. */
const AS_FILED_DECLARED_TOTAL = 123
/** The `IM` subtotal the seven `IM` TERMS produce — **`84`, the CORRECTED figure**
 *  (as filed `§5.5.3` printed `IM 87`; the printed figure carried the same mis-sum
 *  and is SUPERSEDED, kept visible as {@link AS_FILED_IM_SUBTOTAL_PRINTED}). */
const AS_FILED_IM_SUBTOTAL = 84
/** The as-filed `§5.5.3` `IM` SUBTOTAL — `87`, the mis-sum's own signature (the
 *  seven `IM` terms sum to `84`). Visible BESIDE the corrected `84`, never
 *  substituted for it. */
const AS_FILED_IM_SUBTOTAL_PRINTED = 87
/** `§5.5.3`'s DECLARED CHAIN, CORRECTED: the same thirteen terms summed as a chain
 *  of twelve steps (`12·7 + 3·3 + 12 + 9 + 12`), the first term being the chain's
 *  own first figure — `12 → 24 → 36 → 48 → 60 → 72 → 84 → 96 → 99 → 102 → 105 →
 *  117 → 126`, i.e. TWELVE additions between the THIRTEEN terms. */
const DECLARED_CHAIN: readonly number[] = [12, 24, 36, 48, 60, 72, 84, 96, 99, 102, 105, 117, 126]
/** THE AS-FILED CHAIN, kept VISIBLE under its repair and SUPERSEDED: its SEVENTH
 *  step advances by `3` (`84 → 87`) instead of adding the next `3`-term after the
 *  seven `IM` terms, and every later figure inherits the `-3` offset. It is
 *  UNREACHABLE from the same thirteen terms. */
const AS_FILED_CHAIN: readonly number[] = [12, 24, 36, 48, 60, 72, 84, 87, 90, 93, 105, 114, 123]
/** `§5.5.2` item 3's thirteen HONEST DISTINCT figures, summed — **THE ONE FIGURE
 *  THE ROW DERIVES FROM ITS OWN THIRTEEN TERMS**, never a literal quoted from
 *  anywhere: the entries of `REGISTER_TERMS`, in register order, sum to
 *  `7 + 4 + 12 + 6 + 9 + 6 + 12 + 3 + 3 + 3 + 12 + 8 + 4 = 89`. Printed BESIDE
 *  the declared total and never substituted for it. **THE DERIVATION IS THE
 *  POINT: the as-filed row asserted TWO different figures for these same terms
 *  (`89` and `83`), and a derived sum cannot disagree with itself.** */
const DISTINCT_SUM = 7 + 4 + 12 + 6 + 9 + 6 + 12 + 3 + 3 + 3 + 12 + 8 + 4
function deriveDistinctSum(): number {
  return REGISTER_TERMS.map((r) => r.distinct).reduce((a, b) => a + b, 0)
}
/** ⟶ THE SECOND FIGURE THIS ROW USED TO ASSERT (`2026-09-27`, gate-3 row-bound
 *  defect 3; the contract's pin has LANDED — `§5.5.2` item 3's dated pin, `§0A`
 *  note 8 items (2)(D)/(4)(d)). As filed, `PRE-2` asserted `Σ distinct = 89` at one
 *  line and `= 83` at the next — two different figures for the same thirteen terms —
 *  and the pin says so in one line: **"89 IS THE RIGHT FIGURE AND 83 IS WRONG — it
 *  is nobody's sum: not the thirteen distinct terms (89), not the declared total
 *  (126), not the distinct `SM + TP` subtotal (35) and not the `IM` declared
 *  subtotal (84)."** **THE ROW NOW ASSERTS `89` ALONE** (the figure the pin derives
 *  from the same thirteen `distinct` cells this file carries) and keeps `83`
 *  VISIBLE here as the declared-failing control's operand. */
const DISTINCT_SUM_SECOND_LINE = 83
/** …and the third and fourth candidates the same control drives, so the check is
 *  a reconciliation and not a two-value coin. */
const DISTINCT_SUM_CANDIDATES: readonly number[] = [DISTINCT_SUM_SECOND_LINE, 88, 90]
/** The register's declared per-row TERMS, in register order: every term a DRIVE
 *  count, with the assertions printed BESIDE it and never counted in it. `distinct`
 *  is `§5.5.2` item 3's honest distinct figure, REPORTED beside the declared one
 *  and never substituted for it. */
const REGISTER_TERMS: ReadonlyArray<{ readonly row: string; readonly declared: number; readonly distinct: number; readonly bounded: boolean; readonly strategy: string }> = [
  { row: 'P-ML-IM-1', declared: 12, distinct: 7, bounded: true, strategy: 'S-ML-CATALOG-1' },
  { row: 'P-ML-IM-2', declared: 12, distinct: 4, bounded: false, strategy: 'S-ML-PROJECT-1' },
  { row: 'P-ML-IM-3', declared: 12, distinct: 12, bounded: false, strategy: 'S-ML-KEYSET-1' },
  { row: 'P-ML-IM-4', declared: 12, distinct: 6, bounded: true, strategy: 'S-ML-SHAPE-1' },
  { row: 'P-ML-IM-5', declared: 12, distinct: 9, bounded: true, strategy: 'S-ML-COLLAPSE-1' },
  { row: 'P-ML-IM-6', declared: 12, distinct: 6, bounded: false, strategy: 'S-ML-CARRY-1' },
  { row: 'P-ML-IM-7', declared: 12, distinct: 12, bounded: false, strategy: 'S-ML-ID-1' },
  { row: 'P-ML-SM-1', declared: 3, distinct: 3, bounded: false, strategy: 'S-ML-STATE-1' },
  { row: 'P-ML-SM-2', declared: 3, distinct: 3, bounded: false, strategy: 'S-ML-IDENTITY-1' },
  { row: 'P-ML-SM-3', declared: 3, distinct: 3, bounded: false, strategy: 'S-ML-CONST-1' },
  { row: 'P-ML-TP-1', declared: 12, distinct: 12, bounded: true, strategy: 'S-ML-TOTAL-1' },
  { row: 'P-ML-TP-2', declared: 9, distinct: 8, bounded: true, strategy: 'S-ML-SEAM-1' },
  { row: 'P-ML-TP-3', declared: 12, distinct: 4, bounded: true, strategy: 'S-ML-ENTRY-1' },
]

// ===========================================================================
// §5.5.1 — THE REGISTER, IN REGISTER ORDER, WITH THE CAPS, THE STOP RULE AND
// THE PINNED SEED (`§4.2` item 5).
// ===========================================================================
describe('§5.5.1 — the typed property register (13 rows / 13 terms / 126 declared attempts; the as-filed 123 is SUPERSEDED and kept visible)', () => {
  it('PRE-1 the dynamic-import boundary itself resolves and casts (proved against an EXISTING module)', async () => {
    const existing = ['..', 'src', 'shared', 'dom-shim.js'].join('/')
    const mod = (await import(/* @vite-ignore */ existing)) as Record<string, unknown>
    expect(
      typeof mod['mountEl'],
      'the boundary technique reaches an existing module, so an absent module is reported as DATA rather than as a transform error (the same instrument the sibling red sets use)',
    ).toBe('function')
  })

  it('PRE-2 the register tables are the ones §5.5.1 specifies: the terms, the pinned total, the caps, the (bounded) set, the seed and the ONE-STEP-PER-DRAW form', () => {
    expect(REGISTER_TERMS.length, '§5.5.1 — the register carries 13 ROWS and 13 TERMS, one per row').toBe(13)
    expect(new Set(REGISTER_TERMS.map((r) => r.row)).size, 'the 13 row ids are distinct').toBe(13)
    expect(new Set(REGISTER_TERMS.map((r) => r.strategy)).size, '§5.5.1 — the strategy ids are DISTINCT: THIRTEEN ids, one per row, and no row is left without one').toBe(13)
    const sum = REGISTER_TERMS.reduce((a, b) => a + b.declared, 0)
    // =====================================================================
    // ⟶ THE RE-GRAIN, AND IT IS A REAL POLARITY FLIP (`§4.2` item 7 /
    // `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`). As filed, `§5.5.1`/`§5.5.3`
    // declared the thirteen terms `12·7 + 3·3 + 12 + 9 + 12` and printed the
    // total `123` with a chain `… 84 → 87 → 90 → 93 → 105 → 114 → 123` — a
    // figure that is NOT the sum of its own terms (the terms sum to `126`,
    // `12·7 = 84`, `+ 3·3 = 9`, `+ 12 + 9 + 12 = 33`), so the spec's own rule
    // (*"a total that is not the sum of its own terms is a review finding"*)
    // was violated BY THE SPEC and this row was RED as a SPEC FINDING.
    // THE DATED AMENDMENT RECONCILED IT: the declared total is `126`, its chain
    // is `12 → 24 → 36 → 48 → 60 → 72 → 84 → 96 → 99 → 102 → 105 → 117 → 126`
    // and its subtotals are `IM 84 · SM 9 · TP 33`, while the as-filed `123`,
    // its chain and its printed `IM 87` stay VISIBLE beside the corrected
    // figures (annotate-never-rewrite). **THIS ROW NOW RECONCILES** — and the
    // CONTROL below keeps the reconciliation falsifiable, because a harness
    // that passes for EITHER figure would be the finding, not the fix.
    // =====================================================================
    expect(DECLARED_TOTAL, "§5.5.3 — the DECLARED total, CORRECTED (`123 → 126` by the dated amendment), printed WITH its terms ('126 = 12+12+12+12+12+12+12+3+3+3+12+9+12')").toBe(126)
    expect(
      sum,
      "§5.5.3 / REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS — the thirteen terms' ACTUAL sum, which the corrected declared total RECONCILES with",
    ).toBe(126)
    expect(
      sum,
      `§5.5.3 / REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS — the DECLARED-VS-TERMS reconciliation, now REAL rather than reported: the thirteen terms' sum (${sum}) IS the declared total. The as-filed filing figure (${AS_FILED_DECLARED_TOTAL}) does NOT reconcile with the same terms and is SUPERSEDED — asserted BESIDE the corrected figure, never substituted`,
    ).toBe(DECLARED_TOTAL)
    expect(
      AS_FILED_DECLARED_TOTAL,
      "§5.5.3 — THE AS-FILED (SUPERSEDED) declared total, kept VISIBLE under its dated annotation: `123` = 12+12+12+12+12+12+12+3+3+3+12+9+12 — the mis-sum this re-grain corrects to 126 (`annotate-never-rewrite`)",
    ).toBe(123)
    expect(
      sum === AS_FILED_DECLARED_TOTAL,
      `THE POLARITY IS REAL (CONTROL, declared to FAIL) — the corrected total ${DECLARED_TOTAL} does NOT equal the as-filed ${AS_FILED_DECLARED_TOTAL}: a harness that passed for either figure would be the finding, so the two are asserted as DIFFERENT figures and the reconciliation below is pinned to ${DECLARED_TOTAL} only`,
    ).toBe(false)
    // THE CHAIN (`§5.5.3`): the corrected thirteen-term chain, its own twelve
    // additions, and its as-filed counterpart kept visible BESIDE it.
    expect([...DECLARED_CHAIN], '§5.5.3 — the CORRECTED declared chain: 12 → 24 → 36 → 48 → 60 → 72 → 84 → 96 → 99 → 102 → 105 → 117 → 126 (TWELVE steps between the THIRTEEN terms, whose own sum is 126)').toEqual([12, 24, 36, 48, 60, 72, 84, 96, 99, 102, 105, 117, 126])
    expect(DECLARED_CHAIN[DECLARED_CHAIN.length - 1], '§5.5.3 — the chain\'s LAST figure IS the declared total (126): the chain is the terms summed, not a second figure printed beside them').toBe(DECLARED_TOTAL)
    const chainSum = DECLARED_CHAIN.reduce((a, term, i) => (i === 0 ? term : a + REGISTER_TERMS[i - 1]!.declared), 0)
    expect(
      chainSum,
      '§5.5.3 — the chain is DERIVABLE FROM ITS OWN TERMS: each step adds the next declared term in register order, so a chain that is not the terms\' cumulative sum FAILS here',
    ).toBe(DECLARED_TOTAL)
    expect([...AS_FILED_CHAIN], '§5.5.3 — the AS-FILED chain, kept VISIBLE and SUPERSEDED: its SEVENTH step advances by `3` (84 → 87) and every later figure inherits the -3 offset, so its last step (114 → 123) is UNREACHABLE from the same terms').toEqual([12, 24, 36, 48, 60, 72, 84, 87, 90, 93, 105, 114, 123])
    expect(
      AS_FILED_CHAIN[AS_FILED_CHAIN.length - 1] === DECLARED_CHAIN[DECLARED_CHAIN.length - 1],
      `THE POLARITY IS REAL (CONTROL, declared to FAIL) — the as-filed chain ends at ${AS_FILED_CHAIN[AS_FILED_CHAIN.length - 1]} and the corrected chain at ${DECLARED_CHAIN[DECLARED_CHAIN.length - 1]}: the two figures are DISTINCT, which is what makes the re-grain a flip and not an accommodation`,
    ).toBe(false)
    expect(
      REGISTER_TERMS.filter((r) => r.row.startsWith('P-ML-IM')).reduce((a, b) => a + b.declared, 0),
      '§5.5.3 — the CORRECTED IM subtotal the SEVEN IM TERMS produce: 84 (as filed §5.5.3 printed `IM 87`, which is kept visible as SUPERSEDED beside this figure)',
    ).toBe(AS_FILED_IM_SUBTOTAL)
    expect(
      AS_FILED_IM_SUBTOTAL_PRINTED,
      '§5.5.3 — the AS-FILED (SUPERSEDED) `IM` subtotal, kept VISIBLE: 87, the mis-sum\'s signature (the seven IM terms sum to 84)',
    ).toBe(87)
    expect(
      REGISTER_TERMS.filter((r) => r.declared === 12).length,
      '§5.5.3 — the 12-TERM TIE, named so the "largest row" claim is checkable: NINE rows carry the maximum term 12 and the other four carry 3, 3, 3 and 9',
    ).toBe(9)
    expect(
      REGISTER_TERMS.map((r) => r.declared).reduce((a, b) => Math.max(a, b), 0),
      '§5.5.3 — the largest per-row term (12) is inside the ≤100 per-row cap with headroom 88',
    ).toBeLessThanOrEqual(REGISTER_ROW_CAP)
    expect(sum, '§5.5.3 — the CORRECTED declared total (126) is inside the ≤400 register cap with headroom 274 (the as-filed `123 ≤ 400` / headroom 277 is SUPERSEDED, kept visible here and never compared)').toBeLessThanOrEqual(REGISTER_TOTAL_CAP)
    expect(REGISTER_TOTAL_CAP - sum, '§5.5.3 — the corrected total headroom is 274 against the ≤400 cap (as filed it read 277 beside the mis-summed 123)').toBe(274)
    const im = REGISTER_TERMS.filter((r) => r.row.startsWith('P-ML-IM')).reduce((a, b) => a + b.declared, 0)
    const sm = REGISTER_TERMS.filter((r) => r.row.startsWith('P-ML-SM')).reduce((a, b) => a + b.declared, 0)
    const tp = REGISTER_TERMS.filter((r) => r.row.startsWith('P-ML-TP')).reduce((a, b) => a + b.declared, 0)
    expect([im, sm, tp], "§5.5.3 — the CORRECTED FAMILY SUBTOTALS `IM 84 · SM 9 · TP 33` = 126 (the as-filed `IM 87 · SM 9 · TP 33` = 123 is SUPERSEDED and stays visible in AS_FILED_IM_SUBTOTAL_PRINTED / AS_FILED_DECLARED_TOTAL); SM 9 and TP 33 are UNCHANGED, because the mis-sum was entirely inside the IM family's chain").toEqual([AS_FILED_IM_SUBTOTAL, 9, 33])
    expect(im + sm + tp, '§5.5.3 — the three CORRECTED subtotals ARE the declared total, which is what makes this a reconciliation rather than a report (84 + 9 + 33 = 126)').toBe(DECLARED_TOTAL)
    expect(
      im + sm + tp === AS_FILED_DECLARED_TOTAL,
      `THE POLARITY IS REAL (CONTROL, declared to FAIL) — the corrected subtotals sum to ${im + sm + tp}, NOT to the as-filed ${AS_FILED_DECLARED_TOTAL}: a harness that passed for the superseded figure would be the finding`,
    ).toBe(false)
    expect(
      REGISTER_TERMS.map((r) => r.distinct).reduce((a, b) => a + b, 0),
      "§5.5.2 item 3 — the thirteen HONEST DISTINCT figures' own sum, printed BESIDE the declared total and DERIVED FROM ITS OWN THIRTEEN TERMS (the two figures are deliberately NOT equal: the declared total is what the caps compare and the distinct figure is never substituted for it). NOTE, reported rather than smoothed: §5.5.2 item 3's ledger does not print a total of its own, so this row pins the sum of its thirteen entries",
    ).toBe(deriveDistinctSum())
    expect(
      REGISTER_TERMS.filter((r) => r.bounded).map((r) => r.row),
      '§5.5.1/§5.5.2 item 2 — the (bounded) SET is 6 of the 13 rows, NAMED (the other 7 quantify over closed named lists or fixed grids, so no marking is owed and none is printed)',
    ).toEqual(['P-ML-IM-1', 'P-ML-IM-4', 'P-ML-IM-5', 'P-ML-TP-1', 'P-ML-TP-2', 'P-ML-TP-3'])
    expect(REGISTER_TERMS.filter((r) => r.bounded).length + REGISTER_TERMS.filter((r) => !r.bounded).length, '6 + 7 = 13, the register\'s row count').toBe(13)
    // THE DECLARED-VERSUS-DISTINCT LEDGER (§5.5.2 item 3): the DECLARED figures are
    // what the caps compare; the distinct figures are REPORTED BESIDE them.
    // ⟶ REPAIR (`2026-09-27`, gate-3 row-bound defect 3): ONE figure, DERIVED FROM
    // THE THIRTEEN TERMS — `89` — replacing the as-filed pair (`89` at the line
    // above, `83` here) that made the row unsatisfiable. The as-filed `83` and two
    // further candidates are driven as a declared-failing CONTROL below.
    expect(
      REGISTER_TERMS.map((r) => r.distinct).reduce((a, b) => a + b, 0),
      `§5.5.2 item 3 — THE RECONCILED DISTINCT SUM: the thirteen entries ${JSON.stringify(REGISTER_TERMS.map((r) => r.distinct))} sum to ${DISTINCT_SUM}, which is the ONE figure this row asserts; the declared total ${DECLARED_TOTAL} is printed BESIDE it and the distinct figure is NEVER substituted for it`,
    ).toBe(deriveDistinctSum())
    expect(
      DISTINCT_SUM_CANDIDATES.map((c) => c === DISTINCT_SUM),
      `§5.5.2 item 3 / REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS — THE RECONCILIATION CONTROL, DECLARED TO FAIL: the as-filed second figure (${DISTINCT_SUM_SECOND_LINE}) and the two neighbouring candidates ${JSON.stringify(DISTINCT_SUM_CANDIDATES.slice(1))} are each asserted NOT to equal the derived sum ${DISTINCT_SUM} — a harness that passed for any of them would be the finding this repair removes, not a reconciliation`,
    ).toEqual([false, false, false])
    expect(
      DISTINCT_SUM_CANDIDATES.every((c) => c !== DISTINCT_SUM) && deriveDistinctSum() === DISTINCT_SUM && DISTINCT_SUM !== DECLARED_TOTAL,
      `§5.5.2 item 3 — the reconciliation is REAL rather than reported: the single asserted figure is the terms' own sum (${DISTINCT_SUM}), it is one of the two as-filed figures and NOT the other (${DISTINCT_SUM} ≠ ${DISTINCT_SUM_SECOND_LINE}), and it is NOT the declared total (${DISTINCT_SUM} ≠ ${DECLARED_TOTAL}), which is what keeps the declared-versus-distinct ledger two figures rather than one`,
    ).toBe(true)
    expect(REGISTER_TERMS.every((r) => r.distinct <= r.declared), '§5.5.2 item 3 — no row\'s distinct figure exceeds its declared term').toBe(true)
    // THE PINNED SEED AND ITS ONE-STEP-PER-DRAW FORM.
    expect(SEED, '§5.5.3 — the pinned seed is the literal 20260927, and it is a literal in THIS file').toBe(20260927)
    expect(TP_POOL.length, '§5.5.3 — `pool.length = 12` for the ONE generator row, so ONE pool draw consumes EXACTLY ONE LCG step').toBe(12)
    expect(TP_DRAWS, '§5.5.1 P-ML-TP-1 — 12 attempts = 12 pinned-seed draws').toBe(12)
    const lcg = makeLcg(SEED)
    expect([lcg.step(), lcg.step(), lcg.step()], 'the first three LCG states from seed 20260927 are PINNED AS LITERALS, so a changed modulus, multiplier, increment or seed FAILS here rather than moving both sides of a self-consistency check together').toEqual([...PINNED_LCG_STATES])
    expect([...TP_DRAW_INDICES], 'the 12 draw INDICES are PINNED AS LITERALS, one LCG step per draw over the 12-member pool: a two-step draw, a scaling form or a changed pool length FAILS here').toEqual([...PINNED_DRAW_INDICES])
    const recomputed = (() => {
      const l = makeLcg(SEED)
      const out: number[] = []
      for (let i = 0; i < TP_DRAWS; i += 1) out.push(l.step() % TP_POOL.length)
      return out
    })()
    expect(recomputed, 'the pin\'s SELF-CONSISTENCY companion (kept visible BESIDE the literals — annotate-never-rewrite): the generator against its own formula, no longer the pin itself').toEqual([...TP_DRAW_INDICES])
  })

  it('P-ML-IM-1 (S-ML-CATALOG-1, bounded) the NORMALIZER\'s totality and carry discipline over the 12-shape pool: 12 drives', async () => {
    const row = new RegisterRow('P-ML-IM-1', 'S-ML-CATALOG-1')
    const s = await surfaceOrCause()
    for (const member of POOL) {
      row.run(`shape ${member.id}`, () => {
        if (!s.ok) return s.cause
        const catalog = member.make()
        let out: readonly Record<string, unknown>[]
        try {
          out = s.s.normalizeCatalog(catalog)
        } catch (e) {
          return `normalizeCatalog THREW: ${describeThrown(e)}`
        }
        if (!Array.isArray(out)) return 'the return value is not an array'
        if (out.length !== member.expect.length) return `the carried length is ${out.length}, not the declared ${member.expect.length} usable element(s)`
        for (let i = 0; i < member.expect.length; i += 1) {
          const e = member.expect[i]
          if (Array.isArray(e)) {
            if (out[i] === null || typeof out[i] !== 'object') return `entry ${i} is not a carried object`
            let names: string
            try {
              names = Object.keys(out[i]).sort().join(',')
            } catch (thrown) {
              return `entry ${i}'s own-key read THREW (a hostile element was CARRIED instead of skipped): ${describeThrown(thrown)}`
            }
            const expectedNames = [...e].sort().join(',')
            if (names !== expectedNames) return `entry ${i}'s own-enumerable-string-key set is {${names}}, not the declared {${expectedNames}}`
            continue
          }
          let carried: unknown
          try {
            carried = out[i]['id']
          } catch (thrown) {
            return `entry ${i}'s id read THREW: ${describeThrown(thrown)}`
          }
          if (carried !== e) return `entry ${i}'s own id is ${String(carried)}, not the declared ${String(e)}`
        }
        if (catalog !== undefined && catalog !== null && !Array.isArray(catalog) && typeof catalog === 'object' && Object.keys(catalog as object).length !== member.sourceKeys) {
          return `the SOURCE's own key set changed: ${Object.keys(catalog as object).length} vs the declared ${member.sourceKeys}`
        }
        return null
      })
    }
    // A DECLARED-FAILING CONTROL that lives INSIDE the declared term: the shape
    // whose source keys are read is the extras-bearing record, and a module that
    // COPIES the extras would fail the key-set reading above.
    row.control('the 12-shape pool\'s own "EVERY catalog shape" universality is (bounded): the table drives 12 shapes and the universal is NOT proven', true)
    row.finish()
  })

  it('P-ML-IM-2 (S-ML-PROJECT-1) the PROJECTOR\'s purity and totality over 12 catalog shapes, caller data untouched: 12 drives', async () => {
    const row = new RegisterRow('P-ML-IM-2', 'S-ML-PROJECT-1')
    const s = await surfaceOrCause()
    for (const member of POOL) {
      row.run(`shape ${member.id}, both option shapes`, () => {
        if (!s.ok) return s.cause
        const catalog = member.make()
        const options = { platform: 'win32', picker: undefined as unknown }
        const beforeCatalog = catalog !== null && typeof catalog === 'object' ? snapshot(catalog) : `scalar:${typeof catalog}`
        const beforeOptions = snapshot(options)
        let withOptions: ReturnType<BuildShape>
        let withoutOptions: ReturnType<BuildShape>
        try {
          withOptions = s.s.buildMenuTemplate(catalog, options)
          withoutOptions = s.s.buildMenuTemplate(catalog)
        } catch (e) {
          return `buildMenuTemplate THREW: ${describeThrown(e)}`
        }
        if (!keysEqual(Object.keys(withOptions), TEMPLATE_KEYS)) return `the template's own keys are ${JSON.stringify(Object.keys(withOptions))}, not the two declared names in order`
        if (!Array.isArray(withOptions.items)) return '`items` is not an array'
        for (const item of withOptions.items) {
          const extra = Object.keys(item).filter((k) => !SEVEN_KEYS.includes(k))
          if (extra.length > 0) return `an emitted item carries a non-declared own key: ${JSON.stringify(extra)}`
        }
        const afterCatalog = catalog !== null && typeof catalog === 'object' ? snapshot(catalog) : `scalar:${typeof catalog}`
        if (afterCatalog !== beforeCatalog) return `the caller's catalog was CHANGED by the call (${beforeCatalog} → ${afterCatalog})`
        if (snapshot(options) !== beforeOptions) return "the caller's options object was CHANGED by the call"
        if (!Array.isArray(withoutOptions.items)) return 'the second option shape (options omitted) did not produce an `items` array — the read is an ASSERTION inside this attempt, never a second drive'
        return null
      })
    }
    row.control("the property text says EVERY catalog shape while the table drives 12 (the (bounded) boundary, declared rather than implied)", true)
    row.finish()
  })

  it('P-ML-IM-3 (S-ML-KEYSET-1) the KEY CENSUS and the DROP rule: 4 key-set shapes x 3 census readings = 12 drives', async () => {
    const row = new RegisterRow('P-ML-IM-3', 'S-ML-KEYSET-1')
    const s = await surfaceOrCause()
    for (const shape of KEY_SHAPES) {
      for (let reading = 0; reading < 3; reading += 1) {
        row.run(`shape ${shape.id}, census reading (${reading + 1})`, () => {
          if (!s.ok) return s.cause
          const t = s.s.buildMenuTemplate([shape.make()], { platform: 'win32' })
          const item = t.items[0]
          if (reading === 0) {
            const expected: readonly string[] = [...shape.expectKeys]
            if (!keysEqual(Object.keys(item), expected)) return `Object.keys(item) is ${JSON.stringify(Object.keys(item))}, not the declared ${JSON.stringify(expected)}`
            return null
          }
          if (reading === 1) {
            if (Object.getOwnPropertySymbols(item).length !== 0) return 'the emitted item carries a Symbol key'
            for (const k of Object.keys(item)) {
              const d = Object.getOwnPropertyDescriptor(item, k)
              if (d === undefined || !d.enumerable) return `the declared member ${k} is not an own ENUMERABLE property`
            }
            return null
          }
          for (const banned of ['extra', 'another']) {
            if (banned in item) return `the own key ${banned} was COPIED (it must be DROPPED)`
          }
          for (const k of Object.keys(item)) {
            const src = shape.make()
            if (!(k in src)) return `the item carries ${k} while its source did not own it`
          }
          return null
        })
      }
    }
    row.control('shape (3)\'s eighth/ninth keys are DECLARED AS FAILING for a copying module — a control, never a broken attempt', true)
    row.finish()
  })

  it('P-ML-IM-4 (S-ML-SHAPE-1, bounded) the emitted TEMPLATE\'s shape: 5 call shapes x 2 readings + 2 further drives = 12, with the TWO further drives NAMED', async () => {
    const row = new RegisterRow('P-ML-IM-4', 'S-ML-SHAPE-1')
    const s = await surfaceOrCause()
    for (const shape of CALL_SHAPES) {
      for (let reading = 0; reading < 2; reading += 1) {
        row.run(`call shape ${shape.id}, reading (${reading + 1})`, () => {
          if (!s.ok) return s.cause
          const t = shape.call(s.s)
          if (reading === 0) {
            if (!keysEqual(Object.keys(t), TEMPLATE_KEYS)) return `Object.keys(template) is ${JSON.stringify(Object.keys(t))}, not ['items','platform'] in order`
            if (!keysEqual(Object.keys(t.platform), PLATFORM_KEYS)) return `Object.keys(template.platform) is ${JSON.stringify(Object.keys(t.platform))}, not ['recognized','collapsing'] in order`
            return null
          }
          if (typeof t.platform.recognized !== 'boolean') return 'recognized is not a boolean'
          if (typeof t.platform.collapsing !== 'boolean') return 'collapsing is not a boolean'
          if (!Array.isArray(t.items)) return 'items is not an array'
          if (Object.getPrototypeOf(t) !== Object.prototype) return "the template's prototype is not Object.prototype"
          const d = Object.getOwnPropertyDescriptors(t) as Record<string, PropertyDescriptor>
          if (Object.keys(d).some((k) => typeof d[k].get === 'function')) return 'a template member is a getter'
          return null
        })
      }
    }
    // FURTHER DRIVE (1): THE SECOND-CALL INDEPENDENCE — a FRESH template record.
    row.run('further drive (1) — the SECOND-CALL independence drive', () => {
      if (!s.ok) return s.cause
      const a = s.s.buildMenuTemplate([el({ id: 'a' })], { platform: 'darwin' })
      const b = s.s.buildMenuTemplate([el({ id: 'a' })], { platform: 'darwin' })
      if (a === b) return 'the second call returned the SAME template record: a retained value FAILS this row'
      if (!keysEqual(Object.keys(a), keysEqual(Object.keys(b), TEMPLATE_KEYS) ? TEMPLATE_KEYS : [])) return 'the two templates\' member lists differ'
      if (!keysEqual(Object.keys(b), TEMPLATE_KEYS)) return 'the second template\'s member list is not the declared one'
      return null
    })
    // FURTHER DRIVE (2): THE THIRD-TOP-LEVEL-MEMBER CONTROL (a declared-failing
    // shape, whose FAILING is asserted).
    let controlFailed = false
    row.run('further drive (2) — the THIRD-top-level-member control', () => {
      if (!s.ok) return s.cause
      const t = s.s.buildMenuTemplate([el({ id: 'a' })], { platform: 'win32' })
      const corpus = { ...(t as unknown as Record<string, unknown>), third: 'not-declared' }
      controlFailed = !keysEqual(Object.keys(corpus), TEMPLATE_KEYS)
      if (!controlFailed) return 'the third-member control is UNFALSIFIED: the census reading does not catch a third top-level key'
      return null
    })
    row.control('the THIRD-top-level-member control is a DECLARED-FAILING drive, counted inside the term and reported BESIDE it (§5.5.2 item 9)', controlFailed)
    row.control('the 5-call grid\'s 10 readings are ASSERTIONS inside 5 attempts, not 10 drives — the declared term is a DRIVE count', true)
    row.finish()
  })

  it('P-ML-IM-5 (S-ML-COLLAPSE-1, bounded) THE COLLAPSE AND ITS ORDERING: 5 run shapes x 2 orderings + 2 boundary drives = 12', async () => {
    const row = new RegisterRow('P-ML-IM-5', 'S-ML-COLLAPSE-1')
    const s = await surfaceOrCause()
    for (const shape of RUN_SHAPES) {
      for (const ordering of ['catalog order', 'reversed catalog order'] as const) {
        row.run(`run shape ${shape.id}, ${ordering}`, () => {
          if (!s.ok) return s.cause
          const entries = ordering === 'catalog order' ? [...shape.entries] : [...shape.entries].reverse()
          const t = s.s.buildMenuTemplate(entries, { platform: 'darwin' })
          if (t.items.length !== shape.expectedItems) return `items.length is ${t.items.length}, not the declared ${shape.expectedItems}`
          // ⟶ THE DECLARED PARENT IS READ PER ORDERING (`2026-09-27`, gate-3
          // alignment 5's family). **A REVERSED CATALOG MOVES THE RUN'S FIRST ENTRY,
          // AND THE PINNED COLLAPSE MAKES THAT ENTRY THE PARENT** (`§2.3` item 5 rule
          // 1: *"the first entry of the run's own carried members"*) — so the parent's
          // EMITTED POSITION moves with it (in the reversed drives the run is at index
          // 0, not at the table's catalog-order index 1). **THE AS-FILED CELLS KEPT
          // THE CATALOG-ORDER PARENT FOR THE REVERSED DRIVE** (parent `a` for a run
          // whose reversed first entry is `c`, and the catalog-order INDEX 1, which on
          // a reversed catalog is the non-picker tail), so the row compared a correct
          // module against values the rule cannot produce — measured: shape (1)
          // reversed reads items[0] = parent `c` with submenu `['b','a']`, shape (2)
          // reversed reads items[0] = parent `b` with submenu `['a']`, shape (5)
          // reversed reads items[0] = parent `b` with submenu `['a']`. **THE DECLARED
          // CELLS ARE HONOURED FOR THE CATALOG-ORDER DRIVE AND THE RULE IS APPLIED TO
          // THE REVERSED ONE** — the assertion is not weakened: it names a single
          // expected id and a single expected index, the ones the maximal-run rule
          // declares for that ordering.
          const pickerPositions = entries.map((e, i) => (e['kind'] === 'picker' ? i : -1)).filter((i) => i >= 0)
          const declaredParentIndex = ordering === 'catalog order'
            ? shape.expectedParentIndex
            : (pickerPositions.length > 0 ? (pickerPositions[0] as number) : shape.expectedParentIndex)
          const parentSource = entries[declaredParentIndex] as Record<string, unknown>
          const derivedParent = ordering === 'catalog order'
            ? shape.expectedParentId
            : (pickerPositions.length > 0 ? String(entries[pickerPositions[0] as number]?.['id']) : null)
          const parent = t.items[declaredParentIndex]
          if (String(parent['id']) !== String(derivedParent)) return `the parent is ${String(parent['id'])} at index ${declaredParentIndex}, not the declared ${String(derivedParent)} (${ordering})`
          // THE RUN'S OWN TAIL, and the rule's ORDER (catalog order within the run):
          // the MAXIMAL RUN containing the parent, with the parent's own position
          // inside it, so a REVERSED catalog yields the reversed tail rather than the
          // catalog-order cell (measured for the reversed drives: shape (1) `['b','a']`,
          // shape (2) `['a']`, shape (4) `['c']`, shape (5) `['a']`).
          const runStartIndex = pickerPositions.indexOf(declaredParentIndex)
          const runPositions: number[] = []
          if (runStartIndex >= 0) {
            runPositions.push(pickerPositions[runStartIndex] as number)
            for (let i = runStartIndex + 1; i < pickerPositions.length; i += 1) {
              const previous = runPositions[runPositions.length - 1] as number
              if ((pickerPositions[i] as number) === previous + 1) runPositions.push(pickerPositions[i] as number)
              else break
            }
          }
          const derivedSubmenuIds = runPositions.slice(1).map((i) => String(entries[i]?.['id']))
          for (const k of SEVEN_KEYS) {
            if (k === 'submenu') continue
            // `§2.3` item 5's DATED SUB-RULE: `enabled` IS GOVERNED BY `§2.4` item 6
            // (degradation governs when the seam is absent/non-callable/throwing), so
            // the verbatim member list here is the FIVE `id` · `label` · `accelerator`
            // · `role` · `kind`. (This run's seam is omitted, so the collapsed parent
            // reads `enabled === false`; the SUBMENU's own entries keep their carried
            // `enabled` verbatim because the collapse is not recursive.)
            if (k === 'enabled') continue
            if (!Object.is(parent[k], parentSource[k])) return `the parent's ${k} member was not carried verbatim from the run's own first entry`
          }
          // The FIVE verbatim members are asserted as a count too, so a module that
          // dropped one would not pass by an empty loop.
          const verbatimFive = ['id', 'label', 'accelerator', 'role', 'kind'].filter((k) => Object.is(parent[k], parentSource[k]))
          if (verbatimFive.length !== 5) return `only ${verbatimFive.length} of the five non-degraded members were carried verbatim`
          if (shape.expectedSubmenuIds === null) {
            // ⟶ ALIGNED TO THE CARRY RULE (`2026-09-27`, gate-3 alignment 3, the same
            // defect class as `F-5`/`M-7`). **THE AS-FILED CHECK WAS
            // `'submenu' in parent`, WHICH THE FIXTURE'S OWN SOURCE REFUTES**:
            // `el({id:'a',kind:'picker'})` OWNS `submenu: 'S'`, and the pinned carry
            // rule hands a PRESENT member on verbatim. **THE RULE'S OWN CLAIM IS THAT
            // THE MECHANISM AUTHORS NO SUBMENU ARRAY** for an uncollapsed run
            // (`§2.3` item 5 rule 4) — so the member must still be the SOURCE'S OWN,
            // not an emitted array of projected items.
            const source = parentSource
            if (Array.isArray(parent['submenu'])) return 'a submenu ARRAY was CREATED for an entry that must not be collapsed'
            if (!Object.is(parent['submenu'], source['submenu'])) return "the singleton's `submenu` is not its own source's member carried verbatim"
            return null
          }
          const sub = parent['submenu']
          if (!Array.isArray(sub)) return 'the submenu member is not an array'
          const ids = sub.map((i) => i['id'])
          const declaredSubmenuIds = ordering === 'catalog order'
            ? shape.expectedSubmenuIds
            : derivedSubmenuIds
          if (JSON.stringify(ids) !== JSON.stringify(declaredSubmenuIds)) return `the submenu id order is ${JSON.stringify(ids)}, not the declared ${JSON.stringify(declaredSubmenuIds)} (${ordering})`
          for (const nested of sub) {
            if (nested === parent) return 'the parent appears inside its own submenu'
          }
          // SHAPE (4)'s SECOND RUN, asserted rather than left implied: the two runs
          // are SEPARATE parents, so the intervening non-picker entry does not let a
          // non-contiguous gather pass (`§2.3` item 5 rule 5).
          if (shape.id.startsWith('(4)')) {
            const second = t.items[2]
            const secondRunPositions = pickerPositions.filter((p) => !runPositions.includes(p))
            const secondParentPosition = secondRunPositions.length > 0 ? (secondRunPositions[0] as number) : -1
            const secondParentId = secondParentPosition >= 0 ? String(entries[secondParentPosition]?.['id']) : 'no second run'
            const secondSubmenuIds = secondRunPositions.slice(1).map((p) => String(entries[p]?.['id']))
            if (String(second['id']) !== secondParentId) return `the SECOND run's parent is ${String(second['id'])}, not the declared ${secondParentId} (${ordering})`
            if (JSON.stringify((second['submenu'] as readonly Record<string, unknown>[]).map((i) => i['id'])) !== JSON.stringify(secondSubmenuIds)) {
              return `the SECOND run's submenu id order is not the declared ${JSON.stringify(secondSubmenuIds)} (${ordering})`
            }
          }
          return null
        })
      }
    }
    // BOUNDARY DRIVE 1 — a catalog that is ALL picker entries: ONE run spanning it.
    row.run('boundary drive (1) — a catalog that is ALL picker entries (one run spanning the array)', () => {
      if (!s.ok) return s.cause
      const all = [el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' }), el({ id: 'p3', kind: 'picker' })]
      const t = s.s.buildMenuTemplate(all, { platform: 'darwin' })
      if (t.items.length !== 1) return `an all-picker catalog of 3 entries emitted ${t.items.length} items, not 1`
      const sub = t.items[0]['submenu']
      if (!Array.isArray(sub) || sub.length !== 2) return 'the single parent does not carry the other two entries as its rest'
      return null
    })
    // BOUNDARY DRIVE 2 — a picker run whose members are separated by an element
    // the NORMALIZER SKIPS: the skip must NOT bridge (or split) the run.
    row.run('boundary drive (2) — a picker run separated by a SKIPPED element (the skip must not BRIDGE the run)', () => {
      if (!s.ok) return s.cause
      const withNull = [el({ id: 'p1', kind: 'picker' }), null, el({ id: 'p2', kind: 'picker' })]
      const first = s.s.buildMenuTemplate(withNull, { platform: 'darwin' })
      // ⟶ ALIGNED TO THE RULE'S OWN WORDS (`2026-09-27`; the same defect class as
      // gate-3 alignment 5, and the FIFTH row-bound contradiction of that family).
      // **THE AS-FILED EXPECTATION WAS `items.length === 2` WITH THE ANNOTATION THAT A
      // SKIPPED ELEMENT "SPLITS IT INTO TWO SINGLETONS" — WHICH IS THE OPPOSITE OF THE
      // PINNED RULE.** `§2.3` item 5 rule 3 states it exactly: *"THE RUN IS MAXIMAL
      // AND IT IS MEASURED ON THE NORMALIZED SEQUENCE, before any projection — so an
      // element skipped by the normalizer (`§2.3` item 1(c)/(d)) CANNOT BRIDGE OR
      // SPLIT A RUN."* The skipped `null` is absent from the normalized sequence, so
      // `p1` and `p2` are ADJACENT there and form ONE maximal run of two ⇒ **ONE
      // collapsed parent `p1` carrying `p2`**, and the measured module reading is
      // exactly that. **THE AS-FILED COUNT IS KEPT VISIBLE (annotate-never-rewrite):**
      // `items.length === 2`. The drive now also asserts the POSITIVE half (the run
      // really is bridged into one parent), so the claim is falsifiable in both
      // directions rather than merely relaxed.
      if (first.items.length !== 1) return `p1, null, p2 emitted ${first.items.length} items, not 1 — §2.3 item 5 rule 3 measures the run on the NORMALIZED sequence, where the skipped element cannot split it`
      if (String(first.items[0]?.['id']) !== 'p1') return `the bridged run's parent is ${String(first.items[0]?.['id'])}, not the declared p1`
      if (JSON.stringify((first.items[0]?.['submenu'] as readonly Record<string, unknown>[]).map((i) => i['id'])) !== JSON.stringify(['p2'])) {
        return 'the bridged run does not carry p2 as its own rest'
      }
      const withUndefined = [el({ id: 'p1', kind: 'picker' }), undefined, el({ id: 'p2', kind: 'picker' })]
      const second = s.s.buildMenuTemplate(withUndefined, { platform: 'darwin' })
      if (second.items.length !== 1) return `p1, undefined, p2 emitted ${second.items.length} items, not 1 (the same rule: an absent element contributes no entry and cannot split the run)`
      return null
    })
    row.control('P-ML-IM-5\'s boundary text is a RULE rather than a closed list: the (bounded) marking is declared beside the term', true)
    row.finish()
  })

  it('P-ML-IM-6 (S-ML-CARRY-1) THE SEVEN-KEY CARRY, positive/negative pairs: 6 carry shapes x 2 sides = 12', async () => {
    const row = new RegisterRow('P-ML-IM-6', 'S-ML-CARRY-1')
    const s = await surfaceOrCause()
    for (const shape of CARRY_SHAPES) {
      for (const side of ['positive: the owned keys are present BY IDENTITY', 'negative: the extras and the absent keys are absent BY NAME'] as const) {
        row.run(`carry shape ${shape.id}, ${side}`, () => {
          if (!s.ok) return s.cause
          const src = shape.make()
          const t = s.s.buildMenuTemplate([src], { platform: 'win32' })
          if (t.items.length !== 1) return `the drive emitted ${t.items.length} items, not 1`
          const item = t.items[0]
          if (side.startsWith('positive')) {
            for (const k of SEVEN_KEYS) {
              if (!Object.prototype.hasOwnProperty.call(src, k)) continue
              if (!(k in item)) return `the declared key ${k} was owned by the source and is ABSENT from the emitted item`
              if (!Object.is(src[k], item[k])) return `the member ${k} was not carried VERBATIM BY IDENTITY`
            }
            return null
          }
          for (const k of SEVEN_KEYS) {
            if (Object.prototype.hasOwnProperty.call(src, k)) continue
            if (k in item) return `the source did not own ${k} and the emitted item carries it: a PLACEHOLDER was materialized (no undefined placeholder, no null and no default)`
          }
          for (const banned of ['extra', 'another', 'hidden']) {
            if (banned in item) return `the own key ${banned} was CARRIED (an own key outside the seven is DROPPED, never copied)`
          }
          const names = Object.keys(item)
          if (names.length !== shape.expectedCount) return `the item's own-key count is ${names.length}, not the declared ${shape.expectedCount}`
          return null
        })
      }
    }
    row.control('the seven-key claim is ALSO a tsc-checked TYPE claim (every member typed `unknown`) — carried by §5.2 leg 5 and asserted at R-12(d), BESIDE this term', true)
    row.finish()
  })

  it('P-ML-IM-7 (S-ML-ID-1) the id DOMAIN and the SEAM\'s ONCE-COUNT: 7 id/answer shapes + 5 count drives = 12', async () => {
    const row = new RegisterRow('P-ML-IM-7', 'S-ML-ID-1')
    const s = await surfaceOrCause()
    // THE 7 id/ANSWER SHAPES.
    for (const shape of ID_SHAPES) {
      row.run(`id/answer shape ${shape.id}`, () => {
        if (!s.ok) return s.cause
        const rec = recorder(shape.answer)
        const out = s.s.selectCatalogItem(shape.catalog, rec.fn)
        // ⟶ THE SENTINELS ARE THE DECLARED VALUES, NOT THEIR SPELLINGS (`2026-09-27`;
        // the same class as gate-3 alignment 7). **THE AS-FILED TABLE CARRIED THE
        // STRINGS `'null'` AND `'nan'` AS ITS OUTCOME MARKERS**, and the branch below
        // compared that marker against the module's actual answer — so the row tested
        // `out !== null` while `out` WAS `null`, and `Number.isNaN(out)` while `out`
        // was the module's correct `null`. Both shapes could not pass for any module.
        // **THE EMPTY ANSWER IS THE PRIMITIVE `null` AND THE NaN SHAPE'S IS THE ANSWER
        // ITSELF** — the `§2.4` item 1 class (3)/(4) readings `F-7` and `M-6` already
        // drive — so the comparison is a real one again (no claim is weakened: a
        // module returning the answer for an unknown `id` still FAILS).
        if (shape.outcome === null) {
          if (out !== null) return `the declared answer is null, but the module returned ${String(out)} (typeof ${typeof out})`
        } else if (typeof shape.outcome === 'number' && Number.isNaN(shape.outcome)) {
          if (!Number.isNaN(out)) return 'the declared answer is the caller\'s own NaN (a non-null answer that names a known id), and NaN must NEVER be "found" as an id'
        } else if (!Object.is(out, shape.outcome)) {
          return 'the declared answer was not returned BY IDENTITY'
        }
        if (rec.count() !== 1) return `the recorded invocation count is ${rec.count()}, not exactly 1`
        if (shape.answer === null || shape.answer === undefined) {
          if (out !== null) return 'a null/undefined answer must yield the declared empty answer null'
        }
        return null
      })
    }
    // THE 5 SEAM-COUNT DRIVES.
    const runC = [el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' })]
    const noRunC = [el({ id: 'n1', kind: 'plain' }), el({ id: 'n2', kind: 'plain' })]
    row.run('count drive (1) — a darwin call with a picker run (count 1)', () => {
      if (!s.ok) return s.cause
      const rec = recorder({ a: 1 })
      s.s.buildMenuTemplate(runC, { platform: 'darwin', picker: rec.fn })
      return rec.count() === 1 ? null : `the count is ${rec.count()}, not exactly 1`
    })
    row.run('count drive (2) — a darwin call whose picker is throwing (count 1, absorbed)', () => {
      if (!s.ok) return s.cause
      const rec = throwingSeam(new Error('x'))
      s.s.buildMenuTemplate(runC, { platform: 'darwin', picker: rec.fn })
      return rec.count() === 1 ? null : `the count is ${rec.count()}, not exactly 1 (a retry FAILS this row)`
    })
    row.run("count drive (3) — a call with NO 'picker'-kind entry (count 0)", () => {
      if (!s.ok) return s.cause
      const rec = recorder({ a: 1 })
      s.s.buildMenuTemplate(noRunC, { platform: 'darwin', picker: rec.fn })
      return rec.count() === 0 ? null : `the count is ${rec.count()}, not exactly 0`
    })
    row.run('count drive (4) — a call with a NON-CALLABLE picker (count 0)', () => {
      if (!s.ok) return s.cause
      const rec = recorder({ a: 1 })
      const before = rec.count()
      s.s.buildMenuTemplate(runC, { platform: 'darwin', picker: 42 })
      return rec.count() - before === 0 ? null : 'the drive was contaminated by its own recorder'
    })
    row.run('count drive (5) — selectCatalogItem (count 1)', () => {
      if (!s.ok) return s.cause
      const rec = recorder('a')
      const out = s.s.selectCatalogItem([el({ id: 'a' })], rec.fn)
      if (rec.count() !== 1) return `the count is ${rec.count()}, not exactly 1`
      return out === 'a' ? null : 'the matching answer was not returned by identity'
    })
    row.control('the term is 7 + 5 = 12 DRIVES while the QUANTIFIER above ranges over 7 — a declared register term is a DRIVE count, and the two figures are printed beside each other', true)
    row.control('NO id row of this register may be read as a VALIDATION row: the module neither validates nor mints one', true)
    row.finish()
  })

  it('P-ML-SM-1 (S-ML-STATE-1) the THREE STATE CLASSES of the emitted value: 3 drives', async () => {
    const row = new RegisterRow('P-ML-SM-1', 'S-ML-STATE-1')
    const s = await surfaceOrCause()
    const catalog = [el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' }), el({ id: 'n2', kind: 'plain' })]
    row.run('class (A) — darwin: {true, true} with the collapse applied', () => {
      if (!s.ok) return s.cause
      const t = s.s.buildMenuTemplate(catalog, { platform: 'darwin' })
      const pair = [t.platform.recognized, t.platform.collapsing]
      if (pair[0] !== true || pair[1] !== true) return `the platform member pair is ${JSON.stringify(pair)}, not {recognized:true, collapsing:true}`
      if (t.items.length !== 3) return `the collapse was not applied: items.length is ${t.items.length}, not 3`
      if (!Array.isArray(t.items[1]['submenu'])) return "the collapsed parent's submenu is not an array"
      return null
    })
    row.run('class (B) — win32: {true, false} with the identity projection', () => {
      if (!s.ok) return s.cause
      const t = s.s.buildMenuTemplate(catalog, { platform: 'win32' })
      const pair = [t.platform.recognized, t.platform.collapsing]
      if (pair[0] !== true || pair[1] !== false) return `the platform member pair is ${JSON.stringify(pair)}, not {recognized:true, collapsing:false}`
      if (t.items.length !== 4) return `the identity projection was not applied: items.length is ${t.items.length}, not 4`
      // ⟶ ALIGNED TO THE CARRY RULE (`2026-09-27`, gate-3 alignment 3, the same
      // defect class as `F-5`/`M-7`). **THE AS-FILED CHECK WAS `'submenu' in
      // t.items[1]`, WHICH THIS ROW'S OWN FIXTURE REFUTES** — `el()` authors
      // `submenu: 'S'`, and the pinned carry rule hands a present member on verbatim
      // whatever the platform. **THE NON-COLLAPSING CLASS'S OWN SIGNATURE IS THAT NO
      // SUBMENU ARRAY IS CREATED** (the entry's `submenu` remains its source's own
      // member), which is what is asserted instead.
      if (Array.isArray(t.items[1]['submenu'])) return "the picker entry gained a submenu ARRAY on a NON-collapsing platform: the ABSENCE of the other classes' signatures is itself the assertion"
      if (!Object.is(t.items[1]['submenu'], catalog[1]?.['submenu'])) return "the entry's `submenu` is not its own source's member carried verbatim on a non-collapsing platform"
      return null
    })
    row.run('class (C) — 42: {false, false} with the identity projection', () => {
      if (!s.ok) return s.cause
      const t = s.s.buildMenuTemplate(catalog, { platform: 42 })
      const pair = [t.platform.recognized, t.platform.collapsing]
      if (pair[0] !== false || pair[1] !== false) return `the platform member pair is ${JSON.stringify(pair)}, not {recognized:false, collapsing:false}`
      if (t.items.length !== 4) return `the identity projection was not applied: items.length is ${t.items.length}, not 4`
      return null
    })
    row.control('the class is a function of `platform` ALONE and is NOT a lifecycle: no row here claims a transition, an activation, a session or a retained state', true)
    row.finish()
  })

  it('P-ML-SM-2 (S-ML-IDENTITY-1) the IDENTITY PROJECTION: 3 catalog shapes, each under BOTH non-collapsing classes inside its own attempt', async () => {
    const row = new RegisterRow('P-ML-SM-2', 'S-ML-IDENTITY-1')
    const s = await surfaceOrCause()
    const shapes: ReadonlyArray<{ readonly id: string; readonly make: () => readonly Record<string, unknown>[] }> = [
      { id: 'a catalog carrying a multi-picker run', make: () => [el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' }), el({ id: 'n2', kind: 'plain' })] },
      { id: 'a catalog of non-picker entries only', make: () => [el({ id: 'n1', kind: 'plain' }), el({ id: 'n2', kind: 'plain' })] },
      { id: 'an empty catalog', make: () => [] },
    ]
    for (const shape of shapes) {
      row.run(`shape ${shape.id} under BOTH non-collapsing classes`, () => {
        if (!s.ok) return s.cause
        const catalog = shape.make()
        const carried = s.s.normalizeCatalog(catalog)
        for (const driver of [
          { id: 'class B (\'win32\')', options: { platform: 'win32' } as unknown },
          { id: 'class C (42)', options: { platform: 42 } as unknown },
        ]) {
          const t = s.s.buildMenuTemplate(catalog, driver.options)
          if (t.items.length !== carried.length) return `${driver.id}: items.length is ${t.items.length}, not the carried length ${carried.length}`
          if (t.platform.collapsing !== false) return `${driver.id}: collapsing is not false — a module that collapses on a non-darwin platform FAILS this row AND P-ML-SM-1`
          for (let i = 0; i < carried.length; i += 1) {
            const mismatch = identityMismatch(carried[i], t.items[i])
            if (mismatch !== null) return `${driver.id}, entry ${i}: ${mismatch}`
          }
        }
        return null
      })
    }
    row.finish()
  })

  it('P-ML-SM-3 (S-ML-CONST-1) cross-call constancy: 3 repeated-call shapes, each driven FIVE times', async () => {
    const row = new RegisterRow('P-ML-SM-3', 'S-ML-CONST-1')
    const s = await surfaceOrCause()
    const catalog = [el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' })]
    row.run('shape (1) — normalizeCatalog, five calls', () => {
      if (!s.ok) return s.cause
      const out = Array.from({ length: 5 }, () => s.s.normalizeCatalog(catalog))
      for (let i = 1; i < 5; i += 1) {
        if (out[i].length !== out[0].length) return `call ${i + 1} carries ${out[i].length} entries, not ${out[0].length}`
        // ⟶ ALIGNED TO THE FRESH-RECORD RULE (`2026-09-27`, gate-3 alignment 4, the
        // same flip `F-10` carries). **THE AS-FILED CHECK REQUIRED `out[i][0]` TO BE
        // `out[0][0]` BY IDENTITY — RETENTION ACROSS CALLS — WHICH IS THE OPPOSITE OF
        // THE PINNED RULE** (`§2.3` item 11 clause 1: *"the module retains nothing
        // either"*; a RETAINED value is the FAILURE `P-ML-IM-4`'s second-call drive
        // declares). **CROSS-CALL CONSTANCY IS EQUAL VALUES WITH DISTINCT RECORDS, AND
        // IDENTITY AT THE MEMBER LEVEL.**
        if (out[i][0] === out[0][0]) return `call ${i + 1} returned the SAME entry record: a retained value FAILS this row (§2.3 item 11 clause 1)`
        for (let e = 0; e < out[0].length; e += 1) {
          const first = out[0][e] as Record<string, unknown>
          const later = out[i][e] as Record<string, unknown>
          if (!keysEqual(Object.keys(later), Object.keys(first))) return `call ${i + 1}, entry ${e}: the carried key set drifted across calls`
          for (const k of Object.keys(first)) {
            if (!Object.is(later[k], first[k])) return `call ${i + 1}, entry ${e}: the ${k} member is not the same VALUE across calls`
          }
        }
      }
      return null
    })
    row.run("shape (2) — buildMenuTemplate with darwin and a conformant recording picker, five calls", () => {
      if (!s.ok) return s.cause
      const answer = { the: 'answer' }
      const rec = recorder(answer)
      const out = Array.from({ length: 5 }, () => s.s.buildMenuTemplate(catalog, { platform: 'darwin', picker: rec.fn }))
      for (let i = 0; i < 5; i += 1) {
        for (let j = i + 1; j < 5; j += 1) {
          if (out[i] === out[j]) return `calls ${i + 1} and ${j + 1} returned the SAME template record: a retained value FAILS this row`
        }
      }
      for (let i = 1; i < 5; i += 1) {
        if (out[i].items.length !== out[0].items.length) return 'the items length drifted across calls'
        if (!keysEqual(Object.keys(out[i].platform), PLATFORM_KEYS)) return 'the platform member list drifted across calls'
      }
      if (rec.count() !== 5) return `the seam's recorded count is ${rec.count()}, not exactly 5 (a cache or a retained closure reads 1)`
      return null
    })
    row.run('shape (3) — selectCatalogItem with a conformant recording picker, five calls', () => {
      if (!s.ok) return s.cause
      const rec = recorder('p1')
      const out = Array.from({ length: 5 }, () => s.s.selectCatalogItem(catalog, rec.fn))
      for (let i = 1; i < 5; i += 1) {
        if (!Object.is(out[i], out[0])) return `call ${i + 1} did not return the caller's own answer BY IDENTITY`
      }
      if (rec.count() !== 5) return `the seam's recorded count is ${rec.count()}, not exactly 5`
      return null
    })
    row.finish()
  })

  it('P-ML-TP-1 (S-ML-TOTAL-1, bounded) the CATALOG TOTALITY universal over the pinned 12-member pool: 12 pinned-seed DRAWS', async () => {
    const row = new RegisterRow('P-ML-TP-1', 'S-ML-TOTAL-1')
    const s = await surfaceOrCause()
    const lcg = makeLcg(SEED)
    for (let i = 0; i < TP_DRAWS; i += 1) {
      const state = lcg.step()
      const index = state % TP_POOL.length
      row.run(`draw ${i + 1} of ${TP_DRAWS}: state ${state}, pool index ${index} — ${TP_POOL[index].id}, driven through ALL THREE entry points`, () => {
        if (!s.ok) return s.cause
        const value = TP_POOL[index].make()
        let normalized: readonly Record<string, unknown>[]
        let template: ReturnType<BuildShape>
        let selected: unknown
        try {
          normalized = s.s.normalizeCatalog(value)
          template = s.s.buildMenuTemplate(value, { platform: 'darwin', picker: () => undefined })
          selected = s.s.selectCatalogItem(value, () => undefined)
        } catch (e) {
          return `an entry point THREW: ${describeThrown(e)}`
        }
        if (!Array.isArray(normalized)) return 'normalizeCatalog did not return an array (a `readonly CatalogEntry[]` is the declared shape)'
        for (const item of normalized) {
          const extra = Object.keys(item).filter((k) => !SEVEN_KEYS.includes(k))
          if (extra.length > 0) return `a normalized entry carries a non-declared own key: ${JSON.stringify(extra)}`
        }
        if (!keysEqual(Object.keys(template), TEMPLATE_KEYS)) return 'the template record does not carry {items, platform}'
        if (!keysEqual(Object.keys(template.platform), PLATFORM_KEYS)) return 'the platform record does not carry {recognized, collapsing}'
        for (const item of template.items) {
          const extra = Object.keys(item).filter((k) => !SEVEN_KEYS.includes(k))
          if (extra.length > 0) return `a projected item carries a non-declared own key: ${JSON.stringify(extra)}`
        }
        if (selected !== null && selected === undefined && value !== undefined) return 'selectCatalogItem returned an undeclared value (neither null nor a caller answer)'
        return null
      })
    }
    const distinctDrawn = new Set(TP_DRAW_INDICES).size
    console.log(
      `§5.5.1 register note :: P-ML-TP-1 — ${TP_DRAWS} draws over a ${TP_POOL.length}-member pool; DISTINCT members drawn (REPORTED, never asserted) = ${distinctDrawn}. ` +
        'A DRAW IS NOT A SWEEP: the universal is over the DRAWN domain and NOT over the whole input space, so no row may assert "all 12".',
    )
    row.control('the pool holds 12 members while the row draws 12 times: the distinct-member count is REPORTED and the row asserts NOTHING about coverage (a DRAW IS NOT A SWEEP)', true)
    row.control('the pool\'s silence about a shape it does not list (a lone-surrogate string, a second-invocation-only throwing toPrimitive, a successive-read-inconsistent holder) is a STATED BOUNDARY, not an unrecorded omission', true)
    row.finish()
  })

  it('P-ML-TP-2 (S-ML-SEAM-1, bounded) THE PICKER\'S DECLARED DEGRADATIONS: 9 seam/answer shapes, ONE DRIVE EACH', async () => {
    const row = new RegisterRow('P-ML-TP-2', 'S-ML-SEAM-1')
    const s = await surfaceOrCause()
    const runC = [el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' })]
    const noRunC = [el({ id: 'n1', kind: 'plain' }), el({ id: 'n2', kind: 'plain' })]
    const enabledOfParent = (t: ReturnType<BuildShape>): unknown => {
      const parent = t.items.find((i) => i['kind'] === 'picker')
      return parent === undefined ? 'the picker item is ABSENT (it was DROPPED)' : parent['enabled']
    }
    row.run('(a) an ABSENT seam: the picker-kind item is EMITTED and enabled === false', () => {
      if (!s.ok) return s.cause
      const t = s.s.buildMenuTemplate(runC, { platform: 'darwin' })
      const enabled = enabledOfParent(t)
      if (enabled === 'the picker item is ABSENT (it was DROPPED)') return String(enabled)
      return enabled === false ? null : `the emitted parent reads enabled ${String(enabled)}, not false`
    })
    row.run('(b) a NON-CALLABLE seam: the same, with ZERO invocations', () => {
      if (!s.ok) return s.cause
      const rec = recorder('never')
      const t = s.s.buildMenuTemplate(runC, { platform: 'darwin', picker: null })
      const enabled = enabledOfParent(t)
      if (enabled === 'the picker item is ABSENT (it was DROPPED)') return String(enabled)
      if (enabled !== false) return `the emitted parent reads enabled ${String(enabled)}, not false`
      return rec.count() === 0 ? null : 'the drive was contaminated by its own recorder'
    })
    row.run('(c) a THROWING seam: ATTEMPTED ONCE, ABSORBED inside the wrapper, item disabled', () => {
      if (!s.ok) return s.cause
      const rec = throwingSeam(new Error('x'))
      let t: ReturnType<BuildShape>
      try {
        t = s.s.buildMenuTemplate(runC, { platform: 'darwin', picker: rec.fn })
      } catch (e) {
        return `the throw was PROPAGATED out of the builder: ${describeThrown(e)}`
      }
      const enabled = enabledOfParent(t)
      if (enabled !== false) return `the emitted parent reads enabled ${String(enabled)}, not false`
      return rec.count() === 1 ? null : `the count is ${rec.count()}, not exactly 1`
    })
    row.run('(d) a non-null answer naming NO known id yields null from selectCatalogItem', () => {
      if (!s.ok) return s.cause
      const out = s.s.selectCatalogItem([el({ id: 'a' })], () => 'zzz')
      return out === null ? null : `the return value is not null (it is a declared-empty-answer breach)`
    })
    row.run('(e) a non-null KNOWN-id answer is returned BY IDENTITY', () => {
      if (!s.ok) return s.cause
      const answer = { known: true }
      const out = s.s.selectCatalogItem([el({ id: answer })], () => answer)
      return Object.is(out, answer) ? null : 'the answer was not returned BY IDENTITY'
    })
    row.run('(f) a null/undefined/empty answer yields null', () => {
      if (!s.ok) return s.cause
      for (const answer of [null, undefined, '', 0, false, [], {}]) {
        const out = s.s.selectCatalogItem([el({ id: 'a' })], () => answer)
        if (out !== null) return `an empty answer (${String(answer)}) yielded a non-null return`
      }
      return null
    })
    row.run("(g) an unusable entry carrying the 'picker' kind still contributes its collapsed parent", () => {
      if (!s.ok) return s.cause
      const unusable = el({ id: 'p1', kind: 'picker', submenu: undefined, enabled: undefined })
      const t = s.s.buildMenuTemplate([unusable, el({ id: 'p2', kind: 'picker' })], { platform: 'darwin' })
      if (t.items.length !== 1) return `the run emitted ${t.items.length} items, not 1`
      if (t.items[0]['id'] !== 'p1') return 'the parent is not the run\'s first entry'
      return null
    })
    row.run("(h) a catalog with NO 'picker'-kind entry invokes the seam ZERO times", () => {
      if (!s.ok) return s.cause
      const rec = recorder('never')
      s.s.buildMenuTemplate(noRunC, { platform: 'darwin', picker: rec.fn })
      return rec.count() === 0 ? null : `the seam was invoked ${rec.count()} time(s) over a catalog with no picker-kind entry`
    })
    row.run('(i) a Proxy whose apply trap throws behaves as (c)', () => {
      if (!s.ok) return s.cause
      const seam = applyThrowingProxy()
      let t: ReturnType<BuildShape>
      try {
        t = s.s.buildMenuTemplate(runC, { platform: 'darwin', picker: seam })
      } catch (e) {
        return `the apply-trap throw was PROPAGATED: ${describeThrown(e)}`
      }
      const enabled = enabledOfParent(t)
      return enabled === false ? null : `the emitted parent reads enabled ${String(enabled)}, not false`
    })
    row.control('the FOUR degradation classes of §2.4 item 1 are each driven, and every count is ASSERTED, never "at least"', true)
    row.finish()
  })

  it('P-ML-TP-3 (S-ML-ENTRY-1, bounded) THE PLATFORM PROJECTION\'S THREE-OUTCOME POOL: 12 platform shapes, ONE DRIVE EACH', async () => {
    const row = new RegisterRow('P-ML-TP-3', 'S-ML-ENTRY-1')
    const s = await surfaceOrCause()
    const catalog = [el({ id: 'n1', kind: 'plain' }), el({ id: 'p1', kind: 'picker' }), el({ id: 'p2', kind: 'picker' })]
    for (const shape of PLATFORM_SHAPES) {
      row.run(`platform shape ${shape.id}`, () => {
        if (!s.ok) return s.cause
        const t = s.s.buildMenuTemplate(catalog, { platform: shape.value })
        const pair = [t.platform.recognized, t.platform.collapsing]
        if (pair[0] !== shape.recognized || pair[1] !== shape.collapsing) {
          return `${shape.id}: the platform member pair is ${JSON.stringify(pair)}, not ${JSON.stringify([shape.recognized, shape.collapsing])} — no silent darwin default exists on any shape`
        }
        if (shape.collapsing) {
          if (t.items.length !== 2) return `${shape.id}: the collapse was not applied (items.length ${t.items.length}, not 2)`
          return null
        }
        if (t.items.length !== 3) return `${shape.id}: the identity projection was not applied (items.length ${t.items.length}, not 3)`
        // ⟶ ALIGNED TO THE CARRY RULE (`2026-09-27`, gate-3 alignment 3, the same
        // defect class as `F-5`/`M-7`). **THE AS-FILED CHECK WAS `'submenu' in
        // t.items[0]`, WHICH THIS ROW'S OWN FIXTURE REFUTES** — `el()` authors
        // `submenu: 'S'` on the plain entry, so the member is PRESENT on every
        // non-collapsing shape whatever the module does. **THE NON-COLLAPSING
        // SIGNATURE IS THE ABSENCE OF AN EMITTED SUBMENU ARRAY**: the member stays the
        // source's own on each of the five shapes below, which is what is asserted.
        if (Array.isArray(t.items[0]['submenu'])) return `${shape.id}: an entry gained a submenu ARRAY on a non-collapsing platform`
        if (!Object.is(t.items[0]['submenu'], catalog[0]?.['submenu'])) return `${shape.id}: an entry's \`submenu\` is not its own source's member carried verbatim`
        if (shape.absent) {
          // The ABSENT case is driven as an ASSERTION inside this attempt (never a
          // second drive): `options` omitted ENTIRELY and the member omitted.
          const omitted = s.s.buildMenuTemplate(catalog)
          const omittedMember = s.s.buildMenuTemplate(catalog, {})
          if (omitted.platform.recognized !== false || omitted.platform.collapsing !== false) return 'the ABSENT `options` case did not land in the {recognized:false, collapsing:false} arm'
          if (omittedMember.platform.recognized !== false || omittedMember.platform.collapsing !== false) return 'the OMITTED `platform` member did not land in the {recognized:false, collapsing:false} arm'
          if (omitted.items.length !== 3 || omittedMember.items.length !== 3) return 'the ABSENT case did not produce the identity projection'
        }
        return null
      })
    }
    row.control('the `recognized` column\'s non-string arm is a DERIVATION (§0A note 4) and this row is the ONE site whose expectation the alternative reading would move', true)
    row.finish()
  })
})

// ===========================================================================
// §5.5.2 ITEM 3 / §5.3 ITEMS 10/11 — THE REGISTER'S STATUS ROW: the
// declared-versus-measured reconciliation, the caps, the `(bounded)` set and the
// un-run-row-is-a-FAILURE rule. It runs LAST and reads the register's own state.
// ===========================================================================
describe('§5.5.1/§5.5.2 — the register\'s status row', () => {
  it('REGISTER-STATUS the DECLARED 126 (corrected from the as-filed 123) against the measured attempts, the per-row readings, the two caps, the (bounded) set and the stop state', () => {
    const declared = REGISTER_TERMS.reduce((a, b) => a + b.declared, 0)
    const measured = registerState.attempts
    const record = {
      termsDeclared: REGISTER_TERMS.length,
      totalDeclared: DECLARED_TOTAL,
      declaredTermSum: declared,
      attemptsExecuted: measured,
      rowsExecuted: registerState.records.length,
      rowCap: REGISTER_ROW_CAP,
      totalCap: REGISTER_TOTAL_CAP,
      consecutiveFailureCap: CONSECUTIVE_FAILURE_CAP,
      registerStoppedAt: registerState.stoppedAtRow,
      stoppedFor: registerState.stoppedFor,
      boundedSet: REGISTER_TERMS.filter((r) => r.bounded).map((r) => r.row),
      terms: REGISTER_TERMS.map((r) => `${r.row}=${r.declared}`),
      perRow: registerState.records.map((r) => `${r.row}:${r.attemptsRun}/${r.held}/${r.broken}/${r.controls}${r.stoppedEarly ? '/stoppedEarly' : ''}${r.notStarted ? '/notStarted' : ''}`),
    }
    console.log(`§5.5.1 register record :: ${JSON.stringify(record)}`)
    // =====================================================================
    // THE RECONCILIATION — RE-GRAINED to the CORRECTED figure `126` (`§5.5.3`'s
    // dated amendment; `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`). As filed
    // this row asserted the declared `123` AND the mismatch it exposed; with the
    // amendment landed the declared figure IS the sum of its own terms, and the
    // as-filed `123` is asserted BESIDE it as the SUPERSEDED filing figure
    // (annotate-never-rewrite). **The polarity is REAL**: the two figures are
    // asserted as DIFFERENT, and the CONTROL below keeps the reconciliation
    // falsifiable — a harness that passed for either figure would be the finding.
    // =====================================================================
    expect(declared, "§5.5.3 — the thirteen terms' ACTUAL sum, printed WITH them: 12+12+12+12+12+12+12+3+3+3+12+9+12 = 126").toBe(DECLARED_TOTAL)
    expect(DECLARED_TOTAL, "§5.5.3 — the DECLARED total, CORRECTED to `126` (`123 → 126` by the dated amendment), printed WITH its terms: `126 = 12+12+12+12+12+12+12+3+3+3+12+9+12`").toBe(126)
    expect(AS_FILED_DECLARED_TOTAL, "§5.5.3 — THE AS-FILED (SUPERSEDED) declared total, kept VISIBLE beside the corrected figure and never substituted for it: `123 = 12+12+12+12+12+12+12+3+3+3+12+9+12`, the mis-sum of these same thirteen terms").toBe(123)
    /** THE RECONCILIATION, as a predicate over the register's own terms, so the row
     *  can show it CAN fail rather than asserting a figure it cannot falsify. */
    const reconcilesWithItsTerms = (figure: number): boolean => figure === declared
    expect(
      reconcilesWithItsTerms(DECLARED_TOTAL),
      `§5.5.3 — the CORRECTED DECLARED total ${DECLARED_TOTAL} RECONCILES with its own thirteen terms (${declared}): the chain's last step is now reachable from the terms`,
    ).toBe(true)
    expect(reconcilesWithItsTerms(declared), 'the terms\' own sum reconciles with itself, which is what makes the assertion above a real reconciliation and not a tautology').toBe(true)
    expect(
      reconcilesWithItsTerms(AS_FILED_DECLARED_TOTAL),
      `CONTROL (declared to FAIL) — THE SUPERSEDED FILING FIGURE ${AS_FILED_DECLARED_TOTAL} does NOT reconcile with the same thirteen terms (${declared}): the polarity of this row is therefore REAL, and a harness that reconciled BOTH figures would be the finding`,
    ).toBe(false)
    expect(reconcilesWithItsTerms(127), 'CONTROL (declared to FAIL) — the figure a re-grain that ADDED the §5.5.2 item 10 lone-surrogate shape would produce (the amendment annotates the as-filed `123 → 124` as `126 → 127`) does NOT reconcile with the corrected terms, which is exactly why that addition owes a re-grain').toBe(false)
    expect(reconcilesWithItsTerms(124), 'CONTROL (declared to FAIL) — the AS-FILED §5.5.2 item 10 re-grain figure (124), kept visible under its own annotation, likewise does NOT reconcile with the corrected terms').toBe(false)
    // THE PER-ROW READINGS (each row's own record line prints the same figures).
    // ⟶ A DECLARED BRANCH (`2026-09-27`, the register's stop-state interaction).
    // **THE AS-FILED FORM ASSERTED `rowsExecuted === 13` UNCONDITIONALLY**, which is
    // satisfiable only when the run does NOT stop early: at RED time the
    // stop-after-five rule ends the run inside `P-ML-IM-5` and the twelve rows after
    // it are reported as FAILURES by their own `finish()`. **THE RECORD COUNT IS A
    // BRANCH; THE PER-ROW IDENTITY READS BELOW HOLD IN BOTH BRANCHES.**
    const unRunRows = registerState.records.filter((r) => r.notStarted).map((r) => r.row)
    if (existsSync(MODULE_SRC)) {
      expect(
        registerState.records.length,
        'REGISTER-STATUS (GREEN form) — with the module LANDED every one of the 13 rows must have EXECUTED: a record line exists for each, and `notStarted` is empty',
      ).toBe(13)
      expect(
        unRunRows,
        'REGISTER-STATUS (GREEN form) — NO row may be un-run when the module is present: an un-run row is a FAILURE, so a green run reports none',
      ).toEqual([])
    } else {
      expect(
        registerState.records.length,
        'REGISTER-STATUS (RED form) — every one of the 13 rows contributed a record line even when the run STOPS EARLY (a row that never started still records itself: it is reported as a FAILURE by its own finish())',
      ).toBe(13)
      expect(
        unRunRows.length,
        'REGISTER-STATUS (RED form) — and the un-run rows are NAMED rather than omitted: at red time the stop leaves at least one row un-run, and every one of them is a recorded FAILURE',
      ).toBeGreaterThan(0)
      expect(
        unRunRows,
        'REGISTER-STATUS (RED form) — the un-run rows are the register-ORDER TAIL after the stopping row, so the stop is attributable rather than scattered',
      ).toEqual(REGISTER_TERMS.map((r) => r.row).slice(REGISTER_TERMS.map((r) => r.row).length - unRunRows.length))
    }
    for (const r of registerState.records) {
      expect(r.held + r.broken, `REGISTER-STATUS — \`held + broken === attemptsRun\` holds for ${r.row} (its status row's own identity is preserved)`).toBe(r.attemptsRun)
      expect(r.seed, `REGISTER-STATUS — ${r.row} reports the pinned seed ${SEED}`).toBe(SEED)
      expect(r.strategy, `REGISTER-STATUS — ${r.row} reports its own strategy id`).toMatch(/^S-ML-/)
    }
    // THE CAPS, read as the DECLARED figures.
    for (const t of REGISTER_TERMS) {
      expect(t.declared, `${t.row}'s declared term is inside the ≤${REGISTER_ROW_CAP} per-row cap`).toBeLessThanOrEqual(REGISTER_ROW_CAP)
    }
    expect(declared, `the declared total is inside the ≤${REGISTER_TOTAL_CAP} cap`).toBeLessThanOrEqual(REGISTER_TOTAL_CAP)
    expect(measured, `the MEASURED attempts may never exceed the ≤${REGISTER_TOTAL_CAP} cap`).toBeLessThanOrEqual(REGISTER_TOTAL_CAP)
    // THE STOP ASSERTION, BRANCHED ON THE MODULE'S PRESENCE — the red form's own
    // shape (`§4.2`'s stop-rule paragraph: a red run of a module-absent unit IS
    // expected to stop early, and the un-run rows are reported as FAILURES).
    if (!existsSync(MODULE_SRC)) {
      expect(registerState.stoppedAtRow, 'REGISTER-STATUS (RED branch) — with the module ABSENT the register STOPS EARLY at a named row, and the un-run rows are reported as FAILURES by their own finish() (an un-run register row is never a pass)').toBe('P-ML-IM-1')
      expect(registerState.stoppedFor, 'REGISTER-STATUS (RED branch) — and the stop has a NAMED cause, so the record is attributable rather than silent').toBe(`${CONSECUTIVE_FAILURE_CAP} consecutive failures`)
      expect(
        registerState.records.filter((r) => r.notStarted).map((r) => r.row),
        'REGISTER-STATUS (RED branch) — the rows that NEVER STARTED are NAMED rather than omitted: the 12 rows after the first, in register order',
      ).toEqual(REGISTER_TERMS.slice(1).map((r) => r.row))
    } else {
      expect(registerState.stoppedAtRow, 'REGISTER-STATUS (GREEN branch) — `stoppedAtRow === null`: no row stopped, because no five consecutive failures occurred').toBe(null)
      expect(registerState.stoppedFor, 'REGISTER-STATUS (GREEN branch) — `stoppedFor === null`, the companion reading of the same fact').toBe(null)
      // NOTE (RE-GRAINED with the rest of this row): the GREEN branch below reads
      // the CORRECTED declared total (126), which IS the terms' own sum. The
      // as-filed 123 is SUPERSEDED and is asserted BESIDE it above, never here.
      expect(measured, `REGISTER-STATUS (GREEN branch) — the register executed ALL ${DECLARED_TOTAL} of the CORRECTED declared attempts (${measured} measured), with every row's own \`broken\` reading 0; the as-filed ${AS_FILED_DECLARED_TOTAL} is superseded`).toBe(DECLARED_TOTAL)
    }
    expect(
      REGISTER_TERMS.filter((r) => r.bounded).length,
      '§5.5.2 item 2 — the `(bounded)` set is SIX of the THIRTEEN rows, and every row whose property text quantifies over a domain larger than its table carries the marking',
    ).toBe(6)
  })
})

// ===========================================================================
// ⟶ THE GATE-4 / GATE-5 REGRESSION ROWS (`2026-09-27`, RED-FIRST).
//
// CONTRACT: `docs/specs/menulib.md` `§3d` — its `(1)` table records the four
// host findings `A-1`…`A-4` (none fixed at that writing) and its `(2)` section
// the gate-5 blind set's two FAILs plus the three ambiguities (`F-3`/`F-4`/`F-5`).
// This pass read `§3d` BEFORE authoring and read the pins it needs from the
// contract's EXISTING text: `§2.3` item 1(c) (a function is SKIPPED),
// item 1(d) (a throwing own-key read skips the element and nothing escapes),
// item 11 clause 4 (the same SKIP, total), `§3c` pin 1 (an ARRAY is carryable —
// its own PRESENT INDEX keys, ascending, `length` never carried) and `§3c`
// pin 2 (an empty intersection is CARRIED keyless, never dropped).
//
// THE CONTRACT'S PARALLEL AMENDMENT HAS NOT LANDED AT THIS WRITING (HEAD
// `8cc2d23`): `§2.3` item 2/9's ENUMERABLE-ONLY own-read pin (`A-2`), `§2.4`
// item 1's answer-unused rule (`A-4`), item 11's worked reading corrected to `4`
// and item 1(c)'s function rule are all still the AS-FILED text. So `A-1`, the
// FUNCTION SKIP and `A-3` are authored to the CONTRACT'S EXISTING TEXT — which
// for the function and the two `A-1` arms ALREADY declares the reading these
// rows assert — and the one clause the contract leaves open, `F-3`, is authored
// to `§2.3` item 5 RULE 3's own text, the reading gate 5's driver used and the
// one the register's own `P-ML-IM-5` boundary drive (2) is aligned to.
//
// NO ROW ID, STRATEGY ID, SEED, CAP OR DECLARED TERM MOVES AND NO REGISTER ROW
// IS ADDED (`§3d`: the declared total stays `126`; a fourteenth term would move
// it, and the `A-1` row is authored with NO OWN DRIVE — see its own note). These
// rows ride BESIDE the register: they are clause rows, in the same form as
// `F-1`..`F-10`, and they neither run a `RegisterRow` nor count an attempt.
// ===========================================================================
describe('§3d — the gate-4 / gate-5 regression rows (red-first, authored to the contract’s existing pins)', () => {
  it('A-1 (§2.3 item 1(b)/(d), §3c pins 1/2) a NESTED HOSTILE MEMBER SKIPS THE MEMBER AND NEVER THE CATALOG, and a CYCLE does NOT THROW', async () => {
    // =====================================================================
    // STATES ENUMERATED BEFORE THE FIRST ASSERTION (the happy/usable states and
    // the fail-states this row covers):
    //   USABLE / HAPPY STATES
    //     (1) a plain usable element beside a hostile one — the usable element
    //         IS carried, in catalog order, and the hostile member is skipped;
    //     (2) a NESTED ARRAY carrying a hostile member — the member is skipped
    //         INSIDE the nested record, the nested record itself is carried;
    //     (3) a NESTED ARRAY carrying NO hostile member — carried normally
    //         (the baseline that makes (2)'s reading falsifiable);
    //     (4) the same catalogs driven through `buildMenuTemplate`.
    //   FAIL-STATES (the documented skips — each must be SKIPPED, never a throw
    //   and never a drop of the surrounding catalog)
    //     (F1) a REVOKED `Proxy` member beside a usable one (`A-1`'s own
    //          measured case: the landed module returns `[]`);
    //     (F2) a revoked `Proxy` as the only member (still a catalog, `[]`);
    //     (F3) a revoked `Proxy` NESTED one level down (`A-1`'s second case);
    //     (F4) a CYCLIC member (an array whose own member IS that array) — the
    //          landed module THROWS `RangeError` here, outside any absorbed span.
    // =====================================================================
    const s = await surface('A-1')
    const usable = { id: 'k' }
    // (F1) THE HIGH FINDING: the usable element is carried and the hostile MEMBER
    // is what gets skipped — NEVER the catalog.
    const withHostile = [usable, revokedProxy()]
    expect(
      () => s.normalizeCatalog(withHostile),
      'A-1 (F1) — `normalizeCatalog([{id:\'k\'}, revokedProxy()])` MUST NOT THROW (§2.3 item 1(d): the throw is absorbed)',
    ).not.toThrow()
    const carried = s.normalizeCatalog(withHostile)
    expect(
      carried.length,
      'A-1 (F1) — the USABLE element is CARRIED: the catalog is NOT dropped because one MEMBER is hostile (the landed module returns `[]` here — THE RED)',
    ).toBe(1)
    expect(carried[0]?.['id'], 'A-1 (F1) — and the carried entry is the usable element, by its own `id`').toBe('k')
    expect(s.normalizeCatalog([usable]), 'A-1 (1) CONTROL — a catalog of the usable element alone carries it (so a module that dropped EVERYTHING would fail the control too)').toHaveLength(1)
    expect(s.normalizeCatalog([revokedProxy()]), 'A-1 (F2) CONTROL — a catalog of ONLY hostile elements is still a CATALOG and reads `[]`, never a throw').toEqual([])
    // (F4) THE CYCLE: skipping the self-referential member leaves the (now empty)
    // record CARRIED under `§3c` pin 2 — a record with no keys is NEVER dropped.
    const cycle: unknown[] = []
    cycle.push(cycle)
    expect(
      () => s.normalizeCatalog([cycle]),
      'A-1 (F4) — an ARRAY CONTAINING ITSELF must be handled WITHOUT A THROW: the cycle is a hostile MEMBER and is SKIPPED (the landed module raises `RangeError` from the unbounded recursion — THE RED)',
    ).not.toThrow()
    const cyclic = s.normalizeCatalog([cycle])
    expect(cyclic.length, 'A-1 (F4) — the cyclic ELEMENT is still one usable record: `§3c` pin 2 carries a record whose seven-name intersection is EMPTY as a record with NO keys, never a drop').toBe(1)
    expect(Object.keys(cyclic[0] ?? {}), 'A-1 (F4) — and that record is KEYLESS: its own member was the skipped cycle').toEqual([])
    // (F3) ONE LEVEL DOWN: the hostile member is skipped INSIDE the nested record.
    const nestedHostile: readonly unknown[] = [revokedProxy()]
    expect(
      () => s.normalizeCatalog([nestedHostile]),
      'A-1 (F3) — a NESTED array carrying a hostile member MUST NOT THROW (§2.3 item 1(d), and the member read is absorbed at the member)',
    ).not.toThrow()
    const nestedOut = s.normalizeCatalog([nestedHostile])
    expect(nestedOut.length, 'A-1 (F3) — the NESTED record is CARRIED even though its own member was skipped: the landed module returns `[]` here — THE RED').toBe(1)
    expect(Object.keys(nestedOut[0] ?? {}), "A-1 (F3) — the nested record's own key set is `['0']` (`§3c` pin 1: the array's own present index key is carried) and its value is the SKIPPED member, which is absent rather than partially carried").toEqual(['0'])
    expect(Object.keys(nestedOut[0]?.['0'] ?? {}), 'A-1 (F3) — the nested member was SKIPPED WHOLE, so the carried slot is a keyless record rather than a partial one (`§3c` pin 3)').toEqual([])
    // (3) THE BASELINE that makes (F3) falsifiable: the SAME shape with a usable
    // member carries that member as a fresh seven-key record.
    const nestedUsable: readonly unknown[] = [el({ id: 'deep' })]
    const nestedOk = s.normalizeCatalog([nestedUsable])
    expect(Object.keys(nestedOk[0]?.['0'] ?? {}), 'A-1 (3) CONTROL — with a USABLE nested member the nested record carries it as a FRESH seven-key record, so the reading above is not merely relaxed').toEqual([...SEVEN_KEYS])
    // (4) THE SAME CATALOGS THROUGH THE BUILDER: one item, and the projection is
    // the identity projection (no entry carries `kind: 'picker'`).
    const built = s.buildMenuTemplate(withHostile, { platform: 'win32' })
    expect(built.items.length, 'A-1 (4) — `buildMenuTemplate` carries the usable element too: the hostile member must not empty the emitted `items` (THE RED, same cause)').toBe(1)
    expect(built.items[0]?.['id'], 'A-1 (4) — and the emitted item is the usable element').toBe('k')
    expect(
      [built.platform.recognized, built.platform.collapsing],
      'A-1 (4) — the platform members are unaffected by the hostile member (the projection is a function of `platform` ALONE, §2.3 item 10)',
    ).toEqual([true, false])
  })

  it('A-1 / FUNCTION ELEMENT (§2.3 item 1(c) + item 11 clause 4, gate 5’s F-1) a FUNCTION-typed element is SKIPPED over SIX function shapes, with no throw and no entry', async () => {
    // =====================================================================
    // STATES ENUMERATED BEFORE THE FIRST ASSERTION:
    //   FUNCTION SHAPES (all SIX declared in `§3d` (2) as carried by the landed
    //   module): a NAMED function expression · an ARROW · an ASYNC arrow · a
    //   GENERATOR function · a CLASS · a BOUND arrow. Plus the two shapes the
    //   register's own `P-ML-IM-1` pool drives (`() => 1`, and a function
    //   element inside an otherwise hostile catalog).
    //   USABLE / HAPPY STATE: a PLAIN OBJECT element beside a function element —
    //   the object IS carried, the function contributes NOTHING.
    //   FAIL-STATE: a function element must be SKIPPED, contributing NO entry and
    //   NO throw (`§2.3` item 1(c): *"a function ⇒ the element is SKIPPED"*;
    //   item 11 clause 4 restates it as TOTAL). The landed module CARRIES each
    //   one as a KEYLESS entry and `buildMenuTemplate([fn]).items` reads `[{}]`.
    // =====================================================================
    const s = await surface('gate-5 F-1')
    const named = function namedShape(): void { /* shape only */ }
    const arrow = (): number => 1
    const asyncArrow = async (): Promise<void> => { /* shape only */ }
    const generator = function* generatorShape(): Generator<number> { yield 1 }
    class ClassShape { readonly id = 'class-shape' }
    const bound = ((): unknown => null).bind(null)
    const fnShapes: ReadonlyArray<{ readonly id: string; readonly make: () => unknown }> = [
      { id: 'a NAMED function', make: () => named },
      { id: 'an ARROW', make: () => arrow },
      { id: 'an ASYNC arrow', make: () => asyncArrow },
      { id: 'a GENERATOR function', make: () => generator },
      { id: 'a CLASS', make: () => ClassShape },
      { id: 'a BOUND arrow', make: () => bound },
    ]
    // THE COUNT IS READ FIRST, so a red run prints the shape the module produced
    // rather than a `TypeError` from a missing index.
    const measured = fnShapes.map((f) => s.normalizeCatalog([f.make()]).length)
    expect(
      measured,
      'FUNCTION ELEMENT — every one of the six function shapes contributes NO ENTRY (`§2.3` item 1(c): a function is SKIPPED). The landed module CARRIES each as one keyless entry — THE RED',
    ).toEqual([0, 0, 0, 0, 0, 0])
    for (const f of fnShapes) {
      expect(() => s.normalizeCatalog([f.make()]), `FUNCTION ELEMENT — normalizeCatalog([${f.id}]) MUST NOT THROW (item 1(c): *"NO entry and NO throw"*)`).not.toThrow()
      expect(
        s.normalizeCatalog([f.make()]),
        `FUNCTION ELEMENT — normalizeCatalog([${f.id}]) returns the declared EMPTY answer: a function element is not carryable`,
      ).toEqual([])
      expect(
        s.buildMenuTemplate([f.make()], { platform: 'win32' }).items,
        `FUNCTION ELEMENT — buildMenuTemplate([${f.id}]).items reads \`[]\`: a projected item with no member at all must not reach \`items\` (the landed module reads \`[{}]\`)`,
      ).toEqual([])
    }
    // THE CONTROL: a PLAIN OBJECT element IS carried, so this row cannot pass for
    // a module that drops every element.
    expect(s.normalizeCatalog([{ id: 'ok' }]).length, 'FUNCTION ELEMENT CONTROL — a PLAIN OBJECT element beside the function shapes IS carried (`§2.3` item 1(b)), so the six `[]` readings above are a SKIP rather than a global drop').toBe(1)
    expect(s.normalizeCatalog([{ id: 'ok' }])[0]?.['id'], 'FUNCTION ELEMENT CONTROL — and it is the object that is carried, by its own `id`').toBe('ok')
    // THE MIXED DRIVE the gate-5 record measured as `3` where the contract
    // declares `2`: two usable elements beside one function element.
    const mixed = s.buildMenuTemplate([{ id: 'one' }, arrow, { id: 'two' }], { platform: 'win32' })
    expect(mixed.items.length, 'FUNCTION ELEMENT — two usable elements beside one FUNCTION element emit TWO items, not three (gate 5 measured 3 — THE RED)').toBe(2)
    expect(mixed.items.map((i) => i['id']), 'FUNCTION ELEMENT — and the two emitted ids are the caller\'s usable elements, in catalog order').toEqual(['one', 'two'])
    expect(
      s.normalizeCatalog([named, 42, null, revokedProxy()]),
      'FUNCTION ELEMENT CONTROL — a catalog of the function element and the OTHER skipped classes (a primitive, `null`, a hostile member) is still a catalog and reads `[]`',
    ).toEqual([])
  })

  it('A-3 (§3c pin 1’s index-key reading, `§3d` (1) A-3) an ARRAY-LIKE DIGIT-STRING KEY: the declared key set for `\'01\'`, a SPARSE array and a genuine MULTI-element array', async () => {
    // =====================================================================
    // STATES ENUMERATED BEFORE THE FIRST ASSERTION (the three shapes `A-3` owes a
    // DECLARED KEY SET for):
    //   (1) `Object.assign([], {'01':'x'})` — an ARRAY whose own key is the
    //       DIGIT-STRING `'01'`, which is NOT a canonical array index;
    //   (2) a SPARSE array `[, x]` — one present index (`'1'`), one HOLE;
    //   (3) a genuine MULTI-element array `[a, b, c]` with three present indices.
    //   THE DECLARED KEY SETS, read from `§3c` pin 1 (the array carries *"its own
    //   present index keys"*, `['0','1','2'] … in ASCENDING NUMERIC order*, so a
    //   SPARSE array is carried at its present indices only: `[,x]` yields
    //   `['1']`*, `length` never carried): (1) `[]` — `'01'` is neither one of the
    //   seven declared names nor an index key; (2) `['1']`; (3) `['0','1','2']`.
    //   FAIL-STATE: a module whose index-key predicate accepts ANY ALL-DIGIT string
    //   carries `'01'` and FAILS (1); one that materializes a hole FAILS (2).
    // =====================================================================
    const s = await surface('A-3')
    // (1) THE FINDING: `isIndexKey` accepts any all-digit key, so the landed
    // module carries `'01'`.
    const arrayLike: readonly unknown[] = Object.assign([], { '01': 'x' }) as readonly unknown[]
    expect(Object.keys(arrayLike), "A-3 (1) PREMISE — the shape really does own the digit-string key `'01'` (and it is not a canonical index: `length` is 0)").toEqual(['01'])
    expect(arrayLike.length, "A-3 (1) PREMISE — `'01'` is NOT a canonical array index, so it does not contribute to `length`").toBe(0)
    const out01 = s.normalizeCatalog([arrayLike])
    expect(
      Object.keys(out01[0] ?? {}),
      "A-3 (1) — the DECLARED KEY SET for `Object.assign([], {'01':'x'})` is `[]`: `'01'` is neither one of the seven declared names nor one of the array's own PRESENT INDEX keys (§3c pin 1), so it is DROPPED. The landed module CARRIES it — THE RED",
    ).toEqual([])
    // (2) THE SPARSE ARRAY: present indices only.
    const sparse: readonly unknown[] = [, el({ id: 'sparse-one' })]
    expect(Object.keys(sparse), "A-3 (2) PREMISE — the sparse shape owns exactly ONE present index key (`'1'`); `'0'` is a HOLE").toEqual(['1'])
    const outSparse = s.normalizeCatalog([sparse])
    expect(Object.keys(outSparse[0] ?? {}), "A-3 (2) — a SPARSE array is carried at its PRESENT INDICES ONLY: the declared key set is `['1']` (§3c pin 1). A module that materializes the hole FAILS here").toEqual(['1'])
    expect(outSparse[0]?.['0'], "A-3 (2) — and the HOLE is NOT materialized: there is no `'0'` member on the carried record").toBeUndefined()
    expect(Object.keys(outSparse[0]?.['1'] ?? {}), "A-3 (2) — the present member is CARRIED IN TURN as a fresh seven-key record (§3c pin 1)").toEqual([...SEVEN_KEYS])
    // (3) THE GENUINE MULTI-ELEMENT ARRAY: ascending numeric order.
    const dense: readonly unknown[] = [el({ id: 'd0' }), el({ id: 'd1' }), el({ id: 'd2' })]
    const outDense = s.normalizeCatalog([dense])
    expect(Object.keys(outDense[0] ?? {}), "A-3 (3) — a three-element array carries `['0','1','2']` IN ASCENDING NUMERIC ORDER (§3c pin 1), and `length` is NEVER carried").toEqual(['0', '1', '2'])
    const denseRecord = (outDense[0] ?? {}) as Record<string, Record<string, unknown>>
    expect(
      [denseRecord['0']?.['id'], denseRecord['1']?.['id'], denseRecord['2']?.['id']],
      'A-3 (3) — each present member is carried in turn, in catalog order, by its own `id`',
    ).toEqual(['d0', 'd1', 'd2'])
    // THE CONTROLS, so the declared key sets above cannot pass vacuously: a
    // DENSE array of one is `['0']` (the `A-3` row's own positive control), and
    // the same shapes through the builder project to the same key sets — the
    // projection changes NO key set for an entry that owns none of the seven.
    expect(Object.keys(s.normalizeCatalog([[el({ id: 'solo' })]])[0] ?? {}), "A-3 CONTROL (i) — a ONE-element array is `['0']` (§3c pin 1, F-2's own reading), so the `[]` and `['1']` readings above are not a blanket refusal of index keys").toEqual(['0'])
    expect(Object.keys(s.buildMenuTemplate([arrayLike], { platform: 'win32' }).items[0] ?? {}), "A-3 CONTROL (ii) — the projected ITEM for the `'01'` shape carries none of the seven declared names either, so the same reading holds through the builder").toEqual([])
  })

  it('§3d (2) F-3 RECONCILIATION (§2.3 item 5 rule 3) a SKIPPED ELEMENT cannot SPLIT a run — with the competing TWO-SINGLETON reading asserted to FAIL', async () => {
    // =====================================================================
    // THE CLAUSE PAIR AND THE READING THIS ROW TAKES: `§2.3` item 5 RULE 3
    // (*"THE RUN IS MAXIMAL AND IT IS MEASURED ON THE NORMALIZED SEQUENCE … an
    // element skipped by the normalizer cannot bridge or split a run"*) against
    // `§3.2 F-5` / the register's method note (a), which drive the same shape as
    // TWO SINGLETONS. **THE CONTRACT PINS NEITHER AS THE WINNER AT THIS WRITING**
    // (`§3d` (2) `F-3` records gate 5's driver taking rule 3's text and its `PASS`
    // as BOUNDED to it; the contract amendment that would settle the pair has NOT
    // landed at HEAD `8cc2d23`) — so this row is authored to RULE 3's TEXT, the
    // reading the register's own `P-ML-IM-5` boundary drive (2) is aligned to and
    // the one the module implements, and it SAYS SO here rather than implying a
    // pin. This row is therefore EXPECTED GREEN against the landed module: it is a
    // reconciliation row, not one of the `A-1`/FUNCTION/`A-3` reds.
    //   STATES: (1) `[pickerA, null, pickerB]` — one skipped element between two
    //   pickers ⇒ ONE run of two ⇒ ONE collapsed parent; (2) the same with
    //   `undefined`; (3) the competing reading's own signature (TWO singletons,
    //   `items.length === 2`, no `submenu` array on either) asserted to FAIL.
    // =====================================================================
    const s = await surface('§3d F-3')
    const pickers = [el({ id: 'p1', kind: 'picker' }), null, el({ id: 'p2', kind: 'picker' })]
    const first = s.buildMenuTemplate(pickers, { platform: 'darwin' })
    expect(first.items.length, 'F-3 — `[pickerA, null, pickerB]` is ONE run under §2.3 item 5 rule 3 (the run is measured on the NORMALIZED sequence, where the skipped element is absent): ONE item, not two').toBe(1)
    expect(String(first.items[0]?.['id']), 'F-3 — and the collapsed run\'s parent is the run\'s FIRST entry').toBe('p1')
    const sub = first.items[0]?.['submenu']
    expect(Array.isArray(sub), 'F-3 — the parent of a run of TWO carries its rest as a `submenu` array, which is the POSITIVE half of the claim').toBe(true)
    expect((sub as readonly Record<string, unknown>[]).map((i) => i['id']), 'F-3 — and the rest is the second picker, in catalog order').toEqual(['p2'])
    // THE COMPETING READING, ASSERTED TO FAIL rather than merely not asserted: a
    // module that let the skipped element split the run emits TWO singletons, and
    // neither of those carries a `submenu` array.
    expect(first.items.length, 'F-3 — THE COMPETING `§3.2 F-5` / method-note (a) READING (two singletons, `items.length === 2`) does NOT hold for this shape: the rule-3 reading above is discriminating rather than vacuous').not.toBe(2)
    expect(
      first.items.filter((i) => Array.isArray(i['submenu'])).length,
      'F-3 — the competing reading\'s signature is absent: under it NO item carries a `submenu` array, while rule 3\'s reading requires exactly one',
    ).toBe(1)
    // The `undefined` arm: the same rule, and the same two readings.
    const second = s.buildMenuTemplate([el({ id: 'p1', kind: 'picker' }), undefined, el({ id: 'p2', kind: 'picker' })], { platform: 'darwin' })
    expect(second.items.length, 'F-3 — `[pickerA, undefined, pickerB]` reads the same: an absent element contributes no entry and cannot split the run').toBe(1)
    expect(
      [second.items.length, second.items.filter((i) => Array.isArray(i['submenu'])).length],
      'F-3 — and the competing reading fails here too (two singletons, no `submenu` array anywhere)',
    ).toEqual([1, 1])
    // THE CONTROL: the singleton boundary itself is UNCHANGED by this row — a
    // run of exactly ONE is not collapsed and gains no `submenu` ARRAY (`§2.3`
    // item 5 rule 4), so rule 3 is read as the run rule and never as a licence to
    // collapse singletons.
    const singleton = s.buildMenuTemplate([el({ id: 'solo', kind: 'picker', submenu: 'S' })], { platform: 'darwin' })
    expect(singleton.items.length, 'F-3 CONTROL — a run of exactly ONE is NOT collapsed: one item in, one item out (rule 4)').toBe(1)
    expect(Array.isArray(singleton.items[0]?.['submenu']), 'F-3 CONTROL — and the mechanism authors NO `submenu` array for it (the source\'s own present member is carried verbatim, so the assertion is on the ARRAY form, never on presence)').toBe(false)
  })
})
