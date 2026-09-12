# Spec — Unit U-D5: The Read-Only MCP Tool `rag.list_documents` (Single-Store Doc-Heads Listing)

- **Status:** SPEC (the read-only MCP-tool half of the document
  directory/category slice — the FIFTH unit of the ratified U-D1…U-D7
  decomposition; execution order U-D1 → U-D2 → U-D3 → U-D4 → **U-D5** ∥ U-D6 →
  U-D7). Gate references: `docs/decisions.md` row
  **DOC-DIRECTORY-CATEGORY-GATE** (PROCEED-WITH-AMENDMENTS, RATIFIED
  2026-09-11), `docs/specs/document-directory-category-review.md` (M12/M15 +
  the U-D5 row in §5; §6 tracker reconciliation), and the GATED parent
  `docs/specs/document-directory-category.md`. Sibling/precedent specs:
  `docs/specs/unit-ud4-doc-heads-tree.md` (the LANDED `handleRagDocHeadsIpc` +
  `RagDocHeadsPayload` with `path`/`tags` — the computation and the result
  shape this tool reuses), `docs/specs/unit-ms2-store-wiring.md` (the
  store-resolution seam + the `store` argument on the rag/edit tools),
  `docs/specs/unit-ms3-store-qualified-broadcast.md` (the store-qualification
  discipline), `docs/specs/unit-j-mcp-security-hardening.md` (§5.2 invariants +
  the seam list), and `docs/specs/unit-m-children-field.md` (the spec FORMAT).
- **Scope:** EXACTLY three primary source sites — the ACTUAL seam set for a
  main-handled read tool (M15), NOT `MUTATING_METHODS`, NOT the renderer
  switch, NOT a new group:
  1. `src/main/security.ts` — `TOOL_GROUPS` gains
     `'rag.list_documents': 'rag'` (a new row in the EXISTING `rag` group,
     after `'rag.backlinks': 'rag'` at `:38`). The `ToolGroup` union (`:3`) and
     `VALID_GROUPS` (`:188`) are **UNCHANGED** — `'rag'` already exists in both.
  2. `src/main/mcp-server.ts` — `ALL_TOOLS` gains `'rag.list_documents'`
     (after `'rag.backlinks',` at `:1729`); the SDK registration array
     (`const graph`, `:2132-2220`) gains the row
     `{ name: 'rag.list_documents', description, inputSchema: { store:
     z.string().optional() } }` (after the `rag.backlinks` row at `:2162`);
     and `handleRagTool` gains a `case 'rag.list_documents'` that routes
     through the SAME shared computation as the `rag-doc-heads` IPC —
     `return handleRagDocHeadsIpc(target)` (inserted after the
     `case 'rag.backlinks'` block, before `default:` at `:492`).
  3. `src/shared/types.ts` — the `RpcMethod` union (`:262-309`) gains
     `| 'rag.list_documents'` (after `| 'rag.backlinks'` at `:292`).
  No other source file changes. `src/main/main.ts` (the `rag-doc-heads` IPC
  wiring) is UNCHANGED; `src/main/preload.ts` is UNCHANGED (no bridge method —
  the tool is agent-only); the renderer is UNCHANGED (no case, no
  `MUTATING_METHODS` member — main-handled).
