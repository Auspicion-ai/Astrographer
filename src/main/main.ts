// src/main/main.ts — the Electron main process entry. Creates the BrowserWindow
// (the renderer owns the provident-ssr graph + DOM), starts the MCP server
// (stdio or Streamable HTTP), and bridges MCP tool calls to the renderer via
// IPC.
import { app, BrowserWindow, ipcMain, Menu, dialog, type MenuItemConstructorOptions } from 'electron'
import { join, basename, dirname } from 'node:path'
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, openSync, fsyncSync, closeSync } from 'node:fs'
import { IPC_INVOKE, IPC_REPLY, IPC_READY, IPC_SECURITY_GET, IPC_SECURITY_SET, IPC_NOTIFY, IPC_MODULE_GET, IPC_MODULE_SET_DISABLED, IPC_MODULE_TOOL_LIST, IPC_MODULE_TOOL_INVOKE, IPC_EDIT_COMMIT, IPC_EDIT_BATCH, IPC_EDIT_RICH_COMMIT, IPC_RAG_STORE_CHANGED, IPC_RAG_QUERY, IPC_RAG_SNAPSHOT, IPC_RAG_BACKLINKS, IPC_RAG_DOC_HEADS, IPC_RAG_STORE_LISTING, IPC_RAG_STORE_MANAGE, IPC_RAG_JOURNAL, IPC_RAG_JOURNAL_OP, IPC_TEMPLATE_GET, IPC_TEMPLATE_VALIDATE, IPC_TEMPLATE_SET, IPC_TEMPLATE_CREATE, IPC_TEMPLATE_DELETE, IPC_TEMPLATE_RESET, IPC_TEMPLATE_CHANGED, IPC_OPERATOR_SETTINGS_GET, IPC_OPERATOR_SETTINGS_SET, IPC_OPERATOR_SETTINGS_CHANGED, IPC_GNOSIS_STATUS, IPC_GNOSIS_QUERY, IPC_GNOSIS_DOCUMENTS, IPC_GNOSIS_WIKIS, IPC_PANE_CATALOG, IPC_PANE_VISIBILITY, IPC_IMPORT_RESULT, IPC_SETTINGS_OPEN, type RpcReply, type NotifyPayload, type ModuleToolInvokePayload, type EditCommitPayload, type EditBatchPayload, type EditRichCommitPayload, type RagQueryPayload, type RagBacklinksPayload, type OperatorSettingsPatch, type RagStoreChangedPayload, type ImportResultPayload, type PaneCatalogEntry } from '../shared/types.js'
import { ProvidentMcpServer, RendererBackend, handleRagQueryIpc, handleRagBacklinksIpc, handleRagDocHeadsIpc, handleRagStoreListingIpc, handleRagStoreManageIpc, handleRagJournalIpc, handleRagJournalOpIpc, handleGnosisTool, handleTemplateTool, type McpTransportKind } from './mcp-server.js'
import { createSecurityStore, gatePatchFromStoreResult, type SecurityStore } from './security-store.js'
import { createOperatorSettingsStore } from './operator-settings-store.js'
import { createEngineConfigStore, setEngineConfigBaseUrl, getEngineConfigBaseUrl } from './engine-config.js'
import { createModuleStore } from './module-store.js'
import { type BatchOp, type BatchOpResult, type RagNode } from './rag-store.js'
import { createTemplateStore } from './template-store.js'
import { buildMenuTemplate, normalizePaneCatalog, importSelectionFromDialog, type AppMenuActions } from './app-menu.js'
import { MAX_IMPORT_FILES, buildImportDialogOptions, resolveImportSelection } from './import-directory.js'
import { importMarkdownCorpus } from './markdown-import.js'
import { handleEditCommit, handleEditBatch, handleRichCommit, handleRichCommitIpc, deriveBatchBroadcast, deriveRichCommitBroadcast } from './edit-ops.js'
import { parsePositiveIntEnv, type EmbeddingProvider, type EmbeddingProviderConfig } from './embeddings.js'
import { warmUpEmbeddingProvider } from './vector-boot.js'
import { loadRagStoreRegistry } from './rag-store-registry.js'
import { buildRagStoreDirectory, storeLoadStatus } from './rag-store-directory.js'
import { createRagStoreRuntimeController } from './rag-store-runtime.js'
import { CapabilityRouter } from '../renderer/extensions.js'
import { createO0HookRecorder } from '../shared/o0-hook.js'
import { DISPLAY_CHANGED, DISPLAY_READ, DISPLAY_WRITE, STORE_FILE_GET, STORE_FILE_PUT } from './store-channels.js'

// §3.6b — the MAIN-side O-0 recorder (the optional `snapshot.clone` refinement): a
// SECOND, INDEPENDENT instance — never the RENDERER's app-wide singleton. The driver
// SPAWNS this app, so it arms the instance through the spawn env flag; a `--connect`
// run cannot arm it (recorded per leg as `driver.mainSeamArmed:false`, §6 S15).
// Unarmed it is a pure pass-through, so the handler's work, order and reply identity
// are unchanged.
//
// RUL-3 (the ruling the spec pins) — this handler span IS the right site for the
// main-side reply-payload CONSTRUCTION share, but its records are NOT transported out
// of the main process: no channel carries them into the renderer/report, and
// Electron's own structured-clone serialization of the handler's return value happens
// in the IPC internals AFTER this function returns, outside every host-side wrap. So
// `snapshot.clone` stays `structural:true` in the report with that exact reason (the
// driver records it; no value is imputed). The one change that WOULD make it measured
// (a transport channel or a reply-path hook) is not owed by O-0.
const o0MainRecorder = createO0HookRecorder({ stages: ['snapshot.clone'] })
const o0MainArmed = process.env.ASTROGRAPHER_O0_MAIN_ARM === '1'
if (o0MainArmed) {
  try {
    o0MainRecorder.arm(['snapshot.clone'])
  } catch (e) {
    console.error('[main] O-0 main-side recorder refused the arm (§3.6b)', e)
  }
}
import { syncModuleRouter } from './mcp-server.js'
import { SecurityGate, defaultSecurityConfig, enablementRequestFrom, effectiveEnabledGroups, type ToolGroup } from './security.js'
import { IPC_BOOT_READY, type BootInstallSignal } from '../shared/types.js'
import { createQueryAuditLog } from './query-audit.js'
import { createEngineRagStore, ENGINE_ORIGIN_STORE } from './engine-rag-store.js'
import { createEngineCrudRagStore } from './engine-crud-rag-store.js'
import { createEngineChangesFeed } from './engine-changes.js'
// Unit `B-4a` `engine-store-mirror` — the engine's write made VISIBLE to the store the doc-heads read (`B6-F1`'s closure).
import { createEngineMirror, type EngineMirrorDocument, type EngineMirrorRead } from './engine-mirror.js'
import { createAuthorityStore } from './authority-store.js'
import { createIdempotencyRegistry } from './idempotency-registry.js'
// `B-2` `display-wire` — THE CROSSING'S MAIN HALF (`docs/L1/unit-b-1-record-engine-seam.md` §1's scope ruling 1 named THIS
// unit as the owner of the boot's ONE construction and of the build's `--external` clause). `./storeroom.js` is the fork's ONE
// import of the store package and this file does not spell the package: the seam hands over `createProfileStore` and the
// `StoreInstance` type, and the census row on the one seam stays true.
import { createDisplayDelivery, createDisplayRecord, displayConstraintDeclarations } from './record-engine/index.js'
import { createProfileStore, type StoreInstance } from './storeroom.js'

// The main process is bundled as CJS (Electron runs it reliably that way), so
// `__dirname` is available.
const here = __dirname

function transportFromArgs(argv: string[]): McpTransportKind {
  const flag = argv.find((a) => a.startsWith('--mcp-transport='))
  if (flag) {
    const v = flag.slice('--mcp-transport='.length)
    if (v === 'http' || v === 'stdio') return v
  }
  const env = process.env.PROVIDENT_MCP_TRANSPORT
  if (env === 'http' || env === 'stdio') return env
  return 'http'
}

function portFromArgs(argv: string[]): number {
  const flag = argv.find((a) => a.startsWith('--mcp-port='))
  if (flag) {
    const v = Number(flag.slice('--mcp-port='.length))
    if (Number.isFinite(v)) return v
  }
  const env = Number(process.env.PROVIDENT_MCP_PORT)
  if (Number.isFinite(env)) return env
  return 3787
}

/** Unit F §5.7 — the retrieval embedder selection (`retrieval.embedder`).
 *  Default 'lexical'. Read from `--retrieval-embedder=` / env. */
function retrievalEmbedderFromArgs(argv: string[]): 'lexical' | 'vector' {
  const flag = argv.find((a) => a.startsWith('--retrieval-embedder='))
  if (flag) {
    const v = flag.slice('--retrieval-embedder='.length)
    if (v === 'vector' || v === 'lexical') return v
  }
  const env = process.env.PROVIDENT_RETRIEVAL_EMBEDDER
  if (env === 'vector' || env === 'lexical') return env
  return 'lexical'
}

/** U-STORE-PERSIST-ADOPT §2.9 — THE `--provident-user-data=` SEAM (this unit's
 *  OWN landing; the honest divergence record: the fork has NEITHER this seam NOR
 *  `scripts/electron-ui.mjs` at this head). It is a TEST-DRIVABILITY affordance
 *  (the live leg's precondition), never an operator surface: the flag is read
 *  from `process.argv.slice(1)` in the EXISTING argv-seam idiom
 *  (`transportFromArgs`/`portFromArgs`/`retrievalEmbedderFromArgs`).
 *
 *  DOMAIN / OUTSIDE: a non-empty ABSOLUTE path is honored; an ABSENT flag falls
 *  back to the default userData root; an EMPTY or RELATIVE value is IGNORED with
 *  a logged warning — never a throw and never a partial application (the boot
 *  proceeds on the default root). A malformed value must NOT abort the launch. */
function userDataFromArgs(argv: string[]): string | null {
  const flag = argv.find((a) => a.startsWith('--provident-user-data='))
  if (flag === undefined) return null
  const value = flag.slice('--provident-user-data='.length)
  if (value.length === 0 || !value.startsWith('/')) {
    console.error(
      `[provident-main] --provident-user-data IGNORED: the value ${value === '' ? '(empty)' : `'${value}'`} is outside the seam's domain ` +
        '(a non-empty absolute path) — the boot proceeds on the default userData root (never a throw, never a partial application)',
    )
    return null
  }
  return value
}


/** U-STORE-PERSIST-ADOPT §2.7 item 5 — THE DECLARED CURRENT VERSION of the
 *  tier-1 carrier's payload (`DECLARED-DEFAULT`). */
const STORE_SCHEMA_VERSION = 1

/** U-STORE-PERSIST-ADOPT §2.4 — THE CLOSED CHANNEL REFUSAL SET (TWO tokens, the
 *  CHANNEL's OWN — NOT members of the store's refusal union, `K-1`). The channel
 *  PROPAGATES a store refusal token VERBATIM and mints no store-class spelling of
 *  its own; a transport-level failure with no store token is a CHANNEL-class
 *  failure named by one of these two. */
type StoreChannelRefusal = 'malformed-payload' | 'write-failed'
/** §2.7 item 7 — the receipt: EXACTLY ONE of `{committed, refused}`, never a
 *  third status, never a throw, never a swallow. */
interface StoreChannelReceipt {
  status: 'committed' | 'refused'
  reason?: StoreChannelRefusal
}

/** A persisted reference row — the `Y-1` answer's element and the `Y-2`
 *  request's payload. */
interface StoreFileRow {
  name: string
  value: unknown
}

