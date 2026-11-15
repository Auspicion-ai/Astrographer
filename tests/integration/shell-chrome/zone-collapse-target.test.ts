// tests/integration/shell-chrome/zone-collapse-target.test.ts — unit `U-1b` `zone-collapse`'s
// OWN ROW, authored BEFORE any byte of the collapse statement moves (RCA-1) and RUN at the
// pre-edit head.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-u-1b-zone-collapse.md` §3 (the red set), AS AMENDED
// BY `strata/decisions.md` D-22 — the EIGHT limbs `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, and
// NOTHING ELSE. Limb `H` (the projection's three arms) was ADDED to §3 on `2026-11-15`, after
// `L2`/`L3` measured that no limb graded the arm that actually makes the extent paint
// (`ASM-U1b-10`); it is `§3`'s own eighth bullet, not an extension of `G`. §2 is the change set
// these limbs pin; §6 is the assumption set they read
// (`ASM-U1b-1` absence is storable and never deleted, `ASM-U1b-2` the seeds omit the member,
// `ASM-U1b-3` the enabled+placed census is the predicate's input, `ASM-U1b-4` no extent constant,
// `ASM-U1b-5` the control is a root-level SIBLING, `ASM-U1b-8` the `auto` extent coexists with
// the landed `0px` empty-track rule, `ASM-U1b-9` the container carries TWO carriers for one
// state).
//
// THE TARGET STATE these rows assert (`§2` `C-1`…`C-3`, D-22 (1) — ONE collapsed state, TWO ways
// to reach it):
//   · `ZoneLayout` = `{ size: number; collapsed?: boolean }`, absence = "nothing stated"; the
//     seeds (`defaultLayout()`) OMIT it on all four zones and `coerceZoneLayout` copies it only
//     when it is exactly `true`/`false` (absence-preserving, never a seeded `false`) — limb `B`;
//   · ONE pure predicate `zoneCollapsedOf(stated, paneCount)` = the statement when one is stated,
//     else `paneCount === 0`; the assembler's zone container carries `is-collapsed` + the
//     `collapsed="true"|"false"` carrier from IT — limb `A`;
//   · ONE state helper `setZoneCollapsed(layout, zone, collapsed)` — an explicit boolean, no
//     census parameter, no emptiness guard, `size` untouched — and ONE act
//     `window.provident.sidebar.zoneCollapseToggle(zone)` that writes the NEGATION of the
//     CURRENT EFFECTIVE state in exactly ONE `setLayout` — limb `C`;
//   · ONE authored control `zoneCollapseControlOf(zone)` (`id: 'zone-collapse-<zone>'`, class
//     `zone-collapse`, `content: ''`, one shared handler name), inserted as the zone container's
//     IMMEDIATE FOLLOWING SIBLING for all four zones, idempotently; the container authors no
//     control child — limb `D`;
//   · the coerced member shape (`size` finite-positive, `collapsed` absent-or-boolean,
//     `version === 1`) — limb `E` (the `P-SM-2` member cell re-grained);
//   · the state VOCABULARY moves (`C-5`) and the superseded spellings do not survive under
//     `src/**`, `index.html`, `scripts/**` or `tests/**` — limb `F`;
//   · no second authority over the collapsed EXTENT: no `DEFAULT_ZONE_COLLAPSED_SIZE`-shaped
//     constant and no `size` write anywhere in the collapse path — limb `G` (`ASM-U1b-4`);
//   · THE PROJECTION'S THREE ARMS (`§2` `C-4`, `ASM-U1b-10`): the REAL pure
//     `zoneTrackVars(registry, layout, opts?)` emits `'auto'` for a COLLAPSED **OCCUPIED** zone,
//     keeps F-3's `'0px'` for an EMPTY zone (stated collapsed or not), keeps `size + 'px'` for an
//     EXPANDED OCCUPIED zone, and keeps `''` (the removal path) for a merely-REVEALED empty zone
//     — reading the state through the SAME `zoneCollapsedOf` predicate the assembler calls —
//     limb `H`. The token is authored twice (`ASM-U1b-10`): this limb grades the JS half only;
//     `index.html`'s declarative `:has()` mirror and the PAINT remain `G8`-only.
//
// ⟨TWO BLIND GREEN ARMS ADDED BY THE POST-LANDING REPAIR PASS — `A'` and `D'` (`G5` follow-up).⟩
// The eight limbs above are KEPT VERBATIM (`RCA-8(c)`, annotate-beside); the two arms below CLOSE
// two gaps that made a green unfalsifiable, and they are cross-referenced from their parents'
// own notes rather than rewriting them:
//   · `A'` — the FOLD's NEGATIVE half. Limb `A`'s (a3) asserts the collapsed occupied zone's tab
//     strip EXISTS, and NEVER that the pane payloads are WITHHELD: an assembler that emitted BOTH
//     the strip and the stack passed `A`. `A'` grades the withholding (`§2` `C-2`) over the
//     envelope's `content` payloads, with a falsifier arm (the SAME panes, the fold NOT stated)
//     proving the detector can read a frame at all.
//   · `D'` — the ADJACENCY **AFTER** re-assembly. Limb `D`'s (iv) grades a COUNT after the second
//     pass, and a count cannot tell a control at `children[indexOf(container) + 1]` from one that
//     drifted a slot later. `D'` grades the ID **AT THE INDEX** for all four zones, drives a STRAY
//     control (moved to the end of `children`) through the second pass to prove the assembler MOVES
//     it rather than keeping it, and pins that `zone:sidebar` carries NONE.
// Both arms are ENVELOPE-class, exactly like their parents: same real assembler, same registry,
// same harness (`assemble`, `reAssembledEnvelope`), no paint, no grid, no window.
//
// LAYER (MANDATORY, `D-10` / `RCA-12`): every limb here is `[T]`/ENVELOPE-class. The assembly in
// `A`/`D` is the fork's REAL assembler (`assembleAppGraphEnvelope`) over a real `PaneRegistry`
// under the LAYOUT-LESS DOM shim: no grid, no paint, no window, no CSS. `C`'s host drive is the
// REAL `SidebarPanes` with the DOM double (`installShim`), never a module mock. This row
// therefore proves the AUTHORED MODEL, the write discipline and the SOURCE vocabulary; it NEVER
// proves the painted app. The four `G8`-only readings (the collapsed extent, the anchored
// control's box and its hit-testability, the glyph, "a collapsed zone offers no resize strip")
// are NOT asserted anywhere in this file.
//
// THE REACHABILITY RULE (the critical constraint of this row): the three symbols this unit ADDS
// (`zoneCollapsedOf`, `setZoneCollapsed`, `zoneCollapseControlOf`) and the two constants it adds
// (`ZONE_COLLAPSE_HANDLER`, and the `zoneCollapseToggle` seam) are reached through
// `await import(...)` into a `Record<string, unknown>` and read with a TYPE check first. A
// missing export is therefore a NAMED problem in the limb's own aggregate assertion — never an
// ESM link-time module-load error, never an unhandled `TypeError`. The reading is deliberately
// NON-FATAL (`readExport`): a limb reports ALL of its sub-arms at one assertion instead of
// masking `c2`-`c4` behind `c1`'s absent export. Every limb still reds with its OWN named
// message, and the file always COLLECTS and RUNS. Limb `H` uses the SAME pattern on an export
// that already exists (`zoneTrackVars` in `layout-state.ts`) for a different reason: the export is
// there at the head but the OPTIONAL STATE MEMBER it must read is not, so `H` reports the absent
// MEMBER as a named problem instead of letting the projection read a dropped statement silently.
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`; it writes
// nothing. Every path is derived from THIS FILE's own location (`ROOT`), so a missing substrate
// FAILS (ENOENT) instead of skipping, and each census carries a non-vacuity guard (a file-count
// floor and a floor on the target spellings) so no negative limb can pass by being blind.
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  coerceLayout,
  defaultLayout,
  LAYOUT_PANE_ZONES,
  LAYOUT_VERSION,
  type LayoutState,
  type LayoutZoneName,
} from '../../../src/renderer/layout-state.js'
import { assembleAppGraphEnvelope } from '../../../src/renderer/pane-graph.js'
import { createPaneRegistry } from '../../../src/renderer/pane-registry.js'
import { SidebarPanes } from '../../../src/renderer/sidebar-panes.js'
import { installShim, ShimElement } from '../../../src/shared/dom-shim.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

/** The four pane zones, in the assembler's payload order. The DOMAIN is a set, so comparisons
 *  over it sort; the enumeration's ORDER is not this unit's subject (`U-1a`'s `B` pinned it). */
const CLOSED_ZONES = ['left', 'right', 'top', 'bottom'] as const
type Zone = (typeof CLOSED_ZONES)[number]

/** The SUPERSEDED state vocabulary (`C-5`'s left column), spelled from PARTS so this row can
 *  FORBID it without CARRYING it: `C-5` requires that not one of these tokens survives under
 *  `src/**`, `index.html`, `scripts/**` or `tests/**`, and this file is under `tests/**`. The
 *  concatenation is the point, not an obfuscation: a literal here would make the census
 *  self-defeating.
 *
 *  ⟨RE-GRAINED BY THE POST-LANDING REPAIR PASS — THE `i` FLAG (`G5` follow-up; the pattern's SET
 *  is UNCHANGED: the same four alternatives, nothing widened or narrowed).⟩ The FOURTH alternative
 *  ('Mini' + 'miz') is spelled with a capital initial, so the as-filed CASE-SENSITIVE pattern
 *  matched only that one casing: three CAPITALISED arm labels of this same family in
 *  `tests/live-drive-contract.test.ts` (the all-caps spelling of this family's past-tense form,
 *  which the arm titles used) read past the census while the census reported zero offenders. The
 *  `i` flag is what makes those three capitalised offenders GRADEABLE — they have since been
 *  re-grained to `COLLAPSED`, so the census's answer stays zero, but it is now an answer the census
 *  can actually give: under the case-sensitive form a re-introduced all-caps spelling would have
 *  been invisible. The word itself is NOT spelled in this comment (a from-parts instrument cannot
 *  quote its own needle without becoming an offender — this file is inside the census corpus). */
const SUPERSEDED = new RegExp(
  ['mini', 'mized'].join('') +
    '|' +
    ['Mini', 'miz'].join('') +
    '|' +
    ['zone-', 'mini', 'mize'].join('') +
    '|' +
    ['pane-zone-', 'mini', 'mize'].join(''),
  'i',
)
/** The superseded control-id PREFIX, likewise spelled from parts. */
const SUPERSEDED_CONTROL_PREFIX = ['zone-', 'mini', 'mize-'].join('')

/** The superseded ZONE-STATE MEMBER, likewise spelled from parts and for the same reason: limb
 *  `H`'s failure message must NAME the member the head still requires (a required total boolean,
 *  `C-5`'s left column) instead of `§2 C-1`'s OPTIONAL statement — a literal here would make limb
 *  `F`'s census self-defeating, since this file lives under `tests/**`. */
const SUPERSEDED_MEMBER = ['mini', 'mized'].join('')

const SRC_ROOT = `${ROOT}src`
const TESTS_ROOT = `${ROOT}tests`
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

interface Reading {
  file: string
  line: number
  text: string
}

/** Every LINE of every walked file matching `pattern`, with the repo-relative file, the 1-based
 *  line number and the trimmed source — the reading a failure message prints, so a red is
 *  diagnosable without re-running the grep by hand. */
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

/** One line per offender, capped, with the overflow counted rather than truncated silently. */
function format(rs: Reading[]): string {
  if (rs.length === 0) return '0'
  const head = rs
    .slice(0, 6)
    .map((r) => `${r.file}:${r.line}: ${r.text}`)
    .join(' | ')
  return `${rs.length}: ${head}${rs.length > 6 ? ` | … (${rs.length - 6} more)` : ''}`
}

/** The file-count floor every census in this row carries: a shallow or empty walk cannot
 *  satisfy any negative below, so a walk that shrinks reds instead of passing blind. */
