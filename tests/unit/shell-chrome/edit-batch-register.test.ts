// tests/unit/shell-chrome/edit-batch-register.test.ts — unit `edit-batch`'s SEAMS + CENSUS row, authored BEFORE any byte of the
// landing (RCA-1: the red set runs first and is REPORTED before implementation).
//
// WHAT THE UNIT OWES, IN ONE SENTENCE: register the MCP tool `edit.batch` against the batch transaction primitive that ALREADY
// EXISTS (`RagStore.applyBatch`), through the SAME shared handler the UI path calls (`handleEditBatch`), emitting the SAME
// derivation (`deriveBatchBroadcast`) ONCE on success. Today the tool is NOT registered at all, so the SDK answers
// `MCP error -32602: Tool edit.batch not found` — the SDK's "not found", never a handler failure.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-edit-batch.md`
//   §1(a) THE PRIMITIVE IS COMPLETE — `applyBatch(ops: BatchOp[]): Promise<BatchResult>` on the store (rag-store.ts:279), the
//        closed 7-member `BatchOp` union (:184-193), all-or-nothing with snapshot/restore rollback (:1375-1454), ONE `batch`
//        journal entry + ONE persist on success (:1451/:1452), NEVER throws for a domain failure (:215-217), and the pinned
//        domain messages this file uses: an invalid op answers `rag applyBatch: invalid op at index 0`, an empty batch answers
//        `{ ok: true, results: [] }`. The shared handler is `handleEditBatch(store, payload)` (edit-ops.ts:440-448) whose
//        non-array guard answers `{ ok: false, error: 'edit-batch: ops must be an array', failedIndex: 0 }`.
//   §1(b) THE TOOL WAS NEVER BUILT — `edit.batch` appears NOWHERE in `src/main/mcp-server.ts` at this head: not in `ALL_TOOLS`
//        (:1809-1891, 59 entries), not in `TOOL_GROUPS` (security.ts:5-100) — so `groupForTool('edit.batch')` answers `null` —
//        and not in `handleEditTool`'s switch (:1404-1512), which therefore throws `unknown edit tool: edit.batch`.
//   §2    NO NEW TOOL GROUP. `edit` exists (security.ts:3; `VALID_GROUPS` :196) and already carries eight `edit.*` rows. What is
//        owed is ONE membership row `'edit.batch': 'edit'`. `VALID_GROUPS` and the `ToolGroup` union stay untouched — U2 pins
//        both halves (the nine literals still resolve; a tenth literal is still REJECTED by the gate's own patch validator).
//   §3.1  `src/main/security.ts` — exactly one row in `TOOL_GROUPS`, `'edit.batch': 'edit'`; no group literal, no `VALID_GROUPS`
//        entry.
//   §3.2  `src/main/mcp-server.ts` — `ALL_TOOLS` gains `'edit.batch'` in the `edit` block (:1851-1859); the census moves
//        59 → 60.
//   §3.4  `handleEditTool` gains `case 'edit.batch'`: the ops value is passed RAW (the Finding-5 discipline every sibling case
//        follows) to `handleEditBatch`, NEVER an inline `applyBatch` call, so the malformed-payload fail-state is byte-identical
//        on both paths; a failed/malformed batch emits ZERO times; `resolveStoreArg` (rag-store-directory.ts:110-145) resolves
//        the `store` selector FIRST, before every tool-specific validation throw and before ANY store call, so its M1/M2
//        messages reach the caller BEFORE a write.
//   §3.5  `src/main/edit-ops.ts` — NO CHANGE. Said out loud so a reviewer does not go looking: U6 is that fence.
//   §4    Acceptance: the gate refuses by ABSENCE (default-off), never a handler throw; reachability is PROVED (the census,
//        `groupForTool`, `toolAllowed`, the server's own `allowedToolNames()`), not assumed.
//   §5    A4 (malformed ops) and A5 (the store selector: unknown store fails loud BEFORE any write; a batch addressed at store X
//        writes ONLY X).
//   §6    EVERY row here that measures "the tool is absent" is RED by MEASUREMENT at this head — that is the recorded red set,
//        not a construction.
//   §9    LAYERS.
//
// LINE PINS (read the NAMES, not the offsets): every `src/**` coordinate in this header was taken at the PRE-LANDING head
// `cd4cc31` (`ALL_TOOLS` `:1809-1891` at 59 entries, `VALID_GROUPS` `:196`, the `edit` block `:1851-1859`,
// `registeredToolNames` `:1893-1906`). The landing inserts before several of them, so at the LANDED head the same sites read
// `ALL_TOOLS` `:1848-1936` (60 entries), `VALID_GROUPS` `:203`, the `edit` block `:1890-1904`, `registeredToolNames`
// `:1940-1952`. Every row below asserts against the LIVE exports and the server's own derivation — never against an offset.
//
// THE HOSTING PATH IS THE SERVER'S OWN: U3 reads `ProvidentMcpServer.allowedToolNames()` (the server's OWN derivation —
// `registeredToolNames(gate, ALL_TOOLS)`, mcp-server.ts:1893-1906) rather than re-implementing the filter, so a missing
// `TOOL_GROUPS` row reds THIS row and not a private copy of the logic. The SDK `client.callTool` path is
// `tests/integration/shell-chrome/edit-batch.test.ts`'s job (§3.6/§4: "never a direct `handleEditTool` call" there); the direct
// handler call lives HERE and ONLY for the fail-states, which is exactly what §3.6 licenses.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): MCP-SURFACE / NODE. This file imports `src/main/*` and drives them in-process — no
// Electron, no renderer, no DOM, no spawn, no network. What it CAN assert: the tool's presence in the census, its group
// membership, the gate's default-off verdict, the server's own allowed-name derivation, the handler's domain results, and which
// store a `store:`-addressed batch lands in. What it can NEVER assert, named so nobody quotes it: that the tool is REACHABLE over
// a real transport, that the row's `inputSchema` registers without an SDK throw, that a batch emits exactly one
// `rag-store-changed` (§3.4 emits through `backend.broadcast`), or that the write is observable through the store from a client —
// every one of those lives in `tests/integration/shell-chrome/edit-batch.test.ts` over the SDK's `InMemoryTransport`, and the
// assembled Electron app is out of both files' scope (§9's second bullet).
//
// REACHABILITY RULE (this file always COLLECTS and RUNS): every module imported here exists at this head, so an import cannot
// fail. The MISSING subject is the TOOL — `edit.batch` is absent from `ALL_TOOLS`, absent from `TOOL_GROUPS`, and
// `handleEditTool('edit.batch', …)` THROWS `unknown edit tool: edit.batch`. So every handler arm goes through ONE `try/catch`
// wrapper (`driveHandler`) and every seam arm accumulates NAMED problems into its row's ONE aggregate
// `expect(problems, '…').toEqual([])` — never an escaping throw, never a skip, never a raw `TypeError`, never a fabricated pass.
//
// THE GREEN-AT-HEAD CLASS, named so nobody mistakes a fence for evidence: U4 (b), U5 (a), U5 (b) and U6 PASS at this head, and
// that is CORRECT rather than vacuous. Their bytes are TOOL-NAME-GENERIC in the shipped code — `handleEditTool`'s
// `if (!store) throw` (mcp-server.ts:1389) and `resolveStoreArg` (rag-store-directory.ts:110-145) both run BEFORE the `switch`,
// so an UNREGISTERED name already answers them; and §3.5's fence reads a file this unit must not touch. They are FENCES: U4 (b)
// and U5 (a)/(b) red the moment the landing's `case 'edit.batch'` bypasses the shared resolver or moves it after a write, and U6
// reds the moment the shared module grows a second dispatch. None of them says the TOOL exists — U1/U2/U3/U4 (a)/U5 (c) are the
// rows that do, and they are RED by measurement (§6).
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: no `vi.mock` (only `vi.fn()` callbacks), no network, no electron, no spawn, no `git`;
// it mutates nothing outside its own `mkdtempSync` scratch dirs, which `afterAll` removes.
import { describe, it, expect, vi, afterAll } from 'vitest'
import { mkdtempSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  createJsonRagStore,
  type BatchOp,
  type BatchResult,
  type RagEdge,
  type RagNode,
  type RagStore,
} from '../../../src/main/rag-store.js'
import { handleEditTool, ProvidentMcpServer, type McpBackend } from '../../../src/main/mcp-server.js'
import {
  SecurityGate,
  defaultSecurityConfig,
  groupForTool,
  toolAllowed,
  type ToolGroup,
} from '../../../src/main/security.js'
import type { RetrievalEngine } from '../../../src/main/retrieval.js'
import type { RagStoreDirectory, RagStoreEntry } from '../../../src/main/rag-store-directory.js'

