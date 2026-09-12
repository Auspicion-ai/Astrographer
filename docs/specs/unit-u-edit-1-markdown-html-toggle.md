# Unit U-EDIT-1 — Markdown / HTML Editing Toggle (C8) — Spec

**Status:** DRAFT 2026-09-11. **Document-only — no code.** Gates: UI-overhaul
umbrella gate (PROCEED-WITH-AMENDMENTS); the existing
`docs/specs/editing-mode-toggle-review.md` (the `editingMode` origin) may serve
as the feature gate. Open items: `docs/specs/wave-1-open-decisions.md`
W1-Q6/Q7.

---

## 1. What the proposal asks

A **markdown/html editing toggle** in the document editor (C8). The engine
already supports both editing representations behind `editingMode`
(`'textarea'` = markdown source, `'contenteditable'` = rich HTML; Unit U1/U4),
but there is no user control in the editor — the setting is operator-only.

Deliver an **editor-toolbar toggle** (app-graph, MCP-visible) that switches the
editing representation and drives the existing `editingMode` seam + re-derive.

---

## 2. Contract (pinned)

- **Semantics (W1-Q6 default (a)):** `Markdown` ↔ `editingMode='textarea'`;
  `HTML` ↔ `editingMode='contenteditable'`. The toggle is an **editing**
  control, not an export/view toggle.
- **Placement (W1-Q7 default (a)):** the central-stage editor toolbar
  (app-graph). It remains a provident node with an `on:click` handler, so
  `provident.dispatch` reaches it.
- **Effect:** the handler flips `editingMode` and triggers the `'operator'`
  rebuild kind (U-STATE-1b) so the app graph re-applies the mode. It persists
  via the existing `editingMode` operator setting (no new store).
- **Reflection:** the control reflects the current mode (`data-mode`/label), so
  an agent/user sees the active representation.
- **Parity:** no new MCP tool (spec §6) — `editingMode` selects an existing edit
  path; the edits remain `edit.*` / `IPC_EDIT_*`.

---

## 3. States (TestWriter red set — valid paths)

1. Boot with `editingMode='contenteditable'` → the toggle reflects HTML.
2. Click the toggle → `editingMode` flips to `textarea`, persisted, and the
   document re-renders as the markdown textarea.
3. Click again → back to `contenteditable`.
4. The control is an app-graph node: `list_targets` includes it and
   `provident.dispatch` on it flips the mode.
5. The operator setting and the editor control stay in sync (one source).

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | missing/invalid `editingMode` | coerced (`coerceEditingMode`) — never throws |
| F2 | toggle while an edit is dirty | queued via the dirty-edit guard (content-safe) |
| F3 | a node not eligible for contenteditable | the mode still flips; that node renders read-only per `isRichEditableRoot` |
| F4 | the operator sets the mode elsewhere | the control reflects the broadcast |

---

## 5. Census

- 1 editor-toolbar control (app-graph authoring) + 1 handler def + reuse of the
  existing `editingMode` seam. 0 new dependencies; no new MCP tool.

---

## 6. Cross-references

- `docs/specs/ui-overhaul.md` C8, §4 G1, §6 (no new tool), §7 Q4.
- `docs/specs/editing-mode-toggle-review.md`, `unit-u1-editing-mode-setting.md`,
  `unit-u4-contenteditable-editor.md`.
- `src/renderer/sidebar-panes.ts` (`applyEditingMode`), `src/main/edit-ops.ts`,
  `src/main/operator-settings-store.ts`.

---

## 7. Delimitation

This unit adds the editor control + wiring only. It does NOT change the
`editingMode` semantics, the textarea/contenteditable implementations, or the
operator setting's storage.
