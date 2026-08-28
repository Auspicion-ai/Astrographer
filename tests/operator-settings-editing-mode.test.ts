// tests/operator-settings-editing-mode.test.ts — Unit U1: the PURE store +
// type surface for the `editingMode` operator setting
// (docs/specs/unit-u1-editing-mode-setting.md §1.2 + §2).
//
// This is the TestWriter RED set. The changes do NOT exist yet:
//   - `src/main/operator-settings-store.ts` has NO `editingMode` in
//     `DEFAULT_SETTINGS`/`sanitize`/`set`/`get` (only 3 fields today).
//   - `src/shared/types.ts` has NO `editingMode` on `OperatorSettings` /
//     `OperatorSettingsPatch` and NO `IPC_OPERATOR_SETTINGS_CHANGED` const.
//
// The store is fully node-testable (no Electron). Coercion rule (pinned — used
// identically in `sanitize` AND `set`): ONLY the exact string
// `'contenteditable'` passes through; ANY other value (undefined, null, '',
// 'textarea', junk) coerces to `'textarea'`. The coercion is TOTAL — never
// throws.
//
// The type-level tests fail at `npm run typecheck` (the trio's type leg) — the
// `editingMode` field + the broadcast const are absent. The runtime store tests
// FAIL because `get()`/`set()` return only the 3 legacy fields (editingMode is
// `undefined`).
//
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createOperatorSettingsStore,
  type OperatorSettingsStore,
} from '../src/main/operator-settings-store.js'
import type {
  OperatorSettings,
  OperatorSettingsPatch,
  EditingMode,
} from '../src/shared/types.js'
import { IPC_OPERATOR_SETTINGS_CHANGED } from '../src/shared/types.js'

// ---- temp-file helpers -----------------------------------------------------

const tmpDirs: string[] = []

/** A fresh temp dir + an operator-settings JSON path inside it (the file does
 *  NOT exist yet → the store treats it as the first-run default). */
function tempPath(): string {
  const dir = mkdtempSync(join(tmpdir(), 'optset-u1-'))
  tmpDirs.push(dir)
  return join(dir, 'settings.json')
}

/** Write a persisted settings JSON file at `path` (as a tampered/corrupt /
 *  backward-compatible legacy file would appear on disk). */
function seedFile(path: string, json: unknown): void {
  writeFileSync(path, JSON.stringify(json))
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    try {
      rmSync(dir, { recursive: true, force: true })
    } catch {
      // non-fatal — a temp dir cleanup failure must not fail the suite
    }
  }
})

/** A full 4-field OperatorSettings (the pinned U1 shape). */
const fourField = (editingMode: EditingMode): OperatorSettings => ({
  enabledPanes: ['doc-nav'],
  defaultDocumentId: 'doc-a',
  topK: 7,
  editingMode,
})