// ---------------------------------------------------------------------------
// house-style helpers (independent fixtures)
// ---------------------------------------------------------------------------

/** The repo root, derived from THIS file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

const tempDirs: string[] = []

function freshDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'provident-edit-batch-unit-'))
  tempDirs.push(dir)
  return dir
}

afterAll(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

/** Fixed timestamps: every fixture is deterministic, so a byte comparison is a comparison of the RECORD and never of the clock. */
const NOW = '2026-09-24T00:00:00.000Z'

/** A valid `RagNode`: `id` + `type` (one of the `RAG_NODE_TYPES`) + `content` + `ownedNodeIds` (required by the store's
 *  `validateNodeShape`, rag-store.ts:425-472) + the two ISO timestamps. */
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

/** A valid `RagEdge`: `id` + `kind` (one of the six `RAG_EDGE_KINDS`) + `source`/`target` (both endpoints must EXIST before the
 *  edge is written) + the two ISO timestamps. */
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

/** The minimal store directory (the `store` selector resolution surface). The `engine` is never READ by `handleEditTool` — the
 *  index reconcile lives in `registerTools`'s callback wrapper (mcp-server.ts:2432-2459), which this file does not drive — so
 *  the entry carries the same inert placeholder the U-D7 blind artifact uses
 *  (`tests/blind-unit-ud7-set-doc-meta-op-greens.test.ts:137-139`). */
