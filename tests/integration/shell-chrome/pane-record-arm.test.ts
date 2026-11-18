// tests/integration/shell-chrome/pane-record-arm.test.ts — unit `B-3` `pane-update-channel`'s RECORD-ARM row (`r6(ii)`) and
// `r7`'s BEHAVIOURAL half, authored BEFORE any byte of the channel or the paint exists (RCA-1: the red set runs first and is
// REPORTED before implementation).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-3-pane-update-channel.md` §1's RECORD arm ("`B-1`'s delivery → `B-2`'s
// payload-free push → the display client's re-read → the same fire"), §2 (ONE registry, TWO declarations, ONE dispatch:
// `subscribeRecord(id, h)` is `subscribe(id, h)` PLUS a record-interest mark and `deliver()` fires through `fire`), §3 (the
// paint seam `updatePane` and its `0/0/0`), §6 `r6(ii)` and `r7`, and the LANDED `B-2` crossing shape
// (`docs/L1/unit-b-2-display-wire.md` §5, `strata/decisions.md` `D-31`) as this repo's rows already drive it in
// `tests/integration/record-engine/display-crossing.test.ts` — the SAME real-store construction, copied in SHAPE.
//
// THE CHAIN, AND WHY EVERY LINK IS REAL: a REAL `createProfileStore` on a `mkdtempSync` `/tmp` `filePath`, adopting `B-1`'s
// `createDisplayDelivery` entries and `displayConstraintDeclarations` (the construction §2 pins, in §2's order); `B-1`'s
// `createDisplayRecord` over that handle; the `B-2` CROSSING SHAPE as the port — `read` answers the record, `onChanged`
// registers on the delivery's queue-backed fan-out (the payload-free push); `createDisplayClient` over that port; the
// client's own listener re-reads and calls the channel's `deliver()`. The store write therefore crosses exactly the four
// realms the unit names, and nothing in the chain is mocked.
//
// THE TWO ARMS, ONE HANDLER INSTANCE, BYTE-EQUAL APPLIED ROOTS: ONE `paint` function is registered ONCE on the channel through
// `subscribeRecord(QUERY, paint)`, and it is invoked by the DIRECT arm (`channel.fire(QUERY)`) and by the RECORD arm
// (`channel.deliver()` — which fires through `fire`, §2). The identity reading is taken three ways, because a count alone
// cannot carry it: (a) the registration is ONE (both reports carry `handlers: 1`), (b) both reports name the SAME pane id, and
// (c) the authored frame + the `applied` census are BYTE-EQUAL across the two arms. Two IDENTICAL hosts carry the two arms (the
// same seed, the same cache mutation), so "byte-equal" is a reading of the dispatch, not of two different inputs.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): every limb here is ENVELOPE-class — a real store on a `/tmp` path, the REAL
// `SidebarPanes` over the LAYOUT-LESS DOM shim, a recording runtime double, and the REAL display client. What only `G8`'s live
// leg can read, named so nobody quotes this file for it: that the pane's frame was RE-MINTED in an assembled window, its
// rendered content, its geometry, its computed style and its pointer (`docs/L1/unit-b-3-pane-update-channel.md` §8). The
// store's own on-disk bytes are `B-2`'s `G8(ii)` reading and are not asserted here. NO limb here asserts a rendered geometry,
// a computed style or a pointer.
//
// NON-VACUITY (mandatory, stated per limb in its own comment): every zero carries a positive control beside it — the pane's
// root really was REPLACED, the store write really crossed (one push, one client re-read carrying the written tab), and the
// direct arm's own apply is the record arm's control. The mutation that would red each arm is named in its comment.
//
// REACHABILITY RULE (this file always COLLECTS and RUNS): `createPaneEvents` and `updatePane` DO NOT EXIST at this head. Both
// are reached through `await import()` + a `readExport`-style TYPE check, and each absence is a NAMED problem inside the
// limb's aggregate `expect(problems, …)` — never an ESM link error, never a skip. `B-1`'s barrel is read the same way, so a
// renamed export is a reported problem too.
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`, no `vi.mock`. Every path derives from
// THIS FILE's own location (`ROOT`) or from `mkdtempSync`; every temp dir is removed in `afterAll`.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { installShim, ShimElement } from '../../../src/shared/dom-shim.js'
import { createPaneRegistry } from '../../../src/renderer/pane-registry.js'
import { defaultLayout, type LayoutState } from '../../../src/renderer/layout-state.js'
import { SidebarPanes } from '../../../src/renderer/sidebar-panes.js'

// Namespace imports: this unit WIRES `B-1`'s and `B-2`'s landed modules, so a member this unit adds or renames is a NAMED
// problem inside the row that needs it — never an ESM link error that kills the file.
import * as recordEngineModule from '../../../src/main/record-engine/index.js'
import * as storeroomModule from '../../../src/main/storeroom.js'
import * as displayClientModule from '../../../src/renderer/display-client.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

const QUERY = 'gnosis-query'
const OTHER = 'probe-b3r-other'
const OPERATOR_PANE = 'probe-b3r-operator'

/** §4's pinned push constant name, spelled here because this file is not `src/**`: the row is the READING of the contract. */
const PUSH_CHANNEL_NAME = 'DISPLAY_CHANGED'

