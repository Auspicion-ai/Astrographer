// tests/blind-unit-ujr1-get-journal-greens.test.ts
//
// BLIND green-scenario set for Unit U-JR1 (`provident.get_journal`), authored by
// a writer who did NOT write the implementation. Scenarios + EXPECTED outcomes
// derived ONLY from docs/specs/unit-ujr1-get-journal.md (§3, §4, §5.7) — no
// scenario expectation was taken from src/.
//
// Harness mirrors the house test seam (dom-shim + demoEnvelope Runtime, SEAM-6
// renderer RPC + notify, source-pinned module-private seams), but every scenario
// here is an independent behavioral probe of the LIVE modules.
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import {
  groupForTool,
  defaultSecurityConfig,
  SecurityGate,
  toolAllowed,
} from '../src/main/security.js'
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'

beforeAll(() => installShim())

const counter = 'counter'

function r(maxJournalLength?: number): Runtime {
  return new Runtime({
    mount: mountEl() as never,
    envelope: demoEnvelope() as never,
    ...(maxJournalLength !== undefined ? { maxJournalLength } : {}),
  })
}

/** Apply `n` journaled state-slice ops to the demo counter node. */
function seedEdits(rt: Runtime, n: number): void {
  for (let i = 0; i < n; i++) {
    const op = rt.applyCommand({
      kind: 'state-slice',
      node: counter,
      mutation: [{ targetProp: 'content', mode: 'replace', value: 'seed-' + i }],
    })
    if (op.status !== 'applied') throw new Error('seed op not applied: ' + op.status)
  }
}

/** Drain macrotasks/microtasks so a deferred condense microtask can run. */
async function drain(rounds = 5): Promise<void> {
  for (let i = 0; i < rounds; i++) {
    await new Promise((res) => setTimeout(res, 0))
  }
}

/** The spec §5.2 cursorIndex formula: (basePresent?1:0) + undoStack.length. */
function cursorIndex(v: { undoDepth: number; basePresent: boolean }): number {
  return v.undoDepth + (v.basePresent ? 1 : 0)
}
function recentTailFrom(v: { totalEntries: number; undoDepth: number; basePresent: boolean }, limit: number): number {
  return Math.max(0, Math.min(v.totalEntries, cursorIndex(v) + 50) - limit)
}



// ===========================================================================
// §3 valid-path states
// ===========================================================================

describe('§3.1 — empty journal shape', () => {
  it('S1 fresh Runtime — entries [] + all-zero accessors + omissible keys omitted; never throws', () => {
    const rt = r()
    let v: ReturnType<typeof rt.journalEntries>
    expect(() => { v = rt.journalEntries() }).not.toThrow()
    v = rt.journalEntries() as any
    expect(v.entries).toEqual([])
    expect(v.fromIndex).toBe(0)
    expect(v.totalEntries).toBe(0)
    expect(v.truncated).toBe(false)
    expect(v.undoDepth).toBe(0)
    expect(v.redoDepth).toBe(0)
    expect(v.basePresent).toBe(false)
    expect(v.undoBaseBoundary).toBe(false)
    expect('undoTopKind' in (v as Record<string, unknown>)).toBe(false)
    expect('redoTopKind' in (v as Record<string, unknown>)).toBe(false)
    expect('maxJournalLength' in (v as Record<string, unknown>)).toBe(false)
  })
})

describe('§3.2 — after an applied edit (position accessors + default window)', () => {
  it('S2 one edit → undoDepth 1, undoTopKind present, default window shows [{index:0,...}], fromIndex 0, truncated false', () => {
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 1)
    const v: any = rt.journalEntries()
    expect(v.undoDepth).toBe(1)
    expect(v.redoDepth).toBe(0)
    expect(v.undoTopKind).toBe('state-slice')
    expect('redoTopKind' in v).toBe(false)
    expect(v.entries).toEqual([{ index: 0, kind: 'state-slice', status: 'applied' }])
    expect(v.fromIndex).toBe(0)
    expect(v.totalEntries).toBe(1)
    expect(v.truncated).toBe(false)
    // afterIndex: 0 also shows the applied op (not required for a small journal, but works)
    const a0: any = rt.journalEntries({ afterIndex: 0 })
    expect(a0.entries[0]).toEqual({ index: 0, kind: 'state-slice', status: 'applied' })
  })
})

