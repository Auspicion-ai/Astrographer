// tests/integration-adversarial.test.ts — regression tests for the cross-unit
// integration defects found in the broad adversarial pass (Findings 1-5). Each
// test pins a HOST finding fixed in this pass:
//   Finding 1 — MCP `edit.*` re-traversal broadcast uses the wrong IPC channel
//               (mcp-server.ts broadcast on the bare literal 'rag-store-changed'
//               instead of IPC_RAG_STORE_CHANGED).
//   Finding 2 — mergeNode can break doc-flow validity (edit-ops.ts).
//   Finding 3 — renderer re-traversal onRebuild is a no-op (renderer.ts /
//               traversal.ts rebuildBackRefs).
//   Finding 4 — edit-commit deleted-node race surfaces as store-error, not
//               deleted-node (edit-ops.ts handleEditCommit).
//   Finding 5 — handleEditTool coerces malformed inputs instead of surfacing
//               documented fail-states (mcp-server.ts).
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'
import {
  mergeNode,
  handleEditCommit,
  type EditOpContext,
} from '../src/main/edit-ops.js'
import {
  handleEditTool,
  ProvidentMcpServer,
  type McpBackend,
} from '../src/main/mcp-server.js'
import { SecurityGate } from '../src/main/security.js'
import { rebuildBackRefs } from '../src/main/traversal.js'
import { IPC_RAG_STORE_CHANGED } from '../src/shared/types.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-integration-adv-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

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

/** A valid single-document flow: head → s1 → s2 → end, all scoped to 'doc'. */
function validDoc(): { nodes: RagNode[]; edges: RagEdge[] } {
  const nodes: RagNode[] = [
    makeNode('doc', { type: 'div' }), // document root = documentId
    makeNode('head', { type: 'h1' }),
    makeNode('s1', { type: 'p' }),
    makeNode('s2', { type: 'p' }),
    makeNode('end', { type: 'p' }),
  ]
  const edges: RagEdge[] = [
    makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
    makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
    makeEdge('e-n2', 'next-section', 's1', 's2', { documentIds: ['doc'] }),
    makeEdge('e-n3', 'next-section', 's2', 'end', { documentIds: ['doc'] }),
    makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
  ]
  return { nodes, edges }
}

// ===========================================================================
// Finding 1 — MCP edit.* re-traversal broadcast uses the wrong IPC channel
// ===========================================================================

