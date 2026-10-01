// tests/unit-stage-active-tab-display.test.ts — Unit `U-STAGE-ACTIVE-TAB` — the
// node/dom-shim red rows for the two TOTAL predicates of
// docs/specs/unit-stage-active-tab-display.md (§5.1 I1/I2, §5.2 the ownership
// model, §5.3.1–§5.3.6 the fix seam, §5.4 states 1–20, §5.5 FS-1…FS-9, §6 the
// §5.x property register, §8.2 the red-set plan).
//
// AUTHORITY: the spec text alone. `src/**` was read ONLY to learn symbol names /
// call signatures (`mountTab`, `mountTabs`, `reDerive`, `refresh`,
// `loadAppGraph`, `pageSurfaceInput/Blur`, `PAGE_EDIT_SURFACE_ID`,
// `DATA_EDIT_SURFACE`, `EDITOR_TOOLBAR_ID`, `EDITOR_TOOLBAR_*`); no expectation
// below is copied from current behavior — the violating paths are the ones this
// spec exists to change.
//
// ---------------------------------------------------------------------------
// LAYER (RCA-12, spec header): HOST/RENDERER + ENVELOPE. NOTHING here is
// APP-GREEN: the dom-shim is layout-less, so the PAINTED stage identity is
// structurally unassertable in node.
// ---------------------------------------------------------------------------
//
// STATE MACHINE COVERED (spec §5.4 numbered states → rows below):
//   1  doc A → doc B → back to A                     → S1 (DOM half green; identity half red)
//   2  doc tab → search tab (steady)                 → S2
//   3  open-in-tab from the search pane              → NOT node-reachable (needs the live strip
//                                                       commit chain; §8.3 live block 1/2)
//   4  close the ACTIVE tab                          → S3 (open-set seam)
//   5  search-result click → new doc tab             → NOT node-reachable (live block 2)
//   6  post-commit re-derive, DOCUMENT tab active    → S4 (P15 control)
//   7  close an INACTIVE doc tab                     → covered by tests/page-commit-tab-ownership.test.ts T5
//   8  V1 guard, happy path (own tab still active)   → S6
//   9  V1 guard, discarded path                      → S7 / P-IM-1
//   10 V2 happy path (search tab + content re-derive) → S8 / FS-2
//   11 V3 happy path (dirty keyed by tab)            → S9
//   12 V3 isolation                                  → cross-ref: NOT duplicated here (see below)
//   13 V3 caret (save → re-derive → restore)         → S12 / FS-6 / P-TP-2
//   14 V4 happy path (surface iff document tab)      → S10 / S11 / P-IM-2
//   15 V5 refresh() (document + non-document)        → S13 (doc half NON-FINDING, see its header)
//   16 V6 pin (reachability + single-active)         → S14
//   17 empty-store landing (U-LIVE4 control)         → S2b (landing kind)
//   18 parked kinds                                  → S2b (graph/template placeholder)
//   19 mountTab(null)                                → S15
//   20 the `pageSubjectDocument` legacy direction    → S16b (controller level) / adversarial file
//
// ⟨A.1 — AMENDED 2026-09-22⟩ THREE rows are amended by `docs/specs/unit-stage-active-tab-display.md`
// §A.1 and ONE red row is added, all in this file / the adversarial sibling:
//   • `S14/P-SM-1`'s census half — `surfaceIds(h).length === 2` is SUPERSEDED
//     (§A.1.1 `I2-R`: `2` encoded the un-destroyed STALE `#page-edit-surface`
//     root as correct behavior). The row now makes its doc-tab pre-state
//     EXPLICIT, counts the census by BOTH discriminators (the authored
//     `PAGE_EDIT_SURFACE_ID` id AND the `data-edit-surface` marker, which must
//     agree) and asserts the EXACT count + the active document identity — never
//     `2`, never `<= 1`.
//   • `R8` (NEW, §A.1.2 / §7.3 / §8.2 item 9) — the reconcile-destroy row: after
//     `mountTabs([A,B])` from a doc-A-active pre-state exactly ONE live surface
//     root remains, by both discriminators, asserted on the LIVE DOM and never on
//     `applyContentReconcile`'s `applied` bucket (the `replaced` path discards
//     the destroy's return); plus the negative arm (a root `next` still authors —
//     the toolbar, both bodies — is never destroyed, and a repeated identical
//     `next` is `kept`: the same root node stays live).
//   • the adversarial sibling's `A4/P-SM-1` (exact per-step census; the
//     `split('-')[0]` body reader is REPLACED by a document-keyed one, §A.1.3)
//     and `A3/P-IM-4` (the caret-hook CONSULTATION SET, §A.1.4).
// The `destroyRoot` widening the `R8`/`S14` census half needs is §A.1.2's ONE
// source change (`src/renderer/runtime.ts`), so those rows stay RED until it
// lands — by design, not by a weakened expectation.
//
// FAIL-STATES COVERED: FS-1 (S6/S7), FS-2 (S8/S11), FS-3 (S10/S11), FS-4 (S9 +
//   the total identity row), FS-8 (S13), FS-9 (S14). FS-5 (cross-tab isolation)
//   is NOT duplicated here — it is the subject of the already-green
//   `tests/page-commit-tab-ownership.test.ts` (rows T1–T7: dirty flag, failure
//   record, close-prune, re-derive survival). Where this unit and that unit MEET
//   (`§5.3.2` host key seam; `FS-5`) this file asserts only the STAGE/surface
//   side of the seam (§5.3.3, §5.3.5) and cross-references those rows.
//   FS-6 (S12 + the adversarial caret rows), FS-7 (adversarial scope row).
//
// REGISTER (§6) ROWS WRITTEN HERE (the node-assertable ones):
//   P-IM-1 (stage-mount dominance)  → P-IM-1 rows
//   P-IM-2 (surface census by active kind) → P-IM-2 rows (envelope layer)
//   P-IM-3 (ownership-subject totality) → P-IM-3 rows
//   P-IM-4 (pageSubjectDocument totality) → P-IM-4 rows
//   P-SM-1 (single-active preserved by every stage seam) → P-SM-1 rows
//   P-TP-2 (caret lifecycle totality) → P-TP-2 rows
//   `P-SM-2` (cross-tab isolation of PAGE state) → cross-ref'd to
//       page-commit-tab-ownership.test.ts, which already covers it (do not
//       duplicate; §8.2 item 8's "green controls" list). Its STAGE half (no
//       second document body/caret slot) is covered by P-SM-1 below.
//   **`P-TP-1` IS LIVE-ONLY (RCA-12) — NO node row is written for it, by
//   design.** The spec's own register marks it `live-only (assembled)` and says a
//   node run can never report it held; its discriminators are the live blocks of
//   §8.3 (real `rag.query` latency, real `IPC_RAG_STORE_CHANGED` ordering). The
//   node rows below pin the ORDERING and the KEY only. Reported as such.
//
// THE ROWS THE SPEC ITSELF CALLS GREEN CONTROLS (§8.2's closing paragraph) are
// written as green-on-purpose and are labelled `[GREEN CONTROL]` in their title:
// a listed green written as a failure is a review finding. ⟨A.1 recount
// (2026-09-22): 12 of the 29 rows are green at HEAD (the §5.4/§7.2 controls +
// the two non-vacuous `P-IM-2` pins + the two controller-level green controls);
// 17 are RED — several on BEHAVIOR, not merely on a missing §5.2 reader: `S7`,
// `P-IM-1`, `S8/FS-2`, `S11/FS-7`, `S10/FS-3`, `S12/FS-6`, both `P-TP-2` rows,
// `P-SM-1`, and the ⟨A.1⟩ rows `S14/P-SM-1`'s census half + `R8`.⟩
// TWO spec-side findings are recorded in-row, never forced red:
//   (1) the V5/FS-8 row is a MEASUREMENT (`S13`, non-finding — see its header);
//   (2) `P-TP-1` is live-only and has NO node row here (see the register note).
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import {
  assembleAppGraphEnvelope,
  PAGE_EDIT_SURFACE_ID,
  DATA_EDIT_SURFACE,
  EDITOR_TOOLBAR_ID,
} from '../src/renderer/pane-graph.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'
import type { OperatorSettings } from '../src/shared/types.js'
import type { TabEntry, TabTarget } from '../src/renderer/tab-state.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

