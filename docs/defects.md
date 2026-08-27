# Astrographer — Active Defect / Finding List

Maintained by the document-archival loop (AGENTS.md item 6). Open defects on
top; fixed rows below; superseded rows archived. A defect in the `provident-ssr`
package or the foundation is a HANDOFF item (feature request to the provident
dev agent — see `docs/HANDOFF.md`), never patched here. A host-side finding
(this project's `src/`) is fixed here.

## OPEN

_(none — ENG-GAP-1 shelved 2026-08-26.)_

## SHELVED

| # | Severity | Symptom | Reproduction | Suspected root cause | Proposed fix shape (upstream-owned) | Shelved reason |
| --- | --- | --- | --- | --- | --- | --- |
| **ENG-GAP-1** | a-big (shelved) | The `MarkdownAdapter` drops `data:*` props including the opt-in `data-node-id` (D7), so the agent-facing markdown output carries no element→node identity. | Render a graph with `renderOptions.nodeIdAttribute: true`, then re-emit through a fresh `MarkdownAdapter`; the markdown output has no node identity. | `MarkdownAdapter` (adapters.md §4.7 D7) drops `on:*` and `data:*` props; only `href`/`title`/`src`/`alt` are rendered. | A handoff feature request: a markdown-adapter option to preserve node identity (or a node-id-preserving markdown variant). | **Shelved 2026-08-26 (user ruling).** (1) Markdown is EXPORT-ONLY — no flow edits markdown output as input, so node identity in the export has no consumer today. (2) Comment IDs are fragile: an external editor could delete/alter them, corrupting the mapping. (3) The future markdown-parsing-to-storage feature will rely on **text-match diffing** instead of node-identity comments (see `docs/pending.md`). Revisit only if a markdown-as-input flow becomes supported. |

## FIXED

| # | Severity | Symptom | Reproduction | Root cause | Fix (host-side) |
| --- | --- | --- | --- | --- | --- |
| **HOST-C1** | high | The coarse line→node map was fabricated (`{ startLine: i, endLine: i + 1 }` — a synthetic 1-line span per RAG object), not real markdown line ranges. | `buildTraversal` on a `ul` with 4 `li` doc-children returned a 1-line range for the `ul`. | The assembly step assigned a synthetic span instead of rendering the envelope to markdown and mapping each subtree's line span. | `src/main/traversal.ts` now renders the envelope to markdown (via `renderProducingProcess` + `MarkdownAdapter`) and maps each RAG subtree's real line span (0-based, inclusive start, exclusive end, COARSE — a `ul`+`li` chunk maps to the whole list; a doc-child's lines map to the doc-child). Regression-tested. |
| **HOST-C2** | medium | A parent's back-reference included its doc-children's node ids (`collectSubtreeIds` walked the whole subtree). | `backRefs.get('ul')` = `[ul, li1, li2, li3, li4]`. | `collectSubtreeIds` descended into every child, including doc-child subtree roots. | `collectSubtreeIds` now stops at each doc-child subtree root (a child carrying the stable `rag-<id>` id) — the parent's owned set EXCLUDES its doc-children's nodes (§5.2 rule 6 / §5.9). Regression-tested. |
| **HOST-C3** | medium | `docChildTargets` was scoped globally, not per document — a cross-document shared node that is a doc-child target in doc A but a multi-parent shared node in doc B was silently dropped in B. | `buildTraversal({ documentIds: ['docB'] })` did not materialize a node that is a doc-child target in doc A. | The doc-child exclusion set was built from ALL `doc-child` edges, not the current document's. | The doc-child exclusion is now scoped to the CURRENT document's doc-child edges (a `doc-child` edge belongs to the document whose node set contains its source). Regression-tested. |
| **HOST-C6** | low | Duplicate `documentIds` entries double-materialized content. | `buildTraversal({ documentIds: ['doc', 'doc'] })` emitted every section twice. | `documentIds` was not deduped. | `documentIds` is deduped (order-preserving) at the top of `buildTraversal`. Regression-tested. |
| **HOST-C7** | low | RAG node `props` (e.g. `href`/`src` for `a`/`img`) were not propagated to the subtree root. | An `a` node with `props: { href: '...' }` rendered without the href. | The subtree root's props were built from only `id` + `data-doc-head`. | The RAG node's own `props` are merged into the subtree root's props (`id` and `data-doc-head` take precedence). Regression-tested. |
