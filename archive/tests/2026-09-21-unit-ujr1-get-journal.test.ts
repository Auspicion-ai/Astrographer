// tests/unit-ujr1-get-journal.test.ts — Unit U-JR1: the read-only MCP tool
// `provident.get_journal` (engine-journal introspection) — a THIN renderer-routed
// read over the engine's `Supervisor.journalEntries(opts?): JournalView`
// (`provident-ssr@0.5.0`). Written from `docs/specs/unit-ujr1-get-journal.md`
// ALONE. (docs/specs/unit-ujr1-get-journal.md §3 valid-path states 1–7, §4
// fail-states F1–F6, §2.2 the six pinned seams, §5.7 the PBT register P-IM-1/
// P-IM-2/P-IM-3/P-SM-1/P-TP-1.)
//
// Conventions follow tests/unit-gn-mcp-ui-wiring.test.ts + tests/journal-
// reversibility.test.ts (vitest node environment, `.js` import suffix for the
// ESM source modules, the `installShim` dom-shim so the renderer Runtime can be
// constructed, and the deterministic mulberry32 property register — pinned seed,
// ≤PBT_ATTEMPTS/row, ≤400 total, stop-after-5).
//
// RED set (the six HOST SEAMS from §2.2 — none exist in src/ yet):
//   1. security.ts `TOOL_GROUPS` row `'provident.get_journal': 'read'`
//      (groupForTool resolves it → today null).
//   2. mcp-server.ts `ALL_TOOLS` row `'provident.get_journal'`.
//   3. mcp-server.ts SDK registration (backend.invoke('journalEntries', args) +
//      `inputSchema: { afterIndex: z.number().optional(), limit:
//      z.number().optional() }`).
//   4. shared/types.ts `RpcMethod` union gains `'journalEntries'`.
//   5. renderer.ts `case 'journalEntries'` → runtime.journalEntries(req.payload)
//      AND `'journalEntries'` ∉ MUTATING_METHODS.
//   6. runtime.ts synchronous `journalEntries(opts?)`.
// Plus §3.7/§2.3 the `read`-group gate (tool unavailable when `read` disabled).
//
// GREEN-ON-ARRIVAL (the engine-backed projections reading off a real
// `Supervisor`): the §3.1 empty shape, §3.2 position accessors + `afterIndex: 0`,
// §3.3 `/limit` clamps, §3.4 large-journal truncation, §3.5 condensed base,
// §3.6 no-mutation, §4 F1/F2/F3(engine)/F5/F6, and the PBT rows P-IM-1/P-IM-3
// (engine read-only)/P-SM-1.
//
// SPEC–ENGINE RECONCILIATION ADJUDICATED: a prior draft read the DEFAULT window
// (no `afterIndex`) as cursor-relative `[]`-on-empty-redo and asserted the first
// entry sits AHEAD of the cursor with a non-empty redo stack. That reading
// misread the `.d.ts` comment (a HOST spec error), and `docs/specs/unit-ujr1-
// get-journal.md` was corrected to the engine-faithful §2.1/§5.2 reading: the
// default window is a RECENT-TAIL BACKSPAN from `cursor + REDO_PEEK(50)` capped
// by `limit` (default 500, clamped [1,1000]) — `cursorIndex = (basePresent?1:0)
// + undoStack.length; toIndex = min(total, cursorIndex+50); fromIndex =
// max(0, toIndex − limit); end = min(total, fromIndex+limit)`. Consequence: the
// just-applied op IS visible in the default window (`entries !== []` after one
// edit on a previously-empty journal), and `fromIndex > 0` happens ONLY once the
// journal is large enough to head-trim (~500+ rows). The §3.2 "default window
// empty after an edit" test and the P-IM-2 clauses below assert that corrected
// (engine-faithful) contract, verified against supervisor.js:199–238.
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { translateLegacy, Supervisor, EventBridge, type Node } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { groupForTool, toolAllowed, SecurityGate, defaultSecurityConfig } from '../src/main/security.js'
import { ProvidentMcpServer } from '../src/main/mcp-server.js'
import { RuntimeBackend } from '../src/main/battery-host.js'

beforeAll(() => {
  installShim()
})

// ---------------------------------------------------------------------------
// Engine fixture — a real Supervisor carrying a journal, mirroring the
// journal-reversibility harness (a bare graph with one editable node).
// ---------------------------------------------------------------------------
const ENV = {
  template: {
    root: {
      type: 'div',
      children: [{ type: 'div', props: { id: 'a', tags: [] }, content: 'A0' }],
    },
  },
  content: [],
  clientConfig: { runInstantiation: true, runRendering: true },
}

interface SupHarness {
  sup: Supervisor
  a: Node
}

function mkSup(opts?: { max?: number }): SupHarness {
  const sup = new Supervisor({ events: new EventBridge(), maxJournalLength: opts?.max })
  const t = translateLegacy(ENV)
  for (const n of t.nodes) sup.registerNode(n)
  const cr = t.root.compile(t.nodes)
  sup.recordResolved(cr.actionable)
  const a = t.nodes.find((n) => (n as Node).props?.id === 'a') as Node
  return { sup, a }
}

function editNode(h: SupHarness, v: string): void {
  h.sup.apply({ kind: 'state-slice', node: h.a, mutation: [{ targetProp: 'content', mode: 'replace', value: v }] })
}

/** The engine-window constants (supervisor.js 17–27) — used by the divergence
 *  comments and the §3.3 clamp expectations. */
const DEFAULT_LIMIT = 500
const MAX_LIMIT = 1000
const REDO_PEEK = 50

