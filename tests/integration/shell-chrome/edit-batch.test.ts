// tests/integration/shell-chrome/edit-batch.test.ts — unit `edit-batch`'s SERVER-PATH row, authored BEFORE any byte of the
// landing (RCA-1: the red set runs first and is REPORTED before implementation).
//
// WHAT IS DRIVEN, AND WHY IT IS DRIVEN THIS WAY: a REAL `Client` (`@modelcontextprotocol/sdk/client/index.js`) is linked to the
// server the `ProvidentMcpServer` really registers (`server.ensureServerRegistered()` → `registerTools`) over
// `InMemoryTransport.createLinkedPair()`, and every assertion below reads the answer the server sent through `client.callTool`
// / `client.listTools`. §3.6 and §4 are explicit: this row "drives the server's own `registerTools` path … never a direct
// `handleEditTool` call". The direct handler call is the UNIT row's fail-state surface
// (`tests/unit/shell-chrome/edit-batch-register.test.ts`); here the tool is reached ONLY through the SDK.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-edit-batch.md`
//   §1(a) THE PRIMITIVE IS COMPLETE. `applyBatch` is all-or-nothing with snapshot/restore rollback (rag-store.ts:1375-1454),
//        lands ONE `batch` journal entry + ONE persist on success (:1451/:1452), and answers the DISCRIMINATED `BatchResult`
//        `{ ok: true; results: BatchOpResult[] } | { ok: false; error; failedIndex }` (:215-217) — never a throw for a domain
//        failure. The shared handler is `handleEditBatch(store, payload)` (edit-ops.ts:440-448) and the derivation is
//        `deriveBatchBroadcast(ops, results, preBatchNodes)` (:614-667). Those three ARE the UI path (main.ts:1038-1067), which
//        is why §2 calls registering the tool "a wiring act, not an invention".
//   §3.3  The advertised row: `inputSchema: { ops: z.array(z.unknown()), store: z.string().optional() }` — lax schema, strict
//        handler; `ops` is REQUIRED with NO `.min(1)` (an empty batch is a valid no-op, rag-store.ts:1379), `store` optional.
//   §3.4  On `result.ok` the handler derives the payload exactly as main.ts:1044-1059 does (a `preBatchNodes` snapshot taken
//        BEFORE the call) and emits ONCE; a failed/malformed batch emits ZERO times; an empty batch emits ONCE with an empty
//        payload ("equivalence beats a special case"). The `edit.` prefix routes to the reconcile+broadcast callback
//        (mcp-server.ts:2432-2459), so `backend.broadcast(IPC_RAG_STORE_CHANGED, payload)` is the emission this row counts.
//   §4    Acceptance: a REAL result over the existing primitive (a tool that answers but writes nothing is the SAME defect);
//        in the `edit` group, default-off; a schema the server accepts (`ops` array+required, `store` string+optional); a row
//        that drives the server's own `registerTools` path; a census the unit row pins.
//   §5    A1 (answers but writes nothing), A2 (a batch that half-applies), A3 (a group the gate refuses), A4/A5 are the unit
//        row's; the §5.5 equivalence claim — "the same batch, the same result" — is I9.
//   §6    Every row whose subject is the TOOL is RED by MEASUREMENT at this head: `edit.batch` is in neither `ALL_TOOLS` nor
//        `TOOL_GROUPS`, so the SDK answers `MCP error -32602: Tool edit.batch not found` and `client.listTools()` omits it.
//   §9    LAYERS.
//
// LINE PINS (read the NAMES, not the offsets): the `mcp-server.ts` coordinates in this header were taken at the PRE-LANDING
// head `cd4cc31` — the `edit.` prefix's reconcile+broadcast callback at `:2432-2459` and the reconcile's `.catch` at
// `:2445-2450`. The landing inserts before them, so at the LANDED head they read `:2488-2515` and `:2501-2506`. Nothing below
// asserts against an offset.
//
// THE EMISSION PROBE (§3.4): the injected `McpBackend` is a no-op `invoke` plus a `vi.fn()` `broadcast`. The server calls it as
// `backend.broadcast?.(IPC_RAG_STORE_CHANGED, payload)`, so the CALL COUNT is the emission count and `mock.calls[i][1]` is the
// payload whose `{ kind, nodeIds, edgeIds, store }` this file reads. Nothing is mocked module-wide (`vi.fn()` only), so the
// server under test is the shipped one.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): MCP-SURFACE / NODE — registration, group gating, the advertised schema, the
// `registerTools` → SDK `callTool` path, the atomic write, the rollback, and the emission count, asserted IN-PROCESS over
// `InMemoryTransport`. What this layer can NEVER read, named so nobody quotes it: that a real Electron client with `edit`
// enabled answers over stdio/HTTP (that is a LIVE layer this unit does not run), that the RENDERER repaints after the
// `rag-store-changed` emission (the backend here is a double — no window, no preload, no IPC hop), that the retrieval index
// reconcile landed (fire-and-forget, mcp-server.ts:2445-2450), or that the assembled/spawned app boots with the tool. §9's
// second bullet says the in-process SDK client is the strongest reachability this repo can assert without a spawned app, and this
// file claims exactly that and nothing more.
//
// REACHABILITY RULE (this file always COLLECTS and RUNS): the modules imported here all exist at this head, so no import can
// fail. The MISSING subject is the TOOL: `client.listTools()` omits `edit.batch` and `client.callTool({ name: 'edit.batch' })`
// is REFUSED by the SDK's own handler (`MCP error -32602: Tool edit.batch not found`, mcp/server/mcp.js's `CallToolRequestSchema`
// arm) — a JSON-RPC error the client surfaces as a REJECTED promise. Every such outcome is captured by ONE defensive prober
// (`probeTool`) and reported as a NAMED problem inside that row's ONE aggregate `expect(problems, …)`; a non-JSON
// `result.content[0].text` is a NAMED problem too. Nothing here throws an unhandled `TypeError`, nothing skips, nothing passes
// by construction.
//
// THE GREEN-AT-HEAD CLASS, named so nobody mistakes a fence for evidence: I1 PASSES at this head, and that is CORRECT rather
// than vacuous — an UNREGISTERED name is already absent from `tools/list` and already refused by the SDK, so I1's two halves
// hold today for the wrong reason (nothing is registered) exactly as they must hold after the landing for the right one (the
// GROUP is off). I1 is the FENCE that reds if the landing registers the row unconditionally: an ungated `edit.batch` appears in
// the default gate's `tools/list`, and the fresh-store "no write" arm is what proves the refusal is a refusal and not a handler
// that runs and then fails. Everything else here (I2…I9) is RED by measurement (§6).
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO: no `vi.mock`, no network, no electron, no spawn, no `git`; it writes nothing outside
// its own `mkdtempSync` scratch dirs, which `afterAll` removes.
import { describe, it, expect, vi, afterAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

import {
  createJsonRagStore,
  type BatchOp,
  type BatchResult,
  type RagEdge,
  type RagNode,
  type RagStore,
} from '../../../src/main/rag-store.js'
import { handleEditBatch, deriveBatchBroadcast } from '../../../src/main/edit-ops.js'
import {
  createRetrieval,
  createLexicalEmbedder,
  createLexicalIndex,
  type RetrievalEngine,
} from '../../../src/main/retrieval.js'
import { SecurityGate, type ToolGroup } from '../../../src/main/security.js'
import { ProvidentMcpServer, type McpBackend } from '../../../src/main/mcp-server.js'
import type { RagStoreDirectory, RagStoreEntry } from '../../../src/main/rag-store-directory.js'
import { IPC_RAG_STORE_CHANGED, type RagStoreChangedPayload } from '../../../src/shared/types.js'

// ---------------------------------------------------------------------------
// house-style helpers (independent fixtures)
// ---------------------------------------------------------------------------
const tempDirs: string[] = []

function freshDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'provident-edit-batch-int-'))
  tempDirs.push(dir)
  return dir
}

