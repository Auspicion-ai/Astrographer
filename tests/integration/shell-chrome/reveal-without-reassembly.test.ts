// tests/integration/shell-chrome/reveal-without-reassembly.test.ts — unit
// `reveal-without-reassembly`'s OWN ROW, authored BEFORE any byte of the reveal paint / the
// ONE mirror predicate / the record back-fill (RCA-1) and RUN at the pre-edit head.
//
// SOURCE OF EVERY ASSERTION: `docs/L3/shell-chrome/reveal-without-reassembly.md` §7 (THE LANDED
// SHAPE of the paint — the CLASS half on the live `zone:<z>` DOM container, resolved by
// `document.getElementById('zone:'+zone)`, CONFIRMED by the its `zone` attribute, toggling the ONE
// `is-revealed` token through a composed `className`, then the TRACK half `this.applyZoneTracks()`
// unconditionally) + §2 (the row-limb table: `P`/`Q`/`T` and their sub-arms) + `docs/L2/...` §10
// (the measured mechanism) + `docs/L1/unit-reveal-without-reassembly.md` §2 `R-1`…`R-5`, §3, §7a
// (`RR-F1` the `state-slice` carrier DESTROYS the mount, `RR-F7`/`RR-F8` the record-less record).
//
// THE CRITICAL RE-DERIVATION, stated once because it is the whole point of this file: an EARLIER
// version of this row graded the reveal against a `runtime.applyCommand({ kind: 'state-slice' })`
// carrier. That carrier was MEASURED (`RR-F1`) to destroy the assembled mount (the op arms the
// ENGINE's async pass-2, whose mode is chosen PER NODE, so the non-content-anchored `zone:<z>`
// container compiles focused-slice and the next `diffMinimal` emits `remove:root`). It is NOT the
// landed design. Limbs `P` and `T` below are therefore written AFRESH against the DOM carrier — the
// `zone:<z>` container's own `className` — and NEVER against `applyCommand` ops. Limb `Q`'s teeth
// (`q1` no load on the reveal path, `q2`/`q3` the SOURCE clauses) are carrier-agnostic and carry
// over in substance. In THIS row the runtime double's `applyCommand` recorder exists only as a
// NEGATIVE reader (`p5`(b), `q3`'s `paintCarrierFree` clause): the paint must never reach it.
//
// THE FOUR LIMBS, ONE `it` EACH, ONE AGGREGATE `expect(problems, …)` EACH:
//   P — the paint: `p1` a reveal-set change to `['right']` stamps `is-revealed` on `zone:right`
//       and leaves the other three containers BYTE-IDENTICAL (the gesture-start baseline is
//       asserted FIRST, so a paint that stamps unconditionally reds); `p2` THE ONE-PREDICATE
//       CLAIM, driven — each zone's painted token list DEEP-EQUALS the class list the REAL
//       `assembleAppGraphEnvelope` authors for the SAME inputs (floored: the oracle's revealed list
//       must contain `is-revealed` AND differ from its unrevealed list, and `zoneMirrorsFor` must
//       exist and answer the same four lists); `p3` a two-zone crossing (`['left']` → `['right']`)
//       leaves the token on `right` and NOT on `left` (no stale token); `p4` idempotence — the SAME
//       set re-painted leaves every container BYTE-IDENTICAL, with a changed-set control;
//       `p5` fail-soft — a container whose `zone` attribute is absent or names a DIFFERENT zone is
//       skipped while the correctly-attributed zones are still painted, a host with NO runtime
//       still paints the class half and never calls `applyCommand`, and nothing throws.
//   Q — the load is GONE from the reveal path (the defect's own tooth): `q1` `startPaneDrag` + a
//       `movePaneDrag` crossing into an EMPTY zone calls `loadEnvelope` ZERO times while the reveal
//       set becomes `['right']` — floored by the SEED `loadAppGraph` reaching `loadEnvelope` once
//       on the SAME double; `q2` a SOURCE clause over `sidebar-panes.ts`: `onRevealChange`'s body
//       reaches `applyRevealPaint` and NOT `rerenderAppGraph`/`loadAppGraph`/`loadEnvelope`, with
//       TWO MUTANTS (the PRE-FIX body, and the real body with the paint call DELETED) driven to
//       `false` first; `q3` the same reading proves the TRACK half survives (`this.applyZoneTracks())`
//       with a deleted-call mutant), and that the paint's body names NONE of `applyCommand`,
//       `state-slice`, `writeZoneMirrors`, `loadEnvelope`, `loadAppGraph`, `rerenderAppGraph`.
//   T — the boundary clears: `t1` a PLACEMENT-EQUAL `commitPaneDrop` into an EXPANDED zone writes
//       ZERO `setLayout`s AND the painted clear removes `is-revealed` from the destination (the
//       CONTROL asserts the destination carried it BEFORE the drop); `t2` `cancelPaneDrag()` clears
//       through the controller's own `onChange` in EXACTLY ONE paint pass (counted, with the
//       pre-cancel state asserted); `t3` a full gesture of N moves with K distinct reveal-set
//       crossings writes the class exactly K times, never N (both counts printed).
//   D — the drop COMMITS on a record that holds no entry (`R-5`): `d1` `panes: []` + a drop on a
//       zone other than the derived one ⇒ `setLayout` EXACTLY ONCE, carrying the entry in the
//       destination; `d2` CONTROL — the same host with the entry PRESENT also writes exactly once;
//       `d3` the NO-OP law survives the back-fill (absent entry dropped on its OWN derived
//       placement ⇒ ZERO writes); `d4` the `pane-drag.ts` seal is intact (behavioural + a source
//       clause that the back-fill's `deriveLayout` never reaches the pure module); `d5` an id the
//       registry does not call an ENABLED `app-graph` pane is NOT back-filled (ZERO writes).
//
// LAYER (MANDATORY, D-10 / `RCA-12`): every limb is ENVELOPE-class —
// `envelope-class — the REAL SidebarPanes over the layout-less DOM shim; no pointer capture, no
// computed style (G8-only)`. `P`/`T` read a `className` STRING on a shim element; `Q`(q2)/(q3) and
// `D`(d4)'s seal are SOURCE clauses over a file's TEXT and say so. What this file CANNOT supply,
// named so nobody quotes it: the drag GESTURE and the surviving pointer capture, the reveal's
// painted class on a REAL DOM, the grid consuming the removed inline track, the destination's
// computed `--zone-<z>-track`, the drop's committed BOX and the restoring second drag — all
// `G8`-only (L3 §4). NO limb here asserts a rendered geometry, a computed style or a pointer.
//
// NON-VACUITY (mandatory, stated per limb in its own comment): every negative assertion carries a
// POSITIVE CONTROL beside it, and each limb names WHICH MUTATION WOULD RED IT. The `P`/`T`
// arithmetic was additionally cross-checked against a SIMULATED landed paint (the §7 shape driven
// over this very harness, with the REAL assembler as its oracle): one token on one zone, byte-equal
// to the oracle on all four zones, zero writes on a same-set re-paint, 2 writes on a one-zone
// change, one class write on the drop's clear, 4 container resolutions per pass, and 7 writes
// across 7 crossings — so no `P`/`T` arm is reachable only by refusing to land.
//
// REACHABILITY RULE (the file always COLLECTS and RUNS): `applyRevealPaint` is PRIVATE and does
// not exist at this head; `zoneMirrorsFor` does not exist either. Every symbol this unit would ADD
// is reached through `await import()` and read with a `readExport` TYPE check, so a missing symbol
// is a NAMED problem inside that limb's aggregate `expect(problems, …)` — never an ESM link error,
// never a crash, never a skipped arm. The paint is DRIVEN through the PUBLIC seams only
// (`startPaneDrag`/`movePaneDrag`/`commitPaneDrop`/`cancelPaneDrag`/`setLayout`/`revealZones`).
//
// THE DOM-DOUBLE FACTS this harness has to handle (read off `src/shared/dom-shim.ts`):
// `document.getElementById(id)` AUTO-CREATES a `div` and never answers null; a freshly created
// element carries NO attributes and an EMPTY `className`; the shim has NO `classList` (`className`
// is a plain string). So the harness MATERIALISES the four containers and annotates each with the
// class list the REAL assembler authors for the unrevealed state — the DOM the paint then sees is
// the DOM the assembler authored, which is what makes `p2`'s deep-equality a fair claim.
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`; it writes
// nothing and reads only the repo it lives in. Every path derives from THIS FILE's own location
// (`ROOT`), so a missing substrate FAILS (ENOENT) instead of skipping, and every census carries a
// non-vacuity floor so no negative limb can pass by being blind.
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { installShim, ShimElement } from '../../../src/shared/dom-shim.js'
import { assembleAppGraphEnvelope } from '../../../src/renderer/pane-graph.js'
import { createPaneRegistry } from '../../../src/renderer/pane-registry.js'
import {
  LAYOUT_PANE_ZONES,
  coerceLayout,
  defaultLayout,
  type LayoutState,
  type LayoutZoneName,
} from '../../../src/renderer/layout-state.js'
import { movePane, panePlacementOf, type DragPoint, type ZoneBounds } from '../../../src/renderer/pane-drag.js'
import { SidebarPanes } from '../../../src/renderer/sidebar-panes.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

const SIDEBAR_FILE = 'src/renderer/sidebar-panes.ts'
const PANE_GRAPH_FILE = 'src/renderer/pane-graph.ts'
const PANE_DRAG_FILE = 'src/renderer/pane-drag.ts'

const CLOSED_ZONES: readonly Zone[] = ['left', 'right', 'top', 'bottom']
type Zone = 'left' | 'right' | 'top' | 'bottom'

const fingerprint = (value: unknown): string => JSON.stringify(value)

/** A value as a failure message prints it. */
const shown = (value: unknown): string => (value === undefined ? '(absent)' : JSON.stringify(value))

/** The `className` STRING of a zone container, split into its token list (the shim has no
 *  `classList`; `className` is the carrier — `dom-shim.ts:81`). */
const tokensOf = (raw: string): string[] => String(raw ?? '').split(/\s+/).filter(Boolean)

beforeAll(() => {
  installShim()
})

// ---------------------------------------------------------------------------
// THE EXPORT READING — non-fatal by design: a missing export is a NAMED problem in the limb's
// aggregate assertion, never a module-load error and never a raw `TypeError`.
// ---------------------------------------------------------------------------
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
        `limb ${limb}: \`${name}\` is NOT a function on ${file} (typeof read: ${typeof value}) — the export this limb drives ` +
          `does not exist at this head, so the limb's subject is ABSENT (no arm below is skipped: every one reports the absence)`,
      ],
    }
  }
  return { value, problems: [] }
}

// ---------------------------------------------------------------------------
// THE CLASS ORACLE — the REAL assembler, used exactly as §2 `R-1` says the paint must read the
// four zone class lists. This is the same call shape `pane-move-target.test.ts` uses for its
// assembled-envelope limbs (a minimal traversal envelope + a real `PaneRegistry` + a synthesized
// context), so there is no second harness in the tree.
// ---------------------------------------------------------------------------
interface AssembledNode {
  type?: unknown
  props?: Record<string, unknown>
  css?: { classes?: unknown }
  children?: unknown[]
  placement?: { placementName?: unknown }
}

