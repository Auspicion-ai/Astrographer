// src/main/module-store.ts — the persisted module-registry store for the
// `module.*` extension system (docs/specs/module-import-proposal.md §6, M-r8).
//
// Mirrors the SecurityStore shape (read-on-boot / write-through JSON) BUT with
// the module-store differences that are the point of this unit:
//   - FAIL-DISABLED (not fail-closed, not default-open): a corrupt/missing file
//     boots to NO modules + a `corrupt` status flag — never throws, never hard-
//     fails the app. Unlike security-store.ts (which defaults on corrupt), a
//     corrupt module store does NOT silently boot a partial registry.
//   - HASH-VERIFIED source: each record stores `source` + a SHA-256 `hash`. The
//     hash is ALWAYS derived from source at put() (never trusted from the
//     caller), and every record is re-verified on boot.
//   - QUARANTINE: a record whose stored hash does not match its source is kept
//     in the store but marked `quarantined` and EXCLUDED from `status().loaded`
//     (never reported as active). An operator recovery action (reinstall/clear)
//     is the clear path, surfaced via `status().quarantined`.
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs'
import { dirname } from 'node:path'
import { createHash } from 'node:crypto'

export interface ModuleRecord {
  name: string
  version: string
  source: string
  /** SHA-256 of `source` — ALWAYS derived at put(), never trusted from input. */
  hash: string
  capabilities?: { tools?: string[]; hooks?: string[]; transforms?: string[] }
  installedAt?: string
  /** U2 — the store persists the flag; enable/disable toggles it. */
  disabled?: boolean
  /** Set at boot if hash verification fails. NOT loaded/active. */
  quarantined?: boolean
}

export interface ModuleStoreStatus {
  /** The store file was corrupt/missing → NO modules loaded (fail-disabled). */
  corrupt: boolean
  /** Names quarantined on this boot (hash verification failed). */
  quarantined: string[]
  /** Names active (not disabled, not quarantined). */
  loaded: string[]
}

export interface ModuleStore {
  get(name: string): ModuleRecord | undefined
  list(): ModuleRecord[]
  status(): ModuleStoreStatus
  /** Install/update a module. Computes `hash` from `source` (never trusts input). */
  put(record: Omit<ModuleRecord, 'hash'> & { hash?: string }): ModuleRecord
  /** Remove a module. Returns true if it existed. */
  remove(name: string): boolean
  /** Toggle a module's disabled flag (disabled modules are NOT loaded). */
  setDisabled(name: string, disabled: boolean): void
}

export interface ModuleStoreOptions {
  /** The JSON file the module registry persists to (usually in userData). */
  path: string
}

function sha256(source: string): string {
  return createHash('sha256').update(source, 'utf8').digest('hex')
}

function sanitizeRecord(input: unknown): ModuleRecord | null {
  if (input === null || typeof input !== 'object') return null
  const r = input as Partial<ModuleRecord>
  if (typeof r.name !== 'string' || r.name === '') return null
  if (typeof r.version !== 'string' || r.version === '') return null
  if (typeof r.source !== 'string' || r.source === '') return null
  // The authoritative hash is ALWAYS derived from source — the stored hash is
  // advisory (for boot verification); if absent, derive now.
  const hash = typeof r.hash === 'string' && r.hash !== '' ? r.hash : sha256(r.source)
  return {
    name: r.name,
    version: r.version,
    source: r.source,
    hash,
    capabilities: typeof r.capabilities === 'object' && r.capabilities !== null
      ? {
          ...(Array.isArray(r.capabilities.tools) ? { tools: [...r.capabilities.tools] } : {}),
          ...(Array.isArray(r.capabilities.hooks) ? { hooks: [...r.capabilities.hooks] } : {}),
          ...(Array.isArray(r.capabilities.transforms) ? { transforms: [...r.capabilities.transforms] } : {}),
        }
      : undefined,
    installedAt: typeof r.installedAt === 'string' ? r.installedAt : undefined,
    disabled: r.disabled === true,
  }
}

/** Load + sanitize the persisted registry, marking hash-failures quarantined.
 *  A corrupt file → empty registry + corrupt flag (fail-disabled, never throw). */
