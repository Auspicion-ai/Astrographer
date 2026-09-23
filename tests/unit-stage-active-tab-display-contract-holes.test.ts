// tests/unit-stage-active-tab-display-contract-holes.test.ts — Unit
// `U-STAGE-ACTIVE-TAB` — the RED rows for the CONTRACT HOLES a read-only
// adversarial pass found in the shipped (uncommitted) implementation, on top of
// the 29 + 14 deterministic example rows the sibling suites already carry.
//
// AUTHORITY: `docs/specs/unit-stage-active-tab-display.md` — §5.1 I1/I2 (the two
// TOTAL predicates), §5.2 (the ownership model + the pinned readers), §5.3.1
// (the generation guard + the counted drop), §5.3.2 (the subject + the caret
// gate), §5.3.3 (the re-derive scope gate), §5.3.5 (the document-tab-only
// surface), §5.3.6 (the reachability pin), §6 `P-SM-1`/`P-IM-2`/`P-TP-2`/`P-IM-4`,
// §8.2 (the red-set plan) and **§A.1** (the binding amendment: §A.1.1 `I2-R` the
// total census, §A.1.2 the `destroyRoot` contract, §A.1.3 the body carve-out,
// §A.1.4 the pinned caret-hook order). No `src/**` file was read for an
// EXPECTATION: `src/**` was read only to learn the symbol names, the constructor
// shape and the pinned `path:line` repros the audit reported.
//
// ---------------------------------------------------------------------------
// LAYER (RCA-12): HOST/RENDERER (the mount/derive ordering + the ownership key)
// + ENVELOPE for the surface-census input. NOTHING here is APP-GREEN: the
// dom-shim is layout-less, so the PAINTED stage identity, the real `rag.query`
// latency and the real `IPC_RAG_STORE_CHANGED` ordering stay live-only (§8.3).
// ---------------------------------------------------------------------------
//
// THE AUDIT'S REPROS (each row below fails at HEAD on this tree; the header
// records the repro the audit reported and what the tree actually measures, so a
// reader can never mistake a stale line number for a live claim):
//
//   H-1 `mountedDocumentIds` is stamped BEFORE the de-dupe early-return
//       (`src/renderer/sidebar-panes.ts` `mountTab` — the identity stamp, then
//       the `key === this.mountedStageKey` early return, then the set/clear of
//       `mountedDocumentIds`) so a mount that is de-duped (or a `mountTabs([])`
//       prune) can leave the identity readers and the mounted set disagreeing
//       while the STAGE still displays the pruned tab's page. Repro:
//       `mountTab(t1/doc-a)` → `mountTabs([])` → (`mountTab(t1/doc-a)`).
//       MEASURED at HEAD: after `mountTabs([])`, `getActiveTabId()===null` but
//       `getActiveTargetKind()==='document'` + `getActiveDocumentId()==='doc-a'`
//       (the "no tab + non-null kind" state), `getMountedDocumentIds()===[]`,
//       and the stage still holds doc-a's body + ONE live surface — violating
//       `P-SM-1`'s settled-seam equality and §A.1.1's "what is live after it is
//       exactly the currently active document tab's surface — or none when
//       `activeTabId === null`". The following `mountTab(t1/doc-a)` restores
//       consistency (asserted as the control), so the row pins the STATE, not
//       the re-mount.
//   H-2 one predicate must own both scope seams: `stageDocumentScope()` returns
//       `_currentDocumentId` whenever `activeTabId === null` while the re-derive
//       gate uses a DIFFERENT predicate, and `prunePageState` clears/re-points
//       `activeTabId` without touching `activeTargetKind`/`activeDocumentId`, so
//       "no tab + non-null kind" is representable. MEASURED at HEAD in that
//       state (`mountTab(t1/doc-a)` + `setCurrentDocumentId(doc-b)` +
//       `mountTabs([])`): `reDerive('content')` keeps the surface on doc-a while
//       `refresh()` re-authors it as `doc-b` — the two seams disagree and the
//       surface is authored for a document that is NOT the displayed body's
//       (`FS-3`/`FS-7`).
//       NOT PINNED HERE (owned by the C9 remand, cross-referenced only):
//       `commitPageEdit` scopes with `_currentDocumentId` — that row belongs to
//       the `U-EDIT-1 (C9)` remand and must not be duplicated in this unit.
//   H-3 `mountTabs` with NO active document tab authors a surface for
//       `documentIds[0]` (`applyDocumentSet`'s `activeScope`/`surfaceDocumentId`
//       derivation). `I2-R` requires **0**. ⟨§A.3.1 RULING C1 (2026-09-22/23)
//       re-pins this row's PRE half⟩: the boot state with no `mountTab`/`mountTabs`
//       at all is the **BOOT CARVE-OUT** — a CONTRACT STATE of its own
//       (`isPreTabState()`, `getPreTabDocumentId()`) whose census IS 1 / its
//       pre-tab document (`doc-a` here; the artifact's `A11`/`A11b` values), never
//       an `I2-R` violation. MEASURED at HEAD: at that pre-tab seam the census is
//       1/1 `doc-a` while `getActiveTargetKind()===null`, and
//       `mountTabs([docTab('t2', doc-b)])` from it authors a 1/1 `doc-b` surface
//       with no owning tab — the POST half, which stays STRICT and RED. The seam is
//       TEST-ONLY (§5.3.6 rule 1's reachability pin holds — it is asserted green by
//       the sibling suite); the census invariant is total at every seam including
//       `mountTabs` from the first tab state onward (§A.1.1 + §A.3.1 clause (d)),
//       and the pre-tab root must be DESTROYED there (clause (f)).
//   H-4 closed tabs' carets are never dropped (`dropClosedPageState` frees only
//       the dirty flag + the failure record). The caret store therefore grows one
//       entry per closed tab, and — because the strip's id allocator re-mints a
//       closed LAST tab's id (`src/renderer/tab-state.ts` `nextTabId`, the same
//       class `HOST-7` records for `queryId`) — a caret saved for the closed
//       tab's page is then restored against a DIFFERENT document's surface.
//       SPEC-SIDE GAP (§A.2.4, re-confirmed by ⟨§A.3.2 RULING C2⟩, which does NOT
//       fix it): no clause of the spec mandates close-time caret eviction —
//       **§A.1.4 clause 1 pins the opposite direction** ("carets live until a
//       read": a caret-less read returns `undefined` and does NOT consult the
//       hook), and `U-EDIT-1` §3.5 item 3 enumerates only the dirty flag + the
//       failure record as the close-drop set. **THE ROW IS PARKED (`it.skip`, reason
//       inline)** rather than silently deleted: the fix shape (a close-time eviction
//       clause, or an explicit relaxation of §A.1.4 clause 1) is named for the
//       supervisor and NOT authored here. It was GREEN at HEAD only through the
//       `seedActiveDocumentRef` document-id seed that ⟨§A.3.2 C2⟩ deletes; under C2
//       the carrier still reports the re-minted tab's NEW document live, so the
//       assertion has no licensing clause at all — a further amendment (§7.4), never
//       a silent re-pin. The `H-4b` caret-CORRECTNESS control (the no-over-eviction
//       direction) stays asserted.
//   H-5 `seedActiveDocumentRef()` inserts a DOCUMENT id as a `backRefs` KEY — the
//       map whose documented invariant is `Map<ragNodeId, nodeId[]>` (the
//       controller's own doc comment at `restoreCaret`) and which `isEditable`
//       and the commit pre-check consult. MEASURED at HEAD: after
//       `mountTab(t1/doc-a)` the keys are `['doc-a-head','doc-a-body','doc-a']`
//       and `isEditable('doc-a') === true` — a document id is treated as an
//       editable/committable node. ⟨§A.3.2 RULING C2⟩: the seed is DELETED
//       (`backRefs` keeps its documented invariant, no rename, no relaxation) and
//       the caret's document check moves to the SEPARATE carrier
//       `SidebarPanes.isDocumentLive(documentId)` — so this row's assertions are
//       UNCHANGED and GREEN in the post-landing reading (the tree's seed is gone; the
//       keys are node ids only).
//
// ===========================================================================
// STATE MACHINE COVERED (the reachable host states these rows drive):
//   S-boot          boot with no `mountTab`/`mountTabs` — the ⟨§A.3.1 C1⟩ PRE-TAB
//                   CARVE-OUT state (census 1 / [getPreTabDocumentId()])
//   S-doc           a document tab active (doc-a / doc-b)
//   S-search        a non-document active tab (search)
//   S-pruned        `mountTabs([])` after a document mount = "no tab + non-null
//                   kind" (the H-1/H-2 state, reachable at the test-only
//                   `mountTabs` seam, §5.3.6)
//   S-openset       `mountTabs([...])` with no active document tab (H-3) — the
//                   strict arm: 0 surfaces, the pre-tab root destroyed
//   S-closed        a tab id closed (published) and then re-minted (H-4 — PARKED, §A.2.4)
//   S-reused-id     the re-minted tab on a DIFFERENT document (H-4 — PARKED, §A.2.4)
// ===========================================================================
// FAIL-STATES COVERED: `FS-2`/`FS-3` (H-2's foreign surface), `FS-6` (H-4's
//   wrong-document caret — its row is PARKED on §A.2.4's spec-side gap; `H-4b`'s
//   caret-correctness control stays asserted), `FS-7` (H-1/H-2's
//   `_currentDocumentId` scope at the `refresh()` seam), `FS-9`'s census half
//   (§A.1.1 from the first tab state onward — the `mountTabs` seam, the boot
//   pre-tab state being §A.3.1's carve-out, not a violation). The remaining
//   fail-states are carried by the sibling suites.
// ===========================================================================
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { PAGE_EDIT_SURFACE_ID, DATA_EDIT_SURFACE } from '../src/renderer/pane-graph.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'
import type { OperatorSettings } from '../src/shared/types.js'
import type { TabEntry, TabTarget } from '../src/renderer/tab-state.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { notifyTabClosed } from '../src/renderer/tab-strip.js'

