// tests/integration/shell-chrome/pane-update-channel.test.ts — unit `B-3` `pane-update-channel`'s HOST-PAINT rows, authored
// BEFORE any byte of `SidebarPanes.updatePane` / `REPLUMBED_PANE_IDS` / the `events` option (RCA-1: the red set runs first and
// is REPORTED before implementation).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-3-pane-update-channel.md` §3 (the paint seam, in order: the `PaneDefinition` off
// the registry; the LIVE materialized frame `pane-<id>` off `runtime.materializedContentRoots()` with ITS OWN
// `placement.targetPlacement[0]` and `props.collapsed` carrying the placement law into the fresh frame; `def.render(ctx)`; the
// reconcile over THAT pane's root ONLY through `reconcileDocumentRoots`; `runtime.applyContentReconcile` ONLY when
// `replaced.length > 0`) + §1 (`INV-E`: `0 loadAppGraph` / `0 mountOperator` / `0 refresh()`) + §6's rows `r1`, `r2`, `r3`'s
// host arms, `r5`, `r6(i)` and `r6(iii)`.
//
// THE HARNESS IS THE `INV-R` PRECEDENT'S SHAPE, NOT ITS CONTENT
// (`tests/integration/shell-chrome/reveal-without-reassembly.test.ts:369-515`): the REAL `SidebarPanes` over
// `installShim()` from `src/shared/dom-shim.ts`, a RECORDING runtime double attached at `host['runtime']` and then SEEDED
// through the PUBLIC `host.loadAppGraph(double, minimalTraversalEnvelope())`, and the method-wrapping idiom (the
// `setLayout`-wrapper at `:493-499`) applied to the THREE COUNTERS. The seeding is what makes a zero a reading: the host only
// re-assembles when it holds BOTH a runtime and a `lastTraversalEnvelope`, so `r5` drives `host.refresh()` on this very double
// to prove all three counters CAN move before `r1`/`r6` read their zeroes.
//
// WHY THE RECORDING DOUBLE DERIVES ITS OWN ROOT SET: `updatePane` reads `runtime.materializedContentRoots()` to find the LIVE
// frame (§3 step 2), so the double's `loadEnvelope` extracts the content roots from the assembled envelope exactly as
// `Runtime.extractContentRoots` does (`src/renderer/runtime.ts:152-182`, the closed root class) and its
// `applyContentReconcile` performs the whole-root replace (`runtime.ts:535-540`) the managed channel performs. So "every OTHER
// materialized root is the SAME OBJECT" is a reading of a root set the seed really authored, not a list the test wrote.
//
// THE LIMBS, ONE `it` EACH, ONE AGGREGATE `expect(problems, …)` EACH:
//   `r1`  — ONE FIRE PAINTS ONLY THE OWNING PANE, AND THE FRAME'S CARRIERS ARE UNCHANGED. After the host cache moved:
//           `applied === ['pane-gnosis-query']`, the fresh frame's carriers (id / data-pane-id / collapsed / zone / head /
//           grip / collapse-control / body slot) are IDENTICAL, every OTHER materialized root is the SAME OBJECT, and the
//           three counters are 0/0/0. SECOND LIMB (idempotence): a shape-equal re-render applies NOTHING and answers
//           `reason:'unchanged'`.
//   `r2`  — A FIRE FOR X PAINTS NOTHING ON Y, in BOTH directions on one harness (X then Y, Y then X), each with its own
//           positive half.
//   `r3`  — THE HOST ARMS: `not-a-pane` / `not-enabled` / `operator-scope` / `not-mounted` / `no-runtime` each answer their
//           DECLARED WORD, none throws, none paints — with the SAME-harness positive control that the enabled+mounted pane DOES
//           paint. (`r3`'s pure arm — the unregistered/degenerate ids on the channel itself — is
//           `tests/unit/shell-chrome/pane-events.test.ts`; that file has no host and this one has no channel double.)
//   `r5`  — THE FLOOR AND THE CENSUS: `host.refresh()` still reaches `loadAppGraph` + `mountOperator` on this double (so
//           `r1`'s and `r6`'s zeroes are not vacuous), and `REPLUMBED_PANE_IDS` is exactly `['gnosis-query', 'crosslinks']`
//           (the landed census, EXTENDED BY UNIT `B-5` `pane-links` by exactly one id — `docs/L1/unit-b-5-pane-links.md` §4).
//   `r6(i)`+`r6(iii)` — `INV-E`, AND ITS FOUR MUTANTS MEASURED RED FIRST: the DIRECT arm's `0/0/0` on a pane whose root WAS
//           replaced, then m1 `() => host.refresh()`, m2 `() => host.loadAppGraph(…)`, m3 `() => host.mountOperator()` and m4 a
//           no-op handler, each driven through a channel and each printed with its reading.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): every limb here is ENVELOPE-class — the REAL `SidebarPanes` over the LAYOUT-LESS DOM shim
// (`src/shared/dom-shim.ts`: no CSS, no computed style, no layout), against a RECORDING runtime double. The observables are the
// verdict's own fields, the identity of authored nodes, and call counts. What this layer can NEVER read, named so nobody quotes
// it: the assembled-app fact that the frame was RE-MINTED in a real window (the live leg, `docs/L1/unit-b-3-pane-update-channel.md`
// §8 — `#wiki-root`'s `data-node-id` unchanged, every other `.pane-frame[data-pane-id]` still carrying its mark), the pane's
// rendered content, its BOX and its scroll, any computed style, and any pointer. NO limb here asserts a rendered geometry, a
// computed style or a pointer.
//
// NON-VACUITY (mandatory, stated per limb in its own comment): every negative assertion carries a POSITIVE CONTROL beside it —
// and the counters' zeros are floored TWICE: by `r5`'s `host.refresh()` moving all three on the SAME harness shape, and by the
// four mutants in `r6(iii)` each moving one of them. Each limb's comment names WHICH MUTATION WOULD RED IT.
//
// REACHABILITY RULE (this file always COLLECTS and RUNS): `updatePane`, `REPLUMBED_PANE_IDS` and the `events` option DO NOT
// EXIST at this head. Every one of them is reached through `await import()` / a `readExport`-style TYPE check, and its absence
// is a NAMED problem inside the limb's aggregate `expect(problems, …)` — never an ESM link error, never a skip, never a raw
// `TypeError`. The paint is DRIVEN through the seam (`host.updatePane(id)`); nothing here pokes a private field to reach it.
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`, no `vi.mock`; it writes nothing. Every
// path derives from THIS FILE's own location (`ROOT`), so a missing substrate FAILS (ENOENT) instead of skipping.
//
// AND ONE SCOPE IT DOES NOT DRIVE, NAMED RATHER THAN HIDDEN: the host's own `events` subscription is made AT `boot` (§3: "at
// `boot` the host subscribes `REPLUMBED_PANE_IDS`"), and `SidebarPanes.boot` needs the whole IPC bridge (the template, the
// security gate, the snapshot, the doc-heads, three change subscriptions) — so these limbs drive the PAINT SEAM
// (`host.updatePane(id)`), which is the body the boot-time registration fires, and they pass no `events` option to the host. The
// CHANNEL's own dispatch (`fire`, `deliver`, the two declarations, the degenerate ids) is measured where it lives:
// `tests/unit/shell-chrome/pane-events.test.ts` (`r3`, `r4`, `r7`, `r9`) and `tests/integration/shell-chrome/pane-record-arm.test.ts`
// (a real `subscribeRecord` → `deliver()` → the same handler instance the direct `fire` invoked). Neither the boot-time
// registration nor the census it reads is asserted here, and no limb of this file may be quoted for it.
import { describe, it, expect, beforeAll } from 'vitest'
import { fileURLToPath } from 'node:url'

import { installShim, ShimElement } from '../../../src/shared/dom-shim.js'
import { createPaneRegistry } from '../../../src/renderer/pane-registry.js'
import { defaultLayout, type LayoutZoneName, type LayoutState } from '../../../src/renderer/layout-state.js'
import { SidebarPanes } from '../../../src/renderer/sidebar-panes.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))

const SIDEBAR_FILE = 'src/renderer/sidebar-panes.ts'

/** The pane under the unit's ONE re-plumb, and the second enabled app-graph pane `r2` fires for. */
const QUERY = 'gnosis-query'
const OTHER = 'probe-b3-other'
const THIRD = 'probe-b3-third'
const OPERATOR_PANE = 'probe-b3-operator'

const fingerprint = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

/** A value as a failure message prints it. */
const shown = (value: unknown): string => (value === undefined ? '(absent)' : fingerprint(value))

/** `§3`'s CLOSED reason vocabulary — the seven declared words, spelled here because this file is not `src/**`: the row is the
 *  reading of the contract, so the census of words is part of the subject. */
const DECLARED_REASONS: readonly string[] = [
  'painted',
  'unchanged',
  'not-a-pane',
  'not-enabled',
  'operator-scope',
  'not-mounted',
  'no-runtime',
]

beforeAll(() => {
  installShim()
})

// ---------------------------------------------------------------------------
// THE EXPORT READING — non-fatal by design (the `reveal-without-reassembly` reachability rule): a missing member is a NAMED
// problem inside the limb's aggregate assertion, never a module-load error and never a raw `TypeError`.
// ---------------------------------------------------------------------------
interface ExportReading {
  value: unknown
  problems: string[]
}