type JournalView = ReturnType<Supervisor['journalEntries']>
type ViewOpts = NonNullable<Parameters<Supervisor['journalEntries']>[0]>

function clampAfter(a: unknown, total: number): number {
  return Math.min(total, Math.max(0, Math.floor(Number(a))))
}
function clampLimit(l: unknown): number {
  // engine supervisor.js:202–205 — an OMITTED limit defaults to 500, else clamp(1,1000)
  if (l === undefined) return DEFAULT_LIMIT
  return Math.min(Math.max(Math.floor(Number(l)), 1), MAX_LIMIT)
}

// ===========================================================================
// §3 valid-path states — the engine-backed projections (GREEN-on-arrival),
// EXCEPT the §5.2 "default window empty on empty redo" clause which is a
// SPEC–ENGINE divergence (RED-on-arrival, reported).
// ===========================================================================
describe('U-JR1 §3 valid-path states (engine `Supervisor.journalEntries`)', () => {
  it('§3.1 empty journal — full empty shape, both top-kind keys omitted, never throws', () => {
    const { sup } = mkSup()
    const v = sup.journalEntries()
    expect(Array.isArray(v.entries)).toBe(true)
    expect(v.entries).toEqual([])
    expect(v.fromIndex).toBe(0)
    expect(v.totalEntries).toBe(0)
    expect(v.truncated).toBe(false)
    expect(v.undoDepth).toBe(0)
    expect(v.redoDepth).toBe(0)
    expect(v.basePresent).toBe(false)
    expect(v.undoBaseBoundary).toBe(false)
    expect('undoTopKind' in v).toBe(false)
    expect('redoTopKind' in v).toBe(false)
  })

  it('§3.2 after an applied edit — POSITION ACCESSORS reflect it (undoDepth increments, undoTopKind appears, redoTopKind omitted)', () => {
    const h = mkSup()
    editNode(h, 'A1')
    const v = h.sup.journalEntries()
    expect(v.undoDepth).toBe(1)
    expect(v.undoTopKind).toBe('state-slice')
    expect('redoTopKind' in v).toBe(false) // empty redo stack → omitted
    expect(v.totalEntries).toBe(1)
  })

  // §5.2 (engine-faithful, reconciled) — the default window is a RECENT-TAIL
  // BACKSPAN from `cursor + REDO_PEEK(50)` capped by `limit` (500). So after
  // one applied edit on a previously-empty journal the applied op's row IS in
  // the default window (`entries` is NOT `[]`). Verified against
  // supervisor.js:199–238.
  it('§3.2 after an applied edit on a previously-empty journal, the DEFAULT window (no `afterIndex`) shows the applied op: `entries: [{index:0, kind, status}]`, fromIndex 0, truncated false', () => {
    const h = mkSup()
    editNode(h, 'A1')
    const v = h.sup.journalEntries() // no afterIndex → default recent-tail window
    expect(v.totalEntries).toBe(1)
    expect(v.undoDepth).toBe(1)
    expect(v.entries).toEqual([{ index: 0, kind: 'state-slice', status: 'applied' }])
    expect(v.fromIndex).toBe(0)
    expect(v.truncated).toBe(false)
    // the applied op IS visible by default — position accessors AND window agree
    expect(v.undoTopKind).toBe('state-slice')
  })
  it('§3.1 companion — a TRULY EMPTY journal (no applied op yet) still returns `entries: []` by default (stays correct)', () => {
    const { sup } = mkSup()
    const v = sup.journalEntries() // no afterIndex → default window, still empty
    expect(v.entries).toEqual([])
    expect(v.totalEntries).toBe(0)
    expect(v.fromIndex).toBe(0)
    expect(v.truncated).toBe(false)
  })

  it('§3.2 `afterIndex: 0` reveals the applied op\'s row (absolute start) + totalEntries >= 1', () => {
    const h = mkSup()
    editNode(h, 'A1')
    const v = h.sup.journalEntries({ afterIndex: 0 })
    expect(v.entries.length).toBeGreaterThanOrEqual(1)
    expect(v.entries[0]).toEqual({ index: 0, kind: 'state-slice', status: 'applied' })
    expect(v.totalEntries).toBeGreaterThanOrEqual(1)
    expect(v.fromIndex).toBe(0)
  })

  it('§3.3 afterIndex is an ABSOLUTE start override clamped to [0, total] — fromIndex reflects the clamp', () => {
    const h = mkSup()
    for (let i = 0; i < 5; i++) editNode(h, 'v' + i)
    const total = h.sup.journalEntries().totalEntries
    // in-range absolute start
    expect(h.sup.journalEntries({ afterIndex: 2 }).fromIndex).toBe(2)
    // huge afterIndex → clamped to total (empty window, not a throw)
    const huge = h.sup.journalEntries({ afterIndex: 9999 })
    expect(huge.fromIndex).toBe(Math.min(9999, total))
    expect(huge.entries).toEqual([])
    // negative afterIndex → clamped to 0
    expect(h.sup.journalEntries({ afterIndex: -3 }).fromIndex).toBe(0)
  })

  it('§3.3 limit is clamped [1, 1000] and shapes entries.length / truncated', () => {
    const h = mkSup()
    for (let i = 0; i < 20; i++) editNode(h, 'v' + i)
    // a small explicit limit truncates + flags truncated, total is unchanged
    const small = h.sup.journalEntries({ afterIndex: 0, limit: 3 })
    expect(small.entries.length).toBe(3)
    expect(small.totalEntries).toBe(20)
    expect(small.truncated).toBe(true)
    // a limit above the journal never truncates
    const big = h.sup.journalEntries({ afterIndex: 0, limit: 5000 })
    expect(big.entries.length).toBe(20) // clamped to MAX=1000, no truncation
    expect(big.truncated).toBe(false)
    // an omitted limit defaults to 500 (engine DEFAULT_LIMIT)
    expect(h.sup.journalEntries({ afterIndex: 0 }).entries.length).toBe(20)
  })

  it('§3.3 fromIndex/entries.length/totalEntries are mutually consistent for every window', () => {
    const h = mkSup()
    for (let i = 0; i < 8; i++) editNode(h, 'v' + i)
    for (const opts of [
      undefined,
      { afterIndex: 0 },
      { afterIndex: 3, limit: 2 },
      { afterIndex: -1, limit: 100 },
      { limit: 5 },
    ] as (ViewOpts | undefined)[]) {
      const v = h.sup.journalEntries(opts)
      expect(v.fromIndex).toBeGreaterThanOrEqual(0)
      expect(v.fromIndex).toBeLessThanOrEqual(v.totalEntries)
      expect(v.entries.length).toBeLessThanOrEqual(v.fromIndex + (opts?.limit ?? DEFAULT_LIMIT))
      expect(v.entries.every((e) => e.index >= v.fromIndex)).toBe(true)
    }
  })

  it('§3.4 a large journal → truncated: true + totalEntries > entries.length (default 500 window)', () => {
    const h = mkSup()
    for (let i = 0; i < 601; i++) editNode(h, 'x' + i)
    const v = h.sup.journalEntries() // default window (limit 500)
    expect(v.totalEntries).toBe(601)
    expect(v.truncated).toBe(true)
    expect(v.totalEntries).toBeGreaterThan(v.entries.length)
  })

  it('§3.5 a condensed base present → basePresent: true + a `base` entry appears in the window that includes it', async () => {
    const h = mkSup({ max: 5 })
    // trigger the deferred condense (engine D5 microtask) — needs a tick past it
    for (let i = 0; i < 6; i++) editNode(h, 'y' + i)
    await new Promise((r) => setTimeout(r, 20))
    const v = h.sup.journalEntries({ afterIndex: 0, limit: 1000 })
    expect(v.basePresent).toBe(true)
    expect(v.entries.some((e) => e.kind === 'base')).toBe(true)
    expect(v.entries[0]).toMatchObject({ index: 0, kind: 'base' })
  })

  it('§3.6 read-only — repeated calls leave undoDepth/redoDepth/basePresent and the whole journal IDENTICAL', () => {
    const h = mkSup()
    for (let i = 0; i < 3; i++) editNode(h, 'v' + i)
    const before = h.sup.journalEntries({ afterIndex: 0, limit: 1000 })
    for (let i = 0; i < 5; i++) h.sup.journalEntries()
    const after = h.sup.journalEntries({ afterIndex: 0, limit: 1000 })
    expect(after.undoDepth).toBe(before.undoDepth)
    expect(after.redoDepth).toBe(before.redoDepth)
    expect(after.basePresent).toBe(before.basePresent)
    expect(after.totalEntries).toBe(before.totalEntries)
    expect(after.entries).toEqual(before.entries)
    expect(after.undoTopKind).toBe(before.undoTopKind)
  })

  // -------------------------------------------------------------------------
  // §3.6 DYNAMIC (AF-4 adversarial finding, MED) — the P-IM-3 / P-TP-1 "no
  // app-graph-changed fires" and "renderer dispatch routes to
  // runtime.journalEntries(req.payload)" claims are proven ONLY STATICALLY by
  // source-regex scans (over MUTATING_METHODS and the `case 'journalEntries'`).
  // This closes that gap with a DYNAMIC behavior assertion: a real renderer
  // Runtime + a bridge whose notify hook records `app-graph-changed` emissions,
  // a `dispatch` RPC (positive control → ONE emit) and a `journalEntries` RPC
  // (→ ZERO emits AND the real engine JournalView entries).
  //
  // The renderer's `handleRequest` is module-private (renderer.ts exports
  // nothing), so this drives the renderer's dispatch+notify seam over the REAL
  // Runtime, with the notify set DERIVED from the ACTUAL `MUTATING_METHODS`
  // literal in src/renderer/renderer.ts (never hard-coded) — so if
  // `journalEntries` ever joins the literal, this test fails alongside SEAM-5,
  // not because of a stale copy. SEAM-5 statically pins that the renderer
  // source actually contains `case 'journalEntries'` →
  // `runtime.journalEntries(req.payload)` and `'journalEntries'` ∉ the literal.
  it('§3.6 DYNAMIC — a `journalEntries` RPC routes to runtime.journalEntries and emits NO `app-graph-changed` (dispatch positive control emits ONE)', async () => {
    // the notify set — parsed live from the REAL renderer source, never hard-coded
    const rendererSrc = readFileSync(fileURLToPath(new URL('../src/renderer/renderer.ts', import.meta.url)), 'utf8')
    const mmMatch = /const MUTATING_METHODS = new Set\(\[([^\]]*)\]\)/.exec(rendererSrc)
    expect(mmMatch, 'renderer MUTATING_METHODS literal must exist').toBeTruthy()
    const mutating = new Set<string>(
      mmMatch![1].split(',').map((s) => s.trim().replace(/^'+|'+$/g, '')).filter(Boolean),
    )
    expect(mutating.has('dispatch'), 'the dispatch positive control depends on `dispatch` being mutating').toBe(true)
    expect(mutating.has('journalEntries'), 'journalEntries must NOT be mutating (read-only → no app-graph-changed)').toBe(false)

    // a real renderer Runtime over the demo envelope (the SEAM-6 harness) carrying the journal
    installShim()
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    // seed exactly ONE applied state-slice edit → engine journal row {index:0, kind:'state-slice', status:'applied'}
    const seeded = runtime.applyCommand({ kind: 'state-slice', node: 'counter', mutation: [{ targetProp: 'content', mode: 'replace', value: 'A1' }] })
    expect(seeded.status, 'the seeded engine edit must apply (SEAM-6 journal path)').toBe('applied')

    // a notify-observing bridge — records every app-graph-changed emission
    const notifies: string[] = []
    const notify = (p: { uri: string }): void => { notifies.push(p.uri) }

    // the renderer dispatch+notify seam, mirrored verbatim over the REAL Runtime
    // (renderer.ts handleRequest: route → reply, then notify() on ok && mutating)
    const handleRequest = async (method: string, payload?: unknown): Promise<{ ok: boolean; value?: unknown; error?: string }> => {
      let value: unknown
      try {
        switch (method) {
          case 'dispatch':
            value = await runtime.dispatch(payload as never)
            break
          case 'journalEntries':
            value = runtime.journalEntries(payload)
            break
          default:
            throw new Error(`unknown method: ${method}`)
        }
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) }
      }
      // N3/N6 — after a MUTATING app-graph op succeeds, emit ONE app-graph-changed
      const reply = { ok: true, value }
      if (reply.ok && mutating.has(method)) notify({ uri: 'mcp://provident/app' })
      return reply
    }

    // (b) positive control — a `dispatch` RPC succeeds and emits EXACTLY ONE app-graph-changed
    const d = await handleRequest('dispatch', { target: 'inc', event: 'click' })
    expect(d.ok, 'the dispatch RPC must route + succeed').toBe(true)
    expect(notifies, 'a mutating dispatch must emit exactly ONE app-graph-changed').toEqual(['mcp://provident/app'])

    // (c) a `journalEntries` RPC emits ZERO app-graph-changed AND routes to runtime.journalEntries
    const before = notifies.length
    const j = await handleRequest('journalEntries', { afterIndex: 0, limit: 10 })
    expect(j.ok, 'the journalEntries RPC must route + reply ok (SEAM-5 routing)').toBe(true)
    expect(notifies.length, 'journalEntries must emit NO app-graph-changed (P-IM-3 / P-TP-1)').toBe(before)
    const view = (j.value as { entries: Array<{ index: number; kind: string; status: string }> })
    expect(view.entries[0]).toEqual({ index: 0, kind: 'state-slice', status: 'applied' })
  })
})