/** U-STORE-PERSIST-ADOPT §2.7 item 1 — THE CARRIER: tier 1's file is the
 *  `provident-settings.json` member of the userData root, minted at exactly ONE
 *  site. Its payload is a KEYED JSON object: keys are the `file.*` reference
 *  spellings PLUS the single reserved member `schemaVersion`;
 *  `mem.*`/`temp.*`/`secure.*` keys never land in the file. */
/** §2.7 item 2 — THE READ-BACK RECOVERY (`C-6`): the boot read NEVER throws. A
 *  MISSING file answers the registered defaults (the EMPTY record) with
 *  `corrupt: false`; a CORRUPT file (unparsable, non-object, foreign key,
 *  unknown version) answers the SAME registered defaults — never a throw, never
 *  a fatal stop. The registered defaults are the record registered at the
 *  channel's construction, never derived at read time and never invented. */
function readStoreCarrier(path: string): StoreFileRow[] {
  let bytes: string | null = null
  try {
    bytes = existsSync(path) ? readFileSync(path, 'utf8') : null
  } catch {
    // an unreadable real path is the registered-defaults path, never a throw
    return []
  }
  if (bytes === null) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(bytes)
  } catch {
    return []
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return []
  const record = parsed as Record<string, unknown>
  if (record['schemaVersion'] !== STORE_SCHEMA_VERSION) return []
  const rows: StoreFileRow[] = []
  for (const [k, v] of Object.entries(record)) {
    if (k === 'schemaVersion') continue
    if (!k.startsWith('file.')) return []
    rows.push({ name: k, value: v })
  }
  return rows
}

/** §2.7 item 3 — THE ATOMIC FIVE-STEP WRITE: `mkdirSync(dirname(path),
 *  {recursive:true})` if needed → write the projected record to `${path}.tmp` →
 *  `fsync` the tmp file → `renameSync(tmp, path)` → `fsync` the DIRECTORY.
 *  Returns true only when every step completed; any failure answers false and
 *  leaves the previous file intact (§2.7 item 4). The failure is answered as a
 *  RETURNED receipt by the caller — never a throw. */
function atomicWriteStoreCarrier(path: string, serialized: string): boolean {
  const tmp = `${path}.tmp`
  try {
    mkdirSync(dirname(path), { recursive: true })
    // the tmp write OVERWRITES a pre-existing stale tmp and never reads it as input
    writeFileSync(tmp, serialized)
    const tmpFd = openSync(tmp, 'r+')
    try {
      fsyncSync(tmpFd)
    } finally {
      closeSync(tmpFd)
    }
    renameSync(tmp, path)
    const dirFd = openSync(dirname(path), 'r')
    try {
      fsyncSync(dirFd)
    } finally {
      closeSync(dirFd)
    }
    return true
  } catch {
    return false
  }
}

/** §2.4 — `Y-2`'s write, IN ORDER: receive the translation → project it to the
 *  file-tier record → stamp/preserve `schemaVersion` → serialize → validate
 *  (parses as JSON; keys admissible) → atomic-replace → answer the receipt. A
 *  write whose serialized form does not validate answers
 *  `{status:'refused', reason:'malformed-payload'}` with the PREVIOUS file
 *  untouched. */
function projectAndWrite(path: string, payload: unknown): { receipt: StoreChannelReceipt; rows: StoreFileRow[] | null } {
  // (1) the payload must be the STABLE-JSON translation (a JSON STRING)
  if (typeof payload !== 'string') return { receipt: { status: 'refused', reason: 'malformed-payload' }, rows: null }
  let parsed: unknown
  try {
    parsed = JSON.parse(payload)
  } catch {
    return { receipt: { status: 'refused', reason: 'malformed-payload' }, rows: null }
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { receipt: { status: 'refused', reason: 'malformed-payload' }, rows: null }
  }
  // (2) project to the file-tier record; keys are `file.*` spellings (+ schemaVersion)
  const keys = Object.keys(parsed as Record<string, unknown>)
  if (keys.some((k) => !k.startsWith('file.') && k !== 'schemaVersion')) {
    return { receipt: { status: 'refused', reason: 'malformed-payload' }, rows: null }
  }
  const record: Record<string, unknown> = {}
  for (const k of keys) if (k !== 'schemaVersion') record[k] = (parsed as Record<string, unknown>)[k]
  // (3) VERSION-FROM-FIRST-WRITE: the payload carries its `schemaVersion` member
  // from its FIRST write — the cold first write and any later first write alike.
  record['schemaVersion'] = STORE_SCHEMA_VERSION
  // (4) serialize + validate (the serialized form must parse back)
  const serialized = JSON.stringify(record, null, 2)
  try {
    JSON.parse(serialized)
  } catch {
    return { receipt: { status: 'refused', reason: 'malformed-payload' }, rows: null }
  }
  // (5) ATOMIC-REPLACE
  if (!atomicWriteStoreCarrier(path, serialized)) {
    return { receipt: { status: 'refused', reason: 'write-failed' }, rows: null }
  }
  const rows: StoreFileRow[] = []
  for (const [k, v] of Object.entries(record)) {
    if (k === 'schemaVersion') continue
    rows.push({ name: k, value: v })
  }
  return { receipt: { status: 'committed' }, rows }
}

/** Unit F §5.7 — the embedding provider config (`retrieval.embeddingProvider`),
 *  read from env. REQUIRED when `retrieval.embedder === 'vector'`. */
function embeddingProviderConfigFromEnv(): EmbeddingProviderConfig | null {
  const provider = process.env.PROVIDENT_EMBEDDING_PROVIDER
  const baseUrl = process.env.PROVIDENT_EMBEDDING_BASE_URL
  const model = process.env.PROVIDENT_EMBEDDING_MODEL
  if (!provider || !baseUrl || !model) return null
  return {
    provider,
    baseUrl,
    model,
    apiKey: process.env.PROVIDENT_EMBEDDING_API_KEY,
    // F5 — validate the numeric env fields: a NaN/negative/non-integer value
    // is dropped (undefined) rather than passed through as a malformed
    // dimension/timeout.
    dimension: parsePositiveIntEnv(process.env.PROVIDENT_EMBEDDING_DIMENSION),
    timeoutMs: parsePositiveIntEnv(process.env.PROVIDENT_EMBEDDING_TIMEOUT_MS),
  }
}

/** Unit GN-MCP-UI §5.4 — resolve the Gnosis engine's baseUrl A4 in the pinned
 *  3-step priority. 1. the CONFIG SEAM (a config value, NOT a credential — the
 *  operator-owned engine-config value; when set it wins), 2. the env var
 *  `PROVIDENT_ENGINE_BASE_URL`, 3. the documented default `http://127.0.0.1:8080`.
 *  The resolved URL must be loopback (the proxy enforces it at construction). */
function resolveEngineBaseUrl(): string {
  const fromConfig = getEngineConfigBaseUrl()
  if (fromConfig) return fromConfig
  const fromEnv = process.env.PROVIDENT_ENGINE_BASE_URL
  if (fromEnv) return fromEnv
  return 'http://127.0.0.1:8080'
}

/** Unit `B-4` §4 — the change feed's re-read page size and its page bound. `RECONCILE_PAGE_SIZE` sits well above any plausible
 *  engine default, and `RECONCILE_MAX_PAGES` makes the walk FINITE even against a `total` that never agrees with the pages it
 *  returns (this unit's adversarial finding `F-4`: the engine's CRUD list is PAGED, so ONE unpaged read reconciles the first page
 *  only while claiming a full re-read). */
const RECONCILE_PAGE_SIZE = 200
const RECONCILE_MAX_PAGES = 50

/** Unit `B-4a` `engine-store-mirror` §5 site 1 — THE ONE BOUND ON ONE WALK (`B4A-F12`). The mirror projects a walk's list WHOLE or
 *  not at all, so a list ONE id over its `maxPerWalk` projects NOTHING — silently, from the pane's point of view. The walk below
 *  crosses EVERY wiki, so its ceiling is this product PER WIKI while the module's bound is on the SUMMED list (`B4A-F9`'s class,
 *  one threshold down). So BOTH sides read THIS ONE number — the option handed to the mirror and the ceiling the accumulation
 *  stops at — and the walk stops there and reports PARTIAL (`complete: false`) when ONE MORE id WOULD exceed it, which the module
 *  counts `failed` and answers with an EMPTY descriptor. AT the bound nothing is dropped, so the list stays complete (`F12` limb D
 *  drives both sides). That empty descriptor is byte-identical to a legitimate empty engine's: the distinct state is `status()`'s,
 *  and no IPC/MCP surface reads `status()` today (a diagnostic stated, not implied). The two bounds cannot disagree. */
const MIRROR_MAX_PER_WALK = RECONCILE_PAGE_SIZE * RECONCILE_MAX_PAGES

/** Unit A2 §5.4 — load the shell-side `AuthorityStore` mapping (H3): the
 *  callerId → edit-authority-credential mapping. It is a boot-time, in-memory
 *  mapping loaded from the shell's operator settings (the same operator-settings
 *  store that holds the engine `baseUrl` config seam — `src/main/engine-config.ts`).
 *  It is NOT a credential store (the credentials are opaque application-level
 *  strings, not secrets); it is the shell's "who may edit" RBAC mapping. The
 *  mapping is populated at boot and is immutable for the process lifetime (a
 *  change requires a restart). A callerId with no entry (or a null/empty
 *  credential) has NO edit authority. */
function loadAuthorityMapping(): Record<string, string> {
  // The operator settings seam (the same engine-config store family). The
  // mapping is read from the operator-owned config; a callerId with no entry
  // has no edit authority. The fixed GUI operator identity ('operator') maps to
  // the operator's edit-authority credential.
  const mapping: Record<string, string> = {}
  const operatorCredential = process.env.PROVIDENT_OPERATOR_CREDENTIAL
  if (typeof operatorCredential === 'string' && operatorCredential !== '') {
    mapping['operator'] = operatorCredential
  }
  return mapping
}

/** U-APP-HARNESS-READINESS §2.1 `A-1` item 6 — print the effective tool-group
 *  set at boot. The line is emitted in BOTH cases (a request present or absent)
 *  so its presence is not itself a flag-detector; it carries no request
 *  semantics and is a LOG LINE ONLY, never a reply member. */
function logEffectiveToolGroups(
  base: readonly string[],
  persisted: readonly string[],
  requested: readonly string[],
  effective: readonly string[],
  source: string,
): void {
  console.error(
    `[provident-main] tool groups: base=[${base.join(', ')}] persisted=[${persisted.join(', ')}] ` +
      `requested=[${requested.join(', ')}] effective=[${effective.join(', ')}] (source=${source})`,
  )
}

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// `B-2` `display-wire` — THE PRE-WINDOW HOLD: WHAT A CREATION DELIVERS BEFORE ANY WINDOW EXISTS, HELD UNTIL A REALM CAN HEAR IT
// (`docs/L1/unit-b-2-display-wire.md` §2, adopted from the foundation's `createDeliveryQueue` at our pin `b312d83`)
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

// ⟦B-2-PRE-WINDOW⟧
/** **A CREATION'S DELIVERY FIRES BEFORE ANY WINDOW EXISTS**, so a bare broadcast is a send into nothing: the display family's
 *  creation repair writes its placeholder inside `createProfileStore`, and the entry the construction adopts delivers at that
 *  instant — with `BrowserWindow.getAllWindows()` empty. **THE HOLD IS THE ANSWER, AND IT HOLDS ADDRESSES, NEVER READINGS.** A
 *  queue of values would be a SECOND AUTHORITY beside the record; what is held here is the delivery's own argument, which is
 *  all a push may ever carry, so **the flush translates nothing**: it re-emits the crossing's one signal and the realm re-reads.
 *
 *  `deliver` is TOTAL and it is the listener's whole act: it runs no store verb, reads no family and formats nothing (a listener
 *  body's write would open a commit of its own inside the one that fired it), and it never throws, because an uncontained throw
 *  at a registration instant refuses the construction. With no realm standing it HOLDS the address verbatim; once armed it
 *  pushes.
 *
 *  `arm` is the flush, it is UNCONDITIONAL, and it emits ONE push per arrival. A queue that flushed only when it had something
 *  held would leave a RELOADED realm unpainted until the next record change — a new silence of exactly the class this unit
 *  exists to remove — so every arrival owes that realm one delivery and `held`'s content is the creation's EVIDENCE, not the
 *  trigger. The clear is unconditional too, which is what keeps the hold from growing with the app's age.
 *
 *  `held` is a READING and never a destination: an insertion-ordered list of the addresses delivered while nothing could hear
 *  them. Its reader is a battery. */