beforeAll(() => {
  installShim()
})

// ---------------------------------------------------------------------------
// fixtures — two documents (so "foreign document body" is expressible) + one
// landing + the five §5.1 target kinds
// ---------------------------------------------------------------------------
const DOC_A = 'doc-a'
const DOC_B = 'doc-b'
const T = new Date().toISOString()

function makeNode(id: string, type: string, content: string): RagNode {
  return { id, type, content, ownedNodeIds: [], createdAt: T, updatedAt: T }
}
function makeEdge(id: string, source: string, target: string): RagEdge {
  return { id, kind: 'doc-head', source, target, createdAt: T, updatedAt: T, documentIds: [target] }
}

function docTarget(documentId: string): TabTarget {
  return { kind: 'document', documentId }
}
function tabEntry(id: string, target: TabTarget, title = id): TabEntry {
  return { id, target, title }
}
function docTab(id: string, documentId: string): TabEntry {
  return tabEntry(id, docTarget(documentId), `Doc ${documentId}`)
}
function searchTab(id: string, query: string): TabEntry {
  return { ...tabEntry(id, { kind: 'search', queryId: `q-${id}` }, `Search: ${query}`), search: { query, topK: 5 } }
}
function graphTab(id: string): TabEntry {
  return tabEntry(id, { kind: 'graph', view: 'knowledge' }, 'Graph')
}
function templateTab(id: string): TabEntry {
  return tabEntry(id, { kind: 'template', templateId: 'tpl-1' }, 'Template')
}
function landingTab(id: string): TabEntry {
  return tabEntry(id, { kind: 'other', id: 'landing' }, 'Landing')
}

// ---------------------------------------------------------------------------
// the harness — the `page-editor-host` / `page-commit-tab-ownership` /
// `unit-u-shell-9a` conventions: dom shim + the real `Runtime` + a real
// `SidebarPanes` + a bridge stub. The ONE addition is the controllable
// `rag.query` settlement (`deferred()`) that §5.3.1's V1 race needs.
// ---------------------------------------------------------------------------
interface Deferred<T> {
  promise: Promise<T>
  resolve: (v: T) => void
  reject: (e: unknown) => void
}
function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/** A `rag.query` result in the shape the search stage reads (§5.3.1: the query
 *  is still ISSUED for a superseded mount — consequence 4). */
function queryResult(query: string) {
  return { query, ranked: [], results: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }
}

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  mount: ReturnType<typeof mountEl>
  operatorMount: ReturnType<typeof mountEl>
  editController: EditController
  backRefs: Map<string, string[]>
  /** Resolve the next pending `rag.query` (the controlled V1 settlement). */
  settleQuery: (query?: string) => void
  /** Does a `rag.query` call exist waiting to settle? */
  pendingQuery: () => boolean
  queryCalls: () => number
  /** Drive the REAL stage-body path (`applyStageBody` → `loadAppGraph`) and
   *  capture the envelope it authored (the §5.3.3 sub-rule 2 seam). */
  applyStageBodyForTest: (body: unknown) => void
  capturedEnvelope: () => unknown
}

function makeHarness(opts: { controlledQuery?: boolean } = {}): Harness {
  const mount = mountEl()
  const operatorMount = mountEl()
  const registry = createPaneRegistry()
  const store = createSnapshotStore(
    [
      makeNode(`${DOC_A}-head`, 'h1', 'Doc A'),
      makeNode(`${DOC_A}-body`, 'p', 'body A'),
      makeNode(`${DOC_B}-head`, 'h1', 'Doc B'),
      makeNode(`${DOC_B}-body`, 'p', 'body B'),
    ],
    [
      makeEdge('ea-h', `${DOC_A}-head`, DOC_A),
      makeEdge('ea-n', `${DOC_A}-head`, `${DOC_A}-body`),
      makeEdge('ea-e', `${DOC_A}-body`, DOC_A),
      makeEdge('eb-h', `${DOC_B}-head`, DOC_B),
      makeEdge('eb-n', `${DOC_B}-head`, `${DOC_B}-body`),
      makeEdge('eb-e', `${DOC_B}-body`, DOC_B),
    ],
  )
  const pendings: Array<Deferred<unknown>> = []
  let queryCount = 0
  const controlled = opts.controlledQuery === true
  const query = (q: string) => {
    queryCount += 1
    if (!controlled) return Promise.resolve(queryResult(q))
    const d = deferred<unknown>()
    pendings.push(d)
    return d.promise
  }
  const bridge = {
    security: { get: async () => ({ token: null, enabled: ['read', 'dispatch', 'rag'] }) },
    edit: {
      onRagStoreChanged: () => () => {},
      commitRich: async () => ({ ok: true, nodeId: 'x' }),
      batch: async () => ({ ok: true, results: [] }),
    },
    rag: {
      query: vi.fn(query),
      snapshot: async () => ({ store: 'main', nodes: store.listNodes(), edges: store.listEdges() }),
      backlinks: async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }),
      docHeads: async () => ({
        documents: [
          { documentId: DOC_A, title: 'Doc A', path: [], tags: [] },
          { documentId: DOC_B, title: 'Doc B', path: [], tags: [] },
        ],
      }),
      stores: async () => ({ stores: [] }),
      manage: async () => ({ ok: true }),
    },
    template: {
      get: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      validate: async () => ({ ok: true }),
      set: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      create: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      delete: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      reset: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      onTemplateChanged: () => () => {},
    },
    operatorSettings: {
      get: async () => ({ enabledPanes: [], panesInitialized: true, defaultDocumentId: null, topK: 5, representationMode: 'html' }) as unknown as OperatorSettings,
      set: async (patch: Record<string, unknown>) => patch as unknown as OperatorSettings,
      onChanged: () => () => {},
    },
  }
  const backRefs = new Map<string, string[]>([
    // §5.2/§11.8: the page subject is the TAB id, so a tab id must carry a live
    // back-reference for the retained deleted-document guard (the
    // `page-editor-host` convention).
    ['t1', [`${DOC_A}-body`]],
    ['t2', [`${DOC_B}-body`]],
    ['s1', [`${DOC_A}-body`]],
  ])
  let host: SidebarPanes
  const editController = createEditController({
    backRefs,
    commit: async () => ({ ok: true, nodeId: 'x' }),
    onRebuild: (kind) => void host.reDerive(kind),
  })
  host = new SidebarPanes({ mount, operatorMount, registry, bridge: bridge as never, backRefs, editController })
  // The capture seam: the ASSEMBLED envelope `applyStageBody`/`refresh` author
  // (the `loadAppGraph` result, i.e. what `assembleAppGraphEnvelope` produced),
  // spied WITHOUT patching src (the `unit-u-shell-9b` / `stageHarness`
  // convention).
  let captured: unknown = null
  const loadAppGraph = host.loadAppGraph.bind(host)
  ;(host as unknown as { loadAppGraph: (r: unknown, e: unknown) => { envelope: unknown } }).loadAppGraph = (r: unknown, e: unknown) => {
    const result = loadAppGraph(r as never, e as never)
    captured = result.envelope
    return result
  }
  const runtime = new Runtime({
    mount: mount as never,
    envelope: { template: DEFAULT_CONTENT_WINDOW_TEMPLATE, content: [], clientConfig: { runInstantiation: true, runRendering: true } } as never,
  })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return {
    host,
    runtime,
    mount,
    operatorMount,
    editController,
    backRefs,
    settleQuery: (q = 'alpha') => {
      const d = pendings.shift()
      if (d) d.resolve(queryResult(q))
    },
    pendingQuery: () => pendings.length > 0,
    queryCalls: () => queryCount,
    applyStageBodyForTest: (body: unknown) => {
      ;(host as unknown as { applyStageBody: (b: unknown) => void }).applyStageBody(body)
    },
    capturedEnvelope: () => captured,
  }
}

async function boot(h: Harness): Promise<Harness> {
  await h.host.boot(h.runtime)
  return h
}