// ===========================================================================
// §2.1 HAPPY-PATH STATES (1-12) + §1.2 API rules
// ===========================================================================
describe('operator-settings store — the editingMode default (§2.1 state 1)', () => {
  it('state 1 — a first-run store (no file) returns editingMode "textarea" (the safe default, decision D) + all 4 fields', () => {
    const store = createOperatorSettingsStore({ path: tempPath() })
    const s = store.get()
    expect(s).toEqual({ enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' })
    expect(s.editingMode).toBe('textarea')
  })
})

describe('operator-settings store — sanitize (persisted-file read) (§2.1 states 2-5)', () => {
  it('state 2 — a persisted file with editingMode "contenteditable" is read back as "contenteditable"', () => {
    const path = tempPath()
    seedFile(path, { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'contenteditable' })
    const store = createOperatorSettingsStore({ path })
    expect(store.get().editingMode).toBe('contenteditable')
  })

  it('state 3 — a persisted file with editingMode "textarea" is read back as "textarea"', () => {
    const path = tempPath()
    seedFile(path, { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' })
    const store = createOperatorSettingsStore({ path })
    expect(store.get().editingMode).toBe('textarea')
  })

  it('state 4 — a persisted v1 file WITHOUT the editingMode field defaults to "textarea" (additive / backward-compatible)', () => {
    const path = tempPath()
    seedFile(path, { enabledPanes: ['doc-nav'], defaultDocumentId: null, topK: 5 }) // no editingMode
    const store = createOperatorSettingsStore({ path })
    const s = store.get()
    expect(s.editingMode).toBe('textarea')
    // The other 3 fields survive the backward-compatible sanitize.
    expect(s.enabledPanes).toEqual(['doc-nav'])
    expect(s.topK).toBe(5)
  })

  it('state 5a — an EMPTY persisted file is treated as the first-run default → editingMode "textarea"', () => {
    const path = tempPath()
    seedFile(path, '') // JSON.parse('') throws → the never-throws fallback default
    const store = createOperatorSettingsStore({ path })
    expect(store.get().editingMode).toBe('textarea')
  })

  it('state 5b — a CORRUPT persisted file falls back to the default → editingMode "textarea" (never throws)', () => {
    const path = tempPath()
    seedFile(path, '{not valid json!!') // corrupt → catch → default
    const store = createOperatorSettingsStore({ path })
    expect(() => store.get()).not.toThrow()
    expect(store.get().editingMode).toBe('textarea')
  })
})

describe('operator-settings store — set (§2.1 states 6-10)', () => {
  it('state 6 — set({ editingMode: "contenteditable" }) stores + returns contenteditable and leaves the OTHER 3 fields unchanged', () => {
    const store = createOperatorSettingsStore({ path: tempPath() })
    store.set({ enabledPanes: ['doc-nav'], defaultDocumentId: 'doc-a', topK: 7 }) // baseline
    const result = store.set({ editingMode: 'contenteditable' })
    expect(result.editingMode).toBe('contenteditable')
    expect(result.enabledPanes).toEqual(['doc-nav'])
    expect(result.defaultDocumentId).toBe('doc-a')
    expect(result.topK).toBe(7)
    // The stored value round-trips through get().
    expect(store.get().editingMode).toBe('contenteditable')
  })

  it('state 7 — set({ editingMode: "textarea" }) stores "textarea"', () => {
    const store = createOperatorSettingsStore({ path: tempPath() })
    const result = store.set({ editingMode: 'textarea' })
    expect(result.editingMode).toBe('textarea')
  })

  it('state 8 — set({}) (empty patch) leaves editingMode UNCHANGED', () => {
    const store = createOperatorSettingsStore({ path: tempPath() })
    store.set({ editingMode: 'contenteditable' })
    const result = store.set({})
    expect(result.editingMode).toBe('contenteditable')
  })

  it('state 9 — set({ topK: 7 }) updates topK and leaves editingMode unchanged', () => {
    const store = createOperatorSettingsStore({ path: tempPath() })
    store.set({ editingMode: 'contenteditable' })
    const result = store.set({ topK: 7 })
    expect(result.topK).toBe(7)
    expect(result.editingMode).toBe('contenteditable')
  })

  it('state 10 — set(null) / set(undefined) hits the early return; editingMode unchanged', () => {
    const store = createOperatorSettingsStore({ path: tempPath() })
    store.set({ editingMode: 'contenteditable' })
    expect(store.set(null as unknown as OperatorSettingsPatch).editingMode).toBe('contenteditable')
    expect(store.set(undefined as unknown as OperatorSettingsPatch).editingMode).toBe('contenteditable')
    expect(store.get().editingMode).toBe('contenteditable')
  })
})

describe('operator-settings store — get (§2.1 states 11-12)', () => {
  it('state 11 — get() returns a COPY including editingMode; mutating the result does NOT write through to the store', () => {
    const store = createOperatorSettingsStore({ path: tempPath() })
    store.set({ editingMode: 'contenteditable' })
    const a = store.get()
    a.editingMode = 'textarea' // tamper with the returned object
    a.topK = 999
    const b = store.get()
    expect(b.editingMode).toBe('contenteditable') // the store value is untouched
    expect(b.topK).not.toBe(999)
  })

  it('state 12 — round-trip: set contenteditable → get contenteditable → a PERSISTED reload (new store on the same file) still contenteditable', () => {
    const path = tempPath()
    const store1 = createOperatorSettingsStore({ path })
    store1.set({ editingMode: 'contenteditable', topK: 9 })
    expect(store1.get().editingMode).toBe('contenteditable')
    // A brand-new store reading the SAME persisted file restores the mode.
    const store2 = createOperatorSettingsStore({ path })
    expect(store2.get().editingMode).toBe('contenteditable')
    expect(store2.get().topK).toBe(9)
  })
})

// ===========================================================================
// §2.2 FAIL-STATES (1, 2, 6) — the coercion rule + the partial-patch no-clobber
// ===========================================================================
describe('operator-settings store — coercion fail-states (§2.2 1/2)', () => {
  it('state 1 — a junk editingMode in a PATCH is coerced to "textarea" (never stored as junk)', () => {
    for (const junk of ['foo', 'bogus', '', 0, 42, true, false] as const) {
      const store = createOperatorSettingsStore({ path: tempPath() })
      const result = store.set({ editingMode: junk as unknown as EditingMode })
      expect(result.editingMode).toBe('textarea')
      expect(store.get().editingMode).toBe('textarea')
    }
  })

  it('state 1b — set({ editingMode: null }) / set({ editingMode: "textarea" }) → "textarea"', () => {
    const store = createOperatorSettingsStore({ path: tempPath() })
    expect(store.set({ editingMode: null as unknown as EditingMode }).editingMode).toBe('textarea')
    expect(store.set({ editingMode: 'textarea' }).editingMode).toBe('textarea')
  })

  it('state 2 — a JUNK editingMode in a PERSISTED file is coerced to "textarea" on read (a tampered value never propagates)', () => {
    const path = tempPath()
    seedFile(path, { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'bogus' })
    const store = createOperatorSettingsStore({ path })
    expect(store.get().editingMode).toBe('textarea')
  })
})

describe('operator-settings store — the partial-patch no-clobber (§2.2 state 6)', () => {
  it('state 6 — a mode-toggle patch { editingMode } does NOT clobber enabledPanes/defaultDocumentId/topK', () => {
    const store = createOperatorSettingsStore({ path: tempPath() })
    store.set(fourField('textarea')) // baseline: all 4 fields set
    const result = store.set({ editingMode: 'contenteditable' }) // the control only ever sends editingMode
    expect(result).toEqual({ enabledPanes: ['doc-nav'], defaultDocumentId: 'doc-a', topK: 7, editingMode: 'contenteditable' })
  })
})

// ===========================================================================
// §1.2 TYPE-LEVEL + the broadcast const (fail at `npm run typecheck`; the
// runtime const is undefined → the assertion fails at run)
// ===========================================================================
describe('type-level: OperatorSettings / OperatorSettingsPatch / EditingMode (§2.1 13-15)', () => {
  it('typecheck — OperatorSettings has 4 REQUIRED fields incl editingMode: EditingMode', () => {
    const settings: OperatorSettings = fourField('contenteditable')
    expect(Object.keys(settings).sort()).toEqual(['defaultDocumentId', 'editingMode', 'enabledPanes', 'topK'])
    expect(settings.editingMode).toBe('contenteditable')
  })

  it('typecheck — OperatorSettingsPatch.editingMode? is OPTIONAL and accepts both members', () => {
    const p1: OperatorSettingsPatch = { editingMode: 'textarea' }
    const p2: OperatorSettingsPatch = { editingMode: 'contenteditable' }
    const p3: OperatorSettingsPatch = {} // editingMode omitted is valid
    expect(p1.editingMode).toBe('textarea')
    expect(p2.editingMode).toBe('contenteditable')
    expect(p3.editingMode).toBeUndefined()
  })

  it('typecheck — EditingMode is the same 2-member union "textarea" | "contenteditable" (unchanged from U3)', () => {
    const a: EditingMode = 'textarea'
    const b: EditingMode = 'contenteditable'
    expect(a).toBe('textarea')
    expect(b).toBe('contenteditable')
  })

  it('the IPC_OPERATOR_SETTINGS_CHANGED broadcast const equals "provident:operator-settings-changed" (§2.1 state 15)', () => {
    expect(IPC_OPERATOR_SETTINGS_CHANGED).toBe('provident:operator-settings-changed')
  })
})
