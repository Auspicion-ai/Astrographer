// src/main/app-menu.ts — Unit U-MENU-1: the PURE native application-menu
// template builder (docs/specs/unit-u-menu-1-application-menus.md §2).
//
// The Electron `Menu.buildFromTemplate`/`setApplicationMenu` calls + the
// `dialog.showOpenDialog` wiring stay in `main.ts`; this module keeps the
// template construction + the catalog normalisation pure + node-testable
// (no `electron` import). The native menu bar is the AGENTS.md shell carve-out:
// menu actions route to the host over IPC (pane visibility — U-SHELL-8 owns the
// apply/persist) or perform the fs-only Import dialog (U-IMPORT-1 owns the
// directory expansion + handler).
import type { PaneCatalogEntry } from '../shared/types.js'

/** The action seam the template's click handlers route through — injected by
 *  `main.ts`. */
export interface AppMenuActions {
  /** File → Import… — open the multi-file fs dialog (U-IMPORT-1 owns the rest). */
  openImport(): void
  /** File → Import folder… (win/linux only) — open the `['openDirectory']`
   *  dialog for directory bulk upload (U-IMPORT-1, §2.3/§2.8). */
  openImportFolder(): void
  /** View → Panes → `<title>` — route the toggle to the host (`IPC_PANE_VISIBILITY`). */
  togglePane(id: string, enabled: boolean): void
  /** View → `SETTINGS_OPENER_LABEL` (U-4 `R-1`) — the app's OWN overlay opener. The
   *  press routes to main, which broadcasts the one-way `IPC_SETTINGS_OPEN` arrival;
   *  the renderer answers it by firing the shell's own `#settings-toggle` affordance, so
   *  the overlay's state keeps ONE author (`modal-state.ts`). Manual-UI only — never an
   *  MCP tool. THE ITEM CARRIES NO `role`, AND THE OMISSION IS DELIBERATE (`INV-U4`):
   *  Electron's role vocabulary is a closed set of OS-provided actions and none of them
   *  opens THIS app's overlay; a `role` would also REPLACE the authored `click`, so the
   *  item would stop routing to the app at all — and it would enter the template's role
   *  census as a claim that the OS performs an action this app performs. */
  openSettings(): void
}

/** U-4 `R-1` — the View opener's ONE spelling (`ASM-U4-5`): the builder authors the
 *  item's name from it and the unit's row reads this export, so the name is never
 *  re-spelled. The ellipsis is the single character U+2026 (`…`) — the same one the
 *  `Import…` items use, never three dots. */
export const SETTINGS_OPENER_LABEL = 'Security & Settings…'

export interface BuildMenuOptions {
  /** The action callbacks; defaults to no-ops (structure-only templates). */
  actions?: AppMenuActions
  /** The platform branch (F5). Injectable so the darwin shape is testable;
   *  defaults to `process.platform`. */
  platform?: NodeJS.Platform
}

/** The File → Import… dialog filter (pinned by §2.3). */
export const IMPORT_DIALOG_FILTERS = [
  { name: 'Markdown', extensions: ['md', 'markdown'] },
] as const

/** The File → Import… dialog properties (pinned by §2.3). */
export const IMPORT_DIALOG_PROPERTIES = ['openFile', 'openDirectory'] as const

/** The deterministic scope grouping order (app-graph before operator). */
const SCOPE_ORDER: ReadonlyArray<PaneCatalogEntry['scope']> = ['app-graph', 'operator']

/** Normalise an untrusted catalog payload (F1/F4): a non-array → `[]`; a
 *  malformed entry is dropped; a duplicate id is deduped with the FIRST
 *  occurrence winning. Never throws. */
export function normalizePaneCatalog(raw: unknown): PaneCatalogEntry[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: PaneCatalogEntry[] = []
  for (const candidate of raw) {
    if (candidate == null || typeof candidate !== 'object') continue
    const rec = candidate as Record<string, unknown>
    const { id, title, scope } = rec
    if (typeof id !== 'string' || id === '') continue
    if (typeof title !== 'string' || title === '') continue
    if (scope !== 'app-graph' && scope !== 'operator') continue
    if (seen.has(id)) continue
    seen.add(id)
    out.push({ id, title, scope, enabled: rec.enabled === true })
  }
  return out
}