type AnyFn = (...args: never[]) => unknown
type AnyRecord = Record<string, unknown>

const readText = (relativePath: string): string => readFileSync(`${ROOT}/${relativePath}`, 'utf8')

const fingerprint = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

const shown = (value: unknown): string => (value === undefined ? '(absent)' : fingerprint(value))

const msgOf = (thrown: unknown): string => (thrown instanceof Error ? thrown.message : String(thrown))

function readExport(mod: unknown, name: string): unknown {
  if (mod === null || (typeof mod !== 'object' && typeof mod !== 'function')) return undefined
  try {
    return (mod as AnyRecord)[name]
  } catch {
    return undefined
  }
}

function readFn(mod: unknown, name: string): AnyFn | null {
  const value = readExport(mod, name)
  return typeof value === 'function' ? (value as AnyFn) : null
}

/** One settled turn: `fill()` is a promise and the client's listener re-reads inside one. */
const settle = (): Promise<void> => new Promise((resolveTurn) => setTimeout(resolveTurn, 0))

const tempDirs: string[] = []

/** A real store's `filePath` — a fresh `mkdtempSync` per construction, removed in `afterAll`. */
function newProfilePath(label: string): string {
  const dir = mkdtempSync(join(tmpdir(), `b3-pane-record-arm-${label}-`))
  tempDirs.push(dir)
  return join(dir, 'provident-profile.json')
}

beforeAll(() => {
  installShim()
})

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true })
})

// ---------------------------------------------------------------------------
// THE CHAIN — `B-1`'s real store + delivery + record, the `B-2` crossing shape as the port, the landed client. Copied in
// SHAPE from `tests/integration/record-engine/display-crossing.test.ts`'s `buildChain` (the entries BEFORE the store, the
// holder bound AFTER it answers, the family's declarations adopted beside the entries).
// ---------------------------------------------------------------------------
interface Chain {
  readonly record: AnyRecord
  readonly delivery: AnyRecord
  readonly store: AnyRecord
  readonly sends: () => number
  readonly sentAddresses: string[][]
}

function buildChain(problems: string[], label: string): Chain | null {
  const createProfileStore = readFn(storeroomModule, 'createProfileStore')
  const createDisplayDelivery = readFn(recordEngineModule, 'createDisplayDelivery')
  const createDisplayRecord = readFn(recordEngineModule, 'createDisplayRecord')
  const displayConstraintDeclarations = readFn(recordEngineModule, 'displayConstraintDeclarations')

  if (createProfileStore === null) {
    problems.push(`limb ${label}: \`createProfileStore\` does not resolve on the seam \`src/main/storeroom.ts\` — the ONE construction has no subject`)
    return null
  }
  if (createDisplayDelivery === null || createDisplayRecord === null) {
    problems.push(
      `limb ${label}: \`createDisplayDelivery\`/\`createDisplayRecord\` do not both resolve on \`src/main/record-engine/index.js\` — ` +
        `\`B-1\`'s entries and record are the crossing's two main-side halves and this arm has no subject without them`,
    )
    return null
  }
  if (displayConstraintDeclarations === null) {
    problems.push(
      `limb ${label}: \`displayConstraintDeclarations\` does not resolve on the barrel — without \`display-must-stand\` the family is ` +
        `never minted, so no leaf write can land and this row's chain is unbuildable`,
    )
    return null
  }
  const sentAddresses: string[][] = []
  let sends = 0
  try {
    // §2 item 2 — THE ENTRIES BEFORE THE STORE (the sink is the push: one address in, nothing else).
    const delivery = createDisplayDelivery(((delivered: readonly string[]) => {
      sentAddresses.push([...delivered])
      sends += 1
    }) as never) as AnyRecord
    const entries = delivery['entries']
    if (!Array.isArray(entries) || entries.length === 0) {
      problems.push(`limb ${label}: the delivery carries no \`entries\` — the one construction has nothing to adopt`)
      return null
    }
    // §2 item 3 — THE ONE CONSTRUCTION over a real `/tmp` path, the handle bound AFTER it answers.
    let holder: unknown = null
    const store = createProfileStore({
      filePath: newProfilePath(label),
      listeners: [...(entries as unknown[])],
      constraints: [...((displayConstraintDeclarations as (get: () => unknown) => unknown[])(() => holder) as unknown[])],
    } as never) as AnyRecord
    holder = store
    // §2 item 5 — the record over that handle.
    const record = createDisplayRecord({ store, delivery } as never) as AnyRecord
    return { record, delivery, store, sends: () => sends, sentAddresses }
  } catch (thrown) {
    problems.push(
      `limb ${label}: the ONE construction THREW (${msgOf(thrown)}) — a construction that cannot load the addon or refuses its ` +
        `config is a STOP, reported rather than worked around`,
    )
    return null
  }
}

