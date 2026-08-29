// tests/sidebar-panes.test.ts — Unit H: the sidebar panes
// (docs/specs/unit-h-sidebar-panes.md §5.8 happy paths + §5.9 fail-states +
// §5.10 census). This is the TestWriter RED set — the target modules do NOT
// exist yet:
//
//   - `src/renderer/pane-registry.js` (RED — module not found): the pure
//     `PaneRegistry` (`createPaneRegistry` + the `PaneDefinition` shape).
//   - `src/renderer/pane-graph.js` (RED — module not found): the pure assembly
//     (`SIDEBAR_ZONE`, `paneSubtreeRoot`, `assembleAppGraphEnvelope`,
//     `buildOperatorEnvelope`) + the pinned §5.3 data-flow helpers
//     (`deriveDocNavDocuments`, `docNavContent`, `crosslinksContent`,
//     `searchContent`).
//
// Imports that EXIST (used for fixtures/envelopes, so the pure red set isolates
// exactly the Unit H modules):
//   - `src/main/traversal.js` (`buildTraversal` — real traversal envelopes).
//   - `src/main/backlinks.js` (`BacklinkResult` — the crosslinks enumeration).
//   - `src/main/rag-store.js` (`RagNode`/`RagEdge` — snapshot fixtures).
//
// The Electron/renderer-dependent parts (§5.8 items 22-25, §5.9 items 15-16,
// §5.9 item 18 handler) are documented in a `.skip` block at the bottom — the
// isolated GraphScope render, the MCP-visible Runtime load, and the DOM
// dispatch are NOT node-testable; they are verified by code review. The pure
// registry + assembly + data-flow + scope classification ARE node-tested here.
//
// These tests are RED because the Unit H modules do not exist yet. The
// Implementer makes this file green with NO changes to these tests.
import { describe, it, expect } from 'vitest'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'
import { buildTraversal, type CrosslinkWiring } from '../src/main/traversal.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import type { BacklinkResult, LinkEntry } from '../src/main/backlinks.js'
import type { RagQueryResult } from '../src/shared/types.js'

// ---- Unit H modules (RED — module not found) -------------------------------
import {
  createPaneRegistry,
  type PaneRegistry,
  type PaneDefinition,
  type PaneContext,
  type PaneScope,
  type PaneChange,
} from '../src/renderer/pane-registry.js'
import {
  SIDEBAR_ZONE,
  paneSubtreeRoot,
  assembleAppGraphEnvelope,
  buildOperatorEnvelope,
  deriveDocNavDocuments,
  docNavContent,
  crosslinksContent,
  searchContent,
  type AppGraphAssemblyInput,
  type AppGraphAssemblyResult,
} from '../src/renderer/pane-graph.js'

// ---- fixtures --------------------------------------------------------------

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
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

