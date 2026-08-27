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

const VALID_GROUPS = new Set(['read', 'dispatch', 'graph', 'code', 'module'])

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
    } catch {
      // persist failures are non-fatal (the in-memory config still applies for
      // this process lifetime); never crash the app on a settings write.
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
