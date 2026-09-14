// src/main/import-directory.ts — Unit U-IMPORT-1: the pure directory → `.md`/
// `.markdown` expansion + the platform-aware dialog-shape builder + the
// aggregate selection resolution (docs/specs/unit-u-import-1-import-surface.md
// §2.1). This is the NODE-TESTABLE FS surface: it carries NO `electron` import
// and uses only `node:fs` (`readdirSync`/`lstatSync`) + `node:path`. Every
// function is TOTAL over its domain — it NEVER throws (fail states are
// returned as discriminated literals).
import { readdirSync, lstatSync } from 'node:fs'
import { join } from 'node:path'

/** The pinned sane file-count cap (adjudicated §8 W-Q3). The cap is
 *  enforced per `expandImportDirectory` directory read AND re-enforced on the
 *  aggregate in `resolveImportSelection`. FAIL-LOUD, never a silent truncate. */
export const MAX_IMPORT_FILES = 512

export type ImportDirectoryOutcome =
  | { ok: true; files: string[] }
  | { ok: false; reason: 'not-a-directory'; path: string }
  | { ok: false; reason: 'cap-exceeded'; cap: number; count: number }

export interface ExpandImportDirectoryOptions {
  /** Default `MAX_IMPORT_FILES`. Non-positive/`NaN`/non-number ⇒ coerced to
   *  `MAX_IMPORT_FILES` (fail-closed, never throws). */
  max?: number
}

export type ImportOpenProperty = 'openFile' | 'multiSelections' | 'openDirectory'

export interface ImportDialogOptions {
  properties: readonly ImportOpenProperty[]
  filters: readonly { name: string; extensions: readonly string[] }[]
}

export type ImportSelectionResolution =
  | { ok: true; files: string[]; directories: number }
  | { ok: false; reason: 'no-markdown-files' }
  | { ok: false; reason: 'cap-exceeded'; cap: number }

/** True if the basename's extension is exactly `.md`/`.markdown`,
 *  case-insensitively (§2.1 rule 2). */
function isMarkdownFile(name: string): boolean {
  const lower = name.toLowerCase()
  return lower.endsWith('.md') || lower.endsWith('.markdown')
}

/** A dot-entry — any name starting with `.` (§2.1 rule 3). */
function isDotEntry(name: string): boolean {
  return name.startsWith('.')
}

/** Normalise `options.max` (rule 7 / F13): non-positive/`NaN`/non-number ⇒
 *  coerced to `MAX_IMPORT_FILES` (fail-closed, never throws). */
function normalizeMax(options?: ExpandImportDirectoryOptions): number {
  const raw = options ?? ({} as ExpandImportDirectoryOptions)
  const max = typeof raw === 'object' && raw !== null ? raw.max : undefined
  if (typeof max !== 'number' || Number.isNaN(max) || max <= 0) return MAX_IMPORT_FILES
  // a fractional positive max is floored to a deterministic integer cap (ADV-3)
  return Math.floor(max)
}

/** The Q17 directory → `.md` expansion (top-level, NON-RECURSIVE). Listed in
 *  §2.1 rules 1–8. TOTAL: a missing/file/`''`/non-string dir ⇒
 *  `{ ok:false, reason:'not-a-directory', path }` (path echoes the string dir
 *  else `''`); an empty dir ⇒ `{ ok:true, files:[] }`; a `cap-exceeded` read ⇒
 *  `{ ok:false, reason:'cap-exceeded', cap, count }` with `count === N` (the
 *  FULL matching count, `> cap`). Never throws. */
export function expandImportDirectory(
  dir: string,
  options?: ExpandImportDirectoryOptions,
): ImportDirectoryOutcome {
  const cap = normalizeMax(options)
  const pathField = typeof dir === 'string' ? dir : ''
  if (typeof dir !== 'string' || dir === '') {
    return { ok: false, reason: 'not-a-directory', path: pathField }
  }
  let st
  try {
    st = lstatSync(dir)
  } catch {
    return { ok: false, reason: 'not-a-directory', path: dir }
  }
  if (!st.isDirectory()) {
    return { ok: false, reason: 'not-a-directory', path: dir }
  }
  let names: string[]
  try {
    names = readdirSync(dir)
  } catch {
    return { ok: false, reason: 'not-a-directory', path: dir }
  }
  const files: string[] = []
  for (const name of names) {
    if (isDotEntry(name)) continue
    if (!isMarkdownFile(name)) continue
    let est
    try {
      est = lstatSync(join(dir, name))
    } catch {
      continue // a raced/unreadable entry contributes nothing — never a throw
    }
    // NO symlink follow (rule 4): a symbolic-link entry is excluded whether it
    // links to a file or a directory (its `.md`-looking name is irrelevant).
    if (est.isSymbolicLink()) continue
    if (!est.isFile()) continue
    files.push(join(dir, name))
  }
  const total = files.length
  if (total > cap) {
    return { ok: false, reason: 'cap-exceeded', cap, count: total }
  }
  // Deterministic order (rule 5): ascending Unicode-codepoint / plain string
  // comparison, not locale-dependent.
  files.sort()
  return { ok: true, files }
}