function readMember(holder: unknown, name: string, where: string, limb: string): ExportReading {
  if (holder === null || (typeof holder !== 'object' && typeof holder !== 'function')) {
    return {
      value: undefined,
      problems: [`limb ${limb}: ${where} is not an object (${shown(holder)}) — \`${name}\` has no holder, so the limb has no subject`],
    }
  }
  let value: unknown
  try {
    value = (holder as Record<string, unknown>)[name]
  } catch (error) {
    return { value: undefined, problems: [`limb ${limb}: reading \`${name}\` off ${where} THREW (${String(error)})`] }
  }
  if (typeof value !== 'function') {
    return {
      value,
      problems: [
        `limb ${limb}: \`${name}\` is NOT a function on ${where} (typeof read: ${typeof value}) — the seam this limb drives does ` +
          `not exist at this head (§3 adds it: \`SidebarPanes.updatePane(paneId): PaneUpdateVerdict\`), so the limb's subject is ` +
          `ABSENT (no arm below is skipped: every one reports the absence)`,
      ],
    }
  }
  return { value, problems: [] }
}

// ---------------------------------------------------------------------------
// THE CONTENT-ROOT READING — the Runtime's OWN closed class, re-spelled here because the double IS the root-set owner
// (`src/renderer/runtime.ts:152-182`). A node is a content root iff its authored `props.id` is a `rag-<id>`, a `pane-<id>`, or
// one of the four pinned pane-like ids.
// ---------------------------------------------------------------------------
const PINNED_ROOT_IDS: readonly string[] = ['editor-toolbar', 'page-edit-surface', 'page-commit-warning', 'stage-landing']

const cssIdOf = (node: unknown): string | null => {
  const id = (node as { props?: { id?: unknown } } | null | undefined)?.props?.id
  return typeof id === 'string' ? id : null
}

