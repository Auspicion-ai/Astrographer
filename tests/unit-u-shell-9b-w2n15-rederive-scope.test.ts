// tests/unit-u-shell-9b-w2n15-rederive-scope.test.ts — Unit U-SHELL-9b
// W2-N15 / AF3-2: a multi-document NON-content re-derive must keep the H3
// per-document id scope (docs/specs/unit-u-shell-9b-cross-document-shared.md
// §2.10 "W2-N15 fix — multi-document non-content re-derive keeps the H3 scope";
// docs/specs/wave-2-open-decisions.md §D W2-N15).
//
// TestWriter RED set written from §2.10 ALONE, BEFORE implementation.
//
// Contract exercised:
//   1. `decorateNodeInPlace` is idempotent: a shared root that already carries
//      an owners box (recognised by `data-shared:'true'`, so a document-scoped
//      box id is covered) gains NO second box on re-decoration.
//   2. With two mounted documents sharing section X, `reDerive('operator')`
//      (a non-content re-derive through the public `refresh()` path) stores the
//      SCOPED union as `lastTraversalEnvelope`, so the materialized graph has no
//      duplicate unscoped `rag-X` and both `rag-doc-a--X` / `rag-doc-b--X`
//      remain present + distinct.
//   3. A SINGLE-document re-derive stays UNSCOPED (`rag-X`).
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

// ===========================================================================
// Pure decoration fixtures (§2.10 idempotence)
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
function ownersBoxes(root: LegacyNodeData): LegacyNodeData[] {
  return (root.children ?? []).filter(
    (c) => (c.props as Record<string, unknown> | undefined)?.['data-shared'] === 'true',
  )
}

describe('U-SHELL-9b W2-N15 — owners-box decoration is idempotent (§2.10)', () => {
  const owners: Record<string, string[]> = { X: ['A', 'B'] }

  it('a document-SCOPED shared root re-decorated gains no second owners box', () => {
    // The stored scoped union is decorated again by `decorateShared` on the load
    // path; the existing box id is scoped (`rag-DOC--shared-owners-box`), so the
    // recognition must be by `data-shared`, not the exact unscoped id.
    const once = crossDoc.applySharedSubtreeDecoration(envelope([ragRoot('X')]), owners)
    const scoped = crossDoc.scopeDocumentIds(once, 'DOC')
    const twice = crossDoc.applySharedSubtreeDecoration(scoped, owners)
    expect(ownersBoxes(firstRoot(twice)).length).toBe(1)
  })

  it('the literal double-decoration is idempotent (exactly one owners box)', () => {
    const once = crossDoc.applySharedSubtreeDecoration(envelope([ragRoot('X')]), owners)
    const twice = crossDoc.applySharedSubtreeDecoration(once, owners)
    expect(ownersBoxes(firstRoot(twice)).length).toBe(1)
  })
})

// ===========================================================================
// Host fixture — a shared two-document snapshot (mirrors the H3/H2 harness)
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

function sharedHarness() {
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
    editingMode: 'textarea',
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
  return { host, runtime, mount }
}

function docTarget(documentId: string): TabTarget {
  return { kind: 'document', documentId }
}
function entry(id: string, target: TabTarget, title = id): TabEntry {
  return { id, target, title }
}

function materializedIds(runtime: Runtime): string[] {
  return runtime
    .materializedContentRoots()
    .map((root) => (root.props as { id?: unknown } | undefined)?.id)
    .filter((id): id is string => typeof id === 'string')
}

function duplicateRagIds(ids: string[]): string[] {
  const ragIds = ids.filter((id) => /^(?:rag|textarea|inline)-/.test(id))
  return ragIds.filter((id, i) => ragIds.indexOf(id) !== i)
}

// ===========================================================================
// §2.10 — multi-document NON-content re-derive keeps the H3 scope
// ===========================================================================
describe('U-SHELL-9b W2-N15 — multi-document non-content re-derive keeps the scope', () => {
  it('operator re-derive: both shared roots stay SCOPED + distinct, no duplicate/unscoped ids', async () => {
    const h = sharedHarness()
    await h.host.boot(h.runtime)
    h.host.mountTabs([entry('tab-a', docTarget('doc-a')), entry('tab-b', docTarget('doc-b'))])

    // A NON-content re-derive (the public path: reDerive('operator') → refresh()
    // → loadAppGraph(lastTraversalEnvelope)).
    await h.host.reDerive('operator')

    const ids = materializedIds(h.runtime)
    expect(ids).toContain('rag-doc-a--X')
    expect(ids).toContain('rag-doc-b--X')
    // The unscoped shared id must not be resurrected by the operator re-derive.
    expect(ids).not.toContain('rag-X')
    // No duplicate authored rag- root ids.
    expect(duplicateRagIds(ids)).toEqual([])
  })
})

// ===========================================================================
// §2.10 — the SINGLE-document path stays UNSCOPED (regression)
// ===========================================================================
describe('U-SHELL-9b W2-N15 — single-document non-content re-derive stays unscoped', () => {
  it('operator re-derive on one document keeps rag-X (no document scope)', async () => {
    const h = sharedHarness()
    await h.host.boot(h.runtime)
    await h.host.reDerive('operator')

    const ids = materializedIds(h.runtime)
    expect(ids).toContain('rag-X')
    expect(ids.some((id) => id.startsWith('rag-doc-a--'))).toBe(false)
  })
})
