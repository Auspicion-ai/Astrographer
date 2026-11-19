// tests/integration/shell-chrome/pane-gnosis.test.ts — unit `B-8` `pane-gnosis`'s HOST rows for the SECOND pass (§12a, `D-44`):
// `Q2d`, `Q2w`, `Q2s`, `Q2n`, `Q3`, `X3`. Authored BEFORE any byte of the landing (RCA-1: the red set is RUN and REPORTED before
// implementation). The clause unit (`C1`…`C4`, `P1-1`, `X1b`) lives in `tests/unit/shell-chrome/pane-gnosis.test.ts`.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-8-pane-gnosis.md` §12a plus the sections it re-states —
//   §2  the four sources NAMED: `gnosis-documents`/`gnosis-wikis` answer (a) their OWN bridge settle and (b) the engine descriptor,
//       which re-reads (a) THROUGH THE PRODUCER (`refreshFromEngine`); the paint re-reads NOTHING.
//   §3  the re-read census FROM THE PAINT: `snapshot` 0 · `docHeads` 0 · `backlinks` 0 · `security` 0 · `template.get` 0, with the
//       producer's OWN `bridge.gnosis.documents`/`.wikis` call as the positive that makes the zeros readable. **`ASM-B8-1`:
//       `paintReplumbedPane` gains NO arm for either CRUD pane** — a per-pane reader table is the second authority `B-5` `O-3` refuses,
//       and a paint that re-issued its own producer is the unbounded settle→fire→settle loop `F-4` names.
//   §6  `Q2` (a CRUD settle paints its own pane; a shared-field settle fires BOTH, a private-field settle fires ONE), `Q3` (the
//       engine descriptor re-reads ONCE, from the producer; zero from the paint; `publishChange` once; `requestRebuild` 0; LOCAL
//       fence), `X3` (`INV-E` and its mutants, ONE `m6` PER MOVED PANE), and the AUTHORING REFUSALS of `D-43`: no row may demand a
//       PAINT from a bare fire over already-painted state, no row may demand a `gnosis-status` paint through `updatePane`, and no row
//       may require a live engine (or a live Electron app) to answer.
//   §1  `F-8` THE FIELD CENSUS: `lastWikis` and `noEditAccess` are rendered by BOTH panes; `lastDocuments`/`lastDocument`/
//       `lastConflict` by `gnosis-documents`; `lastWiki` by `gnosis-wikis`. So the FIRE'S OWNER is a per-field declaration, never the
//       entry point — which is why a `gnosis.wiki.list` settle is a SHARED-field settle and a `gnosis.wiki.get` one is private.
//   §12a the exported pure mapping `gnosisCrudPanesTouchedBy(fields)` IS that declaration (`Q2n` drives it).
//
// THE HARNESS CONSTRUCTS THE WIRING THE WAY THE GRANTED `renderer.ts` DOES — that is the point of the landing, and a harness that
// built its own seam would be reading a different tree:
//     const crud = new GnosisCrudPanes({ registry, bridge: crudBridge, onChanged: (paneId) => { paneEvents.fire(paneId) } })
//     crud.registerPanes()
//     const host = new SidebarPanes({ …, events: paneEvents, gnosis: { status, query, documents, wikis, refreshFromEngine } })
//     await host.boot(runtime)
// `registerPanes()` runs BEFORE the host is constructed, and the host's own assemble authors a `pane-<id>` frame for every ENABLED
// app-graph pane — so both CRUD panes are registered, explicitly enabled in the seed, and MATERIALIZED before any row grades a paint.
// EACH ROW REPORTS THAT PRECONDITION (`updatePane(<pane>)` must answer `'unchanged'` on the booted state, never `'not-mounted'` /
// `'not-enabled'` / `'not-a-pane'`): a paint row over an unmounted frame is vacuous, and `paintPane` answers `not-mounted` rather than
// inventing a mount.
//
// THE OBSERVABLES: the REAL `SidebarPanes` over `installShim()` from `src/shared/dom-shim.ts`; a RECORDING runtime double whose
// `loadEnvelope` seeds the materialized root set (the Runtime's own closed class), whose `materializedContentRoots()` answers it, whose
// `materializedDocumentRoots()` answers the per-document census the paint carries, and whose `applyContentReconcile` records the call,
// answers `applied` and performs the channel's whole-root replace; a REAL `createPaneEvents()` behind a COUNTING FAÇADE that forwards
// every member byte-for-byte while counting what the host does on it (`fire`, `publishChange`) AND — load-bearing for §3 — records the
// DELTA of the whole bridge census across each `fire` call, so "the PAINT re-read nothing" is a reading of the fire→paint window
// rather than of a whole producer round trip (the producer legitimately calls `security.get` for its M13 gate and the CRUD tool
// itself, and the contract's zeros are explicitly the PAINT's); `updatePane`/`refresh`/`loadAppGraph`/`mountOperator` wrapped on the
// INSTANCE (an own-property shadows the prototype method, so the host's OWN calls are counted — the `INV-E` counters); and a bridge
// double that COUNTS every call the unit's census names (`rag.*`, `security.get`, `template.*`, `gnosis.documents`, `gnosis.wikis`,
// `operatorSettings.*`, `onPaneVisibility`, `pushPaneCatalog`).
//
// THE `m1`..`m6` MUTANT IDIOM (`B-6`'s `D6` + `B-7`'s `X3`): `channel.subscribe(<paneId>, mutantHandler)` adds an ADDITIONAL
// registration on the REAL channel; each mutant's reading is COMPUTED into the aggregate failure message (`B5-DOC-PRINT`: no
// `console.log`), and a mutant that is NOT caught is itself a row failure (a harness that cannot SEE a mutant cannot prove the
// invariant it falsifies). `m6` is ONE PER MOVED PANE and is produced by DROPPING that pane's fire in the granted wiring — the
// counters then read `0/0/0` PERFECTLY while the pane still shows its OLD data and the host's field has moved, which is exactly
// `D-40`'s lesson: the counters are necessary and not sufficient.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): every row here is ENVELOPE-class — the REAL host over the LAYOUT-LESS DOM shim (no CSS, no
// computed style, no layout) against a RECORDING runtime double and a counting bridge. The observables are CALL COUNTS, the paint's
// own verdict fields (`{paneId, painted, reason, applied}`), the IDENTITY of authored nodes across the pre/post root sets, and the
// AUTHORED `LegacyNodeData` tree (walked, never the DOM). What this layer can NEVER read, named so nobody quotes it: that a frame was
// RE-MINTED in a real window, the pane as the user sees it, its box/scroll/style, any pointer, the NUMBER of IPCs on the wire (the
// census counts BRIDGE calls) and the assembled app — `docs/L1/unit-b-8-pane-gnosis.md` §8/`G8` are the only app-green readings.
//
// NON-VACUITY (stated per row in its own comment): every zero is floored on the SAME harness shape by a positive reading that must
// move — the producer's own `bridge.gnosis.documents`/`.wikis` count beside the paint-window zeros, the `painted:true`+`applied`
// arms beside the `unchanged` controls, `Q2s`'s two-pane settle beside `Q2n`'s one-pane settle, and `X3`'s `m1`..`m5` beside its
// per-pane `m6`s.
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`, no `vi.mock`, no `console.log` (a reading that
// must be printed is folded into the aggregate failure message — `B5-DOC-PRINT`); it writes nothing; every path derives from THIS
// FILE's own location, so a missing substrate FAILS instead of skipping. It never demands a paint from a bare fire over
// already-painted state (`D-43`): each paint arm MOVES ITS SOURCE FIRST (and the shared-field seed is driven through the producer),
// and the idempotence readings are explicit CONTROLS.
import { describe, it, expect, beforeAll } from 'vitest'
import { fileURLToPath } from 'node:url'

import { installShim, ShimElement } from '../../../src/shared/dom-shim.js'
import { createPaneRegistry } from '../../../src/renderer/pane-registry.js'
import { createPaneEvents } from '../../../src/renderer/pane-events.js'
import { SidebarPanes } from '../../../src/renderer/sidebar-panes.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../../../src/main/template-shape.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))

const DOCUMENTS_PANE = 'gnosis-documents'
const WIKIS_PANE = 'gnosis-wikis'
const DOC_NAV = 'doc-nav'
const CROSSLINKS = 'crosslinks'
const SEARCH = 'search'
const TEMPLATE_EDITOR = 'template-editor'
const SETTINGS = 'settings'
/** The two CRUD panes this unit moves onto the channel (§12a). */
const CRUD_PANES: readonly string[] = [DOCUMENTS_PANE, WIKIS_PANE]

/** The boot snapshot's document (so `doc-nav` has a subject and a `rag-` root exists beside the pane frames). */
const DOC_A = 'doc-a'
const HEAD_A = 'head-a'

/** THE MARKERS: every "the pane's answer moved" arm is a comparison of two AUTHORED values, never a claim about an authored sentence. */
const WIKI_ONE = 'B8WIKI-ONE'
const WIKI_TWO = 'B8WIKI-TWO'
const WIKI_DETAIL = 'B8WIKIDETAIL-ONE'
const DOC_ONE = 'B8DOC-ONE'

const fingerprint = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

/** A value as a failure message prints it. */
const shown = (value: unknown): string => (value === undefined ? '(absent)' : fingerprint(value))

// ---------------------------------------------------------------------------
// THE AUTHORED-CONTENT READING — every row reads the ENVELOPE the host authored (never the DOM).
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

/** Every node of an authored subtree for which `predicate` holds (author order). */
function nodesWhere(
  node: unknown,
  predicate: (record: Record<string, unknown>) => boolean,
  out: Array<Record<string, unknown>> = [],
): Array<Record<string, unknown>> {
  if (node == null) return out
  if (Array.isArray(node)) {
    for (const child of node) nodesWhere(child, predicate, out)
    return out
  }
  if (typeof node !== 'object') return out
  const record = node as Record<string, unknown>
  if (predicate(record)) out.push(record)
  nodesWhere(record['children'], predicate, out)
  return out
}

const propsOf = (node: Record<string, unknown> | undefined): Record<string, unknown> =>
  node !== undefined && typeof node['props'] === 'object' && node['props'] !== null ? (node['props'] as Record<string, unknown>) : {}

// ---------------------------------------------------------------------------
// THE CONTENT-ROOT READING — the Runtime's OWN closed class, re-spelled here because the double IS the root-set owner
// (`src/renderer/runtime.ts`): a node is a content root iff its authored `props.id` is `rag-<id>`, `pane-<id>`, or one of the four
// pinned pane-like ids.
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
// THE CARRIER READING — the paint REPLACES the pane's frame root WHOLE, so "the frame's carriers are held" is the CARRIERS, never the
// element instance (`B-5`/`B-6`/`B-7`'s reading, unchanged).
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
// THE SEED FIXTURES — a ONE-document snapshot, and the ANSWERS the CRUD bridge gives per tool. The markers are distinct per answer so
// "the pane's authored answer moved" is always a comparison of two values.
// ---------------------------------------------------------------------------
const NOW = new Date().toISOString()

function documentSnapshot(body = 'Doc A'): Record<string, unknown> {
  return {
    store: 'main',
    nodes: [{ id: HEAD_A, type: 'h1', content: body, ownedNodeIds: [], createdAt: NOW, updatedAt: NOW }],
    edges: [
      { id: 'dh1', kind: 'doc-head', source: HEAD_A, target: DOC_A, createdAt: NOW, updatedAt: NOW, documentIds: [DOC_A] },
    ],
  }
}

/** `gnosis.wiki.list`'s answer shape (`Wiki[]` — `gnosisWikisContent` maps `wikiId`/`name`). */
const wikiListAnswer = (name: string): unknown[] => [{ wikiId: 'wiki-a', name }]
/** `gnosis.wiki.get`'s answer shape (`Wiki`). */
const wikiAnswer = (name: string): Record<string, unknown> => ({ wikiId: 'wiki-a', name })
/** `gnosis.document.list`'s answer shape (`DocumentList`). */
const documentListAnswer = (title: string): Record<string, unknown> => ({
  items: [{ documentId: 'doc-a1', title, revision: 1, state: 'draft' }],
})

// ---------------------------------------------------------------------------
// THE RECORDING RUNTIME DOUBLE — `loadEnvelope` seeds the materialized root set (exactly the Runtime's own closed class),
// `materializedContentRoots()` answers it (the paint's step 2), `materializedDocumentRoots()` answers the per-document census the
// paint CARRIES, `applyContentReconcile` records the call AND performs the channel's whole-root replace and answers the applied list,
// and `codeGet('')` answers `null` (the documented ABSENT live-envelope route, on which the paint falls back to the materialized-root
// census). This is the `B-5`/`B-6`/`B-7` double unchanged.
// ---------------------------------------------------------------------------
interface RuntimeDouble {
  double: Record<string, unknown>
  readonly envelopes: unknown[]
  readonly applies: Array<Record<string, unknown>>
  readonly applyAnswers: string[][]
  roots: () => unknown[]
}

function recordingRuntime(): RuntimeDouble {
  const envelopes: unknown[] = []
  const applies: Array<Record<string, unknown>> = []
  const applyAnswers: string[][] = []
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
  return { double, envelopes, applies, applyAnswers, roots: () => [...roots] }
}

// ---------------------------------------------------------------------------
// THE HOST DRIVE.
// ---------------------------------------------------------------------------
interface SeedOptions {
  /** `true` (default) → a REAL `createPaneEvents()` (behind the counting façade) is handed to the host as its `events` option, so
   *  the boot-time subscriptions exist and the granted wiring's `fire` is the dispatch under measurement. `false` → the host holds
   *  NO channel (`m1`..`m5` need a host whose own registration is absent, so the mutant is the ONLY handler). */
  events?: boolean
  /** THE `m6` INSTRUMENT, PER PANE: the granted wiring still records the `onChanged` id but DROPS the fire for these panes — exactly
   *  "the settle's fire removed for `<pane>`", which is the state in which the counters read `0/0/0` perfectly and the pane stays
   *  stale. */
  dropFiresFor?: readonly string[]
  /** THE `m4` INSTRUMENT: the granted wiring replaced by a NO-OP (`onChanged: () => {}`) — the settle commits its field and paints
   *  nothing. */
  onChangedNoop?: boolean
}

interface Counters {
  refresh: number
  loadAppGraph: number
  mountOperator: number
  updatePanes: number
  loadEnvelopes: number
  applies: number
  /** §3's re-read census, member by member. */
  snapshot: number
  docHeads: number
  backlinks: number
  security: number
  templateGet: number
  ragStores: number
  ragQuery: number
  /** THE PRODUCER'S OWN CALLS — the positive that makes the paint-window zeros readable (§3). */
  gnosisDocuments: number
  gnosisWikis: number
  operatorSettingsGet: number
  operatorSettingsSet: number
  templateChangedSubs: number
  editStoreChangedSubs: number
  operatorSettingsChangedSubs: number
  paneVisibilitySubs: number
  paneCatalogPushes: number
}

interface FireWindow {
  paneId: unknown
  report: unknown
  delta: Record<string, number>
}

interface HostDrive {
  host: SidebarPanes | null
  crud: Record<string, unknown> | null
  registry: ReturnType<typeof createPaneRegistry> | null
  channel: ReturnType<typeof createPaneEvents>
  hostSubscribed: boolean
  /** The harness's OWN failures (module load, boot) — every row reports them first. */
  seedProblems: string[]
  counters: () => Counters
  resetCounters: () => void
  roots: () => unknown[]
  applies: () => Array<Record<string, unknown>>
  applyAnswers: () => string[][]
  verdicts: () => Array<Record<string, unknown>>
  fires: () => unknown[]
  fireWindows: () => FireWindow[]
  /** THE GRANTED WIRING'S OWN LOG: every pane id the CRUD host's `onChanged` handed it, in order (the field census, as recorded). */
  onChangedCalls: () => unknown[]
  publishChanges: () => number
  rebuildRequests: () => string[]
  engineRefreshes: () => string[]
  /** Every CRUD tool the delegate forwarded (the POSITIVE half of `Q3`). */
  forwarded: () => string[]
  setSnapshot: (snapshot: Record<string, unknown>) => void
  setWikiList: (answer: unknown) => void
  setWikiGet: (answer: unknown) => void
  setDocumentList: (answer: unknown) => void
  /** Drive ONE CRUD producer method (`gnosisDocuments`/`gnosisWikis`) with a tool + args, answering NAMED problems only. */
  produce: (method: 'gnosisDocuments' | 'gnosisWikis', tool: string, args: Record<string, unknown>, limb: string) => string[]
  /** The CRUD host's own state (the field a settle wrote) — the "the HOST'S FIELD MOVED" reading. */
  crudState: () => Record<string, unknown> | null
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
    applies: 0,
    snapshot: 0,
    docHeads: 0,
    backlinks: 0,
    security: 0,
    templateGet: 0,
    ragStores: 0,
    ragQuery: 0,
    gnosisDocuments: 0,
    gnosisWikis: 0,
    operatorSettingsGet: 0,
    operatorSettingsSet: 0,
    templateChangedSubs: 0,
    editStoreChangedSubs: 0,
    operatorSettingsChangedSubs: 0,
    paneVisibilitySubs: 0,
    paneCatalogPushes: 0,
  }
  const verdicts: Array<Record<string, unknown>> = []
  const firesLog: unknown[] = []
  const fireWindows: FireWindow[] = []
  const onChangedCalls: unknown[] = []
  const rebuilds: string[] = []
  const engineRefreshes: string[] = []
  const forwarded: string[] = []
  let publishChangeCalls = 0
  const dirty = new Set<string>()

  /** The mutable answers the rows drive. */
  let snapshot: Record<string, unknown> = documentSnapshot()
  let wikiList: unknown = wikiListAnswer(WIKI_ONE)
  let wikiGet: unknown = wikiAnswer(WIKI_DETAIL)
  let documentList: unknown = documentListAnswer(DOC_ONE)

  const registry = createPaneRegistry()

  const securityAnswer = async (): Promise<Record<string, unknown>> => {
    counters.security += 1
    // The `gnosis`/`gnosis-edit` groups are the CRUD host's fail-closed gates; without them every mutating tool answers the
    // no-edit-access state and no read ever reaches the bridge, so the settle would have no subject.
    return { token: null, enabled: ['read', 'dispatch', 'gnosis', 'gnosis-edit'] }
  }

  const sidebarBridge = {
    security: { get: securityAnswer },
    // The gnosis delegate's own surface — `GnosisPanes`'s two members are not driven by these rows, but the delegate object is built
    // as `renderer.ts` builds it (see the harness header).
    gnosis: {
      status: async (): Promise<Record<string, unknown>> => ({ ok: true }),
      query: async (value: string): Promise<Record<string, unknown>> => ({ query: value, results: [] }),
    },
    edit: {
      onRagStoreChanged: (_handler: (payload: unknown) => void): (() => void) => {
        counters.editStoreChangedSubs += 1
        return () => undefined
      },
      commit: async (): Promise<Record<string, unknown>> => ({ ok: true }),
      commitRich: async (): Promise<Record<string, unknown>> => ({ ok: true }),
      batch: async (): Promise<Record<string, unknown>> => ({ ok: true, applied: [] }),
    },
    rag: {
      snapshot: async (): Promise<Record<string, unknown>> => {
        counters.snapshot += 1
        return snapshot
      },
      docHeads: async (): Promise<Record<string, unknown>> => {
        counters.docHeads += 1
        return { documents: [{ documentId: DOC_A, title: 'Doc A', path: [], tags: [] }] }
      },
      backlinks: async (nodeId: string): Promise<Record<string, unknown>> => {
        counters.backlinks += 1
        return { nodeId, backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }
      },
      stores: async (): Promise<Record<string, unknown>> => {
        counters.ragStores += 1
        return { stores: [] }
      },
      query: async (): Promise<Record<string, unknown>> => {
        counters.ragQuery += 1
        return { query: '', ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }
      },
      journal: async (): Promise<Record<string, unknown>> => ({ entries: [] }),
    },
    template: {
      get: async (): Promise<Record<string, unknown>> => {
        counters.templateGet += 1
        return { source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }
      },
      onTemplateChanged: (_handler: (payload: unknown) => void): (() => void) => {
        counters.templateChangedSubs += 1
        return () => undefined
      },
      create: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      delete: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      reset: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
    },
    operatorSettings: {
      // `panesInitialized: true` + an explicit ENABLED set is what MOUNTS the two CRUD panes: the host authors a `pane-<id>` frame for
      // every enabled app-graph pane, and a frame that is missing makes `paintPane` answer `not-mounted` (a vacuous paint row).
      get: async (): Promise<Record<string, unknown>> => {
        counters.operatorSettingsGet += 1
        return {
          enabledPanes: [DOC_NAV, SEARCH, CROSSLINKS, TEMPLATE_EDITOR, DOCUMENTS_PANE, WIKIS_PANE],
          enabledOperatorPanes: [SETTINGS],
          panesInitialized: true,
          defaultDocumentId: null,
          topK: 5,
        }
      },
      set: async (patch: unknown): Promise<unknown> => {
        counters.operatorSettingsSet += 1
        return patch
      },
      onChanged: (_handler: (settings: unknown) => void): (() => void) => {
        counters.operatorSettingsChangedSubs += 1
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

  const crudBridge = {
    gnosis: {
      documents: async (tool: string, args: Record<string, unknown>): Promise<unknown> => {
        counters.gnosisDocuments += 1
        void args
        if (tool === 'gnosis.wiki.list') return wikiList
        if (tool === 'gnosis.document.list') return documentList
        if (tool === 'gnosis.document.get') return { documentId: 'doc-a1', title: DOC_ONE, revision: 1, state: 'draft' }
        return null
      },
      wikis: async (tool: string, args: Record<string, unknown>): Promise<unknown> => {
        counters.gnosisWikis += 1
        void args
        if (tool === 'gnosis.wiki.list') return wikiList
        if (tool === 'gnosis.wiki.get') return wikiGet
        return null
      },
    },
    security: { get: securityAnswer },
  }

  const channel = createPaneEvents()
  const hostSubscribed = options.events !== false
  // THE COUNTING FAÇADE (see the header): every member forwards to the REAL channel; `fire` and `publishChange` count what the HOST
  // does, and `fire` additionally records the DELTA of the whole bridge census across its own body — the fire→paint window.
  const hostedEvents = {
    subscribe: (paneId: string, handler: (report: never) => void): (() => void) => channel.subscribe(paneId, handler),
    subscribeRecord: (paneId: string, handler: (report: never) => void): (() => void) => channel.subscribeRecord(paneId, handler),
    subscribeChange: (paneId: string, handler: (report: never) => void): (() => void) => channel.subscribeChange(paneId, handler),
    fire: (paneId: string): unknown => {
      firesLog.push(typeof paneId === 'string' ? paneId : `(non-string: ${shown(paneId)})`)
      const before = { ...counters }
      const report = channel.fire(paneId)
      const delta: Record<string, number> = {}
      for (const key of Object.keys(counters) as Array<keyof Counters>) delta[key] = counters[key] - before[key]
      fireWindows.push({ paneId, report, delta })
      return report
    },
    publishChange: (): unknown => {
      publishChangeCalls += 1
      return channel.publishChange()
    },
    deliver: (): unknown => channel.deliver(),
    panes: (): string[] => channel.panes(),
    recordPanes: (): string[] => channel.recordPanes(),
    changePanes: (): string[] => channel.changePanes(),
  } as unknown as ReturnType<typeof createPaneEvents>

  const editController = {
    markDirty: (controlId: string): void => {
      dirty.add(String(controlId))
    },
    clearDirty: (controlId: string): void => {
      dirty.delete(String(controlId))
    },
    isDirty: (controlId: string): boolean => dirty.has(String(controlId)),
    anyDirty: (): boolean => dirty.size > 0,
    hasQueuedRebuild: (): boolean => false,
    requestRebuild: (kind?: string): void => {
      rebuilds.push(kind === undefined ? '(none)' : String(kind))
    },
    restoreCaret: (): undefined => undefined,
    isEditable: (): boolean => true,
    saveCaret: (): undefined => undefined,
    clearCaret: (): undefined => undefined,
    commit: async (): Promise<Record<string, unknown>> => ({ ok: true }),
  }

  // ---- THE GRANTED WIRING (`renderer.ts` grant line 1, verbatim shape) ---------------------------------
  // ⟨`B-8` §12a⟩ `onChanged: (paneId) => { paneEvents.fire(paneId) }` — the ONE-PARAMETER form. At THIS head the CRUD host's
  // `onChanged` is `() => void`, so a settle calls this with `undefined`: the id the settle is about is LOST before it reaches the
  // channel, which is exactly why the census move alone would buy a DEAD REGISTRATION (`F-1`). The log below records what the wiring
  // was HANDED, so that loss is a reading rather than an inference.
  const dropFiresFor = options.dropFiresFor ?? []
  const onChanged = options.onChangedNoop === true
    ? (): void => undefined
    : (paneId: unknown): void => {
        onChangedCalls.push(paneId)
        if (typeof paneId === 'string' && dropFiresFor.includes(paneId)) return
        void hostedEvents.fire(paneId as string)
      }

  let crud: Record<string, unknown> | null = null
  try {
    const GnosisCrudPanesCtor = (await import('../../../src/renderer/gnosis-crud-panes.js')).GnosisCrudPanes as new (
      opts: unknown,
    ) => Record<string, unknown>
    crud = new GnosisCrudPanesCtor({ registry, bridge: crudBridge, onChanged })
    ;(crud['registerPanes'] as () => void).call(crud)
  } catch (error) {
    seedProblems.push(
      `the harness could not construct + register the SHIPPED \`GnosisCrudPanes\` (${String(error)}) — the CRUD panes' frames and ` +
        `their producer have no subject, so no paint reading below is available`,
    )
  }

  // ---- THE GNOSIS DELEGATE (`renderer.ts` grant line 2, verbatim shape) ---------------------------------
  // `status`/`query` are the pre-grant members; `documents`/`wikis` serve the panes' own handler bodies (`F-7`) and `refreshFromEngine`
  // is the engine arm's ONLY route into the producer (§2). It RECORDS the call (that is `Q3`'s reading) and FORWARDS to the shipped
  // implementation so the producer's own re-read is a bridge call this harness counts.
  const gnosisDelegate = {
    status: (): void => undefined,
    query: (_value: string): void => undefined,
    documents: (tool: string, args: Record<string, unknown>): void => {
      forwarded.push(`documents:${tool}`)
      const method = crud === null ? undefined : crud['gnosisDocuments']
      if (typeof method === 'function') (method as (t: string, a: Record<string, unknown>) => void).call(crud, tool, args)
      else if (crud === null) seedProblems.push('the gnosis delegate has no CRUD host to forward `documents` to')
    },
    wikis: (tool: string, args: Record<string, unknown>): void => {
      forwarded.push(`wikis:${tool}`)
      const method = crud === null ? undefined : crud['gnosisWikis']
      if (typeof method === 'function') (method as (t: string, a: Record<string, unknown>) => void).call(crud, tool, args)
      else if (crud === null) seedProblems.push('the gnosis delegate has no CRUD host to forward `wikis` to')
    },
    refreshFromEngine: (): void => {
      engineRefreshes.push('refreshFromEngine')
      const method = crud === null ? undefined : crud['refreshFromEngine']
      if (typeof method === 'function') (method as () => void).call(crud)
    },
  }

  let host: SidebarPanes | null = null
  if (seedProblems.length === 0) {
    host = new SidebarPanes({
      mount: new ShimElement('div') as never,
      operatorMount: new ShimElement('div') as never,
      registry,
      bridge: sidebarBridge as never,
      backRefs: new Map<string, string[]>(),
      editController,
      // The widened delegate — at THIS head the host's option type does not carry `documents`/`wikis`/`refreshFromEngine`, so the
      // engine branch reaches no producer; the row that reads it is `Q3`, and its red message says exactly that.
      gnosis: gnosisDelegate,
      ...(hostSubscribed ? { events: hostedEvents } : {}),
    } as never)

    // THE COUNTERS AND THE PAINT'S VERDICT, wrapped on the INSTANCE before boot (an instance own-property SHADOWS the prototype
    // method, so the class's OWN `this.refresh()`/`this.loadAppGraph(...)`/`this.updatePane(...)` calls are counted too).
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
    const realUpdatePane = host.updatePane.bind(host)
    ;(host as unknown as Record<string, unknown>)['updatePane'] = (paneId: string): unknown => {
      counters.updatePanes += 1
      const verdict = realUpdatePane(paneId)
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
  const realApply = runtime.double['applyContentReconcile'] as (input: unknown) => unknown
  runtime.double['applyContentReconcile'] = (input: unknown): unknown => {
    counters.applies += 1
    return realApply(input)
  }

  if (host !== null) {
    try {
      await host.boot(runtime.double as never)
    } catch (error) {
      seedProblems.push(
        `the harness's \`host.boot(runtime)\` THREW (${String(error)}) — the seed is the {snapshot, doc-heads, template, security, ` +
          `operator settings, pane frames, channel subscriptions} carrier every arm below reads, so no zero in this file is a reading ` +
          `without it`,
      )
    }
  }

  return {
    host,
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
      onChangedCalls.length = 0
      rebuilds.length = 0
      engineRefreshes.length = 0
      forwarded.length = 0
      publishChangeCalls = 0
      // ⟨the `B7-F3` lesson, one unit over⟩ the recording double's OWN apply log is part of the counter scope: a paint always appends
      // one entry, so a reset that cleared the counter and not the log would leave every later arm re-reading an EARLIER arm's
      // applies. NOT reset: `runtime.roots` — the live root census is the SUBJECT of "every other root the SAME OBJECT".
      runtime.applies.length = 0
      runtime.applyAnswers.length = 0
    },
    roots: () => runtime.roots(),
    applies: () => runtime.applies,
    applyAnswers: () => runtime.applyAnswers.map((ids) => [...ids]),
    verdicts: () => verdicts.map((verdict) => ({ ...verdict })),
    fires: () => [...firesLog],
    fireWindows: () => fireWindows.map((window) => ({ ...window, delta: { ...window.delta } })),
    onChangedCalls: () => [...onChangedCalls],
    publishChanges: () => publishChangeCalls,
    rebuildRequests: () => [...rebuilds],
    engineRefreshes: () => [...engineRefreshes],
    forwarded: () => [...forwarded],
    setSnapshot: (next: Record<string, unknown>) => {
      snapshot = next
    },
    setWikiList: (answer: unknown) => {
      wikiList = answer
    },
    setWikiGet: (answer: unknown) => {
      wikiGet = answer
    },
    setDocumentList: (answer: unknown) => {
      documentList = answer
    },
    produce: (method, tool, args, limb) => {
      if (crud === null) {
        return [`${limb}: the SHIPPED \`GnosisCrudPanes\` host is ABSENT — \`${method}('${tool}')\` has no subject`]
      }
      const fn = crud[method]
      if (typeof fn !== 'function') {
        return [`${limb}: \`${method}\` is NOT a function on the CRUD host (read ${typeof fn}) — the producer has no entry`]
      }
      try {
        ;(fn as (t: string, a: Record<string, unknown>) => void).call(crud, tool, args)
      } catch (error) {
        return [`${limb}: \`${method}('${tool}')\` THREW (${String(error)}) — the producer's entry never throws at its caller`]
      }
      return []
    },
    crudState: () => {
      if (crud === null) return null
      const state = crud['state']
      if (typeof state !== 'function') return null
      try {
        return (state as () => Record<string, unknown>).call(crud)
      } catch {
        return null
      }
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

/** Await macrotasks a few times: a producer's answer is a bridge PROMISE, and the fire + paint it settles into are HANDED OFF, not
 *  awaited by the host. */
const settle = async (rounds = 8): Promise<void> => {
  for (let i = 0; i < rounds; i += 1) await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

/** The root whose authored id is `cssId`, as the double currently holds it. */
const rootById = (roots: readonly unknown[], cssId: string): unknown => roots.find((root) => cssIdOf(root) === cssId)

/** The ids of every materialized root, in the double's own order — the "every OTHER root" census. */
const rootIds = (roots: readonly unknown[]): string[] => roots.map((root) => cssIdOf(root) ?? '(nonesuch)')

/** Assert every root whose id is not `excepted` is the SAME OBJECT it was in `before`. */
function otherRootsProblems(
  before: readonly unknown[],
  after: readonly unknown[],
  excepted: readonly string[],
  limb: string,
): string[] {
  const problems: string[] = []
  for (const root of before) {
    const id = cssIdOf(root)
    if (id === null || excepted.includes(id)) continue
    const now = rootById(after, id)
    if (now === undefined) {
      problems.push(
        `limb ${limb}: the root \`${id}\` VANISHED from the materialized set across the update (before ` +
          `${rootIds(before).join(', ')}, after ${rootIds(after).join(', ')}) — a pane update touches ONE pane's root and no other`,
      )
      continue
    }
    if (now !== root) {
      problems.push(
        `limb ${limb}: the root \`${id}\` was RE-MINTED across the update (identity, not equality: the object changed) — the paint ` +
          `reconciles THAT pane's root ONLY, so every other materialized root must be the SAME OBJECT. Before: ` +
          `[${rootIds(before).join(', ')}], after: [${rootIds(after).join(', ')}]`,
      )
    }
  }
  return problems
}

/** The fresh frame the paint handed the runtime, off the recorded `applyContentReconcile` call (never off a private field). */
function appliedFrameOf(applies: ReadonlyArray<Record<string, unknown>>, cssId: string): unknown {
  for (let index = applies.length - 1; index >= 0; index -= 1) {
    const fresh = contentRootsOf(applies[index]['next'])
    const found = rootById(fresh, cssId)
    if (found !== undefined) return found
  }
  return undefined
}

/** The pane's LIVE frame, or `undefined`. */
const liveFrame = (drive: HostDrive, paneId: string): unknown => rootById(drive.roots(), `pane-${paneId}`)

/** ONE readable string for the three `INV-E` counters + the whole re-read census — every failure message uses it. */
const countersReading = (counters: Counters): string =>
  `refresh=${counters.refresh} loadAppGraph=${counters.loadAppGraph} mountOperator=${counters.mountOperator}` +
  ` updatePane=${counters.updatePanes} (producer's own calls: gnosis.documents=${counters.gnosisDocuments}` +
  ` gnosis.wikis=${counters.gnosisWikis} security.get=${counters.security})` +
  ` (re-read census: snapshot=${counters.snapshot} docHeads=${counters.docHeads} backlinks=${counters.backlinks}` +
  ` security=${counters.security} template.get=${counters.templateGet} rag.stores=${counters.ragStores}` +
  ` rag.query=${counters.ragQuery})` +
  ` (secondary: loadEnvelope=${counters.loadEnvelopes} applyContentReconcile=${counters.applies}` +
  ` template.onTemplateChanged=${counters.templateChangedSubs} edit.onRagStoreChanged=${counters.editStoreChangedSubs}` +
  ` operatorSettings.get=${counters.operatorSettingsGet} operatorSettings.set=${counters.operatorSettingsSet}` +
  ` operatorSettings.onChanged=${counters.operatorSettingsChangedSubs} onPaneVisibility=${counters.paneVisibilitySubs}` +
  ` pushPaneCatalog=${counters.paneCatalogPushes})`

/** **§3's CENSUS, READ WHERE THE CONTRACT PUTS IT: INSIDE THE FIRE→PAINT WINDOW.** For every `fire` the granted wiring made, the delta
 *  of each bridge call across that call's own body must be ZERO — the paint re-reads NOTHING (`ASM-B8-1`), and the producer's own
 *  calls (the CRUD tool and its M13 `security.get`) happen BEFORE the fire, so they are not in the window. A window count of zero is
 *  itself a problem: with no fire the zeros would be vacuous. */
const PAINT_WINDOW_MEMBERS: ReadonlyArray<[string, keyof Counters]> = [
  ['rag.snapshot', 'snapshot'],
  ['rag.docHeads', 'docHeads'],
  ['rag.backlinks', 'backlinks'],
  ['security.get', 'security'],
  ['template.get', 'templateGet'],
  ['rag.stores', 'ragStores'],
  ['rag.query', 'ragQuery'],
  ['bridge.gnosis.documents', 'gnosisDocuments'],
  ['bridge.gnosis.wikis', 'gnosisWikis'],
]

function paintWindowProblems(windows: ReadonlyArray<FireWindow>, limb: string): string[] {
  const problems: string[] = []
  if (windows.length === 0) {
    problems.push(
      `limb ${limb}: NO fire reached the channel inside the window — the paint-window zeros below would be vacuous (there is nothing ` +
        `to read). The settle must FIRE its own pane; a settle that fires nothing is the ` + '`{fired:false}` state this unit removes',
    )
  }
  const nonzero: string[] = []
  for (const window of windows) {
    for (const [name, key] of PAINT_WINDOW_MEMBERS) {
      const value = window.delta[key] ?? 0
      if (value !== 0) nonzero.push(`${name}=${value} in fire(${shown(window.paneId)})`)
    }
  }
  if (nonzero.length > 0) {
    problems.push(
      `limb ${limb}: the PAINT reached the re-read census — ${nonzero.join(', ')} — §3/` +
        '`ASM-B8-1`: the paint re-reads NOTHING for either CRUD pane (no arm in `paintReplumbedPane`), because a paint that re-issued ' +
        `its own producer is the unbounded settle→fire→settle loop \`F-4\` names. Windows read: ${shown(windows.map((w) => w.paneId))}`,
    )
  }
  return problems
}

/** §6's paint verdict arms: exactly ONE verdict, `painted:true`, `applied === ['pane-<id>']`. */
function onePaintProblems(
  verdicts: ReadonlyArray<Record<string, unknown>>,
  paneId: string,
  limb: string,
  expectedVerdicts = 1,
): string[] {
  const problems: string[] = []
  if (verdicts.length !== expectedVerdicts) {
    problems.push(
      `limb ${limb}: the update produced ${verdicts.length} pane verdict(s) ${shown(verdicts)}, not EXACTLY ${expectedVerdicts} — §6: ` +
        `a producer's settlement is ONE paint (the fire is uncoalesced, \`O-2\`, so N settled reads are N paints and never a ` +
        `different count)`,
    )
    return problems
  }
  const verdict = verdicts[verdicts.length - 1]
  if (verdict['painted'] !== true || verdict['reason'] !== 'painted') {
    problems.push(
      `limb ${limb}: the verdict reads ${shown(verdict)}, not \`painted:true\`/\`'painted'\` — the enabled+mounted pane whose data ` +
        `moved IS the arm that paints, and the fire is the only thing that may have to run`,
    )
  }
  if (fingerprint(verdict['applied']) !== fingerprint([`pane-${paneId}`])) {
    problems.push(
      `limb ${limb}: the verdict's \`applied\` reads ${shown(verdict['applied'])}, not exactly \`['pane-${paneId}']\` — §3: the ` +
        `reconcile is over THAT PANE'S ROOT ONLY`,
    )
  }
  return problems
}

/** THE ROW'S PRECONDITION, REPORTED AS PART OF EVERY PAINT ROW: each graded pane must be REGISTERED, ENABLED and MATERIALIZED — a
 *  pane with no frame answers `not-mounted` and a disabled one `not-enabled`, and in both cases "it did not paint" would be a fact of
 *  the seed rather than of the wiring. `updatePane(<pane>)` over the booted state must therefore answer `'unchanged'` (the fresh
 *  render is shape-equal to the frame the assemble just authored). The precondition's own verdict is RESET out of the counters. */
function paintPrecondition(drive: HostDrive, paneId: string, limb: string): string[] {
  const problems: string[] = []
  if (drive.host === null || drive.registry === null) {
    return [`limb ${limb}: the booted host is ABSENT — the paint's precondition has no subject`]
  }
  const def = drive.registry.get(paneId)
  if (def == null) {
    problems.push(`limb ${limb}: no pane is REGISTERED as \`${paneId}\` — the paint would answer \`not-a-pane\``)
  } else if (def.scope === 'operator') {
    problems.push(`limb ${limb}: \`${paneId}\` is registered \`operator\`-scope — the paint answers \`operator-scope\`, not a paint`)
  }
  if (drive.registry.isEnabled(paneId) !== true) {
    problems.push(
      `limb ${limb}: \`${paneId}\` is NOT ENABLED in the registry — \`paintPane\` answers \`not-enabled\`, so "it did not paint" ` +
        `would be a fact of the seed and not of the wiring`,
    )
  }
  if (rootById(drive.roots(), `pane-${paneId}`) === undefined) {
    problems.push(
      `limb ${limb}: the seed carries NO materialized frame \`pane-${paneId}\` (roots read: [${rootIds(drive.roots()).join(', ')}]) — ` +
        `the paint would answer \`not-mounted\`, and a paint row over an unmounted frame is VACUOUS`,
    )
  }
  const verdict = (drive.host.updatePane as (id: string) => Record<string, unknown>).call(drive.host, paneId)
  const reason = verdict['reason']
  if (reason !== 'unchanged' && reason !== 'painted') {
    problems.push(
      `limb ${limb}: the PRECONDITION reading \`updatePane('${paneId}')\` answered \`reason: ${shown(reason)}\`, not ` +
        `\`'unchanged'\`/\`'painted'\` — the pane is not paintable on this seed, so nothing below is a reading of a paint`,
    )
  }
  drive.resetCounters()
  return problems
}

// ===========================================================================
// ROWS
// ===========================================================================
beforeAll(() => {
  installShim()
})

describe('pane-gnosis — the two CRUD panes answer their OWN producer: one paint each, no re-read, no re-assembly, the engine arm one step removed, and INV-E with a mutant per moved pane', () => {
  it('Q2d — a `gnosis.document.list` settle on the SHIPPED `GnosisCrudPanes` paints `pane-gnosis-documents` ALONE: exactly ONE apply answering `applied === [pane-gnosis-documents]`, every other materialized root the SAME OBJECT, the frame’s carriers held, `INV-E` 0/0/0, §3’s census all-zero FROM THE PAINT (the producer’s own `bridge.gnosis.documents` call is the positive), and the identical settle again is `unchanged` with `applied: []`', async () => {
    // §6 `Q2` (§12a: "`Q2d`/`Q2w` (each CRUD pane paints ALONE from its own settle — `applied === ['pane-gnosis-<x>']`, every other
    // materialized root the SAME object, carriers held, `INV-E` 0/0/0, §3's census all-zero with the producer's own call as the
    // positive)"); §1 `F-8`'s field census (`lastDocuments` is rendered by `gnosis-documents` ONLY); §3/`ASM-B8-1`.
    // LAYER: envelope-class — the paint's verdict, the AUTHORED tree, root IDENTITY and the bridge census across the fire window.
    // NON-VACUITY: the seed's own `gnosis.wiki.list` settle commits the SHARED field `lastWikis` first (a `null` `lastWikis` renders
    // the whole-pane `unavailable` state, in which a `document.list` settle could not move a single authored node), the row asserts the
    // marker is ABSENT from the live frame BEFORE the settle, and the zeros are read BESIDE `bridge.gnosis.documents === 1` on the
    // SAME event. THE CONTROL re-drives the IDENTICAL settle over already-painted state and must answer `unchanged`/`applied: []`
    // (`D-43`: a bare fire over painted state may never be demanded as a paint — it is demanded as the CONTROL it is).
    // RED AT THIS HEAD, and the reason this row exists: the CRUD host's `onChanged` is a ZERO-ARG callback, so the settle hands the
    // granted wiring `undefined`, `paneEvents.fire(undefined)` answers `{fired:false, handlers:0}`, and NO PANE PAINTS — while the
    // census does not carry `gnosis-documents` at all, so even a correct id would reach no listener.
    const problems: string[] = []
    const drive = await seedHost()
    try {
      problems.push(...drive.seedProblems)
      problems.push(...paintPrecondition(drive, DOCUMENTS_PANE, 'Q2d'))

      // ---- (0) THE SEED: the SHARED field `lastWikis`, through the producer ------------------------------------------------
      problems.push(...drive.produce('gnosisDocuments', 'gnosis.wiki.list', {}, 'Q2d·seed'))
      await settle()
      if (drive.crudState() === null) {
        problems.push('limb Q2d: the CRUD host exposes no `state()` — the "the host\'s field moved" reading has no subject')
      }

      const before = drive.roots()
      const liveDocuments = rootById(before, `pane-${DOCUMENTS_PANE}`)
      if (liveDocuments === undefined) {
        problems.push(
          `limb Q2d: after the seed there is no live \`pane-${DOCUMENTS_PANE}\` frame (roots: [${rootIds(before).join(', ')}]) — the ` +
            `paint's subject has no frame`,
        )
      } else if (authoredText(liveDocuments).includes(DOC_ONE)) {
        problems.push(`limb Q2d: the live frame ALREADY authors \`${DOC_ONE}\` — "the pane's answer moved" would be vacuous`)
      }
      if (!rootIds(before).some((id) => id.startsWith('rag-'))) {
        problems.push('limb Q2d: the seed carries NO `rag-` document root — "every other materialized root the SAME OBJECT" needs a non-pane subject too')
      }

      // ---- (a)/(b) THE SETTLE, AND EVERY READING OF IT --------------------------------------------------------------------
      drive.resetCounters()
      drive.setDocumentList(documentListAnswer(DOC_ONE))
      problems.push(...drive.produce('gnosisDocuments', 'gnosis.document.list', { wikiId: 'wiki-a' }, 'Q2d'))
      await settle()

      const counters = drive.counters()
      const windows = drive.fireWindows()
      // (a) THE WIRING WAS HANDED A PANE ID (grant line 1). This arm is the one that reds at this head FIRST.
      const handed = drive.onChangedCalls()
      if (handed.length === 0) {
        problems.push(
          'limb Q2d: the CRUD host called `onChanged` with NO pane id at all (the log is empty) — the settle never reached the granted ' +
            'wiring, so no fire and no paint could follow',
        )
      }
      const offCensus = handed.filter((paneId) => typeof paneId !== 'string')
      if (offCensus.length > 0) {
        problems.push(
          `limb Q2d: \`onChanged\` was handed ${shown(handed)}, which includes NON-STRING entr(ies) ${shown(offCensus)} — the CRUD ` +
            "host's `onChanged` must be the ONE-PARAMETER `(paneId: string) => void` (`D-44`, grant line 1): a zero-argument call " +
            'loses the id the settle is about before it reaches the channel (`F-1`)',
        )
      }
      const foreignFires = handed.filter((paneId) => typeof paneId === 'string' && paneId !== DOCUMENTS_PANE)
      if (foreignFires.length > 0) {
        problems.push(
          `limb Q2d: a \`gnosis.document.list\` settle (field census: \`['documents']\`) fired ${shown(foreignFires)} as well as ` +
            `\`${DOCUMENTS_PANE}\` — \`F-8\`/\`X2\`: \`lastDocuments\` is rendered by \`${DOCUMENTS_PANE}\` ALONE, so a sibling fire is the ` +
            'cross-pane touch the isolation law refuses',
        )
      }
      // (b) THE PAINT: exactly one verdict, painted, applied on the pane's own root.
      problems.push(...onePaintProblems(drive.verdicts(), DOCUMENTS_PANE, 'Q2d'))
      const answers = drive.applyAnswers()
      if (answers.length !== 1 || fingerprint(answers[0]) !== fingerprint([`pane-${DOCUMENTS_PANE}`])) {
        problems.push(
          `limb Q2d: the managed channel answered ${shown(answers)}, not exactly ONE call applying \`['pane-${DOCUMENTS_PANE}']\` — §3's ` +
            `ONE apply, one root`,
        )
      }
      problems.push(...otherRootsProblems(before, drive.roots(), [`pane-${DOCUMENTS_PANE}`], 'Q2d'))
      const fresh = appliedFrameOf(drive.applies(), `pane-${DOCUMENTS_PANE}`)
      if (fresh === undefined) {
        problems.push(
          `limb Q2d: the paint never handed the runtime a fresh \`pane-${DOCUMENTS_PANE}\` frame (applyContentReconcile calls: ` +
            `${drive.applies().length}) — the paint applies the reconcile's \`next\` envelope`,
        )
      } else {
        if (liveDocuments !== undefined && fingerprint(carriersOf(liveDocuments)) !== fingerprint(carriersOf(fresh))) {
          problems.push(
            `limb Q2d: the fresh frame's CARRIERS differ from the live frame's (live ${shown(carriersOf(liveDocuments))} vs fresh ` +
              `${shown(carriersOf(fresh))}) — a content update continues the LIVE frame's zone/collapsed and never re-derives its ` +
              `identity carriers`,
          )
        }
        if (!authoredText(fresh).includes(DOC_ONE)) {
          problems.push(
            `limb Q2d: the fresh frame does NOT author the settle's own answer \`${DOC_ONE}\` (authored: ` +
              `${shown(authoredText(fresh).slice(0, 400))}) — the paint authors from the host's fields, so the producer's committed ` +
              `answer MUST reach the rendered tree`,
          )
        }
      }
      if (liveDocuments !== undefined && rootById(drive.roots(), `pane-${DOCUMENTS_PANE}`) === liveDocuments) {
        problems.push(
          `limb Q2d: the pane's OWN root is the SAME OBJECT after a paint that changed its authored list — the managed channel ` +
            `REPLACES the root whole, so the pane's frame must be the NEW object`,
        )
      }
      // (c) `INV-E`.
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(
          `limb Q2d: the settle read ${countersReading(counters)} — \`INV-E\` pins \`0 loadAppGraph\` / \`0 mountOperator\` / ` +
            `\`0 refresh()\` on a pane update, and the pre-migration route (\`onChanged -> host.refresh()\`) is exactly what this grant ` +
            `replaces`,
        )
      }
      // (d) §3's census, read INSIDE the fire→paint window, with the producer's own call as the positive.
      problems.push(...paintWindowProblems(windows, 'Q2d'))
      if (counters.gnosisDocuments !== 1) {
        problems.push(
          `limb Q2d: \`bridge.gnosis.documents\` reads ${counters.gnosisDocuments}, not exactly 1 — the PRODUCER's own read is the ` +
            `positive that makes the paint-window zeros readable (§3); a zero here would make "the paint re-read nothing" ` +
            `indistinguishable from "nothing was read at all"`,
        )
      } else if (counters.security < 1) {
        problems.push(
          `limb Q2d: \`security.get\` reads ${counters.security} across a settle — the producer's M13 gate refresh is the second ` +
            `positive this row relies on (a gate that never re-read would silently freeze the fail-closed groups)`,
        )
      }

      // ---- (e) THE CONTROL: the IDENTICAL settle over already-painted state → `unchanged`, `applied: []` ------------------
      const beforeControl = drive.roots()
      drive.resetCounters()
      problems.push(...drive.produce('gnosisDocuments', 'gnosis.document.list', { wikiId: 'wiki-a' }, 'Q2d·control'))
      await settle()
      const controlVerdicts = drive.verdicts()
      if (controlVerdicts.length !== 1) {
        problems.push(
          `limb Q2d(control): the identical settle produced ${controlVerdicts.length} verdict(s) ${shown(controlVerdicts)}, not exactly ` +
            `ONE — the fire is UNCONDITIONAL (it is uncoalesced, \`O-2\`) and the PAINT is what answers \`unchanged\``,
        )
      } else if (controlVerdicts[0]['painted'] !== false || fingerprint(controlVerdicts[0]['applied']) !== fingerprint([])) {
        problems.push(
          `limb Q2d(control): the identical settle answered ${shown(controlVerdicts[0])}, not \`painted:false\` with \`applied === []\` ` +
            `— a shape-equal re-render applies NOTHING (\`r1\`'s idempotence limb), and this is what proves the arm above is a reading ` +
            `of a MOVED answer rather than of an adopted render`,
        )
      }
      if (drive.applyAnswers().length !== 0) {
        problems.push(
          `limb Q2d(control): the unchanged settle still reached \`applyContentReconcile\` (${shown(drive.applyAnswers())}) — no ` +
            `shape-equal re-render may apply a root`,
        )
      }
      if (drive.roots().length !== beforeControl.length || rootById(drive.roots(), `pane-${DOCUMENTS_PANE}`) !== rootById(beforeControl, `pane-${DOCUMENTS_PANE}`)) {
        problems.push('limb Q2d(control): an `unchanged` settle MOVED the materialized root set — no root may move when nothing changed')
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb Q2d — a CRUD settle paints its OWN pane ALONE (§6 Q2; §12a; §1 \`F-8\`; §3/\`ASM-B8-1\`). ${problems.length} problem(s). ` +
        `\`gnosis.document.list\` must commit \`lastDocuments\`, FIRE \`${DOCUMENTS_PANE}\` through the granted one-parameter wiring, and ` +
        `produce exactly ONE apply answering \`applied === ['pane-${DOCUMENTS_PANE}']\` with the frame's carriers held, every other ` +
        `materialized root the SAME object, \`0 refresh()\` / \`0 loadAppGraph\` / \`0 mountOperator\`, the whole re-read census ZERO ` +
        `inside the fire→paint window (the producer's own \`bridge.gnosis.documents === 1\` is the positive), and the identical settle ` +
        `again must answer \`unchanged\` with \`applied: []\`. PRECONDITION, reported as part of this row: both panes are registered, ` +
        `enabled and materialized, and \`updatePane('${DOCUMENTS_PANE}')\` answers \`unchanged\` on the booted state. envelope-class — ` +
        `the REAL SidebarPanes over the layout-less DOM shim with a recording runtime double; no rendered box, no pointer (G8-only)`,
    ).toEqual([])
  })

  it('Q2w — the same for `gnosis-wikis` from a `gnosis.wiki.get` settle (a PRIVATE field, `lastWiki`): `applied === [pane-gnosis-wikis]`, the documents pane’s root the SAME OBJECT, 0/0/0, the paint-window census zero with `bridge.gnosis.wikis === 1` as the positive', async () => {
    // §6 `Q2`/§1 `F-8`: `lastWiki` is rendered by `gnosis-wikis` ALONE (`gnosisWikisContent`'s `Wiki: <name>` line), so this is the
    // MIRROR of `Q2d` and the second half of "a private-field settle fires ONE".
    // LAYER/NON-VACUITY/RED: as `Q2d` — the seed commits the shared field first, `Wiki: ` is asserted ABSENT from the live frame
    // before the settle, the zeros sit beside the producer's own call, and at this head the zero-arg `onChanged` + the six-id census
    // mean the fire answers `{fired:false}` and nothing paints.
    const problems: string[] = []
    const drive = await seedHost()
    try {
      problems.push(...drive.seedProblems)
      problems.push(...paintPrecondition(drive, WIKIS_PANE, 'Q2w'))
      problems.push(...paintPrecondition(drive, DOCUMENTS_PANE, 'Q2w·sibling'))

      problems.push(...drive.produce('gnosisDocuments', 'gnosis.wiki.list', {}, 'Q2w·seed'))
      await settle()
      const before = drive.roots()
      const liveWikis = rootById(before, `pane-${WIKIS_PANE}`)
      const documentsBefore = rootById(before, `pane-${DOCUMENTS_PANE}`)
      if (liveWikis === undefined) {
        problems.push(`limb Q2w: after the seed there is no live \`pane-${WIKIS_PANE}\` frame (roots: [${rootIds(before).join(', ')}])`)
      } else if (authoredText(liveWikis).includes(`Wiki: ${WIKI_DETAIL}`)) {
        problems.push(`limb Q2w: the live frame ALREADY authors \`Wiki: ${WIKI_DETAIL}\` — "the pane's answer moved" would be vacuous`)
      }

      drive.resetCounters()
      drive.setWikiGet(wikiAnswer(WIKI_DETAIL))
      problems.push(...drive.produce('gnosisWikis', 'gnosis.wiki.get', { wikiId: 'wiki-a' }, 'Q2w'))
      await settle()

      const counters = drive.counters()
      const handed = drive.onChangedCalls()
      if (handed.length === 0) {
        problems.push('limb Q2w: the CRUD host called `onChanged` with NO pane id at all — the settle never reached the granted wiring')
      }
      const offCensus = handed.filter((paneId) => typeof paneId !== 'string')
      if (offCensus.length > 0) {
        problems.push(
          `limb Q2w: \`onChanged\` was handed ${shown(handed)}, which includes NON-STRING entr(ies) ${shown(offCensus)} — the CRUD host's ` +
            '`onChanged` must be the ONE-PARAMETER `(paneId: string) => void` (`D-44`, grant line 1)',
        )
      }
      const foreignFires = handed.filter((paneId) => typeof paneId === 'string' && paneId !== WIKIS_PANE)
      if (foreignFires.length > 0) {
        problems.push(
          `limb Q2w: a \`gnosis.wiki.get\` settle (field census: \`['wiki']\`) fired ${shown(foreignFires)} as well as ` +
            `\`${WIKIS_PANE}\` — \`F-8\`: \`lastWiki\` is rendered by \`${WIKIS_PANE}\` ALONE`,
        )
      }
      problems.push(...onePaintProblems(drive.verdicts(), WIKIS_PANE, 'Q2w'))
      const answers = drive.applyAnswers()
      if (answers.length !== 1 || fingerprint(answers[0]) !== fingerprint([`pane-${WIKIS_PANE}`])) {
        problems.push(
          `limb Q2w: the managed channel answered ${shown(answers)}, not exactly ONE call applying \`['pane-${WIKIS_PANE}']\``,
        )
      }
      problems.push(...otherRootsProblems(before, drive.roots(), [`pane-${WIKIS_PANE}`], 'Q2w'))
      const fresh = appliedFrameOf(drive.applies(), `pane-${WIKIS_PANE}`)
      if (fresh === undefined) {
        problems.push(`limb Q2w: the paint never handed the runtime a fresh \`pane-${WIKIS_PANE}\` frame (applies: ${drive.applies().length})`)
      } else {
        if (!authoredText(fresh).includes(`Wiki: ${WIKI_DETAIL}`)) {
          problems.push(
            `limb Q2w: the fresh frame does NOT author the settle's own answer \`Wiki: ${WIKI_DETAIL}\` (authored: ` +
              `${shown(authoredText(fresh).slice(0, 400))})`,
          )
        }
        if (liveWikis !== undefined && fingerprint(carriersOf(liveWikis)) !== fingerprint(carriersOf(fresh))) {
          problems.push(
            `limb Q2w: the fresh frame's CARRIERS differ from the live frame's (live ${shown(carriersOf(liveWikis))} vs fresh ` +
              `${shown(carriersOf(fresh))}) — a content update continues the LIVE frame's carriers and never re-derives them`,
          )
        }
      }
      if (documentsBefore !== undefined && rootById(drive.roots(), `pane-${DOCUMENTS_PANE}`) !== documentsBefore) {
        problems.push(
          `limb Q2w: a \`gnosis.wiki.get\` settle RE-MINTED \`pane-${DOCUMENTS_PANE}\` — §1 \`F-8\`: \`lastWiki\` is not a field that ` +
            `pane renders, so it must not move`,
        )
      }
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(`limb Q2w: the settle read ${countersReading(counters)} — \`INV-E\` pins all three at ZERO`)
      }
      problems.push(...paintWindowProblems(drive.fireWindows(), 'Q2w'))
      if (counters.gnosisWikis !== 1) {
        problems.push(
          `limb Q2w: \`bridge.gnosis.wikis\` reads ${counters.gnosisWikis}, not exactly 1 — the producer's own read is the positive ` +
            `that makes the paint-window zeros readable`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb Q2w — a ` + '`gnosis.wiki.get`' + ` settle paints ` + '`pane-gnosis-wikis`' + ` ALONE (§6 Q2; §12a; §1 \`F-8\`). ` +
        `${problems.length} problem(s). The verdict must be \`painted:true\` with \`applied === ['pane-${WIKIS_PANE}']\`, the fresh ` +
        `frame must author \`Wiki: ${WIKI_DETAIL}\`, the documents pane's root must be the SAME object, \`INV-E\` must read 0/0/0, and ` +
        `the paint-window census must be ZERO with \`bridge.gnosis.wikis === 1\` beside it. envelope-class`,
    ).toEqual([])
  })

  it('Q2s — a SHARED-field settle (`gnosis.wiki.list` writes `lastWikis`, which BOTH panes render) fires BOTH panes and paints both: two verdicts, two applies each naming its own root, both frames authoring the moved wiki name, every other root the SAME OBJECT, 0/0/0', async () => {
    // §6 `Q2`'s control + §1 `F-8`: "`lastWikis` and `noEditAccess` are rendered by BOTH panes", so a `gnosis.wiki.list` settle is the
    // SHARED-field case — the one that proves the fire's owner is a per-FIELD declaration and never the entry point.
    // LAYER: as `Q2d`. NON-VACUITY: the seed commits `WIKI_ONE` through the producer and this arm MOVES it to `WIKI_TWO`, so both
    // paints are readings of a moved value; both frames are then read for the marker. RED: at this head the zero-arg `onChanged`
    // fires `undefined` (no pane at all) and the census carries neither CRUD id.
    const problems: string[] = []
    const drive = await seedHost()
    try {
      problems.push(...drive.seedProblems)
      problems.push(...paintPrecondition(drive, DOCUMENTS_PANE, 'Q2s'))
      problems.push(...paintPrecondition(drive, WIKIS_PANE, 'Q2s'))

      drive.setWikiList(wikiListAnswer(WIKI_ONE))
      problems.push(...drive.produce('gnosisDocuments', 'gnosis.wiki.list', {}, 'Q2s·seed'))
      await settle()
      const before = drive.roots()
      const documentsBefore = rootById(before, `pane-${DOCUMENTS_PANE}`)
      const wikisBefore = rootById(before, `pane-${WIKIS_PANE}`)
      for (const [label, frame, marker] of [
        ['documents', documentsBefore, WIKI_ONE],
        ['wikis', wikisBefore, WIKI_ONE],
      ] as Array<[string, unknown, string]>) {
        if (frame === undefined) {
          problems.push(`limb Q2s: the seed carries no live \`pane-gnosis-${label}\` frame — the shared field has no subject there`)
        } else if (!authoredText(frame).includes(marker)) {
          problems.push(
            `limb Q2s: the seed's \`${label}\` frame does not author the shared field's current value \`${marker}\` (authored: ` +
              `${shown(authoredText(frame).slice(0, 300))}) — the shared-field arm needs BOTH panes to render it before the move`,
          )
        }
      }

      // THE MOVE: the SAME tool, a DIFFERENT answer → both panes' rendered lists change.
      drive.resetCounters()
      drive.setWikiList(wikiListAnswer(WIKI_TWO))
      problems.push(...drive.produce('gnosisDocuments', 'gnosis.wiki.list', {}, 'Q2s'))
      await settle()

      const counters = drive.counters()
      const handed = drive.onChangedCalls()
      const handsOnBoth = CRUD_PANES.every((paneId) => handed.includes(paneId))
      if (!handsOnBoth) {
        problems.push(
          `limb Q2s: a SHARED-field settle handed \`onChanged\` ${shown(handed)}, which does not name BOTH ${shown(CRUD_PANES)} — ` +
            `§1 \`F-8\`/\`§12a\`: \`lastWikis\` is rendered by BOTH panes, so the field census must fire both`,
        )
      }
      if (handed.length !== CRUD_PANES.length) {
        problems.push(
          `limb Q2s: the shared-field settle fired ${handed.length} pane(s) ${shown(handed)}, not exactly ${CRUD_PANES.length} — ` +
            `ONE fire per touched pane, never a duplicate`,
        )
      }
      const verdicts = drive.verdicts()
      if (verdicts.map((verdict) => verdict['paneId']).sort().join(',') !== [...CRUD_PANES].sort().join(',')) {
        problems.push(
          `limb Q2s: the update produced verdicts for ${shown(verdicts.map((verdict) => verdict['paneId']))}, not exactly ` +
            `${shown(CRUD_PANES)} — a shared-field settle paints the panes that render the field, and nothing else`,
        )
      }
      const answers = drive.applyAnswers()
      const expected = [[`pane-${DOCUMENTS_PANE}`], [`pane-${WIKIS_PANE}`]]
      if (fingerprint([...answers].sort()) !== fingerprint([...expected].sort())) {
        problems.push(
          `limb Q2s: the managed channel answered ${shown(answers)}, not exactly ${shown(expected)} — each paint applies ITS OWN root, ` +
            `one call each`,
        )
      }
      for (const paneId of CRUD_PANES) {
        const verdict = verdicts.find((entry) => entry['paneId'] === paneId)
        if (verdict === undefined || verdict['painted'] !== true) {
          problems.push(`limb Q2s: the \`${paneId}\` verdict reads ${shown(verdict)}, not \`painted:true\``)
        }
      }
      problems.push(...otherRootsProblems(before, drive.roots(), CRUD_PANES.map((paneId) => `pane-${paneId}`), 'Q2s'))
      const freshDocuments = appliedFrameOf(drive.applies(), `pane-${DOCUMENTS_PANE}`)
      const freshWikis = appliedFrameOf(drive.applies(), `pane-${WIKIS_PANE}`)
      for (const [label, frame] of [
        ['pane-gnosis-documents', freshDocuments],
        ['pane-gnosis-wikis', freshWikis],
      ] as Array<[string, unknown]>) {
        if (frame === undefined) {
          problems.push(`limb Q2s: no fresh \`${label}\` frame was handed to the runtime — that pane never painted`)
        } else if (!authoredText(frame).includes(WIKI_TWO)) {
          problems.push(
            `limb Q2s: the fresh \`${label}\` frame does NOT author the shared field's moved value \`${WIKI_TWO}\` (authored: ` +
              `${shown(authoredText(frame).slice(0, 300))})`,
          )
        }
      }
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(`limb Q2s: the shared-field settle read ${countersReading(counters)} — \`INV-E\` holds for both panes at once`)
      }
      problems.push(...paintWindowProblems(drive.fireWindows(), 'Q2s'))
      if (counters.gnosisDocuments !== 1) {
        problems.push(`limb Q2s: \`bridge.gnosis.documents\` reads ${counters.gnosisDocuments}, not exactly 1 — the producer's own read is the positive`)
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb Q2s — a SHARED-field settle paints BOTH panes (§6 Q2's control; §1 \`F-8\`; §12a). ${problems.length} problem(s). ` +
        `\`gnosis.wiki.list\` writes \`lastWikis\`, which BOTH panes render, so the field census must fire ` +
        `${shown(CRUD_PANES)} and both must paint (\`applied === ['pane-gnosis-documents']\` and \`['pane-gnosis-wikis']\`), each frame ` +
        `authoring the moved wiki name, every other root the SAME object, \`0/0/0\`. envelope-class`,
    ).toEqual([])
  })

  it('Q2n — a PRIVATE-field settle fires ONE: `gnosisCrudPanesTouchedBy` is the exported declaration and answers the fixed per-field mapping (deduped, documents-then-wikis order), and a `gnosis.wiki.get` settle records exactly ONE `onChanged` pane id', async () => {
    // §12a/§6 `Q2`: "the exported PURE mapping is the declaration — `lastWikis` and `noEditAccess` are rendered by BOTH panes,
    // `lastDocuments`/`lastDocument`/`lastConflict` by `gnosis-documents`, `lastWiki` by `gnosis-wikis` — so a shared-field settle fires
    // two and a private-field settle fires one".
    // LAYER: envelope/pure for the mapping's arms (the real exported function) + envelope-class for the recorded settle. NON-VACUITY:
    // every arm is a DIFFERENT expected answer over the same function (a constant answer reds at least one), the `[]` arm floors the
    // "unknown field" direction, and the duplicate arm proves DEDUPE rather than an echoed input.
    // RED AT THIS HEAD: `gnosisCrudPanesTouchedBy` does not exist, so the mapping has no subject; and the settle reaches `onChanged`
    // with NO id (the zero-arg callback), so "exactly one pane id" has no reading either.
    const problems: string[] = []
    const drive = await seedHost()
    let touchedBy: ((fields: readonly string[]) => unknown) | null = null
    try {
      problems.push(...drive.seedProblems)
      try {
        const module = (await import('../../../src/renderer/gnosis-crud-panes.js')) as Record<string, unknown>
        const candidate = module['gnosisCrudPanesTouchedBy']
        if (typeof candidate === 'function') touchedBy = candidate as (fields: readonly string[]) => unknown
        else {
          problems.push(
            `limb Q2n: \`gnosisCrudPanesTouchedBy\` does not resolve as a FUNCTION on \`src/renderer/gnosis-crud-panes.ts\` (read ` +
              `${typeof candidate}) — §12a lands it as the EXPORTED PURE declaration of which panes a settle touches, and without it ` +
              `"a private-field settle fires ONE" has no declared subject`,
          )
        }
      } catch (error) {
        problems.push(`limb Q2n: \`src/renderer/gnosis-crud-panes.ts\` does not resolve as a module (${String(error)})`)
      }

      if (touchedBy !== null) {
        const fn = touchedBy
        const arms: Array<[readonly string[], readonly string[], string]> = [
          [['documents'], [DOCUMENTS_PANE], '`lastDocuments` is rendered by `gnosis-documents` alone'],
          [['document'], [DOCUMENTS_PANE], '`lastDocument` is rendered by `gnosis-documents` alone'],
          [['conflict'], [DOCUMENTS_PANE], '`lastConflict` is rendered by `gnosis-documents` alone'],
          [['wiki'], [WIKIS_PANE], '`lastWiki` is rendered by `gnosis-wikis` alone'],
          [['wikis'], [DOCUMENTS_PANE, WIKIS_PANE], '`lastWikis` is rendered by BOTH panes (`F-8`)'],
          [['no-edit-access'], [DOCUMENTS_PANE, WIKIS_PANE], '`noEditAccess` is rendered by BOTH panes (`F-8`)'],
          [['wiki', 'documents'], [DOCUMENTS_PANE, WIKIS_PANE], 'two private fields touch two panes, in the FIXED order'],
          [['wikis', 'wikis', 'documents'], [DOCUMENTS_PANE, WIKIS_PANE], 'duplicates must be DEDUPED, not echoed'],
          [[], [], 'no touched field touches no pane'],
        ]
        for (const [fields, wanted, why] of arms) {
          let answer: unknown
          try {
            answer = fn(fields)
          } catch (error) {
            problems.push(`limb Q2n: \`gnosisCrudPanesTouchedBy(${shown(fields)})\` THREW (${String(error)}) — it is a pure mapping`)
            continue
          }
          if (fingerprint(answer) !== fingerprint(wanted)) {
            problems.push(
              `limb Q2n: \`gnosisCrudPanesTouchedBy(${shown(fields)})\` answered ${shown(answer)}, not ${shown(wanted)} — ${why}; ` +
                `the order is the FIXED \`['${DOCUMENTS_PANE}','${WIKIS_PANE}']\` and the list is DEDUPED`,
            )
          }
        }
      }

      // THE RECORDED SETTLE: a private-field settle hands the wiring EXACTLY ONE pane id.
      problems.push(...paintPrecondition(drive, WIKIS_PANE, 'Q2n'))
      problems.push(...paintPrecondition(drive, DOCUMENTS_PANE, 'Q2n·sibling'))
      problems.push(...drive.produce('gnosisDocuments', 'gnosis.wiki.list', {}, 'Q2n·seed'))
      await settle()
      drive.resetCounters()
      drive.setWikiGet(wikiAnswer(WIKI_DETAIL))
      problems.push(...drive.produce('gnosisWikis', 'gnosis.wiki.get', { wikiId: 'wiki-a' }, 'Q2n'))
      await settle()
      const handed = drive.onChangedCalls()
      if (handed.length !== 1) {
        problems.push(
          `limb Q2n: the private-field settle handed \`onChanged\` ${handed.length} argument(s) ${shown(handed)}, not exactly ONE — ` +
            `\`gnosis.wiki.get\` writes \`lastWiki\` alone, which is rendered by \`${WIKIS_PANE}\` alone (\`F-8\`)`,
        )
      } else if (handed[0] !== WIKIS_PANE) {
        problems.push(
          `limb Q2n: the private-field settle handed \`onChanged\` ${shown(handed[0])}, not \`${WIKIS_PANE}\` — the pane id the settle ` +
            `names must be the one its FIELD CENSUS declares`,
        )
      }
      const state = drive.crudState()
      if (state === null || state['wiki'] == null) {
        problems.push(
          `limb Q2n: the CRUD host's \`state().wiki\` reads ${shown(state === null ? null : state['wiki'])} after a \`gnosis.wiki.get\` ` +
            `settle — the producer must COMMIT \`lastWiki\` before it fires (the paint authors from it)`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb Q2n — the private-field settle fires ONE pane, and the mapping is the EXPORTED declaration (§12a/§6 Q2; §1 \`F-8\`). ` +
        `${problems.length} problem(s). \`gnosisCrudPanesTouchedBy(fields)\` must answer the fixed mapping ` +
        `(\`['documents'|'document'|'conflict'] -> ['${DOCUMENTS_PANE}']\`, \`['wiki'] -> ['${WIKIS_PANE}']\`, ` +
        `\`['wikis'|'no-edit-access'] -> ['${DOCUMENTS_PANE}','${WIKIS_PANE}']\`, deduped, in that fixed order) and a ` +
        `\`gnosis.wiki.get\` settle must hand \`onChanged\` exactly \`'${WIKIS_PANE}'\`. envelope/pure + envelope-class`,
    ).toEqual([])
  })

  it('Q3 — the ENGINE descriptor re-reads ONCE, FROM THE PRODUCER: one `refreshFromEngine`, `publishChange` exactly once, ZERO `bridge.gnosis.*` inside the fire→paint window, `requestRebuild` 0 — and the LOCAL fence re-reads nothing for these panes', async () => {
    // §6 `Q3`/§2/§12a: "the engine arm's missing wire lands in-grant — `onRagStoreChanged`'s engine branch calls the delegate's
    // `refreshFromEngine()` BEFORE `publishChange()`, so the descriptor issues the producer's read and each SETTLE fires its own pane —
    // `descriptor -> read -> settle -> fire -> paint`; the paint re-reads nothing, so it terminates."
    // LAYER: envelope-class — the host's PUBLIC `onRagStoreChanged` (the handler main's broadcast reaches), the counting façade's own
    // `publishChange`/fire counts, the bridge census, and the recorded `requestRebuild` calls.
    // NON_VACUITY: `publishChange()` is counted on the SAME payload, so "the descriptor was heard at all" is a positive beside
    // `refreshFromEngine`'s single call; the paint-window zeros sit beside a WHOLE-WINDOW total >= 1 (the producer DID read); and the
    // FENCE proves the arm is the ENGINE's alone — a matching LOCAL descriptor must call `refreshFromEngine` ZERO times.
    // RED AT THIS HEAD: `SidebarPanesOptions.gnosis` has no `refreshFromEngine`, so the engine branch reaches no producer at all (0
    // calls), and the CRUD panes fire `undefined` — there is no `descriptor -> read -> settle -> fire -> paint` to read.
    const problems: string[] = []
    const drive = await seedHost()
    try {
      problems.push(...drive.seedProblems)
      problems.push(...paintPrecondition(drive, DOCUMENTS_PANE, 'Q3'))
      problems.push(...paintPrecondition(drive, WIKIS_PANE, 'Q3'))

      // ---- (a) THE ENGINE DESCRIPTOR -------------------------------------------------------------------------------------
      drive.resetCounters()
      let threw = ''
      try {
        ;(drive.host as unknown as { onRagStoreChanged(payload: unknown): void }).onRagStoreChanged({
          store: 'gnosis:engine',
          kind: 'structural',
          nodeIds: ['engine-node-1'],
          edgeIds: [],
        })
      } catch (error) {
        threw = String(error)
      }
      await settle()
      if (threw !== '') {
        problems.push(`limb Q3: \`onRagStoreChanged\` THREW on an ENGINE descriptor (${threw}) — it is a broadcast handler, never a throw site`)
      }
      const refreshes = drive.engineRefreshes()
      if (refreshes.length !== 1) {
        problems.push(
          `limb Q3: the delegate's \`refreshFromEngine\` was called ${refreshes.length} time(s) for ONE engine descriptor, not exactly ` +
            `ONCE — §12a: the engine branch calls it BEFORE \`publishChange()\`, and that ONE call is what issues the producer's re-read ` +
            `(\`descriptor -> read -> settle -> fire -> paint\`). Zero means the arm reaches no producer at all (the widened ` +
            `\`SidebarPanesOptions.gnosis\`, grant line 2, is what routes it)`,
        )
      }
      if (drive.publishChanges() !== 1) {
        problems.push(
          `limb Q3: \`publishChange()\` was called ${drive.publishChanges()} time(s) for ONE engine descriptor, not exactly once — ` +
            `§2/\`B-6\`: the engine branch publishes the change census exactly once and returns`,
        )
      }
      if (drive.rebuildRequests().length !== 0) {
        problems.push(
          `limb Q3: the engine descriptor requested ${shown(drive.rebuildRequests())} — §2/§12a: the engine branch must NOT rebuild ` +
            `(\`requestRebuild\` is the LOCAL store's re-derive; the engine's ids are the engine's and a local re-derive around them is ` +
            `the wrong-origin harm \`B4-EX-2\` pins fail-closed)`,
        )
      }
      const engineCounters = drive.counters()
      if (engineCounters.refresh !== 0 || engineCounters.loadAppGraph !== 0 || engineCounters.mountOperator !== 0) {
        problems.push(
          `limb Q3: the engine descriptor read ${countersReading(engineCounters)} — \`INV-E\` pins the three counters at ZERO: the ` +
            `descriptor is a TRIGGER, and the paint it ends in re-reads nothing`,
        )
      }
      problems.push(...paintWindowProblems(drive.fireWindows(), 'Q3'))
      const producerReads = engineCounters.gnosisDocuments + engineCounters.gnosisWikis
      if (producerReads < 1) {
        problems.push(
          `limb Q3: no \`bridge.gnosis.*\` call was made across the descriptor (documents=${engineCounters.gnosisDocuments}, ` +
            `wikis=${engineCounters.gnosisWikis}) — §2: the engine arm is a re-read FROM THE PRODUCER (\`refreshFromEngine()\` issues ` +
            `the list read and each SETTLE fires its own pane); with zero reads the paint-window zeros above prove nothing`,
        )
      }

      // ---- (b) THE FENCE: a LOCAL descriptor re-reads nothing FOR THESE PANES ---------------------------------------------
      drive.resetCounters()
      let fenceThrew = ''
      try {
        ;(drive.host as unknown as { onRagStoreChanged(payload: unknown): void }).onRagStoreChanged({
          store: 'main',
          kind: 'content',
          nodeIds: [],
          edgeIds: [],
        })
      } catch (error) {
        fenceThrew = String(error)
      }
      await settle()
      if (fenceThrew !== '') {
        problems.push(`limb Q3(fence): \`onRagStoreChanged\` THREW on a LOCAL descriptor (${fenceThrew})`)
      }
      if (drive.engineRefreshes().length !== 0) {
        problems.push(
          `limb Q3(fence): a LOCAL descriptor (a matching \`store: 'main'\` payload with no edge ids) called \`refreshFromEngine\` ` +
            `${drive.engineRefreshes().length} time(s), not ZERO — §2's fence: the engine re-read belongs to the ENGINE branch alone ` +
            `(exact \`store\` equality ABOVE the local guards), so a local store change must not re-read the engine's lists`,
        )
      }
      const fenceCounters = drive.counters()
      if (fenceCounters.gnosisDocuments !== 0 || fenceCounters.gnosisWikis !== 0) {
        problems.push(
          `limb Q3(fence): a LOCAL descriptor reached \`bridge.gnosis.*\` (documents=${fenceCounters.gnosisDocuments}, ` +
            `wikis=${fenceCounters.gnosisWikis}) — the fence is that these panes' data is not store-derived`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb Q3 — the engine descriptor re-reads ONCE, from the PRODUCER (§6 Q3; §2; §12a; ` +
        '`ASM-B8-2`' + `). ${problems.length} problem(s). \`onRagStoreChanged({ store: 'gnosis:engine', … })\` must call ` +
        `\`refreshFromEngine\` EXACTLY once and \`publishChange()\` exactly once, request NO rebuild, leave \`INV-E\` at 0/0/0, read ` +
        `ZERO \`bridge.gnosis.*\` inside the fire→paint window while the producer's own reads are >= 1 across the window; and a LOCAL ` +
        `matching descriptor must call \`refreshFromEngine\` ZERO times. envelope-class — the REAL host's public handler + the counting ` +
        `façade; no live engine is required (the descriptor is data)`,
    ).toEqual([])
  })

  it('X3 — `INV-E` and its mutants, ONE `m6` PER MOVED PANE: the landed paint reads 0/0/0; m1→refresh, m2→loadAppGraph, m3→mountOperator, m4 a no-op onChanged→`painted:false` while the SOURCE MOVED, m5 a paint by re-assembly; and with the fire REMOVED for `gnosis-documents` and again for `gnosis-wikis` the counters hold PERFECTLY (0/0/0), ZERO applies happen, and the pane STILL shows its OLD data', async () => {
    // §6 `X3` (`D-40`'s lesson: "the counters are necessary and not sufficient"); §1 `F-4` (the loop) and `B-7`'s `X3` for the shape.
    // LAYER: envelope-class — the three counters wrapped on the instance, the bridge census, the applied list's CONTENT and the
    // AUTHORED text beside them.
    // NON_VACUITY: (i) needs a paint that LANDED (the root object changed AND the channel answered an apply), so `0/0/0` is a reading of
    // a REAL update; each of `m1`..`m5` must be CAUGHT on this same harness shape; and each `m6` carries the FLOOR of its own landing
    // reading (`(i)` for `gnosis-documents`, `Q2w`'s paint for `gnosis-wikis` — the SAME producer, reviewed in this file).
    // `m6` IS CHOSEN BECAUSE THE THREE COUNTERS CANNOT SEE IT: with the fire removed the source still commits, `INV-E` holds
    // PERFECTLY, ZERO paints happen — and the pane still names the OLD data. That is the arm a landing that drops a fire would pass.
    // RED AT THIS HEAD: with `onChanged` zero-arg every settle already behaves like an `m6` (the fire carries `undefined`), and the
    // census does not carry either CRUD id — so the mutants' FLOOR (`(i)`'s landed paint) has no subject, which is exactly the
    // report: the invariant cannot be *seen* to hold on a paint that never happens.
    const problems: string[] = []
    const mutants: string[] = []

    // ---- (i) THE DIRECT ARM: a REAL settle paints, and the zeroes are read off a LANDED paint --------------------------------
    const live = await seedHost()
    try {
      problems.push(...live.seedProblems)
      problems.push(...paintPrecondition(live, DOCUMENTS_PANE, 'X3(i)'))
      if (!live.hostSubscribed) {
        problems.push('limb X3(i): the harness did not hand the host its `events` channel — the boot-time subscriptions have no subject')
      }
      live.setWikiList(wikiListAnswer(WIKI_ONE))
      problems.push(...live.produce('gnosisDocuments', 'gnosis.wiki.list', {}, 'X3(i)·seed'))
      await settle()
      const beforePane = liveFrame(live, DOCUMENTS_PANE)
      live.resetCounters()
      live.setDocumentList(documentListAnswer(DOC_ONE))
      problems.push(...live.produce('gnosisDocuments', 'gnosis.document.list', {}, 'X3(i)'))
      await settle()
      const landed = live.counters()
      const afterPane = liveFrame(live, DOCUMENTS_PANE)
      if (beforePane !== undefined && afterPane === beforePane) {
        problems.push('limb X3(i): the settle left the pane root the SAME OBJECT — the zeroes prove nothing on a paint that did not land')
      }
      problems.push(...onePaintProblems(live.verdicts(), DOCUMENTS_PANE, 'X3(i)'))
      problems.push(...paintWindowProblems(live.fireWindows(), 'X3(i)'))
      if (landed.refresh !== 0 || landed.loadAppGraph !== 0 || landed.mountOperator !== 0) {
        problems.push(
          `limb X3(i): the pane update read ${countersReading(landed)} — \`INV-E\` pins \`0 loadAppGraph\`, \`0 mountOperator\`, ` +
            `\`0 refresh()\` on a pane update`,
        )
      }
      mutants.push(
        `(i) the landed paint: ${countersReading(landed)} applied=${shown(live.applyAnswers())} ` +
          `paneRootReminted=${String(beforePane !== undefined && afterPane !== beforePane)}`,
      )
    } finally {
      live.restore()
    }

    // ---- (ii)/(iii) m1..m5, ON A NO-`events` SEED (the `B-5` `L5` shape): the mutant is the ONLY handler ----------------------
    const sandbox = await seedHost({ events: false })
    try {
      problems.push(...sandbox.seedProblems)
      if (sandbox.hostSubscribed) {
        problems.push(
          'limb X3(ii): the m1..m5 seed handed the host an `events` channel — the host\'s real paint would then run beside every ' +
            'mutant and each reading would be the REAL path, not the mutant\'s',
        )
      }
      const channel = sandbox.channel
      const host = sandbox.host as unknown as Record<string, unknown>

      interface Mutant {
        label: string
        why: string
        handler: () => void
        reading: () => string
        caught: () => boolean
      }

      const runMutant = async (mutant: Mutant): Promise<void> => {
        sandbox.resetCounters()
        const release = channel.subscribe(DOCUMENTS_PANE, mutant.handler)
        let fireThrew = ''
        try {
          channel.fire(DOCUMENTS_PANE)
        } catch (error) {
          fireThrew = String(error)
        }
        await settle()
        const reading = mutant.reading()
        mutants.push(`${mutant.label}: ${reading}`)
        if (fireThrew !== '') {
          problems.push(`limb X3(iii) (${mutant.label}): the fire THREW (${fireThrew}) — \`fire\` never throws, mutant or not`)
        }
        if (!mutant.caught()) {
          problems.push(
            `limb X3(iii) (${mutant.label}): the mutant was NOT caught — ${mutant.why}. Reading: ${reading}. A harness that cannot ` +
              `SEE this mutant cannot prove the invariant it falsifies, so this arm is the row's own falsifier`,
          )
        }
        try {
          release()
        } catch {
          /* a mutant's withdrawal is the harness's own bookkeeping, never a row failure */
        }
      }

      // m1 — the PRE-MIGRATION body: `refresh()`.
      await runMutant({
        label: 'm1 refresh()',
        why: 'the pre-migration route (`onChanged -> host.refresh()`) must register on the refresh counter',
        handler: () => {
          void (host['refresh'] as () => Promise<void>).call(host)
        },
        reading: () => countersReading(sandbox.counters()),
        caught: () => sandbox.counters().refresh >= 1,
      })

      // m2 — the re-assembly: `loadAppGraph`.
      await runMutant({
        label: 'm2 loadAppGraph',
        why: 'a re-assembly must register on the loadAppGraph counter AND on the envelope load',
        handler: () => {
          ;(host['loadAppGraph'] as (a: unknown, b: unknown) => unknown)(host['runtime'], host['lastTraversalEnvelope'])
        },
        reading: () => countersReading(sandbox.counters()),
        caught: () => sandbox.counters().loadAppGraph >= 1 && sandbox.counters().loadEnvelopes >= 1,
      })

      // m3 — the operator re-mount.
      await runMutant({
        label: 'm3 mountOperator',
        why: 'an operator re-mount must register on the mountOperator counter',
        handler: () => {
          ;(host['mountOperator'] as () => void).call(host)
        },
        reading: () => countersReading(sandbox.counters()),
        caught: () => sandbox.counters().mountOperator >= 1,
      })
    } finally {
      sandbox.restore()
    }

    // m4 — A NO-OP `onChanged`: the source MOVES, nothing is painted, and the REAL paint seam over the same moved state DOES paint.
    const quiet = await seedHost({ onChangedNoop: true })
    try {
      problems.push(...quiet.seedProblems)
      quiet.setWikiList(wikiListAnswer(WIKI_ONE))
      problems.push(...quiet.produce('gnosisDocuments', 'gnosis.wiki.list', {}, 'X3·m4·shared'))
      await settle()
      quiet.setDocumentList(documentListAnswer(DOC_ONE))
      quiet.resetCounters()
      problems.push(...quiet.produce('gnosisDocuments', 'gnosis.document.list', {}, 'X3·m4·source'))
      await settle()
      const state = quiet.crudState()
      const sourceMoved = state !== null && state['documents'] != null
      const paneStale = ((): boolean => {
        const frame = liveFrame(quiet, DOCUMENTS_PANE)
        return frame !== undefined && !authoredText(frame).includes(DOC_ONE)
      })()
      const appliesUnderNoop = quiet.counters().applies
      const seam =
        quiet.host === null
          ? null
          : (quiet.host.updatePane as (id: string) => Record<string, unknown>).call(quiet.host, DOCUMENTS_PANE)
      mutants.push(
        `m4 a no-op onChanged: harnessApplies=${appliesUnderNoop} (ZERO: the no-op handler painted nothing) ` +
          `realSeamPainted=${shown(seam === null ? '(no host)' : seam['painted'])} ` +
          `realSeamApplied=${shown(seam === null ? '(no host)' : seam['applied'])} sourceMoved=${String(sourceMoved)} ` +
          `paneStaleBeforeTheSeam=${String(paneStale)}`,
      )
      if (!sourceMoved) {
        problems.push(
          'limb X3(iii) (m4 a no-op onChanged): the settle did NOT commit `lastDocuments` — the "the source moved" half has no subject',
        )
      }
      if (appliesUnderNoop !== 0) {
        problems.push(
          `limb X3(iii) (m4 a no-op onChanged): the no-op handler still reached \`applyContentReconcile\` ${appliesUnderNoop} time(s) — ` +
            `a no-op paints NOTHING`,
        )
      }
      if (!paneStale) {
        problems.push('limb X3(iii) (m4 a no-op onChanged): the pane already authors the moved answer — the staleness reading is vacuous')
      }
      if (seam === null || seam['painted'] !== true || fingerprint(seam['applied']) !== fingerprint([`pane-${DOCUMENTS_PANE}`])) {
        problems.push(
          `limb X3(iii) (m4 a no-op onChanged): the REAL paint seam over the SAME moved state answered ` +
            `${shown(seam)} — with the seam also silent, \`painted:false\` is not a reading of the mutant but of a dead harness`,
        )
      }
    } finally {
      quiet.restore()
    }

    // m5 — THE UPDATE APPLIED BY RE-ASSEMBLY INSTEAD OF THE PAINT. `reDerive('content')` reads 0/0/0 on the three counters, so they
    // cannot see it; the applied list's CONTENT (it names roots the pane does not own) and the pane's own staleness are the readings.
    const reassembly = await seedHost({ events: false })
    try {
      problems.push(...reassembly.seedProblems)
      reassembly.setWikiList(wikiListAnswer(WIKI_ONE))
      problems.push(...reassembly.produce('gnosisDocuments', 'gnosis.wiki.list', {}, 'X3·m5·shared'))
      reassembly.setDocumentList(documentListAnswer(DOC_ONE))
      problems.push(...reassembly.produce('gnosisDocuments', 'gnosis.document.list', {}, 'X3·m5·source'))
      await settle()
      const paneStaleBeforeM5 = ((): boolean => {
        const frame = liveFrame(reassembly, DOCUMENTS_PANE)
        return frame !== undefined && !authoredText(frame).includes(DOC_ONE)
      })()
      // THE DOCUMENT ROOT MOVES TOO, so the mutant's re-assembly replaces a root the pane does NOT own as well as its own.
      reassembly.setSnapshot(documentSnapshot('Doc A REBASELINED-BY-B8-M5'))
      reassembly.resetCounters()
      const release = reassembly.channel.subscribe(DOCUMENTS_PANE, () => {
        void (reassembly.host as unknown as { reDerive(kind?: string): Promise<void> }).reDerive('content')
      })
      let m5Threw = ''
      try {
        reassembly.channel.fire(DOCUMENTS_PANE)
      } catch (error) {
        m5Threw = String(error)
      }
      await settle(12)
      try {
        release()
      } catch {
        /* bookkeeping */
      }
      const assembly = reassembly.counters()
      const answers = reassembly.applyAnswers()
      const ours = answers.some((ids) => ids.includes(`pane-${DOCUMENTS_PANE}`))
      const others = answers.flat().filter((id) => id !== `pane-${DOCUMENTS_PANE}`)
      mutants.push(
        `m5 a re-assembly instead of the paint: refresh=${assembly.refresh} loadAppGraph=${assembly.loadAppGraph} ` +
          `mountOperator=${assembly.mountOperator} snapshot=${assembly.snapshot} docHeads=${assembly.docHeads} ` +
          `applied=${shown(answers)} appliedOurs=${String(ours)} appliedOthers=${shown(others)} ` +
          `paneStaleBeforeTheReDerive=${String(paneStaleBeforeM5)}`,
      )
      if (m5Threw !== '') {
        problems.push(`limb X3(iii) (m5 a re-assembly): the mutant's fire THREW (${m5Threw})`)
      }
      if (!(paneStaleBeforeM5 && ours && others.length > 0 && assembly.refresh === 0 && assembly.loadAppGraph === 0 && assembly.mountOperator === 0)) {
        problems.push(
          `limb X3(iii) (m5 a re-assembly instead of the paint): the mutant was NOT caught — a handler that applies the update by ` +
            `\`reDerive('content')\` must be visible through the applied list's CONTENT (it names roots the pane does not own) and ` +
            `through the pane being STALE before it ran, while the three counters read 0/0/0 and cannot see it. Reading above`,
        )
      }
    } finally {
      reassembly.restore()
    }

    // ---- (iv) `m6` PER MOVED PANE: THE FIRE REMOVED --------------------------------------------------------------------------
    // Each arm drops ONE pane's fire in the granted wiring (the settle still commits its field and still hands over the id — the
    // log is read, so "the fire was removed" is a deliberate mutant and not a lost id). Predictions: 0/0/0, ZERO applies, and the
    // pane STILL naming the OLD data while the host's field moved.
    const measureNoFire = async (
      label: string,
      paneId: string,
      drive: {
        produce: HostDrive['produce']
        crudState: HostDrive['crudState']
        counters: HostDrive['counters']
        applyAnswers: HostDrive['applyAnswers']
        roots: HostDrive['roots']
        onChangedCalls: HostDrive['onChangedCalls']
      },
      settleProducer: () => string[],
      marker: string,
      field: string,
    ): Promise<void> => {
      const handed = drive.onChangedCalls()
      const polluted = drive.applyAnswers()
      const counters = drive.counters()
      const paneAfter = rootById(drive.roots(), `pane-${paneId}`)
      const stillStale = paneAfter !== undefined && !authoredText(paneAfter).includes(marker)
      const state = drive.crudState()
      const fieldMoved = state !== null && state[field] != null
      mutants.push(
        `${label}: refresh=${counters.refresh} loadAppGraph=${counters.loadAppGraph} mountOperator=${counters.mountOperator} ` +
          `applies=${counters.applies} painted=${String(polluted.length > 0)} onChangedHanded=${shown(handed)} ` +
          `field(\`${field}\`)Moved=${String(fieldMoved)} paneStillNamesTheOldData=${String(stillStale)}`,
      )
      void settleProducer
      if (handed.length === 0 || !handed.includes(paneId)) {
        problems.push(
          `limb X3(iv) (${label}): the settle did not hand \`onChanged\` \`${paneId}\` (log: ${shown(handed)}) — this arm's mutant is ` +
            `"the FIRE was removed", so the id must still arrive and only the fire may be missing`,
        )
      }
      if (!fieldMoved) {
        problems.push(
          `limb X3(iv) (${label}): the host's \`${field}\` field did NOT move — m6's whole reading is "the source moved while the pane ` +
            `still shows the old data", so a silent producer would make the arm vacuous`,
        )
      }
      if (polluted.length > 0) {
        problems.push(
          `limb X3(iv) (${label}): the fire-less settle still reached \`applyContentReconcile\` (${shown(polluted)}) — with the fire ` +
            `removed ZERO paints may happen`,
        )
      }
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(
          `limb X3(iv) (${label}): with the fire absent the settle read ${countersReading(counters)}, not \`0/0/0\` — m6's prediction ` +
            `IS \`0/0/0\` with ZERO paints: the counters are NECESSARY AND NOT SUFFICIENT (\`D-40\`), and this arm is the proof`,
        )
      }
      if (!stillStale) {
        problems.push(
          `limb X3(iv) (${label}): the pane does NOT still name the old data — m6's reading is "the source moved while the pane still ` +
            `shows the OLD answer"; a paint that ran without a fire satisfies neither half`,
        )
      }
    }

    for (const paneId of CRUD_PANES) {
      const noFire = await seedHost({ events: true, dropFiresFor: [paneId] })
      try {
        problems.push(...noFire.seedProblems)
        problems.push(...paintPrecondition(noFire, paneId, `X3·m6-${paneId}`))
        // the SHARED field first (it is what lets either pane author a list at all), then the PRIVATE move under measurement
        noFire.setWikiList(wikiListAnswer(WIKI_ONE))
        problems.push(...noFire.produce('gnosisDocuments', 'gnosis.wiki.list', {}, `X3·m6-${paneId}·seed`))
        await settle()
        noFire.resetCounters()
        if (paneId === DOCUMENTS_PANE) {
          noFire.setDocumentList(documentListAnswer(DOC_ONE))
          problems.push(...noFire.produce('gnosisDocuments', 'gnosis.document.list', {}, `X3·m6-${paneId}`))
          await settle()
          await measureNoFire(
            `m6-documents (the fire removed for \`${DOCUMENTS_PANE}\`)`,
            DOCUMENTS_PANE,
            noFire,
            () => [],
            DOC_ONE,
            'documents',
          )
        } else {
          noFire.setWikiGet(wikiAnswer(WIKI_DETAIL))
          problems.push(...noFire.produce('gnosisWikis', 'gnosis.wiki.get', { wikiId: 'wiki-a' }, `X3·m6-${paneId}`))
          await settle()
          await measureNoFire(
            `m6-wikis (the fire removed for \`${WIKIS_PANE}\`)`,
            WIKIS_PANE,
            noFire,
            () => [],
            WIKI_DETAIL,
            'wiki',
          )
        }
      } finally {
        noFire.restore()
      }
    }

    expect(
      problems,
      `limb X3 — \`INV-E\` and its mutants, ONE \`m6\` PER MOVED PANE (§6 X3; \`D-40\`; §1 \`F-4\`). ${problems.length} problem(s). A ` +
        `producer's settlement must read \`0 refresh()\` / \`0 loadAppGraph\` / \`0 mountOperator\` on a paint that LANDED; each of ` +
        `m1..m5 must be CAUGHT; and each \`m6\` must be PRODUCIBLE — with the fire removed for ` +
        `\`${DOCUMENTS_PANE}\` and again for \`${WIKIS_PANE}\` the counters must hold \`0/0/0\`, ZERO applies must happen, and the pane ` +
        `must still show its OLD data while the host's field has moved. Computed readings: ` +
        `${mutants.length > 0 ? mutants.join(' · ') : '(no mutant could be driven)'}. envelope-class — the REAL SidebarPanes over the ` +
        `layout-less DOM shim, the counters wrapped on the instance; no rendered box, no computed style, no pointer (G8-only, §8)`,
    ).toEqual([])
  })
})