- **DELIBERATE EXCLUSIONS (the ratified decomposition splits these out — this
  unit implements NONE of them):**
  - **U-D6 — `rag.query`/`rag-stream` document filters.** `RagQueryFilters`, the
    `validateFilters`/`validateRagQueryFilters` extension, and the `rag.query`/
    `rag-stream` zod schemas (M8) are U-D6. U-D5 adds NO filter arg.
  - **U-D7 — the tag write op `edit.set_doc_meta`.** The op, its `edit` group
    gating, its validation/authorization caps, and path immutability are U-D7.
    U-D5 is READ-ONLY and adds NO write op.
  - **ui-overhaul G2 — the doc-nav TREE rendering.** The provident-authored
    folder/leaf tree UI is G2 (ratified 2026-09-11). U-D5 exposes no UI and
    authors no tree.
  - **No store/traversal/model change.** U-D5 does not touch `RagNode`, the
    `nodeSource` hash, the journal (U-D2), the importer (U-D3), the doc-heads
    handler (U-D4), `computeDocumentSubgraph`/`buildTraversal`, or any
    persisted format. It adds NO `RagDocHeadsPayload` field and NO new type.
  - **No store census / no `stores:'all'` fan-out.** U-D5 is SINGLE-STORE
    (M12) and never enumerates configured stores (preserves
    `UI-SELECTOR-DEFERRED`, `decisions.md:112`).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/security.ts`,
  `src/main/mcp-server.ts` (`ALL_TOOLS`, the zod row, the `handleRagTool`
  case), and `src/shared/types.ts` (`RpcMethod`) from §5.6/§5.7 BEFORE any
  implementation, into `tests/unit-ud5-list-documents-tool.test.ts`. The tool
  path is testable WITHOUT Electron via direct `handleRagTool(...)` calls (the
  house `tests/rag-edit-gate.test.ts:216` / `tests/unit-ms2-store-wiring.test.ts`
  seam) and, for the zod schema, the in-memory SDK harness pattern
  (`tests/embeddings-adversarial.test.ts:104-119`).

---

## 1. What the unit asks

The document directory/category slice's read surface (Q2/Q3/M7/M13) is landed
as the `rag-doc-heads` IPC (`handleRagDocHeadsIpc` → `RagDocHeadsPayload`
entries `{ documentId, title, path, tags }`). The agentic/MCP surface needs the
SAME listing reachable as a first-class read tool, WITHOUT duplicating the
computation and WITHOUT exposing a store census. This unit lands:

1. **A NEW read-only MCP tool `rag.list_documents`** in the `rag` ToolGroup
   (default-off), registered through the ACTUAL per-landing seam set for a
   main-handled read tool (M15). It is NOT mutating → NOT in
   `MUTATING_METHODS`, NOT a renderer-seam method.
2. **An optional `store?: string`** resolved through the EXISTING
   store-resolution seam (`resolveStoreArg`) with the SAME M1/M2/S1/S2/S3
   behavior as every other `rag.*` tool (U-MS2). No `stores:'all'` fan-out.
3. **The doc-heads output** — the SAME `{ documents: [{ documentId, title,
   path, tags }] }` shape U-D4 landed — by routing through the SAME shared
   `handleRagDocHeadsIpc` computation (MCP-UI-EQUIVALENCE). The logic is NOT
   duplicated.
4. **SINGLE-STORE scope (M12):** the tool lists the addressed store's documents
   and nothing else. It never enumerates/fans out across stores, never returns
   a store census, and never returns store names/paths (preserving
   `UI-SELECTOR-DEFERRED`). Display retains the U-D4 fields: the entry
   `documentId` is the store-qualified id as stored (including any `<name>:`
   prefix for a non-default store, per U-D3/STORE-ID-PREFIX); `path`/`title`
   are the display fields — EXACTLY the U-D4 payload.
5. **Read-only, no audit.** Gated by the `rag` group; default-off. A listing
   records NO audit entry (pinned in §5.4: only `rag.query`/`rag-stream` record;
   the other read tools do not). No broadcast.

## 2. Feasibility verdict

**Feasible — a small, purely additive wiring of an already-landed computation
onto the already-landed five-seam gate.** No engine/foundation gap; entirely
host-side (`src/`).

- **The computation is landed and shared.** `handleRagDocHeadsIpc(store)`
  (`mcp-server.ts:874-905`) is exported from the SAME module as `handleRagTool`
  (`:188`). A `case 'rag.list_documents'` can call it directly with the
  resolver's addressed store — zero duplication, and the two surfaces
  (`rag-doc-heads` IPC and this tool) route through the identical function
  (MCP-UI-EQUIVALENCE). Function declarations are hoisted, so the forward
  reference is safe.
- **The result type is landed.** `RagDocHeadsPayload` (`types.ts:533-549`)
  carries the REQUIRED `path`/`tags` (U-D4). The tool returns it as-is; NO new
  type is introduced.
- **The resolution seam is landed.** `resolveStoreArg` (`rag-store-directory.ts:110`)
  + the `handleRagTool` resolution step (`mcp-server.ts:208-214`) already give
  every `rag.*` tool the M1/M2/S1/S2/S3 behavior; the new case runs AFTER the
  resolution, so unknown/malformed `store` fails exactly as U-MS2 pins.
- **The group + gate already exist.** `'rag'` is a `ToolGroup` member
  (`security.ts:3`) and a `VALID_GROUPS` member (`:188`); `TOOL_GROUPS` already
  routes 7 tools to it. Adding one row changes no group/union/validator.
- **The registration branch already covers the prefix.** `registerTools` routes
  every `name.startsWith('rag.')` tool to `handleRagTool`
  (`mcp-server.ts:2248-2254`); `rag.list_documents` needs no new branch.
- **RCA-10 check — NO conflict.** The pinned semantics (name, group,
  resolution, output shape, no fan-out, read-only) match the landed code
  exactly: the tool name is free (grep: no `rag.list_documents` anywhere), the
  `rag` group exists, the handler is exported and synchronous, and
  `RagDocHeadsPayload` is the exact output shape. See §5.4 for the per-pin RCA-10
  verification. The only observation (NOT a blocker) is the M15 claim that
  "every landed `rag.*`/`edit.*` tool is declared in `RpcMethod`" is not
  literally true today (`edit.import_markdown`, `rag-stream`, and
  `get_query_audit_log` are absent); the M15 amendment and the U-D5 row both
  direct the addition, and adding a union member has no runtime effect, so the
  unit proceeds.

No `provident-ssr` engine seam is involved, so no `docs/defects.md` /
`docs/HANDOFF.md` item is expected from this unit.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `rag.list_documents` tool name + group row | Project-specific (the MCP tool surface) | Low cost; makes the U-D4 doc-heads listing agent-reachable as a first-class read tool. |
| The `store` arg + resolution | Project-specific (reuses the U-MS2 seam) | Zero new logic; the resolution-first ordering is inherited from `handleRagTool`. |
| The output via `handleRagDocHeadsIpc(target)` | Project-specific (reuses U-D4) | Zero duplication; MCP/UI equivalence is structural (one computation). |
| The `RpcMethod` union member | Project-specific (the shared IPC-contract declaration) | Zero runtime cost; additive type member per M15/the U-D5 row. |

No engine gap. U-D6 (query filters), U-D7 (`edit.set_doc_meta`), and
ui-overhaul G2 (the tree UI) are LATER units — NOT this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — **to be run after the unit lands**. The
known edge cases this unit's contract already pins (so the adversarial pass must
NOT regress them); the pass results are recorded at the end of this section:

- **A1 — unknown store is fail-loud and echoes ONLY the caller's input.** An
  unknown `store` (`{ store: 'nope' }`) throws
  `` rag.list_documents: unknown store 'nope' `` (M2) BEFORE the listing runs;
  a long name is capped at 200 chars (the F-MS2-5 idiom) and never enumerates
  the registry (B9/A9). A non-string/number/object/boolean/empty-string `store`
  throws `rag.list_documents: store must be a non-empty string` (M1). The
  adversarial pass must confirm no store method ran (no listing, no census).
- **A2 — no store census / no fan-out (M12).** The tool output contains ONLY
  document entries — never store names, persistence paths, corpus roots, or
  counts. `rag.list_documents` has NO `stores` schema field and the case ignores
  a stray `args.stores`; a direct call with `stores: 'all'` returns the SINGLE
  addressed store's listing (never a merge). The adversarial pass must confirm
  the output carries no `<name>` census and no merge.
- **A3 — malformed doc-head edges/roots are absorbed (U-D4 inheritance).** A
  `doc-head` edge with a missing/`undefined`/empty/non-string `target` is
  SKIPPED (no phantom entry, no crash); a missing/quarantined root emits
  `path: []`/`tags: []`; a tampered non-array `documentPath`/`tags` emits `[]`.
  The adversarial pass must confirm a corrupted store cannot crash or leak a
  phantom through the MCP path.
- **A4 — empty store → `{ documents: [] }`.** A store with no `doc-head` edges
  (first run / empty corpus) must return the empty listing, not throw.
- **A5 — store-qualified id, display path (M12).** For a non-default store, an
  entry `documentId` carries the store-qualified id as stored (the `<name>:`
  prefix from U-D3) while `path`/`title` are display fields — the tool returns
  the payload unchanged (no id split, no id rewriting). The adversarial pass
  must confirm the ids are byte-identical to `handleRagDocHeadsIpc`'s.
- **A6 — MCP/UI equivalence is structural.** `handleRagTool(target,
  'rag.list_documents', {}, engine, dir)` deep-equals
  `handleRagDocHeadsIpc(target)` for the same store. The adversarial pass must
  confirm no second computation exists (no output drift).
- **A7 — read-only + no side effects.** The case performs no store write, no
  journal entry, no broadcast, and no audit entry. The adversarial pass must
  confirm `handleRagTool` for this name calls only `handleRagDocHeadsIpc`
  (whose only accesses are `edgesByKind`/`listEdges`/`listNodes`).
- **A8 — group gating.** With `rag` disabled, the tool is not registered and
  `toolAllowed` returns false; with `rag` enabled, it is registered/callable.
  Editing is never a `code`-group op (invariant unaffected).

Any host finding is fixed here + regression-tested; any `provident-ssr` package
finding → `docs/defects.md`/`docs/HANDOFF.md` (none expected).

**Adversarial pass (RCA-3, 2026-09-11, post-green):**

- **F1/F2 (HIGH, HOST — FIXED):** the `ALL_TOOLS` 55→56 census ripple was
  INCOMPLETE — both `tests/unit-h8-operator-editor.test.ts:1269` and
  `tests/unit-h2-runtime-controller.test.ts:1383` still pinned 55, so the suite
  was RED (the Implementer's claimed green was false). FIXED: both pins (and
  their titles/comments) updated to 56; the spec §6 "no other test pins the
  length" claim was NOT corrected by the landing pass (reconciled later in the
  doc-review pass). Re-verified `npm test` = 149 files / 3633 pass + 43
  skip (pre-blind-greens; final after blind-greens: 150 files / 3655 pass + 43
  skip), typecheck + build clean.
- **F5 (INFO, HOST — pre-existing, out of scope):** `src/renderer/secure-panels.ts`
  `GROUPS`/`GROUP_LABELS` describes the `rag` group as "rag.query, get_document,
  list_nodes, get_edges, backlinks" — already stale (missing Unit X's `rag-stream`/
  `get_query_audit_log`) and now also `rag.list_documents`. U-D5 deliberately
  leaves the renderer unchanged. Tracked in `docs/defects.md` as
  **HOST-RAG-GROUP-LABEL-STALE**.
- **F3/F4 (INFO, process):** the false-green report and the not-yet-run
  blind-greens/doc-review gates, both closed by the unit cycle.

No PACKAGE finding.

### 3b. Proposal-review findings

The proposal-review gate returned **PROCEED-WITH-AMENDMENTS** for the document
directory/category proposal (`docs/decisions.md` row
**DOC-DIRECTORY-CATEGORY-GATE**, 2026-09-11;
`docs/specs/document-directory-category-review.md`). The amendments THIS unit
pins (each cross-referenced to the section that resolves it):

- **M12 — listing scope** (§5.4/§5.5): `rag.list_documents` is SINGLE-STORE
  only and never a store census (preserves `UI-SELECTOR-DEFERRED`); display
  `path`/basename, not the `<name>:`-prefixed id (the entry `documentId` stays
  the qualified id as stored; `path`/`title` are display). **RCA-10: no code
  conflict — verified.**
- **M15 — seam-set precision** (§5.1-§5.3): a main-handled read tool touches
  `security.ts` `TOOL_GROUPS` + `mcp-server.ts` `ALL_TOOLS` (+ zod + handler) +
  `types.ts` `RpcMethod` — NOT `MUTATING_METHODS`, NOT the renderer switch. The
  `ToolGroup`/`VALID_GROUPS` unions need NO change (the `rag` group exists).
- **U-D5 row (§5)** (§1/§5.8): `security.ts:36`; `mcp-server.ts`
  `ALL_TOOLS`+zod+`handleRagTool`; `types.ts:288-299` `RpcMethod`. Primary
  fail-state coverage: single-store scope (no census); unknown store; empty
  store; malformed ids.
- **DOC-DIRECTORY-CATEGORY-GATE / RAG-EDIT-MCP-GROUPS (consumed):** the `rag`
  group is read-only + default-off through the five-seam gate; editing is never
  a `code`-group op.

## 4. Design decisions pinned by this spec

- **DOC-DIRECTORY-CATEGORY-GATE (consumed, M12 + the U-D5 row):** a read-only
  `rag.list_documents` in the `rag` group, single-store only, reusing the
  U-D4 listing.
- **RAG-EDIT-MCP-GROUPS (consumed):** the `rag` group is read-only +
  default-off through the ACTUAL seam set for a main-handled read tool.
- **MCP-UI-EQUIVALENCE (consumed, §8.2 BINDING):** the tool and the
  `rag-doc-heads` IPC route through the SAME shared `handleRagDocHeadsIpc`
  computation — the same graph and the same listing are reachable equivalently
  through the MCP surface and the Electron UI.
- **UI-SELECTOR-DEFERRED (consumed, `decisions.md:112`):** NO store-census MCP
  tool. `rag.list_documents` lists the addressed store's DOCUMENTS only; it
  never names/enumerates the configured stores.
- **IPC-SURFACE-NOT-GROUP-GATED (consumed, `decisions.md:45`):** the
  `rag-doc-heads` IPC is NOT group-gated; the `rag` group gates the MCP agent
  path only. U-D5 adds no IPC channel and no bridge method.
- **RAG-AUTHORITATIVE (consumed):** the RAG store is the source of truth; the
  listing is a projection of the addressed store's `doc-head` edges + root-node
  metadata, computed read-only.
- **SINGLE-WRITER-STORE / ENGINE-PER-STORE (consumed, U-MS2):** the addressed
  store is resolved through `resolveStoreArg`; the default store serves an
  omitted `store`.
- **M15 sub-pin — the seam set is per-landing.** `ToolGroup` (`:3`) and
  `VALID_GROUPS` (`:188`) are UNCHANGED (the `rag` group exists);
  `MUTATING_METHODS` and the renderer switch are UNCHANGED.

## 5. The exhaustive contract

### 5.1 The tool name + group (pinned)

- The tool name is EXACTLY **`rag.list_documents`** (lowercase, `rag.` prefix,
  underscore). It starts with `rag.`, so `registerTools`'s existing
  `name.startsWith('rag.')` branch (`mcp-server.ts:2248`) routes it to
  `handleRagTool` — NO new dispatch branch.
- It belongs to the **`rag`** ToolGroup (read-only, default-off), like every
  other `rag.*` tool.
- It is a **main-handled read tool**: its seam set is `security.ts`
  `TOOL_GROUPS` + `mcp-server.ts` `ALL_TOOLS` + zod + `handleRagTool` +
  `types.ts` `RpcMethod` (M15) — NOT `MUTATING_METHODS`, NOT the renderer
  switch, NOT an IPC channel, NOT a bridge method.

### 5.2 The `security.ts` seam (`TOOL_GROUPS`)

`ToolGroup` (`security.ts:3`) and `VALID_GROUPS` (`:188`) are **UNCHANGED**.
Only `TOOL_GROUPS` gains one row.

**The insertion (pinned):**

```ts
// src/main/security.ts — TOOL_GROUPS (the rag.* read block, after :38).
  'rag.query': 'rag',
  'rag.get_document': 'rag',
  'rag.list_nodes': 'rag',
  'rag.get_edges': 'rag',
  'rag.backlinks': 'rag',
  // U-D5 (docs/specs/unit-ud5-list-documents-tool.md §5.2) — the read-only
  // `rag.list_documents` doc-heads listing (single-store). `rag` group.
  'rag.list_documents': 'rag',
