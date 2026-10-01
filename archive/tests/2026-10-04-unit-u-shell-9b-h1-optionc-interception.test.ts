// tests/unit-u-shell-9b-h1-optionc-interception.test.ts — Unit U-SHELL-9b
// H1 / W2-N13: the Option-C commit interception + the provident confirmation
// strip (docs/specs/unit-u-shell-9b-cross-document-shared.md §2.9).
//
// TestWriter RED set written from §2.9 ALONE, BEFORE implementation.
//
// Contract exercised:
//   1. `sharedCommitStripContent({ warning, selectedOwnerIds })` authors the
//      fork / mutate-all / cancel buttons + (only when `requireChecklist`) the
//      sharing-document checklist with the editing document default-selected.
//   2. An unshared blur runs the normal commit (bridge `edit.commit` once),
//      NO strip.
//   3. A shared blur does NOT write; the strip is present in the graph.
//   4. Fork applies `planFork` through ONE `edit.batch`, clears the strip, and
//      leaves the other owner's X intact (the 2-owner store fixture).
//   5. >2 owners: the checklist selection migrates only the chosen documents;
//      F10b (empty selection) = no fork ops + an unchanged store.
//   6. Mutate-all applies the single same-id `putNode`; no fork node.
//   7. Cancel makes no `edit.batch` call and clears the strip.
//   8. A blocked reverse map (lastSnapshot/edges unavailable) ⇒ no write.
//   9. F7: `edit.batch` returning `{ok:false}` leaves the store unchanged and
//      the warn/strip still available.
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { LegacyNodeData } from 'provident-ssr'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
  type BatchOp,
  type BatchResult,
} from '../src/main/rag-store.js'
import * as crossDoc from '../src/renderer/cross-document-shared.js'
import { buildTraversal } from '../src/main/traversal.js'
import { assembleAppGraphEnvelope } from '../src/renderer/pane-graph.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-shape.js'

beforeAll(() => {
  installShim()
})

// ===========================================================================
// Guarded access to the §2.9 surface (absent → labelled RED, never a bare
// TypeError from the test authoring).
// ===========================================================================
interface WarningLike {
  nodeId: string
  editingDocumentId: string
  owners: string[]
  options: Array<'fork' | 'mutate-all'>
  requireChecklist: boolean
  blocked?: boolean
  reason?: string
}
function requireStrip(): (input: { warning: WarningLike; selectedOwnerIds?: string[] }) => LegacyNodeData {
  const fn = (crossDoc as unknown as {
    sharedCommitStripContent?: (input: { warning: WarningLike; selectedOwnerIds?: string[] }) => LegacyNodeData
  }).sharedCommitStripContent
  if (typeof fn !== 'function') {
    throw new Error('sharedCommitStripContent is not implemented (U-SHELL-9b H1 RED — needs the Implementer)')
  }
  return fn
}

const STRIP_ID = 'pane-shared-commit-strip'

// ===========================================================================
// Pure helpers — collect authored nodes by id / by data marker.
// ===========================================================================
function walkNode(node: LegacyNodeData | undefined, visit: (n: LegacyNodeData) => void): void {
  if (node == null || typeof node !== 'object') return
  visit(node)
  for (const c of node.children ?? []) walkNode(c as LegacyNodeData, visit)
}
function collected(root: LegacyNodeData, predicate: (n: LegacyNodeData) => boolean): LegacyNodeData[] {
  const out: LegacyNodeData[] = []
  walkNode(root, (n) => {
    if (predicate(n)) out.push(n)
  })
  return out
}
function byId(root: LegacyNodeData, id: string): LegacyNodeData | undefined {
  return collected(root, (n) => n.props?.id === id)[0]
}
function ownerToggles(root: LegacyNodeData): LegacyNodeData[] {
  return collected(root, (n) => n.props?.['data-shared-commit-owner'] === 'true')
}

