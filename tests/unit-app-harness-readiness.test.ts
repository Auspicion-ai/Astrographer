// tests/unit-app-harness-readiness.test.ts
// U-APP-HARNESS-READINESS — THE CLASS (a) RED SET (docs/specs/unit-app-harness-readiness.md §1.2,
// §5.1 class (a), §5.2 R-1…R-11, §3.4's "what the red set must NOT do").
//
// AUTHORIZED SURFACE (§1.2): this file and `tests/unit-app-harness-readiness-register.test.ts`
// are the unit's two new files. This one carries the CONTRACT rows; the other carries the typed
// register (§4). No other path is written by this red pass, and `src/**` is the implementer's.
//
// WHAT THIS FILE IS (§5.1 class (a)): rows over the PURE functions of `src/main/security.ts`
// (§2.1 item 5's pinned signatures), the UNCHANGED defaults (`defaultSecurityConfig`,
// `VALID_GROUPS`, the default tool set), the MCP handler's presence/pending behaviour driven with
// a fake backend, the `main.ts` launch/refusal SOURCE properties, and the absence of a
// self-escalation surface. No Electron is booted, `'electron'` is NOT mocked (the protected
// bridge-mock name-set is exactly five names — a sixth mock reds a PROTECTED row), no
// `src/renderer/**` module is IMPORTED (only its SOURCE TEXT is read, as `R-4`/`R-5`/`R-12` do and
// as the sibling unit's rows already do), and `npm run divergence` is never spawned from a row.
//
// ⟨THE OBSERVED SEAM — DECLARED, NOT ASSUMED SILENTLY.⟩ §2.2 `B-1` pins the OBSERVABLE (a `boot`
// member on the `provident.list_targets` reply, its five members, its three statuses, the
// presence rule and the no-blocking pending read) but leaves the implementer's least-code SHAPE
// free (§1.2: "`RendererBackend` gains the boot-install state + its transitions (a new method
// beside the idempotent `markReady()`)"). These rows therefore bind to the ONE surface §1.2
// authorizes the red set to read — "the `RendererBackend` surface with a fake window" — and name
// the seam explicitly:
//
//   1. OPT-IN     `new RendererBackend({ bootObservable: true })`  (accepted alternative:
//                 `backend.enableBootObservable()`);
//   2. TRANSITION `backend.markBootSettled({ ok, error? })` for the boot chain's `.then` (`ok:
//                 true`) and its `.catch` (`ok: false, error: <the chain's own text>`)
//                 (accepted alternative: `markBootInstalled()` + `markBootFailed(error)`);
//   3. the RELOAD RE-ARM is driven through the EXISTING surface only (`attachWindow` + two
//                 `did-finish-load` events, then a further `markReady()`), so no name is invented
//                 for it.
//
// The seam's absence at this head is a COUNTEREXAMPLE (a red row), never a compile error: the
// module is imported as a NAMESPACE and every member is feature-detected, so a row reports
// "the surface does not exist" instead of failing collection. THE SEAM'S NAMING IS A REMAND to
// the supervisor/architect (the contract pins the reply, not the setter) — it is reported in the
// red-set report, never resolved silently here.
//
// ⟨ENUMERATED DATA STATES (the enablement route, §2.1 item 6).⟩
//   S1 no flag, no env ........................ source 'none', effective = base ∪ persisted
//   S2 flag only, well-formed ................. source 'argv'
//   S3 env only, well-formed .................. source 'env'
//   S4 both well-formed ....................... source 'argv'; the env value is IGNORED
//   S5 flag with duplicates ('graph,graph') ... accepted, deduplicated
//   S6 flag restating the default ............. accepted, a no-op (additivity)
//   S7 flag + persisted groups ................ union(base, persisted, requested)
//   S8 empty ENV value ........................ "no request" (source 'none') — NOT a refusal
//   S9 empty FLAG value ....................... REFUSAL (a present flag with no value)
//   S10 empty token inside a list ............. REFUSAL (names the position)
//   S11 leading/trailing ',' .................. REFUSAL
//   S12 whitespace token ('graph, rag') ....... REFUSAL (no trimming; the offender is quoted)
//   S13 no '=' / space-separated form ......... REFUSAL (malformed FORM)
//   S14 the flag twice in argv ................ REFUSAL (ambiguous)
//   S15 unknown group name .................... REFUSAL (names the vocabulary)
//   S16 case variant ('Graph') ................ REFUSAL (no case folding)
//   S17 non-string env value (hostile) ........ REFUSAL or ABSENT — see the row's own note
//
// ⟨ENUMERATED OBSERVABLE STATES (§2.2 `B-1` item 2/3).⟩
//   B0 absent  (no opt-in) → the reply is `{ nodes }` exactly, no `boot` key at all (`P-6`)
//   B1 pending (epoch 1, generation 0, error null) — the poll's start state
//   B2 installed (epoch 1, generation ≥ 1, installed true)
//   B3 failed  (error non-null; `installed` false — never a fall-back to `installed`, `F-4`)
//   B4 re-armed (a renderer reload: epoch ≥ 2, status back to 'pending', generation 0) — `O-5`
//
// ⟨THE FAIL-STATES THIS FILE COVERS (§3.2).⟩
//   F-1 a malformed/unknown/duplicate/empty-value request ⇒ named refusal + `app.exit(2)` (R-5)
//   F-2 a client connects before the first ready signal ⇒ `pending` + `nodes: []`, no await (R-9),
//       AND the shortcut is NOT given to `get_rendered_html`/`get_node_state`/`dispatch` (R-9)
//   F-3 `boot` ABSENT under an opt-in ⇒ the CLIENT stops with a named failure (the register's
//       `P-SM-3`; this file's rows are the app side of the same state)
//   F-4 the boot chain fails ⇒ `failed` + non-null `error`, no retry, no `pending`-forever (R-8)
//   F-5 a load BEFORE `installed` ⇒ the app's behaviour is UNCHANGED: NO guard is added inside
//       `Runtime.load` (`R-12`, the refused-alternative fence)
//   F-6 any number turned into a delay ⇒ REFUSED: no timer-based wait in the app's boot path,
//       and `O-1`'s `~250–540 ms` is never a budget (`R-12`)
//   F-7 the env fallback inherited by a child process ⇒ today no `src/**` child spawn forwards
//       `env:`; a future one MUST re-open the row (`R-12`)
//   F-9 a group grant never substitutes for the token (the register's `P-TP-2` + `R-10`)
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import * as securityNs from '../src/main/security.js'
import { groupForTool, SecurityGate, defaultSecurityConfig, type ToolGroup } from '../src/main/security.js'
import {
  ProvidentMcpServer,
  RendererBackend,
  type McpBackend,
  type RendererBackendOptions,
} from '../src/main/mcp-server.js'

// ---------------------------------------------------------------------------
// The source texts the ROUTE rows read (§1.2: "must read source text / exported pure functions /
// the `RendererBackend` surface with a fake window"). A source property is a PROPERTY, never a
// line number (§3.4).
// ---------------------------------------------------------------------------
const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')

function readText(rel: string): string {
  try {
    return readFileSync(join(REPO_ROOT, rel), 'utf8')
  } catch (e) {
    throw new Error(`U-APP-HARNESS-READINESS [T] read failure: ${rel} — ${(e as Error).message}`)
  }
}

