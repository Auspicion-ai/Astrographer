# Unit J — MCP/Security Hardening: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-j-mcp-security-hardening.md` ONLY — no implementation reading
  of the scenario content).
- **Source contract:** `docs/specs/unit-j-mcp-security-hardening.md` §5.1–§5.11
  (the hardening scope + the invariants (a)–(f), the 17-tool inventory + the
  group/read-mutating classification, the equivalence mapping, the five-seam
  gate audit, the renderer switch + `MUTATING_METHODS` audit, §5.7 known
  limitations, §5.8 happy paths, §5.9 fail-states, §5.10 census) + §3a (the
  post-green adversarial findings — three LOW/informational observations, none
  fix-required).
- **Modules under test:** `src/main/security.ts` (`groupForTool`/`toolAllowed`/
  `defaultSecurityConfig`/`applyPatch`/`SecurityGate`), `src/main/mcp-server.ts`
  (`handleRagTool`/`handleEditTool`/`handleTemplateTool`/`handleRagQueryIpc`/
  `handleRagBacklinksIpc`/`ProvidentMcpServer.ALL_TOOLS`), `src/main/edit-ops.ts`
  (the 6 edit ops + `handleEditCommit`), `src/main/retrieval.ts`
  (`createRetrieval`/`createLexicalIndex`/`createLexicalEmbedder`),
  `src/main/backlinks.ts` (`enumerateLinks`), `src/main/template-store.ts`
  (`createTemplateStore`/`DEFAULT_CONTENT_WINDOW_TEMPLATE`), the `RagStore`
  interface via `createJsonRagStore` (`src/main/rag-store.ts`), and the IPC
  constants + `RpcMethod` in `src/shared/types.ts`.
- **Harness:** a temporary vitest file in `tests/` (removed after the run),
  executed with `npx vitest run`. The pure gate predicates + the shared
  main-process handlers are exercised directly. The `rag.*`/`edit.*`/`code.template.*`
  MCP tools are exercised via their shared handlers (the §8.2 equivalence seam).
  The renderer switch + `MUTATING_METHODS` negative contracts are verified by
  static grep on `src/renderer/renderer.ts` (comments stripped), matching the
  Unit E F22 / Unit G F7 / Unit B G9 convention. The `edit-commit` malformed-
  payload guard and the IPC-not-group-gated surface are Electron surfaces
  (see test-authoring notes).
- **Run:** 60 scenarios — 60 pass, 0 fail. No spec-vs-impl drift observed.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.8 Happy-path states (21 node-tested)

Fixture helpers: `N(id, type, content)` = a `RagNode`
`{ id, type, content, ownedNodeIds: [], createdAt, updatedAt }`;
`E(id, kind, source, target, extra)` = a `RagEdge`
`{ id, kind, source, target, createdAt, updatedAt, ...extra }`. A JSON RAG store
is created via `createJsonRagStore({ path })` (mutating methods async +
queue-serialized, awaited). A template store via
`createTemplateStore({ path, targetedZones: ['main'] })`.

### H1. `rag` group default-off (§5.8 1)
- **Ops:** `defaultSecurityConfig()`; `toolAllowed('rag.query', ['read','dispatch'])`;
  `toolAllowed('rag.query', ['rag'])`.
- **Expected:** `defaultSecurityConfig()` = `{ token: null, enabled: ['read',
  'dispatch'] }` (no `rag`); `toolAllowed('rag.query', ['read','dispatch']) ===
  false`; `toolAllowed('rag.query', ['rag']) === true`.

### H2. `edit` group default-off (§5.8 2)
- **Ops:** `toolAllowed('edit.set_content', ['read','dispatch'])`;
  `toolAllowed('edit.set_content', ['edit'])`.
- **Expected:** `false`; `true` (the `edit` group is NOT in
  `defaultSecurityConfig()`).

### H3. `code.template.*` default-off (§5.8 3)
- **Ops:** `toolAllowed('code.template.get', ['read','dispatch'])`;
  `toolAllowed('code.template.get', ['code'])`.
- **Expected:** `false`; `true` (the `code` group is NOT in
  `defaultSecurityConfig()`).

### H4. `rag` group enabled → all 5 tools callable (§5.8 4)
- **Ops:** for each of the 5 `rag.*` names, `toolAllowed(name, ['rag'])`.
- **Expected:** `true` for `rag.query`, `rag.get_document`, `rag.list_nodes`,
  `rag.get_edges`, `rag.backlinks`.

