// tests/unit-u-menu-1-application-menus.test.ts — Unit U-MENU-1 (application
// menus). This is the TestWriter RED set for
// `docs/specs/unit-u-menu-1-application-menus.md` §3 (states 1-7) + §4
// (fail-states F1-F5).
//
// It is node-testable by construction: the Electron `Menu`/`dialog` calls stay
// in `main.ts`, and the menu *template* construction is extracted as a PURE
// function in `src/main/app-menu.ts`:
//
//   - `src/main/app-menu.ts` (RED — module not found): `buildMenuTemplate`,
//     `normalizePaneCatalog`, `orderPaneCatalog`, `IMPORT_DIALOG_FILTERS`,
//     `IMPORT_DIALOG_PROPERTIES`, `importSelectionFromDialog`.
//   - `src/shared/types.ts` (EXISTS, but the two channel consts + the
//     `PaneCatalogEntry` type are RED — not yet declared).
//
// The Electron-boundary states (the real `dialog.showOpenDialog` + the real
// `Menu.setApplicationMenu`) are documented in the `.skip` block at the bottom
// — they are the `main.ts` wiring that this unit's pure template feeds.
import { describe, it, expect, vi } from 'vitest'
import {
  buildMenuTemplate,
  normalizePaneCatalog,
  orderPaneCatalog,
  importSelectionFromDialog,
  IMPORT_DIALOG_FILTERS,
  type AppMenuActions,
} from '../src/main/app-menu.js'
import { IPC_PANE_CATALOG, IPC_PANE_VISIBILITY, type PaneCatalogEntry } from '../src/shared/types.js'

// ---- the structural shape of an Electron menu item (the pure template) ------

interface MenuItemShape {
  label?: string
  role?: string
  type?: string
  enabled?: boolean
  checked?: boolean
  submenu?: MenuItemShape[]
  click?: (menuItem: { checked?: boolean }, window?: unknown, event?: unknown) => void
}

function asItems(template: unknown): MenuItemShape[] {
  return template as MenuItemShape[]
}

function topByLabel(template: unknown, label: string): MenuItemShape {
  const item = asItems(template).find((i) => i.label === label)
  if (!item) throw new Error(`top-level menu "${label}" not found`)
  return item
}

function panesSubmenu(template: unknown): MenuItemShape {
  const view = topByLabel(template, 'View')
  const panes = view.submenu?.find((i) => i.label === 'Panes')
  if (!panes) throw new Error('View → Panes not found')
  return panes
}

const PANE_ID = (id: string): PaneCatalogEntry['id'] => id

function pane(
  id: string,
  title: string,
  scope: PaneCatalogEntry['scope'],
  enabled: boolean,
): PaneCatalogEntry {
  return { id: PANE_ID(id), title, scope, enabled }
}

// ---- §5 census: the IPC channel names --------------------------------------

describe('U-MENU-1 · the pane IPC channel consts', () => {
  it('pins the renderer→main catalog channel name', () => {
    expect(IPC_PANE_CATALOG).toBe('provident:pane-catalog')
  })

  it('pins the main→renderer visibility channel name', () => {
    expect(IPC_PANE_VISIBILITY).toBe('provident:pane-visibility')
  })
})

// ---- §3 state 1: boot menu shell (File + View) -----------------------------

describe('U-MENU-1 · §3.1 the application menu shell', () => {
  it('builds File (Import…, Quit) + View', () => {
    const template = buildMenuTemplate([])
    expect(asItems(template).map((i) => i.label)).toEqual(['File', 'View'])
    const file = topByLabel(template, 'File')
    expect(file.submenu?.map((i) => i.label ?? i.type)).toEqual(['Import…', 'separator', 'Quit'])
    expect(file.submenu?.find((i) => i.label === 'Quit')?.role).toBe('quit')
  })

  it('exposes an Import… item the fs-only dialog hangs off', () => {
    const importItem = topByLabel(buildMenuTemplate([]), 'File').submenu?.find(
      (i) => i.label === 'Import…',
    )
    expect(importItem).toBeDefined()
    expect(typeof importItem?.click).toBe('function')
  })
})

// ---- §3 state 2: the data-driven View → Panes submenu ----------------------

