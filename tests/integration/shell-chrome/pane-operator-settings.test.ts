// tests/integration/shell-chrome/pane-operator-settings.test.ts — unit `B-9` `pane-operator-settings`'s HOST rows
// (`O2`, `O3`, `O4`, `O5`'s both-ways host drive, `O6`, `O7`) plus the two `F-3` MEASUREMENT rows. Authored BEFORE any byte of
// the landing (RCA-1: the red set is RUN and REPORTED before implementation). The DECLARATION/CLAUSE rows (`O1`, `O5`'s
// purity/totality half, `O8`, `S1`) live in `tests/unit/shell-chrome/pane-operator-settings.test.ts`.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-9-pane-operator-settings.md` §6 plus the sections it re-states —
//   §1 `F-2` THE HAZARD: `paintPane`'s step 2 answers `operator-scope` for any `def.scope === 'operator'`, so a census entry
//        without a paint makes `fire` answer `fired:true, handlers:1` while no `updatePane` can paint — and `renderer.ts`'s
//        `⟨B-9⟩` fallback is skipped PRECISELY because it fired (`D-40`'s `m6` class as a real hazard).
//   §1 `F-3` THE LAST RE-ASSEMBLY: `renderer.ts`'s `firePaneUpdate` = `fire(paneId)`, `if (report.fired) return`, then
//        `⟨B-9⟩ if (registry.get(paneId)?.scope === 'operator' && host) void host.refresh()`; `host.refresh()` re-fetches and then
//        runs `loadAppGraph(...)` + `mountOperator()`. The two MEASUREMENT rows below read that route on the booted host, so the
//        delegation's "1 mountOperator" claim is MEASURED rather than assumed.
//   §1 `F-4`/§2 THE FIELD CENSUS: a settings push that moved an APP-GRAPH member (`representationMode`/`layout`/`enabledPanes`/
//        `defaultDocumentId`) legitimately re-derives; one that moved only an operator-only member (`topK`/`panesInitialized`/the
//        operator enable set) must deliver by FIRE alone. `O5` drives BOTH directions through `onOperatorSettingsChanged`, with
//        `requestRebuild` counted.
//   §1 `F-5` THE OPERATOR SURFACE IS ITS OWN MANAGED GRAPH: `mountOperator()` builds `buildOperatorEnvelope(registry, ctx)` — ONE
//        `section` per ENABLED operator pane, `props.id = 'operator-pane-<id>'` — translates it against the isolated `GraphScope`
//        into a RETAINED node list and renders it through a retained `DomAdapter` + `prevMap`. §3's six steps therefore make a
//        PER-PANE paint expressible: re-author ONE section, swap it into the retained list by identity, re-render through the SAME
//        adapter (what a DOM interaction on this surface already does, `handleOperatorEvent` → `renderOperator()`).
//   §1 `F-7`/§5 THE STORE-LISTING RACE (`B6-F6`'s residue): `refreshRegistryManage()` issues `bridge.rag.stores()` and commits
//        `lastStoreListing` with NO stamp, so two racing settlements to ONE subject are last-settling-wins. `O6` requires the
//        GENERATION stamp (`ASM-B6-3`/`B5-F5(b)`, already the `paintReplumbedPane` idiom): the losing answer is DROPPED — not
//        queued (`D-82` clause 4), not committed, and it paints nothing.
//   §1 `F-8`/§5 `ADV-B8-1`: the `noEditAccess` CLEAR on the two SUCCESS paths of the CRUD host writes the field WITHOUT firing, and
//        the settle's field census does not name it, so a sibling pane rendering the H-2 indicator keeps it until it hears again.
//        `O7` is EXPECTED RED at this head by design — the fix is ONE line in `src/renderer/gnosis-crud-panes.ts`, OUTSIDE this
//        unit's write scope (`F-8`: "row first, grant second; never a silent widening").
//   §2        the two sources NAMED and what each must REFUSE: `settings` answers the OPERATOR-SETTINGS PUSH (the payload IS the
//        store's state) plus the store-listing re-read's own settlement; `gnosis-status` answers its OWN settled health report
//        (`refreshStatus`'s two arms, both already naming `'gnosis-status'`). THE PAINT RE-READS NOTHING (`ASM-B9-1`): no
//        `operatorSettings.get()` on the fire, no second `rag.stores()` in the paint, no `bridge.gnosis.status()` — so §2's
//        paint-window census is graded ZERO, with the producer's own calls as the positive.
//   §3        THE ONE DESIGN CALL: `updatePane`'s operator arm stops being a REFUSAL and becomes a PAINT (route → live operator
//        surface → the pane's section → the fresh section → `renderOperator()` → a verdict EARNED from the surface's own report).
//        `INV-E` therefore holds on the operator family too: `0 loadAppGraph`, `0 mountOperator`, `0 refresh()`.
//   §4        SITE 1 (`renderer.ts`'s `⟨B-9⟩` branch) is DELETED — `m1` is that branch restored; SITE 2
//        (`onOperatorSettingsChanged`'s unconditional `requestRebuild('operator')`) is REPLACED by the field census — `m2` is the
//        unconditional rebuild restored. §4 also says what is NOT removed (`refresh()`/`mountOperator` on their own routes), which
//        is why no row here may be satisfied by deleting them.
//   §6's AUTHORING REFUSALS (`D-43`) — NO row may demand a paint from a BARE fire over already-painted state; no row may require a
//        live engine, a live Electron app or an operator store; no row may be satisfied by deleting `refresh()`/`mountOperator`.
//
// THE HARNESS CONSTRUCTS THE WIRING THE WAY `renderer.ts` DOES — a harness that built its own seam would be reading a different
// tree:
//     const gnosisPanes    = new GnosisPanes({ registry, bridge, onChanged: (paneId) => firePaneUpdate(paneId) })
//     gnosisPanes.registerPanes()
//     const gnosisCrudPanes = new GnosisCrudPanes({ registry, bridge, onChanged: (paneId) => firePaneUpdate(paneId) })
//     gnosisCrudPanes.registerPanes()
//     host = new SidebarPanes({ mount, operatorMount, registry, bridge, backRefs, editController, events: paneEvents, gnosis })
//     await host.boot(runtime)
// `firePaneUpdate` has TWO shapes and each row states which it reads:
//   · the LANDED shape (the DEFAULT) — `fire(paneId)` and nothing else. That IS §4 SITE 1's deletion, so every paint row grades
//     the post-landing wiring; `m1` RESTORES the deleted branch as an explicit mutant and is CAUGHT when it moves `refresh`.
//   · the PRE-LANDING shape (`legacyFallback: true`) — the `⟨B-9⟩` branch reproduced VERBATIM, used ONLY by the two `F-3`
//     MEASUREMENT rows, which report the delegation's "1 mountOperator" claim as a READING.
// The `editController` is the renderer's own shape: `requestRebuild(kind)` RECORDS the call and hands it to
// `host.reDerive(kind)` (`onRebuild: (kind) => void host?.reDerive(kind)`), so a settings push that rebuilds is measured as the
// `refresh`/`loadAppGraph`/`mountOperator` SITES it really runs rather than as an unexecuted intent.
//
// THE OBSERVABLES (the REAL `SidebarPanes` + the REAL `GnosisPanes`/`GnosisCrudPanes` over `installShim()`):
//   · `INV-E`: `updatePane`/`refresh`/`loadAppGraph`/`mountOperator` wrapped ON THE INSTANCE (an own-property shadows the prototype
//     method, so the class's OWN calls are counted);
//   · the paint's OWN verdict (`{paneId, painted, reason, applied}`), recorded by that same `updatePane` wrapper;
//   · THE OPERATOR SURFACE: `host.operatorMount` is a PUBLIC field, and the rendered SHIM TREE is walked — `operatorMount.children[0]`
//     is the `operator-panes` assembly root and ITS children are the one-per-pane `operator-pane-<id>` SECTIONS, each carrying an
//     authored `id` (its CARRIER) and a `data-wire` node id; the AUTHORED text (`topK: <n>`, `Version: <v>`, the store rows) is read
//     off the same tree through `innerHTML`. The RETAINED node list (`host.operatorNodes`) is where §3 step 4's "swapped by identity
//     of that section only, every sibling node the SAME OBJECT" is read — as OBJECT IDENTITY, never as equality;
//   · the RUNTIME's materialized roots (the app-graph frames the CRUD panes render into, `pane-<id>`) off a recording runtime
//     double's `materializedContentRoots()`;
//   · a bridge double that COUNTS every call §2's census names (`operatorSettings.get`/`.set`, `rag.stores`, `rag.snapshot`,
//     `rag.docHeads`, `rag.backlinks`, `rag.query`, `security.get`, `template.get`, `gnosis.status`, `gnosis.documents`,
//     `gnosis.wikis`) and RECORDS the handlers the host subscribes — `operatorSettings.onChanged` is how a settings push is
//     DELIVERED, so the rows drive the PUBLIC subscription the host registered at boot, never a private method;
//   · the app's OWN `window.provident.sidebar` seam (installed by `boot`), which is `O6`'s entry — `registryManage`;
//   · a COUNTING FAÇADE over a REAL `createPaneEvents()` that records every `fire` (id + report + whether the dispatch was dropped)
//     and the DELTA of the whole bridge census across that call — the FIRE→PAINT WINDOW, which is where §2's zeros are read;
//   · an ORDERED EVENT LOG (`timeline`), pushed by the SAME wrappers as they enter — `fire:<paneId>`, `updatePane:<paneId>`,
//     `refresh`, `loadAppGraph`, `mountOperator`. It changes what NO counter counts; it exists because `O5(c)` must read the one
//     thing a counter cannot say: that the `settings` FIRE's index PRECEDES the operator re-author's (`mountOperator`) index, i.e.
//     that the pane's own paint is never a by-product of the re-assembly (ADJ 2's load-bearing order).
//
// THE `m1`..`m6` MUTANT IDIOM (`B-6`'s `D6` + `B-7`/`B-8`'s `X3`): a mutant is driven on the SAME harness shape and its reading is
// COMPUTED into the aggregate failure message (`B5-DOC-PRINT`: no `console.log`); a mutant that is NOT caught is itself a row
// failure (a harness that cannot SEE a mutant cannot prove the invariant it falsifies). `m1`/`m2` are ADDITIONAL registrations on
// the REAL channel / the real `editController` that restore the two removed sites verbatim, on a NO-`events` seed so the mutant is
// the ONLY delivery; `m3` is the row's own paint VERIFIER driven with the forged absence words (its drivable form: §3 REPLACES step
// 2's `operator-scope` answer, so the shipped host no longer answers that word — what must still be able to REFUSE it is the
// verifier, or a landing that kept the refusal would pass every paint row silently); `m4` is a NO-OP delivery over a MOVED source,
// completed by the REAL seam over the same moved state; and `m6` is ONE PER MOVED PANE — that pane's fire DROPPED in the counting
// façade, after which `INV-E` reads `0/0/0` PERFECTLY, ZERO paints happen, and the pane still names its OLD data while the host's
// field has moved (`D-40`: the counters are necessary and not sufficient).
//
// LAYER (MANDATORY, D-10 / `RCA-12`): every row here is ENVELOPE-class — the REAL host over the LAYOUT-LESS DOM shim (no CSS, no
// computed style, no layout) against a recording runtime double and a counting bridge. The observables are the paint's verdict,
// CALL COUNTS, the AUTHORED legacy tree, the rendered SHIM TREE's carriers/wires and NODE IDENTITY. What this layer can NEVER read,
// named so nobody quotes it: that a frame was re-minted in a real window, the pane as the user sees it, its box/scroll/style, any
// pointer, the NUMBER of IPCs on the wire (the census counts BRIDGE calls) and the assembled app —
// `docs/L1/unit-b-9-pane-operator-settings.md` §8/`G8` are the ONLY app-green readings.
//
// NON-VACUITY (stated per row in its own comment): every zero is floored on the SAME harness shape by a positive reading that must
// move — the producer's own settlement beside the paint-window zeros, the `painted:true` + moved authored text beside the
// `unchanged` controls, the app-graph rebuild `O5`'s lawful direction drives beside the operator-only zero, `O6`'s winning
// settlement beside the dropped loser, `O7`'s two-pane H-2 indicator beside the one pane that repaints — and `O4`'s mutants beside
// its per-pane `m6`s.
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`, no `vi.mock`, no `console.log` (a reading
// that must be printed is folded into the aggregate failure message — `B5-DOC-PRINT`); it writes nothing; every path derives from
// THIS FILE's location, so a missing substrate FAILS instead of skipping. It never demands a paint from a bare fire over
// already-painted state (`D-43`): each paint arm MOVES ITS SOURCE FIRST through the pane's OWN producer (the settings push through
// the recorded `operatorSettings.onChanged` subscriber, the status through `GnosisPanes.refreshStatus`, the listing through the
// app's own `registryManage` seam), and the idempotence readings are explicit CONTROLS.
import { describe, it, expect, beforeAll } from 'vitest'

import { installShim, ShimElement } from '../../../src/shared/dom-shim.js'
import { createPaneRegistry } from '../../../src/renderer/pane-registry.js'
import { createPaneEvents } from '../../../src/renderer/pane-events.js'
import { SidebarPanes } from '../../../src/renderer/sidebar-panes.js'
import { GnosisPanes } from '../../../src/renderer/gnosis-panes.js'
import { GnosisCrudPanes } from '../../../src/renderer/gnosis-crud-panes.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../../../src/main/template-shape.js'

const SETTINGS_PANE = 'settings'
const STATUS_PANE = 'gnosis-status'
/** The two panes this unit gives a paint (§6 `O2`/`O3`). */
const OPERATOR_PANES: readonly string[] = [SETTINGS_PANE, STATUS_PANE]
const DOCUMENTS_PANE = 'gnosis-documents'
const WIKIS_PANE = 'gnosis-wikis'
const CRUD_PANES: readonly string[] = [DOCUMENTS_PANE, WIKIS_PANE]
const DOC_NAV = 'doc-nav'
const SEARCH = 'search'
const CROSSLINKS = 'crosslinks'
const TEMPLATE_EDITOR = 'template-editor'
const GNOSIS_QUERY = 'gnosis-query'
/** Every app-graph pane the seed enables, so each has a materialized frame and no arm is vacuous for want of a mount. */
const APP_GRAPH_PANES: readonly string[] = [DOC_NAV, SEARCH, CROSSLINKS, TEMPLATE_EDITOR, GNOSIS_QUERY, DOCUMENTS_PANE, WIKIS_PANE]

/** THE TWO PINNED CENSUS PREDICATES (§2's declaration; adjudications 1 and 2) — named HERE so a host arm's failure message cites the
 *  symbol whose answer it is reading, and can say WHICH predicate must have answered MOVED. */
const APP_GRAPH_PREDICATE = 'settingsMovesAppGraph'
const OPERATOR_CENSUS_PREDICATE = 'settingsMovesOperatorCensus'

/** THE MARKERS: every "the pane's answer moved" arm is a comparison of two AUTHORED values, never a claim about a sentence. */
const TOPK_OLD = 5
const TOPK_NEW = 12
const VERSION_OLD = 'B9-ONE'
const VERSION_NEW = 'B9-TWO'
const STORE_BOOT = 'b9-store-boot'
const STORE_NEWER = 'b9-store-newer'
const STORE_LOSER = 'b9-store-loser'
const STORE_CONTROL = 'b9-store-control'
/** The H-2 indicator's authored sentence (`gnosis-crud-panes.ts`'s two `noEditAccess` arms). */
const NO_EDIT_TEXT = 'No edit access'

const fingerprint = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

/** A value as a failure message prints it. */
const shown = (value: unknown): string => (value === undefined ? '(absent)' : fingerprint(value))

/** Await macrotasks a few times: a producer's answer is a bridge PROMISE, and the fire + paint it settles into are HANDED OFF. */
const settle = async (rounds = 10): Promise<void> => {
  for (let i = 0; i < rounds; i += 1) await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

const NOW = new Date().toISOString()

// ---------------------------------------------------------------------------
// THE AUTHORED-CONTENT READING — every app-graph arm reads the ENVELOPE the host authored (never the DOM).
// ---------------------------------------------------------------------------
function collectText(node: unknown, out: string[]): string[] {
  if (node == null) return out
  if (typeof node === 'string') {
    out.push(node)
    return out
  }
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, out)
    return out
  }
  if (typeof node !== 'object') return out
  const record = node as Record<string, unknown>
  if (typeof record['content'] === 'string') out.push(record['content'])
  collectText(record['children'], out)
  return out
}

/** Every authored text line of a node, in author order. */
const authoredText = (node: unknown): string => collectText(node, []).join('\n')

const cssIdOf = (node: unknown): string | null => {
  const id = (node as { props?: { id?: unknown } } | null | undefined)?.props?.id
  return typeof id === 'string' ? id : null
}

/** The translated provident node's own minted id — the `data-wire` carrier the rendered tree exposes. */
const wireOf = (node: unknown): string | null => {
  const id = (node as { id?: unknown } | null | undefined)?.id
  return typeof id === 'string' ? id : null
}

const rootById = (roots: readonly unknown[], cssId: string): unknown => roots.find((root) => cssIdOf(root) === cssId)

const rootIds = (roots: readonly unknown[]): string[] => roots.map((root) => cssIdOf(root) ?? '(nonesuch)')

// ---------------------------------------------------------------------------
// THE SHIM-TREE READING — the operator surface's rendered CARRIERS and WIRES. `DomAdapter` renders with `nodeIdAttribute: true`, so
// each rendered element carries the authored `id` (its carrier) and a `data-wire` node id (its identity carrier).
// ---------------------------------------------------------------------------
const wireOfElement = (element: ShimElement): string | null => {
  const wire = ((element.dataset ?? {}) as unknown as Record<string, string>)['wire']
  return typeof wire === 'string' ? wire : null
}

const childrenOf = (element: ShimElement | null | undefined): ShimElement[] =>
  element == null ? [] : ((element.children ?? []) as ShimElement[])

/** Every rendered element of a subtree, in render order (the subtree root first). */
function elementsOf(element: ShimElement | null | undefined, out: ShimElement[] = []): ShimElement[] {
  if (element == null) return out
  out.push(element)
  for (const child of childrenOf(element)) elementsOf(child, out)
  return out
}

const elementById = (element: ShimElement | null | undefined, id: string): ShimElement | null => {
  for (const candidate of elementsOf(element)) {
    if (String(candidate.id ?? '') === id) return candidate
  }
  return null
}

/** The `operator-panes` assembly root's rendered element, or `null`. */
function operatorRootElement(mount: ShimElement | null): ShimElement | null {
  if (mount == null) return null
  const children = childrenOf(mount)
  if (children.length === 1) return children[0]
  return elementById(mount, 'operator-panes')
}

/** THE ONE SECTION PER ENABLED OPERATOR PANE (`buildOperatorEnvelope`: `props.id = 'operator-pane-<id>'`). */
interface OperatorSection {
  paneId: string
  id: string
  wire: string | null
  element: ShimElement
}

function operatorSections(mount: ShimElement | null): OperatorSection[] {
  const root = operatorRootElement(mount)
  const sections: OperatorSection[] = []
  for (const element of childrenOf(root)) {
    const id = String(element.id ?? '')
    if (!id.startsWith('operator-pane-')) continue
    sections.push({ paneId: id.slice('operator-pane-'.length), id, wire: wireOfElement(element), element })
  }
  return sections
}

/** Every `data-wire` in a subtree — the node census a section RENDERS. */
function wiresUnder(element: ShimElement | null): string[] {
  const wires: string[] = []
  for (const candidate of elementsOf(element)) {
    const wire = wireOfElement(candidate)
    if (wire !== null) wires.push(wire)
  }
  return wires
}

/** The rendered text of the whole operator surface. */
const operatorText = (mount: ShimElement | null): string =>
  mount == null ? '' : String((mount as { innerHTML?: string }).innerHTML ?? '')

/** `topK: <n>` off the rendered settings section, or `null`. */
const renderedTopK = (mount: ShimElement | null): number | null => {
  const match = /topK:\s*(-?\d+)/.exec(operatorText(mount))
  return match === null ? null : Number(match[1])
}

/** `Version: <v>` off the rendered status section, or `null`. */
const renderedStatusVersion = (mount: ShimElement | null): string | null => {
  const match = /Version:\s*([^<\n]*)/.exec(operatorText(mount))
  return match === null ? null : match[1]!.trim()
}

const renderedHasStore = (mount: ShimElement | null, store: string): boolean => operatorText(mount).includes(store)

// ---------------------------------------------------------------------------
// THE SEED FIXTURES.
// ---------------------------------------------------------------------------
function documentSnapshot(): Record<string, unknown> {
  return {
    store: 'main',
    nodes: [{ id: 'head-a', type: 'h1', content: 'Doc A', ownedNodeIds: [], createdAt: NOW, updatedAt: NOW }],
    edges: [
      { id: 'dh1', kind: 'doc-head', source: 'head-a', target: 'doc-a', createdAt: NOW, updatedAt: NOW, documentIds: ['doc-a'] },
    ],
  }
}

/** A `rag.stores()` listing carrying ONE distinctly named store — the marker every store arm reads. */
const storeListing = (name: string): Record<string, unknown> => ({
  stores: [{ name, default: true, persistenceFile: 'provident-rag.json', status: 'loaded' }],
})

/** A `HealthReport` whose `version` is the marker the status arms read (`gnosisStatusContent` authors `Version: <v>`). */
const healthReport = (version: string): Record<string, unknown> => ({
  schemaVersion: 1,
  idFormat: 'b9',
  state: 'Ready',
  version,
  subsystems: { store: true, graph: true, lexical: true, vector: true, embedding: true, reranker: true },
  lastError: null,
})

/** The base operator-settings payload every `O5` arm derives from (the push IS the store's state, §2). */
const basePayload = (): Record<string, unknown> => ({
  enabledPanes: [...APP_GRAPH_PANES],
  enabledOperatorPanes: [...OPERATOR_PANES],
  panesInitialized: true,
  defaultDocumentId: null,
  topK: TOPK_OLD,
  representationMode: 'html',
})

// ---------------------------------------------------------------------------
// THE RECORDING RUNTIME DOUBLE — `loadEnvelope` seeds the materialized root set (the Runtime's own closed class),
// `materializedContentRoots()` answers it (the paint's step 2), `applyContentReconcile` records the call, performs the channel's
// whole-root replace and answers the applied list, and `codeGet('')` answers `null` (the documented ABSENT live-envelope route).
// Unchanged from the `pane-gnosis` double, one unit over.
// ---------------------------------------------------------------------------
const PINNED_ROOT_IDS: readonly string[] = ['editor-toolbar', 'page-edit-surface', 'page-commit-warning', 'stage-landing']

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

interface RuntimeDouble {
  double: Record<string, unknown>
  roots: () => unknown[]
}

function recordingRuntime(): RuntimeDouble {
  const roots: unknown[] = []
  const applyAnswers: string[][] = []
  const double: Record<string, unknown> = {
    loadEnvelope: (envelope: unknown): void => {
      roots.length = 0
      roots.push(...contentRootsOf(envelope))
    },
    materializedContentRoots: (): unknown[] => [...roots],
    materializedDocumentRoots: (): unknown[] => roots.map((root) => ({ documentId: '', root })),
    applyContentReconcile: (input: unknown): Record<string, unknown> => {
      const read = (input ?? {}) as Record<string, unknown>
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
      applyAnswers.push([...applied])
      return { applied, warnings: [] }
    },
    materializedRoots: (): unknown[] => [...roots],
    applyCommand: (): void => undefined,
    nodeState: (): { states: unknown[] } => ({ states: [] }),
    codeGet: (): unknown => null,
    renderedHtmlResult: (): { renderedHtml: string } => ({ renderedHtml: '' }),
  }
  return { double, roots: () => [...roots] }
}

// ---------------------------------------------------------------------------
// THE HOST DRIVE.
// ---------------------------------------------------------------------------
interface SeedOptions {
  /** `true` → reproduce `renderer.ts`'s PRE-LANDING `firePaneUpdate` (the `⟨B-9⟩` fallback), VERBATIM. ONLY the two `F-3`
   *  MEASUREMENT rows ask for it; every other row grades the LANDED wiring (§4 SITE 1 deleted). */
  legacyFallback?: boolean
  /** THE `m6` INSTRUMENT: the counting façade still RECORDS the fire but dispatches NOTHING for these ids — "the fire was
   *  dropped", the state in which `INV-E` reads `0/0/0` perfectly while the pane stays stale. */
  dropFiresFor?: readonly string[]
  /** `false` → the host is handed NO channel (the `m1`/`m2`/`m4` seed: its own census subscriptions do not exist, so the only
   *  delivery is the one the row makes). */
  events?: boolean
  /** The mocked security groups — the CRUD host's fail-closed gates (`O7` flips them). */
  security?: readonly string[]
}

interface Counters {
  refresh: number
  loadAppGraph: number
  mountOperator: number
  updatePanes: number
  loadEnvelopes: number
  /** §2's paint-window census, member by member. */
  operatorSettingsGet: number
  operatorSettingsSet: number
  ragStores: number
  ragSnapshot: number
  ragDocHeads: number
  ragBacklinks: number
  ragQuery: number
  securityGet: number
  templateGet: number
  /** THE PRODUCERS' OWN CALLS — the positives that make the paint-window zeros readable (§2). */
  gnosisStatus: number
  gnosisDocuments: number
  gnosisWikis: number
  /** The registration census. */
  operatorSettingsChangedSubs: number
  paneVisibilitySubs: number
  paneCatalogPushes: number
}

interface FireWindow {
  paneId: string
  report: unknown
  dropped: boolean
  delta: Record<string, number>
}

/** ONE ARM'S READING (`O5`'s rig): every counter, the recorded `requestRebuild` kinds, the pane's verdicts, §2's fire→paint windows
 *  and the ORDERED event log — taken together so an arm's zeros, its positive and its ORDER are read off the same window. */
interface ArmReading {
  counters: Counters
  rebuilds: string[]
  verdicts: Array<Record<string, unknown>>
  windows: FireWindow[]
  timeline: string[]
  fires: Array<{ paneId: string; report: unknown; dropped: boolean }>
}

interface HostDrive {
  host: SidebarPanes | null
  gnosisPanes: Record<string, unknown> | null
  crud: Record<string, unknown> | null
  registry: ReturnType<typeof createPaneRegistry> | null
  channel: ReturnType<typeof createPaneEvents>
  hostSubscribed: boolean
  /** The harness's OWN failures (module load, boot) — every row reports them first. */
  seedProblems: string[]
  counters: () => Counters
  resetCounters: () => void
  verdicts: () => Array<Record<string, unknown>>
  fires: () => Array<{ paneId: string; report: unknown; dropped: boolean }>
  fireWindows: () => FireWindow[]
  rebuildRequests: () => string[]
  /** THE ORDERED EVENT LOG (`fire:<paneId>` / `updatePane:<paneId>` / `refresh` / `loadAppGraph` / `mountOperator`), cleared by
   *  `resetCounters()` — `O5(c)`'s fire-before-re-author arm is a reading of THIS, never of a counter. */
  timeline: () => string[]
  roots: () => unknown[]
  operatorMount: () => ShimElement | null
  sections: () => OperatorSection[]
  operatorNodes: () => unknown[]
  operatorText: () => string
  /** A private HOST field, read as the "the host's field moved" half of a reading (`lastOperatorSettings`,
   *  `lastStoreListing`). */
  hostField: (name: string) => unknown
  /** THE MUTANT SEAM for §4 SITE 2: the renderer's own `requestRebuild` hand-off, so a row can restore the unconditional rebuild
   *  and watch the SITES it runs. */
  requestRebuild: (kind: string) => void
  /** DELIVER a settings push the way the app does: through the `operatorSettings.onChanged` subscriber the host registered at boot. */
  broadcastSettings: (payload: Record<string, unknown>) => string[]
  /** The CRUD host's two producer entries (the `O7` subject). */
  crudDocuments: (tool: string, args: Record<string, unknown>) => string[]
  /** The status producer (`GnosisPanes.refreshStatus`) with a MOVED report. */
  refreshStatus: (version: string) => void
  /** The app's OWN `window.provident.sidebar.registryManage` seam (installed by `boot`) — `O6`'s entry. */
  registryManage: (request: Record<string, unknown>) => string[]
  setSecurity: (groups: readonly string[]) => void
  /** THE DEFERRED STORE-LISTING QUEUE: while armed, `rag.stores()` answers a promise the row resolves by hand (the race). */
  deferStores: (armed: boolean) => void
  pendingStores: () => number
  resolveStores: (index: number, answer: unknown) => void
  restore: () => void
}

async function seedHost(options: SeedOptions = {}): Promise<HostDrive> {
  installShim()
  const globals = globalThis as Record<string, unknown>
  const previousWindow = globals['window']
  globals['window'] = { provident: {} }

  const seedProblems: string[] = []
  const counters: Counters = {
    refresh: 0,
    loadAppGraph: 0,
    mountOperator: 0,
    updatePanes: 0,
    loadEnvelopes: 0,
    operatorSettingsGet: 0,
    operatorSettingsSet: 0,
    ragStores: 0,
    ragSnapshot: 0,
    ragDocHeads: 0,
    ragBacklinks: 0,
    ragQuery: 0,
    securityGet: 0,
    templateGet: 0,
    gnosisStatus: 0,
    gnosisDocuments: 0,
    gnosisWikis: 0,
    operatorSettingsChangedSubs: 0,
    paneVisibilitySubs: 0,
    paneCatalogPushes: 0,
  }
  const verdicts: Array<Record<string, unknown>> = []
  const firesLog: Array<{ paneId: string; report: unknown; dropped: boolean }> = []
  const fireWindows: FireWindow[] = []
  const rebuilds: string[] = []
  const onChangedHandlers: Array<(payload: unknown) => void> = []
  // ⟨THE ORDERED EVENT LOG (`O5`'s `(c)` arm, ADJ 2's load-bearing ORDER).⟩ Every wrapper below appends ONE entry as it ENTERS, so a
  // fire's index and the operator re-author's index are comparable: `fire:<paneId>` marks the fire's ENTRY (the pane's paint happens
  // inside it), `updatePane:<paneId>` the paint, and `refresh`/`loadAppGraph`/`mountOperator` the three re-assembly sites. It counts
  // NOTHING (every existing counter keeps its exact meaning); it is a SEQUENCE, and its only reader is `O5(c)`'s fire-before-mount arm.
  const timeline: string[] = []

  // THE MUTABLE ANSWERS the rows drive.
  let securityGroups: string[] = [...(options.security ?? ['read', 'dispatch', 'gnosis', 'gnosis-edit'])]
  let storesAnswer: unknown = storeListing(STORE_BOOT)
  let statusAnswer: Record<string, unknown> = healthReport(VERSION_OLD)
  let documentListAnswer: unknown = { items: [{ documentId: 'doc-a1', title: 'Doc A1', revision: 1, state: 'draft' }] }
  let deferStoresArmed = false
  const deferredStores: Array<{ resolve: (value: unknown) => void; reject: (reason: unknown) => void }> = []

  const registry = createPaneRegistry()

  const securityAnswer = async (): Promise<Record<string, unknown>> => {
    counters.securityGet += 1
    return { token: null, enabled: [...securityGroups] }
  }

  const sidebarBridge: Record<string, unknown> = {
    security: { get: securityAnswer },
    gnosis: {
      status: async (): Promise<Record<string, unknown>> => {
        counters.gnosisStatus += 1
        return statusAnswer
      },
      query: async (value: string): Promise<Record<string, unknown>> => ({ query: value, results: [] }),
      documents: async (tool: string, args: Record<string, unknown>): Promise<unknown> => {
        counters.gnosisDocuments += 1
        void args
        if (tool === 'gnosis.document.list' || tool === 'gnosis.wiki.list') return documentListAnswer
        return { documentId: 'doc-a1', title: 'Doc A1', revision: 1, state: 'draft' }
      },
      wikis: async (tool: string, args: Record<string, unknown>): Promise<unknown> => {
        counters.gnosisWikis += 1
        void args
        if (tool === 'gnosis.wiki.list') return [{ wikiId: 'wiki-a', name: 'Wiki A' }]
        if (tool === 'gnosis.wiki.get') return { wikiId: 'wiki-a', name: 'Wiki A2' }
        return null
      },
    },
    edit: {
      onRagStoreChanged: (_handler: (payload: unknown) => void): (() => void) => () => undefined,
      commit: async (): Promise<Record<string, unknown>> => ({ ok: true }),
      commitRich: async (): Promise<Record<string, unknown>> => ({ ok: true }),
      batch: async (): Promise<Record<string, unknown>> => ({ ok: true, applied: [] }),
    },
    rag: {
      snapshot: async (): Promise<Record<string, unknown>> => {
        counters.ragSnapshot += 1
        return documentSnapshot()
      },
      docHeads: async (): Promise<Record<string, unknown>> => {
        counters.ragDocHeads += 1
        return { documents: [{ documentId: 'doc-a', title: 'Doc A', path: [], tags: [] }] }
      },
      backlinks: async (nodeId: string): Promise<Record<string, unknown>> => {
        counters.ragBacklinks += 1
        return { nodeId, backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }
      },
      stores: async (): Promise<unknown> => {
        counters.ragStores += 1
        if (!deferStoresArmed) return storesAnswer
        return await new Promise<unknown>((resolve, reject) => {
          deferredStores.push({ resolve, reject })
        })
      },
      query: async (): Promise<Record<string, unknown>> => {
        counters.ragQuery += 1
        return { query: '', ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }
      },
      journal: async (): Promise<Record<string, unknown>> => ({ entries: [] }),
      manage: async (request: Record<string, unknown>): Promise<Record<string, unknown>> => ({ ok: true, done: request }),
    },
    template: {
      get: async (): Promise<Record<string, unknown>> => {
        counters.templateGet += 1
        return { source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }
      },
      onTemplateChanged: (_handler: (payload: unknown) => void): (() => void) => () => undefined,
      create: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      delete: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      reset: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
    },
    operatorSettings: {
      get: async (): Promise<Record<string, unknown>> => {
        counters.operatorSettingsGet += 1
        return { ...basePayload(), topK: TOPK_OLD }
      },
      set: async (patch: unknown): Promise<unknown> => {
        counters.operatorSettingsSet += 1
        return patch
      },
      onChanged: (handler: (payload: unknown) => void): (() => void) => {
        counters.operatorSettingsChangedSubs += 1
        onChangedHandlers.push(handler)
        return () => undefined
      },
    },
    onPaneVisibility: (_handler: (change: unknown) => void): (() => void) => {
      counters.paneVisibilitySubs += 1
      return () => undefined
    },
    pushPaneCatalog: (_catalog: unknown): void => {
      counters.paneCatalogPushes += 1
    },
  }

  const channel = createPaneEvents()
  const hostSubscribed = options.events !== false
  const dropFiresFor: readonly string[] = options.dropFiresFor ?? []
  // THE COUNTING FAÇADE: every member forwards to the REAL channel; `fire` counts what the HOST (and the renderer's wiring) does,
  // records the fire's ID AND REPORT (and whether its dispatch was DROPPED), and records the DELTA of the whole bridge census
  // across its own body — the fire→paint window.
  const hostedEvents = {
    subscribe: (paneId: string, handler: (report: never) => void): (() => void) => channel.subscribe(paneId, handler),
    subscribeRecord: (paneId: string, handler: (report: never) => void): (() => void) => channel.subscribeRecord(paneId, handler),
    subscribeChange: (paneId: string, handler: (report: never) => void): (() => void) => channel.subscribeChange(paneId, handler),
    fire: (paneId: string): unknown => {
      const before = { ...counters }
      const dropped = dropFiresFor.includes(paneId)
      timeline.push(`fire:${paneId}`)
      const report = dropped ? { paneId, fired: false, handlers: 0, reason: 'no-listener' } : channel.fire(paneId)
      const delta: Record<string, number> = {}
      for (const key of Object.keys(counters) as Array<keyof Counters>) delta[key] = counters[key] - before[key]
      firesLog.push({ paneId, report, dropped })
      fireWindows.push({ paneId, report, dropped, delta })
      return report
    },
    publishChange: (): unknown => channel.publishChange(),
    deliver: (): unknown => channel.deliver(),
    panes: (): string[] => channel.panes(),
    recordPanes: (): string[] => channel.recordPanes(),
    changePanes: (): string[] => channel.changePanes(),
  } as unknown as ReturnType<typeof createPaneEvents>

  let host: SidebarPanes | null = null

  // THE RENDERER'S `firePaneUpdate` — two shapes, and each row states which it reads (see the header).
  const firePaneUpdate = (paneId: string): void => {
    const report = hostedEvents.fire(paneId) as { fired?: boolean }
    if (options.legacyFallback !== true) return
    if (report.fired) return
    // ⟨B-9⟩ the PRE-LANDING branch, reproduced VERBATIM (`renderer.ts` lines 1712-1713), for the TWO MEASUREMENT ROWS ONLY.
    if (registry.get(paneId)?.scope === 'operator' && host) void host.refresh()
  }

  // THE EDIT CONTROLLER — the renderer's own shape: `requestRebuild` is the dirty-edit guard AND the `onRebuild` hand-off, so a
  // rebuild the host asks for is a rebuild the host RUNS (`onRebuild: (kind) => void host?.reDerive(kind)`).
  const editController = {
    markDirty: (_controlId: string): void => undefined,
    clearDirty: (_controlId: string): void => undefined,
    isDirty: (_controlId: string): boolean => false,
    anyDirty: (): boolean => false,
    hasQueuedRebuild: (): boolean => false,
    requestRebuild: (kind?: string): void => {
      rebuilds.push(kind === undefined ? '(none)' : String(kind))
      void host?.reDerive(kind as never)
    },
    restoreCaret: (): undefined => undefined,
    isEditable: (): boolean => true,
    saveCaret: (): undefined => undefined,
    clearCaret: (): undefined => undefined,
    commit: async (): Promise<Record<string, unknown>> => ({ ok: true }),
  }

  let gnosisPanes: Record<string, unknown> | null = null
  let crud: Record<string, unknown> | null = null
  try {
    const gnosis = new GnosisPanes({
      registry,
      bridge: sidebarBridge as never,
      onChanged: (paneId: string) => firePaneUpdate(paneId),
    })
    gnosis.registerPanes()
    gnosisPanes = gnosis as unknown as Record<string, unknown>
    const crudHost = new GnosisCrudPanes({
      registry,
      bridge: sidebarBridge as never,
      onChanged: (paneId: string) => firePaneUpdate(paneId),
    })
    crudHost.registerPanes()
    crud = crudHost as unknown as Record<string, unknown>
  } catch (error) {
    seedProblems.push(
      `the harness could not construct + register the SHIPPED \`GnosisPanes\`/\`GnosisCrudPanes\` (${String(error)}) — the two ` +
        `operator panes' registrations (and the CRUD panes' frames, \`O7\`) have no subject`,
    )
  }

  if (seedProblems.length === 0) {
    host = new SidebarPanes({
      mount: new ShimElement('div') as never,
      operatorMount: new ShimElement('div') as never,
      registry,
      bridge: sidebarBridge as never,
      backRefs: new Map<string, string[]>(),
      editController,
      gnosis: {
        status: () => {
          const fn = gnosisPanes?.['refreshStatus']
          if (typeof fn === 'function') (fn as () => void).call(gnosisPanes)
        },
        query: (value: string) => {
          const fn = gnosisPanes?.['submitQuery']
          if (typeof fn === 'function') (fn as (v: string) => void).call(gnosisPanes, value)
        },
        documents: (tool: string, args: Record<string, unknown>) => {
          const fn = crud?.['gnosisDocuments']
          if (typeof fn === 'function') (fn as (t: string, a: Record<string, unknown>) => void).call(crud, tool, args)
        },
        wikis: (tool: string, args: Record<string, unknown>) => {
          const fn = crud?.['gnosisWikis']
          if (typeof fn === 'function') (fn as (t: string, a: Record<string, unknown>) => void).call(crud, tool, args)
        },
        refreshFromEngine: () => {
          const fn = crud?.['refreshFromEngine']
          if (typeof fn === 'function') (fn as () => void).call(crud)
        },
      },
      ...(hostSubscribed ? { events: hostedEvents } : {}),
    } as never)

    // THE COUNTERS AND THE PAINT'S VERDICT, wrapped on the INSTANCE BEFORE boot (an instance own-property SHADOWS the prototype
    // method, so the class's OWN `this.updatePane(...)`/`this.refresh()`/`this.loadAppGraph(...)`/`this.mountOperator()` calls are
    // counted too — the `INV-E` counters).
    const realRefresh = host.refresh.bind(host)
    ;(host as unknown as Record<string, unknown>)['refresh'] = (...args: unknown[]): unknown => {
      counters.refresh += 1
      timeline.push('refresh')
      return (realRefresh as (...next: unknown[]) => unknown)(...args)
    }
    const realLoadAppGraph = host.loadAppGraph.bind(host)
    ;(host as unknown as Record<string, unknown>)['loadAppGraph'] = (...args: unknown[]): unknown => {
      counters.loadAppGraph += 1
      timeline.push('loadAppGraph')
      return (realLoadAppGraph as (...next: unknown[]) => unknown)(...args)
    }
    const realMountOperator = host.mountOperator.bind(host)
    ;(host as unknown as Record<string, unknown>)['mountOperator'] = (...args: unknown[]): unknown => {
      counters.mountOperator += 1
      timeline.push('mountOperator')
      return (realMountOperator as (...next: unknown[]) => unknown)(...args)
    }
    const realUpdatePane = host.updatePane.bind(host)
    ;(host as unknown as Record<string, unknown>)['updatePane'] = (paneId: string): unknown => {
      counters.updatePanes += 1
      const verdict = realUpdatePane(paneId)
      timeline.push(`updatePane:${paneId}`)
      if (verdict !== null && typeof verdict === 'object') verdicts.push(verdict as Record<string, unknown>)
      return verdict
    }
  }

  const runtime = recordingRuntime()
  const realLoadEnvelope = runtime.double['loadEnvelope'] as (envelope: unknown) => void
  runtime.double['loadEnvelope'] = (envelope: unknown): void => {
    counters.loadEnvelopes += 1
    realLoadEnvelope(envelope)
  }

  if (host !== null) {
    try {
      await host.boot(runtime.double as never)
    } catch (error) {
      seedProblems.push(
        `the harness's \`host.boot(runtime)\` THREW (${String(error)}) — the seed is the {snapshot, doc-heads, template, security, ` +
          `operator settings, pane frames, channel subscriptions} carrier every arm below reads, so no zero in this file is a ` +
          `reading without it`,
      )
    }
  }

  const hostRecord = (): Record<string, unknown> | null => (host === null ? null : (host as unknown as Record<string, unknown>))

  const operatorMount = (): ShimElement | null => {
    const mount = hostRecord()?.['operatorMount']
    return mount instanceof ShimElement ? mount : null
  }

  return {
    host,
    gnosisPanes,
    crud,
    registry,
    channel,
    hostSubscribed,
    seedProblems,
    counters: () => ({ ...counters }),
    resetCounters: () => {
      for (const key of Object.keys(counters) as Array<keyof Counters>) counters[key] = 0
      verdicts.length = 0
      firesLog.length = 0
      fireWindows.length = 0
      rebuilds.length = 0
      timeline.length = 0
    },
    verdicts: () => verdicts.map((verdict) => ({ ...verdict })),
    fires: () => firesLog.map((fire) => ({ ...fire })),
    fireWindows: () => fireWindows.map((window) => ({ ...window, delta: { ...window.delta } })),
    rebuildRequests: () => [...rebuilds],
    timeline: () => [...timeline],
    roots: () => runtime.roots(),
    operatorMount,
    sections: () => operatorSections(operatorMount()),
    operatorNodes: () => {
      const nodes = hostRecord()?.['operatorNodes']
      return Array.isArray(nodes) ? [...(nodes as unknown[])] : []
    },
    operatorText: () => operatorText(operatorMount()),
    hostField: (name: string) => hostRecord()?.[name],
    requestRebuild: (kind: string) => editController.requestRebuild(kind),
    broadcastSettings: (payload: Record<string, unknown>) => {
      if (onChangedHandlers.length === 0) {
        return ['the host registered NO `operatorSettings.onChanged` subscriber at boot — a settings push has no delivery route']
      }
      for (const handler of onChangedHandlers) {
        try {
          handler(payload)
        } catch (error) {
          return [`the recorded \`operatorSettings.onChanged\` subscriber THREW (${String(error)})`]
        }
      }
      return []
    },
    crudDocuments: (tool, args) => {
      const fn = crud?.['gnosisDocuments']
      if (typeof fn !== 'function') return [`\`gnosisDocuments\` is NOT a function on the CRUD host (read ${typeof fn})`]
      try {
        ;(fn as (t: string, a: Record<string, unknown>) => void).call(crud, tool, args)
      } catch (error) {
        return [`\`gnosisDocuments('${tool}')\` THREW (${String(error)}) — the producer's entry never throws at its caller`]
      }
      return []
    },
    refreshStatus: (version: string) => {
      statusAnswer = healthReport(version)
      const fn = gnosisPanes?.['refreshStatus']
      if (typeof fn === 'function') (fn as () => void).call(gnosisPanes)
      else seedProblems.push('`GnosisPanes.refreshStatus` is not a function — the status producer has no entry')
    },
    registryManage: (request: Record<string, unknown>) => {
      const seam = (globals['window'] as { provident?: { sidebar?: { registryManage?: (r: unknown) => void } } } | undefined)
        ?.provident?.sidebar?.registryManage
      if (typeof seam !== 'function') {
        return ['the host installed NO `window.provident.sidebar.registryManage` seam at boot — the store-listing route has no entry']
      }
      try {
        seam(request)
      } catch (error) {
        return [`\`registryManage(${shown(request)})\` THREW (${String(error)})`]
      }
      return []
    },
    setSecurity: (groups: readonly string[]) => {
      securityGroups = [...groups]
    },
    deferStores: (armed: boolean) => {
      deferStoresArmed = armed
    },
    pendingStores: () => deferredStores.length,
    resolveStores: (index: number, answer: unknown) => {
      const entry = deferredStores[index]
      if (entry === undefined) {
        seedProblems.push(`no deferred \`rag.stores()\` call at index ${index} (pending: ${deferredStores.length})`)
        return
      }
      entry.resolve(answer)
    },
    restore: () => {
      if (host !== null) {
        delete (host as unknown as Record<string, unknown>)['refresh']
        delete (host as unknown as Record<string, unknown>)['loadAppGraph']
        delete (host as unknown as Record<string, unknown>)['mountOperator']
        delete (host as unknown as Record<string, unknown>)['updatePane']
      }
      globals['window'] = previousWindow
    },
  }
}