afterAll(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

/** Fixed timestamps: a created node's record is then FULLY deterministic (id/type/content/ownedNodeIds/createdAt/updatedAt), so
 *  the byte comparisons below compare records and never the clock. An UPDATED record's `updatedAt` is the store's monotonic
 *  clock (`refreshTimestamp`, rag-store.ts:337-342, which uses `Date.now()`), so I9 compares an updated record field-by-field. */
const NOW = '2026-09-24T00:00:00.000Z'

/** A valid `RagNode`: `id` + `type` (one of `RAG_NODE_TYPES`) + `content` + `ownedNodeIds` + the two ISO timestamps
 *  (`validateNodeShape`, rag-store.ts:425-472). */
function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  return {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }
}

/** A valid `RagEdge`: `id` + `kind` (one of `RAG_EDGE_KINDS`) + `source`/`target`. Both endpoints must EXIST before the edge is
 *  written (`applyBatchOp`'s `putEdge` arm, rag-store.ts:1286-1292). */
function makeEdge(id: string, source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  return {
    id,
    kind: 'parent-child',
    source,
    target,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }
}

const ALPHA = 'alpha-catalogue'

interface Target {
  directory: RagStoreDirectory
  defaultName: string
  store: RagStore
}

/** One wired store + its engine, in a directory whose single entry IS the default (the U-MS2 wiring invariant: `ragStore` IS
 *  `entries.get(defaultName).store` and `retrievalEngine` IS that entry's engine). The engine is REAL — the `edit.*` callback
 *  reconciles it per call (mcp-server.ts:2441-2450), so a null engine would throw inside the emission path and turn a lawful
 *  batch into an SDK error. */
function makeTarget(root: string, name: string = ALPHA): Target {
  const store = createJsonRagStore({ path: join(root, `persist-${name}.json`) })
  const engine: RetrievalEngine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
  const entry: RagStoreEntry = { name, store, engine, corrupt: false, missing: false }
  return { directory: { entries: new Map([[name, entry]]), defaultName: name }, defaultName: name, store }
}

interface Harness {
  client: Client
  server: ProvidentMcpServer
  broadcast: ReturnType<typeof vi.fn>
  emissions: RagStoreChangedPayload[]
  close: () => Promise<void>
}

/** The house harness: the REAL server, its REAL `registerTools`, a REAL `Client` over the SDK's in-memory transport, and a
 *  recording backend. `groups` is the gate the server is built with, so a default-off harness and an edit-on harness are the
 *  same code path with a different gate. */
async function openHarness(target: Target, groups: ToolGroup[]): Promise<Harness> {
  const emissions: RagStoreChangedPayload[] = []
  const broadcast = vi.fn((channel: string, payload: unknown) => {
    if (channel === IPC_RAG_STORE_CHANGED) emissions.push(payload as RagStoreChangedPayload)
  })
  const backend: McpBackend = { invoke: async () => ({}), broadcast }
  const defaultEntry = target.directory.entries.get(target.defaultName)!
  const server = new ProvidentMcpServer({
    backend,
    transport: 'stdio',
    gate: new SecurityGate({ token: null, enabled: [...groups] }),
    ragStore: defaultEntry.store,
    retrievalEngine: defaultEntry.engine,
    ragStores: target.directory,
  })
  server.ensureServerRegistered()
  const sdkServer = server.ensureServerRegistered()
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'edit-batch-integration', version: '0.1.0' })
  await Promise.all([
    client.connect(clientTransport),
    (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
  ])
  return {
    client,
    server,
    broadcast,
    emissions,
    close: async () => {
      await client.close()
    },
  }
}

type ToolText = { type?: string; text?: string }
type ToolAnswer = { isError?: boolean; content?: ToolText[] }

/** A defensive reading of ONE `tools/call`. NEVER throws: a JSON-RPC refusal (the SDK's `-32602`, a REJECTED promise), a missing
 *  `content[0].text`, and a non-JSON text are each a NAMED `problem` the row reports — the reachability rule in the header. */
interface Probe {
  /** 'answered' = the server sent a tool result; 'refused' = the SDK/JSON-RPC refused or the call rejected. */
  channel: 'answered' | 'refused'
  isError: boolean
  text: string
  value?: unknown
  problem?: string
}

async function probeTool(client: Client, name: string, args: Record<string, unknown>): Promise<Probe> {
  let answer: ToolAnswer
  try {
    answer = (await client.callTool({ name, arguments: args })) as ToolAnswer
  } catch (err) {
    const message = (err as Error)?.message ?? String(err)
    return { channel: 'refused', isError: true, text: `REJECTED: ${message}`, problem: 'the tools/call was refused by the server' }
  }
  const isError = answer?.isError === true
  const text = answer?.content?.[0]?.text ?? ''
  if (typeof text !== 'string' || text.trim() === '') {
    return { channel: 'answered', isError, text: '', problem: 'the tool result carried no content[0].text' }
  }
  try {
    return { channel: 'answered', isError, text, value: JSON.parse(text) }
  } catch {
    return { channel: 'answered', isError, text, problem: 'the tool result content[0].text is not valid JSON' }
  }
}

