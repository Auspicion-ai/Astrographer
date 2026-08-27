// src/main/mcp-server.ts — the MCP server (main process). Exposes the
// provident-ssr renderer's synthetic-event access + rendered-HTML visibility
// as MCP tools for agentic use and debugging exposure.
//
// Two transports (configurable via `--mcp-transport` / `PROVIDENT_MCP_TRANSPORT`):
//   - stdio: the process is spawned by an MCP client (agent/IDE).
//   - http:   a Streamable HTTP server on 127.0.0.1:<port>/mcp (the app runs,
//             the client connects).
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { RegisteredTool, RegisteredResource, RegisteredResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type {
  RpcRequest,
  RpcReply,
  DispatchRequest,
  RenderedHtmlResult,
  ListTargetsResult,
  NodeStateResult,
} from '../shared/types.js'
import { SecurityGate, type ToolGroup, moduleToolAllowed } from './security.js'
import type { ModuleStore } from './module-store.js'
import type { RagStore } from './rag-store.js'
import { setContent, createNode, deleteNode, splitNode, mergeNode, setEdge } from './edit-ops.js'
import type { CapabilityRouter } from '../renderer/extensions.js'

const TOOL_PREFIX = 'provident.'

/** U9 (F1) — invoke a dynamic `module:<name>.<tool>` tool. Enforces the
 *  invocation two-gate: a module tool backed by an executable entry requires
 *  `module` AND `code` at EACH call (not just install). A module-only agent
 *  cannot run a module tool that is arbitrary code. Standalone so the static
 *  `registerTools` can route SDK calls through it. */
export function invokeModuleTool(router: CapabilityRouter, gate: SecurityGate, toolName: string, args: unknown): unknown {
  if (typeof toolName !== 'string' || !toolName.startsWith('module:')) {
    throw new Error(`invokeTool: not a module tool: ${String(toolName)}`)
  }
  // F1 — the invocation two-gate. A dynamic module tool is trusted-equivalent
  // to `code` (executable entry), so it needs module AND code.
  if (!moduleToolAllowed(toolName, gate.enabled, { executable: true })) {
    throw new Error(`invokeTool: ${toolName} requires module AND code groups (invocation two-gate)`)
  }
  return router.invokeTool(toolName, args)
}

/** U3 — handle a `module.*` tool in MAIN (the persisted node:fs store). The
 *  module tools are NOT routed to the renderer (the store is main-process).
 *  Exported for direct unit testing. */
export function handleModuleTool(store: ModuleStore | null, name: string, args: Record<string, unknown>): unknown {
  if (!store) throw new Error(`${name}: no module store configured`)
  const nameArg = typeof args.name === 'string' ? args.name : ''
  const source = typeof args.source === 'string' ? args.source : ''
  const version = typeof args.version === 'string' ? args.version : undefined
  const force = args.force === true
  // U9-FIX (#6) — parse the module `source` manifest into declared capabilities.
  // The source is the module's manifest (a JSON/JS object declaring `name`,
  // `version`, `capabilities.tools/hooks/transforms`). A best-effort parse: if
  // the source is a plain `{...}` manifest, extract capabilities.tools; else
  // fall back to any `capabilities` arg. The store records the parsed
  // capabilities so `syncModuleRouter` can register the module's tools.
  const parseCapabilities = (src: string, argCaps?: unknown): { tools?: string[]; hooks?: string[]; transforms?: string[] } => {
    let parsed: { capabilities?: { tools?: unknown; hooks?: unknown; transforms?: unknown } } | null = null
    const trimmed = src.trim()
    if (trimmed.startsWith('{')) {
      try {
        parsed = JSON.parse(trimmed) as { capabilities?: { tools?: unknown; hooks?: unknown; transforms?: unknown } }
      } catch {
        parsed = null
      }
    }
    const caps = parsed?.capabilities ?? argCaps
    if (caps && typeof caps === 'object' && !Array.isArray(caps)) {
      const c = caps as { tools?: unknown; hooks?: unknown; transforms?: unknown }
      const strArr = (v: unknown): string[] | undefined => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined)
      return {
        ...(strArr(c.tools) ? { tools: strArr(c.tools) } : {}),
        ...(strArr(c.hooks) ? { hooks: strArr(c.hooks) } : {}),
        ...(strArr(c.transforms) ? { transforms: strArr(c.transforms) } : {}),
      }
    }
    return {}
  }
  if (name === 'module.install') {
    if (nameArg === '' || source === '') throw new Error('module.install: name and source required')
    const existing = store.get(nameArg)
    const v = version ?? '0.0.0'
    if (existing) {
      if (existing.version === v) return { status: 'no-op', name: nameArg, version: v }
      if (!force) return { status: 'rejected', name: nameArg, version: v, reason: `version conflict: ${existing.version} installed; ${v} requested (pass force:true)` }
    }
    store.put({ name: nameArg, version: v, source, capabilities: parseCapabilities(source, args.capabilities) })
    return { status: 'installed', name: nameArg, version: v }
  }
  if (name === 'module.update') {
    if (nameArg === '' || source === '') throw new Error('module.update: name and source required')
    const v = version ?? '0.0.0'
    store.put({ name: nameArg, version: v, source, capabilities: parseCapabilities(source, args.capabilities) })
    return { status: 'updated', name: nameArg, version: v }
  }
  if (name === 'module.list') {
    return store.list().map((r) => ({ name: r.name, version: r.version, capabilities: r.capabilities ?? {}, disabled: r.disabled, quarantined: r.quarantined }))
  }
  throw new Error(`unknown module tool: ${name}`)
}

/** Unit B — handle a `rag.*` tool in MAIN (read-only, against the RAG store).
 *  The rag tools are NOT routed to the renderer (the store is main-process).
 *  The tools depend on the `RagStore` INTERFACE (Unit A §5.3 — SOURCE-SWITCHABLE),
 *  never the concrete JSON store. Tools whose behavior lands in a later unit
 *  (rag.query → Unit E retrieval, rag.backlinks → Unit G) are registered with a
 *  minimal/placeholder handler that is gated correctly. Exported for direct
 *  unit testing. */
export function handleRagTool(store: RagStore | null, name: string, args: Record<string, unknown>): unknown {
  if (!store) throw new Error(`${name}: no rag store configured`)
  switch (name) {
    case 'rag.query': {
      // Unit E implements the retrieval; registered here with a placeholder.
      const query = typeof args.query === 'string' ? args.query : ''
      const topK = typeof args.topK === 'number' ? args.topK : undefined
      return { query, topK, results: [], lineMap: {} }
    }
    case 'rag.get_document': {
      // Finding 4 (known behavior, no code change): this is a PLACEHOLDER —
      // it returns the ENTIRE store, not the document's subtree. Full subtree
      // scoping (the document's RAG nodes/edges) lands in Unit C (the
      // traversal/render spine). Do not change the behavior here.
      const documentId = typeof args.documentId === 'string' ? args.documentId : ''
      if (documentId === '') throw new Error('rag.get_document: documentId required')
      return { documentId, nodes: store.listNodes(), edges: store.listEdges() }
    }
    case 'rag.list_nodes':
      return store.listNodes().map((n) => ({ id: n.id, type: n.type, content: n.content.slice(0, 80), ownedNodeIds: n.ownedNodeIds.length }))
    case 'rag.get_edges': {
      const nodeId = typeof args.nodeId === 'string' ? args.nodeId : undefined
      const edges = store.listEdges()
      if (nodeId === undefined) return edges
      return edges.filter((e) => e.source === nodeId || e.target === nodeId)
    }
    case 'rag.backlinks': {
      // Unit G enumerates the backlinks; registered here with a placeholder.
      const nodeId = typeof args.nodeId === 'string' ? args.nodeId : ''
      if (nodeId === '') throw new Error('rag.backlinks: nodeId required')
      return { nodeId, backlinks: [] }
    }
    default:
      throw new Error(`unknown rag tool: ${name}`)
  }
}

