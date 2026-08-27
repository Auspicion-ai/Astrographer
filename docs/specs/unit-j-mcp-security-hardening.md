# Spec — Unit J: MCP/Security Hardening

- **Status:** SPEC (later unit J — the completion/hardening pass). Gate reference:
  `docs/specs/astrographer-review.md` §7 scope item 10 / line 100 (J as the
  hardening pass for the `rag`/`edit` groups + the equivalence surface), §8.2
  (MCP/UI equivalence — a BINDING constraint: the same graph, the same
  rendering, and the same operations must be reachable equivalently through the
  MCP surface and the Electron UI), §9.2.7 (RAG-EDIT-MCP-GROUPS — the read-only
  `rag` tool group default-off + the mutating `edit` tool group default-off;
  editing is NEVER a `code`-group op), Amendment 1 (the gating *decisions*
  belong to Units B and D; J is the hardening/completion pass). Decisions:
  `docs/decisions.md` rows **RAG-EDIT-MCP-GROUPS**, **SINGLE-WRITER-STORE**,
  **RAG-AUTHORITATIVE**, **MCP-UI-EQUIVALENCE** (the §8.2 BINDING constraint),
  **CODE-GROUP-TEMPLATE-CRUD** (Unit I — the `code.template.*` tools ride the
  `code` group).
- **Scope:** the COMPLETION/HARDENING pass over the `rag`/`edit`/`code.template.*`
  tool groups and the MCP↔UI equivalence surface. It AUDITS the five-seam gate
  (completeness, default-off, read-vs-mutating split), the equivalence surface
  (every MCP tool with a UI IPC counterpart routes through the SAME handler),
  the renderer switch (fails closed on unknown methods), and `MUTATING_METHODS`
  (covers every mutating method). It pins the hardening as a VERIFICATION
  CONTRACT (the invariants that must hold) + the full tool inventory (the audit
  baseline) + the equivalence mapping. This unit does NOT implement new
  behavior — it audits the already-implemented Units B/D/E/G/I surfaces and
  pins the invariants a TestWriter can verify. If the audit surfaces a gap, the
  spec pins the gap + the fix; the audit of the current build finds NO gaps, so
  the spec pins the verification contract.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the audit surfaces
  (`src/main/security.ts`, `src/main/mcp-server.ts`, `src/renderer/renderer.ts`,
  `src/shared/types.ts`, `src/main/main.ts`, `src/main/preload.ts`) from
  §5.8/§5.9 before any implementation.

---

## 1. What the proposal asks

1. **The hardening scope.** The completion pass covers the `rag`/`edit` groups
   (completeness, default-off, read-vs-mutating split) + the equivalence surface
   (MCP tools vs UI IPC — the SAME handler serves both, per §8.2). The gating
   *decisions* were designed in Units B and D; J is the hardening/completion
   pass that audits the implemented surface and pins the invariants.
2. **The `rag`/`edit` group completeness audit.** Every `rag.*` tool is
   read-only + `rag`-group + default-off; every `edit.*` tool is mutating +
   `edit`-group + default-off; editing is NEVER a `code`-group op. Pin the
   audit as a contract (the full tool inventory + their group/read-mutating
   classification).
3. **The equivalence surface audit.** Every MCP tool that has a UI IPC
   counterpart (rag.query/rag-query, rag.backlinks/rag-backlinks,
   edit.set_content/edit-commit, code.template.*/template IPC) routes through
   the SAME handler. Pin the equivalence as a contract (the MCP tool ↔ IPC
   channel ↔ shared handler mapping).
4. **The hardening gaps.** Pin any gaps the audit surfaces + the fix (or, if
   none, the verification contract). The audit of the current build finds NO
   gaps; the spec pins the hardening as a VERIFICATION contract (the invariants
   that must hold).

## 2. Feasibility verdict

**Feasible — the hardening pass is a VERIFICATION contract over already-
implemented surfaces.** The `rag`/`edit`/`code.template.*` groups are fully
implemented through the five-seam gate (Unit B §5.3, Unit I §5.3); the
equivalence surface is fully implemented (Unit D §5.7, Unit E §5.7, Unit G
§5.4, Unit I §5.3/§5.4); the renderer switch fails closed; `MUTATING_METHODS`
covers every mutating method. The audit of the current build (`src/main/
security.ts`, `src/main/mcp-server.ts`, `src/renderer/renderer.ts`,
`src/shared/types.ts`, `src/main/main.ts`, `src/main/preload.ts`) confirms the
invariants hold. No engine/foundation gap blocks this unit. ENG-GAP-1
(MarkdownAdapter `data-node-id`, D7) is SHELVED 2026-08-26 (markdown is
export-only; the host-side line→node map covers it — see `docs/pending.md`).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The hardening audit (the five-seam gate + the equivalence surface + the renderer switch + `MUTATING_METHODS`) | Project-specific (pure host-side verification over the implemented surfaces) | Low cost; pins the invariants a TestWriter can verify. |
| The tool inventory (the audit baseline) | Project-specific (the 17 `rag`/`edit`/`code.template.*` tool names) | Low cost; the full inventory + group/read-mutating classification. |
| The equivalence mapping (MCP tool ↔ IPC channel ↔ shared handler) | Project-specific (the §8.2 BINDING constraint) | Low cost; the same-handler routing contract. |