beforeAll(() => {
  installShim()
})

const DOC_A = 'doc-a'
const DOC_B = 'doc-b'
const T = '2026-09-22T00:00:00.000Z'

function makeNode(id: string, type: string, content: string): RagNode {
  return { id, type, content, ownedNodeIds: [], createdAt: T, updatedAt: T }
}
function makeEdge(id: string, source: string, target: string): RagEdge {
  return { id, kind: 'doc-head', source, target, createdAt: T, updatedAt: T, documentIds: [target] }
}
function docTab(id: string, documentId: string): TabEntry {
  return { id, target: { kind: 'document', documentId } as TabTarget, title: `Doc ${documentId}` }
}
function searchTab(id: string, query: string): TabEntry {
  return { ...docTab(id, ''), target: { kind: 'search', queryId: `q-${id}` } as TabTarget, search: { query, topK: 5 } }
}

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  mount: ReturnType<typeof mountEl>
  editController: ReturnType<typeof createEditController>
  backRefs: Map<string, string[]>
  nodeIds: Set<string>
}

function makeHarness(): Harness {
  const mount = mountEl()
  const operatorMount = mountEl()
  const registry = createPaneRegistry()
  const nodes = [
    makeNode(`${DOC_A}-head`, 'h1', 'Doc A'),
    makeNode(`${DOC_A}-body`, 'p', 'body A'),
    makeNode(`${DOC_B}-head`, 'h1', 'Doc B'),
    makeNode(`${DOC_B}-body`, 'p', 'body B'),
  ]
  const store = createSnapshotStore(nodes, [
    makeEdge('ea-h', `${DOC_A}-head`, DOC_A),
    makeEdge('ea-n', `${DOC_A}-head`, `${DOC_A}-body`),
    makeEdge('ea-e', `${DOC_A}-body`, DOC_A),
    makeEdge('eb-h', `${DOC_B}-head`, DOC_B),
    makeEdge('eb-n', `${DOC_B}-head`, `${DOC_B}-body`),
    makeEdge('eb-e', `${DOC_B}-body`, DOC_B),
  ])
  const bridge = {
    security: { get: async () => ({ token: null, enabled: ['read', 'dispatch', 'rag'] }) },
    edit: { onRagStoreChanged: () => () => {}, commitRich: async () => ({ ok: true, nodeId: 'x' }), batch: async () => ({ ok: true, results: [] }) },
    rag: {
      query: vi.fn(async (q: string) => ({ query: q, ranked: [], results: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 })),
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
      get: async () =>
        ({ enabledPanes: [], panesInitialized: true, defaultDocumentId: null, topK: 5, representationMode: 'html' }) as unknown as OperatorSettings,
      set: async (p: Record<string, unknown>) => p as unknown as OperatorSettings,
      onChanged: () => () => {},
    },
  }
  const backRefs = new Map<string, string[]>([['t1', [`${DOC_A}-body`]], ['t2', [`${DOC_B}-body`]]])
  let host: SidebarPanes
  const editController = createEditController({
    backRefs,
    commit: async () => ({ ok: true, nodeId: 'x' }),
    onRebuild: (k) => void host.reDerive(k),
  })
  host = new SidebarPanes({ mount, operatorMount, registry, bridge: bridge as never, backRefs, editController })
  const runtime = new Runtime({
    mount: mount as never,
    envelope: { template: DEFAULT_CONTENT_WINDOW_TEMPLATE, content: [], clientConfig: { runInstantiation: true, runRendering: true } } as never,
  })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, mount, editController, backRefs, nodeIds: new Set(nodes.map((n) => n.id)) }
}

