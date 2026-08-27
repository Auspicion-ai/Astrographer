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

_(none yet — defects opened 2026-08-26.)_