/** The `BatchResult` a probe answered, or `null` with the reason pushed onto the row's problem list. */
function asBatch(probe: Probe, problems: string[], row: string): BatchResult | null {
  if (probe.problem !== undefined) {
    problems.push(`${row}: ${probe.problem} — server said: ${JSON.stringify(probe.text)}`)
    return null
  }
  if (probe.isError) {
    problems.push(`${row}: the tool result carried isError: true — a batch domain failure must be a RESULT, never a throw (§1(a), §3.4): ${JSON.stringify(probe.text)}`)
    return null
  }
  const value = probe.value
  if (value === null || typeof value !== 'object' || !('ok' in (value as Record<string, unknown>))) {
    problems.push(`${row}: the answer ${JSON.stringify(value)} is not a BatchResult ({ ok: … }) (§1(a))`)
    return null
  }
  return value as BatchResult
}

/** The main.ts:1044-1059 pre-batch snapshot — the UI path's OWN capture, reproduced here so I9's comparison is between the MCP
 *  path and the UI path and not between two copies of the test's arithmetic. */
function preBatchSnapshot(store: RagStore, ops: BatchOp[]): Map<string, RagNode> {
  const pre = new Map<string, RagNode>()
  for (const op of ops) {
    if (op && op.op === 'putNode' && op.node && typeof op.node.id === 'string') {
      const existing = store.getNode(op.node.id)
      if (existing) pre.set(op.node.id, existing)
    }
  }
  return pre
}

const sorted = (values: readonly string[] | undefined): string[] => [...(values ?? [])].sort()

// ===========================================================================
// I1 — REACHABILITY, DEFAULT-OFF: absent from tools/list and REFUSED by the SDK (§4, §5 A3)
// ===========================================================================
describe('I1 — default gate: the tool is absent and refused, and nothing is written', () => {
  it("I1 — client.listTools() omits 'edit.batch' and client.callTool is REFUSED with no write (§4 default-off, §5 A3)", async () => {
    const problems: string[] = []
    const target = makeTarget(freshDir())
    const harness = await openHarness(target, ['read', 'dispatch'])
    try {
      const { tools } = await harness.client.listTools()
      const names = (tools ?? []).map((tool) => tool.name)
      if (names.includes('edit.batch')) {
        problems.push(`I1: tools/list UNDER THE DEFAULT GATE advertises 'edit.batch' — the name must be default-off (§4)`)
      }
      // Positive control: the listing is LIVE (the default-on groups registered), so the absence above is a reading, not an
      // empty response.
      if (!names.includes('provident.dispatch')) {
        problems.push(`I1 control: tools/list lacks 'provident.dispatch' — the default gate's own tools were not listed (${JSON.stringify(names)})`)
      }

      // §5 A3 — "a direct SDK callTool for it is the SDK's not-found, never a write". The SDK refuses with a JSON-RPC error the
      // client surfaces as a REJECTION (mcp/server/mcp.js: `throw new McpError(InvalidParams, 'Tool … not found')`); a tool that
      // is registered-but-disabled would instead answer `Tool … disabled`. Either is a refusal; an ANSWER is not.
      const probe = await probeTool(harness.client, 'edit.batch', { ops: [] })
      if (probe.channel !== 'refused' && probe.isError !== true) {
        problems.push(
          `I1: client.callTool({ name: 'edit.batch' }) was ACCEPTED under the default gate (server said ${JSON.stringify(probe.text)}) — the gate must refuse, and by ABSENCE, never a handler throw (§4)`,
        )
      }
      const refusal = probe.text.toLowerCase()
      if (!refusal.includes('not found') && !refusal.includes('disabled')) {
        problems.push(`I1: the refusal does not read as the SDK's not-found/disabled (${JSON.stringify(probe.text)}) — §5 A3 pins the SDK's own refusal, not a handler error`)
      }
      if (!refusal.includes('edit.batch')) {
        problems.push(`I1: the refusal does not name the tool (${JSON.stringify(probe.text)})`)
      }

      // The refusal wrote NOTHING: the store is fresh, so a node or a journal entry is a write.
      if (target.store.listNodes().length !== 0) {
        problems.push(`I1: the store gained ${target.store.listNodes().length} node(s) on a REFUSED call — a refused call never writes (§5 A3)`)
      }
      if (target.store.journal().length !== 0) {
        problems.push(`I1: the store's journal gained ${target.store.journal().length} entr(ies) on a REFUSED call — nothing may be written (§5 A3)`)
      }
      if (harness.broadcast.mock.calls.length !== 0) {
        problems.push(`I1: backend.broadcast ran ${harness.broadcast.mock.calls.length} time(s) on a REFUSED call — zero emissions (§3.4)`)
      }
    } finally {
      await harness.close()
    }
    expect(problems, 'I1 — the default gate refuses edit.batch by ABSENCE over the real SDK path (§4, §5 A3)').toEqual([])
  })
})

// ===========================================================================
// I2 — REACHABILITY, EDIT-ON: listed, and the advertised schema is the pinned one (§3.3, §4)
// ===========================================================================
describe('I2 — edit group on: tools/list advertises the pinned row', () => {
  it("I2 — tools/list DOES list 'edit.batch' with ops (array, required) and store (string, optional), no minItems (§3.3, §4)", async () => {
    const problems: string[] = []
    const target = makeTarget(freshDir())
    const harness = await openHarness(target, ['edit'])
    try {
      const { tools } = await harness.client.listTools()
      const row = (tools ?? []).find((tool) => tool.name === 'edit.batch')
      if (!row) {
        problems.push(
          `I2: tools/list with the edit group enabled does NOT list 'edit.batch' (listed: ${JSON.stringify((tools ?? []).map((tool) => tool.name))}) — the row registers nowhere without the TOOL_GROUPS membership row (§1(b), §4)`,
        )
      } else {
        // §3.3 — the advertised JSON schema, read the way the U-D7 blind artifact reads one
        // (tests/blind-unit-ud7-set-doc-meta-op-greens.test.ts:784-798).
        const schema = row.inputSchema as {
          properties?: Record<string, { type?: string; items?: { type?: string }; minItems?: number }>
          required?: string[]
        }
        const properties = schema?.properties ?? {}
        if (properties.ops === undefined) {
          problems.push(`I2: the advertised inputSchema has no 'ops' property — pinned { ops: z.array(z.unknown()), store?: z.string() } (§3.3)`)
        } else {
          if (properties.ops.type !== 'array') {
            problems.push(`I2: properties.ops.type is ${JSON.stringify(properties.ops.type)}, pinned at 'array' (§3.3)`)
          }
          // §3.3 — "ops is REQUIRED, with NO .min(1)": an empty batch is a valid no-op (rag-store.ts:1379) and §5.6.6's happy
          // path. A `.min(1)` landing would surface here as `minItems`.
          if (properties.ops.minItems !== undefined) {
            problems.push(`I2: properties.ops carries minItems=${String(properties.ops.minItems)} — §3.3 pins NO .min(1) (an empty batch is a valid no-op)`)
          }
        }
        if (properties.store === undefined) {
          problems.push(`I2: the advertised inputSchema has no 'store' property — §3.3 keeps the house trailing store?: string on EVERY rag/edit schema`)
        } else if (properties.store.type !== 'string') {
          problems.push(`I2: properties.store.type is ${JSON.stringify(properties.store.type)}, pinned at 'string' (§3.3)`)
        }
        const required = schema?.required ?? []
        if (!required.includes('ops')) {
          problems.push(`I2: 'ops' is not in the schema's required list (${JSON.stringify(required)}) — §3.3 pins it REQUIRED`)
        }
        if (required.includes('store')) {
          problems.push(`I2: 'store' is REQUIRED (${JSON.stringify(required)}) — §3.3 pins it OPTIONAL`)
        }
      }

      // Positive control: the listing really is the edit group's (a sibling row is there too), so a missing row above is not a
      // gate that failed to widen.
      if (!(tools ?? []).some((tool) => tool.name === 'edit.set_doc_meta')) {
        problems.push(`I2 control: tools/list with edit enabled lacks 'edit.set_doc_meta' — the widen itself did not take effect`)
      }
    } finally {
      await harness.close()
    }
    expect(problems, 'I2 — the advertised edit.batch row is the pinned lax schema (§3.3, §4)').toEqual([])
  })
})