describe('Finding 1 — MCP edit.* broadcast uses IPC_RAG_STORE_CHANGED', () => {
  it('an MCP edit.set_content success delivers the broadcast on IPC_RAG_STORE_CHANGED (not the bare literal)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      const broadcasts: Array<{ channel: string; msg: unknown }> = []
      const backend: McpBackend = {
        invoke: async () => ({}),
        broadcast: (channel, msg) => { broadcasts.push({ channel, msg }) },
      }
      const server = new ProvidentMcpServer({
        backend,
        transport: 'stdio',
        gate: new SecurityGate().apply({ groups: ['edit'] }),
        ragStore: store,
      })
      server.ensureServerRegistered()
      const registered = (server as unknown as { registered: Map<string, RegisteredTool> }).registered
      const tool = registered.get('edit.set_content')!
      expect(tool).toBeDefined()
      const result = await (tool.handler as (args: unknown, extra: unknown) => Promise<unknown>)(
        { nodeId: 'n1', content: 'world' },
        { signal: new AbortController().signal, requestId: 1 },
      )
      // the tool succeeded (the broadcast below only fires on result.ok)
      expect(result).toBeDefined()
      // the broadcast went out on the REAL channel the renderer subscribes to
      expect(broadcasts).toHaveLength(1)
      expect(broadcasts[0].channel).toBe(IPC_RAG_STORE_CHANGED)
      expect(broadcasts[0].channel).toBe('provident:rag-store-changed')
      expect(broadcasts[0].msg).toEqual({ kind: 'content', nodeIds: ['n1'], edgeIds: [] })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('an MCP edit.split_node success broadcasts on IPC_RAG_STORE_CHANGED', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      const broadcasts: Array<{ channel: string; msg: unknown }> = []
      const backend: McpBackend = {
        invoke: async () => ({}),
        broadcast: (channel, msg) => { broadcasts.push({ channel, msg }) },
      }
      const server = new ProvidentMcpServer({
        backend,
        transport: 'stdio',
        gate: new SecurityGate().apply({ groups: ['edit'] }),
        ragStore: store,
      })
      server.ensureServerRegistered()
      const registered = (server as unknown as { registered: Map<string, RegisteredTool> }).registered
      const tool = registered.get('edit.split_node')!
      await (tool.handler as (args: unknown, extra: unknown) => Promise<unknown>)(
        { nodeId: 'n1', at: 5 },
        { signal: new AbortController().signal, requestId: 1 },
      )
      expect(broadcasts).toHaveLength(1)
      expect(broadcasts[0].channel).toBe(IPC_RAG_STORE_CHANGED)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// Finding 2 — mergeNode can break doc-flow validity (Unit B)
// ===========================================================================

describe('Finding 2 — mergeNode preserves doc-flow validity', () => {
  it('rejects a merge whose source is mid-chain (the target of a next-section edge) — no partial mutation', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      for (const n of nodes) await store.putNode(n)
      for (const e of edges) await store.putEdge(e)
      // head → A(s1) → B(s2) → end; merging s1 into head would leave the chain
      // head → (deleted) — a broken next-section chain.
      const result = await mergeNode({ store }, { sourceId: 's1', targetId: 'head' })
      expect(result).toEqual({ ok: false, error: 'edit.merge_node: cannot merge a node that carries a doc-flow role or is mid-chain' })
      // no partial mutation: source NOT deleted, target content unchanged
      expect(store.getNode('s1')).toBeDefined()
      expect(store.getNode('head')!.content).toBe('content-head')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('rejects a merge whose source is the doc-head (would leave the document headless)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      for (const n of nodes) await store.putNode(n)
      for (const e of edges) await store.putEdge(e)
      const result = await mergeNode({ store }, { sourceId: 'head', targetId: 's1' })
      expect(result).toEqual({ ok: false, error: 'edit.merge_node: cannot merge a node that carries a doc-flow role or is mid-chain' })
      expect(store.getNode('head')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('rejects a merge whose source is the doc-end (would leave the document endless)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      for (const n of nodes) await store.putNode(n)
      for (const e of edges) await store.putEdge(e)
      const result = await mergeNode({ store }, { sourceId: 'end', targetId: 's2' })
      expect(result).toEqual({ ok: false, error: 'edit.merge_node: cannot merge a node that carries a doc-flow role or is mid-chain' })
      expect(store.getNode('end')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('still allows a merge of a node with NO doc-flow role (a standalone parent-child subtree)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('target', { content: 'T' }))
      await store.putNode(makeNode('source', { content: 'S' }))
      await store.putNode(makeNode('child'))
      await store.putEdge(makeEdge('e1', 'parent-child', 'source', 'child'))
      const result = await mergeNode({ store }, { sourceId: 'source', targetId: 'target' })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.target.content).toBe('TS')
        expect(store.getNode('source')).toBeUndefined()
      }
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// Finding 3 — renderer re-traversal onRebuild is a no-op (rebuildBackRefs)
// ===========================================================================

describe('Finding 3 — rebuildBackRefs re-derives the graph + backRefs', () => {
  it('re-derives the back-reference map from a valid doc-flow snapshot', () => {
    const { nodes, edges } = validDoc()
    const backRefs = rebuildBackRefs(nodes, edges, 'main')
    // every section in the doc-flow gets a backRefs entry (the re-traversal
    // actually re-derives the graph, not a no-op)
    for (const id of ['head', 's1', 's2', 'end']) {
      expect(backRefs.has(id)).toBe(true)
      expect(backRefs.get(id)!.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('an empty snapshot (no doc-head edges → no documents) returns an empty map (never throws)', () => {
    const backRefs = rebuildBackRefs([], [], 'main')
    expect(backRefs.size).toBe(0)
  })
})

// ===========================================================================
// Finding 4 — edit-commit deleted-node race surfaces as deleted-node
// ===========================================================================

describe('Finding 4 — handleEditCommit maps a deleted-node race to deleted-node', () => {
  it('a deleted node (setContent "node not found") → { ok:false, reason:"deleted-node" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = await handleEditCommit(store, { nodeId: 'ghost', content: 'x' })
      expect(result).toEqual({ ok: false, reason: 'deleted-node', error: 'edit.set_content: node not found' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('a store error (non-string content) → { ok:false, reason:"store-error" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = await handleEditCommit(store, { nodeId: 'n1', content: 123 as never })
      expect(result).toEqual({ ok: false, reason: 'store-error', error: 'edit.set_content: content must be a string' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('a successful commit → { ok:true, nodeId }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      const result = await handleEditCommit(store, { nodeId: 'n1', content: 'world' })
      expect(result).toEqual({ ok: true, nodeId: 'n1' })
      expect(store.getNode('n1')!.content).toBe('world')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// Finding 5 — handleEditTool surfaces documented fail-states (no coercion)
// ===========================================================================

describe('Finding 5 — handleEditTool surfaces documented fail-states', () => {
  it('edit.set_content with a non-string content → "content must be a string" (not coerced to "")', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      const result = await handleEditTool(store, 'edit.set_content', { nodeId: 'n1', content: 123 })
      expect(result).toEqual({ ok: false, error: 'edit.set_content: content must be a string' })
      // the node content is unchanged (no silent empty-string write)
      expect(store.getNode('n1')!.content).toBe('hello')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('edit.create_node with a non-string content → "content must be a string" (not coerced to "")', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = await handleEditTool(store, 'edit.create_node', { type: 'p', content: 123 })
      expect(result).toEqual({ ok: false, error: 'edit.create_node: content must be a string' })
      expect(store.listNodes()).toHaveLength(0) // no node created
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('edit.set_edge with a non-number order → "order must be a number" (not coerced to undefined)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      const result = await handleEditTool(store, 'edit.set_edge', { kind: 'doc-child', source: 'n1', target: 'n2', order: 'x' })
      expect(result).toEqual({ ok: false, error: 'edit.set_edge: order must be a number' })
      expect(store.listEdges()).toHaveLength(0) // no edge created
    } finally {
      rmSyncSafe(dir)
    }
  })
})