// ===========================================================================
// §2.9 — sharedCommitStripContent (pure)
// ===========================================================================
describe('U-SHELL-9b H1 — sharedCommitStripContent (spec §2.9)', () => {
  const warn2: WarningLike = {
    nodeId: 'X',
    editingDocumentId: 'doc-a',
    owners: ['doc-a', 'doc-b'],
    options: ['fork', 'mutate-all'],
    requireChecklist: false,
  }
  const warn3: WarningLike = {
    nodeId: 'X',
    editingDocumentId: 'doc-a',
    owners: ['doc-a', 'doc-b', 'doc-c'],
    options: ['fork', 'mutate-all'],
    requireChecklist: true,
  }

  it('authors distinct fork / mutate-all / cancel buttons with click handlers', () => {
    const strip = requireStrip()({ warning: warn2, selectedOwnerIds: ['doc-a'] })
    expect(strip.props?.id).toBe(STRIP_ID)
    for (const id of [`shared-commit-fork`, `shared-commit-mutate-all`, `shared-commit-cancel`]) {
      const button = byId(strip, id)
      expect(button, `${id} is authored`).toBeDefined()
      expect(button!.type).toBe('button')
      expect(button!.handlers?.some((h) => h.event === 'click')).toBe(true)
    }
  })

  it('authors the >2-owner checklist with the editing document default-selected', () => {
    const strip = requireStrip()({ warning: warn3, selectedOwnerIds: undefined })
    const toggles = ownerToggles(strip)
    expect(toggles.map((t) => t.props?.['data-owner-document-id']).sort()).toEqual(['doc-a', 'doc-b', 'doc-c'])
    const selected = toggles.filter((t) => t.props?.['data-selected'] === 'true')
    expect(selected.map((t) => t.props?.['data-owner-document-id'])).toEqual(['doc-a'])
  })

  it('honours an explicit checklist selection over the default', () => {
    const strip = requireStrip()({ warning: warn3, selectedOwnerIds: ['doc-a', 'doc-c'] })
    const selected = ownerToggles(strip)
      .filter((t) => t.props?.['data-selected'] === 'true')
      .map((t) => t.props?.['data-owner-document-id'])
    expect(selected.sort()).toEqual(['doc-a', 'doc-c'])
  })

  it('authors NO checklist at exactly 2 owners', () => {
    const strip = requireStrip()({ warning: warn2, selectedOwnerIds: ['doc-a'] })
    expect(ownerToggles(strip)).toHaveLength(0)
  })
})

// ===========================================================================
// Host fixture — a real store + a live snapshot bridge so fork/mutate-all
// apply through the SAME `applyBatch` primitive the UI uses.
// ===========================================================================
const NOW = new Date().toISOString()
function n(id: string, type: RagNode['type'], content: string, extra: Partial<RagNode> = {}): RagNode {
  return { id, type, content, ownedNodeIds: [], createdAt: NOW, updatedAt: NOW, ...extra }
}
function e(id: string, kind: RagEdge['kind'], source: string, target: string, documentIds?: string[]): RagEdge {
  return { id, kind, source, target, documentIds, createdAt: NOW, updatedAt: NOW }
}

async function seedStore(store: RagStore, owners: number): Promise<void> {
  await store.putNode(n('headA', 'h1', 'Doc A'))
  await store.putNode(n('doc-a', 'div', ''))
  await store.putNode(n('headB', 'h1', 'Doc B'))
  await store.putNode(n('doc-b', 'div', ''))
  if (owners >= 3) {
    await store.putNode(n('headC', 'h1', 'Doc C'))
    await store.putNode(n('doc-c', 'div', ''))
  }
  await store.putNode(n('childX', 'p', 'child'))
  await store.putNode(n('X', 'p', 'shared body', { ownedNodeIds: ['childX'] }))
  await store.putEdge(e('ea-head', 'doc-head', 'headA', 'doc-a', ['doc-a']))
  await store.putEdge(e('ea-next', 'next-section', 'headA', 'X', ['doc-a']))
  await store.putEdge(e('ea-end', 'doc-end', 'X', 'doc-a', ['doc-a']))
  await store.putEdge(e('eb-head', 'doc-head', 'headB', 'doc-b', ['doc-b']))
  await store.putEdge(e('eb-next', 'next-section', 'headB', 'X', ['doc-b']))
  await store.putEdge(e('eb-end', 'doc-end', 'X', 'doc-b', ['doc-b']))
  const sharedDocs = ['doc-a', 'doc-b']
  if (owners >= 3) {
    await store.putEdge(e('ec-head', 'doc-head', 'headC', 'doc-c', ['doc-c']))
    await store.putEdge(e('ec-next', 'next-section', 'headC', 'X', ['doc-c']))
    await store.putEdge(e('ec-end', 'doc-end', 'X', 'doc-c', ['doc-c']))
    sharedDocs.push('doc-c')
  }
  await store.putEdge(e('eXc', 'parent-child', 'X', 'childX', sharedDocs))
}