**Audit result: NO hardening gaps.** The audit of the current build finds the
invariants hold (see §5.2). The spec pins the hardening as a VERIFICATION
contract. The known limitations (§5.7) are DOCUMENTED behaviors, not gaps to
fix.

No engine gap. ENG-GAP-1 is SHELVED 2026-08-26 (markdown is export-only;
markdown-parsing-to-storage will use text-match diffing — see
`docs/pending.md`).

### 3a. Adversarial findings

The post-green adversarial pass (RCA-3) for Unit J audits the hardening
invariants for edge cases / unauthorized access / malformed inputs. The audit
of the current build surfaces NO host findings requiring a fix (the invariants
hold — see §5.2). The adversarial checks that MUST be regression-tested are
pinned in §5.9 (the fail-states): a `rag.*`/`edit.*`/`code.template.*` method
reaching the renderer switch throws `unknown method` (fail-closed); a mutating
method missing from `MUTATING_METHODS` is a finding; a tool missing from a
group is a finding; an IPC channel not routing through the shared handler is a
finding. No package/upstream findings (nothing went to `docs/defects.md`/
`docs/HANDOFF.md`).

## 4. Design decisions pinned by this spec

- **HARDENING-VERIFICATION-CONTRACT:** the hardening pass is a VERIFICATION
  contract — the invariants in §5.2 MUST hold. A TestWriter derives every
  state and fail-state from §5.8/§5.9. If a future change breaks an invariant,
  it is a review finding.
- **RAG-EDIT-MCP-GROUPS (consumed):** `rag` (read-only, default-off) + `edit`
  (mutating, default-off), through the five-seam gate. Editing is NEVER a
  `code`-group op.
- **MCP-UI-EQUIVALENCE (consumed, §8.2 BINDING):** every MCP tool with a UI IPC
  counterpart routes through the SAME handler. The equivalence surface is a
  first-class, equivalent access path, not an afterthought.
- **CODE-GROUP-TEMPLATE-CRUD (consumed, Unit I):** the `code.template.*` tools
  ride the `code` group (default-off), main-handled against the template store.
- **IPC-SURFACE-NOT-GROUP-GATED (pinned):** the renderer→main IPC channels
  (`edit-commit`, `rag-query`, `rag-backlinks`, `IPC_TEMPLATE_*`) are NOT
  group-gated — the renderer is a trusted surface that calls main directly.
  The `rag`/`edit`/`code` groups gate the MCP AGENT path only. This is a
  documented design decision, not a gap.
- **EDIT-COMMIT-RETURN-ASYMMETRY (pinned):** the `edit.set_content` MCP tool
  returns `SetContentResult` (the full updated node), while the `edit-commit`
  IPC returns `EditCommitResult` (the nodeId only). BOTH call the same
  `setContent` op and produce the same store state + re-traversal; the return
  shape differs because the IPC is the renderer's commit contract. This is a
  documented asymmetry, not a gap.

## 5. The exhaustive contract

### 5.1 The hardening scope

The completion pass covers TWO surfaces:

1. **The `rag`/`edit`/`code.template.*` tool groups** — completeness (every
   tool is registered in every seam), default-off (not in
   `defaultSecurityConfig`), and the read-vs-mutating split (every `rag.*` is
   read-only; every `edit.*` is mutating; `code.template.get`/`validate` are
   read-only, `set`/`create`/`delete`/`reset` are mutating).
2. **The equivalence surface** — every MCP tool with a UI IPC counterpart
   routes through the SAME handler (the §8.2 BINDING constraint).

The hardening pass does NOT add new behavior. It audits the implemented
surfaces and pins the invariants.

### 5.2 The hardening contract (the invariants that MUST hold)

The following invariants are the VERIFICATION CONTRACT. A TestWriter derives
every state and fail-state from them. A future change that breaks an invariant
is a review finding.

**(a) Every `rag.*` tool is read-only + `rag`-group + default-off.**
- The 5 `rag.*` tools (`rag.query`, `rag.get_document`, `rag.list_nodes`,
  `rag.get_edges`, `rag.backlinks`) map to the `rag` group in `TOOL_GROUPS`
  (`src/main/security.ts`).