/** The `rag-store-changed` broadcast payload (§5.1.9) — the re-traversal
 *  trigger. After ANY successful RAG-store mutation via an MCP `edit.*` tool
 *  (or a UI commit-on-blur), the main process broadcasts this to the renderer. */
export interface RagStoreChangedPayload {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
}

/** Unit B/D — handle an `edit.*` tool in MAIN (mutating, through the RAG store's
 *  single-writer queue). The edit tools are NOT routed to the renderer. Editing
 *  is NEVER a `code`-group op. Exported for direct unit testing.
 *
 *  H1 — the handler is a THIN validator that calls the corresponding edit op
 *  (§5.1.2-§5.1.7) from `src/main/edit-ops.ts` (the tool→op mapping in §5.1.8)
 *  and returns the op's JSON result. It does NOT reimplement the ops inline.
 *  After a successful mutation it invokes `onStoreChanged` (the §5.1.9
 *  re-traversal trigger), which the caller wires to a `rag-store-changed`
 *  broadcast to the renderer. */
export async function handleEditTool(
  store: RagStore | null,
  name: string,
  args: Record<string, unknown>,
  onStoreChanged?: (payload: RagStoreChangedPayload) => void,
): Promise<unknown> {
  if (!store) throw new Error(`${name}: no rag store configured`)
  const ctx = { store }
  switch (name) {
    case 'edit.set_content': {
      const nodeId = typeof args.nodeId === 'string' ? args.nodeId : ''
      const content = typeof args.content === 'string' ? args.content : ''
      if (nodeId === '') throw new Error('edit.set_content: nodeId required')
      const result = await setContent(ctx, { nodeId, content })
      if (result.ok) onStoreChanged?.({ kind: 'content', nodeIds: [nodeId], edgeIds: [] })
      return result
    }
    case 'edit.create_node': {
      const type = typeof args.type === 'string' ? args.type : ''
      const content = typeof args.content === 'string' ? args.content : ''
      const parentId = typeof args.parentId === 'string' && args.parentId !== '' ? args.parentId : undefined
      const props = args.props && typeof args.props === 'object' ? (args.props as Record<string, unknown>) : undefined
      const result = await createNode(ctx, { type, content, parentId, props })
      if (result.ok) onStoreChanged?.({ kind: 'structural', nodeIds: [result.node.id], edgeIds: [] })
      return result
    }
    case 'edit.delete_node': {
      const nodeId = typeof args.nodeId === 'string' ? args.nodeId : ''
      if (nodeId === '') throw new Error('edit.delete_node: nodeId required')
      const result = await deleteNode(ctx, { nodeId })
      if (result.ok && result.removed) onStoreChanged?.({ kind: 'structural', nodeIds: [nodeId], edgeIds: [] })
      return result
    }
    case 'edit.split_node': {
      const nodeId = typeof args.nodeId === 'string' ? args.nodeId : ''
      const at = typeof args.at === 'number' ? args.at : 0
      if (nodeId === '') throw new Error('edit.split_node: nodeId required')
      const result = await splitNode(ctx, { nodeId, at })
      if (result.ok) onStoreChanged?.({ kind: 'structural', nodeIds: [result.nodes[0].id, result.nodes[1].id], edgeIds: [result.edge.id] })
      return result
    }
    case 'edit.merge_node': {
      const sourceId = typeof args.sourceId === 'string' ? args.sourceId : ''
      const targetId = typeof args.targetId === 'string' ? args.targetId : ''
      if (sourceId === '' || targetId === '') throw new Error('edit.merge_node: sourceId and targetId required')
      const result = await mergeNode(ctx, { sourceId, targetId })
      if (result.ok) onStoreChanged?.({ kind: 'structural', nodeIds: [sourceId, targetId], edgeIds: [] })
      return result
    }
    case 'edit.set_edge': {
      const kind = typeof args.kind === 'string' ? args.kind : ''
      const source = typeof args.source === 'string' ? args.source : ''
      const target = typeof args.target === 'string' ? args.target : ''
      if (kind === '' || source === '' || target === '') throw new Error('edit.set_edge: kind, source and target required')
      const edgeId = typeof args.edgeId === 'string' && args.edgeId !== '' ? args.edgeId : undefined
      const order = typeof args.order === 'number' ? args.order : undefined
      const documentIds = Array.isArray(args.documentIds) ? (args.documentIds as string[]).filter((x): x is string => typeof x === 'string') : undefined
      const result = await setEdge(ctx, { kind, source, target, edgeId, order, documentIds })
      if (result.ok) onStoreChanged?.({ kind: 'structural', nodeIds: [source, target], edgeIds: [result.edge.id] })
      return result
    }
    default:
      throw new Error(`unknown edit tool: ${name}`)
  }
}

/** U9-FIX — re-sync the CapabilityRouter from the persisted module store. The
 *  store is the source of truth (persisted, fail-disabled/hash-verified); the
 *  router is the LIVE capability surface. Each installed, non-disabled,
 *  non-quarantined module's declared capabilities are registered into the router
 *  so its dynamic `module:<name>.<tool>` tools become callable. Disabled and
 *  quarantined modules are NOT registered (their tools are not callable). This
 *  closes the store→router→MCP dynamic-tool chain in production.
 *
 *  NOTE: the module's `entry` source (trusted-equivalent to `code`) is NOT
 *  evaluated here — the declared capability NAMES are registered with a
 *  pass-through handler that echoes the declared tool. Full entry execution is a
 *  documented follow-on (the eval of the source body); the registration +
 *  invocation two-gate + namespacing are all wired. */
export function syncModuleRouter(router: CapabilityRouter | null, store: ModuleStore): void {
  if (!router) return
  router.clear()
  const status = store.status()
  const active = new Set(status.loaded)
  for (const r of store.list()) {
    if (!active.has(r.name)) continue // disabled or quarantined → not live
    const caps = r.capabilities ?? {}
    const tools = caps.tools ?? []
    if (tools.length === 0) continue
    router.registerModule(r.name, (ctx) => {
      for (const fullTool of tools) {
        const bare = fullTool.startsWith(`module:${r.name}.`) ? fullTool.slice(`module:${r.name}.`.length) : fullTool
        ctx.tool(bare, (args) => ({ tool: fullTool, args }))
      }
    })
  }
}

/** R1 (mcp-resources-review.md) — a gated read-group resource definition. */
interface ResourceDef {
  name: string
  uri?: string
  uriTemplate?: string
  group: ToolGroup
  mimeType: string
  method: 'renderedHtml' | 'listTargets' | 'nodeState'
  description: string
}

/** Map a `provident.`-prefixed tool name to its registration name (spec
 *  §2/§5). A name WITHOUT the prefix throws — a registered tool must be under
 *  the `provident.` prefix. Fail-closed on malformed names (F2): the empty
 *  tool name ('' after the prefix) and a double-prefix both throw. Pure (no
 *  Electron). */
export function toolForName(name: string): string {
  if (typeof name !== 'string') {
    throw new Error(`unregistered tool name (must be a '${TOOL_PREFIX}'-prefixed string)`)
  }
  if (!name.startsWith(TOOL_PREFIX)) {
    throw new Error(`unregistered tool name '${name}' (must be '${TOOL_PREFIX}'-prefixed)`)
  }
  const rest = name.slice(TOOL_PREFIX.length)
  // F2 — fail-closed on a malformed name: empty rest, or a double prefix.
  if (rest.length === 0 || rest.trim() !== rest || rest.startsWith(TOOL_PREFIX)) {
    throw new Error(`malformed tool name '${name}' (must be '${TOOL_PREFIX}<name>')`)
  }
  return rest
}

