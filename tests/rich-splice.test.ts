// tests/rich-splice.test.ts — Unit U3: the HOST post-assembly splice
// `applyEditingMode(envelope, editingMode)` (a PRIVATE `SidebarPanes` method)
// tested through the `loadAppGraph` integration path with an INJECTED
// `editingMode`, plus the additive snapshot `children` field + the `EditingMode`
// type (docs/specs/unit-u3-rich-eligibility-splice.md §1.3/§1.4/§2/§5).
//
// This is the TestWriter RED set. What is RED:
//   - `applyEditingMode` does NOT exist in `src/renderer/sidebar-panes.ts` and
//     `loadAppGraph` does NOT call it, so `this.editingMode` is never read →
//     the splice assertions FAIL (eligible roots keep their textarea and no
//     `contenteditable` prop is set).
//   - `EditingMode` does NOT exist in `src/shared/types.ts` and
//     `RagSnapshotPayload.nodes[].children?` does NOT exist → the type-level
//     tests fail at `npm run typecheck` (part of the trio), even though vitest
//     erases the type-only references at runtime.
//
// The host splice is not a standalone pure function; per the spec §1.3 + §5
// integration note it is a private `SidebarPanes` method tested through
// `loadAppGraph` with the host's private `this.editingMode` field injected
// (`(host as any).editingMode = 'contenteditable' | 'textarea'` — the U3
// amendment, testable before Unit U1 adds the operator-settings field).
//
// The assembled post-splice envelope is captured by spying on the app
// Runtime's `loadEnvelope` (the splice runs on `result.envelope` BEFORE
// `runtime.loadEnvelope(result.envelope)` in `loadAppGraph`).
//
// The test file is derived from the spec ALONE. The Implementer makes this
// file green with NO changes to these tests.
import { describe, it, expect, vi } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry, type PaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { buildTraversal } from '../src/main/traversal.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate } from '../src/main/template-store.js'
import type { RagSnapshotPayload, EditingMode } from '../src/shared/types.js'
import type { RagNodeChild, RagNode, RagEdge } from '../src/main/rag-store.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { SidebarPanes, type SidebarPanesOptions } from '../src/renderer/sidebar-panes.js'

// ===========================================================================
// fixtures
// ===========================================================================