- None of them mutate the RAG store (they call read methods: `listNodes`,
  `listEdges`, `getNode`, `enumerateLinks`, the retrieval engine's `query`).
- The `rag` group is NOT in `defaultSecurityConfig()` (`{ token: null, enabled:
  ['read', 'dispatch'] }`), so the tools are default-off.
- A `rag.*` tool is callable only when the `rag` group is enabled.

**(b) Every `edit.*` tool is mutating + `edit`-group + default-off.**
- The 6 `edit.*` tools (`edit.set_content`, `edit.create_node`,
  `edit.delete_node`, `edit.split_node`, `edit.merge_node`, `edit.set_edge`)
  map to the `edit` group in `TOOL_GROUPS`.
- Each of them mutates the RAG store (via the edit ops in `src/main/edit-ops.ts`
  — `setContent`/`createNode`/`deleteNode`/`splitNode`/`mergeNode`/`setEdge`),
  serialized through the single-writer queue.
- The `edit` group is NOT in `defaultSecurityConfig()`, so the tools are
  default-off.
- An `edit.*` tool is callable only when the `edit` group is enabled.

**(c) Editing is NEVER a `code`-group op.**
- The `edit.*` tools map to the `edit` group, NOT `code`. An agent with only
  `code` enabled cannot edit the RAG store.
- The `code.template.*` tools (Unit I) DO map to `code` — but they edit the
  TEMPLATE store, not the RAG store. The template is the envelope's `template`,
  not RAG content. This is consistent: RAG editing is `edit`-group; template
  editing is `code`-group.

**(d) Every MCP tool with a UI IPC counterpart routes through the SAME handler.**
- The equivalence mapping in §5.4 MUST hold. For each pair, the MCP tool and the
  IPC channel call the SAME shared handler (or the same underlying op/module).
- The equivalence is a BINDING constraint (§8.2): the same graph, the same
  rendering, and the same operations are reachable equivalently through the MCP
  surface and the Electron UI.

**(e) The renderer switch fails closed on unknown methods.**
- `src/renderer/renderer.ts` `handleRequest` has NO `rag.*`/`edit.*`/
  `code.template.*` cases (they are main-handled, intercepted in
  `mcp-server.ts`). A method that somehow reaches the renderer hits the
  `default` branch and throws `unknown method: <method>` (fail-closed).

**(f) `MUTATING_METHODS` covers every mutating method.**
- `MUTATING_METHODS` (`src/renderer/renderer.ts`) = `{ 'dispatch', 'load',
  'op', 'teardown', 'code.load', 'code.loadBatch', 'journal' }` — the methods
  that mutate the RENDERER app graph (content/structural/re-derive).
- The `edit.*`/`code.template.*` mutating tools are main-handled and do NOT
  mutate the renderer graph, so they are NOT in `MUTATING_METHODS` (the
  negative contract — Unit B §5.3 Seam 5, Unit I §5.3 Seam 5).
- `code.set`/`code.create`/`code.delete` mutate the ENVELOPE (the code tree),
  not the rendered graph, so they are NOT in `MUTATING_METHODS` (no re-render,
  no push).

### 5.3 The tool inventory (the audit baseline)

The full `rag`/`edit`/`code.template.*` tool inventory + their group/read-
mutating classification. This is the audit baseline — every tool MUST be
registered in every seam (§5.5).

**`rag` group (read-only, default-off):**

| Tool | Group | Read/Mutating | Handler (main) | Return |
| --- | --- | --- | --- | --- |
| `rag.query` | `rag` | read-only | `handleRagTool` case `'rag.query'` | `RetrievalResult` (`{ query, ranked, context, markdown, lineMap, k }`) |
| `rag.get_document` | `rag` | read-only | `handleRagTool` case `'rag.get_document'` | `{ documentId, nodes, edges }` — **PLACEHOLDER** (returns the ENTIRE store, not the document's subtree; full subtree scoping lands in Unit C — §5.7) |
| `rag.list_nodes` | `rag` | read-only | `handleRagTool` case `'rag.list_nodes'` | `Array<{ id, type, content, ownedNodeIds }>` (content preview = `content.slice(0, 80)`) |
| `rag.get_edges` | `rag` | read-only | `handleRagTool` case `'rag.get_edges'` | `RagEdge[]` (all, or those touching `nodeId`) |
| `rag.backlinks` | `rag` | read-only | `handleRagTool` case `'rag.backlinks'` | `BacklinkResult` |

**`edit` group (mutating, default-off):**

| Tool | Group | Read/Mutating | Handler (main) | Op | Result |
| --- | --- | --- | --- | --- | --- |
| `edit.set_content` | `edit` | mutating | `handleEditTool` case `'edit.set_content'` | `setContent` | `SetContentResult` |
| `edit.create_node` | `edit` | mutating | `handleEditTool` case `'edit.create_node'` | `createNode` | `CreateNodeResult` |
| `edit.delete_node` | `edit` | mutating | `handleEditTool` case `'edit.delete_node'` | `deleteNode` | `DeleteNodeResult` |
| `edit.split_node` | `edit` | mutating | `handleEditTool` case `'edit.split_node'` | `splitNode` | `SplitNodeResult` |
| `edit.merge_node` | `edit` | mutating | `handleEditTool` case `'edit.merge_node'` | `mergeNode` | `MergeNodeResult` |
| `edit.set_edge` | `edit` | mutating | `handleEditTool` case `'edit.set_edge'` | `setEdge` | `SetEdgeResult` |

**`code.template.*` group (the `code` group, default-off):**

| Tool | Group | Read/Mutating | Handler (main) | Return / Effect |
| --- | --- | --- | --- | --- |
| `code.template.get` | `code` | read-only | `handleTemplateTool` case `'code.template.get'` | `{ source, template }` |
| `code.template.validate` | `code` | read-only | `handleTemplateTool` case `'code.template.validate'` | `TemplateVerdict` |
| `code.template.set` | `code` | mutating | `handleTemplateTool` case `'code.template.set'` | `{ source: 'custom', template }` + `template-changed` |
| `code.template.create` | `code` | mutating | `handleTemplateTool` case `'code.template.create'` | `{ source, template }` + `template-changed` |
| `code.template.delete` | `code` | mutating | `handleTemplateTool` case `'code.template.delete'` | `{ source, template }` + `template-changed` |
| `code.template.reset` | `code` | mutating | `handleTemplateTool` case `'code.template.reset'` | `{ source: 'default', template }` + `template-changed` |

**Census:** 5 `rag.*` + 6 `edit.*` + 6 `code.template.*` = **17 tool names** in
`ALL_TOOLS` (beyond the foundation's existing tools). 2 new `ToolGroup` values
(`rag`, `edit`); the `code` group is reused for `code.template.*`. `VALID_GROUPS`
= 7 values (`read`, `dispatch`, `graph`, `code`, `module`, `rag`, `edit`).

### 5.4 The equivalence mapping (MCP tool ↔ IPC channel ↔ shared handler)

The equivalence surface — every MCP tool with a UI IPC counterpart routes
through the SAME handler. This is the §8.2 BINDING constraint.

| MCP tool | IPC channel | Shared handler / op | Equivalence |
| --- | --- | --- | --- |
| `rag.query` | `IPC_RAG_QUERY` (`rag-query`) | `handleRagTool` case `'rag.query'` / `handleRagQueryIpc` → the SAME maintained retrieval engine's `query` | Same params → same `RetrievalResult` |
| `rag.backlinks` | `IPC_RAG_BACKLINKS` (`rag-backlinks`) | `handleRagTool` case `'rag.backlinks'` / `handleRagBacklinksIpc` → the SAME `enumerateLinks` | Same `nodeId` → same `BacklinkResult` |
| `edit.set_content` | `IPC_EDIT_COMMIT` (`edit-commit`) | `handleEditTool` case `'edit.set_content'` / `handleEditCommit` → the SAME `setContent` op | Same params → same store state + re-traversal (return shape differs — §5.7) |
| `code.template.get` | `IPC_TEMPLATE_GET` | `handleTemplateTool` case `'code.template.get'` | Same → same `{ source, template }` |
| `code.template.validate` | `IPC_TEMPLATE_VALIDATE` | `handleTemplateTool` case `'code.template.validate'` | Same → same `TemplateVerdict` |
| `code.template.set` | `IPC_TEMPLATE_SET` | `handleTemplateTool` case `'code.template.set'` | Same → same store + re-derive |
| `code.template.create` | `IPC_TEMPLATE_CREATE` | `handleTemplateTool` case `'code.template.create'` | Same → same store + re-derive |
| `code.template.delete` | `IPC_TEMPLATE_DELETE` | `handleTemplateTool` case `'code.template.delete'` | Same → same store + re-derive |
| `code.template.reset` | `IPC_TEMPLATE_RESET` | `handleTemplateTool` case `'code.template.reset'` | Same → same store + re-derive |

**The shared-handler routing (pinned):**

- **`rag.query` / `rag-query`:** the MCP tool calls `handleRagTool(ragStore,
  'rag.query', args, engine)`; the IPC handler (`ipcMain.handle(IPC_RAG_QUERY)`
  in `main.ts`) calls `handleRagQueryIpc(engine, ragStore, payload)`, which
  delegates to `handleRagTool(ragStore, 'rag.query', { query, topK }, engine)`.
  BOTH use the SAME maintained engine (created once in `main.ts`). Neither
  computes retrieval in the renderer.
- **`rag.backlinks` / `rag-backlinks`:** the MCP tool calls `handleRagTool(
  ragStore, 'rag.backlinks', args)` → `enumerateLinks(store, nodeId)`; the IPC
  handler (`ipcMain.handle(IPC_RAG_BACKLINKS)`) calls `handleRagBacklinksIpc(
  ragStore, { nodeId })` → `enumerateLinks(store, nodeId)`. BOTH call the SAME
  `enumerateLinks`. Neither computes the enumeration in the renderer.
- **`edit.set_content` / `edit-commit`:** the MCP tool calls `handleEditTool(
  ragStore, 'edit.set_content', args, onStoreChanged)` → `setContent(ctx, {
  nodeId, content })`; the IPC handler (`ipcMain.handle(IPC_EDIT_COMMIT)`) calls
  `handleEditCommit(ragStore, { nodeId, content })` → `setContent({ store }, {
  nodeId, content })`. BOTH call the SAME `setContent` op. Neither writes to the
  RAG store from the renderer.
- **`code.template.*` / `IPC_TEMPLATE_*`:** the MCP tools call `handleTemplateTool(
  templateStore, name, args, onTemplateChanged)`; the IPC handlers
  (`ipcMain.handle(IPC_TEMPLATE_*)` in `main.ts`) call `handleTemplateTool(
  templateStore, name, payload, onTemplateChanged)` with the SAME template
  store. BOTH call the SAME `handleTemplateTool`. Neither computes template
  CRUD in the renderer.

**The IPC surface is NOT group-gated** (the renderer is a trusted surface that
calls main directly — §4 IPC-SURFACE-NOT-GROUP-GATED). The `rag`/`edit`/`code`
groups gate the MCP agent path only.

### 5.5 The five-seam gate audit

Every `rag`/`edit`/`code.template.*` tool MUST be registered in every seam.
The audit of the current build confirms all 17 tools are registered in all five
seams.

**Seam 1 — `src/main/security.ts` TOOL_GROUPS:**
- `ToolGroup` union = `'read' | 'dispatch' | 'graph' | 'code' | 'module' |
  'rag' | 'edit'` (7 values).
- `TOOL_GROUPS` maps the 5 `rag.*` → `'rag'`, the 6 `edit.*` → `'edit'`, the 6
  `code.template.*` → `'code'`.
- `groupForTool(toolName)` returns the exact-name static group, or `null` for
  an unknown name (fail-closed). A non-string `toolName` → `null`.
- `toolAllowed(toolName, enabled)` returns `group !== null && set.has(group)`.
- `defaultSecurityConfig()` = `{ token: null, enabled: ['read', 'dispatch'] }`
  — `rag`/`edit`/`code` are NOT enabled by default.
- `VALID_GROUPS` (in `applyPatch`) = `{ 'read', 'dispatch', 'graph', 'code',
  'module', 'rag', 'edit' }` (7 values).
- `applyPatch` rejects a patch with a token/groups/disable field of the wrong
  shape (config unchanged, never throws).

**Seam 2 — `src/main/mcp-server.ts` ALL_TOOLS + registerTools:**
- `ALL_TOOLS` contains the 5 `rag.*` + 6 `edit.*` + 6 `code.template.*` names.
- `registerTools` handles the `rag.`/`edit.`/`code.template.` tools IN MAIN
  (the `name.startsWith('rag.')` / `name.startsWith('edit.')` /
  `name.startsWith('code.template.')` branches), calling the main-process RAG
  store / template store — NEVER routed to the renderer.
- The `rag.*`/`edit.*` tools depend on the `RagStore` INTERFACE (Unit A §5.4 —
  SOURCE-SWITCHABLE); the `code.template.*` tools depend on the `TemplateStore`.
- A tool registers ONLY when its group is allowed (the `registeredToolNames`
  gate).
- `ProvidentMcpServerOptions` gains `ragStore?`, `retrievalEngine?`,
  `templateStore?` (injected like `moduleStore`).

**Seam 3 — `src/shared/types.ts` RpcMethod:**
- The `RpcMethod` union contains the 5 `rag.*` + 6 `edit.*` + 6
  `code.template.*` method names (the main-handled tools declare their method
  names here for the shared IPC contract).

**Seam 4 — renderer switch (`src/renderer/renderer.ts` `handleRequest`):**
- **Negative contract:** the `rag.*`/`edit.*`/`code.template.*` tools are
  main-handled and NEVER reach the renderer switch. The switch has NO cases for
  them. A method that somehow reaches the renderer hits the `default` branch
  and throws `unknown method: <method>` (fail-closed).

**Seam 5 — `MUTATING_METHODS` (`src/renderer/renderer.ts`):**
- **Negative contract:** the `edit.*`/`code.template.*` mutating tools are
  main-handled and do NOT mutate the renderer graph, so they are NOT added to
  `MUTATING_METHODS` (which drives the app-graph-changed push for the RENDERER
  graph). The RAG-store mutation is announced by the `rag-store-changed`
  broadcast; the template-store mutation by the `template-changed` broadcast.

### 5.6 The renderer switch + `MUTATING_METHODS` audit

**The renderer switch (`handleRequest`)** handles exactly these methods:
`dispatch`, `renderedHtml`, `markdown`, `listTargets`, `nodeState`, `load`,
`op`, `export`, `validate`, `teardown`, `code.get`, `code.set`, `code.create`,
`code.delete`, `code.validate`, `code.load`, `code.loadBatch`, `journal` (18
cases). The `default` branch throws `unknown method: <method>` (fail-closed).

**`MUTATING_METHODS`** = `{ 'dispatch', 'load', 'op', 'teardown', 'code.load',
'code.loadBatch', 'journal' }` (7 methods). These are the methods that mutate
the RENDERER app graph (content/structural/re-derive). The audit confirms:
- `dispatch`, `load`, `op`, `teardown`, `code.load`, `code.loadBatch`,
  `journal` are all in the set (they mutate/re-derive the app graph).
- `code.set`/`code.create`/`code.delete` mutate the ENVELOPE (the code tree),
  not the rendered graph — NOT in the set (no re-render, no push). Correct.
- `export`/`validate`/`renderedHtml`/`markdown`/`listTargets`/`nodeState`/
  `code.get`/`code.validate` are read-only — NOT in the set. Correct.
- The `edit.*`/`code.template.*` mutating tools are main-handled — NOT in the
  set (the negative contract). Correct.

### 5.7 Known limitations (documented behaviors, NOT gaps)

The audit surfaces the following DOCUMENTED behaviors. They are NOT hardening
gaps — they are pinned so a TestWriter does not misclassify them.

1. **`rag.get_document` is a PLACEHOLDER.** It returns the ENTIRE store
   (`{ documentId, nodes: store.listNodes(), edges: store.listEdges() }`), not
   the document's subtree. Full subtree scoping lands in Unit C (the
   traversal/render spine). This is a known behavior (Unit B §5.4 Finding 4),
   not a gap.
2. **The IPC surfaces are NOT group-gated.** The `edit-commit`, `rag-query`,
   `rag-backlinks`, and `IPC_TEMPLATE_*` channels are renderer→main IPC that
   the renderer (a trusted surface) calls directly. The `rag`/`edit`/`code`
   groups gate the MCP agent path only. This is a documented design decision
   (§4 IPC-SURFACE-NOT-GROUP-GATED), not a gap.
3. **The `edit.set_content` MCP tool and the `edit-commit` IPC return DIFFERENT
   shapes.** The MCP tool returns `SetContentResult` (the full updated node);
   the IPC returns `EditCommitResult` (the nodeId only). BOTH call the same
   `setContent` op and produce the same store state + re-traversal. The return
   shape differs because the IPC is the renderer's commit contract (§4
   EDIT-COMMIT-RETURN-ASYMMETRY). This is a documented asymmetry, not a gap.
4. **The `rag.query` MCP tool's `topK` default is 5** (both the MCP tool and
   the `rag-query` IPC default to 5). Consistent across the equivalence
   surface.

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`rag` group default-off:** `defaultSecurityConfig()` = `{ token: null,
   enabled: ['read', 'dispatch'] }` — the `rag` group is NOT enabled by
   default; a `rag.*` tool is not registered/callable until `rag` is enabled.