/** Settle the microtask queue (the search mount's `await bridge.rag.query`). */
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// ---- DOM readers on the shim (the `single-editable-surface` / 9b convention) --
type ShimLike = { innerHTML: string; querySelectorAll(sel: string): Array<{ getAttribute(k: string): string | null }> }
function stageEl(h: Harness): ShimLike {
  return h.mount as unknown as ShimLike
}
function stageHtml(h: Harness): string {
  return stageEl(h).innerHTML
}
/** The §5.1 I2 surface census over the STAGE region: `[data-edit-surface]`
 *  descendants of the mount (the shim's `querySelectorAll` is
 *  descendants-only, so the stage region is exactly the mount's subtree). */
function surfaceIds(h: Harness): Array<string | null> {
  return stageEl(h)
    .querySelectorAll(`[${DATA_EDIT_SURFACE}]`)
    .map((el) => el.getAttribute(DATA_EDIT_SURFACE))
}
function surfaceCensus(h: Harness): number {
  return surfaceIds(h).length
}
/** ⟨§A.1.1 I2-R — AMENDED 2026-09-22⟩ the page-edit surface census counted by
 *  BOTH discriminators: the AUTHORED id `PAGE_EDIT_SURFACE_ID` (the shim's
 *  selector subset has no `#`-id form, so the equivalent `[id='…']`
 *  attribute-equals compound stands in) AND the `DATA_EDIT_SURFACE` marker. A
 *  live root carrying one without the other is the SAME violation (a leak), so
 *  `agrees` requires the two readings to be identical: same count AND the same
 *  marker value on every root, in DOM order. */
function surfaceRootCensus(h: Harness): {
  authored: number
  marked: number
  markerIds: Array<string | null>
  agrees: boolean
} {
  const authoredRoots = stageEl(h).querySelectorAll(`[id='${PAGE_EDIT_SURFACE_ID}']`)
  const markedRoots = stageEl(h).querySelectorAll(`[${DATA_EDIT_SURFACE}]`)
  const markerIds = markedRoots.map((el) => el.getAttribute(DATA_EDIT_SURFACE))
  const authoredMarkerIds = authoredRoots.map((el) => el.getAttribute(DATA_EDIT_SURFACE))
  return {
    authored: authoredRoots.length,
    marked: markedRoots.length,
    markerIds,
    agrees:
      authoredRoots.length === markedRoots.length &&
      authoredMarkerIds.length === markerIds.length &&
      authoredMarkerIds.every((v, i) => v != null && v === markerIds[i]),
  }
}
/** The census line every §A.1.1 row prints on failure — so a two-discriminator
 *  disagreement can never be read as a bare count. */
function censusLine(h: Harness): string {
  const c = surfaceRootCensus(h)
  return `#${PAGE_EDIT_SURFACE_ID}=${c.authored} [${DATA_EDIT_SURFACE}]=${c.marked} values=[${c.markerIds.join(',')}] agrees=${c.agrees}`
}
/** The shim node ids (`data-node-id`) of the live surface roots, in DOM order —
 *  the per-root identity the §A.1.2 destroy contract is observed by (a
 *  destroyed root's node must be GONE, not merely out-counted). */
function surfaceNodeIds(h: Harness): string[] {
  return stageEl(h)
    .querySelectorAll(`[${DATA_EDIT_SURFACE}]`)
    .map((el) => String(el.getAttribute('data-node-id')))
}
/** ⟨§A.1.3 — AMENDED⟩ the stage's body-root census keyed BY DOCUMENT. The
 *  `String(r).split('-')[0]` idiom collapses `doc-a-head` and `doc-b-head` to
 *  one token and passes vacuously (A.1.3's recorded defect); this keys each
 *  `data-rag-node-id` root against the KNOWN document ids and reports an
 *  unattributable root as `?<root>` so it can never pass silently. */
function bodyDocIds(h: Harness): string[] {
  const roots = stageEl(h)
    .querySelectorAll('[data-rag-node-id]')
    .map((el) => String(el.getAttribute('data-rag-node-id')))
  const out: string[] = []
  for (const r of roots) {
    const key = [DOC_A, DOC_B].find((d) => r === d || r.startsWith(`${d}-`)) ?? `?${r}`
    if (!out.includes(key)) out.push(key)
  }
  return out
}
/** The doc-body root census in the stage (`data-rag-node-id` — §5.1's
 *  "document body root" marker, §5.3.3 sub-rule 1). */
function documentRootCensus(h: Harness): number {
  return stageEl(h).querySelectorAll('[data-rag-node-id]').length
}
/** §5.1's `stageTargetKind` derived from the RENDERED stage body. */
function stageTargetKind(h: Harness): 'document' | 'search' | 'landing' | 'placeholder' | 'unknown' {
  const html = stageHtml(h)
  if (surfaceCensus(h) > 0 || documentRootCensus(h) > 0) return 'document'
  if (html.includes('stage-search-tab') || html.includes('search-tab-input')) return 'search'
  if (html.includes('stage-landing')) return 'landing'
  if (html.includes('data-stage="placeholder"')) return 'placeholder'
  return 'unknown'
}
/** The assembled ENVELOPE census over the WHOLE `content` structure: each
 *  payload's own node list AND every node's nested `children` (the surface's
 *  children ARE the body roots, so a children-blind walk under-counts). */
function envelopeCensus(env: unknown, prop: string): string[] {
  const out: string[] = []
  const visitNodes = (nodes: unknown): void => {
    if (!Array.isArray(nodes)) return
    for (const nd of nodes) {
      if (nd == null || typeof nd !== 'object') continue
      const n = nd as { props?: Record<string, unknown>; children?: unknown }
      const v = n.props?.[prop]
      if (typeof v === 'string') out.push(v)
      visitNodes(n.children)
    }
  }
  const payloads = (env as { content?: unknown } | null)?.content
  if (Array.isArray(payloads)) for (const pl of payloads) visitNodes((pl as { content?: unknown })?.content)
  return out
}
/** §5.3.5 rule 1's surface census in the assembled envelope (`data-edit-surface`). */
function envelopeSurfaceIds(env: unknown): string[] {
  return envelopeCensus(env, DATA_EDIT_SURFACE)
}
/** §5.3.5 rule 1's document-body-root census in the assembled envelope. */
function envelopeDocumentRoots(env: unknown): string[] {
  return envelopeCensus(env, 'data-rag-node-id')
}

/** The stage body's authored envelope, read through the REAL stage path
 *  (`applyStageBody`'s own
 *  `loadAppGraph` call, §5.3.3 sub-rules 1–2): the assembled envelope's
 *  `data-edit-surface` values. A throw is reported as a pinned violation string
 *  so "it did not assemble" can never read as a vacuously-empty census. */
function stageEnvelopeSurfaceIds(h: Harness, bodyId: string): string[] {
  try {
    // The body carries a `data-rag-node-id` root with NO document scope of its
    // own, so the surface-authoring decision is decided ONLY by the
    // `documentId` the host hands the assembler (§5.3.3 sub-rule 2) — a body
    // without such a root can never distinguish the two behaviors.
    h.applyStageBodyForTest({
      type: 'div',
      props: { id: bodyId, 'data-rag-node-id': `${bodyId}-root` },
      placement: { targetPlacement: ['main'] },
      children: [{ type: 'p', content: 'results' }],
    })
    return envelopeSurfaceIds(h.capturedEnvelope())
  } catch (e) {
    return [`<stage body threw: ${e instanceof Error ? e.message : String(e)}>`]
  }
}

/** The stage body's authored envelope, read through the REAL stage path
 *  (`applyStageBody`'s own
 *  `loadAppGraph` call, §5.3.3 sub-rules 1–2): the assembled envelope's
 *  `data-edit-surface` values. A throw is reported as a pinned violation string
 *  addition). Read through declared-member lookup so the red row reports
 *  "method does not exist" rather than a private-field peek. */
function reader<T>(host: SidebarPanes, name: string): () => T {
  const fn = (host as unknown as Record<string, unknown>)[name]
  if (typeof fn !== 'function') {
    throw new TypeError(`SidebarPanes.${name}() does not exist (U-STAGE-ACTIVE-TAB §5.2 — RED)`)
  }
  return () => (fn as () => T).call(host)
}
/** §5.2's pinned readers, as a nullable accessor for rows whose subject is an
 *  in-row DOM control (so a missing reader cannot vacuously absorb the row). */
function tryReader<T>(host: SidebarPanes, name: string): T | undefined {
  const fn = (host as unknown as Record<string, unknown>)[name]
  if (typeof fn !== 'function') return undefined
  return (fn as () => T).call(host)
}

