// tests/module-store.test.ts — Unit U2: the persisted module registry store
// (docs/specs/module-import-proposal.md §6, M-r8 revised to fail-disabled).
// Mirrors security-store.test.ts (temp dirs via node:fs). The store boots
// FAIL-DISABLED (corrupt/missing file → no-modules + a store-corrupt flag,
// never throws), hash-verifies each record's source on boot (mismatch →
// QUARANTINED, kept but not loaded), and persists write-through.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { createModuleStore, type ModuleStore, type ModuleRecord } from '../src/main/module-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-mod-'))
}

function sha256(src: string): string {
  return createHash('sha256').update(src).digest('hex')
}

const SOURCE = `export const greeting = () => 'hello from the module'`

describe('ModuleStore — persisted module registry (module-import-proposal.md §6, fail-disabled)', () => {
  it('RED — createModuleStore is not exported yet', () => {
    expect(typeof createModuleStore).toBe('function')
  })

  // --- Construction / fail-disabled ---

  it('1. a missing store file is a clean first run: not corrupt, empty loaded, no throw', () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'modules.json') })
      expect(store.status().corrupt).toBe(false)
      expect(store.status().loaded).toEqual([])
      expect(store.list()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. a corrupt store file boots FAIL-DISABLED: corrupt flag set, empty list, never throws', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'modules.json')
      writeFileSync(file, '{ this is not valid json !!!')
      expect(() => createModuleStore({ path: file })).not.toThrow()
      const store: ModuleStore = createModuleStore({ path: file })
      expect(store.status().corrupt).toBe(true)
      expect(store.list()).toEqual([])
      expect(store.status().loaded).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  // --- put / round-trip ---

  it('3. put() computes the hash from source (sha256) and ignores any caller-supplied hash', () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'modules.json') })
      const record = store.put({ name: 'alpha', version: '1.0.0', source: SOURCE, capabilities: { tools: ['module:alpha.ping'] }, hash: 'caller-forged-hash' })
      expect(record.hash).toBe(sha256(SOURCE))
      expect(record.hash).not.toBe('caller-forged-hash')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. put() persists write-through: a fresh store on the same file round-trips name/version/source/hash', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'modules.json')
      const store: ModuleStore = createModuleStore({ path: file })
      store.put({ name: 'beta', version: '2.1.0', source: SOURCE, capabilities: { hooks: ['after-render'] } })
      expect(existsSync(file)).toBe(true)
      const reloaded: ModuleStore = createModuleStore({ path: file })
      const rec = reloaded.get('beta')
      expect(rec).toBeDefined()
      expect(rec!.version).toBe('2.1.0')
      expect(rec!.source).toBe(SOURCE)
      expect(rec!.hash).toBe(sha256(SOURCE))
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. put() then remove() → get returns undefined and the file reflects the removal', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'modules.json')
      const store: ModuleStore = createModuleStore({ path: file })
      store.put({ name: 'gamma', version: '0.9.0', source: SOURCE })
      expect(store.remove('gamma')).toBe(true)
      expect(store.get('gamma')).toBeUndefined()
      const reloaded: ModuleStore = createModuleStore({ path: file })
      expect(reloaded.get('gamma')).toBeUndefined()
      expect(reloaded.status().loaded).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. list() returns the put modules', () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'modules.json') })
      store.put({ name: 'delta', version: '2.0.0', source: SOURCE })
      store.put({ name: 'epsilon', version: '3.0.0', source: 'other source' })
      const names = store.list().map((r) => r.name)
      expect(names).toContain('delta')
      expect(names).toContain('epsilon')
    } finally {
      rmSyncSafe(dir)
    }
  })

  // --- Quarantine (hash-verified source) ---

  it('7. a tampered source (hash not updated) is QUARANTINED on boot, never listed as loaded', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'modules.json')
      const store: ModuleStore = createModuleStore({ path: file })
      store.put({ name: 'zeta', version: '1.0.0', source: SOURCE })
      // Tamper: change a character of the stored source WITHOUT updating hash.
      const onDisk = JSON.parse(readFileSync(file, 'utf8')) as ModuleRecord[]
      const tampered = onDisk.find((r) => r.name === 'zeta')!
      tampered.source = SOURCE.replace('greeting', 'greetingx')
      writeFileSync(file, JSON.stringify(onDisk))
      // Reboot on the tampered file.
      const reloaded: ModuleStore = createModuleStore({ path: file })
      expect(reloaded.status().quarantined).toContain('zeta')
      expect(reloaded.status().loaded).not.toContain('zeta')
      expect(reloaded.get('zeta')!.quarantined).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. an untampered record loads normally and is not quarantined', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'modules.json')
      const store: ModuleStore = createModuleStore({ path: file })
      store.put({ name: 'eta', version: '1.0.0', source: SOURCE })
      const reloaded: ModuleStore = createModuleStore({ path: file })
      expect(reloaded.status().quarantined).toEqual([])
      expect(reloaded.status().loaded).toContain('eta')
      expect(reloaded.get('eta')!.quarantined).toBeFalsy()
    } finally {
      rmSyncSafe(dir)
    }
  })

  // --- Disable ---

  it('9. setDisabled(true) excludes a module from loaded (still in list); setDisabled(false) loads it again', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'modules.json')
      const store: ModuleStore = createModuleStore({ path: file })
      store.put({ name: 'theta', version: '1.0.0', source: SOURCE })
      expect(store.status().loaded).toContain('theta')
      store.setDisabled('theta', true)
      expect(store.status().loaded).not.toContain('theta')
      expect(store.list().map((r) => r.name)).toContain('theta')
      store.setDisabled('theta', false)
      expect(store.status().loaded).toContain('theta')
      // The disabled flag persists through a reload.
      store.setDisabled('theta', true)
      const reloaded: ModuleStore = createModuleStore({ path: file })
      expect(reloaded.status().loaded).not.toContain('theta')
    } finally {
      rmSyncSafe(dir)
    }
  })

  // --- Adversarial hardening (F1 atomic, F2 put validation, F3 empty source) ---

  it('10. put rejects a non-string/empty source, empty name, empty version — never persists a malformed record (F2/F3)', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'modules.json')
      const store: ModuleStore = createModuleStore({ path: file })
      expect(() => store.put({ name: 'a', version: '1', source: '' } as never)).toThrow()
      expect(() => store.put({ name: '', version: '1', source: 'x' })).toThrow()
      expect(() => store.put({ name: 'a', version: '', source: 'x' })).toThrow()
      expect(() => store.put({ name: 'a', version: '1', source: 42 as never })).toThrow()
      expect(store.list()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. an empty source on disk is rejected (not loaded), never quarantined-as-valid (F3)', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'modules.json')
      writeFileSync(file, JSON.stringify([{ name: 'empty', version: '1', source: '', hash: '' }]))
      const store: ModuleStore = createModuleStore({ path: file })
      expect(store.list()).toEqual([])
      expect(store.status().quarantined).not.toContain('empty')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}
