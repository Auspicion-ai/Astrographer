// tests/integration/shell-chrome/pane-move-target.test.ts — unit `U-3` `pane-move`'s OWN ROW,
// authored BEFORE any byte of the placement law / the ONE family write / the scoped projection /
// the discriminating admission / the inherited form moves (RCA-1) and RUN at the pre-edit head.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-u-3-pane-move.md` §3 (the red set) — the EIGHT limbs
// `A`…`H`, each sub-arm letter cited in its comment AND in its problem strings — and NOTHING ELSE.
// §2 is the change set (`C-1`…`C-6`) these limbs pin; §6 is the assumption set they read
// (`ASM-U3-1` the "declared figure" is graded as "declared form + no geometry write",
// `ASM-U3-2` `index` optional, `ASM-U3-3` the projection scoped by AUTHORED discriminants,
// `ASM-U3-4` the degenerate refusal made ONE-AXIS-aware, `ASM-U3-5` the form by position with the
// stage provider at the root, `ASM-U3-6` the zone-first chain composed into the ONE `setLayout`).
//
// THE EIGHT LIMBS, ONE `it` EACH, ONE AGGREGATE `expect(problems, …)` EACH:
//   A — the placement law (`a1` absence survives coercion · `a2` the assembler orders by stated
//       place, ties at the DECLARED place, and an absent entry sorts at its declared place — the
//       falsifier drives the SAME family in TWO array orders and demands the SAME sequence ·
//       `a3` a junk `index` is ABSENT, never the reading's position).
//   B — the act's comparison and its chain (`b1` a drop equal to the record's effective placement
//       writes ZERO `setLayout`s · `b2` the same drop into a COLLAPSED zone writes exactly ONE
//       stating `collapsed: false` while the panes family is byte-identical · `b3` an absent-index
//       family's self-drop is a no-op).
//   C — the whole-family write (`c1` one gesture = ONE `setLayout` · `c2` the moved pane's `zone`
//       plus EVERY affected pane's recomputed `index` `0…n-1`, every other member byte-identical ·
//       `c3` a family whose array order contradicts its declared places and states no indexes: a
//       move to place 1 leaves DECLARED order with the moved pane at place 1).
//   D — the projection (`d1` the `.pane-drop` exclusion exists AND the `data-orientation`
//       discriminant is REQUIRED — a source clause over `renderer.ts`'s projection text, with
//       MUTATED copies as its own falsifier · `d2` the four REAL assembled containers are admitted
//       by that discriminant while the phantoms are refused · `d3` the `.gutter` exclusion survives).
//   E — the admission (`e1` a box degenerate on ONE axis is ADMITTED · `e2` one degenerate on BOTH
//       is REFUSED — the anti-vacuity pair · `e3` the four `zoneTrackVars` arms are unmoved).
//   F — the form by POSITION, rendered through the engine (`f1` each frame of the REAL assembled
//       envelope renders `pane-in-<its zone>` and KEEPS its authored `pane-frame`/`is-collapsed` ·
//       `f2` after `movePane` + reassembly the frame renders `pane-in-<dest>` and `pane-in-<source>`
//       reaches nothing · `f3` the stage arm: a consumer under the root with no nearer provider
//       inherits `pane-in-stage`, and a zone-resident pane never carries it).
//   G — the figure is the record's (`g1` the written entry differs from the record's in `zone`/
//       `index` alone · `g2` a census: `PaneLayoutEntry` carries no figure member and no `setLayout`
//       in the drag path receives a size).
//   H — crossing N times (`h1` crossing the four zones N times and committing at `Z` yields the
//       SAME whole-layout record as crossing to `Z` once · `h2` ONE `setLayout` across the whole
//       gesture · `h3` the committed envelope carries no residue `is-revealed`).
//
// LAYER (MANDATORY, D-10 / `RCA-12`): every limb is ENVELOPE-class. `A`/`D`/`F`/`G`/`H` drive the
// fork's REAL assembler (`assembleAppGraphEnvelope`) over a REAL `PaneRegistry`; `B`/`C`/`G`/`H`
// drive the REAL `SidebarPanes` over the layout-less DOM shim and COUNT its `setLayout` writes;
// `E` is a pure function; `D`/`G`(g2) are SOURCE clauses over a file's TEXT and say so. Limb `F`
// renders HTML THROUGH THE ENGINE and reads CLASS STRINGS out of that HTML — that is ENVELOPE-class
// (the engine's emit/resolve behaviour), never a paint, a grid a window or a pointer. What this file
// CANNOT supply, named so nobody quotes it: the drag gesture itself, the reveal of an EMPTY zone on
// the assembled app, the inherited class arriving through `applyDerived` on a live DOM, the drop's
// committed box — all `G8`-only (§4). NO limb asserts a rendered GEOMETRY, a computed STYLE, a
// pointer gesture or a PAINTED class on the assembled app.
//
// NON-VACUITY (mandatory, stated per limb in its own comment): every negative assertion carries a
// positive control beside it, and each limb's comment names WHICH MUTATION WOULD RED IT.
//
// REACHABILITY RULE (the file always COLLECTS and RUNS): every symbol this unit would ADD —
// `pane-drag.ts`'s new effective-placement export, `movePane`'s 5th parameter, any renamed helper —
// is reached through `await import(…)` inside the limb and read with a TYPE check (`readExport`), so
// a missing export is a NAMED problem inside that limb's aggregate `expect(problems, …)` — never an
// ESM link error, never a crash, never a skipped arm. §2 `C-2` does NOT name the new export (it is
// described as "the effective placement of a pane — `(zone, place)`"), so this row asserts NO symbol
// NAME for it and grades it BEHAVIOURALLY (limb `B`'s comparison word and limb `C`'s sort law),
// which is the only reading §3 licenses.
//
// SHAPE ADJUSTMENT (declared, limb `F` only — MEASURED, not guessed): the `E-1` harness's
// `renderEnvelope` (translate → Supervisor → compile → `renderProducingProcess` → `SSRFragmentAdapter`)
// renders the TEMPLATE TREE only; a frame mounted through a content payload's `targetPlacement` is
// ABSENT from that fragment (measured at this head: the assembled envelope's four containers render
// empty through it). The frames `f1`/`f2` grade therefore go through `renderAssembled`, the HOST's
// payload resolution (`Runtime.loadEnvelope` + `renderedHtmlResult`) — the same engine, one layer up,
// still node-only and still class-strings-out-of-HTML. `f3`'s stage arm uses `renderEnvelope`
// (§2 `C-4`'s provider sits on the ROOT, so the template tree IS the arm's subject).
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`; it writes
// nothing and reads only the repo it lives in. Every path derives from THIS FILE's own location
// (`ROOT`), so a missing substrate FAILS (ENOENT) instead of skipping, and every census carries a
// non-vacuity floor so no negative limb can pass by being blind.
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  translateLegacy,
  Supervisor,
  EventBridge,
  SSRFragmentAdapter,
  renderProducingProcess,
} from 'provident-ssr'

import { installShim, mountEl, ShimElement } from '../../../src/shared/dom-shim.js'
import { assembleAppGraphEnvelope } from '../../../src/renderer/pane-graph.js'
import { createPaneRegistry } from '../../../src/renderer/pane-registry.js'
import {
  coerceLayout,
  defaultLayout,
  zoneTrackVars,
  type LayoutState,
  type LayoutZoneName,
} from '../../../src/renderer/layout-state.js'
import {
  movePane,
  dropZoneForPoint,
  zoneOrientation,
  type ZoneBounds,
  type DragPoint,
} from '../../../src/renderer/pane-drag.js'
import { SidebarPanes } from '../../../src/renderer/sidebar-panes.js'
import { Runtime } from '../../../src/renderer/runtime.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

const RENDERER_FILE = 'src/renderer/renderer.ts'
const LAYOUT_STATE_FILE = 'src/renderer/layout-state.ts'
const SIDEBAR_FILE = 'src/renderer/sidebar-panes.ts'

const CLOSED_ZONES = ['left', 'right', 'top', 'bottom'] as const
type Zone = (typeof CLOSED_ZONES)[number]

const fingerprint = (value: unknown): string => JSON.stringify(value)

/** A declared place for one pane, as a failure message prints it. */
const shown = (value: unknown): string => (value === undefined ? '(absent)' : JSON.stringify(value))

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
// THE ASSEMBLED-ENVELOPE DRIVE (`A`, `D`, `F`, `G`, `H`) — the fork's REAL
// `assembleAppGraphEnvelope` over a minimal traversal envelope, a real `PaneRegistry` and a
// synthesized context (the SAME call shape the two neighbouring rows use; no second harness).
// ---------------------------------------------------------------------------
interface AssembledNode {
  type?: unknown
  props?: Record<string, unknown>
  css?: { classes?: unknown; style?: unknown }
  content?: unknown
  children?: unknown[]
  placement?: { placementName?: unknown; targetPlacement?: unknown }
}

interface PaneSpec {
  id: string
  zone: Zone
  title?: string
  collapsed?: boolean
  /** The pane's DECLARED place (`PaneDefinition.defaultOrder`) — §2 `C-1`'s first disjunct. */
  defaultOrder?: number
}

interface Assembly {
  envelope: unknown
  frames: AssembledNode[]
  layout: LayoutState
  registry: ReturnType<typeof createPaneRegistry>
}

/** The STAGE-probe consumer limb `F`'s (f3) authors on the template root — a node standing under the
 *  root with NO nearer provider, exactly the arm §2 `C-4`'s rooth-authored stage provider exists for. */
const STAGE_PROBE_ID = 'stage-probe'

function assemble(input: { panes?: PaneSpec[]; layout?: LayoutState; stageProbe?: boolean }): Assembly {
  const specs = input.panes ?? []
  const registry = createPaneRegistry()
  for (const pane of specs) {
    registry.register({
      id: pane.id,
      title: pane.title ?? pane.id,
      scope: 'app-graph',
      defaultZone: pane.zone,
      ...(typeof pane.defaultOrder === 'number' ? { defaultOrder: pane.defaultOrder } : {}),
      render: () => ({ type: 'div', props: { id: `${pane.id}-render-root` }, content: 'body' }),
    })
    registry.enable(pane.id)
  }
  const declared = input.layout
  const layout: LayoutState =
    declared ??
    rawLayout(
      specs.map((pane, index) => ({
        id: pane.id,
        zone: pane.zone,
        index,
        collapsed: pane.collapsed === true,
      })),
    )
  const rootChildren: unknown[] = []
  if (input.stageProbe === true) {
    rootChildren.push({
      type: 'div',
      props: { id: STAGE_PROBE_ID },
      // the CONSUMER half of `zone-format` — §2 `C-4`'s `target: 'css.classes'`
      component: { reference: 'zone-format', target: 'css.classes' },
      content: 'STAGE-MARKER',
    })
  }
  const traversalEnvelope = {
    template: { root: { type: 'div', props: { id: 'wiki-root' }, children: rootChildren } },
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

const classesOf = (node: AssembledNode | undefined): string[] => {
  const classes = node?.css?.classes
  return Array.isArray(classes) ? classes.map(String) : []
}

const childrenOf = (node: AssembledNode | undefined): AssembledNode[] =>
  Array.isArray(node?.children) ? (node.children as AssembledNode[]) : []

/** The payload roots of the assembled envelope, in payload order. */
const payloadRoots = (envelope: unknown): AssembledNode[] => {
  const payloads = (envelope as { content?: unknown } | null | undefined)?.content
  if (!Array.isArray(payloads)) return []
  const out: AssembledNode[] = []
  for (const payload of payloads as Array<{ content?: unknown } | null | undefined>) {
    if (!Array.isArray(payload?.content)) continue
    for (const node of payload!.content as AssembledNode[]) out.push(node)
  }
  return out
}

/** The zone the assembler placed a frame into — the frame root's OWN `placement.targetPlacement`
 *  (`paneSubtreeRoot` authors it; the payload grouping is the same fact, read once here). */
const frameZoneOf = (frame: AssembledNode | undefined): string => {
  const placement = frame?.placement?.targetPlacement
  return Array.isArray(placement) && typeof placement[0] === 'string' ? (placement[0] as string) : ''
}

/** Every authored pane FRAME in the envelope, in payload order: payload roots carrying the pane's
 *  own `data-pane-id` AND the `.pane-frame` class (the collapse control carries the same
 *  `data-pane-id` and is NOT a frame). */
function paneFrames(envelope: unknown): AssembledNode[] {
  return payloadRoots(envelope).filter(
    (node) => propText(node, 'data-pane-id') !== '' && classesOf(node).includes('pane-frame'),
  )
}

/** The ORDER the assembler emitted the frames in — the observable §3 `A`/(a2) and `C`/(c3) grade. */
const paneOrder = (assembly: Assembly): string[] => assembly.frames.map((frame) => propText(frame, 'data-pane-id'))

/** Every node of the assembled envelope (template root tree + every content payload), depth-first. */
function walkEnvelope(envelope: unknown): AssembledNode[] {
  const out: AssembledNode[] = []
  const visit = (node: unknown): void => {
    if (node == null || typeof node !== 'object') return
    const typed = node as AssembledNode
    out.push(typed)
    for (const child of childrenOf(typed)) visit(child)
  }
  visit((envelope as { template?: { root?: unknown } } | null | undefined)?.template?.root)
  for (const root of payloadRoots(envelope)) visit(root)
  return out
}

/** The four authored zone CONTAINERS of the assembled template root (`placement.placementName` is
 *  the engine's anchor; `props.id === 'zone:<name>'` is the repair form the assembler also writes). */
function zoneContainers(envelope: unknown): Map<string, AssembledNode> {
  const root = (envelope as { template?: { root?: AssembledNode } } | null | undefined)?.template?.root
  const out = new Map<string, AssembledNode>()
  for (const child of childrenOf(root)) {
    const placement = typeof child.placement?.placementName === 'string' ? child.placement.placementName : ''
    const id = propIdOf(child)
    for (const zone of CLOSED_ZONES) {
      if (placement === zone || id === `zone:${zone}`) {
        if (!out.has(zone)) out.set(zone, child)
      }
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// THE RAW LAYOUT BUILDER — ABSENCE-PRESERVING ON PURPOSE: a pane with no stated `index` is written
// with NO `index` KEY AT ALL, so §3 `A`/(a1)·(a3) and `B`/(b3) grade the boundary this unit moves
// instead of a shape the row itself normalised away.
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

// ---------------------------------------------------------------------------
// THE REAL HOST SEAM DRIVE (`B`, `C`, `G`, `H`) — the REAL `SidebarPanes` over the DOM double, its
// REAL private bridge installer reached through the exposed `window.provident.sidebar` holder (the
// `pane-head-target.test.ts` / `unit-live11-bridge-seams.test.ts` pattern). NOTHING is mocked: the
// write counter wraps the host's OWN `setLayout`, and the persist sink is the
// `bridge.operatorSettings.set` seam.
// ---------------------------------------------------------------------------
interface HostDrive {
  host: SidebarPanes
  /** every layout the host committed through `bridge.operatorSettings.set`, in order */
  writes: LayoutState[]
  /** every `setLayout` CALL, wrapped (a call is the write; a no-op is ZERO calls) */
  calls: () => number
  restore: () => void
}

function seedHost(seed: LayoutState, panes: readonly PaneSpec[]): HostDrive {
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
      ...(typeof pane.defaultOrder === 'number' ? { defaultOrder: pane.defaultOrder } : {}),
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
    // the drag path's re-derive guard: no dirty edit, and NO runtime (so no re-assemble is attempted)
    editController: { anyDirty: () => false },
  } as never)
  globals['window'] = { provident: {} }
  ;(host as unknown as { installSidebarBridge(): void }).installSidebarBridge()
  // The seed write is NOT a gesture: it happens BEFORE the counter is installed.
  host.setLayout(seed)
  writes.length = 0
  let calls = 0
  const realSetLayout = host.setLayout.bind(host)
  ;(host as unknown as Record<string, unknown>)['setLayout'] = (layout: LayoutState): void => {
    calls += 1
    realSetLayout(layout)
  }
  return {
    host,
    writes,
    calls: () => calls,
    restore: () => {
      globals['window'] = previousWindow
    },
  }
}

// ---------------------------------------------------------------------------
// THE ZONE GEOMETRY THE GESTURE CROSSES (`C`/(c1), `H`) — four NON-degenerate boxes in one
// coordinate space, separated by more than `SidebarPanes`' 24px snap threshold, so "which zone is
// the pointer on" is decidable and a crossing is a real crossing.
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
/** The FINAL drop point: inside `bottom`'s far edge (so the derived insertion index is its last
 *  band) and more than the snap threshold away from every other box. */
const DROP_POINT: DragPoint = { x: 500, y: 620 }

// ---------------------------------------------------------------------------
// THE ENGINE RENDER HARNESS (`F`) — the `E-1` row's `renderEnvelope` in its exact SHAPE
// (`deps-adopt-engine-provider.test.ts:75-90`), plus the host-resolution render the payload-mounted
// frames need (see the SHAPE ADJUSTMENT paragraph in this file's header).
// ---------------------------------------------------------------------------
function renderEnvelope(templateRoot: Record<string, unknown>, content: readonly unknown[] = []): string {
  const t = translateLegacy({
    template: { root: templateRoot },
    content: content as never,
    clientConfig: { runInstantiation: true, runRendering: true },
  })
  const sup = new Supervisor({ events: new EventBridge() })
  for (const n of t.nodes) sup.registerNode(n)
  const cr = t.root.compile(t.nodes)
  sup.recordResolved(cr.actionable)
  const nodeById = new Map(t.nodes.map((n) => [n.id, n]))
  const adapter = new SSRFragmentAdapter()
  renderProducingProcess(cr.actionable as never, nodeById as never, adapter, null, undefined)
  return adapter.toString()
}

/** The REAL assembled envelope rendered through the HOST's payload resolution — node-only, still an
 *  engine render (no browser, no cascade, no layout): the class strings are the ENGINE's. */
function renderAssembled(envelope: unknown): string {
  const runtime = new Runtime({ mount: mountEl() as never, envelope: envelope as never })
  runtime.loadEnvelope(envelope as never)
  return runtime.renderedHtmlResult().renderedHtml
}

/** The FULL TAG of the element carrying `id="<id>"` — expanding left to `<` and right to `>`, so a
 *  `class` attribute authored on either side of the id is still read. */
function tagOf(html: string, id: string): string | null {
  const needle = `id="${id}"`
  const at = html.indexOf(needle)
  if (at < 0) return null
  const open = html.lastIndexOf('<', at)
  const close = html.indexOf('>', at)
  if (open < 0 || close < 0) return null
  return html.slice(open + 1, close)
}

function classesOfTag(tag: string | null): string[] {
  if (tag === null) return []
  const match = /\bclass="([^"]*)"/.exec(tag)
  return match === null ? [] : match[1]!.split(/\s+/).filter(Boolean)
}

// ---------------------------------------------------------------------------
// THE SOURCE READERS (`D`, `G`/(g2)) — a region slice over a file's TEXT and a member census over an
// `interface` body. Nothing here resolves anything: every assertion below is about what the FILE
// SAYS, never about what a browser would do with it.
// ---------------------------------------------------------------------------
const stripComments = (src: string): string => src.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))

interface Region {
  text: string
  problems: string[]
}

/** `renderer.ts`'s projection — from the `onPaneSessionMove` function head to the next function's. */
function projectionRegion(): Region {
  const text = readText(RENDERER_FILE)
  const start = text.indexOf('function onPaneSessionMove')
  const end = text.indexOf('function onPaneSessionEnd')
  if (start < 0 || end <= start) {
    return {
      text: '',
      problems: [
        `(d0) ${RENDERER_FILE} carries no readable \`onPaneSessionMove\`…\`onPaneSessionEnd\` region ` +
          `(found at ${start} / ${end}) — the projection §2 C-3 scopes has no subject, so (d1)/(d3) cannot be read`,
      ],
    }
  }
  return { text: text.slice(start, end), problems: [] }
}

