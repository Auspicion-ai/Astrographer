// tests/integration/shell-chrome/pane-links.test.ts — unit `B-5` `pane-links`'s HOST rows (`L1`…`L6`), authored BEFORE any byte
// of `SidebarPanes.paintReplumbedPane` / `linksPaneSubjectNodeId` / the `REPLUMBED_PANE_IDS` move / the `onRagStoreChanged`
// fire (RCA-1: the red set runs first and is REPORTED before implementation).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-5-pane-links.md` —
//   §2  the detection seam: the PRODUCER is main's edge-write announcement (`edit.set_edge` → `broadcast(IPC_RAG_STORE_CHANGED,
//       {kind:'structural', nodeIds, edgeIds})`), the LEARNER is `SidebarPanes.onRagStoreChanged`, and the declared predicate is
//       `Array.isArray(payload.edgeIds) && payload.edgeIds.length > 0`; the CONTROL is `edgeIds: []` (the `IPC_EDIT_COMMIT`
//       shape), which fires NOTHING for this pane. `src/main/backlinks.ts` is a PURE enumeration and is NOT the seam.
//   §3  `ASM-B5-1`, the pane's SUBJECT — `linksPaneSubjectNodeId()`: `_currentNodeId` when set, ELSE the CURRENT DOCUMENT'S
//       DOC-HEAD NODE read off the cached traversal snapshot (`kind === 'doc-head' && target === _currentDocumentId` → `source`),
//       `null` when no document is current. ONE line of `refresh()` changes; its guard semantics do not.
//   §4  the listener, the re-read, the paint: `REPLUMBED_PANE_IDS` moves by exactly ONE (to `{gnosis-query, crosslinks}`) with a
//       `B-5` comment naming the cause; the boot loop keeps ONE subscriber per id whose body becomes the host's per-pane dispatch
//       (`paintReplumbedPane(paneId)` = the pane's data re-read, only `crosslinks` has one, then `updatePane(paneId)`); the
//       re-read is ONE `bridge.rag.backlinks(subject)` call and NOTHING else (no snapshot, no doc-heads, no security, no
//       traversal, no template); `pane-events.ts` owes ZERO byte and `recordPanes()` stays `[]`.
//   §5  `pane-graph.ts`'s `crosslinksContent` owes ZERO byte and the C19 hover-preview carrier SURVIVES the paint (the popup is
//       re-authored from `hoverPreview.activeId` on every render; a dangling id authors none).
//   §6  the rows `L1`…`L6`, each with its subject and the mutation that would red it.
//
// THE HARNESS IS THE `B-3` PRECEDENT'S SHAPE, NOT ITS CONTENT (`tests/integration/shell-chrome/pane-update-channel.test.ts`): the
// REAL `SidebarPanes` over `installShim()` from `src/shared/dom-shim.ts`, the REAL `host.registerPanes()` census (so the pane
// under test IS the shipped `crosslinks` pane re-authoring through the shipped `crosslinksContent`), a RECORDING runtime double
// attached and then SEEDED THROUGH THE PUBLIC `host.boot(runtime)` (boot is what sets `lastStore`, the cached snapshot/doc-heads,
// `_currentDocumentId`, `appLoaded` and — load-bearing here — the `REPLUMBED_PANE_IDS` subscriptions on the channel), a REAL
// `createPaneEvents()` handed to the host as its `events` option (so "a fire reaches the listener" is the host's OWN wiring and
// never a test-authored dispatch), and the method-wrapping idiom applied to the THREE COUNTERS, `updatePane` (so the paint's own
// verdict is READ, not authored) and the bridge's re-read census.
//
// WHY THE RECORDING DOUBLE DERIVES ITS OWN ROOT SET: `updatePane` reads `runtime.materializedContentRoots()` to find the LIVE
// frame (§3 of the `B-3` contract), the paint hands `applyContentReconcile` a `next` envelope and a `documents` census, and the
// double performs the whole-root replace (`src/renderer/runtime.ts:535-540`) on the roots `loadEnvelope` extracted. So "every
// OTHER materialized root is the SAME OBJECT" is a reading of a root set the seed really authored, not a list the test wrote.
// The double answers `codeGet('')` with `null` — the documented ABSENT route (`liveEnvelopeOf`'s contained read), which makes the
// paint fall back to the materialized-root census; a real Runtime answers it and the paint swaps by identity. Both are lawful.
//
// THE REACHABILITY RULE THIS FILE FOLLOWS (it always COLLECTS and RUNS): `paintReplumbedPane`, `linksPaneSubjectNodeId` and the
// `REPLUMBED_PANE_IDS` move DO NOT EXIST at this head. Every not-yet-existing export is reached through `await import()` / a
// `readMember`-style typeof check, and its absence is a NAMED problem inside that row's ONE aggregate `expect(problems, …)` —
// never an ESM link error, never a `skip`, never a raw `TypeError`. The seams that DO exist at this head (`onRagStoreChanged`,
// `updatePane`, `boot`, `refresh`, `reDerive`, the channel) are DRIVEN, never poked around: the paint verdict is read off the
// instance wrapper and the roots/re-read census, so a missing `paintReplumbedPane` cannot break the row's other readings.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): every row here is ENVELOPE-class — the REAL host over the LAYOUT-LESS DOM shim
// (`src/shared/dom-shim.ts`: no CSS, no computed style, no layout), against a RECORDING runtime double. The observables are the
// paint's own verdict fields, the IDENTITY of authored nodes, the authored ENVELOPE text, and call counts. What this layer can
// NEVER read, named so nobody quotes it: that the frame was RE-MINTED in a real window, the pane's rendered list as the user sees
// it, its box, its scroll, any computed style, any pointer, and the NUMBER of IPCs on the wire (the `L1` census counts BRIDGE
// calls, not IPC round trips) — `docs/L1/unit-b-5-pane-links.md` §8's assembled-app limb (`G8`) is the only app-green reading and
// this file claims none of it.
//
// NON-VACUITY (stated per row in its own comment): every negative arm carries a POSITIVE CONTROL on the SAME harness shape — the
// zeroes in `L1`/`L5` are floored by `L3`'s `host.refresh()` moving all three counters, `L2`'s "nothing painted" is floored by
// `L1`'s positive half, `L4`'s "no popup for a dangling id" is floored by its own resolvable-id half, and `L5`'s five mutants are
// each MEASURED on this harness before the invariant's zeroes are claimed readable. Each row names WHICH MUTATION WOULD RED IT.
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`, no `vi.mock`; it writes nothing. Every
// path derives from THIS FILE's own location (`ROOT`), so a missing substrate FAILS (ENOENT) instead of skipping. It does not
// touch `tests/live-drive-contract.test.ts` and asserts nothing about the assembled app.
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
const RENDERER_FILE = 'src/renderer/renderer.ts'

/** The pane under this unit, and the three app-graph families `L3` proves keep their `refresh()` route. */
const CROSSLINKS = 'crosslinks'
const DOC_NAV = 'doc-nav'
const SEARCH = 'search'
const TEMPLATE_EDITOR = 'template-editor'
const SETTINGS = 'settings'
const OPERATOR_PROBE = 'probe-b5-operator'

/** §3's subject, derived from the seed's `doc-head` edge: `target === _currentDocumentId` → `source`. */
const DOCUMENT_ID = 'doc-a'
const HEAD_NODE_ID = 'head-a'
const SECTION_NODE_ID = 'sec-1'

/** The store name the host captures at boot (the fail-closed foreign-store guard's other half). */
const STORE = 'default'

/** The new backlink the enumeration grows by — the line `crosslinksContent` authors as `${source} → ${target}`. */
const NEW_SOURCE = 'src-1'
const NEW_TARGET = HEAD_NODE_ID
const NEW_LINE = `${NEW_SOURCE} → ${NEW_TARGET}`

/** A node id the cached snapshot/doc-heads CANNOT resolve (the C19 F1 dangling arm). */
const DANGLING_ID = 'probe-b5-dangling-node'

const fingerprint = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

/** A value as a failure message prints it. */
const shown = (value: unknown): string => (value === undefined ? '(absent)' : fingerprint(value))

beforeAll(() => {
  installShim()
})

// ---------------------------------------------------------------------------
// THE EXPORT READING — non-fatal by design (the `reveal-without-reassembly`/`B-3` reachability rule): a missing member is a
// NAMED problem inside the row's aggregate assertion, never a module-load error and never a raw `TypeError`.
// ---------------------------------------------------------------------------
interface ExportReading {
  value: unknown
  problems: string[]
}

function readMember(holder: unknown, name: string, where: string, limb: string): ExportReading {
  if (holder === null || (typeof holder !== 'object' && typeof holder !== 'function')) {
    return {
      value: undefined,
      problems: [`limb ${limb}: ${where} is not an object (${shown(holder)}) — \`${name}\` has no holder, so the row has no subject`],
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
        `limb ${limb}: \`${name}\` is NOT a function on ${where} (typeof read: ${typeof value}) — §4 adds it (the per-pane dispatch ` +
          `\`paintReplumbedPane(paneId)\` whose declared arms are the pane's data re-read THEN \`updatePane(paneId)\`), so the limb's ` +
          `declared subject is ABSENT (no arm below is skipped: every one reports the absence)`,
      ],
    }
  }
  return { value, problems: [] }
}

// ---------------------------------------------------------------------------
// THE CONTENT-ROOT READING — the Runtime's OWN closed class, re-spelled here because the double IS the root-set owner
// (`src/renderer/runtime.ts:152-182`). A node is a content root iff its authored `props.id` is a `rag-<id>`, a `pane-<id>`, or one
// of the four pinned pane-like ids.
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
// THE AUTHORED-CONTENT READING — `L4`/`L5`/`L6` read the ENVELOPE the host authored (never the DOM): every authored `content`
// string, and whether a hover-preview popup subtree is present.
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

/** Whether the authored subtree carries the C19 hover-preview POPUP (`data-role="hover-preview"`, `hoverPreviewPopup`'s own
 *  carrier). A reading of the authored envelope, not of a rendered element. */
function hasHoverPreviewPopup(node: unknown): boolean {
  if (node == null || typeof node !== 'object') return false
  if (Array.isArray(node)) return node.some((child) => hasHoverPreviewPopup(child))
  const record = node as Record<string, unknown>
  const props = (record['props'] ?? {}) as Record<string, unknown>
  if (props['data-role'] === 'hover-preview') return true
  return hasHoverPreviewPopup(record['children'])
}

// ---------------------------------------------------------------------------
// THE CARRIER READING — `L1`'s "the fresh frame's identity carriers are unchanged" (§4: the frame root is REPLACED WHOLE, so
// "frame identity" is the CARRIERS, never the element instance). The SLOT is the body node that holds the pane's render root.
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
// THE SEED FIXTURES — a ONE-document snapshot (a `doc-head` edge whose TARGET is the document root and whose SOURCE is the head
// node §3 makes the pane's subject) and the NO-document snapshot `L2(b)` needs (no `doc-head` edge at all ⇒ `_currentDocumentId`
// and `_currentNodeId` both `null` ⇒ no subject).
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
      snapshotNode(HEAD_NODE_ID, { type: 'h1', content: 'Doc A' }),
      snapshotNode(SECTION_NODE_ID),
      snapshotNode(NEW_SOURCE, { content: 'a node of another document' }),
    ],
    edges: [
      snapshotEdge('dh1', 'doc-head', HEAD_NODE_ID, DOCUMENT_ID, { documentIds: [DOCUMENT_ID] }),
      snapshotEdge('ns1', 'next-section', HEAD_NODE_ID, SECTION_NODE_ID, { documentIds: [DOCUMENT_ID] }),
    ],
  }
}

function documentLessSnapshot(): Record<string, unknown> {
  return { store: STORE, nodes: [], edges: [] }
}

/** One enumerated link entry (`LinkEntry`'s display fields — the ones `crosslinksContent` authors). */
const LINK_ENTRY = (): Record<string, unknown> => ({
  kind: 'crosslink',
  source: NEW_SOURCE,
  target: NEW_TARGET,
  scope: 'cross-document',
  edge: { id: 'e-new', kind: 'crosslink', source: NEW_SOURCE, target: NEW_TARGET, createdAt: NOW, updatedAt: NOW },
})

/** The enumeration BEFORE the store moved: nothing (this is why the pane authors `(none)` today, `F-3`). */
const beforeEnumeration = (nodeId: string): Record<string, unknown> => ({
  nodeId,
  backlinks: [],
  outlinks: [],
  crosslinkBacklinks: [],
  crosslinkOutlinks: [],
})

/** The enumeration AFTER the store moved: ONE new crosslink backlink — the fresh reading `L1` commits to `lastBacklinks`. */
const afterEnumeration = (nodeId: string): Record<string, unknown> => {
  const entry = LINK_ENTRY()
  return {
    nodeId,
    backlinks: [entry],
    outlinks: [],
    crosslinkBacklinks: [entry],
    crosslinkOutlinks: [],
  }
}

/** A SECOND distinct enumeration, so `L4`'s two shots each MOVE the pane's data (a shape-equal re-render applies nothing, and a
 *  paint that applied nothing would make "the popup survived the repaint" unreadable). */
const afterEnumerationTwo = (nodeId: string): Record<string, unknown> => {
  const entry = LINK_ENTRY()
  const second = { ...entry, source: 'src-2' }
  return {
    nodeId,
    backlinks: [entry, second],
    outlinks: [],
    crosslinkBacklinks: [entry, second],
    crosslinkOutlinks: [],
  }
}

// ---------------------------------------------------------------------------
// THE RECORDING RUNTIME DOUBLE — `loadEnvelope` seeds the materialized root set (exactly the Runtime's own closed class),
// `materializedContentRoots()` answers it (the paint's step 2), `materializedDocumentRoots()` answers the per-document census the
// paint CARRIES (`ASM-B3-L2-1`), `applyContentReconcile` records the call and performs the channel's whole-root replace, and
// `applyCommand`/`nodeState` absorb the zone-mirror slice. `codeGet('')` answers `null` — the documented ABSENT live-envelope
// route, on which the paint falls back to the materialized-root census (a real Runtime answers it and swaps by identity).
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
      // THE WHOLE-ROOT REPLACE the managed channel performs (`runtime.ts:535-540`): every `replaced` bucket entry's LIVE root is
      // swapped for the fresh one the reconcile considered, and NOTHING else moves — which is what makes the "every other root is
      // the SAME OBJECT" reading a reading of this channel and not of the harness.
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
// THE HOST DRIVE — the REAL `SidebarPanes` over the shim, the REAL `registerPanes()` census, booted through the PUBLIC
// `boot(runtime)` against the recording double, with:
//   · the THREE COUNTERS wrapped on the INSTANCE (the `reveal-without-reassembly` `setLayout`-wrapper idiom), so the host's own
//     `this.loadAppGraph(...)`/`this.mountOperator()`/`this.refresh()` calls are counted too;
//   · THREE bypass-proof secondary readings beside them — `operatorSettings.get` (reached by `refresh()` and boot), `loadEnvelope`
//     (reached by every re-assembly whatever route), and the operator probe pane's own `render` (reached by `mountOperator`);
//   · `updatePane` wrapped on the INSTANCE so the PAINT'S OWN VERDICT is read (`L1`/`L2`/`L4`/`L5`'s mutants), never authored;
//   · the re-read census (`bridge.rag.backlinks` arguments) and the snapshot/doc-heads/security call counters `L1` names.
// ---------------------------------------------------------------------------
interface SeedOptions {
  /** `false` → the NO-DOCUMENT seed (`L2(b)`): no `doc-head` edge ⇒ `_currentDocumentId`/`_currentNodeId` both `null`. */
  documents?: boolean
  /** `true` → a REAL `createPaneEvents()` is handed to the host as its `events` option, so the host's OWN boot-time
   *  subscriptions exist and a `fire` reaches the host's listener. `false` → the host subscribes nothing and the TEST owns the
   *  channel (`L5`'s mutants, which must be the ONLY handler standing). */
  events?: boolean
  /** ⟨`L7`/`L8`/`L9`, ADDITIVE — the `B5-F5` rows' seed and nothing else.⟩ The snapshot the bridge answers at boot AND on every
   *  re-derive, when a row needs a store shape `documentSnapshot()` does not author: a SECOND document (`L7`/`L8` grade a
   *  document SWITCH, which needs a `doc-head` edge for the document being switched TO) or an UNCAPPED store (`L9(a)` grades the
   *  `lastStore === null` guard, which is `snapshot.store` — so the arm is constructed through the PUBLIC `boot`, never by poking
   *  the private). Absent ⇒ `documentSnapshot()`, byte-for-byte the pre-existing seed. */
  snapshot?: () => Record<string, unknown>
}

interface Counters {
  refresh: number
  loadAppGraph: number
  mountOperator: number
  settingsGets: number
  loadEnvelopes: number
  operatorRenders: number
  applies: number
  snapshot: number
  docHeads: number
  backlinks: number
  security: number
  stores: number
}