// ===========================================================================
// §4 fail-states F1–F6 (engine-backed; GREEN-on-arrival). The F4 host half
// (a synchronous renderer `case`) is a missing seam, covered in §2.2 below.
// ===========================================================================
describe('U-JR1 §4 fail-states (engine-backed)', () => {
  it('F1 empty journal never throws and yields the §3.1 empty shape', () => {
    const { sup } = mkSup()
    expect(() => sup.journalEntries()).not.toThrow()
    const v = sup.journalEntries()
    expect(v.entries).toEqual([])
    expect(v.undoDepth).toBe(0)
    expect(v.redoDepth).toBe(0)
    expect(v.basePresent).toBe(false)
  })

  it('F2 malformed/negative/huge opts clamp-or-ignore, never throw, never drain/mutate', () => {
    const h = mkSup()
    for (let i = 0; i < 3; i++) editNode(h, 'v' + i)
    const depthBefore = h.sup.journalEntries().undoDepth
    // negative + huge NUMERIC clamps (spec F2: afterIndex→[0,total], limit→[1,1000])
    const neg = h.sup.journalEntries({ afterIndex: -4, limit: -3 })
    expect(() => neg).not.toThrow()
    expect(h.sup.journalEntries({ afterIndex: -4 }).fromIndex).toBe(0)
    expect(h.sup.journalEntries({ limit: -3 }).entries.length).toBeLessThanOrEqual(1) // clamped to 1
    // non-numeric malformed args are IGNORED (never throw)
    expect(() => h.sup.journalEntries({ afterIndex: 'x' as never, limit: 'y' as never })).not.toThrow()
    expect(() => h.sup.journalEntries({ afterIndex: {} as never })).not.toThrow()
    expect(() => h.sup.journalEntries({ limit: [] as never })).not.toThrow()
    // no mutation / no drain
    expect(h.sup.journalEntries().undoDepth).toBe(depthBefore)
  })

  it('F3 a `base` condense marker is surfaced as {kind:\'base\'} + basePresent: true when the window includes it', async () => {
    const h = mkSup({ max: 5 })
    for (let i = 0; i < 6; i++) editNode(h, 'y' + i)
    await new Promise((r) => setTimeout(r, 20))
    const v = h.sup.journalEntries({ afterIndex: 0, limit: 1000 })
    expect(v.basePresent).toBe(true)
    const baseRows = v.entries.filter((e) => e.kind === 'base')
    expect(baseRows.length).toBeGreaterThanOrEqual(1)
    expect(v.undoBaseBoundary).toBe(true) // at the floor after condense
  })

  it('F4 a journal read is a SYNCHRONOUS snapshot at call time (engine returns a plain JournalView, never a Promise)', () => {
    const h = mkSup()
    for (let i = 0; i < 3; i++) editNode(h, 'v' + i)
    const r = h.sup.journalEntries()
    expect(r).not.toBeInstanceOf(Promise)
    // consecutive calls at the same state are snapshots of that state (consistent)
    expect(JSON.stringify(r)).toBe(JSON.stringify(h.sup.journalEntries()))
  })

  it('F5 JSON-safety — the projection carries no Node refs / snapshot / internal entry id', () => {
    const h = mkSup()
    editNode(h, 'A1')
    const v = h.sup.journalEntries({ afterIndex: 0, limit: 1000 })
    // JSON round-trips without throwing (no live Node ref / cycle)
    const roundTripped = JSON.parse(JSON.stringify(v))
    expect(roundTripped).toEqual(v)
    // every row is exactly { index, kind, status }
    for (const e of v.entries) {
      expect(Object.keys(e).sort()).toEqual(['index', 'kind', 'status'])
    }
    // no internal id / node ref / snapshot key anywhere in the view
    const blob = JSON.stringify(v)
    expect(blob).not.toMatch(/"snapshot"/)
    expect(blob).not.toMatch(/"dirtied"/)
  })

  it('F6 unknown/extra tool args are ignored, never throw', () => {
    const h = mkSup()
    for (let i = 0; i < 3; i++) editNode(h, 'v' + i)
    const base = JSON.stringify(h.sup.journalEntries({ afterIndex: 0, limit: 1000 }))
    expect(() =>
      h.sup.journalEntries({ afterIndex: 0, limit: 1000, bogus: 123, extra: { node: 'ref' } } as never),
    ).not.toThrow()
    // extras are ignored — the projection is identical to the same real window
    const withExtra = h.sup.journalEntries({ afterIndex: 0, limit: 1000, bogus: 123 } as never)
    expect(JSON.stringify(withExtra)).toBe(base)
  })
})

