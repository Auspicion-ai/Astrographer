# Unit U-IMPORT-1 — File → Import… FS/Browse Surface (C17) — Spec

**Status:** DRAFT 2026-09-11+. **Document-only — no code.** Gate: the UI-overhaul
umbrella gate `docs/specs/ui-overhaul-review.md` (PROCEED-WITH-AMENDMENTS, A10:
`U-IMPORT-1` follows `U-MENU-1` + `U-STATE-1`; ui-overhaul §8.1 Wave 3 — the only
remaining Wave-3 item). **C17 is already ADJUDICATED** by the umbrella gate and is
**NOT re-openable** here; Q17/Q18 are also adjudicated (ui-overhaul §7) and pinned
verbatim below. Open items live in §8 (the `W-U-IMPORT-1-Q*` set) for the Architect.
This is the per-unit spec required by AGENTS.md item 9 before any TestWriter red set.

---

## 1. What the proposal asks

`docs/specs/ui-overhaul.md` **C17** (line 43) asks:

> An **Import** item in the **File menu** that opens a file browser; select
> **one or more `.md` files** *or* **a directory**, importing **all `.md` files
> in that directory**.

The draft reading (the C17 target + the binding W1-N2 / Q17 / Q18 rulings) pins the
deliverable:

- Native **File → Import…** opens an Electron `showOpenDialog` with an `.md`/
  `.markdown` filter. **Multi-file upload is the DEFAULT on all platforms**
  (`['openFile','multiSelections']`).
- **macOS** may additionally allow a directory **in the same dialog**
  (`['openFile','multiSelections','openDirectory']`).
