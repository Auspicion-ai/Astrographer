// src/main/operator-settings-store.ts — Unit K: the operator-settings
// persistence store (docs/specs/unit-k-sidebar-panes-host.md §5.4 M9). Loads an
// `OperatorSettings` JSON from a path, defaults to the pinned first-run values
// (no panes enabled / no default document / topK 5), and persists changes
// write-through so reload/restart restores them. This is the main-process owner
// of the config the `settings` pane reads/writes over the operator-settings IPC
// — operator-owned, NEVER an MCP tool (an agent must not change the operator's
// view/retrieval defaults).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
import type { OperatorSettings, OperatorSettingsPatch, EditingMode, ThemeSetting } from '../shared/types.js'
import { coerceLayout, defaultLayout, type LayoutState } from '../renderer/layout-state.js'
import { coerceTabState, defaultTabState, type TabState } from '../renderer/tab-state.js'

export interface OperatorSettingsStoreOptions {
  /** The JSON file the settings persist to (usually in Electron userData). */
  path: string
}

export interface OperatorSettingsStore {
  get(): OperatorSettings
  set(patch: OperatorSettingsPatch): OperatorSettings
}

/** The pinned first-run defaults. A FUNCTION (not a shared const) so every
 *  store owns a fresh `layout` object — a mutation can never leak across
 *  stores via `DEFAULT_SETTINGS`. */
function defaultSettings(): OperatorSettings {
  return {
    enabledPanes: [],
    // U-SHELL-8 §2.6 pin 1 — the additive operator-scope enable set (empty →
    // all operator panes enabled).
    enabledOperatorPanes: [],
    // U-SHELL-8 §2.7 H2 — no visibility write yet (empty lists = defaults).
    panesInitialized: false,
    defaultDocumentId: null,
    topK: 5,
    editingMode: 'contenteditable', // the default edit mode (rich-text contenteditable)
    theme: 'system', // U-SHELL-2 §2.2 — default follows the OS preference
    layout: defaultLayout(), // U-SHELL-1 §2.2 — the C9 layout carve-out
    tabs: defaultTabState(), // U-SHELL-9a §2.5 — the C9 tab-set carve-out
  }
}

/** Unit U1 §1.2 — the pinned coercion rule (used identically in `sanitize` AND
 *  `set`): ONLY the exact string `'textarea'` passes through; ANY other value
 *  (undefined, null, '', 'contenteditable', junk) coerces to `'contenteditable'`
 *  (the default edit mode). TOTAL — never throws for any `src.editingMode` value. */
function coerceEditingMode(value: unknown): EditingMode {
  return value === 'textarea' ? 'textarea' : 'contenteditable'
}

/** Unit U-SHELL-2 §2.2/F1 — the pinned theme coercion rule (used identically in
 *  `sanitize` AND `set`, mirroring `coerceEditingMode`): ONLY the exact strings
 *  `'light'`/`'dark'` pass through; ANY other value (undefined, null, '',
 *  'system', junk) coerces to `'system'` (the OS-following default). TOTAL —
 *  never throws for any `src.theme` value. */
function coerceTheme(value: unknown): ThemeSetting {
  return value === 'light' || value === 'dark' ? value : 'system'
}

function sanitize(input: unknown): OperatorSettings {
  const src = (input ?? {}) as Partial<OperatorSettings>
  const enabledPanes = Array.isArray(src.enabledPanes)
    ? [...new Set(src.enabledPanes.filter((p): p is string => typeof p === 'string' && p !== ''))]
    : []
  const enabledOperatorPanes = Array.isArray(src.enabledOperatorPanes)
    ? [...new Set(src.enabledOperatorPanes.filter((p): p is string => typeof p === 'string' && p !== ''))]
    : []
  // U-SHELL-8 §2.7 H2 — additive, fail-soft: only the literal `true` opts in
  // (a missing/junk value keeps the first-run `false`). A legacy v1 file
  // without the field therefore keeps the all-enabled default.
  const panesInitialized = src.panesInitialized === true
  const defaultDocumentId =
    typeof src.defaultDocumentId === 'string' && src.defaultDocumentId !== '' ? src.defaultDocumentId : null
  const topK = typeof src.topK === 'number' && Number.isFinite(src.topK) && src.topK > 0 ? Math.floor(src.topK) : 5
  const editingMode = coerceEditingMode(src.editingMode)
  const theme = coerceTheme(src.theme)
  const layout = coerceLayout(src.layout)
  // U-SHELL-9a §2.5/§2.9 pin 9 — additive fail-soft tab slice (F1/F6).
  const tabs = coerceTabState(src.tabs)
  return { enabledPanes, enabledOperatorPanes, panesInitialized, defaultDocumentId, topK, editingMode, theme, layout, tabs }
}

