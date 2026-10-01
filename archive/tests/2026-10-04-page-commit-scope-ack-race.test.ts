// tests/page-commit-scope-ack-race.test.ts — NEW RED rows for the RCA-3 SECOND
// REMAND on `C9 U-EDIT-1`: findings **N1** (the commit scope is the wrong
// document), **N3** (an over-long/junk acknowledgement reads as success) and
// **N4** (the close/commit race).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md (the spec text is
// the contract; `src/**` was read for symbol names / call signatures only):
//   - N1: §3.4 step 2/3 the blur decodes the SURFACE and commits **that page**;
//     §11.10 item 4(b) `buildPageOps` "refuses a marker that disagrees with the
//     committing document" — so the committing document must BE the page's
//     document. The page is the ACTIVE TAB's (`U-STAGE-ACTIVE-TAB` §5.3.3: the
//     stage/re-derive/surface seams all scope through the active tab, and
//     `_currentDocumentId` "is therefore not a scope source for any MOUNTED
//     tab" — the seam `stageDocumentScope()`). The doc-nav handler
//     `pane-doc-nav-select` → `selectDocument` moves `_currentDocumentId`
//     independently of the active tab, so a commit that reads
//     `_currentDocumentId` writes (or refuses) against a document the user is
//     not editing.
//   - N3: §3.3 item 6 "The result is CHECKED, never assumed"; §3.6/`FS19` "A
//     commit that reports success without an acknowledged write is the worst
//     outcome in this unit"; `src/main/rag-store.ts` pins the success arm as
//     "one `BatchOpResult` per op, **in order**". ⇒ an acknowledgement is one
//     result PER OP, in order, each agreeing with the op it acknowledges — a
//     junk-but-long `results` array is NOT an acknowledged write. (NOTE:
//     §11 amendment `11.10` item 4(d) records the LANDED reader's weaker reading
//     — "at least as long as the op count" — as a landed fact; that reading is
//     what this remand replaces, and the proposition asserted here is derived
//     from §3.3 item 6 + §3.6/`FS19` + the store's own pinned success arm.)
//   - N4: §3.5 item 3 the dirty machine's states are **per tab**, exactly one at
//     a time (`design-extensions-review` §12.4); §3.5 item 6 the state lives in
//     host-side state keyed by tab id; §11.8 item 3 a close drops EXACTLY the
//     closed tab's state and a success deletes only ITS entry. An in-flight
//     commit whose resolution re-enters a DRAINED — or REUSED — subject breaks
//     both: a failure lands a `commit-failed` warning on a fresh tab, and a
//     success clears a fresh tab's dirty flag (its text then never commits).
//     The sibling unit's `stageMountSeq` is the same CLASS of guard for the
//     mount path (`U-STAGE-ACTIVE-TAB` §5.3.1: "A completion whose stamp is
//     stale is DISCARDED, never applied"); these rows assert only the
//     OBSERVABLE outcome, never an implementation.
//
// States enumerated (the state machine this file covers):
//   N1S1  tab-1/doc-1 mounted + active, the doc-nav then selects doc-3
//   N1S2  the page surface (doc-1) is blurred while the doc-nav names doc-3
//   N1S3  the same blur with NO doc-nav selection (the discriminating control)
//   N1S4  no tab mounted — the doc-nav's legacy focus is the scope (the seam's
//         documented fallback, asserted so the row cannot be read as "the
//         doc-nav must be ignored")
//   N3S1  a one-op batch answered with an over-long array of JUNK entries
//   N3S2  a one-op batch answered with an over-long array of PLAUSIBLE entries
//   N3S3  a one-op batch answered with one entry that acknowledges ANOTHER op
//   N3S4  a one-op batch answered with exactly one agreeing entry (control)
//   N4S1  a FAILING commit in flight, the tab closed during the flight
//   N4S2  a fresh tab REUSING the drained subject id, then the failure resolving
//   N4S3  a SUCCEEDING commit in flight, the tab closed/abandoned during it
//   N4S4  a fresh dirty tab reusing that subject id when the success resolves
//   N4S5  a plain SWITCH during a succeeding commit (the other tab's dirty flag
//         is untouched — the control for the race rows)
// Fail-states covered: `FS19` (the silent-success class, both its
//   mis-acknowledgement form and its wrong-document form), `FS7` (a refusal /
//   partial-write class reached by the wrong scope), `FS17`'s carrier class (a
//   failure attached to a tab that never failed), `FS23`'s class (a page state
//   cleared/replaced by another tab's activity — the user's only copy), `FS16`'s
//   neighbour (text left dirty-and-uncommitted being silently marked clean).
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type CommitResult, type EditController } from '../src/renderer/edit-controller.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import type { RagNode, RagEdge, BatchOp, BatchOpResult, BatchResult } from '../src/main/rag-store.js'
import type { OperatorSettings } from '../src/shared/types.js'
import type { TabEntry, TabTarget } from '../src/renderer/tab-state.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { TabStrip } from '../src/renderer/tab-strip.js'

