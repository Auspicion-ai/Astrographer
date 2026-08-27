# Astrographer → Provident Development Agent — Feature-Request Handoff

This is the issue-handoff document (AGENTS.md item 7, adapted): the catalogue
of genuine engine/foundation gaps discovered while building Astrographer (a
hybrid human-readable local wiki + graph RAG on a fork of Provident-Electron).
Each row is a feature-request candidate for the ORIGINAL project
(`provident-ssr` / Provident-Electron). The RAG layer is SPECIFIC to this
project, NOT a core feature of the foundation — RAG-specific gaps are built
here, never handed off. Only genuine engine/foundation gaps become handoff
requests. NEVER patch the engine.

## OPEN handoff items

_(none — ENG-GAP-1 shelved 2026-08-26.)_

## SHELVED / CLOSED

| # | Severity | Feature request | Why it mattered | Proposed shape | Shelved reason |
| --- | --- | --- | --- | --- | --- |
| **ENG-GAP-1** | a-big (shelved) | **MarkdownAdapter node-identity preservation.** The `MarkdownAdapter` drops `data:*` props including the opt-in `data-node-id` (D7), so the agent-facing markdown output carries no element→node identity. | Astrographer's RAG mode renders documents via the markdown adapter and passes "relevant document lines" to the agent. Node identity in the markdown would let the agent cite exact nodes. The host-side line→node map (coarse: whole subtree → one RAG object) covered the need. | A markdown-adapter option to preserve node identity (e.g. an HTML-comment or a node-id-preserving markdown variant), mirroring the `renderOptions.nodeIdAttribute` opt-in on the DOM/SSR adapters. | **Shelved 2026-08-26 (user ruling).** (1) Markdown is EXPORT-ONLY — no flow edits markdown output as input, so node identity in the export has no consumer today. (2) Comment IDs are fragile: an external editor could delete/alter them, corrupting the mapping. (3) The future markdown-parsing-to-storage feature will rely on **text-match diffing** instead of node-identity comments (see `docs/pending.md`). Revisit only if a markdown-as-input flow becomes supported. |

## RESOLVED / CLOSED

_(none yet — handoff opened 2026-08-26.)_