/** The subset of `allNames` whose group is allowed by the gate (spec §2/§3).
 *  `allNames` is the full `provident.`-prefixed tool-name list. A tool whose
 *  group is allowed but which is unknown to the map never registers
 *  (`gate.toolAllowed` returns false for unknown tools — group is null). F3:
 *  the output is DEDUPED so a caller's register loop never hits the SDK's
 *  duplicate-registration throw. */
export function registeredToolNames(gate: SecurityGate, allNames: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const name of allNames) {
    // U3 — the module.* install/update tools carry an executable entry, so they
    // are trusted-equivalent to `code`: they register ONLY when BOTH `module`
    // AND `code` are enabled (the two-gate, U1). `module.list` needs `module`
    // only. This is the registration-level gate; the invocation-level
    // `moduleToolAllowed` predicate (U1) is the per-call enforcement.
    if (name === 'module.install' || name === 'module.update') {
      if (gate.toolAllowed(name) && gate.enabled.has('code')) {
        seen.add(name)
        out.push(name)
      }
      continue
    }
    if (gate.toolAllowed(name) && !seen.has(name)) {
      seen.add(name)
      out.push(name)
    }
  }
  return out
}

/** The renderer-backed operation surface the MCP tools call into. The main
 *  process forwards each call to the renderer over IPC and awaits the reply. */
export interface McpBackend {
  invoke(method: string, payload: unknown): Promise<unknown>
  /** H5 (§5.1.9) — broadcast a main→renderer event (e.g. the `rag-store-changed`
   *  re-traversal trigger). A no-op when no window is attached/destroyed. */
  broadcast?(channel: string, msg: unknown): void
}

/** Format an MCP text result from a JSON-serializable value. */
function text(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] }
}

/** U5 (M-r4) — format an MCP IMAGE content block from a data-URI. The MCP SDK
 *  supports `{ type: 'image', data: <base64>, mimeType: <mime> }`. Parses the
 *  `data:<mime>;base64,<data>` URI into the data + mimeType. A non-data-URI
 *  throws a clean error (never crashes). */
export function imageResult(dataUri: string, mimeType?: string): { content: Array<{ type: 'image'; data: string; mimeType: string }> } {
  if (typeof dataUri !== 'string' || !dataUri.startsWith('data:')) {
    throw new Error('imageResult: expected a data: URI')
  }
  const comma = dataUri.indexOf(',')
  if (comma === -1) throw new Error('imageResult: malformed data: URI (no comma)')
  const header = dataUri.slice(5, comma)
  const data = dataUri.slice(comma + 1)
  const mime = mimeType ?? (header.includes(';') ? header.slice(0, header.indexOf(';')) : header)
  return { content: [{ type: 'image', data, mimeType: mime }] }
}

export type McpTransportKind = 'stdio' | 'http'

export interface McpServerOptions {
  backend: McpBackend
  transport: McpTransportKind
  port?: number
  gate?: SecurityGate
  /** U3 — the persisted module registry. When set, the server handles the
   *  `module.*` tools in MAIN (node:fs store), NOT routed to the renderer. */
  moduleStore?: ModuleStore
  /** U9 — the CapabilityRouter whose dynamic `module:<name>.<tool>` tools are
   *  registered + invoked (with the invocation two-gate, F1). */
  router?: CapabilityRouter
  /** Unit B — the main-process RAG store (Unit A §5.3, SOURCE-SWITCHABLE). The
   *  `rag.*`/`edit.*` tools are handled in MAIN against this store (never
   *  routed to the renderer). Injected like `moduleStore`; the tools depend on
   *  the `RagStore` INTERFACE, never the concrete JSON store. */
  ragStore?: RagStore
}

export interface SecuritySnapshot { token: string | null; enabled: ToolGroup[] }

export class ProvidentMcpServer {
  private server: McpServer | null = null
  private readonly backend: McpBackend
  private readonly transport: McpTransportKind
  private readonly port: number
  private readonly moduleStore: ModuleStore | null
  private readonly router: CapabilityRouter | null
  private readonly ragStore: RagStore | null
  private httpServer: ReturnType<typeof createServer> | null = null
  private readonly httpServers = new Set<McpServer>()
  private _gate: SecurityGate
  /** M1 — the live `RegisteredTool` handles, keyed by full `provident.` tool
   *  name, captured at registration. The SDK keeps its registry private (no
   *  enumerator), so this is the only way to re-gate (enable/disable) a
   *  running server's tools on `applyGatePatch`. */
  private readonly registered = new Map<string, RegisteredTool>()
  /** R2 (mcp-resources-review.md) — the live resource handles, keyed by URI.
   *  Captured at registration so `applyGatePatch` can re-gate them alongside
   *  the tools (the SDK keeps its registry private). */
  private readonly resources = new Map<string, RegisteredResource | RegisteredResourceTemplate>()
  /** M1: the (possibly single) long-lived stdio server, so `applyGatePatch`
   *  can re-gate it in place. */
  private stdioServer: McpServer | null = null

  constructor(opts: McpServerOptions) {
    this.backend = opts.backend
    this.transport = opts.transport
    this.port = opts.port ?? 3787
    this._gate = opts.gate ?? new SecurityGate()
    this.moduleStore = opts.moduleStore ?? null
    this.router = opts.router ?? null
    this.ragStore = opts.ragStore ?? null
  }

  getGateConfig(): SecuritySnapshot {
    return this._gate.config
  }

  /** The full tool-name list the server can register (spec mcp-server-gate.md
   *  §3). Kept in one place so registration + the gate agree. */
  static readonly ALL_TOOLS: string[] = [
    'provident.dispatch',
    'provident.get_rendered_html',
    'provident.get_markdown',
    'provident.list_targets',
    'provident.get_node_state',
    'provident.code.get',
    'provident.code.validate',
    'provident.load',
    'provident.op',
    'provident.export',
    'provident.validate',
    'provident.teardown',
    'provident.journal',
    'provident.code.set',
    'provident.code.create',
    'provident.code.delete',
    'provident.code.load',
    'provident.code.loadBatch',
    'module.install',
    'module.update',
    'module.list',
    // Unit B (docs/specs/unit-b-document-model.md §5.3) — the `rag` (read-only,
    // default-off) + `edit` (mutating, default-off) tool groups. Main-handled
    // against the RAG store, never routed to the renderer.
    'rag.query',
    'rag.get_document',
    'rag.list_nodes',
    'rag.get_edges',
    'rag.backlinks',
    'edit.set_content',
    'edit.create_node',
    'edit.delete_node',
    'edit.split_node',
    'edit.merge_node',
    'edit.set_edge',
  ]

  /** The subset of ALL_TOOLS whose group the current gate allows — the tools
   *  the server registers (and can register on a re-gate). */
  allowedToolNames(): string[] {
    const staticNames = registeredToolNames(this._gate, ProvidentMcpServer.ALL_TOOLS)
    // U9 (M-r3) — the router's dynamic `module:<name>.<tool>` tools. They are
    // gated by the `module` group (registration) + the invocation two-gate
    // (F1, enforced in invokeTool). A dynamic tool is listed only when `module`
    // is enabled.
    if (this.router) {
      for (const tool of this.router.listTools()) {
        if (this._gate.toolAllowed(tool) && !staticNames.includes(tool)) staticNames.push(tool)
      }
    }
    return staticNames
  }