/** ⟨§A.3.2 RULING C2 (2026-09-22/23)⟩ `SidebarPanes.isDocumentLive(documentId)` — the SEPARATE
 *  document-liveness carrier that owns the caret's document check (`backRefs` keeps its documented
 *  `Map<ragNodeId, nodeId[]>` invariant, so no document id keys it). Declared-member lookup: an
 *  absent reader reports "does not exist" (`U-STAGE-ACTIVE-TAB §5.2 — RED`), never a private peek. */
function documentLive(host: SidebarPanes, documentId: string): boolean {
  const fn = (host as unknown as { isDocumentLive?: (id: string) => boolean }).isDocumentLive
  if (typeof fn !== 'function') {
    throw new TypeError('SidebarPanes.isDocumentLive() does not exist (⟨§A.3.2 C2⟩ U-STAGE-ACTIVE-TAB — RED)')
  }
  return fn.call(host, documentId)
}

/** §5.2's `getMountedDocumentIds()` — the mounted document set, or `undefined`
 *  when the reader is absent (so a missing reader cannot vacuously absorb a row). */
function mountedDocIds(host: SidebarPanes): readonly string[] | undefined {
  const m = (host as unknown as { getMountedDocumentIds?: () => readonly string[] }).getMountedDocumentIds
  return typeof m === 'function' ? m.call(host) : undefined
}

/** §5.3.2's `pageEditSurfaceHandlerSubject()` — the pinned subject seam (the
 *  spec pins it as the method the identity clause is stated over). */
function subjectOf(host: SidebarPanes): string {
  const m = (host as unknown as { pageEditSurfaceHandlerSubject?: () => string }).pageEditSurfaceHandlerSubject
  if (typeof m !== 'function') throw new TypeError('pageEditSurfaceHandlerSubject() missing (§5.3.2)')
  return m.call(host)
}
/** `window.provident.sidebar` — the page seam (§11.8 item 1). */
function sidebarApi(): Record<string, (...args: unknown[]) => unknown> {
  const w = (globalThis as unknown as { window?: { provident?: { sidebar?: unknown } } }).window
  const sidebar = w?.provident?.sidebar
  if (sidebar == null) throw new Error('window.provident.sidebar not installed (the page seam must be installed at boot)')
  return sidebar as Record<string, (...args: unknown[]) => unknown>
}
function pageInput(): void {
  const seam = sidebarApi().pageSurfaceInput
  expect(typeof seam, 'the page seam sidebar.pageSurfaceInput must be installed (§11.8 item 1)').toBe('function')
  ;(seam as () => void)()
}

// ===========================================================================
// S1 — §5.4 state 1 — doc A → doc B → back to A
// ===========================================================================
describe('§5.4 state 1 — doc A → doc B → back to A (the single-active control)', () => {
  it('S1 [GREEN CONTROL, DOM half] — the stage body is ALPHA, then BETA, then ALPHA; the surface follows the active document', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    expect(stageHtml(h), 'the doc-a body must be the stage (P1)').toContain('Doc A')
    expect(surfaceIds(h), 'exactly ONE surface, for the active document').toEqual([DOC_A])

    h.host.mountTab(docTab('t2', DOC_B))
    expect(stageHtml(h), 'the doc-b body replaces it (single-active)').toContain('Doc B')
    expect(stageHtml(h), 'the previous document body is gone').not.toContain('Doc A')
    expect(surfaceIds(h), 'the surface re-keys to the new active document').toEqual([DOC_B])

    h.host.mountTab(docTab('t1', DOC_A))
    expect(stageHtml(h), 'back to ALPHA').toContain('Doc A')
    expect(surfaceIds(h), 'back to doc-a').toEqual([DOC_A])
  })

  it('S1 [RED] — the active identity is t1, t2, t1 through the pinned §5.2 readers', async () => {
    const h = await boot(makeHarness())
    const activeTabId = reader<string | null>(h.host, 'getActiveTabId')
    const activeKind = reader<string | null>(h.host, 'getActiveTargetKind')
    const activeDoc = reader<string | null>(h.host, 'getActiveDocumentId')

    h.host.mountTab(docTab('t1', DOC_A))
    expect(activeTabId(), 'activeTabId is the mounted tab (§5.2/§5.4 state 1)').toBe('t1')
    h.host.mountTab(docTab('t2', DOC_B))
    expect(activeTabId(), 'the identity follows the strip').toBe('t2')
    h.host.mountTab(docTab('t1', DOC_A))
    expect(activeTabId(), 'and back').toBe('t1')
    expect(activeKind(), 'a document target').toBe('document')
    expect(activeDoc(), 'the ACTIVE document id — never a stale field (§5.2)').toBe(DOC_A)
  })
})

// ===========================================================================
// S2/S2b — §5.4 states 2, 17, 18 — the non-document kinds
// ===========================================================================
describe('§5.4 states 2/17/18 — a non-document active tab displays a non-document body', () => {
  it('S2 — doc tab → search tab (steady): the search body only, and activeDocumentId is null (RED today)', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    h.host.mountTab(searchTab('s1', 'alpha'))
    await flush()

    const html = stageHtml(h)
    expect(html, 'the search tab body is mounted (§5.4 state 2)').toContain('stage-search-tab')
    expect(html, 'and its query input').toContain('search-tab-input')
    expect(documentRootCensus(h), 'NO document body root in the stage (I2 non-document clause)').toBe(0)
    expect(surfaceCensus(h), 'ZERO surfaces in the stage (§5.3.5 rule 1)').toBe(0)
    expect(stageTargetKind(h), 'the rendered stage kind is `search` (I2)').toBe('search')

    // §5.2: `activeDocumentId` is null for a non-document active target. RED
    // today (`getActiveDocumentId` does not exist — §5.2's additive reader).
    expect(reader<string | null>(h.host, 'getActiveTargetKind')(), 'activeTargetKind === search').toBe('search')
    expect(reader<string | null>(h.host, 'getActiveDocumentId')(), 'activeDocumentId === null (§5.4 state 2)').toBeNull()
  })

  it('S2b [GREEN CONTROL] — the landing and the parked kinds render their own bodies with zero surfaces', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    expect(surfaceCensus(h), 'baseline: the document tab has its surface').toBe(1)

    h.host.mountTab(landingTab('l1'))
    expect(stageHtml(h), 'the landing body (§5.4 state 17)').toContain('stage-landing')
    expect(surfaceCensus(h), 'zero surfaces on the landing (I2 non-document clause)').toBe(0)

    h.host.mountTab(graphTab('g1'))
    expect(stageHtml(h), 'the parked graph placeholder (§5.4 state 18)').toContain('stage-placeholder-graph')
    expect(surfaceCensus(h), 'zero surfaces on a parked kind').toBe(0)
    expect(documentRootCensus(h), 'no document body root on a parked kind').toBe(0)

    h.host.mountTab(templateTab('tpl1'))
    expect(stageHtml(h), 'the parked template placeholder').toContain('stage-placeholder-template')
    expect(surfaceCensus(h), 'zero surfaces on a parked template').toBe(0)
  })
})

// ===========================================================================
// S3 — §5.4 state 4 — close the active tab (through the open-set seam)
// ===========================================================================
describe('§5.4 state 4 — the open set is the close seam; a close leaves exactly the remaining tab mounted', () => {
  it('S3 [GREEN CONTROL, DOM half] — after two document tabs are open and one is closed, only the survivor body is in the stage', async () => {
    const h = await boot(makeHarness())
    h.host.mountTabs([docTab('t1', DOC_A), docTab('t2', DOC_B)])
    const html = stageHtml(h)
    expect(html, 'the open set mounts both bodies (9b multi-mount seam)').toContain('Doc A')
    expect(html, 'and B').toContain('Doc B')

    h.host.mountTabs([docTab('t2', DOC_B)])
    h.host.mountTab(docTab('t2', DOC_B))
    expect(stageHtml(h), 'the closed tab body does not leak into the stage (§5.4 state 7/P10)').not.toContain('Doc A')
    expect(stageHtml(h), 'the survivor is displayed').toContain('Doc B')
  })
})

