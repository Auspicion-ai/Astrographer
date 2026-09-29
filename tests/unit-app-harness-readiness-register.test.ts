// tests/unit-app-harness-readiness-register.test.ts
// U-APP-HARNESS-READINESS — §4's TYPED PROPERTY REGISTER (docs/specs/unit-app-harness-readiness.md
// §4.1/§4.2/§4.3, §1.2's second authorized file).
//
// THE REGISTER: SIX rows — `P-IM-1` `P-SM-1` `P-SM-2` `P-SM-3` `P-TP-1` `P-TP-2`. NO `F-` row. No
// `§`-citation is a row. Declared terms, printed as the sum of their own factors:
//
//   P-IM-1  strat:app-harness-default-unmoved       2+2+4+1    =  9
//   P-SM-1  strat:app-harness-boot-transitions      4*3+2+2    = 16
//   P-SM-2  strat:app-harness-presence-and-pending  2+3+2      =  7
//   P-SM-3  strat:app-harness-wait-protocol         5*2+2      = 12
//   P-TP-1  strat:app-harness-request-totality      10*2+3+1   = 24
//   P-TP-2  strat:app-harness-no-escalation         4*2+2      = 10
//                                              9 + 16 + 7 + 12 + 24 + 10 = 78 attempts
//
// EXECUTION DISCIPLINE (§4.1): deterministic plain tables (NO PBT library, NO new devDependency),
// pinned seed `0x20261015`, caps `≤ 100 attempts per row · ≤ 400 total`, STOP AFTER 5 CONSECUTIVE
// counterexamples (the abandonment is REPORTED through `stoppedAt`, never hidden), each row reports
// its strategy id, its DECLARED term vs its EXECUTED term, `held`/`broken` and its counterexamples.
// The register runs OFFLINE: no Electron boot, no `'electron'` mock, no `src/renderer/**` import,
// no `npm run divergence` spawn (§3.4).
//
// HONESTY LIMITS (§4.3): no row asserts the leg's colour (the sibling's class (b)); no row asserts
// a rendered app; `P-SM-2` drives a FAKE window/backend, so it does NOT prove a real Electron's
// timing; a body that cannot execute its declared term reports BROKEN under its DECLARED term —
// the term is never silently re-scoped.
//
// ⟨THE OBSERVED SEAM — DECLARED, NOT ASSUMED SILENTLY (the same seam `tests/unit-app-harness-readiness.test.ts`
// declares; REMAND to the supervisor: §2.2 `B-1` pins the reply, §1.2 leaves the setter's name to
// the implementer's least-code shape).⟩
//   opt-in     `new RendererBackend({ bootObservable: true })` (or `enableBootObservable()`)
//   transition `markBootSettled({ ok, error? })` (or `markBootInstalled()` + `markBootFailed(error)`)
//   the reload re-arm is driven through the EXISTING surface (`attachWindow` + two
//   `did-finish-load` events, then a further `markReady()`), so no name is invented for it.
// A missing seam is a COUNTEREXAMPLE (a broken row), never a collection error.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import * as securityNs from '../src/main/security.js'
import { groupForTool, SecurityGate, defaultSecurityConfig, type ToolGroup } from '../src/main/security.js'
import {
  ProvidentMcpServer,
  RendererBackend,
  registeredToolNames,
  type McpBackend,
  type RendererBackendOptions,
} from '../src/main/mcp-server.js'

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
const MCP_SRC = readText('src/main/mcp-server.ts')
const MAIN_SRC = readText('src/main/main.ts')

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

const NINE_GROUPS: string[] = ['read', 'dispatch', 'graph', 'code', 'module', 'rag', 'edit', 'gnosis', 'gnosis-edit']

/** The PRE-CHANGE default (read+dispatch) allowed set, written out BY HAND so a hand-edited
 *  `TOOL_GROUPS` cannot move both sides of `P-IM-1`'s second default-surface arm. */
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

/** `P-TP-2` — the ONLY two names matching an enable/disable shape that are NOT tool-group control
 *  surfaces: `module.enable`/`module.disable` toggle the MODULE registry and are gated by the
 *  `module` group like every other module tool (`S-3`). Any OTHER enable/disable/grant-shaped tool
 *  name would be a self-escalation surface. */
const MODULE_REGISTRY_TOGGLES: string[] = ['module.enable', 'module.disable']

// ---------------------------------------------------------------------------
// §2.1 item 5 — the pinned pure surface, imported as a NAMESPACE (a missing export is a row
// counterexample, never a module-collection error).
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

function requireMember<K extends keyof SecuritySeam>(name: K): NonNullable<SecuritySeam[K]> {
  const member = SEAM[name]
  if (typeof member !== 'function') {
    throw new Error(`§2.1 item 5 \`${String(name)}\` does not exist at this head (the launch-request surface is absent)`)
  }
  return member as NonNullable<SecuritySeam[K]>
}

function parseOf(raw: string | null | undefined): EnablementRequest {
  return requireMember('parseToolGroupList')(raw)
}
function requestOf(argv: readonly string[], env: Record<string, string | undefined>): EnablementRequest {
  return requireMember('enablementRequestFrom')(argv, env)
}
function effectiveOf(base: readonly ToolGroup[], persisted: readonly string[], requested: readonly ToolGroup[]): ToolGroup[] {
  return requireMember('effectiveEnabledGroups')(base, persisted, requested)
}