/** The W1-N2 platform-aware dialog shape (pure + TOTAL, §2.1). Input defaults
 *  to `process.platform` when omitted; `null`/`undefined`/non-string/unknown
 *  platforms coerce to the non-darwin (multi-file-default) shape. Never throws.
 *  darwin ⇒ file+directory in ONE dialog; everything else ⇒ multi-file only
 *  (directories are the separate `Import folder…` item). The `filters` value is
 *  byte-equal to `IMPORT_DIALOG_FILTERS`. */
export function buildImportDialogOptions(
  platform?: NodeJS.Platform | string,
): ImportDialogOptions {
  const filters: ImportDialogOptions['filters'] = [
    { name: 'Markdown', extensions: ['md', 'markdown'] },
  ]
  const p =
    typeof platform === 'string'
      ? platform
      : typeof process !== 'undefined'
        ? process.platform
        : 'linux'
  if (p === 'darwin') {
    return { properties: ['openFile', 'multiSelections', 'openDirectory'], filters }
  }
  return { properties: ['openFile', 'multiSelections'], filters }
}

/** The aggregate selection resolution (§2.1 resolve rules 1–7). TOTAL: `null`/
 *  `undefined`/non-array/empty ⇒ `no-markdown-files`; a per-path `lstat`
 *  classifies (symlink skipped, md-file included else dropped, directory
 *  expanded — its `cap-exceeded` POISONS the whole resolution); deduped by exact
 *  path; codepoint-sorted; aggregate cap FAIL-LOUD; `directories` counts the
 *  distinct directory selections expanded. Rule 7: any non-string/`''` element
 *  together with any valid selection POISONS the whole to `no-markdown-files`.
 *  Never throws. */
export function resolveImportSelection(
  paths: readonly string[],
  options?: ExpandImportDirectoryOptions,
): ImportSelectionResolution {
  const cap = normalizeMax(options)
  if (!Array.isArray(paths) || paths.length === 0) {
    return { ok: false, reason: 'no-markdown-files' }
  }
  // Rule 7 (whole-poison): a non-string/`''` element is NEVER dropped
  // per-element — its presence poisons the entire selection.
  if (paths.some((p) => typeof p !== 'string' || p === '')) {
    return { ok: false, reason: 'no-markdown-files' }
  }
  const strPaths = paths as string[]
  const files = new Set<string>()
  const dirs = new Set<string>()
  for (const path of strPaths) {
    let st
    try {
      st = lstatSync(path)
    } catch {
      continue // a raced/unreadable path contributes nothing — never a throw (F2)
    }
    if (st.isSymbolicLink()) continue // no follow (rule 1)
    if (st.isDirectory()) {
      const expanded = expandImportDirectory(path, options)
      if (!expanded.ok) {
        if (expanded.reason === 'cap-exceeded') {
          // The directory's cap-exceeded POISONS the WHOLE resolution — FAIL-LOUD.
          return { ok: false, reason: 'cap-exceeded', cap: expanded.cap }
        }
        // not-a-directory contributes nothing (dropped, never a throw).
      } else {
        dirs.add(path) // count ONLY a directory that actually expanded (a raced not-a-dir doesn't — ADV-2)
        for (const f of expanded.files) files.add(f)
      }
    } else if (st.isFile()) {
      if (isMarkdownFile(path)) files.add(path)
    }
  }
  const sorted = [...files].sort()
  if (sorted.length === 0) {
    return { ok: false, reason: 'no-markdown-files' }
  }
  if (sorted.length > cap) {
    return { ok: false, reason: 'cap-exceeded', cap }
  }
  return { ok: true, files: sorted, directories: dirs.size }
}