  /** U9 (F1) — invoke a dynamic `module:<name>.<tool>` tool. Enforces the
   *  invocation two-gate: a module tool backed by an executable entry requires
   *  `module` AND `code` at EACH call (not just install). A module-only agent
   *  cannot run a module tool that is arbitrary code. */
  invokeTool(toolName: string, args: unknown): unknown {
    if (!this.router) throw new Error(`invokeTool: no module router configured`)
    if (typeof toolName !== 'string' || !toolName.startsWith('module:')) {
      throw new Error(`invokeTool: not a module tool: ${String(toolName)}`)
    }
    // F1 — the invocation two-gate. A dynamic module tool is trusted-equivalent
    // to `code` (executable entry), so it needs module AND code.
    if (!moduleToolAllowed(toolName, this._gate.enabled, { executable: true })) {
      throw new Error(`invokeTool: ${toolName} requires module AND code groups (invocation two-gate)`)
    }
    return this.router.invokeTool(toolName, args)
  }

  /** R1 (mcp-resources-review.md) — the resource list + their read-group
   *  mapping. Each resource mirrors a `read`-group tool; a resource is
   *  registered ONLY when its group is allowed (never always-registered). */
  /** R1 (mcp-resources-review.md) — a resource definition. */
  static readonly ALL_RESOURCES: Array<ResourceDef> = [
    { name: 'app', uri: 'mcp://provident/app', group: 'read', mimeType: 'text/html', method: 'renderedHtml', description: 'The current rendered HTML view (DOM + SSR + census) — mirrors provident.get_rendered_html. Always-fresh; a large read may return {census,digest,preview,truncated}.' },
    { name: 'targets', uri: 'mcp://provident/targets', group: 'read', mimeType: 'application/json', method: 'listTargets', description: 'The addressable node vocabulary — mirrors provident.list_targets. Concrete node URIs are discoverable only here (resources/list lists this template, not concrete nodes).' },
    { name: 'node', uriTemplate: 'mcp://provident/node/{nodeId}', group: 'read', mimeType: 'application/json', method: 'nodeState', description: 'A single node\'s resolved state — mirrors provident.get_node_state. The nodeId is validated against the live in-tree graph.' },
  ]

  /** The resource URIs whose group the current gate allows (R1). */
  allowedResourceUris(): string[] {
    return ProvidentMcpServer.ALL_RESOURCES.filter((r) => this._gate.toolAllowed(`resource:${r.uri ?? r.uriTemplate!}`)).map((r) => r.uri ?? r.uriTemplate!)
  }

  applyGatePatch(
    patch: { token?: string | null; groups?: ToolGroup[]; disable?: ToolGroup[] },
  ): SecuritySnapshot {
    this._gate = this._gate.apply(patch)
    // M1 — re-gate the LIVE server (stdio, one long-lived McpServer): toggle
    // the captured RegisteredTool handles so a narrow actually takes effect.
    for (const [name, tool] of this.registered) {
      // U3/F1 (adversarial) — module.install/update + dynamic module:<name>.<tool>
      // tools are trusted-equivalent to `code`: the live re-gate must use the
      // TWO-GATE (module AND code), not the module-only `toolAllowed`. Otherwise
      // disabling `code` would leave them callable by a module-only agent. Both
      // the static `module.` (dot) and dynamic `module:` (colon) prefixes catch.
      const isModuleTool = name.startsWith('module.') || name.startsWith('module:')
      const enabled = isModuleTool
        ? (this._gate.toolAllowed(name) && this._gate.enabled.has('code'))
        : this._gate.toolAllowed(name)
      tool.update({ enabled })
    }
    // R2 — re-gate the captured resource handles the same way.
    for (const [uri, res] of this.resources) {
      res.update({ enabled: this._gate.toolAllowed(`resource:${uri}`) })
    }
    // M1-widen — REGISTER any newly-allowed tools that were not registered
    // before (a widen to a previously-disabled group must make those tools
    // callable on the live server, not only on the next fresh HTTP request).
    // The live server is the stdio server (HTTP builds a fresh server per POST
    // from the current gate, so widening is automatic there).
    const liveServer = this.stdioServer
    if (liveServer) {
      const toAdd = this.allowedToolNames().filter((n) => !this.registered.has(n))
      if (toAdd.length > 0) {
        ProvidentMcpServer.registerTools(liveServer, this.backend, toAdd, this.registered, this.moduleStore, this.router, this.ragStore, this._gate)
      }
      const resToAdd = ProvidentMcpServer.ALL_RESOURCES.filter(
        (r) => this._gate.toolAllowed(`resource:${r.uri ?? r.uriTemplate}`) && !this.resources.has(r.uri ?? r.uriTemplate!),
      )
      if (resToAdd.length > 0) {
        ProvidentMcpServer.registerResources(liveServer, this.backend, resToAdd, this.resources)
      }
    }
    return this._gate.config
  }

  /** M1/M2 accessors (test-visible): register the stdio server (or any server)
   *  so its tools are captured, and query a tool's live enabled state. */
  ensureServerRegistered(): McpServer {
    if (this.stdioServer) return this.stdioServer
    const server = this.createServer()
    this.stdioServer = server
    this.server = server
    return server
  }

  registeredEnabled(name: string): boolean {
    return this.registered.get(name)?.enabled ?? false
  }

  /** R2 test/accessor — the registered resource URIs + template. */
  registeredResources(): Array<{ uri?: string; uriTemplate?: string; enabled: boolean }> {
    const out: Array<{ uri?: string; uriTemplate?: string; enabled: boolean }> = []
    for (const [uri, r] of this.resources) {
      if ('resourceTemplate' in r) {
        out.push({ uriTemplate: String((r as RegisteredResourceTemplate).resourceTemplate.uriTemplate), enabled: r.enabled })
      } else {
        out.push({ uri, enabled: r.enabled })
      }
    }
    return out
  }

  /** R2 test — a resource's live enabled state by URI. */
  resourceEnabled(uri: string): boolean {
    return this.resources.get(uri)?.enabled ?? false
  }

  /** R4/R5 test — invoke a registered resource's read callback by URI.
   *  Returns the underlying Runtime snapshot (JSON-safe). A concrete node URI
   *  resolves to the `{nodeId}` template. */
  async readResource(uri: string): Promise<unknown> {
    let res = this.resources.get(uri)
    let variables: Record<string, string> = {}
    if (!res) {
      const m = /mcp:\/\/provident\/node\/(.+)$/.exec(uri)
      if (m) {
        res = this.resources.get('mcp://provident/node/{nodeId}')
        variables = { nodeId: decodeURIComponent(m[1]) }
      }
    }
    if (!res) throw new Error(`resource not found: ${uri}`)
    const result = 'resourceTemplate' in res
      ? await (res as RegisteredResourceTemplate).readCallback(new URL(uri), variables, undefined as never)
      : await (res as RegisteredResource).readCallback(new URL(uri), undefined as never)
    const contents = (result as { contents?: Array<{ text?: string }> }).contents?.[0]
    if (contents?.text) {
      try {
        return JSON.parse(contents.text)
      } catch {
        return contents.text
      }
    }
    return result
  }

  /** N2 test seam — connect a mock transport to the stdio server so the notify
   *  path's `isConnected()` gate can be exercised without a real stdio session.
   *  Returns the mock transport's recorded sent messages. */
  async connectMockTransport(): Promise<Array<{ method?: string; params?: unknown }>> {
    const sent: Array<{ method?: string; params?: unknown }> = []
    const transport = {
      start: async () => {},
      send: async (msg: { method?: string; params?: unknown }) => { sent.push(msg) },
      close: async () => {},
      onclose: undefined as (() => void) | undefined,
      onerror: undefined as ((e: unknown) => void) | undefined,
      onmessage: undefined as unknown,
    }
    const server = this.ensureServerRegistered()
    await (server as unknown as { connect(t: unknown): Promise<void> }).connect(transport)
    return sent
  }