function contentRootsOf(envelope: unknown): unknown[] {
  const out: unknown[] = []
  const payloads = (envelope as { content?: unknown } | null | undefined)?.content
  if (!Array.isArray(payloads)) return out
  for (const payload of payloads) {
    const nodes = (payload as { content?: unknown } | null | undefined)?.content
    if (!Array.isArray(nodes)) continue
    for (const node of nodes) {
      const id = cssIdOf(node)
      if (id === null) continue
      if ((id.startsWith('rag-') && id.length > 4) || (id.startsWith('pane-') && id.length > 5) || PINNED_ROOT_IDS.includes(id)) {
        out.push(node)
      }
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// THE CARRIER READING — `r1`'s "the frame's identity carriers are unchanged" (§3's cost note: the frame root is REPLACED
// WHOLE, so "frame identity" is the CARRIERS, never the element instance). The SLOT is the body node that holds the pane's
// render root — its id, its classes and the fact that it still carries exactly one child.
// ---------------------------------------------------------------------------
interface Carriers {
  id: string | null
  dataPaneId: string | null
  collapsed: string | null
  zone: string | null
  headId: string | null
  gripId: string | null
  collapseControlId: string | null
  slotId: string | null
  slotClasses: string[]
  slotChildCount: number
  frameClasses: string[]
}

const childAt = (node: unknown, index: number): Record<string, unknown> | null => {
  const children = (node as { children?: unknown } | null | undefined)?.children
  if (!Array.isArray(children)) return null
  const child = children[index]
  return child !== null && typeof child === 'object' ? (child as Record<string, unknown>) : null
}

function carriersOf(node: unknown): Carriers {
  const read = (node ?? {}) as Record<string, unknown>
  const props = (read['props'] ?? {}) as Record<string, unknown>
  const placement = (read['placement'] ?? {}) as Record<string, unknown>
  const targets = placement['targetPlacement']
  const head = childAt(node, 0)
  const headChildren = (head?.['children'] ?? []) as unknown[]
  const grip = headChildren.length > 0 ? (headChildren[0] as Record<string, unknown>) : null
  const control = headChildren.length > 1 ? (headChildren[1] as Record<string, unknown>) : null
  const body = childAt(node, 1)
  const bodyChildren = (body?.['children'] ?? []) as unknown[]
  const classesOf = (holder: Record<string, unknown> | null): string[] => {
    const css = (holder?.['css'] ?? {}) as Record<string, unknown>
    const classes = css['classes']
    return Array.isArray(classes) ? classes.map(String) : []
  }
  return {
    id: typeof props['id'] === 'string' ? (props['id'] as string) : null,
    dataPaneId: typeof props['data-pane-id'] === 'string' ? (props['data-pane-id'] as string) : null,
    collapsed: typeof props['collapsed'] === 'string' ? (props['collapsed'] as string) : null,
    zone: Array.isArray(targets) && targets.length > 0 ? String(targets[0]) : null,
    headId: typeof head?.['props'] === 'object' ? String(((head?.['props'] ?? {}) as Record<string, unknown>)['id'] ?? null) : null,
    gripId:
      grip !== null && typeof grip['props'] === 'object'
        ? String(((grip['props'] ?? {}) as Record<string, unknown>)['id'] ?? null)
        : null,
    collapseControlId:
      control !== null && typeof control['props'] === 'object'
        ? String(((control['props'] ?? {}) as Record<string, unknown>)['id'] ?? null)
        : null,
    slotId:
      body !== null && typeof body['props'] === 'object'
        ? String(((body['props'] ?? {}) as Record<string, unknown>)['id'] ?? null)
        : null,
    slotClasses: classesOf(body),
    slotChildCount: bodyChildren.length,
    frameClasses: classesOf(read),
  }
}

// ---------------------------------------------------------------------------
// THE LAYOUT BUILDER — ABSENCE-PRESERVING on the `index` member (a pane with no stated index carries NO `index` key), and the
// zone `collapsed` is stated explicitly for the zones a limb uses, so `zoneCollapsedOf`'s derivation cannot fold a zone away.
// ---------------------------------------------------------------------------
type Zone = LayoutZoneName

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

/** The traversal envelope every seed assembles: ONE `rag-` document root (so "every other root is the same object" has a
 *  NON-pane subject too) and no zone container pre-authored (the assembler authors all four). */
function minimalTraversalEnvelope(): Record<string, unknown> {
  return {
    template: { root: { type: 'div', props: { id: 'wiki-root' }, children: [] } },
    content: [{ content: [{ type: 'div', props: { id: 'rag-doc-probe' }, children: [] }] }],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

// ---------------------------------------------------------------------------
// THE RECORDING RUNTIME DOUBLE — `loadEnvelope` seeds the materialized root set (exactly the Runtime's own closed class),
// `materializedContentRoots()` answers it (the paint's step 2), and `applyContentReconcile` records the call and performs the
// channel's whole-root replace (the paint's step 5). `applyCommand` is a NEGATIVE reader only.
// ---------------------------------------------------------------------------
interface RuntimeDouble {
  double: Record<string, unknown>
  readonly envelopes: unknown[]
  readonly applies: Array<Record<string, unknown>>
  roots: () => unknown[]
  reset: () => void
}

function recordingRuntime(): RuntimeDouble {
  const envelopes: unknown[] = []
  const applies: Array<Record<string, unknown>> = []
  const roots: unknown[] = []
  const double: Record<string, unknown> = {
    loadEnvelope: (envelope: unknown): void => {
      envelopes.push(envelope)
      roots.length = 0
      roots.push(...contentRootsOf(envelope))
    },
    materializedContentRoots: (): unknown[] => [...roots],
    materializedDocumentRoots: (): unknown[] => roots.map((root) => ({ documentId: '', root })),
    applyContentReconcile: (input: unknown): Record<string, unknown> => {
      const read = (input ?? {}) as Record<string, unknown>
      applies.push(read)
      // THE WHOLE-ROOT REPLACE the managed channel performs (`runtime.ts:535-540`): every `replaced` bucket entry's LIVE root
      // is swapped for the fresh one the reconcile considered, and NOTHING else moves — which is what makes the "every other
      // root is the SAME OBJECT" reading a reading of this channel and not of the harness.
      const fresh = contentRootsOf(read['next'])
      const byId = new Map<string, unknown>()
      for (const node of fresh) {
        const id = cssIdOf(node)
        if (id !== null) byId.set(id, node)
      }
      const replaced = (read['result'] as { replaced?: unknown } | undefined)?.replaced
      const applied: string[] = []
      if (Array.isArray(replaced)) {
        for (const entry of replaced) {
          const cssId = typeof (entry as { cssId?: unknown })?.cssId === 'string' ? String((entry as { cssId: string }).cssId) : null
          if (cssId === null) continue
          const next = byId.get(cssId)
          const at = roots.findIndex((root) => cssIdOf(root) === cssId)
          if (next !== undefined && at >= 0) roots[at] = next
          applied.push(cssId)
        }
      }
      return { applied, warnings: [] }
    },
    applyCommand: (): void => undefined,
    nodeState: (): { states: unknown[] } => ({ states: [] }),
    renderedHtmlResult: (): { renderedHtml: string } => ({ renderedHtml: '' }),
  }
  return { double, envelopes, applies, roots: () => [...roots], reset: () => undefined }
}

// ---------------------------------------------------------------------------
// THE HOST DRIVE — the REAL `SidebarPanes` over the shim, seeded through the PUBLIC `loadAppGraph`, with the three counters
// wrapped on the INSTANCE (the `reveal-without-reassembly` `setLayout`-wrapper idiom, `:493-499`) and THREE bypass-proof
// secondary readings beside them, so a zero can never be a dead counter:
//   · `settingsGets`  — `bridge.operatorSettings.get()`, reached by `refresh()` and by nothing else in this harness (boot is
//                       never called), so it is the re-fetch that ONLY `refresh()` performs;
//   · `loadEnvelopes` — `runtime.loadEnvelope`, reached by every re-assembly whatever route it takes;
//   · `operatorRenders` — the operator pane's own `render(ctx)`, which `mountOperator` → `buildOperatorEnvelope` calls on EVERY
//                       mount (so a mount that bypassed the wrapped method would still move it).
// ---------------------------------------------------------------------------
interface PaneSpec {
  id: string
  zone: Zone
  title?: string
  defaultOrder?: number
  enabled?: boolean
  scope?: 'app-graph' | 'operator'
}

interface Counters {
  refresh: number
  loadAppGraph: number
  mountOperator: number
  settingsGets: number
  loadEnvelopes: number
  operatorRenders: number
  applies: number
}

interface HostDrive {
  host: SidebarPanes
  registry: ReturnType<typeof createPaneRegistry>
  seed: LayoutState
  /** The SAME `Map` instance the host holds (`SidebarPanesOptions.backRefs`) — the pane render reads `ctx.backRefs`, so a
   *  mutation here IS a change of the host's own cache and nothing else moves. */
  backRefs: Map<string, string[]>
  runtime: RuntimeDouble | null
  counters: () => Counters
  resetCounters: () => void
  roots: () => unknown[]
  applies: () => Array<Record<string, unknown>>
  /** The `applied` list the managed channel ANSWERED, call by call — the channel's own report, never the input's intent. The
   *  `r6(iii)` mutant readings print it, so a mutant's "applied" is a computed value and never an authored string. */
  applyAnswers: () => string[][]
  restore: () => void
}

function seedHost(seed: LayoutState, panes: readonly PaneSpec[], options?: { runtime?: boolean }): HostDrive {
  installShim()
  const globals = globalThis as Record<string, unknown>
  const previousWindow = globals['window']
  globals['window'] = { provident: {} }

  const counters: Counters = {
    refresh: 0,
    loadAppGraph: 0,
    mountOperator: 0,
    settingsGets: 0,
    loadEnvelopes: 0,
    operatorRenders: 0,
    applies: 0,
  }

  const registry = createPaneRegistry()
  // THE OPERATOR PANE: registered + enabled so `buildOperatorEnvelope` calls its `render` on EVERY `mountOperator` — the
  // bypass-proof `mountOperator` reading — and so `r3` has a real `operator`-scope pane to ask about.
  registry.register({
    id: OPERATOR_PANE,
    title: 'B-3 probe operator pane',
    scope: 'operator',
    render: () => {
      counters.operatorRenders += 1
      return { type: 'section', props: { id: `${OPERATOR_PANE}-render-root` } }
    },
  } as never)
  registry.enable(OPERATOR_PANE)

  for (const pane of panes) {
    registry.register({
      id: pane.id,
      title: pane.title ?? pane.id,
      scope: pane.scope ?? 'app-graph',
      defaultZone: pane.zone,
      ...(typeof pane.defaultOrder === 'number' ? { defaultOrder: pane.defaultOrder } : {}),
      // THE PANE'S CONTENT READS THE HOST'S OWN CACHE (`buildContext().backRefs`), so a mutation of the map below is a change
      // of what `def.render(ctx)` authors — the "the pane's host cache changed" precondition of `r1`/`r6`, through a public
      // seam and no private poke.
      render: (ctx: { backRefs?: Map<string, string[]> }) => ({
        type: 'div',
        props: { id: `${pane.id}-render-root`, 'data-cache-size': String(ctx?.backRefs?.size ?? -1) },
        children: [{ type: 'p', content: `cache ${ctx?.backRefs?.size ?? -1}` }],
      }),
    } as never)
    if (pane.enabled !== false) registry.enable(pane.id)
  }

  const backRefs = new Map<string, string[]>()
  const bridge = {
    operatorSettings: {
      set: async (patch: unknown): Promise<unknown> => patch,
      get: async (): Promise<Record<string, unknown>> => {
        counters.settingsGets += 1
        return {}
      },
    },
  }
  const host = new SidebarPanes({
    mount: new ShimElement('div') as never,
    operatorMount: new ShimElement('div') as never,
    registry,
    bridge,
    backRefs,
    // the drag path's re-derive guard: no dirty edit (so a re-assemble is not skipped for the wrong reason)
    editController: { anyDirty: () => false },
  } as never)
  globals['window'] = { provident: {} }
  // The seed write is NOT a gesture.
  host.setLayout(seed)

  // THE RECORDING RUNTIME DOUBLE: attached at `host['runtime']` and then SEEDED through the PUBLIC `loadAppGraph` — the host
  // only re-assembles when it holds BOTH a runtime and a `lastTraversalEnvelope`, so attaching alone would make every zero
  // vacuous.
  let runtime: RuntimeDouble | null = null
  const applyAnswers: string[][] = []
  if (options?.runtime !== false) {
    runtime = recordingRuntime()
    const attached = runtime
    ;(host as unknown as Record<string, unknown>)['runtime'] = attached.double
    const realLoadEnvelope = attached.double['loadEnvelope'] as (envelope: unknown) => void
    attached.double['loadEnvelope'] = (envelope: unknown): void => {
      counters.loadEnvelopes += 1
      realLoadEnvelope(envelope)
    }
    const realApply = attached.double['applyContentReconcile'] as (input: unknown) => unknown
    attached.double['applyContentReconcile'] = (input: unknown): unknown => {
      counters.applies += 1
      const report = realApply(input)
      const answered = (report as { applied?: unknown } | null | undefined)?.applied
      applyAnswers.push(Array.isArray(answered) ? answered.filter((id): id is string => typeof id === 'string') : [])
      return report
    }
    host.loadAppGraph(attached.double as never, minimalTraversalEnvelope() as never)
  }

  // THE THREE COUNTERS, wrapped on the INSTANCE (the precedent's `setLayout` idiom). An instance own-property SHADOWS the
  // prototype method, so the class's OWN `this.loadAppGraph(...)`/`this.mountOperator()` calls are counted too — the `r5`
  // floor and the `r6(iii)` mutants are what prove it.
  const realRefresh = host.refresh.bind(host)
  ;(host as unknown as Record<string, unknown>)['refresh'] = (...args: unknown[]): unknown => {
    counters.refresh += 1
    return (realRefresh as (...next: unknown[]) => unknown)(...args)
  }
  const realLoadAppGraph = host.loadAppGraph.bind(host)
  ;(host as unknown as Record<string, unknown>)['loadAppGraph'] = (...args: unknown[]): unknown => {
    counters.loadAppGraph += 1
    return (realLoadAppGraph as (...next: unknown[]) => unknown)(...args)
  }
  const realMountOperator = host.mountOperator.bind(host)
  ;(host as unknown as Record<string, unknown>)['mountOperator'] = (...args: unknown[]): unknown => {
    counters.mountOperator += 1
    return (realMountOperator as (...next: unknown[]) => unknown)(...args)
  }

  return {
    host,
    registry,
    seed,
    backRefs,
    runtime,
    counters: () => ({ ...counters }),
    resetCounters: () => {
      counters.refresh = 0
      counters.loadAppGraph = 0
      counters.mountOperator = 0
      counters.settingsGets = 0
      counters.loadEnvelopes = 0
      counters.operatorRenders = 0
      counters.applies = 0
    },
    roots: () => (runtime === null ? [] : runtime.roots()),
    applies: () => (runtime === null ? [] : runtime.applies),
    applyAnswers: () => applyAnswers.map((ids) => [...ids]),
    restore: () => {
      delete (host as unknown as Record<string, unknown>)['refresh']
      delete (host as unknown as Record<string, unknown>)['loadAppGraph']
      delete (host as unknown as Record<string, unknown>)['mountOperator']
      delete (host as unknown as Record<string, unknown>)['runtime']
      globals['window'] = previousWindow
    },
  }
}

/** The three counters as ONE readable string, for every failure message and for `r6(iii)`'s printed readings. */
const countersReading = (counters: Counters): string =>
  `refresh=${counters.refresh} loadAppGraph=${counters.loadAppGraph} mountOperator=${counters.mountOperator}` +
  ` (secondary: operatorSettings.get=${counters.settingsGets} loadEnvelope=${counters.loadEnvelopes}` +
  ` operatorRender=${counters.operatorRenders} applyContentReconcile=${counters.applies})`

interface VerdictReading {
  verdict: Record<string, unknown> | null
  threw: string
  problems: string[]
}

/** Drive the ONE paint through the public seam. A missing seam, a throw and a non-object answer are all NAMED problems — the
 *  paint is total by §3 ("Every absent arm is a DECLARED word, never a throw"). */
function driveUpdatePane(drive: HostDrive, paneId: string, limb: string): VerdictReading {
  const member = readMember(drive.host, 'updatePane', `the REAL \`SidebarPanes\` instance (${SIDEBAR_FILE})`, limb)
  if (typeof member.value !== 'function') return { verdict: null, threw: '', problems: member.problems }
  let answer: unknown
  try {
    answer = (member.value as (id: string) => unknown).call(drive.host, paneId)
  } catch (error) {
    return {
      verdict: null,
      threw: String(error),
      problems: [
        `limb ${limb}: \`updatePane('${paneId}')\` THREW (${String(error)}) — §3: every absent arm is a DECLARED word, never a throw ` +
          `and never a fallback to a re-assembly`,
      ],
    }
  }
  if (answer === null || typeof answer !== 'object') {
    return {
      verdict: null,
      threw: '',
      problems: [`limb ${limb}: \`updatePane('${paneId}')\` answered ${shown(answer)}, not a \`PaneUpdateVerdict\``],
    }
  }
  const verdict = answer as Record<string, unknown>
  const problems: string[] = []
  if (verdict['paneId'] !== paneId) {
    problems.push(`limb ${limb}: the verdict for \`${paneId}\` echoes \`paneId\` = ${shown(verdict['paneId'])} — §3's verdict is \`{paneId, painted, reason, applied}\``)
  }
  if (typeof verdict['painted'] !== 'boolean') {
    problems.push(`limb ${limb}: the verdict for \`${paneId}\` carries \`painted\` = ${shown(verdict['painted'])}, not a boolean`)
  }
  if (!DECLARED_REASONS.includes(String(verdict['reason']))) {
    problems.push(
      `limb ${limb}: the verdict for \`${paneId}\` answered \`reason\` = ${shown(verdict['reason'])}, which is NOT one of §3's seven ` +
        `declared words [${DECLARED_REASONS.join(', ')}] — a pane update's refusal is a word, never an invented one`,
    )
  }
  if (!Array.isArray(verdict['applied'])) {
    problems.push(`limb ${limb}: the verdict for \`${paneId}\` carries \`applied\` = ${shown(verdict['applied'])}, not a string[]`)
  }
  return { verdict, threw: '', problems }
}

/** The root whose authored id is `cssId`, as the double currently holds it. */
const rootById = (roots: readonly unknown[], cssId: string): unknown => roots.find((root) => cssIdOf(root) === cssId)

/** The ids of every materialized root, in the double's own order — the "every OTHER root" census. */
const rootIds = (roots: readonly unknown[]): string[] => roots.map((root) => cssIdOf(root) ?? '(nonesuch)')

/** Assert every root whose id is not `excepted` is the SAME OBJECT it was in `before`. */
function otherRootsProblems(before: readonly unknown[], after: readonly unknown[], excepted: readonly string[], limb: string): string[] {
  const problems: string[] = []
  for (const root of before) {
    const id = cssIdOf(root)
    if (id === null || excepted.includes(id)) continue
    const now = rootById(after, id)
    if (now === undefined) {
      problems.push(`limb ${limb}: the root \`${id}\` VANISHED from the materialized set across the paint (before ${rootIds(before).join(', ')}, after ${rootIds(after).join(', ')}) — a pane update touches ONE pane's root and no other`)
      continue
    }
    if (now !== root) {
      problems.push(
        `limb ${limb}: the root \`${id}\` was RE-MINTED across the paint (identity, not equality: the object changed) — §3's paint ` +
          `reconciles THAT pane's root ONLY, so every other materialized root must be the SAME OBJECT`,
      )
    }
  }
  return problems
}

/** The fresh frame the paint handed the runtime, off the recorded `applyContentReconcile` call (never off a private field). */
function appliedFrameOf(applies: ReadonlyArray<Record<string, unknown>>, cssId: string): unknown {
  for (const input of applies) {
    const fresh = contentRootsOf(input['next'])
    const found = rootById(fresh, cssId)
    if (found !== undefined) return found
  }
  return undefined
}

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

/** The four panes every limb seeds: the unit's re-plumbed pane, a second and a third app-graph pane (so "every other root"
 *  has app-graph subjects), and an operator pane registered by the harness itself. */
const SEED_PANES: readonly PaneSpec[] = [
  { id: QUERY, zone: 'left', defaultOrder: 0 },
  { id: OTHER, zone: 'left', defaultOrder: 1 },
  { id: THIRD, zone: 'right', defaultOrder: 0 },
]

const SEED_LAYOUT = (): LayoutState =>
  rawLayout(
    [
      { id: QUERY, zone: 'left', index: 0 },
      { id: OTHER, zone: 'left', index: 1 },
      { id: THIRD, zone: 'right', index: 0 },
    ],
    { left: { collapsed: false }, right: { collapsed: false } },
  )

/** The cache change `r1`/`r6` drive: one new entry in the host's OWN `backRefs` map, which is what every pane's render reads. */
const moveHostCache = (drive: HostDrive): void => {
  drive.backRefs.set('probe-b3-cache-marker', ['probe-b3-cache-owner'])
}

// ---------------------------------------------------------------------------
// LIMBS
// ---------------------------------------------------------------------------
describe('pane-update-channel — the host paint over the REAL SidebarPanes: one pane, one root, the declared absent arms, INV-E and its mutants', () => {
  it('r1 — ONE fire paints ONLY the owning pane: one root applied, the carriers/zone/slot identical, every other root the SAME OBJECT, 0/0/0 — and a shape-equal re-render applies NOTHING', () => {
    // §6 r1 (§3's paint in order, `INV-E`). LAYER: envelope-class — the REAL `SidebarPanes` over the LAYOUT-LESS DOM shim, the
    // observable being the authored frame's CARRIERS and the identity of authored nodes (no CSS, no box, no pointer exists in
    // this shim). NON-VACUITY: the "one root applied" arm is paired with the PRE-PAINT root census (three panes + one `rag-`
    // document root, asserted non-empty and non-singleton), with the assertion that the query frame was genuinely REPLACED
    // (a different object), and with the content change actually visible in the fresh frame — so a paint that does nothing
    // cannot satisfy `applied === ['pane-gnosis-query']` and a paint that replaces nothing cannot satisfy the identity arms.
    // The idempotence limb is paired with the FIRST limb's own apply (the counter moves once, then not at all).
    // MUTATION THAT WOULD RED IT: applying the whole assembled envelope (or a document root) instead of that pane's root reds
    // the `applied` census and the identity arm; re-authoring the frame from the layout overlay instead of continuing the LIVE
    // frame's zone/collapsed reds the carrier arm; reaching `refresh()`/`loadAppGraph`/`mountOperator` reds the counter arm;
    // applying unconditionally (ignoring `replaced.length`) reds the idempotence limb.
    const problems: string[] = []
    const drive = seedHost(SEED_LAYOUT(), SEED_PANES)
    try {
      // ---- THE PRE-PAINT CENSUS (the harness's own floor) --------------------------------------
      const before = drive.roots()
      const beforeIds = rootIds(before)
      if (beforeIds.length < 2) {
        problems.push(
          `limb r1: the SEED materialized only ${beforeIds.length} content root(s) [${beforeIds.join(', ')}] — "one root applied and ` +
            `every OTHER root the same object" needs at least a second root to be a reading`,
        )
      }
      const liveQuery = rootById(before, `pane-${QUERY}`)
      if (liveQuery === undefined) {
        problems.push(
          `limb r1: the seed carries NO live frame \`pane-${QUERY}\` (roots read: [${beforeIds.join(', ')}]) — §3's paint reads the ` +
            `LIVE materialized frame for its zone/collapsed, so the paint has no subject`,
        )
      }
      const otherPaneLive = rootById(before, `pane-${OTHER}`)
      if (otherPaneLive === undefined) {
        problems.push(`limb r1: the seed carries no second app-graph pane frame \`pane-${OTHER}\` — the "other roots" arm has one subject fewer`)
      }

      // ---- THE CACHE MOVES, THEN ONE PAINT ----------------------------------------------------
      const cacheBefore = drive.backRefs.size
      moveHostCache(drive)
      const cacheAfter = drive.backRefs.size
      if (cacheAfter === cacheBefore) {
        problems.push('limb r1: the harness failed to move the host cache — the paint would have nothing to re-render')
      }
      drive.resetCounters()
      const reading = driveUpdatePane(drive, QUERY, 'r1')
      problems.push(...reading.problems)
      if (reading.verdict !== null) {
        const verdict = reading.verdict
        if (verdict['painted'] !== true) {
          problems.push(
            `limb r1: \`updatePane('${QUERY}')\` answered \`painted\` = ${shown(verdict['painted'])} (reason ` +
              `${shown(verdict['reason'])}) after the host cache moved — the enabled+mounted pane IS the arm that paints`,
          )
        }
        if (verdict['reason'] !== 'painted') {
          problems.push(`limb r1: the verdict's \`reason\` reads ${shown(verdict['reason'])}, not the declared word \`'painted'\``)
        }
        if (fingerprint(verdict['applied']) !== fingerprint([`pane-${QUERY}`])) {
          problems.push(
            `limb r1: the verdict's \`applied\` reads ${shown(verdict['applied'])}, not exactly \`['pane-${QUERY}']\` — §3's reconcile ` +
              `is over THAT PANE'S ROOT ONLY, so exactly ONE root may be applied and it must be the pane's own`,
          )
        }
      }

      // ---- THE FRESH FRAME'S CARRIERS ---------------------------------------------------------
      const freshQuery = appliedFrameOf(drive.applies(), `pane-${QUERY}`)
      if (freshQuery === undefined) {
        problems.push(
          `limb r1: the paint never handed the runtime a fresh \`pane-${QUERY}\` frame (applyContentReconcile calls recorded: ` +
            `${drive.applies().length}) — §3 step 5 applies the reconcile's \`next\` envelope`,
        )
      } else if (liveQuery !== undefined) {
        const beforeCarriers = carriersOf(liveQuery)
        const afterCarriers = carriersOf(freshQuery)
        if (fingerprint(beforeCarriers) !== fingerprint(afterCarriers)) {
          problems.push(
            `limb r1: the fresh frame's CARRIERS/zone/slot differ from the live frame's (live ${shown(beforeCarriers)} vs fresh ` +
              `${shown(afterCarriers)}) — §3 step 2 continues the LIVE frame's \`placement.targetPlacement[0]\` and \`props.collapsed\` ` +
              `(ASM-B3-3), and the frame's identity carriers (\`id\`, \`data-pane-id\`, the head/grip/control ids, the body slot) are ` +
              `never re-derived by a content update`,
          )
        }
        // THE SLOT'S OWN CHILD is the pane's render root — `def.render(ctx)`'s answer, one level inside the body node.
        const freshBody = childAt(freshQuery, 1)
        const freshRenderRoot = freshBody === null ? null : childAt(freshBody, 0)
        const freshSize = ((freshRenderRoot?.['props'] ?? {}) as Record<string, unknown>)['data-cache-size']
        if (String(freshSize) !== String(cacheAfter)) {
          problems.push(
            `limb r1: the fresh frame's own content reads \`data-cache-size\` = ${shown(freshSize)} while the host cache holds ` +
              `${cacheAfter} — the paint did not re-render through \`buildTemplateContext()\`, so "the content changed" is unreadable`,
          )
        }
      }

      // ---- EVERY OTHER ROOT IS THE SAME OBJECT ------------------------------------------------
      const after = drive.roots()
      problems.push(...otherRootsProblems(before, after, [`pane-${QUERY}`], 'r1'))
      if (otherPaneLive !== undefined && after.includes(otherPaneLive) === false && rootById(after, `pane-${OTHER}`) === otherPaneLive) {
        problems.push('limb r1: the harness reading of "the same object" is inconsistent — a root present by identity was reported absent')
      }
      const queryAfter = rootById(after, `pane-${QUERY}`)
      if (liveQuery !== undefined && queryAfter === liveQuery) {
        problems.push(
          `limb r1: the OWNING pane's root is the SAME OBJECT after a paint that changed its content — the managed channel REPLACES ` +
            `the root whole (§3 step 5, \`runtime.ts:535-540\`), so the pane's own frame must be the NEW object`,
        )
      }

      // ---- INV-E: THE THREE COUNTERS ----------------------------------------------------------
      const painted = drive.counters()
      if (painted.refresh !== 0 || painted.loadAppGraph !== 0 || painted.mountOperator !== 0) {
        problems.push(
          `limb r1: the paint read ${countersReading(painted)} — INV-E pins EVERY one of the three at ZERO on a pane update ` +
            `(§1/§3: no \`loadAppGraph\`, no \`mountOperator\`, no \`refresh()\`)`,
        )
      }
      if (painted.applies !== 1) {
        problems.push(`limb r1: the paint called \`applyContentReconcile\` ${painted.applies} time(s), not EXACTLY ONCE (§3 steps 4-5)`)
      }

      // ---- THE IDEMPOTENCE LIMB: a shape-equal re-render applies NOTHING ----------------------
      const beforeSecond = drive.roots()
      drive.resetCounters()
      const second = driveUpdatePane(drive, QUERY, 'r1·idempotence')
      problems.push(...second.problems)
      if (second.verdict !== null) {
        if (second.verdict['reason'] !== 'unchanged') {
          problems.push(
            `limb r1 (idempotence): a re-render over an UNCHANGED host cache answered \`reason\` = ${shown(second.verdict['reason'])} ` +
              `(applied ${shown(second.verdict['applied'])}), not \`'unchanged'\` — §3 step 5 applies ONLY when \`replaced.length > 0\` ` +
              `and a shape-equal re-render replaces nothing`,
          )
        }
        if (second.verdict['painted'] !== false) {
          problems.push(`limb r1 (idempotence): the shape-equal re-render answered \`painted\` = ${shown(second.verdict['painted'])}, not \`false\``)
        }
        if (fingerprint(second.verdict['applied']) !== fingerprint([])) {
          problems.push(`limb r1 (idempotence): the shape-equal re-render applied ${shown(second.verdict['applied'])}, not \`[]\``)
        }
      }
      const idle = drive.counters()
      if (idle.applies !== 0) {
        problems.push(
          `limb r1 (idempotence): a shape-equal re-render called \`applyContentReconcile\` ${idle.applies} time(s) — nothing was ` +
            `replaced, so nothing may be applied (the FIRST limb's one apply is the control that the counter moves)`,
        )
      }
      if (idle.refresh !== 0 || idle.loadAppGraph !== 0 || idle.mountOperator !== 0) {
        problems.push(`limb r1 (idempotence): the shape-equal re-render read ${countersReading(idle)} — and INV-E still holds at zero`)
      }
      const afterSecond = drive.roots()
      problems.push(...otherRootsProblems(beforeSecond, afterSecond, [], 'r1·idempotence'))
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb r1 — a fire paints only the owning pane and the frame's identity carriers are unchanged (§6 r1; §3's five steps; ` +
        `INV-E). ${problems.length} problem(s). ONE \`updatePane('${QUERY}')\` after the host cache moved must apply exactly the ` +
        `pane's own root through \`Runtime.applyContentReconcile\`, author the fresh frame from the LIVE frame's zone/collapsed, ` +
        `leave every other materialized root the SAME OBJECT, and move none of the three counters; a shape-equal re-render applies ` +
        `nothing. envelope-class — the REAL SidebarPanes over the layout-less DOM shim with a recording runtime double; no rendered ` +
        `box, no computed style, no pointer (G8-only)`,
    ).toEqual([])
  })

  it('r2 — a fire for X paints NOTHING on Y: the owning pane is applied alone and the other pane’s root is untouched, in BOTH directions', () => {
    // §6 r2. LAYER: envelope-class — the REAL host over the shim; the observables are `applied` and node identity.
    // NON-VACUITY: each direction carries the OTHER direction's positive half on the SAME harness — firing `OTHER` must apply
    // `pane-probe-b3-other` (so "nothing was applied for the query pane" is not a dead path), and the reverse. The pre-paint
    // cache is moved before EACH fire, so a paint that skipped re-rendering would red the "the root really changed" arm.
    // AND THE "FIRE" IS READ AT THE SEAM: the subject here is `host.updatePane(paneId)` — the body the host's boot-time channel
    // registration fires (§3) — because `boot` is not driven in this file (the header names that scope). The channel's own
    // `fire`/`deliver` dispatch is measured in `tests/unit/shell-chrome/pane-events.test.ts` and, end to end through a real
    // handler instance, in `tests/integration/shell-chrome/pane-record-arm.test.ts`.
    // MUTATION THAT WOULD RED IT: a paint that reconciles the whole assembled envelope (or the enabled census) instead of the
    // one pane reds the `applied` census; a paint that caches the first pane's frame and reuses it reds the cross-object arm.
    const problems: string[] = []
    const drive = seedHost(SEED_LAYOUT(), SEED_PANES)
    try {
      const before = drive.roots()
      const queryBefore = rootById(before, `pane-${QUERY}`)
      const otherBefore = rootById(before, `pane-${OTHER}`)
      if (queryBefore === undefined || otherBefore === undefined) {
        problems.push(
          `limb r2: the seed does not carry both frames (roots read: [${rootIds(before).join(', ')}]) — the cross-pane arm has no subject`,
        )
      }

      // ---- (a) A FIRE FOR THE SECOND PANE -----------------------------------------------------
      moveHostCache(drive)
      drive.resetCounters()
      const forOther = driveUpdatePane(drive, OTHER, 'r2·other')
      problems.push(...forOther.problems)
      if (forOther.verdict !== null) {
        if (fingerprint(forOther.verdict['applied']) !== fingerprint([`pane-${OTHER}`])) {
          problems.push(
            `limb r2 (a): \`updatePane('${OTHER}')\` applied ${shown(forOther.verdict['applied'])}, not exactly ` +
              `\`['pane-${OTHER}']\` — this is the POSITIVE half: the pane fired for is the pane painted`,
          )
        }
        if (forOther.verdict['painted'] !== true) {
          problems.push(`limb r2 (a): \`updatePane('${OTHER}')\` answered \`painted\` = ${shown(forOther.verdict['painted'])} on an enabled+mounted pane`)
        }
      }
      const afterOther = drive.roots()
      if (queryBefore !== undefined && rootById(afterOther, `pane-${QUERY}`) !== queryBefore) {
        problems.push(
          `limb r2 (a): firing for \`${OTHER}\` REPLACED the \`pane-${QUERY}\` root (identity changed) — a fire for X paints nothing on Y`,
        )
      }
      if (otherBefore !== undefined && rootById(afterOther, `pane-${OTHER}`) === otherBefore) {
        problems.push(
          `limb r2 (a): firing for \`${OTHER}\` left its OWN root the same object — without this the zero on the query pane would be ` +
            `satisfied by a paint that never lands`,
        )
      }
      const countersOther = drive.counters()
      if (countersOther.refresh !== 0 || countersOther.loadAppGraph !== 0 || countersOther.mountOperator !== 0) {
        problems.push(`limb r2 (a): the fire read ${countersReading(countersOther)} — INV-E holds for EVERY pane update, not only the re-plumbed one`)
      }

      // ---- (b) THE REVERSE DIRECTION ON THE SAME HARNESS --------------------------------------
      const beforeReverse = drive.roots()
      const otherNow = rootById(beforeReverse, `pane-${OTHER}`)
      const queryNow = rootById(beforeReverse, `pane-${QUERY}`)
      moveHostCache(drive)
      drive.backRefs.set('probe-b3-cache-second', ['probe-b3-cache-owner'])
      drive.resetCounters()
      const forQuery = driveUpdatePane(drive, QUERY, 'r2·query')
      problems.push(...forQuery.problems)
      if (forQuery.verdict !== null) {
        if (fingerprint(forQuery.verdict['applied']) !== fingerprint([`pane-${QUERY}`])) {
          problems.push(
            `limb r2 (b): \`updatePane('${QUERY}')\` applied ${shown(forQuery.verdict['applied'])}, not exactly ` +
              `\`['pane-${QUERY}']\` — the reverse direction's positive half`,
          )
        }
      }
      const afterQuery = drive.roots()
      if (otherNow !== undefined && rootById(afterQuery, `pane-${OTHER}`) !== otherNow) {
        problems.push(`limb r2 (b): firing for \`${QUERY}\` REPLACED the \`pane-${OTHER}\` root — the same law in the other direction`)
      }
      if (queryNow !== undefined && rootById(afterQuery, `pane-${QUERY}`) === queryNow) {
        problems.push(`limb r2 (b): firing for \`${QUERY}\` did not replace its own root — the reverse direction's positive half failed`)
      }
      problems.push(...otherRootsProblems(beforeReverse, afterQuery, [`pane-${QUERY}`], 'r2·b'))
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb r2 — a fire for X paints nothing on Y (§6 r2). ${problems.length} problem(s). Each direction on ONE harness carries the ` +
        `other direction's positive half, so neither "no root applied for Y" can pass by a paint that never lands. ` +
        `envelope-class — the REAL SidebarPanes over the layout-less DOM shim; no rendered box, no pointer (G8-only)`,
    ).toEqual([])
  })

  it('r3 (host arms) — `not-a-pane` / `not-enabled` / `operator-scope` / `not-mounted` / `no-runtime` are DECLARED words: none throws, none paints, and the enabled+mounted pane still paints', () => {
    // §6 r3's HOST arms (§3's closed `PaneUpdateReason` vocabulary). LAYER: envelope-class — the REAL host over the shim.
    // NON-VACUITY: every arm is preceded or followed by the SAME harness's POSITIVE CONTROL (`updatePane('gnosis-query')` paints
    // after the cache moved), and each arm asserts the root census is UNCHANGED by identity and that no `applyContentReconcile`
    // was recorded — so "declared word, no paint" cannot be read as "the harness painted nothing anywhere".
    // MUTATION THAT WOULD RED IT: throwing on an unregistered id (the `pane-registry.ts` `requireKnown` shape) reds the arm;
    // falling back to a re-assembly for any absent arm reds the counter arm; answering a GENERIC word for `operator-scope` (e.g.
    // folding it into `not-mounted`) reds that arm; silently re-mounting the operator scope reds the counter/root arms.
    const problems: string[] = []
    const drive = seedHost(
      rawLayout(
        [
          { id: QUERY, zone: 'left', index: 0 },
          { id: OTHER, zone: 'left', index: 1 },
          { id: THIRD, zone: 'right', index: 0 },
          // a REGISTERED but DISABLED app-graph pane: it has a layout entry and no materialized frame
          { id: 'probe-b3-disabled', zone: 'right', index: 1 },
        ],
        { left: { collapsed: false }, right: { collapsed: false } },
      ),
      [...SEED_PANES, { id: 'probe-b3-disabled', zone: 'right', defaultOrder: 1, enabled: false }],
    )
    try {
      // ---- THE PRE-CONDITION: the disabled pane really is disabled, the operator pane really is operator-scope --------
      if (drive.registry.isEnabled('probe-b3-disabled')) {
        problems.push('limb r3: the harness failed to register a DISABLED pane — the `not-enabled` arm has no subject')
      }
      if (drive.registry.get(OPERATOR_PANE)?.scope !== 'operator') {
        problems.push('limb r3: the harness operator pane does not read `operator` — the `operator-scope` arm has no subject')
      }

      // ---- THE POSITIVE CONTROL FIRST ---------------------------------------------------------
      const beforeControl = drive.roots()
      moveHostCache(drive)
      drive.resetCounters()
      const control = driveUpdatePane(drive, QUERY, 'r3·control')
      problems.push(...control.problems)
      if (control.verdict !== null && control.verdict['reason'] !== 'painted') {
        problems.push(
          `limb r3 (control): the enabled+mounted pane answered \`reason\` = ${shown(control.verdict['reason'])}, not \`'painted'\` — ` +
            `with this arm false, every absent arm below is satisfied by a seam that refuses everything`,
        )
      }
      const controlCounters = drive.counters()
      if (controlCounters.applies !== 1) {
        problems.push(`limb r3 (control): the control paint called \`applyContentReconcile\` ${controlCounters.applies} time(s), not once`)
      }

      // ---- A LATE PANE: registered + enabled AFTER the load, so NO frame exists for it --------
      const LATE = 'probe-b3-late'
      drive.registry.register({
        id: LATE,
        title: LATE,
        scope: 'app-graph',
        defaultZone: 'left',
        render: () => ({ type: 'div', props: { id: `${LATE}-render-root` } }),
      } as never)
      drive.registry.enable(LATE)

      interface Arm {
        label: string
        paneId: string
        expected: string
        why: string
      }
      const arms: Arm[] = [
        {
          label: 'not-a-pane',
          paneId: 'probe-b3-never-registered',
          expected: 'not-a-pane',
          why: 'an id the registry has never heard of is `not-a-pane` — the registry is the ONE authority over which panes exist',
        },
        {
          label: 'not-enabled',
          paneId: 'probe-b3-disabled',
          expected: 'not-enabled',
          why: 'a registered pane the operator has DISABLED renders no frame, and the word is `not-enabled` (not `not-mounted`: the census that excludes it is the ENABLED one)',
        },
        {
          label: 'operator-scope',
          paneId: OPERATOR_PANE,
          expected: 'operator-scope',
          why: 'an operator pane is `B-9`\'s surface: §3 makes `operator-scope` the arm that keeps the operator mount OUT of this unit rather than silently re-mounting it',
        },
        {
          label: 'not-mounted',
          paneId: LATE,
          expected: 'not-mounted',
          why: 'an enabled app-graph pane registered AFTER the load has no materialized `pane-<id>` frame, so there is nothing to reconcile',
        },
      ]

      for (const arm of arms) {
        const before = drive.roots()
        drive.resetCounters()
        const reading = driveUpdatePane(drive, arm.paneId, `r3·${arm.label}`)
        problems.push(...reading.problems)
        if (reading.threw !== '') continue
        if (reading.verdict !== null) {
          const reason = String(reading.verdict['reason'])
          if (reason !== arm.expected) {
            problems.push(
              `limb r3 (${arm.label}): \`updatePane('${arm.paneId}')\` answered \`reason\` = ${shown(reading.verdict['reason'])}, not ` +
                `\`'${arm.expected}'\` — ${arm.why}`,
            )
          }
          if (reading.verdict['painted'] !== false) {
            problems.push(`limb r3 (${arm.label}): the arm answered \`painted\` = ${shown(reading.verdict['painted'])}, not \`false\``)
          }
          if (fingerprint(reading.verdict['applied']) !== fingerprint([])) {
            problems.push(`limb r3 (${arm.label}): the arm applied ${shown(reading.verdict['applied'])}, not \`[]\``)
          }
        }
        const counters = drive.counters()
        if (counters.applies !== 0) {
          problems.push(`limb r3 (${arm.label}): the arm reached \`applyContentReconcile\` ${counters.applies} time(s) — an absent arm paints nothing`)
        }
        if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
          problems.push(
            `limb r3 (${arm.label}): the arm read ${countersReading(counters)} — §3: no absent arm may FALL BACK to a re-assembly ` +
              `(in particular \`operator-scope\` must not re-mount the operator surface)`,
          )
        }
        const after = drive.roots()
        problems.push(...otherRootsProblems(before, after, [], `r3·${arm.label}`))
      }
    } finally {
      drive.restore()
    }

    // ---- THE `no-runtime` ARM, on a runtime-LESS host -----------------------------------------
    // The word is `no-runtime` and not `not-mounted` BY NECESSITY: mounted-ness is a fact of the runtime's materialized root
    // set, so a host that holds NO runtime cannot answer it — the read route itself is absent, and §3's closed vocabulary names
    // that absence.
    const bare = seedHost(SEED_LAYOUT(), SEED_PANES, { runtime: false })
    try {
      if (bare.runtime !== null) {
        problems.push('limb r3 (no-runtime): the harness failed to build a runtime-LESS host — the arm has no subject')
      }
      const before = bare.roots()
      bare.resetCounters()
      const reading = driveUpdatePane(bare, QUERY, 'r3·no-runtime')
      problems.push(...reading.problems)
      if (reading.threw !== '') {
        // already reported
      } else if (reading.verdict !== null) {
        if (reading.verdict['reason'] !== 'no-runtime') {
          problems.push(
            `limb r3 (no-runtime): \`updatePane('${QUERY}')\` on a host with NO runtime answered \`reason\` = ` +
              `${shown(reading.verdict['reason'])}, not \`'no-runtime'\` — the frame census lives on the runtime, so the absence of ` +
              `the runtime is the DECLARED word (§3) and never a guess about the mount`,
          )
        }
        if (reading.verdict['painted'] !== false || fingerprint(reading.verdict['applied']) !== fingerprint([])) {
          problems.push(`limb r3 (no-runtime): the arm painted (${shown(reading.verdict)}) — with no runtime there is no channel to apply through`)
        }
      }
      const counters = bare.counters()
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(`limb r3 (no-runtime): the arm read ${countersReading(counters)} on a host whose runtime is absent`)
      }
      const after = bare.roots()
      if (after.length !== before.length) {
        problems.push(`limb r3 (no-runtime): the root set moved from ${before.length} to ${after.length} entries on a runtime-less host`)
      }
    } finally {
      bare.restore()
    }

    expect(
      problems,
      `limb r3 (host arms) — the absent arms are DECLARED words (§6 r3; §3's closed \`PaneUpdateReason\`). ${problems.length} ` +
        `problem(s). Five absences — an unknown id, a disabled pane, an operator-scope pane, an enabled pane with no frame, and a ` +
        `host with no runtime — each answer their own word, none throws, none paints, and none re-assembles; the SAME harness's ` +
        `enabled+mounted pane paints. envelope-class — the REAL SidebarPanes over the layout-less DOM shim; no rendered box, no ` +
        `pointer (G8-only)`,
    ).toEqual([])
  })

  it('r5 — THE FLOOR: `host.refresh()` still reaches `loadAppGraph` + `mountOperator` on this double, and `REPLUMBED_PANE_IDS` is exactly `[\'gnosis-query\', \'crosslinks\']`', async () => {
    // §6 r5 (§1's `INV-E` floor; §3's ONE declared constant). LAYER: envelope-class — the REAL host over the shim plus a
    // reading of the host module's exports.
    // NON-VACUITY: this limb IS the floor — its whole purpose is to prove the three counters CAN move on the very double whose
    // zeroes `r1`/`r6` assert, so a zero there can never be a dead recorder. It reads each counter TWICE: once through the
    // wrapped instance method and once through a BYPASS-PROOF observable (`bridge.operatorSettings.get` for `refresh`,
    // `runtime.loadEnvelope` for `loadAppGraph`, the operator pane's own `render` for `mountOperator`).
    // MUTATION THAT WOULD RED IT: a harness whose runtime is not attached (the seed would not reach `loadEnvelope`) reds the
    // floor; removing the operator pane reds the `mountOperator` secondary reading; a `REPLUMBED_PANE_IDS` that names an
    // UNNAMED further pane reds the constant arm (a later unit must EXTEND the census deliberately — ⟨`B-5` `pane-links` did,
    // by exactly one id: `docs/L1/unit-b-5-pane-links.md` §4⟩).
    const problems: string[] = []
    const drive = seedHost(SEED_LAYOUT(), SEED_PANES)
    try {
      // ---- BEFORE: every counter at zero ------------------------------------------------------
      const before = drive.counters()
      if (before.refresh !== 0 || before.loadAppGraph !== 0 || before.mountOperator !== 0) {
        problems.push(`limb r5: the counters are not zero before the floor is driven (${countersReading(before)}) — the baseline is not clean`)
      }
      if (before.loadEnvelopes < 1) {
        problems.push(
          `limb r5: the SEED \`loadAppGraph\` never reached \`runtime.loadEnvelope\` (${before.loadEnvelopes}) — the runtime double was ` +
            `not attached through the public seed path, so every zero in \`r1\`/\`r6\` would be vacuous`,
        )
      }

      // ---- THE FLOOR: `host.refresh()` ---------------------------------------------------------
      drive.resetCounters()
      let threw = ''
      try {
        await drive.host.refresh()
      } catch (error) {
        threw = String(error)
      }
      if (threw !== '') {
        problems.push(`limb r5: \`host.refresh()\` THREW on this harness (${threw}) — the pre-migration route is the floor and must run`)
      }
      const floor = drive.counters()
      if (floor.refresh < 1) {
        problems.push(`limb r5: \`host.refresh()\` did not register on the instance counter (${countersReading(floor)}) — the reading itself is dead`)
      }
      if (floor.loadAppGraph < 1) {
        problems.push(
          `limb r5: \`host.refresh()\` reached \`loadAppGraph\` ${floor.loadAppGraph} time(s), not ≥ 1 (${countersReading(floor)}) — with ` +
            `this false, \`r1\`'s and \`r6\`'s \`loadAppGraph === 0\` could not discriminate`,
        )
      }
      if (floor.mountOperator < 1) {
        problems.push(`limb r5: \`host.refresh()\` reached \`mountOperator\` ${floor.mountOperator} time(s), not ≥ 1 (${countersReading(floor)})`)
      }
      if (floor.loadEnvelopes < 1) {
        problems.push(
          `limb r5: the BYPASS-PROOF reading is dead — \`runtime.loadEnvelope\` was called ${floor.loadEnvelopes} time(s) across a ` +
            `refresh that re-assembles (${countersReading(floor)})`,
        )
      }
      if (floor.operatorRenders < 1) {
        problems.push(
          `limb r5: the BYPASS-PROOF \`mountOperator\` reading is dead — the operator pane's \`render\` ran ${floor.operatorRenders} ` +
            `time(s) across a refresh that re-mounts the operator surface (${countersReading(floor)})`,
        )
      }
      if (floor.settingsGets < 1) {
        problems.push(
          `limb r5: the BYPASS-PROOF \`refresh\` reading is dead — \`operatorSettings.get()\` was called ${floor.settingsGets} time(s) ` +
            `across a refresh that re-fetches them (${countersReading(floor)})`,
        )
      }
    } finally {
      drive.restore()
    }

    // ---- THE CONSTANT ------------------------------------------------------------------------
    let hostModule: Record<string, unknown> | null = null
    try {
      hostModule = (await import('../../../src/renderer/sidebar-panes.js')) as Record<string, unknown>
    } catch (error) {
      problems.push(`limb r5: \`${SIDEBAR_FILE}\` does not resolve as a module (${String(error)}) — the pinned constant's home is unreadable`)
    }
    const replumbed = hostModule === null ? undefined : hostModule['REPLUMBED_PANE_IDS']
    // ⟨EXTENDED BY UNIT `B-5` (`pane-links`) — DELIBERATELY, per this row's own message ("a later unit must EXTEND this
    // constant deliberately").⟩ `B-5` moved the census by exactly ONE: `crosslinks` joins `gnosis-query`, because a new
    // backlink is now DETECTED on this channel (`docs/L1/unit-b-5-pane-links.md` §2/§4) and that pane's dispatch re-reads
    // and paints its own root. The row's SUBJECT and TEETH are unchanged — the value is still pinned EXACTLY, so a FURTHER id
    // (a silent second subscriber) still reds it; what moved is the recorded value, with its unit named.
    // ⟨EXTENDED AGAIN BY UNIT `B-6` (`pane-doc-nav`) — the same discipline, ONE more row.⟩ `doc-nav` joins the census because that
    // pane hears BOTH sources (`docs/L1/unit-b-6-pane-doc-nav.md` §2) — the rendered STORE's change fired locally AND the ENGINE's
    // change published through the change-interest declaration — and its dispatch re-reads `rag.docHeads` and paints its own root.
    // The fingerprint comparison below stays ORDER-SENSITIVE and EXACT.
    const PINNED_CENSUS = [QUERY, 'crosslinks', 'doc-nav']
    if (replumbed === undefined) {
      problems.push(
        '(r5) `REPLUMBED_PANE_IDS` does not resolve on `src/renderer/sidebar-panes.js` — §3 pins it as the ONE declared constant ' +
          `naming the panes whose paint the host registers on the channel: exactly ${shown(PINNED_CENSUS)} (the ` +
          "`pane-update-channel` census plus `B-5`'s and `B-6`'s one-row extensions)",
      )
    } else if (!Array.isArray(replumbed) || fingerprint(replumbed) !== fingerprint(PINNED_CENSUS)) {
      problems.push(
        `(r5) \`REPLUMBED_PANE_IDS\` reads ${shown(replumbed)}, not exactly ${shown(PINNED_CENSUS)} — §3: the host registers its ` +
          `paint for the RE-PLUMBED census ONLY, so every other pane family keeps its \`refresh()\` route until its own unit, and a ` +
          `later unit must EXTEND this constant deliberately (never inherit a silent second subscriber)`,
      )
    }

    expect(
      problems,
      `limb r5 — the pre-migration path still works and its scope is declared (§6 r5; §3's \`REPLUMBED_PANE_IDS\`). ` +
        `${problems.length} problem(s). \`host.refresh()\` still reaches \`loadAppGraph\` + \`mountOperator\` on this very double ` +
        `(each read twice: the wrapped instance method AND a bypass-proof observable), so \`r1\`'s and \`r6\`'s zeroes are readings ` +
        `and not a dead counter; and the re-plumbed census is exactly ${shown([QUERY, 'crosslinks', 'doc-nav'])} (extended by ` +
        `\`B-5\` and then by \`B-6\`, one id each). ` +
        `envelope-class — the REAL SidebarPanes over the layout-less DOM shim; no rendered box, no pointer (G8-only)`,
    ).toEqual([])
  })

  it('r6(i)+r6(iii) — INV-E on the DIRECT arm, and the FOUR MUTANTS each measured RED first (m1 refresh, m2 loadAppGraph, m3 mountOperator, m4 a no-op paint)', async () => {
    // §6 r6(i) and r6(iii) (§1: "The row must be able to FAIL"). LAYER: envelope-class — the REAL host over the shim, the three
    // counters wrapped on the instance, and three bypass-proof secondary readings beside them.
    // NON-VACUITY: the zeroes are floored by the FOUR MUTANTS, each of which MUST move its counter on this same harness before
    // the zero is a reading — m1 `refresh ≥ 1`, m2 `loadAppGraph ≥ 1`, m3 `mountOperator ≥ 1`, and m4 a no-op handler whose
    // `painted:false`/`applied === []` is measured while the host cache DID change (the change is asserted) and the real seam,
    // driven on the SAME drive, paints and applies. Every mutant's reading is PRINTED in this row's message.
    // MUTATION THAT WOULD RED IT: any pane update that reaches `refresh()`, `loadAppGraph` or `mountOperator` reds (i) — that is
    // exactly what the four mutants assert this harness would SEE; a paint that applies no root while the cache moved reds m4's
    // positive half; a harness whose counters cannot move reds the mutants themselves.
    const problems: string[] = []
    const mutants: string[] = []
    const drive = seedHost(SEED_LAYOUT(), SEED_PANES)
    try {
      // ---- (i) THE DIRECT ARM ------------------------------------------------------------------
      const before = drive.roots()
      const liveQuery = rootById(before, `pane-${QUERY}`)
      moveHostCache(drive)
      drive.resetCounters()
      const direct = driveUpdatePane(drive, QUERY, 'r6(i)')
      problems.push(...direct.problems)
      if (direct.verdict !== null) {
        if (fingerprint(direct.verdict['applied']) !== fingerprint([`pane-${QUERY}`])) {
          problems.push(
            `limb r6(i): the DIRECT arm applied ${shown(direct.verdict['applied'])}, not exactly \`['pane-${QUERY}']\` — the invariant ` +
              `is graded on a paint that LANDED, so this arm is the row's subject and not a formality`,
          )
        }
        if (direct.verdict['painted'] !== true) {
          problems.push(`limb r6(i): the DIRECT arm answered \`painted\` = ${shown(direct.verdict['painted'])} — a zero on a paint that did not happen proves nothing`)
        }
      }
      const afterDirect = drive.roots()
      if (liveQuery !== undefined && rootById(afterDirect, `pane-${QUERY}`) === liveQuery) {
        problems.push('limb r6(i): the DIRECT arm left the pane\'s root the SAME OBJECT — the root must be replaced for the zeroes to be a reading of a real paint')
      }
      const inv = drive.counters()
      if (inv.refresh !== 0 || inv.loadAppGraph !== 0 || inv.mountOperator !== 0) {
        problems.push(
          `limb r6(i): the DIRECT arm read ${countersReading(inv)} — INV-E pins \`0 loadAppGraph\`, \`0 mountOperator\`, \`0 refresh()\` ` +
            `on a pane update (§1, ASM-B-5: the counters are the PANE UPDATE's own)`,
        )
      }
      if (inv.applies !== 1) {
        problems.push(`limb r6(i): the DIRECT arm called \`applyContentReconcile\` ${inv.applies} time(s), not exactly once`)
      }

      // ---- (iii) THE FOUR MUTANTS --------------------------------------------------------------
      const channelModule = await (async (): Promise<{ mod: Record<string, unknown> | null; problems: string[] }> => {
        try {
          return { mod: (await import('../../../src/renderer/pane-events.js')) as Record<string, unknown>, problems: [] }
        } catch (error) {
          return {
            mod: null,
            problems: [
              `limb r6(iii): \`src/renderer/pane-events.ts\` cannot be imported at this head (${String(error)}) — the four mutants drive ` +
                `the channel, so the invariant's falsifiers have no subject (reported, never skipped)`,
            ],
          }
        }
      })()
      problems.push(...channelModule.problems)
      const createPaneEvents = channelModule.mod === null ? undefined : channelModule.mod['createPaneEvents']
      if (typeof createPaneEvents !== 'function') {
        if (channelModule.mod !== null) {
          problems.push(
            'limb r6(iii): `createPaneEvents` does not resolve on `src/renderer/pane-events.js` — the mutants that prove this row `' +
              'CAN fail have no channel to register on',
          )
        }
      } else {
        interface Mutant {
          label: string
          why: string
          handler: () => void
          reading: () => string
          caught: () => boolean
        }
        const channel = (createPaneEvents as () => Record<string, unknown>)()
        const subscribe = channel['subscribe'] as (id: string, handler: () => void) => unknown
        const fire = channel['fire'] as (id: string) => unknown

        const registrations: Array<() => void> = []
        const runMutant = async (mutant: Mutant): Promise<void> => {
          drive.resetCounters()
          const release = subscribe.call(channel, QUERY, mutant.handler)
          registrations.push(typeof release === 'function' ? (release as () => void) : () => undefined)
          let fireThrew = ''
          try {
            fire.call(channel, QUERY)
          } catch (error) {
            fireThrew = String(error)
          }
          await settle()
          const reading = mutant.reading()
          mutants.push(`${mutant.label}: ${reading}`)
          if (fireThrew !== '') {
            problems.push(`limb r6(iii) (${mutant.label}): the fire THREW (${fireThrew}) — \`fire\` never throws, mutant or not`)
          }
          if (!mutant.caught()) {
            problems.push(
              `limb r6(iii) (${mutant.label}): the mutant was NOT caught — ${mutant.why}. Reading: ${reading}. A counter that cannot ` +
                `move cannot prove an invariant, so this arm is the row's own falsifier`,
            )
          }
          // ⟨B3-F4 — ONE MUTANT AT A TIME, REPAIRED IN THE ROW (a ROW defect, never a weakened claim).⟩ As authored, every mutant's
          // registration stayed live until the END of the limb, so `fire(QUERY)` in m4 ALSO ran m1's `refresh()` / m2's
          // `loadAppGraph` / m3's `mountOperator` — and those re-assemblies re-mint the double's root set, which made m4's own
          // assertion (`rootsSameIdentity`, i.e. a no-op paint leaves every root the SAME OBJECT) unsatisfiable by ANY channel:
          // the arm was grading the PREVIOUS mutants' side effects, not m4's silence. The withdrawal is idempotent, so the final
          // sweep below still runs it; no limb is dropped and m4's claim is unchanged.
          if (typeof release === 'function') {
            try {
              ;(release as () => void)()
            } catch {
              /* a mutant's withdrawal is the harness's own bookkeeping, never a limb failure */
            }
          }
        }

        // m1 — the pre-migration body: `refresh()`.
        await runMutant({
          label: 'm1 refresh()',
          why: 'the PRE-MIGRATION route (`onChanged → host.refresh()`) must register on the refresh counter',
          handler: () => {
            void drive.host.refresh()
          },
          reading: () => countersReading(drive.counters()),
          caught: () => drive.counters().refresh >= 1,
        })
        // m2 — the re-assembly: `loadAppGraph`.
        await runMutant({
          label: 'm2 loadAppGraph',
          why: 'a re-assembly (`loadAppGraph(runtime, lastTraversalEnvelope)`) must register on the loadAppGraph counter',
          handler: () => {
            ;(drive.host as unknown as Record<string, (a: unknown, b: unknown) => unknown>)['loadAppGraph'](
              (drive.host as unknown as Record<string, unknown>)['runtime'],
              (drive.host as unknown as Record<string, unknown>)['lastTraversalEnvelope'],
            )
          },
          reading: () => countersReading(drive.counters()),
          caught: () => drive.counters().loadAppGraph >= 1 && drive.counters().loadEnvelopes >= 1,
        })
        // m3 — the operator re-mount.
        await runMutant({
          label: 'm3 mountOperator',
          why: 'an operator re-mount must register on the mountOperator counter AND on the operator pane\'s own render',
          handler: () => {
            ;(drive.host as unknown as Record<string, () => void>)['mountOperator']()
          },
          reading: () => countersReading(drive.counters()),
          caught: () => drive.counters().mountOperator >= 1 && drive.counters().operatorRenders >= 1,
        })

        // m4 — a NO-OP paint: the cache moved, the handler painted nothing.
        const beforeM4 = drive.roots()
        const cacheBeforeM4 = drive.backRefs.size
        moveHostCache(drive)
        drive.backRefs.set('probe-b3-cache-m4', ['probe-b3-cache-owner'])
        const cacheAfterM4 = drive.backRefs.size
        if (cacheAfterM4 === cacheBeforeM4) {
          problems.push('limb r6(iii) (m4): the harness failed to move the host cache — m4 would be measured on a no-change re-render')
        }
        await runMutant({
          label: 'm4 a no-op handler',
          why: 'a handler that paints nothing must leave `painted:false` and `applied === []` while the cache DID change',
          handler: () => undefined,
          reading: () =>
            `painted=false applied=[] applyContentReconcile=${drive.counters().applies} cacheSize=${cacheBeforeM4}→${cacheAfterM4} ` +
            `rootsSameIdentity=${rootIds(beforeM4).every((id) => rootById(drive.roots(), id) === rootById(beforeM4, id))}`,
          caught: () => drive.counters().applies === 0 && rootIds(beforeM4).every((id) => rootById(drive.roots(), id) === rootById(beforeM4, id)),
        })
        // m4's POSITIVE HALF: the SAME drive, the SAME cache state, the REAL seam — it paints and it applies.
        drive.resetCounters()
        const m4Control = driveUpdatePane(drive, QUERY, 'r6(iii)·m4-control')
        problems.push(...m4Control.problems)
        if (m4Control.verdict !== null && m4Control.verdict['painted'] !== true) {
          problems.push(
            `limb r6(iii) (m4): on the SAME drive and the SAME cache state the REAL seam answered \`painted\` = ` +
              `${shown(m4Control.verdict['painted'])} — m4's "nothing painted" must be the HANDLER's silence, not the paint's`,
          )
        }
        if (drive.counters().applies !== 1) {
          problems.push(`limb r6(iii) (m4): the control paint applied ${drive.counters().applies} root(s), not exactly one`)
        }
        for (const release of registrations) {
          try {
            release()
          } catch {
            /* a mutant's withdrawal is the harness's own bookkeeping, never a limb failure */
          }
        }
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb r6(i)+r6(iii) — INV-E and its four mutants (§6 r6; §1's "the row must be able to FAIL"). ${problems.length} problem(s). ` +
        `The DIRECT arm replaces the pane's root and must read \`0 loadAppGraph\` / \`0 mountOperator\` / \`0 refresh()\`; the four ` +
        `mutants are measured FIRST on the same harness and each must be CAUGHT: ${mutants.length > 0 ? mutants.join(' · ') : '(no mutant could be driven)'}. ` +
        `envelope-class — the REAL SidebarPanes over the layout-less DOM shim, the three counters wrapped on the instance plus a ` +
        `bypass-proof observable each; no rendered box, no computed style, no pointer (G8-only, §8)`,
    ).toEqual([])
  })
})
