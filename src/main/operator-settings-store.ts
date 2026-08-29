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
import type { OperatorSettings, OperatorSettingsPatch, EditingMode } from '../shared/types.js'

export interface OperatorSettingsStoreOptions {
  /** The JSON file the settings persist to (usually in Electron userData). */
  path: string
}

export interface OperatorSettingsStore {
  get(): OperatorSettings
  set(patch: OperatorSettingsPatch): OperatorSettings
}

const DEFAULT_SETTINGS: OperatorSettings = {
  enabledPanes: [],
  defaultDocumentId: null,
  topK: 5,
  editingMode: 'contenteditable', // the default edit mode (rich-text contenteditable)
}

/** Unit U1 §1.2 — the pinned coercion rule (used identically in `sanitize` AND
 *  `set`): ONLY the exact string `'textarea'` passes through; ANY other value
 *  (undefined, null, '', 'contenteditable', junk) coerces to `'contenteditable'`
 *  (the default edit mode). TOTAL — never throws for any `src.editingMode` value. */
function coerceEditingMode(value: unknown): EditingMode {
  return value === 'textarea' ? 'textarea' : 'contenteditable'
}

function sanitize(input: unknown): OperatorSettings {
  const src = (input ?? {}) as Partial<OperatorSettings>
  const enabledPanes = Array.isArray(src.enabledPanes)
    ? [...new Set(src.enabledPanes.filter((p): p is string => typeof p === 'string' && p !== ''))]
    : []
  const defaultDocumentId =
    typeof src.defaultDocumentId === 'string' && src.defaultDocumentId !== '' ? src.defaultDocumentId : null
  const topK = typeof src.topK === 'number' && Number.isFinite(src.topK) && src.topK > 0 ? Math.floor(src.topK) : 5
  const editingMode = coerceEditingMode(src.editingMode)
  return { enabledPanes, defaultDocumentId, topK, editingMode }
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
      current = { ...DEFAULT_SETTINGS }
    }
  } catch {
    current = { ...DEFAULT_SETTINGS }
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
        defaultDocumentId: current.defaultDocumentId,
        topK: current.topK,
        editingMode: current.editingMode,
      }
    },
    set(patch: OperatorSettingsPatch): OperatorSettings {
      if (patch === null || patch === undefined || typeof patch !== 'object') {
        return this.get()
      }
      const enabledPanes = Array.isArray(patch.enabledPanes)
        ? [...new Set(patch.enabledPanes.filter((p): p is string => typeof p === 'string' && p !== ''))]
        : current.enabledPanes
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
      current = { enabledPanes, defaultDocumentId, topK, editingMode }
      persist()
      return this.get()
    },
  } as OperatorSettingsStore
}