```

**Rules (pinned):**

- `groupForTool('rag.list_documents')` → `'rag'` (exact-name static lookup).
- `toolAllowed('rag.list_documents', ['read', 'dispatch'])` → `false`
  (default-off); with `'rag'` enabled → `true`.
- `defaultSecurityConfig().enabled` (`:136-138`) is UNCHANGED
  (`['read', 'dispatch']`) — the tool is default-off.
- `applyPatch`'s `VALID_GROUPS` (`:188`) is UNCHANGED — `rag` is already valid.

### 5.3 The `mcp-server.ts` seams (`ALL_TOOLS` + the zod row)

**Seam 3a — `ALL_TOOLS` (add one row; 55 → 56).** After `'rag.backlinks',`
(`:1729`), before the Unit X `rag-stream`/`get_query_audit_log` rows:

```ts
    'rag.backlinks',
    // U-D5 §5.3 — the read-only doc-heads listing tool (single-store).
    'rag.list_documents',
```

**Seam 3b — the SDK registration row (add one row; after `:2162`).** After the
`rag.backlinks` row and before the Unit X rows:

```ts
      { name: 'rag.list_documents', description: 'List the documents in the addressed RAG store (the doc-heads listing: [{ documentId, title, path, tags }]) — the SAME shared computation as the rag-doc-heads IPC. SINGLE-STORE scope: never enumerates across stores. Read-only; does NOT record an audit entry. Requires rag group.', inputSchema: { store: z.string().optional() } },
