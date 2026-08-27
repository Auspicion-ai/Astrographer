// tests/rag-edit-gate.test.ts — Unit B: the five-seam MCP gating for the `rag`
// (read-only, default-off) + `edit` (mutating, default-off) tool groups
// (docs/specs/unit-b-document-model.md §5.3/§5.4). Imports from the EXISTING
// foundation seams: security.ts, mcp-server.ts, shared/types.ts.
//
// These tests are RED because the `rag`/`edit` groups are NOT yet added:
//   - `ToolGroup` lacks 'rag'/'edit'
//   - `TOOL_GROUPS` has no rag.*/edit.* mappings
//   - `VALID_GROUPS` lacks 'rag'/'edit'
//   - `ALL_TOOLS` lacks the 11 rag.*/edit.* names
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  groupForTool,
  toolAllowed,
  defaultSecurityConfig,
  SecurityGate,
  type ToolGroup,
} from '../src/main/security.js'
import { ProvidentMcpServer, toolForName, handleEditTool, type McpBackend } from '../src/main/mcp-server.js'
import { createJsonRagStore, type RagStore } from '../src/main/rag-store.js'
import type { RpcMethod } from '../src/shared/types.js'

const RAG_TOOLS = ['rag.query', 'rag.get_document', 'rag.list_nodes', 'rag.get_edges', 'rag.backlinks']
const EDIT_TOOLS = [
  'edit.set_content',
  'edit.create_node',
  'edit.delete_node',
  'edit.split_node',
  'edit.merge_node',
  'edit.set_edge',
]
const ALL_NEW = [...RAG_TOOLS, ...EDIT_TOOLS]

const backend: McpBackend = { invoke: async () => ({}) }

// ===========================================================================
// Seam 1 — src/main/security.ts (ToolGroup / TOOL_GROUPS / VALID_GROUPS /
// defaultSecurityConfig)
// ===========================================================================

describe('Seam 1 — security.ts ToolGroup/TOOL_GROUPS/VALID_GROUPS/defaultSecurityConfig (§5.3)', () => {
  it('ToolGroup union includes rag and edit (groupForTool resolves them)', () => {
    expect(groupForTool('rag.query')).toBe('rag')
    expect(groupForTool('edit.set_content')).toBe('edit')
  })

  it('TOOL_GROUPS maps the 5 rag.* tool names to the rag group', () => {
    for (const t of RAG_TOOLS) expect(groupForTool(t)).toBe('rag')
  })

  it('TOOL_GROUPS maps the 6 edit.* tool names to the edit group', () => {
    for (const t of EDIT_TOOLS) expect(groupForTool(t)).toBe('edit')
  })

  it('defaultSecurityConfig() does NOT enable rag/edit by default (only read/dispatch)', () => {
    const cfg = defaultSecurityConfig()
    expect(cfg.enabled).toEqual(['read', 'dispatch'])
    expect(cfg.enabled).not.toContain('rag')
    expect(cfg.enabled).not.toContain('edit')
  })

  it('VALID_GROUPS includes rag — apply({groups:["rag"]}) enables rag', () => {
    const next = new SecurityGate().apply({ groups: ['rag'] })
    expect([...next.enabled]).toContain('rag')
  })

  it('VALID_GROUPS includes edit — apply({groups:["edit"]}) enables edit', () => {
    const next = new SecurityGate().apply({ groups: ['edit'] })
    expect([...next.enabled]).toContain('edit')
  })
})

// ===========================================================================
// Seam 2 — src/main/mcp-server.ts (ALL_TOOLS + registerTools, main-handled)
// ===========================================================================

describe('Seam 2 — mcp-server.ts ALL_TOOLS + registerTools (§5.3)', () => {
  it('ALL_TOOLS includes the 5 rag.* + 6 edit.* tool names (11 total)', () => {
    for (const t of ALL_NEW) expect(ProvidentMcpServer.ALL_TOOLS).toContain(t)
  })

  it('default gate excludes the rag.*/edit.* tools (not registered)', () => {
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    for (const t of ALL_NEW) expect(server.allowedToolNames()).not.toContain(t)
  })

  it('after applyGatePatch({groups:["rag"]}), the rag.* tools are allowed', () => {
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.applyGatePatch({ groups: ['rag'] })
    for (const t of RAG_TOOLS) expect(server.allowedToolNames()).toContain(t)
  })

  it('after applyGatePatch({groups:["edit"]}), the edit.* tools are allowed', () => {
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.applyGatePatch({ groups: ['edit'] })
    for (const t of EDIT_TOOLS) expect(server.allowedToolNames()).toContain(t)
  })

  it('a rag.*/edit.* tool with its group disabled is NOT registered on a live server', () => {
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.ensureServerRegistered()
    expect(server.registeredEnabled('rag.query')).toBe(false)
    expect(server.registeredEnabled('edit.set_content')).toBe(false)
  })

  it('a rag.*/edit.* tool with its group enabled IS registered on a live server', () => {
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.ensureServerRegistered()
    server.applyGatePatch({ groups: ['rag', 'edit'] })
    expect(server.registeredEnabled('rag.query')).toBe(true)
    expect(server.registeredEnabled('edit.set_content')).toBe(true)
  })
})