// ===========================================================================
// I3 — A REAL RESULT over the existing primitive: one putNode CREATE (§4)
// ===========================================================================
describe('I3 — one op over the SDK path writes through to the store and the journal', () => {
  it('I3 — a one-op putNode create answers { ok: true, results: [putNode] }, the node is readable, and ONE batch journal entry lands (§4, §1(a))', async () => {
    const problems: string[] = []
    const target = makeTarget(freshDir())
    const harness = await openHarness(target, ['edit'])
    try {
      const ops: BatchOp[] = [{ op: 'putNode', node: makeNode('i3-node', { content: 'i3 content' }) }]
      const probe = await probeTool(harness.client, 'edit.batch', { ops })
      const result = asBatch(probe, problems, 'I3')
      if (result !== null) {
        if (result.ok !== true) {
          problems.push(`I3: the call answered ok === false (${JSON.stringify((result as { error?: string }).error)}, failedIndex ${String((result as { failedIndex?: number }).failedIndex)}) for a lawful one-op batch (§4)`)
        } else {
          if (result.results.length !== 1) {
            problems.push(`I3: ${result.results.length} BatchOpResult(s) for 1 op — exactly one agreeing result per op (§4)`)
          }
          const first = result.results[0]
          if (!first || first.op !== 'putNode') {
            problems.push(`I3: results[0].op is ${JSON.stringify(first?.op)}, pinned at 'putNode' (§4)`)
          } else if (first.node?.id !== 'i3-node') {
            problems.push(`I3: results[0].node.id is ${JSON.stringify(first.node?.id)}, pinned at the op's id 'i3-node' (§4)`)
          }
        }
      }

      // §4 — "the write is observable through store.getNode / store.journal()": a tool that answers but writes nothing is the
      // SAME defect (§5 A1's lesson).
      const written = target.store.getNode('i3-node')
      if (!written) {
        problems.push('I3: store.getNode(\'i3-node\') is undefined after an ok: true answer — the tool answered but wrote NOTHING (§4, §5 A1)')
      } else if (written.content !== 'i3 content') {
        problems.push(`I3: the written record's content is ${JSON.stringify(written.content)}, pinned at 'i3 content'`)
      }
      const batchEntries = target.store.journal().filter((entry) => entry.kind === 'batch')
      if (batchEntries.length !== 1) {
        problems.push(`I3: the journal holds ${batchEntries.length} batch entr(ies), pinned at exactly ONE (rag-store.ts:1451, §1(a))`)
      }
      if (target.store.journal().length !== 1) {
        problems.push(`I3: the journal holds ${target.store.journal().length} entr(ies), pinned at 1 — a one-op successful batch is ONE journal entry, never one per op (§1(a))`)
      }
    } finally {
      await harness.close()
    }
    expect(problems, 'I3 — a real result over the existing primitive, and the write is observable (§4)').toEqual([])
  })
})

// ===========================================================================
// I4 — MULTI-OP + EXACTLY ONE EMISSION (§3.4, §4)
// ===========================================================================
describe('I4 — a two-op batch answers two results and emits rag-store-changed ONCE', () => {
  it('I4 — create+edge answers ok:true with 2 results; backend.broadcast fires ONCE with kind structural and the batch’s nodeIds/edgeIds (§3.4)', async () => {
    const problems: string[] = []
    const root = freshDir()
    const target = makeTarget(root)
    // Two EXISTING endpoints for the edge (the primitive requires both to exist, rag-store.ts:1286-1292).
    await target.store.putNode(makeNode('i4-a'))
    await target.store.putNode(makeNode('i4-b'))
    const harness = await openHarness(target, ['edit'])
    try {
      const ops: BatchOp[] = [
        { op: 'putNode', node: makeNode('i4-c') },
        { op: 'putEdge', edge: makeEdge('i4-edge', 'i4-a', 'i4-b') },
      ]
      harness.broadcast.mockClear()
      const probe = await probeTool(harness.client, 'edit.batch', { ops })
      const result = asBatch(probe, problems, 'I4')
      if (result !== null) {
        if (result.ok !== true) {
          problems.push(`I4: the two-op batch answered ok === false (${JSON.stringify((result as { error?: string }).error)}) (§4)`)
        } else {
          if (result.results.length !== 2) problems.push(`I4: ${result.results.length} results for a 2-op batch, pinned at 2 (§4)`)
          if (result.results[0]?.op !== 'putNode') problems.push(`I4: results[0].op is ${JSON.stringify(result.results[0]?.op)}, pinned at 'putNode'`)
          if (result.results[1]?.op !== 'putEdge') problems.push(`I4: results[1].op is ${JSON.stringify(result.results[1]?.op)}, pinned at 'putEdge'`)
        }
      }

      // §3.4 — emit ONCE on success. Not twice (one per op), not zero.
      const calls = harness.broadcast.mock.calls
      if (calls.length !== 1) {
        problems.push(`I4: backend.broadcast ran ${calls.length} time(s), pinned at EXACTLY ONCE for a successful batch (§3.4)`)
      }
      const offChannel = calls.filter((call) => call[0] !== IPC_RAG_STORE_CHANGED)
      if (offChannel.length > 0) {
        problems.push(`I4: ${offChannel.length} emission(s) did not carry ${IPC_RAG_STORE_CHANGED} (channels ${JSON.stringify(calls.map((call) => call[0]))}) (§3.4)`)
      }
      const payload = harness.emissions[0]
      if (!payload) {
        problems.push(`I4: no ${IPC_RAG_STORE_CHANGED} payload was emitted — the re-traversal trigger is the batch's whole point (§3.4)`)
      } else {
        if (payload.kind !== 'structural') {
          problems.push(`I4: the emitted kind is ${JSON.stringify(payload.kind)}, pinned at 'structural' — a putNode CREATE and a putEdge are structural (deriveBatchBroadcast)`)
        }
        // §3.4 — the payload is derived from the ops; assert COVERAGE (the derivation's dedupe order is its own business).
        const nodeIds = sorted(payload.nodeIds)
        for (const expected of ['i4-a', 'i4-b', 'i4-c']) {
          if (!nodeIds.includes(expected)) problems.push(`I4: the emitted nodeIds ${JSON.stringify(payload.nodeIds)} do not cover '${expected}' (§3.4)`)
        }
        const edgeIds = sorted(payload.edgeIds)
        if (!edgeIds.includes('i4-edge')) problems.push(`I4: the emitted edgeIds ${JSON.stringify(payload.edgeIds)} do not cover 'i4-edge' (§3.4)`)
        // §3.4 emits `store: storeName`; this harness's directory has ONE entry, and it is the default, so the payload names it.
        if (payload.store !== target.defaultName) {
          problems.push(`I4: the emitted store is ${JSON.stringify(payload.store)}, pinned at the addressed default '${target.defaultName}' (§3.4)`)
        }
      }

      // The write is real, both halves of it.
      if (!target.store.getNode('i4-c')) problems.push('I4: the created node is absent from the store (§4)')
      if (!target.store.getEdge('i4-edge')) problems.push('I4: the written edge is absent from the store (§4)')
    } finally {
      await harness.close()
    }
    expect(problems, 'I4 — one successful multi-op batch = one atomic write + exactly ONE emission (§3.4)').toEqual([])
  })
})

