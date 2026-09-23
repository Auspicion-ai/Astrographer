// tests/unit-u-edit-1-property-register.test.ts — the §5.x TYPED PROPERTY
// REGISTER of the `C9 U-EDIT-1` unit (7 rows), derived from
// docs/specs/unit-u-edit-1-whole-page-editing.md §7 (the register table) plus
// the pinned machinery in that same section:
//   - the deterministic pinned seed `0xED170001` (never Date.now(), never a
//     random default, never an environment read);
//   - the budget `63 × 6 + 22 = 400` attempts total, ≤100 per row;
//   - STOP-AFTER-5 reporting (each row reports at most 5 distinct
//     held-or-broken cases; a broken row reports its counterexample);
//   - the MANDATORY control draw: every row carries a control whose expected
//     outcome is the OPPOSITE of the row's verdict, and the row is only `held`
//     if the control discriminates;
//   - the negative generator named by each row;
//   - the class meanings: `P-IM` = an invariant of the diff/commit data model,
//     `P-SM` = a safety property over the commit's state transition,
//     `P-TP` = a totality/determinism property.
//
// The rows: `P-IM-1` (op list = function of the diff; only changed nodes),
// `P-IM-2` (one commit = one invertible `batch` journal entry), `P-IM-3`
// (`setType` never delete+recreates), `P-SM-1` (a failed commit is atomic and
// loud), `P-SM-2` (the warning survives every re-derive), `P-TP-1` (the decode
// + diff are TOTAL and DETERMINISTIC), `P-TP-2` (a commit of an unchanged page
// is a no-op).
//
// A row's verdict is written by an AUDIT that did not author the rows (RCA-3 /
// AGENTS.md item 10) — this file produces the evidence (per-row cases, the
// counterexample, the control) so the audit can report `held`/`broken` with its
// attempt count. The rows that needed the commit's §3.2 diff and §3.3
// one-`applyBatch` apply were the recorded red obligation of §3.3 item 7
// (`applyBatchOp` returned `op not supported` for
// `setProps`/`setSubtree`/`setType` at the red pass); the implementation landed
// at commit `15cbc6c`, so these rows are the GREEN verification of that
// obligation now.
//
// RE-DERIVED 2026-09-21 (§11 amendment `11.9` item 1): the **test-local decode
// and diff this file used to carry are DELETED** (§6.2: "a suite that
// re-imports `src/main/rich-decompose.ts` or reconstructs the decode in the test
// file is a review finding"). Every decode/diff draw now goes through the
// ADAPTER `src/main/page-diff.ts` (`decodePage` / `buildPageOps` — the ONLY
// module that imports the adopted `provident-editable@0.2.0`), which is the
// module under test and the package's own oracle for the structural half.
//
// The three vacuous rows are AMENDED so each is falsifiable (§11 amendment
// `11.9` item 5):
//   - `P-SM-1` CONSTRUCTS the `commit-failed` state for ALL FIVE
//     `CommitFailure.kind`s (4 draws per kind × 5 = 20, + 2 controls = 22 — the
//     internal re-tally of its own 22-attempt allocation);
//   - `P-SM-2` carries a DISCRIMINATING WITNESS (a concurrently `clean` tab and
//     a concurrently `uncommitted` tab in the SAME draw) against the
//     CONSTRUCTED record, so an oracle returning a constant fails the row;
//   - `P-IM-1` draws a PROPS-ONLY change (RAG-owned) AND a runtime-prop-only
//     control that must produce NO op.
// The row count stays 7, the seed stays `0xED170001`, the per-row ceiling stays
// ≤100 and the total stays `63 × 6 + 22 = 400`.
//
// HARDENED 2026-09-22 (RCA-3 ADVERSARIAL-FIX REMAND — the PBT audit's vacuity
// set). The rows' ORACLES are unchanged; what changes is that each now DRIVES the
// seam it claims to measure instead of constructing its own evidence:
//   - `P-IM-1` gains a TYPE+CONTENT arm on one drawn block (a simultaneous type
//     and content change must commit BOTH — the text was silently dropped) and
//     the negative `≤0 setProps` control for a page WITHOUT props;
//   - `P-SM-1` / `P-SM-2` / `P-TP-2`'s HOST-DRIVEN halves (the host's own commit
//     path, a REAL re-derive with the warning read from the assembled envelope,
//     and the host-path "unchanged page ⇒ ZERO `edit.batch` calls" negative) live
//     in `tests/page-commit-failure-visibility.test.ts`, because they need the
//     real `SidebarPanes`/`Runtime` assembly this file deliberately does not
//     carry (this file is the PURE adapter/store layer, §10). The row ids are
//     asserted there under the same `§7` headings, so the audit reads ONE row per
//     id across the two files.
// RE-DERIVED AGAIN 2026-09-22 (RCA-3 SECOND REMAND — the vacuity set the
// previous green did not close). `P-IM-2`, `P-TP-1`, `P-SM-1` and `P-SM-2` were
// still SELF-REFERENTIAL: they built their own carriers/maps and their "re-derive"
// was a `JSON.stringify` over test-authored data (P-SM-1/P-SM-2), their `P-IM-2`
// draws carried no EDGES and drove no HOST commit, and `P-TP-1`'s duplicated-id
// arm asserted only determinism (a double write passed) while its "quarantined
// node" matrix member was MISLABELLED (it drew an ordinary page). What changed:
//   - `P-IM-2` — draws now CREATE a block + its `doc-child` edge and REMOVE a
//     block + its edge, compares `listEdges()` (sorted) before/after `undo()`,
//     and its host half drives the REAL commit seam (ONE batch call ⇒ ONE journal
//     entry, read off a real temp store behind the bridge);
//   - `P-TP-1` — a real QUARANTINED node is drawn (a tampered record hash, read
//     off the store's own `status().quarantined`) instead of the mislabelled
//     member, and the duplicated-id arm asserts ≤1 op per duplicated ragId OR a
//     typed refusal (a double write now FAILS the row);
//   - `P-SM-1` / `P-SM-2` — both now drive the PRODUCTION seam: `pageSurfaceBlur`
//     through the host, `pageEditSurfaceFailure`/`pageEditSurfaceCommitState` as
//     the readers, a REAL store as the bytes/journal/persist oracle, and the
//     host's real `reDerive`/`onRagStoreChanged`/`applyContentChange` paths with
//     the witness tabs read per subject. The test-authored `TabCarriers` map is
//     GONE from those rows (it was the vacuity: an oracle over its own fixture).
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { decodePage, buildPageOps, type PageDiffSnapshot } from '../src/main/page-diff.js'
import { handleEditBatch } from '../src/main/edit-ops.js'
import { parseMarkdown } from '../src/main/markdown-parse.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import type { RagSnapshotPayload, OperatorSettings } from '../src/shared/types.js'
import type { TabEntry } from '../src/renderer/tab-state.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagNodeChild,
  type RagNodeType,
  type RagEdge,
  type BatchOp,
  type BatchResult,
} from '../src/main/rag-store.js'

beforeAll(() => {
  installShim()
})

// ===========================================================================
// §7 shared machinery — the pinned seed, the PRNG, the budget, stop-after-5
// ===========================================================================
const SEED = 0xED170001
/** §7: ≤100 attempts per row, ≤400 total, allocated as 63 × 6 + 22. */
const ROW_BUDGETS = {
  'P-IM-1': 63,
  'P-IM-2': 63,
  'P-IM-3': 63,
  'P-SM-1': 22,
  'P-SM-2': 63,
  'P-TP-1': 63,
  'P-TP-2': 63,
} as const
type RowId = keyof typeof ROW_BUDGETS
/** §7: each row reports at most 5 distinct held-or-broken cases. */
const STOP_AFTER = 5

/** A deterministic 32-bit LCG seeded with the pinned literal (§7's seed row). */
function makeRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s
  }
}
function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[rng() % items.length]
}
function intBetween(rng: () => number, lo: number, hi: number): number {
  return lo + (rng() % (hi - lo + 1))
}

interface RowResult {
  row: RowId
  verdict: 'held' | 'broken'
  casesRun: number
  /** The first counterexample (the failing draw), if any. */
  counterexample?: string
  /** The control draw's outcome. */
  control: { description: string; discriminated: boolean }
}

/** Run up to `budget` attempts of a row's strategy, stopping after 5 distinct
 *  failures (§7's stop-after-5). The generator is NEVER weakened: a failing draw
 *  is a failing draw. */
