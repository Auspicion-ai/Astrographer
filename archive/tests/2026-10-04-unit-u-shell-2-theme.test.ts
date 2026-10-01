// tests/unit-u-shell-2-theme.test.ts — Unit U-SHELL-2: appearance tokens +
// tri-state theme (C1).
//
// TestWriter RED set written from
// docs/specs/unit-u-shell-2-appearance-tokens.md §3 (states) + §4 (fail-states)
// BEFORE implementation. RED because:
//   - `src/renderer/theme.ts` does not exist (import fails).
//   - `OperatorSettings` has no `theme` field; the store drops it.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createOperatorSettingsStore } from '../src/main/operator-settings-store.js'
import { resolveTheme, applyThemeToRoot } from '../src/renderer/theme.js'
import { ShimElement } from '../src/shared/dom-shim.js'

describe('U-SHELL-2 — resolveTheme (pure)', () => {
  it('system follows the OS preference', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })
  it('an explicit choice overrides the OS preference', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
  it('an unknown value coerces to the OS-resolved default (never throws)', () => {
    expect(resolveTheme('bogus' as never, true)).toBe('dark')
    expect(resolveTheme(undefined as never, false)).toBe('light')
  })
})

// W1-N1 — the boot application helper. `applyThemeToRoot` is the pure seam the
// renderer's `installTheme()` calls with `document.documentElement`; it takes the
// OS preference as a plain boolean so it is node-testable without a real window.
describe('U-SHELL-2 — applyThemeToRoot (boot application, W1-N1)', () => {
  it('writes the resolved tri-state onto the root dataset', () => {
    const root = new ShimElement('html')
    expect(applyThemeToRoot(root, 'system', true)).toBe('dark')
    expect(root.dataset.theme).toBe('dark')
    expect(applyThemeToRoot(root, 'light', true)).toBe('light')
    expect(root.dataset.theme).toBe('light')
    expect(applyThemeToRoot(root, 'dark', false)).toBe('dark')
    expect(root.dataset.theme).toBe('dark')
  })

  it('follows the injected OS preference for system/unknown (F1)', () => {
    const root = new ShimElement('html')
    expect(applyThemeToRoot(root, 'bogus', true)).toBe('dark')
    expect(root.dataset.theme).toBe('dark')
    expect(applyThemeToRoot(root, undefined, false)).toBe('light')
    expect(root.dataset.theme).toBe('light')
  })

  it('degrades to light and never throws when the OS preference is unavailable (F2)', () => {
    const root = new ShimElement('html')
    expect(applyThemeToRoot(root, 'system', false)).toBe('light')
    expect(root.dataset.theme).toBe('light')
  })

  it('never throws on a frozen/absent root dataset (fail-soft)', () => {
    const frozen = Object.freeze({ dataset: Object.freeze({}) })
    expect(() => applyThemeToRoot(frozen, 'dark', false)).not.toThrow()
    expect(() => applyThemeToRoot({} as never, 'dark', false)).not.toThrow()
  })
})

describe('U-SHELL-2 — the persisted theme setting', () => {
  it('defaults to system (no file)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ushell2-'))
    try {
      const store = createOperatorSettingsStore({ path: join(dir, 's.json') })
      expect(store.get().theme).toBe('system')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('persists an explicit choice and reloads it', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ushell2-'))
    try {
      const path = join(dir, 's.json')
      const store = createOperatorSettingsStore({ path })
      store.set({ theme: 'dark' })
      expect(store.get().theme).toBe('dark')
      expect(JSON.parse(readFileSync(path, 'utf8')).theme).toBe('dark')
      const reloaded = createOperatorSettingsStore({ path })
      expect(reloaded.get().theme).toBe('dark')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('sanitizes a corrupt persisted theme to system (never throws)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ushell2-'))
    try {
      const path = join(dir, 's.json')
      writeFileSync(path, JSON.stringify({ theme: 'neon', topK: 5 }))
      const store = createOperatorSettingsStore({ path })
      expect(store.get().theme).toBe('system')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