// ===========================================================================
// §2.2 the six pinned seams + §2.3/§3.7 the `read`-group gate — RED (do not
// exist in src/ yet). Each failure names the missing seam explicitly.
// ===========================================================================
describe('U-JR1 §2.2 the six host seams (RED — do not exist yet)', () => {
  // --- Seam 1: security.ts `TOOL_GROUPS` gains `'provident.get_journal': 'read'` ---
  it('SEAM-1 security.ts `TOOL_GROUPS` resolves `provident.get_journal` → the `read` group', () => {
    expect(groupForTool('provident.get_journal'), 'SEAM-1 missing: TOOL_GROUPS has no provident.get_journal row → groupForTool resolves to null').toBe('read')
  })
  it('SEAM-1 (group gate §3.7) the tool is available when `read` IS enabled, unavailable when `read` is disabled', () => {
    // read enabled → allowed (requires the TOOL_GROUPS row to exist)
    expect(toolAllowed('provident.get_journal', ['read']), 'SEAM-1 missing: with the read group enabled the tool must resolve+be allowed').toBe(true)
    // read disabled → unavailable (this half is trivially true today only because
    // the row is absent; it must STAY false once the row lands)
    expect(toolAllowed('provident.get_journal', ['dispatch'])).toBe(false)
    const gate = new SecurityGate().apply({ groups: ['read'] })
    expect(gate.toolAllowed('provident.get_journal'), 'SEAM-1 missing: SecurityGate admits provident.get_journal once the read row lands').toBe(true)
  })
  it('SEAM-1 (gate §2.3) `read` is default-ON in defaultSecurityConfig()', () => {
    expect(defaultSecurityConfig().enabled).toContain('read')
  })

  // --- Seam 4: shared/types.ts `RpcMethod` gains `'journalEntries'` (near 'journal') ---
  it('SEAM-4 shared/types.ts `RpcMethod` union includes `journalEntries`', () => {
    const typesSrc = readFileSync(fileURLToPath(new URL('../src/shared/types.ts', import.meta.url)), 'utf8')
    expect(typesSrc, 'SEAM-4 missing: RpcMethod has no `journalEntries` member').toMatch(/\| 'journalEntries'/)
  })

  // --- Seam 5: renderer.ts `case 'journalEntries'` + `'journalEntries'` ∉ MUTATING_METHODS ---
  it('SEAM-5 renderer.ts dispatches `case \'journalEntries\'` to runtime.journalEntries(req.payload)', () => {
    const rendererSrc = readFileSync(fileURLToPath(new URL('../src/renderer/renderer.ts', import.meta.url)), 'utf8')
    expect(rendererSrc, 'SEAM-5 missing: renderer.ts has no `case \'journalEntries\'`').toMatch(/case\s+'journalEntries'/)
    expect(rendererSrc, 'SEAM-5 missing: renderer.ts case must route to runtime.journalEntries(req.payload)').toMatch(/runtime\.journalEntries\(req\.payload\)/)
  })
  it('SEAM-5 `journalEntries` is NOT in MUTATING_METHODS (read-only → no app-graph-changed)', () => {
    const rendererSrc = readFileSync(fileURLToPath(new URL('../src/renderer/renderer.ts', import.meta.url)), 'utf8')
    const mmMatch = rendererSrc.match(/MUTATING_METHODS\s*=\s*new Set\(\[([^\]]*)\]\)/)
    expect(mmMatch, 'SEAM-5 missing: could not inspect MUTATING_METHODS literal').toBeTruthy()
    expect(mmMatch![1], 'SEAM-5 violation: `journalEntries` must NOT be added to MUTATING_METHODS').not.toMatch(/'journalEntries'/)
  })

  // --- Seam 6: runtime.ts synchronous `journalEntries(opts?)` ---
  it('SEAM-6 runtime.ts exposes a synchronous `journalEntries` method on the Runtime class', () => {
    const proto = Runtime.prototype as unknown as { journalEntries?: (opts?: ViewOpts) => unknown }
    expect(typeof proto.journalEntries, 'SEAM-6 missing: Runtime.prototype.journalEntries does not exist (needs the runtime seam)').toBe('function')
  })
  it('SEAM-6 runtime.journalEntries returns this.supervisor.journalEntries(opts) — synchronous JournalView reflecting the live journal', async () => {
    const proto = Runtime.prototype as unknown as { journalEntries?: (opts?: ViewOpts) => unknown }
    if (typeof proto.journalEntries !== 'function') {
      throw new Error('SEAM-6 missing: Runtime.prototype.journalEntries does not exist (need the runtime seam)')
    }
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    const v = (runtime as unknown as { journalEntries: (opts?: ViewOpts) => JournalView }).journalEntries()
    expect(v).not.toBeInstanceOf(Promise) // synchronous — never awaits
    expect(Array.isArray(v.entries)).toBe(true)
    expect(typeof v.undoDepth).toBe('number')
    expect(typeof v.redoDepth).toBe('number')
    expect(typeof v.basePresent).toBe('boolean')
  })

  // --- Seam 2: mcp-server.ts `ALL_TOOLS` gains `'provident.get_journal'` ---
  it('SEAM-2 mcp-server.ts `ALL_TOOLS` includes `provident.get_journal`', () => {
    expect(ProvidentMcpServer.ALL_TOOLS, 'SEAM-2 missing: ALL_TOOLS has no provident.get_journal row').toContain('provident.get_journal')
  })

  // --- Seam 3: mcp-server.ts SDK registration (mirrors get_node_state) ---
  it('SEAM-3 a server with the `read` group enabled registers the `provident.get_journal` tool', () => {
    const gate = new SecurityGate().apply({ groups: ['read', 'dispatch'] })
    const server = new ProvidentMcpServer({ backend: { invoke: async () => ({}) } as never, transport: 'stdio', gate })
    server.ensureServerRegistered()
    expect(server.registeredEnabled('provident.get_journal'), 'SEAM-3 missing: provident.get_journal is not registered/enabled under the read group').toBe(true)
  })
  it('SEAM-3 the SDK registration invokes `backend.invoke(\'journalEntries\', args)` with the pinned inputSchema ({ afterIndex, limit } optionals)', () => {
    const mcpSrc = readFileSync(fileURLToPath(new URL('../src/main/mcp-server.ts', import.meta.url)), 'utf8')
    expect(mcpSrc, 'SEAM-3 missing: mcp-server.ts never invokes journalEntries').toMatch(/backend\.invoke\('journalEntries',\s*args\)/)
    expect(mcpSrc, 'SEAM-3 missing: the registration must define afterIndex/limit optionals').toMatch(/afterIndex:\s*z\.number\(\)\.optional\(\),\s*limit:\s*z\.number\(\)\.optional\(\)/)
  })
})