2. **`edit` group default-off:** the `edit` group is NOT enabled by default; an
   `edit.*` tool is not registered/callable until `edit` is enabled.
3. **`code.template.*` default-off:** the `code` group is NOT enabled by
   default; a `code.template.*` tool is not registered/callable until `code`
   is enabled.
4. **`rag` group enabled → tools callable:** with `rag` enabled, all 5 `rag.*`
   tools register and are callable.
5. **`edit` group enabled → tools callable:** with `edit` enabled, all 6
   `edit.*` tools register and are callable.
6. **`code` group enabled → `code.template.*` callable:** with `code` enabled,
   all 6 `code.template.*` tools register and are callable.
7. **Editing is never a `code`-group op:** an `edit.*` tool with only `code`
   enabled → not registered, not callable (`toolAllowed` returns false).
8. **`rag.query` / `rag-query` equivalence:** an MCP `rag.query` and a UI
   `rag-query` IPC with the same params → the same `RetrievalResult` (both use
   the same maintained engine).
9. **`rag.backlinks` / `rag-backlinks` equivalence:** an MCP `rag.backlinks` and
   a UI `rag-backlinks` IPC with the same `nodeId` → the same `BacklinkResult`
   (both call the same `enumerateLinks`).
10. **`edit.set_content` / `edit-commit` equivalence:** an MCP `edit.set_content`
    and a UI `edit-commit` IPC with the same params → the same store state +
    the same re-traversal (both call the same `setContent` op).
