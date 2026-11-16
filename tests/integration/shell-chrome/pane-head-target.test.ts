// tests/integration/shell-chrome/pane-head-target.test.ts — unit `U-2` `pane-head`'s OWN ROW, authored
// BEFORE any byte of the control bar / head-out-of-scroller / one-leaf collapse / head minimum /
// gutter pill moves (RCA-1) and RUN at the pre-edit head.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-u-2-pane-head.md` §3 (the red set) — the NINE limbs
// `A`…`I`, each sub-arm letter cited — and NOTHING ELSE. §2 is the change set (`C-1`…`C-7`) these
// limbs pin; §6 is the assumption set they read (`ASM-U2-1` no per-pane figure, `ASM-U2-2` the
// collapsed body's CONTENT withheld while the body NODE stays, `ASM-U2-3` the axis split is a total
// pure helper, `ASM-U2-6` the pill's ink derived and opaque, `ASM-U2-7` no `position: sticky`).
//
// THE NINE LIMBS AND THE COLOUR EACH READ AT THE PRE-EDIT HEAD (kept: the RED set the unit was
// authored against is part of the record): `A` bar RED (no head row/grip/drops/body node); `B`
// one-leaf RED via the absent `setPaneCollapsed` export + the inline flip + the `data-pane-id`
// address, its HOST-drive arms GREEN already and said so, not hidden; `C` `panePaintAxesOf` RED
// (helper absent), its swapped-map falsifier GREEN and keeping the comparator honest; `D` the head
// out of the scroller RED (the structural half is read off `A`); `E` relocation survival MIXED BY
// CONSTRUCTION — (e2) GREEN on first write (`movePane` spreads `...p`), (e1) RED; `F` the minimum
// RED via (f1b)/(f2), (f1a) GREEN and kept; `G` the gutter pill RED via (g1)/(g2)/(g3), (g4)/(g5)
// GREEN; `H` vocabulary RED; `I` its NEGATIVE half GREEN today, its POSITIVE half RED (§3 calls
// `I` "green today", which can only hold for the negative half — reported, never papered over).
//
// THE TWO REPAIRS (a green that cannot fail is a DEFECT IN THE BATTERY, not a success):
//   · `F`/(f2) had no PRESENCE tooth: it gathered the collapsed `auto` arms and asserted `.some(…)`.
//     MEASURED PRE-REPAIR: deleting BOTH mandated `[data-orientation]` arms from the sheet left
//     every limb of this file unchanged (F stayed GREEN) — the `:not([zone] *)` stage arm alone
//     satisfied the `.some`. (f2) now grades PRESENCE per orientation key (a missing arm reds BY
//     KEY) AND AGREEMENT: each arm's `auto` axis must be the member `panePaintAxesOf(zone)` names
//     for that orientation — the sheet and the helper are two copies of ONE axis split, and their
//     drift now reds. TWO NAMED mutations must red it: a DELETED arm and SWAPPED axes.
//   · `G`/(g3)'s second falsifier was DEAD CODE: `if (equalRatio < equalRatio)` compares an
//     expression with ITSELF and can never fire (MEASURED at the old line 1710: it proved nothing).
//     Now the sheet's own two inks are MUTATED in a copy of its text — an EQUAL-ink pill and an
//     INVERTED-ink pill must EACH hand back the named `quieter-than` violation — while the landed
//     sheet (the pill's ratio strictly BELOW the line's) stays the green half; no source is written.
//
// LAYER (MANDATORY, `D-10` / `RCA-12`): every limb is ENVELOPE-class. `A`/`E`/`H` drive the fork's
// REAL assembler over a REAL `PaneRegistry`; `B` drives the REAL `SidebarPanes` over the layout-less
// DOM shim and the authored handler body in a parameter sandbox; `C` is a pure function; `D`/`F`/`G`/
// `I` are SOURCE clauses over a file's TEXT and say so. NO limb claims a painted fact. What this file
// canNOT supply, named so nobody quotes it: the column/head-out-of-scroller GEOMETRY, the collapsed
// box being the head only, the `auto`/`hidden` PAINT, the glyph, the control-never-arms-a-drag rule,
// the head's `min-content` floor under a squeezed zone, the pill's box/ink/lane-hit — all `G8`-only.
//
// THE REACHABILITY RULE: the two names this unit ADDS — `setPaneCollapsed` (`pane-drag.ts`) and
// `panePaintAxesOf` (`pane-graph.ts`) — are reached through `await import(...)` and read with a TYPE
// check first (`readExport`), so a missing export is a NAMED problem in the limb's aggregate
// assertion and never an ESM link error, a crash or a skipped arm: the file always COLLECTS and
// RUNS, and every limb reports ALL its sub-arms in one `expect(problems, '<letter + subject + §>')`.
//
// SHAPE ADJUSTMENTS (declared; each limb keeps §3's subject): (1) `panePaintAxesOf` answers
// `{ fill, adjustable, scroll }`, and the ZONE-LESS arm answers `'both'` in BOTH members with
// `scroll: null` ("both members adjustable" is only a value of that domain if it is spelled so).
// (2) §3 calls the five arms "pairwise distinct" but `left`/`right` are the SAME map BY CONTRACT, so
// `C` grades the five inputs as a PARTITION into three non-coinciding classes — membership named —
// plus a compass-swapped falsifier that must red.
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`; it writes
// nothing. Every path derives from THIS file's own location (`ROOT`), so a missing substrate FAILS
// (ENOENT) instead of skipping, and each census carries a non-vacuity floor so no negative limb can
// pass by being blind.
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  coerceLayout,
  defaultLayout,
  type LayoutState,
  type LayoutZoneName,
} from '../../../src/renderer/layout-state.js'
import { assembleAppGraphEnvelope } from '../../../src/renderer/pane-graph.js'
import { createPaneRegistry } from '../../../src/renderer/pane-registry.js'
import { movePane, zoneOrientation } from '../../../src/renderer/pane-drag.js'
import { SidebarPanes } from '../../../src/renderer/sidebar-panes.js'
import { installShim, ShimElement } from '../../../src/shared/dom-shim.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

const CLOSED_ZONES = ['left', 'right', 'top', 'bottom'] as const
type Zone = (typeof CLOSED_ZONES)[number]

/** The five foundation CLASSES `D-14` moves the vocabulary to (`§2` `C-1`), as authored literals. */
const FOUNDATION_CLASSES = ['pane-head', 'pane-grab', 'pane-drop', 'pane-collapse', 'pane-body'] as const

/** The pane-id PREFIXES `§2` `C-1`/`ASM-U2-4` adds to the fork's id family (ids stay the fork's). */
const AUTHORED_ID_PREFIXES = ['pane-head-', 'pane-grab-', 'pane-collapse-', 'pane-body-'] as const

/** The SUPERSEDED class (`D-14`'s superseded spelling of the pane control, `§2` `C-5`), spelled
 *  from PARTS so this row can FORBID it without CARRYING it: `H` requires it to be absent from
 *  `src/**`, `index.html` and `scripts/**`, and this file must stay quotable if that corpus is
 *  ever widened to `tests/**`. */
const SUPERSEDED_HEADER_CLASS = ['pane-collapse', 'toggle'].join('-')

const SRC_ROOT = `${ROOT}src`
const SCRIPTS_ROOT = `${ROOT}scripts`
const INDEX_HTML = 'src/renderer/index.html'
const WALKABLE = /\.(ts|tsx|mts|cts|js|mjs|cjs|html|css)$/
const TYPESCRIPT = /\.ts$/

function walkFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`
    if (entry.isDirectory()) out.push(...walkFiles(path))
    else if (WALKABLE.test(entry.name)) out.push(path)
  }
  return out
}

const SRC_FILES = walkFiles(SRC_ROOT)
const SCRIPT_FILES = walkFiles(SCRIPTS_ROOT)

interface Reading {
  file: string
  line: number
  text: string
}

/** Every LINE of every walked file matching `pattern`, with the repo-relative file, the 1-based
 *  line number and the trimmed source — the reading a failure message prints. */
function readings(paths: readonly string[], pattern: RegExp): Reading[] {
  const global = new RegExp(pattern.source, `${pattern.flags.replace('g', '')}g`)
  const out: Reading[] = []
  for (const path of paths) {
    const file = path.startsWith(ROOT) ? relative(ROOT, path) : path
    const lines = readText(file).split('\n')
    for (let index = 0; index < lines.length; index++) {
      const text = lines[index]!
      global.lastIndex = 0
      if (global.test(text)) out.push({ file, line: index + 1, text: text.trim().slice(0, 160) })
    }
  }
  return out
}

function format(rs: readonly Reading[]): string {
  if (rs.length === 0) return '0'
  const head = rs
    .slice(0, 6)
    .map((r) => `${r.file}:${r.line}: ${r.text}`)
    .join(' | ')
  return `${rs.length}: ${head}${rs.length > 6 ? ` | … (${rs.length - 6} more)` : ''}`
}

// ---------------------------------------------------------------------------
// THE EXPORT READING — non-fatal by design: a missing export is a NAMED problem in the limb's
// aggregate assertion, never a module-load error and never a raw `TypeError`.
// ---------------------------------------------------------------------------
type AnyFn = (...args: never[]) => unknown

interface ExportReading {
  value: unknown
  problems: string[]
}

function readExport(mod: Record<string, unknown>, name: string, file: string, limb: string): ExportReading {
  const value = mod[name]
  if (typeof value !== 'function') {
    return {
      value,
      problems: [
        `limb ${limb}: \`${name}\` is NOT a function on ${file} (typeof read: ${typeof value}) — the export this limb pins does not exist at this head, so the limb's subject is ABSENT`,
      ],
    }
  }
  return { value, problems: [] }
}

function readConstant(mod: Record<string, unknown>, name: string, file: string, limb: string): ExportReading {
  const value = mod[name]
  if (typeof value !== 'string' || value === '') {
    return {
      value,
      problems: [`limb ${limb}: \`${name}\` is not a non-empty string on ${file} (typeof read: ${typeof value})`],
    }
  }
  return { value, problems: [] }
}

// ---------------------------------------------------------------------------
// THE ASSEMBLED-ENVELOPE DRIVE (`A`, `E`, `H`) — the fork's REAL `assembleAppGraphEnvelope` over a
// minimal traversal envelope, a real `PaneRegistry` and a synthesized context. The SAME call shape
// the module's previous unit row uses; no second harness is invented.
// ---------------------------------------------------------------------------
interface AssembledNode {
  type?: unknown
  props?: Record<string, unknown>
  css?: { classes?: unknown; style?: unknown }
  content?: unknown
  children?: unknown[]
  handlers?: Array<{ name?: unknown; event?: unknown; body?: unknown }>
  placement?: { placementName?: unknown; targetPlacement?: unknown }
}

interface PaneSpec {
  id: string
  zone: Zone
  title?: string
  collapsed?: boolean
}

interface Assembly {
  envelope: unknown
  /** every authored pane FRAME in the envelope's `content` payloads, in payload order */
  frames: AssembledNode[]
  layout: LayoutState
  registry: ReturnType<typeof createPaneRegistry>
}

function assemble(input: { panes?: PaneSpec[]; layout?: LayoutState }): Assembly {
  const specs = input.panes ?? []
  const registry = createPaneRegistry()
  for (const pane of specs) {
    registry.register({
      id: pane.id,
      title: pane.title ?? pane.id,
      scope: 'app-graph',
      defaultZone: pane.zone,
      render: () => ({ type: 'div', props: { id: `${pane.id}-render-root`, class: 'probe-body-root' }, content: 'body' }),
    })
    registry.enable(pane.id)
  }
  const declared = input.layout
  const layout: LayoutState =
    declared ??
    {
      ...defaultLayout(),
      panes: specs.map((pane, index) => ({
        id: pane.id,
        zone: pane.zone,
        index,
        collapsed: pane.collapsed === true,
      })),
    }
  const traversalEnvelope = {
    template: { root: { type: 'div', props: { id: 'wiki-root' }, children: [] } },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
  const ctx: Record<string, unknown> = {
    snapshot: null,
    docHeads: null,
    currentDocumentId: null,
    currentNodeId: null,
    backRefs: new Map<string, string[]>(),
    crosslinks: [],
  }
  const assembled = assembleAppGraphEnvelope({
    traversalEnvelope: traversalEnvelope as never,
    registry,
    ctx: ctx as never,
    layout,
  })
  return { envelope: assembled.envelope, frames: paneFrames(assembled.envelope), layout, registry }
}

const propIdOf = (node: AssembledNode | undefined): string =>
  typeof node?.props?.['id'] === 'string' ? (node.props['id'] as string) : ''

const propText = (node: AssembledNode | undefined, key: string): string => {
  const value = node?.props?.[key]
  return typeof value === 'string' ? value : ''
}

/** A prop value as a failure message prints it: a quoted string, or an explicit `(absent)` so a
 *  missing operand is never mistaken for an empty one. */
const shown = (text: string): string => (text === '' ? '(absent)' : JSON.stringify(text))

const ownsProp = (node: AssembledNode | undefined, key: string): boolean =>
  node != null && Object.prototype.hasOwnProperty.call(node.props ?? {}, key)

const classesOf = (node: AssembledNode | undefined): string[] => {
  const classes = node?.css?.classes
  return Array.isArray(classes) ? classes.map(String) : []
}

const childrenOf = (node: AssembledNode | undefined): AssembledNode[] =>
  Array.isArray(node?.children) ? (node.children as AssembledNode[]) : []

/** The node's OWN descendants (breadth-first, the node itself NEVER included). */
function descendants(node: AssembledNode | undefined): AssembledNode[] {
  const out: AssembledNode[] = []
  const queue = [...childrenOf(node)]
  while (queue.length > 0) {
    const next = queue.shift()!
    if (next == null || typeof next !== 'object') continue
    out.push(next)
    queue.push(...childrenOf(next))
  }
  return out
}

/** Every authored pane FRAME in the envelope: payload roots whose `.pane-frame` class or whose
 *  `pane-<id>` root id is accompanied by the pane's own `data-pane-id` (`A'` of the sibling row's
 *  reading). The collapse control is EXCLUDED — it carries the same `data-pane-id` and is not a
 *  frame. */
function paneFrames(envelope: unknown): AssembledNode[] {
  const out: AssembledNode[] = []
  const payloads = (envelope as { content?: unknown } | null | undefined)?.content
  if (!Array.isArray(payloads)) return out
  const visit = (nodes: unknown): void => {
    if (!Array.isArray(nodes)) return
    for (const raw of nodes as AssembledNode[]) {
      if (raw == null || typeof raw !== 'object') continue
      const id = propIdOf(raw)
      const paneId = propText(raw, 'data-pane-id')
      if (classesOf(raw).includes('pane-frame') || (id.startsWith('pane-') && !id.startsWith('pane-collapse-') && paneId !== '')) {
        out.push(raw)
        continue
      }
      visit(raw.children)
    }
  }
  for (const payload of payloads) visit((payload as { content?: unknown } | null | undefined)?.content)
  return out
}

const frameFor = (frames: readonly AssembledNode[], paneId: string): AssembledNode | undefined =>
  frames.find((frame) => propText(frame, 'data-pane-id') === paneId)

/** A one-line census of a frame's children — what a failure message prints so a red is diagnosable. */
const skeleton = (frame: AssembledNode | undefined): string =>
  frame === undefined
    ? '(no frame)'
    : `[${childrenOf(frame)
        .map((child) => `${propIdOf(child) || '(no id)'}${classesOf(child).length > 0 ? `.${classesOf(child).join('.')}` : ''}`)
        .join(', ')}]`

function findNode(nodes: readonly AssembledNode[], id: string): AssembledNode | undefined {
  return nodes.find((node) => propIdOf(node) === id)
}

/** The pane's authored TITLE comes from the real registry definition (`A`/`a3`), never the id. */
const titleOf = (registry: ReturnType<typeof createPaneRegistry>, paneId: string): string =>
  registry.get(paneId)?.title ?? ''

// ---------------------------------------------------------------------------
// THE SOURCE READERS (`D`, `F`, `G`, `I`) — a rule/theme/colour parser over a file's TEXT. Nothing
// here resolves the cascade: a rule is a selector string and a declaration body, and every
// assertion below is about what the FILE SAYS, never about what a browser would paint.
// ---------------------------------------------------------------------------
interface CssRule {
  selector: string
  body: string
  line: number
}

const stripComments = (src: string): string => src.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))

