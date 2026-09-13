// tests/unit-u-shell-9b-blind-greens.test.ts — Unit U-SHELL-9b
// BLIND GREENS (AGENTS.md item 10a / RCA-4): an independent verification of the
// H1–H7 repair set derived from the DOCUMENTATION ALONE.
//
// Authoritative sources (no implementation body was read to derive an
// expectation):
//   docs/specs/unit-u-shell-9b-cross-document-shared.md
//     §2.6 (H1–H7 findings) + §2.6b/§2.6c adversarial findings
//     §2.7 (per-document id namespace) §2.8 (C20 + owners box) §2.9 (Option-C)
//     §3 states 1–9, §4 F7–F10b, §5 census.
//   docs/specs/wave-2-open-decisions.md §D (W2-N12/N13/N14 status).
//
// The exported module constants/helpers used below are the pinned interface
// (spec §2.5/§2.8/§2.9); every ASSERTED value (owner sets, store contents,
// per-document attribution, batch shape) is derived from the spec text.
//
// Scenarios:
//   H3/§2.7 — two scoped roots, plain data-rag-node-id, per-document
//             attribution, plain-ragId content-change match.
//   H2/§2.8 — C20 class + owners box on a shared root, none on a non-shared
//             root, collapsible + toggleOwnersBox on window.provident.sidebar.
//   H1/§2.9 — shared commit blocked (no write) + strip; fork (one atomic batch,
//             pending edit preserved, other owner intact); >2-owner checklist;
//             mutate-all; cancel; F10b no-op; F7 failed batch; F8 blocked.
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
  type BatchOp,
  type BatchResult,
} from '../src/main/rag-store.js'
import * as crossDoc from '../src/renderer/cross-document-shared.js'
import { reconcileDocumentRoots } from '../src/renderer/content-reconcile.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-shape.js'
import type { TabEntry, TabTarget } from '../src/renderer/tab-state.js'

beforeAll(() => {
  installShim()
})

// ===========================================================================
// Fixtures — three documents da/db/dc sharing one RAG node `shared`
// (with an owned child `nested`). Shape mirrors the SUBTREE-OWNERSHIP model:
//   doc-head h-* → doc-*, next-section h-* → shared, doc-end shared → doc-*,
//   plus the shared node's parent-child edge to its owned subtree.
// ===========================================================================
const NOW = new Date().toISOString()
type StageNode = RagNode
type StageEdge = RagEdge

function n(id: string, type: RagNode['type'], content: string, extra: Partial<RagNode> = {}): RagNode {
  return { id, type, content, ownedNodeIds: [], createdAt: NOW, updatedAt: NOW, ...extra }
}
function e(id: string, kind: RagEdge['kind'], source: string, target: string, documentIds: string[]): RagEdge {
  return { id, kind, source, target, documentIds, createdAt: NOW, updatedAt: NOW }
}

const SHARED = 'shared'
const NESTED = 'nested'

// NOTE: a document's root NODE id must equal its `documentId` (the traversal
// keys the document body by that id). Each body is one head plus the shared
// section, reached by doc-head / next-section / doc-end edges.
function seed(owners: number): { nodes: StageNode[]; edges: StageEdge[] } {
  const nodes: StageNode[] = [
    n('head-da', 'h1', 'Da'),
    n('da', 'div', ''),
    n('head-db', 'h1', 'Db'),
    n('db', 'div', ''),
    n(SHARED, 'p', 'shared body', { ownedNodeIds: [NESTED] }),
    n(NESTED, 'p', 'nested child'),
  ]
  const edges: StageEdge[] = [
    e('edge-da-head', 'doc-head', 'head-da', 'da', ['da']),
    e('edge-da-next', 'next-section', 'head-da', SHARED, ['da']),
    e('edge-da-end', 'doc-end', SHARED, 'da', ['da']),
    e('edge-db-head', 'doc-head', 'head-db', 'db', ['db']),
    e('edge-db-next', 'next-section', 'head-db', SHARED, ['db']),
    e('edge-db-end', 'doc-end', SHARED, 'db', ['db']),
  ]
  const sharing = ['da', 'db']
  if (owners >= 3) {
    nodes.push(n('head-dc', 'h1', 'Dc'), n('dc', 'div', ''))
    edges.push(
      e('edge-dc-head', 'doc-head', 'head-dc', 'dc', ['dc']),
      e('edge-dc-next', 'next-section', 'head-dc', SHARED, ['dc']),
      e('edge-dc-end', 'doc-end', SHARED, 'dc', ['dc']),
    )
    sharing.push('dc')
  }
  edges.push(e('edge-shared-nested', 'parent-child', SHARED, NESTED, sharing))
  return { nodes, edges }
}