### H5. `edit` group enabled → all 6 tools callable (§5.8 5)
- **Ops:** for each of the 6 `edit.*` names, `toolAllowed(name, ['edit'])`.
- **Expected:** `true` for `edit.set_content`, `edit.create_node`,
  `edit.delete_node`, `edit.split_node`, `edit.merge_node`, `edit.set_edge`.

### H6. `code` group enabled → all 6 `code.template.*` callable (§5.8 6)
- **Ops:** for each of the 6 `code.template.*` names, `toolAllowed(name, ['code'])`.
- **Expected:** `true` for `get`, `validate`, `set`, `create`, `delete`, `reset`.

### H7. Editing is NEVER a `code`-group op (§5.8 7)
- **Ops:** `toolAllowed('edit.set_content', ['code'])`;
  `toolAllowed('edit.create_node', ['code'])`;
  `toolAllowed('code.template.set', ['code'])`.
- **Expected:** `false`, `false` (an `edit.*` tool with only `code` enabled is
  denied); `true` (the `code.template.*` tools DO ride the `code` group — but
  they edit the TEMPLATE store, not the RAG store).

### H8. `rag.query` / `rag-query` equivalence (§5.8 8)
- **Setup:** a JSON store with `n1('hello world')`, `n2('hello there')`; a
  shared maintained engine `createRetrieval(store, createLexicalEmbedder(
  createLexicalIndex(store.listNodes())))`.
- **Ops:** `handleRagTool(store, 'rag.query', { query:'hello', topK:2 }, engine)`
  and `handleRagQueryIpc(engine, store, { query:'hello', topK:2 })`.
- **Expected:** both produce the IDENTICAL `RetrievalResult` — same `ranked`,
  `context`, `markdown`, `lineMap`, and `k === 2` (both use the SAME maintained
  engine).

### H9. `rag.backlinks` / `rag-backlinks` equivalence (§5.8 9)
- **Setup:** a JSON store with `src`/`tgt` nodes + a `crosslink` edge `cl`
  (`src`→`tgt`).
- **Ops:** `handleRagTool(store, 'rag.backlinks', { nodeId:'tgt' })` and
  `handleRagBacklinksIpc(store, { nodeId:'tgt' })`.
- **Expected:** both produce the IDENTICAL `BacklinkResult` (both call the SAME
  `enumerateLinks`).

### H10. `edit.set_content` / `edit-commit` equivalence (§5.8 10)
- **Setup:** a JSON store with `n1('old')`.
- **Ops:** `handleEditTool(store, 'edit.set_content', { nodeId:'n1',
  content:'same' }, onStoreChanged)` and `handleEditCommit(store, { nodeId:'n1',
  content:'same' })`.
- **Expected:** both produce the same store state (`getNode('n1').content ===
  'same'`); the MCP path fires `onStoreChanged({ kind:'content', nodeIds:['n1'],
  edgeIds:[] })` (both call the SAME `setContent` op).

### H11. `code.template.*` / `IPC_TEMPLATE_*` equivalence (§5.8 11)
- **Setup:** a fresh template store.
- **Ops:** `handleTemplateTool(store, 'code.template.get', {})` (the MCP path)
  and the same handler with the SAME store (the UI IPC path).
- **Expected:** both return the same `{ source:'default', template:
  DEFAULT_CONTENT_WINDOW_TEMPLATE }` from the SAME template store.

### H12. Renderer switch fails closed (§5.8 12)
- **Setup:** `src/renderer/renderer.ts`.
- **Ops:** read the renderer source, strip comments, grep for `case 'rag.query'`,
  `case 'edit.set_content'`, `case 'code.template.get'`.
- **Expected:** NO `rag.*`/`edit.*`/`code.template.*` switch case exists — a
  method that somehow reaches the renderer hits the `default` branch → throws
  `unknown method: <method>` (fail-closed, the Seam-4 negative contract).

### H13. `MUTATING_METHODS` completeness (§5.8 13)
- **Setup:** `src/renderer/renderer.ts`.
- **Ops:** read the renderer source, strip comments, extract the
  `MUTATING_METHODS` set.
- **Expected:** the set is exactly `{ 'dispatch', 'load', 'op', 'teardown',
  'code.load', 'code.loadBatch', 'journal' }` (7 methods — every
  renderer-graph-mutating method; the read-only + envelope-mutating methods are
  NOT in it).