// ===========================================================================
// §5.7 — the PBT register (5 rows: P-IM×3, P-SM×1, P-TP×1 = 5 ≤ 8 ✔).
// Deterministic mulberry32 seed, ≤PBT_ATTEMPTS/row, ≤400 total, stop-after-5.
// ===========================================================================
const PBT_SEED = 0x4a4a4a00
const PBT_ATTEMPTS = 40 // 5 rows × 40 = 200 ≤ 400 total
const PBT_STOP_AFTER = 5

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}
function runProperty(
  rowId: string,
  strategyId: string,
  check: (i: number, rng: () => number) => string | null,
): { row: string; strategyId: string; held: boolean; counterexamples: string[]; attempts: number } {
  const rng = mulberry32(PBT_SEED)
  const counterexamples: string[] = []
  for (let i = 0; i < PBT_ATTEMPTS; i++) {
    const ce = check(i, rng)
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= PBT_STOP_AFTER) break
    }
  }
  return { row: rowId, strategyId, held: counterexamples.length === 0, counterexamples, attempts: PBT_ATTEMPTS }
}

/** A pool of REAL Supervisors in representative journal states, built once so
 *  the (async) condense base state needs no per-iteration await. Sampled
 *  deterministically by the seeded RNG every iteration. */
interface StatePool {
  states: Array<{ key: string; sup: Supervisor }>
}
function poolOf(): StatePool {
  // empty
  const empty = mkSup()
  // applied (undoDepth 1, empty redo)
  const applied = mkSup(); editNode(applied, 'A1')
  // multi-applied
  const multi = mkSup(); for (let i = 0; i < 5; i++) editNode(multi, 'm' + i)
  // applied then one undo → non-empty redo stack
  const undone = mkSup(); for (let i = 0; i < 3; i++) editNode(undone, 'u' + i); undone.sup.undo()
  // applied → undo → redo → redo-tail redo stack
  const redone = mkSup(); for (let i = 0; i < 4; i++) editNode(redone, 'r' + i); redone.sup.undo(); redone.sup.redo()
  return {
    states: [
      { key: 'empty', sup: empty.sup },
      { key: 'applied', sup: applied.sup },
      { key: 'multi', sup: multi.sup },
      { key: 'undone', sup: undone.sup },
      { key: 'redone', sup: redone.sup },
    ],
  }
}

