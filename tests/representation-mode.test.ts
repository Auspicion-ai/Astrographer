// tests/representation-mode.test.ts — REBUILT suite (the `C9 U-EDIT-1` rebuild of
// the archived `editing-mode-broadcast-host` / `operator-settings-editing-mode` /
// `unit-u-edit-1-markdown-html-toggle` inputs).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md:
//   - §2.3 markdown mode is a MODE of the SAME surface, never a second control:
//     the same single `contenteditable` root with its representation switched;
//     the subtree is the markdown data AS PLAIN TEXT with no HTML formatting
//     output; monospace is a painted assertion (live battery, §8.3 item 4); no
//     `<textarea>`/`<input>` form control anywhere in the stage.
//   - §2.5 the removed `editingMode: 'textarea' | 'contenteditable'` field, its
//     `settingsContent` button-toggle and its broadcast path are REMOVED; the
//     successor is carried by the `OperatorSettings` (`DECIDED: UI-CONFIG-CARRIER`)
//     as a NEW field with a NEW NAME and a two-member union `'html' | 'markdown'`
//     — the removed token is not reused. The SURVIVING clause is the
//     mode-broadcast contract (a mode change writes the operator store, main
//     broadcasts `operator-settings-changed` with the store's result as the
//     authoritative payload, and a FRESH re-derive follows).
//   - §5 item 5 / `FS20`: a stale persisted `editingMode` from a previous session
//     must be IGNORED, not trusted — the sanitizer drops it and the successor
//     field defaults; a boot that restores `'textarea'` behaviour from the stale
//     key is `FS20`.
//   - §6.3 shape R-B: the toolbar's mode literal is repointed to the
//     REPRESENTATION mode; the old label semantics are NOT preserved under a new
//     name.
//
// States enumerated (the state machine this file covers):
//   S1  a first-run store (no file)
//   S2  a persisted store with the successor mode = 'markdown'
//   S3  a persisted store with the successor mode = 'html'
//   S4  a persisted LEGACY file carrying the removed `editingMode` key
//   S5  a persisted file with a junk successor value
//   S6  a corrupt / empty persisted file
//   S7  the in-memory settings patch path (set)
//   S8  the toolbar's authored mode literal (the R-B repoint)
// Fail-states covered: `FS20` (a stale persisted `editingMode` restoring the
//   removed behaviour), `FS22` (a markdown-mode surface rendering HTML
//   formatting — asserted at the authored/graph level here; the painted half is
//   the live battery's), and the removed-field census.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as paneGraph from '../src/renderer/pane-graph.js'
import { createOperatorSettingsStore } from '../src/main/operator-settings-store.js'
import type { OperatorSettings } from '../src/shared/types.js'

// ---------------------------------------------------------------------------
// harness
// ---------------------------------------------------------------------------
/**
 * The successor representation mode: a NEW name (§2.5) carrying a two-member
 * REPRESENTATION union. The spec pins the union and the non-reuse of the removed
 * token; this suite pins the carrier's field name so the successor is nameable
 * by the DOM census, the toolbar and the settings pane alike.
 */
type RepresentationMode = 'html' | 'markdown'
const REPRESENTATION_MODES: RepresentationMode[] = ['html', 'markdown']
/** The successor field's pinned name on the `OperatorSettings` carrier. */
const MODE_FIELD = 'representationMode'
/** The REMOVED field + type names (§2.5, §5 item 5). */
const REMOVED_FIELD = 'editingMode'
const REMOVED_TYPE = 'EditingMode'

function settingsPath(): string {
  return join(mkdtempSync(join(tmpdir(), 'provident-u-edit-1-mode-')), 'operator-settings.json')
}

function writeSettings(path: string, body: unknown): void {
  writeFileSync(path, JSON.stringify(body), 'utf8')
}

/** The mode the store reports, whether the field exists or not. */
function modeOf(settings: unknown): unknown {
  return (settings as Record<string, unknown>)[MODE_FIELD]
}