function entryFor(name: string, store: RagStore): RagStoreEntry {
  return { name, store, engine: null as unknown as RetrievalEngine, corrupt: false, missing: false }
}

const ALPHA = 'alpha-catalogue'
const BETA = 'beta-catalogue'

function makeDirectory(root: string, specs: Array<{ name: string; default?: boolean }>): RagStoreDirectory {
  const entries = new Map<string, RagStoreEntry>()
  let defaultName = ''
  for (const spec of specs) {
    const store = createJsonRagStore({ path: join(root, `persist-${spec.name}.json`) })
    entries.set(spec.name, entryFor(spec.name, store))
    if (spec.default) defaultName = spec.name
  }
  return { entries, defaultName }
}

/** The `edit.batch` handler's two possible outcomes. `handleEditTool` is documented to THROW for the fail-states it owns (the
 *  M1/M2 store-selector throws, the no-store throw) and to ANSWER a domain result otherwise — so the row MUST distinguish them,
 *  and at this head the answer is a third thing (`unknown edit tool: edit.batch`), which the wrapper reports as a throw. */
type HandlerOutcome = { status: 'answer'; value: unknown } | { status: 'throw'; message: string }

async function driveHandler(
  store: RagStore | null,
  args: Record<string, unknown>,
  onStoreChanged: (payload: unknown, storeName: string) => void,
  dir: RagStoreDirectory | null,
): Promise<HandlerOutcome> {
  try {
    const value = await handleEditTool(store, 'edit.batch', args, onStoreChanged, dir)
    return { status: 'answer', value }
  } catch (err) {
    return { status: 'throw', message: (err as Error)?.message ?? String(err) }
  }
}

function asBatchResult(outcome: HandlerOutcome): BatchResult | null {
  if (outcome.status !== 'answer') return null
  const value = outcome.value
  if (value === null || typeof value !== 'object' || !('ok' in value)) return null
  return value as BatchResult
}

// ===========================================================================
// U1 — the CENSUS: ALL_TOOLS carries 'edit.batch' at 60 entries (§3.2, §4)
// ===========================================================================
describe('U1 — ALL_TOOLS census', () => {
  it("U1 — ProvidentMcpServer.ALL_TOOLS contains 'edit.batch' and has length 60 (§3.2, census 59 → 60)", () => {
    const problems: string[] = []
    const tools = ProvidentMcpServer.ALL_TOOLS
    // §1(b): at this head `edit.batch` appears NOWHERE in mcp-server.ts and the census is 59 — hence the SDK's `-32602`.
    if (!Array.isArray(tools)) {
      problems.push(`U1: ProvidentMcpServer.ALL_TOOLS is not an array (${typeof tools}) — the census cannot be read at all`)
    } else {
      if (!tools.includes('edit.batch')) {
        problems.push(
          `U1: ALL_TOOLS has NO 'edit.batch' (census ${tools.length}) — the tool is not registered, so a client's tools/call answers MCP error -32602 not-found (§1(b), §4)`,
        )
      }
      // §3.2: the census moves exactly 59 → 60. A landing that adds the name twice, or adds another tool alongside, reds here.
      if (tools.length !== 60) {
        problems.push(`U1: ALL_TOOLS census is ${tools.length}, pinned at 60 (§3.2: "the census moves 59 → 60")`)
      }
      // The name is not a duplicate: exactly ONE entry.
      const occurrences = tools.filter((t) => t === 'edit.batch').length
      if (occurrences > 1) problems.push(`U1: ALL_TOOLS carries 'edit.batch' ${occurrences} times — the census pin is one row`)
      // Positive control: the census is READABLE and its `edit` block is where the row belongs (§3.2).
      if (!tools.includes('edit.set_doc_meta')) {
        problems.push(`U1 control: ALL_TOOLS is missing 'edit.set_doc_meta' — the edit block itself was not read`)
      }
    }
    expect(problems, 'U1 — the ALL_TOOLS census must carry edit.batch at 60 entries (§3.2)').toEqual([])
  })
})