function makeEdge(
  id: string,
  kind: RagEdge['kind'],
  source: string,
  target: string,
  overrides: Partial<RagEdge> = {},
): RagEdge {
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

function makeContext(overrides: Partial<PaneContext> = {}): PaneContext {
  return {
    snapshot: { nodes: [], edges: [] },
    docHeads: [],
    currentDocumentId: null,
    currentNodeId: null,
    backRefs: new Map<string, string[]>(),
    crosslinks: [],
    ...overrides,
  }
}

function def(
  id: string,
  scope: PaneScope,
  render: PaneDefinition['render'],
  overrides: Partial<PaneDefinition> = {},
): PaneDefinition {
  return { id, title: `Title ${id}`, scope, render, ...overrides }
}

const noop = (): void => {}

/** A render that returns a valid provident subtree (a happy-path pane whose
 *  content is materializable — `paneSubtreeRoot` throws when a render returns
 *  nothing). Used by the assembly happy-path tests, where `noop` would
 *  correctly trip the §5.9-fail-10 "render returned nothing" guard. */
const validRender = (): { type: string; content: Array<{ type: string; content: string }> } => ({
  type: 'div',
  content: [{ type: 'text', content: 'pane-content' }],
})

// Build a real traversal envelope (Unit C buildTraversal — EXISTS) over a
// minimal one-document RAG store. `zoneName` controls whether the traversal
// envelope already carries a `sidebar` container producer (the HARD
// PRECONDITION) or only a different zone.
function traversalEnvelope(zoneName: string): { envelope: ReturnType<typeof buildTraversal>['envelope']; _storeNodes: RagNode[]; _storeEdges: RagEdge[] } {
  const nodes = [makeNode('head-a', { content: 'Doc A' })]
  const edges = [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a', { documentIds: ['doc-a'] })]
  // The scoped walk reads the adjacency methods, so the snapshot adapter MUST be
  // `createSnapshotStore` (amendment 4) — a listNodes/listEdges-only adapter
  // would throw.
  const store = createSnapshotStore(nodes, edges)
  const result = buildTraversal({ store, documentIds: ['doc-a'], zoneName })
  return { envelope: result.envelope, _storeNodes: nodes, _storeEdges: edges }
}

// A traversal envelope that ALREADY carries a `sidebar` container producer.
function traversalEnvelopeWithSidebar(): ReturnType<typeof buildTraversal>['envelope'] {
  return traversalEnvelope(SIDEBAR_ZONE).envelope
}

// A traversal envelope WITHOUT a `sidebar` producer (only a `main` zone).
function traversalEnvelopeWithoutSidebar(): ReturnType<typeof buildTraversal>['envelope'] {
  return traversalEnvelope('main').envelope
}

/** Find the `sidebar` container producer in the envelope template root's
 *  children (the HARD PRECONDITION — a `container`-role producer for the zone
 *  the app-graph panes target). */
function findSidebarProducer(envelope: { template: { root: { children?: Array<{ placement?: { placementName?: string }; props?: { id?: unknown } }> } } }): Array<{ placement?: { placementName?: string }; props?: { id?: unknown } }> {
  return (envelope.template.root.children ?? []).filter(
    (c) => c.placement?.placementName === SIDEBAR_ZONE,
  )
}

function panePayloadsOf(envelope: ReturnType<typeof buildTraversal>['envelope']): number {
  return envelope.content?.length ?? 0
}

// ===========================================================================
// The PaneRegistry — §5.8 happy paths 1-7 + the fail-states §5.9 1-8.
// ===========================================================================
describe('PaneRegistry — register/get/list (§5.8 1-2)', () => {
  it('registers a unique id DISABLED; get returns it; list has 1 entry', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    expect(reg.get('doc-nav')).toBeDefined()
    expect(reg.get('doc-nav')!.id).toBe('doc-nav')
    expect(reg.get('doc-nav')!.title).toBe('Title doc-nav')
    expect(reg.list()).toHaveLength(1)
    expect(reg.isEnabled('doc-nav')).toBe(false) // newly registered panes are DISABLED
  })

  it('listByScope returns only the panes of the given scope, in registration order', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    reg.register(def('settings', 'operator', noop))
    reg.register(def('crosslinks', 'app-graph', noop))
    expect(reg.listByScope('app-graph').map((p) => p.id)).toEqual(['doc-nav', 'crosslinks'])
    expect(reg.listByScope('operator').map((p) => p.id)).toEqual(['settings'])
  })
})

describe('PaneRegistry — enable/disable/setEnabled (§5.8 3-5, no-op rules)', () => {
  it('enable sets isEnabled true and notifies onChanged with {id, enabled:true}', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    const changes: PaneChange[] = []
    reg.onChanged((c) => changes.push(c))
    reg.enable('doc-nav')
    expect(reg.isEnabled('doc-nav')).toBe(true)
    expect(changes).toEqual([{ id: 'doc-nav', enabled: true }])
  })

  it('disable sets isEnabled false and notifies', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    reg.enable('doc-nav')
    const changes: PaneChange[] = []
    reg.onChanged((c) => changes.push(c))
    reg.disable('doc-nav')
    expect(reg.isEnabled('doc-nav')).toBe(false)
    expect(changes).toEqual([{ id: 'doc-nav', enabled: false }])
  })

  it('setEnabled to the current state is a no-op (no notification)', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    reg.enable('doc-nav')
    const changes: PaneChange[] = []
    reg.onChanged((c) => changes.push(c))
    reg.setEnabled('doc-nav', true) // already enabled → no-op
    expect(changes).toEqual([])
  })

  it('enable on an already-enabled pane is a no-op (no notification)', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    reg.enable('doc-nav')
    const changes: PaneChange[] = []
    reg.onChanged((c) => changes.push(c))
    reg.enable('doc-nav')
    expect(changes).toEqual([])
  })

  it('disable on an already-disabled pane is a no-op (no notification)', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    const changes: PaneChange[] = []
    reg.onChanged((c) => changes.push(c))
    reg.disable('doc-nav')
    expect(changes).toEqual([])
  })

  it('setEnabled false disables and notifies', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    reg.enable('doc-nav')
    const changes: PaneChange[] = []
    reg.onChanged((c) => changes.push(c))
    reg.setEnabled('doc-nav', false)
    expect(reg.isEnabled('doc-nav')).toBe(false)
    expect(changes).toEqual([{ id: 'doc-nav', enabled: false }])
  })
})

