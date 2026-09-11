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
import { IPC_RAG_STORE_CHANGED, IPC_TEMPLATE_CHANGED, type TemplateChangedPayload, type RagDocHeadsPayload, type RagStoreChangedPayload, type RagStoreLoadStatus, type RagStoreListingEntry, type RagStoreListingPayload, type RagStoreManageRequest, type RagStoreManageResult, type RagStoreManageOp } from '../shared/types.js'
import { SecurityGate, type ToolGroup, moduleToolAllowed } from './security.js'
import type { ModuleStore } from './module-store.js'
import type { RagStore } from './rag-store.js'
import { computeDocumentSubgraph } from './traversal.js'
import { validateTemplate } from './template-shape.js'
import type { TemplateStore, ContentWindowTemplate } from './template-store.js'
import { setContent, createNode, deleteNode, splitNode, mergeNode, setEdge } from './edit-ops.js'
import { importMarkdownCorpus } from './markdown-import.js'
import { enumerateLinks, type BacklinkResult } from './backlinks.js'
import { createLexicalIndex, createLexicalEmbedder, createRetrieval, qualifyStoreResult } from './retrieval.js'
import type { RetrievalEngine, RagQueryFilters } from './retrieval.js'
import type { QueryAuditLog } from './query-audit.js'
import { mergeStoreResults, type StoreResultInput } from './merge-store-results.js'
import { resolveStoreArg, type RagStoreDirectory } from './rag-store-directory.js'
import type { RagStoreRuntimeController } from './rag-store-runtime.js'
import type { CapabilityRouter } from '../renderer/extensions.js'
// Unit GN-MCP-UI (docs/specs/unit-gn-mcp-ui-wiring.md §5.1/§5.3) — the LANDED
// createEngineRagStore proxy: the `gnosis.*` tools route in MAIN against it.
import type { EngineRagStore, EngineRagQueryOptions, RagChunk } from './engine-rag-store.js'
import type { HealthReport } from './engine-rag-store.js'
// Unit A2 (docs/specs/unit-a2-document-crud-wiring.md §5.1/§5.3) — the LANDED
// createEngineCrudRagStore proxy (the 11 §4.1 document-CRUD methods over the
// frozen P1a wire): the `gnosis.document.*`/`gnosis.wiki.*` tools route in MAIN
// against it. Plus the shell-side AuthorityStore (H3) + the caller-side
// IdempotencyRegistry (P4).
import type { EngineCrudRagStore, Document, DocumentList, Wiki, CreateDocumentRequest, UpdateDocumentRequest, ListDocumentsFilter, Graph } from './engine-crud-rag-store.js'
import type { AuthorityStore } from './authority-store.js'
import type { IdempotencyRegistry } from './idempotency-registry.js'

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
 *  unit testing.
 *
 *  F1 — the retrieval ENGINE is created ONCE in main and passed in; `rag.query`
 *  uses that maintained engine (index reconciled on `rag-store-changed`) and
 *  does NOT rebuild the whole index per call. A fresh engine is built ONLY as a
 *  direct-call fallback (when no engine is passed — unit tests / non-wired
 *  callers).
 *
 *  U-MS2 (docs/specs/unit-ms2-store-wiring.md §5.3) — the OPTIONAL `store`
 *  selector resolved FIRST (R1): the resolution call sits between the
 *  (unchanged) null-store guard and the per-tool `switch`, so an unknown
 *  `store` fails before ANY tool-specific validation throw and before ANY
 *  store method call / side effect. With a directory injected it is the SINGLE
 *  SOURCE OF TRUTH: the passed `store`/`engine` params are IGNORED (they exist
 *  for the legacy directory-less path and the wired server passes the default
 *  entry's objects anyway). `dir == null` (the legacy sentinel) keeps today's
 *  byte-equal behavior. The `rag.query` result additionally carries the F3
 *  additive `store` field — stamped HERE, the ONE stamp point shared by the
 *  MCP `rag.query` tool and the `rag-query` IPC (both route through this
 *  handler — MCP-UI-EQUIVALENCE): the addressed entry's registry name, or ''
 *  for the legacy directory-less sentinel (§5.9). */
/** Unit X §5.8 — validate the `filters` arg shape for the `rag.query`/
 *  `rag-stream` tools. Throws `Error('rag.query: filters malformed')` on a
 *  malformed shape (a non-object, a `nodeKind`/`edgeType`/`state` outside the
 *  closed union, or a `target` missing `documentId`/`nodeId`). */
function validateRagQueryFilters(filters: unknown): void {
  if (filters === null || typeof filters !== 'object' || Array.isArray(filters)) {
    throw new Error('rag.query: filters malformed')
  }
  const f = filters as Record<string, unknown>
  if (f.nodeKind !== undefined && !['content', 'fact', 'reference'].includes(f.nodeKind as string)) {
    throw new Error('rag.query: filters malformed')
  }
  if (f.edgeType !== undefined && !['link', 'embed'].includes(f.edgeType as string)) {
    throw new Error('rag.query: filters malformed')
  }
  if (f.state !== undefined && !['FRESH', 'RESOLVED', 'STALE', 'BROKEN'].includes(f.state as string)) {
    throw new Error('rag.query: filters malformed')
  }
  if (f.target !== undefined) {
    if (f.target === null || typeof f.target !== 'object' || Array.isArray(f.target)) {
      throw new Error('rag.query: filters malformed')
    }
    const t = f.target as Record<string, unknown>
    if (typeof t.documentId !== 'string' || typeof t.nodeId !== 'string') {
      throw new Error('rag.query: filters malformed')
    }
  }
}

export async function handleRagTool(
  store: RagStore | null,
  name: string,
  args: Record<string, unknown>,
  engine?: RetrievalEngine | null,
  dir?: RagStoreDirectory | null,
  auditLog?: QueryAuditLog | null,
): Promise<unknown> {
  if (!store) throw new Error(`${name}: no rag store configured`)
  // U-F3 §5.2 A-F3 — Guard 1 (the `store`/`stores` mutual exclusion) fires
  // FIRST, BEFORE `resolveStoreArg`'s unknown-store M2 throw (arbitration) and
  // before ANY engine call — for BOTH `rag.query` and `rag-stream`. In the
  // `rag-stream` case it surfaces as the spec §5.8 error chunk (the stream
  // validation errors carry the `rag.query:` literal), not an MCP tool error.
  if ((name === 'rag.query' || name === 'rag-stream') && args.store !== undefined && args.stores !== undefined) {
    if (name === 'rag-stream') {
      return [{ type: 'error', error: 'rag.query: store and stores are mutually exclusive' }]
    }
    throw new Error('rag.query: store and stores are mutually exclusive')
  }
  // U-MS2 §5.3 step 2 — resolve FIRST (before every tool-specific validation
  // throw and before ANY store method call / side effect — R1).
  const ref = resolveStoreArg(name, args?.store, dir)
  // §5.3 step 3 — the addressed entry: with a directory injected it is the
  // single source of truth (M3 already guaranteed the default exists).
  const entry = ref === null ? null : dir!.entries.get(ref.name)!
  const target = entry ? entry.store : store
  switch (name) {
    case 'rag.query': {
      // Unit E + Unit X — the retrieval entry point. Validates the zod input
      // ({ query, topK?, mode?, maxHops?, expand?, maxParentContext?, filters? }),
      // then calls the extended `ragQuery` (the SAME module the UI `rag-query`
      // IPC calls — §8.2 MCP/UI equivalence). ASYNC (Unit F amendment).
      const query = typeof args.query === 'string' ? args.query : ''
      if (query.trim() === '') throw new Error('rag.query: query must be a non-empty string')
      const topK = args.topK !== undefined ? args.topK : 5
      if (typeof topK !== 'number' || !Number.isInteger(topK) || topK < 1 || topK > 50) {
        throw new Error('rag.query: topK must be an integer in [1, 50]')
      }
      const mode = args.mode !== undefined ? args.mode : 'flat'
      if (mode !== 'flat' && mode !== 'graph') throw new Error('rag.query: mode must be "flat" or "graph"')
      const maxHops = args.maxHops !== undefined ? args.maxHops : 3
      if (typeof maxHops !== 'number' || !Number.isInteger(maxHops) || maxHops < 1 || maxHops > 5) {
        throw new Error('rag.query: maxHops must be an integer in [1, 5]')
      }
      const expand = args.expand !== undefined ? args.expand : 'none'
      if (expand !== 'none' && expand !== 'parent') throw new Error('rag.query: expand must be "none" or "parent"')
      const maxParentContext = args.maxParentContext !== undefined ? args.maxParentContext : 5
      if (typeof maxParentContext !== 'number' || !Number.isInteger(maxParentContext) || maxParentContext < 1) {
        throw new Error('rag.query: maxParentContext must be a positive integer')
      }
      if (args.filters !== undefined) validateRagQueryFilters(args.filters)
      // U-F3 §5.2 A-F3/D4 — Guards 2/3/4 (the `stores:"all"` guards). Guard 1
      // (mutual exclusion) already fired at the top. Guards 2/3/4 evaluate in
      // order after the field-type checks they depend on (the flat-only guard
      // compares a VALID `mode`).
      if (args.stores !== undefined && args.stores !== 'all') {
        throw new Error('rag.query: stores must be "all"')
      }
      if (args.stores === 'all' && dir == null) {
        throw new Error('rag.query: stores:"all" requires a configured store registry')
      }
      if (args.stores === 'all' && mode === 'graph') {
        throw new Error('rag.query: stores:"all" is only valid in flat mode')
      }
      // U-F3 §5.3 — the `stores:"all"` fan-out. Runs INSTEAD of the single-store
      // engine call. The guards above already passed (flat mode, dir != null).
      if (args.stores === 'all') {
        // Step 1 — query every entry in canonical (registry insertion) order. A
        // failed-corrupt store's engine throwing is SKIPPED (D6 — { name,
        // result: null }); an empty store contributes zero items naturally.
        const perStore: StoreResultInput[] = []
        for (const [name, centry] of dir!.entries) {
          try {
            const res = await centry.engine.query(query, {
              k: topK,
              mode: 'flat',
              maxHops,
              expand: expand as 'none' | 'parent',
              maxParentContext,
              filters: args.filters as RagQueryFilters | undefined,
            })
            perStore.push({ name, result: res })
          } catch {
            perStore.push({ name, result: null })
          }
        }
        // Step 2 — merge. `mergeStoreResults` consumes default-first (index 0 is
        // the default store). REORDER the canonical array so the default entry is
        // first; the other entries stay in canonical order.
        const defaultIdx = perStore.findIndex((s) => s.name === dir!.defaultName)
        const mergeStores: StoreResultInput[] = [...perStore]
        if (defaultIdx > 0) {
          const [def] = mergeStores.splice(defaultIdx, 1)
          mergeStores.unshift(def)
        }
        const merged = mergeStoreResults(mergeStores, { topK })
        // Step 3 — qualify (U-F2): stamp per-item/per-entry `store` + build
        // `storeContexts` (default-first), `{ qualified: true }`.
        const qualified = qualifyStoreResult(merged, mergeStores, { qualified: true })
        // Step 4 — audit (§5.4): ONE entry, merged count, canonical-order store
        // names, mode 'flat'. skip when auditLog null/absent (no throw).
        if (auditLog) {
          auditLog.record({
            query,
            filters: (args.filters as RagQueryFilters) ?? null,
            mode: 'flat',
            resultCount: merged.results.length,
            timestamp: new Date().toISOString(),
            requester: 'mcp',
            stores: [...dir!.entries.keys()],
          })
        }
        // Step 5 — stamp + return. `ref.name` is the default entry's registry
        // name (guard 1 already enforced `store` absent ⇒ S1 resolves default).
        return { ...qualified, store: ref?.name ?? '' }
      }
      // Unit X — the extended retrieval entry point (the SAME module the UI
      // `rag-query` IPC calls — §8.2 MCP/UI equivalence). Uses the MAINTAINED
      // engine (F1 — no per-call index rebuild): the addressed entry's engine,
      // or the passed engine, or a fresh engine as a direct-call fallback. The
      // engine's `query` returns the extended RagResult (citations/trace/
      // blockedBy/results/engine + the preserved ranked/context/markdown/
      // lineMap/k).
      const e = entry ? entry.engine : (engine ?? createRetrieval(target, createLexicalEmbedder(createLexicalIndex(target.listNodes()))))
      const result = await e.query(query, {
        k: topK,
        mode: mode as 'flat' | 'graph',
        maxHops,
        expand: expand as 'none' | 'parent',
        maxParentContext,
        filters: args.filters as RagQueryFilters | undefined,
      })
      // Unit X §5.7 — record the call in the shared audit log (skip when
      // null/absent — no throw).
      if (auditLog) {
        auditLog.record({
          query,
          filters: (args.filters as RagQueryFilters) ?? null,
          mode: mode as 'flat' | 'graph',
          resultCount: result.results.length,
          timestamp: new Date().toISOString(),
          requester: 'mcp',
        })
      }
      // U-MS2 §5.9 F3 — the ONE additive query-RESULT field (`store`), stamped
      // HERE at the shared-handler seam (the engine's RetrievalResult is
      // store-name-blind; the public tool result carries the addressed entry's
      // registry name, '' for the legacy directory-less sentinel — §5.9).
      return { ...result, store: ref?.name ?? '' }
    }
    case 'rag-stream': {
      // Unit X §5.8 — the degenerate stream tool. Same input schema + same
      // validation as `rag.query`; runs the SAME `ragQuery` and returns
      // [{ type: 'result', result }, { type: 'done' }], or
      // [{ type: 'error', error: <message> }] on a fail-state. F-X-3 — the
      // VALIDATION fail-states (empty query, bad topK/mode/maxHops/expand/
      // maxParentContext/filters) are INSIDE the try, so EVERY fail-state
      // returns the spec §5.8-mandated [{ type: 'error', error: <message> }]
      // chunk (the same `rag.query:`-prefixed message) rather than surfacing as
      // an MCP tool error.
      try {
        const query = typeof args.query === 'string' ? args.query : ''
        if (query.trim() === '') throw new Error('rag.query: query must be a non-empty string')
        const topK = args.topK !== undefined ? args.topK : 5
        if (typeof topK !== 'number' || !Number.isInteger(topK) || topK < 1 || topK > 50) {
          throw new Error('rag.query: topK must be an integer in [1, 50]')
        }
        const mode = args.mode !== undefined ? args.mode : 'flat'
        if (mode !== 'flat' && mode !== 'graph') throw new Error('rag.query: mode must be "flat" or "graph"')
        const maxHops = args.maxHops !== undefined ? args.maxHops : 3
        if (typeof maxHops !== 'number' || !Number.isInteger(maxHops) || maxHops < 1 || maxHops > 5) {
          throw new Error('rag.query: maxHops must be an integer in [1, 5]')
        }
        const expand = args.expand !== undefined ? args.expand : 'none'
        if (expand !== 'none' && expand !== 'parent') throw new Error('rag.query: expand must be "none" or "parent"')
        const maxParentContext = args.maxParentContext !== undefined ? args.maxParentContext : 5
        if (typeof maxParentContext !== 'number' || !Number.isInteger(maxParentContext) || maxParentContext < 1) {
          throw new Error('rag.query: maxParentContext must be a positive integer')
        }
        if (args.filters !== undefined) validateRagQueryFilters(args.filters)
        // U-F3 §5.2 A-F3/D4 — Guards 2/3/4 (Guard 1 mutual exclusion already
        // fired at the top). INSIDE the try ⇒ every guard surfaces as the spec
        // §5.8 error chunk.
        if (args.stores !== undefined && args.stores !== 'all') {
          throw new Error('rag.query: stores must be "all"')
        }
        if (args.stores === 'all' && dir == null) {
          throw new Error('rag.query: stores:"all" requires a configured store registry')
        }
        if (args.stores === 'all' && mode === 'graph') {
          throw new Error('rag.query: stores:"all" is only valid in flat mode')
        }
        // U-F3 §5.5 — the `rag-stream` fan-out (A-F4), the SAME wiring as the
        // `rag.query` case. Returns the degenerate stream with the merged +
        // qualified `RagResult` as the `result` chunk (NO top-level `store`).
        if (args.stores === 'all') {
          const perStore: StoreResultInput[] = []
          for (const [sname, centry] of dir!.entries) {
            try {
              const res = await centry.engine.query(query, {
                k: topK,
                mode: 'flat',
                maxHops,
                expand: expand as 'none' | 'parent',
                maxParentContext,
                filters: args.filters as RagQueryFilters | undefined,
              })
              perStore.push({ name: sname, result: res })
            } catch {
              perStore.push({ name: sname, result: null })
            }
          }
          const defaultIdx = perStore.findIndex((s) => s.name === dir!.defaultName)
          const mergeStores: StoreResultInput[] = [...perStore]
          if (defaultIdx > 0) {
            const [def] = mergeStores.splice(defaultIdx, 1)
            mergeStores.unshift(def)
          }
          const merged = mergeStoreResults(mergeStores, { topK })
          const qualified = qualifyStoreResult(merged, mergeStores, { qualified: true })
          if (auditLog) {
            auditLog.record({
              query,
              filters: (args.filters as RagQueryFilters) ?? null,
              mode: 'flat',
              resultCount: merged.results.length,
              timestamp: new Date().toISOString(),
              requester: 'mcp',
              stores: [...dir!.entries.keys()],
            })
          }
          return [{ type: 'result', result: qualified }, { type: 'done' }]
        }
        // Unit X — the SAME maintained-engine `e.query` call as `rag.query` (F1 —
        // no per-call index rebuild).
        const e = entry ? entry.engine : (engine ?? createRetrieval(target, createLexicalEmbedder(createLexicalIndex(target.listNodes()))))
        const result = await e.query(query, {
          k: topK,
          mode: mode as 'flat' | 'graph',
          maxHops,
          expand: expand as 'none' | 'parent',
          maxParentContext,
          filters: args.filters as RagQueryFilters | undefined,
        })
        if (auditLog) {
          auditLog.record({
            query,
            filters: (args.filters as RagQueryFilters) ?? null,
            mode: mode as 'flat' | 'graph',
            resultCount: result.results.length,
            timestamp: new Date().toISOString(),
            requester: 'mcp',
          })
        }
        return [{ type: 'result', result }, { type: 'done' }]
      } catch (e) {
        return [{ type: 'error', error: e instanceof Error ? e.message : String(e) }]
      }
    }
    case 'get_query_audit_log':
      // Unit X §5.7 — read the shared audit log (empty when null/absent).
      return { entries: auditLog ? auditLog.list() : [] }
    case 'rag.get_document': {
      // L4 — the document-subtree scoping (the tool description's "The
      // document's RAG nodes/edges (the subtree)"). Returns ONLY the requested
      // document's nodes/edges, NOT the whole store. The document's node set +
      // scoped edges come from `computeDocumentSubgraph` — the SINGLE shared
      // derivation used by BOTH the scoped `buildTraversal` walk AND this MCP
      // tool (amendment 2, §5.2), so the traversal and the MCP contract cannot
      // diverge. The `{ documentId, nodes, edges }` return contract is preserved
      // (amendment 6, §5.3).
      const documentId = typeof args.documentId === 'string' ? args.documentId : ''
      if (documentId === '') throw new Error('rag.get_document: documentId required')
      const subgraph = computeDocumentSubgraph(target, documentId)
      const nodes = target.listNodes().filter((n) => subgraph.docNodeIds.has(n.id))
      return { documentId, nodes, edges: subgraph.edges }
    }
    case 'rag.list_nodes':
      return target.listNodes().map((n) => ({ id: n.id, type: n.type, content: n.content.slice(0, 80), ownedNodeIds: n.ownedNodeIds.length }))
    case 'rag.get_edges': {
      const nodeId = typeof args.nodeId === 'string' ? args.nodeId : undefined
      const edges = target.listEdges()
      if (nodeId === undefined) return edges
      return edges.filter((e) => e.source === nodeId || e.target === nodeId)
    }
    case 'rag.backlinks': {
      // Unit G — the FULL handler. Validates nodeId, then calls the SAME
      // host-side enumeration (`enumerateLinks`, §5.3) as the `rag-backlinks`
      // IPC (MCP/UI equivalence — §8.2 a BINDING constraint). Returns the
      // `BacklinkResult` (JSON-serializable).
      const nodeId = typeof args.nodeId === 'string' ? args.nodeId : ''
      if (nodeId === '') throw new Error('rag.backlinks: nodeId required')
      return enumerateLinks(target, nodeId)
    }
    default:
      throw new Error(`unknown rag tool: ${name}`)
  }
}

/** Unit GN-MCP-UI §5.3 — validate the `filters` arg shape for the `gnosis.*`
 *  tools (the SAME shape checks as `rag.query`, with the gnosis tool's own
 *  name prefix on the throw message). */
function validateGnosisFilters(filters: unknown, prefix: string): void {
  if (filters === null || typeof filters !== 'object' || Array.isArray(filters)) {
    throw new Error(`${prefix}: filters malformed`)
  }
  const f = filters as Record<string, unknown>
  if (f.nodeKind !== undefined && !['content', 'fact', 'reference'].includes(f.nodeKind as string)) {
    throw new Error(`${prefix}: filters malformed`)
  }
  if (f.edgeType !== undefined && !['link', 'embed'].includes(f.edgeType as string)) {
    throw new Error(`${prefix}: filters malformed`)
  }
  if (f.state !== undefined && !['FRESH', 'RESOLVED', 'STALE', 'BROKEN'].includes(f.state as string)) {
    throw new Error(`${prefix}: filters malformed`)
  }
  if (f.target !== undefined) {
    if (f.target === null || typeof f.target !== 'object' || Array.isArray(f.target)) {
      throw new Error(`${prefix}: filters malformed`)
    }
    const t = f.target as Record<string, unknown>
    if (typeof t.documentId !== 'string' || typeof t.nodeId !== 'string') {
      throw new Error(`${prefix}: filters malformed`)
    }
  }
}

/** Unit GN-MCP-UI §5.3 + Unit A2 §5.3 — handle a `gnosis.*` tool in MAIN. The
 *  retrieval trio (`gnosis.query`/`gnosis.stream`/`gnosis.status`) route against
 *  the LANDED `EngineRagStore` proxy (`engine`); the 11 document/wiki tools
 *  route against the LANDED `EngineCrudRagStore` proxy (`engineCrud`). The
 *  mutating document/wiki tools resolve the caller's edit-authority credential
 *  from the `AuthorityStore` and thread it into the mutating args' `caller`
 *  field; the mutating create tools dedup via the `IdempotencyRegistry`.
 *  Exported for direct unit testing. The gnosis tools are NOT routed to the
 *  renderer (the proxies are main-process). `gnosis.query`/`gnosis.stream`
 *  record to the shared audit log (like `rag.query`); `gnosis.status` is
 *  read-only and does NOT record; the CRUD tools do NOT record to the audit log
 *  (the `QueryAuditLog` is query-specific — the CRUD security surface is the
 *  group gate + the RBAC caller check, §5.3). */
export async function handleGnosisTool(
  engine: EngineRagStore | null,
  name: string,
  args: Record<string, unknown>,
  auditLog?: QueryAuditLog | null,
  engineCrud?: EngineCrudRagStore | null,
  authorityStore?: AuthorityStore | null,
  idempotency?: IdempotencyRegistry | null,
): Promise<unknown> {
  // §5.1/§5.9 — the `gnosis.query`/`gnosis.stream` shared argument validation
  // (the SAME field checks as `rag.query`, with the full four-member mode set
  // and the tool's own name prefix on the throw messages).
  const validateArgs = (): {
    query: string
    topK: number
    mode: 'flat' | 'graph' | 'vector' | 'hybrid'
    maxHops: number
    expand: 'none' | 'parent'
    maxParentContext: number
  } => {
    const query = typeof args.query === 'string' ? args.query : ''
    if (query.trim() === '') throw new Error(`${name}: query must be a non-empty string`)
    const topK = args.topK !== undefined ? (args.topK as number) : 5
    if (typeof topK !== 'number' || !Number.isInteger(topK) || topK < 1 || topK > 50) {
      throw new Error(`${name}: topK must be an integer in [1, 50]`)
    }
    const mode = args.mode !== undefined ? (args.mode as 'flat' | 'graph' | 'vector' | 'hybrid') : 'flat'
    if (mode !== 'flat' && mode !== 'graph' && mode !== 'vector' && mode !== 'hybrid') {
      throw new Error(`${name}: mode must be "flat", "graph", "vector", or "hybrid"`)
    }
    const maxHops = args.maxHops !== undefined ? (args.maxHops as number) : 3
    if (typeof maxHops !== 'number' || !Number.isInteger(maxHops) || maxHops < 1 || maxHops > 5) {
      throw new Error(`${name}: maxHops must be an integer in [1, 5]`)
    }
    const expand = args.expand !== undefined ? (args.expand as 'none' | 'parent') : 'none'
    if (expand !== 'none' && expand !== 'parent') throw new Error(`${name}: expand must be "none" or "parent"`)
    const maxParentContext = args.maxParentContext !== undefined ? (args.maxParentContext as number) : 5
    if (typeof maxParentContext !== 'number' || !Number.isInteger(maxParentContext) || maxParentContext < 1) {
      throw new Error(`${name}: maxParentContext must be a positive integer`)
    }
    if (args.filters !== undefined) validateGnosisFilters(args.filters, name)
    return { query, topK, mode, maxHops, expand, maxParentContext }
  }

  const opts = (v: ReturnType<typeof validateArgs>): EngineRagQueryOptions => ({
    topK: v.topK,
    mode: v.mode,
    maxHops: v.maxHops,
    expand: v.expand,
    maxParentContext: v.maxParentContext,
    ...(args.filters !== undefined ? { filters: args.filters as RagQueryFilters } : {}),
  })

  // Unit A2 §5.4 — resolve the caller's edit-authority credential for a mutating
  // document/wiki tool call. A null/absent `authorityStore` (or a callerId with
  // no edit authority) → the caller-side deny (fail-closed): the mutating call
  // is denied and NO proxy call is issued.
  const resolveCallerCredential = (callerId: string): string => {
    const credential = authorityStore ? authorityStore.callerCredential(callerId) : null
    if (credential === null) throw new Error(`${name}: caller has no edit authority`)
    return credential
  }

  switch (name) {
    case 'gnosis.query': {
      if (!engine) throw new Error(`${name}: no engine rag store configured`)
      const v = validateArgs()
      const result = await engine.ragQuery(v.query, opts(v))
      if (auditLog) {
        auditLog.record({
          query: v.query,
          filters: (args.filters as RagQueryFilters) ?? null,
          mode: v.mode,
          resultCount: result.results.length,
          timestamp: new Date().toISOString(),
          requester: 'mcp',
        })
      }
      return result
    }
    case 'gnosis.stream': {
      if (!engine) throw new Error(`${name}: no engine rag store configured`)
      const v = validateArgs()
      // A3 — fully consume the single-shot AsyncIterable within the call (the
      // SSE teardown + premature-close EngineUnavailable are handled by the
      // proxy's own consumption; the tool leaves no half-open stream).
      const chunks: RagChunk[] = []
      for await (const c of engine.ragStream(v.query, opts(v))) {
        chunks.push(c)
      }
      if (auditLog) {
        let resultCount = 0
        const resultChunk = chunks.find((c) => c.type === 'result')
        if (resultChunk && resultChunk.type === 'result') resultCount = resultChunk.result.results.length
        auditLog.record({
          query: v.query,
          filters: (args.filters as RagQueryFilters) ?? null,
          mode: v.mode,
          resultCount,
          timestamp: new Date().toISOString(),
          requester: 'mcp',
        })
      }
      return { chunks }
    }
    case 'gnosis.status': {
      if (!engine) throw new Error(`${name}: no engine rag store configured`)
      // A8 — `gnosis.status` is a TOOL (default-off), NOT an mcp:// resource:
      // the only gate on engine status is the `gnosis` group. Read-only — NO
      // audit entry.
      const report: HealthReport = await engine.getEngineStatus()
      return report
    }
    // ---- Unit A2 §5.1 — the 11 document/wiki tools (the LANDED CRUD proxy).
    // Each case guards `if (!engineCrud)` FIRST (the null-CRUD-engine check
    // fires BEFORE the authority check — fail-state 5 vs 12/13 ordering). The
    // read-only tools never carry `caller`; the mutating tools resolve the
    // caller credential and thread it into the mutating args' `caller` field.
    // The CRUD tools do NOT record to the QueryAuditLog. ----
    case 'gnosis.document.get': {
      if (!engineCrud) throw new Error(`${name}: no engine crud rag store configured`)
      const documentId = typeof args.documentId === 'string' ? args.documentId : ''
      if (documentId === '') throw new Error(`${name}: documentId required`)
      return engineCrud.getDocument({ documentId })
    }
    case 'gnosis.document.list': {
      if (!engineCrud) throw new Error(`${name}: no engine crud rag store configured`)
      const wikiId = typeof args.wikiId === 'string' ? args.wikiId : ''
      if (wikiId === '') throw new Error(`${name}: wikiId required`)
      // H-4 (adversarial) — an invalid `state` is REJECTED (never silently
      // nulled into a no-filter). The `state` arg is a closed enum
      // (Draft/Published/Archived); a present-but-invalid value is a handler-side
      // error, not a pass-through.
      if (args.state !== undefined && args.state !== 'Draft' && args.state !== 'Published' && args.state !== 'Archived') {
        throw new Error(`${name}: invalid state`)
      }
      // §5.1 — the ListDocumentsFilter body with the wire's null-when-None
      // discipline (null for absent Option fields).
      const body: ListDocumentsFilter = {
        state: args.state === 'Draft' || args.state === 'Published' || args.state === 'Archived' ? args.state : null,
        tag: typeof args.tag === 'string' ? args.tag : null,
        page: typeof args.page === 'number' ? args.page : null,
        pageSize: typeof args.pageSize === 'number' ? args.pageSize : null,
      }
      return engineCrud.listDocuments({ wikiId, body })
    }
    case 'gnosis.wiki.get': {
      if (!engineCrud) throw new Error(`${name}: no engine crud rag store configured`)
      const wikiId = typeof args.wikiId === 'string' ? args.wikiId : ''
      if (wikiId === '') throw new Error(`${name}: wikiId required`)
      return engineCrud.getWiki({ wikiId })
    }
    case 'gnosis.wiki.list': {
      if (!engineCrud) throw new Error(`${name}: no engine crud rag store configured`)
      return engineCrud.listWikis({})
    }
    case 'gnosis.document.create': {
      if (!engineCrud) throw new Error(`${name}: no engine crud rag store configured`)
      const callerId = typeof args.callerId === 'string' ? args.callerId : ''
      const wikiId = typeof args.wikiId === 'string' ? args.wikiId : ''
      const title = typeof args.title === 'string' ? args.title : ''
      // §5.1 — the empty/overlong `title` is a PROXY-side ValidationError (400),
      // NOT a handler-side reject: the handler requires only the identity + the
      // wiki, and passes the title through (even empty) so the proxy's
      // ValidationError (400) propagates (§5.9-19).
      if (callerId === '' || wikiId === '') throw new Error(`${name}: callerId and wikiId required`)
      const caller = resolveCallerCredential(callerId)
      const requestId = typeof args.requestId === 'string' && args.requestId !== '' ? args.requestId : undefined
      // P4 — the caller-side idempotency dedup: a duplicate (callerId, requestId)
      // returns the cached result WITHOUT issuing a new createDocument.
      if (requestId !== undefined && idempotency) {
        const cached = idempotency.get(callerId, requestId)
        if (cached !== undefined) return cached
      }
      // §5.1 — the CreateDocumentRequest body with the null-when-None discipline
      // (tags/author null for absent args, NEVER [] for an absent tags arg).
      const body: CreateDocumentRequest = {
        title,
        tags: Array.isArray(args.tags) ? (args.tags as string[]) : null,
        author: typeof args.author === 'string' ? args.author : null,
      }
      const result = await engineCrud.createDocument({ caller, wikiId, body })
      if (requestId !== undefined && idempotency) idempotency.set(callerId, requestId, result)
      return result
    }
    case 'gnosis.document.update': {
      if (!engineCrud) throw new Error(`${name}: no engine crud rag store configured`)
      const callerId = typeof args.callerId === 'string' ? args.callerId : ''
      const documentId = typeof args.documentId === 'string' ? args.documentId : ''
      if (callerId === '' || documentId === '') throw new Error(`${name}: callerId and documentId required`)
      const caller = resolveCallerCredential(callerId)
      // H-3 (adversarial) — `baseRevision` and `graph` are REQUIRED args (§5.1);
      // a missing one is a handler-side error, never a silent default (the old
      // code defaulted `baseRevision` to 0 and `graph` to {nodes:[],edges:[]}).
      if (typeof args.baseRevision !== 'number' || args.graph === undefined || args.graph === null) {
        throw new Error(`${name}: baseRevision and graph required`)
      }
      // §5.1 — the UpdateDocumentRequest body with the null-when-None discipline
      // (title/tags null for absent args; graph passed through opaque).
      const body: UpdateDocumentRequest = {
        baseRevision: args.baseRevision as number,
        graph: args.graph as Graph,
        title: typeof args.title === 'string' ? args.title : null,
        tags: Array.isArray(args.tags) ? (args.tags as string[]) : null,
      }
      return engineCrud.updateDocument({ caller, documentId, body })
    }
    case 'gnosis.document.delete': {
      if (!engineCrud) throw new Error(`${name}: no engine crud rag store configured`)
      const callerId = typeof args.callerId === 'string' ? args.callerId : ''
      const documentId = typeof args.documentId === 'string' ? args.documentId : ''
      if (callerId === '' || documentId === '') throw new Error(`${name}: callerId and documentId required`)
      const caller = resolveCallerCredential(callerId)
      return engineCrud.deleteDocument({ caller, documentId })
    }
    case 'gnosis.document.publish': {
      if (!engineCrud) throw new Error(`${name}: no engine crud rag store configured`)
      const callerId = typeof args.callerId === 'string' ? args.callerId : ''
      const documentId = typeof args.documentId === 'string' ? args.documentId : ''
      if (callerId === '' || documentId === '') throw new Error(`${name}: callerId and documentId required`)
      const caller = resolveCallerCredential(callerId)
      return engineCrud.publishDocument({ caller, documentId })
    }
    case 'gnosis.document.unpublish': {
      if (!engineCrud) throw new Error(`${name}: no engine crud rag store configured`)
      const callerId = typeof args.callerId === 'string' ? args.callerId : ''
      const documentId = typeof args.documentId === 'string' ? args.documentId : ''
      if (callerId === '' || documentId === '') throw new Error(`${name}: callerId and documentId required`)
      const caller = resolveCallerCredential(callerId)
      return engineCrud.unpublishDocument({ caller, documentId })
    }
    case 'gnosis.document.archive': {
      if (!engineCrud) throw new Error(`${name}: no engine crud rag store configured`)
      const callerId = typeof args.callerId === 'string' ? args.callerId : ''
      const documentId = typeof args.documentId === 'string' ? args.documentId : ''
      if (callerId === '' || documentId === '') throw new Error(`${name}: callerId and documentId required`)
      const caller = resolveCallerCredential(callerId)
      return engineCrud.archiveDocument({ caller, documentId })
    }
    case 'gnosis.wiki.create': {
      if (!engineCrud) throw new Error(`${name}: no engine crud rag store configured`)
      const callerId = typeof args.callerId === 'string' ? args.callerId : ''
      const wikiName = typeof args.name === 'string' ? args.name : ''
      // §5.1 — the empty/overlong `name` is a PROXY-side ValidationError (400),
      // NOT a handler-side reject: the handler requires only the identity and
      // passes the name through (even empty) so the proxy's ValidationError (400)
      // propagates (§5.9-31).
      if (callerId === '') throw new Error(`${name}: callerId required`)
      const caller = resolveCallerCredential(callerId)
      const requestId = typeof args.requestId === 'string' && args.requestId !== '' ? args.requestId : undefined
      // P4 — the caller-side idempotency dedup: a duplicate (callerId, requestId)
      // returns the cached result WITHOUT issuing a new createWiki.
      if (requestId !== undefined && idempotency) {
        const cached = idempotency.get(callerId, requestId)
        if (cached !== undefined) return cached
      }
      const result = await engineCrud.createWiki({ caller, name: wikiName })
      if (requestId !== undefined && idempotency) idempotency.set(callerId, requestId, result)
      return result
    }
    default:
      throw new Error(`unknown gnosis tool: ${name}`)
  }
}

/** Unit E §5.7/§8.2 — the UI retrieval path. The main-process `rag-query` IPC
 *  handler delegates to THIS (via the SAME validation + the SAME maintained
 *  engine as the MCP `rag.query` tool), so the two surfaces are equivalent
 *  (MCP/UI equivalence — a BINDING constraint). Returns the engine's
 *  `RetrievalResult`; on an invalid query/topK it throws the same documented
 *  `rag.query` fail-states (so the IPC rejects identically to the MCP tool).
 *  Exported for direct unit testing of the equivalence.
 *
 *  U-MS2 §5.4 step 4 (F4) — the IPC path gains the SAME directory injection as
 *  the MCP path: the trailing optional `dir` param is forwarded into
 *  `handleRagTool`, so the resolver behaves IDENTICALLY on both surfaces
 *  (MCP-UI-EQUIVALENCE). At U-MS2 the IPC payload carries no `store` field ⇒
 *  the resolver's omitted ⇒ default-entry rule (S1) applies unchanged
 *  (byte-equal); once U-MS5's additive `RagQueryPayload.store` field exists, a
 *  forwarded store resolves through the SAME `resolveStoreArg` and an unknown
 *  forwarded store FAILS LOUD here too (M2/A9). The payload's `store` field
 *  itself is U-MS5's — NOT added by this unit. */
export async function handleRagQueryIpc(
  engine: RetrievalEngine | null,
  store: RagStore | null,
  payload: { query?: unknown; topK?: unknown; store?: unknown; stores?: unknown },
  dir?: RagStoreDirectory | null,
  auditLog?: QueryAuditLog | null,
): Promise<unknown> {
  return handleRagTool(store, 'rag.query', {
    query: payload?.query,
    topK: payload?.topK,
    store: payload?.store,
    stores: payload?.stores, // U-F3 A-F4 — ADDITIVE, forwarded unchanged
  }, engine, dir, auditLog)
}

/** Unit G §5.4/§8.2 — the UI backlink path. The main-process `rag-backlinks`
 *  IPC handler delegates to THIS (via the SAME validation + the SAME host-side
 *  enumeration as the MCP `rag.backlinks` tool), so the two surfaces are
 *  equivalent (MCP/UI equivalence — a BINDING constraint). Returns the
 *  `BacklinkResult`; on an invalid `nodeId` it throws the same documented
 *  `rag.backlinks` fail-state (so the IPC rejects identically to the MCP tool).
 *  Exported for direct unit testing of the equivalence. */
export async function handleRagBacklinksIpc(
  store: RagStore | null,
  payload: { nodeId?: unknown },
): Promise<BacklinkResult> {
  // G2 — the store-null fail-state mirrors the MCP `rag.backlinks` tool's
  // (`handleRagTool`'s top guard throws `${name}: no rag store configured`), so
  // the IPC rejects identically to the MCP tool (§5.4 MCP/UI equivalence).
  if (!store) throw new Error('rag.backlinks: no rag store configured')
  const nodeId = typeof payload?.nodeId === 'string' ? payload.nodeId : ''
  if (nodeId === '') throw new Error('rag.backlinks: nodeId required')
  return enumerateLinks(store, nodeId)
}

/** Unit V3 §5.1 — the shared main-process handler for the `rag-doc-heads` IPC
 *  (the doc-nav data source). Returns `{ documents: [{ documentId, title }] }`
 *  from the `doc-head` edges + the head node content — a strict subset of the
 *  `rag-snapshot` payload. The doc-nav reads this, not the full snapshot.
 *  Exported for direct unit testing.
 *
 *  Behavior (pinned): reads the `doc-head` edges (via `edgesByKind('doc-head')`,
 *  falling back to `listEdges()` for a store that predates the adjacency
 *  surface); the head node content is read via `getNode(source)`. Deduped by
 *  target `documentId` (first head wins); sorted by document root id
 *  (lexicographic ascending, deterministic). A missing source node → `''` (no
 *  throw). An empty store → `{ documents: [] }` (no throw). A null store →
 *  throws `Error('rag-doc-heads: no rag store configured')`. */
export function handleRagDocHeadsIpc(store: RagStore | null): RagDocHeadsPayload {
  if (!store) throw new Error('rag-doc-heads: no rag store configured')
  const edges = typeof store.edgesByKind === 'function' ? store.edgesByKind('doc-head') : store.listEdges().filter((e) => e.kind === 'doc-head')
  const nodeById = new Map(store.listNodes().map((n) => [n.id, n]))
  const seen = new Set<string>()
  const documents: Array<{ documentId: string; title: string }> = []
  for (const e of edges) {
    if (e.kind !== 'doc-head') continue
    // MED-1 (adversarial): a `doc-head` edge with a missing/undefined/empty
    // target is a MALFORMED edge — SKIP it (never push a phantom
    // `{ documentId: undefined }` entry that crashes the sort below, and never
    // emit an unselectable `''` document entry).
    if (e.target == null || e.target === '') continue
    if (seen.has(e.target)) continue // dedupe by target (first head wins)
    seen.add(e.target)
    documents.push({ documentId: e.target, title: nodeById.get(e.source)?.content ?? '' })
  }
  documents.sort((a, b) => a.documentId.localeCompare(b.documentId))
  return { documents }
}

/** U-MS5 §5.2 — the shared main-process handler for the read-only
 *  `rag-store-listing` IPC (the operator settings pane's store census). Returns
 *  the registry's presentation view: one `RagStoreListingEntry` per configured
 *  store (name, default flag, persistence file name, corpus root, per-store
 *  load status). PURE — performs NO I/O: `entries` is the boot-loaded registry's
 *  resolved per-store view passed through the §5.4 WIRING ADAPTER (U-MS1's
 *  loaded form with `persistenceFile` already basename-projected and
 *  `corpusRoot` already `?? null`-coerced — the handler itself is a verbatim
 *  projector of the ALREADY-projected input) and
 *  `statusOf` is the per-store status resolver (U-MS2's `storeLoadStatus`
 *  accessor over the boot store map). Exported
 *  for direct unit testing.
 *
 *  Behavior (pinned): null entries → throw
 *  `Error('rag-store-listing: no rag store registry configured')`; a
 *  non-function `statusOf` → throw `Error('rag-store-listing: statusOf resolver
 *  required')`; a malformed entry (null entry, or a non-string/empty `name`) is
 *  SKIPPED (never a crash, never a phantom entry); `default` coerces to
 *  `e.default === true`; a non-string `persistenceFile` coerces to `''`; a
 *  non-string/empty `corpusRoot` coerces to `null`; `status = statusOf(name)`
 *  and a resolver return outside the three-member union THROWS
 *  `Error('rag-store-listing: unknown store status "<v>" for store "<name>"')`
 *  (fail-loud — the host's fetch catch keeps the last-known listing). One
 *  output entry per valid input entry, in the INPUT array order — NO sort, NO
 *  dedupe (uniqueness + order are U-MS1's validated-registry contract; the
 *  handler is a verbatim projector). An empty array → `{ stores: [] }`. */
export function handleRagStoreListingIpc(
  entries:
    | ReadonlyArray<{
        name: string
        default: boolean
        persistenceFile: string
        corpusRoot: string | null
      }>
    | null,
  statusOf: (name: string) => RagStoreLoadStatus,
): RagStoreListingPayload {
  if (!entries) throw new Error('rag-store-listing: no rag store registry configured')
  if (typeof statusOf !== 'function') throw new Error('rag-store-listing: statusOf resolver required')
  const VALID: ReadonlySet<string> = new Set(['loaded', 'failed-corrupt', 'failed-missing'])
  const stores: RagStoreListingEntry[] = []
  for (const e of entries) {
    // MED-1 discipline (the V3 adversarial lesson): a malformed entry is
    // SKIPPED — never a phantom `{ name: undefined }` entry, never a crash.
    if (e == null || typeof e.name !== 'string' || e.name === '') continue
    const status = statusOf(e.name)
    if (typeof status !== 'string' || !VALID.has(status)) {
      throw new Error(`rag-store-listing: unknown store status "${String(status)}" for store "${e.name}"`)
    }
    stores.push({
      name: e.name,
      default: e.default === true,
      persistenceFile: typeof e.persistenceFile === 'string' ? e.persistenceFile : '',
      corpusRoot: typeof e.corpusRoot === 'string' && e.corpusRoot !== '' ? e.corpusRoot : null,
      status,
    })
  }
  return { stores }
}

/** U-H8 §5.2 — the shared main-process handler for the mutating
 *  `rag-store-manage` IPC (the operator-registry editor, the review §2 D6 ONE
 *  exemption). Operates ONLY through the LANDED `RagStoreRuntimeController` seams —
 *  it READS `getDefaultName()`/`currentStores()`/`statusOf(name)` per call (A-P2-1)
 *  and invokes `hotApply({kind:'add'})`/`hotRemove`/`hotRename`/`hotSetDefault`/
 *  `hotRenameDefault`; it ADDS NO registry logic at all.
 *
 *  Two-phase confirmation (D3/A-P2-7): a DESTRUCTIVE op (remove/rename/setDefault/
 *  renameDefault) sent WITHOUT `confirmed:true` returns
 *  `{ confirmationRequired: true, summary }` and invokes NO seam; the SAME op sent
 *  with `confirmed:true` invokes the seam, whose OWN rejection PROPAGATES as
 *  `{ ok:false, error }` (fail-closed on a stale/removed target). `add` is
 *  non-destructive and executes immediately. A malformed request or an unknown op is
 *  a domain error (never a throw); the ONLY throw paths are the seams' own (which
 *  this handler catches and returns as `{ ok:false, error }`). */
export async function handleRagStoreManageIpc(
  runtime: RagStoreRuntimeController,
  request: unknown,
): Promise<RagStoreManageResult> {
  // ---- Shape guard (never a throw for a malformed request) ----
  if (!isObject(request)) return { ok: false, error: 'rag-store-manage: op required' }
  const op = (request as Record<string, unknown>).op
  if (op === undefined) return { ok: false, error: 'rag-store-manage: op required' }
  if (!isManageOp(op)) {
    return { ok: false, error: `rag-store-manage: unknown op ${JSON.stringify(String(op))}` }
  }
  const req = request as RagStoreManageRequest
  switch (req.op) {
    case 'add':
      return manageAdd(runtime, req)
    case 'remove':
    case 'rename':
    case 'setDefault':
    case 'renameDefault':
      return manageDestructive(runtime, req)
  }
  // Unreachable in practice (op is a validated RagStoreManageOp) — defensive.
  return { ok: false, error: `rag-store-manage: unknown op ${JSON.stringify(String(op))}` }
}

const MANAGE_OPS: ReadonlySet<string> = new Set(['add', 'remove', 'rename', 'setDefault', 'renameDefault'])

function isManageOp(op: unknown): op is RagStoreManageOp {
  return typeof op === 'string' && MANAGE_OPS.has(op)
}

/** The basename projection for a store's `persistenceFile` (the summary's
 *  `<file>` substitution — the LANDED listing's basename view, U-MS5). Handles
 *  an absolute path (the runtime's resolved store) or a bare basename alike. */
function fileBasename(pathOrName: string): string {
  if (typeof pathOrName !== 'string' || pathOrName === '') return ''
  const idx = Math.max(pathOrName.lastIndexOf('/'), pathOrName.lastIndexOf('\\'))
  return idx >= 0 ? pathOrName.slice(idx + 1) : pathOrName
}

function manageErrorOf(e: unknown): string {
  // HOST-H8-5 (LOW): a thrown null/undefined must NOT stringify as the literal
  // "null"/"undefined" — map it to a useful manage-level message.
  if (e == null) return 'rag-store-manage: operation failed'
  return e instanceof Error && e.message !== '' ? e.message : String(e)
}

async function manageAdd(
  runtime: RagStoreRuntimeController,
  req: Extract<RagStoreManageRequest, { op: 'add' }>,
): Promise<RagStoreManageResult> {
  const { name } = req
  if (typeof name !== 'string' || name === '') return { ok: false, error: 'rag-store-manage: name required' }
  // `add` is NON-destructive — a `confirmed:true` is a domain error, never an execution.
  if ((req as { confirmed?: boolean }).confirmed === true) return { ok: false, error: 'rag-store-manage: add does not require confirmation' }
  try {
    runtime.hotApply({ kind: 'add', store: { name } })
    return { ok: true, done: `Added store '${name}'` }
  } catch (e) {
    // the seam's OWN rejection (W-add-required / W-add-existing / loader-F / fs) PROPAGATES.
    return { ok: false, error: manageErrorOf(e) }
  }
}

async function manageDestructive(
  runtime: RagStoreRuntimeController,
  req: Extract<RagStoreManageRequest, { op: 'remove' | 'rename' | 'setDefault' | 'renameDefault' }>,
): Promise<RagStoreManageResult> {
  // ---- CONFIRM step (the operator explicitly confirmed via the same channel) ----
  if (req.confirmed === true) {
    try {
      // HOST-H8-2 (MEDIUM): re-run the advisory default/target guards BEFORE the
      // seam — a concurrent setDefault/renameDefault between the prompt and the
      // confirm surfaces the correct manage-level message (NOT the write module's
      // generic Pass-C "exactly one store must have default" error), and the
      // operator-only destructive seam is never invoked against a now-default /
      // now-conflicting target. Wrapped in the fail-safe umbrella with the seam.
      const defaultName = runtime.getDefaultName()
      const stores = runtime.currentStores()
      const byName = new Map<string, { default: boolean }>()
      for (const s of stores) byName.set(s.name, { default: s.default })
      switch (req.op) {
        case 'remove': {
          if (typeof req.name !== 'string' || req.name === '') return { ok: false, error: 'rag-store-manage: name required' }
          if (byName.get(req.name)?.default) return { ok: false, error: `rag-store-manage: cannot remove the default store '${req.name}'` }
          await runtime.hotRemove(req.name)
          return { ok: true, done: `Removed store '${req.name}'` }
        }
        case 'rename': {
          if (typeof req.from !== 'string' || req.from === '') return { ok: false, error: 'rag-store-manage: from required' }
          if (typeof req.to !== 'string' || req.to === '') return { ok: false, error: 'rag-store-manage: to required' }
          if (byName.get(req.from)?.default) {
            return { ok: false, error: 'rag-store-manage: cannot rename the default store (use the default-row Rename-default)' }
          }
          if (req.from === req.to || byName.has(req.to)) {
            return { ok: false, error: `rag-store-registry-write: store '${req.from}' cannot be renamed to '${req.to}': '${req.to}' already exists` }
          }
          await runtime.hotRename(req.from, req.to)
          return { ok: true, done: `Renamed store '${req.from}' to '${req.to}'` }
        }
        case 'setDefault': {
          if (typeof req.name !== 'string' || req.name === '') return { ok: false, error: 'rag-store-manage: name required' }
          if (byName.get(req.name)?.default) return { ok: false, error: `rag-store-manage: store '${req.name}' is already the default` }
          await runtime.hotSetDefault(req.name)
          return { ok: true, done: `Made store '${req.name}' the default` }
        }
        case 'renameDefault': {
          if (typeof req.to !== 'string' || req.to === '') return { ok: false, error: 'rag-store-manage: to required' }
          if (req.to === defaultName || byName.has(req.to)) {
            return { ok: false, error: `rag-store-registry-write: store '${defaultName}' cannot be renamed to '${req.to}': '${req.to}' already exists` }
          }
          await runtime.hotRenameDefault(req.to)
          return { ok: true, done: `Renamed the default store to '${req.to}'` }
        }
      }
    } catch (e) {
      // ---- fail-closed: the seam's OWN rejection (or a guard accessor throw)
      //      PROPAGATES as a manage-level { ok:false, error } — never a throw ----
      return { ok: false, error: manageErrorOf(e) }
    }
    return { ok: false, error: 'rag-store-manage: unknown op' }
  }

  // ---- REQUEST step (no `confirmed:true`) — read the live projection + the
  //      advisory pre-flight + the summary. NO seam is invoked. HOST-H8-3 (LOW):
  //      the WHOLE step is wrapped in the fail-safe umbrella so a defensive
  //      accessor read (`getDefaultName`/`currentStores`/`statusOf`) throw
  //      becomes a clean `{ ok:false, error }` — the handler NEVER throws for a
  //      domain failure (the "never throws" contract). ----
  try {
    const defaultName = runtime.getDefaultName()
    const stores = runtime.currentStores()
    const byName = new Map<string, { default: boolean; persistenceFile: string }>()
    for (const s of stores) byName.set(s.name, { default: s.default, persistenceFile: fileBasename(s.persistenceFile) })

    switch (req.op) {
      case 'remove': {
        const { name } = req
        if (typeof name !== 'string' || name === '') return { ok: false, error: 'rag-store-manage: name required' }
        const target = byName.get(name)
        if (!target) return { ok: false, error: `rag-store-registry-write: cannot remove unknown store '${name}'` }
        runtime.statusOf(name)
        if (target.default) return { ok: false, error: `rag-store-manage: cannot remove the default store '${name}'` }
        return {
          confirmationRequired: true,
          summary: `Remove store '${name}'? This unregisters it and STRANDS its persistence file '${target.persistenceFile}' + journal (never deleted). This cannot be undone.`,
        }
      }
      case 'rename': {
        const { from, to } = req
        if (typeof from !== 'string' || from === '') return { ok: false, error: 'rag-store-manage: from required' }
        if (typeof to !== 'string' || to === '') return { ok: false, error: 'rag-store-manage: to required' }
        const fromStore = byName.get(from)
        if (!fromStore) return { ok: false, error: `rag-store-registry-write: cannot rename unknown store '${from}'` }
        if (from === to || byName.has(to)) {
          return { ok: false, error: `rag-store-registry-write: store '${from}' cannot be renamed to '${to}': '${to}' already exists` }
        }
        runtime.statusOf(from)
        if (fromStore.default) return { ok: false, error: 'rag-store-manage: cannot rename the default store (use the default-row Rename-default)' }
        return {
          confirmationRequired: true,
          summary: `Rename store '${from}' to '${to}'? The old store is drained + torn down; its file '${fromStore.persistenceFile}' is stranded.`,
        }
      }
      case 'setDefault': {
        const { name } = req
        if (typeof name !== 'string' || name === '') return { ok: false, error: 'rag-store-manage: name required' }
        const target = byName.get(name)
        if (!target) return { ok: false, error: `rag-store-registry-write: cannot set unknown store '${name}' as default` }
        runtime.statusOf(name)
        if (target.default) return { ok: false, error: `rag-store-manage: store '${name}' is already the default` }
        return {
          confirmationRequired: true,
          summary: `Make store '${name}' the default? Queries and edits target the default until reassigned.`,
        }
      }
      case 'renameDefault': {
        const { to } = req
        if (typeof to !== 'string' || to === '') return { ok: false, error: 'rag-store-manage: to required' }
        if (to === defaultName || byName.has(to)) {
          return { ok: false, error: `rag-store-registry-write: store '${defaultName}' cannot be renamed to '${to}': '${to}' already exists` }
        }
        runtime.statusOf(defaultName)
        return {
          confirmationRequired: true,
          summary: `Rename the default store to '${to}'? It stays the default under the new name.`,
        }
      }
    }
    // Unreachable in practice (req.op is a validated destructive op) — defensive.
    return { ok: false, error: 'rag-store-manage: unknown op' }
  } catch (e) {
    // a defensive accessor read throw → a clean domain error, never a handler throw.
    return { ok: false, error: manageErrorOf(e) }
  }
}

/** U-H8 §5.3 — a structural object guard: a non-null object is a valid request
 *  envelope (null/undefined/primitive → op-required). */
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

/** Unit I §5.3 — the shared main-process handler for the `code.template.*`
 *  CRUD tools (MCP/UI equivalence — §8.2 a BINDING constraint). The MCP
 *  `code.template.*` tools call it via the `registerTools` main-handled branch;
 *  the UI IPC handlers call it with the SAME store, so the two surfaces are
 *  equivalent. On a successful MUTATING op (`set`/`create`/`delete`/`reset`) it
 *  invokes `onTemplateChanged({ source, template })`, which the caller wires to
 *  an `IPC_TEMPLATE_CHANGED` broadcast (the whole-graph re-derive trigger).
 *
 *  `create`/`delete` are ORCHESTRATED here: read the current template (`get()`),
 *  add/remove the zone's container producer, then call `store.set(modified)` —
 *  which runs `validateTemplate` and REJECTS an invalid result. This keeps ALL
 *  writes on the single validated `set` path. The `delete`-of-targeted message
 *  (`template delete: cannot remove targeted zone "<zone>"`) differs from
 *  `set`'s missing-zone message, so the handler distinguishes them with an
 *  explicit pre-check. */
export function handleTemplateTool(
  templateStore: TemplateStore | null,
  name: string,
  args: Record<string, unknown>,
  onTemplateChanged?: (payload: TemplateChangedPayload) => void,
): unknown {
  if (!templateStore) throw new Error(`${name}: no template store configured`)
  switch (name) {
    case 'code.template.get':
      return { source: templateStore.status().source, template: templateStore.get() }
    case 'code.template.validate':
      return validateTemplate(args.template, templateStore.targetedZones)
    case 'code.template.set': {
      const tpl = templateStore.set(args.template as ContentWindowTemplate)
      const payload: TemplateChangedPayload = { source: 'custom', template: tpl }
      onTemplateChanged?.(payload)
      return payload
    }
    case 'code.template.create': {
      const zone = typeof args.zone === 'string' ? args.zone : ''
      if (zone === '') throw new Error('template create: zone required')
      const current = templateStore.get()
      const children = current.root.children ?? []
      const present = children.some(
        (c) => (c.placement as { placementName?: string } | undefined)?.placementName === zone,
      )
      if (present) throw new Error(`template create: zone "${zone}" already present`)
      const id = typeof args.id === 'string' && args.id !== '' ? args.id : `zone:${zone}`
      const modified: ContentWindowTemplate = {
        root: {
          ...current.root,
          children: [...children, { type: 'div', props: { id }, placement: { placementName: zone } }],
        },
      }
      const tpl = templateStore.set(modified)
      const payload: TemplateChangedPayload = { source: 'custom', template: tpl }
      onTemplateChanged?.(payload)
      return payload
    }
    case 'code.template.delete': {
      const zone = typeof args.zone === 'string' ? args.zone : ''
      if (zone === '') throw new Error('template delete: zone required')
      // The zone-consistency invariant forbids dropping a targeted zone.
      if (templateStore.targetedZones.includes(zone)) {
        throw new Error(`template delete: cannot remove targeted zone "${zone}"`)
      }
      const current = templateStore.get()
      const children = current.root.children ?? []
      const idx = children.findIndex(
        (c) => (c.placement as { placementName?: string } | undefined)?.placementName === zone,
      )
      if (idx === -1) throw new Error(`template delete: no zone "${zone}"`)
      const modified: ContentWindowTemplate = {
        root: { ...current.root, children: children.filter((_, i) => i !== idx) },
      }
      const tpl = templateStore.set(modified)
      const payload: TemplateChangedPayload = { source: 'custom', template: tpl }
      onTemplateChanged?.(payload)
      return payload
    }
    case 'code.template.reset': {
      const tpl = templateStore.reset()
      const payload: TemplateChangedPayload = { source: 'default', template: tpl }
      onTemplateChanged?.(payload)
      return payload
    }
    default:
      throw new Error(`unknown template tool: ${name}`)
  }
}

/** Unit MS3 §5.1 — a compat RE-EXPORT of the ONE shared `rag-store-changed`
 *  payload declaration (the three-structural-copy collapse; the canonical type
 *  lives in `../shared/types.js`). */
export type { RagStoreChangedPayload }

/** Unit B/D — handle an `edit.*` tool in MAIN (mutating, through the RAG store's
 *  single-writer queue). The edit tools are NOT routed to the renderer. Editing
 *  is NEVER a `code`-group op. Exported for direct unit testing.
 *
 *  H1 — the handler is a THIN validator that calls the corresponding edit op
 *  (§5.1.2-§5.1.7) from `src/main/edit-ops.ts` (the tool→op mapping in §5.1.8)
 *  and returns the op's JSON result. It does NOT reimplement the ops inline.
 *  After a successful mutation it invokes `onStoreChanged` (the §5.1.9
 *  re-traversal trigger), which the caller wires to a `rag-store-changed`
 *  broadcast to the renderer.
 *
 *  U-MS2 (docs/specs/unit-ms2-store-wiring.md §5.3/§5.5) — the OPTIONAL `store`
 *  selector resolved FIRST (R1, identical to `handleRagTool`), and the
 *  `onStoreChanged` callback is WIDENED to `(payload, storeName)`: every
 *  successful-mutation callback invocation receives the RESOLVED store's name
 *  (the addressed entry's registry name; '' for the legacy directory-less
 *  sentinel — §5.3 step 5). Backward-compatible: existing single-arg callbacks
 *  still compile and run (the extra argument is ignored). The ADDRESSED store's
 *  store instance serves the call (SINGLE-WRITER-STORE-PER-STORE); with a
 *  directory injected it is the single source of truth (the passed `store`
 *  param is ignored — the legacy directory-less path byte-equal). The
 *  `edit.import_markdown` corpus root is the ADDRESSED entry's configured
 *  `corpusRoot` — passed via the importer's EXISTING programmatic param
 *  (markdown-import.ts:23,66 — IMPORT-ROOT-PER-STORE; the tool schema stays
 *  `files`-only, ADV-1). The third `ImportStoreContext` pass-through argument
 *  is U-MS2 §5.6's pinned pass-through (F2) — LIVE since U-MS4 landed the
 *  optional parameter: the wired call passes `{ name, isDefault, reservedNames
 *  }` byte-for-byte (reservedNames = ONLY the non-default names, U-MS4 §5.4
 *  A1-S7); the LEGACY directory-less path passes NO third argument (the 2-ARG
 *  form — byte-equal today). */
export async function handleEditTool(
  store: RagStore | null,
  name: string,
  args: Record<string, unknown>,
  onStoreChanged?: (payload: RagStoreChangedPayload, storeName: string) => void,
  dir?: RagStoreDirectory | null,
): Promise<unknown> {
  if (!store) throw new Error(`${name}: no rag store configured`)
  // U-MS2 §5.3 step 2 — resolve FIRST (before every tool-specific validation
  // throw and before ANY store method call / mutation / broadcast — R1).
  const ref = resolveStoreArg(name, args?.store, dir)
  // §5.3 step 3 — the addressed entry: with a directory injected it is the
  // single source of truth (M3 already guaranteed the default exists).
  const entry = ref === null ? null : dir!.entries.get(ref.name)!
  const target = entry ? entry.store : store
  // §5.3 step 5 — the callback receives the RESOLVED name; the legacy sentinel
  // (dir == null ⇒ ref null) passes '' (byte-equal discipline).
  const storeName = ref?.name ?? ''
  const ctx = { store: target }
  const emit = (payload: RagStoreChangedPayload): void => {
    onStoreChanged?.(payload, storeName)
  }
  switch (name) {
    case 'edit.set_content': {
      const nodeId = typeof args.nodeId === 'string' ? args.nodeId : ''
      // Finding 5 — pass the RAW content through (no coercion to ''). A
      // non-string content (e.g. `content:123`) reaches the op, which returns
      // its documented `'edit.set_content: content must be a string'`
      // fail-state instead of silently succeeding with an empty string.
      const content = args.content
      if (nodeId === '') throw new Error('edit.set_content: nodeId required')
      const result = await setContent(ctx, { nodeId, content: content as string })
      if (result.ok) emit({ kind: 'content', nodeIds: [nodeId], edgeIds: [], store: storeName })
      return result
    }
    case 'edit.create_node': {
      const type = typeof args.type === 'string' ? args.type : ''
      // Finding 5 — pass the RAW content through (no coercion to ''). A
      // non-string content reaches the op, which returns its documented
      // `'edit.create_node: content must be a string'` fail-state.
      const content = args.content
      const parentId = typeof args.parentId === 'string' && args.parentId !== '' ? args.parentId : undefined
      const props = args.props && typeof args.props === 'object' ? (args.props as Record<string, unknown>) : undefined
      const result = await createNode(ctx, { type, content: content as string, parentId, props })
      if (result.ok) emit({ kind: 'structural', nodeIds: [result.node.id], edgeIds: [], store: storeName })
      return result
    }
    case 'edit.delete_node': {
      const nodeId = typeof args.nodeId === 'string' ? args.nodeId : ''
      if (nodeId === '') throw new Error('edit.delete_node: nodeId required')
      const result = await deleteNode(ctx, { nodeId })
      if (result.ok && result.removed) emit({ kind: 'structural', nodeIds: [nodeId], edgeIds: [], store: storeName })
      return result
    }
    case 'edit.split_node': {
      const nodeId = typeof args.nodeId === 'string' ? args.nodeId : ''
      const at = typeof args.at === 'number' ? args.at : 0
      if (nodeId === '') throw new Error('edit.split_node: nodeId required')
      const result = await splitNode(ctx, { nodeId, at })
      if (result.ok) emit({ kind: 'structural', nodeIds: [result.nodes[0].id, result.nodes[1].id], edgeIds: [result.edge.id], store: storeName })
      return result
    }
    case 'edit.merge_node': {
      const sourceId = typeof args.sourceId === 'string' ? args.sourceId : ''
      const targetId = typeof args.targetId === 'string' ? args.targetId : ''
      if (sourceId === '' || targetId === '') throw new Error('edit.merge_node: sourceId and targetId required')
      const result = await mergeNode(ctx, { sourceId, targetId })
      if (result.ok) emit({ kind: 'structural', nodeIds: [sourceId, targetId], edgeIds: [], store: storeName })
      return result
    }
    case 'edit.set_edge': {
      const kind = typeof args.kind === 'string' ? args.kind : ''
      const source = typeof args.source === 'string' ? args.source : ''
      const target = typeof args.target === 'string' ? args.target : ''
      if (kind === '' || source === '' || target === '') throw new Error('edit.set_edge: kind, source and target required')
      const edgeId = typeof args.edgeId === 'string' && args.edgeId !== '' ? args.edgeId : undefined
      // Finding 5 — pass the RAW order through (no coercion to undefined). A
      // non-number order reaches the op, which returns its documented
      // `'edit.set_edge: order must be a number'` fail-state.
      const order = args.order
      const documentIds = Array.isArray(args.documentIds) ? (args.documentIds as string[]).filter((x): x is string => typeof x === 'string') : undefined
      const result = await setEdge(ctx, { kind, source, target, edgeId, order: order as number | undefined, documentIds })
      if (result.ok) emit({ kind: 'structural', nodeIds: [source, target], edgeIds: [result.edge.id], store: storeName })
      return result
    }
    case 'edit.import_markdown': {
      // Unit T — the markdown file import tool. Reads the corpus files, parses
      // each via parseMarkdown, validates each document's doc-flow, and applies
      // the whole corpus via applyBatch as ONE atomic batch journal entry. A
      // domain failure returns { ok: false } (never throws). On success,
      // broadcast the re-traversal trigger. The corpus root is FIXED server-side
      // (the ADDRESSED store's configured corpus root; the default store's root
      // is its configured corpus root — the project root when unconfigured, the
      // F-MS2-6 amended A5 wording) — it is NOT an agent-supplied argument (the
      // path-containment seam must not be defeatable by the caller).
      // U-MS2 §5.6 — IMPORT-ROOT-PER-STORE: the addressed entry's corpusRoot
      // flows through the importer's EXISTING programmatic param; `undefined`
      // ⇒ the importer's `resolve(params.corpusRoot ?? process.cwd())` default
      // (the zero-config byte-equal case). The LEGACY directory-less path
      // passes NO corpusRoot at all (byte-equal today — the addressed store IS
      // the default store). F2 (§5.6's pinned third argument, live since
      // U-MS4's optional `ImportStoreContext` parameter landed): the wired call
      // passes the context byte-for-byte — `isDefault` = whether the ADDRESSED
      // entry is the default; `reservedNames` carries ONLY the non-default
      // store names (U-MS4 §5.4 A1-S7: the seam takes the list as GIVEN, so
      // the wiring must never include the default store's own name).
      const files = Array.isArray(args.files) ? (args.files as unknown[]).filter((x): x is string => typeof x === 'string') : []
      const result = entry
        ? await importMarkdownCorpus(ctx, { files, corpusRoot: entry.corpusRoot }, {
            name: entry.name,
            isDefault: entry.name === dir!.defaultName,
            reservedNames: [...dir!.entries.keys()].filter((n) => n !== dir!.defaultName),
          })
        : await importMarkdownCorpus(ctx, { files })
      if (result.ok) emit({ kind: 'structural', nodeIds: result.documentIds, edgeIds: [], store: storeName })
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
  /** Unit E §5.6/§5.7 — the maintained retrieval engine, created ONCE in main
   *  (F1). `rag.query` uses it (no per-call index rebuild); `edit.*` success
   *  wires `engine.onStoreChanged` into the `rag-store-changed` broadcast. The
   *  UI `rag-query` IPC uses the same engine (MCP/UI equivalence — §8.2). */
  retrievalEngine?: RetrievalEngine
  /** U-MS2 §5.4 step 5 — the wired store directory (the N stores + N engines
   *  built at boot). When set it is the SINGLE SOURCE OF TRUTH for the
   *  rag./edit. tool routing: the handlers resolve the `store` selector
   *  through it and the default entry's store/engine serve the omitted-store
   *  calls. Wiring invariant: when `ragStores` is set, `ragStore` IS
   *  `entries.get(defaultName).store` and `retrievalEngine` IS that entry's
   *  engine. Backward-compatible: omitting it keeps today's single-store
   *  legacy path byte-equal (tests/embeddings-adversarial.test.ts:104). */
  ragStores?: RagStoreDirectory
  /** U-H2b §5.8/M1 (A-P2-1) — the registry runtime controller seam. When set,
   *  the `rag.*`/`edit.*` handler closures resolve the default store/engine/
   *  directory PER CALL from the runtime's accessors (`getDefaultStore`/
   *  `getDefaultEngine`/`getDirectory`), so a hot-apply's in-place directory
   *  mutation is observed by already-registered handlers without re-registration
   *  (D1) and every call reads the CURRENT live state. When absent, the
   *  const-captured `ragStore`/`retrievalEngine`/`ragStores` fallback serves
   *  byte-equal (the legacy/single-store path,
   *  tests/embeddings-adversarial.test.ts:104). */
  runtime?: RagStoreRuntimeController
  /** Unit I — the main-process template store. The `code.template.*` tools are
   *  handled in MAIN against this store (never routed to the renderer). Injected
   *  like `ragStore`. */
  templateStore?: TemplateStore
  /** Unit X §5.7 — the shared query-audit log, created ONCE in main and passed
   *  in. The `rag.query`/`rag-stream` handlers record to it; the
   *  `get_query_audit_log` tool reads from it. When null/absent the handlers
   *  skip recording (no throw). */
  auditLog?: QueryAuditLog | null
  /** Unit GN-MCP-UI §5.4 — the LANDED createEngineRagStore proxy (the retrieval
   *  trio + health over the F2 wire contract). The `gnosis.*` tools are handled
   *  in MAIN against this proxy (never routed to the renderer). Injected like
   *  `retrievalEngine`. The proxy is constructed at boot UNCONDITIONALLY (no
   *  I/O at construction); `waitForReady` is NOT awaited at boot and NOT
   *  exposed as a tool. */
  engineRagStore?: EngineRagStore
  /** Unit A2 §5.4 — the LANDED createEngineCrudRagStore proxy (the 11 §4.1
   *  document-CRUD methods over the frozen P1a wire). The `gnosis.document.*`/
   *  `gnosis.wiki.*` tools are handled in MAIN against this proxy (never routed
   *  to the renderer). Injected like `engineRagStore`. */
  engineCrudRagStore?: EngineCrudRagStore
  /** Unit A2 §5.4 — the shell-side authority store (H3): maps a caller identity
   *  (a human/agent user) to their edit-authority credential (the opaque `caller`
   *  string the engine's RBAC check consumes). The mutating document/wiki tools
   *  resolve the caller's credential from this store. */
  authorityStore?: AuthorityStore
  /** Unit A2 §5.4 — the caller-side idempotency registry (P4): dedups the
   *  duplicate-create risk (P1a's wire has no idempotency-key field). The
   *  mutating create tools cache their results under a `requestId`. */
  idempotency?: IdempotencyRegistry
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
  private readonly retrievalEngine: RetrievalEngine | null
  /** U-MS2 §5.4 step 5 — the wired store directory (null ⇒ the legacy
   *  single-store path). */
  private readonly ragStores: RagStoreDirectory | null
  /** U-H2b §5.8/M1 — the registry runtime controller (null ⇒ the legacy const
   *  fallback serves byte-equal). */
  private readonly runtime: RagStoreRuntimeController | null
  private readonly templateStore: TemplateStore | null
  /** Unit X §5.7 — the shared query-audit log (null ⇒ the handlers skip
   *  recording). */
  private readonly auditLog: QueryAuditLog | null
  /** Unit GN-MCP-UI §5.4 — the LANDED createEngineRagStore proxy (null ⇒ the
   *  `gnosis.*` tools' handlers throw the "no engine rag store configured"
   *  guard). */
  private readonly engineRagStore: EngineRagStore | null
  /** Unit A2 §5.4 — the LANDED createEngineCrudRagStore proxy (null ⇒ the
   *  `gnosis.document.*`/`gnosis.wiki.*` tools' handlers throw the "no engine
   *  crud rag store configured" guard). */
  private readonly engineCrudRagStore: EngineCrudRagStore | null
  /** Unit A2 §5.4 — the shell-side authority store (H3; null ⇒ fail-closed: no
   *  caller has edit authority). */
  private readonly authorityStore: AuthorityStore | null
  /** Unit A2 §5.4 — the caller-side idempotency registry (P4; null ⇒ no dedup). */
  private readonly idempotency: IdempotencyRegistry | null
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
    this.retrievalEngine = opts.retrievalEngine ?? null
    this.ragStores = opts.ragStores ?? null
    this.runtime = opts.runtime ?? null
    this.templateStore = opts.templateStore ?? null
    this.auditLog = opts.auditLog ?? null
    this.engineRagStore = opts.engineRagStore ?? null
    this.engineCrudRagStore = opts.engineCrudRagStore ?? null
    this.authorityStore = opts.authorityStore ?? null
    this.idempotency = opts.idempotency ?? null
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
    // Unit X (docs/specs/unit-x-rag-provenance-traversal.md §5.7/§5.8) — the
    // `rag`-group (read-only, default-off) tools: the degenerate `rag-stream`
    // + the `get_query_audit_log` audit-log reader. Main-handled.
    'rag-stream',
    'get_query_audit_log',
    'edit.set_content',
    'edit.create_node',
    'edit.delete_node',
    'edit.split_node',
    'edit.merge_node',
    'edit.set_edge',
    'edit.import_markdown',
    // Unit I (docs/specs/unit-i-template.md §5.3) — the `code.template.*` CRUD
    // tools, ALL in the `code` group (default-off), main-handled against the
    // template store.
    'code.template.get',
    'code.template.validate',
    'code.template.set',
    'code.template.create',
    'code.template.delete',
    'code.template.reset',
    // Unit GN-MCP-UI (docs/specs/unit-gn-mcp-ui-wiring.md §5.2) — the `gnosis`
    // (read-only, default-off) tool group: the retrieval trio + health over the
    // LANDED createEngineRagStore proxy. Main-handled. `waitForReady` is a
    // shell-side convenience (NOT a D4 parity feature) and is deliberately NOT
    // exposed as a tool.
    'gnosis.query',
    'gnosis.stream',
    'gnosis.status',
    // Unit A2 (docs/specs/unit-a2-document-crud-wiring.md §5.2) — the 11
    // document/wiki CRUD tools over the LANDED createEngineCrudRagStore proxy.
    // Main-handled. 4 read-only in `gnosis`; 7 mutating in `gnosis-edit`.
    'gnosis.document.get',
    'gnosis.document.list',
    'gnosis.wiki.get',
    'gnosis.wiki.list',
    'gnosis.document.create',
    'gnosis.document.update',
    'gnosis.document.delete',
    'gnosis.document.publish',
    'gnosis.document.unpublish',
    'gnosis.document.archive',
    'gnosis.wiki.create',
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
        ProvidentMcpServer.registerTools(liveServer, this.backend, toAdd, this.registered, this.moduleStore, this.router, this.ragStore, this.retrievalEngine, this.templateStore, this._gate, this.ragStores, this.auditLog, this.runtime, this.engineRagStore, this.engineCrudRagStore, this.authorityStore, this.idempotency)
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
    ProvidentMcpServer.registerTools(server, this.backend, this.allowedToolNames(), this.registered, this.moduleStore, this.router, this.ragStore, this.retrievalEngine, this.templateStore, this._gate, this.ragStores, this.auditLog, this.runtime, this.engineRagStore, this.engineCrudRagStore, this.authorityStore, this.idempotency)
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
    engine: RetrievalEngine | null,
    templateStore: TemplateStore | null,
    gate: SecurityGate,
    ragStores: RagStoreDirectory | null,
    auditLog: QueryAuditLog | null,
    runtime: RagStoreRuntimeController | null | undefined,
    engineRagStore: EngineRagStore | null,
    engineCrudRagStore: EngineCrudRagStore | null,
    authorityStore: AuthorityStore | null,
    idempotency: IdempotencyRegistry | null,
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
      // U-MS2 §5.2 — EVERY one of the 12 inputSchemas gains the SAME trailing
      // optional field `store: z.string().optional()` (the house `topK` mirror:
      // lax schema + strict handler validation — resolveStoreArg enforces the
      // byte-pinned M1/M2 fail-states). The existing fields of each schema are
      // UNCHANGED. No new tool name, no new group, no RpcMethod change (the
      // five-seam gate gains NOTHING — security.ts:34-45).
      { name: 'rag.query', description: 'Retrieve the relevant RAG objects + the coarse line→node map for a query (Unit E implements the retrieval; Unit X extends it with mode/maxHops/expand/maxParentContext/filters + the citations/trace/blockedBy/results/engine result fields; U-F3 adds the optional stores:"all" fan-out; registered here). Requires rag group.', inputSchema: { query: z.string(), topK: z.number().optional(), store: z.string().optional(), stores: z.enum(['all']).optional(), mode: z.enum(['flat', 'graph']).optional(), maxHops: z.number().optional(), expand: z.enum(['none', 'parent']).optional(), maxParentContext: z.number().optional(), filters: z.object({ nodeKind: z.enum(['content', 'fact', 'reference']).optional(), edgeType: z.enum(['link', 'embed']).optional(), target: z.object({ documentId: z.string(), nodeId: z.string() }).optional(), state: z.enum(['FRESH', 'RESOLVED', 'STALE', 'BROKEN']).optional() }).optional() } },
      { name: 'rag.get_document', description: 'The document\'s RAG nodes/edges (the subtree). Requires rag group.', inputSchema: { documentId: z.string(), store: z.string().optional() } },
      { name: 'rag.list_nodes', description: 'A census of RAG nodes (id, type, content preview, ownedNodeIds count). Requires rag group.', inputSchema: { store: z.string().optional() } },
      { name: 'rag.get_edges', description: 'The RAG edges (all, or those touching nodeId). Requires rag group.', inputSchema: { nodeId: z.string().optional(), store: z.string().optional() } },
      { name: 'rag.backlinks', description: 'The backlinks to nodeId (Unit G enumerates them; registered here). Requires rag group.', inputSchema: { nodeId: z.string(), store: z.string().optional() } },
      // Unit X (docs/specs/unit-x-rag-provenance-traversal.md §5.7/§5.8) — the
      // degenerate `rag-stream` (same schema as `rag.query`) + the
      // `get_query_audit_log` audit-log reader. Both `rag`-group, main-handled.
      { name: 'rag-stream', description: 'A degenerate stream of the rag.query result (Unit X §5.8): [{type:"result",result},{type:"done"}] or [{type:"error",error}] on a runtime fail-state. Requires rag group.', inputSchema: { query: z.string(), topK: z.number().optional(), store: z.string().optional(), stores: z.enum(['all']).optional(), mode: z.enum(['flat', 'graph']).optional(), maxHops: z.number().optional(), expand: z.enum(['none', 'parent']).optional(), maxParentContext: z.number().optional(), filters: z.object({ nodeKind: z.enum(['content', 'fact', 'reference']).optional(), edgeType: z.enum(['link', 'embed']).optional(), target: z.object({ documentId: z.string(), nodeId: z.string() }).optional(), state: z.enum(['FRESH', 'RESOLVED', 'STALE', 'BROKEN']).optional() }).optional() } },
      { name: 'get_query_audit_log', description: 'Read the query-audit log entries (Unit X §5.7): { entries: [{ query, filters, mode, resultCount, timestamp, requester }] }. Requires rag group.', inputSchema: {} },
      { name: 'edit.set_content', description: 'Set a RAG node\'s content (a content op → journaled, re-traversal — CONTENT-EDIT-RE-TRAVERSAL). Requires edit group.', inputSchema: { nodeId: z.string(), content: z.string(), store: z.string().optional() } },
      { name: 'edit.create_node', description: 'Create a RAG node (a structural op → journaled, re-traversal). Requires edit group.', inputSchema: { type: z.string(), content: z.string(), parentId: z.string().optional(), props: z.record(z.string(), z.unknown()).optional(), store: z.string().optional() } },
      { name: 'edit.delete_node', description: 'Delete a RAG node + cascade its edges (structural → re-traversal). Requires edit group.', inputSchema: { nodeId: z.string(), store: z.string().optional() } },
      { name: 'edit.split_node', description: 'Split a RAG node at character offset at (structural → re-traversal). Requires edit group.', inputSchema: { nodeId: z.string(), at: z.number(), store: z.string().optional() } },
      { name: 'edit.merge_node', description: 'Merge sourceId into targetId (structural → re-traversal). Requires edit group.', inputSchema: { sourceId: z.string(), targetId: z.string(), store: z.string().optional() } },
      { name: 'edit.set_edge', description: 'Create/update a RAG edge (structural → re-traversal). order is for doc-child edges; documentIds is for doc-flow edges. Requires edit group.', inputSchema: { kind: z.string(), source: z.string(), target: z.string(), edgeId: z.string().optional(), order: z.number().optional(), documentIds: z.array(z.string()).optional(), store: z.string().optional() } },
      // U-MS2 §5.2 A5 — the ONE description change (mcp-server.ts:1078): the
      // per-store import root. The schema stays `files`-ONLY otherwise (ADV-1).
      { name: 'edit.import_markdown', description: 'Import a corpus of markdown files into the addressed RAG store as a ONE-WAY SNAPSHOT (parse → validate doc-flow → applyBatch as ONE atomic batch journal entry). Requires edit group. The corpus root is fixed server-side per store: the addressed store\'s configured corpus root; the default store\'s root is its configured corpus root (the project root when unconfigured) — it is NOT an agent-supplied argument.', inputSchema: { files: z.array(z.string().min(1)).min(1), store: z.string().optional() } },
      // Unit I (docs/specs/unit-i-template.md §5.3) — the `code.template.*`
      // CRUD tools, ALL in the `code` group (default-off), main-handled against
      // the template store. `get`/`validate` are read-only; `set`/`create`/
      // `delete`/`reset` are mutating (each persists + broadcasts
      // `template-changed` → whole-graph re-derive).
      { name: 'code.template.get', description: 'Read the current content-window template + source. Requires code group.', inputSchema: {} },
      { name: 'code.template.validate', description: 'Validate a proposed content-window template against the store targetedZones (no mutation). Requires code group.', inputSchema: { template: z.unknown().optional() } },
      { name: 'code.template.set', description: 'Validate + persist a content-window template (source=custom), broadcast template-changed. Requires code group.', inputSchema: { template: z.unknown() } },
      { name: 'code.template.create', description: 'Add a container-role producer for zone to the current template, validate, persist, broadcast. Requires code group.', inputSchema: { zone: z.string(), id: z.string().optional() } },
      { name: 'code.template.delete', description: 'Remove the container-role producer for zone. A targeted zone cannot be removed (the zone-consistency invariant). Requires code group.', inputSchema: { zone: z.string() } },
      { name: 'code.template.reset', description: 'Restore the default content-window template, persist, broadcast. Requires code group.', inputSchema: {} },
      // Unit GN-MCP-UI (docs/specs/unit-gn-mcp-ui-wiring.md §5.1/§5.2) — the
      // `gnosis` (read-only, default-off) tool group: the retrieval trio +
      // health over the LANDED createEngineRagStore proxy. Main-handled. A8:
      // `gnosis.status` is a TOOL in the `gnosis` group (default-off), NOT an
      // mcp:// resource (a resource would be gated on the default-ON `read`
      // group, leaking engine status). A7: NO schema carries a credential field
      // — `baseUrl` is env/CLI config (NOT a credential), but it is never an
      // MCP tool arg either.
      { name: 'gnosis.query', description: 'Issue a gnosis ragQuery through the LANDED engine proxy and return the proxy-specific EngineRagResult (query/results/engine/citations/trace/blockedBy). Requires gnosis group.', inputSchema: { query: z.string(), topK: z.number().optional(), mode: z.enum(['flat', 'graph', 'vector', 'hybrid']).optional(), maxHops: z.number().optional(), expand: z.enum(['none', 'parent']).optional(), maxParentContext: z.number().optional(), filters: z.object({ nodeKind: z.enum(['content', 'fact', 'reference']).optional(), edgeType: z.enum(['link', 'embed']).optional(), target: z.object({ documentId: z.string(), nodeId: z.string() }).optional(), state: z.enum(['FRESH', 'RESOLVED', 'STALE', 'BROKEN']).optional() }).optional() } },
      { name: 'gnosis.stream', description: 'Collect the single-shot gnosis ragStream AsyncIterable into { chunks: RagChunk[] } (at most one result/error then done, in order). Requires gnosis group.', inputSchema: { query: z.string(), topK: z.number().optional(), mode: z.enum(['flat', 'graph', 'vector', 'hybrid']).optional(), maxHops: z.number().optional(), expand: z.enum(['none', 'parent']).optional(), maxParentContext: z.number().optional(), filters: z.object({ nodeKind: z.enum(['content', 'fact', 'reference']).optional(), edgeType: z.enum(['link', 'embed']).optional(), target: z.object({ documentId: z.string(), nodeId: z.string() }).optional(), state: z.enum(['FRESH', 'RESOLVED', 'STALE', 'BROKEN']).optional() }).optional() } },
      { name: 'gnosis.status', description: 'Read the engine HealthReport (state/version/subsystems/lastError) via the LANDED engine proxy. Read-only; does NOT record an audit entry. Requires gnosis group.', inputSchema: {} },
      // Unit A2 (docs/specs/unit-a2-document-crud-wiring.md §5.1/§5.2) — the 11
      // document/wiki CRUD tools over the LANDED createEngineCrudRagStore proxy.
      // Main-handled. 4 read-only in the `gnosis` group; 7 mutating in the NEW
      // `gnosis-edit` (mutating, default-off) group. A7: NO schema carries a
      // credential field (no token/tls/ca/cert/key/apiKey) — the `callerId` arg
      // is the caller's IDENTITY (NOT a credential; the edit-authority credential
      // is derived from the AuthorityStore, never accepted as an arg). The
      // `requestId` arg on the create tools is the caller-side idempotency key
      // (P4).
      { name: 'gnosis.document.get', description: 'Get a document by id through the LANDED CRUD proxy. Read-only; does NOT record an audit entry. Requires gnosis group.', inputSchema: { documentId: z.string() } },
      { name: 'gnosis.document.list', description: 'List documents in a wiki through the LANDED CRUD proxy (state/tag/page/pageSize filters). Read-only; does NOT record an audit entry. Requires gnosis group.', inputSchema: { wikiId: z.string(), state: z.enum(['Draft', 'Published', 'Archived']).optional(), tag: z.string().optional(), page: z.number().optional(), pageSize: z.number().optional() } },
      { name: 'gnosis.wiki.get', description: 'Get a wiki by id through the LANDED CRUD proxy. Read-only; does NOT record an audit entry. Requires gnosis group.', inputSchema: { wikiId: z.string() } },
      { name: 'gnosis.wiki.list', description: 'List all wikis through the LANDED CRUD proxy. Read-only; does NOT record an audit entry. Requires gnosis group.', inputSchema: {} },
      { name: 'gnosis.document.create', description: 'Create a document in a wiki through the LANDED CRUD proxy. Mutating; requires the gnosis-edit group + the caller\'s edit authority. The callerId is the caller\'s identity (the credential is derived from the AuthorityStore). A requestId dedups a duplicate create (P4).', inputSchema: { callerId: z.string(), wikiId: z.string(), title: z.string(), tags: z.array(z.string()).optional(), author: z.string().optional(), requestId: z.string().optional() } },
      { name: 'gnosis.document.update', description: 'Update a document through the LANDED CRUD proxy (optimistic concurrency via baseRevision; a stale baseRevision surfaces ConflictError 409). Mutating; requires the gnosis-edit group + the caller\'s edit authority.', inputSchema: { callerId: z.string(), documentId: z.string(), baseRevision: z.number(), graph: z.object({ nodes: z.array(z.unknown()), edges: z.array(z.unknown()) }), title: z.string().optional(), tags: z.array(z.string()).optional() } },
      { name: 'gnosis.document.delete', description: 'Delete a document through the LANDED CRUD proxy. Mutating; requires the gnosis-edit group + the caller\'s edit authority.', inputSchema: { callerId: z.string(), documentId: z.string() } },
      { name: 'gnosis.document.publish', description: 'Publish a document through the LANDED CRUD proxy (the publish gate). Mutating; requires the gnosis-edit group + the caller\'s edit authority.', inputSchema: { callerId: z.string(), documentId: z.string() } },
      { name: 'gnosis.document.unpublish', description: 'Unpublish a document through the LANDED CRUD proxy. Mutating; requires the gnosis-edit group + the caller\'s edit authority.', inputSchema: { callerId: z.string(), documentId: z.string() } },
      { name: 'gnosis.document.archive', description: 'Archive a document through the LANDED CRUD proxy. Mutating; requires the gnosis-edit group + the caller\'s edit authority.', inputSchema: { callerId: z.string(), documentId: z.string() } },
      { name: 'gnosis.wiki.create', description: 'Create a wiki through the LANDED CRUD proxy. Mutating; requires the gnosis-edit group + the caller\'s edit authority. A requestId dedups a duplicate create (P4).', inputSchema: { callerId: z.string(), name: z.string(), requestId: z.string().optional() } },
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
        // U-MS2 §5.3/§5.5 — the wired directory is passed to BOTH shared
        // handlers so the `store` selector resolves identically on the tool
        // path (the omitted ⇒ default-entry rule applies; an unknown store
        // fails loud BEFORE any tool-specific validation).
        if (name.startsWith('rag.') || name === 'get_query_audit_log' || name === 'rag-stream') {
          // Unit B + Unit X — the rag.* tools + the `get_query_audit_log`/
          // `rag-stream` tools are MAIN-process (the RAG store + the shared
          // audit log), NOT routed to the renderer. The shared audit log is
          // threaded through so the `rag.query`/`rag-stream` handlers record to
          // it and `get_query_audit_log` reads from it.
          return text(await handleRagTool(runtime ? runtime.getDefaultStore() : ragStore, name, args, runtime ? runtime.getDefaultEngine() : engine, runtime ? runtime.getDirectory() : ragStores, auditLog))
        }
        // Unit GN-MCP-UI §5.3 — the gnosis.* tools are MAIN-process (the LANDED
        // engine proxy), never routed to the renderer. The shared audit log is
        // threaded through so `gnosis.query`/`gnosis.stream` record to it (like
        // `rag.query`); `gnosis.status` is read-only and does NOT record.
        if (name.startsWith('gnosis.')) {
          return text(await handleGnosisTool(engineRagStore, name, args, auditLog, engineCrudRagStore, authorityStore, idempotency))
        }
        if (name.startsWith('edit.')) {
          // H5 (§5.1.9) — after a successful edit mutation, wire the retrieval
          // engine's incremental index reconcile (F1) AND broadcast the
          // `rag-store-changed` re-traversal trigger to the renderer.
          // U-MS2 §5.5 — the callback is widened to `(payload, storeName)` and
          // the reconcile resolves the ADDRESSED store's engine PER CALL
          // (D5 — ENGINE-PER-STORE): a call addressing store X reconciles ONLY
          // X's engine (a foreign store's index is untouched). With no
          // directory wired (the legacy single-store options), the BOUND
          // engine reconciles exactly as today (backward-compatible —
          // `retrievalEngine` stays a live option). The broadcast payload
          // shape is UNCHANGED (the `store` field is U-MS3's).
          const result = await handleEditTool(runtime ? runtime.getDefaultStore() : ragStore, name, args, (payload, storeName) => {
            const reconcileEngine = runtime
              ? runtime.getDirectory().entries.get(storeName)?.engine ?? null
              : (ragStores ? (ragStores.entries.get(storeName)?.engine ?? null) : engine)
            // F1 — the index reconcile is fire-and-forget, but a rejection
            // (e.g. the vector embedder's provider is down) MUST be caught —
            // never an unhandled rejection. The lexical index is already
            // reconciled inside the engine's `onStoreChanged` before the
            // embedder hook runs, so a hook failure only leaves the vector
            // index stale (logged), not the lexical index.
            void reconcileEngine?.onStoreChanged(payload.kind, payload.nodeIds, payload.edgeIds)?.catch((e) => {
              console.error('[provident-mcp] retrieval index reconcile failed:', e)
            })
            backend.broadcast?.(IPC_RAG_STORE_CHANGED, payload)
          }, runtime ? runtime.getDirectory() : ragStores)
          return text(result)
        }
        // Unit I — the code.template.* tools are MAIN-process (the template
        // store), NOT routed to the renderer. On a successful mutation they
        // broadcast `template-changed` (the whole-graph re-derive trigger).
        if (name.startsWith('code.template.')) {
          const result = handleTemplateTool(templateStore, name, args, (payload) => {
            backend.broadcast?.(IPC_TEMPLATE_CHANGED, payload)
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