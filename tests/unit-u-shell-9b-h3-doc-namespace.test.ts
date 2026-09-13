// tests/unit-u-shell-9b-h3-doc-namespace.test.ts — Unit U-SHELL-9b H3/W2-N12:
// the per-document id namespace (docs/specs/unit-u-shell-9b-cross-document-shared.md
// §2.6 H3 + §2.7 "Per-document id-namespace (H3/W2-N12) — pinned scheme").
//
// TestWriter RED set written from spec §2.7 ALONE, BEFORE implementation.
//
// Contract exercised:
//   1. `scopeDocumentIds(envelope, documentId)` is a PURE deep-copy rewrite:
//      `rag-<id>` → `rag-<doc>--<id>`, `textarea-<id>` → `textarea-<doc>--<id>`,
//      `inline-<id>-<i>` → `inline-<doc>--<id>-<i>`; `data-rag-node-id` stays the
//      PLAIN id; non-RAG ids (pane-/zone:/template) unchanged; total on malformed.
//   2. RAG-id derivation reads `data-rag-node-id` (fallback to `id.slice(4)`), so
//      the reconciler's plain-ragId `changed`-set matching still hits scoped roots.
//   3. `SidebarPanes.applyDocumentSet` scopes each document envelope and does NOT
//      cross-attribute sibling content (`materializedDocumentRoots()` per document).
//   4. The single-document (boot/mountTab/refresh) path stays UNSCOPED.
import { describe, it, expect, beforeAll } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
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

/** Resolve the proposed pure helper; absent → labelled RED. */
function scopeIds(envelope: LegacyInitialData, documentId: string): LegacyInitialData {
  const fn = (crossDoc as unknown as {
    scopeDocumentIds?: (e: LegacyInitialData, d: string) => LegacyInitialData
  }).scopeDocumentIds
  if (typeof fn !== 'function') {
    throw new Error('scopeDocumentIds is not implemented (U-SHELL-9b H3 RED — needs the Implementer)')
  }
  return fn(envelope, documentId)
}

function ragRoot(id: string, dataRagId: string, children: LegacyNodeData[] = []): LegacyNodeData {
  return { type: 'div', props: { id, 'data-rag-node-id': dataRagId }, children }
}