describe('PaneRegistry — onChanged + isEnabled defaults (§5.8 6-7)', () => {
  it('onChanged returns an unsubscribe function; unsubscribing stops notifications', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    const changes: PaneChange[] = []
    const unsubscribe = reg.onChanged((c) => changes.push(c))
    reg.enable('doc-nav')
    expect(changes).toHaveLength(1)
    unsubscribe()
    reg.disable('doc-nav')
    expect(changes).toHaveLength(1) // no further notification after unsubscribe
  })

  it('isEnabled returns false for an unknown id (a safe default)', () => {
    const reg = createPaneRegistry()
    expect(reg.isEnabled('nope')).toBe(false)
  })

  it('get returns undefined for an unknown id', () => {
    const reg = createPaneRegistry()
    expect(reg.get('nope')).toBeUndefined()
  })
})

describe('PaneRegistry — fail-states (§5.9 1-8)', () => {
  it('register with a duplicate id throws Error("pane registry: duplicate id \\"X\\"")', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    expect(() => reg.register(def('doc-nav', 'app-graph', noop))).toThrow(
      'pane registry: duplicate id "doc-nav"',
    )
  })

  it('register with a null/undefined def throws "definition required"', () => {
    const reg = createPaneRegistry()
    expect(() => reg.register(null as never)).toThrow('pane registry: definition required')
    expect(() => reg.register(undefined as never)).toThrow('pane registry: definition required')
  })

  it('register with an empty/non-string id throws "id must be a non-empty string"', () => {
    const reg = createPaneRegistry()
    expect(() => reg.register(def('', 'app-graph', noop))).toThrow(
      'pane registry: id must be a non-empty string',
    )
    expect(() => reg.register(def(42 as never, 'app-graph', noop))).toThrow(
      'pane registry: id must be a non-empty string',
    )
  })

  it('register with a non-string/empty title throws "title must be a non-empty string"', () => {
    const reg = createPaneRegistry()
    expect(() => reg.register({ ...def('x', 'app-graph', noop), title: '' })).toThrow(
      'pane registry: title must be a non-empty string',
    )
    expect(() => reg.register({ ...def('x', 'app-graph', noop), title: 7 as never })).toThrow(
      'pane registry: title must be a non-empty string',
    )
  })

  it('register with an invalid scope throws Error(\'pane registry: invalid scope "X"\')', () => {
    const reg = createPaneRegistry()
    expect(() => reg.register({ ...def('x', 'app-graph', noop), scope: 'bogus' as PaneScope })).toThrow(
      'pane registry: invalid scope "bogus"',
    )
  })

  it('register with a non-function render throws "render must be a function"', () => {
    const reg = createPaneRegistry()
    expect(() => reg.register({ ...def('x', 'app-graph', noop), render: 'nope' as never })).toThrow(
      'pane registry: render must be a function',
    )
  })

  it('enable/disable/setEnabled on an unknown id throws Error(\'pane registry: unknown pane "X"\')', () => {
    const reg = createPaneRegistry()
    expect(() => reg.enable('nope')).toThrow('pane registry: unknown pane "nope"')
    expect(() => reg.disable('nope')).toThrow('pane registry: unknown pane "nope"')
    expect(() => reg.setEnabled('nope', true)).toThrow('pane registry: unknown pane "nope"')
  })

  it('onChanged with a non-function cb throws "onChanged requires a callback"', () => {
    const reg = createPaneRegistry()
    expect(() => reg.onChanged('nope' as never)).toThrow(
      'pane registry: onChanged requires a callback',
    )
  })
})