function docList(owners: number) {
  const docs = [
    { documentId: 'da', title: 'Da', path: [], tags: [] },
    { documentId: 'db', title: 'Db', path: [], tags: [] },
  ]
  if (owners >= 3) docs.push({ documentId: 'dc', title: 'Dc', path: [], tags: [] })
  return docs
}

interface HarnessOpts {
  owners?: number
  failBatch?: boolean
  omitEdges?: boolean
}

async function makeHarness(opts: HarnessOpts = {}) {
  installShim()
  const dir = mkdtempSync(join(tmpdir(), 'ushell9b-blind-'))
  const store = createJsonRagStore({ path: join(dir, 'rag.json') })
  const seeded = seed(opts.owners ?? 2)
  for (const node of seeded.nodes) await store.putNode(node)
  for (const edge of seeded.edges) await store.putEdge(edge)

  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()

  const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T
  const snapshot = async (): Promise<Record<string, unknown>> => {
    const payload: Record<string, unknown> = { store: 'default', nodes: clone(store.listNodes()) }
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

  const documents = docList(opts.owners ?? 2)
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
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}
function sidebarApi(): Record<string, (...args: unknown[]) => unknown> {
  const w = (globalThis as unknown as { window: { provident: { sidebar?: unknown } } }).window
  if (w.provident.sidebar == null) throw new Error('window.provident.sidebar not installed')
  return w.provident.sidebar as Record<string, (...args: unknown[]) => unknown>
}

// ===========================================================================
// Graph helpers
// ===========================================================================
function walk(node: LegacyNodeData | undefined, visit: (n: LegacyNodeData) => void): void {
  if (node == null || typeof node !== 'object') return
  visit(node)
  for (const c of node.children ?? []) walk(c as LegacyNodeData, visit)
}
function descendants(root: LegacyNodeData, pred: (n: LegacyNodeData) => boolean): LegacyNodeData[] {
  const out: LegacyNodeData[] = []
  walk(root, (node) => {
    if (pred(node)) out.push(node)
  })
  return out
}
function propsId(node: LegacyNodeData | undefined): string | undefined {
  const id = node?.props?.id
  return typeof id === 'string' ? id : undefined
}
function rootById(rt: Runtime, id: string): LegacyNodeData | undefined {
  return rt.materializedContentRoots().find((root) => propsId(root as LegacyNodeData) === id)
}
function stripRoot(rt: Runtime): LegacyNodeData | undefined {
  return rootById(rt, crossDoc.SHARED_COMMIT_STRIP_ID)
}
// The owners box is addressed by its `data-shared` marker, NOT a fixed id: in
// the per-document namespace its `rag-`-prefixed authored id is scoped (the
// spec §2.7 scopes every `rag-…` authored id; §2.8 does not pin the box's id).
function ownersBoxOf(root: LegacyNodeData | undefined): LegacyNodeData | undefined {
  return (root?.children ?? []).find((c) => (c as LegacyNodeData).props?.['data-shared'] === 'true')
}
function ownerToggles(strip: LegacyNodeData): LegacyNodeData[] {
  return descendants(strip, (n) => n.props?.['data-shared-commit-owner'] === 'true')
}
function html(mount: unknown): string {
  return (mount as { innerHTML: string }).innerHTML
}
function docTarget(documentId: string): TabTarget {
  return { kind: 'document', documentId }
}
function tabEntry(id: string, target: TabTarget, title = id): TabEntry {
  return { id, target, title }
}

// ===========================================================================
// H3 / §2.7 — per-document id namespace
// ===========================================================================
describe('U-SHELL-9b blind — H3 per-document id namespace (§2.7)', () => {
  it('§2.7 — a shared node reached by two documents materializes as two distinct roots', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      h.host.mountTabs([tabEntry('tab-da', docTarget('da')), tabEntry('tab-db', docTarget('db'))])

      const a = rootById(h.runtime, 'rag-da--shared')
      const b = rootById(h.runtime, 'rag-db--shared')
      expect(a, 'da scoped root materializes').toBeDefined()
      expect(b, 'db scoped root materializes').toBeDefined()
      // Distinct authored ids (the invalid-DOM duplicate-id defect is gone).
      expect(propsId(a)).not.toBe(propsId(b))
      // Each remains addressed by the PLAIN data-rag-node-id.
      expect(a!.props?.['data-rag-node-id']).toBe(SHARED)
      expect(b!.props?.['data-rag-node-id']).toBe(SHARED)

      const rendered = html(h.mount)
      expect(rendered).toContain('id="rag-da--shared"')
      expect(rendered).toContain('id="rag-db--shared"')
      expect(rendered).not.toContain('id="rag-shared"')
    } finally {
      cleanup(h.dir)
    }
  })

  it('§2.7 — materializedDocumentRoots() attributes each shared root to its OWN document', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      h.host.mountTabs([tabEntry('tab-da', docTarget('da')), tabEntry('tab-db', docTarget('db'))])

      const roots = h.runtime.materializedDocumentRoots()
      const ragRoots = roots
        .map((r) => ({ documentId: r.documentId, id: propsId(r.root as LegacyNodeData) }))
        .filter((r): r is { documentId: string; id: string } => typeof r.id === 'string' && r.id.startsWith('rag-'))

      const fromAlpha = ragRoots.filter((r) => r.documentId === 'da')
      const fromBeta = ragRoots.filter((r) => r.documentId === 'db')
      expect(fromAlpha.length).toBeGreaterThan(0)
      expect(fromBeta.length).toBeGreaterThan(0)
      // No cross-attribution: each root carries its own document's scope.
      expect(fromAlpha.every((r) => r.id.startsWith('rag-da--'))).toBe(true)
      expect(fromBeta.every((r) => r.id.startsWith('rag-db--'))).toBe(true)
      expect(fromAlpha.some((r) => r.id === 'rag-da--shared')).toBe(true)
      expect(fromBeta.some((r) => r.id === 'rag-db--shared')).toBe(true)
    } finally {
      cleanup(h.dir)
    }
  })

  it('§2.7 — a content change to the shared node matches by the PLAIN ragId', () => {
    // The change descriptor carries the plain RAG node id; the two roots are
    // document-scoped, so the reconciler must recover the plain id from
    // `data-rag-node-id` and replace BOTH.
    const scoped = (documentId: string, ragId: string): LegacyNodeData => ({
      type: 'div',
      props: { id: `rag-${documentId}--${ragId}`, 'data-rag-node-id': ragId },
      content: ragId,
    })
    const env = (roots: LegacyNodeData[]): LegacyInitialData => ({
      template: { root: { type: 'div', props: { id: 'root' }, children: [{ type: 'div', props: { id: 'zone:main' } }] } },
      content: roots.map((r) => ({ content: [r] })),
      clientConfig: { runInstantiation: true, runRendering: true },
    })
    const result = reconcileDocumentRoots({
      previous: [
        { documentId: 'da', root: scoped('da', SHARED) },
        { documentId: 'db', root: scoped('db', SHARED) },
      ],
      next: [
        { documentId: 'da', envelope: env([scoped('da', SHARED)]) },
        { documentId: 'db', envelope: env([scoped('db', SHARED)]) },
      ],
      change: { kind: 'content', nodeIds: [SHARED], edgeIds: [] },
      documentIds: ['da', 'db'],
    })
    expect(result.replaced.map((r) => `${r.documentId}|${r.cssId}`).sort()).toEqual([
      'da|rag-da--shared',
      'db|rag-db--shared',
    ])
    expect(result.replaced.every((r) => r.ragNodeId === SHARED)).toBe(true)
  })

  it('§2.7/§2.6b — plainRagId recovers the plain id even when `--` is in either part', () => {
    expect(crossDoc.plainRagId({ id: 'rag-da--shared', 'data-rag-node-id': SHARED })).toBe(SHARED)
    // A document id (or RAG id) may itself contain the scope separator.
    expect(crossDoc.plainRagId({ id: 'rag-foo--bar--shared', 'data-rag-node-id': SHARED })).toBe(SHARED)
    expect(crossDoc.plainRagId({ id: 'rag-x--y--a--b', 'data-rag-node-id': 'a--b' })).toBe('a--b')
  })

  it('§2.7/§2.1 — a store content change repopulates both mounted scoped roots in place', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      h.host.mountTabs([tabEntry('tab-da', docTarget('da')), tabEntry('tab-db', docTarget('db'))])
      const before = h.store.getNode(SHARED)!
      await h.store.putNode({ ...before, content: 'shared body v2' })
      await h.host.reDerive('content')

      const a = rootById(h.runtime, 'rag-da--shared')
      const b = rootById(h.runtime, 'rag-db--shared')
      expect(a, 'da root survives the content change').toBeDefined()
      expect(b, 'db root survives the content change').toBeDefined()
      // In-place repopulation: the distinct scoped ids and the plain addressing
      // key are preserved (no teardown / duplicate ids).
      expect(a!.props?.['data-rag-node-id']).toBe(SHARED)
      expect(b!.props?.['data-rag-node-id']).toBe(SHARED)
      expect(JSON.stringify(a)).toContain('shared body v2')
      expect(JSON.stringify(b)).toContain('shared body v2')
    } finally {
      cleanup(h.dir)
    }
  })
})

