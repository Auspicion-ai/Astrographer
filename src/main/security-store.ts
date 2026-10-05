// src/main/security-store.ts — the manual-UI security settings persistence
// store (docs/specs/mcp-endpoint.md §6.4). Loads a SecuritySettings JSON from
// a path, defaults to `read`+`dispatch` ON / `graph`+`code` OFF / token null
// on first run, and persists changes write-through so reload/restart restores
// them. This is the main-process owner of the config the Settings pane reads
// and the MCP server gate reflects.
import * as nodeFs from 'node:fs'
import { dirname } from 'node:path'
import type { SecuritySettings } from '../shared/types.js'

/** U-STORE-SECURITY-WRITE §1.1 member 2 / §2.2 — THE PERSIST RECEIPT, homed HERE
 *  (self-contained, EXPORTED, NO import — ruling `A-3A-1` ①; `src/shared/types.ts` IS
 *  NOT MOVED by this unit). EXACTLY ONE of the TWO CLOSED forms exists after EVERY
 *  performed write; THE REASON SET IS CLOSED at the single token `'write-failed'`,
 *  which covers the tmp-write, the `fsync` and the rename failure points alike. It is
 *  NEVER a member of a store refusal union (`K-2`: the channel's tokens are the
 *  channel's). `SecuritySettings` itself is NOT widened — the `write` member belongs to
 *  the IPC RESPONSE record, not to the persisted type. */
export type SecurityWriteReceipt = { readonly status: 'committed' } | { readonly status: 'refused'; readonly reason: 'write-failed' }

/** U-STORE-SECURITY-WRITE §2.1 `S-5` — THE INJECTED `fs` FAÇADE (ADDITIVE-OPTIONAL).
 *  ABSENT ⇒ the real `node:fs`, so the seam is INERT by default and a production caller
 *  never injects one. The declared legs are `renameSync` · `fsyncSync` · `mkdirSync` ·
 *  the tmp write, plus the read/`existsSync` legs the boot read uses. **SHAPE ONLY: the
 *  façade is a call-order/count instrument — it models NO durability, NO `fsync`
 *  completion and NO crash recovery (§6's honesty block).** */
export interface SecurityStoreFs {
  mkdirSync(path: string, opts?: { recursive?: boolean }): unknown
  writeFileSync(path: string, data: string, opts?: unknown): void
  openSync(path: string, flags: string): number
  fsyncSync(fd: number): void
  closeSync(fd: number): void
  renameSync(from: string, to: string): void
  readFileSync(path: string, encoding?: string): string
  existsSync(path: string): boolean
}

export interface SecurityStoreOptions {
  /** The JSON file the settings persist to (usually in Electron userData). */
  path: string
  /** §2.1 `S-5` — the ADDITIVE-OPTIONAL injected façade; ABSENT ⇒ the real `node:fs`.
   *  ADDITIVE means a production caller supplies only `path` and never injects one. */
  fs?: SecurityStoreFs
}

export interface SecurityStore {
  get(): SecuritySettings
  set(patch: { token?: string | null; groups?: string[]; disable?: string[]; maxJournalLength?: number | null }): SecuritySettings
  /** §2.1 `S-4` — the persist outcome of the MOST RECENT `set()` attempt through THIS
   *  store instance; `null` ONLY before the first write attempt (a cold, never-written
   *  store). EXACTLY ONE of the receipt's two closed forms after every performed write. */
  lastWriteReceipt(): SecurityWriteReceipt | null
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
// ToolGroup union (read/dispatch/graph/code/module/rag/edit + gnosis/gnosis-edit).
// Omitting a group here would make the manual-UI settings pane the only path to
// enable groups silently DROP that group's toggle (set() filters against this
// list), permanently disabling its MCP tools in the running app.
const VALID_GROUPS = new Set(['read', 'dispatch', 'graph', 'code', 'module', 'rag', 'edit', 'gnosis', 'gnosis-edit'])

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
  // §2.1 `S-5` — the injected façade, ABSENT ⇒ the real `node:fs` (the seam is INERT by
  // default). Bound once so every leg below resolves through the same source.
  const io: SecurityStoreFs = opts.fs ?? (nodeFs as unknown as SecurityStoreFs)
  let current: SecuritySettings
  try {
    // §2.4 item 3(c) / I-2 — THE BOOT READ READS THE REAL PATH ONLY. A `${path}.tmp` is
    // NEVER parsed as the record, and a missing or corrupt file both answer the first-run
    // default with NOTHING thrown (I-3).
    if (io.existsSync(opts.path)) {
      current = sanitize(JSON.parse(io.readFileSync(opts.path, 'utf8')))
    } else {
      current = { token: null, enabled: ['read', 'dispatch'], maxJournalLength: undefined }
    }
  } catch {
    current = { token: null, enabled: ['read', 'dispatch'], maxJournalLength: undefined }
  }

  // §2.1 `S-4` — `null` before the FIRST write attempt only.
  let receipt: SecurityWriteReceipt | null = null

  function persist(): void {
    // §2.4 items 1-2 — THE ATOMIC FIVE-STEP WRITE, IN ORDER: `mkdirSync(dirname,
    // {recursive:true})` → write the serialized settings to `${path}.tmp` → `fsync(tmp)` →
    // `renameSync(tmp, path)` → `fsync(dir)`. This REPLACES the old plain `writeFileSync`,
    // which is never kept beside it: the rename is atomic on one filesystem, so a torn file
    // at the real path is impossible by construction, and a FAILED write leaves the previous
    // file intact (I-1).
    //
    // U-STORE-SECURITY-WRITE §2.4 item 5 — THE SUPERSEDED COMMENT, STEPPED BESIDE
    // (2026-10-04): the landed note read *"persist failures are non-fatal … never crash the
    // app on a settings write"*. That remains TRUE — the write still never throws out of
    // `set()` — but the failure is now DECLARED rather than swallowed: the outcome is
    // ANSWERED as a receipt (`lastWriteReceipt()`), so a caller can observe it. The old
    // `catch { … console.error }` swallow is REMOVED (§2.4 item 4): a persist failure the
    // caller cannot observe is a finding.
    //
    // LAYER (§6): these legs are CALL ORDER/COUNT only. NO durability claim — a real `fsync`
    // completion or a crash-recovery outcome is asserted NOWHERE at this layer.
    const tmp = `${opts.path}.tmp`
    try {
      io.mkdirSync(dirname(opts.path), { recursive: true })
      io.writeFileSync(tmp, JSON.stringify(current, null, 2))
      // step 3 — the tmp is `fsync`ed BEFORE the rename (the rename is what publishes it)
      io.fsyncSync(io.openSync(tmp, 'r+'))
      // step 4 — the atomic replace
      io.renameSync(tmp, opts.path)
      // step 5 — the PARENT DIRECTORY is `fsync`ed AFTER the rename, so the rename itself
      // is durable at the directory level
      io.fsyncSync(io.openSync(dirname(opts.path), 'r'))
      receipt = { status: 'committed' }
    } catch {
      // §2.4 item 6 — THE FAIL-STATES: a failed tmp write, `fsync` or rename leaves the
      // PREVIOUS FILE INTACT (and possibly a stale tmp, which is overwritten next and never
      // parsed); a refusal CLEARS NOTHING, EMITS NOTHING and never throws. The receipt
      // REPLACES the swallow.
      receipt = { status: 'refused', reason: 'write-failed' }
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
    lastWriteReceipt(): SecurityWriteReceipt | null {
      return receipt
    },
  } as SecurityStore
}