// ===========================================================================
// paneSubtreeRoot — §5.8 8-9 happy + §5.9 9-10 fail-states.
// ===========================================================================
describe('paneSubtreeRoot (§5.8 8-9)', () => {
  it('wraps a pane render output with id "pane-<id>" + targetPlacement [sidebar], preserving type/content/children', () => {
    const render = (): ReturnType<PaneDefinition['render']> => ({
      type: 'ul',
      content: 'hello',
      children: [{ type: 'li', props: { id: 'li-1' } }],
    })
    const wrapped = paneSubtreeRoot(def('doc-nav', 'app-graph', render), makeContext(), SIDEBAR_ZONE)
    expect(wrapped.props?.id).toBe('pane-doc-nav')
    expect(wrapped.placement).toEqual({ targetPlacement: [SIDEBAR_ZONE] })
    expect(wrapped.type).toBe('ul')
    expect(wrapped.content).toBe('hello')
    expect(wrapped.children).toHaveLength(1)
  })

  it('overwrites a render-set id and targetPlacement with pane-<id> and [sidebarZone]', () => {
    const render = (): ReturnType<PaneDefinition['render']> => ({
      type: 'div',
      props: { id: 'my-own-id' },
      placement: { targetPlacement: ['elsewhere'] },
    })
    const wrapped = paneSubtreeRoot(def('doc-nav', 'app-graph', render), makeContext(), SIDEBAR_ZONE)
    expect(wrapped.props?.id).toBe('pane-doc-nav') // FORCED
    expect(wrapped.placement).toEqual({ targetPlacement: [SIDEBAR_ZONE] }) // FORCED
  })

  it('uses the given sidebarZone (not just the default)', () => {
    const render = (): ReturnType<PaneDefinition['render']> => ({ type: 'div' })
    const wrapped = paneSubtreeRoot(def('search', 'app-graph', render), makeContext(), 'rail')
    expect(wrapped.placement).toEqual({ targetPlacement: ['rail'] })
  })
})

describe('paneSubtreeRoot — fail-states (§5.9 9-10)', () => {
  it('throws "paneSubtreeRoot: def/ctx/sidebarZone required" on null/undefined def/ctx or empty sidebarZone', () => {
    const p = def('x', 'app-graph', noop)
    expect(() => paneSubtreeRoot(null as never, makeContext(), SIDEBAR_ZONE)).toThrow(
      'paneSubtreeRoot: def/ctx/sidebarZone required',
    )
    expect(() => paneSubtreeRoot(p, null as never, SIDEBAR_ZONE)).toThrow(
      'paneSubtreeRoot: def/ctx/sidebarZone required',
    )
    expect(() => paneSubtreeRoot(p, makeContext(), '')).toThrow(
      'paneSubtreeRoot: def/ctx/sidebarZone required',
    )
  })

  it('throws Error(\'paneSubtreeRoot: pane "<id>" render returned nothing\') when render returns null', () => {
    const render = (): never => null as never
    expect(() => paneSubtreeRoot(def('doc-nav', 'app-graph', render), makeContext(), SIDEBAR_ZONE)).toThrow(
      'paneSubtreeRoot: pane "doc-nav" render returned nothing',
    )
  })
})