describe('§3.3 — absolute afterIndex + limit clamps shape fromIndex/entries.length/totalEntries', () => {
  it('S3a afterIndex is an ABSOLUTE start clamped [0,total]', () => {
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 5)
    const a2: any = rt.journalEntries({ afterIndex: 2, limit: 2 })
    expect(a2.fromIndex).toBe(2)
    expect(a2.entries.map((e: typeof EMPTY) => e.index)).toEqual([2, 3])
    expect(a2.entries.length).toBe(2)
    expect(a2.totalEntries).toBe(5)
    // over-total afterIndex clamps to total (empty window)
    const over: any = rt.journalEntries({ afterIndex: 100, limit: 3 })
    expect(over.fromIndex).toBe(5)
    expect(over.entries).toEqual([])
    // negative afterIndex clamps to 0
    const neg: any = rt.journalEntries({ afterIndex: -5, limit: 3 })
    expect(neg.fromIndex).toBe(0)
  })
  it('S3b limit clamps to [1,1000]; entries.length never exceeds limit', () => {
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 5)
    const l1: any = rt.journalEntries({ afterIndex: 0, limit: 0 }) // clamped up to 1
    expect(l1.entries.length).toBeLessThanOrEqual(1)
    const huge: any = rt.journalEntries({ afterIndex: 0, limit: 999999 }) // clamped down to 1000
    expect(huge.totalEntries).toBe(5)
    expect(huge.entries.length).toBe(5) // bounded by totalEntries
    expect(huge.entries.length).toBeLessThanOrEqual(1000)
  })
})

describe('§3.4 — large-journal head-trim (truncated: true, total > entries.length)', () => {
  it('S4a default limit:500 on a >500-entry journal head-trims', () => {
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 501)
    const v: any = rt.journalEntries()
    expect(v.totalEntries).toBe(501)
    expect(v.entries.length).toBe(500)
    expect(v.totalEntries).toBeGreaterThan(v.entries.length)
    expect(v.fromIndex).toBeGreaterThan(0)
    expect(v.truncated).toBe(true)
  })
  it('S4b a SMALL limit on a SHORT journal head-trims exactly as loudly (canonical counterexample)', () => {
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 5)
    const v: any = rt.journalEntries({ limit: 3 })
    expect(v.totalEntries).toBe(5)
    expect(v.fromIndex).toBe(2)
    expect(v.entries.map((e: typeof EMPTY) => e.index)).toEqual([2, 3, 4])
    expect(v.truncated).toBe(true)
  })
})

describe('§3.5 — a condensed base present', () => {
  it('S5 condense fires → basePresent true + a {kind:"base"} entry in the visible window', async () => {
    const rt = r(3)
    rt.bootstrap()
    seedEdits(rt, 40) // pre-base journal cost > base snapshot ⇒ condense actually fires
    let v: any = rt.journalEntries()
    for (let i = 0; i < 6 && !v.basePresent; i++) {
      await drain()
      v = rt.journalEntries()
    }
    expect(v.basePresent).toBe(true)
    expect(v.entries.some((e: { kind: string }) => e.kind === 'base')).toBe(true)
    const base = v.entries.find((e: { kind: string }) => e.kind === 'base')
    expect(base).toEqual({ index: 0, kind: 'base', status: 'base' })
    // at the floor: the undo stack is empty at the condensed base
    expect(v.undoBaseBoundary).toBe(true)
    expect(v.undoDepth).toBe(0)
  })
})