/** A snapshot node (the `RagSnapshotPayload.nodes` element). */
function makeNode(id: string, overrides: Partial<RagSnapshotPayload['nodes'][number]> = {}): RagSnapshotPayload['nodes'][number] {
  const now = new Date().toISOString()
  return {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/** A snapshot edge (the `RagSnapshotPayload.edges` element). */
function makeEdge(
  id: string,
  kind: string,
  source: string,
  target: string,
  overrides: Partial<RagSnapshotPayload['edges'][number]> = {},
): RagSnapshotPayload['edges'][number] {
  const now = new Date().toISOString()
  return {
    id,
    kind,
    source,
    target,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/** Build a real traversal envelope (Unit C `buildTraversal`) over the given
 *  snapshot. `documentIds = ['doc']` (the doc root). */
function traversalEnv(nodes: RagSnapshotPayload['nodes'], edges: RagSnapshotPayload['edges']): LegacyInitialData {
  // The scoped walk reads the adjacency methods, so the snapshot adapter MUST
  // be `createSnapshotStore` (amendment 4) — a listNodes/listEdges-only adapter
  // would throw. The snapshot's `type` fields are `string`; the cast is
  // structural-only.
  const store = createSnapshotStore(nodes as RagNode[], edges as RagEdge[])
  return buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' }).envelope
}

/** A valid single-section document whose head section `s1` is the given RAG
 *  type. `nestDocChildren` is TRUE (valid doc-flow: doc-head + doc-end). */
function singleSectionStore(type: string, content: string, nodeOverrides: Partial<RagSnapshotPayload['nodes'][number]> = {}) {
  const nodes = [
    makeNode('doc', { type: 'h1', content: 'Doc' }),
    makeNode('s1', { type, content, ...nodeOverrides }),
  ]
  const edges = [
    makeEdge('e-hd', 'doc-head', 's1', 'doc', { documentIds: ['doc'] }),
    makeEdge('e-end', 'doc-end', 's1', 'doc', { documentIds: ['doc'] }),
  ]
  return { nodes, edges }
}

/** The placeholder/default content-window template envelope (the host-test
 *  convention) — the empty-store bootstrap for `new Runtime`. */
function placeholderEnvelope(): LegacyInitialData {
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'wiki-root' },
        children: [
          { type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

/** A minimal fake `ProvidentBridge` (the renderer's IPC surface) sufficient
 *  for constructing a `SidebarPanes` host (boot is NOT called in these tests —
 *  the bridge is unused beyond construction). */
function makeBridge() {
  const bridge = {
    security: { get: vi.fn(async () => ({ token: null, enabled: [] })) },
    edit: {
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      onRagStoreChanged: vi.fn(() => () => {}),
    },
    rag: {
      query: vi.fn(async () => ({ query: '', ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 })),
      snapshot: vi.fn(async () => ({ nodes: [], edges: [] })),
      backlinks: vi.fn(async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
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
      get: vi.fn(async () => ({ enabledPanes: [], defaultDocumentId: null, topK: 5 })),
      set: vi.fn(async (patch: { enabledPanes?: string[]; defaultDocumentId?: string | null; topK?: number }) => patch),
    },
  }
  return bridge
}

// ---- the harness -----------------------------------------------------------

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  registry: PaneRegistry
  backRefs: Map<string, string[]>
  editController: EditController
}

/** Build a `SidebarPanes` host + a real app Runtime (DOM-shimmed) + a mock
 *  bridge. The app-graph panes are NOT registered (so the assembled envelope
 *  is exactly the traversal content — no pane roots to interfere with the
 *  splice assertions). */
function makeHarness(): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const backRefs = new Map<string, string[]>()
  const editController = createEditController({
    backRefs,
    commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
    onRebuild: vi.fn(),
  })
  const host = new SidebarPanes({
    mount,
    operatorMount,
    registry,
    bridge: makeBridge() as never,
    backRefs,
    editController,
  })
  const runtime = new Runtime({ mount, envelope: placeholderEnvelope() as never })
  return { host, runtime, registry, backRefs, editController }
}

/** Drive `loadAppGraph` with the host's `editingMode` field INJECTED (the U3
 *  amendment — `this.editingMode` is a private field set before the call). The
 *  private `applyEditingMode` runs inside `loadAppGraph` (after
 *  `setTextareaReadOnly`, before `recomputeBackRefs`); the post-splice
 *  ASSEMBLED envelope is captured from the app Runtime's `loadEnvelope`. */
function spliceEnvelope(h: Harness, traversalEnvelope: LegacyInitialData, editingMode: EditingMode): LegacyInitialData {
  ;(h.host as unknown as { editingMode: EditingMode }).editingMode = editingMode
  const spy = vi.spyOn(h.runtime, 'loadEnvelope')
  h.host.loadAppGraph(h.runtime, traversalEnvelope)
  const env = spy.mock.calls[0][0] as LegacyInitialData
  spy.mockRestore()
  return env
}

// ---- envelope inspection helpers -------------------------------------------

interface RagRoot { ragId: string; root: LegacyNodeData }

/** Collect EVERY rag-`<id>`-prefixed subtree root in the envelope (each payload
 *  content[0], recursing through children), in document order. */
function ragRoots(env: LegacyInitialData): RagRoot[] {
  const out: RagRoot[] = []
  const walk = (n: LegacyNodeData): void => {
    const pid = n.props?.id
    if (typeof pid === 'string' && pid.startsWith('rag-')) {
      out.push({ ragId: pid.slice(4), root: n })
    }
    for (const c of n.children ?? []) walk(c as LegacyNodeData)
  }
  for (const p of env.content ?? []) walk(p.content[0] as LegacyNodeData)
  return out
}

/** All roots materializing the given ragId (multi-parent nodes have >1). */
function rootsFor(env: LegacyInitialData, ragId: string): RagRoot[] {
  return ragRoots(env).filter((r) => r.ragId === ragId)
}

/** True iff the root still carries its traversal-authored `textarea-<ragId>`
 *  child (the fallback control). */
function hasTextarea(root: LegacyNodeData, ragId: string): boolean {
  return (root.children ?? []).some((c) => (c as LegacyNodeData).props?.id === `textarea-${ragId}`)
}

/** The root's `contenteditable` prop value (undefined when not set). */
function contenteditableProp(root: LegacyNodeData): unknown {
  return (root.props as Record<string, unknown> | undefined)?.['contenteditable']
}

/** The authored props.id on a subtree root (`rag-<ragId>`). */
function rootId(root: LegacyNodeData): unknown {
  return (root.props as Record<string, unknown> | undefined)?.['id']
}

// ===========================================================================
// §2.1 HAPPY-PATH STATES (11-21)
// ===========================================================================
describe('rich-splice — eligible root splices (§2.1 state 11)', () => {
  it('an eligible p root → its textarea-<ragId> child is REMOVED and props.contenteditable === true; the other props are preserved', () => {
    const { nodes, edges } = singleSectionStore('p', 'hello')
    const h = makeHarness()
    const env = spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    const [s1] = rootsFor(env, 's1')
    expect(s1).toBeDefined()
    expect(hasTextarea(s1.root, 's1')).toBe(false)
    expect(contenteditableProp(s1.root)).toBe(true)
    // The root's OTHER props are preserved (authored id + data-rag-node-id).
    expect(rootId(s1.root)).toBe('rag-s1')
    expect((s1.root.props as Record<string, unknown>)['data-rag-node-id']).toBe('s1')
  })
})

describe('rich-splice — inline children survive the splice (§2.1 state 12)', () => {
  it('an eligible root WITH inline children keeps them (only the textarea is removed) and contenteditable:true is set', () => {
    const inline: RagNodeChild[] = [{ type: 'strong', content: 'bold' }, { type: 'em', content: 'ital' }]
    const { nodes, edges } = singleSectionStore('p', 'plain', { children: inline })
    const h = makeHarness()
    const env = spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    const [s1] = rootsFor(env, 's1')
    expect(hasTextarea(s1.root, 's1')).toBe(false)
    expect(contenteditableProp(s1.root)).toBe(true)
    // The inline children remain (authored id `inline-s1-<n>`, NOT rag-prefixed).
    const inlineIds = (s1.root.children ?? []).map((c) => (c as LegacyNodeData).props?.id)
    expect(inlineIds).toEqual(['inline-s1-0', 'inline-s1-1'])
    expect(inlineIds.some((id) => id === 'textarea-s1')).toBe(false)
  })
})

describe('rich-splice — ineligible root has its textarea removed (§2.1 state 13)', () => {
  it('a non-EDITABLE type (ul/pre/td) → its textarea is removed and contenteditable is NOT set', () => {
    for (const type of ['ul', 'pre', 'td'] as const) {
      const { nodes, edges } = singleSectionStore(type, 'x')
      const h = makeHarness()
      const env = spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
      const [s1] = rootsFor(env, 's1')
      expect(hasTextarea(s1.root, 's1')).toBe(false) // no textarea in contenteditable mode
      expect(contenteditableProp(s1.root)).toBeUndefined()
    }
  })

  it('an EDITABLE type that OWNS a doc-child → NOT eligible → its textarea is removed (no contenteditable); the nested doc-child (itself eligible) splices', () => {
    const nodes = [
      makeNode('doc', { type: 'h1', content: 'Doc' }),
      makeNode('s1', { type: 'h1', content: 'Head' }), // owns doc-child dc
      makeNode('dc', { type: 'p', content: 'child' }),
    ]
    const edges = [
      makeEdge('e-hd', 'doc-head', 's1', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-end', 'doc-end', 's1', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-c', 'doc-child', 's1', 'dc', { order: 0 }),
    ]
    const h = makeHarness()
    const env = spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    const [s1] = rootsFor(env, 's1')
    const [dc] = rootsFor(env, 'dc')
    expect(hasTextarea(s1.root, 's1')).toBe(false) // doc-child owner → textarea removed (no contenteditable)
    expect(contenteditableProp(s1.root)).toBeUndefined()
    expect(hasTextarea(dc.root, 'dc')).toBe(false) // the doc-child p splices independently
    expect(contenteditableProp(dc.root)).toBe(true)
  })
})

describe('rich-splice — nested subtree roots splice recursively (§2.1 state 14)', () => {
  it('a doc-child h2 splices independent of its parent; the parent h1 (which OWNS the doc-child) is itself ineligible and has its textarea removed', () => {
    // An h1 that owns a rag-prefixed doc-child is NOT eligible (spec state
    // 8/13 — ownsDocChildren=true → isRichEditableRoot false), so it does NOT
    // get contenteditable. Its textarea is STILL removed (no textareas in
    // contenteditable mode). Only the doc-child (h2) splices.
    const nodes = [
      makeNode('doc', { type: 'h1', content: 'Doc' }),
      makeNode('s1', { type: 'h1', content: 'Parent' }),
      makeNode('s2', { type: 'h2', content: 'Child' }),
    ]
    const edges = [
      makeEdge('e-hd', 'doc-head', 's1', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-end', 'doc-end', 's1', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-c', 'doc-child', 's1', 's2', { order: 0 }),
    ]
    const h = makeHarness()
    const env = spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    const [s1] = rootsFor(env, 's1')
    const [s2] = rootsFor(env, 's2')
    // parent h1 owns a doc-child → ineligible → textarea removed, no contenteditable.
    expect(hasTextarea(s1.root, 's1')).toBe(false)
    expect(contenteditableProp(s1.root)).toBeUndefined()
    // the doc-child h2 is eligible → splices recursively.
    expect(hasTextarea(s2.root, 's2')).toBe(false)
    expect(contenteditableProp(s2.root)).toBe(true)
  })
})

describe('rich-splice — multi-parent duplicates are consistent (§2.1 state 15)', () => {
  /** A document with two sections (sec-a, sec-b) that both parent-child the
   *  multi-parent node `dup` → `dup` materialized twice (once per parent). */
  function multiParentStore(type: string) {
    const nodes = [
      makeNode('doc', { type: 'h1', content: 'Doc' }),
      makeNode('sec-a', { type: 'p', content: 'A' }),
      makeNode('sec-b', { type: 'p', content: 'B' }),
      makeNode('end', { type: 'p', content: 'end' }),
      makeNode('dup', { type, content: 'shared' }),
    ]
    const edges = [
      makeEdge('e-hd', 'doc-head', 'sec-a', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-n1', 'next-section', 'sec-a', 'sec-b', { documentIds: ['doc'] }),
      makeEdge('e-n2', 'next-section', 'sec-b', 'end', { documentIds: ['doc'] }),
      makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-p1', 'parent-child', 'sec-a', 'dup'),
      makeEdge('e-p2', 'parent-child', 'sec-b', 'dup'),
    ]
    return { nodes, edges }
  }

  it('an ELIGIBLE multi-parent node → BOTH duplicate subtree roots have their textarea removed + contenteditable:true', () => {
    const { nodes, edges } = multiParentStore('p')
    const h = makeHarness()
    const env = spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    const dups = rootsFor(env, 'dup')
    expect(dups.length).toBe(2) // the multi-parent duplicate census
    for (const d of dups) {
      expect(hasTextarea(d.root, 'dup')).toBe(false)
      expect(contenteditableProp(d.root)).toBe(true)
    }
  })

  it('an INELIGIBLE multi-parent node → BOTH duplicate subtree roots have their textarea removed (no contenteditable)', () => {
    const { nodes, edges } = multiParentStore('pre')
    const h = makeHarness()
    const env = spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    const dups = rootsFor(env, 'dup')
    expect(dups.length).toBe(2)
    for (const d of dups) {
      expect(hasTextarea(d.root, 'dup')).toBe(false) // no textarea in contenteditable mode
      expect(contenteditableProp(d.root)).toBeUndefined()
    }
  })
})

describe('rich-splice — empty eligible root (§2.1 state 16)', () => {
  it('an eligible root with content:"" and no children → still eligible; textarea removed + contenteditable:true', () => {
    const { nodes, edges } = singleSectionStore('p', '')
    const h = makeHarness()
    const env = spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    const [s1] = rootsFor(env, 's1')
    expect(hasTextarea(s1.root, 's1')).toBe(false)
    expect(contenteditableProp(s1.root)).toBe(true)
  })
})

describe('rich-splice — empty envelope (§2.1 state 17)', () => {
  it('an envelope with empty content → the splice no-ops (no rag roots walked), never throws', () => {
    const h = makeHarness()
    const env = spliceEnvelope(h, traversalEnv([], []), 'contenteditable')
    expect(ragRoots(env)).toHaveLength(0)
    // Nothing gained a contenteditable prop and nothing threw.
    expect(() => spliceEnvelope(h, traversalEnv([], []), 'contenteditable')).not.toThrow()
  })
})

describe('rich-splice — textarea-mode no-op (§2.1 state 18)', () => {
  it('every subtree root keeps its textarea, no contenteditable prop is set, no child removed — the envelope is byte-for-byte unchanged by the splice', () => {
    const { nodes, edges } = singleSectionStore('p', 'hello')
    const h = makeHarness()
    const env = (() => { h.backRefs.clear(); return spliceEnvelope(h, traversalEnv(nodes, edges), 'textarea') })()
    const roots = ragRoots(env)
    expect(roots.length).toBe(1)
    for (const r of roots) {
      expect(hasTextarea(r.root, r.ragId)).toBe(true)
      expect(contenteditableProp(r.root)).toBeUndefined()
    }
    // Determinism: two textarea-mode passes (backRefs reset before each so the
    // pre-splice setTextareaReadOnly pass sees the same pre-existing map)
    // produce identical envelopes — the splice itself mutates NOTHING.
    const env2 = (() => { h.backRefs.clear(); return spliceEnvelope(h, traversalEnv(nodes, edges), 'textarea') })()
    expect(env2).toEqual(env)
  })
})

describe('rich-splice — idempotence across re-assembles (§2.1 state 19, §2.2 fail-state 4)', () => {
  it('re-running the splice on the SAME (already-spliced) envelope → removal no-ops (no throw, no double-remove), contenteditable:true set again, result identical to the first pass', () => {
    const { nodes, edges } = singleSectionStore('p', 'hello')
    const h = makeHarness()
    // Build the traversal envelope ONCE; `loadAppGraph` re-assembles it (the
    // subtree-root objects are shared), so the second pass re-splices the SAME
    // already-spliced roots. Reset backRefs before each pass so the
    // setTextareaReadOnly pass sees the same pre-existing (empty) map.
    const env1 = (() => {
      h.backRefs.clear()
      return spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    })()
    const [s1a] = rootsFor(env1, 's1')
    expect(hasTextarea(s1a.root, 's1')).toBe(false)
    expect(contenteditableProp(s1a.root)).toBe(true)

    const env2 = (() => {
      h.backRefs.clear()
      return spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    })()
    const [s1b] = rootsFor(env2, 's1')
    expect(hasTextarea(s1b.root, 's1')).toBe(false)
    expect(contenteditableProp(s1b.root)).toBe(true)
    // Idempotent: the second pass is byte-identical to the first (no throw,
    // no double-remove, no stale state).
    expect(env2).toEqual(env1)
  })
})

describe('rich-splice — integration + ordering (§2.1 states 20-21)', () => {
  it('state 20 — the splice runs after setTextareaReadOnly and before recomputeBackRefs: the eligible root\'s rag-<ragId> id is still in the recomputed backRefs → isEditable(ragId) stays true', () => {
    const { nodes, edges } = singleSectionStore('p', 'hello')
    const h = makeHarness()
    spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    // recomputeBackRefs ran AFTER the splice removed the textarea; the eligible
    // root is still rag-prefixed so its subtree is collected into backRefs.
    expect(h.backRefs.has('s1')).toBe(true)
    expect(h.editController.isEditable('s1')).toBe(true)
  })

  it('state 21 — the injected-editingMode integration test: one host instance with editingMode=contenteditable splices eligible roots; with editingMode=textarea it is a no-op', () => {
    const h = makeHarness()
    // contenteditable → splice.
    const ce = spliceEnvelope(h, traversalEnv(...((): [RagSnapshotPayload['nodes'], RagSnapshotPayload['edges']] => {
      const { nodes, edges } = singleSectionStore('p', 'hello')
      return [nodes, edges]
    })()), 'contenteditable')
    const [ceRoot] = rootsFor(ce, 's1')
    expect(hasTextarea(ceRoot.root, 's1')).toBe(false)
    expect(contenteditableProp(ceRoot.root)).toBe(true)

    // textarea (the same host instance) → no-op on a FRESH traversal.
    const { nodes, edges } = singleSectionStore('p', 'hello')
    const tx = spliceEnvelope(h, traversalEnv(nodes, edges), 'textarea')
    const [txRoot] = rootsFor(tx, 's1')
    expect(hasTextarea(txRoot.root, 's1')).toBe(true)
    expect(contenteditableProp(txRoot.root)).toBeUndefined()
  })
})

// ===========================================================================
// §2.2 FAIL-STATES (2-7) + §5 ADR regressions
// ===========================================================================
describe('rich-splice — fail-state 2: contenteditable prop collision (§2.2/ADR-2)', () => {
  it('an eligible root whose authored props ALREADY carry a contenteditable key → the splice OVERWRITES it to true (the authored stale value is NOT preserved)', () => {
    for (const stale of ['false', 'plaintext-only', true]) {
      const { nodes, edges } = singleSectionStore('p', 'hello', { props: { contenteditable: stale } })
      const h = makeHarness()
      const env = spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
      const [s1] = rootsFor(env, 's1')
      expect(contenteditableProp(s1.root)).toBe(true)
    }
  })
})

describe('rich-splice — fail-state 3: ineligible roots have their textarea removed (§2.2/ADR-1)', () => {
  it('in contenteditable mode, EVERY ineligible root has its textarea removed (no textareas in contenteditable mode) and no contenteditable prop', () => {
    const nodes = [
      makeNode('doc', { type: 'h1', content: 'Doc' }),
      makeNode('s-ul', { type: 'ul', content: 'list' }),
      makeNode('s-pre', { type: 'pre', content: 'code' }),
      makeNode('s-td', { type: 'td', content: 'cell' }),
      makeNode('s-h1-dc', { type: 'h1', content: 'head' }), // doc-child owner (below)
      makeNode('child', { type: 'p', content: 'c' }),
    ]
    const edges = [
      makeEdge('e-hd', 'doc-head', 's-ul', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-n1', 'next-section', 's-ul', 's-pre', { documentIds: ['doc'] }),
      makeEdge('e-n2', 'next-section', 's-pre', 's-td', { documentIds: ['doc'] }),
      makeEdge('e-n3', 'next-section', 's-td', 's-h1-dc', { documentIds: ['doc'] }),
      makeEdge('e-end', 'doc-end', 's-h1-dc', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-c', 'doc-child', 's-h1-dc', 'child', { order: 0 }),
    ]
    const h = makeHarness()
    const env = spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    for (const ragId of ['s-ul', 's-pre', 's-td', 's-h1-dc']) {
      const [root] = rootsFor(env, ragId)
      expect(hasTextarea(root.root, ragId)).toBe(false) // no textarea in contenteditable mode
      expect(contenteditableProp(root.root)).toBeUndefined()
    }
  })
})

describe('rich-splice — fail-state 5: the textarea DOM element is absent in contenteditable mode (§2.2/ADR-7)', () => {
  it('for an eligible root in contenteditable mode, no textarea-<ragId> appears in the loaded graph HTML', () => {
    const { nodes, edges } = singleSectionStore('p', 'hello')
    const h = makeHarness()
    spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    const html = h.runtime.renderedHtmlResult().renderedHtml
    expect(html).not.toContain('textarea-s1')
  })
})

describe('rich-splice — fail-state 6: multi-parent consistency (§2.2/ADR-8)', () => {
  function multiParentStore(type: string) {
    const nodes = [
      makeNode('doc', { type: 'h1', content: 'Doc' }),
      makeNode('sec-a', { type: 'p', content: 'A' }),
      makeNode('sec-b', { type: 'p', content: 'B' }),
      makeNode('end', { type: 'p', content: 'end' }),
      makeNode('dup', { type, content: 'shared' }),
    ]
    const edges = [
      makeEdge('e-hd', 'doc-head', 'sec-a', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-n1', 'next-section', 'sec-a', 'sec-b', { documentIds: ['doc'] }),
      makeEdge('e-n2', 'next-section', 'sec-b', 'end', { documentIds: ['doc'] }),
      makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-p1', 'parent-child', 'sec-a', 'dup'),
      makeEdge('e-p2', 'parent-child', 'sec-b', 'dup'),
    ]
    return { nodes, edges }
  }

  it('a multi-parent node receives the SAME splice decision on EVERY duplicate — eligible: ALL splice; ineligible: ALL have the textarea removed (one-removed-one-kept is a fail-state)', () => {
    // Eligible: ALL duplicates splice.
    const h1 = makeHarness()
    const { nodes: en, edges: ee } = multiParentStore('p')
    const envE = spliceEnvelope(h1, traversalEnv(en, ee), 'contenteditable')
    for (const d of rootsFor(envE, 'dup')) {
      expect(hasTextarea(d.root, 'dup')).toBe(false)
      expect(contenteditableProp(d.root)).toBe(true)
    }
    // Ineligible: ALL duplicates have the textarea removed (no contenteditable).
    const h2 = makeHarness()
    const { nodes: in_, edges: ie } = multiParentStore('pre')
    const envI = spliceEnvelope(h2, traversalEnv(in_, ie), 'contenteditable')
    for (const d of rootsFor(envI, 'dup')) {
      expect(hasTextarea(d.root, 'dup')).toBe(false)
      expect(contenteditableProp(d.root)).toBeUndefined()
    }
  })
})

describe('rich-splice — fail-state 7: a root that is BOTH a subtree root AND a doc-child (§2.2/ADR-3)', () => {
  it('both materializations get the SAME splice treatment (both splice when eligible)', () => {
    const nodes = [
      makeNode('doc', { type: 'h1', content: 'Doc' }),
      makeNode('sec-a', { type: 'p', content: 'A' }), // BOTH a section (doc-head source) AND a doc-child of sec-b
      makeNode('sec-b', { type: 'p', content: 'B' }),
      makeNode('end', { type: 'p', content: 'end' }),
    ]
    const edges = [
      makeEdge('e-hd', 'doc-head', 'sec-a', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-n1', 'next-section', 'sec-a', 'sec-b', { documentIds: ['doc'] }),
      makeEdge('e-n2', 'next-section', 'sec-b', 'end', { documentIds: ['doc'] }),
      makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-c', 'doc-child', 'sec-b', 'sec-a', { order: 0 }),
    ]
    const h = makeHarness()
    const env = spliceEnvelope(h, traversalEnv(nodes, edges), 'contenteditable')
    // sec-a is materialized TWICE: once as its own section content[0], once
    // nested within sec-b (finding 8 — mutual exclusion).
    const secA = rootsFor(env, 'sec-a')
    expect(secA.length).toBe(2)
    for (const r of secA) {
      expect(hasTextarea(r.root, 'sec-a')).toBe(false)
      expect(contenteditableProp(r.root)).toBe(true)
    }
    // sec-b OWNS sec-a as a doc-child → NOT eligible → textarea removed (no contenteditable).
    const [secB] = rootsFor(env, 'sec-b')
    expect(hasTextarea(secB.root, 'sec-b')).toBe(false)
    expect(contenteditableProp(secB.root)).toBeUndefined()
  })
})

// ===========================================================================
// §1.4 TYPE-LEVEL — the snapshot `children` field + the `EditingMode` type
// (these fail at `npm run typecheck`, the trio's type leg; vitest erases the
// type-only references at runtime).
// ===========================================================================
describe('rich-splice — type-level: snapshot children + EditingMode (§1.4)', () => {
  it('typecheck: RagSnapshotPayload.nodes[].children? is present (a node WITH children and a node WITHOUT both type-check)', () => {
    const withChildren: RagSnapshotPayload = {
      nodes: [
        {
          id: 'n1', type: 'p', content: 'x',
          children: [{ type: 'strong', content: 'bold' }, { type: 'a', content: 'link', props: { href: '/x' } }],
          ownedNodeIds: [], createdAt: '', updatedAt: '',
        },
      ],
      edges: [],
    }
    const withoutChildren: RagSnapshotPayload = {
      nodes: [{ id: 'n1', type: 'p', content: 'x', ownedNodeIds: [], createdAt: '', updatedAt: '' }],
      edges: [],
    }
    // The child element shape mirrors the store's RagNodeChild (type/content/props?).
    const child = withChildren.nodes[0].children?.[0]
    expect(child).toBeDefined()
    expect(typeof child!.type).toBe('string')
    expect(typeof child!.content).toBe('string')
    expect(withoutChildren.nodes[0].children).toBeUndefined()
  })

  it('typecheck: the EditingMode union is "textarea" | "contenteditable" (the splice signature is typed)', () => {
    const textareaMode: EditingMode = 'textarea'
    const contenteditableMode: EditingMode = 'contenteditable'
    expect(textareaMode).toBe('textarea')
    expect(contenteditableMode).toBe('contenteditable')
  })
})

describe('rich-splice — adversarial F3: a malformed payload (empty/absent content) does NOT throw in contenteditable mode', () => {
  it('a payload with an empty content array is tolerated (walk guards the missing root)', () => {
    const h = makeHarness()
    // An envelope whose payload content is an empty array (no root node).
    const env = spliceEnvelope(h, { ...traversalEnv([], []), content: [{ payload: 'wiki-root', content: [] }] }, 'contenteditable')
    // No throw; the envelope is unchanged (nothing to splice).
    expect(env).toBeDefined()
  })
})