// ===========================================================================
// S4 — §5.4 state 6 — the document-tab content re-derive (P15 control)
// ===========================================================================
describe('§5.4 state 6 / P15 control — a content re-derive with a DOCUMENT tab active keeps that document', () => {
  it('S4 [GREEN CONTROL] — reDerive(\'content\') keeps the ACTIVE document body and ITS surface, and adds no other document', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t2', DOC_B))
    await h.host.reDerive('content')

    const html = stageHtml(h)
    expect(html, 'the active document survives the re-derive').toContain('Doc B')
    expect(html, 'the inactive document must NOT appear (P15: ALPHA=false BETA=true)').not.toContain('Doc A')
    expect(surfaceIds(h), "the surface is its OWN document's (§5.3.3 sub-rule 3)").toEqual([DOC_B])
    const roots = stageEl(h).querySelectorAll('[data-rag-node-id]').map((el) => el.getAttribute('data-rag-node-id'))
    expect(roots.length, 'the active document body IS materialized').toBeGreaterThan(0)
    expect(roots.every((id) => String(id).startsWith(DOC_B)), `no foreign document root may survive (${roots.join(',')})`).toBe(true)
  })
})

// ===========================================================================
// S5/S6/S7 + P-IM-1 + FS-1 — §5.3.1 the mount generation guard
// ===========================================================================
describe('§5.3.1 / FS-1 / P-IM-1 — the newest mount attempt is the only applier', () => {
  it('S6 [GREEN CONTROL] — the query is still ISSUED for a superseded mount (consequence 4: no cancellation here)', async () => {
    const h = await boot(makeHarness({ controlledQuery: true }))
    h.host.mountTab(searchTab('s1', 'alpha'))
    expect(h.pendingQuery(), 'the search mount starts its query before the identity can move').toBe(true)
    expect(h.queryCalls(), 'the query IS issued (§5.3.1 consequence 4)').toBe(1)
    h.settleQuery('alpha')
    await flush()
  })

  it('S6/P-IM-1 [RED] — a search mount that completes while ITS OWN tab is still active applies its body, and the drop counter stays 0', async () => {
    const h = await boot(makeHarness({ controlledQuery: true }))
    h.host.mountTab(searchTab('s1', 'alpha'))
    h.settleQuery('alpha')
    await flush()

    expect(stageHtml(h), 'its own completion applies (§5.3.1 pinned shape: seq + identity both still match)').toContain('stage-search-tab')
    // §5.3.1 consequence 2 — `getStageMountDropped()` is the checkable drop fact.
    // RED today: the pinned reader does not exist.
    const dropped = reader<number>(h.host, 'getStageMountDropped')
    expect(dropped(), 'an own-tab completion is NOT a discard').toBe(0)
  })

  it('S7/P-IM-1/FS-1 [RED] — a superseded search completion must NOT apply its body; the stage keeps the newer document and the drop counter is 1', async () => {
    const h = await boot(makeHarness({ controlledQuery: true }))
    // the V1 schedule (§8.2 item 1): search mount pending → mountTab(doc-b) → settle
    h.host.mountTab(searchTab('s1', 'alpha'))
    h.host.mountTab(docTab('t2', DOC_B))
    expect(stageHtml(h), 'the newer mount is displayed while the search body is pending').toContain('Doc B')

    h.settleQuery('alpha')
    await flush()

    const html = stageHtml(h)
    expect(html, 'FS-1: the STALE completion must not overwrite the newer tab (§5.3.1 pinned consequence 1)').not.toContain('stage-search-tab')
    expect(html, 'FS-1: and must not inject the search input either').not.toContain('search-tab-input')
    expect(html, 'the newer document tab is still displayed (BETA)').toContain('Doc B')
    expect(surfaceIds(h), 'and still owns the surface (§5.3.1 + §5.3.5)').toEqual([DOC_B])
    expect(stageTargetKind(h), 'I2 holds at the settle point for the active document tab').toBe('document')
    // §5.3.1 consequence 2 — one discard ⇒ exactly one counted drop.
    expect(reader<number>(h.host, 'getStageMountDropped')(), 'the stale settlement is a COUNTED drop, never an inferred absence').toBe(1)
  })

  it('P-IM-1 [RED] — an older mount never applies after a newer one, whichever order the promises settle in (the row\'s negative control)', async () => {
    const h = await boot(makeHarness({ controlledQuery: true }))
    // Attempt 1 (search) is superseded TWICE: by a graph mount and then a doc mount.
    h.host.mountTab(searchTab('s1', 'alpha'))
    h.host.mountTab(graphTab('g1'))
    h.host.mountTab(docTab('t2', DOC_B))

    // settle the OLD attempt last — the inverted build (unconditional
    // applyStageBody) is exactly what this row fails on.
    h.settleQuery('alpha')
    await flush()

    expect(stageTargetKind(h), 'the LAST mountTab attempt owns the stage (§6 P-IM-1)').toBe('document')
    expect(surfaceIds(h), 'the surface is the last attempt\'s document').toEqual([DOC_B])
    expect(reader<number>(h.host, 'getStageMountDropped')(), 'one superseded settlement ⇒ one drop').toBe(1)
  })
})

// ===========================================================================
// S8/S10/S11 + FS-2/FS-3/FS-7 + P-IM-2 — §5.3.3 the re-derive scope gate and
// §5.3.5 the document-tab-only surface
// ===========================================================================
describe('§5.3.3 / §5.3.5 / I2 non-document clause — no foreign document body and no foreign surface off a document tab', () => {
  it('S8/FS-2 [RED] — a content re-derive under an ACTIVE SEARCH tab must not re-materialize the foreign document body', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    h.host.mountTab(searchTab('s1', 'alpha'))
    await flush()
    expect(stageHtml(h), 'the search body is mounted before the re-derive').toContain('stage-search-tab')

    await h.host.reDerive('content')

    const html = stageHtml(h)
    expect(html, 'FS-2: the foreign document body must not appear on a non-document tab (§5.3.3 sub-rule 1)').not.toContain('Doc A')
    expect(documentRootCensus(h), 'FS-2: no `data-rag-node-id` document root under a search tab').toBe(0)
    expect(surfaceCensus(h), 'FS-3: the surface census over the stage region must be 0 (§5.3.5 rule 1)').toBe(0)
    expect(stageTargetKind(h), 'I2 non-document clause: the stage is still the search body').toBe('search')
  })

  it('S11/FS-7 [RED] — the re-derive\'s document scope comes from the ACTIVE target, never the retained selection field', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    // The retained doc-nav/selection field is deliberately left at DOC_A (the
    // §5.2 narrowing: it is no longer a scope source at any stage/re-derive seam).
    h.host.setCurrentDocumentId(DOC_A)
    h.host.mountTab(searchTab('s1', 'alpha'))
    await flush()

    // the seam whose scope `reDerive` selects (§5.3.3 pinned shape)
    await h.host.reDerive('content')
    expect(stageHtml(h), 'FS-7: a re-derive scoped by the stale `_currentDocumentId` is the violation').not.toContain('Doc A')

    // and the same rule read through §5.2's pinned readers
    expect(reader<string | null>(h.host, 'getActiveTargetKind')(), 'the active target is a search tab').toBe('search')
    expect(reader<string | null>(h.host, 'getActiveDocumentId')(), 'so the active document id is null, whatever the selection field says').toBeNull()
  })

  it('S10/FS-3 [RED] — the assembled app-graph envelope authors ZERO surfaces while the active target is not a document', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    h.host.mountTab(searchTab('s1', 'alpha'))
    await flush()

    // §5.3.3 sub-rule 2: `assembleAppGraphEnvelope` must be handed
    // `documentId: activeDocumentId ?? undefined` — on a search tab that is
    // `undefined`, and §5.3.5's no-surface rule then follows mechanically.
    expect(
      stageEnvelopeSurfaceIds(h, 'stage-search-tab'),
      'FS-3: no foreign `data-edit-surface` may be authored off a document tab (§5.3.3 sub-rule 2 / §5.3.5 rule 1)',
    ).toEqual([])
  })

  it('S10/P-IM-2 [GREEN CONTROL, envelope half] — with a DOCUMENT tab active the envelope authors exactly ONE surface, for the ACTIVE document', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t2', DOC_B))
    stageEnvelopeSurfaceIds(h, 'doc-b-body')
    const ids = envelopeSurfaceIds(h.capturedEnvelope())
    expect(ids, 'exactly one surface (P-IM-2: 1 iff the active target is a document)').toHaveLength(1)
    expect(ids[0], "and it carries the ACTIVE document id (§5.3.5's FOCUSED definition)").toBe(DOC_B)
    expect(surfaceIds(h), 'the DOM agrees with the envelope census').toEqual([DOC_B])
  })

  it('P-IM-2 [RED] — assembleAppGraphEnvelope authors ZERO surfaces when no document is focused (the envelope-layer rule the host must feed)', async () => {
    const registry = createPaneRegistry()
    const result = assembleAppGraphEnvelope({
      traversalEnvelope: {
        template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
        content: [
          {
            content: {
              type: 'h1',
              content: 'Doc A',
              props: { 'data-rag-node-id': `${DOC_A}-head` },
              placement: { targetPlacement: ['main'] },
            },
          },
        ],
        clientConfig: { runInstantiation: true, runRendering: true },
      } as never,
      registry,
      ctx: { enabledPanes: [], docHeads: [], currentDocumentId: null, currentNodeId: null } as never,
    })

    const ids = envelopeSurfaceIds(result.envelope)
    expect(ids, 'P-IM-2: zero surfaces when `documentId` is undefined (the non-document-tab input)').toEqual([])
  })
})