describe('§3.6 — read-only: no app-graph-changed, no re-render, journal identical across calls', () => {
  it('S6a engine read-only — journal state identical before/after many journalEntries calls', () => {
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 3)
    const before: any = rt.journalEntries()
    for (let i = 0; i < 5; i++) rt.journalEntries({ afterIndex: 0, limit: 2 })
    const after: any = rt.journalEntries()
    expect(after.undoDepth).toBe(before.undoDepth)
    expect(after.redoDepth).toBe(before.redoDepth)
    expect(after.basePresent).toBe(before.basePresent)
    expect(after.entries).toEqual(before.entries)
  })

  it('S6b renderer RPC: a journalEntries RPC routes to runtime.journalEntries and emits ZERO app-graph-changed (dispatch positive control = ONE)', async () => {
    // derive the MUTATING_METHODS set from the LIVE renderer source (never hard-coded)
    const rendererSrc = readFileSync(join(process.cwd(), 'src/renderer/renderer.ts'), 'utf8')
    const mmMatch = /const MUTATING_METHODS = new Set\(\[([^\]]*)\]\)/.exec(rendererSrc)
    expect(mmMatch, 'renderer MUTATING_METHODS literal must exist').toBeTruthy()
    const mutating = new Set<string>(
      mmMatch![1].split(',').map((s) => s.trim().replace(/^'+|'+$/g, '')).filter(Boolean),
    )
    expect(mutating.has('dispatch'), 'dispatch must be mutating (positive control)').toBe(true)
    expect(mutating.has('journalEntries'), 'journalEntries must NOT be mutating').toBe(false)

    const rt = r()
    rt.bootstrap()
    const seeded = rt.applyCommand({ kind: 'state-slice', node: counter, mutation: [{ targetProp: 'content', mode: 'replace', value: 'A1' }] })
    expect(seeded.status).toBe('applied')

    const notifies: string[] = []
    const notify = (p: { uri: string }): void => { notifies.push(p.uri) }
    // the renderer dispatch+notify seam, mirrored over the REAL Runtime
    const handleRequest = async (method: string, payload?: unknown): Promise<{ ok: boolean; value?: unknown; error?: string }> => {
      let value: unknown
      try {
        switch (method) {
          case 'dispatch': value = await rt.dispatch(payload as never); break
          case 'journalEntries': value = rt.journalEntries(payload); break
          default: throw new Error('unknown method: ' + method)
        }
      } catch (e) { return { ok: false, error: e instanceof Error ? e.message : String(e) } }
      const reply = { ok: true, value }
      if (reply.ok && mutating.has(method)) notify({ uri: 'mcp://provident/app' })
      return reply
    }

    const d = await handleRequest('dispatch', { target: 'inc', event: 'click' })
    expect(d.ok).toBe(true)
    expect(notifies).toEqual(['mcp://provident/app'])

    const before = notifies.length
    const j = await handleRequest('journalEntries', { afterIndex: 0, limit: 10 })
    expect(j.ok, 'journalEntries RPC must route + reply ok').toBe(true)
    expect(notifies.length, 'journalEntries must emit NO app-graph-changed').toBe(before)
    expect((j.value as { entries: Array<{ index: number; kind: string; status: string }> }).entries[0]).toEqual({ index: 0, kind: 'state-slice', status: 'applied' })
  })
})

describe('§3.7 — group gate (tool unavailable when read disabled)', () => {
  it('S7a groupForTool + default gate allow "provident.get_journal" (read group, default-ON)', () => {
    expect(groupForTool('provident.get_journal')).toBe('read')
    expect(defaultSecurityConfig().enabled).toEqual(['read', 'dispatch'])
    expect(new SecurityGate().toolAllowed('provident.get_journal')).toBe(true)
    expect(toolAllowed('provident.get_journal', ['read', 'dispatch'])).toBe(true)
  })
  it('S7b when the read group is disabled the tool is unavailable (gate + MCP registration)', () => {
    expect(new SecurityGate().apply({ disable: ['read'] }).toolAllowed('provident.get_journal')).toBe(false)
    const backend: McpBackend = { invoke: async () => ({}) }
    const on = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    expect(on.allowedToolNames()).toContain('provident.get_journal')
    const off = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate().apply({ disable: ['read'] }) })
    expect(off.allowedToolNames()).not.toContain('provident.get_journal')
  })
})

// ===========================================================================
// §4 fail-states
// ===========================================================================