async function boot(h: Harness): Promise<Harness> {
  await h.host.boot(h.runtime)
  return h
}

// ---- §5.2's pinned readers, through DECLARED members (a missing reader must
// ---- report "does not exist", never a private-field peek) -------------------
function reader<T>(host: SidebarPanes, name: string): () => T {
  const fn = (host as unknown as Record<string, unknown>)[name]
  if (typeof fn !== 'function') {
    throw new TypeError(`SidebarPanes.${name}() does not exist (U-STAGE-ACTIVE-TAB §5.2 — RED)`)
  }
  return () => (fn as () => T).call(host)
}
function activeTabId(host: SidebarPanes): string | null {
  return reader<string | null>(host, 'getActiveTabId')()
}
function activeKind(host: SidebarPanes): string | null {
  return reader<string | null>(host, 'getActiveTargetKind')()
}
function activeDocId(host: SidebarPanes): string | null {
  return reader<string | null>(host, 'getActiveDocumentId')()
}
function mountedIds(host: SidebarPanes): readonly string[] {
  return reader<readonly string[]>(host, 'getMountedDocumentIds')()
}
// ---- ⟨§A.3.1 RULING C1 (2026-09-22/23)⟩ the two ADDED pre-tab observers (§5.2's table is EXTENDED
// ---- by §A.3, not superseded). Same declared-member convention: an absent reader reports
// ---- "does not exist", and the member NAMES are the pinned contract (§A.3.4 item 3).
function preTabState(host: SidebarPanes): boolean {
  return reader<boolean>(host, 'isPreTabState')()
}
function preTabDocumentId(host: SidebarPanes): string | null {
  return reader<string | null>(host, 'getPreTabDocumentId')()
}

