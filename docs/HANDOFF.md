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

| # | Severity | Feature request | Why it mattered | Proposed shape |
| --- | --- | --- | --- | --- |
| **HOST/U1-ENG** | a-big (high) | **Boolean-attribute support in `DomAdapter.setProp`.** `setProp` has NO boolean-attribute special-casing: `checked: false` / `selected: false` routes to the generic `else` branch (`el.setAttribute(attr, bakeValue(val))`), and `bakeValue(false)` → `'false'`, so the boolean attribute is STILL PRESENT. An agent cannot set a boolean-false attribute through the prop path, so a radio `input` or `select`/`option` control cannot render an UNchecked/UNselected state via a `false` prop. | Astrographer's U1 editing-mode Settings control could NOT be a `select`/`radio` because an agent-driven `false` could never uncheck/unselect. The U1 control PIVOTED to a button-toggle (a `button` carries no boolean form state) to avoid the gap, but the engine limitation remains for any consumer that needs boolean-false form state. | A host-side post-render DOM property fix (set `el.checked`/`el.selected`/`el.defaultChecked` from the authored boolean after render) OR an engine boolean-attribute opt-in (a set of boolean-attribute names `setProp` routes to the DOM property, dropping the attribute when the value is `false`). Found in the Unit U1 read-only review (finding 2); reproduction: author a radio/select with `checked: false` → renders checked. See `docs/defects.md` HOST/U1-ENG. |

## SHELVED / CLOSED

| # | Severity | Feature request | Why it mattered | Proposed shape | Shelved reason |
| --- | --- | --- | --- | --- | --- |
| **ENG-GAP-1** | a-big (shelved) | **MarkdownAdapter node-identity preservation.** The `MarkdownAdapter` drops `data:*` props including the opt-in `data-node-id` (D7), so the agent-facing markdown output carries no element→node identity. | Astrographer's RAG mode renders documents via the markdown adapter and passes "relevant document lines" to the agent. Node identity in the markdown would let the agent cite exact nodes. The host-side line→node map (coarse: whole subtree → one RAG object) covered the need. | A markdown-adapter option to preserve node identity (e.g. an HTML-comment or a node-id-preserving markdown variant), mirroring the `renderOptions.nodeIdAttribute` opt-in on the DOM/SSR adapters. | **Shelved 2026-08-26 (user ruling).** (1) Markdown is EXPORT-ONLY — no flow edits markdown output as input, so node identity in the export has no consumer today. (2) Comment IDs are fragile: an external editor could delete/alter them, corrupting the mapping. (3) The future markdown-parsing-to-storage feature will rely on **text-match diffing** instead of node-identity comments (see `docs/pending.md`). Revisit only if a markdown-as-input flow becomes supported. |

## RESOLVED / CLOSED

_(none yet — handoff opened 2026-08-26.)_