// ===========================================================================
// H2 / §2.8 — C20 materialization + owners box
// ===========================================================================
describe('U-SHELL-9b blind — H2 C20 materialization + owners box (§2.8)', () => {
  it('§2.8 — a shared subtree carries the C20 class + an owners box listing its sharers', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      const root = rootById(h.runtime, `rag-${SHARED}`)
      expect(root, 'the shared node materializes').toBeDefined()
      expect(root!.css?.classes ?? []).toContain(crossDoc.SHARED_SUBTREE_CLASS)

      const box = ownersBoxOf(root)
      expect(box, 'the owners box attaches (side panel) to the shared subtree').toBeDefined()
      const text = JSON.stringify(box)
      expect(text).toContain('da')
      expect(text).toContain('db')
    } finally {
      cleanup(h.dir)
    }
  })

  it('§2.8 — a non-shared node carries neither the C20 class nor an owners box', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      const head = rootById(h.runtime, 'rag-head-da')
      expect(head, 'the document head materializes').toBeDefined()
      expect(head!.css?.classes ?? []).not.toContain(crossDoc.SHARED_SUBTREE_CLASS)
      expect(ownersBoxOf(head)).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('§2.8 — in the simultaneous mount BOTH duplicate scoped subtrees are decorated', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      h.host.mountTabs([tabEntry('tab-da', docTarget('da')), tabEntry('tab-db', docTarget('db'))])
      for (const id of ['rag-da--shared', 'rag-db--shared']) {
        const root = rootById(h.runtime, id)
        expect(root, `${id} materializes`).toBeDefined()
        expect(root!.css?.classes ?? []).toContain(crossDoc.SHARED_SUBTREE_CLASS)
        expect(ownersBoxOf(root), `${id} carries an owners box`).toBeDefined()
        expect(JSON.stringify(ownersBoxOf(root))).toContain('da')
        expect(JSON.stringify(ownersBoxOf(root))).toContain('db')
      }
    } finally {
      cleanup(h.dir)
    }
  })

  it('§2.8/H7 — the owners box is collapsible and the toggle is registered on the bridge', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      const box0 = ownersBoxOf(rootById(h.runtime, `rag-${SHARED}`))
      expect(box0).toBeDefined()
      expect(box0!.props?.['data-expanded']).toBe('true')

      const sidebar = sidebarApi()
      expect(typeof sidebar.toggleOwnersBox, 'H7 — registered on window.provident.sidebar').toBe('function')
      ;(sidebar.toggleOwnersBox as (ragId: string) => void)(SHARED)

      const box1 = ownersBoxOf(rootById(h.runtime, `rag-${SHARED}`))
      expect(box1!.props?.['data-expanded']).toBe('false')
    } finally {
      cleanup(h.dir)
    }
  })

  it('§2.8 — buildOwnersMap unions + dedupes each edge’s documentIds onto its target', () => {
    const owners = crossDoc.buildOwnersMap([
      { target: SHARED, documentIds: ['da'] },
      { target: SHARED, documentIds: ['db', 'da'] },
      { target: NESTED, documentIds: ['da'] },
    ])
    expect(owners[SHARED]).toEqual(['da', 'db'])
    expect(owners[NESTED]).toEqual(['da'])
  })

  it('§2.8 — buildOwnersMap is total on malformed input and mutates nothing', () => {
    const edges = [{ target: SHARED, documentIds: ['da', 'da', 'db'] }]
    const pristine = JSON.stringify(edges)
    const owners = crossDoc.buildOwnersMap(edges)
    expect(owners[SHARED]).toEqual(['da', 'db'])
    expect(JSON.stringify(edges)).toBe(pristine)
    expect(() => crossDoc.buildOwnersMap(null)).not.toThrow()
    expect(() => crossDoc.buildOwnersMap('nope')).not.toThrow()
    expect(() => crossDoc.buildOwnersMap([null, 7, {}, { target: SHARED }])).not.toThrow()
  })
})