// ===========================================================================
// assembleAppGraphEnvelope — §5.8 10-14 happy + §5.9 11-12 fail-states.
// ===========================================================================
describe('assembleAppGraphEnvelope (§5.8 10-14)', () => {
  it('merges traversal content payloads + one pane ContentPayload, adds a sidebar producer, paneIds:[id]', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', validRender))
    reg.enable('doc-nav')
    const envelope = traversalEnvelopeWithoutSidebar()
    const traversalCount = panePayloadsOf(envelope)
    const result = assembleAppGraphEnvelope({
      traversalEnvelope: envelope,
      registry: reg,
      ctx: makeContext(),
    })
    expect(result.paneIds).toEqual(['doc-nav'])
    expect(panePayloadsOf(result.envelope)).toBe(traversalCount + 1)
    // The pane payload is appended after the traversal content.
    const panePayload = result.envelope.content?.[result.envelope.content.length - 1]
    expect(panePayload?.content?.[0]?.props?.id).toBe('pane-doc-nav')
    // The HARD PRECONDITION: a sidebar container producer is emitted.
    expect(findSidebarProducer(result.envelope)).toHaveLength(1)
  })

  it('assembles two enabled app-graph panes, paneIds in registration order', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', validRender))
    reg.register(def('search', 'app-graph', validRender))
    reg.enable('doc-nav')
    reg.enable('search')
    const envelope = traversalEnvelopeWithoutSidebar()
    const result = assembleAppGraphEnvelope({
      traversalEnvelope: envelope,
      registry: reg,
      ctx: makeContext(),
    })
    expect(result.paneIds).toEqual(['doc-nav', 'search'])
    const ids = (result.envelope.content ?? [])
      .map((p) => p.content?.[0]?.props?.id as string | undefined)
      .filter((id): id is string => typeof id === 'string' && id.startsWith('pane-'))
    expect(ids).toEqual(['pane-doc-nav', 'pane-search'])
  })

  it('excludes a registered but DISABLED app-graph pane', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop)) // registered but never enabled
    const envelope = traversalEnvelopeWithoutSidebar()
    const result = assembleAppGraphEnvelope({
      traversalEnvelope: envelope,
      registry: reg,
      ctx: makeContext(),
    })
    expect(result.paneIds).toEqual([])
    expect(panePayloadsOf(result.envelope)).toBe(panePayloadsOf(envelope))
  })

  it('excludes an ENABLED operator pane from the app-graph envelope (never enters the app graph)', () => {
    const reg = createPaneRegistry()
    reg.register(def('settings', 'operator', noop))
    reg.enable('settings')
    const envelope = traversalEnvelopeWithoutSidebar()
    const result = assembleAppGraphEnvelope({
      traversalEnvelope: envelope,
      registry: reg,
      ctx: makeContext(),
    })
    expect(result.paneIds).toEqual([])
    const paneLike = (result.envelope.content ?? []).some(
      (p) => typeof p.content?.[0]?.props?.id === 'string' && String(p.content[0].props.id).startsWith('pane-'),
    )
    expect(paneLike).toBe(false) // settings never in the app graph
  })

  it('keeps an EXISTING sidebar container producer (not duplicated)', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', validRender))
    reg.enable('doc-nav')
    const envelope = traversalEnvelopeWithSidebar()
    const result = assembleAppGraphEnvelope({
      traversalEnvelope: envelope,
      registry: reg,
      ctx: makeContext(),
    })
    expect(findSidebarProducer(result.envelope)).toHaveLength(1) // exactly one, never duplicated
  })
})

describe('assembleAppGraphEnvelope — fail-states (§5.9 11-12)', () => {
  it('throws on null/undefined input/registry/ctx/traversalEnvelope', () => {
    const reg = createPaneRegistry()
    const envelope = traversalEnvelopeWithoutSidebar()
    const msg = 'assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required'
    expect(() => assembleAppGraphEnvelope(null as never)).toThrow(msg)
    expect(() => assembleAppGraphEnvelope({ registry: null as never, ctx: makeContext(), traversalEnvelope: envelope } as AppGraphAssemblyInput)).toThrow(msg)
    expect(() => assembleAppGraphEnvelope({ registry: reg, ctx: null as never, traversalEnvelope: envelope } as AppGraphAssemblyInput)).toThrow(msg)
    expect(() => assembleAppGraphEnvelope({ registry: reg, ctx: makeContext(), traversalEnvelope: null as never } as AppGraphAssemblyInput)).toThrow(msg)
  })

  it('propagates a pane whose paneSubtreeRoot throws (a caller error, never a silent skip)', () => {
    const reg = createPaneRegistry()
    const render = (): never => null as never // paneSubtreeRoot throws
    reg.register(def('doc-nav', 'app-graph', render))
    reg.enable('doc-nav')
    const envelope = traversalEnvelopeWithoutSidebar()
    expect(() =>
      assembleAppGraphEnvelope({ traversalEnvelope: envelope, registry: reg, ctx: makeContext() }),
    ).toThrow('paneSubtreeRoot: pane "doc-nav" render returned nothing')
  })
})

// ===========================================================================
// buildOperatorEnvelope — §5.8 15-16 happy + §5.9 13-14 fail-states.
// ===========================================================================
describe('buildOperatorEnvelope (§5.8 15-16)', () => {
  it('builds a template root id "operator-panes" with the pane section as a child, content:[], no targetPlacement', () => {
    const reg = createPaneRegistry()
    const render = (): ReturnType<PaneDefinition['render']> => ({
      type: 'section',
      props: { id: 'my-settings-id' }, // must be FORCED to operator-pane-settings
    })
    reg.register(def('settings', 'operator', render))
    reg.enable('settings')
    const envelope = buildOperatorEnvelope(reg, makeContext())
    expect(envelope.template.root.props?.id).toBe('operator-panes')
    expect(envelope.content ?? []).toEqual([])
    expect(envelope.template.root.placement).toBeUndefined() // NO targetPlacement
    const section = envelope.template.root.children?.[0] as { props?: { id?: unknown }; placement?: unknown }
    expect(section.props?.id).toBe('operator-pane-settings') // FORCED id
    expect(section.placement).toBeUndefined()
  })

  it('excludes a registered but DISABLED operator pane', () => {
    const reg = createPaneRegistry()
    reg.register(def('settings', 'operator', noop)) // never enabled
    const envelope = buildOperatorEnvelope(reg, makeContext())
    expect(envelope.template.root.children ?? []).toEqual([])
  })
})

