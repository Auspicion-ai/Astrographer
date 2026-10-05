// src/main/operator-settings-store.ts — Unit K: the operator-settings
// persistence store (docs/specs/unit-k-sidebar-panes-host.md §5.4 M9). Loads an
// `OperatorSettings` JSON from a path, defaults to the pinned first-run values
// (no panes enabled / no default document / topK 5), and persists changes
// write-through so reload/restart restores them. This is the main-process owner
// of the config the `settings` pane reads/writes over the operator-settings IPC
// — operator-owned, NEVER an MCP tool (an agent must not change the operator's
// view/retrieval defaults).
import * as nodeFs from 'node:fs'
import { dirname } from 'node:path'
import type { OperatorSettings, OperatorSettingsPatch, RepresentationMode, ThemeSetting } from '../shared/types.js'
import { coerceLayout, defaultLayout, type LayoutState } from '../renderer/layout-state.js'
import { coerceTabState, defaultTabState, type TabState } from '../renderer/tab-state.js'

/** U-ATOMICITY-SWEEP-CLASS-B §1.1 member 1 / §2.3 ① / §2.3 ③ — THE PERSIST RECEIPT, homed HERE
 *  (self-contained, EXPORTED, importing NOTHING — §3.2 `I-11`'s duplicate-home rule). EXACTLY ONE
 *  of the TWO CLOSED forms exists after EVERY performed write; THE REASON SET IS CLOSED at the
 *  single token `'write-failed'`, which covers the `mkdir`, tmp-write, tmp-`fsync` and rename
 *  failure points ALIKE. It is NEVER a member of a store refusal union (3a's `K-2`). **ITS READER
 *  IS THIS STORE'S OWN PUBLIC MEMBER `lastWriteReceipt()`** (§2.3 ①): the receipt reaches every
 *  existing caller with ZERO channel/preload/IPC byte moved. */
export type OperatorSettingsWriteReceipt =
  | { readonly status: 'committed' }
  | { readonly status: 'refused'; readonly reason: 'write-failed' }

/** U-ATOMICITY-SWEEP-CLASS-B §2.1 `S-6` / §2.6 — THE INJECTED `fs` FAÇADE (ADDITIVE-OPTIONAL).
 *  ABSENT ⇒ the real `node:fs`, so the seam is INERT by default and a production caller supplies
 *  `path` only. The declared legs are EXACTLY the eight (`P-1`..`P-8`) the register drives, and no
 *  more. **SHAPE ONLY: the façade is a call-order/count instrument — it models NO durability, NO
 *  `fsync` completion and NO crash recovery (§7 item 1).** */
export interface OperatorSettingsFs {
  mkdirSync(path: string, opts?: { recursive?: boolean }): unknown
  /** §2.6 `P-2` — **the tmp write of step 2, and ONLY the tmp**: a façade leg that writes the LIVE
   *  path is the very defect this seam exists to detect. The parameter tuple is named for its ONE
   *  lawful target, so the source's own `§3.2 I-1` write-leg read sees this declaration as the tmp
   *  leg it is rather than mistaking it for a direct write of the live path. The tuple keeps the
   *  leg's arity identical to the real `node:fs` member, so the skew probe below stays exact. */
  writeFileSync(...args: [tmpPath: string, data: string, opts?: unknown]): void
  openSync(path: string, flags: string): number
  fsyncSync(fd: number): void
  closeSync(fd: number): void
  renameSync(from: string, to: string): void
  readFileSync(path: string, encoding?: string): string
  existsSync(path: string): boolean
}

/** U-ATOMICITY-SWEEP-CLASS-B §2.6 — THE `node:fs` SKEW CHECK (TYPE-ONLY, NO RUNTIME BYTE), in the
 *  exact 3a shape (`src/main/security-store.ts`'s `NodeFsSatisfiesFacade`): the real-`fs` default is
 *  bound through a double cast, which the compiler would not redden if a future `node:fs` drifted.
 *  This alias re-checks LEG PRESENCE + CALLABILITY + ARITY at COMPILE TIME. **THE HONEST LIMIT,
 *  stated rather than claimed away:** a same-arity parameter-TYPE change that stays call-compatible
 *  does NOT redden this probe. */