// ===========================================================================
// U2 — the GROUP: `'edit.batch': 'edit'` is a MEMBERSHIP row, not a new group
//      (§2, §3.1, §4)
// ===========================================================================
describe('U2 — groupForTool + toolAllowed + the gate stays at nine groups', () => {
  it("U2 — groupForTool('edit.batch') === 'edit'; toolAllowed refuses without 'edit'; VALID_GROUPS/ToolGroup gained NOTHING (§2, §3.1, §4)", () => {
    const problems: string[] = []

    // §2/§3.1 — the ONE owed row: `'edit.batch': 'edit'` in TOOL_GROUPS. Without it `groupForTool` answers `null`, so the name is
    // filtered out of `allowedToolNames()` and the tool registers NOWHERE, even with `edit` enabled (B-1's unreachable-tool
    // defect in a new place).
    const group = groupForTool('edit.batch')
    if (group !== 'edit') {
      problems.push(
        `U2: groupForTool('edit.batch') === ${JSON.stringify(group)}, pinned at 'edit' — the TOOL_GROUPS membership row 'edit.batch': 'edit' is missing (§2, §3.1)`,
      )
    }

    // §4 — the gate's verdicts come from the group, so a landing that widens gating instead of adding the row reds here.
    if (toolAllowed('edit.batch', ['read', 'dispatch']) !== false) {
      problems.push(`U2: toolAllowed('edit.batch', ['read','dispatch']) is not false — the tool must stay DEFAULT-OFF (§4)`)
    }
    if (toolAllowed('edit.batch', ['edit']) !== true) {
      problems.push(`U2: toolAllowed('edit.batch', ['edit']) is not true — the edit group must allow it (§4)`)
    }
    // Default-off control: the OTHER edit.* rows answer exactly the same way, so these two verdicts are the group's, not a
    // special case bolted onto one name.
    if (toolAllowed('edit.set_content', ['read', 'dispatch']) !== false) {
      problems.push(`U2 control: toolAllowed('edit.set_content', ['read','dispatch']) is not false — the group baseline moved`)
    }
    if (toolAllowed('edit.set_content', ['edit']) !== true) {
      problems.push(`U2 control: toolAllowed('edit.set_content', ['edit']) is not true — the edit group itself is not readable`)
    }

    // §2 — NO new tool GROUP. The nine literals still resolve, one representative tool each.
    const NINE: Array<{ tool: string; group: ToolGroup }> = [
      { tool: 'provident.get_rendered_html', group: 'read' },
      { tool: 'provident.dispatch', group: 'dispatch' },
      { tool: 'provident.load', group: 'graph' },
      { tool: 'provident.code.set', group: 'code' },
      { tool: 'module.install', group: 'module' },
      { tool: 'rag.query', group: 'rag' },
      { tool: 'edit.set_content', group: 'edit' },
      { tool: 'gnosis.query', group: 'gnosis' },
      { tool: 'gnosis.document.create', group: 'gnosis-edit' },
    ]
    if (NINE.length !== 9) problems.push(`U2: the group census is ${NINE.length}, pinned at 9 (§2)`)
    for (const { tool, group: expected } of NINE) {
      const actual = groupForTool(tool)
      if (actual !== expected) problems.push(`U2: groupForTool('${tool}') === ${JSON.stringify(actual)}, pinned at '${expected}' (§2: no group literal changes)`)
    }

    // §2/§4 — a name that is NOT a registered tool of the group still resolves to `null`: the row is an EXACT membership, not a
    // prefix rule (`module:` is the only prefix rule the module carries).
    if (groupForTool('edit.batch.nope') !== null) {
      problems.push(`U2: groupForTool('edit.batch.nope') is not null — the membership row must not act as a prefix`)
    }

    // §2 — `VALID_GROUPS` gained NO member. `applyPatch` (security.ts:198-240) REJECTS a groups array carrying a literal it does
    // not know, leaving the config untouched; so a tenth literal would be ACCEPTED here and the default set would grow.
    const gate = new SecurityGate()
    const patched = gate.apply({ groups: ['edit-batch' as ToolGroup] })
    if (JSON.stringify(patched.config.enabled) !== JSON.stringify(['read', 'dispatch'])) {
      problems.push(
        `U2: a bogus group literal was ACCEPTED by the gate (enabled ${JSON.stringify(patched.config.enabled)}) — VALID_GROUPS must stay at the nine literals (§2)`,
      )
    }
    if (JSON.stringify(defaultSecurityConfig().enabled) !== JSON.stringify(['read', 'dispatch'])) {
      problems.push(`U2: defaultSecurityConfig().enabled is ${JSON.stringify(defaultSecurityConfig().enabled)}, pinned at ['read','dispatch'] (§4)`)
    }

    expect(problems, "U2 — 'edit.batch': 'edit' is a MEMBERSHIP row; the nine groups are unchanged (§2, §3.1)").toEqual([])
  })
})