// ===========================================================================
// §2.5 — the successor mode field on the OperatorSettings carrier
// ===========================================================================
describe('§2.5 — the representation mode is a NEW OperatorSettings field carrying html|markdown', () => {
  it('S1 — a first-run store (no file) reports the successor mode', () => {
    const store = createOperatorSettingsStore({ path: settingsPath() })
    const settings = store.get()
    expect(modeOf(settings)).toBeDefined()
  })

  it('S1 — the successor mode defaults to the html representation', () => {
    const store = createOperatorSettingsStore({ path: settingsPath() })
    expect(modeOf(store.get())).toBe('html')
  })

  it('S1 — the successor mode is a MEMBER of the two-member representation union (never a third value)', () => {
    const store = createOperatorSettingsStore({ path: settingsPath() })
    expect(REPRESENTATION_MODES).toContain(modeOf(store.get()) as RepresentationMode)
    expect(REPRESENTATION_MODES).toHaveLength(2)
  })

  it('S2 — a persisted markdown representation is read back verbatim', () => {
    const path = settingsPath()
    writeSettings(path, { [MODE_FIELD]: 'markdown' })
    expect(modeOf(createOperatorSettingsStore({ path }).get())).toBe('markdown')
  })

  it('S3 — a persisted html representation is read back verbatim', () => {
    const path = settingsPath()
    writeSettings(path, { [MODE_FIELD]: 'html' })
    expect(modeOf(createOperatorSettingsStore({ path }).get())).toBe('html')
  })

  it('S5 — a junk/unions-external successor value coerces to the html default (TOTAL, never a throw)', () => {
    const path = settingsPath()
    writeSettings(path, { [MODE_FIELD]: 'textarea' })
    expect(modeOf(createOperatorSettingsStore({ path }).get())).toBe('html')
  })

  it('S6 — an empty persisted file falls back to the first-run default', () => {
    const path = settingsPath()
    writeFileSync(path, '', 'utf8')
    expect(modeOf(createOperatorSettingsStore({ path }).get())).toBe('html')
  })

  it('S6 — a corrupt persisted file falls back to the first-run default (never throws)', () => {
    const path = settingsPath()
    writeFileSync(path, '{ not json', 'utf8')
    expect(modeOf(createOperatorSettingsStore({ path }).get())).toBe('html')
  })

  it('S7 — set() writes the representation mode and returns it from the store', () => {
    const store = createOperatorSettingsStore({ path: settingsPath() })
    store.set({ [MODE_FIELD]: 'markdown' } as never)
    expect(modeOf(store.get())).toBe('markdown')
  })

  it('S7 — set() with a junk representation value coerces to the html default', () => {
    const store = createOperatorSettingsStore({ path: settingsPath() })
    store.set({ [MODE_FIELD]: 'contenteditable' } as never)
    expect(modeOf(store.get())).toBe('html')
  })

  it('S7 — a set() with no representation key leaves the current representation unchanged', () => {
    const store = createOperatorSettingsStore({ path: settingsPath() })
    store.set({ [MODE_FIELD]: 'markdown' } as never)
    store.set({ topK: 9 } as never)
    expect(modeOf(store.get())).toBe('markdown')
  })

  it('S2 — the representation mode round-trips through the persisted file (the UI-config carrier)', () => {
    const path = settingsPath()
    createOperatorSettingsStore({ path }).set({ [MODE_FIELD]: 'markdown' } as never)
    expect(modeOf(createOperatorSettingsStore({ path }).get())).toBe('markdown')
  })
})