const SRC_FILES = walkFiles(SRC_ROOT)
const TEST_FILES = walkFiles(TESTS_ROOT).filter((path) => TYPESCRIPT.test(path))

// ---------------------------------------------------------------------------
// THE EXPORT READING — non-fatal by design (see the header): a missing export is a NAMED problem
// in the limb's aggregate assertion, never a module-load error and never a raw `TypeError`.
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
      problems: [
        `limb ${limb}: \`${name}\` is not a non-empty string on ${file} (typeof read: ${typeof value}) — the shared handler name this unit authors does not exist at this head`,
      ],
    }
  }
  return { value, problems: [] }
}

// ---------------------------------------------------------------------------
// THE ASSEMBLED-ENVELOPE DRIVE (`A`, `D`) — the SAME call shape the zone register's authoring-site
// drive uses: the fork's REAL `assembleAppGraphEnvelope` over a minimal traversal envelope, with a
// real `PaneRegistry` and a synthesized context. No new harness is invented here.
// ---------------------------------------------------------------------------

interface AssembledNode {
  props?: Record<string, unknown>
  css?: { classes?: unknown }
  content?: unknown
  children?: unknown[]
  handlers?: Array<{ name?: unknown }>
  placement?: { placementName?: unknown }
}

interface PaneSpec {
  id: string
  zone: Zone
}

interface Assembly {
  envelope: unknown
  /** the template root's authored children, in authoring order — where a zone container's
   *  immediate following sibling lives (`ASM-U1b-5`) */
  children: AssembledNode[]
  layout: LayoutState
  registry: ReturnType<typeof createPaneRegistry>
  ctx: Record<string, unknown>
  /** re-assemble OVER the envelope this assembly produced (the idempotence arm, `D`) */
  reAssemble: () => AssembledNode[]
  /** ⟨ADDED by the post-landing REPAIR PASS — the blind green arms `A'` / `D'`.⟩ re-assemble over
   *  AN ENVELOPE (default: the one this assembly produced) and answer the WHOLE envelope, not just
   *  its root children: the second pass's `content` payloads are limb `A'`'s subject and its
   *  children are limb `D'`'s. The call shape is `reAssemble`'s, verbatim — no second harness. */
  reAssembledEnvelope: (over?: unknown) => unknown
}

function assemble(input: { panes?: PaneSpec[]; layout?: LayoutState }): Assembly {
  const registry = createPaneRegistry()
  for (const pane of input.panes ?? []) {
    registry.register({
      id: pane.id,
      title: pane.id,
      scope: 'app-graph',
      defaultZone: pane.zone,
      render: () => ({ type: 'div', props: { id: pane.id } }),
    })
    registry.enable(pane.id)
  }
  const layout = input.layout ?? defaultLayout()
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
  const childrenOf = (envelope: unknown): AssembledNode[] => {
    const root = (envelope as { template?: { root?: { children?: unknown[] } } }).template?.root
    return [...((root?.children ?? []) as AssembledNode[])]
  }
  /** ⟨REPAIR PASS⟩ the one second-pass call shape BOTH `reAssemble` and the new
   *  `reAssembledEnvelope` drive — `reAssemble` answers only the children, the whole-envelope
   *  answer is what limbs `A'`/`D'` read. */
  const reAssembleOver = (over?: unknown): unknown =>
    assembleAppGraphEnvelope({
      traversalEnvelope: (over ?? assembled.envelope) as never,
      registry,
      ctx: ctx as never,
      layout,
    }).envelope
  return {
    envelope: assembled.envelope,
    children: childrenOf(assembled.envelope),
    layout,
    registry,
    ctx,
    reAssemble: () => childrenOf(reAssembleOver()),
    reAssembledEnvelope: reAssembleOver,
  }
}

const propIdOf = (node: AssembledNode): string =>
  typeof node.props?.['id'] === 'string' ? (node.props['id'] as string) : ''

const classesOf = (node: AssembledNode): string[] => {
  const classes = node.css?.classes
  return Array.isArray(classes) ? classes.map(String) : []
}

const propText = (node: AssembledNode | undefined, key: string): string => {
  const value = node?.props?.[key]
  return typeof value === 'string' ? value : ''
}

/** The zone container for `zone`, located the way `§3` limb `D` requires: BY ITS `zone` PROP and
 *  its `zone:<zone>` id — never by position. */
function containerFor(children: readonly AssembledNode[], zone: Zone): AssembledNode | undefined {
  return children.find((node) => node.props?.['zone'] === zone && propIdOf(node) === `zone:${zone}`)
}

/** `defaultLayout()` with the named zone records EXTENDED by an explicit record — used to STATE
 *  the member (or to plant a junk value) without touching `size`. */
function layoutStating(records: Partial<Record<Zone, Record<string, unknown>>>): LayoutState {
  const base = defaultLayout()
  const zones = { ...(base.zones as unknown as Record<string, Record<string, unknown>>) }
  for (const zone of CLOSED_ZONES) {
    const extra = records[zone]
    if (extra === undefined) continue
    zones[zone] = { ...zones[zone]!, ...extra }
  }
  return { ...base, zones: zones as unknown as LayoutState['zones'] }
}

/** The stated member of one zone record, read WITHOUT inventing it (`ASM-U1b-1`: absence is
 *  storable and means "derive"). */
const statedOf = (layout: LayoutState, zone: Zone): unknown =>
  (layout.zones?.[zone] as unknown as Record<string, unknown>)['collapsed']

const ownsCollapsed = (record: Record<string, unknown>): boolean =>
  Object.prototype.hasOwnProperty.call(record, 'collapsed')

const zoneKeysOf = (layout: LayoutState, zone: Zone): string[] =>
  Object.keys((layout.zones?.[zone] ?? {}) as unknown as Record<string, unknown>).sort()

/** The `size` values of all four zones, byte-for-byte (`c3`: collapse writes NO size). */
const sizeFingerprint = (layout: LayoutState): string =>
  JSON.stringify(
    CLOSED_ZONES.map((zone) => [
      zone,
      (layout.zones?.[zone] as unknown as Record<string, unknown>)['size'],
    ]),
  )

/** The brace-balanced body of the FIRST declaration matching `marker` in `text`, with its 1-based
 *  line — the SOURCE reading the no-second-authority limb (`G`) grades. */