/** The traversal envelope every oracle call assembles — no zone container pre-authored, so the
 *  assembler AUTHORS all four (the node it pushes carries `props.id = 'zone:<z>'`). */
function minimalTraversalEnvelope(): Record<string, unknown> {
  return {
    template: { root: { type: 'div', props: { id: 'wiki-root' }, children: [] } },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

const minimalContext = (): Record<string, unknown> => ({
  snapshot: null,
  docHeads: null,
  currentDocumentId: null,
  currentNodeId: null,
  backRefs: new Map<string, string[]>(),
  crosslinks: [],
})

/** The four zone containers' `css.classes` as the REAL assembler authors them for these inputs —
 *  the ONE-predicate oracle of `P`(p2). */
function oracleZoneClasses(
  registry: ReturnType<typeof createPaneRegistry>,
  layout: LayoutState,
  revealedZones: readonly Zone[],
): Record<Zone, string[]> {
  const assembled = assembleAppGraphEnvelope({
    traversalEnvelope: minimalTraversalEnvelope() as never,
    registry,
    ctx: minimalContext() as never,
    layout,
    revealedZones: [...revealedZones] as LayoutZoneName[],
  })
  const root = (assembled.envelope as { template?: { root?: AssembledNode } } | null | undefined)?.template?.root
  const children = Array.isArray(root?.children) ? (root.children as AssembledNode[]) : []
  const out = {} as Record<Zone, string[]>
  for (const zone of CLOSED_ZONES) {
    const container = children.find(
      (child) => child?.placement?.placementName === zone || child?.props?.['id'] === `zone:${zone}`,
    )
    const classes = container?.css?.classes
    out[zone] = Array.isArray(classes) ? classes.map(String) : []
  }
  return out
}

// ---------------------------------------------------------------------------
// THE RAW LAYOUT BUILDER — ABSENCE-PRESERVING ON PURPOSE: a pane with no stated `index` is written
// with NO `index` KEY AT ALL, and a zone with no stated `collapsed` is written with NO `collapsed`
// KEY, so the derivation (`zoneCollapsedOf`) is what decides (ASM-U1b-1/2).
// ---------------------------------------------------------------------------
interface RawPane {
  id: string
  zone: Zone
  index?: number
  collapsed?: boolean
}

function rawLayout(
  panes: readonly RawPane[],
  zones?: Partial<Record<Zone, { size?: number; collapsed?: boolean }>>,
): LayoutState {
  const base = defaultLayout()
  const built = {
    version: base.version,
    panes: panes.map((pane) => {
      const entry: Record<string, unknown> = { id: pane.id, zone: pane.zone, collapsed: pane.collapsed === true }
      if (typeof pane.index === 'number') entry['index'] = pane.index
      return entry
    }),
    zones: {
      left: { ...base.zones.left, ...(zones?.left ?? {}) },
      right: { ...base.zones.right, ...(zones?.right ?? {}) },
      top: { ...base.zones.top, ...(zones?.top ?? {}) },
      bottom: { ...base.zones.bottom, ...(zones?.bottom ?? {}) },
    },
    stage: { ...base.stage },
    topBar: { ...base.topBar },
  }
  return built as unknown as LayoutState
}

const panesOf = (layout: LayoutState): LayoutState['panes'] => (Array.isArray(layout.panes) ? layout.panes : [])

/** The zone a pane entry occupies in a written record, or `(absent)`. */
const entryZoneOf = (layout: LayoutState | undefined, paneId: string): string => {
  if (layout === undefined) return '(absent)'
  const entry = panesOf(layout).find((pane) => pane.id === paneId)
  return entry === undefined ? '(absent)' : String(entry.zone)
}

// ---------------------------------------------------------------------------
// THE CLASS-WRITE / CONTAINER-RESOLUTION MONITOR — the harness's whole observable for `P`/`T`.
// `writes` counts `className` assignments (the ONE carrier the landed paint writes); `resolutions`
// counts `document.getElementById('zone:<z>')` calls, which is ONE per zone per paint pass in the
// landed shape, so a SECOND host-side paint pass reds `T`(t2) by arithmetic.
// ---------------------------------------------------------------------------
interface ClassMonitor {
  raw: () => Record<Zone, string>
  tokens: () => Record<Zone, string[]>
  writes: () => number
  writesOf: (zone: Zone) => number
  resolutions: () => number
  reset: () => void
  element: (zone: Zone) => ShimElement
}

interface ZoneDom {
  monitor: ClassMonitor
  restore: () => void
}

/** Materialise the four `zone:<z>` containers, annotate each with its authored `zone` attribute
 *  and the class list the REAL assembler authors for the UNREVEALED state, and instrument them. */
function materialiseZones(authored: Record<Zone, string[]>): ZoneDom {
  const doc = (globalThis as unknown as { document: { getElementById: (id: string) => ShimElement } }).document
  const elements = {} as Record<Zone, ShimElement>
  const writesByZone = {} as Record<Zone, number>
  const resolutionsByZone = {} as Record<Zone, number>
  const backing = {} as Record<Zone, string>
  // the fork's OWN zone enumeration decides the container census (never a second spelling)
  for (const zone of LAYOUT_PANE_ZONES as readonly Zone[]) {
    const el = doc.getElementById(`zone:${zone}`)
    // THE ANNOTATION the paint's confirm step reads (`el.getAttribute('zone') === zone`), and the
    // authored class list — a freshly auto-created shim div has neither.
    el.setAttribute('zone', zone)
    elements[zone] = el
    writesByZone[zone] = 0
    resolutionsByZone[zone] = 0
    backing[zone] = authored[zone].join(' ')
    let value = authored[zone].join(' ')
    Object.defineProperty(el, 'className', {
      configurable: true,
      get: () => value,
      set: (next: unknown) => {
        writesByZone[zone] += 1
        value = String(next)
      },
    })
    const originalSetAttribute = el.setAttribute.bind(el)
    // A `class`-attribute write is the SAME carrier as `className` in the real DOM; count and
    // mirror it so a landing that composes through `setAttribute` is not read as "no paint".
    el.setAttribute = (key: string, next: unknown): void => {
      if (key === 'class') {
        writesByZone[zone] += 1
        value = String(next)
        return
      }
      originalSetAttribute(key, next)
    }
    backing[zone] = value
  }
  const originalGetElementById = doc.getElementById.bind(doc)
  doc.getElementById = (id: string): ShimElement => {
    const zone = id.startsWith('zone:') ? (id.slice('zone:'.length) as Zone) : null
    if (zone != null && (CLOSED_ZONES as readonly string[]).includes(zone)) resolutionsByZone[zone] += 1
    return originalGetElementById(id)
  }
  const monitor: ClassMonitor = {
    raw: () => {
      const out = {} as Record<Zone, string>
      for (const zone of CLOSED_ZONES) out[zone] = elements[zone].className
      return out
    },
    tokens: () => {
      const out = {} as Record<Zone, string[]>
      for (const zone of CLOSED_ZONES) out[zone] = tokensOf(elements[zone].className)
      return out
    },
    writes: () => CLOSED_ZONES.reduce((sum, zone) => sum + writesByZone[zone], 0),
    writesOf: (zone) => writesByZone[zone],
    resolutions: () => CLOSED_ZONES.reduce((sum, zone) => sum + resolutionsByZone[zone], 0),
    reset: () => {
      for (const zone of CLOSED_ZONES) {
        writesByZone[zone] = 0
        resolutionsByZone[zone] = 0
      }
    },
    element: (zone) => elements[zone],
  }
  return {
    monitor,
    restore: () => {
      doc.getElementById = originalGetElementById
      for (const zone of CLOSED_ZONES) {
        // drop the accessor so a later `installShim()` starts from a clean element
        try {
          delete (elements[zone] as unknown as Record<string, unknown>)['className']
        } catch {
          /* a non-configurable accessor would be a harness bug, never a limb failure */
        }
      }
    },
  }
}

// ---------------------------------------------------------------------------
// THE REAL HOST SEAM DRIVE — the REAL `SidebarPanes` over the DOM double (the
// `pane-move-target.test.ts` `seedHost` pattern), plus a RECORDING RUNTIME DOUBLE: it counts
// `loadEnvelope`, records every `applyCommand` op, and answers `nodeState()`.
//
// WHY the double is ATTACHED and then SEEDED through `loadAppGraph`: the host only re-assembles
// when it holds BOTH a runtime and a `lastTraversalEnvelope` (`sidebar-panes.ts:3841-3843`), so
// attaching alone would make `Q`(q1)'s zero vacuous. `loadAppGraph` is the SEED path: it sets
// `lastTraversalEnvelope` AND reaches `loadEnvelope` exactly once — the floor that proves the
// counter can move on THIS double.
// ---------------------------------------------------------------------------
interface RuntimeDouble {
  loads: unknown[]
  commands: unknown[]
  nodeStateCalls: string[]
  double: Record<string, unknown>
}

function recordingRuntime(): RuntimeDouble {
  const loads: unknown[] = []
  const commands: unknown[] = []
  const nodeStateCalls: string[] = []
  const double = {
    loadEnvelope: (envelope: unknown): void => {
      loads.push(envelope)
    },
    applyCommand: (op: unknown): void => {
      commands.push(op)
    },
    nodeState: (id: unknown): unknown => {
      nodeStateCalls.push(String(id))
      return { states: [] }
    },
    renderedHtmlResult: (): { renderedHtml: string } => ({ renderedHtml: '' }),
  }
  return { loads, commands, nodeStateCalls, double }
}

interface PaneSpec {
  id: string
  zone: Zone
  title?: string
  defaultOrder?: number
  enabled?: boolean
  scope?: 'app-graph' | 'operator'
}

interface HostDrive {
  host: SidebarPanes
  registry: ReturnType<typeof createPaneRegistry>
  seed: LayoutState
  /** every layout the host committed through `bridge.operatorSettings.set`, in order */
  writes: LayoutState[]
  /** every `setLayout` CALL (a call is the write; a no-op is ZERO calls) */
  calls: () => number
  runtime: RuntimeDouble | null
  /** `loadEnvelope` calls made by the SEED path (the `Q`(q1) floor) */
  seedLoads: () => number
  seedError: () => string
  dom: ZoneDom
  restore: () => void
}

function seedHost(
  seed: LayoutState,
  panes: readonly PaneSpec[],
  options?: { runtime?: boolean },
): HostDrive {
  installShim()
  const globals = globalThis as Record<string, unknown>
  const previousWindow = globals['window']
  const registry = createPaneRegistry()
  for (const pane of panes) {
    registry.register({
      id: pane.id,
      title: pane.title ?? pane.id,
      scope: pane.scope ?? 'app-graph',
      defaultZone: pane.zone,
      ...(typeof pane.defaultOrder === 'number' ? { defaultOrder: pane.defaultOrder } : {}),
      render: () => ({ type: 'div', props: { id: `${pane.id}-render-root` } }),
    })
    if (pane.enabled !== false) registry.enable(pane.id)
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
    // the drag path's re-derive guard: no dirty edit (so the re-assemble is NOT skipped)
    editController: { anyDirty: () => false },
  } as never)
  globals['window'] = { provident: {} }
  // The seed write is NOT a gesture: it happens BEFORE the counter is installed.
  host.setLayout(seed)
  writes.length = 0

  // THE ANNOTATED CONTAINERS — the DOM the paint will read is the DOM the assembler authored.
  const authored = oracleZoneClasses(registry, seed, [])
  const dom = materialiseZones(authored)

  // THE RECORDING RUNTIME DOUBLE: attached, then SEEDED through the public `loadAppGraph`.
  let runtime: RuntimeDouble | null = null
  let seedLoads = 0
  let seedError = ''
  if (options?.runtime !== false) {
    runtime = recordingRuntime()
    ;(host as unknown as Record<string, unknown>)['runtime'] = runtime.double
    try {
      host.loadAppGraph(runtime.double as never, minimalTraversalEnvelope() as never)
    } catch (error) {
      seedError = String(error)
    }
    seedLoads = runtime.loads.length
  }

  let calls = 0
  const realSetLayout = host.setLayout.bind(host)
  ;(host as unknown as Record<string, unknown>)['setLayout'] = (layout: LayoutState): void => {
    calls += 1
    realSetLayout(layout)
  }
  dom.monitor.reset()
  return {
    host,
    registry,
    seed,
    writes,
    calls: () => calls,
    runtime,
    seedLoads: () => seedLoads,
    seedError: () => seedError,
    dom,
    restore: () => {
      dom.restore()
      globals['window'] = previousWindow
    },
  }
}

// ---------------------------------------------------------------------------
// THE ZONE GEOMETRY THE GESTURE CROSSES — four NON-degenerate boxes in one coordinate space,
// separated by more than `SidebarPanes`' 24px snap threshold (so "which zone is the pointer on" is
// decidable), plus a GAP point that sits within the threshold of NO box (so the reveal set can
// return to `[]` and the crossing census is honest).
// ---------------------------------------------------------------------------
const ZONE_BOUNDS: readonly ZoneBounds[] = [
  { zone: 'left', left: 0, right: 100, top: 0, bottom: 620 },
  { zone: 'right', left: 560, right: 660, top: 0, bottom: 620 },
  { zone: 'top', left: 120, right: 500, top: 0, bottom: 60 },
  { zone: 'bottom', left: 120, right: 500, top: 540, bottom: 620 },
]
const POINT_ON: Record<Zone, DragPoint> = {
  left: { x: 50, y: 300 },
  right: { x: 610, y: 300 },
  top: { x: 300, y: 30 },
  bottom: { x: 300, y: 580 },
}
/** Inside NO box and more than the snap threshold from every one of them (the empty reveal). */
const GAP_POINT: DragPoint = { x: 330, y: 300 }

// ---------------------------------------------------------------------------
// THE SOURCE READERS (`Q`(q2)/(q3), `D`(d4)) — a brace-matched BODY slice out of a file's TEXT and
// a set of STRUCTURED facts about what that body names. Nothing here asserts line numbers or exact
// code text: every tooth reads "does the body call X".
// ---------------------------------------------------------------------------

/** The index of the `}` matching the `{` at `openIndex`, comment- and string-aware (a template
 *  literal's `${…}` interpolation is skipped as literal text, which is depth-neutral). `-1` when
 *  the text is unbalanced. */
function matchBrace(text: string, openIndex: number): number {
  let depth = 0
  let mode: 'code' | 'line' | 'block' | 'single' | 'double' | 'template' = 'code'
  let i = openIndex
  while (i < text.length) {
    const ch = text[i]!
    const two = text.slice(i, i + 2)
    if (mode === 'code') {
      if (two === '//') {
        mode = 'line'
        i += 2
        continue
      }
      if (two === '/*') {
        mode = 'block'
        i += 2
        continue
      }
      if (ch === "'") {
        mode = 'single'
        i += 1
        continue
      }
      if (ch === '"') {
        mode = 'double'
        i += 1
        continue
      }
      if (ch === '`') {
        mode = 'template'
        i += 1
        continue
      }
      if (ch === '{') depth += 1
      else if (ch === '}') {
        depth -= 1
        if (depth === 0) return i
      }
      i += 1
      continue
    }
    if (mode === 'line') {
      if (ch === '\n') mode = 'code'
      i += 1
      continue
    }
    if (mode === 'block') {
      if (two === '*/') {
        mode = 'code'
        i += 2
        continue
      }
      i += 1
      continue
    }
    if (mode === 'single' || mode === 'double') {
      if (ch === '\\') {
        i += 2
        continue
      }
      if ((mode === 'single' && ch === "'") || (mode === 'double' && ch === '"')) mode = 'code'
      i += 1
      continue
    }
    // template literal — interpolation braces are balanced, so they are depth-neutral
    if (ch === '\\') {
      i += 2
      continue
    }
    if (ch === '`') mode = 'code'
    i += 1
  }
  return -1
}

interface BodyRegion {
  body: string
  problems: string[]
}

/** The `{ … }` body a declaration anchor opens — the anchor is a REGEX so the reader is not tied
 *  to a line number, a parameter list or a `private` keyword the landing may restate. */
function bodyAt(file: string, anchor: RegExp, label: string, limb: string): BodyRegion {
  const text = readText(file)
  const match = anchor.exec(text)
  if (match === null) {
    return {
      body: '',
      problems: [
        `limb ${limb}: ${file} carries NO readable \`${label}\` declaration (anchor ${String(anchor)} found nothing) — ` +
          `the source clause below has no subject at this head, so its absence is reported instead of skipped`,
      ],
    }
  }
  const open = match.index + match[0].length - 1
  const close = matchBrace(text, open)
  if (close < 0) {
    return {
      body: '',
      problems: [`limb ${limb}: ${file}'s \`${label}\` body is UNBALANCED (no matching brace) — the clause cannot be read`],
    }
  }
  return { body: text.slice(open, close + 1), problems: [] }
}

/** The CODE of a body slice: comments replaced by spaces (`newlines` kept), string/template
 *  literals preserved. Every clause below reads CODE, so a doc comment that merely NAMES a
 *  forbidden symbol (`// never a loadEnvelope here`) can never red a landing that obeys the law. */
function stripComments(text: string): string {
  let out = ''
  let mode: 'code' | 'line' | 'block' | 'single' | 'double' | 'template' = 'code'
  let i = 0
  while (i < text.length) {
    const ch = text[i]!
    const two = text.slice(i, i + 2)
    if (mode === 'code') {
      if (two === '//') {
        mode = 'line'
        out += '  '
        i += 2
        continue
      }
      if (two === '/*') {
        mode = 'block'
        out += '  '
        i += 2
        continue
      }
      if (ch === "'") mode = 'single'
      else if (ch === '"') mode = 'double'
      else if (ch === '`') mode = 'template'
      out += ch
      i += 1
      continue
    }
    if (mode === 'line') {
      if (ch === '\n') {
        mode = 'code'
        out += '\n'
      } else out += ' '
      i += 1
      continue
    }
    if (mode === 'block') {
      if (two === '*/') {
        mode = 'code'
        out += '  '
        i += 2
        continue
      }
      out += ch === '\n' ? '\n' : ' '
      i += 1
      continue
    }
    // inside a string / template literal — copied verbatim
    out += ch
    if (ch === '\\') {
      out += text[i + 1] ?? ''
      i += 2
      continue
    }
    if ((mode === 'single' && ch === "'") || (mode === 'double' && ch === '"') || (mode === 'template' && ch === '`')) {
      mode = 'code'
    }
    i += 1
  }
  return out
}

/** Which of `tokens` the body's CODE names (a word-boundary match, so `loadEnvelope` is not found
 *  inside `xloadEnvelopes`). Comments are stripped FIRST — the clause grades what the body DOES. */
function namesAny(body: string, tokens: readonly string[]): string[] {
  const code = stripComments(body)
  return tokens.filter((token) => new RegExp(`\\b${token}\\b`).test(code))
}

const REASSEMBLY_TOKENS = ['rerenderAppGraph', 'loadAppGraph', 'loadEnvelope'] as const
const PAINT_FORBIDDEN_TOKENS = [
  'applyCommand',
  'writeZoneMirrors',
  'loadEnvelope',
  'loadAppGraph',
  'rerenderAppGraph',
] as const

const reachesPaintCall = (body: string): boolean => /\bapplyRevealPaint\s*\(/.test(stripComments(body))
const callsZoneTracks = (body: string): boolean => /\.\s*applyZoneTracks\s*\(/.test(stripComments(body))
const paintCarrierNames = (body: string): string[] => {
  const found = namesAny(body, PAINT_FORBIDDEN_TOKENS)
  if (/\bstate-slice\b/.test(stripComments(body))) found.push('state-slice')
  return found
}

/** `Q`(q2)'s clause, as ONE predicate so its mutants can be driven against it. */
function revealBodyClauseHolds(body: string): boolean {
  return reachesPaintCall(body) && namesAny(body, REASSEMBLY_TOKENS).length === 0
}

// ---------------------------------------------------------------------------
// LIMBS
// ---------------------------------------------------------------------------
describe('reveal-without-reassembly — the paint without a load, the load gone from the reveal path, the boundary clears, the record back-fill', () => {
  it('P — the paint reaches the LIVE containers without a load: one token on one zone, deep-equal to the assembler, idempotent, fail-soft', async () => {
    // §3 limb P, sub-arms p1…p5. LAYER: envelope-class — the REAL `SidebarPanes` over the
    // layout-less DOM shim; the observable is a `className` STRING on a shim element (no CSS, no
    // grid, no pointer). The class oracle is the REAL `assembleAppGraphEnvelope`.
    // NON-VACUITY: (p1)'s "only right changed" is preceded by the gesture-start BASELINE (nothing
    // revealed anywhere) so a paint that stamps unconditionally reds; (p2)'s deep-equality is
    // floored by "the oracle's revealed list contains `is-revealed` AND differs from its
    // unrevealed list"; (p3)'s no-stale-token tooth is paired with the single-zone transition on
    // the SAME host writing exactly one zone; (p4)'s byte-identity is paired with a changed-set
    // control; (p5)'s skip arms are paired with the correctly-attributed zones still painting.
    // MUTATION THAT WOULD RED IT: deleting the token diff (stamping `is-revealed` on all four
    // zones) reds (p1); re-deriving the class list from anything but `zoneMirrorsFor`/the
    // assembler's predicate reds (p2); keeping a stale token on the zone left reds (p3); writing
    // on every invocation regardless of the live token reds (p4); resolving a container without
    // confirming its `zone` attribute, or requiring a runtime, reds (p5).
    const problems: string[] = []

    const ONE = 'probe-p-one'
    const TWO = 'probe-p-two'
    const panes: PaneSpec[] = [
      { id: ONE, zone: 'left', defaultOrder: 0 },
      { id: TWO, zone: 'left', defaultOrder: 1 },
    ]
    const seed = rawLayout([
      { id: ONE, zone: 'left', index: 0 },
      { id: TWO, zone: 'left', index: 1 },
    ])
    const drive = seedHost(seed, panes)
    try {
      // ---- THE GESTURE-START BASELINE (asserted FIRST, so a blanket stamp reds here) ----------
      const baselineRaw = drive.dom.monitor.raw()
      const baselineTokens = drive.dom.monitor.tokens()
      for (const zone of CLOSED_ZONES) {
        if (baselineTokens[zone].includes('is-revealed')) {
          problems.push(
            `(p1) the BASELINE container \`zone:${zone}\` already carries \`is-revealed\` before any gesture ` +
              `(className = ${shown(baselineRaw[zone])}) — §2 R-3 makes the reveal a TRANSITION write: with the reveal set ` +
              `empty nothing may carry the token, and the harness materialised exactly the class list the assembler ` +
              `authors for the unrevealed state (${shown(oracleZoneClasses(drive.registry, seed, [])[zone])})`,
          )
        }
      }
      if (fingerprint(baselineTokens) !== fingerprint(oracleZoneClasses(drive.registry, seed, []))) {
        problems.push(
          `(p1) the harness's own baseline containers do NOT carry the assembler's unrevealed class list ` +
            `(baseline ${fingerprint(baselineTokens)} vs oracle ${fingerprint(oracleZoneClasses(drive.registry, seed, []))}) — ` +
            `(p2)'s deep-equality would be graded against a DOM the assembler never authors`,
        )
      }

      // ---- (p1) A REVEAL-SET CHANGE TO `['right']` --------------------------------------------
      const commandsAtBaseline = drive.runtime?.commands.length ?? 0
      drive.dom.monitor.reset()
      drive.host.startPaneDrag(ONE)
      drive.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
      const revealAfterP1 = [...drive.host.revealZones()]
      if (fingerprint(revealAfterP1) !== fingerprint(['right'])) {
        problems.push(
          `(p1) the gesture's reveal set reads ${fingerprint(revealAfterP1)}, not ["right"] — the paint arm has no subject ` +
            `(the pointer is inside the EMPTY \`right\` box and more than the snap threshold from every other box)`,
        )
      }
      const p1Tokens = drive.dom.monitor.tokens()
      const p1Raw = drive.dom.monitor.raw()
      if (!p1Tokens['right'].includes('is-revealed')) {
        problems.push(
          `(p1) the transition to 'right' left \`zone:right\`'s className at ${shown(p1Raw['right'])} (tokens ` +
            `${fingerprint(p1Tokens['right'])}) — the reveal never reached the LIVE container. §2 R-2's CLASS half must toggle ` +
            `the ONE \`is-revealed\` token on the container it resolves by \`document.getElementById('zone:right')\`; at this ` +
            `head no such paint exists (\`applyRevealPaint\` is absent from ${SIDEBAR_FILE}) and \`onRevealChange\` still ` +
            `re-assembles the graph instead (\`Q\`(q2) reads that body)`,
        )
      }
      for (const zone of CLOSED_ZONES) {
        if (zone === 'right') continue
        if (p1Raw[zone] !== baselineRaw[zone]) {
          problems.push(
            `(p1) the one-zone transition also rewrote \`zone:${zone}\` (${shown(baselineRaw[zone])} → ${shown(p1Raw[zone])}) — ` +
              `only the zone whose reveal token CHANGES may be written; the other three stay byte-identical`,
          )
        }
        if (drive.dom.monitor.writesOf(zone) !== 0) {
          problems.push(
            `(p1) the one-zone transition wrote \`zone:${zone}\`'s className ${drive.dom.monitor.writesOf(zone)} time(s) — ` +
              `exactly ONE zone's class changes on this transition`,
          )
        }
      }
      if (drive.dom.monitor.writesOf('right') !== 1) {
        problems.push(
          `(p1) the revealed zone's className was written ${drive.dom.monitor.writesOf('right')} time(s), not EXACTLY ONE — ` +
            `the paint's live diff (§2 step 1c) writes once per CHANGED zone per transition`,
        )
      }
      // THE CARRIER TOOTH (RR-F1): the SUPERSEDED `state-slice` carrier must never be used by the
      // reveal. The runtime double IS attached here (the seed proved it accepts commands), so a
      // zero is a real reading and not a dead recorder.
      const commandsDuringTransition = (drive.runtime?.commands.length ?? 0) - commandsAtBaseline
      if (commandsDuringTransition !== 0) {
        problems.push(
          `(p1) the reveal transition recorded ${commandsDuringTransition} \`applyCommand\` op(s) on the attached runtime double ` +
            `(baseline ${commandsAtBaseline}, first op ${fingerprint(drive.runtime?.commands[commandsAtBaseline])}) — the class ` +
            `half is a LIVE-DOM \`className\` write; the \`state-slice\`/\`applyCommand\` carrier was MEASURED to destroy the ` +
            `mount (\`RR-F1\`, L2 §10) and is NOT this unit's design`,
        )
      }

      // ---- (p2) THE ONE-PREDICATE CLAIM, DRIVEN (the REAL assembler is the oracle) ------------
      const oracleRevealed = oracleZoneClasses(drive.registry, seed, ['right'])
      const oracleUnrevealed = oracleZoneClasses(drive.registry, seed, [])
      // THE TWO FLOORS first: the oracle must actually be able to tell the two states apart.
      if (!oracleRevealed['right'].includes('is-revealed')) {
        problems.push(
          `(p2) the ORACLE is blind: \`assembleAppGraphEnvelope\` authors ${fingerprint(oracleRevealed['right'])} for the ` +
            `revealed \`right\` zone — no \`is-revealed\` token, so a paint compared against it could not be graded`,
        )
      }
      const differing = CLOSED_ZONES.filter(
        (zone) => fingerprint(oracleRevealed[zone]) !== fingerprint(oracleUnrevealed[zone]),
      )
      if (differing.length === 0) {
        problems.push(
          `(p2) the ORACLE cannot discriminate: its revealed and unrevealed class lists are IDENTICAL for all four zones ` +
            `(${fingerprint(oracleUnrevealed)}) — two empty/equal lists cannot satisfy the claim`,
        )
      }
      // the driven comparison
      const p2Tokens = drive.dom.monitor.tokens()
      const p2Reading: string[] = []
      for (const zone of CLOSED_ZONES) {
        p2Reading.push(`${zone}: live ${fingerprint(p2Tokens[zone])} vs oracle ${fingerprint(oracleRevealed[zone])}`)
        if (fingerprint(p2Tokens[zone]) !== fingerprint(oracleRevealed[zone])) {
          problems.push(
            `(p2) \`zone:${zone}\`'s painted class list ${fingerprint(p2Tokens[zone])} does NOT deep-equal the class list the ` +
              `REAL assembler authors for the SAME inputs ${fingerprint(oracleRevealed[zone])} — §2 R-1's ONE predicate: the ` +
              `paint and the assembler must not be able to disagree`,
          )
        }
      }
      // the R-1 export probe: `zoneMirrorsFor` is the ONE caller-shaped reading the paint reads.
      const graph = (await import('../../../src/renderer/pane-graph.js')) as Record<string, unknown>
      const mirrorsFor = readExport(graph, 'zoneMirrorsFor', PANE_GRAPH_FILE, 'P')
      problems.push(...mirrorsFor.problems)
      if (typeof mirrorsFor.value === 'function') {
        const answers = (mirrorsFor.value as (a: unknown, b: unknown, c: unknown) => unknown)(drive.registry, seed, [
          'right',
        ]) as Record<Zone, unknown> | null
        const lists = {} as Record<Zone, string[]>
        for (const zone of CLOSED_ZONES) {
          const value = answers == null ? undefined : answers[zone]
          lists[zone] = Array.isArray(value) ? value.map(String) : []
        }
        if (fingerprint(lists) !== fingerprint(oracleRevealed)) {
          problems.push(
            `(p2) \`zoneMirrorsFor\` answered ${fingerprint(lists)}, not the assembler's own four lists ` +
              `${fingerprint(oracleRevealed)} — the ONE predicate must be the SAME computation the assembler makes`,
          )
        }
        const unrevealedAnswer = (mirrorsFor.value as (a: unknown, b: unknown, c: unknown) => unknown)(
          drive.registry,
          seed,
          [],
        ) as Record<Zone, unknown> | null
        const unrevealedLists = {} as Record<Zone, string[]>
        for (const zone of CLOSED_ZONES) {
          const value = unrevealedAnswer == null ? undefined : unrevealedAnswer[zone]
          unrevealedLists[zone] = Array.isArray(value) ? value.map(String) : []
        }
        // the probe's own falsifier: the helper must ALSO answer the UNREVEALED lists (an export
        // that answers one hard-coded list for every input reds here)
        if (fingerprint(unrevealedLists) !== fingerprint(oracleUnrevealed)) {
          problems.push(
            `(p2) \`zoneMirrorsFor\` answered ${fingerprint(unrevealedLists)} for the EMPTY reveal set, not ` +
              `${fingerprint(oracleUnrevealed)} — the predicate is TOTAL over the reveal carrier and cannot be a constant`,
          )
        }
      }

      // ---- (p3) A TWO-ZONE CROSSING, ON A FRESH HOST (no stale token) --------------------------
      const cross = seedHost(seed, panes)
      try {
        cross.host.startPaneDrag(ONE)
        cross.dom.monitor.reset()
        cross.host.movePaneDrag(POINT_ON.left, ZONE_BOUNDS)
        const leftStep = cross.dom.monitor.tokens()
        const leftWrites = CLOSED_ZONES.filter((zone) => cross.dom.monitor.writesOf(zone) > 0)
        if (!leftStep['left'].includes('is-revealed')) {
          problems.push(
            `(p3) the SINGLE-zone transition to \`['left']\` did not stamp \`is-revealed\` on \`zone:left\` ` +
              `(className = ${shown(cross.dom.monitor.raw()['left'])}) — the crossing below has no token to lose`,
          )
        }
        if (fingerprint(leftWrites) !== fingerprint(['left'])) {
          problems.push(
            `(p3) the single-zone transition wrote ${fingerprint(leftWrites)}, not exactly ["left"] — ONE zone's token changes ` +
              `on a single-zone reveal (this is the count (p1) is graded against)`,
          )
        }
        cross.dom.monitor.reset()
        cross.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
        const crossedTokens = cross.dom.monitor.tokens()
        const crossedRaw = cross.dom.monitor.raw()
        if (!crossedTokens['right'].includes('is-revealed')) {
          problems.push(
            `(p3) after the crossing to \`['right']\`, \`zone:right\` reads ${shown(crossedRaw['right'])} — the zone ENTERED ` +
              `must gain the token`,
          )
        }
        if (crossedTokens['left'].includes('is-revealed')) {
          problems.push(
            `(p3) after the crossing to \`['right']\`, \`zone:left\` STILL carries \`is-revealed\` (${shown(crossedRaw['left'])}) — ` +
              `the token left behind is STALE: the paint diffs all four zones per transition, so a zone that leaves the set loses it`,
          )
        }
        const crossingWrites = CLOSED_ZONES.filter((zone) => cross.dom.monitor.writesOf(zone) > 0)
        if (fingerprint(crossingWrites) !== fingerprint(['left', 'right'])) {
          problems.push(
            `(p3) the two-zone crossing wrote ${fingerprint(crossingWrites)}, not ["left", "right"] — a crossing is TWO class ` +
              `changes (the zone left loses the token, the zone entered gains it)`,
          )
        }

        // ---- (p4) IDEMPOTENCE: the SAME set re-painted is BYTE-IDENTICAL ------------------------
        const beforeRepeat = cross.dom.monitor.raw()
        cross.dom.monitor.reset()
        // (i) the repeat MOVE: the controller itself does not call the paint for an unchanged set
        cross.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
        const afterRepeat = cross.dom.monitor.raw()
        if (fingerprint(afterRepeat) !== fingerprint(beforeRepeat)) {
          problems.push(
            `(p4) a repeat move inside the SAME reveal set changed the containers (${fingerprint(beforeRepeat)} → ` +
              `${fingerprint(afterRepeat)}) — a transition to the same set writes NOTHING (§2 step 1c, the live diff)`,
          )
        }
        if (cross.dom.monitor.writes() !== 0) {
          problems.push(
            `(p4) a repeat move inside the SAME reveal set produced ${cross.dom.monitor.writes()} class write(s), not ZERO`,
          )
        }
        // (ii) a DIRECT re-invocation of the paint with the same set (the stronger arm: it bypasses
        // the controller's own gate, so the diff itself is what must stay silent)
        const paint = (cross.host as unknown as { applyRevealPaint?: () => void }).applyRevealPaint
        if (typeof paint !== 'function') {
          problems.push(
            `(p4) the private \`applyRevealPaint\` is ABSENT on the host (typeof read: ${typeof paint}) — the direct ` +
              `re-invocation arm has no subject at this head, so the idempotence claim is graded on the repeat move alone ` +
              `and can never be strengthened by a landing that paints unconditionally`,
          )
        } else {
          try {
            paint.call(cross.host)
          } catch (error) {
            problems.push(`(p4) the direct re-invocation THREW (${String(error)}) — the paint never throws`)
          }
          const afterPaint = cross.dom.monitor.raw()
          if (fingerprint(afterPaint) !== fingerprint(beforeRepeat)) {
            problems.push(
              `(p4) re-invoking the paint with the SAME reveal set changed the containers (${fingerprint(beforeRepeat)} → ` +
                `${fingerprint(afterPaint)}) — the diff is against the LIVE token, never the previous DESIRED list`,
            )
          }
          if (cross.dom.monitor.writes() !== 0) {
            problems.push(
              `(p4) re-invoking the paint with the SAME set produced ${cross.dom.monitor.writes()} class write(s), not ZERO — ` +
                `the paint resolves the containers (${cross.dom.monitor.resolutions()} resolution(s)) and writes only where the ` +
                `live token disagrees`,
            )
          }
        }
        // the CHANGED-SET CONTROL: the same host, one zone further, MUST change bytes
        cross.dom.monitor.reset()
        cross.host.movePaneDrag(POINT_ON.top, ZONE_BOUNDS)
        const afterControl = cross.dom.monitor.raw()
        if (fingerprint(afterControl) === fingerprint(beforeRepeat)) {
          problems.push(
            `(p4) the CHANGED-SET CONTROL (\`['right']\` → \`['top']\`) left every container byte-identical ` +
              `(${fingerprint(beforeRepeat)}) — without this arm the idempotence tooth above is satisfied by a paint that never writes`,
          )
        }
        if (cross.dom.monitor.writes() === 0) {
          problems.push('(p4) the CHANGED-SET CONTROL produced ZERO class writes — the write counter cannot move on this host')
        }
      } finally {
        cross.restore()
      }

      // ---- (p5) FAIL-SOFT: the confirm step, no runtime, and never a throw --------------------
      // (a) a container whose `zone` attribute names a DIFFERENT zone is SKIPPED, and the correctly
      // attributed zones still paint.
      const skew = seedHost(seed, panes)
      try {
        skew.host.startPaneDrag(ONE)
        skew.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
        const beforeSkew = skew.dom.monitor.raw()
        // mis-attribute `right` and cross back to `left`: `left` must gain, `right` must be left alone
        skew.dom.monitor.element('right').setAttribute('zone', 'left')
        let skewThrew = ''
        try {
          skew.host.movePaneDrag(POINT_ON.left, ZONE_BOUNDS)
        } catch (error) {
          skewThrew = String(error)
        }
        if (skewThrew !== '') {
          problems.push(`(p5)(a) the mis-attributed container made the paint THROW (${skewThrew}) — a per-zone miss is a no-op`)
        }
        const afterSkew = skew.dom.monitor.raw()
        const skewTokens = skew.dom.monitor.tokens()
        if (!skewTokens['left'].includes('is-revealed')) {
          problems.push(
            `(p5)(a) with \`zone:right\` mis-attributed, the correctly-attributed \`zone:left\` did NOT gain the token ` +
              `(${shown(afterSkew['left'])}) — a miss on ONE zone must not stop the pass`,
          )
        }
        if (afterSkew['right'] !== beforeSkew['right']) {
          problems.push(
            `(p5)(a) the paint WROTE the mis-attributed container (${shown(beforeSkew['right'])} → ${shown(afterSkew['right'])}) — ` +
              `§2 R-2 confirms \`el.getAttribute('zone') === zone\` before writing and SKIPS a differently-zoned element`,
          )
        }
        // (a2) the SAME skip for an ABSENT attribute (`left` stripped, crossing back to `right`)
        const absent = seedHost(seed, panes)
        try {
          absent.host.startPaneDrag(ONE)
          absent.host.movePaneDrag(POINT_ON.left, ZONE_BOUNDS)
          const beforeAbsent = absent.dom.monitor.raw()
          absent.dom.monitor.element('left').removeAttribute('zone')
          let absentThrew = ''
          try {
            absent.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
          } catch (error) {
            absentThrew = String(error)
          }
          if (absentThrew !== '') {
            problems.push(`(p5)(a) the attribute-less container made the paint THROW (${absentThrew})`)
          }
          const absentTokens = absent.dom.monitor.tokens()
          if (!absentTokens['right'].includes('is-revealed')) {
            problems.push(
              `(p5)(a) with \`zone:left\`'s \`zone\` attribute REMOVED, the correctly-attributed \`zone:right\` did not gain the ` +
                `token (${shown(absent.dom.monitor.raw()['right'])}) — the skip is per zone, never per pass`,
            )
          }
          // the SKIP's own observable: the unconfirmable container is LEFT ALONE, byte for byte
          // (its stale token is the DOCUMENTED consequence — a skipped element is never written).
          if (absent.dom.monitor.raw()['left'] !== beforeAbsent['left']) {
            problems.push(
              `(p5)(a) the attribute-less \`zone:left\` was WRITTEN across the crossing (${shown(beforeAbsent['left'])} → ` +
                `${shown(absent.dom.monitor.raw()['left'])}) — an element the paint cannot CONFIRM is skipped and stays ` +
                `byte-identical (fail-soft, §2 R-2); the paint never guesses a container from its id alone`,
            )
          }
        } finally {
          absent.restore()
        }
      } finally {
        skew.restore()
      }
      // (b) NO RUNTIME: the CLASS half still paints (ASM-RR-6 — only the class half is guarded).
      // NOTE the `applyCommand`-never-called tooth lives in (p1), on a host whose runtime double IS
      // attached: on THIS host there is no double at all, so "zero ops" here would be vacuous.
      const bare = seedHost(seed, panes, { runtime: false })
      try {
        if (bare.runtime !== null) {
          problems.push('(p5)(b) the harness failed to build a runtime-LESS host — the arm has no subject')
        }
        bare.host.startPaneDrag(ONE)
        let bareThrew = ''
        try {
          bare.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
        } catch (error) {
          bareThrew = String(error)
        }
        if (bareThrew !== '') {
          problems.push(`(p5)(b) driving a host with NO runtime threw (${bareThrew}) — the paint never throws`)
        }
        if (!bare.dom.monitor.tokens()['right'].includes('is-revealed')) {
          problems.push(
            `(p5)(b) on a host with NO runtime the class half did NOT paint \`zone:right\` ` +
              `(${shown(bare.dom.monitor.raw()['right'])}) — ASM-RR-6 arms the CLASS half fail-soft; the paint must not REQUIRE ` +
              `a runtime (only the TRACK half would be degraded, and it is independently fail-soft)`,
          )
        }
      } finally {
        bare.restore()
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb P — the paint reaches the LIVE containers (§3 limb P, sub-arms p1…p5; §2 R-1/R-2; ASM-RR-5). ` +
        `${problems.length} problem(s). §2 R-2's TWO halves: the CLASS first (resolve \`document.getElementById('zone:<z>')\`, ` +
        `CONFIRM its \`zone\` attribute, read \`className\`, write the composed token ONLY where \`is-revealed\` disagrees with ` +
        `\`zoneMirrorsFor(registry, layout, revealedZones)\`), then the TRACK half \`this.applyZoneTracks()\` unconditionally. ` +
        `envelope-class — the REAL SidebarPanes over the layout-less DOM shim; no pointer capture, no computed style (G8-only)`,
    ).toEqual([])
  })

  it('Q — the load is GONE from the reveal path: zero `loadEnvelope` across a crossing, the handler’s body reaches the paint, and the track half survives', () => {
    // §3 limb Q, sub-arms q1/q2/q3. LAYER: (q1) is the REAL host over the DOM double with a
    // RECORDING runtime double (a `loadEnvelope` counter); (q2)/(q3) are SOURCE clauses over
    // `src/renderer/sidebar-panes.ts`'s TEXT, with MUTATED copies driven to `false` first.
    // NON-VACUITY: (q1)'s ZERO is floored by the SEED `loadAppGraph` reaching `loadEnvelope` at
    // least once on the SAME double (a dead counter cannot answer zero) and by the reveal set
    // actually becoming `['right']`; (q2)'s clause is driven through TWO mutants — the PRE-FIX
    // body and the real body with the paint call DELETED — which must both read `false`; (q3)'s
    // track tooth is proved against a REAL body that calls `applyZoneTracks` (`rerenderAppGraph`)
    // and its deleted-call mutant, and the carrier clause against a REAL body that names
    // `applyCommand` (`syncZoneMirrors`).
    // MUTATION THAT WOULD RED IT: restoring `this.rerenderAppGraph()` in `onRevealChange` reds
    // (q1) and (q2); a paint that drops the track half reds (q3); a paint that reaches
    // `applyCommand`/`state-slice` (the SUPERSEDED carrier, `RR-F1`) reds (q3)'s carrier clause.
    const problems: string[] = []

    const ONE = 'probe-q-one'
    const panes: PaneSpec[] = [{ id: ONE, zone: 'left', defaultOrder: 0 }]
    const seed = rawLayout([{ id: ONE, zone: 'left', index: 0 }])
    const drive = seedHost(seed, panes)
    try {
      // ---- (q1) THE DEFECT'S OWN TOOTH ---------------------------------------------------------
      if (drive.seedError() !== '') {
        problems.push(
          `(q1) the SEED \`loadAppGraph\` THREW (${drive.seedError()}) — the runtime double was never attached through the ` +
            `public seed path, so "zero loads" below would be vacuous`,
        )
      }
      if (drive.seedLoads() < 1) {
        problems.push(
          `(q1) the SEED path reached \`loadEnvelope\` ${drive.seedLoads()} time(s) on this double — the FLOOR failed: a counter ` +
            `that cannot move can answer zero for any implementation`,
        )
      }
      const loadsAtSeed = drive.runtime?.loads.length ?? 0
      drive.host.startPaneDrag(ONE)
      const revealBefore = [...drive.host.revealZones()]
      drive.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
      const loadsDuringGesture = (drive.runtime?.loads.length ?? 0) - loadsAtSeed
      const revealAfter = [...drive.host.revealZones()]
      if (fingerprint(revealBefore) !== fingerprint([]) || fingerprint(revealAfter) !== fingerprint(['right'])) {
        problems.push(
          `(q1) the crossing read reveal ${fingerprint(revealBefore)} → ${fingerprint(revealAfter)}, not [] → ["right"] — ` +
            `the gesture never crossed into the EMPTY \`right\` zone, so the load count below is not the reveal path's`,
        )
      }
      if (loadsDuringGesture !== 0) {
        problems.push(
          `(q1) the crossing into the EMPTY \`right\` zone called \`loadEnvelope\` ${loadsDuringGesture} time(s), not ZERO — ` +
            `this is ` +
            '`ZONE-REVEAL-REASSEMBLY-KILLS-THE-CROSS-ZONE-DRAG`: `onRevealChange` still re-assembles the graph ' +
            `(\`rerenderAppGraph\` → \`loadAppGraph\` → \`runtime.loadEnvelope\`), which destroys and re-mints the ` +
            `\`.pane-frame\` nodes, so the browser fires \`lostpointercapture\` on the frame holding the gesture and the ` +
            `cross-zone drop never commits. The SEED path proved the counter moves (${drive.seedLoads()} load(s))`,
        )
      }
      if (!drive.dom.monitor.tokens()['right'].includes('is-revealed')) {
        problems.push(
          `(q1) the painted token did NOT reach \`zone:right\` across the crossing ` +
            `(className = ${shown(drive.dom.monitor.raw()['right'])}) — the reveal's carrier must be the LIVE container, not a ` +
            `re-assembled envelope the gesture cannot survive`,
        )
      }

      // ---- (q2) THE HANDLER'S BODY ------------------------------------------------------------
      const revealBody = bodyAt(
        SIDEBAR_FILE,
        /onRevealChange\s*:\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{/,
        'onRevealChange',
        'Q',
      )
      problems.push(...revealBody.problems)
      if (revealBody.body !== '') {
        // THE TWO MUTANTS FIRST — a clause that passes on any text is not a clause.
        const PRE_FIX_BODY = `{\n        this.revealedZones = [...zones]\n        this.rerenderAppGraph()\n      }`
        if (revealBodyClauseHolds(PRE_FIX_BODY)) {
          problems.push(
            `(q2) the clause cannot fail: the PRE-FIX body (${PRE_FIX_BODY.replace(/\s+/g, ' ').trim()}) reads as HOLDING — ` +
              `the very body this unit removes must be REJECTED`,
          )
        }
        const paintDeleted = revealBody.body
          .replace(/this\.\s*applyRevealPaint\s*\(\s*\)/g, '')
          .replace(/\bapplyRevealPaint\s*\(\s*\)/g, '')
        if (revealBodyClauseHolds(paintDeleted)) {
          problems.push(
            '(q2) the clause cannot fail: the REAL body with the paint call DELETED still reads as HOLDING — a handler that ' +
              're-pointed to nothing must be rejected',
          )
        }
        // THEN the real body.
        if (!revealBodyClauseHolds(revealBody.body)) {
          const reassembly = namesAny(revealBody.body, REASSEMBLY_TOKENS)
          problems.push(
            `(q2) \`onRevealChange\`'s body reaches the paint: ${reachesPaintCall(revealBody.body)}, and still reaches the ` +
              `RE-ASSEMBLY: [${reassembly.join(', ')}] (body read: ${revealBody.body.replace(/\s+/g, ' ').trim()}) — ` +
              `§2 R-3/` +
              '`INV-R`: no reveal transition may be applied by a re-assembly. The handler must be ' +
              '`this.revealedZones = [...zones]` followed by `this.applyRevealPaint()` and NOTHING else',
          )
        }
      }

      // ---- (q3) THE TRACK HALF SURVIVES, AND THE BODY NAMES NO CARRIER -------------------------
      // (i) THE READER'S OWN PROOF against a REAL body that calls the track: `rerenderAppGraph`.
      const rerenderBody = bodyAt(SIDEBAR_FILE, /rerenderAppGraph\s*\(\s*\)\s*:\s*void\s*\{/, 'rerenderAppGraph', 'Q')
      problems.push(...rerenderBody.problems)
      if (rerenderBody.body !== '') {
        if (!callsZoneTracks(rerenderBody.body)) {
          problems.push(
            '(q3) the track reader is BLIND: `rerenderAppGraph`\'s body calls `this.applyZoneTracks()` at this head, and the ' +
              'reader did not see it — every track tooth below would be vacuous',
          )
        }
        if (callsZoneTracks(rerenderBody.body.replace(/this\.\s*applyZoneTracks\s*\(\s*\)/g, ''))) {
          problems.push('(q3) the track reader cannot fail: a body with the `applyZoneTracks()` call DELETED still reads as calling it')
        }
      }
      // (ii) the paint's own body.
      const paintBody = bodyAt(SIDEBAR_FILE, /applyRevealPaint\s*\(\s*\)\s*:\s*void\s*\{/, 'applyRevealPaint', 'Q')
      problems.push(...paintBody.problems)
      if (paintBody.body !== '') {
        if (!callsZoneTracks(paintBody.body)) {
          problems.push(
            `(q3) \`applyRevealPaint\`'s body does NOT call \`this.applyZoneTracks()\` (body read: ` +
              `${paintBody.body.replace(/\s+/g, ' ').trim().slice(0, 400)}) — the TRACK half is the reveal's DROP PREVIEW ` +
              `(the inline \`--zone-<z>-track\` removal is what hands a revealed empty zone the stylesheet's size); a paint ` +
              `that drops it delivers the class without the affordance`,
          )
        }
        if (callsZoneTracks(paintBody.body.replace(/this\.\s*applyZoneTracks\s*\(\s*\)/g, ''))) {
          problems.push('(q3) the track tooth cannot fail: the paint body with the `applyZoneTracks()` call DELETED still reads as calling it')
        }
        // (iii) the carrier clause: the paint must not reach the SUPERSEDED `state-slice` carrier.
        const carriers = paintCarrierNames(paintBody.body)
        if (carriers.length > 0) {
          problems.push(
            `(q3) \`applyRevealPaint\`'s body names the FORBIDDEN carrier(s) [${carriers.join(', ')}] — §7 pins the landed shape: ` +
              `the class half writes the LIVE container's \`className\` and the track half calls \`applyZoneTracks()\`; the ` +
              `\`state-slice\`/\`applyCommand\` carrier was MEASURED to destroy the mount (\`RR-F1\`, L2 §10) and is NOT this unit's design`,
          )
        }
      }
      // (iv) the carrier clause's own falsifier, against a REAL body that names `applyCommand`.
      const mirrorsBody = bodyAt(SIDEBAR_FILE, /syncZoneMirrors\s*\([^)]*\)\s*:\s*void\s*\{/, 'syncZoneMirrors', 'Q')
      problems.push(...mirrorsBody.problems)
      if (mirrorsBody.body !== '') {
        if (paintCarrierNames(mirrorsBody.body).length === 0) {
          problems.push(
            '(q3) the carrier clause is BLIND: `syncZoneMirrors`\'s body writes through `runtime.applyCommand` at this head and ' +
              'the clause found no forbidden carrier — the paint\'s carrier tooth above would be vacuous',
          )
        }
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb Q — the load is gone from the reveal path (§3 limb Q, sub-arms q1…q3; §2 R-2's clause; INV-R). ` +
        `${problems.length} problem(s). The defect is a POINTER-CAPTURE lifetime, so the node arm proves the CAUSE's removal: ` +
        `zero \`loadEnvelope\` on the reveal path (q1, floored by the seed load), a handler body that reaches the paint and ` +
        `nothing that re-assembles (q2, with two mutated falsifiers), and a paint whose TWO halves are the track projection ` +
        `plus the live class (q3). ` +
        `envelope-class — a recording runtime double + SOURCE clauses over \`sidebar-panes.ts\`'s text; no pointer capture ` +
        `(G8-only)`,
    ).toEqual([])
  })

  it('T — the boundary clears: a placement-equal drop removes the token, a cancel is ONE pass, and N moves write only K tokens', () => {
    // §3 limb T, sub-arms t1/t2/t3. LAYER: the REAL `SidebarPanes` over the DOM double, its
    // `setLayout` calls and every `className` write counted; no pointer, no paint on a real DOM.
    // NON-VACUITY: (t1)'s zero `setLayout`s is the record law already graded by `U-3`'s `B`/(b2)
    // expanded pair, and its CLEAR is graded with a CONTROL asserting the destination carried
    // `is-revealed` BEFORE the drop (so "the clear removes it" has a token to remove); (t2)'s
    // "exactly one paint" is paired with the pre-cancel state and a resolution counter (a second
    // host-side paint would resolve the four zones again); (t3) prints BOTH counts so a per-MOVE
    // paint reds by arithmetic.
    // MUTATION THAT WOULD RED IT: leaving `commitPaneDrop`'s clear unpainted reds (t1); adding a
    // second host-side paint in `cancelPaneDrag` reds (t2); painting on every move rather than
    // every reveal-set CHANGE reds (t3) — and `commitPaneDrop`'s zero-write law reds (t1) if the
    // paint is allowed to become a record write.
    const problems: string[] = []

    const ONE = 'probe-t-one'
    const TWO = 'probe-t-two'
    const panes: PaneSpec[] = [
      { id: ONE, zone: 'right', defaultOrder: 0 },
      { id: TWO, zone: 'left', defaultOrder: 0 },
    ]

    // ---- (t1) A PLACEMENT-EQUAL DROP INTO AN EXPANDED ZONE ------------------------------------
    // ONE stands ALONE in `right` at place 0 and the zone STATES `collapsed: false`, so the drop
    // is a placement no-op into an EXPANDED zone: ZERO `setLayout`s, and the painted clear still
    // has to remove the reveal the drag put on the destination.
    const equalSeed = rawLayout(
      [
        { id: ONE, zone: 'right', index: 0 },
        { id: TWO, zone: 'left', index: 0 },
      ],
      { right: { collapsed: false }, left: { collapsed: false } },
    )
    const equal = seedHost(equalSeed, panes)
    try {
      equal.host.startPaneDrag(ONE)
      equal.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
      const beforeDrop = equal.dom.monitor.raw()
      const tokensBeforeDrop = equal.dom.monitor.tokens()
      if (!tokensBeforeDrop['right'].includes('is-revealed')) {
        problems.push(
          `(t1) the CONTROL failed: the destination \`zone:right\` did NOT carry \`is-revealed\` before the drop ` +
            `(className = ${shown(beforeDrop['right'])}) — "the clear removes it" would have no token to remove, so every ` +
            `arm below would pass on a paint that never ran`,
        )
      }
      equal.dom.monitor.reset()
      equal.host.commitPaneDrop({ paneId: ONE, zone: 'right' })
      if (equal.calls() !== 0) {
        problems.push(
          `(t1) a PLACEMENT-EQUAL drop into an EXPANDED zone wrote ${equal.calls()} \`setLayout\`(s), not ZERO — the record law ` +
            `is unchanged by this unit: the paint is a MIRROR write, never a record write`,
        )
      }
      const afterDrop = equal.dom.monitor.raw()
      const tokensAfterDrop = equal.dom.monitor.tokens()
      if (tokensAfterDrop['right'].includes('is-revealed')) {
        problems.push(
          `(t1) the drop left \`is-revealed\` on the destination (\`zone:right\` = ${shown(afterDrop['right'])}) — ` +
            `\`commitPaneDrop\`'s clear (\`this.revealedZones = []\`) must be PAINTED: the controller's own \`drop()\` clears its ` +
            `set SILENTLY (no \`onChange\`), and a placement-equal drop into an expanded zone returns before the only write ` +
            `site, so the class lingers until an unrelated re-render (the latent defect §2 R-3 closes)`,
        )
      }
      if (equal.dom.monitor.writesOf('right') === 0) {
        problems.push(
          `(t1) the painted clear wrote NOTHING on \`zone:right\` (className still ${shown(afterDrop['right'])}) — the clear is ` +
            `a real transition and must reach the live container`,
        )
      }
    } finally {
      equal.restore()
    }

    // ---- (t2) A CANCEL CLEARS THROUGH EXACTLY ONE PAINT PASS ----------------------------------
    const cancelSeed = rawLayout(
      [
        { id: TWO, zone: 'left', index: 0 },
        { id: ONE, zone: 'left', index: 1 },
      ],
      { left: { collapsed: false } },
    )
    const cancel = seedHost(cancelSeed, panes)
    try {
      cancel.host.startPaneDrag(ONE)
      // THE PASS COST, MEASURED ON THIS VERY HOST: the reveal transition IS one paint pass (the
      // controller writes `onChange` once), so its container-resolution count is exactly what a
      // SECOND pass would add again. Nothing about the landing's shape is assumed here.
      cancel.dom.monitor.reset()
      cancel.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
      const onePassResolutions = cancel.dom.monitor.resolutions()
      const beforeCancel = cancel.dom.monitor.raw()
      if (!cancel.dom.monitor.tokens()['right'].includes('is-revealed')) {
        problems.push(
          `(t2) the PRE-CANCEL state does not carry the reveal (className = ${shown(beforeCancel['right'])}) — the cancel has ` +
            `no token to remove, so "exactly one paint" would be graded on an empty transition`,
        )
      }
      const writesBeforeCancel = cancel.dom.monitor.writes()
      cancel.dom.monitor.reset()
      cancel.host.cancelPaneDrag()
      const writesDuringCancel = cancel.dom.monitor.writes()
      const resolutionsDuringCancel = cancel.dom.monitor.resolutions()
      const afterCancel = cancel.dom.monitor.raw()
      const tokensAfterCancel = cancel.dom.monitor.tokens()
      if (tokensAfterCancel['right'].includes('is-revealed')) {
        problems.push(
          `(t2) \`cancelPaneDrag()\` left \`is-revealed\` on \`zone:right\` (${shown(afterCancel['right'])}) — the controller's ` +
            `\`cancel()\` writes \`setRevealed([])\` → \`onChange\` → the paint; the clear must reach the live container`,
        )
      }
      if (resolutionsDuringCancel < 1) {
        problems.push(
          `(t2) the cancel resolved ZERO zone containers (${resolutionsDuringCancel} \`getElementById('zone:<z>')\` call(s)) — ` +
            `no paint pass ran through the controller's own \`onChange\` (${writesBeforeCancel} class write(s) were counted ` +
            `during the gesture's OWN transition, which resolved ${onePassResolutions} container(s))`,
        )
      } else if (onePassResolutions > 0 && resolutionsDuringCancel > onePassResolutions) {
        problems.push(
          `(t2) the cancel resolved ${resolutionsDuringCancel} zone container(s) against the ${onePassResolutions} ONE paint ` +
            `pass costs on this same host — a SECOND host-side paint inside \`cancelPaneDrag\` would resolve the containers ` +
            `again (§7: the controller's \`cancel()\` IS the paint's trigger; a second call there is the second pass)`,
        )
      }
      if (writesDuringCancel !== 1) {
        problems.push(
          `(t2) the cancel changed ${writesDuringCancel} zone class(es), not EXACTLY ONE — after a SINGLE-zone reveal the ` +
            `clear is one token on one zone, in one pass (resolutions during the cancel: ${resolutionsDuringCancel})`,
        )
      }
    } finally {
      cancel.restore()
    }

    // ---- (t3) N MOVES, K CROSSINGS: THE WRITES ARE THE CROSSINGS -----------------------------
    const sweepSeed = rawLayout([{ id: TWO, zone: 'left', index: 0 }], { left: { collapsed: false } })
    const sweep = seedHost(sweepSeed, panes)
    try {
      const MOVES: DragPoint[] = [
        POINT_ON.left,
        GAP_POINT,
        POINT_ON.right,
        GAP_POINT,
        POINT_ON.left,
        POINT_ON.left,
        GAP_POINT,
        POINT_ON.right,
        POINT_ON.right,
      ]
      sweep.host.startPaneDrag(TWO)
      sweep.dom.monitor.reset()
      const loadsBefore = sweep.runtime?.loads.length ?? 0
      let previous = [...sweep.host.revealZones()]
      const readings: string[] = []
      let crossings = 0
      for (const point of MOVES) {
        sweep.host.movePaneDrag(point, ZONE_BOUNDS)
        const current = [...sweep.host.revealZones()]
        const changed = fingerprint(current) !== fingerprint(previous)
        if (changed) crossings += 1
        readings.push(`${fingerprint(current)}${changed ? '*' : ''}`)
        previous = current
      }
      const writes = sweep.dom.monitor.writes()
      if (crossings < 3) {
        problems.push(
          `(t3) the sweep produced ${crossings} reveal-set crossing(s) over ${MOVES.length} move(s) (readings: ` +
            `${readings.join(' ')}; \`*\` marks a crossing) — with fewer than 3 the per-MOVE/per-CROSSING arithmetic below ` +
            `cannot discriminate`,
        )
      }
      if (writes !== crossings) {
        problems.push(
          `(t3) across ${MOVES.length} moves and ${crossings} distinct reveal-set crossing(s) the host made ${writes} zone-class ` +
            `write(s), not ${crossings} — the paint is a TRANSITION write (one token change per crossing), never a per-move ` +
            `one (§2 R-4; the controller writes \`onChange\` only on a SET change). Readings: ${readings.join(' ')} ` +
            `(= ${crossings} crossing(s)); loads during the sweep: ${(sweep.runtime?.loads.length ?? 0) - loadsBefore}`,
        )
      }
    } finally {
      sweep.restore()
    }

    expect(
      problems,
      `limb T — the boundary clears (§3 limb T, sub-arms t1…t3; §2 R-3's ONE rule; INV-R). ${problems.length} problem(s). ` +
        `EVERY assignment to \`revealedZones\` is followed by the paint (\`onRevealChange\`, and \`commitPaneDrop\`'s clear, ` +
        `which the controller does NOT signal); \`cancelPaneDrag\` adds NOTHING because the controller's \`cancel()\` writes ` +
        `through \`onChange\`; and the paint is a transition write, so the class-write count equals the CROSSING count. ` +
        `envelope-class — the REAL SidebarPanes over the layout-less DOM shim with every class write counted; no pointer ` +
        `capture, no computed style (G8-only)`,
    ).toEqual([])
  })

  it('D — the drop COMMITS on a record that holds no entry: one write with the entry back-filled, the no-op law intact, the `pane-drag.ts` seal unbroken', async () => {
    // §3 limb D, sub-arms d1…d5 (`L1` §2 `R-5`; `RR-F7`/`RR-F8`). LAYER: the REAL
    // `SidebarPanes.commitPaneDrop` over the DOM double, its `setLayout` calls counted; (d4) adds a
    // SOURCE clause over `pane-drag.ts` plus the pure module's own behaviour.
    // NON-VACUITY: (d1)'s exactly-once is paired with (d2)'s CONTROL on the same host shape with
    // the entry PRESENT writing exactly once (so a dead harness cannot satisfy it), and (d3)'s
    // ZERO is floored by d1's own one-write arm on the SAME absent seed and a DIFFERENT zone
    // (absence on its own derived placement is a NO-OP, not a dead path); (d4)'s seal clause is
    // paired with a MUTANT that moves the back-fill's source into the pure module and must read
    // `false`; (d5)'s three refusals are paired with d1's enabled-once control.
    // MUTATION THAT WOULD RED IT: `commitPaneDrop` reading `panePlacementOf` before back-filling
    // the family reds (d1); back-filling unconditionally (ignoring the enabled `app-graph` census)
    // reds (d5); teaching `panePlacementOf` to answer a derived placement (moving the law into
    // `pane-drag.ts`) reds (d4); making the back-filled placement differ from the derived one reds
    // (d3).
    const problems: string[] = []

    const ABSENT = 'probe-d-absent'
    const PRESENT = 'probe-d-present'
    const panes: PaneSpec[] = [{ id: ABSENT, zone: 'left', defaultOrder: 0 }]
    const presentPanes: PaneSpec[] = [{ id: PRESENT, zone: 'left', defaultOrder: 0 }]
    /** The record-less profile: `defaultLayout().panes` is `[]` and the main store seeds exactly
     *  that (`operator-settings-store.ts:122`), so this is what a FRESH profile holds. */
    const recordlessSeed = defaultLayout()

    // ---- (d1) THE ABSENT ENTRY, DROPPED ON A ZONE OTHER THAN ITS DERIVED ONE ------------------
    const absent = seedHost(recordlessSeed, panes)
    try {
      if (panesOf(absent.seed).length !== 0) {
        problems.push('(d1) the harness seed is not record-less — the arm has no subject')
      }
      absent.host.startPaneDrag(ABSENT)
      absent.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
      const dropped = absent.host.commitPaneDrop({ paneId: ABSENT, zone: 'right' })
      if (dropped == null) {
        problems.push(
          `(d1) the drop of \`${ABSENT}\` was REJECTED by the controller (commitPaneDrop answered null) — the back-fill arm ` +
            `never ran`,
        )
      }
      if (absent.calls() !== 1) {
        problems.push(
          `(d1) dropping "${ABSENT}" (absent from a record that holds NO entry) on \`right\` wrote ${absent.calls()} ` +
            `\`setLayout\`(s), not EXACTLY ONE — §2 R-5/\`RR-F7\`: \`panePlacementOf\` answers \`null\` for an absent entry, so ` +
            `\`commitPaneDrop\` returns BEFORE its only write site and NO drop of any kind can commit on a fresh profile. ` +
            `The family must be back-filled from the SAME derivation the pane-collapse toggle uses (\`deriveLayout\`) IN ` +
            `MEMORY, and the ONE write composes it`,
        )
      } else if (entryZoneOf(absent.writes[0], ABSENT) !== 'right') {
        problems.push(
          `(d1) the ONE write puts "${ABSENT}" in ${shown(entryZoneOf(absent.writes[0], ABSENT))}, not \`right\` ` +
            `(record: ${fingerprint(panesOf(absent.writes[0]!))}) — the back-filled entry must not swallow the relocation`,
        )
      }
    } finally {
      absent.restore()
    }

    // ---- (d2) CONTROL: THE SAME HOST WITH THE ENTRY PRESENT ----------------------------------
    const presentSeed = rawLayout([{ id: PRESENT, zone: 'left', index: 0 }])
    const present = seedHost(presentSeed, presentPanes)
    try {
      present.host.startPaneDrag(PRESENT)
      present.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
      present.host.commitPaneDrop({ paneId: PRESENT, zone: 'right' })
      if (present.calls() !== 1) {
        problems.push(
          `(d2) CONTROL: dropping "${PRESENT}" (an entry the record HOLDS) on \`right\` wrote ${present.calls()} ` +
            `\`setLayout\`(s), not exactly 1 — the back-fill must not change the NORMAL path's write count, and without this ` +
            `arm (d1)'s "exactly once" could be satisfied by a harness whose counter never moves`,
        )
      } else if (entryZoneOf(present.writes[0], PRESENT) !== 'right') {
        problems.push(
          `(d2) CONTROL: the normal path's write puts "${PRESENT}" in ${shown(entryZoneOf(present.writes[0], PRESENT))}, not \`right\``,
        )
      }
    } finally {
      present.restore()
    }

    // ---- (d3) THE NO-OP LAW SURVIVES THE BACK-FILL -------------------------------------------
    const own = seedHost(recordlessSeed, panes)
    try {
      own.host.startPaneDrag(ABSENT)
      own.host.movePaneDrag(POINT_ON.left, ZONE_BOUNDS)
      own.host.commitPaneDrop({ paneId: ABSENT, zone: 'left' })
      if (own.calls() !== 0) {
        problems.push(
          `(d3) an ABSENT entry dropped on its OWN DERIVED placement (\`left\`, place 0) wrote ${own.calls()} \`setLayout\`(s), ` +
            `not ZERO — absence IS that placement (\`ASM-U3-2\`), so the back-fill must make the drop a NO-OP and the record ` +
            `must keep holding NO entry (writes read: ${fingerprint(own.writes)})`,
        )
      }
      if (own.writes.length !== 0) {
        problems.push(`(d3) the no-op arm still wrote ${own.writes.length} record(s) — the record stays without the entry`)
      }
    } finally {
      own.restore()
    }
    // (d3)'s FLOOR — the SAME absent seed on a DIFFERENT zone DOES write (d1's arm, re-measured
    // here so the zero above cannot be a dead path).
    const floor = seedHost(recordlessSeed, panes)
    try {
      floor.host.startPaneDrag(ABSENT)
      floor.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
      floor.host.commitPaneDrop({ paneId: ABSENT, zone: 'right' })
      if (floor.calls() !== 1) {
        problems.push(
          `(d3) FLOOR: the same record-less host dropping the same pane on \`right\` wrote ${floor.calls()} \`setLayout\`(s), not ` +
            `exactly 1 — without it the ZERO above is satisfied by a path that never writes for any zone`,
        )
      }
    } finally {
      floor.restore()
    }

    // ---- (d4) THE `pane-drag.ts` SEAL --------------------------------------------------------
    // behaviour: the pure module still answers "nothing" for an absent placement.
    const tinyRecord = rawLayout([{ id: 'probe-d-seal', zone: 'left', index: 0 }])
    if (panePlacementOf(tinyRecord, 'probe-d-absent-id') !== null) {
      problems.push(
        `(d4) \`panePlacementOf\` answered ${fingerprint(panePlacementOf(tinyRecord, 'probe-d-absent-id'))} for an id the record ` +
          `does not hold, not \`null\` — the seal: the pure module reports ABSENCE, and the back-fill lives in the ACT`,
      )
    }
    if (panePlacementOf(null, 'probe-d-seal') !== null) {
      problems.push('(d4) `panePlacementOf(null, …)` answered a placement, not `null` — the module is TOTAL and never invents one')
    }
    const moveNoop = movePane(tinyRecord, 'probe-d-absent-id', 'right', 0)
    if (fingerprint(panesOf(coerceLayout(moveNoop))) !== fingerprint(panesOf(coerceLayout(tinyRecord)))) {
      problems.push(
        `(d4) \`movePane\` MUTATED the record for an id it does not hold (${fingerprint(panesOf(coerceLayout(moveNoop)))}) — ` +
          `an id absent from the record is a NO-OP there, and that arm stays (\`R-5\`)`,
      )
    }
    // SOURCE: the back-fill's source (`deriveLayout` — the H1 precedent) is NOT reachable from the
    // pure module. A landing that moved the law into `pane-drag.ts` would have to name it.
    const pureModule = readText(PANE_DRAG_FILE)
    const backfillTokens = namesAny(pureModule, ['deriveLayout', 'listByScope'])
    if (backfillTokens.length > 0) {
      problems.push(
        `(d4) ${PANE_DRAG_FILE} names [${backfillTokens.join(', ')}] — the record back-fill belongs to the ACT ` +
          `(\`commitPaneDrop\` in \`${SIDEBAR_FILE}\`); putting it in the pure module moves a law that has ONE home`,
      )
    } else {
      // the clause's own falsifier: the SAME reading over a copy that moved the back-fill in.
      const moved = `${pureModule}\nconst probeMoved = deriveLayout(specs)\n`
      if (namesAny(moved, ['deriveLayout', 'listByScope']).length === 0) {
        problems.push('(d4) the seal clause cannot fail: a copy of the module with `deriveLayout` spliced in still reads as sealed')
      }
    }

    // ---- (d5) NOT AN ENABLED `app-graph` PANE ⇒ NO BACK-FILL ----------------------------------
    const disabledPane = 'probe-d-disabled'
    const operatorPane = 'probe-d-operator'
    const mixedPanes: PaneSpec[] = [
      { id: disabledPane, zone: 'left', defaultOrder: 0, enabled: false },
      { id: operatorPane, zone: 'left', defaultOrder: 1, scope: 'operator' },
    ]
    const mixed = seedHost(recordlessSeed, mixedPanes)
    try {
      // (i) a REGISTERED but DISABLED app-graph pane: the controller accepts the drop, the act must
      // refuse to invent an entry for it.
      mixed.host.startPaneDrag(disabledPane)
      mixed.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
      const disabledDrop = mixed.host.commitPaneDrop({ paneId: disabledPane, zone: 'right' })
      if (disabledDrop == null) {
        problems.push(
          '(d5) the DISABLED pane’s drop was refused by the controller — the arm would be graded on the controller’s ' +
            'legality gate instead of the back-fill',
        )
      }
      if (mixed.calls() !== 0) {
        problems.push(
          `(d5) a DISABLED app-graph pane absent from the record wrote ${mixed.calls()} \`setLayout\`(s), not ZERO — the ` +
            `back-fill must read the SAME enabled census the assembler does (\`listByScope('app-graph').filter(isEnabled)\`), ` +
            `so a pane the operator disabled never materialises a record entry`,
        )
      }
      // (ii) an OPERATOR-scope pane: illegal in every app-graph zone, so the controller refuses it.
      mixed.host.startPaneDrag(operatorPane)
      mixed.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
      const operatorDrop = mixed.host.commitPaneDrop({ paneId: operatorPane, zone: 'right' })
      if (operatorDrop !== null) {
        problems.push('(d5) an OPERATOR-scope pane’s drop was ACCEPTED — an operator pane never targets an app-graph zone')
      }
      if (mixed.calls() !== 0) {
        problems.push(`(d5) the operator-scope arm wrote ${mixed.calls()} \`setLayout\`(s), not ZERO`)
      }
      // (iii) an id the registry has never heard of.
      mixed.host.startPaneDrag('probe-d-ghost')
      mixed.host.movePaneDrag(POINT_ON.right, ZONE_BOUNDS)
      const ghostDrop = mixed.host.commitPaneDrop({ paneId: 'probe-d-ghost', zone: 'right' })
      if (ghostDrop !== null) {
        problems.push('(d5) an UNKNOWN pane id’s drop was ACCEPTED — an unknown id has no scope and no legal zone')
      }
      if (mixed.calls() !== 0) {
        problems.push(
          `(d5) the unknown-id arm wrote ${mixed.calls()} \`setLayout\`(s), not ZERO — the back-fill must answer \`null\` for an ` +
            `id it cannot derive a placement for, never invent one`,
        )
      }
    } finally {
      mixed.restore()
    }

    expect(
      problems,
      `limb D — the drop commits on a record that holds no entry (§3 limb D, sub-arms d1…d5; §2 R-5; RR-F7/RR-F8). ` +
        `${problems.length} problem(s). \`defaultLayout().panes\` is \`[]\` and the main store seeds exactly that, so on a FRESH ` +
        `profile \`panePlacementOf\` answers \`null\` and \`commitPaneDrop\` returns before its only write site — NO drop of any ` +
        `kind can commit. R-5 back-fills the family IN MEMORY from the same derivation the pane-collapse toggle uses and ` +
        `keeps the no-op law (absence on its own derived placement writes nothing); \`pane-drag.ts\` does NOT move. ` +
        `envelope-class — the REAL host's write counter + the pure module + a SOURCE clause; no paint, no pointer`,
    ).toEqual([])
  })
})