function envelope(roots: LegacyNodeData[]): LegacyInitialData {
  return {
    template: { root: { type: 'div', props: { id: 'root' }, children: [{ type: 'div', props: { id: 'zone:main' } }] } },
    content: roots.map((r) => ({ content: [r] })),
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

function rootIds(env: LegacyInitialData): string[] {
  const out: string[] = []
  for (const p of env.content ?? []) {
    for (const n of (p as { content?: LegacyNodeData[] }).content ?? []) {
      const id = (n?.props as { id?: unknown } | undefined)?.id
      if (typeof id === 'string') out.push(id)
    }
  }
  return out
}

// ===========================================================================
// §2.7 (1) — scopeDocumentIds pure behavior
// ===========================================================================
describe('U-SHELL-9b H3 — scopeDocumentIds (§2.7 scope carrier)', () => {
  function sampleEnvelope(): LegacyInitialData {
    const child = ragRoot('rag-childX', 'childX', [
      { type: 'textarea', props: { id: 'textarea-childX', 'data-rag-node-id': 'childX' } },
    ])
    const root = ragRoot('rag-X', 'X', [
      { type: 'span', props: { id: 'inline-X-0', 'data-rag-node-id': 'X' }, content: 'inline' },
      { type: 'textarea', props: { id: 'textarea-X', 'data-rag-node-id': 'X' } },
      child,
    ])
    const pane: LegacyNodeData = { type: 'div', props: { id: 'pane-doc-nav' } }
    const env = envelope([root, pane])
    return env
  }

  it('rewrites rag-/textarea-/inline- ids with a `<documentId>--` scope (literal separator)', () => {
    const out = scopeIds(sampleEnvelope(), 'DOC')
    const ids = rootIds(out)
    expect(ids).toContain('rag-DOC--X')
    expect(ids).toContain('pane-doc-nav') // non-RAG id untouched

    const root = (out.content![0] as { content: LegacyNodeData[] }).content[0]
    expect(root.props!.id).toBe('rag-DOC--X')
    const kids = root.children as LegacyNodeData[]
    expect(kids[0].props!.id).toBe('inline-DOC--X-0')
    expect(kids[1].props!.id).toBe('textarea-DOC--X')
    expect(kids[2].props!.id).toBe('rag-DOC--childX')
    const grandchild = (kids[2].children as LegacyNodeData[])[0]
    expect(grandchild.props!.id).toBe('textarea-DOC--childX')
  })

  it('keeps `data-rag-node-id` the PLAIN ragId everywhere (the addressing key)', () => {
    const out = scopeIds(sampleEnvelope(), 'DOC')
    const root = (out.content![0] as { content: LegacyNodeData[] }).content[0]
    expect(root.props!['data-rag-node-id']).toBe('X')
    const kids = root.children as LegacyNodeData[]
    expect(kids[0].props!['data-rag-node-id']).toBe('X')
    expect(kids[1].props!['data-rag-node-id']).toBe('X')
    expect(kids[2].props!['data-rag-node-id']).toBe('childX')
    expect((kids[2].children as LegacyNodeData[])[0].props!['data-rag-node-id']).toBe('childX')
  })

  it('leaves pane-/zone:/template ids unchanged', () => {
    const out = scopeIds(sampleEnvelope(), 'DOC')
    expect(rootIds(out)).toContain('pane-doc-nav')
    const tpl = out.template!.root as LegacyNodeData
    expect(tpl.props!.id).toBe('root')
    expect((tpl.children as LegacyNodeData[])[0].props!.id).toBe('zone:main')
  })

  it('returns a DEEP COPY — the input envelope is never mutated', () => {
    const input = sampleEnvelope()
    const before = JSON.stringify(input)
    const out = scopeIds(input, 'DOC')
    expect(JSON.stringify(input)).toBe(before)
    expect(out).not.toBe(input)
    // A mutation of the output does not touch the input.
    const outRoot = (out.content![0] as { content: LegacyNodeData[] }).content[0]
    outRoot.props!.id = 'rag-MUTATED'
    expect((input.content![0] as { content: LegacyNodeData[] }).content[0].props!.id).toBe('rag-X')
  })

  it('is total on malformed input (never throws)', () => {
    expect(() => scopeIds(null as never, 'DOC')).not.toThrow()
    expect(() => scopeIds(undefined as never, 'DOC')).not.toThrow()
    expect(() => scopeIds('nope' as never, 'DOC')).not.toThrow()
    expect(() => scopeIds({ content: 'nope' } as never, 'DOC')).not.toThrow()
    expect(() => scopeIds({ content: [null, { content: 'x' }, { content: [null, 7] }] } as never, 'DOC')).not.toThrow()
  })
})

// ===========================================================================
// §2.7 (adversarial, 2026-09-13) — separator hardening. `sanitizeDocumentId`
// permits `[a-zA-Z0-9._-]`, so a document id (or a RAG id) may itself contain
// the `--` scope separator; RAG-id recovery must not mis-parse it.
// ===========================================================================
describe('U-SHELL-9b H3 — adversarial separator hardening (§2.7)', () => {
  it('recovers the plain ragId when the DOCUMENT id contains the `--` separator', () => {
    // `foo--bar` is a legal sanitized document id.
    expect(crossDoc.plainRagId({ id: 'rag-foo--bar--X', 'data-rag-node-id': 'X' })).toBe('X')
  })

  it('recovers the plain ragId when the RAG id contains `--` under a scoped id', () => {
    expect(crossDoc.plainRagId({ id: 'rag-x--y--a--b', 'data-rag-node-id': 'a--b' })).toBe('a--b')
    expect(crossDoc.plainRagId({ id: 'rag-a--b', 'data-rag-node-id': 'a--b' })).toBe('a--b')
  })

  it('does NOT resolve the C20 owners box to its owner ragId (not a RAG root)', () => {
    expect(crossDoc.plainRagId({ id: 'rag-shared-owners-box', 'data-rag-node-id': 'X' })).not.toBe('X')
  })

  it('scopeDocumentIds + plainRagId round-trip a `--`-bearing document id', () => {
    const scoped = scopeIds(envelope([ragRoot('rag-X', 'X')]), 'foo--bar')
    const root = (scoped.content![0] as { content: LegacyNodeData[] }).content[0]
    expect(root.props!.id).toBe('rag-foo--bar--X')
    expect(crossDoc.plainRagId(root.props as Record<string, unknown>)).toBe('X')
  })
})

// ===========================================================================
// §2.7 (2) — the reconciler matches on the PLAIN ragId (data-rag-node-id)
// ===========================================================================
function scopedRoot(documentId: string, ragId: string): LegacyNodeData {
  return { type: 'div', props: { id: `rag-${documentId}--${ragId}`, 'data-rag-node-id': ragId }, content: ragId }
}
function previousRoot(documentId: string, node: LegacyNodeData): { documentId: string; root: LegacyNodeData } {
  return { documentId, root: node }
}
function docEntry(documentId: string, roots: LegacyNodeData[]): { documentId: string; envelope: LegacyInitialData } {
  return { documentId, envelope: envelope(roots) }
}

describe('U-SHELL-9b H3 — N-root reconcile keys by plain ragId (§2.7)', () => {
  it('two scoped shared roots A/B with data-rag-node-id X: a change to X replaces BOTH', () => {
    const result = reconcileDocumentRoots({
      previous: [previousRoot('A', scopedRoot('A', 'X')), previousRoot('B', scopedRoot('B', 'X'))],
      next: [docEntry('A', [scopedRoot('A', 'X')]), docEntry('B', [scopedRoot('B', 'X')])],
      change: { kind: 'content', nodeIds: ['X'], edgeIds: [] },
      documentIds: ['A', 'B'],
    })
    expect(result.replaced.map((r) => `${r.documentId}|${r.cssId}`)).toEqual(['A|rag-A--X', 'B|rag-B--X'])
    expect(result.added).toEqual([])
    expect(result.removed).toEqual([])
    expect(result.kept).toEqual([])
    // The derived plain ragId is preserved for payload matching.
    expect(result.replaced[0].ragNodeId).toBe('X')
  })
})

// ===========================================================================
// §2.7 (3)/(4) — host multi-document mount scopes ids; single-document does not
// ===========================================================================
const NOW = new Date().toISOString()
function stageNode(id: string, type: string, content: string) {
  return { id, type, content, ownedNodeIds: [], createdAt: NOW, updatedAt: NOW }
}
function stageEdge(id: string, kind: string, source: string, target: string, documentIds: string[]) {
  return { id, kind, source, target, documentIds, createdAt: NOW, updatedAt: NOW }
}

/** A valid two-document snapshot where BOTH documents reach the SAME section X. */
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

describe('U-SHELL-9b H3 — simultaneous mount scopes the per-document id namespace', () => {
  const DOCS = [
    { documentId: 'doc-a', title: 'Doc A' },
    { documentId: 'doc-b', title: 'Doc B' },
  ]

  it('§2.7 — mountTabs materializes DISTINCT scoped roots for the shared section (no duplicate ids)', async () => {
    const h = sharedHarness()
    await h.host.boot(h.runtime)
    h.host.mountTabs([entry('tab-a', docTarget('doc-a')), entry('tab-b', docTarget('doc-b'))])

    const ids = materializedIds(h.runtime)
    expect(ids).toContain('rag-doc-a--X')
    expect(ids).toContain('rag-doc-b--X')

    const html = (h.mount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('id="rag-doc-a--X"')
    expect(html).toContain('id="rag-doc-b--X"')
    // The unscoped shared id must NOT survive in the simultaneous render.
    expect(html).not.toContain('id="rag-X"')

    // No duplicate RAG-authored id attribute anywhere in the rendered HTML (the
    // negative lookbehind excludes `data-rag-node-id=` / `data-node-id=`). This
    // is the H3 invariant the per-document namespace exists to guarantee. (The
    // template root `wiki-root` can legitimately appear twice in the dom-shim's
    // accumulated mount across engine generations — an unrelated render artifact.)
    const allIds = [...html.matchAll(/(?<![-\w])id="([^"]*)"/g)].map((m) => m[1])
    const ragIds = allIds.filter((id) => /^(?:rag|textarea|inline)-/.test(id))
    const dupes = ragIds.filter((id, i) => ragIds.indexOf(id) !== i)
    expect(dupes).toEqual([])
    expect(new Set(ragIds).size).toBe(ragIds.length)
  })

  it('§2.7 — materializedDocumentRoots attributes each scoped root to its OWN document', async () => {
    const h = sharedHarness()
    await h.host.boot(h.runtime)
    h.host.mountTabs([entry('tab-a', docTarget('doc-a')), entry('tab-b', docTarget('doc-b'))])

    const roots = h.runtime.materializedDocumentRoots()
    const ragRoots = roots
      .map((r) => ({
        documentId: r.documentId,
        id: (r.root.props as { id?: unknown } | undefined)?.id,
      }))
      .filter((r): r is { documentId: string; id: string } => typeof r.id === 'string' && r.id.startsWith('rag-'))

    const docA = ragRoots.filter((r) => r.documentId === 'doc-a')
    const docB = ragRoots.filter((r) => r.documentId === 'doc-b')
    expect(docA.length).toBeGreaterThanOrEqual(2) // headA + shared X
    expect(docB.length).toBeGreaterThanOrEqual(2) // headB + shared X
    // No cross-attribution: each root's authored id is scoped to its own document.
    expect(docA.every((r) => r.id.startsWith('rag-doc-a--'))).toBe(true)
    expect(docB.every((r) => r.id.startsWith('rag-doc-b--'))).toBe(true)
    expect(docA.some((r) => r.id === 'rag-doc-a--X')).toBe(true)
    expect(docB.some((r) => r.id === 'rag-doc-b--X')).toBe(true)
  })

  it('§2.7 — the single-document boot path stays UNSCOPED (rag-X, not rag-doc-a--X)', async () => {
    const h = sharedHarness()
    await h.host.boot(h.runtime)
    const ids = materializedIds(h.runtime)
    expect(ids).toContain('rag-X')
    expect(ids.some((id) => id.startsWith('rag-doc-a--'))).toBe(false)
    const html = (h.mount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('id="rag-X"')
  })
})