const SECURITY_SRC = readText('src/main/security.ts')
const SECURITY_STORE_SRC = readText('src/main/security-store.ts')
const MCP_SRC = readText('src/main/mcp-server.ts')
const MAIN_SRC = readText('src/main/main.ts')
const RUNTIME_SRC = readText('src/renderer/runtime.ts')
const VITEST_SRC = readText('vitest.config.ts')
const PKG = JSON.parse(readText('package.json')) as { scripts?: Record<string, string> }

/** The balanced body of the bracket pair opening at `openIndex` (a SHAPE read, never a line). */
function balancedBody(src: string, openIndex: number): string | null {
  const open = src[openIndex]
  const close = open === '[' ? ']' : open === '{' ? '}' : open === '(' ? ')' : ''
  if (close === '') return null
  let depth = 0
  let i = openIndex
  while (i < src.length) {
    const c = src[i]!
    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) return src.slice(openIndex + 1, i)
    }
    i++
  }
  return null
}

/** The slice from `fromText` to the end of its balanced bracket pair (null when absent). */
function sliceFrom(src: string, fromText: string, at = 0): { at: number; body: string } | null {
  const start = src.indexOf(fromText, at)
  if (start < 0) return null
  const open = src.indexOf('(', start)
  if (open < 0) return null
  const body = balancedBody(src, open)
  return body === null ? null : { at: start, body }
}

/** The BLOCK body (`{ … }`) opening after the first occurrence of `fromText` (a function's or a
 *  method's own body, or an `if (…) { … }` block) — a shape read, never a line number. */
function blockAfter(src: string, fromText: string, at = 0): { at: number; body: string } | null {
  const start = src.indexOf(fromText, at)
  if (start < 0) return null
  const open = src.indexOf('{', start)
  if (open < 0) return null
  const body = balancedBody(src, open)
  return body === null ? null : { at: start, body }
}

