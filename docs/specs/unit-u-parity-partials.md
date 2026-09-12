# Unit U-PARITY-PARTIALS — The Remaining PARTIAL Closures — Spec

**Status:** DRAFT 2026-09-11. **Document-only — no code.** Gate: UI-overhaul
umbrella gate. Open items: `docs/specs/wave-1-open-decisions.md` W1-Q11..Q13.

The active PARTIAL set is now **3** (`rag.query` is C18; this unit covers the
rest). This may split per RCA-2 if the closures share no seam.

---

## 1. Items

### 1.1 `code.template.validate` (G6 / template-editor)
The template editor validates on set but has no explicit validate-only control.
Add a **Validate** button that calls `code.template.validate` and renders the
result inline (valid / the error list). W1-Q11 default (a).

### 1.2 `gnosis.document.update` (G5, HC1 — HOLLOW) — **RESOLVED: PARK (W1-Q12)**
The G5 Update button sends a **placeholder empty graph** `{nodes:[],edges:[]}` —
it can blank a document but not edit it. **Ruling: park the edit surface.**
Remove/disable the fake empty-graph Update control so it issues **no fake
update**; keep the real verbs (create/delete/publish/unpublish/archive/list/get).
The real Gnosis document-graph edit (option (b), G1-routed, needing a
local↔Gnosis graph mapping + engine-aware commit) is **deferred** — recorded in
`docs/pending.md` with a revisit condition.

### 1.3 `rag.get_document` scoped-subgraph options (G2/G3) — **RESOLVED: DEFER (W1-Q13)**
The doc-nav selects a document but exposes no scoped-subgraph options. **Ruling:
defer with G3** — the PARTIAL stands until the knowledge-graph inspectors unpark;
recorded in `docs/pending.md`.

---

## 2. Contract (pinned)

- 1.1: a provident Validate control (app-graph, template-editor) + a result
  render; the handler calls the SAME `code.template.validate` application seam.
- 1.2: the G5 Update control must not send an empty graph. Either it delegates
  to the G1 editor, or it is removed pending the Gnosis wiring. NO fake update.
- 1.3: deferred; the PARTIAL remains until G3 unparks.

## 3. States (TestWriter red set)

1. (1.1) A valid template → the Validate button shows "valid".
2. (1.1) An invalid template → the Validate button shows the error(s).
3. (1.2) The G5 Update control no longer issues `{nodes:[],edges:[]}`.
4. (1.2) A Gnosis document edit is reachable (via the editor or the pane).
5. (1.3) documented as deferred (no test).

## 4. Fail-states

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | validate on a null template | guarded, no throw |
| F2 | Gnosis engine absent | the surface is unavailable (D2), never a fake update |
| F3 | group gate off | fail-closed |

## 5. Census

- 1 validate control + 1 handler; the G5 Update change; a deferred row.
  0 new dependencies; no new MCP tool.

## 6. Cross-references

- `docs/specs/ui-overhaul.md` §5.4 (PARTIAL census), §5.7a (HC1), §4 G5/G6.
- `docs/specs/unit-i-template.md`, `unit-a2-document-crud-wiring.md`,
  `unit-gn-mcp-ui-wiring.md`.
- `docs/specs/wave-1-open-decisions.md` W1-Q11..Q13.

## 7. Delimitation

Only the three PARTIAL closures (one deferred). Does NOT reopen the parked G3
knowledge-graph inspectors.