```

**Rules (pinned):**

- **`inputSchema` is exactly `{ store: z.string().optional() }`** — the house
  `rag.list_nodes` mirror (a lax schema; the handler/`resolveStoreArg` enforces
  the strict value rules). There is NO `stores` field (no fan-out) and NO other
  arg.
- The row is registered ONLY when `allowed.includes('rag.list_documents')` —
  i.e. when the `rag` group is enabled (the existing gate in the registration
  loop, `mcp-server.ts:2223`).
- The `rag.` prefix routes the invocation to
  `handleRagTool(defaultStore, name, args, defaultEngine, directory, auditLog)`
  (`mcp-server.ts:2254`) — UNCHANGED.

### 5.4 The `handleRagTool` case + store-resolution ordering + output

`handleRagTool`'s existing prologue is UNCHANGED: the null-store guard
(`:196`), the `hand.get_document`/`rag.backlinks` guards, the `resolveStoreArg`
call (`:210`), and the addressed-entry/target selection (`:213-214`). The new
case body runs AFTER all of that, so:

1. **Null store** → `` throw new Error('rag.list_documents: no rag store
   configured') `` (the `${name}` guard at `:196`).
2. **`store` resolution FIRST** (`:210`) — M1 (non-empty string) then M2
   (membership) for a present `store`; S1 (default entry) for an omitted
   `store` against an injected directory; S3 (legacy sentinel → `target =
   store`) for the directory-less path. An unknown/malformed `store` fails
   BEFORE any listing.
3. **`target` = the addressed store** (`entry ? entry.store : store`, `:214`).

**The case (pinned):**

```ts
// src/main/mcp-server.ts — inside handleRagTool's switch, after
// `case 'rag.backlinks'` and before `default:` (:492).
    case 'rag.list_documents':
      // U-D5 §5.4 — the read-only doc-heads listing. Routes through the SAME
      // shared computation as the `rag-doc-heads` IPC (MCP-UI-EQUIVALENCE):
      // `handleRagDocHeadsIpc(target)` — the ADDRESSED store (`target`, §5.4
      // step 3). Single-store (M12): no fan-out, no census. Read-only: no
      // audit entry (only rag.query/rag-stream record) and no broadcast. The
      // U-D4 payload `{ documents: [{ documentId, title, path, tags }] }` is
      // returned unchanged.
      return handleRagDocHeadsIpc(target)