// ===========================================================================
// U3 — the server's OWN derivation: allowedToolNames() (§2, §4)
// ===========================================================================
describe('U3 — allowedToolNames() is the server’s own gate derivation', () => {
  it("U3 — 'edit.batch' is ABSENT under the default gate and PRESENT with applyGatePatch({ groups: ['edit'] }) (§2, §4)", () => {
    const problems: string[] = []
    const backend: McpBackend = { invoke: async () => ({}) }
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })

    // Default gate (`['read','dispatch']`): the name must NOT be registered — the gate refuses by ABSENCE (§4).
    const off = server.allowedToolNames()
    if (!Array.isArray(off)) {
      problems.push('U3: allowedToolNames() did not answer an array — the derivation is unreadable')
    } else {
      if (off.includes('edit.batch')) {
        problems.push(`U3: allowedToolNames() under the DEFAULT gate still lists 'edit.batch' — the tool must be default-off (§4)`)
      }
      // Positive control: the derivation is LIVE (it lists the default-on groups' tools), so the absence above is meaningful.
      if (!off.includes('provident.dispatch')) {
        problems.push(`U3 control: allowedToolNames() lacks 'provident.dispatch' — the default gate itself was not read`)
      }
      if (off.includes('edit.set_content')) {
        problems.push(`U3 control: allowedToolNames() lists 'edit.set_content' under the DEFAULT gate — the gate is not default-off`)
      }
    }

    // Widen with the SAME call main uses (`applyGatePatch({ groups })`, mcp-server.ts:1966-2014): the name must appear.
    let widened: string[] = []
    try {
      server.applyGatePatch({ groups: ['edit'] })
      widened = server.allowedToolNames()
    } catch (err) {
      problems.push(`U3: applyGatePatch({ groups: ['edit'] }) threw (${(err as Error)?.message ?? String(err)})`)
    }
    if (Array.isArray(widened)) {
      if (!widened.includes('edit.batch')) {
        problems.push(
          `U3: allowedToolNames() with the edit group enabled is ABSENT of 'edit.batch' — the server's own derivation filters it out because the TOOL_GROUPS membership row is missing (§2: "the tool registers nowhere even with edit enabled")`,
        )
      }
      for (const control of ['edit.set_content', 'edit.set_doc_meta']) {
        if (!widened.includes(control)) {
          problems.push(`U3 control: allowedToolNames() with edit enabled lacks '${control}' — the widen itself did not take effect`)
        }
      }
    }
    expect(problems, 'U3 — allowedToolNames() carries edit.batch exactly when the edit group is enabled (§2, §4)').toEqual([])
  })
})

