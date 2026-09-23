// tests/page-commit-failure-visibility.test.ts — NEW red rows for the RCA-3
// ADVERSARIAL-FIX REMAND on `C9 U-EDIT-1`, findings 2 and 5 (plus the
// host-driven half of the PBT vacuity set: `P-SM-1`, `P-SM-2`, `P-TP-2`).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md (the spec text is
// the contract; `src/**` was read for symbol names / call signatures only):
//   - §3.3 item 6 "The result is CHECKED, never assumed. `BatchResult` is
//     discriminated (`{ ok: true; results } | { ok: false; error; failedIndex }`)
//     and `applyBatch` never throws for a domain failure". A commit path that
//     ignores `ok` is `FS12`; `src/main/rag-store.ts` pins the success arm as
//     "one `BatchOpResult` per op, in order".
//   - §3.6 / `FS19` "A commit that reports success without an acknowledged write
//     is the worst outcome in this unit" — the "clean with an unchanged entry"
//     case the read model forbids (`unit-reads-pivot-tab-cache.md` §7
//     `P-SM-3`). So `{ ok: true }` with no acknowledgement, or a PARTIAL
//     acknowledgement (fewer `results` than ops), is NOT success.
//   - §3.5 item 5 the typed `CommitFailure` — `store-rejected` carries the
//     `BatchResult`'s `error`/`failedIndex` **verbatim** (§11.8 item 3: the map
//     entry is SET on failure while the dirty flag is KEPT); `engine-unavailable`
//     carries the cause of `EngineUnavailable` (`src/main/engine-rag-store.ts`,
//     whose `cause` discriminates exactly `connection-refused` /
//     `engine-not-spawned` / `not-ready` / `unavailable-state`) — a fabricated
//     `failedIndex` or a fabricated engine cause is not the verbatim record.
//   - §3.5 item 3/4 + §3.6 the tab enters `commit-failed` and the failure is
//     USER-VISIBLE (`TAB-1`'s class): the host carries the record in host-side
//     state AND re-authors it into the app graph (`pageCommitWarningContent`),
//     so the failure is visible to the operator and to the MCP surface
//     (`provident.get_rendered_html` — in node, `Runtime.renderedHtmlResult()`
//     over the dom-shim, the documented equivalent; RCA-12).
//   - §3.5 item 6 the warning SURVIVES a re-derive (host-side state, never DOM),
//     and §3.4 step 5 / §11.8 item 3 a SUCCESS deletes the entry.
//   - §7's amended rows: `P-SM-1` must CONSTRUCT the `commit-failed` state and
//     observe the typed record for every failure kind the commit path owns;
//     `P-SM-2` must carry a DISCRIMINATING WITNESS (a concurrently `clean` and a
//     concurrently `uncommitted` tab) and drive a REAL re-derive with the warning
//     read from the assembled envelope; `P-TP-2` needs the HOST-PATH negative (an
//     unchanged page ⇒ ZERO `edit.batch` calls).
//
// States enumerated (the state machine this file covers):
//   C1  a batch answer with no acknowledgement (`{ok:true}`, `results` missing)
//   C2  a PARTIAL acknowledgement (`results` shorter than the op list)
//   C3  an absent / malformed batch answer (`undefined`, `null`, `{}`, `{ok:'yes'}`)
//   C4  a REJECTING bridge (the engine-absent class, with its own cause)
//   C5  an acknowledged success (`results` per op) — the control
//   W1  a failed commit — the warning is authored in the graph
//   W2  a re-derive while the failed tab is active — the warning survives
//   W3  a later SUCCESSFUL commit — the warning disappears
//   W4  witness tabs in the SAME draw: `clean` and `uncommitted`
//   T1  an unchanged page — ZERO `edit.batch` calls (the `P-TP-2` negative)
//   T2  one compared-field change — exactly ONE `edit.batch` call (the control)
// Fail-states covered: `FS12` (the commit ignored/under-read the `BatchResult`),
//   `FS19` (a success reported without an acknowledged write — the silent
//   success), `FS17` (the warning absent after a re-derive / DOM-only),
//   `FS16`'s neighbour (a failed commit that cleared the page state), and the
//   per-tab carrier's scope (§3.5 item 6).
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type CommitResult, type EditController } from '../src/renderer/edit-controller.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import { EngineUnavailable } from '../src/main/engine-rag-store.js'
import type { RagNode, RagEdge, BatchOp, BatchResult } from '../src/main/rag-store.js'
import type { OperatorSettings } from '../src/shared/types.js'
import type { TabEntry } from '../src/renderer/tab-state.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

