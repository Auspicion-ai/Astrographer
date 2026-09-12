# Unit U-PARITY-C18 — Advanced Search Dropdown (C18 / G4) — Spec

**Status:** DRAFT 2026-09-11. **Document-only — no code.** Gate: UI-overhaul
umbrella gate; C15 (U-D6) supplies the new `filters` fields. Open items:
`docs/specs/wave-1-open-decisions.md` W1-Q9.

---

## 1. What the proposal asks

The `search` pane exposes only `query` + `topK`; the `rag.query` argument surface
is otherwise unreachable (the G4 PARTIAL). Add an **advanced-search dropdown
sub-pane** exposing the full `rag.query` args (C18), and a result-detail render.

---

## 2. Contract (pinned)

- A **disclosure/dropdown** sub-pane inside the app-graph `search` pane (provident
  authored; `on:click` toggles the disclosure).
- Fields (W1-Q9): `mode` (`flat`/`graph`), `maxHops`, `expand`
  (`none`/`parent`), `maxParentContext`, `filters` (`nodeKind`, `edgeType`,
  `target {documentId,nodeId}`, `state`), `stores:'all'`, and the C15
  `documentPathPrefix`/`tags` when present.
- Submitting sends the SAME payload as `rag.query` through the shared
  `handleRagTool`/`rag-query` IPC (MCP/UI equivalence at the application seam).
- **Result detail:** render `citations`/`trace`/`blockedBy`/`results` fields
  (currently PARTIAL) in the result row/detail.
- Invalid combinations surface the engine's error (e.g. `stores:'all'` + graph
  mode) without a crash.

---

## 3. States (TestWriter red set)

1. The disclosure renders collapsed by default; toggling reveals the fields.
2. A `mode='graph'` query flows the arg through to the engine.
3. `filters` (e.g. `nodeKind='fact'`) reach the engine.
4. `stores:'all'` is selectable and reaches the fan-out path.
5. Citations/trace render when present.
6. An invalid combo (`stores:'all'`+graph) shows the error, no throw.
7. An agent can drive the disclosure/fields via `provident.dispatch` (app-graph).

## 4. Fail-states

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | malformed filters | engine error surfaced, no crash |
| F2 | C15 fields absent | the controls are omitted (not broken) |
| F3 | empty result | empty state |

## 5. Census

- 1 disclosure sub-pane + N controls + a result-detail render helper; reuses the
  existing `rag-query` IPC. 0 new dependencies; no new MCP tool.

## 6. Cross-references

- `docs/specs/ui-overhaul.md` C18, §4 G4, §5.4, §7 Q23.
- `docs/specs/unit-ud6-query-document-filters.md` (the C15 filters),
  `unit-x-rag-provenance-traversal.md` (the result fields).
- `src/renderer/pane-graph.ts` (`searchContent`), `src/main/mcp-server.ts`
  (`handleRagTool`), `src/main/retrieval.ts` (`RagQueryFilters`).

## 7. Delimitation

Closes the `rag.query` PARTIAL. Does NOT add the audit panel (PG6 parked) or
streamed results (parked).