/** The realm's port as `B-2` §4 wires it: `read` is the RECORD's, `onChanged` registers on the delivery's fan-out (the
 *  arity-zero route the queue sits behind). */
const portOver = (chain: Chain): AnyRecord => ({
  read: () => (chain.record['read'] as AnyFn).call(chain.record),
  onChanged: (handler: () => void) => (chain.delivery['subscribe'] as AnyFn).call(chain.delivery, handler),
})

/** The entry shape the family admits: `documentId` and nothing else (D-23's payload, no member more). */
const entryFor = (documentId: string): AnyRecord => ({ documentId })

// ---------------------------------------------------------------------------
// THE HOST DRIVE — the REAL `SidebarPanes` over the shim, seeded through the PUBLIC `loadAppGraph` against a recording runtime
// double (the `reveal-without-reassembly` shape), with the three `INV-E` counters wrapped on the INSTANCE and three
// bypass-proof secondary readings beside them.
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

interface Counters {
  refresh: number
  loadAppGraph: number
  mountOperator: number
  settingsGets: number
  loadEnvelopes: number
  operatorRenders: number
  applies: number
}

interface RuntimeDouble {
  double: AnyRecord
  applies: AnyRecord[]
  roots: () => unknown[]
}

function recordingRuntime(): RuntimeDouble {
  const applies: AnyRecord[] = []
  const roots: unknown[] = []
  const double: AnyRecord = {
    loadEnvelope: (envelope: unknown): void => {
      roots.length = 0
      roots.push(...contentRootsOf(envelope))
    },
    materializedContentRoots: (): unknown[] => [...roots],
    materializedDocumentRoots: (): unknown[] => roots.map((root) => ({ documentId: '', root })),
    applyContentReconcile: (input: unknown): AnyRecord => {
      const read = (input ?? {}) as AnyRecord
      applies.push(read)
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
  return { double, applies, roots: () => [...roots] }
}

interface HostDrive {
  host: SidebarPanes
  registry: ReturnType<typeof createPaneRegistry>
  backRefs: Map<string, string[]>
  runtime: RuntimeDouble
  counters: () => Counters
  resetCounters: () => void
  roots: () => unknown[]
  applies: () => AnyRecord[]
  restore: () => void
}

function rawLayout(panes: ReadonlyArray<{ id: string; zone: 'left' | 'right'; index: number }>): LayoutState {
  const base = defaultLayout()
  const built = {
    version: base.version,
    panes: panes.map((pane) => ({ id: pane.id, zone: pane.zone, index: pane.index, collapsed: false })),
    zones: { ...base.zones, left: { ...base.zones.left, collapsed: false }, right: { ...base.zones.right, collapsed: false } },
    stage: { ...base.stage },
    topBar: { ...base.topBar },
  }
  return built as unknown as LayoutState
}

function minimalTraversalEnvelope(): Record<string, unknown> {
  return {
    template: { root: { type: 'div', props: { id: 'wiki-root' }, children: [] } },
    content: [{ content: [{ type: 'div', props: { id: 'rag-doc-probe' }, children: [] }] }],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

function seedHost(label: string): HostDrive {
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
  registry.register({
    id: OPERATOR_PANE,
    title: `B-3 record-arm operator pane (${label})`,
    scope: 'operator',
    render: () => {
      counters.operatorRenders += 1
      return { type: 'section', props: { id: `${OPERATOR_PANE}-render-root` } }
    },
  } as never)
  registry.enable(OPERATOR_PANE)

  const panes: ReadonlyArray<{ id: string; zone: 'left' | 'right'; index: number }> = [
    { id: QUERY, zone: 'left', index: 0 },
    { id: OTHER, zone: 'right', index: 0 },
  ]
  for (const pane of panes) {
    registry.register({
      id: pane.id,
      title: pane.id,
      scope: 'app-graph',
      defaultZone: pane.zone,
      defaultOrder: pane.index,
      // THE PANE'S CONTENT READS THE HOST'S OWN CACHE (`buildContext().backRefs`): a mutation of the map below IS a change of
      // what `def.render(ctx)` authors — both arms move the cache by exactly one entry, so the two authored frames are equal.
      render: (ctx: { backRefs?: Map<string, string[]> }) => ({
        type: 'div',
        props: { id: `${pane.id}-render-root`, 'data-cache-size': String(ctx?.backRefs?.size ?? -1) },
        children: [{ type: 'p', content: `cache ${ctx?.backRefs?.size ?? -1}` }],
      }),
    } as never)
    registry.enable(pane.id)
  }

  const backRefs = new Map<string, string[]>()
  const host = new SidebarPanes({
    mount: new ShimElement('div') as never,
    operatorMount: new ShimElement('div') as never,
    registry,
    bridge: {
      operatorSettings: {
        set: async (patch: unknown): Promise<unknown> => patch,
        get: async (): Promise<AnyRecord> => {
          counters.settingsGets += 1
          return {}
        },
      },
    },
    backRefs,
    editController: { anyDirty: () => false },
  } as never)
  globals['window'] = { provident: {} }
  host.setLayout(rawLayout(panes))

  const runtime = recordingRuntime()
  const realLoadEnvelope = runtime.double['loadEnvelope'] as (envelope: unknown) => void
  runtime.double['loadEnvelope'] = (envelope: unknown): void => {
    counters.loadEnvelopes += 1
    realLoadEnvelope(envelope)
  }
  const realApply = runtime.double['applyContentReconcile'] as (input: unknown) => AnyRecord
  runtime.double['applyContentReconcile'] = (input: unknown): AnyRecord => {
    counters.applies += 1
    return realApply(input)
  }
  ;(host as unknown as AnyRecord)['runtime'] = runtime.double
  host.loadAppGraph(runtime.double as never, minimalTraversalEnvelope() as never)

  const realRefresh = host.refresh.bind(host)
  ;(host as unknown as AnyRecord)['refresh'] = (...args: unknown[]): unknown => {
    counters.refresh += 1
    return (realRefresh as (...next: unknown[]) => unknown)(...args)
  }
  const realLoadAppGraph = host.loadAppGraph.bind(host)
  ;(host as unknown as AnyRecord)['loadAppGraph'] = (...args: unknown[]): unknown => {
    counters.loadAppGraph += 1
    return (realLoadAppGraph as (...next: unknown[]) => unknown)(...args)
  }
  const realMountOperator = host.mountOperator.bind(host)
  ;(host as unknown as AnyRecord)['mountOperator'] = (...args: unknown[]): unknown => {
    counters.mountOperator += 1
    return (realMountOperator as (...next: unknown[]) => unknown)(...args)
  }

  return {
    host,
    registry,
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
    roots: () => runtime.roots(),
    applies: () => runtime.applies,
    restore: () => {
      delete (host as unknown as AnyRecord)['refresh']
      delete (host as unknown as AnyRecord)['loadAppGraph']
      delete (host as unknown as AnyRecord)['mountOperator']
      delete (host as unknown as AnyRecord)['runtime']
      globals['window'] = previousWindow
    },
  }
}

const countersReading = (counters: Counters): string =>
  `refresh=${counters.refresh} loadAppGraph=${counters.loadAppGraph} mountOperator=${counters.mountOperator}` +
  ` (secondary: operatorSettings.get=${counters.settingsGets} loadEnvelope=${counters.loadEnvelopes}` +
  ` operatorRender=${counters.operatorRenders} applyContentReconcile=${counters.applies})`

const rootById = (roots: readonly unknown[], cssId: string): unknown => roots.find((root) => cssIdOf(root) === cssId)

/** The applied frame + the `applied` census, as ONE byte string — `r7`'s "byte-equal across the two arms". */
function appliedBytes(drive: HostDrive, verdict: AnyRecord | null): string {
  const frame = (() => {
    for (const input of drive.applies()) {
      const found = rootById(contentRootsOf(input['next']), `pane-${QUERY}`)
      if (found !== undefined) return found
    }
    return undefined
  })()
  return fingerprint({ applied: verdict === null ? null : verdict['applied'], frame })
}

/** The ONE handler instance both arms dispatch. It reads the current arm off the mutable selection below, so the SAME object
 *  serves the direct arm and the record arm — which is exactly what `r7`'s identity claim is about. */
interface Invocation {
  arm: string
  report: unknown
  readingCarried: string[]
  verdict: AnyRecord | null
}

// ---------------------------------------------------------------------------
// THE LIMB
// ---------------------------------------------------------------------------
describe('pane-record-arm — the RECORD arm crosses a real store and reaches the SAME handler instance the direct fire invoked', () => {
  it('r6(ii)+r7 (behavioural) — a real store write → the payload-free push → the client’s re-read → `deliver()` → ONE paint, the same handler instance, a byte-equal applied root, and the same three zeroes', async () => {
    // §6 `r6(ii)` and §6 `r7`'s BEHAVIOURAL half. LAYER: envelope-class — a REAL store on a `/tmp` path, the REAL
    // `SidebarPanes` over the layout-less DOM shim, the REAL display client; no rendered box, no computed style, no pointer.
    // NON-VACUITY: the record arm's ONE paint is floored by (a) the store write really crossing (≥1 push recorded on the
    // delivery's sink, and the client's held reading carrying the written tab at paint time), (b) the pane's root really being
    // REPLACED, (c) the DIRECT arm's own apply on the identical host as the record arm's control, and (d) `handlers: 1` in BOTH
    // reports — a second registration (one per arm) would read 2. The three zeroes are floored by `r5`'s `host.refresh()` floor
    // in `pane-update-channel.test.ts` and by the record arm's own apply.
    // MUTATION THAT WOULD RED IT: wiring the record arm through a SECOND `client.subscribe`/`installDisplayCrossing` call (the
    // measured `B2-ADV-04` fault) reds the `handlers` arm and the push count; a `deliver()` that dispatches its own loop reds
    // the byte-equality/`applied` arm; a paint reached by `refresh()` instead of by `updatePane` reds the counter arm; a record
    // arm whose handler paints a DIFFERENT frame reds byte-equality.
    const problems: string[] = []

    // ---- THE CHANNEL, reached through `await import()` (it does not exist at this head) --------
    const channelModule = await (async (): Promise<{ mod: AnyRecord | null; problems: string[] }> => {
      try {
        return { mod: (await import('../../../src/renderer/pane-events.js')) as AnyRecord, problems: [] }
      } catch (error) {
        return {
          mod: null,
          problems: [
            `limb r6(ii): \`src/renderer/pane-events.ts\` cannot be imported at this head (${msgOf(error)}) — §2's channel is the ` +
              `unit's NEW module, so the record arm's entry (\`deliver()\`) has no subject (reported, never skipped)`,
          ],
        }
      }
    })()
    problems.push(...channelModule.problems)
    const createPaneEvents = channelModule.mod === null ? undefined : channelModule.mod['createPaneEvents']
    if (channelModule.mod !== null && typeof createPaneEvents !== 'function') {
      problems.push('limb r6(ii): `createPaneEvents` does not resolve on `src/renderer/pane-events.js` — the RECORD arm has no entry')
    }

    // ---- THE CHAIN, the client, and the ONE handler instance ---------------------------------
    const chain = buildChain(problems, 'r6(ii)')
    const createDisplayClient = readFn(displayClientModule, 'createDisplayClient')
    if (createDisplayClient === null) {
      problems.push('limb r6(ii): `createDisplayClient` does not resolve on the LANDED `src/renderer/display-client.js` — the crossing’s renderer half is absent')
    }

    if (chain === null || createDisplayClient === null || typeof createPaneEvents !== 'function') {
      expect(
        problems,
        `limb r6(ii)+r7 (behavioural) — the RECORD arm (§6 r6(ii), §6 r7; §1/§2). ${problems.length} problem(s). The arm cannot be ` +
          `driven at this head (the chain, the client or the channel is absent — each reported above by name), so nothing below is ` +
          `read rather than quietly skipped.`,
      ).toEqual([])
      return
    }

    // TWO IDENTICAL HOSTS: the same seed, the same cache mutation — so a byte-equal applied root is a reading of the DISPATCH.
    const driveDirect = seedHost('direct')
    const driveRecord = seedHost('record')
    try {
      const channel = (createPaneEvents as () => AnyRecord)()
      const subscribeRecord = channel['subscribeRecord'] as AnyFn
      const fire = channel['fire'] as AnyFn
      const deliver = channel['deliver'] as AnyFn
      const recordPanes = channel['recordPanes'] as AnyFn

      const client = (createDisplayClient as (port: unknown) => AnyRecord)(portOver(chain))
      const invocations: Invocation[] = []
      let active: HostDrive = driveDirect
      let arm = '(none)'

      // THE ONE HANDLER INSTANCE. Its body is the paint seam plus a reading of what the client held at that instant — the
      // record arm's "the client's re-read" leg, and the direct arm's own zero-witness.
      const paint = (report: unknown): void => {
        const held = (client['reading'] as AnyFn).call(client) as AnyRecord | null
        const update = (active.host as unknown as AnyRecord)['updatePane']
        let verdict: AnyRecord | null = null
        if (typeof update === 'function') {
          try {
            verdict = (update as (id: string) => unknown).call(active.host, QUERY) as AnyRecord | null
          } catch (error) {
            problems.push(`limb ${arm}: \`updatePane('${QUERY}')\` THREW inside the handler (${msgOf(error)}) — the paint is total (§3)`)
            verdict = null
          }
        }
        invocations.push({
          arm,
          report,
          readingCarried: held === null ? [] : Object.keys(held),
          verdict,
        })
      }

      // ONE registration, through the RECORD declaration — so the SAME instance is reached by BOTH arms (§2's "one registry,
      // two declarations"): `fire` reaches it, and `deliver()` fires through `fire`.
      const release = subscribeRecord.call(channel, QUERY, paint)
      if (typeof release !== 'function') {
        problems.push('limb r6(ii): `subscribeRecord` answered no release — the record declaration has no withdrawal')
      }
      const census = recordPanes.call(channel) as unknown
      if (!Array.isArray(census) || fingerprint(census) !== fingerprint([QUERY])) {
        problems.push(
          `limb r6(ii): \`recordPanes()\` reads ${shown(census)} after ONE \`subscribeRecord('${QUERY}', …)\`, not exactly ` +
            `${shown([QUERY])} — the record arm's census is the declaration of who reads the record (§2)`,
        )
      }

      // ---- ARM 1: THE DIRECT ARM (the control the record arm is graded against) --------------
      arm = 'direct'
      active = driveDirect
      driveDirect.backRefs.set('probe-b3r-cache', ['probe-b3r-cache-owner'])
      driveDirect.resetCounters()
      const queryBefore = rootById(driveDirect.roots(), `pane-${QUERY}`)
      if (queryBefore === undefined) {
        problems.push(`limb r6(ii): the DIRECT arm's host carries no live \`pane-${QUERY}\` frame — the arm has no subject`)
      }
      let directFireThrew = ''
      try {
        fire.call(channel, QUERY)
      } catch (error) {
        directFireThrew = msgOf(error)
      }
      await settle()
      if (directFireThrew !== '') {
        problems.push(`limb r6(ii): \`fire('${QUERY}')\` THREW (${directFireThrew}) — \`fire\` never throws`)
      }
      const directInvocation = invocations[0]
      if (directInvocation === undefined || directInvocation.arm !== 'direct') {
        problems.push(
          `limb r6(ii): the DIRECT arm invoked the handler ${invocations.length} time(s) with the first arm reading ` +
            `${shown(directInvocation?.arm)} — \`fire\` must reach the record-declared handler (that is §2's one registry)`,
        )
      }
      const directCounters = driveDirect.counters()
      if (directCounters.applies !== 1) {
        problems.push(
          `limb r6(ii): the DIRECT arm called \`applyContentReconcile\` ${directCounters.applies} time(s), not exactly once — with this ` +
            `arm dead, the record arm's own apply could not be distinguished from a harness that always applies`,
        )
      }
      if (queryBefore !== undefined && rootById(driveDirect.roots(), `pane-${QUERY}`) === queryBefore) {
        problems.push('limb r6(ii): the DIRECT arm left the pane\'s root the SAME OBJECT — the control arm must really paint')
      }
      const directVerdict = directInvocation?.verdict ?? null
      if (directVerdict === null || directVerdict['painted'] !== true) {
        problems.push(`limb r6(ii): the DIRECT arm's verdict reads ${shown(directVerdict)}, not a \`painted:true\` verdict`)
      }
      const directBytes = appliedBytes(driveDirect, directVerdict)

      // ---- ARM 2: THE RECORD ARM -------------------------------------------------------------
      // The wiring `B-2` §4/§O-1 pins: ONE `client.subscribe`, whose body is the channel's `deliver()` — a SECOND
      // `client.subscribe`/`installDisplayCrossing` call would be a second `ipcRenderer.on` registration for ONE channel (the
      // measured `B2-ADV-04` fault the unit refuses).
      const deliverReports: unknown[] = []
      const clientSubscription = (client['subscribe'] as AnyFn)(() => {
        deliverReports.push(deliver.call(channel))
      }) as AnyRecord
      if (clientSubscription['subscribed'] !== true) {
        problems.push(
          `limb r6(ii): the client refused the port (reason ${shown(clientSubscription['reason'])}) — the record arm has no re-read ` +
            `and therefore no \`deliver()\``,
        )
      }
      const boot = (await (client['fill'] as AnyFn)()) as AnyRecord | null
      if (boot === null) {
        problems.push('limb r6(ii): the client\'s boot read answered `null` over a constructed family — the re-read leg has no shape to hold')
      }

      arm = 'record'
      active = driveRecord
      driveRecord.backRefs.set('probe-b3r-cache', ['probe-b3r-cache-owner'])
      // THE TWO HOSTS MUST BE IN THE SAME STATE for a byte-equal frame to be a reading of the DISPATCH.
      if (driveDirect.backRefs.size !== driveRecord.backRefs.size) {
        problems.push(
          `limb r6(ii): the two hosts' caches read ${driveDirect.backRefs.size} and ${driveRecord.backRefs.size} entries — the two ` +
            `arms did not run over the same inputs, so "byte-equal" would not be a reading of the dispatch`,
        )
      }
      const recordQueryBefore = rootById(driveRecord.roots(), `pane-${QUERY}`)
      if (recordQueryBefore === undefined) {
        problems.push(`limb r6(ii): the RECORD arm's host carries no live \`pane-${QUERY}\` frame — the arm has no subject`)
      }
      driveRecord.resetCounters()
      const pushesBefore = chain.sends()
      const write = (chain.record['commitTab'] as AnyFn)('tab-a', entryFor('doc-a') as never) as AnyRecord
      if (write['ok'] !== true) {
        problems.push(
          `limb r6(ii): \`commitTab('tab-a', {documentId:'doc-a'})\` answered ${shown(write)} — a refused write means the record arm's ` +
            `trigger never happened, and the zero below would be a reading of nothing`,
        )
      }
      await settle()
      await settle()

      // (i) THE WRITE CROSSED: one push, one arrival at the client's listener, one `deliver()`.
      const pushes = chain.sends() - pushesBefore
      if (pushes !== 1) {
        problems.push(
          `limb r6(ii): ONE STORE WRITE PRODUCED ${pushes} PUSH(ES) on the delivery's sink — the crossing is one write → one ` +
            `payload-free push (the \`${PUSH_CHANNEL_NAME}\` shape \`B-2\` pins), so the record arm's trigger is one event`,
        )
      }
      if (deliverReports.length !== 1) {
        problems.push(
          `limb r6(ii): the client's listener called \`deliver()\` ${deliverReports.length} time(s) for one write — the record arm's ` +
            `entry is reached ONCE per push, and a second subscription would double it (the \`B2-ADV-04\` fault this unit refuses)`,
        )
      }
      const reports = (deliverReports[0] ?? []) as unknown
      if (!Array.isArray(reports)) {
        problems.push(`limb r6(ii): \`deliver()\` answered ${shown(reports)}, not a \`FireReport[]\``)
      } else if (reports.length !== 1) {
        problems.push(
          `limb r6(ii): \`deliver()\` answered ${reports.length} report(s) (${shown(reports)}) — ONE pane declared record interest, so ` +
            `ONE report is the record arm's answer`,
        )
      }
      const report = Array.isArray(reports) ? (reports[0] as AnyRecord | undefined) : undefined
      if (report !== undefined) {
        if (report['paneId'] !== QUERY || report['fired'] !== true || report['reason'] !== 'fired') {
          problems.push(
            `limb r6(ii): the record arm's report reads ${shown(report)}, not \`{paneId:'${QUERY}', fired:true, reason:'fired', …}\``,
          )
        }
        if (report['handlers'] !== 1) {
          problems.push(
            `limb r6(ii): the record arm's report reads \`handlers\` = ${shown(report['handlers'])}, not 1 — ONE registration serves ` +
              `both arms (a second registration for the record arm would read 2)`,
          )
        }
      }

      // (ii) THE SAME HANDLER INSTANCE, AND THE CLIENT'S RE-READ REACHED IT.
      const recordInvocation = invocations.find((entry) => entry.arm === 'record')
      if (recordInvocation === undefined) {
        problems.push(
          `limb r6(ii): \`deliver()\` did NOT invoke the handler — the record arm dispatched ${invocations.length} invocation(s) in ` +
            `total (arms read: [${invocations.map((entry) => entry.arm).join(', ')}])`,
        )
      } else {
        if (fingerprint(recordInvocation.readingCarried.includes('tab-a')) !== fingerprint(true)) {
          problems.push(
            `limb r6(ii): at the moment the RECORD arm painted, the client held [${recordInvocation.readingCarried.join(', ')}] — the ` +
              `push carries nothing, so the ONLY correct answer to it is a fresh read, and the re-read's shape must carry the entry ` +
              `the write landed (\`tab-a\`) BEFORE \`deliver()\` runs`,
          )
        }
        // THE SAME INSTANCE: one registration, one invocation per arm, and the direct arm's invocation is the same object.
        if (directInvocation !== undefined && recordInvocation.report === undefined) {
          problems.push('limb r6(ii): the record arm\'s handler ran without a report — `deliver()` must hand it the `fire` report')
        }
        if (invocations.filter((entry) => entry.arm === 'record').length !== 1) {
          problems.push(
            `limb r6(ii): the record arm invoked the handler ${invocations.filter((entry) => entry.arm === 'record').length} time(s), ` +
              `not EXACTLY ONCE — \`deliver()\` fires each record-interested pane once`,
          )
        }
      }

      // (iii) ONE PAINT, AND THE SAME THREE ZEROES.
      const recordCounters = driveRecord.counters()
      if (recordCounters.applies !== 1) {
        problems.push(
          `limb r6(ii): the RECORD arm called \`applyContentReconcile\` ${recordCounters.applies} time(s), not EXACTLY ONE — a record ` +
            `arrival is ONE pane paint, not a re-assembly`,
        )
      }
      if (recordQueryBefore !== undefined && rootById(driveRecord.roots(), `pane-${QUERY}`) === recordQueryBefore) {
        problems.push(
          `limb r6(ii): the RECORD arm left the pane's root the SAME OBJECT — the record arm's paint must really replace the frame, or ` +
            `its zeroes are a reading of a paint that never happened`,
        )
      }
      for (const [label, counters] of [
        ['DIRECT', directCounters],
        ['RECORD', recordCounters],
      ] as const) {
        if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
          problems.push(
            `limb r6(ii) (${label} arm): the arm read ${countersReading(counters)} — INV-E pins \`0 loadAppGraph\`, \`0 ` +
              `mountOperator\`, \`0 refresh()\` on EVERY pane update, and it holds for the record arm as much as for the direct one ` +
              `(a pane update MAY write the record, which is why \`INV-R\`'s three would be unfalsifiable here)`,
          )
        }
      }
      const recordVerdict = recordInvocation?.verdict ?? null
      if (recordVerdict === null || recordVerdict['painted'] !== true) {
        problems.push(`limb r6(ii): the RECORD arm's verdict reads ${shown(recordVerdict)}, not a \`painted:true\` verdict`)
      }
      if (recordVerdict !== null && fingerprint(recordVerdict['applied']) !== fingerprint([`pane-${QUERY}`])) {
        problems.push(
          `limb r6(ii): the RECORD arm's \`applied\` reads ${shown(recordVerdict['applied'])}, not exactly \`['pane-${QUERY}']\``,
        )
      }

      // (iv) THE ARMS CANNOT DIVERGE: THE APPLIED ROOT IS BYTE-EQUAL.
      const recordBytes = appliedBytes(driveRecord, recordVerdict)
      if (recordBytes === directBytes) {
        // the byte-equality holds — and the control that it is a READING: both arms really authored a frame.
        const framePresent = recordBytes.includes('pane-gnosis-query')
        if (!framePresent) {
          problems.push(
            `limb r6(ii): the byte-equal applied root does not even name \`pane-${QUERY}\` (${recordBytes.slice(0, 240)}) — "equal" ` +
              `would then mean "both arms applied nothing"`,
          )
        }
      } else {
        problems.push(
          `limb r6(ii): the DIRECT and RECORD arms authored DIFFERENT applied roots over IDENTICAL hosts and identical caches ` +
            `(direct ${directBytes.slice(0, 400)} vs record ${recordBytes.slice(0, 400)}) — §2's ONE dispatch: \`deliver()\` fires ` +
            `THROUGH \`fire\`, so the same handler over the same inputs cannot author two frames`,
        )
      }
      if (typeof release === 'function') {
        try {
          ;(release as AnyFn)()
        } catch (error) {
          problems.push(`limb r6(ii): releasing the record declaration THREW (${msgOf(error)}) — the release is total`)
        }
      }
    } finally {
      driveDirect.restore()
      driveRecord.restore()
    }

    expect(
      problems,
      `limb r6(ii)+r7 (behavioural) — the RECORD arm (§6 r6(ii), §6 r7; §1/§2's two arms; INV-E). ${problems.length} problem(s). A ` +
        `REAL store on a \`/tmp\` path, \`B-1\`'s delivery + record, the \`B-2\` crossing shape (a port whose \`read\` answers the ` +
        `record and whose \`onChanged\` is the payload-free push), the landed client, ONE \`client.subscribe\` whose body is ` +
        `\`deliver()\`: one write ⇒ one push ⇒ one re-read ⇒ ONE paint of the pane's own root, with the DIRECT arm's byte-equal ` +
        `applied root as the control and the same three zeroes on both arms. ` +
        `envelope-class — a real store on a \`/tmp\` path + the REAL SidebarPanes over the layout-less DOM shim; the store's own ` +
        `on-disk bytes are \`B-2\`'s \`G8(ii)\` reading, and a rendered repaint is \`G8\`'s alone; no geometry, no computed style, ` +
        `no pointer`,
    ).toEqual([])
  })
})
