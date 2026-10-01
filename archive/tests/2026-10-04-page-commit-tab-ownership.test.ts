// tests/page-commit-tab-ownership.test.ts — NEW red rows for the `C9 U-EDIT-1`
// whole-page-editing unit: the PAGE-COMMIT SUBJECT IS THE TAB, NOT THE DOCUMENT.
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md (spec text only —
// `src/**` was read for symbol names / call signatures, never for an expectation):
//   - §3.5 item 3 the dirty machine's states are **per tab**, exactly one at a
//     time (`clean` / `uncommitted` / `commit-failed` / `closing-dirty`); the
//     pinned source of that rule is `docs/specs/design-extensions-review.md`
//     §12.4 — "**all three dirty states are per tab (not per document)**".
//   - §3.5 item 6 the dirty / `commit-failed` state lives in HOST-SIDE state
//     **keyed by tab id** (`Map<tabId, failure>` in the `SidebarPanes` host),
//     never a rendered class/attribute (`FS17`), and a re-derive preserves it by
//     construction.
//   - §3.6 the store-unavailable commit sets the SAME per-tab carrier.
//   - §6.4 item 1 the content path passes the **tab id** ("one page dirty per
//     tab"); the `EditController` members/signatures are unchanged — only the
//     argument's MEANING moves.
//   - §11.8 item 1 `pageSurfaceInput()` "marks the PAGE dirty (one dirty page per
//     tab)"; `pageSurfaceBlur(html?)` performs the one-batch commit.
//   - §11.8 item 3 the carrier is "keyed by the same page subject the dirty
//     machinery is keyed by"; a successful commit **deletes** the entry, a failed
//     one **sets** it while the dirty flag is **kept**.
//   - §3.4 step 3 + §3.5 items 1/2 a failed commit leaves the store untouched,
//     KEEPS the page dirty and does not discard the user's text (`FS16`).
//   - §3.5 item 5 the typed `CommitFailure` record — `store-rejected` carries the
//     `BatchResult`'s `error`/`failedIndex` **verbatim**.
//
// RED: names the seam. The page-commit subject is reachable through PUBLIC seams
// today (`SidebarPanes.mountTab(entry)` carries the tab identity,
// `window.provident.sidebar.pageSurfaceInput`/`pageSurfaceBlur` drive the page
// state, `EditController.isDirty(tabId)` reads the dirty flag). The per-tab
// FAILURE RECORD has **no** public read yet: `SidebarPanes` declares
// `pageEditSurfaceFailure(subject)` (TS-private, no consumer — `C10 U-TAB-MERGE`'s
// `TAB-1` symbol is the intended one). These rows read through that DECLARED
// method via a typed cast (never private-field peeking); a rename of the method
// renames the helper below.
//
// REWRITTEN 2026-09-22 (RCA-3 ADVERSARIAL-FIX REMAND, finding 4). Two harness
// FICTIONS were removed:
//   1. the `backRefs` map no longer carries TAB IDS (it seeded `['tab-A',
//      ['doc-1:body']]` to satisfy `restoreCaret`'s guard — but `backRefs` is a
//      `Map<ragNodeId, nodeId[]>`, and no row here restores a caret: the
//      page-commit seam never goes through `EditController.commit`, and
//      `markDirty`/`isDirty` never consult `backRefs`);
//   2. the T5 close row no longer drives `mountTabs` (a seam with NO production
//      caller — `grep -rn mountTabs src/` finds only its definition and comments);
//      it drives the renderer's OWN close path: `TabStrip.close(id)` → `commit()`
//      → `onActiveChange(entry)` → `host.mountTab(entry)`.
//
// HARNESS FICTION REMOVED (same remand, batch-acknowledgement pass): the bridge
// stub returned `{ ok: true, results: [] }` for EVERY successful batch. The strict
// `BatchResult` contract (§3.3 item 6/§3.6 `FS19`: a success carries one
// acknowledged result PER OP, and a partial acknowledgement is NOT success) reads
// that as a partial write, so a SUCCESSFUL commit could not clear the page and T4
// failed for a harness reason. The stub now echoes one `BatchOpResult` per op it
// was SENT (`acknowledgeOps`), and the harness's injected `commit` reads success
// with the host's own strictness. No row was weakened: T4 additionally pins that
// the new tab's commit really reached the batch seam with a non-empty op list
// (so its `clean` is not the `P-TP-2` no-op path), and the failure arm stays a
// real `{ ok: false; error; failedIndex }` rejection.
//
// States enumerated (the state machine this file covers):
//   T1  one tab on doc-1: the page dirty flag is keyed by the TAB id, never the
//       document id
//   T2  two tabs on the SAME document: the page dirty state is not shared
//   T3  two tabs on the SAME document: the `commit-failed` record is not shared
//   T4  a tab switch + a successful commit on the NEW tab: the other tab's page
//       state (dirty flag AND failure record) is neither cleared nor overwritten
//   T5  a close: the closed tab's page state is dropped, no other tab's
//   T6  a failed page commit: the tab stays dirty and the typed `store-rejected`
//       record is recorded for THAT tab only
//   T7  a re-derive after a failure: the per-tab record survives and does not
//       migrate to another tab
// Fail-states covered: `FS17` (the per-tab state absent after a re-derive / keyed
//   off the tab), `FS19` (a failed commit reported as clean — a silent success),
//   and the `FS23` class (one tab's page state cleared/replaced by another tab's
//   activity — the user's only copy of that page's state discarded).
//
// The op list itself is the ADAPTER's (§3.1 `src/main/page-diff.ts`) and is NOT
// this file's subject: the harness's injected commit sends ONE `bridge.edit.batch`
// payload (the existing one-`applyBatch` seam, §3.3 items 1/2) so the harness owns
// the `BatchResult` the host must read (§3.3 item 6) — the `page-editor-host`
// harness convention, not a new one.
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

// ---------------------------------------------------------------------------
// fixture — two documents, so "same document, two tabs" and "two documents" are
// both expressible
// ---------------------------------------------------------------------------
const DOC_1 = 'doc-1'
const DOC_2 = 'doc-2'

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function makeEdge(id: string, kind: RagEdge['kind'], source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = new Date().toISOString()
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

function fixtureNodes(): RagNode[] {
  return [
    makeNode(`${DOC_1}:head`, { type: 'h1', content: 'Doc 1' }),
    makeNode(`${DOC_1}:body`, { type: 'p', content: 'body one' }),
    makeNode(`${DOC_2}:head`, { type: 'h1', content: 'Doc 2' }),
    makeNode(`${DOC_2}:body`, { type: 'p', content: 'body two' }),
  ]
}

function fixtureEdges(): RagEdge[] {
  return [
    makeEdge(`e-${DOC_1}-head`, 'doc-head', `${DOC_1}:head`, DOC_1, { documentIds: [DOC_1] }),
    makeEdge(`e-${DOC_1}-next`, 'next-section', `${DOC_1}:head`, `${DOC_1}:body`, { documentIds: [DOC_1] }),
    makeEdge(`e-${DOC_1}-end`, 'doc-end', `${DOC_1}:body`, DOC_1, { documentIds: [DOC_1] }),
    makeEdge(`e-${DOC_2}-head`, 'doc-head', `${DOC_2}:head`, DOC_2, { documentIds: [DOC_2] }),
    makeEdge(`e-${DOC_2}-next`, 'next-section', `${DOC_2}:head`, `${DOC_2}:body`, { documentIds: [DOC_2] }),
    makeEdge(`e-${DOC_2}-end`, 'doc-end', `${DOC_2}:body`, DOC_2, { documentIds: [DOC_2] }),
  ]
}

function docTarget(documentId: string): TabTarget {
  return { kind: 'document', documentId }
}

function tabEntry(id: string, target: TabTarget, title = id): TabEntry {
  return { id, target, title }
}

/** The two tabs of T2–T7: the SAME document in two tabs (the discriminating
 *  case — a document-keyed subject cannot tell them apart). */
const TAB_A = tabEntry('tab-A', docTarget(DOC_1), 'Doc 1 (A)')
const TAB_B = tabEntry('tab-B', docTarget(DOC_1), 'Doc 1 (B)')

// ---------------------------------------------------------------------------
// §3.5 item 5 — the typed `CommitFailure` record (the pinned five-member union)
// ---------------------------------------------------------------------------
type CommitFailureRecord = {
  kind: 'not-authorized' | 'not-resident' | 'engine-unavailable' | 'store-rejected' | 'decompose-failed'
  message: string
  failedIndex?: number
  engineCause?: 'connection-refused' | 'engine-not-spawned' | 'not-ready' | 'unavailable-state'
}

/** The `BatchResult` failure the harness injects (§3.3 item 6). */
const BATCH_ERROR = 'rag applyBatch: op not supported: setType at index 1'
const BATCH_FAILED_INDEX = 1

/** §3.3 item 6 / §3.6 (`FS19`) — the ACKNOWLEDGED success arm of a `BatchResult`:
 *  `rag-store.ts` pins it as "one `BatchOpResult` per op, in order", and the host
 *  reads success ONLY through that acknowledgement (`isAcknowledgedBatch`: boolean
 *  `ok` **and** at least one result per op — a bare `{ ok: true }` or a PARTIAL
 *  acknowledgement is a silent partial write, never success).
 *
 *  So the harness bridge ECHOES one result per op of the payload it was SENT —
 *  never a hard-coded count and never `results: []`. A stub that acknowledged
 *  fewer results than ops (the previous `{ ok: true, results: [] }` for a one-op
 *  batch) made a SUCCESSFUL commit unreadable as success, so a row asserting "the
 *  other tab's state survives this tab's success" would have failed for a harness
 *  reason, not a production one.
 *
 *  The per-op shapes mirror `applyBatchOp`'s own results: the applied record is
 *  echoed for `putNode`/`putEdge`, and `removed: true` for a removal — the page
 *  diff only emits `removeNode`/`removeEdge` for a block that WAS resident in the
 *  snapshot it diffed against (`src/main/page-diff.ts`), so the removal hits. */
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

// ---------------------------------------------------------------------------
// harness (the `page-editor-host` / `unit-u-shell-9b-blind-greens` conventions:
// dom shim + the real `Runtime` + a `SidebarPanes` host over a bridge stub)
// ---------------------------------------------------------------------------
interface Harness {
  host: SidebarPanes
  runtime: Runtime
  editController: EditController
  backRefs: Map<string, string[]>
  batch: ReturnType<typeof vi.fn>
  /** The injected `BatchResult` failure (null ⇒ the batch succeeds). */
  fail: { message: string; failedIndex: number } | null
}

async function makeHarness(): Promise<Harness> {
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()

  // The snapshot the host boots from: two documents with real doc-head edges
  // (`deriveDocumentIds` reads the `doc-head` edges), so `mountTab` takes the
  // SYNCHRONOUS scoped render path. Every row mounts through `mountTab` — the
  // seam `src/renderer/renderer.ts` drives (`TabStrip.onActiveChange` → host) —
  // never through the unreachable `mountTabs` open-set seam.
  const fixture = createSnapshotStore(fixtureNodes(), fixtureEdges())
  const snapshot = vi.fn(async () => ({
    store: 'main',
    nodes: fixture.listNodes(),
    edges: fixture.listEdges(),
  }))

  const h: Harness = {
    host: null as never,
    runtime: null as never,
    editController: null as never,
    backRefs: new Map<string, string[]>([
      // §6.4 item 1 — the content path's subject is the TAB id. NOTHING is seeded
      // here, and that is deliberate: `edit-controller.ts` consults `backRefs`
      // ONLY in `commit` (the deleted-node guard) and `restoreCaret` (the dangling
      // caret guard) — `markDirty`/`clearDirty`/`isDirty` never read it — and the
      // PAGE-COMMIT seam does not go through `EditController.commit` at all
      // (`pageSurfaceBlur` → `commitPageEdit` → `clearPageState`/`recordPageFailure`).
      // An earlier form of this harness seeded the TAB IDS into this map (e.g.
      // `['tab-A', ['doc-1:body']]`) purely to satisfy `restoreCaret`'s guard: that
      // was HARNESS FICTION — `backRefs` is a `Map<ragNodeId, nodeId[]>` of RAG
      // nodes, and a tab id is not a RAG node id (the exact drift the tab-ownership
      // audit's V3 records). A row that needs the caret path must seed a real RAG
      // node id, never a tab id.
    ]),
    batch: null as never,
    fail: null,
  }

  h.batch = vi.fn(async (ops: BatchOp[]): Promise<BatchResult> => {
    // the failure arm is a REAL rejection (`{ ok: false; error; failedIndex }`),
    // never an unacknowledged success (§3.5 item 5 reads `error`/`failedIndex`
    // verbatim off this arm).
    if (h.fail != null) return { ok: false, error: h.fail.message, failedIndex: h.fail.failedIndex }
    // the success arm acknowledges EVERY op it was sent (§3.3 item 6/`FS19`).
    return { ok: true, results: acknowledgeOps(ops) }
  })

  // The injected commit: ONE `bridge.edit.batch` payload (the existing
  // `IPC_EDIT_BATCH` seam, §3.3 items 1/2), whose `BatchResult` the host must
  // read (§3.3 item 6). The failure arm forwards the `BatchResult`'s
  // `error`/`failedIndex` so the typed `store-rejected` record (§3.5 item 5) is
  // expressible verbatim. Success is read with the SAME strictness the host uses
  // (§3.6/`FS19`: one acknowledged result per op), never a bare `ok`.
  const commit = async (subject: string, html: string): Promise<CommitResult> => {
    void html
    const ops: BatchOp[] = [{ op: 'putNode', node: makeNode(`${subject}:page`) }]
    const result = (await h.batch(ops)) as BatchResult
    if (result.ok === true && result.results.length >= ops.length) return { ok: true, nodeId: subject }
    const failure = result.ok === false ? result : { error: 'unacknowledged batch (no per-op result)', failedIndex: 0 }
    return { ok: false, reason: 'store-error', error: failure.error, failedIndex: failure.failedIndex } as CommitResult
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
          { documentId: DOC_2, title: 'Doc 2', path: [], tags: [] },
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

  const onRebuild = vi.fn((kind?: unknown) => void h.host.reDerive(kind as never))
  h.editController = createEditController({ backRefs: h.backRefs, commit, onRebuild })
  h.host = new SidebarPanes({
    mount,
    operatorMount,
    registry,
    bridge: bridge as never,
    backRefs: h.backRefs,
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
  return h
}

// ---------------------------------------------------------------------------
// the PAGE seam (`window.provident.sidebar`, §11.8 item 1) — the only way a page
// edit / a page commit reaches the host
// ---------------------------------------------------------------------------
function sidebarApi(): Record<string, (...args: unknown[]) => unknown> {
  const w = (globalThis as unknown as { window?: { provident?: { sidebar?: unknown } } }).window
  const sidebar = w?.provident?.sidebar
  if (sidebar == null) throw new Error('window.provident.sidebar not installed (the page seam must be installed at boot)')
  return sidebar as Record<string, (...args: unknown[]) => unknown>
}

/** `page-edit-surface-input` → `pageSurfaceInput()`: mark the PAGE dirty. */
function pageInput(): void {
  const seam = sidebarApi().pageSurfaceInput
  expect(typeof seam, 'the page seam sidebar.pageSurfaceInput must be installed (§11.8 item 1)').toBe('function')
  ;(seam as () => void)()
}

/** `page-edit-surface-blur` → `pageSurfaceBlur(html)`: the page commit. */
async function pageBlur(html: string): Promise<void> {
  const seam = sidebarApi().pageSurfaceBlur
  expect(typeof seam, 'the page seam sidebar.pageSurfaceBlur must be installed (§11.8 item 1)').toBe('function')
  ;(seam as (h: string) => void)(html)
  // the seam is `void …then(...)` — settle the commit before reading the state
  await flush()
}

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/** RED: names the seam — §3.5 item 6/§11.8 item 3 pin the per-tab failure record
 *  as host-side state, and the host DECLARES `pageEditSurfaceFailure(subject)`
 *  (TS-private; `C10 U-TAB-MERGE` is its intended consumer). Read through that
 *  declared method, never a private field. */
function pageCommitFailure(host: SidebarPanes, subject: string): CommitFailureRecord | string | undefined {
  const reader = (host as unknown as {
    pageEditSurfaceFailure?: (s: string) => CommitFailureRecord | string | undefined
  }).pageEditSurfaceFailure
  if (typeof reader !== 'function') return undefined
  return reader.call(host, subject)
}


// ===========================================================================
// T1 — the subject is the ACTIVE TAB, not the document (§3.5 item 6, §6.4 item 1)
// ===========================================================================
describe('§3.5 item 6 / §6.4 item 1 — the page-commit subject is the ACTIVE TAB id', () => {
  it('T1 — a page edit marks the ACTIVE TAB dirty, and NEVER the document id', async () => {
    const h = await makeHarness()
    h.host.mountTab(TAB_A)
    pageInput()
    expect(
      h.editController.isDirty(TAB_A.id),
      'the page dirty flag must be keyed by the ACTIVE TAB id (§6.4 item 1: the content path passes the tab id)',
    ).toBe(true)
    expect(
      h.editController.isDirty(DOC_1),
      'the DOCUMENT id must NOT be the page subject — a second tab on the same document would silently share it',
    ).toBe(false)
  })
})

// ===========================================================================
// T2/T3 — two tabs on the SAME document share neither state (§12.4 "per tab")
// ===========================================================================
describe('§3.5 item 3 / design-extensions-review §12.4 — the states are per tab, not per document', () => {
  it('T2 — two tabs on the SAME document do not share the page dirty state', async () => {
    const h = await makeHarness()
    h.host.mountTab(TAB_A)
    pageInput()
    expect(h.editController.isDirty('tab-A'), 'the edited tab is dirty').toBe(true)
    expect(h.editController.isDirty('tab-B'), 'the OTHER tab on the same document is NOT dirty (no sharing)').toBe(false)

    // switching to the sibling tab must not move or clear the page state
    h.host.mountTab(TAB_B)
    expect(h.editController.isDirty('tab-A'), "tab-A's own page state survives the tab switch").toBe(true)
    expect(h.editController.isDirty('tab-B'), 'tab-B has no edit of its own').toBe(false)
  })

  it('T3 — two tabs on the SAME document do not share a page-commit failure', async () => {
    const h = await makeHarness()
    h.host.mountTab(TAB_A)
    pageInput()
    h.fail = { message: BATCH_ERROR, failedIndex: BATCH_FAILED_INDEX }
    await pageBlur('<p>edited in tab-A</p>')

    expect(pageCommitFailure(h.host, 'tab-A'), 'the failed tab carries the failure record').toBeDefined()
    expect(
      pageCommitFailure(h.host, 'tab-B'),
      'the OTHER tab on the same document carries NO failure record (a shared document id must not share it)',
    ).toBeUndefined()
    expect(h.editController.isDirty('tab-A'), 'a failed commit KEEPS the tab dirty (§3.5 items 1/2)').toBe(true)
    expect(h.editController.isDirty('tab-B'), 'tab-B was never edited').toBe(false)
  })
})

// ===========================================================================
// T4 — a tab switch + a commit on the new tab never clears/overwrites the other
// ===========================================================================
describe('§3.5 items 3/6 — another tab\'s commit neither clears nor overwrites this tab\'s page state', () => {
  it('T4 — committing on the NEW tab leaves the other tab dirty with its own failure record verbatim', async () => {
    const h = await makeHarness()

    // tab-A: edited, then a FAILED commit → dirty + failure record
    h.host.mountTab(TAB_A)
    pageInput()
    h.fail = { message: BATCH_ERROR, failedIndex: BATCH_FAILED_INDEX }
    await pageBlur('<p>edited in tab-A</p>')
    const failureA = pageCommitFailure(h.host, 'tab-A')
    expect(failureA, 'tab-A must carry its own failure record before the switch').toBeDefined()
    expect(h.editController.isDirty('tab-A')).toBe(true)

    // switch to tab-B and commit there SUCCESSFULLY
    h.host.mountTab(TAB_B)
    pageInput()
    h.fail = null
    await pageBlur('<p>edited in tab-B</p>')

    // NON-VACUITY: the tab-B commit really went through the batch seam with a
    // non-empty op list, so `clean` below is the ACKNOWLEDGED-success path
    // (§3.3 item 6 — one result per op) and NOT the `P-TP-2` no-op path, which
    // would clear the page without ever asking the bridge.
    const payloads = h.batch.mock.calls.map((call) => call[0] as BatchOp[])
    expect(payloads.length, 'both commits (tab-A\'s failure and tab-B\'s success) reached the batch seam').toBe(2)
    expect(payloads[1].length, "tab-B's page really diffed to at least one op (non-vacuous)").toBeGreaterThan(0)

    expect(h.editController.isDirty('tab-B'), "tab-B's own successful commit clears ITS page").toBe(false)
    expect(
      h.editController.isDirty('tab-A'),
      "tab-A is STILL dirty — another tab's success must not clear it (FS23's class: the page state is not replaced)",
    ).toBe(true)
    expect(
      pageCommitFailure(h.host, 'tab-A'),
      "tab-A's failure record is untouched by tab-B's success (§11.8 item 3: a success deletes only ITS entry)",
    ).toEqual(failureA)
  })
})

// ===========================================================================
// T5 — a close drops that tab's page state and no other tab's
// ===========================================================================
describe('§3.5 item 3 / §11.8 item 3 — a close drops ONLY the closed tab\'s page state', () => {
  it('T5 — closing a tab through the STRIP\'s own seam drops that tab\'s page state and leaves the other tab\'s intact', async () => {
    const h = await makeHarness()
    // THE PRODUCTION CLOSE SEAM. `TabStrip.close(id)` → `commit()` →
    // `onActiveChange(active)` → `host.mountTab(entry)` is the EXACT wiring
    // `src/renderer/renderer.ts` installs (the strip never tells the host "tab X
    // closed" — the host observes only the new active entry, see the
    // tab-ownership audit's §1.1). The previous form of this row called
    // `host.mountTabs(remaining)`, an OPEN-SET seam whose only caller in the tree
    // is the test itself (`grep -rn mountTabs src/`: definition + comments only) —
    // so it measured a path no user can reach.
    const strip = new TabStrip({
      mount: null,
      getContext: () => ({ hasStore: true, documents: [{ documentId: DOC_1, title: 'Doc 1' }] }),
      onActiveChange: (entry) => h.host.mountTab(entry),
    })
    // two tabs on the SAME document, opened through the strip's own seams (the
    // discriminating case: a document-keyed subject cannot tell them apart)
    strip.focus({ target: docTarget(DOC_1), newTab: true })
    strip.focus({ target: docTarget(DOC_1), newTab: true })
    const open = strip.getState().open
    expect(open.length, 'the strip must hold the two tabs this row closes through it').toBe(2)
    const [tabA, tabB] = open

    strip.activate(tabA.id)
    pageInput()
    h.fail = { message: 'failure-in-A', failedIndex: 0 }
    await pageBlur('<p>tab-A text</p>')

    strip.activate(tabB.id)
    pageInput()
    h.fail = { message: 'failure-in-B', failedIndex: 1 }
    await pageBlur('<p>tab-B text</p>')

    // pre-close: BOTH tabs hold their OWN page state
    expect(h.editController.isDirty(tabA.id), 'tab-A is dirty in its own right').toBe(true)
    expect(h.editController.isDirty(tabB.id), 'tab-B is dirty in its own right').toBe(true)
    const failureA = pageCommitFailure(h.host, tabA.id)
    const failureB = pageCommitFailure(h.host, tabB.id)
    expect(failureA, "tab-A's record").toBeDefined()
    expect(failureB, "tab-B's record").toBeDefined()
    expect(failureA, 'the two tabs carry DISTINCT records (not one shared document-keyed record)').not.toEqual(failureB)

    // THE CLOSE — through the strip, exactly as a user's click on the tab's × does
    strip.close(tabA.id)

    expect(
      h.editController.isDirty(tabA.id),
      "the closed tab's page state is dropped by the PRODUCTION close path (no leak — §3.5 item 3)",
    ).toBe(false)
    expect(pageCommitFailure(h.host, tabA.id), "the closed tab's failure record is dropped").toBeUndefined()
    expect(h.editController.isDirty(tabB.id), "no other tab's page state is dropped by the close").toBe(true)
    expect(pageCommitFailure(h.host, tabB.id), "the other tab's record survives the close verbatim").toEqual(failureB)
    expect(strip.active()?.id, 'the surviving tab is the active one after the close').toBe(tabB.id)
  })
})

// ===========================================================================
// T6 — a failed commit: dirty KEPT + the typed record, for that tab only
// ===========================================================================
describe('§3.5 items 1/2/5 — a failed page commit is loud, typed and tab-scoped', () => {
  it('T6 — the tab stays dirty and the typed `store-rejected` record carries the BatchResult verbatim, for that tab only', async () => {
    const h = await makeHarness()
    h.host.mountTab(TAB_A)
    pageInput()
    h.fail = { message: BATCH_ERROR, failedIndex: BATCH_FAILED_INDEX }
    await pageBlur('<p>the text that must survive</p>')

    // §3.5 item 1/2 — the failure is checked (never assumed, §3.3 item 6) and the
    // page stays dirty (FS19: a failure reported as clean is a silent success).
    expect(h.editController.isDirty('tab-A'), 'a failed commit keeps the tab dirty (FS19)').toBe(true)

    const record = pageCommitFailure(h.host, 'tab-A')
    expect(record, 'the typed failure record must be recorded for the tab').toBeDefined()
    expect(
      typeof record,
      'the record is the TYPED CommitFailure (§3.5 item 5), not a bare message string',
    ).toBe('object')
    const typed = record as CommitFailureRecord
    expect(typed.kind, "a rejected batch is the `store-rejected` kind (§3.5 item 5)").toBe('store-rejected')
    expect(typed.message, "the BatchResult's `error` is carried VERBATIM (§3.5 item 5)").toBe(BATCH_ERROR)
    expect(typed.failedIndex, "the BatchResult's `failedIndex` is carried VERBATIM (§3.5 item 5)").toBe(BATCH_FAILED_INDEX)

    // tab-scoped: no other tab and no document-keyed subject holds it
    expect(pageCommitFailure(h.host, 'tab-B'), 'no other tab holds the failure record').toBeUndefined()
    expect(h.editController.isDirty('tab-B'), 'no other tab is dirtied by this tab\'s failure').toBe(false)
    expect(h.editController.isDirty(DOC_1), 'the DOCUMENT id is never the page subject').toBe(false)
  })
})

// ===========================================================================
// T7 — the per-tab record survives a re-derive and does not migrate (FS17)
// ===========================================================================
describe('§3.5 item 6 / FS17 — the per-tab page state survives every re-derive', () => {
  it('T7 — a re-derive preserves the failing tab\'s record verbatim and never migrates it to the other tab', async () => {
    const h = await makeHarness()
    h.host.mountTab(TAB_A)
    pageInput()
    h.fail = { message: BATCH_ERROR, failedIndex: BATCH_FAILED_INDEX }
    await pageBlur('<p>tab-A text</p>')

    const before = pageCommitFailure(h.host, 'tab-A')
    expect(before, 'the failing tab carries its record before the re-derive').toBeDefined()
    expect(h.editController.isDirty('tab-A')).toBe(true)

    await h.host.reDerive('content')

    expect(
      pageCommitFailure(h.host, 'tab-A'),
      'the re-derive preserves the per-tab record by construction (FS17: a warning lost on a re-derive is the fail-state)',
    ).toEqual(before)
    expect(h.editController.isDirty('tab-A'), 'the failing tab is still dirty after the re-derive').toBe(true)
    expect(pageCommitFailure(h.host, 'tab-B'), 'the record does NOT migrate to the sibling tab').toBeUndefined()
    expect(h.editController.isDirty('tab-B'), 'the sibling tab is still clean').toBe(false)
  })
})