describe('U-MENU-1 · §3.2 the View → Panes checkbox submenu', () => {
  const catalog: PaneCatalogEntry[] = [
    pane('settings', 'Settings', 'operator', true),
    pane('search', 'Search', 'app-graph', true),
    pane('doc-nav', 'Documents', 'app-graph', false),
  ]

  it('renders one checkbox per catalog pane', () => {
    const items = panesSubmenu(buildMenuTemplate(catalog)).submenu ?? []
    expect(items).toHaveLength(3)
    expect(items.every((i) => i.type === 'checkbox')).toBe(true)
  })

  it('groups app-graph before operator and orders deterministically by title', () => {
    const items = panesSubmenu(buildMenuTemplate(catalog)).submenu ?? []
    expect(items.map((i) => i.label)).toEqual(['Documents', 'Search', 'Settings'])
  })

  it('mirrors each pane enabled state into the checkbox `checked` flag', () => {
    const items = panesSubmenu(buildMenuTemplate(catalog)).submenu ?? []
    expect(items.map((i) => i.checked)).toEqual([false, true, true])
  })

  it('orders deterministically regardless of the push order', () => {
    const reversed = [...catalog].reverse()
    const items = panesSubmenu(buildMenuTemplate(reversed)).submenu ?? []
    expect(items.map((i) => i.label)).toEqual(['Documents', 'Search', 'Settings'])
  })
})

// ---- §3 state 3: a catalog update rebuilds the submenu ---------------------

describe('U-MENU-1 · §3.3 a catalog update rebuilds the submenu', () => {
  it('reflects a pane registration + its enabled state', () => {
    const before = panesSubmenu(buildMenuTemplate([pane('doc-nav', 'Documents', 'app-graph', true)]))
    expect(before.submenu).toHaveLength(1)

    const after = panesSubmenu(
      buildMenuTemplate([
        pane('doc-nav', 'Documents', 'app-graph', true),
        pane('search', 'Search', 'app-graph', false),
      ]),
    )
    expect(after.submenu?.map((i) => i.label)).toEqual(['Documents', 'Search'])
    expect(after.submenu?.map((i) => i.checked)).toEqual([true, false])
  })
})

// ---- §3 state 4: a toggle routes IPC_PANE_VISIBILITY -----------------------

describe('U-MENU-1 · §3.4 toggling a pane menu item routes the new state', () => {
  it('invokes the toggle action with the pane id + the new checked state', () => {
    const togglePane = vi.fn()
    const actions: AppMenuActions = { openImport: vi.fn(), togglePane }
    const items = panesSubmenu(
      buildMenuTemplate([pane('doc-nav', 'Documents', 'app-graph', false)], { actions }),
    ).submenu
    items?.[0].click?.({ checked: true })
    expect(togglePane).toHaveBeenCalledWith('doc-nav', true)
  })

  it('routes an uncheck with enabled:false', () => {
    const togglePane = vi.fn()
    const actions: AppMenuActions = { openImport: vi.fn(), togglePane }
    const items = panesSubmenu(
      buildMenuTemplate([pane('search', 'Search', 'app-graph', true)], { actions }),
    ).submenu
    items?.[0].click?.({ checked: false })
    expect(togglePane).toHaveBeenCalledWith('search', false)
  })
})

// ---- §3 state 5: File → Import… opens the .md dialog -----------------------

describe('U-MENU-1 · §3.5 the Import… dialog shape', () => {
  it('pins the .md/.markdown filter', () => {
    expect(IMPORT_DIALOG_FILTERS).toEqual([
      { name: 'Markdown', extensions: ['md', 'markdown'] },
    ])
  })

  it('invokes the openImport action when clicked', () => {
    const openImport = vi.fn()
    const actions: AppMenuActions = { openImport, togglePane: vi.fn() }
    const importItem = topByLabel(buildMenuTemplate([], { actions }), 'File').submenu?.find(
      (i) => i.label === 'Import…',
    )
    importItem?.click?.({})
    expect(openImport).toHaveBeenCalledTimes(1)
  })
})

// ---- §3 state 6 / 7 + F3: the selection boundary + cancel no-op ------------

describe('U-MENU-1 · §3.6/§3.7 + F3 the import-selection boundary', () => {
  it('returns the raw selection for the U-IMPORT-1 expansion (delegated)', () => {
    // State 6 — the directory → .md expansion is U-IMPORT-1's; this unit only
    // carries the dialog selection across the boundary unchanged.
    expect(importSelectionFromDialog({ canceled: false, filePaths: ['/tmp/a', '/tmp/dir'] })).toEqual([
      '/tmp/a',
      '/tmp/dir',
    ])
  })

  it('is a no-op on a cancelled dialog', () => {
    expect(importSelectionFromDialog({ canceled: true, filePaths: ['/tmp/a'] })).toBeNull()
  })

  it('is a no-op on an empty selection', () => {
    expect(importSelectionFromDialog({ canceled: false, filePaths: [] })).toBeNull()
  })
})

// ---- §4 F1: a malformed catalog is ignored, never a throw ------------------

