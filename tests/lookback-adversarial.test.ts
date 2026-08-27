// tests/lookback-adversarial.test.ts — regression tests for the L3 adversarial
// finding: the `rag`/`edit` tool groups were unreachable because
// `security-store.ts` VALID_GROUPS and `secure-panels.ts` GROUPS omitted them
// (diverging from `security.ts` and the shared types), and `main.ts`
// `mcp.applyGatePatch` consumed the RAW patch so the live gate could enable a
// group the persisted config dropped (live/persisted divergence on restart).
//
// Fix (L3):
//   (a) security-store.ts VALID_GROUPS now includes `rag`/`edit`.
//   (b) secure-panels.ts GROUPS now includes `rag`/`edit` (the pane renders
//       toggles for them).
//   (c) main.ts derives the live-gate patch from the STORE's FILTERED result
//       via `gatePatchFromStoreResult` (not the raw patch), so the live gate
//       and the persisted config stay in sync.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createSecurityStore, gatePatchFromStoreResult } from '../src/main/security-store.js'
import { SecurityGate } from '../src/main/security.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { SecurePanels } from '../src/renderer/secure-panels.js'
import { handleRagTool } from '../src/main/mcp-server.js'
import { createJsonRagStore, type RagStore, type RagNode, type RagEdge } from '../src/main/rag-store.js'
import { buildTraversal, type TraversalResult } from '../src/main/traversal.js'
import type { ContentWindowTemplate } from '../src/main/template-shape.js'
import { Runtime } from '../src/renderer/runtime.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-l3-'))
}

beforeAll(() => {
  installShim()
})