interface ProjectionRead {
  dropSkip: boolean
  orientationAttribute: boolean
  orientationFromZone: boolean
  gutterSkip: boolean
}

/** What the projection text SAYS about its candidate set (§2 `C-3`, §3 `D`/(d1)/(d3)). */
function readProjection(text: string): ProjectionRead {
  return {
    dropSkip: /['"]pane-drop['"]/.test(text),
    orientationAttribute: /['"]data-orientation['"]/.test(text),
    orientationFromZone: /\bzoneOrientation\s*\(/.test(text),
    gutterSkip: /['"]gutter['"]/.test(text),
  }
}

/** The member names of one `interface <name> { … }` body — comments dropped, declaration order kept. */
function interfaceMembers(text: string, name: string): string[] | null {
  const match = new RegExp(`interface\\s+${name}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(text)
  if (match === null) return null
  const members: string[] = []
  for (const line of match[1]!.split('\n')) {
    const code = line.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim()
    if (code === '') continue
    const member = /^(?:readonly\s+)?([A-Za-z_$][\w$]*)\??\s*:/.exec(code)
    if (member !== null) members.push(member[1]!)
  }
  return members
}

/** The drag path's CODE — `startPaneDrag` … `commitPaneDrop` …, comments stripped, so a stray
 *  `setZoneSize` in prose is not a write (§3 `G`/(g2)). */
function dragPathCode(): Region {
  const text = readText(SIDEBAR_FILE)
  const start = text.indexOf('startPaneDrag(paneId')
  const end = text.indexOf('startGutter(')
  if (start < 0 || end <= start) {
    return {
      text: '',
      problems: [
        `(g2) ${SIDEBAR_FILE} carries no readable drag-path region \`startPaneDrag\`…\`startGutter\` ` +
          `(found at ${start} / ${end}) — the census has no subject`,
      ],
    }
  }
  return { text: stripComments(text.slice(start, end)), problems: [] }
}

/** The geometry member names a pane record must NOT carry (`ASM-U3-1`, §2 `C-5`). */
const FIGURE_MEMBERS = /^(width|height|size|bounds|rect|figure|extent|geometry)$/i

// ---------------------------------------------------------------------------
// LIMBS
// ---------------------------------------------------------------------------
describe('U-3 pane move — the placement law, the ONE family write, the scoped projection, the admission, the inherited form, the record figure, crossing N times', () => {
  it('A — the placement law: an absent `index` survives coercion, the assembler orders by DECLARED place (ties included), and a junk index is absent', () => {
    // §3 limb A, sub-arms a1/a2/a3. LAYER: envelope — `coerceLayout` is pure; the assembler drive is
    // the fork's REAL `assembleAppGraphEnvelope` over a real `PaneRegistry`.
    // NON-VACUITY: (a1)'s absence tooth is paired with (a1)'s STATED-finite round-trip control;
    // (a3)'s three junk arms are paired with the same stated control; (a2)'s two-array-order
    // falsifier is its own positive/negative pair (a family whose array order is shuffled must
    // produce ONE sequence) and (a2)'s tie arm is paired with the seq-order answer it must NOT give.
    // MUTATION THAT WOULD RED IT: restoring `: index` (the reading's array position) at
    // `layout-state.ts:251`, or reverting the sort to `a.seq - b.seq` for ties, reds `A` by name.
    const problems: string[] = []

    // ---- (a1) THE ABSENCE AT THE COERCION BOUNDARY -------------------------------------------
    const absentSeed = { version: 1, panes: [{ id: 'probe-a1-absent', zone: 'left', collapsed: false }] }
    const absentCoerced = coerceLayout(absentSeed)
    const absentEntry = panesOf(absentCoerced)[0] as unknown as Record<string, unknown> | undefined
    if (absentEntry === undefined) {
      problems.push('(a1) coerceLayout dropped the ONE pane entry of the absence seed — the boundary has no subject')
    } else if (absentEntry['index'] !== undefined) {
      problems.push(
        `(a1) coerceLayout SUBSTITUTED \`index\` = ${shown(absentEntry['index'])} for an ABSENT member — §2 C-1/` +
          `ASM-U3-2 make absence STORABLE and forbid the reading's array position (D-262's defect), so the ` +
          `absence is erased before any reader can sort by the declared place`,
      )
    }

    // the POSITIVE CONTROL for (a1)/(a3): a STATED finite index round-trips untouched
    const statedSeed = { version: 1, panes: [{ id: 'probe-a1-stated', zone: 'left', index: 3, collapsed: false }] }
    const statedEntry = panesOf(coerceLayout(statedSeed))[0]
    if (statedEntry === undefined || (statedEntry as unknown as Record<string, unknown>)['index'] !== 3) {
      problems.push(
        `(a1) a STATED finite \`index\` (3) did not round-trip: read ${shown((statedEntry as unknown as Record<string, unknown> | undefined)?.['index'])} ` +
          `— the control that proves the absence tooth above is not satisfied by a coercion that drops every index`,
      )
    }

    // ---- (a3) A JUNK INDEX IS ABSENT, NEVER THE READING'S POSITION ----------------------------
    const junkArms: Array<[string, unknown]> = [
      ["the string 'x'", 'x'],
      ['NaN', Number.NaN],
      ['-Infinity', Number.NEGATIVE_INFINITY],
    ]
    for (const [label, junk] of junkArms) {
      // the junk pane sits at array position 1 of two, so "the reading's position" is a DISTINGUISHABLE
      // answer (1) from absence and from the other pane's place
      const seed = {
        version: 1,
        panes: [
          { id: 'probe-a3-first', zone: 'left', index: 0, collapsed: false },
          { id: 'probe-a3-junk', zone: 'left', index: junk, collapsed: false },
        ],
      }
      const coerced = panesOf(coerceLayout(seed))
      const entry = coerced[1] as unknown as Record<string, unknown> | undefined
      if (entry === undefined || coerced.length !== 2) {
        problems.push(`(a3) the junk-index seed (${label}) did not survive coercion as TWO entries (read ${coerced.length})`)
        continue
      }
      if (entry['index'] !== undefined) {
        problems.push(
          `(a3) a junk \`index\` (${label}) was replaced by ${shown(entry['index'])} — §2 C-1 keeps it only when it is a ` +
            `FINITE NUMBER and otherwise leaves it ABSENT; ${JSON.stringify(entry['index'])} === the reading's array position ` +
            `(1) is exactly the D-262 defect`,
        )
      }
    }

    // ---- (a2) THE ASSEMBLER'S ORDER ----------------------------------------------------------
    // The family: three panes, DECLARED places 2 / 0 / 1 in registration order 0 / 1 / 2 — so the
    // declared sequence (y, z, x) coincides with NEITHER the array order NOR the registration order.
    const family: PaneSpec[] = [
      { id: 'probe-a2-x', zone: 'left', defaultOrder: 2 },
      { id: 'probe-a2-y', zone: 'left', defaultOrder: 0 },
      { id: 'probe-a2-z', zone: 'left', defaultOrder: 1 },
    ]
    const DECLARED_SEQUENCE = ['probe-a2-y', 'probe-a2-z', 'probe-a2-x']

    const orders: Array<[string, string[]]> = [
      ['array order (x, y, z)', ['probe-a2-x', 'probe-a2-y', 'probe-a2-z']],
      ['array order (z, y, x)', ['probe-a2-z', 'probe-a2-y', 'probe-a2-x']],
    ]
    const readings: string[] = []
    // ⟨REPAIR `2026-11-15` — `RCA-8(c)`: the SUPERSEDED FORM stays visible.⟩ The TWO-ARRAY-ORDER
    // falsifier below was a TEST-SIDE DEFECT and it was the row's only red. As filed it compared the
    // two HUMAN-READABLE readings — `if (readings.length >= 2 && readings[0] !== readings[1])` —
    // where every reading is built as `` `${label} → [${sequence.join(', ')}]` ``. Because `label`
    // is baked INTO each string, `readings[0] !== readings[1]` is TRUE for EVERY possible
    // implementation, so the tooth could never pass (both per-order teeth above were already green:
    // both array orders already produce the DECLARED sequence). The repair keeps `readings` for the
    // failure MESSAGE and compares the SEQUENCES themselves (`sequences`, filled beside it).
    // WHY THIS IS NOT A WEAKENING: it makes the declared falsifier STRICTER — it now detects a real
    // divergence between the two array orders, which the superseded string compare could not
    // distinguish from the labels it was really comparing. No arm is deleted, no claim loosened,
    // and the per-order teeth and the `readings` join in the message are byte-identical.
    const sequences: string[] = []
    for (const [label, ids] of orders) {
      const assembly = assemble({
        panes: family,
        // NO declared index on any member: the entry carries its id/zone/collapsed and nothing else
        layout: rawLayout(ids.map((id) => ({ id, zone: 'left' as Zone }))),
      })
      const sequence = paneOrder(assembly)
      readings.push(`${label} → [${sequence.join(', ')}]`)
      // the falsifier's SUBJECT: the sequence alone, never the label that rides in the reading
      sequences.push(fingerprint(sequence))
      if (fingerprint(sequence) !== fingerprint(DECLARED_SEQUENCE)) {
        problems.push(
          `(a2) the ${label} produced [${sequence.join(', ')}], not the DECLARED sequence ` +
            `[${DECLARED_SEQUENCE.join(', ')}] — §2 C-1/§3 A(a2): an ABSENT \`index\` sorts at the pane's DECLARED ` +
            `place (\`defaultOrder\`, else its registration \`seq\`), so the family's ARRAY order must not reach the sequence`,
        )
      }
    }
    if (sequences.length >= 2 && sequences[0] !== sequences[1]) {
      problems.push(
        `(a2) the SAME family drove the SAME assembler in TWO array orders and produced TWO sequences ` +
          `(${readings.join(' | ')}) — the falsifier §3 A(a2) names: the order must be a fact of the declared ` +
          `places, never of the reading's position`,
      )
    }

    // (a2) TIES AT THE DECLARED PLACE: x and y both STATE index 1; z states 0. The declared places
    // (y = 0) put y before x (2); the registration seq (x = 0, y = 1) would put x first.
    const tied = assemble({
      panes: family,
      layout: rawLayout([
        { id: 'probe-a2-x', zone: 'left', index: 1 },
        { id: 'probe-a2-y', zone: 'left', index: 1 },
        { id: 'probe-a2-z', zone: 'left', index: 0 },
      ]),
    })
    const tiedSequence = paneOrder(tied)
    const tieExpected = ['probe-a2-z', 'probe-a2-y', 'probe-a2-x']
    if (fingerprint(tiedSequence) !== fingerprint(tieExpected)) {
      problems.push(
        `(a2) a STATED-place tie (x and y both index 1, z index 0) produced [${tiedSequence.join(', ')}], not ` +
          `[${tieExpected.join(', ')}] — §3 A(a2) breaks the tie at the DECLARED place (y = 0 before x = 2), not at ` +
          `the registration \`seq\` (which would answer [z, x, y])`,
      )
    }

    expect(
      problems,
      `limb A — the placement law (§3 limb A, sub-arms a1…a3; §2 C-1; ASM-U3-2). ${problems.length} problem(s). ` +
        `OMISSIONS READ: ${readings.join(' | ')}. §2 C-1 makes \`PaneLayoutEntry.index\` OPTIONAL with absence ` +
        `STORABLE (a finite number copied, never the reading's array position, junk = absent), and makes the ONE law ` +
        `— declared place = \`defaultOrder\` when finite else the registration \`seq\`; effective place = the stated ` +
        `\`index\` when stated, else the declared place — the reader the assembler sorts by. ` +
        `LAYER: envelope-class — pure coercion + the real assembler over a real \`PaneRegistry\`; no paint, no grid`,
    ).toEqual([])
  })

  it('B — the act\'s comparison and its chain: an equal placement writes nothing, a collapsed destination writes exactly ONE `collapsed: false`, and an absent-index self-drop is a no-op', () => {
    // §3 limb B, sub-arms b1/b2/b3. LAYER: envelope — the REAL `SidebarPanes.commitPaneDrop` over the
    // layout-less DOM shim, its `setLayout` write COUNTED.
    // NON-VACUITY: (b1)'s ZERO-write tooth is paired with a REAL relocation on the same seed that must
    // write exactly ONCE (otherwise a dead counter would satisfy "zero"); (b2)'s collapsed-zone write is
    // paired with the SAME drop into the SAME zone EXPANDED writing nothing — the gate's own pair.
    // MUTATION THAT WOULD RED IT: deleting the zone-first gate (the compare-then-write order of
    // `commitPaneDrop`) reds (b2); ignoring the declared places when composing the comparison word reds
    // (b3); a counter-blind implementation (writing on every commit) reds (b1).
    const problems: string[] = []
    const ONE = 'probe-b-one'
    const TWO = 'probe-b-two'
    const panes: PaneSpec[] = [
      { id: ONE, zone: 'left', defaultOrder: 0 },
      { id: TWO, zone: 'right', defaultOrder: 0 },
    ]
    const restoreAll: Array<() => void> = []
    try {
      // ---- (b1) A DROP EQUAL TO THE RECORD'S EFFECTIVE PLACEMENT: ZERO `setLayout`s -------------
      // ONE is alone in `left` at place 0, TWO alone in `right`; ONE's self-drop appends back to
      // place 0 — the record's own effective placement, compared as ONE composed word.
      const equalSeed = rawLayout(
        [
          { id: ONE, zone: 'left', index: 0 },
          { id: TWO, zone: 'right', index: 0 },
        ],
        { left: { collapsed: false } },
      )
      const equalHost = seedHost(equalSeed, panes)
      restoreAll.push(equalHost.restore)
      equalHost.host.startPaneDrag(ONE)
      const equalResult = equalHost.host.commitPaneDrop({ paneId: ONE, zone: 'left' })
      if (equalResult == null) {
        problems.push('(b1) the self-drop was REJECTED by the host (commitPaneDrop answered null) — the act must accept a legal drop')
      }
      if (equalHost.calls() !== 0) {
        problems.push(
          `(b1) a drop equal to the record's effective placement (\`${ONE}\` → left/place 0) wrote ${equalHost.calls()} ` +
            `\`setLayout\`(s), not ZERO — §2 C-2/§3 B(b1): the ONE comparison word (zone + place) is unchanged, so the ` +
            `act is a no-op (a self-drop that lands on its own place writes nothing)`,
        )
      }

      // ---- the (b1) POSITIVE CONTROL: a REAL relocation on the SAME seed writes exactly ONCE -----
      const moveHost = seedHost(equalSeed, panes)
      restoreAll.push(moveHost.restore)
      moveHost.host.startPaneDrag(ONE)
      moveHost.host.commitPaneDrop({ paneId: ONE, zone: 'right' })
      if (moveHost.calls() !== 1) {
        problems.push(
          `(b1) the CONTROL relocation (\`${ONE}\` → right) wrote ${moveHost.calls()} \`setLayout\`(s), not exactly 1 — ` +
            `without this arm the ZERO above would be satisfied by a counter that can never move`,
        )
      } else if (frameZoneOfInLayout(moveHost.writes[0], ONE) !== 'right') {
        problems.push(
          `(b1) the CONTROL relocation's written record puts "${ONE}" in ${shown(frameZoneOfInLayout(moveHost.writes[0], ONE))}, not right`,
        )
      }

      // ---- (b2) THE SAME DROP INTO A COLLAPSED ZONE: exactly ONE write stating `collapsed: false` --
      // ONE stands alone in `right` at place 0 and the zone STATES `collapsed: true`; the drop is
      // therefore a placement NO-OP into a collapsed zone — the gate must come AHEAD of the no-op.
      const collapsedSeed = rawLayout([{ id: ONE, zone: 'right', index: 0 }], { right: { collapsed: true } })
      const collapsedHost = seedHost(collapsedSeed, panes)
      restoreAll.push(collapsedHost.restore)
      collapsedHost.host.startPaneDrag(ONE)
      collapsedHost.host.commitPaneDrop({ paneId: ONE, zone: 'right' })
      if (collapsedHost.calls() !== 1) {
        problems.push(
          `(b2) a placement-equal drop into a COLLAPSED zone wrote ${collapsedHost.calls()} \`setLayout\`(s), not exactly ` +
            `ONE — §2 C-2's zone-first gate: when the target zone is collapsed (statement or derivation) the write states ` +
            `\`collapsed: false\` EVEN WHEN the placement is a no-op (the pane's own glyph already reads ▸, so the drop IS an open)`,
        )
      } else {
        const written = collapsedHost.writes[0]!
        if (written.zones.right.collapsed !== false) {
          problems.push(
            `(b2) the ONE write states \`zones.right.collapsed\` = ${shown(written.zones.right.collapsed)}, not the EXPLICIT ` +
              `\`false\` the gate states (§2 C-2; the member is never deleted, ASM-U1b-1)`,
          )
        }
        if (written.zones.right.size !== (coerceLayout(collapsedSeed).zones.right.size)) {
          problems.push(
            `(b2) the ONE write moved \`zones.right.size\` (${written.zones.right.size} vs the record's ` +
              `${coerceLayout(collapsedSeed).zones.right.size}) — a collapse never touches the retained size`,
          )
        }
        const beforePanes = fingerprint(coerceLayout(collapsedSeed).panes)
        if (fingerprint(written.panes) !== beforePanes) {
          problems.push(
            `(b2) the ONE write also rewrote the PANES family (${beforePanes} → ${fingerprint(written.panes)}) — the gate is ` +
              `composed into ONE \`setLayout\` carrying BOTH families (ASM-U3-6), but the panes family is byte-identical when the ` +
              `placement is unchanged`,
          )
        }
        for (const zone of CLOSED_ZONES) {
          if (zone === 'right') continue
          if (fingerprint(written.zones[zone]) !== fingerprint(coerceLayout(collapsedSeed).zones[zone])) {
            problems.push(
              `(b2) the ONE write touched \`zones.${zone}\` (${fingerprint(written.zones[zone])} vs ` +
                `${fingerprint(coerceLayout(collapsedSeed).zones[zone])}) — one member at one address`,
            )
          }
        }
      }

      // ---- the (b2) PAIR: the SAME drop into the SAME zone EXPANDED writes NOTHING --------------
      const expandedSeed = rawLayout([{ id: ONE, zone: 'right', index: 0 }], { right: { collapsed: false } })
      const expandedHost = seedHost(expandedSeed, panes)
      restoreAll.push(expandedHost.restore)
      expandedHost.host.startPaneDrag(ONE)
      expandedHost.host.commitPaneDrop({ paneId: ONE, zone: 'right' })
      if (expandedHost.calls() !== 0) {
        problems.push(
          `(b2) the PAIR arm (the same drop into the same zone EXPANDED) wrote ${expandedHost.calls()} \`setLayout\`(s), not ` +
            `ZERO — the collapsed-zone write above is only the gate if the expanded arm is silent`,
        )
      }

      // ---- (b3) AN ABSENT-INDEX FAMILY'S SELF-DROP IS A NO-OP -----------------------------------
      // Declared places 2 / 0 / 1 in array order (p1, p2, p3) and NO stated index: the record's
      // effective sequence is (p2, p3, p1), so p1's self-drop appends onto ITS OWN place (2) and
      // writes nothing — today it WRITES, because the read position (0) differs from the declared place.
      const familyPanes: PaneSpec[] = [
        { id: 'probe-b3-p1', zone: 'left', defaultOrder: 2 },
        { id: 'probe-b3-p2', zone: 'left', defaultOrder: 0 },
        { id: 'probe-b3-p3', zone: 'left', defaultOrder: 1 },
      ]
      const absentSeed = rawLayout([
        { id: 'probe-b3-p1', zone: 'left' },
        { id: 'probe-b3-p2', zone: 'left' },
        { id: 'probe-b3-p3', zone: 'left' },
      ])
      // the record's own effective order, read off the REAL assembler (the law's observable)
      const absentAssembly = assemble({ panes: familyPanes, layout: absentSeed })
      const recordOrder = paneOrder(absentAssembly)
      if (recordOrder[recordOrder.length - 1] !== 'probe-b3-p1') {
        problems.push(
          `(b3) the absent-index seed's assembled order reads [${recordOrder.join(', ')}], so \`probe-b3-p1\` is NOT last and the ` +
            `self-drop's subject (a pane standing at its DECLARED last place) cannot be confirmed at this head — §2 C-1's law puts ` +
            `the declared places (p2 = 0, p3 = 1, p1 = 2) in that order, and the landed assembler reads the array positions instead`,
        )
      }
      const absentHost = seedHost(absentSeed, familyPanes)
      restoreAll.push(absentHost.restore)
      absentHost.host.startPaneDrag('probe-b3-p1')
      absentHost.host.commitPaneDrop({ paneId: 'probe-b3-p1', zone: 'left' })
      if (absentHost.calls() !== 0) {
        problems.push(
          `(b3) a SELF-drop of a pane whose family states NO indexes wrote ${absentHost.calls()} \`setLayout\`(s), not ZERO — ` +
            `the record's declared order is [${recordOrder.join(', ')}] so the pane's effective place is the LAST one; today it ` +
            `WRITES because \`coerceLayout\` read the pane's array position (0) instead of its declared place (2)`,
        )
      }

      // ---- the (b3) PAIR: the FIRST pane's self-drop DOES write once (a place really moved) ------
      const firstHost = seedHost(absentSeed, familyPanes)
      restoreAll.push(firstHost.restore)
      firstHost.host.startPaneDrag('probe-b3-p2')
      firstHost.host.commitPaneDrop({ paneId: 'probe-b3-p2', zone: 'left' })
      if (firstHost.calls() !== 1) {
        problems.push(
          `(b3) the PAIR arm (the FIRST declared pane's self-drop, whose effective place is 0 and whose append lands last) ` +
            `wrote ${firstHost.calls()} \`setLayout\`(s), not exactly 1 — a comparison word that never moves cannot red the (b3) ` +
            `tooth above`,
        )
      }
    } finally {
      for (const restore of restoreAll) restore()
    }

    expect(
      problems,
      `limb B — the act's comparison and its chain (§3 limb B, sub-arms b1…b3; §2 C-2; ASM-U3-6). ${problems.length} problem(s). ` +
        `§2 C-2's order: resolve the effective placement → compose the ONE comparison word (zone + place) → the zone-first ` +
        `gate → write; a collapsed target states \`collapsed: false\` even on a no-op, and the whole gesture is ONE ` +
        `\`setLayout\` carrying both families. ` +
        `LAYER: envelope-class — the REAL \`SidebarPanes\` over the layout-less shim with its \`setLayout\` COUNTED; no paint, ` +
        `no pointer, no window`,
    ).toEqual([])
  })

  it('C — the whole-family write: one gesture is ONE `setLayout`, the moved `zone` plus every affected `index` `0…n-1`, and DECLARED order survives a contradicting array', async () => {
    // §3 limb C, sub-arms c1/c2/c3. LAYER: envelope — (c1)/(c2) drive the REAL host; (c3) is the pure
    // `movePane` reached through `await import` with its 5th (declared-places) parameter.
    // NON-VACUITY: (c1)'s "exactly one" is paired with a FLOOR ("not zero") for the same gesture, and
    // the gesture's reveals are counted so the crossings really happened; (c2)'s renumbering is paired
    // with the byte-identity of every OTHER member and of the three untouched layout members; (c3)'s
    // declared-order answer is paired with the ARRAY-order answer it must not give.
    // MUTATION THAT WOULD RED IT: a per-pane sequence of writes reds (c1); skipping the vacated zone's
    // renumber reds (c2); keeping `a.index - b.index` (the array order) in `movePane`'s sorts, or
    // ignoring the 5th parameter, reds (c3).
    const problems: string[] = []
    const drag = (await import('../../../src/renderer/pane-drag.js')) as Record<string, unknown>
    const mover = readExport(drag, 'movePane', 'src/renderer/pane-drag.ts', 'C')
    problems.push(...mover.problems)
    const move = typeof mover.value === 'function' ? (mover.value as (...args: unknown[]) => LayoutState) : null

    // ---- (c1) + (c2) ONE GESTURE, ONE WRITE, A WHOLE-FAMILY RECORD -----------------------------
    const A = 'probe-c-a'
    const B = 'probe-c-b'
    const C = 'probe-c-c'
    const D = 'probe-c-d'
    const panes: PaneSpec[] = [
      { id: A, zone: 'left', defaultOrder: 0 },
      { id: B, zone: 'right', defaultOrder: 0 },
      { id: C, zone: 'right', defaultOrder: 1 },
      { id: D, zone: 'left', defaultOrder: 1 },
    ]
    const seed = rawLayout([
      { id: A, zone: 'left', index: 0 },
      { id: D, zone: 'left', index: 1 },
      { id: B, zone: 'right', index: 0 },
      { id: C, zone: 'right', index: 1 },
    ])
    const drive = seedHost(seed, panes)
    try {
      drive.host.startPaneDrag(A)
      const revealReadings: string[] = []
      for (const zone of ['left', 'top', 'bottom', 'right', 'left', 'right', 'bottom'] as Zone[]) {
        drive.host.movePaneDrag(POINT_ON[zone], ZONE_BOUNDS)
        revealReadings.push(JSON.stringify([...drive.host.revealZones()]))
      }
      drive.host.movePaneDrag(DROP_POINT, ZONE_BOUNDS)
      const committed = drive.host.commitPaneDrop({ paneId: A, zone: 'bottom' })
      if (committed == null) {
        problems.push('(c1) the committed drop was REJECTED (commitPaneDrop answered null) — the gesture never reached the write')
      }
      if (drive.calls() === 0) {
        problems.push(
          '(c1) the gesture produced ZERO `setLayout`s — a relocation of one pane into another zone must write once ' +
            '(the FLOOR that keeps the "exactly one" tooth from being satisfied by a dead path)',
        )
      } else if (drive.calls() !== 1) {
        problems.push(
          `(c1) ONE gesture produced ${drive.calls()} \`setLayout\`(s), not exactly ONE — §2 C-2/§3 C(c1): the moved pane's ` +
            `\`zone\` plus every affected pane's recomputed \`index\` is ONE whole-family write, never a per-pane sequence`,
        )
      }
      const distinctReveals = new Set(revealReadings.filter((reading) => reading !== '[]'))
      if (distinctReveals.size < 2) {
        problems.push(
          `(c1) the crossing produced ${distinctReveals.size} distinct NON-EMPTY reveal reading(s) (${[...distinctReveals].join(' | ')}) ` +
            `— the gesture did not cross, so "one write" was never under pressure`,
        )
      }

      const written = drive.writes[0]
      if (written === undefined) {
        problems.push('(c2) the gesture committed NO layout record — the whole-family write has no subject')
      } else {
        const record = coerceLayout(seed)
        // the DESTINATION zone: the moved pane's `zone` + every member renumbered 0…n-1
        const bottom = panesOf(written).filter((pane) => pane.zone === 'bottom')
        const bottomIds = bottom.map((pane) => pane.id)
        const bottomIndexes = bottom.map((pane) => (pane as unknown as Record<string, unknown>)['index'])
        if (bottomIds.length !== 1 || bottomIds[0] !== A) {
          problems.push(
            `(c2) the destination zone \`bottom\` holds [${bottomIds.join(', ')}], not exactly ["${A}"] — the moved pane's \`zone\` ` +
              `is the member that relocates`,
          )
        }
        if (fingerprint(bottomIndexes) !== fingerprint([0])) {
          problems.push(`(c2) the destination zone's indexes read ${fingerprint(bottomIndexes)}, not [0] (0…n-1 over the zone)`)
        }
        // the VACATED zone: every surviving member renumbered 0…n-1 in its own order
        const left = panesOf(written).filter((pane) => pane.zone === 'left')
        const leftIds = left.map((pane) => pane.id)
        const leftIndexes = left.map((pane) => (pane as unknown as Record<string, unknown>)['index'])
        if (fingerprint(leftIds) !== fingerprint([D])) {
          problems.push(`(c2) the VACATED zone \`left\` holds [${leftIds.join(', ')}], not ["${D}"] — the source zone is renumbered, not emptied`)
        }
        if (fingerprint(leftIndexes) !== fingerprint([0])) {
          problems.push(
            `(c2) the VACATED zone's indexes read ${fingerprint(leftIndexes)}, not [0] — §2 C-2 renumbers EVERY affected pane 0…n-1 ` +
              `(D's stale 1 must not survive the relocation)`,
          )
        }
        // every OTHER member byte-identical on every entry
        for (const beforeEntry of panesOf(record)) {
          const afterEntry = panesOf(written).find((pane) => pane.id === beforeEntry.id) as unknown as
            | Record<string, unknown>
            | undefined
          if (afterEntry === undefined) {
            problems.push(`(c2) the write DROPPED the entry for "${beforeEntry.id}" — a relocation moves one entry, never removes one`)
            continue
          }
          const beforeKeys = Object.keys(beforeEntry as unknown as Record<string, unknown>).sort()
          const afterKeys = Object.keys(afterEntry).sort()
          if (fingerprint(beforeKeys) !== fingerprint(afterKeys)) {
            problems.push(
              `(c2) the write changed the MEMBER SET of "${beforeEntry.id}" (${beforeKeys.join('/')} → ${afterKeys.join('/')}) — ` +
                `the moved entry differs in \`zone\`/\`index\` alone, and no other entry differs at all`,
            )
            continue
          }
          for (const key of beforeKeys) {
            if (key === 'zone' || key === 'index') continue
            const beforeValue = (beforeEntry as unknown as Record<string, unknown>)[key]
            if (fingerprint(afterEntry[key]) !== fingerprint(beforeValue)) {
              problems.push(
                `(c2) the write changed \`${beforeEntry.id}.${key}\` (${fingerprint(beforeValue)} → ${fingerprint(afterEntry[key])}) — ` +
                  `every other member is byte-identical`,
              )
            }
          }
        }
        // the three non-pane members untouched
        for (const member of ['zones', 'stage', 'topBar'] as const) {
          if (fingerprint(written[member]) !== fingerprint(record[member])) {
            problems.push(
              `(c2) the write changed \`${member}\` (${fingerprint(record[member])} → ${fingerprint(written[member])}) — ` +
                `the whole-family write carries the panes family only`,
            )
          }
        }
      }
    } finally {
      drive.restore()
    }

    // ---- (c3) THE DECLARED ORDER BEATS A CONTRADICTING ARRAY (the pure law) ---------------------
    if (move !== null) {
      const p1 = 'probe-c3-p1'
      const p2 = 'probe-c3-p2'
      const p3 = 'probe-c3-p3'
      // array order (p1, p2, p3) CONTRADICTS the declared places (p1 = 2, p2 = 0, p3 = 1); nothing
      // states an index, so the law must answer the declared order (p2, p3, p1) and, after moving p2 to
      // place 1, (p3, p2, p1).
      const c3Seed = rawLayout([
        { id: p1, zone: 'left' },
        { id: p2, zone: 'left' },
        { id: p3, zone: 'left' },
      ])
      const declared: Record<string, number> = { [p1]: 2, [p2]: 0, [p3]: 1 }
      const shapes: Array<{ label: string; value: unknown }> = [
        { label: 'Map<id, declaredPlace>', value: new Map(Object.entries(declared)) },
        { label: 'Record<id, declaredPlace>', value: { ...declared } },
        { label: 'Array<[id, declaredPlace]>', value: Object.entries(declared) },
        { label: 'declaredPlaceOf(id) function', value: (id: unknown) => declared[String(id)] ?? null },
      ]
      const EXPECTED = [p3, p2, p1]
      const ARRAY_ORDER_ANSWER = [p1, p2, p3]
      const readings: string[] = []
      let satisfied = false
      for (const shape of shapes) {
        let outcome: string
        try {
          const result = move(c3Seed, p2, 'left', 1, shape.value)
          const order = panesOf(coerceLayout(result))
            .filter((pane) => pane.zone === 'left')
            .sort((one, two) => ((one as unknown as Record<string, number>)['index'] ?? 0) - ((two as unknown as Record<string, number>)['index'] ?? 0))
            .map((pane) => pane.id)
          outcome = `[${order.join(', ')}]`
          if (fingerprint(order) === fingerprint(EXPECTED)) satisfied = true
        } catch (error) {
          outcome = `THREW (${String(error)})`
        }
        readings.push(`${shape.label} → ${outcome}`)
      }
      if (!satisfied) {
        problems.push(
          `(c3) a move to place 1 in a family whose ARRAY order contradicts its declared places and states NO indexes ` +
            `answered ${readings.join(' | ')} — §2 C-2/§3 C(c3) require the DECLARED order [${EXPECTED.join(', ')}] ` +
            `(the array order's answer is [${ARRAY_ORDER_ANSWER.join(', ')}], which is what the landed \`a.index - b.index\` ` +
            `sorts give once the absence is erased); the 5th parameter is the caller-supplied declared places, so every ` +
            `plausible carrier shape was tried and NONE reached the law`,
        )
      }
    }

    expect(
      problems,
      `limb C — the whole-family write (§3 limb C, sub-arms c1…c3; §2 C-2; ASM-U3-6). ${problems.length} problem(s). ` +
        `§2 C-2: ONE gesture = ONE \`setLayout\`; the moved pane's \`zone\` plus EVERY affected pane's \`index\` renumbered ` +
        `\`0…n-1\`; every other member byte-identical; the sibling sorts read §2 C-1's law through a 5th, OPTIONAL ` +
        `declared-places parameter, so a family's ARRAY order can never decide the zone's order. ` +
        `LAYER: envelope-class — the REAL host's write counted + the pure \`movePane\`; no paint, no pointer`,
    ).toEqual([])
  })

  it('D — the projection is SCOPED: the `.pane-drop` exclusion exists, `data-orientation` is REQUIRED and admits the four REAL containers, and `.gutter` survives', () => {
    // §3 limb D, sub-arms d1/d2/d3. LAYER: (d1)/(d3) are SOURCE clauses over `renderer.ts`'s
    // projection TEXT — with MUTATED COPIES of that text as their own falsifier; (d2) is the REAL
    // assembled envelope's authored discriminants.
    // NON-VACUITY: each source tooth is paired with a mutant that DELETES it and must then read false
    // (`d1` drop-skip, `d1` orientation requirement, `d3` gutter skip); (d2)'s admission of the four
    // containers is paired with the REFUSAL of the phantom family the same discriminant rejects
    // (the zone-collapse controls and the eight `.pane-drop` nodes, which carry `zone` and no
    // `data-orientation`). No source file is written.
    // MUTATION THAT WOULD RED IT: deleting the `.pane-drop` skip, deleting the `data-orientation`
    // requirement, or deleting the `.gutter` skip from `renderer.ts`'s projection reds (d1)/(d3); an
    // assembler that stopped authoring `data-orientation` on a container reds (d2).
    const problems: string[] = []
    const region = projectionRegion()
    problems.push(...region.problems)

    const read = readProjection(region.text)
    // ---- (d1) THE `.pane-drop` EXCLUSION -----------------------------------------------------
    if (!read.dropSkip) {
      problems.push(
        `(d1) ${RENDERER_FILE}'s projection carries no \`'pane-drop'\` exclusion — §2 C-3/§3 D(d1): the candidate set ` +
          `becomes the four authored zone CONTAINERS and nothing else, and the eight authored \`.pane-drop\` nodes are the ` +
          `phantom zone bound FACT 1 measures (the landed projection skips only \`.gutter\`)`,
      )
    } else {
      const mutated = region.text.replace(/'pane-drop'/g, "'pane-drop-mutant'").replace(/"pane-drop"/g, '"pane-drop-mutant"')
      if (readProjection(mutated).dropSkip) {
        problems.push('(d1) the `.pane-drop` exclusion tooth cannot fail: a copy of the projection with the token renamed still reads as excluded')
      }
    }

    // ---- (d1) THE `data-orientation` CONTAINER DISCRIMINANT IS REQUIRED ----------------------
    if (!read.orientationAttribute || !read.orientationFromZone) {
      problems.push(
        `(d1) ${RENDERER_FILE}'s projection reads data-orientation: ${read.orientationAttribute}, and compares it against ` +
          `\`zoneOrientation(zone)\`: ${read.orientationFromZone} — §2 C-3/§3 D(d1) REQUIRE the container's own authored ` +
          `discriminant (\`data-orientation\` present and equal to \`zoneOrientation(zone)\`), which \`pane-graph.ts\` is the only ` +
          `author of; the controls, tabs, drops and gutters carry none`,
      )
    } else {
      const mutated = region.text.replace(/['"]data-orientation['"]/g, (token) => token.replace('data-orientation', 'data-orientation-mutant'))
      if (readProjection(mutated).orientationAttribute) {
        problems.push('(d1) the `data-orientation` tooth cannot fail: a copy of the projection with the attribute renamed still reads as required')
      }
    }

    // ---- (d3) THE `.gutter` EXCLUSION SURVIVES ----------------------------------------------
    if (!read.gutterSkip) {
      problems.push(
        `(d3) ${RENDERER_FILE}'s projection lost the \`'gutter'\` exclusion — §2 C-3 keeps it (a gutter carries \`zone\` + ` +
          `\`data-axis\`, never \`data-orientation\`, so it is not a drop container)`,
      )
    } else {
      const mutated = region.text.replace(/'gutter'/g, "'gutter-mutant'").replace(/"gutter"/g, '"gutter-mutant"')
      if (readProjection(mutated).gutterSkip) {
        problems.push('(d3) the `.gutter` exclusion tooth cannot fail: a copy of the projection with the token renamed still reads as excluded')
      }
    }

    // ---- (d2) THE FOUR REAL CONTAINERS ARE ADMITTED; THE PHANTOMS ARE REFUSED ----------------
    const assembly = assemble({
      panes: [
        { id: 'probe-d-a', zone: 'left' },
        { id: 'probe-d-b', zone: 'right' },
      ],
    })
    const containers = zoneContainers(assembly.envelope)
    /** §2 C-3's discriminant, applied to AUTHORED DATA: `zone` ∈ the closed four AND
     *  `data-orientation` present and equal to `zoneOrientation(zone)`. */
    const admits = (node: AssembledNode): boolean => {
      const zone = propText(node, 'zone')
      if (!(CLOSED_ZONES as readonly string[]).includes(zone)) return false
      const orientation = node.props?.['data-orientation']
      return typeof orientation === 'string' && orientation === zoneOrientation(zone as LayoutZoneName)
    }
    const containerReadings: string[] = []
    for (const zone of CLOSED_ZONES) {
      const container = containers.get(zone)
      if (container === undefined) {
        problems.push(`(d2) the assembled template root carries NO container for zone \`${zone}\` — the discriminant has no subject`)
        continue
      }
      containerReadings.push(
        `${zone}: zone=${shown(propText(container, 'zone'))} data-orientation=${shown(container.props?.['data-orientation'])}`,
      )
      if (!admits(container)) {
        problems.push(
          `(d2) the REAL container for \`${zone}\` is REFUSED by the required discriminant (zone=${shown(propText(container, 'zone'))}, ` +
            `data-orientation=${shown(container.props?.['data-orientation'])}, zoneOrientation(${zone}) = '${zoneOrientation(zone)}') — ` +
            `the scoping would project ZERO zone bounds`,
        )
      }
    }
    // the phantom family the same discriminant must refuse (the anti-vacuity half)
    const allNodes = walkEnvelope(assembly.envelope)
    const controls = allNodes.filter((node) => propIdOf(node).startsWith('zone-collapse-'))
    const drops = allNodes.filter((node) => classesOf(node).includes('pane-drop'))
    const gutters = allNodes.filter((node) => classesOf(node).includes('gutter'))
    if (controls.length !== 4 || drops.length !== 8 || gutters.length !== 4) {
      problems.push(
        `(d2) the phantom census reads ${controls.length} zone-collapse controls / ${drops.length} \`.pane-drop\` nodes / ` +
          `${gutters.length} gutters, not 4 / 8 / 4 — with an empty phantom set the refusal below cannot be measured`,
      )
    }
    for (const [label, family] of [
      ['zone-collapse control', controls],
      ['pane-drop', drops],
      ['gutter', gutters],
    ] as Array<[string, AssembledNode[]]>) {
      const admitted = family.filter((node) => admits(node))
      if (admitted.length > 0) {
        problems.push(
          `(d2) ${admitted.length} ${label} node(s) are ADMITTED by the container discriminant (${admitted
            .slice(0, 3)
            .map((node) => propIdOf(node) || '(no id)')
            .join(', ')}) — §2 C-3's scope is the four CONTAINERS, and these carry \`zone\` without the container's own ` +
            `\`data-orientation\` carrier (ASM-U3-3: the identity, never the \`0×0\` box)`,
        )
      }
    }

    expect(
      problems,
      `limb D — the projection (§3 limb D, sub-arms d1…d3; §2 C-3; ASM-U3-3). ${problems.length} problem(s). ` +
        `CONTAINERS READ: ${containerReadings.join(' | ') || '(none)'}. §2 C-3: the candidate set becomes the four authored ` +
        `zone CONTAINERS — skip \`.gutter\` (kept) and \`.pane-drop\` (added), then REQUIRE \`zone\` ∈ the closed four AND ` +
        `\`data-orientation\` present and equal to \`zoneOrientation(zone)\`. ` +
        `LAYER: envelope-class — a SOURCE clause over \`renderer.ts\`'s projection text (with mutated copies as its own ` +
        `falsifier) + the REAL assembled envelope's authored discriminants; nothing is painted`,
    ).toEqual([])
  })

  it('E — the admission is discriminating: a one-axis degenerate box is ADMITTED, a both-axis one is REFUSED, and the four `zoneTrackVars` arms are unmoved', async () => {
    // §3 limb E, sub-arms e1/e2/e3. LAYER: envelope — pure functions (`dropZoneForPoint` reaches
    // `measuresWithinSnapThreshold`, the private predicate §2 C-3 changes; `zoneTrackVars`).
    // NON-VACUITY: (e1)'s ADMISSION is paired with (e2)'s REFUSAL — the pair §3 E names; (e2)'s box is
    // degenerate on BOTH axes yet WELL WITHIN the snap threshold at the same point, so the refusal it
    // measures is the degeneracy guard and not a distance; (e3)'s four arms are the SAME four `U-1b`
    // limb `H` pinned, so a change of extent policy cannot pass unnoticed.
    // MUTATION THAT WOULD RED IT: keeping the whole-box refusal (`right <= left` ⇒ false) reds (e1);
    // DELETING the refusal reds (e2); moving any of the four `zoneTrackVars` arms reds (e3).
    const problems: string[] = []
    const drag = (await import('../../../src/renderer/pane-drag.js')) as Record<string, unknown>
    const hit = readExport(drag, 'dropZoneForPoint', 'src/renderer/pane-drag.ts', 'E')
    problems.push(...hit.problems)
    const hitTest =
      typeof hit.value === 'function'
        ? (hit.value as (point: DragPoint, zones: readonly ZoneBounds[], threshold: number) => LayoutZoneName | null)
        : null

    if (hitTest !== null) {
      // ---- (e1) ONE AXIS DEGENERATE ⇒ ADMITTED -------------------------------------------------
      // {left:3, right:3, top:0, bottom:600} — a zero-span on the ARRANGEMENT axis (an empty/collapsed
      // zone whose track is `0px`), a real 600px span on the other. The point (9, 300) is inside the
      // closed box on the y axis and 6px off it on x, well within a 24px threshold.
      const oneAxis: ZoneBounds = { zone: 'left', left: 3, right: 3, top: 0, bottom: 600 }
      const admitted = hitTest({ x: 9, y: 300 }, [oneAxis], 24)
      if (admitted !== 'left') {
        problems.push(
          `(e1) \`{left:3,right:3,top:0,bottom:600}\` at (9,300) with a 24px threshold answered ${shown(admitted)}, not 'left' — ` +
            `§2 C-3/§3 E(e1): a box degenerate on ONE axis is a LEGITIMATE target along its edge line (distance 6 ≤ threshold), ` +
            `so the refusal must stop firing on a single degenerate axis (today \`right <= left\` ⇒ false)`,
        )
      }

      // ---- (e2) BOTH AXES DEGENERATE ⇒ REFUSED (the anti-vacuity pair) ------------------------
      const bothAxes: ZoneBounds = { zone: 'left', left: 5, right: 5, top: 5, bottom: 5 }
      // the point's own distance to that box, so the refusal is provably NOT a distance refusal
      const distance = Math.hypot(Math.max(5 - 9, 0, 9 - 5), Math.max(5 - 9, 0, 9 - 5))
      const refused = hitTest({ x: 9, y: 9 }, [bothAxes], 24)
      if (refused !== null) {
        problems.push(
          '(e2) the {left:5,right:5,top:5,bottom:5} 0×0 box at (9,9) answered ' +
            `${shown(refused)}, not null — §2 C-3/§3 E(e2) KEEPS the both-axes refusal (the \`.pane-drop\` phantom's own ` +
            'signature); deleting the guard is the rejected alternative of ASM-U3-4',
        )
      }
      if (!(distance <= 24)) {
        problems.push(
          `(e2) the refusal probe's own distance (${distance.toFixed(3)}) exceeds the 24px threshold, so a null would prove nothing ` +
            `about the degeneracy guard`,
        )
      }

      // ---- the (e1) positive CONTROL on a NON-degenerate box -----------------------------------
      const real: ZoneBounds = { zone: 'left', left: 0, right: 100, top: 0, bottom: 600 }
      if (hitTest({ x: 9, y: 300 }, [real], 24) !== 'left') {
        problems.push('(e1) the CONTROL (a fully non-degenerate box at the same point) was not admitted — the hit-test path itself is dead')
      }
    }

    // ---- (e3) THE FOUR `zoneTrackVars` ARMS ARE UNMOVED --------------------------------------
    const trackRegistry = createPaneRegistry()
    trackRegistry.register({
      id: 'probe-e-pane',
      title: 'probe-e-pane',
      scope: 'app-graph',
      defaultZone: 'left',
      render: () => ({ type: 'div', props: { id: 'probe-e-render-root' } }),
    })
    trackRegistry.enable('probe-e-pane')
    const emptyLayout = rawLayout([])
    const occupiedLayout = rawLayout([{ id: 'probe-e-pane', zone: 'left', index: 0 }])
    const collapsedLayout = rawLayout([{ id: 'probe-e-pane', zone: 'left', index: 0 }], { left: { collapsed: true } })
    const arms: Array<[string, Record<string, string>]> = [
      ['empty, not revealed → 0px', zoneTrackVars(trackRegistry, emptyLayout)],
      ['empty, revealed → the removal path', zoneTrackVars(trackRegistry, emptyLayout, { revealedZones: ['top'] })],
      ['occupied + collapsed → auto', zoneTrackVars(trackRegistry, collapsedLayout)],
      ['occupied + expanded → the persisted size', zoneTrackVars(trackRegistry, occupiedLayout)],
    ]
    const expectations: Record<string, [string, string]> = {
      'empty, not revealed → 0px': ['--zone-top-track', '0px'],
      'empty, revealed → the removal path': ['--zone-top-track', ''],
      'occupied + collapsed → auto': ['--zone-left-track', 'auto'],
      'occupied + expanded → the persisted size': ['--zone-left-track', `${coerceLayout(occupiedLayout).zones.left.size}px`],
    }
    for (const [label, record] of arms) {
      const keys = Object.keys(record)
      if (keys.length < 5) {
        problems.push(`(e3) the \`${label}\` arm returned ${keys.length} keys (${keys.join(', ')}) — the census is blind`)
        continue
      }
      const [prop, expected] = expectations[label]!
      if (record[prop] !== expected) {
        problems.push(
          `(e3) the \`${label}\` arm reads \`${prop}\` = ${shown(record[prop])}, not ${shown(expected)} — §3 E(e3) keeps all four ` +
            `\`zoneTrackVars\` arms UNMOVED (this unit changes no extent, only the admission)`,
        )
      }
    }

    expect(
      problems,
      `limb E — the admission (§3 limb E, sub-arms e1…e3; §2 C-3; ASM-U3-4). ${problems.length} problem(s). ` +
        `§2 C-3: the degenerate-rect refusal becomes DISCRIMINATING — refuse a box degenerate on BOTH axes (the 0×0 phantom) ` +
        `and ADMIT one degenerate on ONE axis (an empty/collapsed zone's \`0px\` track is a legitimate target along its edge ` +
        `line); the four \`zoneTrackVars\` arms are untouched. ` +
        `LAYER: envelope-class — pure functions; the reachability of a real drag into an empty zone is \`G8\`-only`,
    ).toEqual([])
  })

  it('F — the form by POSITION, rendered through the engine: `pane-in-<zone>` arrives by placement, survives a move, and the stage provider never leaks', () => {
    // §3 limb F, sub-arms f1/f2/f3. LAYER: envelope-class — the HTML is the ENGINE's (translate →
    // Supervisor → compile → renderProducingProcess → SSRFragmentAdapter for the root-provider arm;
    // the host's payload resolution for the frames). NO limb asserts a painted style: only the CLASS
    // STRINGS the engine emitted, read off the element that carries the pane's own id.
    // NON-VACUITY: (f1)'s inherited-class tooth is paired with the frame's AUTHORED classes
    // (`pane-frame`/`is-collapsed`) having to survive — an engine that REPLACED the class list reds
    // too; (f2)'s destination tooth is paired with the SOURCE class reaching NOTHING; (f3)'s stage
    // tooth is paired with the negative that a zone-resident pane never carries `pane-in-stage`.
    // MUTATION THAT WOULD RED IT: dropping the container's `zone-format` provider (or writing the
    // form as a `css.classes` on the frame instead of a consumer) reds (f1)/(f2); moving the stage
    // provider off the root, or keying the form on the `[data-orientation]` ancestor, reds (f3).
    const problems: string[] = []
    const LEFT = 'probe-f-left'
    const RIGHT = 'probe-f-right'
    const panes: PaneSpec[] = [
      { id: LEFT, zone: 'left', defaultOrder: 0 },
      { id: RIGHT, zone: 'right', defaultOrder: 0 },
    ]
    const layout = rawLayout([
      { id: LEFT, zone: 'left', index: 0, collapsed: false },
      { id: RIGHT, zone: 'right', index: 0, collapsed: true },
    ])

    // ---- (f1) EVERY FRAME RENDERS `pane-in-<its zone>` AND KEEPS ITS AUTHORED CLASSES ---------
    const before = assemble({ panes, layout, stageProbe: true })
    const beforeHtml = renderAssembled(before.envelope)
    const frameReadings: string[] = []
    for (const zone of CLOSED_ZONES) {
      const frame = before.frames.find((candidate) => frameZoneOf(candidate) === zone)
      if (frame === undefined) continue
      const paneId = propText(frame, 'data-pane-id')
      const tag = tagOf(beforeHtml, `pane-${paneId}`)
      const classes = classesOfTag(tag)
      frameReadings.push(`pane-${paneId} (zone ${zone}) → [${classes.join(', ')}]`)
      if (tag === null) {
        problems.push(`(f1) the rendered HTML carries no element \`id="pane-${paneId}"\` — the frame's class list has no subject`)
        continue
      }
      const inherited = `pane-in-${zone}`
      if (!classes.includes(inherited)) {
        problems.push(
          `(f1) the frame for \`${paneId}\` (record zone \`${zone}\`) renders classes [${classes.join(', ')}] with no \`${inherited}\` ` +
            `— §2 C-4/§3 F(f1): each zone CONTAINER authors the \`zone-format\` PROVIDER \`['pane-in-<zone>']\` by position and each ` +
            `frame the CONSUMER (\`target: 'css.classes'\`), so the engine appends the class from the RECORD's \`zone\``,
        )
      }
      const authored = ['pane-frame', ...(classesOf(frame).includes('is-collapsed') ? ['is-collapsed'] : [])]
      for (const token of authored) {
        if (!classes.includes(token)) {
          problems.push(
            `(f1) the frame for \`${paneId}\` LOST its authored \`${token}\` (classes [${classes.join(', ')}]) — §2 C-4 makes the ` +
              `inheritance an APPEND: the frame authors \`pane-frame\` (+ \`is-collapsed\`), and a class WRITE on the consumer ` +
              `would replace the inherited class (D-265)`,
          )
        }
      }
    }
    if (before.frames.length < 2) {
      problems.push(`(f1) the assembled envelope carries ${before.frames.length} frame(s), not the two seeded — the census is blind`)
    }

    // ---- (f2) AFTER `movePane` + REASSEMBLY: THE DESTINATION, AND NOTHING AT THE SOURCE --------
    const moved = movePane(layout, LEFT, 'right', 1)
    const after = assemble({ panes, layout: moved })
    const afterHtml = renderAssembled(after.envelope)
    const movedTag = tagOf(afterHtml, `pane-${LEFT}`)
    const movedClasses = classesOfTag(movedTag)
    if (movedTag === null) {
      problems.push(`(f2) the reassembled HTML carries no element \`id="pane-${LEFT}"\` — the moved frame vanished`)
    } else if (!movedClasses.includes('pane-in-right')) {
      problems.push(
        `(f2) after \`movePane(${LEFT} → right, place 1)\` the frame renders classes [${movedClasses.join(', ')}] with no ` +
          `\`pane-in-right\` — the inherited form follows the RECORD's \`zone\` (§2 C-4/D-265), never the handle's last position`,
      )
    }
    if (movedClasses.includes('pane-in-left')) {
      problems.push(
        `(f2) the moved frame still carries \`pane-in-left\` ([${movedClasses.join(', ')}]) — the form is the record's CURRENT zone`,
      )
    }
    if (afterHtml.includes('pane-in-left')) {
      problems.push(
        `(f2) \`pane-in-left\` still reaches an element in the reassembled HTML — after the only \`left\` pane moves away, the ` +
          `source zone's class must reach NOTHING (§2 C-4: the class comes from the RECORD's zone, not from a leftover ancestry)`,
      )
    }

    // ---- (f3) THE STAGE ARM: THE ROOT'S PROVIDER FOR A CONSUMER WITH NO NEARER ONE -------------
    const root = (before.envelope as { template?: { root?: Record<string, unknown> } } | null | undefined)?.template?.root
    if (root == null) {
      problems.push('(f3) the assembled envelope carries no template root — the stage provider has no address')
    } else {
      const stageHtml = renderEnvelope(root)
      const stageClasses = classesOfTag(tagOf(stageHtml, STAGE_PROBE_ID))
      if (!stageClasses.includes('pane-in-stage')) {
        problems.push(
          `(f3) the stage probe (a \`zone-format\` CONSUMER standing directly under the root) renders classes ` +
            `[${stageClasses.join(', ')}] with no \`pane-in-stage\` — §2 C-4/§3 F(f3): the app ROOT authors the stage provider ` +
            `\`['pane-in-stage']\`, so a pane standing outside the four zones inherits its form from the root by the engine's ` +
            `nearest-first walk`,
        )
      }
      const leaks = before.frames
        .map((frame) => {
          const paneId = propText(frame, 'data-pane-id')
          const classes = classesOfTag(tagOf(beforeHtml, `pane-${paneId}`))
          return { paneId, leaked: classes.includes('pane-in-stage') }
        })
        .filter((reading) => reading.leaked)
      if (leaks.length > 0) {
        problems.push(
          `(f3) ${leaks.length} zone-resident pane(s) carry \`pane-in-stage\` (${leaks.map((leak) => leak.paneId).join(', ')}) — ` +
            `the OUTER provider must never leak past a nearer one (the same nearest-first walk \`E-1\`'s limb C pins)`,
        )
      }
    }

    expect(
      problems,
      `limb F — the form by position (§3 limb F, sub-arms f1…f3; §2 C-4; ASM-U3-5). ${problems.length} problem(s). ` +
        `FRAMES READ: ${frameReadings.join(' | ') || '(none)'}. §2 C-4: each zone container authors the \`zone-format\` ` +
        `PROVIDER \`['pane-in-<zone>']\`, each frame the CONSUMER (\`target: 'css.classes'\`, authoring NO zone-form class of ` +
        `its own), and the app root the STAGE provider \`['pane-in-stage']\`. ` +
        `LAYER: envelope-class — the class strings are the ENGINE's, read out of rendered HTML; the paint, the cascade and ` +
        `the inherited style arriving on the assembled app are \`G8\`-only`,
    ).toEqual([])
  })

  it('G — the figure is the record\'s: the written entry differs in `zone`/`index` alone, and neither the record nor the drag path carries a size', () => {
    // §3 limb G, sub-arms g1/g2. LAYER: (g1) drives the REAL host and diffs the WRITTEN record against
    // the record; (g2) is a SOURCE census (`PaneLayoutEntry`'s members + the drag path's CODE).
    // NON-VACUITY: (g1)'s "differs in zone/index alone" is measured against a record where the diff is
    // NON-EMPTY (the relocation really moved the pane), so a comparison that saw no change cannot pass;
    // (g2)'s "no figure member" is paired with a FLOOR on the member census (the four known members are
    // found), and "no size in the drag path" with a floor on the region's own text.
    // MUTATION THAT WOULD RED IT: persisting any drag-time extent (`width`/`height`/`bounds`) into the
    // pane entry, or passing a size to `setLayout` in the drag path, reds (g1)/(g2).
    const problems: string[] = []
    const A = 'probe-g-a'
    const B = 'probe-g-b'
    const panes: PaneSpec[] = [
      { id: A, zone: 'left', defaultOrder: 0 },
      { id: B, zone: 'right', defaultOrder: 0 },
    ]
    const seed = rawLayout([
      { id: A, zone: 'left', index: 0 },
      { id: B, zone: 'right', index: 0 },
    ])
    const drive = seedHost(seed, panes)
    try {
      drive.host.startPaneDrag(A)
      drive.host.movePaneDrag(POINT_ON['right'], ZONE_BOUNDS)
      drive.host.commitPaneDrop({ paneId: A, zone: 'right' })
      const written = drive.writes[0]
      if (written === undefined) {
        problems.push('(g1) the relocation committed NO record — the differ has no subject')
      } else {
        const record = coerceLayout(seed)
        const beforeEntry = panesOf(record).find((pane) => pane.id === A) as unknown as Record<string, unknown> | undefined
        const afterEntry = panesOf(written).find((pane) => pane.id === A) as unknown as Record<string, unknown> | undefined
        if (beforeEntry === undefined || afterEntry === undefined) {
          problems.push(`(g1) the written record carries no entry for the moved pane "${A}"`)
        } else if (beforeEntry['zone'] === afterEntry['zone'] && beforeEntry['index'] === afterEntry['index']) {
          problems.push(
            `(g1) the written entry is UNCHANGED (${fingerprint(beforeEntry)} → ${fingerprint(afterEntry)}) — the arm's "differs in ` +
              `zone/index alone" has no diff to bound, so the relocation never landed`,
          )
        } else {
          const differing = Object.keys(afterEntry).filter(
            (key) => fingerprint(afterEntry[key]) !== fingerprint(beforeEntry[key]),
          )
          const extra = differing.filter((key) => key !== 'zone' && key !== 'index')
          if (extra.length > 0) {
            problems.push(
              `(g1) the written entry also differs in [${extra.join(', ')}] (${JSON.stringify(beforeEntry)} → ` +
                `${JSON.stringify(afterEntry)}) — §2 C-5/§3 G(g1): the written entry differs from the record's in \`zone\` and ` +
                `\`index\` ALONE (a relocation writes no geometry)`,
            )
          }
        }
      }
    } finally {
      drive.restore()
    }

    // ---- (g2) THE SOURCE CENSUS ---------------------------------------------------------------
    const members = interfaceMembers(readText(LAYOUT_STATE_FILE), 'PaneLayoutEntry')
    if (members === null) {
      problems.push(`(g2) ${LAYOUT_STATE_FILE} carries no readable \`PaneLayoutEntry\` interface — the census has no subject`)
    } else {
      const figureMembers = members.filter((member) => FIGURE_MEMBERS.test(member))
      const known = ['id', 'zone', 'index', 'collapsed']
      const foundKnown = known.filter((member) => members.includes(member))
      if (foundKnown.length < known.length) {
        problems.push(
          `(g2) \`PaneLayoutEntry\` reads members [${members.join(', ')}], not the four ${known.join('/')} — with the census ` +
            `this shallow the "no figure member" reading proves nothing`,
        )
      }
      if (figureMembers.length > 0) {
        problems.push(
          `(g2) \`PaneLayoutEntry\` carries the FIGURE member(s) [${figureMembers.join(', ')}] — §2 C-5/ASM-U3-1: the fork's pane ` +
            `record has no figure member and \`U-3\` may not invent one (the foundation's "declared figure" is graded as ` +
            `"declared form + no geometry write")`,
        )
      }
    }
    const dragCode = dragPathCode()
    problems.push(...dragCode.problems)
    if (dragCode.text !== '') {
      const sizeWrite = /setZoneSize|\.size\s*[=:]|\bsize\s*:/.exec(dragCode.text)
      if (sizeWrite !== null) {
        problems.push(
          `(g2) the drag path's CODE carries a size write \`${sizeWrite[0]}\` — §2 C-5/§3 G(g2): no \`setLayout\` in the drag ` +
            `path receives a size (a relocation writes no geometry)`,
        )
      }
      if (dragCode.text.trim().length < 400) {
        problems.push(`(g2) the drag-path region reads only ${dragCode.text.trim().length} code characters — the census is blind`)
      }
    }

    expect(
      problems,
      `limb G — the figure is the record's (§3 limb G, sub-arms g1…g2; §2 C-5; ASM-U3-1). ${problems.length} problem(s). ` +
        `The pane's fill and extent come from the inherited class (§2 C-4) and its state from \`collapsed\` — the record's ` +
        `declared form, re-read per reassembly (D-251); a relocation writes NO geometry. ASM-U3-1's literal figure is a ` +
        `DOC-GAP and is graded here as "declared form + no geometry write". ` +
        `LAYER: envelope-class — a written-record diff over the REAL host + a SOURCE census; no paint`,
    ).toEqual([])
  })

  it('H — crossing N times: the same record as crossing once, ONE `setLayout`, and no residue `is-revealed`', () => {
    // §3 limb H, sub-arms h1/h2/h3. LAYER: envelope — two REAL hosts driven over the shim; the residue
    // reading is the REAL assembler over the committed record.
    // NON-VACUITY: (h1)'s equality is paired with a CROSSING CENSUS (the crossing host must observe at
    // least two distinct non-empty reveal readings, the single-crossing host at least one), and (h2) is
    // measured on BOTH hosts; (h3)'s "no residue" is paired with a CONTROL assembly that DOES carry
    // `is-revealed` on a revealed zone, so the negative cannot pass blind.
    // MUTATION THAT WOULD RED IT: committing once per threshold crossing (an accumulating write), or
    // leaving the reveal set authored into the committed envelope, reds (h1)/(h2)/(h3).
    const problems: string[] = []
    const A = 'probe-h-a'
    const B = 'probe-h-b'
    const panes: PaneSpec[] = [
      { id: A, zone: 'left', defaultOrder: 0 },
      { id: B, zone: 'right', defaultOrder: 0 },
    ]
    const seed = rawLayout([
      { id: A, zone: 'left', index: 0 },
      { id: B, zone: 'right', index: 0 },
    ])

    const crossingReveals: string[] = []
    const crossing = seedHost(seed, panes)
    let crossingWrites: LayoutState[] = []
    let crossingCalls = 0
    try {
      crossing.host.startPaneDrag(A)
      for (const zone of ['left', 'right', 'top', 'bottom', 'left', 'right'] as Zone[]) {
        crossing.host.movePaneDrag(POINT_ON[zone], ZONE_BOUNDS)
        crossingReveals.push(JSON.stringify([...crossing.host.revealZones()]))
      }
      crossing.host.movePaneDrag(DROP_POINT, ZONE_BOUNDS)
      crossing.host.commitPaneDrop({ paneId: A, zone: 'bottom' })
      crossingWrites = [...crossing.writes]
      crossingCalls = crossing.calls()
    } finally {
      crossing.restore()
    }

    const onceReveals: string[] = []
    const once = seedHost(seed, panes)
    let onceWrites: LayoutState[] = []
    let onceCalls = 0
    try {
      once.host.startPaneDrag(A)
      once.host.movePaneDrag(DROP_POINT, ZONE_BOUNDS)
      onceReveals.push(JSON.stringify([...once.host.revealZones()]))
      once.host.commitPaneDrop({ paneId: A, zone: 'bottom' })
      onceWrites = [...once.writes]
      onceCalls = once.calls()
    } finally {
      once.restore()
    }

    // ---- (h1) THE SAME WHOLE-LAYOUT RECORD ---------------------------------------------------
    const crossingDistinct = new Set(crossingReveals.filter((reading) => reading !== '[]'))
    const onceDistinct = new Set(onceReveals.filter((reading) => reading !== '[]'))
    if (crossingDistinct.size < 2 || onceDistinct.size < 1) {
      problems.push(
        `(h1) the crossing census reads ${crossingDistinct.size} distinct non-empty reveal reading(s) for the N-fold gesture and ` +
          `${onceDistinct.size} for the single one — the gesture did not cross, so "the same record" was never under pressure`,
      )
    }
    if (crossingWrites.length !== 1 || onceWrites.length !== 1) {
      problems.push(
        `(h1) the two gestures committed ${crossingWrites.length} / ${onceWrites.length} record(s), not 1 / 1 — the whole-layout ` +
          `comparison needs exactly ONE committed record each`,
      )
    } else if (fingerprint(crossingWrites[0]) !== fingerprint(onceWrites[0])) {
      problems.push(
        `(h1) crossing the four zones N times and committing at \`bottom\` committed ${fingerprint(crossingWrites[0])} but crossing ` +
          `once committed ${fingerprint(onceWrites[0])} — §2 C-2/§3 H(h1): crossing a boundary N times leaves the tree as if ONCE ` +
          `(D-266)`,
      )
    }

    // ---- (h2) ONE `setLayout` ACROSS THE WHOLE GESTURE ---------------------------------------
    if (crossingCalls !== 1 || onceCalls !== 1) {
      problems.push(
        `(h2) the crossing gesture wrote ${crossingCalls} \`setLayout\`(s) and the single-crossing one ${onceCalls}, not 1 and 1 — ` +
          `§3 H(h2): the reveals are MIRROR-ONLY (\`is-revealed\` on the zone container), so a crossing never reaches the record`,
      )
    }

    // ---- (h3) THE COMMITTED ENVELOPE CARRIES NO RESIDUE `is-revealed` ------------------------
    if (crossingWrites.length === 1) {
      const committed = crossingWrites[0]!
      const residue = assemble({ panes, layout: committed })
      const residueContainers = zoneContainers(residue.envelope)
      if (residueContainers.size !== CLOSED_ZONES.length) {
        problems.push(`(h3) the COMMITTED assembly carries ${residueContainers.size} zone container(s), not four — the residue census is blind`)
      }
      for (const zone of CLOSED_ZONES) {
        const container = residueContainers.get(zone)
        if (container !== undefined && classesOf(container).includes('is-revealed')) {
          problems.push(
            `(h3) the COMMITTED envelope leaves \`is-revealed\` on the \`${zone}\` container — §3 H(h3): the reveal is drag-time ` +
              `mirror state, and the commit must clear it (the controller resets its set silently)`,
          )
        }
      }
      // the CONTROL: the same record assembled WHILE a zone is revealed DOES carry the mirror class
      const revealedControl = assembleAppGraphEnvelope({
        traversalEnvelope: {
          template: { root: { type: 'div', props: { id: 'wiki-root' }, children: [] } },
          content: [],
          clientConfig: { runInstantiation: true, runRendering: true },
        } as never,
        registry: residue.registry,
        ctx: {
          snapshot: null,
          docHeads: null,
          currentDocumentId: null,
          currentNodeId: null,
          backRefs: new Map<string, string[]>(),
          crosslinks: [],
        } as never,
        layout: committed,
        revealedZones: ['left'],
      })
      const revealedLeft = zoneContainers(revealedControl.envelope).get('left')
      if (revealedLeft === undefined || !classesOf(revealedLeft).includes('is-revealed')) {
        problems.push(
          `(h3) the CONTROL assembly (the same record with \`revealedZones: ['left']\`) does not carry \`is-revealed\` on the left ` +
            `container — the "no residue" tooth above cannot fail, so it proves nothing`,
        )
      }
    }

    expect(
      problems,
      `limb H — crossing N times (§3 limb H, sub-arms h1…h3; §2 C-2; ASM-U3-6). ${problems.length} problem(s). ` +
        `§3 H: a gesture crossing the four zones N times and committing at \`Z\` yields the SAME whole-layout record as a gesture ` +
        `crossing to \`Z\` once, ONE \`setLayout\` covers the whole gesture (the reveals are mirror-only), and the committed ` +
        `envelope carries no residue \`is-revealed\` (D-266). ` +
        `LAYER: envelope-class — two REAL hosts' write counts + the REAL assembler over the committed record; no paint`,
    ).toEqual([])
  })
})

/** The zone a WRITTEN layout record places a pane in — read straight off the record (a failure
 *  message's operand), never off the assembler. */
function frameZoneOfInLayout(layout: LayoutState | undefined, paneId: string): string {
  if (layout == null) return ''
  const entry = (Array.isArray(layout.panes) ? layout.panes : []).find((pane) => pane.id === paneId)
  return entry === undefined ? '' : String(entry.zone)
}