### H14. `rag.get_document` placeholder (§5.8 14)
- **Setup:** a JSON store with `n1`, `n2`, edge `e1`.
- **Ops:** `handleRagTool(store, 'rag.get_document', { documentId:'doc' })`.
- **Expected:** `{ documentId:'doc', nodes: <all nodes>, edges: <all edges> }`
  (the placeholder behavior — returns the ENTIRE store, not the document's
  subtree).

### H15. `rag.list_nodes` census (§5.8 15)
- **Setup:** a JSON store with `n1('p', 'hello world')`.
- **Ops:** `handleRagTool(store, 'rag.list_nodes', {})`.
- **Expected:** an array of `{ id, type, content, ownedNodeIds }` with
  `content` = the preview `content.slice(0, 80)`.

### H16. `rag.get_edges` all (§5.8 16)
- **Setup:** a JSON store with edges `e1`, `e2`.
- **Ops:** `handleRagTool(store, 'rag.get_edges', {})`.
- **Expected:** all edges.

### H17. `rag.get_edges` filtered (§5.8 17)
- **Setup:** a JSON store with edges `e1` (`a`→`b`), `e2` (`c`→`d`).
- **Ops:** `handleRagTool(store, 'rag.get_edges', { nodeId:'a' })`.
- **Expected:** the edges where `source === 'a' || target === 'a'` → `[e1]`.

### H18. `rag.backlinks` happy (§5.8 18)
- **Setup:** a JSON store with `src`/`tgt` nodes + a `crosslink` edge `cl`.
- **Ops:** `handleRagTool(store, 'rag.backlinks', { nodeId:'tgt' })`.
- **Expected:** the `BacklinkResult` — `nodeId === 'tgt'`, `backlinks` =
  `[<LinkEntry for cl>]` (an array of `LinkEntry` objects, each with
  `edge.id === 'cl'`, `kind === 'crosslink'`, `source === 'src'`,
  `target === 'tgt'`), `crosslinkBacklinks` = the same (the edge kind is
  `crosslink`).

### H19. `rag.query` happy (§5.8 19)
- **Setup:** a JSON store with `n1('hello world')`.
- **Ops:** `handleRagTool(store, 'rag.query', { query:'hello' })`.
- **Expected:** the `RetrievalResult` (awaited) — `query === 'hello'`,
  `ranked`/`context` arrays, `markdown` string, `lineMap` defined, `k === 5`
  (default).

### H20. `edit.*` happy (§5.8 20)
- **Setup:** a JSON store with `n1('hello world')`, `a`, `b`, `src`, `tgt`.
- **Ops:** each `edit.*` tool with valid params + an `onStoreChanged` spy:
  `edit.set_content` (`n1`→`'world'`), `edit.create_node` (`{ type:'p',
  content:'x' }`), `edit.delete_node` (`n1`), `edit.split_node` (`n1` at 5),
  `edit.merge_node` (`src`→`tgt`), `edit.set_edge` (`{ kind:'parent-child',
  source:'a', target:'b' }`).
- **Expected:** each returns the op's `{ ok:true, ... }` result AND fires
  `onStoreChanged` (the `rag-store-changed` re-traversal trigger).

### H21. `code.template.*` happy (§5.8 21)
- **Setup:** a fresh template store.
- **Ops:** `handleTemplateTool(store, 'code.template.get', {})`;
  `handleTemplateTool(store, 'code.template.validate', { template: customMain() })`;
  `handleTemplateTool(store, 'code.template.set', { template: customMain() }, onChanged)`;
  `handleTemplateTool(store, 'code.template.create', { zone:'aside' }, onChanged)`;
  `handleTemplateTool(store, 'code.template.delete', { zone:'aside' }, onChanged)`;
  `handleTemplateTool(store, 'code.template.reset', {}, onChanged)`.
- **Expected:** `get` → `{ source, template }`; `validate` → `{ ok:true }`; the
  mutating ones (`set`/`create`/`delete`/`reset`) return the documented result
  AND invoke `onChanged` with the `{ source, template }` payload (the
  `template-changed` broadcast).

---

## B. §5.9 Fail-states (24 node-tested)

### F1. A `rag.*` tool with the `rag` group disabled (§5.9 1)
- **Ops:** `toolAllowed('rag.query', ['read','dispatch'])`.
- **Expected:** `false` — not registered, not callable.