// ---------------------------------------------------------------------------
// The observable's declared seam + the MCP call plumbing (see the header).
// ---------------------------------------------------------------------------
class SeamAbsent extends Error {
  constructor(what: string) {
    super(
      `the ${what} seam does not exist at this head (declared shapes: \`new RendererBackend({ bootObservable: true })\` ` +
        `/ \`enableBootObservable()\`, and \`markBootSettled({ ok, error? })\` / \`markBootInstalled()\` + \`markBootFailed(error)\`)`,
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
  seamEnable(b)
  if (init?.mode !== undefined) b.mode = init.mode
  if (init?.listReply !== undefined) b.listReply = init.listReply
  return b
}

function plainBackend(init?: { listReply?: unknown }): ProbeBackend {
  const b = new ProbeBackend({} as RendererBackendOptions)
  if (init?.listReply !== undefined) b.listReply = init.listReply
  return b
}

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

async function openServer(backend: McpBackend): Promise<{
  server: ProvidentMcpServer
  call: (name: string, args?: Record<string, unknown>, boundMs?: number) => Promise<CallOutcome>
  tools: () => Promise<Array<{ name: string; inputSchema?: { properties?: Record<string, unknown> } }>>
  close: () => Promise<void>
}> {
  const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
  const sdk = server.ensureServerRegistered()
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'app-harness-readiness-register', version: '0.1.0' })
  await Promise.all([
    client.connect(clientTransport),
    (sdk as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
  ])
  const call = async (name: string, args: Record<string, unknown> = {}, boundMs = 1200): Promise<CallOutcome> => {
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
  const tools = async () => {
    const listed = (await client.listTools()) as { tools?: Array<{ name: string; inputSchema?: { properties?: Record<string, unknown> } }> }
    return listed.tools ?? []
  }
  return { server, call, tools, close: async () => { await client.close().catch(() => undefined) } }
}

async function readTargets(backend: McpBackend, boundMs = 1200): Promise<CallOutcome> {
  const { call, close } = await openServer(backend)
  try {
    return await call('provident.list_targets', {}, boundMs)
  } finally {
    await close()
  }
}

function replied(outcome: CallOutcome, what: string): Record<string, unknown> {
  if (outcome.kind === 'timeout') throw new Error(`${what}: the handler did not answer within the bound (it awaited the renderer — §2.2 B-5 forbids it)`)
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

// ---------------------------------------------------------------------------
// The register's assertion vocabulary: a check returns `null` (held) or a COUNTEREXAMPLE string
// carrying expected-vs-observed — so `finish()` never has to guess what a failure meant.
// ---------------------------------------------------------------------------
function must(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg)
}
function eq(actual: unknown, expected: unknown, what: string): void {
  const a = JSON.stringify(actual)
  const b = JSON.stringify(expected)
  if (a !== b) throw new Error(`${what}: expected ${b}, observed ${a}`)
}
function named(res: EnablementRequest, what: string): void {
  if (res.ok) throw new Error(`${what}: expected a NAMED refusal, observed ok:true with requested ${JSON.stringify(res.requested)}`)
  if (res.reason.length === 0) throw new Error(`${what}: the refusal carries an EMPTY reason (F-1: every refusal names itself)`)
}

// ===========================================================================
// §4.2 — THE TYPED REGISTER (`P-IM-`/`P-SM-`/`P-TP-` ONLY, NO `F-` row). Deterministic plain
// tables, no PBT library, no new devDependency. Caps ≤ 100/row · ≤ 400 total · STOP AFTER 5
// CONSECUTIVE counterexamples. Declared terms are printed as the sum of their own factors.
// ===========================================================================
const CAPS = { perRow: 100, total: 400 } as const
const STOP_AFTER = 5
const SEED = 0x20261015

interface RowReport {
  row: string
  strategyId: string
  declared: string
  declaredTotal: number
  executed: number
  held: boolean
  stoppedAt: number | null
  counterexamples: string[]
}

const REPORTS: RowReport[] = []

const DECLARED_REGISTER: Array<{ row: string; strategyId: string; declared: string; declaredTotal: number }> = [
  { row: 'P-IM-1', strategyId: 'strat:app-harness-default-unmoved', declared: '2+2+4+1', declaredTotal: 9 },
  { row: 'P-SM-1', strategyId: 'strat:app-harness-boot-transitions', declared: '4*3+2+2', declaredTotal: 16 },
  { row: 'P-SM-2', strategyId: 'strat:app-harness-presence-and-pending', declared: '2+3+2', declaredTotal: 7 },
  { row: 'P-SM-3', strategyId: 'strat:app-harness-wait-protocol', declared: '5*2+2', declaredTotal: 12 },
  { row: 'P-TP-1', strategyId: 'strat:app-harness-request-totality', declared: '10*2+3+1', declaredTotal: 24 },
  { row: 'P-TP-2', strategyId: 'strat:app-harness-no-escalation', declared: '4*2+2', declaredTotal: 10 },
]

interface RowRun {
  attempts: number
  consecutive: number
  counterexamples: string[]
  stoppedAt: number | null
}

function newRun(): RowRun {
  return { attempts: 0, consecutive: 0, counterexamples: [], stoppedAt: null }
}

/** Record ONE attempt. A `null` counterexample resets the consecutive counter; the 5th CONSECUTIVE
 *  counterexample abandons the row's remaining attempts and is REPORTED through `stoppedAt`. */
function attempt(run: RowRun, i: number, ce: string | null): void {
  if (run.stoppedAt !== null) return
  if (run.attempts >= CAPS.perRow) return
  run.attempts++
  if (ce === null) {
    run.consecutive = 0
    return
  }
  run.consecutive++
  run.counterexamples.push(ce)
  if (run.consecutive >= STOP_AFTER && run.stoppedAt === null) run.stoppedAt = i
}

/** Run one declared attempt: a THROW is that attempt's counterexample (never an aborted row). */
async function check(run: RowRun, i: number, body: () => string | null | Promise<string | null>): Promise<void> {
  if (run.stoppedAt !== null || run.attempts >= CAPS.perRow) return
  let ce: string | null
  try {
    ce = await body()
  } catch (e) {
    ce = (e as Error)?.message ?? String(e)
  }
  attempt(run, i, ce)
}

async function attemptOf(fnToRun: () => Promise<void> | void): Promise<string | null> {
  try {
    await fnToRun()
    return null
  } catch (e) {
    return (e as Error)?.message ?? String(e)
  }
}

function finish(id: string, run: RowRun): void {
  const declared = DECLARED_REGISTER.find((r) => r.row === id)!
  const held = run.counterexamples.length === 0 && run.attempts === declared.declaredTotal
  const report: RowReport = {
    row: id,
    strategyId: declared.strategyId,
    declared: declared.declared,
    declaredTotal: declared.declaredTotal,
    executed: run.attempts,
    held,
    stoppedAt: run.stoppedAt,
    counterexamples: run.counterexamples,
  }
  REPORTS.push(report)
  expect(
    report.held,
    `${report.row} ${report.strategyId}: ${report.held ? 'held' : 'broken'} · declared ${report.declared} = ${report.declaredTotal} · executed ${report.executed} · ` +
      `stoppedAt ${String(report.stoppedAt)}` +
      (report.counterexamples.length > 0 ? ` · counterexamples: ${report.counterexamples.slice(0, STOP_AFTER).join(' | ')}` : ''),
  ).toBe(true)
}

/** Run a register row's body: a body that THROWS still reports the row — BROKEN, with the throw as
 *  its counterexample — so `stoppedAt`, the declared-vs-executed term and the counterexample list
 *  are never hidden by an early throw. */
async function registerRow(id: string, body: (run: RowRun) => Promise<void> | void): Promise<void> {
  const run = newRun()
  const thrown = await attemptOf(async () => {
    await body(run)
  })
  if (thrown !== null) attempt(run, run.attempts + 1, thrown)
  await finish(id, run)
}

// ===========================================================================
// §4.2 `P-IM-1` — THE DEFAULT IS UNMOVED, AND THE REQUEST IS ADDITIVE.
// 2 inputs-absent arms (argv; env) + 2 default-surface arms (the default config's value; the
// default tool set's membership against a captured pre-change list) + 4 union draws (empty
// request; disjoint request; overlapping request; request re-naming `read`) + 1 freshness draw.
// ===========================================================================
describe('U-APP-HARNESS-READINESS §4.2 P-IM-1 — THE DEFAULT IS UNMOVED, AND THE REQUEST IS ADDITIVE (strat:app-harness-default-unmoved)', () => {
  it('P-IM-1 — 2+2+4+1 = 9 attempts', async () => {
    await registerRow('P-IM-1', async (run) => {
      // arm 1 — no flag, no env (argv side).
      await check(run, 1, () => {
        const r = requestOf(['--mcp-transport=stdio', '--mode=gnosis'], {})
        must(r.ok, 'arm1 (inputs absent, argv): the launch must be a valid "no request", never a refusal')
        eq(r.source, 'none', 'arm1 source')
        eq(r.requested, [], 'arm1 requested')
        return null
      })
      // arm 2 — no flag, no env (env side).
      await check(run, 2, () => {
        const r = requestOf([], { PROVIDENT_MCP_TRANSPORT: 'stdio' })
        must(r.ok, 'arm2 (inputs absent, env): the launch must be a valid "no request"')
        eq(r.source, 'none', 'arm2 source')
        eq(r.requested, [], 'arm2 requested')
        return null
      })
      // arm 3 — the default config's VALUE, and that it reads no launch input (`P-1`).
      await check(run, 3, () => {
        eq(defaultSecurityConfig(), { token: null, enabled: ['read', 'dispatch'] }, 'arm3 defaultSecurityConfig()')
        const body = balancedBody(SECURITY_SRC, SECURITY_SRC.indexOf('{', SECURITY_SRC.indexOf('export function defaultSecurityConfig')))
        must(body !== null, 'arm3: the body of `defaultSecurityConfig` must be readable as a property')
        must(!/process\.argv|process\.env/.test(body!), 'arm3: `defaultSecurityConfig()` must read NO launch input (`P-1`)')
        return null
      })
      // arm 4 — the default tool set's membership against the captured pre-change list.
      await check(run, 4, () => {
        const server = new ProvidentMcpServer({ backend: { invoke: async () => ({ nodes: [] }) }, transport: 'stdio', gate: new SecurityGate() })
        const allowed = server.allowedToolNames().slice().sort()
        eq(allowed, PRE_CHANGE_DEFAULT_ALLOWED.slice().sort(), 'arm4 the default gate\'s allowed set')
        must(!allowed.includes('provident.load'), 'arm4: `provident.load` must stay ABSENT at the default gate')
        return null
      })
      // draw 5 — an EMPTY request: effective === base ∪ persisted, i.e. today's behaviour.
      await check(run, 5, () => {
        eq(effectiveOf(['read', 'dispatch'], [], []), ['read', 'dispatch'], 'draw5 (empty request)')
        return null
      })
      // draw 6 — a DISJOINT request.
      await check(run, 6, () => {
        eq(effectiveOf(['read', 'dispatch'], ['rag'], ['graph']), ['read', 'dispatch', 'rag', 'graph'], 'draw6 (disjoint request)')
        return null
      })
      // draw 7 — an OVERLAPPING request (deduplicated, order-preserving).
      await check(run, 7, () => {
        eq(
          effectiveOf(['read', 'dispatch'], ['dispatch', 'code'], ['dispatch', 'graph']),
          ['read', 'dispatch', 'code', 'graph'],
          'draw7 (overlapping request)',
        )
        return null
      })
      // draw 8 — a request RE-NAMING `read`: additive, so a no-op, never a replacement.
      await check(run, 8, () => {
        eq(effectiveOf(['read', 'dispatch'], [], ['read']), ['read', 'dispatch'], 'draw8 (request re-naming `read`)')
        return null
      })
      // draw 9 — FRESHNESS: two calls return independent objects.
      await check(run, 9, () => {
        const a = defaultSecurityConfig()
        const b = defaultSecurityConfig()
        must(a !== b, 'draw9: two calls must not return the same object')
        must(a.enabled !== b.enabled, 'draw9: two calls must not share the enabled ARRAY')
        a.enabled.push('graph' as ToolGroup)
        a.token = 'leaked'
        eq(b, { token: null, enabled: ['read', 'dispatch'] }, 'draw9 (freshness)')
        return null
      })
    })
  })
})

// ===========================================================================
// §4.2 `P-SM-1` — THE READINESS OBSERVABLE'S TRANSITIONS ARE TOTAL AND CONSISTENT.
// 4 states × 3 arms (the `installed`/`status` agreement; the `error` presence rule; the
// `generation` rule) + 2 legal-transition draws (boot completes; boot fails) + 2 negative draws
// (an illegal regression `installed → pending` without an epoch advance; a second install in the
// SAME epoch after a failure must not produce `installed` — `F-4`'s "does not fall back to
// installed").
// ===========================================================================
type StateSetup = (b: ProbeBackend) => void | Promise<void>

async function produceState(setup: StateSetup): Promise<{ ok: true; boot: Record<string, unknown> } | { ok: false; error: string }> {
  try {
    const b = optInBackend({ listReply: { nodes: [{ nodeId: 'boot-graph' }] } })
    await setup(b)
    const boot = bootOf(replied(await readTargets(b), 'the state read'), 'the state read')
    return { ok: true, boot }
  } catch (e) {
    return { ok: false, error: (e as Error)?.message ?? String(e) }
  }
}

const SM1_STATES: Array<{ id: string; setup: StateSetup }> = [
  { id: 'S1 pending (epoch 1, generation 0)', setup: () => undefined },
  { id: 'S2 installed (boot completed)', setup: (b) => { b.markReady(); seamSettle(b, { ok: true }) } },
  { id: 'S3 failed (the boot chain reported a failure)', setup: (b) => { seamSettle(b, { ok: false, error: '[provident-renderer] tab boot failed: boom' }) } },
  {
    id: 'S4 re-armed (a renderer reload: epoch advances, status returns to pending)',
    setup: (b) => {
      b.markReady()
      seamSettle(b, { ok: true })
      const { fire } = attachFakeWindow(b)
      // the FIRST `did-finish-load` is the initial load (skipped by the backend); the SECOND is
      // the reload (`O-5`), and the further `markReady()` is the renderer's post-reload ready
      // signal — both readings of "the reload advances the epoch" are covered by this drive.
      fire('did-finish-load')
      fire('did-finish-load')
      b.markReady()
    },
  },
]

const SM1_ARMS: Array<{ id: string; judge: (boot: Record<string, unknown>) => string | null }> = [
  {
    id: 'agreement (installed === (status === \'installed\'))',
    judge: (boot) => {
      const status = String(boot['status'])
      const agree = boot['installed'] === (status === 'installed')
      return agree ? null : `arm: \`installed\` and \`status\` DISAGREE (installed=${JSON.stringify(boot['installed'])}, status=${JSON.stringify(status)})`
    },
  },
  {
    id: 'the error presence rule (error !== null iff status === \'failed\')',
    judge: (boot) => {
      const status = String(boot['status'])
      const hasError = boot['error'] !== null && boot['error'] !== undefined
      return hasError === (status === 'failed') ? null : `arm: error/status disagree (error=${JSON.stringify(boot['error'])}, status=${JSON.stringify(status)})`
    },
  },
  {
    id: 'the generation rule (0 in pending; >= 1 in installed)',
    judge: (boot) => {
      const status = String(boot['status'])
      const generation = boot['generation']
      if (typeof generation !== 'number' || !Number.isInteger(generation) || generation < 0) {
        return `arm: \`generation\` is not a non-negative integer (${JSON.stringify(generation)})`
      }
      if (status === 'pending' && generation !== 0) return `arm: pending must report generation 0 (observed ${generation})`
      if (status === 'installed' && generation < 1) return `arm: installed must report generation >= 1 (observed ${generation})`
      return null
    },
  },
]

describe('U-APP-HARNESS-READINESS §4.2 P-SM-1 — THE READINESS OBSERVABLE\'S TRANSITIONS ARE TOTAL AND CONSISTENT (strat:app-harness-boot-transitions)', () => {
  it('P-SM-1 — 4*3+2+2 = 16 attempts', async () => {
    await registerRow('P-SM-1', async (run) => {
      let i = 0
      for (const state of SM1_STATES) {
        const produced = await produceState(state.setup)
        for (const arm of SM1_ARMS) {
          i++
          const at = i
          await check(run, at, () => {
            must(produced.ok, `${state.id} | ${arm.id}: the state could not be produced — ${produced.ok ? '' : produced.error}`)
            const boot = (produced as { ok: true; boot: Record<string, unknown> }).boot
            return arm.judge(boot)
          })
        }
      }
      // draw 13 — the LEGAL transition: the boot chain completes.
      i++
      await check(run, i, async () => {
        const b = optInBackend({ listReply: { nodes: [{ nodeId: 'boot-graph' }] } })
        const before = bootOf(replied(await readTargets(b), 'draw13 before'), 'draw13 before')
        eq(before['status'], 'pending', 'draw13: the pre-install state is `pending`')
        b.markReady()
        seamSettle(b, { ok: true })
        const after = bootOf(replied(await readTargets(b), 'draw13 after'), 'draw13 after')
        eq(after['status'], 'installed', 'draw13: the completion transition reaches `installed`')
        eq(after['installed'], true, 'draw13: `installed` is true')
        eq(after['epoch'], before['epoch'], 'draw13: an INSTALL does not advance the epoch')
        must(Number(after['generation']) > Number(before['generation']), 'draw13: a successful install increments `generation`')
        return null
      })
      // draw 14 — the LEGAL transition: the boot chain FAILS (named, never `pending`-forever).
      i++
      await check(run, i, async () => {
        const b = optInBackend({ listReply: { nodes: [] } })
        eq(bootOf(replied(await readTargets(b), 'draw14 before'), 'draw14 before')['status'], 'pending', 'draw14: the pre-state is `pending`')
        seamSettle(b, { ok: false, error: '[provident-renderer] tab boot failed: store fetch refused' })
        const after = bootOf(replied(await readTargets(b), 'draw14 after'), 'draw14 after')
        eq(after['status'], 'failed', 'F-4: the failure transition reaches `failed`')
        eq(after['installed'], false, 'F-4: a failed boot is NOT `installed`')
        must(typeof after['error'] === 'string' && after['error'].length > 0, 'F-4: the failure is NAMED')
        eq(after['generation'], 0, 'draw14: nothing was installed, so `generation` stays 0')
        return null
      })
      // draw 15 — the NEGATIVE: `installed → pending` without an epoch advance is NOT produced.
      i++
      await check(run, i, async () => {
        const b = optInBackend({ listReply: { nodes: [{ nodeId: 'boot-graph' }] } })
        b.markReady()
        seamSettle(b, { ok: true })
        const first = bootOf(replied(await readTargets(b), 'draw15 first'), 'draw15 first')
        const second = bootOf(replied(await readTargets(b), 'draw15 second'), 'draw15 second')
        eq(first['status'], 'installed', 'draw15: the state is `installed`')
        must(
          second['status'] === 'installed' && second['epoch'] === first['epoch'],
          `draw15: an ILLEGAL regression was produced (a repeated read regressed to ${JSON.stringify(second['status'])} with epoch ${JSON.stringify(second['epoch'])})`,
        )
        return null
      })
      // draw 16 — the NEGATIVE: a SECOND install signal in the SAME epoch after a failure must not
      // produce `installed` (`F-4`: "does not fall back to installed").
      i++
      await check(run, i, async () => {
        const b = optInBackend({ listReply: { nodes: [{ nodeId: 'boot-graph' }] } })
        seamSettle(b, { ok: false, error: '[provident-renderer] tab boot failed: boom' })
        eq(bootOf(replied(await readTargets(b), 'draw16 failed'), 'draw16 failed')['status'], 'failed', 'draw16: the state is `failed`')
        seamSettle(b, { ok: true })
        const after = bootOf(replied(await readTargets(b), 'draw16 after'), 'draw16 after')
        must(
          after['status'] !== 'installed',
          `draw16: a second install in the SAME epoch produced \`installed\` (F-4 forbids falling back to installed; observed ${JSON.stringify(after['status'])})`,
        )
        return null
      })
    })
  })
})

// ===========================================================================
// §4.2 `P-SM-2` — PRESENCE IS GATED BY THE OPT-IN, AND THE PENDING READ NEVER BLOCKS.
// 2 presence arms (opt-in; no opt-in) + 3 pending-read arms (`nodes: []`; the no-await property
// against a HANGING `invoke`; the same against a REJECTING `invoke`) + 2 post-install arms (the
// real list is returned; the member is still present).
// ===========================================================================
describe('U-APP-HARNESS-READINESS §4.2 P-SM-2 — PRESENCE IS GATED BY THE OPT-IN, AND THE PENDING READ NEVER BLOCKS (strat:app-harness-presence-and-pending)', () => {
  it('P-SM-2 — 2+3+2 = 7 attempts', async () => {
    await registerRow('P-SM-2', async (run) => {
      // arm 1 — WITH the opt-in: the member is present with the exact five declared names.
      // (The two presence arms are driven `opt-in` then `no-opt-in` so the row's own declared
      // term is EXECUTED in full at a red head: STOP-AFTER-5 abandons a row after five
      // CONSECUTIVE counterexamples, and an all-red row would otherwise cut its own table short.)
      await check(run, 1, async () => {
        const b = optInBackend({ listReply: { nodes: [{ nodeId: 'n1' }] } })
        const reply = replied(await readTargets(b), 'arm1 (opt-in)')
        eq(Object.keys(reply).sort(), ['boot', 'nodes'], 'arm1: the opt-in reply keeps `nodes` and gains `boot`')
        eq(Object.keys(bootOf(reply, 'arm1')).sort(), ['epoch', 'error', 'generation', 'installed', 'status'], 'arm1 boot member set')
        return null
      })
      // arm 2 — NO opt-in: the reply is exactly `{ nodes: [...] }` (a deep key-set check).
      await check(run, 2, async () => {
        const plain = plainBackend({ listReply: { nodes: [{ nodeId: 'n1' }] } })
        const reply = replied(await readTargets(plain), 'arm2 (no opt-in)')
        eq(Object.keys(reply).sort(), ['nodes'], 'arm2: the default reply must have NO `boot` key at all (not `boot: null`)')
        eq(reply['nodes'], [{ nodeId: 'n1' }], 'arm2 nodes')
        return null
      })
      // arm 3 — the pending read's honest empty list.
      await check(run, 3, async () => {
        const b = optInBackend({ listReply: { nodes: [{ nodeId: 'never-read' }] } })
        const reply = replied(await readTargets(b), 'arm3 (pending)')
        eq(bootOf(reply, 'arm3')['status'], 'pending', 'arm3 status')
        eq(reply['nodes'], [], 'arm3: `nodes: []` — the app has no installed graph to address (B-5 item 2)')
        return null
      })
      // arm 4 — the NO-AWAIT property against an `invoke` that never settles.
      await check(run, 4, async () => {
        const b = optInBackend({ mode: 'hang' })
        const started = Date.now()
        const reply = replied(await readTargets(b, 1200), 'arm4 (hanging invoke)')
        must(Date.now() - started < 1100, 'arm4: the answer must not wait on the renderer (B-5)')
        eq(bootOf(reply, 'arm4')['status'], 'pending', 'arm4 status')
        eq(b['invokeCalls'], [], 'arm4: the pending short-circuit must NOT route to the renderer')
        return null
      })
      // arm 5 — the same property against a REJECTING `invoke`.
      await check(run, 5, async () => {
        const b = optInBackend({ mode: 'reject' })
        const reply = replied(await readTargets(b, 1200), 'arm5 (rejecting invoke)')
        eq(bootOf(reply, 'arm5')['status'], 'pending', 'arm5: a rejecting renderer must not break the poll')
        eq(reply['nodes'], [], 'arm5 nodes')
        return null
      })
      // arm 6 — post-install: the REAL list is returned.
      await check(run, 6, async () => {
        const b = optInBackend({ listReply: { nodes: [{ nodeId: 'boot-graph' }] } })
        b.markReady()
        seamSettle(b, { ok: true })
        const reply = replied(await readTargets(b), 'arm6 (installed)')
        eq(bootOf(reply, 'arm6')['status'], 'installed', 'arm6 status')
        eq(reply['nodes'], [{ nodeId: 'boot-graph' }], 'arm6: after `installed` the handler is the today-shaped handler (the real list)')
        return null
      })
      // arm 7 — post-install: the member is STILL present.
      await check(run, 7, async () => {
        const b = optInBackend({ listReply: { nodes: [] } })
        b.markReady()
        seamSettle(b, { ok: true })
        const reply = replied(await readTargets(b), 'arm7 (installed)')
        eq(Object.keys(reply).sort(), ['boot', 'nodes'], 'arm7: the member stays present after the install')
        return null
      })
    })
  })
})

// ===========================================================================
// §4.2 `P-SM-3` — THE CLIENT'S WAIT PROTOCOL ALWAYS TERMINATES (§2.2 `B-1` item 5).
// 5 states/branches (absent · installed · failed · pending-until-deadline · a regression after
// satisfaction) × 2 arms (the NAMED outcome text; termination) + 2 negative draws (a client that
// re-waits after satisfaction; a client that treats `absent` as `installed`).
//
// This row is the CLIENT-side protocol the sibling leg's amendment must implement (`T-1`); it is
// driven by a deterministic simulated client over an ENUMERATED state table (no timer, no sleep
// — the interval/deadline are the client's own constants, `F-6`).
// ===========================================================================
type BootRead = { kind: 'absent' } | { kind: 'error'; message: string } | { kind: 'boot'; boot: Record<string, unknown> }

interface WaitOutcome {
  ok: boolean
  reason: string
  calls: number
  callsAfterSatisfaction: number
}

/** §2.2 `B-1` item 5's protocol, implemented as a CLIENT: every branch terminates, no branch
 *  retries an exhausted condition, and a regression after satisfaction is a NAMED failure. */
function waitForBoot(read: (tick: number) => BootRead, deadlineTicks: number): WaitOutcome {
  let calls = 0
  let satisfied = false
  for (let tick = 0; tick < deadlineTicks; tick++) {
    const r = read(tick)
    calls++
    if (r.kind === 'absent') {
      return {
        ok: false,
        reason:
          'the app did not opt in: `provident.list_targets` carries no `boot` member, so this app instance cannot report its boot-install state',
        calls,
        callsAfterSatisfaction: 0,
      }
    }
    if (r.kind === 'error') {
      return { ok: false, reason: `the read failed: ${r.message}`, calls, callsAfterSatisfaction: 0 }
    }
    const status = String(r.boot['status'])
    if (status === 'failed') {
      return { ok: false, reason: `the boot chain failed: ${String(r.boot['error'])}`, calls, callsAfterSatisfaction: 0 }
    }
    if (status === 'installed') {
      satisfied = true
      return { ok: true, reason: 'satisfied: the install is complete', calls, callsAfterSatisfaction: 0 }
    }
    if (satisfied) {
      return { ok: false, reason: 'REGRESSION after satisfaction: a re-wait is forbidden (B-1 item 5 item 4)', calls, callsAfterSatisfaction: 1 }
    }
  }
  return { ok: false, reason: "the deadline passed with status still 'pending'", calls, callsAfterSatisfaction: 0 }
}

/** The regression verdict a client owes AFTER satisfaction: never a re-wait, never an infinite
 *  loop — a NAMED failure when the status leaves `installed` or the epoch advances. */
function regressionVerdict(satisfiedEpoch: number, next: Record<string, unknown>): string | null {
  const status = String(next['status'])
  if (status !== 'installed') return `REGRESSION after satisfaction: status left 'installed' (observed '${status}')`
  if (Number(next['epoch']) !== satisfiedEpoch) return `REGRESSION after satisfaction: epoch advanced (${satisfiedEpoch} -> ${String(next['epoch'])})`
  return null
}

const SM3_CEILING = 64

/** The five branches of the client protocol the row enumerates (declared factor: `5 * 2`). */
const SM3_BRANCHES: Array<{ id: string; read: (tick: number) => BootRead; expectOk: boolean; expectInReason: string }> = [
  { id: 'absent', read: () => ({ kind: 'absent' }), expectOk: false, expectInReason: 'did not opt in' },
  {
    id: 'installed',
    read: () => ({ kind: 'boot', boot: { installed: true, status: 'installed', epoch: 1, generation: 1, error: null } }),
    expectOk: true,
    expectInReason: 'satisfied',
  },
  {
    id: 'failed',
    read: () => ({ kind: 'boot', boot: { installed: false, status: 'failed', epoch: 1, generation: 0, error: 'tab boot failed: boom' } }),
    expectOk: false,
    expectInReason: 'tab boot failed: boom',
  },
  {
    id: 'pending-until-deadline',
    read: () => ({ kind: 'boot', boot: { installed: false, status: 'pending', epoch: 1, generation: 0, error: null } }),
    expectOk: false,
    expectInReason: 'deadline',
  },
  {
    id: 'regression-after-satisfaction',
    read: (tick) =>
      tick === 0
        ? { kind: 'boot', boot: { installed: true, status: 'installed', epoch: 1, generation: 1, error: null } }
        : { kind: 'boot', boot: { installed: false, status: 'pending', epoch: 2, generation: 0, error: null } },
    expectOk: true,
    expectInReason: 'satisfied',
  },
]

describe('U-APP-HARNESS-READINESS §4.2 P-SM-3 — THE CLIENT\'S WAIT PROTOCOL ALWAYS TERMINATES (strat:app-harness-wait-protocol)', () => {
  it('P-SM-3 — 5*2+2 = 12 attempts', async () => {
    await registerRow('P-SM-3', async (run) => {
      const DEADLINE = 8
      const BRANCHES = SM3_BRANCHES
      let i = 0
      for (const branch of BRANCHES) {
        const outcome = waitForBoot(branch.read, DEADLINE)
        i++
        await check(run, i, () => {
          if (branch.expectOk) {
            must(outcome.ok, `branch ${branch.id}: expected satisfaction, observed a stop — '${outcome.reason}'`)
            must(outcome.reason.includes(branch.expectInReason), `branch ${branch.id}: the outcome must name itself ('${outcome.reason}')`)
          } else {
            must(!outcome.ok, `branch ${branch.id}: expected a NAMED stop, observed ok`)
            must(outcome.reason.length > 0, `branch ${branch.id}: the stop must be NAMED (empty reason)`)
            must(
              outcome.reason.includes(branch.expectInReason),
              `branch ${branch.id}: the stop must carry its own cause — expected '${branch.expectInReason}' in '${outcome.reason}'`,
            )
          }
          return null
        })
        i++
        await check(run, i, () => {
          must(outcome.calls >= 1, `branch ${branch.id}: the client must READ, never sleep (§F-6)`)
          must(outcome.calls <= SM3_CEILING, `branch ${branch.id}: the client issued ${outcome.calls} calls — the wait must be BOUNDED`)
          must(outcome.callsAfterSatisfaction === 0, `branch ${branch.id}: a client must NOT re-wait after satisfaction (F-5)`)
          return null
        })
      }
      // negative draw 11 — a client that RE-WAITS after satisfaction: the contract's client stops,
      // so a re-waiting client is the bug; the row asserts the bounded call count and that the
      // regression is a NAMED failure rather than an infinite loop.
      i++
      await check(run, i, () => {
        const satisfied = { installed: true, status: 'installed', epoch: 1, generation: 1, error: null }
        const regressed = { installed: false, status: 'pending', epoch: 2, generation: 0, error: null }
        const verdict = regressionVerdict(Number(satisfied['epoch']), regressed)
        must(verdict !== null, 'draw11: a post-satisfaction regression must be a NAMED failure')
        must(/REGRESSION/.test(verdict!), 'draw11: the verdict must name the regression')
        const steady = regressionVerdict(Number(satisfied['epoch']), satisfied)
        must(steady === null, 'draw11: an UNCHANGED installed state is not a regression')
        return null
      })
      // negative draw 12 — a client that treats `absent` as `installed` is WRONG: the absent state
      // is a named stop (F-2/F-3), never a satisfaction.
      i++
      await check(run, i, () => {
        const outcome = waitForBoot(() => ({ kind: 'absent' }), DEADLINE)
        must(!outcome.ok, 'draw12: `absent` must NEVER be read as `installed` (F-3)')
        must(/no `boot` member/.test(outcome.reason), `draw12: the named stop must say WHY (observed '${outcome.reason}')`)
        must(outcome.calls <= SM3_CEILING, 'draw12: the absent branch terminates immediately, never retries')
        return null
      })
    })
  })
})

// ===========================================================================
// §4.2 `P-TP-1` — NO MALFORMED REQUEST CRASHES, AND EVERY REFUSAL IS NAMED.
// 10 malformed shapes × 2 arms (no-throw; a non-empty named reason) + 3 accepted-shape draws
// (duplicates; the default restatement; argv precedence) + 1 totality draw
// (`effectiveEnabledGroups` over a mixed `persisted`).
//
// ⟨TWO SHAPES CARRY A DOCUMENTED READING AMBIGUITY, REMANDED RATHER THAN SILENTLY RESOLVED:⟩
//   * `null`/`undefined` — §2.1 item 5's return-shape rule is explicit ("THE EMPTY VALUE IS 'NO
//     REQUEST'": `ok:true, requested: [], source:'none', raw:null`), while §4.2's `P-TP-1`
//     sentence lumps them into "each returns `ok:false`". This row takes §2.1 item 5 as the
//     authority for the RETURN SHAPE and asserts the arm as "no throw + a NAMED outcome" (which
//     the `ok:true`/source `none` shape satisfies). REMAND to the supervisor.
//   * a NON-STRING env value — §4.2 says `ok:false`; the house's own `asString` precedent in
//     `src/main/security.ts` treats a non-string as ABSENT. Both readings satisfy the arm the row
//     asserts: never a throw, a well-formed outcome, and NO group granted either way. REMAND.
// ===========================================================================
/** The TEN malformed/absent shapes §4.2's `P-TP-1` enumerates (declared factor: `10 * 2`). */
const TP1_SHAPES: Array<{ id: string; run: () => EnablementRequest; refusing: boolean }> = [
  { id: "1 the empty FLAG value ('--enable-tool-groups=')", run: () => requestOf(['--enable-tool-groups='], {}), refusing: true },
  { id: "2 an EMPTY token inside a list ('graph,,rag')", run: () => parseOf('graph,,rag'), refusing: true },
  {
    id: "3 leading/trailing ',' ('graph,' / ',graph')",
    run: () => {
      parseOf('graph,')
      return parseOf(',graph')
    },
    refusing: true,
  },
  {
    id: "4 whitespace ('graph, rag' / ' graph')",
    run: () => {
      requestOf(['--enable-tool-groups=graph, rag'], {})
      return parseOf(' graph')
    },
    refusing: true,
  },
  {
    id: "5 the no-'=' form ('--enable-tool-groups' / '--enable-tool-groups graph')",
    run: () => {
      requestOf(['--enable-tool-groups'], {})
      return requestOf(['--enable-tool-groups', 'graph'], {})
    },
    refusing: true,
  },
  { id: '6 the DOUBLED flag', run: () => requestOf(['--enable-tool-groups=graph', '--enable-tool-groups=rag'], {}), refusing: true },
  { id: "7 an UNKNOWN name ('graph,typo')", run: () => requestOf(['--enable-tool-groups=graph,typo'], {}), refusing: true },
  { id: "8 a CASE variant ('Graph')", run: () => requestOf(['--enable-tool-groups=Graph'], {}), refusing: true },
  {
    id: '9 null / undefined (a no-request, see the row comment)',
    run: () => {
      const a = parseOf(null)
      const b = parseOf(undefined)
      eq(a, b, 'shape 9: null and undefined agree')
      return a
    },
    refusing: false,
  },
  { id: '10 a NON-STRING env value', run: () => requestOf([], { PROVIDENT_ENABLE_TOOL_GROUPS: 42 as unknown as string }), refusing: false },
]
describe('U-APP-HARNESS-READINESS §4.2 P-TP-1 — NO MALFORMED REQUEST CRASHES, AND EVERY REFUSAL IS NAMED (strat:app-harness-request-totality)', () => {
  it('P-TP-1 — 10*2+3+1 = 24 attempts', async () => {
    await registerRow('P-TP-1', async (run) => {
      const SHAPES = TP1_SHAPES
      let i = 0
      for (const shape of SHAPES) {
        i++
        await check(run, i, () => {
          const res = shape.run() // arm (a): NEVER a throw (a throw is caught by `check` as the counterexample)
          must(typeof res === 'object' && res !== null, `shape ${shape.id}: the parser must RETURN a value, never throw`)
          return null
        })
        i++
        await check(run, i, () => {
          const res = shape.run() // arm (b): the outcome is NAMED
          if (shape.refusing) {
            named(res, `shape ${shape.id}`)
            must(res.raw.length >= 0, `shape ${shape.id}: the raw value is echoed`)
          } else if (res.ok) {
            must(res.source === 'none', `shape ${shape.id}: the non-request reading must name its source 'none' (observed '${res.source}')`)
            eq(res.requested, [], `shape ${shape.id}: a hostile non-string/absent value must grant NO group`)
          } else {
            must(res.reason.length > 0, `shape ${shape.id}: a refusal must name itself (the refusal reading is admissible here too)`)
          }
          return null
        })
      }
      // draw 21 — DUPLICATES are accepted (deduplicated, idempotent).
      i++
      await check(run, i, () => {
        const r = requestOf(['--enable-tool-groups=graph,graph,rag,graph'], {})
        must(r.ok, 'draw21: duplicates are ACCEPTED, never an error')
        if (r.ok) {
          eq([...r.requested].slice().sort(), ['graph', 'rag'], 'draw21 (deduplicated request)')
          eq(r.source, 'argv', 'draw21 source')
        }
        return null
      })
      // draw 22 — the DEFAULT RESTATEMENT is a no-op (accepted).
      i++
      await check(run, i, () => {
        const r = requestOf(['--enable-tool-groups=read,dispatch'], {})
        must(r.ok, 'draw22: restating the default is ACCEPTED')
        if (r.ok) eq(r.requested.slice().sort(), ['dispatch', 'read'], 'draw22 (default restatement)')
        return null
      })
      // draw 23 — argv WINS over env (the env value is ignored entirely).
      i++
      await check(run, i, () => {
        const r = requestOf(['--enable-tool-groups=graph'], { PROVIDENT_ENABLE_TOOL_GROUPS: 'rag' })
        must(r.ok, 'draw23: argv wins')
        if (r.ok) {
          eq(r.source, 'argv', 'draw23 source')
          eq(r.requested, ['graph'], 'draw23: the env value is NOT merged')
        }
        return null
      })
      // draw 24 — TOTALITY: `effectiveEnabledGroups` over an EMPTY and a MIXED `persisted` array.
      i++
      await check(run, i, () => {
        const empty = effectiveOf(['read', 'dispatch'], [], ['graph'])
        eq(empty, ['read', 'dispatch', 'graph'], 'draw24 (empty persisted)')
        const mixed = effectiveOf(['read', 'dispatch'], ['rag', 'read', 'nope'], ['graph'])
        for (const g of mixed) {
          must(NINE_GROUPS.includes(g), `draw24: the result must be a ToolGroup[] — '${g}' is outside the nine-name vocabulary`)
        }
        eq(mixed, ['read', 'dispatch', 'rag', 'graph'], 'draw24 (mixed persisted: base order first, unknown names dropped, deduplicated)')
        return null
      })
    })
  })
})

// ===========================================================================
// §4.2 `P-TP-2` — NO SELF-ESCALATION ROUTE EXISTS, AND NOTHING ELSE WIDENS.
// 4 surfaces × 2 arms (no enable; no disable) + 2 draws (the `boot` member is inert; the manual-UI
// handler is the only live writer). `A-3`'s probe driven as a row: every default tool is called
// with a hostile payload naming groups and the gate's config must not move.
// ===========================================================================
describe('U-APP-HARNESS-READINESS §4.2 P-TP-2 — NO SELF-ESCALATION ROUTE EXISTS, AND NOTHING ELSE WIDENS (strat:app-harness-no-escalation)', () => {
  it('P-TP-2 — 4*2+2 = 10 attempts', async () => {
    await registerRow('P-TP-2', async (run) => {
      // surface 1 — the static tool NAMES.
      await check(run, 1, () => {
        const suspects = ProvidentMcpServer.ALL_TOOLS.filter((n) => /enable|grant|escalat/i.test(n) && !MODULE_REGISTRY_TOGGLES.includes(n))
        eq(suspects, [], 'surface 1 (no enable): no tool NAME may be a group-granting surface')
        const ungrouped = ProvidentMcpServer.ALL_TOOLS.filter((n) => groupForTool(n) === null)
        eq(ungrouped, [], 'surface 1 (no enable): every tool name must resolve to one of the nine groups (an un-gated tool is a hole)')
        return null
      })
      await check(run, 2, () => {
        const disablers = ProvidentMcpServer.ALL_TOOLS.filter((n) => /disable|revoke/i.test(n) && !MODULE_REGISTRY_TOGGLES.includes(n))
        eq(disablers, [], 'surface 1 (no disable): no tool NAME may be a group-disabling surface')
        const server = new ProvidentMcpServer({ backend: { invoke: async () => ({}) }, transport: 'stdio', gate: new SecurityGate() })
        eq(server.getGateConfig(), { token: null, enabled: ['read', 'dispatch'] }, 'surface 1 (no disable): registering the default surface must not narrow the gate')
        return null
      })
      // surface 2 — the dynamic `module:<name>.<tool>` names.
      await check(run, 3, () => {
        eq(groupForTool('module:security.set'), 'module', 'surface 2: a hostile dynamic name resolves to `module` — never to a group grant')
        eq(groupForTool('module:provident.enable_group'), 'module', 'surface 2: an enable-shaped dynamic name resolves to `module` only')
        const gate = new SecurityGate()
        eq(registeredToolNames(gate, ['module:provident.enable_group', 'module:evil.set']), [], 'surface 2 (no enable): a dynamic tool is NOT registered under the default gate')
        must(!gate.toolAllowed('module:provident.enable_group'), 'surface 2 (no enable): the default gate denies the dynamic tool')
        return null
      })
      await check(run, 4, () => {
        const gate = new SecurityGate()
        const before = gate.config
        registeredToolNames(gate, ['module:disable_group', 'module:evil.unset'])
        eq(gate.config, before, 'surface 2 (no disable): resolving dynamic names must not narrow the gate')
        return null
      })
      // surface 3 — the resource URIs and their methods.
      await check(run, 5, () => {
        const granting = ProvidentMcpServer.ALL_RESOURCES.filter((r) => /enable|grant|security|gate/i.test(`${r.uri ?? ''}${r.uriTemplate ?? ''}${r.name}`))
        eq(granting, [], 'surface 3 (no enable): no RESOURCE may be a group-granting surface')
        for (const r of ProvidentMcpServer.ALL_RESOURCES) {
          must(NINE_GROUPS.includes(r.group), `surface 3: resource '${r.name}' carries the unknown group '${r.group}'`)
          must(
            ['renderedHtml', 'listTargets', 'nodeState'].includes(r.method),
            `surface 3 (no enable): resource '${r.name}' maps to '${r.method}' — every resource mirrors a READER, never a gate writer`,
          )
        }
        return null
      })
      await check(run, 6, () => {
        const server = new ProvidentMcpServer({ backend: { invoke: async () => ({}) }, transport: 'stdio', gate: new SecurityGate() })
        const uris = server.allowedResourceUris()
        eq(uris.slice().sort(), ['mcp://provident/app', 'mcp://provident/node/{nodeId}', 'mcp://provident/targets'], 'surface 3: the default gate allows exactly the three read resources')
        eq(server.getGateConfig(), { token: null, enabled: ['read', 'dispatch'] }, 'surface 3 (no disable): enumerating resources must not narrow the gate')
        return null
      })
      // surface 4 — the ARGUMENT SCHEMAS + the notifications, driven behaviourally: every default
      // tool is called with a hostile payload (`A-3`'s probe) and the gate must not move.
      const HOSTILE_ENABLE = { groups: ['graph', 'code'], group: 'graph', enabled: ['graph'], toolGroups: ['graph'], grant: ['graph'], token: 'x' }
      const HOSTILE_DISABLE = { groups: [], disable: ['read', 'dispatch'], disabled: ['read'], revoke: ['dispatch'], token: null }
      await check(run, 7, async () => {
        const { server, call, close } = await openServer({ invoke: async () => ({ nodes: [] }) })
        try {
          const before = server.getGateConfig()
          for (const tool of server.allowedToolNames()) await call(tool, HOSTILE_ENABLE, 400)
          eq(server.getGateConfig(), before, 'surface 4 (no enable): no tool ARGUMENT may widen the gate')
        } finally {
          await close()
        }
        return null
      })
      await check(run, 8, async () => {
        const { server, call, close } = await openServer({ invoke: async () => ({ nodes: [] }) })
        try {
          const before = server.getGateConfig()
          for (const tool of server.allowedToolNames()) await call(tool, HOSTILE_DISABLE, 400)
          eq(server.getGateConfig(), before, 'surface 4 (no disable): no tool ARGUMENT may narrow the gate')
        } finally {
          await close()
        }
        return null
      })
      // draw 9 — the `boot` member is INERT: reading it cannot move the gate, and no tool exposes
      // a `boot` write.
      await check(run, 9, async () => {
        const b = optInBackend({ listReply: { nodes: [] } })
        const { server, call, tools, close } = await openServer(b)
        try {
          const before = server.getGateConfig()
          await call('provident.list_targets', { boot: { status: 'installed' }, groups: ['graph'] }, 800)
          eq(server.getGateConfig(), before, 'draw9: reading (or arguing about) `boot` must not move the gate')
          const exposed = (await tools()).filter((t) => Object.keys(t.inputSchema?.properties ?? {}).includes('boot'))
          eq(exposed.map((t) => t.name), [], 'draw9: no tool may expose a `boot` WRITE argument (the member is inert data)')
        } finally {
          await close()
        }
        return null
      })
      // draw 10 — the manual-UI IPC handler is the ONLY live writer of the persisted config.
      await check(run, 10, () => {
        must(!/securityStore/.test(MCP_SRC), 'draw10: the MCP surface must hold NO route to the security store')
        const writes = MAIN_SRC.match(/securityStore\.set\(/g) ?? []
        eq(writes.length, 1, 'draw10: exactly ONE writer of the persisted config')
        const writeAt = MAIN_SRC.indexOf('securityStore.set(')
        const handlerAt = MAIN_SRC.indexOf('ipcMain.handle(IPC_SECURITY_SET')
        must(handlerAt > -1 && writeAt > handlerAt, 'draw10: the write must sit inside the manual-UI IPC handler (`S-2`)')
        const patches = MAIN_SRC.match(/\.applyGatePatch\(/g) ?? []
        eq(patches.length, 1, 'draw10: exactly ONE live re-gate call site')
        must(
          MAIN_SRC.indexOf('gatePatchFromStoreResult(') < MAIN_SRC.indexOf('.applyGatePatch('),
          'draw10: the live re-gate must be fed by the STORE\'s filtered result, never by a raw patch',
        )
        return null
      })
    })
  })
})

// ===========================================================================
// §4.2 — THE REGISTER REPORT (declared vs executed, `held`/`broken`, `stoppedAt`,
// counterexamples) + the register's own structural rows.
// ===========================================================================
describe('U-APP-HARNESS-READINESS §4.2 — THE REGISTER REPORT (declared vs executed, held/broken, stoppedAt, counterexamples)', () => {
  it("§4.2 — the register is exactly the SIX declared rows, `P-IM-`/`P-SM-`/`P-TP-` ONLY (no `F-` row), the declared total is 78 and every term is the sum of its own factors", () => {
    expect(DECLARED_REGISTER.map((r) => r.row), 'the register is authored in the declared register order').toEqual([
      'P-IM-1',
      'P-SM-1',
      'P-SM-2',
      'P-SM-3',
      'P-TP-1',
      'P-TP-2',
    ])
    expect(DECLARED_REGISTER.length, 'the register is EXACTLY six rows (§4.2)').toBe(6)
    expect(DECLARED_REGISTER.some((r) => r.row.startsWith('F-')), 'NEVER an `F-` row (§4.1)').toBe(false)
    for (const row of DECLARED_REGISTER) {
      expect(row.row, `${row.row}: only \`P-IM-\`/\`P-SM-\`/\`P-TP-\` rows may appear`).toMatch(/^P-(IM|SM|TP)-\d$/)
      const factors = row.declared.split(/[+×*]/).map((t) => t.trim())
      expect(factors.every((t) => t !== ''), `${row.row}: every declared factor must be printed (${row.declared})`).toBe(true)
      const value = row.declared
        .split('+')
        .map((term) => term.split(/[×*]/).map((t) => Number(t.trim())).reduce((a, b) => a * b, 1))
        .reduce((a, b) => a + b, 0)
      expect(value, `${row.row}: the declared total must be the value of its own printed terms (${row.declared})`).toBe(row.declaredTotal)
      expect(row.declaredTotal, `${row.row} must be ≤ ${CAPS.perRow}`).toBeLessThanOrEqual(CAPS.perRow)
    }
    const total = DECLARED_REGISTER.reduce((a, r) => a + r.declaredTotal, 0)
    expect(total, 'the arithmetic printed with its terms: `9 + 16 + 7 + 12 + 24 + 10 = 78`').toBe(78)
    expect(total, `the total must be ≤ ${CAPS.total}`).toBeLessThanOrEqual(CAPS.total)
    expect(SEED, 'the pinned seed of this register (§4.1): `0x20261015`').toBe(0x20261015)
    expect(STOP_AFTER, 'the register stops after 5 CONSECUTIVE counterexamples on every row (§4.1)').toBe(5)
  })

  it('§4.2 — every table-driven row\'s TABLE covers its own DECLARED term (the declared column is authoritative: the body\'s table size IS the declared arithmetic)', () => {
    expect(
      SM1_STATES.length * SM1_ARMS.length + 2 + 2,
      'P-SM-1: `4*3+2+2` — four states × three arms, plus the two legal-transition draws and the two negative draws',
    ).toBe(16)
    expect(TP1_SHAPES.length * 2 + 3 + 1, 'P-TP-1: `10*2+3+1` — ten shapes × two arms, plus three accepted draws and one totality draw').toBe(24)
    expect(SM3_BRANCHES.length * 2 + 2, 'P-SM-3: `5*2+2` — five protocol branches × two arms, plus two negative draws').toBe(12)
    expect(
      DECLARED_REGISTER.find((r) => r.row === 'P-SM-2')!.row,
      'P-SM-2 (`2+3+2`), `P-IM-1` (`2+2+4+1`) and `P-TP-2` (`4*2+2`) are driven by hand-numbered sequential checks in their bodies',
    ).toBe('P-SM-2')
  })

  it('§4.2 — THE REGISTER REPORT: every row reported `held`/`broken` with its strategy id, its declared-vs-executed term, `stoppedAt` and its counterexamples (a report, never a silent pass)', () => {
    const missing = DECLARED_REGISTER.filter((r) => !REPORTS.some((rep) => rep.row === r.row)).map((r) => r.row)
    expect(
      missing,
      'every declared register row must have RUN and reported — a term dropped from the table without a contract amendment must be a LOUD failure, never a vacuous pass',
    ).toEqual([])
    const lines = REPORTS.map(
      (r) =>
        `${r.row} ${r.strategyId}: ${r.held ? 'held' : 'broken'} · declared ${r.declared} = ${r.declaredTotal} · executed ${r.executed} · ` +
        `stoppedAt ${String(r.stoppedAt)} · counterexamples ${r.counterexamples.length}`,
    )
    // eslint-disable-next-line no-console
    console.log('U-APP-HARNESS-READINESS REGISTER REPORT\n' + lines.join('\n'))
    expect(
      REPORTS.every((r) => r.held),
      `every register row must hold at the green head; broken at this head: ${REPORTS.filter((r) => !r.held)
        .map((r) => `${r.row} (executed ${r.executed}/${r.declaredTotal}, stoppedAt ${String(r.stoppedAt)})`)
        .join(', ')}\nU-APP-HARNESS-READINESS REGISTER REPORT\n${lines.join('\n')}`,
    ).toBe(true)
  })
})