// ---- DOM readers (the shim's `querySelectorAll` is descendants-only, so the
// ---- mount subtree IS the stage region, the sibling suites' convention) ------
type ShimLike = { innerHTML: string; querySelectorAll(sel: string): Array<{ getAttribute(k: string): string | null }> }
function stageEl(h: Harness): ShimLike {
  return h.mount as unknown as ShimLike
}
/** §A.1.1 `I2-R` — the census by BOTH discriminators (the authored id AND the
 *  `data-edit-surface` marker), which must agree. */
function census(h: Harness): { authored: number; marked: number; markerIds: Array<string | null>; agrees: boolean; line: string } {
  const authoredRoots = stageEl(h).querySelectorAll(`[id='${PAGE_EDIT_SURFACE_ID}']`)
  const markedRoots = stageEl(h).querySelectorAll(`[${DATA_EDIT_SURFACE}]`)
  const markerIds = markedRoots.map((el) => el.getAttribute(DATA_EDIT_SURFACE))
  const authoredMarkerIds = authoredRoots.map((el) => el.getAttribute(DATA_EDIT_SURFACE))
  const authored = authoredRoots.length
  const marked = markedRoots.length
  const agrees =
    authored === marked && authoredMarkerIds.length === markerIds.length && authoredMarkerIds.every((v, i) => v != null && v === markerIds[i])
  return { authored, marked, markerIds, agrees, line: `#${PAGE_EDIT_SURFACE_ID}=${authored} [${DATA_EDIT_SURFACE}]=${marked} values=[${markerIds.join(',')}] agrees=${agrees}` }
}
/** §A.1.3 — the body-root census keyed BY DOCUMENT (never by the first
 *  `-`-delimited token, which collapses doc-a/doc-b to one key and passes
 *  vacuously). */
function bodyDocIds(h: Harness): string[] {
  const roots = stageEl(h).querySelectorAll('[data-rag-node-id]').map((el) => String(el.getAttribute('data-rag-node-id')))
  const out: string[] = []
  for (const r of roots) {
    const key = [DOC_A, DOC_B].find((d) => r === d || r.startsWith(`${d}-`)) ?? `?${r}`
    if (!out.includes(key)) out.push(key)
  }
  return out
}
function documentRootCensus(h: Harness): number {
  return stageEl(h).querySelectorAll('[data-rag-node-id]').length
}
function stageHtml(h: Harness): string {
  return stageEl(h).innerHTML
}
/** The page seam (`window.provident.sidebar`, §5.3.2/§11.8 item 1). */
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
const PAGE_CARET = { kind: 'rich' as const, ragId: PAGE_EDIT_SURFACE_ID, anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } }

// ===========================================================================
// H-1 — the identity readers, the mounted set and the stage must agree at a
// settled seam (`mountedDocumentIds` stamped before the de-dupe early-return)
// ===========================================================================
describe('H-1 (§5.1 I2 / §5.2 / §6 `P-SM-1` / §A.1.1) — the settled-seam equality survives a prune', () => {
  it('H-1 [RED] — after `mountTabs([])` the identity triple is incoherent, `mountedDocumentIds` and the live census do not follow `activeDocumentId`, and the pruned tab\'s page is still on the stage', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))

    // the row's EXPLICIT pre-state (a document tab owns one live surface)
    const pre = census(h)
    expect(pre.agrees, `pre-state: both discriminators agree (${pre.line})`).toBe(true)
    expect(pre.authored, `pre-state: ONE live surface root (${pre.line})`).toBe(1)
    expect(pre.markerIds, `pre-state: carrying the ACTIVE document's marker (${pre.line})`).toEqual([DOC_A])
    expect(mountedIds(h.host), 'pre-state: the mounted set is the active document').toEqual([DOC_A])

    // THE PRUNE SEAM (the audit's repro, step 2). `mountTabs([])` sets no active
    // identity but DOES prune `activeTabId` — while `activeTargetKind` /
    // `activeDocumentId` stay stamped.
    h.host.mountTabs([])

    // (a) the identity triple is ONE identity: no active tab ⇒ no kind, no doc
    expect(
      activeTabId(h.host),
      'H-1: the prune did clear the active tab id (the state is "no tab + non-null kind")',
    ).toBeNull()
    expect(
      activeKind(h.host),
      'H-1/§5.2: no active tab ⇒ `activeTargetKind` is null (the readers are one identity, never a stale mirror)',
    ).toBeNull()
    expect(
      activeDocId(h.host),
      'H-1/§5.2: no active tab ⇒ `activeDocumentId` is null (never a stale field)',
    ).toBeNull()

    // (b) `P-SM-1`'s settled-seam equality, verbatim: `mountedDocumentIds` equals
    // `[activeDocumentId]` (a document tab) or `[]` (non-document / no tab).
    const kind = activeKind(h.host)
    expect(
      mountedIds(h.host),
      `H-1/§6 P-SM-1: mountedDocumentIds === [activeDocumentId] (kind=${kind}) or [] — a settled seam`,
    ).toEqual(kind === 'document' ? [activeDocId(h.host)] : [])

    // (c) a settled seam may not display a page NO tab owns: the pruned tab's
    // body + its surface must be gone (§A.1.1's census keyed by the ACTIVE TAB;
    // §5.3.1's `entry === null` clear is the pinned shape).
    const post = census(h)
    expect(
      post.authored,
      `H-1/§A.1.1 I2-R: no document tab is active ⇒ ZERO live surface roots (${post.line})`,
    ).toBe(0)
    expect(
      documentRootCensus(h),
      `H-1/§5.1 I2 clause 3: no document body root off a document tab (bodyDocs=[${bodyDocIds(h).join(',')}])`,
    ).toBe(0)

    // (d) THE CONTROL: the very next `mountTab` restores consistency — so the row
    // pins the STATE at the prune seam, not the re-mount.
    h.host.mountTab(docTab('t1', DOC_A))
    expect(activeTabId(h.host), 'control: the re-mount restores the identity').toBe('t1')
    expect(mountedIds(h.host), 'control: and the mounted set').toEqual([DOC_A])
    expect(census(h).markerIds, 'control: and the surface').toEqual([DOC_A])
  })

  it('H-1b [RED] — `applyDocumentSet` may not pick a NON-ACTIVE document\'s surface once the identity was pruned (§A.1.1: "or none when activeTabId === null")', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    h.host.mountTabs([]) // the H-1 state: no active tab
    expect(activeTabId(h.host), 'the row\'s pre-state: no active tab').toBeNull()

    // A `mountTabs` for another document must NOT author a surface of its own: the
    // 9b seam sets no active identity (§A.1.1), so the LIVE surface must be the
    // active document tab's — or none.
    h.host.mountTabs([docTab('t2', DOC_B)])
    const post = census(h)
    expect(
      post.authored,
      `H-1b/§A.1.1: with NO active document tab, \`mountTabs\` may author NO surface (${post.line})`,
    ).toBe(0)
    expect(
      post.markerIds,
      `H-1b/§A.1.1: and never the first OPEN document's (${post.line})`,
    ).not.toEqual([DOC_B])
  })
})