// ===========================================================================
// S9 + FS-4 + P-IM-3 — §5.3.2 the ownership subject
// ===========================================================================
describe('§5.3.2 / FS-4 / P-IM-3 — the page-edit subject is the ACTIVE TAB id', () => {
  it('S9 — a page edit under the active tab marks THAT TAB dirty through the production seam', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    pageInput()

    expect(h.editController.isDirty('t1'), 'the production seam keys the dirty flag by the ACTIVE TAB id').toBe(true)
    expect(h.editController.isDirty(DOC_A), 'and NEVER by the document id (FS-4)').toBe(false)
  })

  it('S9/FS-4/P-IM-3 [RED] — the subject is the active tab id, or PAGE_EDIT_SURFACE_ID when there is no active tab — never a document id', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    expect(subjectOf(h.host), 'the identity clause: subject ∈ { activeTabId, PAGE_EDIT_SURFACE_ID }').toBe('t1')
    expect(subjectOf(h.host), 'and it must NOT be the document id').not.toBe(DOC_A)

    // the search case keeps the same subject (the identity follows the tab)
    h.host.mountTab(searchTab('s1', 'alpha'))
    await flush()
    expect(subjectOf(h.host), 'a non-document tab still owns its own subject key').toBe('s1')
    expect(
      subjectOf(h.host),
      'P-IM-3: the subject must equal getActiveTabId() whenever it is non-null',
    ).toBe(reader<string | null>(h.host, 'getActiveTabId')())

    // the fallback direction: no active tab ⇒ the surface id
    h.host.mountTab(null)
    expect(subjectOf(h.host), 'P-IM-3 fallback: activeTabId === null ⇒ PAGE_EDIT_SURFACE_ID').toBe(PAGE_EDIT_SURFACE_ID)
  })
})

// ===========================================================================
// S12 + FS-6 + P-TP-2 — §5.3.2 caret viability
// ===========================================================================
describe('§5.3.2 caret viability / FS-6 / P-TP-2 — a tab-keyed caret is validated through its DOCUMENT', () => {
  it('S12/FS-6 [⟨§A.3.2 C2⟩ re-pinned — GREEN in the post-landing reading] — a caret saved under the ACTIVE TAB id with a live document and a present surface IS restored', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    expect(surfaceCensus(h), 'the surface is present in the stage (§5.3.5 rule 1)').toBe(1)
    const subject = subjectOf(h.host)
    expect(subject, 'the caret key is the tab id (the host key seam)').toBe('t1')

    const caret = { kind: 'rich' as const, ragId: PAGE_EDIT_SURFACE_ID, anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } }
    h.editController.saveCaret(subject, caret as never)
    expect(
      documentLive(h.host, DOC_A),
      '⟨§A.3.2 C2⟩ the document is live in the SEPARATE carrier `isDocumentLive(DOC_A)` — the document-level liveness the caret check must consult',
    ).toBe(true)
    expect(
      h.backRefs.has(DOC_A),
      '⟨§A.3.2 C2⟩ and NO document id is a `backRefs` key (the `seedActiveDocumentRef` seed is DELETED; `backRefs` keeps its `Map<ragNodeId, nodeId[]>` invariant)',
    ).toBe(false)

    await h.host.reDerive('content')

    expect(
      h.editController.restoreCaret(subject),
      'FS-6: a tab-keyed subject must be validated through its DOCUMENT — the guard may not reject it for being a non-RAG id (§5.1 caret-viability clause)',
    ).toBeDefined()
  })

  it('P-TP-2 [⟨§A.3.2 C2⟩ re-pinned — GREEN in the post-landing reading] — a subject that is NOT the active tab is never restored, and the stale entry is CLEARED', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))

    const controller = createEditController({
      backRefs: h.backRefs,
      commit: async () => ({ ok: true, nodeId: 'x' }),
      onRebuild: vi.fn(),
      pageSubjectDocument: (s) => (s === 't1' ? DOC_A : null),
      // ⟨§A.3.2 C2 / §A.4.1⟩ the SEPARATE document-liveness carrier. The
      // `seedActiveDocumentRef` seed is DELETED, so NO document id keys
      // `backRefs` and step 4's legacy fallback cannot be true here; the
      // declared-member helper keeps the teeth (absent ⇒ "does not exist" ⇒ RED).
      isDocumentLive: (id) => documentLive(h.host, id),
    } as never)
    const caret = { kind: 'rich' as const, ragId: PAGE_EDIT_SURFACE_ID, anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } }

    controller.saveCaret('t2', caret as never)
    expect(controller.restoreCaret('t2'), 'P-TP-2: a non-active subject is never restored against the active document').toBeUndefined()
    expect(controller.restoreCaret('t2'), 'and the stale entry is cleared (a later read is still undefined)').toBeUndefined()

    expect(h.backRefs.has(DOC_A), '⟨§A.3.2 C2⟩ the deleted seed: no document id keys `backRefs`').toBe(false)
    expect(documentLive(h.host, DOC_A), '⟨§A.3.2 C2⟩ the carrier holds the ACTIVE document').toBe(true)
    controller.saveCaret('t1', caret as never)
    expect(
      controller.restoreCaret('t1'),
      'the ACTIVE tab id with a live document IS restored: step 4 reads the SUPPLIED carrier (§A.3.2 clause 4), never `backRefs.has(doc)`',
    ).toBeDefined()
  })

  it('P-TP-2 [RED] — the HOST supplies the hook so an active TAB-KEYED subject with a live document restores', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t2', DOC_B))
    h.host.mountTab(searchTab('s1', 'alpha'))
    await flush()

    const caret = { kind: 'rich' as const, ragId: PAGE_EDIT_SURFACE_ID, anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } }
    // The HOST's own controller (§5.3.2 "Host side": it is the one the re-derive
    // caret step calls). The wiring's negative direction is already green
    // (`backRefs` has no tab id for this subject); the RED direction is the
    // positive one: the ACTIVE tab id on a DOCUMENT tab must be validated
    // through its document and IS restorable.
    h.host.mountTab(docTab('t2', DOC_B))
    h.editController.saveCaret('t2', caret as never)
    expect(
      h.editController.restoreCaret('t2'),
      'P-TP-2: the host must supply `pageSubjectDocument` so a tab-keyed subject with a live document restores (FS-6)',
    ).toBeDefined()
  })
})

