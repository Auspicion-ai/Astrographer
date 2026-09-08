// src/main/rag-store-registry-write.ts — Unit U-H1: the registry WRITE module
// (docs/specs/unit-h1-registry-write.md §5; the review §2 D2/D3/D4/D5/D8 +
// A-P2-3; the decision rows REGISTRY-WRITE-MODULE, REGISTRY-ATOMIC-WRITE,
// REGISTRY-RELOAD-ON-WRITE, REGISTRY-WRITE-FAILS-LOUD, REGISTRY-DELTA-RETURN).
//
// PURE validate + atomic temp->fsync->rename disk write + a combined
// load-current -> mutate -> persist -> re-load entry point. The ONLY loader
// seam consumed is `resolveRegistry` (for fail-loud validation) plus
// `loadRagStoreRegistry` for the final re-load of the combined write. The
// loader stays read-only and byte-unchanged; REGISTRY-NO-WRITE is refined to
// be per-module (A-P2-3).
//
// NO Electron, NO store/engine import, NO IPC, NO MCP (D6). Purity: the pure
// validate+derive functions perform NO I/O, never mutate any input object or
// array, and are deterministic. The only I/O in the module is
// `persistRagStoreRegistry` and the disk-read/re-load steps of
// `writeRegistryMutation`. The module holds NO mutable state between calls.
//
// Structural no-REMOVE pin (D3, §5.1): the import set holds the WRITE, rename
// and fsync primitives but NO removal or truncation primitive — the module can
// write the registry file but structurally CANNOT delete or truncate any other
// file, so a hot-remove can never touch a store's persistence file or journal.

import {
  writeFileSync,
  renameSync,
  mkdirSync,
  existsSync,
  readFileSync,
  statSync,
  openSync,
  fsyncSync,
  closeSync,
} from 'node:fs'
import { dirname } from 'node:path'
import { resolveRegistry, loadRagStoreRegistry } from './rag-store-registry.js'
import type { RagStoreConfig, ResolvedRagStoreRegistry } from './rag-store-registry.js'
import type { LoadedRagStoreRegistry } from './rag-store-registry.js'

/** The mutation the operator requests. Exactly ONE of the kinds.
 *  'add' appends a new store; 'remove' unregisters a store BY NAME (orphan —
 *  D3: the persistence file + journal are NEVER touched by this module);
 *  'rename' renames a store, restricted to NON-default stores (D4/D5);
 *  'setDefault' (Unit U-H7) flips `default:true` onto the named store;
 *  'renameDefault' (Unit U-H7) renames the CURRENT default preserving its
 *  `default:true` (the SANCTIONED default-rename — the legacy 'rename' branch's
 *  `W-rename-default` guard is UNCHANGED). */
export type RegistryMutation =
  | { kind: 'add'; store: RagStoreConfig }
  | { kind: 'remove'; name: string }
  | { kind: 'rename'; from: string; to: string }
  | { kind: 'setDefault'; name: string }
  | { kind: 'renameDefault'; to: string }

/** The delta the runtime controller (U-H2) applies — NOT this module's job.
 *  Always exactly ONE non-empty member (a single mutation is one delta entry).
 *  Unit U-H7 adds the `defaultChanged` member: present (with `[name]`) ONLY on a
 *  `setDefault` delta and (with `[to]`) ONLY on a `renameDefault` delta; it is
 *  ABSENT on the add/remove/rename deltas so the LANDED U-H2/U-H4/U-H6 exact-
 *  delta assertions stay green (§5.9 — those suites are NOT re-pinned). */
export interface RegistryDelta {
  added: string[]
  removed: string[]
  renamed: { from: string; to: string }[]
  defaultChanged?: string[]
}

/** The pure validate+derive output. `registry` is the new RESOLVED state (the
 *  loader's output shape the runtime consumes); `configs` is the new config
 *  array in a form ready for `persistRagStoreRegistry` (only the pinned
 *  fields, derived/absent fields preserved); `delta` is the structural delta. */
export interface RegistryMutationResult {
  registry: ResolvedRagStoreRegistry
  configs: RagStoreConfig[]
  delta: RegistryDelta
}

/** The combined write entry the runtime controller calls. `loaded` is the
 *  FRESH LoadedRagStoreRegistry re-read from the just-written file (the
 *  persisted-and-live round-trip guarantee, D2); `delta` is the applied delta. */
export interface RegistryWriteResult {
  loaded: LoadedRagStoreRegistry
  delta: RegistryDelta
}

const WRITE_PREFIX = 'rag-store-registry-write:'
function msg(text: string): string {
  return `${WRITE_PREFIX} ${text}`
}