interface HarnessOptions {
  owners?: number
  failBatch?: boolean
  omitEdges?: boolean
}

async function makeHarness(opts: HarnessOptions = {}) {
  installShim()
  const dir = mkdtempSync(join(tmpdir(), 'ushell9b-h1-'))
  const store = createJsonRagStore({ path: join(dir, 'rag.json') })
  await seedStore(store, opts.owners ?? 2)

  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()

  const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T
  const snapshot = async (): Promise<Record<string, unknown>> => {
    const payload: Record<string, unknown> = {
      store: 'default',
      nodes: clone(store.listNodes()),
    }
    if (!opts.omitEdges) payload.edges = clone(store.listEdges())
    return payload
  }

  const batchCalls: BatchOp[][] = []
  const batch = vi.fn(async (ops: BatchOp[]): Promise<BatchResult> => {
    batchCalls.push(ops)
    if (opts.failBatch) return { ok: false, error: 'forced batch failure', failedIndex: 0 }
    return store.applyBatch(ops)
  })
  const commit = vi.fn(async (nodeId: string, _content: string) => ({ ok: true as const, nodeId }))

  const documents = [{ documentId: 'doc-a', title: 'Doc A', path: [], tags: [] }, { documentId: 'doc-b', title: 'Doc B', path: [], tags: [] }]
  if ((opts.owners ?? 2) >= 3) documents.push({ documentId: 'doc-c', title: 'Doc C', path: [], tags: [] })

  const operatorSettings: Record<string, unknown> = {
    enabledPanes: [],
    enabledOperatorPanes: [],
    panesInitialized: true,
    defaultDocumentId: null,
    topK: 5,
    theme: 'system',
  }
  const bridge = {
    security: { get: async () => ({ token: null, enabled: ['read', 'dispatch', 'rag'] }) },
    edit: {
      commit,
      batch,
      onRagStoreChanged: () => () => {},
    },
    rag: {
      query: async (q: string) => ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }),
      snapshot,
      backlinks: async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }),
      docHeads: async () => ({ documents }),
      stores: async () => ({ stores: [] }),
    },
    template: {
      get: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      onTemplateChanged: () => () => {},
    },
    operatorSettings: {
      get: async () => operatorSettings,
      set: async (patch: Record<string, unknown>) => {
        Object.assign(operatorSettings, patch)
        return operatorSettings
      },
      onChanged: () => () => {},
    },
  }
  const backRefs = new Map<string, string[]>()
  let host: SidebarPanes
  const editController = createEditController({
    backRefs,
    commit,
    onRebuild: (kind) => void host.reDerive(kind),
  })
  host = new SidebarPanes({ mount, operatorMount, registry, bridge: bridge as never, backRefs, editController })
  const runtime = new Runtime({
    mount,
    envelope: {
      template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
      content: [],
      clientConfig: { runInstantiation: true, runRendering: true },
    } as never,
  })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, mount, store, dir, batchCalls, batch, commit }
}