describe('§4 F1 — empty journal never throws', () => {
  it('F1 fresh and after-load empty journalEntries never throws', () => {
    const fresh = r()
    expect(() => fresh.journalEntries()).not.toThrow()
    const rt = r()
    rt.load({ kind: 'envelope', envelope: demoEnvelope() as never })
    expect(() => rt.journalEntries()).not.toThrow()
  })
})

describe('§4 F2 — malformed/negative/huge opts clamp-ignore-never-throw, no drain', () => {
  it('F2 various malformed opts never throw and clamp; journal state not drained', () => {
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 5)
    const beforeUndo = (rt.journalEntries() as any).undoDepth
    const cases: Array<any> = [
      { afterIndex: -5, limit: -3 },
      { afterIndex: 100000, limit: 999999 },
      { afterIndex: 0, limit: 0 },
      { limit: 'big' },
      { afterIndex: 1.5, limit: 2 },
      {},
    ]
    for (const c of cases) {
      expect(() => rt.journalEntries(c)).not.toThrow() // malformed/ignored, never throws
    }
    const after = rt.journalEntries()
    expect(after.undoDepth).toBe(beforeUndo) // no drain/mutate
    // afterIndex clamped [0,total]; limit clamped [1,1000]
    expect((rt.journalEntries({ afterIndex: -5 }) as any).fromIndex).toBe(0)
    expect((rt.journalEntries({ afterIndex: 100000 }) as any).fromIndex).toBe(after.totalEntries)
    expect((rt.journalEntries({ limit: 999999 }) as any).entries.length).toBe(after.totalEntries)
  })
})

describe('§4 F3 — base condense marker surfaced as {kind:"base"} + basePresent: true', () => {
  it('F3 the base marker surfaces as {kind:"base"}; consumer distinguishes via kind/basePresent', async () => {
    const rt = r(3)
    rt.bootstrap()
    seedEdits(rt, 40)
    let v: any = rt.journalEntries()
    for (let i = 0; i < 6 && !v.basePresent; i++) { await drain(); v = rt.journalEntries() }
    expect(v.basePresent).toBe(true)
    expect((v.entries.find((e: { kind: string }) => e.kind === 'base') as any).kind).toBe('base')
  })
})

describe('§4 F4 — synchronous snapshot at call time (no flush/interleave)', () => {
  it('F4 journalEntries returns a synchronous (non-thenable) snapshot that reflects the just-applied op', () => {
    const rt = r()
    rt.bootstrap()
    rt.applyCommand({ kind: 'state-slice', node: counter, mutation: [{ targetProp: 'content', mode: 'replace', value: 'sync' }] })
    const v: any = rt.journalEntries()
    expect(typeof v).toBe('object')
    expect(v).not.toHaveProperty('then') // synchronous, never a Promise / pending
    expect(typeof v.entries).toBe('object') // a resolved array, not a pending promise
    expect(v.entries[0]).toEqual({ index: 0, kind: 'state-slice', status: 'applied' })
    expect(v.undoDepth).toBe(1) // reflects the op applied immediately before the read
  })
})

describe('§4 F5 — JSON-safety (only {index,kind,status} per row; no Node refs/snapshot/id)', () => {
  it('F5 JSON round-trips; every row carries exactly index/kind/status; no internal fields serialized', () => {
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 2)
    rt.journalEntries({ afterIndex: 0, limit: 2 })
    const v = rt.journalEntries()
    const json = JSON.stringify(v)
    const parsed = JSON.parse(json)
    expect(parsed).toEqual(v) // round-trips losslessly (no refs/functions/bignum)
    for (const e of (v as any).entries) {
      expect(Object.keys(e).sort()).toEqual(['index', 'kind', 'status'])
    }
    for (const bad of ['snapshot', 'dirtied', 'node', 'nodeId', 'id', 'op']) {
      expect(json).not.toContain(`"${bad}"`)
    }
  })
})