11. **`code.template.*` / `IPC_TEMPLATE_*` equivalence:** an MCP
    `code.template.get` and a UI `bridge.template.get()` → the same
    `{ source, template }` from the same template store.
12. **Renderer switch fails closed:** a `rag.*`/`edit.*`/`code.template.*`
    method that somehow reaches the renderer switch → the `default` branch
    throws `unknown method: <method>` (fail-closed).
13. **`MUTATING_METHODS` completeness:** every renderer-graph-mutating method
    (`dispatch`, `load`, `op`, `teardown`, `code.load`, `code.loadBatch`,
    `journal`) is in `MUTATING_METHODS`; the read-only and envelope-mutating
    methods are NOT.
14. **`rag.get_document` placeholder:** `rag.get_document` with a valid
    `documentId` → `{ documentId, nodes: <all nodes>, edges: <all edges> }`
    (the placeholder behavior — returns the entire store).
15. **`rag.list_nodes` census:** `rag.list_nodes` → an array of
    `{ id, type, content, ownedNodeIds }` (content preview = `content.slice(0,
    80)`).
16. **`rag.get_edges` all:** `rag.get_edges` with no `nodeId` → all edges.
17. **`rag.get_edges` filtered:** `rag.get_edges` with a `nodeId` → the edges
    where `source === nodeId || target === nodeId`.
