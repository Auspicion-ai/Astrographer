# Unit U-D5 — Blind Green-Scenario Artifact (`rag.list_documents`)

- **Unit:** U-D5 — the read-only MCP tool `rag.list_documents` (single-store
  doc-heads listing).
- **Spec source (ONLY input):** `docs/specs/unit-ud5-list-documents-tool.md`
  (§5.2-§5.8), plus harness conventions from
  `tests/unit-ud5-list-documents-tool.test.ts`.
- **Blind writer:** did NOT read `src/main/mcp-server.ts` /
  `src/main/security.ts` (or any other `src/` file) to decide expected
  behavior; imported the seams only.
- **Artifact:** `tests/blind-unit-ud5-list-documents-tool-greens.test.ts`
  (22 scenarios, independent fixtures — not copied from the TestWriter set).
- **Command:** `npx vitest run tests/blind-unit-ud5-list-documents-tool-greens.test.ts`
- **Result:** 1 file passed; **22 passed / 0 failed** (`Duration 345ms`).

---

## 1. Scenario results

| ID | Spec § | Assertion | Result |
| --- | --- | --- | --- |
| B01 | §5.2 | `groupForTool('rag.list_documents') === 'rag'`; the 9-group `ToolGroup` set is unchanged (`rag` pre-existed) | PASS |
| B02 | §5.3 | `ProvidentMcpServer.ALL_TOOLS` contains `'rag.list_documents'` | PASS |
| B03 | §5.1 | `RpcMethod` union accepts the name (type-level; enforced by `npm run typecheck`) | PASS |
| B04 | §5.2 | `defaultSecurityConfig().enabled === ['read','dispatch']` (no `rag`); `toolAllowed(TOOL, …) === false` | PASS |
| B05 | §5.2 | With `rag` enabled, `toolAllowed(TOOL, ['rag']) === true` (and with `rag`+`read`) | PASS |
| B06 | §5.3 | Gate registration: `allowedToolNames()` omits the tool with read/dispatch, includes it with `rag` | PASS |
| B07 | §5.6/4 | Two-doc default store → `{ documents:[…] }` sorted ascending by `documentId`; root `path`/`tags` + head `title` projected | PASS |
| B08 | §5.4 | Payload has exactly key `documents`; each entry has exactly `documentId/title/path/tags` | PASS |
| B09 | §5.6/6 | Empty store (no `doc-head` edges) → `{ documents: [] }`, no throw | PASS |
| B10 | §5.6/7 | Explicit default name `{ store:'alpha' }` deep-equals the omitted-store call | PASS |
| B11 | §5.6/8 | Named non-default store lists only that store; default-store doc absent (no merge); store-qualified id preserved | PASS |
| B12 | §5.7/1 | Unknown store throws byte-exact `rag.list_documents: unknown store 'ghost'` (echoes only caller input) | PASS |
| B13 | §5.7/1 | >200-char unknown store echoed capped (`first 197 + '…'`) | PASS |
| B14 | §5.7/2 | Non-string/empty-string store (`null,5,true,false,{ },[],0,''`) throws byte-exact `…store must be a non-empty string` | PASS |
| B15 | §5.7/3 | Null store throws byte-exact `rag.list_documents: no rag store configured` (before resolution) | PASS |
| B16 | §5.5 | Stray `stores:'all'` is ignored — result equals the single-store listing; other store's doc absent (no fan-out) | PASS |
| B17 | §5.7/10 | Serialized payload leaks no store name, persistence path (`.json`), or `store` census key | PASS |
| B18 | §5.6/11 | Injected `auditLog.list()` is unchanged (length 0) after a listing | PASS |
| B19 | §5.7/5 | Malformed `doc-head` targets (empty/`undefined`/non-string) skipped; valid entry survives, no phantom | PASS |
| B20 | §5.7/6 | Missing root → entry `path:[] / tags:[]`, never throws | PASS |
| B21 | §5.7/7 | Tampered non-array `documentPath`/`tags` normalize to `[]/[]` | PASS |
| B22 | §5.6/9 | `handleRagTool(S,'rag.list_documents',{},…)` deep-equals `handleRagDocHeadsIpc(S)` for the same store | PASS |

No FAILs. No findings raised.

---

## 2. Scenarios not constructed (and why)

The following are either not runtime-enumerable (type-level only) or would
require a heavier harness than the direct-handler seam; none is a failure.

| Scenario | Spec § | Why not constructed here |
| --- | --- | --- |
| `ToolGroup` / `VALID_GROUPS` union membership count (exact member list) | §5.8 | A TS union has no runtime representation. B01 covers the observable behavior (the 9 literal groups still validate; `rag` maps correctly). The exact union membership is a `tsc --noEmit` concern. |
| Exact `ALL_TOOLS` length `56` | §5.8 | Derivable from the spec but the house reference set pins membership, not the count; a numeric census is not a behavior contract and would be brittle. B02 pins membership. |
| SDK `inputSchema` exactly `{ store: z.string().optional() }`, no `stores` field | §5.3 | Blind-constructible via the in-memory SDK client, but outside the requested coverage set; the schema shape is a registration detail, and the handler-level resolution is covered by B10-B16. Not a non-constructible scenario — deliberately out of scope. |
| `rag.list_documents` absent from renderer `MUTATING_METHODS` | §5.8/§5.5 | The set is renderer-side and not exported, so the contract is pinned by a source scan (as in the house reference set), not by a purely behavioral blind assertion. Omitted to keep the set behavior-derived. |
| No `rag-store-changed` broadcast / no store write | §5.6/12 | Blind-constructible via an SDK broadcast spy or a store wrapper, but the handler is synchronous and returns before any backend is reachable; B18 (no audit) + B16/B17 (no census) cover the read-only side-effects reachable through the direct seam. |
| Legacy directory-less path (`dir === null`) with a passed store | §5.6/10 | Deliberately not constructed: the `dir === null` sentinel semantics (`target = store`) are a `resolveStoreArg` inheritance detail; the requested resolution matrix (default/named/unknown/malformed) is covered by B10-B15. |