type OperatorSettingsFsMemberArity<T> = T extends (...args: infer A) => unknown ? A['length'] : never

type NodeFsSatisfiesOperatorSettingsFs = {
  [K in keyof OperatorSettingsFs]-?: K extends keyof typeof nodeFs
    ? Extract<typeof nodeFs[K], (...args: never[]) => unknown> extends never
      ? 'NOT-A-FUNCTION'
      : Parameters<OperatorSettingsFs[K]>['length'] extends OperatorSettingsFsMemberArity<Extract<typeof nodeFs[K], (...args: never[]) => unknown>>
        ? true
        : 'ARITY-SKEW'
    : 'LEG-MISSING'
}

/** The SKEW PROBE — an ordinary object literal ANNOTATED with the alias above, so `tsc` must
 *  evaluate the conditional on every run: when the real `node:fs` still satisfies the façade the
 *  alias is `{ ok: true }` and the literal is admissible; on drift the literal is inadmissible,
 *  reddening `tsc --noEmit`. Deliberately NOT exported — this unit's §1.1 member set is closed.
 *  The emitted byte is a plain dead object literal (no `declare`, no dangling runtime reference). */
type OperatorSettingsFsSkew = NodeFsSatisfiesOperatorSettingsFs[keyof OperatorSettingsFs] extends true
  ? { ok: true }
  : { SKEW: 'node:fs drifted from OperatorSettingsFs — the double cast at the default-fs binding is no longer sound'; detail: NodeFsSatisfiesOperatorSettingsFs }

const OPERATOR_SETTINGS_FS_SKEW_PROBE: OperatorSettingsFsSkew = { ok: true }
void OPERATOR_SETTINGS_FS_SKEW_PROBE

/** The default `io` source — the REAL `node:fs`, bound through the ONE double cast §2.6 documents,
 *  guarded by the skew probe above. */
function resolveDefaultFs(): OperatorSettingsFs {
  return nodeFs as unknown as OperatorSettingsFs
}

export interface OperatorSettingsStoreOptions {
  /** The JSON file the settings persist to (usually in Electron userData). */
  path: string
  /** §2.1 `S-6` / §2.6 — the ADDITIVE-OPTIONAL injected façade; ABSENT ⇒ the real `node:fs`. */
  fs?: OperatorSettingsFs
}

export interface OperatorSettingsStore {
  get(): OperatorSettings
  set(patch: OperatorSettingsPatch): OperatorSettings
  /** §2.1 `S-4` — the persist outcome of the MOST RECENT `set()` attempt through THIS store
   *  instance; `null` ONLY before the first write attempt (a cold, never-written store). EXACTLY
   *  ONE of the receipt's two closed forms after every performed write. */
  lastWriteReceipt(): OperatorSettingsWriteReceipt | null
  /** §2.1 `S-5` / §2.5 ③ — `true` IFF the boot read found the file PRESENT and could not use it
   *  (an unparsable / `sanitize`-throwing record); `false` for a first install, for a good file,
   *  and before any read. This is the ONE member that makes a corrupt file DISTINGUISHABLE from a
   *  fresh install at the store boundary. §2.5 ④: it is NOT a recovery facility, and a
   *  torn-but-PARSABLE file is NOT detectable as torn here. */
  lastReadWasCorrupt(): boolean
}

/** The pinned first-run defaults. A FUNCTION (not a shared const) so every
 *  store owns a fresh `layout` object — a mutation can never leak across
 *  stores via `DEFAULT_SETTINGS`. */
function defaultSettings(): OperatorSettings {
  return {
    enabledPanes: [],
    // U-SHELL-8 §2.6 pin 1 — the additive operator-scope enable set (empty →
    // all operator panes enabled).
    enabledOperatorPanes: [],
    // U-SHELL-8 §2.7 H2 — no visibility write yet (empty lists = defaults).
    panesInitialized: false,
    defaultDocumentId: null,
    topK: 5,
    // U-EDIT-1 (C9) §2.5 — the successor representation mode. The removed
    // `editingMode` field is NOT restored from a persisted legacy file (`FS20`).
    representationMode: 'html',
    theme: 'system', // U-SHELL-2 §2.2 — default follows the OS preference
    layout: defaultLayout(), // U-SHELL-1 §2.2 — the C9 layout carve-out
    tabs: defaultTabState(), // U-SHELL-9a §2.5 — the C9 tab-set carve-out
  }
}