// ===========================================================================
// H-2 — ONE predicate must own both scope seams (the re-derive gate and
// `stageDocumentScope`), in the representable "no tab + non-null kind" state
// ===========================================================================
describe('H-2 (§5.2 / §5.3.3 / §5.3.4 / FS-3 / FS-7) — the two document-scope seams agree in the pruned state', () => {
  it('H-2 [RED] — `reDerive(\'content\')` and `refresh()` must not disagree about the scope, and the surface may never be a FOREIGN document\'s', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    // the retained doc-nav selection points ELSEWHERE (the §5.2 narrowing: it is
    // not a scope source at any stage/re-derive/surface seam for a mounted tab —
    // and this row is the state where the two seams READ it differently).
    h.host.setCurrentDocumentId(DOC_B)
    h.host.mountTabs([]) // ⇒ activeTabId === null, activeTargetKind === 'document', activeDocumentId === 'doc-a'

    // The two scope seams, in order.
    await h.host.reDerive('content')
    const afterReDerive = census(h)
    const seamA = [...afterReDerive.markerIds]

    await h.host.refresh()
    const afterRefresh = census(h)

    // (1) the two seams agree (one predicate owns both)
    expect(
      afterRefresh.markerIds,
      `H-2: \`reDerive\` and \`refresh\` must resolve the SAME document scope in one host state ` +
        `(reDerive=[${seamA.join(',')}] refresh=[${afterRefresh.markerIds.join(',')}]; ${afterRefresh.line})`,
    ).toEqual(seamA)

    // (2) the surface belongs to the DISPLAYED body's document — a surface for
    // another document is `FS-3`/`FS-7`, never a legitimate re-key.
    const bodies = bodyDocIds(h)
    const owned = afterRefresh.markerIds.map((m) => String(m))
    expect(
      bodies.every((d) => d.startsWith('?') || owned.includes(d)) && owned.every((m) => bodies.includes(m)),
      `H-2/FS-3: the surface's document and the displayed body's must be the SAME document ` +
        `(surface=[${owned.join(',')}] bodies=[${bodies.join(',')}])`,
    ).toBe(true)

    // (3) and the census is the active-tab predicate while the active tab id is
    // null (no document tab active ⇒ 0), by both discriminators.
    expect(
      afterRefresh.authored,
      `H-2/§A.1.1 I2-R: no active document tab ⇒ ZERO surfaces (${afterRefresh.line})`,
    ).toBe(0)
  })

  it('H-2b [GREEN CONTROL] — with a DOCUMENT tab active the two seams agree and keep the active document', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    await h.host.reDerive('content')
    const afterReDerive = [...census(h).markerIds]
    await h.host.refresh()
    expect(afterReDerive, 'control: the re-derive keeps the active document').toEqual([DOC_A])
    expect(census(h).markerIds, 'control: so does refresh() — the two seams agree').toEqual([DOC_A])
    expect(census(h).agrees, 'control: both discriminators agree').toBe(true)
  })
})

