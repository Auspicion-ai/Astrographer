# Unit U-MENU-1 — Application Menus (File + View) — Spec

**Status:** DRAFT 2026-09-11. **Document-only — no code.** Gate: the UI-overhaul
umbrella gate `docs/specs/ui-overhaul-review.md` (PROCEED-WITH-AMENDMENTS, A10:
`U-MENU-1` precedes `U-IMPORT-1` + `U-SHELL-8`). This is the per-unit spec
required by AGENTS.md item 9 / umbrella amendment A1 before any TestWriter red
set. Open items live in `docs/specs/wave-1-open-decisions.md` (W1-Q1..Q3).

---

## 1. What the proposal asks

The app has **no application menu** (`Menu`/`setApplicationMenu`/`showOpenDialog`
are absent from `src/main/main.ts`). Add the native menu-bar shell surface that
the overhaul needs:

- **File menu:** `Import…` (opens the file dialog — the U-IMPORT-1 entry point)
  and `Quit`.
- **View menu:** a **Panes** submenu driven by the live pane catalog (the
  U-SHELL-8 visibility surface) + standard view items as needed.

Per AGENTS.md, the **native menu bar is the shell carve-out** — this unit is
shell chrome and hand-written in `main.ts`. Menu **actions** route to the host
(renderer) or perform the fs-only dialog; the UI that results remains
provident-authored.

---

## 2. Contract (pinned)

### 2.1 Native menu (main process)

- `Menu.buildFromTemplate(...)` + `Menu.setApplicationMenu(...)` in `main.ts`.
- Platform-aware: on darwin, the app menu role; elsewhere the menus as authored.
- The menu is rebuilt when the pane catalog changes (§2.2).

### 2.2 The pane-catalog IPC

- A NEW renderer→main channel (`IPC_PANE_CATALOG = 'provident:pane-catalog'`)
  carries `Array<{ id: string; title: string; scope: 'app-graph' | 'operator';
  enabled: boolean }>`.
- The renderer pushes the catalog at boot and on every `PaneRegistry` change
  (`registry.onChanged`), so the View → Panes submenu is **data-driven** (never a
  hard-coded list — W1-Q2 proposed default (a)).
- Main rebuilds the View → Panes submenu from the latest catalog.

### 2.3 Menu actions

- **View → Panes → `<title>`** (a checkbox item) → send
  `IPC_PANE_VISIBILITY = 'provident:pane-visibility'` `{ id, enabled }` to the
  renderer; the renderer applies `registry.setEnabled(id, enabled)` + persists
  `enabledPanes` through the C9 serialized UI-config. (U-SHELL-8 owns the
  enable/disable + persistence; this unit owns the menu item + IPC.)
- **File → Import…** — a **platform-aware** open dialog (W1-N2; U-IMPORT-1 owns the expansion + handler). **Multi-file upload is the DEFAULT on all platforms; Windows/Linux get a SEPARATE directory-bulk-upload item:**
  - **All platforms — `Import files…` (DEFAULT):** `dialog.showOpenDialog({ properties: ['openFile','multiSelections'], filters: [{ name:'Markdown', extensions:['md','markdown'] }] })` — select one or more `.md` files.
  - **macOS:** the default item may additionally allow directories in the SAME dialog (`['openFile','openDirectory','multiSelections']`).
  - **Windows/Linux (additional item) — `Import folder…`:** `dialog.showOpenDialog({ properties: ['openDirectory'] })` for directory **bulk** upload.
  - On confirm, a chosen **file list** passes straight through; a chosen **folder** expands to its `.md` files (U-IMPORT-1); both feed the same `importMarkdownCorpus` handler.
  - `multiSelections` is supported on all platforms — the user may select multiple `.md` files.
- **Quit** → the standard role.

---

## 3. States (TestWriter red set — valid paths)

1. Boot builds the application menu with File (Import…, Quit) + View.
2. The pane catalog pushed at boot renders one View → Panes checkbox per pane,
   grouped/ordered deterministically.
3. A catalog update (a pane registered/enabled) rebuilds the submenu.
4. Toggling a pane menu item sends `IPC_PANE_VISIBILITY` with the new state.
5. `File → Import…` opens the dialog with the `.md` filter.
6. A directory selection is expanded to its `.md` files (delegated to U-IMPORT-1).
7. A cancelled dialog is a no-op (no IPC).

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | a malformed catalog (non-array / bad entries) | ignored → an empty Panes submenu, never a throw |
| F2 | no catalog yet (pre-boot) | the Panes submenu renders disabled/empty |
| F3 | a dialog cancel / dismiss | no-op |
| F4 | a duplicate pane id in the catalog | deduped, first wins |
| F5 | non-darwin vs darwin menu shape | the platform branch is pinned |

---

## 5. Census

- 1 menu module (`src/main/app-menu.ts` or inline in `main.ts`) + 2 IPC channel
  consts + 1 catalog type + 1 preload method (`pushPaneCatalog`).
- No new npm dependency; no `provident-ssr` change.

---

## 6. Cross-references

- `docs/specs/ui-overhaul.md` §2 Table C (File menu + `showOpenDialog` carve-out),
  §4 G10, §5.7 SG3 (no menus), §7 Q10/Q11.
- `docs/specs/unit-u-shell-8-view-menu-pane-visibility.md` (the visibility
  surface), `docs/specs/unit-u-import-1-file-import.md` (the import handler).
- `src/main/main.ts`, `src/main/preload.ts`, `src/renderer/sidebar-panes.ts`
  (`registerPanes` + `registry.onChanged`).
- `docs/specs/wave-1-open-decisions.md` W1-Q1..Q3.

---

## 7. Delimitation

This unit lands the native menus + the pane-catalog IPC + the menu→host action
routing. It does NOT implement the import expansion/handler (U-IMPORT-1) or the
visibility application/persistence (U-SHELL-8) — it provides the menu surface
they attach to.
