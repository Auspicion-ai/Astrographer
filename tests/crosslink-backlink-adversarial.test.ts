// tests/crosslink-backlink-adversarial.test.ts — Unit G adversarial regression
// tests (docs/specs/unit-g-crosslink-backlink.md §3a). Each test pins a HOST
// finding fixed in `src/`:
//   - G1 (LOW): `edit.set_edge` with an empty-string `documentIds` element on a
//     crosslink must return a DOMAIN result (`{ ok: false, error: ... }`), never
//     throw (the op's documented contract — "Ops NEVER throw for domain
//     failures"). The store's `validateEdgeShape` rejects empty strings, so the
//     op must pre-validate them (mirroring the store's rule).
//   - G2 (LOW): the `rag-backlinks` IPC's store-null fail-state must match the
//     MCP `rag.backlinks` tool's (`'rag.backlinks: no rag store configured'`),
//     so the IPC rejects identically to the MCP tool (§5.4 MCP/UI equivalence).
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'
import { handleRagTool, handleRagBacklinksIpc, handleEditTool } from '../src/main/mcp-server.js'
import { installShim } from '../src/shared/dom-shim.js'

beforeAll(() => {
  installShim()
})

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-crosslink-adv-'))
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

// ===========================================================================
// G1 — edit.set_edge with an empty-string documentIds element (edit-ops.ts)
// ===========================================================================

describe('G1 — edit.set_edge empty-string documentIds (edit-ops.ts)', () => {
  it('G1.1. edit.set_edge with an empty-string documentIds element on a crosslink → a DOMAIN result, never a throw', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await store.putNode(makeNode('tgt', { createdAt: now, updatedAt: now }))
      const result = await handleEditTool(store, 'edit.set_edge', {
        kind: 'crosslink',
        source: 'src',
        target: 'tgt',
        documentIds: ['docA', ''],
      }) as { ok: boolean; error?: string }
      expect(result.ok).toBe(false)
      expect(result.error).toBe('edit.set_edge: documentIds must be a non-empty string array')
      // The store is untouched — no partial mutation.
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('G1.2. edit.set_edge with a single empty-string documentIds element → the same domain result', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await store.putNode(makeNode('tgt', { createdAt: now, updatedAt: now }))
      const result = await handleEditTool(store, 'edit.set_edge', {
        kind: 'crosslink',
        source: 'src',
        target: 'tgt',
        documentIds: [''],
      }) as { ok: boolean; error?: string }
      expect(result.ok).toBe(false)
      expect(result.error).toBe('edit.set_edge: documentIds must be a non-empty string array')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('G1.3. edit.set_edge with a valid non-empty documentIds array still succeeds (no regression)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await store.putNode(makeNode('tgt', { createdAt: now, updatedAt: now }))
      const result = await handleEditTool(store, 'edit.set_edge', {
        kind: 'crosslink',
        source: 'src',
        target: 'tgt',
        documentIds: ['docA', 'docB'],
      }) as { ok: boolean; edge?: RagEdge }
      expect(result.ok).toBe(true)
      expect(result.edge?.kind).toBe('crosslink')
      expect(result.edge?.documentIds).toEqual(['docA', 'docB'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// G2 — the rag-backlinks IPC store-null fail-state matches the MCP tool
// ===========================================================================

describe('G2 — rag-backlinks IPC store-null message matches the MCP tool (mcp-server.ts)', () => {
  it('G2.1. the rag-backlinks IPC with a null store → throws the MCP tool\'s message', async () => {
    await expect(handleRagBacklinksIpc(null, { nodeId: 'x' })).rejects.toThrow('rag.backlinks: no rag store configured')
  })

  it('G2.2. the rag-backlinks IPC with an undefined store → throws the MCP tool\'s message', async () => {
    await expect(handleRagBacklinksIpc(undefined as never, { nodeId: 'x' })).rejects.toThrow('rag.backlinks: no rag store configured')
  })

  it('G2.3. the MCP rag.backlinks tool with a null store → throws the SAME message (equivalence)', async () => {
    await expect(handleRagTool(null, 'rag.backlinks', { nodeId: 'x' })).rejects.toThrow('rag.backlinks: no rag store configured')
  })
})