describe('L3 — security-store accepts the rag/edit groups (a)', () => {
  it('set({ groups: [rag, edit] }) persists both groups write-through', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'sec.json')
      const store = createSecurityStore({ path: file })
      const after = store.set({ groups: ['rag', 'edit'] })
      expect(after.enabled).toContain('rag')
      expect(after.enabled).toContain('edit')
      // reload/restart restores them (the persisted config keeps the groups)
      const reloaded = createSecurityStore({ path: file })
      expect(reloaded.get().enabled).toContain('rag')
      expect(reloaded.get().enabled).toContain('edit')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('a pre-existing file with rag/edit enabled is loaded on construction', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'sec.json')
      writeFileSync(file, JSON.stringify({ token: null, enabled: ['read', 'rag', 'edit'] }))
      const store = createSecurityStore({ path: file })
      expect(store.get().enabled).toContain('rag')
      expect(store.get().enabled).toContain('edit')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('L3 — secure-panels GROUPS includes the rag/edit groups (b)', () => {
  it('the settings pane renders a toggle for the rag group', async () => {
    const mount = mountEl() as never
    const panels = new SecurePanels(mount)
    await panels.refresh()
    const html = (mount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('toggle:rag')
    expect(html).toContain('rag.query')
    expect(html).toContain('get_document')
  })

  it('the settings pane renders a toggle for the edit group', async () => {
    const mount = mountEl() as never
    const panels = new SecurePanels(mount)
    await panels.refresh()
    const html = (mount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('toggle:edit')
    expect(html).toContain('edit.set_content')
    expect(html).toContain('create_node')
  })
})

describe('L3 — the applyGatePatch path uses the store\'s filtered result (c)', () => {
  it('a group the store drops is never enabled live (no live/persisted divergence)', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'sec.json')
      const store = createSecurityStore({ path: file })
      const gate = new SecurityGate({ token: null, enabled: ['read', 'dispatch'] })
      let currentEnabled = store.get().enabled

      // The manual-UI settings pane sends a patch that includes a VALID group
      // (`rag`) and an INVALID group (`bogus`). The store filters the invalid
      // one out of the persisted config.
      const updated = store.set({ groups: ['rag', 'bogus'] })
      expect(updated.enabled).toContain('rag')
      expect(updated.enabled).not.toContain('bogus')

      // main.ts derives the live-gate patch from the STORE's filtered result.
      const gatePatch = gatePatchFromStoreResult(currentEnabled, updated)
      const live = gate.apply(gatePatch)

      // The live gate matches the persisted config exactly: `rag` enabled,
      // `bogus` NOT enabled (the store dropped it).
      expect(live.enabled.has('rag')).toBe(true)
      expect(live.enabled.has('bogus')).toBe(false)
      expect([...live.enabled].sort()).toEqual([...store.get().enabled].sort())
      currentEnabled = updated.enabled
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('a disable of a group the store drops leaves the live gate unchanged (still in sync)', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'sec.json')
      const store = createSecurityStore({ path: file })
      const gate = new SecurityGate({ token: null, enabled: ['read', 'dispatch', 'rag'] })
      let currentEnabled = store.get().enabled

      // Enable rag first (persisted), then try to disable a bogus group.
      store.set({ groups: ['rag'] })
      currentEnabled = store.get().enabled
      const updated = store.set({ disable: ['bogus'] })
      // The store drops the invalid disable; the persisted config is unchanged.
      expect(updated.enabled).toContain('rag')

      const gatePatch = gatePatchFromStoreResult(currentEnabled, updated)
      const live = gate.apply(gatePatch)
      // No spurious change: the live gate still matches the persisted config.
      expect([...live.enabled].sort()).toEqual([...store.get().enabled].sort())
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// L4 — rag.get_document returns ONLY the requested document's subtree
// (the tool description's "The document's RAG nodes/edges (the subtree)").
// The placeholder returned the ENTIRE store; the fix scopes the result to the
// requested document's nodes/edges (the doc root + the nodes reachable from
// the doc-head root via the doc-flow edges, scoped by documentIds, + their
// doc-children transitively).
// ===========================================================================
describe('L4 — rag.get_document returns ONLY the requested document\'s subtree', () => {
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

  async function seedStore(store: RagStore, nodes: RagNode[], edges: RagEdge[]): Promise<void> {
    for (const n of nodes) await store.putNode(n)
    for (const e of edges) await store.putEdge(e)
  }

  it('a store with two documents returns only the requested one\'s nodes/edges', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // Document A: docA root, head a1 → a2 → end. Document B: docB root,
      // head b1 → b2 → end. Both live in the SAME store.
      await seedStore(store, [
        makeNode('docA', { type: 'div' }),
        makeNode('a1', { content: 'A head' }),
        makeNode('a2', { content: 'A end' }),
        makeNode('docB', { type: 'div' }),
        makeNode('b1', { content: 'B head' }),
        makeNode('b2', { content: 'B end' }),
      ], [
        makeEdge('eA-head', 'doc-head', 'a1', 'docA', { documentIds: ['docA'] }),
        makeEdge('eA-next', 'next-section', 'a1', 'a2', { documentIds: ['docA'] }),
        makeEdge('eA-end', 'doc-end', 'a2', 'docA', { documentIds: ['docA'] }),
        makeEdge('eB-head', 'doc-head', 'b1', 'docB', { documentIds: ['docB'] }),
        makeEdge('eB-next', 'next-section', 'b1', 'b2', { documentIds: ['docB'] }),
        makeEdge('eB-end', 'doc-end', 'b2', 'docB', { documentIds: ['docB'] }),
      ])

      const result = await handleRagTool(store, 'rag.get_document', { documentId: 'docA' })
      const nodeIds = (result as { nodes: RagNode[] }).nodes.map((n) => n.id)
      const edgeIds = (result as { edges: RagEdge[] }).edges.map((e) => e.id)

      // ONLY docA's nodes/edges — never docB's.
      expect(nodeIds.sort()).toEqual(['a1', 'a2', 'docA'])
      expect(edgeIds.sort()).toEqual(['eA-end', 'eA-head', 'eA-next'])
      expect(nodeIds).not.toContain('docB')
      expect(nodeIds).not.toContain('b1')
      expect(nodeIds).not.toContain('b2')
      expect(edgeIds).not.toContain('eB-head')
      expect(edgeIds).not.toContain('eB-next')
      expect(edgeIds).not.toContain('eB-end')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('a document with no doc-head edge returns an empty subtree (not the whole store)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('n1', { content: 'hello' }),
        makeNode('n2', { content: 'world' }),
      ], [
        makeEdge('e1', 'parent-child', 'n1', 'n2'),
      ])
      const result = await handleRagTool(store, 'rag.get_document', { documentId: 'doc' })
      expect(result).toEqual({ documentId: 'doc', nodes: [], edges: [] })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// L5 — the traversal lineMap ranges are computed from the SINGLE full-envelope
// markdown, not from a sum of standalone subtree renders. The old
// `assignSubtreeRanges` rendered each subtree standalone (each re-including the
// template-root lines) and summed them, so a multi-payload envelope over-counted
// the template-root lines (rendered only once in the real envelope). The fix
// anchors the cursor AFTER the template root's lines and subtracts the template
// root's line count from every standalone render, so each subtree range
// corresponds to its REAL line span in the envelope markdown.
// ===========================================================================
describe('L5 — the lineMap ranges correspond to the real envelope markdown (template-root lines counted once)', () => {
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

  async function seedStore(store: RagStore, nodes: RagNode[], edges: RagEdge[]): Promise<void> {
    for (const n of nodes) await store.putNode(n)
    for (const e of edges) await store.putEdge(e)
  }

  it('a multi-payload envelope with a markdown-producing template root: each subtree range matches its real line span (no template-root over-count)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('s1', { type: 'p', content: 'Section one' }),
        makeNode('s2', { type: 'p', content: 'Section two' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 's1', 's2', { documentIds: ['doc'] }),
        makeEdge('e-n3', 'next-section', 's2', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
      ])

      // A custom template whose root produces a markdown line (`# Window`).
      // The template-root line is rendered ONCE in the real envelope — the old
      // per-subtree standalone renders each re-included it, over-counting it.
      const template: ContentWindowTemplate = {
        root: {
          type: 'h1',
          props: { id: 'custom-root' },
          content: 'Window',
          children: [{ type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } }],
        },
      }

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main', template })

      // Render the REAL envelope markdown (the single full-envelope render).
      const runtime = new Runtime({ mount: mountEl() as never, envelope: result.envelope as never })
      runtime.loadEnvelope(result.envelope as never)
      const lines = runtime.markdown().split('\n')

      // The template-root line is at line 0 (`# Window`) — it is NOT claimed by
      // any subtree range (the ranges must not over-count it).
      expect(lines[0]).toBe('# Window')

      // Each subtree's range must correspond to its REAL line span in the
      // envelope markdown. The old code over-counted the template-root line,
      // giving head:[0,1), s1:[1,2), ... — off by one.
      const expected: Record<string, [number, number]> = {
        head: [1, 2],
        s1: [2, 3],
        s2: [3, 4],
        end: [4, 5],
      }
      for (const [ragId, [start, end]] of Object.entries(expected)) {
        const range = result.lineMap.ranges.find((r) => r.ragNodeId === ragId)!
        expect(range.startLine).toBe(start)
        expect(range.endLine).toBe(end)
        // the range's lines are the subtree's own markdown lines
        expect(lines.slice(start, end).join('\n')).toBeTruthy()
      }

      // No subtree range starts at the template-root line (line 0).
      for (const range of result.lineMap.ranges) {
        expect(range.startLine).toBeGreaterThanOrEqual(1)
      }
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('a multi-payload envelope with the DEFAULT template (no template-root lines) keeps the ranges anchored at line 0', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('s1', { type: 'p', content: 'Section one' }),
        makeNode('s2', { type: 'p', content: 'Section two' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 's1', 's2', { documentIds: ['doc'] }),
        makeEdge('e-n3', 'next-section', 's2', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
      ])

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      const runtime = new Runtime({ mount: mountEl() as never, envelope: result.envelope as never })
      runtime.loadEnvelope(result.envelope as never)
      const lines = runtime.markdown().split('\n')

      // The default template root (`div#wiki-root`) produces no markdown lines,
      // so the first subtree starts at line 0.
      const expected: Record<string, [number, number]> = {
        head: [0, 1],
        s1: [1, 2],
        s2: [2, 3],
        end: [3, 4],
      }
      for (const [ragId, [start, end]] of Object.entries(expected)) {
        const range = result.lineMap.ranges.find((r) => r.ragNodeId === ragId)!
        expect(range.startLine).toBe(start)
        expect(range.endLine).toBe(end)
        expect(lines.slice(start, end).join('\n')).toBeTruthy()
      }
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
