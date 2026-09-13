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
const NOTICE_ID = 'pane-shared-commit-notice'

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
    editingMode: 'textarea',
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
function noticeRoot(runtime: Runtime): LegacyNodeData | undefined {
  return runtime
    .materializedContentRoots()
    .find((root) => (root.props as { id?: unknown } | undefined)?.id === NOTICE_ID)
}
function sidebarApi(): Record<string, (...args: unknown[]) => unknown> {
  const sidebar = (globalThis as unknown as { window: { provident: { sidebar?: unknown } } }).window.provident
    .sidebar
  if (sidebar == null) throw new Error('window.provident.sidebar not installed')
  return sidebar as Record<string, (...args: unknown[]) => unknown>
}
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
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

  it('§2.9 — an unshared blur runs the normal commit (no strip)', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput('headA')
      sidebarApi().textareaBlur('headA', 'edited head')
      await flush()
      expect(h.commit).toHaveBeenCalledTimes(1)
      expect(h.batchCalls).toHaveLength(0)
      expect(stripRoot(h.runtime)).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('§2.9 — a shared blur does NOT write; the confirmation strip appears in the graph', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput('X')
      sidebarApi().textareaBlur('X', 'edited shared')
      await flush()
      expect(h.commit).not.toHaveBeenCalled()
      expect(h.batchCalls).toHaveLength(0)
      const strip = stripRoot(h.runtime)
      expect(strip, 'the H1 strip is a materialized content root').toBeDefined()
      expect((h.mount as unknown as { innerHTML: string }).innerHTML).toContain('shared-commit-fork')
      expect((h.mount as unknown as { innerHTML: string }).innerHTML).toContain('shared-commit-mutate-all')
      expect((h.mount as unknown as { innerHTML: string }).innerHTML).toContain('shared-commit-cancel')
    } finally {
      cleanup(h.dir)
    }
  })
})