  /** N2/N5 (live-notification-review.md) — a renderer "app graph changed" push.
   *  Returns `true` if a notification was actually delivered, `false` if it was
   *  a no-op. Guards:
   *  - N2 (stdio-only): the HTTP transport is stateless (a fresh McpServer per
   *    POST, disconnected after the response) — `isConnected()` is false there,
   *    so a notify is a NO-OP (never a hang). Only the long-lived stdio server
   *    delivers.
   *  - N5 (gate-aware): the `resources` capability is present only when a
   *    `read`-group resource is registered. If `read` is off (no resources,
   *    no capability), a notify emits nothing.
   *  - N1 (typed): the notify maps to a per-resource `sendResourceUpdated`
   *    (content change), NOT a tool-list/list-changed (those are applyGatePatch-
   *    only).
   */
  async notifyGraphChanged(): Promise<boolean> {
    // N2 — only the stdio transport is a connected, push-capable session.
    if (this.transport !== 'stdio' || !this.stdioServer?.isConnected()) return false
    // N5 — gate-aware: only emit resource-updated when `read` (the resources'
    // group) is enabled (the capability is present only when resources register).
    if (!this._gate.toolAllowed('resource:mcp://provident/app')) return false
    try {
      await this.stdioServer.server.sendResourceUpdated({ uri: 'mcp://provident/app' })
      return true
    } catch {
      // N2 — a disconnected/failed send is a no-op (never a hang, never a throw
      // that breaks the renderer push path).
      return false
    }
  }

  get gate(): SecurityGate {
    return this._gate
  }

  /** A fresh McpServer wired to the backend, registering ONLY the tools the
   *  gate allows (A1-W5 — the fail-open fix). STATELESS HTTP requires one
   *  server per request (the SDK's canonical stateless pattern). */
  /** A fresh McpServer wired to the backend, registering ONLY the tools the
   *  gate allows (A1-W5 — the fail-open fix). Captures the `RegisteredTool`
   *  handles into `this.registered` (M1) so a later re-gate can toggle them. */
  private createServer(): McpServer {
    const server = new McpServer(
      { name: 'provident-electron', version: '0.1.0' },
      {
        instructions:
          'The Provident-Electron shell: a provident-ssr renderer with full ' +
          'synthetic-event access and rendered-HTML visibility. Drive the demo ' +
          'app by dispatching synthetic events (click/input) on its nodes ' +
          '(target by authored css.id, e.g. "inc"/"dec"/"echo-input", or by ' +
          'nodeId/wire), then read the rendered HTML. The graph is authoritative: ' +
          'a dispatch mutates the producing graph and re-renders both the live ' +
          'DOM and the SSR fragment.',
      },
    )
    ProvidentMcpServer.registerTools(server, this.backend, this.allowedToolNames(), this.registered, this.moduleStore, this.router, this.ragStore, this._gate)
    // R3 — register the gated read-group resources in the SAME server build
    // (serves BOTH the stdio long-lived server and the per-POST HTTP server).
    const allowedResources = ProvidentMcpServer.ALL_RESOURCES.filter((r) => this._gate.toolAllowed(`resource:${r.uri ?? r.uriTemplate!}`))
    ProvidentMcpServer.registerResources(server, this.backend, allowedResources, this.resources)
    return server
  }