beforeAll(() => {
  installShim()
})

const DOC_1 = 'doc-1'

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-01-01T00:00:00.000Z'
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function makeEdge(id: string, kind: RagEdge['kind'], source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = '2026-01-01T00:00:00.000Z'
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

function fixtureNodes(): RagNode[] {
  return [
    makeNode(`${DOC_1}:head`, { type: 'h1', content: 'Doc 1' }),
    makeNode(`${DOC_1}:body`, { content: 'body one' }),
    makeNode('sec-1', { type: 'div', content: '' }),
  ]
}

function fixtureEdges(): RagEdge[] {
  return [
    makeEdge(`e-${DOC_1}-head`, 'doc-head', `${DOC_1}:head`, DOC_1, { documentIds: [DOC_1] }),
    makeEdge(`e-${DOC_1}-next`, 'next-section', `${DOC_1}:head`, `${DOC_1}:body`, { documentIds: [DOC_1] }),
    makeEdge('e-sec-body', 'doc-child', 'sec-1', `${DOC_1}:body`, { order: 0, documentIds: [DOC_1] }),
    makeEdge(`e-${DOC_1}-end`, 'doc-end', 'sec-1', DOC_1, { documentIds: [DOC_1] }),
  ]
}

function tabEntry(id: string, documentId = DOC_1): TabEntry {
  return { id, target: { kind: 'document', documentId }, title: id }
}

// ---------------------------------------------------------------------------
// the page the surface renders (§2.1: the surface root carries
// `id = page-edit-surface` + `data-edit-surface = <documentId>` +
// `contenteditable`, and the doc-head/body blocks hang inside it)
// ---------------------------------------------------------------------------
function pageHtml(bodyText: string): string {
  return (
    `<div id="page-edit-surface" data-edit-surface="${DOC_1}" contenteditable="true">` +
    `<h1 data-rag-node-id="${DOC_1}:head">Doc 1</h1>` +
    `<p data-rag-node-id="${DOC_1}:body">${bodyText}</p>` +
    `</div>`
  )
}
/** The page equal to the store (⇒ an EMPTY op list ⇒ no batch at all). */
const UNCHANGED_PAGE = pageHtml('body one')
/** The same page with ONE compared-field change (⇒ exactly one op). */
const EDITED_PAGE = pageHtml('edited text')

/** The typed `CommitFailure` record (§3.5 item 5 — the pinned five-member union). */
type CommitFailureRecord = {
  kind: 'not-authorized' | 'not-resident' | 'engine-unavailable' | 'store-rejected' | 'decompose-failed'
  message: string
  failedIndex?: number
  engineCause?: 'connection-refused' | 'engine-not-spawned' | 'not-ready' | 'unavailable-state'
}
const FAILURE_KINDS: CommitFailureRecord['kind'][] = [
  'not-authorized',
  'not-resident',
  'engine-unavailable',
  'store-rejected',
  'decompose-failed',
]

const BATCH_ERROR = 'rag applyBatch: op not supported: setType at index 1'
const BATCH_FAILED_INDEX = 1

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  editController: EditController
  mount: { innerHTML: string }
  batch: ReturnType<typeof vi.fn>
  /** What the bridge's `edit.batch` answers next (a row mutates `run`; the
   *  `batch` spy stays in place so the CALL COUNT is always measurable). */
  behaviour: { run: (ops: BatchOp[]) => unknown }
  bridge: { edit: { batch?: (ops: BatchOp[]) => Promise<BatchResult> } } & Record<string, unknown>
}