/** The `VALID_GROUPS` literal of a source file, as a set of names (the `S-4` two-place fence). */
function validGroupsOf(src: string): string[] | null {
  const at = src.indexOf('VALID_GROUPS')
  if (at < 0) return null
  const open = src.indexOf('[', at)
  if (open < 0) return null
  const body = balancedBody(src, open)
  if (body === null) return null
  const names = body
    .split(',')
    .map((t) => t.trim().replace(/^['"]|['"]$/g, ''))
    .filter((t) => t !== '')
  return names
}

/** A snapshot of the PRE-CHANGE default registered/allowed set, captured at collection time from
 *  the source tables (`R-7` / `P-IM-1`'s "captured pre-change list"). The literal below is the
 *  same set written out by hand so a hand-edited `TOOL_GROUPS` cannot move BOTH sides of the row. */
const PRE_CHANGE_DEFAULT_ALLOWED: string[] = [
  'provident.code.get',
  'provident.code.validate',
  'provident.dispatch',
  'provident.focus',
  'provident.get_journal',
  'provident.get_markdown',
  'provident.get_node_state',
  'provident.get_rendered_html',
  'provident.list_targets',
]

/** The full `ALL_TOOLS` census at this head (`R-7`: "no new member is added to `ALL_TOOLS`"). */
const PRE_CHANGE_ALL_TOOLS: string[] = [
  'provident.dispatch',
  'provident.focus',
  'provident.get_rendered_html',
  'provident.get_markdown',
  'provident.list_targets',
  'provident.get_node_state',
  'provident.get_journal',
  'provident.code.get',
  'provident.code.validate',
  'provident.load',
  'provident.op',
  'provident.export',
  'provident.validate',
  'provident.teardown',
  'provident.journal',
  'provident.code.set',
  'provident.code.create',
  'provident.code.delete',
  'provident.code.load',
  'provident.code.loadBatch',
  'module.install',
  'module.update',
  'module.list',
  'rag.query',
  'rag.get_document',
  'rag.list_nodes',
  'rag.get_edges',
  'rag.backlinks',
  'rag.list_documents',
  'rag-stream',
  'get_query_audit_log',
  'edit.set_content',
  'edit.create_node',
  'edit.delete_node',
  'edit.split_node',
  'edit.merge_node',
  'edit.set_edge',
  'edit.import_markdown',
  'edit.set_doc_meta',
  'code.template.get',
  'code.template.validate',
  'code.template.set',
  'code.template.create',
  'code.template.delete',
  'code.template.reset',
  'gnosis.query',
  'gnosis.stream',
  'gnosis.status',
  'gnosis.document.get',
  'gnosis.document.list',
  'gnosis.wiki.get',
  'gnosis.wiki.list',
  'gnosis.document.create',
  'gnosis.document.update',
  'gnosis.document.delete',
  'gnosis.document.publish',
  'gnosis.document.unpublish',
  'gnosis.document.archive',
  'gnosis.wiki.create',
]

const NINE_GROUPS: string[] = ['read', 'dispatch', 'graph', 'code', 'module', 'rag', 'edit', 'gnosis', 'gnosis-edit']

// ---------------------------------------------------------------------------
// §2.1 item 5 — THE PINNED PURE SURFACE, imported as a NAMESPACE so a missing export is a ROW
// failure (the red reason `C-10` names: "the missing parser, the missing effective set") and
// never a module-collection error that would take the preservation rows down with it.
// ---------------------------------------------------------------------------
interface EnablementRequestOk {
  ok: true
  requested: ToolGroup[]
  source: 'argv' | 'env' | 'none'
  raw: string | null
}
interface EnablementRequestErr {
  ok: false
  reason: string
  raw: string
  offender: string | null
}
type EnablementRequest = EnablementRequestOk | EnablementRequestErr

interface SecuritySeam {
  parseToolGroupList?: (raw: string | null | undefined) => EnablementRequest
  enablementRequestFrom?: (
    argv: readonly string[],
    env: Record<string, string | undefined>,
  ) => EnablementRequest
  effectiveEnabledGroups?: (
    base: readonly ToolGroup[],
    persisted: readonly string[],
    requested: readonly ToolGroup[],
  ) => ToolGroup[]
}

const SEAM = securityNs as unknown as SecuritySeam

function seamMember<K extends keyof SecuritySeam>(name: K): NonNullable<SecuritySeam[K]> {
  const member = SEAM[name]
  if (typeof member !== 'function') {
    throw new Error(
      `U-APP-HARNESS-READINESS [T] §2.1 item 5 \`${String(name)}\` does not exist at this head — the ` +
        `launch-request surface is absent (red by design; the implementer's least-code shape)`,
    )
  }
  return member as NonNullable<SecuritySeam[K]>
}

// ---------------------------------------------------------------------------
// §4.3 item 3 — THE OBSERVABLE'S SEAM (declared in this file's header). A feature-detected
// adapter: its ABSENCE is a row counterexample, never a collection error.
// ---------------------------------------------------------------------------
class SeamAbsent extends Error {
  constructor(what: string) {
    super(
      `U-APP-HARNESS-READINESS [T] the ${what} seam does not exist at this head. Declared shapes: ` +
        `the opt-in \`new RendererBackend({ bootObservable: true })\` (or \`enableBootObservable()\`) and ` +
        `the transition \`markBootSettled({ ok, error? })\` (or \`markBootInstalled()\` + \`markBootFailed(error)\`) ` +
        `— see this file's header (THE OBSERVED SEAM; REMAND to the supervisor: §2.2 pins the reply, not the setter)`,
    )
  }
}

type BootSignal = { ok: boolean; error?: string | null }

function seamEnable(b: RendererBackend): string {
  const anyB = b as unknown as Record<string, unknown>
  if (anyB['bootObservable'] !== undefined) return 'constructor-option'
  const method = anyB['enableBootObservable']
  if (typeof method === 'function') {
    ;(method as () => void).call(b)
    return 'enableBootObservable()'
  }
  return 'absent'
}

function seamSettle(b: RendererBackend, signal: BootSignal): void {
  const anyB = b as unknown as Record<string, unknown>
  const settled = anyB['markBootSettled']
  if (typeof settled === 'function') {
    ;(settled as (s: BootSignal) => void).call(b, signal)
    return
  }
  const installed = anyB['markBootInstalled']
  const failed = anyB['markBootFailed']
  if (typeof installed === 'function' && typeof failed === 'function') {
    if (signal.ok) (installed as () => void).call(b)
    else (failed as (e: string) => void).call(b, signal.error ?? 'boot failed')
    return
  }
  throw new SeamAbsent('boot-install transition')
}

type InvokeMode = 'answer' | 'hang' | 'reject'

/** The `RendererBackend` the observable rows drive: the REAL state owner, with `invoke` armed by
 *  the row (`F-2`'s hanging / rejecting renderer) and an answerable target list. */
class ProbeBackend extends RendererBackend {
  mode: InvokeMode = 'answer'
  listReply: unknown = { nodes: [] }
  invokeCalls: Array<{ method: string; payload: unknown }> = []

  async invoke(method: string, payload: unknown): Promise<unknown> {
    this.invokeCalls.push({ method, payload })
    if (this.mode === 'hang') return new Promise<never>(() => undefined)
    if (this.mode === 'reject') throw new Error('renderer refused the read (F-2 negative arm)')
    return this.listReply
  }
}

function optInBackend(init?: { mode?: InvokeMode; listReply?: unknown }): ProbeBackend {
  const b = new ProbeBackend({ bootObservable: true } as unknown as RendererBackendOptions)
  // The accepted alternative spelling is attempted too; the row's ASSERTIONS are behavioural
  // (the reply's `boot` member), so a mechanism mismatch can never pass as a green.
  seamEnable(b)
  if (init?.mode !== undefined) b.mode = init.mode
  if (init?.listReply !== undefined) b.listReply = init.listReply
  return b
}

function plainBackend(init?: { mode?: InvokeMode; listReply?: unknown }): ProbeBackend {
  const b = new ProbeBackend({} as RendererBackendOptions)
  if (init?.mode !== undefined) b.mode = init.mode
  if (init?.listReply !== undefined) b.listReply = init.listReply
  return b
}

/** A minimal fake window/event target (`RendererBackend.attachWindow`'s own test seam — the
 *  existing backend tests use the same shape; no Electron is imported). */
function fakeWindow(): { win: unknown; fire: (event: string) => void } {
  const handlers = new Map<string, Array<(...args: unknown[]) => void>>()
  const on = (key: string) => (event: string, cb: (...args: unknown[]) => void) => {
    const list = handlers.get(`${key}:${event}`) ?? []
    list.push(cb)
    handlers.set(`${key}:${event}`, list)
  }
  const webContents = { on: on('wc'), send: () => undefined, isDestroyed: () => false }
  const win = { on: on('w'), webContents, isDestroyed: () => false }
  const fire = (event: string) => {
    for (const cb of handlers.get(`wc:${event}`) ?? []) cb()
    for (const cb of handlers.get(`w:${event}`) ?? []) cb()
  }
  return { win, fire }
}

function attachFakeWindow(b: RendererBackend): { fire: (event: string) => void } {
  const { win, fire } = fakeWindow()
  ;(b as unknown as { attachWindow(w: unknown): void }).attachWindow(win)
  return { fire }
}

type CallOutcome =
  | { kind: 'reply'; reply: unknown }
  | { kind: 'error'; message: string }
  | { kind: 'timeout' }

/** Drive one MCP tool call against a server holding `backend`, with a BOUNDED wait (so a handler
 *  that awaits the renderer is REPORTED as a timeout instead of hanging the suite). */
async function callTool(backend: McpBackend, name: string, args: Record<string, unknown> = {}, boundMs = 1500): Promise<CallOutcome> {
  const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
  const sdk = server.ensureServerRegistered()
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'app-harness-readiness', version: '0.1.0' })
  await Promise.all([
    client.connect(clientTransport),
    (sdk as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
  ])
  try {
    const raced = await Promise.race([
      client
        .callTool({ name, arguments: args })
        .then((r) => ({ kind: 'call' as const, r })),
      new Promise<{ kind: 'timeout' }>((res) => {
        const t = setTimeout(() => res({ kind: 'timeout' }), boundMs)
        if (typeof t === 'object' && t !== null && 'unref' in t) (t as { unref(): void }).unref()
      }),
    ])
    if (raced.kind === 'timeout') return { kind: 'timeout' }
    const result = raced.r
    const content = (result as { content?: Array<{ type: string; text?: string }> }).content ?? []
    const textBlock = content.find((c) => c.type === 'text')
    if ((result as { isError?: boolean }).isError === true || textBlock?.text === undefined) {
      return { kind: 'error', message: textBlock?.text ?? 'the tool call returned no text block' }
    }
    return { kind: 'reply', reply: JSON.parse(textBlock.text) as unknown }
  } catch (e) {
    return { kind: 'error', message: (e as Error)?.message ?? String(e) }
  } finally {
    void client.close().catch(() => undefined)
  }
}

async function readTargets(backend: McpBackend, boundMs = 1500): Promise<CallOutcome> {
  return callTool(backend, 'provident.list_targets', {}, boundMs)
}

/** ONE long-lived server + client pair, so a row can make MANY calls against the SAME gate. */
async function openServer(backend: McpBackend): Promise<{
  server: ProvidentMcpServer
  call: (name: string, args?: Record<string, unknown>, boundMs?: number) => Promise<CallOutcome>
  close: () => Promise<void>
}> {
  const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
  const sdk = server.ensureServerRegistered()
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'app-harness-readiness', version: '0.1.0' })
  await Promise.all([
    client.connect(clientTransport),
    (sdk as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
  ])
  const call = async (name: string, args: Record<string, unknown> = {}, boundMs = 600): Promise<CallOutcome> => {
    try {
      const raced = await Promise.race([
        client.callTool({ name, arguments: args }).then((r) => ({ kind: 'call' as const, r })),
        new Promise<{ kind: 'timeout' }>((res) => {
          const t = setTimeout(() => res({ kind: 'timeout' }), boundMs)
          if (typeof t === 'object' && t !== null && 'unref' in t) (t as { unref(): void }).unref()
        }),
      ])
      if (raced.kind === 'timeout') return { kind: 'timeout' }
      const content = (raced.r as { content?: Array<{ type: string; text?: string }> }).content ?? []
      const textBlock = content.find((c) => c.type === 'text')
      if ((raced.r as { isError?: boolean }).isError === true || textBlock?.text === undefined) {
        return { kind: 'error', message: textBlock?.text ?? 'the tool call returned no text block' }
      }
      return { kind: 'reply', reply: JSON.parse(textBlock.text) as unknown }
    } catch (e) {
      return { kind: 'error', message: (e as Error)?.message ?? String(e) }
    }
  }
  return { server, call, close: async () => { await client.close().catch(() => undefined) } }
}

/** The reply of a call that MUST have answered — a non-answer is reported with its own reason. */
function replied(outcome: CallOutcome, what: string): Record<string, unknown> {
  if (outcome.kind === 'timeout') {
    throw new Error(`${what}: the handler did not answer within the bound (it awaited the renderer — §2.2 B-5 forbids it)`)
  }
  if (outcome.kind === 'error') throw new Error(`${what}: the tool call errored — ${outcome.message}`)
  return outcome.reply as Record<string, unknown>
}

function bootOf(reply: Record<string, unknown>, what: string): Record<string, unknown> {
  const boot = reply['boot']
  if (boot === undefined || boot === null) {
    throw new Error(`${what}: the reply carries NO \`boot\` member (keys: ${Object.keys(reply).sort().join(', ')})`)
  }
  return boot as Record<string, unknown>
}

// ===========================================================================
// R-1 … R-3 — §2.1 item 5's THREE PINNED PURE FUNCTIONS (the parser, the precedence, the union).
// ===========================================================================
describe('U-APP-HARNESS-READINESS §5.2 R-1 — `parseToolGroupList` exists, is pure, and is TOTAL over the malformed shapes of §2.1 item 6', () => {
  it('R-1 [T] — the absent/empty inputs are "no request" (never a refusal), the well-formed value parses, and EVERY malformed shape returns a NAMED `ok:false` instead of throwing', () => {
    const parse = seamMember('parseToolGroupList')
    // S8/S1 — the "no request" states (§2.1 item 5: the EMPTY VALUE is no request, not a refusal).
    for (const raw of [null, undefined, ''] as const) {
      expect(parse(raw), `parseToolGroupList(${String(raw)}) must be the "no request" shape`).toEqual({
        ok: true,
        requested: [],
        source: 'none',
        raw: null,
      })
    }
    // S5/S6/S7 — the accepted states (the request list is the contract's own `ToolGroup[]`).
    const accepted = parse('graph,graph,rag')
    expect(accepted.ok, 'a well-formed value is accepted').toBe(true)
    if (accepted.ok) {
      // S5 — duplicates are DEDUPLICATED (§2.1 item 1: multiplicity is order-insensitive), so the
      // assertion is a SET-equality, never a pinned internal order.
      expect([...accepted.requested].sort(), 'S5 — duplicates are DEDUPLICATED').toEqual(['graph', 'rag'])
      expect(accepted.raw, 'S5 — the raw value is echoed').toBe('graph,graph,rag')
    }
    // S9–S16 — every malformed/unknown state is a NAMED refusal, and NONE throws.
    const malformed: Array<{ label: string; raw: string; offender?: string }> = [
      { label: 'S10 an empty token inside a list', raw: 'graph,,rag' },
      { label: 'S11a a trailing comma', raw: 'graph,' },
      { label: 'S11b a leading comma', raw: ',graph' },
      { label: 'S12a a whitespace-padded token', raw: 'graph, rag', offender: ' rag' },
      { label: 'S12b a leading space', raw: ' graph', offender: ' graph' },
      { label: 'S12c a trailing space', raw: 'graph ', offender: 'graph ' },
      { label: 'S15 an unknown name', raw: 'graph,typo', offender: 'typo' },
      { label: 'S16 a case variant', raw: 'Graph', offender: 'Graph' },
    ]
    for (const c of malformed) {
      const res = parse(c.raw)
      expect(res.ok, `${c.label}: '${c.raw}' must be REFUSED`).toBe(false)
      if (!res.ok) {
        expect(res.reason.length, `${c.label}: the refusal must be NAMED (a non-empty reason)`).toBeGreaterThan(0)
        expect(res.raw, `${c.label}: the raw value is echoed`).toBe(c.raw)
        if (c.offender !== undefined) {
          expect(res.offender, `${c.label}: the offender is quoted`).toBe(c.offender)
        }
      }
    }
    // PURITY — the same input yields an equal result twice (the parser holds no state).
    expect(parse('graph')).toEqual(parse('graph'))
  })
})

describe('U-APP-HARNESS-READINESS §5.2 R-2 — `enablementRequestFrom(argv, env)` applies the house precedence: argv WINS, and a present-but-REFUSED argv never falls through to env', () => {
  it('R-2 [T] — S1/S2/S3/S4/S8: the source is named, argv beats env, an empty env value is "no request", and a malformed argv is NOT masked by a well-formed env', () => {
    const request = seamMember('enablementRequestFrom')
    // S1 — neither input supplies a value.
    const none = request(['--mcp-transport=stdio', '--mcp-port=3787'], {})
    expect(none.ok, 'S1 — a launch with no flag and no env is a valid "no request"').toBe(true)
    if (none.ok) {
      expect(none.source, 'S1 — the source is named `none`').toBe('none')
      expect(none.requested, 'S1 — the request is empty').toEqual([])
    }
    // S2 — the flag alone.
    const argv = request(['--enable-tool-groups=graph'], {})
    expect(argv.ok, 'S2 — a well-formed flag is accepted').toBe(true)
    if (argv.ok) {
      expect(argv.source, 'S2 — the source is `argv`').toBe('argv')
      expect(argv.requested).toEqual(['graph'])
    }
    // S3 — the env alone.
    const env = request([], { PROVIDENT_ENABLE_TOOL_GROUPS: 'graph,rag' })
    expect(env.ok, 'S3 — a well-formed env value is accepted').toBe(true)
    if (env.ok) {
      expect(env.source, 'S3 — the source is `env`').toBe('env')
      expect(env.requested).toEqual(['graph', 'rag'])
    }
    // S4 — both present, both well-formed: argv wins and the env value is IGNORED entirely.
    const both = request(['--enable-tool-groups=graph'], { PROVIDENT_ENABLE_TOOL_GROUPS: 'rag,edit' })
    expect(both.ok, 'S4 — argv wins').toBe(true)
    if (both.ok) {
      expect(both.source, 'S4 — the source is `argv`').toBe('argv')
      expect(both.requested, 'S4 — the env value is NOT merged into the request').toEqual(['graph'])
    }
    // S8 — an EMPTY env value is "no request" (an unset var and an exported empty one are
    // indistinguishable at this layer, §2.1 item 5), NOT a refusal.
    const emptyEnv = request([], { PROVIDENT_ENABLE_TOOL_GROUPS: '' })
    expect(emptyEnv.ok, 'S8 — an EMPTY env value is "no request"').toBe(true)
    if (emptyEnv.ok) expect(emptyEnv.source, 'S8 — source `none`').toBe('none')
    // S9/S13/S14/S15 — the argv-side refusals, still argv-level (never falling through to env).
    const argvRefusals: Array<{ label: string; argv: string[] }> = [
      { label: 'S9 an empty flag value', argv: ['--enable-tool-groups='] },
      { label: 'S13a the value-less form', argv: ['--enable-tool-groups'] },
      { label: 'S13b the space-separated form', argv: ['--enable-tool-groups', 'graph'] },
      { label: 'S14 the doubled flag', argv: ['--enable-tool-groups=graph', '--enable-tool-groups=rag'] },
      { label: 'S15 an unknown name', argv: ['--enable-tool-groups=nope'] },
    ]
    for (const c of argvRefusals) {
      const res = request(c.argv, { PROVIDENT_ENABLE_TOOL_GROUPS: 'rag' })
      expect(res.ok, `${c.label}: must be REFUSED`).toBe(false)
      if (!res.ok) expect(res.reason.length, `${c.label}: named refusal`).toBeGreaterThan(0)
    }
  })
})

describe('U-APP-HARNESS-READINESS §5.2 R-3 — `effectiveEnabledGroups(base, persisted, requested)` is ADDITIVE and DETERMINISTIC in order (§2.1 item 2)', () => {
  it('R-3 [T] — S1/S6/S7: base\'s order first, then persisted, then requested; deduplicated; request-set semantics are REFUSED (the route never subtracts)', () => {
    const effective = seamMember('effectiveEnabledGroups')
    const base: ToolGroup[] = ['read', 'dispatch']
    // S1 — no request, no persisted: today's behaviour exactly.
    expect(effective(base, [], [])).toEqual(['read', 'dispatch'])
    // S7 — persisted groups are unioned in after base's own names.
    expect(effective(base, ['rag'], ['graph'])).toEqual(['read', 'dispatch', 'rag', 'graph'])
    // S7-overlap — an overlapping persisted/requested name is deduplicated, order-preserving.
    expect(effective(base, ['dispatch', 'code'], ['dispatch', 'graph'])).toEqual(['read', 'dispatch', 'code', 'graph'])
    // S6 — restating the default is a NO-OP: the request adds nothing and removes nothing.
    expect(effective(base, [], ['read', 'dispatch'])).toEqual(['read', 'dispatch'])
    // R-3 (`R-3` of §2.3) — REQUEST-SET semantics are REFUSED: a request naming ONE group does not
    // turn `read`/`dispatch` off, and the persisted set is never dropped.
    expect(effective(base, ['rag'], ['graph']), 'the effective set is a SUPERSET of base').toEqual(
      expect.arrayContaining(['read', 'dispatch', 'rag', 'graph']),
    )
    expect(effective(base, ['rag'], ['graph']).length, 'no group the default granted goes OFF').toBe(4)
  })
})

// ===========================================================================
// R-4 / R-5 — THE ROUTE AND ITS REFUSAL (source properties of `main.ts`; §2.1 item 2 item 4 and
// item 6's placement clause). A source property, never a line number, and never a claim that the
// app booted (`S-2`'s reads are the implementer's; `O-2`'s census is the landing pass's).
// ===========================================================================
describe('U-APP-HARNESS-READINESS §5.2 R-4 — `main.ts` resolves the launch request BEFORE constructing the gate, and the gate is built from the resolved set', () => {
  it('R-4 [T] — the request is read, the effective set is resolved from it, and `new SecurityGate(…)` is fed the RESOLVED set (not the persisted set alone)', () => {
    // Every index below is measured INSIDE `main()`'s own body, so an import line at the top of
    // the file can never be mistaken for the boot-prologue read (§2.1 item 2 item 4's ordering).
    const mainStart = MAIN_SRC.indexOf('async function main(')
    expect(mainStart, 'R-4: `main()` must exist').toBeGreaterThan(-1)
    const mainBody = MAIN_SRC.slice(mainStart)
    const requestRead = sliceFrom(mainBody, 'enablementRequestFrom')
    expect(
      requestRead,
      'R-4: `main.ts` must READ the launch request at boot (`enablementRequestFrom(...)`) — the flag is unknown to the app at this head',
    ).not.toBeNull()
    const resolution = /([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*effectiveEnabledGroups\s*\(/.exec(mainBody)
    expect(
      resolution,
      'R-4: `main.ts` must RESOLVE `effective = union(base, persisted, requested)` (`effectiveEnabledGroups(...)`) at boot',
    ).not.toBeNull()
    const gateCall = mainBody.indexOf('new SecurityGate(')
    expect(gateCall, 'R-4: the gate construction site must exist').toBeGreaterThan(-1)
    const gateArg = mainBody.slice(gateCall, gateCall + 400)
    expect(requestRead!.at, 'R-4: the request is read BEFORE the gate is constructed').toBeLessThan(gateCall)
    expect(resolution!.index, 'R-4: the effective set is resolved BEFORE the gate is constructed').toBeLessThan(gateCall)
    expect(
      gateArg.includes(resolution![1]!) || gateArg.includes('effectiveEnabledGroups('),
      `R-4: the SecurityGate must be constructed from the RESOLVED set (\`${resolution![1]}\`), not from the persisted set alone`,
    ).toBe(true)
    // THE POINT OF THE ORDERING (§2.1 item 2 item 4): a post-hoc `applyGatePatch` is NOT the
    // mechanism, because it would leave a boot window in which the load is still unregistered.
    const windowAt = mainBody.indexOf('new BrowserWindow(')
    expect(windowAt, 'R-4: the window construction site must exist').toBeGreaterThan(-1)
    expect(requestRead!.at, 'R-4: the request read precedes `new BrowserWindow(`').toBeLessThan(windowAt)
    expect(resolution!.index, 'R-4: the resolution precedes `new BrowserWindow(`').toBeLessThan(windowAt)
  })
})

describe('U-APP-HARNESS-READINESS §5.2 R-5 — a refused launch exits `2` with the NAMED stderr line, before the window and before `mcp.start()` (§2.1 item 6, `F-1`)', () => {
  it('R-5 [T] — the refusal names itself, exits exactly `2`, sits after the store read and before `new BrowserWindow(` / `await mcp.start()`', () => {
    expect(
      /--enable-tool-groups REFUSED/.test(MAIN_SRC),
      "R-5: the named stderr line (`[provident-main] --enable-tool-groups REFUSED: …`) does not exist — no refusal path exists at this head",
    ).toBe(true)
    expect(
      /the launch is aborted before the MCP surface starts/.test(MAIN_SRC),
      'R-5: the refusal text must state that the launch is aborted before the MCP surface starts',
    ).toBe(true)
    expect(/app\.exit\(\s*2\s*\)/.test(MAIN_SRC), 'R-5: the refusal exits with the code `2` (`F-1`: never `0`, never a throw)').toBe(true)
    const mainStart = MAIN_SRC.indexOf('async function main(')
    expect(mainStart, 'R-5: `main()` must exist').toBeGreaterThan(-1)
    const mainBody = MAIN_SRC.slice(mainStart)
    const windowAt = mainBody.indexOf('new BrowserWindow(')
    const mcpStart = mainBody.indexOf('await mcp.start()')
    const storeRead = mainBody.indexOf('securityStore.get()')
    expect(windowAt, 'R-5: the window construction site must exist').toBeGreaterThan(0)
    expect(mcpStart, 'R-5: the `await mcp.start()` site must exist').toBeGreaterThan(0)
    expect(storeRead, 'R-5: the security store is read at the boot prologue (the refusal line may name `persisted`)').toBeGreaterThan(-1)
    // The refusal's own SITUS: its literal, or its call, inside `main()` in front of the window.
    // (A definition elsewhere in the file is not the ordering the contract pins.)
    const refusalSlice = mainBody.slice(0, windowAt)
    expect(
      /REFUSED|refus/i.test(refusalSlice),
      'R-5: the refusal must be REACHED inside `main()` before `new BrowserWindow(`',
    ).toBe(true)
    expect(storeRead, 'R-5: the refusal sits AFTER the store read (§2.1 item 6\'s placement clause)').toBeLessThan(refusalSlice.search(/REFUSED|refus/i))
    expect(windowAt, 'R-5: the refusal is before the window — a refused launch presents no window').toBeLessThan(mcpStart)
  })
})

// ===========================================================================
// R-6 / R-7 — THE PRESERVATION ROWS. These MUST PASS at this head, and they are the rows that
// FAIL a change that moves the default (`P-1`, `P-2`, `P-4`; `S-11`'s pinned tests stay green
// UNEDITED and remain the authority).
// ===========================================================================
describe('U-APP-HARNESS-READINESS §5.2 R-6 — `defaultSecurityConfig()` is unchanged and reads no launch input (`P-1`)', () => {
  it('R-6 [T] — the returned object is exactly `{ token: null, enabled: [read, dispatch] }`, every call is a FRESH object, and the function body reads no argv/env', () => {
    expect(defaultSecurityConfig()).toEqual({ token: null, enabled: ['read', 'dispatch'] })
    const a = defaultSecurityConfig()
    const b = defaultSecurityConfig()
    expect(a, 'a fresh object each call (no shared singleton)').not.toBe(b)
    expect(a.enabled, 'a fresh array each call').not.toBe(b.enabled)
    a.enabled.push('graph' as ToolGroup)
    a.token = 'leaked'
    expect(b, 'mutating one call\'s result cannot influence the next').toEqual({ token: null, enabled: ['read', 'dispatch'] })
    expect(defaultSecurityConfig()).toEqual({ token: null, enabled: ['read', 'dispatch'] })
    const body = balancedBody(SECURITY_SRC, SECURITY_SRC.indexOf('{', SECURITY_SRC.indexOf('export function defaultSecurityConfig')))
    expect(body, 'the function body must be readable as a property').not.toBeNull()
    expect(/process\.argv/.test(body!), 'P-1: `defaultSecurityConfig()` must NOT read argv').toBe(false)
    expect(/process\.env/.test(body!), 'P-1: `defaultSecurityConfig()` must NOT read env').toBe(false)
  })
})

describe('U-APP-HARNESS-READINESS §5.2 R-7 — the default tool set and the group vocabulary are UNMOVED (`P-2`, `S-4`)', () => {
  it('R-7 [T] — `allowedToolNames()` under the default gate is set-equal to the captured pre-change list and EXCLUDES `provident.load`; `ALL_TOOLS` gains no member; the nine-name vocabulary is unchanged in BOTH places', () => {
    const backend: McpBackend = { invoke: async () => ({ nodes: [] }) }
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    const allowed = server.allowedToolNames().slice().sort()
    expect(allowed, 'the default (read+dispatch) registered set is set-equal to the pre-change list').toEqual(
      PRE_CHANGE_DEFAULT_ALLOWED.slice().sort(),
    )
    expect(allowed, 'P-2/S-11: `provident.load` stays EXCLUDED at the default gate').not.toContain('provident.load')
    expect(groupForTool('provident.load'), 'S-3: `provident.load` is a `graph`-group tool (so the gate is the reason it is absent)').toBe('graph')
    for (const name of ['provident.op', 'provident.code.load', 'module.list', 'rag.query', 'edit.set_content', 'gnosis.query', 'gnosis.document.get']) {
      expect(allowed, `${name} must stay absent at the default gate`).not.toContain(name)
    }
    expect(
      ProvidentMcpServer.ALL_TOOLS.slice().sort(),
      'P-2/D-8: NO new member is added to `ALL_TOOLS` by this unit (the census fence)',
    ).toEqual(PRE_CHANGE_ALL_TOOLS.slice().sort())
    expect(ProvidentMcpServer.ALL_TOOLS.length, 'the ALL_TOOLS census is unmoved').toBe(PRE_CHANGE_ALL_TOOLS.length)
    expect(validGroupsOf(SECURITY_SRC), 'S-4: `VALID_GROUPS` in `security.ts` is exactly the nine names').toEqual(NINE_GROUPS)
    expect(validGroupsOf(SECURITY_STORE_SRC), 'S-4: the second `VALID_GROUPS` in `security-store.ts` agrees').toEqual(NINE_GROUPS)
  })
})

// ===========================================================================
// R-8 / R-9 — THE OBSERVABLE (the `boot` member) AND ITS NO-BLOCKING PENDING READ.
// ===========================================================================
describe('U-APP-HARNESS-READINESS §5.2 R-8 — a `boot` member exists on the `provident.list_targets` reply with the exact shape of §2.2 `B-1` item 2, present ONLY under the opt-in', () => {
  it('R-8 [T] — B0: no opt-in ⇒ the reply is `{ nodes }` EXACTLY (no `boot` key at all); B1: a fresh opt-in launch answers `pending` with the five declared members; B2/B3: the boot chain\'s completion and its failure are both observable, `installed === (status === \'installed\')`, `error` non-null iff failed', async () => {
    // B0 — the DEFAULT's silence (`P-6`): exactly `{ nodes }`, not `boot: null`, not `boot: {...}`.
    const plain = plainBackend({ listReply: { nodes: [{ nodeId: 'n1' }] } })
    const noneReply = replied(await readTargets(plain), 'B0 (no opt-in)')
    expect(Object.keys(noneReply).sort(), 'P-6: the default reply is `{ nodes }` member-for-member').toEqual(['nodes'])
    expect(noneReply['nodes']).toEqual([{ nodeId: 'n1' }])

    // B1 — pending, with the exact five members of §2.2 `B-1` item 2. The first assertion is the
    // member's EXISTENCE (the red reason `C-10` names: "the missing member"); the no-blocking arm
    // (a renderer that never settles) is `R-9`'s.
    const optIn = optInBackend({ listReply: { nodes: [{ nodeId: 'never-read' }] } })
    const pendingReply = replied(await readTargets(optIn), 'B1 (opt-in, pending)')
    expect(Object.keys(pendingReply).sort(), 'the opt-in reply keeps `nodes` and adds `boot`').toEqual(['boot', 'nodes'])
    const pending = bootOf(pendingReply, 'B1')
    expect(Object.keys(pending).sort(), 'B-1 item 2: the member set is exactly the five declared names').toEqual([
      'epoch',
      'error',
      'generation',
      'installed',
      'status',
    ])
    expect(pending['status'], 'B1 — a launch with no install observed is `pending`').toBe('pending')
    expect(pending['installed'], 'B-1 item 2 item 2: `installed === (status === \'installed\')`').toBe(false)
    expect(pending['epoch'], 'B-1 item 2 item 3: `epoch` starts at 1').toBe(1)
    expect(pending['generation'], 'B-1 item 2 item 4: nothing installed in this epoch yet').toBe(0)
    expect(pending['error'], 'B-1 item 2 item 5: `error` is null unless `failed`').toBeNull()
    expect(pendingReply['nodes'], 'B-5 item 2: the pending read is HONEST — the app has no installed graph to address').toEqual([])

    // B2 — the boot chain's completion (`F-4`'s positive arm; the transition is main-side state).
    const installed = optInBackend({ listReply: { nodes: [{ nodeId: 'boot-graph' }] } })
    installed.markReady()
    seamSettle(installed, { ok: true })
    const installedReply = replied(await readTargets(installed), 'B2 (installed)')
    const installedBoot = bootOf(installedReply, 'B2')
    expect(installedBoot['status'], 'B2 — the install was observed complete').toBe('installed')
    expect(installedBoot['installed'], 'B2 — the convenience boolean agrees with the status').toBe(true)
    expect(installedBoot['generation'], 'B2 — one successful install in this epoch').toBeGreaterThanOrEqual(1)
    expect(installedBoot['error'], 'B2 — no failure text').toBeNull()
    expect(installedReply['nodes'], 'B-5 item 4: after `installed` the handler is today\'s handler (the real list)').toEqual([
      { nodeId: 'boot-graph' },
    ])

    // B3 — the boot chain's FAILURE is named, never hidden behind `pending` and never `installed`.
    const failed = optInBackend({ listReply: { nodes: [] } })
    seamSettle(failed, { ok: false, error: '[provident-renderer] tab boot failed: store fetch refused' })
    const failedBoot = bootOf(replied(await readTargets(failed), 'B3 (failed)'), 'B3')
    expect(failedBoot['status'], 'F-4 — a failed boot reports `failed`').toBe('failed')
    expect(failedBoot['installed'], 'F-4 — a failed boot must NOT report `installed`').toBe(false)
    expect(failedBoot['error'], 'F-4 — the failure is NAMED').toContain('tab boot failed')
  })
})

describe('U-APP-HARNESS-READINESS §5.2 R-9 — the `pending` read does not block, and the shortcut is NOT given to the other read tools (§2.2 `B-5`, `F-2`)', () => {
  it('R-9 [T] — with an `invoke` that never settles AND with one that rejects, `list_targets` still answers `pending` with `nodes: []`; `get_rendered_html` keeps today\'s blocking behaviour', async () => {
    // The hanging renderer: the pending read must answer from MAIN state alone.
    const hanging = optInBackend({ mode: 'hang' })
    const hangingOutcome = await readTargets(hanging, 1200)
    const pendingReply = replied(hangingOutcome, 'R-9 (hanging invoke)')
    expect(bootOf(pendingReply, 'R-9 (hanging invoke)')['status'], 'B-5: answered from main state, without awaiting the renderer').toBe('pending')
    expect(pendingReply['nodes'], 'B-5 item 2: `nodes: []` in the pending state').toEqual([])
    expect(hanging.invokeCalls, 'B-5: the pending short-circuit does NOT route to the renderer').toEqual([])

    // The REJECTING renderer: an armed rejection must not turn the poll into an error.
    const rejecting = optInBackend({ mode: 'reject' })
    const rejectingReply = replied(await readTargets(rejecting, 1200), 'R-9 (rejecting invoke)')
    expect(bootOf(rejectingReply, 'R-9 (rejecting invoke)')['status'], 'B-5: a rejecting renderer does not break the pending read').toBe('pending')
    expect(rejectingReply['nodes'], 'B-5 item 2: still the honest empty list').toEqual([])

    // F-2's CONVERSE (a preservation property): the shortcut belongs to `list_targets` ONLY —
    // `get_rendered_html` keeps today's behaviour (it awaits the renderer).
    const other = optInBackend({ mode: 'hang' })
    const otherOutcome = await callTool(other, 'provident.get_rendered_html', {}, 600)
    expect(
      otherOutcome.kind,
      'F-2: `provident.get_rendered_html` is NOT given the pending shortcut — it must keep awaiting the renderer',
    ).toBe('timeout')
  })
})

// ===========================================================================
// R-10 — NO SELF-ESCALATION ROUTE (§2.2 `R-2`, `A-1` item 4 item 1; asserted exhaustively as the
// register's `P-TP-2`). This row is the CONTRACT-level statement; the register carries the
// enumeration.
// ===========================================================================
describe('U-APP-HARNESS-READINESS §5.2 R-10 — no MCP-reachable route enables or disables a group; the manual-UI IPC handler stays the only live writer (`S-2`)', () => {
  it('R-10 [T] — `mcp-server.ts` holds no store reference, `main.ts` writes the store exactly once (inside `IPC_SECURITY_SET`), and a hostile `groups` argument to every default tool leaves the gate config unchanged', async () => {
    expect(/securityStore/.test(MCP_SRC), 'S-2: the MCP surface must hold no route to the security store').toBe(false)
    const writes = MAIN_SRC.match(/securityStore\.set\(/g) ?? []
    expect(writes.length, 'S-2: exactly ONE writer of the persisted config').toBe(1)
    const writeAt = MAIN_SRC.indexOf('securityStore.set(')
    const handlerAt = MAIN_SRC.indexOf('ipcMain.handle(IPC_SECURITY_SET')
    expect(handlerAt, 'S-2: the manual-UI handler exists').toBeGreaterThan(-1)
    expect(writeAt, 'S-2: the write sits inside the manual-UI IPC handler (the only sanctioned writer)').toBeGreaterThan(handlerAt)
    const nextHandler = MAIN_SRC.indexOf('ipcMain.', writeAt)
    expect(
      nextHandler === -1 || nextHandler > writeAt,
      'S-2: the write is inside that handler, not a second handler after it',
    ).toBe(true)

    // BEHAVIOURAL — a hostile payload naming groups cannot widen or narrow the gate.
    const backend: McpBackend = { invoke: async () => ({ nodes: [] }) }
    const { server, call, close } = await openServer(backend)
    const before = server.getGateConfig()
    const hostile = { groups: ['graph', 'code'], group: 'graph', enabled: ['graph'], toolGroups: ['graph'], disable: ['read'], token: 'x' }
    try {
      for (const tool of server.allowedToolNames()) {
        await call(tool, hostile, 400)
      }
    } finally {
      await close()
    }
    expect(server.getGateConfig(), 'R-2/A-3: no tool argument can write the gate').toEqual(before)
  })
})

// ===========================================================================
// R-11 — THE PINNED VALUES (§5.2 `R-11`; a CROSS-CHECK ONLY — `tests/unit-v5-migration-contract.test.ts`
// remains the authority and is never edited).
// ===========================================================================
describe('U-APP-HARNESS-READINESS §5.2 R-11 — the pinned build/test values are untouched (`S-12`)', () => {
  it('R-11 [T] — `package.json`\'s `divergence` value is exact, `test`/`test:watch` carry no `--testTimeout`, and `vitest.config.ts`\'s `testTimeout` is exactly `15_000`', () => {
    expect(PKG.scripts?.['divergence'], 'the leg\'s pinned value is a constraint, never edited').toBe(
      'npm run build && node scripts/electron-divergence.mjs',
    )
    expect(PKG.scripts?.['test'], '`test` carries NO `--testTimeout`').toBe('vitest run')
    expect(PKG.scripts?.['test:watch'], '`test:watch` carries NO `--testTimeout`').toBe('vitest')
    expect(PKG.scripts?.['typecheck']).toBe('tsc --noEmit -p tsconfig.json')
    expect(/testTimeout:\s*15_000/.test(VITEST_SRC), 'G-9-frozen: the committed 15 s budget is unchanged').toBe(true)
  })
})

// ===========================================================================
// R-12 — THE REFUSED-ALTERNATIVE FENCE (§2.2 `R-1`..`R-5`, §3.2 `F-5`/`F-6`/`F-7`). PASSES at
// this head and is the row that FAILS a later "convenience" fix: a load guard, a settle-delay, or
// a child spawn that forwards the env fallback. It is ADDED by this red set (the contract's own
// row list stops at `R-11`) because my role owes a fail-safe row per documented fail-state.
// ===========================================================================
describe('U-APP-HARNESS-READINESS §3.2 R-12 — the refused alternatives stay refused: no guard in `Runtime.load` (`F-5`), no settle-delay in the boot path (`F-6`), no env-forwarding child spawn (`F-7`)', () => {
  it('R-12 [T] — the app\'s graph semantics are unchanged, the boot path holds no timer, and the only child spawn carries no `env:`', () => {
    // F-5 — a "refuse a load before boot" rule is REFUSED: it would change the app's graph
    // semantics for a harness's convenience and break the app's own boot path (§3.2 F-5).
    const runtimeLoad = blockAfter(RUNTIME_SRC, 'load(req: LoadPayload)')
    expect(runtimeLoad, 'F-5: `Runtime.load` must exist (its body is read as a property)').not.toBeNull()
    const loadBody = runtimeLoad!.body
    expect(loadBody, 'F-5: the three load paths (a whole-graph REPLACEMENT) are unchanged').toContain('loadEnvelope')
    expect(loadBody, 'F-5: the doc path is unchanged').toContain('loadDoc')
    expect(loadBody, 'F-5: the command path is unchanged').toContain('applyCommand')
    expect(
      /bootState|bootObservable|bootInstalled|markBoot|installed\s*\)|readiness/i.test(loadBody),
      'F-5: NO boot-state guard may be added inside `Runtime.load` — the app\'s behaviour before `installed` is UNCHANGED',
    ).toBe(false)

    // F-6 — no number becomes a delay: the app's boot-observable path holds no timer at all.
    const listTargets = blockAfter(MCP_SRC, "allowed.includes('provident.list_targets')")
    expect(listTargets, 'F-6: the `provident.list_targets` registration block must exist (read as a property)').not.toBeNull()
    expect(listTargets!.body, 'F-6: the handler is the one named by `S-6`').toContain('listTargets')
    expect(
      /setTimeout|sleep\s*\(/.test(listTargets!.body),
      'F-6: the pending reply must be a STATE read, never a timer-based settle',
    ).toBe(false)
    expect(
      /250|540/.test(listTargets!.body),
      'F-6: `O-1`\'s `~250–540 ms` observation is NEVER a budget in the app',
    ).toBe(false)

    // F-7 — the env fallback's custody: every child-process spawn in `src/main/**` passes no `env:`.
    const spawnCalls = ['execFileSync(', 'spawnSync(', 'execFile(', 'spawn('] as const
    const offenders: string[] = []
    for (const file of readdirSync(join(REPO_ROOT, 'src', 'main')).filter((f) => f.endsWith('.ts'))) {
      const src = readText(`src/main/${file}`)
      for (const call of spawnCalls) {
        let at = src.indexOf(call)
        while (at >= 0) {
          const open = src.indexOf('(', at)
          const args = balancedBody(src, open) ?? ''
          if (/\benv\s*:/.test(args)) offenders.push(`${file}: ${call}`)
          at = src.indexOf(call, at + call.length)
        }
      }
    }
    expect(offenders, 'F-7: a child spawn that forwards `env` MUST re-open the env-fallback custody row').toEqual([])
  })
})

// ===========================================================================
// §5.1 class (b) / §5.3 `C-9` B-1..B-4 — THE REAL-APP CLASS. THE UNIT'S OWN GATE (`C-8`).
// These rows are DECLARED here and NOT EXECUTED by the red pass: the contract's §5.1 states they
// need a real launch (`npm run build` + a real Electron), and §3.4 forbids booting Electron from
// the class-(a) instrument. The landing pass runs them and records the readings verbatim.
// ===========================================================================
describe('U-APP-HARNESS-READINESS §5.1 class (b) B-1..B-4 — THE REAL RUN (the unit\u2019s own gate, C-8/C-9)', () => {
  it.skip('B-1 [class (b), the landing pass\u2019s real launch; [T] observed on a live process] — the DEFAULT launch is unmoved, MEASURED: `tools/list`\'s membership and count (the `O-4` census — does it read `9` with `provident.load` ABSENT?) and the `provident.list_targets` reply\'s KEY SET (must be `{ nodes }`, no `boot`)', () => {
    // DECLARED STATE AT THIS HEAD: NOT RUN (red by construction: §5.2 R-8/R-9 record the app-side
    // reason). PROCEDURE the landing pass records verbatim: `npm run build`; launch with NO flag and
    // NO `PROVIDENT_ENABLE_TOOL_GROUPS`; drive `tools/list` and `provident.list_targets`.
    // A `boot` key on a default launch is an `E-1`/`P-6` violation, never a rounding.
  })

  it.skip('B-2 [class (b), the landing pass\u2019s real launch] — the OPT-IN launch reaches the gate: with `--enable-tool-groups=graph`, `tools/list` INCLUDES `provident.load`, its count is recorded VERBATIM (never pinned, `O-2`), and the load step succeeds (no `Tool provident.load not found`)', () => {
    // DECLARED STATE AT THIS HEAD: NOT RUN — at this head the flag is unknown to the app, so the
    // load is refused with `MCP error -32602: Tool provident.load not found` (`O-4`). PROCEDURE:
    // launch with the argv spelling AND, separately, with `PROVIDENT_ENABLE_TOOL_GROUPS=graph`
    // (the env spelling the sibling leg must use, `S-8`/`T-1`), recording both readings.
  })

  it.skip('B-3 [class (b), the landing pass\u2019s real launch] — the observable TRANSITIONS on a real boot: `boot.status` reads `pending` at least once BEFORE the install and `installed` afterwards, with `epoch`/`generation`/`error` consistent (`P-SM-1`\'s rules)', () => {
    // DECLARED STATE AT THIS HEAD: NOT RUN. §5.3 B-3's own rule: a reading whose FIRST poll is
    // already `installed` is a LEGITIMATE reading and must be recorded as such — it does not
    // falsify the observable, and it is exactly why a sleep is not needed (`F-6`).
  })

  it.skip('B-4 [class (b), the landing pass\u2019s real launch] — the refusal is TOTAL and NAMED: `--enable-tool-groups=nope` ⇒ the stderr line quoted VERBATIM, exit code `2`, and NO MCP surface reachable (`tools/list` fails at the transport)', () => {
    // DECLARED STATE AT THIS HEAD: NOT RUN (red: no refusal path exists — §5.2 R-5). The refusal
    // must be readable by the instrument that needs it: the leg's existing `classifyBootFailure`
    // reports the child's stderr tail. `C-9` B-5: no live battery row is claimed by this unit.
  })
})