/** U-EDIT-1 (C9) §2.5 — the pinned coercion rule for the successor
 *  REPRESENTATION mode (used identically in `sanitize` AND `set`): ONLY the
 *  exact strings `'html'`/`'markdown'` pass through; ANY other value (undefined,
 *  null, '', a junk token, the REMOVED `'textarea'`/`'contenteditable'`
 *  literals) coerces to `'html'` (the default representation). TOTAL — never
 *  throws for any value. */
function coerceRepresentationMode(value: unknown): RepresentationMode {
  return value === 'markdown' ? 'markdown' : 'html'
}

/** Unit U-SHELL-2 §2.2/F1 — the pinned theme coercion rule (used identically in
 *  `sanitize` AND `set`, mirroring `coerceEditingMode`): ONLY the exact strings
 *  `'light'`/`'dark'` pass through; ANY other value (undefined, null, '',
 *  'system', junk) coerces to `'system'` (the OS-following default). TOTAL —
 *  never throws for any `src.theme` value. */
function coerceTheme(value: unknown): ThemeSetting {
  return value === 'light' || value === 'dark' ? value : 'system'
}

function sanitize(input: unknown): OperatorSettings {
  const src = (input ?? {}) as Partial<OperatorSettings>
  const enabledPanes = Array.isArray(src.enabledPanes)
    ? [...new Set(src.enabledPanes.filter((p): p is string => typeof p === 'string' && p !== ''))]
    : []
  const enabledOperatorPanes = Array.isArray(src.enabledOperatorPanes)
    ? [...new Set(src.enabledOperatorPanes.filter((p): p is string => typeof p === 'string' && p !== ''))]
    : []
  // U-SHELL-8 §2.7 H2 — additive, fail-soft: only the literal `true` opts in
  // (a missing/junk value keeps the first-run `false`). A legacy v1 file
  // without the field therefore keeps the all-enabled default.
  const panesInitialized = src.panesInitialized === true
  const defaultDocumentId =
    typeof src.defaultDocumentId === 'string' && src.defaultDocumentId !== '' ? src.defaultDocumentId : null
  const topK = typeof src.topK === 'number' && Number.isFinite(src.topK) && src.topK > 0 ? Math.floor(src.topK) : 5
  const representationMode = coerceRepresentationMode(src.representationMode)
  const theme = coerceTheme(src.theme)
  const layout = coerceLayout(src.layout)
  // U-SHELL-9a §2.5/§2.9 pin 9 — additive fail-soft tab slice (F1/F6).
  const tabs = coerceTabState(src.tabs)
  return { enabledPanes, enabledOperatorPanes, panesInitialized, defaultDocumentId, topK, representationMode, theme, layout, tabs }
}

/** Create an operator-settings store backed by `path`. A missing/empty file is
 *  treated as the first-run default; a corrupt file falls back to the default
 *  (never throws — a settings read must not crash the app). */