interface HostDrive {
  host: SidebarPanes
  registry: ReturnType<typeof createPaneRegistry>
  /** The REAL channel — the host's `events` when `events:true`, else a channel the test owns. */
  channel: ReturnType<typeof createPaneEvents>
  /** `true` when the host was handed the channel at construction (i.e. its boot subscriptions are live). */
  hostSubscribed: boolean
  /** The `boot()` failure, if any — a NAMED problem every row reports (the harness's own floor). */
  bootProblems: string[]
  counters: () => Counters
  resetCounters: () => void
  roots: () => unknown[]
  applies: () => Array<Record<string, unknown>>
  /** The `applied` list the managed channel ANSWERED, call by call — the channel's own report, never the input's intent. */
  applyAnswers: () => string[][]
  /** Every `paintReplumbedPane`/`updatePane` verdict the host produced, call by call. */
  verdicts: () => Array<Record<string, unknown>>
  /** Every argument `bridge.rag.backlinks` was called with, in order — THE re-read census. */
  backlinkArgs: () => string[]
  /** ⟨`L8`, ADDITIVE⟩ Install a HAND-CONTROLLED answer for `bridge.rag.backlinks` — the deferred the row resolves by hand. `null`
   *  restores the canned enumeration. The call is STILL counted and still appears in `backlinkArgs()`: the gate holds the ANSWER,
   *  never the CENSUS, so "the re-read happened" stays a reading. */
  setBacklinkAnswer: (handler: ((nodeId: string) => Promise<Record<string, unknown>>) | null) => void
  /** ⟨`L9`, ADDITIVE⟩ Every `editController.requestRebuild(<kind>)` the host requested, in order — the REBUILD arm of the
   *  fail-closed store guards' "fires nothing and rebuilds NOTHING". */
  rebuildRequests: () => string[]
  /** ⟨`L9`, ADDITIVE⟩ Every `fire(<paneId>)` the HOST dispatched, in order. `pane-events.ts` returns a FROZEN channel, so the
   *  counting lives in a DELEGATING façade handed to the host as its `events`; `channel` stays the REAL channel, so every
   *  pre-existing row's `fire`/`subscribe` is byte-for-byte unchanged. */
  fires: () => string[]
  /** What the RAG store answers NOW (the enumeration the pane's data source moves by). */
  setEnumeration: (next: Record<string, unknown>) => void
  enumeration: () => Record<string, unknown>
  /** The last completed enumeration the double answered (what `lastBacklinks` would be if it re-read). */
  lastEnumeration: () => Record<string, unknown>
  restore: () => void
}

async function seedHost(options: SeedOptions = {}): Promise<HostDrive> {
  const withDocuments = options.documents !== false
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
    snapshot: 0,
    docHeads: 0,
    backlinks: 0,
    security: 0,
    stores: 0,
  }
  const bootProblems: string[] = []
  const backlinkArgs: string[] = []
  const verdicts: Array<Record<string, unknown>> = []
  /** ⟨`L9`⟩ The rebuild requests the host's dirty-edit guard received (the `B-3`-era no-op, now RECORDED). */
  const rebuilds: string[] = []
  /** ⟨`L9`⟩ The `fire(<paneId>)` dispatches the host's own seam made, through the delegating façade above. */
  const firesLog: string[] = []
  /** ⟨`L8`⟩ When set, `bridge.rag.backlinks` answers THIS promise instead of the canned enumeration — the row holds the answer. */
  let backlinkAnswer: ((nodeId: string) => Promise<Record<string, unknown>>) | null = null

  const registry = createPaneRegistry()
  // THE OPERATOR PROBE PANE: registered + enabled BEFORE boot so `mountOperator` → `buildOperatorEnvelope` calls its `render` on
  // EVERY mount — the BYPASS-PROOF `mountOperator` reading `L5`'s m3 needs (a mount that bypassed the wrapped instance method
  // would still move it).
  registry.register({
    id: OPERATOR_PROBE,
    title: 'B-5 probe operator pane',
    scope: 'operator',
    render: () => {
      counters.operatorRenders += 1
      return { type: 'section', props: { id: `${OPERATOR_PROBE}-render-root` } }
    },
  } as never)

  let enumeration: Record<string, unknown> = beforeEnumeration(HEAD_NODE_ID)
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
        if (!withDocuments) return documentLessSnapshot()
        return options.snapshot !== undefined ? options.snapshot() : documentSnapshot()
      },
      docHeads: async (): Promise<Record<string, unknown>> => {
        counters.docHeads += 1
        return {
          documents: withDocuments ? [{ documentId: DOCUMENT_ID, title: 'Doc A', path: [], tags: [] }] : [],
        }
      },
      backlinks: async (nodeId: string): Promise<Record<string, unknown>> => {
        counters.backlinks += 1
        backlinkArgs.push(typeof nodeId === 'string' ? nodeId : `(non-string: ${shown(nodeId)})`)
        if (backlinkAnswer !== null) return await backlinkAnswer(typeof nodeId === 'string' ? nodeId : '')
        return enumeration
      },
      stores: async (): Promise<Record<string, unknown>> => {
        counters.stores += 1
        return { stores: [] }
      },
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
      get: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      onTemplateChanged: (_handler: (payload: unknown) => void): (() => void) => () => undefined,
      create: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      delete: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      reset: async (): Promise<Record<string, unknown>> => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
    },
    operatorSettings: {
      // `panesInitialized: true` + an explicit ENABLED set is what mounts `crosslinks` (the shipped first-run default is only
      // `search`+`doc-nav`) and keeps the operator probe pane enabled (`enabledOperatorPanes`).
      get: async (): Promise<Record<string, unknown>> => {
        counters.settingsGets += 1
        return {
          enabledPanes: [DOC_NAV, SEARCH, CROSSLINKS],
          enabledOperatorPanes: [SETTINGS, OPERATOR_PROBE],
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
  // ⟨`L9`, ADDITIVE⟩ THE HOST'S OWN `fire` DISPATCHES, counted at the seam the host holds. The real channel is FROZEN
  // (`pane-events.ts` returns `Object.freeze({ subscribe, fire, subscribeRecord, deliver, panes, recordPanes })`), so the counting
  // is a DELEGATING façade handed to the host as its `events` — the host's `this.events?.fire('crosslinks')` is exactly the
  // dispatch the fail-closed store guards must prevent, and `drive.channel` stays the REAL channel so every pre-existing row's
  // `fire`/`subscribe` behaves byte-for-byte as before.
  // ⟨HARNESS CONFORMANCE — NOT A `B-6` BEHAVIOUR CHANGE.⟩ This façade is a `PaneEvents`, so it must carry EVERY member the
  // interface REQUIRES — and `subscribeChange` has been required since `B-4`. It did not, and the `as unknown as` cast hid exactly
  // that: `boot` registers a change-interested census id (unit `B-6` declares `doc-nav`) with `subscribeChange`, so the host's own
  // boot threw `TypeError: this.events.subscribeChange is not a function` and took every row in this file with it. The missing seven
  // members are added below, each forwarding STRAIGHT to the REAL `channel` (no counting, no behaviour). The cast now stands only for
  // the COUNTING member (`fire`, the dispatch census `L9` reads) and the shared handler-type erasure (`subscribe`), never to paper
  // over a member the interface already required: every reading below is still the host's own dispatch on the real registry.
  const hostedEvents = {
    subscribe: (paneId: string, handler: (report: never) => void): (() => void) => channel.subscribe(paneId, handler),
    subscribeRecord: (paneId: string, handler: (report: never) => void): (() => void) => channel.subscribeRecord(paneId, handler),
    subscribeChange: (paneId: string, handler: (report: never) => void): (() => void) => channel.subscribeChange(paneId, handler),
    fire: (paneId: string): unknown => {
      firesLog.push(typeof paneId === 'string' ? paneId : `(non-string: ${shown(paneId)})`)
      return channel.fire(paneId)
    },
    publishChange: (): unknown => channel.publishChange(),
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
      // The dirty-edit guard's rebuild request: RECORDED, never driven (driving it would be a re-assembly the rows must be able
      // to read as ABSENT; `L5`'s m5 drives `reDerive` explicitly and by name). `L9` reads the record as the guards' rebuild arm.
      requestRebuild: (kind: string): void => {
        rebuilds.push(String(kind))
      },
      restoreCaret: (): undefined => undefined,
      isEditable: (): boolean => true,
    },
    ...(hostSubscribed ? { events: hostedEvents } : {}),
  } as never)

  // THE COUNTERS AND THE PAINT'S VERDICT, wrapped on the INSTANCE before boot (an instance own-property SHADOWS the prototype
  // method, so the class's OWN `this.loadAppGraph(...)`/`this.updatePane(...)` calls are counted too — `L3`'s floor and `L5`'s
  // mutants are what prove it).
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
  // snapshot/doc-heads (the §3 subject's source), `_currentDocumentId` (the subject's document), `appLoaded`, AND registers the
  // host's `REPLUMBED_PANE_IDS` subscriptions on the channel. Attaching the double without booting would make every zero vacuous.
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
      counters.operatorRenders = 0
      counters.applies = 0
      counters.snapshot = 0
      counters.docHeads = 0
      counters.backlinks = 0
      counters.security = 0
      counters.stores = 0
      backlinkArgs.length = 0
      verdicts.length = 0
      rebuilds.length = 0
      firesLog.length = 0
    },
    roots: () => runtime.roots(),
    applies: () => runtime.applies,
    applyAnswers: () => runtime.applyAnswers.map((ids) => [...ids]),
    verdicts: () => verdicts.map((verdict) => ({ ...verdict })),
    backlinkArgs: () => [...backlinkArgs],
    setBacklinkAnswer: (handler) => {
      backlinkAnswer = handler
    },
    rebuildRequests: () => [...rebuilds],
    fires: () => [...firesLog],
    setEnumeration: (next: Record<string, unknown>) => {
      enumeration = next
    },
    enumeration: () => enumeration,
    lastEnumeration: () => enumeration,
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

/** `seedHost` under the name the rows use: the seed ALWAYS awaits the public boot before a single reading is taken. */
const seeded = async (options: SeedOptions = {}): Promise<HostDrive> => seedHost(options)

/** The three counters + the re-read census as ONE readable string, for every failure message and for `L5`'s printed readings. */
const countersReading = (counters: Counters): string =>
  `refresh=${counters.refresh} loadAppGraph=${counters.loadAppGraph} mountOperator=${counters.mountOperator}` +
  ` (secondary: operatorSettings.get=${counters.settingsGets} loadEnvelope=${counters.loadEnvelopes}` +
  ` operatorRender=${counters.operatorRenders} applyContentReconcile=${counters.applies})` +
  ` (re-read census: backlinks=${counters.backlinks} snapshot=${counters.snapshot} docHeads=${counters.docHeads}` +
  ` security=${counters.security})`