function bodyOf(text: string, markers: readonly RegExp[]): { body: string; line: number } | null {
  for (const marker of markers) {
    const match = marker.exec(text)
    if (match === null) continue
    const open = text.indexOf('{', match.index + match[0].length)
    if (open < 0) continue
    let depth = 0
    for (let index = open; index < text.length; index++) {
      const ch = text[index]
      if (ch === '{') depth += 1
      else if (ch === '}') {
        depth -= 1
        if (depth === 0) {
          return { body: text.slice(open, index + 1), line: text.slice(0, open).split('\n').length }
        }
      }
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// THE REAL HOST SEAM DRIVE (`C`, `c1`) — the REAL `SidebarPanes` over the DOM double, the REAL
// private bridge installer reached through the exposed `window.provident.sidebar` holder (the
// `unit-live11-bridge-seams.test.ts` pattern: `installShim` + a minimal bridge + a direct
// `installSidebarBridge()` call). NOTHING is mocked: the write counter wraps the host's own
// `setLayout`, and the persist sink is the `bridge.operatorSettings.set` seam the fork's
// `setLayout` calls.
// ---------------------------------------------------------------------------
interface SeamHost {
  seam: Record<string, unknown> | null
  /** how many times the host's OWN `setLayout` was entered since the seed write */
  setLayoutCalls: () => number
  /** every layout that reached the ONE write path (`bridge.operatorSettings.set({ layout })`) */
  writes: LayoutState[]
  layout: () => LayoutState
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
      title: pane.id,
      scope: 'app-graph',
      defaultZone: pane.zone,
      render: () => ({ type: 'div', props: { id: pane.id } }),
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
  const sidebar = (globals['window'] as { provident?: { sidebar?: Record<string, unknown> } }).provident
    ?.sidebar
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
    layout: () => (host as unknown as { layout: LayoutState }).layout,
    restore: () => {
      globals['window'] = previousWindow
    },
  }
}

describe('U-1b zone collapse — the statement, the derivation, the act, the anchored control, the vocabulary', () => {
  it('A — the derivation: an empty census collapses, a stated `false` wins, an occupied zone with `true` collapses, and `zoneCollapsedOf` answers all four arms', async () => {
    const module = (await import('../../../src/renderer/pane-graph.js')) as Record<string, unknown>
    const problems: string[] = []

    // THE DIRECT PREDICATE ARMS (`§2` `C-2`: `typeof stated === 'boolean' ? stated : paneCount === 0`)
    const predicate = readExport(module, 'zoneCollapsedOf', 'src/renderer/pane-graph.ts', 'A')
    problems.push(...predicate.problems)
    const predicateArmReadings: string[] = []
    if (typeof predicate.value === 'function') {
      const arm = predicate.value as (stated: boolean | undefined, paneCount: number) => unknown
      const arms: Array<{ stated: boolean | undefined; count: number; expected: boolean }> = [
        { stated: undefined, count: 0, expected: true },
        { stated: undefined, count: 2, expected: false },
        { stated: false, count: 0, expected: false },
        { stated: true, count: 2, expected: true },
      ]
      for (const { stated, count, expected } of arms) {
        let observed: unknown
        try {
          observed = arm(stated, count)
        } catch (error) {
          problems.push(
            `zoneCollapsedOf(${String(stated)}, ${count}) THREW (${String(error)}) — the derivation must be TOTAL over (boolean|undefined, number)`,
          )
          continue
        }
        predicateArmReadings.push(`zoneCollapsedOf(${String(stated)}, ${count})=${String(observed)}`)
        if (observed !== expected) {
          problems.push(
            `zoneCollapsedOf(${String(stated)}, ${count}) read ${String(observed)}, not ${String(expected)} — ` +
              `§2 C-2 pins "the stated boolean when one is stated, else paneCount === 0"`,
          )
        }
      }
    }

    // (a1) AN EMPTY ENABLED+PLACED CENSUS + NOTHING STATED ⇒ COLLAPSED.
    const emptyDerived = assemble({ panes: [], layout: defaultLayout() })
    for (const zone of CLOSED_ZONES) {
      const container = containerFor(emptyDerived.children, zone)
      if (container === undefined) {
        problems.push(`(a1) NO assembled node carries props.zone "${zone}" AND props.id "zone:${zone}" — the container this arm reads does not exist`)
        continue
      }
      const classes = classesOf(container)
      if (!classes.includes('is-collapsed')) {
        problems.push(
          `(a1) the container "zone:${zone}" carries classes [${classes.join(', ')}] and NOT \`is-collapsed\` — an empty enabled+placed census with nothing stated must DERIVE collapsed (§2 C-2, ASM-U1b-2)`,
        )
      }
      const carrier = propText(container, 'collapsed')
      if (carrier !== 'true') {
        problems.push(
          `(a1) the container "zone:${zone}" carries props.collapsed ${carrier === '' ? '(absent)' : JSON.stringify(carrier)}, not "true" — ASM-U1b-9's attribute carrier must be computed in the SAME place as the class`,
        )
      }
    }

    // (a2) THE SAME CENSUS, `collapsed: false` STATED ⇒ EXPANDED — THE STATEMENT WINS.
    const statedFalse = assemble({
      panes: [],
      layout: layoutStating({ left: { collapsed: false }, right: { collapsed: false }, top: { collapsed: false }, bottom: { collapsed: false } }),
    })
    for (const zone of CLOSED_ZONES) {
      const container = containerFor(statedFalse.children, zone)
      if (container === undefined) {
        problems.push(`(a2) NO assembled container for zone "${zone}" — the arm has no subject`)
        continue
      }
      const classes = classesOf(container)
      if (classes.includes('is-collapsed')) {
        problems.push(
          `(a2) the container "zone:${zone}" carries \`is-collapsed\` although the record STATES collapsed:false — the derivation overrode the operator's word, which is the bug the statement exists to fix (§3 A/a2)`,
        )
      }
      const carrier = propText(container, 'collapsed')
      if (carrier !== 'false') {
        problems.push(
          `(a2) the container "zone:${zone}" carries props.collapsed ${carrier === '' ? '(absent)' : JSON.stringify(carrier)}, not "false" — the carrier must report the EFFECTIVE state, and the effective state here is expanded`,
        )
      }
    }

    // (a3) AN OCCUPIED ZONE WITH `collapsed: true` STATED ⇒ COLLAPSED, WITH THE TAB STRIP.
    const occupied = assemble({
      panes: [{ id: 'zone-collapse-probe', zone: 'left' }],
      layout: layoutStating({ left: { collapsed: true } }),
    })
    const left = containerFor(occupied.children, 'left')
    if (left === undefined) {
      problems.push('(a3) NO assembled container for zone "left" — the arm has no subject')
    } else {
      const classes = classesOf(left)
      if (!classes.includes('is-collapsed')) {
        problems.push(
          `(a3) the OCCUPIED left container carries classes [${classes.join(', ')}] and NOT \`is-collapsed\` although the record STATES collapsed:true — the act's own overturning of the derivation (§1) is unrepresentable`,
        )
      }
      if (propText(left, 'collapsed') !== 'true') {
        problems.push(`(a3) the OCCUPIED left container carries props.collapsed ${JSON.stringify(propText(left, 'collapsed'))}, not "true"`)
      }
      const tabs = (left.children ?? []).filter(
        (child) => classesOf(child as AssembledNode).includes('pane-tab') || typeof (child as AssembledNode).props?.['data-pane-id'] === 'string',
      )
      if (tabs.length === 0) {
        problems.push(
          `(a3) the collapsed OCCUPIED left container carries NO tab-strip node (children: ${(left.children ?? []).length}) — §2 C-2's FOLD makes the collapsed zone with panes emit the tab strip instead of the pane payloads`,
        )
      }
    }

    expect(
      problems,
      `limb A — the derivation read: predicate arms [${predicateArmReadings.join(', ')}]; (a1) an empty census with nothing stated; ` +
        `(a2) the same census with collapsed:false stated; (a3) an occupied zone with collapsed:true stated. ` +
        `${problems.length} problem(s). §2 C-2 makes ONE predicate (zoneCollapsedOf) the single authority every site calls; ` +
        `READINGS: pane-graph.ts's container loop and its mirror-classes helper must both read it`,
    ).toEqual([])
  })

  it('B — the seeds state NOTHING on any of the four zones (never a seeded `false`) and a junk statement is not copied', () => {
    const problems: string[] = []
    const seeded = defaultLayout()
    for (const zone of CLOSED_ZONES) {
      const record = (seeded.zones?.[zone] ?? {}) as unknown as Record<string, unknown>
      if (ownsCollapsed(record)) {
        problems.push(
          `the zone "${zone}" seed STATES collapsed=${JSON.stringify(record['collapsed'])} — ASM-U1b-2: a seeded value (even \`false\`) switches the derivation off in every fresh profile`,
        )
      }
      const keys = Object.keys(record).sort()
      if (keys.join(',') !== 'size') {
        problems.push(
          `the zone "${zone}" seed carries the member set [${keys.join(', ')}] — §2 C-1's ZoneLayout is \`{ size: number; collapsed?: boolean }\`, so a seed record owns \`size\` and NOTHING else`,
        )
      }
      const size = record['size']
      if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0) {
        problems.push(`the zone "${zone}" seed carries size ${JSON.stringify(size ?? null)} — never finite-positive`)
      }
    }

    // THE ABSENCE-PRESERVING COERCION (`C-1`, `ASM-U1b-1`): anything that is not EXACTLY a boolean
    // is OMITTED, so an old profile derives instead of being silently "expanded".
    const junk: Array<{ label: string; value: unknown }> = [
      { label: '1', value: 1 },
      { label: '0', value: 0 },
      { label: "'true'", value: 'true' },
      { label: 'null', value: null },
      { label: '{}', value: {} },
      { label: '[]', value: [] },
      { label: 'NaN', value: Number.NaN },
    ]
    for (const { label, value } of junk) {
      const coerced = coerceLayout({ version: 1, zones: { left: { size: 300, collapsed: value } } })
      const record = coerced.zones.left as unknown as Record<string, unknown>
      if (ownsCollapsed(record)) {
        problems.push(
          `coerceZoneLayout COPIED the junk statement collapsed=${label} (read back as ${JSON.stringify(record['collapsed'])}) — §2 C-1 copies it only when it is exactly \`true\` or \`false\`, so an old/malformed profile derives (ASM-U1b-1)`,
        )
      }
      const keys = Object.keys(record).sort()
      if (keys.join(',') !== 'size') {
        problems.push(`coerceZoneLayout({size: 300, collapsed: ${label}}) read back the member set [${keys.join(', ')}], not [size]`)
      }
      if (record['size'] !== 300) {
        problems.push(`coerceLayout dropped the stated size 300 (read ${JSON.stringify(record['size'] ?? null)}) while coercing collapsed: ${label}`)
      }
    }
    // THE OTHER DIRECTION: the two booleans ARE copied (the statement must be storable at all).
    for (const stated of [true, false]) {
      const record = coerceLayout({ version: 1, zones: { left: { size: 300, collapsed: stated } } }).zones.left as unknown as Record<string, unknown>
      if (!ownsCollapsed(record)) {
        problems.push(`coerceLayout DROPPED the stated boolean collapsed:${String(stated)} — the statement must round-trip`)
      } else if (record['collapsed'] !== stated) {
        problems.push(`coerceLayout read the stated collapsed:${String(stated)} back as ${JSON.stringify(record['collapsed'])}`)
      }
    }

    expect(
      problems,
      `limb B — the seeds and the absence-preserving coercion. defaultLayout() zone member sets read: ` +
        `${CLOSED_ZONES.map((zone) => `${zone}=[${zoneKeysOf(seeded, zone).join(', ')}]`).join(', ')}. ` +
        `${problems.length} problem(s). ASM-U1b-2: the four seeds OMIT the member, because a seeded \`false\` states "expanded" ` +
        `for every zone and the derivation never fires`,
    ).toEqual([])
  })

  it('C — the act: ONE press is ONE `setLayout` write of the negation of the effective state, an explicit boolean, `size` byte-identical, two presses restore the state', async () => {
    const problems: string[] = []
    const graph = (await import('../../../src/renderer/pane-graph.js')) as Record<string, unknown>
    const drag = (await import('../../../src/renderer/pane-drag.js')) as Record<string, unknown>
    const predicate = readExport(graph, 'zoneCollapsedOf', 'src/renderer/pane-graph.ts', 'C')
    const writer = readExport(drag, 'setZoneCollapsed', 'src/renderer/pane-drag.ts', 'C')
    problems.push(...predicate.problems, ...writer.problems)

    const effective = (stated: unknown, count: number): boolean =>
      typeof predicate.value === 'function'
        ? (predicate.value as AnyFn)(statementOf(stated), count) === true
        : false
    /** The stated member AS THE PREDICATE TAKES IT: a non-boolean read is `undefined` ("nothing
     *  stated"), which is what `coerceZoneLayout` guarantees on the real write path. */
    function statementOf(stated: unknown): boolean | undefined {
      return typeof stated === 'boolean' ? stated : undefined
    }

    // ---- (c2) / (c3) / (c4): the write discipline over the STATE HELPER ---------------------
    if (typeof writer.value === 'function') {
      const press = (layout: LayoutState, zone: Zone, count: number): LayoutState => {
        const next = !effective(statedOf(layout, zone), count)
        return (writer.value as AnyFn)(layout, zone, next) as LayoutState
      }

      // (c2) THE WRITTEN VALUE IS AN EXPLICIT BOOLEAN AND THE KEY IS PRESENT (never deleted).
      for (const zone of CLOSED_ZONES) {
        for (const [label, start, count] of [
          ['nothing stated, empty census', defaultLayout(), 0],
          ['nothing stated, occupied census', layoutStating({}), 2],
        ] as Array<[string, LayoutState, number]>) {
          const before = start
          const after = press(before, zone, count)
          const record = (after.zones?.[zone] ?? {}) as unknown as Record<string, unknown>
          if (!ownsCollapsed(record)) {
            problems.push(
              `(c2) a press from "${label}" DELETED the member on zone "${zone}" (member set [${zoneKeysOf(after, zone).join(', ')}]) — ASM-U1b-1: the act always writes an explicit value and NEVER deletes`,
            )
          } else if (typeof record['collapsed'] !== 'boolean') {
            problems.push(
              `(c2) a press from "${label}" wrote collapsed=${JSON.stringify(record['collapsed'])} (typeof ${typeof record['collapsed']}) on zone "${zone}" — the written value must be an explicit boolean`,
            )
          } else if (record['collapsed'] !== !effective(statedOf(before, zone), count)) {
            problems.push(
              `(c2) a press from "${label}" wrote collapsed=${String(record['collapsed'])} on zone "${zone}" instead of the NEGATION of the current EFFECTIVE state (${String(!effective(statedOf(before, zone), count))})`,
            )
          }
        }
      }

      // (c3) `size` IS BYTE-IDENTICAL BEFORE AND AFTER (the remembered size is never touched).
      const seed = layoutStating({ left: { size: 260, collapsed: true }, top: { size: 44 } })
      const seedSizes = sizeFingerprint(seed)
      const once = press(seed, 'left', 1)
      const twice = press(once, 'left', 1)
      if (sizeFingerprint(once) !== seedSizes) {
        problems.push(`(c3) one press changed a zone \`size\` — ${seedSizes} → ${sizeFingerprint(once)} (forking.md §7.1: collapse writes no size)`)
      }
      if (sizeFingerprint(twice) !== seedSizes) {
        problems.push(`(c3) two presses changed a zone \`size\` — ${seedSizes} → ${sizeFingerprint(twice)}`)
      }

      // (c4a) FROM A STATED START, TWO PRESSES RESTORE THE IDENTICAL RECORD.
      const statedStart = layoutStating({ left: { size: 220, collapsed: true } })
      const statedOnce = press(statedStart, 'left', 1)
      const statedTwice = press(statedOnce, 'left', 1)
      if (JSON.stringify(statedTwice.zones) !== JSON.stringify(statedStart.zones)) {
        problems.push(
          `(c4a) from a STATED start, two presses did NOT restore the identical record — start ${JSON.stringify(statedStart.zones.left)}, after two presses ${JSON.stringify(statedTwice.zones.left)} (the whole zones record must be byte-identical)`,
        )
      }

      // (c4b) FROM AN UNSTATED START, TWO PRESSES RESTORE THE IDENTICAL EFFECTIVE STATE, with the
      // member now STATED and EQUAL to the derivation (ASM-U1b-1 — never record identity).
      for (const count of [0, 1]) {
        const unstatedStart = layoutStating({ left: { size: 220 } })
        const derivation = effective(statedOf(unstatedStart, 'left'), count)
        const onceMore = press(unstatedStart, 'left', count)
        const twiceMore = press(onceMore, 'left', count)
        const stated = statedOf(twiceMore, 'left')
        if (typeof stated !== 'boolean') {
          problems.push(
            `(c4b) from an UNSTATED start (census ${count}), two presses left the member ${stated === undefined ? 'ABSENT' : JSON.stringify(stated)} — the act must STATE an explicit value, never delete back to "derive"`,
          )
        } else {
          if (stated !== derivation) {
            problems.push(
              `(c4b) from an UNSTATED start (census ${count}), two presses left the member STATED as ${String(stated)} although the starting derivation was ${String(derivation)} — the restored state must equal the derivation it started from`,
            )
          }
          if (effective(stated, count) !== derivation) {
            problems.push(
              `(c4b) from an UNSTATED start (census ${count}), two presses changed the EFFECTIVE state (${String(derivation)} → ${String(effective(stated, count))})`,
            )
          }
        }
      }
    }

    // ---- (c1): THE SEAM — one press = ONE `setLayout` write -------------------------------
    const first = seedHost(defaultLayout(), [])
    try {
      const seam = first.seam
      const toggle = seam?.['zoneCollapseToggle']
      if (seam === null) {
        problems.push(
          `(c1) the bridged holder object carries NO \`sidebar\` surface at all (src/renderer/sidebar-panes.ts → installSidebarBridge) — the act has no address, so the one-write discipline has no subject`,
        )
      } else if (typeof toggle !== 'function') {
        problems.push(
          `(c1) \`window.provident.sidebar.zoneCollapseToggle\` is NOT a function (typeof read: ${typeof toggle}; the holder's KEYS are [${Object.keys(seam).slice(0, 24).join(', ')}…]) — §2 C-3 re-grains the seam to the collapse vocabulary, and one press must be ONE setLayout write`,
        )
      } else {
        const seedLayout = first.layout()
        ;(toggle as AnyFn)('left' as never)
        const calls = first.setLayoutCalls()
        if (calls !== 1) {
          problems.push(
            `(c1) ONE press of zoneCollapseToggle('left') reached the host's own \`setLayout\` ${calls} time(s), not exactly once — §2 C-3: \`current = zoneCollapsedOf(record.collapsed, count)\` → ONE \`setLayout(setZoneCollapsed(base, zone, !current))\``,
          )
        }
        if (first.writes.length !== 1) {
          problems.push(
            `(c1) ONE press produced ${first.writes.length} persist write(s) through \`bridge.operatorSettings.set\` — the ONE write path must be reached exactly once`,
          )
        }
        const written = first.writes[0]
        if (written === undefined) {
          problems.push('(c1) the press wrote NOTHING — the persist sink never saw a `layout` patch')
        } else {
          const record = (written.zones?.['left'] ?? {}) as unknown as Record<string, unknown>
          const expected = !effective(statedOf(seedLayout, 'left'), 0)
          if (!ownsCollapsed(record)) {
            problems.push('(c1) the written layout DELETED the member on the pressed zone — the act never deletes (ASM-U1b-1)')
          } else if (record['collapsed'] !== expected) {
            problems.push(
              `(c1) the press wrote collapsed=${JSON.stringify(record['collapsed'])} on "left", not the negation of the CURRENT EFFECTIVE state (${String(expected)}) — an empty census with nothing stated derives collapsed, so the first press EXPANDS`,
            )
          }
          // EXACTLY ONE MEMBER CHANGED: the other three zones, the panes, the stage and the top bar
          // are byte-identical to the seed.
          const changed = CLOSED_ZONES.filter(
            (zone) => JSON.stringify(written.zones?.[zone]) !== JSON.stringify(seedLayout.zones?.[zone]),
          )
          if (changed.join(',') !== 'left') {
            problems.push(
              `(c1) one press changed the zone record(s) [${changed.join(', ')}], not exactly ["left"] — the act writes ONE member at ONE address`,
            )
          }
          if (JSON.stringify(written.panes) !== JSON.stringify(seedLayout.panes)) {
            problems.push('(c1) the press rewrote `panes` — the act touches no pane entry')
          }
          if (JSON.stringify(written.stage) !== JSON.stringify(seedLayout.stage) || JSON.stringify(written.topBar) !== JSON.stringify(seedLayout.topBar)) {
            problems.push('(c1) the press rewrote `stage`/`topBar` — the act touches the two regions of neither')
          }
          if (sizeFingerprint(written) !== sizeFingerprint(seedLayout)) {
            problems.push(`(c1) the press changed a zone \`size\` — ${sizeFingerprint(seedLayout)} → ${sizeFingerprint(written)}`)
          }
        }
      }
    } finally {
      first.restore()
    }

    expect(
      problems,
      `limb C — the act's write discipline. (c1) the bridged seam's one-write press; (c2) an explicit boolean, never deleted; ` +
        `(c3) \`size\` byte-identical; (c4) two presses restoring the STATED record / the UNSTATED effective state. ` +
        `${problems.length} problem(s). LAYER: the REAL SidebarPanes host + the fork's own write path under the DOM double — ` +
        `the envelope/wiring class, never the paint`,
    ).toEqual([])
  })

  it('D — the authored control: one per zone, the container\'s IMMEDIATE FOLLOWING SIBLING, no control child, idempotent on re-assembly', async () => {
    const module = (await import('../../../src/renderer/pane-graph.js')) as Record<string, unknown>
    const problems: string[] = []
    const controlOf = readExport(module, 'zoneCollapseControlOf', 'src/renderer/pane-graph.ts', 'D')
    const handler = readConstant(module, 'ZONE_COLLAPSE_HANDLER', 'src/renderer/pane-graph.ts', 'D')
    problems.push(...controlOf.problems, ...handler.problems)
    if (typeof handler.value === 'string' && handler.value !== 'zone-collapse-toggle') {
      problems.push(
        `ZONE_COLLAPSE_HANDLER reads ${JSON.stringify(handler.value)}, not 'zone-collapse-toggle' (§2 C-3 names the one shared handler)`,
      )
    }

    const assembly = assemble({ panes: [{ id: 'zone-collapse-sibling-probe', zone: 'left' }] })
    const children = assembly.children
    const second = assembly.reAssemble()

    for (const zone of CLOSED_ZONES) {
      // (i) THE DOCUMENTED SHAPE, read off the exported author.
      if (typeof controlOf.value === 'function') {
        let authored: AssembledNode | undefined
        try {
          authored = (controlOf.value as AnyFn)(zone as never) as AssembledNode
        } catch (error) {
          problems.push(`zoneCollapseControlOf(${JSON.stringify(zone)}) THREW (${String(error)}) — the author must be TOTAL over the closed four`)
        }
        if (authored !== undefined) {
          const id = propIdOf(authored)
          if (id !== `zone-collapse-${zone}`) {
            problems.push(
              `zoneCollapseControlOf(${JSON.stringify(zone)}) authored id ${JSON.stringify(id)}, not "zone-collapse-${zone}" — §2 C-3 pins the id shape`,
            )
          }
          if (authored.props?.['zone'] !== zone) {
            problems.push(
              `zoneCollapseControlOf(${JSON.stringify(zone)}) authored props.zone ${JSON.stringify(authored.props?.['zone'] ?? null)} — the control addresses its own zone through the \`zone\` carrier (the handler body reads it)`,
            )
          }
          if (!classesOf(authored).includes('zone-collapse')) {
            problems.push(
              `zoneCollapseControlOf(${JSON.stringify(zone)}) authored classes [${classesOf(authored).join(', ')}], not the \`zone-collapse\` class (§2 C-3)`,
            )
          }
          if (authored.content !== '') {
            problems.push(
              `zoneCollapseControlOf(${JSON.stringify(zone)}) authored content ${JSON.stringify(authored.content)} — §2 C-3 pins \`content: ''\` (the glyph is the SHELL's, never the model's)`,
            )
          }
          const names = (authored.handlers ?? []).map((entry) => String(entry?.name ?? ''))
          if (!names.includes(String(handler.value))) {
            problems.push(
              `zoneCollapseControlOf(${JSON.stringify(zone)}) authored handlers [${names.join(', ')}], not the shared ZONE_COLLAPSE_HANDLER (${JSON.stringify(handler.value)})`,
            )
          }
        }
      }

      // (ii) THE CONTAINER, located BY ITS `zone` PROP AND its `zone:<zone>` id.
      const container = containerFor(children, zone)
      if (container === undefined) {
        problems.push(`the assembled root carries NO node with props.zone "${zone}" AND props.id "zone:${zone}" — limb D's adjacency has no container`)
        continue
      }
      // (iii) THE CONTROL IS THE IMMEDIATE FOLLOWING SIBLING.
      const index = children.indexOf(container)
      const sibling = children[index + 1]
      if (sibling === undefined) {
        problems.push(`the container "zone:${zone}" is the LAST authored child — the control it owns is not a following sibling at all`)
      } else if (propIdOf(sibling) !== `zone-collapse-${zone}`) {
        problems.push(
          `children[indexOf(zone:${zone}) + 1] carries props.id ${JSON.stringify(propIdOf(sibling) || '(none)')}, not "zone-collapse-${zone}" — ASM-U1b-5 places the control as the container's IMMEDIATE FOLLOWING SIBLING in templateRoot.children (the child placement is the fork's rejected shape)`,
        )
      }
      // (iv) EXACTLY ONE — in the FIRST assembly and after a SECOND one (the idempotence arm).
      const countIn = (nodes: readonly AssembledNode[]): number =>
        nodes.filter((node) => propIdOf(node) === `zone-collapse-${zone}`).length
      const once = countIn(children)
      if (once !== 1) {
        problems.push(`the first assembly authors ${once} node(s) with id "zone-collapse-${zone}", not exactly one`)
      }
      const twice = countIn(second)
      if (twice !== 1) {
        problems.push(
          `a SECOND assembleAppGraphEnvelope over the result authors ${twice} node(s) with id "zone-collapse-${zone}" — the insertion must use the gutter family's idempotence scan (a re-assembly adds NO duplicate)`,
        )
      }
      // (v) THE CONTAINER AUTHORS NO CONTROL CHILD (`§2` C-3: the child placement is GONE).
      const controlChildren = (container.children ?? [])
        .map((child) => propIdOf(child as AssembledNode))
        .filter((id) => id.startsWith('zone-collapse-') || id.startsWith(SUPERSEDED_CONTROL_PREFIX))
      if (controlChildren.length > 0) {
        problems.push(
          `the container "zone:${zone}" still authors the control as a CHILD ([${controlChildren.join(', ')}]) — §2 C-3 moves it to a root-level SIBLING (ASM-U1b-5: a child is buried at a 0px extent)`,
        )
      }
    }

    expect(
      problems,
      `limb D — the authored control. Root children read [${children.map((node) => propIdOf(node) || '(no props.id)').join(', ')}]; ` +
        `a second assembly read ${second.length} child(ren) against the first's ${children.length}. ${problems.length} problem(s). ` +
        `The FOUR zones are authored whether or not they are empty (§2 C-3), so every zone owns one sibling`,
    ).toEqual([])
  })

  it('E — the coerced member shape: total over junk, `size` finite-positive, `version === 1`, `collapsed` ABSENT-or-boolean (the P-SM-2 member cell)', () => {
    const problems: string[] = []
    const junkInputs: Array<{ label: string; value: unknown }> = [
      { label: 'null', value: null },
      { label: 'undefined', value: undefined },
      { label: '0', value: 0 },
      { label: "'x'", value: 'x' },
      { label: '[]', value: [] },
      { label: '{}', value: {} },
      { label: '{version: 2}', value: { version: 2 } },
      { label: '{version: 0, panes: 0, zones: 0}', value: { version: 0, panes: 0, zones: 0 } },
      { label: '{version: 1, zones: "x"}', value: { version: 1, zones: 'x' } },
      {
        label: '{version: 1, zones: {left: {size: -5, collapsed: 1}}}',
        value: { version: 1, zones: { left: { size: -5, collapsed: 1 } } },
      },
      {
        label: '{version: 1, zones: {top: {size: NaN, collapsed: "true"}, bottom: {size: Infinity, collapsed: null}}}',
        value: { version: 1, zones: { top: { size: Number.NaN, collapsed: 'true' }, bottom: { size: Number.POSITIVE_INFINITY, collapsed: null } } },
      },
      {
        label: '{version: 1, zones: {left: {size: 300, collapsed: false}}}',
        value: { version: 1, zones: { left: { size: 300, collapsed: false } } },
      },
    ]
    const readback: string[] = []
    for (const { label, value } of junkInputs) {
      let coerced: LayoutState
      try {
        coerced = coerceLayout(value)
      } catch (error) {
        problems.push(`coerceLayout(${label}) THREW (${String(error)}) — the coercion must be TOTAL (W2-Q16)`)
        continue
      }
      if (coerced.version !== LAYOUT_VERSION || coerced.version !== 1) {
        problems.push(`coerceLayout(${label}) read version ${JSON.stringify(coerced.version)}, not 1 (D-22 (2): LAYOUT_VERSION stays 1)`)
      }
      for (const zone of CLOSED_ZONES) {
        const record = (coerced.zones?.[zone] ?? {}) as unknown as Record<string, unknown>
        const size = record['size']
        if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0) {
          problems.push(`coerceLayout(${label}) left zone "${zone}" with size ${JSON.stringify(size ?? null)} — never finite-positive`)
        }
        const keys = Object.keys(record).sort()
        const unexpected = keys.filter((key) => key !== 'size' && key !== 'collapsed')
        if (unexpected.length > 0) {
          problems.push(
            `coerceLayout(${label}) left zone "${zone}" carrying [${unexpected.join(', ')}] — §2 C-1's member set is \`size\` plus the OPTIONAL \`collapsed\`, so the P-SM-2 member cell is exactly { size: finite-positive, collapsed?: boolean }`,
          )
        }
        if (ownsCollapsed(record) && typeof record['collapsed'] !== 'boolean') {
          problems.push(
            `coerceLayout(${label}) left zone "${zone}" with the member PRESENT and ${typeof record['collapsed']} (${JSON.stringify(record['collapsed'])}) — absent or boolean, never an undefined-but-present key (C-1 writes it conditionally)`,
          )
        }
      }
      readback.push(`${label} → {${CLOSED_ZONES.map((zone) => `${zone}:[${zoneKeysOf(coerced, zone).join(', ')}]`).join(', ')}}`)
    }

    expect(
      problems,
      `limb E — the coerced member shape over ${junkInputs.length} junk input(s). Readback: ${readback.join('; ')}. ${problems.length} problem(s). ` +
        `D-22 (2) keeps LAYOUT_VERSION at 1 and writes NO migration arm`,
    ).toEqual([])
  })

  it('F — the state-vocabulary census: the superseded spellings are ABSENT from src/** + index.html + the driver + tests/**, and the collapse vocabulary is PRESENT where it belongs', () => {
    // THE CENSUS SUBJECT — the named files PLUS every `*.ts` under `src/` and `tests/`.
    const named = [
      'src/renderer/layout-state.ts',
      'src/renderer/pane-graph.ts',
      'src/renderer/pane-drag.ts',
      'src/renderer/pane-gutter.ts',
      'src/renderer/sidebar-panes.ts',
      'src/main/preload.ts',
      'src/renderer/index.html',
      'scripts/live-drive.mjs',
    ]
    const censusPaths = [
      ...new Set([
        ...SRC_FILES.filter((path) => TYPESCRIPT.test(path)),
        ...TEST_FILES,
        ...named.map((path) => `${ROOT}${path}`),
      ]),
    ]
    // NON-VACUITY FLOOR: a shallow walk cannot satisfy any negative below.
    expect(
      censusPaths.length,
      `the vocabulary census walked ${censusPaths.length} file(s) (${SRC_FILES.length} under src/, ${TEST_FILES.length} *.ts under tests/, + the named files) — a corpus that small cannot carry the shell`,
    ).toBeGreaterThan(60)

    const offenders = readings(censusPaths, SUPERSEDED)
    const offenderFiles = [...new Set(offenders.map((reading) => reading.file))]
    // The SUBJECT is the offender LIST: `readings()` answers objects, so the graded value is the
    // mapping to one `file:line: text` line per offender (uncapped — `format()` caps at six and a
    // failure must name EVERY offender). Asserting `offenders.length` against `[]` never passes and
    // would make this limb blind to a bad landing as well as a good one.
    expect(
      offenders.map((reading) => `${reading.file}:${reading.line}: ${reading.text}`),
      `the superseded state vocabulary (C-5's left column) still reads ${offenders.length} time(s) across ${offenderFiles.length} file(s) ` +
        `of the ${censusPaths.length} walked — ${format(offenders)}. Files: [${offenderFiles.join(', ')}]. ` +
        `§2 C-5's left column — the whole superseded family (the zone-state member, its data attribute, its mirror class, ` +
        `its control ids/class and its toggle seam) — does not survive anywhere in src/**, index.html, scripts/** or tests/** ` +
        `— the fork's tab-strip paint is RENAMED, not kept`,
    ).toEqual([])

    // THE OTHER HALF — the collapse vocabulary must be PRESENT, per file, at its own surface. A
    // limb that only FORBIDS the old spelling passes just as well on a tree with no vocabulary at
    // all, and this half removes that blindness.
    const targets: Array<{ file: string; label: string; pattern: RegExp; floor: number }> = [
      { file: 'src/renderer/layout-state.ts', label: 'the optional `collapsed` statement', pattern: /\bcollapsed\b/, floor: 2 },
      { file: 'src/renderer/pane-graph.ts', label: '`zoneCollapsedOf`', pattern: /\bzoneCollapsedOf\b/, floor: 2 },
      { file: 'src/renderer/pane-graph.ts', label: '`zoneCollapseControlOf`', pattern: /\bzoneCollapseControlOf\b/, floor: 1 },
      { file: 'src/renderer/pane-graph.ts', label: '`ZONE_COLLAPSE_HANDLER`', pattern: /\bZONE_COLLAPSE_HANDLER\b/, floor: 2 },
      { file: 'src/renderer/pane-graph.ts', label: 'the `zone-collapse-<zone>` id literal', pattern: /zone-collapse-/, floor: 1 },
      { file: 'src/renderer/pane-graph.ts', label: 'the `is-collapsed` mirror class', pattern: /is-collapsed/, floor: 1 },
      { file: 'src/renderer/pane-graph.ts', label: 'the `zoneCollapseToggle` seam in the control body', pattern: /\bzoneCollapseToggle\b/, floor: 1 },
      { file: 'src/renderer/pane-drag.ts', label: '`setZoneCollapsed`', pattern: /\bsetZoneCollapsed\b/, floor: 1 },
      { file: 'src/renderer/sidebar-panes.ts', label: 'the `zoneCollapseToggle` act', pattern: /\bzoneCollapseToggle\b/, floor: 2 },
      { file: 'src/renderer/sidebar-panes.ts', label: '`setZoneCollapsed` at the act`s write site', pattern: /\bsetZoneCollapsed\b/, floor: 1 },
      { file: 'src/renderer/sidebar-panes.ts', label: '`zoneCollapsedOf` at the mirror re-derive', pattern: /\bzoneCollapsedOf\b/, floor: 1 },
      { file: 'src/renderer/pane-gutter.ts', label: 'the `collapsed` gate parameter', pattern: /\bcollapsed\b/, floor: 2 },
      { file: 'src/main/preload.ts', label: 'the `zoneCollapseToggle` preload seam', pattern: /\bzoneCollapseToggle\b/, floor: 3 },
      { file: 'src/renderer/index.html', label: 'the `is-collapsed` paint family', pattern: /is-collapsed/, floor: 1 },
      { file: 'src/renderer/index.html', label: 'the `zone-collapse` control box', pattern: /zone-collapse/, floor: 1 },
      { file: 'scripts/live-drive.mjs', label: 'the `is-collapsed` zone-state read', pattern: /is-collapsed/, floor: 1 },
      { file: 'scripts/live-drive.mjs', label: 'the `zone-collapse-<zone>` id literal', pattern: /zone-collapse-/, floor: 1 },
    ]
    const measured = targets.map((target) => {
      const text = readText(target.file)
      const count = [...text.matchAll(new RegExp(target.pattern.source, 'g'))].length
      return { ...target, count }
    })
    const missing = measured.filter((entry) => entry.count < entry.floor)
    expect(
      missing.map((entry) => `${entry.file}: ${entry.label} read ${entry.count} < floor ${entry.floor}`),
      `the COLLAPSE vocabulary is MISSING from its own surfaces: ` +
        `${missing.map((entry) => `${entry.file} — ${entry.label} read ${entry.count}, floor ${entry.floor}`).join('; ')}. ` +
        `Measured: ${measured.map((entry) => `${entry.file}:${entry.label}=${entry.count}`).join(', ')}. ` +
        `§2 C-2/C-3/C-5 move the vocabulary to exactly these surfaces`,
    ).toEqual([])
  })

  it('G — the absent second authority: no `DEFAULT_ZONE_COLLAPSED_SIZE`-shaped constant and no `size` write anywhere in the collapse path', () => {
    const problems: string[] = []

    // (i) THE CONSTANT CENSUS over every file under src/ — the fork must not reintroduce a
    // remembered-collapsed-size authority (ASM-U1b-4, forking.md §7.1's `auto`/`hidden` extent).
    const constantOffenders = readings(SRC_FILES, /DEFAULT_ZONE_COLLAPSED_SIZE/)
    if (constantOffenders.length > 0) {
      problems.push(
        `a DEFAULT_ZONE_COLLAPSED_SIZE-shaped constant is declared under src/: ${format(constantOffenders)} — the collapsed extent is ` +
          `content-derived (\`auto\`/\`hidden\`), never a stored size (ASM-U1b-4)`,
      )
    }

    // (ii) THE COLLAPSE PATH ITSELF — the two bodies that may never touch `size`.
    const dragPath = 'src/renderer/pane-drag.ts'
    const sidebarPath = 'src/renderer/sidebar-panes.ts'
    const writerBody = bodyOf(readText(dragPath), [
      /export function setZoneCollapsed\s*\(/,
      /\bsetZoneCollapsed\s*\(\s*layout\s*:/,
    ])
    const actBody = bodyOf(readText(sidebarPath), [
      /private\s+zoneCollapseToggle\s*\(/,
      /\bzoneCollapseToggle\s*\(\s*zone\s*:\s*string\s*\)\s*:\s*void\s*\{/,
      /^\s*zoneCollapseToggle\s*\(/m,
    ])

    if (writerBody === null) {
      problems.push(
        `the collapse path \`setZoneCollapsed\` is NOT declared in ${dragPath} — §2 C-3 re-grains the state helper, so the "no \`size\` write" reading has NO SUBJECT at this head`,
      )
    } else {
      const sizeWrites = [
        ...writerBody.body.matchAll(/\.size\s*=[^=]|\bsize\s*:/g),
      ].map((match) => match[0])
      if (sizeWrites.length > 0) {
        problems.push(
          `${dragPath}:${writerBody.line} \`setZoneCollapsed\` assigns \`size\` ([${sizeWrites.join(', ')}]) — forking.md §7.1 lines 480-481: collapse writes no size and expansion costs ZERO writes`,
        )
      }
    }
    if (actBody === null) {
      problems.push(
        `the collapse path \`zoneCollapseToggle\` is NOT declared in ${sidebarPath} — §2 C-3 re-grains the act to the collapse vocabulary, so the "no \`size\` write" reading has NO SUBJECT at this head`,
      )
    } else {
      const sizeWrites = [...actBody.body.matchAll(/\.size\s*=[^=]|\bsize\s*:/g)].map((match) => match[0])
      if (sizeWrites.length > 0) {
        problems.push(
          `${sidebarPath}:${actBody.line} \`zoneCollapseToggle\` assigns \`size\` ([${sizeWrites.join(', ')}]) — the act writes ONE member at ONE address and nothing else`,
        )
      }
      // The act's ONE write is the helper's negation — read as a presence floor so a body that
      // simply does NOTHING cannot pass this limb by being empty.
      if (!/\bsetZoneCollapsed\b/.test(actBody.body)) {
        problems.push(
          `${sidebarPath}:${actBody.line} \`zoneCollapseToggle\` never calls \`setZoneCollapsed\` — the act's ONE write must go through the state helper (§2 C-3)`,
        )
      }
    }

    expect(
      problems,
      `limb G — the absent second authority (ASM-U1b-4). The constant census read ${constantOffenders.length} offender(s) over ` +
        `${SRC_FILES.length} file(s) under src/; the state helper's body read ${writerBody === null ? 'NO SUBJECT (absent)' : `at ${dragPath}:${writerBody.line}`}; ` +
        `the act's body read ${actBody === null ? 'NO SUBJECT (absent)' : `at ${sidebarPath}:${actBody.line}`}. ${problems.length} problem(s). ` +
        `The remembered \`size\` is never touched, and no constant may author the collapsed extent`,
    ).toEqual([])
  })

  it("H — the projection's three arms: a collapsed occupied zone projects --zone-<z>-track = auto, an empty collapsed zone keeps 0px, an expanded occupied zone keeps its size, a revealed empty zone is declined", async () => {
    // THE SUBJECT (`§3` limb `H`, ADDED `2026-11-15` after `L2`/`L3` measured that no limb graded
    // the arm that actually makes the extent paint): the REAL pure `zoneTrackVars(registry,
    // layout, opts?)` exported by `src/renderer/layout-state.ts`. `§2 C-4` / `ASM-U1b-10` give it
    // THREE arms, and the token is authored TWICE: this limb grades the JS half (the inline write
    // `applyZoneTracks` composes at every `setLayout`), never its `index.html` `:has()` mirror and
    // never the paint — both stay `G8`-only (`RCA-12`). Pure-function, node-assertable: no DOM, no
    // window, no grid.
    const module = (await import('../../../src/renderer/layout-state.js')) as Record<string, unknown>
    const problems: string[] = []
    const track = readExport(module, 'zoneTrackVars', 'src/renderer/layout-state.ts', 'H')
    problems.push(...track.problems)

    // THE FIXTURES — built with THIS FILE's OWN helper (`assemble`), never a second harness:
    // `assemble().registry` is a real `PaneRegistry` holding one ENABLED+PLACED `app-graph` pane
    // in `left` (the occupied census, `ASM-U1b-3`) or no panes at all (every zone empty).
    type Registry = ReturnType<typeof createPaneRegistry>
    const occupied: Registry = assemble({
      panes: [{ id: 'zone-track-h-probe', zone: 'left' } satisfies PaneSpec],
    }).registry
    const vacant: Registry = assemble({ panes: [] }).registry
    /** A persisted size no other arm shares, so h3's `'<size>px'` cannot collide with h1/h2/h4. */
    const SIZE = 260

    const trackKey = (zone: Zone): string => `--zone-${zone}-track`
    /** One zone's projected track value, read WITHOUT inventing it: an absent key stays
     *  `undefined` (never coerced to a default), because `'0px'` vs `''` vs ABSENT is the whole
     *  subject of this limb. */
    const readTrack = (vars: Record<string, string> | null, zone: Zone): unknown =>
      vars === null ? undefined : vars[trackKey(zone)]

    /** Drive the projection; a THROW is a WRONG reason to red, so it is caught and named. */
    const project = (
      label: string,
      registry: Registry,
      layout: LayoutState,
      opts?: { revealedZones?: readonly LayoutZoneName[] },
    ): Record<string, string> | null => {
      if (typeof track.value !== 'function') return null
      try {
        return (track.value as (r: unknown, l: unknown, o?: unknown) => Record<string, string>)(
          registry,
          layout,
          opts,
        )
      } catch (error) {
        problems.push(
          `${label}: \`zoneTrackVars(registry, layout${opts === undefined ? '' : ', opts'})\` THREW (${String(error)}) — ` +
            `the projection is PURE and TOTAL (a null/malformed registry or layout never throws, §4 F-3's fail-soft clause), ` +
            `so a throw here is the WRONG reason for limb H to red`,
        )
        return null
      }
    }

    // THE MEMBER'S EXISTENCE — the red limb `H` EXPECTS at this head, STATED rather than crashed
    // on. `§2 C-1` gives `ZoneLayout` the OPTIONAL `collapsed`; the head still carries the
    // REQUIRED total boolean (`C-5`'s left column), so `coerceZoneLayout` drops the statement and
    // the projection has nothing to read — h1 and h3's `collapsed: true|false` fixtures are
    // UNEXPRESSIBLE, not merely unsatisfied.
    const coercedStated = coerceLayout(layoutStating({ left: { collapsed: true } })).zones
      .left as unknown as Record<string, unknown>
    const memberKeys = Object.keys(coercedStated).sort()
    if (!ownsCollapsed(coercedStated)) {
      problems.push(
        `h1/h3 are UNEXPRESSIBLE at this head: a zone record STATED \`collapsed: true\` coerces back to the member set ` +
          `[${memberKeys.join(', ')}] — §2 C-1's ZoneLayout is \`{ size: number; collapsed?: boolean }\`, while the head still ` +
          `carries the REQUIRED total \`${SUPERSEDED_MEMBER}\` member (C-5's left column), so \`coerceZoneLayout\` DROPS the ` +
          `optional statement and \`zoneTrackVars\` has no statement to read. THIS IS THE EXPECTED RED (absence of the optional ` +
          `member, D-22 (1) / ASM-U1b-10) — not a crash, not a missing export, not a wrong fixture`,
      )
    }

    // ---- (h1) A COLLAPSED **OCCUPIED** ZONE PROJECTS 'auto' ---------------------------------
    const h1 = project(
      'h1 collapsed OCCUPIED left',
      occupied,
      layoutStating({ left: { size: SIZE, collapsed: true } }),
    )
    if (h1 !== null) {
      const value = readTrack(h1, 'left')
      if (value !== 'auto') {
        problems.push(
          `(h1) the COLLAPSED OCCUPIED left zone projects ${value === undefined ? 'NO KEY AT ALL' : JSON.stringify(value)}, ` +
            `not 'auto' — §2 C-4 (ASM-U1b-10): the collapsed zone's track token reads 'auto' so the grid area AND the ` +
            `\`position: fixed\` container box (whose insets are the same tokens) both take their extent from content`,
        )
      }
    }

    // ---- (h2) AN EMPTY ZONE KEEPS F-3's '0px', nothing stated OR stated collapsed ------------
    // `ASM-U1b-4` / `ASM-U1b-8`: the empty-track policy is an EMPTINESS fact and is the AUTHORITY
    // for that case, so a statement on an empty zone changes nothing here. Both the stated and the
    // unstated arm are driven, and every zone is read — a limb that only checked the collapse-
    // stated arm would pass on a projection that stopped collapsing empties.
    const h2Unstated = project('h2 EMPTY zones, nothing stated', vacant, defaultLayout())
    const h2Stated = project(
      'h2 EMPTY zones, stated collapsed:true',
      vacant,
      layoutStating({ left: { collapsed: true }, top: { collapsed: true } }),
    )
    for (const [label, vars] of [
      ['nothing stated', h2Unstated],
      ['stated collapsed:true', h2Stated],
    ] as Array<[string, Record<string, string> | null]>) {
      if (vars === null) continue
      for (const zone of CLOSED_ZONES) {
        const value = readTrack(vars, zone)
        if (value !== '0px') {
          problems.push(
            `(h2) the EMPTY "${zone}" zone (${label}) projects ${value === undefined ? 'NO KEY AT ALL' : JSON.stringify(value)}, ` +
              `not F-3's '0px' — §2 C-4 leaves the empty zone's extent to the landed 0px-track derivation ` +
              `(\`counts === 0\` still takes the '0px'/'') and ASM-U1b-4 forbids porting 'auto' OVER the empty case`,
          )
        }
      }
    }

    // ---- (h3) AN EXPANDED OCCUPIED ZONE KEEPS ITS PERSISTED SIZE ----------------------------
    const h3Stated = project(
      'h3 EXPANDED OCCUPIED left, stated collapsed:false',
      occupied,
      layoutStating({ left: { size: SIZE, collapsed: false } }),
    )
    const h3Unstated = project(
      'h3 EXPANDED OCCUPIED left, nothing stated',
      occupied,
      layoutStating({ left: { size: SIZE } }),
    )
    for (const [label, vars] of [
      ['stated collapsed:false', h3Stated],
      ['nothing stated (the derivation answers expanded)', h3Unstated],
    ] as Array<[string, Record<string, string> | null]>) {
      if (vars === null) continue
      const value = readTrack(vars, 'left')
      if (value !== `${SIZE}px`) {
        problems.push(
          `(h3) the EXPANDED OCCUPIED left zone (${label}, size ${SIZE}) projects ` +
            `${value === undefined ? 'NO KEY AT ALL' : JSON.stringify(value)}, not '${SIZE}px' — §2 C-4 keeps the ` +
            `persisted size on the expanded arm, and forking.md §7.1 lines 480-481 make the remembered \`size\` the one ` +
            `thing collapse never touches`,
        )
      }
    }

    // ---- (h4) A MERELY-REVEALED EMPTY ZONE IS THE DECLINED MEMBER (the removal path) ---------
    // `§3` limb `H`: `''`, "unchanged by this unit" — the empty zone the drag currently reveals
    // keeps the C11 carve-out, and a statement on it must not resurrect the collapse token.
    const h4Unstated = project('h4 REVEALED EMPTY left, nothing stated', vacant, defaultLayout(), {
      revealedZones: ['left'],
    })
    const h4Stated = project(
      'h4 REVEALED EMPTY left, stated collapsed:true',
      vacant,
      layoutStating({ left: { collapsed: true } }),
      { revealedZones: ['left'] },
    )
    for (const [label, vars] of [
      ['nothing stated', h4Unstated],
      ['stated collapsed:true', h4Stated],
    ] as Array<[string, Record<string, string> | null]>) {
      if (vars === null) continue
      const value = readTrack(vars, 'left')
      if (value !== '') {
        problems.push(
          `(h4) the REVEALED EMPTY left zone (${label}) projects ${value === undefined ? 'NO KEY AT ALL (the member was dropped, not declined)' : JSON.stringify(value)}, ` +
            `not '' — §3 limb H keeps the DECLINED member's key carrying '' (the REMOVAL PATH, \`layout-state.ts\`'s ` +
            `\`revealedPredicate\` adapter): the write site turns it into \`removeProperty\` and the stylesheet fallback ` +
            `supplies the persisted size. A revealed empty zone must NOT take the collapse token`,
        )
      }
    }

    // ---- (h5) THE ANTI-VACUITY TOOTH --------------------------------------------------------
    // The SAME four cases, read on the SAME token (`--zone-left-track`), must produce FOUR DISTINCT
    // VALUES, and the message NAMES which arm produced which value — so a reader can tell h1 from a
    // coincidence and can see WHICH two arms collapsed into one by a broken projection.
    interface Arm {
      arm: string
      expected: string
      vars: Record<string, string> | null
    }
    const arms: Arm[] = [
      { arm: 'h1 COLLAPSED OCCUPIED left → auto', expected: 'auto', vars: h1 },
      { arm: "h2 EMPTY left (stated collapsed) → F-3's 0px", expected: '0px', vars: h2Stated },
      { arm: 'h3 EXPANDED OCCUPIED left (stated false) → <size>px', expected: `${SIZE}px`, vars: h3Stated },
      { arm: "h4 REVEALED EMPTY left → '' (declined)", expected: '', vars: h4Stated },
    ]
    const readingsText = arms
      .map(
        ({ arm, vars }) =>
          `${arm} = ${vars === null ? '(no projection at all)' : readTrack(vars, 'left') === undefined ? '(NO KEY)' : JSON.stringify(readTrack(vars, 'left'))}`,
      )
      .join('; ')
    const expectedValues = arms.map((entry) => entry.expected)
    if (new Set(expectedValues).size !== 4) {
      problems.push(
        `(h5) the four arms' EXPECTED values are not pairwise distinct ([${expectedValues.map((value) => JSON.stringify(value)).join(', ')}]) — ` +
          `a ledger whose own expectations coincide cannot tell the projection's three arms apart, so the tooth would be vacuous by construction`,
      )
    }
    const observed = arms.map(({ arm, vars }) => ({ arm, value: readTrack(vars, 'left') }))
    const missing = observed.filter((entry) => entry.value === undefined)
    if (missing.length > 0) {
      problems.push(
        `(h5) ${missing.length} of the 4 arms produced NO value for ${trackKey('left')} ([${missing.map((entry) => entry.arm).join(', ')}]) — ` +
          `an ABSENT key cannot count as a distinct arm, so the four-way distinction is unproven. Read: ${readingsText}`,
      )
    } else {
      const buckets = new Map<string, string[]>()
      for (const entry of observed) {
        const bucket = JSON.stringify(entry.value)
        buckets.set(bucket, [...(buckets.get(bucket) ?? []), entry.arm])
      }
      if (buckets.size !== 4) {
        const collisions = [...buckets.entries()]
          .filter(([, armNames]) => armNames.length > 1)
          .map(([value, armNames]) => `${value} ← ${armNames.join(' == ')}`)
        problems.push(
          `(h5) the four arms produced ${buckets.size} distinct value(s) of ${trackKey('left')}, not 4. COLLISIONS: ` +
            `${collisions.join('; ')}. Read: ${readingsText}. The projection's three arms must be told apart by VALUE: ` +
            `'auto' (collapsed occupied), '0px' (empty), '<size>px' (expanded occupied), '' (revealed empty / declined)`,
        )
      }
    }

    expect(
      problems,
      `limb H — the projection's three arms (§2 C-4 / ASM-U1b-10), driven on the REAL pure \`zoneTrackVars\`. ` +
        `READINGS: ${readingsText}. The head's member set for a zone record STATED collapsed reads [${memberKeys.join(', ')}]. ` +
        `${problems.length} problem(s). THE LEDGER this limb grades: (h1) collapsed OCCUPIED → 'auto'; (h2) EMPTY → F-3's ` +
        `'0px' whether stated or not (ASM-U1b-4/8, unchanged); (h3) EXPANDED OCCUPIED → '<size>px' (the persisted size, ` +
        `stated or unstated); (h4) REVEALED EMPTY → '' (the DECLINED member, the removal path, unchanged by this unit); ` +
        `(h5) those four values are pairwise DISTINCT. The projection must read the state through the SAME ` +
        `\`zoneCollapsedOf\` predicate the assembler calls — no site re-spells the expression (§2 C-2). ` +
        `LAYER: the pure projection only; the \`index.html\` :has() mirror and the painted extent are G8-only`,
    ).toEqual([])
  })

  // =========================================================================
  // ⟨THE TWO BLIND GREEN ARMS ADDED BY THE POST-LANDING REPAIR PASS.⟩ `A'` closes limb `A`'s gap
  // (the strip EXISTS, the stack's WITHHOLDING was never read); `D'` closes limb `D`'s gap (the
  // control's COUNT after re-assembly, never its POSITION). Each arm grades its reader's
  // DISCRIMINATION in the same assertion, over a falsifier corpus it builds itself — a green that
  // cannot fail is the defect these two arms exist to remove.
  // =========================================================================

  it("A' — the fold's NEGATIVE half: a collapsed occupied zone emits the tab strip AND WITHHOLDS its pane payloads (no `.pane-frame[data-pane-id]`-shaped node and no `pane-<id>` frame root in the envelope's `content`), and a re-assembly introduces no frame for a collapsed zone either", () => {
    const problems: string[] = []

    // ---- THE DETECTOR: EVERY authored pane frame in an envelope's `content` payloads -----------
    /** A pane FRAME, as `paneSubtreeRoot` authors it: the `.pane-frame[data-pane-id]`-shaped node
     *  (the class the shell's frame chrome keys on) or the `pane-<id>` frame ROOT — carrying the
     *  pane's own `data-pane-id` and the zone its `targetPlacement` announces. */
    interface FrameReading {
      payload: number
      id: string
      paneId: string
      zone: string
    }
    const walkFrames = (nodes: unknown, payload: number, out: FrameReading[]): void => {
      if (!Array.isArray(nodes)) return
      for (const child of nodes as AssembledNode[]) {
        if (child == null || typeof child !== 'object') continue
        const id = propIdOf(child)
        const carried = child.props?.['data-pane-id']
        const paneId = typeof carried === 'string' ? carried : ''
        // The frame ROOT is `pane-<paneId>`; the frame's own collapse toggle (`pane-collapse-<id>`)
        // carries the same `data-pane-id` and must NOT count as a frame.
        const frameRoot = id.startsWith('pane-') && !id.startsWith('pane-collapse-') && paneId !== ''
        if (classesOf(child).includes('pane-frame') || frameRoot) {
          const placement = (child.placement as { targetPlacement?: unknown } | undefined)?.targetPlacement
          out.push({
            payload,
            id,
            paneId,
            zone: Array.isArray(placement) && placement.length > 0 ? String(placement[0]) : '',
          })
          continue // a frame's own children are the frame's business, never a second frame
        }
        walkFrames(child.children, payload, out)
      }
    }
    /** EVERY pane frame the envelope's `content` carries, in PAYLOAD order — the reading limb `A`
     *  never takes (it stops at the container's tab strip). */
    const paneFrames = (envelope: unknown): FrameReading[] => {
      const payloads = (envelope as { content?: unknown } | null | undefined)?.content
      const out: FrameReading[] = []
      if (!Array.isArray(payloads)) return out
      payloads.forEach((payload, index) => {
        walkFrames((payload as { content?: unknown } | null | undefined)?.content, index, out)
      })
      return out
    }
    const readingText = (readings: readonly FrameReading[]): string =>
      readings.length === 0
        ? '[]'
        : `[${readings.map((reading) => `p${reading.payload}:${reading.id}:${reading.paneId}@${reading.zone === '' ? '(no zone)' : reading.zone}`).join(', ')}]`
    const forPanes = (readings: readonly FrameReading[], paneIds: Iterable<string>): FrameReading[] => {
      const wanted = new Set(paneIds)
      return readings.filter((reading) => wanted.has(reading.paneId))
    }

    // ---- THE FIXTURE --------------------------------------------------------------------------
    // TWO panes in `left` (so the strip's per-pane census is decidable), ONE in `top` (a zone the
    // SAME envelope must still emit a frame for — the anti-blindness arm), `right` STATED collapsed
    // while EMPTY, and `bottom` DERIVED collapsed with nothing stated (`ASM-U1b-2`).
    const LEFT_PANES = ['zone-fold-a-left-1', 'zone-fold-a-left-2'] as const
    const TOP_PANE = 'zone-fold-a-top-1'
    const PANES: PaneSpec[] = [
      { id: LEFT_PANES[0], zone: 'left' },
      { id: LEFT_PANES[1], zone: 'left' },
      { id: TOP_PANE, zone: 'top' },
    ]
    const folded = assemble({
      panes: PANES,
      layout: layoutStating({ left: { collapsed: true }, right: { collapsed: true } }),
    })
    const foldedSecond = folded.reAssembledEnvelope()
    /** THE FALSIFIER CORPUS — the SAME panes in the SAME zones with `left` STATED EXPANDED. The
     *  detector must read BOTH left frames HERE; without this drive the zero below could not be
     *  told from a blind reader, which is exactly the defect `A'` closes. */
    const unfolded = assemble({ panes: PANES, layout: layoutStating({ left: { collapsed: false } }) })

    const leftReadings = forPanes(paneFrames(folded.envelope), LEFT_PANES)
    const leftSecondReadings = forPanes(paneFrames(foldedSecond), LEFT_PANES)
    const falsifierReadings = forPanes(paneFrames(unfolded.envelope), LEFT_PANES)
    const topReadings = forPanes(paneFrames(folded.envelope), [TOP_PANE])

    // ---- (a'0) THE FALSIFIER, GRADED FIRST ----------------------------------------------------
    if (falsifierReadings.length !== LEFT_PANES.length) {
      problems.push(
        `(a'0) THE FALSIFIER FAILED — over the EXPANDED corpus the detector read ${falsifierReadings.length} frame(s) for the two "left" panes, not ` +
          `${LEFT_PANES.length}: ${readingText(falsifierReadings)}. The zero this arm reports for the FOLDED zone would then be unreadable ` +
          `(an insensitive detector, not a withheld payload)`,
      )
    }
    const notExactlyOne = LEFT_PANES.filter(
      (paneId) => falsifierReadings.filter((reading) => reading.paneId === paneId).length !== 1,
    )
    if (notExactlyOne.length > 0) {
      problems.push(
        `(a'0) THE FALSIFIER FAILED PER PANE — [${notExactlyOne.join(', ')}] did not read EXACTLY ONE frame in the EXPANDED corpus: ` +
          `${readingText(falsifierReadings)}. The per-pane reading must be exactly one there, so that the folded zone's ` +
          `exactly-zero below is a graded value and not a coincidence`,
      )
    }

    // ---- (a'1) THE FOLD'S NEGATIVE HALF -------------------------------------------------------
    if (leftReadings.length > 0) {
      problems.push(
        `(a'1) the COLLAPSED OCCUPIED "left" zone STILL emits ${leftReadings.length} pane frame(s) in the envelope's \`content\` payloads: ` +
          `${readingText(leftReadings)} — §2 C-2's FOLD replaces the pane stack with the tab strip, so the payloads must be WITHHELD. ` +
          `Limb A's (a3) asserts only that the strip EXISTS, which an assembler emitting BOTH the strip and the stack would also satisfy`,
      )
    }
    if (leftSecondReadings.length > 0) {
      problems.push(
        `(a'1) a SECOND assembly over the result introduced ${leftSecondReadings.length} pane frame(s) for the FOLDED "left" zone: ` +
          `${readingText(leftSecondReadings)} — the fold is the state's reading, not a first-pass accident, so re-assembling over an ` +
          `envelope whose fold already withheld the stack must withhold it again`,
      )
    }

    // ---- (a'2) THE POSITIVE HALF OF THE SAME FOLD (the withholding cannot be bought by dropping both) -
    const leftContainer = containerFor(folded.children, 'left')
    if (leftContainer === undefined) {
      problems.push('(a\'2) the assembled root carries NO node with props.zone "left" AND props.id "zone:left" — the strip\'s census has no subject')
    } else {
      const tabs = (leftContainer.children ?? []) as AssembledNode[]
      for (const paneId of LEFT_PANES) {
        const mine = tabs.filter((tab) => tab.props?.['data-pane-id'] === paneId).length
        if (mine !== 1) {
          problems.push(
            `(a'2) the collapsed "left" strip carries ${mine} tab node(s) for pane ${JSON.stringify(paneId)}, not exactly one — ` +
              `§2 C-2 emits ONE \`data-pane-id\` tab per contained pane on the collapsed arm (the strip IS the collapsed paint), ` +
              `so the withheld stack must be REPLACED, never merely dropped`,
          )
        }
      }
      const inContainer: FrameReading[] = []
      walkFrames(leftContainer.children, -1, inContainer)
      if (inContainer.length > 0) {
        problems.push(
          `(a'2) the collapsed "left" CONTAINER's own children carry ${inContainer.length} pane frame(s) (${readingText(inContainer)}) — ` +
            `a payload-only reading would be dodged by a frame moved inside the container, so the container subtree is read too`,
        )
      }
    }

    // ---- (a'3) THE SAME ENVELOPE STILL EMITS ITS EXPANDED ZONE'S FRAME ------------------------
    if (topReadings.length !== 1) {
      problems.push(
        `(a'3) the EXPANDED OCCUPIED "top" zone reads ${topReadings.length} frame(s) in the SAME envelope, not exactly one: ` +
          `${readingText(topReadings)} — the fold is PER ZONE: a detector reading zero everywhere in the folded assembly ` +
          `would make (a'1) vacuous`,
      )
    }

    // ---- (a'4) THE COLLAPSED EMPTY ZONES, IN BOTH PASSES -------------------------------------
    const emptyZoneFrames = (envelope: unknown): FrameReading[] =>
      paneFrames(envelope).filter((reading) => reading.zone === 'right' || reading.zone === 'bottom')
    for (const [label, envelope] of [
      ['the FIRST assembly', folded.envelope],
      ['the RE-ASSEMBLY over its own output', foldedSecond],
    ] as Array<[string, unknown]>) {
      const phantom = emptyZoneFrames(envelope)
      if (phantom.length > 0) {
        problems.push(
          `(a'4) in ${label} the COLLAPSED EMPTY zones carry ${phantom.length} pane frame(s): ${readingText(phantom)} — ` +
            `"right" is STATED collapsed while empty and "bottom" DERIVES it (ASM-U1b-2), so neither owns a payload at all; ` +
            `the second pass must not INTRODUCE one`,
        )
      }
      if (!Array.isArray((envelope as { content?: unknown } | null | undefined)?.content)) {
        problems.push(
          `(a'4) in ${label} the envelope carries NO \`content\` payload array at all — the withholding reading has no subject, ` +
            `so its zero would be a structural accident rather than a governed fold`,
        )
      }
    }

    expect(
      problems,
      `limb A' — the FOLD's negative half (§2 C-2, ` +
        `ASM-U1b-3). READINGS: folded \`left\` = ${readingText(leftReadings)}; after the second pass = ${readingText(leftSecondReadings)}; ` +
        `the falsifier (SAME panes, \`left\` STATED expanded) = ${readingText(falsifierReadings)}; the same envelope's expanded \`top\` = ` +
        `${readingText(topReadings)}; the collapsed empty zones = ${readingText(emptyZoneFrames(foldedSecond))} (after the second pass). ` +
        `${problems.length} problem(s). WHY THIS CAN FAIL: the graded value is a PER-PANE payload reading driven over the SAME pane ids ` +
        `in TWO corpora — it must read exactly one frame per pane when the zone is expanded and exactly zero when it is folded — ` +
        `so neither a detector that never finds frames nor an assembler that emits strip AND stack survives it. ` +
        `LAYER: envelope-class — the real \`assembleAppGraphEnvelope\` over a real \`PaneRegistry\`; no paint, no grid, no window`,
    ).toEqual([])
  })

  it("D' — the adjacency AFTER re-assembly: for ALL FOUR zones the control sits at `children[indexOf(container) + 1]` (the ID at the INDEX, not a count), exactly one control per zone, NONE for `zone:sidebar`, and a STRAY control is MOVED back by the second pass", () => {
    const problems: string[] = []
    const CONTROL = 'zone-collapse-'
    const idOf = (node: AssembledNode | undefined): string => (node === undefined ? '' : propIdOf(node))
    const isControl = (node: AssembledNode | undefined): boolean => idOf(node).startsWith(CONTROL)

    /** THE ADJACENCY CHECKER — ONE reader, driven over every children array this arm grades AND,
     *  below, over two deliberately broken corpora derived from the REAL second children. The graded
     *  value is the ID **AT** `children[indexOf(container) + 1]`, never the census: a count cannot
     *  tell a placed control from one that drifted a slot later, which is exactly why limb `D`'s
     *  (iv) count cannot close this gap. */
    const adjacencyProblems = (label: string, children: readonly AssembledNode[]): string[] => {
      const out: string[] = []
      for (const zone of CLOSED_ZONES) {
        const container = containerFor(children, zone)
        const controlId = `${CONTROL}${zone}`
        if (container === undefined) {
          out.push(
            `${label}: NO node carries props.zone ${JSON.stringify(zone)} AND props.id ${JSON.stringify(`zone:${zone}`)} — the adjacency has no container`,
          )
          continue
        }
        const index = children.indexOf(container)
        const neighbour = children[index + 1]
        if (idOf(neighbour) !== controlId) {
          out.push(
            `${label}: children[indexOf(zone:${zone}) + 1] reads ${JSON.stringify(idOf(neighbour) || '(none)')}, not ${JSON.stringify(controlId)} ` +
              `(the container is at index ${index} of ${children.length}) — ASM-U1b-5's adjacency is a POSITION: a control one slot later, ` +
              `or authored BEFORE its container, is the buried/mis-anchored shape the control was moved out of`,
          )
        }
        const census = children.filter((node) => propIdOf(node) === controlId).length
        if (census !== 1) {
          out.push(`${label}: ${census} node(s) carry props.id ${JSON.stringify(controlId)}, not exactly one`)
        }
      }
      // NONE FOR THE LEGACY `zone:sidebar` PRODUCER — it is not one of the four pane LAYOUT zones,
      // so it owns no collapse control on any pass.
      const sidebarControlId = `${CONTROL}sidebar`
      const authored = children.filter((node) => propIdOf(node) === sidebarControlId)
      if (authored.length > 0) {
        out.push(
          `${label}: ${authored.length} node(s) carry props.id ${JSON.stringify(sidebarControlId)} — the control's census is the closed four ` +
            `(left/right/top/bottom), so the legacy \`zone:sidebar\` producer must carry NONE`,
        )
      }
      const addressing = children.filter((node) => isControl(node) && node.props?.['zone'] === 'sidebar')
      if (addressing.length > 0) {
        out.push(
          `${label}: ${addressing.length} control(s) address props.zone "sidebar" ([${addressing.map((node) => idOf(node)).join(', ')}]) — ` +
            `the control's \`zone\` carrier is a LAYOUT zone name (the handler body reads it back), never the legacy sidebar zone`,
        )
      }
      const sidebar = children.find((node) => propIdOf(node) === 'zone:sidebar')
      if (sidebar === undefined) {
        out.push(`${label}: the legacy \`zone:sidebar\` producer is ABSENT — the "no control for it" reading would have no subject`)
      } else if (isControl(children[children.indexOf(sidebar) + 1])) {
        out.push(
          `${label}: children[indexOf(zone:sidebar) + 1] carries ${JSON.stringify(idOf(children[children.indexOf(sidebar) + 1]))} — ` +
            `the anchored control is authored for the four pane zones only (ASM-U1b-5), never for the legacy sidebar producer`,
        )
      }
      return out
    }

    // ---- THE FIXTURE --------------------------------------------------------------------------
    // `bottom` is a COLLAPSED OCCUPIED zone (two panes — the strip case), `left` is expanded and
    // occupied, `top`/`right` are empty: the four zones span every census the second pass must
    // preserve while it MOVES each control back to its container's next slot.
    const PANES: PaneSpec[] = [
      { id: 'zone-fold-d-left-1', zone: 'left' },
      { id: 'zone-fold-d-bottom-1', zone: 'bottom' },
      { id: 'zone-fold-d-bottom-2', zone: 'bottom' },
    ]
    const first = assemble({ panes: PANES, layout: layoutStating({ bottom: { collapsed: true } }) })
    const second = first.reAssemble()

    // ---- (d'1) THE FIRST PASS (the baseline, so a red names WHICH pass broke the adjacency) ---
    problems.push(...adjacencyProblems('the FIRST assembly', first.children))

    // ---- (d'2) THE ADJACENCY **AFTER** RE-ASSEMBLY (limb D's gap) -----------------------------
    problems.push(...adjacencyProblems('the RE-ASSEMBLY over its own output', second))

    // ---- (d'3) THE STRAY-CONTROL DRIVE -------------------------------------------------------
    // A control moved to the END of `children` is the corpus that proves (d'2)'s exact index
    // reading is falsifiable: the array really can carry a mis-placed control, and the second pass
    // must MOVE it (never keep it, never duplicate it).
    const perturbedEnvelope = ((): unknown => {
      const copy = JSON.parse(JSON.stringify(first.envelope)) as { template: { root: { children: AssembledNode[] } } }
      const kids = copy.template.root.children
      const at = kids.findIndex((node) => propIdOf(node) === `${CONTROL}left`)
      if (at < 0) return null
      const [stray] = kids.splice(at, 1)
      kids.push(stray!)
      return copy
    })()
    if (perturbedEnvelope === null) {
      problems.push(`(d'3) the first assembly authors no ${CONTROL}left control to strand — the stray-control drive has no subject`)
    } else {
      const perturbed = [
        ...(((perturbedEnvelope as { template: { root: { children: AssembledNode[] } } }).template.root.children ??
          []) as AssembledNode[]),
      ]
      // THE PERTURBATION IS GRADED BEFORE THE REPAIR: if the moved control still read clean, the
      // drive below would prove nothing about the second pass.
      const beforeRepair = adjacencyProblems('the STRAY corpus, before the second pass', perturbed)
      if (!beforeRepair.some((line) => line.includes('zone:left'))) {
        problems.push(
          `(d'3) the STRAY corpus reads CLEAN for "left" through the adjacency checker (children: ` +
            `[${perturbed.map((node) => idOf(node) || '(no id)').join(', ')}]) — the perturbation did not move a control out of ` +
            `\`children[indexOf(container) + 1]\`, so the repair below would prove nothing`,
        )
      }
      const repairedEnvelope = first.reAssembledEnvelope(perturbedEnvelope)
      const repaired = [
        ...(((repairedEnvelope as { template?: { root?: { children?: unknown[] } } }).template?.root?.children ??
          []) as AssembledNode[]),
      ]
      problems.push(...adjacencyProblems('the SECOND pass over a STRAY control', repaired))
    }

    // ---- (d'4) THE CHECKER'S OWN DISCRIMINATION, on corpora built from the REAL second children --
    const shifted = [...second]
    const leftAt = shifted.findIndex((node) => propIdOf(node) === `${CONTROL}left`)
    if (leftAt < 0) {
      problems.push(`(d'4) the second pass authors no ${CONTROL}left control to shift — the discriminator drive has no subject`)
    } else {
      const [stray] = shifted.splice(leftAt, 1)
      shifted.splice(leftAt + 1, 0, stray!)
      const named = adjacencyProblems('synthetic: the "left" control one slot late', shifted)
      if (!named.some((line) => line.includes('zone:left'))) {
        problems.push(
          `(d'4) the checker did NOT name "left" on a corpus whose control sits ONE SLOT LATE — its message(s) read [${named.join(' | ') || 'none'}], ` +
            `so the index reading it gives the real assemblies is not discriminating`,
        )
      }
    }
    const deleted = second.filter((node) => propIdOf(node) !== `${CONTROL}top`)
    const namedDeleted = adjacencyProblems('synthetic: the "top" control deleted', deleted)
    if (!namedDeleted.some((line) => line.includes(`${CONTROL}top`))) {
      problems.push(
        `(d'4) the checker did NOT name "${CONTROL}top" on a corpus with that control DELETED — its message(s) read ` +
          `[${namedDeleted.join(' | ') || 'none'}], so "exactly one control per zone" is not discriminating either`,
      )
    }

    expect(
      problems,
      `limb D' — the anchored control AFTER re-assembly (ASM-U1b-5; the gap limb D's COUNT leaves). ` +
        `FIRST pass children: [${first.children.map((node) => idOf(node) || '(no id)').join(', ')}]. ` +
        `The RE-ASSEMBLY read ${second.length} child(ren): [${second.map((node) => idOf(node) || '(no id)').join(', ')}]. ` +
        `${problems.length} problem(s). WHY THIS CAN FAIL: the graded value is the ID AT \`children[indexOf(container) + 1]\` for each of ` +
        `the four zones (a CENSUS of \`${CONTROL}<zone>\` nodes passes on a control placed anywhere), and the arm drives TWO deliberately broken ` +
        `corpora it builds from the REAL second children — a one-slot-late control and a deleted control — so the clean reading is ` +
        `measured against a checker that is shown to red. ` +
        `LAYER: envelope-class — the real \`assembleAppGraphEnvelope\` over a real \`PaneRegistry\`; no paint, no grid, no window`,
    ).toEqual([])
  })
})