describe('U-MENU-1 · F1 a malformed catalog never throws', () => {
  it('normalises a non-array to an empty catalog', () => {
    expect(normalizePaneCatalog('nope')).toEqual([])
    expect(normalizePaneCatalog(null)).toEqual([])
    expect(normalizePaneCatalog(42)).toEqual([])
  })

  it('drops entries missing id/title/scope and renders an empty disabled Panes submenu', () => {
    const malformed: unknown = [
      null,
      42,
      { id: '', title: 'No id', scope: 'app-graph', enabled: true },
      { id: 'a', title: '', scope: 'app-graph', enabled: true },
      { id: 'b', title: 'Bad scope', scope: 'nope', enabled: true },
      { id: 'c', title: 'Ok', scope: 'app-graph', enabled: true },
    ]
    expect(() => buildMenuTemplate(malformed)).not.toThrow()
    expect(normalizePaneCatalog(malformed).map((p) => p.id)).toEqual(['c'])
  })
})

// ---- §4 F2: no catalog yet → disabled/empty Panes --------------------------

describe('U-MENU-1 · F2 pre-boot (no catalog)', () => {
  it('renders the Panes submenu disabled + empty', () => {
    const panes = panesSubmenu(buildMenuTemplate(undefined))
    expect(panes.enabled).toBe(false)
    expect(panes.submenu).toEqual([])
  })

  it('renders the Panes submenu enabled once a catalog exists', () => {
    const panes = panesSubmenu(buildMenuTemplate([pane('doc-nav', 'Documents', 'app-graph', true)]))
    expect(panes.enabled).toBe(true)
  })
})

// ---- §4 F4: a duplicate pane id is deduped (first wins) --------------------

describe('U-MENU-1 · F4 duplicate pane ids', () => {
  it('dedupes with first-wins in normalizePaneCatalog', () => {
    const normalized = normalizePaneCatalog([
      pane('a', 'First', 'app-graph', false),
      pane('a', 'Second', 'operator', true),
    ])
    expect(normalized).toEqual([pane('a', 'First', 'app-graph', false)])
  })

  it('renders exactly one checkbox for a duplicated id', () => {
    const items = panesSubmenu(
      buildMenuTemplate([pane('a', 'First', 'app-graph', false), pane('a', 'Second', 'operator', true)]),
    ).submenu
    expect(items).toHaveLength(1)
    expect(items?.[0].label).toBe('First')
  })

  it('orders the deduped set deterministically', () => {
    const ordered = orderPaneCatalog([
      pane('z', 'Alpha', 'operator', true),
      pane('a', 'Beta', 'app-graph', true),
    ])
    expect(ordered.map((p) => p.id)).toEqual(['a', 'z'])
  })
})

// ---- §4 F5: the darwin vs non-darwin menu shape ----------------------------

describe('U-MENU-1 · F5 the platform branch', () => {
  it('prepends the app-menu role on darwin', () => {
    const darwin = asItems(buildMenuTemplate([], { platform: 'darwin' }))
    expect(darwin[0].role).toBe('appMenu')
    expect(darwin.map((i) => i.label)).toEqual([undefined, 'File', 'View'])
  })

  it('does not add the app-menu role off darwin', () => {
    for (const platform of ['linux', 'win32'] as const) {
      const items = asItems(buildMenuTemplate([], { platform }))
      expect(items.some((i) => i.role === 'appMenu')).toBe(false)
      expect(items.map((i) => i.label)).toEqual(['File', 'View'])
    }
  })
})

// ---- the Electron boundary (not node-testable) -----------------------------
//
// `.skip` mirrors the Unit H/K convention: the real `dialog.showOpenDialog` +
// `Menu.setApplicationMenu` wiring lives in `src/main/main.ts` and is verified
// by code review / the e2e battery.
//
//   - `Menu.buildFromTemplate(buildMenuTemplate(catalog))` + `setApplicationMenu`
//     on boot + on every `IPC_PANE_CATALOG` push.
//   - `File → Import…` → `dialog.showOpenDialog(win, { properties:
//     ['openFile','openDirectory'], filters: IMPORT_DIALOG_FILTERS })`; on a
//     confirm the selection is handed to U-IMPORT-1 (this unit logs/forwards).
//   - `View → Panes → <title>` → `IPC_PANE_VISIBILITY` `{ id, enabled }` to the
//     renderer (U-SHELL-8 owns apply + persistence).
describe.skip('U-MENU-1 · the Electron boundary (main.ts, review/battery)', () => {
  it('sets the application menu from the built template', () => {
    expect(true).toBe(true)
  })
})