describe('buildOperatorEnvelope — fail-states (§5.9 13-14)', () => {
  it('throws on null/undefined registry/ctx', () => {
    const reg = createPaneRegistry()
    const msg = 'buildOperatorEnvelope: registry/ctx required'
    expect(() => buildOperatorEnvelope(null as never, makeContext())).toThrow(msg)
    expect(() => buildOperatorEnvelope(reg, null as never)).toThrow(msg)
  })

  it('throws Error(\'buildOperatorEnvelope: operator pane "<id>" render returned nothing\') when render returns nothing', () => {
    const reg = createPaneRegistry()
    const render = (): never => null as never
    reg.register(def('settings', 'operator', render))
    reg.enable('settings')
    expect(() => buildOperatorEnvelope(reg, makeContext())).toThrow(
      'buildOperatorEnvelope: operator pane "settings" render returned nothing',
    )
  })
})

// ===========================================================================
// Data flow: doc-nav ← rag-doc-heads (§5.3, §5.8 17-18)
// ===========================================================================
describe('deriveDocNavDocuments — the doc-heads list (§5.3, §5.8 17)', () => {
  it('returns the docHeads list (already sorted + deduped by the IPC handler)', () => {
    const ctx = makeContext({
      docHeads: [
        { documentId: 'doc-a', title: 'Doc A' },
        { documentId: 'doc-b', title: 'Doc B' },
      ],
    })
    const docs = deriveDocNavDocuments(ctx.docHeads)
    expect(docs).toEqual([
      { documentId: 'doc-a', title: 'Doc A' },
      { documentId: 'doc-b', title: 'Doc B' },
    ]) // sorted by root id, lexicographic ascending, deterministic
  })

  it('returns an empty list for an empty docHeads list (no documents)', () => {
    const ctx = makeContext()
    expect(deriveDocNavDocuments(ctx.docHeads)).toEqual([])
  })
})

describe('docNavContent (§5.3, §5.8 17-18)', () => {
  it('renders one li per document with data-document-id; the current document li carries data-current=true', () => {
    const ctx = makeContext({
      docHeads: [
        { documentId: 'doc-a', title: 'Doc A' },
        { documentId: 'doc-b', title: 'Doc B' },
      ],
      currentDocumentId: 'doc-b',
    })
    const content = docNavContent(ctx)
    expect(content.type).toBe('ul')
    const lis = (content.children ?? []).filter((c) => c.type === 'li')
    expect(lis).toHaveLength(2)
    expect(lis[0].props?.['data-document-id']).toBe('doc-a')
    expect(lis[0].props?.['data-current']).toBeUndefined()
    expect(lis[1].props?.['data-document-id']).toBe('doc-b')
    expect(lis[1].props?.['data-current']).toBe('true')
  })

  it('renders "(no documents)" for an empty docHeads list (no throw)', () => {
    const content = docNavContent(makeContext())
    expect(content.type).toBe('p')
    expect(content.content).toBe('(no documents)')
  })
})

// ===========================================================================
// Data flow: crosslinks ← Unit G wiring + rag-backlinks (§5.3, §5.8 19-20)
// ===========================================================================
function linkEntry(edgeId: string, source: string, target: string, scope: LinkEntry['scope']): LinkEntry {
  return {
    edge: makeEdge(edgeId, 'crosslink', source, target),
    kind: 'crosslink',
    source,
    target,
    scope,
  }
}

