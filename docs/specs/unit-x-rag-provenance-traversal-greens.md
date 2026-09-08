# Unit X — RAG Provenance Traversal — Blind-Test Greens

Fresh-agent green-scenario battery authored from `docs/specs/unit-x-rag-provenance-traversal.md`
§5.1–§5.8 ONLY (no implementation reading). Run against the live modules
(`src/main/retrieval.ts`, `src/main/query-audit.ts`, `src/main/rag-store.ts`,
`src/main/mcp-server.ts`). A FAIL is a doc/spec drift or an un-hardened
regression — never a pass.

## §5.1 Additive store fields

1. **putNode nodeKind stored** — `putNode` a node with `nodeKind: 'fact'`; `getNode` returns it with `nodeKind: 'fact'`. **PASS**
2. **putNode invalid nodeKind** — `putNode` with `nodeKind: 'bogus'` throws `Error('rag putNode: nodeKind required/invalid')`. **PASS**
3. **putEdge edgeType/state stored** — `putEdge` with `edgeType: 'embed'`, `state: 'STALE'`; `getEdge` returns both. **PASS**
4. **putEdge invalid edgeType** — `putEdge` with `edgeType: 'bogus'` throws `Error('rag putEdge: edgeType/state required/invalid')`. **PASS**

## §5.3 Provenance builders

5. **documentIdsForNode happy** — a node in a document (via a `doc-head` edge's `documentIds`) → the document id(s) whose `docNodeIds` include the node, sorted ascending. **PASS**
6. **documentIdsForNode no document** — a node in no document → `[]`. **PASS**
7. **buildCitations dedup** — items with duplicate `(documentId, nodeId)` → deduplicated set, first-appearance order. **PASS**
8. **buildFlatTrace** — `buildFlatTrace('local', 5, 'local')` → `{ mode: 'flat', engine: 'local', topK: 5, source: 'local' }`. **PASS**

## §5.4 walkReferenceGraph

9. **walk happy + resolve-through** — seed `reference` node → ordered `reference→fact` path walked through `RESOLVED` edges, resolving the target `fact` nodes (incl. a fact-to-fact dependency). **PASS**
10. **walk surface-BROKEN/STALE** — a `BROKEN` edge is NOT traversed; it is recorded in the trace and `blockedBy` is populated (no target resolved). **PASS**
11. **walk HopLimitExceeded** — a `reference` chain longer than `maxHops` with no resolved target → throws `Error('walkReferenceGraph: HopLimitExceeded')`. **PASS**
12. **walk CycleDetected** — a `reference→fact→reference` cycle → throws `Error('walkReferenceGraph: CycleDetected')`. **PASS**
13. **walk determinism** — same store + same seeds + same options → identical result (twice). **PASS**

## §5.5 expandParentContext

14. **expandParentContext happy** — top `maxParentContext` items carry a `parent` (owning document title + snippet); items beyond the cap are returned without one. **PASS**
15. **expandParentContext stale** — a child with a `STALE` incoming `reference→fact` edge → `parent.stale === true`. **PASS**

## §5.6 ragQuery

16. **ragQuery flat happy** — a query → `results` (each `{documentId, nodeId, score, snippet, source:'local'}`), `citations`, flat `trace`, and the preserved `ranked`/`context`/`markdown`/`lineMap`/`k`. **PASS**
17. **ragQuery graph happy** — `mode:'graph'` → resolved target `fact` nodes, graph-mode `trace`, `citations` = the deduped resolved targets. **PASS**
18. **ragQuery graph blocked** — a graph traversal resolving no target → `{ results: [], citations: [], trace, blockedBy: [...] }` (a valid state, not an error). **PASS**
19. **ragQuery filters** — `filters.nodeKind` restricts the result set (flat mode: only matching-kind nodes). **PASS**
20. **ragQuery parent-context** — `expand:'parent'` → the top `maxParentContext` items carry a `parent`. **PASS**
21. **ragQuery validation fail** — empty/whitespace `query` → rejects `Error('ragQuery: query must be a non-empty string')`. **PASS**

## §5.7 Query audit log

22. **audit record/list/clear** — `record` appends; `list()` returns a copy newest-first; `clear()` empties. **PASS**
23. **audit bounded** — a log exceeding `maxEntries` drops the OLDEST entry (never throws). **PASS**

## §5.8 MCP tools

24. **rag.query extended** — `handleRagTool(store,'rag.query',{query,...})` returns the extended result with the `store` stamp and records the call in the shared audit log. **PASS**
25. **rag-stream** — returns the degenerate stream `[{ type:'result', result }, { type:'done' }]`. **PASS**
26. **get_query_audit_log** — returns `{ entries: auditLog.list() }`. **PASS**
27. **rag.query empty query** — `handleRagTool(store,'rag.query',{query:''})` throws `Error('rag.query: query must be a non-empty string')`. **PASS**

## Result

27 scenarios — **27 PASS / 0 FAIL**.
