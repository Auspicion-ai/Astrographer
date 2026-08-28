// src/main/security-store.ts — the manual-UI security settings persistence
// store (docs/specs/mcp-endpoint.md §6.4). Loads a SecuritySettings JSON from
// a path, defaults to `read`+`dispatch` ON / `graph`+`code` OFF / token null
// on first run, and persists changes write-through so reload/restart restores
// them. This is the main-process owner of the config the Settings pane reads
// and the MCP server gate reflects.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
import type { SecuritySettings } from '../shared/types.js'

export interface SecurityStoreOptions {
  /** The JSON file the settings persist to (usually in Electron userData). */
  path: string
}

export interface SecurityStore {
  get(): SecuritySettings
  set(patch: { token?: string | null; groups?: string[]; disable?: string[]; maxJournalLength?: number | null }): SecuritySettings
}

/** L3 (adversarial) — derive the live-gate patch from the STORE's FILTERED
 *  result (the diff of the persisted enabled set), NOT from the raw IPC patch.
 *  The store drops unknown/invalid groups; if the live gate consumed the raw
 *  patch it could enable a group the persisted config drops → live/persisted
 *  divergence on restart. main.ts uses this so the live gate stays exactly in
 *  sync with what is persisted. */
export function gatePatchFromStoreResult(
  previousEnabled: string[],
  updated: SecuritySettings,
): { token?: string | null; groups: string[]; disable: string[] } {
  const after = updated.enabled
  const groups = after.filter((g) => !previousEnabled.includes(g))
  const disable = previousEnabled.filter((g) => !after.includes(g))
  // Only forward a token when the store actually set a non-empty one. A
  // null/empty token would make SecurityGate.applyPatch reject the WHOLE patch
  // (including the groups), breaking the live re-gate.
  const token = typeof updated.token === 'string' && updated.token !== '' ? updated.token : undefined
  return { token, groups, disable }
}

// L3 (adversarial) — the store's valid-group set MUST match security.ts's
// ToolGroup union (read/dispatch/graph/code/module/rag/edit). Omitting `rag`/
// `edit` here would make the manual-UI settings pane the only path to enable
// groups, permanently disabling the rag.*/edit.* MCP tools in the running app.
const VALID_GROUPS = new Set(['read', 'dispatch', 'graph', 'code', 'module', 'rag', 'edit'])

function sanitize(input: unknown): SecuritySettings {
  const src = (input ?? {}) as Partial<SecuritySettings>
  const enabled = Array.isArray(src.enabled)
    ? [...new Set(src.enabled.filter((g): g is string => typeof g === 'string' && VALID_GROUPS.has(g)))]
    : ['read', 'dispatch']
  const maxJournalLength = typeof src.maxJournalLength === 'number' && src.maxJournalLength > 0
    ? Math.floor(src.maxJournalLength)
    : undefined
  return { token: typeof src.token === 'string' && src.token !== '' ? src.token : null, enabled, maxJournalLength }
}

/** Create a security settings store backed by `path`. A missing/empty file is
 *  treated as the first-run default; a corrupt file falls back to the default
 *  (never throws — a settings read must not crash the app). */
export function createSecurityStore(opts: SecurityStoreOptions): SecurityStore {
  let current: SecuritySettings
  try {
    if (existsSync(opts.path)) {
      current = sanitize(JSON.parse(readFileSync(opts.path, 'utf8')))
    } else {
      current = { token: null, enabled: ['read', 'dispatch'], maxJournalLength: undefined }
    }
  } catch {
    current = { token: null, enabled: ['read', 'dispatch'], maxJournalLength: undefined }
  }

  function persist(): void {
    try {
      mkdirSync(dirname(opts.path), { recursive: true })
      writeFileSync(opts.path, JSON.stringify(current, null, 2))
    } catch (e) {
      // persist failures are non-fatal (the in-memory config still applies for
      // this process lifetime); never crash the app on a settings write. Log a
      // warning so a SILENT persistence failure (e.g. an unwritable userData
      // dir) is observable instead of resurfacing as "settings didn't save".
      console.error(`[security-store] persist failed (${opts.path}):`, e)
    }
  }

  return {
    get(): SecuritySettings {
      return { token: current.token, enabled: [...current.enabled], maxJournalLength: current.maxJournalLength }
    },
    set(patch: { token?: string | null; groups?: string[]; disable?: string[]; maxJournalLength?: number | null }): SecuritySettings {
      const add = Array.isArray(patch.groups)
        ? [...new Set(patch.groups.filter((g) => VALID_GROUPS.has(g)))]
        : []
      const del = Array.isArray(patch.disable)
        ? [...new Set(patch.disable.filter((g) => VALID_GROUPS.has(g)))]
        : []
      const enabled = [...current.enabled]
      for (const g of add) if (!enabled.includes(g)) enabled.push(g)
      for (const g of del) {
        const i = enabled.indexOf(g)
        if (i !== -1) enabled.splice(i, 1)
      }
      const token = patch.token !== undefined ? (typeof patch.token === 'string' && patch.token !== '' ? patch.token : null) : current.token
      const maxJournalLength = patch.maxJournalLength !== undefined
        ? (typeof patch.maxJournalLength === 'number' && patch.maxJournalLength > 0 ? Math.floor(patch.maxJournalLength) : undefined)
        : current.maxJournalLength
      current = { token, enabled, maxJournalLength }
      persist()
      return this.get()
    },
  } as SecurityStore
}
