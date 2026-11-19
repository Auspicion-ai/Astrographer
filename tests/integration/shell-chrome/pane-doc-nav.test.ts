// tests/integration/shell-chrome/pane-doc-nav.test.ts — unit `B-6` `pane-doc-nav`'s HOST rows (`D1`, `D2`, `D3`, `D5`, `D6`,
// `D7`, `D9`, `D10`), authored BEFORE any byte of the unit's landing (RCA-1: the red set runs first and is REPORTED before
// implementation). `S1`/`S2` and the census row `D4` live in `tests/unit/shell-chrome/pane-doc-nav.test.ts`.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-6-pane-doc-nav.md` —
//   §1 `F-1`/`F-2`/`F-3`/`F-4`/`F-5`: the engine descriptor DIES on the renderer's foreign-store guard today (`'gnosis:engine'`
//      can never equal a registry name); `publishChange()` has NO production caller; the `doc-nav` pane's data is ONE bridge call
//      (`bridge.rag.docHeads()`) and its render reads `ctx.docHeads` + `ctx.currentDocumentId` + the host's expanded-folder set
//      ONLY; the local predicate is UNCONDITIONAL (the store is the discriminator, not the kind — a `kind:'content'` commit can
//      RETITLE a document).
//   §2 the two branches and their ORDER (engine branch FIRST, exact equality, `publishChange()` then `return`; the three local
//      guards UNCHANGED; then `pendingContentChange` commit -> `fire('doc-nav')` -> `requestRebuild('content')`). The
//      discriminator is the `store` member and NOTHING ELSE.
//   §3 the re-read: ONE `bridge.rag.docHeads()` call committed to `lastDocHeads` under a GENERATION STAMP (`ASM-B6-3`: a
//      superseded answer is DROPPED, never committed and never painted), the re-read's GATE being the paint's own census
//      (`not-a-pane`/`not-enabled`, and — ⟨RE-STATED BY UNIT `B-9` §3⟩ — the operator surface's OWN paint word for an
//      `operator`-scope pane, whose `operator-scope` refusal `B-9` deleted).
//   §4 the census moves by exactly ONE (`REPLUMBED_PANE_IDS` gains `doc-nav`), ONE registration per id whose DECLARATION picks
//      `subscribeChange` for a change-interested id and `subscribe` for every other id.
//   §6 the rows `D1`, `D2`, `D3`, `D5`, `D6`, `D7`, `D9`, `D10`, each with its subject and the mutation that would red it.
//
// THE HARNESS IS THE `B-5` PRECEDENT'S SHAPE (`tests/integration/shell-chrome/pane-links.test.ts`), ADDED TO AND NOT WEAKENED:
// the REAL `SidebarPanes` over `installShim()` from `src/shared/dom-shim.ts`, its REAL `registerPanes()` census, booted through
// the PUBLIC `host.boot(runtime)` against a RECORDING runtime double (so `lastStore`, the cached snapshot/doc-heads,
// `_currentDocumentId`, `appLoaded` and the boot-time channel subscriptions are the HOST's own), a REAL `createPaneEvents()`
// handed to the host as its `events` option held behind a DELEGATING FAÇADE that counts what the host does on it and preserves
// every behaviour byte-for-byte, `updatePane`/`refresh`/`loadAppGraph`/`mountOperator` wrapped on the INSTANCE (so the host's own
// internal calls are counted), and a bridge double that counts EVERY call the unit's census names — `snapshot`, `docHeads`,
// `backlinks`, `security`, `template` — beside the three `INV-E` counters.
//
// WHY THE FAÇADE (and what it is NOT): `pane-events.ts` returns a FROZEN channel, so `publishChange`/`fire` cannot be counted on
// the value itself. The façade forwards EVERY member to the real channel (`subscribe`, `subscribeChange`, `fire`, `publishChange`,
// `panes`, `recordPanes`, `changePanes`, `subscribeRecord`, `deliver`), counting only two things: the host's own `fire(<id>)`
// calls and
// the REPORTS `publishChange()` answered (still the real channel's dispatch and real census, so `changePanes()` is the channel's
// own). Counting the REPORTS — never the handler — is what keeps "the engine arm reached the pane" distinguishable from "the direct
// arm reached the same registration": a `fire('doc-nav')` produces no publish report, by construction. This is the
// `B-5`/`L9` idiom one member wider: the readings are the host's DISPATCHES, never a test-authored dispatch.
//
// THE REACHABILITY RULE THIS FILE FOLLOWS (it always COLLECTS and RUNS): the engine branch, the `doc-nav` re-read arm, the
// generation stamp and the `REPLUMBED_PANE_IDS` move DO NOT EXIST at this head. Every seam that may be absent is reached through
// `readMember`/a `typeof` check and its absence is a NAMED problem inside that row's ONE aggregate `expect(problems, …)` — never
// an ESM link error, never a `skip`, never a raw `TypeError`. The seams that DO exist (`boot`, `onRagStoreChanged`, `updatePane`,
// `paintReplumbedPane`, `refresh`, `reDerive`, the channel, the registry) are DRIVEN, and every reading is taken from a counter,
// a verdict, an `applyContentReconcile` census or the AUTHORED envelope — so a missing member cannot break the other readings.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): every row here is ENVELOPE-class — the REAL host over the LAYOUT-LESS DOM shim (no CSS, no
// computed style, no layout), against a RECORDING runtime double and a counting bridge. The observables are call counts, the
// paint's own verdict fields, the IDENTITY of authored nodes and the authored ENVELOPE text. What this layer can NEVER read,
// named so nobody quotes it: that the frame was RE-MINTED in a real window, the pane as the user sees it, its box/scroll/style,
// any pointer, the NUMBER of IPCs on the wire (the census counts BRIDGE calls) and **the engine source itself** — no engine frame
// can be produced at this head (`docs/L1` §8's recorded park), so `D2`/`D3`'s engine rows are proven at NODE grain only and this
// file claims nothing more. `docs/L1/unit-b-6-pane-doc-nav.md` §8's assembled-app limb (`G8`) is the only app-green reading.
//
// NON-VACUITY (stated per row in its own comment): every zero is floored on the SAME harness shape by a positive reading that
// must move (`D1`'s foreign control against its own paint, `D3(d)`'s two floors, `D6`'s six measured mutants, `D7`'s control
// deferred, `D9`'s enabled control, `D10`'s two directions), so no arm can pass by the harness being silent.
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`, no `vi.mock`, no `console.log` (a
// reading that must be printed is folded into the aggregate failure message — `B5-DOC-PRINT`); it writes nothing. Every path
// derives from THIS FILE's own location (`ROOT`), so a missing substrate FAILS (ENOENT) instead of skipping. It does not touch
// `tests/live-drive-contract.test.ts` and asserts nothing about the assembled app.
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { installShim, ShimElement } from '../../../src/shared/dom-shim.js'
import { createPaneRegistry } from '../../../src/renderer/pane-registry.js'
import { createPaneEvents } from '../../../src/renderer/pane-events.js'
import { SidebarPanes } from '../../../src/renderer/sidebar-panes.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../../../src/main/template-shape.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

const SIDEBAR_FILE = 'src/renderer/sidebar-panes.ts'

/** The pane under this unit. */
const DOC_NAV = 'doc-nav'
/** `B-5`'s pane, whose rows this unit may not weaken (`D10` is the cross-read census). */
const CROSSLINKS = 'crosslinks'
/** The two families `D4`/`D9` prove keep the pre-migration route. */
const SEARCH = 'search'
const TEMPLATE_EDITOR = 'template-editor'
const SETTINGS = 'settings'
/** An id no pane declares: the paint's `not-a-pane` arm (`D9`). */
const UNKNOWN_PANE = 'probe-b6-unknown'

/**
 * THE ENGINE'S ORIGIN LABEL, as the main-side sink broadcasts it: `src/main/engine-rag-store.ts`'s
 * `export const ENGINE_ORIGIN_STORE = 'gnosis:engine'` (`docs/L1` §1 `F-1`). It is NOT imported from that module on purpose —
 * that module imports `./engine-transport.js`, which imports `undici` at module scope, and the label's DECLARATION equality
 * (main vs renderer) is `S2`'s subject in `tests/unit/shell-chrome/pane-doc-nav.test.ts`, not this file's.
 */
const ENGINE_LABEL = 'gnosis:engine'
/** A REGISTRY-LEGAL name (letters and hyphens only, `RAG_STORE_NAME_PATTERN` refuses a colon) that is NOT the captured store:
 *  the fence's hardest case (§2 — one character from the label must stay a LOCAL name). */
const FOREIGN_REGISTRY_LEGAL = 'default'
/** The store name the host captures at boot (`snapshot.store`) and the name a LOCAL descriptor must carry. */
const STORE = 'main'
/** The engine's own document id — NOT a local id (`F-1`: the engine's `nodeIds` are the ENGINE's ids). */
const ENGINE_DOC_ID = 'engine-doc-1'

/**
 * The seed's documents. `doc-a` IS the boot's current document (so `data-current` has a subject, `D5`), and the three MOVING
 * markers are ROOT-LEVEL leaves (`path: []`): a folder renders its children ONLY when it is expanded (`renderDocNavNode`), so a
 * marker buried in a collapsed folder is authored nowhere and a "the list moved" reading would compare two identical trees. The
 * folder cases (`guides` expanded by `D5`, `notes` collapsed) are then their own documents (`doc-e`/`doc-f`/`doc-b`).
 */
const DOC_A = 'doc-a'
const DOC_B = 'doc-b'
const DOC_C = 'doc-c'
const DOC_D = 'doc-d'
const DOC_E = 'doc-e'
const DOC_F = 'doc-f'
const HEAD_A = 'head-a'
const HEAD_B = 'head-b'

/** The folder keys the host's `expandedDocFolders` holds: `JSON.stringify(path[])` (`docNavContent`'s convention). */
const FOLDER_GUIDES = JSON.stringify(['guides'])
const FOLDER_NOTES = JSON.stringify(['notes'])

/** The authored title markers each list carries: two DIFFERENT strings, so "the list moved" is a comparison of two values. */
const TITLE_RENAMED = 'Doc A renamed'
const TITLE_C = 'Doc C'
const TITLE_D = 'Doc D'
const TITLE_STALE = 'Doc STALE'

const fingerprint = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

/** A value as a failure message prints it. */
const shown = (value: unknown): string => (value === undefined ? '(absent)' : fingerprint(value))

/** ONE readable string for the three `INV-E` counters + the five-member re-read census — every failure message uses it. */
const countersReading = (counters: Counters): string =>
  `refresh=${counters.refresh} loadAppGraph=${counters.loadAppGraph} mountOperator=${counters.mountOperator}` +
  ` (re-read census: snapshot=${counters.snapshot} docHeads=${counters.docHeads} security=${counters.security}` +
  ` backlinks=${counters.backlinks} template=${counters.template})` +
  ` (secondary: operatorSettings.get=${counters.settingsGets} loadEnvelope=${counters.loadEnvelopes}` +
  ` applyContentReconcile=${counters.applies})`

beforeAll(() => {
  installShim()
})

// ---------------------------------------------------------------------------
// THE NON-FATAL MEMBER READINGS — the reachability rule: a member this unit must ADD is read through this helper and its absence
// is a NAMED problem inside the row's aggregate assertion, never a module-load error and never a raw `TypeError`.
// ---------------------------------------------------------------------------
function readMember(holder: unknown, name: string, where: string, limb: string): string[] {
  if (holder === null || (typeof holder !== 'object' && typeof holder !== 'function')) {
    return [`limb ${limb}: ${where} is not an object (${shown(holder)}) — \`${name}\` has no holder, so the row has no subject`]
  }
  let value: unknown
  try {
    value = (holder as Record<string, unknown>)[name]
  } catch (error) {
    return [`limb ${limb}: reading \`${name}\` off ${where} THREW (${String(error)})`]
  }
  if (typeof value !== 'function') {
    return [
      `limb ${limb}: \`${name}\` is NOT a function on ${where} (typeof read: ${typeof value}) — the row's declared subject is ` +
        `ABSENT, so no limb below can be a reading of it`,
    ]
  }
  return []
}

// ---------------------------------------------------------------------------
// THE CONTENT-ROOT READING — the Runtime's OWN closed class, re-spelled here because the double IS the root-set owner
// (`src/renderer/runtime.ts:152-182`): a node is a content root iff its authored `props.id` is `rag-<id>`, `pane-<id>`, or one of
// the four pinned pane-like ids.
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
// THE AUTHORED-CONTENT READING — every row reads the ENVELOPE the host authored (never the DOM): every authored `content`
// string, the nodes carrying a given prop, and the `pane-<id>` frame of the doc-nav.
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
function nodesWhere(node: unknown, predicate: (record: Record<string, unknown>) => boolean, out: Array<Record<string, unknown>> = []): Array<Record<string, unknown>> {
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
// THE CARRIER READING (`D1`: "the fresh frame's identity carriers are unchanged"). §4/the paint REPLACES the pane's frame root
// WHOLE, so "frame identity" is the CARRIERS, never the element instance. The SLOT is the body node that holds the render root.
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
// THE SEED FIXTURES — a TWO-document snapshot (two `doc-head` edges, so `doc-a` is the boot's current document and `doc-b` is a
// real switch target) and THREE doc-heads lists whose authored titles are pairwise distinguishable markers (`D1`/`D2`/`D7`).
// ---------------------------------------------------------------------------
const NOW = new Date().toISOString()

const snapshotNode = (id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  id,
  type: 'p',
  content: `content-${id}`,
  ownedNodeIds: [],
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
})

const snapshotEdge = (
  id: string,
  kind: string,
  source: string,
  target: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({ id, kind, source, target, createdAt: NOW, updatedAt: NOW, ...overrides })

function documentSnapshot(): Record<string, unknown> {
  return {
    store: STORE,
    nodes: [
      snapshotNode(HEAD_A, { type: 'h1', content: 'Doc A' }),
      snapshotNode('sec-a'),
      snapshotNode(HEAD_B, { type: 'h1', content: 'Doc B' }),
      snapshotNode('sec-b'),
    ],
    edges: [
      snapshotEdge('dh1', 'doc-head', HEAD_A, DOC_A, { documentIds: [DOC_A] }),
      snapshotEdge('ns1', 'next-section', HEAD_A, 'sec-a', { documentIds: [DOC_A] }),
      snapshotEdge('dh2', 'doc-head', HEAD_B, DOC_B, { documentIds: [DOC_B] }),
      snapshotEdge('ns2', 'next-section', HEAD_B, 'sec-b', { documentIds: [DOC_B] }),
    ],
  }
}

/** One `RagDocHeadsPayload['documents']` entry. `path` is what `buildDocumentTree` groups FOLDERS by (`D5`). */
interface DocHead {
  documentId: string
  title: string
  path: string[]
  tags: string[]
}

/** THE BOOT LIST: `doc-a` at the ROOT (current, so `data-current` is authored), `doc-b` in the collapsed `notes` folder, and
 *  `doc-e` in the `guides` folder `D5` expands. */
const headsOne = (): DocHead[] => [
  { documentId: DOC_A, title: 'Doc A', path: [], tags: [] },
  { documentId: DOC_B, title: 'Doc B', path: ['notes'], tags: [] },
  { documentId: DOC_E, title: 'Doc E', path: ['guides'], tags: [] },
]

/** THE STORE MOVED: a RENAME (`F-4`: a `kind:'content'` commit CAN retitle a document, which is why the local predicate cannot be
 *  `edgeIds`), a NEW root-level document, and a second document inside `guides`. Every marker here is absent from `headsOne()`. */
const headsTwo = (): DocHead[] => [
  { documentId: DOC_A, title: TITLE_RENAMED, path: [], tags: [] },
  { documentId: DOC_B, title: 'Doc B', path: ['notes'], tags: [] },
  { documentId: DOC_C, title: TITLE_C, path: [], tags: [] },
  { documentId: DOC_E, title: 'Doc E', path: ['guides'], tags: [] },
  { documentId: DOC_F, title: 'Doc F', path: ['guides'], tags: [] },
]

/** A THIRD list, so a CONTROL delivery after a paint still has a movement to be measured against (`D1`'s control). */
const headsThree = (): DocHead[] => [...headsTwo(), { documentId: DOC_D, title: TITLE_D, path: [], tags: [] }]

/** A SUPERSEDED answer (`D7`): one ROOT-LEVEL document whose title nothing else carries (authored, so "it was not painted" is a
 *  reading of the pane and not of a collapsed folder). */
const headsStale = (): DocHead[] => [{ documentId: DOC_A, title: TITLE_STALE, path: [], tags: [] }]

/** The `doc-heads` answer shape the bridge returns. */
const docHeadsPayload = (documents: DocHead[]): Record<string, unknown> => ({
  documents: documents.map((doc) => ({ documentId: doc.documentId, title: doc.title, path: [...doc.path], tags: [...doc.tags] })),
})

// ---------------------------------------------------------------------------
// THE RECORDING RUNTIME DOUBLE — `loadEnvelope` seeds the materialized root set (exactly the Runtime's own closed class),
// `materializedContentRoots()` answers it (the paint's step 2), `materializedDocumentRoots()` answers the per-document census the
// paint CARRIES, `applyContentReconcile` records the call and performs the channel's whole-root replace, and
// `applyCommand`/`nodeState` absorb the zone-mirror slice. `codeGet('')` answers `null` — the documented ABSENT live-envelope
// route, on which the paint falls back to the materialized-root census (a real Runtime answers it and swaps by identity). Both
// are lawful; this is the `B-5` double unchanged.
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
  /** `true` → a REAL `createPaneEvents()` (behind the counting façade) is handed to the host as its `events` option, so the
   *  host's OWN boot-time subscriptions exist and its own `fire`/`publishChange` are the dispatches under measurement. */
  events?: boolean
  /** The doc-heads list the bridge answers with before any row moves it. */
  heads?: DocHead[]
}