// ===========================================================================
// I5 — EMPTY BATCH: a valid no-op that STILL emits once (§3.3, §3.4)
// ===========================================================================
describe('I5 — an empty batch is a valid no-op that emits once', () => {
  it('I5 — ops: [] answers { ok: true, results: [] } with no throw, and emits ONCE with empty nodeIds/edgeIds (§3.3, §3.4)', async () => {
    const problems: string[] = []
    const target = makeTarget(freshDir())
    const harness = await openHarness(target, ['edit'])
    try {
      const probe = await probeTool(harness.client, 'edit.batch', { ops: [] })
      const result = asBatch(probe, problems, 'I5')
      if (result !== null) {
        if (result.ok !== true) {
          problems.push(`I5: ops: [] answered ok === false (${JSON.stringify((result as { error?: string }).error)}) — an empty batch is a valid no-op (rag-store.ts:1379, §3.3)`)
        } else if (result.results.length !== 0) {
          problems.push(`I5: ops: [] answered ${result.results.length} result(s), pinned at 0 (§3.3)`)
        }
      }

      // §3.4 — "An empty batch emits once with an empty payload, which is what the UI path does (equivalence beats a special
      // case)". So the count is ONE, never zero: a landing that special-cases the empty batch reds here.
      const calls = harness.broadcast.mock.calls
      if (calls.length !== 1) {
        problems.push(`I5: backend.broadcast ran ${calls.length} time(s) for ops: [], pinned at EXACTLY ONCE (§3.4: "an empty batch emits once with an empty payload")`)
      }
      const payload = harness.emissions[0]
      if (!payload) {
        problems.push(`I5: no ${IPC_RAG_STORE_CHANGED} payload was emitted for ops: [] (§3.4)`)
      } else {
        if (sorted(payload.nodeIds).length !== 0) {
          problems.push(`I5: the emitted nodeIds ${JSON.stringify(payload.nodeIds)} are not empty for an empty batch (§3.4)`)
        }
        if (sorted(payload.edgeIds).length !== 0) {
          problems.push(`I5: the emitted edgeIds ${JSON.stringify(payload.edgeIds)} are not empty for an empty batch (§3.4)`)
        }
        if (payload.store !== target.defaultName) {
          problems.push(`I5: the emitted store is ${JSON.stringify(payload.store)}, pinned at '${target.defaultName}' (§3.4)`)
        }
      }

      // "No-op" is a claim about the STORE, not only about the answer (rag-store.ts:1379: the empty batch skips even the
      // snapshot). A journal entry or a node here would be a write.
      if (target.store.journal().length !== 0) {
        problems.push(`I5: the journal holds ${target.store.journal().length} entr(ies) after ops: [] — an empty batch writes nothing (§3.3)`)
      }
      if (target.store.listNodes().length !== 0) {
        problems.push(`I5: the store holds ${target.store.listNodes().length} node(s) after ops: [] — an empty batch writes nothing (§3.3)`)
      }
    } finally {
      await harness.close()
    }
    expect(problems, 'I5 — ops: [] is a valid no-op whose emission is ONE empty payload (§3.3, §3.4)').toEqual([])
  })
})

