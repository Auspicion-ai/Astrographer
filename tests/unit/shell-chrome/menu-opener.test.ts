// tests/unit/shell-chrome/menu-opener.test.ts — unit `U-4` `menu-opener`'s OWN ROW, authored
// BEFORE any byte of the change set moves (RCA-1) and RUN at the pre-edit head.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-u-4-menu-opener.md` §3 (the red set) — the SEVEN limbs
// `A`…`G` with their pinned sub-ids (`a1…a5`, `b1…b3`, `c1…c3`, `d1…d4`, `e1…e3`, `f1…f5`, `g1…g3`)
// — plus §2's six change rows (`R-1`…`R-6`) whose names/labels/keys are pinned NOW so this row can
// be written against a subject that does not exist yet. §4.1 is the app-gate answer; §8 is the
// census reading limb `B` re-reads.
//
// THE TARGET STATE these rows assert (contract §2, restated only as far as the row reads it):
//   · `src/main/app-menu.ts` exports `SETTINGS_OPENER_LABEL` and gains `AppMenuActions.openSettings`
//     (+ its no-op default); the View submenu becomes item 0 = the role-less opener
//     `{ label: SETTINGS_OPENER_LABEL, click: () => actions.openSettings() }` (own key set EXACTLY
//     `label`+`click` — no `role`, `type`, `accelerator`, `checked`, `submenu`) and item 1 = the
//     existing `Panes` item, byte-unchanged;
//   · `src/shared/types.ts` exports `IPC_SETTINGS_OPEN = 'provident:settings:open'`;
//   · `src/main/main.ts` broadcasts it at exactly ONE site, payload the literal `null`;
//   · `src/main/preload.ts` gains the TOP-LEVEL `ProvidentBridge` member
//     `onSettingsOpen(handler: () => void): () => void` over ONE `ipcRenderer.on(...)` whose
//     listener IGNORES the payload, returning `() => ipcRenderer.removeListener(<same channel>,
//     <same listener>)`;
//   · `src/renderer/renderer.ts` exports `MenuOpenerBridge`, `openSettingsOverlay(): boolean`
//     (idempotent OPEN — never a toggle; writes NO class; fires the toggle's own `click`) and
//     `installMenuOpener(bridge, opener = openSettingsOverlay): () => void` (subscribe EXACTLY once,
//     TOTAL/fail-soft), installed with ONE call in `main()` after `installSettingsModal()`.
//
// DECLARED COLOURS AT THIS HEAD (contract §3, declared NOW so a surprise is a FINDING, not a
// licence to edit the row):
//   `A` RED · `B`(b1 census) GREEN-ON-ARRIVAL, `B`(b2 existence) RED, `B`(b3 control) GREEN ·
//   `C` GREEN-ON-ARRIVAL with control `c3` · `D` RED · `E` RED · `F` RED · `G` GREEN-ON-ARRIVAL
//   with control `g3`.  Two sub-readings are declared GREEN-ON-ARRIVAL and are separable inside
//   their limb: `a4` (the fork's File/View enumeration must not be disturbed) stays green here and
//   contributes NO problem — so `A`'s red-set shows only `a1`/`a2`/`a3` (+ its positional note,
//   see the `a4(i)` comment: the `Panes` item is at index 0 until `R-1`'s insertion moves it).
//
// LAYER (MANDATORY, `D-10` / `RCA-12`): every limb here is `[T]`/ENVELOPE-class. The DOM subjects
// run under the LAYOUT-LESS `src/shared/dom-shim.ts`: no grid, no CSS resolution, no window, no
// paint, no real menu. **Nothing in this file is app-green, envelope-green-as-app or live-green.**
// THE NATIVE MENU BAR HAS NO DOM NODE AND NO CDP SURFACE, so the opener's chain is `G8`-PARKED per
// contract §4.1, never parked by default (RCA-11) and never claimed here: this row proves the
// template's SHAPE and role census (`A`/`B`), the channel's lockstep across types/main/preload
// (`D`), the subscription's declared shape (`E`), the handler's REACHABILITY and idempotence at the
// seam (`F`), and what the vendored menulib does with a role-less item (`C`/`G`). Nothing about a
// real OS menu click, a real `backend.broadcast` arrival, or a real document's class flip.
//
// WHAT THE HARNESS SUPPLIES, declared because it is the only affordance the shim does not own:
// THE TOGGLE'S `click()`. `ShimElement` has no `click` method (its documented surface is
// `dispatchPointer`/`querySelector`/`closest`/rects/capture), while `R-5` pins `openSettingsOverlay`
// firing "the toggle's own `click`" — the REAL DOM's method. So `authorModal()` installs a
// PER-INSTANCE `click` on that one `#settings-toggle` element (never a `dom-shim.ts` edit) that
// counts the call and forwards to the shim's own `toggle.dispatchPointer('click')`, which is the
// route the shim already documents for element listeners. Nothing else is fabricated.
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: no network, no electron spawn, no `git`, no writes (every
// subject is READ, every DOM subject is the shim's); no `vi.mock` in any form — the bridge doubles
// are plain objects handed to the REAL exported seam, so this file joins none of the protected mock
// censuses.
//
// REACHABILITY RULE (contract §3's last bullet): the subject does not exist at this head, so every
// module whose MEMBERS this unit adds is reached through a NAMESPACE probe (`readExport`/`readFn`)
// or a `try`-wrapped dynamic `import()` — a missing export, constant or member becomes a NAMED
// PROBLEM in its limb, never an ESM link error that kills the file. Every limb still reports.
//
// ONE DOCUMENTED DIVERGENCE, stated rather than guessed (contract §3 `d4`): §3's wording has the
// LITERAL `'provident:settings:open'` occurring in `types.ts` **and** `main.ts` **and** `preload.ts`,
// while `R-3`/`R-4` pin those two files importing the CONSTANT `IPC_SETTINGS_OPEN` ("one spelling,
// no second channel"). The two pins cannot both hold: a correct implementation references the name,
// never a second copy of the literal. Limb `d4` therefore reads the satisfiable form of the same
// claim — the literal is DEFINED exactly once (in `types.ts`) and occurs NOWHERE ELSE under `src/`,
// and the NAME is referenced in both consumers. The divergence is reported, not edited away.
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Namespace imports: a module whose MEMBERS this unit adds is probed, never destructured, so a
// member that does not exist yet answers `undefined` instead of failing the file at link time.
import * as appMenuModule from '../../../src/main/app-menu.js'
import * as vendoredMenulib from '../../../src/shared/menu-template.js'
// LANDED modules (never the subject of this unit's additions): the shim + PD-UI-6's modal wiring.
import { ShimElement, installShim } from '../../../src/shared/dom-shim.js'
import { installSettingsModal } from '../../../src/renderer/modal-state.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..', '..')
const SRC_ROOT = join(REPO_ROOT, 'src')
const SRC_MAIN = join(SRC_ROOT, 'main')
const APP_MENU_PATH = join(SRC_MAIN, 'app-menu.ts')
const TYPES_PATH = join(SRC_ROOT, 'shared', 'types.ts')
const MAIN_PATH = join(SRC_MAIN, 'main.ts')
const PRELOAD_PATH = join(SRC_MAIN, 'preload.ts')

/** The ONE channel spelling this row pins (§2 `R-2`). The row is not `src/**`, so carrying the
 *  literal here is the reading, not a second channel. */
const CHANNEL_LITERAL = 'provident:settings:open'

type AnyFn = (...args: unknown[]) => unknown

/** A NAMED reachability probe: an absent member answers `undefined`, never a link error. */
function readExport(mod: unknown, name: string): unknown {
  if (mod === null || (typeof mod !== 'object' && typeof mod !== 'function')) return undefined
  try {
    return (mod as Record<string, unknown>)[name]
  } catch {
    return undefined
  }
}

function readFn(mod: unknown, name: string): AnyFn | null {
  const value = readExport(mod, name)
  return typeof value === 'function' ? (value as AnyFn) : null
}