function runRow(
  row: RowId,
  budget: number,
  draw: (i: number, rng: () => number) => { ok: boolean; detail?: string },
): RowResult {
  const rng = makeRng(SEED + row.length * 7919) // the pinned seed, row-offset
  let failures = 0
  let counterexample: string | undefined
  let casesRun = 0
  for (let i = 0; i < budget; i++) {
    casesRun++
    const result = draw(i, rng)
    if (!result.ok) {
      failures++
      counterexample = counterexample ?? result.detail
      if (failures >= STOP_AFTER) break
    }
  }
  return { row, verdict: failures === 0 ? 'held' : 'broken', casesRun, counterexample, control: { description: '', discriminated: false } }
}

function report(result: RowResult): void {
  // The §7 report shape (the audit reads this and writes held/broken with the
  // attempt count + the counterexample). No assertion here — the row verdict is
  // asserted by the calling test.
  void result
}

// ===========================================================================
// fixtures + the PAGE draws (the decode/diff go through the ADAPTER — §3.1)
// ===========================================================================
/** The type-change pool for the type-apply rows (includes the `td`→`th` change §7 names). */
const TYPE_POOL: RagNodeType[] = ['h1', 'h2', 'p', 'li', 'blockquote', 'pre', 'td', 'th', 'div']
/**
 * The tags a drawn PAGE may carry: the types that are BOTH `RagNodeType`
 * members and members of the package's closed block set (§3.1 — the package has
 * no `table`/`thead`/`tr`/`td`/`th`, and the adapter REFUSES such a block rather
 * than retyping it, §3.2). The rows that DRAW A PAGE therefore restrict their
 * type pool to this set; the store-only rows (`P-IM-3`) keep the table types the
 * §7 proposition names (`td`→`th`), which never enter a decode.
 */
const PAGE_TYPE_POOL: RagNodeType[] = ['h1', 'h2', 'h3', 'p', 'li', 'blockquote', 'pre', 'code', 'div', 'ul', 'ol']
/** The runtime props the §3.1 NOT-diffed list excludes — never compared. */
const RUNTIME_PROP_KEYS = ['contenteditable', 'data-edit-surface', 'data-node-id', 'data-doc-head', 'style', 'class']

