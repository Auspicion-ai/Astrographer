// tests/unit-u-shell-9b-h2-c20-materialization.test.ts — Unit U-SHELL-9b
// H2 / W2-N14 + H7: C20 materialization + the owners-box collapse toggle
// (docs/specs/unit-u-shell-9b-cross-document-shared.md §2.8 "Host seams — C20
// materialization + owners box (H2 / W2-N14 / H7) — pinned 2026-09-13").
//
// TestWriter RED set written from §2.8 ALONE, BEFORE implementation.
//
// Contract exercised:
//   1. `buildOwnersMap(edges)` — a PURE union/dedup of each snapshot edge's
//      `documentIds` onto `owners[edge.target]`; total on malformed input.
//   2. Decoration at assembly: every envelope handed to the runtime is
//      decorated from the reverse map BEFORE translate/reconcile, so a shared
//      RAG root materializes the C20 class + owners box in the graph.
//   3. A non-shared node gains neither.
//   4. `applySharedSubtreeDecoration(env, owners, collapsed?)` honours the
//      optional collapsed set (`data-expanded="false"`).
//   5. `SidebarPanes.toggleOwnersBox(ragId)` flips the host set + re-derives,
//      is registered on the `window.provident.sidebar` bridge (H7), and an
//      unknown/empty ragId is a no-op.
//   6. Decoration is render-time only — the source `lastSnapshot` is never
//      mutated and no RAG node gains a stored flag.
import { describe, it, expect, beforeAll } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import * as crossDoc from '../src/renderer/cross-document-shared.js'
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

type Owners = Record<string, string[]>

// ===========================================================================
// Guarded access to the §2.8 surface (absent → labelled RED, never a bare
// TypeError from the test authoring).
// ===========================================================================
function requireBuildOwnersMap(): (edges: unknown) => Owners {
  const fn = (crossDoc as unknown as { buildOwnersMap?: (edges: unknown) => Owners }).buildOwnersMap
  if (typeof fn !== 'function') {
    throw new Error('buildOwnersMap is not implemented (U-SHELL-9b H2 RED — needs the Implementer)')
  }
  return fn
}

type CollapsedInput = ReadonlySet<string> | ((ragId: string) => boolean)
function applyDecoration(env: LegacyInitialData, owners: Owners, collapsed?: CollapsedInput): LegacyInitialData {
  const fn = (
    crossDoc as unknown as {
      applySharedSubtreeDecoration?: (e: LegacyInitialData, o: Owners, c?: CollapsedInput) => LegacyInitialData
    }
  ).applySharedSubtreeDecoration
  if (typeof fn !== 'function') {
    throw new Error('applySharedSubtreeDecoration is not implemented (U-SHELL-9b H2 RED — needs the Implementer)')
  }
  return fn(env, owners, collapsed)
}

function requireToggleOwnersBox(host: SidebarPanes): (ragId: string) => void {
  const fn = (host as unknown as { toggleOwnersBox?: (ragId: string) => void }).toggleOwnersBox
  if (typeof fn !== 'function') {
    throw new Error('SidebarPanes.toggleOwnersBox is not implemented (U-SHELL-9b H2 RED — needs the Implementer)')
  }
  return fn.bind(host)
}