function load(path: string): { records: Map<string, ModuleRecord>; corrupt: boolean; quarantined: string[] } {
  const records = new Map<string, ModuleRecord>()
  const quarantined: string[] = []
  let corrupt = false
  if (existsSync(path)) {
    let parsed: unknown
    try {
      parsed = JSON.parse(readFileSync(path, 'utf8'))
    } catch {
      corrupt = true
      return { records, corrupt, quarantined }
    }
    const arr = Array.isArray(parsed) ? parsed : null
    if (!arr) {
      corrupt = true
      return { records, corrupt, quarantined }
    }
    for (const raw of arr) {
      const rec = sanitizeRecord(raw)
      if (!rec) continue
      // Boot re-verification: a stored hash that mismatches the derived source
      // hash ⇒ QUARANTINED (kept, but never reported loaded).
      if (rec.hash !== sha256(rec.source)) {
        rec.quarantined = true
        quarantined.push(rec.name)
      }
      records.set(rec.name, rec)
    }
  }
  return { records, corrupt, quarantined }
}

export function createModuleStore(opts: ModuleStoreOptions): ModuleStore {
  const loaded = load(opts.path)
  const records = loaded.records
  const quarantinedAtBoot = new Set(loaded.quarantined)

  function persist(): void {
    try {
      mkdirSync(dirname(opts.path), { recursive: true })
      const payload = [...records.values()]
      // F1 (adversarial) — ATOMIC write: temp + rename so a crash mid-write never
      // leaves a truncated/partial registry that boots fail-disabled (data loss).
      const tmp = `${opts.path}.tmp`
      writeFileSync(tmp, JSON.stringify(payload, null, 2))
      renameSync(tmp, opts.path)
    } catch {
      // a persist failure is non-fatal for the process lifetime; never crash.
    }
  }

  return {
    get(name: string): ModuleRecord | undefined {
      const r = records.get(name)
      return r ? { ...r, capabilities: r.capabilities ? { ...r.capabilities } : undefined } : undefined
    },
    list(): ModuleRecord[] {
      return [...records.values()].map((r) => ({ ...r, capabilities: r.capabilities ? { ...r.capabilities } : undefined }))
    },
    status(): ModuleStoreStatus {
      const loadedNames: string[] = []
      const quarantinedNames: string[] = []
      for (const r of records.values()) {
        if (r.quarantined) {
          quarantinedNames.push(r.name)
        } else if (!r.disabled) {
          loadedNames.push(r.name)
        }
      }
      return { corrupt: loaded.corrupt, quarantined: quarantinedNames, loaded: loadedNames }
    },
    put(record: ModuleRecord): ModuleRecord {
      // F2 (adversarial) — put() validates its input like the disk path: reject
      // a non-string/empty source, empty name/version (never crash, never persist
      // a malformed record). F3 — an empty source is meaningless (new Function('')
      // is a no-op); reject it.
      if (record === null || typeof record !== 'object') throw new Error('module put: record must be an object')
      if (typeof record.name !== 'string' || record.name === '') throw new Error('module put: name required')
      if (typeof record.version !== 'string' || record.version === '') throw new Error('module put: version required')
      if (typeof record.source !== 'string' || record.source === '') throw new Error('module put: source required')
      const hash = sha256(record.source)
      const rec: ModuleRecord = {
        name: record.name,
        version: record.version,
        source: record.source,
        hash,
        capabilities: record.capabilities
          ? {
              ...(Array.isArray(record.capabilities.tools) ? { tools: [...record.capabilities.tools] } : {}),
              ...(Array.isArray(record.capabilities.hooks) ? { hooks: [...record.capabilities.hooks] } : {}),
              ...(Array.isArray(record.capabilities.transforms) ? { transforms: [...record.capabilities.transforms] } : {}),
            }
          : undefined,
        installedAt: record.installedAt ?? new Date().toISOString(),
        disabled: record.disabled === true,
        quarantined: false,
      }
      records.set(rec.name, rec)
      if (quarantinedAtBoot.has(rec.name)) quarantinedAtBoot.delete(rec.name)
      persist()
      return { ...rec, capabilities: rec.capabilities ? { ...rec.capabilities } : undefined }
    },
    remove(name: string): boolean {
      const existed = records.delete(name)
      if (existed) persist()
      return existed
    },
    setDisabled(name: string, disabled: boolean): void {
      const r = records.get(name)
      if (!r) return
      r.disabled = disabled
      persist()
    },
  } as ModuleStore
}