// ===========================================================================
// §2.9 — fork / mutate-all / cancel apply handlers
// ===========================================================================
describe('U-SHELL-9b H1 — fork / mutate-all / cancel (spec §2.9, §2.3, §4 F7/F10b)', () => {
  it('§3.5 — with exactly 2 owners, the fork migrates only the editing document (other owner intact)', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput('X')
      sidebarApi().textareaBlur('X', 'edited shared')
      await h.host.sharedCommitFork()
      expect(h.batchCalls).toHaveLength(1)
      expect(h.batchCalls[0].length).toBeGreaterThan(0)
      // The original X survives, owned by doc-b.
      expect(h.store.getNode('X')!.content).toBe('shared body')
      expect(h.store.getEdge('eb-next')!.target).toBe('X')
      // doc-a's head now points at the fork (a NEW id).
      const headEdge = h.store.listEdges().find((x) => x.source === 'headA' && x.kind === 'next-section')
      expect(headEdge, 'doc-a has a re-pointed head edge').toBeDefined()
      expect(headEdge!.target).not.toBe('X')
      // §2.3/§2.9 — the fork preserves the user's pending edit for the editing
      // document (the original X keeps the pre-edit content).
      expect(h.store.getNode(headEdge!.target)!.content).toBe('edited shared')
      expect(h.store.getEdge('ea-next')).toBeUndefined()
      // The owned subtree was deep-copied.
      const forkChild = h.store.listNodes().find((x) => x.id !== 'childX' && x.content === 'child')
      expect(forkChild, 'the owned child was deep-copied').toBeDefined()
      // The strip is cleared once resolved.
      expect(stripRoot(h.runtime)).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('AF1-1 (adversarial) — the fork PRESERVES the pending edited content for the editing document', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput('X')
      sidebarApi().textareaBlur('X', 'the user edit')
      await h.host.sharedCommitFork()
      const headEdge = h.store.listEdges().find((x) => x.source === 'headA' && x.kind === 'next-section')!
      // The fork carries the edit; the original (owned by doc-b) is untouched.
      expect(h.store.getNode(headEdge.target)!.content).toBe('the user edit')
      expect(h.store.getNode('X')!.content).toBe('shared body')
    } finally {
      cleanup(h.dir)
    }
  })

  it('§3.6 — >2 owners: the checklist selection migrates only the chosen documents', async () => {
    const h = await makeHarness({ owners: 3 })
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput('X')
      sidebarApi().textareaBlur('X', 'edited shared')
      await h.host.sharedCommitFork(['doc-a', 'doc-c'])
      expect(h.batchCalls).toHaveLength(1)
      // doc-b keeps the original X + the shared subtree edge.
      expect(h.store.getEdge('eXc')!.documentIds).toEqual(['doc-b'])
      expect(h.store.getEdge('eb-next')!.target).toBe('X')
      expect(h.store.getNode('X')!.content).toBe('shared body')
      // doc-a + doc-c now point at the fork.
      const forkA = h.store.listEdges().find((x) => x.source === 'headA' && x.kind === 'next-section')
      const forkC = h.store.listEdges().find((x) => x.source === 'headC' && x.kind === 'next-section')
      expect(forkA!.target).not.toBe('X')
      expect(forkC!.target).toBe(forkA!.target)
      expect(h.store.getEdge('ea-next')).toBeUndefined()
      expect(h.store.getEdge('ec-next')).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('F10b — an empty checklist selection is a no-op (no fork ops, store unchanged)', async () => {
    const h = await makeHarness({ owners: 3 })
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput('X')
      sidebarApi().textareaBlur('X', 'edited shared')
      await h.host.sharedCommitFork([])
      expect(h.batchCalls).toHaveLength(0)
      expect(h.store.getEdge('eXc')!.documentIds!.slice().sort()).toEqual(['doc-a', 'doc-b', 'doc-c'])
      expect(h.store.getEdge('ea-next')).toBeDefined()
      expect(h.store.getEdge('ec-next')).toBeDefined()
      expect(stripRoot(h.runtime)).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('§3.7 — mutate-all applies the single same-id putNode and no fork node', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput('X')
      sidebarApi().textareaBlur('X', 'edited shared')
      await h.host.sharedCommitMutateAll('mutated')
      expect(h.batchCalls).toHaveLength(1)
      expect(h.batchCalls[0]).toHaveLength(1)
      const put = h.batchCalls[0][0] as Extract<BatchOp, { op: 'putNode' }>
      expect(put.op).toBe('putNode')
      expect(put.node.id).toBe('X')
      expect(put.node.content).toBe('mutated')
      expect(h.store.getNode('X')!.content).toBe('mutated')
      expect(h.store.listNodes().some((x) => x.id !== 'X' && x.content === 'mutated')).toBe(false)
      expect(stripRoot(h.runtime)).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('§2.9 — cancel makes no write and clears the strip', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput('X')
      sidebarApi().textareaBlur('X', 'edited shared')
      expect(stripRoot(h.runtime)).toBeDefined()
      await h.host.sharedCommitCancel()
      expect(h.batchCalls).toHaveLength(0)
      expect(stripRoot(h.runtime)).toBeUndefined()
      expect(h.store.getNode('X')!.content).toBe('shared body')
    } finally {
      cleanup(h.dir)
    }
  })

  it('F7 — a failed edit.batch leaves the store unchanged and the warn/strip available', async () => {
    const h = await makeHarness({ failBatch: true })
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput('X')
      sidebarApi().textareaBlur('X', 'edited shared')
      await h.host.sharedCommitFork()
      expect(h.batchCalls).toHaveLength(1)
      expect(h.store.getNode('X')!.content).toBe('shared body')
      expect(h.store.getEdge('ea-next')).toBeDefined()
      expect(h.store.listNodes().some((x) => x.id !== 'X' && x.content === 'shared body')).toBe(false)
      expect(stripRoot(h.runtime), 'the strip remains after a failed batch').toBeDefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('F8 — an unavailable reverse map blocks the commit (no write) and surfaces a notice', async () => {
    const h = await makeHarness({ omitEdges: true })
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput('X')
      sidebarApi().textareaBlur('X', 'edited shared')
      await flush()
      expect(h.commit).not.toHaveBeenCalled()
      expect(h.batchCalls).toHaveLength(0)
      expect(noticeRoot(h.runtime), 'the block reason is surfaced as a materialized root').toBeDefined()
      expect(stripRoot(h.runtime)).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })
})