// ---------------------------------------------------------------------------
// THE ROW HELPERS (§6's arms, each read in ONE place so a failure names it).
// ---------------------------------------------------------------------------

/** ONE readable string for the three `INV-E` counters + §2's whole paint-window census — every failure message uses it. */
const countersReading = (counters: Counters): string =>
  `refresh=${counters.refresh} loadAppGraph=${counters.loadAppGraph} mountOperator=${counters.mountOperator}` +
  ` updatePane=${counters.updatePanes}` +
  ` (§2's census: operatorSettings.get=${counters.operatorSettingsGet} operatorSettings.set=${counters.operatorSettingsSet}` +
  ` rag.stores=${counters.ragStores} rag.snapshot=${counters.ragSnapshot} rag.docHeads=${counters.ragDocHeads}` +
  ` rag.backlinks=${counters.ragBacklinks} rag.query=${counters.ragQuery} security.get=${counters.securityGet}` +
  ` template.get=${counters.templateGet})` +
  ` (the producers: gnosis.status=${counters.gnosisStatus} gnosis.documents=${counters.gnosisDocuments}` +
  ` gnosis.wikis=${counters.gnosisWikis})` +
  ` (secondary: loadEnvelope=${counters.loadEnvelopes} operatorSettings.onChanged=${counters.operatorSettingsChangedSubs}` +
  ` onPaneVisibility=${counters.paneVisibilitySubs} pushPaneCatalog=${counters.paneCatalogPushes})`