interface DeliveryQueue {
  /** THE LISTENER'S WHOLE ACT: the delivered ADDRESS — never a value, never a read. Total. */
  deliver(address: readonly string[]): void
  /** THE REALM HAS ARRIVED: one push for this crossing, then the held addresses are dropped. Idempotent, re-armed by the next arrival. */
  arm(): void
  /** WHAT WAS DELIVERED WITH NO DESTINATION — the creation's evidence, a reading for a battery and never a destination. */
  readonly held: readonly (readonly string[])[]
}

function createDeliveryQueue(push: () => void): DeliveryQueue {
  const held: (readonly string[])[] = []
  let armed = false
  return {
    deliver(address: readonly string[]): void {
      if (armed) {
        push()
        return
      }
      // HELD VERBATIM: the address is the delivery's own argument, and a copy of it is the whole of what this queue keeps. **A
      // VALUE THAT IS NOT AN ADDRESS IS NOT HELD** (`B2-ADV2-03`, measured: `[...address]` threw `TypeError: address is not
      // iterable` on a non-iterable, so an untotal `deliver` could refuse the act that fired it at a registration instant) —
      // nothing to copy, nothing to hold, and the total claim becomes true at the edge rather than only inside the types.
      if (!Array.isArray(address)) return
      held.push([...address])
    },
    arm(): void {
      // THE FLAG FIRST, so nothing delivered DURING the push is held behind it; then ONE push for this crossing; then the held
      // set is dropped whether or not it held anything — **and the clear runs in a `finally`** (`B2-ADV2-03`, measured on a
      // throwing push: `armed` stayed `true` while the hold survived, so "the clear is unconditional" was false exactly where
      // it matters). The push still propagates its own failure; what it may not do is leave the crossing half-flushed.
      armed = true
      try {
        push()
      } finally {
        held.length = 0
      }
    },
    get held(): readonly (readonly string[])[] {
      // A READING: a copy, so a reader cannot reach the queue's own list.
      return held.map((address) => [...address])
    },
  }
}
// ⟦/B-2-PRE-WINDOW⟧