18. **`rag.backlinks` happy:** `rag.backlinks` with a valid `nodeId` → the
    `BacklinkResult`.
19. **`rag.query` happy:** `rag.query` with a valid query → the
    `RetrievalResult` (awaited).
20. **`edit.*` happy:** each `edit.*` tool with valid params → the op's
    `{ ok: true, ... }` result + a `rag-store-changed` broadcast (the
    re-traversal trigger).
21. **`code.template.*` happy:** each `code.template.*` tool with valid params
    → the documented result; the mutating ones broadcast `template-changed`.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **A `rag.*` tool with the `rag` group disabled** → not registered, not
   callable (`toolAllowed` returns false).
2. **An `edit.*` tool with the `edit` group disabled** → not registered, not
   callable.
3. **A `code.template.*` tool with the `code` group disabled** → not
   registered, not callable.
4. **An `edit.*` tool invoked with only `code` enabled** → denied (editing is
   never a `code`-group op).
5. **A `rag.*`/`edit.*`/`code.template.*` method reaching the renderer switch**
   → throws `unknown method: <method>` (fail-closed, the Seam-4 negative
   contract).
6. **A mutating method missing from `MUTATING_METHODS`** → a review finding
   (the invariant (f) is broken). The audit confirms the set is complete.
7. **A tool missing from a group** (a `rag.*`/`edit.*`/`code.template.*` name
   not in `TOOL_GROUPS`/`ALL_TOOLS`/`RpcMethod`) → a review finding (the
   invariant (a)/(b)/(c) is broken). The audit confirms all 17 are registered.