// ===========================================================================
// Seam 3 — src/shared/types.ts (RpcMethod union)
// ===========================================================================

describe('Seam 3 — shared/types.ts RpcMethod union (§5.3)', () => {
  it('RpcMethod includes the 11 rag.*/edit.* method names (type-level; caught by typecheck)', () => {
    // RpcMethod is a type union — this is a compile-time contract. The array
    // assignment fails `npm run typecheck` until the 11 names are added to the
    // union. At runtime (vitest) the names are just strings, so this test is a
    // typecheck-only red; the runtime red for the seam is the mcp-server
    // registration (Seam 2) + the renderer negative contract (Seam 4).
    const methods: RpcMethod[] = [...ALL_NEW]
    expect(methods).toHaveLength(11)
  })
})

// ===========================================================================
// Seam 4 — renderer switch negative contract (rag.*/edit.* never reach the
// renderer; a method that does throws "unknown method")
// ===========================================================================

describe('Seam 4 — renderer switch negative contract (§5.3)', () => {
  it('the rag.*/edit.* tools are main-handled (registered in MAIN, never routed to the renderer)', () => {
    // The rag/edit tools are handled in mcp-server.ts (like module.*), calling
    // the main-process RAG store. They NEVER reach the renderer switch. A
    // rag.*/edit.* method that somehow reaches the renderer hits the default
    // branch and throws "unknown method" (fail-closed). This is a NEGATIVE
    // contract: the renderer switch needs NO new cases. The renderer's
    // handleRequest is not exported, so the fail-closed throw is verified by
    // code review; here we assert the positive half — the tools register in
    // MAIN when their group is enabled.
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.applyGatePatch({ groups: ['rag', 'edit'] })
    for (const t of ALL_NEW) expect(server.allowedToolNames()).toContain(t)
  })
})

// ===========================================================================
// Seam 5 — MUTATING_METHODS negative contract (edit.* NOT added to the
// renderer's MUTATING_METHODS)
// ===========================================================================

describe('Seam 5 — MUTATING_METHODS negative contract (§5.3)', () => {
  it('the edit.* tools are main-handled (mutate the RAG store, not the renderer graph)', () => {
    // The edit.* methods are mutating but MAIN-handled: they mutate the
    // main-process RAG store through the single-writer queue, NOT the renderer
    // graph. So they are NOT added to the renderer's MUTATING_METHODS (which
    // drives the app-graph-changed push for the RENDERER graph). This is a
    // NEGATIVE contract — a future agent must not misclassify them. The
    // renderer's MUTATING_METHODS is not exported, so the absence is verified
    // by code review; here we assert the positive half — the edit.* tools
    // register in MAIN when the edit group is enabled.
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.applyGatePatch({ groups: ['edit'] })
    for (const t of EDIT_TOOLS) expect(server.allowedToolNames()).toContain(t)
  })
})

// ===========================================================================
// Gating behavior (§5.4)
// ===========================================================================

describe('Gating behavior (§5.4)', () => {
  it('a rag.* tool is callable only when the rag group is enabled', () => {
    expect(toolAllowed('rag.query', ['read', 'dispatch'])).toBe(false)
    expect(toolAllowed('rag.query', ['rag'])).toBe(true)
  })

  it('an edit.* tool is callable only when the edit group is enabled', () => {
    expect(toolAllowed('edit.set_content', ['read', 'dispatch'])).toBe(false)
    expect(toolAllowed('edit.set_content', ['edit'])).toBe(true)
  })

  it('an edit.* tool with only code enabled is DENIED (editing is never a code-group op)', () => {
    expect(toolAllowed('edit.set_content', ['code'])).toBe(false)
    expect(toolAllowed('edit.create_node', ['code'])).toBe(false)
    expect(toolAllowed('edit.set_edge', ['code'])).toBe(false)
  })

  it('a malformed tool name (empty rest, double prefix) → toolForName throws (F2, fail-closed)', () => {
    expect(() => toolForName('provident.')).toThrow()
    expect(() => toolForName('provident.provident.dispatch')).toThrow()
  })
})

// ===========================================================================
// ADVERSARIAL REGRESSION TESTS (HOST findings fixed in src/main/mcp-server.ts)
// ===========================================================================

describe('edit.create_node — adversarial regression (HOST finding 3)', () => {
  it('a node created with a parentId has a parent-child edge in the store (not orphaned)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'provident-rag-gate-'))
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode({ id: 'parent', type: 'div', content: 'parent', ownedNodeIds: [], createdAt: now, updatedAt: now })

      const created = (await handleEditTool(store, 'edit.create_node', {
        type: 'p',
        content: 'child',
        parentId: 'parent',
      })) as { ok: true; node: { id: string } }

      const edges = store.listEdges()
      const parentChild = edges.find((e) => e.kind === 'parent-child' && e.source === 'parent' && e.target === created.node.id)
      expect(parentChild).toBeDefined()
      expect(store.getNode(created.node.id)).toBeDefined()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