/** Await a macrotask a few times: the fire's re-read is a bridge PROMISE, and the paint it precedes is not awaited by the host. */
const settle = async (rounds = 3): Promise<void> => {
  for (let i = 0; i < rounds; i += 1) await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

/** The §2 payload shape main broadcasts on an EDGE write (`edit.set_edge` / `deriveBatchBroadcast`'s `putEdge` arm). */
const edgeWritePayload = (edgeIds: string[]): Record<string, unknown> => ({
  kind: 'structural',
  nodeIds: [NEW_SOURCE, NEW_TARGET],
  edgeIds,
  store: STORE,
})

interface FireOutcome {
  threw: string
  problems: string[]
}

/** Deliver ONE `RagStoreChangedPayload` through the host's OWN seam (`onRagStoreChanged` — §2's named learner), then let the
 *  re-read + paint it starts settle. A throw is a NAMED problem: the arm is an event handler, not a caller. */
async function deliverFire(drive: HostDrive, payload: Record<string, unknown>, limb: string): Promise<FireOutcome> {
  const member = readMember(drive.host, 'onRagStoreChanged', `the REAL \`SidebarPanes\` instance (${SIDEBAR_FILE})`, limb)
  if (typeof member.value !== 'function') return { threw: '', problems: member.problems }
  let threw = ''
  try {
    ;(member.value as (next: unknown) => void).call(drive.host, payload)
  } catch (error) {
    threw = String(error)
  }
  await settle()
  if (threw !== '') {
    return {
      threw,
      problems: [`limb ${limb}: \`onRagStoreChanged\` THREW on ${shown(payload)} (${threw}) — the seam is an event handler and never a throw site`],
    }
  }
  return { threw: '', problems: [] }
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
        `limb ${limb}: the root \`${id}\` was RE-MINTED across the update (identity, not equality: the object changed) — §4's paint ` +
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

/** The pane's LIVE frame, or `undefined` — `L1`'s subject. */
const liveFrame = (drive: HostDrive): unknown => rootById(drive.roots(), `pane-${CROSSLINKS}`)

/** The AUTHORED lines of the pane's back section, read off a frame (`L4`/`L5`/`L6`). */
const paneAuthoredText = (frame: unknown): string => authoredText(frame)

// ---------------------------------------------------------------------------
// ROWS
// ---------------------------------------------------------------------------
describe('pane-links — a detected backlink fires the `crosslinks` pane: ONE re-read of §3\'s subject, ONE authored root replaced, INV-E, and the C19 carrier surviving the paint', () => {
  it('L1 — a detected backlink fires: ONE `rag.backlinks(head-a)` re-read, `lastBacklinks` fresh, the pane re-authors ONCE and ONLY its root is replaced, 0/0/0 counters and 0 snapshot/docHeads/security', async () => {
    // §6 `L1` (§2's seam, §3's subject, §4's re-read/paint, §1's `INV-E`). LAYER: envelope-class — the REAL `SidebarPanes` over
    // the LAYOUT-LESS DOM shim, the observables being the paint's own verdict, the envelope's authored text, the identity of
    // authored nodes and call counts (no CSS, no box, no pointer exists in this shim).
    // NON-VACUITY: the seed asserts a MULTI-root census (a document root, two other pane frames and the pinned pane-like roots)
    // and that the fresh frame REALLY differs from the live one (the authored list moved from `(none)` to the new line), so
    // `applied === ['pane-crosslinks']` cannot be satisfied by a paint that never lands; the three counters' zeroes are floored
    // by `L3`'s `host.refresh()` moving all three on this same double, and the re-read census is floored by the SAME payload
    // moving `backlinks` from 0 to 1.
    // MUTATION THAT WOULD RED IT: a fire that re-reads the wrong node (the document id, `_currentNodeId`, or nothing) reds the
    // argument/count arm; a fire that applies the whole assembled envelope (or a document root) reds `applied` and the identity
    // arm; a fire that re-assembles (`refresh`/`loadAppGraph`/`mountOperator`) or re-reads the snapshot/doc-heads/security reds
    // its census arm; a repaint that re-derives the frame's zone/collapsed instead of continuing the LIVE frame reds the carrier
    // arm; a `lastBacklinks` that is not committed reds both the cache and the authored-text arm.
    const problems: string[] = []
    const drive = await seeded({ documents: true, events: true })
    try {
      problems.push(...drive.bootProblems)
      // ⟨`B-6` — THE SIBLING PANE IS ISOLATED, NOT EXCUSED.⟩ `B-6` added a SECOND data-backed pane (`doc-nav`) to this SAME
      // broadcast, so this row's limbs measure the `crosslinks` arm ALONE. The sibling is disabled through the registry — its OWN
      // declared gate, the one `paintReplumbedPane` and `updatePane` both honour (`not-enabled`) — while its frame stays materialized,
      // so it is STILL an "other root, same object" subject below. NO ZERO IS REMOVED BY THIS: the doc-heads census still has to read
      // 0 and the pane's frame still has to be the SAME OBJECT; the sibling's lawful one-re-read-and-one-paint cost is measured by
      // `B-6`'s own rows (`D1`/`D2`/`D10` in `tests/integration/shell-chrome/pane-doc-nav.test.ts`).
      drive.registry.disable(DOC_NAV)

      // ---- THE SEED'S PRE-CONDITIONS (each one is a reading this row's arms depend on) -----------------
      const before = drive.roots()
      const beforeIds = rootIds(before)
      if (beforeIds.length < 3) {
        problems.push(
          `limb L1: the SEED materialized only ${beforeIds.length} content root(s) [${beforeIds.join(', ')}] — "one root applied and ` +
            `every OTHER root the same object" needs other roots to be a reading`,
        )
      }
      const live = rootById(before, `pane-${CROSSLINKS}`)
      if (live === undefined) {
        problems.push(
          `limb L1: the seed carries NO live frame \`pane-${CROSSLINKS}\` (roots read: [${beforeIds.join(', ')}]) — the paint's ` +
            `subject has no frame, so §4's re-read + paint has nothing to update`,
        )
      }
      if (rootById(before, `pane-${DOC_NAV}`) === undefined) {
        problems.push(`limb L1: the seed carries no second app-graph pane frame \`pane-${DOC_NAV}\` — the "other roots" arm has one subject fewer`)
      }
      if (!beforeIds.some((id) => id.startsWith('rag-'))) {
        problems.push(`limb L1: the seed carries NO \`rag-\` document root — "every other materialized root the SAME OBJECT" needs a non-pane subject too`)
      }
      const hostPrivates = drive.host as unknown as Record<string, unknown>
      if (hostPrivates['_currentNodeId'] !== null) {
        problems.push(
          `limb L1: \`_currentNodeId\` reads ${shown(hostPrivates['_currentNodeId'])}, not \`null\` — §3's subject only falls through to ` +
            `the DOC-HEAD when the dead setter (\`F-2\`) has not been called, and this row grades the doc-head arm`,
        )
      }
      if (hostPrivates['_currentDocumentId'] !== DOCUMENT_ID) {
        problems.push(
          `limb L1: \`_currentDocumentId\` reads ${shown(hostPrivates['_currentDocumentId'])}, not \`'${DOCUMENT_ID}'\` — §3's subject is ` +
            `the CURRENT DOCUMENT's doc-head node, so the seed's document is the arm's precondition`,
        )
      }
      if (live !== undefined && paneAuthoredText(live).includes(NEW_LINE)) {
        problems.push(`limb L1: the live frame ALREADY authors \`${NEW_LINE}\` before the fire — the "the list moved" arm would be vacuous`)
      }

      // ---- THE STORE MOVED, THEN ONE FIRE --------------------------------------------------------------
      drive.setEnumeration(afterEnumeration(HEAD_NODE_ID))
      drive.resetCounters()
      const fire = await deliverFire(drive, edgeWritePayload(['e-new']), 'L1')
      problems.push(...fire.problems)

      // ---- THE RE-READ CENSUS: EXACTLY ONE CALL, WITH §3's SUBJECT -------------------------------------
      const args = drive.backlinkArgs()
      if (args.length !== 1) {
        problems.push(
          `limb L1: the fire made ${args.length} \`bridge.rag.backlinks\` call(s) [${args.join(', ')}], not EXACTLY ONE — §4: the pane's ` +
            `re-read is ONE call (\`const result = await this.bridge.rag.backlinks(subject)\`) and nothing else`,
        )
      } else if (args[0] !== HEAD_NODE_ID) {
        problems.push(
          `limb L1: the re-read asked \`bridge.rag.backlinks\` for ${shown(args[0])}, not §3's subject \`'${HEAD_NODE_ID}'\` (the ` +
            `\`doc-head\` edge's SOURCE for \`_currentDocumentId = '${DOCUMENT_ID}'\`) — \`ASM-B5-1\`: \`_currentNodeId\` when set, ELSE the ` +
            `CURRENT DOCUMENT'S DOC-HEAD NODE, and never the document id or the rendered DOM`,
        )
      }

      // ---- `lastBacklinks` IS THE FRESH ENUMERATION ----------------------------------------------------
      const committed = hostPrivates['lastBacklinks']
      if (fingerprint(committed) !== fingerprint(drive.lastEnumeration())) {
        problems.push(
          `limb L1: \`lastBacklinks\` reads ${shown(committed)}, not the fresh enumeration the bridge answered ` +
            `(${shown(drive.lastEnumeration())}) — §4: the re-read COMMITS the result before the paint, and the paint authors from it`,
        )
      }

      // ---- THE PAINT'S OWN VERDICT ---------------------------------------------------------------------
      // ⟨`B-6`⟩ The census is read over THIS ROW'S pane: the disabled sibling still ANSWERS (its declared word `not-enabled`, and
      // the apply/root-identity arms below are what keep that answer non-painting), so an absolute verdict COUNT would be a count of
      // the census rather than of this arm.
      const verdicts = drive.verdicts().filter((verdict) => verdict['paneId'] === CROSSLINKS)
      if (verdicts.length !== 1) {
        problems.push(
          `limb L1: the fire produced ${verdicts.length} pane verdict(s) ${shown(verdicts)}, not EXACTLY ONE — §4's declared arm is the ` +
            `pane's data re-read THEN \`updatePane('${CROSSLINKS}')\`, one paint per fire`,
        )
      } else {
        const verdict = verdicts[0]
        if (verdict['painted'] !== true) {
          problems.push(
            `limb L1: \`updatePane('${CROSSLINKS}')\` answered \`painted\` = ${shown(verdict['painted'])} (reason ` +
              `${shown(verdict['reason'])}) after the enumeration moved — the enabled+mounted pane IS the arm that paints`,
          )
        }
        if (verdict['reason'] !== 'painted') {
          problems.push(`limb L1: the verdict's \`reason\` reads ${shown(verdict['reason'])}, not the declared word \`'painted'\``)
        }
        if (fingerprint(verdict['applied']) !== fingerprint([`pane-${CROSSLINKS}`])) {
          problems.push(
            `limb L1: the verdict's \`applied\` reads ${shown(verdict['applied'])}, not exactly \`['pane-${CROSSLINKS}']\` — §4's reconcile ` +
              `is over THAT PANE'S ROOT ONLY`,
          )
        }
      }

      // ---- ONLY ITS OWN ROOT IS REPLACED ---------------------------------------------------------------
      const after = drive.roots()
      problems.push(...otherRootsProblems(before, after, [`pane-${CROSSLINKS}`], 'L1'))
      const afterLive = rootById(after, `pane-${CROSSLINKS}`)
      if (live !== undefined && afterLive === live) {
        problems.push(
          `limb L1: the pane's OWN root is the SAME OBJECT after a paint that changed its authored list — the managed channel REPLACES ` +
            `the root whole (\`runtime.ts:535-540\`), so the pane's frame must be the NEW object`,
        )
      }

      // ---- THE FRESH FRAME'S CARRIERS AND CONTENT ------------------------------------------------------
      const fresh = appliedFrameOf(drive.applies(), `pane-${CROSSLINKS}`)
      if (fresh === undefined) {
        problems.push(
          `limb L1: the paint never handed the runtime a fresh \`pane-${CROSSLINKS}\` frame (applyContentReconcile calls recorded: ` +
            `${drive.applies().length}) — §4's paint applies the reconcile's \`next\` envelope`,
        )
      } else if (live !== undefined) {
        const beforeCarriers = carriersOf(live)
        const afterCarriers = carriersOf(fresh)
        if (fingerprint(beforeCarriers) !== fingerprint(afterCarriers)) {
          problems.push(
            `limb L1: the fresh frame's CARRIERS/zone/slot differ from the live frame's (live ${shown(beforeCarriers)} vs fresh ` +
              `${shown(afterCarriers)}) — §4 continues the LIVE frame's zone/collapsed (\`paneSubtreeRoot\`), and the frame's identity ` +
              `carriers (\`id\`, \`data-pane-id\`, the head/grip/control ids, the body slot) are never re-derived by a content update`,
          )
        }
        if (!paneAuthoredText(fresh).includes(NEW_LINE)) {
          problems.push(
            `limb L1: the fresh frame does NOT author \`${NEW_LINE}\` (authored text: ${shown(paneAuthoredText(fresh))}) — the paint ` +
              `re-reads \`lastBacklinks\`, so the new backlink line MUST appear in the authored pane`,
          )
        }
      }
      const applies = drive.applyAnswers()
      if (applies.length !== 1 || fingerprint(applies[0]) !== fingerprint([`pane-${CROSSLINKS}`])) {
        problems.push(`limb L1: the managed channel answered ${shown(applies)}, not exactly one call applying \`['pane-${CROSSLINKS}']\` (§4's ONE apply)`)
      }

      // ---- INV-E AND THE RE-READ CENSUS'S ZEROES -------------------------------------------------------
      const painted = drive.counters()
      if (painted.refresh !== 0 || painted.loadAppGraph !== 0 || painted.mountOperator !== 0) {
        problems.push(
          `limb L1: the fire read ${countersReading(painted)} — ` + '`INV-E` pins EVERY one of the three at ZERO on a pane update ' +
            `(§1/§4: no \`loadAppGraph\`, no \`mountOperator\`, no \`refresh()\`)`,
        )
      }
      if (painted.snapshot !== 0 || painted.docHeads !== 0 || painted.security !== 0) {
        problems.push(
          `limb L1: the fire reached the RE-READ CENSUS (snapshot=${painted.snapshot} docHeads=${painted.docHeads} ` +
            `security=${painted.security}) — §4: the pane's re-read is ONE \`rag.backlinks\` call and NO snapshot, NO doc-heads, NO ` +
            `security, NO traversal, NO template. This census is what tells a PAINT from a re-assemble`,
        )
      }
      if (painted.backlinks !== 1) {
        problems.push(`limb L1: the fire read backlinks=${painted.backlinks} — the zero counters above are only a reading beside a re-read that DID happen`)
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb L1 — a detected backlink fires the pane, it re-reads ONCE, and only its own root is replaced (§6 L1; §2's seam; §3's ` +
        `subject; §4's re-read/paint; INV-E). ${problems.length} problem(s). ONE \`onRagStoreChanged\` carrying an \`edgeIds\` entry ` +
        `must make exactly ONE \`bridge.rag.backlinks('${HEAD_NODE_ID}')\` call, commit \`lastBacklinks\`, paint ` +
        `\`applied === ['pane-${CROSSLINKS}']\` through \`Runtime.applyContentReconcile\`, leave every other materialized root the SAME ` +
        `OBJECT, and move none of \`refresh\`/\`loadAppGraph\`/\`mountOperator\` nor the snapshot/doc-heads/security census. ` +
        `envelope-class — the REAL SidebarPanes over the layout-less DOM shim with a recording runtime double; no rendered box, ` +
        `no computed style, no pointer, no IPC count (G8-only)`,
    ).toEqual([])
  })

  it('L2 — a FOREIGN change paints nothing, BOTH directions: an `edgeIds: []` payload (the edit-commit shape) moves no root and re-reads nothing, and a fire with NO document subject answers `painted:false`/`applied: []` without throwing', async () => {
    // §6 `L2` (§2's CONTROL: a content-only commit broadcasts `edgeIds: []`, so "a node's text changed" fires nothing for this
    // pane; §3: `null` when no document is current ⇒ the pane renders `(none)` and the paint answers `unchanged`).
    // LAYER: envelope-class — the REAL host over the shim; the observables are `applied`, node identity and call counts.
    // NON-VACUITY: BOTH directions are measured on the SAME SEED SHAPE as `L1` (the `(a)` half additionally asserts that the
    // enumeration HAS moved and that `L1`'s positive half does repaint the same shape — the `(b)` half asserts the subject
    // guards are genuinely `null` and that a fire which DOES carry an edge and a subject is what `L1` measures on this shape).
    // (b) NEEDS ITS OWN SEED BY NECESSITY, and this is named rather than hidden: it asserts `_currentDocumentId === null` AND
    // `_currentNodeId === null`, which a document-bearing host cannot supply — so `(a)` runs on the document seed and `(b)` on
    // the NO-DOCUMENT seed, one `seedHost` shape with `{documents:false}`. `ASM-B5-1` makes that the ONLY way to reach "no
    // subject": the two guards are the subject's whole definition.
    // MUTATION THAT WOULD RED IT: firing on EVERY payload (dropping §2's `edgeIds.length > 0` predicate) reds (a)'s
    // `backlinks === 0` and its root-identity arm; a fire that fetches without a subject (passing `null`/`''`/a fallback node to
    // `rag.backlinks`) reds (b)'s census arm; an arm that throws on a subjectless fire reds (b)'s no-throw arm; a paint that
    // applies unconditionally reds (b)'s `applied === []`.
    const problems: string[] = []

    // ---- (a) THE `edgeIds: []` CONTROL, ON THE DOCUMENT SEED -----------------------------------------
    const control = await seeded({ documents: true, events: true })
    try {
      problems.push(...control.bootProblems)
      const drive = control
      const before = drive.roots()
      const live = rootById(before, `pane-${CROSSLINKS}`)
      if (live === undefined) {
        problems.push(`limb L2(a): the seed carries no live \`pane-${CROSSLINKS}\` frame (roots: [${rootIds(before).join(', ')}]) — the control has no subject`)
      }
      // THE ENUMERATION REALLY MOVED — so "nothing painted" is the PREDICATE's doing, not a store that did not change.
      drive.setEnumeration(afterEnumeration(HEAD_NODE_ID))
      if (fingerprint(drive.enumeration()) === fingerprint(beforeEnumeration(HEAD_NODE_ID))) {
        problems.push('limb L2(a): the harness failed to move the store enumeration — the control would be measured on an unchanged store')
      }
      drive.resetCounters()
      const fire = await deliverFire(drive, edgeWritePayload([]), 'L2·a')
      problems.push(...fire.problems)
      const counters = drive.counters()
      if (counters.backlinks !== 0) {
        problems.push(
          `limb L2(a): an \`edgeIds: []\` payload (the \`IPC_EDIT_COMMIT\` shape) made ${counters.backlinks} \`rag.backlinks\` call(s) ` +
            `[${drive.backlinkArgs().join(', ')}] — §2's predicate is \`Array.isArray(payload.edgeIds) && payload.edgeIds.length > 0\`: ` +
            `a CONTENT-ONLY commit fires NOTHING for this pane`,
        )
      }
      if (counters.applies !== 0) {
        problems.push(`limb L2(a): the control reached \`applyContentReconcile\` ${counters.applies} time(s) — a foreign change paints nothing`)
      }
      const after = drive.roots()
      if (live !== undefined && rootById(after, `pane-${CROSSLINKS}`) !== live) {
        problems.push('limb L2(a): the control REPLACED the pane root — a content-only commit touches no root of this pane')
      }
      problems.push(...otherRootsProblems(before, after, [], 'L2·a'))
      const verdicts = drive.verdicts()
      if (verdicts.some((verdict) => verdict['painted'] === true || fingerprint(verdict['applied']) !== fingerprint([]))) {
        problems.push(`limb L2(a): the control produced a PAINTING verdict ${shown(verdicts)} — nothing may be applied for a foreign change`)
      }
      const liveAfter = rootById(after, `pane-${CROSSLINKS}`)
      if (liveAfter !== undefined && paneAuthoredText(liveAfter).includes(NEW_LINE)) {
        problems.push(`limb L2(a): the pane authors \`${NEW_LINE}\` after a FOREIGN change — the control must not move the pane's data`)
      }
    } finally {
      control.restore()
    }

    // ---- (b) NO DOCUMENT SUBJECT, ON THE NO-DOCUMENT SEED ---------------------------------------------
    const subjectless = await seeded({ documents: false, events: true })
    try {
      problems.push(...subjectless.bootProblems)
      const drive = subjectless
      const hostPrivates = drive.host as unknown as Record<string, unknown>
      const before = drive.roots()
      if (hostPrivates['_currentDocumentId'] !== null) {
        problems.push(
          `limb L2(b): \`_currentDocumentId\` reads ${shown(hostPrivates['_currentDocumentId'])}, not \`null\` — the no-document seed ` +
            `carries no \`doc-head\` edge, so §3's subject has no document to fall back to`,
        )
      }
      if (hostPrivates['_currentNodeId'] !== null) {
        problems.push(`limb L2(b): \`_currentNodeId\` reads ${shown(hostPrivates['_currentNodeId'])}, not \`null\``)
      }
      if (rootById(before, `pane-${CROSSLINKS}`) === undefined) {
        problems.push(
          `limb L2(b): the no-document seed carries no live \`pane-${CROSSLINKS}\` frame (roots: [${rootIds(before).join(', ')}]) — the ` +
            `enabled+mounted pane is the arm's subject even when it has no data to show`,
        )
      }
      drive.setEnumeration(afterEnumeration(HEAD_NODE_ID))
      drive.resetCounters()
      const fire = await deliverFire(drive, edgeWritePayload(['e-new']), 'L2·b')
      problems.push(...fire.problems)
      if (fire.threw !== '') {
        problems.push(`limb L2(b): the subjectless fire THREW (${fire.threw}) — §3's \`null\` subject is a DECLARED state, never a throw`)
      }
      const counters = drive.counters()
      if (counters.backlinks !== 0) {
        problems.push(
          `limb L2(b): the subjectless fire called \`rag.backlinks\` ${counters.backlinks} time(s) [${drive.backlinkArgs().join(', ')}] ` +
            `— §3: \`null\` when no document is current, and a \`null\` subject fetches NOTHING`,
        )
      }
      const verdicts = drive.verdicts()
      if (verdicts.length === 0) {
        problems.push(
          `limb L2(b): the subjectless fire produced NO pane verdict — §4's declared arm is the pane's data re-read THEN ` +
            `\`updatePane('${CROSSLINKS}')\`, and the paint still runs (it legitimately answers \`unchanged\`)`,
        )
      }
      for (const verdict of verdicts) {
        if (verdict['painted'] !== false) {
          problems.push(`limb L2(b): a subjectless verdict answered \`painted\` = ${shown(verdict['painted'])} — with no subject the pane authors \`(none)\` and nothing is applied`)
        }
        if (fingerprint(verdict['applied']) !== fingerprint([])) {
          problems.push(`limb L2(b): a subjectless verdict applied ${shown(verdict['applied'])}, not \`[]\``)
        }
      }
      if (counters.applies !== 0) {
        problems.push(`limb L2(b): the subjectless fire reached \`applyContentReconcile\` ${counters.applies} time(s) — no subject, no root`)
      }
      problems.push(...otherRootsProblems(before, drive.roots(), [], 'L2·b'))
      if (counters.refresh !== 0 || counters.loadAppGraph !== 0 || counters.mountOperator !== 0) {
        problems.push(`limb L2(b): the subjectless fire read ${countersReading(counters)} — \`INV-E\` holds for a refused paint too`)
      }
    } finally {
      subjectless.restore()
    }

    expect(
      problems,
      `limb L2 — a foreign change paints nothing, both directions (§6 L2; §2's \`edgeIds: []\` CONTROL; §3's \`null\` subject). ` +
        `${problems.length} problem(s). (a) A content-only commit (\`edgeIds: []\`) must make ZERO \`rag.backlinks\` calls and touch ` +
        `NO root while the store enumeration really moved; (b) a fire with no document subject (\`_currentDocumentId === null\` and ` +
        `\`_currentNodeId === null\`) must answer \`painted:false\`/\`applied: []\` and throw nothing. \`L1\`'s positive half is this ` +
        `seed shape's floor. envelope-class — the REAL SidebarPanes over the layout-less DOM shim; no rendered box, no pointer (G8-only)`,
    ).toEqual([])
  })

  it('L3 — the census moves by exactly ONE: `REPLUMBED_PANE_IDS` is `{gnosis-query, crosslinks, doc-nav}` (extended by `B-6`) with its `B-5` comment, `doc-nav` and `crosslinks` each answer ONE registration, `search`/`template-editor` reach NO listener, `refresh()` still re-assembles, and `renderer.ts` is untouched', async () => {
    // §6 `L3` (§4's ONE declared census; §2's "the migration is incremental, never a big bang"; `O-4`: `renderer.ts`'s `⟨B-9⟩`
    // fallback and `gnosisCrudPanes`'s `host.refresh()` are NOT this unit's).
    // ⟨EXTENDED BY UNIT `B-6` (`pane-doc-nav`) — A RECORDED-VALUE EXTENSION, NEVER A RELAXATION.⟩ `B-6` moved the census by exactly
    // ONE more id (`doc-nav`, whose cause is the pane's TWO sources) and registered it in the SAME `boot` loop, so this file's
    // recorded value moves to the LANDED three-id value and `doc-nav` moves OUT of the negative loop INTO its own positive control
    // (ONE registration, never two): after `B-6` it IS a listener, and a `fired:false, handlers:0` arm for it would be false by
    // design. The SET comparison stays SET-equality, the `settings`-exclusion arm stays, the `B-5` comment-window clause stays exactly
    // as it is, and `search`/`template-editor` keep their negatives. `doc-nav`'s OWN arm (its re-read, its gate, its stamp) is
    // `B-6`'s row to grade (`tests/integration/shell-chrome/pane-doc-nav.test.ts`); THIS row grades the census VALUE and the other
    // families' silence.
    // LAYER: envelope-class — the host module's exports + the sources' TEXT + the REAL host over the shim.
    // NON-VACUITY: the `fired:false, handlers:0` arms are floored by the SAME channel answering `fired:true, handlers:1` for
    // `crosslinks` (the host's own boot-time subscription), and the census SET equality is floored by the source clause that
    // requires the cause to be NAMED beside it — so "exactly these three" cannot pass by naming none. `host.refresh()` moves all
    // three counters on this very double, which is `L1`'s and `L5`'s zeroes' floor.
    // MUTATION THAT WOULD RED IT: adding a fourth id (a silent second subscriber) or dropping one reds the SET arm; entombing the
    // move in code with no `B-5` cause reds the source clause; subscribing `search`/`template-editor` to the channel reds its
    // `handlers:0` arm; stacking a `subscribeChange` beside the plain `subscribe` for `doc-nav` reds its `handlers:1` control
    // (`B2-ADV-04`); a `doc-nav` registered with a plain `subscribe` leaves `changePanes()` short and reds `B-6`'s own `D4`; deleting
    // the `⟨B-9⟩` operator fallback or `gnosisCrudPanes.onChanged`'s `refresh()` reds the `renderer.ts` clause; a host whose
    // `refresh()` no longer re-assembles reds the floor and makes `L1`'s zeroes unreadable.
    const problems: string[] = []

    // ---- THE CONSTANT (through `await import()`, per the reachability rule) ---------------------------
    let hostModule: Record<string, unknown> | null = null
    try {
      hostModule = (await import('../../../src/renderer/sidebar-panes.js')) as Record<string, unknown>
    } catch (error) {
      problems.push(`limb L3: \`${SIDEBAR_FILE}\` does not resolve as a module (${String(error)}) — the pinned census's home is unreadable`)
    }
    const replumbed = hostModule === null ? undefined : hostModule['REPLUMBED_PANE_IDS']
    if (replumbed === undefined) {
      problems.push(
        `limb L3: \`REPLUMBED_PANE_IDS\` does not resolve on \`src/renderer/sidebar-panes.js\` — §4 pins it as the ONE declared ` +
          `constant naming the panes whose paint the host registers on the channel: exactly \`{gnosis-query, crosslinks, doc-nav}\``,
      )
    } else {
      const read = Array.isArray(replumbed) ? replumbed.map(String) : null
      const wanted = ['gnosis-query', CROSSLINKS, DOC_NAV]
      const asSet = read === null ? null : [...new Set(read)].sort()
      const wantedSet = [...new Set(wanted)].sort()
      if (asSet === null) {
        problems.push(`limb L3: \`REPLUMBED_PANE_IDS\` reads ${shown(replumbed)}, not an array of pane ids`)
      } else if (fingerprint(asSet) !== fingerprint(wantedSet)) {
        problems.push(
          `limb L3: \`REPLUMBED_PANE_IDS\` reads ${shown(read)}, whose SET is ${shown(asSet)}, not ${shown(wantedSet)} — §4: the row ` +
            `moves by EXACTLY ONE per unit (\`B-5\`: \`['gnosis-query']\` -> \`['gnosis-query','crosslinks']\`; \`B-6\`: -> ` +
            `\`['gnosis-query','crosslinks','doc-nav']\`) and a later family unit must EXTEND this constant deliberately; every other ` +
            `pane keeps its \`refresh()\` route until its own unit`,
        )
      }
      if (read !== null && read.includes(SETTINGS)) {
        problems.push(
          `limb L3: \`REPLUMBED_PANE_IDS\` names \`${SETTINGS}\` — the operator pane is \`B-9\`'s surface (its lawful paint RE-MOUNTS the ` +
            `operator scope) and \`updatePane\` answers \`operator-scope\` for it; §4 keeps it OUT of this census`,
        )
      }
    }

    // ---- THE SOURCE CLAUSE: the `B-5` cause beside the declaration -----------------------------------
    let sidebarText = ''
    try {
      sidebarText = readText(SIDEBAR_FILE)
    } catch (error) {
      problems.push(`limb L3: \`${SIDEBAR_FILE}\` is unreadable (${String(error)}) — the census's comment clause has no subject`)
    }
    if (sidebarText !== '') {
      const lines = sidebarText.split('\n')
      const at = lines.findIndex((line) => /^\s*export\s+const\s+REPLUMBED_PANE_IDS\b/.test(line))
      if (at < 0) {
        problems.push(`limb L3: no \`export const REPLUMBED_PANE_IDS\` declaration line was found in \`${SIDEBAR_FILE}\` — the census's comment clause has no anchor`)
      } else {
        // §4: "with a `B-5` comment naming the cause (D-24's example, the detection seam of §2)". The window is the 12 lines ABOVE
        // the declaration: a docblock that names the unit and its cause, which no future reader can mistake for an unrelated one.
        const window = lines.slice(Math.max(0, at - 12), at + 1).join('\n')
        if (!/B-5/.test(window)) {
          problems.push(
            `limb L3: the 12 lines above \`REPLUMBED_PANE_IDS\` in \`${SIDEBAR_FILE}\` carry NO \`B-5\` marker (§4: the census carries ` +
              `a \`B-5\` comment NAMING THE CAUSE — D-24's example, the detection seam of §2). Read: ${shown(window.split('\n').slice(-6).join('\n'))}`,
          )
        }
      }
    }

    // ---- THE CHANNEL CENSUS + THE FLOOR, ON ONE BOOTED HOST ------------------------------------------
    const floor = await seeded({ documents: true, events: true })
    try {
      problems.push(...floor.bootProblems)
      const drive = floor
      if (!drive.hostSubscribed) {
        problems.push('limb L3: the harness did not hand the host its `events` channel — the boot-time subscription has no subject')
      }
      // THE POSITIVE CONTROL FIRST: the host's OWN subscription answers for `crosslinks`.
      const positive = drive.channel.fire(CROSSLINKS)
      await settle()
      if (positive.fired !== true || positive.handlers !== 1) {
        problems.push(
          `limb L3: \`fire('${CROSSLINKS}')\` answered ${shown(positive)}, not \`fired:true, handlers:1\` — §4's boot loop subscribes ` +
            `ONE handler per \`REPLUMBED_PANE_IDS\` id, so the moved census IS a listener on this very channel. Without this arm the ` +
            `\`handlers:0\` arms below are satisfied by a host that subscribed nothing at all`,
        )
      }
      if (positive.fired === true && positive.handlers !== 1) {
        problems.push(
          `limb L3: \`fire('${CROSSLINKS}')\` reached ${positive.handlers} handler(s), not EXACTLY ONE — \`B2-ADV-04\`'s lesson: ONE ` +
            `subscriber per id, never a second stacked by a re-boot or a second declaration`,
        )
      }
      // ⟨`B-6` — `doc-nav` IS A LISTENER NOW, SO ITS ARM IS A POSITIVE CONTROL, NEVER A DELETED ONE.⟩ The census was EXTENDED by
      // exactly ONE id, and that id is registered with `subscribeChange` (`subscribe` + a mark, the SAME handler map), so a fire
      // reaches it ONCE. `handlers:1` is the `B2-ADV-04` arm in its positive form: a landing that stacked a `subscribeChange` beside
      // the plain `subscribe` would answer `handlers:2` here and run the pane's whole re-read + paint twice per fire. `doc-nav`'s
      // re-read, gate and stamp are `B-6`'s own rows; THIS file grades the census VALUE and the other families' silence.
      const docNavPositive = drive.channel.fire(DOC_NAV)
      await settle()
      if (docNavPositive.fired !== true || docNavPositive.handlers !== 1) {
        problems.push(
          `limb L3: \`fire('${DOC_NAV}')\` answered ${shown(docNavPositive)}, not \`fired:true, handlers:1\` — the census was EXTENDED ` +
            `by \`B-6\` (one id, one cause: the pane's two sources) and its id is subscribed ONCE by the ONE boot loop, so the census ` +
            `IS a listener on this channel and ONE registration is what \`B2-ADV-04\` allows`,
        )
      }
      // THE NEGATIVES: the two families that keep `refresh()` reach NO listener.
      for (const paneId of [SEARCH, TEMPLATE_EDITOR]) {
        const report = drive.channel.fire(paneId)
        if (report.fired !== false || report.handlers !== 0) {
          problems.push(
            `limb L3: \`fire('${paneId}')\` answered ${shown(report)}, not \`fired:false, handlers:0\` — \`${paneId}\` is NOT in ` +
              `\`REPLUMBED_PANE_IDS\`: it keeps the pre-migration \`refresh()\` route until its own unit (§4: the migration is ` +
              `incremental, never a big bang)`,
          )
        }
      }
      if (drive.registry.get(SETTINGS)?.scope !== 'operator') {
        problems.push(`limb L3: \`settings\` no longer reads \`operator\` in the registry — the operator arm's subject has drifted`)
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
        problems.push(`limb L3: \`host.refresh()\` THREW on this harness (${refreshThrew}) — the pre-migration route is the floor and must run`)
      }
      const floorCounters = drive.counters()
      if (floorCounters.loadAppGraph < 1) {
        problems.push(
          `limb L3: \`host.refresh()\` reached \`loadAppGraph\` ${floorCounters.loadAppGraph} time(s), not ≥ 1 ` +
            `(${countersReading(floorCounters)}) — with this false, \`L1\`'s \`loadAppGraph === 0\` could not discriminate`,
        )
      }
      if (floorCounters.mountOperator < 1) {
        problems.push(`limb L3: \`host.refresh()\` reached \`mountOperator\` ${floorCounters.mountOperator} time(s), not ≥ 1 (${countersReading(floorCounters)})`)
      }
      if (floorCounters.loadEnvelopes < 1) {
        problems.push(`limb L3: the BYPASS-PROOF reading is dead — \`runtime.loadEnvelope\` was called ${floorCounters.loadEnvelopes} time(s) across a refresh that re-assembles`)
      }
      if (floorCounters.operatorRenders < 1) {
        problems.push(
          `limb L3: the BYPASS-PROOF \`mountOperator\` reading is dead — the operator probe pane's \`render\` ran ` +
            `${floorCounters.operatorRenders} time(s) across a refresh that re-mounts the operator surface`,
        )
      }
    } finally {
      floor.restore()
    }

    // ---- THE `renderer.ts` SOURCE CLAUSE (`O-4`: NOT this unit's scope) ------------------------------
    let rendererText = ''
    try {
      rendererText = readText(RENDERER_FILE)
    } catch (error) {
      problems.push(`limb L3: \`${RENDERER_FILE}\` is unreadable (${String(error)}) — the ⟨B-9⟩ scope clause has no subject`)
    }
    if (rendererText !== '') {
      const operatorFallback = /registry\s*\.\s*get\(\s*paneId\s*\)\s*\?\.\s*scope\s*===\s*'operator'[\s\S]{0,200}?host\.refresh\(\)/.test(
        rendererText,
      )
      if (!operatorFallback) {
        problems.push(
          `limb L3: \`${RENDERER_FILE}\` no longer carries the ⟨B-9⟩ operator fallback (\`registry.get(paneId)?.scope === 'operator'\` ` +
            `followed by \`host.refresh()\`) — \`O-4\`: that branch is \`B-9\`'s to DELETE when the operator panes' paint lands, and this ` +
            `unit must not have moved it`,
        )
      }
      const crudRefresh = /gnosisCrudPanes\s*=\s*new\s+GnosisCrudPanes\(\{[\s\S]{0,400}?onChanged[\s\S]{0,200}?host\.refresh\(\)/.test(
        rendererText,
      )
      if (!crudRefresh) {
        problems.push(
          `limb L3: \`${RENDERER_FILE}\`'s \`gnosisCrudPanes\` \`onChanged\` no longer calls \`host.refresh()\` — \`O-4\`: that family's ` +
            `route is untouched by this unit, and \`L3\`'s source clause exists so no later reader mistakes this unit's scope for theirs`,
        )
      }
    }

    expect(
      problems,
      `limb L3 — the census moves by exactly ONE and the other families keep \`refresh()\` (§6 L3; §4's ONE declared census; O-4). ` +
        `${problems.length} problem(s). \`REPLUMBED_PANE_IDS\` must be exactly \`{gnosis-query, crosslinks, doc-nav}\` as a SET — the ` +
        `\`B-6\` EXTENSION of this row's recorded value, never a relaxation of it — carry a \`B-5\` comment naming the cause beside its ` +
        `declaration, leave \`search\`/\`template-editor\` with NO listener (\`fired:false, handlers:0\`) while the SAME channel answers ` +
        `\`fired:true, handlers:1\` for \`crosslinks\` AND for \`doc-nav\` (ONE registration each, \`B2-ADV-04\`); \`host.refresh()\` must ` +
        `still reach \`loadAppGraph\` + \`mountOperator\` on this double (the floor under \`L1\`'s zeroes); and \`${RENDERER_FILE}\`'s ` +
        `⟨B-9⟩ fallback + \`gnosisCrudPanes\` \`refresh()\` must still be there. \`doc-nav\`'s own arm (its re-read, its gate, its ` +
        `stamp) is \`B-6\`'s row to grade; THIS row grades the census VALUE and the other families' silence. envelope-class`,
    ).toEqual([])
  })

  it('L4 — the C19 hover-preview carrier SURVIVES the paint: with `hoverPreview.activeId` resolving, the repainted frame authors the popup; with a dangling id it authors none', async () => {
    // §6 `L4` (§5: the popup is authored from `hoverPreview.activeId` on EVERY render, so a repaint re-authors the popup subtree —
    // `U-PARITY-C19` — and a dangling id authors none, `crosslinksContent`'s F1 arm).
    // LAYER: envelope-class — the popup is read off the AUTHORED ENVELOPE (`data-role="hover-preview"`), never off a rendered
    // element; the shim has no layout and no style, and this row asserts neither.
    // NON-VACUITY: each shot MOVES the pane's data first (a shape-equal re-render applies nothing, so a second shot over the same
    // enumeration would leave the live frame untouched and make "the popup survived the repaint" unreadable), and each shot reads the
    // popup off the FIRE'S OWN freshly applied frame — so a paint that never landed is a NAMED problem instead of a pass.
    // THE CHOICE OF DRIVE IS RECORDED HERE (as the row requires): the C19 controller IS constructible on this double
    // (`SidebarPanes.hoverPreview` is a real `HoverPreviewController` whose public `enter(id)` sets the active id), so the popup is
    // driven through `enter` + the real fire's repaint. The documented fallback — driving the pane's `render` off the registry
    // definition with the host's own `buildTemplateContext()` — is NOT needed; if the controller were unreachable this row says so
    // as an INFO note and grades the authored frame the fallback can author, never a skip.
    // MUTATION THAT WOULD RED IT: a paint that authors the fresh frame from a context that drops `hoverPreviewId` (the carrier
    // lost) reds the resolvable-id arm; a paint that drops the dangling-id guard (authoring a popup for an unresolvable id) reds
    // the dangling arm; a paint that never re-authors (applies no fresh frame) reds the "applied NO fresh frame" arms.
    const problems: string[] = []
    const notes: string[] = []
    const drive = await seeded({ documents: true, events: true })
    try {
      problems.push(...drive.bootProblems)
      const controller = (drive.host as unknown as Record<string, unknown>)['hoverPreview'] as
        | { enter?: (id: string) => void; activeId?: string | null }
        | undefined
      const controllerUsable = typeof controller?.enter === 'function'

      // ⟨THE PRE-EXISTING ROUTE THIS ROW MUST NOT CREDIT.⟩ `HoverPreviewController.enter(id)` calls its `onChange`, which is
      // `rerenderAppGraph()` -> `loadAppGraph` (`sidebar-panes.ts`'s controller construction) — the `⟨U-PARITY-C19⟩` hover re-render
      // §5 NAMES AS *NOT* THIS UNIT'S and OUTSIDE `INV-E`'s subject. So `enter()` alone re-authors the whole graph, popup included,
      // and a row that read the LIVE frame after it would be reading that re-assembly. EVERY reading below is therefore taken from
      // the FIRE'S OWN freshly applied frame (`applyContentReconcile`'s `next`, sliced at a mark recorded per shot), and the
      // counters are reset AFTER `enter()` so the hover route's re-assembly is never mistaken for the paint's cost.

      // ---- SHOT 1: A RESOLVABLE ID (a node the cached snapshot carries) -------------------------------
      drive.setEnumeration(afterEnumeration(HEAD_NODE_ID))
      let resolvableAuthored: unknown
      if (controllerUsable) {
        controller?.enter?.(SECTION_NODE_ID)
        if (controller?.activeId !== SECTION_NODE_ID) {
          problems.push(
            `limb L4: \`hoverPreview.enter('${SECTION_NODE_ID}')\` left \`activeId\` = ${shown(controller?.activeId)} — the C19 carrier ` +
              `this row grades is the controller's own live id`,
          )
        }
        const mark = drive.applies().length
        drive.resetCounters()
        const fire = await deliverFire(drive, edgeWritePayload(['e-new']), 'L4·resolvable')
        problems.push(...fire.problems)
        resolvableAuthored = appliedFrameOf(drive.applies().slice(mark), `pane-${CROSSLINKS}`)
      } else {
        // THE FALLBACK, RECORDED (the row allows it and never skips): the pane's `render` through the REGISTRY definition with the
        // options the host passes. The host's own `render` closure carries `hoverPreviewId`, so with no controller the id cannot be
        // set from outside — the note says exactly that and the arm grades the DANGLE-FREE shape the host can still author.
        notes.push(
          `hoverPreview controller NOT constructible on this double (typeof enter: ${typeof controller?.enter}) — shot 1 read the ` +
            `pane's render through the registry definition with the host's buildTemplateContext() as the fallback the row allows`,
        )
        const def = drive.registry.get(CROSSLINKS)
        const render = (def as { render?: (ctx: unknown) => unknown } | undefined)?.render
        if (typeof render !== 'function') {
          problems.push(`limb L4: neither the hover-preview controller NOR \`registry.get('${CROSSLINKS}').render\` is reachable — the carrier has no subject at all`)
        } else {
          resolvableAuthored = render.call(def, drive.host.buildTemplateContext())
        }
      }
      if (resolvableAuthored === undefined) {
        problems.push(
          `limb L4: the resolvable-id shot applied NO fresh frame through the fire (applyContentReconcile calls recorded for the ` +
            `shot: ${shown(drive.applyAnswers())}) — the popup's survival must be a reading of the PAINT, not of the boot frame or of ` +
            `the C19 hover re-render (§5)`,
        )
      } else if (!hasHoverPreviewPopup(resolvableAuthored)) {
        problems.push(
          `limb L4: the freshly AUTHORED frame carries NO hover-preview popup for a RESOLVABLE id (\`${SECTION_NODE_ID}\` is in the ` +
            `cached snapshot) — §5: the popup is authored from \`hoverPreview.activeId\` on EVERY render, so it must SURVIVE the paint ` +
            `(\`U-PARITY-C19\`); authored text: ${shown(paneAuthoredText(resolvableAuthored))}`,
        )
      }

      // ---- SHOT 2: A DANGLING ID (nothing the snapshot/doc-heads resolve) -----------------------------
      drive.setEnumeration(afterEnumerationTwo(HEAD_NODE_ID))
      let danglingAuthored: unknown
      if (controllerUsable) {
        controller?.enter?.(DANGLING_ID)
        const mark = drive.applies().length
        drive.resetCounters()
        const fire = await deliverFire(drive, edgeWritePayload(['e-new-2']), 'L4·dangling')
        problems.push(...fire.problems)
        danglingAuthored = appliedFrameOf(drive.applies().slice(mark), `pane-${CROSSLINKS}`)
      } else {
        const def = drive.registry.get(CROSSLINKS)
        const render = (def as { render?: (ctx: unknown) => unknown } | undefined)?.render
        danglingAuthored = typeof render === 'function' ? render.call(def, drive.host.buildTemplateContext()) : undefined
      }
      if (danglingAuthored === undefined) {
        problems.push('limb L4: the dangling-id shot applied NO fresh frame through the fire — the F1 arm would be a reading of a frame the paint never authored')
      } else if (hasHoverPreviewPopup(danglingAuthored)) {
        problems.push(
          `limb L4: the freshly AUTHORED frame carries a hover-preview popup for the DANGLING id \`${DANGLING_ID}\` — ` +
            `\`crosslinksContent\`'s F1 arm authors NONE for an unresolvable target (§5); authored text: ${shown(paneAuthoredText(danglingAuthored))}`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb L4 — the hover-preview carrier survives the paint (§6 L4; §5's \`crosslinksContent\` F1 arm). ${problems.length} ` +
        `problem(s). The repainted frame must author the popup subtree for a resolvable \`hoverPreview.activeId\` and NONE for a ` +
        `dangling one — both read off the AUTHORED envelope, never the DOM. ${notes.length > 0 ? `NOTES: ${notes.join(' · ')}. ` : ''}` +
        `envelope-class — no layout, no style, no pointer`,
    ).toEqual([])
  })

  it('L5 — INV-E and FIVE mutants: the channel-driven paint reads 0/0/0 while m1 refresh, m2 loadAppGraph, m3 mountOperator, m4 a no-op and m5 a re-assembly instead of the paint are each CAUGHT with a printed computed reading', async () => {
    // §6 `L5` (§1/§4: `INV-E`'s subject is the PANE UPDATE's body; §6's "the row must be able to FAIL"; `B3-ADV-01`: every
    // mutant's reading is COMPUTED, never an authored sentence).
    // LAYER: envelope-class — the REAL host over the shim, the three counters wrapped on the instance, the re-read census and the
    // AUTHORED envelope beside them.
    // NON-VACUITY: (i) is the invariant's own arm and needs a paint that LANDED (the root object changed + the channel answered an
    // apply), so `0/0/0` is a reading of a real update; (ii)/(iii) drive FIVE mutants through a REAL `createPaneEvents()` channel
    // and each must be CAUGHT on this same harness shape. The channel IS the host's own declaration on the `(i)` arm (the host is
    // handed the channel at construction and subscribes at boot); the mutants run on a SECOND seed with NO `events` option so the
    // mutant is the ONLY handler standing for that id — named here because a mutant that leaves the host's real handler live
    // would be measuring the real paint (the `⟨B3-F4⟩` lesson from `B-3`).
    // m5 — THIS UNIT'S OWN MUTANT, AND THE REASON `L1` DOES NOT REST ON THE THREE COUNTERS: a handler that applies the update by
    // RE-ASSEMBLY (`host.reDerive('content')` -> `applyContentChange`) prints `0/0/0` on all three counters, calls
    // `rag.backlinks` ZERO times, and leaves the pane's authored list STALE while the store's enumeration moved. That triple is
    // what a counters-only row cannot see, and it is measured — `applyContentChange` never re-reads `lastBacklinks` (`F-3`).
    // MEASURED CAVEAT, RECORDED RATHER THAN WEAKENED: §6's m5 sentence says the re-assembly applies "ONE root" ("at most ONE"), and
    // that CARDINALITY is NOT a stable reading of this seam — measured, a driven `reDerive('content')` on the pristine seed applies
    // TWO roots (`rag-head-a` + `page-edit-surface`: the document root and the stage surface), and the same call after an earlier
    // re-assembly applies NONE, because the reconciled roots are already fresh. The row therefore grades the applied list's
    // CONTENT — the pane's own root is NEVER in it — which is the discriminating claim §6's sentence is reaching for, and prints the
    // whole census verbatim so the reader sees the measured cardinality instead of an inherited number.
    // MUTATION THAT WOULD RED IT: any pane update that reaches `refresh()`/`loadAppGraph`/`mountOperator` reds (i) — which is
    // exactly what m1–m3 prove this harness SEES; a paint that applies no root while the enumeration moved reds m4's positive half;
    // a re-assembly that re-read the pane's data or repainted its root reds m5 (i.e. m5 would no longer be caught, and the
    // "counters cannot see a re-assembly" claim would be false); a harness whose counters cannot move reds the mutants themselves.
    const problems: string[] = []
    const mutants: string[] = []

    // ---- (i) THE DIRECT ARM: the host's OWN subscription paints, and the zeroes are read off a LANDED paint ----
    const live = await seeded({ documents: true, events: true })
    try {
      problems.push(...live.bootProblems)
      const drive = live
      const before = drive.roots()
      const beforePane = rootById(before, `pane-${CROSSLINKS}`)
      if (beforePane === undefined) {
        problems.push(`limb L5(i): the seed carries no live \`pane-${CROSSLINKS}\` frame (roots: [${rootIds(before).join(', ')}]) — INV-E needs a pane that CAN paint`)
      }
      drive.setEnumeration(afterEnumeration(HEAD_NODE_ID))
      drive.resetCounters()
      const report = drive.channel.fire(CROSSLINKS)
      await settle()
      if (report.fired !== true) {
        problems.push(
          `limb L5(i): \`fire('${CROSSLINKS}')\` answered ${shown(report)} — §4's boot loop subscribes the census's ids, so the ` +
            `host's OWN handler is the arm that must run (a mutant-driven zero would be a reading of the test's silence)`,
        )
      }
      const fired = drive.counters()
      if (fired.backlinks !== 1) {
        problems.push(
          `limb L5(i): the channel fire read backlinks=${fired.backlinks} [${drive.backlinkArgs().join(', ')}] — §4's subscription body is ` +
            `the pane's data re-read THEN \`updatePane\` (\`paintReplumbedPane\`), so ONE fire re-reads ONCE`,
        )
      }
      const afterPane = rootById(drive.roots(), `pane-${CROSSLINKS}`)
      if (beforePane !== undefined && afterPane === beforePane) {
        problems.push('limb L5(i): the channel fire left the pane root the SAME OBJECT — the zeros prove nothing on a paint that did not land')
      }
      const applies = drive.applyAnswers()
      if (applies.length !== 1 || fingerprint(applies[0]) !== fingerprint([`pane-${CROSSLINKS}`])) {
        problems.push(`limb L5(i): the managed channel answered ${shown(applies)}, not exactly one call applying \`['pane-${CROSSLINKS}']\``)
      }
      if (fired.refresh !== 0 || fired.loadAppGraph !== 0 || fired.mountOperator !== 0) {
        problems.push(
          `limb L5(i): the channel-driven pane update read ${countersReading(fired)} — \`INV-E\` pins \`0 loadAppGraph\`, ` +
            `\`0 mountOperator\`, \`0 refresh()\` on a pane update (§1/§4: the counters are the PANE UPDATE's own)`,
        )
      }
      if (fired.snapshot !== 0 || fired.docHeads !== 0 || fired.security !== 0) {
        problems.push(
          `limb L5(i): the pane update reached the re-read census (snapshot=${fired.snapshot} docHeads=${fired.docHeads} ` +
            `security=${fired.security}) — §4's re-read is ONE \`rag.backlinks\` call and nothing else`,
        )
      }
    } finally {
      live.restore()
    }

    // ---- (ii)/(iii) THE FIVE MUTANTS, on a NO-`events` seed so each mutant is the ONLY handler for the id ----
    const sandbox = await seeded({ documents: true, events: false })
    try {
      problems.push(...sandbox.bootProblems)
      const drive = sandbox
      if (drive.hostSubscribed) {
        problems.push(
          'limb L5(ii): the mutant seed handed the host an `events` channel — the host\'s real paint would then run beside every ' +
            'mutant and each reading would be the REAL path, not the mutant\'s',
        )
      }
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
        const release = channel.subscribe(CROSSLINKS, mutant.handler)
        let fireThrew = ''
        try {
          channel.fire(CROSSLINKS)
        } catch (error) {
          fireThrew = String(error)
        }
        await settle()
        const reading = mutant.reading()
        mutants.push(`${mutant.label}: ${reading}`)
        if (fireThrew !== '') {
          problems.push(`limb L5(iii) (${mutant.label}): the fire THREW (${fireThrew}) — \`fire\` never throws, mutant or not`)
        }
        if (!mutant.caught()) {
          problems.push(
            `limb L5(iii) (${mutant.label}): the mutant was NOT caught — ${mutant.why}. Reading: ${reading}. A harness that cannot ` +
              `SEE this mutant cannot prove the invariant it falsifies, so this arm is the row's own falsifier`,
          )
        }
        // ONE MUTANT AT A TIME (the `⟨B3-F4⟩` repair the `B-3` row made in its own body): a surviving registration keeps firing on
        // every later mutant's dispatch and re-assembles the double's root set, which would make m4's "the roots are the same
        // objects" arm grade the PREVIOUS mutant's side effects instead of m4's silence. The withdrawal is idempotent.
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
        why: 'a re-assembly (`loadAppGraph(runtime, lastTraversalEnvelope)`) must register on the loadAppGraph counter AND on the envelope load',
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
        why: "an operator re-mount must register on the mountOperator counter AND on the operator probe pane's own render",
        handler: () => {
          ;(drive.host as unknown as Record<string, () => void>)['mountOperator']()
        },
        reading: () => countersReading(drive.counters()),
        caught: () => drive.counters().mountOperator >= 1 && drive.counters().operatorRenders >= 1,
      })

      // m4 — a NO-OP handler: the enumeration moved, the handler painted nothing. The reading includes the REAL paint seam driven
      // over the SAME stale cache, which is what makes `painted:false` a computed value and not an authored word.
      drive.setEnumeration(afterEnumeration(HEAD_NODE_ID))
      const beforeM4 = drive.roots()
      const paneBeforeM4 = rootById(beforeM4, `pane-${CROSSLINKS}`)
      const enumerationMovedM4 = paneBeforeM4 === undefined || !paneAuthoredText(paneBeforeM4).includes(NEW_LINE)
      if (!enumerationMovedM4) {
        problems.push(
          `limb L5(iii) (m4): the enumeration did NOT move relative to the pane's authored list (\`${NEW_LINE}\` is already there) — ` +
            `m4 would be measured on a store that did not change, which is the vacuous pass \`B3-ADV-01\` forbids`,
        )
      }
      await runMutant({
        label: 'm4 a no-op handler',
        why: 'a handler that paints nothing must leave `painted:false` and `applied === []` while the store enumeration DID move',
        handler: () => undefined,
        reading: () => {
          const idle = drive.counters()
          const seam = drive.host.updatePane(CROSSLINKS)
          return (
            `painted=${shown(seam.painted)} applied=${shown(seam.applied)} applies=${idle.applies} backlinks=${idle.backlinks} ` +
            `enumerationMoved=${enumerationMovedM4} rootsSameIdentity=${rootIds(beforeM4).every((id) => rootById(drive.roots(), id) === rootById(beforeM4, id))}`
          )
        },
        caught: () => {
          const seam = (drive.host as unknown as { updatePane(id: string): Record<string, unknown> }).updatePane(CROSSLINKS)
          return (
            drive.counters().applies === 0 &&
            drive.counters().backlinks === 0 &&
            seam?.['painted'] === false &&
            fingerprint(seam?.['applied']) === fingerprint([]) &&
            rootIds(beforeM4).every((id) => rootById(drive.roots(), id) === rootById(beforeM4, id))
          )
        },
      })

      // m5 — THIS UNIT'S OWN: the update applied by RE-ASSEMBLY instead of the paint.
      drive.setEnumeration(afterEnumeration(HEAD_NODE_ID))
      const beforeM5 = drive.roots()
      const paneBeforeM5 = rootById(beforeM5, `pane-${CROSSLINKS}`)
      if (paneBeforeM5 === undefined || paneAuthoredText(paneBeforeM5).includes(NEW_LINE)) {
        problems.push(
          `limb L5(iii) (m5): the pane's authored list is not the STALE one before the mutant runs (roots: ` +
            `[${rootIds(beforeM5).join(', ')}]) — "still does not contain the new edge" would be vacuous`,
        )
      }
      await runMutant({
        label: 'm5 re-assembly instead of the paint',
        why:
          'a handler that applies the update by `reDerive(\'content\')` must read 0/0/0 on the three counters, ZERO `rag.backlinks` ' +
          'calls, an applied list that NEVER names the pane root, and a pane whose authored list still lacks the new edge — the ' +
          'triple a counters-only row cannot see',
        handler: () => {
          void drive.host.reDerive('content')
        },
        reading: () => {
          const assembly = drive.counters()
          const answers = drive.applyAnswers()
          const pane = rootById(drive.roots(), `pane-${CROSSLINKS}`)
          return (
            `refresh=${assembly.refresh} loadAppGraph=${assembly.loadAppGraph} mountOperator=${assembly.mountOperator} ` +
            `backlinks=${assembly.backlinks} applies=${assembly.applies} applied=${shown(answers)} ` +
            `paneRootApplied=${shown(answers.some((ids) => ids.includes(`pane-${CROSSLINKS}`)))} ` +
            `paneHasNewEdge=${shown(pane !== undefined && paneAuthoredText(pane).includes(NEW_LINE))}`
          )
        },
        caught: () => {
          const assembly = drive.counters()
          const answers = drive.applyAnswers()
          const pane = rootById(drive.roots(), `pane-${CROSSLINKS}`)
          return (
            assembly.refresh === 0 &&
            assembly.loadAppGraph === 0 &&
            assembly.mountOperator === 0 &&
            assembly.backlinks === 0 &&
            answers.every((ids) => !ids.includes(`pane-${CROSSLINKS}`)) &&
            pane !== undefined &&
            !paneAuthoredText(pane).includes(NEW_LINE)
          )
        },
      })

      // m5's NON-VACUITY FLOOR, printed beside its reading: the enumeration the pane must be stale against is NON-EMPTY and the pane's
      // authored back-section is still the empty state, so "still does not contain the new edge" is a comparison of two DIFFERENT
      // values and not of two absences. The positive half — that a FIRED update does re-read and author the line — is `L1`'s, on this
      // same seed shape (`L1` asserts the authored line appears; its absence here is the mutant's signature).
      const stalePane = rootById(drive.roots(), `pane-${CROSSLINKS}`)
      const enumerationLines = ((): string[] => {
        const enumerationNow = drive.enumeration()
        const entries = Array.isArray(enumerationNow['crosslinkBacklinks']) ? (enumerationNow['crosslinkBacklinks'] as unknown[]) : []
        return entries.map((entry) => `${String((entry as Record<string, unknown>)['source'])} → ${String((entry as Record<string, unknown>)['target'])}`)
      })()
      mutants.push(
        `m5 floor: enumerationLines=${shown(enumerationLines)} paneAuthoredHasNewEdge=` +
          `${shown(stalePane !== undefined && paneAuthoredText(stalePane).includes(NEW_LINE))}`,
      )
      if (enumerationLines.length === 0) {
        problems.push('limb L5(iii) (m5): the store enumeration the mutant is measured against is EMPTY — "the pane is still stale" would compare two absences')
      }
    } finally {
      sandbox.restore()
    }

    expect(
      problems,
      `limb L5 — INV-E and its FIVE mutants (§6 L5; §1's "the row must be able to FAIL"). ${problems.length} problem(s). The ` +
        `channel-driven pane update must read \`0 refresh()\` / \`0 loadAppGraph\` / \`0 mountOperator\` AND \`0 snapshot\` / ` +
        `\`0 docHeads\` / \`0 security\` on a paint that LANDED; each of the five mutants must be CAUGHT on this harness and each ` +
        `prints its computed reading: ${mutants.length > 0 ? mutants.join(' · ') : '(no mutant could be driven)'}. ` +
        `envelope-class — the REAL SidebarPanes over the layout-less DOM shim, the counters wrapped on the instance plus a ` +
        `bypass-proof observable each; no rendered box, no computed style, no pointer (G8-only, §8)`,
    ).toEqual([])
  })

  it('L6 — the SETTLED state is fresh: after the fire\'s re-read AND a driven `reDerive(\'content\')` have both settled, the pane authors the new backlink line and its final verdict is `painted`', async () => {
    // §6 `L6` (§4's ordering: commit `pendingContentChange` → FIRE → `requestRebuild('content')`; "any `applyContentChange` that
    // assembles AFTER the commit authors the pane from FRESH state, so the pane ends fresh whichever of the two applies last").
    // LAYER: envelope-class — the authored ENVELOPE after both promises settled; no rendered list, no box, no style, no pointer.
    // NON-VACUITY: the row asserts (a) the line was ABSENT before the fire (a reading of the stale state `F-3` names), (b) the
    // fire's own verdict is `painted`, and (c) the authored line survives the re-assembly that follows — three readings, so
    // "fresh" cannot be inherited from the boot frame.
    // THE `reDerive` CAVEAT, NAMED (as the row requires): `reDerive('content')` needs the snapshot/doc-heads/security/template
    // bridge AND a runtime that absorbs `applyContentReconcile`/`applyCommand`; all four are on this harness, so the settled half
    // IS driven here. If it ever cannot be driven, this row records the refusal in its message and grades the half it can — the
    // `it` is never skipped.
    // MUTATION THAT WOULD RED IT: a fire that does not commit `lastBacklinks` before the re-derive assembles reds the authored
    // line (the re-assembly then authors `(none)`); a fire whose paint is refused reds the final verdict; an ordering that lets a
    // stale assemble win the pane's root reds the post-re-derive authored line.
    const problems: string[] = []
    const notes: string[] = []
    const drive = await seeded({ documents: true, events: true })
    try {
      problems.push(...drive.bootProblems)
      // ⟨`B-6` — THE SIBLING PANE IS ISOLATED, NOT EXCUSED.⟩ `B-6` added a SECOND data-backed pane (`doc-nav`) to this SAME
      // broadcast, so this row's verdict limbs measure the `crosslinks` arm ALONE. The sibling is disabled through the registry — its
      // OWN declared gate (`not-enabled`, which `paintReplumbedPane` and `updatePane` both honour) — while its frame stays
      // materialized. Its lawful one-re-read-and-one-answer cost is measured by `B-6`'s own rows.
      drive.registry.disable(DOC_NAV)
      const before = drive.roots()
      const paneBefore = rootById(before, `pane-${CROSSLINKS}`)
      if (paneBefore === undefined) {
        problems.push(`limb L6: the seed carries no live \`pane-${CROSSLINKS}\` frame (roots: [${rootIds(before).join(', ')}]) — the settled state has no subject`)
      } else if (paneAuthoredText(paneBefore).includes(NEW_LINE)) {
        problems.push(`limb L6: the pane ALREADY authors \`${NEW_LINE}\` before the fire — "settled fresh" would be inherited, not earned`)
      }

      // ---- THE FIRE'S RE-READ ------------------------------------------------------
      drive.setEnumeration(afterEnumeration(HEAD_NODE_ID))
      drive.resetCounters()
      const fire = await deliverFire(drive, edgeWritePayload(['e-new']), 'L6·fire')
      problems.push(...fire.problems)
      // ⟨`B-6`⟩ The verdict census is read over THIS ROW'S pane: the disabled sibling still ANSWERS its declared word
      // (`not-enabled`, `painted:false`, `applied: []`), and "the settled state's final verdict is `painted`" is a claim about the
      // `crosslinks` arm, not about the census.
      const fireVerdicts = drive.verdicts().filter((verdict) => verdict['paneId'] === CROSSLINKS)
      if (fireVerdicts.length === 0) {
        problems.push('limb L6: the fire produced no paint verdict — the settled state has nothing to have settled FROM')
      } else {
        const last = fireVerdicts[fireVerdicts.length - 1]
        if (last['painted'] !== true || last['reason'] !== 'painted') {
          problems.push(
            `limb L6: the fire's verdict reads ${shown(last)}, not the declared \`painted\` word — the re-read committed the fresh ` +
              `enumeration, so the paint must LAND (§4)`,
          )
        }
      }
      if (drive.counters().backlinks !== 1) {
        problems.push(`limb L6: the fire's re-read count reads ${drive.counters().backlinks}, not 1 — §4's ONE call`)
      }

      // ---- AND THE DRIVEN RE-DERIVE, BOTH SETTLED ----------------------------------------------------
      drive.setEnumeration(afterEnumeration(HEAD_NODE_ID))
      let reDeriveThrew = ''
      try {
        await drive.host.reDerive('content')
      } catch (error) {
        reDeriveThrew = String(error)
      }
      await settle()
      if (reDeriveThrew !== '') {
        notes.push(
          `\`host.reDerive('content')\` could not be driven on this double (${reDeriveThrew}) — the settled half graded here is the ` +
            `fire's own, never skipped`,
        )
      }
      const paneAfter = rootById(drive.roots(), `pane-${CROSSLINKS}`)
      if (paneAfter === undefined) {
        problems.push('limb L6: the pane frame VANISHED across the settled pair — the authored line has no subject')
      } else if (!paneAuthoredText(paneAfter).includes(NEW_LINE)) {
        problems.push(
          `limb L6: after the fire's re-read AND the driven re-derive both settled, the pane does NOT author \`${NEW_LINE}\` ` +
            `(authored text: ${shown(paneAuthoredText(paneAfter))}) — §4: the commit precedes the re-derive's assemble, so an ` +
            `\`applyContentChange\` that assembles AFTER the commit authors the pane from FRESH state`,
        )
      }
      const settledVerdicts = drive.verdicts().filter((verdict) => verdict['paneId'] === CROSSLINKS)
      if (settledVerdicts.length > 0) {
        const final = settledVerdicts[settledVerdicts.length - 1]
        if (final['painted'] !== true) {
          problems.push(
            `limb L6: the pane's FINAL verdict reads ${shown(final)}, not \`painted:true\` — the settled state is a painted pane, and a ` +
              `later refusal would be the reverted-pane window §6 names and proves unreachable`,
          )
        }
      } else if (fireVerdicts.length === 0) {
        // already reported above; the settled verdict list is empty because nothing painted at all
      }
      const countersAfter = drive.counters()
      if (countersAfter.refresh !== 0 || countersAfter.loadAppGraph !== 0 || countersAfter.mountOperator !== 0) {
        problems.push(
          `limb L6: the settled pair read ${countersReading(countersAfter)} — the fire's update and the re-derive are not the same ` +
            `event: \`INV-E\` holds for the pane's update, and the re-derive is the app's separate (additive, \`ASM-B5-2\`) response`,
        )
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb L6 — the settled state is fresh (§6 L6; §4's ordering). ${problems.length} problem(s). After the fire's re-read AND a ` +
        `driven \`reDerive('content')\` have both settled, the pane's authored envelope must contain the new backlink line ` +
        `\`${NEW_LINE}\` and the pane's final verdict must be \`painted\`. ${notes.length > 0 ? `NOTES: ${notes.join(' · ')}. ` : ''}` +
        `envelope-class — the authored envelope only; no rendered box, no computed style, no pointer (G8-only, §8)`,
    ).toEqual([])
  })
})

// ===========================================================================
// ⟨`B5-F5` — THE SUBJECT HAS NO INVALIDATION RULE: the rows `L1`…`L6` do NOT reach it, and these three grade its fix. APPENDED
// (RCA-1: the red set is RUN and REPORTED before any byte of the fix). They are ADDITIVE — no existing row above was touched, and
// the `B5-F5` finding is the SOURCE of every assertion here: `docs/L2/shell-chrome/pane-links.md` §6 ("the subject MOVES between two
// fires (a document switch) → no re-read, and the pane authors the previous subject's list under the new one ✔"; "the subject moves
// DURING a re-read's await → the late answer for the OLD subject is committed and painted … NOT pinned by the contract ✔") and §9
// `B5-F5` ("THE SUBJECT HAS NO INVALIDATION RULE … the host HAS the idiom it did not use: `pageSubjectStamp`/`superseded()` in the
// page-commit seam drops every post-await resolution when the subject moved"). §5 invariant 4 says the same from the contract side:
// "What the invariant does NOT carry: a re-read when the subject MOVES".
//
// THE THREE ROWS, AND WHAT EACH GRADES:
//   `L7` — a REAL subject movement (a document switch / a node selection) re-reads the pane ONCE for the NEW subject and paints
//          the NEW subject's line, and a call that does NOT move the subject fires NOTHING (the anti-amplification control: a fix
//          that fires on every setter call would re-read on every no-op and reds limb 2/4).
//   `L8` — an answer that lands AFTER the subject moved is DROPPED: never committed to `lastBacklinks`, never painted, no
//          `applyContentReconcile` attributed to it — floored by the SAME deferred answered with NO move, which MUST commit and
//          paint (so the row cannot be satisfied by dropping every promise).
//   `L9` — the fire's CONTAINMENT, which no row above grades: the three fail-closed store guards in `onRagStoreChanged`
//          (`lastStore === null`, a malformed `store`, a FOREIGN `store`) dispatch 0 fires, 0 re-reads and 0 rebuild requests —
//          floored by a same-store payload with a non-empty `edgeIds` firing exactly once and re-reading exactly once. The guards
//          already hold at this head; this row PINS them, because the fix adds a SECOND fire site and a careless refactor of the
//          handler (hoisting the fire above the guards, or firing in a helper the guards call) would silently paint a foreign
//          store's broadcast.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): every row here is ENVELOPE-class, exactly as `L1`…`L6` — the REAL `SidebarPanes` over the
// LAYOUT-LESS DOM shim against the recording runtime double, and the observables are call counts, the IDENTITY of authored roots,
// the host's own committed state and the AUTHORED envelope text. It can NEVER read: that the frame was re-minted in a real window,
// the pane as the user sees it, its box/scroll/style, any pointer, or the NUMBER of IPCs on the wire (`G8`-only, `docs/L1` §8).
//
// WHAT THIS BLOCK DELIBERATELY DOES NOT DO: no `vi.mock`, no network, no electron, no spawn, no `git`; it writes nothing. The only
// host state it induces is `_currentDocumentId`/`_currentNodeId` THROUGH THE PUBLIC SETTERS (the very seams `L7` grades) — every
// other seed shape (`L7`/`L8`'s second document, `L9`'s uncaptured store) is constructed through the PUBLIC `boot` via the
// harness's additive `snapshot` option, so no arm pokes a private to reach its subject.

/** `L7`/`L8` — the SECOND document a real subject move switches TO, and the `doc-head` source §3's subject resolves for it. */
const DOCUMENT_B = 'doc-b'
const HEAD_B = 'head-b'
const SECTION_B = 'sec-b'
/** `L7` — the node-selection move (`setCurrentNodeId`), which OVERRIDES the document's doc-head (`ASM-B5-1`'s first arm). */
const NODE_X = 'node-x'

/** The line each subject's enumeration authors (`crosslinksContent`: `${source} → ${target}`). */
const lineOf = (source: string, target: string): string => `${source} → ${target}`
const LINE_A = lineOf(NEW_SOURCE, HEAD_NODE_ID)
const LINE_B = lineOf('src-b', HEAD_B)
const LINE_X = lineOf('src-x', NODE_X)
/** The SUPERSEDED subject's line (it lands after the subject moved, and must never be committed or painted). */
const LINE_STALE = lineOf('src-stale', HEAD_NODE_ID)
/** The floor under `L8`: the SAME deferred answered with NO move MUST commit and paint exactly this line. */
const LINE_LATE = lineOf('src-late', HEAD_NODE_ID)

/** A TWO-document snapshot: `documentSnapshot()` plus `doc-b`'s own `doc-head` edge (`head-b → doc-b`) and a section body, so
 *  `setCurrentDocumentId('doc-b')` is a REAL move of §3's subject (`head-a` → `head-b`). Nothing else about the seed changes. */
function twoDocumentSnapshot(): Record<string, unknown> {
  const base = documentSnapshot()
  return {
    ...base,
    nodes: [
      ...(base['nodes'] as unknown[]),
      snapshotNode(HEAD_B, { type: 'h1', content: 'Doc B' }),
      snapshotNode(SECTION_B),
      snapshotNode('src-b'),
    ],
    edges: [
      ...(base['edges'] as unknown[]),
      snapshotEdge('dh2', 'doc-head', HEAD_B, DOCUMENT_B, { documentIds: [DOCUMENT_B] }),
      snapshotEdge('ns2', 'next-section', HEAD_B, SECTION_B, { documentIds: [DOCUMENT_B] }),
    ],
  }
}

/** ONE subject's enumeration, with a DISTINCT authored line — so "the pane names the NEW subject's line and never the OLD one" is
 *  a comparison of two different strings, never of two absences. */
function linksEnumeration(nodeId: string, source: string, target: string): Record<string, unknown> {
  const entry = {
    kind: 'crosslink',
    source,
    target,
    scope: 'cross-document',
    edge: { id: `e-${source}-${target}`, kind: 'crosslink', source, target, createdAt: NOW, updatedAt: NOW },
  }
  return { nodeId, backlinks: [entry], outlinks: [], crosslinkBacklinks: [entry], crosslinkOutlinks: [] }
}

/** ⟨`L9`⟩ The pane's authored text as the LIVE frame holds it, or `'(no frame)'` — the reading `L7`/`L8` take after a subject move. */
const livePaneText = (drive: HostDrive): string => {
  const frame = rootById(drive.roots(), `pane-${CROSSLINKS}`)
  return frame === undefined ? '(no frame)' : paneAuthoredText(frame)
}

describe('pane-links — B5-F5: the subject\'s MOVEMENT re-reads the pane (and only on a real move), a SUPERSEDED answer is dropped, and the fail-closed store guards fire nothing', () => {
  it('L7 — a REAL subject move re-reads the pane ONCE for the new subject and paints ITS line (`setCurrentDocumentId` → `head-b`, `setCurrentNodeId` → `node-x`), while the SAME id fires nothing, so the row cannot pass by firing unconditionally', async () => {
    // §6 `L7` (the `B5-F5(a)` defect: "a document switch … re-reads NOTHING — `0 refresh()`, `0 rag.backlinks` — so the pane keeps
    // authoring the PREVIOUS document's backlink line"; `docs/L2` §2's measured boundary and §9 `B5-F5`). The SUBJECT is
    // `linksPaneSubjectNodeId()` (§3/`ASM-B5-1`: `_currentNodeId` when SET, ELSE the current document's DOC-HEAD node).
    // LAYER: envelope-class — the REAL host over the shim; the observables are the re-read census, the host's committed
    // `lastBacklinks`, the authored envelope's text and node identity.
    // NON-VACUITY: (i) the doc-a line is REALLY standing before the switch (a fire on the doc-a subject authors it), so "never
    // doc-a's line afterwards" compares two different lines; (ii) each positive limb is floored by the SAME-id control on the SAME
    // harness — which reads `backlinks === 0`, `verdicts === 0` and `applies === 0`, so the control is a reading of DISPATCH, not
    // merely of an idempotent paint (a re-read of an unchanged enumeration would paint `unchanged` and leave the root identical
    // anyway, which is why the identity arm is the SECONDARY floor and the dispatch count the discriminating one).
    // MUTATION THAT WOULD RED IT: a host that re-reads nothing on a move (the landed behaviour) reds limb 1's census + the
    // committed state + the authored line; a host that fires on EVERY setter call (amplification) reds limb 2/4's `backlinks === 0`
    // and `verdicts === 0`; a host that re-reads the OLD subject (the document id, the stale `_currentNodeId`, `null`) reds the
    // ARGUMENT arm of limb 1/3; a host that commits but never paints reds the authored-line arm; a node move that forgets
    // `_currentNodeId`'s precedence (`ASM-B5-1`'s first arm) reds limb 3's argument arm.
    const problems: string[] = []
    const drive = await seeded({ documents: true, events: true, snapshot: twoDocumentSnapshot })
    try {
      problems.push(...drive.bootProblems)
      const hostPrivates = drive.host as unknown as Record<string, unknown>

      // ---- THE SEED'S PRE-CONDITIONS (the two documents, and the doc-a subject §3 resolves for it) -------------------
      if (hostPrivates['_currentDocumentId'] !== DOCUMENT_ID) {
        problems.push(
          `limb L7: \`_currentDocumentId\` reads ${shown(hostPrivates['_currentDocumentId'])}, not \`'${DOCUMENT_ID}'\` — the boot ` +
            `document is the pre-move subject's document, and a switch has nothing to move FROM without it`,
        )
      }
      if (hostPrivates['_currentNodeId'] !== null) {
        problems.push(
          `limb L7: \`_currentNodeId\` reads ${shown(hostPrivates['_currentNodeId'])}, not \`null\` — §3's subject only falls through ` +
            `to the document's doc-head when no node is selected (\`ASM-B5-1\`'s first arm), and limbs 1/2 grade exactly that`,
        )
      }
      if (rootById(drive.roots(), `pane-${CROSSLINKS}`) === undefined) {
        problems.push(
          `limb L7: the seed carries no live \`pane-${CROSSLINKS}\` frame (roots: [${rootIds(drive.roots()).join(', ')}]) — the move ` +
            `has no pane to repaint`,
        )
      }
      const twoDocs = (hostPrivates['lastSnapshot'] as { edges?: unknown[] } | undefined)?.edges
      const docHeadTargets = Array.isArray(twoDocs)
        ? twoDocs
            .map((edge) => edge as { kind?: unknown; target?: unknown })
            .filter((edge) => edge?.kind === 'doc-head')
            .map((edge) => String(edge.target))
        : []
      if (!docHeadTargets.includes(DOCUMENT_B)) {
        problems.push(
          `limb L7: the seed's cached snapshot carries no \`doc-head\` edge for \`${DOCUMENT_B}\` (targets read: ` +
            `[${docHeadTargets.join(', ')}]) — §3 resolves the subject off that edge, so the move would have no subject to move TO`,
        )
      }

      // ---- THE DOC-A LINE STANDS BEFORE THE MOVE (so "never doc-a's line" is a comparison of two lines) ---------------
      drive.setEnumeration(linksEnumeration(HEAD_NODE_ID, NEW_SOURCE, HEAD_NODE_ID))
      drive.resetCounters()
      const seedFire = await deliverFire(drive, edgeWritePayload(['e-new']), 'L7·seed')
      problems.push(...seedFire.problems)
      if (!livePaneText(drive).includes(LINE_A)) {
        problems.push(
          `limb L7: after a fire on the DOC-A subject the pane does not author \`${LINE_A}\` (authored: ` +
            `${shown(livePaneText(drive))}) — the pre-move line is this row's floor: without it, "the pane never names doc-a's ` +
            `line after the switch" would be a comparison of two absences`,
        )
      }

      // ---- LIMB 1: A DOCUMENT SWITCH IS A REAL MOVE — EXACTLY ONE RE-READ OF DOC-B'S DOC-HEAD ------------------------
      drive.setEnumeration(linksEnumeration(HEAD_B, 'src-b', HEAD_B))
      const docBEnumeration = drive.lastEnumeration()
      drive.resetCounters()
      let switchThrew = ''
      try {
        drive.host.setCurrentDocumentId(DOCUMENT_B)
      } catch (error) {
        switchThrew = String(error)
      }
      await settle()
      if (switchThrew !== '') {
        problems.push(`limb L7: \`setCurrentDocumentId('${DOCUMENT_B}')\` THREW (${switchThrew}) — the setter is a public seam and never a throw site`)
      }
      if (hostPrivates['_currentDocumentId'] !== DOCUMENT_B) {
        problems.push(
          `limb L7: \`_currentDocumentId\` reads ${shown(hostPrivates['_currentDocumentId'])} after \`setCurrentDocumentId('${DOCUMENT_B}')\` ` +
            `— the state did not move, so no limb below is a reading of a MOVE`,
        )
      }
      const switchArgs = drive.backlinkArgs()
      if (switchArgs.length !== 1) {
        problems.push(
          `limb L7: the document switch made ${switchArgs.length} \`bridge.rag.backlinks\` call(s) [${switchArgs.join(', ')}], not ` +
            `EXACTLY ONE — \`B5-F5(a)\`: the pane's data is re-read ONLY on a fire, so a switch that moves §3's subject re-reads ` +
            `NOTHING and the pane keeps authoring the PREVIOUS document's line under the new one. Counters beside it: ` +
            `${countersReading(drive.counters())}`,
        )
      } else if (switchArgs[0] !== HEAD_B) {
        problems.push(
          `limb L7: the switch re-read ${shown(switchArgs[0])}, not \`'${HEAD_B}'\` — §3 resolves the CURRENT DOCUMENT's doc-head ` +
            `node (\`kind === 'doc-head' && target === _currentDocumentId\` → \`source\`), never the document id and never a cached ` +
            `subject of the previous document (counters: ${countersReading(drive.counters())})`,
        )
      }
      const committedAfterSwitch = hostPrivates['lastBacklinks']
      if (fingerprint(committedAfterSwitch) !== fingerprint(docBEnumeration)) {
        problems.push(
          `limb L7: \`lastBacklinks\` reads ${shown(committedAfterSwitch)}, not doc-b's enumeration (${shown(docBEnumeration)}) — the ` +
            `move's re-read must COMMIT for the new subject, or the paint right after it authors the old one`,
        )
      }
      const switchText = livePaneText(drive)
      if (!switchText.includes(LINE_B)) {
        problems.push(
          `limb L7: the pane does not author doc-b's line \`${LINE_B}\` after the switch (authored: ${shown(switchText)}) — the ` +
            `subject's movement must PAINT the enumeration of the subject it moved TO`,
        )
      }
      if (switchText.includes(LINE_A)) {
        problems.push(
          `limb L7: the pane still authors doc-a's line \`${LINE_A}\` under document \`${DOCUMENT_B}\` (authored: ${shown(switchText)}) ` +
            `— that is exactly the measured \`B5-F5(a)\` defect: the superseded subject's list authored under the new document`,
        )
      }

      // ---- LIMB 1b: THE RESULTING `reDerive('content')` DOES NOT REVERT THE PANE TO DOC-A ---------------------------
      let reDeriveThrew = ''
      try {
        await drive.host.reDerive('content')
      } catch (error) {
        reDeriveThrew = String(error)
      }
      await settle()
      if (reDeriveThrew !== '') {
        problems.push(`limb L7: the switch's own \`reDerive('content')\` THREW (${reDeriveThrew}) — the moved state has no settled reading`)
      }
      const settledText = livePaneText(drive)
      if (!settledText.includes(LINE_B) || settledText.includes(LINE_A)) {
        problems.push(
          `limb L7: after the switch AND its \`reDerive('content')\`, the pane authors ${shown(settledText)} — it must name ` +
            `doc-b's line \`${LINE_B}\` and NEVER doc-a's \`${LINE_A}\`: the re-derive assembles the pane from HOST state, so a ` +
            `superseded \`lastBacklinks\` is exactly what re-authors the old line (the defect's settled measurement)`,
        )
      }

      // ---- LIMB 2: THE DISCRIMINATING CONTROL — THE SAME ID IS NOT A MOVE -------------------------------------------
      const controlBefore = rootById(drive.roots(), `pane-${CROSSLINKS}`)
      drive.resetCounters()
      let sameIdThrew = ''
      try {
        drive.host.setCurrentDocumentId(DOCUMENT_B)
      } catch (error) {
        sameIdThrew = String(error)
      }
      await settle()
      if (sameIdThrew !== '') {
        problems.push(`limb L7(control): re-setting the SAME document id THREW (${sameIdThrew})`)
      }
      const controlCounters = drive.counters()
      if (controlCounters.backlinks !== 0) {
        problems.push(
          `limb L7(control): \`setCurrentDocumentId('${DOCUMENT_B}')\` with the document ALREADY current made ` +
            `${controlCounters.backlinks} \`rag.backlinks\` call(s) [${drive.backlinkArgs().join(', ')}] — §4's subject does not ` +
            `MOVE, so nothing re-reads. This is the arm that stops a fix from passing limb 1 by AMPLIFYING every setter call`,
        )
      }
      if (drive.verdicts().length !== 0) {
        problems.push(`limb L7(control): the same-id call produced ${drive.verdicts().length} pane verdict(s) ${shown(drive.verdicts())} — no move, no paint`)
      }
      if (controlCounters.applies !== 0) {
        problems.push(`limb L7(control): the same-id call reached \`applyContentReconcile\` ${controlCounters.applies} time(s) — no move, no root`)
      }
      if (controlBefore !== undefined && rootById(drive.roots(), `pane-${CROSSLINKS}`) !== controlBefore) {
        problems.push(
          `limb L7(control): the pane's root object CHANGED on a same-id call — the SECONDARY floor (a paint of an unchanged ` +
            `enumeration answers \`unchanged\` and applies nothing); the discriminating reading is the dispatch count above`,
        )
      }

      // ---- LIMB 3: A NODE SELECTION IS A REAL MOVE TOO — ONE RE-READ OF `node-x` ------------------------------------
      drive.setEnumeration(linksEnumeration(NODE_X, 'src-x', NODE_X))
      const nodeXEnumeration = drive.lastEnumeration()
      drive.resetCounters()
      let nodeThrew = ''
      try {
        drive.host.setCurrentNodeId(NODE_X)
      } catch (error) {
        nodeThrew = String(error)
      }
      await settle()
      if (nodeThrew !== '') {
        problems.push(`limb L7: \`setCurrentNodeId('${NODE_X}')\` THREW (${nodeThrew}) — the setter is a public seam and never a throw site`)
      }
      if (hostPrivates['_currentNodeId'] !== NODE_X) {
        problems.push(`limb L7: \`_currentNodeId\` reads ${shown(hostPrivates['_currentNodeId'])} after \`setCurrentNodeId('${NODE_X}')\` — the state did not move`)
      }
      const nodeArgs = drive.backlinkArgs()
      if (nodeArgs.length !== 1) {
        problems.push(
          `limb L7: the node selection made ${nodeArgs.length} \`bridge.rag.backlinks\` call(s) [${nodeArgs.join(', ')}], not EXACTLY ` +
            `ONE — a node selection moves §3's subject exactly as a document switch does, and the landed \`setCurrentNodeId\` (\`F-2\`'s ` +
            `dead setter: no caller, no re-read) reaches the pane NOWHERE`,
        )
      } else if (nodeArgs[0] !== NODE_X) {
        problems.push(
          `limb L7: the node selection re-read ${shown(nodeArgs[0])}, not \`'${NODE_X}'\` — \`ASM-B5-1\`'s FIRST arm is ` +
            `\`_currentNodeId\` when it is SET (the doc-head fallback is the ELSE), so the selected node is the pane's subject`,
        )
      }
      if (fingerprint(hostPrivates['lastBacklinks']) !== fingerprint(nodeXEnumeration)) {
        problems.push(
          `limb L7: \`lastBacklinks\` reads ${shown(hostPrivates['lastBacklinks'])}, not node-x's enumeration ` +
            `(${shown(nodeXEnumeration)}) — the move's re-read must commit for the NEW subject`,
        )
      }
      const nodeText = livePaneText(drive)
      if (!nodeText.includes(LINE_X)) {
        problems.push(
          `limb L7: the pane does not author \`${LINE_X}\` after the node selection (authored: ${shown(nodeText)}) — the subject's ` +
            `movement must PAINT the subject it moved TO`,
        )
      }

      // ---- LIMB 4: THE SAME CONTROL, FOR THE NODE SETTER ------------------------------------------------------------
      drive.resetCounters()
      const nodeControlBefore = rootById(drive.roots(), `pane-${CROSSLINKS}`)
      let nodeSameThrew = ''
      try {
        drive.host.setCurrentNodeId(NODE_X)
      } catch (error) {
        nodeSameThrew = String(error)
      }
      await settle()
      if (nodeSameThrew !== '') {
        problems.push(`limb L7(control): re-selecting the SAME node id THREW (${nodeSameThrew})`)
      }
      const nodeControl = drive.counters()
      if (nodeControl.backlinks !== 0 || drive.verdicts().length !== 0 || nodeControl.applies !== 0) {
        problems.push(
          `limb L7(control): \`setCurrentNodeId('${NODE_X}')\` with the node ALREADY selected read backlinks=${nodeControl.backlinks} ` +
            `verdicts=${drive.verdicts().length} applies=${nodeControl.applies} — no move, no re-read, no paint (the same ` +
            `anti-amplification control as limb 2, on the other setter)`,
        )
      }
      if (nodeControlBefore !== undefined && rootById(drive.roots(), `pane-${CROSSLINKS}`) !== nodeControlBefore) {
        problems.push(`limb L7(control): the pane's root object changed on a same-node call — no move, no repaint`)
      }
    } finally {
      drive.restore()
    }

    expect(
      problems,
      `limb L7 — the SUBJECT'S MOVEMENT re-reads the pane, and ONLY on a real move (§6 L7 / §9 \`B5-F5(a)\`; §3's subject ` +
        `\`ASM-B5-1\`; §5 invariant 4's named gap). ${problems.length} problem(s). \`setCurrentDocumentId('${DOCUMENT_B}')\` must make ` +
        `EXACTLY ONE \`bridge.rag.backlinks('${HEAD_B}')\` call, commit \`lastBacklinks\` for that node and make the pane author ` +
        `\`${LINE_B}\` and never \`${LINE_A}\`; \`setCurrentNodeId('${NODE_X}')\` must re-read for \`${NODE_X}\`; and the SAME id ` +
        `called again on either setter must dispatch NOTHING (0 \`backlinks\`, 0 verdicts, 0 applies, the root the same object), so ` +
        `the row cannot be satisfied by firing unconditionally. envelope-class — the REAL SidebarPanes over the layout-less DOM ` +
        `shim with a recording runtime double; no rendered box, no computed style, no pointer, no IPC count (G8-only, §8)`,
    ).toEqual([])
  })

  it('L8 — a SUPERSEDED answer is DROPPED, never committed or painted: an answer that lands after the subject moved moves neither `lastBacklinks` nor a root, while the SAME deferred answered with NO move DOES commit and paint', async () => {
    // §6 `L8` (`docs/L2` §6: "the subject moves DURING a re-read's await → the late answer for the OLD subject is committed and
    // painted (`painted:true`, `applied:['pane-crosslinks']`, committed `nodeId` = the old head while the subject reads the new
    // one) — NOT pinned by the contract"; §9 `B5-F5(b)`: "an answer for a SUPERSEDED subject is committed and painted when the
    // subject moves during the await — and the host HAS the idiom it did not use"). The fix's letter: the re-read carries a SUBJECT
    // STAMP, captured BEFORE the await (`linksPaneSubjectNodeId()`) and compared AFTER it — the `pageSubjectStamp`/`superseded()`
    // idiom of the page-commit seam. The source clause `S2` pins that spelling; this row pins its BEHAVIOUR.
    // LAYER: envelope-class — a hand-controlled `bridge.rag.backlinks` promise, the host's committed state, the
    // `applyContentReconcile` census and the authored envelope text.
    // NON-VACUITY: the superseded shot is answered with a THIRD, distinct line (neither the standing doc-a line nor doc-b's), so
    // "not committed and not painted" is a comparison of different values; and the SAME deferred answered WITHOUT a move must
    // commit and paint on the same harness shape — so the row is NOT satisfied by a host that drops EVERY answer.
    // MUTATION THAT WOULD RED IT: the landed behaviour (no stamp) reds three limbs — the move issues no re-read at all, the stale
    // answer OVERWRITES `lastBacklinks`, and the stale answer PAINTS its root; a fix that stamps but compares the WRONG thing (the
    // document id only, so a node move is invisible) reds the same limbs; a fix that drops every post-await answer reds the
    // CONTROL (the same deferred must commit and paint when the subject did not move); a fix that drops the answer but still paints
    // reds the "no apply and no painting verdict after the stale answer" arms.
    const problems: string[] = []

    // ---- SHOT A: THE SUBJECT MOVES WHILE THE OLD ANSWER IS IN FLIGHT ---------------------------------------------
    const drive = await seeded({ documents: true, events: true, snapshot: twoDocumentSnapshot })
    try {
      problems.push(...drive.bootProblems)
      const hostPrivates = drive.host as unknown as Record<string, unknown>

      // THE STANDING LINE (doc-a's), so the stale answer is a THIRD value and not the one already committed.
      drive.setEnumeration(linksEnumeration(HEAD_NODE_ID, NEW_SOURCE, HEAD_NODE_ID))
      drive.resetCounters()
      const seedFire = await deliverFire(drive, edgeWritePayload(['e-new']), 'L8·seed')
      problems.push(...seedFire.problems)
      if (!livePaneText(drive).includes(LINE_A)) {
        problems.push(`limb L8: the doc-a line \`${LINE_A}\` is not standing before the stale shot (authored: ${shown(livePaneText(drive))}) — the floor under "the stale line was not painted" is absent`)
      }

      // THE DEFERRED THE ROW RESOLVES BY HAND: the OLD subject's answer is held; every OTHER subject's answer is the live one.
      let resolveStale: (value: Record<string, unknown>) => void = () => undefined
      const staleAnswer = new Promise<Record<string, unknown>>((resolve) => {
        resolveStale = resolve
      })
      const staleEnumeration = linksEnumeration(HEAD_NODE_ID, 'src-stale', HEAD_NODE_ID)
      const docBEnumeration = linksEnumeration(HEAD_B, 'src-b', HEAD_B)
      drive.setBacklinkAnswer((nodeId) => (nodeId === HEAD_NODE_ID ? staleAnswer : Promise.resolve(docBEnumeration)))
      drive.resetCounters()
      const gatedFire = await deliverFire(drive, edgeWritePayload(['e-new-2']), 'L8·deferred')
      problems.push(...gatedFire.problems)
      if (drive.counters().backlinks !== 1 || drive.backlinkArgs()[0] !== HEAD_NODE_ID) {
        problems.push(
          `limb L8: the gated fire made ${drive.counters().backlinks} \`rag.backlinks\` call(s) [${drive.backlinkArgs().join(', ')}], ` +
            `not the ONE for the OLD subject \`'${HEAD_NODE_ID}'\` this shot must hold in flight — the race the row grades is a ` +
            `re-read ISSUED for the old subject and ANSWERED after the subject moved`,
        )
      }

      // ---- THE SUBJECT MOVES, AND ITS OWN RE-READ PAINTS THE NEW SUBJECT'S LINE --------------------------------
      let moveThrew = ''
      try {
        drive.host.setCurrentDocumentId(DOCUMENT_B)
      } catch (error) {
        moveThrew = String(error)
      }
      await settle()
      if (moveThrew !== '') {
        problems.push(`limb L8: the subject move THREW (${moveThrew}) — the move is ` + '`L7`\'s seam and never a throw site')
      }
      const moveArgs = drive.backlinkArgs()
      if (!moveArgs.includes(HEAD_B)) {
        problems.push(
          `limb L8: the subject move re-read [${moveArgs.join(', ')}] — it never asked for the NEW subject \`'${HEAD_B}'\`, so the ` +
            `shot has no fresh answer to compare the stale one against (the landed host re-reads nothing on a move: the ` +
            `\`B5-F5(a)\` half of this finding)`,
        )
      }
      const committedAfterMove = hostPrivates['lastBacklinks']
      if (fingerprint(committedAfterMove) !== fingerprint(docBEnumeration)) {
        problems.push(
          `limb L8: \`lastBacklinks\` reads ${shown(committedAfterMove)} after the move, not the NEW subject's enumeration ` +
            `(${shown(docBEnumeration)}) — the move's own re-read must commit, or the stale answer below is indistinguishable from a ` +
            `correct one`,
        )
      }
      const moveText = livePaneText(drive)
      if (!moveText.includes(LINE_B)) {
        problems.push(
          `limb L8: the subject move's own re-read did not PAINT the new subject's line \`${LINE_B}\` (authored: ` +
            `${shown(moveText)}) — the row's second half: the move succeeds on its own, so the stale answer below has a fresh ` +
            `correct value to fail against`,
        )
      }

      // ---- NOW THE SUPERSEDED ANSWER LANDS --------------------------------------------------------------------
      const appliesMark = drive.applyAnswers().length
      const verdictMark = drive.verdicts().length
      resolveStale(staleEnumeration)
      await settle()
      const committedAfterStale = hostPrivates['lastBacklinks']
      if (fingerprint(committedAfterStale) === fingerprint(staleEnumeration)) {
        problems.push(
          `limb L8: the SUPERSEDED answer was COMMITTED into \`lastBacklinks\` (${shown(committedAfterStale)} — the OLD subject ` +
            `\`${HEAD_NODE_ID}\`'s enumeration, line \`${LINE_STALE}\`) while the subject reads \`${DOCUMENT_B}\`: the re-read must ` +
            `carry a SUBJECT STAMP captured BEFORE the await and compared AFTER it (\`pageSubjectStamp\`/\`superseded()\`), and a ` +
            `mismatch DROPS the answer. This is \`B5-F5(b)\` measured`,
        )
      }
      if (fingerprint(committedAfterStale) !== fingerprint(docBEnumeration)) {
        problems.push(
          `limb L8: after the stale answer landed, \`lastBacklinks\` reads ${shown(committedAfterStale)}, not the NEW subject's ` +
            `enumeration (${shown(docBEnumeration)}) — a dropped answer leaves the live subject's data standing, never a third value`,
        )
      }
      const laterApplies = drive.applyAnswers().slice(appliesMark)
      if (laterApplies.length !== 0) {
        problems.push(
          `limb L8: the stale answer reached \`applyContentReconcile\` ${laterApplies.length} time(s) (${shown(laterApplies)}) — ` +
            `\`applied\` for \`pane-${CROSSLINKS}\` must be \`[]\` for that shot: a superseded enumeration has NO root to apply`,
        )
      }
      const laterVerdicts = drive.verdicts().slice(verdictMark)
      const paintedByStale = laterVerdicts.filter(
        (verdict) => verdict['painted'] === true || fingerprint(verdict['applied']) !== fingerprint([]),
      )
      if (paintedByStale.length > 0) {
        problems.push(
          `limb L8: the stale answer produced a PAINTING verdict ${shown(paintedByStale)} — a superseded subject's answer must be ` +
            `dropped before the paint (a surviving paint legitimately answers \`unchanged\`, i.e. \`painted:false\`, \`applied: []\`)`,
        )
      }
      const settledText = livePaneText(drive)
      if (settledText.includes(LINE_STALE)) {
        problems.push(
          `limb L8: the superseded subject's line \`${LINE_STALE}\` was PAINTED into the pane (authored: ${shown(settledText)}) — ` +
            `\`B5-F5(b)\`'s measured defect, one limb past the commit: the answer is committed AND painted`,
        )
      }
      if (!settledText.includes(LINE_B)) {
        problems.push(
          `limb L8: after the stale answer landed the pane no longer authors the NEW subject's line \`${LINE_B}\` (authored: ` +
            `${shown(settledText)}) — a dropped answer must leave the live subject's text untouched`,
        )
      }
    } finally {
      drive.restore()
    }

    // ---- SHOT B: THE CONTROL — THE SAME DEFERRED, WITH THE SUBJECT UNMOVED, MUST COMMIT AND PAINT -------------------
    const control = await seeded({ documents: true, events: true })
    try {
      problems.push(...control.bootProblems)
      const controlPrivates = control.host as unknown as Record<string, unknown>
      if (paneAuthoredText(rootById(control.roots(), `pane-${CROSSLINKS}`)).includes(LINE_LATE)) {
        problems.push(`limb L8(control): the pane already authors \`${LINE_LATE}\` before the deferred is answered — the control's "it committed" would be inherited`)
      }
      let resolveLate: (value: Record<string, unknown>) => void = () => undefined
      const lateAnswer = new Promise<Record<string, unknown>>((resolve) => {
        resolveLate = resolve
      })
      const lateEnumeration = linksEnumeration(HEAD_NODE_ID, 'src-late', HEAD_NODE_ID)
      control.setBacklinkAnswer(() => lateAnswer)
      control.resetCounters()
      const controlFire = await deliverFire(control, edgeWritePayload(['e-new']), 'L8·control')
      problems.push(...controlFire.problems)
      if (control.counters().backlinks !== 1) {
        problems.push(
          `limb L8(control): the controlled fire made ${control.counters().backlinks} \`rag.backlinks\` call(s), not 1 — the control ` +
            `has no answer to hold`,
        )
      }
      const appendedMark = control.applyAnswers().length
      resolveLate(lateEnumeration)
      await settle()
      if (fingerprint(controlPrivates['lastBacklinks']) !== fingerprint(lateEnumeration)) {
        problems.push(
          `limb L8(control): the SAME deferred answered with NO subject move was NOT committed (\`lastBacklinks\` reads ` +
            `${shown(controlPrivates['lastBacklinks'])}, not ${shown(lateEnumeration)}) — the subject's stamp did not change, so the ` +
            `answer is CURRENT: a row that dropped this one too would pass shot A by dropping EVERYTHING`,
        )
      }
      const controlApplies = control.applyAnswers().slice(appendedMark)
      if (!controlApplies.some((ids) => ids.includes(`pane-${CROSSLINKS}`))) {
        problems.push(
          `limb L8(control): the current answer painted NOTHING (applies since the answer: ${shown(controlApplies)}) — the deferred ` +
            `answered under an UNMOVED subject must commit AND paint, which is the positive half of this row`,
        )
      }
      if (!livePaneText(control).includes(LINE_LATE)) {
        problems.push(
          `limb L8(control): the pane does not author \`${LINE_LATE}\` after the current answer landed (authored: ` +
            `${shown(livePaneText(control))}) — "the answer commits and paints" must be visible in the AUTHORED pane, not only in ` +
            `the counter`,
        )
      }
    } finally {
      control.restore()
    }

    expect(
      problems,
      `limb L8 — a SUPERSEDED answer is dropped, never committed or painted (§6 L8 / §9 \`B5-F5(b)\`; the \`pageSubjectStamp\` idiom ` +
        `the host did not use). ${problems.length} problem(s). A \`bridge.rag.backlinks\` answer that lands AFTER the subject moved ` +
        `must leave \`lastBacklinks\` on the NEW subject, apply NO root for \`pane-${CROSSLINKS}\` (\`applied === []\` for that shot) ` +
        `and never author the superseded subject's line \`${LINE_STALE}\`; the SAME deferred answered with the subject UNMOVED must ` +
        `commit and paint \`${LINE_LATE}\` (the control that stops the row from passing by dropping every answer). envelope-class — ` +
        `the REAL host over the layout-less DOM shim; no rendered box, no style, no pointer (G8-only, §8)`,
    ).toEqual([])
  })

  it('L9 — the fail-closed store guards fire NOTHING: `lastStore === null`, a malformed `store` and a FOREIGN `store` each dispatch 0 fires, 0 re-reads and 0 rebuilds — floored by a same-store payload dispatching exactly `[crosslinks, doc-nav]` (the `B-6` extension of the fire census) with exactly ONE `rag.backlinks` re-read and exactly `[content]` rebuild', async () => {
    // §6 `L9` — THE COVERAGE GAP the adversarial pass named: "the fire sits BEHIND three fail-closed store guards in
    // `onRagStoreChanged` (`lastStore === null`, malformed `store`, FOREIGN `store`); no row grades that a foreign store's broadcast
    // fires nothing" (`docs/L2` §2's guard row / §6's second row, both `✔` measured; `docs/L1` §2's containment).
    // LAYER: envelope-class — the host's OWN fire dispatches (the channel is the object the host holds as `events`, so wrapping its
    // `fire` counts the HOST's calls), the bridge's re-read census, the recorded `requestRebuild` calls and the authored envelope.
    // NON-VACUITY: every negative arm is floored by (d) — the SAME harness, the SAME payload shape, the SAME counters, with only the
    // `store` matching — dispatching exactly the two fires named above and re-reading `rag.backlinks` exactly once; and the two guard
    // STATES are constructed through the PUBLIC `boot` (a snapshot whose `store` is `null`; a payload whose `store` is
    // missing/non-string/empty/foreign), never by reaching into the host.
    // MEASURED AT THIS HEAD, RECORDED RATHER THAN HIDDEN: all three guards ALREADY return before the fire (the fire is the LAST
    // statement pair in the handler), so this row is GREEN on the landed host and is a REGRESSION PIN, not a red limb. It is here
    // because the `B5-F5` fix adds a SECOND fire site and a handler refactor is exactly what could hoist the fire above the guards.
    // ⟨`B-6`⟩ AND ITS FLOOR COUNT MOVED WITH THE LANDING, NOT AROUND IT: (d)'s fire census is now TWO dispatches (`crosslinks` on
    // B-5's `edgeIds` predicate, then `doc-nav` on `B-6`'s UNCONDITIONAL local fire) — named, exact and order-sensitive — while the
    // re-read (`rag.backlinks` 1) and the rebuild (`['content']`) teeth are unchanged.
    // MUTATION THAT WOULD RED IT: moving the fire above any guard (or into a helper the guards run BEFORE returning) reds a
    // negative arm's `fires`/`backlinks`/`rebuilds` census while (d) stays green; dropping the `payload.store !== lastStore` guard
    // reds the FOREIGN arm and would paint a store this host is not rendering; dropping the malformed-store guard reds the
    // missing/non-string/empty arms; a host that stops firing on a same-store edge payload reds (d) — the floor every negative
    // arm stands on.
    const problems: string[] = []
    const warnings: string[] = []
    const realWarn = console.warn
    console.warn = (...args: unknown[]): void => {
      warnings.push(args.map((arg) => String(arg)).join(' '))
    }
    try {
      // ---- (a) THE UNCAPTURED HOST: `lastStore === null`, constructed through the PUBLIC boot ------------------------
      const storeless = await seeded({
        documents: true,
        events: true,
        snapshot: () => ({ ...documentSnapshot(), store: null }),
      })
      try {
        problems.push(...storeless.bootProblems)
        const storelessPrivates = storeless.host as unknown as Record<string, unknown>
        if (storelessPrivates['lastStore'] !== null) {
          problems.push(
            `limb L9(a): the seed's \`lastStore\` reads ${shown(storelessPrivates['lastStore'])}, not \`null\` — the uncaptured-host ` +
              `guard has no subject (it is induced through the PUBLIC boot: a snapshot whose \`store\` is \`null\`)`,
          )
        }
        storeless.resetCounters()
        const storelessOutcome = await deliverFire(storeless, edgeWritePayload(['e-new']), 'L9·a')
        problems.push(...storelessOutcome.problems)
        const storelessCounters = storeless.counters()
        const storelessFired = storeless.fires()
        if (storelessFired.length !== 0) {
          problems.push(
            `limb L9(a): a broadcast to an UNCAPTURED host dispatched ${storelessFired.length} fire(s) [${storelessFired.join(', ')}] — ` +
              `the \`lastStore === null\` guard is fail-closed and returns BEFORE the fire, so nothing is dispatched`,
          )
        }
        if (storelessCounters.backlinks !== 0) {
          problems.push(`limb L9(a): the uncaptured host re-read \`rag.backlinks\` ${storelessCounters.backlinks} time(s) [${storeless.backlinkArgs().join(', ')}] — a dropped broadcast re-reads NOTHING`)
        }
        if (storeless.rebuildRequests().length !== 0) {
          problems.push(`limb L9(a): the uncaptured host requested rebuild ${shown(storeless.rebuildRequests())} — the guard returns before \`requestRebuild\`, so a drop rebuilds NOTHING`)
        }
      } finally {
        storeless.restore()
      }

      // ---- (b)/(c)/(d) THE GUARDED HOST: malformed, foreign, and the POSITIVE control -------------------------------
      const guarded = await seeded({ documents: true, events: true })
      try {
        problems.push(...guarded.bootProblems)
        const guardedPrivates = guarded.host as unknown as Record<string, unknown>
        if (guardedPrivates['lastStore'] !== STORE) {
          problems.push(
            `limb L9(b–d): the captured boot store reads ${shown(guardedPrivates['lastStore'])}, not \`'${STORE}'\` — the malformed and ` +
              `FOREIGN arms compare against it, and (d)'s same-store payload has no store to match`,
          )
        }
        const fireMark = guarded.fires().length
        const rejecting: Array<[string, Record<string, unknown>]> = [
          ['a MISSING `store`', { kind: 'structural', nodeIds: [NEW_SOURCE, NEW_TARGET], edgeIds: ['e-new'] }],
          ['a NON-STRING `store`', { ...edgeWritePayload(['e-new']), store: 42 }],
          ['an EMPTY `store`', { ...edgeWritePayload(['e-new']), store: '' }],
          ['a FOREIGN `store`', { ...edgeWritePayload(['e-new']), store: 'not-the-rendered-store' }],
        ]
        for (const [label, payload] of rejecting) {
          guarded.resetCounters()
          const outcome = await deliverFire(guarded, payload, `L9·${label}`)
          problems.push(...outcome.problems)
          const counters = guarded.counters()
          const dispatched = guarded.fires().length - fireMark
          if (dispatched !== 0) {
            problems.push(
              `limb L9: a broadcast carrying ${label} dispatched ${dispatched} fire(s) [${guarded.fires().slice(fireMark).join(', ')}] — ` +
                `\`onRagStoreChanged\`'s THREE fail-closed guards return BEFORE the fire (\`lastStore === null\`, a non-string/empty ` +
                `\`payload.store\`, \`payload.store !== lastStore\`), so a store this host is not rendering paints NOTHING`,
            )
          }
          if (counters.backlinks !== 0) {
            problems.push(`limb L9: a broadcast carrying ${label} re-read \`rag.backlinks\` ${counters.backlinks} time(s) [${guarded.backlinkArgs().join(', ')}] — the pane's data is re-read on a fire that must not exist`)
          }
          if (guarded.rebuildRequests().length !== 0) {
            problems.push(
              `limb L9: a broadcast carrying ${label} requested rebuild ${shown(guarded.rebuildRequests())} — a guarded-out ` +
                `broadcast rebuilds NOTHING (\`INV-E\`'s app-level shadow: the drop is total)`,
            )
          }
          if (counters.applies !== 0) {
            problems.push(`limb L9: a broadcast carrying ${label} reached \`applyContentReconcile\` ${counters.applies} time(s) — a dropped broadcast touches no root`)
          }
        }

        // ---- (d) THE POSITIVE CONTROL ON THE SAME HARNESS --------------------------------------------------------
        guarded.setEnumeration(linksEnumeration(HEAD_NODE_ID, NEW_SOURCE, HEAD_NODE_ID))
        guarded.resetCounters()
        const positiveMark = guarded.fires().length
        const positive = await deliverFire(guarded, edgeWritePayload(['e-new']), 'L9·d')
        problems.push(...positive.problems)
        const positiveCounters = guarded.counters()
        const positiveDispatches = guarded.fires().slice(positiveMark)
        // ⟨`B-6`-CAUSED EXTENSION OF THE FIRE CENSUS — ONE MORE DISPATCH, NAMED, NEVER A RELAXATION.⟩ `B-6` added a second data-backed
        // pane to this SAME broadcast and its local fire is UNCONDITIONAL for a matched store (`ASM-B6-4`: the pane's row title is the
        // doc-head edge's source node's CONTENT, so `edgeIds` cannot decide it), so a same-store payload carrying a non-empty `edgeIds`
        // now dispatches TWO fires, in order: `crosslinks` (B-5's `edgeIds` predicate) and then `doc-nav` (B-6's unconditional fire,
        // which sits after it in `onRagStoreChanged`). The census is restated to the LANDED value and stays EXACT and order-sensitive;
        // every tooth of the floor is kept: `rag.backlinks` must still read exactly 1 and `requestRebuild` exactly `['content']`
        // below, so a host that fires NOTHING is still not a pass.
        if (fingerprint(positiveDispatches) !== fingerprint([CROSSLINKS, DOC_NAV])) {
          problems.push(
            `limb L9(d): a SAME-STORE payload carrying a non-empty \`edgeIds\` dispatched ${shown(positiveDispatches)}, not exactly ` +
              `\`${shown([CROSSLINKS, DOC_NAV])}\` — one fire per DATA-BACKED pane: \`${CROSSLINKS}\` on §2's declared predicate ` +
              `(\`Array.isArray(payload.edgeIds) && payload.edgeIds.length > 0\`) and \`${DOC_NAV}\` on \`B-6\`'s UNCONDITIONAL local ` +
              `fire, in that order. This is the control every negative arm above stands on: a host that fires NOTHING is not a pass`,
          )
        }
        if (positiveCounters.backlinks !== 1) {
          problems.push(
            `limb L9(d): the same-store payload re-read \`rag.backlinks\` ${positiveCounters.backlinks} time(s) [${guarded.backlinkArgs().join(', ')}], ` +
              `not exactly 1 (\`${HEAD_NODE_ID}\`) — the fire's ONE re-read is the reading the three drops are measured against`,
          )
        }
        const positiveRebuilds = guarded.rebuildRequests()
        if (fingerprint(positiveRebuilds) !== fingerprint(['content'])) {
          problems.push(
            `limb L9(d): the same-store payload requested rebuild ${shown(positiveRebuilds)}, not exactly \`['content']\` — ` +
              `\`ASM-B5-2\`: the fire is ADDITIVE and the rebuild STAYS, which is what makes the guards' \`0\` a reading of the DROP ` +
              `and not of a handler that never rebuilds`,
          )
        }
        if (positiveCounters.applies === 0 || !livePaneText(guarded).includes(LINE_A)) {
          problems.push(
            `limb L9(d): the same-store payload painted nothing (applies=${positiveCounters.applies}, authored: ` +
              `${shown(livePaneText(guarded))}) — the control must LAND on this harness, or its negative arms are silence`,
          )
        }
      } finally {
        guarded.restore()
      }
    } finally {
      console.warn = realWarn
    }

    expect(
      problems,
      `limb L9 — the fail-closed store guards fire NOTHING (the coverage gap \`B5-F5\` names; \`docs/L2\` §2's guard row). ` +
        `${problems.length} problem(s). A broadcast whose \`store\` is absent/non-string/empty, or a valid string that is NOT the ` +
        `captured \`lastStore\`, or any broadcast to a host whose \`lastStore\` is \`null\`, must dispatch \`0\` fires, make \`0\` ` +
        `\`rag.backlinks\` calls and request \`0\` rebuilds — floored by a same-store payload with a non-empty \`edgeIds\` dispatching ` +
        `exactly \`${shown([CROSSLINKS, DOC_NAV])}\` (one fire per data-backed pane: B-5's \`edgeIds\` predicate, then B-6's ` +
        `UNCONDITIONAL local fire — the \`B-6\` extension of this census, named), making exactly ONE re-read (\`${HEAD_NODE_ID}\`) ` +
        `and requesting exactly \`['content']\`. The host's pinned ` +
        `drops warned: ${shown(warnings.slice(0, 8))}. envelope-class — the REAL host over the layout-less DOM shim; no rendered ` +
        `box, no style, no pointer (G8-only, §8)`,
    ).toEqual([])
  })
})
