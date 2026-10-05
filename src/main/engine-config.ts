// src/main/engine-config.ts — Unit GN-MCP-UI §5.4 A4: the Gnosis-engine
// `baseUrl` config seam. A config VALUE (NOT a credential) persisted to userData
// like the operator-settings store. This is STEP 1 of the `resolveEngineBaseUrl`
// priority (config seam → env `PROVIDENT_ENGINE_BASE_URL` → default
// `http://127.0.0.1:8080`): when the config value is SET it wins. `baseUrl` is
// env/CLI config — NOT a GUI-only secret and NOT an MCP tool arg (§5.2/A7).
//
// The module exposes a lightweight in-memory registry (`getEngineConfigBaseUrl`/
// `setEngineConfigBaseUrl`) so the 0-arity `resolveEngineBaseUrl()` (main.ts)
// reads the seam without a parameter; the persistent store backs that value so
// a re-launch restores an operator-set override.
import * as nodeFs from 'node:fs'
import { dirname } from 'node:path'

/** The engine baseUrl config (a nullable override; null = unset → env/default). */
export interface EngineConfig {
  engineBaseUrl: string | null
  /** U-ATOMICITY-SWEEP-CLASS-B §2.5 ③ — THE PERSISTED CONFLICT MARKER. This carrier has NO
   *  reader channel (§2.3 ②: no IPC return, no renderer surface, the registry and the in-memory
   *  holder are not readers of the WRITE), so it mints NO receipt member; its read-path
   *  distinguishability is a property of THE FILE instead. Once a boot read finds the record
   *  PRESENT and unusable, the NEXT SUCCESSFUL write records that fact here, so it survives the
   *  process and is readable by main at the next boot without a member no caller would read. It is
   *  ABSENT on a clean boot (the signal is caused, never unconditional) and it is NEVER part of
   *  the unsanitized first-run default. */
  readConflict?: true
}

/** U-ATOMICITY-SWEEP-CLASS-B §2.1 `S-6` / §2.6 — THE INJECTED `fs` FAÇADE (ADDITIVE-OPTIONAL;
 *  this carrier's OWN declaration, no import from `src/main/security-store.ts` — §3.2 `I-11`).
 *  ABSENT ⇒ the real `node:fs`, so the seam is INERT by default. **SHAPE ONLY: a call-order/count
 *  instrument — NO durability, NO `fsync` completion, NO crash recovery (§7 item 1).** */
