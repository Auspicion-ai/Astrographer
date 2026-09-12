# Unit U-PARITY-DOCNAV — PG14 doc-nav dispatchability + the C15 tree consumer (G2) — Spec

**Status:** DRAFT 2026-09-11. **Document-only — no code.** Gate: UI-overhaul
umbrella gate; the C15 slice (U-D1..D7) supplies `documentPath`/`tags`. Open
items: `docs/specs/wave-1-open-decisions.md` W1-Q16.

---

## 1. What the proposal asks

Two G2 items:

1. **PG14 — doc-nav select is not MCP-dispatchable.** The doc-nav `li` nodes
   carry no provident handler, so `provident.dispatch` cannot switch documents
   (the gap noted in `docs/pending.md`).
2. **The C15 tree consumer.** With C15's `documentPath`/`tags` landed, the
   doc-nav should render a **tree** (folders + tag filters) rather than a flat
   list (the U-D8 UI deferred to G2).

---

## 2. Contract (pinned)

- **PG14 (W1-Q16 default (a)):** give each document `li` node an `on:click`
  provident handler (`pane-doc-nav-select`) that calls the SAME
  `bridge.selectDocument` application seam the DOM click uses, so
  `provident.dispatch` and a DOM click are equivalent. (Per the clarified §4
  parity definition, the requirement is the shared application seam — the
  dispatchable handler is the UI ergonomics.)
- **Tree:** render the doc-nav as a **derived tree** from
  `RagDocHeadsPayload.documents[].path` (the C15 `buildDocumentTree`/
  `selectDocumentIdsByPathPrefix` helpers), with folder expand/collapse
  (`on:click`) and tag filters. Empty branches dropped; deterministic sibling
  sort.
- **App-graph (MCP-visible):** folders and leaves are provident nodes;
  `get_rendered_html`/`get_markdown`/`list_targets` see them; folder toggles are
  dispatchable.
- **Selection:** selecting a leaf switches the focused document via the SAME
  seam as the existing select.

---

## 3. States (TestWriter red set)

1. A flat corpus → the tree renders one root level.
2. A nested corpus → folders + leaves; expanding a folder reveals children.
3. A tag filter narrows the tree (via `selectDocumentIdsByPathPrefix`/tags).
4. Clicking a leaf selects the document (shared seam).
5. An agent dispatches a leaf handler → the same selection.
6. Empty corpus → the empty state.
7. Deterministic order (folders first, label sort).

## 4. Fail-states

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | null/malformed docHeads | empty state, no TypeError |
| F2 | a deep path | depth-safe (the C15 `buildDocumentTree` is iterative) |
| F3 | a folder with no documents | dropped (empty branches) |

## 5. Census

- The doc-nav render helper rework + select handlers; reuses C15
  `document-tree.ts`. 0 new dependencies; no new MCP tool.

## 6. Cross-references

- `docs/specs/ui-overhaul.md` §4 G2, §5.1 PG14/SG7, §7 Q12.
- `docs/specs/unit-ud4-doc-heads-tree.md` (`buildDocumentTree`),
  `unit-ud6-query-document-filters.md`, `unit-v3-doc-heads-docnav.md`.
- `src/renderer/pane-graph.ts` (`docNavContent`/`deriveDocNavDocuments`),
  `src/shared/document-tree.ts`.

## 7. Delimitation

G2 only. It consumes the C15 data model (already landed); it does NOT change the
C15 store format or traversal.