// ===========================================================================
// S13 + FS-8 — §5.3.4 refresh()
// ===========================================================================
describe("§5.3.4 / FS-8 — refresh() re-assembles; it never reloads a document traversal into a non-document tab", () => {
  it('S13 [V5 NON-FINDING — both directions measured] — the surface/toolbar SURVIVE refresh() on a document tab, and a search tab is not overwritten', async () => {
    // SPEC-SIDE FINDING (reported, not asserted as red): §2 V5 and §5.3.4
    // restate audit violation V5 as "`refresh()` reloads the RAW traversal
    // envelope instead of `loadAppGraph`". `src/renderer/sidebar-panes.ts:1763`
    // DOES call `loadAppGraph(this.runtime, this.lastTraversalEnvelope)`, and
    // that call re-runs `applyEditorToolbar` + the assembler's `documentId`
    // authoring; the non-document direction is additionally shielded because a
    // search mount's `applyStageBody` has already replaced
    // `lastTraversalEnvelope` with the search-only envelope. NEITHER direction
    // of V5/FS-8 reproduces on this tree. A spec-side correction is owed to §2 /
    // §5.3.4 (the V5 premise no longer holds); this row is the MEASUREMENT.
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    expect(surfaceIds(h), 'pre: the surface is authored').toEqual([DOC_A])
    expect(stageHtml(h), 'pre: and the toolbar').toContain(EDITOR_TOOLBAR_ID)

    await h.host.refresh()

    expect(surfaceIds(h), '§5.3.4 sub-rule 1: the surface SURVIVES refresh() on a document tab').toEqual([DOC_A])
    expect(stageHtml(h), 'so does the editor toolbar').toContain(EDITOR_TOOLBAR_ID)
    expect(stageHtml(h), 'and the document body').toContain('Doc A')

    // §5.3.4 sub-rule 2 (the audit's P5 pin) — the non-document direction.
    const s2 = await boot(makeHarness())
    s2.host.mountTab(docTab('t1', DOC_A))
    s2.host.mountTab(searchTab('s1', 'alpha'))
    await flush()
    expect(stageHtml(s2), 'pre: the search body owns the stage').toContain('stage-search-tab')
    await s2.host.refresh()
    expect(stageHtml(s2), '§5.3.4 sub-rule 2: no document body is added to a non-document tab by refresh()').not.toContain('Doc A')
    expect(stageHtml(s2), 'and the search body survives').toContain('stage-search-tab')
    expect(surfaceCensus(s2), 'with zero surfaces (I2 non-document clause)').toBe(0)
  })
})

// ===========================================================================
// S14 + FS-9 + P-SM-1 — §5.3.6 the V6 reachability pin
// ===========================================================================
describe('§5.3.6 / FS-9 / P-SM-1 — `mountTabs` is unreachable from production, and every stage seam keeps a single active body', () => {
  it('S14/FS-9 [RED] — the static reachability census over src/renderer/** finds ZERO production call sites of `mountTabs`', async () => {
    const { readdirSync, readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const dir = join(process.cwd(), 'src', 'renderer')
    const offenders: string[] = []
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.ts')) continue
      const src = readFileSync(join(dir, f), 'utf8')
      const lines = src.split('\n')
      lines.forEach((line, i) => {
        const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '')
        if (!/\bmountTabs\s*\(/.test(code)) return
        // the definition itself is not a call site
        if (/^\s*(public\s+|private\s+|protected\s+)?mountTabs\s*\(/.test(code)) return
        if (/mountTabs\s*\(entries/.test(code)) return
        offenders.push(`${f}:${i + 1}: ${line.trim()}`)
      })
    }
    expect(offenders, '§5.3.6 rule 1 / FS-9: `mountTabs` must have NO production caller').toEqual([])
  })

  it('S14/FS-9 [RED] — `mountTabs`\' own doc comment states the 9b supersession + the U-STATE-1e park (doc-comment truth pin)', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const src = readFileSync(join(process.cwd(), 'src', 'renderer', 'sidebar-panes.ts'), 'utf8')
    const idx = src.indexOf('mountTabs(entries')
    expect(idx, 'the seam exists').toBeGreaterThan(-1)
    const before = src.slice(Math.max(0, idx - 1500), idx)
    expect(before, '§5.3.6 rule 3: the comment must state the U-STATE-1e park').toMatch(/U-STATE-1e/)
    expect(before, 'and that the seam is unreachable from production until it lands').toMatch(/unreachable|no production caller|not called from/i)
  })

  it('S14/P-SM-1 [RED] — mountTabs([a,b]) mounts two bodies; a later mountTab restores single-active (§5.3.6 rule 2, P13)', async () => {
    const h = await boot(makeHarness())
    // ⟨§A.1.1 — AMENDED⟩ the row's pre-state is made EXPLICIT: a DOCUMENT tab is
    // active before the 9b seam, so `I2-R`'s census predicate below has a
    // determinate expected value (1 / [DOC_A]) instead of an unstated one.
    h.host.mountTab(docTab('t1', DOC_A))
    const pre = surfaceRootCensus(h)
    expect(pre.agrees, `pre-state: the authored id and the marker agree (${censusLine(h)})`).toBe(true)
    expect(pre.authored, `pre-state: the active doc tab owns ONE surface root (${censusLine(h)})`).toBe(1)
    expect(pre.markerIds, `pre-state: and it is the ACTIVE document's (${censusLine(h)})`).toEqual([DOC_A])

    h.host.mountTabs([docTab('t1', DOC_A), docTab('t2', DOC_B)])
    expect(documentRootCensus(h), 'the 9b multi-mount seam materializes BOTH documents today').toBeGreaterThan(0)
    for (const id of [DOC_A, DOC_B]) {
      expect(
        stageEl(h).querySelectorAll('[data-rag-node-id]').map((el) => el.getAttribute('data-rag-node-id')).some((v) => String(v).startsWith(id)),
        `mountTabs([a,b]) materializes ${id}'s body today`,
      ).toBe(true)
    }
    // ⟨§A.1.1 I2-R — AMENDED: `=== 2` is SUPERSEDED. The row asserted the DEFECT
    // as the expectation: the `2` exists only because the reconcile left a STALE
    // `#page-edit-surface` root live (§A.1.2's `destroyRoot` classifier). The
    // census is now EXACT, counted by BOTH discriminators — never `<= 1` (a
    // document tab with a ZERO surface must fail this row too). RED today:
    // `2` (§A.1's instrumented measurement `domSurfaces: 2`).⟩
    // (the literal-exact census is asserted BEFORE the reader cross-check so
    // today's failure is the DOM CENSUS — 2 ≠ 1 — and not merely a missing §5.2
    // reader; the predicate FORM below is still asserted, verbatim §A.1.1.)
    const census = surfaceRootCensus(h)
    expect(census.agrees, `I2-R: both discriminators must agree (${censusLine(h)})`).toBe(true)
    expect(
      census.authored,
      `I2-R: exactly ONE live surface root after the 9b seam — no stale root, no duplicate (${censusLine(h)})`,
    ).toBe(1)
    expect(census.markerIds, `I2-R: and it carries the ACTIVE document's marker (${censusLine(h)})`).toEqual([DOC_A])
    // the pinned predicate FORM of §A.1.1 + §5.2's identity reader (RED today)
    const kind = reader<string | null>(h.host, 'getActiveTargetKind')()
    expect(
      census.authored,
      `I2-R: census === (getActiveTargetKind() === 'document' ? 1 : 0) (kind=${kind}; ${censusLine(h)})`,
    ).toBe(kind === 'document' ? 1 : 0)
    expect(census.markerIds, 'I2-R: when the census is 1, the marker IS the active document id').toEqual([
      reader<string | null>(h.host, 'getActiveDocumentId')(),
    ])
    // ⟨§A.1.1⟩ the row's 9b half stays, extended to the document-scope union (W2-N15).
    expect(
      mountedDocIds(h.host),
      '§5.2 pinned reader `getMountedDocumentIds()` must exist (RED today)',
    ).toBeDefined()
    expect(
      mountedDocIds(h.host),
      '§5.2/A.1.1: the mounted document set at the 9b seam is the OPEN SET (the body carve-out)',
    ).toEqual([DOC_A, DOC_B])

    h.host.mountTab(docTab('t1', DOC_A))
    const rootsAfter = stageEl(h).querySelectorAll('[data-rag-node-id]').map((el) => el.getAttribute('data-rag-node-id'))
    expect(rootsAfter.length, 'P13: a later mountTab restores single-active (ALPHA=true BETA=false)').toBeGreaterThan(0)
    expect(rootsAfter.every((v) => String(v).startsWith(DOC_A)), `every remaining root is the active document's (${rootsAfter.join(',')})`).toBe(true)
    expect(stageHtml(h), 'only the active document body').toContain('Doc A')
    expect(stageHtml(h), 'and not the sibling').not.toContain('Doc B')
    expect(surfaceIds(h), 'one surface, for the active document').toEqual([DOC_A])
    expect(
      mountedDocIds(h.host),
      '§5.2 pinned reader `getMountedDocumentIds()` must exist (RED today)',
    ).toBeDefined()
    expect(
      mountedDocIds(h.host),
      'P-SM-1: `mountedDocumentIds` equals [activeDocumentId] after the restore (§5.2 pinned reader)',
    ).toEqual([DOC_A])
  })

  it('P-SM-1 [RED] — after a NON-document mount the mounted set is empty and the document-root census is 0, across a re-derive and a refresh', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    h.host.mountTab(landingTab('l1'))
    expect(documentRootCensus(h), 'the landing stage holds no document body').toBe(0)

    await h.host.reDerive('content')
    expect(documentRootCensus(h), 'P-SM-1: a re-derive off a non-document tab adds no document body').toBe(0)
    expect(
      mountedDocIds(h.host),
      '§5.2 pinned reader `getMountedDocumentIds()` must exist (RED today)',
    ).toBeDefined()
    expect(
      mountedDocIds(h.host),
      'P-SM-1: the mounted document set is [] for a non-document active tab',
    ).toEqual([])
  })
})