// ===========================================================================
// U4 — the handler's MALFORMED-PAYLOAD fail-states, driven DIRECTLY (§3.4, §5 A4)
//
// §3.6/§4 license exactly this: a direct `handleEditTool` call belongs in the UNIT row and ONLY for the fail-states. The
// malformed-payload answers are the SHARED handler's (`handleEditBatch`, edit-ops.ts:440-448) and `applyBatch`'s
// (rag-store.ts:1379-1383/:1451), so the row pins that the MCP case passes the ops RAW and returns the primitive's answer
// VERBATIM — never an SDK-shaped schema error, never a fabricated `{ ok: true }`.
// ===========================================================================
describe('U4 — malformed ops answer the shared handler’s domain result', () => {
  it("U4 (a) — {} and { ops: 'nope' } answer 'edit-batch: ops must be an array'; [{ op: 'bogus' }] answers 'rag applyBatch: invalid op at index 0'; ZERO emissions (§3.4, §5 A4)", async () => {
    const problems: string[] = []
    const dir = freshDir()
    const store = createJsonRagStore({ path: join(dir, 'rag.json') })
    await store.putNode(makeNode('u4-seed'))
    const journalBefore = store.journal().length

    const cases: Array<{ label: string; args: Record<string, unknown>; error: string }> = [
      { label: '{} (absent ops)', args: {}, error: 'edit-batch: ops must be an array' },
      { label: "{ ops: 'nope' }", args: { ops: 'nope' }, error: 'edit-batch: ops must be an array' },
      { label: "[{ op: 'bogus' }]", args: { ops: [{ op: 'bogus' }] }, error: 'rag applyBatch: invalid op at index 0' },
    ]

    for (const testCase of cases) {
      const cb = vi.fn()
      const outcome = await driveHandler(store, testCase.args, cb, null)
      if (outcome.status === 'throw') {
        // At this head: `unknown edit tool: edit.batch` — the tool is not in handleEditTool's switch (§1(b), §6).
        problems.push(
          `U4 (a) ${testCase.label}: handleEditTool THREW ${JSON.stringify(outcome.message)} instead of answering the domain result { ok: false, error: '${testCase.error}' } (§3.4)`,
        )
        continue
      }
      const result = asBatchResult(outcome)
      if (!result) {
        problems.push(`U4 (a) ${testCase.label}: the handler answered ${JSON.stringify(outcome.value)}, which is not a BatchResult`)
        continue
      }
      if (result.ok !== false) {
        problems.push(`U4 (a) ${testCase.label}: answered ok === ${String(result.ok)} — a malformed batch must be a DOMAIN FAILURE (§5 A4)`)
      } else {
        if (result.error !== testCase.error) {
          problems.push(`U4 (a) ${testCase.label}: error ${JSON.stringify(result.error)}, pinned at ${JSON.stringify(testCase.error)} — the primitive's message must reach the agent VERBATIM (§3.4)`)
        }
        if (result.failedIndex !== 0) {
          problems.push(`U4 (a) ${testCase.label}: failedIndex ${String(result.failedIndex)}, pinned at 0 (§3.4)`)
        }
      }
      if (cb.mock.calls.length !== 0) {
        problems.push(`U4 (a) ${testCase.label}: the callback ran ${cb.mock.calls.length} time(s) — a failed/malformed batch emits ZERO times (§3.4)`)
      }
    }

    // §5 A4 — "no throw, no emission" also means NO WRITE: the malformed arms never reach the store.
    if (store.journal().length !== journalBefore) {
      problems.push(`U4 (a): the journal grew ${journalBefore} → ${store.journal().length} on a malformed batch — nothing may apply (§5 A4)`)
    }
    if (store.getNode('u4-seed') === undefined) {
      problems.push('U4 (a): the seeded node disappeared — the malformed arms are not read-only on the store')
    }

    expect(problems, 'U4 (a) — malformed ops answer the shared handler’s byte-pinned domain results (§3.4, §5 A4)').toEqual([])
  })

  it("U4 (b) — a null store throws 'edit.batch: no rag store configured' before any parse (§3.4)", async () => {
    const problems: string[] = []
    const cb = vi.fn()
    const outcome = await driveHandler(null, { ops: [] }, cb, null)
    if (outcome.status !== 'throw') {
      problems.push(`U4 (b): a null store ANSWERED ${JSON.stringify(outcome.value)} — the pinned fail-state is a throw (§3.4)`)
    } else if (outcome.message !== 'edit.batch: no rag store configured') {
      problems.push(
        `U4 (b): threw ${JSON.stringify(outcome.message)}, pinned at 'edit.batch: no rag store configured' — the message is the tool NAME interpolated (§3.4)`,
      )
    }
    if (cb.mock.calls.length !== 0) problems.push(`U4 (b): the callback ran ${cb.mock.calls.length} time(s) with no store — zero emissions (§3.4)`)
    expect(problems, "U4 (b) — the null-store fail-state is 'edit.batch: no rag store configured' (§3.4)").toEqual([])
  })
})