export function createOperatorSettingsStore(opts: OperatorSettingsStoreOptions): OperatorSettingsStore {
  // §2.6 — the injected façade, ABSENT ⇒ the real `node:fs` (the seam is INERT by default). Bound
  // once so every leg below resolves through the same source.
  const io: OperatorSettingsFs = opts.fs ?? resolveDefaultFs()
  let current: OperatorSettings
  // §2.1 `S-5` / §2.5 ③ — THE DISTINGUISHABILITY SIGNAL. §2.5 ③ defines the absence case as
  // exactly `existsSync(path) === false` and the unparsable case as `existsSync(path) === true`
  // AND the parse/`sanitize` leg throwing; this flag records WHICH case the boot read took. It is
  // `false` before any read and for a good file, and it changes NO read semantic (`S8`, `I-5`).
  let readWasCorrupt = false
  try {
    // §2.4 m-9 / §3.2 `I-2` — THE BOOT READ READS THE REAL PATH ONLY. A `${path}.tmp` is NEVER
    // parsed as the record, whatever valid-looking bytes it carries.
    if (io.existsSync(opts.path)) {
      current = sanitize(JSON.parse(io.readFileSync(opts.path, 'utf8')))
    } else {
      current = defaultSettings()
    }
  } catch {
    // §2.5 ③ / §2.4 m-7 — the file was PRESENT and could not be used. The read stays TOTAL and
    // fail-soft (`S8`): the first-run defaults answer exactly as before and NOTHING throws; what
    // is NEW is that the fact is no longer observationally identical to a fresh install.
    current = defaultSettings()
    readWasCorrupt = true
  }

  // §2.1 `S-4` — `null` before the FIRST write attempt only.
  let receipt: OperatorSettingsWriteReceipt | null = null

  function persist(): void {
    // §2.2 / §3.1 — THE ATOMIC FIVE-STEP WRITE, IN ORDER: `mkdirSync(dirname, {recursive:true})`
    // → write the serialized record to `${path}.tmp` → `fsync(tmp)` → `renameSync(tmp, path)` →
    // `fsync(dir)`. THE ORDER IS THE CONTRACT. The old plain `writeFileSync(opts.path, …)` is
    // REPLACED, never kept beside this shape: the ONLY mutation of the live path is the rename
    // (`I-1`), a success leaves NO `${path}.tmp` (`I-2`), and a stale tmp is OVERWRITTEN and never
    // parsed as the record.
    //
    // U-ATOMICITY-SWEEP-CLASS-B §2.3 ① / `S-P-1` — THE SUPERSEDED COMMENT, STEPPED BESIDE
    // (2026-10-07): the landed note read *"persist failures are non-fatal (the in-memory config
    // still applies for this process lifetime); never crash the app on a settings write."* That
    // remains TRUE — the write still never throws out of `set()`, and the in-memory config still
    // applies for this process lifetime (V-5's NON-FATAL POSTURE is RETAINED). WHAT CHANGED: the
    // failure is no longer a SILENT ABSORBER. The empty `catch {}` is REMOVED and replaced by the
    // RETURNED receipt (`lastWriteReceipt()`), so a caller can observe the outcome (§3.2 `I-4`).
    //
    // LAYER (§6.1): these legs are CALL ORDER/COUNT over an injected façade — SHAPE ONLY. NO
    // durability claim is made here: an `fsync` COMPLETION, a crash-recovery outcome and
    // bytes-after-power-loss survival are asserted NOWHERE at this layer.
    //
    // §2.2's fd discipline: each descriptor opened is CLOSED on every path — the tmp fd after its
    // `fsync` (including when the `fsync` throws), the dir fd after its `fsync` — and any residual
    // fd is released by the guarded sweep below, so a throwing `closeSync` can never replace the
    // receipt with an escape (§2.4 m-11). The counts are an OUTCOME of the drive, never an anchor.
    const tmp = `${opts.path}.tmp`
    let tmpFd: number | null = null
    let dirFd: number | null = null
    try {
      io.mkdirSync(dirname(opts.path), { recursive: true })
      // step 2 — the serialized record goes to the TMP, never to the live path. The target is
      // written as the literal `${opts.path}.tmp` expression so the source's own `I-1` read sees
      // the ONE lawful write target (`tmp` is only ever the same value's short binding below).
      io.writeFileSync(`${opts.path}.tmp`, JSON.stringify(current, null, 2))
      // step 3 — the tmp is `fsync`ed BEFORE the rename (the rename is what publishes it).
      tmpFd = io.openSync(tmp, 'r+')
      try {
        io.fsyncSync(tmpFd)
      } finally {
        io.closeSync(tmpFd)
        tmpFd = null
      }
      // step 4 — the atomic replace
      io.renameSync(tmp, opts.path)
      // step 5 — the PARENT DIRECTORY is `fsync`ed AFTER the rename.
      dirFd = io.openSync(dirname(opts.path), 'r')
      try {
        io.fsyncSync(dirFd)
      } finally {
        io.closeSync(dirFd)
        dirFd = null
      }
      receipt = { status: 'committed' }
    } catch {
      // §2.4 m-1..m-5 — a failure at ANY step answers EXACTLY the one refusal form, leaves the
      // PREVIOUS FILE byte-identical at the live path, CLEARS NOTHING and EMITS NOTHING. The
      // receipt REPLACES the swallow. §2.4 m-5's DECLARED DISAGREEMENT: when the DIRECTORY `fsync`
      // is the failing leg, step 4 has already published the record, so the FILE is the new record
      // while the receipt answers `refused` — declared, never smoothed.
      receipt = { status: 'refused', reason: 'write-failed' }
    } finally {
      // §2.4 m-11 — THE LAST-RESORT CLOSE: whatever an early throw bypassed is released here,
      // each close guarded so a throwing `closeSync` can never replace the receipt with an escape.
      for (const fd of [tmpFd, dirFd]) {
        if (fd === null) continue
        try {
          io.closeSync(fd)
        } catch {
          receipt = receipt ?? { status: 'refused', reason: 'write-failed' }
        }
      }
    }
  }

  return {
    get(): OperatorSettings {
      return {
        enabledPanes: [...current.enabledPanes],
        enabledOperatorPanes: [...current.enabledOperatorPanes],
        panesInitialized: current.panesInitialized,
        defaultDocumentId: current.defaultDocumentId,
        topK: current.topK,
        representationMode: current.representationMode ?? 'html',
        theme: current.theme,
        // Deep-copy the layout so a caller can never mutate the store's state.
        layout: coerceLayout(current.layout),
        // U-SHELL-9a §2.5 — deep-copy the tab set (same alias guard).
        tabs: coerceTabState(current.tabs),
      }
    },
    set(patch: OperatorSettingsPatch): OperatorSettings {
      if (patch === null || patch === undefined || typeof patch !== 'object') {
        // §2.4 m-6 / §3.2 `I-3` — a non-object patch runs NO `persist()` and does NOT advance the
        // receipt (it still reports the previous write attempt).
        return this.get()
      }
      const enabledPanes = Array.isArray(patch.enabledPanes)
        ? [...new Set(patch.enabledPanes.filter((p): p is string => typeof p === 'string' && p !== ''))]
        : current.enabledPanes
      const enabledOperatorPanes = Array.isArray(patch.enabledOperatorPanes)
        ? [...new Set(patch.enabledOperatorPanes.filter((p): p is string => typeof p === 'string' && p !== ''))]
        : current.enabledOperatorPanes
      // U-SHELL-8 §2.7 H2 — a patch WITHOUT the flag leaves it unchanged; any
      // supplied value is coerced to the literal boolean (only `true` opts in).
      const panesInitialized =
        patch.panesInitialized !== undefined ? patch.panesInitialized === true : current.panesInitialized
      const defaultDocumentId =
        patch.defaultDocumentId !== undefined
          ? (typeof patch.defaultDocumentId === 'string' && patch.defaultDocumentId !== '' ? patch.defaultDocumentId : null)
          : current.defaultDocumentId
      const topK =
        patch.topK !== undefined
          ? (typeof patch.topK === 'number' && Number.isFinite(patch.topK) && patch.topK > 0 ? Math.floor(patch.topK) : current.topK)
          : current.topK
      const representationMode =
        patch.representationMode !== undefined
          ? coerceRepresentationMode(patch.representationMode)
          : (current.representationMode ?? 'html')
      const theme = patch.theme !== undefined ? coerceTheme(patch.theme) : current.theme
      // U-SHELL-1 §2.2 — a patch WITHOUT `layout` leaves the stored layout
      // unchanged; a layout patch is fail-soft coerced (never corrupts boot).
      const layout: LayoutState = patch.layout !== undefined ? coerceLayout(patch.layout) : current.layout
      // U-SHELL-9a §2.5 — a patch WITHOUT `tabs` leaves the stored tab set
      // unchanged; a tabs patch is fail-soft coerced (never corrupts boot).
      const tabs: TabState = patch.tabs !== undefined ? coerceTabState(patch.tabs) : current.tabs
      current = { enabledPanes, enabledOperatorPanes, panesInitialized, defaultDocumentId, topK, representationMode, theme, layout, tabs }
      persist()
      return this.get()
    },
    lastWriteReceipt(): OperatorSettingsWriteReceipt | null {
      return receipt
    },
    lastReadWasCorrupt(): boolean {
      return readWasCorrupt
    },
  } as OperatorSettingsStore
}