function makeNode(id: string, type: RagNodeType, content: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-01-01T00:00:00.000Z'
  return { id, type, content, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function newStore(): { store: RagStore; file: string } {
  const file = join(mkdtempSync(join(tmpdir(), 'provident-u-edit-1-pbt-')), 'rag.json')
  return { store: createJsonRagStore({ path: file }), file }
}

/** The page HTML a drawn store renders to (one block per node, document order). */
function pageFor(nodes: RagNode[], overrides: Map<string, { tag?: RagNodeType; inner?: string; attrs?: string }> = new Map()): string {
  return nodes
    .map((n) => {
      const o = overrides.get(n.id) ?? {}
      const tag = o.tag ?? n.type
      const inner = o.inner ?? n.content
      return `<${tag} data-rag-node-id="${n.id}"${o.attrs ?? ''}>${inner}</${tag}>`
    })
    .join('')
}

/** The store's read-only node/edge view — the seam shape of §3.1. */
function snapshotOf(store: RagStore): PageDiffSnapshot {
  const payload: RagSnapshotPayload = {
    store: 'main',
    nodes: store.listNodes().map((n) => ({
      id: n.id,
      type: n.type,
      content: n.content,
      props: n.props,
      children: n.children,
      ownedNodeIds: n.ownedNodeIds,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    })),
    edges: store.listEdges().map((e) => ({
      id: e.id,
      kind: e.kind,
      source: e.source,
      target: e.target,
      order: e.order,
      documentIds: e.documentIds,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
  }
  return payload as unknown as PageDiffSnapshot
}

/** The RAG-OWNED props of a store node (the compared subset of §3.2). */
function ragOwnedProps(node: RagNode | undefined): Record<string, unknown> {
  const props = { ...(node?.props ?? {}) }
  for (const runtime of RUNTIME_PROP_KEYS) delete props[runtime]
  return props
}

/** §3.2's closed field set + the minimal-op rule, THROUGH THE ADAPTER
 *  (`buildPageOps` — the only decode/diff path, §3.1/§11 amendment `11.9`). */
function diff(pageHtml: string, store: RagStore, documentId = 'doc'): BatchOp[] {
  const result = buildPageOps(decodePage(pageHtml), snapshotOf(store), documentId)
  if (!result.ok) throw new Error(`the adapter refused a drawn page's op list: ${result.message}`)
  return result.ops
}

function storeBytes(file: string): string {
  try {
    return readFileSync(file, 'utf8')
  } catch {
    return ''
  }
}

function nodeIdsOf(ops: BatchOp[]): string[] {
  const ids: string[] = []
  for (const op of ops) {
    const anyOp = op as { nodeId?: string; node?: RagNode; id?: string }
    if (anyOp.nodeId) ids.push(anyOp.nodeId)
    if (anyOp.node?.id) ids.push(anyOp.node.id)
    if (anyOp.id) ids.push(anyOp.id)
  }
  return ids
}

/** The `setProps` ops of an op list, typed. */
function setPropsOps(ops: BatchOp[]): { nodeId: string; props: Record<string, unknown> }[] {
  return ops
    .filter((op): op is { op: 'setProps'; nodeId: string; props: Record<string, unknown> } => op.op === 'setProps')
    .map((op) => ({ nodeId: op.nodeId, props: op.props }))
}

async function seedNodes(store: RagStore, nodes: RagNode[]): Promise<void> {
  for (const n of nodes) await store.putNode(n)
}

function makeEdge(id: string, kind: RagEdge['kind'], source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = '2026-01-01T00:00:00.000Z'
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

/** A stable ordering for the edge comparison (`listEdges()` order is insertion
 *  order, which a batch+undo need not reproduce byte-for-byte). */
function sortById<T extends { id: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}
function edgesSnapshot(store: RagStore): string {
  return JSON.stringify(sortById(store.listEdges()))
}
function nodesSnapshot(store: RagStore): string {
  return JSON.stringify(sortById(store.listNodes()))
}

/** The page a section's blocks render to — the containment shape `P-IM-2`'s
 *  edge draws need (`doc-child` from the section, `documentIds` scoped so the
 *  removal scan can see them: the PRODUCTION edge shape is pinned by
 *  `tests/page-diff-production-commit.test.ts`). */
function sectionPage(blocks: [id: string, text: string][], doc = 'doc'): string {
  const body = blocks.map(([id, text]) => `<p data-rag-node-id="${id}">${text}</p>`).join('')
  return `<div id="page-edit-surface" data-edit-surface="${doc}" contenteditable="true"><div data-rag-node-id="sec">Section</div>${body}</div>`
}

// ===========================================================================
// the HOST harness (the seam-driven half the second remand requires): the real
// `SidebarPanes` + `Runtime`, a mount, and a REAL temp store behind the bridge
// — so the store's bytes / journal / persist are the oracle and the commit goes
// through `pageSurfaceBlur` → `commitPageEdit` → ONE `bridge.edit.batch` →
// `handleEditBatch` exactly as production does.
// ===========================================================================
const HOST_DOC = 'doc-host'

/** The page the single surface renders for the host fixture (§2.1: the surface
 *  root carries `id = page-edit-surface` + `data-edit-surface = <documentId>`). */
function hostPage(bodyText: string): string {
  return (
    `<div id="page-edit-surface" data-edit-surface="${HOST_DOC}" contenteditable="true">` +
    `<h1 data-rag-node-id="${HOST_DOC}:head">Title</h1>` +
    `<p data-rag-node-id="${HOST_DOC}:body">${bodyText}</p>` +
    `</div>`
  )
}

interface HostHarness {
  host: SidebarPanes
  runtime: Runtime
  store: RagStore
  file: string
  batch: ReturnType<typeof vi.fn>
  editController: EditController
  tabId: string
  /** The store's bytes/journal AT BOOT — the "unchanged on failure" oracle. */
  bytesBefore: string
  journalBefore: number
  /** A row may override what the bridge answers (junk/failing results). `null`
   *  ⇒ the REAL `handleEditBatch(store, payload)` path. */
  answer: { run: ((ops: BatchOp[]) => unknown) | null }
  /** `engine-unavailable`: remove the batch seam from the bridge entirely. */
  dropBatchSeam: () => void
}

async function makeHostHarness(opts: { snapshotFails?: boolean } = {}): Promise<HostHarness> {
  const dir = mkdtempSync(join(tmpdir(), 'provident-u-edit-1-host-'))
  const file = join(dir, 'rag.json')
  const store = createJsonRagStore({ path: file })
  await store.putNode(makeNode(`${HOST_DOC}:head`, 'h1', 'Title'))
  await store.putNode(makeNode(`${HOST_DOC}:body`, 'p', 'body one'))
  // NOTE: a real `applyBatch`-validated store rejects an edge whose endpoints are
  // not nodes (`putEdge` refuses a missing/quarantined endpoint), so the
  // `doc-flow` edges (which target the DOCUMENT id) are not seeded here: the
  // commit path needs only the containment edges + the surface marker.
  await store.putEdge(makeEdge(`e-${HOST_DOC}-next`, 'next-section', `${HOST_DOC}:head`, `${HOST_DOC}:body`, { documentIds: [HOST_DOC] }))
  await store.putEdge(makeEdge(`e-${HOST_DOC}-child`, 'doc-child', `${HOST_DOC}:head`, `${HOST_DOC}:body`, { order: 0, documentIds: [HOST_DOC] }))

  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const h: HostHarness = {
    host: null as never,
    runtime: null as never,
    store,
    file,
    batch: null as never,
    editController: null as never,
    tabId: 'tab-host',
    bytesBefore: storeBytes(file),
    journalBefore: store.journal().length,
    answer: { run: null },
    dropBatchSeam: () => {},
  }
  h.batch = vi.fn(async (ops: BatchOp[]): Promise<BatchResult> => {
    if (h.answer.run != null) return h.answer.run(ops) as BatchResult
    // the PRODUCTION path: the existing `IPC_EDIT_BATCH` channel's main-side
    // handler, against the real store (§3.3 item 2).
    return handleEditBatch(store, { ops })
  })
  const snapshot = vi.fn(async () => {
    if (opts.snapshotFails === true) throw new Error('no resident store')
    return {
      store: 'main',
      nodes: store.listNodes(),
      edges: store.listEdges(),
    }
  })
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
      docHeads: vi.fn(async () => ({ documents: [{ documentId: HOST_DOC, title: 'Title', path: [], tags: [] }] })),
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
  h.editController = createEditController({
    backRefs,
    commit: async () => ({ ok: true, nodeId: 'x' }),
    onRebuild,
  })
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
  h.dropBatchSeam = () => {
    delete (bridge.edit as { batch?: unknown }).batch
  }
  await h.host.boot(h.runtime)
  const entry: TabEntry = { id: h.tabId, target: { kind: 'document', documentId: HOST_DOC }, title: 'Title' }
  h.host.mountTab(entry)
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
  await new Promise((resolve) => setTimeout(resolve, 0))
}

/** §3.5 item 6/§11.8 item 3 — the host's DECLARED per-subject failure reader. */
function hostFailure(host: SidebarPanes, subject: string): CommitFailure | undefined {
  const reader = (host as unknown as { pageEditSurfaceFailure?: (s: string) => CommitFailure | undefined })
    .pageEditSurfaceFailure
  if (typeof reader !== 'function') return undefined
  return reader.call(host, subject)
}

/** §3.5 item 3/§11.8 item 3 — the host's DECLARED per-subject state reader
 *  (`{ subject, dirty, failure? }`), the reader the witness tabs are compared
 *  through. */
function hostCommitState(host: SidebarPanes, subject: string): { subject: string; dirty: boolean; failure?: CommitFailure } {
  const reader = (host as unknown as {
    pageEditSurfaceCommitState?: (s: string) => { subject: string; dirty: boolean; failure?: CommitFailure }
  }).pageEditSurfaceCommitState
  expect(typeof reader, 'the host must expose `pageEditSurfaceCommitState(subject)` (§11.8 item 3)').toBe('function')
  return reader!.call(host, subject)
}

// ===========================================================================
// P-IM-1 — the op list is a function of the DIFF and names only changed nodes
// ===========================================================================
describe('\u00a77 P-IM-1 \u2014 the op list names only changed nodes (strat:diff-minimality)', () => {
  it('P-IM-1 \u2014 the drawn ops name only mutated nodes, a PROPS-ONLY change yields one setProps, and a runtime-prop-only change yields none', async () => {
    const rng = makeRng(SEED)
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    /** \u00a711 amendment `11.9` item 5: the PROPS arm must be drawn in BOTH its
     *  RAG-owned and its runtime-only form, so neither can be sampled away. */
    let propsOnlyDrawn = 0
    let runtimeOnlyDrawn = 0
    /** RCA-3 remand: the TYPE+CONTENT arm's draw count (N ≥ 2 draws only), tracked
     *  so a collapsed population fails LOUDLY instead of silently narrowing. */
    let dualDrawn = 0
    /** §7's block-count pool `N ∈ {1, 2, 7, 40}` — the drawn N values, tracked so
     *  a collapsed population fails LOUDLY instead of silently narrowing. */
    const N_POOL = [1, 2, 7, 40] as const
    const nsDrawn = new Set<number>()
    for (let i = 0; i < ROW_BUDGETS['P-IM-1'] && failures < STOP_AFTER; i++) {
      cases++
      const { store } = newStore()
      // N is drawn from §7's pool by STRATIFICATION (the case index), not by an
      // rng read: measured, the pinned stream is sampled at a fixed stride whose
      // low-bit pattern is a CONSTANT — `rng() % 4` yielded N = 1 in all 63
      // draws and at every budget up to the ≤100 ceiling (a fixed point, not a
      // short-run accident), leaving the spec's own N pool unreachable AND
      // making `S ≠ ∅` undrawable. Index stratification covers the whole pool
      // (measured 16/16/16/15 over the 63 attempts) and makes `S ≠ ∅` reachable
      // (measured 33 draws), without touching any oracle.
      const n = N_POOL[i % N_POOL.length]
      nsDrawn.add(n)
      const nodes = Array.from({ length: n }, (_, k) => makeNode(`n${k}`, pick(rng, PAGE_TYPE_POOL), `text-${k}`))
      await seedNodes(store, nodes)
      // S \u2286 the blocks, mutated over the closed field set (empty S allowed)
      const mutated = new Set<string>()
      const overrides = new Map<string, { inner?: string; attrs?: string }>()
      // the stratified PROPS arm: the FIRST block draws a props-only change in one
      // of its two forms on EVERY draw (RAG-owned vs runtime-only)
      const propNode = nodes[0]
      const propKey = pick(rng, ['align', 'tone', 'role'])
      // The arm is drawn by STRATIFICATION (the case index), NOT by a coin flip
      // on the pinned stream. Measured: with the arm read as `rng() % 2 === 0`
      // the population consumed an even, fixed number of rng calls per draw, and
      // the LCG's low bits advance by a fixed 4-cycle — so a stride-4 sample of
      // `rng() % 4` / `rng() % 2` is a CONSTANT (`pick(...)` always 1,
      // `runtimeOnly` always false, over 500 draws and over every budget up to
      // ≤100: the degeneracy is a FIXED POINT, not a short-run accident). That
      // made the amended §11.9 item 5 control arm unreachable, i.e. VACUOUS.
      // Alternating on the case index draws BOTH arms in every run — the
      // stratification §7's strategy requires ("the props arm drawn in BOTH its
      // RAG-owned and its runtime-only form") — and does not weaken either arm's
      // oracle. Measured draw counts under the pinned seed `0xED170001` and the
      // row's pinned 63-attempt budget: props-only 31, runtime-only 32.
      const runtimeOnly = i % 2 === 0
      const propValue = runtimeOnly ? 'runtime' : 'rag-owned'
      overrides.set(propNode.id, {
        attrs: runtimeOnly
          ? ` class="${propValue}" style="color:red" data-node-id="${propNode.id}"`
          : ` data-rag-props='{"${propKey}":"${propValue}"}'`,
      })
      if (runtimeOnly) runtimeOnlyDrawn++
      else propsOnlyDrawn++
      const propsTarget = propNode.id
      // the OTHER blocks mutate `content` (the closed field set's other arms are
      // exercised by the sibling rows and by `tests/page-diff.test.ts`)
      for (const node of nodes.slice(1)) {
        if (rng() % 3 !== 0) continue
        mutated.add(node.id)
        overrides.set(node.id, { inner: `${node.content}!` })
      }
      // the TYPE+CONTENT arm (RCA-3 ADVERSARIAL-FIX REMAND): the SECOND block draws
      // a SIMULTANEOUS type change AND content change on EVERY draw with N ≥ 2 —
      // stratified on the draw like the props arm, so it cannot be sampled away. A
      // type-only write (the measured defect: `continue` after `setType`) silently
      // drops the user's text, which is exactly what this arm's oracle detects.
      const dual = nodes.length > 1 ? nodes[1] : null
      let dualNewType: RagNodeType | null = null
      let dualNewContent = ''
      if (dual !== null) {
        dualNewType = pick(
          rng,
          PAGE_TYPE_POOL.filter((t) => t !== dual.type),
        )
        dualNewContent = `${dual.content}#`
        mutated.add(dual.id)
        // set AFTER the content loop above so the tag override is not overwritten
        overrides.set(dual.id, { tag: dualNewType, inner: dualNewContent })
        dualDrawn++
      }
      const page = pageFor(nodes, overrides)
      const ops = diff(page, store)
      const named = new Set(nodeIdsOf(ops))
      // (1) every op names a mutated node (or the drawn props target)
      for (const id of named) {
        if (id !== propsTarget && !mutated.has(id)) {
          failures++
          counterexample = counterexample ?? `unchanged node ${id} appeared in the op list (S=${[...mutated].join(',')})`
        }
      }
      // (2) the PROPS arm's oracle (\u00a73.1's mapping row): both of its forms leave
      //     `content` untouched on that block, so only `props` may differ
      const propOps = ops.filter((op) => nodeIdsOf([op]).includes(propsTarget))
      const propSetProps = setPropsOps(propOps)
      if (runtimeOnly) {
        // the DISCRIMINATING CONTROL: a runtime-prop-only change MUST write nothing
        if (propOps.length !== 0) {
          failures++
          counterexample = counterexample ?? `a runtime-prop-only change produced ${propOps.length} op(s) (FS8)`
        }
      } else if (propSetProps.length !== 1 || propOps.length !== 1) {
        failures++
        counterexample = counterexample ?? `a props-only change produced ${propOps.length} op(s) / ${propSetProps.length} setProps (expected exactly one)`
      } else if (!Object.keys(propSetProps[0].props).includes(propKey)) {
        failures++
        counterexample = counterexample ?? `the setProps op did not carry the changed RAG-owned key ${propKey}`
      } else if (JSON.stringify(ragOwnedProps(store.getNode(propsTarget))[propKey]) === JSON.stringify(propValue)) {
        failures++
        counterexample = counterexample ?? `the drawn props change was not a difference at all (${propKey})`
      }
      // (3) the TYPE+CONTENT arm's oracle (§3.2's closed field set): a block whose
      //     type AND content both changed must carry BOTH — the new content (never
      //     dropped) and the new type (either as a `setType` op or inside the
      //     `putNode` that expresses the difference, so both fix shapes pass).
      if (dual !== null && dualNewType !== null) {
        const dualOps = ops.filter((op) => nodeIdsOf([op]).includes(dual.id))
        const contentCarried = dualOps.some(
          (op) => ((op as { node?: { content?: string } }).node?.content ?? null) === dualNewContent,
        )
        const typeCarried = dualOps.some(
          (op) =>
            (op as { type?: string }).type === dualNewType ||
            (op as { node?: { type?: string } }).node?.type === dualNewType,
        )
        if (!contentCarried) {
          failures++
          counterexample = counterexample ?? `a simultaneous type+content change on ${dual.id} did not carry the new content ('${dualNewContent}') — the user's text is dropped`
        } else if (!typeCarried) {
          failures++
          counterexample = counterexample ?? `a simultaneous type+content change on ${dual.id} did not carry the new type (${dualNewType})`
        }
      }
      // (4) the empty-subset control (S = \u2205 AND an uncompared props draw)
      if (mutated.size === 0 && runtimeOnly && ops.length !== 0) {
        failures++
        counterexample = counterexample ?? `an empty mutation subset produced ${ops.length} ops`
      }
      if (mutated.size > 0 && named.size === 0) {
        failures++
        counterexample = counterexample ?? 'a non-empty mutation subset produced no op'
      }
    }
    // NON-VACUITY of the amended population: both props arms were DRAWN (the
    // measured split under the index stratification is 31 RAG-owned / 32
    // runtime-only of the 63 attempts) — neither arm can be sampled away.
    expect(propsOnlyDrawn).toBeGreaterThan(0)
    expect(runtimeOnlyDrawn).toBeGreaterThan(0)
    // and both arms' oracles actually RAN: the RAG-owned arm must have asserted
    // its exactly-one-`setProps`, the runtime-only arm its zero-op control
    expect(propsOnlyDrawn + runtimeOnlyDrawn).toBe(cases)
    expect(propsOnlyDrawn).toBeGreaterThanOrEqual(2)
    expect(runtimeOnlyDrawn).toBeGreaterThanOrEqual(2)
    // the RCA-3 TYPE+CONTENT arm really ran (a collapsed population would leave
    // the simultaneous-edit defect undrawn again)
    expect(dualDrawn).toBeGreaterThan(0)
    // the §7 N pool was actually drawn (a collapsed population is a harness
    // defect, not a `held` verdict)
    expect([...nsDrawn].sort((a, b) => a - b)).toEqual([1, 2, 7, 40])
    const controlStore = newStore().store
    await controlStore.putNode(makeNode('c1', 'p', 'k'))
    const controlOps = diff(pageFor([makeNode('c1', 'p', 'k')], new Map()), controlStore)
    expect(controlOps).toEqual([])
    report({ row: 'P-IM-1', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'S = \u2205 + runtime-only \u21d2 ops = []', discriminated: controlOps.length === 0 } })
    expect(counterexample ?? null).toBeNull()
  })

  it('P-IM-1 — the negative `≤0 setProps` control: a page WITHOUT props produces NO `setProps` op', async () => {
    // The audit's vacuity finding for this row: the POSITIVE props arm above is
    // reachable only through the TEST-LOCAL `data-rag-props` authoring. Measured:
    // `grep -rn 'data-rag-props' src/` returns ONE hit — `src/main/page-diff.ts`,
    // the adapter's READER (`ATTR_RAG_PROPS`) — and NO producer, so a production
    // page form carries a node's own props as ordinary attributes (the traversal
    // merges them onto the subtree root) and never as `data-rag-props`. This
    // control pins the discriminating negative; it does NOT claim the production
    // page can express a props difference (that authoring is not pinned by
    // §3.1/§3.2 — recorded as a gap, never silently worked around).
    const { store } = newStore()
    await seedNodes(store, [makeNode('p1', 'p', 'one'), makeNode('p2', 'p', 'two', { props: { align: 'center' } })])
    // (a) the props-free / production-form page (no `data-rag-props` anywhere),
    //     equal to the store ⇒ NO op at all, and certainly no `setProps`
    const plain = `<p data-rag-node-id="p1">one</p><p data-rag-node-id="p2" align="center">two</p>`
    const ops = diff(plain, store)
    expect(setPropsOps(ops), 'a page WITHOUT props must produce NO `setProps` op').toEqual([])
    expect(ops, 'the props-free page equal to the store is a no-op (the row is not vacuous by refusing to map)').toEqual([])
    // (b) the same form with ONE content change still writes its content op — so
    //     the ZERO-`setProps` reading above is not an artifact of an empty list
    const changed = `<p data-rag-node-id="p1">one!</p><p data-rag-node-id="p2" align="center">two</p>`
    const changedOps = diff(changed, store)
    expect(setPropsOps(changedOps), 'a content-only change must never be reported as a props change (FS8)').toEqual([])
    expect(changedOps.length, 'the content change IS written (the control discriminates)').toBe(1)
    // (c) and the test-local `data-rag-props` carrier DOES write one — so the
    //     negative above is discriminating rather than an always-empty oracle
    const withProps = `<p data-rag-node-id="p1">one</p><p data-rag-node-id="p2" data-rag-props='{"align":"left"}'>two</p>`
    expect(
      setPropsOps(diff(withProps, store)).length,
      'the test-local `data-rag-props` carrier DOES write one `setProps` (the negative discriminates)',
    ).toBe(1)
  })
})

// ===========================================================================
// P-IM-2 — one commit = one invertible `batch` journal entry
// ===========================================================================
describe('§7 P-IM-2 — one commit is one `batch` entry, invertible to the pre-commit state', () => {
  it('P-IM-2 — a successful commit gains exactly ONE batch entry and its inverse restores the NODES and the EDGES', async () => {
    const rng = makeRng(SEED ^ 0x11)
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    /** §7 `P-IM-2`'s population amendment (2026-09-22 second remand): the draw
     *  must contain at least one block CREATION with its edge and one block
     *  REMOVAL with its edge, else the edge half of the invertibility oracle is
     *  never exercised (the previous form drew content edits over a store with
     *  NO edges at all). */
    let createdDrawn = 0
    let removedDrawn = 0
    const arms = new Set<string>()
    for (let i = 0; i < ROW_BUDGETS['P-IM-2'] && failures < STOP_AFTER; i++) {
      cases++
      const { store } = newStore()
      // the containment fixture: a section + two `doc-child` blocks, so a draw
      // can create a block (minted putNode + its doc-child putEdge) and remove a
      // block (removeEdge + removeNode) — both with EDGES.
      await seedNodes(store, [
        makeNode('sec', 'div', 'Section'),
        makeNode('b1', 'p', 'body-1'),
        makeNode('b2', 'p', 'body-2'),
      ])
      await store.putEdge(makeEdge('e-child-1', 'doc-child', 'sec', 'b1', { order: 0, documentIds: ['doc'] }))
      await store.putEdge(makeEdge('e-child-2', 'doc-child', 'sec', 'b2', { order: 1, documentIds: ['doc'] }))
      // the arm by STRATIFICATION of the case index (the pinned LCG's low bits
      // are a measured fixed point, so a coin flip on the stream samples one arm
      // only — the same recorded hazard the sibling rows document)
      const arm = i % 3
      const page =
        arm === 0
          ? sectionPage([['b1', 'body-1-edited'], ['b2', 'body-2']])
          : arm === 1
            ? sectionPage([['b1', 'body-1'], ['b2', 'body-2'], ['typed', 'typed text']])
            : sectionPage([['b1', 'body-1']])
      // §7 `P-IM-2`'s AMENDED PROPOSITION (§11 amendment `11.8` item 4, remedy
      // (a) — the population is restricted to NON-EMPTY mutation subsets). Every
      // arm above mutates, so the draw is in-population by construction; the
      // `S = ∅` draw is this row's CONTROL below and `P-TP-2`'s proposition.
      const ops = diff(page, store)
      arms.add(arm === 0 ? 'content' : arm === 1 ? 'create+edge' : 'remove+edge')
      if (arm === 1 && ops.some((op) => op.op === 'putEdge')) createdDrawn++
      if (arm === 2 && ops.some((op) => op.op === 'removeNode') && ops.some((op) => op.op === 'removeEdge')) removedDrawn++
      if (ops.length === 0) {
        failures++
        counterexample = counterexample ?? 'a non-empty mutation subset produced an EMPTY op list (no commit to journal)'
        continue
      }
      const nodesBefore = nodesSnapshot(store)
      const edgesBefore = edgesSnapshot(store)
      const journalBefore = store.journal().length
      const result = await store.applyBatch(ops)
      if (!result.ok) {
        failures++
        counterexample = counterexample ?? `the store rejected the commit: ${result.error} (failedIndex ${result.failedIndex})`
        continue
      }
      // §3.3 item 3: exactly ONE journal entry, of kind `batch`
      const journalAfter = store.journal()
      if (journalAfter.length - journalBefore !== 1) {
        failures++
        counterexample = counterexample ?? `journal delta ${journalAfter.length - journalBefore}, expected 1`
        continue
      }
      const entry = journalAfter[journalAfter.length - 1]
      if (entry.kind !== 'batch') {
        failures++
        counterexample = counterexample ?? `journal entry kind ${entry.kind}, expected batch`
        continue
      }
      // the entry carries the forward ops AND a non-empty reverse-ordered inverse
      const inverse = (entry as { inverse?: BatchOp[] }).inverse
      if (!Array.isArray(inverse) || inverse.length !== ops.length) {
        failures++
        counterexample = counterexample ?? `the batch entry's inverse carries ${Array.isArray(inverse) ? inverse.length : 'no'} ops for ${ops.length} forward ops`
        continue
      }
      // the invertibility oracle over BOTH halves of the store (§3.3 item 3)
      await store.undo()
      if (nodesSnapshot(store) !== nodesBefore) {
        failures++
        counterexample = counterexample ?? `undo() did not restore the pre-commit NODES (${arm === 1 ? 'create+edge' : arm === 2 ? 'remove+edge' : 'content'} arm)`
        continue
      }
      if (edgesSnapshot(store) !== edgesBefore) {
        failures++
        counterexample = counterexample ?? `undo() did not restore the pre-commit EDGES (${arm === 1 ? 'create+edge' : arm === 2 ? 'remove+edge' : 'content'} arm)`
      }
    }
    // NON-VACUITY of the amended population: every arm ran, and the edge draws
    // really produced the edge ops (a collapsed population is a harness defect,
    // not a `held` verdict)
    expect([...arms].sort()).toEqual(['content', 'create+edge', 'remove+edge'])
    expect(createdDrawn, 'a block CREATION with its edge was really drawn').toBeGreaterThan(0)
    expect(removedDrawn, 'a block REMOVAL with its edge was really drawn').toBeGreaterThan(0)
    // the CONTROL: an EMPTY op list must produce a journal delta of 0
    const { store: cs } = newStore()
    await cs.putNode(makeNode('c1', 'p', 'k'))
    const cBefore = cs.journal().length
    const cResult = await cs.applyBatch([])
    expect(cResult.ok).toBe(true)
    const controlDelta = cs.journal().length - cBefore
    report({ row: 'P-IM-2', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'empty op list ⇒ journal delta 0', discriminated: controlDelta === 0 } })
    expect(controlDelta).toBe(0)
    expect(counterexample ?? null).toBeNull()
  })

  it('P-IM-2 (HOST HALF) — ONE commit through the production seam issues exactly ONE batch for the whole page', async () => {
    // The audit's vacuity finding: the row above drove the STORE directly, so a
    // commit path that split the page into N batches (a per-op loop, §3.3 item 1
    // / `FS10`) was invisible. This half drives the REAL seam —
    // `pageSurfaceBlur` → `commitPageEdit` → ONE `bridge.edit.batch` — with a
    // real temp store behind the bridge, and reads the journal off that store.
    const h = await makeHostHarness()
    const before = h.store.journal().length
    pageInput()
    await pageBlur(hostPage('edited body'))
    expect(h.batch.mock.calls.length, 'ONE commit ⇒ exactly ONE batch call (§3.3 item 1; N batches is FS10)').toBe(1)
    const ops = h.batch.mock.calls[0][0] as BatchOp[]
    expect(ops.length, 'the drawn page really diffs to at least one op (non-vacuous)').toBeGreaterThan(0)
    expect(
      h.store.journal().length - before,
      'the whole page landed as exactly ONE journal entry (§3.3 item 3)',
    ).toBe(1)
    expect(h.store.journal()[h.store.journal().length - 1].kind, 'the entry is a `batch` entry').toBe('batch')
    expect(h.editController.isDirty(h.tabId), 'the acknowledged commit clears the page').toBe(false)
  })
})

// ===========================================================================
// P-IM-3 — the type apply never delete+recreates
// ===========================================================================
describe('§7 P-IM-3 — a type change preserves id/createdAt/children/props/ownedNodeIds (strat:settype-preservation)', () => {
  it('P-IM-3 — after a type apply only `type` moved, and no removeNode/fresh putNode names the target', async () => {
    const rng = makeRng(SEED ^ 0x22)
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    for (let i = 0; i < ROW_BUDGETS['P-IM-3'] && failures < STOP_AFTER; i++) {
      cases++
      const { store } = newStore()
      const current = pick(rng, TYPE_POOL)
      let target = pick(rng, TYPE_POOL)
      if (target === current) target = current === 'td' ? 'th' : 'td'
      const children: RagNodeChild[] = rng() % 2 === 0 ? [{ type: 'strong', content: 'inline', offset: 0 }] : []
      const props = rng() % 2 === 0 ? { 'data-doc-head': true, custom: 'kept' } : { custom: 'kept' }
      const node = makeNode('t', current, 'payload', { children, props })
      await store.putNode(node)
      const before = store.getNode('t')!
      const page = `<${target} data-rag-node-id="t">payload</${target}>`
      const ops = diff(page, store)
      if (ops.some((op) => op.op === 'removeNode')) {
        failures++
        counterexample = counterexample ?? `a removeNode op appeared for the type-change target (${current}→${target})`
        continue
      }
      if (ops.some((op) => op.op === 'putNode' && (op as { node: RagNode }).node.id !== 't')) {
        failures++
        counterexample = counterexample ?? 'a fresh-id putNode appeared for the type-change target'
        continue
      }
      const result = await store.applyBatch(ops)
      if (!result.ok) {
        failures++
        counterexample = counterexample ?? `the type change was rejected: ${result.error}`
        continue
      }
      const after = store.getNode('t')!
      if (after.type !== target) {
        failures++
        counterexample = counterexample ?? `type stayed ${after.type}, expected ${target}`
        continue
      }
      for (const field of ['id', 'createdAt', 'ownedNodeIds'] as const) {
        if (JSON.stringify(after[field]) !== JSON.stringify(before[field])) {
          failures++
          counterexample = counterexample ?? `field ${field} changed across the type apply`
        }
      }
      if (JSON.stringify(after.children ?? []) !== JSON.stringify(before.children ?? [])) {
        failures++
        counterexample = counterexample ?? 'children changed across the type apply'
      }
      if (JSON.stringify(after.props ?? {}) !== JSON.stringify(before.props ?? {})) {
        failures++
        counterexample = counterexample ?? 'props changed across the type apply'
      }
    }
    // the NEGATIVE GENERATOR: a delete+recreate implementation MUST fail the row
    const { store: ns } = newStore()
    const original = makeNode('t', 'p', 'payload', { props: { 'data-doc-head': true } })
    await ns.putNode(original)
    const broken: BatchOp[] = [
      { op: 'removeNode', id: 't' },
      { op: 'putNode', node: makeNode('t-fresh', 'h2', 'payload', { createdAt: '2026-12-31T00:00:00.000Z' }) },
    ]
    const brokenResult = await ns.applyBatch(broken)
    const brokenNode = ns.getNode('t')
    const negativeDiscriminates = brokenResult.ok && (brokenNode === undefined || ns.getNode('t-fresh') !== undefined)
    report({ row: 'P-IM-3', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'delete+recreate negative generator', discriminated: negativeDiscriminates } })
    expect(negativeDiscriminates).toBe(true)
    expect(counterexample ?? null).toBeNull()
  })
})

// ===========================================================================
// P-SM-1 — a failed commit is atomic and loud (SEAM-DRIVEN)
// ===========================================================================
/** The pinned typed failure record (\u00a73.5 item 5) — the closed five-member union. */
type CommitFailure = {
  kind: 'not-authorized' | 'not-resident' | 'engine-unavailable' | 'store-rejected' | 'decompose-failed'
  message: string
  failedIndex?: number
  engineCause?: 'connection-refused' | 'engine-not-spawned' | 'not-ready' | 'unavailable-state'
}
const COMPOSE_HEAD_FAILURE_KINDS: CommitFailure['kind'][] = [
  'not-authorized',
  'not-resident',
  'engine-unavailable',
  'store-rejected',
  'decompose-failed',
]
describe('\u00a77 P-SM-1 \u2014 a failed commit is atomic and loud, driven through the PRODUCTION seam', () => {
  it('P-SM-1 (SEAM) \u2014 every seam-drivable failure kind is constructed at `commit-failed` with a real store left byte-identical', async () => {
    const observed = new Map<string, CommitFailure>()
    /** Each draw returns the store's PRE-COMMIT bytes/journal, captured AFTER its
     *  own fixture setup and immediately before the blur (a draw whose setup
     *  touches the store — the `store-rejected` draw removes the node whose
     *  `setType` must fail — otherwise measures its own setup). */
    const draws: {
      label: string
      run: () => Promise<{ h: HostHarness; subject: string; bytes: string; journal: number }>
    }[] = [
      {
        label: 'decompose-failed \u2014 the adapter refuses the page (a stored table cannot round-trip, \u00a73.2)',
        run: async () => {
          const h = await makeHostHarness()
          pageInput()
          const bytes = storeBytes(h.file)
          const journal = h.store.journal().length
          await pageBlur('<table data-rag-node-id="t"><tr><td>cell</td></tr></table>')
          return { h, subject: h.tabId, bytes, journal }
        },
      },
      {
        label: 'store-rejected \u2014 the REAL store rejects the batch and rolls back',
        run: async () => {
          const h = await makeHostHarness()
          pageInput()
          // the page retypes the body; the node is removed from the store AFTER
          // the snapshot, so the batch's `setType` names a missing node and the
          // store rejects it mid-batch (its own rollback path).
          await h.store.removeNode(`${HOST_DOC}:body`)
          const bytes = storeBytes(h.file)
          const journal = h.store.journal().length
          await pageBlur(hostPage('body one').replace('<p ', '<h2 ').replace('</p>', '</h2>'))
          return { h, subject: h.tabId, bytes, journal }
        },
      },
      {
        label: 'not-resident \u2014 no store snapshot is loaded (the CacheMiss class, \u00a73.6)',
        run: async () => {
          const h = await makeHostHarness({ snapshotFails: true })
          pageInput()
          const bytes = storeBytes(h.file)
          const journal = h.store.journal().length
          await pageBlur(hostPage('edited body'))
          return { h, subject: h.tabId, bytes, journal }
        },
      },
      {
        label: 'engine-unavailable \u2014 the edit-batch seam is absent on the bridge',
        run: async () => {
          const h = await makeHostHarness()
          pageInput()
          h.dropBatchSeam()
          const bytes = storeBytes(h.file)
          const journal = h.store.journal().length
          await pageBlur(hostPage('edited body'))
          return { h, subject: h.tabId, bytes, journal }
        },
      },
    ]

    for (const draw of draws) {
      const { h, subject, bytes, journal } = await draw.run()
      const bytesAfter = storeBytes(h.file)
      const failure = hostFailure(h.host, subject)
      expect(failure, `${draw.label}: the commit must record a typed failure (never a silent success)`).toBeDefined()
      const record = failure as CommitFailure
      observed.set(record.kind, record)
      expect(
        COMPOSE_HEAD_FAILURE_KINDS.includes(record.kind),
        `${draw.label}: the kind must be one of the pinned five (\u00a73.5 item 5), got ${record.kind}`,
      ).toBe(true)
      expect(typeof record.message, `${draw.label}: the record carries a typed message`).toBe('string')
      expect(record.message.length, `${draw.label}: the message is non-empty`).toBeGreaterThan(0)
      // \u00a73.5 items 1/2 \u2014 the page stays dirty (the text is the user's only copy)
      expect(h.editController.isDirty(subject), `${draw.label}: a failed commit KEEPS the dirty flag (FS16/FS19)`).toBe(true)
      const state = hostCommitState(h.host, subject)
      expect(state.dirty, `${draw.label}: the host state reader reports the SAME dirty flag`).toBe(true)
      expect(state.failure, `${draw.label}: the host state reader reports the SAME typed record`).toEqual(record)
      // \u00a73.5 item 1 \u2014 the store is untouched (bytes + journal), read off the REAL store
      expect(bytesAfter, `${draw.label}: a failed commit must leave the store's bytes unchanged`).toBe(bytes)
      expect(h.store.journal().length, `${draw.label}: a failed commit adds ZERO journal entries`).toBe(journal)
    }

    // NON-VACUITY: the seam really drove every kind it owns. `not-authorized`
    // is NOT drivable (RECORDED GAP, re-pointed rather than demanded): the commit
    // path has NO authorization gate in this build, and this unit's spec pins no
    // authorization seam \u2014 so demanding one would need a spec amendment. The
    // member stays pinned by \u00a73.5 item 5 and is asserted as a fact below.
    expect([...observed.keys()].sort()).toEqual(['decompose-failed', 'engine-unavailable', 'not-resident', 'store-rejected'])
    const proto = Object.getOwnPropertyNames(SidebarPanes.prototype)
    expect(
      proto.filter((n) => /authoriz|authoris|authorityGrant/i.test(n)),
      'RECORDED GAP: no authorization seam exists on the host \u2014 `not-authorized` has no commit seam to drive',
    ).toEqual([])

    // the CONTROL (the SAME page/store on a SUCCESSFUL commit MUST change the bytes
    // and the journal \u2014 proving the oracle discriminates)
    const okDraw = await makeHostHarness()
    pageInput()
    await pageBlur(hostPage('edited body'))
    expect(hostFailure(okDraw.host, okDraw.tabId), 'CONTROL: the successful commit records no failure').toBeUndefined()
    expect(storeBytes(okDraw.file), 'CONTROL: the successful commit CHANGED the store bytes').not.toBe(okDraw.bytesBefore)
    expect(okDraw.store.journal().length - okDraw.journalBefore, 'CONTROL: the success landed ONE journal entry').toBe(1)
    expect(okDraw.editController.isDirty(okDraw.tabId), 'CONTROL: the success clears the page').toBe(false)
  })
})

// ===========================================================================
// P-SM-2 — the warning survives every re-derive (SEAM-DRIVEN)
// ===========================================================================
describe('\u00a77 P-SM-2 \u2014 the commit-failed state survives every re-derive path, read per witness subject', () => {
  it('P-SM-2 (SEAM) \u2014 the constructed record survives the host\'s real re-derive paths against clean/uncommitted witnesses', async () => {
    const h = await makeHostHarness()
    // the FAILED tab: a real `store-rejected` failure through the seam
    pageInput()
    await h.store.removeNode(`${HOST_DOC}:body`)
    await pageBlur(hostPage('body one').replace('<p ', '<h2 ').replace('</p>', '</h2>'))
    const failed = hostFailure(h.host, h.tabId)
    expect(failed, 'the failed tab carries the constructed record (non-vacuous: the state is not the default)').toBeDefined()
    const record = failed as CommitFailure
    expect(record.kind, 'the constructed failure is `store-rejected`').toBe('store-rejected')
    expect(record.failedIndex, 'the record carries the store\'s own `failedIndex` verbatim (\u00a73.5 item 5)').toBeDefined()

    // the WITNESS tabs (the discriminating control): a `clean` tab and an
    // `uncommitted` tab in the SAME host
    const witnessClean: TabEntry = { id: 'tab-clean', target: { kind: 'document', documentId: HOST_DOC }, title: 'clean' }
    const witnessDirty: TabEntry = { id: 'tab-uncommitted', target: { kind: 'document', documentId: HOST_DOC }, title: 'uncommitted' }
    h.host.mountTab(witnessClean)
    expect(hostCommitState(h.host, witnessClean.id).dirty, 'the clean witness is not dirty').toBe(false)
    h.host.mountTab(witnessDirty)
    pageInput()
    expect(hostCommitState(h.host, witnessDirty.id).dirty, 'the uncommitted witness is dirty').toBe(true)

    // the host's REAL re-derive paths, each driven in turn
    const envelope = (h.host as unknown as { lastTraversalEnvelope: unknown }).lastTraversalEnvelope
    const applyContentChange = (h.host as unknown as {
      applyContentChange?: (env: unknown, scope?: string | null) => void
    }).applyContentChange
    expect(typeof applyContentChange, 'the host\'s content-reconcile path must exist').toBe('function')
    const paths: { label: string; run: () => Promise<void> | void }[] = [
      { label: 'reDerive(content)', run: () => h.host.reDerive('content') },
      { label: 'reDerive(template)', run: () => h.host.reDerive('template') },
      {
        label: 'onRagStoreChanged (the store-change broadcast)',
        run: () => {
          h.host.onRagStoreChanged({ store: 'main', kind: 'structural', nodeIds: [`${HOST_DOC}:body`], edgeIds: [] } as never)
        },
      },
      {
        label: 'applyContentChange (the content reconcile)',
        run: () => applyContentChange!.call(h.host, envelope, HOST_DOC),
      },
      {
        label: 'a WHOLESALE envelope replacement',
        run: () => {
          h.runtime.loadEnvelope(envelope as never)
          ;(h.host as unknown as { rerenderAppGraph?: () => void }).rerenderAppGraph?.call(h.host)
        },
      },
    ]
    for (const path of paths) {
      await path.run()
      await new Promise((resolve) => setTimeout(resolve, 0))
      const state = hostCommitState(h.host, h.tabId)
      expect(state.failure, `the failure record must survive ${path.label} (\u00a73.5 item 6, FS17)`).toEqual(record)
      expect(state.dirty, `the failed tab is still dirty after ${path.label}`).toBe(true)
      // the witnesses must NOT read the failed tab's value (a constant oracle
      // returning the constructed state fails HERE)
      expect(hostCommitState(h.host, witnessClean.id), `the clean witness is still clean after ${path.label}`).toEqual({
        subject: witnessClean.id,
        dirty: false,
      })
      const dirtyWitness = hostCommitState(h.host, witnessDirty.id)
      expect(dirtyWitness.dirty, `the uncommitted witness is still dirty after ${path.label}`).toBe(true)
      expect(dirtyWitness.failure, `the uncommitted witness gained NO failure record after ${path.label}`).toBeUndefined()
    }

    // the USER-VISIBLE half (\u00a73.5 item 4, FS17): with the failed tab active the
    // warning is authored into the assembled graph, still, after every re-derive
    h.host.mountTab({ id: h.tabId, target: { kind: 'document', documentId: HOST_DOC }, title: 'failed' })
    const html = h.runtime.renderedHtmlResult().renderedHtml
    expect(html.includes('page-commit-warning') && html.includes('commit-failed'), 'the warning is STILL authored after the re-derives (FS17)').toBe(true)

    // the CONTROL: a SUCCESSFUL commit on the same tab leaves it `clean` AND
    // DELETES the map entry (\u00a711.8 item 3)
    pageInput()
    await pageBlur(hostPage('body one again'))
    expect(hostFailure(h.host, h.tabId), 'CONTROL: the success DELETES the record').toBeUndefined()
    expect(hostCommitState(h.host, h.tabId), 'CONTROL: the success leaves the subject clean with no failure').toEqual({
      subject: h.tabId,
      dirty: false,
    })
  })
})


// ===========================================================================
// P-TP-1 — the decode + diff are TOTAL and DETERMINISTIC
// ===========================================================================
describe('\u00a77 P-TP-1 \u2014 the pipeline terminates with a discriminated result, never a native throw (strat:decode-total-deterministic)', () => {
  it('P-TP-1 \u2014 every malformed-shape draw returns a discriminated result and the same draw yields the same op list twice', async () => {
    const rng = makeRng(SEED ^ 0x55)
    const shapes = ['malformed page html', 'empty page', 'unknown rag id', 'duplicated ids', 'textarea in the page', 'missing doc-head', 'quarantined node', 'nested depth'] as const
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    let refusedDraws = 0
    let mappedDraws = 0
    /** The matrix members actually drawn (stratified, so none can be sampled
     *  away — the pinned LCG's low bits are a measured fixed point). */
    const drawnShapes = new Set<string>()

    // ---- the REAL quarantined fixture (the second remand's repair of the
    // mislabelled member): a record whose STORED hash disagrees with its derived
    // hash is quarantined at boot and excluded from `listNodes()` — so a page
    // naming it draws the genuine "quarantined node" state instead of an
    // ordinary page carrying that label.
    const qDir = mkdtempSync(join(tmpdir(), 'provident-u-edit-1-q-'))
    const qFile = join(qDir, 'rag.json')
    const qSeed = createJsonRagStore({ path: qFile })
    await qSeed.putNode(makeNode('b2', 'p', 'second'))
    const rawFile = JSON.parse(readFileSync(qFile, 'utf8')) as { nodes: { id: string; hash?: string }[] }
    rawFile.nodes.find((n) => n.id === 'b2')!.hash = 'deadbeef'
    writeFileSync(qFile, JSON.stringify(rawFile))
    const quarantinedStore = createJsonRagStore({ path: qFile })
    expect(
      quarantinedStore.status().quarantined,
      'the drawn "quarantined node" state is REAL (the tampered record hash quarantines at boot) — the previous member was mislabelled',
    ).toContain('b2')
    expect(quarantinedStore.listNodes().some((n) => n.id === 'b2'), 'a quarantined node is never reported active').toBe(false)

    for (let i = 0; i < ROW_BUDGETS['P-TP-1'] && stopNeeded(failures); i++) {
      cases++
      const shape = shapes[i % shapes.length]
      drawnShapes.add(shape)
      const { store } = shape === 'quarantined node' ? { store: quarantinedStore } : newStore()
      if (shape !== 'quarantined node') await seedNodes(store, [makeNode('b1', 'p', 'known'), makeNode('b2', 'p', 'second')])
      const page = pageForShape(shape, i)
      try {
        // the DECODE through the adapter is a discriminated result, never a throw
        const decodedA = decodePage(page)
        const decodedB = decodePage(page)
        if (decodedA.ok !== decodedB.ok) {
          failures++
          counterexample = counterexample ?? `the decode was not deterministic (${shape})`
          continue
        }
        if (!decodedA.ok) {
          // the TYPED failure arm (the FS5/ST-5 warning class)
          refusedDraws++
          if (typeof decodedA.message !== 'string' || decodedA.message.length === 0) {
            failures++
            counterexample = counterexample ?? `the refusal arm carried no message (${shape})`
          }
          if (JSON.stringify(decodedA) !== JSON.stringify(decodedB)) {
            failures++
            counterexample = counterexample ?? `the refusal arm was not deterministic (${shape})`
          }
          continue
        }
        // the decode's blocks always carry a RAG id \u2014 an id-less block is never minted
        for (const block of decodedA.blocks) {
          if (typeof block.ragId !== 'string' || block.ragId.length === 0) {
            failures++
            counterexample = counterexample ?? `an id-less block was minted (${shape})`
          }
        }
        const opsA = buildPageOps(decodedA, snapshotOf(store), 'doc')
        const opsB = buildPageOps(decodedB, snapshotOf(store), 'doc')
        if (JSON.stringify(opsA) !== JSON.stringify(opsB)) {
          failures++
          counterexample = counterexample ?? `the same draw produced different op lists (${shape})`
          continue
        }
        if (opsA.ok) mappedDraws++
        else {
          refusedDraws++
          if (typeof opsA.message !== 'string' || opsA.message.length === 0) {
            failures++
            counterexample = counterexample ?? `the op-builder's refusal arm carried no message (${shape})`
          }
        }
        // ---- the DUPLICATED-ID semantics (the second remand's repair: the old
        // member asserted only determinism/no-throw, so a DOUBLE WRITE of the same
        // block passed). A page that renders the same ragId twice may not produce
        // two ops naming it: at most ONE write per ragId, or the typed refusal.
        if (shape === 'duplicated ids') {
          const dupBlocks = decodedA.blocks.filter((b) => b.ragId === 'b1')
          expect(dupBlocks.length, 'the duplicated-id draw really renders the SAME ragId twice (non-vacuous)').toBe(2)
          if (opsA.ok) {
            const names = opsA.ops.flatMap((op) => nodeIdsOf([op]))
            const writes = names.filter((id) => id === 'b1').length
            if (writes > 1) {
              failures++
              counterexample = counterexample ?? `a page rendering the SAME ragId twice produced ${writes} ops naming it (a double write)`
            }
          }
        }
        // ---- the QUARANTINED-NODE semantics: the pipeline must never write into
        // a quarantined id (nor resurrect a quarantined record), and the store's
        // quarantine set survives the draw untouched.
        if (shape === 'quarantined node') {
          if (opsA.ok) {
            const names = opsA.ops.flatMap((op) => nodeIdsOf([op]))
            if (names.includes('b2')) {
              failures++
              counterexample = counterexample ?? 'an op named the QUARANTINED node id (a quarantined record must never be written or resurrected)'
            }
          }
          if (!quarantinedStore.status().quarantined.includes('b2')) {
            failures++
            counterexample = counterexample ?? 'the draw dropped the store\'s quarantine set (a quarantined record was resurrected)'
          }
        }
      } catch (err) {
        failures++
        counterexample = counterexample ?? `a native throw escaped the pipeline (${shape}): ${(err as Error).name}`
      }
    }
    // the NEGATIVE generator: a depth-10 000 element tree must terminate through
    // the adapter (the package's own MAX_DEPTH = 512 guard), never a stack overflow
    let deep = 'leaf'
    for (let d = 0; d < 10000; d++) deep = `<span>${deep}</span>`
    let deepThrew = false
    try {
      const deepDecoded = decodePage(`<p data-rag-node-id="b1">${deep}</p>`)
      deepThrew = typeof deepDecoded.ok !== 'boolean'
    } catch {
      deepThrew = true
    }
    // the CONTROL: a valid, unchanged page decodes and maps to a SUCCESS with an
    // EMPTY op list \u2014 proving the oracle discriminates rather than always
    // returning a refusal
    const controlStore = newStore().store
    await controlStore.putNode(makeNode('c1', 'p', 'k'))
    const controlDecoded = decodePage(`<p data-rag-node-id="c1">k</p>`)
    const controlOps = controlDecoded.ok ? buildPageOps(controlDecoded, snapshotOf(controlStore), 'doc') : null
    const controlDiscriminates = controlOps !== null && controlOps.ok && controlOps.ops.length === 0
    expect(controlDiscriminates).toBe(true)
    // NON-VACUITY: the population really did exercise BOTH arms, and EVERY matrix
    // member (including the duplicated-id and the real quarantine draws) was drawn
    expect(mappedDraws).toBeGreaterThan(0)
    expect(refusedDraws).toBeGreaterThan(0)
    expect([...drawnShapes].sort()).toEqual([...shapes].sort())
    report({ row: 'P-TP-1', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'valid unchanged page \u21d2 ok with an empty op list', discriminated: controlDiscriminates } })
    expect(deepThrew).toBe(false)
    expect(counterexample ?? null).toBeNull()
  })
})

function stopNeeded(failures: number): boolean {
  return failures < STOP_AFTER
}

function pageForShape(shape: string, i: number): string {
  switch (shape) {
    case 'malformed page html':
      return `<p data-rag-node-id="b1">unclosed <strong>bold`
    case 'empty page':
      return ''
    case 'unknown rag id':
      return `<p data-rag-node-id="ghost">text</p>${`<p data-rag-node-id="b1">known</p>`}`
    case 'duplicated ids':
      return `<p data-rag-node-id="b1">known</p><p data-rag-node-id="b1">known-again</p>`
    case 'textarea in the page':
      return `<textarea id="textarea-b1">legacy</textarea><p data-rag-node-id="b1">known</p>`
    case 'missing doc-head':
      return `<p data-rag-node-id="b1">known</p>`
    case 'quarantined node':
      return `<p data-rag-node-id="b2">second</p>`
    default: {
      let deep = 'x'
      for (let d = 0; d < 2000 + i; d++) deep = `<span>${deep}</span>`
      return `<p data-rag-node-id="b1">${deep}</p>`
    }
  }
}

// ===========================================================================
// P-TP-2 — idempotence: a commit of an unchanged page is a no-op
// ===========================================================================
describe('§7 P-TP-2 — committing twice with no edit between is a no-op (strat:empty-diff-idempotent)', () => {
  it('P-TP-2 — the second commit produces an empty op list, no journal delta, no persist delta', async () => {
    const rng = makeRng(SEED ^ 0x66)
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    for (let i = 0; i < ROW_BUDGETS['P-TP-2'] && stopNeeded(failures); i++) {
      cases++
      const { store, file } = newStore()
      const nodes = Array.from({ length: intBetween(rng, 1, 5) }, (_, k) => makeNode(`n${k}`, 'p', `body-${k}`))
      await seedNodes(store, nodes)
      const overrides = new Map<string, { inner: string }>()
      for (const node of nodes) if (rng() % 2 === 0) overrides.set(node.id, { inner: `${node.content}-edit` })
      const page = pageFor(nodes, overrides)
      const first = await store.applyBatch(diff(page, store))
      if (!first.ok && diff(page, store).length > 0) {
        failures++
        counterexample = counterexample ?? `the first commit was rejected: ${first.error}`
        continue
      }
      // the second commit re-decodes the COMMITTED store against the SAME page
      const secondOps = diff(page, store)
      if (secondOps.length !== 0) {
        failures++
        counterexample = counterexample ?? `the second commit produced ${secondOps.length} ops (expected an empty list)`
        continue
      }
      const journalBefore = store.journal().length
      const bytesBefore = storeBytes(file)
      const second = await store.applyBatch(secondOps)
      if (!second.ok) {
        failures++
        counterexample = counterexample ?? 'the empty second commit was rejected'
        continue
      }
      if (store.journal().length !== journalBefore) {
        failures++
        counterexample = counterexample ?? 'the second commit added a journal entry'
      }
      if (storeBytes(file) !== bytesBefore) {
        failures++
        counterexample = counterexample ?? 'the second commit persisted again'
      }
      // a draw that perturbs only UNCOMPARED DOM detail must also be a no-op
      const decorated = page.replace(/<p /g, '<p class="runtime-prop" style="color:red" ')
      const decoratedOps = diff(decorated, store)
      if (decoratedOps.length !== 0) {
        failures++
        counterexample = counterexample ?? `an uncompared-prop difference produced ${decoratedOps.length} ops`
      }
    }
    // the CONTROL: one compared-field change MUST produce a non-empty op list
    const { store: cs } = newStore()
    await cs.putNode(makeNode('c1', 'p', 'k'))
    const controlOps = diff('<p data-rag-node-id="c1">changed</p>', cs)
    const controlDiscriminates = controlOps.length > 0
    report({ row: 'P-TP-2', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'one compared-field change ⇒ a non-empty op list', discriminated: controlDiscriminates } })
    expect(controlDiscriminates).toBe(true)
    expect(counterexample ?? null).toBeNull()
  })
})