// ===========================================================================
// H1 / §2.9 — Option-C commit interception
// ===========================================================================
describe('U-SHELL-9b blind — H1 Option-C commit interception (§2.9)', () => {
  it('§2.9/F8 — an unavailable reverse map blocks the commit (no write) with a notice', async () => {
    const h = await makeHarness({ omitEdges: true })
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput(SHARED)
      sidebarApi().textareaBlur(SHARED, 'da edit')
      await flush()
      expect(h.commit).not.toHaveBeenCalled()
      expect(h.batchCalls).toHaveLength(0)
      expect(rootById(h.runtime, crossDoc.SHARED_COMMIT_NOTICE_ID), 'a block notice is materialized').toBeDefined()
      expect(stripRoot(h.runtime)).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('§2.9 — an unshared commit still writes normally (no strip, no batch)', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput('head-da')
      sidebarApi().textareaBlur('head-da', 'edited head')
      await flush()
      expect(h.commit).toHaveBeenCalledTimes(1)
      expect(h.batchCalls).toHaveLength(0)
      expect(stripRoot(h.runtime)).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('§2.9 — a commit on a shared node does NOT write; a fork/mutate-all/cancel strip appears', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput(SHARED)
      sidebarApi().textareaBlur(SHARED, 'da edit')
      await flush()
      expect(h.commit, 'shared commit must not write directly').not.toHaveBeenCalled()
      expect(h.batchCalls).toHaveLength(0)

      const strip = stripRoot(h.runtime)
      expect(strip, 'the confirmation strip is a materialized content root').toBeDefined()
      const buttonIds = descendants(strip!, (node) => node.type === 'button').map(propsId)
      expect(buttonIds).toContain(crossDoc.SHARED_COMMIT_FORK_ID)
      expect(buttonIds).toContain(crossDoc.SHARED_COMMIT_MUTATE_ALL_ID)
      expect(buttonIds).toContain(crossDoc.SHARED_COMMIT_CANCEL_ID)
    } finally {
      cleanup(h.dir)
    }
  })

  it('§3.5/AF1-1 — fork applies ONE atomic batch; pending edit kept for editing doc; other owner intact', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput(SHARED)
      sidebarApi().textareaBlur(SHARED, 'da edit')
      await h.host.sharedCommitFork()

      expect(h.batchCalls, 'the fork is exactly one applyBatch').toHaveLength(1)
      expect(h.batchCalls[0].length).toBeGreaterThan(0)

      // The other owner (db) is unchanged: original content + original edge.
      expect(h.store.getNode(SHARED)!.content).toBe('shared body')
      expect(h.store.getEdge('edge-db-next')!.target).toBe(SHARED)

      // The editing document's edge now points at a fork carrying the pending edit.
      const daEdges = h.store.listEdges().filter((x) => x.source === 'head-da' && x.kind === 'next-section')
      expect(daEdges).toHaveLength(1)
      const forkId = daEdges[0].target
      expect(forkId).not.toBe(SHARED)
      expect(h.store.getNode(forkId)!.content).toBe('da edit')
      // No da edge still targets the shared original.
      expect(h.store.listEdges().some((x) => x.source === 'head-da' && x.target === SHARED)).toBe(false)
      // The owned subtree was deep-copied.
      expect(h.store.listNodes().some((x) => x.id !== NESTED && x.content === 'nested child')).toBe(true)

      // The strip is cleared once resolved.
      expect(stripRoot(h.runtime)).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('§3.6 — >2 owners render a checklist; fork migrates only the chosen owners', async () => {
    const h = await makeHarness({ owners: 3 })
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput(SHARED)
      sidebarApi().textareaBlur(SHARED, 'da edit')
      await flush()

      const strip = stripRoot(h.runtime)
      expect(strip, 'the >2-owner strip appears').toBeDefined()
      const listed = ownerToggles(strip!)
        .map((t) => t.props?.['data-owner-document-id'])
        .sort()
      expect(listed).toEqual(['da', 'db', 'dc'])

      await h.host.sharedCommitFork(['da', 'dc'])
      expect(h.batchCalls).toHaveLength(1)
      // db keeps the original X + shared subtree ownership.
      expect(h.store.getEdge('edge-db-next')!.target).toBe(SHARED)
      expect(h.store.getNode(SHARED)!.content).toBe('shared body')
      const sharedNested = h.store.getEdge('edge-shared-nested')!
      expect(sharedNested.documentIds).toContain('db')
      expect(sharedNested.documentIds).not.toContain('da')
      expect(sharedNested.documentIds).not.toContain('dc')
      // da + dc point at the same fork.
      const forkAlpha = h.store.listEdges().find((x) => x.source === 'head-da' && x.kind === 'next-section')!
      const forkGamma = h.store.listEdges().find((x) => x.source === 'head-dc' && x.kind === 'next-section')!
      expect(forkAlpha.target).not.toBe(SHARED)
      expect(forkGamma.target).toBe(forkAlpha.target)
    } finally {
      cleanup(h.dir)
    }
  })

  it('§3.7 — mutate-all applies the single same-id putNode (no fork node)', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput(SHARED)
      sidebarApi().textareaBlur(SHARED, 'da edit')
      await h.host.sharedCommitMutateAll('shared body v2')

      expect(h.batchCalls).toHaveLength(1)
      expect(h.batchCalls[0]).toHaveLength(1)
      const put = h.batchCalls[0][0] as Extract<BatchOp, { op: 'putNode' }>
      expect(put.op).toBe('putNode')
      expect(put.node.id).toBe(SHARED)
      expect(put.node.content).toBe('shared body v2')
      expect(h.store.getNode(SHARED)!.content).toBe('shared body v2')
      expect(h.store.listNodes().some((x) => x.id !== SHARED && x.content === 'shared body v2')).toBe(false)
      expect(stripRoot(h.runtime)).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('§2.9 — cancel makes no write and clears the strip', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput(SHARED)
      sidebarApi().textareaBlur(SHARED, 'da edit')
      await h.host.sharedCommitCancel()
      expect(h.commit).not.toHaveBeenCalled()
      expect(h.batchCalls).toHaveLength(0)
      expect(h.store.getNode(SHARED)!.content).toBe('shared body')
      expect(stripRoot(h.runtime)).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('F10b — an empty >2-owner selection is a no-op (no batch, store unchanged)', async () => {
    const h = await makeHarness({ owners: 3 })
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput(SHARED)
      sidebarApi().textareaBlur(SHARED, 'da edit')
      await h.host.sharedCommitFork([])
      expect(h.batchCalls).toHaveLength(0)
      expect(h.store.getNode(SHARED)!.content).toBe('shared body')
      expect(h.store.getEdge('edge-shared-nested')!.documentIds!.slice().sort()).toEqual(['da', 'db', 'dc'])
      expect(h.store.getEdge('edge-da-next')).toBeDefined()
      expect(stripRoot(h.runtime)).toBeUndefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('F7 — a failed atomic batch leaves the store unchanged and the strip available', async () => {
    const h = await makeHarness({ failBatch: true })
    try {
      await h.host.boot(h.runtime)
      sidebarApi().textareaInput(SHARED)
      sidebarApi().textareaBlur(SHARED, 'da edit')
      await h.host.sharedCommitFork()
      expect(h.batchCalls).toHaveLength(1)
      expect(h.store.getNode(SHARED)!.content).toBe('shared body')
      expect(h.store.getEdge('edge-da-next')).toBeDefined()
      expect(h.store.listNodes().some((x) => x.id !== SHARED && x.content === 'da edit')).toBe(false)
      expect(stripRoot(h.runtime), 'the strip remains after a failed batch').toBeDefined()
    } finally {
      cleanup(h.dir)
    }
  })

  it('§2.9 — sharedCommitStripContent authors the buttons + the default-selected checklist', () => {
    const warn2: crossDoc.SharedCommitWarning = {
      nodeId: SHARED,
      editingDocumentId: 'da',
      owners: ['da', 'db'],
      options: ['fork', 'mutate-all'],
      requireChecklist: false,
    }
    const strip2 = crossDoc.sharedCommitStripContent({ warning: warn2 })
    expect(propsId(strip2)).toBe(crossDoc.SHARED_COMMIT_STRIP_ID)
    const ids2 = descendants(strip2, (node) => node.type === 'button').map(propsId)
    expect(ids2).toContain(crossDoc.SHARED_COMMIT_FORK_ID)
    expect(ids2).toContain(crossDoc.SHARED_COMMIT_MUTATE_ALL_ID)
    expect(ids2).toContain(crossDoc.SHARED_COMMIT_CANCEL_ID)
    expect(ownerToggles(strip2)).toHaveLength(0)

    const warn3: crossDoc.SharedCommitWarning = { ...warn2, owners: ['da', 'db', 'dc'], requireChecklist: true }
    const strip3 = crossDoc.sharedCommitStripContent({ warning: warn3 })
    const toggles = ownerToggles(strip3)
    expect(toggles.map((t) => t.props?.['data-owner-document-id']).sort()).toEqual(['da', 'db', 'dc'])
    const selected = toggles.filter((t) => t.props?.['data-selected'] === 'true').map((t) => t.props?.['data-owner-document-id'])
    expect(selected).toEqual(['da'])
  })

  it('§2.5 pin 7 — detectSharedCommit returns null/warn/blocked as pinned', () => {
    const owners = { [SHARED]: ['da', 'db', 'dc'] }
    expect(crossDoc.detectSharedCommit({ nodeId: 'ghost', editingDocumentId: 'da', owners })).toBeNull()
    const warn = crossDoc.detectSharedCommit({ nodeId: SHARED, editingDocumentId: 'da', owners })!
    expect(warn.owners).toEqual(['da', 'db', 'dc'])
    expect(warn.requireChecklist).toBe(true)
    expect(warn.blocked).toBeFalsy()
    const blocked = crossDoc.detectSharedCommit({ nodeId: SHARED, editingDocumentId: 'da', owners: undefined })!
    expect(blocked.blocked).toBe(true)
    expect(blocked.options).toEqual([])
  })
})

// ===========================================================================
// §5 census — store writes go through the existing edit.batch; no teardown of
// the simultaneous mount on a shared commit.
// ===========================================================================
describe('U-SHELL-9b blind — §5 census (no teardown, one atomic batch)', () => {
  it('§5/§2.1 — a shared commit + fork in the multi-document mount keeps both roots', async () => {
    const h = await makeHarness()
    try {
      await h.host.boot(h.runtime)
      h.host.mountTabs([tabEntry('tab-da', docTarget('da')), tabEntry('tab-db', docTarget('db'))])
      sidebarApi().textareaInput(SHARED)
      sidebarApi().textareaBlur(SHARED, 'da edit')
      await h.host.sharedCommitFork()
      expect(h.batchCalls).toHaveLength(1)
      // Both documents still render their shared root (db's is the original).
      expect(rootById(h.runtime, 'rag-db--shared'), 'db keeps its mounted root').toBeDefined()
      // da now renders a fork root (a new scoped id) rather than rag-da--shared.
      const daRagRoots = h.runtime
        .materializedDocumentRoots()
        .filter((r) => r.documentId === 'da')
        .map((r) => propsId(r.root as LegacyNodeData))
      expect(daRagRoots.some((id) => id?.startsWith('rag-da--'))).toBe(true)
    } finally {
      cleanup(h.dir)
    }
  })
})