interface Counters {
  refresh: number
  loadAppGraph: number
  mountOperator: number
  settingsGets: number
  loadEnvelopes: number
  applies: number
  snapshot: number
  docHeads: number
  backlinks: number
  security: number
  template: number
}

interface HostDrive {
  host: SidebarPanes
  registry: ReturnType<typeof createPaneRegistry>
  /** The REAL channel — the host's `events` when `events:true`, else a channel the test owns. */
  channel: ReturnType<typeof createPaneEvents>
  hostSubscribed: boolean
  /** The `boot()` failure, if any — a NAMED problem every row reports (the harness's own floor). */
  bootProblems: string[]
  counters: () => Counters
  resetCounters: () => void
  roots: () => unknown[]
  applies: () => Array<Record<string, unknown>>
  /** The `applied` list the managed channel ANSWERED, call by call — the channel's own report, never the input's intent. */
  applyAnswers: () => string[][]
  /** Every `updatePane` verdict the host produced, call by call. */
  verdicts: () => Array<Record<string, unknown>>
  /** Every `fire(<paneId>)` dispatch the HOST made, in order (the façade's own count). */
  fires: () => string[]
  /** Every `publishChange()` the HOST made (the façade's own count). `F-2`'s census: 0 at this head. */
  publishChanges: () => number
  /** The `FireReport`s every `publishChange()` the HOST made ANSWERED, in order — "the `doc-nav` registration fired once" is a
   *  reading of THIS (the engine arm's own dispatch), never of a handler invocation count (which a direct `fire` would also move). */
  publishReports: () => Array<Record<string, unknown>>
  /** Every `editController.requestRebuild(<kind>)` the host requested, in order. */
  rebuildRequests: () => string[]
  /** The doc-heads answer the bridge will give NEXT (and every later read, until replaced). */
  setDocHeads: (documents: DocHead[]) => void
  /** Install a HAND-CONTROLLED answer for `bridge.rag.docHeads`, keyed by the 1-based call ordinal since the seed — the deferred a
   *  row resolves by hand (`D7`). `null` restores the canned list. The call is STILL counted: the gate holds the ANSWER, never
   *  the CENSUS, so "the re-read happened" stays a reading. */
  setDocHeadsAnswer: (handler: ((callOrdinal: number) => Promise<Record<string, unknown>>) | null) => void
  restore: () => void
}