/** **§2's CENSUS, READ WHERE THE CONTRACT PUTS IT: INSIDE THE FIRE→PAINT WINDOW.** For every `fire` the wiring made, the delta of
 *  each bridge call across that call's own body must be ZERO — the paint re-reads NOTHING (`ASM-B9-1`): no
 *  `operatorSettings.get()` on the fire (the push IS the store's state), no second `rag.stores()` in the paint, no
 *  `bridge.gnosis.status()` (its producer already settled it). A window count of zero is itself a problem: with no fire the zeros
 *  would be vacuous. */
const PAINT_WINDOW_MEMBERS: ReadonlyArray<[string, keyof Counters]> = [
  ['operatorSettings.get', 'operatorSettingsGet'],
  ['rag.stores', 'ragStores'],
  ['gnosis.status', 'gnosisStatus'],
  ['rag.snapshot', 'ragSnapshot'],
  ['rag.docHeads', 'ragDocHeads'],
  ['rag.backlinks', 'ragBacklinks'],
  ['rag.query', 'ragQuery'],
  ['security.get', 'securityGet'],
  ['template.get', 'templateGet'],
]

function paintWindowProblems(windows: ReadonlyArray<FireWindow>, limb: string): string[] {
  const problems: string[] = []
  const live = windows.filter((window) => !window.dropped)
  if (live.length === 0) {
    problems.push(
      `limb ${limb}: NO fire reached the channel's handlers inside the window — the paint-window zeros below would be vacuous ` +
        `(there is nothing to read). §2/§3: an operator pane paints because its producer FIRED it`,
    )
  }
  const nonzero: string[] = []
  for (const window of live) {
    for (const [name, key] of PAINT_WINDOW_MEMBERS) {
      const value = window.delta[key] ?? 0
      if (value !== 0) nonzero.push(`${name}=${value} in fire(${window.paneId})`)
    }
  }
  if (nonzero.length > 0) {
    problems.push(
      `limb ${limb}: the PAINT reached §2's re-read census — ${nonzero.join(', ')} — \`ASM-B9-1\`: the paint re-reads NOTHING for ` +
        `either operator pane (the settings push IS the store's state; the status producer already settled its report), and a paint ` +
        `that re-issued its own producer is the unbounded settle→fire→settle loop \`F-4\` names`,
    )
  }
  return problems
}

/** §3 step 6 / §6's paint verdict arms: exactly ONE verdict, `painted:true` with the declared word, and `applied` naming THAT
 *  PANE'S OWN root and nothing else.
 *
 *  ⟨THE `applied` SPELLING, recorded rather than guessed.⟩ §6 `O2` writes the arm as `applied === ['pane-settings']`, while §1
 *  `F-5`/§3 step 3 author the operator SECTION as `operator-pane-<id>` — the surface's own root is the latter, the pane-root
 *  convention is the former. This clause therefore admits EITHER spelling of THIS pane's id and REFUSES every other element: it can
 *  never be satisfied by another pane's root, by two roots, or by `[]`. */
function paintVerdictProblems(
  verdicts: ReadonlyArray<Record<string, unknown>>,
  paneId: string,
  limb: string,
  expectedVerdicts = 1,
): string[] {
  const problems: string[] = []
  if (verdicts.length !== expectedVerdicts) {
    const wanted = expectedVerdicts === 0 ? 'ZERO' : `EXACTLY ${expectedVerdicts}`
    problems.push(
      `limb ${limb}: the update produced ${verdicts.length} pane verdict(s) ${shown(verdicts)}, not ${wanted} — §6: a producer's ` +
        `settlement is ONE paint (the fire is uncoalesced, \`O-2\`, so N settled reads are N paints), and a DROPPED settlement ` +
        `paints none`,
    )
    return problems
  }
  if (expectedVerdicts === 0) return problems
  const verdict = verdicts[verdicts.length - 1]
  if (verdict['painted'] !== true || verdict['reason'] !== 'painted') {
    problems.push(
      `limb ${limb}: the verdict reads ${shown(verdict)}, not \`painted:true\`/\`'painted'\` — §3: the operator pane's update is a ` +
        `PAINT now (step 2's \`operator-scope\` answer is replaced), and a moved source on an enabled, mounted operator pane IS the ` +
        `arm that paints`,
    )
  }
  const applied = verdict['applied']
  const admitted = [`pane-${paneId}`, `operator-pane-${paneId}`]
  if (!Array.isArray(applied) || applied.length !== 1 || !admitted.includes(String(applied[0]))) {
    problems.push(
      `limb ${limb}: the verdict's \`applied\` reads ${shown(applied)}, not exactly ONE root naming this pane (` +
        `${admitted.map((id) => `'${id}'`).join(' or ')}). §6 \`O2\` writes the arm as \`['pane-${paneId}']\` and §1 \`F-5\`/§3 name ` +
        `the operator section \`operator-pane-${paneId}\`; either spelling is admitted, another pane's root is not`,
    )
  }
  return problems
}

/** THE SIBLING-SURVIVAL READING (§3 step 4, `D-40`'s `m6` lesson one surface over): the paint swaps ONE section into the retained
 *  node list "by identity of that section only", so every node NOT belonging to the painted section must be the SAME OBJECT after.
 *  `paintedWires` is the union of the section's node ids BEFORE and AFTER (the exempted set); everything else is compared by
 *  IDENTITY, never by equality. */