function cleanup(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function stripRoot(runtime: Runtime): LegacyNodeData | undefined {
  return runtime
    .materializedContentRoots()
    .find((root) => (root.props as { id?: unknown } | undefined)?.id === STRIP_ID)
}
function sidebarApi(): Record<string, (...args: unknown[]) => unknown> {
  const sidebar = (globalThis as unknown as { window: { provident: { sidebar?: unknown } } }).window.provident
    .sidebar
  if (sidebar == null) throw new Error('window.provident.sidebar not installed')
  return sidebar as Record<string, (...args: unknown[]) => unknown>
}

// ===========================================================================
// U-EDIT-1 §2.1/§11.7 (the 2026-09-21 amendment) — the app-graph / stage
// render, the re-derived surface census. The single editable surface is
// authored at the app-graph / stage-assembly layer (`assembleAppGraphEnvelope`),
// NOT as a traversal-envelope payload: the census is taken over that render
// (§8.1 `FS1`) AND the DOM the runtime mounts — never a traversal-level check.
// ===========================================================================
/** The focused document of this harness's boot (`SidebarPanes._currentDocumentId`). */
const FOCUSED_DOCUMENT_ID = 'doc-a'
/** The pinned surface id + marker (§2.1's stable-authored-id row). */
const PAGE_EDIT_SURFACE_ID = 'page-edit-surface'
const DATA_EDIT_SURFACE = 'data-edit-surface'

function authoredIdOf(node: LegacyNodeData | undefined): unknown {
  return (node?.props as Record<string, unknown> | undefined)?.id
}

/** The app-graph / stage render of the focused document (PURE assembly). */
function appGraphOf(store: RagStore): LegacyNodeData[] {
  const traversal = buildTraversal({ store, documentIds: [FOCUSED_DOCUMENT_ID], zoneName: 'main' })
  const assembly = assembleAppGraphEnvelope({
    traversalEnvelope: traversal.envelope,
    registry: createPaneRegistry(),
    ctx: {},
    documentId: FOCUSED_DOCUMENT_ID,
  })
  const out: LegacyNodeData[] = []
  for (const payload of assembly.envelope.content ?? []) {
    for (const root of (payload.content ?? []) as LegacyNodeData[]) {
      walkNode(root, (n) => out.push(n))
    }
  }
  return out
}

/** The ONE authored surface root of the app-graph render (§2.1 cardinality). */
function surfaceRootOfAppGraph(store: RagStore): LegacyNodeData | undefined {
  return appGraphOf(store).find((n) => authoredIdOf(n) === PAGE_EDIT_SURFACE_ID)
}

/** The `[contenteditable]` census of the DOM the runtime mounted. */
function contenteditableCensus(mount: { querySelectorAll(sel: string): Array<{ getAttribute(k: string): string | null }> }) {
  const editable = mount.querySelectorAll('[contenteditable]')
  return {
    count: editable.length,
    ids: editable.map((el) => el.getAttribute('id')),
    markers: editable.map((el) => el.getAttribute(DATA_EDIT_SURFACE)),
  }
}

// ===========================================================================
// §2.9 — the bridge surface + interception
// ===========================================================================
describe('U-SHELL-9b H1 — commit interception (spec §2.9)', () => {
  it('registers the commit-choice methods on window.provident.sidebar', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      const s = sidebarApi()
      expect(typeof s.sharedCommitFork).toBe('function')
      expect(typeof s.sharedCommitMutateAll).toBe('function')
      expect(typeof s.sharedCommitCancel).toBe('function')
    } finally {
      cleanup(h.dir)
    }
  })

  // ---------------------------------------------------------------------
  // U-EDIT-1 §6.3 row 20 (R-C) — the per-node textarea DRIVER this block used
  // (`sidebarApi().textareaInput` / `textareaBlur`) is REMOVED with the textarea
  // model (§5 items 3/6, §5.1): every per-node textarea edit becomes a page
  // commit (§3.3). The shared-commit interception still runs BEFORE the write on
  // that page commit — but `docs/specs/unit-u-edit-1-whole-page-editing.md`
  // pins the commit CONTRACT and never pins a page-commit seam NAME (the
  // §6.3 row 24 "page-commit seam's own assertion" has no interface in the
  // spec). Driving the H1 apply-handler expectations through an invented seam
  // would pin an unpinned API, so they are NOT re-driven here; the pure
  // interception/plan surface keeps its pin in
  // tests/unit-u-shell-9b-cross-document-shared.test.ts. Reported as a
  // spec conflict (missing page-commit seam name), not weakened.
  // ---------------------------------------------------------------------
  it('U-EDIT-1 §2.1/§5.1 (R-C) — the interception seam survives, and the removed per-node editing API commits nothing', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      // the three commit-choice seams are still registered (§2.9 — untouched by
      // the U-EDIT-1 mode/host removal).
      const s = sidebarApi()
      expect(typeof s.sharedCommitFork).toBe('function')
      expect(typeof s.sharedCommitMutateAll).toBe('function')
      expect(typeof s.sharedCommitCancel).toBe('function')

      // the per-node textarea editing capability is GONE: the bridge no longer
      // exposes the per-node textarea input/blur surface (§5 item 6).
      expect(Object.keys(s).filter((k) => /^textarea(Input|Blur)$/.test(k))).toEqual([])

      // FS1 — the stage authors NO per-node `contenteditable` host: the page
      // surface is the only editable root (§2.1), so a per-node edit can no
      // longer reach a commit and the interception has exactly ONE entry point.
      // Re-derived against the APP-GRAPH / STAGE render (§2.1's amended
      // authoring row, §11.7): the surface is authored by the pure
      // `assembleAppGraphEnvelope` builder — NOT as a traversal-envelope payload.
      const authored = appGraphOf(h.store)
      const surfaces = authored.filter((n) => authoredIdOf(n) === PAGE_EDIT_SURFACE_ID)
      expect(surfaces).toHaveLength(1)
      expect((surfaces[0].props as Record<string, unknown>)[DATA_EDIT_SURFACE]).toBe(FOCUSED_DOCUMENT_ID)
      expect((surfaces[0].props as Record<string, unknown>).contenteditable).toBe(true)
      const authoredRagRoots = authored.filter((n) => typeof (n.props as Record<string, unknown> | undefined)?.['data-rag-node-id'] === 'string')
      expect(authoredRagRoots.length).toBeGreaterThan(0)
      // FS1 — ZERO per-node editable hosts in the assembled app graph.
      expect(authoredRagRoots.filter((r) => (r.props as Record<string, unknown> | undefined)?.contenteditable === true)).toEqual([])

      // …and the same census on the DOM the runtime mounted (§8.1 FS1's DOM half):
      // exactly ONE `[contenteditable]` root, and it is the authored surface.
      const census = contenteditableCensus(h.mount as never)
      expect(census.count).toBe(1)
      expect(census.ids).toEqual([PAGE_EDIT_SURFACE_ID])
      expect(census.markers).toEqual([FOCUSED_DOCUMENT_ID])
      for (const el of (h.mount as never as { querySelectorAll(sel: string): Array<{ getAttribute(k: string): string | null }> }).querySelectorAll('[data-rag-node-id]')) {
        expect(el.getAttribute('contenteditable')).toBeNull()
      }

      // FS21 — NO textarea child is authored at all: the traversal-authored
      // per-node editing child is DROPPED entirely (§5.1 as amended 2026-09-21 —
      // §11 amendment `11.9` item 2), so no "inert" artifact is left to route a
      // per-node edit and the census is ZERO.
      const perNodeEditingChildren = authoredRagRoots.flatMap((r) =>
        (r.children ?? []).filter((c) => (c as { type?: unknown }).type === 'textarea'),
      )
      expect(perNodeEditingChildren).toEqual([])
      // NON-VACUITY: the document's authored subtree really was collected, so
      // the zero census is not an empty-walk artifact.
      expect(authoredRagRoots.length).toBeGreaterThan(0)
    } finally {
      cleanup(h.dir)
    }
  })
})