/** The `<json>` rendering used by the write module's byte-pinned messages —
 *  a local copy of the loader's TOTAL + CAPPED `jsonOf` discipline (§5.5):
 *  a throwing `JSON.stringify` renders `String(value)`; anything over 200 chars
 *  renders as its first 197 chars + `…`. */
function jsonOf(value: unknown): string {
  let rendered: string
  try {
    rendered = JSON.stringify(value)
  } catch {
    rendered = String(value)
  }
  if (rendered === undefined) {
    return 'undefined'
  }
  return rendered.length > 200 ? `${rendered.slice(0, 197)}…` : rendered
}

/** Re-emit ONLY the pinned fields (drop `embedder` and any unknown keys) into
 *  a FRESH object. Field-presence rule (uniform): a field is present iff its
 *  value is `!== undefined`. Never mutates the input entry. */
function normalizeConfig(entry: unknown): RagStoreConfig {
  const f = entry as Record<string, unknown>
  const out: Record<string, unknown> = {}
  out.name = f.name
  if (f.default !== undefined) out.default = f.default
  if (f.persistenceFile !== undefined) out.persistenceFile = f.persistenceFile
  if (f.corpusRoot !== undefined) out.corpusRoot = f.corpusRoot
  return out as unknown as RagStoreConfig
}

/** Add-path normalization (the F-H1-1 fix): re-emit ONLY the pinned fields
 *  (like `normalizeConfig`) so a stray UNKNOWN key on the added store cannot
 *  survive into `configs` / the persisted file. `embedder` is deliberately
 *  PRESERVED verbatim so the candidate validation can still fire F10
 *  (per-store embedder is pinned fail-loud, §5.6 F6) — it is a KNOWN but
 *  unsupported field, never a stray key. */