function otherSectionNodesProblems(
  beforeNodes: readonly unknown[],
  afterNodes: readonly unknown[],
  paintedWires: ReadonlySet<string>,
  limb: string,
): string[] {
  const problems: string[] = []
  let compared = 0
  const moved: string[] = []
  for (const node of beforeNodes) {
    const wire = wireOf(node)
    if (wire === null || paintedWires.has(wire)) continue
    compared += 1
    if (!afterNodes.includes(node)) {
      const present = afterNodes.some((candidate) => wireOf(candidate) === wire)
      moved.push(`${wire}(${present ? 'RE-MINTED' : 'DROPPED'})`)
    }
  }
  if (moved.length > 0) {
    problems.push(
      `limb ${limb}: ${moved.length} retained node(s) OUTSIDE the painted section moved across the update — ` +
        `${moved.slice(0, 6).join(', ')}${moved.length > 6 ? `, …(+${moved.length - 6})` : ''} — §3 step 4 swaps the FRESH ` +
        `section in "by identity of that section only", so every sibling node must be the SAME OBJECT. Before: ` +
        `${beforeNodes.length} node(s), after: ${afterNodes.length}`,
    )
  }
  if (compared === 0) {
    problems.push(
      `limb ${limb}: there was NO node outside the painted section — "every other section's node the SAME OBJECT" would be ` +
        `VACUOUS. The operator surface must carry MORE than the painted pane (the seed enables ${shown(OPERATOR_PANES)})`,
    )
  }
  return problems
}

/** The node in `nodes` whose minted id is `wire`, or `undefined`. */
const nodeByWire = (nodes: readonly unknown[], wire: string): unknown => nodes.find((node) => wireOf(node) === wire)

/** THE ROW'S PRECONDITION, REPORTED AS PART OF EVERY OPERATOR-PAINT ROW: the pane must be REGISTERED, `operator`-scope, ENABLED,
 *  MOUNTED (its section exists in the retained operator graph) and PAINTABLE — `updatePane(<id>)` must answer `painted`/
 *  `unchanged`, never one of the five absences.
 *
 *  ⟨RED AT THIS HEAD BY DESIGN, AND REPORTED RATHER THAN HIDDEN.⟩ `paintPane`'s step 2 answers `operator-scope` for any
 *  `def.scope === 'operator'`, so `updatePane('settings')` and `updatePane('gnosis-status')` are NOT paintable today: this
 *  precondition FAILS on the booted host, and §6 `O2`/`O3` name that as their first red. The precondition's own verdict is RESET
 *  out of the counters so it never pollutes the arms below. */
function operatorPaintPrecondition(drive: HostDrive, paneId: string, limb: string): string[] {
  const problems: string[] = []
  if (drive.host === null || drive.registry === null) {
    return [`limb ${limb}: the booted host is ABSENT — the operator paint's precondition has no subject`]
  }
  const def = drive.registry.get(paneId)
  if (def == null) {
    problems.push(`limb ${limb}: no pane is REGISTERED as \`${paneId}\` — the paint would answer \`not-a-pane\``)
  } else if (def.scope !== 'operator') {
    problems.push(
      `limb ${limb}: \`${paneId}\` is registered \`${String(def.scope)}\`-scope, not \`operator\` — this row's subject is the ` +
        `operator surface's own paint`,
    )
  }
  if (drive.registry.isEnabled(paneId) !== true) {
    problems.push(
      `limb ${limb}: \`${paneId}\` is NOT ENABLED in the registry — the paint answers \`not-enabled\` (or the envelope carries no ` +
        `section for it), so "it did not paint" would be a fact of the seed and not of the wiring`,
    )
  }
  if (!drive.sections().some((entry) => entry.paneId === paneId)) {
    problems.push(
      `limb ${limb}: the operator surface carries NO section \`operator-pane-${paneId}\` (sections read: ` +
        `${shown(drive.sections().map((entry) => entry.id))}) — §1 \`F-5\`: \`buildOperatorEnvelope\` authors ONE section per ` +
        `enabled operator pane, and a paint over an absent section is VACUOUS`,
    )
  }
  const verdict = (drive.host.updatePane as (id: string) => Record<string, unknown>).call(drive.host, paneId)
  const reason = verdict['reason']
  if (reason !== 'unchanged' && reason !== 'painted') {
    problems.push(
      `limb ${limb}: the PRECONDITION reading \`updatePane('${paneId}')\` answered \`reason: ${shown(reason)}\`, not ` +
        `\`'unchanged'\`/\`'painted'\` — the operator pane is not paintable on this seed (\`F-2\`: step 2 answers \`operator-scope\` at ` +
        `this head), so nothing below is a reading of a paint`,
    )
  }
  const siblings = drive.sections().filter((entry) => entry.paneId !== paneId)
  if (siblings.length === 0) {
    problems.push(
      `limb ${limb}: the operator surface carries NO sibling section besides \`operator-pane-${paneId}\` — the sibling-survival ` +
        `arm would be vacuous`,
    )
  }
  drive.resetCounters()
  return problems
}

/** The app-graph pane's LIVE frame, or `undefined`. */
const livePaneFrame = (drive: HostDrive, paneId: string): unknown => rootById(drive.roots(), `pane-${paneId}`)

// ===========================================================================
// ROWS
// ===========================================================================
beforeAll(() => {
  installShim()
})