describe('crosslinksContent (§5.3, §5.8 19-20)', () => {
  it('renders the outgoing-crosslinks list + the backlink/outlink list with data-scope props', () => {
    const crosslinks: CrosslinkWiring[] = [
      { edgeId: 'cl1', sourceRagNodeId: 'n1', targetRagNodeId: 'n9' },
    ]
    const backlinkResult: BacklinkResult = {
      nodeId: 'n1',
      backlinks: [],
      outlinks: [],
      crosslinkBacklinks: [linkEntry('b1', 'n2', 'n1', 'cross-document')],
      crosslinkOutlinks: [linkEntry('o1', 'n1', 'n3', 'intra-document')],
    }
    const ctx = makeContext({ currentNodeId: 'n1', crosslinks })
    const content = crosslinksContent(ctx, backlinkResult)
    // The root carries two `section`s (Outgoing crosslinks + Backlinks / outlinks).
    const sections = (content.children ?? []).filter((c) => c.type === 'section')
    expect(sections).toHaveLength(2)
    // Outgoing crosslinks section: one li per ctx.crosslinks with data-target.
    const outgoingLis = (sections[0].children ?? []).filter((c) => c.type === 'li')
    expect(outgoingLis).toHaveLength(1)
    expect(outgoingLis[0].props?.['data-target']).toBe('n9')
    // Backlinks / outlinks section: one li per crosslinkBacklinks + per
    // crosslinkOutlinks, carrying data-source/data-target/data-scope.
    const backLis = (sections[1].children ?? []).filter((c) => c.type === 'li')
    expect(backLis).toHaveLength(2)
    expect(backLis[0].props?.['data-source']).toBe('n2')
    expect(backLis[0].props?.['data-target']).toBe('n1')
    expect(backLis[0].props?.['data-scope']).toBe('cross-document')
    expect(backLis[1].props?.['data-source']).toBe('n1')
    expect(backLis[1].props?.['data-target']).toBe('n3')
    expect(backLis[1].props?.['data-scope']).toBe('intra-document')
  })

  it('with a null currentNodeId shows the outgoing crosslinks only (the enumeration is skipped, no throw)', () => {
    const ctx = makeContext({
      currentNodeId: null,
      crosslinks: [{ edgeId: 'cl1', sourceRagNodeId: 'n1', targetRagNodeId: 'n9' }],
    })
    const content = crosslinksContent(ctx, null)
    const sections = (content.children ?? []).filter((c) => c.type === 'section')
    expect(sections).toHaveLength(2)
    expect((sections[0].children ?? []).filter((c) => c.type === 'li')).toHaveLength(1)
    // No current node → no enumeration → the backlink list is empty.
    const backLis = (sections[1].children ?? []).filter((c) => c.type === 'li')
    expect(backLis).toHaveLength(0)
  })

  it('surfaces a null backlink enumeration as an empty list, never a crash (§5.9 17)', () => {
    const ctx = makeContext({
      currentNodeId: 'n1',
      crosslinks: [],
    })
    const content = crosslinksContent(ctx, null)
    const sections = (content.children ?? []).filter((c) => c.type === 'section')
    const backLis = (sections[1].children ?? []).filter((c) => c.type === 'li')
    expect(backLis).toHaveLength(0) // empty enumeration, no throw
  })
})

// ===========================================================================
// Data flow: search ← rag-query (§5.3, §5.8 21)
// ===========================================================================
describe('searchContent (§5.3, §5.8 21)', () => {
  it('renders the pane-search-input + ranked results as li with data-node-id + score', () => {
    const result: RagQueryResult = {
      query: 'foo',
      ranked: [
        { nodeId: 'n1', score: 0.9 },
        { nodeId: 'n2', score: 0.5 },
      ],
      context: [],
      markdown: '',
      lineMap: { ranges: [] },
      k: 5,
    }
    const content = searchContent(makeContext(), result)
    const input = content.children?.find((c) => (c.props?.id as string | undefined) === 'pane-search-input')
    expect(input).toBeDefined()
    const lis = (content.children ?? []).filter((c) => c.type === 'li')
    expect(lis).toHaveLength(2)
    expect(lis[0].props?.['data-node-id']).toBe('n1')
    expect(lis[1].props?.['data-node-id']).toBe('n2')
    // Each li carries the score.
    expect(typeof lis[0].content).toBe('string')
    expect(String(lis[0].content)).toContain('0.9')
  })

  it('renders the input + an empty results list when there is no result yet (no throw)', () => {
    const content = searchContent(makeContext(), null)
    const input = content.children?.find((c) => (c.props?.id as string | undefined) === 'pane-search-input')
    expect(input).toBeDefined()
    expect((content.children ?? []).filter((c) => c.type === 'li')).toHaveLength(0)
  })
})