// ===========================================================================
// U5 — the STORE SELECTOR, driven through the handler with a real directory (§5 A5)
//
// `resolveStoreArg` (rag-store-directory.ts:110-145) resolves the `store` argument FIRST — before every tool-specific validation
// throw and before ANY store method call — so its M1/M2 messages are the bytes the caller sees, and a resolution failure cannot
// have written anything.
// ===========================================================================
describe('U5 — the store selector resolves before any write', () => {
  it("U5 (a) — store: 'nowhere' throws \"edit.batch: unknown store 'nowhere'\" BEFORE any write (§5 A5)", async () => {
    const problems: string[] = []
    const dir = freshDir()
    const directory = makeDirectory(dir, [{ name: ALPHA, default: true }, { name: BETA }])
    const alpha = directory.entries.get(ALPHA)!.store
    const beta = directory.entries.get(BETA)!.store
    await alpha.putNode(makeNode('u5a-seed'))
    const alphaNodesBefore = alpha.listNodes().length
    const alphaJournalBefore = alpha.journal().length

    const cb = vi.fn()
    const outcome = await driveHandler(alpha, { ops: [{ op: 'putNode', node: makeNode('u5a-write') }], store: 'nowhere' }, cb, directory)
    if (outcome.status !== 'throw') {
      problems.push(
        `U5 (a): store: 'nowhere' ANSWERED ${JSON.stringify(outcome.value)} — the M2 unknown-store arm is a THROW (§5 A5, rag-store-directory.ts:126-129)`,
      )
    } else if (outcome.message !== "edit.batch: unknown store 'nowhere'") {
      problems.push(
        `U5 (a): threw ${JSON.stringify(outcome.message)}, pinned at ${JSON.stringify("edit.batch: unknown store 'nowhere'")} — the tool NAME prefixes the resolver's M2 message (§5 A5)`,
      )
    }
    if (alpha.listNodes().length !== alphaNodesBefore) {
      problems.push(`U5 (a): the default store's node count moved ${alphaNodesBefore} → ${alpha.listNodes().length} — an unknown store fails loud BEFORE any write (§5 A5)`)
    }
    if (alpha.journal().length !== alphaJournalBefore) {
      problems.push(`U5 (a): the default store's journal grew on an unknown store — nothing may be written (§5 A5)`)
    }
    if (alpha.getNode('u5a-write') !== undefined) problems.push('U5 (a): the batch LANDED on the default store despite the unknown store name (§5 A5)')
    if (beta.getNode('u5a-write') !== undefined) problems.push(`U5 (a): the batch landed on ${BETA} — an unknown name must resolve nowhere (§5 A5)`)
    if (cb.mock.calls.length !== 0) problems.push(`U5 (a): the callback ran ${cb.mock.calls.length} time(s) — zero emissions on a resolution failure (§3.4)`)

    expect(problems, "U5 (a) — store: 'nowhere' fails loud BEFORE any write (§5 A5)").toEqual([])
  })

  it("U5 (b) — store: '' and store: 9 throw 'edit.batch: store must be a non-empty string' (§5 A5, the M1 arm)", async () => {
    const problems: string[] = []
    const dir = freshDir()
    const directory = makeDirectory(dir, [{ name: ALPHA, default: true }])
    const alpha = directory.entries.get(ALPHA)!.store
    await alpha.putNode(makeNode('u5b-seed'))
    const nodesBefore = alpha.listNodes().length
    const PINNED = 'edit.batch: store must be a non-empty string'

    const cases: Array<{ label: string; args: Record<string, unknown> }> = [
      { label: "store: ''", args: { ops: [], store: '' } },
      { label: 'store: 9', args: { ops: [], store: 9 } },
    ]
    for (const testCase of cases) {
      const cb = vi.fn()
      const outcome = await driveHandler(alpha, testCase.args, cb, directory)
      if (outcome.status !== 'throw') {
        problems.push(`U5 (b) ${testCase.label}: ANSWERED ${JSON.stringify(outcome.value)} — the M1 arm is a THROW (§5 A5)`)
        continue
      }
      if (outcome.message !== PINNED) {
        problems.push(`U5 (b) ${testCase.label}: threw ${JSON.stringify(outcome.message)}, pinned at ${JSON.stringify(PINNED)} (§5 A5)`)
      }
      if (cb.mock.calls.length !== 0) problems.push(`U5 (b) ${testCase.label}: the callback ran ${cb.mock.calls.length} time(s) — zero emissions (§3.4)`)
    }
    if (alpha.listNodes().length !== nodesBefore) {
      problems.push(`U5 (b): the store's node count moved ${nodesBefore} → ${alpha.listNodes().length} — M1 must be checked before any write (§5 A5)`)
    }
    expect(problems, "U5 (b) — the M1 arm is the byte-pinned 'store must be a non-empty string' (§5 A5)").toEqual([])
  })

  it('U5 (c) — a batch addressed at a non-default store writes ONLY that store (§5 A5)', async () => {
    const problems: string[] = []
    const dir = freshDir()
    const directory = makeDirectory(dir, [{ name: ALPHA, default: true }, { name: BETA }])
    const alpha = directory.entries.get(ALPHA)!.store
    const beta = directory.entries.get(BETA)!.store
    await alpha.putNode(makeNode('u5c-alpha-seed'))
    await beta.putNode(makeNode('u5c-beta-seed'))
    const alphaBefore = alpha.listNodes().length
    const alphaJournalBefore = alpha.journal().length

    const cb = vi.fn()
    const ops: BatchOp[] = [{ op: 'putNode', node: makeNode('u5c-beta-only') }]
    const outcome = await driveHandler(alpha, { ops, store: BETA }, cb, directory)
    if (outcome.status === 'throw') {
      problems.push(`U5 (c): a batch addressed at ${BETA} THREW ${JSON.stringify(outcome.message)} instead of applying (§5 A5)`)
    } else {
      const result = asBatchResult(outcome)
      if (!result) {
        problems.push(`U5 (c): the handler answered ${JSON.stringify(outcome.value)}, which is not a BatchResult`)
      } else if (result.ok !== true) {
        problems.push(`U5 (c): the addressed batch answered ok === false (${JSON.stringify((result as { error?: string }).error)}) (§3.4)`)
      } else {
        if (result.results.length !== 1) problems.push(`U5 (c): ${result.results.length} results for 1 op — one agreeing BatchOpResult per op (§4)`)
        const first = result.results[0]
        if (!first || first.op !== 'putNode') {
          problems.push(`U5 (c): results[0].op is ${JSON.stringify(first?.op)}, pinned at 'putNode'`)
        } else if (first.node.id !== 'u5c-beta-only') {
          problems.push(`U5 (c): results[0].node.id is ${JSON.stringify(first.node.id)}, pinned at 'u5c-beta-only' (§4)`)
        }
      }
      if (cb.mock.calls.length !== 1) {
        problems.push(`U5 (c): the callback ran ${cb.mock.calls.length} time(s) — exactly ONCE on a successful batch (§3.4)`)
      } else {
        const payload = cb.mock.calls[0][0] as { kind?: string; nodeIds?: string[]; edgeIds?: string[]; store?: string }
        if (payload?.kind !== 'structural') {
          problems.push(`U5 (c): the emitted kind is ${JSON.stringify(payload?.kind)}, pinned at 'structural' — a putNode CREATE is structural (deriveBatchBroadcast, edit-ops.ts:614-667)`)
        }
        if (!Array.isArray(payload?.nodeIds) || !payload.nodeIds.includes('u5c-beta-only')) {
          problems.push(`U5 (c): the emitted nodeIds ${JSON.stringify(payload?.nodeIds)} do not carry the created node (§3.4)`)
        }
        if (!Array.isArray(payload?.edgeIds) || payload.edgeIds.length !== 0) {
          problems.push(`U5 (c): the emitted edgeIds ${JSON.stringify(payload?.edgeIds)} are not empty — a putNode-only batch names no edge (§3.4)`)
        }
        // §3.4 emits `store: storeName`, and the callback receives the RESOLVED name (U-MS2 §5.3 step 5).
        if (payload?.store !== BETA) {
          problems.push(`U5 (c): the emitted store is ${JSON.stringify(payload?.store)}, pinned at '${BETA}' — the payload names the ADDRESSED store (§3.4)`)
        }
      }
    }

    if (beta.getNode('u5c-beta-only') === undefined) problems.push(`U5 (c): the batch did NOT land on ${BETA} (§5 A5)`)
    if (alpha.getNode('u5c-beta-only') !== undefined) problems.push(`U5 (c): the batch BLEED into the default store ${ALPHA} — no foreign-store write (§5 A5)`)
    if (alpha.listNodes().length !== alphaBefore) {
      problems.push(`U5 (c): the default store's node count moved ${alphaBefore} → ${alpha.listNodes().length} — a foreign-store bleed (§5 A5)`)
    }
    if (alpha.journal().length !== alphaJournalBefore) {
      problems.push(`U5 (c): the default store's journal grew — the addressed batch must not touch it (§5 A5)`)
    }
    expect(problems, `U5 (c) — a batch addressed at ${BETA} writes ONLY ${BETA} (§5 A5)`).toEqual([])
  })
})