describe('§4 F6 — extra/unknown tool args ignored; never throws', () => {
  it('F6 unknown keys do not change the window and never throw', () => {
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 4)
    const base: any = rt.journalEntries({ afterIndex: 0, limit: 3 })
    const noisy: any = rt.journalEntries({ afterIndex: 0, limit: 3, foo: 'bar', bogus: 123, token: 'x', tls: {}, extra: [1, 2] })
    expect(noisy.entries).toEqual(base.entries)
    expect(noisy.fromIndex).toBe(base.fromIndex)
    expect(noisy.totalEntries).toBe(base.totalEntries)
  })
})

// ===========================================================================
// §5.7 property register (the 5 invariant rows)
// ===========================================================================

describe('§5.7 P-IM-1 — deterministic pure projection', () => {
  it('PB1 two immediate journalEntries() calls are deep-equal (identical shape)', () => {
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 3)
    const a: any = rt.journalEntries()
    const b: any = rt.journalEntries()
    expect(b.entries).toEqual(a.entries)
    expect(b.fromIndex).toBe(a.fromIndex)
    expect(b.totalEntries).toBe(a.totalEntries)
    expect(b.truncated).toBe(a.truncated)
    expect(b.undoDepth).toBe(a.undoDepth)
    expect(b.redoDepth).toBe(a.redoDepth)
    expect(b.basePresent).toBe(a.basePresent)
    expect(b.undoBaseBoundary).toBe(a.undoBaseBoundary)
    expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort())
  })
})

describe('§5.7 P-IM-2 — window semantics', () => {
  it('PB2 with afterIndex: fromIndex === clamp(afterIndex,0,total), entries.length ≤ limit; omitted: recent-tail formula; head-trim ⟺ min(total,cursor+50) > limit', () => {
    // no-base seeded state
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 5)
    for (const limit of [1, 3, 6, 500, 1000]) {
      const v: any = rt.journalEntries({ limit })
      const exp = recentTailFrom(v, limit)
      expect(v.fromIndex).toBe(exp)
      expect(v.fromIndex > 0).toBe(Math.min(v.totalEntries, cursorIndex(v) + 50) > limit)
      expect(v.entries.length).toBeLessThanOrEqual(limit)
    }
    // absolute afterIndex start
    for (const ai of [0, 2, 5, 100, -1]) {
      const v: any = rt.journalEntries({ afterIndex: ai, limit: 2 })
      expect(v.fromIndex).toBe(Math.max(0, Math.min(5, ai)))
      expect(v.entries.length).toBeLessThanOrEqual(2)
    }
    // canonical 5-entry / limit:3 counterexample (short journal, SMALL limit → head-trims)
    expect((rt.journalEntries({ limit: 3 }) as any).fromIndex).toBe(2)
    expect((rt.journalEntries({ limit: 3 }) as any).truncated).toBe(true)
  })
  it('PB2b genuinely empty journal → entries === []', () => {
    const rt = r()
    expect((rt.journalEntries() as any).entries).toEqual([])
  })
})

describe('§5.7 P-IM-3 — read-only (no mutation; no MUTATING_METHODS/app-graph-changed)', () => {
  it('PB3 many calls leave undoDepth/redoDepth/basePresent + snapshot identical; renderer not mutating (source-pinned)', () => {
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 3)
    const s0: any = rt.journalEntries()
    for (let i = 0; i < 10; i++) rt.journalEntries()
    const s1: any = rt.journalEntries()
    expect(s1.undoDepth).toBe(s0.undoDepth)
    expect(s1.redoDepth).toBe(s0.redoDepth)
    expect(s1.basePresent).toBe(s0.basePresent)
    expect(s1.entries).toEqual(s0.entries)
    const rendererSrc = readFileSync(join(process.cwd(), 'src/renderer/renderer.ts'), 'utf8')
    const mm = /const MUTATING_METHODS = new Set\(\[([^\]]*)\]\)/.exec(rendererSrc)
    const mutating = new Set((mm ? mm[1].split(',') : []).map((s) => s.trim().replace(/^'+|'+$/g, '')).filter(Boolean))
    expect(mutating.has('journalEntries')).toBe(false)
  })
})