function viewDeepEqual(a: JournalView, b: JournalView): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

describe('U-JR1 §5.7 the PBT register (deterministic mulberry32)', () => {
  // A pre-built condensed supervisor (base marker) — built once (async condense).
  let condensedSup: SupHarness | null = null
  // A pre-built LARGE journal (≈1300 applied edits) — built once so the P-IM-2
  // default-window head-trim branch is exercised WITHOUT rebuilding ~1300 edits
  // per (read-only) iteration. At this size the default limit-500 window
  // head-trims (fromIndex ≈ 799 > 0, truncated true) even at limit clamped to
  // 1000.
  let largeSup: SupHarness | null = null

  beforeAll(async () => {
    const h = mkSup({ max: 5 })
    for (let i = 0; i < 6; i++) editNode(h, 'y' + i)
    await new Promise((r) => setTimeout(r, 20))
    condensedSup = h
    const big = mkSup()
    for (let i = 0; i < 1300; i++) editNode(big, 'big' + i)
    largeSup = big
  })

  it('P-IM-1 [strat:journal-pure-projection] two immediate calls are deep-equal JournalViews', () => {
    const rep = runProperty('P-IM-1', 'strat:journal-pure-projection', (_i, rng) => {
      const pool = poolOf()
      const st = pick(rng, pool.states).sup
      // a generated window (afterIndex/limit) too — determinism must extend to the window
      const useWindow = pick(rng, [true, false])
      const opts: ViewOpts | undefined = useWindow
        ? { afterIndex: pick(rng, [undefined, 0, 1, -5, 999]), limit: pick(rng, [undefined, 1, 7, 5000]) }
        : undefined
      const a = st.journalEntries(opts)
      const b = st.journalEntries(opts)
      if (!viewDeepEqual(a, b)) {
        return `first=${JSON.stringify(a)} second=${JSON.stringify(b)} (window ${JSON.stringify(opts)})`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
    void rep
  })

  it('P-IM-2 [strat:journal-window] window invariants — engine-faithful recent-tail backspan (§5.2/§5.3)', () => {
    const rep = runProperty('P-IM-2', 'strat:journal-window', (_i, rng) => {
      const pool = poolOf()
      // sample a small/medium pooled state OR the pre-built large journal
      const useLarge = pick(rng, [true, false])
      const st = useLarge && largeSup ? largeSup.sup : pick(rng, pool.states).sup
      const total = st.journalEntries().totalEntries
      const setAfter = pick(rng, [true, false])
      // branch A (afterIndex set): pick a NUMERIC afterIndex for the absolute-clamp check
      // branch B (omitted): default RECENT-TAIL window — recomputed from the engine formula
      const afterIndex = setAfter ? pick(rng, [-3, 0, 2, total + 7, 9999]) : undefined
      const limit = pick(rng, [undefined, -2, 0, 1, 3, 500, 5000])
      const opts: ViewOpts | undefined = setAfter ? { afterIndex, limit } : { limit }
      const v = st.journalEntries(opts)
      const effectiveLimit = clampLimit(limit)
      // ∀ window: 0 ≤ fromIndex ≤ totalEntries
      if (!(v.fromIndex >= 0 && v.fromIndex <= v.totalEntries)) return `fromIndex ${v.fromIndex} outside [0,total=${v.totalEntries}] (window ${JSON.stringify(opts)})`
      // ∀ window: entries.length ≤ effective limit (≤1000, default ≤500)
      if (v.entries.length > effectiveLimit) return `entries.length ${v.entries.length} > effective limit ${effectiveLimit} (window ${JSON.stringify(opts)})`
      if (setAfter) {
        // afterIndex set → fromIndex === clamp(afterIndex, 0, total)
        if (v.fromIndex !== clampAfter(afterIndex as number, total)) return `set afterIndex=${afterIndex} gave fromIndex ${v.fromIndex} (expected ${clampAfter(afterIndex as number, total)})`
      } else {
        // afterIndex omitted → default RECENT-TAIL backspan from cursor+REDO_PEEK
        // (engine-faithful §5.2, supervisor.js:199–238). Recompute fromIndex
        // exactly and assert it.
        const cursor = (v.basePresent ? 1 : 0) + v.undoDepth
        const toIndex = Math.min(total, cursor + REDO_PEEK)
        const fromExpected = Math.max(0, toIndex - effectiveLimit)
        if (v.fromIndex !== fromExpected) return `default window fromIndex=${v.fromIndex} != engine ${fromExpected} (total=${total}, cursor=${cursor}, limit=${effectiveLimit}, REDO_PEEK=${REDO_PEEK})`
        // every returned row lies within [fromIndex, total)
        if (v.entries.some((e) => e.index < v.fromIndex || e.index >= v.totalEntries)) return `row index outside the engine window (${JSON.stringify(v.entries.slice(0, 3))})`
        if (fromExpected === 0 && total > 0) {
          // small/typical journal → whole recent tail visible: fromIndex 0, the
          // applied op / tail is NOT masked (entries !== []), not truncated
          if (v.entries.length === 0) return `default window on total=${total} returned [] but the applied op's recent tail must be visible (engine §5.2 — NOT [])`
          if (v.truncated !== false) return `small/typical journal truncated=${v.truncated} but the whole tail fits (fromIndex 0) — expected false`
        } else if (fromExpected > 0) {
          // large journal head-trims the default window
          if (v.truncated !== true) return `head-trimmed default window (fromIndex ${v.fromIndex}, fromExpected ${fromExpected}) must be truncated=true`
        } else if (total === 0) {
          // companion: a truly empty journal keeps entries:[] in the default window
          if (v.entries.length !== 0) return `default window on an EMPTY journal returned ${v.entries.length} rows (expected [])`
        }
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
    void rep
  }, 15000)

  it('P-IM-3 [strat:journal-readonly] reading NEVER mutates — journal + position accessors identical before/after (engine projection)', () => {
    const rep = runProperty('P-IM-3', 'strat:journal-readonly', (_i, rng) => {
      const pool = poolOf()
      const st = pick(rng, pool.states).sup
      const pre = st.journalEntries({ afterIndex: 0, limit: 1000 })
      for (let k = 0; k < 3; k++) st.journalEntries() // several reads
      const post = st.journalEntries({ afterIndex: 0, limit: 1000 })
      if (post.undoDepth !== pre.undoDepth || post.redoDepth !== pre.redoDepth || post.basePresent !== pre.basePresent) {
        return `undo/redo/base changed across reads: ${JSON.stringify(pre)} → ${JSON.stringify(post)}`
      }
      if (post.totalEntries !== pre.totalEntries) return `totalEntries changed across reads (${pre.totalEntries} → ${post.totalEntries})`
      if (!viewDeepEqual(post, pre)) return `journal view changed across reads`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
    void rep
  })

  it('P-SM-1 [strat:journal-faithful] accessors mirror the stacks; basePresent ⟺ a base-kind entry; undoBaseBoundary ⟹ empty at the condensed base', () => {
    // Hand-rolled deterministic loop (same mulberry32 seed + budget as
    // runProperty; stop-after-5). Fresh states per iteration + the pre-built
    // condensed supervisor sampled in, so the base-marker invariants are real.
    const rng = mulberry32(PBT_SEED)
    const ces: string[] = []
    const pool = poolOf()
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const useCondensed = pick(rng, [true, false])
      const st = useCondensed && condensedSup ? { key: 'condensed', sup: condensedSup.sup } : pick(rng, pool.states)
      const v = st.sup.journalEntries({ afterIndex: 0, limit: 1000 })
      const hasUndoTop = 'undoTopKind' in v
      const hasRedoTop = 'redoTopKind' in v
      if (hasUndoTop !== (v.undoDepth > 0)) {
        ces.push(`${st.key}: undoTopKind ${hasUndoTop ? 'present' : 'absent'} but undoDepth=${v.undoDepth}`)
        continue
      }
      if (hasRedoTop !== (v.redoDepth > 0)) {
        ces.push(`${st.key}: redoTopKind ${hasRedoTop ? 'present' : 'absent'} but redoDepth=${v.redoDepth}`)
        continue
      }
      // basePresent ⟺ a base-kind entry exists in the journal (the window covers index 0)
      const hasBaseKind = v.entries.some((e) => e.kind === 'base')
      if (v.basePresent !== hasBaseKind) {
        ces.push(`${st.key}: basePresent=${v.basePresent} but base-kind rows=${hasBaseKind}`)
        continue
      }
      // undoBaseBoundary ⟹ the undo stack empties AT the condensed base
      if (v.undoBaseBoundary === true && !(v.undoDepth === 0 && v.basePresent)) {
        ces.push(`${st.key}: undoBaseBoundary=true but (undoDepth=${v.undoDepth}, basePresent=${v.basePresent}) — must be the empty-at-base floor`)
      }
    }
    const held = ces.length === 0
    expect(held, `P-SM-1 strat:journal-faithful ${JSON.stringify(ces)}`).toBe(true)
  })

  it('P-TP-1 [strat:journal-seam-total] renderer dispatch routes + `journalEntries` ∉ MUTATING_METHODS + groupForTool === \'read\' + handler invokes journalEntries (RED — seams missing)', () => {
    // A deterministic seam-total traversal (single pass, seeded discipline).
    const ces: string[] = []
    // host seam 5 — renderer case route + runtime method
    const rendererSrc = readFileSync(fileURLToPath(new URL('../src/renderer/renderer.ts', import.meta.url)), 'utf8')
    if (!/case\s+'journalEntries'/.test(rendererSrc)) ces.push('renderer `case \'journalEntries\'` missing (SEAM-5)')
    if (!/runtime\.journalEntries\(req\.payload\)/.test(rendererSrc)) ces.push('renderer case does not route to runtime.journalEntries(req.payload) (SEAM-5)')
    // host seam 5 — not in MUTATING_METHODS
    const mm = rendererSrc.match(/MUTATING_METHODS\s*=\s*new Set\(\[([^\]]*)\]\)/)
    if (mm && /'journalEntries'/.test(mm[1])) ces.push("'journalEntries' was added to MUTATING_METHODS (must NOT be)")
    if (!mm) ces.push('MUTATING_METHODS literal not found (SEAM-5)')
    // host seam 1 — groupForTool('provident.get_journal') === 'read'
    if (groupForTool('provident.get_journal') !== 'read') ces.push(`groupForTool('provident.get_journal') = ${String(groupForTool('provident.get_journal'))} (SEAM-1, expected 'read')`)
    // host seam 3 — mcp handler invokes journalEntries
    const mcpSrc = readFileSync(fileURLToPath(new URL('../src/main/mcp-server.ts', import.meta.url)), 'utf8')
    if (!/backend\.invoke\('journalEntries',\s*args\)/.test(mcpSrc)) ces.push('MCP handler does not invoke backend.invoke(\'journalEntries\', args) (SEAM-3)')
    expect(ces, ces.join(' | ')).toEqual([])
  })

  it('HOST-BATTERY — the headless battery host serves journalEntries (gate-6 live finding: it advertised the tool but returned "unknown method")', async () => {
    // Regression for the live-scenario finding: the RuntimeBackend.invoke switch
    // (src/main/battery-host.ts) had no `case 'journalEntries'`, so the battery
    // host listed `provident.get_journal` in tools/list but a call threw
    // `unknown method: journalEntries`. The battery host must serve the same read.
    const host = new RuntimeBackend()
    const view = await host.invoke('journalEntries', { afterIndex: 0, limit: 10 })
    // A root-only battery runtime has an empty journal (no edits applied): the
    // read must resolve to a well-formed JournalView, never throw "unknown method".
    expect(view).toBeTruthy()
    expect(typeof view).toBe('object')
    const jv = view as { entries: unknown[]; fromIndex: number; undoDepth: number; redoDepth: number }
    expect(Array.isArray(jv.entries)).toBe(true)
    expect(typeof jv.fromIndex).toBe('number')
    expect(typeof jv.undoDepth).toBe('number')
    expect(typeof jv.redoDepth).toBe('number')
  })
})