// ===========================================================================
// R8 — §A.1.2 / §7.3 / §8.2 item 9 — the reconcile DESTROYS a `replaced` root
// ===========================================================================
describe('§A.1.2 / §8.2 item 9 — a `replaced` page-edit surface root is destroyed; a root `next` still authors never is', () => {
  it('R8 (§A.1.2, §7.3, §8.2 item 9) [RED] — after `mountTabs([A,B])` from a doc-A-active pre-state exactly ONE live surface root remains, by both discriminators (the stale root is destroyed)', async () => {
    const h = await boot(makeHarness())
    // §A.1.1 — the row's pre-state is EXPLICIT: the active target is a document
    // tab carrying exactly ONE live surface root.
    h.host.mountTab(docTab('t1', DOC_A))
    const pre = surfaceRootCensus(h)
    expect(pre.agrees, `pre-state: both discriminators agree (${censusLine(h)})`).toBe(true)
    expect(pre.authored, `pre-state: ONE live surface root (${censusLine(h)})`).toBe(1)
    expect(pre.markerIds, `pre-state: for the ACTIVE document (${censusLine(h)})`).toEqual([DOC_A])
    const staleNodeIds = surfaceNodeIds(h)

    // §A.1.2's PINNED case: a seam that re-authors the surface for another/next
    // document. `mountTabs` sets no active identity, so the active document is
    // still DOC_A (§A.1.1: "what is live after it is exactly the currently
    // active document tab's surface").
    h.host.mountTabs([docTab('t1', DOC_A), docTab('t2', DOC_B)])

    // THE CENSUS — the live DOM, by BOTH discriminators. NEVER
    // `applyContentReconcile`'s `applied` bucket: on the `replaced` path the
    // destroy's return is discarded and only the re-attach's is pushed
    // (`runtime.ts:629-631`), so the report is not a destroyed-root oracle.
    // RED today (`domSurfaces: 2`, §A.1's instrumented measurement): the
    // reconcile DID classify the live `page-edit-surface` `replaced`, and the
    // destroy was REFUSED by `destroyRoot`'s four-class classifier (§A.1.2).
    const census = surfaceRootCensus(h)
    expect(census.agrees, `I2-R: both discriminators must agree (${censusLine(h)})`).toBe(true)
    expect(
      census.authored,
      `§A.1.2: exactly ONE live #${PAGE_EDIT_SURFACE_ID} remains — the stale root is destroyed (${censusLine(h)})`,
    ).toBe(1)
    expect(census.markerIds, `§A.1.2: carrying the ACTIVE document's marker (${censusLine(h)})`).toEqual([DOC_A])
    // the destroyed root is GONE by node identity, not merely out-counted
    expect(
      surfaceNodeIds(h).filter((id) => staleNodeIds.includes(id)),
      `§A.1.2: the pre-state root's node is no longer live (pre=[${staleNodeIds.join(',')}] post=[${surfaceNodeIds(h).join(',')}])`,
    ).toEqual([])

    // THE NEGATIVE ARM (§A.1.2 clauses 1-2) — the widening must never destroy a
    // root that `next` still authors. Both the editor toolbar and the open docs'
    // bodies are authored by `next` at this seam, so they must stay LIVE.
    expect(stageHtml(h), '§A.1.2 clause 2: a root `next` still authors (the editor toolbar) is never destroyed').toContain(
      EDITOR_TOOLBAR_ID,
    )
    expect(
      [...bodyDocIds(h)].sort(),
      `§A.1.3: both open documents' bodies are still authored by \`next\` (bodies=[${bodyDocIds(h).join(',')}])`,
    ).toEqual([DOC_A, DOC_B].sort())

    // ...and the `kept` direction: re-applying the SAME `next` classifies the
    // surface `kept`, and `kept` destroys nothing (no reorder, no over-broad
    // destroy) — the same root node stays live and unchanged.
    const keptNodeIds = surfaceNodeIds(h)
    h.host.mountTabs([docTab('t1', DOC_A), docTab('t2', DOC_B)])
    const again = surfaceRootCensus(h)
    expect(again.agrees, `§A.1.2 clause 2: both discriminators agree on the repeat (${censusLine(h)})`).toBe(true)
    expect(again.authored, `§A.1.2 clause 2: a repeated identical \`next\` keeps ONE surface root (${censusLine(h)})`).toBe(1)
    expect(surfaceNodeIds(h), '§A.1.2 clause 2: `kept` destroys nothing — the same root node stays live').toEqual(keptNodeIds)
  })
})

// ===========================================================================
// S15/S16 — §5.4 states 19/20 — totality of the seams
// ===========================================================================
describe('§5.4 states 19/20 — `mountTab(null)` and the additive controller option', () => {
  it('S15 [RED] — `mountTab(null)` clears the identity totally and never throws', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    expect(() => h.host.mountTab(null), '§5.5: mountTab(null) never throws').not.toThrow()

    expect(reader<string | null>(h.host, 'getActiveTabId')(), 'activeTabId === null').toBeNull()
    expect(reader<string | null>(h.host, 'getActiveTargetKind')(), 'activeTargetKind === null').toBeNull()
    expect(reader<string | null>(h.host, 'getActiveDocumentId')(), 'activeDocumentId === null').toBeNull()
    expect(stageHtml(h), 'the stage is cleared').not.toContain('Doc A')
    expect(surfaceCensus(h), 'and no surface remains').toBe(0)
  })

  it('S16 [GREEN CONTROL] — the `pageSubjectDocument` hook is OPTIONAL: a controller constructed without it keeps the legacy behavior', async () => {
    const backRefs = new Map<string, string[]>([['t1', ['doc-a-body']]])
    const legacy = createEditController({ backRefs, commit: async () => ({ ok: true, nodeId: 'x' }), onRebuild: vi.fn() })
    const caret = { kind: 'rich' as const, ragId: PAGE_EDIT_SURFACE_ID, anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } }
    legacy.saveCaret('t1', caret as never)
    expect(legacy.restoreCaret('t1'), 'legacy direction: `backRefs.has(subjectId)` still governs when the hook is absent').toBeDefined()

    legacy.saveCaret('ghost', caret as never)
    expect(legacy.restoreCaret('ghost'), 'legacy direction: an unknown subject is cleared').toBeUndefined()
  })

  it('S16b [RED] — with the hook supplied, the deleted-document direction CLEARS the caret and never restores it', async () => {
    const controller = createEditController({
      backRefs: new Map<string, string[]>([['doc-a-body', []]]),
      commit: async () => ({ ok: true, nodeId: 'x' }),
      onRebuild: vi.fn(),
      pageSubjectDocument: () => 'doc-gone',
    } as never)
    const caret = { kind: 'rich' as const, ragId: PAGE_EDIT_SURFACE_ID, anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } }
    controller.saveCaret('t1', caret as never)
    expect(controller.restoreCaret('t1'), 'P-TP-2: a dead document clears the saved caret and returns undefined').toBeUndefined()
    expect(controller.restoreCaret('t1'), 'and the stale entry is gone, not merely hidden').toBeUndefined()
  })
})
