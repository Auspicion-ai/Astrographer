# Astrographer — Pending / Parked / Speculative

Maintained by the document-archival loop (AGENTS.md item 6). Three kinds of
rows: (a) UPSTREAM — constraints owned by the `provident-ssr` project that this
project must respect (imported from `../Provident-Electron/docs/` and
`../Preempt-Providence/docs/`); (b) DEFERRED — lower-value gaps parked until a
use case surfaces; (c) SPECULATIVE — future features with their revisit
conditions.

Retired PARKED and SPECULATIVE rows are archived in the gitignored `archive/`
dir and do not ship in a fork (see `docs/FORKER.md` §1/§5).

## UPSTREAM (imported constraints)

| Constraint | Source | What this project does |
| --- | --- | --- |
| NEVER edit `node_modules/provident-ssr/` or `../Preempt-Providence/` source | AGENTS.md (foundation) | All engine gaps recorded in `docs/defects.md` → `docs/HANDOFF.md` (feature requests to the provident dev agent) |
| ALL non-shell UI must be rendered with the provident framework (graph → DomAdapter/SSRFragmentAdapter/MarkdownAdapter), never hand-written HTML/DOM | AGENTS.md (foundation) | The wiki UI (content window, sidebar panes, settings) is authored as provident-ssr data; a UI element outside the graph is a review finding |
| `MarkdownAdapter` drops `css:*` (D5) and `data:*`/`data-node-id` (D7) | upstream adapters.md §4.7 | Formatting that must survive markdown is encoded as element TYPES; the line→node map is host-side (markdown is export-only) |
| `state-slice` mutation targeting a placement zone is HARD-BLOCKED (`placement-target-blocked`, FS-10) | upstream node.md §7.1 | Editing writes back to the RAG store → re-traversal, NOT a zone-targeted state-slice |
| A `contentNodes`-owned content root is family-'in-tree' but DROPPED from compile until attached (P3 §2.4, F-13) | upstream node.md / translate.md | Every RAG subtree root must be placement-attached to render; "owned ⇒ rendered" is false |
| No network egress yet (the `connect-src` CSP allowlist for a declared network is an open tracked item) | foundation pending.md M-r12 | Retrieval is local-first (lexical BM25/tf-idf); vector embeddings deferred behind an `Embedder` interface |

## DEFERRED (lower-value / parked)

| Item | Date | Constraint / revisit condition |
| --- | --- | --- |
| **Vector embeddings** | 2026-08-26 | Deferred behind the interface-swappable `Embedder` (Unit F). Lexical-first (BM25/tf-idf) is the deterministic, offline MVP. Revisit when a local vector model is available or network egress is allowed. |
| **contenteditable rich inline editing** | 2026-08-26 | Rejected for v1 (fights graph-is-authoritative; `DomAdapter.text` clobbers a live editor). Form-control editing (commit-on-blur) is the v1 path. Revisit only if a caret-preserving in-provident editor becomes feasible. |
| **Stored document-flow edges as a separate engine mechanism** | 2026-08-26 | Rejected — doc-flow edges are authoritative in the RAG store; the traversal maps them to family order + a doc-head marker prop. No new engine roles (closed `Role` union). |

## SPECULATIVE (future features)

| Item | Date | Constraint / revisit condition |
| --- | --- | --- |
| **Markdown-vs-source diffing to detect changes** | 2026-08-26 | User decision: markdown is EXPORT-ONLY; agent changes go through direct MCP updates. Diffing markdown vs. generated source to detect changes is a FUTURE SPECULATIVE feature. Revisit when a use case needs change-detection from the export surface. |
| **Remote embedding provider** | 2026-08-26 | Deferred behind the `Embedder` interface. Requires network egress + a CSP allowlist + a new security surface. Revisit when a declared network is allowed. |
| **API access to a remote DB (remote RAG store)** | 2026-08-26 | A `createRemoteRagStore` implementing the SAME `RagStore` interface as `createJsonRagStore` (Unit A §5.3 — the abstraction layer). The document load (traversal) and MCP `rag`/`edit` handlers depend on the `RagStore` interface only, so a remote DB is a drop-in replacement. Requires network egress + auth + a new security surface. Revisit when a declared network is allowed. |
| **RAG object versioning by journal timestamps** | 2026-08-26 | The project journal (Unit A §5.6) already records invertible entries with timestamps. Versioning would reconstruct a RAG object's state at a given journal timestamp (point-in-time snapshot) — e.g. preserve the documentation for a long-term-stable (LTS) build while development continues. Revisit when the project journal lands and a point-in-time reconstruction use case surfaces. |
| **RBAC to selective versions** | 2026-08-26 | Role-based access control to SPECIFIC versions of RAG objects — e.g. test/users have READ-ONLY access to the LTS version, while developers can edit the dev version. Builds on RAG-object versioning (above) + the foundation's security model (tool groups, `security.ts`). Revisit when versioning lands and a multi-role access use case surfaces. |
| **Per-leaf citation from markdown** | 2026-08-26 | The line→node map is COARSE (whole subtree → one RAG object), so per-leaf citation is impossible by design. Revisit if the MarkdownAdapter gains node-identity preservation (the D7 handoff item). |
| **Shared-node edit notification + save prompt** | 2026-08-26 | When a user/agent edits a section (RAG node) that is incorporated into MORE THAN ONE document (a CROSS-DOCUMENT-SHARED node, review §13), NOTIFY them that the node is shared across N documents. When the document would save, PROMPT whether the text should be changed for ALL owners (update all duplicates) or whether SOME should be preserved on a CLONE of the original (fork the node for one document, leaving the others unchanged). Revisit when the editing path (Unit D) lands and the cross-document shared-node model is implemented. |