// ===========================================================================
// I6 — ADVERSARIAL A1: ANSWERS BUT WRITES NOTHING (§5 A1)
//
// A batch whose op is valid but INERT (`removeNode` of an absent id → `{ op: 'removeNode', removed: false }`). The tool must
// answer `ok: true` AND the store must be provably unchanged. WHAT "UNCHANGED" IS MEASURED AS, stated so the reading is not
// mistaken for a weaker arm: the record bytes of the pre-seeded node, the node/edge census, and the absence of any journal entry
// BEYOND the transaction's own single `batch` record — `applyBatch` lands exactly ONE `batch` entry on every success path
// (rag-store.ts:1451, §1(a)'s pinned table row), so a literal "journal depth unchanged" would contradict the primitive's own
// contract. The emission must still be DERIVED from the op, never a fabricated "wrote X".
// ===========================================================================
describe('I6 — a valid but inert batch answers and changes nothing', () => {
  it("I6 — removeNode of an absent id answers { op: 'removeNode', removed: false }; the seeded node is byte-identical, the census and the journal are unchanged (§5 A1)", async () => {
    const problems: string[] = []
    const target = makeTarget(freshDir())
    await target.store.putNode(makeNode('i6-seed', { content: 'seeded bytes', type: 'h2' }))
    await target.store.putNode(makeNode('i6-other'))
    await target.store.putEdge(makeEdge('i6-seed-edge', 'i6-seed', 'i6-other'))
    const beforeBytes = JSON.stringify(target.store.getNode('i6-seed'))
    const beforeOtherBytes = JSON.stringify(target.store.getNode('i6-other'))
    const beforeNodes = target.store.listNodes().length
    const beforeEdges = target.store.listEdges().length
    const beforeJournal = target.store.journal()
    const beforeNonBatch = beforeJournal.filter((entry) => entry.kind !== 'batch').length
    const harness = await openHarness(target, ['edit'])
    try {
      const ops: BatchOp[] = [{ op: 'removeNode', id: 'no-such-node' }]
      const probe = await probeTool(harness.client, 'edit.batch', { ops })
      const result = asBatch(probe, problems, 'I6')
      if (result !== null) {
        if (result.ok !== true) {
          problems.push(`I6: an INERT but valid op answered ok === false (${JSON.stringify((result as { error?: string }).error)}) — the primitive answers ok: true for a no-op removal (§5 A1)`)
        } else {
          if (result.results.length !== 1) problems.push(`I6: ${result.results.length} results for 1 op (§4)`)
          const first = result.results[0]
          if (!first || first.op !== 'removeNode') {
            problems.push(`I6: results[0].op is ${JSON.stringify(first?.op)}, pinned at 'removeNode' (§5 A1)`)
          } else if (first.removed !== false) {
            problems.push(`I6: results[0].removed is ${JSON.stringify(first.removed)}, pinned at FALSE — the id is absent, so nothing was removed (§5 A1)`)
          }
        }
      }

      // The store is PROVABLY unchanged (§5 A1).
      if (JSON.stringify(target.store.getNode('i6-seed')) !== beforeBytes) {
        problems.push(`I6: the seeded node's bytes changed (${beforeBytes} → ${JSON.stringify(target.store.getNode('i6-seed'))}) — an inert batch writes nothing (§5 A1)`)
      }
      if (JSON.stringify(target.store.getNode('i6-other')) !== beforeOtherBytes) {
        problems.push(`I6: an UNRELATED node's bytes changed — an inert batch writes nothing (§5 A1)`)
      }
      if (target.store.listNodes().length !== beforeNodes) {
        problems.push(`I6: the node census moved ${beforeNodes} → ${target.store.listNodes().length} (§5 A1)`)
      }
      if (target.store.listEdges().length !== beforeEdges) {
        problems.push(`I6: the edge census moved ${beforeEdges} → ${target.store.listEdges().length} (§5 A1)`)
      }
      const afterJournal = target.store.journal()
      const afterNonBatch = afterJournal.filter((entry) => entry.kind !== 'batch').length
      if (afterNonBatch !== beforeNonBatch) {
        problems.push(`I6: ${afterNonBatch - beforeNonBatch} non-batch journal entr(ies) landed — an inert batch rewrites no record (§5 A1)`)
      }
      if (afterJournal.length !== beforeJournal.length + 1) {
        problems.push(
          `I6: the journal moved ${beforeJournal.length} → ${afterJournal.length}, pinned at +1 — a successful batch lands exactly ONE batch entry (rag-store.ts:1451, §1(a))`,
        )
      }

      // §5 A1 — "the emitted payload still derived from the op": compare it against the PURE derivation, computed from the same
      // ops/results, so the assertion is the exported helper's semantics and not a second opinion written into the test.
      const calls = harness.broadcast.mock.calls
      if (calls.length !== 1) {
        problems.push(`I6: backend.broadcast ran ${calls.length} time(s), pinned at EXACTLY ONCE (§3.4)`)
      }
      const payload = harness.emissions[0]
      if (!payload) {
        problems.push(`I6: no ${IPC_RAG_STORE_CHANGED} payload was emitted (§3.4)`)
      } else if (result !== null && result.ok === true) {
        const expected = deriveBatchBroadcast(ops, result.results, new Map())
        if (payload.kind !== expected.kind) {
          problems.push(`I6: the emitted kind ${JSON.stringify(payload.kind)} ≠ the derivation's ${JSON.stringify(expected.kind)} — the payload must be DERIVED, never fabricated (§3.4, §5 A1)`)
        }
        if (JSON.stringify(sorted(payload.nodeIds)) !== JSON.stringify(sorted(expected.nodeIds))) {
          problems.push(`I6: the emitted nodeIds ${JSON.stringify(payload.nodeIds)} ≠ the derivation's ${JSON.stringify(expected.nodeIds)} (§3.4, §5 A1)`)
        }
        if (JSON.stringify(sorted(payload.edgeIds)) !== JSON.stringify(sorted(expected.edgeIds))) {
          problems.push(`I6: the emitted edgeIds ${JSON.stringify(payload.edgeIds)} ≠ the derivation's ${JSON.stringify(expected.edgeIds)} (§3.4, §5 A1)`)
        }
      }
    } finally {
      await harness.close()
    }
    expect(problems, 'I6 — A1: the tool answers AND writes nothing (§5 A1)').toEqual([])
  })
})

// ===========================================================================
// I7 — ADVERSARIAL A2: A BATCH THAT HALF-APPLIES (§5 A2)
// ===========================================================================
describe('I7 — a mid-batch failure leaves the store at its pre-batch bytes', () => {
  it('I7 — [valid putNode, putEdge to a nonexistent node] answers { ok: false, failedIndex: 1 }, rolls back, and emits ZERO times (§5 A2)', async () => {
    const problems: string[] = []
    const target = makeTarget(freshDir())
    await target.store.putNode(makeNode('i7-a'))
    await target.store.putNode(makeNode('i7-b'))
    const beforeNodes = target.store.listNodes().length
    const beforeEdges = target.store.listEdges().length
    const beforeJournal = target.store.journal().length
    const beforeBytesA = JSON.stringify(target.store.getNode('i7-a'))
    const harness = await openHarness(target, ['edit'])
    try {
      // Op 0 APPLIES in-memory (so the rollback has something real to undo); op 1 references a target that does not exist
      // (rag-store.ts:1286-1292 answers `source/target node not found or quarantined at index 1`).
      const ops: BatchOp[] = [
        { op: 'putNode', node: makeNode('i7-new') },
        { op: 'putEdge', edge: makeEdge('i7-ghost-edge', 'i7-new', 'ghost-node') },
      ]
      const probe = await probeTool(harness.client, 'edit.batch', { ops })
      const result = asBatch(probe, problems, 'I7')
      if (result !== null) {
        if (result.ok !== false) {
          problems.push(`I7: a batch whose SECOND op cannot apply answered ok === true (${JSON.stringify(result)}) — the transaction is all-or-nothing (§5 A2)`)
        } else {
          if (result.failedIndex !== 1) {
            problems.push(`I7: failedIndex is ${String(result.failedIndex)}, pinned at 1 (the putEdge is the failing op) (§5 A2)`)
          }
          if (typeof result.error !== 'string' || !result.error.includes('at index 1')) {
            problems.push(`I7: the error ${JSON.stringify(result.error)} does not carry the primitive's 'at index 1' (§1(a), §5 A2)`)
          }
        }
      }

      // ROLLBACK (§5 A2): the applied op 0 is GONE, and every census is at its pre-batch number.
      if (target.store.getNode('i7-new') !== undefined) {
        problems.push(`I7: the first op's node 'i7-new' is STILL PRESENT — a mid-batch failure rolls the WHOLE batch back (§5 A2)`)
      }
      if (target.store.getEdge('i7-ghost-edge') !== undefined) {
        problems.push(`I7: the failing edge 'i7-ghost-edge' is present — a failed batch applies nothing (§5 A2)`)
      }
      if (target.store.listNodes().length !== beforeNodes) {
        problems.push(`I7: listNodes().length moved ${beforeNodes} → ${target.store.listNodes().length} (§5 A2)`)
      }
      if (target.store.listEdges().length !== beforeEdges) {
        problems.push(`I7: listEdges().length moved ${beforeEdges} → ${target.store.listEdges().length} (§5 A2)`)
      }
      if (target.store.journal().length !== beforeJournal) {
        problems.push(`I7: the journal moved ${beforeJournal} → ${target.store.journal().length} — a rolled-back batch pollutes nothing (§5 A2, rag-store.ts:1401-1411)`)
      }
      if (JSON.stringify(target.store.getNode('i7-a')) !== beforeBytesA) {
        problems.push(`I7: an unrelated seeded node's bytes changed on a rolled-back batch (§5 A2)`)
      }

      // ZERO emissions (§5 A2): a failed batch is not a mutation.
      if (harness.broadcast.mock.calls.length !== 0) {
        problems.push(`I7: backend.broadcast ran ${harness.broadcast.mock.calls.length} time(s) on a FAILED batch, pinned at ZERO (§5 A2, §3.4)`)
      }
    } finally {
      await harness.close()
    }
    expect(problems, 'I7 — A2: a half-applying batch rolls back completely and emits nothing (§5 A2)').toEqual([])
  })
})