// ===========================================================================
// §2.5 / §5 item 5 / FS20 — the removed editing-control field is GONE
// ===========================================================================
describe('§5 item 5 / FS20 — the removed editing-control field is dropped, never trusted', () => {
  it('S1/S4 — the returned settings carry NO editingMode key (the removed field is not a live token)', () => {
    const store = createOperatorSettingsStore({ path: settingsPath() })
    expect(REMOVED_FIELD in (store.get() as unknown as Record<string, unknown>)).toBe(false)
  })

  it('FS20 — a persisted legacy editingMode:"textarea" does NOT restore the removed behaviour', () => {
    const path = settingsPath()
    writeSettings(path, { [REMOVED_FIELD]: 'textarea', [MODE_FIELD]: 'html' })
    const settings = createOperatorSettingsStore({ path }).get()
    expect(REMOVED_FIELD in (settings as unknown as Record<string, unknown>)).toBe(false)
    expect(modeOf(settings)).toBe('html')
  })

  it('FS20 — a persisted legacy editingMode:"contenteditable" is likewise dropped', () => {
    const path = settingsPath()
    writeSettings(path, { [REMOVED_FIELD]: 'contenteditable', [MODE_FIELD]: 'markdown' })
    const settings = createOperatorSettingsStore({ path }).get()
    expect(REMOVED_FIELD in (settings as unknown as Record<string, unknown>)).toBe(false)
    expect(modeOf(settings)).toBe('markdown')
  })

  it('FS20 — set({ editingMode }) cannot re-introduce the removed key', () => {
    const store = createOperatorSettingsStore({ path: settingsPath() })
    store.set({ [REMOVED_FIELD]: 'textarea' } as never)
    expect(REMOVED_FIELD in (store.get() as unknown as Record<string, unknown>)).toBe(false)
  })

  it('FS20 — the removed editing-control patch key does not change the successor representation', () => {
    const store = createOperatorSettingsStore({ path: settingsPath() })
    store.set({ [REMOVED_FIELD]: 'textarea' } as never)
    expect(modeOf(store.get())).toBe('html')
  })

  it('FS20 — the removed type + field names are absent from the settings surface module exports', () => {
    const names = Object.keys(paneGraph)
    expect(names).not.toContain(REMOVED_TYPE)
    expect(names).not.toContain(REMOVED_FIELD)
    expect(names).not.toContain('editingModeLabel')
  })

  it('FS20 — the surviving clauses stay: the settings still carry panes/topK/theme/layout/tabs', () => {
    const store = createOperatorSettingsStore({ path: settingsPath() })
    const settings = store.get()
    for (const key of ['enabledPanes', 'enabledOperatorPanes', 'topK', 'theme', 'layout', 'tabs']) {
      expect(settings as unknown as Record<string, unknown>).toHaveProperty(key)
    }
  })
})

// ===========================================================================
// S8 / §6.3 shape R-B — the toolbar's mode literal is repointed
// ===========================================================================
describe('§6.3 R-B — the toolbar reflects the REPRESENTATION mode, not an editing control', () => {
  it('S8 — editorToolbarContent authors the toolbar for the html representation with data-mode="html"', () => {
    const toolbar = paneGraph.editorToolbarContent('html' as never)
    expect((toolbar.props as Record<string, unknown>)['data-mode']).toBe('html')
  })

  it('S8 — editorToolbarContent authors the toolbar for the markdown representation with data-mode="markdown"', () => {
    const toolbar = paneGraph.editorToolbarContent('markdown' as never)
    expect((toolbar.props as Record<string, unknown>)['data-mode']).toBe('markdown')
  })

  it('S8 — the toolbar never carries the removed editing-control literals in its mode props', () => {
    for (const mode of REPRESENTATION_MODES) {
      const toolbar = paneGraph.editorToolbarContent(mode as never)
      const props = toolbar.props as Record<string, unknown>
      const literals = [props['data-mode'], props['data-target-mode']].map(String)
      expect(literals).not.toContain('textarea')
      expect(literals).not.toContain('contenteditable')
    }
  })

  it('S8 — the toolbar still authors the Undo/Redo controls (the journal surface is untouched by the mode change)', () => {
    const toolbar = paneGraph.editorToolbarContent('html' as never)
    const ids = JSON.stringify(toolbar)
    expect(ids).toContain('editor-toolbar-undo')
    expect(ids).toContain('editor-toolbar-redo')
  })

  it('FS22 — the toolbar authors no form control (no textarea/input element anywhere)', () => {
    for (const mode of REPRESENTATION_MODES) {
      const toolbar = paneGraph.editorToolbarContent(mode as never)
      const types = JSON.stringify(toolbar)
      expect(types).not.toContain('"textarea"')
      expect(types).not.toContain('"input"')
    }
  })
})