export interface EngineConfigFs {
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

/** §2.6 — THE `node:fs` SKEW CHECK (TYPE-ONLY, NO RUNTIME BYTE), the 3a shape. LEG PRESENCE +
 *  CALLABILITY + ARITY per declared member; a same-arity parameter-TYPE change that stays
 *  call-compatible does NOT redden it (the honest limit, stated rather than claimed away). */
type EngineConfigFsMemberArity<T> = T extends (...args: infer A) => unknown ? A['length'] : never

type NodeFsSatisfiesEngineConfigFs = {
  [K in keyof EngineConfigFs]-?: K extends keyof typeof nodeFs
    ? Extract<typeof nodeFs[K], (...args: never[]) => unknown> extends never
      ? 'NOT-A-FUNCTION'
      : Parameters<EngineConfigFs[K]>['length'] extends EngineConfigFsMemberArity<Extract<typeof nodeFs[K], (...args: never[]) => unknown>>
        ? true
        : 'ARITY-SKEW'
    : 'LEG-MISSING'
}

type EngineConfigFsSkew = NodeFsSatisfiesEngineConfigFs[keyof EngineConfigFs] extends true
  ? { ok: true }
  : { SKEW: 'node:fs drifted from EngineConfigFs — the double cast at the default-fs binding is no longer sound'; detail: NodeFsSatisfiesEngineConfigFs }

/** The SKEW PROBE — an annotated object literal, so `tsc` evaluates the conditional on every run.
 *  Not exported (this unit's member set is closed); the emitted byte is a plain dead literal. */
const ENGINE_CONFIG_FS_SKEW_PROBE: EngineConfigFsSkew = { ok: true }
void ENGINE_CONFIG_FS_SKEW_PROBE

/** The default `io` source — the REAL `node:fs`, bound through the ONE double cast §2.6 documents. */
function resolveDefaultFs(): EngineConfigFs {
  return nodeFs as unknown as EngineConfigFs
}

export interface EngineConfigStoreOptions {
  /** The JSON file the config persists to (usually in Electron userData). */
  path: string
  /** §2.1 `S-6` / §2.6 — the ADDITIVE-OPTIONAL injected façade; ABSENT ⇒ the real `node:fs`. */
  fs?: EngineConfigFs
}

export interface EngineConfigStore {
  get(): EngineConfig
  set(baseUrl: string | null): EngineConfig
}

const DEFAULT_CONFIG: EngineConfig = { engineBaseUrl: null }

/** The pinned coercion rule: ONLY a non-empty string survives; anything else
 *  (null/undefined/number/junk/whitespace) coerces to null (the unset state). */
function sanitize(input: unknown): EngineConfig {
  const src = (input ?? {}) as Partial<EngineConfig>
  return {
    engineBaseUrl:
      typeof src.engineBaseUrl === 'string' && src.engineBaseUrl.trim() !== ''
        ? src.engineBaseUrl
        : null,
  }
}

/** Create an engine-config store backed by `path`. A missing/empty file is
 *  the unset default; a corrupt file falls back to the default (never throws —
 *  a config read must not crash the app). */
export function createEngineConfigStore(opts: EngineConfigStoreOptions): EngineConfigStore {
  // §2.6 — the injected façade, ABSENT ⇒ the real `node:fs` (INERT by default).
  const io: EngineConfigFs = opts.fs ?? resolveDefaultFs()
  let current: EngineConfig
  // §2.5 ③ / §3.2 `I-5` — THE PERSISTED DISTINGUISHABILITY SIGNAL. §2.5 ③ defines the absence
  // case as exactly `existsSync(path) === false` and the unparsable case as `existsSync(path)
  // === true` AND the parse/`sanitize` leg throwing. This carrier has NO reader member (§2.3 ②),
  // so the fact is carried INTO THE FILE on the next successful write instead of being answered
  // by a value no caller would read. The read's totality and defaults are UNCHANGED (`S8`).
  let readWasCorrupt = false
  try {
    if (io.existsSync(opts.path)) {
      current = sanitize(JSON.parse(io.readFileSync(opts.path, 'utf8')))
    } else {
      current = { ...DEFAULT_CONFIG }
    }
  } catch {
    current = { ...DEFAULT_CONFIG }
    readWasCorrupt = true
  }

  function persist(): void {
    // §2.2 / §3.1 — THE ATOMIC FIVE-STEP WRITE, IN ORDER, and it is IDENTICAL to the operator
    // carrier's shape except that this carrier answers NO receipt (§2.3 ②: NO READER ⇒ NO RECEIPT
    // MINTED; a `lastWriteReceipt`/`lastWriteOutcome` member, a `write` field or any receipt-shaped
    // return added here is a FINDING). `mkdirSync(dirname, {recursive:true})` → tmp write →
    // `fsync(tmp)` → `renameSync(tmp, path)` → `fsync(dir)`. The live path is NEVER written
    // directly (`I-1`); a success leaves NO tmp (`I-2`); a stale tmp is overwritten, never parsed.
    //
    // U-ATOMICITY-SWEEP-CLASS-B §2.3 ② / `S-P-1` — THE SUPERSEDED COMMENT, STEPPED BESIDE
    // (2026-10-07): the landed note read *"persist failures are non-fatal (the in-memory config
    // still applies for this process lifetime); never crash the app on a config write."* That
    // remains TRUE — the write still never throws out of `set()` and the in-memory config still
    // applies (V-5's NON-FATAL POSTURE is RETAINED). WHAT CHANGED: the empty `catch {}` is
    // REMOVED, and the failure is not silent-forever — a failed write is recorded on the NEXT
    // SUCCESSFUL write as the persisted conflict marker (§2.5 ③), so main can read it at the next
    // boot. **The failure is RETAINED-WITHOUT-AN-ABSORBER, never declared through a receipt**
    // (§2.3 ②'s disposition, §3.2 `I-3`).
    //
    // LAYER (§6.1): CALL ORDER/COUNT over an injected façade — SHAPE ONLY; no durability claim, no
    // `fsync`-completion claim and no crash-recovery claim is made by this file (§7 item 1).
    const tmp = `${opts.path}.tmp`
    let tmpFd: number | null = null
    let dirFd: number | null = null
    let writeFailed = false
    try {
      io.mkdirSync(dirname(opts.path), { recursive: true })
      // step 2 — the serialized record goes to the TMP, never to the live path (the literal
      // `${opts.path}.tmp` expression is written out so the source's own `I-1` read sees the ONE
      // lawful write target).
      io.writeFileSync(`${opts.path}.tmp`, JSON.stringify(record(), null, 2))
      // step 3 — `fsync(tmp)` BEFORE the rename.
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
      // §2.5 ③ — THE CONFLICT IS PERSISTED ON THE NEXT SUCCESSFUL WRITE ONLY: the corrupt read (or
      // a write that failed outright) is now carried in the file and can be observed at the next
      // boot without a store member, which is this carrier's whole distinguishing signal (§2.3 ②).
      if (readWasCorrupt || writeFailed) {
        current = { engineBaseUrl: current.engineBaseUrl, readConflict: true }
        // The fact is now IN THE FILE; the in-memory flags' work is done. They are cleared so the
        // marker is CAUSED by a corrupt read or a failed write, never minted unconditionally.
        readWasCorrupt = false
        writeFailed = false
      }
    } catch {
      // §2.4 m-2/m-5 / §2.3 ② — the previous file stays byte-identical, the in-memory config still
      // applies (V-5's NON-FATAL POSTURE is RETAINED), NOTHING is thrown and NOTHING is answered:
      // this carrier has NO reader, so no receipt is minted. The failure is NOT a silent absorber:
      // it is carried by the NEXT SUCCESSFUL write as the persisted conflict marker (§2.5 ③), which
      // is why the write's outcome is recorded in `writeFailed` rather than discarded here.
      writeFailed = true
    } finally {
      // §2.4 m-11 — the guarded last-resort close: a throwing `closeSync` can never escape `set()`.
      for (const fd of [tmpFd, dirFd]) {
        if (fd === null) continue
        try {
          io.closeSync(fd)
        } catch {
          // §2.4 m-11 — the write's outcome is already settled; a close failure is not a second
          // outcome, and it must never escape `set()`. Nothing to do but release the binding.
          tmpFd = null
          dirFd = null
        }
      }
    }
  }

  /** §2.2 item 2 — the serialized record. The `readConflict` marker is ADDITIVE and enters the
   *  file ONLY once a corrupt read has occurred; the `EngineConfig` payload remains the one
   *  member `engineBaseUrl` (§2.7 `C-2`), and no `schemaVersion` is minted (§1.2 item 5). */
  function record(): EngineConfig {
    return readWasCorrupt || current.readConflict === true
      ? { engineBaseUrl: current.engineBaseUrl, readConflict: true }
      : { engineBaseUrl: current.engineBaseUrl }
  }

  return {
    get(): EngineConfig {
      return { engineBaseUrl: current.engineBaseUrl }
    },
    set(baseUrl: string | null): EngineConfig {
      // §2.5 ③ — the marker is carried ACROSS the `sanitize` coercion of the new value: the
      // conflict is a fact about the READ, so a later `set` must not erase it before the write
      // that persists it. `sanitize`'s coercion rules themselves are UNCHANGED (`I-5`).
      const carried = current.readConflict === true
      current = sanitize({ engineBaseUrl: baseUrl })
      if (carried) current = { engineBaseUrl: current.engineBaseUrl, readConflict: true }
      persist()
      return this.get()
    },
  }
}

// ---- the in-memory registry `resolveEngineBaseUrl()` reads (0-arity) --------

let mountedBaseUrl: string | null = null

/** Seed the seam from a store (called at boot). null/undefined → unset. */
export function setEngineConfigBaseUrl(baseUrl: string | null | undefined): void {
  mountedBaseUrl = typeof baseUrl === 'string' && baseUrl.trim() !== '' ? baseUrl : null
}

/** The current config-seam baseUrl (null = unset → fall through to env/default). */
export function getEngineConfigBaseUrl(): string | null {
  return mountedBaseUrl
}