/** Create an operator-settings store backed by `path`. A missing/empty file is
 *  treated as the first-run default; a corrupt file falls back to the default
 *  (never throws — a settings read must not crash the app). */
export function createOperatorSettingsStore(opts: OperatorSettingsStoreOptions): OperatorSettingsStore {
  let current: OperatorSettings
  try {
    if (existsSync(opts.path)) {
      current = sanitize(JSON.parse(readFileSync(opts.path, 'utf8')))
    } else {
      current = defaultSettings()
    }
  } catch {
    current = defaultSettings()
  }

  function persist(): void {
    try {
      mkdirSync(dirname(opts.path), { recursive: true })
      writeFileSync(opts.path, JSON.stringify(current, null, 2))
    } catch {
      // persist failures are non-fatal (the in-memory config still applies for
      // this process lifetime); never crash the app on a settings write.
    }
  }

  return {
    get(): OperatorSettings {
      return {
        enabledPanes: [...current.enabledPanes],
        enabledOperatorPanes: [...current.enabledOperatorPanes],
        panesInitialized: current.panesInitialized,
        defaultDocumentId: current.defaultDocumentId,
        topK: current.topK,
        editingMode: current.editingMode,
        theme: current.theme,
        // Deep-copy the layout so a caller can never mutate the store's state.
        layout: coerceLayout(current.layout),
        // U-SHELL-9a §2.5 — deep-copy the tab set (same alias guard).
        tabs: coerceTabState(current.tabs),
      }
    },
    set(patch: OperatorSettingsPatch): OperatorSettings {
      if (patch === null || patch === undefined || typeof patch !== 'object') {
        return this.get()
      }
      const enabledPanes = Array.isArray(patch.enabledPanes)
        ? [...new Set(patch.enabledPanes.filter((p): p is string => typeof p === 'string' && p !== ''))]
        : current.enabledPanes
      const enabledOperatorPanes = Array.isArray(patch.enabledOperatorPanes)
        ? [...new Set(patch.enabledOperatorPanes.filter((p): p is string => typeof p === 'string' && p !== ''))]
        : current.enabledOperatorPanes
      // U-SHELL-8 §2.7 H2 — a patch WITHOUT the flag leaves it unchanged; any
      // supplied value is coerced to the literal boolean (only `true` opts in).
      const panesInitialized =
        patch.panesInitialized !== undefined ? patch.panesInitialized === true : current.panesInitialized
      const defaultDocumentId =
        patch.defaultDocumentId !== undefined
          ? (typeof patch.defaultDocumentId === 'string' && patch.defaultDocumentId !== '' ? patch.defaultDocumentId : null)
          : current.defaultDocumentId
      const topK =
        patch.topK !== undefined
          ? (typeof patch.topK === 'number' && Number.isFinite(patch.topK) && patch.topK > 0 ? Math.floor(patch.topK) : current.topK)
          : current.topK
      const editingMode =
        patch.editingMode !== undefined ? coerceEditingMode(patch.editingMode) : current.editingMode
      const theme = patch.theme !== undefined ? coerceTheme(patch.theme) : current.theme
      // U-SHELL-1 §2.2 — a patch WITHOUT `layout` leaves the stored layout
      // unchanged; a layout patch is fail-soft coerced (never corrupts boot).
      const layout: LayoutState = patch.layout !== undefined ? coerceLayout(patch.layout) : current.layout
      // U-SHELL-9a §2.5 — a patch WITHOUT `tabs` leaves the stored tab set
      // unchanged; a tabs patch is fail-soft coerced (never corrupts boot).
      const tabs: TabState = patch.tabs !== undefined ? coerceTabState(patch.tabs) : current.tabs
      current = { enabledPanes, enabledOperatorPanes, panesInitialized, defaultDocumentId, topK, editingMode, theme, layout, tabs }
      persist()
      return this.get()
    },
  } as OperatorSettingsStore
}