  private static registerTools(
    server: McpServer,
    backend: McpBackend,
    allowed: string[],
    registered: Map<string, RegisteredTool>,
    moduleStore: ModuleStore | null,
    router: CapabilityRouter | null,
    ragStore: RagStore | null,
    gate: SecurityGate,
  ): void {
    if (allowed.includes('provident.dispatch')) {
      registered.set('provident.dispatch', server.registerTool('provident.dispatch', {
        title: 'Dispatch a synthetic event',
        description:
          'Dispatch a synthetic event on a node of the producing provident-ssr ' +
          'graph. Target by an authored css.id (e.g. "inc", "dec", "echo-input"), ' +
          'by nodeId, or by wire. The dispatch mutates the graph (the Phase A/B ' +
          'engine entry), awaits the flush, and re-renders; the response includes ' +
          'the contained HandlerResult[], the dirtied node ids, and the fresh ' +
          'rendered HTML (live DOM + SSR fragment). Pass a requestId to make the ' +
          'call idempotent (a duplicate requestId returns the first result).',
        inputSchema: {
          target: z.union([
            z.object({ kind: z.literal('cssId'), cssId: z.string() }),
            z.object({ kind: z.literal('nodeId'), nodeId: z.string() }),
            z.object({ kind: z.literal('wire'), wire: z.string() }),
            z.string(),
          ]).describe('The dispatch target: css.id (ergonomic) or nodeId/wire (authoritative), or a bare string resolved css.id then nodeId'),
          event: z.string().describe('Event name (e.g. "click", "input")'),
          args: z.array(z.unknown()).optional().describe('Structured-clone-safe arguments (args[0] becomes event.value)'),
          requestId: z.string().optional().describe('Idempotency key — duplicate requestIds return the first call\'s result'),
        },
      }, async (args) => {
        const req: DispatchRequest = {
          ...(args.requestId !== undefined ? { requestId: args.requestId } : {}),
          target: args.target,
          event: args.event,
          ...(args.args !== undefined ? { args: args.args } : {}),
        }
        const value = await backend.invoke('dispatch', req)
        return text(value)
      }))
    }

    if (allowed.includes('provident.get_rendered_html')) {
      registered.set('provident.get_rendered_html', server.registerTool('provident.get_rendered_html', {
        title: 'Read the rendered HTML',
        description:
          'Read the current rendered view of the provident-ssr demo: the live ' +
          'DOM innerHTML of the renderer, the SSR fragment re-emitted from the ' +
          'same graph (build-time view), and a node/compile census. Use this to ' +
          'inspect what the app currently displays before/after dispatching events.',
        inputSchema: {},
      }, async () => {
        const value = await backend.invoke('renderedHtml', {})
        return text(value)
      }))
    }

    if (allowed.includes('provident.get_markdown')) {
      registered.set('provident.get_markdown', server.registerTool('provident.get_markdown', {
        title: 'Read the rendered markdown',
        description:
          'Read the current graph as a simplified text-only markdown document ' +
          '(the 0.2 MarkdownAdapter — Feature 2). Non-interactive: on:* and ' +
          'data:* props are dropped, so there is no element-to-node mapping in ' +
          'the markdown output (use get_rendered_html for that). Use this for ' +
          'a compact, agent-friendly summary of what the app currently displays.',
        inputSchema: {},
      }, async () => {
        const value = await backend.invoke('markdown', {})
        return text(value)
      }))
    }

    if (allowed.includes('provident.list_targets')) {
      registered.set('provident.list_targets', server.registerTool('provident.list_targets', {
        title: 'List dispatch targets',
        description:
          'List every node in the producing graph with its authored css.id, ' +
          'props.id, type, state, in-tree flag, content, and declared handlers — ' +
          'the addressable vocabulary for provident.dispatch.',
        inputSchema: {},
      }, async () => {
        const value = await backend.invoke('listTargets', {})
        return text(value)
      }))
    }

    if (allowed.includes('provident.get_node_state')) {
      registered.set('provident.get_node_state', server.registerTool('provident.get_node_state', {
        title: 'Read a node\'s resolved state',
        description:
          'Read the pass-2 resolved compiled states (read-only snapshot) of a ' +
          'node plus the graph census. Target by css.id or nodeId/wire.',
        inputSchema: {
          target: z.union([
            z.object({ kind: z.literal('cssId'), cssId: z.string() }),
            z.object({ kind: z.literal('nodeId'), nodeId: z.string() }),
            z.object({ kind: z.literal('wire'), wire: z.string() }),
            z.string(),
          ]).describe('The node target'),
        },
      }, async (args: { target: unknown }) => {
        const value = await backend.invoke('nodeState', args.target)
        return text(value)
      }))
    }

    // M2 — the graph + code tools are REAL (Unit C): the backend forwards each
    // call to the renderer (or the battery host's runtime) over the invoke
    // seam. They register only when their group is enabled, so the gate's
    // enabled-map and the real registration agree. The `read`-group
    // `code.get`/`code.validate` also register here (they're read-only).
    const graph: Array<{ name: string; description: string; inputSchema: Record<string, z.ZodTypeAny> }> = [
      { name: 'provident.load', description: 'Load an envelope/doc/commands into the graph (battery §3)', inputSchema: { kind: z.enum(['envelope', 'doc', 'commands']).describe('A2 envelope / A1 doc / A3 command array'), envelope: z.unknown().optional(), doc: z.unknown().optional(), commands: z.array(z.unknown()).optional(), userData: z.unknown().optional() } },
      { name: 'provident.op', description: 'Apply a single managed-channel op', inputSchema: { command: z.unknown().describe('the OpCommand payload') } },
      { name: 'provident.export', description: 'Export the graph (legacy or serialized)', inputSchema: { format: z.enum(['legacy', 'serialized']) } },
      { name: 'provident.validate', description: 'Validate an export against a throwaway graph', inputSchema: { kind: z.enum(['legacy', 'serialized']), export: z.unknown() } },
      { name: 'provident.teardown', description: 'Tear the graph down to root-only', inputSchema: {} },
      { name: 'provident.journal', description: 'Drive the engine journal reversibility surface (undo/redo/replay) — mutates the graph and re-renders', inputSchema: { action: z.enum(['undo', 'redo', 'replay']).describe('the journal action: undo inverts the top of the undo stack, redo re-applies the undone op, replay re-runs the journal in order') } },
      { name: 'provident.code.get', description: 'Read the envelope subtree at path', inputSchema: { path: z.string() } },
      { name: 'provident.code.set', description: 'Set the envelope value at path', inputSchema: { path: z.string(), value: z.unknown() } },
      { name: 'provident.code.create', description: 'Append an entry to the envelope array at path', inputSchema: { path: z.string(), entry: z.unknown() } },
      { name: 'provident.code.delete', description: 'Delete an envelope entry at path', inputSchema: { path: z.string(), index: z.number().optional() } },
      { name: 'provident.code.validate', description: 'Schema-validate an envelope without building the graph', inputSchema: { envelope: z.unknown().optional() } },
      { name: 'provident.code.load', description: 'Apply an edited envelope to the live graph', inputSchema: { envelope: z.unknown().optional() } },
      { name: 'provident.code.loadBatch', description: 'Stage N code.* envelope ops and re-derive once (all-or-nothing)', inputSchema: { ops: z.array(z.unknown()).describe('the batch ops: [{op:"set"|"create"|"delete", path, value?/entry?/index?}]') } },
      { name: 'module.install', description: 'Install/update a module in the persisted registry (U3). Same name+version → no-op; same name+different version → rejected unless force:true. Requires module AND code groups (executable entry).', inputSchema: { name: z.string(), source: z.string(), version: z.string().optional(), force: z.boolean().optional() } },
      { name: 'module.update', description: 'Re-load + re-register a module at a new version. Requires module AND code groups.', inputSchema: { name: z.string(), source: z.string(), version: z.string().optional(), force: z.boolean().optional() } },
      { name: 'module.list', description: 'Read-only census of installed modules + versions. Requires module group.', inputSchema: {} },
      // Unit B (docs/specs/unit-b-document-model.md §5.4) — the `rag` (read-only,
      // default-off) + `edit` (mutating, default-off) tool groups. Main-handled
      // against the RAG store; editing is NEVER a `code`-group op.
      { name: 'rag.query', description: 'Retrieve the relevant RAG objects + the coarse line→node map for a query (Unit E implements the retrieval; registered here). Requires rag group.', inputSchema: { query: z.string(), topK: z.number().optional() } },
      { name: 'rag.get_document', description: 'The document\'s RAG nodes/edges (the subtree). Requires rag group.', inputSchema: { documentId: z.string() } },
      { name: 'rag.list_nodes', description: 'A census of RAG nodes (id, type, content preview, ownedNodeIds count). Requires rag group.', inputSchema: {} },
      { name: 'rag.get_edges', description: 'The RAG edges (all, or those touching nodeId). Requires rag group.', inputSchema: { nodeId: z.string().optional() } },
      { name: 'rag.backlinks', description: 'The backlinks to nodeId (Unit G enumerates them; registered here). Requires rag group.', inputSchema: { nodeId: z.string() } },
      { name: 'edit.set_content', description: 'Set a RAG node\'s content (a content op → journaled, no re-traversal). Requires edit group.', inputSchema: { nodeId: z.string(), content: z.string() } },
      { name: 'edit.create_node', description: 'Create a RAG node (a structural op → journaled, re-traversal). Requires edit group.', inputSchema: { type: z.string(), content: z.string(), parentId: z.string().optional(), props: z.record(z.string(), z.unknown()).optional() } },
      { name: 'edit.delete_node', description: 'Delete a RAG node + cascade its edges (structural → re-traversal). Requires edit group.', inputSchema: { nodeId: z.string() } },
      { name: 'edit.split_node', description: 'Split a RAG node at character offset at (structural → re-traversal). Requires edit group.', inputSchema: { nodeId: z.string(), at: z.number() } },
      { name: 'edit.merge_node', description: 'Merge sourceId into targetId (structural → re-traversal). Requires edit group.', inputSchema: { sourceId: z.string(), targetId: z.string() } },
      { name: 'edit.set_edge', description: 'Create/update a RAG edge (structural → re-traversal). order is for doc-child edges; documentIds is for doc-flow edges. Requires edit group.', inputSchema: { kind: z.string(), source: z.string(), target: z.string(), edgeId: z.string().optional(), order: z.number().optional(), documentIds: z.array(z.string()).optional() } },
    ]
    const dispatch = (name: string): string => name.slice('provident.'.length)
    for (const { name, description, inputSchema } of graph) {
      if (!allowed.includes(name)) continue
      registered.set(name, server.registerTool(name, {
        title: name,
        description,
        inputSchema,
      }, async (args: Record<string, unknown>) => {
        // U3 — the module.* tools are MAIN-process (node:fs persisted store),
        // NOT routed to the renderer. They are handled here directly.
        if (name.startsWith('module.')) {
          const before = handleModuleTool(moduleStore, name, args)
          // U9-FIX — after a successful install/update, re-sync the live router
          // so the module's declared tools become callable.
          if (name === 'module.install' || name === 'module.update') {
            if ((before as { status?: string }).status === 'installed' || (before as { status?: string }).status === 'updated') {
              if (moduleStore && router) syncModuleRouter(router, moduleStore)
            }
          }
          return text(before)
        }
        // Unit B — the rag.*/edit.* tools are MAIN-process (the RAG store),
        // NOT routed to the renderer. Editing is NEVER a `code`-group op.
        if (name.startsWith('rag.')) {
          return text(handleRagTool(ragStore, name, args))
        }
        if (name.startsWith('edit.')) {
          // H5 (§5.1.9) — after a successful edit mutation, broadcast the
          // `rag-store-changed` re-traversal trigger to the renderer.
          const result = await handleEditTool(ragStore, name, args, (payload) => {
            backend.broadcast?.('rag-store-changed', payload)
          })
          return text(result)
        }
        const method = dispatch(name)
        const value = await backend.invoke(method, args)
        return text(value)
      }))
    }

    // U9 (M-r3) — register the router's DYNAMIC `module:<name>.<tool>` tools.
    // They are gated by the `module` group (registration) + the invocation
    // two-gate (F1, enforced in invokeTool). Each SDK call routes back through
    // `invokeTool` so the two-gate is checked at EVERY invocation.
    if (router) {
      for (const tool of router.listTools()) {
        if (!allowed.includes(tool)) continue
        if (registered.has(tool)) continue
        registered.set(tool, server.registerTool(tool, {
          title: tool,
          description: `A dynamic module tool (${tool}) — requires module AND code groups (invocation two-gate).`,
          inputSchema: {},
        }, async (args: Record<string, unknown>) => {
          const value = invokeModuleTool(router, gate, tool, args)
          return text(value)
        }))
      }
    }
  }