/** Group the catalog by scope (app-graph first) and order it deterministically
 *  (title, then id) so the submenu is stable regardless of push order. */
export function orderPaneCatalog(catalog: PaneCatalogEntry[]): PaneCatalogEntry[] {
  return [...catalog].sort((a, b) => {
    const sa = SCOPE_ORDER.indexOf(a.scope)
    const sb = SCOPE_ORDER.indexOf(b.scope)
    if (sa !== sb) return sa - sb
    const byTitle = a.title.localeCompare(b.title)
    return byTitle !== 0 ? byTitle : a.id.localeCompare(b.id)
  })
}

/** Interpret an Electron `OpenDialogReturnValue`-shaped result (F3/§3.7). A
 *  cancel/dismiss or an empty selection → `null` (a no-op). Otherwise the raw
 *  selection is returned UNCHANGED — the directory → `.md` expansion is
 *  U-IMPORT-1's, not this unit's (§3.6 delegation). */
export function importSelectionFromDialog(result: unknown): string[] | null {
  if (result == null || typeof result !== 'object') return null
  const rec = result as { canceled?: unknown; filePaths?: unknown }
  if (rec.canceled === true) return null
  if (!Array.isArray(rec.filePaths) || rec.filePaths.length === 0) return null
  const paths = rec.filePaths.filter((p): p is string => typeof p === 'string' && p !== '')
  return paths.length > 0 ? paths : null
}

/** Build the Electron-style application-menu template (§2.1/§2.3). Pure: the
 *  caller supplies the action seam + the platform branch. Returns `unknown[]`
 *  so the module carries no `electron` dependency. */
export function buildMenuTemplate(catalog: unknown, options: BuildMenuOptions = {}): unknown[] {
  const actions: AppMenuActions = options.actions ?? {
    openImport: () => {},
    openImportFolder: () => {},
    togglePane: () => {},
    openSettings: () => {},
  }
  const platform = options.platform ?? process.platform
  const panes = orderPaneCatalog(normalizePaneCatalog(catalog))

  const paneItems = panes.map((pane) => ({
    label: pane.title,
    type: 'checkbox',
    checked: pane.enabled,
    click: (menuItem: { checked?: boolean }) => {
      actions.togglePane(pane.id, menuItem?.checked === true)
    },
  }))

  const template: unknown[] = []
  // On darwin the app menu role leads (F5); elsewhere the authored menus lead.
  if (platform === 'darwin') template.push({ role: 'appMenu' })
  template.push({
    label: 'File',
    submenu: [
      { label: 'Import…', click: () => { actions.openImport() } },
      // U-IMPORT-1 §2.3 — win/linux get a SEPARATE `Import folder…` item
      // (the combined file+directory picker is macOS-only, W1-N2). darwin
      // emits exactly ONE `Import…`.
      ...(platform === 'darwin' ? [] : [
        { label: 'Import folder…', click: () => { actions.openImportFolder() } },
      ]),
      { type: 'separator' },
      { label: 'Quit', role: 'quit' },
    ],
  })
  template.push({
    label: 'View',
    submenu: [
      // U-4 `R-1` — the app's OWN overlay opener, the View submenu's item 0. ROLE-LESS by
      // design (`INV-U4`): its own key set is exactly `label` + `click` — no `role`, no
      // `type`, no `accelerator`, no `checked`, no `submenu` (a role would replace this
      // authored click AND claim an OS action this app performs; an accelerator would be an
      // unreadable claim, `ASM-U4-4`).
      { label: SETTINGS_OPENER_LABEL, click: () => { actions.openSettings() } },
      // F2 — no catalog yet ⇒ disabled/empty (never a fabricated list).
      { label: 'Panes', enabled: paneItems.length > 0, submenu: paneItems },
    ],
  })
  return template
}
