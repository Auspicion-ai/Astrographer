# Unit U-PARITY-C19 — Link Hover-Preview (C19 / G3) — Spec

**Status:** DRAFT 2026-09-11. **Document-only — no code.** Gate: UI-overhaul
umbrella gate; promotes the `docs/pending.md` "Crosslink hover-preview pane"
SPECULATIVE row. Open items: `docs/specs/wave-1-open-decisions.md` W1-Q10.

---

## 1. What the proposal asks

**Hovering a link** shows the linked node's section (or, for a document link, a
summary/opening) **above the link text**; it vanishes **0.5 s** after the pointer
leaves the link or the popup (C19).

---

## 2. Contract (pinned)

- **Trigger:** a provident `on:mouseover`/`on:mouseout` pair on each link node
  (app-graph, MCP-visible). The popup is a provident subtree anchored **above**
  the link.
- **Content (W1-Q10):** for an intra-document crosslink → the linked RAG node's
  rendered section (its subtree); for a document link → a document
  summary/opening (title + first N lines).
- **Dismissal:** a **shell timing mechanic** removes the popup 0.5 s after the
  pointer leaves **either** the link or the popup; entering the popup (re-hover)
  within the window cancels the dismissal. The timer is shell (un-journaled);
  the **content is provident**.
- **Data:** the linked content is resolved via the existing traversal/crosslink
  wiring (`rag.get_document`/the crosslink target) — no new MCP tool.
- **Positioning:** above the link; a viewport-overflow fallback is shell.

---

## 3. States (TestWriter red set)

1. `mouseover` a crosslink → the popup renders the linked node's section.
2. `mouseout` → the popup remains for 0.5 s, then is removed.
3. Entering the popup within 0.5 s cancels the dismissal.
4. A document link → a summary/opening (not the whole document).
5. A dangling link target → no popup / an empty state, never a crash.
6. The popup is app-graph (present in `get_rendered_html` while shown).

## 4. Fail-states

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | link target missing | no popup (no throw) |
| F2 | rapid hover across links | one popup at a time (replaced) |
| F3 | popup would overflow the viewport | shell flips below (best effort) |
| F4 | non-crosslink anchor (`<a href>`) | touched only if it is a crosslink edge; else default behavior |

## 5. Census

- 1 hover-preview provident subtree + 2 handler defs + 1 shell timer helper;
  reuses the crosslink wiring + `rag.get_document`. 0 new dependencies; no new
  MCP tool.

## 6. Cross-references

- `docs/specs/ui-overhaul.md` C19, §4 G3, §7 Q21/Q22.
- `docs/specs/unit-g-crosslink-backlink.md`, `unit-v3-doc-heads-docnav.md`.
- `docs/pending.md` "Crosslink hover-preview pane" (promoted).

## 7. Delimitation

View-only. Does NOT add an MCP tool; the linked content is the existing
materialization.
