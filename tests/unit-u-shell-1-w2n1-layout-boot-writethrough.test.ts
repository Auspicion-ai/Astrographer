// tests/unit-u-shell-1-w2n1-layout-boot-writethrough.test.ts — Wave-2 follow-up
// W2-N1: host boot READ of `OperatorSettings.layout` + the write-through seam
// (unit-u-shell-1-layout-zones.md §2.5; wave-2-open-decisions.md §D W2-N1).
//
// Before this fix `SidebarPanes.loadAppGraph`/`applyContentChange` called
// `assembleAppGraphEnvelope` WITHOUT `layout`, so boot always derived defaults
// even when a non-default layout was persisted. The fix reads the persisted
// `OperatorSettings.layout` at boot/refresh and exposes a `setLayout`
// write-through seam (one `bridge.operatorSettings.set({ layout })` per
// mutation) for the U-SHELL-3/4/5/8/9 owners.
import { describe, it, expect, vi } from 'vitest'
import type { LegacyInitialData } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { buildTraversal } from '../src/main/traversal.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import { coerceLayout } from '../src/renderer/layout-state.js'
import type { RagSnapshotPayload } from '../src/shared/types.js'

interface AnyNode {
  props?: { id?: unknown }
  placement?: { targetPlacement?: string[] }
  children?: AnyNode[]
}

function walk(node: AnyNode | null | undefined, out: AnyNode[] = []): AnyNode[] {
  if (node == null || typeof node !== 'object') return out
  out.push(node)
  for (const c of node.children ?? []) walk(c, out)
  return out
}

function findPane(envelope: LegacyInitialData, paneId: string): AnyNode | undefined {
  const out: AnyNode[] = []
  walk(envelope.template?.root as unknown as AnyNode, out)
  for (const payload of envelope.content ?? []) {
    for (const n of payload.content ?? []) walk(n as unknown as AnyNode, out)
  }
  return out.find((n) => n.props?.id === `pane-${paneId}`)
}

function makeNode(id: string): RagSnapshotPayload['nodes'][number] {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now }
}

/** A one-document snapshot (the existing host-harness shape). */
function validSnapshot(): RagSnapshotPayload {
  const now = new Date().toISOString()
  return {
    nodes: [makeNode('head-a')],
    edges: [{ id: 'dh1', kind: 'doc-head', source: 'head-a', target: 'doc-a', documentIds: ['doc-a'], createdAt: now, updatedAt: now }],
  }
}

function placeholderEnvelope(): LegacyInitialData {
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'wiki-root' },
        children: [{ type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } }],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  } as LegacyInitialData
}

function traversalEnvelope(): LegacyInitialData {
  const store = createSnapshotStore(
    [makeNode('head-a')],
    [{ id: 'dh1', kind: 'doc-head', source: 'head-a', target: 'doc-a', documentIds: ['doc-a'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  )
  return buildTraversal({ store, documentIds: ['doc-a'], zoneName: 'main' }).envelope
}

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  bridge: {
    operatorSettings: { set: ReturnType<typeof vi.fn>; get: () => Promise<{ layout?: { panes: Array<{ zone: string }>; zones: { left: { size: number } } } }> }
  }
}

function makeHarness(opts: { layout?: unknown } = {}): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const backRefs = new Map<string, string[]>()
  if (opts.layout !== undefined) {
    // The persisted layout is exposed through operatorSettings.get (as a real
    // main-process store would).
  }
  const state = {
    operatorSettings: {
      enabledPanes: [],
      defaultDocumentId: null,
      topK: 5,
      editingMode: 'contenteditable',
      theme: 'system',
      ...(opts.layout !== undefined ? { layout: opts.layout } : {}),
    } as Record<string, unknown>,
  }
  const bridge = {
    security: { get: vi.fn(async () => ({ token: null, enabled: ['read', 'dispatch'] })) },
    edit: { commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })), onRagStoreChanged: vi.fn(() => () => {}) },
    rag: {
      snapshot: vi.fn(async () => validSnapshot()),
      docHeads: vi.fn(async () => ({ documents: [{ documentId: 'doc-a', title: 'Doc A', path: [], tags: [] }] })),
      backlinks: vi.fn(async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
      stores: vi.fn(async () => ({ stores: [] })),
      query: vi.fn(async () => null),
      manage: vi.fn(async () => ({ ok: true })),
    },
    template: {
      get: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      onTemplateChanged: vi.fn(() => () => {}),
    },
    operatorSettings: {
      get: vi.fn(async () => ({ ...state.operatorSettings })),
      set: vi.fn(async (patch: Record<string, unknown>) => {
        state.operatorSettings = { ...state.operatorSettings, ...patch }
        return { ...state.operatorSettings }
      }),
      onChanged: vi.fn(() => () => {}),
    },
    pushPaneCatalog: vi.fn(),
  }
  const editController = createEditController({
    backRefs,
    commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
    onRebuild: () => {},
  })
  const host = new SidebarPanes({
    mount,
    operatorMount,
    registry,
    bridge: bridge as never,
    backRefs,
    editController,
  })
  const runtime = new Runtime({ mount, envelope: placeholderEnvelope() as never })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, bridge: bridge as never }
}

describe('W2-N1 — host boot read + write-through of OperatorSettings.layout', () => {
  it('honors a persisted non-default layout at boot: the pane assembles into its persisted zone', async () => {
    const persisted = coerceLayout({
      version: 1,
      panes: [{ id: 'doc-nav', zone: 'right', order: 0, collapsed: false }],
    })
    const h = makeHarness({ layout: persisted })
    await h.host.boot(h.runtime)
    const result = h.host.loadAppGraph(h.runtime, traversalEnvelope())
    expect(findPane(result.envelope, 'doc-nav')?.placement?.targetPlacement).toEqual(['right'])
  })

  it('the setLayout write-through seam commits ONCE through operatorSettings.set and round-trips', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    const next = coerceLayout({
      version: 1,
      panes: [{ id: 'doc-nav', zone: 'header', order: 0, collapsed: false }],
      zones: { left: { size: 333, minimized: false } },
    })
    h.host.setLayout(next)
    expect(h.bridge.operatorSettings.set).toHaveBeenCalledTimes(1)
    expect(h.bridge.operatorSettings.set).toHaveBeenCalledWith({ layout: next })
    // Round-trips through the store surface.
    const persisted = await h.bridge.operatorSettings.get()
    expect(persisted.layout?.panes[0].zone).toBe('header')
    expect(persisted.layout?.zones.left.size).toBe(333)
    // The in-memory layout applies to the next assemble (F7).
    const result = h.host.loadAppGraph(h.runtime, traversalEnvelope())
    expect(findPane(result.envelope, 'doc-nav')?.placement?.targetPlacement).toEqual(['header'])
  })
})