  /** R1-R3 (mcp-resources-review.md) — register the gated `read`-group
   *  resources. Fixed URIs (`app`, `targets`) + one template
   *  (`node/{nodeId}`). Each read callback forwards over the SAME `backend`
   *  invoke seam the tools use (main → renderer → app Runtime — never the
   *  isolated SecurePanels graph, R4). */
  private static registerResources(
    server: McpServer,
    backend: McpBackend,
    defs: Array<ResourceDef>,
    resources: Map<string, RegisteredResource | RegisteredResourceTemplate>,
  ): void {
    for (const def of defs) {
      if (def.uriTemplate) {
        const template = def.uriTemplate
        const key = template
        resources.set(key, server.resource(
          def.name,
          new ResourceTemplate(template, { list: undefined }),
          {
            title: `provident.${def.name}`,
            description: def.description,
            mimeType: def.mimeType,
          },
          async (uri, variables) => {
            const nodeId = decodeURIComponent(String(variables?.nodeId ?? ''))
            const value = await backend.invoke('nodeState', nodeId)
            return { contents: [{ uri: uri.href, text: JSON.stringify(value, null, 2), mimeType: def.mimeType }] }
          },
        ) as RegisteredResourceTemplate)
      } else {
        const uri = def.uri!
        resources.set(uri, server.registerResource(
          def.name,
          uri,
          { title: `provident.${def.name}`, description: def.description, mimeType: def.mimeType },
          async (u) => {
            const value = await backend.invoke(def.method, {})
            return { contents: [{ uri: u.href, text: JSON.stringify(value, null, 2), mimeType: def.mimeType }] }
          },
        ) as RegisteredResource)
      }
    }
  }

  async start(): Promise<void> {
    if (this.transport === 'stdio') {
      const server = this.createServer()
      this.server = server
      this.stdioServer = server
      const transport = new StdioServerTransport()
      await server.connect(transport)
      console.error('[provident-mcp] stdio transport ready')
      return
    }
    // http — Streamable HTTP on 127.0.0.1:<port>/mcp. STATELESS: the SDK
    // requires a FRESH server + transport per request (reusing either across
    // requests throws — message ID collisions). Each POST builds its own
    // McpServer + transport, connects, and handles; GET/DELETE → 405 (the
    // SDK's canonical stateless example — responses flow through each POST).
    this.httpServer = createServer((req, res) => {
      void this.handleHttp(req, res)
    })
    await new Promise<void>((resolve) => this.httpServer!.listen(this.port, '127.0.0.1', () => resolve()))
    console.error(`[provident-mcp] http transport ready on http://127.0.0.1:${this.port}/mcp`)
  }

  private async handleHttp(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    console.error(`[provident-mcp] http ${req.method} ${url.pathname}`)
    if (url.pathname !== '/mcp') {
      res.writeHead(404)
      res.end('not found')
      return
    }
    if (req.method === 'GET' || req.method === 'DELETE') {
      res.writeHead(405, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null }))
      return
    }
    if (req.method !== 'POST') {
      res.writeHead(405)
      res.end('method not allowed')
      return
    }
    // A1-W5 — the HTTP token gate: reject BEFORE any tool runs (fail-closed).
    if (!this._gate.checkRequest(req.headers as never).ok) {
      res.writeHead(401, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32001, message: 'Unauthorized' }, id: null }))
      return
    }
    const server = this.createServer()
    this.httpServers.add(server)
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    let body: unknown
    try {
      body = await readBody(req)
      await server.connect(transport)
      await transport.handleRequest(req, res, body)
    } catch (e) {
      const msg = e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e)
      console.error(`[provident-mcp] http error: ${msg}`)
      try {
        res.writeHead(500)
        res.end('internal error')
      } catch {
        // response may already be committed
      }
    } finally {
      res.on('close', () => {
        this.httpServers.delete(server)
        void server.close().catch(() => undefined)
        void transport.close().catch(() => undefined)
      })
    }
  }

  async close(): Promise<void> {
    await Promise.allSettled([...this.httpServers].map((s) => s.close()))
    this.httpServers.clear()
    if (this.server) {
      try {
        await this.server.close()
      } catch {
        // already closed
      }
    }
    if (this.httpServer) {
      await new Promise<void>((resolve) => this.httpServer!.close(() => resolve()))
      this.httpServer = null
    }
  }
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) return resolve(undefined)
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

/** The main process's bridge: forwards MCP tool invocations to the renderer
 *  over IPC and returns the awaited reply. Requests are queued until the
 *  renderer signals readiness.
 *
 *  A2/A6 hardening (docs/specs/renderer-backend-hardening.md): a readiness
 *  timeout (never hang forever waiting for the renderer), a per-request
 *  timeout (never hang forever waiting for a reply), a reload/destroy re-arm
 *  (a `did-finish-load`/`closed`/`destroyed` rejects all in-flight `pending` +
 *  re-arms the readiness gate), and a bounded/digest large-payload guard (a
 *  `renderedHtml`/`ssrHtml` over `largePayloadBytes` is returned as a census +
 *  hash64 digest + truncated preview, NOT the full fragment). */
export interface RendererBackendOptions {
  readyTimeoutMs?: number
  invokeTimeoutMs?: number
  largePayloadBytes?: number
}

/** A minimal webContents/window event-target shape (so the backend is testable
 *  without a real Electron import — the fake in the tests implements it). */
interface WebContentsLike {
  on(event: string, cb: (...args: unknown[]) => void): void
  send(channel: string, msg: unknown): void
  isDestroyed(): boolean
}
interface WindowLike {
  on(event: string, cb: (...args: unknown[]) => void): void
  webContents: WebContentsLike
  isDestroyed(): boolean
}

export class RendererBackend implements McpBackend {
  private readyTimeoutMs: number
  private invokeTimeoutMs: number
  private largePayloadBytes: number
  private resolveReady: (() => void) | null = null
  private rejectReady: ((e: Error) => void) | null = null
  private readyPromise: Promise<void>
  private ready = false
  /** F1 — the INITIAL load's `did-finish-load` is not a reload; only after the
   *  first arm does a subsequent `did-finish-load` count as a reload. */
  private firstLoadSeen = false
  private seq = 0
  private readonly pending = new Map<number, {
    resolve: (v: unknown) => void
    reject: (e: Error) => void
    timer: ReturnType<typeof setTimeout>
  }>()
  private window: WindowLike | null = null