function normalizeAddStore(entry: unknown): RagStoreConfig {
  const f = entry as Record<string, unknown>
  const out = normalizeConfig(entry) as unknown as Record<string, unknown>
  if (f.embedder !== undefined) out.embedder = f.embedder
  return out as unknown as RagStoreConfig
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** PURE validate + derive. Validates the EXISTING registry (the loader's
 *  rules), applies the mutation to a FRESH copy of its config array, validates
 *  the CANDIDATE (the loader's rules again, incl. F13/F14), and returns the
 *  new resolved registry + the new configs + the delta. Never mutates `parsed`
 *  or any of its arrays/objects. Never touches the filesystem.
 *  A NON-EMPTY bare stores array is accepted as `parsed` (a convenience form —
 *  `applyRegistryMutation(addResult.configs, ...)` chains configs directly). */
export function applyRegistryMutation(
  parsed: unknown,
  registryDir: string,
  mutation: RegistryMutation,
  reservedPath?: string,
): RegistryMutationResult {
  // 1. Guard (mutation).
  if (!isObject(mutation)) {
    throw new Error(msg('mutation required'))
  }
  const kind = mutation.kind
  if (
    kind !== 'add' &&
    kind !== 'remove' &&
    kind !== 'rename' &&
    kind !== 'setDefault' &&
    kind !== 'renameDefault'
  ) {
    throw new Error(msg(`unknown mutation kind '${jsonOf(kind)}'`))
  }

  // The parsed may be either a full registry object or a bare non-empty stores
  // array (the round-trip convenience form). An EMPTY array stays an array and
  // therefore trips the loader's F1 (a registry that is an object).
  const arrayForm = Array.isArray(parsed) && parsed.length !== 0
  const effectiveParsed: unknown = arrayForm ? { version: 1, stores: parsed as unknown[] } : parsed

  // 2. Validate the EXISTING registry (fail-loud — the loader's messages
  //    propagate unchanged).
  const existing = resolveRegistry(effectiveParsed, registryDir, reservedPath)

  // 3. Extract the current configs as a fresh, normalized deep copy.
  const rawStores = arrayForm
    ? (parsed as unknown[])
    : ((effectiveParsed as { stores?: unknown }).stores as unknown[])
  const currentConfigs: RagStoreConfig[] = rawStores.map(normalizeConfig)
  const currentNames: string[] = currentConfigs.map((c) => c.name)

  // 4. Semantic checks (the write module's OWN byte-pinned messages), checked
  //    BEFORE candidate validation.
  let candidate: RagStoreConfig[]
  let delta: RegistryDelta
  if (kind === 'add') {
    const store = mutation.store
    if (!isObject(store)) {
      throw new Error(msg('add store required'))
    }
    const name = String(store.name)
    if (currentNames.includes(name)) {
      throw new Error(msg(`store '${name}' already exists`))
    }
    candidate = [...currentConfigs, normalizeAddStore(store)]
    delta = { added: [name], removed: [], renamed: [] }
  } else if (kind === 'remove') {
    const name = String(mutation.name)
    if (!currentNames.includes(name)) {
      throw new Error(msg(`cannot remove unknown store '${name}'`))
    }
    candidate = currentConfigs.filter((c) => c.name !== name)
    delta = { added: [], removed: [name], renamed: [] }
  } else if (kind === 'rename') {
    const from = String(mutation.from)
    const to = String(mutation.to)
    if (!currentNames.includes(from)) {
      throw new Error(msg(`cannot rename unknown store '${from}'`))
    }
    if (currentNames.includes(to)) {
      throw new Error(msg(`store '${from}' cannot be renamed to '${to}': '${to}' already exists`))
    }
    if (from === existing.defaultStoreName) {
      throw new Error(msg('the default store cannot be renamed (default reassignment is a separate unit)'))
    }
    candidate = currentConfigs.map((c) => (c.name === from ? { ...c, name: to } : c))
    delta = { added: [], removed: [], renamed: [{ from, to }] }
  } else if (kind === 'setDefault') {
    const name = String(mutation.name)
    if (!currentNames.includes(name)) {
      throw new Error(msg(`cannot set unknown store '${name}' as default`))
    }
    if (name === existing.defaultStoreName) {
      throw new Error(msg(`store '${name}' is already the default`))
    }
    // Flip `default:true` off the current default onto `name` — exactly ONE
    // default remains (the loader's Pass-C re-validates cleanly).
    candidate = currentConfigs.map((c) => ({ ...c, default: c.name === name }))
    delta = { added: [], removed: [], renamed: [], defaultChanged: [name] }
  } else {
    // renameDefault — the SANCTIONED default-rename: rename the CURRENT default
    // preserving its `default:true` (it stays default under the new name).
    const to = String(mutation.to)
    const from = existing.defaultStoreName
    if (currentNames.includes(to)) {
      throw new Error(msg(`store '${from}' cannot be renamed to '${to}': '${to}' already exists`))
    }
    if (to === from) {
      throw new Error(msg(`store '${from}' cannot be renamed to '${to}': '${to}' already exists`))
    }
    candidate = currentConfigs.map((c) => (c.name === from ? { ...c, name: to, default: true } : c))
    delta = { added: [], removed: [], renamed: [{ from, to }], defaultChanged: [to] }
  }

  // 5. Validate the CANDIDATE (any loader F-rule propagates unchanged). The
  //    `registry` is fresh (resolveRegistry constructs new objects) — a caller
  //    mutating it cannot affect the input or any later result.
  const registry = resolveRegistry({ version: 1, stores: candidate }, registryDir, reservedPath)

  // 8. Return.
  return { registry, configs: candidate, delta }
}

/** ATOMIC persist of a validated registry config array to `path`:
 *  mkdir(recursive) -> writeFileSync(tmp) -> fsync(tmp) -> renameSync(tmp, path).
 *  Validates `configs` via `resolveRegistry(..., dirname(path), path)` FIRST
 *  (an invalid registry can never reach the disk; F14 fires if a store's path
 *  is the registry file itself). THROWS on ANY failure (native fs Error) —
 *  never swallows (§4 REGISTRY-WRITE-FAILS-LOUD). A failed write leaves the
 *  original file intact. */
export function persistRagStoreRegistry(path: string, configs: RagStoreConfig[]): void {
  if (typeof path !== 'string' || path === '') {
    throw new Error(msg('path required'))
  }
  if (!Array.isArray(configs)) {
    throw new Error(msg('configs required'))
  }
  // Validate FIRST (nothing invalid reaches the disk; F14 with reservedPath =
  // path catches a store file resolving onto the registry file itself).
  resolveRegistry({ version: 1, stores: configs }, dirname(path), path)
  // Atomic write (pinned order).
  mkdirSync(dirname(path), { recursive: true })
  const tmp = path + '.tmp'
  writeFileSync(tmp, JSON.stringify({ version: 1, stores: configs }, null, 2))
  const fd = openSync(tmp, 'r')
  try {
    fsyncSync(fd)
  } finally {
    closeSync(fd)
  }
  renameSync(tmp, path)
}

/** The combined hot-apply entry: read CURRENT disk configs (fail-loud on
 *  corrupt) -> apply the mutation (pure) -> persist atomically -> RE-LOAD the
 *  written file. Returns the fresh loaded registry + the delta. This is the
 *  D2 "persisted-and-live never diverge" guarantee. */
export function writeRegistryMutation(opts: { path: string; mutation: RegistryMutation }): RegistryWriteResult {
  if (!isObject(opts) || typeof opts.path !== 'string' || opts.path === '') {
    throw new Error(msg('path required'))
  }
  const path = opts.path
  const registryDir = dirname(path)

  // 2. Read the CURRENT disk configs (fail-loud — never the implicit form on a
  //    corrupt file; R5).
  let current: RagStoreConfig[]
  if (existsSync(path)) {
    let parsed: unknown
    try {
      // A non-regular file (FIFO / device) is unreadable. Stat probe sits in
      // the SAME try/catch as read+parse so a stat RACE (file removed between
      // existsSync and statSync) lands on the pinned W-unreadable message, not
      // a raw native ENOENT.
      if (!statSync(path).isFile()) {
        throw new Error(msg(`registry file unreadable (${path}); refusing to mutate a corrupt registry`))
      }
      // F-MS1-1 discipline: strip exactly ONE leading U+FEFF before JSON.parse.
      const text = readFileSync(path, 'utf8')
      const textSansBom = text.startsWith('\uFEFF') ? text.slice(1) : text
      parsed = JSON.parse(textSansBom)
    } catch {
      throw new Error(msg(`registry file unreadable (${path}); refusing to mutate a corrupt registry`))
    }
    // Present but invalid => the loader's F-message PROPAGATES (F25 — never
    // mutated from an invalid start).
    resolveRegistry(parsed, registryDir, path)
    current = ((parsed as { stores?: unknown }).stores as unknown[]) as unknown as RagStoreConfig[]
  } else {
    // Absent file => the loader's implicit form, in memory (D3 first-write).
    current = [{ name: 'main', default: true }]
  }

  // 3. Mutate (pure) — the thread of the reserved path means F14 (a new store
  //    file resolving onto the registry file itself) fails here.
  const result = applyRegistryMutation({ version: 1, stores: current }, registryDir, opts.mutation, path)

  // 4. Persist atomically.
  persistRagStoreRegistry(path, result.configs)

  // 5. RE-LOAD the just-written valid file (the D2 round-trip). A non-valid
  //    write would throw here, pinning the invariant that the load is always
  //    implicit:false / corrupt:false.
  const loaded = loadRagStoreRegistry({ path })

  // 6. Return.
  return { loaded, delta: result.delta }
}

/** Named PURE convenience — thin wrapper over `applyRegistryMutation`. */
export function addRegistryStore(
  parsed: unknown,
  registryDir: string,
  store: RagStoreConfig,
  reservedPath?: string,
): RegistryMutationResult {
  if (!isObject(store)) {
    throw new Error(msg('add store required'))
  }
  return applyRegistryMutation(parsed, registryDir, { kind: 'add', store }, reservedPath)
}

function requireName(value: unknown, param: string): string {
  if (typeof value !== 'string' || value === '') {
    throw new Error(msg(`${param} required`))
  }
  return value
}

/** Named PURE convenience — thin wrapper over `applyRegistryMutation`. */
export function removeRegistryStore(
  parsed: unknown,
  registryDir: string,
  name: string,
  reservedPath?: string,
): RegistryMutationResult {
  const n = requireName(name, 'name')
  return applyRegistryMutation(parsed, registryDir, { kind: 'remove', name: n }, reservedPath)
}

/** Named PURE convenience — thin wrapper over `applyRegistryMutation`. */
export function renameRegistryStore(
  parsed: unknown,
  registryDir: string,
  from: string,
  to: string,
  reservedPath?: string,
): RegistryMutationResult {
  const f = requireName(from, 'from')
  const t = requireName(to, 'to')
  return applyRegistryMutation(parsed, registryDir, { kind: 'rename', from: f, to: t }, reservedPath)
}

/** Named PURE convenience — thin wrapper over `applyRegistryMutation` for the
 *  default flip (Unit U-H7). `delta.defaultChanged === [name]`. */
export function setDefaultRegistryStore(
  parsed: unknown,
  registryDir: string,
  name: string,
  reservedPath?: string,
): RegistryMutationResult {
  const n = requireName(name, 'name')
  return applyRegistryMutation(parsed, registryDir, { kind: 'setDefault', name: n }, reservedPath)
}

/** Named PURE convenience — thin wrapper over `applyRegistryMutation` for the
 *  default's SANCTIONED rename (Unit U-H7). `delta.renamed === [{ from, to }]`
 *  AND `delta.defaultChanged === [to]` (the default stays default). */
export function renameDefaultRegistryStore(
  parsed: unknown,
  registryDir: string,
  to: string,
  reservedPath?: string,
): RegistryMutationResult {
  const t = requireName(to, 'to')
  return applyRegistryMutation(parsed, registryDir, { kind: 'renameDefault', to: t }, reservedPath)
}