### F2. An `edit.*` tool with the `edit` group disabled (§5.9 2)
- **Ops:** `toolAllowed('edit.set_content', ['read','dispatch'])`.
- **Expected:** `false`.

### F3. A `code.template.*` tool with the `code` group disabled (§5.9 3)
- **Ops:** `toolAllowed('code.template.set', ['read','dispatch'])`.
- **Expected:** `false`.

### F4. An `edit.*` tool invoked with only `code` enabled (§5.9 4)
- **Ops:** `toolAllowed('edit.set_content', ['code'])`.
- **Expected:** `false` (editing is NEVER a `code`-group op).

### F5. A `rag.*`/`edit.*`/`code.template.*` method reaching the renderer switch (§5.9 5)
- **Setup:** `src/renderer/renderer.ts`.
- **Ops:** read the renderer source, strip comments, grep for any
  `rag.`/`edit.`/`code.template.` switch case.
- **Expected:** NO such case exists — a method that reaches the renderer hits
  the `default` branch → throws `unknown method: <method>` (fail-closed, the
  Seam-4 negative contract).

### F6. A mutating method missing from `MUTATING_METHODS` (§5.9 6)
- **Setup:** `src/renderer/renderer.ts`.
- **Ops:** read the renderer source, strip comments, extract `MUTATING_METHODS`.
- **Expected:** the set is exactly the 7 spec'd methods (`dispatch`, `load`,
  `op`, `teardown`, `code.load`, `code.loadBatch`, `journal`) — the invariant
  (f) holds; no mutating method is missing.

### F7. A tool missing from a group (§5.9 7)
- **Ops:** verify all 17 `rag.*`/`edit.*`/`code.template.*` names are in
  `ProvidentMcpServer.ALL_TOOLS`; verify each maps to its group via
  `groupForTool`; verify each is in the `RpcMethod` union (static grep on
  `src/shared/types.ts`).
- **Expected:** all 17 are registered in every seam — the invariants (a)/(b)/(c)
  hold.

### F8. An IPC channel not routing through the shared handler (§5.9 8)
- **Setup:** `src/main/main.ts` + `src/main/mcp-server.ts`.
- **Ops:** static grep for the `IPC_RAG_QUERY`/`IPC_RAG_BACKLINKS`/`IPC_EDIT_COMMIT`/
  `IPC_TEMPLATE_*` handlers.
- **Expected:** each equivalence-surface IPC channel routes through the shared
  handler (`handleRagQueryIpc`/`handleRagBacklinksIpc`/`handleEditCommit`/
  `handleTemplateTool`) — the invariant (d) holds.

### F9. `rag.query` with a non-string/empty query (§5.9 9)
- **Ops:** `handleRagTool(store, 'rag.query', { query:'' })`, `{ query:'   ' }`,
  `{ query:42 }`.
- **Expected:** each throws `Error('rag.query: query must be a non-empty string')`.

### F10. `rag.query` with a non-positive-integer `topK` (§5.9 10)
- **Ops:** `handleRagTool(store, 'rag.query', { query:'hello', topK:0 })`,
  `{ topK:-1 }`, `{ topK:1.5 }`.
- **Expected:** each throws `Error('rag.query: topK must be a positive integer')`.

### F11. `rag.get_document` with a missing/empty `documentId` (§5.9 11)
- **Ops:** `handleRagTool(store, 'rag.get_document', {})`, `{ documentId:'' }`.
- **Expected:** each throws `Error('rag.get_document: documentId required')`.

### F12. `rag.backlinks` with a missing/empty `nodeId` (§5.9 12)
- **Ops:** `handleRagTool(store, 'rag.backlinks', {})`, `{ nodeId:'' }`,
  `handleRagBacklinksIpc(store, { nodeId:'' })`.