```

**Output shape (pinned):** EXACTLY `RagDocHeadsPayload` (`types.ts:533-549`) —
`{ documents: Array<{ documentId: string; title: string; path: string[];
tags: string[] }> }`. No wrapper, no added field, no `store` stamp (the
listing is already single-store; the `rag.query`-style `store` stamp is NOT
added here).

**Output rules (pinned):**

- **Empty store / no `doc-head` edges** → `{ documents: [] }` (U-D4).
- **`documentId`** — the store-qualified id as stored, byte-identical to
  `handleRagDocHeadsIpc` (including a `<name>:` prefix for a non-default store
  per U-D3/STORE-ID-PREFIX). NO id rewriting/splitting.
- **`path`/`title`/`tags`** — the exact U-D4 values (`path` = the root's
  `documentPath ?? []`; `title` = the head section's content; `tags` = the
  root's `tags ?? []`). DISPLAY fields.
- **Sorted** by `documentId` ascending (`localeCompare`), deterministic
  (U-D4). Deduped by target (U-D4).
- **Malformed root/edge** — absorbed by U-D4 (`[]`/`[]` for a missing root;
  skip for a non-string/empty target).
- **No audit entry** — the case calls NO `auditLog.record` (unlike
  `rag.query`/`rag-stream`, `mcp-server.ts:323-332/:433-442`; the other
  `rag.*` read tools record none). The `auditLog` param is passed through the
  registration but unused by this case.
- **No broadcast** — the case emits nothing; `onStoreChanged`/`broadcast` are
  the `edit.*` path's (UNCHANGED).
- **Read-only** — the only store accesses are inside `handleRagDocHeadsIpc`
  (`edgesByKind`/`listEdges` + `listNodes`).

**MCP/UI equivalence (pinned, §8.2 BINDING):** for the same store `S`,
`handleRagTool(S, 'rag.list_documents', {}, engine, dir)` deep-equals
`handleRagDocHeadsIpc(S)`. The `rag-doc-heads` IPC wiring
(`main.ts` `handleRagDocHeadsIpc(runtime.getDefaultStore())`) is UNCHANGED, so
with an omitted `store` the tool and the IPC list the SAME default store via
the SAME function.

**RCA-10 verification (pinned):** the landed code matches every pin —
`handleRagDocHeadsIpc` is exported and returns `RagDocHeadsPayload`
  (`mcp-server.ts:874`); the `rag.` prefix is routed to `handleRagTool`
  (`:2248`); `resolveStoreArg` provides M1/M2/S1/S2/S3 (`rag-store-directory.ts:110`);
  the `rag` group exists in both `security.ts` unions (`:3`/`:188`); and the name
is unused anywhere (grep). NO conflict.

### 5.5 Single-store scope (M12) + no census (UI-SELECTOR-DEFERRED)

- The tool lists the addressed store's documents ONLY. It never iterates
  `dir.entries`, never returns store names, persistence paths, corpus roots,
  or per-store status. There is no `stores:'all'` code path and no `stores`
  schema field.
- A stray `stores` key on a direct handler call is IGNORED by the case (unlike
  `rag.query`/`rag-stream`, which validate and reject a non-`'all'` value and
  fan out on `'all'`). This is deliberate: `rag.list_documents` is defined as
  single-store with no fan-out semantics.
- The entry `documentId` remains the store-qualified id as stored (U-D3's
  `<name>:` prefix for non-default stores); `path`/`title` are the display
  fields. The tool does NOT strip the prefix (display is a consumer concern —
  the U-D4 payload / ui-overhaul G2).

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **Seam completeness:** `groupForTool('rag.list_documents') === 'rag'`;
   `ProvidentMcpServer.ALL_TOOLS` includes `'rag.list_documents'`; the
   `RpcMethod` union accepts `'rag.list_documents'` (type-level); the SDK graph
   array carries the row with `inputSchema: { store: z.string().optional() }`.
2. **Default-off:** `defaultSecurityConfig().enabled` is `['read', 'dispatch']`
   (no `rag`); `toolAllowed('rag.list_documents', ['read', 'dispatch']) ===
   false`.
3. **Enabled:** with `rag` in the enabled set, `toolAllowed('rag.list_documents',
   ['rag']) === true` and the tool is registered.
4. **Happy listing (default store):** a store with two `doc-head` edges (roots
   carrying `documentPath`/`tags`) → `handleRagTool(store, 'rag.list_documents',
   {}, engine, dir)` returns `{ documents: [ { documentId, title, path, tags },
   ... ] }` sorted ascending by `documentId`.
5. **Root metadata projection:** a root with `documentPath: ['a','b']` /
   `tags: ['x']` → the entry has `path: ['a','b']`, `tags: ['x']`; `title` comes
   from the head section.
6. **Empty store:** a store with no `doc-head` edges → `{ documents: [] }` (no
   throw).
7. **Explicit default store:** `{ store: 'main' }` (the directory's default
   name) → deep-equals the omitted-`store` call (the U-MS2 omitted ≡
   explicit-default equivalence).
8. **Non-default store (single-store):** `{ store: '<other>' }` with a registry
   directory → the addressed OTHER store's listing; the DEFAULT store's
   documents are NOT included (no merge).
9. **MCP/UI equivalence:** `handleRagTool(S, 'rag.list_documents', {}, engine,
   dir)` deep-equals `handleRagDocHeadsIpc(S)` for the same store.
10. **Legacy directory-less path:** `handleRagTool(store, 'rag.list_documents',
    {}, engine, null)` (or `dir` omitted) → the passed `store` is listed
    (S3), byte-equal to the directory-routed default call for that store.
11. **No audit entry:** with an `auditLog` injected, a `rag.list_documents`
    call leaves `auditLog.list()` unchanged (unlike `rag.query`).
12. **No broadcast / read-only:** the call performs no store write and no
    `rag-store-changed` broadcast (the case emits nothing).

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **Unknown store (M2):** `handleRagTool(store, 'rag.list_documents',
   { store: 'nope' }, engine, dir)` throws exactly
   `` rag.list_documents: unknown store 'nope' `` — BEFORE the listing runs;
   the message echoes only the caller's input (no census). A >200-char raw is
   capped (first 197 + `…`).
2. **Malformed `store` (M1):** a non-string (`5`/`true`/`null`/`{}`/`[]`) or
   empty-string `store` throws exactly
   `rag.list_documents: store must be a non-empty string`; no listing.
3. **Null store:** `handleRagTool(null, 'rag.list_documents', {}, engine, dir)`
   throws exactly `rag.list_documents: no rag store configured`.
4. **Group off / unauthorized:** with `rag` disabled, the tool is not
   registered and `toolAllowed('rag.list_documents', ['read','dispatch']) ===
   false`; it is unreachable through the MCP path.
5. **Malformed `doc-head` edge:** an edge with a missing/`undefined`/empty/
   non-string `target` is SKIPPED — no phantom `{ documentId: undefined }`
   entry, no crash (U-D4 inheritance).
6. **Missing/quarantined root:** a `doc-head` edge whose root node is absent
   from `listNodes()` → the entry has `path: []`, `tags: []` (never throws).
7. **Tampered non-array `documentPath`/`tags`:** a root whose fields are
   non-arrays (tampered shape) → `[]`/`[]` (U-D4's `Array.isArray` guards).
8. **Malformed store state does not crash the tool:** a corrupted edge/node
   set never yields a throw other than the documented M1/M2/null-store guards.
9. **No `stores` fan-out:** a direct call with
   `{ store: 'main', stores: 'all' }` returns the single addressed store's
   listing (the case ignores `stores`; no merge, no enumeration). The live
   zod schema has no `stores` field, so the SDK strips it.
10. **No census leak:** the returned payload contains ONLY `documents` entries
    — no store names/paths/status; an unknown-store error names only the
    caller's input.

### 5.8 Census / numeric claims

- **New MCP tools:** 0 → **1** (`rag.list_documents`).
- **`ALL_TOOLS` entries:** 55 → **56** (the U-H8 census pin at
  `tests/unit-h8-operator-editor.test.ts:1270` `toHaveLength(55)` MUST be
  updated to `56` as a sanctioned ripple — see §6).
- **`TOOL_GROUPS` `rag` rows:** 7 → **8** (`rag.query`, `rag.get_document`,
  `rag.list_nodes`, `rag.get_edges`, `rag.backlinks`, `rag-stream`,
  `get_query_audit_log`, + `rag.list_documents`). New group rows: **1**.
- **`ToolGroup` union members:** 9 → **9** (UNCHANGED — `rag` exists):
  `read`, `dispatch`, `graph`, `code`, `module`, `rag`, `edit`, `gnosis`,
  `gnosis-edit`.
- **`VALID_GROUPS` values:** 9 → **9** (UNCHANGED).
- **`RpcMethod` members:** + **1** (`rag.list_documents`).
- **SDK `graph` rows:** + **1**.
- **`handleRagTool` cases:** + **1**.
- **New `MUTATING_METHODS` members:** **0**. **New renderer switch cases:**
  **0**. **New IPC channels / bridge methods:** **0**.
- **New audit entries recorded:** **0**. **New broadcasts:** **0**.
- **New types:** **0** (reuses `RagDocHeadsPayload`). **New `RagNode` fields:**
  **0**. **New persisted formats/store/journal/traversal changes:** **0**.
- **Source files changed:** **3** — `src/main/security.ts`,
  `src/main/mcp-server.ts`, `src/shared/types.ts`. `src/main/main.ts`,
  `src/main/preload.ts`, `src/main/rag-store-directory.ts`,
  `src/shared/document-tree.ts`, and the renderer: **0**.

### 5.9 Cross-references

- **Gate:** `docs/specs/document-directory-category-review.md` (M12/M15 + the
  U-D5 row in §5; §6 tracker reconciliation) and `docs/decisions.md` row
  **DOC-DIRECTORY-CATEGORY-GATE** (PROCEED-WITH-AMENDMENTS, RATIFIED
  2026-09-11).
- **Parent (GATED):** `docs/specs/document-directory-category.md` §3.4 (the
  listing), §3.7 (the read surface), §6 (the U-D5 unit).
- **Precedent / consumed (LANDED):** `docs/specs/unit-ud4-doc-heads-tree.md`
  §5.1 (`RagDocHeadsPayload` with required `path`/`tags`), §5.2
  (`handleRagDocHeadsIpc` — the shared computation), §5.5 (display-only
  backfill). The handler: `src/main/mcp-server.ts:874-905`.
- **Consumed (LANDED):** `docs/specs/unit-ms2-store-wiring.md` §5.2 (the
  trailing `store` schema field), §5.3 (the resolution-first ordering + the
  M1/M2/S1/S2/S3 matrix); `docs/specs/unit-ms3-store-qualified-broadcast.md`
  (the store-identification discipline; U-D5 emits no broadcast);
  `docs/specs/unit-ms1-store-registry.md` (the `rag` names).
- **Hardening (consumed):** `docs/specs/unit-j-mcp-security-hardening.md` §5.2
  (invariants (a)/(e)/(f) — `rag.*` read-only + default-off; the renderer
  switch fails closed; `MUTATING_METHODS` is renderer-graph-only), §5.5 Seam 1-5
  (a main-handled read tool's ACTUAL seam set).
- **Decisions:** `docs/decisions.md` rows **DOC-DIRECTORY-CATEGORY-GATE**,
  **RAG-EDIT-MCP-GROUPS**, **MCP-UI-EQUIVALENCE**, **UI-SELECTOR-DEFERRED**,
  **IPC-SURFACE-NOT-GROUP-GATED**, **RAG-AUTHORITATIVE**.
- **Downstream units (NOT this spec):** U-D6 (`rag.query`/`rag-stream` document
  filters), U-D7 (`edit.set_doc_meta`), ui-overhaul G2 (the doc-nav tree UI).
- **Host patterns:** `src/main/security.ts:3,34-38,188` (`ToolGroup`,
  `TOOL_GROUPS`, `VALID_GROUPS`), `src/main/mcp-server.ts:188-486`
  (`handleRagTool`), `:874-905` (`handleRagDocHeadsIpc`), `:1700-1776`
  (`ALL_TOOLS`), `:2132-2220` (the SDK `graph`), `:2248` (the `rag.` routing),
  `src/main/rag-store-directory.ts:110` (`resolveStoreArg`),
  `src/shared/types.ts:262-309` (`RpcMethod`), `:533-549`
  (`RagDocHeadsPayload`).

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set from §5.6/§5.7 BEFORE any implementation. The
red set (recorded in the next-steps DONE row for this unit):

- **`src/main/security.ts` (seam 1):** §5.6 states 1-3 — `groupForTool`
  resolves `'rag'`; `toolAllowed` is default-off / enabled; `ToolGroup` +
  `VALID_GROUPS` are unchanged.
- **`src/main/mcp-server.ts` (`ALL_TOOLS` + zod + `handleRagTool`):** §5.6
  states 1, 4-12 + §5.7 states 1-3, 5-10 — the `ALL_TOOLS` row, the zod row
  (`{ store: z.string().optional() }`, no `stores`), the listing via
  `handleRagDocHeadsIpc`, the resolution M1/M2/S1/S2/S3, the empty store, the
  non-default single-store case, the MCP/UI equivalence, no audit, no
  broadcast, and the malformed-edge/root absortion.
- **`src/shared/types.ts` (`RpcMethod`):** §5.6 state 1 — the union accepts
  `'rag.list_documents'` (type-level, caught by `npm run typecheck`).
- **Sanctioned existing-test ripple:** `tests/unit-h8-operator-editor.test.ts:1269`
  pins `ProvidentMcpServer.ALL_TOOLS` at `toHaveLength(55)`; U-D5 makes it 56,
  so that assertion (and its comment) is updated in the same pass — a
  sanctioned ripple, not a behavior change. **Two** existing tests pin the `ALL_TOOLS` length and BOTH are updated in the same pass — `tests/unit-h8-operator-editor.test.ts:1269` (55 → 56) and `tests/unit-h2-runtime-controller.test.ts:1383` (D6a, 55 → 56), each with its title/comment. No test pins the `RpcMethod` member count.
- **Post-green gates (per AGENTS.md):** the adversarial pass (§3a) records its
  findings in this spec; the blind-greens writer produces a scenario artifact
  from this spec + `docs/specs/unit-ud5-list-documents-tool-greens.md` (created
  with the greens); the documentation review reconciles this spec, the
  trackers, and the U-D4 payload/`RagDocHeadsPayload` references.