// ===========================================================================
// Pure envelope fixtures (C20 decoration)
// ===========================================================================
function ragRoot(id: string, children: LegacyNodeData[] = []): LegacyNodeData {
  return { type: 'div', props: { id: `rag-${id}`, 'data-rag-node-id': id }, content: id, children }
}
function envelope(roots: LegacyNodeData[]): LegacyInitialData {
  return {
    template: { root: { type: 'div', props: { id: 'root' } } },
    content: roots.map((r) => ({ content: [r] })),
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}
function firstRoot(env: LegacyInitialData): LegacyNodeData {
  return (env.content![0] as { content: LegacyNodeData[] }).content[0]
}
function ownersBoxOf(root: LegacyNodeData): LegacyNodeData | undefined {
  return (root.children ?? []).find((c) => (c.props as Record<string, unknown> | undefined)?.['data-shared'] === 'true')
}

// ===========================================================================
// §2.8 — buildOwnersMap (the synchronous authoritative reverse map)
// ===========================================================================
describe('U-SHELL-9b H2 — buildOwnersMap (§2.8 owners reverse map)', () => {
  it('unions + dedupes each edge’s documentIds onto owners[edge.target]', () => {
    const build = requireBuildOwnersMap()
    const owners = build([
      { target: 'X', documentIds: ['A'] },
      { target: 'X', documentIds: ['B', 'A'] },
      { target: 'Y', documentIds: ['C'] },
    ])
    expect(owners.X).toEqual(['A', 'B'])
    expect(owners.Y).toEqual(['C'])
  })

  it('is total on malformed input (never throws)', () => {
    const build = requireBuildOwnersMap()
    expect(() => build(null)).not.toThrow()
    expect(() => build(undefined)).not.toThrow()
    expect(() => build('nope')).not.toThrow()
    expect(() => build([null, 7, {}, { target: 'X' }, { documentIds: ['A'] }, { target: 'X', documentIds: 'nope' }])).not.toThrow()
    const owners = build([
      null,
      { target: '', documentIds: ['A'] },
      { target: 'X', documentIds: ['A', '', null, 'A', 'B'] },
      { target: 'Y', documentIds: [] },
    ])
    expect(owners.X).toEqual(['A', 'B'])
    expect(owners.Y).toBeUndefined()
  })

  it('does not mutate the source edges (render-time only)', () => {
    const build = requireBuildOwnersMap()
    const edges = [{ target: 'X', documentIds: ['A', 'B'] }]
    const pristine = JSON.stringify(edges)
    build(edges)
    expect(JSON.stringify(edges)).toBe(pristine)
  })
})

// ===========================================================================
// §2.8 — the collapse input is authored into the owners box
// ===========================================================================
describe('U-SHELL-9b H2 — applySharedSubtreeDecoration collapse input (§2.8)', () => {
  const owners: Owners = { X: ['A', 'B'] }

  it('defaults expanded when no collapsed set is supplied', () => {
    const out = applyDecoration(envelope([ragRoot('X')]), owners)
    const box = ownersBoxOf(firstRoot(out))
    expect(box).toBeDefined()
    expect(box!.props!['data-expanded']).toBe('true')
    expect(firstRoot(out).css?.classes ?? []).toContain(crossDoc.SHARED_SUBTREE_CLASS)
  })

  it('authors data-expanded=false when the ragId is in the collapsed set', () => {
    const out = applyDecoration(envelope([ragRoot('X')]), owners, new Set(['X']))
    const box = ownersBoxOf(firstRoot(out))
    expect(box!.props!['data-expanded']).toBe('false')
  })

  it('accepts a predicate collapsed callback', () => {
    const out = applyDecoration(envelope([ragRoot('X')]), owners, (ragId) => ragId === 'X')
    expect(ownersBoxOf(firstRoot(out))!.props!['data-expanded']).toBe('false')
  })
})

// ===========================================================================
// Host fixture — a shared two-document snapshot (mirrors the H3 harness style)
// ===========================================================================
const NOW = new Date().toISOString()
function stageNode(id: string, type: string, content: string) {
  return { id, type, content, ownedNodeIds: [], createdAt: NOW, updatedAt: NOW }
}
function stageEdge(id: string, kind: string, source: string, target: string, documentIds: string[]) {
  return { id, kind, source, target, documentIds, createdAt: NOW, updatedAt: NOW }
}

/** BOTH documents reach the SAME section X (CROSS-DOCUMENT-SHARED). */
function sharedSnapshot() {
  return {
    store: 'default',
    nodes: [
      stageNode('doc-a', 'div', ''),
      stageNode('headA', 'h1', 'Doc A'),
      stageNode('X', 'p', 'shared body'),
      stageNode('doc-b', 'div', ''),
      stageNode('headB', 'h1', 'Doc B'),
    ],
    edges: [
      stageEdge('ea-head', 'doc-head', 'headA', 'doc-a', ['doc-a']),
      stageEdge('ea-next', 'next-section', 'headA', 'X', ['doc-a']),
      stageEdge('ea-end', 'doc-end', 'X', 'doc-a', ['doc-a']),
      stageEdge('eb-head', 'doc-head', 'headB', 'doc-b', ['doc-b']),
      stageEdge('eb-next', 'next-section', 'headB', 'X', ['doc-b']),
      stageEdge('eb-end', 'doc-end', 'X', 'doc-b', ['doc-b']),
    ],
  }
}

function sharedHarness(opts: { editingMode?: string } = {}) {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const snapshot = sharedSnapshot()
  const docHeads = {
    documents: [
      { documentId: 'doc-a', title: 'Doc A', path: [], tags: [] },
      { documentId: 'doc-b', title: 'Doc B', path: [], tags: [] },
    ],
  }
  const operatorSettings: Record<string, unknown> = {
    enabledPanes: [],
    enabledOperatorPanes: [],
    panesInitialized: true,
    defaultDocumentId: null,
    topK: 5,
    editingMode: opts.editingMode ?? 'textarea',
    theme: 'system',
  }
  const bridge = {
    security: { get: async () => ({ token: null, enabled: ['read', 'dispatch', 'rag'] }) },
    edit: { commit: async () => ({ ok: true, nodeId: 'x' }), onRagStoreChanged: () => () => {} },
    rag: {
      query: async (q: string) => ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }),
      snapshot: async () => snapshot,
      backlinks: async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }),
      docHeads: async () => docHeads,
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
    commit: async () => ({ ok: true, nodeId: 'x' }),
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
  return { host, runtime, mount, snapshot }
}