function isObj(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function own(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function show(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

/** THE COLLECTOR: each sub-limb returns `null` when its reading is clean and the problem TEXT when
 *  it is not; a throw before the reading completes is itself a named problem (a limb never dies
 *  silently). One aggregate assertion per `it` — `expect(problems, …).toEqual([])`. */
function attempt(problems: string[], tag: string, run: () => string | null): void {
  let reading: string | null
  try {
    reading = run()
  } catch (e) {
    problems.push(`${tag} — THREW before the reading completed: ${msg(e)}`)
    return
  }
  if (typeof reading === 'string' && reading !== '') problems.push(`${tag} — ${reading}`)
}

function readSrc(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), 'utf8')
}

function readPath(abs: string): string {
  return readFileSync(abs, 'utf8')
}

/** The corpus's comment stripper: a token in a COMMENT is prose (the implementation explains what
 *  it does NOT do), a token in CODE is the contract. */
function codeOnly(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n')
}

function walkFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkFiles(full))
    else if (entry.isFile() && /\.(ts|tsx|mts|cts|js|mjs|cjs|html)$/.test(entry.name)) out.push(full)
  }
  return out
}

function occurrences(text: string, needle: string): number {
  if (needle === '') return 0
  let n = 0
  let at = text.indexOf(needle)
  while (at >= 0) {
    n += 1
    at = text.indexOf(needle, at + needle.length)
  }
  return n
}

/** THE BALANCED-BLOCK READER — from `from`, the first `{` and its matching `}`. A TEXT oracle: the
 *  regions it is handed carry no unbalanced brace inside a string. */
function bracedBlock(text: string, from: number): string | null {
  const start = text.indexOf('{', from)
  if (start < 0) return null
  let depth = 0
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i]
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

/** The names imported by the `../shared/types.js` statement(s) of a source file (§2 `R-3`/`R-4`). */
function sharedTypesImports(code: string): string {
  const names: string[] = []
  for (const m of code.matchAll(/import\s*\{([^}]*)\}\s*from '\.\.\/shared\/types\.js'/g)) names.push(m[1] ?? '')
  return names.join(',')
}

// ===========================================================================
// THE TEMPLATE ORACLES — shared by limbs `A` and `B` (and the `b3`/`a4` controls).
// ===========================================================================

function templateOf(build: AnyFn, platform: string): unknown[] {
  const answer = build([], { platform })
  return Array.isArray(answer) ? (answer as unknown[]) : []
}

function menuByLabel(template: unknown[], label: string): Record<string, unknown> | null {
  for (const item of template) {
    if (isObj(item) && own(item, 'label') && item['label'] === label) return item
  }
  return null
}

function submenuOf(item: Record<string, unknown> | null): unknown[] | null {
  if (item === null) return null
  const sub = item['submenu']
  return Array.isArray(sub) ? (sub as unknown[]) : null
}

function viewItems(template: unknown[]): unknown[] | null {
  return submenuOf(menuByLabel(template, 'View'))
}

function item0OfView(template: unknown[]): Record<string, unknown> | null {
  const items = viewItems(template)
  const first = items?.[0]
  return isObj(first) ? first : null
}

/** The labels of the items that OWN a `label` — a `{ type: 'separator' }` item carries none and is
 *  therefore not a label (the head's File submenu is `Import…`, a separator, `Quit`). */
function labelsOf(items: unknown[]): string[] {
  const out: string[] = []
  for (const item of items) if (isObj(item) && own(item, 'label')) out.push(String(item['label']))
  return out
}

function topLevelLabels(template: unknown[]): string[] {
  return labelsOf(template)
}

/** THE ROLE CENSUS (§8.1, both readings): walk the whole template recursively and collect the
 *  `role` value of every object that owns an own `role` key. Functions are not objects here. */
function roleCensus(template: unknown[]): { roles: string[]; count: number } {
  const roles: string[] = []
  const step = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const element of value) step(element)
      return
    }
    if (value === null || typeof value !== 'object') return
    const rec = value as Record<string, unknown>
    if (own(rec, 'role')) roles.push(String(rec['role']))
    for (const key of Object.keys(rec)) step(rec[key])
  }
  step(template)
  return { roles, count: roles.length }
}

function cloneTemplate(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneTemplate)
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value as Record<string, unknown>)) {
      out[key] = cloneTemplate((value as Record<string, unknown>)[key])
    }
    return out
  }
  return value
}

// THE ARITHMETIC LABELS the head already builds (a4's pinned enumeration). The `…` is U+2026, the
// ONE ellipsis character `app-menu.ts` uses — spelled as an escape so no reader has to guess the
// encoding of this file.
const IMPORT_LABEL = 'Import\u2026'
const IMPORT_FOLDER_LABEL = 'Import folder\u2026'
const QUIT_LABEL = 'Quit'
const PANES_LABEL = 'Panes'