// ===========================================================================
// Scope classification + census (§5.10) + the settings negative.
// ===========================================================================
describe('scope classification + census (§5.10)', () => {
  it('the concrete panes are 4: doc-nav/crosslinks/search (app-graph) + settings (operator)', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    reg.register(def('crosslinks', 'app-graph', noop))
    reg.register(def('search', 'app-graph', noop))
    reg.register(def('settings', 'operator', noop))
    expect(reg.list()).toHaveLength(4)
    expect(reg.listByScope('app-graph')).toHaveLength(3)
    expect(reg.listByScope('operator')).toHaveLength(1)
    expect(SIDEBAR_ZONE).toBe('sidebar')
  })

  it('SIDEBAR_ZONE constant is "sidebar"', () => {
    expect(SIDEBAR_ZONE).toBe('sidebar')
  })

  it('an ENABLED settings (operator) pane is NOT in the app-graph envelope (negative)', () => {
    const reg = createPaneRegistry()
    reg.register(def('settings', 'operator', noop))
    reg.enable('settings')
    const envelope = traversalEnvelopeWithoutSidebar()
    const result = assembleAppGraphEnvelope({
      traversalEnvelope: envelope,
      registry: reg,
      ctx: makeContext(),
    })
    expect(result.paneIds).toEqual([]) // settings never enters the app graph
    const envelopeText = JSON.stringify(result.envelope)
    expect(envelopeText).not.toContain('operator-pane-settings')
    expect(envelopeText).not.toContain('settings')
  })

  it('the three app-graph panes are read-only (no edit/textarea/commit controls in their content)', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', (ctx) => docNavContent(ctx as PaneContext)))
    reg.register(def('crosslinks', 'app-graph', (ctx) => crosslinksContent(ctx as PaneContext, null)))
    reg.register(def('search', 'app-graph', (ctx) => searchContent(ctx as PaneContext, null)))
    reg.enable('doc-nav')
    reg.enable('crosslinks')
    reg.enable('search')
    const envelope = traversalEnvelopeWithoutSidebar()
    const result = assembleAppGraphEnvelope({
      traversalEnvelope: envelope,
      registry: reg,
      ctx: makeContext(),
    })
    // The three app-graph panes are read-only — their content carries no
    // edit/textarea/commit controls. (The RAG content subtrees DO carry the
    // textarea editing overlay — Unit L §5.1 — so the read-only check is scoped
    // to the pane payloads, identified by their `pane-` authored ids.)
    const paneText = (result.envelope.content ?? [])
      .filter((p) => (p.content?.[0]?.props?.id as string | undefined)?.startsWith('pane-'))
      .map((p) => JSON.stringify(p))
      .join('')
    // No editable RAG control — none of the three panes binds an edit/textarea.
    expect(paneText).not.toContain('textarea')
    expect(paneText).not.toContain('edit-commit')
    expect(paneText).not.toContain('onInput')
    expect(paneText).not.toContain('onBlur')
  })
})

// ===========================================================================
// Renderer-dependent (§5.8 22-25, §5.9 15-16/18) — documented, NOT runnable in
// node. These are the isolated GraphScope render (mirroring SecurePanels), the
// MCP-visible app-Runtime load, and the DOM dispatch path. They are verified by
// code review / the e2e battery; the pure registry + assembly + data-flow +
// scope classification above is the node-testable contract.
// ===========================================================================
describe.skip('renderer-dependent (verified by code review — not node-testable)', () => {
  it.skip('§5.8 22 — after loadAppGraph, the pane-inclusive envelope is in the app Runtime → get_rendered_html/markdown/list_targets/dispatch see the panes', () => {})
  it.skip('§5.8 23 — after mountOperator, the settings pane renders in its isolated GraphScope → list_targets/rendered/markdown never include it; dispatch throws unresolved target', () => {})
  it.skip('§5.8 24 — after a rag-store-changed re-traversal (re-loading the pane-inclusive envelope), the app-graph panes stay MCP-visible with re-materialized data-* payloads', () => {})
  it.skip('§5.8 25 — the settings pane edits commit via the IPC bridge (operator-owned), never the RAG edit.* path', () => {})
  it.skip('§5.9 15 — dispatch on a settings pane node throws unresolved target (fail-closed)', () => {})
  it.skip('§5.9 16 — get_node_state on a settings pane node throws unresolved target (fail-closed)', () => {})
  it.skip('§5.9 18 — the search pane submit handler does NOT send the rag-query IPC for an empty query', () => {})
})