function docTarget(documentId: string): TabTarget {
  return { kind: 'document', documentId }
}
function entry(id: string, target: TabTarget, title = id): TabEntry {
  return { id, target, title }
}

function rootById(runtime: Runtime, id: string): LegacyNodeData | undefined {
  return runtime
    .materializedContentRoots()
    .find((root) => (root.props as { id?: unknown } | undefined)?.id === id)
}

// ===========================================================================
// §2.8 — decoration is materialized in the graph at assembly
// ===========================================================================
describe('U-SHELL-9b H2 — C20 materialization in the graph (§2.8)', () => {
  it('a shared root carries the C20 class + an owners box listing both documents (single-doc boot)', async () => {
    const h = sharedHarness()
    await h.host.boot(h.runtime)
    const x = rootById(h.runtime, 'rag-X')
    expect(x, 'the shared section materializes as rag-X').toBeDefined()
    expect(x!.css?.classes ?? []).toContain(crossDoc.SHARED_SUBTREE_CLASS)
    const box = ownersBoxOf(x!)
    expect(box, 'the owners box attaches to the shared root').toBeDefined()
    const text = JSON.stringify(box)
    expect(text).toContain('doc-a')
    expect(text).toContain('doc-b')
  })

  it('a non-shared root carries neither the class nor an owners box', async () => {
    const h = sharedHarness()
    await h.host.boot(h.runtime)
    const head = rootById(h.runtime, 'rag-headA')
    expect(head, 'the document head materializes as rag-headA').toBeDefined()
    expect(head!.css?.classes ?? []).not.toContain(crossDoc.SHARED_SUBTREE_CLASS)
    expect(ownersBoxOf(head!)).toBeUndefined()
    expect(JSON.stringify(head)).not.toContain('data-shared')
  })

  it('both duplicate subtrees in the simultaneous multi-document mount carry the class + owners box', async () => {
    const h = sharedHarness()
    await h.host.boot(h.runtime)
    h.host.mountTabs([entry('tab-a', docTarget('doc-a')), entry('tab-b', docTarget('doc-b'))])
    for (const id of ['rag-doc-a--X', 'rag-doc-b--X']) {
      const root = rootById(h.runtime, id)
      expect(root, `${id} materializes`).toBeDefined()
      expect(root!.css?.classes ?? []).toContain(crossDoc.SHARED_SUBTREE_CLASS)
      const box = ownersBoxOf(root!)
      expect(box, `${id} carries an owners box`).toBeDefined()
      expect(JSON.stringify(box)).toContain('doc-a')
      expect(JSON.stringify(box)).toContain('doc-b')
    }
  })

  it('the synthetic owners box does not flip a shared root out of rich-eligibility (contenteditable)', async () => {
    const h = sharedHarness({ editingMode: 'contenteditable' })
    await h.host.boot(h.runtime)
    const x = rootById(h.runtime, 'rag-X')
    expect(x, 'the shared section materializes as rag-X').toBeDefined()
    // The owners box is synthetic UI chrome: it must NOT make the shared `p`
    // read as a doc-child container and lose its rich editor.
    expect(x!.props?.contenteditable).toBe(true)
    expect((x!.children ?? []).some((c) => c.type === 'textarea')).toBe(false)
    expect(ownersBoxOf(x!)).toBeDefined()
  })
})