describe('U-4 `menu-opener` — docs/L1/unit-u-4-menu-opener.md §3, one `it` per limb', () => {
  // =========================================================================
  // Limb `A` — THE TEMPLATE SHAPE. Declared RED at this head (the opener does not exist).
  // =========================================================================
  it('A — the View opener is item 0, role-less, keyed exactly {label, click}, and routes to openSettings (declared RED)', () => {
    const problems: string[] = []
    const build = readFn(appMenuModule, 'buildMenuTemplate')
    if (build === null) {
      problems.push('A — `buildMenuTemplate` does not resolve on `src/main/app-menu.ts` (the GREEN-ON-ARRIVAL subject limb `C` pins) — every sub-limb below is unreadable')
    } else {
      // -- a1: the label is ONE exported constant, and the View submenu's item 0 carries it ------
      attempt(problems, 'a1', () => {
        const declared = readExport(appMenuModule, 'SETTINGS_OPENER_LABEL')
        const items = viewItems(templateOf(build, 'linux'))
        if (items === null) return 'the linux template carries no `View` menu with a `submenu` array — the opener has no site to read'
        const first = items[0]
        const reading = isObj(first) && own(first, 'label') ? show(first['label']) : String(first)
        if (typeof declared !== 'string') {
          return `\`SETTINGS_OPENER_LABEL\` does not resolve as a string export on \`src/main/app-menu.ts\` (§2 R-1 pins it as the ONE spelling limb \`A\` reads); for the reading, the View submenu carries ${items.length} item(s) and its item 0's label currently reads ${reading}`
        }
        if (!isObj(first)) return `the View submenu's item 0 is not an object (${reading})`
        if (first['label'] !== declared) {
          return `the View submenu's item 0 label reads ${reading}; it must equal \`SETTINGS_OPENER_LABEL\` (${show(declared)}) — the opener is the View submenu's FIRST item (§2 R-1)`
        }
        return null
      })

      // -- a2: the item's own key set is EXACTLY label+click, and the five forbidden keys are
      //        absent — each named, so an added one is reported by name -------------------------
      attempt(problems, 'a2', () => {
        const first = item0OfView(templateOf(build, 'linux'))
        if (first === null) return 'the View submenu carries no object at item 0 — there is no key set to read'
        const msgs: string[] = []
        const keys = Object.keys(first).sort()
        if (keys.length !== 2 || keys[0] !== 'click' || keys[1] !== 'label') {
          msgs.push(`its own enumerable key set reads ${show(keys)}; it must be exactly ["click","label"] (§2 R-1)`)
        }
        for (const forbidden of ['role', 'type', 'accelerator', 'checked', 'submenu']) {
          if (own(first, forbidden)) {
            msgs.push(`it carries \`${forbidden}\` (value ${show(first[forbidden])}), and the opener item must carry NO \`${forbidden}\` key at all (§2 R-1 / §1: a role would replace the authored click and claim an OS action; an accelerator would be an unreadable claim — ASM-U4-4)`)
          }
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })

      // -- a3: click is a function, and pressing it reaches actions.openSettings EXACTLY once
      //        while the three pre-existing actions fire ZERO times -----------------------------
      attempt(problems, 'a3', () => {
        const calls = { openImport: 0, openImportFolder: 0, togglePane: 0, openSettings: 0 }
        const actions = {
          openImport: (): void => {
            calls.openImport += 1
          },
          openImportFolder: (): void => {
            calls.openImportFolder += 1
          },
          togglePane: (): void => {
            calls.togglePane += 1
          },
          openSettings: (): void => {
            calls.openSettings += 1
          },
        }
        const answer = build([], { actions, platform: 'linux' })
        const template = Array.isArray(answer) ? (answer as unknown[]) : []
        const first = item0OfView(template)
        if (first === null) return 'the View submenu carries no object at item 0 — the click route cannot be pressed'
        const click = first['click']
        if (typeof click !== 'function') {
          return `the View submenu's item 0 owns no \`click\` function (its own key set is ${show(Object.keys(first).sort())}); §2 R-1 pins \`click: () => { actions.openSettings() }\`. The recording actions read ${show(calls)}`
        }
        try {
          ;(click as AnyFn)()
        } catch (e) {
          return `pressing the opener item's \`click\` THREW: ${msg(e)}`
        }
        const msgs: string[] = []
        if (calls.openSettings !== 1) {
          msgs.push(`\`actions.openSettings\` fired ${calls.openSettings} time(s); EXACTLY 1 is pinned (§2 R-1)`)
        }
        for (const other of ['openImport', 'openImportFolder', 'togglePane'] as const) {
          if (calls[other] !== 0) msgs.push(`\`actions.${other}\` fired ${calls[other]} time(s) from the OPENER's click; it must fire ZERO — the opener routes to \`openSettings\` only`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })

      // -- a4 (the ENUMERATION half, GREEN-ON-ARRIVAL, declared): the fork's File/View enumeration
      //        must not be disturbed, and `Panes` keeps `enabled: false` on an empty catalog (F2).
      //        At this head this contributes NO problem — it is the reading `R-1` must not move.
      attempt(problems, 'a4', () => {
        const msgs: string[] = []
        const linuxFile = submenuOf(menuByLabel(templateOf(build, 'linux'), 'File'))
        const darwinFile = submenuOf(menuByLabel(templateOf(build, 'darwin'), 'File'))
        const wantLinux = [IMPORT_LABEL, IMPORT_FOLDER_LABEL, QUIT_LABEL]
        const wantDarwin = [IMPORT_LABEL, QUIT_LABEL]
        if (linuxFile === null) msgs.push('the linux template carries no `File` submenu')
        else if (labelsOf(linuxFile).join('|') !== wantLinux.join('|')) {
          msgs.push(`the linux File submenu's labels read ${show(labelsOf(linuxFile))}; the fork's enumeration (F2, byte-unchanged) pins ${show(wantLinux)} — the separator owns no label and is not one`)
        }
        if (darwinFile === null) msgs.push('the darwin template carries no `File` submenu')
        else if (labelsOf(darwinFile).join('|') !== wantDarwin.join('|')) {
          msgs.push(`the darwin File submenu's labels read ${show(labelsOf(darwinFile))}; darwin emits exactly ONE \`Import…\` (W1-N2) and pins ${show(wantDarwin)}`)
        }
        const view = viewItems(templateOf(build, 'linux')) ?? []
        const panes = view.find((item) => isObj(item) && item['label'] === PANES_LABEL)
        if (!isObj(panes)) msgs.push(`the View submenu carries no \`${PANES_LABEL}\` item — it is the item §2 R-1 leaves unchanged`)
        else {
          if (panes['enabled'] !== false) msgs.push(`the \`${PANES_LABEL}\` item's \`enabled\` reads ${show(panes['enabled'])} on an EMPTY catalog; F2 pins \`false\` (never a fabricated list)`)
          const children = panes['submenu']
          if (!Array.isArray(children) || children.length !== 0) {
            msgs.push(`the \`${PANES_LABEL}\` item's submenu reads ${show(children)} on an empty catalog; F2 pins an EMPTY child list`)
          }
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })

      // -- a4(i) — THE POSITIONAL READING, and why it REDS at this head BY CONSTRUCTION: §3's `a4`
      //        also pins "View item 1 is the `Panes` item". Before `R-1`'s ONE insertion the View
      //        submenu holds ONE item, so `Panes` sits at index 0 — this reading cannot be green
      //        pre-edit, and it is reported as the insertion witness it is (a FINDING about the
      //        contract's GREEN-ON-ARRIVAL marker for `a4`, stated in the return, never edited away).
      attempt(problems, 'a4(i)', () => {
        const view = viewItems(templateOf(build, 'linux'))
        if (view === null) return 'the linux template carries no `View` submenu'
        const index = view.findIndex((item) => isObj(item) && item['label'] === PANES_LABEL)
        if (index === 1) return null
        return `the \`${PANES_LABEL}\` item sits at index ${index} in the View submenu (which carries ${view.length} item(s)); §2 R-1 inserts the opener FIRST, so this reading is RED at the pre-edit head BY CONSTRUCTION and GREEN-ON-ARRIVAL never applied to it — §3's \`a4\` declares the whole sub-limb green while this half cannot be`
      })

      // -- a5: the top-level labels, asserted by what `buildMenuTemplate` actually returns --------
      attempt(problems, 'a5', () => {
        const msgs: string[] = []
        const linux = templateOf(build, 'linux')
        const darwin = templateOf(build, 'darwin')
        if (topLevelLabels(linux).join('|') !== 'File|View') {
          msgs.push(`the linux template's top-level labels read ${show(topLevelLabels(linux))}; the fork's census (§8.1) pins ['File','View'] (2 menus)`)
        }
        if (topLevelLabels(darwin).join('|') !== 'File|View') {
          msgs.push(`the darwin template's top-level labels read ${show(topLevelLabels(darwin))}; §8.1 pins 3 top-level menus whose TWO labelled entries are ['File','View']`)
        }
        const leader = darwin[0]
        if (!isObj(leader) || leader['role'] !== 'appMenu') {
          msgs.push(`the darwin template's item 0 reads ${show(leader)}; F5 pins the \`{ role: 'appMenu' }\` app menu LEADING (no own \`label\`), so the labelled menus follow it`)
        } else {
          if (own(leader, 'label')) msgs.push(`the darwin app-menu entry carries an own \`label\` (${show(leader['label'])}); it leads by ROLE alone`)
          if (darwin.length !== 3) msgs.push(`the darwin template carries ${darwin.length} top-level entries; §8.1 pins 3 (the app menu + File + View)`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }
    expect(
      problems,
      '§3 limb `A` — the template shape (docs/L1/unit-u-4-menu-opener.md §3; declared RED at the pre-edit head, and `a4` is declared GREEN-ON-ARRIVAL so it contributes none of these)',
    ).toEqual([])
  })

  // =========================================================================
  // Limb `B` — THE ROLE CENSUS. `b1` GREEN-ON-ARRIVAL (declared), `b2` RED, `b3` the driven control.
  // =========================================================================
  it('B — the role census reads 1/2 and the opener adds NO role (b1 green-on-arrival, b2 declared RED, b3 the driven control)', () => {
    const problems: string[] = []
    const build = readFn(appMenuModule, 'buildMenuTemplate')
    if (build === null) {
      problems.push('B — `buildMenuTemplate` does not resolve on `src/main/app-menu.ts` — the census has no subject')
    } else {
      // -- b1: GREEN-ON-ARRIVAL BY CONSTRUCTION, and this is WHY: the oracle runs over the template
      //        the head already builds, and the only two objects in it that own a `role` are
      //        `{ role: 'appMenu' }` (darwin) and `{ label: 'Quit', role: 'quit' }` — neither of
      //        which `R-1` touches (it INSERTS one item into the View submenu). So this reading
      //        cannot fail at the pre-edit head and is not supposed to: it is the number the unit
      //        must NOT move, and `b2` is its tooth.
      attempt(problems, 'b1', () => {
        const msgs: string[] = []
        const linux = roleCensus(templateOf(build, 'linux'))
        const darwin = roleCensus(templateOf(build, 'darwin'))
        if (linux.count !== 1 || linux.roles.join('|') !== 'quit') {
          msgs.push(`the linux role census reads ${linux.count} (${show(linux.roles)}); §8.1's BEFORE reading pins 1 ('quit') — the fork uses exactly two roles and neither is the opener's`)
        }
        if (darwin.count !== 2 || darwin.roles.join('|') !== 'appMenu|quit') {
          msgs.push(`the darwin role census reads ${darwin.count} (${show(darwin.roles)}); §8.1's BEFORE reading pins 2 ('appMenu','quit')`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })

      // -- b2: RED. The census must STILL read 1/2 **and** the opener must EXIST at View item 0 and
      //        be absent from the role list — so a role-carrying opener reds here and an opener that
      //        does not exist reds here too (its absence at `a1` is the same fact, read by the label).
      attempt(problems, 'b2', () => {
        const msgs: string[] = []
        const declared = readExport(appMenuModule, 'SETTINGS_OPENER_LABEL')
        const linux = templateOf(build, 'linux')
        const darwin = templateOf(build, 'darwin')
        const first = item0OfView(linux)
        const openerExists = typeof declared === 'string' && first !== null && first['label'] === declared
        if (!openerExists) {
          const reading = first === null ? 'no object at item 0' : show(first['label'])
          msgs.push(`the View submenu carries NO opener item at item 0 (its item 0's label reads ${reading}), so §8.1's AFTER reading — "the role count does not move and the ITEM count does" — cannot be taken: the count cannot move before the item exists`)
        }
        const afterLinux = roleCensus(linux)
        const afterDarwin = roleCensus(darwin)
        if (afterLinux.count !== 1) {
          msgs.push(`the linux role census reads ${afterLinux.count} (${show(afterLinux.roles)}); it must stay 1 — a \`role\`-carrying opener reds HERE (§1: no Electron role opens this app's own overlay)`)
        }
        if (afterDarwin.count !== 2) {
          msgs.push(`the darwin role census reads ${afterDarwin.count} (${show(afterDarwin.roles)}); it must stay 2 — a \`role\`-carrying opener reds HERE`)
        }
        if (openerExists && first !== null && own(first, 'role')) {
          msgs.push(`the opener item owns a \`role\` (value ${show(first['role'])}); it must own NONE — the census may not gain a claim that the OS performs an action this app performs (§1, INV-U4)`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })

      // -- b3: THE DRIVEN FALSIFIER. The oracle is SHOWN to discriminate, never asserted to: a
      //        locally built `{ ...openerItem, role: 'viewMenu' }` spliced into a COPY of the
      //        template MUST be counted (2 on linux, 3 on darwin) and its role MUST be named. At
      //        this head the opener item does not exist yet, so the seed is a local stand-in — the
      //        control drives the ORACLE, which is what it is for.
      attempt(problems, 'b3', () => {
        const msgs: string[] = []
        const seed = item0OfView(templateOf(build, 'linux')) ?? { label: 'opener-absent-at-this-head', click: (): void => {} }
        const falsifier = { ...seed, role: 'viewMenu' }
        const splice = (platform: string): unknown[] | null => {
          const cloned = cloneTemplate(templateOf(build, platform)) as unknown[]
          const sub = submenuOf(menuByLabel(cloned, 'View'))
          if (sub === null) return null
          sub.push(falsifier)
          return cloned
        }
        const linuxMutant = splice('linux')
        if (linuxMutant === null) return 'CONTROL could not be driven: the cloned linux template carries no `View` submenu to splice into'
        const linuxCensus = roleCensus(linuxMutant)
        if (linuxCensus.count !== 2) {
          msgs.push(`CONTROL FAILED: with a role-carrying falsifier (\`role: 'viewMenu'\`) spliced into the View submenu the census reports ${linuxCensus.count} (${show(linuxCensus.roles)}); it MUST report 2 — the oracle does not discriminate and b1/b2 are dead readings`)
        }
        if (!linuxCensus.roles.includes('viewMenu')) {
          msgs.push(`CONTROL FAILED: the census did not NAME the spliced role — it reported ${show(linuxCensus.roles)}, so a role-carrying opener would not be named either`)
        }
        const darwinMutant = splice('darwin')
        if (darwinMutant === null) msgs.push('CONTROL could not be driven on darwin: the cloned template carries no `View` submenu')
        else {
          const darwinCensus = roleCensus(darwinMutant)
          if (darwinCensus.count !== 3) {
            msgs.push(`CONTROL FAILED: the same mutation on darwin reports ${darwinCensus.count} (${show(darwinCensus.roles)}); it MUST report 3`)
          }
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }
    expect(
      problems,
      '§3 limb `B` — the role census and the no-role claim (docs/L1/unit-u-4-menu-opener.md §3; `b1` is declared GREEN-ON-ARRIVAL and contributes none of these)',
    ).toEqual([])
  })

  // =========================================================================
  // Limb `C` — THE FORK'S ENUMERATION IS THE FORK'S. GREEN-ON-ARRIVAL, with its own control.
  // =========================================================================
  it('C — the fork keeps its own menu template and no src/main file references the vendored menulib (declared GREEN-ON-ARRIVAL, with control c3)', () => {
    const problems: string[] = []
    const MENULIB_NEEDLE = 'menu-template'

    /** THE TEXT ORACLE both `c1` and `c2` use — and the one `c3` hands a decoy. */
    const menulibReferences = (text: string): number => occurrences(text, MENULIB_NEEDLE)

    // -- c1: the four exports still resolve, and app-menu.ts's TEXT carries no menulib reference ---
    attempt(problems, 'c1', () => {
      const msgs: string[] = []
      for (const name of ['buildMenuTemplate', 'normalizePaneCatalog', 'orderPaneCatalog', 'importSelectionFromDialog']) {
        if (readFn(appMenuModule, name) === null) {
          msgs.push(`\`${name}\` does not resolve as a function export on \`src/main/app-menu.ts\` — the fork's own template/normalisation surface must stay its own`)
        }
      }
      const refs = menulibReferences(readPath(APP_MENU_PATH))
      if (refs > 0) {
        msgs.push(`\`src/main/app-menu.ts\` carries ${refs} reference(s) to \`${MENULIB_NEEDLE}\`; the fork's builder may not be the foundation's menulib (§1, SC-7 — the foundation's Electron menu template is NOT copied)`)
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    // -- c2: a read over EVERY file under src/main/ finds ZERO occurrences ------------------------
    attempt(problems, 'c2', () => {
      const walked = walkFiles(SRC_MAIN).map((file) => relative(REPO_ROOT, file))
      // NON-VACUITY: an empty or partial walk would make this limb green for the wrong reason, so
      // the walk must be shown to have covered the fork's own main surface.
      const mustRead = ['src/main/main.ts', 'src/main/app-menu.ts', 'src/main/preload.ts']
      const missing = mustRead.filter((rel) => !walked.includes(rel))
      if (walked.length === 0 || missing.length > 0) {
        return `the read under \`src/main/\` covered ${walked.length} file(s) and MISSED ${show(missing)}; an incomplete walk cannot certify "zero occurrences"`
      }
      const offenders: string[] = []
      for (const rel of walked) {
        const refs = menulibReferences(readPath(rel))
        if (refs > 0) offenders.push(`${rel} (${refs})`)
      }
      if (offenders.length > 0) {
        return `the vendored menulib is referenced under \`src/main/\`: ${offenders.join(', ')} — §2 C pins ZERO (the fork's enumeration is the fork's; the foundation's \`${MENULIB_NEEDLE}.ts\` stays unreferenced by \`src/main/**\`)`
      }
      return null
    })

    // -- c3: THE CONTROL that makes c1/c2 non-vacuous — the SAME oracle, handed a one-line DECOY
    //        carrying the forbidden import, MUST report the violation.
    //
    // THE DECOY IS A HARD-CODED LITERAL BY DESIGN — it MUST NOT be composed from `MENULIB_NEEDLE`
    // (finding `U4-B-1`; authority: contract §3 limb `C`, which pins "a one-line decoy copy of
    // `app-menu.ts` carrying `import { buildMenuTemplate } from '../shared/menu-template.js'`"). A
    // decoy built FROM the oracle's own needle moves with the needle, so a falsified needle (e.g.
    // `menu-templatx`) leaves this control green and it certifies NOTHING — exactly the vacuity
    // `U4-B-1` measured. The clean half is literal for the same reason, and both halves are asserted
    // so the oracle is shown to DISCRIMINATE rather than merely to match.
    attempt(problems, 'c3', () => {
      const DECOY_WITH_MENULIB = "import { buildMenuTemplate } from '../shared/menu-template.js'"
      const DECOY_CLEAN = "import type { PaneCatalogEntry } from '../shared/types.js'"
      const refs = menulibReferences(DECOY_WITH_MENULIB)
      if (refs < 1) {
        return 'CONTROL FAILED: the text oracle did not flag a decoy line carrying the forbidden `menu-template.js` import — `c1`/`c2` would be dead readings'
      }
      // …and the clean side of the same oracle, so the control is not one-sided: a line importing
      // something else must read zero (else the oracle flags everything and `c1`/`c2` could never be
      // green — a control that only ever fires is as dead as one that never does).
      const cleanRefs = menulibReferences(DECOY_CLEAN)
      if (cleanRefs !== 0) {
        return `CONTROL FAILED: the text oracle reports ${cleanRefs} reference(s) to \`${MENULIB_NEEDLE}\` in a clean import line (\`${DECOY_CLEAN}\`) — the oracle is not discriminating`
      }
      return null
    })

    expect(
      problems,
      '§3 limb `C` — the fork\'s enumeration is the fork\'s (docs/L1/unit-u-4-menu-opener.md §3; declared GREEN-ON-ARRIVAL at this head, with `c3` as its control)',
    ).toEqual([])
  })

  // =========================================================================
  // Limb `D` — THE CHANNEL'S LOCKSTEP. Declared RED.
  // =========================================================================
  it('D — IPC_SETTINGS_OPEN is one spelling across types/main/preload, broadcast ONCE with the literal null (declared RED)', async () => {
    const problems: string[] = []
    let typesModule: unknown = null
    try {
      typesModule = (await import('../../../src/shared/types.js')) as unknown
    } catch (e) {
      problems.push(`d1 — \`src/shared/types.ts\` did not load in the node realm: ${msg(e)}`)
    }

    // -- d1: the constant exists and its VALUE is the one literal (a missing export is a NAMED
    //        problem, never a link error — the module is reached through a namespace probe) ------
    attempt(problems, 'd1', () => {
      const value = readExport(typesModule, 'IPC_SETTINGS_OPEN')
      if (value === undefined) {
        return `\`IPC_SETTINGS_OPEN\` does not resolve as an export on \`src/shared/types.ts\` (§2 R-2 pins \`export const IPC_SETTINGS_OPEN = 'provident:settings:open'\`, main→renderer, one-way, manual-UI only)`
      }
      if (value !== CHANNEL_LITERAL) {
        return `\`IPC_SETTINGS_OPEN\` reads ${show(value)}; it must be exactly ${show(CHANNEL_LITERAL)} (§2 R-2)`
      }
      return null
    })

    // -- d2: main.ts imports the NAME and references it at exactly ONE broadcast site, whose second
    //        argument is the LITERAL null (the signal carries no data; no receipt is invented) ----
    attempt(problems, 'd2', () => {
      const code = codeOnly(readPath(MAIN_PATH))
      const msgs: string[] = []
      if (!sharedTypesImports(code).includes('IPC_SETTINGS_OPEN')) {
        msgs.push('`src/main/main.ts` does not import `IPC_SETTINGS_OPEN` from `../shared/types.js` (§2 R-3)')
      }
      const sites = [...code.matchAll(/broadcast\(\s*IPC_SETTINGS_OPEN\b/g)].length
      if (sites !== 1) {
        msgs.push(`\`src/main/main.ts\` references \`IPC_SETTINGS_OPEN\` at ${sites} \`broadcast(\` site(s); §2 R-3 pins EXACTLY ONE`)
      }
      if (!/broadcast\(\s*IPC_SETTINGS_OPEN\s*,\s*null\s*\)/.test(code)) {
        msgs.push('…and that site\'s second argument must be the LITERAL `null` — `backend.broadcast(IPC_SETTINGS_OPEN, null)`, the signal carries no data and writes no receipt (§2 R-3)')
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    // -- d3: preload.ts imports the NAME, and references it in exactly ONE ipcRenderer.on AND
    //        exactly ONE removeListener (the one-listener discipline) ---------------------------
    attempt(problems, 'd3', () => {
      const code = codeOnly(readPath(PRELOAD_PATH))
      const msgs: string[] = []
      if (!sharedTypesImports(code).includes('IPC_SETTINGS_OPEN')) {
        msgs.push('`src/main/preload.ts` does not import `IPC_SETTINGS_OPEN` from `../shared/types.js` (§2 R-4)')
      }
      const ons = [...code.matchAll(/ipcRenderer\.on\(\s*IPC_SETTINGS_OPEN\b/g)].length
      if (ons !== 1) msgs.push(`\`src/main/preload.ts\` subscribes on \`IPC_SETTINGS_OPEN\` at ${ons} \`ipcRenderer.on(\` site(s); §2 R-4 pins EXACTLY ONE`)
      const offs = [...code.matchAll(/removeListener\(\s*IPC_SETTINGS_OPEN\b/g)].length
      if (offs !== 1) msgs.push(`\`src/main/preload.ts\` detaches at ${offs} \`removeListener(\` site(s); §2 R-4 pins EXACTLY ONE, removing the SAME listener from the SAME channel`)
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    // -- d4: ONE spelling. The literal is DEFINED once (types.ts) and occurs NOWHERE ELSE under
    //        src/**; the NAME is referenced in both consumers. NOTE the divergence from §3's
    //        wording, argued in this file's header: under R-3/R-4 those two files reference the
    //        CONSTANT, never a second copy of the literal — so the satisfiable form of "one
    //        spelling, no second channel" is what is read here (count per file, offenders named).
    attempt(problems, 'd4', () => {
      const msgs: string[] = []
      const definitions: Array<{ file: string; count: number }> = []
      const strays: Array<{ file: string; count: number }> = []
      for (const file of walkFiles(SRC_ROOT)) {
        const rel = relative(REPO_ROOT, file)
        const count = occurrences(readPath(file), CHANNEL_LITERAL)
        if (count === 0) continue
        if (rel === relative(REPO_ROOT, TYPES_PATH)) definitions.push({ file: rel, count })
        else strays.push({ file: rel, count })
      }
      const defined = definitions[0]?.count ?? 0
      if (defined !== 1) {
        msgs.push(`the literal ${show(CHANNEL_LITERAL)} is DEFINED ${defined} time(s) in \`src/shared/types.ts\`; §2 R-2 pins exactly ONE definition there`)
      }
      if (strays.length > 0) {
        msgs.push(`the literal also occurs in ${strays.map((s) => `${s.file} (${s.count})`).join(', ')} — one spelling, no second channel (§2 R-2/d4); the consumers reference the CONSTANT`)
      }
      const mainCode = codeOnly(readPath(MAIN_PATH))
      const preloadCode = codeOnly(readPath(PRELOAD_PATH))
      if (occurrences(mainCode, 'IPC_SETTINGS_OPEN') === 0) {
        msgs.push('`src/main/main.ts` never references the NAME `IPC_SETTINGS_OPEN`, so the lockstep\'s main half does not exist')
      }
      if (occurrences(preloadCode, 'IPC_SETTINGS_OPEN') === 0) {
        msgs.push('`src/main/preload.ts` never references the NAME `IPC_SETTINGS_OPEN`, so the lockstep\'s preload half does not exist')
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(
      problems,
      '§3 limb `D` — the channel\'s lockstep (docs/L1/unit-u-4-menu-opener.md §3; declared RED at the pre-edit head; `d4` reads the satisfiable form of "one spelling" — see this file\'s header)',
    ).toEqual([])
  })

  // =========================================================================
  // Limb `E` — THE PRELOAD SUBSCRIPTION'S SHAPE. Declared RED, and a SOURCE READ by necessity:
  // `src/main/preload.ts` imports `electron` and is NOT loadable in the node realm, so its shape is
  // read from its own bytes and the BEHAVIOURAL half is limb `F`'s, at the seam.
  // =========================================================================
  it('E — ProvidentBridge declares onSettingsOpen at top level, its listener ignores the payload, and it removes the same listener (declared RED, source-read)', () => {
    const problems: string[] = []
    const raw = readPath(PRELOAD_PATH)
    const code = codeOnly(raw)

    // -- e1: a TWO-SPACE TOP-LEVEL `ProvidentBridge` member with the pinned signature ------------
    attempt(problems, 'e1', () => {
      const at = raw.indexOf('export interface ProvidentBridge {')
      if (at < 0) return '`src/main/preload.ts` declares no `export interface ProvidentBridge {` — §2 R-4\'s member has no site'
      const block = bracedBlock(raw, at)
      if (block === null) return 'the `ProvidentBridge` interface block did not close — the text oracle cannot read its members'
      const lines = block.split('\n')
      const topLevel = lines.filter((line) => /^ {2}onSettingsOpen\b/.test(line))
      const nested = lines.filter((line) => /^ {3,}onSettingsOpen\b/.test(line))
      const msgs: string[] = []
      if (topLevel.length === 0) {
        msgs.push(
          nested.length > 0
            ? `\`onSettingsOpen\` is declared at a NESTED indent (${show(String(nested[0]).trim())}); §2 R-4 pins a TWO-SPACE TOP-LEVEL \`ProvidentBridge\` member, beside \`onPaneVisibility\` (a native-menu arrival, top-level for the same reason — §5.2 row 4)`
            : 'the `ProvidentBridge` block declares no two-space TOP-LEVEL `onSettingsOpen` member (§2 R-4)',
        )
      } else {
        const want = 'onSettingsOpen(handler: () => void): () => void'
        const normalised = String(topLevel[0]).replace(/\s+/g, ' ').trim().replace(/;$/, '')
        if (normalised !== want) {
          msgs.push(`\`onSettingsOpen\` reads ${show(normalised)}; §2 R-4 pins ${show(want)} — an UNSUBSCRIBE, never \`void\``)
        }
        if (topLevel.length > 1) msgs.push(`\`onSettingsOpen\` is declared ${topLevel.length} times at top level; EXACTLY ONE member is pinned`)
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    /** The implementation body: the LAST `onSettingsOpen(` in the file (the interface precedes it,
     *  per §2 R-4's two sites), read as its balanced `{ … }`. Comments are stripped first, so a
     *  comment DESCRIBING the payload rule cannot trip the payload needles. */
    const implBlock = ((): string | null => {
      const at = code.lastIndexOf('  onSettingsOpen(')
      if (at < 0) return null
      return bracedBlock(code, at + '  onSettingsOpen('.length)
    })()

    // -- e2: the listener CALLS handler and reads NO payload member ------------------------------
    attempt(problems, 'e2', () => {
      if (implBlock === null) return 'no `onSettingsOpen` implementation body resolves in `src/main/preload.ts` (§2 R-4) — the listener\'s discipline cannot be read'
      const msgs: string[] = []
      if (!/handler\(\s*\)/.test(implBlock)) {
        msgs.push('the listener never calls `handler()` with NO argument; §2 R-4 pins a listener that IGNORES the payload and calls `handler()` — the signal carries no data (§2 R-2)')
      }
      for (const needle of ['payload', 'change', '.data', 'event.']) {
        if (implBlock.includes(needle)) {
          msgs.push(`the implementation reads a payload-ish member (\`${needle}\` appears in its body); the listener ignores the payload entirely (§2 R-4)`)
        }
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    // -- e3: the returned function removes the SAME listener from the SAME channel ----------------
    attempt(problems, 'e3', () => {
      if (implBlock === null) return 'no `onSettingsOpen` implementation body resolves in `src/main/preload.ts` (§2 R-4) — the unsubscribe cannot be read'
      const msgs: string[] = []
      const on = /ipcRenderer\.on\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/.exec(implBlock)
      const off = /removeListener\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/.exec(implBlock)
      if (on === null) msgs.push('the body carries no `ipcRenderer.on(<channel>, <listener>)` call (§2 R-4: EXACTLY ONE)')
      if (off === null) msgs.push('the body carries no `ipcRenderer.removeListener(<channel>, <listener>)` call — the returned function must DETACH')
      if (on !== null && off !== null) {
        const onChannel = String(on[1]).trim()
        const offChannel = String(off[1]).trim()
        const onListener = String(on[2]).trim()
        const offListener = String(off[2]).trim()
        if (onChannel !== 'IPC_SETTINGS_OPEN' || offChannel !== 'IPC_SETTINGS_OPEN') {
          msgs.push(`the subscription/detach channels read ${show(onChannel)} / ${show(offChannel)}; both must be \`IPC_SETTINGS_OPEN\``)
        }
        if (onListener !== offListener) {
          msgs.push(`\`removeListener\` removes ${show(offListener)} while \`on\` registered ${show(onListener)}; the SAME listener must be removed (the \`onPaneVisibility\` discipline, §2 R-4)`)
        }
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(
      problems,
      '§3 limb `E` — the preload subscription\'s shape (docs/L1/unit-u-4-menu-opener.md §3; declared RED; a SOURCE READ because `preload.ts` imports `electron` and is not loadable in the node realm — the behavioural half is limb `F`)',
    ).toEqual([])
  })

  // =========================================================================
  // Limb `F` — THE HANDLER'S REACHABILITY, BEHAVIOURAL, through the REAL exported seam.
  // =========================================================================
  it('F — installMenuOpener subscribes once and detaches, is TOTAL, and the default opener idempotently OPENS through the landed controller (declared RED)', async () => {
    const problems: string[] = []
    let rendererModule: unknown = null
    try {
      // The renderer is loaded HERE, before any shim exists, so the module's boot guard sees no
      // `document` (and a shim document's `readyState: 'loading'` would in any case register a
      // never-fired DOMContentLoaded listener instead of booting `main()`).
      rendererModule = (await import('../../../src/renderer/renderer.js')) as unknown
    } catch (e) {
      problems.push(`F — \`src/renderer/renderer.js\` did not load in the node realm: ${msg(e)}`)
    }
    const install = readFn(rendererModule, 'installMenuOpener')
    const openOverlay = readFn(rendererModule, 'openSettingsOverlay')

    /** THE BRIDGE DOUBLE — an event registry with its OWN delivery route, so "the returned
     *  unsubscribe detaches" is read through the bridge's delivery (a non-forwarding unsubscribe
     *  leaves the handler in `listeners` and the next `deliver()` fires the opener). */
    const bridgeDouble = (): { bridge: Record<string, unknown>; subscribeCalls: () => number; deliver: () => void; live: () => number } => {
      const listeners: Array<() => void> = []
      let subscribeCalls = 0
      const bridge: Record<string, unknown> = {
        onSettingsOpen(handler: () => void): () => void {
          subscribeCalls += 1
          listeners.push(handler)
          return (): void => {
            const at = listeners.indexOf(handler)
            if (at >= 0) listeners.splice(at, 1)
          }
        },
      }
      return {
        bridge,
        subscribeCalls: () => subscribeCalls,
        deliver: () => {
          for (const listener of [...listeners]) listener()
        },
        live: () => listeners.length,
      }
    }

    if (install === null) {
      problems.push('F — `installMenuOpener` does not resolve as a function export on `src/renderer/renderer.js` (§2 R-5) — `f1`/`f2`/`f3` have no seam to drive')
    } else {
      // -- f1: EXACTLY ONE subscription, and the returned unsubscribe DETACHES --------------------
      attempt(problems, 'f1', () => {
        const double = bridgeDouble()
        const fired = { n: 0 }
        const unsubscribe = install(double.bridge, () => {
          fired.n += 1
        })
        const msgs: string[] = []
        if (double.subscribeCalls() !== 1) {
          msgs.push(`\`installMenuOpener\` subscribed ${double.subscribeCalls()} time(s) through \`bridge.onSettingsOpen\`; EXACTLY ONE is pinned (§2 R-5)`)
        }
        if (typeof unsubscribe !== 'function') {
          msgs.push(`it answered ${typeof unsubscribe} where a CALLABLE unsubscribe is pinned (§2 R-5: the bridge's own unsubscribe, or a no-op)`)
          return msgs.join('; ')
        }
        double.deliver() // establishes the route is live before it is detached
        const beforeDetach = fired.n
        ;(unsubscribe as AnyFn)()
        double.deliver()
        if (fired.n !== beforeDetach) {
          msgs.push(`a bridge arrival AFTER the returned unsubscribe fired the opener ${fired.n - beforeDetach} more time(s); the returned unsubscribe MUST detach (§2 R-5)`)
        }
        if (double.live() !== 0) {
          msgs.push(`the bridge still holds ${double.live()} live listener(s) after the returned unsubscribe; it must detach`)
        }
        if (beforeDetach !== 1) {
          msgs.push(`the pre-detach arrival fired the opener ${beforeDetach} time(s); the route was never live, so the detach reading is vacuous`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })

      // -- f2: ONE arrival fires the opener EXACTLY once ------------------------------------------
      attempt(problems, 'f2', () => {
        const double = bridgeDouble()
        const fired = { n: 0 }
        install(double.bridge, () => {
          fired.n += 1
        })
        double.deliver()
        return fired.n === 1 ? null : `one bridge arrival fired the opener ${fired.n} time(s); EXACTLY 1 is pinned (§2 R-5)`
      })

      // -- f3: TOTAL / FAIL-SOFT — nothing propagates, every answer is a callable unsubscribe -----
      attempt(problems, 'f3', () => {
        const msgs: string[] = []
        const drives: Array<[string, () => unknown]> = [
          ['installMenuOpener(undefined)', () => install(undefined)],
          ['installMenuOpener(null)', () => install(null)],
          ['installMenuOpener({}) — no `onSettingsOpen` member', () => install({})],
          ['a bridge whose `onSettingsOpen` is not a function', () => install({ onSettingsOpen: 'not-a-function' })],
          [
            'a bridge whose `onSettingsOpen` THROWS',
            () =>
              install({
                onSettingsOpen: (): void => {
                  throw new Error('hostile subscribe')
                },
              }),
          ],
          ['a bridge whose `onSettingsOpen` answers NO unsubscribe', () => install({ onSettingsOpen: (): void => undefined })],
        ]
        for (const [label, drive] of drives) {
          let answer: unknown
          try {
            answer = drive()
          } catch (e) {
            msgs.push(`${label} PROPAGATED a throw (${msg(e)}); the seam is TOTAL and fail-soft (§2 R-5)`)
            continue
          }
          if (typeof answer !== 'function') {
            msgs.push(`${label} answered ${typeof answer} (${show(answer)}); it must answer a CALLABLE unsubscribe — a no-op is fine (§2 R-5)`)
          }
        }
        const double = bridgeDouble()
        try {
          install(double.bridge, () => {
            throw new Error('hostile opener')
          })
          double.deliver()
        } catch (e) {
          msgs.push(`a THROWING opener propagated out of the arrival route (${msg(e)}); each arrival is routed fail-soft (§2 R-5)`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    // ---- f4 / f4b / f5 — THE DEFAULT OPENER, against the shim's authored shell chrome ----

    /** A class-WRITE counter: the frame's `className` behind a counting accessor, so every reading
     *  below states a WRITE COUNT rather than only a value. */
    const countClassWrites = (el: ShimElement): (() => number) => {
      let writes = 0
      let backing = el.className
      Object.defineProperty(el, 'className', {
        configurable: true,
        get: () => backing,
        set: (value: string) => {
          writes += 1
          backing = value
        },
      })
      return () => writes
    }

    interface Authored {
      frame: ShimElement
      toggle: ShimElement
      scrim: ShimElement
      modalBody: ShimElement
      panes: ShimElement
      opPanes: ShimElement
      clicks: () => number
    }

    /** THE SHELL CHROME, modelled on `tests/pd-ui-6-modal-state-register.test.ts`'s `authorModal()`
     *  (the same five ids + the two operator mounts), with the ONE harness affordance this file's
     *  header declares: a PER-INSTANCE `click` on `#settings-toggle` that counts the call and
     *  forwards to the shim's own `dispatchPointer('click')` — `ShimElement` has no `click`, and
     *  `R-5` pins the opener firing the toggle's own `click` (the real DOM's method). */
    const authorModal = (): Authored => {
      const doc = (globalThis as unknown as { document: { body: ShimElement; getElementById(id: string): ShimElement } }).document
      const body = doc.body
      const layout = new ShimElement('div')
      const app = new ShimElement('div')
      app.id = 'app'
      body.appendChild(app)
      const panes = doc.getElementById('panes')
      const opPanes = doc.getElementById('operator-panes')
      body.appendChild(layout)
      layout.appendChild(panes)
      layout.appendChild(opPanes)
      const frame = doc.getElementById('settings-modal')
      frame.className = 'settings-modal is-closed'
      const scrim = doc.getElementById('settings-modal-scrim')
      const modalBody = doc.getElementById('settings-modal-body')
      const toggle = doc.getElementById('settings-toggle')
      frame.appendChild(scrim)
      frame.appendChild(modalBody)
      body.appendChild(frame)
      body.appendChild(toggle)
      let clicks = 0
      Object.defineProperty(toggle, 'click', {
        configurable: true,
        value: (): void => {
          clicks += 1
          toggle.dispatchPointer('click')
        },
      })
      return { frame, toggle, scrim, modalBody, panes, opPanes, clicks: () => clicks }
    }

    // -- f4: the DEFAULT opener + the LANDED `installSettingsModal()` — ONE open, ONE class write,
    //        and that write is the controller's mirror (f4b attributes it) ----------------------
    attempt(problems, 'f4', () => {
      if (openOverlay === null) {
        return '`openSettingsOverlay` does not resolve as a function export on `src/renderer/renderer.js` (§2 R-5) — the DEFAULT opener `installMenuOpener` installs cannot be driven'
      }
      installShim()
      const authored = authorModal()
      const writes = countClassWrites(authored.frame)
      installSettingsModal() // the LANDED controller + mirror (PD-UI-6)
      const atInstall = writes()
      let answer: unknown
      try {
        answer = openOverlay()
      } catch (e) {
        return `\`openSettingsOverlay()\` THREW (${msg(e)}); the opener never throws (§2 R-5)`
      }
      const msgs: string[] = []
      const clickCount = authored.clicks()
      const writeDelta = writes() - atInstall
      if (answer !== true) {
        msgs.push(`with the frame reading ${show('settings-modal is-closed')} the opener answered ${show(answer)}; it must answer \`true\` (§2 R-5)`)
      }
      if (clickCount !== 1) {
        msgs.push(`it fired the toggle's own \`click\` ${clickCount} time(s); EXACTLY 1 is pinned (§2 R-5: the seam is the LANDED affordance, never a second controller)`)
      }
      if (authored.frame.className !== 'settings-modal is-open') {
        msgs.push(`the frame's class reads ${show(authored.frame.className)}; the landed \`installSettingsModal()\` mirror must leave it exactly ${show('settings-modal is-open')}`)
      }
      if (writeDelta !== 1) {
        msgs.push(`the frame's class was written ${writeDelta} time(s) across the opener's route; EXACTLY 1 write is expected and it belongs to \`modal-state.ts\`'s mirror — \`f4b\` is the attribution control, and this path contributes ZERO`)
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    // -- f4b: THE ATTRIBUTION CONTROL. A FRESH shim document (so `installSettingsModal`'s
    //        per-document idempotence marker cannot carry over) with the modal wiring ABSENT: the
    //        same opener must still answer `true` and fire the click, while the frame's class stays
    //        UNCHANGED with ZERO writes — proving f4's flip belongs to `modal-state.ts`.
    attempt(problems, 'f4b', () => {
      if (openOverlay === null) return 'the attribution control cannot be driven: `openSettingsOverlay` does not resolve (§2 R-5)'
      installShim() // a fresh document object ⇒ a fresh per-document wiring marker
      const authored = authorModal()
      const writes = countClassWrites(authored.frame)
      const before = authored.frame.className
      // THE ISOLATION READING, so the control is never silently skipped: with the wiring NOT
      // installed, the fresh document's toggle must carry no `click` listener at all.
      const registered = (authored.toggle.listeners['click'] ?? []).length
      let answer: unknown
      try {
        answer = openOverlay() // `installSettingsModal()` DELIBERATELY NOT CALLED
      } catch (e) {
        return `\`openSettingsOverlay()\` THREW with the wiring absent (${msg(e)}); the opener never throws (§2 R-5)`
      }
      const msgs: string[] = []
      if (registered !== 0) {
        msgs.push(`ISOLATION FAILED: the fresh shim document's \`#settings-toggle\` already carries ${registered} \`click\` listener(s) although \`installSettingsModal()\` was never called on it — this control cannot attribute the flip`)
      }
      if (answer !== true) {
        msgs.push(`with the wiring absent the opener answered ${show(answer)}; it must still answer \`true\` (the frame is present and carries \`is-closed\`, so the affordance IS fired — R-5's only refusal arms are a missing \`document\`/element or an already-open frame)`)
      }
      if (authored.clicks() !== 1) {
        msgs.push(`with the wiring absent the opener fired the toggle's \`click\` ${authored.clicks()} time(s); EXACTLY 1 is pinned — the opener fires the affordance and owes the state nobody`)
      }
      if (writes() !== 0) {
        msgs.push(`ATTRIBUTION CONTROL FAILED: without \`installSettingsModal()\` the frame's class was written ${writes()} time(s) — the opener writes NO class, so the ONE write f4 reads belongs to \`modal-state.ts\` (§2 R-5/§2 R-6)`)
      }
      if (authored.frame.className !== before) {
        msgs.push(`the frame's class moved to ${show(authored.frame.className)} with NO wiring installed; this path writes no class (§2 R-5: the modal's state keeps ONE author)`)
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    // -- f5: IDEMPOTENCE — an already-OPEN overlay is left open, with no click and no write.
    //        The frame's class is set DIRECTLY: §2 R-5 pins the `is-open` TOKEN on the frame's class
    //        as the guard, so the controller's own word must not be what this reading depends on.
    attempt(problems, 'f5', () => {
      if (openOverlay === null) return 'the idempotence reading cannot be driven: `openSettingsOverlay` does not resolve (§2 R-5)'
      installShim()
      const authored = authorModal()
      const writes = countClassWrites(authored.frame)
      installSettingsModal()
      authored.frame.className = 'settings-modal is-open'
      const baseline = writes()
      let answer: unknown
      try {
        answer = openOverlay()
      } catch (e) {
        return `\`openSettingsOverlay()\` THREW on an already-open frame (${msg(e)}); the opener never throws (§2 R-5)`
      }
      const msgs: string[] = []
      if (answer !== false) {
        msgs.push(`with the frame already carrying the \`is-open\` TOKEN the opener answered ${show(answer)}; it must answer \`false\` — idempotent OPEN, never a toggle (§2 R-5 / ASM-U4-3)`)
      }
      if (authored.clicks() !== 0) {
        msgs.push(`it fired the toggle's \`click\` ${authored.clicks()} time(s) on an OPEN overlay; a toggle would have CLOSED the overlay the operator opened deliberately (§2 R-5)`)
      }
      if (writes() - baseline !== 0) {
        msgs.push(`it wrote the frame's class ${writes() - baseline} time(s) on the idempotent arm; the opener writes NOTHING (§2 R-5)`)
      }
      if (authored.frame.className !== 'settings-modal is-open') {
        msgs.push(`the frame's class reads ${show(authored.frame.className)}; it must be UNCHANGED`)
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(
      problems,
      '§3 limb `F` — the handler\'s reachability (docs/L1/unit-u-4-menu-opener.md §3; declared RED at the pre-edit head)',
    ).toEqual([])
  })

  // =========================================================================
  // Limb `G` — WHAT THE VENDORED MENULIB DOES WITH A ROLE-LESS ITEM. MEASURED, not assumed.
  // `src/shared/menu-template.ts` is one of the pin's fifteen: READ ONLY, never edited.
  // =========================================================================
  it('G — the vendored menulib fabricates no role and writes no receipt member (declared GREEN-ON-ARRIVAL, with control g3)', () => {
    const problems: string[] = []
    const normalizeCatalog = readFn(vendoredMenulib, 'normalizeCatalog')
    const menulibBuild = readFn(vendoredMenulib, 'buildMenuTemplate')
    if (normalizeCatalog === null || menulibBuild === null) {
      problems.push('G — `normalizeCatalog`/`buildMenuTemplate` do not both resolve on `src/shared/menu-template.ts` (the vendored menulib this limb MEASURES)')
    } else {
      // The item catalog MIRRORS the intended View submenu. The opener's `label` is deliberately a
      // neutral string, not the pinned spelling: `ASM-U4-5`/§2 R-1 make `SETTINGS_OPENER_LABEL` the
      // ONE spelling, and the menulib's projection is label-agnostic — a second copy here would buy
      // the reading nothing and spend the invariant.
      const OPENER_SHAPED = { label: 'opener-item-under-measurement', click: (): void => {} }
      const PANES_SHAPED = { label: PANES_LABEL, enabled: false, submenu: [] as unknown[] }

      // -- g1: the projected record owns NO `role` key AT ALL — the menulib does not fabricate one -
      attempt(problems, 'g1', () => {
        const msgs: string[] = []
        const carried = normalizeCatalog([OPENER_SHAPED, PANES_SHAPED])
        const carriedRecord = Array.isArray(carried) ? carried[0] : undefined
        if (!isObj(carriedRecord)) {
          msgs.push(`\`normalizeCatalog\` answered ${show(carried)} for the intended View catalog; item 0 must be a carried record`)
        } else if (own(carriedRecord, 'role') || 'role' in carriedRecord) {
          msgs.push(`\`normalizeCatalog\` gave the role-less opener a \`role\` key (value ${show(carriedRecord['role'])}); the menulib must carry only what the source owns`)
        }
        const answer = menulibBuild([OPENER_SHAPED, PANES_SHAPED], { platform: 'linux' })
        const items = isObj(answer) && Array.isArray(answer['items']) ? (answer['items'] as unknown[]) : null
        if (items === null) {
          msgs.push(`\`buildMenuTemplate\` answered ${show(answer)}; §2 G/g1 pins an answer carrying an \`items\` array`)
          return msgs.join('; ')
        }
        const projected = items[0]
        if (!isObj(projected)) {
          msgs.push(`the projected record for the opener reads ${show(projected)}; it must be an object`)
          return msgs.join('; ')
        }
        if (own(projected, 'role')) {
          msgs.push(`the PROJECTED record owns a \`role\` key (value ${show(projected['role'])}); the menulib does not fabricate one, and nothing on the fork's side may either`)
        }
        if ('role' in projected) {
          msgs.push('`\'role\' in projected` reads TRUE on the projected record; §2 G/g1 pins FALSE — neither an own nor an inherited role name exists')
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })

      // -- g2: the answer's own key set is EXACTLY items+platform — no receipt member -------------
      attempt(problems, 'g2', () => {
        const answer = menulibBuild([OPENER_SHAPED, PANES_SHAPED], { platform: 'linux' })
        if (!isObj(answer)) return `\`buildMenuTemplate\` answered ${show(answer)}; §2 G/g2 pins an object`
        const keys = Object.keys(answer).sort()
        if (keys.length !== 2 || keys[0] !== 'items' || keys[1] !== 'platform') {
          return `the answer's own enumerable key set reads ${show(keys)}; it must be exactly ["items","platform"] — the menulib writes NO receipt member (§2 G/g2)`
        }
        return null
      })

      // -- g3: THE CONTROL — an item that DOES own `role: 'quit'` must project a record that owns
      //        it, so g1's absence assertion is not a dead oracle.
      attempt(problems, 'g3', () => {
        const msgs: string[] = []
        const roleShaped = { label: QUIT_LABEL, role: 'quit' }
        const carried = normalizeCatalog([roleShaped])
        const carriedRecord = Array.isArray(carried) ? carried[0] : undefined
        if (!isObj(carriedRecord) || !own(carriedRecord, 'role') || carriedRecord['role'] !== 'quit') {
          msgs.push(`CONTROL FAILED: \`normalizeCatalog\` dropped an OWNED \`role: 'quit'\` (it answered ${show(carried)}) — the absence assertion in g1 would be a dead oracle`)
        }
        const answer = menulibBuild([roleShaped], { platform: 'linux' })
        const items = isObj(answer) && Array.isArray(answer['items']) ? (answer['items'] as unknown[]) : []
        const projected = items[0]
        if (!isObj(projected) || !own(projected, 'role') || projected['role'] !== 'quit') {
          msgs.push(`CONTROL FAILED: the projection dropped an OWNED \`role\` (it answered ${show(projected)}) — g1's absence assertion cannot discriminate`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }
    expect(
      problems,
      '§3 limb `G` — what the vendored menulib does with a role-less item (docs/L1/unit-u-4-menu-opener.md §3; declared GREEN-ON-ARRIVAL at this head, with `g3` as its control; `src/shared/menu-template.ts` is READ ONLY)',
    ).toEqual([])
  })

})
