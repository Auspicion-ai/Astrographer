// tests/integration/shell-chrome/pane-search-template.test.ts — unit `B-7` `pane-search-template`'s HOST rows (`Q1`, `Q2`,
// `Q3`, `T1`, `T2`, `X1`, `X2`, `X3`, `X4`), authored BEFORE any byte of the unit's landing (RCA-1: the red set runs first and is
// REPORTED before implementation). `S1`/`S2`/`S3` live in `tests/unit/shell-chrome/pane-search-template.test.ts`.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-7-pane-search-template.md` —
//   §1 `F-1`: the search pane's data is THREE host fields (`lastQueryResult`, `advancedSearchOpen`, `advancedSearchError`) and
//      NOTHING but its own render reads them; `F-2`: TODAY a settled query calls `loadAppGraph` (a WHOLE-APP re-assembly),
//      which is the defect this unit removes; `F-3`: the template pane's data is `this.template` (legitimately structural, so
//      `requestRebuild('template')` STAYS) + `this.templateValidation` (reaches nobody but this pane's render, so its rebuild is
//      pure waste and is REMOVED); `F-4`: `TemplateChangedPayload` carries the WHOLE template, so a `template.get()` re-read would
//      be an IPC that can change nothing; `F-5`: the dirty-edit window is the live discriminator for BOTH panes.
//   §2 the two sources and the two entries: `search`'s producer is its OWN answer (`submitQuery` / `submitAdvancedQuery` behind
//      the app's `window.provident.sidebar` surface) plus its own disclosure toggle; `template-editor`'s is the template STORE's
//      push (`onTemplateChanged`) plus its own validate seam. NEITHER pane joins `CHANGE_INTERESTED_PANE_IDS`.
//   §3 the re-read census: ZERO bridge calls per pane (the refusals argued in the contract's own words) — the paint authors from
//      state the producer committed IN THE SAME TICK, BEFORE the fire. `ASM-B7-1`: the paint owes NO new arm.
//   §4 the census moves by exactly TWO (`search`, `template-editor`) with a `B-7` comment naming both causes; every other family
//      keeps the pre-migration `refresh()`; ONE registration per id (`B2-ADV-04`); `changePanes()` stays `['doc-nav']`.
//   §6 the rows `Q1`, `Q2`, `Q3`, `T1`, `T2`, `X1`, `X2`, `X3`, `X4`, each with its subject and the mutation that reds it.
//
// THE HARNESS IS THE `B-6` PRECEDENT'S SHAPE (`tests/integration/shell-chrome/pane-doc-nav.test.ts`), ADDED TO AND NOT WEAKENED:
// the REAL `SidebarPanes` over `installShim()` from `src/shared/dom-shim.ts`, its REAL `registerPanes()` census, booted through the
// PUBLIC `host.boot(runtime)` against a RECORDING runtime double (`loadEnvelope` seeds the materialized root set by the Runtime's own
// closed class, `materializedContentRoots()` answers it, `materializedDocumentRoots()` answers the per-document census the paint
// CARRIES, and `applyContentReconcile` RECORDS the call + answers + performs the channel's whole-root replace), a REAL
// `createPaneEvents()` handed to the host as its `events` option behind a DELEGATING FAÇADE that counts what the HOST does on it
// (the host's own `fire(<id>)` calls and the `publishChange()` reports) while preserving every behaviour byte-for-byte,
// `updatePane`/`refresh`/`loadAppGraph`/`mountOperator` wrapped on the INSTANCE (so the host's OWN internal calls are counted — the
// `INV-E` counters), and a bridge double that COUNTS every call the unit's census names: `rag.query`, `rag.snapshot`, `rag.docHeads`,
// `rag.backlinks`, `rag.stores`, `security.get`, `template.get`/`create`/`delete`/`reset`/`onTemplateChanged`,
// `edit.onRagStoreChanged`, `operatorSettings.get`/`set`/`onChanged`, `onPaneVisibility`, `pushPaneCatalog`.
//
// THE TWO PANES' PRODUCERS ARE DRIVEN THROUGH THE APP'S OWN DISPATCH SURFACE, never a private method: `boot` calls
// `installSidebarBridge()`, whose non-contextBridge fallback attaches the methods to `window.provident.sidebar` — so `submitQuery`,
// `submitAdvancedQuery`, `searchAdvancedToggle`, `templateValidateResult`, `templateAdd`/`templateRemove` are driven exactly as the
// rendered pane's handler bodies drive them. `onTemplateChanged(payload)` is a PUBLIC host method and is driven directly: that is
// the handler main's `IPC_TEMPLATE_CHANGED` broadcast reaches.
//
// THE `m1`..`m6` MUTANT IDIOM (`B-6`'s `D6` + its `runMutant`): `channel.subscribe(<paneId>, mutantHandler)` adds an ADDITIONAL
// registration on the REAL channel; the real event is then driven and the mutant's effect is READ from the counters, the applied
// list and the AUTHORED text — every mutant's reading is COMPUTED into the aggregate failure message (`B5-DOC-PRINT`: no
// `console.log`), and a mutant that is NOT caught is itself a row failure (a harness that cannot SEE a mutant cannot prove the
// invariant it falsifies).
//
// LAYER (MANDATORY, D-10 / `RCA-12`): every row here is ENVELOPE-class — the REAL host over the LAYOUT-LESS DOM shim (no CSS, no
// computed style, no layout) against a RECORDING runtime double and a counting bridge. The observables are call counts, the paint's
// own verdict fields (`{paneId, painted, reason, applied}`), the IDENTITY of authored nodes across the pre/post root sets, and the
// AUTHORED `LegacyNodeData` tree (walked, never the DOM). What this layer can NEVER read, named so nobody quotes it: that a frame
// was RE-MINTED in a real window, the pane as the user sees it, its box/scroll/style, any pointer, **the NUMBER of IPCs on the
// wire** (the census counts BRIDGE calls) and **the assembled app** — `docs/L1/unit-b-7-pane-search-template.md` §8's two
// assembled-app limbs (`G8`) are the only app-green reading.
//
// NON-VACUITY (stated per row in its own comment): every zero is floored on the SAME harness shape by a positive reading that must
// move (`Q1`'s `rag.query === 1` beside its zeros and its `unchanged` control, `Q2`'s no-dirty control, `Q3`'s second-toggle
// restoration, `T1`'s positive zone reading `main` before the change, `T2`'s `T1`-floor, `X1`'s `crosslinks` listener and the
// `refresh()` floor, `X2`'s own positive paint, `X3`'s seven measured mutants + the m6 floor, `X4`'s enabled control).
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`, no `vi.mock`, no `console.log` (a reading
// that must be printed is folded into the aggregate failure message — `B5-DOC-PRINT`); it writes nothing. Every path derives from
// THIS FILE's own location (`ROOT`), so a missing substrate FAILS instead of skipping. It does not touch
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

/** THIS unit's two panes. */
const SEARCH = 'search'
const TEMPLATE_EDITOR = 'template-editor'
/** `B-5`'s pane and `B-6`'s — this unit may not weaken either (`X2` is the cross-isolation census). */
const CROSSLINKS = 'crosslinks'
const DOC_NAV = 'doc-nav'
/** The operator scope's own pane — ⟨RE-STATED BY UNIT `B-9` (§4 `F-9`, §6 `O1`/`O4`)⟩ it is a CENSUS MEMBER and it PAINTS now, so
 *  `X1` requires it PRESENT (the arm inverted) and `X4` reads the operator surface's own paint words instead of `operator-scope`. */
const SETTINGS = 'settings'
/** ⟨RE-STATED BY UNIT `B-9` (`docs/L1/unit-b-9-pane-operator-settings.md` §4 `F-9`, §6 `O1`) — THE LIST IS NOW EMPTY AND THE LOOP
 *  STAYS.⟩ The families that still keep the pre-migration `refresh()` route: **NONE.** `B-8` narrowed this list to the TWO operator
 *  families (`settings` and `gnosis-status`, both `B-9`'s); `B-9` gave both a paint and entered them in the census, so the last
 *  `fired:false, handlers:0` subjects are gone and they are POSITIVE arms in the loop above (`PINNED_REPLUMBED` now covers them).
 *  The list is kept — EMPTY, never deleted — because the loop over it is the live floor that NO family is pre-migration: the day a
 *  landing adds an id here and still subscribes it, that id's fire reads `fired:true` and this reds by name. */
const PRE_MIGRATION_PANES: readonly string[] = []
/** An id no pane declares: the paint's `not-a-pane` arm (`X4`). */
const UNKNOWN_PANE = 'probe-b7-unknown'
/** §4: the pinned census AFTER this unit's TWO-id move, EXTENDED by `B-8`'s TWO more ids (`D-44`, §12a) and by `B-9`'s LAST TWO
 *  (⟨UNIT `B-9` §4 `F-9`, §6 `O1`⟩) — the recorded VALUE is re-stated, never relaxed (set equality, order-insensitive). */
const PINNED_REPLUMBED: readonly string[] = [
  'gnosis-query',
  'crosslinks',
  'doc-nav',
  'search',
  'template-editor',
  'gnosis-documents',
  'gnosis-wikis',
  'settings',
  'gnosis-status',
]

/** The query the two submit seams are driven with. It never collides with a document id or a zone name. */
const PROBE_TERM = 'b7-probe-term'
/** The result markers: two DIFFERENT snippets, so "the pane's answer moved" is a comparison of two values (`Q1`/`Q3`/`X3`). */
const SNIPPET_ONE = 'B7SNIPPET-ONE'
const SNIPPET_STALE = 'B7SNIPPET-STALE'
/** The zone the `T1` template carries and the default one does not — the authored zone list's discriminator. */
const ZONE_ADDED = 'b7probe'
const ZONE_DEFAULT = 'main'

/** The boot snapshot's document, and the document id the search result names. */
const DOC_A = 'doc-a'
const HEAD_A = 'head-a'

/** The census comment clause's window: how far above `REPLUMBED_PANE_IDS` the contiguous comment BLOCK is read. The block is read
 *  as the run of comment/blank lines IMMEDIATELY above the declaration (never a fixed token window), so a docblock paragraph can
 *  never satisfy the clause from arbitrarily far away — see `censusCauseProblems`. */
const CENSUS_BLOCK_LIMIT = 80
/** THIS unit's id as a TOKEN — `B-70` is not this unit, `B-7` is. */
const CENSUS_UNIT = /\bB-7\b/
/** THE TWO PANES the move adds, as TOKENS: the cause sentence must NAME them, not merely sit near the declaration. */
const CENSUS_PANES: readonly RegExp[] = [/\bsearch\b/, /\btemplate-editor\b/]
/** The words that can NAME A CAUSE for §2's two sources (deliberately NOT `search`/`template`/`pane`, which the required ids already
 *  supply — a cause word must be an independent token or the clause is vacuous). */
const CAUSE_WORDS: readonly string[] = ['store', 'query', 'producer', 'push', 'broadcast', 'source']
const CENSUS_ANCHOR = /^\s*export\s+const\s+REPLUMBED_PANE_IDS\b/
/** A line that OPENS or continues a comment (`//`, a block opener, or a `*`-continuation; a docblock's closing line is one too). */
const COMMENT_LINE = /^\s*(?:\/\/|\/\*|\*(?!\/))/

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
// THE NON-FATAL MEMBER READINGS — the reachability rule: a member that may be ABSENT (this unit's two panorama members are absent at
// this head) is read through this helper and its absence is a NAMED problem inside the row's aggregate assertion, never a
// module-load error and never a raw `TypeError`.
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

/** The app's own dispatch surface (`boot` -> `installSidebarBridge` -> `window.provident.sidebar` in the non-contextBridge shim). */
interface SidebarSurface {
  record: Record<string, unknown> | null
}

function sidebarSurface(): SidebarSurface {
  const holder = (globalThis as { window?: { provident?: { sidebar?: unknown } } }).window?.provident?.sidebar
  return { record: holder !== null && typeof holder === 'object' ? (holder as Record<string, unknown>) : null }
}

/** Drive ONE method of the app's own surface. A throw is a NAMED problem: the surface is a handler body's seam, not a throw site. */
function driveSurface(surface: SidebarSurface, name: string, args: unknown[], limb: string): string[] {
  if (surface.record === null) {
    return [`limb ${limb}: \`window.provident.sidebar\` is ABSENT after boot — the app's own dispatch surface has no subject`]
  }
  const absent = readMember(surface.record, name, '`window.provident.sidebar`', limb)
  if (absent.length > 0) return absent
  const method = surface.record[name] as (...next: unknown[]) => unknown
  try {
    method(...args)
  } catch (error) {
    return [`limb ${limb}: \`window.provident.sidebar.${name}(${args.map((a) => shown(a)).join(', ')})\` THREW (${String(error)})`]
  }
  return []
}

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
// THE AUTHORED-CONTENT READING — every row reads the ENVELOPE the host authored (never the DOM): every authored `content` string,
// the nodes carrying a given prop, and a pane's frame.
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

/** The first node of an authored subtree whose `props.id` is `id`. */
const nodeWithId = (node: unknown, id: string): Record<string, unknown> | undefined =>
  nodesWhere(node, (record) => propsOf(record)['id'] === id)[0]

// ---------------------------------------------------------------------------
// THE CARRIER READING (`Q1`: "the fresh frame's carriers are identical"). §4/the paint REPLACES the pane's frame root WHOLE, so
// "frame identity" is the CARRIERS, never the element instance (`B-5`/`B-6`'s reading, unchanged).
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
// THE SEED FIXTURES — a ONE-document snapshot (so the boot's current document is `doc-a` and a `rag-` root exists beside the pane
// frames) and the two templates `T1` compares (the shipped DEFAULT, and the same with ONE extra zone producer).
// ---------------------------------------------------------------------------
const NOW = new Date().toISOString()

function documentSnapshot(): Record<string, unknown> {
  return {
    store: 'main',
    nodes: [{ id: HEAD_A, type: 'h1', content: 'Doc A', ownedNodeIds: [], createdAt: NOW, updatedAt: NOW }],
    edges: [
      { id: 'dh1', kind: 'doc-head', source: HEAD_A, target: DOC_A, createdAt: NOW, updatedAt: NOW, documentIds: [DOC_A] },
    ],
  }
}

/** The `doc-heads` answer shape the bridge returns (`X2` drives a `doc-nav` fire beside the two panes' paints). */
const docHeadsPayload = (): Record<string, unknown> => ({
  documents: [{ documentId: DOC_A, title: 'Doc A', path: [], tags: [] }],
})

/** A query answer carrying ONE result row whose snippet is the marker the row reads (`searchContent`'s `results` arm). */
const queryAnswer = (snippet: string): Record<string, unknown> => ({
  query: PROBE_TERM,
  results: [{ documentId: DOC_A, nodeId: HEAD_A, score: 0.9, snippet }],
})

/** §6 `T1`'s template: the SHIPPED default PLUS one zone producer, so "the pane's authored zone list names the new zone" is a
 *  reading against a value the boot does NOT already hold. */
function templateWithExtraZone(): Record<string, unknown> {
  return {
    root: {
      type: 'div',
      props: { id: 'wiki-root' },
      children: [
        { type: 'div', props: { id: `zone:${ZONE_DEFAULT}` }, placement: { placementName: ZONE_DEFAULT } },
        { type: 'div', props: { id: `zone:${ZONE_ADDED}` }, placement: { placementName: ZONE_ADDED } },
      ],
    },
  }
}

// ---------------------------------------------------------------------------
// THE RECORDING RUNTIME DOUBLE — `loadEnvelope` seeds the materialized root set (exactly the Runtime's own closed class),
// `materializedContentRoots()` answers it (the paint's step 2), `materializedDocumentRoots()` answers the per-document census the
// paint CARRIES, `applyContentReconcile` records the call AND performs the channel's whole-root replace and answers the applied
// list, and `codeGet('')` answers `null` (the documented ABSENT live-envelope route, on which the paint falls back to the
// materialized-root census). This is the `B-5`/`B-6` double unchanged.
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
   *  the host's OWN boot-time subscriptions exist and its own `fire` is the dispatch under measurement. `false` → the host holds NO
   *  channel (`m1`..`m4`, `m5` and both `m6`s need a host whose registration is absent, so the mutant is the ONLY handler). */
  events?: boolean
}

interface Counters {
  refresh: number
  loadAppGraph: number
  mountOperator: number
  loadEnvelopes: number
  applies: number
  /** The re-read census, member by member (§3's all-zero reading). */
  snapshot: number
  docHeads: number
  backlinks: number
  security: number
  templateGet: number
  ragStores: number
  ragQuery: number
  templateCreate: number
  templateDelete: number
  templateReset: number
  templateChangedSubs: number
  editStoreChangedSubs: number
  operatorSettingsGet: number
  operatorSettingsSet: number
  operatorSettingsChangedSubs: number
  paneVisibilitySubs: number
  paneCatalogPushes: number
}