// ===========================================================================
// I8 — ADVERSARIAL A3: A GROUP THE GATE REFUSES, THEN A LIVE WIDEN (§5 A3, §4)
// ===========================================================================
describe('I8 — the gate refuses by absence, and a live widen makes the same client write', () => {
  it("I8 — with edit OFF the name is in neither tools/list nor allowedToolNames() and no write lands; after applyGatePatch({ groups: ['edit'] }) the SAME client writes (§5 A3, §4)", async () => {
    const problems: string[] = []
    const target = makeTarget(freshDir())
    const harness = await openHarness(target, ['read', 'dispatch'])
    try {
      // --- the refusal half -----------------------------------------------------------------------------------------------
      if (harness.server.allowedToolNames().includes('edit.batch')) {
        problems.push(`I8: allowedToolNames() lists 'edit.batch' with edit OFF — the gate must refuse by ABSENCE (§4, §5 A3)`)
      }
      const off = await harness.client.listTools()
      if ((off.tools ?? []).some((tool) => tool.name === 'edit.batch')) {
        problems.push(`I8: tools/list lists 'edit.batch' with edit OFF (§5 A3)`)
      }
      const refused = await probeTool(harness.client, 'edit.batch', { ops: [{ op: 'putNode', node: makeNode('i8-refused') }] })
      if (refused.channel !== 'refused' && refused.isError !== true) {
        problems.push(`I8: the refused call was ACCEPTED (server said ${JSON.stringify(refused.text)}) — with edit OFF the tool must not be callable (§5 A3)`)
      }
      // "never a write" is proved by a FRESH store: a node or a journal entry here is the write the gate refused.
      if (target.store.getNode('i8-refused') !== undefined) {
        problems.push(`I8: the refused call WROTE the node — the gate refuses, never a handler that runs and then fails (§5 A3)`)
      }
      if (target.store.listNodes().length !== 0 || target.store.journal().length !== 0) {
        problems.push(
          `I8: the store holds ${target.store.listNodes().length} node(s) / ${target.store.journal().length} journal entr(ies) after a REFUSED call — nothing may be written (§5 A3)`,
        )
      }
      if (harness.broadcast.mock.calls.length !== 0) {
        problems.push(`I8: backend.broadcast ran ${harness.broadcast.mock.calls.length} time(s) on a REFUSED call (§3.4)`)
      }

      // --- the widen half ------------------------------------------------------------------------------------------------
      // The SAME call main uses on a re-gate (`applyGatePatch`, mcp-server.ts:1966-2014 — "M1-widen": a widen to a previously
      // disabled group makes those tools callable on the LIVE server, not only on the next fresh request).
      harness.server.applyGatePatch({ groups: ['edit'] })
      if (!harness.server.allowedToolNames().includes('edit.batch')) {
        problems.push(`I8: after applyGatePatch({ groups: ['edit'] }) the server's own allowedToolNames() still lacks 'edit.batch' (§2, §4)`)
      }
      const on = await harness.client.listTools()
      if (!(on.tools ?? []).some((tool) => tool.name === 'edit.batch')) {
        problems.push(
          `I8: after the live widen, tools/list does NOT list 'edit.batch' (listed: ${JSON.stringify((on.tools ?? []).map((tool) => tool.name))}) — the re-gate must register the newly-allowed tool on the LIVE server (§4)`,
        )
      }
      const written = await probeTool(harness.client, 'edit.batch', { ops: [{ op: 'putNode', node: makeNode('i8-widened') }] })
      const result = asBatch(written, problems, 'I8 (widened)')
      if (result !== null && result.ok !== true) {
        problems.push(`I8: the widened call answered ok === false (${JSON.stringify((result as { error?: string }).error)}) (§4)`)
      }
      if (target.store.getNode('i8-widened') === undefined) {
        problems.push(`I8: with edit ON the SAME client's callTool did not write — the widen must make the tool WRITE, not merely list (§4)`)
      }
      if (harness.broadcast.mock.calls.length !== 1) {
        problems.push(`I8: backend.broadcast ran ${harness.broadcast.mock.calls.length} time(s) across one refused and one successful call, pinned at 1 (§3.4)`)
      }
    } finally {
      await harness.close()
    }
    expect(problems, 'I8 — A3: the gate refuses by absence; the widen writes (§5 A3, §4)').toEqual([])
  })
})