/** Every TOP-LEVEL `selector { body }` pair of the stylesheet, in source order, with its 1-based
 *  line. At-rules (`@media`) are returned as their own block, whose nested rules are NOT
 *  enumerated — the theme reader below reads those bodies directly. */
function cssRules(src: string): CssRule[] {
  const text = stripComments(src)
  const out: CssRule[] = []
  let cursor = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{') continue
    const selector = text.slice(cursor, i).trim()
    let depth = 0
    let close = -1
    for (let j = i; j < text.length; j++) {
      if (text[j] === '{') depth += 1
      else if (text[j] === '}') {
        depth -= 1
        if (depth === 0) {
          close = j
          break
        }
      }
    }
    if (close < 0) break
    out.push({ selector, body: text.slice(i + 1, close), line: text.slice(0, i).split('\n').length })
    cursor = close + 1
    i = close
  }
  return out
}

/** The declaration TEXT of every rule whose selector matches `pattern`. */
function ruleBodies(src: string, pattern: RegExp): CssRule[] {
  return cssRules(src).filter((rule) => pattern.test(rule.selector))
}

/** The value of the FIRST of `props` declared in `body`, or `null` when none is declared. */
function declOf(body: string, props: readonly string[]): { prop: string; value: string } | null {
  for (const prop of props) {
    const match = new RegExp(`(?:^|[;{\\s])${prop}\\s*:\\s*([^;}]+)`).exec(body)
    if (match !== null) return { prop, value: match[1]!.trim() }
  }
  return null
}

const QUANTITY = /\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|ch|ex)/

/** The EXTENT properties a pane/head box may not fix with a figure (the adjustable and fill axes,
 *  plus `flex-basis`). `padding`, `gap` and the like are deliberately NOT read: they are not an
 *  extent, and this limb grades "the minimum is the content", not every length in the block. */
const EXTENT_PROPS = ['height', 'width', 'min-height', 'min-width', 'max-height', 'max-width', 'flex-basis'] as const

function extentFigure(body: string): string | null {
  for (const prop of EXTENT_PROPS) {
    const declared = declOf(body, [prop])
    if (declared !== null && QUANTITY.test(declared.value)) return `${prop}: ${declared.value}`
  }
  const flex = declOf(body, ['flex'])
  if (flex !== null && QUANTITY.test(flex.value)) return `flex: ${flex.value}`
  return null
}

/** The `<style>` sheet's rules, once per test — the file is read on demand, so a missing file
 *  FAILS the limb instead of breaking collection. */
const indexRules = (): CssRule[] => cssRules(readText(INDEX_HTML))

/** A rule is a PANE-BLOCK rule when its selector names one of the pane family's five classes. */
const PANE_FAMILY = /\.pane-(?:frame|head|grab|drop|collapse|body)(?![\w-])/

const paneFamilyRules = (rules: readonly CssRule[]): CssRule[] =>
  rules.filter((rule) => PANE_FAMILY.test(rule.selector) || /pane-(?:head|body|grab|drop)-/.test(rule.selector))

// ---------------------------------------------------------------------------
// THE THEME / COLOUR READER (`G`/`g3`, `g4`) — the WCAG ratio is COMPUTED from the hex literals the
// three theme blocks declare. No taste claim, no hard-coded ink.
// ---------------------------------------------------------------------------
type Decls = Record<string, string>

interface ThemeBlocks {
  light: Decls
  dark: Decls
  media: Decls
}

function bodyAfter(src: string, pattern: RegExp): string {
  const match = pattern.exec(src)
  if (match === null) return ''
  const open = src.indexOf('{', match.index)
  if (open < 0) return ''
  let depth = 0
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth += 1
    else if (src[i] === '}') {
      depth -= 1
      if (depth === 0) return src.slice(open + 1, i)
    }
  }
  return ''
}

function themeBlocks(src: string): ThemeBlocks {
  const text = stripComments(src)
  const declsOf = (body: string): Decls => {
    const out: Decls = {}
    for (const match of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/g)) out[match[1]!] = match[2]!.trim()
    return out
  }
  return {
    light: declsOf(bodyAfter(text, /html\[theme='light'\]/)),
    dark: declsOf(bodyAfter(text, /html\[theme='dark'\]/)),
    media: declsOf(bodyAfter(text, /@media\s*\(prefers-color-scheme:\s*dark\)/)),
  }
}

/** The `G-5` fifteen-token census (`D-285`/`D-6`), pinned as a LITERAL list so an ADDITION inside
 *  a theme block cannot pass by being consistent with itself. */
const G5_TOKENS = [
  '--accent',
  '--bg',
  '--border',
  '--border-strong',
  '--card-bg',
  '--error',
  '--fg',
  '--hover',
  '--input-bg',
  '--input-border',
  '--input-fg',
  '--muted',
  '--muted-2',
  '--muted-3',
  '--muted-4',
].sort()

interface Rgb {
  r: number
  g: number
  b: number
  a: number
}

function parseHexColor(text: string): Rgb | null {
  const match = /^#([0-9a-f]{3,8})$/i.exec(text.trim())
  if (match === null) return null
  const hex = match[1]!
  const expand = (part: string): number => parseInt(part.length === 1 ? part + part : part, 16)
  if (hex.length === 3 || hex.length === 4) {
    return { r: expand(hex[0]!), g: expand(hex[1]!), b: expand(hex[2]!), a: hex.length === 4 ? expand(hex[3]!) / 255 : 1 }
  }
  if (hex.length === 6 || hex.length === 8) {
    return {
      r: expand(hex.slice(0, 2)),
      g: expand(hex.slice(2, 4)),
      b: expand(hex.slice(4, 6)),
      a: hex.length === 8 ? expand(hex.slice(6, 8)) / 255 : 1,
    }
  }
  return null
}

/** Resolve a declared VALUE against ONE theme block's literals: a bare hex, `var(--tok)`, or a
 *  `color-mix(in srgb, <color> N%, <color> M%)`. `null` when the value is not resolvable from the
 *  file's own tokens — which a limb reports as a NAMED problem, never as a silent pass. */
function resolveColor(value: string, decls: Decls, depth = 0): Rgb | null {
  const text = value.trim()
  if (depth > 8) return null
  const hex = parseHexColor(text)
  if (hex !== null) return hex
  const varMatch = /^var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^)]+))?\)$/i.exec(text)
  if (varMatch !== null) {
    const own = decls[varMatch[1]!]
    if (own !== undefined) return resolveColor(own, decls, depth + 1)
    return varMatch[2] === undefined ? null : resolveColor(varMatch[2], decls, depth + 1)
  }
  const mix = /^color-mix\(\s*in\s+srgb\s*,([\s\S]*)\)$/i.exec(text)
  if (mix !== null) {
    const parts = mix[1]!.split(',').map((part) => part.trim())
    if (parts.length !== 2) return null
    const one = (part: string): { color: Rgb; weight: number | null } | null => {
      const pct = /^(.*?)\s+(\d+(?:\.\d+)?)%$/.exec(part)
      const color = resolveColor(pct === null ? part : pct[1]!, decls, depth + 1)
      if (color === null) return null
      return { color, weight: pct === null ? null : Number(pct[2]) }
    }
    const a = one(parts[0]!)
    const b = one(parts[1]!)
    if (a === null || b === null) return null
    const wa = a.weight ?? (b.weight === null ? 50 : 100 - b.weight)
    const wb = b.weight ?? 100 - wa
    const total = wa + wb
    if (total <= 0) return null
    const mixc = (x: number, y: number): number => (x * wa + y * wb) / total
    return {
      r: mixc(a.color.r, b.color.r),
      g: mixc(a.color.g, b.color.g),
      b: mixc(a.color.b, b.color.b),
      a: mixc(a.color.a, b.color.a),
    }
  }
  return null
}

const channel = (value: number): number => {
  const s = Math.max(0, Math.min(255, value)) / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function luminance(color: Rgb): number {
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b)
}

/** The WCAG 2.x contrast ratio of two OPAQUE colours, 1…21. */
function contrastRatio(one: Rgb, two: Rgb): number {
  const a = luminance(one)
  const b = luminance(two)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}

const round3 = (value: number): number => Math.round(value * 1000) / 1000

// ---------------------------------------------------------------------------
// THE REAL HOST SEAM DRIVE (`B`) — the REAL `SidebarPanes` over the DOM double, its REAL private
// bridge installer reached through the exposed `window.provident.sidebar` holder (the
// `unit-live11-bridge-seams.test.ts` pattern). NOTHING is mocked: the write counter wraps the
// host's own `setLayout`, and the persist sink is the `bridge.operatorSettings.set` seam.
// ---------------------------------------------------------------------------
interface SeamHost {
  seam: Record<string, unknown> | null
  setLayoutCalls: () => number
  writes: LayoutState[]
  restore: () => void
}

function seedHost(seed: LayoutState, panes: PaneSpec[]): SeamHost {
  installShim()
  const globals = globalThis as Record<string, unknown>
  const previousWindow = globals['window']
  const registry = createPaneRegistry()
  for (const pane of panes) {
    registry.register({
      id: pane.id,
      title: pane.title ?? pane.id,
      scope: 'app-graph',
      defaultZone: pane.zone,
      render: () => ({ type: 'div', props: { id: `${pane.id}-render-root` } }),
    })
    registry.enable(pane.id)
  }
  const writes: LayoutState[] = []
  const host = new SidebarPanes({
    mount: new ShimElement('div') as never,
    operatorMount: new ShimElement('div') as never,
    registry,
    bridge: {
      operatorSettings: {
        set: async (patch: { layout: LayoutState }): Promise<unknown> => {
          writes.push(patch.layout)
          return patch
        },
      },
    },
    backRefs: new Map<string, string[]>(),
    editController: {},
  } as never)
  globals['window'] = { provident: {} }
  ;(host as unknown as { installSidebarBridge(): void }).installSidebarBridge()
  const sidebar = (globals['window'] as { provident?: { sidebar?: Record<string, unknown> } }).provident?.sidebar
  // The seed write is NOT a press: it happens BEFORE the counter is installed.
  host.setLayout(seed)
  writes.length = 0
  let calls = 0
  const realSetLayout = host.setLayout.bind(host)
  ;(host as unknown as Record<string, unknown>)['setLayout'] = (layout: LayoutState): void => {
    calls += 1
    realSetLayout(layout)
  }
  return {
    seam: sidebar ?? null,
    setLayoutCalls: () => calls,
    writes,
    restore: () => {
      globals['window'] = previousWindow
    },
  }
}

interface BodyRun {
  calls: string[]
  error: string | null
}

/** Run ONE authored handler BODY (`handlers[i].body`, a `function (ctx) {…}` expression string)
 *  in a parameter sandbox: `window` is the single free name the body may reach, and `ctx.node` is
 *  the authored node it is handed. The seam is a COUNTING stub, so the only graded value is WHICH
 *  address the body read — never the host's write (that is (b1)'s subject, graded separately). */
