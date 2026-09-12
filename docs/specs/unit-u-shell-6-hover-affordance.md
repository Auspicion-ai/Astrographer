# Unit U-SHELL-6 — Hover Affordance (C6) — Spec

**Status:** DRAFT 2026-09-11. **Document-only — no code.** Gate: UI-overhaul
umbrella gate (PROCEED-WITH-AMENDMENTS). Open items:
`docs/specs/wave-1-open-decisions.md` W1-Q8.

---

## 1. What the proposal asks

**Clickables highlight on mouseover to indicate clickable status** (C6) —
document names in the wiki list, result rows, tabs, etc. Today the affordance is
ad-hoc/absent.

---

## 2. Contract (pinned)

- **A shared authoring convention:** every provident node that carries a
  click/select handler authors the token class **`is-clickable`** (via
  `css.classes`).
- **A cssDef rule ships the hover style:** `is-clickable:hover { … }` (a token
  background/cursor) is emitted with the node (provident-ssr cssDef via the
  `styles` op — `adapters.md` §3.3). The pseudo-class itself is CSS; the class
  is graph-authored.
- **Coverage (W1-Q8 default (a)):** doc-nav items, gnosis document/wiki items,
  search result rows, the C14 tab strip items (shell chrome — the strip authors
  the class on its tab bodies), and the C8/undo editor controls. The rule is:
  a node with a click/select handler is clickable.
- **Token-driven:** the hover background uses an appearance token (`--accent`/
  `--hover`) so it themes with C1.

---

## 3. States (TestWriter red set — valid paths)

1. A doc-nav `li` with a select handler carries `is-clickable`.
2. The cssDef hover rule is present in the emitted styles for a pane.
3. A non-interactive node (no handler) does NOT carry `is-clickable`.
4. The hover style uses a token (themeable).
5. The rendered HTML reflects the class (`get_rendered_html`).

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | a clickable node missing the class | a review finding (authoring convention) |
| F2 | a class name collision | `is-clickable` is reserved; documented |
| F3 | the markdown adapter | drops `css:*` (export has no hover) — expected |

---

## 5. Census

- A shared class constant + cssDef rule helper; applied across the clickable
  pane render helpers (`pane-graph.ts`, `gnosis-*`, `template-pane.ts`). 0 new
  dependencies.

---

## 6. Cross-references

- `docs/specs/ui-overhaul.md` C6, §2.1 Table A, §4, §7 Q8.
- `src/renderer/pane-graph.ts`, `src/renderer/gnosis-crud-panes.ts`,
  `src/renderer/index.html` (tokens).
- `docs/specs/wave-1-open-decisions.md` W1-Q8.

---

## 7. Delimitation

Presentation only. It does NOT add handlers to non-interactive nodes (that is
the PG14 doc-nav/item work) — it only uniforms the hover affordance on nodes
that already have handlers.