interface HostDrive {
  host: SidebarPanes
  registry: ReturnType<typeof createPaneRegistry>
  /** The REAL channel. The host holds the counting façade that forwards to it, so a `channel.subscribe`/`channel.fire` here is the
   *  same registry the host dispatches on (`B-6`'s idiom). */
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
  /** Every `publishChange()` the HOST made (the façade's own count). */
  publishChanges: () => number
  /** Every `editController.requestRebuild(<kind>)` the host requested, in order (`'(none)'` for an argument-less call). */
  rebuildRequests: () => string[]
  /** The edit controller double's dirty set — `Q2`'s "a page edit is held dirty" is a REAL dirty flag, not a stub boolean. */
  dirtyControls: () => string[]
  /** The query answer the bridge will give NEXT (an `Error` makes it REJECT — `submitAdvancedQuery`'s inline-error arm). */
  setQueryAnswer: (answer: Record<string, unknown> | Error) => void
  /** The snapshot the bridge will give NEXT (the `m5` mutant's "another root moved" subject). */
  setSnapshot: (snapshot: Record<string, unknown>) => void
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
    loadEnvelopes: 0,
    applies: 0,
    snapshot: 0,
    docHeads: 0,
    backlinks: 0,
    security: 0,
    templateGet: 0,
    ragStores: 0,
    ragQuery: 0,
    templateCreate: 0,
    templateDelete: 0,
    templateReset: 0,
    templateChangedSubs: 0,
    editStoreChangedSubs: 0,
    operatorSettingsGet: 0,
    operatorSettingsSet: 0,
    operatorSettingsChangedSubs: 0,
    paneVisibilitySubs: 0,
    paneCatalogPushes: 0,
  }
  const bootProblems: string[] = []
  const verdicts: Array<Record<string, unknown>> = []
  const firesLog: string[] = []
  const publishReports: Array<Record<string, unknown>> = []
  const rebuilds: string[] = []
  const dirty = new Set<string>()
  let publishChangeCalls = 0
  /** The mutable answers the rows drive. */
  let snapshot: Record<string, unknown> = documentSnapshot()
  let query: Record<string, unknown> | Error = queryAnswer(SNIPPET_ONE)

  const registry = createPaneRegistry()
  const bridge = {
    security: {
      get: async (): Promise<Record<string, unknown>> => {
        counters.security += 1
        // `rag` + `code` are the M13 groups the two panes' producers gate on (`submitQuery`, `submitAdvancedQuery`,
        // `templateAdd`/`templateRemove`); without them every seam is fail-closed and no row below would have a subject.
        return { token: null, enabled: ['read', 'dispatch', 'rag', 'code'] }
      },
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
        return docHeadsPayload()
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
        if (query instanceof Error) throw query
        return query
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
      create: async (): Promise<Record<string, unknown>> => {
        counters.templateCreate += 1
        return { source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }
      },
      delete: async (): Promise<Record<string, unknown>> => {
        counters.templateDelete += 1
        return { source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }
      },
      reset: async (): Promise<Record<string, unknown>> => {
        counters.templateReset += 1
        return { source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }
      },
    },
    operatorSettings: {
      // `panesInitialized: true` + an explicit ENABLED set is what mounts BOTH panes of this unit (the shipped first-run default is
      // only `search`+`doc-nav`; this seed needs `template-editor` mounted too so it has a live frame to paint).
      get: async (): Promise<Record<string, unknown>> => {
        counters.operatorSettingsGet += 1
        return {
          enabledPanes: [SEARCH, TEMPLATE_EDITOR, DOC_NAV, CROSSLINKS],
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

  const channel = createPaneEvents()
  const hostSubscribed = options.events !== false
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

  // THE EDIT CONTROLLER DOUBLE — a REAL dirty set (`Q2` needs a held control) and a RECORDING `requestRebuild` (driving it would be
  // a re-assembly the rows must be able to read as ABSENT; `X3`'s m5 drives `reDerive` explicitly and by name).
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

  const host = new SidebarPanes({
    mount: new ShimElement('div') as never,
    operatorMount: new ShimElement('div') as never,
    registry,
    bridge,
    backRefs: new Map<string, string[]>(),
    editController,
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

  // THE SEED IS THE PUBLIC BOOT: it is what captures the snapshot/doc-heads/template/security/operator-settings, mounts both
  // surfaces, AND registers the host's channel subscriptions. Attaching the double without booting would make every zero vacuous.
  try {
    await host.boot(runtime.double as never)
  } catch (error) {
    bootProblems.push(
      `the harness's \`host.boot(runtime)\` THREW (${String(error)}) — the seed is the {snapshot, doc-heads, template, security, ` +
        `operator settings, channel subscriptions} carrier every arm below reads, so no zero in this row is a reading without it`,
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
      for (const key of Object.keys(counters) as Array<keyof Counters>) counters[key] = 0
      verdicts.length = 0
      firesLog.length = 0
      publishReports.length = 0
      rebuilds.length = 0
      publishChangeCalls = 0
      // ⟨`B7-F3` — THE APPLY LOG IS PART OF THE COUNTER SCOPE.⟩ The recording runtime double's `applies`/`applyAnswers`
      // are the double's OWN bookkeeping of `applyContentReconcile`, exactly like the `applies` COUNTER above and the
      // verdict log beside it: a `resetCounters()` that cleared the counter but not the log left every later arm re-reading
      // the EARLIER arms' applies (measured before this repair: `Q1(b)`/`Q1(control)` read `[['pane-search'],
      // ['pane-search']]` and "3 applies recorded" for a pair that must read ONE, and `X3`'s `m5` read
      // `appliedOurs=1` that was `m4`'s leftover). A paint ALWAYS appends one entry, so no source could ever satisfy those
      // arms — the defect was the SEED's scope, never the paint.
      // NOT RESET: `runtime.roots` — the live materialized root census is the SUBJECT of "every other root the SAME
      // OBJECT" and "the pane's own root is the NEW object", so clearing it would make every root-identity arm vacuous.
      runtime.applies.length = 0
      runtime.applyAnswers.length = 0
    },
    roots: () => runtime.roots(),
    applies: () => runtime.applies,
    applyAnswers: () => runtime.applyAnswers.map((ids) => [...ids]),
    verdicts: () => verdicts.map((verdict) => ({ ...verdict })),
    fires: () => [...firesLog],
    publishChanges: () => publishChangeCalls,
    rebuildRequests: () => [...rebuilds],
    dirtyControls: () => [...dirty],
    setQueryAnswer: (answer: Record<string, unknown> | Error) => {
      query = answer
    },
    setSnapshot: (next: Record<string, unknown>) => {
      snapshot = next
    },
    restore: () => {
      delete (host as unknown as Record<string, unknown>)['refresh']
      delete (host as unknown as Record<string, unknown>)['loadAppGraph']
      delete (host as unknown as Record<string, unknown>)['mountOperator']
      delete (host as unknown as Record<string, unknown>)['updatePane']
      globals['window'] = previousWindow
    },
  }
}

/** Await macrotasks a few times: a producer's answer is a bridge PROMISE, and the fire + paint it settles into are HANDED OFF, not
 *  awaited by the host. */
const settle = async (rounds = 6): Promise<void> => {
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
        `limb ${limb}: the root \`${id}\` was RE-MINTED across the update (identity, not equality: the object changed) — the ` +
          `paint reconciles THAT pane's root ONLY, so every other materialized root must be the SAME OBJECT. Before: ` +
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
  ` (re-read census: snapshot=${counters.snapshot} docHeads=${counters.docHeads} security=${counters.security}` +
  ` backlinks=${counters.backlinks} template.get=${counters.templateGet} rag.stores=${counters.ragStores}` +
  ` rag.query=${counters.ragQuery} template.create/delete/reset=${counters.templateCreate}/${counters.templateDelete}/` +
  `${counters.templateReset} template.onTemplateChanged=${counters.templateChangedSubs}` +
  ` edit.onRagStoreChanged=${counters.editStoreChangedSubs} operatorSettings.get=${counters.operatorSettingsGet}` +
  ` operatorSettings.set=${counters.operatorSettingsSet} operatorSettings.onChanged=${counters.operatorSettingsChangedSubs}` +
      ` onPaneVisibility=${counters.paneVisibilitySubs} pushPaneCatalog=${counters.paneCatalogPushes})` +
  ` (secondary: loadEnvelope=${counters.loadEnvelopes} applyContentReconcile=${counters.applies})`

/** §3's re-read census, member by member: the six members §3's two lists name (the union), plus the three subscription surfaces and
 *  the operator/listing surfaces, each of which a re-read would show up on. */
function reReadCensusProblems(counters: Counters, limit: { ragQuery: number }, limb: string): string[] {
  const problems: string[] = []
  const zeroed: Array<[string, number]> = [
    ['rag.snapshot', counters.snapshot],
    ['rag.docHeads', counters.docHeads],
    ['security.get', counters.security],
    ['rag.backlinks', counters.backlinks],
    ['template.get', counters.templateGet],
    ['rag.stores', counters.ragStores],
    ['template.create', counters.templateCreate],
    ['template.delete', counters.templateDelete],
    ['template.reset', counters.templateReset],
    ['template.onTemplateChanged (a second subscription)', counters.templateChangedSubs],
    ['edit.onRagStoreChanged (a second subscription)', counters.editStoreChangedSubs],
    ['operatorSettings.get', counters.operatorSettingsGet],
    ['operatorSettings.set', counters.operatorSettingsSet],
    ['operatorSettings.onChanged (a second subscription)', counters.operatorSettingsChangedSubs],
    ['onPaneVisibility (a second subscription)', counters.paneVisibilitySubs],
    ['pushPaneCatalog', counters.paneCatalogPushes],
  ]
  const nonzero = zeroed.filter(([, value]) => value !== 0)
  if (nonzero.length > 0) {
    problems.push(
      `limb ${limb}: the pane update reached the re-read census — ${nonzero.map(([name, value]) => `${name}=${value}`).join(', ')} ` +
        `— §3: BOTH panes owe NO re-read at all (the ` +
        `payload IS the store's template and the paint authors from the answer the producer committed in the same tick), so every ` +
        `member must read ZERO. The naive arm (a re-read before the paint) reads here. Full counters: ${countersReading(counters)}`,
    )
  }
  if (counters.ragQuery !== limit.ragQuery) {
    problems.push(
      `limb ${limb}: \`bridge.rag.query\` reads ${counters.ragQuery}, not ${limit.ragQuery} — §3: the ONE query call this arm ` +
        `counts is the PRODUCER's own; a fire that RE-ISSUES it is the unbounded loop \`ASM-B7-2\` refuses (\`query -> fire -> ` +
        `query -> …\`). Full counters: ${countersReading(counters)}`,
    )
  }
  return problems
}

/** §6's paint verdict arms: exactly ONE verdict, `painted:true`, `applied === ['pane-<id>']`. */
function onePaintProblems(
  verdicts: ReadonlyArray<Record<string, unknown>>,
  paneId: string,
  limb: string,
  expectedApplies = 1,
): string[] {
  const problems: string[] = []
  if (verdicts.length !== expectedApplies) {
    problems.push(
      `limb ${limb}: the update produced ${verdicts.length} pane verdict(s) ${shown(verdicts)}, not EXACTLY ${expectedApplies} — ` +
        `§6: a producer's settlement is ONE paint (the fire is uncoalesced, \`O-2\`, so N settled queries are N paints and never a ` +
        `different count)`,
    )
    return problems
  }
  const verdict = verdicts[verdicts.length - 1]
  if (verdict['painted'] !== true || verdict['reason'] !== 'painted') {
    problems.push(
      `limb ${limb}: the verdict reads ${shown(verdict)}, not \`painted:true\`/\`'painted'\` — the enabled+mounted pane whose data ` +
        `moved IS the arm that paints, and the fire is the ONLY thing that may have to run`,
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

// ---------------------------------------------------------------------------
// §4's COMMENT CLAUSE — ONE COMMENT PARAGRAPH, read off the CONTIGUOUS COMMENT BLOCK immediately above `REPLUMBED_PANE_IDS` (never
// a fixed token window: `B-6` MEASURED that a window-wide token search was vacuous there — the pre-existing docblocks supplied the
// unit id and a cause word without naming the moved pane, so a census moved with no cause read GREEN).
// A COMMENT PARAGRAPH is a maximal run of consecutive comment lines, BROKEN by a blank comment line and by every non-comment line —
// the way this source groups its own docblocks. The instrument takes the TEXT as a parameter, which is what makes BOTH directions
// runnable from the SAME committed clause: the shipped file read off disk (must be GREEN) and the PRE-LANDING fixture this file
// carries with the census MOVED and no `B-7` paragraph (must be RED — `X1`'s own proof arm).
// ---------------------------------------------------------------------------
interface CommentParagraph {
  from: number
  to: number
  text: string
}

/** A line's comment CONTENT — the `//` / block-opener / `*` furniture and a trailing docblock closer removed. */
const commentContentOf = (line: string): string => line.replace(/^\s*(?:\/\/|\/\*+|\*)/, '').replace(/\*\/\s*$/, '').trim()

/** The COMMENT PARAGRAPHS of a slice of lines: a maximal run of consecutive comment lines, BROKEN by a blank comment line and by
 *  every non-comment line. `firstLineNumber` is the 1-based file line number of `lines[0]`. */
function commentParagraphsOf(lines: readonly string[], firstLineNumber: number): CommentParagraph[] {
  const paragraphs: CommentParagraph[] = []
  let open = false
  lines.forEach((line, index) => {
    if (!COMMENT_LINE.test(line)) {
      open = false
      return
    }
    const content = commentContentOf(line)
    if (content === '') {
      open = false
      return
    }
    if (!open) {
      paragraphs.push({ from: firstLineNumber + index, to: firstLineNumber + index, text: content })
      open = true
      return
    }
    const paragraph = paragraphs[paragraphs.length - 1]
    paragraph.to = firstLineNumber + index
    paragraph.text = `${paragraph.text}\n${content}`
  })
  return paragraphs
}

/** The cause words a paragraph names, in `CAUSE_WORDS` order (`[]` when it names none). */
const causeWordsIn = (text: string): string[] => CAUSE_WORDS.filter((word) => new RegExp(`\\b${word}\\b`, 'i').test(text))

/** §4's COMMENT CLAUSE, read on a GIVEN source text. Returns the problems it reads; `[]` only when ONE comment paragraph inside the
 *  contiguous comment BLOCK above `REPLUMBED_PANE_IDS` carries THIS unit's id, BOTH panes the move adds, AND a cause word
 *  TOGETHER. `where` only labels the text in the message; nothing here reads the filesystem. */
function censusCauseProblems(text: string, where: string, limb: string): string[] {
  const lines = text.split('\n')
  const at = lines.findIndex((line) => CENSUS_ANCHOR.test(line))
  if (at < 0) {
    return [`${limb}: no \`export const REPLUMBED_PANE_IDS\` declaration line was found in ${where} — the comment clause has no anchor`]
  }
  // THE CONTIGUOUS BLOCK: walk upward over comment lines and blank lines, stopping at the first line of CODE (or the limit).
  let first = at
  while (first > 0 && at - first < CENSUS_BLOCK_LIMIT) {
    const line = lines[first - 1]
    if (COMMENT_LINE.test(line) || line.trim() === '') first -= 1
    else break
  }
  const paragraphs = commentParagraphsOf(lines.slice(first, at), first + 1)
  const carried = paragraphs.filter((paragraph) => CENSUS_UNIT.test(paragraph.text))
  if (carried.length === 0) {
    return [
      `${limb}: the contiguous comment block above \`REPLUMBED_PANE_IDS\` in ${where} (lines ${first + 1}-${at}) carries NO \`B-7\` ` +
        `marker in any of its ${paragraphs.length} comment paragraph(s) — §4: the census moves by exactly TWO and carries a comment ` +
        `NAMING THE CAUSE (\`D-24\`'s precedence: a move entombed in code with no cause recorded beside it is a review finding). Read: ` +
        `${shown(paragraphs.map((paragraph) => `lines ${paragraph.from}-${paragraph.to}: ${paragraph.text.split('\n')[0].slice(0, 80)}`))}`,
    ]
  }
  const qualifying = carried.filter(
    (paragraph) => CENSUS_PANES.every((pattern) => pattern.test(paragraph.text)) && causeWordsIn(paragraph.text).length > 0,
  )
  if (qualifying.length > 0) return []
  const readings = carried.map(
    (paragraph) =>
      `lines ${paragraph.from}-${paragraph.to}: namesSearch=${CENSUS_PANES[0].test(paragraph.text)} ` +
      `namesTemplateEditor=${CENSUS_PANES[1].test(paragraph.text)} causeWords=${shown(causeWordsIn(paragraph.text))} ` +
      `first=${shown(paragraph.text.split('\n')[0].slice(0, 90))}`,
  )
  return [
    `${limb}: \`REPLUMBED_PANE_IDS\` in ${where} DOES carry a \`B-7\` marker, but NO comment paragraph inside the contiguous block ` +
      `above the declaration carries the unit id TOGETHER WITH BOTH panes the move adds (\`${SEARCH}\` AND \`${TEMPLATE_EDITOR}\`) ` +
      `AND a CAUSE word (${shown([...CAUSE_WORDS])}) — §4's comment is the SENTENCE THAT NAMES THIS UNIT'S MOVE, not the token ` +
      `somewhere near the declaration. Read: ${shown(readings)}`,
  ]
}

/** THE PRE-LANDING BYTES, VERBATIM: the docblock + declaration as they stand at this head (lines 287-304 of
 *  `src/renderer/sidebar-panes.ts`), i.e. `B-3`'s census sentence, `B-5`'s and `B-6`'s cause paragraphs, and a declaration naming
 *  THREE ids. It is kept as a FIXTURE because the red direction needs a tree this unit's `B-7` paragraph is ABSENT from. */
const PRE_LANDING_CENSUS_BLOCK: readonly string[] = [
  '/** ⟨Unit `B-3` `§3` — THE ONE DECLARED CENSUS.⟩ The panes whose paint the host registers on the channel at `boot`: **exactly',
  ' *  `gnosis-query`, `crosslinks` and `doc-nav`**. The set is ONE constant so a later family unit must EXTEND it deliberately',
  ' *  (`B-8` for the other gnosis panes, `B-6`…`B-10`) and can never inherit a silent second subscriber. `gnosis-status` is',
  ' *  deliberately NOT here: it is `operator`-scope, the operator mount is `B-9`\'s surface, and `updatePane` answers',
  ' *  `operator-scope` for it rather than re-mounting it (`r3`/`r5`). **FROZEN** (`B3-F13`): the census is a fact of',
  ' *  the VALUE, not only a convention — a `push` cannot add a silent second subscriber.',
  ' *',
  ' *  ⟨Unit `B-5` `§4` — THE ROW MOVED BY EXACTLY ONE, AND HERE IS THE CAUSE (`D-24`\'s own example).⟩ `crosslinks` joins the',
  ' *  census because a NEW BACKLINK is now DETECTED on this very channel and the pane must HEAR it (the contract\'s §2',
  ' *  detection seam): the PRODUCER is main\'s edge-write announcement (`edit.set_edge` / `deriveBatchBroadcast`\'s',
  ' *  `putEdge` arm → `IPC_RAG_STORE_CHANGED` with a NON-EMPTY `edgeIds`), the LEARNER is this host\'s `onRagStoreChanged`,',
  ' *  and the pane\'s answer is ONE `bridge.rag.backlinks(subject)` re-read then ONE `updatePane(\'crosslinks\')` — `INV-E`,',
  ' *  never a re-assembly. The cause is named HERE, beside the declaration, so the move is a DELIBERATE extension: it is one',
  ' *  id, it is the same `subscribe` (one subscriber per id, `B2-ADV-04`), and every other family keeps its `refresh()`.',
  ' *  ⟨Unit `B-6` — `doc-nav` JOINS FOR ITS OWN CAUSE: this pane hears BOTH SOURCES (`docs/L1/unit-b-6-pane-doc-nav.md` §2) — a change',
  ' *  of the RENDERED STORE (fired locally in `onRagStoreChanged`) and an ENGINE-originated change (published through the change',
  ' *  census) — and answers ONE `rag.docHeads()` re-read + ONE `updatePane(\'doc-nav\')`, never a re-assembly. One id, one registration.⟩ */',
  "export const REPLUMBED_PANE_IDS: readonly string[] = Object.freeze(['gnosis-query', 'crosslinks', 'doc-nav'])",
]

/** THE DEFECT SIMULATED EXACTLY: the SHIPPED declaration line once the census has MOVED (all five ids) with NO `B-7` cause
 *  paragraph above it — i.e. the wrong landing a reviewer files as "a census moved with no `B-7` cause". */
const MOVED_CENSUS_DECLARATION =
  "export const REPLUMBED_PANE_IDS: readonly string[] = Object.freeze(['gnosis-query', 'crosslinks', 'doc-nav', 'search', 'template-editor'])"

// ===========================================================================
// ROWS
// ===========================================================================
beforeAll(() => {
  installShim()
})

describe('pane-search-template — the TWO panes that answer their OWN source: one paint each, no re-read, no re-assembly, INV-E with seven measured mutants', () => {
  it('Q1 — a settled query paints `pane-search` ALONE from both submit seams: ONE paint, `applied === [pane-search]`, carriers identical, every other root the SAME OBJECT, 0/0/0 counters, the re-read census all-zero except `rag.query` 1 — and the SAME answer twice is `unchanged`', async () => {
    // §6 `Q1` (§1 `F-1`/`F-2`: the pane's data is THREE host fields and today's settlement re-assembles the WHOLE app graph; §2's two
    // synthesis seams; §3's re-read census; §4's ONE apply; `INV-E`).
    // LAYER: envelope-class — the REAL `SidebarPanes` over the LAYOUT-LESS DOM shim; the observables are the paint's own verdict, the
    // authored envelope, the IDENTITY of authored nodes and the bridge's per-method census (no CSS, no box, no pointer, no IPC count).
    // NON-VACUITY: the seed asserts that the pane's authored text does NOT yet carry the fresh snippet (`SNIPPET_ONE`) and that a
    // multi-root census exists beside it, so "the pane's answer moved" is a comparison of two values; the zeros are read BESIDE
    // `rag.query === 1` on the same event (a bridge that is not counted would read 0 there too); and the CONTROL re-drives the SAME
    // answer and must answer `unchanged`/`applied === []`, so the row cannot be satisfied by a landing that adopts every render.
    // MUTATION THAT WOULD RED IT: keeping the settlement's `loadAppGraph` (the landed head) reds the counters, the verdict count,
    // `applied`, the root-identity arm and (through the re-assembly) `loadEnvelope`; firing without committing first reds the
    // authored-content arm; a fire that re-issues `rag.query` reds the census's `1`; a paint that applies the whole assembled
    // envelope reds `applied` + every other root's identity.
    const problems: string[] = []
    const drive = await seedHost({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const surface = sidebarSurface()
      const before = drive.roots()
      const liveSearch = rootById(before, `pane-${SEARCH}`)
      if (liveSearch === undefined) {
        problems.push(
          `limb Q1: the seed carries NO live frame \`pane-${SEARCH}\` (roots read: [${rootIds(before).join(', ')}]) — the paint's ` +
            `subject has no frame, so nothing below is a reading of a pane that could move`,
        )
      }
      if (!rootIds(before).some((id) => id.startsWith('rag-'))) {
        problems.push(`limb Q1: the seed carries NO \`rag-\` document root — "every other materialized root the SAME OBJECT" needs a non-pane subject too`)
      }
      if (liveSearch !== undefined && authoredText(liveSearch).includes(SNIPPET_ONE)) {
        problems.push(
          `limb Q1: the live frame ALREADY authors \`${SNIPPET_ONE}\` — the "the pane's answer moved" arm would be vacuous`,
        )
      }

      // ---- (a) THE FIRST SEAM: `submitQuery` --------------------------------------------------------
      drive.resetCounters()
      problems.push(...driveSurface(surface, 'submitQuery', [PROBE_TERM], 'Q1(a)'))
      await settle()
      const firstCounters = drive.counters()
      const firstVerdicts = drive.verdicts()
      problems.push(...onePaintProblems(firstVerdicts, SEARCH, 'Q1(a)'))
      problems.push(...reReadCensusProblems(firstCounters, { ragQuery: 1 }, 'Q1(a)'))
      if (firstCounters.refresh !== 0 || firstCounters.loadAppGraph !== 0 || firstCounters.mountOperator !== 0) {
        problems.push(
          `limb Q1(a): the settled query read ${countersReading(firstCounters)} — \`INV-E\` pins \`0 loadAppGraph\` / ` +
            `\`0 mountOperator\` / \`0 refresh()\` on a pane update (§1 \`F-2\` names TODAY's \`loadAppGraph\` as the defect this unit ` +
            `removes)`,
        )
      }
      const firstAnswers = drive.applyAnswers()
      if (firstAnswers.length !== 1 || fingerprint(firstAnswers[0]) !== fingerprint([`pane-${SEARCH}`])) {
        problems.push(
          `limb Q1(a): the managed channel answered ${shown(firstAnswers)}, not exactly one call applying \`['pane-${SEARCH}']\` (§4's ` +
            `ONE apply, one root)`,
        )
      }
      const afterFirst = drive.roots()
      problems.push(...otherRootsProblems(before, afterFirst, [`pane-${SEARCH}`], 'Q1(a)'))
      const fresh = appliedFrameOf(drive.applies(), `pane-${SEARCH}`)
      if (fresh === undefined) {
        problems.push(
          `limb Q1(a): the paint never handed the runtime a fresh \`pane-${SEARCH}\` frame (applyContentReconcile calls recorded: ` +
            `${drive.applies().length}) — §3's paint applies the reconcile's \`next\` envelope`,
        )
      } else {
        if (liveSearch !== undefined && fingerprint(carriersOf(liveSearch)) !== fingerprint(carriersOf(fresh))) {
          problems.push(
            `limb Q1(a): the fresh frame's CARRIERS differ from the live frame's (live ${shown(carriersOf(liveSearch))} vs fresh ` +
              `${shown(carriersOf(fresh))}) — the paint continues the LIVE frame's zone/collapsed, and its identity carriers (` +
              `\`id\`, \`data-pane-id\`, head/grip/control ids, the body slot) are never re-derived by a content update`,
          )
        }
        if (!authoredText(fresh).includes(SNIPPET_ONE)) {
          problems.push(
            `limb Q1(a): the fresh frame does NOT author the query's own result \`${SNIPPET_ONE}\` (authored: ` +
              `${shown(authoredText(fresh).slice(0, 400))}) — the paint authors from \`lastQueryResult\`, so the producer's committed ` +
              `answer MUST reach the rendered tree`,
          )
        }
      }
      if (liveSearch !== undefined && rootById(afterFirst, `pane-${SEARCH}`) === liveSearch) {
        problems.push(
          `limb Q1(a): the pane's OWN root is the SAME OBJECT after a paint that changed its authored list — the managed channel ` +
            `REPLACES the root whole, so the pane's frame must be the NEW object`,
        )
      }

      // ---- (b) THE SECOND SEAM: `submitAdvancedQuery` (the advanced arm) ---------------------------
      // The answer MOVES first: a settlement whose answer is shape-equal would lawfully answer `unchanged`, and this arm's subject is
      // a PAINT (`r1`'s idempotence limb is graded by the CONTROL below, not here).
      drive.setQueryAnswer(queryAnswer(SNIPPET_STALE))
      const beforeAdvanced = drive.roots()
      drive.resetCounters()
      problems.push(...driveSurface(surface, 'submitAdvancedQuery', [PROBE_TERM, {}], 'Q1(b)'))
      await settle()
      const secondCounters = drive.counters()
      problems.push(...onePaintProblems(drive.verdicts(), SEARCH, 'Q1(b)'))
      problems.push(...reReadCensusProblems(secondCounters, { ragQuery: 1 }, 'Q1(b)'))
      if (secondCounters.refresh !== 0 || secondCounters.loadAppGraph !== 0 || secondCounters.mountOperator !== 0) {
        problems.push(`limb Q1(b): the advanced settlement read ${countersReading(secondCounters)} — \`INV-E\` holds for BOTH arms (§2)`)
      }
      problems.push(...otherRootsProblems(beforeAdvanced, drive.roots(), [`pane-${SEARCH}`], 'Q1(b)'))
      const advancedFrame = appliedFrameOf(drive.applies(), `pane-${SEARCH}`)
      if (advancedFrame === undefined || !authoredText(advancedFrame).includes(SNIPPET_STALE)) {
        problems.push(
          `limb Q1(b): the advanced arm's fresh frame does not author its own moved answer \`${SNIPPET_STALE}\` (authored: ` +
            `${shown(advancedFrame === undefined ? '(no fresh frame)' : authoredText(advancedFrame).slice(0, 400))}) — both ` +
            `settlements author from \`lastQueryResult\``,
        )
      }
      const advancedAnswers = drive.applyAnswers()
      if (advancedAnswers.length !== 1 || fingerprint(advancedAnswers[0]) !== fingerprint([`pane-${SEARCH}`])) {
        problems.push(`limb Q1(b): the advanced arm's channel answered ${shown(advancedAnswers)}, not exactly one call applying \`['pane-${SEARCH}']\``)
      }

      // ---- (c) THE CONTROL: the SAME answer twice → `unchanged` ------------------------------------
      // The answer moves BACK first (so the first of the pair is a real paint and the second is the idempotence reading).
      drive.setQueryAnswer(queryAnswer(SNIPPET_ONE))
      drive.resetCounters()
      problems.push(...driveSurface(surface, 'submitQuery', [PROBE_TERM], 'Q1·control(a)'))
      await settle()
      problems.push(...driveSurface(surface, 'submitQuery', [PROBE_TERM], 'Q1·control(b)'))
      await settle()
      const controlVerdicts = drive.verdicts()
      if (controlVerdicts.length !== 2) {
        problems.push(
          `limb Q1(control): two settled queries with the SAME answer produced ${controlVerdicts.length} verdict(s) ` +
            `${shown(controlVerdicts)}, not exactly TWO — \`O-2\`: the fire is UNCOALESCED, so N settled queries are N fires (each ` +
            `\`unchanged\` once the answer has stopped moving)`,
        )
      } else if (controlVerdicts[1]['painted'] !== false || fingerprint(controlVerdicts[1]['applied']) !== fingerprint([])) {
        problems.push(
          `limb Q1(control): the second settlement answered ${shown(controlVerdicts[1])}, not \`painted:false\` with ` +
            `\`applied === []\` — \`r1\`'s idempotence limb: a shape-equal re-render applies NOTHING, and this is what proves the ` +
            `row's first paint is a reading of a MOVED answer rather than of an adopted render`,
        )
      }
      const controlAnswers = drive.applyAnswers()
      if (controlAnswers.length !== 1) {
        problems.push(`limb Q1(control): the unchanged settlement still reached \`applyContentReconcile\` (${controlAnswers.length} applies recorded, expected 1 for the pair)`)
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb Q1 — a settled query paints the search pane ALONE (§6 Q1; §1 \`F-1\`/\`F-2\`; §2's two seams; §3's census). ` +
        `${problems.length} problem(s). Both \`window.provident.sidebar\` seams must make ONE paint of \`pane-${SEARCH}\`` +
        ` (\`applied === ['pane-${SEARCH}']\`) with the frame's carriers held, every other materialized root the SAME OBJECT, ` +
        `\`0 refresh()\` / \`0 loadAppGraph\` / \`0 mountOperator\`, the whole re-read census ZERO except \`rag.query === 1\` (the ` +
        `producer's own), and the SAME answer twice must answer \`unchanged\`. envelope-class — the REAL SidebarPanes over the ` +
        `layout-less DOM shim with a recording runtime double; no rendered box, no computed style, no pointer, no IPC count (G8-only)`,
    ).toEqual([])
  })

  it('Q2 — the DIRTY-EDIT WINDOW is not a gate on the pane\'s own event: with a page edit held dirty a settled query still paints ONCE, the page root is the SAME OBJECT, 0/0/0 — and the no-dirty control reads identically', async () => {
    // §6 `Q2` (§1 `F-5`: today's settlement skips its re-render behind `anyDirty()`, so a query settled during an edit NEVER reaches
    // the pane; §3: the fire is NOT gated by that guard and the paint touches ONE root). THE ROW THAT REDS THE SURVIVING
    // `if (anyDirty()) return`.
    // LAYER: envelope-class — the counters, the paint verdict, the authored text and root IDENTITY.
    // NON-VACUITY: the CONTROL is the SAME harness and the SAME seam with NO dirty control, and it must read the SAME one paint
    // — so the dirty arm cannot pass by a host that ignores the guard in one direction only, and the no-dirty arm cannot pass by a
    // host that never paints at all (the two arms are compared to EACH OTHER, not to an authored sentence).
    // ⟨RE-AUTHORED (`B7-F4`): the control MOVES THE ANSWER BEFORE IT FIRES (`setQueryAnswer(queryAnswer(SNIPPET_STALE))`, after the
    // dirty arm committed `SNIPPET_ONE`) and additionally asserts that its own frame AUTHORS that moved answer. As filed it
    // re-submitted the dirty arm's answer and demanded `painted:true` from a fire over state the pane had already painted —
    // unsatisfiable (`r1`'s idempotence, which `Q1(control)`/`T1(control)` demand) and a contradiction with those rows. No assertion
    // was deleted or relaxed: the control gained a positive and lost nothing.⟩
    // MUTATION THAT WOULD RED IT: keeping `if (this.editController.anyDirty()) return` in either settlement (the landed head) reds
    // the dirty arm's verdict count; a paint that re-authors the page surface reds the page root's identity; a guard that ALSO gated
    // the fire would leave both arms dead and the control reading would not differ.
    const problems: string[] = []
    const drive = await seedHost({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const surface = sidebarSurface()
      const edit = (drive.host as unknown as { editController: { markDirty(id: string): void; clearDirty(id: string): void } })
        .editController
      const livePage = rootById(drive.roots(), 'page-edit-surface')
      if (livePage === undefined) {
        problems.push(
          `limb Q2: the seed carries NO \`page-edit-surface\` root (roots: [${rootIds(drive.roots()).join(', ')}]) — the dirty edit's ` +
            `own subject has no root, so "the page's root is the SAME OBJECT" is not a reading`,
        )
      }

      // ---- (a) A PAGE EDIT IS HELD DIRTY ------------------------------------------------------------
      edit.markDirty('page-edit-surface')
      if (!drive.dirtyControls().includes('page-edit-surface')) {
        problems.push('limb Q2: `markDirty(\'page-edit-surface\')` did not register on the edit controller — the dirty arm has no subject')
      }
      const beforeDirty = drive.roots()
      drive.resetCounters()
      problems.push(...driveSurface(surface, 'submitQuery', [PROBE_TERM], 'Q2(a)'))
      await settle()
      const dirtyCounters = drive.counters()
      const dirtyVerdicts = drive.verdicts()
      problems.push(...onePaintProblems(dirtyVerdicts, SEARCH, 'Q2(a)'))
      if (dirtyCounters.refresh !== 0 || dirtyCounters.loadAppGraph !== 0 || dirtyCounters.mountOperator !== 0) {
        problems.push(
          `limb Q2(a): a settled query inside the dirty window read ${countersReading(dirtyCounters)} — the pane's event must not ` +
            `re-assemble, and it must not be SKIPPED either (§1 \`F-5\`)`,
        )
      }
      problems.push(...otherRootsProblems(beforeDirty, drive.roots(), [`pane-${SEARCH}`], 'Q2(a)'))
      const dirtySearch = liveFrame(drive, SEARCH)
      if (dirtySearch !== undefined && !authoredText(dirtySearch).includes(SNIPPET_ONE)) {
        problems.push(
          `limb Q2(a): with a page edit held dirty the pane does not author the settled answer \`${SNIPPET_ONE}\` (authored: ` +
            `${shown(authoredText(dirtySearch).slice(0, 400))}) — the landed head's \`if (anyDirty()) return\` is exactly this loss`,
        )
      }
      const dirtyAnswers = drive.applyAnswers()
      if (dirtyAnswers.length !== 1 || fingerprint(dirtyAnswers[0]) !== fingerprint([`pane-${SEARCH}`])) {
        problems.push(`limb Q2(a): the dirty-window settlement answered ${shown(dirtyAnswers)}, not exactly one call applying \`['pane-${SEARCH}']\``)
      }

      // ---- (b) THE CONTROL: NO DIRTY CONTROL, THE SAME READING -------------------------------------
      edit.clearDirty('page-edit-surface')
      if (drive.dirtyControls().length !== 0) {
        problems.push(`limb Q2(control): the dirty set still holds ${shown(drive.dirtyControls())} — the control is not the no-dirty shape`)
      }
      // ⟨`B7-F4` — THE ANSWER MOVES BEFORE THE CONTROL'S FIRE.⟩ A fire over a state the pane has ALREADY painted lawfully
      // answers `unchanged`/`applied: []` (`r1`'s idempotence, and `ASM-B7-1` forbids a re-read arm that could disagree), so
      // re-submitting the answer the dirty arm committed would demand a paint no lawful host can make — and would contradict
      // `Q1(control)`/`T1(control)`, which demand exactly that `unchanged` for a shape-equal state. The control is a POSITIVE
      // because the PRODUCER moves its field first: the dirty arm committed `SNIPPET_ONE`, so this arm's `SNIPPET_STALE` is a
      // real move and the paint below is a real paint.
      drive.setQueryAnswer(queryAnswer(SNIPPET_STALE))
      const beforeClean = drive.roots()
      drive.resetCounters()
      problems.push(...driveSurface(surface, 'submitAdvancedQuery', [PROBE_TERM, {}], 'Q2·control'))
      await settle()
      const cleanCounters = drive.counters()
      const cleanVerdicts = drive.verdicts()
      problems.push(...onePaintProblems(cleanVerdicts, SEARCH, 'Q2·control'))
      if (cleanCounters.refresh !== 0 || cleanCounters.loadAppGraph !== 0 || cleanCounters.mountOperator !== 0) {
        problems.push(`limb Q2(control): the no-dirty settlement read ${countersReading(cleanCounters)} — \`INV-E\` is the same reading either way`)
      }
      problems.push(...otherRootsProblems(beforeClean, drive.roots(), [`pane-${SEARCH}`], 'Q2·control'))
      // THE CONTROL'S OWN AUTHORED READING: its paint must author the answer that MOVED — so the control is a positive (a
      // frame that really moved) and not a silence, exactly as the dirty arm's `SNIPPET_ONE` arm is above.
      const cleanSearch = liveFrame(drive, SEARCH)
      if (cleanSearch === undefined || !authoredText(cleanSearch).includes(SNIPPET_STALE)) {
        problems.push(
          `limb Q2(control): the no-dirty settlement does not author its own moved answer \`${SNIPPET_STALE}\` (authored: ` +
            `${shown(cleanSearch === undefined ? '(no live frame)' : authoredText(cleanSearch).slice(0, 400))}) — the control is the ` +
            `SAME reading as the dirty arm taken with the dirty set EMPTY, so its paint must be a real one`,
        )
      }
      // THE TWO ARMS MUST AGREE: the guard's presence or absence is not allowed to change the reading.
      if (dirtyVerdicts.length !== cleanVerdicts.length) {
        problems.push(
          `limb Q2: the dirty arm produced ${dirtyVerdicts.length} verdict(s) and the no-dirty control ${cleanVerdicts.length} — the ` +
            `pane's own event is INDEPENDENT of the dirty-edit guard (§1 \`F-5\`: "the fire is not gated by that guard, and the paint ` +
            `touches ONE root"), so the two readings must be the SAME`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb Q2 — the dirty-edit window is not a gate on the pane's own event (§6 Q2; §1 \`F-5\`; §3). ${problems.length} problem(s). ` +
        `With \`editController.markDirty('page-edit-surface')\` held, a settled query must still paint ` +
        `\`pane-${SEARCH}\` ONCE (\`applied === ['pane-${SEARCH}']\`), leave the page's own root the SAME OBJECT, read ` +
        `\`0 refresh\` / \`0 loadAppGraph\`, and the NO-DIRTY control must read identically. envelope-class — the REAL host over the ` +
        `layout-less DOM shim; no rendered box, no pointer (G8-only)`,
    ).toEqual([])
  })

  it('Q3 — the ADVANCED-SEARCH CARRIER survives BOTH directions: the expanded disclosure authors `#advanced-search-toggle[data-expanded="true"]` + `#advanced-search-fields` + the result rows; `searchAdvancedToggle()` paints ONCE, flips to `"false"`, drops the fields and KEEPS the rows; a second toggle restores them', async () => {
    // §6 `Q3` (§1 `F-1`: `advancedSearchOpen` is the pane's OWN state and nothing but its render reads it; §2: "the disclosure is the
    // pane's own state, so `searchAdvancedToggle` fires too"; §3: no re-read on any of the three arms).
    // LAYER: envelope-class — every reading walks the AUTHORED `LegacyNodeData` tree of the live frame (never the DOM), and the
    // mechanism is the paint's own verdict; the two panes' frames are compared by OBJECT IDENTITY.
    // NON-VACUITY: the ROW STARTS from the collapsed state and asserts the fields are ABSENT + `data-expanded="false"` before any
    // toggle, so "the disclosure opened" is a comparison of two authored states; the RESULT ROWS are committed by a real query and
    // are required to SURVIVE the collapse, so "the rows still stand" is its own positive; and the SECOND toggle must RESTORE the
    // fields (the direction that a landing which merely blanks the disclosure would fail).
    // MUTATION THAT WOULD RED IT: the landed head (the toggle only queues `requestRebuild`, so no paint happens at all) reds every
    // paint count and the `data-expanded` flip; a paint that re-authors the toggle from `ctx` instead of the host's
    // `advancedSearchOpen` reds the flip; a landing that drops the result rows on collapse reds the "KEEPS the rows" arm.
    const problems: string[] = []
    const drive = await seedHost({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const surface = sidebarSurface()
      const toggleOf = (frame: unknown): Record<string, unknown> | undefined => nodeWithId(frame, 'advanced-search-toggle')
      const fieldsOf = (frame: unknown): Record<string, unknown> | undefined => nodeWithId(frame, 'advanced-search-fields')
      const resultRowsOf = (frame: unknown): Array<Record<string, unknown>> =>
        nodesWhere(frame, (record) => propsOf(record)['data-document-id'] === DOC_A)
      const expandedOf = (frame: unknown): unknown => propsOf(toggleOf(frame))['data-expanded']

      const bootSearch = liveFrame(drive, SEARCH)
      if (bootSearch === undefined) {
        problems.push(`limb Q3: the seed carries NO live \`pane-${SEARCH}\` frame — the disclosure has no frame`)
      } else {
        if (expandedOf(bootSearch) !== 'false' || fieldsOf(bootSearch) !== undefined) {
          problems.push(
            `limb Q3: the seed's disclosure is NOT the collapsed shape (data-expanded=${shown(expandedOf(bootSearch))}, ` +
              `fields=${fieldsOf(bootSearch) === undefined ? 'absent' : 'present'}) — the opening arm would be vacuous`,
          )
        }
        if (resultRowsOf(bootSearch).length !== 0) {
          problems.push('limb Q3: the seed already authors result rows — the "the committed rows survive" arm would be vacuous')
        }
      }

      // ---- (a) OPEN THE DISCLOSURE (its own producer) ----------------------------------------------
      drive.resetCounters()
      problems.push(...driveSurface(surface, 'searchAdvancedToggle', [], 'Q3(a)'))
      await settle()
      problems.push(...onePaintProblems(drive.verdicts(), SEARCH, 'Q3(a)'))
      const openCounters = drive.counters()
      if (openCounters.refresh !== 0 || openCounters.loadAppGraph !== 0 || openCounters.mountOperator !== 0) {
        problems.push(`limb Q3(a): the disclosure toggle read ${countersReading(openCounters)} — it is the pane's OWN state (§2), never a re-assembly`)
      }
      const openFrame = liveFrame(drive, SEARCH)
      if (expandedOf(openFrame) !== 'true') {
        problems.push(
          `limb Q3(a): after the toggle \`#advanced-search-toggle\` authors data-expanded=${shown(expandedOf(openFrame))}, not ` +
            `\`"true"\` — \`F-1\`: the paint authors from \`advancedSearchOpen\`, the field the producer committed`,
        )
      }
      if (fieldsOf(openFrame) === undefined) {
        problems.push(`limb Q3(a): after the toggle \`#advanced-search-fields\` is ABSENT from the authored frame (\`searchContent\`'s expanded arm)`)
      }

      // ---- (b) THE COMMITTED RESULT ROWS (a real query over the open disclosure) --------------------
      drive.resetCounters()
      problems.push(...driveSurface(surface, 'submitAdvancedQuery', [PROBE_TERM, {}], 'Q3(b)'))
      await settle()
      problems.push(...onePaintProblems(drive.verdicts(), SEARCH, 'Q3(b)'))
      const committedFrame = liveFrame(drive, SEARCH)
      if (expandedOf(committedFrame) !== 'true') {
        problems.push(`limb Q3(b): the query's paint closed the disclosure (data-expanded=${shown(expandedOf(committedFrame))}) — the carrier must SURVIVE the answer`)
      }
      if (fieldsOf(committedFrame) === undefined) {
        problems.push('limb Q3(b): the query\'s paint dropped `#advanced-search-fields` — the expanded carrier must survive the answer')
      }
      const committedRows = resultRowsOf(committedFrame)
      if (committedRows.length !== 1) {
        problems.push(
          `limb Q3(b): the query's paint authors ${committedRows.length} result row(s) naming \`${DOC_A}\`, not exactly ONE (authored ` +
            `text: ${shown(authoredText(committedFrame).slice(0, 400))}) — the paint authors from \`lastQueryResult\``,
        )
      } else if (!String(propsOf(committedRows[0])['data-node-id']).includes(HEAD_A) || !authoredText(committedRows[0]).includes(SNIPPET_ONE)) {
        problems.push(
          `limb Q3(b): the painted row reads ${shown(committedRows[0])}, which does not carry the answer's node id/marker ` +
            `(\`${HEAD_A}\`/\`${SNIPPET_ONE}\`) — the committed result MUST reach the rendered tree`,
        )
      }

      // ---- (c) COLLAPSE: ONE paint, `"false"`, NO fields, THE ROWS KEPT ----------------------------
      drive.resetCounters()
      problems.push(...driveSurface(surface, 'searchAdvancedToggle', [], 'Q3(c)'))
      await settle()
      problems.push(...onePaintProblems(drive.verdicts(), SEARCH, 'Q3(c)'))
      const closedFrame = liveFrame(drive, SEARCH)
      if (expandedOf(closedFrame) !== 'false') {
        problems.push(
          `limb Q3(c): after the second toggle \`#advanced-search-toggle\` authors data-expanded=${shown(expandedOf(closedFrame))}, not ` +
            `\`"false"\` — the toggle flips the pane's own state and the paint must carry the flip`,
        )
      }
      if (fieldsOf(closedFrame) !== undefined) {
        problems.push('limb Q3(c): the collapsed frame STILL authors `#advanced-search-fields` — the fields subtree must be dropped')
      }
      const keptRows = resultRowsOf(closedFrame)
      if (keptRows.length !== 1) {
        problems.push(
          `limb Q3(c): the collapsed frame authors ${keptRows.length} result row(s), not the ONE the query committed — "the ` +
            `advanced-search carrier survives" is the contract's own act, and it is the RESULT that must survive the disclosure's ` +
            `close (authored: ${shown(authoredText(closedFrame).slice(0, 400))})`,
        )
      }

      // ---- (d) A SECOND TOGGLE RESTORES THE FIELDS -------------------------------------------------
      drive.resetCounters()
      problems.push(...driveSurface(surface, 'searchAdvancedToggle', [], 'Q3(d)'))
      await settle()
      problems.push(...onePaintProblems(drive.verdicts(), SEARCH, 'Q3(d)'))
      const reopenedFrame = liveFrame(drive, SEARCH)
      if (expandedOf(reopenedFrame) !== 'true' || fieldsOf(reopenedFrame) === undefined) {
        problems.push(
          `limb Q3(d): the third toggle left data-expanded=${shown(expandedOf(reopenedFrame))} with the fields ` +
            `${fieldsOf(reopenedFrame) === undefined ? 'ABSENT' : 'present'} — the flip must be a real two-way carrier`,
        )
      }
      if (resultRowsOf(reopenedFrame).length !== 1) {
        problems.push('limb Q3(d): the reopened frame lost the committed result rows — the disclosure never owns the answer')
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb Q3 — the advanced-search carrier survives in BOTH directions (§6 Q3; §1 \`F-1\`; §2). ${problems.length} problem(s). An ` +
        `expanded disclosure must author \`#advanced-search-toggle[data-expanded="true"]\` + \`#advanced-search-fields\` AND the ` +
        `committed result rows; \`searchAdvancedToggle()\` must paint ONCE, flip to \`"false"\`, drop the fields and KEEP the rows; a ` +
        `second toggle must restore them. All readings walk the AUTHORED \`LegacyNodeData\` tree, never the DOM. envelope-class — the ` +
        `REAL host over the layout-less DOM shim; no rendered box, no pointer (G8-only)`,
    ).toEqual([])
  })

  it('T1 — a template change paints `pane-template-editor` ALONE and STILL requests the rebuild: `this.template` committed, ONE paint, the authored zone list NAMES the new zone, every other root the SAME OBJECT, 0/0/0, the re-read census all-zero, `requestRebuild(\'template\')` exactly once — and the SAME template is `unchanged` with the rebuild still called', async () => {
    // §6 `T1` (§1 `F-3`: `this.template` IS the page structure, so the rebuild STAYS and the fire is ADDITIVE, `ASM-B5-2`; §1 `F-4`:
    // the push carries the WHOLE template, so no `template.get()` re-read; §3's census; §4's ONE apply).
    // LAYER: envelope-class — the paint's verdict, the AUTHORED zone list (`li[data-template-zone]`), root IDENTITY, the recorded
    // `requestRebuild` calls and the bridge's census.
    // NON-VACUITY: the pane's authored zone list BEFORE the change names `main` and NOT the added zone (asserted first), so "the list
    // names the new zone" is a comparison of two authored values; the re-read census's zeros are floored by the SAME harness's
    // positive readings elsewhere (`Q1`'s `rag.query === 1`); and the CONTROL re-delivers the template the host already holds and must
    // answer `unchanged`, with the rebuild STILL called — so the fire is not the only reading and the rebuild is not conditional on
    // the value.
    // MUTATION THAT WOULD RED IT: the landed head (no fire, so zero verdicts and a stale zone list) reds the paint, `applied` and the
    // zone-name arms; a landing that REMOVES `requestRebuild('template')` reds the rebuild arms (and the control's); a landing that
    // re-reads `bridge.template.get` reds the census; a fire that commits AFTER it reds the authored zone list.
    const problems: string[] = []
    const drive = await seedHost({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const zoneNamesOf = (frame: unknown): string[] =>
        nodesWhere(frame, (record) => typeof propsOf(record)['data-template-zone'] === 'string').map((record) =>
          String(propsOf(record)['data-template-zone']),
        )
      const before = drive.roots()
      const bootPane = rootById(before, `pane-${TEMPLATE_EDITOR}`)
      if (bootPane === undefined) {
        problems.push(
          `limb T1: the seed carries NO live frame \`pane-${TEMPLATE_EDITOR}\` (roots read: [${rootIds(before).join(', ')}]) — the ` +
            `paint's subject has no frame`,
        )
      } else {
        const bootZones = zoneNamesOf(bootPane)
        if (!bootZones.includes(ZONE_DEFAULT) || bootZones.includes(ZONE_ADDED)) {
          problems.push(
            `limb T1: the seed's authored zone list reads ${shown(bootZones)}, not \`['${ZONE_DEFAULT}']\`-shaped (the default template) ` +
              `— "the list names the new zone" would be a comparison of two identical values`,
          )
        }
      }
      if (!rootIds(before).some((id) => id.startsWith('rag-'))) {
        problems.push('limb T1: the seed carries NO `rag-` document root — "every other root the SAME OBJECT" needs a non-pane subject too')
      }
      const template = templateWithExtraZone()
      drive.resetCounters()
      let threw = ''
      try {
        ;(drive.host as unknown as { onTemplateChanged(payload: unknown): void }).onTemplateChanged({ source: 'custom', template })
      } catch (error) {
        threw = String(error)
      }
      await settle()
      if (threw !== '') {
        problems.push(`limb T1: \`onTemplateChanged\` THREW (${threw}) — it is the handler main's broadcast reaches, never a throw site`)
      }
      if (fingerprint((drive.host as unknown as Record<string, unknown>)['template']) !== fingerprint(template)) {
        problems.push(
          `limb T1: \`this.template\` reads ${shown((drive.host as unknown as Record<string, unknown>)['template'])}, not the payload's ` +
            `template (${shown(template)}) — §2/\`F-4\`: the handler COMMITS the payload's template before it fires`,
        )
      }
      const verdicts = drive.verdicts()
      problems.push(...onePaintProblems(verdicts, TEMPLATE_EDITOR, 'T1'))
      const counters = drive.counters()
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(`limb T1: the template change read ${countersReading(counters)} — the fire is ADDITIVE to the rebuild, never a re-assembly`)
      }
      problems.push(...reReadCensusProblems(counters, { ragQuery: 0 }, 'T1'))
      if (fingerprint(drive.rebuildRequests()) !== fingerprint(['template'])) {
        problems.push(
          `limb T1: \`editController.requestRebuild\` reads ${shown(drive.rebuildRequests())}, not exactly \`['template']\` — §1 ` +
            `\`F-3\`/\`ASM-B7-4\`: \`this.template\` IS the page structure, so the rebuild STAYS (exactly once, with its kind)`,
        )
      }
      problems.push(...otherRootsProblems(before, drive.roots(), [`pane-${TEMPLATE_EDITOR}`], 'T1'))
      const fresh = appliedFrameOf(drive.applies(), `pane-${TEMPLATE_EDITOR}`)
      if (fresh === undefined) {
        problems.push(`limb T1: the paint never handed the runtime a fresh \`pane-${TEMPLATE_EDITOR}\` frame (applyContentReconcile calls: ${drive.applies().length})`)
      } else {
        const freshZones = zoneNamesOf(fresh)
        if (!freshZones.includes(ZONE_ADDED)) {
          problems.push(
            `limb T1: the fresh frame's authored zone list reads ${shown(freshZones)} and does NOT name the new zone ` +
              `\`${ZONE_ADDED}\` — the paint authors from \`buildTemplateContext().template\`, i.e. the template the handler just ` +
              `committed`,
          )
        }
        if (bootPane !== undefined && fingerprint(carriersOf(bootPane)) !== fingerprint(carriersOf(fresh))) {
          problems.push(
            `limb T1: the fresh frame's CARRIERS differ from the live frame's (live ${shown(carriersOf(bootPane))} vs fresh ` +
              `${shown(carriersOf(fresh))}) — a content update never re-derives the frame's identity carriers`,
          )
        }
      }
      const answers = drive.applyAnswers()
      if (answers.length !== 1 || fingerprint(answers[0]) !== fingerprint([`pane-${TEMPLATE_EDITOR}`])) {
        problems.push(`limb T1: the managed channel answered ${shown(answers)}, not exactly one call applying \`['pane-${TEMPLATE_EDITOR}']\``)
      }
      if (!drive.fires().includes(TEMPLATE_EDITOR)) {
        problems.push(
          `limb T1: the host made NO \`fire('${TEMPLATE_EDITOR}')\` (fires recorded: ${shown(drive.fires())}) — §2: the handler's ` +
            `answer is the template pane's OWN source, and the fire is what delivers it`,
        )
      }

      // ---- THE CONTROL: the SAME template value the host already holds → `unchanged`, rebuild STILL called ------
      const beforeControl = drive.roots()
      const controlPane = rootById(beforeControl, `pane-${TEMPLATE_EDITOR}`)
      drive.resetCounters()
      let controlThrew = ''
      try {
        ;(drive.host as unknown as { onTemplateChanged(payload: unknown): void }).onTemplateChanged({ source: 'custom', template })
      } catch (error) {
        controlThrew = String(error)
      }
      await settle()
      if (controlThrew !== '') {
        problems.push(`limb T1(control): \`onTemplateChanged\` with the SAME template THREW (${controlThrew})`)
      }
      const controlVerdicts = drive.verdicts()
      if (controlVerdicts.length !== 1) {
        problems.push(
          `limb T1(control): the SAME template produced ${controlVerdicts.length} verdict(s) ${shown(controlVerdicts)}, not exactly ` +
            `ONE — the fire is UNCONDITIONAL (\`O-2\`: the fire is not coalesced), and the paint is what answers \`unchanged\``,
        )
      } else if (controlVerdicts[0]['painted'] !== false || fingerprint(controlVerdicts[0]['applied']) !== fingerprint([])) {
        problems.push(
          `limb T1(control): the unchanged template answered ${shown(controlVerdicts[0])}, not \`painted:false\` with ` +
            `\`applied === []\` — a shape-equal re-render applies NOTHING`,
        )
      }
      if (fingerprint(drive.rebuildRequests()) !== fingerprint(['template'])) {
        problems.push(
          `limb T1(control): the unchanged template's \`requestRebuild\` reads ${shown(drive.rebuildRequests())}, not exactly ` +
            `\`['template']\` — the rebuild is NOT conditional on the value (§1 \`F-3\`: a template change IS a page-structure change)`,
        )
      }
      problems.push(...otherRootsProblems(beforeControl, drive.roots(), [`pane-${TEMPLATE_EDITOR}`], 'T1·control'))
      if (controlPane !== undefined && rootById(drive.roots(), `pane-${TEMPLATE_EDITOR}`) !== controlPane) {
        problems.push('limb T1(control): an `unchanged` template REPLACED the pane root — no root may move when nothing changed')
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb T1 — a template change paints the template pane ALONE and still requests the rebuild (§6 T1; §1 \`F-3\`/\`F-4\`; §3; ` +
        `\`ASM-B7-4\`). ${problems.length} problem(s). \`onTemplateChanged\` must commit \`this.template\`, FIRE (ONE paint, ` +
        `\`applied === ['pane-${TEMPLATE_EDITOR}']\`, the authored zone list naming \`${ZONE_ADDED}\`), leave every other root the SAME ` +
        `OBJECT, read \`0/0/0\` with the re-read census all-zero, and request \`requestRebuild('template')\` EXACTLY ONCE — while the ` +
        `SAME template answers \`unchanged\` with the rebuild still called. envelope-class — the REAL host over the layout-less DOM ` +
        `shim; no rendered box, no pointer (G8-only)`,
    ).toEqual([])
  })

  it('T2 — the VALIDATE VERDICT is the pane\'s own data: ONE paint, `#template-validation[data-validation="valid"]` authored, 0/0/0, and `requestRebuild` ZERO calls — while `templateValidateResult(null)` clears it with ONE paint', async () => {
    // §6 `T2` (§1 `F-3`: `this.templateValidation` reaches NOBODY but this pane's render, so the settled `requestRebuild()` is pure
    // waste and is REMOVED; §3's census).
    // LAYER: envelope-class — the paint's verdict, the AUTHORED validation node, the counters and the recorded `requestRebuild` calls.
    // NON-VACUITY: the pane authors NO `#template-validation` node before the seam runs (asserted first), so "the block was authored"
    // is a comparison of two authored states; the `requestRebuild === 0` reading is floored ON THE SAME HARNESS by `T1`'s positive
    // `['template']` rebuild reading (a controller double that never recorded anything could not read that one), and the CONTROL
    // (`null`) must CLEAR the block, so the arm cannot pass by a paint that always authors it.
    // MUTATION THAT WOULD RED IT: the landed head (the seam only requests a rebuild, so zero verdicts, no validation block, and a
    // recorded rebuild) reds all three arms; a landing that keeps `requestRebuild()` "for safety" reds the zero; a paint that authors
    // the block but leaves the old one standing reds the control.
    const problems: string[] = []
    const drive = await seedHost({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const surface = sidebarSurface()
      const validationOf = (frame: unknown): Record<string, unknown> | undefined => nodeWithId(frame, 'template-validation')
      const bootPane = liveFrame(drive, TEMPLATE_EDITOR)
      if (bootPane === undefined) {
        problems.push(`limb T2: the seed carries NO live \`pane-${TEMPLATE_EDITOR}\` frame — the verdict has no pane`)
      } else if (validationOf(bootPane) !== undefined) {
        problems.push('limb T2: the seed ALREADY authors `#template-validation` — "the block was authored by the verdict" would be vacuous')
      }
      const before = drive.roots()
      drive.resetCounters()
      problems.push(...driveSurface(surface, 'templateValidateResult', [{ ok: true, reason: '', detail: '' }], 'T2'))
      await settle()
      problems.push(...onePaintProblems(drive.verdicts(), TEMPLATE_EDITOR, 'T2'))
      const counters = drive.counters()
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(`limb T2: the validate verdict read ${countersReading(counters)} — \`INV-E\` pins all three at ZERO`)
      }
      problems.push(...reReadCensusProblems(counters, { ragQuery: 0 }, 'T2'))
      if (drive.rebuildRequests().length !== 0) {
        problems.push(
          `limb T2: the validate verdict requested ${shown(drive.rebuildRequests())} — \`F-3\`: \`this.templateValidation\` reaches ` +
            `NOBODY but this pane's render, so the rebuild is the removed re-assembly (\`ASM-B7-4\` keeps it for the TEMPLATE and ` +
            `removes it for the VERDICT)`,
        )
      }
      problems.push(...otherRootsProblems(before, drive.roots(), [`pane-${TEMPLATE_EDITOR}`], 'T2'))
      const paintedPane = liveFrame(drive, TEMPLATE_EDITOR)
      const block = validationOf(paintedPane)
      if (block === undefined) {
        problems.push(
          `limb T2: the painted frame authors NO \`#template-validation\` node (authored text: ` +
            `${shown(authoredText(paintedPane).slice(0, 400))}) — the verdict is the pane's OWN data and must reach the rendered tree`,
        )
      } else if (propsOf(block)['data-validation'] !== 'valid') {
        problems.push(
          `limb T2: \`#template-validation\` authors data-validation=${shown(propsOf(block)['data-validation'])}, not \`"valid"\` — ` +
            `\`template-pane.ts\`'s valid arm is a pure function of the recorded verdict`,
        )
      }

      // ---- THE CONTROL: `null` CLEARS the block, with ONE paint ------------------------------------
      const beforeControl = drive.roots()
      drive.resetCounters()
      problems.push(...driveSurface(surface, 'templateValidateResult', [null], 'T2·control'))
      await settle()
      problems.push(...onePaintProblems(drive.verdicts(), TEMPLATE_EDITOR, 'T2·control'))
      if (drive.rebuildRequests().length !== 0) {
        problems.push(`limb T2(control): clearing the verdict requested ${shown(drive.rebuildRequests())} — the removal is unconditional`)
      }
      const clearedPane = liveFrame(drive, TEMPLATE_EDITOR)
      if (validationOf(clearedPane) !== undefined) {
        problems.push(
          `limb T2(control): \`templateValidateResult(null)\` left \`#template-validation\` standing (authored: ` +
            `${shown(authoredText(clearedPane).slice(0, 400))}) — a null verdict CLEARS the feedback`,
        )
      }
      problems.push(...otherRootsProblems(beforeControl, drive.roots(), [`pane-${TEMPLATE_EDITOR}`], 'T2·control'))
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb T2 — the validate verdict is the pane's own data (§6 T2; §1 \`F-3\`; §3). ${problems.length} problem(s). ` +
        `\`templateValidateResult({ok:true,…})\` must paint \`pane-${TEMPLATE_EDITOR}\` ONCE, author ` +
        `\`#template-validation[data-validation="valid"]\`, read \`0/0/0\` and request \`requestRebuild\` ZERO times — while a \`null\` ` +
        `verdict clears the block with ONE paint. envelope-class — the REAL host over the layout-less DOM shim; no rendered box, no ` +
        `pointer (G8-only)`,
    ).toEqual([])
  })

  it('X1 — the census moves by exactly TWO here, by TWO more under `B-8` and by TWO more under `B-9`: `REPLUMBED_PANE_IDS` is the NINE-id SET with a `B-7` comment paragraph naming both causes (proven in BOTH directions), EVERY censused id answers `{fired:true,handlers:1}` — `settings`/`gnosis-status` included, so no family is pre-migration — and the pre-migration route still reaches `loadAppGraph` + `mountOperator`', async () => {
    // §6 `X1` (§4: the census moves by exactly TWO with a `B-7` cause paragraph naming both sources; the four families that keep
    // `refresh()`; `B-6`'s `F-12` anti-vacuous comment clause — a token search is NOT a cause sentence).
    // LAYER: envelope-class — the module's exported VALUE, the source TEXT (comments read as PARAGRAPHS), the REAL channel's answers
    // and the `refresh()` floor on this double.
    // NON_VACUITY: the `fired:false, handlers:0` loop is floored by the SAME channel answering `fired:true, handlers:1` for
    // `crosslinks` (a landed arm) AND for each of the relocated NINE ids — and after ⟨UNIT `B-9` §6 `O1`⟩ it is EMPTY: `settings` and
    // `gnosis-status` are listeners too, so no family is pre-migration and the loop is a live zero rather than a claim; the comment
    // clause is proven in BOTH directions HERE (the
    // shipped file must be GREEN and the PRE-LANDING fixture — a census MOVED with the `B-7` paragraph ABSENT — must be RED, so a
    // relapse into a window-wide token search reds this row); and the `refresh()` floor (`loadAppGraph` + `mountOperator` both move)
    // is the positive that makes the integration rows' `INV-E` zeroes readable.
    // MUTATION THAT WOULD RED IT: a census of three (the landed head) reds the SET arm and each relocated id's listener arm; adding a
    // SIXTH id (a silent second subscriber) or dropping one reds the SET arm; entombing the move in code with no `B-7` paragraph reds
    // the comment clause; subscribing any censused family to the channel reds its `handlers:0` arm; a host whose `refresh()` no longer
    // re-assembles reds the floor and would make every zero in this file unreadable.
    const problems: string[] = []

    // ---- (1) THE CONSTANT (through `await import()`, per the reachability rule) --------------------
    // ⟨RE-STATED BY `B-8` (`D-44`, §12a): the recorded VALUE moves to the seven-id set; the SUBJECT (a pinned census, floored by the
    // `B-7` cause clause and by the `refresh()` floor) and the TEETH are unchanged — an extra id, a dropped id or a duplicate still
    // reds.⟩
    let hostModule: Record<string, unknown> | null = null
    try {
      hostModule = (await import('../../../src/renderer/sidebar-panes.js')) as Record<string, unknown>
    } catch (error) {
      problems.push(`limb X1: \`${SIDEBAR_FILE}\` does not resolve as a module (${String(error)}) — the pinned census's home is unreadable`)
    }
    const replumbed = hostModule === null ? undefined : hostModule['REPLUMBED_PANE_IDS']
    if (replumbed === undefined) {
      problems.push(
        `limb X1: \`REPLUMBED_PANE_IDS\` does not resolve on \`src/renderer/sidebar-panes.js\` — §4 pins it as the ONE declared ` +
          `constant naming the panes whose paint the host registers on the channel: exactly ${shown(PINNED_REPLUMBED)}`,
      )
    } else {
      const read = Array.isArray(replumbed) ? replumbed.map(String) : null
      const asSet = read === null ? null : [...new Set(read)].sort()
      const wantedSet = [...new Set(PINNED_REPLUMBED)].sort()
      if (asSet === null) {
        problems.push(`limb X1: \`REPLUMBED_PANE_IDS\` reads ${shown(replumbed)}, not an array of pane ids`)
      } else if (fingerprint(asSet) !== fingerprint(wantedSet)) {
        problems.push(
          `limb X1: \`REPLUMBED_PANE_IDS\` reads ${shown(read)}, whose SET is ${shown(asSet)}, not ${shown(wantedSet)} — §4: the census ` +
            `moves by TWO here (\`['gnosis-query','crosslinks','doc-nav']\` -> \`[ …, 'search', 'template-editor']\`), by TWO MORE ` +
            `under \`B-8\` (\`D-44\`: \`[ …, 'gnosis-documents', 'gnosis-wikis']\`) and by TWO MORE under ` +
            `⟨UNIT \`B-9\` §4 \`F-9\`/§6 \`O1\`⟩ (\`[ …, 'settings', 'gnosis-status']\`), and this unit's ` +
            `TWO panes must both be in it, or their fires reach no listener at all`,
        )
      }
      // ⟨INVERTED BY UNIT `B-9` (§3/§4, §6 `O1`) — THE SAME ARM, THE OPPOSITE READING: this arm used to RED when the census named
      // `settings` ("the operator pane is `B-9`'s surface and `updatePane` answers `operator-scope` for it"). §3 replaced that
      // refusal with the operator surface's OWN retained-graph paint, so the pane MUST now be a census member: an operator pane
      // outside the census can never receive its fire, whatever its paint answers.
      if (read !== null && !read.includes(SETTINGS)) {
        problems.push(
          `limb X1: \`REPLUMBED_PANE_IDS\` does NOT name \`${SETTINGS}\` — ⟨UNIT \`B-9\` §4\⟩ the operator pane MUST be in the ` +
            `census now: \`paintPane\`'s operator arm is a ROUTE to the operator surface's own retained-graph paint (§3), so the pane ` +
            `is paintable and a census without it leaves its fire with no listener`,
        )
      }
      for (const paneId of [SEARCH, TEMPLATE_EDITOR]) {
        if (read !== null && read.filter((id) => id === paneId).length > 1) {
          problems.push(`limb X1: \`REPLUMBED_PANE_IDS\` names \`${paneId}\` more than once — ONE id, ONE subscriber (\`B2-ADV-04\`)`)
        }
      }
    }

    // ---- (2) THE SOURCE CLAUSE: the `B-7` CAUSE PARAGRAPH, BOTH DIRECTIONS -------------------------
    let sidebarText = ''
    try {
      sidebarText = readText(SIDEBAR_FILE)
    } catch (error) {
      problems.push(`limb X1: \`${SIDEBAR_FILE}\` is unreadable (${String(error)}) — the census's comment clause has no subject`)
    }
    if (sidebarText !== '') {
      problems.push(...censusCauseProblems(sidebarText, `\`${SIDEBAR_FILE}\``, 'limb X1(2)'))
      // THE RED DIRECTION, from the SAME committed clause: the PRE-LANDING block with the census MOVED and NO `B-7` paragraph.
      const fixtureLines = [...PRE_LANDING_CENSUS_BLOCK.slice(0, -1), MOVED_CENSUS_DECLARATION]
      const fixtureText = fixtureLines.join('\n')
      if (!CENSUS_PANES.every((pattern) => pattern.test(MOVED_CENSUS_DECLARATION))) {
        problems.push(
          `limb X1(2·proof): the CENSUS-MOVED fixture's declaration reads ${shown(MOVED_CENSUS_DECLARATION)} and does not name BOTH ` +
            `panes — it no longer simulates the defect (a moved census with no B-7 cause), so the red direction is moot`,
        )
      }
      if (/\bB-7\b/.test(fixtureText)) {
        problems.push(
          `limb X1(2·proof): the PRE-LANDING fixture now carries a \`B-7\` marker — it no longer reproduces the head this unit's ` +
            `cause paragraph was absent from, so the red direction below would prove nothing`,
        )
      }
      // THE GREEN DIRECTION'S OWN SATISFIABILITY PROOF: a clause that can only ever RED would red every correct landing, so the
      // SAME instrument is run over a synthetic LANDED docblock (the pre-landing block + ONE `B-7` cause paragraph naming both panes
      // and a cause word) and must ACCEPT it. Nothing here is read off `src/**`; it is the proof that the shipped reading above is a
      // measurement and not an artefact of the clause.
      const landedFixture = [
        ...PRE_LANDING_CENSUS_BLOCK.slice(0, -1),
        ' *  ⟨Unit `B-7` — THE ROW MOVED BY EXACTLY TWO, AND HERE IS THE CAUSE.⟩ `search` joins because its data IS the query RESULT',
        ' *  and `template-editor` because its data IS the template STORE: each producer commits its field in the same tick and then',
        ' *  FIRES its own pane, so neither owes a re-read.⟩ */',
        MOVED_CENSUS_DECLARATION,
      ].join('\n')
      const landedProblems = censusCauseProblems(landedFixture, 'the LANDED-CAUSE fixture', 'limb X1(2·proof·green)')
      if (landedProblems.length > 0) {
        problems.push(
          `limb X1(2·proof·green): the comment clause REJECTED a docblock that names \`B-7\`, \`search\`, \`template-editor\` AND a ` +
            `cause word in ONE paragraph — ${shown(landedProblems)}. A clause that cannot go GREEN would red every correct landing, so ` +
            `this fixture is the clause's satisfiability proof`,
        )
      }
      const movedProblems = censusCauseProblems(fixtureText, 'the CENSUS-MOVED-WITH-NO-`B-7`-CAUSE fixture', 'limb X1(2·proof)')
      if (movedProblems.length === 0) {
        problems.push(
          `limb X1(2·proof): the clause ACCEPTED a census that MOVED (all five ids) while NO \`B-7\` cause paragraph stands beside the ` +
            `declaration — this is EXACTLY the wrong landing §4's MUTATION note claims reds, so the clause must anchor on the ` +
            `SENTENCE naming both panes, not on a window that happens to contain the tokens`,
        )
      }
    }

    // ---- (3) THE CHANNEL CENSUS + THE FLOOR, ON ONE BOOTED HOST -------------------------------------
    const drive = await seedHost({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const channel = drive.channel
      // THE POSITIVE CONTROL FIRST: a LANDED arm answers `fired:true, handlers:1` (without this the `handlers:0` arms below would be
      // satisfied by a host that subscribed nothing at all).
      const positive = channel.fire(CROSSLINKS)
      if (positive.fired !== true || positive.handlers !== 1) {
        problems.push(
          `limb X1: \`fire('${CROSSLINKS}')\` answered ${shown(positive)}, not \`fired:true, handlers:1\` — §4's boot loop subscribes ` +
            `ONE handler per census id, so the census IS a listener set on this channel`,
        )
      }
      // EVERY censused id answers `fired:true, handlers:1` — the move is a REGISTRATION, not only a constant. ⟨`B-8`'s two ids are in
      // the PINNED list, so this loop now also reads `gnosis-documents`/`gnosis-wikis` as listeners: that is the `D-44` arm, and it is
      // why the negative family list below lost exactly those two. ⟨UNIT `B-9` §6 `O1`⟩ THE SAME READ AGAIN FOR `settings`/
      // `gnosis-status`: they are in `PINNED_REPLUMBED` now, so this loop reads them as listeners (`fired:true, handlers:1` — ONE
      // registration each) and `PRE_MIGRATION_PANES` is empty for exactly that reason.⟩
      for (const paneId of PINNED_REPLUMBED) {
        const report = channel.fire(paneId)
        if (report.fired !== true || report.handlers !== 1) {
          problems.push(
            `limb X1: \`fire('${paneId}')\` answered ${shown(report)}, not \`fired:true, handlers:1\` — §4: \`boot\`'s loop subscribes ` +
              `ONE handler per \`REPLUMBED_PANE_IDS\` id (and never a second, \`B2-ADV-04\`), so every id in the census must answer`,
          )
        }
      }
      // THE NEGATIVES: ⟨UNIT `B-9` §4 `F-9`/§6 `O1` — THE LOOP STAYS, THE LIST IS EMPTY.⟩ After `B-9` NO family keeps the
      // pre-migration route (`gnosis-documents`/`gnosis-wikis` left this list under `B-8`; `settings`/`gnosis-status` leave it here,
      // and they are POSITIVE arms in the loop above), so this loop reads ZERO every run — and it is kept DELIBERATELY as the live
      // floor that no family is pre-migration: the day a landing adds an id here while still subscribing it, that `fire` reads
      // `fired:true, handlers:1` and this reds by name. An empty list is a reading about the head, never a reason to drop an arm.
      for (const paneId of PRE_MIGRATION_PANES) {
        const report = channel.fire(paneId)
        if (report.fired !== false || report.handlers !== 0) {
          problems.push(
            `limb X1: \`fire('${paneId}')\` answered ${shown(report)}, not \`fired:false, handlers:0\` — \`${paneId}\` is NOT in ` +
              `\`REPLUMBED_PANE_IDS\`: it keeps the pre-migration \`refresh()\` route until its own unit (§4: the migration is ` +
              `incremental, never a big bang)`,
          )
        }
      }
      if (fingerprint(channel.changePanes()) !== fingerprint([DOC_NAV])) {
        problems.push(
          `limb X1: \`changePanes()\` reads ${shown(channel.changePanes())}, not exactly \`['${DOC_NAV}']\` — §2: NEITHER of this ` +
            `unit's panes joins \`CHANGE_INTERESTED_PANE_IDS\` (no engine frame can change a query answer or a stored template)`,
        )
      }
      // THE FLOOR: `host.refresh()` re-assembles on THIS double.
      drive.resetCounters()
      let refreshThrew = ''
      try {
        await drive.host.refresh()
      } catch (error) {
        refreshThrew = String(error)
      }
      if (refreshThrew !== '') {
        problems.push(`limb X1: \`host.refresh()\` THREW on this harness (${refreshThrew}) — the pre-migration route is the floor and must run`)
      }
      const floor = drive.counters()
      if (floor.loadAppGraph < 1) {
        problems.push(
          `limb X1: \`host.refresh()\` reached \`loadAppGraph\` ${floor.loadAppGraph} time(s), not >= 1 — with this false, every ` +
            `\`loadAppGraph === 0\` reading in this file could not discriminate`,
        )
      }
      if (floor.mountOperator < 1) {
        problems.push(
          `limb X1: \`host.refresh()\` reached \`mountOperator\` ${floor.mountOperator} time(s), not >= 1 — the pre-migration route ` +
            `re-assembles BOTH surfaces`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb X1 — the census moves by exactly TWO and every other family keeps \`refresh()\` (§6 X1; §4; \`B-6\`'s \`F-12\`). ` +
        `${problems.length} problem(s). \`REPLUMBED_PANE_IDS\` must be exactly the SEVEN-id SET ` +
        `\`{gnosis-query, crosslinks, doc-nav, search, template-editor, gnosis-documents, gnosis-wikis}\` (\`B-8\`'s two included), ` +
        `carry a \`B-7\` COMMENT PARAGRAPH naming both panes and a ` +
        `cause (proven in both directions: the shipped file GREEN, the census-moved-with-no-cause fixture RED), each censused id must ` +
        `answer \`fired:true, handlers:1\`, the TWO operator families must answer \`fired:false, handlers:0\`, and \`host.refresh()\` ` +
        `must still reach \`loadAppGraph\` + \`mountOperator\`. envelope-class`,
    ).toEqual([])
  })

  it('X2 — NEITHER pane touches the other and NEITHER follows the engine: `fire(search)` paints `pane-search` and leaves `pane-template-editor` the SAME OBJECT (the mirror), `fire(doc-nav)`/`fire(crosslinks)` paint neither, `changePanes()` is exactly `[doc-nav]`, and `publishChange()` paints neither', async () => {
    // §6 `X2` (`B-3`'s `r2`, re-driven on THESE panes; §2: the discriminator between the two panes' sources is the ENTRY, not a
    // payload — neither can reach the other's registration).
    // LAYER: envelope-class — the channel's own `fire`/`publishChange` reports, the paint verdicts and root IDENTITY.
    // NON_VACUITY: each direction asserts its OWN pane PAINTED (a positive, the moved source supplied by a settled query), so
    // "the other pane did not move" is read beside a real move rather than beside silence — and the `fire(doc-nav)` arm asserts that
    // SOME pane painted (`pane-doc-nav`), so "neither of the two" is not a reading of a dead channel.
    // MUTATION THAT WOULD RED IT: the landed head (search/template-editor are not censused, so both fires reach no listener) reds the
    // two positive arms; a landing that registers one pane's handler under BOTH ids reds the cross-isolation arms; adding either pane
    // to `CHANGE_INTERESTED_PANE_IDS` reds `changePanes()` and the `publishChange()` arm.
    // ⟨RE-AUTHORED (`B7-F5`) — the two positive arms (a) and (b) now drive their producer WHILE THE PANE IS DISABLED and enable it
    // before the channel fire, so the fire is the ONLY deliverer of a state that moved and was never painted. As filed each fired the
    // channel AFTER its producer had already painted that state and demanded `painted:true`, which no lawful host can answer
    // (`ASM-B7-1`: no re-read arm; `ASM-B7-2`/`F-4` refuse the only two alternatives). Every assertion is kept — `fired:true`,
    // `onePaintProblems`, the applied list naming the pane's own root, the other pane the SAME OBJECT, no `template-editor` verdict in
    // (a), and `changePanes()`/`publishChange()` — and the two `registry` reads are new POSITIVE proof that the disable/enable took.⟩
    const problems: string[] = []
    const drive = await seedHost({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const surface = sidebarSurface()
      const appliedSince = (mark: number): string[][] => drive.applyAnswers().slice(mark)

      // ---- (a) `fire(SEARCH)` PAINTS THE SEARCH PANE AND NOT THE TEMPLATE PANE ----------------------
      // ⟨`B7-F5` — THE PRODUCER DRIVES WHILE THE PANE IS DISABLED, SO THE FIRE IS THE ONLY DELIVERER.⟩ The search pane's source
      // moves FIRST, through its own producer, while `search` is DISABLED: the settlement commits `lastQueryResult` and fires, and
      // THAT fire's paint answers its declared word `not-enabled` — so nothing has been painted. The pane is then ENABLED and the
      // channel is fired: the state really moved and has never been painted, so the paint below is a real paint. (As filed this arm
      // fired the channel AFTER the producer had already painted that very state and demanded `painted:true` — `unchanged` is the
      // LAWFUL answer (`ASM-B7-1`: no re-read arm; `ASM-B7-2` refuses a `rag.query` re-issue; `F-4` refuses a `template.get`), so no
      // lawful host could satisfy it.)
      drive.registry.disable(SEARCH)
      if (drive.registry.isEnabled(SEARCH) !== false) {
        problems.push(`limb X2(a): \`registry.disable('${SEARCH}')\` did not take — the fire below would not be the only deliverer`)
      }
      problems.push(...driveSurface(surface, 'submitQuery', [PROBE_TERM], 'X2·seed'))
      await settle()
      drive.registry.enable(SEARCH)
      if (drive.registry.isEnabled(SEARCH) !== true) {
        problems.push(`limb X2(a): \`registry.enable('${SEARCH}')\` did not take — the fire below would paint nothing`)
      }
      const beforeSearchFire = drive.roots()
      const templatePaneBefore = rootById(beforeSearchFire, `pane-${TEMPLATE_EDITOR}`)
      drive.resetCounters()
      let mark = drive.applyAnswers().length
      const searchReport = drive.channel.fire(SEARCH)
      await settle()
      if (searchReport.fired !== true) {
        problems.push(
          `limb X2(a): \`fire('${SEARCH}')\` answered ${shown(searchReport)} — §4: \`search\` IS in the census, so the host's own ` +
            `registration stands on this channel`,
        )
      }
      problems.push(...onePaintProblems(drive.verdicts(), SEARCH, 'X2(a)'))
      const searchApplied = appliedSince(mark)
      if (!searchApplied.some((ids) => ids.includes(`pane-${SEARCH}`))) {
        problems.push(`limb X2(a): the \`${SEARCH}\` fire applied ${shown(searchApplied)} — the pane's own root is the subject`)
      }
      const templatePaneAfter = rootById(drive.roots(), `pane-${TEMPLATE_EDITOR}`)
      if (templatePaneBefore !== undefined && templatePaneAfter !== templatePaneBefore) {
        problems.push(
          `limb X2(a): a \`${SEARCH}\` fire RE-MINTED \`pane-${TEMPLATE_EDITOR}\` — §2: neither pane can reach the other's ` +
            `registration, and a paint reconciles ONE root`,
        )
      }
      if (drive.verdicts().some((verdict) => verdict['paneId'] === TEMPLATE_EDITOR)) {
        problems.push(`limb X2(a): a \`${SEARCH}\` fire produced a \`${TEMPLATE_EDITOR}\` verdict ${shown(drive.verdicts())}`)
      }

      // ---- (b) THE MIRROR: `fire(TEMPLATE_EDITOR)` PAINTS THE TEMPLATE PANE AND NOT THE SEARCH PANE --
      // ⟨`B7-F5` — THE SAME SHAPE, MIRRORED:⟩ the template pane's source moves FIRST through its own producer while
      // `template-editor` is DISABLED — the handler commits `this.template` and fires, and that fire's paint answers
      // `not-enabled`, so nothing is painted — then the pane is ENABLED and the channel is fired. The state moved and was never
      // painted, so the fire is the only deliverer; as filed this arm fired AFTER the producer had painted that state.
      drive.registry.disable(TEMPLATE_EDITOR)
      if (drive.registry.isEnabled(TEMPLATE_EDITOR) !== false) {
        problems.push(`limb X2(b): \`registry.disable('${TEMPLATE_EDITOR}')\` did not take — the fire below would not be the only deliverer`)
      }
      drive.resetCounters()
      try {
        ;(drive.host as unknown as { onTemplateChanged(payload: unknown): void }).onTemplateChanged({ source: 'custom', template: templateWithExtraZone() })
      } catch (error) {
        problems.push(`limb X2(b): \`onTemplateChanged\` THREW (${String(error)})`)
      }
      await settle()
      drive.registry.enable(TEMPLATE_EDITOR)
      if (drive.registry.isEnabled(TEMPLATE_EDITOR) !== true) {
        problems.push(`limb X2(b): \`registry.enable('${TEMPLATE_EDITOR}')\` did not take — the fire below would paint nothing`)
      }
      const beforeTemplateFire = drive.roots()
      const searchPaneBefore = rootById(beforeTemplateFire, `pane-${SEARCH}`)
      drive.resetCounters()
      mark = drive.applyAnswers().length
      const templateReport = drive.channel.fire(TEMPLATE_EDITOR)
      await settle()
      if (templateReport.fired !== true) {
        problems.push(
          `limb X2(b): \`fire('${TEMPLATE_EDITOR}')\` answered ${shown(templateReport)} — §4: \`template-editor\` IS in the census`,
        )
      }
      problems.push(...onePaintProblems(drive.verdicts(), TEMPLATE_EDITOR, 'X2(b)'))
      const templateApplied = appliedSince(mark)
      if (!templateApplied.some((ids) => ids.includes(`pane-${TEMPLATE_EDITOR}`))) {
        problems.push(`limb X2(b): the \`${TEMPLATE_EDITOR}\` fire applied ${shown(templateApplied)} — the pane's own root is the subject`)
      }
      const searchPaneAfter = rootById(drive.roots(), `pane-${SEARCH}`)
      if (searchPaneBefore !== undefined && searchPaneAfter !== searchPaneBefore) {
        problems.push(`limb X2(b): a \`${TEMPLATE_EDITOR}\` fire RE-MINTED \`pane-${SEARCH}\` — the mirror of the isolation law`)
      }

      // ---- (c) THE OTHER TWO PANES' FIRES PAINT NEITHER OF THIS UNIT'S PANES ------------------------
      for (const otherId of [DOC_NAV, CROSSLINKS]) {
        const beforeOther = drive.roots()
        const searchBefore = rootById(beforeOther, `pane-${SEARCH}`)
        const templateBefore = rootById(beforeOther, `pane-${TEMPLATE_EDITOR}`)
        drive.resetCounters()
        mark = drive.applyAnswers().length
        const report = drive.channel.fire(otherId)
        await settle()
        if (report.fired !== true) {
          problems.push(`limb X2(c): \`fire('${otherId}')\` answered ${shown(report)} — that registration is \`B-5\`/\`B-6\`'s landed arm`)
        }
        // THE POSITIVE: that fire DID reach its own pane's paint (without this, "painted neither" is a reading of a dead channel).
        // A PAINT is not available here on purpose: this double answers the SAME backlinks/doc-heads list on every read, so
        // `B-5`/`B-6`'s panes lawfully answer `unchanged`. What this arm floors is the DISPATCH — the fire reached exactly ONE
        // registration and that registration ran its pane's dispatch.
        const otherOwn = drive.verdicts().filter((verdict) => verdict['paneId'] === otherId)
        if (otherOwn.length !== 1) {
          problems.push(
            `limb X2(c): \`fire('${otherId}')\` produced ${otherOwn.length} verdict(s) naming \`${otherId}\` ` +
              `(applied: ${shown(appliedSince(mark))}) — this arm's "neither of this unit's panes moved" must sit beside a channel ` +
              `whose dispatch REACHES the pane it names`,
          )
        }
        if (searchBefore !== undefined && rootById(drive.roots(), `pane-${SEARCH}`) !== searchBefore) {
          problems.push(`limb X2(c): a \`${otherId}\` fire RE-MINTED \`pane-${SEARCH}\` — no engine/edge source changes a query answer`)
        }
        if (templateBefore !== undefined && rootById(drive.roots(), `pane-${TEMPLATE_EDITOR}`) !== templateBefore) {
          problems.push(`limb X2(c): a \`${otherId}\` fire RE-MINTED \`pane-${TEMPLATE_EDITOR}\` — no engine/edge source changes a stored template`)
        }
      }

      // ---- (d) `changePanes()` IS STILL EXACTLY `[doc-nav]` AND `publishChange()` PAINTS NEITHER ------
      if (fingerprint(drive.channel.changePanes()) !== fingerprint([DOC_NAV])) {
        problems.push(
          `limb X2(d): \`changePanes()\` reads ${shown(drive.channel.changePanes())}, not exactly \`['${DOC_NAV}']\` — §2/\`O-3\`: ` +
            `\`CHANGE_INTERESTED_PANE_IDS\` is UNCHANGED by this unit`,
        )
      }
      const beforePublish = drive.roots()
      const searchBeforePublish = rootById(beforePublish, `pane-${SEARCH}`)
      const templateBeforePublish = rootById(beforePublish, `pane-${TEMPLATE_EDITOR}`)
      drive.resetCounters()
      mark = drive.applyAnswers().length
      const reports = drive.channel.publishChange()
      await settle()
      const publishedApplied = appliedSince(mark)
      if (searchBeforePublish !== undefined && rootById(drive.roots(), `pane-${SEARCH}`) !== searchBeforePublish) {
        problems.push(`limb X2(d): \`publishChange()\` RE-MINTED \`pane-${SEARCH}\` — neither pane follows the engine`)
      }
      if (templateBeforePublish !== undefined && rootById(drive.roots(), `pane-${TEMPLATE_EDITOR}`) !== templateBeforePublish) {
        problems.push(`limb X2(d): \`publishChange()\` RE-MINTED \`pane-${TEMPLATE_EDITOR}\` — neither pane follows the engine`)
      }
      if (publishedApplied.some((ids) => ids.includes(`pane-${SEARCH}`) || ids.includes(`pane-${TEMPLATE_EDITOR}`))) {
        problems.push(`limb X2(d): \`publishChange()\` applied ${shown(publishedApplied)} — it must reach \`${DOC_NAV}\` alone`)
      }
      void reports
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb X2 — neither pane touches the other and neither follows the engine (§6 X2; §2; \`r2\`). ${problems.length} problem(s). ` +
        `A \`fire('${SEARCH}')\` must paint \`pane-${SEARCH}\` and leave \`pane-${TEMPLATE_EDITOR}\` the SAME OBJECT; a ` +
        `\`fire('${TEMPLATE_EDITOR}')\` is the mirror; \`fire('${DOC_NAV}')\`/\`fire('${CROSSLINKS}')\` must paint NEITHER of this ` +
        `unit's panes while painting their own; \`changePanes()\` must be exactly \`['${DOC_NAV}']\`; and \`publishChange()\` must paint ` +
        `neither. envelope-class — the REAL channel's own reports + the paint verdicts over the layout-less DOM shim`,
    ).toEqual([])
  })

  it('X3 — `INV-E` and SEVEN measured mutants (m1 refresh, m2 loadAppGraph, m3 mountOperator, m4 a no-op, m5 a re-assembly, m6-search and m6-template — the fire REMOVED per pane), each printing its COMPUTED reading', async () => {
    // §6 `X3` (§1/§4: `INV-E`'s subject is the PANE UPDATE's body; §6's "the row must be able to FAIL"; `B3-ADV-01`: every mutant's
    // reading is COMPUTED, never an authored sentence; `O-2`: the fire is UNCOALESCED and that is the cost row).
    // LAYER: envelope-class — the three counters wrapped on the instance, the bridge's census, the applied list's CONTENT and the
    // AUTHORED text beside them.
    // NON_VACUITY: (i) needs a paint that LANDED (the root object changed AND the channel answered an apply), so `0/0/0` is a reading
    // of a REAL update; each of m1..m5 must be CAUGHT on this same harness shape; and each `m6` carries a FLOOR (the same settled
    // query/template on the events-present seed DOES paint) so the mutants' `0 paints` cannot be two dead harnesses.
    // m5 — THE COUNTERS CANNOT SEE IT (§6's own sentence): a content re-derive reads `0/0/0` too, so the discriminating observables are
    // the applied list's CONTENT (it names roots the pane does not own) AND the fact that the pane was stale BEFORE the re-assembly
    // ran — which is exactly the state the real paint exists to answer.
    // m6 — ONE PER PANE, chosen because the three counters CANNOT see it: with the fire removed the source still commits, `INV-E`
    // holds PERFECTLY (0/0/0), ZERO paints happen, and the pane still names the OLD answer while the source has moved.
    // MUTATION THAT WOULD RED IT: any pane update that reaches `refresh()`/`loadAppGraph`/`mountOperator` reds (i) — which is exactly
    // what m1–m3 prove this harness SEES; a paint that applies no root while the source DID move reds m4's positive half; a landing
    // whose settlement paints nothing leaves m6's "the fire is load-bearing" comparison unprovable.
    const problems: string[] = []
    const mutants: string[] = []

    // ---- (i) THE DIRECT ARM: the producers' OWN dispatches paint, and the zeroes are read off a LANDED paint ----
    const live = await seedHost({ events: true })
    try {
      problems.push(...live.bootProblems)
      if (!live.hostSubscribed) {
        problems.push('limb X3(i): the harness did not hand the host its `events` channel — the boot-time subscriptions have no subject')
      }
      const surface = sidebarSurface()
      const beforePane = liveFrame(live, SEARCH)
      if (beforePane === undefined) {
        problems.push(`limb X3(i): the seed carries no live \`pane-${SEARCH}\` frame (roots: [${rootIds(live.roots()).join(', ')}]) — INV-E needs a pane that CAN paint`)
      }
      live.resetCounters()
      problems.push(...driveSurface(surface, 'submitQuery', [PROBE_TERM], 'X3(i)'))
      await settle()
      const landed = live.counters()
      const afterPane = liveFrame(live, SEARCH)
      if (beforePane !== undefined && afterPane === beforePane) {
        problems.push('limb X3(i): the settlement left the pane root the SAME OBJECT — the zeroes prove nothing on a paint that did not land')
      }
      problems.push(...onePaintProblems(live.verdicts(), SEARCH, 'X3(i)'))
      problems.push(...reReadCensusProblems(landed, { ragQuery: 1 }, 'X3(i)'))
      if (landed.refresh !== 0 || landed.loadAppGraph !== 0 || landed.mountOperator !== 0) {
        problems.push(
          `limb X3(i): the pane update read ${countersReading(landed)} — \`INV-E\` pins \`0 loadAppGraph\`, \`0 mountOperator\`, ` +
            `\`0 refresh()\` on a pane update (§1/§4: the counters are the PANE UPDATE's own)`,
        )
      }
      mutants.push(
        `(i) the landed paint: ${countersReading(landed)} applied=${shown(live.applyAnswers())} ` +
          `paneRootReminted=${String(beforePane !== undefined && afterPane !== beforePane)}`,
      )
    } finally {
      live.restore()
    }

    // ---- (ii)/(iii) m1..m5, ON A NO-`events` SEED (the `B-5` `L5` shape): the mutant is the ONLY handler -------
    //   A live host registration beside the mutant would make `m4`'s `painted:false` a reading of the REAL path, and `m5`'s re-derive
    //   would only be adding to it. `m1`..`m3` need no host path at all (their reading is the counter the mutant moves).
    const sandbox = await seedHost({ events: false })
    try {
      problems.push(...sandbox.bootProblems)
      if (sandbox.hostSubscribed) {
        problems.push(
          'limb X3(ii): the m1..m5 seed handed the host an `events` channel — the host\'s real paint would then run beside every ' +
            'mutant and each reading would be the REAL path, not the mutant\'s',
        )
      }
      const surface = sidebarSurface()
      const channel = sandbox.channel

      interface Mutant {
        label: string
        why: string
        handler: () => void
        reading: () => string
        caught: () => boolean
      }

      const runMutant = async (mutant: Mutant): Promise<void> => {
        sandbox.resetCounters()
        const release = channel.subscribe(SEARCH, mutant.handler)
        let fireThrew = ''
        try {
          channel.fire(SEARCH)
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
          void sandbox.host.refresh()
        },
        reading: () => countersReading(sandbox.counters()),
        caught: () => sandbox.counters().refresh >= 1,
      })

      // m2 — the re-assembly: `loadAppGraph`.
      await runMutant({
        label: 'm2 loadAppGraph',
        why: 'a re-assembly must register on the loadAppGraph counter AND on the envelope load',
        handler: () => {
          const priv = sandbox.host as unknown as Record<string, unknown>
          ;(priv['loadAppGraph'] as (a: unknown, b: unknown) => unknown)(priv['runtime'], priv['lastTraversalEnvelope'])
        },
        reading: () => countersReading(sandbox.counters()),
        caught: () => sandbox.counters().loadAppGraph >= 1 && sandbox.counters().loadEnvelopes >= 1,
      })

      // m3 — the operator re-mount.
      await runMutant({
        label: 'm3 mountOperator',
        why: 'an operator re-mount must register on the mountOperator counter',
        handler: () => {
          sandbox.host.mountOperator()
        },
        reading: () => countersReading(sandbox.counters()),
        caught: () => sandbox.counters().mountOperator >= 1,
      })

      // m4 — a NO-OP handler: the pane's SOURCE moved, the handler painted nothing, and the REAL paint seam over the very same state
      // DOES paint. The seam call is the positive half, so `painted:false`/`applied:[]` is a computed value and not an authored word.
      sandbox.setQueryAnswer(queryAnswer(SNIPPET_ONE))
      problems.push(...driveSurface(surface, 'submitQuery', [PROBE_TERM], 'X3·m4·source'))
      await settle()
      const sourceMoved = (sandbox.host as unknown as Record<string, unknown>)['lastQueryResult'] !== null
      const paneStaleBeforeM4 = ((): boolean => {
        const frame = liveFrame(sandbox, SEARCH)
        return frame !== undefined && !authoredText(frame).includes(SNIPPET_ONE)
      })()
      sandbox.setSnapshot({
        store: 'main',
        nodes: [{ id: HEAD_A, type: 'h1', content: 'Doc A MOVED', ownedNodeIds: [], createdAt: NOW, updatedAt: NOW }],
        edges: [{ id: 'dh1', kind: 'doc-head', source: HEAD_A, target: DOC_A, createdAt: NOW, updatedAt: NOW, documentIds: [DOC_A] }],
      })
      // THE SEAM IS DRIVEN ONCE AND ITS VERDICT CACHED: a second `updatePane` over the state the first one just applied would lawfully
      // answer `unchanged`, so a `caught()` that re-drove it could never see the positive half it asserts.
      let m4Seam: Record<string, unknown> | null = null
      let m4HarnessApplies = -1
      await runMutant({
        label: 'm4 a no-op handler',
        why:
          'a handler that paints nothing must leave `applied === []` while the pane\'s source DID move, and the REAL paint seam over ' +
          'that same moved state must still paint it',
        handler: () => undefined,
        reading: () => {
          const idle = sandbox.counters()
          m4HarnessApplies = idle.applies
          m4Seam = (sandbox.host as unknown as { updatePane(id: string): Record<string, unknown> }).updatePane(SEARCH)
          return (
            `harnessApplies=${idle.applies} (ZERO: the no-op handler painted nothing) ` +
            `realSeamPainted=${shown(m4Seam?.['painted'])} realSeamApplied=${shown(m4Seam?.['applied'])} ` +
            `loadAppGraph=${idle.loadAppGraph} rag.query=${idle.ragQuery} sourceMoved=${String(sourceMoved)} ` +
            `paneStaleBeforeTheSeam=${String(paneStaleBeforeM4)}`
          )
        },
        caught: () => {
          return (
            sourceMoved &&
            paneStaleBeforeM4 &&
            m4HarnessApplies === 0 &&
            m4Seam !== null &&
            m4Seam['painted'] === true &&
            fingerprint(m4Seam['applied']) === fingerprint([`pane-${SEARCH}`])
          )
        },
      })

      // m5 — THE UPDATE APPLIED BY RE-ASSEMBLY INSTEAD OF THE PAINT. `reDerive('content')` is `0/0/0` on the three counters, so the
      // counters cannot see it; the applied list's CONTENT and the pane's own staleness are the discriminating readings.
      // ⟨`B7-F6` — `m5` IS RE-BASELINED ON ITS OWN STALENESS AND ITS OWN DOCUMENT MOVE.⟩ As filed `m5` tested its precondition with
      // `m4`'s marker (`SNIPPET_ONE`) on a state `m4`'s REQUIRED positive had just painted (`:2176`, `:2184-2193`) — so
      // `paneStaleBeforeM5` could never be true and `m5` could never be caught. It now MOVES A THIRD ANSWER (`SNIPPET_STALE`, never
      // painted by anything: this sandbox has no `events`, so its producer commits and paints nothing) and asserts the pane does NOT
      // author it; and it MOVES A THIRD DOCUMENT BODY, so the mutant's `reDerive('content')` replaces a root the pane does NOT own
      // (the `rag-` document root) as well as the pane's own — which is what makes `others` a real reading rather than a hope. The
      // `caught()` predicate below is EXACTLY as authored (`paneStaleBeforeM5 && ours && others && 0/0/0`), and the apply log it
      // reads is now SCOPED by `resetCounters()` (`B7-F3`), so `ours` can no longer be `m4`'s leftover.
      sandbox.setQueryAnswer(queryAnswer(SNIPPET_STALE))
      sandbox.resetCounters()
      problems.push(...driveSurface(surface, 'submitQuery', [PROBE_TERM], 'X3·m5·source'))
      await settle()
      const paneStaleBeforeM5 = ((): boolean => {
        const frame = liveFrame(sandbox, SEARCH)
        return frame !== undefined && !authoredText(frame).includes(SNIPPET_STALE)
      })()
      // THE THIRD DOCUMENT BODY: it differs from the boot body (`Doc A`) and from `m4`'s (`Doc A MOVED`), so the root the pane does
      // NOT own is guaranteed to move under the mutant's re-assembly whichever body the committed snapshot happens to hold.
      const m5DocumentBody = 'Doc A REBASELINED-BY-M5'
      sandbox.setSnapshot({
        store: 'main',
        nodes: [{ id: HEAD_A, type: 'h1', content: m5DocumentBody, ownedNodeIds: [], createdAt: NOW, updatedAt: NOW }],
        edges: [{ id: 'dh1', kind: 'doc-head', source: HEAD_A, target: DOC_A, createdAt: NOW, updatedAt: NOW, documentIds: [DOC_A] }],
      })
      await runMutant({
        label: 'm5 a re-assembly instead of the paint',
        why:
          'a handler that applies the update by `reDerive(\'content\')` must be caught by the applied list\'s CONTENT (it names roots ' +
          'the pane does not own) and by the pane being STALE before it ran — the counters read 0/0/0 and cannot see it',
        handler: () => {
          void sandbox.host.reDerive('content')
        },
        reading: () => {
          const assembly = sandbox.counters()
          const answers = sandbox.applyAnswers()
          const ours = answers.filter((ids) => ids.includes(`pane-${SEARCH}`)).length
          const others = answers.flat().filter((id) => id !== `pane-${SEARCH}`)
          return (
            `refresh=${assembly.refresh} loadAppGraph=${assembly.loadAppGraph} mountOperator=${assembly.mountOperator} ` +
            `snapshot=${assembly.snapshot} docHeads=${assembly.docHeads} applies=${assembly.applies} applied=${shown(answers)} ` +
            `appliedOurs=${ours} appliedOthers=${shown(others)} staleMarker=${SNIPPET_STALE} ` +
            `paneStaleBeforeTheReDerive=${String(paneStaleBeforeM5)}`
          )
        },
        caught: () => {
          const assembly = sandbox.counters()
          const answers = sandbox.applyAnswers()
          const ours = answers.some((ids) => ids.includes(`pane-${SEARCH}`))
          const others = answers.flat().some((id) => id !== `pane-${SEARCH}`)
          return (
            paneStaleBeforeM5 &&
            ours &&
            others &&
            assembly.refresh === 0 &&
            assembly.loadAppGraph === 0 &&
            assembly.mountOperator === 0
          )
        },
      })
    } finally {
      sandbox.restore()
    }

    // ---- (iv) m6-search: THE FIRE REMOVED FROM BOTH SETTLEMENTS -----------------------------------
    // A host with NO `events` option is exactly the shape "the settlement's `fire` is a no-op": the commit happens, nothing fires.
    // Predictions: `0/0/0`, ZERO paints, ZERO `rag.query` from the paint, and the pane STILL naming the OLD result while
    // `lastQueryResult` has moved. Measured on the SAME settled query as Q1.
    const measureNoFire = async (label: string, producerArgs: { surface: string; args: unknown[] }): Promise<void> => {
      const quiet = await seedHost({ events: false })
      try {
        problems.push(...quiet.bootProblems)
        const paneBefore = liveFrame(quiet, SEARCH)
        if (paneBefore === undefined) {
          problems.push(`limb X3(iv) (${label}): the seed carries no live \`pane-${SEARCH}\` frame — the staleness reading has no subject`)
          return
        }
        quiet.resetCounters()
        problems.push(...driveSurface(sidebarSurface(), producerArgs.surface, producerArgs.args, `X3·${label}`))
        await settle()
        const counters = quiet.counters()
        const answers = quiet.applyAnswers()
        const painted = answers.some((ids) => ids.includes(`pane-${SEARCH}`))
        const paneAfter = liveFrame(quiet, SEARCH)
        const stillStale = paneAfter !== undefined && !authoredText(paneAfter).includes(SNIPPET_ONE)
        const sourceMoved = (quiet.host as unknown as Record<string, unknown>)['lastQueryResult'] !== null
        mutants.push(
          `${label}: refresh=${counters.refresh} loadAppGraph=${counters.loadAppGraph} mountOperator=${counters.mountOperator} ` +
            `applies=${counters.applies} painted=${String(painted)} rag.query=${counters.ragQuery} ` +
            `sourceMoved=${String(sourceMoved)} paneStillNamesTheOldResult=${String(stillStale)}`,
        )
        if (!painted) {
          mutants.push(`${label}: recorded reading — ZERO paints while the source committed (this is the state the fire exists to prevent)`)
        }
        if (sourceMoved && !stillStale) {
          problems.push(
            `limb X3(iv) (${label}): the pane names the NEW result although NOTHING reached \`applyContentReconcile\` — so the ` +
              `settlement RE-ASSEMBLED the whole graph instead of firing (\`F-2\`: \`loadAppGraph\` -> \`runtime.loadEnvelope\`, see ` +
              `\`loadEnvelope\` in the counters above). m6-search's prediction is a SILENT settlement, and this head cannot produce it`,
          )
        }
        if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
          problems.push(
            `limb X3(iv) (${label}): with the fire absent the settlement read ${countersReading(counters)}, not \`0/0/0\` — §6's m6 ` +
              `prediction IS \`0/0/0\` with ZERO paints: the fire is the ONLY deliverer, so removing it must leave the counters silent. ` +
              `At this head the settlement still RE-ASSEMBLES instead (\`F-2\`), so the mutant cannot even be produced`,
          )
        }
        if (painted) {
          problems.push(
            `limb X3(iv) (${label}): the no-\`events\` host PAINTED the pane (applied ${shown(answers)}) — with no channel there is no ` +
              `fire and no paint; a paint here means the settlement reassembled or reached the paint some other way`,
          )
        }
        if (!stillStale) {
          problems.push(
            `limb X3(iv) (${label}): the pane does NOT still name the old result — m6-search's reading is "the source moved while the ` +
              `pane still names the OLD answer", and a paint that ran without a fire satisfies neither ` +
              `\`sourceMoved\`=${String(sourceMoved)} nor the staleness`,
          )
        }
        // THE FLOOR: the SAME settled query on an events-present seed DOES paint (the fire is load-bearing, not decorative).
        const loud = await seedHost({ events: true })
        try {
          problems.push(...loud.bootProblems)
          loud.resetCounters()
          problems.push(...driveSurface(sidebarSurface(), producerArgs.surface, producerArgs.args, `X3·${label}·floor`))
          await settle()
          const loudPainted = loud.applyAnswers().some((ids) => ids.includes(`pane-${SEARCH}`))
          mutants.push(`${label} floor (the SAME producer on an events-present seed): painted=${String(loudPainted)}`)
          if (!loudPainted) {
            problems.push(
              `limb X3(iv) (${label} floor): the SAME producer on an events-present seed painted NOTHING — then "the fire is ` +
                `load-bearing" is unprovable, because both seeds are silent and the comparison discriminates nothing`,
            )
          }
        } finally {
          loud.restore()
        }
      } finally {
        quiet.restore()
      }
    }

    await measureNoFire('m6-search (submitQuery)', { surface: 'submitQuery', args: [PROBE_TERM] })
    await measureNoFire('m6-search (submitAdvancedQuery)', { surface: 'submitAdvancedQuery', args: [PROBE_TERM, {}] })

    // ---- (v) m6-template: THE FIRE REMOVED FROM `onTemplateChanged`, WITH THE DIRTY GUARD HOLDING ---------
    // `0/0/0`, ZERO paints, and the pane STILL naming the OLD zone list while `this.template` has moved — its queued rebuild never runs
    // because the dirty guard holds (§1 `F-5`). The floor: the SAME payload on an events-present seed paints the pane (T1).
    const measureTemplateNoFire = async (label: string): Promise<void> => {
      const template = templateWithExtraZone()
      const quiet = await seedHost({ events: false })
      try {
        problems.push(...quiet.bootProblems)
        const edit = quiet.host as unknown as { editController: { markDirty(id: string): void } }
        edit.editController.markDirty('page-edit-surface')
        const paneBefore = liveFrame(quiet, TEMPLATE_EDITOR)
        if (paneBefore === undefined) {
          problems.push(`limb X3(v) (${label}): the seed carries no live \`pane-${TEMPLATE_EDITOR}\` frame — the staleness reading has no subject`)
          return
        }
        const zonesBefore = nodesWhere(paneBefore, (record) => typeof propsOf(record)['data-template-zone'] === 'string').map((record) =>
          String(propsOf(record)['data-template-zone']),
        )
        quiet.resetCounters()
        let threw = ''
        try {
          ;(quiet.host as unknown as { onTemplateChanged(payload: unknown): void }).onTemplateChanged({ source: 'custom', template })
        } catch (error) {
          threw = String(error)
        }
        await settle()
        const counters = quiet.counters()
        const answers = quiet.applyAnswers()
        const painted = answers.some((ids) => ids.includes(`pane-${TEMPLATE_EDITOR}`))
        const paneAfter = liveFrame(quiet, TEMPLATE_EDITOR)
        const zonesAfter = nodesWhere(paneAfter, (record) => typeof propsOf(record)['data-template-zone'] === 'string').map((record) =>
          String(propsOf(record)['data-template-zone']),
        )
        const templateMoved =
          fingerprint((quiet.host as unknown as Record<string, unknown>)['template']) === fingerprint(template)
        mutants.push(
          `${label}: refresh=${counters.refresh} loadAppGraph=${counters.loadAppGraph} mountOperator=${counters.mountOperator} ` +
            `applies=${counters.applies} painted=${String(painted)} templateMoved=${String(templateMoved)} ` +
            `zonesBefore=${shown(zonesBefore)} zonesAfter=${shown(zonesAfter)} rebuilds=${shown(quiet.rebuildRequests())}`,
        )
        if (threw !== '') {
          problems.push(`limb X3(v) (${label}): \`onTemplateChanged\` THREW (${threw}) — it is a broadcast handler, never a throw site`)
        }
        if (!templateMoved) {
          problems.push(`limb X3(v) (${label}): \`this.template\` did NOT take the payload's template — the commit precedes the fire (§2)`)
        }
        if (painted) {
          problems.push(`limb X3(v) (${label}): the no-\`events\` host PAINTED \`pane-${TEMPLATE_EDITOR}\` (applied ${shown(answers)})`)
        }
        if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
          problems.push(
            `limb X3(v) (${label}): with the fire absent the handler read ${countersReading(counters)}, not \`0/0/0\` — the removal of ` +
              `the fire must leave the counters silent (the queued rebuild is the dirty guard's, and it never runs here)`,
          )
        }
        if (zonesAfter.includes(ZONE_ADDED)) {
          problems.push(
            `limb X3(v) (${label}): the pane already names the NEW zone \`${ZONE_ADDED}\` although NOTHING painted — there is no route ` +
              `by which the authored frame could have moved without a paint`,
          )
        }
        // THE FLOOR: the SAME payload on an events-present seed paints the pane (`T1`).
        const loud = await seedHost({ events: true })
        try {
          problems.push(...loud.bootProblems)
          loud.resetCounters()
          try {
            ;(loud.host as unknown as { onTemplateChanged(payload: unknown): void }).onTemplateChanged({ source: 'custom', template: templateWithExtraZone() })
          } catch (error) {
            problems.push(`limb X3(v) (${label} floor): \`onTemplateChanged\` THREW (${String(error)})`)
          }
          await settle()
          const loudPainted = loud.applyAnswers().some((ids) => ids.includes(`pane-${TEMPLATE_EDITOR}`))
          mutants.push(`${label} floor (the SAME payload on an events-present seed): painted=${String(loudPainted)}`)
          if (!loudPainted) {
            problems.push(
              `limb X3(v) (${label} floor): the SAME payload on an events-present seed painted NOTHING — then "the fire is ` +
                `load-bearing" is unprovable, because both seeds are silent and the comparison discriminates nothing`,
            )
          }
        } finally {
          loud.restore()
        }
      } finally {
        quiet.restore()
      }
    }

    await measureTemplateNoFire('m6-template')

    expect(
      problems,
      `limb X3 — INV-E and its SEVEN mutants (§6 X3; §1's "the row must be able to FAIL"; \`B3-ADV-01\`; \`O-2\`). ` +
        `${problems.length} problem(s). A producer's settlement must read \`0 refresh()\` / \`0 loadAppGraph\` / \`0 mountOperator\` ` +
        `AND a zeroed re-read census on a paint that LANDED; each of m1..m5 must be CAUGHT and each \`m6\` must be producible with its ` +
        `floor (the same producer on an events-present seed DOES paint). Computed readings: ` +
        `${mutants.length > 0 ? mutants.join(' · ') : '(no mutant could be driven)'}. envelope-class — the REAL SidebarPanes over the ` +
        `layout-less DOM shim, the counters wrapped on the instance; no rendered box, no computed style, no pointer (G8-only, §8)`,
    ).toEqual([])
  })

  it('X4 — an ABSENT pane costs no paint and no IPC: a DISABLED `search`/`template-editor`, an unknown id and `settings` answer `not-enabled`/`not-a-pane`/the operator surface\'s own paint word (`unchanged` or `painted`) with ZERO bridge calls, and ENABLING the pane makes the same fire paint exactly once', async () => {
    // §6 `X4` (§3: "The re-read's GATE is the paint's own census" — `not-enabled` / `not-a-pane`; the words
    // `not-mounted`/`no-runtime` are deliberately NOT gated on, being transient boot states). ⟨RE-STATED BY UNIT `B-9`
    // (`docs/L1/unit-b-9-pane-operator-settings.md` §3, §6 `O4`/`S1`; §4 `F-9`) — THE THIRD GATE WORD CHANGED, THE TEETH DID NOT:
    // this arm used to require `settings` to answer `operator-scope`, because `paintPane`'s step 2 REFUSED every `operator`-scope
    // registration. §3 replaced that refusal with a ROUTE to the operator surface's OWN retained-graph paint (`paintOperatorPane`),
    // so on this harness — which HAS an operator mount and a mounted `settings` pane — the answer is the paint's own word:
    // `unchanged` (the re-authored section is shape-equal to the retained one) or `painted`. What this arm still measures is
    // unchanged and is its teeth: ZERO bridge calls and ZERO `applyContentReconcile`, i.e. the operator pane's update costs no IPC
    // and re-assembles nothing.⟩
    // LAYER: envelope-class — the re-read census, the paint's own declared verdicts and call counts.
    // NON-VACUITY: the CONTROL is the SAME channel fire with the pane ENABLED on the SAME seed, and it must paint exactly once — so the
    // zeros above cannot be satisfied by a host that never paints anything; and the gate arms are read through the PUBLIC
    // `paintReplumbedPane` (the registration's body), so a landing that re-reads BEFORE the gate reds the census.
    // MUTATION THAT WOULD RED IT: a re-read before the gate reds the disabled arms; gating on `not-mounted` instead of the ENABLED
    // census reds the declared-word arm; an arm that re-reads for an `operator`-scope id reds the `settings` arm; a host that never
    // paints reds the control.
    // ⟨RE-AUTHORED (`B7-F5`) — the CONTROL now moves BOTH sources while BOTH panes are still DISABLED, enables them, and only then
    // fires the channel per pane (with `resetCounters()` between the two fires), so each fire paints exactly once. As filed it enabled
    // the panes FIRST and moved the sources afterwards, i.e. it fired over state the producers' own fires had already painted and
    // demanded a paint — `unchanged` was the only lawful answer. The `fired:true, handlers:1` reading, `onePaintProblems` and the
    // `0/0/0` reading are unchanged, and the new disable/enable reads are POSITIVE proof that the registry really moved.⟩
    const problems: string[] = []
    const drive = await seedHost({ events: true })
    try {
      problems.push(...drive.bootProblems)
      const absent = readMember(drive.host, 'paintReplumbedPane', `the REAL \`SidebarPanes\` instance (${SIDEBAR_FILE})`, 'X4')
      problems.push(...absent)
      if (absent.length === 0) {
        const paint = (drive.host as unknown as { paintReplumbedPane(id: string): Promise<void> }).paintReplumbedPane.bind(drive.host)
        // ⟨RE-STATED BY UNIT `B-9` §3⟩ Each arm now names the SET of words it accepts, so the operator arm can demand the paint's own
        // vocabulary without weakening any other arm: the two app-graph arms and the unknown-id arm still accept EXACTLY ONE word.
        const gateArms: Array<[string, readonly string[], string]> = []
        for (const paneId of [SEARCH, TEMPLATE_EDITOR]) {
          drive.registry.disable(paneId)
          gateArms.push([paneId, ['not-enabled'], `a DISABLED \`${paneId}\``])
        }
        gateArms.push([
          SETTINGS,
          ['unchanged', 'painted'],
          `\`${SETTINGS}\` (the operator scope — ⟨UNIT \`B-9\` §3⟩ its paint is the operator surface's OWN retained-graph paint, so the word is the paint's, not the deleted \`operator-scope\` refusal)`,
        ])
        gateArms.push([UNKNOWN_PANE, ['not-a-pane'], `the unknown id \`${UNKNOWN_PANE}\``])
        for (const paneId of [SEARCH, TEMPLATE_EDITOR]) {
          if (drive.registry.isEnabled(paneId) !== false) {
            problems.push(`limb X4: \`registry.disable('${paneId}')\` did not take — the disabled arm has no subject`)
          }
        }
        for (const [paneId, words, label] of gateArms) {
          drive.resetCounters()
          let threw = ''
          try {
            await paint(paneId)
          } catch (error) {
            threw = String(error)
          }
          await settle()
          if (threw !== '') {
            problems.push(`limb X4: \`paintReplumbedPane('${paneId}')\` THREW (${threw}) — the paint is an event handler's arm and never a throw site`)
          }
          const counters = drive.counters()
          problems.push(...reReadCensusProblems(counters, { ragQuery: 0 }, `X4·${paneId}`))
          if (counters.applies !== 0) {
            problems.push(`limb X4: ${label} reached \`applyContentReconcile\` ${counters.applies} time(s) — no frame, no root, no apply`)
          }
          const verdicts = drive.verdicts()
          if (verdicts.length !== 1) {
            problems.push(
              `limb X4: ${label} produced ${verdicts.length} verdict(s) ${shown(verdicts)}, not exactly ONE — the paint still ANSWERS ` +
                `(its declared word is the reading), it just does not paint or re-read`,
            )
          } else if (!words.includes(String(verdicts[0]['reason']))) {
            problems.push(
              `limb X4: ${label} answered \`reason: ${shown(verdicts[0]['reason'])}\`, not the declared word ` +
                `\`'${shown([...words])}'\` — the paint's closed vocabulary distinguishes one wiring fault from another`,
            )
          }
        }
        // THE DISABLED PANES' FIRES: a censused id with no frame paints NOTHING (and costs nothing).
        for (const paneId of [SEARCH, TEMPLATE_EDITOR]) {
          drive.resetCounters()
          const report = drive.channel.fire(paneId)
          await settle()
          const counters = drive.counters()
          if (counters.applies !== 0 || counters.ragQuery !== 0 || counters.templateGet !== 0) {
            problems.push(`limb X4: a \`fire('${paneId}')\` on the DISABLED pane cost ${countersReading(counters)} — an absent pane costs no paint and no IPC`)
          }
          void report
        }
      }

      // ---- THE CONTROL: ENABLE THE PANE → the SAME fire paints exactly ONCE ------------------------
      // ⟨`B7-F5` — THE TWO SOURCES MOVE WHILE BOTH PANES ARE STILL DISABLED.⟩ Both panes were DISABLED by the gate arms above, and
      // they stay off while the app's OWN producers run: each producer commits its field and fires, and each of those fires answers
      // `not-enabled`, so NOTHING is painted and the moved state is unpainted. Only then are the panes ENABLED, so the channel fire
      // below is the ONLY deliverer of a state that really moved — which is what makes `painted` the lawful answer. (As filed this
      // control moved the sources AFTER enabling both panes, so the producers' own fires had already painted the very state the
      // control's fire was then asked to paint: `unchanged` was the only lawful answer, `ASM-B7-1`.)
      for (const paneId of [SEARCH, TEMPLATE_EDITOR]) {
        drive.registry.disable(paneId)
        if (drive.registry.isEnabled(paneId) !== false) {
          problems.push(`limb X4(control): \`${paneId}\` is ENABLED before the control's sources move — the control's fire would not be the only deliverer`)
        }
      }
      problems.push(...driveSurface(sidebarSurface(), 'submitQuery', [PROBE_TERM], 'X4·control·source'))
      try {
        ;(drive.host as unknown as { onTemplateChanged(payload: unknown): void }).onTemplateChanged({
          source: 'custom',
          template: templateWithExtraZone(),
        })
      } catch (error) {
        problems.push(`limb X4(control): \`onTemplateChanged\` THREW (${String(error)})`)
      }
      await settle()
      for (const paneId of [SEARCH, TEMPLATE_EDITOR]) {
        drive.registry.enable(paneId)
        if (drive.registry.isEnabled(paneId) !== true) {
          problems.push(`limb X4(control): \`registry.enable('${paneId}')\` did not take — the control has no subject`)
        }
      }
      for (const paneId of [SEARCH, TEMPLATE_EDITOR]) {
        drive.resetCounters()
        const report = drive.channel.fire(paneId)
        await settle()
        if (report.fired !== true || report.handlers !== 1) {
          problems.push(
            `limb X4(control): with \`${paneId}\` ENABLED the fire answered ${shown(report)}, not \`fired:true, handlers:1\` — the ` +
              `zeroes above are only a reading of the GATE beside a paint that a correctly wired host DOES make`,
          )
        }
        problems.push(...onePaintProblems(drive.verdicts(), paneId, `X4·control·${paneId}`))
        const controlCounters = drive.counters()
        if (controlCounters.refresh !== 0 || controlCounters.loadAppGraph !== 0 || controlCounters.mountOperator !== 0) {
          problems.push(`limb X4(control): the enabled fire read ${countersReading(controlCounters)} — the control is a PAINT, never a re-assembly`)
        }
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb X4 — an absent pane costs no paint and no IPC (§6 X4; §3's gate = the paint's own census; ⟨RE-STATED BY UNIT ` +
        `\`B-9\` §3⟩ the operator arm now names the paint's words). ${problems.length} ` +
        `problem(s). A DISABLED \`${SEARCH}\`/\`${TEMPLATE_EDITOR}\`, the operator-scope \`${SETTINGS}\` and the unknown ` +
        `\`${UNKNOWN_PANE}\` must each cost ZERO bridge calls and answer their own declared word (\`not-enabled\` / the operator ` +
        `surface's own \`unchanged\`|\`painted\` / \`not-a-pane\`), while ENABLING the pane makes the SAME channel fire paint ` +
        `exactly once. envelope-class — the REAL host over the layout-less DOM shim; no rendered box, no pointer (G8-only)`,
    ).toEqual([])
  })
})