// ===========================================================================
// §2.8 — the owners-box collapse toggle (H7)
// ===========================================================================
describe('U-SHELL-9b H2 — owners-box collapse toggle (§2.8, H7)', () => {
  it('defaults expanded; toggleOwnersBox flips it and re-derives', async () => {
    const h = sharedHarness()
    await h.host.boot(h.runtime)
    expect(ownersBoxOf(rootById(h.runtime, 'rag-X')!)!.props!['data-expanded']).toBe('true')

    requireToggleOwnersBox(h.host)('X')
    expect(ownersBoxOf(rootById(h.runtime, 'rag-X')!)!.props!['data-expanded']).toBe('false')

    requireToggleOwnersBox(h.host)('X')
    expect(ownersBoxOf(rootById(h.runtime, 'rag-X')!)!.props!['data-expanded']).toBe('true')
  })

  it('is registered on the window.provident.sidebar bridge (the handler body reaches it)', async () => {
    const h = sharedHarness()
    await h.host.boot(h.runtime)
    const sidebar = (globalThis as unknown as { window: { provident: { sidebar?: Record<string, unknown> } } }).window
      .provident.sidebar
    expect(sidebar, 'the sidebar bridge is installed at boot').toBeDefined()
    expect(typeof sidebar!.toggleOwnersBox).toBe('function')
    ;(sidebar!.toggleOwnersBox as (ragId: string) => void)('X')
    expect(ownersBoxOf(rootById(h.runtime, 'rag-X')!)!.props!['data-expanded']).toBe('false')
  })

  it('an unknown or empty ragId is a no-op', async () => {
    const h = sharedHarness()
    await h.host.boot(h.runtime)
    const toggle = requireToggleOwnersBox(h.host)
    toggle('ghost')
    toggle('')
    expect(ownersBoxOf(rootById(h.runtime, 'rag-X')!)!.props!['data-expanded']).toBe('true')
  })
})

// ===========================================================================
// §2.8 — decoration is render-time only
// ===========================================================================
describe('U-SHELL-9b H2 — decoration is render-time only (§2.8)', () => {
  it('the source lastSnapshot is never mutated and no RAG node gains a stored flag', async () => {
    const h = sharedHarness()
    const pristine = JSON.stringify(h.snapshot)
    await h.host.boot(h.runtime)
    requireToggleOwnersBox(h.host)('X')
    h.host.mountTabs([entry('tab-a', docTarget('doc-a')), entry('tab-b', docTarget('doc-b'))])
    requireToggleOwnersBox(h.host)('X')
    expect(JSON.stringify(h.snapshot)).toBe(pristine)

    const x = h.snapshot.nodes.find((n) => n.id === 'X')
    expect(x).toBeDefined()
    expect(Object.keys(x!).some((k) => /shared|owners/i.test(k))).toBe(false)
  })
})