- **Windows/Linux** get a **SEPARATE `Import folder…`** item
  (`['openDirectory']`) for **directory bulk upload** — the combined
  file+directory picker is **macOS-only** (**W1-N2**, ui-overhaul §2.3 in
  U-MENU-1's spec).
- A directory expands to its `.md` files. **Q17 (adjudicated):** **top-level
  `.md` (+ `.markdown`) only, NON-RECURSIVE v1; skip dot-dirs; NO symlink
  follow; a sane file-count cap with a FAIL-LOUD message.**
- The resolved list routes to the **SAME `importMarkdownCorpus` application
  handler** as the MCP `edit.import_markdown` tool. **The `corpusRoot` stays
  server-fixed** (per the addressed/default store — Unit MS4 / ADV-1);
  `importMarkdownCorpus` never derives its root from the browse surface.
- **Q18 (adjudicated):** the File menu is the **primary** import surface; the G2
  doc-nav pane *may* also expose an Import control using the same handler — that
  in-pane control is **NOT** this unit (§7 delimitation).

The current state (verified 2026-09-11) pins the actual gap:

- `src/main/app-menu.ts` (U-MENU-1) already delivers the **File → Import… menu
  item** + the `AppMenuActions.openImport()` seam, `IMPORT_DIALOG_FILTERS`
  (`md`/`markdown`), and `IMPORT_DIALOG_PROPERTIES = ['openFile','openDirectory']`
  — a **single-dialog shape that does NOT yet match W1-N2** (no multi-file
  default separation, no win/linux `Import folder…` second item). It also
  delivers `importSelectionFromDialog(result)` (interprets the dialog result and
  returns the raw selection paths **unchanged** — expansion is this unit's).
- `src/main/main.ts` `openImportDialog()` (lines ~155-177) builds
  `{ properties: [...IMPORT_DIALOG_PROPERTIES], filters }`, calls
  `dialog.showOpenDialog`, and on a non-cancel selection **only** logs
  `'[provident-main] import selection (U-IMPORT-1 pending):'` — **the directory
  expansion + `importMarkdownCorpus` routing are NOT done. That is the gap this
  unit closes.**
- `src/main/markdown-import.ts` `importMarkdownCorpus(ctx, params, store?)` and
  the MCP `edit.import_markdown` handler (`src/main/mcp-server.ts:1467-1496`)
  are the **import parsing/handler base** that this unit REUSES unchanged (Unit
  T / MS4 / UD3). U-IMPORT-1 is the **FS/browse surface only**; it adds **NO**
  import parsing behavior.

---

## 2. Contract (pinned)

**Scope = the fs-only import surface (C17).** U-IMPORT-1 lands: (a) the node-testable
directory → `.md`/`.markdown` expansion (Q17), (b) the **platform-aware** dialog
shape (W1-N2: multi-file default on all platforms; a separate `Import folder…`
`['openDirectory']` item on win/linux; macOS may combine file+directory in one
dialog), and (c) the IPC + routing that resolves the selection to a list of files
and feeds the **SAME `importMarkdownCorpus` handler** (server-fixed corpusRoot per
the default store). It adds NO import parsing behavior.

The Architect rulings 1–4 (the task brief) are binding and encoded verbatim below.

### 2.1 The pure directory-expansion + dialog-shape builder (NEW — node-testable)

Add a **NEW pure module** `src/main/import-directory.ts` (name Implementer-free but
the exports below are pinned). It carries **no `electron` import** (node-testable).
The exports:

```
export const MAX_IMPORT_FILES = 512

export type ImportDirectoryOutcome =
  | { ok: true; files: string[] }
  | { ok: false; reason: 'not-a-directory'; path: string }
  | { ok: false; reason: 'cap-exceeded'; cap: number; count: number }

export interface ExpandImportDirectoryOptions { max?: number }  // default MAX_IMPORT_FILES

export function expandImportDirectory(dir: string, options?: ExpandImportDirectoryOptions): ImportDirectoryOutcome

export type ImportOpenProperty = 'openFile' | 'multiSelections' | 'openDirectory'
export interface ImportDialogOptions {
  properties: readonly ImportOpenProperty[]
  filters: readonly { name: string; extensions: readonly string[] }[]
}
export function buildImportDialogOptions(platform?: NodeJS.Platform | string): ImportDialogOptions

export type ImportSelectionResolution =
  | { ok: true; files: string[]; directories: number }
  | { ok: false; reason: 'no-markdown-files' }
  | { ok: false; reason: 'cap-exceeded'; cap: number }
export function resolveImportSelection(paths: readonly string[], options?: ExpandImportDirectoryOptions): ImportSelectionResolution
```

**`MAX_IMPORT_FILES = 512`** — the pinned sane file-count cap (adjudicated value;
see §8 W-Q3). The cap is **per `expandImportDirectory` directory read** and is
re-enforced on the aggregate in `resolveImportSelection` (§2.4).

**`expandImportDirectory(dir, options?)` — the Q17 directory→`.md` expansion.**
Pinned rules (the node-testable core — what the TestWriter's red set + the §5.7 PBT
rows drive):

1. **Top-level only, NON-RECURSIVE** — list the immediate entries of `dir`; never
   descend into a sub-directory. A sub-directory entry is **not** expanded and
   contributes nothing.
2. **Scope = `.md` and `.markdown` FILES ONLY** — a file is included iff its
   basename's extension is exactly `.md` or `.markdown`, compared **case-insensitively**
   (`foo.MD`, `FOO.MarkDown`, `x.mD` all match). Any other file type is dropped.
3. **Dot-entries are skipped** — any entry (file **or** directory) whose basename
   starts with `.` is excluded (`.[a-z]+` and any leading-dot name — `.git`,
   `.hidden/`, `.md`). Safe/conservative.
4. **NO symlink follow** — an entry that `lstat` reports as a symbolic link is
   **excluded**, whether it links to a file or a directory (the **conservative PIN —**
   §8 W-Q1). Symlinks are never dereferenced during the expansion.
5. **Deterministic order** — the returned `files` are sorted (ascending)
   **byte/lexicographic order** (a Unicode-codepoint / plain string comparison,
   NOT locale-dependent) so the list is stable regardless of the directory's
   on-disk iteration order.
6. **The cap (FAIL-LOUD)** — if the matching files would exceed `max` (default
   `MAX_IMPORT_FILES`), return `{ ok: false, reason: 'cap-exceeded', cap, count }`
   where `count` is the number of matching files that were seen before the abort.
   The cap is **never silently truncated** — a FAIL-LOUD signal is mandatory.
7. **TOTAL on a missing/empty/non-directory path — NEVER throws** (§4 F1):
   - `dir` that does not exist, `dir` that is a **file** (not a directory), or an
     empty/`''` path ⇒ `{ ok: false, reason: 'not-a-directory', path }` (deterministic
     fail message, never a throw).
   - a valid empty directory ⇒ `{ ok: true, files: [] }`.
   - `options.max` non-positive/`NaN`/non-number ⇒ coerced to `MAX_IMPORT_FILES`
     (fail-closed; never throws).
8. **Deterministic** — equal `dir` filesystem states + equal `options` yield equal
   `files` arrays (byte-equal, same order).

The expansion uses `node:fs` `readdirSync` + `lstatSync` (it IS node-testable against
temp-dir fixtures; the module carries no `electron` dependency).

**`buildImportDialogOptions(platform?)` — the W1-N2 dialog shape (pure + TOTAL).**
Input is defaulted to `process.platform` when omitted; an unknown platform string
coerces to the **non-darwin** shape (fail-closed, never throws). `null`/`undefined`/
non-string also coerce to `process.platform`/non-darwin default. Returns:

| `platform` | `properties` | `filters` |
| --- | --- | --- |
| `darwin` | `['openFile','multiSelections','openDirectory']` (file **and** directory in ONE dialog) | `[{ name:'Markdown', extensions:['md','markdown'] }]` |
| `win32`, `linux`, **any other / unknown / non-darwin** | `['openFile','multiSelections']` (multi-file DEFAULT; directory is NOT offered in this dialog — it is the separate `Import folder…` item) | `[{ name:'Markdown', extensions:['md','markdown'] }]` |

The `filters` value is **byte-equal** to the existing `IMPORT_DIALOG_FILTERS`
(`app-menu.ts:31-33`). `buildImportDialogOptions` is the **NEW authority** for the
dialog `properties`; the existing `IMPORT_DIALOG_PROPERTIES` (`app-menu.ts:36`,
`['openFile','openDirectory']`) becomes **superseded by the darwin-only combined shape**
(that const's current value matches darwin only; the win/linux shape now comes from
`buildImportDialogOptions`).

**`resolveImportSelection(paths, options?)` — the aggregate resolution (TOTAL).**
Given the raw selection paths returned by the dialog, resolve to the FINAL md-file
list. Pinned rules:

1. For each raw `path`: `lstat` to classify.
   - a **symbolic link** ⇒ skipped (no follow; §8 W-Q1 conservative rule).
   - a **regular file** ⇒ included iff its extension is `.md`/`.markdown`
     (case-insensitive); any other file type is **dropped**.
   - a **directory** ⇒ expanded via `expandImportDirectory(path, options)`; on
     `ok:false` with `reason:'cap-exceeded'` the WHOLE resolution becomes
     `{ ok:false, reason:'cap-exceeded', cap }` (FAIL-LOUD — never a silently
     truncated subset); on `ok:false` with `reason:'not-a-directory'` the path
     contributes nothing (a raced/unreadable dir is dropped, never a throw —
     §4 F2).
2. **Dedupe** — a file present both explicitly and via a directory expansion (and
   any duplicate raw path) appears **once**. Dedupe is by exact path string.
3. **Sort** the aggregate ascending by byte/lexicographic order (codepoint, not
   locale) — the FINAL list is deterministic.
4. **Aggregate cap (FAIL-LOUD)** — if the final list would exceed `max`
   (`MAX_IMPORT_FILES`), return `{ ok:false, reason:'cap-exceeded', cap }`.
5. **No markdown at all** — if the (deduped) resolution is empty ⇒
   `{ ok:false, reason:'no-markdown-files' }` (an explicit no-op signal; never a
   batch call). Otherwise `{ ok:true, files, directories }` where `directories` is
   the count of directory selections expanded.
6. **TOTAL** — `null`, `undefined`, a non-array, an empty array, an array of
   non-string/`''` elements all **never throw**; they resolve to
   `{ ok:false, reason:'no-markdown-files' }` (§4 F3).

### 2.2 The dialog options per platform (W1-N2)

`buildImportDialogOptions` (§2.1) IS the platform dialog contract — pinned verbatim
in the table above. **Multi-file upload is the DEFAULT on all platforms**
(`['openFile','multiSelections']`); only macOS additionally offers `openDirectory`
in the same dialog; win/linux directories are reached through the **separate
`Import folder…`** item (`['openDirectory']`).

### 2.3 The menu items (win/linux TWO-item)

U-MENU-1 delivered a SINGLE `Import…` File-menu item via `buildMenuTemplate` +
`AppMenuActions.openImport()`. **U-IMPORT-1 extends the File menu to the
platform-aware two-item shape** (win/linux) / single combined item (darwin):

- **darwin — ONE item `Import…`** → `actions.openImport()`, which uses the
  combined dialog (`buildImportDialogOptions('darwin')`); the user may pick files, a
  directory, or a mix in that one dialog.
- **win32/linux — TWO items:**
  - **`Import…`** → `actions.openImport()` (the multi-file DEFAULT dialog,
    `buildImportDialogOptions('win32'/'linux')`);
  - **`Import folder…`** → a NEW action seam `actions.openImportFolder()`
    (U-IMPORT-1 adds this second seam to the `AppMenuActions` interface in
    `app-menu.ts` — §2.8), which runs `dialog.showOpenDialog({ properties:
    ['openDirectory'] })` for directory bulk upload.

The **labels are the pinned census** (§5.8): `Import…` (multi-file, all platforms)
and `Import folder…` (win/linux directory item). (The `unit-u-menu-1` spec §2.3
drafted the default's label as "`Import files…`"; the C17 text + the current
`app-menu.ts` use `Import…`, and that is the PIN here — the `Import…` label wins for
the multi-file item. Cross-ref note in §6.)

### 2.4 The resolution + `importMarkdownCorpus` routing (main.ts, source-pinned)

This is the **integration layer** — thin, source-pinned in `src/main/main.ts`. The
flow driven by the menu actions:

1. `openImport()` → `dialog.showOpenDialog(win, buildImportDialogOptions(platform))`;
   `openImportFolder()` → `dialog.showOpenDialog(win, { properties:['openDirectory'] })`.
2. On a **cancel/dismiss/empty** result, `importSelectionFromDialog` returns `null` →
   **no-op** (no resolution, no import, no broadcast — §4 F4).
3. On a non-cancel selection, `importSelectionFromDialog(result)` returns the raw
   paths UNCHANGED. Pass them to `resolveImportSelection(paths, { max:
   MAX_IMPORT_FILES })` (§2.1).
4. **`resolveImportSelection` failure**:
   - `{ ok:false, reason:'no-markdown-files' }` → no import; surface the fail-loud
     no-op to the operator (§2.5).
   - `{ ok:false, reason:'cap-exceeded' }` → **FAIL-LOUD**: no import at all; surface
     the cap error to the operator (§2.5). **Never a silently-truncated import.**
5. **`resolveImportSelection` success** → aggregate ONE `files: string[]` and call
   the SAME handler the MCP tool uses:
   ```
   const ctx = { store: runtime.getDefaultStore() }
   const result = await importMarkdownCorpus(
     ctx,
     { files, corpusRoot: defaultEntry.corpusRoot },   // the default store's corpusRoot
     { name: defaultEntry.name, isDefault: true,
       reservedNames: [...runtime.getDirectory().entries.keys()].filter(n => n !== defaultName) },
   )
   ```
   - **server-fixed corpusRoot:** `corpusRoot = defaultEntry.corpusRoot` (the
     default store's configured corpus root — the project root when unconfigured;
     §2.6/ADV-1, Unit MS4). The browse surface never supplies its own root; an empty
     resolved dir inside a non-root corpus means "no md at that scope", never a root
     change.
   - The store context (`isDefault: true`, `reservedNames` = non-default names) is
     the **U-MS4 A1 collision list** taken as given — byte-equivalent to the MCP
     addressed-default path (`mcp-server.ts:1490-1494`, with `isDefault` true).
   - `importMarkdownCorpus` **never throws for a domain failure** — it returns the
     discriminated `ImportMarkdownResult` (`{ ok:true, documentIds, nodeCount,
     edgeCount }` | `{ ok:false, error, failedFile? }`, Unit T §5.4) and its parsing,
     path/id minting, doc-flow validation, and batch apply are all **unchanged
     (Unit T / MS4 / UD3).**
   - On `result.ok === true`: main fires the same re-traversal trigger used by the
     MCP edit path — `runtime.getDefaultEngine().onStoreChanged('structural',
     result.documentIds, []).catch(...)` + `backend.broadcast(IPC_RAG_STORE_CHANGED,
     { kind:'structural', nodeIds: result.documentIds, edgeIds: [], store:
     runtime.getDefaultName() })` (the C10 content-repopulation trigger, §6).
6. The final `ImportMarkdownResult` summary (or the fail-loud error) is surfaced to
   the operator (§2.5).

### 2.5 The operator result surface (the IPC channel)

The browse import runs entirely in MAIN (the native dialog + the handler are
main-process shell). The result surfaces to the renderer as a **one-way main→renderer
broadcast** on a NEW channel:

- **`IPC_IMPORT_RESULT = 'provident:import-result'`** (added to
  `src/shared/types.ts`, the §5.8 census).
- Payload (a discriminated `ImportResultPayload` — JSON-serializable):
  ```
  | { ok: true; documentIds: string[]; nodeCount: number; edgeCount: number; resolvedCount: number }
  | { ok: false; reason: 'import-failed'; error: string; failedFile?: string }
  | { ok: false; reason: 'cap-exceeded'; cap: number }
  | { ok: false; reason: 'no-markdown-files' }
  ```
  (Concretely: the `ImportMarkdownResult` summary on success/failed, or the
  fail-loud markers. Field names Implementer-free but the four discriminant
  outcomes are the pinned set.)
- Fired EXACTLY ONCE per non-cancel selection that reaches §2.4 step 3/5 (A4-style);
  a cancelled dialog (§2.4 step 2) fires **ZERO** times.
- Manual-UI only — the MCP tool handlers never route to this channel (an agent does
  not trigger a native dialog; §6 note / §7).

### 2.8 Source-pinned surface (the statically-asserted layer)

Following the `unit-u-shell-7`/`unit-u-shell-shell-wiring` source-pin house
convention, the TestWriter statically asserts (source-snapshot assertions against the
module files; exact lines are free):

1. **The win/linux TWO-item File menu:** `app-menu.ts` `buildMenuTemplate` emits
   BOTH `Import…` (→ `actions.openImport()`) AND `Import folder…`
   (→ `actions.openImportFolder()`) for a non-darwin platform, and exactly ONE
   `Import…` for darwin.
2. **`AppMenuActions` gains `openImportFolder(): void`** — the second seam, wired by
   `main.ts` to the `['openDirectory']` dialog (§2.3).
3. **`dialog.showOpenDialog` uses `buildImportDialogOptions(platform)`** for the
   `openImport()` path (NOT a hard-coded `IMPORT_DIALOG_PROPERTIES` spread), and
   `{ properties: ['openDirectory'] }` for `openImportFolder()` (§2.4 step 1).
4. **`resolveImportSelection(selection, { max })` is called** on the non-cancel
   dialog selection and its outcome drives the branch (§2.4 steps 3–5).
5. **`importMarkdownCorpus(ctx, { files, corpusRoot: defaultEntry.corpusRoot },
   storeCtx)` is called** with the resolved `files`, the **default-store corpusRoot**
   (server-fixed — NOT derived from the selection), and the `isDefault:true`
   store context + non-default `reservedNames` (§2.4 step 5).
6. **`backend.broadcast(IPC_IMPORT_RESULT, payload)` fires exactly once** per
   non-cancel run (and `IPC_RAG_STORE_CHANGED` once on success) (§2.4/§2.5).

The helper/module names are NOT pinned (Implementer-free) except the exports in
§2.1/§5.8; only the registration/wiring surface above is pinned.

---

## 3. States (TestWriter red set — valid paths)

The valid paths split into **(a) the pure node-testable core** (`expandImportDirectory`,
`buildImportDialogOptions`, `resolveImportSelection`) and **(b) the source-pinned /
integration wiring** in `main.ts`. Both halves are MANDATORY for a green.

### 3a. The pure node-testable core

1. **Single-file selection routed:** a dialog result with one `.md` file →
   `resolveImportSelection` → `{ ok:true, files:[p], directories:0 }` →
   `importMarkdownCorpus` called with that one file.
2. **Multi-file selection routed:** N `.md` files (case-insensitive extensions) →
   one `files: string[]` (deduped + codepoint-sorted).
3. **Directory selection expanded:** a directory with top-level
   `a.md` + `b.markdown` → expanded to those two, sorted; a nested
   `sub/c.md` is NOT included (non-recursive, Q17).
4. **Mixed file+directory selection:** a `.md` file + a directory → aggregate of
   the file + the directory's top-level md (deduped + sorted);
   `directories === 1`.
5. **Platform dialog shapes:** `buildImportDialogOptions('darwin')`
   ⇒ `['openFile','multiSelections','openDirectory']`; `('win32'|'linux'|unknown)`
   ⇒ `['openFile','multiSelections']`; the `filters` are the same `md`/`markdown`
   filter in both.
6. **Import runs and returns a result:** `importMarkdownCorpus` returns a
   discriminated `ImportMarkdownResult`; on a valid corpus the `ok:true` branch
   reports `documentIds`/`nodeCount`/`edgeCount` (unchanged Unit T/M S4/UD3
   behavior — byte-equal to the MCP path on the same files).

### 3b. The wiring (source-pinned / dom-shim-N-A — main-side)

7. **win/linux menu is two-item:** `buildMenuTemplate` with a non-darwin platform
   emits `Import…` + `Import folder…`; darwin emits a single `Import…`.
8. **Both action seams wired:** `actions.openImport()` opens the multi-file dialog;
   `actions.openImportFolder()` opens the `['openDirectory']` dialog.
9. **Non-cancel selection resolves + imports:** the resolved list feeds
   `importMarkdownCorpus` with the default-store `corpusRoot`; on success main
   broadcasts `IPC_IMPORT_RESULT` (once) AND `IPC_RAG_STORE_CHANGED` (once);
   the engine reconcile is invoked fire-and-forget (caught).
10. **Cancelled dialog is a no-op:** `importSelectionFromDialog` returns `null`;
    NO resolution, NO import, NO broadcast.

### 3c. Adversarial findings (RCA-3 — recorded post-green; none yet — this is the red
set's precursor)

The adversarial pass runs AFTER the green and its findings are recorded here
(pending).

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | `expandImportDirectory` on a missing / non-directory / `''` / empty path | TOTAL — returns `{ ok:false, reason:'not-a-directory', path }`, **never a throw** (§2.1 rule 7) |
| F2 | `resolveImportSelection` meets a raced/unreadable/`not-a-directory` path | that path contributes nothing — dropped, never a throw (§2.1 resolve rule 1) |
| F3 | `resolveImportSelection` with `null`/`undefined`/non-array/empty array/non-string-or-`''` elements | TOTAL — `{ ok:false, reason:'no-markdown-files' }`, never a throw (§2.1 resolve rule 6) |
| F4 | a dialog cancel / dismiss / empty selection | a no-op — zero resolution, zero import, zero broadcast (§2.4 step 2) |
| F5 | a directory selected that contains NO `.md`/`.markdown` | the empty expansion → the aggregate is (eventually) `no-markdown-files`; no batch call (fail-loud no-op) |
| F6 | a directory's matching files EXCEED `MAX_IMPORT_FILES` (per-dir or aggregate) | **FAIL-LOUD** — `{ ok:false, reason:'cap-exceeded', cap }`; no import at all; **never a silently-truncated import** (§2.1 rule 6 / §2.4 step 4) |
| F7 | exactly `MAX_IMPORT_FILES` matching files | OK — the full list is returned (boundary below the cap) |
| F8 | a symbolic link entry (file- or directory-link) in / of the selection | **skipped** — the conservative no-follow rule (§2.1 rule 4 §8 W-Q1) |
| F9 | a dot-dir (`.git`, `.hidden/`, `.md`) in a directory | **skipped** (§2.1 rule 3) |
| F10 | a non-`.md`/`.markdown` file in a directory or explicit selection | dropped; only `.md`/`.markdown` (case-insensitive) survive (§2.1 rules 2/1) |
| F11 | a store-addressing edge — an empty resolved dir under a NON-cwd default corpusRoot | the resolved list (possibly empty → `no-markdown-files`) is handled as-is; the **`corpusRoot` stays server-fixed** — the browse surface never re-roots (§2.4 step 5 / §2.6) |
| F12 | `importMarkdownCorpus` returns `{ ok:false, error, failedFile? }` | surfaced via `IPC_IMPORT_RESULT` as the `import-failed` outcome; the engine is NOT reconciled; `IPC_RAG_STORE_CHANGED` fires 0 times |
| F13 | `options.max` non-positive/`NaN`/non-number (passed to `expandImportDirectory`/`resolveImportSelection`) | coerced to `MAX_IMPORT_FILES` (fail-closed), never a throw (§2.1 rule 7) |
| F14 | an unknown `platform` string to `buildImportDialogOptions` | coerced to the non-darwin multi-file shape (`['openFile','multiSelections']`), never a throw (§2.1) |
| F15 | `importMarkdownCorpus` throws (a non-domain host/battery error) | main catches + logs; no unhandled rejection; the operator is surfaced a failed outcome (§4 catch discipline) |

## 5. Census

### 5.7 Property register (PBT) — MANDATORY (code-bearing unit)

This is a **code-bearing** unit (it adds the NEW pure `src/main/import-directory.ts`),
so the register is **mandatory** (§4/§5.7 rule — a zero-row exemption is NOT
allowed). It covers the **pure, node-testable surface** — the input-model / transform
invariants of `expandImportDirectory`, `buildImportDialogOptions`, and
`resolveImportSelection`, driven over temp-dir fixtures (node-testable via `node:fs`
+ `node:os` temp dirs, never Electron). The `main.ts` wiring is NOT a property — it is
asserted by the §2.8 source-pin + the §3b wiring drive (never a register row — the
`unit-u-shell-shell-wiring` §5.7 note).

Rows are typed **P-IM** (input-model), **P-SM** (state-model), or **P-TP** (transform)
— NEVER F-rows, NEVER §4 rows. **Class tally ≤ 8.** All rows state HONEST
pure/transform invariants observable from the pinned §2.1 surfaces — no row reaches
into the wiring, none invents a return field.

| Ref | Class | Invariant | Strategy | Checkable proposition (∀ pattern) |
|---|---|---|---|---|
| `P-IM-1` | IM | **`expandImportDirectory` is TOTAL over its domain.** Every shape — missing path, a path to a FILE (not a dir), `''`, `undefined`, a valid empty dir, `options.max` non-positive/`NaN`/non-number — returns a deterministic `ImportDirectoryOutcome`; the missing/file/empty-path cases return `{ ok:false, reason:'not-a-directory' }`; an empty dir returns `{ ok:true, files:[] }`; an invalid `max` is coerced to `MAX_IMPORT_FILES`. **Never throws.** | `strat:dir-expand-domain-total` | ∀ generated `dir ∈ { missing, existing-empty-dir, path-to-file, '', undefined }` and `max ∈ { 512, -1, 0, NaN, 'x' }`: `expandImportDirectory(dir, { max })` returns (never throws); the outcome is one of the pinned literal set; a missing/file/`''`/`undefined` dir ⇒ `ok === false && reason === 'not-a-directory'`; an empty dir ⇒ `ok === true && files.length === 0`; a bad `max` ⇒ the effective cap is `MAX_IMPORT_FILES`. |
| `P-IM-2` | IM | **`buildImportDialogOptions` is TOTAL over its platform domain.** `'darwin'`, `'win32'`, `'linux'`, `undefined`/`null`/non-string/unknown strings each return a well-formed `ImportDialogOptions` — never a throw; only `'darwin'` returns the combined `['openFile','multiSelections','openDirectory']`; every other input returns `['openFile','multiSelections']`; the `filters` are always `[{ name:'Markdown', extensions:['md','markdown'] }]`. | `strat:dialog-options-platform-total` | ∀ generated `platform ∈ { 'darwin', 'win32', 'linux', 'aix', 'freebsd', undefined, null, 42, {} }:`: `buildImportDialogOptions(platform)` returns; `platform === 'darwin'` ⇒ `properties` deep-equals `['openFile','multiSelections','openDirectory']`; else ⇒ `['openFile','multiSelections']`; `filters` deep-equals the pinned `md/markdown` filter for all inputs. |
| `P-IM-3` | IM | **`resolveImportSelection` is TOTAL over its selection domain.** `null`, `undefined`, a non-array, an empty array, an array of non-string/`''` elements each return a deterministic `ImportSelectionResolution` — never a throw; each degenerates to `{ ok:false, reason:'no-markdown-files' }`; non-md file entries are dropped. | `strat:resolve-selection-domain-total` | ∀ generated `paths ∈ { null, undefined, [], ['', 5, {}], ['a.txt'] }`: `resolveImportSelection(paths, { max })` returns; not-throwing; the outcome is a pinned literal; an empty/void selection ⇒ `ok === false && reason === 'no-markdown-files'`; a non-md file ⇒ `ok === false && reason === 'no-markdown-files'`. |
| `P-TP-1` | TP | **`expandImportDirectory` is deterministic + codepoint-sorted.** Equal temp-dir filesystem states + equal `options` produce byte-equal, ascending-codepoint `files` arrays across repeated calls; the result does not depend on the host's readdir insertion order. | `strat:dir-expand-deterministic` | ∀ generated fixture dirs (md/markdown/non-md/dot/symlink/nested entries, inserted in MULTIPLE different orders): `expandImportDirectory(dir)` twice returns deep-equal `files`; `files` is sorted ascending in codepoint; a nested `sub/x.md` is absent (non-recursive). |
| `P-TP-2` | TP | **The expansion scope is exactly top-level `.md`/`.markdown` files, dot- and non-md-skipped.** A `.md`, `.markdown`, `.MD`, `X.MarkDown`, `y.mD` file are included; `a.txt`, `README`, `noext`, `.md`, `.git/x.md` and any `.[a-z]+`-prefixed name are excluded; a nested `sub/c.md` is excluded (non-recursive, Q17). | `strat:dir-expand-scope` | ∀ generated fixture dirs containing the mixed entry set: the returned `files` is EXACTLY `{ the included md/markdown names, sorted }`; no dot-entry, no non-md, no nested-file member. |
| `P-TP-3` | TP | **The symlink rule is conservative + deterministic.** A symlink entry (file- or directory-link) in the dir is never included and never dereferenced; a symlinked-to `.md` file whose link name carries `.md` is NOT included (the link name's extension does not matter — `lstat` says symlink ⇒ skip). | `strat:dir-expand-symlinks` | ∀ generated symlink fixtures (a link named `x.md` → a real `.md` target; a directory link `dl` → a dir holding `.md`): `expandImportDirectory(dir)` excludes every symlink entry; the target's contents (via the directory link) are not pulled in. |
| `P-TP-4` | TP | **The cap is fail-loud with a precise boundary.** A dir with strictly more than `max` matching files ⇒ `{ ok:false, reason:'cap-exceeded', cap, count }` with `count > cap`; a dir with exactly `max` matching files ⇒ `{ ok:true, files }` with `files.length === max` (boundary); `resolveImportSelection` propagates a directory's `cap-exceeded` to the WHOLE aggregate (never a truncated subset). | `strat:dir-expand-cap` | ∀ fixture dirs with `N ∈ { max-1, max, max+1, max*2 }` matching files: `N > max` ⇒ `reason==='cap-exceeded'` and `cap===max` and `count > max`; `N === max` ⇒ `ok === true && files.length === max`; a mixed file+directory selection where the dir expands past `max` ⇒ `resolveImportSelection(...).ok === false && reason === 'cap-exceeded'`. |
| `P-TP-5` | TP | **`resolveImportSelection` aggregates deterministically: md-only, deduped, codepoint-sorted, dir-expanded.** A mixed input (an explicit `.md`, a `.markdown`, an explicit non-md dropped, a directory) yields the union of the explicit md + the directory's top-level md, deduped (a path present both ways appears once), codepoint-sorted; `directories` counts the expanded directory selections. | `strat:resolve-selection-aggregate` | ∀ generated mixed selections (file + dir; overlapping file-in-dir; duplicate raw paths; non-md): `files` is byte-equal to `{ sorted, deduped union }`; every member is `.md`/`.markdown`; duplicates never appear; `directories` equals the number of dir entries expanded. |

**Class tally:** IM ×3, SM ×0, TP ×5 = **8 rows ≤ 8** ✔.

The rows are **NOT over-strength**: every proposition is directly observable from the
pinned §2.1 surfaces over temp-dir fixtures and plain values — no row reaches into
`main.ts`, none invents a return field. No P-SM row is warranted — the fs surface has
no persistent state model (every transform is a pure function of its inputs + the
`stat`/`lstat` snapshot; the only "state" is the filesystem fixture, which the rows
treat as the input domain). A correct implementation passes every row; one that
throws on a missing/empty path, follows a symlink, silently truncates the cap,
locale-sorts, fails to dedupe the aggregate, or emits a non-darwin
`openDirectory` would fail.

### 5.8 Census — names, constants, channels, menu labels, cross-refs

**Module surface (NEW — `src/main/import-directory.ts`):**
- `MAX_IMPORT_FILES = 512` (*pinned value*).
- `expandImportDirectory(dir, options?): ImportDirectoryOutcome` (§2.1).
- `ImportDirectoryOutcome` (§2.1), `ExpandImportDirectoryOptions { max? }`.
- `buildImportDialogOptions(platform?): ImportDialogOptions` (§2.1/§2.2).
- `ImportDialogOptions { properties; filters }`, `ImportOpenProperty` (§2.1).
- `resolveImportSelection(paths, options?): ImportSelectionResolution` (§2.1/§2.4).
- `ImportSelectionResolution` (§2.1).

**Menu labels (pinned):** `Import…` (multi-file, all platforms — §2.3) and
`Import folder…` (win/linux directory item — §2.3).

**Menu action seams (`app-menu.ts` `AppMenuActions` — U-IMPORT-1 extends):**
`openImport(): void` (existing U-MENU-1) and **`openImportFolder(): void`** (NEW,
U-IMPORT-1 — §2.3/§2.8).

**Filter (pinned):** `[{ name:'Markdown', extensions:['md','markdown'] }]` —
byte-equal to `IMPORT_DIALOG_FILTERS` (`app-menu.ts:31-33`).

**Dialog properties:** `buildImportDialogOptions` is the NEW authority;
`IMPORT_DIALOG_PROPERTIES` (`app-menu.ts:36`, `['openFile','openDirectory']`)
becomes darwin-only-superseded (§2.1).

**IPC channel (NEW — `src/shared/types.ts`):** `IPC_IMPORT_RESULT =
'provident:import-result'` (§2.5) + the `ImportResultPayload` discriminant set.
Existing reused: `IPC_RAG_STORE_CHANGED` (`'provident:rag-store-changed'`, the C10
re-traversal trigger).

**Reused handler/ctx:** `importMarkdownCorpus(ctx, params, store?)`
(`markdown-import.ts`), `ImportMarkdownParams { files; corpusRoot? }`,
`ImportMarkdownResult`, `ImportStoreContext { name; isDefault; reservedNames? }`,
`EditOpContext { store }` (`edit-ops.ts:17-22`).

**Files:** `src/main/import-directory.ts` (NEW core), `src/main/app-menu.ts`
(extend `AppMenuActions` + the two-item File menu), `src/main/main.ts` (wire the two
seams, call `buildImportDialogOptions`, `resolveImportSelection`, `importMarkdownCorpus`,
broadcast `IPC_IMPORT_RESULT` / `IPC_RAG_STORE_CHANGED`), `src/shared/types.ts`
(add `IPC_IMPORT_RESULT` + the payload type).

## 6. Cross-references

- `docs/specs/ui-overhaul.md` — **§1 C17** (line 43, the requirement), **§4 G2**
  (line 672 — the File-menu Import row, `edit.import_markdown` COVERED by browse),
  **§5.1 PG2** (line 962 + the CLOSED note at 980-981 — the browse import covers
  `edit.import_markdown`'s UI home), **§5.4 SG3** (line 1123 — "no File menu" owner
  U-IMPORT-1), **§7 Q17** (line 1181 — top-level md+markdown, non-recursive, skip
  dot-dirs, no symlinks, cap with fail-loud) **+ Q18** (1182 — File menu primary,
  optional in-pane control), **§8.1 Wave 3** (line 1403 — the only remaining Wave-3
  item), §2.1 Table C (the `showOpenDialog` import browse = OS/file-dialog shell
  carve-out, line 142).
- `docs/specs/unit-u-menu-1-application-menus.md` — U-MENU-1 delivered the
  `AppMenuActions.openImport()` seam + the single `Import…` item + `IMPORT_DIALOG_*`
  + `importSelectionFromDialog`; its §2.3 (W1-N2) drafted the platform dialog split
  that this unit pins; its §6 cross-ref names the import unit as
  `unit-u-import-1-file-import.md` — **this spec's canonical name is
  `unit-u-import-1-import-surface.md`; a reference-rename note is owed when
  propagating (§8 W-Q6).**
- `docs/specs/unit-t-markdown-import.md` — the **import parsing base**
  (`importMarkdownCorpus`, `ImportMarkdownParams/Result`, §5.1/§5.4/§5.5). U-IMPORT-1
  ADDS none of this; it only feeds it files.
- `docs/specs/unit-ms4-id-prefixing.md` — **server-fixed `corpusRoot`** (ADV-1,
  `params.corpusRoot` is server-fed; the tool/surface stays files-only), the A1
  prefix-namespace collision list, `ImportStoreContext` (importer half: `resolve(corpusRoot, file)`).
- `docs/specs/unit-ms2-store-wiring.md` — the **per-store corpusRoot wiring half**
  (the directory injects `corpusRoot` per entry; U-IMPORT-1 consumes the default
  entry's root).
- `docs/specs/unit-ud3-import-path-id-scheme.md` — the **import path/id scheme**:
  `documentId = [...documentPath, basename].join('/')` + root `documentPath`;
  U-IMPORT-1's resolved files flow through it unchanged (a nested file gets a
  path-qualified id, a root file a flat id).
- `src/main/app-menu.ts` (§2.1/§2.3/§2.8), `src/main/main.ts` (the
  `openImportDialog` wire at ~155-177 — the actual gap), `src/main/markdown-import.ts`,
  `src/main/mcp-server.ts` (`edit.import_markdown` at 1467-1496 — the parallel MCP
  seam), `src/shared/types.ts`, `src/main/edit-ops.ts` (`EditOpContext`).
- `docs/specs/unit-u-shell-7-settings-modal.md` + `unit-u-shell-shell-wiring.md` —
  the source-pin house convention + the §5.7 register format + the fail-soft
  discipline.

**MCP-UI equivalence (parity):** the browse surface and the MCP `edit.import_markdown`
tool both invoke the **same `importMarkdownCorpus` main-process handler** — the
parity definition of ui-overhaul §4 (same application code; distinct entry paths).
U-IMPORT-1 adds no MCP tool and does not change the existing tool.

## 7. Delimitation

This unit lands the **FS/browse import surface only.** It does NOT:

- change **import parsing** — `markdown-parse.ts` / `markdown-import.ts` read/parse/
  validate/apply logic is the **base `unit-t-markdown-import` unit's** (U-IMPORT-1 is
  the browse/fs front-end only);
- change the **MCP `edit.import_markdown` tool** — the fs surface **parallels it**
  (MCP-UI equivalence, §6); the tool schema stays `files`-only (ADV-1);
- implement **recursion** — Q17 pins top-level non-recursive v1 (a nest beyond the
  top level is an explicit NON-goal);
- implement the **in-pane G2 Import control** — Q18's optional coexistence is a G2 /
  doc-nav concern, NOT this unit;
- introduce a **store-selector UI** — the fs import addresses the **default store
  only** (`runtime.getDefaultStore()` + the default entry's corpusRoot, server-fixed);
  a store-picker is a separate future feature (§8 W-Q5);
- add any **MCP tool / renderer→main invoke** for the dialog — the native dialog is
  the shell carve-out and runs in main; the only new channel is the main→renderer
  result broadcast (`IPC_IMPORT_RESULT`, §2.5);
- change the **`corpusRoot`** — the browse surface never supplies one; it stays the
  default store's server-fixed root (§2.4 step 5).

No `docs/skills/designing-pages.md` update is owed: that file does not exist in the
repo, and the File menu + native dialog are the Electron-shell carve-out
(ui-overhaul §2.1 Table C), not page design.

## 8. Open items / open decisions (W-U-IMPORT-1-*)

The C17 text + the umbrella gate + ui-overhaul §7 Q17/Q18 resolve most decisions
(below, marked RESOLVED/PINNED). The genuine unknowns this draft **PINNED** are
flagged for the Architect to ratify or overturn:

- **W-U-IMPORT-1-Q1 (PINNED — conservative): the exact symlink rule.**
  `expandImportDirectory`/`resolveImportSelection` **SKIP all symlinks** (`lstat`
  says symlink ⇒ excluded, never dereferenced), whether the link targets a file or a
  directory. This is the Q17 "no symlink follow" adjudication applied conservatively.
  *Architect note: an alternative "follow a FILE symlink but not a dir symlink" was
  considered and REJECTED for determinism/safety (a link named `.md` whose target is
  unreadable/outside would inject nondeterminism and path-escape risk); confirm the
  conservative skip.*
- **W-U-IMPORT-1-Q2 (PINNED): the `expandImportDirectory` return shape.** The brief's
  sketch (`): string[]`) cannot carry the FAIL-LOUD cap signal, so this spec pins a
  **discriminated `ImportDirectoryOutcome`** (`{ ok:true, files }` | `{ ok:false,
  reason:'not-a-directory'|'cap-exceeded', … }`). *Architect note: this is the pin
  below; a flat `string[]`-with-throw alternative was rejected because it would
  violate the "never throw" totality pin for the missing/empty path.*
- **W-U-IMPORT-1-Q3 (PINNED): `MAX_IMPORT_FILES = 512`.** *Architect note: confirm
  the value; a large corpus dir over 512 files fails LOUDLY rather than truncating —
  the fail-loud behavior is binding regardless of the number.*
- **W-U-IMPORT-1-Q4 (PINNED): the operator result surface.** A **one-way
  main→renderer broadcast** `IPC_IMPORT_RESULT` (main drives the whole native-dialog
  flow; there is no renderer invoke). *Architect note: confirm the renderer
  renders this via the existing broadcast/IPC plumbing; whether the renderer shows a
  status toast or a full pane is a renderer-side concern outside this unit's scope.*
- **W-U-IMPORT-1-Q5 (PINNED): the fs import addresses the DEFAULT store only.**
  `runtime.getDefaultStore()` + the default entry's `corpusRoot` (server-fixed).
  *Architect note: a multi-store picker is out of scope; the MCP tool's `store`
  addressing is NOT mirrored on the browse surface in v1.*
- **W-U-IMPORT-1-Q6 (OPEN — doc hygiene): the spec filename.** This spec is
  `unit-u-import-1-import-surface.md`; `unit-u-menu-1-application-menus.md` §6 cites
  `unit-u-import-1-file-import.md`. *Flagged: when this unit's specs/tests propagate,
  repoint that citation to this canonical filename.*

**Resolved (no adjudication needed):** the platform dialog split is `buildImportDialogOptions`
binding (W1-N2); the menu labels are `Import…`/`Import folder…` (§2.3 — the 
`unit-u-menu-1` "Import files…" wording is superseded by the C17/app-menu `Import…` label);
the aggregate is md-only + deduped + codepoint-sorted + fail-loud-capped; the 
`importMarkdownCorpus` call passes the default-store `corpusRoot` + `isDefault:true`
store context; a cancelled dialog is a no-op; the scope is top-level non-recursive (Q17).