describe('pane-operator-settings — the operator surface gets a LAWFUL paint: one section re-minted, no re-read, no re-assembly, the two removed sites mutated back to red, the field census, the listing race and ADV-B8-1', () => {
  it('O2 — a SETTINGS PUSH paints `operator-pane-settings` ALONE: the source moved FIRST (a changed `topK` through the `operatorSettings.onChanged` subscriber), exactly ONE verdict `painted:true` whose `applied` names that pane, ONE section re-minted with its carriers held, every other section’s node the SAME OBJECT, `INV-E` 0/0/0, §2’s paint-window census all-zero, and the CONTROL: an identical re-push is `unchanged`', async () => {
    // §6 `O2`; §2 (`settings`' source is the PUSH — the payload IS the store's state — and the paint re-reads NOTHING); §3 steps
    // 1-6; §1 `F-4`'s operator-only member (`topK`) and `F-5`'s retained graph.
    // LAYER: envelope-class — the paint's verdict, the shim tree's carriers/wires, the AUTHORED `topK: <n>` text, NODE IDENTITY and
    // the bridge census across the fire→paint window.
    // NON-VACUITY: the push MOVES `topK` (the rendered text is read BEFORE and AFTER), the zeros sit beside a verdict that LANDED
    // and beside a sibling-node census that must be non-empty, and the CONTROL re-pushes the IDENTICAL payload over already-painted
    // state and must answer `unchanged` with `applied: []` (`D-43`: a bare fire over painted state is never demanded as a paint —
    // it is demanded as the control it is).
    // RED AT THIS HEAD: `settings` is not in the census, so the push's `fire('settings')` reaches no listener, and even a correct id
    // would answer `operator-scope` from `paintPane` step 2 (`F-2`) — the precondition below reads that FIRST.
    const problems: string[] = []
    const drive = await seedHost()
    try {
      problems.push(...drive.seedProblems)
      problems.push(...operatorPaintPrecondition(drive, SETTINGS_PANE, 'O2'))

      const mount = drive.operatorMount()
      const sectionsBefore = drive.sections()
      const nodesBefore = drive.operatorNodes()
      const settingsSectionBefore = sectionsBefore.find((entry) => entry.paneId === SETTINGS_PANE)
      const siblingSectionBefore = sectionsBefore.find((entry) => entry.paneId !== SETTINGS_PANE)
      const wiresBefore = new Set(wiresUnder(settingsSectionBefore?.element ?? null))
      const topkBefore = renderedTopK(mount)
      if (topkBefore !== TOPK_OLD) {
        problems.push(
          `limb O2: the rendered settings section reads \`topK: ${shown(topkBefore)}\`, not the boot payload's ` +
            `\`topK: ${TOPK_OLD}\` — "the pane's answer moved" would be vacuous`,
        )
      }
      if (siblingSectionBefore === undefined) {
        problems.push('limb O2: the operator surface carries NO sibling section — the sibling-survival arm would be vacuous')
      }

      // ---- (a) THE SOURCE MOVES FIRST: the operator-settings PUSH, through the subscriber the host registered at boot ---------
      problems.push(...drive.broadcastSettings({ ...basePayload(), topK: TOPK_NEW }))
      await settle()

      const counters = drive.counters()
      // ---- (b) THE VERDICT: exactly one, painted, applied on THIS pane's root --------------------------------------------
      problems.push(...paintVerdictProblems(drive.verdicts(), SETTINGS_PANE, 'O2'))
      // ---- (c) `INV-E` ---------------------------------------------------------------------------------------------------
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(
          `limb O2: the settings push read ${countersReading(counters)} — \`INV-E\` pins \`0 loadAppGraph\` / \`0 mountOperator\` / ` +
            `\`0 refresh()\` on a pane update, and §3 states the operator mount is NO LONGER re-assembled for a pane update`,
        )
      }
      // ---- (d) §2's PAINT-WINDOW CENSUS, inside the fire→paint window -----------------------------------------------------
      problems.push(...paintWindowProblems(drive.fireWindows(), 'O2'))
      // ---- (e) THE OPERATOR SURFACE: ONE section re-minted, its CARRIERS held, every SIBLING node the SAME OBJECT ------------
      const sectionsAfter = drive.sections()
      const nodesAfter = drive.operatorNodes()
      const settingsSectionAfter = sectionsAfter.find((entry) => entry.paneId === SETTINGS_PANE)
      const wiresAfter = new Set(wiresUnder(settingsSectionAfter?.element ?? null))
      const paintedWires = new Set([...wiresBefore, ...wiresAfter])
      if (settingsSectionAfter === undefined) {
        problems.push('limb O2: after the paint there is NO `operator-pane-settings` section at all — the pane does not exist')
      } else {
        if (settingsSectionAfter.id !== `operator-pane-${SETTINGS_PANE}`) {
          problems.push(
            `limb O2: the painted section's CARRIER reads \`${settingsSectionAfter.id}\`, not \`operator-pane-${SETTINGS_PANE}\` — ` +
              `§1 \`F-5\`: the section's authored id is the carrier the surface addresses`,
          )
        }
        const reMinted = [...wiresAfter].some((wire) => {
          const before = nodeByWire(nodesBefore, wire)
          const after = nodeByWire(nodesAfter, wire)
          return after !== undefined && after !== before
        })
        if (!reMinted) {
          problems.push(
            `limb O2: NO node of the settings section was RE-MINTED (before ${shown([...wiresBefore])}, after ` +
              `${shown([...wiresAfter])}) — §3 step 6: the verdict is EARNED only when the surface's render actually re-minted ` +
              `that section's node`,
          )
        }
      }
      const rootElement = operatorRootElement(mount)
      if (rootElement === null || String(rootElement.id ?? '') !== 'operator-panes') {
        problems.push(
          `limb O2: the assembly root's carrier reads \`${shown(rootElement === null ? null : String(rootElement.id ?? ''))}\`, not ` +
            `\`operator-panes\` — the mount root is a CARRIER and a pane paint never re-authors it`,
        )
      }
      if (siblingSectionBefore !== undefined) {
        const siblingSectionAfter = sectionsAfter.find((entry) => entry.paneId === siblingSectionBefore.paneId)
        if (siblingSectionAfter === undefined) {
          problems.push(
            `limb O2: the sibling section \`${siblingSectionBefore.id}\` VANISHED across the paint — a pane update touches ONE ` +
              `pane's section and no other`,
          )
        } else if (siblingSectionAfter.wire !== siblingSectionBefore.wire) {
          problems.push(
            `limb O2: the sibling section \`${siblingSectionBefore.id}\` was RE-RENDERED (its wire moved ` +
              `${shown(siblingSectionBefore.wire)} -> ${shown(siblingSectionAfter.wire)}) — every OTHER section's node must be the ` +
              `SAME OBJECT (§3 step 4)`,
          )
        }
      }
      problems.push(...otherSectionNodesProblems(nodesBefore, nodesAfter, paintedWires, 'O2'))
      // THE MOVED READING: the pane's own answer moved, on the RENDERED surface.
      const topkAfter = renderedTopK(mount)
      if (topkAfter !== TOPK_NEW) {
        problems.push(
          `limb O2: the rendered settings section reads \`topK: ${shown(topkAfter)}\` after the push that moved it to ` +
            `\`${TOPK_NEW}\` — the push's payload IS the pane's source, so the repainted section MUST author it`,
        )
      }

      // ---- (f) THE CONTROL: the IDENTICAL re-push over already-painted state → `unchanged`, `applied: []` -------------------
      drive.resetCounters()
      problems.push(...drive.broadcastSettings({ ...basePayload(), topK: TOPK_NEW }))
      await settle()
      const controlVerdicts = drive.verdicts()
      if (controlVerdicts.length !== 1) {
        problems.push(
          `limb O2(control): the identical re-push produced ${controlVerdicts.length} verdict(s) ${shown(controlVerdicts)}, not ` +
            `exactly ONE — the fire is UNCONDITIONAL and the PAINT is what answers \`unchanged\``,
        )
      } else if (controlVerdicts[0]['painted'] !== false || fingerprint(controlVerdicts[0]['applied']) !== fingerprint([])) {
        problems.push(
          `limb O2(control): the identical re-push answered ${shown(controlVerdicts[0])}, not \`painted:false\` with ` +
            `\`applied === []\` — a shape-equal re-render applies NOTHING (\`r1\`'s idempotence limb), and this is what proves the ` +
            `arm above is a reading of a MOVED answer rather than of an adopted render`,
        )
      }
      // THE CONTROL'S OWN READING: the payload is the pane's ONLY source, so an `unchanged` re-push cannot move the text either —
      // this is the arm that keeps the control from passing over a pane that silently re-adopted a REFETCHED value.
      if (renderedTopK(drive.operatorMount()) !== TOPK_NEW) {
        problems.push(
          `limb O2(control): after the identical re-push the rendered section reads ` +
            `\`topK: ${shown(renderedTopK(drive.operatorMount()))}\`, not \`${TOPK_NEW}\` — nothing moved, so nothing may change`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb O2 — a settings push paints \`operator-pane-${SETTINGS_PANE}\` ALONE (§6 O2; §2; §3; §1 \`F-4\`/\`F-5\`). ` +
        `${problems.length} problem(s). PRECONDITION, reported as part of this row: \`${SETTINGS_PANE}\` is registered ` +
        `\`operator\`-scope, enabled, mounted (its section exists) and PAINTABLE — \`updatePane('${SETTINGS_PANE}')\` must answer ` +
        `\`unchanged\`/\`painted\`, and at this head it answers \`operator-scope\` (\`F-2\`), which IS one of the reds reported here. ` +
        `The push (a changed \`topK\`) must produce exactly ONE verdict \`painted:true\` with \`applied\` naming this pane, ONE ` +
        `re-minted section with its carriers held, every sibling section's node the SAME OBJECT, \`0/0/0\` on the three counters, ` +
        `ZERO bridge reads inside the fire→paint window, the rendered \`topK: ${TOPK_NEW}\`, and the identical re-push must answer ` +
        `\`unchanged\` with \`applied: []\`. envelope-class — the REAL host over the layout-less DOM shim; no rendered box, no ` +
        `pointer (G8-only, §8)`,
    ).toEqual([])
  })

  it('O3 — a STATUS SETTLE paints `operator-pane-gnosis-status` ALONE: the source moved FIRST (`GnosisPanes.refreshStatus`’s own settled report), exactly ONE verdict `painted:true`, ONE section re-minted with carriers held, the SETTINGS section’s node the SAME OBJECT, `INV-E` 0/0/0, §2’s paint-window census all-zero with the producer’s own `gnosis.status === 1` as the positive, the rendered `Version:` moved, and the CONTROL: an identical re-settle is `unchanged`', async () => {
    // §6 `O3`; §2 (`gnosis-status`' source is its OWN settled health report — `refreshStatus`'s settle names `'gnosis-status'`
    // through `onChanged`); §3; §1 `F-5`.
    // LAYER: as `O2`. NON-VACUITY: the settle MOVES the report's `version` (both settle arms already name the pane), the zeros sit
    // beside the producer's own `bridge.gnosis.status === 1` on the SAME event and beside a landed verdict, and the CONTROL
    // re-settles the identical report over painted state.
    // RED AT THIS HEAD: `gnosis-status` is not in the census, so `fire('gnosis-status')` answers `fired:false` and
    // `renderer.ts`'s `⟨B-9⟩` fallback re-assembles the whole graph instead; and `updatePane('gnosis-status')` answers
    // `operator-scope` (`F-2`) — the precondition below reads that first.
    const problems: string[] = []
    const drive = await seedHost()
    try {
      problems.push(...drive.seedProblems)
      problems.push(...operatorPaintPrecondition(drive, STATUS_PANE, 'O3'))

      const mount = drive.operatorMount()
      const sectionsBefore = drive.sections()
      const nodesBefore = drive.operatorNodes()
      const statusSectionBefore = sectionsBefore.find((entry) => entry.paneId === STATUS_PANE)
      const settingsSectionBefore = sectionsBefore.find((entry) => entry.paneId === SETTINGS_PANE)
      const wiresBefore = new Set(wiresUnder(statusSectionBefore?.element ?? null))
      if (settingsSectionBefore === undefined) {
        problems.push('limb O3: the operator surface carries NO settings section — the sibling-survival arm would be vacuous')
      }
      if (renderedStatusVersion(mount) === VERSION_NEW) {
        problems.push(`limb O3: the rendered status section ALREADY reads \`Version: ${VERSION_NEW}\` — the move would be vacuous`)
      }

      // ---- (a) THE SOURCE MOVES FIRST: the pane's OWN producer --------------------------------------------------------------
      drive.resetCounters()
      drive.refreshStatus(VERSION_NEW)
      await settle()

      const counters = drive.counters()
      problems.push(...paintVerdictProblems(drive.verdicts(), STATUS_PANE, 'O3'))
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(
          `limb O3: the status settle read ${countersReading(counters)} — \`INV-E\` pins \`0 loadAppGraph\` / \`0 mountOperator\` / ` +
            `\`0 refresh()\` on a pane update`,
        )
      }
      problems.push(...paintWindowProblems(drive.fireWindows(), 'O3'))
      if (counters.gnosisStatus !== 1) {
        problems.push(
          `limb O3: \`bridge.gnosis.status\` reads ${counters.gnosisStatus}, not exactly 1 — the PRODUCER's own read is the positive ` +
            `that makes the paint-window zeros readable (§2); a zero here would make "the paint re-read nothing" indistinguishable ` +
            `from "nothing was read at all"`,
        )
      }

      const sectionsAfter = drive.sections()
      const nodesAfter = drive.operatorNodes()
      const statusSectionAfter = sectionsAfter.find((entry) => entry.paneId === STATUS_PANE)
      const wiresAfter = new Set(wiresUnder(statusSectionAfter?.element ?? null))
      if (statusSectionAfter === undefined) {
        problems.push('limb O3: after the paint there is NO `operator-pane-gnosis-status` section at all')
      } else {
        if (statusSectionAfter.id !== `operator-pane-${STATUS_PANE}`) {
          problems.push(`limb O3: the painted section's CARRIER reads \`${statusSectionAfter.id}\`, not \`operator-pane-${STATUS_PANE}\``)
        }
        const reMinted = [...wiresAfter].some((wire) => {
          const before = nodeByWire(nodesBefore, wire)
          const after = nodeByWire(nodesAfter, wire)
          return after !== undefined && after !== before
        })
        if (!reMinted) {
          problems.push(
            `limb O3: NO node of the status section was RE-MINTED (before ${shown([...wiresBefore])}, after ` +
              `${shown([...wiresAfter])}) — §3 step 6: the verdict is earned only when the render re-minted that section's node`,
          )
        }
      }
      if (settingsSectionBefore !== undefined) {
        const settingsAfter = sectionsAfter.find((entry) => entry.paneId === SETTINGS_PANE)
        if (settingsAfter === undefined) {
          problems.push('limb O3: the settings section VANISHED across a status settle — a pane update touches ONE section only')
        } else if (settingsAfter.wire !== settingsSectionBefore.wire) {
          problems.push(
            `limb O3: the settings section \`${settingsSectionBefore.id}\` was RE-RENDERED across a STATUS settle (wire ` +
              `${shown(settingsSectionBefore.wire)} -> ${shown(settingsAfter.wire)}) — §3 step 4: every other section's node is the ` +
              `SAME OBJECT`,
          )
        }
      }
      problems.push(...otherSectionNodesProblems(nodesBefore, nodesAfter, new Set([...wiresBefore, ...wiresAfter]), 'O3'))
      const versionAfter = renderedStatusVersion(mount)
      if (versionAfter !== VERSION_NEW) {
        problems.push(
          `limb O3: the rendered status section reads \`Version: ${shown(versionAfter)}\` after the settle that moved it to ` +
            `\`${VERSION_NEW}\` — §2: the producer committed its report in the same tick BEFORE it fired, so the paint authors it`,
        )
      }

      // ---- (b) THE CONTROL: the IDENTICAL re-settle over painted state → `unchanged`, `applied: []` -------------------------
      drive.resetCounters()
      drive.refreshStatus(VERSION_NEW)
      await settle()
      const controlVerdicts = drive.verdicts()
      if (controlVerdicts.length !== 1) {
        problems.push(
          `limb O3(control): the identical re-settle produced ${controlVerdicts.length} verdict(s) ${shown(controlVerdicts)}, not ` +
            `exactly ONE — the fire is unconditional and the PAINT answers \`unchanged\``,
        )
      } else if (controlVerdicts[0]['painted'] !== false || fingerprint(controlVerdicts[0]['applied']) !== fingerprint([])) {
        problems.push(
          `limb O3(control): the identical re-settle answered ${shown(controlVerdicts[0])}, not \`painted:false\` with ` +
            `\`applied === []\` — a shape-equal re-render applies NOTHING`,
        )
      }
      if (renderedStatusVersion(drive.operatorMount()) !== VERSION_NEW) {
        problems.push(
          `limb O3(control): after the identical re-settle the rendered status section reads ` +
            `\`Version: ${shown(renderedStatusVersion(drive.operatorMount()))}\`, not \`${VERSION_NEW}\` — nothing moved, so nothing ` +
            `may change`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb O3 — a \`${STATUS_PANE}\` settle paints \`operator-pane-${STATUS_PANE}\` ALONE (§6 O3; §2; §3). ` +
        `${problems.length} problem(s). PRECONDITION, reported as part of this row: \`${STATUS_PANE}\` is registered ` +
        `\`operator\`-scope, enabled, mounted and PAINTABLE — \`updatePane('${STATUS_PANE}')\` must answer \`unchanged\`/\`painted\`, ` +
        `and at this head it answers \`operator-scope\` (\`F-2\`), which IS one of the reds reported here. \`refreshStatus()\`'s ` +
        `settle must produce ONE verdict \`painted:true\`, ONE re-minted section with its carriers held, the settings section's node ` +
        `the SAME OBJECT, \`0/0/0\`, ZERO bridge reads inside the fire→paint window beside \`gnosis.status === 1\`, the rendered ` +
        `\`Version: ${VERSION_NEW}\`, and an identical re-settle must answer \`unchanged\`. envelope-class`,
    ).toEqual([])
  })

  it('O4 — THE LAST RE-ASSEMBLY IS GONE AND IT IS MUTATED BACK TO RED: the landed paint reads 0/0/0 beside a verdict that LANDED; m1 (the deleted `⟨B-9⟩` fallback restored) moves `refresh` and `loadAppGraph`; m2 (the unconditional `requestRebuild(operator)` restored) moves `refresh` AND `mountOperator`; m3 (an arm answering an absence word) is REFUSED by this row’s own paint verifier; m4 (a no-op delivery over a MOVED source) paints nothing while the source moved AND the real seam still paints; and `m6` PER PANE — the fire DROPPED — holds `0/0/0` PERFECTLY, paints nothing, and leaves the pane naming its OLD data while the host’s field moved', async () => {
    // §6 `O4`; §4 SITE 1/SITE 2; `D-40`'s `m6` lesson ("the counters are necessary and not sufficient").
    // LAYER: envelope-class — the three counters wrapped on the instance, the bridge census, the AUTHORED text beside them, and the
    // retained node list.
    // NON-VACUITY: (i) needs a paint that LANDED (a verdict AND a moved `topK`), so `0/0/0` is a reading of a REAL update; each of
    // `m1`..`m4` must be CAUGHT on this same harness shape, and each `m6` carries the FLOOR of its own landing reading (`O2` for
    // `settings`, `O3` for `gnosis-status` — the SAME producers, reviewed in this file).
    // `m6` IS CHOSEN BECAUSE THE THREE COUNTERS CANNOT SEE IT: with the fire dropped the source still commits, `INV-E` holds
    // PERFECTLY, ZERO paints happen — and the pane still names the OLD data. That is the arm a landing which drops a fire would pass.
    // RED AT THIS HEAD: the census carries neither operator pane, `paintPane` answers `operator-scope`, and the settings path
    // re-assembles unconditionally — so `(i)`'s floor has no subject, while the mutants themselves stay drivable.
    const problems: string[] = []
    const mutants: string[] = []

    // ---- (i) THE DIRECT ARM: a REAL settings push paints, and the zeros are read off a LANDED paint -------------------------
    const live = await seedHost()
    try {
      problems.push(...live.seedProblems)
      problems.push(...operatorPaintPrecondition(live, SETTINGS_PANE, 'O4(i)'))
      if (!live.hostSubscribed) {
        problems.push('limb O4(i): the harness did not hand the host its `events` channel — the boot-time subscriptions have no subject')
      }
      const mount = live.operatorMount()
      const topkBefore = renderedTopK(mount)
      live.resetCounters()
      problems.push(...live.broadcastSettings({ ...basePayload(), topK: TOPK_NEW }))
      await settle()
      const landed = live.counters()
      const topkAfter = renderedTopK(mount)
      const verdicts = live.verdicts()
      mutants.push(
        `(i) the landed settings push: ${countersReading(landed)} verdicts=${shown(verdicts)} topK=` +
          `${shown(topkBefore)}->${shown(topkAfter)}`,
      )
      if (topkAfter !== TOPK_NEW) {
        problems.push(
          `limb O4(i): the rendered settings section reads \`topK: ${shown(topkAfter)}\` after the push that moved it to ` +
            `\`${TOPK_NEW}\` — the zeroes below would prove nothing on a paint that did not land`,
        )
      }
      problems.push(...paintVerdictProblems(verdicts, SETTINGS_PANE, 'O4(i)'))
      if (landed.refresh !== 0 || landed.loadAppGraph !== 0 || landed.mountOperator !== 0) {
        problems.push(
          `limb O4(i): the pane update read ${countersReading(landed)} — \`INV-E\` pins \`0 loadAppGraph\`, \`0 mountOperator\`, ` +
            `\`0 refresh()\` on a pane update`,
        )
      }
    } finally {
      live.restore()
    }

    // ---- (ii) m1/m2: the two REMOVED SITES, restored, on a NO-`events` SEED (the mutant is the ONLY delivery) --------------
    const sandbox = await seedHost({ events: false })
    try {
      problems.push(...sandbox.seedProblems)
      if (sandbox.hostSubscribed) {
        problems.push(
          'limb O4(ii): the m1/m2 seed handed the host an `events` channel — the host\'s own paint would then run beside the ' +
            'mutant and each reading would be the REAL path, not the mutant\'s',
        )
      }
      const host = sandbox.host as unknown as Record<string, unknown>
      const runMutant = async (label: string, why: string, run: () => void, caught: () => boolean): Promise<void> => {
        sandbox.resetCounters()
        let threw = ''
        try {
          run()
        } catch (error) {
          threw = String(error)
        }
        await settle()
        const reading = countersReading(sandbox.counters())
        mutants.push(`${label}: ${reading} caught=${String(caught())}`)
        if (threw !== '') problems.push(`limb O4(ii) (${label}): the mutant THREW (${threw}) — a handler is never a throw site`)
        if (!caught()) {
          problems.push(
            `limb O4(ii) (${label}): the mutant was NOT caught — ${why}. Reading: ${reading}. A harness that cannot SEE this ` +
              `mutant cannot prove the invariant it falsifies, so this arm is the row's own falsifier`,
          )
        }
      }
      // m1 — §4 SITE 1 RESTORED: `if (report.fired) return; if (registry.get(paneId)?.scope === 'operator' && host) void
      // host.refresh()` — the branch this unit DELETES, restored as an additional registration on the REAL channel.
      await runMutant(
        `m1 the ⟨B-9⟩ fallback restored (fire(${SETTINGS_PANE}) -> host.refresh())`,
        'the deleted re-assembly must register on the refresh counter AND on loadAppGraph, which refresh() runs',
        () => {
          const release = sandbox.channel.subscribe(SETTINGS_PANE, () => {
            if (sandbox.registry?.get(SETTINGS_PANE)?.scope === 'operator' && host !== null) {
              void (host['refresh'] as () => Promise<void>).call(host)
            }
          })
          try {
            sandbox.channel.fire(SETTINGS_PANE)
          } finally {
            release()
          }
        },
        () => sandbox.counters().refresh >= 1 && sandbox.counters().loadAppGraph >= 1,
      )
      // m2 — §4 SITE 2 RESTORED: the UNCONDITIONAL `requestRebuild('operator')` (`F-4`'s waste), driven through the renderer's
      // own rebuild hand-off, which is `reDerive('operator')` -> `refresh()` -> `loadAppGraph` + `mountOperator`.
      await runMutant(
        "m2 the unconditional requestRebuild('operator') restored",
        'the re-derive must register on `mountOperator` AND `refresh` (reDerive\'s non-content arm is `await this.refresh()`)',
        () => {
          const release = sandbox.channel.subscribe(SETTINGS_PANE, () => {
            sandbox.requestRebuild('operator')
          })
          try {
            sandbox.channel.fire(SETTINGS_PANE)
          } finally {
            release()
          }
        },
        () => sandbox.counters().mountOperator >= 1 && sandbox.counters().refresh >= 1,
      )
    } finally {
      sandbox.restore()
    }

    // ---- (iii) m3: AN ARM ANSWERING AN ABSENCE WORD IS REFUSED BY THIS ROW'S OWN VERIFIER ----------------------------------
    // The drivable form of `m3`, stated rather than forged on the host: §3 REPLACES step 2's `operator-scope` answer with a ROUTE,
    // so after the landing the shipped host no longer answers that word at all — what must still be able to REFUSE it is the row's
    // verifier, or a landing that kept the refusal would pass every paint row silently. Driven BOTH ways: each forged absence word
    // MUST answer problems, and a lawful paint verdict MUST answer none (satisfiability — a verifier that reds everything proves
    // nothing, `D-43`).
    for (const reason of ['operator-scope', 'not-mounted', 'not-enabled', 'not-a-pane', 'no-runtime'] as const) {
      const forged = [{ paneId: SETTINGS_PANE, painted: false, reason, applied: [] }]
      const refused = paintVerdictProblems(forged, SETTINGS_PANE, `O4(iii)·forged-${reason}`)
      mutants.push(`m3 a forged \`${reason}\` verdict: refused=${String(refused.length > 0)}`)
      if (refused.length === 0) {
        problems.push(
          `limb O4(iii) (m3, \`${reason}\`): the verifier ACCEPTED a verdict answering \`${reason}\` — a landing that left the ` +
            `operator arm refusing its own panes would then pass every paint row above, which is exactly the mutant m3 names`,
        )
      }
    }
    const lawful = paintVerdictProblems(
      [{ paneId: SETTINGS_PANE, painted: true, reason: 'painted', applied: [`pane-${SETTINGS_PANE}`] }],
      SETTINGS_PANE,
      'O4(iii)·lawful',
    )
    if (lawful.length > 0) {
      problems.push(
        `limb O4(iii): the verifier REJECTED a LAWFUL paint verdict (${shown(lawful)}) — it is unsatisfiable as written, so every ` +
          `red it produces elsewhere proves nothing`,
      )
    }

    // ---- (iv) m4: A NO-OP DELIVERY OVER A MOVED SOURCE -------------------------------------------------------------------
    // `events: false` means the host holds NO channel, so its own census subscription does not exist; the row then moves the source
    // through the producer, registers a NO-OP handler and fires. The reading is `painted:false` while the source DID move — and it is
    // completed by the REAL paint seam over the SAME moved state, which must paint: with the seam also silent, `painted:false` would
    // be a reading of a dead harness rather than of the mutant.
    const quiet = await seedHost({ events: false })
    try {
      problems.push(...quiet.seedProblems)
      problems.push(...quiet.broadcastSettings({ ...basePayload(), topK: TOPK_NEW }))
      await settle()
      const quietMount = quiet.operatorMount()
      quiet.resetCounters()
      const release = quiet.channel.subscribe(SETTINGS_PANE, () => undefined)
      let m4Threw = ''
      try {
        quiet.channel.fire(SETTINGS_PANE)
      } catch (error) {
        m4Threw = String(error)
      }
      await settle()
      try {
        release()
      } catch {
        /* a mutant's withdrawal is the harness's own bookkeeping, never a row failure */
      }
      const source = quiet.hostField('lastOperatorSettings') as { topK?: unknown } | null
      const sourceMoved = source != null && source['topK'] === TOPK_NEW
      const paneStale = renderedTopK(quietMount) === TOPK_OLD
      const noopCounters = quiet.counters()
      const noopVerdicts = quiet.verdicts()
      const seam =
        quiet.host === null
          ? null
          : (quiet.host.updatePane as (id: string) => Record<string, unknown>).call(quiet.host, SETTINGS_PANE)
      mutants.push(
        `m4 a no-op delivery: ${countersReading(noopCounters)} verdicts=${shown(noopVerdicts)} ` +
          `realSeamPainted=${shown(seam === null ? '(no host)' : seam['painted'])} ` +
          `realSeamReason=${shown(seam === null ? '(no host)' : seam['reason'])} sourceMoved=${String(sourceMoved)} ` +
          `paneStaleBeforeTheSeam=${String(paneStale)}`,
      )
      if (m4Threw !== '') problems.push(`limb O4(iv) (m4): the no-op fire THREW (${m4Threw}) — \`fire\` never throws`)
      if (!sourceMoved) {
        problems.push(
          'limb O4(iv) (m4): the push did NOT leave `lastOperatorSettings.topK` at the pushed value — "the source moved" has no ' +
            'subject. Either nothing committed (a silent producer) or the rebuild re-read the store and clobbered the commit ' +
            '(the `F-4` route this unit removes)',
        )
      }
      if (noopVerdicts.length !== 0) {
        problems.push(
          `limb O4(iv) (m4): the no-op delivery produced ${noopVerdicts.length} verdict(s) ${shown(noopVerdicts)} — a no-op handler ` +
            `paints NOTHING`,
        )
      }
      if (noopCounters.refresh !== 0 || noopCounters.loadAppGraph !== 0 || noopCounters.mountOperator !== 0) {
        problems.push(
          `limb O4(iv) (m4): the no-op delivery read ${countersReading(noopCounters)} — a no-op paints nothing and re-assembles ` +
            `nothing`,
        )
      }
      if (seam === null || seam['painted'] !== true) {
        problems.push(
          `limb O4(iv) (m4): the REAL paint seam over the SAME moved state answered ${shown(seam)} — with the seam also silent, ` +
            `\`painted:false\` is not a reading of the mutant but of a dead harness`,
        )
      }
    } finally {
      quiet.restore()
    }

    // ---- (v) m6 PER MOVED PANE: THE FIRE DROPPED --------------------------------------------------------------------------
    // Each arm drops ONE pane's fire inside the counting façade (the fire is still RECORDED, so "the fire was removed" is a
    // deliberate mutant and not a lost id). Predictions: `0/0/0`, ZERO paints, and the pane STILL naming the OLD data while the
    // host's own field has moved.
    const measureNoFire = (
      label: string,
      paneId: string,
      drive: HostDrive,
      stillStale: () => boolean,
      fieldMoved: () => boolean,
      fieldName: string,
    ): void => {
      const counters = drive.counters()
      const firedIds = drive.fires().map((fire) => fire.paneId)
      const wasDropped = drive.fires().some((fire) => fire.dropped && fire.paneId === paneId)
      const verdictsNow = drive.verdicts()
      mutants.push(
        `${label}: refresh=${counters.refresh} loadAppGraph=${counters.loadAppGraph} mountOperator=${counters.mountOperator} ` +
          `verdicts=${shown(verdictsNow.map((verdict) => verdict['reason']))} fires=${shown(firedIds)} dropRecorded=${String(wasDropped)} ` +
          `field(\`${fieldName}\`)Moved=${String(fieldMoved())} paneStillNamesTheOldData=${String(stillStale())}`,
      )
      if (!wasDropped) {
        problems.push(
          `limb O4(v) (${label}): the fire for \`${paneId}\` was NEVER ATTEMPTED (fires read ${shown(firedIds)}) — this arm's ` +
            `mutant is "the FIRE was dropped", so the fire must still be MADE and only its dispatch withheld. At this head the ` +
            `producer's fire is lost one step earlier (the census carries neither operator pane, and ` +
            `\`onOperatorSettingsChanged\` fires nothing at all), which is the same defect one wire up`,
        )
      }
      if (!fieldMoved()) {
        problems.push(
          `limb O4(v) (${label}): the host's ${fieldName} field did NOT move — m6's whole reading is "the source moved while the ` +
            `pane still shows the old data". Either the producer committed nothing (a silent producer, which would make the arm ` +
            `vacuous) or something RE-READ the store and clobbered the commit (exactly what the re-assembly \`F-4\` names)`,
        )
      }
      if (verdictsNow.length !== 0) {
        problems.push(
          `limb O4(v) (${label}): the fire-less settle still produced ${verdictsNow.length} verdict(s) ${shown(verdictsNow)} — with ` +
            `the fire dropped ZERO paints may happen`,
        )
      }
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(
          `limb O4(v) (${label}): with the fire absent the settle read ${countersReading(counters)}, not \`0/0/0\` — m6's ` +
            `prediction IS \`0/0/0\` with ZERO paints: the counters are NECESSARY AND NOT SUFFICIENT (\`D-40\`)`,
        )
      }
      if (!stillStale()) {
        problems.push(
          `limb O4(v) (${label}): the pane does NOT still name the old data — m6's reading is "the source moved while the pane still ` +
            `shows the OLD answer"; a repaint that ran without a fire satisfies neither half`,
        )
      }
    }

    const noFireSettings = await seedHost({ dropFiresFor: [SETTINGS_PANE] })
    try {
      problems.push(...noFireSettings.seedProblems)
      problems.push(...operatorPaintPrecondition(noFireSettings, SETTINGS_PANE, 'O4·m6-settings'))
      const mount = noFireSettings.operatorMount()
      noFireSettings.resetCounters()
      problems.push(...noFireSettings.broadcastSettings({ ...basePayload(), topK: TOPK_NEW }))
      await settle()
      measureNoFire(
        `m6-settings (the fire dropped for \`${SETTINGS_PANE}\`)`,
        SETTINGS_PANE,
        noFireSettings,
        () => renderedTopK(mount) === TOPK_OLD,
        () => (noFireSettings.hostField('lastOperatorSettings') as { topK?: unknown } | null)?.['topK'] === TOPK_NEW,
        'lastOperatorSettings.topK',
      )
    } finally {
      noFireSettings.restore()
    }

    const noFireStatus = await seedHost({ dropFiresFor: [STATUS_PANE] })
    try {
      problems.push(...noFireStatus.seedProblems)
      problems.push(...operatorPaintPrecondition(noFireStatus, STATUS_PANE, 'O4·m6-status'))
      const mount = noFireStatus.operatorMount()
      noFireStatus.resetCounters()
      noFireStatus.refreshStatus(VERSION_NEW)
      await settle()
      const produced = noFireStatus.gnosisPanes?.['state']
      const producedState =
        typeof produced === 'function'
          ? (produced as () => { lastStatus: { version?: unknown } | null }).call(noFireStatus.gnosisPanes)
          : null
      measureNoFire(
        `m6-status (the fire dropped for \`${STATUS_PANE}\`)`,
        STATUS_PANE,
        noFireStatus,
        () => renderedStatusVersion(mount) !== VERSION_NEW,
        () => producedState?.lastStatus?.version === VERSION_NEW,
        'GnosisPanes.state().lastStatus.version',
      )
    } finally {
      noFireStatus.restore()
    }

    expect(
      problems,
      `limb O4 — the last re-assembly is GONE and it is MUTATED BACK TO RED (§6 O4; §4 SITE 1/SITE 2; \`D-40\`). ` +
        `${problems.length} problem(s). A producer's settlement must read \`0 refresh()\` / \`0 loadAppGraph\` / ` +
        `\`0 mountOperator\` on a paint that LANDED; \`m1\` (the \`⟨B-9⟩\` fallback restored) and \`m2\` (the unconditional ` +
        `\`requestRebuild('operator')\`) must each be CAUGHT on this same harness shape; \`m3\` must be REFUSED by this row's own ` +
        `verifier for every absence word while a lawful verdict passes; \`m4\` (a no-op delivery) must paint nothing while the source ` +
        `moved AND the real seam must still paint; and each \`m6\` must hold \`0/0/0\` with ZERO paints while the pane still names ` +
        `the OLD data. Computed readings: ${mutants.length > 0 ? mutants.join(' · ') : '(no mutant could be driven)'}. ` +
        `envelope-class — the REAL host over the layout-less DOM shim, the counters wrapped on the instance`,
    ).toEqual([])
  })

  it('O4 — MEASUREMENT (a): the `gnosis-status` settle, routed EXACTLY as `renderer.ts` wires it TODAY (`onChanged: (paneId) => firePaneUpdate(paneId)` with the `⟨B-9⟩` fallback reproduced verbatim) is MEASURED — either the deleted fallback re-assembles it (`fired:false` ⇒ `refresh`/`loadAppGraph`/`mountOperator` each ≥ 1, ZERO pane verdicts) or the operator paint delivers it (`fired:true, handlers:1` ⇒ `0/0/0` with ONE verdict) — and NOTHING ELSE is a lawful reading', async () => {
    // THE `F-3` MEASUREMENT, reported rather than assumed: the delegation's "1 mountOperator" claim is a MEASUREMENT, and the
    // contract is corrected by it (never defended, `D-43`). GREEN ON ARRIVAL BY CONSTRUCTION: it states the TWO lawful shapes of
    // the same settle and refuses a third, so it can never be satisfied by a number nobody measured.
    // LAYER: envelope-class — the counting façade's fire report plus the three instance counters.
    // NON-VACUITY: only ONE settle is driven; each branch carries its OWN floor (the fallback branch must move all three counters,
    // the paint branch must produce exactly ONE verdict), so a settle that did nothing at all fails both.
    const problems: string[] = []
    const drive = await seedHost({ legacyFallback: true })
    try {
      problems.push(...drive.seedProblems)
      if (!drive.hostSubscribed) {
        problems.push('limb O4-M(a): the host was handed no channel — the settle has no delivery route to measure')
      }
      drive.resetCounters()
      drive.refreshStatus(VERSION_NEW)
      await settle()
      const counters = drive.counters()
      const reports = drive.fires()
      const verdicts = drive.verdicts()
      const statusFire = reports.find((fire) => fire.paneId === STATUS_PANE)
      const reading =
        `(a) a \`${STATUS_PANE}\` settle: ${countersReading(counters)} ` +
        `fire=${shown(statusFire === undefined ? '(none)' : statusFire.report)}`
      if (statusFire === undefined) {
        problems.push(
          `limb O4-M(a): the settle never fired \`${STATUS_PANE}\` at all — the producer's \`onChanged\` names its pane, so the ` +
            `route under measurement does not exist. ${reading}`,
        )
      }
      const reassembled = counters.refresh >= 1 && counters.loadAppGraph >= 1 && counters.mountOperator >= 1 && verdicts.length === 0
      const painted = counters.refresh === 0 && counters.loadAppGraph === 0 && counters.mountOperator === 0 && verdicts.length === 1
      if (!reassembled && !painted) {
        problems.push(
          `limb O4-M(a): the settle matched NEITHER lawful shape. ${reading}. Expected either (i) the DELETED \`⟨B-9⟩\` fallback ` +
            `still standing — \`fire('${STATUS_PANE}')\` answers \`fired:false\` and \`host.refresh()\` re-assembles ` +
            `(\`refresh\`/\`loadAppGraph\`/\`mountOperator\` each ≥ 1, ZERO pane verdicts) — or (ii) the landed operator paint ` +
            `(\`fired:true, handlers:1\` with \`0/0/0\` and EXACTLY one verdict)`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb O4 — MEASUREMENT (a). ${problems.length} problem(s). §1 \`F-3\`: \`renderer.ts\`'s \`firePaneUpdate\` is \`fire(paneId)\`, ` +
        `then \`if (report.fired) return\`, then \`if (registry.get(paneId)?.scope === 'operator' && host) void host.refresh()\`, and ` +
        `\`host.refresh()\` is the LAST RE-ASSEMBLY. This row MEASURES that route on the booted host and accepts ONLY its two lawful ` +
        `shapes: the pre-landing re-assembly (\`fired:false\` ⇒ the three counters move, zero verdicts) or the landed paint ` +
        `(\`fired:true, handlers:1\` ⇒ \`0/0/0\` and exactly ONE verdict). envelope-class`,
    ).toEqual([])
  })

  it('O4 — MEASUREMENT (b): the `settings` settle on the booted host is MEASURED the same way — either `onOperatorSettingsChanged` requests the unconditional `requestRebuild(operator)` (`refresh`/`loadAppGraph`/`mountOperator` each ≥ 1, ZERO pane verdicts, the rebuild recorded) or §2’s field census declares `topK` operator-only (`requestRebuild` 0, `0/0/0`, ONE verdict)', async () => {
    // THE `F-3` MEASUREMENT'S SECOND HALF: the delegation's "1 mountOperator" claim applies to a SETTINGS settle too, and §4 SITE 2
    // is the site that produces it. GREEN ON ARRIVAL BY CONSTRUCTION, for the same reason as (a): two lawful shapes and no third.
    // LAYER / NON-VACUITY: as (a) — one push, each branch floors itself.
    const problems: string[] = []
    const drive = await seedHost({ legacyFallback: true })
    try {
      problems.push(...drive.seedProblems)
      drive.resetCounters()
      problems.push(...drive.broadcastSettings({ ...basePayload(), topK: TOPK_NEW }))
      await settle()
      const counters = drive.counters()
      const rebuilds = drive.rebuildRequests()
      const verdicts = drive.verdicts()
      const reports = drive.fires()
      const settingsFire = reports.find((fire) => fire.paneId === SETTINGS_PANE)
      const reading =
        `(b) a \`${SETTINGS_PANE}\` push: ${countersReading(counters)} requestRebuild=${shown(rebuilds)} ` +
        `fire=${shown(settingsFire === undefined ? '(none)' : settingsFire.report)}`
      const reDerived =
        rebuilds.includes('operator') &&
        counters.refresh >= 1 &&
        counters.loadAppGraph >= 1 &&
        counters.mountOperator >= 1 &&
        verdicts.length === 0
      const fired =
        rebuilds.length === 0 && counters.refresh === 0 && counters.loadAppGraph === 0 && counters.mountOperator === 0 && verdicts.length === 1
      if (!reDerived && !fired) {
        problems.push(
          `limb O4-M(b): the push matched NEITHER lawful shape. ${reading}. Expected either (i) §4 SITE 2 still standing — the ` +
            `UNCONDITIONAL \`requestRebuild('operator')\` re-derives (\`refresh\`/\`loadAppGraph\`/\`mountOperator\` each ≥ 1, the ` +
            `rebuild RECORDED, ZERO pane verdicts) — or (ii) §2's FIELD CENSUS declaring \`topK\` operator-only (\`requestRebuild\` 0, ` +
            `\`0/0/0\`, exactly ONE verdict)`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb O4 — MEASUREMENT (b). ${problems.length} problem(s). §1 \`F-4\`/§4 SITE 2: \`onOperatorSettingsChanged\` commits ` +
        `\`lastOperatorSettings\` and then requests the UNCONDITIONAL \`requestRebuild('operator')\`, whose \`reDerive('operator')\` ` +
        `arm is \`await this.refresh()\` — i.e. \`loadAppGraph\` + \`mountOperator\`. This row MEASURES that route on the booted host ` +
        `and accepts ONLY the two lawful shapes (the unconditional re-derive, or the field census delivering by FIRE alone). ` +
        `envelope-class`,
    ).toEqual([])
  })

  it('O5 — THE CORRECTED FIELD CENSUS, DRIVEN BOTH WAYS THROUGH `onOperatorSettingsChanged`: the APP-GRAPH direction (a push that moved `representationMode` or `layout`) records `requestRebuild(operator)` AND re-assembles for real (`refresh`+`loadAppGraph`+`mountOperator` ≥ 1), the five APP-GRAPH-INERT members (`enabledPanes` ECHO, `defaultDocumentId` TAB-CONTEXT-ONLY, `tabs` BOOT-ONLY, `topK`, `panesInitialized`) each read `requestRebuild` 0 and `0/0/0` while the pane still painted from its own fire, the OPERATOR-CENSUS direction (`enabledOperatorPanes` dropped a member, and `panesInitialized` moved with an EMPTY list) re-authors the operator surface (`mountOperator` ≥ 1, `refresh`/`loadAppGraph`/`requestRebuild` 0) with the `settings` FIRE’s timeline index PRECEDING the re-author’s, and a CYCLIC `layout` push answers NO problem sentence while still reading MOVED', async () => {
    // §6 `O5` AS CORRECTED BY THE ADJUDICATIONS (the AUTHORITY these arms grade, applied and not re-litigated): ADJ 1 — the app-graph
    // census names EXACTLY `representationMode` and `layout`, and `enabledPanes` (ECHO), `defaultDocumentId` (TAB-CONTEXT-ONLY) and
    // `tabs` (BOOT-ONLY) are REMOVED; ADJ 2 — a SECOND predicate (`settingsMovesOperatorCensus`) owns the OPERATOR scope's SECTION
    // SET, and `onOperatorSettingsChanged` orders capture → COMMIT → FIRE `settings` → `if (settingsMovesOperatorCensus(…))
    // this.refreshOperator()` → `if (settingsMovesAppGraph(…)) this.editController.requestRebuild('operator')` → `pendingContentChange
    // = null`; ADJ 3 — an INCOMPARABLE member answers MOVED and never throws.
    // LAYER: envelope-class — the recorded `requestRebuild` kinds, the three instance counters, the ORDERED EVENT LOG, the paint's own
    // verdict, the AUTHORED `topK:` text and §2's fire→paint windows. Nothing here reads a rendered box, a pointer or the assembled
    // app (`G8` does, §8).
    // NON-VACUITY (stated per arm): every arm FIRST pushes its own BASELINE, settles, and RESETS every counter and the timeline, so
    // EXACTLY ONE member moves between `previous` and `next` and no earlier arm's move can make a "must not rebuild" arm read a lawful
    // rebuild. `(a)` is the positive that makes `(b)`'s zeros readings (a dead rebuild path would zero both); `(c)`'s `topK` control is
    // re-read from `(b)` so its `mountOperator ≥ 1` is never a constant; `(d)`'s cyclic pair carries a REAL move (left → right) inside
    // values no printer can render.
    // MUTATION THAT WOULD RED IT: the census left at five members (`enabledPanes`/`defaultDocumentId`/`tabs` re-assembling — `(b)` reads
    // non-zero counters for each); a census narrowed to one member (`(a)`'s other arm loses its rebuild); the unconditional
    // `requestRebuild('operator')` restored (`m2`: `(b)` and `(c)` both move); `refreshOperator` called BEFORE the fire (the timeline
    // order arm); no `refreshOperator` at all (`(c)`'s `mountOperator` reads 0); a printer-based comparison with no incomparable branch
    // (`(d)`: both cyclic sides print the same token ⇒ no rebuild ⇒ a real move DROPPED).
    // ⟨DECLARED OMISSION, so it is not accidental:⟩ the THROWING-MEMBER-READ class is graded at the PREDICATE level only (`O5(a)`/`O5(b)`
    // in the unit file). It CANNOT be driven through this host: `onOperatorSettingsChanged`'s own COMMIT dereferences the payload's
    // members DIRECTLY (`payload.representationMode`, `payload.layout`) BEFORE either predicate runs, so a throwing getter would escape
    // at the commit — a site the adjudications do not move — and a host arm for it would be a row demanding a change nobody authorized.
    const problems: string[] = []
    const drive = await seedHost()
    try {
      problems.push(...drive.seedProblems)
      problems.push(...operatorPaintPrecondition(drive, SETTINGS_PANE, 'O5'))

      /**
       * THE ARM RIG: push the arm's OWN `previous`, settle it, reset EVERY counter and the event log, then push `next` and settle. Every
       * arm below therefore measures exactly one member's move against a settled baseline — the discipline that keeps a "must not
       * rebuild" arm from reading a leftover move from the arm before it.
       */
      const arm = async (previous: Record<string, unknown>, next: Record<string, unknown>): Promise<ArmReading> => {
        problems.push(...drive.broadcastSettings(previous))
        await settle()
        drive.resetCounters()
        problems.push(...drive.broadcastSettings(next))
        await settle()
        return {
          counters: drive.counters(),
          rebuilds: drive.rebuildRequests(),
          verdicts: drive.verdicts(),
          windows: drive.fireWindows(),
          timeline: drive.timeline(),
          fires: drive.fires(),
        }
      }

      // ---- (a) THE APP-GRAPH DIRECTION: the rebuild path is ALIVE (this is what makes (b)'s zeros readings) --------------------
      const appGraphMoves: ReadonlyArray<{ member: string; next: Record<string, unknown>; why: string }> = [
        {
          member: 'representationMode',
          next: { ...basePayload(), representationMode: 'markdown' },
          why: 'ADJ 1 — `representationMode` reaches the toolbar in the ASSEMBLED envelope',
        },
        {
          member: 'layout',
          next: { ...basePayload(), layout: { version: 1, panes: [{ id: SETTINGS_PANE, zone: 'right' }] } },
          why: 'ADJ 1 — `layout` reaches the zone tracks in the ASSEMBLED envelope',
        },
      ]
      for (const entry of appGraphMoves) {
        const reading = await arm(basePayload(), entry.next)
        const limb = `O5(a:${entry.member})`
        if (!reading.timeline.includes(`fire:${SETTINGS_PANE}`)) {
          problems.push(
            `limb ${limb}: the push never FIRED \`${SETTINGS_PANE}\` (timeline read: ${shown(reading.timeline)}) — ADJ 2 makes the FIRE ` +
              `the operator pane's whole delivery, so a push that reaches no fire is a wiring fact this row cannot read around`,
          )
        }
        if (!reading.rebuilds.includes('operator')) {
          problems.push(
            `limb ${limb}: the push that moved the APP-GRAPH member \`${entry.member}\` requested NO rebuild (recorded: ` +
              `${shown(reading.rebuilds)}) — ${entry.why}, so \`settingsMovesAppGraph\` MUST answer "an app-graph member moved ⇒ ` +
              `rebuild" and the handler must request \`'operator'\``,
          )
        }
        if (reading.counters.refresh < 1 || reading.counters.loadAppGraph < 1 || reading.counters.mountOperator < 1) {
          problems.push(
            `limb ${limb}: the lawful rebuild read ${countersReading(reading.counters)} requestRebuild=${shown(reading.rebuilds)} — a ` +
              `rebuild is the host's OWN re-derive (\`requestRebuild('operator')\` → \`reDerive\` → \`refresh()\` → \`loadAppGraph\` + ` +
              `\`mountOperator\`), so all three sites are ≥ 1; a zero here would make every zero in (b) indistinguishable from a dead path`,
          )
        }
      }

      // ---- (b) THE APP-GRAPH-INERT MEMBERS: `requestRebuild` 0, `0/0/0`, and the pane STILL painted from its own fire -----------
      const inertMoves: ReadonlyArray<{
        member: string
        previous: Record<string, unknown>
        next: Record<string, unknown>
        paint: 'painted' | 'unchanged'
        why: string
      }> = [
        {
          member: 'enabledPanes',
          previous: basePayload(),
          next: { ...basePayload(), enabledPanes: APP_GRAPH_PANES.filter((id) => id !== SEARCH) },
          paint: 'painted',
          why:
            'ADJ 1 — REMOVED as an ECHO: `enabledPanes` reaches the app graph only through the registry, which `refresh()` never ' +
            're-applies, and the local route sets the registry BEFORE it persists and runs its own rebuild',
        },
        {
          member: 'defaultDocumentId',
          previous: basePayload(),
          next: { ...basePayload(), defaultDocumentId: 'doc-a' },
          paint: 'painted',
          why:
            'ADJ 1 — REMOVED as TAB-CONTEXT-ONLY: it reaches `getTabContext()`\'s `lastFocusedDocumentId` only, while the OPERATOR ' +
            'pane authors it (`operator-default-document`), so the fire is the whole delivery and the shape therefore MOVES',
        },
        {
          member: 'tabs',
          previous: basePayload(),
          next: { ...basePayload(), tabs: [{ id: 'tab-1', documentId: 'doc-a' }] },
          paint: 'unchanged',
          why:
            'ADJ 1 — REMOVED as BOOT-ONLY (`renderer.ts` reads `settings.tabs` once at boot, `tabStrip.load(settings?.tabs)`). NO ' +
            'operator pane authors a `tabs` line, so the fire delivers a SHAPE-EQUAL re-authoring: the arm grades the DELIVERY (the ' +
            'pane heard, ONE verdict) and the ZERO on the counters, never a moved paint (`D-43`: a bare fire over an unmoved source is ' +
            'never demanded as a paint)',
        },
        {
          member: 'topK',
          previous: basePayload(),
          next: { ...basePayload(), topK: TOPK_NEW },
          paint: 'painted',
          why: 'ADJ 1 — `topK` is a line the operator pane authors (`settingsContent`\'s `topK:`), never an app-graph member',
        },
        {
          member: 'panesInitialized',
          previous: { ...basePayload(), enabledPanes: APP_GRAPH_PANES.filter((id) => id !== DOC_NAV) },
          next: {
            ...basePayload(),
            enabledPanes: APP_GRAPH_PANES.filter((id) => id !== DOC_NAV),
            panesInitialized: false,
          },
          paint: 'painted',
          why:
            'ADJ 1 — `panesInitialized` gates the operator pane\'s visibility rows (`applyPersistedPaneVisibility`\'s ' +
            '`emptyMeansEnabled`); the arm\'s baseline leaves ONE app-graph pane disabled so the true→false flip really MOVES the ' +
            'authored rows (with every pane enabled the flip would author the same shape and the paint would be `unchanged` by law)',
        },
      ]
      const inertReadings = new Map<string, ArmReading>()
      for (const entry of inertMoves) {
        const reading = await arm(entry.previous, entry.next)
        inertReadings.set(entry.member, reading)
        const limb = `O5(b:${entry.member})`
        if (!reading.timeline.includes(`fire:${SETTINGS_PANE}`)) {
          problems.push(
            `limb ${limb}: the push never FIRED \`${SETTINGS_PANE}\` (timeline read: ${shown(reading.timeline)}) — the zeros below ` +
              `would then be "nothing happened" rather than a census reading`,
          )
        }
        if (reading.rebuilds.length !== 0) {
          problems.push(
            `limb ${limb}: the push that moved only \`${entry.member}\` requested ${shown(reading.rebuilds)} — LIMB: ${entry.why}. The ` +
              `corrected census must answer MOVED for NO member here, so the fire is the whole delivery`,
          )
        }
        if (reading.counters.refresh !== 0 || reading.counters.loadAppGraph !== 0 || reading.counters.mountOperator !== 0) {
          problems.push(
            `limb ${limb}: the push read ${countersReading(reading.counters)} — a settings write that moves no app-graph member must ` +
              `re-assemble NOTHING (\`refresh\`/\`loadAppGraph\`/\`mountOperator\` all 0; \`INV-E\`), and (a) proves on this same harness ` +
              `that the path is alive. LIMB: ${entry.why}`,
          )
        }
        if (entry.paint === 'painted') {
          problems.push(...paintVerdictProblems(reading.verdicts, SETTINGS_PANE, limb))
          // ADJ 2 PINS THE SPELLING: `applied` is the id the OPERATOR SURFACE authors, `operator-pane-<id>` (the app-graph arm keeps
          // `pane-<id>` because that is that surface's spelling — two surfaces, one rule).
          const applied = reading.verdicts.length === 1 ? reading.verdicts[0]['applied'] : undefined
          if (fingerprint(applied) !== fingerprint([`operator-pane-${SETTINGS_PANE}`])) {
            problems.push(
              `limb ${limb}: the painted verdict's \`applied\` reads ${shown(applied)}, not exactly ` +
                `\`['operator-pane-${SETTINGS_PANE}']\` — ADJ 2 pins the operator surface's OWN authored id for a pane paint (the ` +
                `app-graph arm keeps \`pane-<id>\`; two surfaces, one rule)`,
            )
          }
        } else {
          if (reading.verdicts.length !== 1) {
            problems.push(
              `limb ${limb}: the push produced ${reading.verdicts.length} pane verdict(s) ${shown(reading.verdicts)}, not exactly ONE — ` +
                `the fire is unconditional (ADJ 2), so the pane HEARD and answered, even where the answer is \`unchanged\``,
            )
          } else if (reading.verdicts[0]['painted'] !== false || fingerprint(reading.verdicts[0]['applied']) !== fingerprint([])) {
            problems.push(
              `limb ${limb}: the verdict reads ${shown(reading.verdicts[0])}, not \`painted:false\` with \`applied === []\` — ` +
                `\`${entry.member}\` is authored by NO operator pane, so the re-authored shape is EQUAL and nothing may be minted. ` +
                `LIMB: ${entry.why}`,
            )
          }
        }
        problems.push(...paintWindowProblems(reading.windows, limb))
        if (entry.member === 'topK' && renderedTopK(drive.operatorMount()) !== TOPK_NEW) {
          problems.push(
            `limb ${limb}: the rendered settings section reads \`topK: ${shown(renderedTopK(drive.operatorMount()))}\` after a push ` +
              `that moved it to \`${TOPK_NEW}\` — the zero on the three counters is only a reading if the FIRE delivered the change`,
          )
        }
      }

      // ---- (c) THE OPERATOR-CENSUS DIRECTION: the operator surface is RE-AUTHORED, and the FIRE PRECEDES it --------------------
      const operatorMoves: ReadonlyArray<{
        member: string
        previous: Record<string, unknown>
        next: Record<string, unknown>
        why: string
      }> = [
        {
          member: 'enabledOperatorPanes',
          previous: basePayload(),
          next: { ...basePayload(), enabledOperatorPanes: OPERATOR_PANES.filter((id) => id !== STATUS_PANE) },
          why:
            'ADJ 2 — a member DROPPED from a non-empty `enabledOperatorPanes` moves the operator scope\'s SECTION SET, and ' +
            '`refreshOperator()` (which IS `mountOperator()`) is that direction\'s whole delivery',
        },
        {
          member: 'panesInitialized',
          previous: { ...basePayload(), enabledOperatorPanes: [] },
          next: { ...basePayload(), enabledOperatorPanes: [], panesInitialized: false },
          why:
            'ADJ 2\'s `emptyMeansEnabled` gate — an EMPTY list with `panesInitialized` true means NONE and with it unset means ALL, so ' +
            'the section set moved with the LIST untouched: the PRE-INIT gate, not the list, is the mover',
        },
      ]
      for (const entry of operatorMoves) {
        const reading = await arm(entry.previous, entry.next)
        const limb = `O5(c:${entry.member})`
        if (reading.counters.mountOperator < 1) {
          problems.push(
            `limb ${limb}: the operator-census direction read ${countersReading(reading.counters)} — LIMB: ${entry.why}. ` +
              `\`${OPERATOR_CENSUS_PREDICATE}\` must answer MOVED here and the handler must route that move through ` +
              `\`refreshOperator()\`, which IS \`mountOperator()\`: a zero means the operator surface was never re-authored and the ` +
              `pane's own rows would keep the stale section set`,
          )
        }
        if (reading.counters.refresh !== 0 || reading.counters.loadAppGraph !== 0) {
          problems.push(
            `limb ${limb}: the operator-census direction RE-ASSEMBLED the app graph (${countersReading(reading.counters)}) — the ` +
              `operator scope's section set is not the app graph's subject, so ` +
              `\`${APP_GRAPH_PREDICATE}\` must answer MOVED for it and the app graph must not move at all`,
          )
        }
        if (reading.rebuilds.length !== 0) {
          problems.push(
            `limb ${limb}: the push requested ${shown(reading.rebuilds)} — the corrected handler routes the operator census through ` +
              `\`refreshOperator()\` and the app graph through the guarded \`requestRebuild('operator')\`; an operator-only move must ` +
              `record NO rebuild`,
          )
        }
        // THE LOAD-BEARING ORDER (ADJ 2): the FIRE's timeline index PRECEDES the re-author's, so the pane's own paint is never the
        // re-assembly's by-product.
        const fireAt = reading.timeline.indexOf(`fire:${SETTINGS_PANE}`)
        const mountAt = reading.timeline.indexOf('mountOperator')
        if (fireAt < 0) {
          problems.push(
            `limb ${limb}: the timeline carries NO \`fire:${SETTINGS_PANE}\` entry (read: ${shown(reading.timeline)}) — the handler must ` +
              `FIRE the pane before it re-authors anything`,
          )
        } else if (mountAt < 0) {
          problems.push(
            `limb ${limb}: the timeline carries NO \`mountOperator\` entry (read: ${shown(reading.timeline)}) — the operator re-author ` +
              `never ran, so there is no order to read`,
          )
        } else if (!(fireAt < mountAt)) {
          problems.push(
            `limb ${limb}: the operator re-author ran BEFORE (or with) the \`${SETTINGS_PANE}\` fire (fire at timeline index ` +
              `${fireAt}, mountOperator at ${mountAt}; timeline: ${shown(reading.timeline)}) — ADJ 2's order is COMMIT → FIRE → the ` +
              `guarded re-assemblies, because a paint that arrives as the re-assembly's by-product is exactly the route this unit ` +
              `removes`,
          )
        }
        problems.push(...paintVerdictProblems(reading.verdicts, SETTINGS_PANE, limb))
      }
      // THE CONTROL, re-read HERE so (c)'s `mountOperator ≥ 1` is never a constant: the `topK`-only arm of (b) moved the pane's own
      // text and mounted NOTHING, on the SAME harness shape.
      const topKControl = inertReadings.get('topK')
      if (topKControl === undefined) {
        problems.push(
          `limb O5(c:control): the \`topK\`-only arm of (b) left no reading — the control that keeps \`mountOperator ≥ 1\` from being ` +
            `read as a constant has no subject`,
        )
      } else if (topKControl.counters.mountOperator !== 0) {
        problems.push(
          `limb O5(c:control): the \`topK\`-only push mounted the operator surface ${topKControl.counters.mountOperator} time(s) — the ` +
            `operator census must answer HELD for \`topK\`, so the ≥ 1 in this arm is a reading of the census and not of a harness that ` +
            `mounts on every write`,
        )
      }

      // ---- (d) THE CYCLIC CLASS, THROUGH THE HOST: NO problem sentence, and the predicate answers MOVED -------------------------
      // ⟨WHY THE PAIR IS PUSHED IN ONE SYNCHRONOUS TURN, measured rather than assumed.⟩ The class ADJ 3 names is a payload whose
      // comparison cannot be MADE — two DISTINCT cycles that a printer collapses to one token. To reach that pair through the host, the
      // handler's `previous` must already be cyclic, and `refresh()` (which a rebuild always runs) RE-READS
      // `bridge.operatorSettings.get()` and re-commits `lastOperatorSettings` from the store — so a settled baseline push is clobbered
      // with the store's PRINTABLE payload before the next push arrives. `onOperatorSettingsChanged` is fully SYNCHRONOUS, so two
      // pushes in ONE turn give the second a `previous` that is the FIRST's cyclic payload: that is the incomparable pair, read through
      // the real handler. The graded reading is therefore `requestRebuild` (recorded synchronously, and cleared between the two pushes)
      // — the counters are deliberately NOT graded here, because the first push's own in-flight re-derive lands inside the settle.
      const cyclicLayout = (zone: 'left' | 'right'): Record<string, unknown> => {
        const layout: Record<string, unknown> = { version: 1, panes: [{ id: SETTINGS_PANE, zone }] }
        layout['self'] = layout
        return layout
      }
      const cyclicLeft = { ...basePayload(), layout: cyclicLayout('left') }
      const cyclicRight = { ...basePayload(), layout: cyclicLayout('right') }
      // THE FLOOR: the pair carries a REAL move (left → right) inside values no printer renders — so a `false` answer is a DROPPED move.
      const leftZone = (cyclicLeft.layout as { panes: Array<{ zone: string }> }).panes[0]!.zone
      const rightZone = (cyclicRight.layout as { panes: Array<{ zone: string }> }).panes[0]!.zone
      if (leftZone === rightZone) {
        problems.push(
          `limb O5(d:cyclic): the two cyclic payloads carry the SAME \`panes[0].zone\` (${shown(leftZone)}) — the pair would move ` +
            `nothing and the arm's "MOVED" reading would be vacuous`,
        )
      }
      problems.push(...drive.broadcastSettings(cyclicLeft))
      drive.resetCounters()
      const cyclicSentences = drive.broadcastSettings(cyclicRight)
      await settle()
      if (cyclicSentences.length > 0) {
        problems.push(
          `limb O5(d:cyclic): the host answered ${shown(cyclicSentences)} for a push whose \`layout\` is CYCLIC — ADJ 3: a cyclic ` +
            `payload must answer a boolean and must never throw, and the handler runs inside the PRELOAD listener, so a throw here ` +
            `escapes into the broadcast and the pane is never delivered`,
        )
      }
      const cyclicRebuilds = drive.rebuildRequests()
      const cyclicVerdicts = drive.verdicts()
      if (!cyclicRebuilds.includes('operator')) {
        problems.push(
          `limb O5(d:cyclic): a push whose \`layout\` is CYCLIC — against a PREVIOUS whose layout is cyclic too and whose ` +
            `\`panes[0].zone\` moved ${shown(leftZone)} → ${shown(rightZone)} — requested NO rebuild (recorded: ` +
            `${shown(cyclicRebuilds)}) — ADJ 3: two DISTINCT cyclic layouts are INCOMPARABLE, and an incomparable member answers MOVED ` +
            `("a needless re-assembly is cheap, a stale app graph is not"). Two cycles that both print the same token compare EQUAL and ` +
            `a REAL left → right move is DROPPED — this IS that defect, read through the host`,
        )
      }
      if (cyclicVerdicts.length !== 1) {
        problems.push(
          `limb O5(d:cyclic): the cyclic push produced ${cyclicVerdicts.length} pane verdict(s) ${shown(cyclicVerdicts)}, not exactly ` +
            `ONE — the fire is unconditional and the pane must answer a declared word; a cyclic \`layout\` is authored by NO operator ` +
            `pane, so the lawful shape is \`unchanged\` with \`applied: []\``,
        )
      } else if (!['painted', 'unchanged'].includes(String(cyclicVerdicts[0]['reason']))) {
        problems.push(
          `limb O5(d:cyclic): the verdict reads ${shown(cyclicVerdicts[0])} — the paint's vocabulary is closed (\`painted\`/\`unchanged\` ` +
            `plus the declared absences), so a cyclic payload may not produce a word outside it`,
        )
      }
      problems.push(...paintWindowProblems(drive.fireWindows(), 'O5(d:cyclic)'))
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb O5 — the CORRECTED FIELD CENSUS, driven BOTH ways through \`onOperatorSettingsChanged\` (§6 O5; §1 \`F-4\`; §2; ADJ 1/2/3). ` +
        `${problems.length} problem(s). (a) a push that moved \`representationMode\` or \`layout\` must record \`requestRebuild('operator')\` ` +
        `AND re-assemble for real (\`refresh\`+\`loadAppGraph\`+\`mountOperator\` ≥ 1) — the positive that makes every zero below a ` +
        `reading. (b) \`enabledPanes\`/\`defaultDocumentId\`/\`tabs\`/\`topK\`/\`panesInitialized\` must each read \`requestRebuild\` 0 and ` +
        `\`0/0/0\`, with the pane STILL delivered from its own fire (ONE verdict, \`applied\` the operator surface's own id where the ` +
        `shape moved) and §2's paint-window census all-zero. (c) \`enabledOperatorPanes\` and the pre-init \`panesInitialized\` gate must ` +
        `re-author the operator surface (\`mountOperator\` ≥ 1, \`refresh\`/\`loadAppGraph\`/\`requestRebuild\` 0) with the \`settings\` ` +
        `FIRE's timeline index BEFORE the re-author's, and the \`topK\` control must mount NOTHING. (d) a CYCLIC \`layout\` push must ` +
        `answer NO problem sentence and still read MOVED. The THROWING-member-read class is graded at the PREDICATE level only (the ` +
        `handler's COMMIT dereferences members before either predicate runs — a declared omission, not an oversight). envelope-class — ` +
        `the REAL host over the layout-less DOM shim; no rendered box, no pointer (\`G8\`-only, §8)`,
    ).toEqual([])
  })

  it('O6 — `B6-F6`’s RESIDUE: the NEWER store-listing settlement owns the paint (exactly ONE verdict, `0/0/0`, the frame reads the newer store) and the LOSING one is DROPPED (ZERO verdicts, nothing committed, the frame never reads it); the CONTROL: a lone settlement paints exactly once', async () => {
    // §6 `O6`; §1 `F-7`/§5 (`B6-F6`'s residue): `refreshRegistryManage()` issues `bridge.rag.stores()` and commits `lastStoreListing`
    // with NO stamp, so two racing settlements to ONE subject are last-settling-wins. The lawful answer is the GENERATION stamp
    // (`ASM-B6-3`/`B5-F5(b)`): the losing answer is DROPPED — not queued (`D-82` clause 4), not committed, and it paints nothing.
    // LAYER: envelope-class — the app's OWN `window.provident.sidebar.registryManage` seam, the recorded private
    // `lastStoreListing` field, the paint's verdict, and the AUTHORED store row text.
    // NON-VACUITY: the race is driven with the LOSER SETTLING LAST (the order a stamp-less implementation shows the wrong answer),
    // the winner's text is asserted PRESENT and the loser's ABSENT, and the CONTROL re-drives a LONE settlement on the same shape so
    // the loser's zero is a reading of the stamp rather than of a dead path.
    // RED AT THIS HEAD: there is no stamp (the loser wins) and the settlement paints NOTHING (it re-mounts the operator surface
    // instead), so the verdict arms and the "newer text" arm both red.
    const problems: string[] = []
    const drive = await seedHost()
    try {
      problems.push(...drive.seedProblems)
      problems.push(...operatorPaintPrecondition(drive, SETTINGS_PANE, 'O6'))
      if (!renderedHasStore(drive.operatorMount(), STORE_BOOT)) {
        problems.push(
          `limb O6: the boot frame does not author the boot listing's store \`${STORE_BOOT}\` — "the frame reads the newer text" ` +
            `would have no baseline`,
        )
      }
      drive.deferStores(true)
      // TWO settlements in flight, the SECOND holding the newer generation.
      problems.push(...drive.registryManage({ op: 'add', name: 'older-request' }))
      await settle(4)
      problems.push(...drive.registryManage({ op: 'add', name: 'newer-request' }))
      await settle(4)
      if (drive.pendingStores() !== 2) {
        problems.push(
          `limb O6: the host issued ${drive.pendingStores()} \`rag.stores()\` read(s) for TWO registry-manage applies, not 2 — the ` +
            `race this row grades has no subject (§5: \`refreshRegistryManage\` is the settlement's source)`,
        )
      }

      // ---- (a) THE NEWER SETTLEMENT SETTLES FIRST: it OWNS the paint -----------------------------------------------------
      drive.resetCounters()
      drive.resolveStores(1, storeListing(STORE_NEWER))
      await settle()
      const newerCounters = drive.counters()
      problems.push(...paintVerdictProblems(drive.verdicts(), SETTINGS_PANE, 'O6(newer)'))
      if (newerCounters.refresh !== 0 || newerCounters.loadAppGraph !== 0 || newerCounters.mountOperator !== 0) {
        problems.push(
          `limb O6(newer): the newer settlement read ${countersReading(newerCounters)} — a store-listing settlement is the ` +
            `SETTINGS PANE's source (§2), so it paints that pane and never re-assembles the graph`,
        )
      }
      problems.push(...paintWindowProblems(drive.fireWindows(), 'O6(newer)'))
      if (!renderedHasStore(drive.operatorMount(), STORE_NEWER)) {
        problems.push(
          `limb O6(newer): the rendered settings section does NOT author the newer store \`${STORE_NEWER}\` — the newer settlement ` +
            `owns the paint (§5), so its answer must reach the rendered tree`,
        )
      }

      // ---- (b) THE LOSING SETTLEMENT SETTLES LAST: it is DROPPED ---------------------------------------------------------
      drive.resetCounters()
      drive.resolveStores(0, storeListing(STORE_LOSER))
      await settle()
      const loserCounters = drive.counters()
      const loserVerdicts = drive.verdicts()
      const listing = drive.hostField('lastStoreListing') as { stores?: Array<{ name?: unknown }> } | null
      const held = listing?.stores?.[0]?.name
      const frame = drive.operatorMount()
      problems.push(...paintVerdictProblems(loserVerdicts, SETTINGS_PANE, 'O6(loser)', 0))
      if (loserCounters.refresh !== 0 || loserCounters.loadAppGraph !== 0 || loserCounters.mountOperator !== 0) {
        problems.push(
          `limb O6(loser): the losing settlement read ${countersReading(loserCounters)} — a DROPPED settlement commits nothing and ` +
            `paints nothing, and it certainly does not re-assemble the graph`,
        )
      }
      if (held !== STORE_NEWER) {
        problems.push(
          `limb O6(loser): after both settlements \`lastStoreListing\` holds ${shown(held)}, not the NEWER answer \`${STORE_NEWER}\` — ` +
            `§5/\`F-7\`: the settlement carries a GENERATION stamp over its ONE subject, so an answer that no longer holds the newest ` +
            `generation is DROPPED rather than committed (last-settling-wins is the defect)`,
        )
      }
      if (renderedHasStore(frame, STORE_LOSER)) {
        problems.push(
          `limb O6(loser): the rendered settings section authors the LOSING settlement's store \`${STORE_LOSER}\` — the losing answer ` +
            `must be dropped BEFORE it reaches the pane's source, so the frame can only ever read the newer listing`,
        )
      }
      if (!renderedHasStore(frame, STORE_NEWER)) {
        problems.push(
          `limb O6(loser): the rendered settings section no longer authors the newer store \`${STORE_NEWER}\` — the dropped answer ` +
            `must not disturb what the winner committed`,
        )
      }

      // ---- (c) THE CONTROL: a LONE settlement paints EXACTLY ONCE ---------------------------------------------------------
      drive.resetCounters()
      problems.push(...drive.registryManage({ op: 'add', name: 'control-request' }))
      await settle(4)
      const pendingNow = drive.pendingStores()
      if (pendingNow !== 3) {
        problems.push(`limb O6(control): the control apply issued no \`rag.stores()\` read (pending ${pendingNow}, expected 3) — the control arm has no subject`)
      }
      drive.resolveStores(pendingNow - 1, storeListing(STORE_CONTROL))
      await settle()
      const controlCounters = drive.counters()
      problems.push(...paintVerdictProblems(drive.verdicts(), SETTINGS_PANE, 'O6(control)'))
      if (controlCounters.refresh !== 0 || controlCounters.loadAppGraph !== 0 || controlCounters.mountOperator !== 0) {
        problems.push(
          `limb O6(control): the lone settlement read ${countersReading(controlCounters)} — a listing settlement paints the pane and ` +
            `never re-assembles`,
        )
      }
      if (!renderedHasStore(drive.operatorMount(), STORE_CONTROL)) {
        problems.push(
          `limb O6(control): the lone settlement's answer \`${STORE_CONTROL}\` does not reach the rendered frame — with the control ` +
            `also silent, the loser's zero above is not a reading of a stamp but of a dead path`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb O6 — \`B6-F6\`'s residue: the NEWER store-listing settlement owns the paint and the LOSING one is DROPPED (§6 O6; ` +
        `§1 \`F-7\`; §5; ` +
        '`ASM-B6-3`' +
        `). ${problems.length} problem(s). Two racing \`rag.stores()\` settlements to ONE subject must leave ` +
        `\`lastStoreListing\` holding the NEWER answer, the frame authoring the NEWER store and NOT the loser's, exactly ONE pane ` +
        `verdict for the winner and ZERO for the loser, \`0/0/0\` on the three counters at both settlements, ZERO bridge reads ` +
        `inside the fire→paint window beside the producer's own \`rag.stores === 1\`, and a LONE settlement must paint exactly once ` +
        `(the control). envelope-class`,
    ).toEqual([])
  })

  // ⟨ADJUDICATION 7 (`docs/L1/unit-b-9-pane-operator-settings.md` §10), APPLIED VERBATIM: **`O7` IS AUTHORED AND SKIPPED, WITH ITS
  // GRANT NAMED.** The fix is ONE declaration in `src/renderer/gnosis-crud-panes.ts` — `gnosisCrudPanesTouchedBy`'s field census
  // gains `'no-edit-access'` on the two success paths that clear it — and that file is OUTSIDE this unit's write scope, so the row
  // is `it.skip`ped with that exact sentence as its reason: the suite keeps its clean floor (`1` skipped more, `0` failed more) and
  // the specification is PRESERVED rather than archived (`D-42`'s archive lost the row; `D-43` had to dig it back).
  // **L0 OWES THE GRANT; THIS UNIT DOES NOT TAKE IT.** The row reds for real when it is un-skipped without the grant — measured at
  // this head: `gnosis-wikis` never fires on the clearing settle, and its frame still authors `No edit access`.
  it('O7 — `ADV-B8-1`: the `noEditAccess` CLEAR must fire BOTH panes that render the H-2 indicator — a settle that clears the shared field fires `gnosis-documents` AND `gnosis-wikis`, so the indicator cannot outlive its flag (SKIPPED BY ADJUDICATION 7: its green needs ONE field-census entry in `src/renderer/gnosis-crud-panes.ts` naming `no-edit-access` on the two success paths that clear it — a file OUTSIDE this unit\'s write scope, so L0 owes the grant and this unit does not take it)', async () => {
    // §6 `O7`; §1 `F-8`/§5 (`ADV-B8-1`): the `noEditAccess` clear on the two SUCCESS paths writes the field WITHOUT firing, and the
    // settle's field census does not name it, so a sibling pane rendering the H-2 indicator keeps it until it hears again.
    // THE FIX IS ONE LINE IN `src/renderer/gnosis-crud-panes.ts` — OUTSIDE this unit's write scope (`F-8`: "row first, grant second;
    // never a silent widening"), so this row REDS BY DESIGN and its message NAMES the missing declaration.
    // LAYER: envelope-class — the CRUD host's OWN producer entries, the recorded `onChanged`/fire census, and the AUTHORED text of the
    // two app-graph frames the indicator is rendered into.
    // NON-VACUITY: step (1) PROVES the indicator is authored by BOTH panes (the deny path fires both and both frames carry it), so
    // step (2)'s two-pane requirement can never be vacuous; the documents frame's repaint in step (2) PROVES the flag really cleared,
    // while the wikis frame still authoring the indicator is exactly the harm.
    const problems: string[] = []
    const drive = await seedHost()
    try {
      problems.push(...drive.seedProblems)
      for (const paneId of CRUD_PANES) {
        if (drive.registry?.get(paneId) == null) {
          problems.push(`limb O7: no pane is REGISTERED as \`${paneId}\` — the H-2 indicator has no carrier`)
        }
        if (drive.registry?.isEnabled(paneId) !== true) {
          problems.push(`limb O7: \`${paneId}\` is NOT ENABLED — its frame does not exist and the row would be vacuous`)
        }
        if (livePaneFrame(drive, paneId) === undefined) {
          problems.push(
            `limb O7: the seed carries NO materialized frame \`pane-${paneId}\` (roots: [${rootIds(drive.roots()).join(', ')}]) — ` +
              `a paint reading over an unmounted frame is VACUOUS`,
          )
        }
      }
      // THE DECLARATION ITSELF is already right (the mapping names both panes); it is the SETTLE's FIELD LIST that is not.
      try {
        const module = (await import('../../../src/renderer/gnosis-crud-panes.js')) as Record<string, unknown>
        const touchedBy = module['gnosisCrudPanesTouchedBy']
        if (typeof touchedBy !== 'function') {
          problems.push(
            'limb O7: `gnosisCrudPanesTouchedBy` does not resolve as a FUNCTION on `src/renderer/gnosis-crud-panes.ts` — the field ' +
              'census the fix extends has no exported subject',
          )
        } else {
          const answer = (touchedBy as (fields: readonly string[]) => unknown)(['no-edit-access'])
          if (fingerprint(answer) !== fingerprint([...CRUD_PANES])) {
            problems.push(
              `limb O7: \`gnosisCrudPanesTouchedBy(['no-edit-access'])\` answered ${shown(answer)}, not ${shown([...CRUD_PANES])} — ` +
                `\`F-8\`: the H-2 indicator is authored by BOTH panes, so the mapping must name both`,
            )
          }
        }
      } catch (error) {
        problems.push(`limb O7: \`src/renderer/gnosis-crud-panes.ts\` does not resolve as a module (${String(error)})`)
      }

      // ---- (1) THE DENY PATH SETS THE FLAG: both panes fire, both frames author the H-2 indicator -------------------------
      drive.setSecurity(['read', 'dispatch', 'gnosis'])
      drive.resetCounters()
      problems.push(...drive.crudDocuments('gnosis.wiki.create', { callerId: 'operator', name: 'denied', requestId: 'o7-1' }))
      await settle()
      const deniedFires = drive.fires().map((fire) => fire.paneId)
      for (const paneId of CRUD_PANES) {
        if (!deniedFires.includes(paneId)) {
          problems.push(
            `limb O7(seed): the DENY path (the \`gnosis-edit\` group off) did not fire \`${paneId}\` (fires read ` +
              `${shown(deniedFires)}) — the row's positive floor is that the H-2 indicator is authored by BOTH panes`,
          )
        }
        const frame = livePaneFrame(drive, paneId)
        if (frame === undefined || !authoredText(frame).includes(NO_EDIT_TEXT)) {
          problems.push(
            `limb O7(seed): the \`${paneId}\` frame does not author the H-2 indicator (authored: ` +
              `${shown(authoredText(frame).slice(0, 240))}) — without it, "the indicator outlives its flag" has no subject`,
          )
        }
      }

      // ---- (2) THE CLEAR: a SUCCESSFUL settle writes `noEditAccess = false` — and it must fire BOTH panes ----------------
      drive.setSecurity(['read', 'dispatch', 'gnosis', 'gnosis-edit'])
      drive.resetCounters()
      problems.push(...drive.crudDocuments('gnosis.document.list', { wikiId: 'wiki-a' }))
      await settle()
      const clearFires = drive.fires().map((fire) => fire.paneId)
      const clearVerdicts = drive.verdicts().map((verdict) => verdict['paneId'])
      for (const paneId of CRUD_PANES) {
        if (!clearFires.includes(paneId)) {
          problems.push(
            `limb O7: the settle that CLEARED the shared \`noEditAccess\` field did NOT fire \`${paneId}\` (fires read ` +
              `${shown(clearFires)}, verdicts ${shown(clearVerdicts)}) — THE MISSING DECLARATION IS ONE ENTRY: ` +
              `\`src/renderer/gnosis-crud-panes.ts\`'s settle field census (\`applyDocumentsResult\`/\`applyWikisResult\`'s returned ` +
              `\`GnosisCrudField[]\`) does not name \`'no-edit-access'\` on the two SUCCESS paths that write \`noEditAccess = false\`, ` +
              `so \`firePanes\` never reaches the sibling pane that renders the H-2 indicator (\`F-8\`, \`ADV-B8-1\`): the field is ` +
              `WRITTEN and not ANNOUNCED. \`gnosisCrudPanesTouchedBy(['no-edit-access'])\` ALREADY names both panes, so the fix is ` +
              `the CALLER's list — one line, OUTSIDE this unit's write scope`,
          )
        }
      }
      const documentsAfter = authoredText(livePaneFrame(drive, DOCUMENTS_PANE))
      const wikisAfter = authoredText(livePaneFrame(drive, WIKIS_PANE))
      if (documentsAfter.includes(NO_EDIT_TEXT)) {
        problems.push(
          `limb O7: the \`${DOCUMENTS_PANE}\` frame STILL authors the H-2 indicator after the flag was cleared and that pane ` +
            `repainted — the clear did not reach its own pane's source`,
        )
      }
      if (wikisAfter.includes(NO_EDIT_TEXT)) {
        problems.push(
          `limb O7: the \`${WIKIS_PANE}\` frame STILL authors \`${NO_EDIT_TEXT}\` after the shared \`noEditAccess\` flag was cleared — ` +
            `\`ADV-B8-1\`: "the H-2 indicator cannot outlive its flag". The pane was never told, because the settle's field census did ` +
            `not name \`'no-edit-access'\` (the documents pane cleared only because it repainted for its OWN moved list — luck, not ` +
            `the declaration). Authored: ${shown(wikisAfter.slice(0, 240))}`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb O7 — \`ADV-B8-1\`: a CLEARED shared field fires BOTH panes that render it (§6 O7; §1 \`F-8\`; §5). ` +
        `${problems.length} problem(s). EXPECTED RED AT THIS HEAD BY DESIGN (\`F-8\`): the fix is ONE line in ` +
        `\`src/renderer/gnosis-crud-panes.ts\` — the settle's field census must name \`'no-edit-access'\` on the success paths that ` +
        `write \`noEditAccess = false\` — and that file is OUTSIDE this unit's write scope, so this unit REQUEST the grant rather ` +
        `than taking it. The row's floor: the deny path PROVES both frames author the H-2 indicator before the clear, so the ` +
        `two-pane requirement is never vacuous. envelope-class`,
    ).toEqual([])
  })
})