8. **An IPC channel not routing through the shared handler** → a review finding
   (the invariant (d) is broken). The audit confirms all equivalence-surface
   IPC channels route through the shared handler.
9. **`rag.query` with a non-string/empty query** → the tool rejects it
   (`'rag.query: query must be a non-empty string'`).
10. **`rag.query` with a non-positive-integer `topK`** → the tool rejects it
    (`'rag.query: topK must be a positive integer'`).
11. **`rag.get_document` with a missing/empty `documentId`** → the tool rejects
    it (`'rag.get_document: documentId required'`).
12. **`rag.backlinks` with a missing/empty `nodeId`** → the tool rejects it
    (`'rag.backlinks: nodeId required'`).
13. **`rag.backlinks` with a null store** → throws
    `'rag.backlinks: no rag store configured'` (the MCP tool AND the
    `rag-backlinks` IPC reject identically — the G2 fix).
14. **`rag.query` with a null store** → throws `'rag.query: no rag store
    configured'` (the MCP tool AND the `rag-query` IPC reject identically).
15. **`edit.*` with a null store** → throws `<name>: no rag store configured`.
16. **`edit.set_content` with a missing/empty `nodeId`** → the handler throws
    `'edit.set_content: nodeId required'`.
17. **`edit.set_content` on a nonexistent node** → the op returns
    `{ ok: false, error: 'edit.set_content: node not found' }`; the
    `edit-commit` IPC maps it to `{ ok: false, reason: 'deleted-node' }`.
18. **`edit-commit` with a malformed payload** (missing/non-string `nodeId` or
    `content`) → the IPC handler returns `{ ok: false, reason: 'store-error',
    error: 'edit-commit: nodeId and content required' }` (fail-closed).
19. **`code.template.*` with a null template store** → throws
    `'code.template.<name>: no template store configured'`.
20. **`code.template.set` with an invalid template** → throws the documented
    `template set: invalid-shape — <detail>` / `template set: missing-zone —
    missing container for zone "<zone>"` (the store is unchanged).
21. **`code.template.delete` of a targeted zone** → throws
    `'template delete: cannot remove targeted zone "<zone>"'` (the store is
    unchanged).
22. **`code.template.create` of an already-present zone** → throws
    `'template create: zone "<zone>" already present'` (the store is unchanged).
23. **`code.template.create`/`delete` with a missing/empty `zone`** → throws
    `'template create: zone required'` / `'template delete: zone required'`.
24. **`code.template.validate` with a null/undefined `zones`** → throws
    `'validateTemplate: zones required'` (a malformed input is a caller error,
    never a silent pass).

### 5.10 Census / numeric claims