  constructor(opts: RendererBackendOptions = {}) {
    this.readyTimeoutMs = opts.readyTimeoutMs ?? 30000
    this.invokeTimeoutMs = opts.invokeTimeoutMs ?? 60000
    this.largePayloadBytes = opts.largePayloadBytes ?? 1_000_000
    this.readyPromise = this.newReadyPromise()
  }

  private newReadyPromise(): Promise<void> {
    const p = new Promise<void>((resolve, reject) => {
      this.resolveReady = resolve
      this.rejectReady = reject
    })
    // A2-harden: the gate's rejection must never be UNHANDLED when no `invoke`
    // is awaiting it (e.g. a reset with no in-flight readiness await). Mark it
    // handled so the engine does not emit an unhandledRejection; `invoke`'s
    // `Promise.race` still observes the original rejection.
    p.catch(() => undefined)
    return p
  }

  attachWindow(win: WindowLike): void {
    this.window = win
    // A2 — a reload (did-finish-load) or a close/destroy re-arms the backend:
    // reject all in-flight pending + reset the readiness gate. F1: the FIRST
    // did-finish-load is the initial load, not a reload — skip it. F6: ignore
    // resets from a window that is no longer the attached one (a re-attach
    // replaces the window; the old window's lingering close must not reset).
    const rearm = (reason: string) => {
      if (win !== this.window) return
      if (reason === 'renderer reloaded (pending cleared)' && !this.firstLoadSeen) {
        this.firstLoadSeen = true
        return
      }
      this.handleReset(reason)
    }
    win.webContents.on('did-finish-load', () => rearm('renderer reloaded (pending cleared)'))
    win.on('closed', () => rearm('renderer window destroyed'))
    win.on('destroyed', () => rearm('renderer window destroyed'))
  }

  /** A2/A6 test seam — whether the renderer has signaled readiness. */
  isReady(): boolean {
    return this.ready
  }

  /** A2/A6 test seam — the number of in-flight requests. */
  pendingCount(): number {
    return this.pending.size
  }

  markReady(): void {
    if (this.ready) return
    this.ready = true
    this.resolveReady?.()
  }

  /** H5 (§5.1.9) — broadcast a main→renderer event (e.g. the `rag-store-changed`
   *  re-traversal trigger) to the attached window's webContents. A no-op when
   *  no window is attached or it is destroyed. */
  broadcast(channel: string, msg: unknown): void {
    const win = this.window
    if (!win || win.isDestroyed()) return
    try {
      win.webContents.send(channel, msg)
    } catch {
      // renderer window destroyed between the check and the send — ignore
    }
  }

  /** Reject all in-flight pending + reset the readiness gate (a fresh
   *  `readyPromise` so the next `markReady` re-arms). Used on reload/destroy.
   *  F2/F7 — the OLD `readyPromise` is REJECTED so a caller awaiting it is
   *  released (not stranded on a stale closure). */
  private handleReset(reason: string): void {
    for (const [, entry] of this.pending) {
      clearTimeout(entry.timer)
      entry.reject(new Error(reason))
    }
    this.pending.clear()
    this.ready = false
    // release any awaiter on the current gate with the reset reason
    this.rejectReady?.(new Error(reason))
    this.readyPromise = this.newReadyPromise()
  }

  async invoke(method: string, payload: unknown): Promise<unknown> {
    // A6 — readiness gate with a timeout (never hang forever before ready).
    let readyTimer: ReturnType<typeof setTimeout> | undefined
    if (!this.ready) {
      try {
        await Promise.race([
          this.readyPromise,
          new Promise<never>((_resolve, reject) => {
            readyTimer = setTimeout(() => reject(new Error(`renderer not ready (timeout ${this.readyTimeoutMs}ms)`)), this.readyTimeoutMs)
          }),
        ])
      } finally {
        if (readyTimer) clearTimeout(readyTimer)
      }
    }
    const win = this.window
    if (!win || win.isDestroyed()) throw new Error('renderer window unavailable')
    const id = ++this.seq
    const req: RpcRequest = { id, method: method as never, payload }
    // A2 — per-request timeout (never hang forever waiting for a reply).
    const result = new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(
        () => {
          if (this.pending.delete(id)) reject(new Error(`renderer invoke timeout (${this.invokeTimeoutMs}ms)`))
        },
        this.invokeTimeoutMs,
      )
      this.pending.set(id, { resolve, reject, timer })
    })
    // F4 — a destroy between the check and the send throws on a destroyed
    // webContents; catch it + clean the pending entry + rethrow a spec-shaped
    // error (never a dangling entry / a bare 'Object has been destroyed').
    try {
      win.webContents.send('provident:invoke', req)
    } catch (e) {
      const entry = this.pending.get(id)
      if (entry) {
        clearTimeout(entry.timer)
        this.pending.delete(id)
      }
      throw new Error('renderer window destroyed')
    }
    return result
  }

  handleReply(reply: RpcReply): void {
    const entry = this.pending.get(reply.id)
    if (!entry) return
    this.pending.delete(reply.id)
    clearTimeout(entry.timer)
    if (reply.ok) entry.resolve(this.maybeDigest(reply.value))
    else entry.reject(new Error(reply.error ?? 'renderer error'))
  }

  /** A2 — replace an oversized `renderedHtml`/`ssrHtml` result with a census +
   *  hash64 digest + truncated preview (mirror the battery's census+hash64
   *  shape). The full payload is NOT serialized over IPC. */
  private maybeDigest(value: unknown): unknown {
    if (value === null || typeof value !== 'object') return value
    const v = value as { renderedHtml?: unknown; ssrHtml?: unknown; census?: unknown; content?: Array<{ type?: string; data?: string }> }
    const rh = typeof v.renderedHtml === 'string' ? v.renderedHtml : ''
    const sh = typeof v.ssrHtml === 'string' ? v.ssrHtml : ''
    const size = rh.length + sh.length
    // H2 (adversarial) — also bound a large IMAGE content block (base64 data)
    // so it does not cross the IPC boundary unbounded (M-r4).
    const content = v.content
    let imageSize = 0
    if (Array.isArray(content)) {
      for (const c of content) {
        if (c && typeof c.data === 'string') imageSize += c.data.length
      }
    }
    if (size + imageSize <= this.largePayloadBytes) return value
    if (imageSize > 0) {
      return {
        digest: hash64(content!.map((c) => (c && typeof c.data === 'string' ? c.data : '')).join('\u0000')),
        truncated: true,
      }
    }
    const preview = rh.slice(0, 512)
    return {
      census: v.census ?? null,
      digest: hash64(rh + '\u0000' + sh),
      preview,
      truncated: true,
    }
  }

  /** U5 (M-r4) — bound a large IMAGE payload (base64 data) so it does not cross
   *  the IPC boundary unbounded. A payload over `largePayloadBytes` is returned
   *  as a digest + truncated flag, never the raw base64. Exposed for tests. */
  maybeDigestForTest(value: unknown): unknown {
    if (value === null || typeof value !== 'object') return value
    const v = value as { content?: Array<{ type?: string; data?: string }> }
    const content = v.content
    if (!Array.isArray(content)) return value
    let total = 0
    for (const c of content) {
      if (c && typeof c.data === 'string') total += c.data.length
    }
    if (total <= this.largePayloadBytes) return value
    return {
      digest: hash64(content.map((c) => (c && typeof c.data === 'string' ? c.data : '')).join('\u0000')),
      truncated: true,
    }
  }
}

/** Deterministic FNV-1a 64-bit hash (the upstream hash64 — mirrors Runtime's). */
function hash64(str: string): string {
  let h = 0xcbf29ce484222325n
  for (let i = 0; i < str.length; i += 1) {
    h ^= BigInt(str.charCodeAt(i))
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn
  }
  return h.toString(16).padStart(16, '0')
}