beforeAll(() => {
  installShim()
})

const DOC_1 = 'doc-1'
const DOC_3 = 'doc-3'

/** The typed `CommitFailure` record (§3.5 item 5 — the pinned five-member union). */
type CommitFailureRecord = {
  kind: 'not-authorized' | 'not-resident' | 'engine-unavailable' | 'store-rejected' | 'decompose-failed'
  message: string
  failedIndex?: number
  engineCause?: 'connection-refused' | 'engine-not-spawned' | 'not-ready' | 'unavailable-state'
}

const BATCH_ERROR = 'rag applyBatch: op not supported: setType at index 1'

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-01-01T00:00:00.000Z'
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function makeEdge(id: string, kind: RagEdge['kind'], source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = '2026-01-01T00:00:00.000Z'
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

/** Two documents, each with a head (`doc-head`) + one body block that its own
 *  `doc-child` edge scopes to it — so a commit scoped to the WRONG document
 *  either refuses (the marker disagreement) or writes into the other one, and
 *  both are observable. */
function fixtureNodes(): RagNode[] {
  return [
    makeNode(`${DOC_1}:head`, { type: 'h1', content: 'Doc 1' }),
    makeNode(`${DOC_1}:body`, { content: 'body one' }),
    makeNode(`${DOC_3}:head`, { type: 'h1', content: 'Doc 3' }),
    makeNode(`${DOC_3}:body`, { content: 'body three' }),
  ]
}

function fixtureEdges(): RagEdge[] {
  return [
    makeEdge(`e-${DOC_1}-head`, 'doc-head', `${DOC_1}:head`, DOC_1, { documentIds: [DOC_1] }),
    makeEdge(`e-${DOC_1}-next`, 'next-section', `${DOC_1}:head`, `${DOC_1}:body`, { documentIds: [DOC_1] }),
    makeEdge(`e-${DOC_1}-child`, 'doc-child', `${DOC_1}:head`, `${DOC_1}:body`, { order: 0, documentIds: [DOC_1] }),
    makeEdge(`e-${DOC_1}-end`, 'doc-end', `${DOC_1}:body`, DOC_1, { documentIds: [DOC_1] }),
    makeEdge(`e-${DOC_3}-head`, 'doc-head', `${DOC_3}:head`, DOC_3, { documentIds: [DOC_3] }),
    makeEdge(`e-${DOC_3}-next`, 'next-section', `${DOC_3}:head`, `${DOC_3}:body`, { documentIds: [DOC_3] }),
    makeEdge(`e-${DOC_3}-child`, 'doc-child', `${DOC_3}:head`, `${DOC_3}:body`, { order: 0, documentIds: [DOC_3] }),
    makeEdge(`e-${DOC_3}-end`, 'doc-end', `${DOC_3}:body`, DOC_3, { documentIds: [DOC_3] }),
  ]
}

function docTarget(documentId: string): TabTarget {
  return { kind: 'document', documentId }
}

function tabEntry(id: string, target: TabTarget, title = id): TabEntry {
  return { id, target, title }
}

/** The page the single surface renders (§2.1): the surface root names its OWN
 *  document (`data-edit-surface`), which is exactly what the committing scope
 *  must agree with (§11.10 item 4(b)). */
function pageHtml(documentId: string, bodyText: string): string {
  return (
    `<div id="page-edit-surface" data-edit-surface="${documentId}" contenteditable="true">` +
    `<h1 data-rag-node-id="${documentId}:head">${documentId === DOC_1 ? 'Doc 1' : 'Doc 3'}</h1>` +
    `<p data-rag-node-id="${documentId}:body">${bodyText}</p>` +
    `</div>`
  )
}
const EDITED_PAGE_1 = pageHtml(DOC_1, 'edited body one')

/** §3.3 item 6 — the acknowledged success arm: ONE `BatchOpResult` per op, in
 *  order, each agreeing with the op it acknowledges. */
function acknowledgeOps(ops: BatchOp[]): BatchOpResult[] {
  return ops.map((op): BatchOpResult => {
    switch (op.op) {
      case 'putNode':
        return { op: 'putNode', node: op.node }
      case 'removeNode':
        return { op: 'removeNode', removed: true }
      case 'putEdge':
        return { op: 'putEdge', edge: op.edge }
      case 'removeEdge':
        return { op: 'removeEdge', removed: true }
      case 'setProps':
        return { op: 'setProps', nodeId: op.nodeId, props: op.props }
      case 'setSubtree':
        return { op: 'setSubtree', nodeId: op.nodeId, children: op.children }
      case 'setType':
        return { op: 'setType', nodeId: op.nodeId, type: op.type }
    }
  })
}

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  editController: EditController
  strip: TabStrip
  batch: ReturnType<typeof vi.fn>
  /** What the bridge answers when a batch is RELEASED (a row mutates it). */
  answer: { run: (ops: BatchOp[]) => unknown }
  /** The pending (deferred) batch, when `defer` is on. */
  pending: { ops: BatchOp[] } | null
  release: (mode: 'ack' | 'fail' | 'junk') => void
}