- **Tool counts:** 5 `rag.*` + 6 `edit.*` + 6 `code.template.*` = **17 tool
  names** in `ALL_TOOLS` (beyond the foundation's existing tools).
- **Groups:** 2 new `ToolGroup` values (`rag`, `edit`); the `code` group is
  reused for `code.template.*`. `VALID_GROUPS` = 7 values (`read`, `dispatch`,
  `graph`, `code`, `module`, `rag`, `edit`).
- **Read-only tools:** 5 `rag.*` + 2 `code.template.*` (`get`, `validate`) = 7.
- **Mutating tools:** 6 `edit.*` + 4 `code.template.*` (`set`, `create`,
  `delete`, `reset`) = 10.
- **Equivalence pairs:** 4 (rag.query/rag-query, rag.backlinks/rag-backlinks,
  edit.set_content/edit-commit, code.template.*/template IPC — the last is 6
  tools mapping to 6 IPC channels).
- **IPC channels (equivalence surface):** `IPC_RAG_QUERY`, `IPC_RAG_BACKLINKS`,
  `IPC_EDIT_COMMIT`, `IPC_TEMPLATE_GET`/`VALIDATE`/`SET`/`CREATE`/`DELETE`/
  `RESET` (9 renderer→main channels).
- **IPC channels (broadcasts):** `IPC_RAG_STORE_CHANGED` (main→renderer, the
  re-traversal trigger), `IPC_TEMPLATE_CHANGED` (main→renderer, the re-derive
  trigger), `IPC_RAG_SNAPSHOT` (renderer→main, the re-traversal data source).
- **Renderer switch cases:** 18 + the `default` (fail-closed `unknown method`).
- **`MUTATING_METHODS`:** 7 methods (`dispatch`, `load`, `op`, `teardown`,
  `code.load`, `code.loadBatch`, `journal`).
- **Shared handlers:** `handleRagTool` (5 `rag.*` cases), `handleEditTool` (6
  `edit.*` cases), `handleTemplateTool` (6 `code.template.*` cases),
  `handleRagQueryIpc`, `handleRagBacklinksIpc`, `handleEditCommit`.
- **Edit ops:** 6 (`setContent`, `createNode`, `deleteNode`, `splitNode`,
  `mergeNode`, `setEdge`).
- **Known limitations:** 4 documented behaviors (§5.7), none are gaps.

### 5.11 Cross-references

- Gate: `docs/specs/astrographer-review.md` §7 scope item 10 / line 100 (J as
  the hardening pass), §8.2 (MCP/UI equivalence — a BINDING constraint),
  §9.2.7 (RAG-EDIT-MCP-GROUPS), Amendment 1 (gating decisions in Units B and
  D).
- Unit B: `docs/specs/unit-b-document-model.md` §5.3 (the five-seam gate for
  `rag`/`edit`), §5.4 (the tool schemas + the gating behavior), §5.4 Finding 4
  (`rag.get_document` placeholder).
- Unit D: `docs/specs/unit-d-editing.md` §5.1.8 (the `edit.*` tool handlers),
  §5.1.9 (the `rag-store-changed` re-traversal trigger), §5.1.10 (the
  `edit-commit` IPC), §5.7 (MCP/UI equivalence for editing).
- Unit E: `docs/specs/unit-e-rag-index.md` §5.7 (the `rag.query` MCP tool + the
  `rag-query` IPC — MCP/UI equivalence).
- Unit G: `docs/specs/unit-g-crosslink-backlink.md` §5.4 (the `rag.backlinks`
  MCP tool + the `rag-backlinks` IPC — MCP/UI equivalence), §3a G2 (the
  store-null fail-state mirror).
- Unit I: `docs/specs/unit-i-template.md` §5.3 (the `code.template.*` CRUD + the
  five-seam gate), §5.4 (the template IPC + the preload bridge), §5.5 (the
  whole-graph re-derive).
- Decisions: `docs/decisions.md` rows **RAG-EDIT-MCP-GROUPS**,
  **SINGLE-WRITER-STORE**, **RAG-AUTHORITATIVE**, **MCP-UI-EQUIVALENCE**,
  **CODE-GROUP-TEMPLATE-CRUD**.
- Host seams: `src/main/security.ts` (TOOL_GROUPS/`groupForTool`/`toolAllowed`/
  `defaultSecurityConfig`/`applyPatch`/`SecurityGate`/`VALID_GROUPS`),
  `src/main/mcp-server.ts` (ALL_TOOLS/`registerTools`/`handleRagTool`/
  `handleEditTool`/`handleTemplateTool`/`handleRagQueryIpc`/
  `handleRagBacklinksIpc`), `src/renderer/renderer.ts` (`handleRequest`/
  `MUTATING_METHODS`), `src/shared/types.ts` (RpcMethod + the IPC channels),
  `src/main/main.ts` (the IPC handlers), `src/main/preload.ts` (the preload
  bridge), `src/main/edit-ops.ts` (the edit ops + `handleEditCommit`).
- Pending: `docs/pending.md` (document tabs — the multi-document render;
  cross-document shared nodes).