// ===========================================================================
// H-3 — `mountTabs` with no active document tab authors `documentIds[0]`'s
// surface (`I2-R` requires 0)
// ===========================================================================
describe('H-3 (§A.1.1 `I2-R` / §5.3.6 rule 2 / FS-9\'s census half) — the open-set seam authors no surface of its own', () => {
  it('H-3 [⟨§A.3.1 C1⟩ re-pinned — GREEN in the post-landing reading] — the PRE-tab state is the ⟨§A.3.1 C1⟩ CARVE-OUT (census 1 / [getPreTabDocumentId()]), and `mountTabs([doc-b])` from it destroys that root and authors ZERO surfaces, never documentIds[0]\'s', async () => {
    const h = await boot(makeHarness())
    // the PRE-TAB state: the boot seam with no `mountTab`/`mountTabs` at all — ⟨§A.3.1 RULING C1⟩
    // re-pins this state as a CONTRACT STATE of its own (the BOOT CARVE-OUT); the strict `I2-R`
    // predicate binds from the first tab state onward (clause (d)).
    expect(activeTabId(h.host), 'pre-state: no active tab at the boot seam').toBeNull()
    expect(activeKind(h.host), 'pre-state: and no active target kind').toBeNull()
    expect(
      preTabState(h.host),
      'H-3/§A.3.1: no tab state has been handed ⇒ the state IS the pre-tab state (monotonic)',
    ).toBe(true)
    expect(
      preTabDocumentId(h.host),
      'H-3/§A.3.1 (a)/(g): the pre-tab stage displays the boot seam\'s retained default-context document',
    ).toBe(DOC_A)
    const bootCensus = census(h)
    expect(bootCensus.agrees, `H-3/§A.3.1 (a): both discriminators agree in the pre-tab state (${bootCensus.line})`).toBe(true)
    expect(
      bootCensus.authored,
      `H-3/§A.3.1 clause (a): the pre-tab arm IS surface-owning ⇒ EXACTLY 1 live surface (NOT 0 — this half is the CARVE-OUT, never an \`I2-R\` violation) (${bootCensus.line})`,
    ).toBe(1)
    expect(
      bootCensus.markerIds,
      `H-3/§A.3.1 clause (a): and that root's marker EQUALS \`getPreTabDocumentId()\` (${bootCensus.line})`,
    ).toEqual([preTabDocumentId(h.host)])
    expect(bootCensus.marked, `H-3/§A.3.1 (a): the marker count equals the authored count (${bootCensus.line})`).toBe(1)

    h.host.mountTabs([docTab('t2', DOC_B)])
    const post = census(h)
    expect(
      preTabState(h.host),
      'H-3/§A.3.1 clause (d): `mountTabs` IS tab state ⇒ the pre-tab arm is unavailable forever',
    ).toBe(false)
    expect(activeTabId(h.host), 'the open-set seam sets NO active identity (§A.1.1)').toBeNull()
    expect(
      post.authored,
      `H-3/§A.1.1 I2-R: \`mountTabs\` takes no active entry, so with no active document tab it may author NO surface (${post.line})`,
    ).toBe(0)
    expect(
      post.markerIds,
      `H-3: and in particular never \`documentIds[0]\`'s (${post.line})`,
    ).not.toEqual([DOC_B])
    expect(post.marked, `H-3: the marker discriminator agrees with the authored-id one (${post.line})`).toBe(0)
    // ⟨§A.3.1 clauses (d)/(f)⟩ the NEW clause the ruling pins for this seam: the pre-tab root is
    // DESTROYED, not grandfathered — and (⟨A.1.3⟩) the body carve-out leaves the open set's doc-b
    // BODY materialized (bodies only may coexist at `mountTabs`).
    expect(
      post.markerIds,
      `H-3/§A.3.1 (d)/(f): the pre-tab surface root is DESTROYED at the first tab state — no \`doc-a\` surface survives this seam (${post.line})`,
    ).not.toContain(DOC_A)
    expect(
      bodyDocIds(h),
      `H-3/§A.1.3: the body carve-out — the open set's \`doc-b\` BODY is still materialized at \`mountTabs\` (bodies, never surfaces) (${post.line})`,
    ).toContain(DOC_B)
  })
})