async function makeHarness(opts: { defer?: boolean } = {}): Promise<Harness> {
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const fixture = createSnapshotStore(fixtureNodes(), fixtureEdges())
  const snapshot = vi.fn(async () => ({ store: 'main', nodes: fixture.listNodes(), edges: fixture.listEdges() }))

  const h: Harness = {
    host: null as never,
    runtime: null as never,
    editController: null as never,
    strip: null as never,
    batch: null as never,
    answer: { run: (ops: BatchOp[]) => ({ ok: true, results: acknowledgeOps(ops) }) },
    pending: null,
    release: () => {
      throw new Error('no deferred batch is pending')
    },
  }

  let resolvePending: ((r: BatchResult) => void) | null = null
  h.batch = vi.fn(async (ops: BatchOp[]): Promise<BatchResult> => {
    if (opts.defer === true) {
      h.pending = { ops }
      return new Promise<BatchResult>((resolve) => {
        resolvePending = (r) => {
          h.pending = null
          resolvePending = null
          resolve(r)
        }
      })
    }
    return h.answer.run(ops) as BatchResult
  })
  h.release = (mode: 'ack' | 'fail' | 'junk') => {
    const pending = h.pending
    if (pending == null || resolvePending == null) throw new Error('no deferred batch is pending — the commit never reached the seam')
    if (mode === 'fail') resolvePending({ ok: false, error: BATCH_ERROR, failedIndex: 0 })
    else if (mode === 'ack') resolvePending({ ok: true, results: acknowledgeOps(pending.ops) })
    else resolvePending({ ok: true, results: [{}, {}] })
  }

  const commitment = async (subject: string): Promise<CommitResult> => {
    const ops: BatchOp[] = [{ op: 'putNode', node: makeNode(`${subject}:page`) }]
    const result = (await h.batch(ops)) as BatchResult
    if (result != null && result.ok === true) return { ok: true, nodeId: subject }
    return { ok: false, reason: 'store-error' } as CommitResult
  }

  const state = { settings: { enabledPanes: [], defaultDocumentId: null, topK: 5, representationMode: 'html' } }
  const bridge = {
    security: { get: vi.fn(async () => ({ token: null, enabled: ['read', 'dispatch'] })) },
    edit: {
      onRagStoreChanged: vi.fn(() => () => {}),
      commitRich: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      batch: h.batch,
    },
    rag: {
      query: vi.fn(async () => ({ query: '', ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 })),
      snapshot,
      backlinks: vi.fn(async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
      docHeads: vi.fn(async () => ({
        documents: [
          { documentId: DOC_1, title: 'Doc 1', path: [], tags: [] },
          { documentId: DOC_3, title: 'Doc 3', path: [], tags: [] },
        ],
      })),
      stores: vi.fn(async () => ({ stores: [] })),
      manage: vi.fn(async () => ({ ok: true })),
    },
    template: {
      get: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      validate: vi.fn(async () => ({ ok: true })),
      set: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      create: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      delete: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      reset: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      onTemplateChanged: vi.fn(() => () => {}),
    },
    operatorSettings: {
      get: vi.fn(async () => ({ ...state.settings }) as unknown as OperatorSettings),
      set: vi.fn(async (patch: Record<string, unknown>) => {
        Object.assign(state.settings, patch)
        return { ...state.settings } as unknown as OperatorSettings
      }),
      onChanged: vi.fn(() => () => {}),
    },
  }

  const backRefs = new Map<string, string[]>()
  const onRebuild = vi.fn((kind?: unknown) => void h.host.reDerive(kind as never))
  h.editController = createEditController({ backRefs, commit: commitment, onRebuild })
  h.host = new SidebarPanes({
    mount,
    operatorMount,
    registry,
    bridge: bridge as never,
    backRefs,
    editController: h.editController,
  })
  h.runtime = new Runtime({
    mount,
    envelope: {
      template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
      content: [],
      clientConfig: { runInstantiation: true, runRendering: true },
    } as never,
  })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  await h.host.boot(h.runtime)

  // THE PRODUCTION STRIP: the tab ownership the renderer installs
  // (`renderer.ts` wires `TabStrip.onActiveChange` → `host.mountTab`), so a
  // close/switch here is the user's own path — including its closed-id drain.
  h.strip = new TabStrip({
    mount: null,
    getContext: () => ({
      hasStore: true,
      documents: [
        { documentId: DOC_1, title: 'Doc 1' },
        { documentId: DOC_3, title: 'Doc 3' },
      ],
    }),
    onActiveChange: (entry) => h.host.mountTab(entry),
  })
  return h
}

/** The page seam (`window.provident.sidebar`, §11.8 item 1). */
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

async function pageBlur(html: string): Promise<void> {
  const seam = sidebarApi().pageSurfaceBlur
  expect(typeof seam, 'the page seam sidebar.pageSurfaceBlur must be installed (§11.8 item 1)').toBe('function')
  ;(seam as (h: string) => void)(html)
  await flush()
}

/** The doc-nav handler's own seam (`pane-doc-nav-select` → `selectDocument`). */
function docNavSelect(id: string): void {
  const seam = sidebarApi().selectDocument
  expect(typeof seam, 'the doc-nav seam sidebar.selectDocument must be installed').toBe('function')
  ;(seam as (i: string) => void)(id)
}

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/** §3.5 item 6/§11.8 item 3 — the host's DECLARED per-subject failure reader. */
function pageCommitFailure(host: SidebarPanes, subject: string): CommitFailureRecord | string | undefined {
  const reader = (host as unknown as { pageEditSurfaceFailure?: (s: string) => CommitFailureRecord | string | undefined })
    .pageEditSurfaceFailure
  if (typeof reader !== 'function') return undefined
  return reader.call(host, subject)
}

/** U-STAGE-ACTIVE-TAB §5.3.3 — the stage/surface DOCUMENT SCOPE seam the commit
 *  must share (the sibling unit's own reader; read, never duplicated). */
function stageScope(host: SidebarPanes): string | null {
  const reader = (host as unknown as { stageDocumentScope?: () => string | null }).stageDocumentScope
  expect(typeof reader, 'the stage scope seam `stageDocumentScope()` must exist (U-STAGE-ACTIVE-TAB §5.3.3)').toBe('function')
  return reader!.call(host)
}

// ===========================================================================
// N1 — the commit scope must be the ACTIVE TAB's document, not the doc-nav focus
// ===========================================================================
describe('N1 (FS19/FS7) — a doc-nav selection never changes the commit scope of the mounted tab', () => {
  it('N1a — with doc-1 mounted and active, a doc-nav selection of doc-3 must not re-scope (or refuse) the doc-1 commit', async () => {
    const h = await makeHarness()
    h.strip.focus({ target: docTarget(DOC_1), newTab: true })
    const tabId = h.strip.active()!.id
    expect(stageScope(h.host), 'the mounted tab scopes the stage to its own document').toBe(DOC_1)

    // THE REPRO's precondition, asserted so the row cannot pass vacuously: the
    // doc-nav really DOES move `_currentDocumentId` (read through the host's own
    // context reader) — independently of the active tab.
    expect(h.host.getTabContext().lastFocusedDocumentId, 'the boot focus is doc-1').toBe(DOC_1)
    docNavSelect(DOC_3)
    expect(
      h.host.getTabContext().lastFocusedDocumentId,
      'the doc-nav selection moved the LEGACY current-document state to doc-3 (the repro is non-vacuous)',
    ).toBe(DOC_3)
    expect(stageScope(h.host), 'the mounted tab\'s stage scope is STILL doc-1 (`_currentDocumentId` is not a scope source)').toBe(DOC_1)

    // the user edits the page they are looking at (the doc-1 surface) and blurs
    pageInput()
    await pageBlur(EDITED_PAGE_1)

    expect(
      pageCommitFailure(h.host, tabId),
      'the doc-1 page commit must NOT be refused because the doc-nav names doc-3 (the page and the commit must agree on the ACTIVE TAB\'s document)',
    ).toBeUndefined()
    expect(
      h.batch.mock.calls.length,
      'the page differs from the store, so the ONE batch call must have been made (a refusal writes nothing — the user\'s edit can never commit)',
    ).toBe(1)
    const ops = h.batch.mock.calls[0][0] as BatchOp[]
    const named = JSON.stringify(ops)
    expect(named, 'the committed op list names the ACTIVE TAB\'s document blocks').toContain(`${DOC_1}:body`)
    expect(named, 'the commit must not write into the doc-nav document (doc-3)').not.toContain(`${DOC_3}:body`)
    expect(h.editController.isDirty(tabId), 'an acknowledged success clears the page (§3.4 step 5)').toBe(false)
  })

  it('N1b (CONTROL) — without a doc-nav selection the same page commits, and the seam\'s no-tab fallback still follows the doc-nav', async () => {
    const h = await makeHarness()
    h.strip.focus({ target: docTarget(DOC_1), newTab: true })
    const tabId = h.strip.active()!.id
    pageInput()
    await pageBlur(EDITED_PAGE_1)
    expect(h.batch.mock.calls.length, 'the same blur commits with no doc-nav interference (the harness path is live)').toBe(1)
    expect(pageCommitFailure(h.host, tabId), 'the control commits cleanly').toBeUndefined()
    expect(h.editController.isDirty(tabId)).toBe(false)

    // the seam's DOCUMENTED legacy fallback: with NO tab mounted the doc-nav
    // focus IS the scope (§5.3.3's boot/pre-tab state) — so the row above is
    // "the mounted tab wins", not "the doc-nav is ignored".
    h.host.mountTab(null)
    docNavSelect(DOC_3)
    expect(stageScope(h.host), 'with no tab mounted the doc-nav focus is the legacy scope').toBe(DOC_3)
  })
})

// ===========================================================================
// N3 — the acknowledgement must be exactly one agreeing result per op (FS19)
// ===========================================================================
describe('N3 (FS19) — an over-long or junk acknowledgement is NOT an acknowledged write', () => {
  const JUNK_DRAWS: { label: string; result: (ops: BatchOp[]) => unknown }[] = [
    { label: 'an over-long array of EMPTY objects (`[{}, {}]` for a one-op batch)', result: () => ({ ok: true, results: [{}, {}] }) },
    { label: 'an over-long array of `null`s', result: () => ({ ok: true, results: [null, null, null] }) },
    { label: 'an over-long array of plausible but WRONG-shaped entries', result: () => ({ ok: true, results: [{ op: 'putNode' }, { op: 'putNode' }, { op: 'putNode' }] }) },
    { label: 'a right-length array whose entry acknowledges ANOTHER op (a `removeNode` for a `putNode`)', result: () => ({ ok: true, results: [{ op: 'removeNode', removed: true }] }) },
    { label: 'a right-length array whose `putNode` entry names a DIFFERENT node id', result: () => ({ ok: true, results: [{ op: 'putNode', node: makeNode('some-other-node') }] }) },
  ]

  for (const draw of JUNK_DRAWS) {
    it(`N3 — ${draw.label} is a typed failure that KEEPS the dirty flag`, async () => {
      const h = await makeHarness()
      h.strip.focus({ target: docTarget(DOC_1), newTab: true })
      const tabId = h.strip.active()!.id
      pageInput()
      h.answer.run = draw.result
      await pageBlur(EDITED_PAGE_1)

      // NON-VACUITY: the commit really reached the seam with a non-empty op list
      // (an unchanged page would take the no-op path and never ask the bridge).
      expect(h.batch.mock.calls.length, 'the page differs from the store, so the batch seam WAS called').toBe(1)
      expect((h.batch.mock.calls[0][0] as BatchOp[]).length, 'the drawn page produces exactly one op').toBe(1)

      expect(
        h.editController.isDirty(tabId),
        'an unacknowledged `{ok:true}` must NOT clear the dirty flag (§3.6/`FS19`: the silent success)',
      ).toBe(true)
      const record = pageCommitFailure(h.host, tabId)
      expect(record, 'an unacknowledged write must record a typed failure for the tab (§3.5 item 5)').toBeDefined()
      expect((record as CommitFailureRecord).kind, 'the mis-acknowledged batch is the `store-rejected` class').toBe('store-rejected')
      expect(
        typeof (record as CommitFailureRecord).message === 'string' && (record as CommitFailureRecord).message.length > 0,
        'the typed failure carries a non-empty message',
      ).toBe(true)
    })
  }

  it('N3 (CONTROL) — exactly one agreeing result per op IS the acknowledged success', async () => {
    const h = await makeHarness()
    h.strip.focus({ target: docTarget(DOC_1), newTab: true })
    const tabId = h.strip.active()!.id
    pageInput()
    h.answer.run = (ops: BatchOp[]) => ({ ok: true, results: acknowledgeOps(ops) })
    await pageBlur(EDITED_PAGE_1)
    expect(h.batch.mock.calls.length, 'the control commit reached the seam').toBe(1)
    expect(h.editController.isDirty(tabId), 'the control clears the page (the row\'s oracle discriminates)').toBe(false)
    expect(pageCommitFailure(h.host, tabId), 'the control records no failure').toBeUndefined()
  })
})

// ===========================================================================
// N4 — an in-flight commit must not re-enter a DRAINED or REUSED subject
// ===========================================================================
describe('N4 (FS17/FS23) — a commit resolving after its tab was abandoned must be DISCARDED', () => {
  it('N4a — a FAILING commit in flight: closing the tab must not attach a failure to the drained/reused subject', async () => {
    const h = await makeHarness({ defer: true })
    h.strip.focus({ target: docTarget(DOC_1), newTab: true }) // tab-1
    h.strip.focus({ target: docTarget(DOC_1), newTab: true }) // tab-2
    const committed = h.strip.active()!.id
    expect(committed, 'the committing tab is the ACTIVE one').toBeTruthy()
    pageInput()
    await pageBlur(EDITED_PAGE_1)
    expect(h.pending, 'the commit is IN FLIGHT (the batch is deferred)').not.toBeNull()

    // the user closes the committing tab while the write is in flight
    h.strip.close(committed)
    expect(
      pageCommitFailure(h.host, committed),
      'the close drains the closed tab\'s page state (§11.8 item 3 — the pre-resolution state is clean)',
    ).toBeUndefined()

    // …and a FRESH tab REUSES the drained subject id (the strip's own id rule:
    // `nextTabId` = `open.length + 1`, skipped only while in use)
    const fresh = h.strip.focus({ target: docTarget(DOC_3), newTab: true })
    expect(h.strip.active()!.id, 'the fresh tab REUSES the drained id (the discriminating case)').toBe(committed)
    void fresh
    expect(pageCommitFailure(h.host, committed), 'the fresh tab starts with no failure record').toBeUndefined()

    // the in-flight FAILURE now resolves
    h.release('fail')
    await flush()
    await flush()

    expect(
      pageCommitFailure(h.host, committed),
      'a resolution of an ABANDONED commit must be discarded — it must never attach a `commit-failed` warning to the fresh tab (FS17\'s carrier class)',
    ).toBeUndefined()
  })

  it('N4b — a SUCCEEDING commit in flight: closing the tab must not clear a fresh tab\'s dirty flag', async () => {
    const h = await makeHarness({ defer: true })
    h.strip.focus({ target: docTarget(DOC_1), newTab: true }) // tab-1
    h.strip.focus({ target: docTarget(DOC_1), newTab: true }) // tab-2
    const committed = h.strip.active()!.id
    pageInput()
    await pageBlur(EDITED_PAGE_1)
    expect(h.pending, 'the commit is IN FLIGHT').not.toBeNull()

    h.strip.close(committed)
    h.strip.focus({ target: docTarget(DOC_3), newTab: true }) // reuses the drained id
    expect(h.strip.active()!.id, 'the fresh tab REUSES the drained id').toBe(committed)
    // the user types in the FRESH tab (its text is the only copy — §3.5 item 2)
    pageInput()
    expect(h.editController.isDirty(committed), 'the fresh tab is dirty with its own uncommitted text').toBe(true)

    // the in-flight SUCCESS now resolves
    h.release('ack')
    await flush()
    await flush()

    expect(
      h.editController.isDirty(committed),
      'the stale success must NOT clear the fresh tab\'s dirty flag (its text would never commit — `FS23`\'s class, `FS16`\'s neighbour)',
    ).toBe(true)
  })

  it('N4c (CONTROL) — a plain SWITCH during a succeeding commit drops the abandoned tab and leaves the other tab\'s state alone', async () => {
    const h = await makeHarness({ defer: true })
    h.strip.focus({ target: docTarget(DOC_1), newTab: true }) // tab-A
    const tabA = h.strip.active()!.id
    h.strip.focus({ target: docTarget(DOC_1), newTab: true }) // tab-B
    const tabB = h.strip.active()!.id
    // tab-A edits and commits (in flight), then the user switches to tab-B
    h.strip.activate(tabA)
    pageInput()
    await pageBlur(EDITED_PAGE_1)
    expect(h.pending, 'tab-A\'s commit is in flight').not.toBeNull()
    h.strip.activate(tabB)
    pageInput() // tab-B has its OWN uncommitted text
    expect(h.editController.isDirty(tabB)).toBe(true)

    h.release('ack')
    await flush()
    await flush()

    expect(h.editController.isDirty(tabA), 'the abandoned tab\'s own state is dropped by its acknowledged success (§3.4 step 5)').toBe(false)
    expect(h.editController.isDirty(tabB), 'the OTHER tab\'s dirty flag is untouched by tab-A\'s resolution (FS23\'s class)').toBe(true)
    expect(pageCommitFailure(h.host, tabB), 'the other tab gained no failure record').toBeUndefined()
  })
})