async function main(): Promise<void> {
  console.error(`[provident-main] node ${process.versions.node} electron ${process.versions.electron} crypto=${typeof globalThis.crypto}`)
  // U-STORE-PERSIST-ADOPT §2.9 — THE `--provident-user-data=` SEAM, RESOLVED
  // BEFORE the carrier's path is computed: it feeds `app.setPath('userData', …)`
  // here, AHEAD of every `app.getPath('userData')` consumer below
  // (`createSecurityStore` and the other carriers). A malformed value never
  // aborts the launch — the resolver answers null and the default root is used.
  const userDataOverride = userDataFromArgs(process.argv.slice(1))
  if (userDataOverride !== null) app.setPath('userData', userDataOverride)
  const transport = transportFromArgs(process.argv.slice(1))
  const port = portFromArgs(process.argv.slice(1))

  // U-STORE-PERSIST-ADOPT §2.6 / §2.7 items 1-2 — THE TIER-1 CARRIER + THE
  // `bootRecord` HOLDER. The carrier is `<userData>/provident-settings.json`
  // (minted at exactly ONE site in this file); the boot read is performed ONCE,
  // here, into the handler-scoped `bootRecord` holder. The read NEVER throws: a
  // missing file and a corrupt file both answer the registered defaults — the
  // EMPTY record — so a cold tier hand-off answers `[]`.
  const storeCarrier = join(app.getPath('userData'), 'provident-settings.json')
  let bootRecord: StoreFileRow[] = readStoreCarrier(storeCarrier)

  // U-APP-HARNESS-READINESS §2.1 `A-1` — the LAUNCH-SCOPED tool-group
  // enablement route (`--enable-tool-groups=<g1,g2,…>`, env fallback
  // `PROVIDENT_ENABLE_TOOL_GROUPS`, argv wins). It is a PRE-LAUNCH operator
  // grant: ADDITIVE (never subtractive), launch-scoped, and it NEVER writes the
  // persisted config (`P-1`/`P-5`). A malformed/unknown/empty request is a
  // NAMED FAIL-CLOSED ABORT (§2.1 item 6) — the launch ends BEFORE the window
  // and BEFORE `mcp.start()`, so no MCP surface exists on that path.
  const launchGroups = enablementRequestFrom(process.argv.slice(1), process.env)
  // The manual-UI security settings (mcp-endpoint.md §6.4): persisted to
  // userData so a restart restores them. The MCP server gate is built from the
  // persisted config (read+dispatch ON by default on first run).
  const securityStore: SecurityStore = createSecurityStore({
    path: join(app.getPath('userData'), 'provident-security.json'),
  })
  const persisted = securityStore.get()
  if (!launchGroups.ok) {
    console.error(
      `[provident-main] --enable-tool-groups REFUSED: ${launchGroups.reason}; ` +
        'the launch is aborted before the MCP surface starts',
    )
    app.exit(2)
    return
  }
  // §2.1 item 2 — `effective = union(base, persisted, requested)`, resolved
  // ONCE, before the gate and the MCP server exist, so the very first
  // `tools/list` already reflects it (a post-hoc `applyGatePatch` would leave a
  // boot window in which a requested group is still unregistered).
  const base = defaultSecurityConfig().enabled
  const requested = launchGroups.requested
  const effective = effectiveEnabledGroups(base, persisted.enabled, requested)
  logEffectiveToolGroups(base, persisted.enabled, requested, effective, launchGroups.source)
  const gate = new SecurityGate({ token: persisted.token, enabled: effective })
  // L3 (adversarial) — track the last-known persisted enabled set so the live
  // gate is re-patched from the STORE's FILTERED result (not the raw IPC patch).
  // The store drops unknown/invalid groups; if the live gate consumed the raw
  // patch it could enable a group the persisted config drops → live/persisted
  // divergence on restart. Deriving the add/remove diff from the store's result
  // keeps the live gate exactly in sync with what is persisted.
  let currentEnabled = persisted.enabled
  // §2.2 `B-1` item 3 item 2 — the readiness observable's PRESENCE is enforced
  // here, in MAIN, from the SAME resolved request the gate used: only a launch
  // that opted into the `A-1` route arms it, so a default launch's
  // `provident.list_targets` reply carries no `boot` member at all (`P-6`).
  const optedIn = requested.length > 0
  const backend = new RendererBackend(optedIn ? { bootObservable: true } : {})

  // ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  // `B-2` `display-wire` — THE BOOT'S ONE CONSTRUCTION AND THE CROSSING'S MAIN HALF, IN THE CONTRACT'S OWN ORDER
  // (`docs/L1/unit-b-2-display-wire.md` §2; the order is the foundation's, adopted at our pin `b312d83`)
  // ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  // THE SITE IS PART OF THE CLAIM: after the launch's refusal arms (the `--enable-tool-groups` abort above) and BEFORE
  // `new BrowserWindow`, which is the fork's `D-19` boot order — construction → … → window → load.
  //
  // (1) THE PUSH LOOP. Every window is told and the destroyed guard stands; **the push carries NO VALUE AND NO ADDRESS**
  // (`D-24`, `forking.md` §2.5), so the renderer's only correct answer to it is its own re-read. The `send` is CONTAINED per
  // window, and that containment is not decoration: this body runs inside the delivery's own contained turn, and a throw at a
  // registration instant would refuse the construction — so one window's failure must stay that window's.
  const pushDisplayChanged = (): void => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.isDestroyed()) continue
      try {
        win.webContents.send(DISPLAY_CHANGED)
      } catch {
        /* one window's failure is that window's: the family moved and the delivery happened */
      }
    }
  }
  // (2) THE QUEUE, BUILT BEFORE THE STORE — the creation's own repair delivers before any window exists, so the hold has to
  // stand before the construction does. (3) THE DELIVERY, whose sink is the queue's `deliver`: total and uninterpreted, an
  // address in and nothing else.
  const displayQueue = createDeliveryQueue(pushDisplayChanged)
  const displayDelivery = createDisplayDelivery((address) => displayQueue.deliver(address))
  // (4) THE HOLDER the constraint bodies read — DECLARED before the call and BOUND after it answers, which is exactly why an
  // unwrapped body can act at the registration instant and a wrapped one abstains.
  const displayStoreHolder: { current: StoreInstance | null } = { current: null }
  // (5) THE BOOT'S **ONE** CONSTRUCTION, ADOPTING **BOTH** DECLARATION LISTS. `listeners:` is what makes a write's delivery
  // reach the push loop at all. `constraints:` is what makes the family STAND: without `display-must-stand` no creation repair
  // runs, a leaf write has no parent to land under (a nested write does not create its parent) and every `commitTab` is
  // refused. **NO SECOND CONSTRUCTION EXISTS ANYWHERE** (`docs/defects.md` `STOREROOM-TWO-INSTANCES-CLOBBER-ONE-FILE`, the
  // foundation's `D-80`): the census row makes this call site count a fact rather than a promise.
  const displayProfilePath = join(app.getPath('userData'), 'provident-profile.json')
  let displayStore: StoreInstance | null = null
  try {
    displayStore = createProfileStore({
      filePath: displayProfilePath,
      listeners: [...displayDelivery.entries],
      constraints: [...displayConstraintDeclarations(() => displayStoreHolder.current)] as never,
    })
  } catch (refusal) {
    // **A REFUSED CONSTRUCTION DEGRADES BY NAME AND NEVER RETRIES.** The store throws `FilePathUnreachable` for a `filePath`
    // that can never be occupied, and the foundation funnels that into a FATAL boot. **HERE IT DEGRADES**, for one reason:
    // this family's payload is DISPLAY STATE — a caret and a scroll — and a lost caret must not kill an app whose document
    // content lives elsewhere (the fork's other persistence seams are all fail-soft). The degradation is LEGIBLE, not silent:
    // this one line carries the store's own `status` and the path, the read route answers the DECLARED `null`, the arm still
    // fires, and a consumer keys on the READING. **`no-port` is NOT this boot's word** — that is the absent-bridge MEMBER arm
    // and a preload that always exposes the member can never produce it (`B2-ADV-01`). WHAT IS FORBIDDEN ON THIS PATH: a
    // second construction, a defaulted `filePath`, a retry, a fallback store. **Cheap reversal:** one `throw` instead of this.
    const shape = refusal as { status?: unknown; message?: unknown } | null
    const status = typeof shape?.status === 'string' ? shape.status : 'no `status` member, so this is not a store refusal'
    const reason = typeof shape?.message === 'string' ? shape.message : String(refusal)
    console.error(
      `[provident-main] display profile store REFUSED at '${displayProfilePath}' (status '${status}'): "${reason}" — ` +
        'the display family stays ABSENT for this launch; the read route answers the declared null, the push still fires, and ' +
        'a consumer must key on that READING (no second construction, no defaulted path, no retry, no fallback store)',
    )
  }
  // (6) THE HOLDER BOUND, once the call has answered — never before, or every constraint body would read `null` at the
  // registration instant it is meant to abstain at.
  displayStoreHolder.current = displayStore
  // (7) THE RECORD OVER THAT HANDLE, and its read as the crossing's ONE request route. A degraded boot answers the DECLARED
  // `null` and nothing throws (`createDisplayRecord` is total over its store: an absent family is a declared absence).
  const displayRecord = displayStore === null ? null : createDisplayRecord({ store: displayStore, delivery: displayDelivery })
  ipcMain.handle(DISPLAY_READ, () => (displayRecord === null ? null : displayRecord.read()))
  // ⟨Unit `B-10` `stage-display-state` §5 — **THE "MISSING WIRING ARM" THE DELEGATION ANTICIPATED, AND IT IS ONE ARM.**⟩
  // The renderer's capture has a sender (`display.write`) and the record has a write route (`commitTab`), and until this line
  // existed NOTHING joined them: an entry could be built and never landed. So: ONE `invoke`/`handle` pair over `DISPLAY_WRITE`,
  // beside the landed `DISPLAY_READ` arm, with **NO SECOND CONSTRUCTION, NO STORE VERB OF ITS OWN** and no `--external` or
  // `package.json` change — the record IS the writer, and it is the record that judges.
  //   · a DEGRADED BOOT (`displayRecord === null`) answers the DECLARED `null` — the same word the read arm answers, and never a
  //     throw: losing a caret must not fail a renderer that has nothing to do with the store;
  //   · otherwise the payload's `tabId`/`entry` are taken STRUCTURALLY and handed straight to `commitTab`, whose own shape arms and
  //     whose ONE parse do the judging — a forged payload is REFUSED there with the family's own token, NEVER repaired and never
  //     coerced here. A store refusal crosses as itself (the record's own rule), so this arm adds no vocabulary.
  ipcMain.handle(DISPLAY_WRITE, (_event, payload: unknown) => {
    if (displayRecord === null) return null
    const shape = (payload !== null && typeof payload === 'object' ? payload : {}) as { tabId?: unknown; entry?: unknown }
    return displayRecord.commitTab(shape.tabId as string, shape.entry)
  })

  // Unit U-MENU-1 §2 — the native application-menu surface. The renderer pushes
  // the live pane catalog over `IPC_PANE_CATALOG` (boot + registry change); main
  // rebuilds the View → Panes submenu from the latest catalog. The menu bar is
  // the AGENTS.md shell carve-out: actions route to the host over IPC (pane
  // visibility — U-SHELL-8 owns apply/persist) or run the fs-only Import dialog
  // (U-IMPORT-1 owns the directory expansion + handler).
  let latestPaneCatalog: PaneCatalogEntry[] = []
  let mainWindow: BrowserWindow | null = null
  /** Broadcast the import result payload exactly once (§2.5). */
  const broadcastImportResult = (payload: ImportResultPayload): void => {
    backend.broadcast(IPC_IMPORT_RESULT, payload)
  }
  /** Resolve a non-cancel dialog selection and route the outcome (U-IMPORT-1
   *  §2.4 steps 3–5). The browse surface addresses the DEFAULT store only
   *  (§8 W-Q5), with the default entry's server-fixed `corpusRoot` (§2.4). */
  const runImportSelection = async (selection: string[]): Promise<void> => {
    const resolution = resolveImportSelection(selection, { max: MAX_IMPORT_FILES })
    if (!resolution.ok) {
      if (resolution.reason === 'no-markdown-files') {
        // FAIL-LOUD no-op: no import, no `IPC_RAG_STORE_CHANGED`.
        broadcastImportResult({ ok: false, reason: 'no-markdown-files' })
      } else if (resolution.reason === 'cap-exceeded') {
        // FAIL-LOUD: no import at all — never a silently-truncated import.
        broadcastImportResult({ ok: false, reason: 'cap-exceeded', cap: resolution.cap })
      }
      return
    }
    const files = resolution.files
    // The boot already throws if the default entry is absent; re-guard for
    // TS narrowing inside this closure (the browse surface is default-store
    // ONLY — §8 W-Q5).
    if (!defaultEntry) {
      console.error('[provident-main] default store entry missing; import aborted')
      return
    }
    try {
      const ctx = { store: runtime.getDefaultStore() }
      const result = await importMarkdownCorpus(
        ctx,
        { files, corpusRoot: defaultEntry.corpusRoot },
        {
          name: defaultEntry.name,
          isDefault: true,
          reservedNames: [...runtime.getDirectory().entries.keys()].filter((n) => n !== runtime.getDefaultName()),
        },
      )
      if (result.ok) {
        // On success fire the C10 re-traversal trigger (engine reconcile
        // fire-and-forget, caught) + broadcast the import result exactly once.
        void runtime.getDefaultEngine().onStoreChanged('structural', result.documentIds, []).catch((e) => {
          console.error('[provident-main] retrieval index reconcile failed:', e)
        })
        const changedPayload: RagStoreChangedPayload = {
          kind: 'structural',
          nodeIds: result.documentIds,
          edgeIds: [],
          store: runtime.getDefaultName(),
        }
        backend.broadcast(IPC_RAG_STORE_CHANGED, changedPayload)
        broadcastImportResult({
          ok: true,
          documentIds: result.documentIds,
          nodeCount: result.nodeCount,
          edgeCount: result.edgeCount,
          resolvedCount: files.length,
        })
      } else {
        // F12 — a domain failure: surfaced as the `import-failed` outcome; the
        // engine is NOT reconciled; `IPC_RAG_STORE_CHANGED` fires 0 times.
        broadcastImportResult({ ok: false, reason: 'import-failed', error: result.error, failedFile: result.failedFile })
      }
    } catch (e) {
      // F15 — `importMarkdownCorpus` throws (a non-domain host/battery error):
      // caught + logged; the operator is surfaced a failed outcome.
      console.error('[provident-main] import failed:', e)
      broadcastImportResult({
        ok: false,
        reason: 'import-failed',
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }
  /** Handle a dialog result: a cancel/dismiss/empty selection is a no-op
   *  (zero resolution, zero import, zero broadcast — §2.4 step 2 / F4). */
  const handleDialogResult = (result: unknown): void => {
    const selection = importSelectionFromDialog(result)
    if (selection == null) return
    void runImportSelection(selection)
  }
  /** File → Import… — open the platform-aware multi-file dialog
   *  (buildImportDialogOptions) and route the non-cancel selection (§2.4). */
  const openImportDialog = (): void => {
    const opts = buildImportDialogOptions(process.platform)
    const options = {
      properties: [...opts.properties],
      filters: opts.filters.map((f) => ({ name: f.name, extensions: [...f.extensions] })),
    }
    const pending = mainWindow
      ? dialog.showOpenDialog(mainWindow, options)
      : dialog.showOpenDialog(options)
    void pending
      .then((result) => handleDialogResult(result))
      .catch((e) => {
        console.error('[provident-main] import dialog failed:', e)
      })
  }
  /** File → Import folder… (win/linux) — open the `['openDirectory']` dialog
   *  for directory bulk upload (§2.3/§2.4 step 1). */
  const openImportFolderDialog = (): void => {
    const options: { properties: Array<'openFile' | 'openDirectory' | 'multiSelections'> } = {
      properties: ['openDirectory'],
    }
    const pending = mainWindow
      ? dialog.showOpenDialog(mainWindow, options)
      : dialog.showOpenDialog(options)
    void pending
      .then((result) => handleDialogResult(result))
      .catch((e) => {
        console.error('[provident-main] import folder dialog failed:', e)
      })
  }
  /** Build the application menu from the latest catalog and install it. */
  const rebuildApplicationMenu = (): void => {
    const actions: AppMenuActions = {
      openImport: () => openImportDialog(),
      openImportFolder: () => openImportFolderDialog(),
      togglePane: (id, enabled) => {
        const entry = latestPaneCatalog.find((p) => p.id === id)
        if (entry) entry.enabled = enabled
        backend.broadcast(IPC_PANE_VISIBILITY, { id, enabled })
        rebuildApplicationMenu()
      },
      // U-4 `R-3` — the native View opener's ONE route (manual-UI only). The payload is
      // the literal `null`: the arrival carries no data and writes no receipt (`R-2`), and
      // the renderer answers it by firing the shell's own affordance (`R-5`), so the
      // overlay's state keeps ONE author (`modal-state.ts`).
      openSettings: () => { backend.broadcast(IPC_SETTINGS_OPEN, null) },
    }
    const template = buildMenuTemplate(latestPaneCatalog, { actions }) as MenuItemConstructorOptions[]
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  }
  // §2.2 — the renderer pushes the catalog at boot + on every registry change;
  // main stores the normalised catalog (F1/F4) and rebuilds the submenu.
  ipcMain.on(IPC_PANE_CATALOG, (_event, catalog: unknown) => {
    latestPaneCatalog = normalizePaneCatalog(catalog)
    rebuildApplicationMenu()
  })
  // U8 — the module store (operator-owned, persisted to userData). The MCP
  // server handles module.* tools against it; the pane reads/writes it over IPC.
  const moduleStore = createModuleStore({
    path: join(app.getPath('userData'), 'provident-modules.json'),
  })
  // U9-FIX — the live capability router (main-process). Synced from the module
  // store so installed modules' declared tools become callable. Passed to the
  // MCP server so dynamic module tools are registered + two-gated.
  const moduleRouter = new CapabilityRouter()
  syncModuleRouter(moduleRouter, moduleStore)
  // U-MS2 §5.4 step 1 — the multi-store registry loads ONCE at boot (U-MS1's
  // loader) from `join(userData, 'provident-rag-stores.json')`, at today's
  // single-store position (main.ts:116-120 replaced). Outcomes (U-MS1's
  // contract): file absent OR corrupt/unreadable ⇒ the fail-soft implicit
  // entry `{ name: 'main', default: true }` (persistence
  // `provident-rag.json`, no corpusRoot) + U-MS1's pinned log — boot
  // CONTINUES; valid-JSON-but-invalid ⇒ the loader THROWS, propagating out of
  // `main()` into the existing fatal path (`console.error('[provident-main]
  // fatal:', e)` + `app.exit(1)`) BEFORE the window, before `mcp.start()`,
  // before `vectorBoot.start()`, and before ANY store file is created or
  // written. The registry is read exactly ONCE per boot (D8): no IPC surface
  // below re-reads it, and a registry file changed while running is observed
  // only after restart.
  const registry = loadRagStoreRegistry({
    path: join(app.getPath('userData'), 'provident-rag-stores.json'),
  })
  // Unit I — the main-process template store (docs/specs/unit-i-template.md
  // §5.2). SEPARATE from the RAG store (the template is the envelope's
  // `template`, not RAG content). The MCP `code.template.*` tools and the UI
  // template IPC both route through it (MCP/UI equivalence — §8.2).
  const templateStore = createTemplateStore({
    path: join(app.getPath('userData'), 'provident-template.json'),
  })
  // Unit K §5.4 M9 — the operator-settings store (operator-owned, persisted to
  // userData). The `settings` pane reads/writes it over the operator-settings
  // IPC; it is NEVER an MCP tool (an agent must not change the operator's
  // view/retrieval defaults).
  const operatorSettingsStore = createOperatorSettingsStore({
    path: join(app.getPath('userData'), 'provident-operator-settings.json'),
  })
  // Unit GN-MCP-UI §5.4 A4 — the Gnosis-engine baseUrl config seam (STEP 1 of
  // resolveEngineBaseUrl). Persisted to userData (operator-owned; NOT a
  // credential). The seam is mounted into `resolveEngineBaseUrl`'s registry;
  // null → falls through to env `PROVIDENT_ENGINE_BASE_URL` → the default.
  const engineConfigStore = createEngineConfigStore({
    path: join(app.getPath('userData'), 'provident-engine-config.json'),
  })
  setEngineConfigBaseUrl(engineConfigStore.get().engineBaseUrl)
  // Unit E §5.6/§5.7 — the maintained retrieval engines, created ONCE per
  // store with the store + the selected embedder (U-MS2 §5.4 step 3 —
  // ENGINE-PER-STORE, the directory's per-name entries). F1: `rag.query` (MCP)
  // and the `rag-query` IPC both use the DEFAULT entry's engine; the index is
  // reconciled incrementally on `rag-store-changed` (never rebuilt from
  // scratch per query).
  // Unit F §5.7 — the embedder selection (`retrieval.embedder`): 'lexical'
  // (default) uses the lexical embedder; 'vector' uses the vector embedder
  // (created from the REQUIRED `retrieval.embeddingProvider` config). A
  // 'vector' selection with a missing/invalid provider config FAILS (the
  // provider-creation error propagates; the app does NOT silently fall back to
  // lexical).
  const embedderKind = retrievalEmbedderFromArgs(process.argv.slice(1))
  // U-MS2 §5.4 step 2 — the vector provider config + warm-up: UNCHANGED
  // position and semantics (the null-config check + the ONE warm-up probe stay
  // SYNC-BEFORE-WINDOW, for the DEFAULT store's branch only). The registry
  // load above precedes this, so an invalid registry aborts before the
  // embedder probe (§5.4 step 1).
  let provider: EmbeddingProvider | null = null
  if (embedderKind === 'vector') {
    const providerConfig = embeddingProviderConfigFromEnv()
    if (!providerConfig) {
      throw new Error('retrieval.embedder: vector requires retrieval.embeddingProvider config')
    }
    provider = await warmUpEmbeddingProvider(providerConfig)
  }
  // U-MS2 §5.4 step 3 — construct the N stores + N engines (the directory plan
  // — the U-MS1 registry view consumed here). The DEFAULT store follows
  // today's exact lexical/vector branch (the vector branch via the ONE
  // plan.vectorBoot controller with the byte-equal explicit cache path);
  // non-default stores are ALWAYS lexical in Phase 1 (A6/R10).
  const plan = buildRagStoreDirectory(registry, {
    userDataPath: app.getPath('userData'),
    embedderKind,
    provider,
  })
  // U-MS2 §5.4 step 4 — the DEFAULT bindings: every existing binding site
  // below (the server options, the UI edit/batch/rich-commit reconciles, the
  // rag-query/backlinks/doc-heads/snapshot IPCs) keeps binding the DEFAULT
  // store's store/engine — now derived from the plan's default entry (the
  // legacy locals' names are kept so every binding site stays byte-equal).
  // All IPC surfaces remain DEFAULT-STORE-BOUND in Phase 1 (D9/
  // UI-SELECTOR-DEFERRED; the RagQueryPayload.store FIELD is U-MS5's).
  const defaultEntry = plan.directory.entries.get(plan.defaultName)
  if (!defaultEntry) throw new Error('rag-store-directory: default store not found')
  // U-MS2 §5.4 step 6 — vectorBoot is now the plan's at-most-ONE controller
  // (the default store's — A6); the background start() + the failure-logged
  // stay-pending behavior below are UNCHANGED.
  const vectorBoot = plan.vectorBoot
  // U-H2b §5.8 — the injected runtime seam (A-P2-1). Construct the runtime
  // controller ONCE at boot around the boot plan (the SAME directory object,
  // the SAME default entry, the SAME vectorBoot — NO-OP byte-equal, §4). No
  // rebuild/fs/read side effect at construction; the normal boot loader path
  // still reads the registry EXACTLY ONCE per boot (D8). Every LIVE closure
  // below reads the runtime's accessors per call.
  const registryPath = join(app.getPath('userData'), 'provident-rag-stores.json')
  const runtime = createRagStoreRuntimeController({
    registry,
    directory: plan.directory,
    defaultEntry: plan.directory.entries.get(plan.defaultName)!,
    vectorBoot: plan.vectorBoot,
    registryPath,
    userDataPath: app.getPath('userData'),
    embedderKind,
    provider,
  })
  // U-MS2 §5.4 step 5 — the server options gain the wired store directory
  // (`ragStores`); `ragStore`/`retrievalEngine` stay (backward-compatible) and
  // are the default entry's objects (the wiring invariant, §5.4 step 5).
  // Unit X §5.7 — the query audit log is created ONCE in main and shared by the
  // MCP `rag.query`/`rag-stream` handlers + the `rag-query` IPC + the
  // `get_query_audit_log` tool (the shared-handler seam).
  const auditLog = createQueryAuditLog()
  // Unit GN-MCP-UI §5.4 — construct the engine proxy at boot UNCONDITIONALLY
  // (the factory does NO network I/O — §5.8-7) and inject it into the MCP
  // server. The `gnosis.*` tools are handled in MAIN against it. The engine may
  // be absent (D2): `waitForReady` is NOT awaited at boot (the boot does not
  // block on an absent engine) and is NOT exposed as a tool.
  const engineRagStore = createEngineRagStore({ baseUrl: resolveEngineBaseUrl() })
  // ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  // Unit `B-4a` `engine-store-mirror` — SITE (1): THE MIRROR, INERT AT CONSTRUCTION (`docs/L1/unit-b-4a-engine-store-mirror.md`
  // §3/§4/§5; `docs/L2/gnosis-changes/engine-mirror.md` §5). It sits HERE, after the runtime controller its `store` thunk closes
  // over and BEFORE the CRUD proxy it feeds (site 2 hands that proxy its `accepted` member), and it reads nothing and writes
  // nothing until a write or a descriptor arrives (the `createEngineRagStore` discipline above, `:825-830`).
  //
  // THE DEFECT THIS CLOSES (`B6-F1`, HIGH, `D-40`'s grant): the doc-heads read is
  // `handleRagDocHeadsIpc(runtime.getDefaultStore())` (`:1195-1197` below) — ONE LOCAL store — while the engine's writes land in
  // two wire clients that hold no store at all. So an engine-created document could never appear in the doc-nav pane: the pane
  // re-read and answered `unchanged`. The mirror is the missing PROJECTION — never a second source of truth (contract §1
  // `ASM-B4A-1`); the engine stays authoritative for engine-side data.
  //
  // `store` IS A THUNK, not a store: the shell's hot default-store swap (`createRagStoreRuntimeController`) must be honoured, so
  // every projection lands in whichever store is the default AT THE MOMENT it lands. `read` is the engine document-LIST read and
  // it stays HERE rather than inside the module — the walk is PAGED and page-BOUNDED (`RECONCILE_PAGE_SIZE`/`RECONCILE_MAX_PAGES`,
  // `:313-314`) because the CRUD list is paged, and the walk reports `complete`, which is the ONLY thing that may license a delete
  // (contract §5(ii); a partial list that claimed otherwise is exactly `F-4`'s lie). `origin` is passed EXPLICITLY so the engine
  // origin label this wiring's descriptors carry is named at the wiring site, not inferred from a default.
  const engineMirror = createEngineMirror({
    origin: ENGINE_ORIGIN_STORE,
    store: () => runtime.getDefaultStore(),
    // THE TWO BOUNDS ARE ONE BOUND (adversarial `B4A-F9`, and `B4A-F12` closes its remaining gap): a mirror whose bound is smaller
    // than its reader's simply never projects when they disagree, so the module's per-walk bound is stated HERE as the SAME number
    // the `read` closure below STOPS ACCUMULATING at — one constant, two consumers, so no wiki count can make the two disagree. The
    // walk reports itself PARTIAL (`complete: false`) at that ceiling rather than handing over a list the module must reject whole.
    maxPerWalk: MIRROR_MAX_PER_WALK,
    read: async (): Promise<EngineMirrorRead> => {
      const documents: EngineMirrorDocument[] = []
      let complete = true
      const wikis = await engineCrudRagStore.listWikis({})
      for (const wiki of wikis) {
        let seen = 0
        let closed = false
        let capped = false
        for (let page = 1; page <= RECONCILE_MAX_PAGES; page += 1) {
          const listed = await engineCrudRagStore.listDocuments({
            wikiId: wiki.wikiId,
            body: { state: null, tag: null, page, pageSize: RECONCILE_PAGE_SIZE },
          })
          for (const document of listed.items) {
            // THE ONE BOUND, AT THE ACCUMULATION SIDE (`B4A-F12`): the module projects a list WHOLE or not at all, so accumulating
            // past its own `maxPerWalk` would turn a large engine into a silent nothing. Stop AT the bound and let the walk report
            // itself PARTIAL below — the module then names the state on `status()` and answers an empty descriptor, honestly.
            if (documents.length >= MIRROR_MAX_PER_WALK) {
              capped = true
              break
            }
            documents.push({ documentId: document.documentId, title: document.title, updatedAt: document.updatedAt })
          }
          seen += listed.items.length
          if (listed.items.length === 0 || seen >= listed.total) {
            closed = true
            break
          }
          // Nothing further can be named, so no further wiki or page is read: the ceiling is the whole walk's, not one wiki's.
          if (capped) break
        }
        // A wiki whose walk hit the page bound — or the ONE bound above — leaves the list PARTIAL, and a partial list may never license a delete.
        if (!closed || capped) complete = false
        if (capped) break
      }
      return { documents, complete }
    },
  })
  // Unit A2 §5.4 — construct the CRUD proxy + the shell-side AuthorityStore (H3)
  // + the caller-side IdempotencyRegistry (P4) at boot UNCONDITIONALLY (the CRUD
  // factory does NO network I/O — A1 §5.1) and inject them into the MCP server.
  // The `gnosis.document.*`/`gnosis.wiki.*` tools are handled in MAIN against the
  // CRUD proxy. The engine may be absent (D2): `waitForReady` is NOT awaited at
  // boot (the boot does not block on an absent engine) and is NOT exposed as a
  // tool. The AuthorityStore mapping is a boot-time, in-memory mapping (a change
  // requires a restart); a callerId with no entry has no edit authority.
  //
  // SITE (2) — THE SEAM (`B-4a` §3/§5 site 2): the proxy's ONE optional member, so the six mutating document methods' ACCEPTED
  // answers reach the mirror BEFORE the proxy's own call resolves. Reads fire nothing and a refused answer fires nothing (the
  // seam is called after `decodeCrudResponse` returned).
  const engineCrudRagStore = createEngineCrudRagStore({
    baseUrl: resolveEngineBaseUrl(),
    onAccepted: (write) => engineMirror.accepted(write),
  })
  // ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  // Unit `B-4` `engine-changes` — THE ENGINE CHANGE FEED'S WIRING, AND NOTHING ELSE (`docs/L1/unit-b-4-engine-changes.md` §4;
  // `docs/L2/gnosis-changes/engine-changes.md` §4.4). FOUR SITES, AND THE SITE OF EACH IS PART OF THE CLAIM: three of them are in
  // THIS block (in this order), and the fourth — `void engineChangesFeed.connect()` — is deliberately far below, AFTER the window
  // exists and has loaded (see the banner at that site; `F-2`, ruled by `L1`).
  //
  // (1) THE CONSTRUCTION is INERT — `createEngineChangesFeed` opens no socket and reads nothing (the `createEngineRagStore`
  //     discipline two lines up, `:837-842`), so it sits beside the two engine proxies (`:842`, `:919`) and AFTER the CRUD proxy
  //     its `reconcile` closes over.
  // (2) THE RE-READ is the FULL engine CRUD read (§2.4, `ASM-B4-3` — the callable is INJECTED, so the consumer holds no CRUD
  //     surface of its own): every wiki, then EVERY PAGE of each wiki's documents, answered as ONE `structural` descriptor naming
  //     the documents it saw. ⟨**MOVED BY `B-4a` TO THE MIRROR'S `read` (site 1 above), `O-2`'s re-grain:** the walk must be
  //     `reconcile()`'s own act — walk + project + answer in ONE act — or the engine's authoritative document list is read by two
  //     different closures that can disagree; `c9(c)`'s walk subjects and `c9(h)`'s needle were re-grained with it, never
  //     deleted.⟩ THE PAGINATION IS NOT DECORATION — the CRUD list is PAGED (`DocumentList` carries `total`/`page`/
  //     `pageSize`), so an unpaged read would reconcile the engine's default FIRST PAGE ONLY while claiming to have re-read the
  //     store (this unit's adversarial finding `F-4`, measured). The walk is BOUNDED (`RECONCILE_MAX_PAGES`), so a lying `total`
  //     cannot hold a re-read open for ever, and `c9(h)` pins both the page size and the bound. A re-read that fails — or that
  //     answers no four-key descriptor — is the FEED's to type: it settles `status()` and CLOSES the subscription it opened
  //     (fail-closed; the socket is opened BEFORE the read under `ASM-B4-5`, so fail-closed means torn down, never never-opened).
  // (3) THE SINK broadcasts on the EXISTING `IPC_RAG_STORE_CHANGED` channel — no new channel constant, no `preload.ts` byte, no
  //     `shared/types.ts` widening — and the descriptor carries `ENGINE_ORIGIN_STORE` (`'gnosis:engine'`), which
  //     `RAG_STORE_NAME_PATTERN` can never mint, so the renderer's fail-closed foreign-store guard drops it as a foreign store
  //     until a pane DECLARES engine-change interest (that adoption is `B-6`/`B-8`'s, never this unit's).
  //     ⟨**AND IT SETTLES FIRST (`B-4a` §4, `B-4a` §5 site 3) — THE MIRROR, THEN THE BROADCAST, IN THE SAME EXPRESSION.** A pane
  //     that reacts to a descriptor by re-reading `IPC_RAG_DOC_HEADS` must not be able to read a store the mirror has not yet
  //     written: that is `B6-F1`'s whole failure, and this is the only place it can be closed. `settle` is the module's ONE
  //     serialization point (one walk in flight, one trailing demand, no timer), so broadcast order stays frame order; it never
  //     rejects, so no descriptor can be lost to a mirror fault, and the `void` marks the float because `onChange`'s own type is
  //     `(descriptor) => void` (`engine-changes.ts` takes ZERO byte — contract §4 "no second publisher").⟩
  //
  // **WHERE `connect()` SITS, AND IT IS PART OF THE CLAIM (`F-2`, RULED BY `L1`): it is issued AFTER the window exists and AFTER
  // its content has LOADED — the banner below `await win.loadFile(...)` — never here.** As first landed it was issued at THIS
  // point, before `new BrowserWindow`, so the connection's announcement, its re-read descriptor and every frame of that connection
  // were broadcast into no realm and DROPPED (`backend.broadcast` is a no-op with no attached window, `mcp-server.ts:2849-2857`) —
  // a hidden loss, and nothing forced the early call: `B-2`'s pre-window hold exists because a creation delivery fires before any
  // window, while here the caller chooses the moment. The renderer-ready signal is not awaitable from this file (the backend
  // exposes no readiness promise, only the `IPC_READY` body at `:1326`), so the lawful post-window point available HERE is the
  // load's completion. **What that does and does not prove:** the realm EXISTS and its content has loaded, so the descriptor is no
  // longer dropped for want of a window — it does NOT establish that the renderer has already registered its
  // `rag-store-changed` listener (that registration is `SidebarPanes.boot()`'s, several awaits into the renderer's own boot), and
  // this unit does not claim it: the receipt is `B-6`/`B-8`'s byte. A pre-window QUEUE for this channel is still not this unit's
  // byte and is not added.
  const engineChangesFeed = createEngineChangesFeed({
    baseUrl: resolveEngineBaseUrl(),
    reconcile: () => engineMirror.reconcile(),
    onChange: (descriptor: RagStoreChangedPayload) => {
      void (async (): Promise<void> => {
        await engineMirror.settle(descriptor)
        try {
          backend.broadcast(IPC_RAG_STORE_CHANGED, descriptor)
        } catch {
          // The sink's own fault is the sink's: a broadcast that throws must not unown this descriptor's settle.
        }
      })()
    },
  })
  app.once('before-quit', () => {
    engineChangesFeed.close()
  })

  const authorityStore = createAuthorityStore(loadAuthorityMapping())
  const idempotency = createIdempotencyRegistry({ maxEntries: 100 })
  const mcp = new ProvidentMcpServer({ backend, transport, port, gate, moduleStore, router: moduleRouter, ragStore: runtime.getDefaultStore(), retrievalEngine: runtime.getDefaultEngine(), templateStore, ragStores: runtime.getDirectory(), runtime, auditLog, engineRagStore, engineCrudRagStore, authorityStore, idempotency })

  // The manual-UI settings IPC: main owns the config + re-wires the MCP server
  // tool-gating on change. This is manual-UI-ONLY — it is NOT reachable over an
  // MCP tool (the MCP tool handlers never route to it), so an agent cannot grant
  // itself capabilities.
  ipcMain.handle(IPC_SECURITY_GET, () => securityStore.get())
  ipcMain.handle(IPC_SECURITY_SET, (_event, patch: { token?: string | null; groups?: string[]; disable?: string[]; maxJournalLength?: number | null }) => {
    const updated = securityStore.set(patch)
    // L3 — re-gate the live MCP server from the STORE's FILTERED result (the
    // diff of the persisted enabled set), NOT the raw patch. This keeps the
    // live gate and the persisted config in sync: a group the store drops
    // (unknown/invalid) is never enabled live, and a group it keeps is enabled
    // live exactly as persisted.
    const gatePatch = gatePatchFromStoreResult(currentEnabled, updated)
    // The store only keeps VALID groups (all of which are ToolGroup), so the
    // cast is safe — the store's filtered result is the source of truth.
    mcp.applyGatePatch({ token: gatePatch.token, groups: gatePatch.groups as ToolGroup[], disable: gatePatch.disable as ToolGroup[] })
    currentEnabled = updated.enabled
    // U-STORE-SECURITY-WRITE §1.1 member 3 / §2.4 item 4 — THE ADDITIVE MEMBER:
    // the EXISTING return now answers `{ ...updated, write: … }`, so the persist
    // outcome rides the SET response as a record of its OWN (the persisted type
    // `SecuritySettings` is NOT widened — ruling (iv) row 1). The store's writer
    // call site above stays the ONLY one in this file.
    return { ...updated, write: securityStore.lastWriteReceipt() }
  })

  // U-STORE-PERSIST-ADOPT §2.4 / §1.1 members 2-3 — THE `Y-1`/`Y-2` CHANNELS.
  // Registered in THIS existing `ipcMain.handle(…)` block and BEFORE the window
  // is created. The channel-name constants are IMPORTED from
  // `./store-channels.js` (the F-8 single source — never re-spelled here).
  //
  // `Y-1` (the boot hand-off): NO request; answers the persisted reference list.
  // It NEVER throws — not for a missing file, not for a corrupt file, not for
  // any read-back failure; a `Y-1` that throws fails `F-9`. §2.6 clause (c): the
  // hand-off is SERVED at each realm's `Y-1` (a reload is a new realm, so its
  // hand-off answers the FILE's current value).
  ipcMain.handle(STORE_FILE_GET, () => {
    const rows = readStoreCarrier(storeCarrier)
    // §2.6 clauses (a)/(c) — REFRESHED from the file's current value and SERVED
    bootRecord = rows
    return rows
  })
  // `Y-2` (the commit): `{name, value}` where `value` is the stable-JSON
  // translation (a JSON string); answers EXACTLY ONE of `{committed, refused}`.
  // A refused persist is ALWAYS a returned receipt — never a swallow, never a
  // silent no-op, never a throw. §2.6 clause (b): a COMMITTED write
  // synchronously REPLACES the holder with the projected record; clause (d): the
  // holder is NEVER consulted for a write (the payload is authoritative).
  ipcMain.handle(STORE_FILE_PUT, (_event, row: unknown) => {
    const payload = (row ?? null) as { name?: unknown; value?: unknown } | null
    if (payload === null || typeof payload !== 'object' || typeof payload.name !== 'string' || payload.name === '') {
      return { status: 'refused', reason: 'malformed-payload' } satisfies StoreChannelReceipt
    }
    const { receipt, rows } = projectAndWrite(storeCarrier, payload.value)
    if (receipt.status === 'committed' && rows !== null) bootRecord = rows
    return receipt
  })

  // U8 — the module management IPC (module-feature-list.md §4). Manual-UI only:
  // the module store is operator-owned; an agent never reaches it over MCP.
  const moduleBridgeResult = () => {
    const status = moduleStore.status()
    return {
      corrupt: status.corrupt,
      quarantined: status.quarantined,
      loaded: status.loaded,
      modules: moduleStore.list().map((r) => ({
        name: r.name,
        version: r.version,
        capabilities: r.capabilities,
        disabled: r.disabled,
        quarantined: r.quarantined,
      })),
    }
  }
  ipcMain.handle(IPC_MODULE_GET, () => moduleBridgeResult())
  ipcMain.handle(IPC_MODULE_SET_DISABLED, (_event, payload: { name?: string; disabled?: boolean }) => {
    if (typeof payload?.name === 'string' && payload.name !== '') {
      moduleStore.setDisabled(payload.name, payload.disabled === true)
      // U9-FIX (#2) — disabling/enabling a module must re-sync the live router
      // so its tools are registered/deregistered accordingly.
      syncModuleRouter(moduleRouter, moduleStore)
    }
    return moduleBridgeResult()
  })
  // W1-N6 (PG12) — the operator-only module-tool runner IPC. Manual-UI only:
  // the MCP tool handlers never route here, so this is not an agent surface.
  // `listTools` reports the live `CapabilityRouter`'s registered
  // `module:<name>.<tool>` names; `invoke` routes through the server's live-gate
  // `invokeTool` — the EXISTING module + code two-gate (the SAME seam the MCP
  // SDK calls use, so the live gate and the runner never diverge). No new tool.
  ipcMain.handle(IPC_MODULE_TOOL_LIST, () => moduleRouter.listTools())
  ipcMain.handle(IPC_MODULE_TOOL_INVOKE, (_event, payload: ModuleToolInvokePayload) => {
    const tool = typeof payload?.tool === 'string' ? payload.tool : ''
    if (tool === '') throw new Error('module-tools-invoke: tool required')
    return mcp.invokeTool(tool, payload.args)
  })

  // Unit D §5.1.10 — the UI commit-on-blur write-back. The renderer sends an
  // `edit-commit` IPC on blur; main calls the SAME edit op (`setContent`) as
  // the MCP tool (MCP/UI equivalence — §5.7), then broadcasts the
  // `rag-store-changed` re-traversal trigger (§5.1.9). Returns a CommitResult
  // shape so the renderer's injected commit can surface store errors.
  ipcMain.handle(IPC_EDIT_COMMIT, async (_event, payload: EditCommitPayload) => {
    if (!payload || typeof payload.nodeId !== 'string' || typeof payload.content !== 'string') {
      return { ok: false, reason: 'store-error', error: 'edit-commit: nodeId and content required' }
    }
    // Unit D §5.1.10 — the SAME edit op (`setContent`) as the MCP tool
    // (MCP/UI equivalence — §5.7). `handleEditCommit` maps a deleted-node race
    // (setContent's `'edit.set_content: node not found'`) to
    // `reason:'deleted-node'` (Finding 4), NOT `store-error`.
    const result = await handleEditCommit(runtime.getDefaultStore(), { nodeId: payload.nodeId, content: payload.content })
    if (result.ok) {
      // F1 — reconcile the maintained retrieval index incrementally, then
      // broadcast the `rag-store-changed` re-traversal trigger to the renderer.
      // The reconcile is fire-and-forget, but a rejection (e.g. the vector
      // embedder's provider is down) MUST be caught — never an unhandled
      // rejection. The lexical index is already reconciled inside the engine's
      // `onStoreChanged` before the embedder hook runs, so a hook failure only
      // leaves the vector index stale (logged), not the lexical index.
      void runtime.getDefaultEngine().onStoreChanged('content', [payload.nodeId], []).catch((e) => {
        console.error('[provident-main] retrieval index reconcile failed:', e)
      })
      const changedPayload: RagStoreChangedPayload = { kind: 'content', nodeIds: [payload.nodeId], edgeIds: [], store: runtime.getDefaultName() }
      backend.broadcast(IPC_RAG_STORE_CHANGED, changedPayload)
    }
    return result
  })

  // Unit P §5.1/§5.4 — the UI batch write-back. The renderer sends an
  // `edit-batch` IPC carrying a batch of `BatchOp` values; main validates the
  // payload, calls the SAME `applyBatch` transaction primitive as the MCP
  // `edit.batch` tool (MCP/UI equivalence — §8.2 BINDING), then broadcasts the
  // `rag-store-changed` re-traversal trigger (§5.4) on success. A malformed
  // payload or a failed batch is a domain result (never a throw) and broadcasts
  // 0 times (A1/A2); a successful batch broadcasts EXACTLY ONCE (A4).
  ipcMain.handle(IPC_EDIT_BATCH, async (_event, payload: EditBatchPayload) => {
    // A1 — a malformed payload is a domain result, never a throw.
    if (!payload || !Array.isArray(payload.ops)) {
      return { ok: false, error: 'edit-batch: ops must be an array', failedIndex: 0 }
    }
    // Capture the pre-batch node snapshot for the broadcast derivation (A6).
    const preBatchNodes = new Map<string, RagNode>()
    for (const op of payload.ops) {
      if (op && op.op === 'putNode' && op.node && typeof op.node.id === 'string') {
        const n = runtime.getDefaultStore().getNode(op.node.id)
        if (n) preBatchNodes.set(op.node.id, n)
      }
    }
    const result = await handleEditBatch(runtime.getDefaultStore(), payload)
    if (result.ok) {
      // A4 — a successful batch broadcasts EXACTLY ONCE. Reconcile the
      // maintained retrieval index incrementally, then broadcast the
      // `rag-store-changed` re-traversal trigger. The reconcile is
      // fire-and-forget, but a rejection (e.g. the vector embedder's provider
      // is down) MUST be caught — never an unhandled rejection (the same
      // pattern as the `IPC_EDIT_COMMIT` handler, Unit D §5.1.10).
      const { kind, nodeIds, edgeIds } = deriveBatchBroadcast(payload.ops, result.results, preBatchNodes)
      void runtime.getDefaultEngine().onStoreChanged(kind, nodeIds, edgeIds).catch((e) => {
        console.error('[provident-main] retrieval index reconcile failed:', e)
      })
      const changedPayload: RagStoreChangedPayload = { kind, nodeIds, edgeIds, store: runtime.getDefaultName() }
      backend.broadcast(IPC_RAG_STORE_CHANGED, changedPayload)
    }
    return result
  })

  // Unit U5 §1.3 — the atomic rich-text write-back (decision A). The renderer
  // sends an `edit-rich-commit` IPC carrying the FULL decomposed `{content,
  // children}` of a contenteditable blur (Unit U2/U4); main calls the SAME
  // `setRichText` op once (one atomic putNode), then derives + broadcasts the
  // `rag-store-changed` re-traversal trigger on a REAL change. A no-op commit
  // broadcasts 0 times (idempotent — no redundant re-derive); a failed op or
  // malformed payload broadcasts 0 times.
  ipcMain.handle(IPC_EDIT_RICH_COMMIT, (_event, payload: EditRichCommitPayload) => {
    // F1 — the derive→reconcile→broadcast-once body is the node-testable
    // `handleRichCommitIpc` (edit-ops.ts, Unit U5 §1.3 — §2.1 states 24-27 +
    // ADR-2/3/11, F2 ADR-9 before-guard). This handler binds the Electron
    // boundary (the retrieval-index reconcile + the `rag-store-changed`
    // broadcast). The boundary check (A1) lives INSIDE `handleRichCommitIpc`,
    // so the malformed/failed/no-op/real-change broadcast contract is covered
    // by the F1 regression tests against the shared handler.
    return handleRichCommitIpc(runtime.getDefaultStore(), payload, {
      reconcile: (kind, nodeIds, edgeIds) => runtime.getDefaultEngine().onStoreChanged(kind, nodeIds, edgeIds),
      broadcast: (kind, nodeIds, edgeIds) => {
        const changedPayload: RagStoreChangedPayload = { kind, nodeIds, edgeIds, store: runtime.getDefaultName() }
        backend.broadcast(IPC_RAG_STORE_CHANGED, changedPayload)
      },
    })
  })

  // Unit E §5.7/§8.2 — the UI retrieval path. The `rag-query` IPC calls the SAME
  // maintained retrieval engine as the MCP `rag.query` tool (MCP/UI
  // equivalence — a BINDING constraint). The renderer never computes retrieval
  // itself. U-MS2 §5.4 step 4 (F4) — the SAME directory injection as the MCP
  // path: the resolver behaves IDENTICALLY on both surfaces (at U-MS2 the
  // payload carries no `store` field ⇒ the omitted ⇒ default-entry rule
  // applies; U-MS5's additive field resolves through the SAME resolver).
  ipcMain.handle(IPC_RAG_QUERY, (_event, payload: RagQueryPayload) => {
    // W1-N9 — forward the advanced-search args (mode/maxHops/expand/
    // maxParentContext/filters) alongside query/topK/store/stores so the UI IPC
    // and the MCP `rag.query` tool resolve/validate the SAME field set.
    return handleRagQueryIpc(
      runtime.getDefaultEngine(),
      runtime.getDefaultStore(),
      {
        query: payload?.query,
        topK: payload?.topK,
        store: payload?.store,
        stores: payload?.stores,
        mode: payload?.mode,
        maxHops: payload?.maxHops,
        expand: payload?.expand,
        maxParentContext: payload?.maxParentContext,
        filters: payload?.filters,
      },
      runtime.getDirectory(),
      auditLog,
    )
  })

  // Unit G §5.4/§8.2 — the UI backlink path. The `rag-backlinks` IPC calls the
  // SAME host-side enumeration (`enumerateLinks`) as the MCP `rag.backlinks`
  // tool (MCP/UI equivalence — a BINDING constraint). The renderer never
  // computes the enumeration itself.
  ipcMain.handle(IPC_RAG_BACKLINKS, (_event, payload: RagBacklinksPayload) => {
    return handleRagBacklinksIpc(runtime.getDefaultStore(), { nodeId: payload?.nodeId })
  })

  // Unit V3 §5.1 — the UI doc-nav path. The `rag-doc-heads` IPC calls the SAME
  // shared handler (`handleRagDocHeadsIpc`) as the doc-nav data source, returning
  // the document list (the `doc-head` edges' targets + the head node content) — a
  // strict subset of the snapshot. The renderer never computes the doc-heads
  // derivation itself.
  ipcMain.handle(IPC_RAG_DOC_HEADS, () => {
    return handleRagDocHeadsIpc(runtime.getDefaultStore())
  })

  // U-MS5 — the read-only settings-pane store listing. Manual-UI ONLY: the MCP
  // tool handlers never route to this channel, so an agent cannot enumerate the
  // configured store names (B9/A9). NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED,
  // decisions.md:45) and NOT a five-seam gate seam — no RpcMethod, no TOOL_GROUPS
  // row, no ALL_TOOLS row, no MUTATING_METHODS member, no renderer-switch method
  // (the MCP tool census stays 12). U-H2b §5.8/A-P2-3 — the handler projects the
  // runtime's CURRENT resolved projection (`currentStores()` + `statusOf`), NOT
  // the boot `registry` const: a renderer pull after a registry apply shows the fresh
  // state (refresh-on-apply). The registry file is still NEVER re-read on this
  // idle path (D8 — the boot path re-reads nothing; the runtime's apply seam is
  // the ONLY re-read).
  ipcMain.handle(IPC_RAG_STORE_LISTING, () => {
    // U-H2b §5.8/B12 — the runtime's CURRENT resolved projection (A-P2-3): the
    // fresh `loaded.stores` after an apply, the boot registry at boot. The FILE
    // NAME (basename) + `corpusRoot ?? null` projection is byte-equal to the
    // previous boot-cached projection.
    const listingEntries = runtime.currentStores().map((s) => ({
      name: s.name,
      default: s.default,
      persistenceFile: basename(s.persistenceFile),
      corpusRoot: s.corpusRoot ?? null,
    }))
    return handleRagStoreListingIpc(
      listingEntries,
      // U-H2b §5.8/B12 — the per-store load status is resolved via the
      // runtime's `statusOf` (the U-MS2 D7 matrix over the LIVE entries: loaded
      // / failed-corrupt / failed-missing). An unknown store throws
      // `rag-store-runtime: unknown store '<name>'` (byte-pinned R-status-unknown).
      (name) => runtime.statusOf(name),
    )
  })

  // Unit U-H8 §5.4 — the operator-registry MANAGE wiring (the review §2 D6's ONE
  // operator-UI IPC exemption: the operator editor). The shared
  // `handleRagStoreManageIpc` validates the request, reads the live projection per
  // call (A-P2-1), runs the two-phase confirmation (a destructive op without
  // `confirmed:true` returns `{ confirmationRequired: true, summary }` and invokes
  // NO seam), and invokes the LANDED hot-* seams with `confirmed:true` — routing
  // add/remove/rename to a listing-refresh and setDefault/renameDefault to the
  // app re-derive. Manual-UI only: never an MCP tool — an agent cannot manage the
  // registry over MCP (A-P2-6/A-P2-7). NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED).
  ipcMain.handle(IPC_RAG_STORE_MANAGE, (_event, request: unknown) => {
    return handleRagStoreManageIpc(runtime, request)
  })

  // Unit I §5.4/§8.2 — the UI template IPC surface. Each renderer→main
  // `code.template.*`-equivalent channel delegates to `handleTemplateTool` with
  // the SAME template store as the MCP tools (MCP/UI equivalence — a BINDING
  // constraint). The mutating handlers broadcast `template-changed` on success
  // (the whole-graph re-derive trigger). The IPC surface is NOT group-gated
  // (the renderer is a trusted surface; the `code` group gates the MCP agent
  // path).
  const handleTemplateIpc = (name: string) => (_event: unknown, payload: unknown) => {
    return handleTemplateTool(templateStore, name, (payload ?? {}) as Record<string, unknown>, (p) => {
      backend.broadcast(IPC_TEMPLATE_CHANGED, p)
    })
  }
  ipcMain.handle(IPC_TEMPLATE_GET, handleTemplateIpc('code.template.get'))
  ipcMain.handle(IPC_TEMPLATE_VALIDATE, handleTemplateIpc('code.template.validate'))
  ipcMain.handle(IPC_TEMPLATE_SET, handleTemplateIpc('code.template.set'))
  ipcMain.handle(IPC_TEMPLATE_CREATE, handleTemplateIpc('code.template.create'))
  ipcMain.handle(IPC_TEMPLATE_DELETE, handleTemplateIpc('code.template.delete'))
  ipcMain.handle(IPC_TEMPLATE_RESET, handleTemplateIpc('code.template.reset'))

  // Unit K §5.4 M9 — the operator-settings IPC surface. Manual-UI only: the
  // `settings` pane reads/writes the operator-owned config over these channels;
  // the MCP tool handlers never route to them, so an agent cannot change the
  // operator's view/retrieval defaults.
  ipcMain.handle(IPC_OPERATOR_SETTINGS_GET, () => operatorSettingsStore.get())
  ipcMain.handle(IPC_OPERATOR_SETTINGS_SET, (_event, patch: OperatorSettingsPatch) => {
    const updated = operatorSettingsStore.set(patch)
    // Unit U1 §1.3 — the operator-settings-change broadcast (the re-derive
    // trigger). Payload = the store's filtered/coerced result (single source of
    // truth = the main store), NOT the raw patch. One-way notification, fired
    // exactly once per SET (the store's set never throws for a domain failure).
    // GET never broadcasts.
    backend.broadcast(IPC_OPERATOR_SETTINGS_CHANGED, updated)
    return updated
  })

  // Unit GN-MCP-UI §5.5 — the gnosis GUI bridge IPC (D4 MCP/UI parity). The
  // `gnosis-status` operator pane + the `gnosis-query` app-graph pane reach the
  // SAME main-process handler as the `gnosis.*` MCP tools (MCP/UI equivalence via
  // the LANDED proxy — the renderer never computes engine retrieval itself). A
  // rejection (e.g. the D2 engine-absent `EngineUnavailable`) propagates as the
  // invoke rejection so the pane handler catches it and renders the unavailable
  // state (never a crash). Manual-UI only: the MCP tool handlers never route to
  // these channels (an agent cannot grant itself the gnosis group).
  ipcMain.handle(IPC_GNOSIS_STATUS, () => {
    return handleGnosisTool(engineRagStore, 'gnosis.status', {})
  })
  ipcMain.handle(IPC_GNOSIS_QUERY, (_event, args: Record<string, unknown>) => {
    return handleGnosisTool(engineRagStore, 'gnosis.query', args ?? {})
  })

  // Unit A2 §5.5 — the gnosis document/wiki GUI bridge IPC (D4 MCP/UI parity).
  // The `gnosis-documents`/`gnosis-wikis` app-graph panes reach the SAME
  // main-process handler as the `gnosis.document.*`/`gnosis.wiki.*` MCP tools
  // (MCP/UI equivalence via the LANDED CRUD proxy — the renderer never computes
  // document/wiki CRUD itself). The mutating tools resolve the caller's
  // edit-authority credential from the `authorityStore`; the create tools dedup
  // via the `idempotency` registry. A rejection (e.g. the D2 engine-absent
  // `EngineUnavailable`, or a `ConflictError` 409) propagates as the invoke
  // rejection so the pane handler catches it and renders the unavailable/conflict
  // state (never a crash). Manual-UI only: the MCP tool handlers never route to
  // these channels (an agent cannot grant itself the gnosis/gnosis-edit groups).
  ipcMain.handle(IPC_GNOSIS_DOCUMENTS, (_event, payload: { tool?: string; args?: Record<string, unknown> }) => {
    const tool = typeof payload?.tool === 'string' ? payload.tool : ''
    return handleGnosisTool(engineRagStore, tool, (payload?.args ?? {}) as Record<string, unknown>, auditLog, engineCrudRagStore, authorityStore, idempotency)
  })
  ipcMain.handle(IPC_GNOSIS_WIKIS, (_event, payload: { tool?: string; args?: Record<string, unknown> }) => {
    const tool = typeof payload?.tool === 'string' ? payload.tool : ''
    return handleGnosisTool(engineRagStore, tool, (payload?.args ?? {}) as Record<string, unknown>, auditLog, engineCrudRagStore, authorityStore, idempotency)
  })

  // Finding 3 — the re-traversal data source. The renderer's `onRebuild`
  // re-traversal (Unit C `buildTraversal`) needs the RAG store's nodes/edges,
  // which live in MAIN (the single-writer store). This IPC returns a read-only
  // snapshot so the renderer can re-derive the graph + back-reference map after
  // a `rag-store-changed` broadcast.
  // §3.6b — the MAIN-side recorder instance (the OPTIONAL `snapshot.clone`
  // refinement): its one recorded span covers the round trip's INSIDE — the store
  // read + the reply-payload CONSTRUCTION share (RUL-3: Electron's structured clone
  // of the returned value is not on any host-side path, so it is named as
  // structurally unmeasurable, never wrapped). Inert when unarmed: the handler body
  // (the same two reads + the same reply payload) is unchanged, and the records are
  // never transported out (the report records `snapshot.clone` structural with the
  // exact reason, §3.6b/S15).
  ipcMain.handle(IPC_RAG_SNAPSHOT, () =>
    o0MainRecorder.record('snapshot.clone', () => ({
      nodes: runtime.getDefaultStore().listNodes(),
      edges: runtime.getDefaultStore().listEdges(),
      store: runtime.getDefaultName(),
    })))

  // Unit U-EDIT-2 (C16) §2.5 — the project-journal host seam. C16's undo/redo
  // controls + history sub-pane consume the RAG store's PROJECT journal
  // (DECIDED: C16-CONSUMES-PROJECT-JOURNAL), NOT the engine Supervisor journal.
  // `IPC_RAG_JOURNAL` returns the SANITIZED read (the `before`/`after`/`ops`/
  // `inverse` payloads never cross the boundary). `IPC_RAG_JOURNAL_OP` calls the
  // store's single-writer `undo()`/`redo()` and, on success, emits the existing
  // `rag-store-changed` broadcast so the renderer re-derives. A domain no-op
  // (`ok:false`) broadcasts 0 times (never a redundant re-derive); a malformed
  // payload/action is a domain result, never a throw (the shared handler).
  ipcMain.handle(IPC_RAG_JOURNAL, () => handleRagJournalIpc(runtime.getDefaultStore()))
  ipcMain.handle(IPC_RAG_JOURNAL_OP, async (_event, payload: { action?: unknown }) => {
    const store = runtime.getDefaultStore()
    const action = payload?.action
    // Read the op's target entry BEFORE the mutation so the broadcast can carry
    // the changed kind/id (the result shape carries only `entryIndex`).
    const journal = store.journal()
    const targetIndex = action === 'undo' ? store.undoDepth() - 1 : store.undoDepth()
    const target = targetIndex >= 0 && targetIndex < journal.length ? journal[targetIndex] : null
    const result = await handleRagJournalOpIpc(store, payload ?? {})
    if (result.ok) {
      const kind: 'content' | 'structural' = target?.kind === 'structural' ? 'structural' : 'content'
      const nodeIds = target?.kind === 'content' ? [target.nodeId] : []
      void runtime.getDefaultEngine().onStoreChanged(kind, nodeIds, []).catch((e) => {
        console.error('[provident-main] retrieval index reconcile failed:', e)
      })
      const changedPayload: RagStoreChangedPayload = { kind, nodeIds, edgeIds: [], store: runtime.getDefaultName() }
      backend.broadcast(IPC_RAG_STORE_CHANGED, changedPayload)
    }
    return result
  })

  // The MCP stdio transport is spawned by a client (the battery, a test, or an
  // agent). When that client disconnects, stdin closes. Exit so a test run does
  // NOT leave an orphaned Electron app instance open on the machine — otherwise
  // every test spawn leaves a live BrowserWindow behind.
  if (transport === 'stdio') {
    process.stdin.on('end', () => {
      console.error('[provident-main] stdin closed — MCP client disconnected; exiting')
      void mcp.close().finally(() => app.exit(0))
    })
    process.stdin.on('error', () => {
      void mcp.close().finally(() => app.exit(0))
    })
  }

  ipcMain.on(IPC_READY, () => {
    backend.markReady()
    // `B-2` §2 item 7 — **THE REALM HAS ARRIVED: THE PRE-WINDOW QUEUE IS FLUSHED HERE**, inside this EXISTING body and AFTER
    // the landed readiness act. BOTH halves of that are the claim: the renderer subscribes ABOVE `bridge.ready()` (so this
    // signal is what tells it a realm exists), and the push's consumer answers with a `display.read()` invoke that main
    // dispatches only once the backend is ready — so an arm issued BEFORE `markReady()` would hand the realm a signal whose
    // read is not yet armed. ONE push per arrival, unconditionally: a RELOADED realm is owed one too.
    displayQueue.arm()
    console.error('[provident-main] renderer ready — MCP backend armed')
  })
  // §2.2 `B-1` item 4 — the renderer boot chain's COMPLETION signal (its own
  // `.then(...)` boundary: "the app's initial graph install has completed") and
  // its FAILURE signal (the `.catch(...)` text). The renderer's boot chain is
  // the only source; a default launch's backend ignores it (no observable).
  ipcMain.on(IPC_BOOT_READY, (_event, signal: BootInstallSignal) => {
    backend.markBootSettled(signal ?? { ok: false, error: 'the renderer boot chain failed without a signal' })
  })
  ipcMain.on(IPC_REPLY, (_event, reply: RpcReply) => {
    backend.handleReply(reply)
  })
  // N4 (live-notification-review.md) — the app-graph-changed push from the
  // renderer. Maps it into a resource-updated notification over the stdio MCP
  // server (N2: HTTP is stateless → no-op). Sourced ONLY from the app Runtime
  // re-render; SecurePanels never emits here.
  ipcMain.on(IPC_NOTIFY, (_event, payload: NotifyPayload) => {
    void mcp.notifyGraphChanged()
  })

  const win = new BrowserWindow({
    width: 980,
    height: 720,
    // LIVE-2 (outer-chrome tabs): hide the native title bar and let the web
    // content (the tab strip) BE the window's title bar, with the standard
    // window controls (min/max/close) overlaid top-right (`titleBarOverlay`,
    // Windows/Linux). The tab strip's drag region makes the bar draggable.
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#1b1f24', symbolColor: '#e8eaed', height: 36 },
    webPreferences: {
      preload: join(here, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  backend.attachWindow(win)
  // U-MENU-1 §2.1 — install the application menu once the window exists (the
  // dialog is parented to it). Rebuilt on every `IPC_PANE_CATALOG` push.
  mainWindow = win
  rebuildApplicationMenu()

  const rendererHtml = join(here, '..', 'renderer', 'index.html')
  await win.loadFile(rendererHtml)

  // Unit `B-4` `engine-changes` §4 site (4) — **THE FEED CONNECTS HERE, AND ONLY HERE** (`F-2`, ruled by `L1`): the window exists
  // (`new BrowserWindow` above, `backend.attachWindow` binds it) and its content has loaded, so the connection's announcement, the
  // re-read's descriptor and every later frame of that connection land in a realm that can receive them. **NOT AWAITED** — an
  // absent engine must never hold the boot (the `waitForReady`-is-not-awaited precedent, `:839-841`), and `connect()` never
  // rejects (`c8`). The re-read now starts from the connection's own announcement, not from this call (`ASM-B4-5`), so the moment
  // of this call costs nothing but the realm. What this site does NOT claim: that the renderer has already registered its
  // `rag-store-changed` listener (`SidebarPanes.boot()`'s byte, `B-6`/`B-8`'s receipt).
  void engineChangesFeed.connect()

  await mcp.start()

  // Unit F §5.12 — the fire-and-forget background build (F1 discipline): the
  // window + MCP server started immediately (the pending phase serves
  // LEXICALLY through the shared engine); a build failure is LOGGED and the
  // engine STAYS pending — never an unhandled rejection.
  if (vectorBoot) {
    void vectorBoot.start().catch((e) => {
      console.error('[provident-main] vector boot build failed (staying pending):', e)
    })
  }

  win.on('closed', () => {
    void mcp.close()
    app.quit()
  })
}

app.whenReady().then(() => {
  void main().catch((e) => {
    console.error('[provident-main] fatal:', e)
    app.exit(1)
  })
})

app.on('window-all-closed', () => {
  app.quit()
})