async function makeHarness(opts: { snapshotFails?: boolean } = {}): Promise<Harness> {
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const fixture = createSnapshotStore(fixtureNodes(), fixtureEdges())
  const snapshot = vi.fn(async () => {
    if (opts.snapshotFails === true) throw new Error('no resident store')
    return { store: 'main', nodes: fixture.listNodes(), edges: fixture.listEdges() }
  })
  const behaviour: Harness['behaviour'] = {
    run: (ops: BatchOp[]) => ({ ok: true, results: ops.map((op) => (op.op === 'putNode' ? { op: 'putNode', node: op.node } : { op: op.op })) }),
  }
  const batch = vi.fn(async (ops: BatchOp[]): Promise<BatchResult> => behaviour.run(ops) as BatchResult)
  const state = { settings: { enabledPanes: [], defaultDocumentId: null, topK: 5, representationMode: 'html' } }
  const bridge = {
    security: { get: vi.fn(async () => ({ token: null, enabled: ['read', 'dispatch'] })) },
    edit: {
      onRagStoreChanged: vi.fn(() => () => {}),
      commitRich: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      batch,
    },
    rag: {
      query: vi.fn(async () => ({ query: '', ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 })),
      snapshot,
      backlinks: vi.fn(async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
      docHeads: vi.fn(async () => ({ documents: [{ documentId: DOC_1, title: 'Doc 1', path: [], tags: [] }] })),
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
  const commit = async (subject: string): Promise<CommitResult> => {
    const result = (await batch([{ op: 'putNode', node: makeNode(`${subject}:page`) }])) as BatchResult
    if (result != null && result.ok === true) return { ok: true, nodeId: subject }
    return { ok: false, reason: 'store-error' } as CommitResult
  }
  const editController = createEditController({ backRefs, commit, onRebuild: vi.fn() })
  const host = new SidebarPanes({
    mount,
    operatorMount,
    registry,
    bridge: bridge as never,
    backRefs,
    editController,
  })
  const runtime = new Runtime({
    mount,
    envelope: {
      template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
      content: [],
      clientConfig: { runInstantiation: true, runRendering: true },
    } as never,
  })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  await host.boot(runtime)
  return { host, runtime, editController, mount: mount as unknown as { innerHTML: string }, batch, behaviour, bridge: bridge as never }
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

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/** §3.5 item 6/§11.8 item 3 — the per-tab failure record is host-side state;
 *  read through the host's DECLARED reader (TS-private; `C10 U-TAB-MERGE` is its
 *  intended consumer), never a private-field peek. */
function failureOf(host: SidebarPanes, subject: string): CommitFailureRecord | string | undefined {
  const reader = (host as unknown as {
    pageEditSurfaceFailure?: (s: string) => CommitFailureRecord | string | undefined
  }).pageEditSurfaceFailure
  if (typeof reader !== 'function') return undefined
  return reader.call(host, subject)
}

/** The MCP `provident.get_rendered_html` surface, read in node (RCA-12): the
 *  rendered graph the assembled envelope produced. */
function renderedHtml(h: Harness): string {
  return h.runtime.renderedHtmlResult().renderedHtml
}

/** The authored `commit-failed` warning (§3.5 item 4 — the `TAB-1` class's stage
 *  half, authored by `pageCommitWarningContent`). */
function warningPresent(h: Harness): boolean {
  const html = renderedHtml(h)
  return html.includes('page-commit-warning') && html.includes('commit-failed')
}

// ===========================================================================
// C1/C2 — an unacknowledged / partial batch must NOT read as success (FS19)
// ===========================================================================
describe('§3.3 item 6 / §3.6 (FS19) — a commit reads an ACKNOWLEDGED batch result, never `ok` alone', () => {
  it('C1 — `{ok:true}` with no acknowledgement is NOT success: the dirty flag and a typed failure are kept', async () => {
    const h = await makeHarness()
    h.host.mountTab(tabEntry('tab-1'))
    pageInput()
    // the bridge reports a bare `{ ok: true }` — no `results`, i.e. NO
    // acknowledged write (§3.6: "a commit that reports success without an
    // acknowledged write is the worst outcome in this unit", `FS19`).
    h.behaviour.run = () => ({ ok: true })
    await pageBlur(EDITED_PAGE)
    // non-vacuity: the commit really reached the batch seam (an empty op list
    // would take the no-op path and never ask the bridge at all)
    expect(h.batch.mock.calls.length, 'the page differs from the store, so the batch seam WAS called').toBe(1)

    expect(
      h.editController.isDirty('tab-1'),
      'an unacknowledged `{ok:true}` must NOT clear the dirty flag (§3.6/`FS19`: the silent success)',
    ).toBe(true)
    const record = failureOf(h.host, 'tab-1')
    expect(record, 'an unacknowledged write must record a typed failure for the tab').toBeDefined()
    expect(
      typeof record === 'object' && FAILURE_KINDS.includes((record as CommitFailureRecord).kind),
      'the failure kind must be one of the pinned five (§3.5 item 5)',
    ).toBe(true)
    expect(
      typeof record === 'object' && typeof (record as CommitFailureRecord).message === 'string' && (record as CommitFailureRecord).message.length > 0,
      'the typed failure must carry a non-empty message (never a bare/undefined one)',
    ).toBe(true)
  })

  it('C2 — a PARTIAL acknowledgement (`results` shorter than the op list) is NOT success', async () => {
    const h = await makeHarness()
    h.host.mountTab(tabEntry('tab-1'))
    pageInput()
    // TWO compared-field changes (the doc-head AND the body) ⇒ two ops; the
    // bridge acknowledges only the FIRST — a partial write.
    const twoOpsPage =
      `<div id="page-edit-surface" data-edit-surface="${DOC_1}" contenteditable="true">` +
      `<h1 data-rag-node-id="${DOC_1}:head">Doc 1x</h1>` +
      `<p data-rag-node-id="${DOC_1}:body">edited text</p>` +
      `</div>`
    h.behaviour.run = (ops: BatchOp[]) => {
      expect(ops.length, 'the drawn page really produces TWO ops (the partial draw is non-vacuous)').toBe(2)
      return { ok: true, results: [{ op: 'putNode', node: makeNode(`${DOC_1}:head`, { type: 'h1', content: 'Doc 1x' }) }] }
    }
    await pageBlur(twoOpsPage)
    expect(
      h.editController.isDirty('tab-1'),
      'a PARTIAL acknowledgement must not clear the page (a silent partial write — §3.1/`FS7`/`FS19`)',
    ).toBe(true)
    expect(failureOf(h.host, 'tab-1'), 'a partial acknowledgement must record a typed failure').toBeDefined()
  })

  it('C5 — the CONTROL: an acknowledged success (one result per op) clears the page and records no failure', async () => {
    const h = await makeHarness()
    h.host.mountTab(tabEntry('tab-1'))
    pageInput()
    h.behaviour.run = (ops: BatchOp[]) => ({ ok: true, results: ops.map((op) => (op.op === 'putNode' ? { op: 'putNode', node: op.node } : { op: op.op })) })
    await pageBlur(EDITED_PAGE)
    expect(h.editController.isDirty('tab-1'), 'an acknowledged success clears the page (§3.4 step 5)').toBe(false)
    expect(failureOf(h.host, 'tab-1'), 'a success records no failure (§11.8 item 3: the entry is DELETED)').toBeUndefined()
  })
})

// ===========================================================================
// C3 — an absent / malformed result: a typed failure, never a fabricated index
// ===========================================================================
describe('§3.5 item 5 — an absent/malformed `BatchResult` is a typed failure with NO fabricated data', () => {
  const ABSENT: { label: string; result: unknown }[] = [
    { label: 'undefined (the bridge resolved nothing)', result: undefined },
    { label: 'null', result: null },
    { label: 'an empty object (no `ok`)', result: {} },
    { label: 'a non-boolean truthy `ok` (`"yes"`)', result: { ok: 'yes' } },
  ]

  for (const draw of ABSENT) {
    it(`C3 — ${draw.label} is NOT a success, and no \`failedIndex\` is fabricated`, async () => {
      const h = await makeHarness()
      h.host.mountTab(tabEntry('tab-1'))
      pageInput()
      h.behaviour.run = () => draw.result
      await pageBlur(EDITED_PAGE)

      // FS19 — the silent success is the worst outcome; the page stays dirty.
      expect(h.editController.isDirty('tab-1'), `an absent/malformed result (${draw.label}) must not clear the page`).toBe(true)
      const record = failureOf(h.host, 'tab-1')
      expect(record, `an absent/malformed result (${draw.label}) must record a typed failure`).toBeDefined()
      const typed = record as CommitFailureRecord
      expect(
        FAILURE_KINDS.includes(typed.kind),
        `the kind must be one of the pinned five (§3.5 item 5), got ${String(typed.kind)}`,
      ).toBe(true)
      // §3.5 item 5 — the record carries the `BatchResult`'s own data VERBATIM:
      // a `failedIndex` the result never carried is fabricated data (the result
      // here carries none), and the message must be the typed record's own.
      expect(
        typed.failedIndex,
        'no `failedIndex` may be fabricated for a result that carried none (verbatim, §3.5 item 5)',
      ).toBeUndefined()
      expect(
        typeof typed.message === 'string' && typed.message.length > 0,
        'the typed failure must carry a non-empty message (never `undefined`)',
      ).toBe(true)
    })
  }
})

// ===========================================================================
// C4 — a rejecting bridge preserves the engine's own cause class
// ===========================================================================
describe('§3.5 item 5 — a rejected bridge preserves the `EngineUnavailable` cause class', () => {
  const CAUSES: NonNullable<CommitFailureRecord['engineCause']>[] = ['connection-refused', 'engine-not-spawned', 'not-ready']

  for (const cause of CAUSES) {
    it(`C4 — a bridge rejecting with EngineUnavailable('${cause}') records that cause, not a fabricated one`, async () => {
      const h = await makeHarness()
      h.host.mountTab(tabEntry('tab-1'))
      pageInput()
      // the D2 engine-absent class crossing the bridge (`src/main/engine-rag-store.ts`
      // `EngineUnavailable`, whose `cause` discriminates exactly four members)
      h.behaviour.run = () => {
        throw new EngineUnavailable(cause, `engine unavailable: ${cause}`)
      }
      await pageBlur(EDITED_PAGE)

      const record = failureOf(h.host, 'tab-1')
      expect(record, 'a rejected bridge must record a typed failure (never a crash, never a silent success)').toBeDefined()
      const typed = record as CommitFailureRecord
      expect(typed.kind, 'an engine rejection is the `engine-unavailable` kind (§3.5 item 5)').toBe('engine-unavailable')
      expect(
        typed.engineCause,
        `the engine's OWN cause class must be preserved (verbatim, §3.5 item 5) — got ${String(typed.engineCause)}`,
      ).toBe(cause)
      expect(h.editController.isDirty('tab-1'), 'a rejection keeps the page dirty (§3.5 items 1/2)').toBe(true)
    })
  }
})

// ===========================================================================
// W1..W3 — the `commit-failed` warning is AUTHORED, SURVIVES, and CLEARS (FS17)
// ===========================================================================
describe('§3.5 item 4/6 (FS17) — the commit-failed warning is visible in the graph, survives a re-derive and clears on success', () => {
  it('W1 — after a FAILED commit the warning IS authored in the graph (no later re-assembly required)', async () => {
    const h = await makeHarness()
    h.host.mountTab(tabEntry('tab-1'))
    pageInput()
    h.behaviour.run = () => ({ ok: false, error: BATCH_ERROR, failedIndex: BATCH_FAILED_INDEX })
    await pageBlur(EDITED_PAGE)

    const record = failureOf(h.host, 'tab-1') as CommitFailureRecord
    expect(record, 'the failure must be recorded (§3.5 item 3)').toBeDefined()
    expect(record.kind).toBe('store-rejected')
    // §3.5 item 4 — the state is USER-VISIBLE: the failure path must author the
    // warning into the graph (or trigger the equivalent visible authoring), so
    // the operator/MCP surface sees `commit-failed` when it matters — not only
    // after some unrelated later assembly.
    expect(
      warningPresent(h),
      'the `commit-failed` warning must be in the assembled/rendered graph right after the failure (§3.5 item 4)',
    ).toBe(true)
    const html = renderedHtml(h)
    expect(html, "the warning must carry the failure's own kind (§3.5 item 5 — the typed record is the payload)").toContain(
      'store-rejected',
    )
    expect(h.editController.isDirty('tab-1'), 'the failed tab stays dirty (the text is the only copy, §3.5 item 2)').toBe(true)
  })

  it('W2 — the warning SURVIVES a real re-derive, and the witness tabs keep their own states', async () => {
    const h = await makeHarness()
    // the discriminating witnesses (§7's amended `P-SM-2`): a `clean` tab and an
    // `uncommitted` tab live in the SAME draw as the failed tab.
    h.host.mountTab(tabEntry('tab-C'))
    pageInput() // tab-C ⇒ uncommitted
    h.host.mountTab(tabEntry('tab-B')) // tab-B ⇒ clean (no input)
    h.host.mountTab(tabEntry('tab-A'))
    pageInput() // tab-A ⇒ uncommitted
    h.behaviour.run = () => ({ ok: false, error: BATCH_ERROR, failedIndex: BATCH_FAILED_INDEX })
    await pageBlur(EDITED_PAGE)
    const before = failureOf(h.host, 'tab-A')
    expect(before, 'tab-A carries its record before the re-derive').toBeDefined()
    expect(h.editController.isDirty('tab-A')).toBe(true)
    expect(h.editController.isDirty('tab-B'), 'the clean witness was never edited').toBe(false)
    expect(h.editController.isDirty('tab-C'), 'the uncommitted witness carries its own page state').toBe(true)

    await h.host.reDerive('content')

    expect(failureOf(h.host, 'tab-A'), 'the record must survive the re-derive verbatim (§3.5 item 6, FS17)').toEqual(before)
    expect(h.editController.isDirty('tab-A'), 'the failed tab is still dirty after the re-derive').toBe(true)
    expect(h.editController.isDirty('tab-B'), 'the clean witness is still clean').toBe(false)
    expect(failureOf(h.host, 'tab-B'), 'the record must NOT migrate to the witness').toBeUndefined()
    expect(h.editController.isDirty('tab-C'), 'the uncommitted witness is still uncommitted').toBe(true)
    expect(failureOf(h.host, 'tab-C'), 'the uncommitted witness gained no failure record').toBeUndefined()
    expect(warningPresent(h), 'the warning is in the assembled/rendered graph AFTER the re-derive too (§3.5 item 6)').toBe(true)
  })

  it('W3 — a later SUCCESSFUL commit clears the warning and the map entry', async () => {
    const h = await makeHarness()
    h.host.mountTab(tabEntry('tab-1'))
    pageInput()
    h.behaviour.run = () => ({ ok: false, error: BATCH_ERROR, failedIndex: BATCH_FAILED_INDEX })
    await pageBlur(EDITED_PAGE)
    expect(warningPresent(h), 'the warning is authored after the failure (W1 — the precondition of this row)').toBe(true)

    // a retry is an explicit user action (§3.5 item 7): edit again and commit
    pageInput()
    h.behaviour.run = (ops: BatchOp[]) => ({ ok: true, results: ops.map((op) => (op.op === 'putNode' ? { op: 'putNode', node: op.node } : { op: op.op })) })
    await pageBlur(EDITED_PAGE)

    expect(h.editController.isDirty('tab-1'), 'the successful commit clears the page (§3.4 step 5)').toBe(false)
    expect(failureOf(h.host, 'tab-1'), 'the success DELETES the map entry (§11.8 item 3)').toBeUndefined()
    expect(warningPresent(h), 'the warning must be GONE once a later commit succeeds (§3.4 step 5)').toBe(false)
  })
})

// ===========================================================================
// §7 P-TP-2's HOST-PATH negative (the PBT vacuity set)
// ===========================================================================
describe('§7 P-TP-2 — the HOST-PATH negative: an unchanged page issues ZERO `edit.batch` calls', () => {
  it('T1/T2 — an unchanged page is a no-op at the host seam (0 batch calls, clean); one change is exactly ONE call', async () => {
    const h = await makeHarness()
    h.host.mountTab(tabEntry('tab-1'))
    pageInput()
    await pageBlur(UNCHANGED_PAGE)
    expect(
      h.batch.mock.calls.length,
      'an unchanged page must issue ZERO `edit.batch` calls (the host-path negative — `P-TP-2`)',
    ).toBe(0)
    expect(h.editController.isDirty('tab-1'), 'a no-op commit leaves the tab clean (§7 `P-TP-2`)').toBe(false)
    expect(failureOf(h.host, 'tab-1'), 'a no-op commit never sets `commit-failed`').toBeUndefined()

    // the CONTROL (discriminating): ONE compared-field change ⇒ exactly one call
    pageInput()
    await pageBlur(EDITED_PAGE)
    expect(h.batch.mock.calls.length, 'one compared-field change ⇒ exactly ONE `edit.batch` call').toBe(1)
  })
})

// ===========================================================================
// §7 P-SM-1 driven through the REAL seam (the PBT vacuity set)
// ===========================================================================
describe('§7 P-SM-1 — the HOST seam drives the typed failure for every kind this unit owns', () => {
  it('S1 — the host commit path produces the typed record + `commit-failed` for decompose-failed / store-rejected / engine-unavailable', async () => {
    const observed = new Map<string, CommitFailureRecord>()

    // (a) `decompose-failed` — the ADAPTER's typed refusal arm, through the seam
    {
      const h = await makeHarness()
      h.host.mountTab(tabEntry('tab-dec'))
      pageInput()
      // a stored table node cannot be expressed by the adopted decomposer (§3.2)
      await pageBlur(`<table data-rag-node-id="t"><tr><td>cell</td></tr></table>`)
      const record = failureOf(h.host, 'tab-dec') as CommitFailureRecord
      expect(record, 'a refused decode must record a typed failure').toBeDefined()
      expect(h.editController.isDirty('tab-dec'), 'a refused decode keeps the page dirty').toBe(true)
      expect(h.batch.mock.calls.length, 'a refused decode writes NOTHING (no batch call)').toBe(0)
      observed.set(record.kind, record)
    }

    // (b) `store-rejected` — a real failing `BatchResult` through the seam
    {
      const h = await makeHarness()
      h.host.mountTab(tabEntry('tab-rej'))
      pageInput()
      h.behaviour.run = () => ({ ok: false, error: BATCH_ERROR, failedIndex: BATCH_FAILED_INDEX })
      await pageBlur(EDITED_PAGE)
      const record = failureOf(h.host, 'tab-rej') as CommitFailureRecord
      expect(record, 'a rejected batch must record a typed failure').toBeDefined()
      expect(h.batch.mock.calls.length, 'the rejected batch was attempted exactly once (§3.5 item 7: no auto-retry)').toBe(1)
      observed.set(record.kind, record)
    }

    // (c) `engine-unavailable` — the seam itself is unavailable
    {
      const h = await makeHarness()
      h.host.mountTab(tabEntry('tab-unavail'))
      pageInput()
      delete (h.bridge.edit as { batch?: unknown }).batch
      await pageBlur(EDITED_PAGE)
      const record = failureOf(h.host, 'tab-unavail') as CommitFailureRecord
      expect(record, 'an absent batch seam must record a typed failure').toBeDefined()
      observed.set(record.kind, record)
    }

    expect(
      [...observed.keys()].sort(),
      'the seam must drive the three kinds it owns (decompose-failed / store-rejected / engine-unavailable)',
    ).toEqual(['decompose-failed', 'engine-unavailable', 'store-rejected'])
    // and every record is a typed, non-empty record from the pinned union
    for (const record of observed.values()) {
      expect(FAILURE_KINDS).toContain(record.kind)
      expect(typeof record.message).toBe('string')
      expect(record.message.length).toBeGreaterThan(0)
    }
  })

  it('S2 — `not-resident` through the seam: a commit with NO store snapshot is typed, never a silent success', async () => {
    const h = await makeHarness({ snapshotFails: true })
    pageInput()
    await pageBlur(EDITED_PAGE)
    const record = failureOf(h.host, 'page-edit-surface') ?? failureOf(h.host, DOC_1)
    expect(record, 'a commit with no resident snapshot must record a typed failure (§3.6, FS24)').toBeDefined()
    expect((record as CommitFailureRecord).kind, 'the non-resident class is `not-resident` (§3.6)').toBe('not-resident')
  })

  // RECORDED GAP (reported to the supervisor, never silently skipped): the fifth
  // kind of §3.5 item 5 — `not-authorized` — has NO host seam in this build. The
  // commit path (`SidebarPanes`'s page seam) has no authorization gate at all
  // (`bridge.security` is consulted by the HANDLER gate, never by the commit), so
  // no draw can DRIVE it through `pageSurfaceInput`/`pageSurfaceBlur`; the type
  // stays pinned by §3.5 item 5 and is constructed test-locally in
  // `tests/unit-u-edit-1-property-register.test.ts` (`P-SM-1`).
  it('S3 — `not-authorized` has no commit seam in this build (the recorded gap, asserted as a fact)', () => {
    const proto = Object.getOwnPropertyNames(SidebarPanes.prototype)
    const authSeams = proto.filter((n) => /authoriz|authoris|authorityGrant/i.test(n))
    expect(authSeams, 'no authorization seam exists on the host — so `not-authorized` is not seam-drivable here').toEqual([])
  })
})