// ===========================================================================
// H-4 — a closed tab's caret is never dropped (the reused-id / wrong-document
// direction; `P-TP-2`'s discriminator, `FS-6`)
// ===========================================================================
describe('H-4 (§6 `P-TP-2` / §5.1 I1 caret-viability / FS-6) — the close seam drops the closed tab\'s page caret', () => {
  // ⟨§A.2.4 — SPEC-SIDE GAP, re-confirmed by ⟨§A.3.2 RULING C2⟩ (which does NOT fix H-4). PARKED:
  //   no clause licenses the assertion below. `dropClosedPageState`'s drop set is the dirty flag +
  //   the failure record (`sidebar-panes.ts:3581-3589`; `unit-u-edit-1-whole-page-editing.md` §3.5
  //   item 3 enumerates exactly those two) and §A.1.4 clause 1 pins the OPPOSITE direction for
  //   carets ("carets live until a read"), so a close-time caret EVICTION is authorized by no clause
  //   of this spec. The fix shape (a close-time eviction clause, or an explicit relaxation of §A.1.4
  //   clause 1) is named in §A.2.4 and NOT authored here; the half is parked rather than silently
  //   deleted, and the row's `it.skip` title carries this reason inline. The row's own assertions
  //   below were GREEN at HEAD only because `seedActiveDocumentRef` put the re-minted tab's NEW
  //   document in `backRefs`; with ⟨§A.3.2 C2⟩ deleting that seed they would flip to RED while the
  //   licence is still absent — which is exactly the gap, never a C2 regression. The caret-
  //   CORRECTNESS control (H-4b, below) stays asserted.⟩
  it.skip('H-4 [PARKED — §A.2.4 spec-side gap: no clause licenses close-time caret eviction; NOT fixed by ⟨§A.3.2 C2⟩] — a caret saved for a closed tab\'s page is NOT restored against the re-minted tab id\'s DIFFERENT document', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    expect(census(h).markerIds, 'pre-state: t1 owns doc-a\'s page').toEqual([DOC_A])

    // the page caret the operator's cursor left on doc-a's page, under the page
    // subject §5.3.2 pins (the active TAB id)
    h.editController.saveCaret('t1', PAGE_CARET as never)
    expect(h.editController.restoreCaret('t1'), 'pre-state: the caret is live for its own document').toBeDefined()
    h.editController.saveCaret('t1', PAGE_CARET as never) // re-save after the read cleared nothing

    // THE CLOSE (the strip's ONE publication seam, §3.5 item 3) and then the id
    // RE-MINT: `nextTabId` derives the id from the open-set SIZE, so closing the
    // LAST tab re-mints its id (the same class `HOST-7` records for `queryId`).
    notifyTabClosed('t1')
    h.host.mountTab(docTab('t1', DOC_B))

    // the close DID drop the dirty flag + the failure record (the green controls)
    expect(h.editController.isDirty('t1'), 'control: the close drops the closed tab\'s dirty flag').toBe(false)
    expect(activeDocId(h.host), 'the re-minted t1 is now on a DIFFERENT document').toBe(DOC_B)

    // THE RED DIRECTION: the caret saved for doc-a's page must not be handed to
    // doc-b's surface — `P-TP-2`'s wrong-document discriminator ("a caret restored
    // against a different document's surface must FAIL") + `FS-6`.
    expect(
      h.editController.restoreCaret('t1'),
      'H-4/FS-6: the close seam must drop the closed tab\'s caret — a re-minted tab id may not restore the previous page\'s caret against another document',
    ).toBeUndefined()
  })

  it('H-4b [GREEN CONTROL] — with the SAME document re-mounted under the same subject the caret is still restored (no over-eviction)', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    h.editController.saveCaret('t1', PAGE_CARET as never)
    h.host.mountTab(docTab('t1', DOC_A))
    expect(
      h.editController.restoreCaret('t1'),
      'control: the same tab id on its OWN live document keeps its page caret (§5.1 I1 caret-viability)',
    ).toBeDefined()
  })
})

// ===========================================================================
// H-5 — the `backRefs` map's documented invariant is `Map<ragNodeId, nodeId[]>`
// ===========================================================================
// ⟨§A.3.2 RULING C2 (2026-09-22/23): H-5's assertions are UNCHANGED and become GREEN — the
//   `seedActiveDocumentRef` seed is DELETED, so no document id is ever a `backRefs` key; the caret's
//   document check moves to the SEPARATE carrier `SidebarPanes.isDocumentLive(documentId)` (the
//   `backRefs` invariant is NOT relaxed and its type is NOT renamed).⟩
describe('H-5 (§5.3.2 caret viability / `edit-controller.ts`\'s documented map invariant) — no DOCUMENT id is a `backRefs` key', () => {
  it('H-5 [⟨§A.3.2 C2⟩ — assertions UNCHANGED; GREEN in the post-landing reading] — after a document mount the `backRefs` map holds no document id, and a document id is not "editable"', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))

    const keys = [...h.backRefs.keys()]
    // green control: the map IS populated with the document's RAG node ids
    expect(keys.length, 'control: the map is populated by the mount').toBeGreaterThan(0)

    // THE RED DIRECTION: `seedActiveDocumentRef()` inserted the DOCUMENT id.
    expect(
      keys,
      'H-5: `backRefs` is documented as `Map<ragNodeId, nodeId[]>` — a document id is not a key (keep the invariant or rename/relax it explicitly)',
    ).not.toContain(DOC_A)
    expect(
      keys.filter((k) => !h.nodeIds.has(k)),
      'H-5: every `backRefs` key must be a snapshot NODE id (the map the commit pre-check consults)',
    ).toEqual([])

    // the documented CONSUMER direction: `isEditable` is `backRefs.has(nodeId)`,
    // so a seeded document id reads as an editable node.
    expect(h.editController.isEditable(`${DOC_A}-head`), 'control: a real RAG node id is editable').toBe(true)
    expect(
      h.editController.isEditable(DOC_A),
      'H-5: a DOCUMENT id must not read as an editable node (`isEditable` is `backRefs.has(nodeId)`)',
    ).toBe(false)
  })
})