- **Expected:** each throws `Error('rag.backlinks: nodeId required')` (the IPC
  mirrors the MCP tool's fail-state).

### F13. `rag.backlinks` with a null store (§5.9 13)
- **Ops:** `handleRagTool(null, 'rag.backlinks', { nodeId:'x' })` and
  `handleRagBacklinksIpc(null, { nodeId:'x' })`.
- **Expected:** each throws `Error('rag.backlinks: no rag store configured')`
  (the MCP tool AND the IPC reject identically — the G2 fix).

### F14. `rag.query` with a null store (§5.9 14)
- **Ops:** `handleRagTool(null, 'rag.query', { query:'hello' })` and
  `handleRagQueryIpc(null, null, { query:'hello' })`.
- **Expected:** each throws `Error('rag.query: no rag store configured')`.

### F15. `edit.*` with a null store (§5.9 15)
- **Ops:** `handleEditTool(null, 'edit.set_content', { nodeId:'n1',
  content:'x' })`.
- **Expected:** throws `Error('edit.set_content: no rag store configured')`.

### F16. `edit.set_content` with a missing/empty `nodeId` (§5.9 16)
- **Ops:** `handleEditTool(store, 'edit.set_content', {})`, `{ nodeId:'' }`.
- **Expected:** each throws `Error('edit.set_content: nodeId required')`.

### F17. `edit.set_content` on a nonexistent node (§5.9 17)
- **Setup:** a JSON store with `n1`.
- **Ops:** `handleEditTool(store, 'edit.set_content', { nodeId:'ghost',
  content:'x' })`; `handleEditCommit(store, { nodeId:'ghost', content:'x' })`.
- **Expected:** the MCP tool returns `{ ok:false, error:'edit.set_content: node
  not found' }`; the `edit-commit` IPC maps it to `{ ok:false,
  reason:'deleted-node', error:'edit.set_content: node not found' }`.

### F18. `edit-commit` with a malformed payload (§5.9 18)
- **Setup:** `src/main/main.ts` (the `ipcMain.handle(IPC_EDIT_COMMIT)` guard).
- **Ops:** static grep for the malformed-payload guard.
- **Expected:** the IPC handler returns `{ ok:false, reason:'store-error',
  error:'edit-commit: nodeId and content required' }` for a missing/non-string
  `nodeId` or `content` (fail-closed). (Electron surface — see test-authoring
  note.)

### F19. `code.template.*` with a null template store (§5.9 19)
- **Ops:** `handleTemplateTool(null, 'code.template.get', {})`.
- **Expected:** throws `Error('code.template.get: no template store configured')`.

### F20. `code.template.set` with an invalid template (§5.9 20)
- **Setup:** a fresh template store.
- **Ops:** `handleTemplateTool(store, 'code.template.set', { template: null })`,
  `{ template: {} }`, `{ template: missingMain() }` (drops the targeted `main`
  zone).
- **Expected:** each throws the documented `template set: invalid-shape — <detail>`
  / `template set: missing-zone — missing container for zone "main"`; the store
  is unchanged.

### F21. `code.template.delete` of a targeted zone (§5.9 21)
- **Setup:** a fresh template store (`targetedZones: ['main']`).
- **Ops:** `handleTemplateTool(store, 'code.template.delete', { zone:'main' })`.
- **Expected:** throws `Error('template delete: cannot remove targeted zone
  "main"')`; the store is unchanged.

### F22. `code.template.create` of an already-present zone (§5.9 22)
- **Setup:** a fresh template store (a `main` producer already exists).
- **Ops:** `handleTemplateTool(store, 'code.template.create', { zone:'main' })`.
- **Expected:** throws `Error('template create: zone "main" already present')`;
  the store is unchanged.

### F23. `code.template.create`/`delete` with a missing/empty `zone` (§5.9 23)
- **Ops:** `handleTemplateTool(store, 'code.template.create', {})`,
  `{ zone:'' }`; `handleTemplateTool(store, 'code.template.delete', {})`,
  `{ zone:'' }`.
- **Expected:** each throws `Error('template create: zone required')` /
  `Error('template delete: zone required')`.

### F24. `code.template.validate` with a null/undefined `zones` (§5.9 24)
- **Ops:** `handleTemplateTool(store, 'code.template.validate', { template:
  customMain() })` where the store's `targetedZones` is null/undefined (a
  malformed store), or `validateTemplate(customMain(), null)`.
- **Expected:** throws `Error('validateTemplate: zones required')` (a malformed
  input is a caller error, never a silent pass).

---

## C. §5.10 Census / numeric claims (12 node-tested)