describe('§5.7 P-SM-1 — faithful position accessors', () => {
  it('PB4 undoTopKind/redoTopKind present ⟺ stack non-empty; basePresent ⟺ base entry; boundary only at floor', async () => {
    // empty → both omitted
    const empty: any = r().journalEntries()
    expect('undoTopKind' in empty).toBe(false)
    expect('redoTopKind' in empty).toBe(false)

    // one edit → undoTopKind present, redoTopKind omitted
    const rt = r()
    rt.bootstrap()
    seedEdits(rt, 1)
    const one: any = rt.journalEntries()
    expect(one.undoDepth).toBeGreaterThan(0)
    expect('undoTopKind' in one).toBe(true)
    expect('redoTopKind' in one).toBe(false)

    // undo → redo stack non-empty: redoTopKind present, undo stack empty
    await (rt as any).journal('undo')
    const undone: any = rt.journalEntries()
    expect(undone.undoDepth).toBe(0)
    expect('undoTopKind' in undone).toBe(false)
    expect(undone.redoDepth).toBeGreaterThan(0)
    expect('redoTopKind' in undone).toBe(true)

    // redo → redo stack empty again
    await (rt as any).journal('redo')
    const redone: any = rt.journalEntries()
    expect(redone.redoDepth).toBe(0)
    expect('redoTopKind' in redone).toBe(false)

    // condensed base → basePresent iff a base-kind entry exists in the journal
    const bc = r(3)
    bc.bootstrap()
    seedEdits(bc, 40)
    let bv: any = bc.journalEntries()
    for (let i = 0; i < 6 && !bv.basePresent; i++) { await drain(); bv = bc.journalEntries() }
    expect(bv.basePresent).toBe(true)
    expect(bv.entries.some((e: { kind: string }) => e.kind === 'base')).toBe(true)
    expect(bv.undoBaseBoundary).toBe(true) // floor (undo stack truncated at base)
  })
})

describe('§5.7 P-TP-1 — seam routing is total + non-mutating', () => {
  it('PB5 groupForTool === read; ALL_TOOLS carries the tool; renderer + mcp-server + types seams pinned', () => {
    expect(groupForTool('provident.get_journal')).toBe('read')
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('provident.get_journal')

    // renderer seam: case routes to runtime.journalEntries(req.payload); absent from MUTATING_METHODS
    const rendererSrc = readFileSync(join(process.cwd(), 'src/renderer/renderer.ts'), 'utf8')
    expect(rendererSrc).toContain("case 'journalEntries':")
    expect(rendererSrc).toMatch(/journalEntries/i)
    expect(rendererSrc).toMatch(/runtime\.journalEntries/)
    const mm = /const MUTATING_METHODS = new Set\(\[([^\]]*)\]\)/.exec(rendererSrc)
    const mutating = new Set((mm ? mm[1].split(',') : []).map((s) => s.trim().replace(/^'+|'+$/g, '')).filter(Boolean))
    expect(mutating.has('journalEntries')).toBe(false)

    // mcp-server seam: SDK registration calls backend.invoke('journalEntries', args); inputSchema {afterIndex,limit}
    const mcpSrc = readFileSync(join(process.cwd(), 'src/main/mcp-server.ts'), 'utf8')
    expect(mcpSrc).toMatch(/backend\.invoke\('journalEntries', args\)/)
    expect(mcpSrc).toMatch(/afterIndex: z\.number\(\)\.optional\(\)/)
    expect(mcpSrc).toMatch(/limit: z\.number\(\)\.optional\(\)/)

    // shared/types seam: RpcMethod gains 'journalEntries'
    const typesSrc = readFileSync(join(process.cwd(), 'src/shared/types.ts'), 'utf8')
    expect(typesSrc).toMatch(/'journalEntries'/)
    expect(typesSrc).toMatch(/RpcMethod/)
  })

  it('PB5b census — the tool resolves through the read group and registers under the default gate', () => {
    const backend: McpBackend = { invoke: async () => ({}) }
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    expect(server.allowedToolNames()).toContain('provident.get_journal')
    expect(ProvidentMcpServer.ALL_TOOLS.length).toBeGreaterThanOrEqual(59)
  })
})