// ===========================================================================
// I9 — MCP/UI EQUIVALENCE: the SAME ops through both paths (§2, §3.4, §5.5 of
//      docs/specs/unit-p-ipc-edit-batch.md as re-pinned here: "the same batch, the same result")
//
// Path A: `client.callTool({ name: 'edit.batch' })` — the server's own registered path.
// Path B: `handleEditBatch(store2, { ops })` + `deriveBatchBroadcast(ops, results, preBatchNodes)` — the UI path verbatim
//         (main.ts:1038-1067).
// The comparison is SERIALIZED RECORDS, never object identity.
// ===========================================================================
describe('I9 — MCP and UI answers/bytes are the same for the same batch', () => {
  it('I9 — the same ops over client.callTool and over handleEditBatch produce the same node/edge bytes and the same kind/nodeIds/edgeIds (§2, §3.4)', async () => {
    const problems: string[] = []
    const mcpTarget = makeTarget(freshDir())
    const uiStore: RagStore = createJsonRagStore({ path: join(freshDir(), 'persist-ui.json') })
    for (const store of [mcpTarget.store, uiStore]) {
      await store.putNode(makeNode('i9-seed', { type: 'h2', content: 'seed content' }))
    }

    // An UPDATE (the shared node), a CREATE and an EDGE: the create fixes `kind: 'structural'` in the derivation, the update
    // proves the update path agrees, and the edge covers the edge half of the payload.
    const ops: BatchOp[] = [
      { op: 'putNode', node: makeNode('i9-new', { content: 'created by the batch' }) },
      { op: 'putNode', node: makeNode('i9-seed', { type: 'h2', content: 'updated by the batch' }) },
      { op: 'putEdge', edge: makeEdge('i9-edge', 'i9-new', 'i9-seed') },
    ]
    const uiPre = preBatchSnapshot(uiStore, ops)
    const uiResult = await handleEditBatch(uiStore, { ops })
    const uiBroadcast = uiResult.ok ? deriveBatchBroadcast(ops, uiResult.results, uiPre) : null

    const harness = await openHarness(mcpTarget, ['edit'])
    try {
      const probe = await probeTool(harness.client, 'edit.batch', { ops })
      const mcpResult = asBatch(probe, problems, 'I9')
      if (mcpResult !== null && mcpResult.ok !== true) {
        problems.push(`I9: the MCP path answered ok === false (${JSON.stringify((mcpResult as { error?: string }).error)}) while the UI path answered ok: true — the SAME batch must give the SAME result (§2)`)
      }
      if (uiResult.ok !== true) {
        problems.push(`I9 control: the UI path (handleEditBatch) answered ok === false (${JSON.stringify((uiResult as { error?: string }).error)}) — the primitive itself failed, so the comparison is vacuous`)
      }
      if (mcpResult !== null && mcpResult.ok === true && uiResult.ok === true) {
        if (mcpResult.results.length !== uiResult.results.length) {
          problems.push(`I9: the MCP path answered ${mcpResult.results.length} results, the UI path ${uiResult.results.length} — same batch, same result (§2)`)
        }
        for (let i = 0; i < Math.min(mcpResult.results.length, uiResult.results.length); i++) {
          const a = mcpResult.results[i]
          const b = uiResult.results[i]
          if (a.op !== b.op) problems.push(`I9: results[${i}].op differs: MCP ${JSON.stringify(a.op)} vs UI ${JSON.stringify(b.op)} (§2)`)
        }
      }

      // The BYTES of every affected record. A CREATED record is fully deterministic (the op's own timestamps), so the comparison
      // is `JSON.stringify` of the public record; an UPDATED record's `updatedAt` is the store's wall clock (rag-store.ts:337-342),
      // so that record is compared field-by-field with the timestamp named out loud rather than silently skipped.
      const createdA = mcpTarget.store.getNode('i9-new')
      const createdB = uiStore.getNode('i9-new')
      if (!createdA || !createdB) {
        problems.push('I9: the created node is missing on one of the two stores — the comparison cannot be made (§2)')
      } else if (JSON.stringify(createdA) !== JSON.stringify(createdB)) {
        problems.push(`I9: the CREATED node's bytes differ: MCP ${JSON.stringify(createdA)} vs UI ${JSON.stringify(createdB)} (§2)`)
      }

      const edgeA = mcpTarget.store.getEdge('i9-edge')
      const edgeB = uiStore.getEdge('i9-edge')
      if (!edgeA || !edgeB) {
        problems.push('I9: the written edge is missing on one of the two stores (§2)')
      } else if (JSON.stringify(edgeA) !== JSON.stringify(edgeB)) {
        problems.push(`I9: the EDGE's bytes differ: MCP ${JSON.stringify(edgeA)} vs UI ${JSON.stringify(edgeB)} (§2)`)
      }

      const seedA = mcpTarget.store.getNode('i9-seed')
      const seedB = uiStore.getNode('i9-seed')
      if (!seedA || !seedB) {
        problems.push('I9: the updated node is missing on one of the two stores (§2)')
      } else {
        for (const field of ['id', 'type', 'content', 'ownedNodeIds'] as const) {
          if (JSON.stringify(seedA[field]) !== JSON.stringify(seedB[field])) {
            problems.push(`I9: the UPDATED node's ${field} differs: MCP ${JSON.stringify(seedA[field])} vs UI ${JSON.stringify(seedB[field])} (§2)`)
          }
        }
      }

      // The DERIVATION: the emitted payload must be the shared helper's own answer.
      const payload = harness.emissions[0]
      if (!payload) {
        problems.push(`I9: the MCP path emitted no ${IPC_RAG_STORE_CHANGED} payload — there is nothing to compare on the derivation (§3.4)`)
      } else if (uiBroadcast === null) {
        problems.push('I9 control: the UI path produced no derivation (its batch failed) — the derivation comparison is vacuous')
      } else {
        if (payload.kind !== uiBroadcast.kind) {
          problems.push(`I9: the emitted kind ${JSON.stringify(payload.kind)} ≠ the UI path's ${JSON.stringify(uiBroadcast.kind)} — same batch, same derivation (§3.4)`)
        }
        if (JSON.stringify(sorted(payload.nodeIds)) !== JSON.stringify(sorted(uiBroadcast.nodeIds))) {
          problems.push(`I9: the emitted nodeIds ${JSON.stringify(payload.nodeIds)} ≠ the UI path's ${JSON.stringify(uiBroadcast.nodeIds)} (§3.4)`)
        }
        if (JSON.stringify(sorted(payload.edgeIds)) !== JSON.stringify(sorted(uiBroadcast.edgeIds))) {
          problems.push(`I9: the emitted edgeIds ${JSON.stringify(payload.edgeIds)} ≠ the UI path's ${JSON.stringify(uiBroadcast.edgeIds)} (§3.4)`)
        }
        // Non-vacuity floor: the derivation actually NAMED the batch (an empty-vs-empty comparison would pass anything).
        if (sorted(uiBroadcast.nodeIds).length === 0 || sorted(uiBroadcast.edgeIds).length === 0) {
          problems.push(`I9 control: the UI path's derivation is empty (${JSON.stringify(uiBroadcast)}) — the comparison would be vacuous`)
        }
      }
    } finally {
      await harness.close()
    }
    expect(problems, 'I9 — the same batch through the MCP tool and through the UI handler gives the same records and the same derivation (§2, §3.4)').toEqual([])
  })
})