### C1. Tool counts — 17
- **Ops:** inspect `ProvidentMcpServer.ALL_TOOLS`.
- **Expected:** exactly 5 `rag.*` + 6 `edit.*` + 6 `code.template.*` = 17 tool
  names (beyond the foundation's existing tools).

### C2. Groups — 2 new (`rag`, `edit`); `VALID_GROUPS` = 7
- **Ops:** `groupForTool` for each of the 17; `applyPatch` with each of the 7
  group values and with an invalid value.
- **Expected:** the 5 `rag.*` → `'rag'`, the 6 `edit.*` → `'edit'`, the 6
  `code.template.*` → `'code'`; `applyPatch(config, { groups:['rag'] })` and
  `{ groups:['edit'] }` add the group; `applyPatch(config, { groups:['bogus'] })`
  returns the config unchanged (rejects — `VALID_GROUPS` = the 7 values
  `read`/`dispatch`/`graph`/`code`/`module`/`rag`/`edit`).

### C3. Read-only tools — 7
- **Ops:** classify the 17 tools by read/mutating.
- **Expected:** 5 `rag.*` + 2 `code.template.*` (`get`, `validate`) = 7
  read-only.

### C4. Mutating tools — 10
- **Ops:** classify the 17 tools by read/mutating.
- **Expected:** 6 `edit.*` + 4 `code.template.*` (`set`, `create`, `delete`,
  `reset`) = 10 mutating.

### C5. Equivalence pairs — 4
- **Ops:** enumerate the MCP tool ↔ IPC channel pairs.
- **Expected:** 4 pairs (rag.query/rag-query, rag.backlinks/rag-backlinks,
  edit.set_content/edit-commit, code.template.*/template IPC — the last is 6
  tools mapping to 6 IPC channels).

### C6. IPC channels (equivalence surface) — 9
- **Ops:** inspect the IPC constants in `src/shared/types.ts`.
- **Expected:** `IPC_RAG_QUERY`, `IPC_RAG_BACKLINKS`, `IPC_EDIT_COMMIT`,
  `IPC_TEMPLATE_GET`/`VALIDATE`/`SET`/`CREATE`/`DELETE`/`RESET` (9 renderer→main
  channels).

### C7. IPC channels (broadcasts) — 3
- **Ops:** inspect the IPC constants in `src/shared/types.ts`.
- **Expected:** `IPC_RAG_STORE_CHANGED` (main→renderer, the re-traversal
  trigger), `IPC_TEMPLATE_CHANGED` (main→renderer, the re-derive trigger),
  `IPC_RAG_SNAPSHOT` (renderer→main, the re-traversal data source).

### C8. Renderer switch cases — 18 + `default`
- **Setup:** `src/renderer/renderer.ts`.
- **Ops:** read the renderer source, strip comments, count the `case` labels.
- **Expected:** exactly 18 cases (`dispatch`, `renderedHtml`, `markdown`,
  `listTargets`, `nodeState`, `load`, `op`, `export`, `validate`, `teardown`,
  `code.get`, `code.set`, `code.create`, `code.delete`, `code.validate`,
  `code.load`, `code.loadBatch`, `journal`) + the fail-closed `default`
  (`unknown method`).

### C9. `MUTATING_METHODS` — 7
- **Setup:** `src/renderer/renderer.ts`.
- **Ops:** read the renderer source, strip comments, extract `MUTATING_METHODS`.
- **Expected:** exactly 7 methods (`dispatch`, `load`, `op`, `teardown`,
  `code.load`, `code.loadBatch`, `journal`).

### C10. Shared handlers — 6
- **Ops:** inspect the exported handlers.
- **Expected:** `handleRagTool` (5 `rag.*` cases), `handleEditTool` (6 `edit.*`
  cases), `handleTemplateTool` (6 `code.template.*` cases), `handleRagQueryIpc`,
  `handleRagBacklinksIpc`, `handleEditCommit`.

### C11. Edit ops — 6
- **Ops:** inspect the exports of `src/main/edit-ops.ts`.
- **Expected:** `setContent`, `createNode`, `deleteNode`, `splitNode`,
  `mergeNode`, `setEdge` (6 ops).

### C12. Known limitations — 4
- **Ops:** verify the 4 documented behaviors (§5.7) hold.
- **Expected:** (1) `rag.get_document` returns the ENTIRE store (H14); (2) the
  IPC surfaces are NOT group-gated (D3); (3) `edit.set_content` returns
  `SetContentResult` while `edit-commit` returns `EditCommitResult` (H10/F17);
  (4) the `rag.query` `topK` default is 5 (H19).

---

## D. §3a Adversarial findings (3 node-tested / code-reviewed)

### D1. `groupForTool` `module:` prefix — `module:foo` resolves to `'module'`
- **Ops:** `groupForTool('module:foo')`.
- **Expected:** `'module'` (the comment claims an empty rest is denied, but the
  guard only checks `toolName.length > 'module:'.length`, so `module:foo` with
  no dot resolves to `'module'`). Not a security bypass (`syncModuleRouter` only
  registers `module:<name>.<tool>` names, so `module:foo` is never a live tool).
  This is the module system (Unit U), not Unit J's scope — an informational
  observation, no fix required.

### D2. IPC error-handling inconsistency — `edit-commit` maps, `rag-query`/`rag-backlinks` throw
- **Ops:** `handleRagQueryIpc(engine, store, { query:'' })` and
  `handleRagBacklinksIpc(store, { nodeId:'' })`; static grep the
  `IPC_EDIT_COMMIT` guard in `src/main/main.ts`.
- **Expected:** `rag-query`/`rag-backlinks` THROW (rejecting the
  `ipcRenderer.invoke` promise) — `'rag.query: query must be a non-empty
  string'` / `'rag.backlinks: nodeId required'`; `edit-commit` maps a malformed
  payload to a domain result `{ ok:false, reason:'store-error', ... }`. Both
  reject identically to their documented fail-states (§5.9 #9/#14 vs #18) — a
  robustness nit, not a security finding.

### D3. IPC surface is NOT group-gated
- **Setup:** `src/shared/types.ts` + `src/main/main.ts`.
- **Ops:** static grep the renderer→main IPC channels.
- **Expected:** the `edit-commit`, `rag-query`, `rag-backlinks`, and
  `IPC_TEMPLATE_*` channels are renderer→main IPC callable regardless of the
  `edit`/`rag`/`code` group state (per §4 IPC-SURFACE-NOT-GROUP-GATED — the
  renderer is a trusted surface; `contextIsolation:true`,
  `nodeIntegration:false`). A defense-in-depth note, not a Unit J defect.

---

## E. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | `rag` group default-off | ✅ PASS |
| H2 | `edit` group default-off | ✅ PASS |
| H3 | `code.template.*` default-off | ✅ PASS |
| H4 | `rag` group enabled → all 5 callable | ✅ PASS |
| H5 | `edit` group enabled → all 6 callable | ✅ PASS |
| H6 | `code` group enabled → all 6 `code.template.*` callable | ✅ PASS |
| H7 | Editing is NEVER a `code`-group op | ✅ PASS |
| H8 | `rag.query` / `rag-query` equivalence | ✅ PASS |
| H9 | `rag.backlinks` / `rag-backlinks` equivalence | ✅ PASS |
| H10 | `edit.set_content` / `edit-commit` equivalence | ✅ PASS |
| H11 | `code.template.*` / `IPC_TEMPLATE_*` equivalence | ✅ PASS |
| H12 | Renderer switch fails closed | ✅ PASS |
| H13 | `MUTATING_METHODS` completeness | ✅ PASS |
| H14 | `rag.get_document` placeholder | ✅ PASS |
| H15 | `rag.list_nodes` census | ✅ PASS |
| H16 | `rag.get_edges` all | ✅ PASS |
| H17 | `rag.get_edges` filtered | ✅ PASS |
| H18 | `rag.backlinks` happy | ✅ PASS |
| H19 | `rag.query` happy | ✅ PASS |
| H20 | `edit.*` happy | ✅ PASS |
| H21 | `code.template.*` happy | ✅ PASS |
| F1 | A `rag.*` tool with the `rag` group disabled | ✅ PASS |
| F2 | An `edit.*` tool with the `edit` group disabled | ✅ PASS |
| F3 | A `code.template.*` tool with the `code` group disabled | ✅ PASS |
| F4 | An `edit.*` tool invoked with only `code` enabled | ✅ PASS |
| F5 | A `rag.*`/`edit.*`/`code.template.*` method reaching the renderer switch | ✅ PASS |
| F6 | A mutating method missing from `MUTATING_METHODS` | ✅ PASS |
| F7 | A tool missing from a group | ✅ PASS |
| F8 | An IPC channel not routing through the shared handler | ✅ PASS |
| F9 | `rag.query` non-string/empty query | ✅ PASS |
| F10 | `rag.query` non-positive-integer `topK` | ✅ PASS |
| F11 | `rag.get_document` missing/empty `documentId` | ✅ PASS |
| F12 | `rag.backlinks` missing/empty `nodeId` | ✅ PASS |
| F13 | `rag.backlinks` null store | ✅ PASS |
| F14 | `rag.query` null store | ✅ PASS |
| F15 | `edit.*` null store | ✅ PASS |
| F16 | `edit.set_content` missing/empty `nodeId` | ✅ PASS |
| F17 | `edit.set_content` nonexistent node | ✅ PASS |
| F18 | `edit-commit` malformed payload | ✅ PASS |
| F19 | `code.template.*` null template store | ✅ PASS |
| F20 | `code.template.set` invalid template | ✅ PASS |
| F21 | `code.template.delete` targeted zone | ✅ PASS |
| F22 | `code.template.create` already-present zone | ✅ PASS |
| F23 | `code.template.create`/`delete` missing/empty `zone` | ✅ PASS |
| F24 | `code.template.validate` null/undefined `zones` | ✅ PASS |
| C1 | Tool counts (17) | ✅ PASS |
| C2 | Groups (2 new; `VALID_GROUPS` = 7) | ✅ PASS |
| C3 | Read-only tools (7) | ✅ PASS |
| C4 | Mutating tools (10) | ✅ PASS |
| C5 | Equivalence pairs (4) | ✅ PASS |
| C6 | IPC channels — equivalence surface (9) | ✅ PASS |
| C7 | IPC channels — broadcasts (3) | ✅ PASS |
| C8 | Renderer switch cases (18 + `default`) | ✅ PASS |
| C9 | `MUTATING_METHODS` (7) | ✅ PASS |
| C10 | Shared handlers (6) | ✅ PASS |
| C11 | Edit ops (6) | ✅ PASS |
| C12 | Known limitations (4) | ✅ PASS |
| D1 | `groupForTool` `module:` prefix | ✅ PASS |
| D2 | IPC error-handling inconsistency | ✅ PASS |
| D3 | IPC surface NOT group-gated | ✅ PASS |

**Run summary:** 60 scenarios — 60 pass, 0 fail.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-j-mcp-security-hardening.md` §5.1–§5.11 + §3a passed against
  the live modules. The hardening invariants (a)–(f) (§5.2), the 17-tool
  inventory + the group/read-mutating classification (§5.3), the equivalence
  mapping (§5.4), the five-seam gate audit (§5.5), the renderer switch +
  `MUTATING_METHODS` audit (§5.6), the 4 known limitations (§5.7), all 21 happy
  paths (§5.8), all 24 fail-states (§5.9), every census claim (§5.10), and the
  §3a adversarial observations match the spec. No spec-vs-impl drift was
  observed.

### Test-authoring notes (not drifts)

- **F18 / D2 / D3 (Electron surfaces).** The `edit-commit` malformed-payload
  guard (`ipcMain.handle(IPC_EDIT_COMMIT)` in `src/main/main.ts`), the
  `rag-query`/`rag-backlinks` IPC throw behavior, and the IPC-not-group-gated
  surface are Electron/main-process constructs (import `electron`), not
  node-testable in the pure modules. The node-testable guarantees that make them
  hold are asserted directly: (a) `handleRagQueryIpc`/`handleRagBacklinksIpc`
  throw the documented fail-states (F9/F10/F12/F13/F14, D2); (b) the
  `IPC_EDIT_COMMIT` guard is verified by static grep of `src/main/main.ts`
  (F18); (c) the IPC channel constants exist and are renderer→main (C6/C7, D3).
- **F5/F6/C8/C9 (renderer negative contracts).** The renderer switch +
  `MUTATING_METHODS` are browser-entry constructs, not node-testable; the
  scenarios verify them by static grep on `src/renderer/renderer.ts` (comments
  stripped), matching the Unit E F22 / Unit G F7 / Unit B G9 convention.
- **F7 (five-seam registration).** The `RpcMethod` union membership is verified
  by static grep on `src/shared/types.ts`; the `TOOL_GROUPS`/`ALL_TOOLS`
  membership is verified via `groupForTool` + `ProvidentMcpServer.ALL_TOOLS`
  (node-testable).
- **F24 (null `targetedZones`).** The `code.template.validate` null-`zones`
  fail-state is exercised via `validateTemplate(customMain(), null)` (the pure
  validator), since a real template store always has a `targetedZones` array.