async function seedHost(options: SeedOptions = {}): Promise<HostDrive> {
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
    applies: 0,
    snapshot: 0,
    docHeads: 0,
    backlinks: 0,
    security: 0,
    template: 0,
  }
  const bootProblems: string[] = []
  const verdicts: Array<Record<string, unknown>> = []
  const firesLog: string[] = []
  const publishReports: Array<Record<string, unknown>> = []
  const rebuilds: string[] = []
  let publishChangeCalls = 0
  /** The doc-heads answer in force, and the monotone ordinal of the calls (`resetCounters` must not restart it). */
  let heads: DocHead[] = options.heads !== undefined ? options.heads.map((doc) => ({ ...doc })) : headsOne()
  let docHeadsCalls = 0
  let docHeadsAnswer: ((callOrdinal: number) => Promise<Record<string, unknown>>) | null = null
  /** The ordinal the ANSWER MODE has seen, counted from the installation (the boot's own fetch must not consume ordinals). */
  let answerCalls = 0

  const registry = createPaneRegistry()
  const bridge = {
    security: {
      get: async (): Promise<Record<string, unknown>> => {
        counters.security += 1
        return { token: null, enabled: ['read', 'dispatch'] }
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
        counters.snapshot += 1
        return documentSnapshot()
      },
      docHeads: async (): Promise<Record<string, unknown>> => {
        counters.docHeads += 1
        docHeadsCalls += 1
        const ordinal = docHeadsCalls
        if (docHeadsAnswer !== null) {
          answerCalls += 1
          return await docHeadsAnswer(answerCalls)
        }
        void ordinal
        return docHeadsPayload(heads)
      },
      backlinks: async (nodeId: string): Promise<Record<string, unknown>> => {
        counters.backlinks += 1
        return {
          nodeId,
          backlinks: [],
          outlinks: [],
          crosslinkBacklinks: [],
          crosslinkOutlinks: [],
        }
      },
      stores: async (): Promise<Record<string, unknown>> => ({ stores: [] }),
      query: async (): Promise<Record<string, unknown>> => ({
        query: '',
        ranked: [],
        context: [],
        markdown: '',
        lineMap: { ranges: [] },
        k: 5,
      }),
      journal: async (): Promise<Record<string, unknown>> => ({ entries: [] }),
    },
    template: {
      get: async (): Promise<Record<string, unknown>> => {
        counters.template += 1
        return { source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }
      },
      onTemplateChanged: (_handler: (payload: unknown) => void): (() => void) => () => undefined,
      create: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      delete: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      reset: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
    },
    operatorSettings: {
      // `panesInitialized: true` + an explicit ENABLED set is what mounts `doc-nav` and `crosslinks` (the shipped first-run
      // default is only `search`+`doc-nav`; this seed needs BOTH data-backed panes enabled+mounted).
      get: async (): Promise<Record<string, unknown>> => {
        counters.settingsGets += 1
        return {
          enabledPanes: [DOC_NAV, SEARCH, CROSSLINKS],
          enabledOperatorPanes: [SETTINGS],
          panesInitialized: true,
          defaultDocumentId: null,
          topK: 5,
        }
      },
      set: async (patch: unknown): Promise<unknown> => patch,
      onChanged: (_handler: (settings: unknown) => void): (() => void) => () => undefined,
    },
  }

  const channel = createPaneEvents()
  const hostSubscribed = options.events === true
  // THE COUNTING FAÇADE (see the header): every member forwards to the REAL channel; two of them count what the HOST did, and
  // `publishChange` records the REPORTS the real channel answered, so the engine arm's dispatch is a reading of the channel itself.
  const hostedEvents = {
    subscribe: (paneId: string, handler: (report: never) => void): (() => void) => channel.subscribe(paneId, handler),
    subscribeRecord: (paneId: string, handler: (report: never) => void): (() => void) => channel.subscribeRecord(paneId, handler),
    subscribeChange: (paneId: string, handler: (report: never) => void): (() => void) => channel.subscribeChange(paneId, handler),
    fire: (paneId: string): unknown => {
      firesLog.push(typeof paneId === 'string' ? paneId : `(non-string: ${shown(paneId)})`)
      return channel.fire(paneId)
    },
    publishChange: (): unknown => {
      publishChangeCalls += 1
      const reports = channel.publishChange()
      for (const report of reports) publishReports.push(report as unknown as Record<string, unknown>)
      return reports
    },
    deliver: (): unknown => channel.deliver(),
    panes: (): string[] => channel.panes(),
    recordPanes: (): string[] => channel.recordPanes(),
    changePanes: (): string[] => channel.changePanes(),
  } as unknown as ReturnType<typeof createPaneEvents>

  const host = new SidebarPanes({
    mount: new ShimElement('div') as never,
    operatorMount: new ShimElement('div') as never,
    registry,
    bridge,
    backRefs: new Map<string, string[]>(),
    editController: {
      anyDirty: () => false,
      // The dirty-edit guard's rebuild request: RECORDED, never driven (driving it would be a re-assembly the rows must be able to
      // read as ABSENT; `D6`'s m5 drives `reDerive` explicitly and by name).
      requestRebuild: (kind: string): void => {
        rebuilds.push(String(kind))
      },
      restoreCaret: (): undefined => undefined,
      isEditable: (): boolean => true,
    },
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
    const verdict = realUpdatePane(paneId)
    if (verdict !== null && typeof verdict === 'object') verdicts.push(verdict as Record<string, unknown>)
    return verdict
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

  // THE SEED IS THE PUBLIC BOOT: it is what captures `lastStore` (the fail-closed foreign-store guard), the cached
  // snapshot/doc-heads, `_currentDocumentId` and `appLoaded`, AND registers the host's channel subscriptions. Attaching the double
  // without booting would make every zero vacuous.
  try {
    await host.boot(runtime.double as never)
  } catch (error) {
    bootProblems.push(
      `the harness's \`host.boot(runtime)\` THREW (${String(error)}) — the seed is the {snapshot, doc-heads, store, current ` +
        `document, channel subscriptions} carrier every arm below reads, so no zero in this row is a reading without it`,
    )
  }

  return {
    host,
    registry,
    channel,
    hostSubscribed,
    bootProblems,
    counters: () => ({ ...counters }),
    resetCounters: () => {
      counters.refresh = 0
      counters.loadAppGraph = 0
      counters.mountOperator = 0
      counters.settingsGets = 0
      counters.loadEnvelopes = 0
      counters.applies = 0
      counters.snapshot = 0
      counters.docHeads = 0
      counters.backlinks = 0
      counters.security = 0
      counters.template = 0
      verdicts.length = 0
      firesLog.length = 0
      publishReports.length = 0
      rebuilds.length = 0
      publishChangeCalls = 0
    },
    roots: () => runtime.roots(),
    applies: () => runtime.applies,
    applyAnswers: () => runtime.applyAnswers.map((ids) => [...ids]),
    verdicts: () => verdicts.map((verdict) => ({ ...verdict })),
    fires: () => [...firesLog],
    publishChanges: () => publishChangeCalls,
    publishReports: () => publishReports.map((report) => ({ ...report })),
    rebuildRequests: () => [...rebuilds],
    setDocHeads: (documents: DocHead[]) => {
      heads = documents.map((doc) => ({ ...doc }))
      docHeadsAnswer = null
    },
    setDocHeadsAnswer: (handler) => {
      docHeadsAnswer = handler
      answerCalls = 0
    },
    restore: () => {
      delete (host as unknown as Record<string, unknown>)['refresh']
      delete (host as unknown as Record<string, unknown>)['loadAppGraph']
      delete (host as unknown as Record<string, unknown>)['mountOperator']
      delete (host as unknown as Record<string, unknown>)['updatePane']
      delete (host as unknown as Record<string, unknown>)['runtime']
      globals['window'] = previousWindow
    },
  }
}

const seeded = async (options: SeedOptions = {}): Promise<HostDrive> => seedHost(options)

/** Await a macrotask a few times: the fire's re-read is a bridge PROMISE, and the paint it precedes is not awaited by the host. */
const settle = async (rounds = 4): Promise<void> => {
  for (let i = 0; i < rounds; i += 1) await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

/** One hand-resolved promise — `D7`'s deferred. */
interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
}

function deferredOf<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

/** §2's CONTROL shape: a CONTENT-ONLY commit (`IPC_EDIT_COMMIT`'s `edgeIds: []`) on the rendered store. `D1`'s discriminator —
 *  a landing that copied `B-5`'s `edgeIds.length > 0` predicate fires NOTHING for this pane (`F-4`). */
const localContentDescriptor = (store: unknown = STORE): Record<string, unknown> => ({
  kind: 'content',
  nodeIds: ['node-1'],
  edgeIds: [],
  store,
})

/** A LOCAL STRUCTURAL descriptor (still the rendered store): the shape whose `edgeIds` are non-empty, kept so the two local
 *  shapes are both exercised and neither can be the only one the landing handles. */
const localStructuralDescriptor = (store: unknown = STORE): Record<string, unknown> => ({
  kind: 'structural',
  nodeIds: ['node-1'],
  edgeIds: ['e-1'],
  store,
})

/** §2's ENGINE descriptor, verbatim from `D2`: the sink's reconcile answer (`kind:'structural'`, the engine's own ids,
 *  `edgeIds: []`) carrying the engine origin label as its `store`. */
const engineDescriptor = (): Record<string, unknown> => ({
  kind: 'structural',
  nodeIds: [ENGINE_DOC_ID],
  edgeIds: [],
  store: ENGINE_LABEL,
})

/** Deliver ONE `RagStoreChangedPayload` through the host's OWN seam (`onRagStoreChanged` — §2's named learner), then let the
 *  re-read + paint it starts settle. A throw is a NAMED problem: the arm is an event handler, not a caller. */
async function deliverDescriptor(drive: HostDrive, payload: Record<string, unknown>, limb: string): Promise<string[]> {
  const absent = readMember(drive.host, 'onRagStoreChanged', `the REAL \`SidebarPanes\` instance (${SIDEBAR_FILE})`, limb)
  if (absent.length > 0) return absent
  const member = (drive.host as unknown as Record<string, (next: unknown) => void>)['onRagStoreChanged']
  let threw = ''
  try {
    member.call(drive.host, payload)
  } catch (error) {
    threw = String(error)
  }
  await settle()
  if (threw !== '') {
    return [`limb ${limb}: \`onRagStoreChanged\` THREW on ${shown(payload)} (${threw}) — the seam is an event handler and never a throw site`]
  }
  return []
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
      problems.push(
        `limb ${limb}: the root \`${id}\` VANISHED from the materialized set across the update (before ` +
          `${rootIds(before).join(', ')}, after ${rootIds(after).join(', ')}) — a pane update touches ONE pane's root and no other`,
      )
      continue
    }
    if (now !== root) {
      problems.push(
        `limb ${limb}: the root \`${id}\` was RE-MINTED across the update (identity, not equality: the object changed) — the ` +
          `paint reconciles THAT pane's root ONLY, so every other materialized root must be the SAME OBJECT`,
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

/** The pane's LIVE frame, or `undefined`. */
const liveFrame = (drive: HostDrive): unknown => rootById(drive.roots(), `pane-${DOC_NAV}`)

/** The `ul` root of the doc-nav tree INSIDE a frame (frame -> head, body -> render root). */
function docNavRootOf(frame: unknown): Record<string, unknown> | null {
  const body = childAt(frame, 1)
  const renderRoot = childAt(body, 0)
  return renderRoot
}

/** The folder `li` whose `data-folder-path` is `key`, in an authored subtree. */
const folderOf = (frame: unknown, key: string): Record<string, unknown> | undefined =>
  nodesWhere(frame, (record) => propsOf(record)['data-folder-path'] === key)[0]

/** The leaf `li` whose `data-document-id` is `id`, in an authored subtree. */
const leafOf = (frame: unknown, id: string): Record<string, unknown> | undefined =>
  nodesWhere(frame, (record) => propsOf(record)['data-document-id'] === id)[0]

/** The children of a folder `li` — the `ul` an EXPANDED folder authors (`renderDocNavNode`), `[]` when collapsed. */
function folderChildren(folder: Record<string, unknown> | undefined): Array<Record<string, unknown>> {
  if (folder === undefined) return []
  const ul = childAt(folder, 0)
  if (ul === null) return []
  const children = (ul['children'] ?? []) as unknown
  return Array.isArray(children) ? (children as Array<Record<string, unknown>>) : []
}

// ===========================================================================
// ROWS
// ===========================================================================
describe('pane-doc-nav — the FIRST pane that hears BOTH sources: ONE `doc-heads` re-read, ONE authored root replaced, the store discriminator, INV-E with six mutants, and the generation stamp', () => {
  it('D1 — a LOCAL store change fires the pane: ONE `rag.docHeads` re-read, `lastDocHeads` fresh, ONLY its own root replaced, 0/0/0 counters and 0 snapshot/security/backlinks/template — while a FOREIGN descriptor moves nothing', async () => {
    // §6 `D1` (§1 `F-4`'s UNCONDITIONAL local predicate: the descriptor below is the `IPC_EDIT_COMMIT` shape, `edgeIds: []`, so
    // a landing that reused `B-5`'s `edgeIds.length > 0` control fires NOTHING and reds this row; §3's ONE re-read + the stamp;
    // §4's ONE apply; §1's `INV-E`).
    // LAYER: envelope-class — the REAL `SidebarPanes` over the LAYOUT-LESS DOM shim, the observables being the paint's own verdict,
    // the authored envelope's text, the IDENTITY of authored nodes and call counts (no CSS, no box, no pointer exists here).
    // NON-VACUITY: the seed asserts a multi-root census and that the pane's authored list does NOT yet carry the moved title
    // (`TITLE_C`/`TITLE_RENAMED`), so "the list moved" is a comparison of two values; the three counters' zeroes and the four
    // census zeroes are read BESIDE `docHeads === 1` on the same payload, and the CONTROL re-moves the store (`headsThree`) and
    // proves the same harness would have MOVED had the store matched — so the control's zeros are a reading of the GUARD.
    // MUTATION THAT WOULD RED IT: no `doc-nav` arm (the pane is not in `REPLUMBED_PANE_IDS`, so nothing subscribes and the fire
    // reaches no listener — the landed head) reds the census, the verdict and the authored-text arms; a `B-5`-shaped `edgeIds`
    // predicate reds them the same way; a paint that re-assembles (`refresh`/`loadAppGraph`/`mountOperator`) reds `INV-E`; a paint
    // that re-reads the snapshot/security/backlinks/template reds the census; a paint that applies the whole assembled envelope reds
    // `applied` and the identity arm; dropping the foreign-store guard reds the CONTROL.
    const problems: string[] = []
    const drive = await seeded({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const hostPrivates = drive.host as unknown as Record<string, unknown>

      // ---- THE SEED'S PRE-CONDITIONS (each one is a reading this row's arms depend on) --------
      if (hostPrivates['lastStore'] !== STORE) {
        problems.push(
          `limb D1: \`lastStore\` reads ${shown(hostPrivates['lastStore'])}, not \`'${STORE}'\` — the captured boot store is what a ` +
            `LOCAL descriptor is compared against, so the arm has no subject`,
        )
      }
      if (hostPrivates['_currentDocumentId'] !== DOC_A) {
        problems.push(`limb D1: \`_currentDocumentId\` reads ${shown(hostPrivates['_currentDocumentId'])}, not \`'${DOC_A}'\` — the seed's current document is D5's \`data-current\` subject`)
      }
      const before = drive.roots()
      const beforeIds = rootIds(before)
      const live = rootById(before, `pane-${DOC_NAV}`)
      if (live === undefined) {
        problems.push(
          `limb D1: the seed carries NO live frame \`pane-${DOC_NAV}\` (roots read: [${beforeIds.join(', ')}]) — the paint's subject ` +
            `has no frame, so the re-read + paint has nothing to update`,
        )
      }
      if (!beforeIds.some((id) => id.startsWith('rag-'))) {
        problems.push(`limb D1: the seed carries NO \`rag-\` document root — "every other materialized root the SAME OBJECT" needs a non-pane subject too`)
      }
      if (beforeIds.length < 3) {
        problems.push(`limb D1: the SEED materialized only ${beforeIds.length} content root(s) [${beforeIds.join(', ')}] — "one root applied and every OTHER root the same object" needs other roots`)
      }
      if (live !== undefined && (authoredText(live).includes(TITLE_C) || authoredText(live).includes(TITLE_RENAMED))) {
        problems.push(
          `limb D1: the live frame ALREADY authors a moved title (authored: ${shown(authoredText(live))}) — the "the list moved" ` +
            `arm would be vacuous`,
        )
      }

      // ---- THE STORE MOVED, THEN ONE LOCAL DESCRIPTOR -------------------------------------------------
      drive.setDocHeads(headsTwo())
      drive.resetCounters()
      problems.push(...(await deliverDescriptor(drive, localContentDescriptor(), 'D1')))
      const counters = drive.counters()

      // ---- THE RE-READ CENSUS: EXACTLY ONE CALL, AND NOTHING ELSE -------------------------------------
      if (counters.docHeads !== 1) {
        problems.push(
          `limb D1: the local descriptor made ${counters.docHeads} \`bridge.rag.docHeads\` call(s), not EXACTLY ONE — §3: the pane's ` +
            `re-read is ONE call committed to \`lastDocHeads\`, and \`F-4\` makes it the price of the unconditional local predicate. ` +
            `Counters: ${countersReading(counters)}`,
        )
      }
      if (counters.snapshot !== 0 || counters.security !== 0 || counters.backlinks !== 0 || counters.template !== 0) {
        problems.push(
          `limb D1: the local descriptor reached the re-read census (snapshot=${counters.snapshot} security=${counters.security} ` +
            `backlinks=${counters.backlinks} template=${counters.template}) — §3: the arm is \`bridge.rag.docHeads()\` and NOTHING ` +
            `else: no snapshot, no security, no traversal, no template, no backlinks, no decorateShared, no syncZoneMirrors. This ` +
            `census is what tells a PAINT from a re-assemble`,
        )
      }
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(
          `limb D1: the local descriptor read ${countersReading(counters)} — \`INV-E\` pins EVERY one of the three at ZERO on a pane ` +
            `update (§1/§4: no \`loadAppGraph\`, no \`mountOperator\`, no \`refresh()\`)`,
        )
      }

      // ---- `lastDocHeads` IS THE FRESH LIST ----------------------------------------------------------
      if (fingerprint(hostPrivates['lastDocHeads']) !== fingerprint(headsTwo())) {
        problems.push(
          `limb D1: \`lastDocHeads\` reads ${shown(hostPrivates['lastDocHeads'])}, not the fresh list the bridge answered ` +
            `(${shown(headsTwo())}) — §3: the re-read COMMITS the answer before the paint, and the paint authors from it`,
        )
      }

      // ---- THE PAINT'S OWN VERDICT -------------------------------------------------------------------
      const verdicts = drive.verdicts()
      if (verdicts.length !== 1) {
        problems.push(
          `limb D1: the local descriptor produced ${verdicts.length} pane verdict(s) ${shown(verdicts)}, not EXACTLY ONE — §4's ` +
            `declared arm is the pane's re-read THEN ONE \`updatePane('${DOC_NAV}')\`: one paint per fire`,
        )
      } else {
        const verdict = verdicts[0]
        if (verdict['painted'] !== true || verdict['reason'] !== 'painted') {
          problems.push(
            `limb D1: the verdict reads ${shown(verdict)}, not \`painted:true\`/\`'painted'\` — the enabled+mounted pane whose list ` +
              `moved IS the arm that paints`,
          )
        }
        if (fingerprint(verdict['applied']) !== fingerprint([`pane-${DOC_NAV}`])) {
          problems.push(
            `limb D1: the verdict's \`applied\` reads ${shown(verdict['applied'])}, not exactly \`['pane-${DOC_NAV}']\` — the ` +
              `reconcile is over THAT PANE'S ROOT ONLY`,
          )
        }
      }
      const applies = drive.applyAnswers()
      if (applies.length !== 1 || fingerprint(applies[0]) !== fingerprint([`pane-${DOC_NAV}`])) {
        problems.push(
          `limb D1: the managed channel answered ${shown(applies)}, not exactly one call applying \`['pane-${DOC_NAV}']\` (§4's ONE apply)`,
        )
      }

      // ---- ONLY ITS OWN ROOT IS REPLACED --------------------------------------------------------------
      const after = drive.roots()
      problems.push(...otherRootsProblems(before, after, [`pane-${DOC_NAV}`], 'D1'))
      const afterLive = rootById(after, `pane-${DOC_NAV}`)
      if (live !== undefined && afterLive === live) {
        problems.push(
          `limb D1: the pane's OWN root is the SAME OBJECT after a paint that changed its authored list — the managed channel ` +
            `REPLACES the root whole (\`runtime.ts:535-540\`), so the pane's frame must be the NEW object`,
        )
      }

      // ---- THE FRESH FRAME'S CARRIERS AND CONTENT -----------------------------------------------------
      const fresh = appliedFrameOf(drive.applies(), `pane-${DOC_NAV}`)
      if (fresh === undefined) {
        problems.push(
          `limb D1: the paint never handed the runtime a fresh \`pane-${DOC_NAV}\` frame (applyContentReconcile calls recorded: ` +
            `${drive.applies().length}) — §3's paint applies the reconcile's \`next\` envelope`,
        )
      } else if (live !== undefined) {
        const beforeCarriers = carriersOf(live)
        const afterCarriers = carriersOf(fresh)
        if (fingerprint(beforeCarriers) !== fingerprint(afterCarriers)) {
          problems.push(
            `limb D1: the fresh frame's CARRIERS/zone/slot differ from the live frame's (live ${shown(beforeCarriers)} vs fresh ` +
              `${shown(afterCarriers)}) — the paint continues the LIVE frame's zone/collapsed (\`paneSubtreeRoot\`), and the frame's ` +
              `identity carriers (\`id\`, \`data-pane-id\`, the head/grip/control ids, the body slot) are never re-derived by a ` +
              `content update`,
          )
        }
        const freshText = authoredText(fresh)
        if (!freshText.includes(TITLE_C)) {
          problems.push(
            `limb D1: the fresh frame does NOT author the new document's title \`${TITLE_C}\` (authored: ${shown(freshText)}) — the ` +
              `paint authors from \`lastDocHeads\`, so the re-read's answer MUST reach the rendered tree`,
          )
        }
        if (!freshText.includes(TITLE_RENAMED)) {
          problems.push(
            `limb D1: the fresh frame does not author the RENAMED title \`${TITLE_RENAMED}\` (authored: ${shown(freshText)}) — ` +
              `\`F-4\`/\`ASM-B6-4\`: a \`kind:'content'\` commit CAN retitle a document (the row title is the doc-head edge's source ` +
              `node's content), and the unconditional local predicate is what makes the retitle visible`,
          )
        }
      }

      // ---- THE CONTROL: A FOREIGN STORE MOVES NOTHING -------------------------------------------------
      const controlLive = rootById(drive.roots(), `pane-${DOC_NAV}`)
      drive.setDocHeads(headsThree())
      drive.resetCounters()
      const appliesMark = drive.applyAnswers().length
      problems.push(...(await deliverDescriptor(drive, localContentDescriptor(FOREIGN_REGISTRY_LEGAL), 'D1·control')))
      const controlCounters = drive.counters()
      if (controlCounters.docHeads !== 0) {
        problems.push(
          `limb D1(control): a descriptor for the FOREIGN store \`'${FOREIGN_REGISTRY_LEGAL}'\` made ` +
            `${controlCounters.docHeads} \`rag.docHeads\` call(s) — §2's third local guard (\`payload.store !== this.lastStore\`) ` +
            `stays UNCHANGED and the pane is not re-read for a store this host is not rendering`,
        )
      }
      if (controlCounters.applies !== 0 || drive.applyAnswers().length !== appliesMark) {
        problems.push(
          `limb D1(control): the foreign descriptor reached \`applyContentReconcile\` (applies=${controlCounters.applies}) — a ` +
            `foreign store's broadcast paints NOTHING`,
        )
      }
      if (drive.verdicts().length !== 0) {
        problems.push(`limb D1(control): the foreign descriptor produced ${drive.verdicts().length} pane verdict(s) ${shown(drive.verdicts())} — no fire, no paint`)
      }
      if (controlLive !== undefined && rootById(drive.roots(), `pane-${DOC_NAV}`) !== controlLive) {
        problems.push('limb D1(control): the foreign descriptor REPLACED the pane root — the store did not match, so no root may move')
      }
      if (controlCounters.refresh !== 0 || controlCounters.loadAppGraph !== 0 || controlCounters.mountOperator !== 0) {
        problems.push(`limb D1(control): the foreign descriptor read ${countersReading(controlCounters)} — a dropped broadcast re-assembles NOTHING`)
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb D1 — a LOCAL store change fires the pane, it re-reads \`doc-heads\` ONCE, and only its own root is replaced (§6 D1; ` +
        `§1 \`F-4\`; §3's re-read; §4's ONE apply; \`INV-E\`). ${problems.length} problem(s). ONE \`onRagStoreChanged\` carrying the ` +
        `RENDERED store's name must make exactly ONE \`bridge.rag.docHeads()\` call, commit \`lastDocHeads\`, paint ` +
        `\`applied === ['pane-${DOC_NAV}']\`, leave every other materialized root the SAME OBJECT, and move none of ` +
        `\`refresh\`/\`loadAppGraph\`/\`mountOperator\` nor the snapshot/security/backlinks/template census — while the same ` +
        `descriptor for a FOREIGN store moves nothing. envelope-class — the REAL SidebarPanes over the layout-less DOM shim with a ` +
        `recording runtime double; no rendered box, no computed style, no pointer, no IPC count (G8-only)`,
    ).toEqual([])
  })

  it('D2 — an ENGINE-originated change repaints the same pane from its OWN re-read AND reaches no local route: `publishChange()` exactly once, ONE re-read, `applied === [pane-doc-nav]`, 0 rebuilds, `pendingContentChange` still null', async () => {
    // §6 `D2` (§2's FIRST branch: exact equality on `store === <the engine label>` -> `publishChange()` -> `return`; §1 `F-1`:
    // today that descriptor dies on the third local guard, so `publishChange` has NO production caller — `F-2`; §3's ONE re-read).
    // LAYER: envelope-class — the façade's `publishChange` count, the REAL channel's change-interest registration, the bridge's
    // re-read census, the paint's verdict, the authored envelope and the recorded `requestRebuild` calls. **No engine frame can be
    // produced at this head** (`docs/L1` §8), so this row proves the RECEIPT at node grain and claims no engine reading.
    // NON-VACUITY: the row reads `docHeads === 1` BESIDE `publishChange === 1` (a publisher that fires nothing would leave the
    // census at 0), the verdict beside the authored title, and `D1` floors the descriptor's reach on the same harness shape (a
    // local descriptor moves the same counters), so "the engine descriptor reached a PANE, not a no-op" is not asserted against a
    // silent harness.
    // MUTATION THAT WOULD RED IT: the landed head (no engine branch — the label falls through to `payload.store !== lastStore` and
    // returns silently) reds EVERY arm at once: 0 `publishChange`, 0 re-reads, no paint, the old list still authored; an engine
    // branch that fires the pane DIRECTLY instead of publishing reds the `publishChange === 1` arm (which is `F-2`'s whole point);
    // an engine branch that also accumulates `pendingContentChange`/requests a rebuild reds the local-route arms; an engine branch
    // placed AFTER the guards is unreachable (the label is not a registry name) and reds everything.
    const problems: string[] = []
    const drive = await seeded({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const hostPrivates = drive.host as unknown as Record<string, unknown>
      if (hostPrivates['pendingContentChange'] !== null) {
        problems.push(
          `limb D2: \`pendingContentChange\` reads ${shown(hostPrivates['pendingContentChange'])} before the descriptor — the seed ` +
            `must leave it \`null\` so "still null afterwards" is a reading of the DROP`,
        )
      }
      const before = drive.roots()
      const live = rootById(before, `pane-${DOC_NAV}`)
      if (live === undefined) {
        problems.push(`limb D2: the seed carries no live \`pane-${DOC_NAV}\` frame (roots: [${rootIds(before).join(', ')}]) — the engine source has no pane to repaint`)
      }
      if (live !== undefined && authoredText(live).includes(TITLE_C)) {
        problems.push(`limb D2: the live frame ALREADY authors \`${TITLE_C}\` — the "the pane names the new list" arm would be vacuous`)
      }

      // ---- THE ENGINE'S FRAME, DELIVERED ON THE ONE CHANNEL THE SINK USES -----------------------------
      drive.setDocHeads(headsTwo())
      drive.resetCounters()
      problems.push(...(await deliverDescriptor(drive, engineDescriptor(), 'D2')))
      const counters = drive.counters()

      // ---- (1) `publishChange()` EXACTLY ONCE — `F-2`'s MISSING PRODUCTION CALLER ---------------------
      const published = drive.publishChanges()
      if (published !== 1) {
        problems.push(
          `limb D2: the engine descriptor made ${published} \`publishChange()\` call(s), not EXACTLY ONE — §2's FIRST branch is ` +
            `\`payload.store === ${ENGINE_LABEL} -> this.events?.publishChange() -> return\`, and \`F-2\` records that at this head ` +
            `NO production site calls \`publishChange\` at all (the shipped change-interest census is empty). This is the unit's ` +
            `whole second half`,
        )
      }

      // ---- (2) THE `doc-nav` REGISTRATION FIRED ONCE, THROUGH `fire` ---------------------------------
      // READ OFF `publishChange()`'s OWN ANSWER (the reports the REAL channel returned), never off a handler-invocation count: a
      // direct `fire('doc-nav')` reaches the same registration, so only the CHANGE arm's answer can say the engine source fired it.
      const reports = drive.publishReports()
      if (reports.length !== 1) {
        problems.push(
          `limb D2: \`publishChange()\` answered ${reports.length} report(s) ${shown(reports)}, not EXACTLY ONE — §4: the boot loop ` +
            `subscribes a change-interested id with \`subscribeChange\`, so the engine arm reaches the \`${DOC_NAV}\` registration ` +
            `THROUGH \`fire\` (one registration, one dispatch). An empty answer is the change census itself being empty`,
        )
      } else if (reports[0]['fired'] !== true || reports[0]['paneId'] !== DOC_NAV) {
        problems.push(
          `limb D2: the change-interest fire reported ${shown(reports[0])}, not a fired \`'${DOC_NAV}'\` registration — ` +
            `\`publishChange\` reaches the pane through the SAME \`fire\` as the direct arm`,
        )
      }

      // ---- (3) ONE RE-READ, ONE PAINT, AND THE PANE NAMES THE NEW LIST --------------------------------
      if (counters.docHeads !== 1) {
        problems.push(
          `limb D2: the engine descriptor made ${counters.docHeads} \`bridge.rag.docHeads\` call(s), not EXACTLY ONE — the engine's ` +
            `\`nodeIds\` are the ENGINE's ids (\`${ENGINE_DOC_ID}\` is no local node), so the pane must re-read ITS OWN source (§9 \`O-3\`) ` +
            `and never trust them. Counters: ${countersReading(counters)}`,
        )
      }
      const verdicts = drive.verdicts()
      if (verdicts.length !== 1) {
        problems.push(`limb D2: the engine descriptor produced ${verdicts.length} pane verdict(s) ${shown(verdicts)}, not EXACTLY ONE`)
      } else {
        const verdict = verdicts[0]
        if (fingerprint(verdict['applied']) !== fingerprint([`pane-${DOC_NAV}`]) || verdict['painted'] !== true) {
          problems.push(
            `limb D2: the verdict reads ${shown(verdict)}, not \`painted:true\`/\`applied:['pane-${DOC_NAV}']\` — the engine change ` +
              `repaints the SAME pane from its own re-read`,
          )
        }
      }
      const afterLive = rootById(drive.roots(), `pane-${DOC_NAV}`)
      if (afterLive === undefined || !authoredText(afterLive).includes(TITLE_C)) {
        problems.push(
          `limb D2: the pane's LIVE frame does not author the new document's title \`${TITLE_C}\` (authored: ` +
            `${shown(afterLive === undefined ? '(no frame)' : authoredText(afterLive))}) — the engine-originated change must reach the ` +
            `rendered tree, or the pane is STALE while the store moved`,
        )
      }

      // ---- (4) ZERO LOCAL-ROUTE EFFECTS ---------------------------------------------------------------
      const rebuilds = drive.rebuildRequests()
      if (rebuilds.length !== 0) {
        problems.push(
          `limb D2: the engine descriptor requested rebuild ${shown(rebuilds)}, not NONE — §2: the engine branch returns BEFORE ` +
            `\`pendingContentChange\`/\`requestRebuild\`; its \`nodeIds\` are the ENGINE's document ids and feeding them to the local ` +
            `re-derive would re-assemble the app graph around ids no local store carries (the wrong-origin harm \`B4-EX-2\` pinned)`,
        )
      }
      if (hostPrivates['pendingContentChange'] !== null) {
        problems.push(
          `limb D2: \`pendingContentChange\` reads ${shown(hostPrivates['pendingContentChange'])}, not \`null\` (identity, not a length) ` +
            `— the engine branch must NOT accumulate a local change descriptor`,
        )
      }
      if (counters.snapshot !== 0 || counters.backlinks !== 0) {
        problems.push(
          `limb D2: the engine descriptor reached snapshot=${counters.snapshot} / backlinks=${counters.backlinks} — the re-read is ONE ` +
            `\`rag.docHeads\` call and nothing else`,
        )
      }
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(`limb D2: the engine descriptor read ${countersReading(counters)} — \`INV-E\` holds for the engine source too`)
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb D2 — an ENGINE-originated change repaints the same pane from its own re-read and reaches NO local route (§6 D2; §2's ` +
        `first branch; §1 \`F-1\`/\`F-2\`; §3). ${problems.length} problem(s). \`{kind:'structural', nodeIds:['${ENGINE_DOC_ID}'], ` +
        `edgeIds:[], store:'${ENGINE_LABEL}'}\` must make \`publishChange()\` run exactly ONCE, fire the \`${DOC_NAV}\` registration ` +
        `once through \`fire\`, make exactly ONE \`rag.docHeads\` call, paint \`applied === ['pane-${DOC_NAV}']\` with the new list ` +
        `authored, and leave \`requestRebuild\` at 0 with \`pendingContentChange\` still \`null\`, snapshot/backlinks at 0 and the three ` +
        `\`INV-E\` counters 0/0/0. envelope-class — the REAL host over the layout-less DOM shim; no engine frame exists at this head, ` +
        `so no engine reading is claimed (G8-only, §8)`,
    ).toEqual([])
  })

  it('D3 — NEITHER SOURCE CAN MASQUERADE AS THE OTHER: a local descriptor never publishes, an engine descriptor never rebuilds, the FENCE drops seven impostors, and two floors make the zeros readable', async () => {
    // §6 `D3` (§2: "the discriminator is the `store` member and nothing else"; `B-4` pinned the label so the equality cannot be
    // satisfied by an impostor — `'gnosis:engine2'`, `'gnosis-engine'`, `''`, a non-string, a colon-free registry name).
    // LAYER: envelope-class — the host's own `publishChange`/`fire` dispatches (the façade counts them), the recorded
    // `requestRebuild` calls, the re-read census and `pendingContentChange`'s IDENTITY.
    // NON-VACUITY: (d) is the floor EVERY zero above stands on — the SAME harness, the SAME descriptor shape, only the `store`
    // matching, must fire ONCE (`store === lastStore`) and the engine label must fire ONCE (through `publishChange`). A harness that
    // cannot move cannot prove a fence, so (d) is graded in the same row.
    // MUTATION THAT WOULD RED IT: an engine branch spelled as a PREFIX/`startsWith`/case-insensitive test reds the
    // `'gnosis:engine2'` and `'gnosis-engine'` arms; a branch that treats ANY colon-bearing name as the engine origin reds
    // `'gnosis:engine2'`; a branch that fires on `kind === 'structural'` alone reds (a) and the fence; deleting the local guards reds
    // the fence; an engine branch that also requests a rebuild reds (b); a local branch that publishes reds (a).
    const problems: string[] = []
    const warnings: string[] = []
    const realWarn = console.warn
    console.warn = (...args: unknown[]): void => {
      warnings.push(args.map((arg) => String(arg)).join(' '))
    }
    try {
      const drive = await seeded({ events: true })
      try {
        problems.push(...drive.bootProblems)
        const hostPrivates = drive.host as unknown as Record<string, unknown>
        if (hostPrivates['lastStore'] !== STORE) {
          problems.push(`limb D3: \`lastStore\` reads ${shown(hostPrivates['lastStore'])}, not \`'${STORE}'\` — the fence's comparison has no subject`)
        }

        // ---- (b) AN ENGINE DESCRIPTOR NEVER REBUILDS — MEASURED ON THE PRISTINE HOST --------
        // (b) runs BEFORE (a) for a reason that is a measurement, not a preference: (a)'s LOCAL descriptor COMMITS
        // `pendingContentChange`, so an identity reading of `null` after it would be a reading of (a)'s side effect and not of the
        // engine branch's refusal. The engine descriptor is therefore the FIRST descriptor this host ever sees.
        drive.resetCounters()
        problems.push(...(await deliverDescriptor(drive, engineDescriptor(), 'D3·b')))
        if (drive.rebuildRequests().length !== 0) {
          problems.push(
            `limb D3(b): an ENGINE descriptor requested rebuild ${shown(drive.rebuildRequests())} — §2: the engine branch RETURNS ` +
              `before \`requestRebuild('content')\` (its ids are the engine's, and a local re-derive around them is the wrong-origin ` +
              `harm)`,
          )
        }
        if (hostPrivates['pendingContentChange'] !== null) {
          problems.push(
            `limb D3(b): \`pendingContentChange\` reads ${shown(hostPrivates['pendingContentChange'])} after an ENGINE descriptor, not ` +
              `\`null\` (asserted by IDENTITY) — the engine branch returns before the accumulation`,
          )
        }

        // ---- (a) A LOCAL DESCRIPTOR NEVER PUBLISHES --------------------------------------------------
        drive.setDocHeads(headsTwo())
        drive.resetCounters()
        problems.push(...(await deliverDescriptor(drive, localStructuralDescriptor(), 'D3·a')))
        if (drive.publishChanges() !== 0) {
          problems.push(
            `limb D3(a): a LOCAL descriptor (\`store === lastStore\`) made ${drive.publishChanges()} \`publishChange()\` call(s) — §2: ` +
              `the engine arm is reached by exact equality with the ENGINE label ONLY; a local change reaches the pane through ` +
              `\`fire('${DOC_NAV}')\`, never through the change-interest arm (the two sources must stay two)`,
          )
        }
        if (drive.publishReports().length !== 0) {
          problems.push(
            `limb D3(a): a LOCAL descriptor's reach reads ${shown(drive.publishReports())} on the CHANGE arm — a local change must not ` +
              `masquerade as an engine-originated one (only the engine branch may publish)`,
          )
        }

        // ---- (c) THE FENCE: SEVEN IMPOSTORS, EACH WITH ITS OWN READING -------------------------------
        const fence: Array<[string, unknown]> = [
          [`'gnosis:engine2' (one character from the label)`, 'gnosis:engine2'],
          [`'gnosis-engine' (registry-legal, one character from the label)`, 'gnosis-engine'],
          [`'' (empty)`, ''],
          [`null`, null],
          [`7 (a non-string)`, 7],
          [`{} (a non-string object)`, {}],
          [`'${FOREIGN_REGISTRY_LEGAL}' (registry-legal, NOT the captured store)`, FOREIGN_REGISTRY_LEGAL],
        ]
        for (const [label, store] of fence) {
          drive.resetCounters()
          const payload = { ...localStructuralDescriptor(), store }
          problems.push(...(await deliverDescriptor(drive, payload, `D3·fence ${label}`)))
          const counters = drive.counters()
          const reading = `${countersReading(counters)} fires=${shown(drive.fires())} publishes=${drive.publishChanges()} rebuilds=${shown(drive.rebuildRequests())}`
          if (counters.docHeads !== 0) {
            problems.push(
              `limb D3(c): a descriptor whose \`store\` is ${label} made ${counters.docHeads} \`rag.docHeads\` call(s) — §2: \`'gnosis:engine'\` ` +
                `is the ONLY non-registry name the renderer may honour, and every other foreign name stays dropped (reading: ${reading})`,
            )
          }
          if (drive.fires().length !== 0) {
            problems.push(`limb D3(c): a descriptor whose \`store\` is ${label} dispatched ${shown(drive.fires())} — the fence drops it before any arm (reading: ${reading})`)
          }
          if (drive.publishChanges() !== 0) {
            problems.push(`limb D3(c): a descriptor whose \`store\` is ${label} published ${drive.publishChanges()} time(s) — only the exact engine label may reach the change arm (reading: ${reading})`)
          }
          if (drive.rebuildRequests().length !== 0) {
            problems.push(`limb D3(c): a descriptor whose \`store\` is ${label} requested rebuild ${shown(drive.rebuildRequests())} — a dropped broadcast rebuilds NOTHING (reading: ${reading})`)
          }
          if (counters.applies !== 0) {
            problems.push(`limb D3(c): a descriptor whose \`store\` is ${label} reached \`applyContentReconcile\` ${counters.applies} time(s) — a dropped broadcast touches no root (reading: ${reading})`)
          }
        }

        // ---- (d) THE FLOOR: TWO POSITIVE READINGS ON THE SAME HARNESS --------------------------------
        // ⟨CORRECTED — THE LOCAL FLOOR'S DESCRIPTOR.⟩ As authored this limb delivered `localStructuralDescriptor()` (`edgeIds:
        // ['e-1']`) and required `drive.fires()` to be exactly `['doc-nav']`. MEASURED on the landed host:
        // `["crosslinks","doc-nav"]` — `B-5`'s landed predicate (`Array.isArray(payload.edgeIds) && payload.edgeIds.length > 0`)
        // fires `crosslinks` on that SAME descriptor, so the requirement was UNSATISFIABLE as written (it was red at the
        // pre-landing head too, reading `['crosslinks']`). The row's OWN stated subject is that the local predicate is
        // UNCONDITIONAL on `edgeIds` (`F-4`/`ASM-B6-4`), and the CONTENT-shaped descriptor (`edgeIds: []`, the `IPC_EDIT_COMMIT`
        // shape) is the one that proves it: it dispatches `doc-nav` and fires NOTHING else. The assertion below and its message are
        // UNCHANGED.
        drive.setDocHeads(headsThree())
        drive.resetCounters()
        problems.push(...(await deliverDescriptor(drive, localContentDescriptor(), 'D3·d local')))
        const localFires = drive.fires()
        if (localFires.length !== 1 || localFires[0] !== DOC_NAV) {
          problems.push(
            `limb D3(d): a descriptor whose \`store === lastStore\` dispatched ${shown(localFires)}, not exactly \`['${DOC_NAV}']\` — ` +
              `\`F-4\`: the local predicate is UNCONDITIONAL (the STORE decides, not the kind and not \`edgeIds\`), and this floor is ` +
              `what makes every zero in (c) a reading of the FENCE rather than of a harness that fires nothing`,
          )
        }
        drive.resetCounters()
        problems.push(...(await deliverDescriptor(drive, engineDescriptor(), 'D3·d engine')))
        if (drive.publishChanges() !== 1) {
          problems.push(
            `limb D3(d): the engine label made ${drive.publishChanges()} \`publishChange()\` call(s), not exactly 1 — the floor under ` +
              `(c)'s engine-impostor arms: the harness CAN distinguish the label, or the fence's zeros prove nothing`,
          )
        }
        const floorReports = drive.publishReports()
        if (floorReports.length !== 1 || floorReports[0]['paneId'] !== DOC_NAV) {
          problems.push(
            `limb D3(d): the engine label's \`publishChange()\` answered ${shown(floorReports)}, not exactly one fired ` +
              `\`'${DOC_NAV}'\` report — the engine floor is what distinguishes the label from its impostors`,
          )
        }
      } finally {
        drive.restore()
      }
    } finally {
      console.warn = realWarn
    }

    expect(
      problems,
      `limb D3 — neither source can masquerade as the other, both directions plus the fence, floored (§6 D3; §2's discriminator). ` +
        `${problems.length} problem(s). A LOCAL descriptor must call \`publishChange\` 0 times and fire the change census 0 times; an ` +
        `ENGINE descriptor must request 0 rebuilds and leave \`pendingContentChange\` \`null\` by identity; \`'gnosis:engine2'\`, ` +
        `\`'gnosis-engine'\`, \`''\`, \`null\`, \`7\`, \`{}\` and the registry-legal \`'${FOREIGN_REGISTRY_LEGAL}'\` must each read 0 ` +
        `re-reads / 0 fires / 0 rebuilds / 0 applies; and the same harness must fire ONCE for \`store === lastStore\` and publish ONCE ` +
        `for the engine label. The drops warned: ${shown(warnings.slice(0, 8))}. envelope-class — the REAL host over the layout-less ` +
        `DOM shim; no rendered box, no pointer (G8-only)`,
    ).toEqual([])
  })

  it('D5 — the EXPANDED-FOLDERS carrier SURVIVES the paint: the repainted pane authors the expanded folder\'s children (an expanded `ul`) and none for a collapsed folder, and `data-current` follows `ctx.currentDocumentId`', async () => {
    // §6 `D5` (the map's own third clause; `F-3`: `docNavContent` reads `ctx.docHeads` + `ctx.currentDocumentId` +
    // `expandedPaths` ONLY, and `F-1`'s grant leaves `pane-graph.ts` owing ZERO byte — so the carrier must survive a repaint that
    // the host did not author the render for).
    // LAYER: envelope-class — the AUTHORED frame's props (`data-folder-path`/`data-expanded`/`data-folder-children`/
    // `data-document-id`/`data-current`), never a rendered element and never a computed style.
    // NON-VACUITY: the folder key is set through the pane's OWN public seam (`window.provident.sidebar.docNavToggle`, the body the
    // authored folder `li` carries), the LIVE frame is asserted COLLAPSED before the paint (so "it is expanded afterwards" compares
    // two different states), and the doc switch moves `_currentDocumentId` through the host's own setter (so `data-current` has two
    // different subjects).
    // MUTATION THAT WOULD RED IT: a paint that authors the tree from a context WITHOUT the host's expanded set reds the expanded
    // arm; a paint that expands EVERY folder reds the collapsed arm; a paint that drops `ctx.currentDocumentId` reds the
    // `data-current` arms; a fire that reaches no listener (the landed head) leaves NO fresh frame and reds every arm at once.
    const problems: string[] = []
    const drive = await seeded({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const hostPrivates = drive.host as unknown as Record<string, unknown>
      if (hostPrivates['_currentDocumentId'] !== DOC_A) {
        problems.push(`limb D5: \`_currentDocumentId\` reads ${shown(hostPrivates['_currentDocumentId'])}, not \`'${DOC_A}'\` — the highlight's first subject is missing`)
      }
      const liveBefore = liveFrame(drive)
      if (liveBefore === undefined) {
        problems.push(`limb D5: the seed carries no live \`pane-${DOC_NAV}\` frame (roots: [${rootIds(drive.roots()).join(', ')}]) — the carrier has no pane`)
      }
      const liveGuides = folderOf(liveBefore, FOLDER_GUIDES)
      if (liveGuides === undefined) {
        problems.push(
          `limb D5: the LIVE frame carries no folder \`${FOLDER_GUIDES}\` (authored: ${shown(authoredText(liveBefore))}) — ` +
            `\`docNavContent\` groups by \`RagDocHeadsPayload.documents[].path\`, and the seed's \`guides\` folder must exist before a ` +
            `paint can prove it survives`,
        )
      } else {
        if (propsOf(liveGuides)['data-expanded'] !== 'false' || folderChildren(liveGuides).length !== 0) {
          problems.push(
            `limb D5: the LIVE \`guides\` folder reads data-expanded=${shown(propsOf(liveGuides)['data-expanded'])} with ` +
              `${folderChildren(liveGuides).length} child node(s) — the seed leaves every folder COLLAPSED, so "it is expanded after ` +
              `the paint" is a comparison of two states`,
          )
        }
      }

      // ---- THE CARRIER IS SET THROUGH THE PANE'S OWN PUBLIC SEAM -------------------------------------
      const sidebar = (globalThis as unknown as { window?: { provident?: { sidebar?: Record<string, unknown> } } }).window?.provident
        ?.sidebar
      const toggle = sidebar?.['docNavToggle']
      if (typeof toggle !== 'function') {
        problems.push(
          `limb D5: \`window.provident.sidebar.docNavToggle\` is not a function on this shim (typeof: ${typeof toggle}) — the folder ` +
            `toggle seam the authored \`li\` carries has no subject, so the carrier cannot be moved through the pane's own route`,
        )
      } else {
        try {
          ;(toggle as (key: string) => void).call(sidebar, FOLDER_GUIDES)
        } catch (error) {
          problems.push(`limb D5: \`docNavToggle('${FOLDER_GUIDES}')\` THREW (${String(error)}) — the seam is a dispatch target and never a throw site`)
        }
      }

      // ---- ONE PAINT FROM ONE LOCAL DESCRIPTOR ------------------------------------------------------
      drive.setDocHeads(headsTwo())
      drive.resetCounters()
      const appliesMark = drive.applies().length
      problems.push(...(await deliverDescriptor(drive, localContentDescriptor(), 'D5')))
      const fresh = appliedFrameOf(drive.applies().slice(appliesMark), `pane-${DOC_NAV}`)
      if (fresh === undefined) {
        problems.push(
          `limb D5: the local descriptor applied NO fresh \`pane-${DOC_NAV}\` frame (applies since the mark: ` +
            `${shown(drive.applyAnswers().slice(appliesMark))}, counters: ${countersReading(drive.counters())}) — the expanded-folders ` +
            `carrier can only be read off the PAINTED frame`,
        )
      } else {
        // ---- THE EXPANDED FOLDER AUTHORS ITS CHILDREN -----------------------------------------------
        const guides = folderOf(fresh, FOLDER_GUIDES)
        if (guides === undefined) {
          problems.push(`limb D5: the fresh frame carries no \`guides\` folder at all (authored: ${shown(authoredText(fresh))})`)
        } else {
          if (propsOf(guides)['data-expanded'] !== 'true') {
            problems.push(
              `limb D5: the repainted \`guides\` folder reads data-expanded=${shown(propsOf(guides)['data-expanded'])}, not \`'true'\` — ` +
                `\`F-3\`: the pane's render reads the host's OWN expanded-folder set, so the repaint must CONTINUE the carrier`,
            )
          }
          const children = folderChildren(guides)
          if (children.length === 0) {
            problems.push(
              `limb D5: the repainted \`guides\` folder authors NO children — an EXPANDED folder authors an \`ul\` ` +
                `(\`data-folder-children\`) holding its documents (\`renderDocNavNode\`); the expanded-folders carrier was lost`,
            )
          }
          const childIds = children.map((child) => String(propsOf(child)['data-document-id'] ?? '(non-leaf)'))
          if (!childIds.includes(DOC_E) || !childIds.includes(DOC_F)) {
            problems.push(
              `limb D5: the repainted \`guides\` folder's children read ${shown(childIds)}, not the folder's own documents ` +
                `(\`${DOC_E}\` + \`${DOC_F}\` in the moved list) — the expanded branch must author THAT folder's children`,
            )
          }
        }
        // ---- THE COLLAPSED FOLDER AUTHORS NONE -----------------------------------------------------
        const notes = folderOf(fresh, FOLDER_NOTES)
        if (notes === undefined) {
          problems.push(`limb D5: the fresh frame carries no \`notes\` folder (authored: ${shown(authoredText(fresh))})`)
        } else {
          if (propsOf(notes)['data-expanded'] !== 'false') {
            problems.push(
              `limb D5: the repainted \`notes\` folder reads data-expanded=${shown(propsOf(notes)['data-expanded'])}, not \`'false'\` — ` +
                `only the KEY in the host's set may expand, so a paint that expands every folder reds this arm`,
            )
          }
          const collapsedChildren = folderChildren(notes)
          if (collapsedChildren.length !== 0) {
            problems.push(
              `limb D5: the COLLAPSED \`notes\` folder authors ${collapsedChildren.length} child node(s) ` +
                `${shown(collapsedChildren.map((child) => propsOf(child)['data-document-id']))} — a collapsed folder authors NONE`,
            )
          }
        }
        // ---- `data-current` FOLLOWS `ctx.currentDocumentId` ----------------------------------------
        const currentLeaf = leafOf(fresh, DOC_A)
        if (currentLeaf === undefined) {
          problems.push(`limb D5: the fresh frame carries no leaf for \`${DOC_A}\` (authored: ${shown(authoredText(fresh))})`)
        } else if (propsOf(currentLeaf)['data-current'] !== 'true') {
          problems.push(
            `limb D5: the leaf \`${DOC_A}\` reads data-current=${shown(propsOf(currentLeaf)['data-current'])}, not \`'true'\` — the ` +
              `highlight follows \`ctx.currentDocumentId\` (\`buildContext\` copies \`_currentDocumentId\`)`,
          )
        }
        const otherLeaf = leafOf(fresh, DOC_C)
        if (otherLeaf !== undefined && propsOf(otherLeaf)['data-current'] === 'true') {
          problems.push(`limb D5: the leaf \`${DOC_C}\` ALSO carries data-current — exactly ONE document is current`)
        }

        // ---- THE SWITCH: the highlight moves ACROSS a second paint ----------------------------------
        // The switch target is a ROOT-LEVEL leaf on purpose: a leaf inside a collapsed folder is authored NOWHERE, so a highlight
        // read off it would be unreadable (`renderDocNavNode`).
        let switchThrew = ''
        try {
          drive.host.setCurrentDocumentId(DOC_C)
        } catch (error) {
          switchThrew = String(error)
        }
        await settle()
        if (switchThrew !== '') {
          problems.push(`limb D5: \`setCurrentDocumentId('${DOC_C}')\` THREW (${switchThrew}) — the setter is a public seam and never a throw site`)
        }
        if (hostPrivates['_currentDocumentId'] !== DOC_C) {
          problems.push(`limb D5: \`_currentDocumentId\` reads ${shown(hostPrivates['_currentDocumentId'])} after the switch — the highlight has no second subject`)
        }
        // The switch shot moves the LIST as well as the highlight (`headsThree`), so the fresh frame differs structurally and the
        // paint LANDS; a highlight-only change would make "the highlight moved" a reading of a paint that may have answered
        // `unchanged`.
        drive.setDocHeads(headsThree())
        drive.resetCounters()
        const switchMark = drive.applies().length
        problems.push(...(await deliverDescriptor(drive, localContentDescriptor(), 'D5·switch')))
        const freshAfterSwitch = appliedFrameOf(drive.applies().slice(switchMark), `pane-${DOC_NAV}`)
        if (freshAfterSwitch === undefined) {
          problems.push(
            `limb D5: the post-switch descriptor applied NO fresh frame (applies: ${shown(drive.applyAnswers().slice(switchMark))}) — ` +
              `the highlight's movement across the paint is unreadable`,
          )
        } else if (propsOf(leafOf(freshAfterSwitch, DOC_C))['data-current'] !== 'true') {
          problems.push(
            `limb D5: after \`setCurrentDocumentId('${DOC_C}')\` and a repaint, the leaf \`${DOC_C}\` reads data-current=` +
              `${shown(propsOf(leafOf(freshAfterSwitch, DOC_C))['data-current'])}, not \`'true'\` — the highlight must follow ` +
              `\`ctx.currentDocumentId\` ACROSS the paint`,
          )
        } else if (propsOf(leafOf(freshAfterSwitch, DOC_A))['data-current'] === 'true') {
          problems.push(`limb D5: after the switch the leaf \`${DOC_A}\` STILL carries data-current — the highlight did not move`)
        }
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb D5 — the expanded-folders carrier survives the paint (§6 D5; §1 \`F-3\`; the map's third clause). ${problems.length} ` +
        `problem(s). With the host's expanded set holding \`${FOLDER_GUIDES}\`, the REPAINTED frame must author that folder's children ` +
        `(an expanded \`ul\`) and none for the collapsed \`${FOLDER_NOTES}\`, and the \`data-current\` highlight must follow ` +
        `\`ctx.currentDocumentId\` across the paint. Read off the AUTHORED frame, never the DOM. envelope-class`,
    ).toEqual([])
  })

  it('D6 — INV-E and SIX mutants, each MEASURED with its computed reading: m1 refresh, m2 loadAppGraph, m3 mountOperator, m4 a no-op, m5 a re-assembly instead of the paint, and m6 (this unit\'s own) — the two sources COLLAPSED, whose SUBJECT is the discriminator, not the counters', async () => {
    // §6 `D6` (§1/§4: `INV-E`'s subject is the PANE UPDATE's body; §6's "the row must be able to FAIL"; `B3-ADV-01`: every
    // mutant's reading is COMPUTED, never an authored sentence; `O-2`: the fire is UNCOALESCED and that is the cost row).
    // LAYER: envelope-class — the REAL host over the shim, the three counters wrapped on the instance, the façade's publish count,
    // the bridge's re-read census and the AUTHORED envelope beside them.
    // NON-VACUITY: (i) needs a paint that LANDED (the root object changed + the channel answered an apply), so `0/0/0` is a reading
    // of a REAL update; each of m1..m5 must be CAUGHT on this same harness shape; m6 runs on TWO FRESH SEEDS so its two readings
    // (engine label vs a registry-legal foreign name) are measured on identical states.
    // m5 — THE CENSUS **IS** DISCRIMINATING FOR THIS PANE (unlike `B-5`'s m5): a handler that applies the update by re-assembly
    // reads `snapshot >= 1` AND `docHeads >= 2` on the same event (the paint's own re-read beside the re-assembly's fetch), and its
    // applied list names roots the pane does not own.
    // m6 — THIS UNIT'S OWN, AND ITS SUBJECT IS THE DISCRIMINATOR: with the engine branch deleted the engine label is treated as a
    // foreign store, so its reading is IDENTICAL to a registry-legal foreign name's: `0/0/0` on all three counters, ZERO paints,
    // ZERO re-reads, `publishChange` 0, and the pane STILL naming the old list while the store moved. `INV-E` holds perfectly while
    // the second source is silently dead — that is the mutant a counters-only row cannot see, and `D2`/`D3` are the rows that see it.
    // MUTATION THAT WOULD RED IT: any pane update that reaches `refresh()`/`loadAppGraph`/`mountOperator` reds (i) — which is
    // exactly what m1–m3 prove this harness SEES; a paint that applies no root while the list moved reds m4's positive half; a
    // re-assembly that re-read the pane's data or repainted its root reds m5 (and the "the census cannot see a re-assembly" claim
    // would be false); a landing that ships the engine branch makes m6's two readings DIFFER (that is the green direction).
    const problems: string[] = []
    const mutants: string[] = []

    // ---- (i) THE DIRECT ARM: the host's OWN subscription paints, and the zeroes are read off a LANDED paint ----
    const live = await seeded({ events: true })
    try {
      problems.push(...live.bootProblems)
      const drive = live
      if (!drive.hostSubscribed) {
        problems.push('limb D6(i): the harness did not hand the host its `events` channel — the boot-time subscription has no subject')
      }
      const beforePane = liveFrame(drive)
      if (beforePane === undefined) {
        problems.push(`limb D6(i): the seed carries no live \`pane-${DOC_NAV}\` frame (roots: [${rootIds(drive.roots()).join(', ')}]) — INV-E needs a pane that CAN paint`)
      }
      drive.setDocHeads(headsTwo())
      drive.resetCounters()
      const appliesMark = drive.applyAnswers().length
      const report = drive.channel.fire(DOC_NAV)
      await settle()
      if (report.fired !== true) {
        problems.push(
          `limb D6(i): \`fire('${DOC_NAV}')\` answered ${shown(report)} — §4's boot loop subscribes the census's ids (a change-interested ` +
            `id with \`subscribeChange\`, which is \`subscribe\` + a mark), so the host's OWN handler is the arm that must run. A ` +
            `mutant-driven zero on a host that hears nothing would be a reading of the test's silence`,
        )
      }
      const fired = drive.counters()
      if (fired.docHeads !== 1) {
        problems.push(
          `limb D6(i): the channel fire read docHeads=${fired.docHeads}, not 1 — §4's subscription body is the pane's data re-read ` +
            `THEN \`updatePane\` (\`paintReplumbedPane\`), so ONE fire re-reads ONCE. Counters: ${countersReading(fired)}`,
        )
      }
      const afterPane = liveFrame(drive)
      if (beforePane !== undefined && afterPane === beforePane) {
        problems.push('limb D6(i): the channel fire left the pane root the SAME OBJECT — the zeros prove nothing on a paint that did not land')
      }
      const answers = drive.applyAnswers().slice(appliesMark)
      if (answers.length !== 1 || fingerprint(answers[0]) !== fingerprint([`pane-${DOC_NAV}`])) {
        problems.push(`limb D6(i): the managed channel answered ${shown(answers)}, not exactly one call applying \`['pane-${DOC_NAV}']\``)
      }
      if (fired.refresh !== 0 || fired.loadAppGraph !== 0 || fired.mountOperator !== 0) {
        problems.push(
          `limb D6(i): the channel-driven pane update read ${countersReading(fired)} — \`INV-E\` pins \`0 loadAppGraph\`, ` +
            `\`0 mountOperator\`, \`0 refresh()\` on a pane update (§1/§4: the counters are the PANE UPDATE's own)`,
        )
      }
      if (fired.snapshot !== 0 || fired.security !== 0 || fired.backlinks !== 0) {
        problems.push(
          `limb D6(i): the pane update reached the re-read census (snapshot=${fired.snapshot} security=${fired.security} ` +
            `backlinks=${fired.backlinks}) — §3's re-read is ONE \`rag.docHeads\` call and nothing else`,
        )
      }
    } finally {
      live.restore()
    }

    // ---- (ii)/(iii) m1..m5, ON TWO SANDBOXES, AND THE SPLIT IS A MEASUREMENT (named, not hidden) ----------
    //   · `m4` needs a seed where the mutant is the ONLY handler: its reading is `painted:false`/`applied:[]` with `docHeads` 0, and
    //     a live host registration would legitimately re-read and paint on the same fire — the reading would then be the REAL path's.
    //     `m1`..`m4` therefore run on a NO-`events` seed (the `B-5` `L5` shape).
    //   · `m5` needs the OPPOSITE: its claim is that the census IS discriminating for this pane because the paint's own re-read stands
    //     BESIDE the re-assembly's fetch (`docHeads >= 2`), so the host's registration must be LIVE and the mutant ADDITIONAL to it.
    const sandbox = await seeded({ events: false })
    try {
      problems.push(...sandbox.bootProblems)
      const drive = sandbox
      const channel = drive.channel
      if (drive.hostSubscribed) {
        problems.push(
          'limb D6(ii): the m1..m4 seed handed the host an `events` channel — the host\'s real paint would then run beside every ' +
            'mutant and each reading would be the REAL path, not the mutant\'s',
        )
      }

      interface Mutant {
        label: string
        why: string
        handler: () => void
        reading: () => string
        caught: () => boolean
      }

      const runMutant = async (mutant: Mutant): Promise<void> => {
        drive.resetCounters()
        const release = channel.subscribe(DOC_NAV, mutant.handler)
        let fireThrew = ''
        try {
          channel.fire(DOC_NAV)
        } catch (error) {
          fireThrew = String(error)
        }
        await settle()
        const reading = mutant.reading()
        mutants.push(`${mutant.label}: ${reading}`)
        if (fireThrew !== '') {
          problems.push(`limb D6(iii) (${mutant.label}): the fire THREW (${fireThrew}) — \`fire\` never throws, mutant or not`)
        }
        if (!mutant.caught()) {
          problems.push(
            `limb D6(iii) (${mutant.label}): the mutant was NOT caught — ${mutant.why}. Reading: ${reading}. A harness that cannot SEE ` +
              `this mutant cannot prove the invariant it falsifies, so this arm is the row's own falsifier`,
          )
        }
        // ONE MUTANT AT A TIME (`B-3`'s `⟨B3-F4⟩` repair): a surviving registration keeps firing on every later mutant's dispatch.
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
          void drive.host.refresh()
        },
        reading: () => countersReading(drive.counters()),
        caught: () => drive.counters().refresh >= 1,
      })

      // m2 — the re-assembly: `loadAppGraph`.
      await runMutant({
        label: 'm2 loadAppGraph',
        why: 'a re-assembly must register on the loadAppGraph counter AND on the envelope load',
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
        why: 'an operator re-mount must register on the mountOperator counter',
        handler: () => {
          ;(drive.host as unknown as Record<string, () => void>)['mountOperator']()
        },
        reading: () => countersReading(drive.counters()),
        caught: () => drive.counters().mountOperator >= 1,
      })

      // m4 — a NO-OP handler: the doc-heads answer moved, the handler painted nothing. The reading includes the REAL paint seam
      // driven over the SAME stale cache, which is what makes `painted:false`/`applied:[]` a computed value and not an authored word.
      drive.setDocHeads(headsThree())
      const beforeM4 = drive.roots()
      const paneBeforeM4 = rootById(beforeM4, `pane-${DOC_NAV}`)
      const headsMovedM4 = paneBeforeM4 === undefined || !authoredText(paneBeforeM4).includes(TITLE_D)
      if (!headsMovedM4) {
        problems.push(
          `limb D6(iii) (m4): the doc-heads answer did NOT move relative to the pane's authored list (\`${TITLE_D}\` is already ` +
            `there) — m4 would be measured on a store that did not change, the vacuous pass \`B3-ADV-01\` forbids`,
        )
      }
      await runMutant({
        label: 'm4 a no-op handler',
        why: 'a handler that paints nothing must leave `painted:false` and `applied === []` while the store doc-heads DID move',
        handler: () => undefined,
        reading: () => {
          const idle = drive.counters()
          const seam = (drive.host as unknown as { updatePane(id: string): Record<string, unknown> }).updatePane(DOC_NAV)
          return (
            `painted=${shown(seam?.['painted'])} applied=${shown(seam?.['applied'])} applies=${idle.applies} docHeads=${idle.docHeads} ` +
            `headsMoved=${headsMovedM4} rootsSameIdentity=${rootIds(beforeM4).every((id) => rootById(drive.roots(), id) === rootById(beforeM4, id))}`
          )
        },
        caught: () => {
          const seam = (drive.host as unknown as { updatePane(id: string): Record<string, unknown> }).updatePane(DOC_NAV)
          return (
            drive.counters().applies === 0 &&
            drive.counters().docHeads === 0 &&
            seam?.['painted'] === false &&
            fingerprint(seam?.['applied']) === fingerprint([]) &&
            rootIds(beforeM4).every((id) => rootById(drive.roots(), id) === rootById(beforeM4, id))
          )
        },
      })

    } finally {
      sandbox.restore()
    }

    // ---- (iii·m5) THE CENSUS READING, ON A LIVE SEED: the update applied by RE-ASSEMBLY instead of the paint ----------
    const m5Sandbox = await seeded({ events: true })
    try {
      problems.push(...m5Sandbox.bootProblems)
      const drive = m5Sandbox
      const channel = drive.channel
      interface Mutant {
        label: string
        why: string
        handler: () => void
        reading: () => string
        caught: () => boolean
      }
      const runMutant = async (mutant: Mutant): Promise<void> => {
        drive.resetCounters()
        const release = channel.subscribe(DOC_NAV, mutant.handler)
        try {
          channel.fire(DOC_NAV)
        } catch (error) {
          problems.push(`limb D6(iii) (${mutant.label}): the fire THREW (${String(error)}) — \`fire\` never throws, mutant or not`)
        }
        await settle()
        const reading = mutant.reading()
        mutants.push(`${mutant.label}: ${reading}`)
        if (!mutant.caught()) {
          problems.push(
            `limb D6(iii) (${mutant.label}): the mutant was NOT caught — ${mutant.why}. Reading: ${reading}. A harness that cannot SEE ` +
              `this mutant cannot prove the invariant it falsifies, so this arm is the row\'s own falsifier`,
          )
        }
        try {
          release()
        } catch {
          /* the withdrawal is the harness\'s own bookkeeping, never a row failure */
        }
      }
      if (!drive.hostSubscribed) {
        problems.push('limb D6(iii·m5): the mutant seed did not hand the host its `events` channel — the paint side of the same event is absent')
      }
      drive.setDocHeads(headsTwo())
      await runMutant({
        label: 'm5 re-assembly instead of the paint',
        why:
          "a handler that applies the update by `reDerive('content')` must read `snapshot >= 1` AND `docHeads >= 2` on the same " +
          'event (the paint\'s own re-read beside the re-assembly\'s fetch), and its applied list must name roots the pane does not own',
        handler: () => {
          void drive.host.reDerive('content')
        },
        reading: () => {
          const assembly = drive.counters()
          const answers = drive.applyAnswers()
          return (
            `refresh=${assembly.refresh} loadAppGraph=${assembly.loadAppGraph} mountOperator=${assembly.mountOperator} ` +
            `snapshot=${assembly.snapshot} docHeads=${assembly.docHeads} applies=${assembly.applies} applied=${shown(answers)} ` +
            `paneRootApplied=${shown(answers.some((ids) => ids.includes(`pane-${DOC_NAV}`)))}`
          )
        },
        caught: () => {
          const assembly = drive.counters()
          const answers = drive.applyAnswers()
          return (
            assembly.snapshot >= 1 &&
            assembly.docHeads >= 2 &&
            assembly.refresh === 0 &&
            assembly.loadAppGraph === 0 &&
            assembly.mountOperator === 0
          )
        },
      })
    } finally {
      m5Sandbox.restore()
    }

    // ---- (iv) m6 — THE TWO SOURCES COLLAPSED. THE SUBJECT IS THE DISCRIMINATOR, NOT THE COUNTERS: two FRESH seeds, the SAME
    // state, the ONLY difference the `store` member — the engine label versus a registry-legal name that is not the captured store.
    // If the two readings are identical, the engine label is being dropped by the same guard as a foreign name: the second source
    // is silently dead while `INV-E` holds perfectly.
    interface CollapseReading {
      label: string
      painted: boolean
      docHeads: number
      applies: number
      publishes: number
      fires: number
      refresh: number
      loadAppGraph: number
      mountOperator: number
      namesTheNewList: boolean
      reading: string
    }
    const measureCollapse = async (label: string, payload: Record<string, unknown>): Promise<CollapseReading | null> => {
      const drive = await seeded({ events: true })
      try {
        problems.push(...drive.bootProblems)
        const paneBefore = liveFrame(drive)
        if (paneBefore === undefined) {
          problems.push(`limb D6(iv) (m6 · ${label}): the seed carries no live \`pane-${DOC_NAV}\` frame — the discriminator has no pane`)
          return null
        }
        const appliesMark = drive.applyAnswers().length
        drive.setDocHeads(headsTwo())
        drive.resetCounters()
        problems.push(...(await deliverDescriptor(drive, payload, `D6·m6·${label}`)))
        const counters = drive.counters()
        const answers = drive.applyAnswers().slice(appliesMark)
        const paneAfter = liveFrame(drive)
        const painted = answers.some((ids) => ids.includes(`pane-${DOC_NAV}`))
        const namesTheNewList = paneAfter !== undefined && authoredText(paneAfter).includes(TITLE_C)
        return {
          label,
          painted,
          docHeads: counters.docHeads,
          applies: counters.applies,
          publishes: drive.publishChanges(),
          fires: drive.fires().length,
          refresh: counters.refresh,
          loadAppGraph: counters.loadAppGraph,
          mountOperator: counters.mountOperator,
          namesTheNewList,
          reading:
            `publishChange=${drive.publishChanges()} fires=${drive.fires().length} docHeads=${counters.docHeads} ` +
            `applies=${counters.applies} painted=${String(painted)} refresh=${counters.refresh} ` +
            `loadAppGraph=${counters.loadAppGraph} mountOperator=${counters.mountOperator} ` +
            `paneNamesTheNewList=${String(namesTheNewList)}`,
        }
      } finally {
        drive.restore()
      }
    }

    const engineReading = await measureCollapse('engine label', engineDescriptor())
    const foreignReading = await measureCollapse(`foreign registry-legal '${FOREIGN_REGISTRY_LEGAL}'`, localContentDescriptor(FOREIGN_REGISTRY_LEGAL))
    if (engineReading !== null && foreignReading !== null) {
      mutants.push(`m6 engine label: ${engineReading.reading}`)
      mutants.push(`m6 foreign name: ${foreignReading.reading}`)
      // THE COLLAPSE ITSELF: the two sources must be DISTINGUISHABLE. Equality in every discriminating dimension IS the mutant.
      const collapsed =
        engineReading.publishes === foreignReading.publishes &&
        engineReading.docHeads === foreignReading.docHeads &&
        engineReading.applies === foreignReading.applies &&
        engineReading.painted === foreignReading.painted &&
        engineReading.fires === foreignReading.fires &&
        engineReading.namesTheNewList === foreignReading.namesTheNewList
      if (collapsed) {
        problems.push(
          `limb D6(iv) (m6 — the two sources COLLAPSED): the engine label's reading is IDENTICAL to a foreign registry name's — ` +
            `\`${engineReading.reading}\` versus \`${foreignReading.reading}\`. \`INV-E\` holds PERFECTLY (0/0/0 on all three counters) ` +
            `while the second source is silently DEAD: with the engine branch absent, \`'${ENGINE_LABEL}'\` falls through to ` +
            `\`payload.store !== this.lastStore\` (it can never equal a registry name) and returns with no \`publishChange\`, no re-read, ` +
            `no paint — and the pane still names the OLD list while the store moved. THIS is the mutant the three counters cannot see, ` +
            `and its subject is the DISCRIMINATOR`,
        )
      }
      if (!engineReading.namesTheNewList && !engineReading.painted) {
        // A RECORDED reading, not a problem: the collapsed state is exactly what the m6 sentence predicts. It is printed in the
        // aggregate message below; the PROBLEM above is the equality of the two sources.
        mutants.push(`m6 pane staleness: the engine delivery left the pane naming the old list while the store's doc-heads moved`)
      }
      // THE FLOOR (so the equality above is not two dead harnesses): a LOCAL descriptor on the SAME state DOES move the pane.
      // `D1` grades it in full; here one boolean reading floors m6's comparison.
      const localDrive = await seeded({ events: true })
      try {
        problems.push(...localDrive.bootProblems)
        localDrive.setDocHeads(headsTwo())
        localDrive.resetCounters()
        const localMark = localDrive.applyAnswers().length
        problems.push(...(await deliverDescriptor(localDrive, localContentDescriptor(), 'D6·m6·floor')))
        const localPainted = localDrive.applyAnswers().slice(localMark).some((ids) => ids.includes(`pane-${DOC_NAV}`))
        mutants.push(`m6 floor (a LOCAL descriptor on the same state): docHeads=${localDrive.counters().docHeads} painted=${String(localPainted)}`)
        if (!localPainted) {
          problems.push(
            `limb D6(iv) (m6 floor): a LOCAL descriptor on the same state painted NOTHING on this harness — the collapse comparison ` +
              `would be two silent readings, so it could not discriminate anything`,
          )
        }
      } finally {
        localDrive.restore()
      }
    }

    expect(
      problems,
      `limb D6 — INV-E and its SIX mutants (§6 D6; §1's "the row must be able to FAIL"; \`B3-ADV-01\`). ${problems.length} ` +
        `problem(s). The channel-driven pane update must read \`0 refresh()\` / \`0 loadAppGraph\` / \`0 mountOperator\` AND ` +
        `\`0 snapshot\` / \`0 security\` / \`0 backlinks\` on a paint that LANDED; each of the six mutants must be CAUGHT and each ` +
        `prints its computed reading: ${mutants.length > 0 ? mutants.join(' · ') : '(no mutant could be driven)'}. envelope-class — ` +
        `the REAL SidebarPanes over the layout-less DOM shim, the counters wrapped on the instance; no rendered box, no computed ` +
        `style, no pointer (G8-only, §8)`,
    ).toEqual([])
  })

  it('D7 — a SUPERSEDED `doc-heads` answer is DROPPED, never committed or painted: two issues, the SECOND resolved first, then the first with an older list — while the SAME deferred answered with NO newer issue DOES commit and paint', async () => {
    // §6 `D7` (`ASM-B6-3`, this unit's ONE structure): an UNCOALESCED fire puts N `docHeads` answers in flight; they can land out of
    // order and a stale one committed LAST paints a stale list with NO later fire to correct it. The fix is a host-owned monotone
    // GENERATION: the answer that no longer holds the newest generation is DROPPED — not committed, not painted.
    // LAYER: envelope-class — a hand-controlled `bridge.rag.docHeads` promise, the host's committed `lastDocHeads`, the
    // `applyContentReconcile` census, the paint's verdicts and the AUTHORED envelope text.
    // NON-VACUITY: the SUPERSEDED shot is answered with a THIRD, distinct list (`headsStale`, title `TITLE_STALE`) that neither the
    // standing list nor the newer one carries, so "not committed and not painted" compares two different values; and the CONTROL
    // answers the SAME deferred with NO newer issue and MUST commit and paint — so the row cannot pass by dropping every answer.
    // MUTATION THAT WOULD RED IT: the landed head issues NO re-read at all (no `doc-nav` arm) so there is no generation to supersede
    // — the census arm reds; a re-read with no stamp commits AND paints the older list (its `lastDocHeads` and authored-text arms
    // red); a stamp that drops EVERY post-await answer reds the CONTROL; a stamp that drops the answer but still paints reds the
    // "no apply attributed to it" and the verdict arms.
    const problems: string[] = []

    // ---- SHOT A: TWO ISSUES, THE SECOND RESOLVED FIRST, THE FIRST RESOLVED WITH AN OLDER LIST ------
    const drive = await seeded({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const hostPrivates = drive.host as unknown as Record<string, unknown>
      const pane = liveFrame(drive)
      if (pane === undefined) {
        problems.push(`limb D7: the seed carries no live \`pane-${DOC_NAV}\` frame (roots: [${rootIds(drive.roots()).join(', ')}]) — the race has no pane`)
      }
      if (pane !== undefined && authoredText(pane).includes(TITLE_C)) {
        problems.push(`limb D7: the live frame already authors \`${TITLE_C}\` — the newer list is not a movement`)
      }
      const first = deferredOf<Record<string, unknown>>()
      const second = deferredOf<Record<string, unknown>>()
      // The ordinals are RELATIVE to the installation (the boot's own `doc-heads` fetch came before it), and the counters are reset
      // here so `docHeads` counts the two ISSUES below and never the seed's.
      drive.setDocHeadsAnswer((ordinal) => (ordinal === 1 ? first.promise : second.promise))
      drive.resetCounters()

      // ISSUE #1, then ISSUE #2 — both in flight (the uncoalesced fire, `O-2`).
      problems.push(...(await deliverDescriptor(drive, localContentDescriptor(), 'D7·issue1')))
      problems.push(...(await deliverDescriptor(drive, localContentDescriptor(), 'D7·issue2')))
      const issued = drive.counters().docHeads
      if (issued !== 2) {
        problems.push(
          `limb D7: the two local descriptors made ${issued} \`rag.docHeads\` call(s), not 2 — §3/\`O-2\`: an UNCOALESCED fire issues ` +
            `one re-read per descriptor, and the race this row grades needs TWO answers in flight (one re-read = nothing can be ` +
            `superseded). Counters: ${countersReading(drive.counters())}`,
        )
      }

      // #2 LANDS FIRST — the newest generation commits and paints.
      second.resolve(docHeadsPayload(headsTwo()))
      await settle()
      const afterNewer = hostPrivates['lastDocHeads']
      if (fingerprint(afterNewer) !== fingerprint(headsTwo())) {
        problems.push(
          `limb D7: after the NEWER answer resolved, \`lastDocHeads\` reads ${shown(afterNewer)}, not ${shown(headsTwo())} — the ` +
            `newest generation always commits`,
        )
      }
      if (!authoredText(liveFrame(drive)).includes(TITLE_C)) {
        problems.push(
          `limb D7: after the NEWER answer resolved the pane does not author \`${TITLE_C}\` (authored: ` +
            `${shown(authoredText(liveFrame(drive)))}) — the newest generation always paints`,
        )
      }

      // #1 LANDS LAST with an OLDER list — it must be DROPPED.
      const appliesMark = drive.applyAnswers().length
      const verdictMark = drive.verdicts().length
      first.resolve(docHeadsPayload(headsStale()))
      await settle()
      const afterStale = hostPrivates['lastDocHeads']
      if (fingerprint(afterStale) === fingerprint(headsStale())) {
        problems.push(
          `limb D7: the SUPERSEDED answer was COMMITTED into \`lastDocHeads\` (${shown(afterStale)} — the older list, title ` +
            `\`${TITLE_STALE}\`) — \`ASM-B6-3\`: the re-read carries a GENERATION captured before the \`await\` and compared after it, ` +
            `and an answer that no longer holds the newest generation is DROPPED, not committed`,
        )
      }
      if (fingerprint(afterStale) !== fingerprint(headsTwo())) {
        problems.push(
          `limb D7: after the stale answer landed, \`lastDocHeads\` reads ${shown(afterStale)}, not the newer list ` +
            `(${shown(headsTwo())}) — a dropped answer leaves the live list standing, never a third value`,
        )
      }
      const laterApplies = drive.applyAnswers().slice(appliesMark)
      if (laterApplies.length !== 0) {
        problems.push(
          `limb D7: the stale answer reached \`applyContentReconcile\` ${laterApplies.length} time(s) (${shown(laterApplies)}) — NO ` +
            `apply may be attributed to a superseded answer (\`ASM-B6-3\`: "not committed, not painted")`,
        )
      }
      const laterVerdicts = drive.verdicts().slice(verdictMark)
      const paintedByStale = laterVerdicts.filter(
        (verdict) => verdict['painted'] === true || fingerprint(verdict['applied']) !== fingerprint([]),
      )
      if (paintedByStale.length > 0) {
        problems.push(
          `limb D7: the stale answer produced a PAINTING verdict ${shown(paintedByStale)} — a superseded answer must be dropped ` +
            `BEFORE the paint (a surviving paint legitimately answers \`unchanged\`: \`painted:false\`, \`applied: []\`)`,
        )
      }
      const settledText = authoredText(liveFrame(drive))
      if (settledText.includes(TITLE_STALE)) {
        problems.push(
          `limb D7: the superseded list's title \`${TITLE_STALE}\` was PAINTED into the pane (authored: ${shown(settledText)}) — the ` +
            `stale answer is committed AND painted, the defect \`ASM-B6-3\` exists to prevent`,
        )
      }
      if (!settledText.includes(TITLE_C)) {
        problems.push(
          `limb D7: after the stale answer landed the pane no longer authors the newer list's \`${TITLE_C}\` (authored: ` +
            `${shown(settledText)}) — a dropped answer must leave the live list's text untouched`,
        )
      }
    } finally {
      drive.restore()
    }

    // ---- SHOT B: THE CONTROL — THE SAME DEFERRED, WITH NO NEWER ISSUE, MUST COMMIT AND PAINT ---------
    const control = await seeded({ events: true })
    try {
      problems.push(...control.bootProblems)
      const controlPrivates = control.host as unknown as Record<string, unknown>
      const late = deferredOf<Record<string, unknown>>()
      control.setDocHeadsAnswer(() => late.promise)
      // ⟨CORRECTED — THE CONTROL'S `docHeads` ARM WAS CUMULATIVE.⟩ As authored this shot never called `resetCounters()`, so its
      // `docHeads !== 1` arm counted the SEED's own fetch too. MEASURED: 2 = the boot's `docHeads()` fetch (1) + the controlled
      // descriptor's re-read (1); it passed at the pre-landing head only because the boot fetch alone happened to equal 1 — a
      // vacuous pass of exactly the kind this file's NON-VACUITY notes forbid. Resetting HERE, after the answer is installed and
      // before the delivery, makes the arm a reading of THE DESCRIPTOR. Nothing else in this shot changes.
      control.resetCounters()
      problems.push(...(await deliverDescriptor(control, localContentDescriptor(), 'D7·control')))
      if (control.counters().docHeads !== 1) {
        problems.push(
          `limb D7(control): the controlled descriptor made ${control.counters().docHeads} \`rag.docHeads\` call(s), not 1 — the ` +
            `control has no answer to hold`,
        )
      }
      const controlMark = control.applyAnswers().length
      late.resolve(docHeadsPayload(headsTwo()))
      await settle()
      if (fingerprint(controlPrivates['lastDocHeads']) !== fingerprint(headsTwo())) {
        problems.push(
          `limb D7(control): the SAME deferred answered with NO newer issue was NOT committed (\`lastDocHeads\` reads ` +
            `${shown(controlPrivates['lastDocHeads'])}, not ${shown(headsTwo())}) — nothing superseded it, so the answer is CURRENT: ` +
            `a row that dropped this one too would pass shot A by dropping EVERYTHING`,
        )
      }
      const controlApplies = control.applyAnswers().slice(controlMark)
      if (!controlApplies.some((ids) => ids.includes(`pane-${DOC_NAV}`))) {
        problems.push(
          `limb D7(control): the current answer painted NOTHING (applies since the answer: ${shown(controlApplies)}) — the deferred ` +
            `answered with no newer issue must commit AND paint, which is the positive half of this row`,
        )
      }
      if (!authoredText(liveFrame(control)).includes(TITLE_C)) {
        problems.push(
          `limb D7(control): the pane does not author \`${TITLE_C}\` after the current answer landed (authored: ` +
            `${shown(authoredText(liveFrame(control)))}) — "the answer commits and paints" must be visible in the AUTHORED pane, not ` +
            `only in the counter`,
        )
      }
    } finally {
      control.restore()
    }

    expect(
      problems,
      `limb D7 — a SUPERSEDED answer is dropped, never committed or painted (§6 D7; \`ASM-B6-3\`). ${problems.length} problem(s). ` +
        `With re-read #1 in flight and re-read #2 issued after it, resolving #2 first and then #1 with an older list must leave ` +
        `\`lastDocHeads\` on #2's list, apply NO root for \`pane-${DOC_NAV}\` for #1 and never author \`${TITLE_STALE}\`; the SAME ` +
        `deferred answered with NO newer issue MUST commit and paint \`${TITLE_C}\` (the control that stops the row from passing by ` +
        `dropping every answer). envelope-class — the REAL host over the layout-less DOM shim; no rendered box, no style, no pointer ` +
        `(G8-only, §8)`,
    ).toEqual([])
  })

  it('D9 — a DISABLED pane is not re-read: a disabled `doc-nav`, `settings`\' operator scope and an unknown id each cost 0 `docHeads` and the paint answers its own declared word — the operator pane\'s being the operator surface\'s own paint word — while ENABLING it makes the same descriptor re-read exactly once', async () => {
    // §6 `D9` (§3: "The re-read's GATE is the paint's own census" — `not-a-pane`/`not-enabled`; the words
    // `not-mounted`/`no-runtime` are deliberately NOT gated on, being transient boot states). ⟨RE-STATED BY UNIT `B-9`
    // (`docs/L1/unit-b-9-pane-operator-settings.md` §3, §6 `O4`/`S1`; §4 `F-9`) — THE OPERATOR ARM'S WORD CHANGED, ITS TEETH DID
    // NOT: this arm used to require `settings` to answer `operator-scope`, because `paintPane`'s step 2 REFUSED every `operator`-scope
    // registration. §3 replaced that refusal with a ROUTE to the operator surface's own retained-graph paint (`paintOperatorPane`), so
    // on this harness — which HAS an operator mount and a mounted `settings` pane — the answer is the paint's own word: `unchanged`
    // (the re-authored section is shape-equal to the retained one) or `painted`. The row's teeth are untouched and still read here:
    // ZERO `rag.docHeads` calls and ZERO `applyContentReconcile`.⟩
    // LAYER: envelope-class — the re-read census, the paint's own declared verdicts and call counts.
    // NON-VACUITY: the CONTROL on a second seed is the SAME descriptor on the same state with the pane ENABLED, and it must re-read
    // exactly once — so the three zeros above cannot be satisfied by a host that never re-reads anything.
    // MUTATION THAT WOULD RED IT: the naive arm (a re-read BEFORE the gate, or a gate spelled as a lookup that ignores
    // `isEnabled`) reds the disabled arm; gating on `not-mounted`/`no-runtime` instead of the three facts the census answers reds the
    // declared-word arms; an arm that re-reads for an `operator`-scope id reds the `settings` arm (⟨`B-9` §3⟩ its lawful answer is the
    // operator paint's own word, and the ZERO `rag.docHeads` reading is what still forbids a re-read there); a host that never
    // re-reads reds the control.
    const problems: string[] = []

    // ---- (a) THE DISABLED PANE, THE OPERATOR SCOPE AND THE UNKNOWN ID -------------------------------
    const gate = await seeded({ events: true })
    try {
      problems.push(...gate.bootProblems)
      const absent = readMember(gate.host, 'paintReplumbedPane', `the REAL \`SidebarPanes\` instance (${SIDEBAR_FILE})`, 'D9')
      problems.push(...absent)
      if (absent.length === 0) {
        const paint = (gate.host as unknown as { paintReplumbedPane(id: string): Promise<void> }).paintReplumbedPane.bind(gate.host)
        // `doc-nav` is DISABLED after boot: the pane still has a frame (the boot assembled it while enabled), so the ONLY reason it
        // may not be re-read is the ENABLED census — which is exactly the gate this row grades.
        if (gate.registry.isEnabled(DOC_NAV) !== true) {
          problems.push('limb D9: the seed did not leave `doc-nav` ENABLED before the arm disables it — the transition has no subject')
        }
        gate.registry.disable(DOC_NAV)
        if (gate.registry.isEnabled(DOC_NAV) !== false) {
          problems.push('limb D9: `registry.disable(\'doc-nav\')` did not take — the disabled arm has no subject')
        }
        // ⟨RE-STATED BY UNIT `B-9` §3⟩ Each arm now names the SET of words it accepts, so the operator arm can demand the paint's own
        // vocabulary without weakening any other arm: the disabled-`doc-nav` arm and the unknown-id arm still accept EXACTLY ONE word.
        const arms: Array<[string, readonly string[], string]> = [
          [DOC_NAV, ['not-enabled'], 'a DISABLED `doc-nav`'],
          [
            SETTINGS,
            ['unchanged', 'painted'],
            '`settings` (the operator scope — ⟨UNIT `B-9` §3⟩ its paint is the operator surface\'s OWN retained-graph paint, so the word is the paint\'s, not the deleted `operator-scope` refusal)',
          ],
          [UNKNOWN_PANE, ['not-a-pane'], `the unknown id \`${UNKNOWN_PANE}\``],
        ]
        for (const [paneId, words, label] of arms) {
          gate.setDocHeads(headsTwo())
          gate.resetCounters()
          const mark = gate.verdicts().length
          let threw = ''
          try {
            await paint(paneId)
          } catch (error) {
            threw = String(error)
          }
          await settle()
          if (threw !== '') {
            problems.push(`limb D9: \`paintReplumbedPane('${paneId}')\` THREW (${threw}) — the paint is an event handler's arm and never a throw site`)
          }
          const counters = gate.counters()
          if (counters.docHeads !== 0) {
            problems.push(
              `limb D9: ${label} cost ${counters.docHeads} \`rag.docHeads\` call(s) — §3: a pane that renders NO frame must not be ` +
                `re-read (an IPC that can change nothing). The naive arm re-reads FIRST and reds here. Counters: ${countersReading(counters)}`,
            )
          }
          if (counters.applies !== 0) {
            problems.push(`limb D9: ${label} reached \`applyContentReconcile\` ${counters.applies} time(s) — no frame, no root`)
          }
          const verdicts = gate.verdicts().slice(mark)
          if (verdicts.length !== 1) {
            problems.push(
              `limb D9: ${label} produced ${verdicts.length} verdict(s) ${shown(verdicts)}, not exactly ONE — the paint still ANSWERS ` +
                `(its declared word is the reading), it just does not re-read`,
            )
          } else if (!words.includes(String(verdicts[0]['reason']))) {
            problems.push(
              `limb D9: ${label} answered \`reason: ${shown(verdicts[0]['reason'])}\`, not the declared word ` +
                `\`'${shown([...words])}'\` — the paint's closed vocabulary distinguishes one wiring fault from another`,
            )
          }
        }
      }
    } finally {
      gate.restore()
    }

    // ---- (b) THE CONTROL: ENABLED, THE SAME DESCRIPTOR RE-READS EXACTLY ONCE ------------------------
    const enabled = await seeded({ events: true })
    try {
      problems.push(...enabled.bootProblems)
      if (enabled.registry.isEnabled(DOC_NAV) !== true) {
        problems.push('limb D9(control): `doc-nav` is NOT enabled on the control seed — the enabled arm has no subject')
      }
      enabled.setDocHeads(headsTwo())
      enabled.resetCounters()
      problems.push(...(await deliverDescriptor(enabled, localContentDescriptor(), 'D9·control')))
      const controlCounters = enabled.counters()
      if (controlCounters.docHeads !== 1) {
        problems.push(
          `limb D9(control): with \`doc-nav\` ENABLED the same descriptor made ${controlCounters.docHeads} \`rag.docHeads\` call(s), ` +
            `not EXACTLY ONE — the zeroes in (a) are only a reading of the GATE beside a re-read that a correctly gated host DOES make. ` +
            `Counters: ${countersReading(controlCounters)}`,
        )
      }
    } finally {
      enabled.restore()
    }

    expect(
      problems,
      `limb D9 — a disabled pane is not re-read (§6 D9; §3's gate = the paint's own census; ⟨RE-STATED BY UNIT \`B-9\` §3⟩ the ` +
        `operator arm now names the paint's words). ${problems.length} problem(s). A ` +
        `DISABLED \`${DOC_NAV}\`, the operator-scope \`${SETTINGS}\` and the unknown \`${UNKNOWN_PANE}\` must each cost 0 ` +
        `\`rag.docHeads\` calls and answer their own declared word (\`not-enabled\` / the operator surface's own ` +
        `\`unchanged\`|\`painted\` / \`not-a-pane\`), while the ` +
        `SAME descriptor with the pane ENABLED re-reads exactly once. envelope-class — the REAL host over the layout-less DOM shim; no ` +
        `rendered box, no pointer (G8-only)`,
    ).toEqual([])
  })

  it('D10 — the two DATA-BACKED panes do not cross-re-read: a `doc-nav` update calls `docHeads` 1 / `backlinks` 0, and a `crosslinks` update calls `backlinks` 1 / `docHeads` 0', async () => {
    // §6 `D10` (`B-5`'s rows may not be weakened; the two data-backed panes' re-read arms are separate declared arms, and a shared
    // "re-read everything" arm would double the cost `O-2` records).
    // LAYER: envelope-class — the bridge's per-call census (`docHeads` vs `backlinks`), the two paints' verdicts and the counters.
    // NON_VACUITY: each direction is measured on the SAME seed with the OTHER counter asserted at 0 and the pane's OWN counter at
    // 1 — a harness whose bridge methods are not counted would read 0/0 in both rows, so the 1s are the floor of the 0s.
    // MUTATION THAT WOULD RED IT: one generic re-read arm calling both bridge methods reds both directions' 0s; a `crosslinks`
    // re-read suppressed by the new `doc-nav` arm reds the second direction's `backlinks === 1`; a `doc-nav` arm that reuses the
    // snapshot (a re-assembly) reds the first direction's `docHeads === 1`.
    const problems: string[] = []
    const drive = await seeded({ events: true })
    try {
      problems.push(...drive.bootProblems)

      // ---- (a) A `doc-nav` UPDATE: docHeads 1, backlinks 0 ------------------------------------------
      drive.setDocHeads(headsTwo())
      drive.resetCounters()
      problems.push(...(await deliverDescriptor(drive, localContentDescriptor(), 'D10·doc-nav')))
      const docNavCounters = drive.counters()
      if (docNavCounters.docHeads !== 1) {
        problems.push(
          `limb D10(a): a \`${DOC_NAV}\` update made ${docNavCounters.docHeads} \`rag.docHeads\` call(s), not EXACTLY ONE — §3's arm ` +
            `is ONE call committed to \`lastDocHeads\`. Counters: ${countersReading(docNavCounters)}`,
        )
      }
      if (docNavCounters.backlinks !== 0) {
        problems.push(
          `limb D10(a): a \`${DOC_NAV}\` update also called \`rag.backlinks\` ${docNavCounters.backlinks} time(s) — the ` +
            `\`${CROSSLINKS}\` pane's re-read is a DIFFERENT declared arm (§4: "a pane with no re-read arm is \`B-3\`'s behaviour"; ` +
            `the arms are per-pane, never one generic "re-read everything")`,
        )
      }

      // ---- (b) A `crosslinks` UPDATE: backlinks 1, docHeads 0 ---------------------------------------
      const crosslinksLive = rootById(drive.roots(), `pane-${CROSSLINKS}`)
      if (crosslinksLive === undefined) {
        problems.push(`limb D10(b): the seed carries no live \`pane-${CROSSLINKS}\` frame (roots: [${rootIds(drive.roots()).join(', ')}]) — the second direction has no pane`)
      }
      drive.resetCounters()
      const report = drive.channel.fire(CROSSLINKS)
      await settle()
      if (report.fired !== true) {
        problems.push(`limb D10(b): \`fire('${CROSSLINKS}')\` answered ${shown(report)} — \`B-5\`'s registration must still stand (this unit may not weaken it)`)
      }
      const crossCounters = drive.counters()
      if (crossCounters.backlinks !== 1) {
        problems.push(
          `limb D10(b): a \`${CROSSLINKS}\` update made ${crossCounters.backlinks} \`rag.backlinks\` call(s), not EXACTLY ONE — ` +
            `\`B-5\`'s arm stays byte-for-byte. Counters: ${countersReading(crossCounters)}`,
        )
      }
      if (crossCounters.docHeads !== 0) {
        problems.push(
          `limb D10(b): a \`${CROSSLINKS}\` update also called \`rag.docHeads\` ${crossCounters.docHeads} time(s) — the two ` +
            `data-backed panes must NOT cross-re-read: a shared arm would double every pane update's cost (\`O-2\`)`,
        )
      }
      if (crossCounters.refresh !== 0 || crossCounters.loadAppGraph !== 0 || crossCounters.mountOperator !== 0) {
        problems.push(`limb D10(b): the \`${CROSSLINKS}\` update read ${countersReading(crossCounters)} — \`INV-E\` holds for it too`)
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb D10 — the two data-backed panes do not cross-re-read (§6 D10; §3's per-pane arms). ${problems.length} problem(s). A ` +
        `\`${DOC_NAV}\` update must call \`rag.docHeads\` ONCE and \`rag.backlinks\` ZERO times; a \`${CROSSLINKS}\` update must call ` +
        `\`rag.backlinks\` ONCE and \`rag.docHeads\` ZERO times, with the three \`INV-E\` counters at 0/0/0. envelope-class — the REAL ` +
        `host over the layout-less DOM shim, the bridge's per-method census; no rendered box, no pointer (G8-only)`,
    ).toEqual([])
  })

  it('D11 — the TWO FAILURE DISCIPLINES of the re-read: a REJECTING `bridge.rag.docHeads` KEEPS the last-known `lastDocHeads` and the paint STILL runs, and a NON-ARRAY `documents` keeps the last-known list while an ARRAY (even empty) IS committed', async () => {
    // §6 has no row for these and `docs/L3/shell-chrome/pane-doc-nav.md` §7 says so in as many words: "The two failure disciplines
    // are stated but UNGRADED by any row: a REJECTING `bridge.rag.docHeads` and a non-array `documents` (L2 §6 orders both — keep
    // the last-known list, still paint). No row drives either, so both are DESIGN obligations on L4, not readings." THIS row is
    // that reading, and it grades the LANDED behaviour of `paintReplumbedPane`'s `doc-nav` arm, where nothing else in this file does:
    //   (a) a bridge ERROR keeps the last-known list — the catch does NOT clear `lastDocHeads`, and the arm still falls through to
    //       `updatePane('doc-nav')`, so ONE verdict exists even though nothing was committed;
    //   (b) `documents` that is NOT an array is DISCARDED (the last-known list stands, never a half-commit, never a throw), while an
    //       ARRAY is committed EVEN WHEN EMPTY — the pane then authors its own `(no documents)` empty state rather than throwing.
    // LAYER: envelope-class — the REAL `SidebarPanes` booted through the PUBLIC `boot(runtime)` over the LAYOUT-LESS DOM shim against
    // a COUNTING bridge, and the observables are the bridge's call census, the host's committed `lastDocHeads`, the paint's own
    // verdict, the `applyContentReconcile` census and the AUTHORED envelope's text. What this layer can NEVER read, named so nobody
    // quotes it: a real window's frame re-mint, the pane as a user sees it, any box/style/scroll/pointer, the NUMBER of IPCs on the
    // wire (the census counts BRIDGE calls), and the THIRD failure state — a `bridge.rag.docHeads` that NEVER SETTLES, where the
    // paint does not run at all (`D-82` clause 4 refuses a timer, so that limit is named, not defended).
    // NON-VACUITY: (b)'s LAST shot is the floor under (a) and (b)'s first shot — the SAME harness, the SAME descriptor shape, the
    // SAME `lastDocHeads` field, only the ANSWER differing, and that shot really DOES move the committed field and really DOES land a
    // paint. So "the list was kept" is a reading of the discipline and not of a harness that can never commit; and every negative
    // arm below NAMES the counter it read, in its own message.
    // MUTATION THAT WOULD RED IT: a catch that CLEARS `lastDocHeads` (a "reset on error" reflex) reds (a)'s kept-list arm; a catch
    // that returns before the paint reds (a)'s one-verdict arm and its `applied: []` arm; a bridge error that escapes as an unhandled
    // rejection reds the delivery's own no-throw arm (`deliverDescriptor` names it); an arm that commits a NON-array `documents`
    // reds (b)'s kept-list arm; an arm that refuses an EMPTY array (e.g. `documents.length > 0`) reds (b)'s committed-`[]` arm and
    // the authored `(no documents)` arm; an arm that THROWS on either shape reds every arm above it.
    const problems: string[] = []
    const drive = await seeded({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const hostPrivates = drive.host as unknown as Record<string, unknown>

      // ---- THE SEED'S FLOOR: the boot's OWN fetch committed `headsOne()` (so "kept", "cleared" and "a third value" differ) ----
      if (fingerprint(hostPrivates['lastDocHeads']) !== fingerprint(headsOne())) {
        problems.push(
          `limb D11: the seed's \`lastDocHeads\` reads ${shown(hostPrivates['lastDocHeads'])}, not the boot list the bridge answered ` +
            `(${shown(headsOne())}) — the "the last-known list is KEPT" arms would have nothing to be kept`,
        )
      }
      const liveBefore = liveFrame(drive)
      if (liveBefore === undefined) {
        problems.push(`limb D11: the seed carries no live \`pane-${DOC_NAV}\` frame (roots: [${rootIds(drive.roots()).join(', ')}]) — the paint's survival has no subject`)
      } else if (!authoredText(liveBefore).includes('Doc A')) {
        problems.push(
          `limb D11: the seed's live frame does not author the boot list's title \`Doc A\` (authored: ${shown(authoredText(liveBefore))}) ` +
            `— the floor under "the pane still authors the last-known list" is absent`,
        )
      }

      // ---- (a) A REJECTING BRIDGE: THE RE-READ HAPPENS, THE LIST IS KEPT, THE PAINT STILL RUNS ------------------------
      drive.setDocHeadsAnswer(() => Promise.reject(new Error('b6 doc-heads bridge failure')))
      drive.resetCounters()
      const rejectionProblems = await deliverDescriptor(drive, localContentDescriptor(), 'D11·a')
      problems.push(...rejectionProblems)
      const rejectionCounters = drive.counters()
      if (rejectionCounters.docHeads !== 1) {
        problems.push(
          `limb D11(a): the rejecting bridge read docHeads=${rejectionCounters.docHeads}, not EXACTLY ONE — §3: the arm is ONE ` +
            `\`bridge.rag.docHeads()\` call whether it ANSWERS or REJECTS, so the discipline has no subject unless the call happened. ` +
            `Counters: ${countersReading(rejectionCounters)}`,
        )
      }
      if (fingerprint(hostPrivates['lastDocHeads']) !== fingerprint(headsOne())) {
        problems.push(
          `limb D11(a): after a REJECTING \`rag.docHeads\` the host's \`lastDocHeads\` reads ` +
            `${shown(hostPrivates['lastDocHeads'])}, not the last-known list (${shown(headsOne())}) — §3: "a bridge error keeps the ` +
            `last-known list (the \`refresh()\` discipline)": the catch must not clear it, and no third value may appear`,
        )
      }
      const rejectionVerdicts = drive.verdicts().filter((verdict) => verdict['paneId'] === DOC_NAV)
      if (rejectionVerdicts.length !== 1) {
        problems.push(
          `limb D11(a): the rejecting re-read produced ${rejectionVerdicts.length} \`${DOC_NAV}\` verdict(s) ` +
            `${shown(rejectionVerdicts)}, not EXACTLY ONE — §3: the paint STILL RUNS after a bridge error; the catch covers the ` +
            `RE-READ, never the paint. \`applyContentReconcile\` calls: ${rejectionCounters.applies}`,
        )
      } else {
        if (rejectionVerdicts[0]['painted'] !== false) {
          problems.push(
            `limb D11(a): the surviving verdict reads \`painted\` = ${shown(rejectionVerdicts[0]['painted'])} — nothing was committed, ` +
              `so the re-render is shape-equal and the paint may lawfully answer \`unchanged\`; a \`painted:true\` would claim a root ` +
              `moved for an answer that never arrived`,
          )
        }
        if (fingerprint(rejectionVerdicts[0]['applied']) !== fingerprint([])) {
          problems.push(
            `limb D11(a): the surviving verdict's \`applied\` reads ${shown(rejectionVerdicts[0]['applied'])}, not \`[]\` — a rejected ` +
              `answer has no root to apply`,
          )
        }
      }
      if (rejectionCounters.applies !== 0) {
        problems.push(
          `limb D11(a): the rejecting re-read reached \`applyContentReconcile\` ${rejectionCounters.applies} time(s) — the last-known ` +
            `list is already authored, so a rejection paints NOTHING`,
        )
      }
      if (rejectionCounters.refresh !== 0 || rejectionCounters.loadAppGraph !== 0 || rejectionCounters.mountOperator !== 0) {
        problems.push(
          `limb D11(a): the rejecting re-read read ${countersReading(rejectionCounters)} — \`INV-E\` (0 \`refresh()\` / 0 ` +
            `\`loadAppGraph\` / 0 \`mountOperator\`) holds on a FAILED re-read exactly as on a successful one`,
        )
      }
      const afterRejection = liveFrame(drive)
      if (afterRejection !== undefined && !authoredText(afterRejection).includes('Doc A')) {
        problems.push(
          `limb D11(a): the pane no longer authors the last-known list's \`Doc A\` after the rejection (authored: ` +
            `${shown(authoredText(afterRejection))}) — a kept list must still be the list the pane renders`,
        )
      }

      // ---- (b·1) A NON-ARRAY `documents`: KEPT, NEVER HALF-COMMITTED -------------------------------------------------
      drive.setDocHeadsAnswer(() => Promise.resolve({ documents: 'not-an-array' }))
      drive.resetCounters()
      problems.push(...(await deliverDescriptor(drive, localContentDescriptor(), 'D11·b·non-array')))
      const scalarCounters = drive.counters()
      if (scalarCounters.docHeads !== 1) {
        problems.push(
          `limb D11(b): the non-array answer read docHeads=${scalarCounters.docHeads}, not EXACTLY ONE — the shape clause has no ` +
            `subject unless the re-read happened. Counters: ${countersReading(scalarCounters)}`,
        )
      }
      if (fingerprint(hostPrivates['lastDocHeads']) !== fingerprint(headsOne())) {
        problems.push(
          `limb D11(b): after an answer whose \`documents\` is the STRING 'not-an-array', \`lastDocHeads\` reads ` +
            `${shown(hostPrivates['lastDocHeads'])}, not the last-known list (${shown(headsOne())}) — §3: a non-array \`documents\` ` +
            `keeps the last-known list, never a half-commit and never a throw`,
        )
      }
      if (scalarCounters.applies !== 0) {
        problems.push(
          `limb D11(b): the non-array answer reached \`applyContentReconcile\` ${scalarCounters.applies} time(s) — the rendered list ` +
            `did not move, so no root may move`,
        )
      }
      const afterScalar = liveFrame(drive)
      if (afterScalar === undefined) {
        problems.push(`limb D11(b): the pane's frame VANISHED after the non-array answer — a kept list leaves the frame standing`)
      } else if (!authoredText(afterScalar).includes('Doc A')) {
        problems.push(
          `limb D11(b): the pane does not author the last-known \`Doc A\` after the non-array answer (authored: ` +
            `${shown(authoredText(afterScalar))}) — the kept list must still be what the pane renders`,
        )
      }

      // ---- (b·2) AN ARRAY — EVEN EMPTY — IS COMMITTED, AND THE PANE AUTHORS ITS EMPTY STATE --------------------------
      // THE FLOOR UNDER EVERY ZERO ABOVE: the SAME harness, the SAME descriptor, the SAME field — only the ANSWER differs — and this
      // shot really does commit `[]` and really does land a paint, so (a)'s and (b·1)'s kept-list arms are readings of a discipline.
      drive.setDocHeadsAnswer(() => Promise.resolve({ documents: [] }))
      drive.resetCounters()
      problems.push(...(await deliverDescriptor(drive, localContentDescriptor(), 'D11·b·empty-array')))
      const emptyCounters = drive.counters()
      if (emptyCounters.docHeads !== 1) {
        problems.push(
          `limb D11(b·2): the empty-array answer read docHeads=${emptyCounters.docHeads}, not EXACTLY ONE — the commit clause has no ` +
            `subject unless the re-read happened. Counters: ${countersReading(emptyCounters)}`,
        )
      }
      if (fingerprint(hostPrivates['lastDocHeads']) !== fingerprint([])) {
        problems.push(
          `limb D11(b·2): after an answer whose \`documents\` is the ARRAY \`[]\`, \`lastDocHeads\` reads ` +
            `${shown(hostPrivates['lastDocHeads'])}, not \`[]\` — §3: an ARRAY is committed EVEN WHEN EMPTY; refusing an empty array ` +
            `would leave the pane naming documents the store no longer has`,
        )
      }
      const emptyFrame = liveFrame(drive)
      if (emptyFrame === undefined) {
        problems.push(`limb D11(b·2): the pane's frame VANISHED across the empty-array commit — the empty state has no subject`)
      } else if (!authoredText(emptyFrame).includes('(no documents)')) {
        problems.push(
          `limb D11(b·2): after committing \`[]\` the pane authors ${shown(authoredText(emptyFrame))}, not its own ` +
            `\`(no documents)\` empty state — \`docNavContent\` authors that state from an EMPTY list rather than throwing, which is ` +
            `the second half of §3's discipline`,
        )
      }
      if (emptyCounters.applies < 1) {
        problems.push(
          `limb D11(b·2): the empty-array commit reached \`applyContentReconcile\` ${emptyCounters.applies} time(s) — the rendered ` +
            `list MOVED to the empty state, so the paint must land (this is the positive reading the kept-list zeroes rest on)`,
        )
      }
      if (emptyCounters.refresh !== 0 || emptyCounters.loadAppGraph !== 0 || emptyCounters.mountOperator !== 0) {
        problems.push(
          `limb D11(b·2): the committing re-read read ${countersReading(emptyCounters)} — \`INV-E\` holds for a re-read that COMMITS ` +
            `too, so it is not a property of failed answers only`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb D11 — the re-read's TWO failure disciplines (§3's re-read; \`docs/L2/shell-chrome/pane-doc-nav.md\` §6's last two rows; ` +
        `\`docs/L3/shell-chrome/pane-doc-nav.md\` §7, which records both as UNGRADED before this row). ${problems.length} ` +
        `problem(s). A REJECTING \`bridge.rag.docHeads\` must cost exactly ONE call, KEEP the last-known \`lastDocHeads\` and still ` +
        `produce exactly ONE non-painting verdict (\`applied: []\`, 0 \`applyContentReconcile\`, 0/0/0 \`INV-E\`, no throw); a NON-ARRAY ` +
        `\`documents\` must keep the last-known list; and an ARRAY — even \`[]\` — is COMMITTED, after which the pane authors its ` +
        `\`(no documents)\` state. envelope-class — the REAL \`SidebarPanes\` over the layout-less DOM shim against a counting bridge; ` +
        `no rendered box, no style, no pointer, no IPC count (G8-only), and a bridge that NEVER SETTLES is named as unreadable here ` +
        `rather than pretended`,
    ).toEqual([])
  })
})