// ===========================================================================
// U6 — the FENCE: src/main/edit-ops.ts owes ZERO byte for this unit (§3.5)
//
// §1(a)/§2: the primitive (`applyBatch`), the SHARED handler (`handleEditBatch`, edit-ops.ts:440-448) and the derivation
// (`deriveBatchBroadcast`, :614-667) already exist and are already the UI path's. So this unit is a WIRING act and must not
// re-implement the batch in `edit-ops.ts`. The clause is TEXT over the file's own source and strips NOTHING — a comment that
// names the seam it is refusing is allowed to name it, but a `case 'edit.batch'` DISPATCH inside the shared module would be the
// second authority this fence exists to catch.
// ===========================================================================
describe('U6 — edit-ops.ts owes no byte (§3.5)', () => {
  it("U6 — src/main/edit-ops.ts has NO 'edit.batch' case/dispatch while handleEditBatch + deriveBatchBroadcast stay EXPORTED (§3.5)", () => {
    const problems: string[] = []
    const FILE = 'src/main/edit-ops.ts'
    let source = ''
    try {
      source = readText(FILE)
    } catch (err) {
      problems.push(`U6: ${FILE} is unreadable (${(err as Error)?.message ?? String(err)}) — the fence cannot be read`)
    }

    if (source !== '') {
      // The dispatch arms that would re-implement the tool in the shared module. A `case` arm is the pin; the `name ===` form is
      // the same fault written the other way.
      for (const token of ["case 'edit.batch'", 'case "edit.batch"', "name === 'edit.batch'", 'name === "edit.batch"']) {
        if (source.includes(token)) {
          problems.push(`U6: ${FILE} carries ${JSON.stringify(token)} — §3.5 pins NO CHANGE here; the tool's dispatch belongs in handleEditTool (§3.4)`)
        }
      }
      // Positive control: the two seams the unit RELIES on are exported from THIS file, so the reading is of the right file and the
      // fence is not passing because the module is empty or renamed.
      for (const exported of ['export async function handleEditBatch', 'export function deriveBatchBroadcast']) {
        if (!source.includes(exported)) {
          problems.push(`U6 control: ${FILE} does not declare ${JSON.stringify(exported)} — the shared handler/derivation this unit drives moved`)
        }
      }
    }
    expect(problems, `U6 — ${FILE} owes no byte; the batch lives in the shared handler, not a second dispatch (§3.5)`).toEqual([])
  })
})