function runHandlerBody(body: unknown, node: AssembledNode): BodyRun {
  const calls: string[] = []
  if (typeof body !== 'string' || !/function\s*\(/.test(body)) {
    return { calls, error: `the authored handler carries no usable function-expression body (typeof ${typeof body})` }
  }
  const license = {
    togglePaneCollapse: (id: unknown) => {
      calls.push(String(id))
    },
  }
  try {
    const factory = new Function('window', 'ctx', `return (${body})(ctx);`) as (w: unknown, c: unknown) => unknown
    factory({ provident: { sidebar: license } }, { node })
  } catch (error) {
    return { calls, error: String(error) }
  }
  return { calls, error: null }
}

/** `defaultLayout()` with the named PANE ENTRIES stated — the record the act reads. */
function layoutWithPanes(entries: Array<{ id: string; zone: Zone; index?: number; collapsed?: boolean }>): LayoutState {
  const base = defaultLayout()
  return {
    ...base,
    panes: entries.map((entry, index) => ({
      id: entry.id,
      zone: entry.zone,
      index: entry.index ?? index,
      collapsed: entry.collapsed === true,
    })),
  }
}

const panesOf = (layout: LayoutState): LayoutState['panes'] => (Array.isArray(layout.panes) ? layout.panes : [])

const fingerprint = (value: unknown): string => JSON.stringify(value)

describe('U-2 pane head — the authored bar, the one-leaf act, the paint axes, the head out of the scroller, the head minimum, the gutter pill, the vocabulary, the authoring', () => {
  it('A — the authored bar: a head row FIRST, `[grip, control]` as its children in that order, four drops under the grip, the control a SIBLING, and the body SECOND in both states', async () => {
    const module = (await import('../../../src/renderer/pane-graph.js')) as Record<string, unknown>
    const problems: string[] = []
    const handlerName = readConstant(module, 'PANE_COLLAPSE_HANDLER', 'src/renderer/pane-graph.ts', 'A')
    problems.push(...handlerName.problems)

    const OPEN = 'probe-a-open'
    const SHUT = 'probe-a-shut'
    const assembly = assemble({
      panes: [
        { id: OPEN, zone: 'left', title: 'Probe Open' },
        { id: SHUT, zone: 'left', title: 'Probe Shut', collapsed: true },
      ],
    })
    const readingsText = assembly.frames
      .map((frame) => `${propText(frame, 'data-pane-id') || '(no pane id)'}=${skeleton(frame)}`)
      .join('; ')

    /** One frame's bar, read against `§3` limb `A`'s seven sub-arms. */
    const barProblems = (frame: AssembledNode | undefined, paneId: string, state: string): string[] => {
      const out: string[] = []
      if (frame === undefined) {
        out.push(
          `(a0) the envelope carries NO \`.pane-frame[data-pane-id="${paneId}"]\` node (${state}) — limb A's bar has no subject. ` +
            `Frames read: ${readingsText}`,
        )
        return out
      }
      const kids = childrenOf(frame)
      const head = kids[0]
      const headId = `pane-head-${paneId}`
      // (a1) THE HEAD ROW, the frame's FIRST child, authored as BARE DATA.
      if (head === undefined) {
        out.push(`(a1) the frame for "${paneId}" (${state}) authors NO first child — the head row \`${headId}\` is absent (children ${skeleton(frame)})`)
      } else if (propIdOf(head) !== headId || !classesOf(head).includes('pane-head')) {
        out.push(
          `(a1) the frame for "${paneId}" (${state}) has FIRST child props.id ${JSON.stringify(propIdOf(head) || '(none)')} with classes ` +
            `[${classesOf(head).join(', ')}], not \`${headId}\` with class \`pane-head\` — §2 C-1 authors the head row as the frame's FIRST child, ` +
            `and the landed frame still starts with the collapse control that carries the title in its \`content\``,
        )
      } else {
        if (ownsProp(head, 'content')) {
          out.push(
            `(a1) the head row \`${headId}\` authors \`content\` ${JSON.stringify(head.content)} — §2 C-1 pins NO \`content\` on the head (its only ink is the sheet's)`,
          )
        }
        if (head.css !== undefined && Object.prototype.hasOwnProperty.call(head.css, 'style')) {
          out.push(`(a1) the head row \`${headId}\` authors \`css.style\` ${JSON.stringify(head.css.style)} — the head's box is the SHEET's; a \`position\` here would be a second authority`)
        }
      }
      // (a2) THE HEAD'S CHILDREN ARE `[grip, control]`, IN THAT ORDER.
      const gripId = `pane-grab-${paneId}`
      const controlId = `pane-collapse-${paneId}`
      const headKids = childrenOf(head)
      const headIsHeadRow = head !== undefined && propIdOf(head) === headId && classesOf(head).includes('pane-head')
      if (!headIsHeadRow) {
        out.push(
          `(a2) the ordered \`[${gripId}, ${controlId}]\` pair cannot be read: the frame's first child is ` +
            `${head === undefined ? 'ABSENT' : `\`${propIdOf(head) || '(no id)'}\` (see (a1))`} and its children read ` +
            `[${headKids.map((child) => propIdOf(child) || '(no id)').join(', ')}] — §2 C-1 puts the grip FIRST and the control SECOND as ` +
            `SIBLINGS inside the head row`,
        )
      } else if (headKids.length < 2 || propIdOf(headKids[0]) !== gripId || propIdOf(headKids[1]) !== controlId) {
        out.push(
          `(a2) the head row \`${headId}\` (${state}) authors children [${headKids.map((child) => propIdOf(child) || '(no id)').join(', ')}], ` +
            `not \`[${gripId}, ${controlId}]\` in that order — §2 C-1 puts the grip FIRST and the control SECOND, as SIBLINGS inside the head`,
        )
      }
      // (a3) THE GRIP.
      const grip = findNode(headKids, gripId)
      if (grip === undefined) {
        out.push(`(a3) no grip node \`${gripId}\` is authored anywhere under the head row for "${paneId}" (${state}) — §2 C-1's drag operand surface is absent`)
      } else {
        if (!classesOf(grip).includes('pane-grab')) {
          out.push(`(a3) the grip \`${gripId}\` carries classes [${classesOf(grip).join(', ')}], not the \`pane-grab\` class (§2 C-1, D-14)`)
        }
        if (grip.content !== '⠿') {
          out.push(`(a3) the grip \`${gripId}\` carries content ${JSON.stringify(grip.content)}, not the glyph '⠿' (§2 C-1 pins the glyph as the grip's \`content\`)`)
        }
        const title = titleOf(assembly.registry, paneId)
        if (propText(grip, 'name') !== title) {
          out.push(
            `(a3) the grip \`${gripId}\` carries props.name ${shown(propText(grip, 'name'))}, not the pane's TITLE ` +
              `${JSON.stringify(title)} — §2 C-1 makes the pane's name AUTHORED DATA read by \`attr(name)\`, never a \`content\` string`,
          )
        }
        if (!ownsProp(grip, 'tabindex')) {
          out.push(`(a3) the grip \`${gripId}\` carries no \`props.tabindex\` — the drag surface is keyboard-reachable only through that authored operand (§2 C-1)`)
        }
      }
      // (a4) THE FOUR DROPS, over the CLOSED four.
      const dropIds = CLOSED_ZONES.map((zone) => `pane-grab-${paneId}-${zone}`)
      if (grip === undefined) {
        out.push(`(a4) no grip exists for "${paneId}" (${state}), so the four \`.pane-drop\` children have no parent`)
      } else {
        const dropKids = childrenOf(grip)
        const missing = dropIds.filter((id) => findNode(dropKids, id) === undefined)
        if (missing.length > 0) {
          out.push(
            `(a4) the grip \`${gripId}\` authors children [${dropKids.map((child) => propIdOf(child) || '(no id)').join(', ')}]; ` +
              `MISSING drop node(s) [${missing.join(', ')}] — §2 C-1 authors ONE \`.pane-drop\` per closed zone (left/right/top/bottom) as the grip's children`,
          )
        }
        for (const zone of CLOSED_ZONES) {
          const drop = findNode(dropKids, `pane-grab-${paneId}-${zone}`)
          if (drop === undefined) continue
          if (!classesOf(drop).includes('pane-drop')) {
            out.push(`(a4) the drop \`pane-grab-${paneId}-${zone}\` carries classes [${classesOf(drop).join(', ')}], not the \`pane-drop\` class`)
          }
          if (propText(drop, 'pane') !== paneId || propText(drop, 'zone') !== zone) {
            out.push(
              `(a4) the drop \`pane-grab-${paneId}-${zone}\` carries props.pane ${shown(propText(drop, 'pane'))} / ` +
                `props.zone ${shown(propText(drop, 'zone'))} — §2 C-1's two drag operands must name THIS pane and THIS zone`,
            )
          }
        }
      }
      // (a5) THE CONTROL.
      const control = findNode(descendants(frame), controlId) ?? (propIdOf(head) === controlId ? head : undefined)
      if (control === undefined) {
        out.push(`(a5) no control node \`${controlId}\` is authored under the frame for "${paneId}" (${state}) — the act has no address`)
      } else {
        if (!classesOf(control).includes('pane-collapse')) {
          out.push(
            `(a5) the control \`${controlId}\` carries classes [${classesOf(control).join(', ')}], not the foundation's \`pane-collapse\` class — ` +
              `the superseded spelling \`${SUPERSEDED_HEADER_CLASS}\` is what the head authors today (§2 C-5, D-14)`,
          )
        }
        if (propText(control, 'pane') !== paneId) {
          out.push(
            `(a5) the control \`${controlId}\` carries props.pane ${shown(propText(control, 'pane'))} — §2 C-1 moves the ` +
              `collapse operand from \`data-pane-id\` to \`props.pane\``,
          )
        }
        if (!ownsProp(control, 'tabindex')) {
          out.push(`(a5) the control \`${controlId}\` carries no \`props.tabindex\` — §2 C-1's operable control authors it`)
        }
        if (ownsProp(control, 'content')) {
          out.push(
            `(a5) the control \`${controlId}\` authors \`content\` ${JSON.stringify(control.content)} — §2 C-1 pins NO \`content\`: ` +
              `the glyph is the SHEET's (\`design-pane-control-bar.md\` §4), and the landed node still carries the glyph AND the title`,
          )
        }
        const handlers = Array.isArray(control.handlers) ? control.handlers : []
        if (handlers.length !== 1) {
          out.push(`(a5) the control \`${controlId}\` authors ${handlers.length} handler(s), not exactly one shared \`PANE_COLLAPSE_HANDLER\` pair (§2 C-1)`)
        } else {
          const only = handlers[0]!
          if (typeof handlerName.value === 'string' && String(only.name ?? '') !== handlerName.value) {
            out.push(`(a5) the control's one handler is named ${JSON.stringify(String(only.name ?? ''))}, not \`${handlerName.value}\``)
          }
          const body = String(only.body ?? '')
          if (!/props\s*\[\s*['"]pane['"]\s*\]|props\.pane\b/.test(body)) {
            out.push(
              `(a5) the control's handler body never reads \`props.pane\` — §2 C-1's \`PANE_COLLAPSE_BODY\` replaces the \`ctx.node.props['data-pane-id']\` ` +
                `read with the \`pane\` operand (body reads: ${JSON.stringify(body.replace(/\s+/g, ' ').slice(0, 140))})`,
            )
          }
        }
      }
      // (a6) THE CONTROL IS THE GRIP'S SIBLING, NEVER ITS DESCENDANT.
      if (grip === undefined || head === undefined) {
        out.push(`(a6) the sibling reading has no subject for "${paneId}" (${state}): the grip and/or the head row is absent`)
      } else {
        const underGrip = descendants(grip).some((node) => propIdOf(node) === controlId)
        if (underGrip) {
          out.push(
            `(a6) the control \`${controlId}\` is a DESCENDANT of the grip \`${gripId}\` — §2 C-1/§1 (a): a press on it must never resolve a gesture ` +
              `element, which is only structurally true while the control is the grip's SIBLING`,
          )
        }
        const controlKid = findNode(headKids, controlId)
        if (controlKid === undefined) {
          out.push(`(a6) the control \`${controlId}\` is not among the head row's children — "sibling of the grip" is a POSITION inside the head, not a claim`)
        }
      }
      // (a7) THE BODY IS THE FRAME'S SECOND CHILD, in BOTH states.
      const bodyId = `pane-body-${paneId}`
      const second = kids[1]
      if (second === undefined || propIdOf(second) !== bodyId || !classesOf(second).includes('pane-body')) {
        out.push(
          `(a7) the frame for "${paneId}" (${state}) has SECOND child props.id ${JSON.stringify(propIdOf(second) || '(none)')} with classes ` +
            `[${second === undefined ? '' : classesOf(second).join(', ')}], not \`${bodyId}\` with class \`pane-body\` — §2 C-2 authors \`[head, body]\` ` +
            `in BOTH states and withholds only the body's CHILDREN (\`ASM-U2-2\`); the head still authors \`[control, renderRoot]\` / \`[control]\``,
        )
      }
      return out
    }

    for (const [paneId, state] of [
      [OPEN, 'expanded'],
      [SHUT, 'collapsed'],
    ] as Array<[string, string]>) {
      problems.push(...barProblems(frameFor(assembly.frames, paneId), paneId, state))
    }

    expect(
      problems,
      `limb A — the authored bar (\`§3\` limb A, sub-arms a1…a7; §2 C-1/C-2). FRAMES READ: ${readingsText}. ${problems.length} problem(s). ` +
        `§2 C-1 authors the bar as DATA: head row \`pane-head-<id>\` FIRST (no \`content\`, no \`css.style\`), its children \`[grip, control]\`, ` +
        `the grip \`pane-grab-<id>\` (class \`pane-grab\`, content '⠿', \`props.name\` = title, \`props.tabindex\`) parenting the four \`pane-drop\` ` +
        `nodes with \`props.pane\`/\`props.zone\`, the control \`pane-collapse-<id>\` (class \`pane-collapse\`, \`props.pane\`, \`props.tabindex\`, no ` +
        `\`content\`) as the grip's SIBLING, and the body \`pane-body-<id>\` as the frame's SECOND child in both states. ` +
        `LAYER: envelope-class — the real \`assembleAppGraphEnvelope\` over a real \`PaneRegistry\`; no paint, no grid, no window`,
    ).toEqual([])
  })

  it('B — the act is ONE leaf: `setPaneCollapsed` exists, one press is one `setLayout`/one member, an explicit boolean both ways, and the address is `props.pane`', async () => {
    const problems: string[] = []
    const drag = (await import('../../../src/renderer/pane-drag.js')) as Record<string, unknown>
    const writer = readExport(drag, 'setPaneCollapsed', 'src/renderer/pane-drag.ts', 'B')
    problems.push(...writer.problems)

    const ONE = 'probe-b-one'
    const TWO = 'probe-b-two'
    const seed = layoutWithPanes([
      { id: ONE, zone: 'left', index: 0, collapsed: false },
      { id: TWO, zone: 'right', index: 0, collapsed: true },
    ])

    // ---- (b1)/(b2)/(b3) ON THE STATE HELPER (`§2` C-3's ONE new pure export) -------------------
    if (typeof writer.value === 'function') {
      const write = writer.value as (layout: unknown, paneId: unknown, collapsed: unknown) => unknown
      const drive = (before: LayoutState, paneId: string, collapsed: boolean): LayoutState | null => {
        try {
          return coerceLayout(write(before, paneId, collapsed) as LayoutState)
        } catch (error) {
          problems.push(`(b1) setPaneCollapsed(${JSON.stringify(paneId)}, ${String(collapsed)}) THREW (${String(error)}) — §2 C-3 makes it TOTAL/fail-soft`)
          return null
        }
      }
      for (const start of [false, true]) {
        const before = layoutWithPanes([
          { id: ONE, zone: 'left', index: 0, collapsed: start },
          { id: TWO, zone: 'right', index: 0, collapsed: !start },
        ])
        for (const collapsed of [true, false]) {
          const after = drive(before, ONE, collapsed)
          if (after === null) continue
          const entry = panesOf(after).find((p) => p.id === ONE)
          const wasEntry = panesOf(before).find((p) => p.id === ONE)!
          // (b2) an EXPLICIT boolean, never a delete.
          if (entry === undefined) {
            problems.push(`(b2) setPaneCollapsed dropped the entry for "${ONE}" entirely (start collapsed:${String(start)}) — a pane entry is never removed by the act`)
          } else {
            const record = entry as unknown as Record<string, unknown>
            if (!Object.prototype.hasOwnProperty.call(record, 'collapsed') || typeof record['collapsed'] !== 'boolean') {
              problems.push(
                `(b2) setPaneCollapsed(before, "${ONE}", ${String(collapsed)}) left \`collapsed\` ${JSON.stringify(record['collapsed'])} ` +
                  `(typeof ${typeof record['collapsed']}) — §2 C-3 writes an EXPLICIT boolean and NEVER deletes the member`,
              )
            } else if (record['collapsed'] !== collapsed) {
              problems.push(`(b2) setPaneCollapsed(before, "${ONE}", ${String(collapsed)}) wrote collapsed=${String(record['collapsed'])} — the value is the operator's word, not a flip`)
            }
            // (b1) `zone`/`index`/`id` untouched: ONE member changes at ONE address.
            if (entry.zone !== wasEntry.zone || entry.index !== wasEntry.index || entry.id !== wasEntry.id) {
              problems.push(
                `(b1) setPaneCollapsed(before, "${ONE}", …) rewrote a SECOND member of the entry: ` +
                  `${JSON.stringify(wasEntry)} → ${JSON.stringify(entry)} — §2 C-3 replaces \`collapsed\` ONLY`,
              )
            }
          }
          // (b3) every OTHER pane entry, plus zones/stage/topBar, byte-identical.
          const others = panesOf(after).filter((p) => p.id !== ONE)
          const othersBefore = panesOf(before).filter((p) => p.id !== ONE)
          if (fingerprint(others) !== fingerprint(othersBefore)) {
            problems.push(`(b3) setPaneCollapsed rewrote the OTHER pane entries: ${fingerprint(othersBefore)} → ${fingerprint(others)}`)
          }
          for (const member of ['zones', 'stage', 'topBar'] as const) {
            if (fingerprint(after[member]) !== fingerprint(before[member])) {
              problems.push(`(b3) setPaneCollapsed changed \`${member}\` (${fingerprint(before[member])} → ${fingerprint(after[member])}) — the act writes ONE member at ONE address`)
            }
          }
          // The same comparison against the COERCED baseline, so a coercion-only difference is not
          // mistaken for a write.
          const baseline = coerceLayout(before)
          if (fingerprint(after.zones) !== fingerprint(baseline.zones)) {
            problems.push(`(b3) setPaneCollapsed changed \`zones\` against the COERCED baseline (${fingerprint(baseline.zones)} → ${fingerprint(after.zones)})`)
          }
        }
      }
      // (b5) an unknown id and a malformed record are NO-OPS (zero writes).
      for (const [label, layout] of [
        ['an unknown pane id', seed],
        ['a malformed layout (null)', null],
        ['a malformed layout ({})', {}],
      ] as Array<[string, unknown]>) {
        const before = coerceLayout(layout)
        let after: LayoutState
        try {
          after = coerceLayout(write(layout, label === 'an unknown pane id' ? 'probe-b-absent' : ONE, true) as LayoutState)
        } catch (error) {
          problems.push(`(b5) setPaneCollapsed threw on ${label} (${String(error)}) — the helper must be TOTAL/fail-soft (\`§2\` C-3)`)
          continue
        }
        if (fingerprint(after) !== fingerprint(before)) {
          problems.push(
            `(b5) setPaneCollapsed on ${label} changed the layout (${fingerprint(before)} → ${fingerprint(after)}) — an unknown id or an absent entry is a NO-OP returning the coerced layout`,
          )
        }
      }
    }

    // ---- (b1b) THE ACT ROUTES THROUGH THE HELPER (a SOURCE clause — `§2` C-3's table) ----------
    {
      const text = readText('src/renderer/sidebar-panes.ts')
      const at = text.indexOf('private togglePaneCollapse(')
      if (at < 0) {
        problems.push('(b1b) `togglePaneCollapse` is no longer declared in `src/renderer/sidebar-panes.ts` — the act has no subject')
      } else {
        const open = text.indexOf('{', at)
        let depth = 0
        let close = -1
        for (let i = open; i < text.length; i++) {
          if (text[i] === '{') depth += 1
          else if (text[i] === '}') {
            depth -= 1
            if (depth === 0) {
              close = i
              break
            }
          }
        }
        const body = close < 0 ? '' : text.slice(open, close)
        if (!/\bsetPaneCollapsed\b/.test(body)) {
          problems.push(
            `(b1b) \`togglePaneCollapse\` in \`src/renderer/sidebar-panes.ts\` never calls \`setPaneCollapsed\` — §2 C-3 replaces the inline ` +
              `\`panes.map(…)\` flip with ONE \`this.setLayout(setPaneCollapsed(base, paneId, !current))\` (the record-PRESENT arm is the graded one; ` +
              `the record-ABSENT backfill is NAMED, never re-graded)`,
          )
        }
      }
    }

    // ---- (b4) THE ADDRESS IS `props.pane`, read off the AUTHORED body --------------------------
    {
      const paneId = 'probe-b-address'
      const assembly = assemble({ panes: [{ id: paneId, zone: 'left', title: 'Address Probe' }] })
      const frame = frameFor(assembly.frames, paneId)
      const control =
        findNode(descendants(frame), `pane-collapse-${paneId}`) ?? frameFor(assembly.frames, paneId)
      const handlers = Array.isArray(control?.handlers) ? control!.handlers : []
      const body = handlers.length === 1 ? handlers[0]!.body : undefined
      const withPane: AssembledNode = { props: { id: `pane-collapse-${paneId}`, pane: 'probe-b-one', tabindex: '0' } }
      const withDataOnly: AssembledNode = { props: { id: `pane-collapse-${paneId}`, 'data-pane-id': 'probe-b-one' } }
      const paneRun = runHandlerBody(body, withPane)
      const dataRun = runHandlerBody(body, withDataOnly)
      if (body === undefined) {
        problems.push(`(b4) no control node with one authored handler body was found for "${paneId}" — the address reading has no subject`)
      } else {
        if (paneRun.error !== null) {
          problems.push(`(b4) the authored handler body THREW on a \`props.pane\` node (${paneRun.error}) — the body is TOTAL: a malformed node is a no-op`)
        } else if (paneRun.calls.length !== 1 || paneRun.calls[0] !== 'probe-b-one') {
          problems.push(
            `(b4) the authored control body pressed with a node carrying \`props.pane\`='probe-b-one' called the seam ${paneRun.calls.length} ` +
              `time(s) (ids read: [${paneRun.calls.join(', ')}]), not exactly once with 'probe-b-one' — §2 C-1 replaces the ` +
              `\`ctx.node.props['data-pane-id']\` read with \`props.pane\``,
          )
        }
        if (dataRun.error !== null) {
          problems.push(`(b4) the authored handler body THREW on a \`data-pane-id\`-only node (${dataRun.error}) — a malformed node must be a no-op`)
        } else if (dataRun.calls.length !== 0) {
          problems.push(
            `(b4) the authored control body pressed with a node carrying ONLY \`data-pane-id\` called the seam ${dataRun.calls.length} time(s) ` +
              `([${dataRun.calls.join(', ')}]) — the control's operand is \`props.pane\`; \`data-pane-id\` belongs to the FRAME`,
          )
        }
      }
    }

    // ---- (b1)/(b3) ON THE REAL HOST: one press = ONE `setLayout`, ONE member -------------------
    {
      const host = seedHost(seed, [
        { id: ONE, zone: 'left' },
        { id: TWO, zone: 'right' },
      ])
      try {
        const toggle = host.seam?.['togglePaneCollapse']
        if (host.seam === null) {
          problems.push('(b1) the bridged holder carries no `sidebar` surface at all — the act has no address, so the one-write discipline has no subject')
        } else if (typeof toggle !== 'function') {
          problems.push(
            `(b1) \`window.provident.sidebar.togglePaneCollapse\` is NOT a function (typeof read: ${typeof toggle}; holder keys ` +
              `[${Object.keys(host.seam).slice(0, 12).join(', ')}…]) — the authored body's ONE seam is missing`,
          )
        } else {
          ;(toggle as AnyFn)(ONE as never)
          const calls = host.setLayoutCalls()
          if (calls !== 1) {
            problems.push(`(b1) ONE press of \`togglePaneCollapse("${ONE}")\` reached the host's own \`setLayout\` ${calls} time(s), not exactly once (§2 C-3)`)
          }
          if (host.writes.length !== 1) {
            problems.push(`(b1) ONE press produced ${host.writes.length} persist write(s) through \`bridge.operatorSettings.set\` — the ONE write path must be reached exactly once`)
          }
          const written = host.writes[0]
          if (written !== undefined) {
            const changed = panesOf(written).filter((entry) => {
              const was = panesOf(seed).find((p) => p.id === entry.id)
              return fingerprint(entry) !== fingerprint(was)
            })
            if (changed.length !== 1 || changed[0]!.id !== ONE) {
              problems.push(
                `(b1) one press changed the pane record(s) [${changed.map((entry) => entry.id).join(', ')}], not exactly ["${ONE}"] — ` +
                  `the act writes ONE member at ONE address`,
              )
            }
            if (panesOf(written).find((p) => p.id === ONE)?.collapsed !== true) {
              problems.push(`(b2) the press wrote collapsed=${JSON.stringify(panesOf(written).find((p) => p.id === ONE)?.collapsed)} on "${ONE}", not the negation of its stated \`false\``)
            }
            for (const member of ['zones', 'stage', 'topBar'] as const) {
              if (fingerprint(written[member]) !== fingerprint(coerceLayout(seed)[member])) {
                problems.push(`(b3) the press rewrote \`${member}\` (${fingerprint(coerceLayout(seed)[member])} → ${fingerprint(written[member])})`)
              }
            }
          }
        }
      } finally {
        host.restore()
      }
    }

    expect(
      problems,
      `limb B — the act's one-leaf discipline (\`§3\` limb B, sub-arms b1…b5; §2 C-3). ${problems.length} problem(s). THE LEDGER: ` +
        `(b1) ONE press = ONE \`setLayout\` and ONE member changed, and the act ROUTES THROUGH \`setPaneCollapsed\`; (b2) the written value is an ` +
        `EXPLICIT final boolean both ways, never a delete; (b3) \`zones\`/\`stage\`/\`topBar\` and every other pane entry read BYTE-identical; ` +
        `(b4) the record id is read off the node's \`props.pane\` (a node carrying only \`data-pane-id\` writes NOTHING); (b5) a malformed/absent ` +
        `record is a NO-OP (zero writes). ` +
        `LAYER: the REAL \`SidebarPanes\` host + the fork's own write path under the DOM double, plus the authored handler BODY driven in a ` +
        `parameter sandbox — the envelope/wiring class, never the paint`,
    ).toEqual([])
  })

  it('C — the paint\'s axes as the TOTAL pure helper `panePaintAxesOf`: five arms off `zoneOrientation`, the stage arm zone-less, and a swapped map must red', async () => {
    const module = (await import('../../../src/renderer/pane-graph.js')) as Record<string, unknown>
    const problems: string[] = []
    const axes = readExport(module, 'panePaintAxesOf', 'src/renderer/pane-graph.ts', 'C')
    problems.push(...axes.problems)

    interface Axes {
      fill: unknown
      adjustable: unknown
      scroll: unknown
    }
    const EXPECTED: Record<Zone | 'stage', Axes> = {
      left: { fill: 'width', adjustable: 'height', scroll: 'overflow-y' },
      right: { fill: 'width', adjustable: 'height', scroll: 'overflow-y' },
      top: { fill: 'height', adjustable: 'width', scroll: 'overflow-x' },
      bottom: { fill: 'height', adjustable: 'width', scroll: 'overflow-x' },
      stage: { fill: 'both', adjustable: 'both', scroll: null },
    }
    /** The zone-less inputs `§3`'s stage arm must answer for (a stage/zone-less pane). */
    const ZONELESS: unknown[] = [null, undefined, '', 'sidebar', 'stage', {}, 0]

    const read = (fn: (zone: unknown) => unknown, zone: unknown): { value: Axes | null; error: string | null } => {
      try {
        const raw = fn(zone) as Partial<Axes> | null | undefined
        if (raw == null || typeof raw !== 'object') return { value: null, error: `answered ${JSON.stringify(raw ?? null)}, not an object` }
        return { value: { fill: raw.fill, adjustable: raw.adjustable, scroll: raw.scroll }, error: null }
      } catch (error) {
        return { value: null, error: `THREW (${String(error)})` }
      }
    }

    /** THE COMPARATOR — driven over the REAL helper AND over a deliberately SWAPPED map below. */
    const comparator = (label: string, fn: (zone: unknown) => unknown): string[] => {
      const out: string[] = []
      for (const zone of CLOSED_ZONES) {
        const got = read(fn, zone)
        if (got.error !== null) {
          out.push(`${label} panePaintAxesOf(${JSON.stringify(zone)}) ${got.error} — the helper must be TOTAL over the closed four`)
          continue
        }
        const want = EXPECTED[zone]
        if (fingerprint(got.value) !== fingerprint(want)) {
          out.push(`${label} panePaintAxesOf(${JSON.stringify(zone)}) read ${fingerprint(got.value)}, not ${fingerprint(want)}`)
        }
        // The arm must agree with the fork's OWN orientation reading (`§3` C: "off the fork's own
        // `zoneOrientation`"), so the helper cannot drift from the drag module's axis split.
        const vertical = zoneOrientation(zone as LayoutZoneName) === 'vertical'
        const fromOrientation: Axes = vertical
          ? { fill: 'width', adjustable: 'height', scroll: 'overflow-y' }
          : { fill: 'height', adjustable: 'width', scroll: 'overflow-x' }
        if (fingerprint(got.value) !== fingerprint(fromOrientation)) {
          out.push(
            `${label} panePaintAxesOf(${JSON.stringify(zone)}) disagrees with \`zoneOrientation('${zone}')\` = '${vertical ? 'vertical' : 'horizontal'}' ` +
              `(${fingerprint(fromOrientation)}) — the helper reads the fork's own orientation, it does not re-spell the axis split`,
          )
        }
      }
      for (const input of ZONELESS) {
        const got = read(fn, input)
        if (got.error !== null) {
          out.push(`${label} panePaintAxesOf(${JSON.stringify(input ?? null)}) ${got.error} — the ZONE-LESS arm must be TOTAL (a stage pane names no zone)`)
          continue
        }
        if (fingerprint(got.value) !== fingerprint(EXPECTED.stage)) {
          out.push(
            `${label} panePaintAxesOf(${JSON.stringify(input ?? null)}) read ${fingerprint(got.value)}, not the zone-less arm ` +
              `${fingerprint(EXPECTED.stage)} — \`§3\` C: a stage/zone-less pane answers BOTH members adjustable and \`scroll: null\``,
          )
        }
      }
      return out
    }

    if (typeof axes.value === 'function') {
      const real = axes.value as (zone: unknown) => unknown
      problems.push(...comparator('(c1)', real))

      // ---- (c2) THE FIVE INPUTS PARTITION INTO THREE NON-COINCIDING ANSWER CLASSES -------------
      // (`§3`: "four arms + the stage arm"). `left`/`right` are the same map BY CONTRACT, so the
      // graded value is the PARTITION and its membership — not five unequal JSON blobs.
      const answers = new Map<string, string[]>()
      for (const key of [...CLOSED_ZONES, 'stage'] as Array<Zone | 'stage'>) {
        const input = key === 'stage' ? null : key
        const got = read(real, input)
        if (got.value === null) continue
        const bucket = fingerprint(got.value)
        answers.set(bucket, [...(answers.get(bucket) ?? []), key])
      }
      // ONE normaliser for BOTH sides: each class's members are sorted, then the class list is sorted,
      // so neither side's insertion order can decide the reading.
      const asClass = (members: readonly string[]): string => [...members].sort().join('+')
      const partition = [...answers.values()].map(asClass).sort()
      const expectedPartition = [['left', 'right'], ['top', 'bottom'], ['stage']].map(asClass).sort()
      if (fingerprint(partition) !== fingerprint(expectedPartition)) {
        problems.push(
          `(c2) the five inputs answered the classes [${partition.join(' | ')}], not the partition [${expectedPartition.join(' | ')}] — ` +
            `\`left\`/\`right\` share the VERTICAL arm and \`top\`/\`bottom\` the HORIZONTAL one, and the stage arm must be a THIRD, distinct map ` +
            `(a helper answering ONE map everywhere collapses them all)`,
        )
      }
      if (answers.size > 0 && answers.size < 3) {
        problems.push(`(c2) the five inputs collapsed into ${answers.size} answer class(es), not 3 — the axis split is unreadable`)
      }
    }

    // ---- (c3) THE FALSIFIER — a COMPASS-SWAPPED map MUST red the comparator --------------------
    {
      const swapped = (zone: unknown): Axes => {
        const flip = (value: unknown): unknown => (value === 'width' ? 'height' : value === 'height' ? 'width' : value)
        const base = EXPECTED.stage
        if (typeof zone !== 'string' || !(CLOSED_ZONES as readonly string[]).includes(zone)) return base
        const own = EXPECTED[zone as Zone]
        return { fill: flip(own.fill), adjustable: flip(own.adjustable), scroll: own.scroll === 'overflow-y' ? 'overflow-x' : 'overflow-y' }
      }
      const named = comparator('(c3 falsifier)', swapped)
      if (named.length === 0) {
        problems.push(
          '(c3) THE FALSIFIER FAILED — a compass-SWAPPED map (fill/adjustable/scroll mirrored on every zone) reads CLEAN through this limb\'s ' +
            'comparator, so the clean reading it gives the REAL helper is not discriminating',
        )
      }
    }

    expect(
      problems,
      `limb C — the paint's axes as a TOTAL pure helper (\`§3\` limb C; \`ASM-U2-3\`). ${problems.length} problem(s). THE LEDGER: ` +
        `\`left\`/\`right\` ⇒ ${fingerprint(EXPECTED.left)}; \`top\`/\`bottom\` ⇒ ${fingerprint(EXPECTED.top)}; a stage/zone-less pane ⇒ ` +
        `${fingerprint(EXPECTED.stage)}; the five inputs PARTITION into those three classes; and each zone's arm agrees with the fork's own ` +
        `\`zoneOrientation\`. WHAT THIS CANNOT GRADE (\`§3\` C's own words): that the SHEET's rules agree with the helper — that is limb \`F\`, and ` +
        `the PAINT of every arm is \`G8\`-only. LAYER: pure function, node-assertable; no DOM, no window, no grid`,
    ).toEqual([])
  })

  it('D — the head out of the scroller: the body is the pane block\'s ONLY scroller, `.pane-head` carries no `overflow` and no `position: sticky`, and the head is the body\'s SIBLING', () => {
    const problems: string[] = []
    const rules = indexRules()
    const paneRules = paneFamilyRules(rules)
    // NON-VACUITY FLOOR: a pane block with fewer rules than the landed `.pane-frame` family means
    // the walk or the selector test is blind, and every negative below would pass for free.
    if (paneRules.length < 3) {
      problems.push(
        `(d0) the pane block carries ${paneRules.length} rule(s) whose selector names a pane class — a corpus that thin cannot hold limbs D/F/G's negatives`,
      )
    }

    // ---- (d1) THE BODY IS THE ONLY SCROLLER ---------------------------------------------------
    const withOverflow = paneRules.filter((rule) => /(?:^|[;{\s])overflow(?:-[xy])?\s*:/.test(rule.body))
    const scrollers = withOverflow.filter((rule) => /pane-body/.test(rule.selector))
    const bodyScroller = scrollers.find((rule) => /(?:^|[;{\s])overflow\s*:\s*auto/.test(rule.body))
    if (bodyScroller === undefined) {
      problems.push(
        `(d1) NO rule naming \`.pane-body\` declares \`overflow: auto\` (pane-block rules carrying an overflow declaration: ` +
          `${withOverflow.length === 0 ? 'NONE AT ALL' : withOverflow.map((rule) => rule.selector).join(' | ')} at index.html:` +
          `${withOverflow.map((rule) => rule.line).join('/') || '—'}) — §2 C-2 makes the body the pane's ONLY scroller; the landed sheet ` +
          `scrolls the ZONE container instead and the pane frame has no scroller at all`,
      )
    }
    const strays = withOverflow.filter(
      (rule) => !/pane-body/.test(rule.selector) && !/:not\(\s*\.pane-head\s*\)/.test(rule.selector),
    )
    if (strays.length > 0) {
      problems.push(
        `(d1) the pane block carries an \`overflow\` declaration on a node that is NOT the body: ` +
          `${strays.map((rule) => `index.html:${rule.line} \`${rule.selector}\``).join(' | ')} — §2 C-2: the body is the pane's ONLY scroller ` +
          `(a collapsed arm may clip its non-head children with \`overflow: hidden\`, keyed on the FRAME's \`[collapsed]\`)`,
      )
    }

    // ---- (d2) THE HEAD CARRIES NO SCROLL OF ITS OWN, AND NO PIN -------------------------------
    const headRules = paneRules.filter((rule) => /pane-head/.test(rule.selector) && !/:not\(|::/.test(rule.selector))
    if (headRules.length === 0) {
      problems.push(
        `(d2) NO rule in \`index.html\` names \`.pane-head\` — §2 C-2's head is the pane column's FIXED first item, and this limb's negatives ` +
          `have no subject without the rule (an absent subject is not a satisfied negative)`,
      )
    } else {
      for (const rule of headRules) {
        if (/(?:^|[;{\s])overflow(?:-[xy])?\s*:/.test(rule.body)) {
          problems.push(`(d2) \`${rule.selector}\` (index.html:${rule.line}) declares \`overflow\` — the head is never a scroller (§2 C-2)`)
        }
        if (/(?:^|[;{\s])position\s*:\s*sticky/.test(rule.body)) {
          problems.push(
            `(d2) \`${rule.selector}\` (index.html:${rule.line}) declares \`position: sticky\` — \`ASM-U2-7\` REFUSES the pin: it is the ` +
              `foundation's remedy for a head that SHARES a scroller, and here the head shares none`,
          )
        }
      }
    }

    // ---- (d3) THE STRUCTURAL HALF — the head is the body's SIBLING in the AUTHORED envelope ---
    const paneId = 'probe-d-head'
    const assembly = assemble({ panes: [{ id: paneId, zone: 'left', title: 'Head Probe' }] })
    const frame = frameFor(assembly.frames, paneId)
    const kids = childrenOf(frame)
    const headIndex = kids.findIndex((child) => classesOf(child).includes('pane-head'))
    const bodyIndex = kids.findIndex((child) => classesOf(child).includes('pane-body'))
    if (headIndex < 0 || bodyIndex < 0) {
      problems.push(
        `(d3) the authored frame for "${paneId}" carries ${headIndex < 0 ? 'NO \`.pane-head\` child' : ''}${headIndex < 0 && bodyIndex < 0 ? ' and ' : ''}` +
          `${bodyIndex < 0 ? 'NO \`.pane-body\` child' : ''} (children ${skeleton(frame)}) — §2 C-2's "the head is the body's sibling" is an authored ` +
          `POSITION, not a stylesheet claim`,
      )
    } else if (headIndex !== 0 || bodyIndex !== 1) {
      problems.push(
        `(d3) the authored frame for "${paneId}" places the head at index ${headIndex} and the body at index ${bodyIndex} — §2 C-2 authors ` +
          `\`[head, body]\`, so the head cannot be inside the body's subtree`,
      )
    }

    expect(
      problems,
      `limb D — the head out of the scroller (\`§3\` limb D, sub-arms d1…d3; §2 C-2). The pane block read ${paneRules.length} rule(s) ` +
        `[${paneRules.map((rule) => `:${rule.line} ${rule.selector.slice(0, 40)}`).join(' | ')}]. ${problems.length} problem(s). ` +
        `LAYER: a SOURCE clause over \`src/renderer/index.html\` and the authored envelope — it reads TEXT and the assembler's data; it does NOT ` +
        `prove that a browser lays the head outside the scroller (that geometry is \`G8\`-only, \`uf_panes_1\`'s \`bodyIsTheOnlyScroller\`)`,
    ).toEqual([])
  })

  it('E — relocation survival: a collapsed record put through the REAL `movePane` re-assembles in the DESTINATION zone with its carrier, its body node and its record byte-identical except `zone`/`index`', async () => {
    const module = (await import('../../../src/renderer/pane-graph.js')) as Record<string, unknown>
    const subtree = readExport(module, 'paneSubtreeRoot', 'src/renderer/pane-graph.ts', 'E')
    const problems: string[] = []
    problems.push(...subtree.problems)

    const PANE = 'probe-e-pane'
    const OTHER = 'probe-e-other'
    const UNTOUCHED = 'probe-e-untouched'
    // THREE panes: the moved one, one VACATED-ZONE survivor (`movePane` legitimately renumbers the
    // surviving indices of the zone it leaves, so that entry is NOT the untouched one) and one in a
    // THIRD zone, which no part of the move may touch.
    const seed = layoutWithPanes([
      { id: PANE, zone: 'left', index: 0, collapsed: true },
      { id: OTHER, zone: 'left', index: 1, collapsed: false },
      { id: UNTOUCHED, zone: 'top', index: 0, collapsed: false },
    ])

    // ---- (e1)/(e2): THE MOVE ITSELF -----------------------------------------------------------
    const moved = movePane(seed, PANE, 'right')
    const movedEntry = panesOf(moved).find((entry) => entry.id === PANE)
    const seedEntry = panesOf(seed).find((entry) => entry.id === PANE)!
    if (movedEntry === undefined) {
      problems.push(`(e1) \`movePane\` DROPPED the record for "${PANE}" — the member this limb grades survives only while the entry does`)
    } else {
      // (e2) BYTE-IDENTICAL EXCEPT `zone`/`index` — the collapse member is not a move's business.
      const strip = (entry: typeof movedEntry): string =>
        fingerprint(Object.fromEntries(Object.entries(entry).filter(([key]) => key !== 'zone' && key !== 'index')))
      if (strip(movedEntry) !== strip(seedEntry)) {
        problems.push(
          `(e2) the moved entry is NOT byte-identical except \`zone\`/\`index\`: ${strip(seedEntry)} → ${strip(movedEntry)} — ` +
            `\`movePane\`'s \`...p\` spread keeps every member, and \`collapsed\` is one of them`,
        )
      }
      if (movedEntry.collapsed !== true) {
        problems.push(`(e2) the moved entry reads collapsed=${JSON.stringify(movedEntry.collapsed)}, not \`true\` — a relocation never states a collapse`)
      }
      if (movedEntry.zone !== 'right' || movedEntry.index !== 0) {
        problems.push(`(e2) the moved entry reads zone ${JSON.stringify(movedEntry.zone)}/index ${String(movedEntry.index)}, not 'right'/0`)
      }
      // The THIRD zone's entry is the one no part of the move may touch; the vacated zone's
      // survivor may be RENUMBERED (its `index` re-packs to 0..n-1) and its members may not move.
      const untouchedAfter = panesOf(moved).find((entry) => entry.id === UNTOUCHED)
      if (fingerprint(untouchedAfter) !== fingerprint(panesOf(seed).find((entry) => entry.id === UNTOUCHED))) {
        problems.push(`(e2) \`movePane\` rewrote the THIRD zone's entry (${fingerprint(panesOf(seed).find((entry) => entry.id === UNTOUCHED))} → ${fingerprint(untouchedAfter)}) — a relocate touches its own zone pair only`)
      }
      const survivorAfter = panesOf(moved).find((entry) => entry.id === OTHER)
      const survivorBefore = panesOf(seed).find((entry) => entry.id === OTHER)!
      const survivorStrip = (entry: typeof survivorBefore): string =>
        fingerprint(Object.fromEntries(Object.entries(entry).filter(([key]) => key !== 'index')))
      if (survivorAfter === undefined || survivorStrip(survivorAfter) !== survivorStrip(survivorBefore)) {
        problems.push(
          `(e2) the VACATED zone's survivor changed a member other than \`index\` (${survivorStrip(survivorBefore)} → ` +
            `${survivorAfter === undefined ? '(DROPPED)' : survivorStrip(survivorAfter)}) — a re-pack may renumber, never rewrite`,
        )
      }
    }

    // ---- (e1) THE DESTINATION FRAME ------------------------------------------------------------
    const assembly = assemble({
      panes: [
        { id: PANE, zone: 'left', title: 'Relocation Probe' },
        { id: OTHER, zone: 'left', title: 'Sibling Probe' },
        { id: UNTOUCHED, zone: 'top', title: 'Untouched Probe' },
      ],
      layout: moved,
    })
    const frame = frameFor(assembly.frames, PANE)
    const placement = (frame?.placement as { targetPlacement?: unknown } | undefined)?.targetPlacement
    const placedIn = Array.isArray(placement) && placement.length > 0 ? String(placement[0]) : ''
    /** THE ONE READER, reused by the falsifiers below: does `frame` read as a COLLAPSED pane frame? */
    const carrierProblems = (label: string, candidate: AssembledNode | undefined): string[] => {
      const out: string[] = []
      if (candidate === undefined) {
        out.push(`${label} no pane frame was produced at all — the carrier reading has no subject`)
        return out
      }
      if (!classesOf(candidate).includes('is-collapsed')) {
        out.push(`${label} the frame's classes read [${classesOf(candidate).join(', ')}] and not \`is-collapsed\` (\`§2\` C-4's landed mirror class)`)
      }
      const carrier = propText(candidate, 'collapsed')
      if (carrier !== 'true') {
        out.push(
          `${label} the frame carries props.collapsed ${carrier === '' ? '(ABSENT)' : JSON.stringify(carrier)}, not "true" — §2 C-4 gives the frame the ` +
            `foundation's \`collapsed="true"|"false"\` carrier authored by \`paneSubtreeRoot\`, computed from the ENTRY's \`collapsed\``,
        )
      }
      if (findNode(childrenOf(candidate), `pane-body-${PANE}`) === undefined) {
        out.push(
          `${label} the frame carries no \`pane-body-${PANE}\` child (children ${skeleton(candidate)}) — \`ASM-U2-2\` withholds the body's CONTENT, ` +
            `never the body NODE`,
        )
      }
      return out
    }
    if (frame === undefined) {
      problems.push(`(e1) no pane frame for "${PANE}" was assembled in the DESTINATION zone — the relocation's re-assembly has no subject`)
    } else {
      if (placedIn !== 'right') {
        problems.push(`(e1) the frame announces targetPlacement ${JSON.stringify(placedIn)}, not 'right' — the re-assembly placed the pane in the ZONE IT LEFT`)
      }
      problems.push(...carrierProblems(`(e1) [destination '${placedIn || '?'}']`, frame))
    }

    // ---- (e3) THE FALSIFIERS — this limb's green halves must be READINGS, not formalities ------
    // WHY THIS LIMB NEEDS THEM: (e2) is GREEN ON FIRST WRITE by construction, because the
    // fork's `movePane` spreads `...p` so the member survives without any unit doing anything. A
    // green that cannot fail is not evidence, so the SAME carrier reader is driven over a MUTATED
    // `paneSubtreeRoot` input and over an envelope whose destination carrier is STRIPPED.
    if (typeof subtree.value === 'function') {
      const def = assembly.registry.get(PANE)
      const ctx = { snapshot: null, docHeads: null, currentDocumentId: null, currentNodeId: null, backRefs: new Map(), crosslinks: [] }
      if (def === undefined) {
        problems.push('(e3) the registry lost the probe pane — the `paneSubtreeRoot` falsifier has no subject')
      } else {
        let mutated: AssembledNode | undefined
        try {
          mutated = (subtree.value as AnyFn)(def as never, ctx as never, 'right' as never, false as never) as AssembledNode
        } catch (error) {
          problems.push(`(e3) \`paneSubtreeRoot(def, ctx, 'right', false)\` THREW (${String(error)}) — the falsifier has no subject`)
        }
        if (mutated !== undefined) {
          const named = carrierProblems('(e3 falsifier: collapsed=false input)', mutated)
          if (named.length === 0) {
            problems.push(
              '(e3) THE FALSIFIER FAILED — \`paneSubtreeRoot(def, ctx, "right", false)\` reads as a COLLAPSED frame through this limb\'s carrier ' +
                'reader, so the clean reading it gives the real destination frame is not discriminating (the reader cannot tell the state at all)',
            )
          }
        }
      }
    }
    {
      // The envelope-level falsifier: strip the destination frame's carrier + class in a DEEP CLONE
      // and require the reader to name BOTH defects.
      const clone = JSON.parse(JSON.stringify(assembly.envelope)) as { content?: Array<{ content?: AssembledNode[] }> }
      let stripped: AssembledNode | undefined
      for (const payload of clone.content ?? []) {
        for (const node of payload.content ?? []) {
          if (propText(node, 'data-pane-id') === PANE) {
            stripped = node
            if (node.props !== undefined) delete node.props['collapsed']
            if (node.css?.classes !== undefined && Array.isArray(node.css.classes)) {
              node.css.classes = (node.css.classes as unknown[]).filter((name) => name !== 'is-collapsed')
            }
          }
        }
      }
      const named = carrierProblems('(e3 falsifier: carrier stripped)', stripped)
      const namedClass = named.some((line) => line.includes('is-collapsed'))
      const namedCarrier = named.some((line) => line.includes('props.collapsed'))
      if (!namedClass || !namedCarrier) {
        problems.push(
          `(e3) THE FALSIFIER FAILED — with the destination frame's \`collapsed\` carrier AND its \`is-collapsed\` class REMOVED the reader named ` +
            `the class defect ${namedClass ? 'yes' : 'NO'} and the carrier defect ${namedCarrier ? 'yes' : 'NO'} (its problem(s): ` +
            `${named.join(' | ') || 'none'}): a reader that cannot name a stripped carrier cannot certify a present one`,
        )
      }
    }

    expect(
      problems,
      `limb E — relocation survival (\`§3\` limb E; §2 C-3/C-4, \`ASM-U2-2\`). ${problems.length} problem(s). WHY THIS LIMB CAN FAIL: the fork's ` +
        `\`movePane\` spreads \`...p\`, so the MEMBER survives a move with no unit doing anything — the graded value is the ASSEMBLER+PAINT reading ` +
        `that member in the NEW zone (a \`paneSubtreeRoot\` reading the collapse off anything but the entry reds here). ` +
        `(e2) is GREEN ON FIRST WRITE BY CONSTRUCTION and are kept because they are the class this unit could regress into; two NAMED ` +
        `falsifiers (a mutated \`paneSubtreeRoot\` input, and a stripped destination carrier) keep them readings. (e1) — the \`collapsed='true'\` ` +
        `carrier and the \`pane-body-<id>\` node in the DESTINATION zone — is RED at this head. ` +
        `LAYER: envelope-class — the real \`movePane\`, the real assembler, a real \`PaneRegistry\`; no paint, no grid, no window`,
    ).toEqual([])
  })

  it('F — the minimum is the head: no JS clamp/floor of a pane extent anywhere in `src/**`, no figure on the head\'s box, and BOTH collapsed `auto` arms PRESENT, each reading `auto` on the axis `panePaintAxesOf` names, with no figure constant', async () => {
    const module = (await import('../../../src/renderer/pane-graph.js')) as Record<string, unknown>
    const problems: string[] = []
    // THE HELPER THIS ARM MUST AGREE WITH — reached through the file's own non-fatal reading
    // (`readExport`), so a missing export is a NAMED problem in THIS limb's aggregate too.
    const axes = readExport(module, 'panePaintAxesOf', 'src/renderer/pane-graph.ts', 'F')
    problems.push(...axes.problems)
    const helper = typeof axes.value === 'function' ? (axes.value as (zone: unknown) => unknown) : null
    const srcTs = SRC_FILES.filter((path) => TYPESCRIPT.test(path))

    // ---- (f1a) THE SOURCE CENSUS: no clamp/floor of a pane or head EXTENT ----------------------
    {
      if (srcTs.length < 30) {
        problems.push(`(f1a) the census walked only ${srcTs.length} *.ts file(s) under src/ — a corpus that thin cannot carry the shell`)
      }
      const clamps = readings(srcTs, /Math\.(?:max|min)\s*\(/)
        .filter((reading) => /(?:head|extent|paneHeight|paneWidth|minHeight|min-height|minWidth|min-width)/i.test(reading.text))
      if (clamps.length > 0) {
        problems.push(
          `(f1a) a JS CLAMP/FLOOR of a pane or head EXTENT is declared under src/**: ${format(clamps)} — §1 (4)/§3 F: a drag cannot beat the ` +
            `head's \`min-content\` and the renderer floors no record write, so no \`Math.max(<head>, …)\` and no JS \`min-height\` may exist`,
        )
      }
      const jsWritten = readings(srcTs, /min-height|minHeight|min-width|minWidth|min-content/)
      if (jsWritten.length > 0) {
        problems.push(
          `(f1a) a \`min-height\`/\`min-width\`/\`min-content\` FLOOR is written from JS under src/**: ${format(jsWritten)} — the head's minimum is ` +
            `the SHEET's \`min-content\`, authored in \`index.html\`; a JS floor is a second authority (\`ASM-U2-1\`)`,
        )
      }
    }

    // ---- (f1b) THE HEAD'S OWN BOX CARRIES NO FIGURE --------------------------------------------
    const rules = indexRules()
    const paneRules = paneFamilyRules(rules)
    const headRules = paneRules.filter((rule) => /pane-head/.test(rule.selector) && !/:not\(/.test(rule.selector))
    if (headRules.length === 0) {
      problems.push(
        `(f1b) \`index.html\` carries NO \`.pane-head\` rule — the head has no declared box at all, so "its minimum is its content" is unstated ` +
          `(and this arm's negative has no subject)`,
      )
    } else {
      for (const rule of headRules) {
        const figure = extentFigure(rule.body)
        if (figure !== null) {
          problems.push(
            `(f1b) \`${rule.selector}\` (index.html:${rule.line}) fixes the head's box with the length figure \`${figure}\` — the head's box is ` +
              `CONTENT-derived (\`auto\`/\`min-content\`); a figure here is the second authority \`§1\` (4) refuses`,
          )
        }
      }
    }

    // ---- (f2) THE COLLAPSED ARMS: BOTH orientation keys PRESENT, each `auto` on the axis that
    // orientation makes adjustable, each AGREED with `panePaintAxesOf(zone)`, and NO FIGURE
    // CONSTANT ---------------------------------------------------------------------------------
    // WHY PRESENCE, NOT `.some`: as FIRST filed this arm gathered the collapsed `auto` arms and
    // asserted `.some(...)` — MEASURED, deleting BOTH mandated `[data-orientation]` arms from
    // `src/renderer/index.html` left every limb of this file unchanged (F stayed green), because
    // the `.pane-frame[collapsed='true']:not([zone] *)` stage arm alone satisfied the `.some`. A
    // green that cannot fail is a defect in the battery, so the reading is per-ORIENTATION now: a
    // missing key is named BY KEY, and each arm's axis is cross-checked against the helper that
    // names the same split (`§3` C) — the sheet and the helper are two copies of ONE axis split,
    // and this arm is where their agreement is graded.
    const sheet = readText(INDEX_HTML)
    const collapsedArms = paneRules.filter((rule) => /pane-frame/.test(rule.selector) && /collapsed/.test(rule.selector))
    type Orientation = 'vertical' | 'horizontal'
    const ORIENTATION_KEYS: readonly Orientation[] = ['vertical', 'horizontal']
    /** `§2` C-4's axis split, pinned as a LITERAL: a sheet that drifted TOGETHER with the helper
     *  still reds, so the helper below is a CROSS-check and never the only copy of the claim. */
    const ADJUSTABLE_OF: Record<Orientation, 'height' | 'width'> = { vertical: 'height', horizontal: 'width' }
    /** Every EXTENT declaration a rule body states (`EXTENT_PROPS` order, values trimmed). */
    const extentDecls = (body: string): Array<{ prop: string; value: string }> => {
      const out: Array<{ prop: string; value: string }> = []
      for (const prop of EXTENT_PROPS) {
        for (const found of body.matchAll(new RegExp(`(?:^|[;{\\s])${prop}\\s*:\\s*([^;}]+)`, 'g'))) {
          out.push({ prop, value: found[1]!.trim() })
        }
      }
      return out
    }
    /** The pane-family collapsed rules KEYED ON ONE `[data-orientation]` value in one sheet TEXT. */
    const orientationArms = (src: string, orientation: Orientation): CssRule[] => {
      const key = new RegExp(`data-orientation\\s*=\\s*['"]${orientation}['"]`)
      return paneFamilyRules(cssRules(src)).filter(
        (rule) => key.test(rule.selector) && /pane-frame/.test(rule.selector) && /collapsed/.test(rule.selector),
      )
    }
    /** The helper's OWN answer for a zone, as this arm's cross-check reads it. */
    const helperAxis = (zone: Zone): { adjustable: string | null; error: string | null } => {
      if (helper === null) return { adjustable: null, error: null }
      try {
        const raw = helper(zone) as { adjustable?: unknown } | null | undefined
        if (raw === null || typeof raw !== 'object') return { adjustable: null, error: `answered ${JSON.stringify(raw ?? null)}, not an object` }
        return { adjustable: typeof raw.adjustable === 'string' ? raw.adjustable : null, error: null }
      } catch (error) {
        return { adjustable: null, error: `THREW (${String(error)})` }
      }
    }
    /** (f2)'s WHOLE reading over ONE sheet text — the real file, and every mutation below. */
    const collapsedArmProblems = (src: string, label: string): { problems: string[]; arms: string } => {
      const out: string[] = []
      const described: string[] = []
      for (const orientation of ORIENTATION_KEYS) {
        const want = ADJUSTABLE_OF[orientation]
        const arms = orientationArms(src, orientation)
        if (arms.length === 0) {
          out.push(
            `(f2)${label} NO collapsed \`auto\` arm keyed on \`[data-orientation='${orientation}']\` exists in the sheet — §2 C-4 mandates the ` +
              `\`auto\`-on-the-adjustable-axis rule PER ZONE ORIENTATION and the ${orientation} one is ABSENT, so a ${orientation}-oriented ` +
              `(collapsed) frame paints with no adjustable axis stated at all. The missing KEY is named, not merely a missing declaration`,
          )
          continue
        }
        const autoAxes = [
          ...new Set(arms.flatMap((rule) => extentDecls(rule.body).filter((decl) => /^auto$/.test(decl.value)).map((decl) => decl.prop))),
        ]
        described.push(
          `${orientation}: ${arms.map((rule) => `${rule.selector} (index.html:${rule.line}) ⇒ ${autoAxes.length === 0 ? 'NO `auto`' : autoAxes.join('+')}`).join(' | ')}`,
        )
        if (!autoAxes.includes(want)) {
          out.push(
            `(f2)${label} the \`[data-orientation='${orientation}']\` arm(s) [${arms.map((rule) => rule.selector).join(' | ')}] read \`auto\` on ` +
              `[${autoAxes.join(', ') || 'NO extent axis'}] — §2 C-4 makes the ${orientation} orientation's ADJUSTABLE axis \`${want}\`, so the ` +
              `collapsed extent is stated on the wrong axis (a collapsed frame keeps its fill relation and takes its HEAD's extent)`,
          )
        }
        for (const zone of CLOSED_ZONES) {
          if (zoneOrientation(zone) !== orientation) continue
          const answer = helperAxis(zone)
          if (answer.error !== null) {
            out.push(
              `(f2)${label} THE CROSS-CHECK HAS NO READING — \`panePaintAxesOf('${zone}')\` ${answer.error}, so the sheet's ${orientation} arm ` +
                `cannot be compared with the helper (fail-closed, never a silent pass)`,
            )
            continue
          }
          if (answer.adjustable === null) {
            out.push(
              `(f2)${label} THE CROSS-CHECK HAS NO READING — \`panePaintAxesOf('${zone}')\` names no \`adjustable\` member for the ${zone} zone, so ` +
                `the sheet's ${orientation} arm has nothing to agree with`,
            )
            continue
          }
          if (answer.adjustable !== want || !autoAxes.includes(answer.adjustable)) {
            out.push(
              `(f2)${label} DRIFT — the sheet's \`[data-orientation='${orientation}']\` arm makes [${autoAxes.join(', ') || 'NO extent axis'}] ` +
                `adjustable, but \`panePaintAxesOf('${zone}')\` names \`adjustable: '${answer.adjustable}'\` for that ${orientation}-orientation ` +
                `zone — the paint and the helper are two copies of ONE axis split and must name the same member (\`§3\` C's helper is the reading ` +
                `the sheet has to agree with, so neither copy can drift alone)`,
            )
          }
        }
      }
      return { problems: out, arms: described.join('; ') }
    }
    const realArms = collapsedArmProblems(sheet, '')
    problems.push(...realArms.problems)
    for (const rule of collapsedArms) {
      const figure = extentFigure(rule.body)
      if (figure !== null) {
        problems.push(
          `(f2) the collapsed arm \`${rule.selector}\` (index.html:${rule.line}) fixes an EXTENT with the length figure \`${figure}\` — the ` +
            `collapsed extent is content-derived, so a \`DEFAULT_PANE_COLLAPSED_SIZE\`-shaped literal here reds (§3 F/f2, \`ASM-U2-1\`). ` +
            `Padding and the glyph's box are NOT this arm's subject`,
        )
      }
    }
    // ---- (f2) THE TWO MUTATIONS — the presence half and the agreement half must each be able to
    // SEE the defect they name, on a MUTATED COPY of the sheet text (the real file is never
    // written). MEASURED pre-repair: with both arms deleted the old `.some` arm stayed green.
    const mutationReadings: string[] = []
    {
      const isOrientationLine = (line: string, orientation: Orientation): boolean =>
        new RegExp(`data-orientation\\s*=\\s*['"]${orientation}['"]`).test(line) && /pane-frame/.test(line) && /collapsed/.test(line)
      // (i) DELETE ONE of the two mandated arms.
      const withoutHorizontal = sheet.split('\n').filter((line) => !isOrientationLine(line, 'horizontal')).join('\n')
      if (withoutHorizontal === sheet) {
        problems.push(
          `(f2) THE FALSIFIER FAILED — mutation (i) could not find a \`[data-orientation='horizontal']\` collapsed arm line to delete, so the ` +
            `PRESENCE tooth's discrimination is unproven`,
        )
      } else {
        const mutated = collapsedArmProblems(withoutHorizontal, ' [mutation (i): horizontal arm DELETED]')
        mutationReadings.push(`(i) horizontal arm DELETED ⇒ ${mutated.problems.length} named problem(s)`)
        if (!mutated.problems.some((problem) => /NO collapsed/.test(problem) && problem.includes("[data-orientation='horizontal']"))) {
          problems.push(
            `(f2) THE FALSIFIER FAILED — mutation (i) deleted the \`[data-orientation='horizontal']\` arm and this arm reported ` +
              `${mutated.problems.length} problem(s) [${mutated.problems.join(' | ') || 'NONE'}], none naming the missing key: the PRESENCE half ` +
              `cannot see a missing mandated arm`,
          )
        }
      }
      // (ii) SWAP the two arms' axes — the drift between the sheet and `panePaintAxesOf`.
      const flipAxis = (line: string): string =>
        line.replace(
          /(^|[;{\s])(min-|max-)?(height|width)(\s*:\s*auto)/g,
          (_all, lead: string, size: string | undefined, axis: string, tail: string) =>
            `${lead}${size ?? ''}${axis === 'height' ? 'width' : 'height'}${tail}`,
        )
      const swapped = sheet
        .split('\n')
        .map((line) => (ORIENTATION_KEYS.some((orientation) => isOrientationLine(line, orientation)) ? flipAxis(line) : line))
        .join('\n')
      if (swapped === sheet) {
        problems.push(
          `(f2) THE FALSIFIER FAILED — mutation (ii) could not swap the two arms' \`auto\` axes, so the AGREEMENT half's discrimination is unproven`,
        )
      } else {
        const mutated = collapsedArmProblems(swapped, ' [mutation (ii): axes SWAPPED]')
        mutationReadings.push(
          `(ii) axes SWAPPED ⇒ ${mutated.problems.length} named problem(s), DRIFT ${mutated.problems.some((problem) => /DRIFT/.test(problem)) ? 'reported' : 'MISSING'}`,
        )
        if (!mutated.problems.some((problem) => /DRIFT/.test(problem) && problem.includes('panePaintAxesOf'))) {
          problems.push(
            `(f2) THE FALSIFIER FAILED — mutation (ii) swapped the two arms' axes and this arm reported ${mutated.problems.length} problem(s) ` +
              `[${mutated.problems.join(' | ') || 'NONE'}], none of them a DRIFT against \`panePaintAxesOf\`: the helper cross-check is not ` +
              `discriminating`,
          )
        }
      }
    }
    // The constant itself, wherever it would live.
    const constants = readings(SRC_FILES, /DEFAULT_PANE_COLLAPSED_SIZE|PANE_COLLAPSED_SIZE|COLLAPSED_PANE_SIZE/)
    if (constants.length > 0) {
      problems.push(`(f2) a remembered collapsed PANE SIZE constant is declared under src/: ${format(constants)} — the collapsed extent is \`auto\`, never a stored figure`)
    }

    expect(
      problems,
      `limb F — the minimum is the head (\`§3\` limb F, sub-arms f1/f2; §2 C-4, \`ASM-U2-1\`/\`ASM-U2-7\`). The census walked ` +
        `${SRC_FILES.length} file(s) under src/ and ${paneRules.length} pane-block rule(s) in \`index.html\`. ${problems.length} problem(s). ` +
        `THE COLLAPSED ARMS READ: ${realArms.arms || '(NONE — no orientation arm exists)'}. THE LEDGER: (f1a) NO clamp/floor of a pane or head ` +
        `extent exists anywhere in \`src/**\` (no \`Math.max\` on a head extent, no JS-written \`min-height\`); (f1b) the head rule declares no ` +
        `extent figure; (f2) BOTH \`[data-orientation]\` arms are PRESENT (each missing one reds BY KEY), each reads \`auto\` on the axis ` +
        `\`panePaintAxesOf(zone)\` names for that orientation (a sheet/helper DRIFT reds), and no arm carries a figure constant (a ` +
        `\`DEFAULT_PANE_COLLAPSED_SIZE\`-shaped literal reds). Two NAMED mutations keep (f2) a reading: a deleted orientation arm must red the ` +
        `presence half by name, and swapped axes must red the DRIFT half — MEASURED pre-repair, deleting BOTH arms left this limb green. ` +
        `THE MUTATIONS READ: ${mutationReadings.join(' | ') || '(NONE — no mutation could be built)'}. ` +
        `LAYER: a SOURCE census — the \`min-content\` FLOOR itself is a painted fact and belongs to \`G8\` alone (the head's box under a squeezed zone)`,
    ).toEqual([])
  })

  it('G — the gutter pill: `::before` is the line, `::after` the capped pill, its ink COMPUTED quieter than the line in BOTH themes, the fifteen tokens unmoved and the lane\'s box untouched', () => {
    const problems: string[] = []
    const html = readText(INDEX_HTML)
    const rules = indexRules()
    const gutterRules = rules.filter((rule) => /\.gutter/.test(rule.selector))

    // ---- (g1) THE TWO PSEUDOS, IN THE SAME LANE FAMILY ----------------------------------------
    const lineRules = gutterRules.filter((rule) => /::before/.test(rule.selector) && /\.gutter\[zone\]/.test(rule.selector))
    const pillRules = gutterRules.filter((rule) => /::after/.test(rule.selector) && /\.gutter\[zone\]/.test(rule.selector))
    if (lineRules.length === 0) {
      problems.push(
        `(g1) NO \`.gutter[zone]::before\` rule exists in \`index.html\` — §2 C-6's DIVIDER (the lane's own ink down its long axis) is absent; ` +
          `the landed lane paints its whole 6px box with \`background: var(--border)\` (index.html:388) and has no pseudo at all`,
      )
    }
    if (pillRules.length === 0) {
      problems.push(
        `(g1) NO \`.gutter[zone]::after\` rule exists in \`index.html\` — §2 C-6's PILL is absent (the lane's whole box is the pressed target today)`,
      )
    }

    // ---- (g2) THE THREE FIGURES AND THE CENTRING ----------------------------------------------
    const pillBody = pillRules.map((rule) => rule.body).join('\n')
    const figures: Array<{ label: string; pattern: RegExp }> = [
      { label: 'the LONG axis `min(48px, 100%)`', pattern: /min\(\s*48px\s*,\s*100%\s*\)/ },
      { label: 'the THIN axis `min(7px, 100%)`', pattern: /min\(\s*7px\s*,\s*100%\s*\)/ },
      { label: 'a FULL-ROUND radius', pattern: /border-radius\s*:\s*(?:999|9999|99999)px|border-radius\s*:\s*(?:50%|100%|100vmax|10rem)/ },
      { label: 'AUTO-MARGIN centring', pattern: /(?:^|[;{\s])margin(?:-[a-z]+)?\s*:\s*(?:auto\b|[^;]*\bauto\b)/ },
    ]
    for (const figure of figures) {
      if (!figure.pattern.test(pillBody)) {
        problems.push(
          `(g2) the pill rule(s) [${pillRules.map((rule) => rule.selector).join(' | ') || 'NONE'}] do not declare ${figure.label} — §2 C-6 fixes ` +
            `the pill at \`min(48px, 100%)\` long, \`min(7px, 100%)\` thin (the lane is 6px, so a literal 7px would paint OUTSIDE the lane it ` +
            `belongs to), a full-round radius and auto-margin centring (\`ASM-U2-5\`)`,
        )
      }
    }

    // ---- (g3) THE INK, COMPUTED FROM THE FILE'S OWN THEME LITERALS ----------------------------
    // ONE function over ONE sheet TEXT, so the SAME reading runs on MUTATED COPIES below: a
    // predicate only ever asked about the landed sheet cannot show that it discriminates.
    const blocks = themeBlocks(html)
    interface InkDecl {
      prop: string
      value: string
    }
    const inkProblems = (
      src: string,
      label: string,
    ): { problems: string[]; readings: string[]; line: InkDecl | null; pill: InkDecl | null } => {
      const out: string[] = []
      const read: string[] = []
      const gutter = cssRules(src).filter((rule) => /\.gutter/.test(rule.selector))
      const lineArms = gutter.filter((rule) => /::before/.test(rule.selector) && /\.gutter\[zone\]/.test(rule.selector))
      const pillArms = gutter.filter((rule) => /::after/.test(rule.selector) && /\.gutter\[zone\]/.test(rule.selector))
      const pillText = pillArms.map((rule) => rule.body).join('\n')
      const lineDecl = lineArms.length === 0 ? null : declOf(lineArms.map((rule) => rule.body).join(';'), ['background-color', 'background', 'color'])
      const pillDecl = pillArms.length === 0 ? null : declOf(pillText, ['background-color', 'background', 'color'])
      if (lineDecl === null) out.push(`(g3)${label} the \`::before\` DIVIDER declares no background/color ink — there is no line to be quieter than`)
      if (pillDecl === null) {
        out.push(
          `(g3)${label} the \`::after\` PILL declares no background/color ink — §2 C-6 DERIVES it (\`color-mix\` toward \`--bg\`, opaque), it is ` +
            `never a new declaration`,
        )
      }
      const own = themeBlocks(src)
      for (const [themeLabel, decls] of [
        ['light', own.light],
        ['dark', own.dark],
      ] as Array<[string, Decls]>) {
        const bg = decls['--bg']
        if (bg === undefined) {
          out.push(`(g3)${label} the ${themeLabel} theme block declares no \`--bg\` — the ratio has no background to be measured against`)
          continue
        }
        const bgColor = resolveColor(bg, decls)
        if (bgColor === null) {
          out.push(`(g3)${label} \`--bg: ${bg}\` in the ${themeLabel} theme block is not a resolvable colour`)
          continue
        }
        if (lineDecl === null || pillDecl === null) continue
        const lineInk = resolveColor(lineDecl.value, decls)
        const pillInk = resolveColor(pillDecl.value, decls)
        if (lineInk === null) {
          out.push(
            `(g3)${label} the ${themeLabel} theme cannot resolve the DIVIDER's ink \`${lineDecl.prop}: ${lineDecl.value}\` from its own tokens ` +
              `[${Object.keys(decls).length} declared] — a derived ink must resolve to a literal the file itself carries`,
          )
          continue
        }
        if (pillInk === null) {
          out.push(
            `(g3)${label} the ${themeLabel} theme cannot resolve the PILL's ink \`${pillDecl.prop}: ${pillDecl.value}\` — §2 C-6 derives it from ` +
              `the block's OWN declared tokens (\`color-mix\` toward \`--bg\`), so it must resolve here or it is an undeclared authority`,
          )
          continue
        }
        if (pillInk.a < 1) {
          out.push(
            `(g3)${label} the ${themeLabel} theme's pill ink resolves to alpha ${round3(pillInk.a)} — §2 C-6 (\`ASM-U2-6\`) refuses TRANSLUCENCY: an ` +
              `alpha fill makes a colour a function of what it covers (\`D-285\`)`,
          )
        }
        const lineRatio = contrastRatio(lineInk, bgColor)
        const pillRatio = contrastRatio(pillInk, bgColor)
        read.push(`${themeLabel}: line ${round3(lineRatio)} vs pill ${round3(pillRatio)} against --bg ${bg}`)
        if (!(pillRatio < lineRatio)) {
          out.push(
            `(g3)${label} in the ${themeLabel} theme the PILL's ink reads a contrast ratio of ${round3(pillRatio)} against \`--bg\`, NOT strictly ` +
              `lower than the DIVIDER's ${round3(lineRatio)} (\`${pillDecl.value}\` vs \`${lineDecl.value}\`) — §2 C-6's \`quieter-than\` predicate ` +
              `is VIOLATED: the pill is QUIETER than the line, and "quieter" is this computed reading, never a taste claim`,
          )
        }
      }
      return { problems: out, readings: read, line: lineDecl, pill: pillDecl }
    }
    const realInk = inkProblems(html, '')
    problems.push(...realInk.problems)
    const inkReadings = realInk.readings
    const mutationReadings: string[] = []

    // ---- (g3-falsifier) THE `quieter-than` PREDICATE MUST REJECT AN EQUAL INK AND AN INVERTED ONE
    // WHY: as FIRST filed this block read `if (equalRatio < equalRatio)` — an expression compared
    // with ITSELF, which can never be true (MEASURED: dead code; the arm labelled "the equal-ink
    // falsifier" proved nothing). Both falsifiers below MUTATE the sheet's own two inks in a COPY
    // of its text and require the reading to hand the NAMED `quieter-than` violation back.
    {
      const pillRule = pillRules[0]
      const pillBodyText = pillRule?.body ?? ''
      if (realInk.line === null || realInk.pill === null || pillBodyText === '' || !html.includes(pillBodyText)) {
        problems.push(
          '(g3) the sheet offers no resolvable PILL rule body to mutate — neither the EQUAL-ink nor the INVERTED-ink falsifier has a subject, so ' +
            'the `quieter-than` half cannot show it discriminates',
        )
      } else {
        const pillDecl = realInk.pill
        /** Rewrite the pill's ink to `value` in a COPY of the sheet text (the file is never written). */
        const withPillInk = (value: string): string => {
          const patched = pillBodyText.replace(
            new RegExp(`(^|[;{\\s])${pillDecl.prop}\\s*:\\s*[^;}]+`),
            `$1${pillDecl.prop}: ${value}`,
          )
          return html.replace(pillBodyText, () => patched)
        }
        const mutations: Array<{ name: string; value: string; why: string }> = [
          {
            name: 'EQUAL ink',
            value: realInk.line.value,
            why: 'the pill set to the DIVIDER\'s own colour, so the two ratios are EQUAL and `quieter-than` is violated',
          },
          {
            name: 'INVERTED ink',
            value: 'var(--fg)',
            why: 'the pill set STRONGER than the line, so the pill reads louder and `quieter-than` is violated',
          },
        ]
        for (const mutation of mutations) {
          const mutated = withPillInk(mutation.value)
          if (mutated === html) {
            problems.push(
              `(g3) THE FALSIFIER FAILED — the ${mutation.name} mutation did not rewrite the pill's \`${pillDecl.prop}\` declaration, so this ` +
                `arm's discrimination is unproven`,
            )
            continue
          }
          const reading = inkProblems(mutated, ` [falsifier: ${mutation.name}]`)
          mutationReadings.push(
            `${mutation.name} (pill \`${mutation.value}\`) ⇒ ${reading.problems.length} named problem(s), \`quieter-than\` ${reading.problems.some((problem) => /quieter-than/.test(problem)) ? 'reported' : 'MISSING'}`,
          )
          if (!reading.problems.some((problem) => /quieter-than/.test(problem))) {
            problems.push(
              `(g3) THE FALSIFIER FAILED — the ${mutation.name} sheet (pill \`${pillDecl.prop}: ${mutation.value}\`, ${mutation.why}) read ` +
                `${reading.problems.length} problem(s) [${reading.problems.join(' | ') || 'NONE'}], none of them the \`quieter-than\` violation: ` +
                `the GREEN half this arm reports is not discriminating`,
            )
          }
        }
        // The POSITIVE control, kept as filed: the READER can see a genuinely quieter DERIVED ink,
        // so a comparator that reports "not quieter" on everything is caught too.
        const decls = blocks.light
        const bg = decls['--bg'] === undefined ? null : resolveColor(decls['--bg']!, decls)
        if (bg === null) {
          problems.push('(g3) the light theme block no longer carries a resolvable `--bg` literal — the ratio falsifiers have no subject')
        } else {
          const lineInk = resolveColor(realInk.line.value, decls)
          const quiet = resolveColor('color-mix(in srgb, var(--border) 40%, var(--bg))', decls)
          if (lineInk === null || quiet === null || !(contrastRatio(quiet, bg) < contrastRatio(lineInk, bg))) {
            problems.push(
              `(g3) THE FALSIFIER FAILED — a 40% \`color-mix(var(--border), var(--bg))\` does not read STRICTLY QUIETER than the line in the light ` +
                `theme, so no derived ink could ever satisfy this arm (the reader, not the sheet, would be the problem)`,
            )
          }
        }
      }
    }

    // ---- (g4) THE `G-5` FIFTEEN-TOKEN CENSUS -------------------------------------------------
    for (const [label, decls] of [
      ['the `:root`/light block', blocks.light],
      ["the `html[theme='dark']` block", blocks.dark],
      ['the `@media` fallback block', blocks.media],
    ] as Array<[string, Decls]>) {
      const names = Object.keys(decls).sort()
      if (names.join(',') !== G5_TOKENS.join(',')) {
        problems.push(
          `(g4) ${label} declares [${names.join(', ')}] (${names.length}), not the pinned fifteen [${G5_TOKENS.join(', ')}] — §2 C-6: NO custom ` +
            `property is declared inside the three theme blocks; the pill's ink is DERIVED, so the \`G-5\` census is unmoved (\`ASM-U2-6\`)`,
        )
      }
    }

    // ---- (g5) THE LANE'S OWN BOX IS UNMOVED --------------------------------------------------
    {
      const laneRule = rules.find((rule) => rule.selector.trim() === '#app .gutter[zone]')
      if (laneRule === undefined) {
        problems.push('(g5) the `#app .gutter[zone]` box rule is ABSENT — the lane has no box for the pill to sit in')
      } else {
        for (const [prop, want] of [
          ['position', 'fixed'],
          ['z-index', '3'],
          ['background', 'var(--border)'],
          ['touch-action', 'none'],
        ] as Array<[string, string]>) {
          const declared = declOf(laneRule.body, [prop])
          if (declared === null || declared.value.replace(/\s+/g, ' ') !== want) {
            problems.push(
              `(g5) \`#app .gutter[zone]\` (index.html:${laneRule.line}) declares \`${prop}: ${declared === null ? '(absent)' : declared.value}\`, not ` +
                `\`${want}\` — the lane's box is UNMOVED: the pill is a PSEUDO, so the hover target stays the WHOLE lane (\`D-8\`, §2 C-6)`,
            )
          }
        }
        for (const prop of ['width', 'height']) {
          if (declOf(laneRule.body, [prop]) !== null) {
            problems.push(`(g5) \`#app .gutter[zone]\` now declares \`${prop}\` — a box on the lane itself moves the hover target the pill must not move`)
          }
        }
      }
      const AXIS: Array<{ zone: Zone; prop: 'width' | 'height' }> = [
        { zone: 'left', prop: 'width' },
        { zone: 'right', prop: 'width' },
        { zone: 'top', prop: 'height' },
        { zone: 'bottom', prop: 'height' },
      ]
      for (const axis of AXIS) {
        const rule = rules.find((candidate) => candidate.selector.includes(`#app .gutter[id='zone-gutter-${axis.zone}']`))
        if (rule === undefined) {
          problems.push(`(g5) the \`#app .gutter[id='zone-gutter-${axis.zone}']\` box rule is ABSENT — the ${axis.zone} lane has no box`)
          continue
        }
        const thickness = declOf(rule.body, [axis.prop])
        if (thickness === null || thickness.value !== '6px') {
          problems.push(
            `(g5) the ${axis.zone} lane's \`${axis.prop}\` reads ${thickness === null ? '(absent)' : thickness.value}, not '6px' — §2 C-6/` +
              `\`ASM-U2-5\` keeps the lane at 6px and caps the pill at \`min(7px, 100%)\` instead of widening the lane`,
          )
        }
        const inset = declOf(rule.body, [axis.prop === 'width' ? 'left' : 'top'])
        const insetValue = inset?.value ?? declOf(rule.body, [axis.prop === 'width' ? 'right' : 'bottom'])?.value ?? ''
        if (axis.zone === 'left' || axis.zone === 'top') {
          if (!insetValue.includes(`var(--zone-${axis.zone}-track)`)) {
            problems.push(`(g5) the ${axis.zone} lane no longer anchors on \`var(--zone-${axis.zone}-track)\` (reads ${JSON.stringify(insetValue)})`)
          }
        }
      }
    }

    expect(
      problems,
      `limb G — the gutter pill (\`§3\` limb G, sub-arms g1…g5; §2 C-6, \`ASM-U2-5\`/\`ASM-U2-6\`). INK READINGS: ${inkReadings.join('; ') || '(none — no pill/line ink to resolve)'}. ` +
        `${problems.length} problem(s). THE LEDGER: (g1) \`::before\` is the LINE and \`::after\` the PILL; (g2) the three figures (\`min(48px,100%)\`, ` +
        `\`min(7px,100%)\`, a full-round radius) and auto-margin centring; (g3) the pill's ink COMPUTED from the file's OWN theme literals reads a ` +
        `STRICTLY LOWER WCAG ratio than the line's in BOTH themes — and that predicate is PROVEN discriminating by TWO mutated sheets (an ` +
        `EQUAL-ink pill and an INVERTED-ink pill must each hand back the named \`quieter-than\` violation); (g4) no custom property is declared ` +
        `inside the three theme blocks (the \`G-5\` fifteen-token census); (g5) the lane's own box declaration is UNMOVED. ` +
        `THE MUTATIONS READ: ${mutationReadings.join(' | ') || '(NONE — the sheet offered no pill ink to mutate)'}. ` +
        `LAYER: a SOURCE clause — the pill's PAINTED box, its painted ink and the lane's hit-test are \`G8\`-only (\`uf_panes_8\`'s fifth term)`,
    ).toEqual([])
  })

  it('H — the vocabulary census: `pane-collapse-toggle` is gone from `src/**` + `index.html` + `scripts/**`, the five foundation classes are authored, and the frame keeps its `data-pane-id`', async () => {
    const problems: string[] = []
    const census = [...SRC_FILES, ...SCRIPT_FILES, `${ROOT}${INDEX_HTML}`]
    // NON-VACUITY FLOOR: the corpus must be the whole shell, or a zero-offender reading means nothing.
    expect(
      census.length,
      `the vocabulary census walked ${census.length} file(s) (${SRC_FILES.length} under src/, ${SCRIPT_FILES.length} under scripts/, + index.html) — ` +
        `a corpus that small cannot carry the shell`,
    ).toBeGreaterThan(60)

    // ---- (h1) THE SUPERSEDED SPELLING DOES NOT SURVIVE ----------------------------------------
    const offenders = readings(census, new RegExp(SUPERSEDED_HEADER_CLASS))
    const offenderFiles = [...new Set(offenders.map((reading) => reading.file))]
    problems.push(
      ...offenders
        .slice(0, 8)
        .map(
          (reading) =>
            `(h1) the SUPERSEDED class \`${SUPERSEDED_HEADER_CLASS}\` still reads at ${reading.file}:${reading.line} — §2 C-5/D-14: the foundation's ` +
            `\`pane-grab\` (the DRAG surface) and \`pane-collapse\` (the CONTROL) supersede it, and it must not survive in src/**, index.html or scripts/**`,
        ),
    )
    if (offenders.length > 8) {
      problems.push(`(h1) …and ${offenders.length - 8} further superseded-spelling offender(s) across [${offenderFiles.join(', ')}]: ${format(offenders)}`)
    }

    // ---- (h2) THE FIVE FOUNDATION CLASSES ARE AUTHORED, EACH WHERE IT BELONGS -------------------
    const graphText = readText('src/renderer/pane-graph.ts')
    const htmlText = readText(INDEX_HTML)
    for (const name of FOUNDATION_CLASSES) {
      const authoredInGraph = new RegExp(`['"\`]${name}['"\`]`).test(graphText)
      if (!authoredInGraph) {
        problems.push(
          `(h2) the foundation class \`${name}\` is never AUTHORED as a class literal in \`src/renderer/pane-graph.ts\` — §2 C-1/D-14 move the ` +
            `vocabulary to the five foundation classes, and a class the model never authors is a name only the sheet knows`,
        )
      }
      const paintedInSheet = new RegExp(`\\.${name}(?![\\w-])`).test(htmlText)
      if (!paintedInSheet && name !== 'pane-drop') {
        problems.push(`(h2) \`index.html\` carries no \`.${name}\` rule — the foundation class is authored but nothing paints it (§2 C-2/C-4)`)
      }
    }

    // ---- (h3) THE OPERANDS: the control carries `props.pane`, the FRAME keeps `data-pane-id` ---
    // Both are read off the AUTHORED node, so this arm needs no export: `assemble` is the same
    // harness limbs `A`/`E` use.
    const paneId = 'probe-h-vocab'
    const assembly = assemble({ panes: [{ id: paneId, zone: 'left', title: 'Vocab Probe' }] })
    const frame = frameFor(assembly.frames, paneId)
    if (frame === undefined) {
      problems.push(`(h3) no pane frame for "${paneId}" was assembled — the two operands have no subject`)
    } else {
      if (propText(frame, 'data-pane-id') !== paneId) {
        problems.push(
          `(h3) the FRAME carries props['data-pane-id'] ${JSON.stringify(propText(frame, 'data-pane-id'))}, not "${paneId}" — §1: the frame KEEPS ` +
            `\`data-pane-id\` (the drag's identity source and 40+ driver reads) while the CONTROL's operand moves to \`props.pane\``,
        )
      }
      const control = findNode(descendants(frame), `pane-collapse-${paneId}`)
      if (control === undefined) {
        problems.push(`(h3) no \`pane-collapse-${paneId}\` node exists in the frame — the control's operand has no subject`)
      } else if (propText(control, 'pane') !== paneId) {
        problems.push(
          `(h3) the collapse control carries props.pane ${shown(propText(control, 'pane'))} (props keys: ` +
            `[${Object.keys(control.props ?? {}).join(', ')}]) — §1/§2 C-1 moves the control's address to \`props.pane\``,
        )
      }
    }

    expect(
      problems,
      `limb H — the vocabulary census (\`§3\` limb H; §2 C-5, D-14). The walk read ${census.length} file(s); the superseded spelling read ` +
        `${offenders.length} time(s) across [${offenderFiles.join(', ')}]. ${problems.length} problem(s). ` +
        `THE LEDGER: the superseded class does not survive under \`src/**\`, \`index.html\` or \`scripts/**\`; the FIVE foundation classes ` +
        `(\`${FOUNDATION_CLASSES.join('`, `')}\`) are present; the control carries \`props.pane\` and the frame KEEPS \`data-pane-id\`. ` +
        `LAYER: a source/data census — the superseded class's PAINT is not asserted anywhere, and the live driver's re-grain (\`C-7\`) is a ` +
        `separate, unowned reading of this row`,
    ).toEqual([])
  })

  it('I — no hand-written DOM: the five ids/classes are AUTHORED data in `pane-graph.ts`, and no `createElement`/`innerHTML`/`setAttribute` site stamps any of them', () => {
    const problems: string[] = []
    const graphText = readText('src/renderer/pane-graph.ts')
    const htmlText = readText(INDEX_HTML)

    // ---- (i1) THE POSITIVE HALF: the ids/classes are the MODEL's, authored as DATA -------------
    for (const prefix of AUTHORED_ID_PREFIXES) {
      if (!graphText.includes(prefix)) {
        problems.push(
          `(i1) the authored id prefix \`${prefix}\` appears NOWHERE in \`src/renderer/pane-graph.ts\` — §2 C-1 authors ` +
            `\`${prefix}<id>\` as provident DATA (D-8); an id the model never authors is either hand-written DOM or absent`,
        )
      }
    }
    for (const name of FOUNDATION_CLASSES) {
      if (!new RegExp(`['"\`]${name}['"\`]`).test(graphText)) {
        problems.push(`(i1) the class \`${name}\` is not authored as a class literal in \`pane-graph.ts\` — it is not part of the authored bar`)
      }
    }
    // The drop ids carry the ZONE, so the closed-four shape is authored as a template over the
    // zone — ONE arm, not four: four copies of one reading would pad the list, not widen it.
    const TEMPLATE_SHAPE = /pane-grab-\$\{[^}]+\}-\$\{[^}]+\}/
    const CONCAT_SHAPE = /pane-grab-['"`]\s*\+/
    if (!TEMPLATE_SHAPE.test(graphText) && !CONCAT_SHAPE.test(graphText)) {
      problems.push(
        '(i1) no authored `pane-grab-<id>-<zone>` id shape is present in `pane-graph.ts` — neither a `pane-grab-${paneId}-${zone}` template ' +
          'nor a `\'pane-grab-\' + …` concatenation carries the FOURTH part of the id family. §2 C-1 authors ONE drop per closed zone ' +
          'carrying BOTH operands (`props.pane`/`props.zone`)',
      )
    }

    // ---- (i2) THE NEGATIVE HALF: no DOM-stamping site produces any of them ---------------------
    // A "stamping site" is a line carrying `createElement`/`innerHTML`/`setAttribute`; the ±2-line
    // window is the reading, because a stamped node's id/class is usually stated on the next line.
    const stamper = /createElement|innerHTML|setAttribute|\.className\s*=/
    const paneToken = new RegExp(AUTHORED_ID_PREFIXES.map((prefix) => prefix.slice(0, -1)).join('|').replace(/\./g, '\\.') + '|pane-body|pane-drop|pane-grab|pane-head')
    const stamping: Reading[] = []
    for (const path of SRC_FILES) {
      const file = relative(ROOT, path)
      const text = readText(file)
      if (!stamper.test(text)) continue
      const lines = text.split('\n')
      for (let index = 0; index < lines.length; index++) {
        if (!stamper.test(lines[index]!)) continue
        const window = lines.slice(Math.max(0, index - 2), index + 3).join('\n')
        if (paneToken.test(window) && new RegExp(AUTHORED_ID_PREFIXES.map((p) => p.slice(0, -1)).join('|')).test(window)) {
          stamping.push({ file, line: index + 1, text: lines[index]!.trim().slice(0, 140) })
        }
      }
    }
    for (const reading of stamping) {
      problems.push(
        `(i2) a DOM-stamping site produces an authored PANE node: ${reading.file}:${reading.line} \`${reading.text}\` — D-8 / the project-wide ` +
          `UI constraint: pane chrome is provident DATA, never hand-written DOM`,
      )
    }
    // `index.html`'s own body must not hand-author a pane node either (it is a markup file, not a
    // script, so the same rule arrives as a literal tag).
    const body = htmlText.slice(htmlText.indexOf('<body'))
    const authoredTags = [...body.matchAll(/<[a-z][^>]*>/gi)].filter((match) =>
      new RegExp(`${AUTHORED_ID_PREFIXES.map((prefix) => prefix.slice(0, -1)).join('|')}`).test(match[0]),
    )
    for (const tag of authoredTags.slice(0, 4)) {
      problems.push(`(i2) \`index.html\` hand-authors a pane node in markup: \`${tag[0].slice(0, 120)}\` — D-8: the pane chrome comes from the graph`)
    }

    // ---- (i3) THE FALSIFIER: the stamper detector must SEE a planted site ---------------------
    {
      const planted = `<div id="pane-head-x"></div>` + '\n' + `const node = document.createElement('div')` + '\n' + `node.setAttribute('id', 'pane-head-x')`
      const lines = planted.split('\n')
      const seen = lines.some((line, index) => {
        if (!stamper.test(line)) return false
        const window = lines.slice(Math.max(0, index - 2), index + 3).join('\n')
        return paneToken.test(window)
      })
      if (!seen) {
        problems.push('(i3) THE FALSIFIER FAILED — the detector does not see a PLANTED `setAttribute(\'id\', \'pane-head-x\')` site, so this limb\'s negative is blind')
      }
    }

    expect(
      problems,
      `limb I — no hand-written DOM (\`§3\` limb I; D-8, §2 C-1). ${problems.length} problem(s). ${stamping.length} DOM-stamping site(s) carry an ` +
        `authored pane token; ${authoredTags.length} hand-authored pane tag(s) in \`index.html\`'s body. THE LEDGER: the head/grip/drop/control/body ` +
        `ids and classes appear as AUTHORED DATA in \`src/renderer/pane-graph.ts\`, and NO \`createElement\`/\`innerHTML\`/\`setAttribute\` site under ` +
        `\`src/**\` or \`index.html\` stamps any of them. ` +
        `LAYER: a source census (this limb is anti-vacuity: its NEGATIVE half reads green today and carries a planted-site falsifier)`,
    ).toEqual([])
  })
})
